import { FormularioMarca } from './FormularioMarca';
import '../../styles/components/catalogs.css';

export const ModalMarca = ({ isOpen, onClose, initialData, onSubmit, loading }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="catalog-modal-overlay" onClick={handleOverlayClick}>
      <div className="catalog-modal">
        <div className="catalog-modal-header">
          <h2 className="catalog-modal-title">
            {initialData ? 'Editar Marca' : 'Nueva Marca'}
          </h2>
          <button
            className="catalog-modal-close"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            &times;
          </button>
        </div>
        <div className="catalog-modal-body">
          <FormularioMarca
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
