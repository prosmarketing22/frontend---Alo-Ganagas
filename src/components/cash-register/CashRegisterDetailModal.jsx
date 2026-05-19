import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { BASE_URL } from '../../config/api.config';
import './CashRegisterDetailModal.css';

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

export const CashRegisterDetailModal = ({
  isOpen,
  onClose,
  registerId,
  onApprove,
  onObserve
}) => {
  const { getById, getOrders, loading } = useCashRegisterApi();

  const [register, setRegister] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [movementFilter, setMovementFilter] = useState('all'); // 'all', 'income', 'expense'
  const [observationText, setObservationText] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showObserveForm, setShowObserveForm] = useState(false);
  const [voucherModal, setVoucherModal] = useState({ open: false, url: '', expense: null });

  useEffect(() => {
    if (registerId) {
      loadData();
    }
  }, [registerId]);

  const loadData = async () => {
    try {
      const result = await getById(registerId);
      if (result.success) {
        setRegister(result.data);
      }

      const ordersResult = await getOrders(registerId);
      if (ordersResult.success) {
        setOrders(ordersResult.data || []);
      }
    } catch (error) {
      console.error('Error loading register:', error);
    }
  };

  if (!isOpen) return null;

  const canApprove = register && ['CERRADA', 'PENDIENTE_APROBACION', 'OBSERVADA'].includes(register.register_status);
  const canObserve = register && ['CERRADA', 'PENDIENTE_APROBACION'].includes(register.register_status);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(registerId, approvalNotes);
    }
  };

  const handleObserve = () => {
    if (!observationText.trim()) {
      alert('Ingrese el mensaje de observacion');
      return;
    }
    if (onObserve) {
      onObserve(registerId, observationText);
    }
  };

  // Combinar movimientos
  const expenses = register?.expenses || [];
  const allMovements = [
    ...orders.map(o => ({
      type: 'income',
      id: `order-${o.id}`,
      date: o.delivery_datetime || o.updated_at,
      title: `Pedido #${o.order_number}`,
      subtitle: o.customer_name || 'Cliente',
      method: o.actual_payment_method || o.payment_method,
      amount: parseFloat(o.total || 0)
    })),
    ...expenses.map(e => ({
      type: 'expense',
      id: `expense-${e.id}`,
      date: e.expense_date,
      title: e.category_name || 'Gasto',
      subtitle: e.description || '-',
      method: e.payment_method,
      amount: parseFloat(e.amount || 0),
      voucher: e.voucher_path,
      expense: e
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredMovements = movementFilter === 'all'
    ? allMovements
    : allMovements.filter(m => m.type === movementFilter);

  const totalIncome = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-modal__header">
          <div className="detail-modal__title">
            <h3>Caja {register?.register_number || '...'}</h3>
            {register && (
              <span className={`detail-modal__status detail-modal__status--${STATUS_COLORS[register.register_status]}`}>
                {STATUS_LABELS[register.register_status]}
              </span>
            )}
          </div>
          <button className="detail-modal__close" onClick={onClose}>X</button>
        </div>

        {loading && !register ? (
          <div className="detail-modal__loading">Cargando...</div>
        ) : register ? (
          <>
            {/* Tabs - Solo Resumen y Movimientos */}
            <div className="detail-modal__tabs">
              <button
                className={`detail-modal__tab ${activeTab === 'summary' ? 'detail-modal__tab--active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Resumen
              </button>
              <button
                className={`detail-modal__tab ${activeTab === 'movements' ? 'detail-modal__tab--active' : ''}`}
                onClick={() => setActiveTab('movements')}
              >
                Movimientos ({allMovements.length})
              </button>
              {register.observations?.length > 0 && (
                <button
                  className={`detail-modal__tab ${activeTab === 'observations' ? 'detail-modal__tab--active' : ''}`}
                  onClick={() => setActiveTab('observations')}
                >
                  Observaciones
                </button>
              )}
            </div>

            <div className="detail-modal__content">
              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="detail-modal__summary">
                  <div className="detail-modal__info-row">
                    <span>Repartidor:</span>
                    <strong>{register.user_name}</strong>
                  </div>
                  <div className="detail-modal__info-row">
                    <span>Fecha apertura:</span>
                    <strong>{new Date(register.open_time).toLocaleString('es-PE')}</strong>
                  </div>
                  {register.close_time && (
                    <div className="detail-modal__info-row">
                      <span>Fecha cierre:</span>
                      <strong>{new Date(register.close_time).toLocaleString('es-PE')}</strong>
                    </div>
                  )}

                  <div className="detail-modal__totals">
                    <div className="detail-modal__total-item">
                      <span>Pedidos</span>
                      <strong>{register.orders_count}</strong>
                    </div>
                    <div className="detail-modal__total-item detail-modal__total-item--positive">
                      <span>Ventas</span>
                      <strong>S/ {parseFloat(register.total_sales || 0).toFixed(2)}</strong>
                    </div>
                    <div className="detail-modal__total-item detail-modal__total-item--negative">
                      <span>Gastos</span>
                      <strong>S/ {parseFloat(register.total_expenses || 0).toFixed(2)}</strong>
                    </div>
                    <div className="detail-modal__total-item detail-modal__total-item--expected">
                      <span>Esperado</span>
                      <strong>S/ {parseFloat(register.total_expected || 0).toFixed(2)}</strong>
                    </div>
                    {register.total_actual !== null && (
                      <>
                        <div className="detail-modal__total-item">
                          <span>Real</span>
                          <strong>S/ {parseFloat(register.total_actual || 0).toFixed(2)}</strong>
                        </div>
                        <div className={`detail-modal__total-item ${
                          parseFloat(register.total_difference) > 0
                            ? 'detail-modal__total-item--negative'
                            : parseFloat(register.total_difference) < 0
                              ? 'detail-modal__total-item--positive'
                              : ''
                        }`}>
                          <span>Diferencia</span>
                          <strong>
                            {parseFloat(register.total_difference) > 0 ? '-' : parseFloat(register.total_difference) < 0 ? '+' : ''}
                            S/ {Math.abs(parseFloat(register.total_difference || 0)).toFixed(2)}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Balances por metodo */}
                  {register.balances && register.balances.length > 0 && (
                    <div className="detail-modal__balances">
                      <h4>Detalle por Metodo de Pago</h4>
                      <table className="detail-modal__balances-table">
                        <thead>
                          <tr>
                            <th>Metodo</th>
                            <th>Apertura</th>
                            <th>Ventas</th>
                            <th>Gastos</th>
                            <th>Esperado</th>
                            <th>Real</th>
                            <th>Dif.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {register.balances.map(b => (
                            <tr key={b.id}>
                              <td>{PAYMENT_METHOD_LABELS[b.payment_method] || b.payment_method}</td>
                              <td>S/ {parseFloat(b.opening_amount || 0).toFixed(2)}</td>
                              <td className="detail-modal__amount--positive">
                                S/ {parseFloat(b.sales_amount || 0).toFixed(2)}
                              </td>
                              <td className="detail-modal__amount--negative">
                                S/ {parseFloat(b.expenses_amount || 0).toFixed(2)}
                              </td>
                              <td>S/ {parseFloat(b.expected_amount || 0).toFixed(2)}</td>
                              <td>
                                {b.actual_amount !== null
                                  ? `S/ ${parseFloat(b.actual_amount).toFixed(2)}`
                                  : '-'
                                }
                              </td>
                              <td className={
                                b.difference === null ? '' :
                                parseFloat(b.difference) > 0.01
                                  ? 'detail-modal__amount--negative'
                                  : parseFloat(b.difference) < -0.01
                                    ? 'detail-modal__amount--positive'
                                    : ''
                              }>
                                {b.difference !== null
                                  ? `${parseFloat(b.difference) > 0.01 ? '-' : parseFloat(b.difference) < -0.01 ? '+' : ''} S/ ${Math.abs(parseFloat(b.difference)).toFixed(2)}`
                                  : '-'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Movements Tab - Unificado */}
              {activeTab === 'movements' && (
                <div className="detail-modal__movements">
                  {/* Resumen de totales */}
                  <div className="detail-modal__movements-summary">
                    <div className="detail-modal__movements-total">
                      <span>Ingresos</span>
                      <strong className="detail-modal__amount--positive">+S/ {totalIncome.toFixed(2)}</strong>
                    </div>
                    <div className="detail-modal__movements-total">
                      <span>Gastos</span>
                      <strong className="detail-modal__amount--negative">-S/ {totalExpense.toFixed(2)}</strong>
                    </div>
                    <div className="detail-modal__movements-total detail-modal__movements-total--net">
                      <span>Neto</span>
                      <strong className={totalIncome - totalExpense >= 0 ? 'detail-modal__amount--positive' : 'detail-modal__amount--negative'}>
                        S/ {(totalIncome - totalExpense).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="detail-modal__movements-filters">
                    <button
                      className={`detail-modal__filter ${movementFilter === 'all' ? 'detail-modal__filter--active' : ''}`}
                      onClick={() => setMovementFilter('all')}
                    >
                      Todos ({allMovements.length})
                    </button>
                    <button
                      className={`detail-modal__filter detail-modal__filter--income ${movementFilter === 'income' ? 'detail-modal__filter--active' : ''}`}
                      onClick={() => setMovementFilter('income')}
                    >
                      Ingresos ({orders.length})
                    </button>
                    <button
                      className={`detail-modal__filter detail-modal__filter--expense ${movementFilter === 'expense' ? 'detail-modal__filter--active' : ''}`}
                      onClick={() => setMovementFilter('expense')}
                    >
                      Gastos ({expenses.length})
                    </button>
                  </div>

                  {/* Lista de movimientos */}
                  <div className="detail-modal__movements-list">
                    {filteredMovements.length === 0 ? (
                      <div className="detail-modal__empty">
                        {movementFilter === 'all' && 'No hay movimientos registrados'}
                        {movementFilter === 'income' && 'No hay ingresos registrados'}
                        {movementFilter === 'expense' && 'No hay gastos registrados'}
                      </div>
                    ) : (
                      filteredMovements.map(mov => (
                        <div
                          key={mov.id}
                          className={`detail-modal__movement-item detail-modal__movement-item--${mov.type}`}
                        >
                          <div className="detail-modal__movement-icon">
                            {mov.type === 'income' ? (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="detail-modal__movement-info">
                            <div className="detail-modal__movement-header">
                              <strong>{mov.title}</strong>
                              <span className="detail-modal__movement-date">
                                {formatDate(mov.date)} {formatTime(mov.date)}
                              </span>
                            </div>
                            <span className="detail-modal__movement-subtitle">{mov.subtitle}</span>
                            <div className="detail-modal__movement-meta">
                              <span className="detail-modal__movement-method">
                                {PAYMENT_METHOD_LABELS[mov.method] || mov.method}
                              </span>
                              {mov.voucher && (
                                <button
                                  className="detail-modal__movement-voucher"
                                  onClick={() => setVoucherModal({
                                    open: true,
                                    url: `${BASE_URL}${mov.voucher}`,
                                    expense: mov.expense
                                  })}
                                >
                                  Ver comprobante
                                </button>
                              )}
                            </div>
                          </div>
                          <div className={`detail-modal__movement-amount detail-modal__movement-amount--${mov.type}`}>
                            {mov.type === 'income' ? '+' : '-'}S/ {mov.amount.toFixed(2)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Observations Tab */}
              {activeTab === 'observations' && (
                <div className="detail-modal__observations">
                  {register.observations?.map(obs => (
                    <div
                      key={obs.id}
                      className={`detail-modal__observation detail-modal__observation--${obs.observation_type.toLowerCase()}`}
                    >
                      <div className="detail-modal__observation-header">
                        <span className="detail-modal__observation-type">
                          {obs.observation_type === 'OBSERVACION' ? 'Observacion' : 'Justificacion'}
                        </span>
                        <span>{obs.created_by_name}</span>
                        <span>{new Date(obs.created_at).toLocaleString('es-PE')}</span>
                      </div>
                      <p>{obs.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {(canApprove || canObserve) && (
              <div className="detail-modal__footer">
                {showObserveForm ? (
                  <div className="detail-modal__observe-form">
                    <textarea
                      value={observationText}
                      onChange={(e) => setObservationText(e.target.value)}
                      placeholder="Escriba el motivo de la observacion..."
                      rows={3}
                    />
                    <div className="detail-modal__observe-actions">
                      <button
                        className="detail-modal__btn detail-modal__btn--cancel"
                        onClick={() => {
                          setShowObserveForm(false);
                          setObservationText('');
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        className="detail-modal__btn detail-modal__btn--observe"
                        onClick={handleObserve}
                      >
                        Enviar Observacion
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="detail-modal__actions">
                    <div className="detail-modal__approval-notes">
                      <input
                        type="text"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Notas de aprobacion (opcional)"
                      />
                    </div>
                    {canObserve && (
                      <button
                        className="detail-modal__btn detail-modal__btn--observe"
                        onClick={() => setShowObserveForm(true)}
                      >
                        Observar
                      </button>
                    )}
                    {canApprove && (
                      <button
                        className="detail-modal__btn detail-modal__btn--approve"
                        onClick={handleApprove}
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="detail-modal__error">Error al cargar la caja</div>
        )}
      </div>

      {/* Modal de Voucher */}
      {voucherModal.open && (
        <div className="voucher-modal-overlay" onClick={() => setVoucherModal({ open: false, url: '', expense: null })}>
          <div className="voucher-modal" onClick={e => e.stopPropagation()}>
            <div className="voucher-modal__header">
              <h4>Comprobante de Gasto</h4>
              <button
                className="voucher-modal__close"
                onClick={() => setVoucherModal({ open: false, url: '', expense: null })}
              >
                X
              </button>
            </div>
            <div className="voucher-modal__content">
              {voucherModal.expense && (
                <div className="voucher-modal__info">
                  <p><strong>Categoria:</strong> {voucherModal.expense.category_name}</p>
                  <p><strong>Monto:</strong> S/ {parseFloat(voucherModal.expense.amount).toFixed(2)}</p>
                  <p><strong>Metodo:</strong> {PAYMENT_METHOD_LABELS[voucherModal.expense.payment_method]}</p>
                  {voucherModal.expense.description && (
                    <p><strong>Descripcion:</strong> {voucherModal.expense.description}</p>
                  )}
                </div>
              )}
              <div className="voucher-modal__image-container">
                <img
                  src={voucherModal.url}
                  alt="Comprobante de gasto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.alt = 'Error al cargar imagen';
                    e.target.parentNode.innerHTML = '<p class="voucher-modal__error">No se pudo cargar la imagen del comprobante</p>';
                  }}
                />
              </div>
            </div>
            <div className="voucher-modal__footer">
              <a
                href={voucherModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="voucher-modal__btn voucher-modal__btn--download"
              >
                Abrir en nueva pestana
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterDetailModal;
