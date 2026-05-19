import { useState, useCallback } from 'react';
import { loanService } from '../../services/loanService.js';

export const useLoanApi = () => {
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
      const response = await loanService.getAll(params);
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
      const response = await loanService.getById(id);
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
      const response = await loanService.create(loanData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerReturn = useCallback(async (id, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanService.registerReturn(id, quantity);
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
      const response = await loanService.getSummary();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoansByCustomer = useCallback(async (customerId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanService.getByCustomer(customerId, params);
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
      const response = await loanService.getBySupplier(supplierId, params);
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
    getLoansByCustomer,
    getLoansBySupplier
  };
};
