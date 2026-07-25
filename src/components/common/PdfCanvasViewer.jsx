import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import '../../styles/components/pdfCanvasViewer.css';

// Worker empaquetado localmente por Vite -> funciona offline dentro del APK (no usa CDN).
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

/**
 * Renderiza un PDF (a partir de un Blob) usando PDF.js sobre <canvas>.
 * Render JS puro: funciona dentro del WebView de Android donde el <iframe>
 * con blob/data PDF queda en blanco por no haber visor PDF nativo.
 */
export const PdfCanvasViewer = ({ blob }) => {
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar el documento desde el blob
  useEffect(() => {
    if (!blob) return;
    let cancelled = false;
    let loadingTask = null;

    const loadDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = new Uint8Array(await blob.arrayBuffer());
        loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        if (cancelled) {
          pdf.destroy();
          return;
        }
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error('Error cargando PDF con PDF.js:', err);
        if (!cancelled) setError('No se pudo procesar el PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDoc();

    return () => {
      cancelled = true;
      if (loadingTask && loadingTask.destroy) {
        try { loadingTask.destroy(); } catch { /* noop */ }
      }
      if (pdfDocRef.current) {
        try { pdfDocRef.current.destroy(); } catch { /* noop */ }
        pdfDocRef.current = null;
      }
    };
  }, [blob]);

  // Renderizar todas las páginas al cambiar documento o escala
  const renderPages = useCallback(async () => {
    const pdf = pdfDocRef.current;
    const container = containerRef.current;
    if (!pdf || !container) return;

    container.innerHTML = '';
    const dpr = window.devicePixelRatio || 1;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      let page;
      try {
        page = await pdf.getPage(pageNum);
      } catch (err) {
        console.error('Error obteniendo página', pageNum, err);
        continue;
      }
      const viewport = page.getViewport({ scale });

      const canvas = window.document.createElement('canvas');
      canvas.className = 'pdf-canvas-page';
      const ctx = canvas.getContext('2d');
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      container.appendChild(canvas);

      try {
        await page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
        }).promise;
      } catch (err) {
        console.error('Error renderizando página', pageNum, err);
      }
    }
  }, [scale]);

  useEffect(() => {
    if (!numPages) return;
    renderPages();
  }, [numPages, renderPages]);

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));

  return (
    <div className="pdf-canvas-viewer">
      {loading && (
        <div className="pdf-canvas-loading">
          <div className="document-preview-spinner" />
          <p>Procesando PDF...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pdf-canvas-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="pdf-canvas-toolbar">
            <button
              type="button"
              className="pdf-canvas-zoom-btn"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              aria-label="Alejar"
            >
              &minus;
            </button>
            <span className="pdf-canvas-zoom-label">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className="pdf-canvas-zoom-btn"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              aria-label="Acercar"
            >
              +
            </button>
          </div>
          <div className="pdf-canvas-pages" ref={containerRef} />
        </>
      )}
    </div>
  );
};

export default PdfCanvasViewer;
