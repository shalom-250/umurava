import React from 'react';
import AppLayout from '@/components/AppLayout';
import ApplicantPortalClient from './components/ApplicantPortalClient';

export default function ApplicantPortalPage() {
  return (
    <AppLayout role="applicant">
      <ApplicantPortalClient />
    </AppLayout>
  );
}