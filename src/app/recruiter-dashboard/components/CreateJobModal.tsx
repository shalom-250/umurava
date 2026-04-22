'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, Plus, Loader2, Briefcase, Sparkles, FileUp } from 'lucide-react';
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
});

type FormData = z.infer<typeof schema>;

interface CreateJobModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateJobModal({ onClose, onSuccess }: CreateJobModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Process strings into arrays
      const requirementsArray = data.requirements.split('\n').filter(r => r.trim().length > 0);
      const skillsArray = data.requiredSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const docsArray = data.requiredDocuments ? data.requiredDocuments.split(',').map(d => d.trim()).filter(d => d.length > 0) : [];

      await api.post('/jobs', {
        ...data,
        requirements: requirementsArray,
        skills: skillsArray,
        mustHaveSkills: skillsArray, // Defaulting for now
        requiredDocuments: docsArray,
      });

      toast.success(`Job "${data.title}" created successfully`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      toast.error('Only PDF and Word documents are supported');
      return;
    }

    setIsExtracting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.postForm('/jobs/extract', formData);
      const data = response;

      // Auto-fill form
      if (data.title) setValue('title', data.title);
      if (data.department) setValue('department', data.department);
      if (data.location) setValue('location', data.location);
      if (data.type) setValue('type', data.type);
      if (data.experienceLevel) setValue('experienceLevel', data.experienceLevel);
      if (data.salaryRange) setValue('salaryRange', data.salaryRange);
      if (data.description) setValue('description', data.description);

      if (data.requirements && Array.isArray(data.requirements)) {
        setValue('requirements', data.requirements.join('\n'));
      }

      if (data.skills && Array.isArray(data.skills)) {
        setValue('requiredSkills', data.skills.join(', '));
      }

      if (data.requiredDocuments && Array.isArray(data.requiredDocuments)) {
        setValue('requiredDocuments', data.requiredDocuments.join(', '));
      } else if (data.documents && Array.isArray(data.documents)) {
        // Fallback for AI extraction keys
        setValue('requiredDocuments', data.documents.join(', '));
      }

      if (data.deadline) {
        // Try to format date for input[type="date"]
        try {
          const d = new Date(data.deadline);
          if (!isNaN(d.getTime())) {
            setValue('deadline', d.toISOString().split('T')[0]);
          }
        } catch (e) { }
      }

      toast.success('AI extracted job requirements successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error('AI extraction failed. Please fill manual.');
    } finally {
      setIsExtracting(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-50 rounded-lg">
                <Briefcase size={16} className="text-primary-700" />
              </div>
              <h2 className="text-base font-display font-600 text-foreground">Create New Job</h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {isExtracting ? (
                  <><Loader2 size={12} className="animate-spin" /> Extracting...</>
                ) : (
                  <><Sparkles size={12} /> Auto-fill from Document</>
                )}
              </button>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Job Title</label>
              <input {...register('title')} type="text" placeholder="e.g. Senior AI/ML Engineer" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Department</label>
              <input {...register('department')} type="text" placeholder="e.g. Engineering" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Location</label>
              <input {...register('location')} type="text" placeholder="e.g. Kigali, Rwanda" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Employment Type</label>
              <select {...register('type')} className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 bg-white">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Experience Level</label>
              <select {...register('experienceLevel')} className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 bg-white">
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Salary Range</label>
              <input {...register('salaryRange')} type="text" placeholder="e.g. 800,000 – 1,200,000 RWF/month" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
              {errors.salaryRange && <p className="text-xs text-red-500 mt-1">{errors.salaryRange.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Application Deadline</label>
              <input {...register('deadline')} type="date" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
              {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Job Description</label>
              <p className="text-[11px] text-muted-foreground mb-1">Describe the role, responsibilities, and team context</p>
              <textarea {...register('description')} rows={4} placeholder="Lead the development of AI-powered features for Umurava's talent marketplace..." className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 resize-none" />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Requirements</label>
              <p className="text-[11px] text-muted-foreground mb-1">One requirement per line (e.g. 5+ years ML experience)</p>
              <textarea {...register('requirements')} rows={3} placeholder={"5+ years ML experience\nProduction LLM deployment\nPython & TypeScript"} className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 resize-none font-mono text-xs" />
              {errors.requirements && <p className="text-xs text-red-500 mt-1">{errors.requirements.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Required Skills</label>
              <p className="text-[11px] text-muted-foreground mb-1">Comma-separated (e.g. Python, TensorFlow, Gemini API)</p>
              <input {...register('requiredSkills')} type="text" placeholder="Python, TensorFlow, Gemini API, Node.js, TypeScript" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 font-mono" />
              {errors.requiredSkills && <p className="text-xs text-red-500 mt-1">{errors.requiredSkills.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Required Documents</label>
              <p className="text-[11px] text-muted-foreground mb-1">Comma-separated (e.g. Resume, ID, Degree)</p>
              <input {...register('requiredDocuments')} type="text" placeholder="Resume, Identity Document, Degree Certificate, Portfolio" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 font-mono" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-primary-700 text-white text-sm font-semibold rounded-md hover:bg-primary-800 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px] justify-center"
            >
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Plus size={14} /> Create Job</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}