import { useState, useCallback } from 'react';
import { configurationService } from '../../services/configurationService';

export const useConfigurationApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfigurations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await configurationService.getAll();
      if (response.success) {
        setData(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getConfigValue = useCallback(async (key) => {
    setLoading(true);
    setError(null);
    try {
      const value = await configurationService.getValue(key);
      return value;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfiguration = useCallback(async (configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await configurationService.create(configData);
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

  const updateConfiguration = useCallback(async (id, configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await configurationService.update(id, configData);
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

  const updateByKey = useCallback(async (key, configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await configurationService.updateByKey(key, configData);
      if (response.success) {
        setData(prev => prev.map(item => item.key === key ? response.data : item));
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConfiguration = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await configurationService.delete(id);
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

  return {
    data,
    loading,
    error,
    fetchConfigurations,
    getConfigValue,
    createConfiguration,
    updateConfiguration,
    updateByKey,
    deleteConfiguration
  };
};
