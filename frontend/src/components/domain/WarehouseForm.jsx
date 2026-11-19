import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { COMPLEX_OPTIONS, BUILDINGS, TEMP_MODES } from '../../utils/constants';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function WarehouseForm({ isOpen, onClose }) {
  const { addWarehouse, addMeter } = useAppContext();
  const toast = useToast();

  const [formData, setFormData] = useState({
    complex: COMPLEX_OPTIONS[0],
    address: '',
    building: BUILDINGS[0],
    number: '',
    area: '',
    ceiling_height: '',
    gate_height: '',
    floor_load: '',
    temp_mode: TEMP_MODES[0].value,
  });

  const [hasMeter, setHasMeter] = useState(false);
  const [meterData, setMeterData] = useState({ type: 'Электричество', serial_number: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Создаем помещение
    const newPremisesId = addWarehouse({
      ...formData,
      area: Number(formData.area),
      ceiling_height: Number(formData.ceiling_height),
      gate_height: Number(formData.gate_height),
      floor_load: Number(formData.floor_load),
    });

    // Если выбран счетчик, привязываем его
    if (hasMeter && meterData.serial_number) {
      addMeter({
        premises_id: newPremisesId,
        type: meterData.type,
        serial_number: meterData.serial_number,
      });
    }

    toast.success('Склад успешно добавлен');
    onClose();
    
    // Сбрасываем форму
    setFormData({
      complex: COMPLEX_OPTIONS[0], address: '', building: BUILDINGS[0], number: '',
      area: '', ceiling_height: '', gate_height: '', floor_load: '', temp_mode: TEMP_MODES[0].value,
    });
    setHasMeter(false);
    setMeterData({ type: 'Электричество', serial_number: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Паспортизация нового склада" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Комплекс"
            name="complex"
            value={formData.complex}
            onChange={handleChange}
            options={COMPLEX_OPTIONS.map(c => ({ value: c, label: c }))}
          />
          <Select
            label="Корпус"
            name="building"
            value={formData.building}
            onChange={handleChange}
            options={BUILDINGS.map(b => ({ value: `Корпус ${b}`, label: `Корпус ${b}` }))}
          />
        </div>

        <Input label="Адрес" name="address" value={formData.address} onChange={handleChange} placeholder="г. Москва, ул. ..." required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Номер помещения/бокса" name="number" value={formData.number} onChange={handleChange} placeholder="А-101" required />
          <Input label="Площадь (м²)" name="area" type="number" value={formData.area} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Высота потолков (м)" name="ceiling_height" type="number" step="0.1" value={formData.ceiling_height} onChange={handleChange} required />
          <Input label="Высота ворот (м)" name="gate_height" type="number" step="0.1" value={formData.gate_height} onChange={handleChange} required />
          <Input label="Нагрузка на пол (т/м²)" name="floor_load" type="number" step="0.1" value={formData.floor_load} onChange={handleChange} required />
        </div>

        <Select
          label="Температурный режим"
          name="temp_mode"
          value={formData.temp_mode}
          onChange={handleChange}
          options={TEMP_MODES}
        />

        <div className="pt-4 border-t border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input 
              type="checkbox" 
              checked={hasMeter} 
              onChange={(e) => setHasMeter(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
            />
            <span className="text-sm font-medium text-slate-700">Сразу привязать прибор учета</span>
          </label>

          {hasMeter && (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg animate-fade-in">
              <Select
                label="Тип прибора"
                value={meterData.type}
                onChange={(e) => setMeterData({ ...meterData, type: e.target.value })}
                options={[
                  { value: 'Электричество', label: 'Электричество' },
                  { value: 'Вода', label: 'Вода' },
                  { value: 'Отопление', label: 'Отопление' },
                ]}
              />
              <Input 
                label="Серийный номер" 
                value={meterData.serial_number} 
                onChange={(e) => setMeterData({ ...meterData, serial_number: e.target.value })} 
                placeholder="Э-123456" 
                required={hasMeter} 
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary">Сохранить склад</Button>
        </div>
      </form>
    </Modal>
  );
}