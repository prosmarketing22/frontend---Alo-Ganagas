export const KPICard = ({ titulo, valor, subtitulo, icono, color, tendencia }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <div className={`kpi-card__icon kpi-card__icon--${color || 'azul'}`}>
          {icono}
        </div>
        {tendencia && (
          <span className={`kpi-card__tendencia kpi-card__tendencia--${tendencia.tipo}`}>
            {tendencia.valor}
          </span>
        )}
      </div>

      <h3 className="kpi-card__titulo">{titulo}</h3>
      <p className="kpi-card__valor">{valor}</p>
      {subtitulo && (
        <p className="kpi-card__subtitulo">{subtitulo}</p>
      )}
    </div>
  );
};
