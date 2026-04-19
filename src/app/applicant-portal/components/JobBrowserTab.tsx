'use client';
import React, { useState, useMemo } from 'react';
import { Job, Application, jobStatusColors } from '@/lib/mockData';
import { toast } from 'sonner';
import {
  Search, MapPin, Clock, Briefcase, ChevronRight, CheckCircle,
  Loader2, X, XCircle, AlertTriangle, ArrowRight, ShieldCheck,
  GraduationCap, Zap, ListChecks
} from 'lucide-react';
import { api } from '@/lib/api';

interface JobBrowserTabProps {
  jobs: Job[];
  applications: Application[];
  profile: any;
}

// ─── Eligibility Engine ─────────────────────────────────────────────────────
interface EligibilityResult {
  eligible: boolean;
  matchScore: number; // 0–100
  matchedSkills: string[];
  missingSkills: string[];
  hasExperience: boolean;
  needsExperience: boolean;
  hasEducation: boolean;
  needsEducation: boolean;
  missingItems: { category: string; message: string; suggestion: string }[];
}

function checkEligibility(job: Job, profile: any): EligibilityResult {
  const candidateSkills = (profile.skills || []).map((s: any) =>
    (typeof s === 'string' ? s : s.name).toLowerCase()
  );

  const requiredSkills: string[] = job.requiredSkills || [];
  const mustHaveSkills: string[] = (job as any).mustHaveSkills || requiredSkills;

  const matchedSkills = requiredSkills.filter(s => candidateSkills.includes(s.toLowerCase()));
  const missingSkills = mustHaveSkills.filter(s => !candidateSkills.includes(s.toLowerCase()));

  const hasExperience = (profile.experience || []).length > 0;
  const needsSeniority = ['Senior', 'Lead'].includes(job.experienceLevel);
  const needsExperience = needsSeniority;

  const needsDegree = (job.requirements || []).some((r: string) => /degree|bachelor|master|university|phd/i.test(r));
  const hasEducation = (profile.education || []).length > 0;
  const needsEducation = needsDegree;

  const missingItems: EligibilityResult['missingItems'] = [];

  if (missingSkills.length > 0) {
    missingItems.push({
      category: 'Skills',
      message: `Missing required skills: ${missingSkills.join(', ')}`,
      suggestion: `Go to "Skills & Languages" in your profile and add: ${missingSkills.join(', ')}.`,
    });
  }

  if (needsExperience && !hasExperience) {
    missingItems.push({
      category: 'Work Experience',
      message: `This role requires ${job.experienceLevel} level experience`,
      suggestion: 'Add your previous work experience in the "Work Experience" section of your profile.',
    });
  }

  if (needsEducation && !hasEducation) {
    missingItems.push({
      category: 'Education',
      message: 'A university degree is required for this position',
      suggestion: 'Add your academic qualifications in the "Education" section of your profile.',
    });
  }

  // Score calculation
  const skillScore = requiredSkills.length === 0 ? 100 : Math.round((matchedSkills.length / requiredSkills.length) * 60);
  const expScore = !needsExperience ? 25 : hasExperience ? 25 : 0;
  const eduScore = !needsEducation ? 15 : hasEducation ? 15 : 0;
  const matchScore = Math.min(100, skillScore + expScore + eduScore);

  const eligible = missingSkills.length === 0 && (!needsExperience || hasExperience) && (!needsEducation || hasEducation);

  return { eligible, matchScore, matchedSkills, missingSkills, hasExperience, needsExperience, hasEducation, needsEducation, missingItems };
}

