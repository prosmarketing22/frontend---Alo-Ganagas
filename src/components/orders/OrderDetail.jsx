import { useState } from 'react';
import { getUploadUrl } from '../../config/api.config';
import './OrderDetail.css';

const STATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', class: 'status--pending', icon: '1' },
  CONFIRMADO: { label: 'Confirmado', class: 'status--confirmed', icon: '2' },
  ASIGNADO: { label: 'Asignado', class: 'status--assigned', icon: '3' },
  EN_CAMINO: { label: 'En Camino', class: 'status--transit', icon: '4' },
  ENTREGADO: { label: 'Entregado', class: 'status--delivered', icon: '5' },
  CANCELADO: { label: 'Cancelado', class: 'status--cancelled', icon: 'X' }
};

const STATUS_ORDER = ['PENDIENTE', 'CONFIRMADO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO'];

const PAYMENT_METHODS = {
  PENDIENTE: 'Pendiente',
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Credito',
  VALE_FISE: 'FISE',
  FISE: 'FISE',
  MIXTO: 'Pago Mixto'
};

const getVoucherUrl = (voucherPath) => {
  return getUploadUrl(voucherPath);
};

export const OrderDetail = ({ order, onClose, onConfirm, onAssign, onInTransit, onDeliver, onCancel }) => {
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeliveryVoucherModal, setShowDeliveryVoucherModal] = useState(false);

  if (!order) return null;

  const voucherUrl = getVoucherUrl(order.voucher_path);
  const deliveryVoucherUrl = getVoucherUrl(order.delivery_voucher_path);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const currentStatusIndex = STATUS_ORDER.indexOf(order.order_status);
  const isCancelled = order.order_status === 'CANCELADO';

  const getStatusDatetime = (status) => {
    switch (status) {
      case 'PENDIENTE': return order.order_datetime;
      case 'CONFIRMADO': return order.confirmation_datetime;
      case 'ASIGNADO': return order.assignment_datetime;
      case 'EN_CAMINO': return order.in_transit_datetime;
      case 'ENTREGADO': return order.delivery_datetime;
      default: return null;
    }
  };

  return (
    <div className="order-detail">
      <div className="order-detail__header">
        <div>
          <h2 className="order-detail__title">Pedido {order.order_number}</h2>
          <span className={`order-detail__status ${STATUS_CONFIG[order.order_status]?.class}`}>
            {STATUS_CONFIG[order.order_status]?.label}
          </span>
          {order.is_credit && (
            <span className="order-detail__credit-badge">Credito</span>
          )}
        </div>
        <button onClick={onClose} className="order-detail__close">&times;</button>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="order-detail__timeline">
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = status === order.order_status;
            const datetime = getStatusDatetime(status);

            return (
              <div
                key={status}
                className={`order-detail__timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="order-detail__timeline-icon">
                  {isCompleted ? (index < currentStatusIndex ? '✓' : STATUS_CONFIG[status].icon) : STATUS_CONFIG[status].icon}
                </div>
                <div className="order-detail__timeline-content">
                  <span className="order-detail__timeline-label">{STATUS_CONFIG[status].label}</span>
                  {datetime && (
                    <span className="order-detail__timeline-date">{formatDate(datetime)}</span>
                  )}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div className={`order-detail__timeline-line ${isCompleted && index < currentStatusIndex ? 'completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isCancelled && (
        <div className="order-detail__cancelled-banner">
          Pedido Cancelado
        </div>
      )}

      <div className="order-detail__content">
        {/* Info Cliente */}
        <div className="order-detail__section">
          <h3>Cliente</h3>
          <div className="order-detail__info-grid">
            <div className="order-detail__info-item">
              <label>Nombre</label>
              <span>{order.customer_name}</span>
            </div>
            <div className="order-detail__info-item">
              <label>Telefono</label>
              <span>{order.customer_phone || '-'}</span>
            </div>
            <div className="order-detail__info-item">
              <label>Direccion</label>
              <span>{order.delivery_address}</span>
            </div>
            <div className="order-detail__info-item">
              <label>Referencia</label>
              <span>{order.delivery_reference || '-'}</span>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="order-detail__section">
          <h3>Productos</h3>
          <table className="order-detail__products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th>Tipo</th>
                <th>Vacios Recibidos</th>
              </tr>
            </thead>
            <tbody>
              {order.details?.map((detail, index) => (
                <tr key={index}>
                  <td data-label="Producto">
                    {detail.product_name}
                    {detail.includes_container && parseFloat(detail.container_subtotal) > 0 && (
                      <span className="order-detail__container-price">
                        + Envase {formatMoney(detail.container_subtotal)}
                      </span>
                    )}
                  </td>
                  <td data-label="Cantidad">{detail.quantity}</td>
                  <td data-label="Precio Unit.">{formatMoney(detail.unit_price)}</td>
                  <td data-label="Subtotal">{formatMoney(detail.subtotal)}</td>
                  <td data-label="Tipo">
                    {detail.includes_container ? (
                      <span className="order-detail__badge order-detail__badge--container">Venta con Envase</span>
                    ) : detail.is_exchange ? (
                      <span className="order-detail__badge order-detail__badge--exchange">Intercambio</span>
                    ) : (
                      <span className="order-detail__badge order-detail__badge--normal">Sin intercambio</span>
                    )}
                  </td>
                  <td data-label="Vacios Recibidos">{detail.empty_received || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Aviso de Venta con Envase */}
        {order.details?.some(d => d.includes_container) && (
          <div className="order-detail__container-notice">
            <span className="order-detail__container-notice-icon">&#9432;</span>
            <div>
              <strong>Venta con envase incluido</strong>
              <p>
                {order.details.filter(d => d.includes_container).map(d => d.product_name).join(', ')}
                {' '}&mdash; El cliente compra envase nuevo, no requiere devolucion de envase vacio.
              </p>
            </div>
          </div>
        )}

        {/* Resumen de Pago */}
        <div className="order-detail__section">
          <h3>Resumen de Pago</h3>
          <div className="order-detail__payment-summary">
            <div className="order-detail__payment-row">
              <span>Subtotal:</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="order-detail__payment-row discount">
                <span>Descuento:</span>
                <span>- {formatMoney(order.discount)}</span>
              </div>
            )}
            {parseFloat(order.ganagas_balance_used) > 0 && (
              <div className="order-detail__payment-row ganagas">
                <span>Saldo GANAGAS:</span>
                <span>- {formatMoney(order.ganagas_balance_used)}</span>
              </div>
            )}
            <div className="order-detail__payment-row total">
              <span>TOTAL:</span>
              <span>{formatMoney(order.total)}</span>
            </div>
            <div className="order-detail__payment-row">
              <span>Metodo de Pago:</span>
              <span>{PAYMENT_METHODS[order.payment_method]}</span>
            </div>
            {order.order_status === 'ENTREGADO' && (
              <>
                <div className="order-detail__payment-row">
                  <span>Monto Pagado:</span>
                  <span>{formatMoney(order.amount_paid)}</span>
                </div>
                {parseFloat(order.change_amount) > 0 && (
                  <div className="order-detail__payment-row">
                    <span>Vuelto:</span>
                    <span>{formatMoney(order.change_amount)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Información FISE */}
        {(order.payment_method === 'FISE' || order.actual_payment_method === 'FISE' || order.actual_payment_method === 'VALE_FISE') && (
          <div className="order-detail__section">
            <h3>Información FISE</h3>
            <div className="order-detail__info-grid">
              {order.payment_preregistered_details?.fise_dni && (
                <div className="order-detail__info-item">
                  <label>DNI Beneficiario:</label>
                  <span>{order.payment_preregistered_details.fise_dni}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voucher de Pago */}
        {voucherUrl && order.payment_method !== 'EFECTIVO' && (
          <div className="order-detail__section">
            <h3>Voucher de Pago</h3>
            <div className="order-detail__voucher">
              <div className="order-detail__voucher-preview" onClick={() => setShowVoucherModal(true)}>
                <img
                  src={voucherUrl}
                  alt="Voucher de pago"
                  className="order-detail__voucher-thumbnail"
                />
                <span className="order-detail__voucher-zoom">Click para ampliar</span>
              </div>
              {order.order_status === 'PENDIENTE' && (
                <p className="order-detail__voucher-pending">
                  Verifique el voucher antes de confirmar el pedido
                </p>
              )}
            </div>
          </div>
        )}

        {/* Repartidor */}
        {order.deliverer_name && (
          <div className="order-detail__section">
            <h3>Repartidor</h3>
            <div className="order-detail__info-grid">
              <div className="order-detail__info-item">
                <label>Nombre</label>
                <span>{order.deliverer_name}</span>
              </div>
              <div className="order-detail__info-item">
                <label>Telefono</label>
                <span>{order.deliverer_phone || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comprobante de Entrega del Repartidor */}
        {order.order_status === 'ENTREGADO' && (
          <div className="order-detail__section">
            <h3>Datos de Entrega</h3>
            <div className="order-detail__info-grid">
              {order.actual_payment_method && (
                <div className="order-detail__info-item">
                  <label>Metodo de Pago Utilizado</label>
                  <span>{PAYMENT_METHODS[order.actual_payment_method] || order.actual_payment_method}</span>
                </div>
              )}
              {order.amount_paid && (
                <div className="order-detail__info-item">
                  <label>Monto Recibido</label>
                  <span>{formatMoney(order.amount_paid)}</span>
                </div>
              )}
              {order.change_amount > 0 && (
                <div className="order-detail__info-item">
                  <label>Vuelto</label>
                  <span>{formatMoney(order.change_amount)}</span>
                </div>
              )}
            </div>
            {/* Desglose de Pagos Mixtos */}
            {order.actual_payment_method === 'MIXTO' && order.mixed_payment_details && (
              <div className="order-detail__mixed-payments">
                <p className="order-detail__mixed-title">Desglose de Pagos:</p>
                <div className="order-detail__mixed-list">
                  {(typeof order.mixed_payment_details === 'string'
                    ? JSON.parse(order.mixed_payment_details)
                    : order.mixed_payment_details
                  ).map((payment, index) => (
                    <div key={index} className="order-detail__mixed-item-extended">
                      <div className="order-detail__mixed-item-info">
                        <span className="order-detail__mixed-method">{payment.label || PAYMENT_METHODS[payment.method] || payment.method}</span>
                        <span className="order-detail__mixed-amount">{formatMoney(payment.amount)}</span>
                      </div>
                      {payment.voucher_path && (
                        <a
                          href={getVoucherUrl(payment.voucher_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-detail__mixed-voucher-link"
                        >
                          <img
                            src={getVoucherUrl(payment.voucher_path)}
                            alt={`Voucher ${payment.method}`}
                            className="order-detail__mixed-voucher-thumb"
                          />
                          <span>Ver voucher</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Voucher general (para pagos no mixtos) */}
            {order.actual_payment_method !== 'MIXTO' && deliveryVoucherUrl && (
              <div className="order-detail__voucher" style={{ marginTop: '12px' }}>
                <p className="order-detail__voucher-label">Comprobante de Pago (Repartidor):</p>
                <div className="order-detail__voucher-preview" onClick={() => setShowDeliveryVoucherModal(true)}>
                  <img
                    src={deliveryVoucherUrl}
                    alt="Comprobante de entrega"
                    className="order-detail__voucher-thumbnail"
                  />
                  <span className="order-detail__voucher-zoom">Click para ampliar</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Observaciones */}
        {order.notes && (
          <div className="order-detail__section">
            <h3>Observaciones</h3>
            <p className="order-detail__notes">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="order-detail__actions">
        {order.order_status === 'PENDIENTE' && onConfirm && (
          <button
            className="order-detail__btn order-detail__btn--confirm"
            onClick={() => onConfirm(order)}
          >
            Confirmar Pedido
          </button>
        )}

        {(order.order_status === 'CONFIRMADO' || order.order_status === 'ASIGNADO') && onAssign && (
          <button
            className="order-detail__btn order-detail__btn--assign"
            onClick={() => onAssign(order)}
          >
            Asignar Repartidor
          </button>
        )}

        {order.order_status === 'ASIGNADO' && onInTransit && (
          <button
            className="order-detail__btn order-detail__btn--transit"
            onClick={() => onInTransit(order)}
          >
            Marcar En Camino
          </button>
        )}

        {order.order_status === 'EN_CAMINO' && onDeliver && (
          <button
            className="order-detail__btn order-detail__btn--deliver"
            onClick={() => onDeliver(order)}
          >
            Marcar Entregado
          </button>
        )}

        {!['ENTREGADO', 'CANCELADO'].includes(order.order_status) && onCancel && (
          <button
            className="order-detail__btn order-detail__btn--cancel"
            onClick={() => onCancel(order)}
          >
            Cancelar Pedido
          </button>
        )}
      </div>

      {/* Modal del Voucher del Cliente */}
      {showVoucherModal && voucherUrl && (
        <div className="order-detail__voucher-modal" onClick={() => setShowVoucherModal(false)}>
          <div className="order-detail__voucher-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="order-detail__voucher-modal-close"
              onClick={() => setShowVoucherModal(false)}
            >
              &times;
            </button>
            <img
              src={voucherUrl}
              alt="Voucher de pago"
              className="order-detail__voucher-modal-image"
            />
            <a
              href={voucherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="order-detail__voucher-download"
            >
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      )}

      {/* Modal del Comprobante del Repartidor */}
      {showDeliveryVoucherModal && deliveryVoucherUrl && (
        <div className="order-detail__voucher-modal" onClick={() => setShowDeliveryVoucherModal(false)}>
          <div className="order-detail__voucher-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="order-detail__voucher-modal-close"
              onClick={() => setShowDeliveryVoucherModal(false)}
            >
              &times;
            </button>
            <img
              src={deliveryVoucherUrl}
              alt="Comprobante de entrega"
              className="order-detail__voucher-modal-image"
            />
            <a
              href={deliveryVoucherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="order-detail__voucher-download"
            >
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
