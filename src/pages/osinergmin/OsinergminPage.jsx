import { useState, useEffect } from 'react';
import { useOsinergminApi } from '../../hooks/useApi/useOsinergminApi';
import { OsinergminTable } from '../../components/osinergmin/OsinergminTable';
import { OsinergminModal } from '../../components/osinergmin/OsinergminModal';
import '../../styles/pages/osinergminPage.css';

export const OsinergminPage = () => {
  const { documents, loading, error, getAll, create, update, updateFile, remove, togglePublish } = useOsinergminApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    getAll();
  }, [getAll]);

  const handleCreate = () => {
    setSelectedDocument(null);
    setIsModalOpen(true);
  };

  const handleEdit = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData, documentId) => {
    if (documentId) {
      const hasFile = formData.get('file') && formData.get('file').size > 0;
      if (hasFile) {
        await updateFile(documentId, formData);
      } else {
        const updateData = {
          title: formData.get('title'),
          description: formData.get('description'),
          display_order: parseInt(formData.get('display_order') || formData.get('order') || 1)
        };
        await update(documentId, updateData);
      }
    } else {
      await create(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este documento?')) {
      try {
        await remove(id);
      } catch (err) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  const handleTogglePublish = async (id, isPublished) => {
    try {
      await togglePublish(id, isPublished);
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  return (
    <div className="osinergmin-page">
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">OSINERGMIN - Gestión de Documentos</h1>
          <p className="catalog-subtitle">
            Administración de documentos públicos regulatorios
          </p>
        </div>
        <div className="catalog-actions">
          <button className="catalog-btn catalog-btn-primary" onClick={handleCreate}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Subir Documento
          </button>
        </div>
      </div>

      {error && (
        <div className="catalog-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {loading && (
        <div className="catalog-loading">
          <div className="catalog-loading-spinner"></div>
          <p>Cargando documentos...</p>
        </div>
      )}

      {!loading && (
        <OsinergminTable
          documents={documents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
        />
      )}

      <OsinergminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedDocument}
      />
    </div>
  );
};
