import { useState, useEffect, useCallback } from 'react';
import { useOrderApi } from '../../hooks/useApi/useOrderApi';
import { DeliveryModal } from '../repartidor/DeliveryModal';
import './PreRegistroList.css';

const METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
  FISE: 'FISE',
  VALE_FISE: 'FISE',
  CREDITO: 'Credito',
  MIXTO: 'Pago Mixto'
};

/**
 * Componente que lista pedidos disponibles para pre-registro
 * y permite a gerentes/base registrar pagos e intercambios
 */
export const PreRegistroList = ({ onSuccess }) => {
  const {
    ordersForPreregistration,
    loading,
    fetchOrdersForPreregistration,
    preregisterPaymentAndExchange,
    fetchDeliverers,
    deliverers
  } = useOrderApi();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [filterDeliverer, setFilterDeliverer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchOrdersForPreregistration({
          deliverer_id: filterDeliverer || undefined,
          search: searchTerm || undefined
        }),
        fetchDeliverers()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, [fetchOrdersForPreregistration, fetchDeliverers, filterDeliverer, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrdersForPreregistration({
        deliverer_id: filterDeliverer || undefined,
        search: searchTerm || undefined
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterDeliverer, fetchOrdersForPreregistration]);

  const handleOpenPreregistro = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleConfirmPreregistro = async (preregisterData) => {
    if (!selectedOrder) return;

    setProcessingId(selectedOrder.id);
    try {
      const result = await preregisterPaymentAndExchange(selectedOrder.id, preregisterData);
      if (result.success) {
        handleCloseModal();
        loadData();
        if (onSuccess) {
          onSuccess(result);
        }
        alert('Pre-registro realizado exitosamente. El repartidor ha sido notificado.');
      } else {
        alert(result.message || 'Error al realizar el pre-registro');
      }
    } catch (error) {
      console.error('Error en pre-registro:', error);
      alert(error.message || 'Error al realizar el pre-registro');
    } finally {
      setProcessingId(null);
    }
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

  if (loading && ordersForPreregistration.length === 0) {
    return (
      <div className="preregistro-list__loading">
        <div className="preregistro-list__spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="preregistro-list">
      <div className="preregistro-list__header">
        <h3 className="preregistro-list__title">
          Pedidos para Pre-registro
          <span className="preregistro-list__badge">{ordersForPreregistration.length}</span>
        </h3>
        <p className="preregistro-list__subtitle">
          Registra pagos e intercambios de pedidos asignados a repartidores
        </p>
      </div>

      {/* Filtros */}
      <div className="preregistro-list__filters">
        <div className="preregistro-list__filter-group">
          <input
            type="text"
            className="preregistro-list__search"
            placeholder="Buscar por # pedido o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="preregistro-list__filter-group">
          <select
            className="preregistro-list__select"
            value={filterDeliverer}
            onChange={(e) => setFilterDeliverer(e.target.value)}
          >
            <option value="">Todos los repartidores</option>
            {deliverers.map(d => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
        </div>
        <button
          className="preregistro-list__refresh"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? '...' : '↻'}
        </button>
      </div>

      {/* Lista de pedidos */}
      {ordersForPreregistration.length === 0 ? (
        <div className="preregistro-list__empty">
          <div className="preregistro-list__empty-icon">📋</div>
          <p>No hay pedidos disponibles para pre-registro</p>
          <span>Los pedidos deben estar ASIGNADOS o EN_CAMINO</span>
        </div>
      ) : (
        <div className="preregistro-list__items">
          {ordersForPreregistration.map(order => (
            <div
              key={order.id}
              className={`preregistro-list__item ${
                order.has_payment_preregistered || order.has_exchange_preregistered
                  ? 'preregistro-list__item--preregistered'
                  : ''
              }`}
            >
              <div className="preregistro-list__item-header">
                <div className="preregistro-list__item-info">
                  <span className="preregistro-list__order-number">{order.order_number}</span>
                  <span className={`preregistro-list__status preregistro-list__status--${order.order_status.toLowerCase()}`}>
                    {order.order_status}
                  </span>
                  {(order.has_payment_preregistered || order.has_exchange_preregistered) && (
                    <span className="preregistro-list__preregistered-badge">
                      ✓ Pre-registrado
                    </span>
                  )}
                </div>
                <span className="preregistro-list__total">S/ {parseFloat(order.total).toFixed(2)}</span>
              </div>

              <div className="preregistro-list__item-body">
                <div className="preregistro-list__item-row">
                  <span className="preregistro-list__item-label">Cliente:</span>
                  <span className="preregistro-list__item-value">{order.customer_name}</span>
                </div>
                <div className="preregistro-list__item-row">
                  <span className="preregistro-list__item-label">Repartidor:</span>
                  <span className="preregistro-list__item-value preregistro-list__item-value--deliverer">
                    {order.deliverer_name || 'No asignado'}
                  </span>
                </div>
                <div className="preregistro-list__item-row">
                  <span className="preregistro-list__item-label">Metodo pago:</span>
                  <span className="preregistro-list__item-value">
                    {METHOD_LABELS[order.payment_method] || order.payment_method}
                  </span>
                </div>
                <div className="preregistro-list__item-row">
                  <span className="preregistro-list__item-label">Fecha pedido:</span>
                  <span className="preregistro-list__item-value">{formatDateTime(order.order_datetime)}</span>
                </div>
              </div>

              {/* Mostrar info de pre-registro existente */}
              {order.payment_preregistered_by_name && (
                <div className="preregistro-list__preregistered-info">
                  <span className="preregistro-list__preregistered-label">Pre-registrado por:</span>
                  <span className="preregistro-list__preregistered-value">
                    {order.payment_preregistered_by_name}
                  </span>
                </div>
              )}

              {/* Productos */}
              <div className="preregistro-list__products">
                {(order.details || []).slice(0, 3).map((detail, idx) => (
                  <span key={idx} className="preregistro-list__product-tag">
                    {detail.quantity}x {detail.product_name?.substring(0, 20)}
                    {detail.is_exchange && ' 🔄'}
                  </span>
                ))}
                {(order.details || []).length > 3 && (
                  <span className="preregistro-list__product-more">
                    +{order.details.length - 3} mas
                  </span>
                )}
              </div>

              <div className="preregistro-list__item-actions">
                <button
                  className="preregistro-list__btn preregistro-list__btn--preregister"
                  onClick={() => handleOpenPreregistro(order)}
                  disabled={processingId === order.id}
                >
                  {processingId === order.id ? 'Procesando...' :
                    (order.has_payment_preregistered || order.has_exchange_preregistered)
                      ? 'Editar Pre-registro'
                      : 'Pre-registrar Pago'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de pre-registro - usa el mismo DeliveryModal que el repartidor */}
      {showModal && selectedOrder && (
        <DeliveryModal
          delivery={selectedOrder}
          onConfirm={handleConfirmPreregistro}
          onClose={handleCloseModal}
          loading={processingId === selectedOrder.id}
          mode="preregister"
        />
      )}
    </div>
  );
};

export default PreRegistroList;
