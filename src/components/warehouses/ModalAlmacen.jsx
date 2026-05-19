import { FormularioAlmacen } from './FormularioAlmacen';
import '../../styles/components/warehouses.css';

export const ModalAlmacen = ({ isOpen, onClose, initialData, onSubmit, loading }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="warehouses-modal-overlay" onClick={handleOverlayClick}>
      <div className="warehouses-modal">
        <div className="warehouses-modal-header">
          <h2 className="warehouses-modal-title">
            <span className="warehouses-modal-title-icon">
              {initialData ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9v.01" />
                  <path d="M9 12v.01" />
                  <path d="M9 15v.01" />
                  <path d="M9 18v.01" />
                </svg>
              )}
            </span>
            {initialData ? 'Editar Almacén' : 'Nuevo Almacén'}
          </h2>
          <button
            className="warehouses-modal-close"
            onClick={onClose}
            type="button"
            title="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="warehouses-modal-body">
          <FormularioAlmacen
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};
