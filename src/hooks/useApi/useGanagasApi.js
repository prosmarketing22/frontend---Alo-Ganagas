import { useState, useCallback } from 'react';
import { ganagasService } from '../../services/ganagasService.js';

export const useGanagasApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchSummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.getSummary(params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.getStatistics(params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentMovements = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.getRecentMovements(limit);
      setData(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBirthdayCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.getBirthdayCustomers();
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomerHistory = useCallback(async (customerId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.getCustomerHistory(customerId, params);
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

  const fetchCustomerBalance = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.getCustomerBalance(customerId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateBalanceUsage = useCallback(async (customerId, amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.validateBalanceUsage(customerId, amount);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const grantBirthdayBonus = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.grantBirthdayBonus(customerId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerAdjustment = useCallback(async (adjustmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ganagasService.registerAdjustment(adjustmentData);
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
    fetchSummary,
    fetchStatistics,
    fetchRecentMovements,
    fetchBirthdayCustomers,
    fetchCustomerHistory,
    fetchCustomerBalance,
    validateBalanceUsage,
    grantBirthdayBonus,
    registerAdjustment
  };
};
