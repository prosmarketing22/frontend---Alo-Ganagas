// ============================================================
// NOTIFICATION CONTEXT - Contexto global de notificaciones
// Integrado con WebSocket para actualizaciones en tiempo real
// ============================================================
import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { notificationService } from '../../services/notificationService';
import { SocketContext } from '../socket/SocketContext';
import { setAppBadge } from './appBadge';

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

  // Sincronizar la burbuja del ícono del launcher con el contador de no leídas.
  // - Llega un push / nueva notificación  -> unreadCount sube  -> burbuja aparece.
  // - Se marca como leída (una o todas)   -> unreadCount baja  -> burbuja se actualiza/desaparece.
  // - Al abrir/reconectar la app se resincroniza desde el servidor.
  useEffect(() => {
    setAppBadge(unreadCount);
  }, [unreadCount]);

  // Escuchar eventos de WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    if (!socketContext?.socket) return;

    const socket = socketContext.socket;

    // Deduplicación: insertar solo si el id no existe en la lista
    const insertIfNew = (notif) => {
      if (!notif) return;
      let inserted = false;
      setNotifications(prev => {
        if (notif.id != null && prev.some(n => n.id === notif.id)) return prev;
        inserted = true;
        return [notif, ...prev];
      });
      // Solo incrementar contador si realmente se insertó (no era duplicado).
      // El valor absoluto que llega luego en 'unread_count_update' lo corrige igual.
      if (inserted) {
        setUnreadCount(prev => prev + 1);
      }
    };

    // Actualizar contador cuando se recibe del servidor (valor absoluto)
    const handleUnreadCountUpdate = (data) => {
      if (typeof data?.count === 'number') {
        setUnreadCount(data.count);
      }
    };

    const handleNewNotification = (data) => insertIfNew(data?.notification);
    const handleArrivalNotification = (data) => insertIfNew(data?.notification);
    const handleNewOrderAlert = (data) => insertIfNew(data?.notification);
    const handleNewMaintenanceAlert = (data) => insertIfNew(data?.notification);

    // Al reconectar el socket, resincronizar contador Y lista desde el servidor.
    // Esto recupera notificaciones que llegaron con la app cerrada / sin conexión.
    const handleReconnect = () => {
      console.log('[NotificationContext] Socket reconectado: resincronizando');
      notificationService.getUnreadCount()
        .then(response => {
          if (response?.data?.count != null) {
            setUnreadCount(response.data.count);
          }
        })
        .catch(err => console.warn('[NotificationContext] Error resync unread:', err?.message));
      // Resincronizar también la lista (no solo el contador) para que el
      // dropdown muestre los ítems llegados mientras estuvo offline.
      notificationService.getAll({ limit: 20 })
        .then(response => {
          if (Array.isArray(response?.data)) {
            setNotifications(response.data);
          }
        })
        .catch(err => console.warn('[NotificationContext] Error resync lista:', err?.message));
    };

    socket.on('unread_count_update', handleUnreadCountUpdate);
    socket.on('new_notification', handleNewNotification);
    socket.on('arrival_notification', handleArrivalNotification);
    socket.on('new_order_alert', handleNewOrderAlert);
    socket.on('new_maintenance_alert', handleNewMaintenanceAlert);
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('unread_count_update', handleUnreadCountUpdate);
      socket.off('new_notification', handleNewNotification);
      socket.off('arrival_notification', handleArrivalNotification);
      socket.off('new_order_alert', handleNewOrderAlert);
      socket.off('new_maintenance_alert', handleNewMaintenanceAlert);
      socket.off('connect', handleReconnect);
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
