import { useState } from 'react';
import './AssignDelivererModal.css';

export const AssignDelivererModal = ({ order, deliverers = [], onAssign, onClose, loading = false }) => {
  const [selectedDeliverer, setSelectedDeliverer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDeliverer) {
      alert('Seleccione un repartidor');
      return;
    }
    onAssign(order.id, selectedDeliverer);
  };

  return (
    <div className="assign-modal__overlay">
      <div className="assign-modal">
        <div className="assign-modal__header">
          <h3>Asignar Repartidor</h3>
          <button onClick={onClose} className="assign-modal__close">&times;</button>
        </div>

        <div className="assign-modal__info">
          <p><strong>Pedido:</strong> {order.order_number}</p>
          <p><strong>Cliente:</strong> {order.customer_name}</p>
          <p><strong>Direccion:</strong> {order.delivery_address}</p>
        </div>

        <form onSubmit={handleSubmit} className="assign-modal__form">
          <div className="assign-modal__field">
            <label>Repartidor *</label>
            <select
              value={selectedDeliverer}
              onChange={(e) => setSelectedDeliverer(e.target.value)}
              className="assign-modal__select"
              required
            >
              <option value="">Seleccione un repartidor...</option>
              {deliverers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.full_name} - {d.phone || 'Sin telefono'}
                </option>
              ))}
            </select>
          </div>

          <div className="assign-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="assign-modal__btn assign-modal__btn--cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="assign-modal__btn assign-modal__btn--submit"
              disabled={loading || !selectedDeliverer}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDelivererModal;
