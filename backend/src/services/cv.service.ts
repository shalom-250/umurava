import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
import { model } from './gemini.service';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Cloudinary Config - Shared from controller pattern
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateProfessionalCVText = async (candidate: any): Promise<any> => {
    const prompt = `
    You are an expert resume writer specialized in the Rwandan and International job market.
    Your task is to take the following raw candidate data and transform it into a structured, professional CV.
    
    GUIDELINES:
    1. If the candidate name is missing, deduce it from the email: ${candidate.email}.
    2. If experience or education is sparse, intelligently expand it with professional, industry-standard responsibilities and achievements that a candidate with their skills would likely have.
    3. Ensure the tone is professional, achievement-oriented, and tailored for high-end roles in Rwanda.
    4. Include a "Professional Summary" that highlights their top value proposition.
    5. Ensure "Skills" are categorized (Technical, Soft).
    
    CANDIDATE DATA:
    ${JSON.stringify(candidate, null, 2)}
    
    RETURN ONLY A JSON OBJECT with this schema:
    {
      "fullName": "Proper Name",
      "email": "email",
      "phone": "formatted phone",
      "location": "City, Rwanda",
      "headline": "Professional Title",
      "summary": "3-4 sentence professional profile",
      "experience": [{ "role": "string", "company": "string", "period": "string", "description": "string", "achievements": ["string"] }],
      "education": [{ "degree": "string", "institution": "string", "period": "string" }],
      "skills": { "technical": ["string"], "soft": ["string"] },
      "languages": ["string"],
      "references": "Professional references available upon request"
    }
    `;

    try {
        let result;
        try {
            result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
        } catch (mErr: any) {
            console.warn(`[CV Service] Primary model failed, trying fallback... (${mErr.message})`);
            // Manual fallback to Pro if Flash 404s
            const { genAI } = require('./gemini.service');
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            result = await fallbackModel.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
        }

        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error: any) {
        console.error("Gemini CV Synthesis Failed:", error.message);
        // Fallback to basic mapping if all AI models fail
        const fallbackName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email.split('@')[0];

        return {
            fullName: fallbackName,
            email: candidate.email,
            phone: candidate.phone || 'N/A',
            location: candidate.location || 'Kigali, Rwanda',
            headline: candidate.headline || 'Professional',
            summary: candidate.bio || 'Experienced professional looking for new opportunities in Rwanda.',
            experience: (candidate.experience && candidate.experience.length > 0) ? candidate.experience.map((e: any) => ({
                role: e.role || 'Professional',
                company: e.company || 'Company',
                period: `${e.startDate || ''} - ${e.endDate || ''}`,
                description: e.description || '',
                achievements: e.achievements || []
            })) : [],
            education: (candidate.education && candidate.education.length > 0) ? candidate.education.map((e: any) => ({
                degree: e.degree || 'Degree',
                institution: e.institution || 'Institution',
                period: `${e.startYear || ''} - ${e.endYear || ''}`
            })) : [],
            skills: {
                technical: (candidate.skills || []).map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean),
                soft: []
            },
            languages: (candidate.languages || []).map((l: any) => typeof l === 'string' ? l : l.name).filter(Boolean),
            references: "Available upon request"
        };
    }
};

export const createCVBuffer = async (data: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // --- PDF Generation Logic ---

        // Header
        doc.fillColor('#00A1FF').fontSize(24).text(data.fullName.toUpperCase(), { align: 'left' });
        doc.fillColor('#64748B').fontSize(12).text(data.headline, { align: 'left' });
        doc.moveDown(0.5);

        // Contact Info Bar
        doc.fontSize(9).fillColor('#94A3B8');
        doc.text(`${data.email}  |  ${data.phone}  |  ${data.location}`, { align: 'left' });
        doc.moveDown(1);

        // Horizontal Line
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').lineWidth(1).stroke();
        doc.moveDown(1.5);

        // Profile Summary
        doc.fillColor('#0F172A').fontSize(14).text('PROFESSIONAL PROFILE', { underline: false });
        doc.moveDown(0.5);
        doc.fillColor('#334155').fontSize(10).text(data.summary, { align: 'justify', lineGap: 2 });
        doc.moveDown(1.5);

        // Experience
        doc.fillColor('#0F172A').fontSize(14).text('WORK EXPERIENCE');
        doc.moveDown(0.8);

        if (data.experience && data.experience.length > 0) {
            data.experience.forEach((exp: any) => {
                doc.fillColor('#1E293B').fontSize(11).text(exp.role, { continued: true }).fillColor('#64748B').text(` at ${exp.company}`);
                doc.fillColor('#94A3B8').fontSize(9).text(exp.period);
                doc.moveDown(0.3);
                doc.fillColor('#334155').fontSize(10).text(exp.description, { lineGap: 1 });

                if (exp.achievements && exp.achievements.length > 0) {
                    doc.moveDown(0.2);
                    exp.achievements.forEach((ach: string) => {
                        doc.fillColor('#334155').fontSize(10).text(`• ${ach}`, { indent: 10 });
                    });
                }
                doc.moveDown(1);
            });
        } else {
            doc.font('Helvetica-Oblique').fillColor('#64748B').fontSize(10).text('Experience details are currently being updated.');
            doc.font('Helvetica');
            doc.moveDown(1);
        }

        // Education
        doc.fillColor('#0F172A').fontSize(14).text('EDUCATION');
        doc.moveDown(0.8);
        data.education.forEach((edu: any) => {
            doc.fillColor('#1E293B').fontSize(11).text(edu.degree);
            doc.fillColor('#64748B').fontSize(10).text(edu.institution);
            doc.fillColor('#94A3B8').fontSize(9).text(edu.period);
            doc.moveDown(0.8);
        });

        // Skills
        doc.fillColor('#0F172A').fontSize(14).text('SKILLS');
        doc.moveDown(0.8);

        if (data.skills.technical && data.skills.technical.length > 0) {
            doc.fillColor('#475569').fontSize(10).text('Technical: ', { continued: true }).fillColor('#334155').text(data.skills.technical.join(', '));
        }
        if (data.skills.soft && data.skills.soft.length > 0) {
            doc.moveDown(0.3);
            doc.fillColor('#475569').fontSize(10).text('Soft Skills: ', { continued: true }).fillColor('#334155').text(data.skills.soft.join(', '));
        }
        doc.moveDown(1.5);

        // Languages
        if (data.languages && data.languages.length > 0) {
            doc.fillColor('#0F172A').fontSize(12).text('LANGUAGES');
            doc.moveDown(0.5);
            doc.fillColor('#334155').fontSize(10).text(data.languages.join(', '));
            doc.moveDown(1);
        }

        // Footer
        doc.fontSize(8).fillColor('#94A3B8').text(data.references, { align: 'center', baseline: 'bottom' });

        doc.end();
    });
};

export const uploadCVToCloudinary = async (buffer: Buffer, fileName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                folder: "umurava_synthetic_cvs",
                public_id: fileName.replace(/[^a-z0-9]/gi, '_') + "_" + Date.now(),
                format: "pdf"
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result?.secure_url || "");
            }
        );
        uploadStream.end(buffer);
    });
};
