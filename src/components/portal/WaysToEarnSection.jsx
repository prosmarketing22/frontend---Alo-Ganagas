import { useState, useEffect } from 'react';
import { usePortalApi } from '../../hooks/useApi/usePortalApi';
import './WaysToEarnSection.css';

const EMOJI_MAP = {
  shopping_cart: '🛒',
  person_add: '👥',
  repeat: '🔁',
  groups: '🏆',
  cake: '🎂',
  build: '🔧'
};

const ICON_MAP = {
  shopping_cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  person_add: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  build: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  repeat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  groups: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  cake: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v3M12 8v3M17 8v3" />
    </svg>
  )
};

const GiftIcon = () => (
  <svg className="ways-to-earn__gift-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);

const ChevronRight = () => (
  <svg className="ways-to-earn__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const WaysToEarnSection = () => {
  const { getWaysToEarn } = usePortalApi();
  const [waysToEarn, setWaysToEarn] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaysToEarn();
  }, []);

  const loadWaysToEarn = async () => {
    try {
      const data = await getWaysToEarn();
      setWaysToEarn(data || []);
    } catch (error) {
      console.error('Error loading ways to earn:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ways-to-earn">
        <h2 className="ways-to-earn__header-text">PROGRAMA DE RECOMPENSAS ALOGANAGAS</h2>
        <div className="ways-to-earn__loading">Cargando...</div>
      </div>
    );
  }

  if (!waysToEarn.length) {
    return null;
  }

  return (
    <div className="ways-to-earn">
      {/* Desktop header */}
      <h2 className="ways-to-earn__header-text">PROGRAMA DE RECOMPENSAS ALOGANAGAS</h2>
      <h3 className="ways-to-earn__title-text">Gana beneficios por comprar y recomendar</h3>
      <p className="ways-to-earn__subtitle-text">
        Acumula recompensas y aplicalas como descuentos en tus proximos pedidos.
      </p>

      {/* Mobile header */}
      <div className="ways-to-earn__header-mobile">
        <GiftIcon />
        <h2 className="ways-to-earn__header-mobile-title">Programa de Recompensas Aloganagas</h2>
      </div>

      {/* Items list */}
      <div className="ways-to-earn__list">
        {waysToEarn.map((way, index) => {
          const IconComponent = ICON_MAP[way.icon];
          return (
            <div key={way.id} className="ways-to-earn__item">
              {/* Mobile: icono SVG */}
              <div className="ways-to-earn__item-icon-mobile">
                {IconComponent ? <IconComponent /> : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                )}
              </div>

              {/* Desktop: numero con emoji */}
              <div className="ways-to-earn__item-number">
                <span className="ways-to-earn__item-emoji">
                  {EMOJI_MAP[way.icon] || '📌'}
                </span>
                {' '}{index + 1}. {way.title}
              </div>

              {/* Desktop: subtitulo y descripcion */}
              {way.subtitle && (
                <p className="ways-to-earn__item-subtitle">{way.subtitle}</p>
              )}
              <p className="ways-to-earn__item-description">{way.description}</p>

              {/* Mobile: titulo inline */}
              <span className="ways-to-earn__item-title-mobile">
                {way.subtitle ? (
                  <><strong>{way.subtitle}</strong> {way.title}</>
                ) : (
                  <strong>{way.title}</strong>
                )}
              </span>

              {/* Mobile: chevron */}
              <ChevronRight />
            </div>
          );
        })}
      </div>

      {/* Desktop footer */}
      <p className="ways-to-earn__footer-text">
        <span className="ways-to-earn__footer-icon">👉</span>
        {' '}"Mientras mas compras y recomiendas, mas beneficios ganas"
      </p>
    </div>
  );
};
