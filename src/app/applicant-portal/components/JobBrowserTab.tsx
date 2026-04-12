'use client';
import React, { useState } from 'react';
import { Job, Application, jobStatusColors } from '@/lib/mockData';
import { toast } from 'sonner';
import { Search, MapPin, Clock, Briefcase, ChevronRight, CheckCircle, Loader2, X } from 'lucide-react';

interface JobBrowserTabProps {
  jobs: Job[];
  applications: Application[];
}

export default function JobBrowserTab({ jobs, applications }: JobBrowserTabProps) {
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

  const handleApply = async (jobId: string) => {
    if (applied.has(jobId)) return;
    setApplying(jobId);
    // Backend integration point: POST /api/applications { jobId, talentId: currentUser.id }
    await new Promise(r => setTimeout(r, 1400));
    setApplying(null);
    setApplied(prev => new Set([...prev, jobId]));
    toast.success('Application submitted! The recruiter will be notified.');
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
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                  statusFilter === s ? 'bg-primary-700 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
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
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-colors ${
                  typeFilter === t ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-border text-muted-foreground hover:border-gray-300'
                }`}
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
            return (
              <button
                key={`jobcard-${job.id}`}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected ? 'border-primary-300 bg-primary-50 shadow-card' : 'border-border bg-white hover:border-gray-300 hover:shadow-card'
                }`}
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
                  {hasApplied && (
                    <span className="flex items-center gap-0.5 text-[9px] text-green-600 font-medium ml-auto">
                      <CheckCircle size={9} /> Applied
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 min-w-[120px] justify-center shrink-0 ${
                  applied.has(selectedJob.id)
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : selectedJob.status === 'Closed'|| selectedJob.status === 'Draft' ?'bg-muted text-muted-foreground cursor-not-allowed' :'bg-primary-700 text-white hover:bg-primary-800 shadow-card'
                }`}
              >
                {applying === selectedJob.id ? (
                  <><Loader2 size={14} className="animate-spin" /> Applying...</>
                ) : applied.has(selectedJob.id) ? (
                  <><CheckCircle size={14} /> Applied</>
                ) : selectedJob.status === 'Closed' ? (
                  'Closed'
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
                {selectedJob.requiredSkills.map(skill => (
                  <span key={`jskill-${skill}`} className="text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
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

const experienceLevelColor: Record<string, string> = {
  Junior: 'bg-green-50 text-green-700',
  'Mid-level': 'bg-blue-50 text-blue-700',
  Senior: 'bg-purple-50 text-purple-700',
  Lead: 'bg-orange-50 text-orange-700',
};