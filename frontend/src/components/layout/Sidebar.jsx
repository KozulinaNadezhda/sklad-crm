import { NavLink } from 'react-router-dom';
import { Building2, Users, Gauge, Wrench, Home, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { MANAGER_NAV, TENANT_NAV } from '../../utils/constants';

export default function Sidebar() {
  const { user } = useAuth();
  const { readings, requests } = useAppContext();

  const isManager = user?.role === 'manager';

  // Считаем бейджи для управляющего
  const pendingReadingsCount = readings.filter((r) => r.status === 'Ожидает проверки').length;
  const activeRequestsCount = requests.filter((r) => r.status === 'В работе').length;

  // Сопоставляем иконки с путями
  const getIcon = (to) => {
    if (to.includes('warehouses') || to.includes('my-warehouse')) return <Building2 className="w-5 h-5" />;
    if (to.includes('counterparties')) return <Users className="w-5 h-5" />;
    if (to.includes('meters')) return <Gauge className="w-5 h-5" />;
    if (to.includes('requests')) return <Wrench className="w-5 h-5" />;
    if (to.includes('profile')) return <FileText className="w-5 h-5" />;
    return <Home className="w-5 h-5" />;
  };

  // Сопоставляем бейджи
  const getBadge = (to) => {
    if (!isManager) return null;
    if (to.includes('meters') && pendingReadingsCount > 0) {
      return (
        <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
          {pendingReadingsCount}
        </span>
      );
    }
    if (to.includes('requests') && activeRequestsCount > 0) {
      return (
        <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
          {activeRequestsCount}
        </span>
      );
    }
    return null;
  };

  const navItems = isManager ? MANAGER_NAV : TENANT_NAV;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-[calc(100vh-4rem)] sticky top-16 shrink-0">
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-4">
          {isManager ? 'Управление' : 'Мой кабинет'}
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {getIcon(item.to)}
              {item.label}
              {getBadge(item.to)}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400">Система работает</span>
        </div>
      </div>
    </aside>
  );
}