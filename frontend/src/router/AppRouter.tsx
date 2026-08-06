import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminRoute, CustomerRoute } from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminTicketsPage from '../pages/admin/AdminTicketsPage';
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage';
import CustomerTicketsPage from '../pages/customer/CustomerTicketsPage';
import NewTicketPage from '../pages/customer/NewTicketPage';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === 'admin' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/customer/dashboard" replace />
  );
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Dashboard & Ticket Management Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <AdminRoute>
            <AdminTicketsPage />
          </AdminRoute>
        }
      />

      {/* Customer Dashboard & Ticket Management Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <CustomerRoute>
            <CustomerDashboardPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/customer/tickets"
        element={
          <CustomerRoute>
            <CustomerTicketsPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/customer/tickets/new"
        element={
          <CustomerRoute>
            <NewTicketPage />
          </CustomerRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
