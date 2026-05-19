import { useState, useCallback } from 'react';
import { portalService } from '../../services/portalService.js';

export const usePortalApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const getSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getSummary();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getAvailableProducts();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getPaymentMethods();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getMyOrders(params);
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

  const getOrderDetail = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getOrderDetail(orderId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getMyLoans();
      setData(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyGanagas = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getMyGanagas(params);
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

  const getMyReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getMyReferrals();
      setData(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReferralCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getReferralCode();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.updateProfile(profileData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestMaintenance = useCallback(async (maintenanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.requestMaintenance(maintenanceData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.createOrder(orderData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOsinergminDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getOsinergminDocuments();
      setData(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWaysToEarn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portalService.getWaysToEarn();
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
    pagination,
    getSummary,
    getAvailableProducts,
    getPaymentMethods,
    getMyOrders,
    getOrderDetail,
    getMyLoans,
    getMyGanagas,
    getMyReferrals,
    getReferralCode,
    updateProfile,
    requestMaintenance,
    createOrder,
    getOsinergminDocuments,
    getWaysToEarn
  };
};
