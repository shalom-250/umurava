'use client';
import React, { useState, useEffect } from 'react';
import { mockJobs as staticMockJobs, mockTalentProfiles, mockScreeningResults, jobStatusColors } from '@/lib/mockData';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Sparkles, Plus, Search, Download, AlertTriangle, Loader2 } from 'lucide-react';
import KpiCards from './KpiCards';
import ShortlistTable from './ShortlistTable';
import SkillMatchChart from './SkillMatchChart';
import ApplicantBreakdownChart from './ApplicantBreakdownChart';
import ApplicationsTrendChart from './ApplicationsTrendChart';
import CandidateReasoningDrawer from './CandidateReasoningDrawer';
import CreateJobModal from './CreateJobModal';
import { Job, ScreeningResult, TalentProfile } from '@/lib/mockData';

export default function RecruiterDashboardClient() {
  const [selectedJobId, setSelectedJobId] = useState('job-001');
  const [isScreening, setIsScreening] = useState(false);
  const [screeningDone, setScreeningDone] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<{ profile: TalentProfile; result: ScreeningResult } | null>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [shortlistFilter, setShortlistFilter] = useState<'all' | 'recommended' | 'consider' | 'not-recommended'>('all');
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);

  const fetchJobs = async () => {
    try {
      const data = await api.get('/jobs');
      const finalJobs = data.length > 0 ? data : staticMockJobs;
      setJobs(finalJobs);

      // Select first job if none selected or current selection missing
      if (finalJobs.length > 0) {
        const firstId = (finalJobs[0] as any).id || (finalJobs[0] as any)._id;
        setSelectedJobId(prev => prev === 'job-001' ? firstId : prev);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs(staticMockJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchJobs();
  }, []);

  const selectedJob = jobs.find(j => (j as any).id === selectedJobId || (j as any)._id === selectedJobId) || jobs[0] || staticMockJobs[0];
  const filteredJobs = jobs.filter(j => {
    const searchLower = jobSearch.toLowerCase();
    return (
      (j.title && j.title.toLowerCase().includes(searchLower)) ||
      (j.department && j.department.toLowerCase().includes(searchLower)) ||
      (j.location && j.location.toLowerCase().includes(searchLower)) ||
      (j.type && j.type.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    // In a real system, we would fetch screening results for this job:
    // api.get(`/jobs/${selectedJobId}/screening-results`)

    // For now, if it's a mock job, use mock results. 
    // If it's a real job from backend, simulate some results or show empty.
    if (selectedJobId.startsWith('job-')) {
      setScreeningResults(mockScreeningResults);
    } else {
      // It's likely a MongoDB ID (real job)
      // Since we don't have real candidates for those yet, we'll keep it empty or show a subset
      setScreeningResults([]);
    }
  }, [selectedJobId]);

  const filteredResults = screeningResults.filter(r => {
    if (shortlistFilter === 'all') return true;
    if (shortlistFilter === 'recommended') return r.recommendation === 'Strongly Recommend' || r.recommendation === 'Recommend';
    if (shortlistFilter === 'consider') return r.recommendation === 'Consider';
    if (shortlistFilter === 'not-recommended') return r.recommendation === 'Not Recommended';
    return true;
  });

  const handleTriggerScreening = async () => {
    if (selectedJob.status !== 'Active' && selectedJob.status !== 'Screening') {
      toast.error('Job must be Active to trigger screening');
      return;
    }
    setIsScreening(true);
    setScreeningDone(false);
    // Backend integration point: POST /api/screening/trigger { jobId: selectedJobId }
    await new Promise(r => setTimeout(r, 3200));
    setIsScreening(false);
    setScreeningDone(true);

    // If it's a real job, "fill" it with some mock data after screening
    if (!selectedJobId.startsWith('job-')) {
      setScreeningResults(mockScreeningResults.slice(0, 5).map((r, i) => ({
        ...r,
        rank: i + 1,
        candidateId: `candidate-backend-${i}`
      })));
    }

    toast.success(`AI screening complete — ${screeningResults.length || 5} candidates ranked for ${selectedJob.title}`);
  };

  const handleViewCandidate = (result: ScreeningResult) => {
    const profile = mockTalentProfiles.find(p => p.id === result.candidateId);
    if (profile) setSelectedCandidate({ profile, result });
  };

  const handleExportShortlist = () => {
    toast.success('Shortlist exported as CSV — check your downloads');
  };

  return (
    <div className="flex h-full">
      {/* Job Selector Panel */}
      <div className="w-64 shrink-0 bg-white border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold font-display text-foreground">Active Jobs</h2>
            <button
              onClick={() => setShowCreateJob(true)}
              suppressHydrationWarning
              className="p-1.5 rounded-md bg-primary-700 text-white hover:bg-primary-800 transition-colors active:scale-95"
              title="Create new job"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary-700"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => {
              const jobId = (job as any).id || (job as any)._id;
              const isSelected = selectedJobId === jobId;
              return (
                <button
                  key={`jobsel-${jobId}`}
                  onClick={() => setSelectedJobId(jobId)}
                  className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${isSelected ? 'bg-primary-50 border-l-primary-700' : 'border-l-transparent hover:bg-muted'}`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-primary-700' : 'text-foreground'}`}>
                      {job.title}
                    </p>
                    <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${jobStatusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{job.department} · {job.type}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{(job.applicantCount || 0)} applicants</span>
                    {(job.shortlistedCount || 0) > 0 && (
                      <span className="text-[10px] text-green-600 font-medium">{job.shortlistedCount} shortlisted</span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <Search size={20} className="mx-auto text-muted-foreground mb-2 opacity-20" />
              <p className="text-xs font-medium text-foreground">No jobs found</p>
              <p className="text-[10px] text-muted-foreground mt-1">Try another search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-display font-700 text-foreground">{selectedJob.title}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${jobStatusColors[selectedJob.status]}`}>
                  {selectedJob.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedJob.department} · {selectedJob.location} · {selectedJob.type} · Deadline: {selectedJob.deadline}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportShortlist}
                suppressHydrationWarning
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              <button
                onClick={handleTriggerScreening}
                disabled={isScreening || selectedJob.status === 'Draft' || selectedJob.status === 'Closed'}
                suppressHydrationWarning
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 active:scale-95 ${isScreening || selectedJob.status === 'Draft' || selectedJob.status === 'Closed' ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary-700 text-white hover:bg-primary-800 shadow-card'
                  }`}
              >
                {isScreening ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Screening...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Run AI Screening
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6">
          {/* Screening Status Banner */}
          {isScreening && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Gemini AI is analyzing {selectedJob.applicantCount} candidates...</p>
                <p className="text-xs text-blue-600 mt-0.5">Evaluating skills, experience, and job fit. This takes 10–30 seconds.</p>
              </div>
            </div>
          )}

          {selectedJob.status === 'Draft' && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle size={16} className="text-amber-600" />
              <p className="text-sm text-amber-800">This job is in Draft status. Publish it to start accepting applications and trigger AI screening.</p>
            </div>
          )}

          {/* KPI Cards */}
          <KpiCards job={selectedJob} screeningResults={screeningResults} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ApplicationsTrendChart />
            </div>
            <div>
              <ApplicantBreakdownChart results={screeningResults} />
            </div>
          </div>

          {/* Shortlist Table */}
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-display font-600 text-foreground">AI Shortlist — Top {mockScreeningResults.length} Candidates</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {screeningDone && mounted ?
                    `Screened ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : !screeningDone ? 'Not screened yet' : '...'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                  {(['all', 'recommended', 'consider', 'not-recommended'] as const).map(f => (
                    <button
                      key={`filter-${f}`}
                      onClick={() => setShortlistFilter(f)}
                      suppressHydrationWarning
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${shortlistFilter === f ? 'bg-white text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {f === 'all' ? 'All' : f === 'recommended' ? 'Recommended' : f === 'consider' ? 'Consider' : 'Not Rec.'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ShortlistTable
              results={filteredResults}
              profiles={mockTalentProfiles}
              onViewCandidate={handleViewCandidate}
            />
          </div>

          {/* Skill Match Chart */}
          <SkillMatchChart results={mockScreeningResults.slice(0, 6)} profiles={mockTalentProfiles} />
        </div>
      </div>

      {/* Candidate Reasoning Drawer */}
      {selectedCandidate && (
        <CandidateReasoningDrawer
          profile={selectedCandidate.profile}
          result={selectedCandidate.result}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <CreateJobModal
          onClose={() => setShowCreateJob(false)}
          onSuccess={() => fetchJobs()}
        />
      )}
    </div>
  );
}