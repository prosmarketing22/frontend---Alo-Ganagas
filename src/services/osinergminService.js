import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/osinergmin';

const buildUrl = (endpoint, params = {}) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return filteredParams ? `${endpoint}?${filteredParams}` : endpoint;
};

export const osinergminService = {
  async getAll(params = {}) {
    const url = buildUrl(BASE_ENDPOINT, params);
    return apiClient.get(url);
  },

  async getById(id) {
    return apiClient.get(`${BASE_ENDPOINT}/${id}`);
  },

  async create(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiClient.baseURL}${BASE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Error al crear documento';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  async update(id, data) {
    return apiClient.put(`${BASE_ENDPOINT}/${id}`, data);
  },

  async updateFile(id, formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiClient.baseURL}${BASE_ENDPOINT}/${id}/file`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseData = await response.json();
    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || 'Error al actualizar archivo';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  },

  async remove(id) {
    return apiClient.delete(`${BASE_ENDPOINT}/${id}`);
  },

  async togglePublish(id, isPublished) {
    console.log('=== FRONTEND togglePublish ===');
    console.log('id:', id);
    console.log('isPublished:', isPublished, 'type:', typeof isPublished);
    console.log('sending body:', { is_published: isPublished });
    return apiClient.put(`${BASE_ENDPOINT}/${id}/publish`, { is_published: isPublished });
  },

  async updateOrder(id, order) {
    return apiClient.put(`${BASE_ENDPOINT}/${id}/order`, { display_order: order });
  }
};

export default osinergminService;
