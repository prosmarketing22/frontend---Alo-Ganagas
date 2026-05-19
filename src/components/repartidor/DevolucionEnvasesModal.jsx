import { useState, useEffect } from 'react';
import { getContainerLabel } from '../../utils/constants';
import './DevolucionEnvasesModal.css';

const TYPE_ICONS = {
  BALON_GAS: '🔥',
  BIDON_AGUA: '💧',
  OTRO: '📦'
};

export const DevolucionEnvasesModal = ({
  isOpen,
  onClose,
  customer,
  warehouses = [],
  onSubmit,
  repartidorName = ''
}) => {
  const [quantities, setQuantities] = useState({});
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Agrupar préstamos por tipo
  const loansByType = (() => {
    if (!customer?.prestamos) return [];
    const byType = {};
    customer.prestamos.forEach(p => {
      const type = p.container_type || 'OTRO';
      if (byType[type]) {
        byType[type].cantidad_pendiente += p.cantidad_pendiente;
      } else {
        byType[type] = {
          container_type: type,
          cantidad_pendiente: p.cantidad_pendiente
        };
      }
    });
    return Object.values(byType);
  })();

  // Inicializar cantidades por container_type cuando cambia el cliente
  useEffect(() => {
    if (loansByType.length > 0) {
      const initialQuantities = {};
      loansByType.forEach(group => {
        initialQuantities[group.container_type] = 0;
      });
      setQuantities(initialQuantities);
    }
  }, [customer]);

  // Seleccionar almacén principal por defecto
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      const mainWarehouse = warehouses.find(w => w.is_main);
      setSelectedWarehouse(mainWarehouse?.id?.toString() || warehouses[0]?.id?.toString() || '');
    }
  }, [warehouses, selectedWarehouse]);

  if (!isOpen || !customer) return null;

  const handleQuantityChange = (containerType, value) => {
    const group = loansByType.find(g => g.container_type === containerType);
    const maxQty = group?.cantidad_pendiente || 0;
    const newValue = Math.max(0, Math.min(parseInt(value) || 0, maxQty));
    setQuantities(prev => ({ ...prev, [containerType]: newValue }));
  };

  const incrementQuantity = (containerType) => {
    const group = loansByType.find(g => g.container_type === containerType);
    const maxQty = group?.cantidad_pendiente || 0;
    setQuantities(prev => ({
      ...prev,
      [containerType]: Math.min((prev[containerType] || 0) + 1, maxQty)
    }));
  };

  const decrementQuantity = (containerType) => {
    setQuantities(prev => ({
      ...prev,
      [containerType]: Math.max((prev[containerType] || 0) - 1, 0)
    }));
  };

  const setMaxQuantity = (containerType) => {
    const group = loansByType.find(g => g.container_type === containerType);
    setQuantities(prev => ({
      ...prev,
      [containerType]: group?.cantidad_pendiente || 0
    }));
  };

  const totalItemsToReturn = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalItemsToReturn === 0) return;

    // Enviar devoluciones por container_type
    const returns = [];
    Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .forEach(([containerType, qty]) => {
        returns.push({
          container_type: containerType,
          quantity_returned: qty
        });
      });

    setIsSubmitting(true);

    try {
      await onSubmit({
        customer_id: customer.customer_id,
        warehouse_id: selectedWarehouse ? parseInt(selectedWarehouse) : null,
        returns,
        notes
      });
      handleClose();
    } catch (error) {
      console.error('Error al registrar devolución:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantities({});
    setSelectedWarehouse('');
    setNotes('');
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="devolucion-modal__overlay">
      <div className="devolucion-modal">
        <div className="devolucion-modal__header">
          <h2 className="devolucion-modal__title">Registrar Devolución de Envases</h2>
          <button onClick={handleClose} className="devolucion-modal__close-btn">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="devolucion-modal__content">
          {/* Información del cliente */}
          <div className="devolucion-modal__customer-card">
            <p className="devolucion-modal__customer-name">{customer.customer_name}</p>
            <p className="devolucion-modal__customer-info">{customer.customer_phone}</p>
            <p className="devolucion-modal__customer-info">{customer.address}</p>
            {customer.reference && (
              <p className="devolucion-modal__customer-info">Ref: {customer.reference}</p>
            )}
          </div>

          {/* Lista de productos con deuda */}
          <div>
            <p className="devolucion-modal__section-title">Envases pendientes de devolución:</p>

            {loansByType.length > 0 ? (
              loansByType.map((group) => (
                <div key={group.container_type} className="devolucion-modal__product-card">
                  <div className="devolucion-modal__product-header">
                    <div>
                      <p className="devolucion-modal__product-name">
                        {TYPE_ICONS[group.container_type] || '📦'} {getContainerLabel(group.container_type)}
                      </p>
                    </div>
                    <div className="devolucion-modal__product-right">
                      <span className="devolucion-modal__warning-badge">
                        Debe: {group.cantidad_pendiente}
                      </span>
                    </div>
                  </div>

                  <div className="devolucion-modal__quantity-row">
                    <span className="devolucion-modal__quantity-label">Cantidad a devolver:</span>
                    <div className="devolucion-modal__quantity-controls">
                      <button
                        type="button"
                        onClick={() => decrementQuantity(group.container_type)}
                        className="devolucion-modal__quantity-btn"
                        disabled={quantities[group.container_type] <= 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={group.cantidad_pendiente}
                        value={quantities[group.container_type] || 0}
                        onChange={(e) => handleQuantityChange(group.container_type, e.target.value)}
                        className="devolucion-modal__quantity-input"
                      />
                      <button
                        type="button"
                        onClick={() => incrementQuantity(group.container_type)}
                        className="devolucion-modal__quantity-btn"
                        disabled={quantities[group.container_type] >= group.cantidad_pendiente}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaxQuantity(group.container_type)}
                        className="devolucion-modal__todos-btn"
                      >
                        Todos
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="devolucion-modal__empty-state">
                <p>Este cliente no tiene envases pendientes</p>
              </div>
            )}
          </div>

          {/* Selección de almacén */}
          <div className="devolucion-modal__warehouse-section">
            <label className="devolucion-modal__section-title">
              Almacén destino (donde se depositarán los envases):
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="devolucion-modal__select"
              required
            >
              <option value="">Seleccionar almacén...</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} {warehouse.is_main && '(Principal)'}
                </option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div className="devolucion-modal__notes-section">
            <label className="devolucion-modal__section-title">Observaciones (opcional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre la devolución..."
              rows="2"
              className="devolucion-modal__textarea"
            />
          </div>

          {/* Resumen de la devolución */}
          {totalItemsToReturn > 0 && (
            <div className="devolucion-modal__summary-card">
              <div className="devolucion-modal__summary-row">
                <span className="devolucion-modal__summary-label">Total envases a devolver:</span>
                <span className="devolucion-modal__summary-value">{totalItemsToReturn}</span>
              </div>
              {selectedWarehouse && (
                <div className="devolucion-modal__summary-row">
                  <span className="devolucion-modal__summary-label">Almacén destino:</span>
                  <span className="devolucion-modal__summary-value">
                    {warehouses.find(w => w.id.toString() === selectedWarehouse)?.name || '-'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Información del registro */}
          <div className="devolucion-modal__info-row">
            <svg className="devolucion-modal__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Repartidor: {repartidorName || 'No identificado'}</span>
          </div>
          <div className="devolucion-modal__info-row devolucion-modal__info-row--no-border">
            <svg className="devolucion-modal__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{currentDate}</span>
          </div>
        </form>

        <div className="devolucion-modal__footer">
          <button
            type="button"
            onClick={handleClose}
            className="devolucion-modal__cancel-btn"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={totalItemsToReturn === 0 || !selectedWarehouse || isSubmitting}
            className="devolucion-modal__submit-btn"
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar Devolución'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevolucionEnvasesModal;
