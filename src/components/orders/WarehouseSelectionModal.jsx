import { useState, useEffect, useMemo } from 'react';
import { warehouseService } from '../../services/warehouseService';
import './WarehouseSelectionModal.css';

export const WarehouseSelectionModal = ({
  order,
  onConfirm,
  onClose,
  loading = false
}) => {
  const [warehouses, setWarehouses] = useState([]);
  const [globalWarehouseId, setGlobalWarehouseId] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [error, setError] = useState(null);

  const productsNeedingWarehouse = (order?.details || []).filter(
    detail => !detail.warehouse_id
  );

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoadingWarehouses(true);
    setError(null);
    try {
      const response = await warehouseService.getAll({ status: 'active', limit: 100 });
      const warehouseList = Array.isArray(response.data) ? response.data :
                           Array.isArray(response.warehouses) ? response.warehouses : [];

      const warehousesWithStock = await Promise.all(
        warehouseList.map(async (warehouse) => {
          try {
            const productIds = productsNeedingWarehouse.map(d => d.product_id);
            const stockResponse = await warehouseService.getWarehouseProducts(warehouse.id, productIds);
            const stockData = stockResponse?.data?.products || [];
            return {
              ...warehouse,
              productStock: Array.isArray(stockData) ? stockData : []
            };
          } catch {
            return { ...warehouse, productStock: [] };
          }
        })
      );

      setWarehouses(warehousesWithStock);

      // Smart default: elegir como global el almacén que cubra MÁS productos del pedido
      // con stock suficiente. Empata por is_main, luego por orden de la lista.
      const countCovered = (warehouse) =>
        productsNeedingWarehouse.reduce((acc, detail) => {
          const stockEntry = (warehouse.productStock || []).find(p => p.product_id === detail.product_id);
          const available = parseFloat(stockEntry?.available_stock) || 0;
          return acc + (available >= parseFloat(detail.quantity) ? 1 : 0);
        }, 0);

      let bestWarehouse = null;
      let bestCount = -1;
      for (const w of warehousesWithStock) {
        const c = countCovered(w);
        if (c > bestCount || (c === bestCount && w.is_main && !bestWarehouse?.is_main)) {
          bestCount = c;
          bestWarehouse = w;
        }
      }
      if (!bestWarehouse) {
        bestWarehouse = warehousesWithStock.find(w => w.is_main) || warehousesWithStock[0];
      }
      if (bestWarehouse) {
        setGlobalWarehouseId(bestWarehouse.id);

        // Auto-seleccionar override para productos sin stock en el global
        // cuando exista exactamente UN almacén alternativo con stock suficiente.
        const initialOverrides = {};
        productsNeedingWarehouse.forEach(detail => {
          const stockInGlobal = (() => {
            const e = (bestWarehouse.productStock || []).find(p => p.product_id === detail.product_id);
            return parseFloat(e?.available_stock) || 0;
          })();
          if (stockInGlobal >= parseFloat(detail.quantity)) return;

          const candidates = warehousesWithStock.filter(w => {
            if (w.id === bestWarehouse.id) return false;
            const e = (w.productStock || []).find(p => p.product_id === detail.product_id);
            const av = parseFloat(e?.available_stock) || 0;
            return av >= parseFloat(detail.quantity);
          });
          if (candidates.length === 1) {
            initialOverrides[detail.id] = candidates[0].id;
          }
        });
        if (Object.keys(initialOverrides).length > 0) {
          setOverrides(initialOverrides);
        }
      }
    } catch (err) {
      setError('Error al cargar almacenes: ' + err.message);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const getStockForProduct = (warehouse, productId) => {
    if (!warehouse || !Array.isArray(warehouse.productStock)) return 0;
    const stock = warehouse.productStock.find(p => p.product_id === productId);
    return stock?.available_stock || 0;
  };

  const globalWarehouse = warehouses.find(w => w.id === globalWarehouseId);

  // Clasificar productos: con stock en el almacen global vs sin stock
  const { productsOk, productsNeedOverride } = useMemo(() => {
    if (!globalWarehouseId || !globalWarehouse) {
      return { productsOk: [], productsNeedOverride: productsNeedingWarehouse };
    }

    const ok = [];
    const needOverride = [];

    productsNeedingWarehouse.forEach(detail => {
      const available = getStockForProduct(globalWarehouse, detail.product_id);
      if (available >= parseFloat(detail.quantity)) {
        ok.push(detail);
      } else {
        needOverride.push({ ...detail, globalStock: available });
      }
    });

    return { productsOk: ok, productsNeedOverride: needOverride };
  }, [globalWarehouseId, globalWarehouse, productsNeedingWarehouse]);

  // Limpiar overrides de productos que ya no lo necesitan al cambiar almacen global
  const handleGlobalWarehouseChange = (warehouseId) => {
    const newId = warehouseId ? parseInt(warehouseId) : null;
    setGlobalWarehouseId(newId);
    setOverrides({});
  };

  const handleOverrideChange = (detailId, warehouseId) => {
    setOverrides(prev => ({
      ...prev,
      [detailId]: warehouseId ? parseInt(warehouseId) : null
    }));
  };

  const isAssignmentValid = () => {
    if (!globalWarehouseId) return false;

    return productsNeedOverride.every(detail => {
      const overrideId = overrides[detail.id];
      if (!overrideId) return false;
      const warehouse = warehouses.find(w => w.id === overrideId);
      if (!warehouse) return false;
      const available = getStockForProduct(warehouse, detail.product_id);
      return available >= parseFloat(detail.quantity);
    });
  };

  const allValid = isAssignmentValid();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allValid) return;

    const assignments = productsNeedingWarehouse.map(detail => {
      const overrideId = overrides[detail.id];
      const isOverridden = productsNeedOverride.some(p => p.id === detail.id) && overrideId;
      return {
        detail_id: detail.id,
        warehouse_id: isOverridden ? overrideId : globalWarehouseId
      };
    });

    onConfirm(order.id, assignments);
  };

  // Contar resumen
  const totalProducts = productsNeedingWarehouse.length;
  const okCount = productsOk.length;
  const overrideCount = productsNeedOverride.length;

  if (loadingWarehouses) {
    return (
      <div className="warehouse-modal__overlay">
        <div className="warehouse-modal">
          <div className="warehouse-modal__loading">Cargando almacenes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="warehouse-modal__overlay">
      <div className="warehouse-modal">
        <div className="warehouse-modal__header">
          <h3>Seleccionar Almacen de Salida</h3>
          <button onClick={onClose} className="warehouse-modal__close">&times;</button>
        </div>

        <div className="warehouse-modal__info">
          <p><strong>Pedido:</strong> {order.order_number}</p>
          <p><strong>Cliente:</strong> {order.customer_name}</p>
        </div>

        {error && (
          <div className="warehouse-modal__error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="warehouse-modal__form">
          {/* SELECTOR GLOBAL */}
          <div className="warehouse-modal__global">
            <label className="warehouse-modal__global-label">
              Almacen de salida para todos los productos:
            </label>
            <select
              value={globalWarehouseId || ''}
              onChange={(e) => handleGlobalWarehouseChange(e.target.value)}
              className="warehouse-modal__global-select"
            >
              <option value="">Seleccionar almacen...</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}{warehouse.is_main ? ' (Principal)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* RESUMEN Y LISTA DE PRODUCTOS */}
          {globalWarehouseId && (
            <div className="warehouse-modal__products">
              {/* Badge resumen */}
              <div className="warehouse-modal__summary">
                {overrideCount === 0 ? (
                  <span className="warehouse-modal__summary-ok">
                    Todos los productos ({totalProducts}) tienen stock disponible
                  </span>
                ) : (
                  <span className="warehouse-modal__summary-warn">
                    {okCount} de {totalProducts} con stock — {overrideCount} requiere{overrideCount > 1 ? 'n' : ''} otro almacen
                  </span>
                )}
              </div>

              {/* Productos OK (asignados al global) */}
              {productsOk.length > 0 && (
                <div className="warehouse-modal__ok-list">
                  {productsOk.map(detail => (
                    <div key={detail.id} className="warehouse-modal__product-row warehouse-modal__product-row--ok">
                      <div className="warehouse-modal__product-info">
                        <span className="warehouse-modal__product-name">
                          {detail.product_name || `Producto #${detail.product_id}`}
                        </span>
                        <span className="warehouse-modal__product-qty">
                          Cantidad: {detail.quantity}
                        </span>
                      </div>
                      <div className="warehouse-modal__product-status">
                        <span className="warehouse-modal__stock-badge warehouse-modal__stock-badge--ok">
                          Stock: {getStockForProduct(globalWarehouse, detail.product_id)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Productos que necesitan override */}
              {productsNeedOverride.length > 0 && (
                <div className="warehouse-modal__override-list">
                  <h4 className="warehouse-modal__override-title">
                    Asignar otro almacén (no disponible en {globalWarehouse?.name}):
                  </h4>
                  {productsNeedOverride.map(detail => {
                    const overrideId = overrides[detail.id];
                    const overrideWarehouse = overrideId ? warehouses.find(w => w.id === overrideId) : null;
                    const overrideStock = overrideWarehouse ? getStockForProduct(overrideWarehouse, detail.product_id) : 0;
                    const overrideValid = overrideWarehouse && overrideStock >= parseFloat(detail.quantity);

                    return (
                      <div key={detail.id} className="warehouse-modal__product-row warehouse-modal__product-row--override">
                        <div className="warehouse-modal__product-info">
                          <span className="warehouse-modal__product-name">
                            {detail.product_name || `Producto #${detail.product_id}`}
                          </span>
                          <span className="warehouse-modal__product-qty">
                            Cantidad: {detail.quantity}
                          </span>
                        </div>
                        <div className="warehouse-modal__product-global-stock">
                          Stock en {globalWarehouse?.name}: <strong>{detail.globalStock}</strong>
                        </div>
                        <div className="warehouse-modal__product-select">
                          <select
                            value={overrideId || ''}
                            onChange={(e) => handleOverrideChange(detail.id, e.target.value)}
                            className={`warehouse-modal__select ${overrideId && !overrideValid ? 'warehouse-modal__select--invalid' : ''}`}
                            required
                          >
                            <option value="">Seleccionar otro almacen...</option>
                            {warehouses
                              .filter(w => w.id !== globalWarehouseId)
                              .map(warehouse => {
                                const available = getStockForProduct(warehouse, detail.product_id);
                                const hasEnough = available >= parseFloat(detail.quantity);
                                return (
                                  <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name} — Stock: {available}
                                    {!hasEnough ? ' (INSUFICIENTE)' : ''}
                                  </option>
                                );
                              })}
                          </select>
                          {overrideId && (
                            <span className={`warehouse-modal__stock-status ${
                              overrideValid ? 'warehouse-modal__stock-status--ok' : 'warehouse-modal__stock-status--error'
                            }`}>
                              {overrideValid ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="warehouse-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="warehouse-modal__btn warehouse-modal__btn--cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="warehouse-modal__btn warehouse-modal__btn--submit"
              disabled={loading || !allValid}
            >
              {loading ? 'Procesando...' : 'Confirmar y Marcar En Camino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseSelectionModal;
