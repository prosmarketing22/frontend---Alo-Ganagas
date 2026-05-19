import { apiClient } from './apiClient';

class DashboardGerenteService {
  async getDashboardCompleto() {
    return apiClient.get('/dashboard-gerente');
  }

  async getKPIs() {
    return apiClient.get('/dashboard-gerente/kpis');
  }

  async getVentasMensuales() {
    return apiClient.get('/dashboard-gerente/ventas-mensuales');
  }

  async getOperaciones() {
    return apiClient.get('/dashboard-gerente/operaciones');
  }

  async getAlertas() {
    return apiClient.get('/dashboard-gerente/alertas');
  }
}

export const dashboardGerenteService = new DashboardGerenteService();
