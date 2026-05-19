import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import './ProfilePage.css';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSummary, updateProfile } = usePortalApi();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    reference: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const summary = await getSummary();
      setFormData({
        full_name: summary.full_name || '',
        phone: summary.phone || '',
        email: summary.email || '',
        address: summary.address || '',
        district: summary.district || '',
        reference: summary.reference || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback a datos del user context
      if (user) {
        setFormData(prev => ({
          ...prev,
          full_name: user.full_name || '',
          phone: user.phone || '',
          email: user.email || ''
        }));
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.phone.trim()) {
      alert('El telefono es obligatorio');
      return;
    }

    if (!formData.address.trim()) {
      alert('La direccion es obligatoria');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      alert('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <div className="profile-page__spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Mi Perfil</h1>
        <button
          className="profile-page__back"
          onClick={() => navigate('/portal')}
        >
          Volver
        </button>
      </div>

      <div className="profile-page__content">
        <div className="profile-page__card">
          <div className="profile-page__avatar">
            <div className="profile-page__avatar-icon">
              {formData.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-page__avatar-text">
              <div className="profile-page__avatar-name">{formData.full_name}</div>
              <div className="profile-page__avatar-role">Cliente</div>
            </div>
          </div>

          <form className="profile-page__form" onSubmit={handleSubmit}>
            <div className="profile-page__section">
              <h3 className="profile-page__section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Datos Personales
              </h3>

              <div className="profile-page__field">
                <label className="profile-page__label">
                  Nombre Completo <span className="profile-page__required">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="profile-page__input"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div className="profile-page__row">
                <div className="profile-page__field">
                  <label className="profile-page__label">
                    Telefono <span className="profile-page__required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="profile-page__input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="999 888 777"
                  />
                </div>

                <div className="profile-page__field">
                  <label className="profile-page__label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="profile-page__input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="profile-page__section">
              <h3 className="profile-page__section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Direccion de Entrega
              </h3>

              <div className="profile-page__field">
                <label className="profile-page__label">
                  Direccion <span className="profile-page__required">*</span>
                </label>
                <textarea
                  name="address"
                  className="profile-page__textarea"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Jr. Lima 456, Huamanga"
                  rows="2"
                />
              </div>

              <div className="profile-page__row">
                <div className="profile-page__field">
                  <label className="profile-page__label">Distrito</label>
                  <input
                    type="text"
                    name="district"
                    className="profile-page__input"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Ej: Huamanga"
                  />
                </div>

                <div className="profile-page__field">
                  <label className="profile-page__label">Referencia</label>
                  <input
                    type="text"
                    name="reference"
                    className="profile-page__input"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="Ej: Frente al parque"
                  />
                </div>
              </div>
            </div>

            <div className="profile-page__actions">
              <button
                type="button"
                className="profile-page__cancel"
                onClick={() => navigate('/portal')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="profile-page__submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-page__info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="profile-page__info-text">
            Manten tus datos actualizados para recibir un mejor servicio.
            Tu direccion se usara automaticamente al hacer pedidos.
          </div>
        </div>
      </div>
    </div>
  );
};
