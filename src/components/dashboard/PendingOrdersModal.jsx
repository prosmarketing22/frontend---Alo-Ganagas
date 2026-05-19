import { useNavigate } from 'react-router-dom';
import './PendingOrdersModal.css';

const formatCurrency = (value) => {
  return `S/ ${parseFloat(value || 0).toFixed(2)}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status) => {
  const statusConfig = {
    PENDIENTE: { label: 'Pendiente', className: 'pending-modal__badge--pending' },
    CONFIRMADO: { label: 'Confirmado', className: 'pending-modal__badge--confirmed' }
  };
  const config = statusConfig[status] || { label: status, className: '' };
  return <span className={`pending-modal__badge ${config.className}`}>{config.label}</span>;
};

const getPaymentMethodLabel = (method) => {
  const methods = {
    EFECTIVO: 'Efectivo',
    YAPE: 'Yape',
    PLIN: 'Plin',
    TRANSFERENCIA: 'Transferencia',
    CREDITO: 'Credito',
    MIXTO: 'Mixto'
  };
  return methods[method] || method;
};

export const PendingOrdersModal = ({ orders = [], onClose, onConfirm, onAssign, loading = false }) => {
  const navigate = useNavigate();

  const handleViewOrder = (orderId) => {
    onClose();
    navigate(`/orders/${orderId}`);
  };

  const handleGoToOrders = () => {
    onClose();
    navigate('/orders');
  };

  return (
    <div className="pending-modal__overlay" onClick={onClose}>
      <div className="pending-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pending-modal__header">
          <div className="pending-modal__header-content">
            <div className="pending-modal__header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="pending-modal__title">Pedidos Pendientes</h2>
              <p className="pending-modal__subtitle">
                {orders.length} {orders.length === 1 ? 'pedido requiere' : 'pedidos requieren'} atencion
              </p>
            </div>
          </div>
          <button onClick={onClose} className="pending-modal__close" title="Cerrar">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="pending-modal__body">
          {loading ? (
            <div className="pending-modal__loading">
              <div className="pending-modal__spinner"></div>
              <p>Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="pending-modal__empty">
              <div className="pending-modal__empty-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="pending-modal__empty-text">No hay pedidos pendientes</p>
              <p className="pending-modal__empty-subtext">Todos los pedidos han sido atendidos</p>
            </div>
          ) : (
            <div className="pending-modal__list">
              {orders.map((order) => (
                <div key={order.id} className="pending-modal__card">
                  <div className="pending-modal__card-header">
                    <div className="pending-modal__card-info">
                      <span className="pending-modal__order-number">{order.order_number}</span>
                      {getStatusBadge(order.order_status)}
                    </div>
                    <span className="pending-modal__time">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDateTime(order.order_datetime)}
                    </span>
                  </div>

                  <div className="pending-modal__card-body">
                    <div className="pending-modal__customer">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <span className="pending-modal__customer-name">{order.customer_name}</span>
                        {order.customer_phone && (
                          <span className="pending-modal__customer-phone">{order.customer_phone}</span>
                        )}
                      </div>
                    </div>

                    <div className="pending-modal__address">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{order.delivery_address}</span>
                    </div>

                    <div className="pending-modal__details">
                      <div className="pending-modal__detail">
                        <span className="pending-modal__detail-label">Total</span>
                        <span className="pending-modal__detail-value pending-modal__detail-value--highlight">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <div className="pending-modal__detail">
                        <span className="pending-modal__detail-label">Pago</span>
                        <span className="pending-modal__detail-value">
                          {getPaymentMethodLabel(order.payment_method)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pending-modal__card-actions">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="pending-modal__btn pending-modal__btn--secondary"
                      title="Ver detalle del pedido"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalle
                    </button>
                    {order.order_status === 'PENDIENTE' && onConfirm && (
                      <button
                        onClick={() => onConfirm(order.id)}
                        className="pending-modal__btn pending-modal__btn--confirm"
                        title="Confirmar pedido"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                    )}
                    {order.order_status === 'CONFIRMADO' && onAssign && (
                      <button
                        onClick={() => onAssign(order)}
                        className="pending-modal__btn pending-modal__btn--assign"
                        title="Asignar repartidor"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Asignar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pending-modal__footer">
          <button onClick={handleGoToOrders} className="pending-modal__footer-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver todos los pedidos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingOrdersModal;
