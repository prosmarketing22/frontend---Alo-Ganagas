import { useState } from 'react';
import './OrdersTable.css';

const STATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', class: 'status--pending', icon: '📋' },
  CONFIRMADO: { label: 'Confirmado', class: 'status--confirmed', icon: '✅' },
  ASIGNADO: { label: 'Asignado', class: 'status--assigned', icon: '👤' },
  EN_CAMINO: { label: 'En Camino', class: 'status--transit', icon: '🚚' },
  ENTREGADO: { label: 'Entregado', class: 'status--delivered', icon: '📦' },
  CANCELADO: { label: 'Cancelado', class: 'status--cancelled', icon: '❌' }
};

const PAYMENT_METHODS = {
  PENDIENTE: 'Pendiente',
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Credito',
  VALE_FISE: 'FISE',
  FISE: 'FISE',
  MIXTO: 'Mixto'
};

export const OrdersTable = ({
  orders = [],
  loading = false,
  onView,
  onConfirm,
  onAssign,
  onInTransit,
  onDeliver,
  onCancel,
  onDelete,
  pagination,
  onPageChange
}) => {
  const [actionOrderId, setActionOrderId] = useState(null);

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

  const handleAction = async (action, order) => {
    setActionOrderId(order.id);
    try {
      await action(order);
    } finally {
      setActionOrderId(null);
    }
  };

  const renderActions = (order) => {
    const status = order.order_status;
    const isProcessing = actionOrderId === order.id;

    return (
      <div className="orders-table__actions">
        <button
          className="orders-table__btn orders-table__btn--view"
          onClick={() => onView && onView(order)}
          title="Ver detalle"
        >
          Ver
        </button>

        {status === 'PENDIENTE' && onConfirm && (
          <button
            className="orders-table__btn orders-table__btn--confirm"
            onClick={() => handleAction(onConfirm, order)}
            disabled={isProcessing}
            title="Confirmar pedido"
          >
            Confirmar
          </button>
        )}

        {(status === 'CONFIRMADO' || status === 'ASIGNADO') && onAssign && (
          <button
            className="orders-table__btn orders-table__btn--assign"
            onClick={() => handleAction(onAssign, order)}
            disabled={isProcessing}
            title="Asignar repartidor"
          >
            Asignar
          </button>
        )}

        {status === 'ASIGNADO' && onInTransit && (
          <button
            className="orders-table__btn orders-table__btn--transit"
            onClick={() => handleAction(onInTransit, order)}
            disabled={isProcessing}
            title="Marcar en camino"
          >
            En Camino
          </button>
        )}

        {status === 'EN_CAMINO' && onDeliver && (
          <button
            className="orders-table__btn orders-table__btn--deliver"
            onClick={() => handleAction(onDeliver, order)}
            disabled={isProcessing}
            title="Marcar entregado"
          >
            Entregar
          </button>
        )}

        {!['ENTREGADO', 'CANCELADO'].includes(status) && onCancel && (
          <button
            className="orders-table__btn orders-table__btn--cancel"
            onClick={() => handleAction(onCancel, order)}
            disabled={isProcessing}
            title="Cancelar pedido"
          >
            Cancelar
          </button>
        )}

        {!['ENTREGADO'].includes(status) && onDelete && (
          <button
            className="orders-table__btn orders-table__btn--delete"
            onClick={() => handleAction(onDelete, order)}
            disabled={isProcessing}
            title="Eliminar pedido"
          >
            Eliminar
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="orders-table__loading">Cargando pedidos...</div>;
  }

  if (!orders.length) {
    return <div className="orders-table__empty">No hay pedidos para mostrar</div>;
  }

  return (
    <div className="orders-table">
      <table className="orders-table__table">
        <thead>
          <tr>
            <th>N Pedido</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Fecha</th>
            <th>Repartidor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.PENDIENTE;
            return (
              <tr key={order.id} className={order.is_credit ? 'orders-table__row--credit' : ''}>
                <td className="orders-table__number">
                  {order.order_number}
                  {order.is_credit && <span className="orders-table__credit-badge">Credito</span>}
                </td>
                <td>
                  <div className="orders-table__customer">
                    <span className="orders-table__customer-name">{order.customer_name}</span>
                    {order.customer_phone && (
                      <span className="orders-table__customer-phone">{order.customer_phone}</span>
                    )}
                    {order.customer_address && (
                      <span className="orders-table__customer-address">{order.customer_address}</span>
                    )}
                    {order.customer_district && (
                      <span className="orders-table__customer-district">{order.customer_district}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`orders-table__status ${statusConfig.class}`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </td>
                <td className="orders-table__total">{formatMoney(order.total)}</td>
                <td>{PAYMENT_METHODS[order.payment_method] || order.payment_method}</td>
                <td className="orders-table__date">{formatDate(order.order_datetime)}</td>
                <td>{order.deliverer_name || '-'}</td>
                <td>{renderActions(order)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="orders-table__pagination">
          <button
            onClick={() => onPageChange && onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Anterior
          </button>
          <span>
            Pagina {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
