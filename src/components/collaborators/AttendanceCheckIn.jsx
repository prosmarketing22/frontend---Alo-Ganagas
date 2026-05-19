import { useState, useEffect } from 'react';

const ATTENDANCE_TYPES = [
  { value: 'PRESENTE', label: 'Presente', color: 'green' },
  { value: 'TARDANZA', label: 'Tardanza', color: 'yellow' },
  { value: 'AUSENTE', label: 'Ausente', color: 'red' }
];

export const AttendanceCheckIn = ({ collaborators, todayAttendances, onCheckIn, loading }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    attendance_type: 'PRESENTE'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.user_id) {
      newErrors.user_id = 'Debe seleccionar un colaborador';
    }

    if (!formData.attendance_type) {
      newErrors.attendance_type = 'Debe seleccionar un tipo de asistencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onCheckIn(formData);
      setFormData({
        user_id: '',
        attendance_type: 'PRESENTE'
      });
    }
  };

  const getAttendanceBadge = (type) => {
    const badge = ATTENDANCE_TYPES.find(t => t.value === type) || { label: type, color: 'gray' };
    return (
      <span className={`badge badge--${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="attendance-checkin">
      <div className="checkin-form-section">
        <h3 className="section-title">Marcar Asistencia</h3>
        <form onSubmit={handleSubmit} className="checkin-form">
          <div className="form-row">
            <div className="form-group form-group--flex-2">
              <label className="form-label">
                Colaborador <span className="form-required">*</span>
              </label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className={`form-input ${errors.user_id ? 'form-input--error' : ''}`}
                disabled={loading}
              >
                <option value="">Seleccione un colaborador</option>
                {collaborators && collaborators.map((collaborator) => (
                  <option key={collaborator.id} value={collaborator.id}>
                    {collaborator.full_name}
                  </option>
                ))}
              </select>
              {errors.user_id && <span className="form-error">{errors.user_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Tipo <span className="form-required">*</span>
              </label>
              <select
                name="attendance_type"
                value={formData.attendance_type}
                onChange={handleChange}
                className={`form-input ${errors.attendance_type ? 'form-input--error' : ''}`}
                disabled={loading}
              >
                {ATTENDANCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.attendance_type && <span className="form-error">{errors.attendance_type}</span>}
            </div>

            <div className="form-group form-group--button">
              <button
                type="submit"
                className="form-btn form-btn--primary"
                disabled={loading}
              >
                {loading ? 'Marcando...' : 'Marcar Entrada'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="checkin-list-section">
        <h3 className="section-title">Asistencias de Hoy</h3>
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner"></div>
            <p>Cargando asistencias...</p>
          </div>
        ) : !todayAttendances || todayAttendances.length === 0 ? (
          <div className="table-empty">
            <p>No hay asistencias registradas hoy</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Tipo</th>
                  <th>Hora de Entrada</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="table-cell-bold">
                      {attendance.user?.full_name || 'N/A'}
                    </td>
                    <td>{getAttendanceBadge(attendance.attendance_type)}</td>
                    <td>{formatTime(attendance.check_in_time)}</td>
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
