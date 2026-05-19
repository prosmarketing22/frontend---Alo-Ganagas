import { useState, useEffect, useMemo } from 'react';
import { productWarehouseStockService } from '../../services/productWarehouseStockService';

export const WarehouseStockTable = ({
  warehouseId,
  warehouseName,
  isGlobal = false,
  onEditProduct,
  refreshKey = 0
}) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  useEffect(() => {
    loadStocks();
  }, [warehouseId, isGlobal, refreshKey]);

  const loadStocks = async () => {
    setLoading(true);
    try {
      let response;
      if (isGlobal) {
        response = await productWarehouseStockService.getGlobalStock();
      } else {
        response = await productWarehouseStockService.getByWarehouse(warehouseId);
      }
      setStocks(response.data || []);
    } catch (err) {
      console.error('Error al cargar stock:', err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = !searchTerm ||
        stock.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.product_code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !typeFilter || stock.product_type === typeFilter;

      const matchesStockFilter = !stockFilter ||
        (stockFilter === 'low' && stock.is_low_stock) ||
        (stockFilter === 'normal' && !stock.is_low_stock);

      return matchesSearch && matchesType && matchesStockFilter;
    });
  }, [stocks, searchTerm, typeFilter, stockFilter]);

  const getProductTypeBadge = (type) => {
    const types = {
      BALON_GAS: { label: 'Balon', class: 'warehouse-stock-type-badge--balon' },
      BIDON_AGUA: { label: 'Bidon', class: 'warehouse-stock-type-badge--bidon' },
      ACCESORIO: { label: 'Accesorio', class: 'warehouse-stock-type-badge--accesorio' }
    };
    return types[type] || { label: type, class: '' };
  };

  const title = isGlobal ? 'Stock Global' : warehouseName;
  const icon = isGlobal ? '🌐' : '🏭';
  const subtitle = isGlobal
    ? 'Stock consolidado de todos los almacenes'
    : 'Stock disponible en este almacen';

  if (loading) {
    return (
      <div className="warehouse-stock-section">
        <div className="warehouse-stock-header">
          <h2 className="warehouse-stock-title">
            <span className="warehouse-stock-title-icon">{icon}</span>
            {title}
            <span className="warehouse-stock-subtitle">{subtitle}</span>
          </h2>
        </div>
        <div className="warehouse-stock-table-container">
          <div className="warehouse-stock-loading">
            <div className="warehouse-stock-loading-spinner"></div>
            <p>Cargando stock...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="warehouse-stock-section">
      <div className="warehouse-stock-header">
        <h2 className="warehouse-stock-title">
          <span className="warehouse-stock-title-icon">{icon}</span>
          {title}
          <span className="warehouse-stock-subtitle">{subtitle}</span>
        </h2>
        <div className="warehouse-stock-filters">
          <input
            type="text"
            className="warehouse-stock-search"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="warehouse-stock-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="BALON_GAS">Balones de Gas</option>
            <option value="BIDON_AGUA">Bidones de Agua</option>
            <option value="ACCESORIO">Accesorios</option>
          </select>
          <select
            className="warehouse-stock-filter-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">Todo el stock</option>
            <option value="low">Stock bajo</option>
            <option value="normal">Stock normal</option>
          </select>
        </div>
      </div>

      <div className="warehouse-stock-table-container">
        {filteredStocks.length === 0 ? (
          <div className="warehouse-stock-empty">
            <div className="warehouse-stock-empty-icon">📦</div>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <table className="warehouse-stock-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Producto</th>
                <th>Tipo</th>
                {isGlobal && <th>Almacen</th>}
                <th>Stock Lleno</th>
                <th>Minimo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, index) => {
                const typeBadge = getProductTypeBadge(stock.product_type);
                const isLow = stock.is_low_stock;

                return (
                  <tr
                    key={`${stock.product_id}-${stock.warehouse_id || index}`}
                    className={isLow ? 'low-stock-row' : ''}
                  >
                    <td>
                      <span className="warehouse-stock-product-code">
                        {stock.product_code}
                      </span>
                    </td>
                    <td>
                      <span className="warehouse-stock-product-name">
                        {stock.product_name}
                      </span>
                      {stock.balloon_type && (
                        <span className="products-badge--balloon-type">
                          ({stock.balloon_type})
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`warehouse-stock-type-badge ${typeBadge.class}`}>
                        {typeBadge.label}
                      </span>
                    </td>
                    {isGlobal && (
                      <td>
                        {stock.warehouse_name || '-'}
                        {stock.is_main && (
                          <span className="warehouse-card__badge" style={{ marginLeft: '8px' }}>
                            Principal
                          </span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className={`warehouse-stock-value ${isLow ? 'warehouse-stock-value--low' : 'warehouse-stock-value--full'}`}>
                        {parseFloat(stock.available_stock) % 1 === 0 ? parseInt(stock.available_stock) || 0 : parseFloat(stock.available_stock)?.toFixed(2) || 0}
                      </span>
                    </td>
                    <td>
                      <span className="warehouse-stock-minimum">
                        {parseFloat(stock.minimum_stock) % 1 === 0 ? parseInt(stock.minimum_stock) || 0 : parseFloat(stock.minimum_stock)?.toFixed(2) || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`warehouse-stock-status ${isLow ? 'warehouse-stock-status--low' : 'warehouse-stock-status--ok'}`}>
                        {isLow ? '⚠️ Bajo' : '✓ Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
