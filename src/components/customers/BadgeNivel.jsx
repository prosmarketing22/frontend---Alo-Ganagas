const NIVELES_CONFIG = {
  BRONCE: {
    color: 'badge-nivel--bronce',
    icon: '🥉',
    label: 'Bronce'
  },
  PLATA: {
    color: 'badge-nivel--plata',
    icon: '🥈',
    label: 'Plata'
  },
  ORO: {
    color: 'badge-nivel--oro',
    icon: '🥇',
    label: 'Oro'
  }
};

export const BadgeNivel = ({ nivel }) => {
  const config = NIVELES_CONFIG[nivel] || NIVELES_CONFIG.BRONCE;

  return (
    <span className={`badge-nivel ${config.color}`}>
      <span className="badge-nivel-icon">{config.icon}</span>
      {config.label}
    </span>
  );
};
