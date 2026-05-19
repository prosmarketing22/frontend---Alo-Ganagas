import { useState, useEffect } from 'react';
import { useAttendanceApi } from '../../hooks/useApi/useAttendanceApi';
import { ATTENDANCE_TYPES, ROLE_COLORS } from '../../utils/constants';
import '../../styles/components/attendances.css';

export const AttendanceTodayCards = () => {
  const { getCollaboratorsToday, mark, markAllPresent, closeDay, reopenDay, getDayStatus, loading } = useAttendanceApi();

  const [collaborators, setCollaborators] = useState([]);
  const [attendanceStates, setAttendanceStates] = useState({});
  const [originalStates, setOriginalStates] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadCollaboratorsToday();
    loadDayStatus();
  }, []);

  useEffect(() => {
    const hasChanges = Object.keys(attendanceStates).some(
      key => attendanceStates[key] !== originalStates[key]
    );
    setHasUnsavedChanges(hasChanges);
  }, [attendanceStates, originalStates]);

  const loadDayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getDayStatus(today);
      setIsDayClosed(response?.is_closed || false);
    } catch (error) {
      console.error('Error loading day status:', error);
    }
  };

  const loadCollaboratorsToday = async () => {
    try {
      setLoadingData(true);
      const response = await getCollaboratorsToday();
      const data = response?.data || [];
      setCollaborators(data);

      const initialStates = {};
      data.forEach(collab => {
        initialStates[collab.id] = collab.attendance_type || null;
      });
      setAttendanceStates(initialStates);
      setOriginalStates(initialStates);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMarkAllPresent = async () => {
    try {
      setSaving(true);
      await markAllPresent();
      await loadCollaboratorsToday();
      alert('Todos los colaboradores marcados como presentes');
    } catch (error) {
      console.error('Error marking all present:', error);
      alert('Error al marcar todos como presentes');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusClick = (collaboratorId, type) => {
    if (isDayClosed) return;

    setAttendanceStates(prev => ({
      ...prev,
      [collaboratorId]: type
    }));
  };

  const handleSaveAndCloseDay = async () => {
    if (!hasUnsavedChanges && isDayClosed) {
      alert('No hay cambios pendientes y el día ya está cerrado');
      return;
    }

    const confirmMessage = hasUnsavedChanges
      ? 'Se guardarán todos los cambios pendientes y se cerrará el día. ¿Desea continuar?'
      : '¿Está seguro de cerrar el día?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setSaving(true);

      if (hasUnsavedChanges) {
        const promises = Object.entries(attendanceStates)
          .filter(([id]) => attendanceStates[id] !== originalStates[id])
          .map(([userId, attendanceType]) =>
            mark({
              user_id: parseInt(userId),
              attendance_type: attendanceType
            })
          );

        await Promise.all(promises);
      }

      const today = new Date().toISOString().split('T')[0];
      await closeDay(today);

      setIsDayClosed(true);
      setOriginalStates({ ...attendanceStates });
      setHasUnsavedChanges(false);

      alert('Día cerrado correctamente');
      await loadCollaboratorsToday();
      await loadDayStatus();
    } catch (error) {
      console.error('Error saving and closing day:', error);
      alert('Error al guardar y cerrar el día');
    } finally {
      setSaving(false);
    }
  };

  const handleReopenDay = async () => {
    if (!window.confirm('¿Está seguro de reabrir el día? Esto permitirá modificar las asistencias.')) {
      return;
    }

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      await reopenDay(today);

      setIsDayClosed(false);
      alert('Día reabierto correctamente');
      await loadDayStatus();
    } catch (error) {
      console.error('Error reopening day:', error);
      alert('Error al reabrir el día');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (roleName) => {
    const roleKey = roleName?.toUpperCase().replace(/\s+/g, '_') || '';
    return ROLE_COLORS[roleKey] || { color: '#6b7280', bg: '#f3f4f6' };
  };

  const formatDate = () => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  if (loadingData) {
    return (
      <div className="attendance-loading">
        <div className="attendance-spinner"></div>
        <p>Cargando colaboradores...</p>
      </div>
    );
  }

  return (
    <div className="attendance-today-container">
      <div className="attendance-today-header">
        <div className="attendance-today-header-text">
          <h2 className="attendance-today-title">
            Marcar Asistencia - {formatDate()}
            {isDayClosed && <span className="attendance-day-closed-badge">Día Cerrado</span>}
          </h2>
          <p className="attendance-today-subtitle">
            Registra la asistencia diaria del personal
            {hasUnsavedChanges && !isDayClosed && (
              <span className="attendance-unsaved-indicator"> - Cambios sin guardar</span>
            )}
          </p>
        </div>

        <div className="attendance-today-actions">
          {!isDayClosed ? (
            <>
              <button
                className="attendance-today-btn attendance-today-btn--success"
                onClick={handleMarkAllPresent}
                disabled={loading || saving || isDayClosed}
              >
                Marcar Todos Presentes
              </button>
              <button
                className="attendance-today-btn attendance-today-btn--primary"
                onClick={handleSaveAndCloseDay}
                disabled={loading || saving}
              >
                {hasUnsavedChanges ? 'Guardar y Cerrar Día' : 'Cerrar Día'}
              </button>
              <button
                className="attendance-today-btn attendance-today-btn--warning"
                onClick={loadCollaboratorsToday}
                disabled={loading || saving}
              >
                Actualizar
              </button>
            </>
          ) : (
            <>
              <button
                className="attendance-today-btn attendance-today-btn--danger"
                onClick={handleReopenDay}
                disabled={loading || saving}
              >
                Reabrir Día
              </button>
              <button
                className="attendance-today-btn attendance-today-btn--warning"
                onClick={loadCollaboratorsToday}
                disabled={loading || saving}
              >
                Actualizar
              </button>
            </>
          )}
        </div>
      </div>

      {collaborators.length === 0 ? (
        <div className="attendance-empty-state">
          <div className="attendance-empty-icon">👥</div>
          <p className="attendance-empty-text">No hay colaboradores registrados</p>
        </div>
      ) : (
        <div className="attendance-cards-grid">
          {collaborators.map(collaborator => {
            const roleColor = getRoleColor(collaborator.role_name);
            const currentType = attendanceStates[collaborator.id];

            return (
              <div key={collaborator.id} className="attendance-card">
                <div className="attendance-card-header">
                  <div
                    className="attendance-card-avatar"
                    style={{ backgroundColor: roleColor.color }}
                  >
                    {collaborator.initial || getInitials(collaborator.full_name)}
                  </div>
                  <div className="attendance-card-info">
                    <h3 className="attendance-card-name">{collaborator.full_name}</h3>
                    <p className="attendance-card-role">{collaborator.role_name}</p>
                  </div>
                </div>

                <div className="attendance-card-section">
                  <div className="attendance-card-section-title">
                    <span className="attendance-card-section-icon">→</span> ENTRADA
                  </div>
                  <div className="attendance-card-buttons">
                    <button
                      className={`attendance-status-btn attendance-status-btn--present ${
                        currentType === ATTENDANCE_TYPES.NORMAL.value ? 'active' : ''
                      } ${isDayClosed ? 'disabled' : ''}`}
                      onClick={() => handleStatusClick(collaborator.id, ATTENDANCE_TYPES.NORMAL.value)}
                      disabled={saving || isDayClosed}
                    >
                      {ATTENDANCE_TYPES.NORMAL.icon} {ATTENDANCE_TYPES.NORMAL.label}
                    </button>
                    <button
                      className={`attendance-status-btn attendance-status-btn--absent ${
                        currentType === ATTENDANCE_TYPES.FALTA.value ? 'active' : ''
                      } ${isDayClosed ? 'disabled' : ''}`}
                      onClick={() => handleStatusClick(collaborator.id, ATTENDANCE_TYPES.FALTA.value)}
                      disabled={saving || isDayClosed}
                    >
                      {ATTENDANCE_TYPES.FALTA.icon} {ATTENDANCE_TYPES.FALTA.label}
                    </button>
                    <button
                      className={`attendance-status-btn attendance-status-btn--late ${
                        currentType === ATTENDANCE_TYPES.TARDANZA.value ? 'active' : ''
                      } ${isDayClosed ? 'disabled' : ''}`}
                      onClick={() => handleStatusClick(collaborator.id, ATTENDANCE_TYPES.TARDANZA.value)}
                      disabled={saving || isDayClosed}
                    >
                      {ATTENDANCE_TYPES.TARDANZA.icon} {ATTENDANCE_TYPES.TARDANZA.label}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
