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

const LOYALTY_COLORS = {
  BRONCE: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  PLATA: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
  ORO: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' }
};

const TYPE_ICONS = {
  PERSONA_NATURAL: '👤',
  NEGOCIO: '🏪'
};

export const CustomerBirthdaysTab = ({ getBirthdays, loading }) => {
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [cumpleanos, setCumpleanos] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);

  useEffect(() => {
    loadBirthdays();
  }, [mesActual]);

  const loadBirthdays = async () => {
    setLoadingLocal(true);
    try {
      const data = await getBirthdays(mesActual);
      setCumpleanos(data || []);
    } catch (err) {
      console.error('Error al cargar cumpleanos:', err);
      setCumpleanos([]);
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

  const getLoyaltyStyle = (level) => {
    const normalizedLevel = level?.toUpperCase() || 'BRONCE';
    return LOYALTY_COLORS[normalizedLevel] || LOYALTY_COLORS.BRONCE;
  };

  const getLoyaltyIcon = (level) => {
    switch (level?.toUpperCase()) {
      case 'ORO': return '🥇';
      case 'PLATA': return '🥈';
      case 'BRONCE':
      default: return '🥉';
    }
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
          <h3 className="birthdays-card-title">Cumpleanos de {mesNombre}</h3>
          <span className="birthdays-count">{cumpleanos.length} cliente{cumpleanos.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoading ? (
          <div className="birthdays-loading">
            <div className="birthdays-spinner"></div>
            <span>Cargando cumpleanos...</span>
          </div>
        ) : cumpleanos.length === 0 ? (
          <div className="birthdays-empty">
            <span className="birthdays-empty-icon">📅</span>
            <p className="birthdays-empty-text">No hay cumpleanos en {mesNombre}</p>
          </div>
        ) : (
          <ul className="birthdays-list">
            {cumpleanos.map((cliente) => {
              const loyaltyStyle = getLoyaltyStyle(cliente.loyalty_level);
              return (
                <li key={cliente.id} className="birthdays-item">
                  <div
                    className="birthdays-day"
                    style={{ backgroundColor: loyaltyStyle.bg, color: loyaltyStyle.text }}
                  >
                    {getDiaDelMes(cliente.birth_date)}
                  </div>
                  <div className="birthdays-info">
                    <p className="birthdays-name">
                      {TYPE_ICONS[cliente.customer_type] || '👤'} {cliente.full_name}
                    </p>
                    {(cliente.address || cliente.district) && (
                      <p className="birthdays-address">
                        📍 {[cliente.address, cliente.district].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="birthdays-meta">
                      <span
                        className="birthdays-role"
                        style={{
                          backgroundColor: loyaltyStyle.bg,
                          color: loyaltyStyle.text,
                          borderColor: loyaltyStyle.border
                        }}
                      >
                        {getLoyaltyIcon(cliente.loyalty_level)} {cliente.loyalty_level || 'BRONCE'}
                      </span>
                      <span className="birthdays-date">
                        {formatFecha(cliente.birth_date)}
                      </span>
                      {cliente.phone && (
                        <span className="birthdays-phone">
                          📱 {cliente.phone}
                        </span>
                      )}
                    </div>
                    {parseFloat(cliente.ganagas_balance) > 0 && (
                      <div className="birthdays-balance">
                        💰 Saldo GANAGAS: S/{parseFloat(cliente.ganagas_balance).toFixed(2)}
                      </div>
                    )}
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
