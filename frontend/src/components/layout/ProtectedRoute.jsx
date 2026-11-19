import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Защита роутов: проверяет авторизацию и соответствие роли.
 */
export default function ProtectedRoute({ allowedRole }) {
  const { user } = useAuth();

  // Если нет пользователя — на экран входа
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Если роль не совпадает — редирект в "родной" кабинет
  if (allowedRole && user.role !== allowedRole) {
    const fallbackPath = user.role === 'manager' ? '/manager/warehouses' : '/tenant/my-warehouse';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}