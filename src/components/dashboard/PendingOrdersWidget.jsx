export const PendingOrdersWidget = ({ count = 0, onTest, onClick, loading }) => {
  return (
    <div
      className="widget-card"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="widget-card__header">
        <h3 className="widget-card__title">
          <span className="widget-card__title-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
          Pedidos Pendientes
        </h3>
        {onTest && (
          <button
            onClick={(e) => { e.stopPropagation(); onTest(); }}
            className="widget-card__badge"
            style={{ background: '#f59e0b', cursor: 'pointer' }}
            title="Probar sonido de notificacion"
          >
            Probar
          </button>
        )}
      </div>

      <div className="widget-card__content">
        {loading ? (
          <div className="widget-loading">
            <div className="widget-loading__spinner"></div>
            <span className="widget-loading__text">Cargando...</span>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            {count > 0 ? (
              <>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  borderRadius: '50%',
                  marginBottom: '16px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '50%',
                    border: '3px solid #f59e0b',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}></div>
                  <span style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#d97706',
                    lineHeight: 1
                  }}>{count}</span>
                </div>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#78716c',
                  fontWeight: '500',
                  margin: 0
                }}>
                  {count === 1 ? 'pedido esperando atencion' : 'pedidos esperando atencion'}
                </p>
                <div style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" fill="none" stroke="#d97706" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontSize: '0.8125rem', color: '#d97706', fontWeight: '500' }}>
                    Requieren atencion inmediata
                  </span>
                </div>

                {/* Boton visible para ver detalles */}
                {onClick && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver pedidos pendientes
                  </button>
                )}
              </>
            ) : (
              <>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  borderRadius: '50%',
                  marginBottom: '16px'
                }}>
                  <svg width="40" height="40" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p style={{
                  fontSize: '1rem',
                  color: '#10b981',
                  fontWeight: '600',
                  margin: '0 0 4px 0'
                }}>
                  Todo al dia
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#78716c',
                  margin: 0
                }}>
                  No hay pedidos pendientes
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .widget-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};
