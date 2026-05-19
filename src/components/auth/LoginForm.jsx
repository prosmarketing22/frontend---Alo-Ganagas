import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import '../../styles/components/login.css';

export const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && (
        <div className="login-form__error">
          {error}
        </div>
      )}

      <div className="login-form__group">
        <label htmlFor="email" className="login-form__label">
          Correo electrónico
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          disabled={loading}
          autoComplete="email"
          required
        />
      </div>

      <div className="login-form__group">
        <label htmlFor="password" className="login-form__label">
          Contraseña
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={loading}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="login-form__actions">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </div>

    </form>
  );
};
