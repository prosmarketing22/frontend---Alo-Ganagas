import { apiClient } from './apiClient';

const expenseCategoryService = {
  // Obtener todas las categorias
  getAll: async (includeInactive = false) => {
    const param = includeInactive ? '?include_inactive=true' : '';
    return apiClient.get(`/expense-categories${param}`);
  },

  // Obtener categoria por ID
  getById: async (id) => {
    return apiClient.get(`/expense-categories/${id}`);
  },

  // Crear categoria
  create: async (data) => {
    return apiClient.post('/expense-categories', data);
  },

  // Actualizar categoria
  update: async (id, data) => {
    return apiClient.put(`/expense-categories/${id}`, data);
  },

  // Eliminar categoria
  remove: async (id) => {
    return apiClient.delete(`/expense-categories/${id}`);
  },

  // Reordenar categorias
  reorder: async (orderedIds) => {
    return apiClient.put('/expense-categories/reorder', { ordered_ids: orderedIds });
  }
};

export default expenseCategoryService;
