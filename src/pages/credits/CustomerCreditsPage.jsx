import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerCreditApi } from '../../hooks/useApi/useCustomerCreditApi';
import { useDebounce } from '../../hooks/useDebounce';
import { CreditsSummaryCards } from '../../components/credits/CreditsSummaryCards';
import { CreditsCustomerTable } from '../../components/credits/CreditsCustomerTable';
import { CreditsHistoryModal } from '../../components/credits/CreditsHistoryModal';
import { CreditsPaymentModal } from '../../components/credits/CreditsPaymentModal';
import { CreditsAdjustmentModal } from '../../components/credits/CreditsAdjustmentModal';
import { CreditsLimitModal } from '../../components/credits/CreditsLimitModal';
import '../../styles/components/customerCredits.css';

export const CustomerCreditsPage = () => {
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    has_debt_only: false
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const {
    loading,
    error,
    pagination,
    fetchSummary,
    fetchCustomersWithDebt,
    registerPayment,
    registerAdjustment
  } = useCustomerCreditApi();

  const debouncedSearch = useDebounce(filters.search, 400);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      loadData(1);
    }
  }, [debouncedSearch, filters.has_debt_only]);

  const loadData = async (page = 1) => {
    try {
      const [summaryData, customersData] = await Promise.all([
        fetchSummary(),
        fetchCustomersWithDebt({
          page,
          limit: 20,
          search: filters.search,
          has_debt_only: filters.has_debt_only
        })
      ]);
      setSummary(summaryData);
      setCustomers(customersData.data || []);
      initialLoadDone.current = true;
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const handlePageChange = (page) => {
    loadData(page);
  };

  const handleViewHistory = (customer) => {
    setSelectedCustomer(customer);
    setShowHistoryModal(true);
  };

  const handleRegisterPayment = (customer) => {
    setSelectedCustomer(customer);
    setShowPaymentModal(true);
  };

  const handleEditLimit = (customer) => {
    setSelectedCustomer(customer);
    setShowLimitModal(true);
  };

  const handleLimitSubmit = async () => {
    setShowLimitModal(false);
    setSelectedCustomer(null);
    loadData();
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      await registerPayment(paymentData);
      alert('Pago registrado exitosamente');
      setShowPaymentModal(false);
      setSelectedCustomer(null);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAdjustmentSubmit = async (adjustmentData) => {
    try {
      await registerAdjustment(adjustmentData);
      alert('Ajuste registrado exitosamente');
      setShowAdjustmentModal(false);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="credits-page">
      <div className="credits-container">
        <div className="credits-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="credits-title">
                <span className="credits-title-icon">💳</span>
                Gestión de Créditos
              </h1>
              <p className="credits-subtitle">Control de créditos y deudas de clientes</p>
            </div>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              style={{
                padding: '0.75rem 1.25rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ⚙️ Ajuste Manual
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#dc2626'
          }}>
            ⚠️ Error: {error}
          </div>
        )}

        <CreditsSummaryCards summary={summary} loading={loading} />

        <div className="credits-filters">
          <div className="credits-filters-row">
            <div className="credits-filter-group" style={{ flex: 1 }}>
              <label className="credits-filter-label">Buscar cliente</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="credits-filter-input"
                placeholder="Nombre, teléfono, dirección..."
              />
            </div>
            <div className="credits-filter-group" style={{ minWidth: '150px' }}>
              <label className="credits-filter-label">Filtrar</label>
              <select
                value={filters.has_debt_only ? 'debt' : 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, has_debt_only: e.target.value === 'debt' }))}
                className="credits-filter-select"
              >
                <option value="all">Todos con crédito</option>
                <option value="debt">Solo con deuda</option>
              </select>
            </div>
          </div>
        </div>

        <CreditsCustomerTable
          customers={customers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewHistory={handleViewHistory}
          onRegisterPayment={handleRegisterPayment}
          onEditLimit={handleEditLimit}
        />

        {showHistoryModal && selectedCustomer && (
          <CreditsHistoryModal
            customer={selectedCustomer}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}

        {showPaymentModal && selectedCustomer && (
          <CreditsPaymentModal
            customer={selectedCustomer}
            onSubmit={handlePaymentSubmit}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedCustomer(null);
            }}
            loading={loading}
          />
        )}

        {showAdjustmentModal && (
          <CreditsAdjustmentModal
            onSubmit={handleAdjustmentSubmit}
            onClose={() => setShowAdjustmentModal(false)}
            loading={loading}
          />
        )}

        {showLimitModal && selectedCustomer && (
          <CreditsLimitModal
            customer={selectedCustomer}
            onSubmit={handleLimitSubmit}
            onClose={() => {
              setShowLimitModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
