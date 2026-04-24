import React from 'react';
import ApplicantPortalClient from './components/ApplicantPortalClient';

export default function ApplicantPortalPage() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ApplicantPortalClient />
    </div>
  );
}