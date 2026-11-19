import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Key, Building2, MapPin, 
  RotateCcw, Phone, Mail, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatMoney, formatDate } from '../utils/format';
import { ROLE, ROLE_LABEL, COMPLEX_OPTIONS } from '../utils/constants';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
// ИСПРАВЛЕНО: убрали default import для Card
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

// --- Модалка смены пароля ---
function ChangePasswordModal({ isOpen, onClose }) {
  const toast = useToast();
  const [formData, setFormData] = useState({ current: '', newPass: '', confirm: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPass !== formData.confirm) {
      toast.error('Новые пароли не совпадают');
      return;
    }
    if (formData.newPass.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }
    toast.success('Пароль успешно изменен');
    setFormData({ current: '', newPass: '', confirm: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Смена пароля" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Текущий пароль"
          type="password"
          value={formData.current}
          onChange={(e) => setFormData({ ...formData, current: e.target.value })}
          required
        />
        <Input
          label="Новый пароль"
          type="password"
          value={formData.newPass}
          onChange={(e) => setFormData({ ...formData, newPass: e.target.value })}
          required
        />
        <Input
          label="Повторите новый пароль"
          type="password"
          value={formData.confirm}
          onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
          required
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary">Сохранить</Button>
        </div>
      </form>
    </Modal>
  );
}

// --- Основной компонент ---
export default function ProfilePage() {
  const { user } = useAuth();
  const { contracts, premises, tenants, resetData } = useAppContext();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const isManager = user?.role === ROLE.MANAGER;

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '??';

  const tenantData = useMemo(() => {
    if (isManager || !user?.tenant_id) return null;
    return tenants.find(t => t.id === user.tenant_id);
  }, [tenants, user, isManager]);

  const myContracts = useMemo(() => {
    if (isManager || !user?.tenant_id) return [];
    return contracts
      .filter(c => c.tenant_id === user.tenant_id && c.status === 'active')
      .map(c => ({
        ...c,
        premises: premises.find(p => p.id === c.premises_id)
      }))
      .filter(c => c.premises);
  }, [contracts, premises, user, isManager]);

  const managerStats = useMemo(() => {
    if (!isManager) return null;
    return {
      totalPremises: premises.length,
      occupied: premises.filter(p => p.status === 'Занят').length,
      free: premises.filter(p => p.status === 'Свободен').length,
    };
  }, [premises, isManager]);

  const handleBack = () => {
    navigate(isManager ? '/manager/warehouses' : '/tenant/my-warehouse');
  };

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto">
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Назад в рабочий кабинет
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center pt-8 pb-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 font-bold text-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <div className="mt-2 mb-6 flex justify-center">
              <Badge variant={isManager ? 'primary' : 'success'}>
                {ROLE_LABEL[user?.role]}
              </Badge>
            </div>
            
            <div className="px-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" /> {user?.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
              </div>
            </div>

            <div className="px-6 mt-8">
              <Button 
                variant="secondary" 
                className="w-full" 
                icon={<Key className="w-4 h-4" />}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Сменить пароль
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {!isManager && (
            <>
              <Card>
                <CardHeader title="Данные организации" description="Реквизиты вашей компании" />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Название</p>
                      <p className="font-semibold text-slate-900">{tenantData?.name || user?.organization}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Тип</p>
                      <p className="font-medium text-slate-900">{tenantData?.type || 'ООО'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">ИНН</p>
                      <p className="font-medium text-slate-900">{tenantData?.inn || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">КПП</p>
                      <p className="font-medium text-slate-900">{tenantData?.kpp || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 mb-1">Юридический адрес</p>
                      <p className="font-medium text-slate-900 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        {tenantData?.legal_address || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Активные договоры" description={`У вас ${myContracts.length} действующих договоров`} />
                <CardContent className="p-0">
                  {myContracts.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {myContracts.map(c => (
                        <li key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-slate-900">
                                Бокс {c.premises.number} · {c.premises.building}
                              </p>
                              <p className="text-sm text-slate-500 mt-0.5">
                                Договор № {c.number} от {formatDate(c.date_from)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-indigo-600">{formatMoney(c.rate_rub_month)}</p>
                              <p className="text-xs text-slate-500">в месяц</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-6 text-sm text-slate-500 text-center">Нет активных договоров</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {isManager && (
            <>
              <Card>
                <CardHeader title="Зона ответственности" description="Ваши полномочия и объекты" />
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Управляющий складом</p>
                      <p className="text-xs text-slate-500">Полный доступ к объектам и арендаторам</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                      <p className="text-2xl font-bold text-slate-900">{managerStats?.totalPremises}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Всего объектов</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                      <p className="text-2xl font-bold text-blue-700">{managerStats?.occupied}</p>
                      <p className="text-xs text-blue-600 uppercase tracking-wider mt-1">Занято</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                      <p className="text-2xl font-bold text-emerald-700">{managerStats?.free}</p>
                      <p className="text-xs text-emerald-600 uppercase tracking-wider mt-1">Свободно</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Доступные комплексы</p>
                    <div className="flex flex-wrap gap-2">
                      {COMPLEX_OPTIONS.map(c => (
                        <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                          <Building2 className="w-4 h-4 text-slate-500" /> {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 bg-red-50/30">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Сброс демонстрационных данных</h3>
                    <p className="text-xs text-red-600 mt-1 max-w-sm">
                      Вернет все склады, договоры и заявки в исходное состояние (как после первого запуска).
                    </p>
                  </div>
                  <Button variant="danger" icon={<RotateCcw className="w-4 h-4" />} onClick={resetData}>
                    Сбросить
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}