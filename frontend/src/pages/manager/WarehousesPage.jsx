import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, RotateCcw, FileText, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatArea } from '../../utils/format';
import { 
  BUILDINGS, TEMP_MODES, TEMP_MODE_LABELS, PAGE_SIZE,
  WAREHOUSE_STATUS
} from '../../utils/constants';
import PnLSummary from '../../components/domain/PnLSummary';
import WarehouseForm from '../../components/domain/WarehouseForm';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

// Маппинг статусов для Badge
const STATUS_VARIANTS = {
  [WAREHOUSE_STATUS.FREE]: 'success',
  [WAREHOUSE_STATUS.OCCUPIED]: 'info',
  [WAREHOUSE_STATUS.REPAIR]: 'warning',
  [WAREHOUSE_STATUS.EMERGENCY]: 'danger',
};

export default function WarehousesPage() {
  const { premises, activeComplex } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Фильтры
  const [search, setSearch] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTemp, setFilterTemp] = useState('');

  const resetFilters = () => {
    setSearch('');
    setFilterBuilding('');
    setFilterStatus('');
    setFilterTemp('');
    setPage(1);
  };

  // Фильтрация
  const filteredPremises = useMemo(() => {
    return premises.filter((p) => {
      // Фильтр по комплексу из шапки
      if (activeComplex !== 'Все комплексы' && p.complex !== activeComplex) return false;
      
      // Поиск по номеру
      if (search && !p.number.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Фильтр по корпусу
      if (filterBuilding && p.building !== filterBuilding) return false;
      
      // Фильтр по статусу
      if (filterStatus && p.status !== filterStatus) return false;
      
      // Фильтр по темп. режиму
      if (filterTemp && p.temp_mode !== filterTemp) return false;

      return true;
    });
  }, [premises, activeComplex, search, filterBuilding, filterStatus, filterTemp]);

  // Пагинация
  const totalPages = Math.ceil(filteredPremises.length / PAGE_SIZE);
  const currentPremises = filteredPremises.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="animate-fade-in pb-10">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Складские помещения</h1>
          <p className="text-sm text-slate-500 mt-1">Реестр объектов, техническая паспортизация и аренда</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
          Добавить склад
        </Button>
      </div>

      {/* P&L Сводка */}
      <PnLSummary />

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft mb-6 flex flex-wrap gap-3 items-end">
        <div className="w-full sm:w-64">
          <Input 
            placeholder="Поиск по номеру..." 
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="w-full sm:w-40">
          <Select 
            placeholder="Все корпуса"
            value={filterBuilding}
            onChange={(e) => { setFilterBuilding(e.target.value); setPage(1); }}
            options={BUILDINGS.map(b => ({ value: `Корпус ${b}`, label: `Корпус ${b}` }))}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select 
            placeholder="Все статусы"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            options={Object.values(WAREHOUSE_STATUS).map(s => ({ value: s, label: s }))}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select 
            placeholder="Все режимы"
            value={filterTemp}
            onChange={(e) => { setFilterTemp(e.target.value); setPage(1); }}
            options={TEMP_MODES.map(t => ({ value: t.value, label: t.label }))}
          />
        </div>

        <Button variant="ghost" onClick={resetFilters} icon={<RotateCcw className="w-4 h-4" />}>
          Сбросить
        </Button>
      </div>

      {/* Таблица */}
      {currentPremises.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Корпус</TableHead>
                <TableHead>Площадь</TableHead>
                <TableHead>Темп. режим</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Договор</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPremises.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-slate-900">{p.number}</TableCell>
                  <TableCell>{p.building}</TableCell>
                  <TableCell>{formatArea(p.area)}</TableCell>
                  <TableCell className="text-sm text-slate-500">{TEMP_MODE_LABELS[p.temp_mode] || p.temp_mode}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[p.status] || 'neutral'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.contract ? (
                      <Link to={`/manager/warehouses/${p.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md transition">
                        <FileText className="w-4 h-4" /> PDF
                      </Link>
                    ) : (
                      <Link to={`/manager/warehouses/${p.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-md transition">
                        Оформить
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/manager/warehouses/${p.id}`}>
                      <Button variant="secondary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Открыть
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-soft">
            <span className="text-sm text-slate-500 mb-2 sm:mb-0">
              Всего найдено: <span className="font-semibold text-slate-900">{filteredPremises.length}</span> помещений
            </span>
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Помещения не найдены" 
          description="По вашему запросу нет подходящих складов. Попробуйте изменить фильтры."
          action={<Button onClick={resetFilters} variant="secondary">Сбросить фильтры</Button>}
        />
      )}

      {/* Модалка создания */}
      <WarehouseForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}