import { useState, useMemo } from 'react';
import { FileText, Download, AlertTriangle, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate, toInputDate, toInputDateTime } from '../../utils/format';
import { CONTRACT_STATUS, COUNTERPARTY_STATUS } from '../../utils/constants';
import TenantForm from './TenantForm';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function ContractBlock({ premises }) {
  const { 
    tenants, contracts, createContract, scheduleMeeting, uploadScan, activateContract, terminateContract, updateWarehouse 
  } = useAppContext();
  const toast = useToast();
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);

  const existingContract = useMemo(() => {
    return premises.contract ? contracts.find(c => c.id === premises.contract) : null;
  }, [premises.contract, contracts]);

  const [selectedTenantId, setSelectedTenantId] = useState(existingContract?.tenant_id || '');
  const [dateFrom, setDateFrom] = useState(toInputDate(existingContract?.date_from) || '');
  const [dateTo, setDateTo] = useState(toInputDate(existingContract?.date_to) || '');
  const [rate, setRate] = useState(existingContract?.rate_rub_month || '');
  const [contractStatus, setContractStatus] = useState(existingContract?.status || 'draft');
  const [meetingDate, setMeetingDate] = useState(toInputDateTime(existingContract?.meeting_date) || '');
  const [scanName, setScanName] = useState(existingContract?.signed_scan_name || '');

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  const handleSaveAndActivate = () => {
    if (!selectedTenantId || !dateFrom || !dateTo || !rate) {
      toast.error('Заполните все обязательные поля договора');
      return;
    }

    let contractId = existingContract?.id;

    if (!contractId) {
      contractId = createContract({
        premises_id: premises.id,
        tenant_id: selectedTenantId,
        date_from: dateFrom,
        date_to: dateTo,
        rate_rub_month: Number(rate),
        status: 'draft',
      });
    }

    if (contractStatus === 'signing_scheduled') {
      scheduleMeeting(contractId, meetingDate);
    } else if (contractStatus === 'active') {
      // ИСПРАВЛЕНО: передаем все нужные ID напрямую
      activateContract(contractId, premises.id, selectedTenantId, dateFrom);
      toast.success('Договор активирован, склад заселен!');
      return;
    }

    if (scanName) {
      uploadScan(contractId, scanName);
    }

    toast.success('Договор сохранен в статусе: ' + (CONTRACT_STATUS[contractStatus.toUpperCase()] || 'Черновик'));
  };

  const handleGeneratePdf = () => {
    if (!existingContract && !selectedTenantId) {
      toast.error('Сначала выберите арендатора');
      return;
    }
    toast.success('Договор сформирован и скачан в формате PDF');
  };

  const handleTerminate = () => {
    if (window.confirm('Вы уверены, что хотите расторгнуть договор и освободить склад?')) {
      // ИСПРАВЛЕНО: передаем ID напрямую
      terminateContract(existingContract.id, premises.id, existingContract.tenant_id);
      toast.success('Договор расторгнут. Склад свободен.');
    }
  };

  if (premises.status === 'Ремонт') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-soft flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Помещение на ремонте</h3>
        <p className="text-slate-500 mb-6 max-w-sm">Объект временно недоступен для заселения. Завершите работы, чтобы вернуть его в оборот.</p>
        <Button variant="primary" onClick={() => {
          updateWarehouse(premises.id, { status: 'Свободен' });
          toast.success('Склад переведен в статус «Свободен»');
        }}>
          Вернуть в статус «Свободен»
        </Button>
      </div>
    );
  }

  if (premises.status === 'Занят' && existingContract) {
    const tenant = tenants.find(t => t.id === existingContract.tenant_id);
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Договор активен</h3>
            </div>
            <p className="text-sm text-slate-500">№ {existingContract.number}</p>
          </div>
          <Badge variant="success">Действует</Badge>
        </div>
        
        <div className="p-6 space-y-6 flex-1">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Арендатор</p>
            <p className="text-base font-medium text-slate-900">{tenant?.name}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
              <p>ИНН: {tenant?.inn}</p>
              <p>КПП: {tenant?.kpp || '—'}</p>
              <p className="col-span-2">Контакт: {tenant?.contact_name} ({tenant?.phone})</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Срок действия</p>
              <p className="text-sm font-medium text-slate-900">с {formatDate(existingContract.date_from)} по {formatDate(existingContract.date_to)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Ставка</p>
              <p className="text-sm font-medium text-slate-900">{formatMoney(existingContract.rate_rub_month)} / мес</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Встреча / Подписание</p>
              <p className="text-sm text-slate-700">{existingContract.meeting_date ? formatDate(existingContract.meeting_date) : 'Не назначена'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Скан договора</p>
              <p className="text-sm text-indigo-600 flex items-center gap-1">
                <FileText className="w-4 h-4" /> {existingContract.signed_scan_name || 'Не загружен'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" className="flex-1" icon={<Download className="w-4 h-4" />} onClick={handleGeneratePdf}>
            Скачать PDF
          </Button>
          <Button variant="danger" className="flex-1" icon={<XCircle className="w-4 h-4" />} onClick={handleTerminate}>
            Расторгнуть договор
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900">Оформление договора</h3>
          <p className="text-sm text-slate-500 mt-1">Заполните данные для заселения арендатора</p>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select
                label="Арендатор"
                placeholder="Выберите компанию..."
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                options={tenants.map(t => ({ value: t.id, label: t.name }))}
              />
            </div>
            <Button variant="secondary" onClick={() => setIsTenantModalOpen(true)}>
              + Новый
            </Button>
          </div>

          {selectedTenant && selectedTenant.reliability_status !== COUNTERPARTY_STATUS.TRUSTED && (
            <div className={`p-3 rounded-lg flex items-start gap-2 border animate-fade-in
              ${selectedTenant.reliability_status === COUNTERPARTY_STATUS.BLACKLIST 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-orange-50 border-orange-200 text-orange-800'}`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Внимание! {selectedTenant.reliability_status}</p>
                <p className="opacity-90 mt-0.5">Текущий долг: {formatMoney(selectedTenant.debt_amount)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Срок действия (с)" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required />
            <Input label="Срок действия (по)" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required />
          </div>
          <Input label="Арендная ставка (руб/мес)" type="number" value={rate} onChange={(e) => setRate(e.target.value)} required />

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <Select
              label="Статус договора"
              value={contractStatus}
              onChange={(e) => setContractStatus(e.target.value)}
              options={[
                { value: 'draft', label: 'Черновик' },
                { value: 'signing_scheduled', label: 'Назначена встреча для подписания' },
                { value: 'active', label: 'Действует (подписан)' },
              ]}
            />

            {(contractStatus === 'signing_scheduled' || contractStatus === 'active') && (
              <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-lg border border-slate-200">
                <Input 
                  label="Дата и время очного выезда / подписания" 
                  type="datetime-local" 
                  value={meetingDate} 
                  onChange={(e) => setMeetingDate(e.target.value)} 
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Скан с подписью и печатью</label>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setScanName(e.target.files[0]?.name || '')}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
                  />
                  {scanName && <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Загружен: {scanName}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" className="flex-1" icon={<FileText className="w-4 h-4" />} onClick={handleGeneratePdf}>
            Сформировать PDF
          </Button>
          <Button variant="primary" className="flex-1" icon={<ShieldCheck className="w-4 h-4" />} onClick={handleSaveAndActivate}>
            Заселить и активировать
          </Button>
        </div>
      </div>

      <TenantForm 
        isOpen={isTenantModalOpen} 
        onClose={() => setIsTenantModalOpen(false)} 
        onTenantAdded={(newId) => setSelectedTenantId(newId)} 
      />
    </>
  );
}