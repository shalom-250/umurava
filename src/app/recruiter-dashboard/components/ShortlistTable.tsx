'use client';
import React, { useState } from 'react';
import { TalentProfile, ScreeningResult, recommendationColors } from '@/lib/mockData';
import { Eye, MapPin, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

interface ShortlistTableProps {
  results: ScreeningResult[];
  profiles: TalentProfile[];
  onViewCandidate: (result: ScreeningResult) => void;
}

type SortKey = 'rank' | 'matchScore' | 'name';
type SortDir = 'asc' | 'desc';

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 65 ? 'bg-blue-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono-data text-sm font-semibold w-7 text-right">{score}</span>
    </div>
  );
}

export default function ShortlistTable({ results, profiles, onViewCandidate }: ShortlistTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...results].sort((a, b) => {
    const profileA = profiles.find(p => p.id === a.candidateId);
    const profileB = profiles.find(p => p.id === b.candidateId);
    let valA: string | number = 0, valB: string | number = 0;
    if (sortKey === 'rank') { valA = a.rank; valB = b.rank; }
    else if (sortKey === 'matchScore') { valA = a.matchScore; valB = b.matchScore; }
    else if (sortKey === 'name') {
      valA = `${profileA?.firstName} ${profileA?.lastName}` || '';
      valB = `${profileB?.firstName} ${profileB?.lastName}` || '';
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp size={10} className={sortKey === col && sortDir === 'asc' ? 'text-primary-700' : 'text-muted-foreground'} />
      <ChevronDown size={10} className={sortKey === col && sortDir === 'desc' ? 'text-primary-700' : 'text-muted-foreground'} />
    </span>
  );

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3">
          <Eye size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">No candidates match this filter</p>
        <p className="text-xs text-muted-foreground">Try selecting a different filter above</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-border bg-gray-50/60">
            <th className="px-4 py-3 text-left">
              <button onClick={() => handleSort('rank')} className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                Rank <SortIcon col="rank" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button onClick={() => handleSort('name')} className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                Candidate <SortIcon col="name" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Location</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current Role</th>
            <th className="px-4 py-3 text-left">
              <button onClick={() => handleSort('matchScore')} className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                Match Score <SortIcon col="matchScore" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recommendation</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Availability</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top Strength</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((result, i) => {
            const profile = profiles.find(p => p.id === result.candidateId);
            if (!profile) return null;
            const isHovered = hoveredRow === result.candidateId;
            const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
            const currentRole = profile.experience.find(e => e.isCurrent);
            const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600'];

            return (
              <tr
                key={`shortlist-row-${result.candidateId}`}
                className={`border-b border-border/60 transition-colors cursor-pointer ${isHovered ? 'bg-primary-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                onMouseEnter={() => setHoveredRow(result.candidateId)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onViewCandidate(result)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full font-display font-700 text-xs"
                    style={{
                      backgroundColor: result.rank <= 3 ? (rankColors[result.rank - 1] + '33') : '#f1f5f9',
                      color: result.rank <= 3 ? (result.rank === 1 ? '#b45309' : result.rank === 2 ? '#6b7280' : '#92400e') : '#64748b'
                    }}
                  >
                    #{result.rank}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary-700">{initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{profile.firstName} {profile.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{profile.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} />
                    <span>{profile.location}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-foreground truncate max-w-[140px]">{currentRole?.role || '—'}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{currentRole?.company || '—'}</p>
                </td>
                <td className="px-4 py-3 min-w-[130px]">
                  <ScoreBar score={result.matchScore} />
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${recommendationColors[result.recommendation]}`}>
                    {result.recommendation}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    profile.availability.status === 'Available' ? 'bg-green-50 text-green-700' :
                    profile.availability.status === 'Open to Opportunities'? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {profile.availability.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-foreground truncate max-w-[160px]">{result.strengths[0]}</p>
                </td>
                <td className="px-4 py-3">
                  <div className={`flex items-center justify-end gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                      onClick={e => { e.stopPropagation(); onViewCandidate(result); }}
                      className="p-1.5 rounded-md hover:bg-primary-100 text-primary-700 transition-colors"
                      title="View AI reasoning"
                    >
                      <Eye size={14} />
                    </button>
                    {profile.socialLinks?.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        title="LinkedIn profile"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}