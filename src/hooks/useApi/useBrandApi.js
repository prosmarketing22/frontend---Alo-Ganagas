import { useState, useCallback } from 'react';
import { brandService } from '../../services/brandService.js';

export const useBrandApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchBrands = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.getAll(params);
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

  const getBrand = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrand = useCallback(async (brandData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.create(brandData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (id, brandData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.update(id, brandData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBrand = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.delete(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateBrand = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.activate(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateBrand = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.deactivate(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBrandStatus = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.toggleStatus(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkBrandProducts = useCallback(async (id) => {
    try {
      const response = await brandService.checkProducts(id);
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
    fetchBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
    activateBrand,
    deactivateBrand,
    toggleBrandStatus,
    checkBrandProducts
  };
};
