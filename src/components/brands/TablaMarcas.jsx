import { PRODUCT_TYPE_LABELS, ENTITY_STATUS, getEntityStatusConfig } from '../../utils/constants';
import '../../styles/components/catalogs.css';

export const TablaMarcas = ({ data, onEdit, onDelete, onToggleStatus, loading }) => {
  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="catalog-loading-spinner"></div>
        <p>Cargando marcas...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="catalog-empty">
        <div className="catalog-empty-icon">📦</div>
        <p className="catalog-empty-text">No se encontraron marcas</p>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    const config = getEntityStatusConfig(status);
    return (
      <span
        className="catalog-badge"
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          border: '1px solid ' + config.color
        }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="catalog-table-container">
      <table className="catalog-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripcion</th>
            <th>Tipo de Producto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((brand) => (
            <tr key={brand.id} className={brand.status === ENTITY_STATUS.INACTIVE ? 'row-inactive' : ''}>
              <td>{brand.id}</td>
              <td>{brand.name}</td>
              <td>{brand.description || 'Sin descripcion'}</td>
              <td>{brand.product_type ? PRODUCT_TYPE_LABELS[brand.product_type] : 'No especificado'}</td>
              <td>{renderStatusBadge(brand.status)}</td>
              <td>
                <div className="catalog-table-actions">
                  <button
                    className="catalog-btn catalog-btn-secondary"
                    onClick={() => onEdit(brand)}
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    className={
                      brand.status === ENTITY_STATUS.ACTIVE
                        ? 'catalog-btn catalog-btn-warning'
                        : 'catalog-btn catalog-btn-success'
                    }
                    onClick={() => onToggleStatus(brand.id, brand.status)}
                    title={brand.status === ENTITY_STATUS.ACTIVE ? 'Desactivar' : 'Activar'}
                  >
                    {brand.status === ENTITY_STATUS.ACTIVE ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className="catalog-btn catalog-btn-danger"
                    onClick={() => onDelete(brand.id)}
                    title="Eliminar"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
