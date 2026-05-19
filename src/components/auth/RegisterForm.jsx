import { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { authService } from '../../services/authService';
import '../../styles/components/login.css';

export const RegisterForm = ({ onSubmit, onSwitchToLogin, loading, error, initialReferrerCode = '' }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birth_date: '',
    dni: '',
    customer_type: 'PERSONA_NATURAL',
    address: '',
    district: '',
    reference: '',
    referrer_code: initialReferrerCode
  });

  const [errors, setErrors] = useState({});
  const [referrerInfo, setReferrerInfo] = useState(null);
  const [validatingCode, setValidatingCode] = useState(false);

  // Auto-validar codigo de referido si viene pre-llenado
  useEffect(() => {
    if (initialReferrerCode && !referrerInfo) {
      validateReferrerCode(initialReferrerCode);
    }
  }, [initialReferrerCode]);

  const validateReferrerCode = async (code) => {
    if (!code.trim()) return;

    setValidatingCode(true);
    setErrors(prev => ({ ...prev, referrer_code: null }));

    const result = await authService.validateReferrerCode(code.trim());

    if (result.success) {
      setReferrerInfo(result.data);
      setFormData(prev => ({ ...prev, referrer_code: code.trim() }));
    } else {
      setErrors(prev => ({ ...prev, referrer_code: 'Código no válido' }));
      setReferrerInfo(null);
    }

    setValidatingCode(false);
  };

  const formatPhoneNumber = (value) => {
    // Eliminar todo excepto números
    const digits = value.replace(/\D/g, '');
    // Limitar a 9 dígitos
    const limited = digits.slice(0, 9);
    // Formatear con espacios cada 3 dígitos: 999 999 999
    const parts = [];
    for (let i = 0; i < limited.length; i += 3) {
      parts.push(limited.slice(i, i + 3));
    }
    return parts.join(' ');
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '');

    // Si hay dígitos y el primero no es 9, no permitir
    if (digits.length > 0 && digits[0] !== '9') {
      setErrors(prev => ({ ...prev, phone: 'El teléfono debe empezar con 9' }));
      return;
    }

    const formatted = formatPhoneNumber(rawValue);
    setFormData(prev => ({ ...prev, phone: formatted }));

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Limpiar info del referidor si cambia el código
    if (name === 'referrer_code') {
      setReferrerInfo(null);
    }
  };

  const handleValidateReferrer = async () => {
    if (!formData.referrer_code.trim()) {
      setErrors(prev => ({ ...prev, referrer_code: 'Ingresa un código' }));
      return;
    }
    await validateReferrerCode(formData.referrer_code);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    // Validar teléfono si se ingresó algo
    if (formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 9) {
        newErrors.phone = 'El teléfono debe tener 9 dígitos';
      } else if (phoneDigits[0] !== '9') {
        newErrors.phone = 'El teléfono debe empezar con 9';
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Preparar datos sin confirmPassword y con teléfono limpio (sin espacios)
    const { confirmPassword, ...dataToSend } = formData;
    dataToSend.phone = dataToSend.phone.replace(/\D/g, '');
    onSubmit(dataToSend);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {error && (
        <div className="login-form__error">
          {error}
        </div>
      )}

      <div className="register-form__section">
        <h3 className="register-form__section-title">Datos personales</h3>

        <div className="register-form__group">
          <label className="login-form__label">Nombre completo *</label>
          <Input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            disabled={loading}
            error={errors.full_name}
          />
          {errors.full_name && <span className="register-form__error">{errors.full_name}</span>}
        </div>

        <div className="register-form__row">
          <div className="register-form__group">
            <label className="login-form__label">Email *</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading}
              error={errors.email}
            />
            {errors.email && <span className="register-form__error">{errors.email}</span>}
          </div>

          <div className="register-form__group">
            <label className="login-form__label">Teléfono</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="999 999 999"
              disabled={loading}
              maxLength={11}
              error={errors.phone}
            />
            {errors.phone && <span className="register-form__error">{errors.phone}</span>}
          </div>
        </div>

        <div className="register-form__row">
          <div className="register-form__group">
            <label className="login-form__label">Contraseña *</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              error={errors.password}
            />
            {errors.password && <span className="register-form__error">{errors.password}</span>}
          </div>

          <div className="register-form__group">
            <label className="login-form__label">Confirmar contraseña *</label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              disabled={loading}
              error={errors.confirmPassword}
            />
            {errors.confirmPassword && <span className="register-form__error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="register-form__row">
          <div className="register-form__group">
            <label className="login-form__label">Fecha de nacimiento</label>
            <Input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="register-form__group">
            <label className="login-form__label">DNI / RUC</label>
            <Input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="12345678"
              disabled={loading}
            />
          </div>
        </div>

        <div className="register-form__group">
          <label className="login-form__label">Tipo</label>
          <select
            name="customer_type"
            value={formData.customer_type}
            onChange={handleChange}
            className="input"
            disabled={loading}
          >
            <option value="PERSONA_NATURAL">Persona Natural</option>
            <option value="NEGOCIO">Negocio</option>
          </select>
        </div>
      </div>

      <div className="register-form__section">
        <h3 className="register-form__section-title">Dirección de entrega</h3>

        <div className="register-form__group">
          <label className="login-form__label">Dirección *</label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Jr. Lima 456, Huamanga"
            disabled={loading}
            error={errors.address}
          />
          {errors.address && <span className="register-form__error">{errors.address}</span>}
        </div>

        <div className="register-form__row">
          <div className="register-form__group">
            <label className="login-form__label">Distrito</label>
            <Input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Huamanga"
              disabled={loading}
            />
          </div>

          <div className="register-form__group">
            <label className="login-form__label">Referencia</label>
            <Input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Frente a la plaza"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="register-form__section">
        <h3 className="register-form__section-title">Código de referido (opcional)</h3>
        <p className="register-form__hint">Si alguien te recomendó, ingresa su código</p>

        <div className="register-form__referrer">
          <Input
            type="text"
            name="referrer_code"
            value={formData.referrer_code}
            onChange={handleChange}
            placeholder="Ej: ALO-0001"
            disabled={loading || !!referrerInfo}
          />
          {!referrerInfo ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleValidateReferrer}
              disabled={loading || validatingCode}
            >
              {validatingCode ? '...' : 'Validar'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setReferrerInfo(null);
                setFormData(prev => ({ ...prev, referrer_code: '' }));
              }}
            >
              Quitar
            </Button>
          )}
        </div>
        {errors.referrer_code && <span className="register-form__error">{errors.referrer_code}</span>}
        {referrerInfo && (
          <div className="register-form__referrer-info">
            <span className="register-form__referrer-check">✓</span>
            <span>Referido por: <strong>{referrerInfo.full_name}</strong></span>
          </div>
        )}
      </div>

      <div className="login-form__actions">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
        </Button>
      </div>

      <div className="register-form__footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            className="register-form__link"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </form>
  );
};
