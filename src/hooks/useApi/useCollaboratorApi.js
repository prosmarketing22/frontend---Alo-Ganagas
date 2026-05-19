import { useState, useCallback } from 'react';
import { collaboratorService } from '../../services/collaboratorService.js';

export const useCollaboratorApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchCollaborators = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.getAll(params);
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

  const getCollaborator = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollaborator = useCallback(async (collaboratorData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.create(collaboratorData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCollaborator = useCallback(async (id, collaboratorData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.update(id, collaboratorData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCollaborator = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.delete(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeliverymen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.getDeliverymen();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBirthdays = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const response = await collaboratorService.getBirthdays(month);
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
    fetchCollaborators,
    getCollaborator,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
    getDeliverymen,
    getBirthdays
  };
};
