import { useState, useEffect } from 'react';
import repartidorService from '../../services/repartidorService';
import { ModalAlerta } from '../common/ModalAlerta';
import { getContainerLabel } from '../../utils/constants';
import { prepareVoucherFile } from '../../utils/imageCompression';
import './DeliveryModal.css';

const METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
  FISE: 'FISE',
  VALE_FISE: 'FISE',
  CREDITO: 'Credito',
  MIXTO: 'Pago Mixto'
};

// Monto minimo para usar puntos GANAGAS
const MIN_GANAGAS_AMOUNT = 5;

/**
 * DeliveryModal - Modal para confirmar entrega o pre-registrar pago
 *
 * @param {object} delivery - Datos del pedido
 * @param {function} onConfirm - Callback al confirmar
 * @param {function} onClose - Callback al cerrar
 * @param {boolean} loading - Estado de carga
 * @param {string} mode - 'delivery' (entrega por repartidor) o 'preregister' (pre-registro por gerente/base)
 */
export const DeliveryModal = ({ delivery, onConfirm, onClose, loading, mode = 'delivery' }) => {
  const isPreregisterMode = mode === 'preregister';

  // Obtener datos pre-registrados si existen
  const preregInfo = delivery?.preregistration_info || null;
  const preregPayment = preregInfo?.payment?.details || null;
  const preregExchange = preregInfo?.exchange?.details?.items || null;
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Estado para DNI del beneficiario FISE
  const [fiseDni, setFiseDni] = useState(() => {
    if (preregPayment?.fise_dni) return preregPayment.fise_dni;
    return '';
  });

  // Saldo GANAGAS disponible del cliente
  const ganagasBalance = parseFloat(delivery?.ganagas_balance || 0);
  const hasGanagasBalance = ganagasBalance > 0;

  // Inicializar con datos pre-registrados si existen
  const [paymentMethod, setPaymentMethod] = useState(() => {
    if (preregPayment?.payment_method) return preregPayment.payment_method;
    return delivery?.payment_method || 'EFECTIVO';
  });
  const [amountPaid, setAmountPaid] = useState(() => {
    if (preregPayment?.amount_paid) return String(preregPayment.amount_paid);
    return '';
  });
  const [changeAmount, setChangeAmount] = useState(() => {
    if (preregPayment?.change_amount) return preregPayment.change_amount;
    return 0;
  });
  const [notes, setNotes] = useState(() => {
    return preregInfo?.notes || '';
  });

  // Estado para uso de puntos GANAGAS
  const [useGanagasPoints, setUseGanagasPoints] = useState(() => {
    if (preregPayment?.use_ganagas_balance) return true;
    return false;
  });
  const [ganagasAmountToUse, setGanagasAmountToUse] = useState(() => {
    if (preregPayment?.ganagas_amount) return String(preregPayment.ganagas_amount);
    return '';
  });

  // Estado para pagos mixtos - inicializar con datos pre-registrados si existen
  const [mixedPayments, setMixedPayments] = useState(() => {
    if (preregPayment?.mixed_payment_details && Array.isArray(preregPayment.mixed_payment_details)) {
      return preregPayment.mixed_payment_details.map(p => ({
        method: p.method,
        amount: String(p.amount || '')
      }));
    }
    return [];
  });

  // Estado para vouchers - un archivo por metodo de pago (solo en modo delivery)
  const [vouchers, setVouchers] = useState({});
  const [voucherPreviews, setVoucherPreviews] = useState({});

  // Estado para modal de alerta GANAGAS
  const [ganagasAlert, setGanagasAlert] = useState(false);

  // Estado para registro de intercambio de balones (excluir items con envase incluido)
  const [exchangeDetails, setExchangeDetails] = useState(() => {
    const details = delivery?.details || [];
    return details
      .filter(d => {
        // Excluir items con envase incluido (no requieren intercambio)
        if (d.includes_container) return false;
        return d.is_exchange || d.is_exchangeable || ['BALON_GAS', 'BIDON_AGUA'].includes(d.product_type);
      })
      .map(d => {
        // Buscar datos pre-registrados para este producto
        const preregItem = preregExchange?.find(p => p.product_id === d.product_id);
        return {
          id: d.id,
          product_id: d.product_id,
          product_name: d.product_name || d.product?.name || 'Producto',
          product_type: d.product_type || 'OTRO',
          balloon_type: d.balloon_type || d.product?.balloon_type || null,
          quantity: d.quantity,
          empty_received: preregItem?.empty_received ?? d.quantity,
          exchange_notes: preregItem?.exchange_notes || ''
        };
      });
  });

  // Items con envase incluido (no requieren intercambio)
  const containerItems = (delivery?.details || []).filter(d => d.includes_container);

  // Estado para devoluciones adicionales (productos con deuda que NO están en el pedido)
  const [additionalReturns, setAdditionalReturns] = useState([]);

  // Estado para cobro de deuda de crédito durante entrega
  const [collectDebt, setCollectDebt] = useState(false);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
  const [debtPaymentMethod, setDebtPaymentMethod] = useState('EFECTIVO');
  const [debtFiseDni, setDebtFiseDni] = useState('');
  const [debtMixedPayments, setDebtMixedPayments] = useState([
    { method: 'EFECTIVO', amount: '' },
    { method: 'YAPE', amount: '' }
  ]);
  const [debtVouchers, setDebtVouchers] = useState({});
  const [debtVoucherPreviews, setDebtVoucherPreviews] = useState({});

  // Estado para mostrar seccion de intercambio
  const hasExchangeableItems = exchangeDetails.length > 0;

  const totalAmount = parseFloat(delivery?.total || 0);
  const customerName = delivery?.customer_name || 'Cliente';
  const orderNumber = delivery?.order_number || `#${delivery?.id}`;

  // Información de crédito del cliente
  const creditLimit = parseFloat(delivery?.credit_limit || 0);
  const pendingDebt = parseFloat(delivery?.pending_debt || 0);
  const creditAvailable = Math.max(0, creditLimit - pendingDebt);
  const hasCreditInfo = creditLimit > 0 || pendingDebt > 0;

  // Préstamos pendientes del cliente (deuda de envases)
  const customerPendingLoans = (() => {
    const rawLoans = delivery?.customer_pending_loans || [];

    // Agrupar por container_type
    const byType = {};
    rawLoans.forEach(loan => {
      const type = loan.container_type || 'OTRO';
      if (byType[type]) {
        byType[type].quantity_pending += loan.quantity_pending;
      } else {
        byType[type] = {
          container_type: type,
          quantity_pending: loan.quantity_pending
        };
      }
    });

    return Object.values(byType);
  })();

  // Verificar si hay préstamos pendientes
  const hasPendingLoans = customerPendingLoans.length > 0;

  // Obtener almacén principal por defecto
  const defaultWarehouseId = (() => {
    const main = warehouses.find(w => w.is_main);
    return main ? String(main.id) : (warehouses[0] ? String(warehouses[0].id) : '');
  })();

  // Funciones para manejar devoluciones de envases pendientes
  const handleReturnChange = (containerType, field, value) => {
    setAdditionalReturns(prev => {
      const existing = prev.find(r => r.container_type === containerType);
      if (existing) {
        return prev.map(r =>
          r.container_type === containerType ? { ...r, [field]: value } : r
        );
      } else {
        return [...prev, {
          container_type: containerType,
          quantity_returned: field === 'quantity_returned' ? value : 0,
          warehouse_destination_id: field === 'warehouse_destination_id' ? value : defaultWarehouseId,
          notes: field === 'notes' ? value : ''
        }];
      }
    });
  };

  const getAdditionalReturn = (containerType) => {
    return additionalReturns.find(r => r.container_type === containerType) || {
      quantity_returned: 0,
      warehouse_destination_id: defaultWarehouseId,
      notes: ''
    };
  };

  // Calcular descuento de puntos GANAGAS y total final a cobrar
  const ganagasDiscount = useGanagasPoints
    ? Math.min(parseFloat(ganagasAmountToUse) || 0, ganagasBalance, totalAmount)
    : 0;
  const finalAmountToPay = totalAmount - ganagasDiscount;

  // Cargar metodos de pago y almacenes al montar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar métodos de pago y almacenes en paralelo
        const [paymentResult, warehouseResult] = await Promise.all([
          repartidorService.getPaymentMethods(),
          repartidorService.getActiveWarehouses()
        ]);

        if (paymentResult.success && paymentResult.data) {
          // Agregar MIXTO al final
          const methods = [
            ...paymentResult.data,
            { method_type: 'MIXTO', display_order: 999 }
          ];
          setPaymentMethods(methods);

          // Inicializar pagos mixtos con los primeros 2 metodos no-efectivo
          const nonCashMethods = paymentResult.data.filter(m => m.method_type !== 'EFECTIVO');
          if (nonCashMethods.length >= 2) {
            setMixedPayments([
              { method: 'EFECTIVO', amount: '' },
              { method: nonCashMethods[0].method_type, amount: '' }
            ]);
          } else {
            setMixedPayments([
              { method: 'EFECTIVO', amount: '' },
              { method: paymentResult.data[1]?.method_type || 'EFECTIVO', amount: '' }
            ]);
          }
        }

        if (warehouseResult.success && warehouseResult.data) {
          setWarehouses(warehouseResult.data);
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        // Usar valores por defecto si falla
        setPaymentMethods([
          { method_type: 'EFECTIVO', display_order: 0 },
          { method_type: 'YAPE', display_order: 1 },
          { method_type: 'PLIN', display_order: 2 },
          { method_type: 'TRANSFERENCIA', display_order: 3 },
          { method_type: 'MIXTO', display_order: 999 }
        ]);
        setMixedPayments([
          { method: 'EFECTIVO', amount: '' },
          { method: 'YAPE', amount: '' }
        ]);
      } finally {
        setLoadingMethods(false);
      }
    };
    loadInitialData();
  }, []);

  // Calcular total de pagos mixtos (comparar contra el monto final con descuento)
  const mixedTotal = mixedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const mixedRemaining = finalAmountToPay - mixedTotal;

  useEffect(() => {
    // Calcular vuelto si es efectivo (usando el monto final con descuento)
    if (paymentMethod === 'EFECTIVO' && amountPaid) {
      const paid = parseFloat(amountPaid) || 0;
      const change = paid - finalAmountToPay;
      setChangeAmount(change > 0 ? change : 0);
    } else {
      setChangeAmount(0);
    }
  }, [amountPaid, paymentMethod, finalAmountToPay]);

  // Sin restriccion de peso: las fotos grandes se recomprimen en el cliente.
  const handleVoucherChange = async (method, e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;
    const inputEl = e.target;
    try {
      const file = await prepareVoucherFile(rawFile);

      // Limpiar preview anterior si existe
      if (voucherPreviews[method]) {
        URL.revokeObjectURL(voucherPreviews[method]);
      }

      setVouchers(prev => ({ ...prev, [method]: file }));
      setVoucherPreviews(prev => ({ ...prev, [method]: URL.createObjectURL(file) }));
    } catch (err) {
      console.error('Error procesando voucher:', err);
      if (inputEl) inputEl.value = '';
    }
  };

  const handleRemoveVoucher = (method) => {
    if (voucherPreviews[method]) {
      URL.revokeObjectURL(voucherPreviews[method]);
    }
    setVouchers(prev => {
      const updated = { ...prev };
      delete updated[method];
      return updated;
    });
    setVoucherPreviews(prev => {
      const updated = { ...prev };
      delete updated[method];
      return updated;
    });
  };

  // Funciones para vouchers de cobro de deuda
  // Sin restriccion de peso: las fotos grandes se recomprimen en el cliente.
  const handleDebtVoucherChange = async (method, e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;
    const inputEl = e.target;
    try {
      const file = await prepareVoucherFile(rawFile);

      if (debtVoucherPreviews[method]) {
        URL.revokeObjectURL(debtVoucherPreviews[method]);
      }

      setDebtVouchers(prev => ({ ...prev, [method]: file }));
      setDebtVoucherPreviews(prev => ({ ...prev, [method]: URL.createObjectURL(file) }));
    } catch (err) {
      console.error('Error procesando voucher:', err);
      if (inputEl) inputEl.value = '';
    }
  };

  const handleRemoveDebtVoucher = (method) => {
    if (debtVoucherPreviews[method]) {
      URL.revokeObjectURL(debtVoucherPreviews[method]);
    }
    setDebtVouchers(prev => {
      const updated = { ...prev };
      delete updated[method];
      return updated;
    });
    setDebtVoucherPreviews(prev => {
      const updated = { ...prev };
      delete updated[method];
      return updated;
    });
  };

  // Funciones para pagos mixtos de deuda
  const handleDebtMixedPaymentChange = (index, field, value) => {
    const updated = [...debtMixedPayments];
    updated[index][field] = value;
    setDebtMixedPayments(updated);
  };

  const addDebtMixedPayment = () => {
    const usedMethods = debtMixedPayments.map(p => p.method);
    const availableMethod = paymentMethods.find(m =>
      m.method_type !== 'MIXTO' && m.method_type !== 'CREDITO' && !usedMethods.includes(m.method_type)
    );

    if (availableMethod) {
      setDebtMixedPayments([...debtMixedPayments, { method: availableMethod.method_type, amount: '' }]);
    } else {
      setDebtMixedPayments([...debtMixedPayments, { method: 'EFECTIVO', amount: '' }]);
    }
  };

  const removeDebtMixedPayment = (index) => {
    if (debtMixedPayments.length > 2) {
      const methodToRemove = debtMixedPayments[index].method;
      if (debtVouchers[methodToRemove]) {
        handleRemoveDebtVoucher(methodToRemove);
      }
      const updated = debtMixedPayments.filter((_, i) => i !== index);
      setDebtMixedPayments(updated);
    }
  };

  const getAvailableDebtMethods = (currentIndex) => {
    const usedMethods = debtMixedPayments
      .filter((_, i) => i !== currentIndex)
      .map(p => p.method);
    return paymentMethods.filter(m =>
      m.method_type !== 'MIXTO' &&
      m.method_type !== 'CREDITO' &&
      (!usedMethods.includes(m.method_type) || m.method_type === debtMixedPayments[currentIndex].method)
    );
  };

  // Calcular total de pagos mixtos de deuda
  const debtMixedTotal = debtMixedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // Funciones para pagos mixtos
  const handleMixedPaymentChange = (index, field, value) => {
    const updated = [...mixedPayments];
    updated[index][field] = value;
    setMixedPayments(updated);
  };

  const addMixedPayment = () => {
    const usedMethods = mixedPayments.map(p => p.method);
    const availableMethod = paymentMethods.find(m =>
      m.method_type !== 'MIXTO' && !usedMethods.includes(m.method_type)
    );

    if (availableMethod) {
      setMixedPayments([...mixedPayments, { method: availableMethod.method_type, amount: '' }]);
    } else {
      setMixedPayments([...mixedPayments, { method: 'EFECTIVO', amount: '' }]);
    }
  };

  const removeMixedPayment = (index) => {
    if (mixedPayments.length > 2) {
      // Limpiar voucher del metodo que se elimina
      const methodToRemove = mixedPayments[index].method;
      if (vouchers[methodToRemove]) {
        handleRemoveVoucher(methodToRemove);
      }
      const updated = mixedPayments.filter((_, i) => i !== index);
      setMixedPayments(updated);
    }
  };

  // Funciones para manejo de intercambio de balones
  const handleExchangeDetailChange = (index, field, value) => {
    const updated = [...exchangeDetails];
    updated[index][field] = value;
    setExchangeDetails(updated);
  };

  const getExchangeStatus = (detail) => {
    const expected = detail.quantity;
    const received = parseInt(detail.empty_received) || 0;

    if (received === expected) {
      return { type: 'normal', label: 'Intercambio completo', color: 'green' };
    } else if (received < expected && received > 0) {
      return { type: 'loan', label: `Prestamo: ${expected - received} balon(es)`, color: 'orange' };
    } else {
      return { type: 'full_loan', label: `Prestamo completo: ${expected} balon(es)`, color: 'red' };
    }
  };

  const getAvailableMethods = (currentIndex) => {
    const usedMethods = mixedPayments
      .filter((_, i) => i !== currentIndex)
      .map(p => p.method);
    return paymentMethods.filter(m =>
      m.method_type !== 'MIXTO' &&
      (!usedMethods.includes(m.method_type) || m.method_type === mixedPayments[currentIndex].method)
    );
  };

  const handleSubmit = () => {
    // Validar límite de crédito si es pago a crédito
    if (paymentMethod === 'CREDITO') {
      if (creditLimit === 0) {
        alert('Este cliente no tiene crédito habilitado.');
        return;
      }
      const newDebt = pendingDebt + totalAmount;
      if (newDebt > creditLimit) {
        alert(`No se puede pagar a crédito: el pedido excederá el límite.\n\nDeuda actual: S/ ${pendingDebt.toFixed(2)}\nPedido: S/ ${totalAmount.toFixed(2)}\nNueva deuda: S/ ${newDebt.toFixed(2)}\nLímite: S/ ${creditLimit.toFixed(2)}\nDisponible: S/ ${creditAvailable.toFixed(2)}`);
        return;
      }
    }

    // Validar límite de crédito en pago mixto que incluya CRÉDITO
    if (paymentMethod === 'MIXTO') {
      const creditInMixed = mixedPayments.find(p => p.method === 'CREDITO');
      if (creditInMixed && parseFloat(creditInMixed.amount) > 0) {
        if (creditLimit === 0) {
          alert('Este cliente no tiene crédito habilitado.');
          return;
        }
        const creditMixedAmount = parseFloat(creditInMixed.amount);
        const newDebt = pendingDebt + creditMixedAmount;
        if (newDebt > creditLimit) {
          alert(`No se puede usar crédito en pago mixto: excederá el límite.\n\nDeuda actual: S/ ${pendingDebt.toFixed(2)}\nCrédito mixto: S/ ${creditMixedAmount.toFixed(2)}\nNueva deuda: S/ ${newDebt.toFixed(2)}\nLímite: S/ ${creditLimit.toFixed(2)}\nDisponible: S/ ${creditAvailable.toFixed(2)}`);
          return;
        }
      }
    }

    // Validar monto minimo de GANAGAS
    if (useGanagasPoints && ganagasDiscount > 0) {
      if (ganagasDiscount < MIN_GANAGAS_AMOUNT) {
        setGanagasAlert(true);
        return;
      }
    }

    let paid = parseFloat(amountPaid) || finalAmountToPay;
    let mixedDetails = null;
    let finalVouchers = {};

    // Validacion para FISE - siempre requiere el monto del vale, DNI y debe cubrir el total
    if (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') {
      if (!fiseDni || fiseDni.length !== 8) {
        alert('Debe ingresar un DNI válido de 8 dígitos del beneficiario FISE');
        return;
      }
      if (!amountPaid || parseFloat(amountPaid) <= 0) {
        alert('Debe ingresar el valor del vale FISE');
        return;
      }
      const fiseAmount = parseFloat(amountPaid);
      if (fiseAmount < finalAmountToPay) {
        alert(`El vale FISE (S/ ${fiseAmount.toFixed(2)}) no cubre el total a pagar (S/ ${finalAmountToPay.toFixed(2)}).\n\nSeleccione "Pago Mixto" para combinar FISE con otro metodo de pago.`);
        return;
      }
      paid = fiseAmount;
    }

    // Validaciones para pago mixto
    if (paymentMethod === 'MIXTO') {
      const invalidPayments = mixedPayments.filter(p => !p.amount || parseFloat(p.amount) <= 0);
      if (invalidPayments.length > 0) {
        alert('Todos los metodos de pago deben tener un monto mayor a 0');
        return;
      }

      if (mixedTotal < finalAmountToPay) {
        alert(`El total de pagos (S/ ${mixedTotal.toFixed(2)}) es menor al monto a pagar (S/ ${finalAmountToPay.toFixed(2)})`);
        return;
      }

      paid = mixedTotal;
      mixedDetails = mixedPayments.map(p => ({
        method: p.method,
        label: METHOD_LABELS[p.method] || p.method,
        amount: parseFloat(p.amount)
      }));

      // Recopilar vouchers de cada metodo mixto (excepto efectivo) - solo en modo delivery
      if (!isPreregisterMode) {
        mixedPayments.forEach(p => {
          if (p.method !== 'EFECTIVO' && vouchers[p.method]) {
            finalVouchers[p.method] = vouchers[p.method];
          }
        });
      }

    } else if (paymentMethod !== 'EFECTIVO' && paymentMethod !== 'CREDITO' && !isPreregisterMode) {
      // Pago simple no efectivo - usar voucher del metodo seleccionado (solo en modo delivery)
      // El voucher es obligatorio, la validacion ya se hizo con isPaymentValid
      if (vouchers[paymentMethod]) {
        finalVouchers[paymentMethod] = vouchers[paymentMethod];
      }
    }

    // Preparar detalles de intercambio para enviar
    const detailsReceived = exchangeDetails.map(detail => ({
      id: detail.id,
      product_id: detail.product_id,
      product_name: detail.product_name,
      balloon_type: detail.balloon_type,
      empty_received: parseInt(detail.empty_received) || 0,
      exchange_notes: detail.exchange_notes || '',
      includes_container: false
    }));

    // Agregar items con envase incluido (sin intercambio)
    containerItems.forEach(item => {
      detailsReceived.push({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name || item.product?.name || 'Producto',
        empty_received: 0,
        exchange_notes: 'Venta con envase incluido',
        includes_container: true
      });
    });

    // Preparar devoluciones adicionales: enviar por container_type
    const additionalReturnsFiltered = additionalReturns
      .filter(r => parseInt(r.quantity_returned) > 0)
      .map(r => ({
        container_type: r.container_type,
        quantity_returned: parseInt(r.quantity_returned),
        warehouse_destination_id: r.warehouse_destination_id ? parseInt(r.warehouse_destination_id) : null,
        notes: r.notes || ''
      }));

    // Formato diferente segun el modo
    if (isPreregisterMode) {
      // Modo pre-registro: formato para el backend de pre-registro
      onConfirm({
        payment_details: {
          payment_method: paymentMethod,
          amount_paid: paid,
          change_amount: changeAmount,
          mixed_payment_details: mixedDetails,
          use_ganagas_balance: useGanagasPoints && ganagasDiscount > 0,
          ganagas_amount: ganagasDiscount,
          fise_dni: (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') ? fiseDni : null
        },
        exchange_details: hasExchangeableItems ? detailsReceived : null,
        additional_returns: additionalReturnsFiltered.length > 0 ? additionalReturnsFiltered : null,
        notes: notes || null
      });
    } else {
      // Modo delivery: formato para completar entrega
      const deliveryData = {
        amount_paid: paid,
        change_amount: changeAmount,
        actual_payment_method: paymentMethod,
        vouchers: finalVouchers,
        mixed_payment_details: mixedDetails,
        details_received: detailsReceived,
        additional_returns: additionalReturnsFiltered.length > 0 ? additionalReturnsFiltered : null,
        use_ganagas_balance: useGanagasPoints && ganagasDiscount > 0,
        ganagas_amount: ganagasDiscount,
        fise_dni: (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') ? fiseDni : null
      };

      // Agregar cobro de deuda si está activado
      if (collectDebt) {
        const debtAmount = debtPaymentMethod === 'MIXTO'
          ? debtMixedTotal
          : parseFloat(debtPaymentAmount) || 0;

        if (debtAmount > 0) {
          const debtData = {
            amount: debtAmount,
            payment_method: debtPaymentMethod
          };

          // Agregar DNI FISE si el método es FISE
          if (debtPaymentMethod === 'FISE' || debtPaymentMethod === 'VALE_FISE') {
            debtData.fise_dni = debtFiseDni;
          }

          // Agregar detalles de pago mixto si es MIXTO
          if (debtPaymentMethod === 'MIXTO') {
            debtData.mixed_payment_details = debtMixedPayments.map(p => ({
              method: p.method,
              label: METHOD_LABELS[p.method] || p.method,
              amount: parseFloat(p.amount)
            }));
          }

          // Agregar vouchers de deuda
          const debtFinalVouchers = {};
          if (debtPaymentMethod === 'MIXTO') {
            debtMixedPayments.forEach(p => {
              if (p.method !== 'EFECTIVO' && p.method !== 'CREDITO' && debtVouchers[p.method]) {
                debtFinalVouchers[p.method] = debtVouchers[p.method];
              }
            });
          } else if (debtPaymentMethod !== 'EFECTIVO' && debtPaymentMethod !== 'CREDITO') {
            if (debtVouchers[debtPaymentMethod]) {
              debtFinalVouchers[debtPaymentMethod] = debtVouchers[debtPaymentMethod];
            }
          }

          if (Object.keys(debtFinalVouchers).length > 0) {
            debtData.vouchers = debtFinalVouchers;
          }

          deliveryData.debt_payment = debtData;
        }
      }

      onConfirm(deliveryData);
    }
  };

  const showMixedPayments = paymentMethod === 'MIXTO';
  const showSingleVoucher = paymentMethod !== 'EFECTIVO' && paymentMethod !== 'MIXTO';

  // Metodos mixtos que requieren voucher (todos los que no son efectivo ni credito)
  const methodsRequiringVoucher = showMixedPayments
    ? mixedPayments.filter(p => p.method !== 'EFECTIVO' && p.method !== 'CREDITO')
    : [];

  // Verificar si el metodo de pago requiere voucher (todos excepto efectivo y credito)
  const methodRequiresVoucher = (method) => {
    return !['EFECTIVO', 'CREDITO'].includes(method);
  };

  // Verificar si tiene voucher para un metodo especifico
  const hasVoucherForMethod = (method) => {
    return vouchers[method] && vouchers[method] instanceof File;
  };

  // Verificar si tiene voucher de deuda para un metodo especifico
  const hasDebtVoucherForMethod = (method) => {
    return debtVouchers[method] && debtVouchers[method] instanceof File;
  };

  // Validar si el cobro de deuda es válido
  const isDebtPaymentValid = (() => {
    if (!collectDebt) return true;

    // Si es MIXTO, validar que la suma sea > 0 y que tenga vouchers necesarios
    if (debtPaymentMethod === 'MIXTO') {
      if (debtMixedTotal <= 0) return false;
      if (debtMixedTotal > pendingDebt) return false;

      // Verificar que todos los métodos que requieren voucher lo tengan
      const metodosQueRequierenVoucher = debtMixedPayments.filter(p =>
        methodRequiresVoucher(p.method) && parseFloat(p.amount) > 0
      );
      return metodosQueRequierenVoucher.every(p => hasDebtVoucherForMethod(p.method));
    }

    // FISE requiere DNI válido y voucher
    if (debtPaymentMethod === 'FISE' || debtPaymentMethod === 'VALE_FISE') {
      const dniValido = debtFiseDni && debtFiseDni.length === 8;
      const montoValido = parseFloat(debtPaymentAmount) > 0 && parseFloat(debtPaymentAmount) <= pendingDebt;
      const tieneVoucher = hasDebtVoucherForMethod(debtPaymentMethod);
      return dniValido && montoValido && tieneVoucher;
    }

    // EFECTIVO no requiere voucher
    if (debtPaymentMethod === 'EFECTIVO') {
      const monto = parseFloat(debtPaymentAmount) || 0;
      return monto > 0 && monto <= pendingDebt;
    }

    // Otros métodos (YAPE, PLIN, TRANSFERENCIA) requieren voucher
    const monto = parseFloat(debtPaymentAmount) || 0;
    if (monto <= 0 || monto > pendingDebt) return false;
    return hasDebtVoucherForMethod(debtPaymentMethod);
  })();

  // Calcular si el pago es valido (cubre el total del pedido y tiene vouchers requeridos)
  const isPaymentValid = (() => {
    // En modo preregister no se requieren vouchers
    if (isPreregisterMode) {
      // FISE requiere DNI + monto >= total a pagar (con descuento de puntos)
      if (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') {
        const dniValido = fiseDni && fiseDni.length === 8;
        const montoValido = amountPaid && parseFloat(amountPaid) >= finalAmountToPay;
        return dniValido && montoValido;
      }
      // MIXTO requiere que la suma >= total a pagar
      if (paymentMethod === 'MIXTO') {
        return mixedTotal >= finalAmountToPay;
      }
      return true;
    }

    // Modo delivery: validar montos Y vouchers

    // FISE requiere DNI + monto >= total y voucher
    if (paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') {
      const dniValido = fiseDni && fiseDni.length === 8;
      const montoValido = amountPaid && parseFloat(amountPaid) >= finalAmountToPay;
      const tieneVoucher = hasVoucherForMethod(paymentMethod);
      return dniValido && montoValido && tieneVoucher;
    }

    // MIXTO requiere que la suma >= total y vouchers para metodos que lo requieren
    if (paymentMethod === 'MIXTO') {
      if (mixedTotal < finalAmountToPay) return false;
      // Verificar vouchers para metodos que lo requieren
      const metodosQueRequierenVoucher = mixedPayments.filter(p => methodRequiresVoucher(p.method));
      const todosConVoucher = metodosQueRequierenVoucher.every(p => hasVoucherForMethod(p.method));
      return todosConVoucher;
    }

    // EFECTIVO: si no hay monto, se asume el total; si hay monto, debe ser >= total (sin voucher)
    if (paymentMethod === 'EFECTIVO') {
      return !amountPaid || parseFloat(amountPaid) >= finalAmountToPay;
    }

    // CREDITO: no requiere voucher
    if (paymentMethod === 'CREDITO') {
      return true;
    }

    // Otros metodos (Yape, Plin, Transferencia): requieren voucher
    return hasVoucherForMethod(paymentMethod);
  })();

  // Validacion combinada: pago del pedido + cobro de deuda (si aplica)
  const isFormValid = isPaymentValid && isDebtPaymentValid;

  if (loadingMethods) {
    return (
      <div className="delivery-modal__overlay">
        <div className="delivery-modal">
          <div className="delivery-modal__body" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Cargando metodos de pago...</p>
          </div>
        </div>
      </div>
    );
  }

  // Información adicional para modo preregister
  const delivererName = delivery?.deliverer_name || 'No asignado';

  return (
    <div className="delivery-modal__overlay" onClick={onClose}>
      <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`delivery-modal__header ${isPreregisterMode ? 'delivery-modal__header--preregister' : ''}`}>
          <h2 className="delivery-modal__title">
            {isPreregisterMode ? 'Pre-registrar Pago' : 'Confirmar Entrega'}
          </h2>
          <button className="delivery-modal__close" onClick={onClose}>&times;</button>
        </div>

        <div className="delivery-modal__body">
          {/* Banner informativo para pre-registro */}
          {isPreregisterMode && (
            <div className="delivery-modal__preregister-info">
              <div className="delivery-modal__preregister-icon">📋</div>
              <div className="delivery-modal__preregister-text">
                <strong>Solo pre-registro</strong>
                <span>El pedido NO se marcara como entregado. El repartidor vera este registro y solo debera entregar el producto.</span>
              </div>
            </div>
          )}

          {/* Banner si hay datos pre-registrados (para modo delivery) */}
          {!isPreregisterMode && preregInfo && (
            <div className="delivery-modal__preregistered-banner">
              <div className="delivery-modal__preregistered-icon">✓</div>
              <div className="delivery-modal__preregistered-text">
                <strong>Pago pre-registrado por {preregInfo.payment?.by_user_name || preregInfo.exchange?.by_user_name}</strong>
                <span>Los datos ya fueron registrados. Verifica y confirma la entrega.</span>
              </div>
            </div>
          )}

          {/* Info del pedido */}
          <div className="delivery-modal__order-info">
            <div className="delivery-modal__order-row">
              <span className="delivery-modal__label">Pedido:</span>
              <span className="delivery-modal__value">{orderNumber}</span>
            </div>
            <div className="delivery-modal__order-row">
              <span className="delivery-modal__label">Cliente:</span>
              <span className="delivery-modal__value">{customerName}</span>
            </div>
            {isPreregisterMode && (
              <div className="delivery-modal__order-row">
                <span className="delivery-modal__label">Repartidor:</span>
                <span className="delivery-modal__value delivery-modal__value--deliverer">{delivererName}</span>
              </div>
            )}
            <div className="delivery-modal__order-row delivery-modal__order-row--total">
              <span className="delivery-modal__label">Total del Pedido:</span>
              <span className="delivery-modal__value delivery-modal__value--total">
                S/ {totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Mostrar descuento si se usan puntos */}
            {ganagasDiscount > 0 && (
              <>
                <div className="delivery-modal__order-row delivery-modal__order-row--discount">
                  <span className="delivery-modal__label">Descuento GANAGAS:</span>
                  <span className="delivery-modal__value delivery-modal__value--discount">
                    - S/ {ganagasDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="delivery-modal__order-row delivery-modal__order-row--final">
                  <span className="delivery-modal__label">Total a Cobrar:</span>
                  <span className="delivery-modal__value delivery-modal__value--final">
                    S/ {finalAmountToPay.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Seccion de Puntos GANAGAS */}
          {hasGanagasBalance && (
            <div className="delivery-modal__ganagas-section">
              <div className="delivery-modal__ganagas-header">
                <div className="delivery-modal__ganagas-icon">🎁</div>
                <div className="delivery-modal__ganagas-info">
                  <span className="delivery-modal__ganagas-title">Puntos GANAGAS Disponibles</span>
                  <span className="delivery-modal__ganagas-balance">S/ {ganagasBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Solo mostrar opcion de usar si tiene suficiente saldo */}
              {ganagasBalance >= MIN_GANAGAS_AMOUNT ? (
                <>
                  <div className="delivery-modal__ganagas-toggle">
                    <label className="delivery-modal__ganagas-checkbox">
                      <input
                        type="checkbox"
                        checked={useGanagasPoints}
                        onChange={(e) => {
                          setUseGanagasPoints(e.target.checked);
                          if (!e.target.checked) {
                            setGanagasAmountToUse('');
                          } else {
                            // Por defecto usar el minimo entre saldo y total (respetando minimo)
                            setGanagasAmountToUse(String(Math.min(ganagasBalance, totalAmount)));
                          }
                        }}
                      />
                      <span className="delivery-modal__ganagas-checkbox-text">
                        Usar puntos como descuento
                      </span>
                    </label>
                  </div>

                  {useGanagasPoints && (
                    <div className="delivery-modal__ganagas-amount">
                      <label className="delivery-modal__field-label">
                        Monto a usar (min S/{MIN_GANAGAS_AMOUNT.toFixed(2)}, max S/ {Math.min(ganagasBalance, totalAmount).toFixed(2)})
                      </label>
                      <div className="delivery-modal__ganagas-input-wrapper">
                        <span className="delivery-modal__ganagas-currency">S/</span>
                        <input
                          type="number"
                          className="delivery-modal__input delivery-modal__input--ganagas"
                          value={ganagasAmountToUse}
                          onChange={(e) => {
                            const value = Math.min(
                              parseFloat(e.target.value) || 0,
                              ganagasBalance,
                              totalAmount
                            );
                            setGanagasAmountToUse(String(value > 0 ? value : ''));
                          }}
                          placeholder={`Minimo ${MIN_GANAGAS_AMOUNT.toFixed(2)}`}
                          step="0.01"
                          min={MIN_GANAGAS_AMOUNT}
                          max={Math.min(ganagasBalance, totalAmount)}
                        />
                      </div>
                      <div className="delivery-modal__ganagas-min-warning">
                        Monto minimo a usar: S/{MIN_GANAGAS_AMOUNT.toFixed(2)}
                      </div>
                      {ganagasDiscount > 0 && ganagasDiscount >= MIN_GANAGAS_AMOUNT && (
                        <div className="delivery-modal__ganagas-applied">
                          Se aplicara un descuento de <strong>S/ {ganagasDiscount.toFixed(2)}</strong>
                        </div>
                      )}
                      {ganagasDiscount > 0 && ganagasDiscount < MIN_GANAGAS_AMOUNT && (
                        <div className="delivery-modal__ganagas-error">
                          El monto debe ser al menos S/{MIN_GANAGAS_AMOUNT.toFixed(2)}
                        </div>
                      )}
                      <div className="delivery-modal__ganagas-info-note">
                        Nota: Al usar puntos GANAGAS, esta compra no generara puntos adicionales.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="delivery-modal__ganagas-insufficient">
                  <p className="delivery-modal__ganagas-insufficient-text">
                    El saldo minimo para usar puntos GANAGAS es S/{MIN_GANAGAS_AMOUNT.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}


          {/* Seccion de Crédito del Cliente */}
          {hasCreditInfo && (
            <div className="delivery-modal__credit-section">
              <div className="delivery-modal__credit-header">
                <div className="delivery-modal__credit-icon">💳</div>
                <div className="delivery-modal__credit-info">
                  <span className="delivery-modal__credit-title">Crédito del Cliente</span>
                </div>
              </div>

              <div className="delivery-modal__credit-details">
                <div className="delivery-modal__credit-row">
                  <span className="delivery-modal__credit-label">Límite:</span>
                  <span className="delivery-modal__credit-value" style={{ color: '#3b82f6' }}>
                    S/ {creditLimit.toFixed(2)}
                  </span>
                </div>
                <div className="delivery-modal__credit-row">
                  <span className="delivery-modal__credit-label">Deuda actual:</span>
                  <span className="delivery-modal__credit-value" style={{ color: pendingDebt > 0 ? '#ef4444' : '#10b981' }}>
                    S/ {pendingDebt.toFixed(2)}
                  </span>
                </div>
                <div className="delivery-modal__credit-row">
                  <span className="delivery-modal__credit-label">Disponible:</span>
                  <span className="delivery-modal__credit-value" style={{ color: '#10b981' }}>
                    S/ {creditAvailable.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Opción de cobrar deuda si tiene deuda pendiente */}
              {pendingDebt > 0 && !isPreregisterMode && (
                <div className="delivery-modal__collect-debt">
                  <label className="delivery-modal__collect-checkbox">
                    <input
                      type="checkbox"
                      checked={collectDebt}
                      onChange={(e) => {
                        setCollectDebt(e.target.checked);
                        if (!e.target.checked) {
                          setDebtPaymentAmount('');
                          setDebtPaymentMethod('EFECTIVO');
                          setDebtFiseDni('');
                          setDebtMixedPayments([
                            { method: 'EFECTIVO', amount: '' },
                            { method: 'YAPE', amount: '' }
                          ]);
                          setDebtVouchers({});
                          setDebtVoucherPreviews({});
                        }
                      }}
                    />
                    <span className="delivery-modal__collect-checkbox-text">
                      Cobrar deuda pendiente
                    </span>
                  </label>

                  {collectDebt && (
                    <div className="delivery-modal__debt-payment-form">
                      {/* Método de pago para deuda */}
                      <div className="delivery-modal__field">
                        <label className="delivery-modal__field-label">Método de pago</label>
                        <select
                          className="delivery-modal__select"
                          value={debtPaymentMethod}
                          onChange={(e) => {
                            setDebtPaymentMethod(e.target.value);
                            setDebtPaymentAmount('');
                            setDebtFiseDni('');
                          }}
                        >
                          {paymentMethods
                            .filter(m => m.method_type !== 'CREDITO')
                            .map(method => (
                              <option key={method.method_type} value={method.method_type}>
                                {METHOD_LABELS[method.method_type] || method.method_type}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Pago Mixto para deuda */}
                      {debtPaymentMethod === 'MIXTO' && (
                        <div className="delivery-modal__mixed-payments" style={{ marginTop: '0.75rem' }}>
                          <label className="delivery-modal__field-label">Desglose de Pagos</label>

                          {debtMixedPayments.map((payment, index) => (
                            <div key={index} className="delivery-modal__mixed-row">
                              <select
                                className="delivery-modal__mixed-select"
                                value={payment.method}
                                onChange={(e) => handleDebtMixedPaymentChange(index, 'method', e.target.value)}
                              >
                                {getAvailableDebtMethods(index).map(method => (
                                  <option key={method.method_type} value={method.method_type}>
                                    {METHOD_LABELS[method.method_type] || method.method_type}
                                  </option>
                                ))}
                              </select>
                              <div className="delivery-modal__mixed-amount-wrapper">
                                <span className="delivery-modal__mixed-currency">S/</span>
                                <input
                                  type="number"
                                  className="delivery-modal__mixed-amount"
                                  value={payment.amount}
                                  onChange={(e) => handleDebtMixedPaymentChange(index, 'amount', e.target.value)}
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                              {debtMixedPayments.length > 2 && (
                                <button
                                  type="button"
                                  className="delivery-modal__mixed-remove"
                                  onClick={() => removeDebtMixedPayment(index)}
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            className="delivery-modal__mixed-add"
                            onClick={addDebtMixedPayment}
                          >
                            + Agregar otro metodo
                          </button>

                          {/* Resumen de pagos mixtos de deuda */}
                          <div className={`delivery-modal__mixed-summary ${debtMixedTotal > 0 && debtMixedTotal <= pendingDebt ? 'complete' : 'pending'}`}>
                            <div className="delivery-modal__mixed-summary-row">
                              <span>Total ingresado:</span>
                              <span>S/ {debtMixedTotal.toFixed(2)}</span>
                            </div>
                            {debtMixedTotal > pendingDebt && (
                              <div className="delivery-modal__mixed-summary-row excess">
                                <span>Excede deuda por:</span>
                                <span>S/ {(debtMixedTotal - pendingDebt).toFixed(2)}</span>
                              </div>
                            )}
                            {debtMixedTotal > 0 && debtMixedTotal <= pendingDebt && (
                              <div className="delivery-modal__mixed-summary-row complete">
                                <span>Monto válido</span>
                                <span>✓</span>
                              </div>
                            )}
                          </div>

                          {/* Vouchers para métodos mixtos de deuda */}
                          {debtMixedPayments.filter(p => p.method !== 'EFECTIVO' && p.method !== 'CREDITO' && parseFloat(p.amount) > 0).length > 0 && (
                            <div className="delivery-modal__vouchers-section" style={{ marginTop: '1rem' }}>
                              <label className="delivery-modal__field-label">
                                Comprobantes de Pago - Cobro Deuda
                                <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requeridos)</span>
                              </label>
                              {debtMixedPayments
                                .filter(p => p.method !== 'EFECTIVO' && p.method !== 'CREDITO' && parseFloat(p.amount) > 0)
                                .map((payment) => (
                                  <div key={`debt-voucher-${payment.method}`} className="delivery-modal__voucher-item">
                                    <span className="delivery-modal__voucher-method-label">
                                      {METHOD_LABELS[payment.method] || payment.method}
                                      {payment.amount ? ` - S/ ${parseFloat(payment.amount).toFixed(2)}` : ''}
                                    </span>
                                    <div className="delivery-modal__voucher-upload">
                                      {!debtVoucherPreviews[payment.method] ? (
                                        <label className="delivery-modal__voucher-dropzone-mini">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleDebtVoucherChange(payment.method, e)}
                                            className="delivery-modal__voucher-input"
                                          />
                                          <span>📷 Adjuntar imagen</span>
                                        </label>
                                      ) : (
                                        <div className="delivery-modal__voucher-preview-mini">
                                          <img
                                            src={debtVoucherPreviews[payment.method]}
                                            alt={`Voucher deuda ${payment.method}`}
                                            className="delivery-modal__voucher-thumb"
                                          />
                                          <button
                                            type="button"
                                            className="delivery-modal__voucher-remove-mini"
                                            onClick={() => handleRemoveDebtVoucher(payment.method)}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Monto a cobrar - para métodos NO mixtos */}
                      {debtPaymentMethod !== 'MIXTO' && (
                        <div className="delivery-modal__field">
                          <label className="delivery-modal__field-label">
                            {(debtPaymentMethod === 'FISE' || debtPaymentMethod === 'VALE_FISE')
                              ? 'Valor del Vale FISE'
                              : 'Monto a cobrar'}
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>S/</span>
                            <input
                              type="number"
                              className="delivery-modal__input"
                              value={debtPaymentAmount}
                              onChange={(e) => {
                                const value = Math.min(parseFloat(e.target.value) || 0, pendingDebt);
                                setDebtPaymentAmount(value > 0 ? String(value) : '');
                              }}
                              placeholder="0.00"
                              step="0.01"
                              min="0.01"
                              max={pendingDebt}
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => setDebtPaymentAmount(String(pendingDebt))}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Total
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DNI FISE para cobro de deuda */}
                      {(debtPaymentMethod === 'FISE' || debtPaymentMethod === 'VALE_FISE') && (
                        <div className="delivery-modal__field">
                          <label className="delivery-modal__field-label">
                            DNI del Beneficiario FISE
                            <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requerido)</span>
                          </label>
                          <input
                            type="text"
                            className="delivery-modal__input"
                            value={debtFiseDni}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                              setDebtFiseDni(value);
                            }}
                            placeholder="12345678"
                            maxLength="8"
                          />
                          <p className="delivery-modal__fise-hint">
                            Ingresa el DNI de 8 dígitos del beneficiario FISE
                          </p>
                        </div>
                      )}

                      {/* Voucher para métodos NO efectivo y NO mixto */}
                      {debtPaymentMethod !== 'EFECTIVO' && debtPaymentMethod !== 'MIXTO' && parseFloat(debtPaymentAmount) > 0 && (
                        <div className="delivery-modal__field">
                          <label className="delivery-modal__field-label">
                            Comprobante - {METHOD_LABELS[debtPaymentMethod] || debtPaymentMethod}
                            <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requerido)</span>
                          </label>
                          <div className="delivery-modal__voucher-upload">
                            {!debtVoucherPreviews[debtPaymentMethod] ? (
                              <label className="delivery-modal__voucher-dropzone">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleDebtVoucherChange(debtPaymentMethod, e)}
                                  className="delivery-modal__voucher-input"
                                />
                                <div className="delivery-modal__voucher-placeholder">
                                  <span className="delivery-modal__voucher-icon">📷</span>
                                  <span>Tomar foto o seleccionar</span>
                                  <span className="delivery-modal__voucher-formats">JPEG, PNG o WEBP (max 5MB)</span>
                                </div>
                              </label>
                            ) : (
                              <div className="delivery-modal__voucher-preview">
                                <img
                                  src={debtVoucherPreviews[debtPaymentMethod]}
                                  alt="Preview del comprobante de deuda"
                                  className="delivery-modal__voucher-image"
                                />
                                <button
                                  type="button"
                                  className="delivery-modal__voucher-remove"
                                  onClick={() => handleRemoveDebtVoucher(debtPaymentMethod)}
                                >
                                  Quitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Resumen del cobro de deuda */}
                      {((debtPaymentMethod !== 'MIXTO' && parseFloat(debtPaymentAmount) > 0) ||
                        (debtPaymentMethod === 'MIXTO' && debtMixedTotal > 0)) && (
                        <div style={{
                          background: '#ecfdf5',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          color: '#059669',
                          marginTop: '0.5rem'
                        }}>
                          Se cobrará <strong>S/ {(debtPaymentMethod === 'MIXTO' ? debtMixedTotal : parseFloat(debtPaymentAmount)).toFixed(2)}</strong> de deuda pendiente
                          {!isDebtPaymentValid && (
                            <div style={{ color: '#dc2626', marginTop: '0.25rem' }}>
                              ⚠️ Complete los campos requeridos
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Validación si intenta usar CREDITO y excede el límite */}
              {paymentMethod === 'CREDITO' && creditLimit > 0 && (pendingDebt + totalAmount) > creditLimit && (
                <div style={{
                  background: '#fef2f2',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginTop: '0.75rem',
                  fontSize: '0.8125rem',
                  color: '#dc2626',
                  border: '1px solid #fecaca'
                }}>
                  ⚠️ <strong>Atención:</strong> Este pedido excederá el límite de crédito del cliente.
                  Nueva deuda: S/ {(pendingDebt + totalAmount).toFixed(2)} / Límite: S/ {creditLimit.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Sección de items con envase incluido (sin intercambio) */}
          {containerItems.length > 0 && (
            <div className="delivery-modal__container-items-section">
              <h3 className="delivery-modal__section-title delivery-modal__section-title--container">
                Venta con Envase Incluido
              </h3>
              <p className="delivery-modal__section-subtitle delivery-modal__section-subtitle--container">
                Sin devolución esperada - El cliente compra el envase
              </p>

              {containerItems.map((item, index) => {
                const productIcon = item.product_type === 'BALON_GAS' ? '🔥' :
                                   item.product_type === 'BIDON_AGUA' ? '💧' : '📦';
                return (
                  <div key={`container-${item.id || index}`} className="delivery-modal__container-item">
                    <div className="delivery-modal__container-item-header">
                      <span className="delivery-modal__container-item-icon">{productIcon}</span>
                      <span className="delivery-modal__container-item-name">
                        {item.product_name || item.product?.name || 'Producto'}
                      </span>
                    </div>
                    <div className="delivery-modal__container-item-details">
                      <span className="delivery-modal__container-item-qty">
                        Cantidad: {item.quantity}
                      </span>
                      <span className="delivery-modal__container-item-badge">
                        ENVASE INCLUIDO
                      </span>
                    </div>
                    <div className="delivery-modal__container-item-note">
                      No se espera devolución de envase vacío
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contenedor de 2 columnas para Envases Pendientes e Intercambio */}
          {(hasExchangeableItems || hasPendingLoans) && (
            <div className="delivery-modal__two-columns">
              {/* Sección de Envases Pendientes del Cliente */}
              {hasPendingLoans && (
                <div className="delivery-modal__pending-loans-section">
                  <h3 className="delivery-modal__section-title delivery-modal__section-title--returns">
                    Envases Pendientes
                  </h3>
                  <p className="delivery-modal__section-subtitle">
                    Devoluciones de deuda
                  </p>

                  {customerPendingLoans.map((typeGroup) => {
                    const returnData = getAdditionalReturn(typeGroup.container_type);
                    const hasReturn = parseInt(returnData.quantity_returned) > 0;
                    const productIcon = typeGroup.container_type === 'BALON_GAS' ? '🔥' :
                                       typeGroup.container_type === 'BIDON_AGUA' ? '💧' : '📦';
                    const typeName = getContainerLabel(typeGroup.container_type);

                    return (
                      <div key={`pending-type-${typeGroup.container_type}`} className="delivery-modal__pending-loan-item">
                        <div className="delivery-modal__pending-loan-header">
                          <div className="delivery-modal__pending-loan-product">
                            <span className="delivery-modal__pending-loan-type-icon">{productIcon}</span>
                            <span className="delivery-modal__pending-loan-name">{typeName}</span>
                          </div>
                          <span className="delivery-modal__pending-loan-debt">
                            Debe: {typeGroup.quantity_pending}
                          </span>
                        </div>

                        <div className="delivery-modal__pending-loan-fields">
                          <div className="delivery-modal__pending-loan-field">
                            <label>Devuelve:</label>
                            <input
                              type="number"
                              min="0"
                              max={typeGroup.quantity_pending}
                              value={returnData.quantity_returned}
                              onChange={(e) => handleReturnChange(
                                typeGroup.container_type,
                                'quantity_returned',
                                Math.min(parseInt(e.target.value) || 0, typeGroup.quantity_pending)
                              )}
                              className="delivery-modal__pending-loan-input"
                              placeholder="0"
                            />
                          </div>

                          {hasReturn && warehouses.length > 0 && (
                            <div className="delivery-modal__pending-loan-field delivery-modal__pending-loan-field--warehouse">
                              <label>Almacén:</label>
                              <select
                                value={returnData.warehouse_destination_id}
                                onChange={(e) => handleReturnChange(
                                  typeGroup.container_type,
                                  'warehouse_destination_id',
                                  e.target.value
                                )}
                                className="delivery-modal__pending-loan-select"
                              >
                                {warehouses.map(w => (
                                  <option key={w.id} value={w.id}>
                                    {w.name} {w.is_main && '(Principal)'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Seccion de Intercambio de Balones */}
              {hasExchangeableItems && (
                <div className="delivery-modal__exchange-section">
                  <h3 className="delivery-modal__section-title">
                    Intercambio de Balones
                  </h3>
                  <p className="delivery-modal__section-subtitle">
                    Balones vacios recibidos
                  </p>

                  <div className="delivery-modal__exchange-items-grid">
                  {exchangeDetails.map((detail, index) => {
                    const status = getExchangeStatus(detail);
                    return (
                      <div key={`exchange-${detail.id || index}`} className="delivery-modal__exchange-item">
                        <div className="delivery-modal__exchange-header">
                          <span className="delivery-modal__exchange-product">
                            {detail.product_name}
                          </span>
                          <span className="delivery-modal__exchange-qty">
                            Cant: {detail.quantity}
                          </span>
                        </div>

                        <div className="delivery-modal__exchange-row">
                          <div className="delivery-modal__exchange-field">
                            <label>Recibidos</label>
                            <input
                              type="number"
                              min="0"
                              max={detail.quantity}
                              value={detail.empty_received}
                              onChange={(e) => handleExchangeDetailChange(index, 'empty_received', e.target.value)}
                              className="delivery-modal__exchange-input"
                            />
                          </div>
                          <div
                            className="delivery-modal__exchange-status"
                            style={{ '--status-color': status.color }}
                          >
                            <span className="delivery-modal__exchange-status-dot"></span>
                            {status.label}
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Notas (opcional)"
                          value={detail.exchange_notes}
                          onChange={(e) => handleExchangeDetailChange(index, 'exchange_notes', e.target.value)}
                          className="delivery-modal__exchange-notes-input"
                        />
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metodo de pago */}
          <div className="delivery-modal__field">
            <label className="delivery-modal__field-label">Metodo de Pago Utilizado</label>
            <select
              className="delivery-modal__select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map(method => (
                <option key={method.method_type} value={method.method_type}>
                  {METHOD_LABELS[method.method_type] || method.method_type}
                </option>
              ))}
            </select>
          </div>

          {/* Pagos Mixtos */}
          {showMixedPayments && (
            <div className="delivery-modal__mixed-payments">
              <label className="delivery-modal__field-label">Desglose de Pagos</label>

              {mixedPayments.map((payment, index) => (
                <div key={index} className="delivery-modal__mixed-row">
                  <select
                    className="delivery-modal__mixed-select"
                    value={payment.method}
                    onChange={(e) => handleMixedPaymentChange(index, 'method', e.target.value)}
                  >
                    {getAvailableMethods(index).map(method => (
                      <option key={method.method_type} value={method.method_type}>
                        {METHOD_LABELS[method.method_type] || method.method_type}
                      </option>
                    ))}
                  </select>
                  <div className="delivery-modal__mixed-amount-wrapper">
                    <span className="delivery-modal__mixed-currency">S/</span>
                    <input
                      type="number"
                      className="delivery-modal__mixed-amount"
                      value={payment.amount}
                      onChange={(e) => handleMixedPaymentChange(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {mixedPayments.length > 2 && (
                    <button
                      type="button"
                      className="delivery-modal__mixed-remove"
                      onClick={() => removeMixedPayment(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="delivery-modal__mixed-add"
                onClick={addMixedPayment}
              >
                + Agregar otro metodo
              </button>

              {/* Resumen de pagos mixtos */}
              <div className={`delivery-modal__mixed-summary ${mixedRemaining <= 0 ? 'complete' : 'pending'}`}>
                <div className="delivery-modal__mixed-summary-row">
                  <span>Total ingresado:</span>
                  <span>S/ {mixedTotal.toFixed(2)}</span>
                </div>
                {mixedRemaining > 0 ? (
                  <div className="delivery-modal__mixed-summary-row pending">
                    <span>Falta:</span>
                    <span>S/ {mixedRemaining.toFixed(2)}</span>
                  </div>
                ) : mixedRemaining < 0 ? (
                  <div className="delivery-modal__mixed-summary-row excess">
                    <span>Excedente:</span>
                    <span>S/ {Math.abs(mixedRemaining).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="delivery-modal__mixed-summary-row complete">
                    <span>Monto completo</span>
                    <span>✓</span>
                  </div>
                )}
              </div>

              {/* Vouchers para metodos mixtos que no son efectivo - solo en modo delivery */}
              {!isPreregisterMode && methodsRequiringVoucher.length > 0 && (
                <div className="delivery-modal__vouchers-section">
                  <label className="delivery-modal__field-label" style={{ marginTop: '16px' }}>
                    Comprobantes de Pago
                    <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requeridos)</span>
                  </label>
                  {methodsRequiringVoucher.map((payment) => (
                    <div key={payment.method} className="delivery-modal__voucher-item">
                      <span className="delivery-modal__voucher-method-label">
                        {METHOD_LABELS[payment.method] || payment.method}
                        {payment.amount ? ` - S/ ${parseFloat(payment.amount).toFixed(2)}` : ''}
                      </span>
                      <div className="delivery-modal__voucher-upload">
                        {!voucherPreviews[payment.method] ? (
                          <label className="delivery-modal__voucher-dropzone-mini">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVoucherChange(payment.method, e)}
                              className="delivery-modal__voucher-input"
                            />
                            <span>📷 Adjuntar imagen</span>
                          </label>
                        ) : (
                          <div className="delivery-modal__voucher-preview-mini">
                            <img
                              src={voucherPreviews[payment.method]}
                              alt={`Voucher ${payment.method}`}
                              className="delivery-modal__voucher-thumb"
                            />
                            <button
                              type="button"
                              className="delivery-modal__voucher-remove-mini"
                              onClick={() => handleRemoveVoucher(payment.method)}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Monto pagado - para efectivo */}
          {paymentMethod === 'EFECTIVO' && (
            <div className="delivery-modal__field">
              <label className="delivery-modal__field-label">Monto Recibido (opcional)</label>
              <input
                type="number"
                className="delivery-modal__input"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={`S/ ${totalAmount.toFixed(2)}`}
                step="0.01"
                min="0"
              />
              {changeAmount > 0 && (
                <div className="delivery-modal__change">
                  Vuelto: <strong>S/ {changeAmount.toFixed(2)}</strong>
                </div>
              )}
            </div>
          )}

          {/* DNI del beneficiario FISE - visible cuando es FISE */}
          {(paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') && (
            <div className="delivery-modal__field">
              <label className="delivery-modal__field-label">
                DNI del Beneficiario FISE
                <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requerido)</span>
              </label>
              <input
                type="text"
                className="delivery-modal__input"
                value={fiseDni}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setFiseDni(value);
                }}
                placeholder="12345678"
                maxLength="8"
                required
              />
              <p className="delivery-modal__fise-hint">
                Ingresa el DNI de 8 dígitos del beneficiario FISE
              </p>
            </div>
          )}

          {/* Monto del vale FISE - siempre visible cuando es FISE */}
          {(paymentMethod === 'FISE' || paymentMethod === 'VALE_FISE') && (
            <div className="delivery-modal__field">
              <label className="delivery-modal__field-label">
                Valor del Vale FISE
                <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requerido)</span>
              </label>
              <div className="delivery-modal__fise-input-wrapper">
                <span className="delivery-modal__fise-currency">S/</span>
                <input
                  type="number"
                  className="delivery-modal__input delivery-modal__input--fise"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Ej: 16.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <p className="delivery-modal__fise-hint">
                Ingresa el valor exacto del vale FISE recibido
              </p>
              {amountPaid && parseFloat(amountPaid) < finalAmountToPay && (
                <div className="delivery-modal__fise-warning">
                  <div className="delivery-modal__fise-warning-icon">⚠️</div>
                  <div className="delivery-modal__fise-warning-content">
                    <strong>El vale no cubre el total</strong>
                    <span>Diferencia: S/ {(finalAmountToPay - parseFloat(amountPaid)).toFixed(2)}</span>
                    <span className="delivery-modal__fise-warning-hint">Use "Pago Mixto" para combinar FISE con otro metodo</span>
                  </div>
                </div>
              )}
              {amountPaid && parseFloat(amountPaid) >= finalAmountToPay && (
                <div className="delivery-modal__fise-complete">
                  Vale cubre el total del pedido
                </div>
              )}
            </div>
          )}

          {/* Voucher de pago simple (no efectivo, no mixto) - solo en modo delivery */}
          {!isPreregisterMode && showSingleVoucher && paymentMethod !== 'CREDITO' && (
            <div className="delivery-modal__field">
              <label className="delivery-modal__field-label">
                Comprobante de Pago - {METHOD_LABELS[paymentMethod] || paymentMethod}
                <span className="delivery-modal__field-hint delivery-modal__field-hint--required">(Requerido)</span>
              </label>
              <div className="delivery-modal__voucher-upload">
                {!voucherPreviews[paymentMethod] ? (
                  <label className="delivery-modal__voucher-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleVoucherChange(paymentMethod, e)}
                      className="delivery-modal__voucher-input"
                    />
                    <div className="delivery-modal__voucher-placeholder">
                      <span className="delivery-modal__voucher-icon">📷</span>
                      <span>Tomar foto o seleccionar</span>
                      <span className="delivery-modal__voucher-formats">JPEG, PNG o WEBP (max 5MB)</span>
                    </div>
                  </label>
                ) : (
                  <div className="delivery-modal__voucher-preview">
                    <img
                      src={voucherPreviews[paymentMethod]}
                      alt="Preview del comprobante"
                      className="delivery-modal__voucher-image"
                    />
                    <button
                      type="button"
                      className="delivery-modal__voucher-remove"
                      onClick={() => handleRemoveVoucher(paymentMethod)}
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campo de notas - siempre visible en preregister, opcional en delivery */}
          {isPreregisterMode && (
            <div className="delivery-modal__field">
              <label className="delivery-modal__field-label">
                Notas para el repartidor
                <span className="delivery-modal__field-hint">(Opcional)</span>
              </label>
              <textarea
                className="delivery-modal__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: El cliente pago con billete de S/100, dar vuelto de S/52..."
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="delivery-modal__footer">
          <button
            className="delivery-modal__btn delivery-modal__btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={`delivery-modal__btn ${isPreregisterMode ? 'delivery-modal__btn--preregister' : 'delivery-modal__btn--confirm'} ${!isFormValid ? 'delivery-modal__btn--disabled' : ''}`}
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Procesando...' : (isPreregisterMode ? 'Guardar Pre-registro' : 'Confirmar Entrega')}
          </button>
        </div>
      </div>

      <ModalAlerta
        isOpen={ganagasAlert}
        onClose={() => setGanagasAlert(false)}
        title="Monto minimo GANAGAS"
        message={
          <>
            <p>El monto minimo a utilizar de puntos GANAGAS es:</p>
            <div className="modal-alerta-amount">
              <span className="modal-alerta-amount-currency">S/</span>
              {MIN_GANAGAS_AMOUNT.toFixed(2)}
            </div>
          </>
        }
        type="ganagas"
        buttonText="Entendido"
      />
    </div>
  );
};

export default DeliveryModal;
