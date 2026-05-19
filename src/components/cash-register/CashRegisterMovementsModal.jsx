import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { getUploadUrl } from '../../config/api.config';
import './CashRegisterMovementsModal.css';

export const CashRegisterMovementsModal = ({ cashRegisterId, onClose }) => {
  const { getById, getOrders, loading } = useCashRegisterApi();

  const [register, setRegister] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense', 'collection'
  const [loadingData, setLoadingData] = useState(true);
  const [voucherModal, setVoucherModal] = useState({ open: false, url: '', mov: null });

  useEffect(() => {
    loadData();
  }, [cashRegisterId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [registerResult, ordersResult] = await Promise.all([
        getById(cashRegisterId),
        getOrders(cashRegisterId)
      ]);

      if (registerResult.success) {
        setRegister(registerResult.data);
      }
      if (ordersResult.success) {
        setOrders(ordersResult.data || []);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`;
  };

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

  const expenses = register?.expenses || [];
  const creditCollections = register?.credit_collections || [];

  // Combinar y ordenar todos los movimientos por fecha
  const allMovements = [
    ...orders.map(o => ({
      type: 'income',
      id: `order-${o.id}`,
      date: o.delivery_datetime || o.updated_at,
      description: `Pedido #${o.order_number}`,
      detail: o.customer_name || 'Cliente',
      address: o.customer_address || '',
      method: o.actual_payment_method || o.payment_method,
      amount: parseFloat(o.total)
    })),
    ...expenses.map(e => ({
      type: 'expense',
      id: `expense-${e.id}`,
      date: e.expense_date,
      description: e.category_name || 'Gasto',
      detail: e.description || '-',
      method: e.payment_method,
      amount: parseFloat(e.amount),
      voucher: e.voucher_path
    })),
    ...creditCollections.map(c => ({
      type: 'collection',
      id: `collection-${c.id}`,
      date: c.collection_date,
      description: 'Cobro de Crédito',
      detail: c.customer_name || 'Cliente',
      method: c.payment_method,
      amount: parseFloat(c.amount),
      voucher: c.voucher_path,
      origin: c.origin,
      newDebt: c.new_debt
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filtrar movimientos segun seleccion
  const filteredMovements = filter === 'all'
    ? allMovements
    : allMovements.filter(m => m.type === filter);

  // Usar los balances oficiales de la caja para los totales del resumen
  const balances = register?.balances || [];

  // Calcular totales desde los balances de la caja (datos oficiales)
  const totalOpening = balances.reduce((sum, b) => sum + parseFloat(b.opening_amount || 0), 0);
  const totalSales = balances.reduce((sum, b) => sum + parseFloat(b.sales_amount || 0), 0);
  const totalExpenses = balances.reduce((sum, b) => sum + parseFloat(b.expenses_amount || 0), 0);
  const totalExpected = balances.reduce((sum, b) => sum + parseFloat(b.expected_amount || 0), 0);

  // Para mostrar ventas a crédito (pedidos que no generaron efectivo)
  const creditOrders = orders.filter(o => {
    const method = o.actual_payment_method || o.payment_method;
    return method === 'CREDITO';
  });
  const totalCreditSales = creditOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  return (
    <div className="movements-modal-overlay" onClick={onClose}>
      <div className="movements-modal" onClick={e => e.stopPropagation()}>
        <div className="movements-modal__header">
          <h3>Movimientos de Caja</h3>
          <button className="movements-modal__close" onClick={onClose}>×</button>
        </div>

        {loadingData ? (
          <div className="movements-modal__loading">
            <div className="movements-modal__spinner"></div>
            <p>Cargando movimientos...</p>
          </div>
        ) : (
          <>
            {/* Resumen compacto - Usa datos de balances oficiales */}
            <div className="movements-modal__summary-bar">
              <div className="movements-modal__summary-item">
                <span>Saldo Inicial</span>
                <strong>{formatCurrency(totalOpening)}</strong>
              </div>
              <div className="movements-modal__summary-item">
                <span>Ingresos</span>
                <strong className="movements-modal__summary--income">+{formatCurrency(totalSales)}</strong>
              </div>
              {totalCreditSales > 0 && (
                <div className="movements-modal__summary-item">
                  <span>Ventas Crédito</span>
                  <strong className="movements-modal__summary--credit">{formatCurrency(totalCreditSales)}</strong>
                </div>
              )}
              <div className="movements-modal__summary-item">
                <span>Gastos</span>
                <strong className="movements-modal__summary--expense">-{formatCurrency(totalExpenses)}</strong>
              </div>
              <div className="movements-modal__summary-item movements-modal__summary-item--total">
                <span>Saldo Esperado</span>
                <strong className={totalExpected >= 0 ? 'movements-modal__summary--income' : 'movements-modal__summary--expense'}>
                  {formatCurrency(totalExpected)}
                </strong>
              </div>
            </div>

            {/* Filtros */}
            <div className="movements-modal__filters">
              <button
                className={`movements-modal__filter ${filter === 'all' ? 'movements-modal__filter--active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todos ({allMovements.length})
              </button>
              <button
                className={`movements-modal__filter movements-modal__filter--income ${filter === 'income' ? 'movements-modal__filter--active' : ''}`}
                onClick={() => setFilter('income')}
              >
                Ventas ({orders.length})
              </button>
              {creditCollections.length > 0 && (
                <button
                  className={`movements-modal__filter movements-modal__filter--collection ${filter === 'collection' ? 'movements-modal__filter--active' : ''}`}
                  onClick={() => setFilter('collection')}
                >
                  Cobros ({creditCollections.length})
                </button>
              )}
              <button
                className={`movements-modal__filter movements-modal__filter--expense ${filter === 'expense' ? 'movements-modal__filter--active' : ''}`}
                onClick={() => setFilter('expense')}
              >
                Gastos ({expenses.length})
              </button>
            </div>

            {/* Lista de movimientos */}
            <div className="movements-modal__content">
              <div className="movements-modal__list">
                {filteredMovements.length === 0 ? (
                  <div className="movements-modal__empty">
                    {filter === 'all' && 'No hay movimientos registrados'}
                    {filter === 'income' && 'No hay ventas registradas'}
                    {filter === 'collection' && 'No hay cobros de crédito registrados'}
                    {filter === 'expense' && 'No hay gastos registrados'}
                  </div>
                ) : (
                  filteredMovements.map(mov => (
                    <div
                      key={mov.id}
                      className={`movements-modal__item movements-modal__item--${mov.type}`}
                    >
                      <div className="movements-modal__item-icon">
                        {mov.type === 'income' && (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {mov.type === 'collection' && (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {mov.type === 'expense' && (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="movements-modal__item-info">
                        <div className="movements-modal__item-header">
                          <strong>{mov.description}</strong>
                          <span className="movements-modal__item-date">{formatDate(mov.date)} {formatTime(mov.date)}</span>
                        </div>
                        <span className="movements-modal__item-detail">
                          {mov.detail}
                          {mov.type === 'collection' && mov.origin && (
                            <span className="movements-modal__item-origin">
                              {mov.origin === 'PAGO_TOTAL' ? ' (Pago Total)' : ' (Pago Parcial)'}
                            </span>
                          )}
                        </span>
                        {mov.address && (
                          <span className="movements-modal__item-address">{mov.address}</span>
                        )}
                        <div className="movements-modal__item-meta">
                          <span className="movements-modal__item-method">{mov.method}</span>
                          {mov.type === 'collection' && mov.newDebt !== undefined && (
                            <span className="movements-modal__item-debt">
                              Deuda restante: {formatCurrency(mov.newDebt)}
                            </span>
                          )}
                          {mov.voucher && (
                            <button
                              className="movements-modal__item-voucher"
                              onClick={() => setVoucherModal({
                                open: true,
                                url: getUploadUrl(mov.voucher),
                                mov
                              })}
                            >
                              Ver comprobante
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={`movements-modal__item-amount movements-modal__item-amount--${mov.type}`}>
                        {mov.type === 'expense' ? '-' : '+'}{formatCurrency(mov.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <div className="movements-modal__footer">
          <button className="movements-modal__btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {voucherModal.open && (
        <div className="voucher-modal-overlay" onClick={() => setVoucherModal({ open: false, url: '', mov: null })}>
          <div className="voucher-modal" onClick={e => e.stopPropagation()}>
            <div className="voucher-modal__header">
              <h4>Comprobante</h4>
              <button
                className="voucher-modal__close"
                onClick={() => setVoucherModal({ open: false, url: '', mov: null })}
              >
                X
              </button>
            </div>
            <div className="voucher-modal__content">
              {voucherModal.mov && (
                <div className="voucher-modal__info">
                  <p><strong>{voucherModal.mov.description}</strong></p>
                  <p>{voucherModal.mov.detail}</p>
                  <p><strong>Monto:</strong> {formatCurrency(voucherModal.mov.amount)}</p>
                  <p><strong>Metodo:</strong> {voucherModal.mov.method}</p>
                </div>
              )}
              <div className="voucher-modal__image-container">
                <img
                  src={voucherModal.url}
                  alt="Comprobante"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
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

export default CashRegisterMovementsModal;
