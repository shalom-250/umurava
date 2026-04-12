'use client';
import React, { useState } from 'react';



import { toast } from 'sonner';
import { TalentProfile } from '@/lib/mockData';
import {
  User, Briefcase, GraduationCap, Award, FolderOpen, Clock,
  Link, Plus, Trash2, Loader2, CheckCircle, Save, Upload
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type ProfileSection = 'basic' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'availability' | 'social';

const SECTIONS: { id: ProfileSection; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'skills', label: 'Skills & Languages', icon: Award },
  { id: 'experience', label: 'Work Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'social', label: 'Social Links', icon: Link },
];

interface ProfileBuilderTabProps {
  profile: TalentProfile;
}

export default function ProfileBuilderTab({ profile }: ProfileBuilderTabProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>('basic');
  const [savingSection, setSavingSection] = useState<ProfileSection | null>(null);
  const [savedSections, setSavedSections] = useState<Set<ProfileSection>>(new Set(['basic', 'skills', 'experience', 'education', 'certifications', 'projects', 'availability']));

  const completionBySection: Record<ProfileSection, number> = {
    basic: 100, skills: 100, experience: 100, education: 100,
    certifications: 100, projects: 100, availability: 100, social: 80,
  };

  const handleSaveSection = async (section: ProfileSection) => {
    setSavingSection(section);
    // Backend integration point: PATCH /api/talent-profile/:id { section: data }
    await new Promise(r => setTimeout(r, 900));
    setSavingSection(null);
    setSavedSections(prev => new Set([...prev, section]));
    toast.success(`${SECTIONS.find(s => s.id === section)?.label} saved successfully`);
  };

  return (
    <div className="flex gap-6">
      {/* Section Nav */}
      <div className="w-52 shrink-0">
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground">Profile Sections</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary-700 rounded-full" style={{ width: `${profile.profileCompleteness}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{profile.profileCompleteness}% complete</p>
          </div>
          <div className="py-1">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isSaved = savedSections.has(section.id);
              const pct = completionBySection[section.id];
              return (
                <button
                  key={`psec-${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={14} />
                  <span className="flex-1 text-left text-xs font-medium">{section.label}</span>
                  {isSaved && pct === 100
                    ? <CheckCircle size={12} className="text-green-500 shrink-0" />
                    : <span className="text-[9px] font-semibold text-muted-foreground">{pct}%</span>
                  }
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 min-w-0">
        {activeSection === 'basic' && (
          <BasicInfoSection profile={profile} onSave={() => handleSaveSection('basic')} saving={savingSection === 'basic'} />
        )}
        {activeSection === 'skills' && (
          <SkillsSection profile={profile} onSave={() => handleSaveSection('skills')} saving={savingSection === 'skills'} />
        )}
        {activeSection === 'experience' && (
          <ExperienceSection profile={profile} onSave={() => handleSaveSection('experience')} saving={savingSection === 'experience'} />
        )}
        {activeSection === 'education' && (
          <EducationSection profile={profile} onSave={() => handleSaveSection('education')} saving={savingSection === 'education'} />
        )}
        {activeSection === 'certifications' && (
          <CertificationsSection profile={profile} onSave={() => handleSaveSection('certifications')} saving={savingSection === 'certifications'} />
        )}
        {activeSection === 'projects' && (
          <ProjectsSection profile={profile} onSave={() => handleSaveSection('projects')} saving={savingSection === 'projects'} />
        )}
        {activeSection === 'availability' && (
          <AvailabilitySection profile={profile} onSave={() => handleSaveSection('availability')} saving={savingSection === 'availability'} />
        )}
        {activeSection === 'social' && (
          <SocialLinksSection profile={profile} onSave={() => handleSaveSection('social')} saving={savingSection === 'social'} />
        )}
      </div>
    </div>
  );
}

// ─── Section Components ─────────────────────────────────────────────────────

function SectionCard({ title, description, children, onSave, saving }: {
  title: string; description: string; children: React.ReactNode;
  onSave: () => void; saving: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-base font-display font-600 text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-primary-700 text-white text-sm font-semibold rounded-md hover:bg-primary-800 transition-all active:scale-95 disabled:opacity-60 min-w-[110px] justify-center"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Section</>}
        </button>
      </div>
    </div>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function BasicInfoSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  return (
    <SectionCard title="Basic Information" description="Your name, headline, and contact details visible to recruiters" onSave={onSave} saving={saving}>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-semibold text-primary-700">
          {profile.firstName[0]}{profile.lastName[0]}
        </div>
        <div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors">
            <Upload size={12} /> Upload Photo
          </button>
          <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="First Name">
          <input defaultValue={profile.firstName} type="text" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
        </FieldGroup>
        <FieldGroup label="Last Name">
          <input defaultValue={profile.lastName} type="text" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
        </FieldGroup>
        <FieldGroup label="Email" hint="Used for application notifications">
          <input defaultValue={profile.email} type="email" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
        </FieldGroup>
        <FieldGroup label="Location" hint="City, Country format">
          <input defaultValue={profile.location} type="text" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
        </FieldGroup>
        <FieldGroup label="Professional Headline" hint="Short summary shown to recruiters (e.g. Senior AI Engineer — Python & LLMs)">
          <input defaultValue={profile.headline} type="text" className="col-span-2 w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
        </FieldGroup>
      </div>
      <FieldGroup label="Bio" hint="Detailed professional biography — helps AI understand your background">
        <textarea defaultValue={profile.bio} rows={4} className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 resize-none" />
      </FieldGroup>
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">Resume / CV</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
          <Upload size={20} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop your CV here, or <span className="text-primary-700 font-medium">browse files</span></p>
          <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB · Used by AI for additional context</p>
        </div>
      </div>
    </SectionCard>
  );
}

function SkillsSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  const [skills, setSkills] = useState(profile.skills);
  const [languages, setLanguages] = useState(profile.languages);

  const addSkill = () => setSkills(prev => [...prev, { name: '', level: 'Intermediate' as const, yearsOfExperience: 1 }]);
  const removeSkill = (i: number) => setSkills(prev => prev.filter((_, idx) => idx !== i));
  const addLanguage = () => setLanguages(prev => [...prev, { name: '', proficiency: 'Conversational' as const }]);
  const removeLanguage = (i: number) => setLanguages(prev => prev.filter((_, idx) => idx !== i));

  const skillLevelColors: Record<string, string> = {
    Expert: 'text-green-700 bg-green-50 border-green-200',
    Advanced: 'text-blue-700 bg-blue-50 border-blue-200',
    Intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    Beginner: 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <SectionCard title="Skills & Languages" description="Your technical skills and spoken languages — critical for AI matching accuracy" onSave={onSave} saving={saving}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-foreground">Technical Skills</p>
          <button onClick={addSkill} className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
            <Plus size={12} /> Add Skill
          </button>
        </div>
        <div className="space-y-2.5">
          {skills.map((skill, i) => (
            <div key={`skill-row-${i}`} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <input
                  value={skill.name}
                  onChange={e => setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, name: e.target.value } : s))}
                  placeholder="Skill name"
                  className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30"
                />
              </div>
              <div className="col-span-4">
                <select
                  value={skill.level}
                  onChange={e => setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, level: e.target.value as typeof skill.level } : s))}
                  className={`w-full px-2.5 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30 font-medium ${skillLevelColors[skill.level]}`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={skill.yearsOfExperience}
                    onChange={e => setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, yearsOfExperience: +e.target.value } : s))}
                    className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">yrs</span>
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => removeSkill(i)} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-foreground">Spoken Languages</p>
          <button onClick={addLanguage} className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
            <Plus size={12} /> Add Language
          </button>
        </div>
        <div className="space-y-2">
          {languages.map((lang, i) => (
            <div key={`lang-row-${i}`} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <input
                  value={lang.name}
                  onChange={e => setLanguages(prev => prev.map((l, idx) => idx === i ? { ...l, name: e.target.value } : l))}
                  placeholder="Language"
                  className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30"
                />
              </div>
              <div className="col-span-6">
                <select
                  value={lang.proficiency}
                  onChange={e => setLanguages(prev => prev.map((l, idx) => idx === i ? { ...l, proficiency: e.target.value as typeof lang.proficiency } : l))}
                  className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30 bg-white"
                >
                  <option value="Basic">Basic</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => removeLanguage(i)} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function ExperienceSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  const [experiences, setExperiences] = useState(profile.experience);

  const addExp = () => setExperiences(prev => [...prev, {
    company: '', role: '', startDate: '', endDate: '', description: '', technologies: [], isCurrent: false
  }]);
  const removeExp = (i: number) => setExperiences(prev => prev.filter((_, idx) => idx !== i));

  return (
    <SectionCard title="Work Experience" description="Your professional history — used by AI to score role relevance and seniority" onSave={onSave} saving={saving}>
      <div className="space-y-5">
        {experiences.map((exp, i) => (
          <div key={`exp-card-${i}`} className="border border-border rounded-lg p-4 space-y-3 relative">
            <button onClick={() => removeExp(i)} className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Company">
                <input defaultValue={exp.company} placeholder="Company name" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Role / Title">
                <input defaultValue={exp.role} placeholder="Your job title" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Start Date (YYYY-MM)">
                <input defaultValue={exp.startDate} placeholder="2022-01" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="End Date">
                <input defaultValue={exp.isCurrent ? 'Present' : exp.endDate} placeholder="YYYY-MM or Present" disabled={exp.isCurrent} className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30 disabled:bg-muted" />
              </FieldGroup>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`iscurrent-${i}`}
                defaultChecked={exp.isCurrent}
                onChange={e => setExperiences(prev => prev.map((ex, idx) => idx === i ? { ...ex, isCurrent: e.target.checked } : ex))}
                className="rounded border-border text-primary-700 focus:ring-primary-700"
              />
              <label htmlFor={`iscurrent-${i}`} className="text-xs text-foreground">I currently work here</label>
            </div>
            <FieldGroup label="Description" hint="Key responsibilities and achievements — be specific for better AI scoring">
              <textarea defaultValue={exp.description} rows={3} placeholder="Describe your key responsibilities and achievements..." className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30 resize-none" />
            </FieldGroup>
            <FieldGroup label="Technologies Used" hint="Comma-separated (e.g. Node.js, TypeScript, MongoDB)">
              <input defaultValue={exp.technologies.join(', ')} placeholder="Node.js, TypeScript, MongoDB" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
            </FieldGroup>
          </div>
        ))}
        <button onClick={addExp} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary-300 hover:text-primary-700 transition-colors">
          <Plus size={15} /> Add Work Experience
        </button>
      </div>
    </SectionCard>
  );
}

function EducationSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  const [educations, setEducations] = useState(profile.education);
  const addEdu = () => setEducations(prev => [...prev, { institution: '', degree: '', fieldOfStudy: '', startYear: 2020, endYear: null }]);
  const removeEdu = (i: number) => setEducations(prev => prev.filter((_, idx) => idx !== i));

  return (
    <SectionCard title="Education" description="Academic background — degree and field of study affect AI scoring for specialized roles" onSave={onSave} saving={saving}>
      <div className="space-y-4">
        {educations.map((edu, i) => (
          <div key={`edu-card-${i}`} className="border border-border rounded-lg p-4 space-y-3 relative">
            <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Institution">
                <input defaultValue={edu.institution} placeholder="University or school name" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Degree">
                <input defaultValue={edu.degree} placeholder="e.g. Bachelor's, Master's, PhD" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Field of Study">
                <input defaultValue={edu.fieldOfStudy} placeholder="e.g. Computer Science" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <div className="grid grid-cols-2 gap-2">
                <FieldGroup label="Start Year">
                  <input type="number" defaultValue={edu.startYear} className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
                </FieldGroup>
                <FieldGroup label="End Year">
                  <input type="number" defaultValue={edu.endYear ?? ''} placeholder="or blank if ongoing" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
                </FieldGroup>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addEdu} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary-300 hover:text-primary-700 transition-colors">
          <Plus size={15} /> Add Education
        </button>
      </div>
    </SectionCard>
  );
}

function CertificationsSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  const [certs, setCerts] = useState(profile.certifications);
  const addCert = () => setCerts(prev => [...prev, { name: '', issuer: '', issueDate: '' }]);
  const removeCert = (i: number) => setCerts(prev => prev.filter((_, idx) => idx !== i));

  return (
    <SectionCard title="Certifications" description="Professional certifications boost your AI match score for technical roles" onSave={onSave} saving={saving}>
      <div className="space-y-3">
        {certs.map((cert, i) => (
          <div key={`cert-card-${i}`} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <FieldGroup label="Certification Name">
                <input defaultValue={cert.name} placeholder="e.g. AWS Certified Developer" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
            </div>
            <div className="col-span-4">
              <FieldGroup label="Issuing Organization">
                <input defaultValue={cert.issuer} placeholder="e.g. Amazon" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
            </div>
            <div className="col-span-2">
              <FieldGroup label="Issue Date">
                <input defaultValue={cert.issueDate} placeholder="YYYY-MM" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
            </div>
            <div className="col-span-1 pb-0.5">
              <button onClick={() => removeCert(i)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        <button onClick={addCert} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary-300 hover:text-primary-700 transition-colors">
          <Plus size={15} /> Add Certification
        </button>
      </div>
    </SectionCard>
  );
}

function ProjectsSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  const [projects, setProjects] = useState(profile.projects);
  const addProject = () => setProjects(prev => [...prev, { name: '', description: '', technologies: [], role: '', link: '', startDate: '', endDate: '' }]);
  const removeProject = (i: number) => setProjects(prev => prev.filter((_, idx) => idx !== i));

  return (
    <SectionCard title="Portfolio Projects" description="Projects demonstrate practical skills — AI uses them to validate your technical claims" onSave={onSave} saving={saving}>
      <div className="space-y-5">
        {projects.map((proj, i) => (
          <div key={`proj-card-${i}`} className="border border-border rounded-lg p-4 space-y-3 relative">
            <button onClick={() => removeProject(i)} className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Project Name">
                <input defaultValue={proj.name} placeholder="e.g. AI Recruitment System" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Your Role">
                <input defaultValue={proj.role} placeholder="e.g. Lead Backend Engineer" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
            </div>
            <FieldGroup label="Description">
              <textarea defaultValue={proj.description} rows={2} placeholder="What did you build and what impact did it have?" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30 resize-none" />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Technologies Used" hint="Comma-separated">
                <input defaultValue={proj.technologies.join(', ')} placeholder="Next.js, Node.js, Gemini API" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Project Link">
                <input defaultValue={proj.link} type="url" placeholder="https://github.com/..." className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="Start Date (YYYY-MM)">
                <input defaultValue={proj.startDate} placeholder="2025-01" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
              <FieldGroup label="End Date (YYYY-MM)">
                <input defaultValue={proj.endDate} placeholder="2025-06 or Present" className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700/30" />
              </FieldGroup>
            </div>
          </div>
        ))}
        <button onClick={addProject} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary-300 hover:text-primary-700 transition-colors">
          <Plus size={15} /> Add Project
        </button>
      </div>
    </SectionCard>
  );
}

function AvailabilitySection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  const [status, setStatus] = useState(profile.availability.status);
  const [type, setType] = useState(profile.availability.type);
  const [startDate, setStartDate] = useState(profile.availability.startDate || '');

  const statusColors: Record<string, string> = {
    'Available': 'border-green-300 bg-green-50 text-green-800',
    'Open to Opportunities': 'border-blue-300 bg-blue-50 text-blue-800',
    'Not Available': 'border-red-300 bg-red-50 text-red-800',
  };

  return (
    <SectionCard title="Availability" description="Recruiters and AI scoring factor in your availability when making hiring decisions" onSave={onSave} saving={saving}>
      <FieldGroup label="Availability Status" hint="This is prominently displayed to recruiters on your shortlist card">
        <div className="grid grid-cols-3 gap-3">
          {(['Available', 'Open to Opportunities', 'Not Available'] as const).map(s => (
            <button
              key={`avail-${s}`}
              onClick={() => setStatus(s)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${
                status === s ? statusColors[s] : 'border-border text-muted-foreground hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Employment Type Preference">
        <div className="grid grid-cols-3 gap-3">
          {(['Full-time', 'Part-time', 'Contract'] as const).map(t => (
            <button
              key={`type-${t}`}
              onClick={() => setType(t)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                type === t ? 'border-primary-700 bg-primary-50 text-primary-700' : 'border-border text-muted-foreground hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Earliest Start Date" hint="Optional — leave blank if immediately available">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="w-full max-w-xs px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700"
        />
      </FieldGroup>
    </SectionCard>
  );
}

function SocialLinksSection({ profile, onSave, saving }: { profile: TalentProfile; onSave: () => void; saving: boolean }) {
  return (
    <SectionCard title="Social & Portfolio Links" description="External profiles help recruiters verify your work and AI scores portfolio depth" onSave={onSave} saving={saving}>
      <FieldGroup label="LinkedIn Profile URL">
        <input defaultValue={profile.socialLinks?.linkedin || ''} type="url" placeholder="https://linkedin.com/in/your-profile" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
      </FieldGroup>
      <FieldGroup label="GitHub Profile URL">
        <input defaultValue={profile.socialLinks?.github || ''} type="url" placeholder="https://github.com/your-username" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
      </FieldGroup>
      <FieldGroup label="Portfolio Website URL">
        <input defaultValue={profile.socialLinks?.portfolio || ''} type="url" placeholder="https://yourportfolio.dev" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
      </FieldGroup>
      <FieldGroup label="Other Profile URL" hint="Dribbble, Behance, personal blog, etc.">
        <input type="url" placeholder="https://..." className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700" />
      </FieldGroup>
    </SectionCard>
  );
}