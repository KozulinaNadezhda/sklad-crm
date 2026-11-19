import { useState, useMemo } from 'react';
import { Zap, Droplet, Flame, Upload, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber, formatDate } from '../../utils/format';
import { METER_TYPE, METER_TYPE_UNIT, READING_STATUS } from '../../utils/constants';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';

const METER_ICONS = {
  [METER_TYPE.ELECTRICITY]: <Zap className="w-5 h-5 text-amber-500" />,
  [METER_TYPE.WATER]: <Droplet className="w-5 h-5 text-blue-500" />,
  [METER_TYPE.HEATING]: <Flame className="w-5 h-5 text-orange-500" />,
};

// Вспомогательный компонент для одного счетчика
function MeterCard({ meter, lastReading, lastAcceptedValue, onSubmit }) {
  const [currentValue, setCurrentValue] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!currentValue) return;
    setIsSubmitting(true);
    
    onSubmit({
      meter_id: meter.id,
      date: new Date().toISOString().split('T')[0],
      previous_value: lastAcceptedValue,
      current_value: Number(currentValue),
      photo_url: photoUrl || 'placeholder', // Если фото нет, ставим заглушку для демо
    });

    setCurrentValue('');
    setPhotoUrl('');
    setIsSubmitting(false);
  };

  const unit = METER_TYPE_UNIT[meter.type] || '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-soft flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            {METER_ICONS[meter.type]}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{meter.type}</h4>
            <p className="text-xs text-slate-500 font-mono">Зав. № {meter.serial_number}</p>
          </div>
        </div>
        
        {/* Статус последнего показания */}
        {lastReading && (
          <div className="flex flex-col items-end gap-1">
            <Badge variant={
              lastReading.status === READING_STATUS.ACCEPTED ? 'success' :
              lastReading.status === READING_STATUS.REJECTED ? 'danger' : 'info'
            }>
              {lastReading.status}
            </Badge>
            <span className="text-[10px] text-slate-400">{formatDate(lastReading.date)}</span>
          </div>
        )}
      </div>

      {lastReading?.status === READING_STATUS.REJECTED && (
        <div className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs border border-red-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Отклонено: {lastReading.rejection_reason}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 items-end bg-slate-50 p-4 rounded-lg">
        <div>
          <span className="block text-xs text-slate-500 mb-1">Предыдущее</span>
          <div className="font-medium text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 text-sm">
            {formatNumber(lastAcceptedValue)} <span className="text-xs text-slate-400">{unit}</span>
          </div>
        </div>
        <div>
          <Input 
            label="Текущее"
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="0"
            className="bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer">
          <div className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-2.5 text-sm transition-colors
            ${photoUrl ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 hover:bg-slate-50 text-slate-500'}`}>
            {photoUrl ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {photoUrl ? 'Фото прикреплено' : 'Прикрепить фото'}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={!currentValue || isSubmitting}
          isLoading={isSubmitting}
        >
          Отправить
        </Button>
      </div>
    </div>
  );
}

export default function TenantMetersPage() {
  const { user } = useAuth();
  const { contracts, premises, meters, readings, addReading } = useAppContext();
  const toast = useToast();

  // 1. Находим арендованные помещения
  const myPremisesIds = useMemo(() => {
    if (!user?.tenant_id) return [];
    return contracts
      .filter(c => c.tenant_id === user.tenant_id && c.status === 'active')
      .map(c => c.premises_id);
  }, [contracts, user]);

  // 2. Группируем счетчики по помещениям
  const groupedMeters = useMemo(() => {
    return myPremisesIds.map(pId => {
      const premisesData = premises.find(p => p.id === pId);
      const premisesMeters = meters.filter(m => m.premises_id === pId);
      
      return {
        premises: premisesData,
        meters: premisesMeters.map(meter => {
          // Ищем последнее показание для этого счетчика
          const meterReadings = readings
            .filter(r => r.meter_id === meter.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          const lastReading = meterReadings[0];
          
          // Ищем последнее ПРИНЯТОЕ показание для графы "Предыдущее"
          const lastAccepted = meterReadings.find(r => r.status === READING_STATUS.ACCEPTED);
          const lastAcceptedValue = lastAccepted ? lastAccepted.current_value : 0;

          return { meter, lastReading, lastAcceptedValue };
        })
      };
    }).filter(group => group.meters.length > 0);
  }, [myPremisesIds, premises, meters, readings]);

  const handleSubmitReading = (data) => {
    addReading({ ...data, tenant_id: user.tenant_id });
    toast.success('Показания успешно отправлены управляющему');
  };

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Передача показаний счётчиков</h1>
        <p className="text-sm text-slate-500 mt-1">Введите текущие значения приборов учета и прикрепите фото</p>
      </div>

      {groupedMeters.length > 0 ? (
        <div className="space-y-8">
          {groupedMeters.map((group, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-sm" />
                Бокс {group.premises.number} · {group.premises.building}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.meters.map(({ meter, lastReading, lastAcceptedValue }) => (
                  <MeterCard 
                    key={meter.id} 
                    meter={meter} 
                    lastReading={lastReading} 
                    lastAcceptedValue={lastAcceptedValue}
                    onSubmit={handleSubmitReading} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="Нет привязанных счетчиков" 
          description="Счетчики появятся здесь, как только управляющий привяжет их к вашему помещению."
          icon={<Clock className="w-6 h-6" />}
        />
      )}
    </div>
  );
}