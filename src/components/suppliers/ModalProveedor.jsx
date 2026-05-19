import { FormularioProveedor } from './FormularioProveedor';
import '../../styles/components/catalogs.css';

export const ModalProveedor = ({ isOpen, onClose, supplier, onSubmit }) => {
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
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button className="catalog-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="catalog-modal-body">
          <FormularioProveedor
            initialData={supplier}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
