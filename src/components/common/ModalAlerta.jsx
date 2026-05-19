import { useEffect } from 'react';
import '../../styles/components/modalAlerta.css';

export const ModalAlerta = ({
  isOpen,
  onClose,
  title = 'Aviso',
  message,
  type = 'info', // 'info', 'warning', 'error', 'success', 'ganagas'
  buttonText = 'Entendido',
  icon
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'ganagas':
        return (
          <div className="modal-alerta-icon-ganagas">
            <span className="modal-alerta-icon-coin">G</span>
          </div>
        );
      case 'warning':
        return (
          <svg className="modal-alerta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'error':
        return (
          <svg className="modal-alerta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'success':
        return (
          <svg className="modal-alerta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default:
        return (
          <svg className="modal-alerta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div className="modal-alerta-overlay" onClick={handleOverlayClick}>
      <div className={`modal-alerta modal-alerta--${type}`}>
        <button
          className="modal-alerta-close"
          onClick={onClose}
          type="button"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="modal-alerta-header">
          <div className={`modal-alerta-icon modal-alerta-icon--${type}`}>
            {getIcon()}
          </div>
        </div>

        <div className="modal-alerta-body">
          <h3 className="modal-alerta-title">{title}</h3>
          <div className="modal-alerta-message">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        <div className="modal-alerta-footer">
          <button
            className={`modal-alerta-btn modal-alerta-btn--${type}`}
            onClick={onClose}
            type="button"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
