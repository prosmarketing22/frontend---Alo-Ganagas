export const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Entregas Pendientes',
      value: summary.pending_deliveries || 0,
      icon: '📦',
      color: 'blue'
    },
    {
      title: 'Cobros del Día',
      value: summary.pending_loans || 0,
      icon: '💵',
      color: 'green'
    },
    {
      title: 'Mantenimientos',
      value: summary.scheduled_maintenance || 0,
      icon: '⚙️',
      color: 'orange'
    },
    {
      title: 'Completadas Hoy',
      value: summary.completed_today || 0,
      icon: '✅',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-2 ${getColorClasses(card.color)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-3xl font-bold">{card.value}</span>
          </div>
          <div className="text-sm font-medium">{card.title}</div>
        </div>
      ))}
    </div>
  );
};
