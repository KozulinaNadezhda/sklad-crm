import { Link, useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, User, ChevronDown, Box } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { COMPLEXES } from '../../utils/constants';

export default function Header() {
  const { user, logout, switchRole } = useAuth();
  const { activeComplex, setActiveComplex } = useAppContext();
  const navigate = useNavigate();

  const handleRoleSwitch = () => {
    switchRole();
    // После переключения роли перенаправляем на главную страницу новой роли
    const newRole = user.role === 'manager' ? 'tenant' : 'manager';
    navigate(newRole === 'manager' ? '/manager/warehouses' : '/tenant/my-warehouse');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Левая часть: Логотип и выбор комплекса */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-indigo-600">
          <Box className="w-6 h-6" />
          <span className="text-lg font-bold tracking-tight text-slate-900">СкладCRM</span>
        </Link>

        {user?.role === 'manager' && (
          <div className="relative">
            <select
              value={activeComplex}
              onChange={(e) => setActiveComplex(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              {COMPLEXES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Правая часть: Переключатель ролей, Профиль, Выход */}
      <div className="flex items-center gap-4">
        {/* Кнопка переключения ролей (только для демо) */}
        <button
          onClick={handleRoleSwitch}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
          title="Переключить роль для демонстрации"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Я — {user?.role === 'manager' ? 'Арендатор' : 'Управляющий'}
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Профиль */}
        <Link 
          to="/profile" 
          className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            {user?.name?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
              {user?.name}
            </span>
            <span className="text-xs text-slate-500">
              {user?.role === 'manager' ? 'Управляющий' : 'Арендатор'}
            </span>
          </div>
        </Link>

        {/* Выход */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Выйти"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}