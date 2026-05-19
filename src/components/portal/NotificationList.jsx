import './NotificationList.css';

const notificationIcons = {
  PEDIDO: '📦',
  GANAGAS: '💰',
  ALERTA: '⚠️',
  SISTEMA: 'ℹ️',
  MANTENIMIENTO: '🔧',
  CUMPLEAÑOS: '🎂',
  REFERIDO: '👥'
};

export const NotificationList = ({ notifications, onMarkAsRead, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <div className="notification-list notification-list--empty">
        <div className="notification-list__empty-icon">🔔</div>
        <div className="notification-list__empty-text">
          No tienes notificaciones
        </div>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={
            'notification-list__item' +
            (notification.is_read ? '' : ' notification-list__item--unread')
          }
        >
          <div className="notification-list__icon">
            {notificationIcons[notification.type] || 'ℹ️'}
          </div>
          <div className="notification-list__content">
            <div className="notification-list__title">{notification.title}</div>
            <div className="notification-list__message">{notification.message}</div>
            <div className="notification-list__date">
              {new Date(notification.created_at).toLocaleString('es-PE')}
            </div>
          </div>
          <div className="notification-list__actions">
            {!notification.is_read && (
              <button
                className="notification-list__mark-button"
                onClick={() => onMarkAsRead(notification.id)}
                title="Marcar como leída"
              >
                ✓
              </button>
            )}
            <button
              className="notification-list__delete-button"
              onClick={() => onDelete(notification.id)}
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
