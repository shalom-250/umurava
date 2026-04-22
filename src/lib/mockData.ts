// Backend integration point: Replace all mock data with API calls to Node.js/MongoDB backend

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface Language {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface Availability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  startDate?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline: string;
  bio?: string;
  location: string;
  skills: Skill[];
  languages: Language[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  availability: Availability;
  socialLinks?: SocialLinks;
  resumeUrl?: string;
  profileCompleteness: number;
}

export interface ScreeningResult {
  candidateId: string;
  rank: number;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'Strongly Recommend' | 'Recommend' | 'Consider' | 'Not Recommended';
  skillBreakdown: { skill: string; score: number; required: boolean }[];
  aiReasoning: string;
  documentStatus?: { name: string; status: 'completed' | 'missing' }[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  requirements: string[];
  requiredSkills: string[];
  mustHaveSkills?: string[];
  experienceLevel: 'Junior' | 'Mid-level' | 'Senior' | 'Lead';
  salaryRange: string;
  status: 'Draft' | 'Active' | 'Screening' | 'Closed';
  postedDate: string;
  deadline: string;
  applicantCount: number;
  shortlistedCount: number;
  avgMatchScore: number;
  department: string;
  requiredDocuments?: string[];
  lastScreenedAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Review' | 'Screened' | 'Shortlisted' | 'Rejected';
  matchScore?: number;
  screeningResult?: ScreeningResult;
}

// ─── MOCK JOBS ──────────────────────────────────────────────────────────────
export const mockJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Senior AI/ML Engineer',
    company: 'Umurava',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    description: 'Lead the development of AI-powered features for Umurava\'s talent marketplace, including recommendation systems and screening algorithms.',
    requirements: ['5+ years ML experience', 'Production LLM deployment', 'Python & TypeScript', 'API design'],
    requiredSkills: ['Python', 'TensorFlow', 'Node.js', 'Gemini API', 'TypeScript', 'MongoDB'],
    experienceLevel: 'Senior',
    salaryRange: '1,200,000 – 1,800,000 RWF/month',
    status: 'Screening',
    postedDate: '2026-03-28',
    deadline: '2026-04-20',
    applicantCount: 47,
    shortlistedCount: 10,
    avgMatchScore: 71,
    department: 'Engineering',
    requiredDocuments: ['Resume', 'Identity Document', 'Degree Certificate', 'Portfolio'],
  },
  {
    id: 'job-002',
    title: 'Full-Stack Engineer (Next.js + Node.js)',
    company: 'Umurava',
    location: 'Remote, Africa',
    type: 'Full-time',
    description: 'Build and maintain Umurava\'s core platform features, working across the full stack with a focus on performance and scalability.',
    requirements: ['3+ years React/Next.js', 'Node.js/TypeScript', 'REST API design', 'MongoDB'],
    requiredSkills: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Redux'],
    experienceLevel: 'Mid-level',
    salaryRange: '800,000 – 1,200,000 RWF/month',
    status: 'Active',
    postedDate: '2026-04-01',
    deadline: '2026-04-25',
    applicantCount: 63,
    shortlistedCount: 0,
    avgMatchScore: 0,
    department: 'Engineering',
  },
  {
    id: 'job-003',
    title: 'Product Designer (UI/UX)',
    company: 'Umurava',
    location: 'Kigali, Rwanda',
    type: 'Contract',
    description: 'Design intuitive interfaces for Umurava\'s recruiter and talent-facing products. Own the design system and user research processes.',
    requirements: ['4+ years UX design', 'Figma proficiency', 'Design systems', 'User research'],
    requiredSkills: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Tailwind CSS'],
    experienceLevel: 'Senior',
    salaryRange: '700,000 – 1,000,000 RWF/month',
    status: 'Active',
    postedDate: '2026-04-05',
    deadline: '2026-04-30',
    applicantCount: 31,
    shortlistedCount: 0,
    avgMatchScore: 0,
    department: 'Design',
  },
  {
    id: 'job-004',
    title: 'Data Engineer',
    company: 'Umurava',
    location: 'Remote, Africa',
    type: 'Full-time',
    description: 'Design and maintain data pipelines that power Umurava\'s analytics, AI training datasets, and reporting infrastructure.',
    requirements: ['3+ years data engineering', 'ETL pipeline design', 'SQL & NoSQL', 'Cloud platforms'],
    requiredSkills: ['Python', 'Apache Spark', 'MongoDB', 'PostgreSQL', 'dbt', 'Airflow'],
    experienceLevel: 'Mid-level',
    salaryRange: '900,000 – 1,300,000 RWF/month',
    status: 'Draft',
    postedDate: '2026-04-08',
    deadline: '2026-05-01',
    applicantCount: 0,
    shortlistedCount: 0,
    avgMatchScore: 0,
    department: 'Data',
  },
  {
    id: 'job-005',
    title: 'DevOps / Platform Engineer',
    company: 'Umurava',
    location: 'Remote, Africa',
    type: 'Full-time',
    description: 'Own Umurava\'s infrastructure: CI/CD pipelines, cloud deployments, monitoring, and security hardening.',
    requirements: ['Kubernetes & Docker', 'CI/CD pipelines', 'AWS or GCP', 'Infrastructure as Code'],
    requiredSkills: ['Kubernetes', 'Docker', 'Terraform', 'GitHub Actions', 'AWS', 'Node.js'],
    experienceLevel: 'Senior',
    salaryRange: '1,000,000 – 1,500,000 RWF/month',
    status: 'Closed',
    postedDate: '2026-03-10',
    deadline: '2026-04-01',
    applicantCount: 28,
    shortlistedCount: 5,
    avgMatchScore: 68,
    department: 'Infrastructure',
  },
];

