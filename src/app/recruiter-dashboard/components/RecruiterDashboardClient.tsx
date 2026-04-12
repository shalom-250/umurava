'use client';
import React, { useState } from 'react';
import { mockJobs, mockTalentProfiles, mockScreeningResults, jobStatusColors } from '@/lib/mockData';
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

  const selectedJob = mockJobs.find(j => j.id === selectedJobId) || mockJobs[0];
  const filteredJobs = mockJobs.filter(j =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.department.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const filteredResults = mockScreeningResults.filter(r => {
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
    toast.success(`AI screening complete — ${mockScreeningResults.length} candidates ranked for ${selectedJob.title}`);
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
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary-700"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {filteredJobs.map(job => (
            <button
              key={`jobsel-${job.id}`}
              onClick={() => setSelectedJobId(job.id)}
              className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
                selectedJobId === job.id
                  ? 'bg-primary-50 border-l-primary-700' :'border-l-transparent hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className={`text-xs font-semibold leading-tight ${selectedJobId === job.id ? 'text-primary-700' : 'text-foreground'}`}>
                  {job.title}
                </p>
                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${jobStatusColors[job.status]}`}>
                  {job.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{job.department} · {job.type}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-muted-foreground">{job.applicantCount} applicants</span>
                {job.shortlistedCount > 0 && (
                  <span className="text-[10px] text-green-600 font-medium">{job.shortlistedCount} shortlisted</span>
                )}
              </div>
            </button>
          ))}
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
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              <button
                onClick={handleTriggerScreening}
                disabled={isScreening || selectedJob.status === 'Draft' || selectedJob.status === 'Closed'}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 active:scale-95 ${
                  isScreening || selectedJob.status === 'Draft' || selectedJob.status === 'Closed' ?'bg-muted text-muted-foreground cursor-not-allowed' :'bg-primary-700 text-white hover:bg-primary-800 shadow-card'
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
          <KpiCards job={selectedJob} screeningResults={mockScreeningResults} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ApplicationsTrendChart />
            </div>
            <div>
              <ApplicantBreakdownChart results={mockScreeningResults} />
            </div>
          </div>

          {/* Shortlist Table */}
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-display font-600 text-foreground">AI Shortlist — Top {mockScreeningResults.length} Candidates</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {screeningDone ? `Screened ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Not screened yet'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                  {(['all', 'recommended', 'consider', 'not-recommended'] as const).map(f => (
                    <button
                      key={`filter-${f}`}
                      onClick={() => setShortlistFilter(f)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        shortlistFilter === f ? 'bg-white text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
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
        <CreateJobModal onClose={() => setShowCreateJob(false)} />
      )}
    </div>
  );
}