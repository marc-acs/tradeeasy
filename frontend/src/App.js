import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Pages
import Dashboard from './pages/Dashboard';
import HsCodeSearch from './pages/HsCodeSearch';
import PriceAnalysis from './pages/PriceAnalysis';
import TariffCalculator from './pages/TariffCalculator';
import RiskAlerts from './pages/RiskAlerts';
import PriceForecast from './pages/PriceForecast';
import SavedItems from './pages/SavedItems';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin Pages
import { 
  AdminDashboard, 
  UserManagement, 
  DataManagement, 
  SystemMonitoring,
  Settings
} from './pages/Admin';

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  
  // If still loading auth state, show nothing
  if (loading) return null;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Check for admin role if required
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      
      {/* Dashboard routes (protected) */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="search" element={<HsCodeSearch />} />
        <Route path="prices/:hsCode?" element={<PriceAnalysis />} />
        <Route path="tariffs/:hsCode?" element={<TariffCalculator />} />
        <Route path="risks" element={<RiskAlerts />} />
        <Route path="forecast/:hsCode?" element={<PriceForecast />} />
        <Route path="saved" element={<SavedItems />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Admin routes (protected and require admin role) */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="monitoring" element={<SystemMonitoring />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Redirect root to dashboard if logged in, otherwise to login */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" />
          </ProtectedRoute>
        }
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;