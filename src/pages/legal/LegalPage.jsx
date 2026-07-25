// ============================================================
// LEGAL PAGE - Visor PUBLICO de Politica de Privacidad y Terminos.
// Accesible SIN iniciar sesion. Usada por la web (URL publica para
// Google Play Console) y por el APK (enlaces del login).
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { legalService, LEGAL_TYPES } from '../../services/legalService';
import logo from '../../assets/logo.png';
import './LegalPage.css';

export const LegalPage = () => {
  const { type: rawType } = useParams();
  const navigate = useNavigate();

  // Tipo por defecto: privacy. Solo se aceptan tipos validos.
  const type = LEGAL_TYPES[rawType] ? rawType : 'privacy';

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await legalService.getByType(type);
      setDoc(res?.data || null);
    } catch (err) {
      setError('No se pudo cargar el documento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const formatDate = (value) => {
    if (!value) return null;
    try {
      return new Date(value).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="legal-page">
      <header className="legal-page__topbar">
        <img src={logo} alt="Aló Ganagas" className="legal-page__logo" />
        <button
          type="button"
          className="legal-page__back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </header>

      <div className="legal-page__container">
        {/* Navegacion entre documentos */}
        <nav className="legal-page__tabs">
          <Link
            to="/legal/privacy"
            className={`legal-page__tab${type === 'privacy' ? ' legal-page__tab--active' : ''}`}
          >
            {LEGAL_TYPES.privacy.label}
          </Link>
          <Link
            to="/legal/terms"
            className={`legal-page__tab${type === 'terms' ? ' legal-page__tab--active' : ''}`}
          >
            {LEGAL_TYPES.terms.label}
          </Link>
        </nav>

        {loading && (
          <div className="legal-page__state">Cargando…</div>
        )}

        {!loading && error && (
          <div className="legal-page__state legal-page__state--error">
            {error}
            <button type="button" className="legal-page__retry" onClick={fetchDoc}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && doc && (
          <article className="legal-page__doc">
            <h1 className="legal-page__title">{doc.title}</h1>
            {formatDate(doc.updated_at) && (
              <p className="legal-page__updated">
                Última actualización: {formatDate(doc.updated_at)}
              </p>
            )}
            <div className="legal-page__content">{doc.content}</div>
          </article>
        )}
      </div>

      <footer className="legal-page__footer">
        © {new Date().getFullYear()} Aló Ganagas
      </footer>
    </div>
  );
};

export default LegalPage;
