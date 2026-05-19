import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/components/alertToast.css';

export const AlertToast = ({
  errors = [],
  title = 'Corrige los siguientes errores',
  type = 'error', // 'error' | 'warning' | 'success' | 'info'
  duration = 0, // 0 = no auto-close
  onClose,
  isOpen = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para que la animación de entrada funcione
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (duration > 0 && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isOpen]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  if (!isOpen && !isVisible) return null;

  const icons = {
    error: (
      <svg className="alert-toast__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
    ),
    warning: (
      <svg className="alert-toast__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
    success: (
      <svg className="alert-toast__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11.5 14.5 16 9" />
      </svg>
    ),
    info: (
      <svg className="alert-toast__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <circle cx="12" cy="8" r="0.5" fill="currentColor" />
      </svg>
    )
  };

  const toastContent = (
    <div className={`alert-toast-overlay ${isVisible && !isExiting ? 'alert-toast-overlay--visible' : ''}`}>
      <div className={`alert-toast alert-toast--${type} ${isVisible && !isExiting ? 'alert-toast--visible' : ''} ${isExiting ? 'alert-toast--exiting' : ''}`}>
        {/* Barra decorativa superior */}
        <div className="alert-toast__accent-bar" />

        {/* Contenido principal */}
        <div className="alert-toast__content">
          {/* Icono */}
          <div className="alert-toast__icon">
            {icons[type]}
          </div>

          {/* Texto */}
          <div className="alert-toast__body">
            <h4 className="alert-toast__title">{title}</h4>

            {errors.length > 0 && (
              <ul className="alert-toast__list">
                {errors.map((error, index) => (
                  <li key={index} className="alert-toast__list-item">
                    <span className="alert-toast__bullet" />
                    <span className="alert-toast__error-text">{error}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            className="alert-toast__close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Barra de progreso (solo si hay duration) */}
        {duration > 0 && (
          <div className="alert-toast__progress">
            <div
              className="alert-toast__progress-bar"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

// Hook para usar el AlertToast de forma imperativa
export const useAlertToast = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    errors: [],
    title: 'Corrige los siguientes errores',
    type: 'error',
    duration: 0
  });

  const showAlert = useCallback(({ errors, title, type = 'error', duration = 0 }) => {
    setAlertState({
      isOpen: true,
      errors: Array.isArray(errors) ? errors : [errors],
      title: title || (type === 'error' ? 'Corrige los siguientes errores' : 'Atención'),
      type,
      duration
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const AlertComponent = () => (
    <AlertToast
      {...alertState}
      onClose={hideAlert}
    />
  );

  return { showAlert, hideAlert, AlertComponent };
};
