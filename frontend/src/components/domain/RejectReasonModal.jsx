import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const QUICK_REASONS = [
  'Нечёткое фото, не видны цифры',
  'Показание меньше предыдущего',
  'Ошибка в единицах измерения',
  'Фото не соответствует прибору'
];

export default function RejectReasonModal({ isOpen, onClose, readingId }) {
  const { rejectReading } = useAppContext();
  const toast = useToast();
  
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'custom' ? customReason : selectedReason;
    
    if (!finalReason.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    rejectReading(readingId, finalReason);
    toast.success('Показания отклонены');
    
    // Сброс
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Отклонение показаний" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600 mb-2">Выберите причину или напишите свою:</p>
        
        <div className="space-y-2">
          {QUICK_REASONS.map(reason => (
            <label key={reason} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
              <input 
                type="radio" 
                name="reason" 
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm text-slate-700">{reason}</span>
            </label>
          ))}
          
          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input 
              type="radio" 
              name="reason" 
              value="custom"
              checked={selectedReason === 'custom'}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="text-sm text-slate-700">Другая причина...</span>
          </label>
        </div>

        {selectedReason === 'custom' && (
          <div className="animate-fade-in mt-2">
            <Textarea 
              placeholder="Опишите причину отказа..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="danger">Отклонить</Button>
        </div>
      </form>
    </Modal>
  );
}