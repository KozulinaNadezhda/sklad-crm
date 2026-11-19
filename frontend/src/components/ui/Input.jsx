import { useId } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Стилизованное поле ввода с поддержкой label и ошибок.
 */
export default function Input({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 
            focus:outline-none focus:ring-2 transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30 bg-red-50/30'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'
            }
          `}
          {...props}
        />
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