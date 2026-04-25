'use client';
import React, { useState, useEffect, useMemo } from 'react'; // Bump to fix chunk load error
import { api } from '@/lib/api';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DraftProfilesTable from './DraftProfilesTable';
import StoredFilesModal from './StoredFilesModal';
import TalentPoolTable from './TalentPoolTable';
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
import { Job, ScreeningResult, TalentProfile } from '@/lib/mockData';
import { Users, LayoutDashboard, Sparkles, Plus, Search, Download, AlertTriangle, Loader2, RefreshCw, UploadCloud, Settings, Edit2, FolderOpen, Menu, Check, X, ArrowLeft, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentJobId, setScreeningResults, setScreeningLoading, clearResults } from '@/store/screeningSlice';

export default function RecruiterDashboardClient() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentJobId, results: allResults, isScreening } = useSelector((state: RootState) => state.screening);

  const [screeningDone, setScreeningDone] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<{ profile: TalentProfile; result: ScreeningResult; fromTalentPool?: boolean } | null>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [showStoredFiles, setShowStoredFiles] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [shortlistFilter, setShortlistFilter] = useState<'all' | 'recommended' | 'consider' | 'not-recommended'>('all');
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [draftProfiles, setDraftProfiles] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'job-dashboard' | 'talent-pool'>('job-dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isJobSidebarCollapsed, setIsJobSidebarCollapsed] = useState(false);

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
    fetchApplications(); // Fetch all apps initially for global pool context

    // Load sidebar state from localStorage
    const saved = localStorage.getItem('isJobSidebarCollapsed');
    if (saved !== null) {
      setIsJobSidebarCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('isJobSidebarCollapsed', String(isJobSidebarCollapsed));
    }
  }, [isJobSidebarCollapsed, mounted]);

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
    try {
      const data = await api.get('/applications');
      setAllApplications(data || []);
      if (selectedJobId) {
        const jobApplications = data.filter((app: any) =>
          (app.jobId?._id || app.jobId) === selectedJobId
        );
        setApplications(jobApplications);
      }
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
        : (profile.experienceText ? [{ company: 'Previous', role: 'Role', description: profile.experienceText, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : (typeof profile.experience === 'string' ? [{ company: 'Previous', role: 'Role', description: profile.experience, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : [])),
      education: Array.isArray(profile.education) && profile.education.length > 0
        ? profile.education
        : (profile.educationText ? [{ institution: 'University', degree: profile.educationText, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : (typeof profile.education === 'string' ? [{ institution: 'University', degree: profile.education, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : []))
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
          : (p.experienceText ? [{ company: 'Previous', role: 'Role', description: p.experienceText, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : (typeof p.experience === 'string' ? [{ company: 'Previous', role: 'Role', description: p.experience, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : [])),
        education: Array.isArray(p.education) && p.education.length > 0
          ? p.education
          : (p.educationText ? [{ institution: 'University', degree: p.educationText, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : (typeof p.education === 'string' ? [{ institution: 'University', degree: p.education, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : []))
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

  const handleExportExcel = () => {
    const exportData = filteredResults.map(r => {
      const profile = talentProfiles.find(p => p.id === r.candidateId);
      const app = applications.find(a => (a.candidateId?._id || a.candidateId) === r.candidateId);
      return {
        'Job Title': selectedJob?.title || 'Unknown',
        'Department': selectedJob?.department || 'Unknown',
        'Candidate Name': profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown',
        'Email': profile?.email || 'N/A',
        'Match Score': r.matchScore,
        'Recommendation': r.recommendation,
        'Status': app?.status || 'Applied',
        'Key Skills': profile?.skills?.map((s: any) => s.name).join(', ') || 'None',
        'AI Reasoning': r.aiReasoning || ''
      };
    });

    if (exportData.length === 0) {
      toast.error('No candidates found to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, `Shortlisted_Candidates_${selectedJob?.title?.replace(/\s+/g, '_') || 'Job'}.xlsx`);
  };

  const handleExportPdf = () => {
    const exportData = filteredResults.map(r => {
      const profile = talentProfiles.find(p => p.id === r.candidateId);
      const app = applications.find(a => (a.candidateId?._id || a.candidateId) === r.candidateId);
      return [
        profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown',
        profile?.email || 'N/A',
        r.matchScore.toString(),
        r.recommendation,
        app?.status || 'Applied',
        profile?.skills?.slice(0, 3).map((s: any) => s.name).join(', ') || 'None'
      ];
    });

    if (exportData.length === 0) {
      toast.error('No candidates found to export.');
      return;
    }

    const doc = new jsPDF('landscape');

    // Add Job Info Header
    doc.setFontSize(18);
    doc.text(`Candidates for ${selectedJob?.title || 'Job'}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Department: ${selectedJob?.department || 'Unknown'} | Location: ${selectedJob?.location || 'Unknown'}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Candidate Name', 'Email', 'Score', 'Recommendation', 'Status', 'Top Skills']],
      body: exportData,
      theme: 'grid',
      headStyles: { fillColor: [0, 161, 255] }
    });

    doc.save(`Candidates_${selectedJob?.title?.replace(/\s+/g, '_') || 'Job'}.pdf`);
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
    <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-64px)] relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Job Selection Sidebar - Optimized for responsiveness */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 border-r border-gray-200 bg-white flex flex-col shrink-0 
        transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)]
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl w-72 sm:w-80' : '-translate-x-full lg:translate-x-0'}
        ${isJobSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-80'}
      `}>
        {/* Mobile Sidebar Close Button */}
        <div className="lg:hidden p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <AppLogo />
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className={`p-4 border-b border-gray-100 flex flex-col gap-2 ${isJobSidebarCollapsed ? 'items-center' : ''}`}>
          <button
            onClick={() => {
              setActiveView('talent-pool');
              setIsMobileSidebarOpen(false);
            }}
            title={isJobSidebarCollapsed ? 'Shared Talent Pool' : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isJobSidebarCollapsed ? 'w-10 h-10 justify-center px-0' : 'w-full'} ${activeView === 'talent-pool'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
          >
            <Users size={18} />
            {!isJobSidebarCollapsed && <span>Shared Talent Pool</span>}
          </button>

          <div className="h-px bg-gray-100 my-1 w-full" />

          <div className={`flex items-center justify-between px-1 ${isJobSidebarCollapsed ? 'flex-col gap-2' : ''}`}>
            {!isJobSidebarCollapsed && <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Active Jobs</h3>}
            <button
              onClick={() => {
                setShowCreateJob(true);
                setIsMobileSidebarOpen(false);
              }}
              className={`p-1 hover:bg-gray-100 rounded-md text-blue-600 transition-colors ${isJobSidebarCollapsed ? 'w-8 h-8 flex items-center justify-center' : ''}`}
              title="Create New Job"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {!isJobSidebarCollapsed && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Filter jobs..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400 gap-3">
              <Loader2 className="animate-spin" size={20} />
              {!isJobSidebarCollapsed && <span className="text-xs">Loading...</span>}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className={`p-8 text-center text-gray-500 ${isJobSidebarCollapsed ? 'px-2' : ''}`}>
              {!isJobSidebarCollapsed ? <p className="text-sm font-medium">No results</p> : <Search size={16} className="mx-auto" />}
            </div>
          ) : (
            filteredJobs.map((job) => {
              const jId = (job as any).id || (job as any)._id;
              const isActive = selectedJobId === jId && activeView === 'job-dashboard';
              return (
                <button
                  key={jId}
                  onClick={() => {
                    setSelectedJobId(jId);
                    setActiveView('job-dashboard');
                    setIsMobileSidebarOpen(false);
                  }}
                  title={isJobSidebarCollapsed ? job.title : undefined}
                  className={`w-full text-left p-4 transition-all border-b border-gray-50 group relative ${isJobSidebarCollapsed ? 'px-0 flex justify-center h-16' : ''} ${isActive
                    ? 'bg-blue-50/30 border-l-4 border-l-[#00A1FF]'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                >
                  {isJobSidebarCollapsed ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                      {job.title.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <>
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
                        {isActive && <Check size={10} className="text-blue-500 ml-auto" />}
                      </div>
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex border-t border-gray-100 p-3 bg-gray-50/50 justify-end">
          <button
            onClick={() => setIsJobSidebarCollapsed(!isJobSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
            title={isJobSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isJobSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Profile & Sign Out - Mobile Drawer */}
        <div className="lg:hidden p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
              {api.getUser()?.name?.[0]?.toUpperCase() || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {api.getUser()?.name || 'Recruiter'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold truncate">
                Talent Acquisition
              </p>
            </div>
          </div>
          <button
            onClick={() => { api.logout(); window.location.href = '/sign-up-login-screen'; }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Dashboard Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Navbar Header */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-[#00A1FF] tracking-[.15em] leading-none mb-1">Recruiter</span>
              <span className="text-xs font-bold text-gray-900 leading-none">
                {activeView === 'talent-pool' ? 'Talent Pool' : (selectedJob?.title || 'Dashboard')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm active:scale-95 transition-transform"
            >
              {api.getUser()?.name?.[0]?.toUpperCase() || 'R'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full">
          {/* Main Dashboard View */}
          {activeView === 'job-dashboard' ? (
            <>
              {/* Header Internal - Responsive */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200">
                {selectedJob ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                      Dashboard / {selectedJob.department}
                    </div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{selectedJob.title}</h2>
                      <button
                        onClick={() => setShowEditJob(true)}
                        className="p-1.5 text-gray-400 hover:text-[#00A1FF] hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Job Details"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                      {selectedJob.location} • {selectedJob.type} • <span className="hidden sm:inline">Posted {new Date(selectedJob.postedDate || Date.now()).toLocaleDateString()}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select a Job</h2>
                    <p className="mt-1 text-sm text-gray-500 font-medium italic">No active job selected</p>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
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
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm shrink-0"
                  >
                    <UploadCloud size={16} />
                    <span className="hidden sm:inline">Upload CVs</span>
                    <span className="sm:hidden">Upload</span>
                  </button>
                  {selectedJob && (
                    <button
                      onClick={() => setShowStoredFiles(true)}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm shrink-0"
                    >
                      <FolderOpen size={16} />
                      Stored CVs
                    </button>
                  )}
                  {screeningResults.length > 0 && (
                    <button
                      onClick={() => handleTriggerScreening(true)}
                      disabled={isScreening}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm shrink-0"
                    >
                      <RefreshCw size={16} className={isScreening ? 'animate-spin' : ''} />
                      <span className="hidden sm:inline">Refresh AI</span>
                      <span className="sm:hidden">Refresh</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleTriggerScreening(false)}
                    disabled={isScreening || selectedJob?.status === 'Closed' || !selectedJob}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#00A1FF] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-100 shrink-0"
                  >
                    {isScreening ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span className="hidden sm:inline">Screening...</span>
                        <span className="sm:hidden">Wait...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">{screeningResults.length > 0 ? 'Re-run Screening' : 'Run AI Screening'}</span>
                        <span className="sm:hidden">Run AI</span>
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
                    <SkillMatchChart results={filteredResults} profiles={talentProfiles} job={selectedJob} />
                  </div>
                  <div>
                    <ApplicantBreakdownChart jobTitle={selectedJob.title} results={filteredResults} />
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={12} /> Excel
                      </button>
                      <button onClick={handleExportPdf} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={12} /> PDF
                      </button>
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
                    applications={applications}
                    onUpdateStatus={handleUpdateApplicationStatus}
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

                {applications.length === 0 && !isScreening && (
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
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setActiveView('job-dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 mb-4 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all w-fit"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Users className="text-blue-600" size={28} />
                    Shared Talent Pool
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Manage and browse all talent profiles across your organization
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowUploadResume(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    <Plus size={16} />
                    Add New Talent
                  </button>
                </div>
              </div>

              <TalentPoolTable
                profiles={talentProfiles}
                onViewCandidate={(profile) => {
                  // 1. Try to find if this candidate has a result in the current job context
                  let result = screeningResults.find(r => r.candidateId === profile.id);

                  // 2. If not found in current job, look in any other job screen results we have in Redux
                  if (!result) {
                    for (const jobId in allResults) {
                      const found = allResults[jobId]?.find(r => r.candidateId === profile.id);
                      if (found) {
                        result = found;
                        break;
                      }
                    }
                  }

                  // 3. Fallback to a better dummy if still no result found
                  const finalResult: ScreeningResult = result || {
                    candidateId: profile.id,
                    rank: 0,
                    matchScore: 0,
                    recommendation: 'Awaiting AI Analysis' as any,
                    skillBreakdown: [],
                    strengths: ['Global Talent Profile'],
                    gaps: ['Not evaluated for a specific job yet'],
                    aiReasoning: 'This candidate is part of the global talent pool. Run AI screening for a specific job to see match analytics.',
                    documentStatus: []
                  };

                  setSelectedCandidate({ profile, result: finalResult, fromTalentPool: true });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      {selectedCandidate && (
        <CandidateReasoningDrawer
          profile={selectedCandidate.profile}
          result={selectedCandidate.result}
          application={allApplications.find(a => (a.candidateId?._id || a.candidateId) === selectedCandidate.result.candidateId)}
          onUpdateStatus={(status) => handleUpdateApplicationStatus(selectedCandidate.result.candidateId, status)}
          onClose={() => setSelectedCandidate(null)}
          readOnly={!!selectedCandidate.fromTalentPool}
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
          jobTitle={selectedJob?.title}
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

      {showStoredFiles && selectedJob && (
        <StoredFilesModal
          jobId={(selectedJob as any).id || (selectedJob as any)._id}
          jobTitle={selectedJob.title}
          onClose={() => setShowStoredFiles(false)}
        />
      )}

      {/* Mobile Quick Action - Centered in Bottom Nav for Android/Small Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 flex items-center justify-between z-40">
        <button
          onClick={() => setActiveView('job-dashboard')}
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${activeView === 'job-dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>

        {/* Primary Action: Centered Create Job */}
        <div className="relative -top-5 flex-shrink-0 px-2">
          <button
            onClick={() => setShowCreateJob(true)}
            className="flex items-center justify-center w-14 h-14 bg-[#00A1FF] text-white rounded-full shadow-[0_8px_20px_rgba(0,161,255,0.4)] ring-4 ring-white active:scale-90 transition-all duration-300"
            title="Create New Job"
          >
            <Plus size={28} />
          </button>
        </div>

        <button
          onClick={() => setActiveView('talent-pool')}
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${activeView === 'talent-pool' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Users size={20} />
          <span className="text-[10px] font-bold">Talent Pool</span>
        </button>
      </div>
    </div>
  );
}