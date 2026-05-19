import { useState, useCallback } from 'react';
import { supplierService } from '../../services/supplierService';

export const useSupplierApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchSuppliers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supplierService.getAll(params);

      if (response.success) {
        setData(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
        return response;
      } else {
        const errorMessage = response.error || 'Error al cargar proveedores';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar proveedores';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSupplier = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supplierService.getById(id);

      if (response.success) {
        return response;
      } else {
        const errorMessage = response.error || 'Error al obtener proveedor';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener proveedor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByRuc = useCallback(async (ruc) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supplierService.getByRuc(ruc);

      if (response.success) {
        return response;
      } else {
        const errorMessage = response.error || 'Proveedor no encontrado';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al buscar por RUC';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const createSupplier = useCallback(async (supplierData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supplierService.create(supplierData);

      if (response.success) {
        return response;
      } else {
        const errorMessage = response.error || 'Error al crear proveedor';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear proveedor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSupplier = useCallback(async (id, supplierData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supplierService.update(id, supplierData);

      if (response.success) {
        return response;
      } else {
        const errorMessage = response.error || 'Error al actualizar proveedor';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar proveedor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSupplier = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supplierService.delete(id);

      if (response.success) {
        return response;
      } else {
        const errorMessage = response.error || 'Error al eliminar proveedor';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar proveedor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    fetchSuppliers,
    getSupplier,
    searchByRuc,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError
  };
};
