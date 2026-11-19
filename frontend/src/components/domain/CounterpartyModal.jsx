import { useMemo } from 'react';
import { Phone, Mail, MapPin, User, ShieldAlert, History } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate } from '../../utils/format';
import { COUNTERPARTY_STATUS, CONTRACT_STATUS } from '../../utils/constants';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

const STATUS_VARIANTS = {
  [COUNTERPARTY_STATUS.TRUSTED]: 'success',
  [COUNTERPARTY_STATUS.DELAYED]: 'warning',
  [COUNTERPARTY_STATUS.BLACKLIST]: 'danger',
};

export default function CounterpartyModal({ isOpen, onClose, tenant }) {
  const { contracts, premises, updateTenantStatus } = useAppContext();
  const toast = useToast();

  // Формируем историю аренды: берем и прошлые записи из mockData, и текущие договоры из AppContext
  const rentalHistory = useMemo(() => {
    if (!tenant) return [];

    const history = [];
    const seenPremises = new Set();

    // 1. Добавляем данные из договоров (самые актуальные)
    contracts
      .filter((c) => c.tenant_id === tenant.id)
      .forEach((c) => {
        const p = premises.find((pr) => pr.id === c.premises_id);
        if (p) {
          history.push({
            id: c.id,
            premisesName: `${p.number} (${p.building})`,
            dateFrom: c.date_from,
            dateTo: c.date_to,
            rate: c.rate_rub_month,
            status: c.status,
          });
          seenPremises.add(c.premises_id);
        }
      });

    // 2. Добавляем прошлые аренды из rental_history, если их нет в договорах
    (tenant.rental_history || []).forEach((h) => {
      if (!seenPremises.has(h.premises_id)) {
        const p = premises.find((pr) => pr.id === h.premises_id);
        if (p) {
          history.push({
            id: `hist-${h.premises_id}-${h.date_from}`,
            premisesName: `${p.number} (${p.building})`,
            dateFrom: h.date_from,
            dateTo: h.date_to,
            rate: null, // В истории нет ставки
            status: 'terminated',
          });
        }
      }
    });

    return history.sort((a, b) => new Date(b.dateFrom) - new Date(a.dateFrom));
  }, [tenant, contracts, premises]);

  if (!tenant) return null;

  const handleStatusChange = (e) => {
    updateTenantStatus(tenant.id, e.target.value);
    toast.success('Статус надежности обновлен');
  };

  // Активные договоры (для подсчета объема)
  const activeContracts = contracts.filter(c => c.tenant_id === tenant.id && c.status === 'active');
  const totalMonthlyVolume = activeContracts.reduce((sum, c) => sum + Number(c.rate_rub_month), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Карточка контрагента" size="lg">
      <div className="space-y-6">
        {/* Блок: Реквизиты */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{tenant.name}</h3>
                <Badge variant="neutral">{tenant.type}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">ИНН: {tenant.inn} {tenant.kpp ? `· КПП: ${tenant.kpp}` : ''}</p>
            </div>
            <Badge variant={STATUS_VARIANTS[tenant.reliability_status] || 'neutral'}>
              {tenant.reliability_status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{tenant.contact_name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{tenant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{tenant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate" title={tenant.legal_address}>{tenant.legal_address}</span>
            </div>
          </div>
        </div>

        {/* Блок: Финансы и статус */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Сумма активных договоров</p>
            <p className="text-xl font-bold text-slate-900">{formatMoney(totalMonthlyVolume)} <span className="text-sm font-normal text-slate-500">/ мес</span></p>
            <p className="text-xs text-slate-500 mt-1">{activeContracts.length} активных договора</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Текущий долг</p>
            <p className={`text-xl font-bold ${tenant.debt_amount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatMoney(tenant.debt_amount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{tenant.debt_amount > 0 ? 'Требуется взыскание' : 'Задолженности нет'}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft flex flex-col justify-center">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Надежность
            </label>
            <select
              value={tenant.reliability_status}
              onChange={handleStatusChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
            >
              {Object.values(COUNTERPARTY_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Блок: История аренды */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> История и текущие аренды
          </h4>
          {rentalHistory.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Помещение</th>
                    <th className="px-4 py-2.5">Период</th>
                    <th className="px-4 py-2.5">Ставка</th>
                    <th className="px-4 py-2.5">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rentalHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{item.premisesName}</td>
                      <td className="px-4 py-2.5 text-slate-600 text-xs">
                        {formatDate(item.dateFrom)} — {item.dateTo ? formatDate(item.dateTo) : 'наст. время'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{item.rate ? formatMoney(item.rate) : '—'}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={
                          item.status === 'active' ? 'success' : 
                          item.status === 'signing_scheduled' ? 'info' : 
                          item.status === 'terminated' ? 'danger' : 'neutral'
                        }>
                          {CONTRACT_STATUS[item.status.toUpperCase()] || item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center">
              У этого контрагента пока нет истории аренды.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}