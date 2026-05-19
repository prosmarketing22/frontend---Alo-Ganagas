import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import '../../styles/components/salesHistory.css';

export const SalesHistoryTable = ({ sales = [], onView, loading, totalCount = 0 }) => {
  const formatDate = (datetime) => {
    try {
      return format(new Date(datetime), "dd MMM yyyy", { locale: es });
    } catch {
      return '-';
    }
  };

  const formatTime = (datetime) => {
    try {
      return format(new Date(datetime), "HH:mm", { locale: es });
    } catch {
      return '';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const getPaymentMethodDisplay = (sale) => {
    const effectiveMethod = sale.actual_payment_method || sale.payment_method;

    if (effectiveMethod === 'MIXTO' && sale.mixed_payment_details) {
      try {
        const details = typeof sale.mixed_payment_details === 'string'
          ? JSON.parse(sale.mixed_payment_details)
          : sale.mixed_payment_details;

        if (Array.isArray(details) && details.length > 0) {
          const methods = details.map(d => d.method).join(' + ');
          return { label: 'Mixto', detail: methods };
        }
      } catch (e) {
        return { label: 'Mixto', detail: null };
      }
    }

    const methodLabels = {
      'EFECTIVO': 'Efectivo',
      'YAPE': 'Yape',
      'PLIN': 'Plin',
      'TRANSFERENCIA': 'Transferencia',
      'CREDITO': 'Crédito',
      'FISE': 'FISE',
      'VALE_FISE': 'Vale FISE',
      'MIXTO': 'Mixto'
    };

    return { label: methodLabels[effectiveMethod] || effectiveMethod || '-', detail: null };
  };

  if (loading) {
    return (
      <div className="sales-table-container">
        <div className="sales-table-loading">
          <div className="sales-loading-spinner"></div>
          <span className="sales-loading-text">Cargando historial de ventas...</span>
        </div>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="sales-table-container">
        <div className="sales-table-empty">
          <div className="sales-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="sales-empty-title">No se encontraron ventas</p>
          <p className="sales-empty-text">Ajusta los filtros de búsqueda o intenta con otro rango de fechas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-table-container">
      <div className="sales-table-header">
        <div className="sales-table-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Registro de Ventas
          <span className="sales-table-count">{totalCount}</span>
        </div>
      </div>

      <div className="sales-table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Repartidor</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>
                  <span className="sales-order-number">#{sale.order_number || sale.id}</span>
                </td>
                <td>
                  <div className="sales-date">
                    <div>{formatDate(sale.order_datetime)}</div>
                    <small style={{ color: 'var(--color-neutral-500)', fontSize: '11px' }}>
                      {formatTime(sale.order_datetime)}
                    </small>
                  </div>
                </td>
                <td>
                  <div className="sales-customer">
                    <span className="sales-customer-name">{sale.customer_name}</span>
                    <span className="sales-customer-address">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {sale.delivery_address || 'Sin dirección'}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="sales-deliverer">{sale.deliverer_name || '-'}</span>
                </td>
                <td>
                  <span className="sales-total">{formatCurrency(sale.total)}</span>
                </td>
                <td>
                  {(() => {
                    const statusConfig = {
                      ENTREGADO: {
                        label: 'Entregado',
                        className: 'sales-badge--delivered',
                        icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                      },
                      CANCELADO: {
                        label: 'Cancelado',
                        className: 'sales-badge--cancelled',
                        icon: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
                      },
                      EN_CAMINO: {
                        label: 'En Camino',
                        className: 'sales-badge--in-transit',
                        icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
                      },
                      ASIGNADO: {
                        label: 'Asignado',
                        className: 'sales-badge--assigned',
                        icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>
                      },
                      CONFIRMADO: {
                        label: 'Confirmado',
                        className: 'sales-badge--confirmed',
                        icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                      },
                      PENDIENTE: {
                        label: 'Pendiente',
                        className: 'sales-badge--pending-order',
                        icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                      }
                    };
                    const config = statusConfig[sale.order_status] || statusConfig.PENDIENTE;
                    return (
                      <span className={`sales-badge ${config.className}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {config.icon}
                        </svg>
                        {config.label}
                      </span>
                    );
                  })()}
                </td>
                <td>
                  {(() => {
                    const paymentInfo = getPaymentMethodDisplay(sale);
                    const isPaid = sale.payment_status === 'paid' || sale.order_status === 'ENTREGADO';
                    const isCredit = (sale.actual_payment_method || sale.payment_method) === 'CREDITO' || sale.is_credit;

                    if (isPaid) {
                      return (
                        <div className="sales-payment-info">
                          <span className={`sales-badge ${isCredit ? 'sales-badge--credit' : 'sales-badge--paid'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {isCredit ? (
                                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              ) : (
                                <polyline points="20 6 9 17 4 12" />
                              )}
                            </svg>
                            {paymentInfo.label}
                          </span>
                          {paymentInfo.detail && (
                            <small className="sales-payment-detail" title={paymentInfo.detail}>
                              {paymentInfo.detail}
                            </small>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <span className="sales-badge sales-badge--pending">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Pendiente
                        </span>
                      );
                    }
                  })()}
                </td>
                <td>
                  <div className="sales-table-actions">
                    {onView && (
                      <button
                        className="sales-action-btn"
                        onClick={() => onView(sale)}
                        title="Ver detalles"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Ver Detalles
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
