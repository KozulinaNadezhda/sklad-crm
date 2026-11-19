import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = (role) => {
    login(role);
    navigate(role === 'manager' ? '/manager/warehouses' : '/tenant/my-warehouse');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Для демо: если ввели что-то, логиним как управляющего по умолчанию
    handleDemoLogin('manager');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Вход в СкладCRM
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          B2B-платформа для управления складскими помещениями
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card border border-slate-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Логин или телефон"
              placeholder="Введите телефон или логин"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              required
            />
            
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Запомнить меня
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Забыли пароль?
                </a>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center">
              Войти
            </Button>
          </form>

          {/* Демо-вход */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Быстрый демо-доступ</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDemoLogin('manager')}
                icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
                className="justify-center"
              >
                Управляющий
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDemoLogin('tenant')}
                icon={<UserCircle className="w-4 h-4 text-emerald-600" />}
                className="justify-center"
              >
                Арендатор
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}