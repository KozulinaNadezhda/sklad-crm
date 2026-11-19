import { useState, useMemo } from 'react';
import { Eye, Check, X, Zap, Droplet, Flame, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber } from '../../utils/format';
import { 
  READING_STATUS, METER_TYPE, METER_TYPE_UNIT, PAGE_SIZE 
} from '../../utils/constants';
import MeterPhotoModal from '../../components/domain/MeterPhotoModal';
import RejectReasonModal from '../../components/domain/RejectReasonModal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const STATUS_VARIANTS = {
  [READING_STATUS.PENDING]: 'info',
  [READING_STATUS.ACCEPTED]: 'success',
  [READING_STATUS.REJECTED]: 'danger',
};

const METER_ICONS = {
  [METER_TYPE.ELECTRICITY]: <Zap className="w-4 h-4 text-amber-500" />,
  [METER_TYPE.WATER]: <Droplet className="w-4 h-4 text-blue-500" />,
  [METER_TYPE.HEATING]: <Flame className="w-4 h-4 text-orange-500" />,
};

export default function ManagerMetersPage() {
  const { readings, meters, premises, tenants, activeComplex, acceptReading } = useAppContext();
  const toast = useToast();

  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [selectedReading, setSelectedReading] = useState(null);
  const [rejectId, setRejectId] = useState(null);

  const resetFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setSearch('');
    setPage(1);
  };

  // Обогащаем данные для таблицы
  const enrichedReadings = useMemo(() => {
    return readings.map(r => {
      const meter = meters.find(m => m.id === r.meter_id) || {};
      const p = premises.find(pr => pr.id === meter.premises_id) || {};
      const tenant = tenants.find(t => t.id === r.tenant_id) || {};
      
      return { reading: r, meter, premises: p, tenant };
    }).filter(item => {
      if (activeComplex !== 'Все комплексы' && item.premises.complex !== activeComplex) return false;
      if (search && !item.premises.number?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && item.reading.status !== filterStatus) return false;
      if (filterType && item.meter.type !== filterType) return false;
      return true;
    }).sort((a, b) => new Date(b.reading.date) - new Date(a.reading.date));
  }, [readings, meters, premises, tenants, activeComplex, search, filterStatus, filterType]);

  // Пагинация
  const totalPages = Math.ceil(enrichedReadings.length / PAGE_SIZE);
  const currentReadings = enrichedReadings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAccept = (id) => {
    acceptReading(id);
    toast.success('Показания успешно приняты');
    setSelectedReading(null);
  };

  const handleRejectClick = (reading) => {
    setSelectedReading(null);
    setRejectId(reading.id);
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Проверка показаний</h1>
          <p className="text-sm text-slate-500 mt-1">Прием и валидация данных с приборов учета</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft mb-6 flex flex-wrap gap-3 items-end">
        <div className="w-full sm:w-56">
          <Input 
            placeholder="Поиск по номеру..." 
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select 
            placeholder="Все статусы"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            options={Object.values(READING_STATUS).map(s => ({ value: s, label: s }))}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select 
            placeholder="Все приборы"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            options={Object.values(METER_TYPE).map(t => ({ value: t, label: t }))}
          />
        </div>

        <Button variant="ghost" onClick={resetFilters} icon={<X className="w-4 h-4" />}>
          Сбросить
        </Button>
      </div>

      {currentReadings.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Помещение</TableHead>
                <TableHead>Арендатор</TableHead>
                <TableHead>Прибор</TableHead>
                <TableHead className="text-right">Предыдущее</TableHead>
                <TableHead className="text-right">Текущее</TableHead>
                <TableHead className="text-center">Фото</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReadings.map(({ reading, meter, premises, tenant }) => {
                const unit = METER_TYPE_UNIT[meter.type] || '';
                const diff = Number(reading.current_value) - Number(reading.previous_value);

                return (
                  <TableRow key={reading.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{premises.number || '—'}</div>
                      <div className="text-xs text-slate-500">{premises.building}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{tenant.name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {METER_ICONS[meter.type]}
                        <div>
                          <div className="font-medium text-slate-900">{meter.type}</div>
                          <div className="text-xs font-mono text-slate-500">{meter.serial_number}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatNumber(reading.previous_value)} <span className="text-xs">{unit}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-slate-900">
                        {formatNumber(reading.current_value)} <span className="text-xs text-slate-500">{unit}</span>
                      </div>
                      <div className="text-xs text-indigo-600 font-medium">+{formatNumber(diff)}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => setSelectedReading({ reading, meter, premises, tenant })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Фото
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={STATUS_VARIANTS[reading.status] || 'neutral'}>
                          {reading.status}
                        </Badge>
                        {reading.status === READING_STATUS.REJECTED && reading.rejection_reason && (
                          <span className="text-[10px] text-red-500 max-w-[120px] leading-tight" title={reading.rejection_reason}>
                            {reading.rejection_reason}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {reading.status === READING_STATUS.PENDING ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleAccept(reading.id)}
                            title="Принять"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleRejectClick(reading)}
                            title="Отклонить"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          {reading.status === READING_STATUS.ACCEPTED ? 'Подтверждено' : 'Отклонено'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-soft">
            <span className="text-sm text-slate-500 mb-2 sm:mb-0">
              Всего найдено: <span className="font-semibold text-slate-900">{enrichedReadings.length}</span> показаний
            </span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Показаний не найдено" 
          description="По вашему запросу нет данных. Попробуйте изменить фильтры."
          action={<Button onClick={resetFilters} variant="secondary">Сбросить фильтры</Button>}
        />
      )}

      <MeterPhotoModal 
        isOpen={!!selectedReading} 
        onClose={() => setSelectedReading(null)} 
        data={selectedReading}
        onAccept={handleAccept}
        onReject={handleRejectClick}
      />

      <RejectReasonModal 
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        readingId={rejectId}
      />
    </div>
  );
}