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

const STORAGE_KEY = 'globalSidebarStateV4'; // Changed to force reset the default to true

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
  // Default to collapsed (hidden text, only icons)
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
          <div className="flex items-center justify-between h-16 border-b border-border pl-4 pr-3 shrink-0">
            <div className="flex items-center gap-2">
              <AppLogo size={32} />
              <span className="font-display font-700 text-base text-primary-700 leading-tight">
                UmuravaAI
              </span>
            </div>
            <button
              onClick={toggle}
              suppressHydrationWarning
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
            {groups.map(group => {
              const items = navItems.filter(i => i.group === group);
              return (
                <div key={`group-${group}`} className="mb-4">
                  <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {group}
                  </p>
                  {items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={`nav-${item.label}`}
                        href={item.href}
                        className={`group relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                      >
                        <Icon size={18} className={isActive ? 'text-primary-700' : 'text-muted-foreground/70'} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto text-[10px] font-bold bg-primary-100 text-primary-700 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
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
          <div className="border-t border-border p-3 shrink-0 bg-muted/20">
            {/* User profile */}
            <div className="flex items-center gap-2 px-2 py-2.5 bg-white border border-border shadow-sm rounded-xl mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <User size={16} className="text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-none mb-1">
                  {mounted ? (user?.name || 'Recruiter') : '...'}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground truncate uppercase tracking-wider leading-none">
                  {mounted ? (user?.role === 'applicant' ? 'Job Seeker' : 'Talent Acquisition') : '...'}
                </p>
              </div>
            </div>

            <Link
              href="/sign-up-login-screen"
              onClick={() => api.logout()}
              className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}