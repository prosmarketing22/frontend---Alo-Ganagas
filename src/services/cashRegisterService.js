import { apiClient } from './apiClient';

const cashRegisterService = {
  // ====================================
  // REPARTIDOR - Su propia caja
  // ====================================

  // Obtener caja activa del usuario actual
  getMyActiveRegister: async () => {
    return apiClient.get('/cash-registers/my-register');
  },

  // Obtener historial de cajas del usuario actual
  getMyHistory: async (limit = 10) => {
    return apiClient.get(`/cash-registers/my-history?limit=${limit}`);
  },

  // Verificar si tiene caja abierta
  checkOpenRegister: async (userId = null) => {
    const endpoint = userId
      ? `/cash-registers/check-open/${userId}`
      : '/cash-registers/check-open';
    return apiClient.get(endpoint);
  },

  // Obtener metodos de pago disponibles
  getPaymentMethods: async () => {
    return apiClient.get('/cash-registers/payment-methods');
  },

  // ====================================
  // GERENTE/BASE - Gestion de cajas
  // ====================================

  // Obtener todas las cajas (con filtros)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.register_status) params.append('register_status', filters.register_status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    const queryString = params.toString();
    return apiClient.get(`/cash-registers${queryString ? '?' + queryString : ''}`);
  },

  // Obtener cajas pendientes de aprobacion
  getPendingApproval: async () => {
    return apiClient.get('/cash-registers/pending-approval');
  },

  // Abrir caja para un usuario
  openRegister: async (data) => {
    return apiClient.post('/cash-registers/open', data);
  },

  // Obtener caja por ID
  getById: async (id) => {
    return apiClient.get(`/cash-registers/${id}`);
  },

  // Obtener pedidos de una caja
  getOrders: async (id) => {
    return apiClient.get(`/cash-registers/${id}/orders`);
  },

  // ====================================
  // GASTOS
  // ====================================

  // Registrar gasto (con posible voucher)
  registerExpense: async (cashRegisterId, data, voucherFile = null) => {
    if (voucherFile) {
      const formData = new FormData();
      formData.append('category_id', data.category_id);
      formData.append('payment_method', data.payment_method || 'EFECTIVO');
      formData.append('amount', data.amount);
      if (data.description) formData.append('description', data.description);
      formData.append('voucher', voucherFile);

      // No establecer Content-Type - el browser lo hace automaticamente con el boundary
      return apiClient.post(`/cash-registers/${cashRegisterId}/expenses`, formData);
    }

    return apiClient.post(`/cash-registers/${cashRegisterId}/expenses`, data);
  },

  // Eliminar gasto
  deleteExpense: async (expenseId) => {
    return apiClient.delete(`/cash-registers/expenses/${expenseId}`);
  },

  // ====================================
  // CIERRE Y APROBACION
  // ====================================

  // Cerrar caja
  closeRegister: async (id, data) => {
    return apiClient.post(`/cash-registers/${id}/close`, data);
  },

  // Aprobar caja (gerente/base)
  approveRegister: async (id, data = {}) => {
    return apiClient.post(`/cash-registers/${id}/approve`, data);
  },

  // Observar caja (gerente/base)
  observeRegister: async (id, data) => {
    return apiClient.post(`/cash-registers/${id}/observe`, data);
  },

  // Agregar justificacion (motorizado)
  addJustification: async (id, data) => {
    return apiClient.post(`/cash-registers/${id}/justify`, data);
  }
};

export default cashRegisterService;
