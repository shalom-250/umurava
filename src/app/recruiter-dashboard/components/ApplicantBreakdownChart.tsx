'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ScreeningResult } from '@/lib/mockData';

interface ApplicantBreakdownChartProps {
  results: ScreeningResult[];
}

export default function ApplicantBreakdownChart({ results }: ApplicantBreakdownChartProps) {
  const breakdown = [
    { name: 'Strongly Rec.', value: results.filter(r => r.recommendation === 'Strongly Recommend').length, color: '#16A34A' },
    { name: 'Recommend', value: results.filter(r => r.recommendation === 'Recommend').length, color: '#0F4C81' },
    { name: 'Consider', value: results.filter(r => r.recommendation === 'Consider').length, color: '#D97706' },
    { name: 'Not Rec.', value: results.filter(r => r.recommendation === 'Not Recommended').length, color: '#DC2626' },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;
    const total = results.length;
    return (
      <div className="bg-white border border-border rounded-lg shadow-elevated p-3 text-xs">
        <p className="font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground mt-0.5">{payload[0].value} candidates ({Math.round(payload[0].value / total * 100)}%)</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-full">
      <div className="mb-3">
        <h2 className="text-base font-display font-600 text-foreground">Applicant Breakdown</h2>
        <p className="text-xs text-muted-foreground mt-0.5">By AI recommendation tier</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={breakdown}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {breakdown.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {breakdown.map(item => (
          <div key={`legend-${item.name}`} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
            <span className="ml-auto text-[10px] font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}