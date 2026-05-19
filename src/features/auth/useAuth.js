// ============================================================
// USE AUTH HOOK - Hook para acceder al contexto de autenticacion
// ============================================================
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Hook para acceder al contexto de autenticacion
 *
 * @returns {{
 *   user: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   login: (email: string, password: string) => Promise<Object>,
 *   logout: () => void,
 *   hasRole: (...roles: string[]) => boolean,
 *   getUserRole: () => string|null,
 *   getRedirectPath: () => string,
 *   isAuthenticated: boolean
 * }}
 *
 * @example
 * // En cualquier componente:
 * const { user, login, logout, hasRole, isAuthenticated } = useAuth();
 *
 * // Verificar autenticacion
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 *
 * // Verificar rol
 * if (hasRole('GERENTE', 'BASE')) {
 *   // Mostrar opciones de admin
 * }
 *
 * // Login
 * const handleLogin = async () => {
 *   const result = await login(email, password);
 *   if (result.success) {
 *     navigate(getRedirectPath());
 *   }
 * };
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};

export default useAuth;
