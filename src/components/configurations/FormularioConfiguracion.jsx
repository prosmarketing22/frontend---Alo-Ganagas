import { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { getConfigInfo } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const FormularioConfiguracion = ({ configuration, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (configuration) {
      setFormData({
        key: configuration.key || '',
        value: configuration.value || '',
        description: configuration.description || ''
      });
    }
  }, [configuration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.value.trim()) {
      newErrors.value = 'El valor es obligatorio';
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

  const configInfo = getConfigInfo(formData.key);

  const getValueLabel = () => {
    const monetaryKeys = [
      'BONO_PATROCINIO',
      'BONO_DIEZ_REFERIDOS',
      'BONO_CUMPLEANOS',
      'MINIMO_USO_SALDO',
      'BONO_LEALTAD'
    ];
    if (monetaryKeys.includes(formData.key)) {
      return 'Monto (S/)';
    }
    if (formData.key === 'PURCHASES_FOR_MAINTENANCE') {
      return 'Cantidad de compras';
    }
    return 'Valor';
  };

  const getValuePlaceholder = () => {
    const monetaryKeys = [
      'BONO_PATROCINIO',
      'BONO_DIEZ_REFERIDOS',
      'BONO_CUMPLEANOS',
      'MINIMO_USO_SALDO',
      'BONO_LEALTAD'
    ];
    if (monetaryKeys.includes(formData.key)) {
      return 'Ej: 5.00';
    }
    if (formData.key === 'PURCHASES_FOR_MAINTENANCE') {
      return 'Ej: 10';
    }
    return 'Valor de la configuración';
  };

  return (
    <form onSubmit={handleSubmit} className="catalog-form">
      <div className="config-edit-header">
        <span className="config-edit-icon">{configInfo.icon}</span>
        <div className="config-edit-info">
          <h3 className="config-edit-name">{configInfo.name}</h3>
          <p className="config-edit-description">{configInfo.description}</p>
        </div>
      </div>

      <div className="catalog-form-group">
        <label htmlFor="value" className="catalog-label">
          {getValueLabel()} <span className="catalog-required">*</span>
        </label>
        <Input
          type={formData.key === 'PURCHASES_FOR_MAINTENANCE' ? 'number' : 'text'}
          name="value"
          value={formData.value}
          onChange={handleChange}
          placeholder={getValuePlaceholder()}
          error={!!errors.value}
          required
        />
        {errors.value && <span className="catalog-error">{errors.value}</span>}
      </div>

      <div className="catalog-form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
