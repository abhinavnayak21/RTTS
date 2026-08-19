'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { useAuth } from '../../../../context/AuthContext';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

export default function NewTicketPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        router.replace('/customer/tickets?create=true');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner text="Opening ticket creation modal..." />
      </div>
    </DashboardLayout>
  );
}
