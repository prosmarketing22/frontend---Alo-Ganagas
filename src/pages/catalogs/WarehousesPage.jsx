import { useState, useEffect, useMemo } from 'react';
import { useWarehouseApi } from '../../hooks/useApi/useWarehouseApi';
import { TablaAlmacenes } from '../../components/warehouses/TablaAlmacenes';
import { ModalAlmacen } from '../../components/warehouses/ModalAlmacen';
import '../../styles/components/warehouses.css';

export const WarehousesPage = () => {
  const {
    data,
    loading,
    error,
    pagination,
    mainWarehouse,
    fetchWarehouses,
    fetchMainWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    setAsMain
  } = useWarehouseApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWarehouses();
    fetchMainWarehouse();
  }, [currentPage]);

  const loadWarehouses = () => {
    fetchWarehouses({ page: currentPage, limit: 10 });
  };

  // Summary calculations
  const summary = useMemo(() => {
    const total = data?.length || 0;
    const active = data?.filter(w => w.is_active).length || 0;
    const inactive = total - active;
    return { total, active, inactive };
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(warehouse => {
      const matchesSearch = searchTerm === '' ||
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (warehouse.address && warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }, [data, searchTerm]);

  const handleCreate = () => {
    setSelectedWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este almacén?')) {
      try {
        await deleteWarehouse(id);
        loadWarehouses();
      } catch (err) {
        alert('Error al eliminar el almacén: ' + err.message);
      }
    }
  };

  const handleSetAsMain = async (id) => {
    if (window.confirm('¿Deseas marcar este almacén como principal?')) {
      try {
        await setAsMain(id);
        loadWarehouses();
        fetchMainWarehouse();
      } catch (err) {
        alert('Error al establecer almacén principal: ' + err.message);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedWarehouse) {
        await updateWarehouse(selectedWarehouse.id, formData);
      } else {
        await createWarehouse(formData);
      }
      setIsModalOpen(false);
      loadWarehouses();
      if (formData.is_main) {
        fetchMainWarehouse();
      }
    } catch (err) {
      alert('Error al guardar el almacén: ' + err.message);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="warehouses-page">
      <div className="warehouses-container">
        {/* Header */}
        <div className="warehouses-header">
          <div className="warehouses-header-left">
            <h1 className="warehouses-title">
              <span className="warehouses-title-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9v.01" />
                  <path d="M9 12v.01" />
                  <path d="M9 15v.01" />
                  <path d="M9 18v.01" />
                </svg>
              </span>
              Gestión de Almacenes
            </h1>
            <p className="warehouses-subtitle">
              Administra los almacenes y puntos de distribución de tu negocio
            </p>
          </div>
          <button className="warehouses-btn warehouses-btn--primary" onClick={handleCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Almacén
          </button>
        </div>

        {/* Summary Cards */}
        <div className="warehouses-summary">
          <div className="warehouses-card warehouses-card--total">
            <div className="warehouses-card-content">
              <div className="warehouses-card-info">
                <div className="warehouses-card-label">Total Almacenes</div>
                <div className="warehouses-card-value">{pagination?.total || summary.total}</div>
                <div className="warehouses-card-detail">Registrados en el sistema</div>
              </div>
              <div className="warehouses-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="warehouses-card warehouses-card--main">
            <div className="warehouses-card-content">
              <div className="warehouses-card-info">
                <div className="warehouses-card-label">Almacén Principal</div>
                <div className="warehouses-card-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                  {mainWarehouse?.name || 'Sin asignar'}
                </div>
                <div className="warehouses-card-detail">
                  {mainWarehouse?.address || 'Configura un almacén principal'}
                </div>
              </div>
              <div className="warehouses-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="warehouses-card warehouses-card--active">
            <div className="warehouses-card-content">
              <div className="warehouses-card-info">
                <div className="warehouses-card-label">Activos</div>
                <div className="warehouses-card-value">{summary.active}</div>
                <div className="warehouses-card-detail">Almacenes operativos</div>
              </div>
              <div className="warehouses-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="warehouses-card warehouses-card--inactive">
            <div className="warehouses-card-content">
              <div className="warehouses-card-info">
                <div className="warehouses-card-label">Inactivos</div>
                <div className="warehouses-card-value">{summary.inactive}</div>
                <div className="warehouses-card-detail">Almacenes deshabilitados</div>
              </div>
              <div className="warehouses-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="warehouses-filters">
          <div className="warehouses-filter-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="warehouses-filter-title">Filtros de Búsqueda</span>
          </div>
          <div className="warehouses-filter-form">
            <div className="warehouses-filter-group">
              <label className="warehouses-filter-label">Buscar almacén</label>
              <input
                type="text"
                className="warehouses-filter-input"
                placeholder="Nombre o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="warehouses-btn warehouses-btn--primary" onClick={handleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Buscar
              </button>
              {searchTerm && (
                <button className="warehouses-btn warehouses-btn--secondary" onClick={handleClearFilters}>
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="warehouses-error">
            <span className="warehouses-error-icon">⚠️</span>
            <span className="warehouses-error-text">{error}</span>
          </div>
        )}

        {/* Table */}
        <TablaAlmacenes
          data={filteredData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetAsMain={handleSetAsMain}
          loading={loading}
          totalCount={pagination?.total || 0}
        />

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="warehouses-pagination">
            <div className="warehouses-pagination-info">
              Mostrando {(currentPage - 1) * pagination.limit + 1} a{' '}
              {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} almacenes
            </div>
            <div className="warehouses-pagination-controls">
              <button
                className="warehouses-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Anterior
              </button>
              <span className="warehouses-pagination-current">
                Página {currentPage} de {pagination.totalPages}
              </span>
              <button
                className="warehouses-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Siguiente
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        <ModalAlmacen
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selectedWarehouse}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};
