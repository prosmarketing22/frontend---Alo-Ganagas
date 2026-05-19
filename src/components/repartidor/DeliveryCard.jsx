// SVG Icons
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1z"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <path d="M22 4L12 14.01l-3-3"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/**
 * Formatea la fecha/hora de registro en zona horaria de Lima, Perú
 * Muestra: DD/MM/YYYY HH:MM:SS
 */
const formatRegistrationDateTime = (dateString) => {
  if (!dateString) return 'Sin fecha';

  try {
    const date = new Date(dateString);

    // Formatear en zona horaria de Lima, Perú
    const options = {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('es-PE', options);
    const parts = formatter.formatToParts(date);

    // Construir fecha en formato DD/MM/YYYY HH:MM:SS
    const getPart = (type) => parts.find(p => p.type === type)?.value || '00';

    return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

const LocationCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <path d="M9 10l2 2 4-4"/>
  </svg>
);

export const DeliveryCard = ({ delivery, onStart, onArrived, onComplete }) => {
  const getStatusConfig = (status) => {
    const configs = {
      ASIGNADO: {
        label: 'Asignado',
        class: 'assigned',
        Icon: ClockIcon
      },
      EN_CAMINO: {
        label: 'En Camino',
        class: 'onway',
        Icon: TruckIcon
      },
      ENTREGADO: {
        label: 'Entregado',
        class: 'delivered',
        Icon: CheckCircleIcon
      }
    };
    return configs[status] || configs.ASIGNADO;
  };

  // Normalizar los datos del pedido (el backend envía estructura plana)
  const orderStatus = delivery.order_status || delivery.status || 'ASIGNADO';
  const customerName = delivery.customer_name || delivery.customer?.full_name || 'Cliente';
  const customerAddress = delivery.delivery_address || delivery.customer?.address || 'Sin direccion';
  const customerPhone = delivery.customer_phone || delivery.customer?.phone || 'Sin telefono';
  const totalAmount = parseFloat(delivery.total || delivery.total_amount || 0);
  const orderNumber = delivery.order_number || `#${delivery.id}`;
  const orderDetails = delivery.details || [];
  const orderDateTime = delivery.order_datetime || null;

  // Informacion de pre-registro
  const hasPreregistration = delivery.has_preregistration || false;
  const preregistrationInfo = delivery.preregistration_info || null;

  const statusConfig = getStatusConfig(orderStatus);
  const StatusIcon = statusConfig.Icon;

  return (
    <div className="delivery-card">
      {/* Status Bar */}
      <div className={`delivery-card__status-bar delivery-card__status-bar--${statusConfig.class}`}></div>

      <div className="delivery-card__content">
        {/* Banner de Pre-registro */}
        {hasPreregistration && (
          <div className="delivery-card__preregistration-banner">
            <div className="delivery-card__preregistration-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
            </div>
            <div className="delivery-card__preregistration-content">
              <span className="delivery-card__preregistration-title">Pago Pre-registrado</span>
              <span className="delivery-card__preregistration-by">
                Por: {preregistrationInfo?.payment?.by_user_name || preregistrationInfo?.exchange?.by_user_name || 'Usuario'}
              </span>
              {preregistrationInfo?.notes && (
                <span className="delivery-card__preregistration-notes">
                  Nota: {preregistrationInfo.notes}
                </span>
              )}
            </div>
            <span className="delivery-card__preregistration-badge">Solo entregar</span>
          </div>
        )}

        {/* Header */}
        <div className="delivery-card__header">
          <div className="delivery-card__order-info">
            <div className={`delivery-card__order-icon delivery-card__order-icon--${statusConfig.class}`}>
              <StatusIcon />
            </div>
            <div className="delivery-card__order-details">
              <h3 className="delivery-card__order-number">Pedido {orderNumber}</h3>
              <p className="delivery-card__customer-name">{customerName}</p>
              {orderDateTime && (
                <p className="delivery-card__registration-date">
                  <CalendarIcon />
                  <span>{formatRegistrationDateTime(orderDateTime)}</span>
                </p>
              )}
            </div>
          </div>
          <span className={`delivery-card__badge delivery-card__badge--${statusConfig.class}`}>
            <span className="delivery-card__badge-dot"></span>
            {statusConfig.label}
          </span>
        </div>

        {/* Customer Info */}
        <div className="delivery-card__info">
          <div className="delivery-card__info-item delivery-card__info-item--full">
            <div className="delivery-card__info-icon">
              <MapPinIcon />
            </div>
            <div className="delivery-card__info-content">
              <span className="delivery-card__info-label">Direccion</span>
              <span className="delivery-card__info-value">{customerAddress}</span>
            </div>
          </div>
          <div className="delivery-card__info-item">
            <div className="delivery-card__info-icon">
              <PhoneIcon />
            </div>
            <div className="delivery-card__info-content">
              <span className="delivery-card__info-label">Telefono</span>
              <span className="delivery-card__info-value">{customerPhone}</span>
            </div>
          </div>
          <div className="delivery-card__info-item">
            <div className="delivery-card__info-icon">
              <DollarIcon />
            </div>
            <div className="delivery-card__info-content">
              <span className="delivery-card__info-label">Total</span>
              <span className="delivery-card__info-value delivery-card__info-value--highlight">
                S/ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="delivery-card__products">
          <div className="delivery-card__products-header">
            <span className="delivery-card__products-title">
              <PackageIcon />
              Productos
            </span>
            <span className="delivery-card__products-count">
              {orderDetails.length} items
            </span>
          </div>
          {orderDetails.length > 0 && (
            <div className="delivery-card__products-list">
              {orderDetails.map((detail, idx) => (
                <div key={idx} className={`delivery-card__product-item ${detail.includes_container ? 'delivery-card__product-item--container' : ''}`}>
                  <div className="delivery-card__product-name-wrapper">
                    <span className="delivery-card__product-name">
                      {detail.product_name || detail.product?.name || 'Producto'}
                    </span>
                    {detail.includes_container && (
                      <span className="container-sale-badge">Venta con Envase</span>
                    )}
                  </div>
                  <span className="delivery-card__product-qty">x{detail.quantity}</span>
                </div>
              ))}
            </div>
          )}
          {orderDetails.some(d => d.includes_container) && (
            <div className="container-sale-notice">
              <span className="container-sale-notice__icon">&#9432;</span>
              <span>Sin devolucion de envase vacio</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="delivery-card__actions">
          {orderStatus === 'ASIGNADO' && (
            <button
              onClick={() => onStart(delivery.id)}
              className="delivery-card__btn delivery-card__btn--start"
            >
              <PlayIcon />
              Iniciar Entrega
            </button>
          )}
          {orderStatus === 'EN_CAMINO' && !delivery.arrived_at && (
            <button
              onClick={() => onArrived(delivery.id)}
              className="delivery-card__btn delivery-card__btn--arrived"
            >
              <LocationCheckIcon />
              <BellIcon />
              Llegue - Notificar
            </button>
          )}
          {orderStatus === 'EN_CAMINO' && delivery.arrived_at && (
            <div className="delivery-card__arrived-badge">
              <CheckCircleIcon />
              <span>Cliente notificado</span>
            </div>
          )}
          {orderStatus === 'EN_CAMINO' && (
            <button
              onClick={() => onComplete(delivery)}
              className="delivery-card__btn delivery-card__btn--complete"
            >
              <CheckIcon />
              Marcar Entregado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
