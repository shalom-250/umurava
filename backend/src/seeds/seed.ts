import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Company from '../models/Company';
import Skill from '../models/Skill';
import Application from '../models/Application';
import bcrypt from 'bcryptjs';

dotenv.config();

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
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for skill-based seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Job.deleteMany({});
        await Candidate.deleteMany({});
        await Company.deleteMany({});
        await Skill.deleteMany({});
        await Application.deleteMany({});

        // 1. Seed Companies
        const companies = await Company.insertMany([
            { name: 'Bank of Kigali (BK)', website: 'https://bk.rw', industry: 'Finance', location: 'Kigali, Rwanda' },
            { name: 'Irembo', website: 'https://irembo.gov.rw', industry: 'GovTech', location: 'KG 9 Ave, Kigali' },
            { name: 'MTN Rwanda', website: 'https://mtn.co.rw', industry: 'Telecommunications', location: 'Nyarutarama, Kigali' },
            { name: 'Umurava', website: 'https://umurava.africa', industry: 'EdTech/Recruitment', location: 'Kigali, Rwanda' },
        ]);

        // 2. Seed Admin/Recruiter
        const salt = await bcrypt.genSalt(10);
        const admin = await User.create({
            name: 'Aline Uwimana',
            email: 'aline.uwimana@umurava.africa',
            password: await bcrypt.hash('Recruiter2026!', salt),
            role: 'recruiter',
        });

        // 3. Seed Jobs
        const createdJobs = [];
        for (let i = 0; i < jobsData.length; i++) {
            const jd = jobsData[i];
            const job = await Job.create({
                title: jd.title,
                description: `Join us in Kigali for this exciting ${jd.title} role. We are looking for talented Rwandans to help us scale.`,
                requirements: ["Relevant degree", "3+ years experience", "Fluent in English and Kinyarwanda"],
                skills: jd.skills,
                mustHaveSkills: [jd.skills[0]],
                recruiterId: admin._id,
                department: jd.dept,
                location: jd.loc,
                type: jd.type,
                status: jd.status,
                deadline: "2026-05-30"
            });
            createdJobs.push(job);
        }

        // 4. Seed Candidates (35) with specialized skills
        const createdCandidates = [];
        for (let i = 0; i < rwandanNames.length; i++) {
            let skills: string[] = [];
            let education = "BSc in Computer Science/Engineering";
            let experience = "";

            if (i < 15) { // Tech group
                skills = techSkills.slice(i % 5, (i % 5) + 3);
                experience = `${3 + (i % 5)} years of software engineering in Kigali.`;
            } else if (i < 22) { // HR group
                skills = hrSkills.slice(i % 3, (i % 3) + 3);
                education = "BSc in Human Resources / Business";
                experience = `${4 + (i % 3)} years in HR Operations.`;
            } else if (i < 30) { // Sales group
                skills = salesSkills.slice(i % 3, (i % 3) + 3);
                education = "BSc in Marketing / Business Administration";
                experience = `${2 + (i % 4)} years in business development.`;
            } else { // Design group
                skills = designSkills.slice(0, 3);
                education = "Diploma in Graphic Design / Multimedia";
                experience = `${3 + (i % 2)} years of UI/UX design.`;
            }

            const hasMissingDocs = i % 10 === 0;
            const candidate = await Candidate.create({
                name: rwandanNames[i],
                email: `${rwandanNames[i].toLowerCase().replace(/ /g, '.')}@example.rw`,
                phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
                skills,
                experience,
                education,
                source: 'structured',
                missingDocuments: hasMissingDocs ? ["Identity Card (ID)"] : []
            });
            createdCandidates.push(candidate);
        }

        // 5. Seed Applications (Skill-Based)
        // Candidates apply to jobs where they have at least one matching skill or relevant background
        for (let j = 0; j < createdJobs.length; j++) {
            const job = createdJobs[j];
            if (job.status === 'Draft') continue;

            const targetApplicantCount = (j % 2 === 0) ? 12 : 5;

            // Filter candidates based on skill overlap or department match
            const eligibleCandidates = createdCandidates.filter(c => {
                // Check skill overlap
                const hasSkillOverlap = c.skills.some(cs => job.skills.some(js => js.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(js.toLowerCase())));

                // Dept match logic
                const isTechJob = job.department === 'Engineering' || job.department === 'Infrastructure' || job.department === 'Data';
                const isTechCand = c.education?.includes('Computer Science');

                const isHRJob = job.department === 'Human Resources' || job.department === 'Operations';
                const isHRCand = c.education?.includes('Human Resources') || c.education?.includes('Business');

                const isSalesJob = job.department === 'Sales' || job.department === 'Marketing';
                const isSalesCand = c.education?.includes('Marketing');

                const isDesignJob = job.department === 'Design';
                const isDesignCand = c.skills?.includes('Figma');

                return hasSkillOverlap || (isTechJob && isTechCand) || (isHRJob && isHRCand) || (isSalesJob && isSalesCand) || (isDesignJob && isDesignCand);
            });

            // If we don't have enough eligible ones, just take some from the general pool to meet the requirement
            let finalApplicants = eligibleCandidates.sort(() => 0.5 - Math.random()).slice(0, targetApplicantCount);

            if (finalApplicants.length < targetApplicantCount) {
                const remainingNeeded = targetApplicantCount - finalApplicants.length;
                const otherCandidates = createdCandidates.filter(c => !finalApplicants.find(a => a._id.equals(c._id)));
                finalApplicants = [...finalApplicants, ...otherCandidates.sort(() => 0.5 - Math.random()).slice(0, remainingNeeded)];
            }

            for (const cand of finalApplicants) {
                await Application.create({
                    jobId: job._id,
                    candidateId: cand._id,
                    status: 'Applied',
                    appliedAt: new Date(Date.now() - Math.random() * 1296000000)
                });
            }
        }

        console.log(`Seeding complete: Skill-matched applications for 12 Jobs and 35 Candidates!`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
