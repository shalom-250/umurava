import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'recruiter' | 'applicant';
}

export default function AppLayout({ children, role = 'recruiter' }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}