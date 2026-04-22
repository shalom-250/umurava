'use client';
import React, { useState } from 'react';
import { Edit2, Trash2, UserPlus, CheckCircle, Info, Sparkles, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface DraftProfile {
    name: string;
    email: string;
    phone: string;
    skillsRaw: string;
    experience: string;
    source: string;
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

    const startEditing = (idx: number) => {
        setEditingIndex(idx);
        setEditData({ ...profiles[idx] });
    };

    const handleEditChange = (field: keyof DraftProfile, value: string) => {
        if (editData) {
            setEditData({ ...editData, [field]: value });
        }
    };

    const saveEdit = () => {
        if (editingIndex !== null && editData) {
            onUpdate(editingIndex, editData);
            setEditingIndex(null);
            setEditData(null);
            toast.success('Draft updated');
        }
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
                        These profiles were extracted from CVs. Review, edit, and create official records.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onScreenAll}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-50 transition-all shadow-sm"
                    >
                        <Sparkles size={14} />
                        Screen These Drafts
                    </button>
                    <button
                        onClick={onCreateAll}
                        className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-100"
                    >
                        <UserPlus size={14} />
                        Create All Profiles
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/5">Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/5">Contact</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Skills</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Exp Summary</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {profiles.map((profile, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                {editingIndex === idx ? (
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                className="w-full px-2 py-1 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                value={editData?.name || ''}
                                                onChange={e => handleEditChange('name', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <input
                                                    className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded"
                                                    value={editData?.email || ''}
                                                    onChange={e => handleEditChange('email', e.target.value)}
                                                    placeholder="Email"
                                                />
                                                <input
                                                    className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded"
                                                    value={editData?.phone || ''}
                                                    onChange={e => handleEditChange('phone', e.target.value)}
                                                    placeholder="Phone"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <textarea
                                                className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded h-16 resize-none"
                                                value={editData?.skillsRaw || ''}
                                                onChange={e => handleEditChange('skillsRaw', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <textarea
                                                className="w-full px-2 py-1 text-[11px] border border-orange-300 rounded h-16 resize-none"
                                                value={editData?.experience || ''}
                                                onChange={e => handleEditChange('experience', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={() => setEditingIndex(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">{profile.name || <span className="text-gray-300 italic font-medium">null</span>}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">Source: {profile.source}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 font-medium">{profile.email || <span className="text-gray-300 italic">null</span>}</div>
                                            <div className="text-xs text-gray-400">{profile.phone || <span className="text-gray-200 italic font-light">null</span>}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {profile.skillsRaw ? profile.skillsRaw.split(',').slice(0, 5).map((skill, si) => (
                                                    <span key={si} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">
                                                        {skill.trim()}
                                                    </span>
                                                )) : <span className="text-gray-300 italic text-[10px]">No skills found</span>}
                                                {profile.skillsRaw && profile.skillsRaw.split(',').length > 5 && (
                                                    <span className="text-[9px] text-gray-400 font-bold">+{profile.skillsRaw.split(',').length - 5} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 line-clamp-2 font-medium max-w-xs italic">
                                                "{profile.experience || 'No experience summary available'}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(idx)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => onCreateProfile(idx)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Create Profile">
                                                    <UserPlus size={14} />
                                                </button>
                                                <button onClick={() => onRemove(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Remove">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
