// ============================================================
// PROTECTED ROUTE - Componente para proteger rutas
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth';

/**
 * Componente para proteger rutas que requieren autenticacion
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar
 * @param {string[]} [props.roles] - Lista de roles permitidos (opcional)
 * @param {string} [props.redirectTo] - Ruta de redireccion si no autenticado (default: /login)
 * @param {string} [props.unauthorizedTo] - Ruta si no tiene permisos (default: /unauthorized)
 *
 * @example
 * // Proteger ruta solo para autenticados
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 *
 * @example
 * // Proteger ruta solo para ciertos roles
 * <Route path="/admin" element={
 *   <ProtectedRoute roles={['GERENTE']}>
 *     <AdminPage />
 *   </ProtectedRoute>
 * } />
 *
 * @example
 * // Proteger ruta para GERENTE y BASE
 * <Route path="/inventario" element={
 *   <ProtectedRoute roles={['GERENTE', 'BASE']}>
 *     <InventarioPage />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({
  children,
  roles = [],
  redirectTo = '/login',
  unauthorizedTo = '/unauthorized'
}) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticacion
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  // Si no esta autenticado, redirigir al login
  if (!isAuthenticated) {
    // Guardar la ubicacion actual para redirigir despues del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si se especificaron roles, verificar que el usuario tenga uno de ellos
  if (roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to={unauthorizedTo} replace />;
  }

  // Usuario autenticado y con permisos, renderizar children
  return children;
};

export default ProtectedRoute;
