// ============================================================
// NOTIFICATION CONTEXT - Contexto global de notificaciones
// Integrado con WebSocket para actualizaciones en tiempo real
// ============================================================
import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { notificationService } from '../../services/notificationService';
import { SocketContext } from '../socket/SocketContext';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socketContext = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Escuchar eventos de WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    if (!socketContext?.socket) return;

    const socket = socketContext.socket;

    // Actualizar contador cuando se recibe del servidor
    const handleUnreadCountUpdate = (data) => {
      setUnreadCount(data.count);
    };

    // Agregar nueva notificacion a la lista
    const handleNewNotification = (data) => {
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    // Agregar notificacion de llegada a la lista
    const handleArrivalNotification = (data) => {
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    // Agregar alerta de nuevo pedido a la lista de notificaciones
    const handleNewOrderAlert = (data) => {
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    socket.on('unread_count_update', handleUnreadCountUpdate);
    socket.on('new_notification', handleNewNotification);
    socket.on('arrival_notification', handleArrivalNotification);
    socket.on('new_order_alert', handleNewOrderAlert);

    return () => {
      socket.off('unread_count_update', handleUnreadCountUpdate);
      socket.off('new_notification', handleNewNotification);
      socket.off('arrival_notification', handleArrivalNotification);
      socket.off('new_order_alert', handleNewOrderAlert);
    };
  }, [socketContext?.socket]);

  const getAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getAll(params);
      setNotifications(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
      return response.data;
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const notifToRemove = notifications.find(n => n.id === notificationId);
      const response = await notificationService.remove(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (notifToRemove && !notifToRemove.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    getAll,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    remove
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
