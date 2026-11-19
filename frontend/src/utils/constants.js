// ============================================================================
// КОМПЛЕКСЫ И КОРПУСА
// ============================================================================
export const ALL_COMPLEXES = 'Все комплексы';

export const COMPLEXES = [
  ALL_COMPLEXES,
  'Логопарк «Север»',
  'Логопарк «Юг»',
];

// Отдельно — список для выбора при создании склада (без "Все комплексы")
export const COMPLEX_OPTIONS = ['Логопарк «Север»', 'Логопарк «Юг»'];

export const BUILDINGS = ['А', 'Б', 'В'];

// ============================================================================
// СТАТУСЫ СКЛАДОВ
// ============================================================================
export const WAREHOUSE_STATUS = {
  FREE: 'Свободен',
  OCCUPIED: 'Занят',
  REPAIR: 'Ремонт',
  EMERGENCY: 'Аварийное',
};

export const WAREHOUSE_STATUS_STYLES = {
  [WAREHOUSE_STATUS.FREE]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  [WAREHOUSE_STATUS.OCCUPIED]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  [WAREHOUSE_STATUS.REPAIR]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  [WAREHOUSE_STATUS.EMERGENCY]: 'bg-red-50 text-red-700 ring-red-600/20',
};

// ============================================================================
// ТЕМПЕРАТУРНЫЕ РЕЖИМЫ
// ============================================================================
export const TEMP_MODES = [
  { value: 'standard', label: 'Отапливаемый (+15…+25 °C)' },
  { value: 'cool', label: 'Холодильный (+2…+8 °C)' },
  { value: 'freezer', label: 'Морозильный (-18…-25 °C)' },
];

// Удобный поиск короткой подписи по value
export const TEMP_MODE_LABELS = TEMP_MODES.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

// ============================================================================
// СТАТУСЫ ДОГОВОРОВ
// ============================================================================
export const CONTRACT_STATUS = {
  DRAFT: 'Черновик',
  MEETING_SCHEDULED: 'Назначена встреча для подписания',
  ACTIVE: 'Действует (подписан)',
  TERMINATED: 'Расторгнут',
};

export const CONTRACT_STATUS_STYLES = {
  [CONTRACT_STATUS.DRAFT]: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  [CONTRACT_STATUS.MEETING_SCHEDULED]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  [CONTRACT_STATUS.ACTIVE]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  [CONTRACT_STATUS.TERMINATED]: 'bg-red-50 text-red-700 ring-red-600/20',
};

// ============================================================================
// СТАТУСЫ КОНТРАГЕНТОВ (надёжность)
// ============================================================================
export const COUNTERPARTY_STATUS = {
  TRUSTED: 'Благонадежный / Рекомендован',
  DELAYED: 'Есть задержки оплаты',
  BLACKLIST: 'В черном списке / Не заселять',
};

export const COUNTERPARTY_STATUS_STYLES = {
  [COUNTERPARTY_STATUS.TRUSTED]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  [COUNTERPARTY_STATUS.DELAYED]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  [COUNTERPARTY_STATUS.BLACKLIST]: 'bg-red-50 text-red-700 ring-red-600/20',
};

// ============================================================================
// СТАТУСЫ ЗАЯВОК
// ============================================================================
export const REQUEST_STATUS = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Выполнено',
  CANCELLED: 'Отменена',
};

export const REQUEST_STATUS_STYLES = {
  [REQUEST_STATUS.NEW]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  [REQUEST_STATUS.IN_PROGRESS]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  [REQUEST_STATUS.COMPLETED]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  [REQUEST_STATUS.CANCELLED]: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

// ============================================================================
// УРОВНИ СРОЧНОСТИ (SLA)
// ============================================================================
export const URGENCY = {
  EMERGENCY: 'Аварийная',
  URGENT: 'Срочная',
  PLANNED: 'Плановая',
};

export const URGENCY_LABELS = {
  [URGENCY.EMERGENCY]: 'Аварийная (до 2 ч)',
  [URGENCY.URGENT]: 'Срочная (до 24 ч)',
  [URGENCY.PLANNED]: 'Плановая (до 3 дн)',
};

export const URGENCY_STYLES = {
  [URGENCY.EMERGENCY]: 'bg-red-50 text-red-700 ring-red-600/20',
  [URGENCY.URGENT]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  [URGENCY.PLANNED]: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

// ============================================================================
// ТИПЫ СЧЁТЧИКОВ
// ============================================================================
export const METER_TYPE = {
  ELECTRICITY: 'Электричество',
  WATER: 'Вода',
  HEATING: 'Отопление',
};

export const METER_TYPE_UNIT = {
  [METER_TYPE.ELECTRICITY]: 'кВт·ч',
  [METER_TYPE.WATER]: 'м³',
  [METER_TYPE.HEATING]: 'Гкал',
};

// ============================================================================
// СТАТУСЫ ПОКАЗАНИЙ СЧЁТЧИКОВ
// ============================================================================
export const READING_STATUS = {
  PENDING: 'Ожидает проверки',
  ACCEPTED: 'Принято',
  REJECTED: 'Отклонено',
};

export const READING_STATUS_STYLES = {
  [READING_STATUS.PENDING]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  [READING_STATUS.ACCEPTED]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  [READING_STATUS.REJECTED]: 'bg-red-50 text-red-700 ring-red-600/20',
};

// ============================================================================
// РОЛИ
// ============================================================================
export const ROLE = {
  MANAGER: 'manager',
  TENANT: 'tenant',
};

export const ROLE_LABEL = {
  [ROLE.MANAGER]: 'Управляющий складом',
  [ROLE.TENANT]: 'Арендатор',
};

// ============================================================================
// НАВИГАЦИЯ БОКОВОГО МЕНЮ
// ============================================================================
export const MANAGER_NAV = [
  { to: '/manager/warehouses', label: 'Помещения' },
  { to: '/manager/counterparties', label: 'Контрагенты' },
  { to: '/manager/meters', label: 'Счетчики' },
  { to: '/manager/requests', label: 'Заявки' },
];

export const TENANT_NAV = [
  { to: '/tenant/my-warehouse', label: 'Мой склад' },
  { to: '/tenant/meters', label: 'Счетчики' },
  { to: '/tenant/requests', label: 'Заявки' },
];

// ============================================================================
// ПАГИНАЦИЯ
// ============================================================================
export const PAGE_SIZE = 10;