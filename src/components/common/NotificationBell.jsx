import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '../../features/notifications';
import './NotificationBell.css';

const NOTIFICATION_ICONS = {
  PEDIDO: '📦',
  GANAGAS: '💰',
  ALERTA: '⚠️',
  SISTEMA: '🔧',
  MANTENIMIENTO: '🔩',
  'CUMPLEAÑOS': '🎂',
  REFERIDO: '👥'
};

const NotificationBell = () => {
  const { notifications, unreadCount, getAll, getUnreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const dropdownRef = useRef(null);
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    getUnreadCount();
  }, [getUnreadCount]);

  // Animacion de campana cuando llega nueva notificacion
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setHasNewAlert(true);
      const timer = setTimeout(() => setHasNewAlert(false), 2000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-marcar como leidas cuando el usuario cierra el dropdown despues de verlas
  const hadUnreadRef = useRef(false);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      hadUnreadRef.current = true;
    }
    if (!isOpen && hadUnreadRef.current) {
      hadUnreadRef.current = false;
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  const handleToggle = useCallback(() => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      getAll({ limit: 10 });
    }
  }, [isOpen, getAll]);

  const handleMarkAsRead = useCallback(async (e, id) => {
    e.stopPropagation();
    await markAsRead(id);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d`;
  };

  return (
    <div className="notif-bell" ref={dropdownRef}>
      <button
        className={`notif-bell__btn${hasNewAlert ? ' notif-bell__btn--ringing' : ''}`}
        onClick={handleToggle}
        aria-label="Notificaciones"
      >
        <svg className="notif-bell__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-bell__dropdown">
          <div className="notif-bell__dropdown-header">
            <h4 className="notif-bell__dropdown-title">Notificaciones</h4>
            {unreadCount > 0 && (
              <button className="notif-bell__mark-all" onClick={handleMarkAllAsRead}>
                Marcar todo leido
              </button>
            )}
          </div>

          <div className="notif-bell__dropdown-list">
            {notifications.length === 0 ? (
              <div className="notif-bell__empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Sin notificaciones</span>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-bell__item${!notif.is_read ? ' notif-bell__item--unread' : ''}`}
                >
                  <span className="notif-bell__item-icon">
                    {NOTIFICATION_ICONS[notif.notification_type] || NOTIFICATION_ICONS[notif.type] || '📌'}
                  </span>
                  <div className="notif-bell__item-content">
                    <span className="notif-bell__item-title">{notif.title}</span>
                    <span className="notif-bell__item-msg">{notif.message}</span>
                    <span className="notif-bell__item-time">
                      {formatTimeAgo(notif.date_time_registration || notif.created_at)}
                    </span>
                  </div>
                  {!notif.is_read && (
                    <button
                      className="notif-bell__item-read"
                      onClick={(e) => handleMarkAsRead(e, notif.id)}
                      title="Marcar como leida"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
