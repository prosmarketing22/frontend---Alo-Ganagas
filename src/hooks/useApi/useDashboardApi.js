import { useState, useCallback, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';

export const useDashboardApi = () => {
  const [data, setData] = useState({
    pendingCount: 0,
    activeOrders: [],
    deliverers: [],
    stock: []
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getBaseDashboard();
      setData(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await dashboardService.getPendingCount();
      setData(prev => ({ ...prev, pendingCount: response.data.count }));
      return response.data.count;
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  }, []);

  const fetchPendingOrders = useCallback(async () => {
    setLoadingPending(true);
    try {
      const response = await dashboardService.getPendingOrders();
      setPendingOrders(response.data || []);
      return response.data;
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      setPendingOrders([]);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchPendingCount]);

  return {
    data,
    pendingOrders,
    loading,
    loadingPending,
    error,
    fetchDashboard,
    fetchPendingCount,
    fetchPendingOrders,
    refresh: fetchDashboard
  };
};

export default useDashboardApi;
