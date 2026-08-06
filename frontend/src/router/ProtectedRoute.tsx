import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface GuardProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<GuardProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authorization..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();
  if (role !== 'admin') {
    return <Navigate to={role === 'customer' ? '/customer/dashboard' : '/login'} replace />;
  }

  return <>{children}</>;
};

export const CustomerRoute: React.FC<GuardProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authorization..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();
  if (role !== 'customer') {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/login'} replace />;
  }

  return <>{children}</>;
};
