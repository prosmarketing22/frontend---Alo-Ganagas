// ============================================================
// APP ROUTES - Rutas de la aplicacion con proteccion por roles
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { MainLayout } from '../components/layout/MainLayout';
import { PortalLayout } from '../components/layout/PortalLayout';
import { BrandsPage } from '../pages/catalogs/BrandsPage';
import { WarehousesPage } from '../pages/catalogs/WarehousesPage';
import { SuppliersPage } from '../pages/catalogs/SuppliersPage';
import { ProductsPage } from '../pages/catalogs/ProductsPage';
import { CollaboratorsPage } from '../pages/collaborators/CollaboratorsPage';
import { ConfigurationsPage } from '../pages/settings/ConfigurationsPage';
import { PaymentMethodsPage } from '../pages/settings/PaymentMethodsPage';
import { ExpenseCategoriesPage } from '../pages/settings/ExpenseCategoriesPage';
import { LegalDocumentsPage } from '../pages/settings/LegalDocumentsPage';
import { LegalPage } from '../pages/legal/LegalPage';
import { CashRegistersPage } from '../pages/cash-registers/CashRegistersPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { OrdersPage } from '../pages/orders/OrdersPage';
import { GanagasPage } from '../pages/ganagas/GanagasPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../features/auth/useAuth';

// Portal Cliente - Importaciones
import { PortalHomePage } from '../pages/portal/PortalHomePage';
import { CreateOrderPage } from '../pages/portal/CreateOrderPage';
import { MyOrdersPage } from '../pages/portal/MyOrdersPage';
import { OrderDetailPage } from '../pages/portal/OrderDetailPage';
import { MyLoansPage } from '../pages/portal/MyLoansPage';
import { MyGanagasPage } from '../pages/portal/MyGanagasPage';
import { MyReferralsPage } from '../pages/portal/MyReferralsPage';
import { NotificationsPage } from '../pages/portal/NotificationsPage';
import { ProfilePage } from '../pages/portal/ProfilePage';
import { OsinergminPage as PortalOsinergminPage } from '../pages/portal/OsinergminPage';

// Modulos BASE - Dashboard, Historial Ventas, Mantenimiento
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SalesHistoryPage } from '../pages/sales/SalesHistoryPage';
import { MaintenancePage } from '../pages/maintenance/MaintenancePage';
import { OsinergminPage } from '../pages/osinergmin/OsinergminPage';
import { CustomerCreditsPage } from '../pages/credits/CustomerCreditsPage';

// Reportes - Solo GERENTE
import { ProfitReportPage } from '../pages/reports/ProfitReportPage';

// Modulo REPARTIDOR - Importaciones
import { RepartidorPage } from '../pages/repartidor/RepartidorPage';
import { RepartidorEntregasPage } from '../pages/repartidor/RepartidorEntregasPage';
import { RepartidorCobrosPage } from '../pages/repartidor/RepartidorCobrosPage';
import { RepartidorMantenimientoPage } from '../pages/repartidor/RepartidorMantenimientoPage';
import { RepartidorCajaPage } from '../pages/repartidor/RepartidorCajaPage';
import { RepartidorNotificacionesPage } from '../pages/repartidor/RepartidorNotificacionesPage';

// Pagina de No Autorizado con redireccion dinamica
const UnauthorizedPage = () => {
  const { getRedirectPath, isAuthenticated } = useAuth();
  const redirectPath = isAuthenticated ? getRedirectPath() : '/login';

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#dc2626' }}>Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta seccion.</p>
      <a href={redirectPath} style={{ color: '#2563eb', textDecoration: 'underline' }}>
        Volver al inicio
      </a>
    </div>
  );
};



