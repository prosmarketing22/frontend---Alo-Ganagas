import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const GraficoVentasMensuales = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grafico-ventas">
        <h2 className="grafico-ventas__titulo">Ventas Mensuales</h2>
        <div className="grafico-ventas__loading">
          <div className="grafico-ventas__spinner"></div>
          <p className="grafico-ventas__loading-text">Cargando grafico...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="grafico-ventas">
        <h2 className="grafico-ventas__titulo">Ventas Mensuales</h2>
        <div className="grafico-ventas__empty">
          <p className="grafico-ventas__empty-text">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    mes: item.mes_nombre,
    ventas: parseFloat(item.total_ventas),
    pedidos: item.cantidad_pedidos
  }));

  const formatCurrency = (value) => {
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            {payload[0].payload.mes}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: 500 }}>
            Ventas: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Pedidos: {payload[0].payload.pedidos}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grafico-ventas">
      <div className="grafico-ventas__header">
        <h2 className="grafico-ventas__titulo">Ventas Mensuales</h2>
        <div className="grafico-ventas__leyenda">
          <div className="grafico-ventas__leyenda-dot"></div>
          <span>Tendencia de ventas</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorVentas)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
