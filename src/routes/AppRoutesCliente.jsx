// ============================================================
// APP ROUTES CLIENTE - Rutas exclusivas del APK móvil
// Roles soportados: CLIENTE (/portal/*) y REPARTIDOR (/repartidor/*)
// ============================================================
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { PortalLayout } from '../components/layout/PortalLayout';
import { MainLayout } from '../components/layout/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { usePushNotifications } from '../features/notifications/usePushNotifications';

// Portal CLIENTE
import { PortalHomePage } from '../pages/portal/PortalHomePage';
import { CreateOrderPage } from '../pages/portal/CreateOrderPage';
import { MyOrdersPage } from '../pages/portal/MyOrdersPage';
import { OrderDetailPage } from '../pages/portal/OrderDetailPage';
import { MyLoansPage } from '../pages/portal/MyLoansPage';
import { MyGanagasPage } from '../pages/portal/MyGanagasPage';
import { MyReferralsPage } from '../pages/portal/MyReferralsPage';
import { NotificationsPage } from '../pages/portal/NotificationsPage';
import { ProfilePage } from '../pages/portal/ProfilePage';
import { OsinergminPage as PortalOsinergminPage } from '../pages/portal/OsinergminPage';

// Módulo REPARTIDOR
import { RepartidorPage } from '../pages/repartidor/RepartidorPage';
import { RepartidorEntregasPage } from '../pages/repartidor/RepartidorEntregasPage';
import { RepartidorCobrosPage } from '../pages/repartidor/RepartidorCobrosPage';
import { RepartidorMantenimientoPage } from '../pages/repartidor/RepartidorMantenimientoPage';
import { RepartidorCajaPage } from '../pages/repartidor/RepartidorCajaPage';
import { RepartidorNotificacionesPage } from '../pages/repartidor/RepartidorNotificacionesPage';

const UnauthorizedPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ color: '#dc2626' }}>Acceso Denegado</h1>
    <p>Esta aplicación es exclusiva para clientes y repartidores.</p>
    <a href="#/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>
      Ir al login
    </a>
  </div>
);

const portalRoute = (element) => (
  <ProtectedRoute roles={['CLIENTE']}>
    <PortalLayout>{element}</PortalLayout>
  </ProtectedRoute>
);

const repartidorRoute = (element) => (
  <ProtectedRoute roles={['REPARTIDOR']}>
    <MainLayout>{element}</MainLayout>
  </ProtectedRoute>
);

const PushRouterBridge = () => {
  const navigate = useNavigate();
  usePushNotifications({
    onNavigate: (target) => {
      if (typeof target === 'string' && target.startsWith('/')) {
        navigate(target);
      }
    }
  });
  return null;
};

export const AppRoutesCliente = () => {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PushRouterBridge />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Portal CLIENTE */}
        <Route path="/portal" element={portalRoute(<PortalHomePage />)} />
        <Route path="/portal/create-order" element={portalRoute(<CreateOrderPage />)} />
        <Route path="/portal/orders" element={portalRoute(<MyOrdersPage />)} />
        <Route path="/portal/orders/:orderId" element={portalRoute(<OrderDetailPage />)} />
        <Route path="/portal/loans" element={portalRoute(<MyLoansPage />)} />
        <Route path="/portal/ganagas" element={portalRoute(<MyGanagasPage />)} />
        <Route path="/portal/referrals" element={portalRoute(<MyReferralsPage />)} />
        <Route path="/portal/notifications" element={portalRoute(<NotificationsPage />)} />
        <Route path="/portal/profile" element={portalRoute(<ProfilePage />)} />
        <Route path="/portal/osinergmin" element={portalRoute(<PortalOsinergminPage />)} />

        {/* Módulo REPARTIDOR */}
        <Route path="/repartidor" element={repartidorRoute(<RepartidorPage />)} />
        <Route path="/repartidor/entregas" element={repartidorRoute(<RepartidorEntregasPage />)} />
        <Route path="/repartidor/cobros" element={repartidorRoute(<RepartidorCobrosPage />)} />
        <Route path="/repartidor/mantenimiento" element={repartidorRoute(<RepartidorMantenimientoPage />)} />
        <Route path="/repartidor/caja" element={repartidorRoute(<RepartidorCajaPage />)} />
        <Route path="/repartidor/notificaciones" element={repartidorRoute(<RepartidorNotificacionesPage />)} />

        {/* Pedidos compartidos con módulo REPARTIDOR (navega desde RepartidorPage/Entregas) */}
        <Route path="/orders" element={repartidorRoute(<RepartidorEntregasPage />)} />
        <Route path="/orders/:id" element={repartidorRoute(<RepartidorEntregasPage />)} />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
};
