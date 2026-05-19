import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { OrderTimeline } from '../../components/portal/OrderTimeline';
import { BASE_URL } from '../../config/api.config';
import './OrderDetailPage.css';

const statusLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  ASIGNADO: 'Asignado',
  EN_CAMINO: 'En Camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

const paymentMethodLabels = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin',
  CREDITO: 'Crédito'
};

export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderDetail } = usePortalApi();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProductImage = (imagePath) => {
    if (imagePath) {
      return `${BASE_URL}/uploads/${imagePath}`;
    }
    return null;
  };

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const data = await getOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-page__loading">Cargando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-page__error">
          Pedido no encontrado
        </div>
        <button
          className="order-detail-page__back"
          onClick={() => navigate('/portal/orders')}
        >
          Volver a Mis Pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-page__header">
        <h1 className="order-detail-page__title">Pedido #{order.id}</h1>
        <button
          className="order-detail-page__back"
          onClick={() => navigate('/portal/orders')}
        >
          Volver
        </button>
      </div>

      <div className="order-detail-page__timeline">
        <OrderTimeline currentStatus={order.status} />
      </div>

      <div className="order-detail-page__content">
        <div className="order-detail-page__section">
          <h2 className="order-detail-page__section-title">Información del Pedido</h2>
          <div className="order-detail-page__info-grid">
            <div className="order-detail-page__info-item">
              <div className="order-detail-page__info-label">Estado:</div>
              <div className="order-detail-page__info-value">
                {statusLabels[order.status]}
              </div>
            </div>
            <div className="order-detail-page__info-item">
              <div className="order-detail-page__info-label">Fecha:</div>
              <div className="order-detail-page__info-value">
                {new Date(order.created_at).toLocaleString('es-PE')}
              </div>
            </div>
            <div className="order-detail-page__info-item">
              <div className="order-detail-page__info-label">Método de Pago:</div>
              <div className="order-detail-page__info-value">
                {paymentMethodLabels[order.payment_method]}
              </div>
            </div>
            <div className="order-detail-page__info-item">
              <div className="order-detail-page__info-label">Dirección:</div>
              <div className="order-detail-page__info-value">
                {order.delivery_address}
              </div>
            </div>
          </div>
        </div>

        <div className="order-detail-page__section">
          <h2 className="order-detail-page__section-title">Productos</h2>
          <div className="order-detail-page__products">
            {order.items.map((item) => (
              <div key={item.id} className="order-detail-page__product">
                <div className="order-detail-page__product-image">
                  {item.image_path ? (
                    <img
                      src={getProductImage(item.image_path)}
                      alt={item.product_name}
                      className="order-detail-page__product-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="order-detail-page__product-placeholder"
                    style={{ display: item.image_path ? 'none' : 'flex' }}
                  >
                    {item.product_type === 'BALON_GAS' ? '🔥' :
                     item.product_type === 'BIDON_AGUA' ? '💧' : '🔧'}
                  </div>
                </div>
                <div className="order-detail-page__product-info">
                  <div className="order-detail-page__product-name">
                    {item.product_name}
                    {item.includes_container && parseFloat(item.container_subtotal) > 0 && (
                      <span className="order-detail-page__container-price">
                        + Envase S/ {Number(item.container_subtotal).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="order-detail-page__product-quantity">
                    Cantidad: {item.quantity}
                  </div>
                  <div className="order-detail-page__product-badge-row">
                    {item.includes_container ? (
                      <span className="order-detail-page__badge order-detail-page__badge--container">
                        Compra con Envase
                      </span>
                    ) : item.is_exchange ? (
                      <span className="order-detail-page__badge order-detail-page__badge--exchange">
                        Intercambio
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="order-detail-page__product-price">
                  <div className="order-detail-page__product-unit-price">
                    S/. {Number(item.unit_price).toFixed(2)} c/u
                  </div>
                  <div className="order-detail-page__product-subtotal">
                    S/. {Number(item.subtotal).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {order.items?.some(d => d.includes_container) && (
            <div className="order-detail-page__container-notice">
              <span className="order-detail-page__container-notice-icon">&#9432;</span>
              <div>
                <strong>Compra con envase incluido</strong>
                <p>
                  {order.items.filter(d => d.includes_container).map(d => d.product_name).join(', ')}
                  {' '}&mdash; No requiere intercambio de envase vacio.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="order-detail-page__section">
          <h2 className="order-detail-page__section-title">Totales</h2>
          <div className="order-detail-page__totals">
            <div className="order-detail-page__total-row">
              <span>Subtotal:</span>
              <span>S/. {Number(order.subtotal).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="order-detail-page__total-row">
                <span>Descuento GANAGAS:</span>
                <span className="order-detail-page__discount">
                  - S/. {Number(order.discount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="order-detail-page__total-row order-detail-page__total-row--final">
              <span>Total:</span>
              <span className="order-detail-page__total-amount">
                S/. {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
