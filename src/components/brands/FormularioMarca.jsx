import { useState, useEffect } from 'react';
import { PRODUCT_TYPE_OPTIONS } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const FormularioMarca = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    product_type: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        product_type: initialData.product_type || '',
        status: initialData.status || 'active'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'El nombre es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      product_type: formData.product_type || null
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="catalog-form-group">
        <label className="catalog-form-label catalog-form-label-required">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          className={'catalog-form-input' + (errors.name ? ' error' : '')}
          value={formData.name}
          onChange={handleChange}
          placeholder="Ingrese el nombre de la marca"
          disabled={loading}
          required
        />
        {errors.name && (
          <span className="catalog-form-error">{errors.name}</span>
        )}
      </div>

      <div className="catalog-form-group">
        <label className="catalog-form-label">
          Descripción
        </label>
        <textarea
          className="catalog-form-textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ingrese una descripción (opcional)"
          disabled={loading}
          rows="3"
        />
      </div>

      <div className="catalog-form-group">
        <label className="catalog-form-label">
          Tipo de Producto
        </label>
        <select
          className="catalog-form-select"
          name="product_type"
          value={formData.product_type}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="">Seleccione un tipo</option>
          {PRODUCT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="catalog-form-group">
        <label className="catalog-form-label">
          Estado
        </label>
        <select
          className="catalog-form-select"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div className="catalog-modal-footer">
        <button
          type="button"
          className="catalog-btn catalog-btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="catalog-btn catalog-btn-primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
