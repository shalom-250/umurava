'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TalentProfile, ScreeningResult } from '@/lib/mockData';

interface SkillMatchChartProps {
  results: ScreeningResult[];
  profiles: TalentProfile[];
}

const REQUIRED_SKILLS = ['Python', 'TensorFlow', 'Gemini API', 'Node.js', 'TypeScript', 'MongoDB'];

export default function SkillMatchChart({ results, profiles }: SkillMatchChartProps) {
  const topResults = results.slice(0, 5);

  const data = REQUIRED_SKILLS.map(skill => {
    const entry: Record<string, string | number> = { skill };
    topResults.forEach(result => {
      const profile = profiles.find(p => p.id === result.candidateId);
      if (!profile) return;
      const breakdown = result.skillBreakdown.find(s => s.skill === skill);
      const name = profile.firstName;
      entry[name] = breakdown?.score ?? 0;
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
      <div className="mb-4">
        <h2 className="text-base font-display font-600 text-foreground">Skill Match Comparison — Top 5 Candidates</h2>
        <p className="text-xs text-muted-foreground mt-0.5">AI-scored skill proficiency vs. job requirements (0–100)</p>
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