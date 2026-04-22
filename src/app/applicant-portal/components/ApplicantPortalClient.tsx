'use client';
import React, { useState } from 'react';
import { api } from '@/lib/api';
import { User, Briefcase, FileText, LayoutDashboard, Loader2 } from 'lucide-react';
import ApplicantDashboardTab from './ApplicantDashboardTab';
import ProfileBuilderTab from './ProfileBuilderTab';
import JobBrowserTab from './JobBrowserTab';
import MyApplicationsTab from './MyApplicationsTab';

type Tab = 'dashboard' | 'profile' | 'jobs' | 'applications';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
  { id: 'applications', label: 'Applications', icon: FileText },
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
  const applications = stats.applications ?? [];
  const recommendedJobs = stats.recommendedJobs ?? [];
  const browseJobs = stats.browseJobs ?? [];

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
  const enrichedProfile = { ...profile, profileCompleteness: realCompleteness };
  const badgeCount = applications.length;

  return (
    /* Outer wrapper: flex column, full screen height, and add bottom padding on mobile for the fixed nav bar */
    <div className="flex flex-col h-full pb-[64px] sm:pb-0">

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-display font-700 text-foreground truncate">
              Welcome back, {enrichedProfile.firstName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block">{enrichedProfile.headline}</p>
          </div>

          {/* Avatar + completeness */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Completeness — only on tablet+ */}
            <div className="text-right mr-1 hidden sm:block">
              <p className="text-xs text-muted-foreground">Profile Completeness</p>
              <p className="text-sm font-semibold text-primary-700">{enrichedProfile.profileCompleteness}% complete</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {enrichedProfile.firstName?.[0] || '?'}{enrichedProfile.lastName?.[0] || ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── Desktop/Tablet Tab Nav (hidden on mobile) ── */}
        <div className="max-w-screen-2xl mx-auto mt-3 hidden sm:flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'applications' ? badgeCount : 0;
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
                {count > 0 && (
                  <span className="text-[10px] font-semibold bg-primary-700 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
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
            <JobBrowserTab key={viewJobId ?? 'browse'} jobs={browseJobs} applications={applications} profile={enrichedProfile} initialJobId={viewJobId || undefined} />
          )}
          {activeTab === 'applications' && (
            <MyApplicationsTab applications={applications} jobs={browseJobs} profile={enrichedProfile} />
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Navigation (visible only on mobile) ──────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
        <div className="flex items-stretch h-16">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'applications' ? badgeCount : 0;
            return (
              <button
                key={`mobnav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors
                  ${isActive ? 'text-primary-700' : 'text-muted-foreground'}`}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-700 rounded-b-full" />
                )}
                <div className="relative">
                  <Icon size={20} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-bold bg-primary-700 text-white rounded-full px-1 min-w-[14px] text-center leading-tight">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">
                  {tab.label === 'My Profile' ? 'Profile' : tab.label === 'Browse Jobs' ? 'Jobs' : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}