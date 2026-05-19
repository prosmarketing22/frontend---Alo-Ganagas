import { useState, useEffect } from 'react';

const BANKS = [
  'BCP - Banco de Crédito del Perú',
  'BBVA',
  'Interbank',
  'Scotiabank',
  'Banco de la Nación',
  'Banbif',
  'Pichincha',
  'GNB',
  'Alfin Banco',
  'Banco Ripley',
  'Banco Azteca',
  'Caja Arequipa',
  'Caja Huancayo',
  'Caja Sullana',
  'Caja Trujillo'
];

// Tipos de cuenta que coinciden con el backend
const ACCOUNT_TYPES = [
  { value: 'AHORROS', label: 'Cuenta de Ahorros' },
  { value: 'CORRIENTE', label: 'Cuenta Corriente' }
];

export const BankAccountForm = ({ account, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    bank_name: '',
    account_type: '',
    account_number: '',
    cci_number: '',
    holder_name: '',
    holder_dni: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        bank_name: account.bank_name || '',
        account_type: account.account_type || '',
        account_number: account.account_number || '',
        cci_number: account.cci_number || '',
        holder_name: account.holder_name || '',
        holder_dni: account.holder_dni || ''
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handler para campos numéricos con límite de caracteres
  const handleNumericChange = (e, maxLength) => {
    const { name } = e.target;
    const value = e.target.value.replace(/\D/g, ''); // Solo dígitos
    if (value.length <= maxLength) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.bank_name) newErrors.bank_name = 'Selecciona un banco';
    if (!formData.account_type) newErrors.account_type = 'Selecciona tipo de cuenta';
    if (!formData.account_number) newErrors.account_number = 'Ingresa número de cuenta';
    if (!formData.holder_name) newErrors.holder_name = 'Ingresa nombre del titular';

    // CCI es opcional pero si se ingresa debe tener 20 dígitos
    if (formData.cci_number && formData.cci_number.length !== 20) {
      newErrors.cci_number = 'El CCI debe tener 20 dígitos';
    }

    // DNI es opcional pero si se ingresa debe tener 8 dígitos
    if (formData.holder_dni && formData.holder_dni.length !== 8) {
      newErrors.holder_dni = 'El DNI debe tener 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <div className="bank-account-form-container">
      <form onSubmit={handleSubmit} className="bank-account-form">
        <div className="bank-account-form-row">
          <div className="bank-account-form-group">
            <label className="bank-account-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Banco <span className="bank-account-form-required">*</span>
            </label>
            <select
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className={`bank-account-form-select ${errors.bank_name ? 'bank-account-form-select--error' : ''}`}
              disabled={loading}
            >
              <option value="">Seleccionar banco</option>
              {BANKS.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.bank_name && <span className="bank-account-form-error">{errors.bank_name}</span>}
          </div>

          <div className="bank-account-form-group">
            <label className="bank-account-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tipo de cuenta <span className="bank-account-form-required">*</span>
            </label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className={`bank-account-form-select ${errors.account_type ? 'bank-account-form-select--error' : ''}`}
              disabled={loading}
            >
              <option value="">Seleccionar tipo</option>
              {ACCOUNT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.account_type && <span className="bank-account-form-error">{errors.account_type}</span>}
          </div>
        </div>

        <div className="bank-account-form-row">
          <div className="bank-account-form-group">
            <label className="bank-account-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Número de cuenta <span className="bank-account-form-required">*</span>
            </label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={(e) => handleNumericChange(e, 20)}
              placeholder="Ej: 19412345678901"
              maxLength="20"
              className={`bank-account-form-input ${errors.account_number ? 'bank-account-form-input--error' : ''}`}
              disabled={loading}
            />
            <span className="bank-account-form-hint">{formData.account_number.length}/20 dígitos máx.</span>
            {errors.account_number && <span className="bank-account-form-error">{errors.account_number}</span>}
          </div>

          <div className="bank-account-form-group">
            <label className="bank-account-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              CCI (Opcional)
            </label>
            <input
              type="text"
              name="cci_number"
              value={formData.cci_number}
              onChange={(e) => handleNumericChange(e, 20)}
              placeholder="20 dígitos"
              maxLength="20"
              className={`bank-account-form-input ${errors.cci_number ? 'bank-account-form-input--error' : ''}`}
              disabled={loading}
            />
            <span className="bank-account-form-hint">{formData.cci_number.length}/20 dígitos</span>
            {errors.cci_number && <span className="bank-account-form-error">{errors.cci_number}</span>}
          </div>
        </div>

        <div className="bank-account-form-row">
          <div className="bank-account-form-group">
            <label className="bank-account-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Titular <span className="bank-account-form-required">*</span>
            </label>
            <input
              type="text"
              name="holder_name"
              value={formData.holder_name}
              onChange={handleChange}
              placeholder="Nombre completo del titular"
              className={`bank-account-form-input ${errors.holder_name ? 'bank-account-form-input--error' : ''}`}
              disabled={loading}
            />
            {errors.holder_name && <span className="bank-account-form-error">{errors.holder_name}</span>}
          </div>

          <div className="bank-account-form-group">
            <label className="bank-account-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 6H5C3.89543 6 3 6.89543 3 8V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V8C21 6.89543 20.1046 6 19 6H14M10 6V5C10 3.89543 10.8954 3 12 3C13.1046 3 14 3.89543 14 5V6M10 6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              DNI del titular (Opcional)
            </label>
            <input
              type="text"
              name="holder_dni"
              value={formData.holder_dni}
              onChange={(e) => handleNumericChange(e, 8)}
              placeholder="8 dígitos"
              maxLength="8"
              className={`bank-account-form-input ${errors.holder_dni ? 'bank-account-form-input--error' : ''}`}
              disabled={loading}
            />
            <span className="bank-account-form-hint">{formData.holder_dni.length}/8 dígitos</span>
            {errors.holder_dni && <span className="bank-account-form-error">{errors.holder_dni}</span>}
          </div>
        </div>

        <div className="bank-account-form-actions">
          <button type="button" onClick={onCancel} className="bank-account-form-btn bank-account-form-btn--cancel" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="bank-account-form-btn bank-account-form-btn--submit" disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {loading ? 'Guardando...' : (account ? 'Actualizar' : 'Agregar cuenta')}
          </button>
        </div>
      </form>
    </div>
  );
};
