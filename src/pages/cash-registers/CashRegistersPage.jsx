import { useState, useEffect } from 'react';
import { useCashRegisterApi } from '../../hooks/useApi/useCashRegisterApi';
import { useCollaboratorApi } from '../../hooks/useApi/useCollaboratorApi';
import CashRegisterOpenModal from '../../components/cash-register/CashRegisterOpenModal';
import CashRegisterDetailModal from '../../components/cash-register/CashRegisterDetailModal';
import './CashRegistersPage.css';

const STATUS_LABELS = {
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada',
  PENDIENTE_APROBACION: 'Pendiente',
  APROBADA: 'Aprobada',
  OBSERVADA: 'Observada'
};

const STATUS_COLORS = {
  ABIERTA: 'green',
  CERRADA: 'blue',
  PENDIENTE_APROBACION: 'orange',
  APROBADA: 'teal',
  OBSERVADA: 'red'
};

export const CashRegistersPage = () => {
  const {
    registers,
    pendingApproval,
    pagination,
    loading,
    fetchAll,
    fetchPendingApproval,
    openRegister,
    approveRegister,
    observeRegister
  } = useCashRegisterApi();

  const { data: collaborators, fetchCollaborators } = useCollaboratorApi();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    user_id: '',
    register_status: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCollaborators({ status: 'active', role_code: 'REPARTIDOR' });
    fetchPendingApproval();
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleOpenRegister = async (data) => {
    try {
      const result = await openRegister(data);
      if (result.success) {
        setShowOpenModal(false);
        fetchAll(filters);
        fetchPendingApproval();
        alert('Caja abierta exitosamente');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleViewDetail = (register) => {
    setSelectedRegister(register);
    setShowDetailModal(true);
  };

  const handleApprove = async (registerId, notes = '') => {
    try {
      const result = await approveRegister(registerId, { approval_notes: notes });
      if (result.success) {
        fetchAll(filters);
        fetchPendingApproval();
        setShowDetailModal(false);
        alert('Caja aprobada exitosamente');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleObserve = async (registerId, message) => {
    try {
      const result = await observeRegister(registerId, { observation_message: message });
      if (result.success) {
        fetchAll(filters);
        fetchPendingApproval();
        setShowDetailModal(false);
        alert('Observacion registrada');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const repartidores = collaborators.filter(c => c.role_code === 'REPARTIDOR');

  return (
    <div className="cash-registers-page">
      <div className="cash-registers-page__header">
        <h1>Gestion de Cajas</h1>
        <button
          className="cash-registers-page__btn-open"
          onClick={() => setShowOpenModal(true)}
        >
          + Abrir Caja
        </button>
      </div>

      {/* Tabs */}
      <div className="cash-registers-page__tabs">
        <button
          className={`cash-registers-page__tab ${activeTab === 'all' ? 'cash-registers-page__tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todas las Cajas
        </button>
        <button
          className={`cash-registers-page__tab ${activeTab === 'pending' ? 'cash-registers-page__tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pendientes de Aprobacion
          {pendingApproval.length > 0 && (
            <span className="cash-registers-page__badge">{pendingApproval.length}</span>
          )}
        </button>
      </div>

      {/* Pending Approval Tab */}
      {activeTab === 'pending' && (
        <div className="cash-registers-page__pending">
          {pendingApproval.length === 0 ? (
            <div className="cash-registers-page__empty">
              No hay cajas pendientes de aprobacion
            </div>
          ) : (
            <div className="cash-registers-page__pending-list">
              {pendingApproval.map(register => (
                <div key={register.id} className="cash-registers-page__pending-card">
                  <div className="cash-registers-page__pending-info">
                    <strong>{register.register_number}</strong>
                    <span>{register.user_name}</span>
                    <span className="cash-registers-page__pending-date">
                      {new Date(register.close_time).toLocaleString('es-PE')}
                    </span>
                  </div>
                  <div className="cash-registers-page__pending-amounts">
                    <div>
                      <span className="cash-registers-page__label">Esperado:</span>
                      <span>S/ {parseFloat(register.total_expected || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="cash-registers-page__label">Real:</span>
                      <span>S/ {parseFloat(register.total_actual || 0).toFixed(2)}</span>
                    </div>
                    <div className={`cash-registers-page__diff ${
                      parseFloat(register.total_difference) > 0
                        ? 'cash-registers-page__diff--negative'
                        : 'cash-registers-page__diff--positive'
                    }`}>
                      <span className="cash-registers-page__label">Diferencia:</span>
                      <span>
                        {parseFloat(register.total_difference) > 0 ? '-' : '+'}
                        S/ {Math.abs(parseFloat(register.total_difference || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="cash-registers-page__pending-actions">
                    <button
                      className="cash-registers-page__btn-view"
                      onClick={() => handleViewDetail(register)}
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Registers Tab */}
      {activeTab === 'all' && (
        <>
          {/* Filtros */}
          <div className="cash-registers-page__filters">
            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
            >
              <option value="">Todos los repartidores</option>
              {repartidores.map(r => (
                <option key={r.id} value={r.id}>{r.full_name}</option>
              ))}
            </select>

            <select
              value={filters.register_status}
              onChange={(e) => handleFilterChange('register_status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              placeholder="Desde"
            />

            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              placeholder="Hasta"
            />

            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por numero..."
            />
          </div>

          {/* Tabla */}
          <div className="cash-registers-page__table-container">
            {loading ? (
              <div className="cash-registers-page__loading">Cargando...</div>
            ) : registers.length === 0 ? (
              <div className="cash-registers-page__empty">No se encontraron cajas</div>
            ) : (
              <table className="cash-registers-page__table">
                <thead>
                  <tr>
                    <th>Numero</th>
                    <th>Repartidor</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Pedidos</th>
                    <th>Ventas</th>
                    <th>Gastos</th>
                    <th>Esperado</th>
                    <th>Real</th>
                    <th>Diferencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registers.map(register => (
                    <tr key={register.id}>
                      <td><strong>{register.register_number}</strong></td>
                      <td>{register.user_name}</td>
                      <td>{new Date(register.open_date).toLocaleDateString('es-PE')}</td>
                      <td>
                        <span className={`cash-registers-page__status cash-registers-page__status--${STATUS_COLORS[register.register_status]}`}>
                          {STATUS_LABELS[register.register_status]}
                        </span>
                      </td>
                      <td>{register.orders_count}</td>
                      <td className="cash-registers-page__amount--positive">
                        S/ {parseFloat(register.total_sales || 0).toFixed(2)}
                      </td>
                      <td className="cash-registers-page__amount--negative">
                        S/ {parseFloat(register.total_expenses || 0).toFixed(2)}
                      </td>
                      <td>S/ {parseFloat(register.total_expected || 0).toFixed(2)}</td>
                      <td>
                        {register.total_actual !== null
                          ? `S/ ${parseFloat(register.total_actual).toFixed(2)}`
                          : '-'
                        }
                      </td>
                      <td className={
                        register.total_difference === null ? '' :
                        parseFloat(register.total_difference) > 0
                          ? 'cash-registers-page__amount--negative'
                          : parseFloat(register.total_difference) < 0
                            ? 'cash-registers-page__amount--positive'
                            : ''
                      }>
                        {register.total_difference !== null
                          ? `${parseFloat(register.total_difference) > 0 ? '-' : parseFloat(register.total_difference) < 0 ? '+' : ''} S/ ${Math.abs(parseFloat(register.total_difference)).toFixed(2)}`
                          : '-'
                        }
                      </td>
                      <td>
                        <button
                          className="cash-registers-page__btn-action"
                          onClick={() => handleViewDetail(register)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginacion */}
          {pagination && pagination.totalPages > 1 && (
            <div className="cash-registers-page__pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Anterior
              </button>
              <span>
                Pagina {pagination.page} de {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {showOpenModal && (
        <CashRegisterOpenModal
          isOpen={showOpenModal}
          onClose={() => setShowOpenModal(false)}
          onSubmit={handleOpenRegister}
          repartidores={repartidores}
        />
      )}

      {showDetailModal && selectedRegister && (
        <CashRegisterDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRegister(null);
          }}
          registerId={selectedRegister.id}
          onApprove={handleApprove}
          onObserve={handleObserve}
        />
      )}
    </div>
  );
};

export default CashRegistersPage;
