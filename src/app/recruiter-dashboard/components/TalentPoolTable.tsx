'use client';
import React, { useState, useMemo } from 'react';
import { TalentProfile } from '@/lib/mockData';
import {
    Search,
    Filter,
    User,
    MapPin,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Eye,
    Download,
    Globe,
    MoreHorizontal
} from 'lucide-react';

interface TalentPoolTableProps {
    profiles: TalentProfile[];
    onViewCandidate: (profile: TalentProfile) => void;
}

const PAGE_SIZE = 10;

export default function TalentPoolTable({ profiles, onViewCandidate }: TalentPoolTableProps) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [locationFilter, setLocationFilter] = useState('All');

    // Filter logic
    const filtered = useMemo(() => {
        return profiles.filter(p => {
            const matchesSearch =
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase()) ||
                p.skills.some(s => s.name.toLowerCase().includes(search.toLowerCase()));

            const matchesLocation = locationFilter === 'All' || p.location === locationFilter;

            return matchesSearch && matchesLocation;
        });
    }, [profiles, search, locationFilter]);

    // Locations for filter
    const locations = useMemo(() => {
        const locs = new Set(profiles.map(p => p.location));
        return ['All', ...Array.from(locs)].filter(Boolean);
    }, [profiles]);

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or skills..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={locationFilter}
                            onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 border-l border-gray-200">
                        {filtered.length} Profiles Found
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Headline & Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Skills</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                <User size={24} className="text-gray-300" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">No profiles found</p>
                                            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((profile) => (
                                    <tr
                                        key={profile.id}
                                        className="hover:bg-blue-50/20 transition-colors group cursor-pointer"
                                        onClick={() => onViewCandidate(profile)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm shadow-sm ring-2 ring-white">
                                                    {profile.firstName[0]}{profile.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {profile.firstName} {profile.lastName}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 font-medium">{profile.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                                                    <Briefcase size={12} className="text-gray-400" />
                                                    {profile.headline}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                                    <MapPin size={11} />
                                                    {profile.location}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                {profile.skills.slice(0, 3).map((s, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">
                                                        {s.name}
                                                    </span>
                                                ))}
                                                {profile.skills.length > 3 && (
                                                    <span className="text-[9px] font-bold text-gray-400">+{profile.skills.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-bold text-gray-700">
                                                {profile.experience?.[0]?.company || 'Active'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                                {profile.experience?.[0]?.role || 'Professional'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onViewCandidate(profile); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                    title="View Full Profile"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {profile.resumeUrl && (
                                                    <a
                                                        href={profile.resumeUrl}
                                                        download
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-100"
                                                        title="Download CV"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                )}
                                                <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-900">{((currentPage - 1) * PAGE_SIZE) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of {filtered.length} candidates
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                            : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
