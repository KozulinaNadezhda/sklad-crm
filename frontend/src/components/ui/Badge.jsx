/**
 * Универсальный цветной бейдж-пилюля.
 * 
 * @param {string} variant - 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'primary'
 * @param {React.ReactNode} children - текст или содержимое
 */
export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    warning: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    danger: 'bg-red-50 text-red-700 ring-red-600/20',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    primary: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap
        ${variants[variant] || variants.neutral}
        ${className}
      `}
    >
      {children}
    </span>
  );
}