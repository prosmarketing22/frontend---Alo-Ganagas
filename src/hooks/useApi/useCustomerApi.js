import { useState, useCallback } from 'react';
import { customerService } from '../../services/customerService.js';

export const useCustomerApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchCustomers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getAll(params);
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

  const getCustomerList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getList();
      const list = response.data || [];
      setData(list);
      return list;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.create(customerData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomer = useCallback(async (id, customerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.update(id, customerData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.delete(id);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReferrals = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getReferrals(id);
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByReferralCode = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getByReferralCode(code);
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLoyaltyLevel = useCallback(async (id, level) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.updateLoyaltyLevel(id, level);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBirthdays = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getBirthdays(month);
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSpecialPrices = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getSpecialPrices(id);
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSpecialPrice = useCallback(async (customerId, productId, price, specialPoints = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.upsertSpecialPrice(customerId, productId, price, specialPoints);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSpecialPrice = useCallback(async (customerId, priceId, price, specialPoints = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.updateSpecialPrice(customerId, priceId, price, specialPoints);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSpecialPrice = useCallback(async (customerId, priceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.deleteSpecialPrice(customerId, priceId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPendingLoans = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.checkPendingLoans(id);
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.deactivate(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.activate(id);
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
    fetchCustomers,
    getCustomerList,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getReferrals,
    getByReferralCode,
    updateLoyaltyLevel,
    getBirthdays,
    getSpecialPrices,
    saveSpecialPrice,
    updateSpecialPrice,
    deleteSpecialPrice,
    checkPendingLoans,
    deactivateCustomer,
    activateCustomer
  };
};
