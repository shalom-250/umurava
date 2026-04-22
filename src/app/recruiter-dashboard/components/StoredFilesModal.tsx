'use client';
import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '@/lib/api';
import { X, FileText, Download, ExternalLink, Loader2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface JobFile {
    name: string;
    path: string;
    size: number;
    createdAt: string;
}

interface StoredFilesModalProps {
    jobId: string;
    jobTitle: string;
    onClose: () => void;
}

export default function StoredFilesModal({ jobId, jobTitle, onClose }: StoredFilesModalProps) {
    const [files, setFiles] = useState<JobFile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/jobs/${jobId}/files`);
            setFiles(data || []);
        } catch (err) {
            toast.error('Failed to load stored files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jobId) fetchFiles();
    }, [jobId]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FolderOpen size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Stored CVs for {jobTitle}</h3>
                            <p className="text-xs text-gray-500 font-medium">{files.length} documents organized by job</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                            <p className="text-sm font-medium">Fetching organized CVs...</p>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <FileText size={32} className="text-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">No stored CVs yet</p>
                                <p className="text-xs text-gray-500 max-w-[240px] mt-1 mx-auto">
                                    Resumes uploaded for this job or applied by candidates will automatically appear here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {files.map((file, idx) => (
                                <div key={idx} className="group p-4 border border-gray-100 rounded-xl bg-white hover:border-blue-200 hover:shadow-sm transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50">
                                            <FileText size={20} className="text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{file.name}</p>
                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500 font-medium">
                                                <span>{formatSize(file.size)}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>Added {new Date(file.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${file.path}`, '_blank')}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="View CV"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <a
                                            href={`${API_BASE_URL.replace('/api', '')}/${file.path}`}
                                            download={file.name}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Download CV"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
