export const TaskSelector = ({ selectedTask, onTaskChange }) => {
  const tasks = [
    { id: 'entregas', label: 'Entregas', icon: '🚚', color: 'blue' },
    { id: 'cobros', label: 'Cobros', icon: '💰', color: 'green' },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: '🔧', color: 'orange' }
  ];

  const getButtonClasses = (task) => {
    const baseClasses = 'flex-1 p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2';
    const isSelected = selectedTask === task.id;

    const colorClasses = {
      blue: isSelected
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300',
      green: isSelected
        ? 'bg-green-600 text-white shadow-lg'
        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300',
      orange: isSelected
        ? 'bg-orange-600 text-white shadow-lg'
        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300'
    };

    return `${baseClasses} ${colorClasses[task.color]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecciona tu tarea</h2>
      <div className="flex gap-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onTaskChange(task.id)}
            className={getButtonClasses(task)}
          >
            <span className="text-3xl">{task.icon}</span>
            <span className="font-medium text-sm">{task.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
