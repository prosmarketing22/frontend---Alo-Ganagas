import { useState, useCallback } from 'react';
import { productWarehouseStockService } from '../../services/productWarehouseStockService.js';

export const useProductWarehouseStockApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productWarehouseStockService.getAll(params);
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

  const fetchByWarehouse = useCallback(async (warehouseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productWarehouseStockService.getByWarehouse(warehouseId);
      setData(response.data || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productWarehouseStockService.getByProduct(productId);
      setData(response.data || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStock = useCallback(async (productId, warehouseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productWarehouseStockService.getStock(productId, warehouseId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStock = useCallback(async (productId, warehouseId, stockData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productWarehouseStockService.updateStock(productId, warehouseId, stockData);
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
    fetchAll,
    fetchByWarehouse,
    fetchByProduct,
    getStock,
    updateStock
  };
};
