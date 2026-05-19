import { useState, useEffect, useRef } from 'react';
import { customerService } from '../../services/customerService';
import { useDebounce } from '../../hooks/useDebounce';
import './AdjustmentForm.css';

export const AdjustmentForm = ({ onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    amount: '',
    description: ''
  });
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const debouncedSearch = useDebounce(searchCustomer, 350);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const searchCustomers = async () => {
      setSearchLoading(true);
      try {
        const response = await customerService.getAll({
          search: debouncedSearch,
          status: 'active',
          limit: 10
        });
        setSearchResults(response.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error buscando clientes:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    searchCustomers();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customer_id: customer.id }));
    setSearchCustomer('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Debe seleccionar un cliente');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) === 0) {
      alert('Debe ingresar un monto valido');
      return;
    }

    const amount = parseFloat(formData.amount);
    const finalAmount = adjustmentType === 'subtract' ? -Math.abs(amount) : Math.abs(amount);

    onSubmit({
      customer_id: formData.customer_id,
      amount: finalAmount,
      description: formData.description || (adjustmentType === 'add' ? 'Ajuste manual - Incremento de saldo' : 'Ajuste manual - Reduccion de saldo')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="adjustment-form">
      <h3 className="adjustment-form__title">Ajuste Manual de Saldo</h3>

      <div className="adjustment-form__field">
        <label>Cliente</label>
        {selectedCustomer ? (
          <div className="adjustment-form__selected-customer">
            <div>
              <strong>{selectedCustomer.full_name}</strong>
              {selectedCustomer.dni && (
                <span className="adjustment-form__customer-dni">DNI: {selectedCustomer.dni}</span>
              )}
              <span className="adjustment-form__customer-phone">{selectedCustomer.phone}</span>
              {selectedCustomer.address && (
                <span className="adjustment-form__customer-address">{selectedCustomer.address}</span>
              )}
              <span className="adjustment-form__customer-balance">
                Saldo actual: S/ {parseFloat(selectedCustomer.ganagas_balance || 0).toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setFormData(prev => ({ ...prev, customer_id: '' }));
              }}
              className="adjustment-form__btn-change"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="adjustment-form__search" ref={searchRef}>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, telefono o direccion..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              className="adjustment-form__input"
              autoComplete="off"
            />
            {searchLoading && (
              <span className="adjustment-form__search-loading">Buscando...</span>
            )}
            {showDropdown && searchResults.length > 0 && (
              <ul className="adjustment-form__customer-list">
                {searchResults.map(customer => (
                  <li
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="adjustment-form__customer-item"
                  >
                    <span className="adjustment-form__customer-name">{customer.full_name}</span>
                    <span className="adjustment-form__customer-info">
                      {customer.dni && `DNI: ${customer.dni}`}
                      {customer.dni && customer.phone && ' | '}
                      {customer.phone}
                    </span>
                    {customer.address && (
                      <span className="adjustment-form__customer-info">
                        {customer.address}{customer.district ? `, ${customer.district}` : ''}
                      </span>
                    )}
                    <span className="adjustment-form__customer-info adjustment-form__customer-info--balance">
                      Saldo: S/ {parseFloat(customer.ganagas_balance || 0).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {showDropdown && !searchLoading && debouncedSearch.length >= 2 && searchResults.length === 0 && (
              <div className="adjustment-form__no-results">
                No se encontraron clientes para "{debouncedSearch}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="adjustment-form__field">
        <label>Tipo de Ajuste</label>
        <div className="adjustment-form__type-buttons">
          <button
            type="button"
            className={`adjustment-form__type-btn ${adjustmentType === 'add' ? 'adjustment-form__type-btn--active-add' : ''}`}
            onClick={() => setAdjustmentType('add')}
          >
            + Agregar Saldo
          </button>
          <button
            type="button"
            className={`adjustment-form__type-btn ${adjustmentType === 'subtract' ? 'adjustment-form__type-btn--active-subtract' : ''}`}
            onClick={() => setAdjustmentType('subtract')}
          >
            - Reducir Saldo
          </button>
        </div>
      </div>

      <div className="adjustment-form__field">
        <label>Monto (S/)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          className="adjustment-form__input"
          required
        />
      </div>

      <div className="adjustment-form__field">
        <label>Descripcion / Motivo</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="adjustment-form__textarea"
          rows="2"
          placeholder="Ej: Compensacion por error en pedido anterior..."
        />
      </div>

      <div className="adjustment-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="adjustment-form__btn adjustment-form__btn--cancel"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`adjustment-form__btn ${adjustmentType === 'add' ? 'adjustment-form__btn--add' : 'adjustment-form__btn--subtract'}`}
          disabled={loading || !selectedCustomer}
        >
          {loading ? 'Procesando...' : (adjustmentType === 'add' ? 'Agregar Saldo' : 'Reducir Saldo')}
        </button>
      </div>
    </form>
  );
};
