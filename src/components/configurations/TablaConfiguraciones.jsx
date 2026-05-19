import { getConfigInfo } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const TablaConfiguraciones = ({ configurations, onEdit }) => {

  const formatValue = (config) => {
    const value = config.value;
    const key = config.key;

    // Formatear valores segun el tipo de configuracion
    if (key === 'PURCHASES_FOR_MAINTENANCE') {
      return `${value} compras`;
    }

    // Valores monetarios (configuraciones en soles)
    const monetaryKeys = [
      'BONO_PATROCINIO',
      'BONO_DIEZ_REFERIDOS',
      'BONO_CUMPLEANOS',
      'MINIMO_USO_SALDO',
      'BONO_LEALTAD'
    ];

    if (monetaryKeys.includes(key)) {
      return `S/ ${parseFloat(value).toFixed(2)}`;
    }

    return value;
  };

  return (
    <div className="catalog-table-container">
      <table className="catalog-table config-table">
        <thead>
          <tr>
            <th>Configuración</th>
            <th>Valor</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {configurations.length === 0 ? (
            <tr>
              <td colSpan="4" className="catalog-table__empty">
                No hay configuraciones disponibles
              </td>
            </tr>
          ) : (
            configurations.map((config) => {
              const info = getConfigInfo(config.key);
              return (
                <tr key={config.id}>
                  <td>
                    <div className="config-name-cell">
                      <span className="config-icon">{info.icon}</span>
                      <div className="config-name-info">
                        <span className="config-name">{info.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="config-value-display">{formatValue(config)}</span>
                  </td>
                  <td className="config-description">
                    {config.description || info.description || '-'}
                  </td>
                  <td>
                    <div className="catalog-actions">
                      <button
                        className="catalog-action-btn catalog-action-btn--edit"
                        onClick={() => onEdit(config)}
                        title="Editar configuración"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