// ─── Eligibility Panel Component ─────────────────────────────────────────────
function EligibilityPanel({ eligibility, job, onNavigateProfile }: {
  eligibility: EligibilityResult;
  job: Job;
  onNavigateProfile?: () => void;
}) {
  const scoreColor = eligibility.matchScore >= 70 ? 'text-green-600' : eligibility.matchScore >= 40 ? 'text-amber-600' : 'text-red-500';
  const scoreBg = eligibility.matchScore >= 70 ? 'bg-green-500' : eligibility.matchScore >= 40 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className={`rounded-xl border-2 p-5 space-y-4 ${eligibility.eligible ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/40'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {eligibility.eligible
            ? <ShieldCheck size={18} className="text-green-600" />
            : <AlertTriangle size={18} className="text-red-500" />}
          <p className="text-sm font-bold text-foreground">
            {eligibility.eligible ? 'You qualify for this role!' : 'You do not fully meet the requirements'}
          </p>
        </div>
        {/* Match Score Ring */}
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={eligibility.matchScore >= 70 ? '#22c55e' : eligibility.matchScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${eligibility.matchScore} ${100 - eligibility.matchScore}`}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${scoreColor}`}>
              {eligibility.matchScore}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">Match<br />Score</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="h-2 bg-white rounded-full border border-border overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${scoreBg}`} style={{ width: `${eligibility.matchScore}%` }} />
        </div>
      </div>

      {/* Skills breakdown */}
      {(job.requiredSkills || []).length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Zap size={11} /> Skill Match ({eligibility.matchedSkills.length}/{job.requiredSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map(skill => {
              const has = eligibility.matchedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
              return (
                <span
                  key={skill}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${has
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'}`}
                >
                  {has ? <CheckCircle size={9} /> : <XCircle size={9} />}
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Criteria checks */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"><ListChecks size={11} /> Requirements</p>
        <div className="space-y-1">
          <CriteriaRow label="Work Experience" ok={eligibility.hasExperience || !eligibility.needsExperience} required={eligibility.needsExperience} />
          <CriteriaRow label="Education / Degree" ok={eligibility.hasEducation || !eligibility.needsEducation} required={eligibility.needsEducation} />
          <CriteriaRow label={`Skills (${eligibility.matchedSkills.length}/${job.requiredSkills.length} matched)`} ok={eligibility.missingSkills.length === 0} required={true} />
        </div>
      </div>

      {/* Missing Items / Suggestions */}
      {eligibility.missingItems.length > 0 && (
        <div className="bg-white border border-red-100 rounded-lg p-3 space-y-3">
          <p className="text-[11px] font-bold text-red-700">What you need to qualify:</p>
          {eligibility.missingItems.map((item, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <XCircle size={10} className="text-red-400 shrink-0" /> {item.category}: {item.message}
              </p>
              <p className="text-[10px] text-muted-foreground pl-4 flex items-center gap-1">
                <ArrowRight size={9} className="shrink-0 text-primary-700" /> {item.suggestion}
              </p>
            </div>
          ))}
          {onNavigateProfile && (
            <button
              onClick={onNavigateProfile}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-700 hover:underline mt-1"
            >
              <GraduationCap size={11} /> Update my profile to qualify →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CriteriaRow({ label, ok, required }: { label: string; ok: boolean; required: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ok
        ? <CheckCircle size={12} className="text-green-500 shrink-0" />
        : required
          ? <XCircle size={12} className="text-red-400 shrink-0" />
          : <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 shrink-0" />
      }
      <span className={`text-[11px] ${ok ? 'text-green-700' : required ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
        {label} {!required && '(not required)'}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JobBrowserTab({ jobs, applications, profile }: JobBrowserTabProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs.find(j => j.status === 'Active') || null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set(applications.map(a => a.jobId)));

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || j.type === typeFilter;
    const matchStatus = statusFilter === 'all' || j.status.toLowerCase() === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Realtime eligibility for the selected job
  const eligibility = useMemo(
    () => selectedJob ? checkEligibility(selectedJob, profile) : null,
    [selectedJob, profile]
  );

  const handleApply = async (jobId: string) => {
    if (applied.has(jobId)) return;

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const eli = checkEligibility(job, profile);

    if (!eli.eligible) {
      toast.error('You do not meet all the requirements for this role. Review the eligibility panel below.', { duration: 4000 });
      return;
    }

    setApplying(jobId);
    try {
      // Real backend integration
      await api.post('/applications', { jobId });
      setApplied(prev => new Set([...prev, jobId]));
      toast.success('Application submitted! The recruiter will be notified.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application. Please try again later.');
    } finally {
      setApplying(null);
    }
  };

  const experienceLevelColor: Record<string, string> = {
    Junior: 'bg-green-50 text-green-700',
    'Mid-level': 'bg-blue-50 text-blue-700',
    Senior: 'bg-purple-50 text-purple-700',
    Lead: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="flex gap-5 h-full">
      {/* Job List */}
      <div className="w-80 shrink-0 flex flex-col gap-3">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-border shadow-card p-3 space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'closed'] as const).map(s => (
              <button
                key={`sf-${s}`}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${statusFilter === s ? 'bg-primary-700 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'Full-time', 'Part-time', 'Contract'] as const).map(t => (
              <button
                key={`tf-${t}`}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-colors ${typeFilter === t ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-border text-muted-foreground hover:border-gray-300'}`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Job Cards */}
        <div className="space-y-2 overflow-y-auto scrollbar-thin flex-1">
          {filtered.map(job => {
            const isSelected = selectedJob?.id === job.id;
            const hasApplied = applied.has(job.id);
            const jobEli = checkEligibility(job, profile);
            return (
              <button
                key={`jobcard-${job.id}`}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? 'border-primary-300 bg-primary-50 shadow-card' : 'border-border bg-white hover:border-gray-300 hover:shadow-card'}`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-primary-700' : 'text-foreground'}`}>
                    {job.title}
                  </p>
                  <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ml-1.5 ${jobStatusColors[job.status]}`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                  <MapPin size={9} /> {job.location}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${experienceLevelColor[job.experienceLevel]}`}>
                    {job.experienceLevel}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{job.type}</span>
                  {hasApplied ? (
                    <span className="flex items-center gap-0.5 text-[9px] text-green-600 font-medium ml-auto">
                      <CheckCircle size={9} /> Applied
                    </span>
                  ) : (
                    <span className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${jobEli.matchScore >= 70 ? 'bg-green-50 text-green-700' : jobEli.matchScore >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                      {jobEli.matchScore}% match
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <Briefcase size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No jobs match your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail */}
      {selectedJob ? (
        <div className="flex-1 bg-white rounded-xl border border-border shadow-card overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 bg-white border-b border-border px-6 py-5 z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-display font-700 text-foreground">{selectedJob.title}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${jobStatusColors[selectedJob.status]}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {selectedJob.location}</span>
                  <span className="flex items-center gap-1"><Briefcase size={11} /> {selectedJob.type}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> Deadline: {selectedJob.deadline}</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full ${experienceLevelColor[selectedJob.experienceLevel]}`}>
                    {selectedJob.experienceLevel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleApply(selectedJob.id)}
                disabled={applied.has(selectedJob.id) || applying === selectedJob.id || selectedJob.status === 'Closed' || selectedJob.status === 'Draft'}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 min-w-[120px] justify-center shrink-0 ${applied.has(selectedJob.id)
                  ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                  : selectedJob.status === 'Closed' || selectedJob.status === 'Draft'
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : eligibility && !eligibility.eligible
                      ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
                      : 'bg-primary-700 text-white hover:bg-primary-800 shadow-card'
                  }`}
              >
                {applying === selectedJob.id ? (
                  <><Loader2 size={14} className="animate-spin" /> Applying...</>
                ) : applied.has(selectedJob.id) ? (
                  <><CheckCircle size={14} /> Applied</>
                ) : selectedJob.status === 'Closed' ? (
                  'Closed'
                ) : eligibility && !eligibility.eligible ? (
                  <><XCircle size={14} /> Not Eligible</>
                ) : (
                  'Apply Now'
                )}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Salary Range</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{selectedJob.salaryRange}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Applicants</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{selectedJob.applicantCount}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Posted</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{selectedJob.postedDate}</p>
              </div>
            </div>

            {/* ── Eligibility Panel ─────────────────────────────── */}
            {eligibility && (
              <EligibilityPanel
                eligibility={eligibility}
                job={selectedJob}
              />
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">About the Role</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Requirements</h3>
              <ul className="space-y-1.5">
                {selectedJob.requirements.map((req, i) => (
                  <li key={`req-${i}`} className="flex items-start gap-2 text-sm text-foreground/80">
                    <ChevronRight size={14} className="text-primary-700 shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.requiredSkills.map(skill => {
                  const has = eligibility?.matchedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={`jskill-${skill}`}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${has
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'}`}
                    >
                      {has ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-800 mb-1">How AI Screening Works</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                After you apply, Gemini AI will analyze your profile against this job's requirements and rank you among all applicants. You'll receive a match score (0–100), detailed strengths and gaps, and a final recommendation — all visible in your Applications tab.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-border shadow-card flex items-center justify-center">
          <div className="text-center">
            <Briefcase size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Select a job to view details</p>
            <p className="text-xs text-muted-foreground mt-1">Choose from the list on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}