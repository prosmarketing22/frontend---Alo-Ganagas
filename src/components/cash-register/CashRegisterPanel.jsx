import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { CashRegisterExpenseModal } from './CashRegisterExpenseModal';
import { CashRegisterCloseModal } from './CashRegisterCloseModal';
import { CashRegisterMovementsModal } from './CashRegisterMovementsModal';
import './CashRegisterPanel.css';

export const CashRegisterPanel = () => {
  const {
    activeRegister,
    history,
    loading,
    fetchMyActiveRegister,
    fetchMyHistory,
    addJustification
  } = useCashRegisterApi();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [justification, setJustification] = useState('');
  const [savingJustification, setSavingJustification] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchMyActiveRegister();
  };

  const loadHistory = async () => {
    if (!showHistory) {
      await fetchMyHistory(10);
    }
    setShowHistory(!showHistory);
  };

  const handleExpenseAdded = () => {
    setShowExpenseModal(false);
    loadData();
  };

  const handleClosed = () => {
    setShowCloseModal(false);
    loadData();
  };

  const handleAddJustification = async () => {
    if (!justification.trim() || !activeRegister) return;

    setSavingJustification(true);
    try {
      await addJustification(activeRegister.id, { justification });
      setJustification('');
      await loadData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSavingJustification(false);
    }
  };

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ABIERTA': { label: 'Abierta', class: 'panel__status--open' },
      'CERRADA': { label: 'Cerrada', class: 'panel__status--closed' },
      'PENDIENTE_APROBACION': { label: 'Pendiente', class: 'panel__status--pending' },
      'APROBADA': { label: 'Aprobada', class: 'panel__status--approved' },
      'OBSERVADA': { label: 'Observada', class: 'panel__status--observed' }
    };
    return statusMap[status] || { label: status, class: '' };
  };

  if (loading && !activeRegister) {
    return (
      <div className="cash-register-panel">
        <div className="panel__loading">
          <div className="panel__spinner"></div>
          <p>Verificando tu caja...</p>
        </div>
      </div>
    );
  }

  // No tiene caja abierta
  if (!activeRegister) {
    return (
      <div className="cash-register-panel">
        <div className="panel__no-register">
          <div className="panel__no-register-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3>Sin Caja Abierta</h3>
          <p>No tienes una caja abierta para el dia de hoy.</p>
          <p className="panel__no-register-hint">
            Contacta a tu supervisor para que te abra la caja antes de iniciar tus entregas.
          </p>

          {/* Historial */}
          <button className="panel__btn-history" onClick={loadHistory}>
            {showHistory ? 'Ocultar historial' : 'Ver historial de cajas'}
          </button>

          {showHistory && history.length > 0 && (
            <div className="panel__history-mini">
              {history.slice(0, 5).map(reg => (
                <div key={reg.id} className="panel__history-item">
                  <span>{reg.register_number}</span>
                  <span>{formatDate(reg.date)}</span>
                  <span className={`panel__status ${getStatusBadge(reg.status).class}`}>
                    {getStatusBadge(reg.status).label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calcular totales
  const totalIncome = parseFloat(activeRegister.total_income || 0);
  const totalExpenses = parseFloat(activeRegister.total_expenses || 0);
  const initialTotal = (activeRegister.balances || []).reduce(
    (sum, b) => sum + parseFloat(b.initial_amount || 0), 0
  );
  const expectedTotal = initialTotal + totalIncome - totalExpenses;

  const statusBadge = getStatusBadge(activeRegister.status);

  return (
    <div className="cash-register-panel">
      <div className="panel__header">
        <div className="panel__header-info">
          <h3>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="3" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            Mi Caja - {activeRegister.register_number}
          </h3>
          <span className={`panel__status ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
        </div>
        <p className="panel__date">Fecha: {formatDate(activeRegister.date)}</p>
      </div>

      {/* Alerta si esta observada */}
      {activeRegister.status === 'OBSERVADA' && (
        <div className="panel__alert panel__alert--warning">
          <strong>Caja Observada</strong>
          <p>Tu caja ha sido observada. Por favor revisa la observacion y agrega una justificacion.</p>
          {activeRegister.observations?.filter(o => o.type === 'observacion').map((obs, i) => (
            <div key={i} className="panel__observation">
              <small>{formatDateTime(obs.created_at)}</small>
              <p>{obs.content}</p>
            </div>
          ))}

          <div className="panel__justify-form">
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Escribe tu justificacion..."
              rows={3}
            />
            <button
              onClick={handleAddJustification}
              disabled={!justification.trim() || savingJustification}
            >
              {savingJustification ? 'Enviando...' : 'Enviar Justificacion'}
            </button>
          </div>
        </div>
      )}

      {/* Resumen de saldos */}
      <div className="panel__summary">
        <div className="panel__summary-item">
          <span>Saldo Inicial</span>
          <strong>{formatCurrency(initialTotal)}</strong>
        </div>
        <div className="panel__summary-item panel__summary-item--income">
          <span>Ingresos</span>
          <strong>+{formatCurrency(totalIncome)}</strong>
        </div>
        <div className="panel__summary-item panel__summary-item--expense">
          <span>Gastos</span>
          <strong>-{formatCurrency(totalExpenses)}</strong>
        </div>
        <div className="panel__summary-item panel__summary-item--total">
          <span>Saldo Esperado</span>
          <strong>{formatCurrency(expectedTotal)}</strong>
        </div>
      </div>

      {/* Desglose por metodo de pago */}
      <div className="panel__balances">
        <h4>Desglose por Metodo de Pago</h4>
        <div className="panel__balances-grid">
          {(activeRegister.balances || []).map(balance => {
            const initial = parseFloat(balance.initial_amount || 0);
            const income = parseFloat(balance.income || 0);
            const expense = parseFloat(balance.expense || 0);
            const expected = initial + income - expense;

            return (
              <div key={balance.id} className="panel__balance-card">
                <span className="panel__balance-method">{balance.payment_method}</span>
                <div className="panel__balance-details">
                  <div><small>Inicial:</small> {formatCurrency(initial)}</div>
                  <div className="panel__balance-income"><small>+Ingresos:</small> {formatCurrency(income)}</div>
                  <div className="panel__balance-expense"><small>-Gastos:</small> {formatCurrency(expense)}</div>
                  <div className="panel__balance-expected"><small>Esperado:</small> <strong>{formatCurrency(expected)}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de gastos */}
      {activeRegister.expenses && activeRegister.expenses.length > 0 && (
        <div className="panel__expenses">
          <h4>Gastos Registrados ({activeRegister.expenses.length})</h4>
          <div className="panel__expenses-list">
            {activeRegister.expenses.map(expense => (
              <div key={expense.id} className="panel__expense-item">
                <div className="panel__expense-info">
                  <strong>{expense.category?.name || 'Sin categoria'}</strong>
                  <span>{expense.description}</span>
                  <small>{expense.payment_method} - {formatDateTime(expense.created_at)}</small>
                </div>
                <span className="panel__expense-amount">-{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      {activeRegister.status === 'ABIERTA' && (
        <div className="panel__actions">
          <button
            className="panel__btn panel__btn--secondary"
            onClick={() => setShowMovementsModal(true)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Movimientos
          </button>
          <button
            className="panel__btn panel__btn--warning"
            onClick={() => setShowExpenseModal(true)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrar Gasto
          </button>
          <button
            className="panel__btn panel__btn--danger"
            onClick={() => setShowCloseModal(true)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cerrar Caja
          </button>
        </div>
      )}

      {/* Boton ver historial */}
      <div className="panel__footer">
        <button className="panel__btn-history" onClick={loadHistory}>
          {showHistory ? 'Ocultar historial' : 'Ver historial de cajas'}
        </button>

        {showHistory && history.length > 0 && (
          <div className="panel__history-mini">
            {history.map(reg => (
              <div key={reg.id} className="panel__history-item">
                <span>{reg.register_number}</span>
                <span>{formatDate(reg.date)}</span>
                <span className={`panel__status ${getStatusBadge(reg.status).class}`}>
                  {getStatusBadge(reg.status).label}
                </span>
                <span>{formatCurrency(reg.total_income)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showExpenseModal && (
        <CashRegisterExpenseModal
          cashRegisterId={activeRegister.id}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={handleExpenseAdded}
        />
      )}

      {showCloseModal && (
        <CashRegisterCloseModal
          cashRegister={activeRegister}
          onClose={() => setShowCloseModal(false)}
          onSuccess={handleClosed}
        />
      )}

      {showMovementsModal && (
        <CashRegisterMovementsModal
          cashRegisterId={activeRegister.id}
          onClose={() => setShowMovementsModal(false)}
        />
      )}
    </div>
  );
};

export default CashRegisterPanel;
