import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useNotifications } from '../../features/notifications';
import NotificationBell from '../common/NotificationBell';
import '../../styles/components/mainLayout.css';
import logo from '../../assets/logo.png';

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

// Menu completo para GERENTE
const gerenteMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home' },
  {
    label: 'Catálogos',
    icon: 'folder',
    children: [
      { path: '/catalogs/brands', label: 'Marcas' },
      { path: '/catalogs/warehouses', label: 'Almacenes' },
      { path: '/catalogs/suppliers', label: 'Proveedores' },
      { path: '/catalogs/products', label: 'Productos' }
    ]
  },
  { path: '/collaborators', label: 'Colaboradores', icon: 'users' },
  { path: '/customers', label: 'Clientes', icon: 'customer' },
  { path: '/inventory', label: 'Inventario y Préstamos', icon: 'inventory' },
  { path: '/orders', label: 'Pedidos', icon: 'orders' },
  { path: '/sales-history', label: 'Historial Ventas', icon: 'sales' },
  { path: '/profit-reports', label: 'Reportes Utilidad', icon: 'profit' },
  { path: '/customer-credits', label: 'Créditos Clientes', icon: 'credits' },
  { path: '/maintenance', label: 'Mantenimiento', icon: 'maintenance' },
  { path: '/ganagas', label: 'Mi GANAGAS', icon: 'ganagas' },
  { path: '/osinergmin', label: 'OSINERGMIN', icon: 'document' },
  { path: '/cash-registers', label: 'Cajas', icon: 'cash' },
  {
    label: 'Configuración',
    icon: 'settings',
    children: [
      { path: '/settings/configurations', label: 'General' },
      { path: '/settings/payment-methods', label: 'Métodos de Pago' },
      { path: '/settings/expense-categories', label: 'Categorías de Gastos' },
      { path: '/settings/legal', label: 'Políticas y Términos' }
    ]
  }
];

// Menu restringido para BASE
const baseMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/customers', label: 'Clientes', icon: 'customer' },
  { path: '/orders', label: 'Pedidos Vigentes', icon: 'orders' },
  { path: '/sales-history', label: 'Historial Ventas/Cobros', icon: 'sales' },
  { path: '/customer-credits', label: 'Créditos Clientes', icon: 'credits' },
  { path: '/inventory', label: 'Préstamos Envases', icon: 'loans' },
  { path: '/maintenance', label: 'Mantenimiento', icon: 'maintenance' },
  { path: '/cash-registers', label: 'Cajas', icon: 'cash' },
  { path: '/catalogs/warehouses', label: 'Almacenes', icon: 'warehouse' },
  { path: '/catalogs/products', label: 'Productos', icon: 'inventory' }
];

// Menu para REPARTIDOR
const repartidorMenuItems = [
  { path: '/repartidor', label: 'Mi Panel', icon: 'home' },
  { path: '/repartidor/caja', label: 'Mi Caja', icon: 'cash' },
  { path: '/repartidor/entregas', label: 'Mis Entregas', icon: 'delivery' },
  { path: '/repartidor/cobros', label: 'Cobros', icon: 'credits' },
  { path: '/repartidor/mantenimiento', label: 'Mantenimiento', icon: 'maintenance' },
  { path: '/repartidor/notificaciones', label: 'Notificaciones', icon: 'bell' }
];

export const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getUserRole } = useAuth();
  const { unreadCount } = useNotifications();

  // Detectar si es móvil/tablet (< 1024px)
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // En móvil, sidebar empieza cerrado; en desktop, abierto
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedMenus, setExpandedMenus] = useState(['Catálogos', 'Configuración']);

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

  // Obtener menu segun rol del usuario
  const menuItems = useMemo(() => {
    const role = getUserRole();
    switch (role) {
      case 'GERENTE':
        return gerenteMenuItems;
      case 'BASE':
        return baseMenuItems;
      case 'REPARTIDOR':
        return repartidorMenuItems;
      default:
        return baseMenuItems;
    }
  }, [getUserRole]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (label) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (children) => children?.some(child => location.pathname === child.path);

  // Obtener icono SVG segun tipo
  const getIcon = (iconType) => {
    switch (iconType) {
      case 'home':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'folder':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'users':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'customer':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'inventory':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case 'orders':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'delivery':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
      case 'sales':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        );
      case 'warehouse':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <path d="M9 9v.01" />
            <path d="M9 12v.01" />
            <path d="M9 15v.01" />
            <path d="M9 18v.01" />
          </svg>
        );
      case 'ganagas':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'document':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'cash':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        );
      case 'credits':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'bell':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case 'profit':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 6l-9.5 9.5-5-5L1 18" />
            <path d="M17 6h6v6" />
          </svg>
        );
      case 'loans':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12L6 12M18 12L22 12M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  // Obtener badge del rol
  const getRoleBadge = () => {
    const role = getUserRole();
    switch (role) {
      case 'GERENTE':
        return { label: 'Gerente', className: 'main-layout__role-badge--gerente' };
      case 'BASE':
        return { label: 'Operador', className: 'main-layout__role-badge--base' };
      case 'REPARTIDOR':
        return { label: 'Repartidor', className: 'main-layout__role-badge--repartidor' };
      default:
        return { label: role, className: '' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="main-layout">
      {/* Overlay para cerrar sidebar en móvil */}
      <div
        className={`main-layout__overlay${sidebarOpen && isMobile ? ' main-layout__overlay--visible' : ''}`}
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />

      <aside className={'main-layout__sidebar' + (sidebarOpen ? '' : ' main-layout__sidebar--collapsed')}>
        <div className="main-layout__logo">
          <img src={logo} alt="Aló Ganagas" className="main-layout__logo-img" />
        </div>

        <nav className="main-layout__nav">
          {menuItems.map((item, index) => (
            <div key={index} className="main-layout__nav-item">
              {item.children ? (
                <>
                  <button
                    className={'main-layout__nav-button' + (isParentActive(item.children) ? ' main-layout__nav-button--active' : '')}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <span className="main-layout__nav-icon">{getIcon(item.icon)}</span>
                    {sidebarOpen && <span className="main-layout__nav-label">{item.label}</span>}
                    {sidebarOpen && (
                      <span className={'main-layout__nav-arrow' + (expandedMenus.includes(item.label) ? ' main-layout__nav-arrow--open' : '')}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    )}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.label) && (
                    <div className="main-layout__submenu">
                      {item.children.map((child, childIndex) => (
                        <button
                          key={childIndex}
                          className={'main-layout__submenu-item' + (isActive(child.path) ? ' main-layout__submenu-item--active' : '')}
                          onClick={() => navigate(child.path)}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={'main-layout__nav-button' + (isActive(item.path) ? ' main-layout__nav-button--active' : '')}
                  onClick={() => navigate(item.path)}
                >
                  <span className="main-layout__nav-icon">
                    {getIcon(item.icon)}
                    {item.icon === 'bell' && !sidebarOpen && unreadCount > 0 && (
                      <span className="main-layout__nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </span>
                  {sidebarOpen && (
                    <span className="main-layout__nav-label">
                      {item.label}
                      {item.icon === 'bell' && unreadCount > 0 && (
                        <span className="main-layout__nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                      )}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="main-layout__content">
        <header className="main-layout__header">
          <button
            className="main-layout__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="main-layout__header-right">
            <NotificationBell />
            <span className={`main-layout__role-badge ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
            <span className="main-layout__user">{user?.full_name || 'Usuario'}</span>
            <button className="main-layout__logout" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <main className="main-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
};
