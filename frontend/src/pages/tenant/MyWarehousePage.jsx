import { useMemo } from 'react';
import { Building2, MapPin, Download, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatArea, formatMoney, formatDate, formatDateTime } from '../../utils/format';
import { TEMP_MODE_LABELS, CONTRACT_STATUS } from '../../utils/constants';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_VARIANTS = {
  draft: 'neutral',
  signing_scheduled: 'info',
  active: 'success',
};

export default function MyWarehousePage() {
  const { user } = useAuth();
  const { contracts, premises } = useAppContext();
  const toast = useToast();

  // Получаем только договоры текущего арендатора
  const myContracts = useMemo(() => {
    if (!user?.tenant_id) return [];
    
    return contracts.filter(c => 
      c.tenant_id === user.tenant_id && 
      ['draft', 'signing_scheduled', 'active'].includes(c.status)
    ).map(contract => {
      const premisesData = premises.find(p => p.id === contract.premises_id);
      return { contract, premises: premisesData };
    }).filter(item => item.premises); // Отсеиваем, если помещение не найдено
  }, [contracts, premises, user]);

  const handleDownloadPdf = () => {
    toast.success('Договор сформирован и скачан в формате PDF');
  };

  if (myContracts.length === 0) {
    return (
      <div className="animate-fade-in pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Мои арендованные помещения</h1>
        <EmptyState 
          title="У вас пока нет активных договоров" 
          description="Здесь появятся ваши склады после оформления договоров аренды."
          icon={<Building2 className="w-6 h-6" />}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Мои арендованные помещения</h1>
        <p className="text-sm text-slate-500 mt-1">Управление вашими складами и документами</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {myContracts.map(({ contract, premises }) => (
          <div key={contract.id} className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden flex flex-col h-full">
            {/* Шапка карточки */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Бокс {premises.number}</h2>
                <p className="text-sm text-slate-500">{premises.building}, {premises.complex}</p>
              </div>
              <Badge variant={STATUS_VARIANTS[contract.status] || 'neutral'}>
                {CONTRACT_STATUS[contract.status.toUpperCase()]}
              </Badge>
            </div>

            <div className="p-5 space-y-4 flex-1">
              {/* Плашка о встрече */}
              {contract.status === 'signing_scheduled' && contract.meeting_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-blue-800">
                  <Calendar className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Требуется подписание</p>
                    <p>Очный выезд: {formatDateTime(contract.meeting_date)}</p>
                  </div>
                </div>
              )}

              {/* Адрес */}
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                <span>{premises.address}</span>
              </div>

              {/* Тех. характеристики */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-slate-50 p-3 rounded-lg text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Площадь</span>
                  <span className="font-medium text-slate-900">{formatArea(premises.area)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Высота ворот</span>
                  <span className="font-medium text-slate-900">{premises.gate_height} м</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Нагрузка на пол</span>
                  <span className="font-medium text-slate-900">{premises.floor_load} т/м²</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Темп. режим</span>
                  <span className="font-medium text-slate-900 truncate" title={TEMP_MODE_LABELS[premises.temp_mode]}>
                    {TEMP_MODE_LABELS[premises.temp_mode]?.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Данные договора */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">№ Договора</span>
                  <span className="font-medium text-slate-900">{contract.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Срок действия</span>
                  <span className="font-medium text-slate-900">{formatDate(contract.date_from)} — {formatDate(contract.date_to)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ставка</span>
                  <span className="font-bold text-indigo-600">{formatMoney(contract.rate_rub_month)} / мес</span>
                </div>
              </div>
            </div>

            {/* Кнопка PDF */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <Button variant="secondary" className="w-full" icon={<Download className="w-4 h-4" />} onClick={handleDownloadPdf}>
                Скачать договор (PDF)
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}