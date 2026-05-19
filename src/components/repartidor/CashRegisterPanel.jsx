import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { useExpenseCategoryApi } from '../../hooks/useApi/useExpenseCategoryApi';
import CashRegisterExpenseModal from './CashRegisterExpenseModal';
import CashRegisterCloseModal from './CashRegisterCloseModal';
import './CashRegisterPanel.css';

const PAYMENT_METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  FISE: 'FISE',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Credito',
  MIXTO: 'Mixto'
};

const STATUS_LABELS = {
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada',
  PENDIENTE_APROBACION: 'Pendiente de Aprobacion',
  APROBADA: 'Aprobada',
  OBSERVADA: 'Observada'
};

const STATUS_COLORS = {
  ABIERTA: 'green',
  CERRADA: 'blue',
  PENDIENTE_APROBACION: 'orange',
  APROBADA: 'teal',
  OBSERVADA: 'red'
};

export const CashRegisterPanel = ({ onNeedOpen }) => {
  const {
    activeRegister,
    loading,
    fetchMyActiveRegister,
    registerExpense,
    deleteExpense,
    closeRegister,
    addJustification
  } = useCashRegisterApi();

  const { categories, fetchCategories } = useExpenseCategoryApi();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [justificationText, setJustificationText] = useState('');
  const [submittingJustification, setSubmittingJustification] = useState(false);

  useEffect(() => {
    fetchMyActiveRegister();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (onNeedOpen && !loading && !activeRegister) {
      onNeedOpen(true);
    } else if (onNeedOpen) {
      onNeedOpen(false);
    }
  }, [activeRegister, loading, onNeedOpen]);

  const handleAddExpense = async (data, voucherFile) => {
    try {
      const result = await registerExpense(activeRegister.id, data, voucherFile);
      if (result.success) {
        setShowExpenseModal(false);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Esta seguro de eliminar este gasto?')) return;
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      alert('Error al eliminar gasto: ' + error.message);
    }
  };

  const handleCloseRegister = async (data) => {
    try {
      const result = await closeRegister(activeRegister.id, data);
      if (result.success) {
        setShowCloseModal(false);
        fetchMyActiveRegister();
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitJustification = async () => {
    if (!justificationText.trim()) {
      alert('Debe ingresar una justificacion');
      return;
    }
    setSubmittingJustification(true);
    try {
      const result = await addJustification(activeRegister.id, { message: justificationText });
      if (result.success) {
        setJustificationText('');
        alert('Justificacion enviada correctamente');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmittingJustification(false);
    }
  };

  if (loading && !activeRegister) {
    return (
      <div className="cash-register-panel">
        <div className="cash-register-panel__loading">Cargando caja...</div>
      </div>
    );
  }

  if (!activeRegister) {
    return (
      <div className="cash-register-panel cash-register-panel--empty">
        <div className="cash-register-panel__no-register">
          <div className="cash-register-panel__no-register-icon">💼</div>
          <h3>No tienes caja abierta</h3>
          <p>Solicita a tu supervisor que abra tu caja del dia para poder registrar entregas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cash-register-panel">
      {/* Header */}
      <div className="cash-register-panel__header">
        <div className="cash-register-panel__title">
          <span className="cash-register-panel__icon">💼</span>
          <span>Caja {activeRegister.register_number}</span>
        </div>
        <span
          className={`cash-register-panel__status cash-register-panel__status--${STATUS_COLORS[activeRegister.register_status]}`}
        >
          {STATUS_LABELS[activeRegister.register_status]}
        </span>
      </div>

      {/* Resumen */}
      <div className="cash-register-panel__summary">
        <div className="cash-register-panel__summary-item">
          <span className="cash-register-panel__summary-label">Pedidos</span>
          <span className="cash-register-panel__summary-value">{activeRegister.orders_count}</span>
        </div>
        <div className="cash-register-panel__summary-item">
          <span className="cash-register-panel__summary-label">Ventas</span>
          <span className="cash-register-panel__summary-value cash-register-panel__summary-value--positive">
            S/ {parseFloat(activeRegister.total_sales || 0).toFixed(2)}
          </span>
        </div>
        <div className="cash-register-panel__summary-item">
          <span className="cash-register-panel__summary-label">Cobros Credito</span>
          <span className="cash-register-panel__summary-value cash-register-panel__summary-value--credit">
            S/ {(activeRegister.credit_collections || []).reduce((sum, c) => sum + parseFloat(c.amount || 0), 0).toFixed(2)}
          </span>
        </div>
        <div className="cash-register-panel__summary-item">
          <span className="cash-register-panel__summary-label">Gastos</span>
          <span className="cash-register-panel__summary-value cash-register-panel__summary-value--negative">
            S/ {parseFloat(activeRegister.total_expenses || 0).toFixed(2)}
          </span>
        </div>
        <div className="cash-register-panel__summary-item cash-register-panel__summary-item--total">
          <span className="cash-register-panel__summary-label">Esperado</span>
          <span className="cash-register-panel__summary-value">
            S/ {parseFloat(activeRegister.total_expected || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Balances por metodo de pago */}
      {activeRegister.balances && activeRegister.balances.length > 0 && (
        <div className="cash-register-panel__balances">
          <h4 className="cash-register-panel__section-title">Saldos por Metodo de Pago</h4>
          <div className="cash-register-panel__balances-grid">
            {activeRegister.balances.map((balance) => (
              <div key={balance.id} className="cash-register-panel__balance-card">
                <div className="cash-register-panel__balance-method">
                  {PAYMENT_METHOD_LABELS[balance.payment_method] || balance.payment_method}
                </div>
                <div className="cash-register-panel__balance-amount">
                  S/ {parseFloat(balance.expected_amount || 0).toFixed(2)}
                </div>
                <div className="cash-register-panel__balance-detail">
                  <span>Apertura: S/ {parseFloat(balance.opening_amount || 0).toFixed(2)}</span>
                  <span>Ventas: +S/ {parseFloat(balance.sales_amount || 0).toFixed(2)}</span>
                  <span>Gastos: -S/ {parseFloat(balance.expenses_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cobros de Creditos */}
      {activeRegister.credit_collections && activeRegister.credit_collections.length > 0 && (
        <div className="cash-register-panel__collections">
          <h4 className="cash-register-panel__section-title">Cobros de Creditos</h4>
          <div className="cash-register-panel__collections-list">
            {activeRegister.credit_collections.map((collection) => (
              <div key={collection.id} className="cash-register-panel__collection-item">
                <div className="cash-register-panel__collection-info">
                  <span className="cash-register-panel__collection-customer">{collection.customer_name}</span>
                  <span className="cash-register-panel__collection-method">
                    {PAYMENT_METHOD_LABELS[collection.payment_method] || collection.payment_method}
                  </span>
                  <span className="cash-register-panel__collection-type">
                    {collection.origin === 'PAGO_TOTAL' ? 'Pago Total' : 'Pago Parcial'}
                  </span>
                </div>
                <div className="cash-register-panel__collection-debt">
                  <span className="cash-register-panel__collection-debt-label">Deuda restante:</span>
                  <span className="cash-register-panel__collection-debt-value">
                    S/ {parseFloat(collection.new_debt || 0).toFixed(2)}
                  </span>
                </div>
                <div className="cash-register-panel__collection-amount">
                  S/ {parseFloat(collection.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gastos registrados */}
      {activeRegister.expenses && activeRegister.expenses.length > 0 && (
        <div className="cash-register-panel__expenses">
          <h4 className="cash-register-panel__section-title">Gastos Registrados</h4>
          <div className="cash-register-panel__expenses-list">
            {activeRegister.expenses.map((expense) => (
              <div key={expense.id} className="cash-register-panel__expense-item">
                <div className="cash-register-panel__expense-info">
                  <span className="cash-register-panel__expense-category">{expense.category_name}</span>
                  <span className="cash-register-panel__expense-method">
                    {PAYMENT_METHOD_LABELS[expense.payment_method]}
                  </span>
                  {expense.description && (
                    <span className="cash-register-panel__expense-desc">{expense.description}</span>
                  )}
                </div>
                <div className="cash-register-panel__expense-amount">
                  S/ {parseFloat(expense.amount).toFixed(2)}
                </div>
                {activeRegister.register_status === 'ABIERTA' && (
                  <button
                    className="cash-register-panel__expense-delete"
                    onClick={() => handleDeleteExpense(expense.id)}
                    title="Eliminar gasto"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observaciones (si la caja fue observada) */}
      {activeRegister.register_status === 'OBSERVADA' && (
        <div className="cash-register-panel__observations">
          <h4 className="cash-register-panel__section-title">Observaciones</h4>
          {activeRegister.observations?.map((obs) => (
            <div
              key={obs.id}
              className={`cash-register-panel__observation cash-register-panel__observation--${obs.observation_type.toLowerCase()}`}
            >
              <div className="cash-register-panel__observation-header">
                <span className="cash-register-panel__observation-type">
                  {obs.observation_type === 'OBSERVACION' ? 'Observacion' : 'Justificacion'}
                </span>
                <span className="cash-register-panel__observation-by">
                  {obs.created_by_name}
                </span>
              </div>
              <p className="cash-register-panel__observation-message">{obs.message}</p>
            </div>
          ))}

          {/* Form para justificacion */}
          <div className="cash-register-panel__justify-form">
            <textarea
              value={justificationText}
              onChange={(e) => setJustificationText(e.target.value)}
              placeholder="Escriba su justificacion..."
              className="cash-register-panel__justify-input"
              rows={3}
            />
            <button
              onClick={handleSubmitJustification}
              disabled={submittingJustification || !justificationText.trim()}
              className="cash-register-panel__justify-btn"
            >
              {submittingJustification ? 'Enviando...' : 'Enviar Justificacion'}
            </button>
          </div>
        </div>
      )}

      {/* Acciones */}
      {activeRegister.register_status === 'ABIERTA' && (
        <div className="cash-register-panel__actions">
          <button
            className="cash-register-panel__btn cash-register-panel__btn--expense"
            onClick={() => setShowExpenseModal(true)}
          >
            + Registrar Gasto
          </button>
          <button
            className="cash-register-panel__btn cash-register-panel__btn--close"
            onClick={() => setShowCloseModal(true)}
          >
            Cerrar Caja
          </button>
        </div>
      )}

      {/* Modales */}
      {showExpenseModal && (
        <CashRegisterExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleAddExpense}
          categories={categories}
          paymentMethods={activeRegister.balances?.map(b => b.payment_method) || ['EFECTIVO']}
        />
      )}

      {showCloseModal && (
        <CashRegisterCloseModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onSubmit={handleCloseRegister}
          cashRegister={activeRegister}
        />
      )}
    </div>
  );
};

export default CashRegisterPanel;
