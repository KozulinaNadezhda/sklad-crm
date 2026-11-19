import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Check, X, Plus, Box, Gauge } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatArea } from '../../utils/format';
import { WAREHOUSE_STATUS, TEMP_MODE_LABELS, TEMP_MODES } from '../../utils/constants';
import ContractBlock from '../../components/domain/ContractBlock';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const STATUS_VARIANTS = {
  [WAREHOUSE_STATUS.FREE]: 'success',
  [WAREHOUSE_STATUS.OCCUPIED]: 'info',
  [WAREHOUSE_STATUS.REPAIR]: 'warning',
  [WAREHOUSE_STATUS.EMERGENCY]: 'danger',
};

export default function WarehouseCardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { premises, meters, updateWarehouse, addMeter } = useAppContext();
  const toast = useToast();

  const warehouse = premises.find(p => p.id === id);

  // Стейт для редактирования паспорта
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  // Стейт для добавления счетчика
  const [isAddingMeter, setIsAddingMeter] = useState(false);
  const [newMeter, setNewMeter] = useState({ type: 'Электричество', serial_number: '' });

  if (!warehouse) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Помещение не найдено</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/manager/warehouses')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  // Счетчики этого помещения
  const warehouseMeters = meters.filter(m => m.premises_id === id);

  const handleEditClick = () => {
    setEditData({
      area: warehouse.area,
      ceiling_height: warehouse.ceiling_height,
      gate_height: warehouse.gate_height,
      floor_load: warehouse.floor_load,
      temp_mode: warehouse.temp_mode,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateWarehouse(id, {
      area: Number(editData.area),
      ceiling_height: Number(editData.ceiling_height),
      gate_height: Number(editData.gate_height),
      floor_load: Number(editData.floor_load),
      temp_mode: editData.temp_mode,
    });
    setIsEditing(false);
    toast.success('Параметры помещения обновлены');
  };

  const handleAddMeter = (e) => {
    e.preventDefault();
    if (!newMeter.serial_number) return;
    addMeter({ ...newMeter, premises_id: id });
    setIsAddingMeter(false);
    setNewMeter({ type: 'Электричество', serial_number: '' });
    toast.success('Прибор учета привязан');
  };

  return (
    <div className="animate-fade-in pb-10">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/manager/warehouses">
            <Button variant="ghost" className="px-2" icon={<ArrowLeft className="w-5 h-5" />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Бокс {warehouse.number} · {warehouse.building}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{warehouse.complex}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[warehouse.status] || 'neutral'} className="text-sm px-3 py-1">
          {warehouse.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА: Темный паспорт */}
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-xl shadow-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-400" /> Технический паспорт
            </h2>
            {!isEditing ? (
              <button onClick={handleEditClick} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition">
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSave} className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-slate-800 rounded-lg transition">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6 flex-1 text-sm">
            {/* Характеристики */}
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Адрес</span>
                <span className="font-medium text-right max-w-[60%]">{warehouse.address}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Площадь</span>
                {isEditing ? (
                  <input type="number" value={editData.area} onChange={(e) => setEditData({...editData, area: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="font-medium">{formatArea(warehouse.area)}</span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Высота потолков</span>
                {isEditing ? (
                  <input type="number" step="0.1" value={editData.ceiling_height} onChange={(e) => setEditData({...editData, ceiling_height: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="font-medium">{warehouse.ceiling_height} м</span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Высота ворот</span>
                {isEditing ? (
                  <input type="number" step="0.1" value={editData.gate_height} onChange={(e) => setEditData({...editData, gate_height: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="font-medium">{warehouse.gate_height} м</span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/50">
                <span className="text-slate-400">Нагрузка на пол</span>
                {isEditing ? (
                  <input type="number" step="0.1" value={editData.floor_load} onChange={(e) => setEditData({...editData, floor_load: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="font-medium">{warehouse.floor_load} т/м²</span>
                )}
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Темп. режим</span>
                {isEditing ? (
                  <select value={editData.temp_mode} onChange={(e) => setEditData({...editData, temp_mode: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500">
                    {TEMP_MODES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                ) : (
                  <span className="font-medium">{TEMP_MODE_LABELS[warehouse.temp_mode]}</span>
                )}
              </div>
            </div>

            {/* Счетчики */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4" /> Приборы учета
                </h3>
                {!isAddingMeter && (
                  <button onClick={() => setIsAddingMeter(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Добавить
                  </button>
                )}
              </div>
              
              {warehouseMeters.length === 0 && !isAddingMeter ? (
                <p className="text-xs text-slate-500 italic">Нет привязанных счетчиков</p>
              ) : (
                <ul className="space-y-2">
                  {warehouseMeters.map(m => (
                    <li key={m.id} className="flex justify-between items-center text-xs bg-slate-800/50 p-2 rounded">
                      <span>{m.type}</span>
                      <span className="font-mono text-slate-400">{m.serial_number}</span>
                    </li>
                  ))}
                </ul>
              )}

              {isAddingMeter && (
                <form onSubmit={handleAddMeter} className="mt-3 space-y-2 bg-slate-800 p-3 rounded-lg animate-fade-in">
                  <select 
                    value={newMeter.type} 
                    onChange={(e) => setNewMeter({...newMeter, type: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Электричество">Электричество</option>
                    <option value="Вода">Вода</option>
                    <option value="Отопление">Отопление</option>
                  </select>
                  <input 
                    placeholder="Серийный номер" 
                    value={newMeter.serial_number}
                    onChange={(e) => setNewMeter({...newMeter, serial_number: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setIsAddingMeter(false)} className="text-xs text-slate-400 hover:text-white px-2 py-1">Отмена</button>
                    <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded">Привязать</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Договор */}
        <div className="lg:col-span-3">
          <ContractBlock premises={warehouse} />
        </div>
      </div>
    </div>
  );
}