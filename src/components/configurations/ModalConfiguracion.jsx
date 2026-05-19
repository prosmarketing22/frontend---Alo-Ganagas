import { FormularioConfiguracion } from './FormularioConfiguracion';
import { getConfigLabel } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const ModalConfiguracion = ({ isOpen, configuration, onClose, onSubmit }) => {
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
            Editar: {configuration ? getConfigLabel(configuration.key) : 'Configuración'}
          </h2>
          <button className="catalog-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="catalog-modal-body">
          <FormularioConfiguracion
            configuration={configuration}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
