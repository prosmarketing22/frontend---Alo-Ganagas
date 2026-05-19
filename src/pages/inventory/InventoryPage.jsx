import { useState, useEffect, useRef } from 'react';
import { useInventoryApi } from '../../hooks/useApi/useInventoryApi';
import { useCustomerLoanApi } from '../../hooks/useApi/useCustomerLoanApi';
import { useSupplierLoanApi } from '../../hooks/useApi/useSupplierLoanApi';
import { MovementForm } from '../../components/inventory/MovementForm';
import { ExitForm } from '../../components/inventory/ExitForm';
import { MovementTable } from '../../components/inventory/MovementTable';
import { TransferForm } from '../../components/inventory/TransferForm';
import { AdjustmentForm } from '../../components/inventory/AdjustmentForm';
import { InventoryReconciliationTable } from '../../components/inventory/InventoryReconciliationTable';
import { CustomerLoanForm } from '../../components/customerLoans/CustomerLoanForm';
import { CustomerLoanReturnForm } from '../../components/customerLoans/CustomerLoanReturnForm';
import { CustomerLoanSummaryCards } from '../../components/customerLoans/CustomerLoanSummaryCards';
import { CustomerLoanAccordion } from '../../components/customerLoans/CustomerLoanAccordion';
import { SupplierLoanForm } from '../../components/supplierLoans/SupplierLoanForm';
import { SupplierLoanReturnForm } from '../../components/supplierLoans/SupplierLoanReturnForm';
import { SupplierLoanSummaryCards } from '../../components/supplierLoans/SupplierLoanSummaryCards';
import { SupplierLoanAccordion } from '../../components/supplierLoans/SupplierLoanAccordion';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { useAuth } from '../../features/auth/useAuth';
import { getContainerLabel } from '../../utils/constants';
import '../../styles/components/inventory.css';

