import React from 'react';
import AppLayout from '@/components/AppLayout';
import RecruiterDashboardClient from './components/RecruiterDashboardClient';

export default function RecruiterDashboardPage() {
  return (
    <AppLayout role="recruiter">
      <RecruiterDashboardClient />
    </AppLayout>
  );
}