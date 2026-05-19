import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderApi } from '../../hooks/useApi/useOrderApi';
import { useSocket } from '../../features/socket/SocketContext';
import { useDebounce } from '../../hooks/useDebounce';
import { OrdersTable } from '../../components/orders/OrdersTable';
import { OrderFormV2 } from '../../components/orders/OrderFormV2';
import { OrderDetail } from '../../components/orders/OrderDetail';
import { AssignDelivererModal } from '../../components/orders/AssignDelivererModal';
import { WarehouseSelectionModal } from '../../components/orders/WarehouseSelectionModal';
import { DeliveryModal } from '../../components/repartidor/DeliveryModal';
import repartidorService from '../../services/repartidorService';
import './OrdersPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'CONFIRMADO', label: 'Confirmados' },
  { value: 'ASIGNADO', label: 'Asignados' },
  { value: 'EN_CAMINO', label: 'En Camino' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' }
];

export const OrdersPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const {
    data: orders,
    order: selectedOrder,
    summary,
    deliverers,
    loading,
    pagination,
    fetchOrders,
    fetchOrderById,
    createOrder,
    confirmOrder,
    assignDeliverer,
    markInTransit,
    deliverOrder,
    cancelOrder,
    deleteOrder,
    fetchStatusCounts,
    fetchDeliverers
  } = useOrderApi();

  const [view, setView] = useState('list'); // list, create, detail
  const [filters, setFilters] = useState({
    order_status: '',
    search: '',
    page: 1
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [orderToDeliver, setOrderToDeliver] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [orderForWarehouse, setOrderForWarehouse] = useState(null);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  // Cargar pedido especifico si viene en la URL
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId).then(() => {
        setView('detail');
      });
    }
  }, [orderId]);

  // Funcion para volver a la lista y limpiar URL
  const handleBackToList = () => {
    setView('list');
    if (orderId) {
      navigate('/orders', { replace: true });
    }
  };

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    fetchStatusCounts();
    fetchDeliverers();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [filters.order_status, filters.page, debouncedSearch]);

  // Escuchar nuevos pedidos en tiempo real para auto-refrescar
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      loadOrders();
      fetchStatusCounts();
    };

    socket.on('new_order_alert', handleNewOrder);

    return () => {
      socket.off('new_order_alert', handleNewOrder);
    };
  }, [socket]);

  const loadOrders = async () => {
    await fetchOrders({
      ...filters,
      limit: 10
    });
  };

  const handleCreateOrder = async (orderData) => {
    try {
      await createOrder(orderData);
      setView('list');
      loadOrders();
      fetchStatusCounts();
      alert('Pedido creado exitosamente');
    } catch (error) {
      alert('Error al crear pedido: ' + error.message);
    }
  };

  const handleViewOrder = async (order) => {
    await fetchOrderById(order.id);
    setView('detail');
  };

  const handleConfirmOrder = async (order) => {
    if (!confirm('Confirmar este pedido?')) return;
    try {
      await confirmOrder(order.id);
      loadOrders();
      fetchStatusCounts();
      if (view === 'detail') {
        await fetchOrderById(order.id);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleOpenAssignModal = (order) => {
    setOrderToAssign(order);
    setShowAssignModal(true);
  };

  const handleAssignDeliverer = async (orderId, delivererId) => {
    try {
      await assignDeliverer(orderId, delivererId);
      setShowAssignModal(false);
      setOrderToAssign(null);
      loadOrders();
      fetchStatusCounts();
      if (view === 'detail') {
        await fetchOrderById(orderId);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleMarkInTransit = async (order) => {
    // Cargar detalles del pedido para verificar si necesita asignación de almacén
    const orderDetails = await fetchOrderById(order.id);
    const orderData = orderDetails?.data || selectedOrder;

    // Verificar si hay productos sin almacén asignado
    const detailsWithoutWarehouse = (orderData?.details || []).filter(d => !d.warehouse_id);

    if (detailsWithoutWarehouse.length > 0) {
      // Mostrar modal para seleccionar almacén
      setOrderForWarehouse(orderData);
      setShowWarehouseModal(true);
    } else {
      // Proceder directamente
      if (!confirm('Marcar pedido en camino?')) return;
      try {
        await markInTransit(order.id);
        loadOrders();
        fetchStatusCounts();
        if (view === 'detail') {
          await fetchOrderById(order.id);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleWarehouseConfirm = async (orderId, warehouseAssignments) => {
    setWarehouseLoading(true);
    try {
      await markInTransit(orderId, warehouseAssignments);
      setShowWarehouseModal(false);
      setOrderForWarehouse(null);
      loadOrders();
      fetchStatusCounts();
      if (view === 'detail') {
        await fetchOrderById(orderId);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleDeliverOrder = async (order) => {
    // Cargar los detalles completos del pedido para el modal
    await fetchOrderById(order.id);
    setOrderToDeliver(order);
    setShowDeliveryModal(true);
  };

  const handleConfirmDelivery = async (deliveryData) => {
    if (!orderToDeliver) return;

    setDeliveryLoading(true);
    try {
      // Usar repartidorService que soporta FormData con vouchers
      await repartidorService.completeDelivery(orderToDeliver.id, deliveryData);
      setShowDeliveryModal(false);
      setOrderToDeliver(null);
      loadOrders();
      fetchStatusCounts();
      if (view === 'detail') {
        await fetchOrderById(orderToDeliver.id);
      }
      alert('Pedido entregado exitosamente');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    const reason = prompt('Motivo de cancelacion:');
    if (reason === null) return;

    try {
      await cancelOrder(order.id, reason);
      loadOrders();
      fetchStatusCounts();
      if (view === 'detail') {
        await fetchOrderById(order.id);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!confirm(`¿Estás seguro de eliminar el pedido ${order.order_number}? Esta acción no se puede deshacer.`)) return;

    try {
      const result = await deleteOrder(order.id);
      loadOrders();
      fetchStatusCounts();
      if (view === 'detail') {
        setView('list');
      }
      alert(result.message || 'Pedido eliminado exitosamente');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const renderSummary = () => {
    if (!summary) return null;

    const summaryItems = [
      { key: 'CONFIRMADO', label: 'Confirmados', class: 'confirmed' },
      { key: 'ASIGNADO', label: 'Asignados', class: 'assigned' },
      { key: 'EN_CAMINO', label: 'En Camino', class: 'transit' },
      { key: 'ENTREGADO', label: 'Entregados', class: 'delivered' }
    ];

    return (
      <div className="orders-page__summary">
        {summaryItems.map(item => (
          <div key={item.key} className={`orders-page__summary-card orders-page__summary-card--${item.class}`}>
            <span className="orders-page__summary-count">{summary[item.key]?.count || 0}</span>
            <span className="orders-page__summary-label">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <h1 className="orders-page__title">Pedidos</h1>
        {view === 'list' && (
          <button
            className="orders-page__btn-new"
            onClick={() => setView('create')}
          >
            + Nuevo Pedido
          </button>
        )}
        {view !== 'list' && (
          <button
            className="orders-page__btn-back"
            onClick={handleBackToList}
          >
            Volver a Lista
          </button>
        )}
      </div>

      {view === 'list' && (
        <>
          {renderSummary()}

          <div className="orders-page__filters">
            <select
              value={filters.order_status}
              onChange={(e) => setFilters(prev => ({ ...prev, order_status: e.target.value, page: 1 }))}
              className="orders-page__filter-select"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Buscar por numero o cliente..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="orders-page__filter-input"
            />
          </div>

          <OrdersTable
            orders={orders}
            loading={loading}
            pagination={pagination}
            onView={handleViewOrder}
            onConfirm={handleConfirmOrder}
            onAssign={handleOpenAssignModal}
            onInTransit={handleMarkInTransit}
            onDeliver={handleDeliverOrder}
            onCancel={handleCancelOrder}
            onDelete={handleDeleteOrder}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {view === 'create' && (
        <OrderFormV2
          onSubmit={handleCreateOrder}
          onCancel={() => setView('list')}
          loading={loading}
        />
      )}

      {view === 'detail' && selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={handleBackToList}
          onConfirm={handleConfirmOrder}
          onAssign={handleOpenAssignModal}
          onInTransit={handleMarkInTransit}
          onDeliver={handleDeliverOrder}
          onCancel={handleCancelOrder}
        />
      )}

      {showAssignModal && orderToAssign && (
        <AssignDelivererModal
          order={orderToAssign}
          deliverers={deliverers}
          onAssign={handleAssignDeliverer}
          onClose={() => {
            setShowAssignModal(false);
            setOrderToAssign(null);
          }}
          loading={loading}
        />
      )}

      {/* Modal de entrega - usa el mismo modal que el repartidor */}
      {showDeliveryModal && (orderToDeliver || selectedOrder) && (
        <DeliveryModal
          delivery={selectedOrder || orderToDeliver}
          onConfirm={handleConfirmDelivery}
          onClose={() => {
            setShowDeliveryModal(false);
            setOrderToDeliver(null);
          }}
          loading={deliveryLoading}
          mode="delivery"
        />
      )}

      {/* Modal de selección de almacén */}
      {showWarehouseModal && orderForWarehouse && (
        <WarehouseSelectionModal
          order={orderForWarehouse}
          onConfirm={handleWarehouseConfirm}
          onClose={() => {
            setShowWarehouseModal(false);
            setOrderForWarehouse(null);
          }}
          loading={warehouseLoading}
        />
      )}
    </div>
  );
};

export default OrdersPage;
