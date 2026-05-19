import { useState, useCallback } from 'react';
import { authService } from '../../services/authService';

export const useAuthApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(authService.getCurrentUser());

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Error al iniciar sesion');
        return false;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesion';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const verifiedUser = await authService.verifyToken();
      if (verifiedUser) {
        setUser(verifiedUser);
        return true;
      }
      return false;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout]);

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    verifyToken,
    isAuthenticated,
    clearError
  };
};
