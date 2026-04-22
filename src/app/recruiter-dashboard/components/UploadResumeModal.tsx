'use client';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { X, UploadCloud, Loader2, FileText, CheckCircle2, AlertCircle, Save, Plus } from 'lucide-react';
import { api } from '@/lib/api';

interface UploadResumeModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    onExtracted?: (candidates: any[]) => void;
    jobTitle?: string;
}

export default function UploadResumeModal({ onClose, onSuccess, onExtracted, jobTitle }: UploadResumeModalProps) {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(Array.from(e.target.files));
        }
    };

    const handleFileSelection = (files: File[]) => {
        const validTypes = ['application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const newFiles = files.filter(file => {
            const isValid = validTypes.includes(file.type) || file.name.match(/\.(csv|pdf|doc|docx)$/i);
            if (!isValid) toast.error(`File ${file.name} is not supported.`);
            return isValid;
        });

        if (newFiles.length === 0) return;

        setSelectedFiles(prev => [...prev, ...newFiles]);
        setUploadStatus('idle');
        setErrorMessage('');
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadAndParse = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadStatus('uploading');

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const url = jobTitle ? `/candidates/parse?jobTitle=${encodeURIComponent(jobTitle)}` : '/candidates/parse';
            const res = await api.postForm(url, formData);
            if (res.parsedCandidates && res.parsedCandidates.length > 0) {
                const candidates = res.parsedCandidates.map((c: any) => ({
                    ...c,
                    // skillsRaw is used for the mini-preview and early validation
                    skillsRaw: Array.isArray(c.skills)
                        ? c.skills.map((s: any) => typeof s === 'string' ? s : s.name).join(', ')
                        : (c.skillsRaw || ''),
                    // Prepare experience and education text for the preview textareas
                    experienceText: Array.isArray(c.experience)
                        ? c.experience.map((e: any) => `${e.role} at ${e.company}`).join('; ')
                        : (typeof c.experience === 'string' ? c.experience : ''),
                    educationText: Array.isArray(c.education)
                        ? c.education.map((e: any) => `${e.degree} from ${e.institution}`).join('; ')
                        : (typeof c.education === 'string' ? c.education : '')
                }));
                setParsedCandidates(candidates);
                setStep('preview');
                setUploadStatus('success');
                toast.success(`Successfully extracted ${candidates.length} candidate(s)`);
            } else {
                setUploadStatus('error');
                setErrorMessage('No valid data extracted from files.');
            }
        } catch (error: any) {
            setUploadStatus('error');
            setErrorMessage(error.message || 'Failed to extract data');
            toast.error('Extraction failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFieldChange = (index: number, field: string, value: string) => {
        const updated = [...parsedCandidates];
        updated[index][field] = value;
        setParsedCandidates(updated);
    };

    const handleFinishAndShowInTable = () => {
        if (onExtracted) {
            onExtracted(parsedCandidates);
            onClose();
        } else {
            handleSaveToDatabase();
        }
    };

    const handleSaveToDatabase = async () => {
        setIsSaving(true);
        const finalPayload = parsedCandidates.map(c => {
            const nameParts = (c.name || '').split(' ');
            return {
                ...c,
                firstName: c.name ? nameParts[0] : (c.firstName || 'Candidate'),
                lastName: c.name ? nameParts.slice(1).join(' ') : (c.lastName || ''),
                // Use structured data if it exists, otherwise fallback to raw parsing
                skills: Array.isArray(c.skills) && c.skills.length > 0
                    ? c.skills
                    : (c.skillsRaw ? c.skillsRaw.split(',').map((s: string) => ({ name: s.trim(), level: 'Intermediate', yearsOfExperience: 1 })).filter((s: any) => s.name.length > 0) : []),
                experience: Array.isArray(c.experience) && c.experience.length > 0
                    ? c.experience
                    : (c.experienceText ? [{ company: 'Previous', role: 'Role', description: c.experienceText, startDate: '', endDate: '', isCurrent: false, technologies: [] }] : []),
                education: Array.isArray(c.education) && c.education.length > 0
                    ? c.education
                    : (c.educationText ? [{ institution: 'University', degree: c.educationText, fieldOfStudy: '', startYear: 2020, endYear: 2024 }] : [])
            };
        });

        try {
            await api.post('/candidates', { candidates: finalPayload });
            toast.success(`Successfully saved candidates to Database!`);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1000);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to save candidates.');
            setIsSaving(false);
        }
    };

    const onButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in text-gray-900 leading-normal">
                <div className="bg-white border-b border-border px-6 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 flex items-center justify-center rounded-lg">
                                {step === 'upload' ? <UploadCloud size={18} className="text-[#00A1FF]" /> : <CheckCircle2 size={18} className="text-green-500" />}
                            </div>
                            <h2 className="text-base font-600 text-foreground">
                                {step === 'upload' ? `Upload Candidates (${selectedFiles.length})` : 'Preview & Validation'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
                    {step === 'upload' ? (
                        <>
                            <p className="text-sm text-gray-500 font-medium">
                                Upload up to 100 candidate resumes. We support PDF, DOCX, and CSV. Our AI will extract structured data from each file.
                            </p>

                            <div
                                className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${dragActive ? 'border-[#00A1FF] bg-blue-50/50' : 'border-gray-300 hover:border-[#00A1FF] hover:bg-gray-50'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={onButtonClick}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.csv,.doc,.docx"
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <UploadCloud size={40} className={`mb-4 ${dragActive ? 'text-[#00A1FF]' : 'text-gray-400'}`} />
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Click to upload or drag and drop</h3>
                                <p className="text-xs text-gray-500 font-medium">PDF, DOCX or CSV files (Bulk supported)</p>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="text-xs font-bold text-gray-900 truncate">{file.name}</h4>
                                                    <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            {!isUploading && (
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100 text-red-600 text-xs font-medium">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p>{errorMessage}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                                <CheckCircle2 size={18} className="text-green-600" />
                                We found {parsedCandidates.length} potential profiles. You can review and edit them here, or move them to the dashboard table for mass cleaning.
                            </div>

                            <div className="space-y-4">
                                {parsedCandidates.map((c, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00A1FF]"></div>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-sm font-bold text-gray-800 ml-2">
                                                {c.name ? c.name : `Candidate #${idx + 1}`}
                                            </h4>
                                            <button
                                                onClick={() => setParsedCandidates(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 ml-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                                                <input
                                                    value={c.name || ''}
                                                    onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                                    placeholder={c.name === null ? "null" : ""}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                                                <input
                                                    value={c.email || ''}
                                                    onChange={e => handleFieldChange(idx, 'email', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                                    placeholder={c.email === null ? "null" : ""}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                                                <input
                                                    value={c.phone || ''}
                                                    onChange={e => handleFieldChange(idx, 'phone', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                                    placeholder={c.phone === null ? "null" : ""}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Skills (Comma separated)</label>
                                                <input value={c.skillsRaw || ''} onChange={e => handleFieldChange(idx, 'skillsRaw', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Experience Summary</label>
                                                <textarea
                                                    value={c.experienceText || ''}
                                                    onChange={e => handleFieldChange(idx, 'experienceText', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none text-gray-600"
                                                    placeholder={c.experience === null ? "null" : ""}
                                                />
                                            </div>
                                            {c.additionalInformation && (
                                                <div className="col-span-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                                    <label className="block text-[10px] font-bold text-orange-600 uppercase tracking-wide mb-1">Extra Details Extracted</label>
                                                    <p className="text-[11px] text-orange-800 leading-tight">{c.additionalInformation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 border-t border-border px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={isUploading || isSaving} className="px-5 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 bg-white">
                        Cancel
                    </button>
                    {step === 'upload' ? (
                        <button
                            onClick={handleUploadAndParse}
                            disabled={selectedFiles.length === 0 || isUploading}
                            className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-sm ${selectedFiles.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isUploading
                                    ? 'bg-[#00A1FF]/80 cursor-wait'
                                    : 'bg-[#00A1FF] hover:bg-blue-600 active:scale-95'
                                }`}
                        >
                            {isUploading ? (
                                <><Loader2 size={16} className="animate-spin" /> Extracting {selectedFiles.length} CVs...</>
                            ) : (
                                <><FileText size={16} /> Continue to Preview</>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleFinishAndShowInTable}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-sm bg-[#00A1FF] hover:bg-blue-600 active:scale-95 ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {isSaving ? (
                                <><Loader2 size={16} className="animate-spin" /> saving...</>
                            ) : (
                                <><CheckCircle2 size={16} /> Move to Dashboard Table</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
