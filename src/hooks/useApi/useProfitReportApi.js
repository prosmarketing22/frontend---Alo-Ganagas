import { useState, useCallback } from 'react';
import { profitReportService } from '../../services/profitReportService';

export const useProfitReportApi = () => {
  const [data, setData] = useState({
    byProduct: [],
    byBrand: [],
    byType: [],
    summary: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  /**
   * Obtener utilidad por producto
   */
  const getByProduct = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profitReportService.getByProduct(filters);
      if (response.success) {
        setData(prev => ({ ...prev, byProduct: response.data || [] }));
        setPagination(response.pagination || null);
        return response;
      } else {
        throw new Error(response.error || 'Error al obtener reporte');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener utilidad por marca
   */
  const getByBrand = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profitReportService.getByBrand(filters);
      if (response.success) {
        setData(prev => ({ ...prev, byBrand: response.data || [] }));
        return response;
      } else {
        throw new Error(response.error || 'Error al obtener reporte');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener utilidad por tipo de producto
   */
  const getByProductType = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profitReportService.getByProductType(filters);
      if (response.success) {
        setData(prev => ({ ...prev, byType: response.data || [] }));
        return response;
      } else {
        throw new Error(response.error || 'Error al obtener reporte');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener resumen general
   */
  const getSummary = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profitReportService.getSummary(filters);
      if (response.success) {
        setData(prev => ({ ...prev, summary: response.data || null }));
        return response;
      } else {
        throw new Error(response.error || 'Error al obtener resumen');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener todos los reportes de una vez
   */
  const getAll = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const [productRes, brandRes, typeRes, summaryRes] = await Promise.all([
        profitReportService.getByProduct(filters),
        profitReportService.getByBrand(filters),
        profitReportService.getByProductType(filters),
        profitReportService.getSummary(filters)
      ]);

      setData({
        byProduct: productRes.success ? productRes.data : [],
        byBrand: brandRes.success ? brandRes.data : [],
        byType: typeRes.success ? typeRes.data : [],
        summary: summaryRes.success ? summaryRes.data : null
      });
      setPagination(productRes.pagination || null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar datos
   */
  const clearData = useCallback(() => {
    setData({
      byProduct: [],
      byBrand: [],
      byType: [],
      summary: null
    });
    setPagination(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    getByProduct,
    getByBrand,
    getByProductType,
    getSummary,
    getAll,
    clearData
  };
};
