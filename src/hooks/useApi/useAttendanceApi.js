import { useState, useCallback } from 'react';
import { attendanceService } from '../../services/attendanceService.js';

export const useAttendanceApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendances = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getAll(params);
      setData(response.data || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTodayAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getToday();
      setData(response.data || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollaboratorsToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getCollaboratorsToday();
      setData(response.data || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = useCallback(async (attendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.checkIn(attendanceData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mark = useCallback(async (attendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.mark(attendanceData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllPresent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.markAllPresent();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByUser = useCallback(async (userId, month, year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getByUser(userId, month, year);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async (month, year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getSummary(month, year);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistorySummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getHistorySummary(params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getYearsTree = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getYearsTree(params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMonthsByYear = useCallback(async (year, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getMonthsByYear(year, params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDaysByYearMonth = useCallback(async (year, month, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getDaysByYearMonth(year, month, params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByYearMonth = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getByYearMonth(year, month);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByDate = useCallback(async (date, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getByDate(date, params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const closeDay = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.closeDay(date);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reopenDay = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.reopenDay(date);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDayStatus = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getDayStatus(date);
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
    fetchAttendances,
    getTodayAttendances,
    getCollaboratorsToday,
    checkIn,
    mark,
    markAllPresent,
    getByUser,
    getSummary,
    getHistorySummary,
    getYearsTree,
    getMonthsByYear,
    getDaysByYearMonth,
    getByYearMonth,
    getByDate,
    closeDay,
    reopenDay,
    getDayStatus
  };
};
