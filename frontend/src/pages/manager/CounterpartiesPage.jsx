import { useState, useMemo } from 'react';
import { Search, RotateCcw, Plus, History } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatMoney } from '../../utils/format';
import { COUNTERPARTY_STATUS, PAGE_SIZE } from '../../utils/constants';
import CounterpartyModal from '../../components/domain/CounterpartyModal';
import TenantForm from '../../components/domain/TenantForm';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const STATUS_VARIANTS = {
  [COUNTERPARTY_STATUS.TRUSTED]: 'success',
  [COUNTERPARTY_STATUS.DELAYED]: 'warning',
  [COUNTERPARTY_STATUS.BLACKLIST]: 'danger',
};

export default function CounterpartiesPage() {
  const { tenants, contracts, premises } = useAppContext();
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setPage(1);
  };

  // Фильтрация
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        t.name.toLowerCase().includes(searchLower) || 
        t.inn.includes(searchLower) || 
        t.phone.includes(searchLower);
      
      if (!matchesSearch) return false;
      if (filterStatus && t.reliability_status !== filterStatus) return false;

      return true;
    });
  }, [tenants, search, filterStatus]);

  // Пагинация
  const totalPages = Math.ceil(filteredTenants.length / PAGE_SIZE);
  const currentTenants = filteredTenants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Хелпер для получения активных боксов
  const getActiveBoxes = (tenantId) => {
    const activeContracts = contracts.filter(c => c.tenant_id === tenantId && c.status === 'active');
    return activeContracts.map(c => {
      const p = premises.find(pr => pr.id === c.premises_id);
      return p ? p.number : '';
    }).filter(Boolean);
  };

  const openDetails = (tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in pb-10">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Контрагенты</h1>
          <p className="text-sm text-slate-500 mt-1">База арендаторов, финансовая дисциплина и история</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
          Добавить контрагента
        </Button>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft mb-6 flex flex-wrap gap-3 items-end">
        <div className="w-full sm:w-80">
          <Input 
            placeholder="Поиск по названию, ИНН или телефону..." 
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="w-full sm:w-64">
          <Select 
            placeholder="Все статусы надежности"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            options={Object.values(COUNTERPARTY_STATUS).map(s => ({ value: s, label: s }))}
          />
        </div>

        <Button variant="ghost" onClick={resetFilters} icon={<RotateCcw className="w-4 h-4" />}>
          Сбросить
        </Button>
      </div>

      {/* Таблица */}
      {currentTenants.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Компания</TableHead>
                <TableHead>Контакт</TableHead>
                <TableHead>Активные склады</TableHead>
                <TableHead>Долг</TableHead>
                <TableHead>Надежность</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTenants.map((tenant) => {
                const activeBoxes = getActiveBoxes(tenant.id);
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{tenant.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">ИНН: {tenant.inn}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900">{tenant.contact_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{tenant.phone}</div>
                    </TableCell>
                    <TableCell>
                      {activeBoxes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {activeBoxes.map(box => (
                            <span key={box} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                              {box}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Нет</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${tenant.debt_amount > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {formatMoney(tenant.debt_amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[tenant.reliability_status] || 'neutral'}>
                        {tenant.reliability_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        icon={<History className="w-3.5 h-3.5" />}
                        onClick={() => openDetails(tenant)}
                      >
                        История
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-soft">
            <span className="text-sm text-slate-500 mb-2 sm:mb-0">
              Всего найдено: <span className="font-semibold text-slate-900">{filteredTenants.length}</span> контрагентов
            </span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Контрагенты не найдены" 
          description="Попробуйте изменить поисковый запрос или сбросить фильтры."
          action={<Button onClick={resetFilters} variant="secondary">Сбросить фильтры</Button>}
        />
      )}

      {/* Модалки */}
      <CounterpartyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tenant={selectedTenant} 
      />
      
      <TenantForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
}