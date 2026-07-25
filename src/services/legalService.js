import { apiClient } from './apiClient.js';

// ============================================================
// LEGAL SERVICE - Politica de Privacidad y Terminos de Uso
// Lectura publica (sin auth). Edicion solo GERENTE.
// ============================================================

const BASE_ENDPOINT = '/legal';

export const LEGAL_TYPES = {
  privacy: { key: 'privacy', label: 'Política de Privacidad' },
  terms: { key: 'terms', label: 'Términos y Condiciones' }
};

export const legalService = {
  // Publico: ambos documentos
  getAll: async () => {
    return apiClient.get(BASE_ENDPOINT);
  },

  // Publico: un documento por tipo ('privacy' | 'terms')
  getByType: async (type) => {
    return apiClient.get(`${BASE_ENDPOINT}/${type}`);
  },

  // Solo GERENTE: actualizar un documento
  update: async (type, data) => {
    return apiClient.put(`${BASE_ENDPOINT}/${type}`, data);
  }
};

export default legalService;
