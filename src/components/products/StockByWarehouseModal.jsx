import { useState, useEffect } from 'react';
import { productWarehouseStockService } from '../../services/productWarehouseStockService';

export const StockByWarehouseModal = ({ product, onClose }) => {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product?.id) {
      loadWarehouseStock();
    }
  }, [product?.id]);

  const loadWarehouseStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productWarehouseStockService.getByProduct(product.id);
      setWarehouseStock(response.data || []);
    } catch (err) {
      console.error('Error al cargar stock por almacen:', err);
      setError('Error al cargar el stock por almacen');
    } finally {
      setLoading(false);
    }
  };

  const isEnvase = ['BALON_GAS', 'BIDON_AGUA'].includes(product?.product_type);

  const getTotalStock = () => {
    return warehouseStock.reduce((acc, ws) => ({
      available: acc.available + (ws.available_stock || 0)
    }), { available: 0 });
  };

  const totals = getTotalStock();

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stock-modal__header">
          <h3 className="stock-modal__title">
            Stock por Almacen
          </h3>
          <button onClick={onClose} className="stock-modal__close">
            &times;
          </button>
        </div>

        <div className="stock-modal__product-info">
          <span className="stock-modal__product-code">{product?.code}</span>
          <span className="stock-modal__product-name">{product?.name}</span>
        </div>

        <div className="stock-modal__body">
          {loading ? (
            <div className="stock-modal__loading">
              <div className="stock-modal__spinner"></div>
              <p>Cargando stock...</p>
            </div>
          ) : error ? (
            <div className="stock-modal__error">
              <p>{error}</p>
            </div>
          ) : warehouseStock.length === 0 ? (
            <div className="stock-modal__empty">
              <p>Este producto no tiene stock registrado en ningun almacen</p>
            </div>
          ) : (
            <>
              <table className="stock-modal__table">
                <thead>
                  <tr>
                    <th>Almacen</th>
                    <th>{isEnvase ? 'Llenos' : 'Stock'}</th>
                    <th>Stock Minimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseStock.map((ws) => {
                    const isLow = ws.available_stock <= ws.minimum_stock;
                    return (
                      <tr key={ws.warehouse_id} className={isLow ? 'stock-modal__row--low' : ''}>
                        <td>
                          <div className="stock-modal__warehouse">
                            <span className="stock-modal__warehouse-name">{ws.warehouse_name}</span>
                            {ws.is_main && (
                              <span className="stock-modal__warehouse-badge">Principal</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`stock-modal__stock ${isEnvase ? 'stock-modal__stock--full' : ''}`}>
                            {ws.available_stock || 0}
                          </span>
                        </td>
                        <td>{ws.minimum_stock || 5}</td>
                        <td>
                          <span className={`stock-modal__status ${isLow ? 'stock-modal__status--low' : 'stock-modal__status--ok'}`}>
                            {isLow ? 'Stock Bajo' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="stock-modal__totals">
                    <td><strong>TOTAL</strong></td>
                    <td><strong>{totals.available}</strong></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>

        <div className="stock-modal__footer">
          <button onClick={onClose} className="stock-modal__btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
