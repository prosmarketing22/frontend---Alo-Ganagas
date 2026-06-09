import { apiClient } from './apiClient.js';
import { openBlobInNativeApp, downloadBlobWeb, isNativePlatform } from '../utils/nativeFile.js';

const BASE_ENDPOINT = '/portal';

const buildUrl = (endpoint, params = {}) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return filteredParams ? `${endpoint}?${filteredParams}` : endpoint;
};

export const portalService = {
  async getSummary() {
    return apiClient.get(`${BASE_ENDPOINT}/summary`);
  },

  async getAvailableProducts() {
    return apiClient.get(`${BASE_ENDPOINT}/products`);
  },

  async getPaymentMethods() {
    return apiClient.get(`${BASE_ENDPOINT}/payment-methods`);
  },

  async getMyOrders(params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/my-orders`, params);
    return apiClient.get(url);
  },

  async getOrderDetail(orderId) {
    return apiClient.get(`${BASE_ENDPOINT}/my-orders/${orderId}`);
  },

  async getMyLoans() {
    return apiClient.get(`${BASE_ENDPOINT}/my-loans`);
  },

  async getMyGanagas(params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/my-ganagas`, params);
    return apiClient.get(url);
  },

  async getMyReferrals() {
    return apiClient.get(`${BASE_ENDPOINT}/my-referrals`);
  },

  async getReferralCode() {
    return apiClient.get(`${BASE_ENDPOINT}/referral-code`);
  },

  async updateProfile(data) {
    return apiClient.put(`${BASE_ENDPOINT}/profile`, data);
  },

  async requestMaintenance(data) {
    return apiClient.post(`${BASE_ENDPOINT}/request-maintenance`, data);
  },

  async createOrder(data) {
    return apiClient.post(`${BASE_ENDPOINT}/orders`, data);
  },

  async getOsinergminDocuments() {
    return apiClient.get(`${BASE_ENDPOINT}/osinergmin`);
  },

  async getWaysToEarn() {
    return apiClient.get(`${BASE_ENDPOINT}/ways-to-earn`);
  },

  async getDocumentBlob(id, type = 'preview') {
    const endpoint = type === 'download'
      ? `${BASE_ENDPOINT}/osinergmin/${id}/download`
      : `${BASE_ENDPOINT}/osinergmin/${id}/preview`;
    return apiClient.getBlob(endpoint);
  },

  async getPreviewBlob(id) {
    return this.getDocumentBlob(id, 'preview');
  },

  /**
   * Visualizar documento.
   * - Nativo (APK): descarga a cache y abre con la app externa del sistema.
   * - Web: descarga el blob y devuelve {blob, contentType, fileName} para que el caller
   *   lo renderice inline (iframe/img). Si no hay caller que lo use, hace download web.
   */
  async openDocument(id, { fallbackToDownload = true, fileNameHint = null } = {}) {
    const result = await this.getDocumentBlob(id, 'preview');
    const fileName = result.fileName || fileNameHint || 'documento';

    if (isNativePlatform()) {
      await openBlobInNativeApp({
        blob: result.blob,
        fileName,
        contentType: result.contentType
      });
      return { opened: true, ...result, fileName };
    }

    if (fallbackToDownload) {
      // En web devolvemos los datos al caller — no descargamos automáticamente.
      return { opened: false, ...result, fileName };
    }
    return { opened: false, ...result, fileName };
  },

  /**
   * Descargar documento.
   * - Nativo (APK): escribe en cache y abre con la app externa (el usuario puede guardar/compartir).
   * - Web: dispara descarga del navegador via <a download>.
   */
  async downloadDocument(id, { fileNameHint = null } = {}) {
    const result = await this.getDocumentBlob(id, 'download');
    const fileName = result.fileName || fileNameHint || 'documento';

    if (isNativePlatform()) {
      await openBlobInNativeApp({
        blob: result.blob,
        fileName,
        contentType: result.contentType
      });
      return { saved: true, fileName };
    }

    downloadBlobWeb({ blob: result.blob, fileName });
    return { saved: true, fileName };
  }
};

export default portalService;
