/**
 * Базовый контейнер-карточка.
 */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Шапка карточки (опционально).
 */
export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Контентная часть карточки (с паддингами).
 */
export function CardContent({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}