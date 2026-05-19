export const ProductTable = ({ data, onEdit, onDelete, onViewStock, loading, readOnly = false }) => {
  const getProductTypeLabel = (type) => {
    const types = {
      BALON_GAS: 'Balon de Gas',
      BIDON_AGUA: 'Bidon de Agua',
      ACCESORIO: 'Accesorio'
    };
    return types[type] || type;
  };

  const getProductTypeBadge = (type) => {
    const badges = {
      BALON_GAS: 'products-badge--balon',
      BIDON_AGUA: 'products-badge--bidon',
      ACCESORIO: 'products-badge--accesorio'
    };
    return badges[type] || '';
  };

  const getStockDisplay = (product) => {
    const handleClick = (e) => {
      e.stopPropagation();
      if (onViewStock) {
        onViewStock(product);
      }
    };

    const fmtStock = (val) => {
      const num = parseFloat(val) || 0;
      return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    };

    if (product.product_type === 'ACCESORIO') {
      const isLow = parseFloat(product.available_stock) < parseFloat(product.minimum_stock);
      const unitAbbr = product.unit_abbreviation || 'und';
      return (
        <div
          className="products-stock-clickable"
          onClick={handleClick}
          title="Ver stock por almacen"
        >
          <span className={`products-stock-single ${isLow ? 'products-stock-single--low' : ''}`}>
            {fmtStock(product.available_stock)} {unitAbbr}
          </span>
          <span className="products-stock-view-detail">Ver detalle</span>
        </div>
      );
    }

    return (
      <div
        className="products-stock-clickable"
        onClick={handleClick}
        title="Ver stock por almacen"
      >
        <div className="products-stock">
          <span className="products-stock-item products-stock-item--full">
            Llenos: {fmtStock(product.available_stock)}
          </span>
        </div>
        <span className="products-stock-view-detail">Ver detalle</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-table-container">
        <div className="products-table-loading">
          <div className="products-loading-spinner"></div>
          <p className="products-loading-text">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="products-table-container">
        <div className="products-table-empty">
          <div className="products-empty-icon">📦</div>
          <p className="products-empty-text">No se encontraron productos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-table-container">
      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Almacén</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Estado</th>
              {!readOnly && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product.id}>
                <td>
                  <span className="products-table-code">{product.code}</span>
                </td>
                <td>
                  <div className="products-table-name">{product.name}</div>
                  {product.description && (
                    <div className="products-table-description">{product.description}</div>
                  )}
                </td>
                <td>
                  <span className={`products-badge ${getProductTypeBadge(product.product_type)}`}>
                    {getProductTypeLabel(product.product_type)}
                  </span>
                  {product.balloon_type && (
                    <span className="products-badge--balloon-type">({product.balloon_type})</span>
                  )}
                </td>
                <td>{product.brand_name || '-'}</td>
                <td>{product.warehouse_name || '-'}</td>
                <td>
                  <span className="products-table-price">
                    S/ {product.sale_price ? Number(product.sale_price).toFixed(2) : '0.00'}
                  </span>
                </td>
                <td>{getStockDisplay(product)}</td>
                <td>
                  <span className={`products-status ${product.status === 'active' ? 'products-status--active' : 'products-status--inactive'}`}>
                    {product.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {!readOnly && (
                  <td>
                    <div className="products-table-actions">
                      <button
                        onClick={() => onEdit(product)}
                        className="products-action-btn products-action-btn--edit"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="products-action-btn products-action-btn--delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
