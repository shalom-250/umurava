'use client';
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, FileText, AlertCircle, Edit3, ChevronRight, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Status = 'IDLE' | 'UPLOADING' | 'PARSING' | 'REVIEW' | 'SUCCESS';

interface ParsedData {
    name: string;
    email: string;
    phone: string;
    location: string;
    nationality: string | null;
    dob: string | null;
    personalStatement: string | null;
    skills: any[];
    skillsRaw: string;
    experience: any[];
    education: any[];
    certifications: any[];
    projects: any[];
    languages: any[];
    interests: any | null;
    hobbies: string[] | null;
    references: any | null;
    backgroundSchool: any[] | null;
    awards: any[] | null;
    volunteerExperience: any[] | null;
    extracurricularActivities: any[] | null;
    publications: any[] | null;
    onlinePresence: any | null;
    additionalInformation: string | null;
}

interface ResumeUploaderProps {
    onConfirm: (data: ParsedData) => void;
    onCancel: () => void;
}

export default function ResumeUploader({ onConfirm, onCancel }: ResumeUploaderProps) {
    const [status, setStatus] = useState<Status>('IDLE');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (f: File) => {
        const validTypes = [
            'application/pdf',
            'text/csv',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(f.type)) {
            setError('Invalid file format. Please upload a PDF, DOCX, or CSV file.');
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError('File size exceeds the limit. Please upload a file smaller than 5MB.');
            return;
        }
        setFile(f);
        setError(null);
        startUploadFlow(f);
    };

    const startUploadFlow = async (f: File) => {
        setStatus('UPLOADING');
        const formData = new FormData();
        formData.append('file', f);

        try {
            // Simulate/Show uploading state
            await new Promise(r => setTimeout(r, 1500));
            setStatus('PARSING');

            const response = await api.postForm('/candidates/parse', formData);
            const data = response.parsedCandidates[0];

            setParsedData({
                ...data,
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                location: data.location || '',
                skills: Array.isArray(data.skills) ? data.skills : [],
                skillsRaw: data.skillsRaw || (Array.isArray(data.skills) ? data.skills.join(', ') : ''),
                experience: Array.isArray(data.experience) ? data.experience : [],
                education: Array.isArray(data.education) ? data.education : [],
                additionalInformation: data.additionalInformation || null,
            });
            setStatus('REVIEW');
        } catch (err: any) {
            setError(err.message || 'Failed to parse resume');
            setStatus('IDLE');
            toast.error('Parsing failed. Please try again or fill manually.');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    };

    if (status === 'IDLE' || status === 'UPLOADING' || status === 'PARSING') {
        return (
            <div className="bg-white rounded-2xl border border-border shadow-card p-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-display font-700 text-foreground">Upload Your Resume</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            To speed up your application, upload your resume and we’ll automatically extract your details.
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-1 hover:bg-muted rounded-full text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${status === 'IDLE' ? 'border-border hover:border-primary-300 bg-gray-50/30' : 'border-primary-100 bg-primary-50/30'
                        }`}
                >
                    {status === 'IDLE' ? (
                        <>
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload size={24} className="text-primary-700" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">Drag and drop your resume here</p>
                            <p className="text-xs text-muted-foreground mt-1">or <button onClick={() => fileInputRef.current?.click()} className="text-primary-700 font-medium hover:underline">click to browse files</button></p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.csv" />

                            <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1.5"><FileText size={12} /> PDF, DOCX, CSV</span>
                                <span className="flex items-center gap-1.5"><Loader2 size={12} /> Max 5MB</span>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                                <Loader2 size={32} className="text-primary-700 animate-spin" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {status === 'UPLOADING' ? 'Uploading your resume...' : 'Analyzing your resume using AI...'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                                    {status === 'PARSING' ? 'Extracting your professional information...' : 'Preparing your file for analysis...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
                    <div className="text-[11px] leading-relaxed text-muted-foreground">
                        <p className="font-semibold text-foreground mb-1 font-sans">We will extract:</p>
                        <ul className="grid grid-cols-2 gap-x-4">
                            <li>• Full Name</li>
                            <li>• Email Address</li>
                            <li>• Phone Number</li>
                            <li>• Key Skills</li>
                            <li>• Education</li>
                            <li>• Work Experience</li>
                            <li>• Projects & Languages</li>
                            <li>• Interests & Hobbies</li>
                        </ul>
                    </div>
                    <div className="bg-primary-50 rounded-lg p-3 text-[11px] text-primary-700 flex gap-2">
                        <Sparkles size={14} className="shrink-0" />
                        <p><strong>Smart Tip:</strong> Reviewing and correcting extracted info ensures your AI-ranked score is as accurate as possible for recruiter searches.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'REVIEW' && parsedData) {
        return (
            <div className="bg-white rounded-2xl border border-border shadow-card p-8 max-w-4xl mx-auto max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <h2 className="text-xl font-display font-700 text-foreground flex items-center gap-2">
                            <CheckCircle size={22} className="text-green-500" />
                            We’ve extracted your details
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Please review the 17+ categories we found and correct any information.
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin space-y-8 py-2">
                    {/* Basic Info */}
                    <div>
                        <SectionHeader title="1. Personal Information" />
                        <div className="grid grid-cols-2 gap-5">
                            <FieldGroup label="Full Name">
                                <input
                                    type="text"
                                    value={parsedData.name}
                                    onChange={e => setParsedData({ ...parsedData, name: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                />
                            </FieldGroup>
                            <FieldGroup label="Email">
                                <input
                                    type="email"
                                    value={parsedData.email}
                                    onChange={e => setParsedData({ ...parsedData, email: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                />
                            </FieldGroup>
                            <FieldGroup label="Phone Number">
                                <input
                                    type="text"
                                    value={parsedData.phone}
                                    onChange={e => setParsedData({ ...parsedData, phone: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                    placeholder="Missing"
                                />
                            </FieldGroup>
                            <FieldGroup label="Location">
                                <input
                                    type="text"
                                    value={parsedData.location}
                                    onChange={e => setParsedData({ ...parsedData, location: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                    placeholder="Missing"
                                />
                            </FieldGroup>
                            <FieldGroup label="Nationality">
                                <input
                                    type="text"
                                    value={parsedData.nationality || ''}
                                    onChange={e => setParsedData({ ...parsedData, nationality: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                    placeholder="Missing"
                                />
                            </FieldGroup>
                            <FieldGroup label="Date of Birth">
                                <input
                                    type="text"
                                    value={parsedData.dob || ''}
                                    onChange={e => setParsedData({ ...parsedData, dob: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                    placeholder="Missing"
                                />
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Personal Statement */}
                    <div>
                        <SectionHeader title="2. Personal Statement" />
                        <FieldGroup label="About You">
                            <textarea
                                rows={3}
                                value={parsedData.personalStatement || ''}
                                onChange={e => setParsedData({ ...parsedData, personalStatement: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                placeholder={parsedData.personalStatement === null ? 'null' : 'About you...'}
                            />
                        </FieldGroup>
                    </div>

                    {/* Experience & Education */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <SectionHeader title="3. Education" />
                            <div className="space-y-4">
                                {parsedData.education.length > 0 ? parsedData.education.map((edu, i) => (
                                    <div key={i} className="p-3 border border-border rounded-lg bg-gray-50/50">
                                        <p className="text-xs font-bold text-foreground">{edu.degree || edu.qualification || 'Degree'}</p>
                                        <p className="text-[11px] text-muted-foreground">{edu.institution || 'Institution'}</p>
                                    </div>
                                )) : <p className="text-xs text-muted-foreground italic">No education details found</p>}
                            </div>
                        </div>
                        <div>
                            <SectionHeader title="4. Work Experience" />
                            <div className="space-y-4">
                                {parsedData.experience.length > 0 ? parsedData.experience.map((exp, i) => (
                                    <div key={i} className="p-3 border border-border rounded-lg bg-gray-50/50">
                                        <p className="text-xs font-bold text-foreground">{exp.role || exp.jobTitle || 'Role'}</p>
                                        <p className="text-[11px] text-muted-foreground">{exp.company || 'Company'}</p>
                                    </div>
                                )) : <p className="text-xs text-muted-foreground italic">No experience details found</p>}
                            </div>
                        </div>
                    </div>

                    {/* Skills & Other */}
                    <div>
                        <SectionHeader title="5. Skills & Languages" />
                        <div className="grid grid-cols-2 gap-5">
                            <FieldGroup label="Technical & Soft Skills">
                                <input
                                    type="text"
                                    value={parsedData.skillsRaw}
                                    onChange={e => setParsedData({ ...parsedData, skillsRaw: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-700/20 outline-none transition-all"
                                />
                            </FieldGroup>
                            <FieldGroup label="Languages">
                                <p className="text-xs py-2">
                                    {parsedData.languages && parsedData.languages.length > 0
                                        ? parsedData.languages.map((l: any) => `${l.name} (${l.level})`).join(', ')
                                        : <span className="text-red-500 font-bold italic">null</span>}
                                </p>
                            </FieldGroup>
                        </div>
                    </div>

                    {/* Projects, Awards, etc */}
                    <div className="grid grid-cols-3 gap-5">
                        <div>
                            <SectionHeader title="6. Projects" />
                            <p className="text-xs">
                                {parsedData.projects && parsedData.projects.length > 0
                                    ? `${parsedData.projects.length} project(s) found`
                                    : <span className="text-red-500 font-bold italic">null</span>}
                            </p>
                        </div>
                        <div>
                            <SectionHeader title="7. Awards" />
                            <p className="text-xs">
                                {parsedData.awards && parsedData.awards.length > 0
                                    ? `${parsedData.awards.length} award(s) found`
                                    : <span className="text-red-500 font-bold italic">null</span>}
                            </p>
                        </div>
                        <div>
                            <SectionHeader title="8. Social Presence" />
                            <div className="space-y-1">
                                {parsedData.onlinePresence ? Object.entries(parsedData.onlinePresence).map(([k, v]) => (
                                    v ? <p key={k} className="text-[10px] text-primary-700 underline truncate">{v as string}</p> : null
                                )) : <span className="text-red-500 font-bold italic">null</span>}
                            </div>
                        </div>
                    </div>

                    {/* Additional Dynamic Information */}
                    {parsedData.additionalInformation && (
                        <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                            <SectionHeader title="9. Additional Dynamic Details" />
                            <textarea
                                rows={4}
                                value={parsedData.additionalInformation}
                                onChange={e => setParsedData({ ...parsedData, additionalInformation: e.target.value })}
                                className="w-full bg-transparent text-sm text-primary-900 leading-relaxed outline-none border-none resize-none"
                                placeholder="Any other details extracted from the doc..."
                            />
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between shrink-0">
                    <button
                        onClick={() => setStatus('IDLE')}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                    >
                        <RotateCcw size={14} /> Not correct? Upload different resume
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(parsedData)}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-lg hover:bg-primary-800 transition-all shadow-md transform active:scale-95"
                        >
                            Confirm & Sync Profile <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground mt-4">
                    By continuing, all 17+ categories will be synchronized with your professional profile.
                </p>
            </div>
        );
    }

    return null;
}

function SectionHeader({ title }: { title: string }) {
    return (
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">{title}</h3>
    );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-tight pl-1">{label}</label>
            {children}
        </div>
    );
}

function Sparkles({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
