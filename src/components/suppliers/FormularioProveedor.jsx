import { useState, useEffect } from 'react';
import '../../styles/components/catalogs.css';

export const FormularioProveedor = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    ruc: '',
    business_name: '',
    trade_name: '',
    address: '',
    phone: '',
    email: '',
    contact_person: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ruc: initialData.ruc || '',
        business_name: initialData.business_name || '',
        trade_name: initialData.trade_name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        contact_person: initialData.contact_person || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    }
  }, [initialData]);

  const validateRuc = (ruc) => {
    if (!ruc) return 'El RUC es obligatorio';
    if (!/^\d{11}$/.test(ruc)) return 'El RUC debe tener exactamente 11 digitos numericos';
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de email invalido';
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    const rucError = validateRuc(formData.ruc);
    if (rucError) newErrors.ruc = rucError;

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'La razon social es obligatoria';
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        status: formData.is_active ? 'active' : 'inactive'
      };
      delete dataToSubmit.is_active;
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="catalog-form-group">
        <label htmlFor="ruc" className="catalog-form-label catalog-form-label-required">
          RUC
        </label>
        <input
          type="text"
          id="ruc"
          name="ruc"
          value={formData.ruc}
          onChange={handleChange}
          className={`catalog-form-input ${errors.ruc ? 'error' : ''}`}
          maxLength="11"
          placeholder="12345678901"
        />
        {errors.ruc && <span className="catalog-form-error">{errors.ruc}</span>}
        <span className="catalog-form-hint">Ingrese 11 digitos numericos</span>
      </div>

      <div className="catalog-form-group">
        <label htmlFor="business_name" className="catalog-form-label catalog-form-label-required">
          Razon Social
        </label>
        <input
          type="text"
          id="business_name"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          className={`catalog-form-input ${errors.business_name ? 'error' : ''}`}
          placeholder="Razon social del proveedor"
        />
        {errors.business_name && (
          <span className="catalog-form-error">{errors.business_name}</span>
        )}
      </div>

      <div className="catalog-form-group">
        <label htmlFor="trade_name" className="catalog-form-label">
          Nombre Comercial
        </label>
        <input
          type="text"
          id="trade_name"
          name="trade_name"
          value={formData.trade_name}
          onChange={handleChange}
          className="catalog-form-input"
          placeholder="Nombre comercial (opcional)"
        />
      </div>

      <div className="catalog-form-group">
        <label htmlFor="address" className="catalog-form-label">
          Direccion
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="catalog-form-textarea"
          placeholder="Direccion del proveedor"
          rows="3"
        />
      </div>

      <div className="catalog-form-group">
        <label htmlFor="phone" className="catalog-form-label">
          Telefono
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="catalog-form-input"
          placeholder="999 999 999"
        />
      </div>

      <div className="catalog-form-group">
        <label htmlFor="email" className="catalog-form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`catalog-form-input ${errors.email ? 'error' : ''}`}
          placeholder="email@ejemplo.com"
        />
        {errors.email && <span className="catalog-form-error">{errors.email}</span>}
      </div>

      <div className="catalog-form-group">
        <label htmlFor="contact_person" className="catalog-form-label">
          Persona de Contacto
        </label>
        <input
          type="text"
          id="contact_person"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
          className="catalog-form-input"
          placeholder="Nombre de la persona de contacto"
        />
      </div>

      <div className="catalog-form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <span className="catalog-form-label" style={{ marginBottom: 0 }}>
            Proveedor activo
          </span>
        </label>
      </div>

      <div className="catalog-modal-footer">
        <button type="button" onClick={onCancel} className="catalog-btn catalog-btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="catalog-btn catalog-btn-primary">
          {initialData ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
