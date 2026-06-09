import { useState } from 'react';
import './ReferralShareCard.css';

// URL pública canónica del frontend para compartir links.
// En el APK (Capacitor) window.location.origin es "https://localhost", por eso
// se prioriza VITE_PUBLIC_WEB_URL inyectada en build-time. Fallback al dominio
// de producción para que un link compartido siempre sea válido aunque la
// variable no se haya definido en el entorno de build.
const PUBLIC_WEB_URL =
  (import.meta.env && import.meta.env.VITE_PUBLIC_WEB_URL) ||
  'https://aloganagas.com.pe';

export const ReferralShareCard = ({ code }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generar link de registro con codigo de referido
  const referralLink = `${PUBLIC_WEB_URL}/login?ref=${code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `¡Hola! Registrate en Aló Ganagas con mi link de referido y ambos ganamos beneficios:\n\n${referralLink}\n\nO usa mi código: ${code}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="referral-share-card">
      <div className="referral-share-card__header">
        <div className="referral-share-card__icon">🎁</div>
        <h3 className="referral-share-card__title">Comparte y Gana</h3>
      </div>

      <p className="referral-share-card__description">
        Invita a tus amigos y gana GANAGAS cuando realicen su primera compra
      </p>

      <div className="referral-share-card__section">
        <span className="referral-share-card__label">Tu código</span>
        <div className="referral-share-card__code-container">
          <div className="referral-share-card__code">{code}</div>
          <button
            className="referral-share-card__copy-button"
            onClick={handleCopyCode}
            title="Copiar código"
          >
            {copiedCode ? '✓' : '📋'}
          </button>
        </div>
        {copiedCode && (
          <div className="referral-share-card__copied-message">
            Código copiado
          </div>
        )}
      </div>

      <div className="referral-share-card__section">
        <span className="referral-share-card__label">Tu link de referido</span>
        <div className="referral-share-card__link-container">
          <div className="referral-share-card__link">{referralLink}</div>
          <button
            className="referral-share-card__copy-button"
            onClick={handleCopyLink}
            title="Copiar link"
          >
            {copiedLink ? '✓' : '🔗'}
          </button>
        </div>
        {copiedLink && (
          <div className="referral-share-card__copied-message">
            Link copiado
          </div>
        )}
      </div>

      <button
        className="referral-share-card__whatsapp-button"
        onClick={handleWhatsApp}
      >
        <span className="referral-share-card__whatsapp-icon">📱</span>
        Compartir por WhatsApp
      </button>
    </div>
  );
};
