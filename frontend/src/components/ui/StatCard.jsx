import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Карточка показателя для P&L и статистики.
 * 
 * @param {string} title - название метрики
 * @param {string|number} value - числовое значение (отформатированное)
 * @param {React.ReactNode} icon - иконка
 * @param {string} color - 'indigo' | 'emerald' | 'red' | 'amber' | 'slate'
 * @param {object} trend - { value: string, isPositive: boolean }
 */
export default function StatCard({ title, value, icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {value}
        </h3>
        {trend && (
          <span className={`inline-flex items-center text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}