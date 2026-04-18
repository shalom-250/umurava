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
const jobsData = [
    { title: "Senior AI/ML Engineer", dept: "Engineering", loc: "Kigali (Remote)", type: "Full-time", status: "Active" },
    { title: "Fullstack Developer (MERN)", dept: "Engineering", loc: "Nyarutarama, Kigali", type: "Full-time", status: "Active" },
    { title: "Frontend Specialist (React)", dept: "Engineering", loc: "Kigali Heights", type: "Contract", status: "Active" },
    { title: "DevOps Engineer", dept: "Infrastructure", loc: "Kigali", type: "Full-time", status: "Active" },
    { title: "Customer Success Manager", dept: "Operations", loc: "Kigali", type: "Full-time", status: "Active" },
    { title: "HR Business Partner", dept: "Human Resources", loc: "Kigali", type: "Full-time", status: "Active" },
    { title: "Sales Executive", dept: "Sales", loc: "Kigali", type: "Full-time", status: "Draft" },
    { title: "Marketing Coordinator", dept: "Marketing", loc: "Kigali", type: "Part-time", status: "Active" },
    { title: "Data Analyst", dept: "Data", loc: "Kigali", type: "Full-time", status: "Closed" },
    { title: "Product Designer (UI/UX)", dept: "Design", loc: "Kigali", type: "Contract", status: "Active" },
    { title: "Mobile App Developer", dept: "Engineering", loc: "Kigali", type: "Full-time", status: "Active" },
    { title: "QA Automation Engineer", dept: "Engineering", loc: "Kigali", type: "Full-time", status: "Active" }
];
const seedData = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');
        // Clear existing data
        await User_1.default.deleteMany({});
        await Job_1.default.deleteMany({});
        await Candidate_1.default.deleteMany({});
        await Company_1.default.deleteMany({});
        await Skill_1.default.deleteMany({});
        await Application_1.default.deleteMany({});
        // 1. Seed Companies
        const companies = await Company_1.default.insertMany([
            { name: 'Bank of Kigali (BK)', website: 'https://bk.rw', industry: 'Finance', location: 'Kigali, Rwanda' },
            { name: 'Irembo', website: 'https://irembo.gov.rw', industry: 'GovTech', location: 'KG 9 Ave, Kigali' },
            { name: 'MTN Rwanda', website: 'https://mtn.co.rw', industry: 'Telecommunications', location: 'Nyarutarama, Kigali' },
            { name: 'Umurava', website: 'https://umurava.africa', industry: 'EdTech/Recruitment', location: 'Kigali, Rwanda' },
        ]);
        // 2. Seed Admin/Recruiter
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
                skills: ["TypeScript", "Node.js", "Problem Solving"],
                mustHaveSkills: ["TypeScript"],
                recruiterId: admin._id,
                department: jd.dept,
                location: jd.loc,
                type: jd.type,
                status: jd.status,
                deadline: "2026-05-30"
            });
            createdJobs.push(job);
        }
        // 4. Seed Candidates (35)
        const createdCandidates = [];
        for (let i = 0; i < rwandanNames.length; i++) {
            const hasMissingDocs = i % 7 === 0; // Every 7th candidate has missing docs
            const candidate = await Candidate_1.default.create({
                name: rwandanNames[i],
                email: `${rwandanNames[i].toLowerCase().replace(/ /g, '.')}@example.rw`,
                phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
                skills: ["TypeScript", "React", "Node.js"],
                experience: `${3 + (i % 5)} years of experience in Kigali.`,
                education: "BSc in Computer Science/Engineering",
                source: 'structured',
                missingDocuments: hasMissingDocs ? ["Identity Card (ID)", "Degree Certificate"] : []
            });
            createdCandidates.push(candidate);
        }
        // 5. Seed Applications
        // Distribute candidates: some jobs get 5, others get 12
        for (let j = 0; j < createdJobs.length; j++) {
            const job = createdJobs[j];
            if (job.status === 'Draft')
                continue;
            const applicantCount = (j % 2 === 0) ? 12 : 5;
            const shuffledCandidates = [...createdCandidates].sort(() => 0.5 - Math.random());
            const applicants = shuffledCandidates.slice(0, applicantCount);
            for (const cand of applicants) {
                await Application_1.default.create({
                    jobId: job._id,
                    candidateId: cand._id,
                    status: 'Applied',
                    appliedAt: new Date(Date.now() - Math.random() * 1296000000) // Applied within last 15 days
                });
            }
        }
        console.log(`Seeding complete: 12 Jobs, 35 Candidates, and many Applications created!`);
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};
seedData();
