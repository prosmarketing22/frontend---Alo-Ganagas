export const StockWidget = ({ products = [], warehouseName = 'Almacen Principal', loading }) => {
  const getStockStatusConfig = (product) => {
    const available = product.available_stock || product.available || 0;
    const minimum = product.minimum_stock || 5;

    if (available === 0) {
      return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', label: 'Agotado' };
    }
    if (available <= minimum) {
      return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'Bajo' };
    }
    return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', label: 'Normal' };
  };

  const totalStock = products.reduce((sum, product) => {
    return sum + (product.available_stock || product.available || 0);
  }, 0);

  const criticalCount = products.filter(p => (p.available_stock || p.available || 0) === 0).length;

  return (
    <div className="widget-card">
      <div className="widget-card__header">
        <h3 className="widget-card__title">
          <span className="widget-card__title-icon" style={{
            background: products.length > 0
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #1e8cff 0%, #0050ff 100%)'
          }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          Stock Bajo
        </h3>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {warehouseName}
        </div>
      </div>

      <div className="widget-card__content" style={{ padding: products.length > 0 ? '0' : undefined }}>
        {loading ? (
          <div className="widget-loading">
            <div className="widget-loading__spinner"></div>
            <span className="widget-loading__text">Cargando...</span>
          </div>
        ) : products.length > 0 ? (
          <>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {products.map((product, index) => {
                const config = getStockStatusConfig(product);
                const available = product.available_stock || product.available || 0;
                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      borderBottom: index < products.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.name}
                      </p>
                      <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        {product.brand_name || 'Sin marca'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: config.color
                      }}>
                        {available}
                      </span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        background: config.bg,
                        color: config.color,
                        textTransform: 'uppercase'
                      }}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Footer */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '16px 20px',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{
                padding: '12px',
                background: 'white',
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e8cff' }}>
                  {totalStock}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.6875rem', color: '#6b7280', textTransform: 'uppercase' }}>
                  Unidades
                </p>
              </div>
              <div style={{
                padding: '12px',
                background: 'white',
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>
                  {criticalCount}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.6875rem', color: '#6b7280', textTransform: 'uppercase' }}>
                  Agotados
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="widget-empty">
            <div className="widget-empty__icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <svg fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="widget-empty__title" style={{ color: '#10b981' }}>Stock saludable</h4>
            <p className="widget-empty__description">Todos los productos tienen stock suficiente</p>
          </div>
        )}
      </div>
    </div>
  );
};
