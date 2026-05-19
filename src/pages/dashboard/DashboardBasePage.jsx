import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardApi } from '../../hooks/useApi/useDashboardApi';
import { useAuth } from '../../features/auth/useAuth';
import { useSocket } from '../../features/socket/SocketContext';
import {
  PendingOrdersWidget,
  PendingOrdersModal,
  DeliverersStatusWidget,
  StockWidget,
  ActiveOrdersTable
} from '../../components/dashboard';
import { AssignDelivererModal } from '../../components/orders/AssignDelivererModal';
import { PreRegistroList } from '../../components/preregistro';
import { BaseCreditCollectionSection } from '../../components/credits/BaseCreditCollectionSection';
import { apiClient } from '../../services/apiClient';
import './DashboardBasePage.css';

export const DashboardBasePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, playNotificationSound } = useSocket();
  const { data, pendingOrders, loading, loadingPending, error, refresh, fetchPendingCount, fetchPendingOrders } = useDashboardApi();
  const previousCount = useRef(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPreregistro, setShowPreregistro] = useState(false);
  const [showCreditCollection, setShowCreditCollection] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [deliverers, setDeliverers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (data.pendingCount > previousCount.current && previousCount.current > 0) {
      playNotificationSound();
    }
    previousCount.current = data.pendingCount;
  }, [data.pendingCount, playNotificationSound]);

  // Auto-refresh dashboard cuando llega un nuevo pedido via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      refresh();
      fetchPendingCount();
    };

    socket.on('new_order_alert', handleNewOrder);

    return () => {
      socket.off('new_order_alert', handleNewOrder);
    };
  }, [socket, refresh, fetchPendingCount]);

  const handleTestSound = () => {
    playNotificationSound();
  };

  const handleOpenPendingModal = async () => {
    setShowPendingModal(true);
    await fetchPendingOrders();
  };

  const handleClosePendingModal = () => {
    setShowPendingModal(false);
  };

  const handleConfirmOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await apiClient.put(`/orders/${orderId}/confirm`);
      await fetchPendingOrders();
      await refresh();
    } catch (err) {
      console.error('Error confirmando pedido:', err);
      alert('Error al confirmar el pedido');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssignModal = async (order) => {
    setSelectedOrderForAssign(order);
    try {
      const response = await apiClient.get('/orders/deliverers');
      setDeliverers(response.data || []);
    } catch (err) {
      console.error('Error cargando repartidores:', err);
      setDeliverers([]);
    }
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedOrderForAssign(null);
  };

  const handleAssignDeliverer = async (orderId, delivererId) => {
    setActionLoading(true);
    try {
      await apiClient.put(`/orders/${orderId}/assign`, { deliverer_id: delivererId });
      handleCloseAssignModal();
      await fetchPendingOrders();
      await refresh();
    } catch (err) {
      console.error('Error asignando repartidor:', err);
      alert('Error al asignar repartidor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleViewAllOrders = () => {
    navigate('/orders');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <div className="dashboard__error-card">
            <div className="dashboard__error-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="dashboard__error-title">Error al cargar el dashboard</h3>
            <p className="dashboard__error-message">{error}</p>
            <button onClick={refresh} className="dashboard__error-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        {/* Header */}
        <header className="dashboard__header">
          <div className="dashboard__header-content">
            <p className="dashboard__greeting">{getGreeting()}</p>
            <h1 className="dashboard__title">
              <span className="dashboard__title-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </span>
              Centro de Control
            </h1>
            <p className="dashboard__subtitle">
              {formatDate()} - Bienvenido, {user?.full_name?.split(' ')[0] || 'Usuario'}
            </p>
          </div>

          <div className="dashboard__actions">
            <div className="dashboard__time">
              <span className="dashboard__time-dot"></span>
              En vivo - {formatTime()}
            </div>
            <button
              onClick={() => setShowCreditCollection(!showCreditCollection)}
              className={`dashboard__credit-btn ${showCreditCollection ? 'dashboard__credit-btn--active' : ''}`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {showCreditCollection ? 'Ocultar Cobros' : 'Cobrar Crédito'}
            </button>
            <button
              onClick={() => setShowPreregistro(!showPreregistro)}
              className={`dashboard__preregistro-btn ${showPreregistro ? 'dashboard__preregistro-btn--active' : ''}`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {showPreregistro ? 'Ocultar Pre-registros' : 'Pre-registrar Pagos'}
            </button>
            <button onClick={refresh} className="dashboard__refresh-btn" disabled={loading}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </header>

        {/* Stats Cards - Quick Overview */}
        <div className="dashboard__stats">
          <div
            className="stat-card stat-card--warning stat-card--clickable"
            onClick={handleOpenPendingModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenPendingModal()}
            title="Clic para ver pedidos pendientes"
          >
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {data.pendingCount > 0 && (
                <span className="stat-card__trend stat-card__trend--up">Atender</span>
              )}
            </div>
            <div className="stat-card__value">{loading ? '-' : data.pendingCount}</div>
            <div className="stat-card__label">Pedidos Pendientes</div>
            {data.pendingCount > 0 && (
              <div className="stat-card__action-hint">Clic para ver detalles</div>
            )}
          </div>

          <div className="stat-card stat-card--info">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="stat-card__value">{loading ? '-' : data.activeOrders?.length || 0}</div>
            <div className="stat-card__label">Pedidos Activos</div>
          </div>

          <div className="stat-card stat-card--success">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-card__value">{loading ? '-' : data.deliverers?.length || 0}</div>
            <div className="stat-card__label">Repartidores Activos</div>
          </div>

          <div className="stat-card stat-card--danger">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {data.stock?.length > 0 && (
                <span className="stat-card__trend stat-card__trend--down">Alerta</span>
              )}
            </div>
            <div className="stat-card__value">{loading ? '-' : data.stock?.length || 0}</div>
            <div className="stat-card__label">Productos Stock Bajo</div>
          </div>
        </div>

        {/* Widgets Row */}
        <div className="dashboard__widgets">
          <PendingOrdersWidget
            count={data.pendingCount}
            onTest={handleTestSound}
            onClick={handleOpenPendingModal}
            loading={loading}
          />
          <DeliverersStatusWidget
            deliverers={data.deliverers}
            loading={loading}
          />
          <StockWidget
            products={data.stock}
            warehouseName="Almacen Principal"
            loading={loading}
          />
        </div>

        {/* Sección de Cobros de Crédito */}
        {showCreditCollection && (
          <div className="dashboard__credit-section">
            <BaseCreditCollectionSection
              onSuccess={() => {
                refresh();
              }}
            />
          </div>
        )}

        {/* Seccion de Pre-registro de Pagos */}
        {showPreregistro && (
          <div className="dashboard__preregistro-section">
            <PreRegistroList
              onSuccess={() => {
                refresh();
              }}
            />
          </div>
        )}

        {/* Active Orders Table */}
        <ActiveOrdersTable
          orders={data.activeOrders}
          onView={handleViewOrder}
          onViewAll={handleViewAllOrders}
          loading={loading}
        />
      </div>

      {/* Modal de Pedidos Pendientes */}
      {showPendingModal && (
        <PendingOrdersModal
          orders={pendingOrders}
          onClose={handleClosePendingModal}
          onConfirm={handleConfirmOrder}
          onAssign={handleOpenAssignModal}
          loading={loadingPending || actionLoading}
        />
      )}

      {/* Modal de Asignar Repartidor */}
      {showAssignModal && selectedOrderForAssign && (
        <AssignDelivererModal
          order={selectedOrderForAssign}
          deliverers={deliverers}
          onAssign={handleAssignDeliverer}
          onClose={handleCloseAssignModal}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default DashboardBasePage;
