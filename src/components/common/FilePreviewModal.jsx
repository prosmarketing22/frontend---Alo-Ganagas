import { useState, useEffect, lazy, Suspense } from 'react';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { openBlobInNativeApp, downloadBlobWeb, isNativePlatform } from '../../utils/nativeFile';
import '../../styles/components/documentPreviewModal.css';

// pdf.js es pesado: se carga solo al abrir un PDF en APK (lazy chunk).
const PdfCanvasViewer = lazy(() => import('./PdfCanvasViewer'));

const guessMimeFromName = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return map[ext] || '';
};

const base64ToBlob = (base64, contentType) => {
  const cleaned = (base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!cleaned) return new Blob([], { type: contentType });
  const byteChars = atob(cleaned);
  const byteArrays = [];
  const sliceSize = 1024;
  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
};

const normalizeHeaders = (headers) => {
  const out = {};
  if (!headers) return out;
  for (const k of Object.keys(headers)) out[k.toLowerCase()] = headers[k];
  return out;
};

const statusToMessage = (status) => {
  if (status === 404) return 'Archivo no encontrado';
  if (status === 401 || status === 403) return 'No tienes permiso para ver este archivo';
  if (status >= 500) return 'Error del servidor al obtener el archivo';
  return `No se pudo cargar el archivo (HTTP ${status})`;
};

const fetchBlob = async (url) => {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.request({
      url,
      method: 'GET',
      responseType: 'blob'
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(statusToMessage(res.status));
    }
    const headers = normalizeHeaders(res.headers);
    const type = headers['content-type'] || 'application/octet-stream';
    return { blob: base64ToBlob(res.data, type), contentType: type };
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(statusToMessage(response.status));
  const blob = await response.blob();
  return { blob, contentType: response.headers.get('Content-Type') || blob.type };
};

export const FilePreviewModal = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  title = 'Vista previa',
  description,
  contentType: hintedType
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [contentType, setContentType] = useState(hintedType || guessMimeFromName(fileName || fileUrl));
  const [blob, setBlob] = useState(null);
  const native = isNativePlatform();

  useEffect(() => {
    if (!isOpen || !fileUrl) return;

    let revoke = null;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBlob(fileUrl);
        if (cancelled) return;

        const url = URL.createObjectURL(result.blob);
        revoke = url;
        setBlobUrl(url);
        setBlob(result.blob);
        setContentType(result.contentType || hintedType || guessMimeFromName(fileName || fileUrl));
      } catch (err) {
        console.error('Error cargando archivo:', err);
        if (!cancelled) setError(err.message || 'No se pudo cargar el archivo');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [isOpen, fileUrl]);

  const handleClose = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setBlob(null);
    setError(null);
    onClose();
  };

  const handleDownload = async () => {
    if (!blob) return;
    const finalName = fileName || (fileUrl ? fileUrl.split('/').pop() : 'documento');
    try {
      if (native) {
        await openBlobInNativeApp({ blob, fileName: finalName, contentType });
      } else {
        downloadBlobWeb({ blob, fileName: finalName });
      }
    } catch (err) {
      console.error('Error descargando:', err);
      setError('No se pudo descargar el archivo');
    }
  };

  if (!isOpen) return null;

  const type = contentType || '';
  const isImage = type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(fileName || fileUrl || '');
  const isPdf = type.includes('pdf') || /\.pdf$/i.test(fileName || fileUrl || '');

  return (
    <div className="document-preview-overlay" onClick={handleClose}>
      <div
        className="document-preview-modal document-preview-modal--fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="document-preview-header">
          <div className="document-preview-title-container">
            <h2 className="document-preview-title">{title}</h2>
            {description && <p className="document-preview-description">{description}</p>}
          </div>
          <div className="document-preview-actions">
            <button
              className="document-preview-btn document-preview-btn-download"
              onClick={handleDownload}
              disabled={!blob || loading}
              title="Descargar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar
            </button>
            <button className="document-preview-close" onClick={handleClose} title="Cerrar">
              &times;
            </button>
          </div>
        </div>

        <div className="document-preview-body">
          {loading && (
            <div className="document-preview-loading">
              <div className="document-preview-spinner" />
              <p>Cargando archivo...</p>
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
            </div>
          )}

          {!loading && !error && blobUrl && isImage && (
            <img src={blobUrl} alt={title} className="document-preview-image" />
          )}

          {!loading && !error && isPdf && (
            native ? (
              <Suspense fallback={(
                <div className="document-preview-loading">
                  <div className="document-preview-spinner" />
                  <p>Cargando visor...</p>
                </div>
              )}>
                <PdfCanvasViewer blob={blob} />
              </Suspense>
            ) : (
              <iframe src={blobUrl} className="document-preview-iframe" title={title} />
            )
          )}

          {!loading && !error && blobUrl && !isImage && !isPdf && (
            <div className="document-preview-fallback">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <p>Este tipo de archivo no se puede previsualizar</p>
              <button
                className="document-preview-btn document-preview-btn-primary"
                onClick={handleDownload}
              >
                Descargar para abrir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
