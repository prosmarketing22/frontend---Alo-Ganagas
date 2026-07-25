import { useState, useEffect, lazy, Suspense } from 'react';
import { portalService } from '../../services/portalService';
import { openBlobInNativeApp, downloadBlobWeb, isNativePlatform } from '../../utils/nativeFile';
import '../../styles/components/documentPreviewModal.css';

// pdf.js es pesado: se carga solo al abrir un PDF en APK (lazy chunk).
const PdfCanvasViewer = lazy(() => import('../common/PdfCanvasViewer'));

export const DocumentPreviewModal = ({ isOpen, onClose, document: doc }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [blob, setBlob] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const native = isNativePlatform();

  useEffect(() => {
    if (!isOpen || !doc?.id) return;

    let revoke = null;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { blob: b, contentType: type } = await portalService.getPreviewBlob(doc.id);
        if (cancelled) return;
        const url = URL.createObjectURL(b);
        revoke = url;
        setBlobUrl(url);
        setBlob(b);
        setContentType(type);
      } catch (err) {
        console.error('Error loading document:', err);
        if (!cancelled) setError(err.message || 'Error al cargar el documento');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [isOpen, doc?.id, reloadKey]);

  const handleClose = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setBlob(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !doc) return null;

  const fileType = contentType || doc.fileType || doc.file_type || '';
  const isImage = fileType.includes('image');
  const isPdf = fileType.includes('pdf');
  const fileName = doc.file_name || doc.fileName || doc.title || 'documento';

  const handleDownload = async () => {
    if (!blob) {
      try {
        await portalService.downloadDocument(doc.id, { fileNameHint: fileName });
      } catch (err) {
        console.error('Error descargando documento:', err);
        setError('Error al descargar el documento');
      }
      return;
    }

    try {
      if (native) {
        await openBlobInNativeApp({ blob, fileName, contentType: fileType });
      } else {
        downloadBlobWeb({ blob, fileName });
      }
    } catch (err) {
      console.error('Error descargando documento:', err);
      setError('Error al descargar el documento');
    }
  };

  const retry = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlob(null);
    setBlobUrl(null);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="document-preview-overlay" onClick={handleClose}>
      <div
        className="document-preview-modal document-preview-modal--fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="document-preview-header">
          <div className="document-preview-title-container">
            <h2 className="document-preview-title">{doc.title}</h2>
            {doc.description && (
              <p className="document-preview-description">{doc.description}</p>
            )}
          </div>
          <div className="document-preview-actions">
            <button
              className="document-preview-btn document-preview-btn-download"
              onClick={handleDownload}
              disabled={loading}
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
                onClick={retry}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && isPdf && (
            native ? (
              <Suspense fallback={(
                <div className="document-preview-loading">
                  <div className="document-preview-spinner"></div>
                  <p>Cargando visor...</p>
                </div>
              )}>
                <PdfCanvasViewer blob={blob} />
              </Suspense>
            ) : (
              <iframe
                src={blobUrl}
                className="document-preview-iframe"
                title={doc.title}
              />
            )
          )}

          {!loading && !error && blobUrl && isImage && (
            <img
              src={blobUrl}
              alt={doc.title}
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
