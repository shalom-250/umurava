import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import Candidate from './src/models/Candidate';
import Application from './src/models/Application';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
    api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
});

const uploadToCloudinary = async (filePath: string): Promise<string | null> => {
    try {
        const absolutePath = path.resolve(filePath);
        if (!fs.existsSync(absolutePath)) {
            console.log(`File not found: ${absolutePath}`);
            return null;
        }

        console.log(`Uploading ${absolutePath}...`);
        const uploadResult = await cloudinary.uploader.upload(absolutePath, {
            resource_type: "raw",
            public_id: path.parse(absolutePath).name.replace(/[^a-z0-9]/gi, '_') + "_" + Date.now(),
            folder: "umurava_resumes",
        });

        return uploadResult.secure_url;
    } catch (err: any) {
        console.error(`Failed to upload ${filePath}:`, err.message);
        return null;
    }
};

const runMigration = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        // 1. Update Candidates
        const candidates = await Candidate.find({ resumeUrl: { $regex: /^uploads\// } });
        console.log(`Found ${candidates.length} candidates with legacy resumeURLs.`);

        for (const cand of candidates) {
            if (cand.resumeUrl) {
                const cloudUrl = await uploadToCloudinary(cand.resumeUrl);
                if (cloudUrl) {
                    cand.resumeUrl = cloudUrl;
                    await cand.save();
                    console.log(`Updated Candidate ID: ${cand._id}`);
                }
            }
        }

        // 2. Update Applications
        const applications = await Application.find({ 'attachments.url': { $regex: /^uploads\// } });
        console.log(`Found ${applications.length} applications with legacy attachments.`);

        for (const app of applications) {
            let modified = false;
            for (let i = 0; i < app.attachments.length; i++) {
                const att = app.attachments[i];
                if (att.url.startsWith('uploads/')) {
                    const cloudUrl = await uploadToCloudinary(att.url);
                    if (cloudUrl) {
                        att.url = cloudUrl;
                        modified = true;
                    }
                }
            }
            if (modified) {
                await app.save();
                console.log(`Updated Application ID: ${app._id}`);
            }
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

runMigration();
