'use client';
import React, { useState } from 'react';
import { Application, Job, applicantStatusColors, recommendationColors } from '@/lib/mockData';
import { Sparkles, Clock, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, AlertCircle, Briefcase, Loader2, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface MyApplicationsTabProps {
  applications: Application[];
  jobs: Job[];
  profile: any;
}

const STATUS_STEPS = ['Submitted', 'Under Review', 'Screened', 'Shortlisted'];

function StatusTimeline({ status: rawStatus }: { status: string }) {
  const status = rawStatus === 'Applied' ? 'Submitted' : rawStatus;
  const currentIdx = STATUS_STEPS.indexOf(status);
  const isRejected = status === 'Rejected';

  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const isPast = !isRejected && i < currentIdx;
        const isCurrent = !isRejected && i === currentIdx;
        const isFuture = isRejected || i > currentIdx;
        return (
          <React.Fragment key={`step-${step}`}>
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isPast ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-primary-700 border-primary-700' :
                isRejected && step === 'Shortlisted' ? 'bg-red-100 border-red-300' : 'bg-white border-border'
                }`}>
                {isPast ? (
                  <CheckCircle size={12} className="text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : null}
              </div>
              <p className={`text-[9px] mt-1 font-medium whitespace-nowrap ${isPast ? 'text-green-600' : isCurrent ? 'text-primary-700' : 'text-muted-foreground'
                }`}>{step}</p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 ${isPast ? 'bg-green-400' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
      {isRejected && (
        <div className="flex flex-col items-center ml-2">
          <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
            <XCircle size={12} className="text-red-500" />
          </div>
          <p className="text-[9px] mt-1 font-medium text-red-500">Rejected</p>
        </div>
      )}
    </div>
  );
}

function ShortlistedLeaderboard({ jobId, currentCandidateId }: { jobId: string, currentCandidateId: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/screening/' + jobId);
        if (active && Array.isArray(res)) {
          const sorted = res.sort((a, b) => b.score - a.score).filter(c => ['Shortlist', 'Waitlist', 'Hired'].includes(c.recommendation));
          setCandidates(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => { active = false; };
  }, [jobId]);

  if (loading) return <div className="p-4 text-xs text-muted-foreground flex items-center gap-2 animate-pulse"><Loader2 size={12} className="animate-spin" /> Fetching candidate leaderboard...</div>;
  if (!candidates.length) return null;

  return (
    <div className="border border-border/80 rounded-xl bg-gray-50/50 overflow-hidden mt-6">
      <div className="bg-primary-50 border-b border-border/50 px-4 py-2 flex items-center justify-between">
        <h4 className="text-xs font-bold text-primary-900 flex items-center gap-2"><Users size={14} className="text-primary-600" /> Complete Shortlisted Candidate Ranking</h4>
        <span className="text-[10px] text-primary-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-primary-200">Classified Vetting Visibility</span>
      </div>
      <div className="divide-y divide-border/50">
        {candidates.map((cand, idx) => {
          const candId = cand.candidateId?._id || cand.candidateId;
          const isMe = candId === currentCandidateId;
          const name = cand.candidateId?.firstName
            ? `${cand.candidateId.firstName} ${cand.candidateId.lastName || ''}`.trim()
            : (cand.candidateId?.name || `Candidate #${idx + 1}`);

          return (
            <div key={`lead-${idx}`} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isMe ? 'bg-primary-50/70 border-l-2 border-primary-500' : 'hover:bg-muted/30'}`}>
              <div className="flex items-center gap-3 w-full">
                <div className="w-6 h-6 rounded bg-white shadow-sm border border-border flex items-center justify-center shrink-0">
                  <span className={`text-[10px] font-bold ${isMe ? 'text-primary-700' : 'text-muted-foreground'}`}>{cand.rank || idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className={`text-xs font-semibold truncate ${isMe ? 'text-primary-800' : 'text-foreground/80'}`}>{name}</p>
                  {isMe && <span className="inline-flex bg-primary-100 text-primary-700 uppercase tracking-widest font-black shrink-0 px-1.5 py-0.5 rounded text-[8px] border border-primary-200">(You)</span>}
                </div>
                <div className="shrink-0 text-[10px] font-mono-data bg-white px-2 py-0.5 rounded border border-border shadow-sm text-muted-foreground">
                  {cand.score}% Match
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyApplicationsTab({ applications, jobs, profile }: MyApplicationsTabProps) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('isAppSidebarCollapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(saved === 'true');
    }
  }, []);

  React.useEffect(() => {
    if (mounted) {
      localStorage.setItem('isAppSidebarCollapsed', String(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, mounted]);

  // Set default selection if none
  React.useEffect(() => {
    if (applications.length > 0 && !selectedAppId) {
      // Pick a shortlisted/hired one first if available, else first
      const defaultApp = applications.find(a => ['Shortlisted', 'Interviewing', 'Hired'].includes(a.status)) || applications[0];
      setSelectedAppId(defaultApp.id);
    }
  }, [applications, selectedAppId]);

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <FileText size={24} className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-700 text-foreground mb-2">No applications yet</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Browse open jobs and apply to get started. Your applications and AI screening results will appear here.
        </p>
      </div>
    );
  }

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const selectedJob = selectedApp ? jobs.find(j => j.id === selectedApp.jobId) : null;

  return (
    <div className="flex h-[calc(100vh-10rem)] border border-border rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Sidebar for Applications */}
      <aside className={`
        flex flex-col bg-gray-50/50 border-r border-border transition-all duration-300 ease-in-out shrink-0
        ${isSidebarCollapsed ? 'w-[72px]' : 'w-72 sm:w-80'}
      `}>
        <div className={`p-4 border-b border-border flex items-center justify-between ${isSidebarCollapsed ? 'flex-col gap-2' : ''}`}>
          {!isSidebarCollapsed && (
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">My Applications</h3>
          )}
          <div className={`flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold ${isSidebarCollapsed ? 'mt-1 mb-2' : ''}`}>
            {applications.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {applications.map(app => {
            const isSelected = selectedAppId === app.id;
            const hasAppAI = app.matchScore !== undefined;

            return (
              <button
                key={`sidebar-app-${app.id}`}
                onClick={() => setSelectedAppId(app.id)}
                title={isSidebarCollapsed ? app.jobTitle : undefined}
                className={`w-full text-left p-4 transition-all border-b border-gray-100 group relative ${isSidebarCollapsed ? 'px-0 flex justify-center h-[72px]' : ''} ${isSelected
                  ? 'bg-primary-50/50 border-l-4 border-l-primary-600'
                  : 'hover:bg-gray-100/50 border-l-4 border-l-transparent'
                  }`}
              >
                {isSidebarCollapsed ? (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all flex-shrink-0 ${isSelected ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 group-hover:bg-gray-50 border border-gray-200'}`}>
                    <Briefcase size={16} />
                  </div>
                ) : (
                  <>
                    <h4 className={`font-bold text-sm leading-tight transition-colors mb-1.5 pr-2 ${isSelected ? 'text-primary-700' : 'text-foreground'}`}>
                      {app.jobTitle}
                    </h4>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${applicantStatusColors[app.status === 'Applied' ? 'Submitted' : app.status] || 'bg-gray-50 text-gray-600'}`}>
                        {app.status === 'Applied' ? 'Submitted' : app.status}
                      </span>
                      {hasAppAI && (
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          <Sparkles size={10} className={isSelected ? 'text-primary-500' : ''} /> Score: {app.matchScore}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="border-t border-border p-3 bg-white flex justify-end">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>}
          </button>
        </div>
      </aside>

      {/* Main Details View */}
      <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8 scrollbar-thin">
        {selectedApp ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-primary-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-700 text-foreground">{selectedApp.jobTitle}</h2>
                  <p className="text-sm text-muted-foreground">{selectedApp.company} · Applied on {selectedApp.appliedDate}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">Application Progress</p>
              <StatusTimeline status={selectedApp.status} />
            </div>

            {/* Expanded AI Feedback */}
            {selectedApp.screeningResult ? (
              <div className="space-y-6 animate-fade-in">
                {/* Score breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100 flex flex-col justify-center">
                    <p className="text-[11px] font-bold text-green-800 uppercase tracking-widest mb-1.5">Match Score</p>
                    <p className="text-4xl font-display font-700 text-green-700">{selectedApp.matchScore}<span className="text-xl text-green-600/60 font-medium">/100</span></p>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4 text-center border border-primary-100 flex flex-col justify-center">
                    <p className="text-[11px] font-bold text-primary-800 uppercase tracking-widest mb-1.5">AI Rank</p>
                    <p className="text-4xl font-display font-700 text-primary-700">#{selectedApp.screeningResult.rank}</p>
                  </div>
                  <div className="rounded-xl p-4 text-center border border-border bg-white shadow-sm flex flex-col items-center justify-center">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recommendation</p>
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md border shadow-sm ${recommendationColors[selectedApp.screeningResult.recommendation]}`}>
                      {selectedApp.screeningResult.recommendation}
                    </span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-blue-600" />
                    <p className="text-sm font-bold text-blue-900">Gemini AI Feedback</p>
                  </div>
                  <p className="text-sm text-blue-900/80 leading-relaxed">{selectedApp.screeningResult.aiReasoning}</p>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border text-left border-green-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" /> Key Strengths
                    </p>
                    <ul className="space-y-2.5">
                      {selectedApp.screeningResult.strengths.map((s, i) => (
                        <li key={`appstr-${selectedApp.id}-${i}`} className="text-xs text-foreground bg-green-50 rounded-lg px-3 py-2 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                          <span className="leading-snug">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white border text-left border-amber-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-500" /> Areas to Improve
                    </p>
                    <ul className="space-y-2.5">
                      {selectedApp.screeningResult.gaps.map((g, i) => (
                        <li key={`appgap-${selectedApp.id}-${i}`} className="text-xs text-foreground bg-amber-50 rounded-lg px-3 py-2 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span className="leading-snug">{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skill Scores */}
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                  <p className="text-sm font-bold text-foreground mb-5">Skill Assessment vs Role Requirements</p>
                  <div className="space-y-4">
                    {selectedApp.screeningResult.skillBreakdown.map(sb => (
                      <div key={`appsb-${selectedApp.id}-${sb.skill}`} className="flex items-center gap-4">
                        <div className="w-32 shrink-0">
                          <p className="text-xs font-semibold text-foreground truncate" title={sb.skill}>{sb.skill}</p>
                        </div>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full ${sb.score >= 80 ? 'bg-green-500' : sb.score >= 60 ? 'bg-blue-500' : sb.score >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${sb.score}%` }}
                          />
                        </div>
                        <span className="font-mono-data text-xs font-bold w-12 text-right">{sb.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 border border-dashed border-border rounded-xl text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Clock size={24} className="text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground mb-2">Awaiting AI Screening</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {selectedApp.status === 'Rejected'
                    ? 'Your application was reviewed but not selected for this role.'
                    : 'The recruiter hasn\'t triggered AI screening yet. You\'ll be notified when results are available.'}
                </p>
              </div>
            )}

            {/* Job Details */}
            {selectedJob && (
              <div className="border-t border-border pt-8">
                <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">About This Role</p>
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{selectedJob.description}</p>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requiredSkills.map(skill => (
                        <span key={`apprskill-${selectedApp.id}-${skill}`} className="text-[11px] font-medium bg-white text-primary-700 px-2.5 py-1 rounded border border-border shadow-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Candidate Roster - Unlocked for Shortlisted/Hired */}
            {['Shortlisted', 'Hired', 'Interviewing'].includes(selectedApp.status) && (
              <div className="border-t border-border pt-8 animate-fade-in">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users size={16} className="text-primary-600" />
                  Live Selection Roster
                </h3>
                <ShortlistedLeaderboard jobId={selectedApp.jobId} currentCandidateId={profile?.id} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Select an application from the sidebar to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}