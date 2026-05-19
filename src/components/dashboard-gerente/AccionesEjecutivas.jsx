import { useNavigate } from 'react-router-dom';

export const AccionesEjecutivas = () => {
  const navigate = useNavigate();

  const acciones = [
    {
      titulo: 'Gestion de Personal',
      descripcion: 'Administrar colaboradores',
      colorClass: 'azul',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      ruta: '/collaborators'
    },
    {
      titulo: 'Control de Inventario',
      descripcion: 'Ver stock y movimientos',
      colorClass: 'verde',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      ruta: '/inventory'
    },
    {
      titulo: 'Configuracion Sistema',
      descripcion: 'Parametros generales',
      colorClass: 'gris',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      ruta: '/settings/configurations'
    },
    {
      titulo: 'Gestion Almacenes',
      descripcion: 'Configurar almacenes',
      colorClass: 'mostaza',
      icono: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      ruta: '/catalogs/warehouses'
    }
  ];

  return (
    <div className="acciones-ejecutivas">
      <h2 className="acciones-ejecutivas__titulo">Acciones Ejecutivas</h2>

      <div className="acciones-ejecutivas__grid">
        {acciones.map((accion, index) => (
          <button
            key={index}
            onClick={() => navigate(accion.ruta)}
            className={`acciones-ejecutivas__boton acciones-ejecutivas__boton--${accion.colorClass}`}
          >
            <div className="acciones-ejecutivas__icono">
              {accion.icono}
            </div>
            <div>
              <p className="acciones-ejecutivas__boton-titulo">{accion.titulo}</p>
              <p className="acciones-ejecutivas__boton-descripcion">{accion.descripcion}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
