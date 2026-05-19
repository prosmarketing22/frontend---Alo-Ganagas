import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../features/notifications';
import './RepartidorNotificacionesPage.css';

const NOTIFICATION_ICONS = {
  PEDIDO: '📦',
  GANAGAS: '💰',
  ALERTA: '⚠️',
  SISTEMA: '🔧',
  MANTENIMIENTO: '🔩',
  'CUMPLEAÑOS': '🎂',
  REFERIDO: '👥'
};

export const RepartidorNotificacionesPage = () => {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `hace ${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Ayer';
    return `hace ${diffDays}d`;
  };

  if (initialLoading) {
    return (
      <div className="rep-notif">
        <div className="rep-notif__container">
          <div className="rep-notif__loading">
            <div className="rep-notif__spinner"></div>
            <p className="rep-notif__loading-text">Cargando notificaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rep-notif">
      <div className="rep-notif__container">
        {/* Header */}
        <header className="rep-notif__header">
          <div className="rep-notif__header-content">
            <div className="rep-notif__header-left">
              <h1 className="rep-notif__title">
                <span className="rep-notif__title-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </span>
                Notificaciones
              </h1>
              {unreadCount > 0 && (
                <span className="rep-notif__unread-badge">{unreadCount} sin leer</span>
              )}
            </div>
            <button
              className="rep-notif__back-btn"
              onClick={() => navigate('/repartidor')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          </div>
        </header>

        {/* Actions Bar */}
        {unreadCount > 0 && (
          <div className="rep-notif__actions">
            <div className="rep-notif__actions-info">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tienes <strong>{unreadCount}</strong> notificacion{unreadCount !== 1 ? 'es' : ''} sin leer</span>
            </div>
            <button
              className="rep-notif__mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Marcar todas como leidas
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="rep-notif__list">
          {notifications.length === 0 ? (
            <div className="rep-notif__empty">
              <div className="rep-notif__empty-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="rep-notif__empty-title">Sin notificaciones</h2>
              <p className="rep-notif__empty-text">
                No tienes notificaciones por el momento. Te avisaremos cuando llegue un nuevo pedido.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rep-notif__item${!notif.is_read ? ' rep-notif__item--unread' : ''}`}
              >
                <div className="rep-notif__item-icon">
                  {NOTIFICATION_ICONS[notif.notification_type] || NOTIFICATION_ICONS[notif.type] || '📌'}
                </div>
                <div className="rep-notif__item-body">
                  <div className="rep-notif__item-top">
                    <span className="rep-notif__item-title">{notif.title}</span>
                    <span className="rep-notif__item-time" title={formatDate(notif.date_time_registration || notif.created_at)}>
                      {formatTimeAgo(notif.date_time_registration || notif.created_at)}
                    </span>
                  </div>
                  <p className="rep-notif__item-msg">{notif.message}</p>
                  <div className="rep-notif__item-footer">
                    <span className="rep-notif__item-date">
                      {formatDate(notif.date_time_registration || notif.created_at)}
                    </span>
                    <div className="rep-notif__item-actions">
                      {!notif.is_read && (
                        <button
                          className="rep-notif__item-btn rep-notif__item-btn--read"
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Marcar como leida"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Leida
                        </button>
                      )}
                      <button
                        className="rep-notif__item-btn rep-notif__item-btn--delete"
                        onClick={() => handleDelete(notif.id)}
                        title="Eliminar"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
