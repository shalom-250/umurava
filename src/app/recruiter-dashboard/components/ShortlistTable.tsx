'use client';
import React, { useState } from 'react';
import { TalentProfile, ScreeningResult, recommendationColors } from '@/lib/mockData';
import { Eye, ExternalLink, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, UserCheck, UserX, Clock } from 'lucide-react';

interface ShortlistTableProps {
  results: ScreeningResult[];
  profiles: TalentProfile[];
  onViewCandidate: (result: ScreeningResult) => void;
}

type SortKey = 'rank' | 'matchScore' | 'name';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...results].sort((a, b) => {
    const profileA = profiles.find(p => p.id === a.candidateId);
    const profileB = profiles.find(p => p.id === b.candidateId);
    let valA: string | number = 0, valB: string | number = 0;
    if (sortKey === 'rank') { valA = a.rank || 999; valB = b.rank || 999; }
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

  // Pagination Logic
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResults = sorted.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

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
              <button
                onClick={() => handleSort('rank')}
                suppressHydrationWarning
                className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Rank <SortIcon col="rank" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('name')}
                suppressHydrationWarning
                className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Candidate Name <SortIcon col="name" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('matchScore')}
                suppressHydrationWarning
                className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Match Score <SortIcon col="matchScore" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">AI Strengths</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">AI Gaps / Risks</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">AI Recommendation</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recruitment Status</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedResults.map((result, i) => {
            const profile = profiles.find(p => p.id === result.candidateId);
            if (!profile) return null;
            const isHovered = hoveredRow === result.candidateId;
            const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
            const isPending = result.recommendation === 'Awaiting AI Analysis' as any || result.rank === 0;
            const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600'];
            const initialsBg = isPending ? 'bg-gray-100' : 'bg-primary-100';
            const initialsText = isPending ? 'text-gray-500' : 'text-primary-700';

            return (
              <tr
                key={`shortlist-row-${result.candidateId}`}
                className={`border-b border-border/60 transition-colors cursor-pointer ${isHovered ? 'bg-primary-50/40' : (startIndex + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                onMouseEnter={() => setHoveredRow(result.candidateId)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onViewCandidate(result)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full font-display font-700 text-xs shadow-sm border"
                    style={{
                      backgroundColor: isPending ? '#f8fafc' : result.rank <= 3 ? (rankColors[result.rank - 1] + '33') : '#f1f5f9',
                      color: isPending ? '#94a3b8' : result.rank <= 3 ? (result.rank === 1 ? '#b45309' : result.rank === 2 ? '#6b7280' : '#92400e') : '#64748b',
                      borderColor: isPending ? '#e2e8f0' : 'transparent'
                    }}
                  >
                    {isPending ? '—' : `#${result.rank}`}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${initialsBg} flex items-center justify-center shrink-0`}>
                      <span className={`text-xs font-semibold ${initialsText}`}>{initials}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{profile.firstName} {profile.lastName}</p>
                        {isPending && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded-md">New</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{profile.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 min-w-[130px]">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 animate-pulse w-full opacity-30" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 italic">Pending</span>
                    </div>
                  ) : (
                    <ScoreBar score={result.matchScore} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 truncate max-w-[200px]" title={Array.isArray(result.strengths) ? result.strengths.join(', ') : result.strengths}>
                    {Array.isArray(result.strengths) ? result.strengths[0] : (result.strengths || 'N/A')}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 truncate max-w-[200px]" title={Array.isArray(result.gaps) ? result.gaps.join(', ') : result.gaps}>
                    {Array.isArray(result.gaps) ? result.gaps[0] : (result.gaps || 'N/A')}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${isPending ? 'bg-gray-50 text-gray-400 border-gray-200' : recommendationColors[result.recommendation]}`}>
                    {isPending ? 'Unanalyzed' : result.recommendation}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!isPending ? (
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border shadow-sm ${(result.recommendation === 'Strongly Recommend' || result.recommendation === 'Recommend') ? 'bg-green-50 text-green-700 border-green-100' :
                        result.recommendation === 'Consider' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {(result.recommendation === 'Strongly Recommend' || result.recommendation === 'Recommend') ? <UserCheck size={12} /> :
                          result.recommendation === 'Not Recommended' ? <UserX size={12} /> : <Clock size={12} />}
                        {(result.recommendation === 'Strongly Recommend' || result.recommendation === 'Recommend') ? 'Shortlisted' :
                          result.recommendation === 'Not Recommended' ? 'Rejected' : 'Under Review'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-gray-400 italic">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); onViewCandidate(result); }}
                      suppressHydrationWarning
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-all border border-blue-100/50 shadow-sm"
                    >
                      <Eye size={14} />
                      Details
                    </button>
                    {profile.socialLinks?.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-all border border-gray-100"
                        title="LinkedIn Profile"
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

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Show:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A1FF]/20 focus:border-[#00A1FF] transition-all cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-medium text-gray-500">
            Showing <span className="text-gray-900 font-bold">{startIndex + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(startIndex + pageSize, totalItems)}</span> of <span className="text-gray-900 font-bold">{totalItems}</span> candidates
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 mx-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                if (pageNum === 2 || pageNum === totalPages - 1) return <span key={`dots-${pageNum}`} className="px-1 text-gray-400 text-xs text-center min-w-[20px]">...</span>;
                return null;
              }
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                    ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}