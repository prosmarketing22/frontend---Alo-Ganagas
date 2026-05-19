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
   * Verificar token actual
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
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

      return {
        success: false,
        error: response.error || 'Token invalido'
      };
    } catch (error) {
      console.error('Error verificando token:', error);
      // Limpiar storage si el token es invalido
      this.logout();
      return {
        success: false,
        error: error.message || 'Token invalido o expirado'
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
