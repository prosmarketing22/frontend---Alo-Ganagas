import { useState, useEffect } from 'react';
import { collaboratorService } from '../../services/collaboratorService';
import { warehouseService } from '../../services/warehouseService';
import { getContainerLabel } from '../../utils/constants';

export const CustomerLoanReturnForm = ({ loan, onSubmit, onCancel }) => {
  const pending = loan.quantity - loan.quantity_returned;
  const [quantity, setQuantity] = useState(pending);
  const [returnedBy, setReturnedBy] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [deliverymen, setDeliverymen] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingDeliverymen, setLoadingDeliverymen] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);

  useEffect(() => {
    loadDeliverymen();
    loadWarehouses();
  }, []);

  const loadDeliverymen = async () => {
    try {
      const response = await collaboratorService.getDeliverymen();
      setDeliverymen(response.data || []);
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
    } finally {
      setLoadingDeliverymen(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehouseService.getAll({ status: 'active' });
      const warehouseList = response.data || [];
      setWarehouses(warehouseList);
      const mainWarehouse = warehouseList.find(w => w.is_main);
      if (mainWarehouse) {
        setWarehouseId(String(mainWarehouse.id));
      } else if (warehouseList.length > 0) {
        setWarehouseId(String(warehouseList[0].id));
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > pending) {
      alert('La cantidad a devolver debe ser mayor a 0 y no exceder lo pendiente');
      return;
    }
    if (!returnedBy) {
      alert('Debe seleccionar el repartidor que realizó la devolución');
      return;
    }
    if (!warehouseId) {
      alert('Debe seleccionar el almacén de destino');
      return;
    }
    onSubmit(loan.id, quantity, parseInt(returnedBy), parseInt(warehouseId));
  };

  return (
    <form onSubmit={handleSubmit} className="return-form">
      <div className="return-form__summary">
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Tipo Envase:</span>
          <span className="return-form__summary-value">{getContainerLabel(loan.container_type)}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Cliente:</span>
          <span className="return-form__summary-value">{loan.customer_name}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Tipo:</span>
          <span className={`return-form__summary-value ${loan.debt_type === 'NOS_DEBEN' ? 'return-form__summary-value--nos-deben' : 'return-form__summary-value--debemos'}`}>
            {loan.debt_type === 'NOS_DEBEN' ? 'Nos Deben' : 'Debemos'}
          </span>
        </div>
        <div className="return-form__summary-divider"></div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Cantidad Total:</span>
          <span className="return-form__summary-value">{loan.quantity}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Ya Devuelto:</span>
          <span className="return-form__summary-value">{loan.quantity_returned}</span>
        </div>
        <div className="return-form__summary-item return-form__summary-item--highlight">
          <span className="return-form__summary-label">Pendiente:</span>
          <span className="return-form__summary-value return-form__summary-value--pending">{pending}</span>
        </div>
      </div>

      <div className="return-form__field">
        <label className="return-form__label">Cantidad a Devolver *</label>
        <input
          type="number"
          min="1"
          max={pending}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          className="return-form__input"
          required
        />
        <p className="return-form__help">Maximo: {pending} unidades</p>
      </div>

      <div className="return-form__field">
        <label className="return-form__label">📦 Almacén de destino *</label>
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="return-form__select"
          required
          disabled={loadingWarehouses}
        >
          <option value="">
            {loadingWarehouses ? 'Cargando almacenes...' : 'Seleccione un almacén'}
          </option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}{w.is_main ? ' (Principal)' : ''}
            </option>
          ))}
        </select>
        <p className="return-form__help">Almacén donde se registrará la devolución del envase</p>
      </div>

      <div className="return-form__field">
        <label className="return-form__label">👤 Repartidor que realizó la devolución *</label>
        <select
          value={returnedBy}
          onChange={(e) => setReturnedBy(e.target.value)}
          className="return-form__select"
          required
          disabled={loadingDeliverymen}
        >
          <option value="">
            {loadingDeliverymen ? 'Cargando repartidores...' : 'Seleccione un repartidor'}
          </option>
          {deliverymen.map((dm) => (
            <option key={dm.id} value={dm.id}>
              {dm.full_name}
            </option>
          ))}
        </select>
        <p className="return-form__help">Seleccione quién recogió el envase vacío</p>
      </div>

      <div className="return-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="return-form__btn return-form__btn--cancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="return-form__btn return-form__btn--submit"
        >
          Registrar Devolucion
        </button>
      </div>
    </form>
  );
};
