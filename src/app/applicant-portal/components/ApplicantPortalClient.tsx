'use client';
import React, { useState } from 'react';
import { mockJobs, mockApplications, mockTalentProfiles } from '@/lib/mockData';

import { User, Briefcase, FileText, LayoutDashboard } from 'lucide-react';
import ApplicantDashboardTab from './ApplicantDashboardTab';
import ProfileBuilderTab from './ProfileBuilderTab';
import JobBrowserTab from './JobBrowserTab';
import MyApplicationsTab from './MyApplicationsTab';
import Icon from '@/components/ui/AppIcon';


type Tab = 'dashboard' | 'profile' | 'jobs' | 'applications';

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
  { id: 'applications', label: 'My Applications', icon: FileText, badge: 3 },
];

export default function ApplicantPortalClient() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  // Using talent-005 (Nzinga Mwamba) as the logged-in applicant
  const profile = mockTalentProfiles.find(p => p.id === 'talent-005')!;

  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-700 text-foreground">
              Welcome back, {profile.firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.headline}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-xs text-muted-foreground">Profile Completeness</p>
              <p className="text-sm font-semibold text-primary-700">{profile.profileCompleteness}% complete</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            </div>
          </div>
        </div>
        {/* Tab Nav */}
        <div className="max-w-screen-2xl mx-auto mt-4 flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`aptab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="text-[10px] font-semibold bg-primary-700 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {activeTab === 'dashboard' && (
            <ApplicantDashboardTab
              profile={profile}
              applications={mockApplications}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileBuilderTab profile={profile} />
          )}
          {activeTab === 'jobs' && (
            <JobBrowserTab jobs={mockJobs} applications={mockApplications} />
          )}
          {activeTab === 'applications' && (
            <MyApplicationsTab applications={mockApplications} jobs={mockJobs} />
          )}
        </div>
      </div>
    </div>
  );
}