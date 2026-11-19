import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// Кабинет Управляющего
import WarehousesPage from './pages/manager/WarehousesPage';
import WarehouseCardPage from './pages/manager/WarehouseCardPage';
import CounterpartiesPage from './pages/manager/CounterpartiesPage';
import ManagerMetersPage from './pages/manager/ManagerMetersPage';
import ManagerRequestsPage from './pages/manager/ManagerRequestsPage';

// Кабинет Арендатора
import MyWarehousePage from './pages/tenant/MyWarehousePage';
import TenantMetersPage from './pages/tenant/TenantMetersPage';
import TenantRequestsPage from './pages/tenant/TenantRequestsPage';

// Умный фолбэк для несуществующих путей
function FallbackRoute() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={user.role === 'manager' ? '/manager/warehouses' : '/tenant/my-warehouse'} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Публичные роуты */}
            <Route path="/login" element={<LoginPage />} />

            {/* Роуты Управляющего */}
            <Route element={<ProtectedRoute allowedRole="manager" />}>
              <Route element={<AppLayout />}>
                <Route path="/manager/warehouses" element={<WarehousesPage />} />
                <Route path="/manager/warehouses/:id" element={<WarehouseCardPage />} />
                <Route path="/manager/counterparties" element={<CounterpartiesPage />} />
                <Route path="/manager/meters" element={<ManagerMetersPage />} />
                <Route path="/manager/requests" element={<ManagerRequestsPage />} />
              </Route>
            </Route>

            {/* Роуты Арендатора */}
            <Route element={<ProtectedRoute allowedRole="tenant" />}>
              <Route element={<AppLayout />}>
                <Route path="/tenant/my-warehouse" element={<MyWarehousePage />} />
                <Route path="/tenant/meters" element={<TenantMetersPage />} />
                <Route path="/tenant/requests" element={<TenantRequestsPage />} />
              </Route>
            </Route>

            {/* Общие роуты (Профиль) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Корень и фолбэки */}
            <Route path="/" element={<FallbackRoute />} />
            <Route path="*" element={<FallbackRoute />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}