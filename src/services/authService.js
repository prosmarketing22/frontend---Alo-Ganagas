// ============================================================
// AUTH SERVICE - Servicio de autenticacion
// ============================================================
import { apiClient } from './apiClient';

const TOKEN_KEY = 'token';
const USER_KEY = 'alo_ganagas_user';

const authService = {
  /**
   * Iniciar sesion
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, data?: {token: string, user: Object}, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      if (response.success && response.token) {
        // Guardar token y usuario
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return {
          success: true,
          data: {
            token: response.token,
            user: response.user
          }
        };
      }

      return {
        success: false,
        error: response.error || 'Error al iniciar sesion'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.message || 'Error de conexion al servidor'
      };
    }
  },

  /**
   * Verificar token actual.
   * IMPORTANTE: este metodo NO borra el token. Distingue entre:
   *  - authError:    el servidor rechazo el token (401/403) -> el llamador puede cerrar sesion
   *  - networkError: fallo de red / servidor caido -> el llamador debe MANTENER la sesion
   * La decision de cerrar sesion la toma AuthContext, no este servicio.
   * @returns {Promise<{success: boolean, data?: Object, error?: string, authError?: boolean, networkError?: boolean}>}
   */
  async verify() {
    try {
      const response = await apiClient.get('/auth/verify');

      if (response.success && response.user) {
        // Actualizar usuario en localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return {
          success: true,
          data: response.user
        };
      }

      // Respuesta OK pero sin usuario valido: se trata como token rechazado
      return {
        success: false,
        authError: true,
        error: response.error || 'Token invalido'
      };
    } catch (error) {
      const status = error?.status;
      const isAuthError = status === 401 || status === 403;

      if (isAuthError) {
        return {
          success: false,
          authError: true,
          error: error.message || 'Token invalido o expirado'
        };
      }

      // Error de red / servidor no disponible: NO cerrar sesion
      console.warn('No se pudo verificar el token (fallo de red, se mantiene sesion):', error?.message);
      return {
        success: false,
        networkError: true,
        error: error.message || 'No se pudo conectar con el servidor'
      };
    }
  },

  /**
   * Cerrar sesion
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Obtener usuario actual del localStorage
   * @returns {Object|null}
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtener token actual
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Verificar si hay sesion activa (sin validar con servidor)
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Registrar nuevo cliente
   * @param {Object} data - Datos del registro
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async register(data) {
    try {
      const response = await apiClient.post('/auth/register', data);

      if (response.success && response.token) {
        // Guardar token y usuario
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return {
          success: true,
          data: {
            token: response.token,
            user: response.user,
            customer: response.customer
          },
          message: response.message
        };
      }

      return {
        success: false,
        error: response.error || 'Error al registrarse'
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.message || 'Error de conexion al servidor'
      };
    }
  },

  /**
   * Validar codigo de referido
   * @param {string} code - Codigo de referido
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async validateReferrerCode(code) {
    try {
      const response = await apiClient.get(`/auth/validate-referrer/${code}`);

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        error: response.error || 'Codigo no valido'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al validar codigo'
      };
    }
  }
};

export { authService };
export default authService;
