import { useState, useEffect } from 'react';
import { useCustomerApi } from '../../hooks/useApi/useCustomerApi';

export const CustomerForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const { getCustomerList, getByReferralCode } = useCustomerApi();
  const [referrers, setReferrers] = useState([]);
  const [referrerSearch, setReferrerSearch] = useState('');
  const [searchingReferrer, setSearchingReferrer] = useState(false);
  const [referrerFound, setReferrerFound] = useState(null);
  const [referrerError, setReferrerError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    birth_date: '',
    dni: '',
    customer_type: 'PERSONA_NATURAL',
    address: '',
    district: '',
    reference: '',
    latitude: '',
    longitude: '',
    loyalty_level: 'BRONCE',
    credit_limit: 0,
    referrer_id: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadReferrers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        birth_date: initialData.birth_date ? initialData.birth_date.split('T')[0] : '',
        dni: initialData.dni || '',
        customer_type: initialData.customer_type || 'PERSONA_NATURAL',
        address: initialData.address || '',
        district: initialData.district || '',
        reference: initialData.reference || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        loyalty_level: initialData.loyalty_level || 'BRONCE',
        credit_limit: initialData.credit_limit || 0,
        referrer_id: initialData.referrer_id || ''
      });
    }
  }, [initialData]);

  const loadReferrers = async () => {
    try {
      const list = await getCustomerList();
      setReferrers(list.filter(c => !initialData || c.id !== initialData.id));
    } catch (err) {
      console.error('Error al cargar referidores:', err);
    }
  };

  const handleSearchReferrer = async () => {
    if (!referrerSearch.trim()) {
      setReferrerError('Ingrese un codigo de referido');
      return;
    }

    setSearchingReferrer(true);
    setReferrerError('');
    setReferrerFound(null);

    try {
      const customer = await getByReferralCode(referrerSearch.trim());
      if (customer) {
        if (initialData && customer.id === initialData.id) {
          setReferrerError('No puede referirse a si mismo');
        } else {
          setReferrerFound(customer);
          setFormData(prev => ({ ...prev, referrer_id: customer.id }));
        }
      } else {
        setReferrerError('No se encontro cliente con ese codigo');
      }
    } catch (err) {
      setReferrerError('Error al buscar referidor');
    } finally {
      setSearchingReferrer(false);
    }
  };

  const handleClearReferrer = () => {
    setReferrerSearch('');
    setReferrerFound(null);
    setReferrerError('');
    setFormData(prev => ({ ...prev, referrer_id: '' }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es valido';
    }

    if (!initialData && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La direccion es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const dataToSend = { ...formData };

    if (initialData && !dataToSend.password) {
      delete dataToSend.password;
    }

    if (!dataToSend.referrer_id) {
      dataToSend.referrer_id = null;
    }

    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="customers-form">
      <div className="customers-form-section">
        <h3 className="customers-form-section-title">Datos de Usuario</h3>

        <div className="customers-form-row">
          <div className="customers-form-group">
            <label className="customers-form-label">Nombre Completo *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`customers-form-input ${errors.full_name ? 'customers-form-input--error' : ''}`}
              placeholder="Nombre completo del cliente"
            />
            {errors.full_name && <span className="customers-form-error">{errors.full_name}</span>}
          </div>

          <div className="customers-form-group">
            <label className="customers-form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`customers-form-input ${errors.email ? 'customers-form-input--error' : ''}`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <span className="customers-form-error">{errors.email}</span>}
          </div>
        </div>

        <div className="customers-form-row">
          <div className="customers-form-group">
            <label className="customers-form-label">Telefono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="customers-form-input"
              placeholder="999888777"
            />
          </div>

          <div className="customers-form-group">
            <label className="customers-form-label">{initialData ? 'Nueva Contraseña' : 'Contraseña *'}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`customers-form-input ${errors.password ? 'customers-form-input--error' : ''}`}
              placeholder={initialData ? 'Dejar vacio para mantener' : 'Contraseña'}
            />
            {errors.password && <span className="customers-form-error">{errors.password}</span>}
          </div>
        </div>

        <div className="customers-form-row">
          <div className="customers-form-group">
            <label className="customers-form-label">DNI / RUC</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              className="customers-form-input"
              placeholder="12345678"
            />
          </div>

          <div className="customers-form-group">
            <label className="customers-form-label">Fecha de Nacimiento</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="customers-form-input"
            />
          </div>
        </div>
      </div>

      <div className="customers-form-section">
        <h3 className="customers-form-section-title">Datos del Cliente</h3>

        <div className="customers-form-row">
          <div className="customers-form-group">
            <label className="customers-form-label">Tipo de Cliente</label>
            <select
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
              className="customers-form-select"
            >
              <option value="PERSONA_NATURAL">Persona Natural</option>
              <option value="NEGOCIO">Negocio</option>
            </select>
          </div>

          <div className="customers-form-group">
            <label className="customers-form-label">Nivel de Lealtad</label>
            <select
              name="loyalty_level"
              value={formData.loyalty_level}
              onChange={handleChange}
              className="customers-form-select"
              disabled={!initialData}
            >
              <option value="BRONCE">🥉 Bronce</option>
              <option value="PLATA">🥈 Plata</option>
              <option value="ORO">🥇 Oro</option>
            </select>
          </div>
        </div>

        <div className="customers-form-group">
          <label className="customers-form-label">Direccion *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`customers-form-input ${errors.address ? 'customers-form-input--error' : ''}`}
            placeholder="Jr. Lima 456, Huamanga"
          />
          {errors.address && <span className="customers-form-error">{errors.address}</span>}
        </div>

        <div className="customers-form-row">
          <div className="customers-form-group">
            <label className="customers-form-label">Distrito</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="customers-form-input"
              placeholder="Huamanga"
            />
          </div>

          <div className="customers-form-group">
            <label className="customers-form-label">Referencia</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="customers-form-input"
              placeholder="Frente a la plaza"
            />
          </div>
        </div>

        <div className="customers-form-row">
          <div className="customers-form-group">
            <label className="customers-form-label">Limite de Credito (S/)</label>
            <input
              type="number"
              name="credit_limit"
              value={formData.credit_limit}
              onChange={handleChange}
              className="customers-form-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="customers-form-group">
            <label className="customers-form-label">Referidor (buscar por codigo)</label>
            {!initialData ? (
              <>
                <div className="customers-referrer-search">
                  <input
                    type="text"
                    value={referrerSearch}
                    onChange={(e) => setReferrerSearch(e.target.value.toUpperCase())}
                    className="customers-form-input"
                    placeholder="Ej: ALO-0001"
                    disabled={!!referrerFound}
                  />
                  {!referrerFound ? (
                    <button
                      type="button"
                      onClick={handleSearchReferrer}
                      className="customers-btn customers-btn--primary"
                      disabled={searchingReferrer}
                    >
                      {searchingReferrer ? '...' : 'Buscar'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClearReferrer}
                      className="customers-btn customers-btn--secondary"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                {referrerError && (
                  <span className="customers-form-error">{referrerError}</span>
                )}
                {referrerFound && (
                  <div className="customers-referrer-found">
                    <span className="customers-referrer-found-icon">✓</span>
                    <span className="customers-referrer-found-name">{referrerFound.full_name}</span>
                    <span className="customers-referrer-found-code">{referrerFound.referral_code}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="customers-referrer-readonly">
                {initialData.referrer_name ? (
                  <>
                    <span>{initialData.referrer_name}</span>
                    {initialData.referrer_code && (
                      <span className="customers-referral-code">{initialData.referrer_code}</span>
                    )}
                  </>
                ) : (
                  <span className="customers-referrer-none">Sin referidor</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="customers-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="customers-btn customers-btn--secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="customers-btn customers-btn--primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear Cliente')}
        </button>
      </div>
    </form>
  );
};
