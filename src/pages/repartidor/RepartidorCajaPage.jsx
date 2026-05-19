import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { CashRegisterExpenseModal } from '../../components/cash-register/CashRegisterExpenseModal';
import { CashRegisterCloseModal } from '../../components/cash-register/CashRegisterCloseModal';
import { CashRegisterMovementsModal } from '../../components/cash-register/CashRegisterMovementsModal';
import './RepartidorCajaPage.css';

export const RepartidorCajaPage = () => {
  const {
    activeRegister,
    history,
    paymentMethods,
    loading,
    fetchMyActiveRegister,
    fetchMyHistory,
    fetchPaymentMethods,
    openRegister,
    addJustification
  } = useCashRegisterApi();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  // Form para abrir caja
  const [openingBalances, setOpeningBalances] = useState([]);
  const [openingNotes, setOpeningNotes] = useState('');
  const [openingError, setOpeningError] = useState('');
  const [saving, setSaving] = useState(false);

  // Justificacion
  const [justification, setJustification] = useState('');
  const [savingJustification, setSavingJustification] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchMyActiveRegister(),
      fetchPaymentMethods()
    ]);
  };

  const loadHistory = async () => {
    await fetchMyHistory(20);
    setActiveTab('history');
  };

  // Inicializar balances de apertura
  const initOpeningBalances = () => {
    const defaultMethods = ['EFECTIVO', 'YAPE', 'PLIN'];
    setOpeningBalances(defaultMethods.map(method => ({
      payment_method: method,
      amount: ''
    })));
    setOpeningNotes('');
    setOpeningError('');
    setShowOpenForm(true);
  };

  const addBalanceRow = () => {
    const availableMethods = paymentMethods.filter(
      m => !openingBalances.find(b => b.payment_method === m)
    );
    if (availableMethods.length > 0) {
      setOpeningBalances([
        ...openingBalances,
        { payment_method: availableMethods[0], amount: '' }
      ]);
    }
  };

  const removeBalanceRow = (index) => {
    setOpeningBalances(openingBalances.filter((_, i) => i !== index));
  };

  const updateBalance = (index, field, value) => {
    const updated = [...openingBalances];
    updated[index][field] = value;
    setOpeningBalances(updated);
  };

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    setOpeningError('');

    setSaving(true);
    try {
      const result = await openRegister({
        opening_balances: openingBalances
          .filter(b => parseFloat(b.amount || 0) >= 0)
          .map(b => ({
            payment_method: b.payment_method,
            amount: parseFloat(b.amount || 0)
          })),
        notes: openingNotes.trim()
      });

      if (result.success) {
        setShowOpenForm(false);
        await loadData();
      }
    } catch (error) {
      setOpeningError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddJustification = async () => {
    if (!justification.trim() || !activeRegister) return;

    setSavingJustification(true);
    try {
      await addJustification(activeRegister.id, { message: justification });
      setJustification('');
      await loadData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSavingJustification(false);
    }
  };

  const handleExpenseAdded = () => {
    setShowExpenseModal(false);
    loadData();
  };

  const handleClosed = () => {
    setShowCloseModal(false);
    loadData();
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
      'ABIERTA': { label: 'Abierta', class: 'caja-page__status--open' },
      'CERRADA': { label: 'Cerrada', class: 'caja-page__status--closed' },
      'PENDIENTE_APROBACION': { label: 'Pendiente', class: 'caja-page__status--pending' },
      'APROBADA': { label: 'Aprobada', class: 'caja-page__status--approved' },
      'OBSERVADA': { label: 'Observada', class: 'caja-page__status--observed' }
    };
    return statusMap[status] || { label: status, class: '' };
  };

  // Calcular totales - usando nombres de campos del backend
  const calculateTotals = () => {
    if (!activeRegister?.balances) return { initial: 0, income: 0, expense: 0, expected: 0 };

    let initial = 0, income = 0, expense = 0;
    activeRegister.balances.forEach(b => {
      initial += parseFloat(b.opening_amount || 0);
      income += parseFloat(b.sales_amount || 0);
      expense += parseFloat(b.expenses_amount || 0);
    });

    return {
      initial,
      income,
      expense,
      expected: initial + income - expense
    };
  };

  const totals = calculateTotals();

  if (loading && !activeRegister && history.length === 0) {
    return (
      <div className="caja-page">
        <div className="caja-page__loading">
          <div className="caja-page__spinner"></div>
          <p>Cargando tu caja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="caja-page">
      <div className="caja-page__header">
        <div>
          <h1>Mi Caja</h1>
          <p>Gestiona tu caja diaria, registra gastos y cierra al final del dia</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="caja-page__tabs">
        <button
          className={`caja-page__tab ${activeTab === 'current' ? 'caja-page__tab--active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Caja Actual
        </button>
        <button
          className={`caja-page__tab ${activeTab === 'history' ? 'caja-page__tab--active' : ''}`}
          onClick={loadHistory}
        >
          Historial
        </button>
      </div>

      {/* Tab: Caja Actual */}
      {activeTab === 'current' && (
        <div className="caja-page__content">
          {/* Sin caja abierta */}
          {!activeRegister && !showOpenForm && (
            <div className="caja-page__no-register">
              <div className="caja-page__no-register-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
              <h3>Sin Caja Abierta</h3>
              <p>No tienes una caja abierta para el dia de hoy.</p>
              <button className="caja-page__btn-open" onClick={initOpeningBalances}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Abrir Mi Caja
              </button>
            </div>
          )}

          {/* Formulario para abrir caja */}
          {!activeRegister && showOpenForm && (
            <div className="caja-page__open-form">
              <h3>Abrir Caja del Dia</h3>
              <p>Ingresa los saldos iniciales que recibes para empezar tu jornada.</p>

              {openingError && (
                <div className="caja-page__error">{openingError}</div>
              )}

              <form onSubmit={handleOpenRegister}>
                <div className="caja-page__balances-section">
                  <div className="caja-page__balances-header">
                    <h4>Saldos Iniciales</h4>
                    <button
                      type="button"
                      className="caja-page__btn-add"
                      onClick={addBalanceRow}
                      disabled={openingBalances.length >= paymentMethods.length}
                    >
                      + Agregar metodo
                    </button>
                  </div>

                  {openingBalances.map((balance, index) => (
                    <div key={index} className="caja-page__balance-row">
                      <select
                        value={balance.payment_method}
                        onChange={e => updateBalance(index, 'payment_method', e.target.value)}
                      >
                        {paymentMethods.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <div className="caja-page__amount-input">
                        <span>S/</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={balance.amount}
                          onChange={e => updateBalance(index, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      {openingBalances.length > 1 && (
                        <button
                          type="button"
                          className="caja-page__btn-remove"
                          onClick={() => removeBalanceRow(index)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="caja-page__field">
                  <label>Notas (opcional)</label>
                  <textarea
                    value={openingNotes}
                    onChange={e => setOpeningNotes(e.target.value)}
                    placeholder="Observaciones al abrir la caja..."
                    rows={2}
                  />
                </div>

                <div className="caja-page__form-actions">
                  <button
                    type="button"
                    className="caja-page__btn caja-page__btn--cancel"
                    onClick={() => setShowOpenForm(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="caja-page__btn caja-page__btn--primary"
                    disabled={saving}
                  >
                    {saving ? 'Abriendo...' : 'Abrir Caja'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Caja activa */}
          {activeRegister && (
            <div className="caja-page__active">
              {/* Header de caja */}
              <div className="caja-page__register-header">
                <div className="caja-page__register-info">
                  <h2>{activeRegister.register_number}</h2>
                  <span className={`caja-page__status ${getStatusBadge(activeRegister.register_status).class}`}>
                    {getStatusBadge(activeRegister.register_status).label}
                  </span>
                </div>
                <p>Fecha: {formatDate(activeRegister.open_date)}</p>
              </div>

              {/* Alerta si esta observada */}
              {activeRegister.register_status === 'OBSERVADA' && (
                <div className="caja-page__alert caja-page__alert--warning">
                  <strong>Caja Observada</strong>
                  <p>Tu caja ha sido observada. Revisa la observacion y agrega tu justificacion.</p>
                  {activeRegister.observations?.filter(o => o.observation_type === 'OBSERVACION').map((obs, i) => (
                    <div key={i} className="caja-page__observation">
                      <small>{formatDateTime(obs.created_at)}</small>
                      <p>{obs.message}</p>
                    </div>
                  ))}

                  <div className="caja-page__justify-form">
                    <textarea
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
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

              {/* Resumen */}
              <div className="caja-page__summary">
                <div className="caja-page__summary-card">
                  <span>Saldo Inicial</span>
                  <strong>{formatCurrency(totals.initial)}</strong>
                </div>
                <div className="caja-page__summary-card caja-page__summary-card--income">
                  <span>Ingresos</span>
                  <strong>+{formatCurrency(totals.income)}</strong>
                </div>
                <div className="caja-page__summary-card caja-page__summary-card--expense">
                  <span>Gastos</span>
                  <strong>-{formatCurrency(totals.expense)}</strong>
                </div>
                <div className="caja-page__summary-card caja-page__summary-card--total">
                  <span>Saldo Esperado</span>
                  <strong>{formatCurrency(totals.expected)}</strong>
                </div>
              </div>

              {/* Ingresos por método de pago */}
              {activeRegister.balances && activeRegister.balances.some(b => parseFloat(b.sales_amount || 0) > 0) && (
                <div className="caja-page__income-breakdown">
                  <h3>Ingresos Recibidos por Método de Pago</h3>
                  <div className="caja-page__income-grid">
                    {activeRegister.balances
                      .filter(b => parseFloat(b.sales_amount || 0) > 0)
                      .map(balance => (
                        <div key={balance.id} className="caja-page__income-item">
                          <span className="caja-page__income-method">{balance.payment_method}</span>
                          <span className="caja-page__income-amount">{formatCurrency(balance.sales_amount)}</span>
                        </div>
                      ))}
                    <div className="caja-page__income-item caja-page__income-item--total">
                      <span className="caja-page__income-method">TOTAL</span>
                      <span className="caja-page__income-amount">{formatCurrency(totals.income)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Desglose por metodo */}
              <div className="caja-page__balances">
                <h3>Desglose por Metodo de Pago</h3>
                <div className="caja-page__balances-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Metodo</th>
                        <th>Inicial</th>
                        <th>Ingresos</th>
                        <th>Gastos</th>
                        <th>Esperado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeRegister.balances || []).map(balance => {
                        const initial = parseFloat(balance.opening_amount || 0);
                        const income = parseFloat(balance.sales_amount || 0);
                        const expense = parseFloat(balance.expenses_amount || 0);
                        const expected = parseFloat(balance.expected_amount || (initial + income - expense));

                        return (
                          <tr key={balance.id}>
                            <td><strong>{balance.payment_method}</strong></td>
                            <td>{formatCurrency(initial)}</td>
                            <td className="caja-page__amount--income">+{formatCurrency(income)}</td>
                            <td className="caja-page__amount--expense">-{formatCurrency(expense)}</td>
                            <td><strong>{formatCurrency(expected)}</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lista de gastos */}
              {activeRegister.expenses && activeRegister.expenses.length > 0 && (
                <div className="caja-page__expenses">
                  <h3>Gastos Registrados ({activeRegister.expenses.length})</h3>
                  <div className="caja-page__expenses-list">
                    {activeRegister.expenses.map(expense => (
                      <div key={expense.id} className="caja-page__expense-item">
                        <div className="caja-page__expense-info">
                          <strong>{expense.category_name || 'Sin categoria'}</strong>
                          <span>{expense.description || '-'}</span>
                          <small>{expense.payment_method} - {formatDateTime(expense.expense_date)}</small>
                        </div>
                        <span className="caja-page__expense-amount">-{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              {activeRegister.register_status === 'ABIERTA' && (
                <div className="caja-page__actions">
                  <button
                    className="caja-page__action-btn caja-page__action-btn--info"
                    onClick={() => setShowMovementsModal(true)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ver Movimientos
                  </button>
                  <button
                    className="caja-page__action-btn caja-page__action-btn--warning"
                    onClick={() => setShowExpenseModal(true)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Registrar Gasto
                  </button>
                  <button
                    className="caja-page__action-btn caja-page__action-btn--danger"
                    onClick={() => setShowCloseModal(true)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Cerrar Caja
                  </button>
                </div>
              )}

              {/* Estado pendiente, cerrada u observada - Mostrar botón Ver Movimientos */}
              {['PENDIENTE_APROBACION', 'CERRADA', 'OBSERVADA'].includes(activeRegister.register_status) && (
                <div className="caja-page__pending-info">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    {activeRegister.register_status === 'PENDIENTE_APROBACION' && 'Tu caja esta pendiente de aprobacion.'}
                    {activeRegister.register_status === 'CERRADA' && 'Tu caja esta cerrada.'}
                    {activeRegister.register_status === 'OBSERVADA' && 'Tu caja ha sido observada. Agrega tu justificacion arriba.'}
                  </p>
                  <button
                    className="caja-page__btn-movements"
                    onClick={() => setShowMovementsModal(true)}
                  >
                    Ver Movimientos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Historial */}
      {activeTab === 'history' && (
        <div className="caja-page__history">
          {history.length === 0 ? (
            <div className="caja-page__empty">
              <p>No tienes historial de cajas anteriores.</p>
            </div>
          ) : (
            <div className="caja-page__history-list">
              {history.map(reg => {
                const statusBadge = getStatusBadge(reg.register_status);
                return (
                  <div key={reg.id} className="caja-page__history-item">
                    <div className="caja-page__history-main">
                      <div className="caja-page__history-info">
                        <strong>{reg.register_number}</strong>
                        <span>{formatDate(reg.open_date)}</span>
                      </div>
                      <span className={`caja-page__status ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="caja-page__history-details">
                      <div>
                        <small>Ventas</small>
                        <span className="caja-page__amount--income">+{formatCurrency(reg.total_sales)}</span>
                      </div>
                      <div>
                        <small>Gastos</small>
                        <span className="caja-page__amount--expense">-{formatCurrency(reg.total_expenses)}</span>
                      </div>
                      <div>
                        <small>Diferencia</small>
                        <span className={parseFloat(reg.total_difference || 0) >= 0 ? 'caja-page__amount--income' : 'caja-page__amount--expense'}>
                          {formatCurrency(reg.total_difference)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {showExpenseModal && activeRegister && (
        <CashRegisterExpenseModal
          cashRegisterId={activeRegister.id}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={handleExpenseAdded}
        />
      )}

      {showCloseModal && activeRegister && (
        <CashRegisterCloseModal
          cashRegister={activeRegister}
          onClose={() => setShowCloseModal(false)}
          onSuccess={handleClosed}
        />
      )}

      {showMovementsModal && activeRegister && (
        <CashRegisterMovementsModal
          cashRegisterId={activeRegister.id}
          onClose={() => setShowMovementsModal(false)}
        />
      )}
    </div>
  );
};

export default RepartidorCajaPage;
