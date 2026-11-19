/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = {
  manager: {
    id: 'u1',
    name: 'Петров Петр Петрович',
    role: 'manager',
    phone: '+7 (999) 111-22-33',
    email: 'manager@skladcrm.ru',
    organization: 'ООО «УК СкладСервис»',
  },
  tenant: {
    id: 'u2',
    name: 'Иванов Иван Иванович',
    role: 'tenant',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@alfalogistic.ru',
    organization: 'ООО «Альфа-Логистик»',
    tenant_id: 't1', // Привязка к ID контрагента из mockData
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (role) => {
    setUser(MOCK_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = () => {
    if (!user) return;
    const newRole = user.role === 'manager' ? 'tenant' : 'manager';
    setUser(MOCK_USERS[newRole]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return context;
}