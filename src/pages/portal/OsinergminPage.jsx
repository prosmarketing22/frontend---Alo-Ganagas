import { useState, useEffect } from 'react';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import { portalService } from '../../services/portalService';
import '../../styles/pages/portal/osinergminPage.css';

const InlineDocumentViewer = ({ document }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [contentType, setContentType] = useState(null);

  useEffect(() => {
    let revoke = null;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { blob, contentType: type } = await portalService.getPreviewBlob(document.id);
        const url = URL.createObjectURL(blob);
        revoke = url;
        setBlobUrl(url);
        setContentType(type);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Error al cargar el documento');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [document.id]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await portalService.downloadDocument(document.id);
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  const handleRetry = () => {
    setBlobUrl(null);
    setError(null);
    setLoading(true);
    portalService.getPreviewBlob(document.id)
      .then(({ blob, contentType: type }) => {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setContentType(type);
      })
      .catch(() => setError('Error al cargar el documento'))
      .finally(() => setLoading(false));
  };

  const fileType = contentType || document.fileType || document.file_type || '';
  const isImage = fileType.includes('image');
  const isPdf = fileType.includes('pdf');

  return (
    <div className="osinergmin-doc">
      <div className="osinergmin-doc__header">
        <div className="osinergmin-doc__info">
          <h3 className="osinergmin-doc__title">{document.title}</h3>
          {document.description && (
            <p className="osinergmin-doc__description">{document.description}</p>
          )}
        </div>
        <button
          className="osinergmin-doc__download-btn"
          onClick={handleDownload}
          title="Descargar documento"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Descargar</span>
        </button>
      </div>

      <div className="osinergmin-doc__viewer">
        {loading && (
          <div className="osinergmin-doc__loading">
            <div className="osinergmin-doc__spinner"></div>
            <p>Cargando documento...</p>
          </div>
        )}

        {error && !loading && (
          <div className="osinergmin-doc__error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{error}</p>
            <button className="osinergmin-doc__retry-btn" onClick={handleRetry}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && blobUrl && isPdf && (
          <iframe
            src={blobUrl}
            className="osinergmin-doc__iframe"
            title={document.title}
          />
        )}

        {!loading && !error && blobUrl && isImage && (
          <img
            src={blobUrl}
            alt={document.title}
            className="osinergmin-doc__image"
          />
        )}

        {!loading && !error && blobUrl && !isPdf && !isImage && (
          <div className="osinergmin-doc__fallback">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <p>Este tipo de archivo no se puede previsualizar</p>
            <button className="osinergmin-doc__download-btn" onClick={handleDownload}>
              Descargar archivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const OsinergminPage = () => {
  const { getOsinergminDocuments, loading, error } = usePortalApi();
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, []);

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
            <InlineDocumentViewer key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
};
