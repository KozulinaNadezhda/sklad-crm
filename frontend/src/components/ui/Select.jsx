import { useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Стилизованный выпадающий список.
 * 
 * @param {Array} options - [{ value, label }]
 * @param {string} placeholder - если нужно пустое значение по умолчанию
 */
export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  id,
  children,
  ...props
}) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          className={`
            appearance-none w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 
            focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}