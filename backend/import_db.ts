import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const importDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackaton_db');
        console.log('Connected to MongoDB for import');

        const seedDir = path.resolve('../database_seed');

        if (!fs.existsSync(seedDir)) {
            console.error(`Seed directory not found at ${seedDir}. Cannot import.`);
            return;
        }

        const files = fs.readdirSync(seedDir).filter(file => file.endsWith('.json'));

        for (const file of files) {
            const collectionName = file.replace('.json', '');
            const filePath = path.join(seedDir, file);

            const rawData = fs.readFileSync(filePath, 'utf-8');
            const documents = JSON.parse(rawData);

            if (documents.length > 0) {
                const collection = mongoose.connection.collection(collectionName);

                // Clear existing data to avoid duplicate key errors during import
                await collection.deleteMany({});

                // Convert string representations of _id back to ObjectId
                const processedDocs = documents.map((doc: any) => {
                    if (doc._id && typeof doc._id === 'string') {
                        doc._id = new mongoose.Types.ObjectId(doc._id);
                    }
                    // Handle reference IDs recursively if necessary (simplified here)
                    if (doc.jobId && typeof doc.jobId === 'string') doc.jobId = new mongoose.Types.ObjectId(doc.jobId);
                    if (doc.candidateId && typeof doc.candidateId === 'string') doc.candidateId = new mongoose.Types.ObjectId(doc.candidateId);
                    if (doc.creator && typeof doc.creator === 'string') doc.creator = new mongoose.Types.ObjectId(doc.creator);

                    return doc;
                });

                await collection.insertMany(processedDocs);
                console.log(`Successfully imported ${processedDocs.length} documents into ${collectionName}`);
            } else {
                console.log(`Skipped ${collectionName} (no documents)`);
            }
        }

        console.log('Database import completed successfully!');
    } catch (error) {
        console.error('Error importing database:', error);
    } finally {
        await mongoose.disconnect();
    }
};

importDatabase();
