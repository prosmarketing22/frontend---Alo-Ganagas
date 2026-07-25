// ============================================================
// AUTH CONTEXT - Contexto de autenticacion global
// ============================================================
import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../../services/authService';
import { clearCachedPushToken } from '../notifications/usePushNotifications';
import { clearAppBadge } from '../notifications/appBadge';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay sesion activa al cargar la app.
  // REGLA: la sesion NUNCA se cierra automaticamente. Solo se cierra si el
  // servidor rechaza EXPLICITAMENTE el token (401/403). Ante errores de red,
  // servidor caido o cualquier otro fallo transitorio, se mantiene la sesion
  // usando el usuario cacheado para que el app siga abierto (incluso offline).
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    // Sesion optimista: mostrar de inmediato al usuario cacheado (no espera a la red)
    const cachedUser = authService.getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      const result = await authService.verify();

      if (result.success) {
        // Token valido: refrescar datos del usuario
        setUser(result.data);
      } else if (result.authError) {
        // Token rechazado por el servidor (401/403): unica razon para cerrar sesion
        authService.logout();
        setUser(null);
      }
      // result.networkError u otro fallo transitorio: mantener la sesion cacheada
    } catch (err) {
      // Fallo inesperado: NO cerrar sesion, mantener la sesion cacheada
      console.warn('No se pudo verificar la sesion (se mantiene activa):', err?.message);
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

  // Funcion de logout MANUAL
  // La sesion se limpia de forma SINCRONA e inmediata (token + usuario + estado)
  // para que el cierre sea instantaneo y garantizado. La limpieza del push token
  // y del badge implica llamadas de red que en el APK pueden colgarse; por eso se
  // hacen en segundo plano (fire-and-forget) y NUNCA bloquean ni abortan el logout.
  const logout = useCallback(() => {
    // 1) Limpieza sincrona: garantiza que la sesion se cierre ya mismo
    authService.logout(); // remueve token + usuario del localStorage
    setUser(null);
    setError(null);

    // 2) Limpieza best-effort en segundo plano (no bloqueante, no puede fallar el logout)
    clearCachedPushToken().catch(() => {});
    clearAppBadge().catch(() => {});
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
