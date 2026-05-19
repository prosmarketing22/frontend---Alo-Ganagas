import { useState, useEffect } from 'react';
import { getContainerLabel } from '../../utils/constants';
import { inventoryService } from '../../services/inventoryService';

export const SupplierLoanReturnForm = ({ loan, onSubmit, onCancel }) => {
  const pending = loan.quantity - loan.quantity_returned;
  const [quantity, setQuantity] = useState(pending);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [loadingStock, setLoadingStock] = useState(true);

  const isDebemos = loan.debt_type === 'DEBEMOS';

  useEffect(() => {
    const loadAllWarehouseStock = async () => {
      try {
        setLoadingStock(true);
        const stockRes = await inventoryService.getEmptyStock();
        const allStock = stockRes.data;

        const filtered = allStock
          .filter(s => s.container_type === loan.container_type)
          .map(s => ({
            id: s.warehouse_id,
            name: s.warehouse_name,
            stock: parseInt(s.empty_stock) || 0
          }));

        if (isDebemos) {
          const withStock = filtered.filter(w => w.stock > 0);
          setWarehouses(withStock);

          if (withStock.length === 1) {
            setSelectedWarehouseId(withStock[0].id);
            if (withStock[0].stock < pending) {
              setQuantity(withStock[0].stock);
            }
          }
        } else {
          setWarehouses(filtered);
          if (filtered.length === 1) {
            setSelectedWarehouseId(filtered[0].id);
          }
        }
      } catch (error) {
        console.error('Error al cargar stock de almacenes:', error);
      } finally {
        setLoadingStock(false);
      }
    };

    loadAllWarehouseStock();
  }, [loan.container_type, pending, isDebemos]);

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  const maxQuantity = isDebemos && selectedWarehouse
    ? Math.min(pending, selectedWarehouse.stock)
    : pending;

  const handleWarehouseChange = (warehouseId) => {
    const id = parseInt(warehouseId);
    setSelectedWarehouseId(id);
    const wh = warehouses.find(w => w.id === id);
    if (isDebemos && wh && wh.stock < pending) {
      setQuantity(wh.stock);
    } else {
      setQuantity(pending);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedWarehouseId) {
      alert('Debe seleccionar un almacen');
      return;
    }
    if (quantity <= 0 || quantity > maxQuantity) {
      alert(isDebemos && selectedWarehouse && selectedWarehouse.stock < pending
        ? `Stock insuficiente. Solo hay ${selectedWarehouse.stock} ${getContainerLabel(loan.container_type)} disponibles en "${selectedWarehouse.name}"`
        : 'La cantidad a devolver debe ser mayor a 0 y no exceder lo pendiente'
      );
      return;
    }
    onSubmit(loan.id, quantity, selectedWarehouseId);
  };

  const canSubmit = selectedWarehouseId && quantity > 0 && (!isDebemos || (selectedWarehouse && selectedWarehouse.stock > 0));

  return (
    <form onSubmit={handleSubmit} className="return-form">
      <div className="return-form__summary">
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Tipo Envase:</span>
          <span className="return-form__summary-value">{getContainerLabel(loan.container_type)}</span>
        </div>
        <div className="return-form__summary-item">
          <span className="return-form__summary-label">Proveedor:</span>
          <span className="return-form__summary-value">{loan.supplier_name}</span>
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

      <div className={`return-form__warehouse-info ${isDebemos ? 'return-form__warehouse-info--debemos' : 'return-form__warehouse-info--nos-deben'}`}>
        <div className="return-form__warehouse-header">
          <span className="return-form__warehouse-icon">{isDebemos ? '📤' : '📥'}</span>
          <span className="return-form__warehouse-title">
            {isDebemos ? 'Almacen de salida' : 'Almacen de destino'}
          </span>
        </div>

        {loadingStock ? (
          <span className="return-form__warehouse-loading">Cargando almacenes...</span>
        ) : warehouses.length === 0 ? (
          <div className="return-form__warehouse-warning">
            {isDebemos
              ? `No hay almacenes con stock disponible de ${getContainerLabel(loan.container_type)} vacios para realizar la devolucion.`
              : 'No se encontraron almacenes disponibles.'
            }
          </div>
        ) : warehouses.length === 1 ? (
          <>
            <div className="return-form__warehouse-name">{warehouses[0].name}</div>
            <div className="return-form__warehouse-stock">
              <span className="return-form__warehouse-stock-label">
                Stock de {getContainerLabel(loan.container_type)} vacios:
              </span>
              <span className={`return-form__warehouse-stock-value ${warehouses[0].stock === 0 ? 'return-form__warehouse-stock-value--empty' : ''}`}>
                {warehouses[0].stock} unid.
              </span>
            </div>
            {isDebemos && warehouses[0].stock < pending && (
              <div className="return-form__warehouse-warning">
                Stock insuficiente para devolver las {pending} unidades pendientes. Solo puede devolver hasta {warehouses[0].stock}.
              </div>
            )}
          </>
        ) : (
          <>
            <div className="return-form__field" style={{ marginBottom: 0 }}>
              <select
                className="return-form__select"
                value={selectedWarehouseId || ''}
                onChange={(e) => handleWarehouseChange(e.target.value)}
              >
                <option value="">-- Seleccionar almacen --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.stock} {getContainerLabel(loan.container_type)} vacios)
                  </option>
                ))}
              </select>
            </div>

            {selectedWarehouse && (
              <div className="return-form__warehouse-stock">
                <span className="return-form__warehouse-stock-label">
                  Stock disponible:
                </span>
                <span className={`return-form__warehouse-stock-value ${selectedWarehouse.stock === 0 ? 'return-form__warehouse-stock-value--empty' : ''}`}>
                  {selectedWarehouse.stock} unid.
                </span>
              </div>
            )}

            {isDebemos && selectedWarehouse && selectedWarehouse.stock < pending && (
              <div className="return-form__warehouse-warning">
                Stock insuficiente para devolver las {pending} unidades pendientes. Solo puede devolver hasta {selectedWarehouse.stock}.
              </div>
            )}
          </>
        )}
      </div>

      <div className="return-form__field">
        <label className="return-form__label">Cantidad a Devolver *</label>
        <input
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          className="return-form__input"
          required
          disabled={!canSubmit}
        />
        <p className="return-form__help">
          Maximo: {maxQuantity} unidades
          {isDebemos && selectedWarehouse && selectedWarehouse.stock < pending && (
            <span className="return-form__help--warning"> (limitado por stock disponible)</span>
          )}
        </p>
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
          disabled={!canSubmit}
        >
          Registrar Devolucion
        </button>
      </div>
    </form>
  );
};
