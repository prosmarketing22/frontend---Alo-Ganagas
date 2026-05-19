import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/customer-credits';

export const customerCreditService = {
  // ============================================
  // CONSULTAS GENERALES (GERENTE, BASE)
  // ============================================

  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params.origin) queryParams.append('origin', params.origin);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id);
  },

  async getSummary() {
    return apiClient.get(BASE_ENDPOINT + '/summary');
  },

  async getCustomersWithDebt(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.has_debt_only !== undefined) queryParams.append('has_debt_only', params.has_debt_only);
    if (params.order_by) queryParams.append('order_by', params.order_by);

    const endpoint = BASE_ENDPOINT + '/customers-with-debt' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getByCustomer(customerId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = BASE_ENDPOINT + '/customer/' + customerId + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async validateCreditLimit(customerId, amount) {
    const queryParams = new URLSearchParams();
    queryParams.append('amount', amount);

    return apiClient.get(BASE_ENDPOINT + '/validate-limit/' + customerId + '?' + queryParams.toString());
  },

  // ============================================
  // OPERACIONES (GERENTE, BASE, REPARTIDOR)
  // ============================================

  async registerPayment(data) {
    const formData = new FormData();
    formData.append('customer_id', data.customer_id);
    formData.append('amount', data.amount);
    formData.append('payment_method', data.payment_method);
    if (data.description) formData.append('description', data.description);
    if (data.voucher) formData.append('voucher', data.voucher);
    if (data.collected_by) formData.append('collected_by', data.collected_by);
    if (data.mixed_payment_details) {
      formData.append('mixed_payment_details', JSON.stringify(data.mixed_payment_details));
    }

    return apiClient.post(BASE_ENDPOINT + '/payment', formData);
  },

  async registerAdjustment(data) {
    return apiClient.post(BASE_ENDPOINT + '/adjustment', data);
  },

  // ============================================
  // OPERACIONES DE BASE
  // ============================================

  async registerCollectionForDeliverer(data) {
    const formData = new FormData();
    formData.append('customer_id', data.customer_id);
    formData.append('amount', data.amount);
    formData.append('payment_method', data.payment_method);
    formData.append('deliverer_id', data.deliverer_id);
    if (data.description) formData.append('description', data.description);
    if (data.voucher) formData.append('voucher', data.voucher);

    return apiClient.post(BASE_ENDPOINT + '/collection-for-deliverer', formData);
  },

  // ============================================
  // OPERACIONES DE REPARTIDOR
  // ============================================

  async getMyAssignments(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + '/my-assignments' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async assignToMe(customerId) {
    return apiClient.post(BASE_ENDPOINT + '/assign/' + customerId);
  },

  async completeAssignment(assignmentId, data) {
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('payment_method', data.payment_method);
    if (data.notes) formData.append('notes', data.notes);
    if (data.fise_dni) formData.append('fise_dni', data.fise_dni);
    if (data.mixed_payment_details) {
      formData.append('mixed_payment_details', JSON.stringify(data.mixed_payment_details));
    }

    // Vouchers: puede ser un solo archivo o un objeto con archivos por método
    if (data.voucher) {
      formData.append(`voucher_${data.payment_method}`, data.voucher);
    }
    if (data.vouchers && typeof data.vouchers === 'object') {
      Object.entries(data.vouchers).forEach(([method, file]) => {
        if (file) formData.append(`voucher_${method}`, file);
      });
    }

    return apiClient.post(BASE_ENDPOINT + '/complete/' + assignmentId, formData);
  },

  async cancelAssignment(assignmentId) {
    return apiClient.delete(BASE_ENDPOINT + '/assignment/' + assignmentId);
  },

  async getAssignmentsByCustomer(customerId) {
    return apiClient.get(BASE_ENDPOINT + '/assignments/customer/' + customerId);
  }
};
