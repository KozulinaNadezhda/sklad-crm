import { useState, useMemo } from 'react';
import { Send, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { URGENCY, URGENCY_LABELS, REQUEST_STATUS } from '../../utils/constants';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const URGENCY_VARIANTS = {
  [URGENCY.EMERGENCY]: 'danger',
  [URGENCY.URGENT]: 'warning',
  [URGENCY.PLANNED]: 'neutral',
};

export default function TenantRequestsPage() {
  const { user } = useAuth();
  const { contracts, premises, requests, createRequest } = useAppContext();
  const toast = useToast();

  const [formData, setFormData] = useState({
    premises_id: '',
    urgency: URGENCY.URGENT,
    title: '',
    description: '',
    photo_url: '',
  });

  // Список помещений текущего арендатора
  const myPremises = useMemo(() => {
    if (!user?.tenant_id) return [];
    const myContracts = contracts.filter(c => c.tenant_id === user.tenant_id && c.status === 'active');
    return myContracts.map(c => premises.find(p => p.id === c.premises_id)).filter(Boolean);
  }, [contracts, premises, user]);

  // История заявок (фильтруем по помещениям арендатора)
  const myPremisesIds = myPremises.map(p => p.id);
  const myRequests = useMemo(() => {
    return requests
      .filter(r => myPremisesIds.includes(r.premises_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [requests, myPremisesIds]);

  // Устанавливаем первое помещение по умолчанию, если его нет
  if (myPremises.length > 0 && !formData.premises_id) {
    setFormData(prev => ({ ...prev, premises_id: myPremises[0].id }));
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.premises_id || !formData.title || !formData.description) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    createRequest({
      ...formData,
      created_by_name: user?.name || 'Арендатор',
    });

    toast.success('Заявка успешно отправлена');
    
    // Сброс формы
    setFormData({
      premises_id: myPremises[0]?.id || '',
      urgency: URGENCY.URGENT,
      title: '',
      description: '',
      photo_url: '',
    });
  };

  if (myPremises.length === 0) {
    return (
      <div className="animate-fade-in pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Ваши заявки на обслуживание</h1>
        <EmptyState 
          title="Нет активных помещений" 
          description="Создание заявок доступно только после активации договора аренды."
          icon={<AlertCircle className="w-6 h-6" />}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ваши заявки на обслуживание</h1>
        <p className="text-sm text-slate-500 mt-1">Сообщите о неисправности, и мы отправим бригаду</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Форма создания */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-500" /> Новая заявка
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Помещение"
                name="premises_id"
                value={formData.premises_id}
                onChange={handleChange}
                required
                options={myPremises.map(p => ({ value: p.id, label: `Бокс ${p.number} (${p.building})` }))}
              />

              <Select
                label="Уровень срочности"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                options={Object.values(URGENCY).map(u => ({ value: u, label: URGENCY_LABELS[u] }))}
              />

              <Input
                label="Тема неисправности"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: Течет кран"
                required
              />

              <Textarea
                label="Описание проблемы"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Опишите детали..."
                rows={3}
                required
              />

              <div>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 text-sm transition-colors cursor-pointer
                  ${formData.photo_url ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 hover:bg-slate-50 text-slate-500'}">
                  {formData.photo_url ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {formData.photo_url ? 'Фото прикреплено' : 'Прикрепить фото'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Отправить заявку
              </Button>
            </form>
          </div>
        </div>

        {/* История */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">История обращений</h2>
          {myRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата / Тема</TableHead>
                  <TableHead>Помещение</TableHead>
                  <TableHead>Срочность</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map(req => {
                  const p = premises.find(pr => pr.id === req.premises_id);
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{req.title}</div>
                        <div className="text-xs text-slate-500">{formatDate(req.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">Бокс {p?.number}</div>
                        <div className="text-xs text-slate-500">{p?.building}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={URGENCY_VARIANTS[req.urgency] || 'neutral'}>
                          {req.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.status === REQUEST_STATUS.COMPLETED ? 'success' : 'warning'}>
                          {req.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              У вас пока нет обращений
            </div>
          )}
        </div>
      </div>
    </div>
  );
}