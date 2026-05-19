import { useState, useEffect } from 'react';

const ROLES = [
  { id: 1, name: 'GERENTE', label: 'Gerente' },
  { id: 2, name: 'BASE', label: 'Base' },
  { id: 3, name: 'REPARTIDOR', label: 'Repartidor' }
];

export const CollaboratorForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
    birth_date: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // Formatear telefono con espacios
  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    return formatted;
  };

  // Formatear fecha ISO a yyyy-MM-dd para input type="date"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Si ya está en formato yyyy-MM-dd, retornar tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // Si es formato ISO completo, extraer solo la parte de fecha
    return dateString.split('T')[0];
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: formatPhone(initialData.phone),
        password: '',
        role_id: initialData.role_id || '',
        birth_date: formatDate(initialData.birth_date),
        status: initialData.status || 'active'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Formatear telefono: solo 9 digitos, debe empezar con 9, espacios cada 3 numeros
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo numeros

    // Limitar a 9 digitos
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    // Si el primer digito no es 9, no permitir
    if (value.length > 0 && value[0] !== '9') {
      return;
    }

    // Formatear con espacios cada 3 digitos (999 999 999)
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }

    setFormData((prev) => ({
      ...prev,
      phone: formatted
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name || formData.full_name.trim() === '') {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es valido';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'El telefono es requerido';
    } else if (phoneDigits.length !== 9) {
      newErrors.phone = 'El telefono debe tener 9 digitos';
    } else if (phoneDigits[0] !== '9') {
      newErrors.phone = 'El telefono debe empezar con 9';
    }

    // Contraseña: requerida en creación, opcional en edición
    if (!initialData && (!formData.password || formData.password.trim() === '')) {
      newErrors.password = 'La contrasena es requerida';
    } else if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
      newErrors.password = 'La contrasena debe tener al menos 6 caracteres';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = { ...formData };
      // Limpiar espacios del telefono antes de enviar
      dataToSubmit.phone = dataToSubmit.phone.replace(/\s/g, '');
      if (initialData && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Nombre Completo <span className="form-required">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className={`form-input ${errors.full_name ? 'form-input--error' : ''}`}
            placeholder="Ingrese nombre completo"
            disabled={loading}
          />
          {errors.full_name && <span className="form-error">{errors.full_name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Email <span className="form-required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            placeholder="correo@ejemplo.com"
            disabled={loading}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Telefono <span className="form-required">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
            placeholder="999 999 999"
            disabled={loading}
            inputMode="numeric"
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Rol <span className="form-required">*</span>
          </label>
          <select
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            className={`form-input ${errors.role_id ? 'form-input--error' : ''}`}
            disabled={loading}
          >
            <option value="">Seleccione un rol</option>
            {ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role_id && <span className="form-error">{errors.role_id}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {initialData ? 'Nueva Contrasena' : 'Contrasena'}{' '}
            {!initialData && <span className="form-required">*</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
            placeholder={initialData ? 'Dejar vacio para mantener actual' : 'Minimo 6 caracteres'}
            disabled={loading}
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="form-btn form-btn--secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="form-btn form-btn--primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
