import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../features/notifications';
import { NotificationList } from '../../components/portal/NotificationList';
import './NotificationsPage.css';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading: contextLoading, getAll, markAsRead, markAllAsRead, remove } = useNotifications();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Auto-marcar como leidas cuando el usuario ve la pagina
  useEffect(() => {
    if (!initialLoading && unreadCount > 0 && notifications.length > 0) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [initialLoading, unreadCount, notifications.length, markAllAsRead]);

  const loadNotifications = async () => {
    try {
      await getAll();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

    try {
      await remove(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loading = initialLoading;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-page__loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <h1 className="notifications-page__title">Notificaciones</h1>
        <button
          className="notifications-page__back"
          onClick={() => navigate('/portal')}
        >
          Volver
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="notifications-page__actions">
          <div className="notifications-page__unread-count">
            {unreadCount} sin leer
          </div>
          <button
            className="notifications-page__mark-all"
            onClick={handleMarkAllAsRead}
          >
            Marcar todas como leídas
          </button>
        </div>
      )}

      <div className="notifications-page__list">
        <NotificationList
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
