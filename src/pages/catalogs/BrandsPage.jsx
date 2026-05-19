import { useState, useEffect, useRef } from 'react';
import { useBrandApi } from '../../hooks/useApi/useBrandApi';
import { useDebounce } from '../../hooks/useDebounce';
import { TablaMarcas } from '../../components/brands/TablaMarcas';
import { ModalMarca } from '../../components/brands/ModalMarca';
import { ModalConfirmacion } from '../../components/common/ModalConfirmacion';
import { ENTITY_STATUS, ENTITY_STATUS_OPTIONS } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const BrandsPage = () => {
  const {
    data,
    loading,
    error,
    pagination,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    activateBrand,
    deactivateBrand,
    checkBrandProducts
  } = useBrandApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const debouncedSearch = useDebounce(filters.search, 300);
  const isFirstRender = useRef(true);

  // Estado para modal de confirmacion de eliminacion
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    brandId: null,
    brandName: '',
    productCount: 0,
    hasProducts: false,
    loading: false
  });

  // Estado para modal de confirmacion de cambio de estado
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    brandId: null,
    currentStatus: null,
    loading: false
  });

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadBrands({ page: 1, search: debouncedSearch, status: filters.status });
  }, [debouncedSearch, filters.status]);

  const loadBrands = async (params = {}) => {
    try {
      await fetchBrands({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params
      });
    } catch (err) {
      console.error('Error al cargar marcas:', err);
    }
  };

  const handleOpenModal = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedBrand) {
        await updateBrand(selectedBrand.id, formData);
      } else {
        await createBrand(formData);
      }
      handleCloseModal();
      loadBrands();
    } catch (err) {
      console.error('Error al guardar marca:', err);
    }
  };

  // Abrir modal de confirmacion de eliminacion
  const handleDeleteClick = async (id) => {
    try {
      const checkResult = await checkBrandProducts(id);
      setDeleteModal({
        isOpen: true,
        brandId: id,
        brandName: checkResult.brandName,
        productCount: checkResult.productCount,
        hasProducts: checkResult.hasProducts,
        loading: false
      });
    } catch (err) {
      console.error('Error al verificar productos:', err);
    }
  };

  // Confirmar eliminacion
  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteBrand(deleteModal.brandId);
      setDeleteModal({
        isOpen: false,
        brandId: null,
        brandName: '',
        productCount: 0,
        hasProducts: false,
        loading: false
      });
      loadBrands();
    } catch (err) {
      console.error('Error al eliminar marca:', err);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Cerrar modal de eliminacion
  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      brandId: null,
      brandName: '',
      productCount: 0,
      hasProducts: false,
      loading: false
    });
  };

  // Abrir modal de cambio de estado
  const handleToggleStatusClick = (id, currentStatus) => {
    setStatusModal({
      isOpen: true,
      brandId: id,
      currentStatus,
      loading: false
    });
  };

  // Confirmar cambio de estado
  const handleStatusConfirm = async () => {
    setStatusModal(prev => ({ ...prev, loading: true }));
    try {
      if (statusModal.currentStatus === ENTITY_STATUS.ACTIVE) {
        await deactivateBrand(statusModal.brandId);
      } else {
        await activateBrand(statusModal.brandId);
      }
      setStatusModal({
        isOpen: false,
        brandId: null,
        currentStatus: null,
        loading: false
      });
      loadBrands();
    } catch (err) {
      console.error('Error al cambiar estado de marca:', err);
      setStatusModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Cerrar modal de estado
  const handleStatusCancel = () => {
    setStatusModal({
      isOpen: false,
      brandId: null,
      currentStatus: null,
      loading: false
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (newPage) => {
    loadBrands({ page: newPage });
  };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1 className="catalog-title">Gestion de Marcas</h1>
        <div className="catalog-actions">
          <button className="catalog-btn catalog-btn-primary" onClick={handleOpenModal}>
            Nueva Marca
          </button>
        </div>
      </div>

      <div className="catalog-search-section">
        <div className="catalog-search-form">
          <div className="catalog-search-input-group">
            <label className="catalog-search-label">Buscar</label>
            <input
              type="text"
              className="catalog-search-input"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar por nombre..."
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

      {error && (
        <div className="catalog-error">
          Error: {error}
        </div>
      )}

      <TablaMarcas
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatusClick}
        loading={loading}
      />

      {!loading && data.length > 0 && (
        <div className="catalog-pagination">
          <div className="catalog-pagination-info">
            Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
          </div>
          <div className="catalog-pagination-controls">
            <button
              className="catalog-pagination-btn"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </button>
            <button
              className="catalog-pagination-btn"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de edicion/creacion */}
      <ModalMarca
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedBrand}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Modal de confirmacion de eliminacion */}
      <ModalConfirmacion
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar marca"
        type={deleteModal.hasProducts ? 'warning' : 'danger'}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteModal.loading}
      >
        {deleteModal.hasProducts ? (
          <>
            <p>
              Estas a punto de eliminar la marca{' '}
              <span className="modal-confirm-brand-name">"{deleteModal.brandName}"</span>
            </p>
            <div className="modal-confirm-product-count">
              <span className="modal-confirm-product-count-number">{deleteModal.productCount}</span>
              <span className="modal-confirm-product-count-label">
                producto{deleteModal.productCount !== 1 ? 's' : ''}<br />asociado{deleteModal.productCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="modal-confirm-note">
              <svg className="modal-confirm-note-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Los productos existentes conservaran el registro de esta marca y no se veran afectados.</span>
            </div>
          </>
        ) : (
          <p>
            ¿Estas seguro de eliminar la marca{' '}
            <span className="modal-confirm-brand-name">"{deleteModal.brandName}"</span>?
            <br /><br />
            Esta accion no se puede deshacer.
          </p>
        )}
      </ModalConfirmacion>

      {/* Modal de confirmacion de cambio de estado */}
      <ModalConfirmacion
        isOpen={statusModal.isOpen}
        onClose={handleStatusCancel}
        onConfirm={handleStatusConfirm}
        title={statusModal.currentStatus === ENTITY_STATUS.ACTIVE ? 'Desactivar marca' : 'Activar marca'}
        type={statusModal.currentStatus === ENTITY_STATUS.ACTIVE ? 'warning' : 'success'}
        confirmText={statusModal.currentStatus === ENTITY_STATUS.ACTIVE ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        loading={statusModal.loading}
      >
        {statusModal.currentStatus === ENTITY_STATUS.ACTIVE ? (
          <p>
            Al desactivar esta marca, no podra ser seleccionada para nuevos productos.
            <br /><br />
            Los productos existentes no se veran afectados.
          </p>
        ) : (
          <p>
            Al activar esta marca, estara disponible nuevamente para asignar a productos.
          </p>
        )}
      </ModalConfirmacion>
    </div>
  );
};
