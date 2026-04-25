import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from '../models/Candidate';
import { generateProfessionalCVText, createCVBuffer, uploadCVToCloudinary } from '../services/cv.service';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('🚀 Connected to MongoDB');

        const candidatesToProcess = await Candidate.find({
            $or: [
                { resumeUrl: { $exists: false } },
                { resumeUrl: '' },
                { resumeUrl: null }
            ]
        });

        console.log(`Found ${candidatesToProcess.length} candidates needing CVs.`);

        for (let i = 0; i < candidatesToProcess.length; i++) {
            const cand = candidatesToProcess[i];
            const displayName = cand.firstName ? `${cand.firstName} ${cand.lastName}` : cand.email;

            console.log(`[${i + 1}/${candidatesToProcess.length}] Processing: ${displayName}...`);

            try {
                // 1. Generate Content
                const cvData = await generateProfessionalCVText(cand);

                // Update candidate names if they were missing
                if (!cand.firstName && cvData.fullName) {
                    const parts = cvData.fullName.split(' ');
                    cand.firstName = parts[0];
                    cand.lastName = parts.slice(1).join(' ');
                }

                // 2. Create PDF
                const buffer = await createCVBuffer(cvData);

                // 3. Upload to Cloudinary
                const fileName = `${cvData.fullName.replace(/\s+/g, '_')}_Resume`;
                const cloudinaryUrl = await uploadCVToCloudinary(buffer, fileName);

                // 4. Update Database
                cand.resumeUrl = cloudinaryUrl;
                if (cvData.headline && !cand.headline) cand.headline = cvData.headline;

                await cand.save();
                console.log(` ✅ Success: ${cloudinaryUrl}`);

                // Small delay to avoid AI rate limits if necessary
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 1000));

            } catch (err: any) {
                console.error(` ❌ Failed for ${displayName}:`, err.message);
            }
        }

        console.log('✨ All candidates processed!');
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

run();
