import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function TenantForm({ isOpen, onClose, onTenantAdded }) {
  const { addTenant } = useAppContext();
  const toast = useToast();

  const [formData, setFormData] = useState({
    type: 'ООО',
    name: '',
    inn: '',
    kpp: '',
    legal_address: '',
    contact_name: '',
    phone: '',
    email: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = addTenant(formData);
    toast.success('Новый арендатор успешно добавлен');
    
    if (onTenantAdded) {
      onTenantAdded(newId);
    }
    onClose();
    
    // Сброс формы
    setFormData({
      type: 'ООО', name: '', inn: '', kpp: '', legal_address: '',
      contact_name: '', phone: '', email: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавление нового арендатора" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Тип организации"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: 'ООО', label: 'ООО' },
              { value: 'АО', label: 'АО' },
              { value: 'ИП', label: 'ИП' },
            ]}
          />
          <div className="col-span-2">
            <Input 
              label="Название организации" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="ООО «Ромашка»" 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="ИНН" name="inn" value={formData.inn} onChange={handleChange} required />
          <Input label="КПП (если есть)" name="kpp" value={formData.kpp} onChange={handleChange} />
        </div>

        <Input 
          label="Юридический адрес" 
          name="legal_address" 
          value={formData.legal_address} 
          onChange={handleChange} 
          placeholder="г. Москва, ул. ..." 
          required 
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="ФИО контактного лица" 
            name="contact_name" 
            value={formData.contact_name} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Телефон (логин)" 
            name="phone" 
            type="tel"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="+7 (999) 000-00-00" 
            required 
          />
        </div>

        <Input 
          label="Email" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="mail@company.ru" 
          required 
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary">Сохранить арендатора</Button>
        </div>
      </form>
    </Modal>
  );
}