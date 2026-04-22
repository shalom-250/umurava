'use client';
import React from 'react';
import { TalentProfile, ScreeningResult, recommendationColors } from '@/lib/mockData';
import { X, MapPin, ExternalLink, CheckCircle, AlertTriangle, Star, Globe, Award, Download } from 'lucide-react';

interface CandidateReasoningDrawerProps {
  profile: TalentProfile;
  result: ScreeningResult;
  application?: any;
  onUpdateStatus?: (status: string) => void;
  onClose: () => void;
}

const skillLevelColors: Record<string, string> = {
  Expert: 'bg-green-100 text-green-700',
  Advanced: 'bg-blue-100 text-blue-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Beginner: 'bg-red-100 text-red-700',
};

export default function CandidateReasoningDrawer({ profile, result, application, onUpdateStatus, onClose }: CandidateReasoningDrawerProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
  const currentRole = profile.experience.find(e => e.isCurrent);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-modal overflow-y-auto scrollbar-thin animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">{initials}</span>
              </div>
              <div>
                <p className="font-display font-600 text-foreground">{profile.firstName} {profile.lastName}</p>
                <p className="text-xs text-muted-foreground">{currentRole?.role} · {currentRole?.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Rank + Score */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-primary-50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Rank</p>
              <p className="text-3xl font-display font-700 text-primary-700">#{result.rank}</p>
            </div>
            <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Match Score</p>
              <p className="text-3xl font-display font-700 text-green-700">{result.matchScore}<span className="text-base font-normal">/100</span></p>
            </div>
            <div className="flex-1 rounded-lg p-4 text-center border border-border">
              <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${recommendationColors[result.recommendation]}`}>
                {result.recommendation}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin size={11} /> {profile.location}</span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${profile.availability.status === 'Available' ? 'bg-green-50 text-green-700' :
              profile.availability.status === 'Open to Opportunities' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
              }`}>{profile.availability.status} · {profile.availability.type}</span>
            {profile.availability.startDate && <span>From {profile.availability.startDate}</span>}
          </div>

          {/* AI Reasoning */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-blue-600" />
              <p className="text-xs font-semibold text-blue-800">AI Reasoning — Gemini</p>
            </div>
            <p className="text-sm text-blue-900 leading-relaxed">{result.aiReasoning}</p>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle size={13} className="text-green-600" />
                <p className="text-xs font-semibold text-green-700">Strengths</p>
              </div>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={`str-${i}`} className="text-xs text-foreground bg-green-50 rounded-md px-2.5 py-1.5 border border-green-100">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-amber-600" />
                <p className="text-xs font-semibold text-amber-700">Gaps / Risks</p>
              </div>
              <ul className="space-y-1.5">
                {result.gaps.map((g, i) => (
                  <li key={`gap-${i}`} className="text-xs text-foreground bg-amber-50 rounded-md px-2.5 py-1.5 border border-amber-100">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Document Checklist */}
          {result.documentStatus && result.documentStatus.length > 0 && (
            <div className="bg-gray-50 border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                Document Checklist
                {result.documentStatus.filter(d => d.status === 'missing').length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                    {result.documentStatus.filter(d => d.status === 'missing').length} Missing
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.documentStatus.map((doc, idx) => (
                  <div
                    key={`doc-${idx}`}
                    className={`flex items-center justify-between p-2 rounded-md border text-xs gap-3 ${doc.status === 'completed' ? 'bg-white border-green-100' : 'bg-amber-50/50 border-amber-100'
                      }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {doc.status === 'completed' ? (
                        <CheckCircle size={12} className="text-green-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                      )}
                      <span className={`truncate ${doc.status === 'missing' ? 'font-medium text-amber-800' : 'text-foreground'}`}>
                        {doc.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase ${doc.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Breakdown */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Skill-by-Skill Score</p>
            <div className="space-y-2.5">
              {result.skillBreakdown.map(sb => (
                <div key={`sb-${sb.skill}`} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <p className="text-xs text-foreground font-medium">{sb.skill}</p>
                    {sb.required && <p className="text-[9px] text-primary-600 font-medium">Required</p>}
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${sb.score >= 80 ? 'bg-green-500' : sb.score >= 60 ? 'bg-blue-500' : sb.score >= 40 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                      style={{ width: `${sb.score}%` }}
                    />
                  </div>
                  <span className="font-mono-data text-xs font-semibold w-8 text-right">{sb.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Skills */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">All Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map(skill => (
                <span key={`pskill-${skill.name}`} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${skillLevelColors[skill.level]}`}>
                  {skill.name} · {skill.level}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Experience</p>
            <div className="space-y-3">
              {profile.experience.map((exp, i) => (
                <div key={`exp-${i}`} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-700 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{exp.role}</p>
                    <p className="text-xs text-muted-foreground">{exp.company} · {exp.startDate} – {exp.endDate}</p>
                    <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">{exp.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exp.technologies.map(tech => (
                        <span key={`tech-${tech}`} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Certifications</p>
              <div className="space-y-1.5">
                {profile.certifications.map((cert, i) => (
                  <div key={`cert-${i}`} className="flex items-center gap-2 text-xs">
                    <Award size={11} className="text-primary-600 shrink-0" />
                    <span className="font-medium text-foreground">{cert.name}</span>
                    <span className="text-muted-foreground">· {cert.issuer} · {cert.issueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && (
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              {profile.socialLinks.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                  <ExternalLink size={11} /> LinkedIn
                </a>
              )}
              {profile.socialLinks.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-foreground hover:underline">
                  <ExternalLink size={11} /> GitHub
                </a>
              )}
              {profile.socialLinks.portfolio && (
                <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-accent-500 hover:underline">
                  <Globe size={11} /> Portfolio
                </a>
              )}
            </div>
          )}

          {/* Documents Section */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              Uploaded Documents
            </p>
            <div className="space-y-2">
              {/* Primary Resume */}
              {profile.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                      <Download size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Main Resume / CV</p>
                      <p className="text-[10px] text-gray-500">PDF Document • Primary</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500" />
                </a>
              ) : null}

              {/* Other application attachments */}
              {application?.attachments?.map((file: any, idx: number) => (
                <a
                  key={`att-${idx}`}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 text-gray-600 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Download size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{file.name || `Attachment ${idx + 1}`}</p>
                      <p className="text-[10px] text-gray-500">Document File</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500" />
                </a>
              ))}

              {!profile.resumeUrl && (!application?.attachments || application.attachments.length === 0) && (
                <div className="p-3 bg-gray-100/50 rounded-lg border border-dashed border-gray-300 text-center">
                  <p className="text-[10px] text-gray-500 italic">No files attached to this application</p>
                </div>
              )}
            </div>
          </div>

          {/* Recruitment Actions */}
          <div className="pt-6 border-t border-border space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Recruitment Actions</p>

            {result.matchScore >= 70 ? (
              <>
                {/* Score >= 70: Multi-stage path */}
                <div className="flex gap-3">
                  {application?.status !== 'Interview' && application?.status !== 'Hired' && (
                    <button
                      onClick={() => onUpdateStatus?.('Interview')}
                      className="flex-1 px-4 py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-sm"
                    >
                      Shortlist for Interview
                    </button>
                  )}

                  {application?.status !== 'Hired' ? (
                    <button
                      onClick={() => onUpdateStatus?.('Hired')}
                      className={`flex-1 px-4 py-2.5 bg-[#00A1FF] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100 ${application?.status === 'Interview' ? 'w-full' : ''
                        }`}
                    >
                      Hire this Candidate
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                      <CheckCircle size={16} />
                      Candidate Hired
                    </div>
                  )}
                </div>

                {application?.status !== 'Hired' && (
                  <button
                    onClick={() => onUpdateStatus?.('Rejected')}
                    className="w-full px-4 py-2 text-gray-500 text-xs font-medium hover:text-red-500 transition-all"
                  >
                    Mark as Not Interested
                  </button>
                )}
              </>
            ) : (
              /* Score < 70: Only Reject path */
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-center">
                  <p className="text-[11px] text-amber-700 leading-tight">
                    AI recommendation is below the target threshold for this role.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateStatus?.('Rejected')}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                >
                  Reject Candidate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}