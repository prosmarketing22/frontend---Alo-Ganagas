import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

const ATTENDANCE_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'NORMAL', label: 'Presente', color: 'green' },
  { value: 'TARDANZA', label: 'Tardanza', color: 'yellow' },
  { value: 'FALTA', label: 'Ausente', color: 'red' }
];

export const AttendanceHistory = ({ collaborators, attendances, onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    user_id: '',
    date_from: '',
    date_to: '',
    attendance_type: ''
  });

  const debouncedDateFrom = useDebounce(filters.date_from, 300);
  const debouncedDateTo = useDebounce(filters.date_to, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFilterChange({
      ...filters,
      date_from: debouncedDateFrom,
      date_to: debouncedDateTo
    });
  }, [filters.user_id, filters.attendance_type, debouncedDateFrom, debouncedDateTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    const resetFilters = {
      user_id: '',
      date_from: '',
      date_to: '',
      attendance_type: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getAttendanceBadge = (type) => {
    const badge = ATTENDANCE_TYPES.find(t => t.value === type) || { label: type, color: 'gray' };
    return (
      <span className={`badge badge--${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="attendance-history">
      <div className="filters-section">
        <h3 className="section-title">Filtros de Busqueda</h3>
        <div className="filter-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Colaborador</label>
              <select
                name="user_id"
                value={filters.user_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Todos los colaboradores</option>
                {collaborators && collaborators.map((collaborator) => (
                  <option key={collaborator.id} value={collaborator.id}>
                    {collaborator.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Desde</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Hasta</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Asistencia</label>
              <select
                name="attendance_type"
                value={filters.attendance_type}
                onChange={handleChange}
                className="form-input"
              >
                {ATTENDANCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button
              onClick={handleReset}
              className="form-btn form-btn--secondary"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="results-section">
        <h3 className="section-title">Historial de Asistencias</h3>
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner"></div>
            <p>Cargando historial...</p>
          </div>
        ) : !attendances || attendances.length === 0 ? (
          <div className="table-empty">
            <p>No se encontraron registros de asistencia</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Colaborador</th>
                  <th>Tipo</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td>{formatDate(attendance.attendance_date || attendance.check_in_time)}</td>
                    <td className="table-cell-bold">
                      {attendance.full_name || attendance.user?.full_name || 'N/A'}
                    </td>
                    <td>{getAttendanceBadge(attendance.attendance_type)}</td>
                    <td>{attendance.check_in_time ? formatTime(attendance.check_in_time) : '-'}</td>
                    <td>
                      {attendance.check_out_time
                        ? formatTime(attendance.check_out_time)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
