import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepartidorApi } from '../../hooks/useApi/useRepartidorApi';
import { DeliveryCard, DeliveryModal } from '../../components/repartidor';
import { WarehouseSelectionModal } from '../../components/orders/WarehouseSelectionModal';
import './RepartidorEntregas.css';

// SVG Icons
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1z"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ClipboardListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const DollarSignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const CalendarClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <circle cx="12" cy="15" r="2"/>
    <path d="M12 13v-1"/>
  </svg>
);

/**
 * Formatea la fecha/hora de registro en zona horaria de Lima, Perú
 * Muestra: DD/MM/YYYY HH:MM:SS
 * Funciona correctamente tanto en local como en producción (Railway)
 */
const formatRegistrationDateTime = (dateString) => {
  if (!dateString) return 'Sin fecha';

  try {
    const date = new Date(dateString);

    // Formatear en zona horaria de Lima, Perú
    const options = {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('es-PE', options);
    const parts = formatter.formatToParts(date);

    // Construir fecha en formato DD/MM/YYYY HH:MM:SS
    const getPart = (type) => parts.find(p => p.type === type)?.value || '00';

    return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

export const RepartidorEntregasPage = () => {
  const navigate = useNavigate();
  const {
    myDeliveries,
    availableOrders,
    loading,
    fetchMyDeliveries,
    fetchAvailableOrders,
    selfAssignOrder,
    startDelivery,
    markArrived,
    completeDelivery
  } = useRepartidorApi();
  const [filter, setFilter] = useState('all');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [availableExpanded, setAvailableExpanded] = useState(true);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [orderForWarehouse, setOrderForWarehouse] = useState(null);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  useEffect(() => {
    loadDeliveries();
    loadAvailableOrders();
  }, []);

  const loadDeliveries = async () => {
    try {
      await fetchMyDeliveries(null);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      await fetchAvailableOrders();
    } catch (error) {
      console.error('Error loading available orders:', error);
    }
  };

  const handleSelfAssign = async (orderId) => {
    setAssigningOrderId(orderId);
    try {
      const result = await selfAssignOrder(orderId);
      if (result.success) {
        alert('Pedido asignado correctamente. Ya puedes iniciar la entrega.');
        await loadAvailableOrders();
        await loadDeliveries();
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      alert('Error al asignar pedido: ' + error.message);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleStartDelivery = async (orderId) => {
    // Buscar el pedido en las entregas para verificar si tiene productos sin almacén
    const allDeliveriesList = myDeliveries || [];
    const order = allDeliveriesList.find(d => d.id === orderId);

    if (order) {
      // Verificar si hay productos sin almacén asignado
      const detailsWithoutWarehouse = (order.details || []).filter(d => !d.warehouse_id);

      if (detailsWithoutWarehouse.length > 0) {
        // Mostrar modal para seleccionar almacén
        setOrderForWarehouse(order);
        setShowWarehouseModal(true);
        return;
      }
    }

    // Proceder directamente si todos tienen almacén
    try {
      await startDelivery(orderId);
      await loadDeliveries();
    } catch (error) {
      console.error('Error starting delivery:', error);
      alert('Error al iniciar entrega: ' + error.message);
    }
  };

  const handleWarehouseConfirm = async (orderId, warehouseAssignments) => {
    setWarehouseLoading(true);
    try {
      await startDelivery(orderId, warehouseAssignments);
      setShowWarehouseModal(false);
      setOrderForWarehouse(null);
      await loadDeliveries();
    } catch (error) {
      console.error('Error starting delivery with warehouse:', error);
      alert('Error al iniciar entrega: ' + error.message);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleMarkArrived = async (orderId) => {
    setArrivedLoading(true);
    try {
      const result = await markArrived(orderId);
      if (result.success) {
        alert('Cliente notificado exitosamente');
        await loadDeliveries();
      }
    } catch (error) {
      console.error('Error marking arrived:', error);
      alert('Error al notificar llegada: ' + error.message);
    } finally {
      setArrivedLoading(false);
    }
  };

  const handleOpenDeliveryModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryModal(true);
  };

  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedDelivery(null);
  };

  const handleConfirmDelivery = async (deliveryData) => {
    if (!selectedDelivery) return;

    setCompleting(true);
    try {
      await completeDelivery(selectedDelivery.id, deliveryData);
      await loadDeliveries();
      handleCloseDeliveryModal();
      alert('Entrega registrada correctamente');
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert('Error al completar entrega: ' + error.message);
    } finally {
      setCompleting(false);
    }
  };

  // Separar entregas activas de completadas
  const allDeliveries = myDeliveries || [];
  const activeDeliveries = allDeliveries.filter(d =>
    (d.order_status || d.status) === 'ASIGNADO' || (d.order_status || d.status) === 'EN_CAMINO'
  );
  const completedDeliveries = allDeliveries.filter(d =>
    (d.order_status || d.status) === 'ENTREGADO'
  );

  // Filtrar entregas activas según el filtro seleccionado
  const filteredActiveDeliveries = filter === 'all'
    ? activeDeliveries
    : activeDeliveries.filter(d => (d.order_status || d.status) === filter);

  // Calculate counts for filter badges (solo entregas activas)
  const counts = {
    all: activeDeliveries.length,
    ASIGNADO: activeDeliveries.filter(d => (d.order_status || d.status) === 'ASIGNADO').length,
    EN_CAMINO: activeDeliveries.filter(d => (d.order_status || d.status) === 'EN_CAMINO').length
  };

  const filterConfig = [
    { key: 'all', label: 'Todas', class: 'all' },
    { key: 'ASIGNADO', label: 'Asignadas', class: 'assigned' },
    { key: 'EN_CAMINO', label: 'En Camino', class: 'onway' }
  ];

  return (
    <div className="entregas-page">
      <div className="entregas-page__container">
        {/* Header */}
        <header className="entregas-page__header">
          <button
            onClick={() => navigate('/repartidor')}
            className="entregas-page__back-btn"
          >
            <ArrowLeftIcon />
            <span>Volver al panel</span>
          </button>

          <div className="entregas-page__header-content">
            <div className="entregas-page__title-wrapper">
              <div className="entregas-page__title-icon">
                <TruckIcon />
              </div>
              <div>
                <h1 className="entregas-page__title">Mis Entregas</h1>
                <p className="entregas-page__subtitle">Gestiona tus pedidos asignados</p>
              </div>
            </div>

            <div className="entregas-page__counter">
              <span>Total de entregas</span>
              <span className="entregas-page__counter-badge">{counts.all}</span>
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="entregas-page__filters">
          <div className="entregas-page__filter-list">
            {filterConfig.map(({ key, label, class: className }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`entregas-page__filter-btn entregas-page__filter-btn--${className} ${
                  filter === key ? 'entregas-page__filter-btn--active' : ''
                }`}
              >
                <span>{label}</span>
                <span className="entregas-page__filter-count">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seccion de Pedidos Disponibles para Autoasignacion */}
        {!loading && availableOrders && availableOrders.length > 0 && (
          <div className="entregas-page__available">
            <button
              className={`entregas-page__available-header ${availableExpanded ? 'entregas-page__available-header--expanded' : ''}`}
              onClick={() => setAvailableExpanded(!availableExpanded)}
            >
              <div className="entregas-page__available-title">
                <div className="entregas-page__available-icon">
                  <ClipboardListIcon />
                </div>
                <div>
                  <h2>Pedidos Disponibles</h2>
                  <p>Selecciona un pedido para asignartelo</p>
                </div>
              </div>
              <div className="entregas-page__available-badge">
                <PackageIcon />
                <span>{availableOrders.length} disponible{availableOrders.length !== 1 ? 's' : ''}</span>
                <span className={`entregas-page__available-chevron ${availableExpanded ? 'entregas-page__available-chevron--open' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </div>
            </button>

            {availableExpanded && (
              <div className="entregas-page__available-list">
                {availableOrders.map((order) => {
                  const details = order.details || [];
                  const totalItems = details.reduce((sum, d) => sum + d.quantity, 0);
                  const isAssigning = assigningOrderId === order.id;

                  return (
                    <div key={order.id} className="available-order-card">
                      <div className="available-order-card__status-bar"></div>
                      <div className="available-order-card__content">
                        {/* Header */}
                        <div className="available-order-card__header">
                          <div className="available-order-card__order-info">
                            <div className="available-order-card__order-icon">
                              <PackageIcon />
                            </div>
                            <div className="available-order-card__order-details">
                              <h3 className="available-order-card__order-number">{order.order_number}</h3>
                              <p className="available-order-card__customer-name">{order.customer_name}</p>
                              {order.order_datetime && (
                                <p className="available-order-card__registration-date">
                                  <CalendarClockIcon />
                                  <span>{formatRegistrationDateTime(order.order_datetime)}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="available-order-card__badge">
                            <span className="available-order-card__badge-dot"></span>
                            Disponible
                          </span>
                        </div>

                        {/* Info */}
                        <div className="available-order-card__info">
                          <div className="available-order-card__info-item available-order-card__info-item--full">
                            <div className="available-order-card__info-icon">
                              <MapPinIcon />
                            </div>
                            <div className="available-order-card__info-content">
                              <span className="available-order-card__info-label">Direccion</span>
                              <span className="available-order-card__info-value">{order.delivery_address}</span>
                            </div>
                          </div>
                          <div className="available-order-card__info-item">
                            <div className="available-order-card__info-icon">
                              <PhoneIcon />
                            </div>
                            <div className="available-order-card__info-content">
                              <span className="available-order-card__info-label">Telefono</span>
                              <span className="available-order-card__info-value">{order.customer_phone || '-'}</span>
                            </div>
                          </div>
                          <div className="available-order-card__info-item">
                            <div className="available-order-card__info-icon">
                              <DollarSignIcon />
                            </div>
                            <div className="available-order-card__info-content">
                              <span className="available-order-card__info-label">Total</span>
                              <span className="available-order-card__info-value available-order-card__info-value--highlight">
                                S/{parseFloat(order.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Products */}
                        {details.length > 0 && (
                          <div className="available-order-card__products">
                            <div className="available-order-card__products-header">
                              <span className="available-order-card__products-title">
                                <ShoppingBagIcon />
                                Productos
                              </span>
                              <span className="available-order-card__products-count">{totalItems} items</span>
                            </div>
                            <div className="available-order-card__products-list">
                              {details.map((detail, idx) => (
                                <div key={idx} className={`available-order-card__product-item ${detail.includes_container ? 'available-order-card__product-item--container' : ''}`}>
                                  <div className="available-order-card__product-name-wrapper">
                                    <span className="available-order-card__product-name">{detail.product_name}</span>
                                    {detail.includes_container && (
                                      <span className="container-sale-badge">Venta con Envase</span>
                                    )}
                                  </div>
                                  <span className="available-order-card__product-qty">x{detail.quantity}</span>
                                </div>
                              ))}
                            </div>
                            {details.some(d => d.includes_container) && (
                              <div className="container-sale-notice">
                                <span className="container-sale-notice__icon">&#9432;</span>
                                <span>Sin devolucion de envase vacio</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="available-order-card__actions">
                          <button
                            className={`available-order-card__btn available-order-card__btn--assign ${isAssigning ? 'available-order-card__btn--assigning' : ''}`}
                            onClick={() => handleSelfAssign(order.id)}
                            disabled={isAssigning}
                          >
                            <UserPlusIcon />
                            {isAssigning ? 'Asignando...' : 'Tomar este pedido'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content - Entregas Activas */}
        {loading ? (
          <div className="entregas-page__loading">
            <div className="entregas-page__spinner"></div>
            <p className="entregas-page__loading-text">Cargando entregas...</p>
          </div>
        ) : filteredActiveDeliveries.length === 0 ? (
          <div className="entregas-page__empty">
            <div className="entregas-page__empty-icon">
              <PackageIcon />
            </div>
            <h2 className="entregas-page__empty-title">No hay entregas pendientes</h2>
            <p className="entregas-page__empty-text">
              {filter === 'all'
                ? 'No tienes entregas asignadas en este momento'
                : `No hay entregas con estado: ${filterConfig.find(f => f.key === filter)?.label || filter}`}
            </p>
          </div>
        ) : (
          <div className="entregas-page__list">
            {filteredActiveDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onStart={handleStartDelivery}
                onArrived={handleMarkArrived}
                onComplete={handleOpenDeliveryModal}
              />
            ))}
          </div>
        )}

        {/* Historial de Rutas - Entregas Completadas */}
        {!loading && completedDeliveries.length > 0 && (
          <div className="entregas-page__history">
            <button
              className={`entregas-page__history-header ${historyExpanded ? 'entregas-page__history-header--expanded' : ''}`}
              onClick={() => setHistoryExpanded(!historyExpanded)}
            >
              <div className="entregas-page__history-title">
                <div className="entregas-page__history-icon">
                  <HistoryIcon />
                </div>
                <div>
                  <h2>Historial de Rutas</h2>
                  <p>Entregas completadas del día</p>
                </div>
              </div>
              <div className="entregas-page__history-badge">
                <CheckCircleIcon />
                <span>{completedDeliveries.length} completada{completedDeliveries.length !== 1 ? 's' : ''}</span>
                <span className={`entregas-page__history-chevron ${historyExpanded ? 'entregas-page__history-chevron--open' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </div>
            </button>

            {historyExpanded && (
              <div className="entregas-page__history-list">
                {completedDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onStart={handleStartDelivery}
                    onArrived={handleMarkArrived}
                    onComplete={handleOpenDeliveryModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Entrega */}
        {showDeliveryModal && selectedDelivery && (
          <DeliveryModal
            delivery={selectedDelivery}
            onConfirm={handleConfirmDelivery}
            onClose={handleCloseDeliveryModal}
            loading={completing}
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
    </div>
  );
};
