/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import {
  initialPremises,
  initialTenants,
  initialContracts,
  initialMeters,
  initialReadings,
  initialRequests,
} from '../data/mockData';
import { ALL_COMPLEXES } from '../utils/constants';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // --- Состояние (живет в памяти React, при F5 сбрасывается к мок-данным) ---
  const [premises, setPremises] = useState(initialPremises);
  const [tenants, setTenants] = useState(initialTenants);
  const [contracts, setContracts] = useState(initialContracts);
  const [meters, setMeters] = useState(initialMeters);
  const [readings, setReadings] = useState(initialReadings);
  const [requests, setRequests] = useState(initialRequests);
  
  // Глобальный фильтр по комплексу
  const [activeComplex, setActiveComplex] = useState(ALL_COMPLEXES);

  // --- СБРОС ДАННЫХ (ручной, по кнопке) ---
  const resetData = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все данные до исходных?')) {
      setPremises(initialPremises);
      setTenants(initialTenants);
      setContracts(initialContracts);
      setMeters(initialMeters);
      setReadings(initialReadings);
      setRequests(initialRequests);
    }
  };

  // --- АВТОРАСЧЕТ P&L ---
  const pnl = useMemo(() => {
    const income = contracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + Number(c.rate_rub_month), 0);

    // Считаем расходом любую заявку с введенной стоимостью
    const expenses = requests
      .filter((r) => r.repair_cost > 0)
      .reduce((sum, r) => sum + Number(r.repair_cost), 0);

    return { income, expenses, profit: income - expenses };
  }, [contracts, requests]);

  // ==========================================================================
  // МЕТОДЫ: ПОМЕЩЕНИЯ
  // ==========================================================================
  const addWarehouse = (warehouseData) => {
    const newId = `p${Date.now()}`;
    const newWarehouse = { ...warehouseData, id: newId, status: 'Свободен', contract: null };
    setPremises((prev) => [...prev, newWarehouse]);
    return newId;
  };

  const updateWarehouse = (id, data) => {
    setPremises((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  // ==========================================================================
  // МЕТОДЫ: КОНТРАГЕНТЫ
  // ==========================================================================
  const addTenant = (tenantData) => {
    const newId = `t${Date.now()}`;
    const newTenant = {
      ...tenantData,
      id: newId,
      reliability_status: 'Благонадежный / Рекомендован',
      debt_amount: 0,
      rental_history: [],
    };
    setTenants((prev) => [...prev, newTenant]);
    return newId;
  };

  const updateTenantStatus = (id, newStatus) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, reliability_status: newStatus } : t)));
  };

  // ==========================================================================
  // МЕТОДЫ: ДОГОВОРЫ
  // ==========================================================================
  const createContract = (contractData) => {
    const newId = `c${Date.now()}`;
    const newContract = {
      ...contractData,
      id: newId,
      status: 'draft',
      meeting_date: null,
      signed_scan_name: null,
    };
    setContracts((prev) => [...prev, newContract]);
    setPremises((prev) => prev.map((p) => (p.id === contractData.premises_id ? { ...p, contract: newId } : p)));
    return newId;
  };

  const scheduleMeeting = (contractId, dateTime) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: 'signing_scheduled', meeting_date: dateTime } : c))
    );
  };

  const uploadScan = (contractId, fileName) => {
    setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, signed_scan_name: fileName } : c)));
  };

  const activateContract = (contractId, premisesId, tenantId, dateFrom) => {
    setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, status: 'active' } : c)));
    setPremises((prev) => prev.map((p) => (p.id === premisesId ? { ...p, status: 'Занят' } : p)));
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            rental_history: [
              ...t.rental_history,
              { premises_id: premisesId, date_from: dateFrom, date_to: null },
            ],
          };
        }
        return t;
      })
    );
  };

  const terminateContract = (contractId, premisesId, tenantId) => {
    setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, status: 'terminated' } : c)));
    setPremises((prev) =>
      prev.map((p) => (p.id === premisesId ? { ...p, status: 'Свободен', contract: null } : p))
    );
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const updatedHistory = t.rental_history.map((h) =>
            h.premises_id === premisesId && !h.date_to
              ? { ...h, date_to: new Date().toISOString().split('T')[0] }
              : h
          );
          return { ...t, rental_history: updatedHistory };
        }
        return t;
      })
    );
  };

  // ==========================================================================
  // МЕТОДЫ: СЧЕТЧИКИ
  // ==========================================================================
  const addMeter = (meterData) => {
    const newId = `m${Date.now()}`;
    setMeters((prev) => [...prev, { ...meterData, id: newId }]);
    return newId;
  };

  const addReading = (readingData) => {
    const newId = `r${Date.now()}`;
    setReadings((prev) => [
      { ...readingData, id: newId, status: 'Ожидает проверки', rejection_reason: null },
      ...prev,
    ]);
  };

  const acceptReading = (id) => {
    setReadings((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Принято' } : r)));
  };

  const rejectReading = (id, reason) => {
    setReadings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Отклонено', rejection_reason: reason } : r))
    );
  };

  // ==========================================================================
  // МЕТОДЫ: ЗАЯВКИ
  // ==========================================================================
  const createRequest = (requestData) => {
    const newId = `req${Date.now()}`;
    setRequests((prev) => [
      {
        ...requestData,
        id: newId,
        status: 'В работе',
        repair_cost: null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const updateRequestCost = (id, cost) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, repair_cost: Number(cost) } : r)));
  };

  const completeRequest = (id, cost) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Выполнено', repair_cost: Number(cost) } : r))
    );
  };

  const value = {
    premises,
    tenants,
    contracts,
    meters,
    readings,
    requests,
    pnl,
    activeComplex,
    setActiveComplex,
    addWarehouse,
    updateWarehouse,
    addTenant,
    updateTenantStatus,
    createContract,
    scheduleMeeting,
    uploadScan,
    activateContract,
    terminateContract,
    addMeter,
    addReading,
    acceptReading,
    rejectReading,
    createRequest,
    updateRequestCost,
    completeRequest,
    resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext должен использоваться внутри AppProvider');
  return context;
}