export const AppRoutes = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Rutas publicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Politica de Privacidad y Terminos - PUBLICO (Google Play Console) */}
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />

        {/* ============================================== */}
        {/* RUTAS COMPARTIDAS - GERENTE y BASE */}
        {/* ============================================== */}

        {/* Dashboard - GERENTE y BASE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Clientes - GERENTE y BASE */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <CustomersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Pedidos - GERENTE, BASE y REPARTIDOR */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE', 'REPARTIDOR']}>
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE', 'REPARTIDOR']}>
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Historial de Ventas - GERENTE y BASE */}
        <Route
          path="/sales-history"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <SalesHistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Mantenimiento - GERENTE y BASE */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <MaintenancePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Creditos de Clientes - GERENTE y BASE */}
        <Route
          path="/customer-credits"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <CustomerCreditsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Almacenes - GERENTE y BASE (acceso simple para BASE) */}
        <Route
          path="/catalogs/warehouses"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <WarehousesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================== */}
        {/* RUTAS EXCLUSIVAS - SOLO GERENTE */}
        {/* ============================================== */}

        {/* Catalogos - Solo GERENTE */}
        <Route
          path="/catalogs/brands"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <BrandsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/catalogs/suppliers"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <SuppliersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Productos - GERENTE y BASE (BASE solo lectura) */}
        <Route
          path="/catalogs/products"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <ProductsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Colaboradores - Solo GERENTE */}
        <Route
          path="/collaborators"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <CollaboratorsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Inventario y Prestamos - GERENTE y BASE */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <InventoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* GANAGAS - Sistema de Compensacion - Solo GERENTE */}
        <Route
          path="/ganagas"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <GanagasPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Configuracion - Solo GERENTE */}
        <Route
          path="/settings/configurations"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <ConfigurationsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Metodos de Pago - Solo GERENTE */}
        <Route
          path="/settings/payment-methods"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <PaymentMethodsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Categorias de Gastos - Solo GERENTE */}
        <Route
          path="/settings/expense-categories"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <ExpenseCategoriesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Politicas y Terminos - Solo GERENTE (edicion) */}
        <Route
          path="/settings/legal"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <LegalDocumentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Cajas - GERENTE y BASE */}
        <Route
          path="/cash-registers"
          element={
            <ProtectedRoute roles={['GERENTE', 'BASE']}>
              <MainLayout>
                <CashRegistersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* OSINERGMIN - Solo GERENTE */}
        <Route
          path="/osinergmin"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <OsinergminPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Reportes de Utilidad - Solo GERENTE */}
        <Route
          path="/profit-reports"
          element={
            <ProtectedRoute roles={['GERENTE']}>
              <MainLayout>
                <ProfitReportPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================== */}
        {/* RUTAS REPARTIDOR */}
        {/* ============================================== */}

        {/* Panel Repartidor - Dashboard */}
        <Route
          path="/repartidor"
          element={
            <ProtectedRoute roles={['REPARTIDOR']}>
              <MainLayout>
                <RepartidorPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Repartidor - Entregas */}
        <Route
          path="/repartidor/entregas"
          element={
            <ProtectedRoute roles={['REPARTIDOR']}>
              <MainLayout>
                <RepartidorEntregasPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Repartidor - Cobros */}
        <Route
          path="/repartidor/cobros"
          element={
            <ProtectedRoute roles={['REPARTIDOR']}>
              <MainLayout>
                <RepartidorCobrosPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Repartidor - Mantenimiento */}
        <Route
          path="/repartidor/mantenimiento"
          element={
            <ProtectedRoute roles={['REPARTIDOR']}>
              <MainLayout>
                <RepartidorMantenimientoPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Repartidor - Mi Caja */}
        <Route
          path="/repartidor/caja"
          element={
            <ProtectedRoute roles={['REPARTIDOR']}>
              <MainLayout>
                <RepartidorCajaPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Repartidor - Notificaciones */}
        <Route
          path="/repartidor/notificaciones"
          element={
            <ProtectedRoute roles={['REPARTIDOR']}>
              <MainLayout>
                <RepartidorNotificacionesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================== */}
        {/* PORTAL CLIENTE - Rutas para rol CLIENTE */}
        {/* ============================================== */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <PortalHomePage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/create-order"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <CreateOrderPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/orders"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <MyOrdersPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/orders/:orderId"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <OrderDetailPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/loans"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <MyLoansPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/ganagas"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <MyGanagasPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/referrals"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <MyReferralsPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/notifications"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <NotificationsPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/profile"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <ProfilePage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/osinergmin"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <PortalLayout>
                <PortalOsinergminPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
