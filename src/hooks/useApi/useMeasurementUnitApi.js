import { useState, useCallback } from 'react';
import { measurementUnitService } from '../../services/measurementUnitService.js';

export const useMeasurementUnitApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchUnits = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.getAll(params);
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

  const listUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.list();
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUnit = useCallback(async (unitData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.create(unitData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUnit = useCallback(async (id, unitData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.update(id, unitData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUnit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.delete(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUnitActive = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await measurementUnitService.toggleActive(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUnitProducts = useCallback(async (id) => {
    try {
      const response = await measurementUnitService.checkProducts(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    fetchUnits,
    listUnits,
    getUnit,
    createUnit,
    updateUnit,
    deleteUnit,
    toggleUnitActive,
    checkUnitProducts
  };
};
