import { useState, useEffect } from 'react';
import { useProfitReportApi } from '../../hooks/useApi/useProfitReportApi';
import './ProfitReportPage.css';

export const ProfitReportPage = () => {
  const { data, loading, error, getAll, pagination } = useProfitReportApi();
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    product_type: ''
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getAll(filters);
    setIsInitialLoad(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({ date_from: '', date_to: '', product_type: '' });
    setTimeout(() => getAll({}), 0);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value || 0);
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value) => {
    return parseInt(value || 0).toLocaleString('es-PE');
  };

  const getProductTypeLabel = (type) => {
    const labels = {
      'BALON_GAS': 'Balones de Gas',
      'BIDON_AGUA': 'Bidones de Agua',
      'ACCESORIO': 'Accesorios'
    };
    return labels[type] || type;
  };

  const getProfitClass = (value) => {
    const num = parseFloat(value || 0);
    if (num > 0) return 'profit-positive';
    if (num < 0) return 'profit-negative';
    return 'profit-neutral';
  };

  if (error) {
    return (
      <div className="profit-report">
        <div className="profit-report__error">
          <div className="profit-report__error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Error al cargar los reportes</h3>
          <p>{error}</p>
          <button onClick={loadData} className="profit-report__retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profit-report">
      <div className="profit-report__container">
        {/* Header */}
        <header className="profit-report__header">
          <div className="profit-report__header-content">
            <div className="profit-report__title-group">
              <span className="profit-report__badge">Gerencia</span>
              <h1 className="profit-report__title">Reportes de Utilidad</h1>
              <p className="profit-report__subtitle">
                Analisis de rentabilidad por producto, marca y categoria
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="profit-report__refresh-btn"
            >
              <svg className={loading ? 'spinning' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </header>

        {/* Filters */}
        <section className="profit-report__filters">
          <form onSubmit={handleApplyFilters} className="profit-report__filters-form">
            <div className="profit-report__filter-group">
              <label className="profit-report__filter-label">Desde</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="profit-report__filter-input"
              />
            </div>
            <div className="profit-report__filter-group">
              <label className="profit-report__filter-label">Hasta</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="profit-report__filter-input"
              />
            </div>
            <div className="profit-report__filter-group">
              <label className="profit-report__filter-label">Tipo de Producto</label>
              <select
                name="product_type"
                value={filters.product_type}
                onChange={handleFilterChange}
                className="profit-report__filter-select"
              >
                <option value="">Todos los tipos</option>
                <option value="BALON_GAS">Balones de Gas</option>
                <option value="BIDON_AGUA">Bidones de Agua</option>
                <option value="ACCESORIO">Accesorios</option>
              </select>
            </div>
            <div className="profit-report__filter-actions">
              <button type="submit" className="profit-report__filter-btn profit-report__filter-btn--primary" disabled={loading}>
                Aplicar Filtros
              </button>
              <button type="button" onClick={handleClearFilters} className="profit-report__filter-btn profit-report__filter-btn--secondary">
                Limpiar
              </button>
            </div>
          </form>
        </section>

        {/* Summary Cards */}
        <section className="profit-report__summary">
          <div className="profit-report__summary-grid">
            <div className="profit-report__summary-card profit-report__summary-card--revenue">
              <div className="profit-report__summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div className="profit-report__summary-content">
                <span className="profit-report__summary-label">Ventas Totales</span>
                <span className="profit-report__summary-value">
                  {loading && isInitialLoad ? (
                    <span className="profit-report__skeleton" />
                  ) : (
                    formatCurrency(data.summary?.total_revenue)
                  )}
                </span>
                <span className="profit-report__summary-detail">
                  {formatNumber(data.summary?.order_count)} pedidos
                </span>
              </div>
            </div>

            <div className="profit-report__summary-card profit-report__summary-card--cost">
              <div className="profit-report__summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <div className="profit-report__summary-content">
                <span className="profit-report__summary-label">Costo Total</span>
                <span className="profit-report__summary-value">
                  {loading && isInitialLoad ? (
                    <span className="profit-report__skeleton" />
                  ) : (
                    formatCurrency(data.summary?.total_cost)
                  )}
                </span>
                <span className="profit-report__summary-detail">
                  {formatNumber(data.summary?.total_units_sold)} unidades
                </span>
              </div>
            </div>

            <div className="profit-report__summary-card profit-report__summary-card--profit">
              <div className="profit-report__summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 6l-9.5 9.5-5-5L1 18" />
                  <path d="M17 6h6v6" />
                </svg>
              </div>
              <div className="profit-report__summary-content">
                <span className="profit-report__summary-label">Utilidad Total</span>
                <span className={`profit-report__summary-value ${getProfitClass(data.summary?.total_profit)}`}>
                  {loading && isInitialLoad ? (
                    <span className="profit-report__skeleton" />
                  ) : (
                    formatCurrency(data.summary?.total_profit)
                  )}
                </span>
                <span className="profit-report__summary-detail">
                  {data.summary?.products_sold || 0} productos vendidos
                </span>
              </div>
            </div>

            <div className="profit-report__summary-card profit-report__summary-card--margin">
              <div className="profit-report__summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="profit-report__summary-content">
                <span className="profit-report__summary-label">Margen de Utilidad</span>
                <span className={`profit-report__summary-value ${getProfitClass(data.summary?.profit_margin_percent)}`}>
                  {loading && isInitialLoad ? (
                    <span className="profit-report__skeleton" />
                  ) : (
                    `${parseFloat(data.summary?.profit_margin_percent || 0).toFixed(1)}%`
                  )}
                </span>
                <span className="profit-report__summary-detail">
                  Porcentaje sobre ventas
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Table */}
        <section className="profit-report__section">
          <div className="profit-report__section-header">
            <h2 className="profit-report__section-title">Utilidad por Producto</h2>
            <span className="profit-report__section-count">
              {data.byProduct?.length || 0} productos
            </span>
          </div>

          <div className="profit-report__table-wrapper">
            <table className="profit-report__table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Marca</th>
                  <th>Tipo</th>
                  <th className="text-right">Unidades</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-right">Costo</th>
                  <th className="text-right">Utilidad</th>
                  <th className="text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {loading && isInitialLoad ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="profit-report__table-skeleton">
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                      <td><span className="profit-report__skeleton" /></td>
                    </tr>
                  ))
                ) : data.byProduct?.length > 0 ? (
                  data.byProduct.map((row, index) => (
                    <tr key={row.product_id || index}>
                      <td className="profit-report__product-name">{row.product_name}</td>
                      <td>
                        <span className="profit-report__brand-badge">{row.brand_name}</span>
                      </td>
                      <td>
                        <span className={`profit-report__type-badge profit-report__type-badge--${row.product_type?.toLowerCase()}`}>
                          {getProductTypeLabel(row.product_type)}
                        </span>
                      </td>
                      <td className="text-right">{formatNumber(row.total_quantity_sold)}</td>
                      <td className="text-right">{formatCurrency(row.total_revenue)}</td>
                      <td className="text-right">{formatCurrency(row.total_cost)}</td>
                      <td className={`text-right ${getProfitClass(row.total_profit)}`}>
                        {formatCurrency(row.total_profit)}
                      </td>
                      <td className={`text-right ${getProfitClass(row.profit_margin_percent)}`}>
                        <span className="profit-report__margin-value">
                          {parseFloat(row.profit_margin_percent || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="profit-report__empty">
                      No hay datos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
              {filters.product_type && data.byProduct?.length > 0 && (
                <tfoot>
                  <tr className="profit-report__table-totals">
                    <td colSpan="3" className="profit-report__totals-label">
                      Total {getProductTypeLabel(filters.product_type)}
                    </td>
                    <td className="text-right">
                      {formatNumber(data.byProduct.reduce((sum, row) => sum + parseInt(row.total_quantity_sold || 0), 0))}
                    </td>
                    <td className="text-right">
                      {formatCurrency(data.byProduct.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0))}
                    </td>
                    <td className="text-right">
                      {formatCurrency(data.byProduct.reduce((sum, row) => sum + parseFloat(row.total_cost || 0), 0))}
                    </td>
                    <td className={`text-right ${getProfitClass(data.byProduct.reduce((sum, row) => sum + parseFloat(row.total_profit || 0), 0))}`}>
                      {formatCurrency(data.byProduct.reduce((sum, row) => sum + parseFloat(row.total_profit || 0), 0))}
                    </td>
                    <td className="text-right"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* Brands Section */}
        <section className="profit-report__section">
          <div className="profit-report__section-header">
            <h2 className="profit-report__section-title">Utilidad por Marca</h2>
            <span className="profit-report__section-count">
              {data.byBrand?.length || 0} marcas
            </span>
          </div>

          <div className="profit-report__brands-grid">
            {loading && isInitialLoad ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="profit-report__brand-card profit-report__brand-card--skeleton">
                  <div className="profit-report__skeleton profit-report__skeleton--title" />
                  <div className="profit-report__skeleton profit-report__skeleton--value" />
                  <div className="profit-report__skeleton profit-report__skeleton--detail" />
                </div>
              ))
            ) : data.byBrand?.length > 0 ? (
              data.byBrand.map((brand, index) => (
                <div key={brand.brand_id || index} className="profit-report__brand-card">
                  <div className="profit-report__brand-header">
                    <h3 className="profit-report__brand-name">{brand.brand_name}</h3>
                    <span className="profit-report__brand-products">
                      {brand.product_count} productos
                    </span>
                  </div>
                  <div className="profit-report__brand-stats">
                    <div className="profit-report__brand-stat">
                      <span className="profit-report__brand-stat-label">Ventas</span>
                      <span className="profit-report__brand-stat-value">{formatCurrency(brand.total_revenue)}</span>
                    </div>
                    <div className="profit-report__brand-stat">
                      <span className="profit-report__brand-stat-label">Utilidad</span>
                      <span className={`profit-report__brand-stat-value ${getProfitClass(brand.total_profit)}`}>
                        {formatCurrency(brand.total_profit)}
                      </span>
                    </div>
                  </div>
                  <div className="profit-report__brand-footer">
                    <div className="profit-report__brand-margin">
                      <span className="profit-report__brand-margin-label">Margen</span>
                      <span className={`profit-report__brand-margin-value ${getProfitClass(brand.profit_margin_percent)}`}>
                        {parseFloat(brand.profit_margin_percent || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="profit-report__brand-progress">
                      <div
                        className={`profit-report__brand-progress-bar ${getProfitClass(brand.profit_margin_percent)}`}
                        style={{ width: `${Math.min(Math.abs(parseFloat(brand.profit_margin_percent || 0)), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="profit-report__empty-brands">
                No hay datos de marcas para mostrar
              </div>
            )}
          </div>
        </section>

        {/* Type Summary */}
        {data.byType?.length > 0 && (
          <section className="profit-report__section">
            <div className="profit-report__section-header">
              <h2 className="profit-report__section-title">Resumen por Tipo de Producto</h2>
            </div>
            <div className="profit-report__type-grid">
              {data.byType.map((type, index) => (
                <div key={type.product_type || index} className={`profit-report__type-card profit-report__type-card--${type.product_type?.toLowerCase()}`}>
                  <div className="profit-report__type-header">
                    <span className="profit-report__type-name">{getProductTypeLabel(type.product_type)}</span>
                    <span className="profit-report__type-count">{type.product_count} productos</span>
                  </div>
                  <div className="profit-report__type-body">
                    <div className="profit-report__type-metric">
                      <span className="profit-report__type-metric-label">Ventas</span>
                      <span className="profit-report__type-metric-value">{formatCurrency(type.total_revenue)}</span>
                    </div>
                    <div className="profit-report__type-metric">
                      <span className="profit-report__type-metric-label">Utilidad</span>
                      <span className={`profit-report__type-metric-value ${getProfitClass(type.total_profit)}`}>
                        {formatCurrency(type.total_profit)}
                      </span>
                    </div>
                    <div className="profit-report__type-metric">
                      <span className="profit-report__type-metric-label">Margen</span>
                      <span className={`profit-report__type-metric-value ${getProfitClass(type.profit_margin_percent)}`}>
                        {parseFloat(type.profit_margin_percent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfitReportPage;
