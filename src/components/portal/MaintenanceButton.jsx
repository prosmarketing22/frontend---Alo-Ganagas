import { useState } from 'react';
import './MaintenanceButton.css';

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const MaintenanceButton = ({
  onRequest,
  canRequest = false,
  currentOrders = 0,
  requiredOrders = 10,
  lastMaintenanceDate = null,
  renderTrigger
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const ordersRemaining = Math.max(0, requiredOrders - currentOrders);
  const progress = Math.min(100, (currentOrders / requiredOrders) * 100);

  const handleButtonClick = () => {
    if (canRequest) {
      setShowModal(true);
    } else {
      setShowInfoModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Por favor describe el problema');
      return;
    }

    setLoading(true);
    try {
      await onRequest({ description });
      setDescription('');
      setShowModal(false);
      alert('Solicitud de mantenimiento enviada correctamente');
    } catch (error) {
      alert('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ onClick: handleButtonClick, canRequest, ordersRemaining })
      ) : (
        <button
          className={`maintenance-button ${!canRequest ? 'maintenance-button--disabled' : ''}`}
          onClick={handleButtonClick}
        >
          <span className="maintenance-button__icon">
            <WrenchIcon />
          </span>
          Solicitar Mantenimiento
          {!canRequest && (
            <span className="maintenance-button__badge">{ordersRemaining}</span>
          )}
        </button>
      )}

      {showInfoModal && (
        <div className="maintenance-modal">
          <div className="maintenance-modal__overlay" onClick={() => setShowInfoModal(false)} />
          <div className="maintenance-modal__content maintenance-modal__content--info">
            <div className="maintenance-modal__header maintenance-modal__header--info">
              <div className="maintenance-modal__header-icon">
                <InfoIcon />
              </div>
              <h3 className="maintenance-modal__title">Mantenimiento no disponible</h3>
              <button
                className="maintenance-modal__close"
                onClick={() => setShowInfoModal(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="maintenance-modal__body">
              <div className="maintenance-info">
                <div className="maintenance-info__alert">
                  <div className="maintenance-info__alert-icon">
                    <ShoppingBagIcon />
                  </div>
                  <div className="maintenance-info__alert-content">
                    <h4 className="maintenance-info__alert-title">
                      Necesitas realizar mas pedidos
                    </h4>
                    <p className="maintenance-info__alert-text">
                      Al completar <strong>{requiredOrders} pedidos</strong>, desbloqueas el servicio de
                      mantenimiento gratuito <strong>de por vida</strong>.
                    </p>
                  </div>
                </div>

                <div className="maintenance-info__progress-section">
                  <div className="maintenance-info__progress-header">
                    <span className="maintenance-info__progress-label">Tu progreso</span>
                    <span className="maintenance-info__progress-value">
                      {currentOrders} de {requiredOrders} pedidos
                    </span>
                  </div>
                  <div className="maintenance-info__progress-bar">
                    <div
                      className="maintenance-info__progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="maintenance-info__progress-remaining">
                    Te faltan <strong>{ordersRemaining} pedidos</strong> para desbloquear este beneficio permanente
                  </p>
                </div>

                {lastMaintenanceDate && (
                  <div className="maintenance-info__last-service">
                    <CheckCircleIcon />
                    <span>Ultimo mantenimiento: {formatDate(lastMaintenanceDate)}</span>
                  </div>
                )}

                <div className="maintenance-info__benefits">
                  <h5 className="maintenance-info__benefits-title">
                    Beneficios del mantenimiento gratuito:
                  </h5>
                  <ul className="maintenance-info__benefits-list">
                    <li>Revision completa de tu equipo de gas</li>
                    <li>Verificacion de fugas y conexiones</li>
                    <li>Limpieza de valvulas y reguladores</li>
                    <li>Certificado de seguridad OSINERGMIN</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="maintenance-modal__footer maintenance-modal__footer--info">
              <button
                className="maintenance-modal__btn-primary"
                onClick={() => setShowInfoModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="maintenance-modal">
          <div className="maintenance-modal__overlay" onClick={() => setShowModal(false)} />
          <div className="maintenance-modal__content">
            <div className="maintenance-modal__header">
              <h3 className="maintenance-modal__title">Solicitar Mantenimiento</h3>
              <button
                className="maintenance-modal__close"
                onClick={() => setShowModal(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="maintenance-modal__body">
              <div className="maintenance-modal__success-badge">
                <CheckCircleIcon />
                <span>Tienes acceso permanente a mantenimiento gratuito</span>
              </div>

              <label className="maintenance-modal__label">
                Describe el problema o motivo de la solicitud:
              </label>
              <textarea
                className="maintenance-modal__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Mi equipo de gas tiene fuga, necesito revision de valvulas..."
                rows="5"
              />
            </div>

            <div className="maintenance-modal__footer">
              <button
                className="maintenance-modal__cancel"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="maintenance-modal__submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
