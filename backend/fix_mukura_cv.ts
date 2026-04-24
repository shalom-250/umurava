import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Candidate from './src/models/Candidate';
import Application from './src/models/Application';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
    api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
});

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        const filePath = path.resolve('mukura_cv.pdf');

        console.log(`Uploading ${filePath} to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            public_id: `Mukura_John_CV_${Date.now()}`,
            folder: "umurava_resumes",
        });

        const cloudUrl = uploadResult.secure_url;
        console.log(`Uploaded! Cloud URL: ${cloudUrl}`);

        const candidate = await Candidate.findOne({ email: 'mukura@umurava.africa' });
        if (!candidate) {
            console.log("Candidate Mukura John not found!");
            process.exit(0);
        }

        candidate.resumeUrl = cloudUrl;
        await candidate.save();
        console.log("Candidate record updated.");

        const applications = await Application.find({ candidateId: candidate._id });
        for (const app of applications) {
            let modified = false;
            for (let i = 0; i < app.attachments.length; i++) {
                if (app.attachments[i].name === 'Resume' || app.attachments[i].url.includes('upload')) {
                    app.attachments[i].url = cloudUrl;
                    modified = true;
                }
            }
            if (modified) {
                await app.save();
                console.log(`Application ${app._id} updated.`);
            }
        }

        console.log("Done successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
