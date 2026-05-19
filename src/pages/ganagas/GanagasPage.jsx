import { useState, useEffect } from 'react';
import { useGanagasApi } from '../../hooks/useApi/useGanagasApi';
import { GanagasSummaryCards } from '../../components/ganagas/GanagasSummaryCards';
import { GanagasMovementTable } from '../../components/ganagas/GanagasMovementTable';
import { BirthdayCustomersList } from '../../components/ganagas/BirthdayCustomersList';
import { AdjustmentForm } from '../../components/ganagas/AdjustmentForm';
import '../../styles/components/ganagas.css';

export const GanagasPage = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [birthdayCustomers, setBirthdayCustomers] = useState([]);

  const {
    loading,
    error,
    fetchSummary,
    fetchRecentMovements,
    fetchBirthdayCustomers,
    registerAdjustment
  } = useGanagasApi();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'resumen') {
        const summaryData = await fetchSummary();
        setSummary(summaryData);
        const birthdays = await fetchBirthdayCustomers();
        setBirthdayCustomers(birthdays);
      } else if (activeTab === 'movimientos') {
        const movements = await fetchRecentMovements(50);
        setRecentMovements(movements);
      }
    } catch (err) {
      console.error('Error al cargar datos GANAGAS:', err);
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
    <div className="ganagas-page">
      <div className="ganagas-container">
        <div className="ganagas-header">
          <h1 className="ganagas-title">
            <span className="ganagas-title-icon">💰</span>
            Mi GANAGAS
          </h1>
          <p className="ganagas-subtitle">Sistema de Compensacion y Bonos</p>
        </div>

        <div className="ganagas-tabs">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`ganagas-tab ${activeTab === 'resumen' ? 'ganagas-tab--active' : ''}`}
          >
            <span className="ganagas-tab-icon">📊</span>
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('movimientos')}
            className={`ganagas-tab ${activeTab === 'movimientos' ? 'ganagas-tab--active' : ''}`}
          >
            <span className="ganagas-tab-icon">📋</span>
            Movimientos
          </button>
        </div>

        {error && (
          <div className="ganagas-error">
            <span className="ganagas-error-icon">⚠️</span>
            <span className="ganagas-error-text">Error: {error}</span>
          </div>
        )}

        {activeTab === 'resumen' && (
          <div className="ganagas-tab-content">
            <div className="ganagas-actions">
              <button
                onClick={() => setShowAdjustmentModal(true)}
                className="ganagas-btn ganagas-btn--primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
                </svg>
                Ajuste Manual
              </button>
            </div>

            <GanagasSummaryCards summary={summary} loading={loading} />

            <div className="ganagas-grid">
              <BirthdayCustomersList
                customers={birthdayCustomers}
                loading={loading}
              />
            </div>
          </div>
        )}

        {activeTab === 'movimientos' && (
          <div className="ganagas-tab-content">
            <GanagasMovementTable data={recentMovements} loading={loading} />
          </div>
        )}

        {showAdjustmentModal && (
          <div className="ganagas-modal-overlay">
            <div className="ganagas-modal">
              <div className="ganagas-modal-header">
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="ganagas-modal-close"
                >
                  ×
                </button>
              </div>
              <div className="ganagas-modal-body">
                <AdjustmentForm
                  onSubmit={handleAdjustmentSubmit}
                  onCancel={() => setShowAdjustmentModal(false)}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
