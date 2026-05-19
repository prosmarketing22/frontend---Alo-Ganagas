import { useState, useEffect } from 'react';
import { collaboratorService } from '../../services/collaboratorService';

const METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  VALE_FISE: 'Vale FISE',
  MIXTO: 'Pago Mixto'
};

const AVAILABLE_METHODS = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'TARJETA', 'VALE_FISE', 'MIXTO'];

export const CreditsPaymentModal = ({ customer, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'EFECTIVO',
    description: '',
    voucher: null,
    collected_by: ''
  });
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [deliverymen, setDeliverymen] = useState([]);
  const [loadingDeliverymen, setLoadingDeliverymen] = useState(true);

  // Estado para Vale FISE
  const [fiseDni, setFiseDni] = useState('');
  const [fiseAmount, setFiseAmount] = useState('');

  // Estado para pagos mixtos
  const [mixedPayments, setMixedPayments] = useState([
    { method: 'EFECTIVO', amount: '' },
    { method: 'YAPE', amount: '' }
  ]);

  // Estado para vouchers de pagos mixtos
  const [mixedVouchers, setMixedVouchers] = useState({});
  const [mixedVoucherPreviews, setMixedVoucherPreviews] = useState({});

  useEffect(() => {
    loadDeliverymen();
  }, []);

  const loadDeliverymen = async () => {
    try {
      const response = await collaboratorService.getDeliverymen();
      setDeliverymen(response.data || []);
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
    } finally {
      setLoadingDeliverymen(false);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, voucher: file }));
      setVoucherPreview(file.name);
    }
  };

  const handlePayTotal = () => {
    const debt = parseFloat(customer.pending_debt) || 0;
    setFormData((prev) => ({ ...prev, amount: debt.toFixed(2) }));
  };

  // Funciones para pago mixto
  const handleMixedPaymentChange = (index, field, value) => {
    const updated = [...mixedPayments];
    updated[index][field] = value;
    setMixedPayments(updated);
  };

  const addMixedPayment = () => {
    const usedMethods = mixedPayments.map(p => p.method);
    const availableMethod = AVAILABLE_METHODS.find(m =>
      m !== 'MIXTO' && !usedMethods.includes(m)
    );

    if (availableMethod) {
      setMixedPayments([...mixedPayments, { method: availableMethod, amount: '' }]);
    } else {
      setMixedPayments([...mixedPayments, { method: 'EFECTIVO', amount: '' }]);
    }
  };

  const removeMixedPayment = (index) => {
    if (mixedPayments.length > 2) {
      const methodToRemove = mixedPayments[index].method;
      if (mixedVouchers[methodToRemove]) {
        handleRemoveMixedVoucher(methodToRemove);
      }
      const updated = mixedPayments.filter((_, i) => i !== index);
      setMixedPayments(updated);
    }
  };

  const getAvailableMethods = (currentIndex) => {
    const usedMethods = mixedPayments
      .filter((_, i) => i !== currentIndex)
      .map(p => p.method);
    return AVAILABLE_METHODS.filter(m =>
      m !== 'MIXTO' &&
      (!usedMethods.includes(m) || m === mixedPayments[currentIndex].method)
    );
  };

  // Funciones para vouchers de pago mixto
  const handleMixedVoucherChange = (method, e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten imágenes (JPEG, PNG, WEBP) o PDF');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar 5MB');
        e.target.value = '';
        return;
      }

      if (mixedVoucherPreviews[method]) {
        URL.revokeObjectURL(mixedVoucherPreviews[method]);
      }

      setMixedVouchers(prev => ({ ...prev, [method]: file }));
      setMixedVoucherPreviews(prev => ({ ...prev, [method]: file.name }));
    }
  };

  const handleRemoveMixedVoucher = (method) => {
    if (mixedVoucherPreviews[method]) {
      URL.revokeObjectURL(mixedVoucherPreviews[method]);
    }
    setMixedVouchers(prev => {
      const updated = { ...prev };
      delete updated[method];
      return updated;
    });
    setMixedVoucherPreviews(prev => {
      const updated = { ...prev };
      delete updated[method];
      return updated;
    });
  };

  // Calcular totales para pago mixto
  const debt = parseFloat(customer.pending_debt) || 0;
  const mixedTotal = mixedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const mixedRemaining = debt - mixedTotal;

  const showMixedPayments = formData.payment_method === 'MIXTO';
  const showFiseFields = formData.payment_method === 'VALE_FISE';

  // Métodos mixtos que requieren voucher (todos excepto efectivo)
  const methodsRequiringVoucher = showMixedPayments
    ? mixedPayments.filter(p => p.method !== 'EFECTIVO')
    : [];

  // Verificar si incluye FISE en pago mixto
  const hasFiseInMixed = showMixedPayments && mixedPayments.some(p => p.method === 'VALE_FISE');

  const handleSubmit = (e) => {
    e.preventDefault();

    let amount = parseFloat(formData.amount);
    let paymentDetails = null;

    // Validaciones básicas
    if (!formData.collected_by) {
      alert('Debe seleccionar el repartidor que recibió el pago');
      return;
    }

    // Validaciones para Vale FISE
    if (showFiseFields) {
      if (!fiseDni || fiseDni.length !== 8) {
        alert('Debe ingresar un DNI válido de 8 dígitos del beneficiario FISE');
        return;
      }
      if (!fiseAmount || parseFloat(fiseAmount) <= 0) {
        alert('Debe ingresar el valor del vale FISE');
        return;
      }
      if (!formData.voucher) {
        alert('Debe adjuntar una foto del vale FISE');
        return;
      }

      const fiseValue = parseFloat(fiseAmount);
      if (fiseValue < debt) {
        alert(`El vale FISE (S/ ${fiseValue.toFixed(2)}) no cubre la deuda pendiente (S/ ${debt.toFixed(2)}).\n\nSeleccione "Pago Mixto" para combinar Vale FISE con otro método de pago.`);
        return;
      }

      amount = fiseValue;
    }

    // Validaciones para Pago Mixto
    if (showMixedPayments) {
      const invalidPayments = mixedPayments.filter(p => !p.amount || parseFloat(p.amount) <= 0);
      if (invalidPayments.length > 0) {
        alert('Todos los métodos de pago deben tener un monto mayor a 0');
        return;
      }

      if (mixedTotal > debt) {
        alert(`El total de pagos (S/ ${mixedTotal.toFixed(2)}) excede la deuda pendiente (S/ ${debt.toFixed(2)})`);
        return;
      }

      // Validar DNI y foto si incluye FISE en pago mixto
      if (hasFiseInMixed) {
        if (!fiseDni || fiseDni.length !== 8) {
          alert('Debe ingresar un DNI válido de 8 dígitos del beneficiario FISE');
          return;
        }
        if (!mixedVouchers['VALE_FISE']) {
          alert('Debe adjuntar una foto del vale FISE');
          return;
        }
      }

      amount = mixedTotal;
      paymentDetails = mixedPayments.map(p => ({
        method: p.method,
        label: METHOD_LABELS[p.method] || p.method,
        amount: parseFloat(p.amount),
        ...(p.method === 'VALE_FISE' && { fise_dni: fiseDni })
      }));
    }

    // Validaciones estándar
    if (!amount || amount <= 0) {
      alert('Debe ingresar un monto válido');
      return;
    }

    if (amount > debt) {
      alert('El monto no puede ser mayor a la deuda pendiente');
      return;
    }

    // Preparar datos para enviar
    const submitData = {
      customer_id: customer.id,
      amount: amount.toString(),
      payment_method: formData.payment_method,
      description: formData.description,
      voucher: formData.voucher,
      collected_by: formData.collected_by
    };

    // Agregar datos específicos de FISE
    if (showFiseFields || hasFiseInMixed) {
      submitData.fise_dni = fiseDni;
    }

    // Agregar detalles de pago mixto
    if (paymentDetails) {
      submitData.mixed_payment_details = paymentDetails;
      submitData.mixed_vouchers = mixedVouchers;
    }

    onSubmit(submitData);
  };

  return (
    <div className="credits-modal-overlay" onClick={onClose}>
      <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
        <div className="credits-modal-header">
          <h2 className="credits-modal-title">
            💰 Registrar Pago - {customer.full_name}
          </h2>
          <button className="credits-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="credits-modal-body">
          <div className="credits-customer-info">
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Deuda actual:</span>
              <span className="credits-customer-info-value" style={{ color: '#ef4444' }}>
                {formatCurrency(debt)}
              </span>
            </div>
          </div>

          <form className="credits-form" onSubmit={handleSubmit}>
            {/* Monto a pagar - solo visible si NO es FISE puro ni MIXTO */}
            {!showFiseFields && !showMixedPayments && (
              <div className="credits-form-group">
                <label className="credits-form-label">Monto a pagar *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="credits-form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={debt}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handlePayTotal}
                    className="credits-form-btn credits-form-btn--secondary"
                    style={{ flex: 'none', whiteSpace: 'nowrap' }}
                  >
                    Pagar total
                  </button>
                </div>
              </div>
            )}

            {/* Método de pago */}
            <div className="credits-form-group">
              <label className="credits-form-label">Método de pago *</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="credits-form-select"
                required
              >
                {AVAILABLE_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {METHOD_LABELS[method] || method}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos específicos de Vale FISE */}
            {showFiseFields && (
              <>
                <div className="credits-form-group">
                  <label className="credits-form-label">
                    DNI del Beneficiario FISE *
                  </label>
                  <input
                    type="text"
                    value={fiseDni}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setFiseDni(value);
                    }}
                    className="credits-form-input"
                    placeholder="12345678"
                    maxLength="8"
                    required
                  />
                  <span className="credits-form-hint">
                    Ingresa el DNI de 8 dígitos del beneficiario FISE
                  </span>
                </div>

                <div className="credits-form-group">
                  <label className="credits-form-label">
                    Valor del Vale FISE *
                  </label>
                  <div className="credits-fise-input-wrapper">
                    <span className="credits-fise-currency">S/</span>
                    <input
                      type="number"
                      value={fiseAmount}
                      onChange={(e) => setFiseAmount(e.target.value)}
                      className="credits-form-input credits-fise-input"
                      placeholder="Ej: 16.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <span className="credits-form-hint">
                    Ingresa el valor exacto del vale FISE recibido
                  </span>

                  {fiseAmount && parseFloat(fiseAmount) < debt && (
                    <div className="credits-fise-warning">
                      <div className="credits-fise-warning-icon">⚠️</div>
                      <div className="credits-fise-warning-content">
                        <strong>El vale no cubre el total de la deuda</strong>
                        <span>Diferencia: S/ {(debt - parseFloat(fiseAmount)).toFixed(2)}</span>
                        <span className="credits-fise-warning-hint">
                          Use "Pago Mixto" para combinar Vale FISE con otro método
                        </span>
                      </div>
                    </div>
                  )}

                  {fiseAmount && parseFloat(fiseAmount) >= debt && (
                    <div className="credits-fise-complete">
                      ✓ Vale cubre el total de la deuda
                    </div>
                  )}
                </div>

                <div className="credits-form-group">
                  <label className="credits-form-label">Foto del Vale FISE *</label>
                  <div className="credits-form-file">
                    <input
                      type="file"
                      id="fise-voucher"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="fise-voucher" className="credits-form-file-label">
                      📷 Clic para adjuntar foto del vale
                    </label>
                    {voucherPreview && (
                      <div className="credits-form-file-preview">
                        📎 {voucherPreview}
                      </div>
                    )}
                  </div>
                  <span className="credits-form-hint">
                    Adjunta una foto clara del vale FISE
                  </span>
                </div>
              </>
            )}

            {/* Sección de Pago Mixto */}
            {showMixedPayments && (
              <div className="credits-mixed-section">
                <label className="credits-form-label">Desglose de Pagos</label>
                <p className="credits-mixed-subtitle">
                  Deuda a cubrir: <strong>S/ {debt.toFixed(2)}</strong>
                </p>

                {mixedPayments.map((payment, index) => (
                  <div key={index} className="credits-mixed-row">
                    <select
                      className="credits-mixed-select"
                      value={payment.method}
                      onChange={(e) => handleMixedPaymentChange(index, 'method', e.target.value)}
                    >
                      {getAvailableMethods(index).map(method => (
                        <option key={method} value={method}>
                          {METHOD_LABELS[method] || method}
                        </option>
                      ))}
                    </select>
                    <div className="credits-mixed-amount-wrapper">
                      <span className="credits-mixed-currency">S/</span>
                      <input
                        type="number"
                        className="credits-mixed-amount"
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
                        className="credits-mixed-remove"
                        onClick={() => removeMixedPayment(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="credits-mixed-add"
                  onClick={addMixedPayment}
                >
                  + Agregar otro método
                </button>

                {/* Resumen de pagos mixtos */}
                <div className={`credits-mixed-summary ${mixedRemaining <= 0 && mixedTotal > 0 ? 'complete' : mixedRemaining < 0 ? 'excess' : 'pending'}`}>
                  <div className="credits-mixed-summary-row">
                    <span>Total a abonar:</span>
                    <span>S/ {mixedTotal.toFixed(2)}</span>
                  </div>
                  {mixedRemaining > 0 ? (
                    <div className="credits-mixed-summary-row pending">
                      <span>Falta para cubrir deuda:</span>
                      <span>S/ {mixedRemaining.toFixed(2)}</span>
                    </div>
                  ) : mixedRemaining < 0 ? (
                    <div className="credits-mixed-summary-row excess">
                      <span>⚠️ Excede la deuda por:</span>
                      <span>S/ {Math.abs(mixedRemaining).toFixed(2)}</span>
                    </div>
                  ) : mixedTotal > 0 ? (
                    <div className="credits-mixed-summary-row complete">
                      <span>Cubre la deuda completa</span>
                      <span>✓</span>
                    </div>
                  ) : null}
                </div>

                {/* Campo DNI si incluye FISE en pago mixto */}
                {hasFiseInMixed && (
                  <div className="credits-form-group" style={{ marginTop: '1rem' }}>
                    <label className="credits-form-label">
                      DNI del Beneficiario FISE *
                    </label>
                    <input
                      type="text"
                      value={fiseDni}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setFiseDni(value);
                      }}
                      className="credits-form-input"
                      placeholder="12345678"
                      maxLength="8"
                      required
                    />
                    <span className="credits-form-hint">
                      Requerido porque incluye Vale FISE en el pago
                    </span>
                  </div>
                )}

                {/* Vouchers para métodos mixtos que no son efectivo */}
                {methodsRequiringVoucher.length > 0 && (
                  <div className="credits-vouchers-section">
                    <label className="credits-form-label" style={{ marginTop: '1rem' }}>
                      Comprobantes de Pago {hasFiseInMixed ? '*' : '(Opcional)'}
                    </label>
                    {hasFiseInMixed && (
                      <span className="credits-form-hint" style={{ marginBottom: '0.5rem', display: 'block' }}>
                        La foto del Vale FISE es obligatoria
                      </span>
                    )}
                    {methodsRequiringVoucher.map((payment) => (
                      <div key={payment.method} className="credits-voucher-item">
                        <span className="credits-voucher-method-label">
                          {payment.method === 'VALE_FISE' ? '📄 Foto Vale FISE' : METHOD_LABELS[payment.method] || payment.method}
                          {payment.amount ? ` - S/ ${parseFloat(payment.amount).toFixed(2)}` : ''}
                          {payment.method === 'VALE_FISE' && ' *'}
                        </span>
                        <div className="credits-voucher-upload">
                          {!mixedVoucherPreviews[payment.method] ? (
                            <label className={`credits-voucher-dropzone-mini ${payment.method === 'VALE_FISE' ? 'credits-voucher-dropzone-mini--required' : ''}`}>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleMixedVoucherChange(payment.method, e)}
                                style={{ display: 'none' }}
                              />
                              <span>📷 {payment.method === 'VALE_FISE' ? 'Adjuntar foto *' : 'Adjuntar'}</span>
                            </label>
                          ) : (
                            <div className="credits-voucher-preview-mini">
                              <span className="credits-voucher-filename">
                                📎 {mixedVoucherPreviews[payment.method]}
                              </span>
                              <button
                                type="button"
                                className="credits-voucher-remove-mini"
                                onClick={() => handleRemoveMixedVoucher(payment.method)}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Repartidor que recibió el pago */}
            <div className="credits-form-group">
              <label className="credits-form-label">Repartidor que recibió el pago *</label>
              <select
                name="collected_by"
                value={formData.collected_by}
                onChange={handleChange}
                className="credits-form-select"
                required
                disabled={loadingDeliverymen}
              >
                <option value="">
                  {loadingDeliverymen ? 'Cargando repartidores...' : 'Seleccione un repartidor'}
                </option>
                {deliverymen.map((dm) => (
                  <option key={dm.id} value={dm.id}>
                    {dm.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Comprobante general (solo para métodos simples no-efectivo) */}
            {!showMixedPayments && !showFiseFields && formData.payment_method !== 'EFECTIVO' && (
              <div className="credits-form-group">
                <label className="credits-form-label">Comprobante (opcional)</label>
                <div className="credits-form-file">
                  <input
                    type="file"
                    id="voucher"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="voucher" className="credits-form-file-label">
                    📷 Clic para adjuntar imagen o PDF
                  </label>
                  {voucherPreview && (
                    <div className="credits-form-file-preview">
                      📎 {voucherPreview}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="credits-form-group">
              <label className="credits-form-label">Descripción (opcional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="credits-form-textarea"
                placeholder="Agregar nota o descripción..."
              />
            </div>

            {/* Botones de acción */}
            <div className="credits-form-actions">
              <button
                type="button"
                onClick={onClose}
                className="credits-form-btn credits-form-btn--secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="credits-form-btn credits-form-btn--primary"
              >
                {loading ? 'Procesando...' : 'Registrar Pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
