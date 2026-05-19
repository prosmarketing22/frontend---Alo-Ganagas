import { useState, useCallback } from 'react';
import salesHistoryService from '../../services/salesHistoryService';

export const useSalesHistoryApi = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchSales = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesHistoryService.getAll(params);
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

  const fetchSummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesHistoryService.getSummary(params);
      setSummary(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSaleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesHistoryService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToExcel = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesHistoryService.exportToExcel(params);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    summary,
    loading,
    error,
    pagination,
    fetchSales,
    fetchSummary,
    getSaleById,
    exportToExcel
  };
};

export default useSalesHistoryApi;
