"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Job_1 = __importDefault(require("../models/Job"));
const Candidate_1 = __importDefault(require("../models/Candidate"));
const Company_1 = __importDefault(require("../models/Company"));
const Skill_1 = __importDefault(require("../models/Skill"));
const Application_1 = __importDefault(require("../models/Application"));
const Screening_1 = __importDefault(require("../models/Screening"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackaton_db';
const rwandanNames = [
    "Jean Luc Mugisha", "Clarisse Mutoni", "Emile Nshimyumuremyi", "Grace Keza",
    "Patrick Uwimana", "Diane Ishimwe", "Olivier Niyomugabo", "Sandrine Umutoni",
    "Thierry Habimana", "Aline Uwamahoro", "Fabrice Murenzi", "Divine Uwera",
    "Benoit Karemera", "Solange Mukamana", "Cedric Tuyisenge", "Marie Louise Nirere",
    "Gaspard Nsabimana", "Pacifique Ngabonziza", "Florence Mukeshimana", "Oscar Tuyishime",
    "Jeanne d'Arc Mukanyandwi", "Eric Gakwaya", "Lydia Umulisa", "Vincent de Paul Nkurunziza",
    "Yvonne Giramata", "Albertine Uwamariya", "Didier Kwizera", "Felicien Mugwaneza",
    "Isabelle Umurerwa", "Jean Pierre Ndagijimana", "Angelique Mukandayisenga", "Callixte Ndayisabye",
    "Sonia Uwizeye", "Theophile Mbonigaba", "Regine Nyirahabimana"
];
const techSkills = ["TypeScript", "React", "Node.js", "Python", "TensorFlow", "Docker", "AWS", "SQL"];
const hrSkills = ["Recruitment", "Employee Relations", "Payroll", "HR Policies", "Strategic Planning"];
const salesSkills = ["CRM", "Lead Generation", "Sales Pitch", "Market Research", "Negotiation"];
const designSkills = ["Figma", "UI/UX", "Adobe XD", "Wireframing", "Prototypes"];
const jobsData = [
    { title: "Senior AI/ML Engineer", dept: "Engineering", loc: "Kigali (Remote)", type: "Full-time", status: "Active", skills: ["Python", "TensorFlow", "ML"] },
    { title: "Fullstack Developer (MERN)", dept: "Engineering", loc: "Nyarutarama, Kigali", type: "Full-time", status: "Active", skills: ["React", "Node.js", "TypeScript", "SQL"] },
    { title: "Frontend Specialist (React)", dept: "Engineering", loc: "Kigali Heights", type: "Contract", status: "Active", skills: ["React", "TypeScript", "UI/UX"] },
    { title: "DevOps Engineer", dept: "Infrastructure", loc: "Kigali", type: "Full-time", status: "Active", skills: ["Docker", "AWS", "Automation"] },
    { title: "Customer Success Manager", dept: "Operations", loc: "Kigali", type: "Full-time", status: "Active", skills: ["Communication", "Problem Solving", "CRM"] },
    { title: "HR Business Partner", dept: "Human Resources", loc: "Kigali", type: "Full-time", status: "Active", skills: ["HR Policies", "Recruitment", "Employee Relations"] },
    { title: "Sales Executive", dept: "Sales", loc: "Kigali", type: "Full-time", status: "Draft", skills: ["Sales Pitch", "Lead Generation", "CRM"] },
    { title: "Marketing Coordinator", dept: "Marketing", loc: "Kigali", type: "Part-time", status: "Active", skills: ["SEO", "Content Strategy", "Social Media"] },
    { title: "Data Analyst", dept: "Data", loc: "Kigali", type: "Full-time", status: "Closed", skills: ["SQL", "Python", "Data Visualization"] },
    { title: "Product Designer (UI/UX)", dept: "Design", loc: "Kigali", type: "Contract", status: "Active", skills: ["Figma", "UI/UX", "Prototyping"] },
    { title: "Mobile App Developer", dept: "Engineering", loc: "Kigali", type: "Full-time", status: "Active", skills: ["React Native", "TypeScript", "Firebase"] },
    { title: "QA Automation Engineer", dept: "Engineering", loc: "Kigali", type: "Full-time", status: "Active", skills: ["TypeScript", "Selenium", "Automation"] }
];
const seedData = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB for skill-based seeding...');
        // Clear existing data
        await User_1.default.deleteMany({});
        await Job_1.default.deleteMany({});
        await Candidate_1.default.deleteMany({});
        await Company_1.default.deleteMany({});
        await Skill_1.default.deleteMany({});
        await Application_1.default.deleteMany({});
        await Screening_1.default.deleteMany({});
        // 1. Seed Companies
        const companies = await Company_1.default.insertMany([
            { name: 'Bank of Kigali (BK)', website: 'https://bk.rw', industry: 'Finance', location: 'Kigali, Rwanda' },
            { name: 'Irembo', website: 'https://irembo.gov.rw', industry: 'GovTech', location: 'KG 9 Ave, Kigali' },
            { name: 'MTN Rwanda', website: 'https://mtn.co.rw', industry: 'Telecommunications', location: 'Nyarutarama, Kigali' },
            { name: 'Umurava', website: 'https://umurava.africa', industry: 'EdTech/Recruitment', location: 'Kigali, Rwanda' },
        ]);
        // 2. Seed Admin/Recruiter and Applicant
        const salt = await bcryptjs_1.default.genSalt(10);
        const admin = await User_1.default.create({
            name: 'Aline Uwimana',
            email: 'aline.uwimana@umurava.africa',
            password: await bcryptjs_1.default.hash('Recruiter2026!', salt),
            role: 'recruiter',
        });
        // 3. Seed Jobs
        const createdJobs = [];
        for (let i = 0; i < jobsData.length; i++) {
            const jd = jobsData[i];
            const job = await Job_1.default.create({
                title: jd.title,
                description: `Join us in Kigali for this exciting ${jd.title} role. We are looking for talented Rwandans to help us scale.`,
                requirements: ["Relevant degree", "3+ years experience", "Fluent in English and Kinyarwanda"],
                skills: jd.skills,
                mustHaveSkills: [jd.skills[0]],
                recruiterId: admin._id,
                department: jd.dept,
                location: jd.loc,
                type: (jd.type === 'Full-time' || jd.type === 'Part-time' || jd.type === 'Contract') ? jd.type : 'Full-time',
                status: jd.status === 'Active' || jd.status === 'Draft' || jd.status === 'Closed' ? jd.status : 'Active',
                deadline: "2026-05-30",
                experienceLevel: 'Mid-level',
                salaryRange: 'Negotiable'
            });
            createdJobs.push(job);
        }
        // 4. Seed Candidates (35) with specialized skills
        const createdCandidates = [];
        for (let i = 0; i < rwandanNames.length; i++) {
            const nameParts = rwandanNames[i].split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || 'N/A';
            let skills = [];
            let educationStr = "BSc in Computer Science/Engineering";
            let experienceStr = "";
            if (i < 15) { // Tech group
                skills = techSkills.slice(i % 5, (i % 5) + 3);
                experienceStr = `${3 + (i % 5)} years of software engineering in Kigali.`;
            }
            else if (i < 22) { // HR group
                skills = hrSkills.slice(i % 3, (i % 3) + 3);
                educationStr = "BSc in Human Resources / Business";
                experienceStr = `${4 + (i % 3)} years in HR Operations.`;
            }
            else if (i < 30) { // Sales group
                skills = salesSkills.slice(i % 3, (i % 3) + 3);
                educationStr = "BSc in Marketing / Business Administration";
                experienceStr = `${2 + (i % 4)} years in business development.`;
            }
            else { // Design group
                skills = designSkills.slice(0, 3);
                educationStr = "Diploma in Graphic Design / Multimedia";
                experienceStr = `${3 + (i % 2)} years of UI/UX design.`;
            }
            const hasMissingDocs = i % 10 === 0;
            const candidate = await Candidate_1.default.create({
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/ /g, '.')}@example.rw`,
                phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
                skills: skills.map(s => ({ name: s, level: 'Intermediate', yearsOfExperience: 2 })),
                experience: [{
                        company: 'Kigali Tech Hub',
                        role: 'Specialist',
                        startDate: '2022-01-01',
                        endDate: 'Present',
                        description: experienceStr,
                        technologies: skills,
                        isCurrent: true
                    }],
                education: [{
                        institution: 'University of Rwanda',
                        degree: 'Bachelor',
                        fieldOfStudy: educationStr,
                        startYear: 2018,
                        endYear: 2022
                    }],
                source: 'structured'
            });
            createdCandidates.push(candidate);
        }
        // 5. Seed Applications (Skill-Based)
        for (let j = 0; j < createdJobs.length; j++) {
            const job = createdJobs[j];
            if (job.status === 'Draft')
                continue;
            const targetApplicantCount = (j % 2 === 0) ? 12 : 5;
            const finalApplicants = createdCandidates.sort(() => 0.5 - Math.random()).slice(0, targetApplicantCount);
            for (const cand of finalApplicants) {
                await Application_1.default.create({
                    jobId: job._id,
                    candidateId: cand._id,
                    status: 'Applied',
                    appliedAt: new Date(Date.now() - Math.random() * 1296000000)
                });
            }
        }
        console.log(`Seeding complete: 12 Jobs and 36 Candidates on Atlas!`);
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};
seedData();
