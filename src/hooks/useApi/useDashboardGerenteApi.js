import { useState, useCallback, useEffect } from 'react';
import { dashboardGerenteService } from '../../services/dashboardGerenteService';

export const useDashboardGerenteApi = () => {
  const [data, setData] = useState({
    kpis: null,
    ventasMensuales: [],
    operaciones: null,
    alertas: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDashboardCompleto = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardGerenteService.getDashboardCompleto();

      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.details || response.message || 'Error al cargar el dashboard');
      }
    } catch (err) {
      const errorMessage = err.data?.details || err.message || 'Error al cargar el dashboard';
      setError(errorMessage);
      console.error('Error en getDashboardCompleto:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getDashboardCompleto();
  }, [getDashboardCompleto]);

  return {
    data,
    loading,
    error,
    refresh: getDashboardCompleto
  };
};
