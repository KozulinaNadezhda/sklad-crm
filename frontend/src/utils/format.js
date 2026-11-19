// ============================================================================
// ФОРМАТИРОВАНИЕ ЧИСЕЛ И ДЕНЕГ
// ============================================================================

/**
 * Форматирует сумму в рублях.
 * @param {number|string} value — число или строка с числом
 * @param {{ compact?: boolean, withSymbol?: boolean }} options
 *        compact — компактный вид ("1,2 млн ₽")
 *        withSymbol — добавлять ли символ ₽
 * @returns {string} например "125 400 ₽"
 */
export function formatMoney(value, options = {}) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';

  const { compact = false, withSymbol = true } = options;

  if (compact) {
    const abs = Math.abs(num);
    if (abs >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1).replace('.', ',')} млн ₽`;
    }
    if (abs >= 1_000) {
      return `${Math.round(num / 1_000)} тыс ₽`;
    }
    return `${num} ₽`;
  }

  return new Intl.NumberFormat('ru-RU', {
    style: withSymbol ? 'currency' : 'decimal',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Форматирует обычное число с разделителями тысяч.
 */
export function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
}

/**
 * Форматирует площадь: "240 м²".
 */
export function formatArea(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(num)} м²`;
}

// ============================================================================
// ФОРМАТИРОВАНИЕ ДАТ
// ============================================================================

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * "15.03.2026"
 */
export function formatDate(value) {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * "15 марта 2026"
 */
export function formatDateLong(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * "15.03.2026, 14:30"
 */
export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/**
 * "14:30"
 */
export function formatTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Возвращает "YYYY-MM-DD" — удобно для <input type="date" />
 */
export function toInputDate(value) {
  const d = toDate(value);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Возвращает "YYYY-MM-DDTHH:mm" — для <input type="datetime-local" />
 */
export function toInputDateTime(value) {
  const d = toDate(value);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}