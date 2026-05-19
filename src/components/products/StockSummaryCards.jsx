import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api.config';

export const StockSummaryCards = ({ summary, loading, warehouseCount = 0 }) => {
  const [emptyStockData, setEmptyStockData] = useState([]);

  useEffect(() => {
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
    loadEmptyStock();
  }, []);

  if (loading) {
    return (
      <div className="stock-summary">
        <div className="stock-summary-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="stock-card stock-card--loading">
              <div className="stock-card-skeleton">
                <div className="stock-card-skeleton-label"></div>
                <div className="stock-card-skeleton-value"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary || !Array.isArray(summary)) {
    return null;
  }

  const totalAvailable = summary.reduce((sum, w) => sum + (parseFloat(w.total_available) || 0), 0);
  const totalLowStock = summary.reduce((sum, w) => sum + (parseFloat(w.low_stock_count) || 0), 0);

  const totalEmptyBalones = emptyStockData
    .filter(e => e.container_type === 'BALON_GAS')
    .reduce((sum, e) => sum + (e.empty_stock || 0), 0);

  const totalEmptyBidones = emptyStockData
    .filter(e => e.container_type === 'BIDON_AGUA')
    .reduce((sum, e) => sum + (e.empty_stock || 0), 0);

  const cards = [
    {
      title: 'Stock Total Llenos',
      value: totalAvailable,
      icon: '🔵',
      className: 'stock-card--balones-llenos'
    },
    {
      title: 'Balones Vacíos',
      value: totalEmptyBalones,
      icon: '⚪',
      className: 'stock-card--balones-vacios'
    },
    {
      title: 'Bidones Vacíos',
      value: totalEmptyBidones,
      icon: '💧',
      className: 'stock-card--bidones'
    },
    {
      title: 'Almacenes',
      value: warehouseCount,
      icon: '🏭',
      className: 'stock-card--accesorios'
    }
  ];

  const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

  return (
    <div className="stock-summary">
      <div className="stock-summary-grid">
        {cards.map((card, index) => (
          <div key={index} className={`stock-card ${card.className}`}>
            <div className="stock-card-content">
              <div className="stock-card-info">
                <p className="stock-card-label">{card.title}</p>
                <p className="stock-card-value">{formatStock(card.value)}</p>
              </div>
              <div className="stock-card-icon">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {totalLowStock > 0 && (
        <div className="stock-alert">
          <span className="stock-alert-icon">⚠️</span>
          <span className="stock-alert-text">
            {totalLowStock} producto(s) con stock bajo el minimo
          </span>
        </div>
      )}
    </div>
  );
};
