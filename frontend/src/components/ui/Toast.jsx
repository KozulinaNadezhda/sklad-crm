import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Визуальный контейнер для всплывающих уведомлений.
 * Используется внутри ToastContext.jsx.
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-card border animate-slide-up bg-white min-w-[280px] max-w-md
            ${t.type === 'success' ? 'border-emerald-200' : ''}
            ${t.type === 'error' ? 'border-red-200' : ''}
            ${t.type === 'info' ? 'border-blue-200' : ''}
          `}
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
          
          <span className="text-sm font-medium text-slate-700 flex-1">{t.message}</span>
          
          <button
            onClick={() => onRemove(t.id)}
            className="text-slate-400 hover:text-slate-600 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}