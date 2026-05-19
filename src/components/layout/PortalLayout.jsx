import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useNotifications } from '../../features/notifications';
import { NotificationBadge } from '../portal/NotificationBadge';
import NotificationBell from '../common/NotificationBell';
import './PortalLayout.css';
import logo from '../../assets/logo-cliente.png';

// Hook para detectar el tamaño de pantalla
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const menuItems = [
  { path: '/portal', label: 'Inicio', icon: '🏠' },
  { path: '/portal/create-order', label: 'Hacer Pedido', icon: '🛒' },
  { path: '/portal/orders', label: 'Mis Pedidos', icon: '📦' },
  { path: '/portal/loans', label: 'Mis Envases', icon: '🧊' },
  { path: '/portal/ganagas', label: 'Mi GANAGAS', icon: '💰' },
  { path: '/portal/referrals', label: 'Mis Referidos', icon: '👥' },
  { path: '/portal/osinergmin', label: 'OSINERGMIN', icon: '📕' },
  { path: '/portal/notifications', label: 'Notificaciones', icon: '🔔' },
  { path: '/portal/profile', label: 'Mi Perfil', icon: '👤' }
];

export const PortalLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getUnreadCount, unreadCount } = useNotifications();

  // Detectar si es móvil/tablet (< 1024px)
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // En móvil, sidebar empieza cerrado; en desktop, abierto
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    getUnreadCount();
  }, [getUnreadCount]);

  // Cerrar sidebar al cambiar a móvil
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Cerrar sidebar al navegar en móvil
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Manejar cierre con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen && isMobile) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMobile]);

  // Prevenir scroll del body cuando sidebar está abierto en móvil
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  const handleCloseSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="portal-layout">
      {/* Overlay para cerrar sidebar en móvil */}
      <div
        className={`portal-layout__overlay${sidebarOpen && isMobile ? ' portal-layout__overlay--visible' : ''}`}
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />

      <aside className={'portal-layout__sidebar' + (sidebarOpen ? '' : ' portal-layout__sidebar--collapsed')}>
        <div className="portal-layout__logo">
          <img src={logo} alt="Aló Ganagas" className="portal-layout__logo-img" />
        </div>

        <nav className="portal-layout__nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={'portal-layout__nav-button' + (isActive(item.path) ? ' portal-layout__nav-button--active' : '')}
              onClick={() => navigate(item.path)}
            >
              <span className="portal-layout__nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className={`portal-layout__nav-label${item.label === 'Notificaciones' ? ' portal-layout__nav-label--with-badge' : ''}`}>
                  {item.label}
                  {item.label === 'Notificaciones' && unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} />
                  )}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <div className="portal-layout__content">
        <header className="portal-layout__header">
          <button
            className="portal-layout__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="portal-layout__header-right">
            <NotificationBell />
            <div className="portal-layout__user">
              <span className="portal-layout__user-name">{user?.full_name || 'Cliente'}</span>
            </div>
            <button className="portal-layout__logout" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>

        <main className="portal-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
};
