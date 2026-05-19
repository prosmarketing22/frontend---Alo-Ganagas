import { useState, useMemo } from 'react';

const COLUMNS = [
  { key: 'date_time_register', label: 'Fecha' },
  { key: 'warehouse_name', label: 'Almacén' },
  { key: 'product_name', label: 'Producto' },
  { key: 'display_type', label: 'Tipo' },
  { key: 'quantity', label: 'Cantidad', numeric: true },
  { key: 'previous_stock', label: 'Stock Anterior', numeric: true },
  { key: 'new_stock', label: 'Stock Nuevo', numeric: true },
  { key: 'reason', label: 'Motivo' },
  { key: 'registered_by_name', label: 'Responsable' },
  { key: 'reference_document', label: 'Documento' },
];

export const MovementTable = ({ data, loading }) => {
  const [sortKey, setSortKey] = useState('date_time_register');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'date_time_register' ? 'desc' : 'asc');
    }
  };

  // Determinar el tipo de movimiento para mostrar
  const getDisplayType = (movement) => {
    const { movement_type, order_id, destination_warehouse_id } = movement;
    if (movement_type === 'TRANSFERENCIA' || destination_warehouse_id) return 'TRANSFERENCIA';
    if (movement_type === 'SALIDA' && order_id) return 'VENTA';
    if (movement_type === 'AJUSTE') return 'AJUSTE';
    return movement_type;
  };

  const getTipoMovimientoLabel = (movement) => {
    const displayType = getDisplayType(movement);
    const labels = {
      ENTRADA: 'Entrada',
      SALIDA: 'Salida',
      VENTA: 'Venta',
      AJUSTE: 'Ajuste',
      TRANSFERENCIA: 'Transferencia'
    };
    return labels[displayType] || displayType || '-';
  };

  const getTipoMovimientoBadge = (movement) => {
    const displayType = getDisplayType(movement);
    const badges = {
      ENTRADA: 'inventory-badge--entrada',
      SALIDA: 'inventory-badge--salida',
      VENTA: 'inventory-badge--venta',
      AJUSTE: 'inventory-badge--ajuste',
      TRANSFERENCIA: 'inventory-badge--transferencia'
    };
    return badges[displayType] || '';
  };

  const getTipoMovimientoIcon = (movement) => {
    const displayType = getDisplayType(movement);
    const icons = {
      ENTRADA: '📥',
      SALIDA: '📤',
      VENTA: '🛒',
      AJUSTE: '⚖️',
      TRANSFERENCIA: '🔄'
    };
    return icons[displayType] || '📋';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getSortValue = (movement, key) => {
    switch (key) {
      case 'display_type':
        return getDisplayType(movement) || '';
      case 'quantity':
        return (movement.quantity_full || 0) + (movement.quantity_empty || 0) + (movement.quantity || 0);
      case 'date_time_register':
        return movement.date_time_register ? new Date(movement.date_time_register).getTime() : 0;
      default:
        return movement[key] ?? '';
    }
  };

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => {
      const valA = getSortValue(a, sortKey);
      const valB = getSortValue(b, sortKey);
      const col = COLUMNS.find(c => c.key === sortKey);

      let cmp;
      if (col?.numeric || typeof valA === 'number') {
        cmp = (valA || 0) - (valB || 0);
      } else {
        cmp = String(valA).localeCompare(String(valB), 'es', { sensitivity: 'base' });
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) {
      return <span className="inventory-sort-icon inventory-sort-icon--inactive">⇅</span>;
    }
    return (
      <span className="inventory-sort-icon inventory-sort-icon--active">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="inventory-table-container">
        <div className="inventory-table-loading">
          <div className="inventory-loading-spinner"></div>
          <p className="inventory-loading-text">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="inventory-table-container">
        <div className="inventory-table-empty">
          <div className="inventory-empty-icon">📦</div>
          <p className="inventory-empty-text">No se encontraron movimientos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-table-container">
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="inventory-th--sortable"
                >
                  {col.label}
                  <SortIcon columnKey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((movement) => (
              <tr key={movement.id}>
                <td>
                  <span className="inventory-table-date">{formatDate(movement.date_time_register)}</span>
                </td>
                <td>
                  <span className="inventory-table-warehouse">{movement.warehouse_name || '-'}</span>
                </td>
                <td>
                  <div className="inventory-table-product">
                    <div className="inventory-table-product-name">{movement.product_name || '-'}</div>
                    <div className="inventory-table-product-code">{movement.product_code || '-'}</div>
                  </div>
                </td>
                <td>
                  <span className={`inventory-badge ${getTipoMovimientoBadge(movement)}`}>
                    <span className="inventory-badge__icon">{getTipoMovimientoIcon(movement)}</span>
                    {getTipoMovimientoLabel(movement)}
                  </span>
                </td>
                <td>
                  <div className="inventory-table-quantity">
                    {movement.quantity_full > 0 && (
                      <div className="inventory-quantity-item inventory-quantity-item--full">
                        Llenos: {movement.quantity_full}
                      </div>
                    )}
                    {movement.quantity_empty > 0 && (
                      <div className="inventory-quantity-item inventory-quantity-item--empty">
                        Vacíos: {movement.quantity_empty}
                      </div>
                    )}
                    {(!movement.quantity_full || movement.quantity_full === 0) &&
                     (!movement.quantity_empty || movement.quantity_empty === 0) && (
                      <div className="inventory-quantity-item">
                        {movement.quantity || 0}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="inventory-table-stock">{movement.previous_stock ?? 0}</span>
                </td>
                <td>
                  <span className="inventory-table-stock inventory-table-stock--new">{movement.new_stock ?? 0}</span>
                </td>
                <td>
                  <span className="inventory-table-motivo">{movement.reason || '-'}</span>
                </td>
                <td>
                  <span className="inventory-table-responsible">{movement.registered_by_name || '-'}</span>
                </td>
                <td>
                  <span className="inventory-table-doc">{movement.reference_document || '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
