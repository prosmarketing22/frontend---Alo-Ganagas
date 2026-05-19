import { useState, useEffect } from 'react';
import repartidorService from '../../services/repartidorService';
import './PreRegistroModal.css';

const METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
  FISE: 'FISE',
  VALE_FISE: 'FISE',
  CREDITO: 'Credito',
  MIXTO: 'Pago Mixto'
};

/**
 * Modal para pre-registrar pagos e intercambios de pedidos
 * Usado por gerentes y personal de base para registrar antes de la entrega fisica
 */
export const PreRegistroModal = ({ order, onConfirm, onClose, loading }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Datos del pago
  const [paymentMethod, setPaymentMethod] = useState(order?.payment_method || 'EFECTIVO');
  const [amountPaid, setAmountPaid] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [fiseDni, setFiseDni] = useState('');

  // Estado para pagos mixtos
  const [mixedPayments, setMixedPayments] = useState([]);

  // Estado para registro de intercambio de balones
  const [exchangeDetails, setExchangeDetails] = useState(() => {
    const details = order?.details || [];
    return details
      .filter(d => d.is_exchange || d.is_exchangeable)
      .map(d => ({
        id: d.id,
        product_id: d.product_id,
        product_name: d.product_name || 'Producto',
        product_type: d.product_type,
        balloon_type: d.balloon_type || null,
        quantity: d.quantity,
        empty_received: d.quantity,
        extra_returned: 0,
        exchange_notes: ''
      }));
  });

  // Notas adicionales del pre-registro
  const [preregistrationNotes, setPreregistrationNotes] = useState('');

  const hasExchangeableItems = exchangeDetails.length > 0;
  const totalAmount = parseFloat(order?.total || 0);
  const customerName = order?.customer_name || 'Cliente';
  const orderNumber = order?.order_number || `#${order?.id}`;
  const delivererName = order?.deliverer_name || 'Sin asignar';

  // Verificar si ya tiene pre-registro
  const hasExistingPreregistration = order?.has_payment_preregistered || order?.has_exchange_preregistered;

  // Cargar metodos de pago
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const result = await repartidorService.getPaymentMethods();
        if (result.success && result.data) {
          const methods = [
            ...result.data,
            { method_type: 'MIXTO', display_order: 999 }
          ];
          setPaymentMethods(methods);

          const nonCashMethods = result.data.filter(m => m.method_type !== 'EFECTIVO');
          if (nonCashMethods.length >= 2) {
            setMixedPayments([
              { method: 'EFECTIVO', amount: '' },
              { method: nonCashMethods[0].method_type, amount: '' }
            ]);
          } else {
            setMixedPayments([
              { method: 'EFECTIVO', amount: '' },
              { method: result.data[1]?.method_type || 'EFECTIVO', amount: '' }
            ]);
          }
        }
      } catch (error) {
        console.error('Error cargando metodos de pago:', error);
        setPaymentMethods([
          { method_type: 'EFECTIVO', display_order: 0 },
          { method_type: 'YAPE', display_order: 1 },
          { method_type: 'PLIN', display_order: 2 },
          { method_type: 'TRANSFERENCIA', display_order: 3 },
          { method_type: 'MIXTO', display_order: 999 }
        ]);
        setMixedPayments([
          { method: 'EFECTIVO', amount: '' },
          { method: 'YAPE', amount: '' }
        ]);
      } finally {
        setLoadingMethods(false);
      }
    };
    loadPaymentMethods();
  }, []);

  // Calcular total de pagos mixtos
  const mixedTotal = mixedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const mixedRemaining = totalAmount - mixedTotal;

  useEffect(() => {
    if (paymentMethod === 'EFECTIVO' && amountPaid) {
      const paid = parseFloat(amountPaid) || 0;
      const change = paid - totalAmount;
      setChangeAmount(change > 0 ? change : 0);
    } else {
      setChangeAmount(0);
    }
  }, [amountPaid, paymentMethod, totalAmount]);

  // Limpiar DNI FISE cuando se cambie a otro metodo de pago
  useEffect(() => {
    if (paymentMethod !== 'FISE' && paymentMethod !== 'VALE_FISE') {
      setFiseDni('');
    }
  }, [paymentMethod]);

  // Funciones para pagos mixtos
  const handleMixedPaymentChange = (index, field, value) => {
    const updated = [...mixedPayments];
    updated[index][field] = value;
    setMixedPayments(updated);
  };

  const addMixedPayment = () => {
    const usedMethods = mixedPayments.map(p => p.method);
    const availableMethod = paymentMethods.find(m =>
      m.method_type !== 'MIXTO' && !usedMethods.includes(m.method_type)
    );

    if (availableMethod) {
      setMixedPayments([...mixedPayments, { method: availableMethod.method_type, amount: '' }]);
    } else {
      setMixedPayments([...mixedPayments, { method: 'EFECTIVO', amount: '' }]);
    }
  };

  const removeMixedPayment = (index) => {
    if (mixedPayments.length > 2) {
      const updated = mixedPayments.filter((_, i) => i !== index);
      setMixedPayments(updated);
    }
  };

  // Funciones para intercambio de balones
  const handleExchangeDetailChange = (index, field, value) => {
    const updated = [...exchangeDetails];
    updated[index][field] = value;
    setExchangeDetails(updated);
  };

  const getExchangeStatus = (detail) => {
    const expected = detail.quantity;
    const received = parseInt(detail.empty_received) || 0;
    const extra = parseInt(detail.extra_returned) || 0;

    if (received === expected) {
      return { type: 'normal', label: 'Intercambio completo', color: 'green' };
    } else if (received > expected || extra > 0) {
      return { type: 'extra', label: 'Devolucion extra', color: 'blue' };
    } else if (received < expected && received > 0) {
      return { type: 'loan', label: `Prestamo: ${expected - received} balon(es)`, color: 'orange' };
    } else {
      return { type: 'full_loan', label: `Prestamo completo: ${expected} balon(es)`, color: 'red' };
    }
  };

  const getAvailableMethods = (currentIndex) => {
    const usedMethods = mixedPayments
      .filter((_, i) => i !== currentIndex)
      .map(p => p.method);
    return paymentMethods.filter(m =>
      m.method_type !== 'MIXTO' &&
      (!usedMethods.includes(m.method_type) || m.method_type === mixedPayments[currentIndex].method)
    );
  };

  const handleSubmit = () => {
    let paid = parseFloat(amountPaid) || totalAmount;
    let mixedDetails = null;

    // Validaciones para pago mixto
    if (paymentMethod === 'MIXTO') {
      const invalidPayments = mixedPayments.filter(p => !p.amount || parseFloat(p.amount) <= 0);
      if (invalidPayments.length > 0) {
        alert('Todos los metodos de pago deben tener un monto mayor a 0');
        return;
      }

      if (mixedTotal < totalAmount) {
        alert(`El total de pagos (S/ ${mixedTotal.toFixed(2)}) es menor al monto del pedido (S/ ${totalAmount.toFixed(2)})`);
        return;
      }

      paid = mixedTotal;
      mixedDetails = mixedPayments.map(p => ({
        method: p.method,
        label: METHOD_LABELS[p.method] || p.method,
        amount: parseFloat(p.amount)
      }));
    }

    // Validaciones para FISE
    if (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') {
      if (!fiseDni) {
        alert('El DNI del beneficiario FISE es obligatorio');
        return;
      }
      if (fiseDni.length !== 8 || !/^\d{8}$/.test(fiseDni)) {
        alert('El DNI debe tener exactamente 8 digitos numericos');
        return;
      }
    }

    // Preparar datos del pago
    const paymentDetails = {
      payment_method: paymentMethod,
      amount_paid: paid,
      change_amount: changeAmount,
      mixed_payment_details: mixedDetails
    };

    // Agregar DNI FISE si corresponde
    if ((paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') && fiseDni) {
      paymentDetails.fise_dni = fiseDni;
    }

    // Preparar datos de intercambio
    const exchangeData = hasExchangeableItems ? exchangeDetails.map(detail => ({
      id: detail.id,
      product_id: detail.product_id,
      product_name: detail.product_name,
      balloon_type: detail.balloon_type,
      quantity: detail.quantity,
      empty_received: parseInt(detail.empty_received) || 0,
      extra_returned: parseInt(detail.extra_returned) || 0,
      exchange_notes: detail.exchange_notes || ''
    })) : null;

    onConfirm({
      payment_details: paymentDetails,
      exchange_details: exchangeData,
      notes: preregistrationNotes || null
    });
  };

  const showMixedPayments = paymentMethod === 'MIXTO';

  if (loadingMethods) {
    return (
      <div className="preregistro-modal__overlay">
        <div className="preregistro-modal">
          <div className="preregistro-modal__body" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Cargando metodos de pago...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preregistro-modal__overlay" onClick={onClose}>
      <div className="preregistro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preregistro-modal__header">
          <h2 className="preregistro-modal__title">Pre-Registrar Pago e Intercambio</h2>
          <button className="preregistro-modal__close" onClick={onClose}>&times;</button>
        </div>

        <div className="preregistro-modal__body">
          {/* Aviso informativo */}
          <div className="preregistro-modal__info-banner">
            <span className="preregistro-modal__info-icon">ℹ️</span>
            <div className="preregistro-modal__info-text">
              <strong>Pre-registro de pago</strong>
              <p>Al pre-registrar, el repartidor vera que el pago ya fue registrado y solo necesitara entregar el producto al cliente.</p>
            </div>
          </div>

          {/* Aviso si ya tiene pre-registro */}
          {hasExistingPreregistration && (
            <div className="preregistro-modal__warning-banner">
              <span className="preregistro-modal__warning-icon">⚠️</span>
              <p>Este pedido ya tiene un pre-registro. Al continuar, se sobreescribira el anterior.</p>
            </div>
          )}

          {/* Info del pedido */}
          <div className="preregistro-modal__order-info">
            <div className="preregistro-modal__order-row">
              <span className="preregistro-modal__label">Pedido:</span>
              <span className="preregistro-modal__value">{orderNumber}</span>
            </div>
            <div className="preregistro-modal__order-row">
              <span className="preregistro-modal__label">Cliente:</span>
              <span className="preregistro-modal__value">{customerName}</span>
            </div>
            <div className="preregistro-modal__order-row">
              <span className="preregistro-modal__label">Repartidor asignado:</span>
              <span className="preregistro-modal__value preregistro-modal__value--deliverer">{delivererName}</span>
            </div>
            <div className="preregistro-modal__order-row">
              <span className="preregistro-modal__label">Estado:</span>
              <span className={`preregistro-modal__status preregistro-modal__status--${order?.order_status?.toLowerCase()}`}>
                {order?.order_status}
              </span>
            </div>
            <div className="preregistro-modal__order-row preregistro-modal__order-row--total">
              <span className="preregistro-modal__label">Total a Cobrar:</span>
              <span className="preregistro-modal__value preregistro-modal__value--total">
                S/ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Productos del pedido */}
          <div className="preregistro-modal__products">
            <h4 className="preregistro-modal__section-title">Productos del pedido</h4>
            <ul className="preregistro-modal__products-list">
              {(order?.details || []).map((detail, idx) => (
                <li key={idx} className="preregistro-modal__product-item">
                  <span className="preregistro-modal__product-name">{detail.product_name}</span>
                  <span className="preregistro-modal__product-qty">x{detail.quantity}</span>
                  <span className="preregistro-modal__product-price">S/ {parseFloat(detail.subtotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Seccion de Intercambio de Balones */}
          {hasExchangeableItems && (
            <div className="preregistro-modal__exchange-section">
              <h3 className="preregistro-modal__section-title">
                Registro de Intercambio de Balones/Botellas
              </h3>
              <p className="preregistro-modal__section-subtitle">
                Indique cuantos balones/botellas vacios entregara el cliente
              </p>

              {exchangeDetails.map((detail, index) => {
                const status = getExchangeStatus(detail);
                return (
                  <div key={detail.id || index} className="preregistro-modal__exchange-item">
                    <div className="preregistro-modal__exchange-header">
                      <span className="preregistro-modal__exchange-product">
                        {detail.product_name}
                      </span>
                      <span className="preregistro-modal__exchange-qty">
                        Cantidad: {detail.quantity}
                      </span>
                    </div>

                    <div className="preregistro-modal__exchange-fields">
                      <div className="preregistro-modal__exchange-field">
                        <label>Vacios a recibir</label>
                        <input
                          type="number"
                          min="0"
                          max={detail.quantity + 10}
                          value={detail.empty_received}
                          onChange={(e) => handleExchangeDetailChange(index, 'empty_received', e.target.value)}
                          className="preregistro-modal__exchange-input"
                        />
                      </div>

                      <div className="preregistro-modal__exchange-field">
                        <label>Extras a devolver</label>
                        <input
                          type="number"
                          min="0"
                          value={detail.extra_returned}
                          onChange={(e) => handleExchangeDetailChange(index, 'extra_returned', e.target.value)}
                          className="preregistro-modal__exchange-input"
                          placeholder="0"
                        />
                        <span className="preregistro-modal__field-hint">
                          De prestamos anteriores
                        </span>
                      </div>
                    </div>

                    <div
                      className="preregistro-modal__exchange-status"
                      style={{ '--status-color': status.color }}
                    >
                      <span className="preregistro-modal__exchange-status-dot"></span>
                      {status.label}
                    </div>

                    <div className="preregistro-modal__exchange-notes">
                      <input
                        type="text"
                        placeholder="Notas del intercambio (opcional)"
                        value={detail.exchange_notes}
                        onChange={(e) => handleExchangeDetailChange(index, 'exchange_notes', e.target.value)}
                        className="preregistro-modal__exchange-notes-input"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Metodo de pago */}
          <div className="preregistro-modal__field">
            <label className="preregistro-modal__field-label">Metodo de Pago</label>
            <select
              className="preregistro-modal__select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map(method => (
                <option key={method.method_type} value={method.method_type}>
                  {METHOD_LABELS[method.method_type] || method.method_type}
                </option>
              ))}
            </select>
          </div>

          {/* DNI del Beneficiario FISE */}
          {(paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') && (
            <div className="preregistro-modal__field">
              <label className="preregistro-modal__field-label">
                DNI del Beneficiario FISE <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <input
                type="text"
                className="preregistro-modal__input"
                value={fiseDni}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setFiseDni(value);
                }}
                placeholder="Ingrese 8 digitos del DNI"
                maxLength={8}
                required
              />
              {fiseDni && fiseDni.length !== 8 && (
                <div className="preregistro-modal__field-hint" style={{ color: '#ff4d4f', marginTop: '4px' }}>
                  El DNI debe tener exactamente 8 digitos
                </div>
              )}
            </div>
          )}

          {/* Pagos Mixtos */}
          {showMixedPayments && (
            <div className="preregistro-modal__mixed-payments">
              <label className="preregistro-modal__field-label">Desglose de Pagos</label>

              {mixedPayments.map((payment, index) => (
                <div key={index} className="preregistro-modal__mixed-row">
                  <select
                    className="preregistro-modal__mixed-select"
                    value={payment.method}
                    onChange={(e) => handleMixedPaymentChange(index, 'method', e.target.value)}
                  >
                    {getAvailableMethods(index).map(method => (
                      <option key={method.method_type} value={method.method_type}>
                        {METHOD_LABELS[method.method_type] || method.method_type}
                      </option>
                    ))}
                  </select>
                  <div className="preregistro-modal__mixed-amount-wrapper">
                    <span className="preregistro-modal__mixed-currency">S/</span>
                    <input
                      type="number"
                      className="preregistro-modal__mixed-amount"
                      value={payment.amount}
                      onChange={(e) => handleMixedPaymentChange(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {mixedPayments.length > 2 && (
                    <button
                      type="button"
                      className="preregistro-modal__mixed-remove"
                      onClick={() => removeMixedPayment(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="preregistro-modal__mixed-add"
                onClick={addMixedPayment}
              >
                + Agregar otro metodo
              </button>

              {/* Resumen de pagos mixtos */}
              <div className={`preregistro-modal__mixed-summary ${mixedRemaining <= 0 ? 'complete' : 'pending'}`}>
                <div className="preregistro-modal__mixed-summary-row">
                  <span>Total ingresado:</span>
                  <span>S/ {mixedTotal.toFixed(2)}</span>
                </div>
                {mixedRemaining > 0 ? (
                  <div className="preregistro-modal__mixed-summary-row pending">
                    <span>Falta:</span>
                    <span>S/ {mixedRemaining.toFixed(2)}</span>
                  </div>
                ) : mixedRemaining < 0 ? (
                  <div className="preregistro-modal__mixed-summary-row excess">
                    <span>Excedente:</span>
                    <span>S/ {Math.abs(mixedRemaining).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="preregistro-modal__mixed-summary-row complete">
                    <span>Monto completo</span>
                    <span>✓</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Monto pagado - solo para efectivo simple */}
          {paymentMethod === 'EFECTIVO' && (
            <div className="preregistro-modal__field">
              <label className="preregistro-modal__field-label">Monto Recibido (opcional)</label>
              <input
                type="number"
                className="preregistro-modal__input"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={`S/ ${totalAmount.toFixed(2)}`}
                step="0.01"
                min="0"
              />
              {changeAmount > 0 && (
                <div className="preregistro-modal__change">
                  Vuelto: <strong>S/ {changeAmount.toFixed(2)}</strong>
                </div>
              )}
            </div>
          )}

          {/* Notas del pre-registro */}
          <div className="preregistro-modal__field">
            <label className="preregistro-modal__field-label">Notas del pre-registro (opcional)</label>
            <textarea
              className="preregistro-modal__textarea"
              value={preregistrationNotes}
              onChange={(e) => setPreregistrationNotes(e.target.value)}
              placeholder="Ej: Cliente pago por adelantado, confirmar entrega..."
              rows={2}
            />
          </div>
        </div>

        <div className="preregistro-modal__footer">
          <button
            className="preregistro-modal__btn preregistro-modal__btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="preregistro-modal__btn preregistro-modal__btn--confirm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Confirmar Pre-registro'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreRegistroModal;
