export const MaintenanceCard = ({ schedule, onStart, onComplete }) => {
  const getStatusBadge = (status) => {
    const badges = {
      PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      EN_PROCESO: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
      COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800' },
      CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || badges.PENDIENTE;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      PREVENTIVO: '🔧',
      CORRECTIVO: '⚠️',
      INSPECCION: '🔍'
    };
    return icons[type] || '🔧';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(schedule.type)}</span>
          <div>
            <h3 className="font-semibold text-gray-800">
              {schedule.type === 'PREVENTIVO' && 'Mantenimiento Preventivo'}
              {schedule.type === 'CORRECTIVO' && 'Mantenimiento Correctivo'}
              {schedule.type === 'INSPECCION' && 'Inspección'}
            </h3>
            <p className="text-sm text-gray-600">
              {schedule.customer?.full_name || 'Cliente'}
            </p>
          </div>
        </div>
        {getStatusBadge(schedule.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-500">📍</span>
          <span className="text-gray-700">
            {schedule.customer?.address || 'Sin dirección'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">📞</span>
          <span className="text-gray-700">
            {schedule.customer?.phone || 'Sin teléfono'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">📅</span>
          <span className="text-gray-700">
            {new Date(schedule.scheduled_date).toLocaleDateString('es-PE')}
          </span>
        </div>
      </div>

      {schedule.description && (
        <div className="border-t pt-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Descripción:</p>
          <p className="text-sm text-gray-700">{schedule.description}</p>
        </div>
      )}

      <div className="flex gap-2">
        {schedule.status === 'PENDIENTE' && (
          <button
            onClick={() => onStart(schedule.id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Iniciar Servicio
          </button>
        )}
        {schedule.status === 'EN_PROCESO' && (
          <button
            onClick={() => onComplete(schedule)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Completar Servicio
          </button>
        )}
      </div>
    </div>
  );
};
