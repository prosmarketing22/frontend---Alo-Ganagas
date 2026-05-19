import { useAuth } from '../../features/auth/useAuth';
import { useDashboardGerenteApi } from '../../hooks/useApi/useDashboardGerenteApi';
import {
  KPICard,
  GraficoVentasMensuales,
  OperacionesPendientes,
  AccionesEjecutivas
} from '../../components/dashboard-gerente';
import './DashboardGerentePage.css';

export const DashboardGerentePage = () => {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useDashboardGerenteApi();

  const formatCurrency = (value) => {
    const num = parseFloat(value || 0);
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value || 0).toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="dashboard-gerente__error">
        <div className="dashboard-gerente__error-card">
          <div className="dashboard-gerente__error-icon-wrapper">
            <div className="dashboard-gerente__error-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="dashboard-gerente__error-titulo">Error al cargar el dashboard</h3>
          <p className="dashboard-gerente__error-mensaje">{error}</p>
          <button onClick={refresh} className="dashboard-gerente__error-boton">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-gerente">
      <div className="dashboard-gerente__container">
        <div className="dashboard-gerente__header">
          <div>
            <h1 className="dashboard-gerente__title">KPIs Ejecutivos</h1>
            <p className="dashboard-gerente__subtitle">Metricas clave del negocio en tiempo real</p>
            <p className="dashboard-gerente__user-name">
              Bienvenido, {user?.full_name?.split(' ')[0] || 'Usuario'}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="dashboard-gerente__refresh-btn"
          >
            <svg
              className={loading ? 'spinning' : ''}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>

        {loading && !data.kpis ? (
          <div className="dashboard-gerente__kpis">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="kpi-card" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <div style={{ height: '3rem', background: '#e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }}></div>
                <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }}></div>
                <div style={{ height: '2rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '50%' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="dashboard-gerente__kpis">
              <KPICard
                titulo="Ventas del Mes"
                valor={formatCurrency(data.kpis?.ventas_mes)}
                subtitulo={`${data.kpis?.cantidad_pedidos || 0} pedidos`}
                color="verde"
                icono={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                tendencia={
                  data.kpis?.crecimiento_porcentaje > 0
                    ? { tipo: 'up', valor: `+${formatPercentage(data.kpis.crecimiento_porcentaje)}` }
                    : null
                }
              />

              <KPICard
                titulo="Crecimiento"
                valor={formatPercentage(data.kpis?.crecimiento_porcentaje)}
                subtitulo="vs mes anterior"
                color="verde"
                icono={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />

              <KPICard
                titulo="Clientes Activos"
                valor={data.kpis?.clientes_activos || 0}
                subtitulo={`${formatPercentage(data.kpis?.porcentaje_clientes_activos)} del total`}
                color="morado"
                icono={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />

              <KPICard
                titulo="Alertas"
                valor={
                  (data.alertas?.pedidos_sin_atender?.length || 0) +
                  (data.alertas?.stock_critico?.length || 0) +
                  (data.alertas?.deudas_altas?.length || 0)
                }
                subtitulo="Requieren atencion"
                color="naranja"
                icono={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
              />
            </div>

            <div className="dashboard-gerente__grafico">
              <GraficoVentasMensuales data={data.ventasMensuales} loading={loading} />
            </div>

            <div className="dashboard-gerente__bottom-grid">
              <OperacionesPendientes operaciones={data.operaciones} loading={loading} />
              <AccionesEjecutivas />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardGerentePage;
