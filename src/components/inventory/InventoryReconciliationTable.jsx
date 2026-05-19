import { useState, useEffect, useMemo, Fragment } from 'react';
import { useInventoryApi } from '../../hooks/useApi/useInventoryApi';
import { useWarehouseApi } from '../../hooks/useApi/useWarehouseApi';
import { CONTAINER_TYPE_LABELS } from '../../utils/constants';

export const InventoryReconciliationTable = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [products, setProducts] = useState([]);
  const [emptyContainers, setEmptyContainers] = useState([]);
  const [realValues, setRealValues] = useState({});
  const [emptyRealValues, setEmptyRealValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { getStockForReconciliation, saveReconciliation, loading: loadingInventory } = useInventoryApi();
  const { data: warehouses, fetchWarehouses, loading: loadingWarehouses } = useWarehouseApi();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadStock();
    } else {
      setProducts([]);
      setEmptyContainers([]);
      setRealValues({});
      setEmptyRealValues({});
    }
  }, [selectedWarehouse]);

  const loadStock = async () => {
    try {
      const data = await getStockForReconciliation(selectedWarehouse);
      const productList = data?.products || [];
      const containerList = data?.empty_containers || [];

      setProducts(productList);
      setEmptyContainers(containerList);

      const initialProductValues = {};
      productList.forEach(item => {
        initialProductValues[item.product_id] = {
          stock_real: item.stock_system
        };
      });
      setRealValues(initialProductValues);

      const initialEmptyValues = {};
      containerList.forEach(item => {
        const key = item.container_type;
        if (!initialEmptyValues[key]) {
          initialEmptyValues[key] = { empty_real: 0 };
        }
        initialEmptyValues[key].empty_real += item.empty_system;
      });
      setEmptyRealValues(initialEmptyValues);
    } catch (err) {
      console.error('Error al cargar stock:', err);
    }
  };

  const handleRealValueChange = (productId, value) => {
    const numValue = value === '' ? '' : parseInt(value) || 0;
    setRealValues(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        stock_real: numValue
      }
    }));
  };

  const handleEmptyRealValueChange = (containerType, value) => {
    const numValue = value === '' ? '' : parseInt(value) || 0;
    setEmptyRealValues(prev => ({
      ...prev,
      [containerType]: {
        ...prev[containerType],
        empty_real: numValue
      }
    }));
  };

  const getStockDifference = (productId) => {
    const product = products.find(p => p.product_id === productId);
    if (!product) return 0;
    const realValue = realValues[productId]?.stock_real;
    if (realValue === '' || realValue === undefined) return 0;
    return realValue - product.stock_system;
  };

  const getEmptyDifference = (key) => {
    const systemTotal = emptyContainers
      .filter(c => c.container_type === key)
      .reduce((sum, c) => sum + c.empty_system, 0);
    const realValue = emptyRealValues[key]?.empty_real;
    if (realValue === '' || realValue === undefined) return 0;
    return realValue - systemTotal;
  };

  const getDifferenceClass = (diff) => {
    if (diff > 0) return 'reconciliation-diff--positive';
    if (diff < 0) return 'reconciliation-diff--negative';
    return 'reconciliation-diff--zero';
  };

  const hasAnyProductDifference = useMemo(() => {
    return products.some(product => {
      return getStockDifference(product.product_id) !== 0;
    });
  }, [products, realValues]);

  const hasAnyEmptyDifference = useMemo(() => {
    const containerTypes = [...new Set(emptyContainers.map(c => c.container_type))];
    return containerTypes.some(key => getEmptyDifference(key) !== 0);
  }, [emptyContainers, emptyRealValues]);

  const hasAnyDifference = hasAnyProductDifference || hasAnyEmptyDifference;

  const differencesSummary = useMemo(() => {
    let positiveStock = 0;
    let negativeStock = 0;
    let positiveEmpty = 0;
    let negativeEmpty = 0;
    let productsWithDiff = 0;
    let containersWithDiff = 0;

    products.forEach(product => {
      const stockDiff = getStockDifference(product.product_id);
      if (stockDiff !== 0) {
        productsWithDiff++;
      }
      if (stockDiff > 0) positiveStock += stockDiff;
      if (stockDiff < 0) negativeStock += stockDiff;
    });

    const containerTypes = [...new Set(emptyContainers.map(c => c.container_type))];
    containerTypes.forEach(key => {
      const emptyDiff = getEmptyDifference(key);
      if (emptyDiff !== 0) {
        containersWithDiff++;
      }
      if (emptyDiff > 0) positiveEmpty += emptyDiff;
      if (emptyDiff < 0) negativeEmpty += emptyDiff;
    });

    return { positiveStock, negativeStock, positiveEmpty, negativeEmpty, productsWithDiff, containersWithDiff };
  }, [products, emptyContainers, realValues, emptyRealValues]);

  const warehouseEmptyTotals = useMemo(() => {
    let balonesVacios = 0;
    let bidonesVacios = 0;

    emptyContainers.forEach(container => {
      const emptyStock = container.empty_system || 0;
      if (container.container_type === 'BALON_GAS') {
        balonesVacios += emptyStock;
      } else if (container.container_type === 'BIDON_AGUA') {
        bidonesVacios += emptyStock;
      }
    });

    return {
      balones_vacios: balonesVacios,
      bidones_vacios: bidonesVacios,
      total_vacios: balonesVacios + bidonesVacios
    };
  }, [emptyContainers]);

  const handleSaveReconciliation = async () => {
    if (!hasAnyDifference) {
      alert('No hay diferencias para guardar');
      return;
    }

    if (!confirm('Esta seguro de aplicar el cuadre de inventario? Esta accion ajustara el stock segun los valores reales ingresados.')) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      const items = products
        .map(product => ({
          product_id: product.product_id,
          stock_real: realValues[product.product_id]?.stock_real ?? product.stock_system
        }))
        .filter(item => {
          const product = products.find(p => p.product_id === item.product_id);
          const stockDiff = (item.stock_real || 0) - (product?.stock_system || 0);
          return stockDiff !== 0;
        });

      const containerTypes = [...new Set(emptyContainers.map(c => c.container_type))];
      const empty_items = containerTypes
        .map(containerType => {
          const systemTotal = emptyContainers
            .filter(c => c.container_type === containerType)
            .reduce((sum, c) => sum + c.empty_system, 0);
          return {
            container_type: containerType,
            empty_real: emptyRealValues[containerType]?.empty_real ?? systemTotal
          };
        })
        .filter(item => {
          const systemTotal = emptyContainers
            .filter(c => c.container_type === item.container_type)
            .reduce((sum, c) => sum + c.empty_system, 0);
          const emptyDiff = (item.empty_real || 0) - systemTotal;
          return emptyDiff !== 0;
        });

      const result = await saveReconciliation({
        warehouse_id: parseInt(selectedWarehouse),
        items,
        empty_items
      });

      setSuccessMessage(`Cuadre aplicado exitosamente. Se ajustaron ${result.total_adjustments} registros.`);
      loadStock();
    } catch (err) {
      console.error('Error al guardar cuadre:', err);
      alert('Error al guardar el cuadre: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getProductTypeLabel = (type, balloonType) => {
    if (type === 'BALON_GAS') {
      return balloonType === 'PREMIUM' ? 'Gas Premium' : 'Gas Normal';
    }
    switch (type) {
      case 'BIDON_AGUA': return 'Agua';
      case 'ACCESORIO': return 'Accesorio';
      default: return type;
    }
  };

  const getProductTypeClass = (type, balloonType) => {
    if (type === 'BALON_GAS') {
      return balloonType === 'PREMIUM' ? 'reconciliation-category--gas-premium' : 'reconciliation-category--gas';
    }
    switch (type) {
      case 'BIDON_AGUA': return 'reconciliation-category--agua';
      case 'ACCESORIO': return 'reconciliation-category--accesorio';
      default: return '';
    }
  };

  const getGroupClass = (groupKey) => {
    switch (groupKey) {
      case 'BALON_GAS_PREMIUM': return 'reconciliation-category--gas-premium';
      case 'BALON_GAS_NORMAL': return 'reconciliation-category--gas';
      case 'BIDON_AGUA': return 'reconciliation-category--agua';
      case 'ACCESORIO': return 'reconciliation-category--accesorio';
      default: return '';
    }
  };

  const getGroupTitle = (groupKey) => {
    switch (groupKey) {
      case 'BALON_GAS_PREMIUM': return 'Balones de Gas - Premium';
      case 'BALON_GAS_NORMAL': return 'Balones de Gas - Normal';
      case 'BIDON_AGUA': return 'Bidones de Agua';
      case 'ACCESORIO': return 'Accesorios';
      default: return groupKey;
    }
  };

  const groupedProducts = useMemo(() => {
    const groups = {
      BALON_GAS_PREMIUM: [],
      BALON_GAS_NORMAL: [],
      BIDON_AGUA: [],
      ACCESORIO: []
    };
    products.forEach(product => {
      const type = product.product_type;
      if (type === 'BALON_GAS') {
        if (product.balloon_type === 'PREMIUM') {
          groups.BALON_GAS_PREMIUM.push(product);
        } else {
          groups.BALON_GAS_NORMAL.push(product);
        }
      } else if (type === 'BIDON_AGUA') {
        groups.BIDON_AGUA.push(product);
      } else {
        groups.ACCESORIO.push(product);
      }
    });
    return groups;
  }, [products]);

  const hasData = products.length > 0 || emptyContainers.length > 0;

  return (
    <div className="reconciliation-container">
      <div className="reconciliation-header">
        <div className="reconciliation-warehouse-selector">
          <label className="reconciliation-label">Seleccionar Almacen:</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="reconciliation-select"
            disabled={loadingWarehouses}
          >
            <option value="">-- Seleccione un almacen --</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {selectedWarehouse && hasAnyDifference && (
          <button
            onClick={handleSaveReconciliation}
            className="reconciliation-btn reconciliation-btn--save"
            disabled={saving || loadingInventory}
          >
            {saving ? 'Guardando...' : 'Aplicar Cuadre'}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="reconciliation-success">
          {successMessage}
        </div>
      )}

      {selectedWarehouse && !loadingInventory && hasData && (
        <div className="reconciliation-global-totals">
          <div className="reconciliation-global-totals__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Total de Envases Vacios - {warehouses.find(w => w.id == selectedWarehouse)?.name || 'Almacen'}
          </div>
          <div className="reconciliation-global-totals__grid">
            <div className="reconciliation-global-totals__item reconciliation-global-totals__item--balones">
              <div className="reconciliation-global-totals__content">
                <span className="reconciliation-global-totals__label">Balones Vacios</span>
                <span className="reconciliation-global-totals__value">{warehouseEmptyTotals.balones_vacios}</span>
              </div>
            </div>
            <div className="reconciliation-global-totals__item reconciliation-global-totals__item--bidones">
              <div className="reconciliation-global-totals__content">
                <span className="reconciliation-global-totals__label">Bidones Vacios</span>
                <span className="reconciliation-global-totals__value">{warehouseEmptyTotals.bidones_vacios}</span>
              </div>
            </div>
            <div className="reconciliation-global-totals__item reconciliation-global-totals__item--total">
              <div className="reconciliation-global-totals__content">
                <span className="reconciliation-global-totals__label">Total Vacios</span>
                <span className="reconciliation-global-totals__value">{warehouseEmptyTotals.total_vacios}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedWarehouse && hasAnyDifference && (
        <div className="reconciliation-summary">
          <div className="reconciliation-summary__title">Resumen de Diferencias</div>
          <div className="reconciliation-summary__grid">
            <div className="reconciliation-summary__item">
              <span className="reconciliation-summary__label">Productos con diferencias:</span>
              <span className="reconciliation-summary__value">{differencesSummary.productsWithDiff}</span>
            </div>
            <div className="reconciliation-summary__item">
              <span className="reconciliation-summary__label">Stock sobrante:</span>
              <span className="reconciliation-summary__value reconciliation-summary__value--positive">+{differencesSummary.positiveStock}</span>
            </div>
            <div className="reconciliation-summary__item">
              <span className="reconciliation-summary__label">Stock faltante:</span>
              <span className="reconciliation-summary__value reconciliation-summary__value--negative">{differencesSummary.negativeStock}</span>
            </div>
            {emptyContainers.length > 0 && (
              <>
                <div className="reconciliation-summary__item">
                  <span className="reconciliation-summary__label">Envases con diferencias:</span>
                  <span className="reconciliation-summary__value">{differencesSummary.containersWithDiff}</span>
                </div>
                <div className="reconciliation-summary__item">
                  <span className="reconciliation-summary__label">Vacios sobrantes:</span>
                  <span className="reconciliation-summary__value reconciliation-summary__value--positive">+{differencesSummary.positiveEmpty}</span>
                </div>
                <div className="reconciliation-summary__item">
                  <span className="reconciliation-summary__label">Vacios faltantes:</span>
                  <span className="reconciliation-summary__value reconciliation-summary__value--negative">{differencesSummary.negativeEmpty}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!selectedWarehouse && (
        <div className="reconciliation-empty">
          <p className="reconciliation-empty__text">Seleccione un almacen para ver el inventario</p>
        </div>
      )}

      {selectedWarehouse && loadingInventory && (
        <div className="reconciliation-loading">
          <div className="reconciliation-loading__spinner"></div>
          <p className="reconciliation-loading__text">Cargando inventario...</p>
        </div>
      )}

      {selectedWarehouse && !loadingInventory && !hasData && (
        <div className="reconciliation-empty">
          <p className="reconciliation-empty__text">No hay productos en este almacen</p>
        </div>
      )}

      {selectedWarehouse && !loadingInventory && products.length > 0 && (
        <div className="reconciliation-table-wrapper">
          <table className="reconciliation-table">
            <thead>
              <tr>
                <th className="reconciliation-th reconciliation-th--product">Producto</th>
                <th className="reconciliation-th reconciliation-th--category">Categoria</th>
                <th className="reconciliation-th reconciliation-th--unit">Unidad</th>
                <th className="reconciliation-th reconciliation-th--system">Stock Sistema</th>
                <th className="reconciliation-th reconciliation-th--real">Stock Real</th>
                <th className="reconciliation-th reconciliation-th--diff">Dif. Stock</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedProducts).map(([groupKey, groupProducts]) => (
                groupProducts.length > 0 && (
                  <Fragment key={groupKey}>
                    <tr className="reconciliation-group-header">
                      <td colSpan="6" className={`reconciliation-group-title ${getGroupClass(groupKey)}`}>
                        {getGroupTitle(groupKey)}
                        <span className="reconciliation-group-count">({groupProducts.length} productos)</span>
                      </td>
                    </tr>
                    {groupProducts.map(product => {
                      const stockDiff = getStockDifference(product.product_id);

                      return (
                        <tr key={product.product_id} className="reconciliation-row">
                          <td className="reconciliation-td reconciliation-td--product">
                            <span className="reconciliation-product-name">{product.product_name}</span>
                            <span className="reconciliation-product-code">{product.product_code}</span>
                          </td>
                          <td className="reconciliation-td reconciliation-td--category">
                            <span className={`reconciliation-category ${getProductTypeClass(product.product_type, product.balloon_type)}`}>
                              {getProductTypeLabel(product.product_type, product.balloon_type)}
                            </span>
                          </td>
                          <td className="reconciliation-td reconciliation-td--unit">
                            {product.unit_abbreviation || 'UND'}
                          </td>
                          <td className="reconciliation-td reconciliation-td--system">
                            {product.stock_system}
                          </td>
                          <td className="reconciliation-td reconciliation-td--real">
                            <input
                              type="number"
                              min="0"
                              value={realValues[product.product_id]?.stock_real ?? ''}
                              onChange={(e) => handleRealValueChange(product.product_id, e.target.value)}
                              className="reconciliation-input"
                            />
                          </td>
                          <td className={`reconciliation-td reconciliation-td--diff ${getDifferenceClass(stockDiff)}`}>
                            <span className="reconciliation-diff">
                              {stockDiff > 0 ? '+' : ''}{stockDiff}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedWarehouse && !loadingInventory && emptyContainers.length > 0 && (
        <div className="reconciliation-table-wrapper">
          <div className="reconciliation-section-title">
            Cuadre de Envases Vacios
          </div>
          <table className="reconciliation-table">
            <thead>
              <tr>
                <th className="reconciliation-th reconciliation-th--product">Tipo de Envase</th>
                <th className="reconciliation-th reconciliation-th--system">Vacios Sistema</th>
                <th className="reconciliation-th reconciliation-th--real">Vacios Real</th>
                <th className="reconciliation-th reconciliation-th--diff">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const containerTypes = [...new Set(emptyContainers.map(c => c.container_type))];
                return containerTypes.map(key => {
                  const systemTotal = emptyContainers
                    .filter(c => c.container_type === key)
                    .reduce((sum, c) => sum + c.empty_system, 0);
                  const emptyDiff = getEmptyDifference(key);

                  return (
                    <tr key={key} className="reconciliation-row">
                      <td className="reconciliation-td reconciliation-td--product">
                        <span className="reconciliation-product-name">
                          {CONTAINER_TYPE_LABELS[key] || key}
                        </span>
                      </td>
                      <td className="reconciliation-td reconciliation-td--system">
                        {systemTotal}
                      </td>
                      <td className="reconciliation-td reconciliation-td--real">
                        <input
                          type="number"
                          min="0"
                          value={emptyRealValues[key]?.empty_real ?? ''}
                          onChange={(e) => handleEmptyRealValueChange(key, e.target.value)}
                          className="reconciliation-input"
                        />
                      </td>
                      <td className={`reconciliation-td reconciliation-td--diff ${getDifferenceClass(emptyDiff)}`}>
                        <span className="reconciliation-diff">
                          {emptyDiff > 0 ? '+' : ''}{emptyDiff}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
