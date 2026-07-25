import { useState, useEffect } from 'react';
import { useCustomerCreditApi } from '../../hooks/useApi/useCustomerCreditApi';
import repartidorService from '../../services/repartidorService';
import { prepareVoucherFile } from '../../utils/imageCompression';

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

// Card de cliente con deuda
const CreditCustomerCard = ({ customer, onAssign, onCollect, isAssigned }) => {
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="customer-card">
      <div className="customer-card__header">
        <div className="customer-card__info">
          <h3 className="customer-card__name">{customer.full_name || 'Sin nombre'}</h3>
          <p className="customer-card__phone">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {customer.phone || 'Sin telefono'}
          </p>
        </div>
        <div className="customer-card__badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
          <span className="customer-card__badge-value">{formatCurrency(customer.pending_debt)}</span>
          <span className="customer-card__badge-label">Deuda</span>
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
        {customer.credit_limit > 0 && (
          <div className="customer-card__detail">
            <span className="customer-card__detail-icon">💳</span>
            <span className="customer-card__detail-text">
              Limite: {formatCurrency(customer.credit_limit)}
            </span>
          </div>
        )}
      </div>

      {isAssigned ? (
        <button onClick={() => onCollect(customer)} className="customer-card__action-btn" style={{ background: '#10b981' }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Registrar Cobro
        </button>
      ) : (
        <button onClick={() => onAssign(customer)} className="customer-card__action-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Asignarme Cobro
        </button>
      )}
    </div>
  );
};

