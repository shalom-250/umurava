'use client';
import React, { useState } from 'react';
import { Application, Job, applicantStatusColors, recommendationColors } from '@/lib/mockData';
import { Sparkles, Clock, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, AlertCircle, Briefcase } from 'lucide-react';

interface MyApplicationsTabProps {
  applications: Application[];
  jobs: Job[];
  profile: any;
}

const STATUS_STEPS = ['Submitted', 'Under Review', 'Screened', 'Shortlisted'];

function StatusTimeline({ status }: { status: string }) {
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

export default function MyApplicationsTab({ applications, jobs }: MyApplicationsTabProps) {
  const [expandedApp, setExpandedApp] = useState<string | null>(applications.find(a => a.status === 'Shortlisted')?.id || null);

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText size={32} className="text-muted-foreground mb-3" />
        <p className="text-base font-semibold text-foreground mb-1">No applications yet</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Browse open jobs and apply to get started. Your applications and AI screening results will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
      </div>

      {applications.map(app => {
        const job = jobs.find(j => j.id === app.jobId);
        const isExpanded = expandedApp === app.id;
        const hasAI = app.matchScore !== undefined;

        return (
          <div key={`myapp-${app.id}`} className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedApp(isExpanded ? null : app.id)}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-primary-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground">{app.jobTitle}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${applicantStatusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{app.company} · Applied {app.appliedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasAI && (
                  <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Match</p>
                    <p className={`text-base sm:text-lg font-display font-700 tabular-nums ${(app.matchScore ?? 0) >= 80 ? 'text-green-600' : (app.matchScore ?? 0) >= 60 ? 'text-blue-600' : 'text-amber-600'
                      }`}>{app.matchScore}</p>
                  </div>
                )}
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="px-4 sm:px-6 pb-4">
              <StatusTimeline status={app.status} />
            </div>

            {/* Expanded AI Feedback */}
            {isExpanded && (
              <div className="border-t border-border px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 animate-fade-in">
                {app.screeningResult ? (
                  <>
                    {/* Score breakdown */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">Match Score</p>
                        <p className="text-2xl font-display font-700 text-green-700">{app.matchScore}/100</p>
                      </div>
                      <div className="bg-primary-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">Rank</p>
                        <p className="text-2xl font-display font-700 text-primary-700">#{app.screeningResult.rank}</p>
                      </div>
                      <div className="rounded-lg p-3 text-center border border-border">
                        <p className="text-[10px] text-muted-foreground">Recommendation</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${recommendationColors[app.screeningResult.recommendation]}`}>
                          {app.screeningResult.recommendation}
                        </span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={13} className="text-blue-600" />
                        <p className="text-xs font-semibold text-blue-800">Gemini AI Reasoning</p>
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">{app.screeningResult.aiReasoning}</p>
                    </div>

                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-2">Strengths</p>
                        <ul className="space-y-1.5">
                          {app.screeningResult.strengths.map((s, i) => (
                            <li key={`appstr-${i}`} className="text-xs text-foreground bg-green-50 rounded-md px-2.5 py-1.5 border border-green-100 flex items-start gap-1.5">
                              <CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-2">Areas to Improve</p>
                        <ul className="space-y-1.5">
                          {app.screeningResult.gaps.map((g, i) => (
                            <li key={`appgap-${i}`} className="text-xs text-foreground bg-amber-50 rounded-md px-2.5 py-1.5 border border-amber-100 flex items-start gap-1.5">
                              <AlertCircle size={10} className="text-amber-500 mt-0.5 shrink-0" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Skill Scores */}
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-3">Your Skill Scores for This Role</p>
                      <div className="space-y-2">
                        {app.screeningResult.skillBreakdown.map(sb => (
                          <div key={`appsb-${sb.skill}`} className="flex items-center gap-3">
                            <div className="w-28 shrink-0">
                              <p className="text-xs text-foreground font-medium">{sb.skill}</p>
                            </div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${sb.score >= 80 ? 'bg-green-500' : sb.score >= 60 ? 'bg-blue-500' : sb.score >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                                style={{ width: `${sb.score}%` }}
                              />
                            </div>
                            <span className="font-mono-data text-xs font-semibold w-8 text-right">{sb.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Awaiting AI Screening</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.status === 'Rejected' ? 'Your application was reviewed but not selected for this role.' : 'The recruiter hasn\'t triggered AI screening yet. You\'ll be notified when results are available.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Job Details */}
                {job && (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-foreground mb-2">About This Role</p>
                    <p className="text-xs text-foreground/80 leading-relaxed mb-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map(skill => (
                        <span key={`apprskill-${skill}`} className="text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}