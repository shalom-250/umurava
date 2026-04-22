const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

const dir = path.join(__dirname, '..', 'test-cvs');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const cvContentText = `Full Name: Alex Johnson
Email: alex.johnson@example.com
Phone: +250 788 123 456
Location: Kigali, Rwanda
Nationality: Rwandan
Date of Birth: 15 March 1995

Personal Statement
I am a highly motivated software engineer with over 5 years of experience building scalable web applications. My goal is to leverage advanced AI technologies to solve complex business problems.

Education
University of Rwanda, Kigali
Bachelor of Science in Software Engineering
2014 - 2018
Achievements: Graduated with First Class Honors.

Work Experience
Senior Frontend Developer
Tech Innovators Ltd, Kigali
January 2019 - Present
- Led a team of 5 engineers to rebuild the core dashboard architecture in Next.js.
- Improved application performance by 40% and reduced technical debt.
Technologies: React, Next.js, Node.js, Typescript.

Skills
Technical: React (Expert), Node.js (Intermediate), Typescript (Expert), GraphQA (Intermediate).
Soft: Leadership, Communication, Agile Methadologies.

Projects
Candidate Matching System
- Built an AI-powered resume screening tool using OpenAI APIs and Node.js.
Technologies: Node.js, Express, MongoDB.
Role: Lead Developer.

Certifications
AWS Certified Cloud Practitioner - AWS (2021)
Certified Scrum Master - Scrum Alliance (2020)

Languages
English (Fluent)
Kinyarwanda (Native)
French (Intermediate)

References
Available upon request.

Awards
Best Employee of the Year - Tech Innovators Ltd - 2022
Description: Awarded for outstanding contribution to the frontend architecture overhaul.

Social Presence
LinkedIn: linkedin.com/in/alexjohnson
GitHub: github.com/alexjohnsondev
Website: alexjohnson.dev`;

// 1. Generate PDF
function generatePDF() {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        const pdfStream = fs.createWriteStream(path.join(dir, 'alex_johnson_perfect_cv.pdf'));
        doc.pipe(pdfStream);

        doc.fontSize(20).text("Alex Johnson", { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(cvContentText);

        doc.end();
        pdfStream.on('finish', resolve);
    });
}

// 2. Generate DOCX
async function generateDOCX() {
    const lines = cvContentText.split('\n');
    const paragraphs = lines.map(line => {
        return new Paragraph({
            children: [new TextRun({ text: line, size: 24 })] // size is half-points, so 24 = 12pt
        });
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(dir, 'alex_johnson_perfect_cv.docx'), buffer);
}

// 3. Generate CSV
function generateCSV() {
    const csvContent = `Full Name,Email,Phone,Skills,Experience
Alex Johnson,alex.johnson@example.com,+250 788 123 456,"React, Node.js, Typescript",5 years experience as Senior Frontend Developer
Alice Smith,alice.smith@example.com,+250 788 000 111,"Python, Django, AWS",3 years as Backend Developer`;
    fs.writeFileSync(path.join(dir, 'alex_johnson_perfect_cv.csv'), csvContent);
}

// // Generate TXT
function generateTXT() {
    fs.writeFileSync(path.join(dir, 'alex_johnson_perfect_cv.txt'), cvContentText);
}

async function main() {
    console.log('Generating files...');
    await generatePDF();
    console.log('PDF generated.');
    await generateDOCX();
    console.log('DOCX generated.');
    generateCSV();
    console.log('CSV generated.');
    generateTXT();
    console.log('TXT generated.');
    console.log(`All files saved to: ${dir}`);
}

main().catch(console.error);
