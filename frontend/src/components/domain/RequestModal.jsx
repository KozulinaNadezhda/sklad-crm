import { useState } from 'react';
import { CheckCircle2, Wrench, Calendar, User, Phone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDateTime } from '../../utils/format';
import { URGENCY, URGENCY_LABELS, REQUEST_STATUS } from '../../utils/constants';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function RequestModal({ isOpen, onClose, request, premises, tenant }) {
  const { updateRequestCost, completeRequest } = useAppContext();
  const toast = useToast();
  
  // Инициализируем стейт прямо из пропсов. 
  // Родительский компонент использует key={request.id}, поэтому при смене заявки компонент перемонтируется.
  const [cost, setCost] = useState(request?.repair_cost || '');

  if (!isOpen || !request) return null;

  const handleSaveCost = () => {
    if (!cost) {
      toast.error('Введите сумму');
      return;
    }
    updateRequestCost(request.id, cost);
    toast.success('Стоимость работ сохранена (P&L обновлен)');
  };

  const handleComplete = () => {
    if (!cost) {
      toast.error('Введите итоговую стоимость работ для закрытия заявки');
      return;
    }
    completeRequest(request.id, cost);
    toast.success('Заявка успешно закрыта');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Заявка ${request.id}`} size="lg">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{request.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDateTime(request.created_at)}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {request.created_by_name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={request.status === REQUEST_STATUS.COMPLETED ? 'success' : 'warning'}>
              {request.status}
            </Badge>
            <Badge variant={
              request.urgency === URGENCY.EMERGENCY ? 'danger' : 
              request.urgency === URGENCY.URGENT ? 'warning' : 'neutral'
            }>
              {URGENCY_LABELS[request.urgency]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-slate-500 mb-0.5">Объект (Помещение)</p>
            <p className="font-semibold text-slate-900">{premises?.number} ({premises?.building})</p>
            <p className="text-xs text-slate-500">{premises?.complex}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">Заявитель (Арендатор)</p>
            <p className="font-semibold text-slate-900">{tenant?.name || 'Неизвестно'}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" /> {tenant?.phone || '—'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Описание проблемы</h4>
          <p className="text-sm text-slate-700 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
            {request.description}
          </p>
        </div>

        {request.photo_url && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Фото поломки</h4>
            <div className="w-full h-48 bg-slate-900 rounded-lg border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
              <div className="relative z-10 flex flex-col items-center">
                <Wrench className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs text-slate-400">Снимок прикреплен</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Работы и стоимость
          </h4>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input 
                label="Стоимость работ (₽)" 
                type="number" 
                value={cost} 
                onChange={(e) => setCost(e.target.value)} 
                placeholder="Например: 15000"
                disabled={request.status === REQUEST_STATUS.COMPLETED}
              />
            </div>
            {request.status !== REQUEST_STATUS.COMPLETED && (
              <Button variant="secondary" onClick={handleSaveCost} className="mb-0.5">
                Сохранить сумму
              </Button>
            )}
          </div>
          {request.status === REQUEST_STATUS.COMPLETED && (
            <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Заявка закрыта. Итоговая стоимость: {formatMoney(request.repair_cost)}
            </p>
          )}
        </div>

        {request.status !== REQUEST_STATUS.COMPLETED && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost" onClick={onClose}>Закрыть окно</Button>
            <Button variant="success" onClick={handleComplete} icon={<CheckCircle2 className="w-4 h-4" />}>
              Отметить выполненной
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}