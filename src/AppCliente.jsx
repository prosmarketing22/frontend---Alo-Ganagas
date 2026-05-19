// ============================================================
// APP CLIENTE - Versión móvil (APK Capacitor) para roles CLIENTE y REPARTIDOR
// ============================================================
import { useEffect } from 'react';
import { AuthProvider } from './features/auth';
import { useAuth } from './features/auth/useAuth';
import { NotificationProvider } from './features/notifications';
import { SocketProvider } from './features/socket';
import { AppRoutesCliente } from './routes/AppRoutesCliente';
import ArrivalNotificationWrapper from './components/common/ArrivalNotificationWrapper';
import './styles/global.css';

const ALLOWED_MOBILE_ROLES = ['CLIENTE', 'REPARTIDOR'];

// Bloquea cuentas no autorizadas para móvil: solo CLIENTE y REPARTIDOR tienen
// rutas en el APK. GERENTE/BASE caerían en loop, así que cerramos su sesión.
const MobileRoleGuard = ({ children }) => {
  const { user, getUserRole, logout } = useAuth();

  useEffect(() => {
    if (user && !ALLOWED_MOBILE_ROLES.includes(getUserRole())) {
      alert('Esta aplicación es exclusiva para clientes y repartidores. Usa la versión web para tu cuenta.');
      logout();
    }
  }, [user, getUserRole, logout]);

  return children;
};

function AppCliente() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <MobileRoleGuard>
            <AppRoutesCliente />
            <ArrivalNotificationWrapper />
          </MobileRoleGuard>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default AppCliente;
