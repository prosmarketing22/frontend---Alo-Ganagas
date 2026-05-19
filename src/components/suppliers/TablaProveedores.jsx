import '../../styles/components/catalogs.css';

export const TablaProveedores = ({ data, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="catalog-loading-spinner"></div>
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="catalog-empty">
        <div className="catalog-empty-icon">📦</div>
        <p className="catalog-empty-text">No hay proveedores registrados</p>
        <p>Comienza agregando un nuevo proveedor</p>
      </div>
    );
  }

  return (
    <div className="catalog-table-container">
      <table className="catalog-table">
        <thead>
          <tr>
            <th>RUC</th>
            <th>Razon Social</th>
            <th>Nombre Comercial</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.ruc}</td>
              <td>{supplier.business_name}</td>
              <td>{supplier.trade_name || '-'}</td>
              <td>{supplier.phone || '-'}</td>
              <td>{supplier.email || '-'}</td>
              <td>
                <span
                  className={`catalog-badge ${
                    supplier.is_active
                      ? 'catalog-badge-active'
                      : 'catalog-badge-inactive'
                  }`}
                >
                  {supplier.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="catalog-table-actions">
                  <button
                    className="catalog-btn-icon"
                    onClick={() => onEdit(supplier)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="catalog-btn-icon"
                    onClick={() => onDelete(supplier.id)}
                    title="Eliminar"
                  >
                    🗑️
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
