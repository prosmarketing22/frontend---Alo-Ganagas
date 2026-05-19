// ============================================================
// ARRIVAL NOTIFICATION WRAPPER - Conecta el contexto de Socket con el Toast
// ============================================================
import { useSocket } from '../../features/socket';
import ArrivalToast from './ArrivalToast';

const ArrivalNotificationWrapper = () => {
  const { arrivalNotifications, dismissArrivalNotification } = useSocket();

  return (
    <ArrivalToast
      notifications={arrivalNotifications}
      onDismiss={dismissArrivalNotification}
    />
  );
};

export default ArrivalNotificationWrapper;
