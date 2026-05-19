import { useState, useCallback } from 'react';
import { notificationService } from '../../services/notificationService.js';

export const useNotificationApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const getAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getAll(params);
      setData(response.data || []);
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
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.markAsRead(notificationId);
      setData(prev => prev.map(notif =>
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
      setData(prev => prev.map(notif => ({ ...notif, is_read: true })));
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
      const response = await notificationService.remove(notificationId);
      setData(prev => prev.filter(notif => notif.id !== notificationId));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    unreadCount,
    pagination,
    getAll,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    remove
  };
};