// Modal de cobro de crédito
const CreditCollectionModal = ({ customer, assignment, onSubmit, onClose, loading, paymentMethods = [] }) => {
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [amount, setAmount] = useState('');
  const [fiseDni, setFiseDni] = useState('');
  const [notes, setNotes] = useState('');
  const [vouchers, setVouchers] = useState({});
  const [voucherPreviews, setVoucherPreviews] = useState({});
  const [mixedPayments, setMixedPayments] = useState([
    { method: 'EFECTIVO', amount: '' },
    { method: 'YAPE', amount: '' }
  ]);

  const debt = parseFloat(customer.pending_debt) || 0;

  // Métodos disponibles en el selector principal (excluir CREDITO)
  const selectableMethods = paymentMethods.filter(m => m.method_type !== 'CREDITO');

  // Agregar MIXTO si no viene del backend
  const allMethods = selectableMethods.some(m => m.method_type === 'MIXTO')
    ? selectableMethods
    : [...selectableMethods, { method_type: 'MIXTO', display_order: 999 }];

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // --- Voucher handlers ---
  // Sin restriccion de peso: las fotos grandes se recomprimen en el cliente.
  const handleVoucherChange = async (method, e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;
    const inputEl = e.target;
    try {
      const file = await prepareVoucherFile(rawFile);
      if (voucherPreviews[method]) URL.revokeObjectURL(voucherPreviews[method]);
      setVouchers(prev => ({ ...prev, [method]: file }));
      setVoucherPreviews(prev => ({ ...prev, [method]: URL.createObjectURL(file) }));
    } catch (err) {
      console.error('Error procesando voucher:', err);
      if (inputEl) inputEl.value = '';
    }
  };

  const handleRemoveVoucher = (method) => {
    if (voucherPreviews[method]) URL.revokeObjectURL(voucherPreviews[method]);
    setVouchers(prev => { const u = { ...prev }; delete u[method]; return u; });
    setVoucherPreviews(prev => { const u = { ...prev }; delete u[method]; return u; });
  };

  // --- Mixed payment handlers ---
  const mixedTotal = mixedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const handleMixedChange = (index, field, value) => {
    const updated = [...mixedPayments];
    updated[index][field] = value;
    setMixedPayments(updated);
  };

  const addMixedPayment = () => {
    const usedMethods = mixedPayments.map(p => p.method);
    const available = paymentMethods.find(m =>
      m.method_type !== 'MIXTO' && m.method_type !== 'CREDITO' && !usedMethods.includes(m.method_type)
    );
    setMixedPayments([...mixedPayments, { method: available?.method_type || 'EFECTIVO', amount: '' }]);
  };

  const removeMixedPayment = (index) => {
    if (mixedPayments.length <= 2) return;
    const methodToRemove = mixedPayments[index].method;
    if (vouchers[methodToRemove]) handleRemoveVoucher(methodToRemove);
    setMixedPayments(mixedPayments.filter((_, i) => i !== index));
  };

  const getAvailableMixedMethods = (currentIndex) => {
    const usedMethods = mixedPayments.filter((_, i) => i !== currentIndex).map(p => p.method);
    return paymentMethods.filter(m =>
      m.method_type !== 'MIXTO' && m.method_type !== 'CREDITO' &&
      (!usedMethods.includes(m.method_type) || m.method_type === mixedPayments[currentIndex].method)
    );
  };

  // --- Validation ---
  const isFormValid = (() => {
    if (paymentMethod === 'MIXTO') {
      if (mixedTotal <= 0 || mixedTotal > debt) return false;
      const needVoucher = mixedPayments.filter(p => p.method !== 'EFECTIVO' && parseFloat(p.amount) > 0);
      return needVoucher.every(p => vouchers[p.method]);
    }
    const amt = parseFloat(amount) || 0;
    if (amt <= 0 || amt > debt) return false;
    if ((paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') && fiseDni.length !== 8) return false;
    if (paymentMethod !== 'EFECTIVO' && !vouchers[paymentMethod]) return false;
    return true;
  })();

  // --- Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const data = {
      payment_method: paymentMethod,
      notes
    };

    if (paymentMethod === 'MIXTO') {
      data.amount = mixedTotal.toFixed(2);
      data.mixed_payment_details = mixedPayments
        .filter(p => parseFloat(p.amount) > 0)
        .map(p => ({ method: p.method, amount: parseFloat(p.amount) }));
      // Recoger vouchers de cada método mixto
      const mixedVouchers = {};
      mixedPayments.forEach(p => {
        if (vouchers[p.method]) mixedVouchers[p.method] = vouchers[p.method];
      });
      data.vouchers = mixedVouchers;
    } else {
      data.amount = amount;
      data.voucher = vouchers[paymentMethod] || null;
      if (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') {
        data.fise_dni = fiseDni;
      }
    }

    onSubmit(data);
  };

  return (
    <div className="credits-modal-overlay" onClick={onClose}>
      <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
        <div className="credits-modal-header">
          <h2 className="credits-modal-title">
            💰 Cobrar Deuda - {customer.full_name}
          </h2>
          <button className="credits-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="credits-modal-body">
          <div className="credits-customer-info">
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Deuda pendiente:</span>
              <span className="credits-customer-info-value" style={{ color: '#ef4444' }}>
                {formatCurrency(debt)}
              </span>
            </div>
            <div className="credits-customer-info-row">
              <span className="credits-customer-info-label">Dirección:</span>
              <span className="credits-customer-info-value">{customer.address}</span>
            </div>
          </div>

          <form className="credits-form" onSubmit={handleSubmit}>
            {/* Método de pago */}
            <div className="credits-form-group">
              <label className="credits-form-label">Método de pago *</label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setAmount('');
                  setFiseDni('');
                }}
                className="credits-form-select"
                required
              >
                {allMethods.map((method) => (
                  <option key={method.method_type} value={method.method_type}>
                    {METHOD_LABELS[method.method_type] || method.method_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Pago Mixto */}
            {paymentMethod === 'MIXTO' && (
              <div className="credits-form-group">
                <label className="credits-form-label">Desglose de Pagos</label>

                {mixedPayments.map((payment, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <select
                      value={payment.method}
                      onChange={(e) => handleMixedChange(index, 'method', e.target.value)}
                      className="credits-form-select"
                      style={{ flex: 1 }}
                    >
                      {getAvailableMixedMethods(index).map(m => (
                        <option key={m.method_type} value={m.method_type}>
                          {METHOD_LABELS[m.method_type] || m.method_type}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <span style={{ color: '#64748b', marginRight: '4px' }}>S/</span>
                      <input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => handleMixedChange(index, 'amount', e.target.value)}
                        className="credits-form-input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        style={{ flex: 1 }}
                      />
                    </div>
                    {mixedPayments.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMixedPayment(index)}
                        style={{
                          background: '#fef2f2', color: '#dc2626', border: 'none',
                          borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer',
                          fontSize: '1rem', lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMixedPayment}
                  style={{
                    background: '#f1f5f9', border: 'none', borderRadius: '6px',
                    padding: '0.5rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer',
                    color: '#475569', marginBottom: '0.5rem'
                  }}
                >
                  + Agregar otro método
                </button>

                {/* Resumen mixto */}
                <div style={{
                  background: mixedTotal > 0 && mixedTotal <= debt ? '#ecfdf5' : '#fef2f2',
                  padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total ingresado:</span>
                    <span style={{ fontWeight: 600 }}>S/ {mixedTotal.toFixed(2)}</span>
                  </div>
                  {mixedTotal > debt && (
                    <div style={{ color: '#dc2626', marginTop: '0.25rem' }}>
                      Excede deuda por: S/ {(mixedTotal - debt).toFixed(2)}
                    </div>
                  )}
                  {mixedTotal > 0 && mixedTotal <= debt && (
                    <div style={{ color: '#059669', marginTop: '0.25rem' }}>
                      ✓ Monto válido
                    </div>
                  )}
                </div>

                {/* Vouchers para métodos mixtos no-efectivo */}
                {mixedPayments.filter(p => p.method !== 'EFECTIVO' && parseFloat(p.amount) > 0).map((payment) => (
                  <div key={`voucher-${payment.method}`} style={{ marginTop: '0.75rem' }}>
                    <label className="credits-form-label">
                      Comprobante - {METHOD_LABELS[payment.method] || payment.method}
                      {payment.amount ? ` (S/ ${parseFloat(payment.amount).toFixed(2)})` : ''} *
                    </label>
                    <div className="credits-form-file">
                      {!voucherPreviews[payment.method] ? (
                        <>
                          <input
                            type="file"
                            id={`voucher-mixed-${payment.method}`}
                            accept="image/*"
                            onChange={(e) => handleVoucherChange(payment.method, e)}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor={`voucher-mixed-${payment.method}`} className="credits-form-file-label">
                            📷 Adjuntar imagen
                          </label>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={voucherPreviews[payment.method]} alt="Preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '6px' }} />
                          <button type="button" onClick={() => handleRemoveVoucher(payment.method)}
                            style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Monto a cobrar (NO mixto) */}
            {paymentMethod !== 'MIXTO' && (
              <div className="credits-form-group">
                <label className="credits-form-label">
                  {(paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') ? 'Valor del Vale FISE *' : 'Monto a cobrar *'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const val = Math.min(parseFloat(e.target.value) || 0, debt);
                      setAmount(val > 0 ? String(val) : '');
                    }}
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
                    onClick={() => setAmount(String(debt))}
                    className="credits-form-btn credits-form-btn--secondary"
                    style={{ flex: 'none', whiteSpace: 'nowrap' }}
                  >
                    Cobrar total
                  </button>
                </div>
              </div>
            )}

            {/* DNI FISE */}
            {(paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') && (
              <div className="credits-form-group">
                <label className="credits-form-label">DNI del Beneficiario FISE *</label>
                <input
                  type="text"
                  value={fiseDni}
                  onChange={(e) => setFiseDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="credits-form-input"
                  placeholder="12345678"
                  maxLength="8"
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Ingresa el DNI de 8 dígitos del beneficiario FISE
                </p>
              </div>
            )}

            {/* Comprobante (NO mixto, NO efectivo) */}
            {paymentMethod !== 'EFECTIVO' && paymentMethod !== 'MIXTO' && parseFloat(amount) > 0 && (
              <div className="credits-form-group">
                <label className="credits-form-label">
                  Comprobante - {METHOD_LABELS[paymentMethod] || paymentMethod} *
                </label>
                <div className="credits-form-file">
                  {!voucherPreviews[paymentMethod] ? (
                    <>
                      <input
                        type="file"
                        id="voucher-repartidor"
                        accept="image/*"
                        onChange={(e) => handleVoucherChange(paymentMethod, e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="voucher-repartidor" className="credits-form-file-label">
                        📷 Tomar foto o adjuntar imagen
                      </label>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={voucherPreviews[paymentMethod]} alt="Preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '6px' }} />
                      <button type="button" onClick={() => handleRemoveVoucher(paymentMethod)}
                        style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="credits-form-group">
              <label className="credits-form-label">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="credits-form-textarea"
                placeholder="Agregar nota..."
              />
            </div>

            {/* Acciones */}
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
                disabled={loading || !isFormValid}
                className="credits-form-btn credits-form-btn--primary"
              >
                {loading ? 'Procesando...' : 'Confirmar Cobro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const RepartidorCreditosTab = () => {
  const [customersWithDebt, setCustomersWithDebt] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const {
    loading,
    fetchCustomersWithDebt,
    fetchMyAssignments,
    assignToMe,
    completeAssignment,
    cancelAssignment
  } = useCustomerCreditApi();

  useEffect(() => {
    loadData();
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const result = await repartidorService.getPaymentMethods();
      if (result.success && result.data) {
        setPaymentMethods(result.data);
      }
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setPaymentMethods([
        { method_type: 'EFECTIVO', display_order: 0 },
        { method_type: 'YAPE', display_order: 1 },
        { method_type: 'PLIN', display_order: 2 },
        { method_type: 'TRANSFERENCIA', display_order: 3 }
      ]);
    }
  };

  const loadData = async () => {
    try {
      const [customersResponse, assignmentsData] = await Promise.all([
        fetchCustomersWithDebt({ has_debt_only: true, limit: 50 }),
        fetchMyAssignments({ status: 'PENDIENTE' })
      ]);
      setCustomersWithDebt(customersResponse.data || []);
      setMyAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchCustomersWithDebt({
        has_debt_only: true,
        search: searchTerm,
        limit: 50
      });
      setCustomersWithDebt(response.data || []);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  };

  const handleAssign = async (customer) => {
    if (!confirm(`¿Desea asignarse el cobro de ${customer.full_name}?`)) {
      return;
    }

    try {
      await assignToMe(customer.id);
      alert('Cobro asignado exitosamente');
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleOpenCollection = (customer) => {
    const assignment = myAssignments.find(a => a.customer_id === customer.id);
    setSelectedCustomer(customer);
    setSelectedAssignment(assignment);
    setShowCollectionModal(true);
  };

  const handleSubmitCollection = async (collectionData) => {
    try {
      await completeAssignment(selectedAssignment.id, collectionData);
      alert('Cobro registrado exitosamente');
      setShowCollectionModal(false);
      setSelectedCustomer(null);
      setSelectedAssignment(null);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCancelAssignment = async (assignmentId) => {
    if (!confirm('¿Desea cancelar esta asignación?')) {
      return;
    }

    try {
      await cancelAssignment(assignmentId);
      alert('Asignación cancelada');
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const assignedCustomerIds = myAssignments.map(a => a.customer_id);
  const filteredCustomers = customersWithDebt.filter(c =>
    !searchTerm || c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) || c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
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
              placeholder="Buscar cliente con deuda..."
              className="cobros-page__search-input"
            />
          </div>
          <button type="submit" className="cobros-page__search-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </button>
        </form>
      </div>

      {/* Mis Asignaciones */}
      {myAssignments.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Mis Cobros Asignados ({myAssignments.length})
          </h3>
          <div className="cobros-page__cards">
            {myAssignments.map((assignment) => {
              const customer = customersWithDebt.find(c => c.id === assignment.customer_id) || {
                id: assignment.customer_id,
                full_name: assignment.customer_name,
                phone: assignment.customer_phone,
                address: assignment.customer_address,
                pending_debt: assignment.customer_pending_debt
              };
              return (
                <div key={assignment.id} className="customer-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <CreditCustomerCard
                    customer={customer}
                    onCollect={handleOpenCollection}
                    isAssigned={true}
                  />
                  <button
                    onClick={() => handleCancelAssignment(assignment.id)}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Cancelar asignación
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clientes con Deuda */}
      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        💸 Clientes con Deuda
      </h3>

      {loading ? (
        <div className="cobros-page__loading">
          <div className="cobros-page__spinner"></div>
          <p className="cobros-page__loading-text">Cargando clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="cobros-page__empty">
          <div className="cobros-page__empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="cobros-page__empty-title">No hay clientes con deuda</h2>
          <p className="cobros-page__empty-text">Todos los créditos están al día</p>
        </div>
      ) : (
        <>
          <div className="cobros-page__results-info">
            <p className="cobros-page__results-count">
              {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} con deuda
            </p>
          </div>
          <div className="cobros-page__cards">
            {filteredCustomers
              .filter(c => !assignedCustomerIds.includes(c.id))
              .map((customer) => (
                <CreditCustomerCard
                  key={customer.id}
                  customer={customer}
                  onAssign={handleAssign}
                  isAssigned={false}
                />
              ))}
          </div>
        </>
      )}

      {/* Modal de cobro */}
      {showCollectionModal && selectedCustomer && (
        <CreditCollectionModal
          customer={selectedCustomer}
          assignment={selectedAssignment}
          onSubmit={handleSubmitCollection}
          onClose={() => {
            setShowCollectionModal(false);
            setSelectedCustomer(null);
            setSelectedAssignment(null);
          }}
          loading={loading}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
};
