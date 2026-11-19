import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatMoney } from '../../utils/format';

export default function PnLSummary() {
  const { pnl } = useAppContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Доходы */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Доходы (Активные договоры)</p>
          <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {formatMoney(pnl.income)}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>

      {/* Расходы */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Расходы (Ремонты по заявкам)</p>
          <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {formatMoney(pnl.expenses)}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
          <ArrowDownRight className="w-5 h-5" />
        </div>
      </div>

      {/* Прибыль */}
      <div className={`border rounded-xl p-4 shadow-soft flex items-center justify-between transition-colors
        ${pnl.profit >= 0 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-red-50/50 border-red-100'}`}
      >
        <div>
          <p className={`text-sm font-medium mb-1 ${pnl.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            Чистая прибыль
          </p>
          <h3 className={`text-2xl font-bold tracking-tight ${pnl.profit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
            {formatMoney(pnl.profit)}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
          ${pnl.profit >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}
        >
          <Wallet className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}