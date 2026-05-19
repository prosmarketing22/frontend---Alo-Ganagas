import { apiClient } from './apiClient';

const repartidorService = {
  // Dashboard / Resumen
  getSummary: async () => {
    return apiClient.get('/repartidor/summary');
  },

  // Obtener metodos de pago activos
  getPaymentMethods: async () => {
    return apiClient.get('/orders/payment-methods');
  },

  // Cobros de balones (préstamos)
  getPendingLoans: async () => {
    return apiClient.get('/repartidor/loans/pending');
  },

  searchLoans: async (searchTerm) => {
    return apiClient.get(`/repartidor/loans/search?q=${encodeURIComponent(searchTerm)}`);
  },

  // Obtener almacenes activos para devolución de envases
  getActiveWarehouses: async () => {
    return apiClient.get('/repartidor/warehouses');
  },

  registerLoanReturn: async (data) => {
    return apiClient.post('/repartidor/loans/return', data);
  },

  getCustomerLoanHistory: async (customerId) => {
    return apiClient.get(`/repartidor/loans/customer/${customerId}/history`);
  },

  // Mantenimiento
  getMySchedules: async (date) => {
    const dateParam = date ? `?date=${date}` : '';
    return apiClient.get(`/repartidor/maintenance/my-schedules${dateParam}`);
  },

  // Obtener mantenimientos disponibles para autoasignacion
  getAvailableSchedules: async () => {
    return apiClient.get('/repartidor/maintenance/available');
  },

  // Autoasignarse un mantenimiento
  selfAssignSchedule: async (scheduleId) => {
    return apiClient.put(`/repartidor/maintenance/${scheduleId}/self-assign`);
  },

  startService: async (scheduleId) => {
    return apiClient.put(`/repartidor/maintenance/${scheduleId}/start`);
  },

  completeService: async (scheduleId, serviceData) => {
    return apiClient.post(`/repartidor/maintenance/${scheduleId}/complete`, serviceData);
  },

  // Entregas (usando endpoints existentes de orders)
  // Usa el endpoint con info de pre-registro para que el repartidor vea si hay pagos/intercambios pre-registrados
  getMyDeliveries: async (status = null) => {
    const statusParam = status ? `?status=${status}` : '';
    return apiClient.get(`/orders/my-orders-preregistration${statusParam}`);
  },

  // Obtener pedidos disponibles para autoasignacion
  getAvailableOrders: async () => {
    return apiClient.get('/orders/available');
  },

  // Autoasignarse un pedido
  selfAssignOrder: async (orderId) => {
    return apiClient.put(`/orders/${orderId}/self-assign`);
  },

  startDelivery: async (orderId, warehouseAssignments = null) => {
    const data = warehouseAssignments ? { warehouse_assignments: warehouseAssignments } : {};
    return apiClient.put(`/orders/${orderId}/in-transit`, data);
  },

  // Marcar llegada y notificar al cliente
  markArrived: async (orderId) => {
    return apiClient.put(`/orders/${orderId}/arrived`);
  },

  // Obtener historial de intercambios de balones
  getMyCylinderExchanges: async (dateFrom = null, dateTo = null) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    const queryString = params.toString();
    return apiClient.get(`/orders/my-exchanges${queryString ? '?' + queryString : ''}`);
  },

  // Obtener resumen de intercambios de balones
  getMyCylinderExchangeSummary: async (date = null) => {
    const dateParam = date ? `?date=${date}` : '';
    return apiClient.get(`/orders/my-exchanges/summary${dateParam}`);
  },

  completeDelivery: async (orderId, deliveryData) => {
    // Detectar si hay vouchers del pedido o del cobro de deuda
    const hasOrderVouchers = deliveryData.vouchers && Object.keys(deliveryData.vouchers).length > 0;
    const hasDebtVouchers = deliveryData.debt_payment?.vouchers && Object.keys(deliveryData.debt_payment.vouchers).length > 0;
    const hasVouchers = hasOrderVouchers || hasDebtVouchers;

    if (hasVouchers) {
      const formData = new FormData();
      formData.append('amount_paid', deliveryData.amount_paid || 0);
      formData.append('change_amount', deliveryData.change_amount || 0);

      if (deliveryData.actual_payment_method) {
        formData.append('actual_payment_method', deliveryData.actual_payment_method);
      }
      if (deliveryData.details_received) {
        formData.append('details_received', JSON.stringify(deliveryData.details_received));
      }
      if (deliveryData.mixed_payment_details) {
        formData.append('mixed_payment_details', JSON.stringify(deliveryData.mixed_payment_details));
      }
      if (deliveryData.additional_returns) {
        formData.append('additional_returns', JSON.stringify(deliveryData.additional_returns));
      }

      // Agregar datos de puntos GANAGAS
      if (deliveryData.use_ganagas_balance) {
        formData.append('use_ganagas_balance', 'true');
        formData.append('ganagas_amount', deliveryData.ganagas_amount || 0);
      }

      // Agregar DNI FISE del pedido si existe
      if (deliveryData.fise_dni) {
        formData.append('fise_dni', deliveryData.fise_dni);
      }

      // Agregar cada voucher del pedido y mapear metodo -> indice de archivo
      const voucherMapping = {};
      let fileIndex = 0;
      if (deliveryData.vouchers) {
        for (const [method, file] of Object.entries(deliveryData.vouchers)) {
          if (file) {
            formData.append('delivery_vouchers', file);
            voucherMapping[method] = fileIndex;
            fileIndex++;
          }
        }
      }
      formData.append('voucher_mapping', JSON.stringify(voucherMapping));

      // Agregar datos de cobro de deuda si existe
      if (deliveryData.debt_payment) {
        const debtData = {
          amount: deliveryData.debt_payment.amount,
          payment_method: deliveryData.debt_payment.payment_method
        };

        if (deliveryData.debt_payment.fise_dni) {
          debtData.fise_dni = deliveryData.debt_payment.fise_dni;
        }

        if (deliveryData.debt_payment.mixed_payment_details) {
          debtData.mixed_payment_details = deliveryData.debt_payment.mixed_payment_details;
        }

        formData.append('debt_payment', JSON.stringify(debtData));

        // Agregar vouchers de cobro de deuda
        if (deliveryData.debt_payment.vouchers) {
          const debtVoucherMapping = {};
          let debtFileIndex = 0;
          for (const [method, file] of Object.entries(deliveryData.debt_payment.vouchers)) {
            if (file) {
              formData.append('debt_vouchers', file);
              debtVoucherMapping[method] = debtFileIndex;
              debtFileIndex++;
            }
          }
          formData.append('debt_voucher_mapping', JSON.stringify(debtVoucherMapping));
        }
      }

      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4024/api';

      const response = await fetch(`${baseURL}/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al completar la entrega');
      }

      return response.json();
    }

    // Sin voucher, enviar como JSON normal
    return apiClient.put(`/orders/${orderId}/deliver`, deliveryData);
  }
};

export default repartidorService;
