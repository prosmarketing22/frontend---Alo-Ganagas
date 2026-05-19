import { useState, useCallback } from 'react';
import maintenanceService from '../../services/maintenanceService';

export const useMaintenanceApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // === MAINTENANCE REQUESTS (solo lectura) ===
  const fetchAllRequests = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await maintenanceService.getAllRequests(params);
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

  // === MAINTENANCE SCHEDULES ===
  const fetchAllSchedules = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await maintenanceService.getAllSchedules(params);
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

  // === MAINTENANCE SERVICES ===
  const fetchAllServices = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await maintenanceService.getAllServices(params);
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

  const createService = useCallback(async (serviceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await maintenanceService.createService(serviceData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id, serviceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await maintenanceService.updateService(id, serviceData);
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
    fetchAllRequests,
    fetchAllSchedules,
    fetchAllServices,
    createService,
    updateService
  };
};

export default useMaintenanceApi;
