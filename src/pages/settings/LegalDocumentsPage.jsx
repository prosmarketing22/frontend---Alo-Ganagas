// ============================================================
// LEGAL DOCUMENTS PAGE - Editor GERENTE de Politica de Privacidad
// y Terminos de Uso. El contenido se publica de forma PUBLICA en
// /legal/:type (requisito de Google Play Console).
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import { legalService, LEGAL_TYPES } from '../../services/legalService';
import '../../styles/components/catalogs.css';
import './LegalDocumentsPage.css';

const PUBLIC_WEB_URL = import.meta.env.VITE_PUBLIC_WEB_URL || 'https://aloganagas.com.pe';

export const LegalDocumentsPage = () => {
  const [activeType, setActiveType] = useState('privacy');
  const [docs, setDocs] = useState({ privacy: null, terms: null });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await legalService.getAll();
      const map = {};
      (res?.data || []).forEach((d) => { map[d.doc_type] = d; });
      setDocs(map);
    } catch (err) {
      setError('No se pudieron cargar los documentos: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Poblar el formulario al cargar o al cambiar de pestaña.
  // NOTA: no limpiamos aquí los mensajes de éxito/error; hacerlo borraría
  // el "guardado correctamente" cuando handleSave actualiza docs. La limpieza
  // de mensajes se hace explícitamente al cambiar de pestaña (handleSelectType).
  useEffect(() => {
    const current = docs[activeType];
    if (current) {
      setTitle(current.title || '');
      setContent(current.content || '');
    } else {
      setTitle(LEGAL_TYPES[activeType]?.label || '');
      setContent('');
    }
  }, [activeType, docs]);

  const handleSelectType = (type) => {
    if (type === activeType) return;
    setSuccess(null);
    setError(null);
    setActiveType(type);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('El contenido no puede estar vacío.');
      setSuccess(null);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await legalService.update(activeType, { title: title.trim(), content });
      setDocs((prev) => ({ ...prev, [activeType]: res.data }));
      setSuccess('Documento guardado y publicado correctamente.');
    } catch (err) {
      setError('Error al guardar: ' + (err.message || 'intenta nuevamente'));
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `${PUBLIC_WEB_URL}/legal/${activeType}`;

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Políticas y Términos</h1>
          <p className="catalog-subtitle">
            Edita la Política de Privacidad y los Términos de Uso. El contenido es público
            y se muestra en el inicio de sesión y en la app.
          </p>
        </div>
      </div>

      <div className="config-alert config-alert--info">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <strong>URL pública (para Google Play Console):</strong>{' '}
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="legal-editor__link">
            {publicUrl}
          </a>
        </div>
      </div>

      {/* Selector de documento */}
      <div className="legal-editor__tabs">
        {Object.values(LEGAL_TYPES).map((t) => (
          <button
            key={t.key}
            type="button"
            className={`legal-editor__tab${activeType === t.key ? ' legal-editor__tab--active' : ''}`}
            onClick={() => handleSelectType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="legal-editor__state">Cargando…</div>
      ) : (
        <div className="legal-editor__form">
          <label className="legal-editor__label">
            Título
            <input
              type="text"
              className="legal-editor__input"
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Política de Privacidad"
            />
          </label>

          <label className="legal-editor__label">
            Contenido
            <textarea
              className="legal-editor__textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí el texto completo del documento…"
              rows={22}
            />
          </label>

          {error && <div className="legal-editor__msg legal-editor__msg--error">{error}</div>}
          {success && <div className="legal-editor__msg legal-editor__msg--success">{success}</div>}

          <div className="legal-editor__actions">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="legal-editor__btn legal-editor__btn--ghost"
            >
              Ver versión pública
            </a>
            <button
              type="button"
              className="legal-editor__btn legal-editor__btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando…' : 'Guardar y publicar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalDocumentsPage;
