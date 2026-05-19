import { useState, useCallback } from 'react';
import { supplierLoanService } from '../../services/supplierLoanService.js';

export const useSupplierLoanApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchLoans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.getAll(params);
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

  const getLoan = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoan = useCallback(async (loanData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.create(loanData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerReturn = useCallback(async (id, quantity, warehouseId = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.registerReturn(id, quantity, warehouseId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.getSummary();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoansBySupplier = useCallback(async (supplierId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.getBySupplier(supplierId, params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGroupedBySupplier = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierLoanService.getGroupedBySupplier(params);
      setData(response.data || []);
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
    fetchLoans,
    getLoan,
    createLoan,
    registerReturn,
    getSummary,
    getLoansBySupplier,
    getGroupedBySupplier
  };
};
