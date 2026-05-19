import { useState, useCallback } from 'react';
import { bonusScaleService } from '../../services/bonusScaleService.js';

export const useBonusScaleApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScales = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bonusScaleService.getAll(params);
      setData(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getScale = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bonusScaleService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateBonus = useCallback(async (price, brandId = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bonusScaleService.calculateBonus(price, brandId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createScale = useCallback(async (scaleData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bonusScaleService.create(scaleData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScale = useCallback(async (id, scaleData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bonusScaleService.update(id, scaleData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteScale = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bonusScaleService.delete(id);
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
    fetchScales,
    getScale,
    calculateBonus,
    createScale,
    updateScale,
    deleteScale
  };
};
