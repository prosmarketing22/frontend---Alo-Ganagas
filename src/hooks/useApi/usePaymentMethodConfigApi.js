import { useState, useCallback } from 'react';
import { paymentMethodConfigService } from '../../services/paymentMethodConfigService';

export const usePaymentMethodConfigApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.getAll();
      if (response.success) {
        setData(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByType = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.getByType(type);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.getActive();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id, is_active) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.toggleActive(id, is_active);
      if (response.success) {
        setData(prev => prev.map(item =>
          item.id === id ? { ...item, is_active: is_active } : item
        ));
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMobileWallet = useCallback(async (configId, walletData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.updateMobileWallet(configId, walletData);
      if (response.success) {
        await fetchAll(); // Recargar datos
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const createBankAccount = useCallback(async (configId, accountData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.createBankAccount(configId, accountData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBankAccount = useCallback(async (id, accountData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.updateBankAccount(id, accountData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBankAccount = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.deleteBankAccount(id);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadQrImage = useCallback(async (configId, file) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentMethodConfigService.uploadQrImage(configId, file);
      if (response.success) {
        await fetchAll(); // Recargar datos
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  return {
    data,
    loading,
    error,
    fetchAll,
    getByType,
    getActive,
    toggleActive,
    updateMobileWallet,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    uploadQrImage
  };
};
