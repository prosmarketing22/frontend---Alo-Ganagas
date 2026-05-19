import './OrderTimeline.css';

const timelineStates = [
  { key: 'PENDIENTE', label: 'Pendiente', icon: '⏳' },
  { key: 'CONFIRMADO', label: 'Confirmado', icon: '✓' },
  { key: 'ASIGNADO', label: 'Asignado', icon: '👤' },
  { key: 'EN_CAMINO', label: 'En Camino', icon: '🚚' },
  { key: 'ENTREGADO', label: 'Entregado', icon: '✓' }
];

export const OrderTimeline = ({ currentStatus }) => {
  const currentIndex = timelineStates.findIndex(state => state.key === currentStatus);

  return (
    <div className="order-timeline">
      {timelineStates.map((state, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={state.key} className="order-timeline__item">
            <div
              className={
                'order-timeline__step' +
                (isCompleted ? ' order-timeline__step--completed' : '') +
                (isCurrent ? ' order-timeline__step--current' : '')
              }
            >
              <div className="order-timeline__icon">{state.icon}</div>
            </div>
            <div className="order-timeline__label">{state.label}</div>
            {index < timelineStates.length - 1 && (
              <div
                className={
                  'order-timeline__line' +
                  (isCompleted ? ' order-timeline__line--completed' : '')
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
