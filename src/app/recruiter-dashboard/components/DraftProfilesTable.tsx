'use client';
import React, { useState } from 'react';
import { Edit2, Trash2, UserPlus, Info, Sparkles, X, Save, ChevronDown, ChevronUp, MapPin, Calendar, Globe, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface DraftProfile {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    nationality?: string | null;
    dob?: string | null;
    personalStatement?: string | null;
    skillsRaw?: string | null;
    experience?: any[] | string | null;
    education?: any[] | string | null;
    source: string;
    // Extended fields
    socialLinks?: {
        linkedin?: string | null;
        github?: string | null;
        portfolio?: string | null;
        website?: string | null;
    } | null;
    skills?: any[] | null;
    certifications?: any[] | null;
    projects?: any[] | null;
    languages?: any[] | null;
    interests?: { professional: string[], personal: string[] } | null;
    hobbies?: string[] | null;
    references?: any[] | string | null;
    backgroundSchool?: any[] | null;
    awards?: any[] | null;
    volunteerExperience?: any[] | null;
    extracurricularActivities?: any[] | null;
    publications?: any[] | null;
    additionalInformation?: string | null;
}

interface DraftProfilesTableProps {
    profiles: DraftProfile[];
    onUpdate: (index: number, profile: DraftProfile) => void;
    onRemove: (index: number) => void;
    onCreateProfile: (index: number) => void;
    onCreateAll: () => void;
    onScreenAll: () => void;
}

export default function DraftProfilesTable({
    profiles,
    onUpdate,
    onRemove,
    onCreateProfile,
    onCreateAll,
    onScreenAll
}: DraftProfilesTableProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editData, setEditData] = useState<DraftProfile | null>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const startEditing = (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        setEditingIndex(idx);
        setEditData({ ...profiles[idx] });
    };

    const handleEditChange = (field: keyof DraftProfile, value: any) => {
        if (editData) {
            setEditData({ ...editData, [field]: value });
        }
    };

    const saveEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingIndex !== null && editData) {
            onUpdate(editingIndex, editData);
            setEditingIndex(null);
            setEditData(null);
            toast.success('Draft updated');
        }
    };

    const toggleExpand = (idx: number) => {
        setExpandedIndex(expandedIndex === idx ? null : idx);
    };

    const renderValue = (val: any) => {
        if (val === null || val === undefined || val === '') return <span className="text-gray-300 italic font-medium">null</span>;
        return val;
    };

    if (profiles.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="px-6 py-5 border-b border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-orange-50/30">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">Recently Extracted Profiles</h3>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {profiles.length} Drafts
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1 inline-flex items-center gap-1">
                        <Info size={12} className="text-orange-400" />
                        AI extracted {profiles.length} profiles. Fields not found are set to <span className="text-orange-600 font-bold italic">null</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onScreenAll}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 border border-blue-500/20 group"
                    >
                        <Sparkles size={16} className="group-hover:animate-pulse" />
                        Screen These Drafts
                    </button>
                    <button
                        onClick={onCreateAll}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-100 border border-orange-400/20 group"
                    >
                        <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                        Create All Profiles
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="w-10 px-6 py-4"></th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact & Location</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nationality / DOB</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {profiles.map((profile, idx) => (
                            <React.Fragment key={idx}>
                                <tr
                                    className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${expandedIndex === idx ? 'bg-orange-50/10' : ''}`}
                                    onClick={() => toggleExpand(idx)}
                                >
                                    <td className="px-6 py-4">
                                        {expandedIndex === idx ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                    </td>
                                    {editingIndex === idx ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <input
                                                    className="w-full px-2 py-1 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                    value={editData?.name || ''}
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => handleEditChange('name', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <input
                                                        className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded"
                                                        value={editData?.email || ''}
                                                        onClick={e => e.stopPropagation()}
                                                        onChange={e => handleEditChange('email', e.target.value)}
                                                        placeholder="Email"
                                                    />
                                                    <input
                                                        className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded"
                                                        value={editData?.location || ''}
                                                        onClick={e => e.stopPropagation()}
                                                        onChange={e => handleEditChange('location', e.target.value)}
                                                        placeholder="Location"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <input
                                                        className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded"
                                                        value={editData?.nationality || ''}
                                                        onClick={e => e.stopPropagation()}
                                                        onChange={e => handleEditChange('nationality', e.target.value)}
                                                        placeholder="Nationality"
                                                    />
                                                    <input
                                                        className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded"
                                                        value={editData?.dob || ''}
                                                        onClick={e => e.stopPropagation()}
                                                        onChange={e => handleEditChange('dob', e.target.value)}
                                                        placeholder="Date of Birth"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                                                        <Save size={16} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingIndex(null); }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-sm">{renderValue(profile.name)}</div>
                                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Source: {profile.source}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-600 font-medium">{renderValue(profile.email)}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {renderValue(profile.location)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                                                    <Globe size={12} className="text-gray-400" />
                                                    {renderValue(profile.nationality)}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar size={12} className="text-gray-300" />
                                                    {renderValue(profile.dob)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 p-1">
                                                    <button
                                                        onClick={(e) => startEditing(e, idx)}
                                                        className="p-2 text-blue-700 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-200 shadow-sm group/btn"
                                                        title="Edit Basic Info"
                                                    >
                                                        <Edit2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onCreateProfile(idx); }}
                                                        className="p-2 text-orange-700 bg-orange-50/50 hover:bg-orange-600 hover:text-white rounded-lg transition-all border border-orange-200 shadow-sm group/btn"
                                                        title="Confirm & Create"
                                                    >
                                                        <UserPlus size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                                                        className="p-2 text-red-700 bg-red-50/50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-200 shadow-sm group/btn"
                                                        title="Remove Draft"
                                                    >
                                                        <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                                {expandedIndex === idx && (
                                    <tr>
                                        <td colSpan={5} className="px-12 py-6 bg-gray-50/50 border-y border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Info size={12} className="text-blue-400" />
                                                            Personal Statement
                                                        </h4>
                                                        <p className="text-xs text-gray-600 leading-relaxed italic">
                                                            {renderValue(profile.personalStatement)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-poppins">Social Presence</h4>
                                                        <div className="flex items-center gap-3">
                                                            {profile.socialLinks?.linkedin ? <Globe size={14} className="text-blue-600" /> : <Globe size={14} className="text-gray-200" />}
                                                            {profile.socialLinks?.github ? <Globe size={14} className="text-gray-900" /> : <Globe size={14} className="text-gray-200" />}
                                                            {profile.socialLinks?.website ? <Globe size={14} className="text-green-600" /> : <Globe size={14} className="text-gray-200" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Extracted Experience</h4>
                                                        <div className="space-y-2">
                                                            {Array.isArray(profile.experience) ? profile.experience.slice(0, 2).map((exp, ei) => (
                                                                <div key={ei} className="border-l-2 border-orange-200 pl-3">
                                                                    <div className="text-xs font-bold text-gray-800">{exp.role || exp.jobTitle} @ {exp.company}</div>
                                                                    <div className="text-[10px] text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</div>
                                                                </div>
                                                            )) : <div className="text-xs text-gray-400 italic">No structured data found</div>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tech Stack</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {Array.isArray(profile.skills) ? profile.skills.map((s, si) => (
                                                                <span key={si} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${s.type === 'Soft' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                    {s.name}
                                                                </span>
                                                            )) : renderValue(null)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Additional Sections</h4>
                                                        <div className="text-[10px] space-y-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Certifications:</span>
                                                                <span className="font-bold">{profile.certifications?.length || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Projects:</span>
                                                                <span className="font-bold">{profile.projects?.length || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Awards:</span>
                                                                <span className="font-bold">{profile.awards?.length || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Publications:</span>
                                                                <span className="font-bold">{profile.publications?.length || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Volunteering:</span>
                                                                <span className="font-bold">{profile.volunteerExperience?.length || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">References:</span>
                                                                <span className="font-bold">{(() => {
                                                                    const refs = profile.references;
                                                                    if (Array.isArray(refs)) return refs.length;
                                                                    if (typeof refs === 'string' && refs.toLowerCase().includes('request')) return 1;
                                                                    return 0;
                                                                })()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Captured Information (Dynamic Extraction) */}
                                            {profile.additionalInformation && (
                                                <div className="mt-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100 animate-in fade-in zoom-in-95 duration-300">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={14} className="text-orange-500" />
                                                        <h4 className="text-xs font-bold text-orange-900 uppercase tracking-tight">Extra Details Extracted (Dynamic)</h4>
                                                    </div>
                                                    <p className="text-xs text-orange-800 whitespace-pre-wrap leading-relaxed font-medium">
                                                        {profile.additionalInformation}
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
