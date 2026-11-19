import { Gauge, CheckCircle, XCircle } from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/format';
import { METER_TYPE_UNIT, READING_STATUS } from '../../utils/constants';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function MeterPhotoModal({ isOpen, onClose, data, onAccept, onReject }) {
  if (!isOpen || !data) return null;

  const { reading, meter, premises, tenant } = data;
  const unit = METER_TYPE_UNIT[meter.type] || '';
  const diff = Number(reading.current_value) - Number(reading.previous_value);

  // Имитация фотографии счетчика для демо
  const renderPhoto = () => {
    if (reading.photo_url && reading.photo_url !== 'placeholder') {
      return (
        <img 
          src={reading.photo_url} 
          alt="Фото счетчика" 
          className="w-full h-56 object-cover rounded-lg border border-slate-200"
        />
      );
    }
    // Красивая заглушка
    return (
      <div className="w-full h-56 bg-slate-900 rounded-lg border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <Gauge className="w-8 h-8 text-slate-500 mb-2" />
          <div className="bg-black/50 px-4 py-2 rounded border border-slate-600 font-mono text-3xl text-emerald-400 tracking-widest shadow-lg">
            {String(reading.current_value).padStart(6, '0')}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Снимок счетчика</span>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Проверка показаний" size="md">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-slate-500 mb-0.5">Помещение</p>
            <p className="font-semibold text-slate-900">{premises?.number} ({premises?.building})</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">Арендатор</p>
            <p className="font-semibold text-slate-900 truncate">{tenant?.name || 'Неизвестно'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">Прибор учета</p>
            <p className="font-medium text-slate-900">{meter.type}</p>
            <p className="text-xs text-slate-500 font-mono">{meter.serial_number}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">Дата подачи</p>
            <p className="font-medium text-slate-900">{formatDate(reading.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Предыдущее</p>
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xl font-medium text-slate-400">{formatNumber(reading.previous_value)}</span>
              <span className="text-sm text-slate-400 ml-1">{unit}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Текущее (Расход)</p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
              <span className="text-xl font-bold text-indigo-700">{formatNumber(reading.current_value)}</span>
              <span className="text-sm text-indigo-600 ml-1">{unit}</span>
              <div className="text-xs text-indigo-500 mt-1 font-medium">+{formatNumber(diff)}</div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Фото от арендатора</p>
          {renderPhoto()}
        </div>

        {reading.status === READING_STATUS.REJECTED && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
            <span className="font-semibold">Причина отказа: </span>
            {reading.rejection_reason}
          </div>
        )}

        {reading.status === READING_STATUS.PENDING && (
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button 
              variant="danger" 
              className="flex-1" 
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => onReject(reading)}
            >
              Отклонить
            </Button>
            <Button 
              variant="success" 
              className="flex-1" 
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={() => onAccept(reading.id)}
            >
              Принять показания
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}