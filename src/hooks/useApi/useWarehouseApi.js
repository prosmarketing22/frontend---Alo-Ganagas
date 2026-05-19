import { useState, useCallback } from 'react';
import { warehouseService } from '../../services/warehouseService';

export const useWarehouseApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [mainWarehouse, setMainWarehouse] = useState(null);

  const fetchWarehouses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.getAll(params);
      if (response.success) {
        setData(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWarehouse = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMainWarehouse = useCallback(async () => {
    try {
      const response = await warehouseService.getMain();
      if (response.success) {
        setMainWarehouse(response.data);
      }
      return response;
    } catch (err) {
      // No propagamos el error para evitar errores en consola si no hay almacén principal
      console.warn('No se pudo obtener almacén principal:', err.message);
      return null;
    }
  }, []);

  const createWarehouse = useCallback(async (warehouseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.create(warehouseData);
      if (response.success) {
        setData(prev => [...prev, response.data]);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWarehouse = useCallback(async (id, warehouseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.update(id, warehouseData);
      if (response.success) {
        setData(prev => prev.map(item => item.id === id ? response.data : item));
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWarehouse = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.delete(id);
      if (response.success) {
        setData(prev => prev.filter(item => item.id !== id));
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setAsMain = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.setAsMain(id);
      if (response.success) {
        setData(prev => prev.map(item => ({
          ...item,
          is_main: item.id === id
        })));
        setMainWarehouse(response.data);
      }
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
    loading,
    error,
    pagination,
    mainWarehouse,
    fetchWarehouses,
    getWarehouse,
    fetchMainWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    setAsMain
  };
};
