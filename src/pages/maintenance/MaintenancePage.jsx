import { useState, useEffect } from 'react';
import { useMaintenanceApi } from '../../hooks/useApi/useMaintenanceApi';
import { MaintenanceRequestTable, MaintenanceHistoryTable } from '../../components/maintenance';
import maintenanceService from '../../services/maintenanceService';
import '../../styles/components/maintenance.css';

export const MaintenancePage = () => {
  const {
    data: requestsData,
    loading: requestsLoading,
    pagination: requestsPagination,
    fetchAllRequests
  } = useMaintenanceApi();

  const [activeTab, setActiveTab] = useState('requests');
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesPagination, setServicesPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({
    pending: 0,
    thisMonth: 0,
    completed: 0,
    scheduled: 0
  });

  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && services.length === 0 && !servicesLoading) {
      loadServices(1);
    }
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      await fetchAllRequests({ page: 1, limit: 10, status: 'PENDIENTE' });
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    }
  };

  const loadServices = async (page = 1) => {
    setServicesLoading(true);
    try {
      const response = await maintenanceService.getAllServices({ page, limit: 10 });
      if (response.success) {
        setServices(response.data || []);
        if (response.pagination) {
          setServicesPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await maintenanceService.getStats();
      if (response.success && response.data) {
        setStats({
          pending: response.data.pending_requests || 0,
          thisMonth: response.data.completed_this_month || 0,
          completed: response.data.completed_today || 0,
          scheduled: response.data.scheduled_count || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRequestsPageChange = (newPage) => {
    fetchAllRequests({ page: newPage, limit: 10, status: 'PENDIENTE' });
  };

  const handleServicesPageChange = (newPage) => {
    loadServices(newPage);
  };

  const currentData = activeTab === 'requests' ? requestsData : services;
  const currentLoading = activeTab === 'requests' ? requestsLoading : servicesLoading;
  const currentPagination = activeTab === 'requests' ? requestsPagination : servicesPagination;
  const handlePageChange = activeTab === 'requests' ? handleRequestsPageChange : handleServicesPageChange;
  const entityLabel = activeTab === 'requests' ? 'solicitudes' : 'servicios';

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        {/* Header */}
        <div className="maintenance-header">
          <div className="maintenance-header-left">
            <h1 className="maintenance-title">
              <span className="maintenance-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </span>
              Mantenimiento
            </h1>
            <p className="maintenance-subtitle">
              Gestion de servicios de mantenimiento preventivo y correctivo para clientes
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="maintenance-summary">
          <div className="maintenance-card maintenance-card--pending">
            <div className="maintenance-card-header">
              <span className="maintenance-card-label">Pendientes</span>
              <div className="maintenance-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <div className="maintenance-card-value">{stats.pending}</div>
            <div className="maintenance-card-detail">Solicitudes pendientes</div>
          </div>

          <div className="maintenance-card maintenance-card--month">
            <div className="maintenance-card-header">
              <span className="maintenance-card-label">Este Mes</span>
              <div className="maintenance-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <div className="maintenance-card-value">{stats.thisMonth}</div>
            <div className="maintenance-card-detail">Servicios realizados</div>
          </div>

          <div className="maintenance-card maintenance-card--completed">
            <div className="maintenance-card-header">
              <span className="maintenance-card-label">Completados</span>
              <div className="maintenance-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
            <div className="maintenance-card-value">{stats.completed}</div>
            <div className="maintenance-card-detail">Total historico</div>
          </div>

          <div className="maintenance-card maintenance-card--scheduled">
            <div className="maintenance-card-header">
              <span className="maintenance-card-label">Programados</span>
              <div className="maintenance-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                </svg>
              </div>
            </div>
            <div className="maintenance-card-value">{stats.scheduled}</div>
            <div className="maintenance-card-detail">Para esta semana</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="maintenance-tabs">
          <button
            className={`maintenance-tabs__btn ${activeTab === 'requests' ? 'maintenance-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Solicitudes Pendientes
            {stats.pending > 0 && (
              <span className="maintenance-tabs__badge maintenance-tabs__badge--warning">{stats.pending}</span>
            )}
          </button>
          <button
            className={`maintenance-tabs__btn ${activeTab === 'history' ? 'maintenance-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Historial de Servicios
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' && (
          <MaintenanceRequestTable
            requests={requestsData}
            loading={requestsLoading}
            totalCount={requestsPagination?.total || 0}
          />
        )}

        {activeTab === 'history' && (
          <MaintenanceHistoryTable
            services={services}
            loading={servicesLoading}
            totalCount={servicesPagination?.total || 0}
          />
        )}

        {/* Pagination */}
        {!currentLoading && currentData.length > 0 && (
          <div className="maintenance-pagination">
            <div className="maintenance-pagination-info">
              Mostrando <strong>{(currentPagination.page - 1) * currentPagination.limit + 1}</strong> a{' '}
              <strong>{Math.min(currentPagination.page * currentPagination.limit, currentPagination.total)}</strong> de{' '}
              <strong>{currentPagination.total}</strong> {entityLabel}
            </div>
            <div className="maintenance-pagination-controls">
              <button
                className="maintenance-pagination-btn"
                onClick={() => handlePageChange(currentPagination.page - 1)}
                disabled={currentPagination.page === 1}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Anterior
              </button>
              <span className="maintenance-pagination-current">
                Pagina {currentPagination.page} de {currentPagination.totalPages}
              </span>
              <button
                className="maintenance-pagination-btn"
                onClick={() => handlePageChange(currentPagination.page + 1)}
                disabled={currentPagination.page === currentPagination.totalPages}
              >
                Siguiente
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
