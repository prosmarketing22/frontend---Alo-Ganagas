export const DeliverersStatusWidget = ({ deliverers = [], loading }) => {
  const getDelivererStatus = (deliverer) => {
    if (deliverer.current_order_id) return 'en_ruta';
    if (deliverer.active_orders > 0) return 'ocupado';
    return 'disponible';
  };

  const getStatusConfig = (status) => {
    const configs = {
      disponible: {
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        label: 'Disponible',
        dot: '#10b981'
      },
      ocupado: {
        bg: 'rgba(245, 158, 11, 0.1)',
        color: '#d97706',
        label: 'Ocupado',
        dot: '#f59e0b'
      },
      en_ruta: {
        bg: 'rgba(30, 140, 255, 0.1)',
        color: '#1e8cff',
        label: 'En Ruta',
        dot: '#1e8cff'
      }
    };
    return configs[status] || configs.disponible;
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="widget-card">
      <div className="widget-card__header">
        <h3 className="widget-card__title">
          <span className="widget-card__title-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          Repartidores
        </h3>
        {deliverers.length > 0 && (
          <span className="widget-card__badge" style={{ background: '#10b981' }}>
            {deliverers.length} activos
          </span>
        )}
      </div>

      <div className="widget-card__content" style={{ padding: deliverers.length > 0 ? '0' : undefined }}>
        {loading ? (
          <div className="widget-loading">
            <div className="widget-loading__spinner"></div>
            <span className="widget-loading__text">Cargando...</span>
          </div>
        ) : deliverers.length > 0 ? (
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {deliverers.map((deliverer, index) => {
              const status = getDelivererStatus(deliverer);
              const config = getStatusConfig(status);
              return (
                <div
                  key={deliverer.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: index < deliverers.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: 'linear-gradient(135deg, #1e8cff 0%, #0050ff 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      position: 'relative'
                    }}>
                      {getInitials(deliverer.full_name)}
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        background: config.dot,
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}></span>
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {deliverer.full_name}
                      </p>
                      <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '0.8125rem',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {deliverer.active_orders || 0} asignados
                        {deliverer.delivered_today > 0 && (
                          <span style={{ color: '#10b981' }}>
                            · {deliverer.delivered_today} entregados
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: config.bg,
                    color: config.color
                  }}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="widget-empty">
            <div className="widget-empty__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="widget-empty__title">Sin repartidores</h4>
            <p className="widget-empty__description">No hay repartidores activos en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
};
