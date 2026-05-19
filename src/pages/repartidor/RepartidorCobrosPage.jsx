import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepartidorApi } from '../../hooks/useApi/useRepartidorApi';
import { DevolucionEnvasesModal } from '../../components/repartidor/DevolucionEnvasesModal';
import { RepartidorCreditosTab } from '../../components/repartidor/RepartidorCreditosTab';
import '../../styles/components/customerCredits.css';
import './RepartidorCobrosPage.css';

// Card de cliente integrada
const CustomerCard = ({ customer, onRegisterReturn }) => {
  const prestamos = customer.prestamos || [];
  const totalBalones = prestamos.reduce((sum, p) => sum + (p.cantidad_pendiente || 0), 0);

  return (
    <div className="customer-card">
      <div className="customer-card__header">
        <div className="customer-card__info">
          <h3 className="customer-card__name">{customer.customer_name || 'Sin nombre'}</h3>
          <p className="customer-card__phone">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {customer.customer_phone || 'Sin telefono'}
          </p>
        </div>
        <div className="customer-card__badge">
          <span className="customer-card__badge-value">{totalBalones}</span>
          <span className="customer-card__badge-label">Balones</span>
        </div>
      </div>

      <div className="customer-card__details">
        <div className="customer-card__detail">
          <span className="customer-card__detail-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <span className="customer-card__detail-text">{customer.address || 'Sin direccion'}</span>
        </div>
        {customer.reference && (
          <div className="customer-card__detail">
            <span className="customer-card__detail-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="customer-card__detail-text">{customer.reference}</span>
          </div>
        )}
      </div>

      {prestamos.length > 0 && (
        <div className="customer-card__loans">
          <p className="customer-card__loans-title">Balones prestados</p>
          {prestamos.map((prestamo, idx) => (
            <div key={idx} className="customer-card__loan-item">
              <div>
                <span className="customer-card__loan-name">{prestamo.product_name}</span>
                {prestamo.fecha_prestamo_mas_antiguo && (
                  <span className="customer-card__loan-date">
                    ({new Date(prestamo.fecha_prestamo_mas_antiguo).toLocaleDateString('es-PE')})
                  </span>
                )}
              </div>
              <span className="customer-card__loan-qty">{prestamo.cantidad_pendiente} unid.</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => onRegisterReturn(customer)} className="customer-card__action-btn">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Registrar Devolucion
      </button>
    </div>
  );
};

export const RepartidorCobrosPage = () => {
  const navigate = useNavigate();
  const {
    pendingLoans,
    warehouses,
    loading,
    fetchPendingLoans,
    fetchActiveWarehouses,
    searchLoans,
    registerLoanReturn
  } = useRepartidorApi();

  const [activeTab, setActiveTab] = useState('balones');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtener nombre del repartidor desde localStorage
  const getUserName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.full_name || user.name || 'Repartidor';
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return 'Repartidor';
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchPendingLoans(),
        fetchActiveWarehouses()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const result = await searchLoans(searchTerm);
      if (result.success) {
        setSearchResults(result.data || []);
      }
    } catch (error) {
      console.error('Error searching loans:', error);
      alert('Error en la busqueda: ' + error.message);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleRegisterReturn = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSubmitReturn = async (returnData) => {
    try {
      await registerLoanReturn(returnData);
      alert('Devolución registrada correctamente');
      setIsModalOpen(false);
      setSelectedCustomer(null);
      if (isSearching) {
        handleSearch({ preventDefault: () => {} });
      } else {
        await fetchPendingLoans();
      }
    } catch (error) {
      console.error('Error registering return:', error);
      alert('Error al registrar devolución: ' + error.message);
    }
  };

  const displayList = isSearching ? searchResults : pendingLoans;

  return (
    <div className="cobros-page">
      <div className="cobros-page__container">
        {/* Header */}
        <header className="cobros-page__header">
          <button onClick={() => navigate('/repartidor')} className="cobros-page__back-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al panel
          </button>

          <div className="cobros-page__title-section">
            <div className="cobros-page__title-row">
              <div className="cobros-page__title-content">
                <div className="cobros-page__title-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="cobros-page__title">Cobros</h1>
                  <p className="cobros-page__subtitle">Gestiona devoluciones de balones y cobros de créditos</p>
                </div>
              </div>
              <div className="cobros-page__stats-badge">
                <span className="cobros-page__stats-value">{pendingLoans?.length || 0}</span>
                <span className="cobros-page__stats-label">Pendientes</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            background: '#f1f5f9',
            padding: '0.25rem',
            borderRadius: '10px'
          }}>
            <button
              onClick={() => setActiveTab('balones')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                background: activeTab === 'balones' ? 'white' : 'transparent',
                color: activeTab === 'balones' ? '#3b82f6' : '#64748b',
                boxShadow: activeTab === 'balones' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🔵 Balones
            </button>
            <button
              onClick={() => setActiveTab('creditos')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                background: activeTab === 'creditos' ? 'white' : 'transparent',
                color: activeTab === 'creditos' ? '#10b981' : '#64748b',
                boxShadow: activeTab === 'creditos' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              💳 Créditos
            </button>
          </div>
        </header>

        {/* Tab Content: Balones */}
        {activeTab === 'balones' && (
          <>
            {/* Search Bar */}
            <div className="cobros-page__search">
              <form onSubmit={handleSearch} className="cobros-page__search-form">
                <div className="cobros-page__search-input-wrapper">
                  <span className="cobros-page__search-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, telefono o direccion..."
                    className="cobros-page__search-input"
                  />
                </div>
                <button type="submit" className="cobros-page__search-btn">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </button>
                {isSearching && (
                  <button type="button" onClick={handleClearSearch} className="cobros-page__clear-btn">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                )}
              </form>
            </div>

            {/* Content */}
            {loading ? (
              <div className="cobros-page__loading">
                <div className="cobros-page__spinner"></div>
                <p className="cobros-page__loading-text">Cargando clientes...</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="cobros-page__empty">
                <div className="cobros-page__empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="cobros-page__empty-title">
                  {isSearching ? 'No se encontraron resultados' : 'No hay cobros pendientes'}
                </h2>
                <p className="cobros-page__empty-text">
                  {isSearching
                    ? 'Intenta con otros terminos de busqueda'
                    : 'No hay clientes con balones prestados pendientes de devolucion'}
                </p>
              </div>
            ) : (
              <>
                <div className="cobros-page__results-info">
                  <p className="cobros-page__results-count">
                    {displayList.length} cliente{displayList.length !== 1 ? 's' : ''} encontrado{displayList.length !== 1 ? 's' : ''}
                  </p>
                  {isSearching && (
                    <span className="cobros-page__search-indicator">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Resultados de busqueda
                    </span>
                  )}
                </div>
                <div className="cobros-page__cards">
                  {displayList.map((customer) => (
                    <CustomerCard
                      key={customer.customer_id}
                      customer={customer}
                      onRegisterReturn={handleRegisterReturn}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Tab Content: Creditos */}
        {activeTab === 'creditos' && (
          <RepartidorCreditosTab />
        )}
      </div>

      <DevolucionEnvasesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        warehouses={warehouses}
        onSubmit={handleSubmitReturn}
        repartidorName={getUserName()}
      />
    </div>
  );
};
