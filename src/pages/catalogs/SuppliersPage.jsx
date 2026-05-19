import { useState, useEffect, useRef } from 'react';
import { useSupplierApi } from '../../hooks/useApi/useSupplierApi';
import { useDebounce } from '../../hooks/useDebounce';
import { TablaProveedores } from '../../components/suppliers/TablaProveedores';
import { ModalProveedor } from '../../components/suppliers/ModalProveedor';
import { ENTITY_STATUS_OPTIONS } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const SuppliersPage = () => {
  const {
    data,
    loading,
    error,
    pagination,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError
  } = useSupplierApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(filters.search, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    loadSuppliers();
  }, [currentPage]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
    fetchSuppliers({
      page: 1,
      limit: 10,
      search: debouncedSearch,
      status: filters.status
    });
  }, [debouncedSearch, filters.status]);

  const loadSuppliers = () => {
    fetchSuppliers({
      page: currentPage,
      limit: 10,
      search: filters.search,
      status: filters.status
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = (supplier = null) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSupplier(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    let response;

    if (selectedSupplier) {
      response = await updateSupplier(selectedSupplier.id, formData);
    } else {
      response = await createSupplier(formData);
    }

    if (response.success) {
      handleCloseModal();
      loadSuppliers();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Esta seguro de eliminar este proveedor?')) {
      const response = await deleteSupplier(id);
      if (response.success) {
        loadSuppliers();
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`catalog-pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="catalog-pagination">
        <div className="catalog-pagination-info">
          Mostrando {((currentPage - 1) * pagination.limit) + 1} -{' '}
          {Math.min(currentPage * pagination.limit, pagination.total)} de{' '}
          {pagination.total} proveedores
        </div>
        <div className="catalog-pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="catalog-pagination-btn"
          >
            Anterior
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="catalog-pagination-btn"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Gestion de Proveedores</h1>
          <p className="catalog-subtitle">Administra los proveedores de tu negocio</p>
        </div>
        <div className="catalog-actions">
          <button
            onClick={() => handleOpenModal()}
            className="catalog-btn catalog-btn-primary"
          >
            + Nuevo Proveedor
          </button>
        </div>
      </div>

      {error && (
        <div className="catalog-error">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={clearError}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            &times;
          </button>
        </div>
      )}

      <div className="catalog-search-section">
        <div className="catalog-search-form">
          <div className="catalog-search-input-group">
            <label htmlFor="search" className="catalog-search-label">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar por RUC o razon social..."
              className="catalog-search-input"
            />
          </div>
          <div className="catalog-search-input-group">
            <label className="catalog-search-label">Estado</label>
            <select
              className="catalog-search-input"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Todos los estados</option>
              {ENTITY_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <TablaProveedores
        data={data}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      {renderPagination()}

      <ModalProveedor
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplier={selectedSupplier}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
