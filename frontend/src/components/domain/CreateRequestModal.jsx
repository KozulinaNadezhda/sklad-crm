import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { COMPLEX_OPTIONS, URGENCY, URGENCY_LABELS } from '../../utils/constants';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

export default function CreateRequestModal({ isOpen, onClose }) {
  const { premises, createRequest } = useAppContext();
  const { user } = useAuth();
  const toast = useToast();

  const [complex, setComplex] = useState(COMPLEX_OPTIONS[0]);
  const [formData, setFormData] = useState({
    premises_id: '',
    title: '',
    description: '',
    urgency: URGENCY.EMERGENCY,
    photo_url: null,
  });

  const availablePremises = premises.filter(p => p.complex === complex);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.premises_id) {
      toast.error('Выберите помещение');
      return;
    }

    createRequest({
      ...formData,
      created_by_name: user?.name || 'Управляющий',
      photo_url: formData.photo_url ? 'placeholder' : null,
    });

    toast.success('Заявка успешно создана');
    onClose();
    
    // Сброс формы
    setFormData({
      premises_id: '', title: '', description: '', urgency: URGENCY.EMERGENCY, photo_url: null
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создание новой заявки" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Комплекс"
            value={complex}
            onChange={(e) => {
              setComplex(e.target.value);
              setFormData({ ...formData, premises_id: '' }); // Сброс помещения при смене комплекса
            }}
            options={COMPLEX_OPTIONS.map(c => ({ value: c, label: c }))}
          />
          <Select
            label="Помещение / Бокс"
            name="premises_id"
            value={formData.premises_id}
            onChange={handleChange}
            placeholder="Выберите бокс..."
            required
            options={availablePremises.map(p => ({ 
              value: p.id, 
              label: `${p.number} (${p.building})` 
            }))}
          />
        </div>

        <Select
          label="Уровень срочности"
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          options={Object.values(URGENCY).map(u => ({ value: u, label: URGENCY_LABELS[u] }))}
        />

        <Input 
          label="Краткая тема неисправности" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="Например: Протечка трубы" 
          required 
        />

        <Textarea 
          label="Подробное описание" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Опишите проблему, укажите ориентиры..." 
          required 
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Фото поломки (опционально)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.files[0] ? 'loaded' : null })}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary">Создать заявку</Button>
        </div>
      </form>
    </Modal>
  );
}