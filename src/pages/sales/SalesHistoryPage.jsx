import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useSalesHistoryApi } from '../../hooks/useApi/useSalesHistoryApi';
import { SalesHistoryFilters } from '../../components/sales/SalesHistoryFilters';
import { SalesSummaryCard } from '../../components/sales/SalesSummaryCard';
import { SalesHistoryTable } from '../../components/sales/SalesHistoryTable';
import '../../styles/components/salesHistory.css';

export const SalesHistoryPage = () => {
  const navigate = useNavigate();
  const { data, summary, loading, pagination, fetchSales, fetchSummary, exportToExcel } = useSalesHistoryApi();

  const [filters, setFilters] = useState({
    search: '',
    start_date: '',
    end_date: '',
    status: '',
    payment_status: '',
    page: 1,
    limit: 10
  });

  const [exporting, setExporting] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    // Debounce para el campo de búsqueda
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      loadData();
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.search, filters.start_date, filters.end_date, filters.status, filters.payment_status]);

  // Cargar datos inicial
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchSales({ ...filters, page: 1 }),
        fetchSummary({
          start_date: filters.start_date,
          end_date: filters.end_date
        })
      ]);
    } catch (error) {
      console.error('Error loading sales history:', error);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      start_date: '',
      end_date: '',
      status: '',
      payment_status: '',
      page: 1,
      limit: 10
    };
    setFilters(resetFilters);
    fetchSales(resetFilters);
    fetchSummary({});
  };

  const handleViewSale = (sale) => {
    navigate(`/orders/${sale.id}`);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportToExcel({
        start_date: filters.start_date,
        end_date: filters.end_date,
        status: filters.status
      });

      if (response.data && response.data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(response.data);

        const columnWidths = [
          { wch: 14 },  // Nro Pedido
          { wch: 18 },  // Fecha Pedido
          { wch: 18 },  // Fecha Entrega
          { wch: 12 },  // Estado
          { wch: 25 },  // Cliente
          { wch: 12 },  // DNI
          { wch: 12 },  // Teléfono
          { wch: 20 },  // Repartidor
          { wch: 12 },  // Subtotal
          { wch: 12 },  // Descuento
          { wch: 15 },  // Ganagas Usados
          { wch: 12 },  // Total
          { wch: 15 },  // Método Pago
          { wch: 35 },  // Detalle Pago Mixto
          { wch: 12 },  // Es Crédito
          { wch: 40 }   // Dirección
        ];
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Ventas');

        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const filename = `Historial_Ventas_${dateStr}.xlsx`;

        XLSX.writeFile(workbook, filename);
      } else {
        alert('No hay datos para exportar con los filtros seleccionados');
      }
    } catch (error) {
      alert('Error al exportar: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    fetchSales({ ...filters, page: newPage });
  };

  return (
    <div className="sales-page">
      <div className="sales-container">
        {/* Header */}
        <div className="sales-header">
          <div className="sales-header-left">
            <h1 className="sales-title">
              <span className="sales-title-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              Historial de Ventas
            </h1>
            <p className="sales-subtitle">
              Consulta y analiza el historial completo de ventas y cobros realizados
            </p>
          </div>
          <button
            className="sales-export-btn"
            onClick={handleExport}
            disabled={exporting || loading}
          >
            {exporting ? (
              <>
                <svg className="sales-loading-spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} viewBox="0 0 24 24" />
                Exportando...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar a Excel
              </>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <SalesSummaryCard summary={summary} loading={loading} />

        {/* Filters */}
        <SalesHistoryFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleReset}
        />

        {/* Table */}
        <SalesHistoryTable
          sales={data}
          onView={handleViewSale}
          loading={loading}
          totalCount={pagination?.total || 0}
        />

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="sales-pagination">
            <div className="sales-pagination-info">
              Mostrando <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> a{' '}
              <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> de{' '}
              <strong>{pagination.total}</strong> ventas
            </div>
            <div className="sales-pagination-controls">
              <button
                className="sales-pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Anterior
              </button>
              <span className="sales-pagination-current">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                className="sales-pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Siguiente
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistoryPage;
