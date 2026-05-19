export const PRODUCT_TYPES = {
  BALON_GAS: 'BALON_GAS',
  BIDON_AGUA: 'BIDON_AGUA',
  ACCESORIO: 'ACCESORIO'
};

export const PRODUCT_TYPE_LABELS = {
  [PRODUCT_TYPES.BALON_GAS]: 'Balón de Gas',
  [PRODUCT_TYPES.BIDON_AGUA]: 'Bidón de Agua',
  [PRODUCT_TYPES.ACCESORIO]: 'Accesorio'
};

export const PRODUCT_TYPE_OPTIONS = [
  { value: PRODUCT_TYPES.BALON_GAS, label: PRODUCT_TYPE_LABELS[PRODUCT_TYPES.BALON_GAS] },
  { value: PRODUCT_TYPES.BIDON_AGUA, label: PRODUCT_TYPE_LABELS[PRODUCT_TYPES.BIDON_AGUA] },
  { value: PRODUCT_TYPES.ACCESORIO, label: PRODUCT_TYPE_LABELS[PRODUCT_TYPES.ACCESORIO] }
];

export const CONTAINER_TYPE_LABELS = {
  BALON_GAS: 'Balón de Gas',
  BIDON_AGUA: 'Bidón de Agua'
};

export const getContainerLabel = (containerType) => {
  return CONTAINER_TYPE_LABELS[containerType] || containerType;
};

// ========================================
// CONFIGURACIONES DEL SISTEMA (Sincronizadas con backend)
// ========================================
export const CONFIG_KEYS = {
  // Claves principales usadas por el backend
  BONO_PATROCINIO: 'BONO_PATROCINIO',
  BONO_DIEZ_REFERIDOS: 'BONO_DIEZ_REFERIDOS',
  BONO_CUMPLEANOS: 'BONO_CUMPLEANOS',
  MINIMO_USO_SALDO: 'MINIMO_USO_SALDO',
  BONO_LEALTAD: 'BONO_LEALTAD',
  PURCHASES_FOR_MAINTENANCE: 'PURCHASES_FOR_MAINTENANCE'
};

export const CONFIG_LABELS = {
  [CONFIG_KEYS.BONO_PATROCINIO]: {
    name: 'Bono por Patrocinio',
    description: 'Monto que recibe el patrocinador cuando su referido hace su primera compra',
    icon: '🎁',
    category: 'bonos'
  },
  [CONFIG_KEYS.BONO_DIEZ_REFERIDOS]: {
    name: 'Bono por 10 Referidos',
    description: 'Monto especial cuando un cliente alcanza 10 referidos activos',
    icon: '🏆',
    category: 'bonos'
  },
  [CONFIG_KEYS.BONO_CUMPLEANOS]: {
    name: 'Bono de Cumpleaños',
    description: 'Monto que se otorga al cliente en el dia de su cumpleaños',
    icon: '🎂',
    category: 'bonos'
  },
  [CONFIG_KEYS.MINIMO_USO_SALDO]: {
    name: 'Saldo Minimo para Usar',
    description: 'Monto minimo en soles que debe tener el cliente para usar su saldo GANAGAS',
    icon: '💰',
    category: 'ventas'
  },
  [CONFIG_KEYS.BONO_LEALTAD]: {
    name: 'Bono de Lealtad',
    description: 'Monto del bono de lealtad por compras recurrentes',
    icon: '⭐',
    category: 'bonos'
  },
  [CONFIG_KEYS.PURCHASES_FOR_MAINTENANCE]: {
    name: 'Compras para Mantenimiento',
    description: 'Cantidad de compras requeridas para acceder al mantenimiento de cocina gratis',
    icon: '🔥',
    category: 'beneficios'
  }
};

export const CRITICAL_CONFIG_KEYS = Object.values(CONFIG_KEYS);

export const getConfigLabel = (key) => {
  return CONFIG_LABELS[key]?.name || key;
};

export const getConfigInfo = (key) => {
  return CONFIG_LABELS[key] || { name: key, description: '', icon: '⚙️', category: 'otros' };
};

// ========================================
// ASISTENCIAS
// ========================================
export const ATTENDANCE_TYPES = {
  NORMAL: { value: 'NORMAL', label: 'Presente', color: '#22c55e', bgColor: '#dcfce7', icon: '✓' },
  FALTA: { value: 'FALTA', label: 'Ausente', color: '#ef4444', bgColor: '#fee2e2', icon: '✗' },
  TARDANZA: { value: 'TARDANZA', label: 'Tardanza', color: '#eab308', bgColor: '#fef9c3', icon: '⏰' }
};

export const ROLE_COLORS = {
  REPARTIDOR: { color: '#3b82f6', bg: '#dbeafe' },
  BASE: { color: '#a855f7', bg: '#f3e8ff' },
  CONTABILIDAD: { color: '#f59e0b', bg: '#fef3c7' },
  GERENTE: { color: '#10b981', bg: '#d1fae5' }
};

// ========================================
// ESTADOS DE ENTIDAD
// ========================================
export const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};

export const ENTITY_STATUS_CONFIG = {
  [ENTITY_STATUS.ACTIVE]: {
    label: 'Activo',
    color: '#22c55e',
    bgColor: '#dcfce7',
    textColor: '#166534',
    icon: '●'
  },
  [ENTITY_STATUS.INACTIVE]: {
    label: 'Inactivo',
    color: '#eab308',
    bgColor: '#fef9c3',
    textColor: '#854d0e',
    icon: '○'
  },
  [ENTITY_STATUS.DELETED]: {
    label: 'Eliminado',
    color: '#ef4444',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    icon: '✗'
  }
};

export const ENTITY_STATUS_OPTIONS = [
  { value: ENTITY_STATUS.ACTIVE, label: ENTITY_STATUS_CONFIG[ENTITY_STATUS.ACTIVE].label },
  { value: ENTITY_STATUS.INACTIVE, label: ENTITY_STATUS_CONFIG[ENTITY_STATUS.INACTIVE].label }
];

export const getEntityStatusConfig = (status) => {
  return ENTITY_STATUS_CONFIG[status] || ENTITY_STATUS_CONFIG[ENTITY_STATUS.ACTIVE];
};
