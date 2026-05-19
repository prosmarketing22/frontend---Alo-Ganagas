import { useNavigate } from 'react-router-dom';

export const OperacionesPendientes = ({ operaciones = {}, loading = false }) => {
  const navigate = useNavigate();

  const items = [
    {
      titulo: 'Pedidos Pendientes',
      valor: operaciones?.pedidos_pendientes || 0,
      colorClass: 'naranja',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      ruta: '/orders'
    },
    {
      titulo: 'Productos Stock Bajo',
      valor: operaciones?.stock_bajo || 0,
      colorClass: 'rojo',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      ruta: '/inventory'
    },
    {
      titulo: 'Cobros Pendientes',
      valor: operaciones?.cobros_pendientes_count || 0,
      monto: operaciones?.cobros_pendientes_monto
        ? `S/ ${parseFloat(operaciones.cobros_pendientes_monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
        : 'S/ 0.00',
      colorClass: 'azul',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      ruta: '/orders'
    }
  ];

  if (loading) {
    return (
      <div className="operaciones-pendientes operaciones-pendientes__loading">
        <h2 className="operaciones-pendientes__titulo">Operaciones Pendientes</h2>
        <div className="operaciones-pendientes__lista">
          {[1, 2, 3].map(i => (
            <div key={i} className="operaciones-pendientes__item">
              <div className="operaciones-pendientes__item-bar"></div>
              <div className="operaciones-pendientes__item-bar"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="operaciones-pendientes">
      <h2 className="operaciones-pendientes__titulo">Operaciones Pendientes</h2>

      <div className="operaciones-pendientes__lista">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.ruta)}
            className={`operaciones-pendientes__item operaciones-pendientes__item--${item.colorClass}`}
          >
            <div className="operaciones-pendientes__item-content">
              <div className="operaciones-pendientes__item-info">
                <div className={`operaciones-pendientes__item-icono operaciones-pendientes__item-icono--${item.colorClass}`}>
                  {item.icono}
                </div>
                <div>
                  <p className="operaciones-pendientes__item-titulo">{item.titulo}</p>
                  <div className="operaciones-pendientes__item-valores">
                    <p className={`operaciones-pendientes__item-valor operaciones-pendientes__item-valor--${item.colorClass}`}>
                      {item.valor}
                    </p>
                    {item.monto && (
                      <span className="operaciones-pendientes__item-monto">{item.monto}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="operaciones-pendientes__item-flecha">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
