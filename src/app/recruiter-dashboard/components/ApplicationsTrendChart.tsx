'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ApplicationsTrendChartProps {
  jobTitle: string;
  data: { date: string; applications: number; screened: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-elevated p-3 text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={`tip-${p.name}`} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}</span>
          </div>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ApplicationsTrendChart({ jobTitle, data }: ApplicationsTrendChartProps) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-full">
      <div className="mb-4">
        <h2 className="text-base font-display font-600 text-foreground">Application Volume — Last 15 Days</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Daily inbound applications for {jobTitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="applications" stroke="#0F4C81" strokeWidth={2} fill="url(#gradApps)" dot={false} activeDot={{ r: 4, fill: '#0F4C81' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}