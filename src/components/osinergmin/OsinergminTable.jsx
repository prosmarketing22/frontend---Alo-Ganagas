export const OsinergminTable = ({ documents, onEdit, onDelete, onTogglePublish }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return '📄';
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (extension === 'pdf') return '📕';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '🖼️';
    return '📄';
  };

  const truncateFileName = (fileName, maxLength = 30) => {
    if (!fileName || fileName.length <= maxLength) return fileName || '-';
    return fileName.substring(0, maxLength) + '...';
  };

  return (
    <div className="catalog-table-container">
      <table className="catalog-table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Archivo</th>
            <th>Publicado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td colSpan="7" className="catalog-table__empty">
                No hay documentos registrados
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.order}</td>
                <td>
                  <strong>{doc.title}</strong>
                </td>
                <td>{truncateFileName(doc.description, 50)}</td>
                <td>
                  <span title={doc.fileName}>
                    {getFileIcon(doc.fileUrl)} {truncateFileName(doc.fileName, 20)}
                  </span>
                </td>
                <td>
                  <span
                    className={`catalog-badge ${
                      doc.isPublished ? 'catalog-badge-active' : 'catalog-badge-inactive'
                    }`}
                  >
                    {doc.isPublished ? 'Visible' : 'Oculto'}
                  </span>
                </td>
                <td>{formatDate(doc.createdAt)}</td>
                <td>
                  <div className="catalog-table-actions">
                    <button
                      className="catalog-action-btn catalog-action-btn--edit"
                      onClick={() => onEdit(doc)}
                      title="Editar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="catalog-btn-icon"
                      onClick={() => {
                        console.log('=== TOGGLE CLICK ===');
                        console.log('doc:', doc);
                        console.log('doc.isPublished:', doc.isPublished, 'type:', typeof doc.isPublished);
                        console.log('doc.is_published:', doc.is_published, 'type:', typeof doc.is_published);
                        console.log('sending:', doc.id, !doc.isPublished);
                        onTogglePublish(doc.id, !doc.isPublished);
                      }}
                      title={doc.isPublished ? 'Ocultar' : 'Publicar'}
                    >
                      {doc.isPublished ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    <button
                      className="catalog-action-btn catalog-action-btn--delete"
                      onClick={() => onDelete(doc.id)}
                      title="Eliminar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
