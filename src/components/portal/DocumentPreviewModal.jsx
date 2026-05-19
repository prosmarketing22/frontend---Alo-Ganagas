import { useState, useEffect } from 'react';
import { portalService } from '../../services/portalService';
import '../../styles/components/documentPreviewModal.css';

export const DocumentPreviewModal = ({ isOpen, onClose, document }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [contentType, setContentType] = useState(null);

  useEffect(() => {
    if (isOpen && document?.id) {
      loadDocument();
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, document?.id]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }

    try {
      const { blob, contentType: type } = await portalService.getPreviewBlob(document.id);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setContentType(type);
    } catch (err) {
      console.error('Error loading document:', err);
      setError(err.message || 'Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setError(null);
    onClose();
  };

  if (!isOpen || !document) return null;

  const fileType = contentType || document.fileType || document.file_type || '';
  const isImage = fileType.includes('image');
  const isPdf = fileType.includes('pdf');

  const handleDownload = async () => {
    try {
      await portalService.downloadDocument(document.id);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Error al descargar el documento');
    }
  };

  return (
    <div className="document-preview-overlay" onClick={handleClose}>
      <div className="document-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="document-preview-header">
          <div className="document-preview-title-container">
            <h2 className="document-preview-title">{document.title}</h2>
            {document.description && (
              <p className="document-preview-description">{document.description}</p>
            )}
          </div>
          <div className="document-preview-actions">
            <button
              className="document-preview-btn document-preview-btn-download"
              onClick={handleDownload}
              title="Descargar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar
            </button>
            <button
              className="document-preview-close"
              onClick={handleClose}
              title="Cerrar"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="document-preview-body">
          {loading && (
            <div className="document-preview-loading">
              <div className="document-preview-spinner"></div>
              <p>Cargando documento...</p>
            </div>
          )}

          {error && !loading && (
            <div className="document-preview-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
              <button
                className="document-preview-btn document-preview-btn-primary"
                onClick={loadDocument}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && blobUrl && isPdf && (
            <iframe
              src={blobUrl}
              className="document-preview-iframe"
              title={document.title}
            />
          )}

          {!loading && !error && blobUrl && isImage && (
            <img
              src={blobUrl}
              alt={document.title}
              className="document-preview-image"
            />
          )}

          {!loading && !error && blobUrl && !isPdf && !isImage && (
            <div className="document-preview-fallback">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <p>No se puede previsualizar este tipo de archivo</p>
              <button
                className="document-preview-btn document-preview-btn-primary"
                onClick={handleDownload}
              >
                Descargar archivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