// ─── MOCK TALENT PROFILES ────────────────────────────────────────────────────
export const mockTalentProfiles: TalentProfile[] = [
  {
    id: 'talent-001',
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'kwame.asante@gmail.com',
    headline: 'Senior AI/ML Engineer — Python, TensorFlow & LLM Systems',
    bio: 'AI engineer with 6 years building production ML systems across fintech and HR tech. Passionate about explainable AI and responsible deployment.',
    location: 'Accra, Ghana',
    skills: [
      { name: 'Python', level: 'Expert', yearsOfExperience: 6 },
      { name: 'TensorFlow', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Gemini API', level: 'Advanced', yearsOfExperience: 1 },
      { name: 'Node.js', level: 'Intermediate', yearsOfExperience: 3 },
      { name: 'TypeScript', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 3 },
    ],
    languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Twi', proficiency: 'Native' }],
    experience: [
      {
        company: 'Flutterwave',
        role: 'Senior ML Engineer',
        startDate: '2022-03',
        endDate: 'Present',
        description: 'Led development of fraud detection ML models processing 2M+ transactions daily. Reduced false positives by 34%.',
        technologies: ['Python', 'TensorFlow', 'Kafka', 'PostgreSQL'],
        isCurrent: true,
      },
      {
        company: 'Andela',
        role: 'ML Engineer',
        startDate: '2019-06',
        endDate: '2022-02',
        description: 'Built NLP models for talent matching, improving placement accuracy by 28%.',
        technologies: ['Python', 'PyTorch', 'AWS SageMaker'],
        isCurrent: false,
      },
    ],
    education: [
      { institution: 'University of Ghana', degree: "Master's", fieldOfStudy: 'Computer Science — AI Track', startYear: 2017, endYear: 2019 },
    ],
    certifications: [
      { name: 'Google Professional ML Engineer', issuer: 'Google', issueDate: '2023-05' },
      { name: 'AWS Certified ML Specialty', issuer: 'Amazon', issueDate: '2022-11' },
    ],
    projects: [
      {
        name: 'TalentLens AI',
        description: 'Open-source AI resume screener using Gemini API with explainable rankings',
        technologies: ['Python', 'Gemini API', 'FastAPI', 'Next.js'],
        role: 'Lead Engineer',
        link: 'https://github.com/kwame/talentlens',
        startDate: '2025-08',
        endDate: '2025-12',
      },
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2026-05-01' },
    socialLinks: { linkedin: 'https://linkedin.com/in/kwameasante', github: 'https://github.com/kwame' },
    profileCompleteness: 96,
  },
  {
    id: 'talent-002',
    firstName: 'Amara',
    lastName: 'Diallo',
    email: 'amara.diallo@outlook.com',
    headline: 'AI Research Engineer — NLP & Generative AI Systems',
    bio: 'Research-oriented engineer bridging academic AI and production deployment. Published in ACL 2024 on multilingual NLP for African languages.',
    location: 'Dakar, Senegal',
    skills: [
      { name: 'Python', level: 'Expert', yearsOfExperience: 5 },
      { name: 'PyTorch', level: 'Expert', yearsOfExperience: 4 },
      { name: 'Gemini API', level: 'Intermediate', yearsOfExperience: 1 },
      { name: 'TypeScript', level: 'Beginner', yearsOfExperience: 1 },
      { name: 'MongoDB', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'Node.js', level: 'Beginner', yearsOfExperience: 1 },
    ],
    languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'French', proficiency: 'Native' }, { name: 'Wolof', proficiency: 'Native' }],
    experience: [
      {
        company: 'Masakhane Research',
        role: 'NLP Research Engineer',
        startDate: '2023-01',
        endDate: 'Present',
        description: 'Developing multilingual LLM fine-tuning for African languages. Contributing to open-source NLP toolkits.',
        technologies: ['Python', 'PyTorch', 'HuggingFace', 'CUDA'],
        isCurrent: true,
      },
    ],
    education: [
      { institution: 'Cheikh Anta Diop University', degree: "PhD (in progress)", fieldOfStudy: 'Computational Linguistics', startYear: 2021, endYear: null },
    ],
    certifications: [{ name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', issueDate: '2022-03' }],
    projects: [
      {
        name: 'AfriNLP Toolkit',
        description: 'NLP toolkit supporting 12 African languages for classification and NER tasks',
        technologies: ['Python', 'PyTorch', 'HuggingFace'],
        role: 'Core Contributor',
        link: 'https://github.com/amara/afrinlp',
        startDate: '2023-06',
        endDate: '2024-12',
      },
    ],
    availability: { status: 'Open to Opportunities', type: 'Part-time' },
    socialLinks: { linkedin: 'https://linkedin.com/in/amaradiallo', github: 'https://github.com/amara' },
    profileCompleteness: 89,
  },
  {
    id: 'talent-003',
    firstName: 'Chidi',
    lastName: 'Okonkwo',
    email: 'chidi.okonkwo@protonmail.com',
    headline: 'Backend Engineer — Node.js, TypeScript & AI Orchestration',
    bio: 'Backend specialist with deep Node.js expertise and growing AI integration skills. Built payment and data systems at scale across West Africa.',
    location: 'Lagos, Nigeria',
    skills: [
      { name: 'Node.js', level: 'Expert', yearsOfExperience: 6 },
      { name: 'TypeScript', level: 'Expert', yearsOfExperience: 5 },
      { name: 'MongoDB', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Gemini API', level: 'Advanced', yearsOfExperience: 1 },
      { name: 'Python', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'TensorFlow', level: 'Beginner', yearsOfExperience: 1 },
    ],
    languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Igbo', proficiency: 'Conversational' }],
    experience: [
      {
        company: 'Paystack',
        role: 'Senior Backend Engineer',
        startDate: '2021-07',
        endDate: 'Present',
        description: 'Designed high-throughput payment processing APIs handling 500K+ daily transactions. Led migration to TypeScript monorepo.',
        technologies: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'AWS'],
        isCurrent: true,
      },
      {
        company: 'Konga',
        role: 'Backend Engineer',
        startDate: '2019-02',
        endDate: '2021-06',
        description: 'Built inventory and order management microservices for Nigeria\'s largest e-commerce platform.',
        technologies: ['Node.js', 'PostgreSQL', 'Docker'],
        isCurrent: false,
      },
    ],
    education: [
      { institution: 'University of Lagos', degree: "Bachelor's", fieldOfStudy: 'Computer Engineering', startYear: 2014, endYear: 2018 },
    ],
    certifications: [
      { name: 'MongoDB Certified Developer', issuer: 'MongoDB', issueDate: '2023-08' },
    ],
    projects: [
      {
        name: 'AI Recruitment Orchestrator',
        description: 'Backend orchestration layer for Gemini API screening with async job queues',
        technologies: ['Node.js', 'TypeScript', 'Gemini API', 'Bull', 'MongoDB'],
        role: 'Lead Backend Engineer',
        link: 'https://github.com/chidi/ai-recruiter',
        startDate: '2025-10',
        endDate: '2026-01',
      },
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2026-05-15' },
    socialLinks: { linkedin: 'https://linkedin.com/in/chidiokonkwo', github: 'https://github.com/chidi' },
    profileCompleteness: 92,
  },
  {
    id: 'talent-004',
    firstName: 'Fatima',
    lastName: 'Al-Rashid',
    email: 'fatima.alrashid@gmail.com',
    headline: 'ML Engineer — Computer Vision & Deployment',
    bio: 'Computer vision specialist transitioning into LLM-based systems. Strong deployment background with Docker, Kubernetes, and model serving.',
    location: 'Nairobi, Kenya',
    skills: [
      { name: 'Python', level: 'Advanced', yearsOfExperience: 5 },
      { name: 'TensorFlow', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Gemini API', level: 'Intermediate', yearsOfExperience: 1 },
      { name: 'Node.js', level: 'Beginner', yearsOfExperience: 1 },
      { name: 'TypeScript', level: 'Beginner', yearsOfExperience: 1 },
      { name: 'MongoDB', level: 'Beginner', yearsOfExperience: 1 },
    ],
    languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'Arabic', proficiency: 'Native' }, { name: 'Swahili', proficiency: 'Conversational' }],
    experience: [
      {
        company: 'Safaricom',
        role: 'ML Engineer',
        startDate: '2022-09',
        endDate: 'Present',
        description: 'Deployed computer vision models for SIM card fraud detection and document verification.',
        technologies: ['Python', 'TensorFlow', 'OpenCV', 'Kubernetes'],
        isCurrent: true,
      },
    ],
    education: [
      { institution: 'University of Nairobi', degree: "Master's", fieldOfStudy: 'Electrical & Computer Engineering', startYear: 2019, endYear: 2021 },
    ],
    certifications: [
      { name: 'TensorFlow Developer Certificate', issuer: 'Google', issueDate: '2021-09' },
    ],
    projects: [],
    availability: { status: 'Open to Opportunities', type: 'Full-time' },
    socialLinks: { linkedin: 'https://linkedin.com/in/fatimaai' },
    profileCompleteness: 74,
  },
  {
    id: 'talent-005',
    firstName: 'Nzinga',
    lastName: 'Mwamba',
    email: 'nzinga.mwamba@outlook.com',
    headline: 'AI Software Engineer — Prompt Engineering & LLM Pipelines',
    bio: 'Specialist in LLM prompt engineering and evaluation frameworks. Built internal AI tooling at two Rwandan tech startups.',
    location: 'Kigali, Rwanda',
    skills: [
      { name: 'Python', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Gemini API', level: 'Expert', yearsOfExperience: 2 },
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'MongoDB', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'TensorFlow', level: 'Intermediate', yearsOfExperience: 2 },
    ],
    languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'Kinyarwanda', proficiency: 'Native' }, { name: 'French', proficiency: 'Conversational' }],
    experience: [
      {
        company: 'Irembo',
        role: 'AI Software Engineer',
        startDate: '2024-01',
        endDate: 'Present',
        description: 'Built Gemini-powered chatbot for citizen services, handling 50K+ monthly queries with 91% resolution rate.',
        technologies: ['Python', 'Gemini API', 'Node.js', 'TypeScript'],
        isCurrent: true,
      },
      {
        company: 'RwandAI Labs',
        role: 'Junior AI Engineer',
        startDate: '2022-05',
        endDate: '2023-12',
        description: 'Developed prompt engineering frameworks and LLM evaluation pipelines.',
        technologies: ['Python', 'OpenAI API', 'TypeScript'],
        isCurrent: false,
      },
    ],
    education: [
      { institution: 'Carnegie Mellon University Africa', degree: "Master's", fieldOfStudy: 'Information Technology', startYear: 2020, endYear: 2022 },
    ],
    certifications: [
      { name: 'Prompt Engineering for Developers', issuer: 'DeepLearning.AI', issueDate: '2024-02' },
      { name: 'Google Cloud Professional Data Engineer', issuer: 'Google', issueDate: '2023-10' },
    ],
    projects: [
      {
        name: 'LLM Eval Framework',
        description: 'Open-source framework for evaluating LLM outputs on accuracy, bias, and coherence',
        technologies: ['Python', 'Gemini API', 'TypeScript'],
        role: 'Creator',
        link: 'https://github.com/nzinga/llm-eval',
        startDate: '2024-06',
        endDate: '2024-11',
      },
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2026-04-15' },
    socialLinks: { linkedin: 'https://linkedin.com/in/nzingamwamba', github: 'https://github.com/nzinga', portfolio: 'https://nzinga.dev' },
    profileCompleteness: 98,
  },
  {
    id: 'talent-006',
    firstName: 'Seun',
    lastName: 'Adeyemi',
    email: 'seun.adeyemi@gmail.com',
    headline: 'Backend Engineer — API Design & Microservices',
    bio: 'Experienced backend engineer with strong REST API and microservices background. New to AI but rapidly upskilling with Gemini.',
    location: 'Ibadan, Nigeria',
    skills: [
      { name: 'Node.js', level: 'Expert', yearsOfExperience: 5 },
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Python', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'Gemini API', level: 'Beginner', yearsOfExperience: 0 },
      { name: 'TensorFlow', level: 'Beginner', yearsOfExperience: 0 },
    ],
    languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Yoruba', proficiency: 'Native' }],
    experience: [
      {
        company: 'Interswitch',
        role: 'Backend Engineer',
        startDate: '2020-09',
        endDate: 'Present',
        description: 'Built payment microservices and internal API gateway handling 1M+ daily requests.',
        technologies: ['Node.js', 'TypeScript', 'MongoDB', 'Kafka', 'Docker'],
        isCurrent: true,
      },
    ],
    education: [
      { institution: 'Obafemi Awolowo University', degree: "Bachelor's", fieldOfStudy: 'Computer Science', startYear: 2015, endYear: 2019 },
    ],
    certifications: [],
    projects: [],
    availability: { status: 'Open to Opportunities', type: 'Full-time' },
    socialLinks: { linkedin: 'https://linkedin.com/in/seunadeyemi', github: 'https://github.com/seun' },
    profileCompleteness: 71,
  },
  {
    id: 'talent-007',
    firstName: 'Miriam',
    lastName: 'Tekeste',
    email: 'miriam.tekeste@gmail.com',
    headline: 'Full-Stack Engineer — React, Next.js & Node.js',
    bio: 'Full-stack engineer who loves building clean, performant web apps. Comfortable from DB schema to pixel-perfect UI.',
    location: 'Addis Ababa, Ethiopia',
    skills: [
      { name: 'Next.js', level: 'Expert', yearsOfExperience: 4 },
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'Gemini API', level: 'Intermediate', yearsOfExperience: 1 },
      { name: 'Python', level: 'Beginner', yearsOfExperience: 1 },
      { name: 'TensorFlow', level: 'Beginner', yearsOfExperience: 0 },
    ],
    languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'Amharic', proficiency: 'Native' }],
    experience: [
      {
        company: 'Gebeya',
        role: 'Full-Stack Engineer',
        startDate: '2022-01',
        endDate: 'Present',
        description: 'Built Gebeya\'s talent marketplace features end-to-end, including profile system and job matching UI.',
        technologies: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        isCurrent: true,
      },
    ],
    education: [
      { institution: 'Addis Ababa University', degree: "Bachelor's", fieldOfStudy: 'Software Engineering', startYear: 2017, endYear: 2021 },
    ],
    certifications: [{ name: 'Next.js & React — The Complete Guide', issuer: 'Udemy', issueDate: '2022-08' }],
    projects: [
      {
        name: 'TalentHub Ethiopia',
        description: 'Freelance marketplace connecting Ethiopian developers with remote clients',
        technologies: ['Next.js', 'Node.js', 'MongoDB', 'Stripe'],
        role: 'Co-founder & Lead Engineer',
        link: 'https://talenthubethiopia.com',
        startDate: '2024-01',
        endDate: '2024-09',
      },
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2026-05-01' },
    socialLinks: { linkedin: 'https://linkedin.com/in/miriamtekeste', github: 'https://github.com/miriam', portfolio: 'https://miriam.dev' },
    profileCompleteness: 88,
  },
  {
    id: 'talent-008',
    firstName: 'Kofi',
    lastName: 'Mensah',
    email: 'kofi.mensah@protonmail.com',
    headline: 'Data Scientist — ML & Statistical Modeling',
    bio: 'Data scientist with strong statistical background and growing production ML skills. 3 years in fintech data roles.',
    location: 'Kumasi, Ghana',
    skills: [
      { name: 'Python', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'TensorFlow', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'MongoDB', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'Gemini API', level: 'Beginner', yearsOfExperience: 0 },
      { name: 'Node.js', level: 'Beginner', yearsOfExperience: 1 },
      { name: 'TypeScript', level: 'Beginner', yearsOfExperience: 1 },
    ],
    languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Twi', proficiency: 'Fluent' }],
    experience: [
      {
        company: 'GCB Bank',
        role: 'Data Scientist',
        startDate: '2023-03',
        endDate: 'Present',
        description: 'Built credit risk scoring models and customer churn prediction systems.',
        technologies: ['Python', 'scikit-learn', 'PostgreSQL', 'Tableau'],
        isCurrent: true,
      },
    ],
    education: [
      { institution: 'KNUST', degree: "Bachelor's", fieldOfStudy: 'Statistics', startYear: 2018, endYear: 2022 },
    ],
    certifications: [{ name: 'IBM Data Science Professional', issuer: 'IBM', issueDate: '2023-01' }],
    projects: [],
    availability: { status: 'Open to Opportunities', type: 'Full-time' },
    socialLinks: { linkedin: 'https://linkedin.com/in/kofimensah' },
    profileCompleteness: 65,
  },
  {
    id: 'talent-009',
    firstName: 'Zara',
    lastName: 'Osei',
    email: 'zara.osei@gmail.com',
    headline: 'AI Product Engineer — LLM Apps & Developer Tools',
    bio: 'Building at the intersection of AI and developer experience. Shipped 3 LLM-powered products in the past 18 months.',
    location: 'Kigali, Rwanda',
    skills: [
      { name: 'TypeScript', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Gemini API', level: 'Advanced', yearsOfExperience: 2 },
      { name: 'Python', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'TensorFlow', level: 'Intermediate', yearsOfExperience: 2 },
    ],
    languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Kinyarwanda', proficiency: 'Conversational' }],
    experience: [
      {
        company: 'Umurava',
        role: 'AI Product Engineer',
        startDate: '2025-01',
        endDate: 'Present',
        description: 'Building AI-powered talent matching features using Gemini API. Shipped profile screening v1 in Q1 2026.',
        technologies: ['TypeScript', 'Gemini API', 'Next.js', 'Node.js', 'MongoDB'],
        isCurrent: true,
      },
      {
        company: 'Techbridge Africa',
        role: 'Software Engineer',
        startDate: '2022-06',
        endDate: '2024-12',
        description: 'Built developer tools and internal AI assistants for African tech teams.',
        technologies: ['TypeScript', 'Node.js', 'Python', 'GPT-4 API'],
        isCurrent: false,
      },
    ],
    education: [
      { institution: 'Carnegie Mellon University Africa', degree: "Bachelor's", fieldOfStudy: 'Computer Science', startYear: 2018, endYear: 2022 },
    ],
    certifications: [
      { name: 'Google Cloud AI Engineer', issuer: 'Google', issueDate: '2025-02' },
    ],
    projects: [
      {
        name: 'HireBot',
        description: 'Gemini-powered job description optimizer and candidate scorer',
        technologies: ['TypeScript', 'Gemini API', 'Next.js', 'Node.js'],
        role: 'Sole Engineer',
        link: 'https://hirebot.africa',
        startDate: '2025-06',
        endDate: '2025-10',
      },
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2026-04-20' },
    socialLinks: { linkedin: 'https://linkedin.com/in/zaraosei', github: 'https://github.com/zara', portfolio: 'https://zara.dev' },
    profileCompleteness: 97,
  },
  {
    id: 'talent-010',
    firstName: 'Ibrahim',
    lastName: 'Coulibaly',
    email: 'ibrahim.coulibaly@outlook.com',
    headline: 'Backend Engineer — Python & AI Systems Integration',
    bio: 'Backend engineer specializing in integrating AI/ML services into production systems. Fluent in Python and Node.js.',
    location: 'Abidjan, Côte d\'Ivoire',
    skills: [
      { name: 'Python', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'Gemini API', level: 'Advanced', yearsOfExperience: 1 },
      { name: 'TensorFlow', level: 'Intermediate', yearsOfExperience: 2 },
    ],
    languages: [{ name: 'French', proficiency: 'Native' }, { name: 'English', proficiency: 'Fluent' }, { name: 'Dioula', proficiency: 'Native' }],
    experience: [
      {
        company: 'Wave Mobile Money',
        role: 'Backend Engineer',
        startDate: '2023-04',
        endDate: 'Present',
        description: 'Built AI-assisted fraud detection and compliance checking systems in Python.',
        technologies: ['Python', 'Node.js', 'TypeScript', 'MongoDB', 'Gemini API'],
        isCurrent: true,
      },
    ],
    education: [
      { institution: 'Université Félix Houphouët-Boigny', degree: "Bachelor's", fieldOfStudy: 'Computer Science', startYear: 2016, endYear: 2020 },
    ],
    certifications: [{ name: 'Python for Data Science', issuer: 'IBM', issueDate: '2022-06' }],
    projects: [
      {
        name: 'ComplianceAI',
        description: 'Gemini-powered regulatory compliance checker for West African fintech',
        technologies: ['Python', 'Gemini API', 'FastAPI'],
        role: 'Lead Engineer',
        link: 'https://github.com/ibrahim/complianceai',
        startDate: '2025-03',
        endDate: '2025-08',
      },
    ],
    availability: { status: 'Available', type: 'Full-time', startDate: '2026-05-01' },
    socialLinks: { linkedin: 'https://linkedin.com/in/ibrahimcoulibaly', github: 'https://github.com/ibrahim' },
    profileCompleteness: 84,
  },
];

// ─── MOCK SCREENING RESULTS ──────────────────────────────────────────────────
export const mockScreeningResults: ScreeningResult[] = [
  {
    candidateId: 'talent-001',
    rank: 1,
    matchScore: 91,
    strengths: ['6 years Python production experience', 'Published Gemini API project', 'ML at fintech scale', 'Google & AWS ML certifications'],
    gaps: ['TensorFlow version mismatch with stack', 'Node.js at Intermediate (not Expert)'],
    recommendation: 'Strongly Recommend',
    skillBreakdown: [
      { skill: 'Python', score: 95, required: true },
      { skill: 'TensorFlow', score: 85, required: true },
      { skill: 'Gemini API', score: 90, required: true },
      { skill: 'Node.js', score: 70, required: true },
      { skill: 'TypeScript', score: 65, required: true },
      { skill: 'MongoDB', score: 80, required: true },
    ],
    aiReasoning: 'Kwame Asante is the strongest candidate for this role. His 6 years of Python expertise and production ML deployment at Flutterwave directly maps to the job requirements. His TalentLens AI project demonstrates hands-on Gemini API experience with the exact use case (AI screening). The only notable gap is Node.js at Intermediate level, but his overall AI/ML depth more than compensates. Highly recommended for immediate interview.',
    documentStatus: [
      { name: 'Resume', status: 'completed' },
      { name: 'Identity Document', status: 'completed' },
      { name: 'Degree Certificate', status: 'completed' },
      { name: 'Portfolio', status: 'completed' },
    ],
  },
  {
    candidateId: 'talent-005',
    rank: 2,
    matchScore: 88,
    strengths: ['Expert Gemini API — highest in cohort', 'Local market knowledge (Kigali)', '2 certifications in prompt engineering & GCP', 'Production LLM deployment at Irembo'],
    gaps: ['Less traditional ML (TensorFlow at Intermediate)', 'Shorter total experience vs Rank 1'],
    recommendation: 'Strongly Recommend',
    skillBreakdown: [
      { skill: 'Python', score: 82, required: true },
      { skill: 'TensorFlow', score: 60, required: true },
      { skill: 'Gemini API', score: 98, required: true },
      { skill: 'Node.js', score: 85, required: true },
      { skill: 'TypeScript', score: 88, required: true },
      { skill: 'MongoDB', score: 72, required: true },
    ],
    aiReasoning: 'Nzinga Mwamba stands out for her Expert-level Gemini API proficiency — the highest in the entire applicant pool. Her production deployment at Irembo (50K+ monthly queries) proves real-world LLM reliability. Being Kigali-based is a practical advantage. Her TensorFlow score is lower than ideal for a Senior AI role, but her prompt engineering specialization aligns perfectly with the Gemini-centric stack. Strong interview recommendation.',
    documentStatus: [
      { name: 'Resume', status: 'completed' },
      { name: 'Identity Document', status: 'missing' },
      { name: 'Degree Certificate', status: 'completed' },
      { name: 'Portfolio', status: 'missing' },
    ],
  },
  {
    candidateId: 'talent-009',
    rank: 3,
    matchScore: 84,
    strengths: ['Internal Umurava experience', 'Expert TypeScript', 'Multiple LLM product ships', 'CMU Africa graduate'],
    gaps: ['TensorFlow at Intermediate', 'Python at Advanced not Expert'],
    recommendation: 'Strongly Recommend',
    skillBreakdown: [
      { skill: 'Python', score: 80, required: true },
      { skill: 'TensorFlow', score: 65, required: true },
      { skill: 'Gemini API', score: 88, required: true },
      { skill: 'Node.js', score: 85, required: true },
      { skill: 'TypeScript', score: 95, required: true },
      { skill: 'MongoDB', score: 83, required: true },
    ],
    aiReasoning: 'Zara Osei brings unique value as a current Umurava team member with direct context on the product roadmap. Her Expert TypeScript and Advanced Gemini API skills align well. Having shipped HireBot — a Gemini-powered candidate scorer — demonstrates direct domain relevance. The primary gap is traditional ML depth (TensorFlow). For a role that emphasizes AI product engineering over pure ML research, she is an excellent fit.',
  },
  {
    candidateId: 'talent-003',
    rank: 4,
    matchScore: 79,
    strengths: ['Expert Node.js & MongoDB', 'Expert TypeScript', 'Payment systems at scale', 'MongoDB certification'],
    gaps: ['Python at Intermediate — significant gap for ML role', 'TensorFlow at Beginner', 'No ML research background'],
    recommendation: 'Recommend',
    skillBreakdown: [
      { skill: 'Python', score: 55, required: true },
      { skill: 'TensorFlow', score: 30, required: true },
      { skill: 'Gemini API', score: 85, required: true },
      { skill: 'Node.js', score: 97, required: true },
      { skill: 'TypeScript', score: 96, required: true },
      { skill: 'MongoDB', score: 96, required: true },
    ],
    aiReasoning: 'Chidi Okonkwo excels on the backend engineering dimension of this role, with Expert-level Node.js, TypeScript, and MongoDB. His Gemini API orchestration project is highly relevant. However, the ML-specific requirements (Python Expert, TensorFlow Advanced) are significant gaps. Recommend for interview if the role can be scoped toward AI orchestration and backend, with less emphasis on pure ML research.',
  },
  {
    candidateId: 'talent-002',
    rank: 5,
    matchScore: 74,
    strengths: ['Expert PyTorch/NLP research', 'Published academic AI work', 'Expert Python', 'Multilingual AI expertise'],
    gaps: ['TypeScript & Node.js at Beginner', 'No production deployment experience', 'Part-time availability'],
    recommendation: 'Recommend',
    skillBreakdown: [
      { skill: 'Python', score: 95, required: true },
      { skill: 'TensorFlow', score: 70, required: true },
      { skill: 'Gemini API', score: 60, required: true },
      { skill: 'Node.js', score: 28, required: true },
      { skill: 'TypeScript', score: 25, required: true },
      { skill: 'MongoDB', score: 55, required: true },
    ],
    aiReasoning: 'Amara Diallo brings exceptional NLP research credentials — ACL publication and Expert PyTorch skills. However, the production engineering requirements are a concern: TypeScript and Node.js at Beginner level will require significant ramp-up time. Additionally, Part-time availability may not meet role demands. Recommend for interview if the team can support a research-to-engineering transition period.',
  },
  {
    candidateId: 'talent-010',
    rank: 6,
    matchScore: 72,
    strengths: ['Expert Python', 'Advanced Gemini API', 'Production AI integration at Wave', 'Strong Node.js + TypeScript'],
    gaps: ['TensorFlow at Intermediate', 'Less ML research background', 'Shorter tenure in current role'],
    recommendation: 'Recommend',
    skillBreakdown: [
      { skill: 'Python', score: 92, required: true },
      { skill: 'TensorFlow', score: 58, required: true },
      { skill: 'Gemini API', score: 82, required: true },
      { skill: 'Node.js', score: 80, required: true },
      { skill: 'TypeScript', score: 78, required: true },
      { skill: 'MongoDB', score: 80, required: true },
    ],
    aiReasoning: 'Ibrahim Coulibaly has solid AI systems integration experience with Expert Python and Advanced Gemini API skills. His ComplianceAI project shows initiative in building production AI tools. The TensorFlow gap is notable for a Senior AI role. His bilingual profile (French/English) adds value for Umurava\'s pan-African operations. Recommend for a second-round technical screen.',
  },
  {
    candidateId: 'talent-004',
    rank: 7,
    matchScore: 63,
    strengths: ['Expert TensorFlow', 'Advanced Python', 'Production ML deployment', 'Nairobi tech ecosystem experience'],
    gaps: ['Node.js & TypeScript at Beginner', 'MongoDB at Beginner', 'No LLM/Gemini API production experience'],
    recommendation: 'Consider',
    skillBreakdown: [
      { skill: 'Python', score: 85, required: true },
      { skill: 'TensorFlow', score: 95, required: true },
      { skill: 'Gemini API', score: 48, required: true },
      { skill: 'Node.js', score: 22, required: true },
      { skill: 'TypeScript', score: 20, required: true },
      { skill: 'MongoDB', score: 25, required: true },
    ],
    aiReasoning: 'Fatima Al-Rashid is a strong traditional ML engineer — her TensorFlow and computer vision background is impressive. However, the role requires significant LLM and full-stack capability (Node.js, TypeScript, MongoDB) where she scores low. If the team needs pure ML model depth and can pair her with a strong backend engineer, she is worth considering. Otherwise, the skills gap is too broad for a Senior AI/ML Engineer role.',
  },
  {
    candidateId: 'talent-007',
    rank: 8,
    matchScore: 58,
    strengths: ['Expert Next.js', 'Advanced full-stack skills', 'Marketplace domain experience', 'Clean production record'],
    gaps: ['Python at Beginner', 'TensorFlow at Beginner (zero experience)', 'No ML background', 'Gemini API at Intermediate only'],
    recommendation: 'Consider',
    skillBreakdown: [
      { skill: 'Python', score: 30, required: true },
      { skill: 'TensorFlow', score: 10, required: true },
      { skill: 'Gemini API', score: 62, required: true },
      { skill: 'Node.js', score: 85, required: true },
      { skill: 'TypeScript', score: 88, required: true },
      { skill: 'MongoDB', score: 82, required: true },
    ],
    aiReasoning: 'Miriam Tekeste is an excellent full-stack engineer but does not meet the ML requirements for this specific role. Her Python and TensorFlow gaps are too significant for a Senior AI/ML Engineer position. She would be a much stronger fit for a Full-Stack Engineer role (job-002). Consider redirecting her application to that opening, where her skills would rank in the top 3.',
  },
  {
    candidateId: 'talent-006',
    rank: 9,
    matchScore: 51,
    strengths: ['Expert Node.js', 'Advanced TypeScript & MongoDB', 'Microservices at scale'],
    gaps: ['Gemini API at Beginner (no experience)', 'TensorFlow at Beginner', 'Python at Intermediate', 'No AI/ML background'],
    recommendation: 'Not Recommended',
    skillBreakdown: [
      { skill: 'Python', score: 50, required: true },
      { skill: 'TensorFlow', score: 15, required: true },
      { skill: 'Gemini API', score: 18, required: true },
      { skill: 'Node.js', score: 95, required: true },
      { skill: 'TypeScript', score: 88, required: true },
      { skill: 'MongoDB', score: 85, required: true },
    ],
    aiReasoning: 'Seun Adeyemi has strong backend engineering credentials but lacks the AI/ML foundation required for this role. Zero Gemini API experience and Beginner TensorFlow make him unsuitable for a Senior AI/ML Engineer position. He would be a top candidate for a pure backend role. Not recommended for this specific opening.',
  },
  {
    candidateId: 'talent-008',
    rank: 10,
    matchScore: 44,
    strengths: ['Advanced Python', 'Statistical modeling background', 'IBM Data Science certification'],
    gaps: ['Gemini API at Beginner (zero experience)', 'TensorFlow at Intermediate', 'Node.js & TypeScript at Beginner', 'No LLM production experience'],
    recommendation: 'Not Recommended',
    skillBreakdown: [
      { skill: 'Python', score: 80, required: true },
      { skill: 'TensorFlow', score: 50, required: true },
      { skill: 'Gemini API', score: 15, required: true },
      { skill: 'Node.js', score: 22, required: true },
      { skill: 'TypeScript', score: 20, required: true },
      { skill: 'MongoDB', score: 52, required: true },
    ],
    aiReasoning: 'Kofi Mensah has a solid data science background but is not yet ready for a Senior AI/ML Engineer role at this level. His Gemini API and LLM experience is minimal, and the full-stack requirements (Node.js, TypeScript) are gaps. He would benefit from 12–18 months of focused LLM engineering experience before this role. Not recommended at this time.',
  },
];

// ─── MOCK APPLICATIONS (for Applicant Portal) ───────────────────────────────
export const mockApplications: Application[] = [
  {
    id: 'app-001',
    jobId: 'job-001',
    jobTitle: 'Senior AI/ML Engineer',
    company: 'Umurava',
    appliedDate: '2026-04-02',
    status: 'Shortlisted',
    matchScore: 88,
    screeningResult: mockScreeningResults[1],
  },
  {
    id: 'app-002',
    jobId: 'job-002',
    jobTitle: 'Full-Stack Engineer (Next.js + Node.js)',
    company: 'Umurava',
    appliedDate: '2026-04-06',
    status: 'Under Review',
    matchScore: undefined,
  },
  {
    id: 'app-003',
    jobId: 'job-005',
    jobTitle: 'DevOps / Platform Engineer',
    company: 'Umurava',
    appliedDate: '2026-03-15',
    status: 'Rejected',
    matchScore: 38,
  },
];

export const applicantStatusColors: Record<string, string> = {
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Screened': 'bg-purple-50 text-purple-700 border-purple-200',
  'Shortlisted': 'bg-green-50 text-green-700 border-green-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

export const jobStatusColors: Record<string, string> = {
  'Draft': 'bg-gray-100 text-gray-600 border-gray-200',
  'Active': 'bg-green-50 text-green-700 border-green-200',
  'Screening': 'bg-blue-50 text-blue-700 border-blue-200',
  'Closed': 'bg-red-50 text-red-700 border-red-200',
};

export const recommendationColors: Record<string, string> = {
  'Strongly Recommend': 'bg-green-50 text-green-700 border-green-200',
  'Recommend': 'bg-blue-50 text-blue-700 border-blue-200',
  'Consider': 'bg-amber-50 text-amber-700 border-amber-200',
  'Not Recommended': 'bg-red-50 text-red-700 border-red-200',
};