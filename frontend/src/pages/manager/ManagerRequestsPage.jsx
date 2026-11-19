import { useState, useMemo } from 'react';
import { Plus, Search, RotateCcw, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate } from '../../utils/format';
import { 
  REQUEST_STATUS, URGENCY, URGENCY_LABELS, PAGE_SIZE 
} from '../../utils/constants';
import CreateRequestModal from '../../components/domain/CreateRequestModal';
import RequestModal from '../../components/domain/RequestModal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const URGENCY_VARIANTS = {
  [URGENCY.EMERGENCY]: 'danger',
  [URGENCY.URGENT]: 'warning',
  [URGENCY.PLANNED]: 'neutral',
};

export default function ManagerRequestsPage() {
  const { requests, premises, tenants, contracts, activeComplex, completeRequest } = useAppContext();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterUrgency('');
    setPage(1);
  };

  // Обогащаем данные
  const enrichedRequests = useMemo(() => {
    return requests.map(r => {
      const p = premises.find(pr => pr.id === r.premises_id) || {};
      
      // Ищем активный договор для этого помещения, чтобы узнать арендатора
      const contract = contracts.find(c => c.premises_id === p.id && c.status === 'active');
      const tenant = contract ? tenants.find(t => t.id === contract.tenant_id) : null;
      
      return { request: r, premises: p, tenant };
    }).filter(item => {
      if (activeComplex !== 'Все комплексы' && item.premises.complex !== activeComplex) return false;
      if (search && !item.request.title.toLowerCase().includes(search.toLowerCase()) && !item.request.id.includes(search)) return false;
      if (filterStatus && item.request.status !== filterStatus) return false;
      if (filterUrgency && item.request.urgency !== filterUrgency) return false;
      return true;
    }).sort((a, b) => new Date(b.request.created_at) - new Date(a.request.created_at));
  }, [requests, premises, contracts, tenants, activeComplex, search, filterStatus, filterUrgency]);

  const totalPages = Math.ceil(enrichedRequests.length / PAGE_SIZE);
  const currentRequests = enrichedRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleQuickComplete = (id, currentCost) => {
    if (!currentCost) {
      toast.error('Сначала укажите стоимость в карточке заявки');
      setSelectedRequest(requests.find(r => r.id === id));
      return;
    }
    completeRequest(id, currentCost);
    toast.success('Заявка закрыта');
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Заявки на обслуживание</h1>
          <p className="text-sm text-slate-500 mt-1">Диспетчерская ремонтов и учет затрат</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
          Создать заявку
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft mb-6 flex flex-wrap gap-3 items-end">
        <div className="w-full sm:w-56">
          <Input 
            placeholder="Поиск по теме или ID..." 
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
            options={[
              { value: REQUEST_STATUS.IN_PROGRESS, label: REQUEST_STATUS.IN_PROGRESS },
              { value: REQUEST_STATUS.COMPLETED, label: REQUEST_STATUS.COMPLETED }
            ]}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select 
            placeholder="Вся срочность"
            value={filterUrgency}
            onChange={(e) => { setFilterUrgency(e.target.value); setPage(1); }}
            options={Object.values(URGENCY).map(u => ({ value: u, label: URGENCY_LABELS[u] }))}
          />
        </div>

        <Button variant="ghost" onClick={resetFilters} icon={<RotateCcw className="w-4 h-4" />}>
          Сбросить
        </Button>
      </div>

      {currentRequests.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ / Дата</TableHead>
                <TableHead>Помещение</TableHead>
                <TableHead>Неисправность</TableHead>
                <TableHead>Срочность</TableHead>
                <TableHead>Стоимость</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRequests.map(({ request, premises }) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{request.id}</div>
                    <div className="text-xs text-slate-500">{formatDate(request.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{premises.number || '—'}</div>
                    <div className="text-xs text-slate-500">{premises.building}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.title}>
                    {request.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={URGENCY_VARIANTS[request.urgency] || 'neutral'}>
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.repair_cost ? (
                      <span className="font-medium text-slate-900">{formatMoney(request.repair_cost)}</span>
                    ) : (
                      <span className="text-slate-400 text-sm">Не указана</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={request.status === REQUEST_STATUS.COMPLETED ? 'success' : 'warning'}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(request)}>
                        Посмотреть
                      </Button>
                      {request.status === REQUEST_STATUS.IN_PROGRESS && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleQuickComplete(request.id, request.repair_cost)}
                          title="Завершить"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-soft">
            <span className="text-sm text-slate-500 mb-2 sm:mb-0">
              Всего найдено: <span className="font-semibold text-slate-900">{enrichedRequests.length}</span> заявок
            </span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Заявок не найдено" 
          description="По вашему запросу нет активных или завершенных заявок."
          action={<Button onClick={resetFilters} variant="secondary">Сбросить фильтры</Button>}
        />
      )}

      <CreateRequestModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      <RequestModal 
        key={selectedRequest?.id} // Важно: сбрасывает стейт внутри модалки при смене заявки!
        isOpen={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
        request={selectedRequest}
        premises={premises.find(p => p.id === selectedRequest?.premises_id)}
        tenant={selectedRequest ? enrichedRequests.find(e => e.request.id === selectedRequest.id)?.tenant : null}
      />
    </div>
  );
}