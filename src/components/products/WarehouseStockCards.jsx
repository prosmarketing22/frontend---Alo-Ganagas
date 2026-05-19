import { useState, useEffect, useMemo } from 'react';
import { productWarehouseStockService } from '../../services/productWarehouseStockService';
import { API_URL } from '../../config/api.config';

const formatStock = (value) => {
  const num = parseFloat(value) || 0;
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

export const WarehouseStockCards = ({
  warehouses,
  selectedWarehouseId,
  onSelectWarehouse,
  refreshKey = 0
}) => {
  const [warehouseSummaries, setWarehouseSummaries] = useState({});
  const [warehouseStocksByType, setWarehouseStocksByType] = useState({});
  const [globalStockData, setGlobalStockData] = useState([]);
  const [emptyStockData, setEmptyStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGlobalStock();
    loadEmptyStock();
  }, [refreshKey]);

  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      loadWarehouseSummaries();
    }
  }, [warehouses, emptyStockData]);

  const loadGlobalStock = async () => {
    try {
      const response = await productWarehouseStockService.getGlobalStock();
      setGlobalStockData(response.data || []);
    } catch (err) {
      console.error('Error al cargar stock global:', err);
      setGlobalStockData([]);
    }
  };

  const loadEmptyStock = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/empty-stock`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await response.json();
      setEmptyStockData(data.success ? (data.data || []) : []);
    } catch (err) {
      console.error('Error al cargar stock de vacios:', err);
      setEmptyStockData([]);
    }
  };

  const getEmptyByWarehouseAndType = (warehouseId, containerType) => {
    const items = emptyStockData.filter(e =>
      e.warehouse_id === warehouseId &&
      e.container_type === containerType
    );
    return items.reduce((sum, item) => sum + (item.empty_stock || 0), 0);
  };

  const getEmptyTotalByType = (containerType) => {
    return emptyStockData
      .filter(e => e.container_type === containerType)
      .reduce((sum, e) => sum + (e.empty_stock || 0), 0);
  };

  const loadWarehouseSummaries = async () => {
    setLoading(true);
    try {
      const summaries = {};
      const stocksByType = {};

      for (const warehouse of warehouses) {
        const response = await productWarehouseStockService.getByWarehouse(warehouse.id);
        const stocks = response.data || [];

        summaries[warehouse.id] = {
          totalProducts: stocks.length,
          totalAvailable: stocks.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
          lowStockCount: stocks.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
        };

        const balones = stocks.filter(s => s.product_type === 'BALON_GAS');
        const bidones = stocks.filter(s => s.product_type === 'BIDON_AGUA');
        const accesorios = stocks.filter(s => s.product_type === 'ACCESORIO');

        stocksByType[warehouse.id] = {
          balones: {
            available: balones.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
            empty: getEmptyByWarehouseAndType(warehouse.id, 'BALON_GAS'),
            lowStock: balones.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
          },
          bidones: {
            available: bidones.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
            empty: getEmptyByWarehouseAndType(warehouse.id, 'BIDON_AGUA'),
            lowStock: bidones.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
          },
          accesorios: {
            available: accesorios.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
            lowStock: accesorios.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
          }
        };
      }

      setWarehouseSummaries(summaries);
      setWarehouseStocksByType(stocksByType);
    } catch (err) {
      console.error('Error al cargar resumen de almacenes:', err);
    } finally {
      setLoading(false);
    }
  };

  const globalTotals = useMemo(() => {
    if (!globalStockData || !Array.isArray(globalStockData) || globalStockData.length === 0) {
      return {
        totalProducts: 0,
        totalAvailable: 0,
        lowStockCount: 0
      };
    }

    return {
      totalProducts: globalStockData.length,
      totalAvailable: globalStockData.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
      lowStockCount: globalStockData.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
    };
  }, [globalStockData]);

  const globalProductTypeTotals = useMemo(() => {
    const balones = globalStockData?.filter(s => s.product_type === 'BALON_GAS') || [];
    const bidones = globalStockData?.filter(s => s.product_type === 'BIDON_AGUA') || [];
    const accesorios = globalStockData?.filter(s => s.product_type === 'ACCESORIO') || [];

    return {
      balones: {
        available: balones.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
        empty: getEmptyTotalByType('BALON_GAS'),
        lowStock: balones.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
      },
      bidones: {
        available: bidones.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
        empty: getEmptyTotalByType('BIDON_AGUA'),
        lowStock: bidones.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
      },
      accesorios: {
        available: accesorios.reduce((sum, s) => sum + (parseFloat(s.available_stock) || 0), 0),
        lowStock: accesorios.filter(s => s.is_low_stock || parseFloat(s.available_stock) <= parseFloat(s.minimum_stock)).length
      }
    };
  }, [globalStockData, emptyStockData]);

  const productTypeTotals = useMemo(() => {
    if (selectedWarehouseId === 'global') {
      return globalProductTypeTotals;
    }

    return warehouseStocksByType[selectedWarehouseId] || {
      balones: { available: 0, empty: 0, lowStock: 0 },
      bidones: { available: 0, empty: 0, lowStock: 0 },
      accesorios: { available: 0, lowStock: 0 }
    };
  }, [selectedWarehouseId, globalProductTypeTotals, warehouseStocksByType]);

  const getSelectedWarehouseName = () => {
    if (selectedWarehouseId === 'global') return 'Stock Global';
    const warehouse = warehouses.find(w => w.id === selectedWarehouseId);
    return warehouse?.name || '';
  };

  return (
    <div className="warehouse-dashboard">
      {/* Cards de Stock por Tipo de Producto */}
      <div className="product-type-cards-section">
        <div className="product-type-cards-header">
          <h3 className="product-type-cards-title">
            {getSelectedWarehouseName()}
          </h3>
          {selectedWarehouseId !== 'global' && (
            <span className="product-type-cards-subtitle">
              Stock del almacen seleccionado
            </span>
          )}
        </div>
        <div className="product-type-cards">
          <div className="product-type-card product-type-card--balon">
            <div className="product-type-card__header">
              <span className="product-type-card__icon">🔵</span>
              <span className="product-type-card__title">Balones de Gas</span>
            </div>
          <div className="product-type-card__content">
            <div className="product-type-card__stat">
              <span className="product-type-card__stat-value product-type-card__stat-value--success">
                {formatStock(productTypeTotals.balones.available)}
              </span>
              <span className="product-type-card__stat-label">Llenos</span>
            </div>
            <div className="product-type-card__stat">
              <span className="product-type-card__stat-value product-type-card__stat-value--warning">
                {formatStock(productTypeTotals.balones.empty)}
              </span>
              <span className="product-type-card__stat-label">Vacíos</span>
            </div>
            {productTypeTotals.balones.lowStock > 0 && (
              <div className="product-type-card__alert">
                {productTypeTotals.balones.lowStock} bajo stock
              </div>
            )}
          </div>
        </div>

        <div className="product-type-card product-type-card--bidon">
          <div className="product-type-card__header">
            <span className="product-type-card__icon">💧</span>
            <span className="product-type-card__title">Bidones de Agua</span>
          </div>
          <div className="product-type-card__content">
            <div className="product-type-card__stat">
              <span className="product-type-card__stat-value product-type-card__stat-value--success">
                {formatStock(productTypeTotals.bidones.available)}
              </span>
              <span className="product-type-card__stat-label">Llenos</span>
            </div>
            <div className="product-type-card__stat">
              <span className="product-type-card__stat-value product-type-card__stat-value--warning">
                {formatStock(productTypeTotals.bidones.empty)}
              </span>
              <span className="product-type-card__stat-label">Vacios</span>
            </div>
            {productTypeTotals.bidones.lowStock > 0 && (
              <div className="product-type-card__alert">
                {productTypeTotals.bidones.lowStock} bajo stock
              </div>
            )}
          </div>
        </div>

        <div className="product-type-card product-type-card--accesorio">
          <div className="product-type-card__header">
            <span className="product-type-card__icon">🔧</span>
            <span className="product-type-card__title">Accesorios</span>
          </div>
          <div className="product-type-card__content">
            <div className="product-type-card__stat product-type-card__stat--single">
              <span className="product-type-card__stat-value product-type-card__stat-value--primary">
                {formatStock(productTypeTotals.accesorios.available)}
              </span>
              <span className="product-type-card__stat-label">Disponibles</span>
            </div>
            {productTypeTotals.accesorios.lowStock > 0 && (
              <div className="product-type-card__alert">
                {productTypeTotals.accesorios.lowStock} bajo stock
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Selectores de Almacén */}
      <div className="warehouse-selector-section">
        <h3 className="warehouse-selector-section__title">Seleccionar Almacen</h3>
        <div className="warehouse-selectors">
          <div
            className={`warehouse-selector ${selectedWarehouseId === 'global' ? 'warehouse-selector--selected' : ''}`}
            onClick={() => onSelectWarehouse('global')}
          >
            <span className="warehouse-selector__icon">🌐</span>
            <span className="warehouse-selector__name">Stock Global</span>
            <span className="warehouse-selector__count">{globalTotals.totalProducts} productos</span>
          </div>

          {warehouses.map((warehouse) => {
            const summary = warehouseSummaries[warehouse.id] || { totalProducts: 0 };

            return (
              <div
                key={warehouse.id}
                className={`warehouse-selector ${selectedWarehouseId === warehouse.id ? 'warehouse-selector--selected' : ''}`}
                onClick={() => onSelectWarehouse(warehouse.id)}
              >
                <span className="warehouse-selector__icon">🏭</span>
                <span className="warehouse-selector__name">
                  {warehouse.name}
                  {warehouse.is_main && <span className="warehouse-selector__badge">Principal</span>}
                </span>
                {loading ? (
                  <span className="warehouse-selector__count">...</span>
                ) : (
                  <span className="warehouse-selector__count">{summary.totalProducts} productos</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
