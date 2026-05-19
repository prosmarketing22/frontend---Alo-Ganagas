import { useState, useEffect, useCallback } from 'react';
import { useCustomerCreditApi } from '../../hooks/useApi/useCustomerCreditApi';
import { collaboratorService } from '../../services/collaboratorService';
import './BaseCreditCollectionSection.css';

export const BaseCreditCollectionSection = ({ onSuccess }) => {
  const { fetchCustomersWithDebt, registerCollectionForDeliverer, loading } = useCustomerCreditApi();

  const [customers, setCustomers] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDeliverers, setLoadingDeliverers] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'EFECTIVO',
    deliverer_id: '',
    description: '',
    voucher: null
  });
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetchCustomersWithDebt({
        search,
        has_debt_only: true,
        limit: 10
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoadingCustomers(false);
    }
  }, [search, fetchCustomersWithDebt]);

  const loadDeliverers = async () => {
    setLoadingDeliverers(true);
    try {
      const response = await collaboratorService.getDeliverymen();
      setDeliverers(response.data || []);
    } catch (error) {
      console.error('Error cargando repartidores:', error);
    } finally {
      setLoadingDeliverers(false);
    }
  };

  useEffect(() => {
    loadDeliverers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= 2) {
        loadCustomers();
      } else if (search.length === 0) {
        setCustomers([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadCustomers]);

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
    setSearch('');
    setCustomers([]);
    setFormData({
      amount: '',
      payment_method: 'EFECTIVO',
      deliverer_id: '',
      description: '',
      voucher: null
    });
  };

  const handleCancelSelection = () => {
    setSelectedCustomer(null);
    setShowForm(false);
    setFormData({
      amount: '',
      payment_method: 'EFECTIVO',
      deliverer_id: '',
      description: '',
      voucher: null
    });
    setVoucherPreview(null);
    setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, voucher: file }));
      setVoucherPreview(file.name);
    }
  };

  const handlePayTotal = () => {
    const debt = parseFloat(selectedCustomer.pending_debt) || 0;
    setFormData((prev) => ({ ...prev, amount: debt.toFixed(2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setErrorMessage('Debe ingresar un monto válido');
      return;
    }

    const debt = parseFloat(selectedCustomer.pending_debt) || 0;
    if (amount > debt) {
      setErrorMessage('El monto no puede ser mayor a la deuda pendiente');
      return;
    }

    if (!formData.deliverer_id) {
      setErrorMessage('Debe seleccionar el repartidor que realizó el cobro');
      return;
    }

    try {
      await registerCollectionForDeliverer({
        customer_id: selectedCustomer.id,
        amount: formData.amount,
        payment_method: formData.payment_method,
        deliverer_id: formData.deliverer_id,
        description: formData.description,
        voucher: formData.voucher
      });

      setSuccessMessage(`Cobro de ${formatCurrency(amount)} registrado exitosamente para ${selectedCustomer.full_name}`);
      handleCancelSelection();

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.message || 'Error al registrar el cobro');
    }
  };

  const paymentMethods = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'TARJETA'];

  return (
    <div className="base-collection">
      <div className="base-collection__header">
        <h3 className="base-collection__title">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Registrar Cobro de Crédito
        </h3>
        <p className="base-collection__subtitle">
          Registra cobros de deudas pendientes asignándolos a un repartidor
        </p>
      </div>

      {successMessage && (
        <div className="base-collection__success">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {!showForm ? (
        <div className="base-collection__search">
          <label className="base-collection__label">Buscar cliente con deuda</label>
          <div className="base-collection__search-container">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ingrese nombre, teléfono o dirección..."
              className="base-collection__input"
            />
            {loadingCustomers && (
              <div className="base-collection__search-loading">
                <div className="base-collection__spinner-small"></div>
              </div>
            )}
          </div>

          {customers.length > 0 && (
            <div className="base-collection__results">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="base-collection__result-item"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="base-collection__result-info">
                    <strong>{customer.full_name}</strong>
                    <span>{customer.phone || 'Sin teléfono'}</span>
                    {customer.address && <span className="base-collection__result-address">{customer.address}</span>}
                  </div>
                  <div className="base-collection__result-debt">
                    <span className="base-collection__debt-label">Deuda:</span>
                    <span className="base-collection__debt-amount">{formatCurrency(customer.pending_debt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {search.length >= 2 && customers.length === 0 && !loadingCustomers && (
            <div className="base-collection__no-results">
              No se encontraron clientes con deuda pendiente
            </div>
          )}
        </div>
      ) : (
        <div className="base-collection__form-container">
          <div className="base-collection__customer-card">
            <div className="base-collection__customer-info">
              <strong>{selectedCustomer.full_name}</strong>
              <span>{selectedCustomer.phone || 'Sin teléfono'}</span>
            </div>
            <div className="base-collection__customer-debt">
              <span>Deuda pendiente:</span>
              <strong>{formatCurrency(selectedCustomer.pending_debt)}</strong>
            </div>
            <button
              type="button"
              className="base-collection__btn-cancel-selection"
              onClick={handleCancelSelection}
            >
              ×
            </button>
          </div>

          {errorMessage && (
            <div className="base-collection__error">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}

          <form className="base-collection__form" onSubmit={handleSubmit}>
            <div className="base-collection__form-row">
              <div className="base-collection__form-group">
                <label className="base-collection__label">Monto a cobrar *</label>
                <div className="base-collection__amount-input">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="base-collection__input"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={selectedCustomer.pending_debt}
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePayTotal}
                    className="base-collection__btn-total"
                  >
                    Total
                  </button>
                </div>
              </div>

              <div className="base-collection__form-group">
                <label className="base-collection__label">Método de pago *</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="base-collection__select"
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="base-collection__form-group">
              <label className="base-collection__label">Repartidor que realizó el cobro *</label>
              <select
                name="deliverer_id"
                value={formData.deliverer_id}
                onChange={handleChange}
                className="base-collection__select"
                required
                disabled={loadingDeliverers}
              >
                <option value="">
                  {loadingDeliverers ? 'Cargando repartidores...' : 'Seleccione un repartidor'}
                </option>
                {deliverers.map((dm) => (
                  <option key={dm.id} value={dm.id}>
                    {dm.full_name}
                  </option>
                ))}
              </select>
              <span className="base-collection__hint">
                El cobro se registrará en la caja del repartidor seleccionado
              </span>
            </div>

            <div className="base-collection__form-group">
              <label className="base-collection__label">Comprobante (opcional)</label>
              <div className="base-collection__file-input">
                <input
                  type="file"
                  id="collection-voucher"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="collection-voucher" className="base-collection__file-label">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {voucherPreview || 'Adjuntar imagen o PDF'}
                </label>
              </div>
            </div>

            <div className="base-collection__form-group">
              <label className="base-collection__label">Descripción (opcional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="base-collection__textarea"
                placeholder="Agregar nota o descripción del cobro..."
                rows={2}
              />
            </div>

            <div className="base-collection__form-actions">
              <button
                type="button"
                onClick={handleCancelSelection}
                className="base-collection__btn base-collection__btn--secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="base-collection__btn base-collection__btn--primary"
              >
                {loading ? (
                  <>
                    <div className="base-collection__spinner-small"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Registrar Cobro
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BaseCreditCollectionSection;
