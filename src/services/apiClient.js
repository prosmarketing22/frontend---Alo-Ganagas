import { Capacitor, CapacitorHttp } from '@capacitor/core';

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
    const headers = { ...this.getAuthHeader() };

    if (Capacitor.isNativePlatform()) {
      return this._getBlobNative(url, headers);
    }
    return this._getBlobWeb(url, headers);
  }

  async _getBlobNative(url, headers) {
    try {
      const res = await CapacitorHttp.request({
        url,
        method: 'GET',
        headers,
        responseType: 'blob'
      });

      if (res.status < 200 || res.status >= 300) {
        const msg = typeof res.data === 'string'
          ? this._tryExtractErrorMessage(res.data)
          : (res.data?.error || res.data?.message || 'Error al obtener el archivo');
        const error = new Error(msg);
        error.status = res.status;
        throw error;
      }

      const lowerHeaders = this._normalizeHeaders(res.headers);
      const contentType = lowerHeaders['content-type'] || 'application/octet-stream';
      const fileName = this.extractFileName(lowerHeaders['content-disposition']);

      const blob = this._base64ToBlob(res.data, contentType);
      return { blob, contentType, fileName };
    } catch (error) {
      console.error('API Blob Native Error:', error);
      throw error;
    }
  }

  async _getBlobWeb(url, headers) {
    try {
      const response = await fetch(url, { method: 'GET', headers });

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
      console.error('API Blob Web Error:', error);
      throw error;
    }
  }

  _normalizeHeaders(headers) {
    const out = {};
    if (!headers) return out;
    for (const k of Object.keys(headers)) {
      out[k.toLowerCase()] = headers[k];
    }
    return out;
  }

  _tryExtractErrorMessage(maybeBase64OrJson) {
    try {
      const decoded = atob(maybeBase64OrJson);
      const parsed = JSON.parse(decoded);
      return parsed.error || parsed.message || 'Error al obtener el archivo';
    } catch {
      try {
        const parsed = JSON.parse(maybeBase64OrJson);
        return parsed.error || parsed.message || 'Error al obtener el archivo';
      } catch {
        return 'Error al obtener el archivo';
      }
    }
  }

  _base64ToBlob(base64, contentType) {
    if (!base64) return new Blob([], { type: contentType });
    const cleaned = base64.replace(/^data:[^;]+;base64,/, '');
    const byteChars = atob(cleaned);
    const byteArrays = [];
    const sliceSize = 1024;
    for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
      const slice = byteChars.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: contentType });
  }

  extractFileName(contentDisposition) {
    if (!contentDisposition) return null;
    const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export const apiClient = new ApiClient();
