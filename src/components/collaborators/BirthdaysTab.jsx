import { useState, useEffect } from 'react';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

const ROLE_COLORS = {
  GERENTE: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  BASE: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  REPARTIDOR: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
};

export const BirthdaysTab = ({ getBirthdays, loading }) => {
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [cumpleaños, setCumpleaños] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);

  useEffect(() => {
    loadBirthdays();
  }, [mesActual]);

  const loadBirthdays = async () => {
    setLoadingLocal(true);
    try {
      const data = await getBirthdays(mesActual);
      setCumpleaños(data || []);
    } catch (err) {
      console.error('Error al cargar cumpleaños:', err);
      setCumpleaños([]);
    } finally {
      setLoadingLocal(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    const dia = d.getUTCDate();
    const mes = MESES[d.getUTCMonth()]?.label || '';
    return `${dia} de ${mes}`;
  };

  const getDiaDelMes = (fecha) => {
    if (!fecha) return 0;
    const d = new Date(fecha);
    return d.getUTCDate();
  };

  const getRoleStyle = (roleName) => {
    const normalizedRole = roleName?.toUpperCase() || '';
    return ROLE_COLORS[normalizedRole] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  };

  const isLoading = loading || loadingLocal;
  const mesNombre = MESES.find(m => m.value === mesActual)?.label || '';

  return (
    <div className="birthdays-container">
      <div className="birthdays-filter">
        <label className="birthdays-filter-label">Seleccionar mes:</label>
        <select
          value={mesActual}
          onChange={(e) => setMesActual(parseInt(e.target.value))}
          className="birthdays-select"
        >
          {MESES.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>
      </div>

      <div className="birthdays-card">
        <div className="birthdays-card-header">
          <span className="birthdays-card-icon">🎂</span>
          <h3 className="birthdays-card-title">Cumpleaños de {mesNombre}</h3>
          <span className="birthdays-count">{cumpleaños.length} colaborador{cumpleaños.length !== 1 ? 'es' : ''}</span>
        </div>

        {isLoading ? (
          <div className="birthdays-loading">
            <div className="birthdays-spinner"></div>
            <span>Cargando cumpleaños...</span>
          </div>
        ) : cumpleaños.length === 0 ? (
          <div className="birthdays-empty">
            <span className="birthdays-empty-icon">📅</span>
            <p className="birthdays-empty-text">No hay cumpleaños en {mesNombre}</p>
          </div>
        ) : (
          <ul className="birthdays-list">
            {cumpleaños.map((colaborador) => {
              const roleStyle = getRoleStyle(colaborador.role_name);
              return (
                <li key={colaborador.id} className="birthdays-item">
                  <div
                    className="birthdays-day"
                    style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                  >
                    {getDiaDelMes(colaborador.birth_date)}
                  </div>
                  <div className="birthdays-info">
                    <p className="birthdays-name">{colaborador.full_name}</p>
                    <div className="birthdays-meta">
                      <span
                        className="birthdays-role"
                        style={{
                          backgroundColor: roleStyle.bg,
                          color: roleStyle.text,
                          borderColor: roleStyle.border
                        }}
                      >
                        {colaborador.role_name}
                      </span>
                      <span className="birthdays-date">
                        {formatFecha(colaborador.birth_date)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
