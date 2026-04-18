import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Company from '../models/Company';
import Skill from '../models/Skill';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackaton_db';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Job.deleteMany({});
        await Candidate.deleteMany({});
        await Company.deleteMany({});
        await Skill.deleteMany({});

        // 1. Seed Skills (Rwandan Market Relevant)
        const skills = await Skill.insertMany([
            { name: 'TypeScript', category: 'Technical' },
            { name: 'Node.js', category: 'Technical' },
            { name: 'React', category: 'Technical' },
            { name: 'Python', category: 'Technical' },
            { name: 'Data Analysis', category: 'Technical' },
            { name: 'Financial Literacy', category: 'Domain' },
            { name: 'Kinyarwanda Translation', category: 'Soft' },
            { name: 'Customer Success', category: 'Soft' },
        ]);

        // 2. Seed Companies (Rwandan Champions)
        const companies = await Company.insertMany([
            { name: 'Bank of Kigali (BK)', website: 'https://bk.rw', industry: 'Finance', location: 'Kigali, Rwanda' },
            { name: 'Irembo', website: 'https://irembo.gov.rw', industry: 'GovTech', location: 'KG 9 Ave, Kigali' },
            { name: 'MTN Rwanda', website: 'https://mtn.co.rw', industry: 'Telecommunications', location: 'Nyarutarama, Kigali' },
            { name: 'Umurava', website: 'https://umurava.africa', industry: 'EdTech/Recruitment', location: 'Kigali, Rwanda' },
        ]);

        // 3. Seed Recruiter/Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const admin = await User.create({
            name: 'Admin Recruiter',
            email: 'admin@umurava.rw',
            password: hashedPassword,
            role: 'admin',
        });

        // Seed Specific Recruiter for demo
        const recruiterPassword = await bcrypt.hash('Recruiter2026!', salt);
        await User.create({
            name: 'Aline Uwimana',
            email: 'aline.uwimana@umurava.africa',
            password: recruiterPassword,
            role: 'recruiter',
        });

        // 4. Seed Jobs
        const jobs = await Job.insertMany([
            {
                title: 'Senior Fullstack Developer',
                description: 'Lead our next-generation digital banking platform at BK.',
                requirements: ['5+ years experience', 'Strong Node.js skills'],
                skills: ['TypeScript', 'Node.js', 'React'],
                mustHaveSkills: ['TypeScript'],
                recruiterId: admin._id,
            },
            {
                title: 'Customer Success Manager',
                description: 'Help Rwandan citizens navigate Irembo services efficiently.',
                requirements: ['Fluent in Kinyarwanda and English', '2 years in customer service'],
                skills: ['Customer Success', 'Kinyarwanda Translation'],
                mustHaveSkills: ['Kinyarwanda Translation'],
                recruiterId: admin._id,
            }
        ]);

        // 5. Seed Candidates (Rwandan Context)
        const candidates = await Candidate.insertMany([
            {
                name: 'Jean Luc Mugisha',
                email: 'mugisha.jean@gmail.com',
                phone: '+250788123456',
                skills: ['TypeScript', 'Node.js', 'React'],
                experience: '3 years at a Kigali tech startup.',
                education: 'BSc Computer Science, University of Rwanda',
                source: 'structured'
            },
            {
                name: 'Clarisse Mutoni',
                email: 'mutoni.clarisse@yahoo.fr',
                phone: '+250788654321',
                skills: ['Kinyarwanda Translation', 'Customer Success'],
                experience: 'Former educator with strong community ties.',
                education: 'BA Communications, ULK',
                source: 'structured'
            }
        ]);

        console.log('Database Seeded Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
