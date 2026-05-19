import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { BalanceCard } from '../../components/portal/BalanceCard';
import { DebtCard } from '../../components/portal/DebtCard';
import { SummaryCard } from '../../components/portal/SummaryCard';
import { OrderTimeline } from '../../components/portal/OrderTimeline';
import { MaintenanceButton } from '../../components/portal/MaintenanceButton';
import { WaysToEarnSection } from '../../components/portal/WaysToEarnSection';
import logo from '../../assets/logo.png';
import './PortalHomePage.css';

const CartIcon = () => (
  <svg className="portal-home__action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const WrenchIcon = () => (
  <svg className="portal-home__action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="portal-home__action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="portal-home__section-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

export const PortalHomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getSummary, requestMaintenance } = usePortalApi();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setError(null);
      const data = await getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
      if (error.message?.includes('Cliente no encontrado')) {
        setError('customer_not_found');
      } else {
        setError('general');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getFirstName = () => {
    const fullName = user?.full_name || 'Cliente';
    return fullName.split(' ')[0];
  };

  if (loading) {
    return (
      <div className="portal-home">
        <div className="portal-home__loading">
          <div className="portal-home__loading-spinner" />
          <span>Cargando tu portal...</span>
        </div>
      </div>
    );
  }

  if (error === 'customer_not_found') {
    return (
      <div className="portal-home">
        <div className="portal-home__error">
          <div className="portal-home__error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="portal-home__error-title">Cuenta no configurada</h2>
          <p className="portal-home__error-text">
            Tu cuenta de usuario no esta asociada a un perfil de cliente.
            Por favor, contacta a soporte para completar tu registro.
          </p>
          <div className="portal-home__error-contact">
            <p>Telefono: <strong>987 654 321</strong></p>
            <p>WhatsApp: <strong>987 654 321</strong></p>
          </div>
          <button className="portal-home__error-btn" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  if (error === 'general') {
    return (
      <div className="portal-home">
        <div className="portal-home__error">
          <div className="portal-home__error-icon portal-home__error-icon--warning">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="portal-home__error-title">Error de conexion</h2>
          <p className="portal-home__error-text">
            No pudimos cargar tu informacion. Por favor, intenta nuevamente.
          </p>
          <button className="portal-home__error-btn portal-home__error-btn--retry" onClick={loadSummary}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-home">
      {/* === SALUDO === */}
      <section className="portal-home__welcome">
        {/* Desktop: saludo con hora del dia */}
        <h1 className="portal-home__greeting portal-home__desktop">
          {getGreeting()}, {user?.full_name}
        </h1>
        {/* Mobile: "Hola, Nombre" */}
        <h1 className="portal-home__greeting portal-home__mobile">
          Hola, {getFirstName()}
        </h1>
        <p className="portal-home__subtitle portal-home__desktop">
          Bienvenido a tu portal de cliente
        </p>
        <p className="portal-home__subtitle portal-home__mobile">
          Bienvenido(a) a tu portal ALO GANAGAS
        </p>
      </section>

      {/* === MI BILLETERA GANAGAS === */}
      <section className="portal-home__section">
        <BalanceCard balance={summary?.balance || 0} />
      </section>

      {/* === TIENES PENDIENTES === */}
      <section className="portal-home__section">
        <DebtCard
          pendingDebt={summary?.pending_debt || 0}
          pendingGasBalloons={summary?.pending_gas_balloons || 0}
          pendingWaterContainers={summary?.pending_water_containers || 0}
          onItemClick={(type) => {
            if (type === 'money') navigate('/portal/orders');
            else navigate('/portal/loans');
          }}
        />
      </section>

      {/* === SUMMARY CARDS - Solo desktop === */}
      <div className="portal-home__stats portal-home__desktop">
        <SummaryCard title="Pedidos Totales" value={summary?.total_orders || 0} icon="📦" color="blue" />
        <SummaryCard title="Referidos" value={summary?.total_referrals || 0} icon="👥" color="green" />
        <SummaryCard title="Envases Pendientes" value={summary?.pending_loans || 0} icon="🧊" color="orange" />
        <SummaryCard title="Notificaciones" value={summary?.unread_notifications || 0} icon="🔔" color="purple" />
      </div>

      {/* === ULTIMO PEDIDO === */}
      {summary?.last_order && (
        <section className="portal-home__section">
          <div className="portal-home__section-header">
            <ShoppingBagIcon />
            <h2 className="portal-home__section-title">Ultimo Pedido</h2>
          </div>
          <div className="portal-home__order-card">
            <div className="portal-home__order-header">
              <span className="portal-home__order-number">
                Pedido #{summary.last_order.id}
              </span>
              <span className="portal-home__order-date">
                {new Date(summary.last_order.created_at).toLocaleDateString('es-PE')}
              </span>
            </div>
            <OrderTimeline currentStatus={summary.last_order.status} />
            <button
              className="portal-home__view-order"
              onClick={() => navigate(`/portal/orders/${summary.last_order.id}`)}
            >
              Ver Detalle
            </button>
          </div>
        </section>
      )}

      {/* === ACCIONES DESKTOP: CTA + MaintenanceButton === */}
      <div className="portal-home__actions-desktop portal-home__desktop">
        <button
          className="portal-home__cta"
          onClick={() => navigate('/portal/create-order')}
        >
          <span className="portal-home__cta-icon">🛒</span>
          Hacer un Pedido
        </button>
        <MaintenanceButton
          onRequest={requestMaintenance}
          canRequest={summary?.can_request_maintenance || false}
          currentOrders={summary?.maintenance_purchase_count || 0}
          requiredOrders={summary?.orders_required_for_maintenance || 12}
          lastMaintenanceDate={summary?.last_maintenance_date}
        />
      </div>

      {/* === ACCIONES MOBILE: Tarjetas en grid === */}
      <section className="portal-home__actions-mobile portal-home__mobile">
        <button
          className="portal-home__action-card"
          onClick={() => navigate('/portal/create-order')}
        >
          <div className="portal-home__action-icon-wrapper portal-home__action-icon-wrapper--blue">
            <CartIcon />
          </div>
          <span className="portal-home__action-label">Hacer Pedido</span>
        </button>

        <MaintenanceButton
          onRequest={requestMaintenance}
          canRequest={summary?.can_request_maintenance || false}
          currentOrders={summary?.maintenance_purchase_count || 0}
          requiredOrders={summary?.orders_required_for_maintenance || 12}
          lastMaintenanceDate={summary?.last_maintenance_date}
          renderTrigger={({ onClick }) => (
            <button className="portal-home__action-card" onClick={onClick}>
              <div className="portal-home__action-icon-wrapper portal-home__action-icon-wrapper--amber">
                <WrenchIcon />
              </div>
              <span className="portal-home__action-label">Solicitar<br />Mantenimiento</span>
            </button>
          )}
        />
      </section>

      {/* === INVITAR Y GANAR - Solo mobile === */}
      <section className="portal-home__section portal-home__mobile">
        <button
          className="portal-home__invite-card"
          onClick={() => navigate('/portal/referrals')}
        >
          <div className="portal-home__invite-icon-wrapper">
            <UsersIcon />
          </div>
          <span className="portal-home__invite-label">Invitar y Ganar</span>
          <div className="portal-home__invite-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </section>

      {/* === PROGRAMA DE RECOMPENSAS === */}
      <WaysToEarnSection />

      {/* === FOOTER - Solo mobile === */}
      <footer className="portal-home__footer portal-home__mobile">
        <img src={logo} alt="Alo Ganagas" className="portal-home__footer-logo" />
        <span className="portal-home__footer-ruc">R.U.C. 20606723262</span>
      </footer>
    </div>
  );
};
