'use client';
import React, { useState, useEffect, useMemo } from 'react'; // Bump to fix chunk load error
import { mockJobs as staticMockJobs, mockTalentProfiles, mockScreeningResults, jobStatusColors } from '@/lib/mockData';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Sparkles, Plus, Search, Download, AlertTriangle, Loader2, RefreshCw, UploadCloud } from 'lucide-react';
import KpiCards from './KpiCards';
import ShortlistTable from './ShortlistTable';
import SkillMatchChart from './SkillMatchChart';
import ApplicantBreakdownChart from './ApplicantBreakdownChart';
import ApplicationsTrendChart from './ApplicationsTrendChart';
import AppLogo from '@/components/ui/AppLogo';
import CandidateReasoningDrawer from './CandidateReasoningDrawer';
import CreateJobModal from './CreateJobModal';
import UploadResumeModal from './UploadResumeModal';
import { Job, ScreeningResult, TalentProfile, mockTalentProfiles as staticMockProfiles } from '@/lib/mockData';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentJobId, setScreeningResults, setScreeningLoading, clearResults } from '@/store/screeningSlice';

export default function RecruiterDashboardClient() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentJobId, results: allResults, isScreening } = useSelector((state: RootState) => state.screening);

  const [screeningDone, setScreeningDone] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<{ profile: TalentProfile; result: ScreeningResult } | null>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [shortlistFilter, setShortlistFilter] = useState<'all' | 'recommended' | 'consider' | 'not-recommended'>('all');
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>(staticMockProfiles);

  const selectedJobId = currentJobId || 'job-001';
  const screeningResults = allResults[selectedJobId] || [];

  const setSelectedJobId = (id: string) => dispatch(setCurrentJobId(id));

  const fetchCandidates = async () => {
    try {
      const data = await api.get('/candidates');
      if (data && data.length > 0) {
        const mappedProfiles: TalentProfile[] = data.map((c: any) => ({
          id: c._id,
          firstName: c.name.split(' ')[0] || 'Unknown',
          lastName: c.name.split(' ').slice(1).join(' ') || 'Candidate',
          email: c.email,
          headline: c.experience || 'Professional',
          location: 'Rwanda',
          skills: (c.skills || []).map((s: string) => ({ name: s, level: 'Advanced', yearsOfExperience: 3 })),
          languages: [{ name: 'English', proficiency: 'Fluent' }],
          experience: [{
            role: 'Professional',
            company: 'Rwandan Market',
            location: 'Kigali',
            startDate: '2020',
            endDate: 'Present',
            isCurrent: true,
            technologies: c.skills || [],
            description: c.experience || ''
          }],
          education: [{
            degree: 'Degree',
            institution: c.education || 'University',
            fieldOfStudy: 'CS',
            startYear: 2016,
            endYear: 2020
          }],
          certifications: [],
          projects: [],
          availability: { status: 'Available', type: 'Full-time' },
          profileCompleteness: 100
        }));
        setTalentProfiles(mappedProfiles);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await api.get('/jobs');
      const finalJobs = data.length > 0 ? data : staticMockJobs;
      setJobs(finalJobs);

      if (finalJobs.length > 0) {
        const firstId = (finalJobs[0] as any).id || (finalJobs[0] as any)._id;
        if (!currentJobId) dispatch(setCurrentJobId(firstId));
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
    fetchCandidates();
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

  const specificResults = allResults[selectedJobId];

  useEffect(() => {
    if (selectedJobId.startsWith('job-') && !specificResults) {
      dispatch(setScreeningResults({ jobId: selectedJobId, results: mockScreeningResults }));
    }
  }, [selectedJobId, specificResults, dispatch]);

  const filteredResults = useMemo(() => screeningResults.filter(r => {
    if (shortlistFilter === 'all') return true;
    if (shortlistFilter === 'recommended') return r.recommendation === 'Strongly Recommend' || r.recommendation === 'Recommend';
    if (shortlistFilter === 'consider') return r.recommendation === 'Consider';
    if (shortlistFilter === 'not-recommended') return r.recommendation === 'Not Recommended';
    return true;
  }), [screeningResults, shortlistFilter]);

  const handleTriggerScreening = async (isReRun = false) => {
    if (selectedJob.status === 'Closed') {
      toast.error('Cannot screen for a Closed job');
      return;
    }

    dispatch(setScreeningLoading(true));
    setScreeningDone(false);
    if (isReRun) {
      dispatch(clearResults(selectedJobId));
    }

    try {
      const jobIdToUse = (selectedJob as any)._id || (selectedJob as any).id;
      const response = await api.post(`/screening/test-gemini/${jobIdToUse}`, {});

      const resultsData = response.results || response;

      const mappedResults: ScreeningResult[] = resultsData.map((r: any) => ({
        candidateId: r.candidateId,
        rank: r.rank,
        matchScore: r.score,
        recommendation: r.recommendation === 'Shortlist' ? 'Strongly Recommend' :
          r.recommendation === 'Waitlist' ? 'Consider' : 'Not Recommended',
        skillBreakdown: [
          { skill: 'Skills', score: r.weightedScore?.skills || 0, required: true },
          { skill: 'Experience', score: r.weightedScore?.experience || 0, required: true },
          { skill: 'Education', score: r.weightedScore?.education || 0, required: true }
        ],
        strengths: Array.isArray(r.strengths) ? r.strengths : [r.strengths],
        gaps: Array.isArray(r.gaps) ? r.gaps : [r.gaps],
        aiReasoning: r.aiReasoning,
        interviewQuestions: r.interviewQuestions
      }));

      dispatch(setScreeningResults({ jobId: selectedJobId, results: mappedResults }));
      toast.success(isReRun ? 'AI Screening Refreshed!' : 'AI Screening Complete!');
    } catch (error: any) {
      console.error('Screening failed:', error);
      toast.error(error.message || 'AI Screening failed.');
    } finally {
      dispatch(setScreeningLoading(false));
      setScreeningDone(true);
    }
  };

  // Generate mock trend data for charts
  const trendData = useMemo(() => Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    const seed = (String(selectedJob.id || (selectedJob as any)._id).length + i) % 10;
    const base = Math.floor((selectedJob.applicantCount || 45) / 15);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: base + seed,
      screened: Math.floor((base + seed) * 0.8)
    };
  }), [selectedJob.id, (selectedJob as any)._id, selectedJob.applicantCount]);

  if (!mounted) return null;

  return (
    <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* Job Selection Sidebar - Optimized to fit in standard dashboard layout */}
      <aside className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 sticky top-0 h-[calc(100vh-64px)]">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Job Selection</h3>
            <button
              onClick={() => setShowCreateJob(true)}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Create New Job"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search active jobs..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A1FF] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400 gap-3">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs">Loading jobs...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm font-medium">No results</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const jId = (job as any).id || (job as any)._id;
              const isActive = selectedJobId === jId;
              return (
                <button
                  key={jId}
                  onClick={() => setSelectedJobId(jId)}
                  className={`w-full text-left p-4 transition-all border-b border-gray-50 group relative ${isActive
                    ? 'bg-blue-50/30 border-l-4 border-l-[#00A1FF]'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-bold text-xs leading-tight transition-colors pr-2 ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {job.title}
                    </h4>
                    <span className={`px-1.5 py-0.5 whitespace-nowrap rounded-[4px] text-[9px] font-bold uppercase tracking-wider ${job.status === 'Active' ? 'bg-green-100 text-green-700' :
                      job.status === 'Closed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                      {job.status || 'Draft'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <span className="truncate">{job.department}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{job.applicantCount || 0} applied</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Dashboard Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Internal - Compact */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-600 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                Dashboard / {selectedJob.department}
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedJob.title}</h2>
              <p className="mt-1 text-sm text-gray-500 font-medium">
                {selectedJob.location} • {selectedJob.type} • Posted {new Date(selectedJob.postedDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadResume(true)}
                disabled={selectedJob.status === 'Closed'}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
              >
                <UploadCloud size={16} />
                Upload CVs
              </button>
              {screeningResults.length > 0 && (
                <button
                  onClick={() => handleTriggerScreening(true)}
                  disabled={isScreening}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  <RefreshCw size={16} className={isScreening ? 'animate-spin' : ''} />
                  Refresh AI
                </button>
              )}
              <button
                onClick={() => handleTriggerScreening(false)}
                disabled={isScreening || selectedJob.status === 'Closed'}
                className="flex items-center gap-2 px-6 py-2 bg-[#00A1FF] text-white rounded-lg text-sm font-bold hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-blue-100"
              >
                {isScreening ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Screening...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {screeningResults.length > 0 ? 'Re-run Screening' : 'Run AI Screening'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* KPI Section */}
          <KpiCards
            job={selectedJob}
            screeningResults={screeningResults}
          />

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <ApplicationsTrendChart jobTitle={selectedJob.title} data={trendData} />
            </div>
            <div>
              <ApplicantBreakdownChart jobTitle={selectedJob.title} results={screeningResults} />
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI-Shortlisted Candidates</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Ranked based on multi-dimensional skill & experience analysis</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                {(['all', 'recommended', 'consider', 'not-recommended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setShortlistFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all ${shortlistFilter === filter
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {filter.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {isScreening ? (
              <div className="p-8">
                <div className="animate-pulse space-y-6">
                  {/* Header Skeleton */}
                  <div className="flex gap-4 border-b border-gray-100 pb-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  {/* Row Skeletons */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100/50 shrink-0"></div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-green-100 rounded w-24 shrink-0"></div>
                      <div className="h-4 bg-amber-100 rounded w-24 shrink-0"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20 shrink-0"></div>
                    </div>
                  ))}
                  <div className="flex flex-col items-center justify-center pt-4">
                    <Loader2 size={24} className="text-[#00A1FF] animate-spin mb-2" />
                    <p className="text-sm font-bold text-gray-500">Unifying and evaluating talent pool...</p>
                  </div>
                </div>
              </div>
            ) : (
              <ShortlistTable
                results={filteredResults}
                profiles={talentProfiles}
                onViewCandidate={(res) => {
                  const profile = talentProfiles.find(p => p.id === res.candidateId) || staticMockProfiles[0];
                  setSelectedCandidate({ profile, result: res });
                }}
              />
            )}

            {screeningResults.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="text-blue-500" size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">No Screening Results</h4>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium text-sm">
                  Run the AI screening to rank and analyze applicants for this role.
                </p>
                <button
                  onClick={() => handleTriggerScreening(false)}
                  className="inline-flex items-center gap-2 px-8 py-2.5 bg-[#00A1FF] text-white rounded-xl font-bold hover:bg-blue-600 transition-all"
                >
                  <Sparkles size={16} />
                  Start Screening
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      {selectedCandidate && (
        <CandidateReasoningDrawer
          profile={selectedCandidate.profile}
          result={selectedCandidate.result}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {showCreateJob && (
        <CreateJobModal
          onClose={() => setShowCreateJob(false)}
          onSuccess={() => {
            setShowCreateJob(false);
            fetchJobs();
          }}
        />
      )}

      {showUploadResume && (
        <UploadResumeModal
          onClose={() => setShowUploadResume(false)}
          onSuccess={() => {
            setShowUploadResume(false);
            fetchCandidates();
          }}
        />
      )}
    </div>
  );
}