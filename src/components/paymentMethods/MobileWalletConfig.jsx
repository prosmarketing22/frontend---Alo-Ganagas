import { useState, useEffect } from 'react';
import { QrUploader } from './QrUploader';
import { BASE_URL } from '../../config/api.config';

export const MobileWalletConfig = ({ method, onUpdate, onUploadQr, loading }) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    holder_name: ''
  });

  useEffect(() => {
    if (method?.wallet_config) {
      setFormData({
        phone_number: method.wallet_config.phone_number || '',
        holder_name: method.wallet_config.holder_name || ''
      });
    }
  }, [method]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Solo permitir números en el campo de teléfono
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo dígitos
    if (value.length <= 9) {
      setFormData(prev => ({ ...prev, phone_number: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone_number || !formData.holder_name) {
      alert('Por favor completa todos los campos');
      return;
    }
    if (formData.phone_number.length !== 9) {
      alert('El número de teléfono debe tener 9 dígitos');
      return;
    }
    if (onUpdate) {
      await onUpdate(formData);
    }
  };

  const handleUpload = async (file) => {
    if (onUploadQr) {
      await onUploadQr(file);
    }
  };

  const getQrImageUrl = () => {
    if (!method?.wallet_config?.qr_image_path) return null;
    return `${BASE_URL}${method.wallet_config.qr_image_path}`;
  };

  return (
    <div className="mobile-wallet-config">
      <form onSubmit={handleSubmit} className="mobile-wallet-form">
        <div className="mobile-wallet-form-row">
          <div className="mobile-wallet-form-group">
            <label className="mobile-wallet-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Número de teléfono
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handlePhoneChange}
              placeholder="999999999"
              maxLength="9"
              className="mobile-wallet-form-input"
              disabled={loading}
            />
            <span className="mobile-wallet-form-hint">{formData.phone_number.length}/9 dígitos</span>
          </div>

          <div className="mobile-wallet-form-group">
            <label className="mobile-wallet-form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Nombre del titular
            </label>
            <input
              type="text"
              name="holder_name"
              value={formData.holder_name}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="mobile-wallet-form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mobile-wallet-qr-section">
          <label className="mobile-wallet-form-label">Código QR</label>
          <QrUploader
            currentQr={getQrImageUrl()}
            onUpload={handleUpload}
            loading={loading}
          />
        </div>

        <button type="submit" className="mobile-wallet-submit-btn" disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {loading ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>
    </div>
  );
};
