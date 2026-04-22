'use client';
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Award } from 'lucide-react';
import { Job, ScreeningResult } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';


interface KpiCardsProps {
  job: Job;
  screeningResults: ScreeningResult[];
}

export default function KpiCards({ job, screeningResults }: KpiCardsProps) {
  const avgScore = screeningResults.length > 0
    ? Math.round(screeningResults.reduce((s, r) => s + r.matchScore, 0) / screeningResults.length)
    : 0;

  const [daysToDeadline, setDaysToDeadline] = useState<number | null>(null);

  useEffect(() => {
    const days = Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000));
    setDaysToDeadline(days);
  }, [job.deadline]);

  const stronglyRec = screeningResults.filter(r => r.recommendation === 'Strongly Recommend').length;

  const cards = [
    {
      id: 'kpi-total',
      label: 'New Applicants',
      value: Math.max(0, (job.applicantCount || 0) - screeningResults.length).toString(),
      sub: `${job.applicantCount || 0} total applications received`,
      icon: Users,
      trend: 'up' as const,
      color: 'blue',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      valueClass: 'text-blue-800',
    },
    {
      id: 'kpi-shortlisted',
      label: 'Shortlisted',
      value: (job.shortlistedCount || 0) > 0 ? job.shortlistedCount.toString() : screeningResults.filter(r => r.matchScore >= 70).length.toString(),
      sub: `${stronglyRec} strongly recommended`,
      icon: CheckCircle,
      trend: 'up' as const,
      color: 'green',
      bgClass: 'bg-green-50',
      iconClass: 'text-green-600',
      valueClass: 'text-green-800',
    },
    {
      id: 'kpi-avgscore',
      label: 'Avg. Match Score',
      value: `${avgScore}`,
      sub: 'Out of 100 · Gemini AI',
      icon: Award,
      trend: 'neutral' as const,
      color: 'primary',
      bgClass: 'bg-primary-50',
      iconClass: 'text-primary-700',
      valueClass: 'text-primary-800',
    },
    {
      id: 'kpi-deadline',
      label: 'Days to Deadline',
      value: daysToDeadline?.toString() || '--',
      sub: `Closes ${job.deadline}`,
      icon: Clock,
      trend: (daysToDeadline ?? 10) < 5 ? 'down' as const : 'neutral' as const,
      color: (daysToDeadline ?? 10) < 5 ? 'amber' : 'gray',
      bgClass: (daysToDeadline ?? 10) < 5 ? 'bg-amber-50' : 'bg-gray-50',
      iconClass: (daysToDeadline ?? 10) < 5 ? 'text-amber-600' : 'text-gray-500',
      valueClass: (daysToDeadline ?? 10) < 5 ? 'text-amber-800' : 'text-gray-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            suppressHydrationWarning
            className={`${card.bgClass} rounded-xl p-4 sm:p-5 border border-transparent hover:shadow-elevated transition-shadow`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
              <div className={`p-1.5 rounded-lg bg-white/60 shrink-0`}>
                <Icon size={14} className={card.iconClass} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-display font-700 tabular-nums ${card.valueClass}`}>{card.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}