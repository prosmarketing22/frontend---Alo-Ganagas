import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import './MyOrdersPage.css';

const statusColors = {
  PENDIENTE: 'yellow',
  CONFIRMADO: 'blue',
  ASIGNADO: 'purple',
  EN_CAMINO: 'orange',
  ENTREGADO: 'green',
  CANCELADO: 'red'
};

const statusLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  ASIGNADO: 'Asignado',
  EN_CAMINO: 'En Camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

export const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { getMyOrders } = usePortalApi();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const response = await getMyOrders(params);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-page__loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-page__header">
        <h1 className="my-orders-page__title">Mis Pedidos</h1>
        <button
          className="my-orders-page__new"
          onClick={() => navigate('/portal/create-order')}
        >
          Nuevo Pedido
        </button>
      </div>

      <div className="my-orders-page__filters">
        <button
          className={'my-orders-page__filter' + (filter === 'ALL' ? ' my-orders-page__filter--active' : '')}
          onClick={() => setFilter('ALL')}
        >
          Todos
        </button>
        <button
          className={'my-orders-page__filter' + (filter === 'PENDIENTE' ? ' my-orders-page__filter--active' : '')}
          onClick={() => setFilter('PENDIENTE')}
        >
          Pendientes
        </button>
        <button
          className={'my-orders-page__filter' + (filter === 'EN_CAMINO' ? ' my-orders-page__filter--active' : '')}
          onClick={() => setFilter('EN_CAMINO')}
        >
          En Camino
        </button>
        <button
          className={'my-orders-page__filter' + (filter === 'ENTREGADO' ? ' my-orders-page__filter--active' : '')}
          onClick={() => setFilter('ENTREGADO')}
        >
          Entregados
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="my-orders-page__empty">
          <div className="my-orders-page__empty-icon">📦</div>
          <div className="my-orders-page__empty-text">
            No tienes pedidos {filter !== 'ALL' ? statusLabels[filter].toLowerCase() : ''}
          </div>
          <button
            className="my-orders-page__empty-button"
            onClick={() => navigate('/portal/create-order')}
          >
            Hacer mi Primer Pedido
          </button>
        </div>
      ) : (
        <div className="my-orders-page__list">
          {orders.map((order) => (
            <div key={order.id} className="my-orders-page__item">
              <div className="my-orders-page__item-header">
                <div className="my-orders-page__item-number">
                  Pedido #{order.id}
                </div>
                <div
                  className={
                    'my-orders-page__item-status' +
                    ' my-orders-page__item-status--' + statusColors[order.status]
                  }
                >
                  {statusLabels[order.status]}
                </div>
              </div>

              <div className="my-orders-page__item-info">
                <div className="my-orders-page__item-detail">
                  <span className="my-orders-page__item-label">Fecha:</span>
                  <span className="my-orders-page__item-value">
                    {new Date(order.created_at).toLocaleDateString('es-PE')}
                  </span>
                </div>
                <div className="my-orders-page__item-detail">
                  <span className="my-orders-page__item-label">Total:</span>
                  <span className="my-orders-page__item-value my-orders-page__item-value--price">
                    S/. {Number(order.total).toFixed(2)}
                  </span>
                </div>
                <div className="my-orders-page__item-detail">
                  <span className="my-orders-page__item-label">Productos:</span>
                  <span className="my-orders-page__item-value">
                    {order.items_count} items
                  </span>
                </div>
              </div>

              <button
                className="my-orders-page__item-button"
                onClick={() => navigate(`/portal/orders/${order.id}`)}
              >
                Ver Detalle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
