'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, Save, Loader2, Briefcase, Settings } from 'lucide-react';
import { api } from '@/lib/api';

const schema = z.object({
    title: z.string().min(3, 'Job title is required'),
    department: z.string().min(1, 'Department is required'),
    location: z.string().min(2, 'Location is required'),
    type: z.enum(['Full-time', 'Part-time', 'Contract']),
    experienceLevel: z.enum(['Junior', 'Mid-level', 'Senior', 'Lead']),
    salaryRange: z.string().min(1, 'Salary range is required'),
    deadline: z.string().min(1, 'Deadline is required'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    requirements: z.string().min(10, 'Add at least one requirement'),
    requiredSkills: z.string().min(3, 'Add at least one required skill'),
    requiredDocuments: z.string().optional(),
    status: z.enum(['Active', 'Draft', 'Screening', 'Closed']),
});

type FormData = z.infer<typeof schema>;

interface EditJobModalProps {
    job: any;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function EditJobModal({ job, onClose, onSuccess }: EditJobModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: job?.title || '',
            department: job?.department || '',
            location: job?.location || '',
            type: job?.type || 'Full-time',
            experienceLevel: job?.experienceLevel || 'Junior',
            salaryRange: job?.salaryRange || '',
            deadline: job?.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
            description: job?.description || '',
            requirements: Array.isArray(job?.requirements) ? job.requirements.join('\n') : job?.requirements || '',
            requiredSkills: Array.isArray(job?.skills) ? job.skills.join(', ') : job?.skills || '',
            requiredDocuments: Array.isArray(job?.requiredDocuments) ? job.requiredDocuments.join(', ') : job?.requiredDocuments || '',
            status: job?.status || 'Active',
        }
    });

    const currentStatus = watch('status');

    useEffect(() => {
        if (job) {
            reset({
                title: job.title,
                department: job.department,
                location: job.location,
                type: job.type,
                experienceLevel: job.experienceLevel,
                salaryRange: job.salaryRange,
                deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
                description: job.description,
                requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements,
                requiredSkills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
                requiredDocuments: Array.isArray(job.requiredDocuments) ? job.requiredDocuments.join(', ') : job.requiredDocuments,
                status: job.status,
            });
        }
    }, [job, reset]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const requirementsArray = data.requirements.split('\n').filter(r => r.trim().length > 0);
            const skillsArray = data.requiredSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const docsArray = data.requiredDocuments ? data.requiredDocuments.split(',').map(d => d.trim()).filter(d => d.length > 0) : [];

            const jobId = job._id || job.id;
            await api.put(`/jobs/${jobId}`, {
                ...data,
                requirements: requirementsArray,
                skills: skillsArray,
                mustHaveSkills: skillsArray,
                requiredDocuments: docsArray,
            });

            toast.success(`Job "${data.title}" updated successfully`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fade-in border border-gray-100">
                <div className="sticky top-0 bg-white border-b border-border px-6 py-4 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Settings size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-none">Edit Job Listing</h2>
                            <p className="text-[10px] font-medium text-gray-500 mt-1 uppercase tracking-wider">Update requirements or status</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Job Status</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {['Active', 'Draft', 'Screening', 'Closed'].map((status) => (
                                    <label key={status} className={`
                    flex items-center justify-center py-2.5 border rounded-xl cursor-pointer transition-all text-[11px] font-bold
                    ${currentStatus === status
                                            ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-500/10 text-blue-700'
                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }
                  `}>
                                        <input {...register('status')} type="radio" value={status} className="hidden" />
                                        <span>{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Job Title</label>
                            <input {...register('title')} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            {errors.title && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Department</label>
                            <input {...register('department')} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            {errors.department && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.department.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Location</label>
                            <input {...register('location')} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            {errors.location && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.location.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Employment Type</label>
                            <select {...register('type')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Experience Level</label>
                            <select {...register('experienceLevel')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                <option value="Junior">Junior</option>
                                <option value="Mid-level">Mid-level</option>
                                <option value="Senior">Senior</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Salary Range</label>
                            <input {...register('salaryRange')} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            {errors.salaryRange && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.salaryRange.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Application Deadline</label>
                            <input {...register('deadline')} type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            {errors.deadline && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.deadline.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Job Description</label>
                            <textarea {...register('description')} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
                            {errors.description && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.description.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Requirements (one per line)</label>
                            <textarea {...register('requirements')} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-mono text-xs" />
                            {errors.requirements && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.requirements.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Required Skills (comma separated)</label>
                            <input {...register('requiredSkills')} type="text" placeholder="e.g. Python, TensorFlow, React" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono" />
                            {errors.requiredSkills && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.requiredSkills.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Required Documents (comma separated)</label>
                            <input {...register('requiredDocuments')} type="text" placeholder="e.g. Resume, Degree Certificate, Portfolio" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 bg-[#00A1FF] text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-blue-100"
                        >
                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
