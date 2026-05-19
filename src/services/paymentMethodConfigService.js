import { apiClient } from './apiClient';
import { API_URL } from '../config/api.config';

export const paymentMethodConfigService = {
  // Obtener todas las configuraciones
  getAll: () => apiClient.get('/payment-methods'),

  // Obtener configuración por tipo
  getByType: (type) => apiClient.get(`/payment-methods/${type}`),

  // Obtener métodos de pago activos (para repartidores)
  getActive: () => apiClient.get('/payment-methods/active'),

  // Activar/Desactivar método de pago (usa ID, no tipo)
  toggleActive: (id, is_active) => apiClient.patch(`/payment-methods/${id}/toggle`, { is_active }),

  // Actualizar configuración de billetera móvil (usa configId)
  updateMobileWallet: (configId, data) => apiClient.put(`/payment-methods/mobile-wallet/${configId}`, data),

  // Crear cuenta bancaria (usa configId del método TRANSFERENCIA)
  createBankAccount: (configId, data) => apiClient.post(`/payment-methods/bank-accounts/${configId}`, data),

  // Actualizar cuenta bancaria (usa ID de la cuenta)
  updateBankAccount: (id, data) => apiClient.put(`/payment-methods/bank-accounts/${id}`, data),

  // Eliminar cuenta bancaria (usa ID de la cuenta)
  deleteBankAccount: (id) => apiClient.delete(`/payment-methods/bank-accounts/${id}`),

  uploadQrImage: async (configId, file) => {
    const formData = new FormData();
    formData.append('qr_image', file);

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/payment-methods/upload-qr/${configId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir la imagen');
    }

    return response.json();
  }
};
