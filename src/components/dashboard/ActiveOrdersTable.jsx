import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActiveOrdersTable = ({ orders = [], onView, onViewAll, loading }) => {
  const getStatusConfig = (status) => {
    const configs = {
      PENDIENTE: {
        bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        color: '#6b7280',
        label: 'Pendiente',
        dot: '#9ca3af'
      },
      CONFIRMADO: {
        bg: 'linear-gradient(135deg, rgba(30, 140, 255, 0.1) 0%, rgba(0, 80, 255, 0.05) 100%)',
        color: '#1e8cff',
        label: 'Confirmado',
        dot: '#1e8cff'
      },
      ASIGNADO: {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.05) 100%)',
        color: '#7c3aed',
        label: 'Asignado',
        dot: '#8b5cf6'
      },
      EN_CAMINO: {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
        color: '#d97706',
        label: 'En Ruta',
        dot: '#f59e0b'
      },
      ENTREGADO: {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
        color: '#059669',
        label: 'Entregado',
        dot: '#10b981'
      },
      CANCELADO: {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
        color: '#dc2626',
        label: 'Cancelado',
        dot: '#ef4444'
      }
    };
    return configs[status] || configs.PENDIENTE;
  };

  const formatElapsedTime = (datetime) => {
    try {
      return formatDistanceToNow(new Date(datetime), {
        addSuffix: false,
        locale: es
      });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount || 0);
  };

  return (
    <div className="dashboard__table-section">
      <div className="dashboard__table-header">
        <div className="dashboard__table-title">
          <span className="dashboard__table-title-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </span>
          <h3>Seguimiento de Pedidos Activos</h3>
        </div>
        <div className="dashboard__table-actions">
          {onViewAll && (
            <button onClick={onViewAll} className="dashboard__view-all-btn">
              Ver todos
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#1e8cff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}></div>
          <span style={{ fontSize: '0.875rem' }}>Cargando pedidos...</span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : orders.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Pedido</th>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Cliente</th>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Repartidor</th>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Estado</th>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Tiempo</th>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Total</th>
                <th style={{
                  padding: '14px 24px',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0'
                }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const config = getStatusConfig(order.order_status);
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: index < orders.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: config.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="20" height="20" fill="none" stroke={config.color} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <span style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1f2937'
                          }}>
                            #{order.order_number || order.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {order.customer_name}
                        </p>
                        <p style={{
                          margin: '2px 0 0 0',
                          fontSize: '0.8125rem',
                          color: '#6b7280',
                          maxWidth: '200px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {order.delivery_address}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {order.deliverer_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #1e8cff 0%, #0050ff 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {order.deliverer_name.charAt(0)}
                          </div>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#374151',
                            fontWeight: '500'
                          }}>
                            {order.deliverer_name}
                          </span>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.8125rem',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: config.bg,
                        border: `1px solid ${config.color}20`
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: config.dot
                        }}></span>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          color: config.color
                        }}>
                          {config.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span style={{ fontSize: '0.875rem' }}>
                          {formatElapsedTime(order.order_datetime)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#1f2937'
                      }}>
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      {onView && (
                        <button
                          onClick={() => onView(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#374151',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#1e8cff';
                            e.currentTarget.style.borderColor = '#1e8cff';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.color = '#374151';
                          }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detalle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="40" height="40" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#10b981'
          }}>
            Sin pedidos activos
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.9375rem',
            color: '#6b7280',
            maxWidth: '300px'
          }}>
            No hay pedidos en proceso en este momento. Los nuevos pedidos apareceran aqui automaticamente.
          </p>
        </div>
      )}
    </div>
  );
};
