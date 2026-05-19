import { useState, useCallback } from 'react';
import { osinergminService } from '../../services/osinergminService.js';

// Mapear datos del backend (snake_case) a frontend (camelCase)
const mapDocument = (doc) => ({
  ...doc,
  order: doc.display_order,
  isPublished: doc.is_published,
  fileName: doc.file_name,
  fileType: doc.file_type,
  fileSize: doc.file_size,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
  createdByName: doc.created_by_name,
  updatedByName: doc.updated_by_name
});

export const useOsinergminApi = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const getAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.getAll(params);
      const mappedData = (response.data || []).map(mapDocument);
      setDocuments(mappedData);
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

  const getById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.create(formData);
      await getAll();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.update(id, data);
      await getAll();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  const updateFile = useCallback(async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.updateFile(id, formData);
      await getAll();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await osinergminService.remove(id);
      await getAll();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  const togglePublish = useCallback(async (id, isPublished) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.togglePublish(id, isPublished);
      await getAll();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  const updateOrder = useCallback(async (id, order) => {
    setLoading(true);
    setError(null);
    try {
      const response = await osinergminService.updateOrder(id, order);
      await getAll();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  return {
    documents,
    loading,
    error,
    pagination,
    getAll,
    getById,
    create,
    update,
    updateFile,
    remove,
    togglePublish,
    updateOrder
  };
};
