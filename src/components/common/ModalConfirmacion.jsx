import '../../styles/components/modalConfirmacion.css';

export const ModalConfirmacion = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar accion',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  icon,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'danger':
        return (
          <svg className="modal-confirm-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="modal-confirm-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg className="modal-confirm-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      case 'success':
        return (
          <svg className="modal-confirm-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-confirm-overlay" onClick={handleOverlayClick}>
      <div className={`modal-confirm modal-confirm--${type}`}>
        <div className="modal-confirm-header">
          <div className={`modal-confirm-icon modal-confirm-icon--${type}`}>
            {getIcon()}
          </div>
          <button
            className="modal-confirm-close"
            onClick={onClose}
            type="button"
            disabled={loading}
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-confirm-body">
          <h3 className="modal-confirm-title">{title}</h3>
          <div className="modal-confirm-content">
            {children}
          </div>
        </div>

        <div className="modal-confirm-footer">
          <button
            className="modal-confirm-btn modal-confirm-btn--cancel"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`modal-confirm-btn modal-confirm-btn--confirm modal-confirm-btn--${type}`}
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <span className="modal-confirm-btn-loading">
                <span className="modal-confirm-spinner"></span>
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
