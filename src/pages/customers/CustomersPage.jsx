import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';
import { Tabs } from '../../components/common/Tabs';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { CustomerBirthdaysTab } from '../../components/customers/CustomerBirthdaysTab';
import { ModalReferidos } from '../../components/customers/ModalReferidos';
import { ModalPreciosEspeciales } from '../../components/customers/ModalPreciosEspeciales';
import { ModalConfirmarEliminacion } from '../../components/customers/ModalConfirmarEliminacion';
import '../../styles/components/customers.css';

export const CustomersPage = () => {
  const {
    data,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    deactivateCustomer,
    activateCustomer,
    getBirthdays
  } = useCustomerApi();

  const [activeTab, setActiveTab] = useState('customers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [isPricesModalOpen, setIsPricesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerForModal, setCustomerForModal] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    customer_type: '',
    loyalty_level: '',
    status: ''
  });

  const debouncedSearch = useDebounce(filters.search, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadCustomers({ page: 1 });
  }, [debouncedSearch, filters.customer_type, filters.loyalty_level, filters.status]);

  const loadCustomers = async (params = {}) => {
    try {
      await fetchCustomers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params
      });
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const handleOpenModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      handleCloseModal();
      loadCustomers();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      alert('Error al guardar el cliente: ' + err.message);
    }
  };

  const handleDelete = async (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      alert('Error al eliminar el cliente: ' + err.message);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const handleViewReferrals = (customer) => {
    setCustomerForModal(customer);
    setIsReferralsModalOpen(true);
  };

  const handleViewPrices = (customer) => {
    setCustomerForModal(customer);
    setIsPricesModalOpen(true);
  };

  const handleToggleStatus = async (customer) => {
    const action = customer.status === 'active' ? 'inactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${action} al cliente "${customer.full_name}"?`)) {
      try {
        if (customer.status === 'active') {
          await deactivateCustomer(customer.id);
        } else {
          await activateCustomer(customer.id);
        }
        loadCustomers();
      } catch (err) {
        console.error(`Error al ${action} cliente:`, err);
        alert(`Error al ${action} el cliente: ` + err.message);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (newPage) => {
    loadCustomers({ page: newPage });
  };

  const handleTypeFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      customer_type: type
    }));
  };

  const customerTypes = [
    { value: '', label: 'Todos', icon: '👤' },
    { value: 'PERSONA_NATURAL', label: 'Personas', icon: '🧑' },
    { value: 'NEGOCIO', label: 'Negocios', icon: '🏪' }
  ];

  const loyaltyLevels = [
    { value: '', label: 'Todos los niveles' },
    { value: 'BRONCE', label: '🥉 Bronce' },
    { value: 'PLATA', label: '🥈 Plata' },
    { value: 'ORO', label: '🥇 Oro' }
  ];

  const tabs = [
    {
      id: 'customers',
      label: 'Clientes',
      icon: '👥',
      content: (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Gestion de Clientes</h2>
            <button onClick={handleOpenModal} className="customers-btn customers-btn--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Cliente
            </button>
          </div>

          <div className="customers-stats">
            <div className="customers-stat">
              <span className="customers-stat-icon">👤</span>
              <div className="customers-stat-info">
                <span className="customers-stat-value">{pagination.total}</span>
                <span className="customers-stat-label">Total Clientes</span>
              </div>
            </div>
          </div>

          <div className="customers-filters">
            <div className="customers-type-tabs">
              {customerTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeFilter(type.value)}
                  className={`customers-type-tab ${filters.customer_type === type.value ? 'customers-type-tab--active' : ''}`}
                >
                  <span className="customers-type-tab-icon">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>

            <div className="customers-filter-form">
              <div className="customers-filter-group">
                <label className="customers-filter-label">Buscar</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="customers-filter-input"
                  placeholder="Buscar por nombre, email, DNI..."
                />
              </div>

              <div className="customers-filter-group">
                <label className="customers-filter-label">Nivel</label>
                <select
                  name="loyalty_level"
                  value={filters.loyalty_level}
                  onChange={handleFilterChange}
                  className="customers-filter-select"
                >
                  {loyaltyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div className="customers-filter-group">
                <label className="customers-filter-label">Estado</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="customers-filter-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="customers-error">
              <span className="customers-error-icon">⚠️</span>
              <span className="customers-error-text">Error: {error}</span>
            </div>
          )}

          <CustomerTable
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewReferrals={handleViewReferrals}
            onViewPrices={handleViewPrices}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />

          {!loading && data.length > 0 && (
            <div className="customers-pagination">
              <div className="customers-pagination-info">
                Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} clientes)
              </div>
              <div className="customers-pagination-controls">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="customers-pagination-btn"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="customers-pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'birthdays',
      label: 'Cumpleanos',
      icon: '🎂',
      content: (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Cumpleanos del Mes</h2>
          </div>

          <CustomerBirthdaysTab
            getBirthdays={getBirthdays}
            loading={loading}
          />
        </div>
      )
    }
  ];

  return (
    <div className="customers-page">
      <div className="customers-container">
        <div className="customers-header">
          <h1 className="customers-title">
            <span className="customers-title-icon">👥</span>
            Gestion de Clientes
          </h1>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {isModalOpen && (
          <div className="customers-modal-overlay" onClick={handleCloseModal}>
            <div className="customers-modal" onClick={(e) => e.stopPropagation()}>
              <div className="customers-modal-header">
                <h2 className="customers-modal-title">
                  {selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button onClick={handleCloseModal} className="customers-modal-close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="customers-modal-body">
                <CustomerForm
                  initialData={selectedCustomer}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseModal}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}

        <ModalReferidos
          customer={customerForModal}
          isOpen={isReferralsModalOpen}
          onClose={() => setIsReferralsModalOpen(false)}
        />

        <ModalPreciosEspeciales
          customer={customerForModal}
          isOpen={isPricesModalOpen}
          onClose={() => setIsPricesModalOpen(false)}
        />

        <ModalConfirmarEliminacion
          customer={customerToDelete}
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};
