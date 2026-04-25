'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { api } from '@/lib/api';
import { User, Briefcase, FileText, LayoutDashboard, Loader2, ChevronRight, X, Menu, LogOut } from 'lucide-react';
import ApplicantDashboardTab from './ApplicantDashboardTab';
import ProfileBuilderTab from './ProfileBuilderTab';
import JobBrowserTab from './JobBrowserTab';
import MyApplicationsTab from './MyApplicationsTab';
import { useRoleGuard } from '@/hooks/useRoleGuard';

type Tab = 'dashboard' | 'profile' | 'jobs' | 'applications';

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, description: 'Dashboard & stats' },
  { id: 'profile', label: 'My Profile', icon: User, description: 'Edit your profile' },
  { id: 'jobs', label: 'Browse Jobs', icon: Briefcase, description: 'Find open roles' },
  { id: 'applications', label: 'Applications', icon: FileText, description: 'Track your applications' },
];

export default function ApplicantPortalClient() {
  useRoleGuard('applicant'); // Redirect recruiters who try to access this page
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

  const authUser = api.getUser();
  const rawFirstName = enrichedProfile.firstName;
  const finalName = rawFirstName
    ? `${rawFirstName} ${enrichedProfile.lastName || ''}`.trim()
    : (authUser?.name || 'Applicant');
  const finalInitial = finalName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Mobile Sidebar Drawer ─────── */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-[60] lg:hidden flex flex-col shrink-0 bg-white border-r border-border
          transition-all duration-300 ease-in-out overflow-hidden w-64
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Header toggle button */}
        <div className="flex items-center justify-between h-16 border-b border-border px-4 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="font-display font-700 text-primary-700 text-sm">UmuravaAI</span>
          </div>
          {sidebarOpen ? (
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground">
              <X size={16} />
            </button>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
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

        {/* User Profile Info & Sign Out (Mobile Drawer) */}
        {sidebarOpen && (
          <div className="p-3 border-t border-border shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg bg-muted/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                {finalInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {finalName}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold truncate">
                  Job Seeker
                </p>
              </div>
            </div>
            <Link
              href="/sign-up-login-screen"
              onClick={() => api.logout()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top header — Welcome + Navigation Tabs + profile chip */}
        <div className="bg-white border-b border-border px-4 lg:px-6 py-2 sm:py-3 shrink-0 shadow-sm relative z-20">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-2 sm:gap-6 min-w-0">
              {/* Mobile Menu Icon */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 -ml-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <Menu size={22} />
              </button>

              {/* Mobile Branding (Small Screen Only) */}
              <div className="flex lg:hidden items-center gap-2 shrink-0">
                <AppLogo size={22} />
                <span className="font-display font-700 text-primary-700 text-sm">UmuravaAI</span>
              </div>

              <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                <AppLogo size={26} />
                <h1 className="text-sm font-display font-700 text-foreground truncate hidden lg:block border-l border-border pl-2.5">
                  Applicant Portal
                </h1>
              </div>

              {/* Desktop Navigation Tabs (Horizontal) */}
              <nav className="hidden lg:flex items-center h-10 bg-muted/30 rounded-xl px-1.5 border border-border/50">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const count = tab.id === 'applications' ? badgeCount : 0;
                  return (
                    <button
                      key={`headnav-${tab.id}`}
                      onClick={() => handleNavigate(tab.id)}
                      className={`
                        flex items-center gap-2.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${isActive
                          ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                        }
                      `}
                    >
                      <Icon size={15} />
                      {tab.label}
                      {count > 0 && (
                        <span className="bg-primary-700 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-1">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden lg:block text-right pr-2 border-r border-border h-8 flex flex-col justify-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold leading-none mb-1">Completeness</p>
                <p className="text-xs font-extra-bold text-primary-700 leading-none">{realCompleteness}%</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-50 border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-100 transition-all group relative">
                <div className="text-xs font-bold text-primary-700 flex items-center justify-center w-full h-full">
                  {finalInitial}
                </div>

                <div className="absolute top-10 right-0 mt-2 bg-white rounded-lg shadow-elevated border border-border py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 min-w-[140px] whitespace-nowrap">
                  <p className="block px-3 py-2 text-sm font-bold text-foreground border-b border-border mb-1 truncate">
                    {finalName}
                  </p>
                  <Link
                    href="/sign-up-login-screen"
                    onClick={() => api.logout()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </Link>
                </div>
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

    </div>
  );
}