import { useState, useEffect } from 'react';
import '../../styles/components/warehouses.css';

export const FormularioAlmacen = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    is_main: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        is_main: initialData.is_main || false
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del almacén es obligatorio';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'La dirección debe tener al menos 5 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="warehouses-form" onSubmit={handleSubmit}>
      <div className="warehouses-form-group">
        <label className="warehouses-form-label" htmlFor="name">
          <svg className="warehouses-form-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
          </svg>
          Nombre del Almacén
          <span className="warehouses-form-required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`warehouses-form-input ${errors.name ? 'warehouses-form-input--error' : ''}`}
          placeholder="Ej: Almacén Central, Bodega Norte..."
          disabled={loading}
          autoComplete="off"
        />
        {errors.name && (
          <span className="warehouses-form-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errors.name}
          </span>
        )}
        <span className="warehouses-form-hint">
          Ingresa un nombre descriptivo para identificar el almacén
        </span>
      </div>

      <div className="warehouses-form-group">
        <label className="warehouses-form-label" htmlFor="address">
          <svg className="warehouses-form-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Dirección
          <span className="warehouses-form-required">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`warehouses-form-textarea ${errors.address ? 'warehouses-form-textarea--error' : ''}`}
          placeholder="Ej: Calle Principal #123, Col. Centro, Ciudad..."
          disabled={loading}
          rows={3}
        />
        {errors.address && (
          <span className="warehouses-form-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errors.address}
          </span>
        )}
        <span className="warehouses-form-hint">
          Incluye calle, número, colonia y ciudad para facilitar la ubicación
        </span>
      </div>

      <div className="warehouses-form-group">
        <div className="warehouses-form-checkbox-group">
          <input
            type="checkbox"
            id="is_main"
            name="is_main"
            checked={formData.is_main}
            onChange={handleChange}
            className="warehouses-form-checkbox"
            disabled={loading}
          />
          <div className="warehouses-form-checkbox-content">
            <label htmlFor="is_main" className="warehouses-form-checkbox-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Marcar como almacén principal
            </label>
            <p className="warehouses-form-checkbox-description">
              El almacén principal será el punto de referencia para operaciones y reportes del sistema.
              Solo puede haber un almacén principal activo.
            </p>
          </div>
        </div>
      </div>

      <div className="warehouses-form-actions">
        <button
          type="button"
          className="warehouses-btn warehouses-btn--secondary"
          onClick={onCancel}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Cancelar
        </button>
        <button
          type="submit"
          className="warehouses-btn warehouses-btn--primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="warehouses-loading-spinner" style={{ width: '16px', height: '16px', animation: 'warehouses-spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {initialData ? 'Actualizar Almacén' : 'Crear Almacén'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
