import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const exportDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackaton_db');
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db!.collections();
        const exportDir = path.resolve('../database_seed');

        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }

        for (let collection of collections) {
            const documents = await collection.find({}).toArray();
            const collectionName = collection.collectionName;

            const filePath = path.join(exportDir, `${collectionName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
            console.log(`Exported ${documents.length} documents from ${collectionName} to ${filePath}`);
        }

        console.log('Database export completed successfully!');
    } catch (error) {
        console.error('Error exporting database:', error);
    } finally {
        await mongoose.disconnect();
    }
};

exportDatabase();
