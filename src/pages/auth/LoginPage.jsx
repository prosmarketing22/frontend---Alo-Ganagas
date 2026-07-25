// ============================================================
// LOGIN PAGE - Pagina de inicio de sesion y registro
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAuth } from '../../features/auth';
import '../../styles/components/login.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrerCode = searchParams.get('ref') || '';

  const { login, register, loading, error, isAuthenticated, getRedirectPath } = useAuth();
  // Si viene con codigo de referido, mostrar registro directamente
  const [activeTab, setActiveTab] = useState(referrerCode ? 'register' : 'login');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  // Si ya esta autenticado, redirigir segun su rol
  useEffect(() => {
    if (isAuthenticated) {
      // Siempre redirigir segun el rol del usuario actual
      navigate(getRedirectPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, getRedirectPath]);

  const handleLogin = async (credentials) => {
    const result = await login(credentials.email, credentials.password);

    if (result.success) {
      // Siempre redirigir segun el rol del usuario actual
      navigate(getRedirectPath(), { replace: true });
    }
  };

  const handleRegister = async (data) => {
    setRegisterLoading(true);
    setRegisterError(null);

    const result = await register(data);

    if (result.success) {
      // Redirigir al portal del cliente
      navigate('/portal', { replace: true });
    } else {
      setRegisterError(result.error);
    }

    setRegisterLoading(false);
  };

  // Si esta autenticado, mostrar loading mientras redirige
  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="login-page">
        <div className="login-page__header">
          <h1 className="login-page__title">
            {activeTab === 'login' ? 'Bienvenido' : 'Crear cuenta'}
          </h1>
          <p className="login-page__subtitle">
            {activeTab === 'login'
              ? 'Ingresa tus credenciales para continuar'
              : 'Regístrate para empezar a comprar'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tabs__tab ${activeTab === 'login' ? 'auth-tabs__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setRegisterError(null);
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth-tabs__tab ${activeTab === 'register' ? 'auth-tabs__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('register');
            }}
          >
            Registrarse
          </button>
        </div>

        {activeTab === 'login' ? (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => setActiveTab('login')}
            loading={registerLoading}
            error={registerError}
            initialReferrerCode={referrerCode}
          />
        )}

        <div className="login-page__legal">
          Al continuar aceptas nuestra{' '}
          <Link to="/legal/privacy" className="login-page__legal-link">
            Política de Privacidad
          </Link>{' '}
          y los{' '}
          <Link to="/legal/terms" className="login-page__legal-link">
            Términos de Uso
          </Link>.
        </div>
      </div>
    </AuthLayout>
  );
};
