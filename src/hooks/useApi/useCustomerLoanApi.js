import { useState, useCallback } from 'react';
import { customerLoanService } from '../../services/customerLoanService.js';

export const useCustomerLoanApi = () => {
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
      const response = await customerLoanService.getAll(params);
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
      const response = await customerLoanService.getById(id);
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
      const response = await customerLoanService.create(loanData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerReturn = useCallback(async (id, quantity, returnedBy = null, warehouseId = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerLoanService.registerReturn(id, quantity, returnedBy, warehouseId);
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
      const response = await customerLoanService.getSummary();
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
      const response = await customerLoanService.getByCustomer(customerId, params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGroupedByCustomer = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerLoanService.getGroupedByCustomer(params);
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
    getLoansByCustomer,
    getGroupedByCustomer
  };
};
