import { useState, useCallback } from 'react';
import cashRegisterService from '../../services/cashRegisterService';

export const useCashRegisterApi = () => {
  const [activeRegister, setActiveRegister] = useState(null);
  const [registers, setRegisters] = useState([]);
  const [pendingApproval, setPendingApproval] = useState([]);
  const [history, setHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener caja activa del usuario actual
  const fetchMyActiveRegister = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getMyActiveRegister();
      if (result.success) {
        setActiveRegister(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si tiene caja abierta
  const checkOpenRegister = useCallback(async (userId = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.checkOpenRegister(userId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener historial de cajas
  const fetchMyHistory = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getMyHistory(limit);
      if (result.success) {
        setHistory(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener metodos de pago
  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getPaymentMethods();
      if (result.success) {
        setPaymentMethods(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener todas las cajas (gerente/base)
  const fetchAll = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getAll(filters);
      if (result.success) {
        setRegisters(result.data || []);
        setPagination(result.pagination || null);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener cajas pendientes de aprobacion
  const fetchPendingApproval = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getPendingApproval();
      if (result.success) {
        setPendingApproval(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Abrir caja
  const openRegister = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.openRegister(data);
      if (result.success) {
        setActiveRegister(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener caja por ID
  const getById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getById(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener pedidos de una caja
  const getOrders = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.getOrders(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar gasto
  const registerExpense = useCallback(async (cashRegisterId, data, voucherFile = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.registerExpense(cashRegisterId, data, voucherFile);
      // Actualizar la caja activa si es la misma
      if (result.success && activeRegister?.id === parseInt(cashRegisterId)) {
        await fetchMyActiveRegister();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeRegister, fetchMyActiveRegister]);

  // Eliminar gasto
  const deleteExpense = useCallback(async (expenseId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.deleteExpense(expenseId);
      if (result.success && activeRegister) {
        await fetchMyActiveRegister();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeRegister, fetchMyActiveRegister]);

  // Cerrar caja
  const closeRegister = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.closeRegister(id, data);
      if (result.success) {
        setActiveRegister(null);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Aprobar caja
  const approveRegister = useCallback(async (id, data = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.approveRegister(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Observar caja
  const observeRegister = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.observeRegister(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar justificacion
  const addJustification = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cashRegisterService.addJustification(id, data);
      if (result.success && activeRegister?.id === parseInt(id)) {
        setActiveRegister(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeRegister]);

  return {
    activeRegister,
    registers,
    pendingApproval,
    history,
    paymentMethods,
    pagination,
    loading,
    error,
    fetchMyActiveRegister,
    checkOpenRegister,
    fetchMyHistory,
    fetchPaymentMethods,
    fetchAll,
    fetchPendingApproval,
    openRegister,
    getById,
    getOrders,
    registerExpense,
    deleteExpense,
    closeRegister,
    approveRegister,
    observeRegister,
    addJustification
  };
};

export default useCashRegisterApi;
