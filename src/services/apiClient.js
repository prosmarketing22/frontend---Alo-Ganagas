const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4024/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  async request(endpoint, options = {}) {
    const url = this.baseURL + endpoint;
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...this.getAuthHeader(),
      ...options.headers
    };

    // Solo agregar Content-Type si NO es FormData
    // FormData necesita que el browser establezca el boundary automaticamente
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Error en la solicitud';
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  patch(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async getBlob(endpoint) {
    const url = this.baseURL + endpoint;
    const headers = {
      ...this.getAuthHeader()
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error al obtener el archivo';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const blob = await response.blob();
      return {
        blob,
        contentType: response.headers.get('Content-Type'),
        fileName: this.extractFileName(response.headers.get('Content-Disposition'))
      };
    } catch (error) {
      console.error('API Blob Error:', error);
      throw error;
    }
  }

  extractFileName(contentDisposition) {
    if (!contentDisposition) return null;
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    return match ? match[1] : null;
  }
}

export const apiClient = new ApiClient();
