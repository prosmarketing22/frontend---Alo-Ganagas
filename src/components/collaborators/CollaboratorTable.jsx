const ROLE_BADGES = {
  1: { label: 'Gerente', color: 'purple' },
  2: { label: 'Base', color: 'blue' },
  3: { label: 'Repartidor', color: 'green' },
  4: { label: 'Cliente', color: 'orange' }
};

const STATUS_BADGES = {
  active: { label: 'Activo', color: 'green' },
  inactive: { label: 'Inactivo', color: 'gray' }
};

export const CollaboratorTable = ({ data, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando colaboradores...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>No hay colaboradores registrados</p>
      </div>
    );
  }

  const getRoleBadge = (roleId) => {
    const badge = ROLE_BADGES[roleId] || { label: 'Desconocido', color: 'gray' };
    return (
      <span className={`badge badge--${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badge = STATUS_BADGES[status] || { label: status, color: 'gray' };
    return (
      <span className={`badge badge--${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th className="table-actions-header">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((collaborator) => (
            <tr key={collaborator.id}>
              <td className="table-cell-bold">{collaborator.full_name}</td>
              <td>{collaborator.email}</td>
              <td>{collaborator.phone || '-'}</td>
              <td>{getRoleBadge(collaborator.role_id)}</td>
              <td>{getStatusBadge(collaborator.status)}</td>
              <td className="table-actions">
                <button
                  onClick={() => onEdit(collaborator)}
                  className="table-btn table-btn--edit"
                  title="Editar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(collaborator.id)}
                  className="table-btn table-btn--delete"
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
