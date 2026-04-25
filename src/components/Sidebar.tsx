'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Briefcase, Users, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, User, FileText,
  Search, CheckCircle, Sparkles, Trophy, PanelLeftOpen
} from 'lucide-react';
import { api } from '@/lib/api';

const STORAGE_KEY = 'globalSidebarCollapsed';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group?: string;
}

const recruiterNav: NavItem[] = [
  { label: 'Dashboard', href: '/recruiter-dashboard', icon: LayoutDashboard, group: 'Main' },
];

const applicantNav: NavItem[] = [
  { label: 'My Dashboard', href: '/applicant-portal', icon: LayoutDashboard, group: 'Main' },
];

interface SidebarProps {
  role?: 'recruiter' | 'applicant';
}

export default function Sidebar({ role = 'recruiter' }: SidebarProps) {
  // Default to collapsed (hidden) — will be overridden by localStorage
  const [collapsed, setCollapsed] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(api.getUser());
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const pathname = usePathname();
  const navItems = role === 'recruiter' ? recruiterNav : applicantNav;
  const groups = Array.from(new Set(navItems.map(i => i.group)));

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-border transition-all duration-300 ease-in-out shrink-0 hidden lg:flex overflow-hidden ${collapsed ? 'w-12' : 'w-60'}`}
      style={{ zIndex: 10 }}
    >
      {collapsed ? (
        /* ── Collapsed state: only the expand toggle ── */
        <div className="flex flex-col items-center py-3 h-full">
          <button
            onClick={toggle}
            suppressHydrationWarning
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            title="Show sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      ) : (
        /* ── Expanded state: full sidebar ── */
        <>
          {/* Logo */}
          <div className="flex items-center h-16 border-b border-border gap-2 px-4">
            <AppLogo size={32} />
            <span className="font-display font-700 text-base text-primary-700 leading-tight">
              UmuravaAI
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
            {groups.map(group => {
              const items = navItems.filter(i => i.group === group);
              return (
                <div key={`group-${group}`} className="mb-4">
                  <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {group}
                  </p>
                  {items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={`nav-${item.label}`}
                        href={item.href}
                        className={`group relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                      >
                        <Icon size={18} className={isActive ? 'text-primary-700' : ''} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto text-[10px] font-semibold bg-primary-100 text-primary-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
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
            {/* User profile */}
            <div className="flex items-center gap-2 px-2 py-2 rounded-md mb-2">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <User size={14} className="text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {mounted ? (user?.name || 'Recruiter') : '...'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {mounted ? (user?.role === 'applicant' ? 'Job Seeker' : 'Talent Acquisition') : '...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sign-up-login-screen"
                onClick={() => api.logout()}
                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Link>
              <button
                onClick={toggle}
                suppressHydrationWarning
                className="ml-auto p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}