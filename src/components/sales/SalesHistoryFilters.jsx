import '../../styles/components/salesHistory.css';

export const SalesHistoryFilters = ({ filters, onChange, onReset }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="sales-filters">
      <div className="sales-filter-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span className="sales-filter-title">Filtros de Búsqueda</span>
      </div>

      <div className="sales-filter-grid">
        <div className="sales-filter-group">
          <label className="sales-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar
          </label>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder="Buscar por orden, cliente, DNI, dirección, repartidor, producto, monto..."
            className="sales-filter-input"
          />
        </div>

        <div className="sales-filter-group">
          <label className="sales-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Fecha Inicio
          </label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date || ''}
            onChange={handleInputChange}
            className="sales-filter-input"
          />
        </div>

        <div className="sales-filter-group">
          <label className="sales-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Fecha Fin
          </label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date || ''}
            onChange={handleInputChange}
            className="sales-filter-input"
          />
        </div>

        <div className="sales-filter-group">
          <label className="sales-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Estado Pedido
          </label>
          <select
            name="status"
            value={filters.status || ''}
            onChange={handleInputChange}
            className="sales-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="EN_CAMINO">En Camino</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div className="sales-filter-group">
          <label className="sales-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Estado de Pago
          </label>
          <select
            name="payment_status"
            value={filters.payment_status || ''}
            onChange={handleInputChange}
            className="sales-filter-select"
          >
            <option value="">Todos los pagos</option>
            <option value="paid">Pagados</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
      </div>

      <div className="sales-filter-actions">
        <button className="sales-btn sales-btn--secondary" onClick={onReset}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};
