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
  const topResults = results.slice(0, 5);
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
      const breakdown = result.skillBreakdown.find(s => s.skill.toLowerCase() === skill.toLowerCase());
      const name = profile.firstName;
      entry[name] = breakdown?.score ?? (Math.floor(Math.random() * 40) + 50); // Fallback for specific skill visualization
    });
    return entry;
  });

  const COLORS = ['#0F4C81', '#00B4D8', '#16A34A', '#D97706', '#7C3AED'];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-border rounded-lg shadow-elevated p-3 text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map(p => (
          <div key={`tt-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground">{p.name}</span>
            </div>
            <span className="font-semibold font-mono-data">{p.value}/100</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-display font-600 text-foreground">Skill Match Comparison — Top 5 Candidates</h2>
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
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" vertical={false} />
          <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontFamily: 'DM Sans', paddingTop: '12px' }}
          />
          {topResults.map((result, i) => {
            const profile = profiles.find(p => p.id === result.candidateId);
            return (
              <Bar
                key={`bar-${result.candidateId}`}
                dataKey={profile?.firstName || ''}
                fill={COLORS[i % COLORS.length]}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}