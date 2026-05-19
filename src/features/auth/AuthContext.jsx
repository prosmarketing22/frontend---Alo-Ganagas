// ============================================================
// AUTH CONTEXT - Contexto de autenticacion global
// ============================================================
import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../../services/authService';
import { clearCachedPushToken } from '../notifications/usePushNotifications';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay sesion activa al cargar la app
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const result = await authService.verify();

      if (result.success) {
        setUser(result.data);
      } else {
        // Token invalido o expirado
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error verificando autenticacion:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Funcion de login
  const login = async (email, password) => {
    setError(null);

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        setUser(result.data.user);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Error de conexion al servidor';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Funcion de logout
  const logout = useCallback(async () => {
    await clearCachedPushToken();
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  // Funcion de registro
  const register = async (data) => {
    setError(null);

    try {
      const result = await authService.register(data);

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        setUser(result.data.user);
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Error de conexion al servidor';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Verificar si el usuario tiene uno de los roles especificados
  const hasRole = useCallback((...roles) => {
    if (!user) return false;
    const userRole = user.role_code || user.rol || user.role?.code;
    return roles.includes(userRole);
  }, [user]);

  // Obtener el rol del usuario
  const getUserRole = useCallback(() => {
    if (!user) return null;
    return user.role_code || user.rol || user.role?.code;
  }, [user]);

  // Obtener ruta de redireccion segun rol
  const getRedirectPath = useCallback(() => {
    const role = getUserRole();

    switch (role) {
      case 'GERENTE':
      case 'BASE':
        return '/dashboard';
      case 'REPARTIDOR':
        return '/repartidor';
      case 'CLIENTE':
        return '/portal';
      default:
        return '/';
    }
  }, [getUserRole]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    getUserRole,
    getRedirectPath,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
