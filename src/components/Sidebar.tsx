'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Briefcase, Users, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, Bell, User, FileText,
  Search, CheckCircle, Sparkles, Trophy
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { api } from '@/lib/api';


interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group?: string;
}

const recruiterNav: NavItem[] = [
  { label: 'Dashboard', href: '/recruiter-dashboard', icon: LayoutDashboard, group: 'Main' },
  //   { label: 'Job Listings', href: '/recruiter-dashboard', icon: Briefcase, badge: 2, group: 'Main' },
  //   { label: 'Applicants', href: '/recruiter-dashboard', icon: Users, badge: 47, group: 'Main' },
  //   { label: 'AI Screening', href: '/recruiter-dashboard', icon: Sparkles, badge: 3, group: 'AI Tools' },
  //   { label: 'Shortlists', href: '/recruiter-dashboard', icon: CheckCircle, group: 'AI Tools' },
  //   { label: 'Reports', href: '/recruiter-dashboard', icon: BarChart3, group: 'Analytics' },
  //   { label: 'Settings', href: '/recruiter-dashboard', icon: Settings, group: 'System' },
];

const applicantNav: NavItem[] = [
  { label: 'My Dashboard', href: '/applicant-portal', icon: LayoutDashboard, group: 'Main' },
  //   { label: 'Browse Jobs', href: '/applicant-portal', icon: Search, group: 'Main' },
  //   { label: 'My Applications', href: '/applicant-portal', icon: FileText, badge: 3, group: 'Main' },
  //   { label: 'My Profile', href: '/applicant-portal', icon: User, group: 'Profile' },
  //   { label: 'AI Feedback', href: '/applicant-portal', icon: Sparkles, badge: 1, group: 'AI Tools' },
  //   { label: 'Achievements', href: '/applicant-portal', icon: Trophy, group: 'Profile' },
  //   { label: 'Settings', href: '/applicant-portal', icon: Settings, group: 'System' },
];

interface SidebarProps {
  role?: 'recruiter' | 'applicant';
}

export default function Sidebar({ role = 'recruiter' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  const pathname = usePathname();
  const navItems = role === 'recruiter' ? recruiterNav : applicantNav;

  const groups = Array.from(new Set(navItems.map(i => i.group)));

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-border transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-16' : 'w-60'
        }`}
      style={{ zIndex: 10 }}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-3 ${collapsed ? 'justify-center' : 'gap-2 px-4'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-display font-700 text-base text-primary-700 leading-tight">
            UmuravaAI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group);
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group}
                </p>
              )}
              {items.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href && item.label === (role === 'recruiter' ? 'Dashboard' : 'My Dashboard');
                return (
                  <Link
                    key={`nav-${item.label}`}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${isActive
                      ? 'bg-primary-50 text-primary-700' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={18} className={isActive ? 'text-primary-700' : ''} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span className="ml-auto text-[10px] font-semibold bg-primary-100 text-primary-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-700 rounded-full" />
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-elevated opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors mb-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <User size={14} className="text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.name || (role === 'recruiter' ? 'Aline Uwimana' : 'Nzinga Mwamba')}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.role === 'recruiter' ? 'Talent Acquisition Lead' : user?.role === 'applicant' ? 'Job Seeker' : (role === 'recruiter' ? 'Talent Acquisition Lead' : 'AI Engineer')}
              </p>
            </div>
            <Bell size={14} className="text-muted-foreground shrink-0" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/sign-up-login-screen"
            onClick={() => api.logout()}
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${collapsed ? 'justify-center w-full' : ''}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            suppressHydrationWarning
            className="ml-auto p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}