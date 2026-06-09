import { useState, useEffect } from 'react';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { portalService } from '../../services/portalService';
import { DocumentPreviewModal } from '../../components/portal/DocumentPreviewModal';
import '../../styles/pages/portal/osinergminPage.css';

/**
 * Tarjeta de documento — botón "Ver" abre el modal de preview inline (web y APK),
 * botón "Descargar" hace la descarga manual.
 */
const DocumentItem = ({ document, onPreview, onError, onSuccess }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await portalService.downloadDocument(document.id, {
        fileNameHint: document.file_name || document.fileName || document.title
      });
      if (onSuccess) onSuccess('Descargado correctamente');
    } catch (err) {
      console.error('Error descargando:', err);
      if (onError) onError(err.message || 'Error al descargar');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="osinergmin-doc">
      <div className="osinergmin-doc__header">
        <div className="osinergmin-doc__info">
          <h3 className="osinergmin-doc__title">{document.title}</h3>
          {document.description && (
            <p className="osinergmin-doc__description">{document.description}</p>
          )}
        </div>
      </div>

      <div className="osinergmin-doc__native-actions">
        <button
          className="osinergmin-doc__action-btn osinergmin-doc__action-btn--primary"
          onClick={() => onPreview(document)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver documento
        </button>
        <button
          className="osinergmin-doc__action-btn osinergmin-doc__action-btn--secondary"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="osinergmin-doc__btn-spinner" />
              Descargando...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const OsinergminPage = () => {
  const { getOsinergminDocuments, loading, error } = usePortalApi();
  const [documents, setDocuments] = useState([]);
  const [toast, setToast] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadDocuments = async () => {
    try {
      const data = await getOsinergminDocuments();
      const mappedData = (data || []).map(doc => ({
        ...doc,
        fileName: doc.file_name,
        fileType: doc.file_type
      }));
      setDocuments(mappedData);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleError = (msg) => setToast({ type: 'error', message: typeof msg === 'string' ? msg : (msg?.message || 'Error') });
  const handleSuccess = (msg) => setToast({ type: 'success', message: msg });

  return (
    <div className="portal-osinergmin-page">
      <div className="portal-osinergmin-header">
        <h1 className="portal-osinergmin-title">OSINERGMIN - Documentos</h1>
        <p className="portal-osinergmin-subtitle">
          Documentos regulatorios y normativos
        </p>
      </div>

      {error && (
        <div className="portal-osinergmin-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {toast && (
        <div className={`portal-osinergmin-toast portal-osinergmin-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {loading && (
        <div className="portal-osinergmin-loading">
          <div className="portal-osinergmin-spinner"></div>
          <p>Cargando documentos...</p>
        </div>
      )}

      {!loading && documents.length === 0 && (
        <div className="portal-osinergmin-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <p>No hay documentos disponibles</p>
        </div>
      )}

      {!loading && documents.length > 0 && (
        <div className="portal-osinergmin-list">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onPreview={setPreviewDoc}
              onError={handleError}
              onSuccess={handleSuccess}
            />
          ))}
        </div>
      )}

      <DocumentPreviewModal
        isOpen={!!previewDoc}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
