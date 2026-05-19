import '../../styles/components/warehouses.css';

export const TablaAlmacenes = ({ data, onEdit, onDelete, onSetAsMain, loading, totalCount = 0 }) => {
  if (loading) {
    return (
      <div className="warehouses-table-container">
        <div className="warehouses-table-loading">
          <div className="warehouses-loading-spinner"></div>
          <span className="warehouses-loading-text">Cargando almacenes...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="warehouses-table-container">
        <div className="warehouses-table-empty">
          <div className="warehouses-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
              <path d="M9 9v.01" />
              <path d="M9 12v.01" />
              <path d="M9 15v.01" />
              <path d="M9 18v.01" />
            </svg>
          </div>
          <p className="warehouses-empty-title">No hay almacenes registrados</p>
          <p className="warehouses-empty-text">Comienza agregando tu primer almacén</p>
        </div>
      </div>
    );
  }

  return (
    <div className="warehouses-table-container">
      <div className="warehouses-table-header">
        <div className="warehouses-table-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          Lista de Almacenes
          <span className="warehouses-table-count">{totalCount}</span>
        </div>
      </div>

      <div className="warehouses-table-wrapper">
        <table className="warehouses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Almacén</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((warehouse) => (
              <tr
                key={warehouse.id}
                className={warehouse.is_main ? 'warehouses-row--main' : ''}
              >
                <td>
                  <span className="warehouses-table-id">#{warehouse.id}</span>
                </td>
                <td>
                  <div className="warehouses-table-name">
                    <span className="warehouses-table-name-text">{warehouse.name}</span>
                    <span className="warehouses-table-address">
                      <svg className="warehouses-table-address-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {warehouse.address || 'Sin dirección'}
                    </span>
                  </div>
                </td>
                <td>
                  {warehouse.is_main ? (
                    <span className="warehouses-badge warehouses-badge--main">
                      <svg className="warehouses-badge--main-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Principal
                    </span>
                  ) : (
                    <span className="warehouses-badge warehouses-badge--secondary">
                      Secundario
                    </span>
                  )}
                </td>
                <td>
                  {warehouse.is_active ? (
                    <span className="warehouses-badge warehouses-badge--active">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Activo
                    </span>
                  ) : (
                    <span className="warehouses-badge warehouses-badge--inactive">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      Inactivo
                    </span>
                  )}
                </td>
                <td>
                  <div className="warehouses-table-actions">
                    {!warehouse.is_main && (
                      <button
                        className="warehouses-action-btn warehouses-action-btn--main"
                        onClick={() => onSetAsMain(warehouse.id)}
                        title="Establecer como principal"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Principal
                      </button>
                    )}
                    <button
                      className="warehouses-action-btn warehouses-action-btn--edit"
                      onClick={() => onEdit(warehouse)}
                      title="Editar almacén"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </button>
                    {!warehouse.is_main && (
                      <button
                        className="warehouses-action-btn warehouses-action-btn--delete"
                        onClick={() => onDelete(warehouse.id)}
                        title="Eliminar almacén"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
