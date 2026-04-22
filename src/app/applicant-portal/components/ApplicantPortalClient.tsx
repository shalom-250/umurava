'use client';
import React, { useState } from 'react';
import { api } from '@/lib/api';

import { User, Briefcase, FileText, LayoutDashboard, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [viewJobId, setViewJobId] = useState<string | null>(null);

  const handleViewJob = (jobId: string) => {
    setViewJobId(jobId);
    setActiveTab('jobs');
  };

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/candidates/me/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to load portal stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 size={32} className="text-[#00A1FF] animate-spin" />
        <p className="font-semibold text-gray-500 text-sm tracking-wide">Loading your dashboard...</p>
      </div>
    );
  }

  const profile = stats.profile || { firstName: '', lastName: '', skills: [], languages: [], experience: [], education: [], certifications: [], projects: [], availability: { status: 'Available', type: 'Full-time' } };
  const applications = stats.applications;
  const recommendedJobs = stats.recommendedJobs;
  const browseJobs = stats.browseJobs || [];

  // Single source-of-truth: same 8-section logic used in ProfileBuilderTab sidebar
  const sectionFilled = {
    basic: !!(profile.firstName && profile.lastName && profile.email && profile.phone),
    skills: (profile.skills?.length ?? 0) > 0,
    experience: (profile.experience?.length ?? 0) > 0,
    education: (profile.education?.length ?? 0) > 0,
    certifications: (profile.certifications?.length ?? 0) > 0,
    projects: (profile.projects?.length ?? 0) > 0,
    availability: !!(profile.availability?.status),
    social: !!(profile.socialLinks?.linkedin || profile.socialLinks?.github || profile.socialLinks?.portfolio),
  };
  const filledCount = Object.values(sectionFilled).filter(Boolean).length;
  const realCompleteness = Math.round((filledCount / 8) * 100);

  // Override backend-calculated value so every child sees the same number
  const enrichedProfile = { ...profile, profileCompleteness: realCompleteness };

  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-700 text-foreground">
              Welcome back, {enrichedProfile.firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{enrichedProfile.headline}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-xs text-muted-foreground">Profile Completeness</p>
              <p className="text-sm font-semibold text-primary-700">{enrichedProfile.profileCompleteness}% complete</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {enrichedProfile.firstName?.[0] || '?'}{enrichedProfile.lastName?.[0] || ''}
              </span>
            </div>
          </div>
        </div>
        {/* Tab Nav */}
        <div className="max-w-screen-2xl mx-auto mt-4 flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badgeCount = tab.id === 'applications' ? applications.length : undefined;

            return (
              <button
                key={`aptab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${isActive
                  ? 'bg-primary-50 text-primary-700' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Icon size={15} />
                {tab.label}
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="text-[10px] font-semibold bg-primary-700 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {badgeCount}
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
              profile={enrichedProfile}
              applications={applications}
              recommendedJobs={recommendedJobs}
              onNavigate={setActiveTab}
              onViewJob={handleViewJob}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileBuilderTab profile={enrichedProfile} />
          )}
          {activeTab === 'jobs' && (
            <JobBrowserTab jobs={browseJobs} applications={applications} profile={enrichedProfile} initialJobId={viewJobId || undefined} />
          )}
          {activeTab === 'applications' && (
            <MyApplicationsTab applications={applications} jobs={browseJobs} profile={enrichedProfile} />
          )}
        </div>
      </div>
    </div>
  );
}