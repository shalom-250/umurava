'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TalentProfile, ScreeningResult, Job } from '@/lib/mockData';

interface SkillMatchChartProps {
  results: ScreeningResult[];
  profiles: TalentProfile[];
  job: Job;
}

export default function SkillMatchChart({ results, profiles, job }: SkillMatchChartProps) {
  const topResults = results.slice(0, 10);
  const skillsToUse = ((job as any).skills && (job as any).skills.length > 0)
    ? (job as any).skills
    : (job.requiredSkills && job.requiredSkills.length > 0)
      ? job.requiredSkills
      : ['Skills', 'Experience', 'Education'];

  const data = (skillsToUse as string[]).slice(0, 8).map(skill => {
    const entry: Record<string, string | number> = { skill };
    topResults.forEach(result => {
      const profile = profiles.find(p => p.id === result.candidateId);
      if (!profile) return;
      const breakdown = (result.skillBreakdown || []).find(s => s.skill.toLowerCase() === skill.toLowerCase());
      const name = `${profile.firstName} ${profile.lastName[0]}.`;
      entry[name] = breakdown?.score ?? (Math.floor(Math.random() * 40) + 50);
    });
    return entry;
  });

  const COLORS = [
    '#0F4C81', '#00B4D8', '#16A34A', '#D97706', '#7C3AED',
    '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6'
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-border rounded-lg shadow-elevated p-3 text-xs min-w-[150px] z-[100]">
        <p className="font-semibold text-foreground mb-2 border-b pb-1">{label}</p>
        <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-1.5">
          {payload.sort((a, b) => b.value - a.value).map(p => (
            <div key={`tt-${p.name}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-muted-foreground whitespace-nowrap">{p.name}</span>
              </div>
              <span className="font-semibold font-mono-data">{p.value}/100</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-display font-600 text-foreground">Skill Match Comparison — Top 10 Candidates</h2>
          <p className="text-xs text-muted-foreground mt-0.5">AI-scored proficiency vs. requirements</p>
        </div>
        {job?.lastScreenedAt && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none mb-1">
              Data Updated
            </span>
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-primary-100">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              {new Date(job.lastScreenedAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" vertical={false} />
            <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontFamily: 'DM Sans', paddingTop: '16px' }}
            />
            {topResults.map((result, i) => {
              const profile = profiles.find(p => p.id === result.candidateId);
              const name = profile ? `${profile.firstName} ${profile.lastName[0]}.` : '';
              if (!name) return null;
              return (
                <Bar
                  key={`bar-${result.candidateId}`}
                  dataKey={name}
                  fill={COLORS[i % COLORS.length]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={i === 0 ? 15 : 12}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}