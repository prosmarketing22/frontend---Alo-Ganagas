import { useState } from 'react';

export const ServiceRegistrationModal = ({ isOpen, onClose, schedule, onSubmit }) => {
  const [formData, setFormData] = useState({
    observations: '',
    technicalReport: '',
    replacedParts: '',
    nextMaintenanceDate: ''
  });

  if (!isOpen || !schedule) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      scheduleId: schedule.id,
      ...formData
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      observations: '',
      technicalReport: '',
      replacedParts: '',
      nextMaintenanceDate: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Completar Servicio</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-gray-800">
                {schedule.customer?.full_name}
              </p>
              <p className="text-sm text-gray-600">{schedule.customer?.phone}</p>
              <p className="text-sm text-gray-600">{schedule.customer?.address}</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Tipo de servicio:</p>
                <p className="text-sm font-medium text-gray-700">
                  {schedule.type === 'PREVENTIVO' && 'Mantenimiento Preventivo'}
                  {schedule.type === 'CORRECTIVO' && 'Mantenimiento Correctivo'}
                  {schedule.type === 'INSPECCION' && 'Inspección'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              placeholder="Describe el trabajo realizado..."
              rows="3"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reporte Técnico
            </label>
            <textarea
              value={formData.technicalReport}
              onChange={(e) => handleChange('technicalReport', e.target.value)}
              placeholder="Detalles técnicos del servicio..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partes Reemplazadas
            </label>
            <textarea
              value={formData.replacedParts}
              onChange={(e) => handleChange('replacedParts', e.target.value)}
              placeholder="Lista de partes reemplazadas..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Próximo Mantenimiento
            </label>
            <input
              type="date"
              value={formData.nextMaintenanceDate}
              onChange={(e) => handleChange('nextMaintenanceDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional: Programa el siguiente mantenimiento
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
