'use client';
import React, { useState, useEffect, useMemo } from 'react'; // Bump to fix chunk load error
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Sparkles, Plus, Search, Download, AlertTriangle, Loader2, RefreshCw, UploadCloud, Settings } from 'lucide-react';
import KpiCards from './KpiCards';
import ShortlistTable from './ShortlistTable';
import SkillMatchChart from './SkillMatchChart';
import ApplicantBreakdownChart from './ApplicantBreakdownChart';
import ApplicationsTrendChart from './ApplicationsTrendChart';
import AppLogo from '@/components/ui/AppLogo';
import CandidateReasoningDrawer from './CandidateReasoningDrawer';
import CreateJobModal from './CreateJobModal';
import EditJobModal from './EditJobModal';
import UploadResumeModal from './UploadResumeModal';
import DraftProfilesTable from './DraftProfilesTable';
import { Job, ScreeningResult, TalentProfile } from '@/lib/mockData';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentJobId, setScreeningResults, setScreeningLoading, clearResults } from '@/store/screeningSlice';

export default function RecruiterDashboardClient() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentJobId, results: allResults, isScreening } = useSelector((state: RootState) => state.screening);

  const [screeningDone, setScreeningDone] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<{ profile: TalentProfile; result: ScreeningResult } | null>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [shortlistFilter, setShortlistFilter] = useState<'all' | 'recommended' | 'consider' | 'not-recommended'>('all');
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [draftProfiles, setDraftProfiles] = useState<any[]>([]);

  const selectedJobId = currentJobId;
  const screeningResults = (selectedJobId && allResults[selectedJobId]) || [];

  const setSelectedJobId = (id: string) => dispatch(setCurrentJobId(id));

  const fetchJobs = async () => {
    try {
      const data = await api.get('/jobs');
      if (data && data.length > 0) {
        setJobs(data);
        const firstId = (data[0] as any).id || (data[0] as any)._id;
        if (!currentJobId) dispatch(setCurrentJobId(firstId));
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await api.get('/candidates');
      if (data && data.length > 0) {
        const mappedProfiles: TalentProfile[] = data.map((c: any) => {
          const rawSkills = c.skills || [];
          const normalizedSkills = rawSkills.map((s: any) => {
            if (typeof s === 'string') return { name: s, level: 'Advanced', yearsOfExperience: 3 };
            return {
              name: s.name || 'Skill',
              level: s.level || 'Advanced',
              yearsOfExperience: s.yearsOfExperience || 3
            };
          });

          return {
            id: c._id,
            firstName: c.name?.split(' ')[0] || c.firstName || 'Unknown',
            lastName: c.name?.split(' ').slice(1).join(' ') || c.lastName || 'Candidate',
            email: c.email,
            headline: c.headline || c.experience || 'Professional',
            location: c.location || 'Rwanda',
            skills: normalizedSkills,
            languages: c.languages || [{ name: 'English', proficiency: 'Fluent' }],
            experience: (c.experience || []).length > 0 && typeof c.experience !== 'string' ? c.experience : [{
              role: 'Professional',
              company: 'Rwandan Market',
              location: 'Kigali',
              startDate: '2020',
              endDate: 'Present',
              isCurrent: true,
              technologies: rawSkills.map((s: any) => typeof s === 'string' ? s : s.name),
              description: typeof c.experience === 'string' ? c.experience : 'Professional experience'
            }],
            education: c.education || [{
              degree: 'Degree',
              institution: 'University',
              fieldOfStudy: 'CS',
              startYear: 2016,
              endYear: 2020
            }],
            certifications: c.certifications || [],
            projects: c.projects || [],
            availability: c.availability || { status: 'Available', type: 'Full-time' },
            profileCompleteness: 100,
            resumeUrl: c.resumeUrl
          };
        });
        setTalentProfiles(mappedProfiles);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const fetchScreeningResults = async (jobId: string) => {
    if (!jobId) return;
    try {
      const data = await api.get(`/screening/${jobId}`);
      if (data && Array.isArray(data)) {
        const mappedResults: ScreeningResult[] = data.map((r: any) => ({
          candidateId: r.candidateId?._id || r.candidateId,
          rank: r.rank,
          matchScore: r.score,
          recommendation: r.recommendation === 'Shortlist' ? 'Strongly Recommend' :
            r.recommendation === 'Waitlist' ? 'Consider' : 'Not Recommended',
          skillBreakdown: r.skillBreakdown || (r.weightedScore ? [
            { skill: 'Skills', score: r.weightedScore.skills || 0, required: true },
            { skill: 'Experience', score: r.weightedScore.experience || 0, required: true },
            { skill: 'Education', score: r.weightedScore.education || 0, required: true }
          ] : []),
          strengths: Array.isArray(r.strengths) ? r.strengths : r.strengths ? [r.strengths] : [],
          gaps: Array.isArray(r.gaps) ? r.gaps : r.gaps ? [r.gaps] : [],
          aiReasoning: r.aiReasoning,
          interviewQuestions: r.interviewQuestions || [],
          documentStatus: r.documentStatus || []
        }));
        dispatch(setScreeningResults({ jobId, results: mappedResults }));
      }
    } catch (error) {
      console.error('Failed to fetch screening results:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchJobs();
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchScreeningResults(selectedJobId);
      fetchApplications();
    }
  }, [selectedJobId]);

  const selectedJob = jobs.find(j => (j as any).id === selectedJobId || (j as any)._id === selectedJobId) || jobs[0];
  const filteredJobs = jobs.filter(j => {
    const searchLower = jobSearch.toLowerCase();
    return (
      (j.title && j.title.toLowerCase().includes(searchLower)) ||
      (j.department && j.department.toLowerCase().includes(searchLower)) ||
      (j.location && j.location.toLowerCase().includes(searchLower))
    );
  });


  const filteredResults = useMemo(() => {
    // 1. Start with actual screening results
    const results = [...screeningResults];

    // 2. Identify candidates in applications who ARE NOT in screeningResults
    const unscreenedApps = applications.filter(app => {
      const candId = app.candidateId?._id || app.candidateId;
      return !results.some(r => r.candidateId === candId);
    });

    // 3. Create "Synthetic" pending results for them
    const pendingResults: ScreeningResult[] = (unscreenedApps || []).map(app => ({
      candidateId: app.candidateId?._id || app.candidateId,
      rank: 0, // Mark as 0 for "New"
      matchScore: 0,
      recommendation: 'Awaiting AI Analysis' as any,
      skillBreakdown: [],
      strengths: ['Pending Evaluation'],
      gaps: ['Pending Evaluation'],
      aiReasoning: 'This candidate has recently applied and has not been analyzed by the AI yet.',
      interviewQuestions: [],
      documentStatus: []
    }));

    const combined = [...results, ...pendingResults];

    // 4. Apply filters
    if (shortlistFilter === 'all') return combined;
    if (shortlistFilter === 'recommended') return combined.filter(r => r.recommendation === 'Strongly Recommend' || r.recommendation === 'Recommend');
    if (shortlistFilter === 'consider') return combined.filter(r => r.recommendation === 'Consider');
    if (shortlistFilter === 'not-recommended') return combined.filter(r => r.recommendation === 'Not Recommended');
    return combined;
  }, [screeningResults, applications, shortlistFilter]);

  const fetchApplications = async () => {
    if (!selectedJobId) return;
    try {
      const data = await api.get('/applications');
      const jobApplications = data.filter((app: any) =>
        (app.jobId?._id || app.jobId) === selectedJobId
      );
      setApplications(jobApplications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleUpdateApplicationStatus = async (candidateId: string, newStatus: string) => {
    const app = applications.find(a => (a.candidateId?._id || a.candidateId) === candidateId);
    if (!app) {
      toast.error('Application not found for this candidate');
      return;
    }

    try {
      await api.put(`/applications/${app._id}`, { status: newStatus });
      toast.success(`Candidate status updated to ${newStatus}`);
      fetchApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update candidate status');
    }
  };

  const handleTriggerScreening = async (isReRun = false) => {
    if (selectedJob?.status === 'Closed') {
      toast.error('Cannot screen for a Closed job');
      return;
    }

    dispatch(setScreeningLoading(true));
    setScreeningDone(false);
    if (selectedJobId && isReRun) {
      dispatch(clearResults(selectedJobId));
    }

    try {
      if (!selectedJobId) throw new Error('No job selected');
      const jobIdToUse = (selectedJob as any)._id || (selectedJob as any).id;

      // PRODUCTION ENDPOINT: Analyze real applicants in DB
      const response = await api.post(`/screening/${jobIdToUse}`, {});

      const resultsData = response.results || response;

      const mappedResults: ScreeningResult[] = resultsData.map((r: any) => ({
        candidateId: r.candidateId,
        rank: r.rank,
        matchScore: r.score,
        recommendation: r.recommendation === 'Shortlist' ? 'Strongly Recommend' :
          r.recommendation === 'Waitlist' ? 'Consider' : 'Not Recommended',
        skillBreakdown: r.skillBreakdown || [
          { skill: 'Skills', score: r.weightedScore?.skills || 0, required: true },
          { skill: 'Experience', score: r.weightedScore?.experience || 0, required: true },
          { skill: 'Education', score: r.weightedScore?.education || 0, required: true }
        ],
        strengths: Array.isArray(r.strengths) ? r.strengths : r.strengths ? [r.strengths] : [],
        gaps: Array.isArray(r.gaps) ? r.gaps : r.gaps ? [r.gaps] : [],
        aiReasoning: r.aiReasoning,
        interviewQuestions: r.interviewQuestions || [],
        documentStatus: r.documentStatus || []
      }));

      if (selectedJobId) {
        dispatch(setScreeningResults({ jobId: selectedJobId, results: mappedResults }));
        // Refresh job data to get updated lastScreenedAt
        fetchJobs();
      }
      toast.success(isReRun ? 'AI Screening Refreshed!' : 'AI Screening Complete!');
    } catch (error: any) {
      console.error('Screening failed:', error);
      toast.error(error.message || 'AI Screening failed.');
    } finally {
      dispatch(setScreeningLoading(false));
      setScreeningDone(true);
    }
  };

  const handleUpdateDraftProfile = (idx: number, profile: any) => {
    const updated = [...draftProfiles];
    updated[idx] = profile;
    setDraftProfiles(updated);
  };

  const handleRemoveDraftProfile = (idx: number) => {
    setDraftProfiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateProfile = async (idx: number, skipToast = false) => {
    const profile = draftProfiles[idx];
    const nameParts = (profile.name || '').split(' ');
    const finalPayload = [{
      ...profile,
      firstName: profile.firstName || nameParts[0] || 'Candidate',
      lastName: profile.lastName || nameParts.slice(1).join(' ') || '',
      // Use structured data if available, otherwise parse raw
      skills: Array.isArray(profile.skills) && profile.skills.length > 0
        ? profile.skills
        : (profile.skillsRaw ? profile.skillsRaw.split(',').map((s: string) => ({ name: s.trim(), level: 'Intermediate', yearsOfExperience: 1 })).filter((s: any) => s.name.length > 0) : []),
      experience: Array.isArray(profile.experience) && profile.experience.length > 0
        ? profile.experience
        : (profile.experience && typeof profile.experience === 'string' ? [{ company: 'Previous', role: 'Role', description: profile.experience, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : profile.experience || []),
      education: Array.isArray(profile.education) && profile.education.length > 0
        ? profile.education
        : (profile.education && typeof profile.education === 'string' ? [{ institution: 'University', degree: profile.education, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : profile.education || [])
    }];

    try {
      await api.post('/candidates', { candidates: finalPayload });
      if (!skipToast) toast.success(`Profile created for ${profile.name}`);
      setDraftProfiles(prev => prev.filter((_, i) => i !== idx));
      fetchCandidates();
      return true;
    } catch (error: any) {
      console.error(error);
      if (!skipToast) toast.error(`Failed to create profile: ${error.message}`);
      return false;
    }
  };

  const handleCreateAllProfiles = async () => {
    const loader = toast.loading('Creating all profiles...');
    let successCount = 0;
    for (let i = 0; i < draftProfiles.length; i++) {
      const ok = await handleCreateProfile(i, true);
      if (ok) successCount++;
    }
    toast.dismiss(loader);
    toast.success(`Successfully created ${successCount} profiles`);
  };

  const handleScreenDrafts = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job first');
      return;
    }

    const loader = toast.loading('Saving drafts and triggering AI screening...');

    // 1. Save all drafts as candidates
    const profilesToSave = draftProfiles.map(p => {
      const nameParts = (p.name || '').split(' ');
      return {
        ...p,
        firstName: p.firstName || nameParts[0] || 'Candidate',
        lastName: p.lastName || nameParts.slice(1).join(' ') || '',
        skills: Array.isArray(p.skills) && p.skills.length > 0
          ? p.skills
          : (p.skillsRaw ? p.skillsRaw.split(',').map((s: string) => ({ name: s.trim(), level: 'Intermediate', yearsOfExperience: 1 })).filter((s: any) => s.name.length > 0) : []),
        experience: Array.isArray(p.experience) && p.experience.length > 0
          ? p.experience
          : (p.experience && typeof p.experience === 'string' ? [{ company: 'Previous', role: 'Role', description: p.experience, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : p.experience || []),
        education: Array.isArray(p.education) && p.education.length > 0
          ? p.education
          : (p.education && typeof p.education === 'string' ? [{ institution: 'University', degree: p.education, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : p.education || [])
      };
    });

    try {
      // Bulk save
      const savedCandidates = await api.post('/candidates', { candidates: profilesToSave });

      // 2. Apply them to the job
      for (const cand of savedCandidates) {
        try {
          await api.post('/applications', { jobId: selectedJobId, candidateId: cand._id });
        } catch (e) {
          // Ignore "already applied" errors
        }
      }

      toast.dismiss(loader);
      setDraftProfiles([]);
      fetchCandidates();
      fetchApplications();

      // 3. Trigger screening
      handleTriggerScreening(false);
    } catch (error: any) {
      toast.dismiss(loader);
      toast.error(`Screening failed: ${error.message}`);
    }
  };

  // Generate mock trend data for charts
  const trendData = useMemo(() => {
    if (!selectedJob) return [];
    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (14 - i));
      const seed = ((selectedJob as any)._id || (selectedJob as any).id || '').length + i;
      const base = Math.floor((selectedJob.applicantCount || 0) / 15);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: base + seed,
        screened: Math.floor((base + seed) * (screeningResults.length > 0 ? 0.8 : 0))
      };
    });
  }, [selectedJob, screeningResults.length]);

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
            {selectedJob ? (
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-600 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  Dashboard / {selectedJob.department}
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedJob.title}</h2>
                  <button
                    onClick={() => setShowEditJob(true)}
                    className="p-1 text-gray-400 hover:text-[#00A1FF] hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit Job Details"
                  >
                    <Settings size={18} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500 font-medium">
                  {selectedJob.location} • {selectedJob.type} • Posted {new Date(selectedJob.postedDate || Date.now()).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select a Job</h2>
                <p className="mt-1 text-sm text-gray-500 font-medium italic">No active job selected</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {selectedJob?.lastScreenedAt && (
                <div className="hidden xl:flex flex-col items-end mr-2 pr-4 border-r border-gray-200">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-1">
                    Last Analysis
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {new Date(selectedJob.lastScreenedAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowUploadResume(true)}
                disabled={selectedJob?.status === 'Closed' || !selectedJob}
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
                disabled={isScreening || selectedJob?.status === 'Closed' || !selectedJob}
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
          {selectedJob && (
            <KpiCards
              job={selectedJob}
              screeningResults={screeningResults}
            />
          )}

          {/* Charts Section */}
          {selectedJob && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <SkillMatchChart results={screeningResults} profiles={talentProfiles} job={selectedJob} />
              </div>
              <div>
                <ApplicantBreakdownChart jobTitle={selectedJob.title} results={screeningResults} />
              </div>
            </div>
          )}

          {/* Draft Profiles Table */}
          {draftProfiles.length > 0 && (
            <DraftProfilesTable
              profiles={draftProfiles}
              onUpdate={handleUpdateDraftProfile}
              onRemove={handleRemoveDraftProfile}
              onCreateProfile={handleCreateProfile}
              onCreateAll={handleCreateAllProfiles}
              onScreenAll={handleScreenDrafts}
            />
          )}

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
                  const profile = talentProfiles.find(p => p.id === res.candidateId);
                  if (profile) {
                    setSelectedCandidate({ profile, result: res });
                  } else {
                    toast.error('Candidate profile details not available');
                  }
                }}
              />
            )}

            {applications.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="text-blue-500" size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">No Applicants Yet</h4>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium text-sm">
                  This job listing hasn't received any applications to analyze yet.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowUploadResume(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <UploadCloud size={18} />
                    Upload CVs
                  </button>
                </div>
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
          application={applications.find(a => (a.candidateId?._id || a.candidateId) === selectedCandidate.result.candidateId)}
          onUpdateStatus={(status) => handleUpdateApplicationStatus(selectedCandidate.result.candidateId, status)}
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

      {showEditJob && selectedJob && (
        <EditJobModal
          job={selectedJob}
          onClose={() => setShowEditJob(false)}
          onSuccess={() => {
            setShowEditJob(false);
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
          onExtracted={(candidates) => {
            setDraftProfiles(prev => [...prev, ...candidates]);
            toast.success(`${candidates.length} profiles extracted to draft table`);
          }}
        />
      )}
    </div>
  );
}