export const InventoryPage = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const isBase = userRole === 'BASE';
  const [activeTab, setActiveTab] = useState('movimientos');
  const [modalType, setModalType] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [movementFilters, setMovementFilters] = useState({
    movement_type: '',
    start_date: '',
    end_date: ''
  });

  const {
    data: movimientos,
    loading: loadingMovimientos,
    error: errorMovimientos,
    fetchMovements,
    createEntry,
    createExit,
    createAdjustment,
    createTransfer
  } = useInventoryApi();

  const {
    data: customerLoans,
    loading: loadingCustomerLoans,
    error: errorCustomerLoans,
    fetchLoans: fetchCustomerLoans,
    createLoan: createCustomerLoan,
    registerReturn: registerCustomerReturn,
    getSummary: getCustomerSummary
  } = useCustomerLoanApi();

  const {
    data: supplierLoans,
    loading: loadingSupplierLoans,
    error: errorSupplierLoans,
    fetchLoans: fetchSupplierLoans,
    createLoan: createSupplierLoan,
    registerReturn: registerSupplierReturn,
    getSummary: getSupplierSummary
  } = useSupplierLoanApi();

  const [customerLoanSummary, setCustomerLoanSummary] = useState(null);
  const [supplierLoanSummary, setSupplierLoanSummary] = useState(null);
  const [customerLoanRefreshTrigger, setCustomerLoanRefreshTrigger] = useState(0);
  const [supplierLoanRefreshTrigger, setSupplierLoanRefreshTrigger] = useState(0);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (activeTab === 'movimientos') {
      loadMovimientos();
    } else if (activeTab === 'prestamos-clientes') {
      loadCustomerLoans();
      loadCustomerLoanSummary();
    } else if (activeTab === 'prestamos-proveedores') {
      loadSupplierLoans();
      loadSupplierLoanSummary();
    }
  }, [activeTab]);

  // Auto-aplicar filtros cuando cambian
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (activeTab === 'movimientos') {
      loadMovimientos(movementFilters);
    }
  }, [movementFilters.movement_type, movementFilters.start_date, movementFilters.end_date]);

  const loadMovimientos = async (filters = movementFilters) => {
    try {
      const params = { limit: 50 };
      if (filters.movement_type) params.movement_type = filters.movement_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      await fetchMovements(params);
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setMovementFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setMovementFilters(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
  };

  const handleClearFilters = () => {
    setMovementFilters({ movement_type: '', start_date: '', end_date: '' });
  };

  const loadCustomerLoans = async () => {
    try {
      await fetchCustomerLoans({ limit: 50 });
    } catch (err) {
      console.error('Error al cargar prestamos de clientes:', err);
    }
  };

  const loadSupplierLoans = async () => {
    try {
      await fetchSupplierLoans({ limit: 50 });
    } catch (err) {
      console.error('Error al cargar prestamos de proveedores:', err);
    }
  };

  const loadCustomerLoanSummary = async () => {
    try {
      const summary = await getCustomerSummary();
      setCustomerLoanSummary(summary);
    } catch (err) {
      console.error('Error al cargar resumen de prestamos de clientes:', err);
    }
  };

  const loadSupplierLoanSummary = async () => {
    try {
      const summary = await getSupplierSummary();
      setSupplierLoanSummary(summary);
    } catch (err) {
      console.error('Error al cargar resumen de prestamos de proveedores:', err);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedLoan(null);
  };

  const handleMovementSubmit = async (formData) => {
    try {
      if (formData.movement_type === 'ENTRADA') {
        await createEntry(formData);
      } else if (formData.movement_type === 'SALIDA') {
        await createExit(formData);
      } else if (formData.movement_type === 'AJUSTE') {
        if (formData.items && formData.items.length > 0) {
          await createAdjustment(formData);
        }
      }
      handleCloseModal();
      loadMovimientos();
    } catch (err) {
      console.error('Error al guardar movimiento:', err);
      alert('Error al guardar el movimiento: ' + err.message);
    }
  };

  const handleTransferSubmit = async (formData) => {
    try {
      await createTransfer(formData);
      handleCloseModal();
      loadMovimientos();
      alert('Transferencia realizada exitosamente');
    } catch (err) {
      console.error('Error al realizar transferencia:', err);
      alert('Error al realizar la transferencia: ' + err.message);
    }
  };

  const handleCustomerLoanSubmit = async (formData) => {
    try {
      await createCustomerLoan(formData);
      handleCloseModal();
      setCustomerLoanRefreshTrigger(prev => prev + 1);
      loadCustomerLoanSummary();
    } catch (err) {
      console.error('Error al guardar prestamo de cliente:', err);
      alert('Error al guardar el prestamo: ' + err.message);
    }
  };

  const handleSupplierLoanSubmit = async (formData) => {
    try {
      await createSupplierLoan(formData);
      handleCloseModal();
      setSupplierLoanRefreshTrigger(prev => prev + 1);
      loadSupplierLoanSummary();
    } catch (err) {
      console.error('Error al guardar prestamo de proveedor:', err);
      alert('Error al guardar el prestamo: ' + err.message);
    }
  };

  const handleCustomerReturnSubmit = async (loanId, cantidad, returnedBy, warehouseId) => {
    try {
      await registerCustomerReturn(loanId, cantidad, returnedBy, warehouseId);
      handleCloseModal();
      setCustomerLoanRefreshTrigger(prev => prev + 1);
      loadCustomerLoanSummary();
    } catch (err) {
      console.error('Error al registrar devolucion:', err);
      alert('Error al registrar la devolucion: ' + err.message);
    }
  };

  const handleSupplierReturnSubmit = async (loanId, cantidad, warehouseId) => {
    try {
      await registerSupplierReturn(loanId, cantidad, warehouseId);
      handleCloseModal();
      setSupplierLoanRefreshTrigger(prev => prev + 1);
      loadSupplierLoanSummary();
    } catch (err) {
      console.error('Error al registrar devolucion:', err);
      alert('Error al registrar la devolucion: ' + err.message);
    }
  };

  const handleRegisterCustomerReturn = (loanOrSelection) => {
    if (loanOrSelection.selectType) {
      setSelectedLoan(loanOrSelection);
      setModalType('customer-return-select');
    } else {
      setSelectedLoan(loanOrSelection);
      setModalType('customer-return');
    }
  };

  const handleRegisterSupplierReturn = (loan) => {
    setSelectedLoan(loan);
    setModalType('supplier-return');
  };

  return (
    <div className="inventory-page">
      <div className="inventory-container">
        <div className="inventory-header">
          <h1 className="inventory-title">
            <span className="inventory-title-icon">📦</span>
            Inventario y Prestamos
          </h1>
        </div>

        <div className="inventory-tabs">
          <button
            onClick={() => setActiveTab('movimientos')}
            className={`inventory-tab ${activeTab === 'movimientos' ? 'inventory-tab--active' : ''}`}
          >
            <span className="inventory-tab-icon">📋</span>
            Movimientos
          </button>
          <button
            onClick={() => setActiveTab('prestamos-clientes')}
            className={`inventory-tab ${activeTab === 'prestamos-clientes' ? 'inventory-tab--active' : ''}`}
          >
            <span className="inventory-tab-icon">👤</span>
            Prestamos Clientes
          </button>
          <button
            onClick={() => setActiveTab('prestamos-proveedores')}
            className={`inventory-tab ${activeTab === 'prestamos-proveedores' ? 'inventory-tab--active' : ''}`}
          >
            <span className="inventory-tab-icon">🏭</span>
            Prestamos Proveedores
          </button>
          <button
            onClick={() => setActiveTab('cuadre-inventario')}
            className={`inventory-tab ${activeTab === 'cuadre-inventario' ? 'inventory-tab--active' : ''}`}
          >
            <span className="inventory-tab-icon">📊</span>
            Cuadre de Inventario
          </button>
        </div>

        {activeTab === 'movimientos' && (
          <div className="inventory-tab-content">
            <div className="inventory-actions">
              {!isBase && (
                <button
                  onClick={() => handleOpenModal('entrada')}
                  className="inventory-btn inventory-btn--entrada"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Registrar Compras
                </button>
              )}
              <button
                onClick={() => handleOpenModal('salida')}
                className="inventory-btn inventory-btn--salida"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Registrar Salida
              </button>
              <button
                onClick={() => handleOpenModal('ajuste')}
                className="inventory-btn inventory-btn--ajuste"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
                </svg>
                Ajuste de Inventario
              </button>
              <button
                onClick={() => handleOpenModal('transferencia')}
                className="inventory-btn inventory-btn--transferencia"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
                Transferir entre Almacenes
              </button>
            </div>

            {/* Filtros */}
            <div className="inventory-filters">
              <div className="inventory-filters__group">
                <label className="inventory-filters__label">Tipo de Movimiento</label>
                <select
                  value={movementFilters.movement_type}
                  onChange={(e) => handleFilterChange('movement_type', e.target.value)}
                  className="inventory-filters__select"
                >
                  <option value="">Todos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SALIDA">Salidas (manual)</option>
                  <option value="VENTA">Ventas</option>
                  <option value="AJUSTE">Ajustes</option>
                  <option value="TRANSFERENCIA">Transferencias</option>
                </select>
              </div>
              <div className="inventory-filters__group inventory-filters__group--date">
                <label className="inventory-filters__label">Rango de Fechas</label>
                <DateRangePicker
                  startDate={movementFilters.start_date}
                  endDate={movementFilters.end_date}
                  onChange={handleDateRangeChange}
                  placeholder="Seleccionar fechas"
                />
              </div>
              {(movementFilters.movement_type || movementFilters.start_date || movementFilters.end_date) && (
                <button onClick={handleClearFilters} className="inventory-filters__clear-btn">
                  Limpiar filtros
                </button>
              )}
            </div>

            {errorMovimientos && (
              <div className="inventory-error">
                <span className="inventory-error-icon">⚠️</span>
                <span className="inventory-error-text">Error: {errorMovimientos}</span>
              </div>
            )}

            <MovementTable data={movimientos} loading={loadingMovimientos} />
          </div>
        )}

        {activeTab === 'prestamos-clientes' && (
          <div className="inventory-tab-content">
            <CustomerLoanSummaryCards summary={customerLoanSummary} loading={loadingCustomerLoans} />

            <CustomerLoanAccordion
              onRegisterReturn={handleRegisterCustomerReturn}
              onNewLoan={() => handleOpenModal('customer-loan')}
              refreshTrigger={customerLoanRefreshTrigger}
            />
          </div>
        )}

        {activeTab === 'prestamos-proveedores' && (
          <div className="inventory-tab-content">
            <SupplierLoanSummaryCards summary={supplierLoanSummary} loading={loadingSupplierLoans} />

            <SupplierLoanAccordion
              onRegisterReturn={handleRegisterSupplierReturn}
              onNewLoan={() => handleOpenModal('supplier-loan')}
              refreshTrigger={supplierLoanRefreshTrigger}
            />
          </div>
        )}

        {activeTab === 'cuadre-inventario' && (
          <div className="inventory-tab-content">
            <InventoryReconciliationTable />
          </div>
        )}

        {modalType && (
          <div className="inventory-modal-overlay">
            <div className="inventory-modal">
              <div className="inventory-modal-header">
                <h3 className="inventory-modal-title">
                  {modalType === 'entrada' && 'Registrar Compras de Inventario'}
                  {modalType === 'salida' && 'Registrar Salida de Inventario'}
                  {modalType === 'ajuste' && 'Ajuste de Inventario'}
                  {modalType === 'transferencia' && 'Transferencia entre Almacenes'}
                  {modalType === 'customer-loan' && 'Prestamo de Cliente'}
                  {modalType === 'supplier-loan' && 'Prestamo de Proveedor'}
                  {modalType === 'customer-return-select' && `Seleccionar Tipo de Envase - ${selectedLoan?.customer_name || 'Cliente'}`}
                  {modalType === 'customer-return' && `Registrar Devolucion - ${selectedLoan?.customer_name || 'Cliente'}`}
                  {modalType === 'supplier-return' && 'Registrar Devolucion - Proveedor'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="inventory-modal-close"
                >
                  X
                </button>
              </div>
              <div className="inventory-modal-body">
                {modalType === 'entrada' && (
                  <MovementForm
                    tipo="ENTRADA"
                    onSubmit={handleMovementSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'salida' && (
                  <ExitForm
                    onSubmit={handleMovementSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'ajuste' && (
                  <AdjustmentForm
                    onSubmit={handleMovementSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'transferencia' && (
                  <TransferForm
                    onSubmit={handleTransferSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'customer-loan' && (
                  <CustomerLoanForm
                    onSubmit={handleCustomerLoanSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'supplier-loan' && (
                  <SupplierLoanForm
                    onSubmit={handleSupplierLoanSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'customer-return-select' && selectedLoan && (
                  <div className="container-type-select">
                    <p className="container-type-select__description">
                      Este cliente tiene envases pendientes de diferentes tipos. Seleccione el tipo de envase a devolver:
                    </p>
                    <div className="container-type-select__options">
                      {[...new Set(selectedLoan.pendingLoans.map(l => l.container_type))].map(ct => {
                        const loansOfType = selectedLoan.pendingLoans.filter(l => l.container_type === ct);
                        const totalPending = loansOfType.reduce((sum, l) => sum + (l.quantity - l.quantity_returned), 0);
                        return (
                          <button
                            key={ct}
                            className="container-type-select__option"
                            onClick={() => {
                              const firstLoan = loansOfType[0];
                              setSelectedLoan({ ...firstLoan, customer_name: selectedLoan.customer_name });
                              setModalType('customer-return');
                            }}
                          >
                            <span className="container-type-select__icon">
                              {ct === 'BALON_GAS' ? '🔴' : '💧'}
                            </span>
                            <span className="container-type-select__name">{getContainerLabel(ct)}</span>
                            <span className="container-type-select__pending">{totalPending} pendiente{totalPending !== 1 ? 's' : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="container-type-select__actions">
                      <button onClick={handleCloseModal} className="return-form__btn return-form__btn--cancel">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                {modalType === 'customer-return' && selectedLoan && (
                  <CustomerLoanReturnForm
                    loan={selectedLoan}
                    onSubmit={handleCustomerReturnSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
                {modalType === 'supplier-return' && selectedLoan && (
                  <SupplierLoanReturnForm
                    loan={selectedLoan}
                    onSubmit={handleSupplierReturnSubmit}
                    onCancel={handleCloseModal}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
