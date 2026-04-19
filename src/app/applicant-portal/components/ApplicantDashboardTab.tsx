'use client';
import React from 'react';
import { TalentProfile, Application, applicantStatusColors, jobStatusColors } from '@/lib/mockData';
import { Sparkles, ArrowRight, AlertCircle, Star } from 'lucide-react';

interface ApplicantDashboardTabProps {
  profile: TalentProfile;
  applications: Application[];
  recommendedJobs: any[];
  onNavigate: (tab: 'dashboard' | 'profile' | 'jobs' | 'applications') => void;
}

export default function ApplicantDashboardTab({ profile, applications, recommendedJobs, onNavigate }: ApplicantDashboardTabProps) {
  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
  const underReview = applications.filter(a => a.status === 'Under Review' || a.status === 'Screened').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;

  const activeJobs = recommendedJobs.slice(0, 3);
  const aiFeedbackApp = applications.find(a => a.screeningResult !== null);

  return (
    <div className="space-y-6">
      {/* Profile Completeness Banner */}
      {profile.profileCompleteness < 100 && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-primary-700" />
            <div>
              <p className="text-sm font-semibold text-primary-800">Complete your profile to improve your match scores</p>
              <p className="text-xs text-primary-600 mt-0.5">Your profile is {profile.profileCompleteness}% complete. Add missing fields to rank higher in AI screening.</p>
            </div>
          </div>
          <button onClick={() => onNavigate('profile')} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white text-xs font-semibold rounded-md hover:bg-primary-800 transition-colors shrink-0">
            Complete Profile <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Total Applications</p>
          <p className="text-3xl font-display font-700 text-foreground tabular-nums">{applications.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {new Set(applications.map(a => a.jobId)).size} different roles</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-transparent p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Shortlisted</p>
          <p className="text-3xl font-display font-700 text-green-700 tabular-nums">{shortlisted}</p>
          <p className="text-xs text-muted-foreground mt-1">You made the AI shortlist</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-transparent p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Under Review</p>
          <p className="text-3xl font-display font-700 text-amber-700 tabular-nums">{underReview}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting AI screening</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Avg. Match Score</p>
          <p className="text-3xl font-display font-700 text-primary-700 tabular-nums">
            {aiFeedbackApp?.matchScore ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Across screened applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-display font-600 text-foreground">Recent Applications</h2>
            <button onClick={() => onNavigate('applications')} className="text-xs text-primary-700 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {applications.map(app => (
              <div key={`dash-app-${app.id}`} className="px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{app.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{app.company} · Applied {app.appliedDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.matchScore !== undefined && (
                      <span className="font-mono-data text-xs font-semibold text-primary-700">{app.matchScore}/100</span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${applicantStatusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feedback Card */}
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Sparkles size={15} className="text-primary-700" />
            <h2 className="text-sm font-display font-600 text-foreground">AI Feedback — Latest Screening</h2>
          </div>
          {aiFeedbackApp?.screeningResult ? (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Match Score</p>
                  <p className="text-2xl font-display font-700 text-green-700">{aiFeedbackApp.matchScore}/100</p>
                </div>
                <div className="flex-1 bg-primary-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Rank</p>
                  <p className="text-2xl font-display font-700 text-primary-700">#{aiFeedbackApp.screeningResult.rank}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">Gemini AI Reasoning</p>
                <p className="text-xs text-blue-900 leading-relaxed line-clamp-4">{aiFeedbackApp.screeningResult.aiReasoning}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1.5">Key Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiFeedbackApp.screeningResult.strengths.slice(0, 3).map((s, i) => (
                    <span key={`str-${i}`} className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1.5">Gaps to Address</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiFeedbackApp.screeningResult.gaps.slice(0, 2).map((g, i) => (
                    <span key={`gap-${i}`} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <Sparkles size={24} className="text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">No AI feedback yet</p>
              <p className="text-xs text-muted-foreground">Apply to a job and wait for the recruiter to trigger AI screening. Your results will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-primary-700" />
            <h2 className="text-sm font-display font-600 text-foreground">Recommended Jobs for You</h2>
          </div>
          <button onClick={() => onNavigate('jobs')} className="text-xs text-primary-700 hover:underline flex items-center gap-1">
            Browse all <ArrowRight size={11} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
          {activeJobs.map((job: any) => (
            <div key={`recjob-${job.id}`} className="p-5 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-foreground leading-tight">{job.title}</p>
                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ml-2 ${jobStatusColors[job.status]}`}>
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{job.location} · {job.type}</p>
              <p className="text-xs text-foreground/80 line-clamp-2 mb-3">{job.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.requiredSkills.slice(0, 3).map((skill: string) => (
                  <span key={`rskill-${skill}`} className="text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">{skill}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Deadline: {job.deadline}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}