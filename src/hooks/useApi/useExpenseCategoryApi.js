import { useState, useCallback } from 'react';
import expenseCategoryService from '../../services/expenseCategoryService';

export const useExpenseCategoryApi = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las categorias
  const fetchCategories = useCallback(async (includeInactive = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseCategoryService.getAll(includeInactive);
      if (result.success) {
        setCategories(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener categoria por ID
  const getById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseCategoryService.getById(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear categoria
  const createCategory = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseCategoryService.create(data);
      if (result.success) {
        await fetchCategories();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Actualizar categoria
  const updateCategory = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseCategoryService.update(id, data);
      if (result.success) {
        await fetchCategories();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Eliminar categoria
  const removeCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseCategoryService.remove(id);
      if (result.success) {
        await fetchCategories();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Reordenar categorias
  const reorderCategories = useCallback(async (orderedIds) => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseCategoryService.reorder(orderedIds);
      if (result.success) {
        setCategories(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getById,
    createCategory,
    updateCategory,
    removeCategory,
    reorderCategories
  };
};

export default useExpenseCategoryApi;
