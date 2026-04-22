'use client';
import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Briefcase, FileText, LayoutDashboard, Loader2, ChevronRight, X, Menu } from 'lucide-react';
import ApplicantDashboardTab from './ApplicantDashboardTab';
import ProfileBuilderTab from './ProfileBuilderTab';
import JobBrowserTab from './JobBrowserTab';
import MyApplicationsTab from './MyApplicationsTab';

type Tab = 'dashboard' | 'profile' | 'jobs' | 'applications';

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, description: 'Dashboard & stats' },
  { id: 'profile', label: 'My Profile', icon: User, description: 'Edit your profile' },
  { id: 'jobs', label: 'Browse Jobs', icon: Briefcase, description: 'Find open roles' },
  { id: 'applications', label: 'Applications', icon: FileText, description: 'Track your applications' },
];

export default function ApplicantPortalClient() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [viewJobId, setViewJobId] = useState<string | null>(null);

  // Sidebar state: open = full labels visible; false = icon-only rail
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidebarOpen]);

  const handleViewJob = (jobId: string) => {
    setViewJobId(jobId);
    setActiveTab('jobs');
  };

  const handleNavigate = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // auto-close sidebar after clicking a link
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
    <div className="flex h-full overflow-hidden">

      {/* ── Sidebar (desktop rail / mobile drawer) ─────── */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 sm:relative sm:flex flex-col shrink-0 bg-white border-r border-border
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen
            ? 'w-64 sm:w-56 translate-x-0'
            : 'w-64 -translate-x-full sm:translate-x-0 sm:w-[60px]'
          }
        `}
      >
        {/* Header toggle button */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
          {sidebarOpen ? (
            <>
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mx-auto p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Open navigation"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 py-3 px-2 flex-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'applications' ? badgeCount : 0;
            return (
              <button
                key={`aside-${tab.id}`}
                onClick={() => handleNavigate(tab.id)}
                title={sidebarOpen ? undefined : tab.label}
                className={`
                  relative flex items-center gap-3 rounded-lg transition-all
                  ${sidebarOpen ? 'px-3 py-2.5' : 'justify-center p-2.5'}
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <div className="relative shrink-0">
                  <Icon size={18} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-primary-700 text-white rounded-full px-1 min-w-[14px] text-center leading-tight">
                      {count}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col items-start min-w-0 overflow-hidden">
                    <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{tab.description}</span>
                  </div>
                )}
                {isActive && !sidebarOpen && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-700 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile completion badge at bottom */}
        <div className={`px-2 pb-3 shrink-0 border-t border-border pt-3 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          {sidebarOpen ? (
            <div className="px-3 py-2.5 bg-primary-50 rounded-lg">
              <p className="text-[10px] text-muted-foreground mb-1">Profile complete</p>
              <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-700 rounded-full" style={{ width: `${realCompleteness}%` }} />
              </div>
              <p className="text-xs font-semibold text-primary-700 mt-1">{realCompleteness}%</p>
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors"
              title={`Profile ${realCompleteness}% complete`}
              onClick={() => setSidebarOpen(true)}
            >
              <span className="text-[9px] font-bold text-primary-700">{realCompleteness}%</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 pb-[64px] sm:pb-0">

        {/* Top header — name + profile chip */}
        <div className="bg-white border-b border-border px-4 sm:px-6 py-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="sm:hidden p-1.5 -ml-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-display font-700 text-foreground truncate">
                  Welcome back, {enrichedProfile.firstName} 👋
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block truncate">{enrichedProfile.headline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] text-muted-foreground">Completeness</p>
                <p className="text-xs font-semibold text-primary-700">{realCompleteness}%</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-700">
                  {enrichedProfile.firstName?.[0] || '?'}{enrichedProfile.lastName?.[0] || ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-5 py-4 sm:py-6">
            {activeTab === 'dashboard' && (
              <ApplicantDashboardTab
                profile={enrichedProfile}
                applications={applications}
                recommendedJobs={recommendedJobs}
                onNavigate={handleNavigate}
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
      </div>

      {/* ── Mobile Bottom Navigation (sm and below) ─────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
        <div className="flex items-stretch h-16">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'applications' ? badgeCount : 0;
            return (
              <button
                key={`mobnav-${tab.id}`}
                onClick={() => handleNavigate(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors
                  ${isActive ? 'text-primary-700' : 'text-muted-foreground'}`}
              >
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