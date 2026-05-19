// ============================================================
// APP - Componente principal con AuthProvider, NotificationProvider y SocketProvider
// ============================================================
import { AuthProvider } from './features/auth';
import { NotificationProvider } from './features/notifications';
import { SocketProvider } from './features/socket';
import { AppRoutes } from './routes/AppRoutes';
import ArrivalNotificationWrapper from './components/common/ArrivalNotificationWrapper';
import NewOrderAlertModal from './components/common/NewOrderAlertModal';
import NewMaintenanceAlertModal from './components/common/NewMaintenanceAlertModal';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AppRoutes />
          <ArrivalNotificationWrapper />
          <NewOrderAlertModal />
          <NewMaintenanceAlertModal />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
