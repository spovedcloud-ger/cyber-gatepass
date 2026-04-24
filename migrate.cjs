require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_FILE = './db.json';

// Define Schema (Matching server.cjs)
const gatepassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    assets: { type: String, required: true },
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Gatepass = mongoose.model('Gatepass', gatepassSchema);

async function migrate() {
    try {
        console.log('--- STARTING DATABASE MIGRATION ---');
        
        // 1. Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('CONNECTED TO CLOUD DATABASE');

        // 2. Read Local File
        const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const items = localData.items || [];
        const trash = localData.trash || [];

        console.log(`FOUND ${items.length} ACTIVE RECORDS AND ${trash.length} ARCHIVED RECORDS LOCALLY.`);

        // 3. Prepare and Insert Active Items
        if (items.length > 0) {
            const formattedItems = items.map(item => ({
                title: item.title,
                assets: item.assets,
                status: item.status || 'In Process',
                isDeleted: false,
                filedDate: item.timestamp,
                createdAt: new Date(item.id || Date.now())
            }));
            await Gatepass.insertMany(formattedItems);
            console.log('SUCCESS: ACTIVE RECORDS UPLOADED.');
        }

        // 4. Prepare and Insert Trash Items
        if (trash.length > 0) {
            const formattedTrash = trash.map(item => ({
                title: item.title,
                assets: item.assets,
                status: item.status || 'In Process',
                isDeleted: true,
                filedDate: item.timestamp,
                createdAt: new Date(item.id || Date.now())
            }));
            await Gatepass.insertMany(formattedTrash);
            console.log('SUCCESS: ARCHIVED RECORDS UPLOADED.');
        }

        console.log('--- MIGRATION COMPLETE: YOUR CLOUD DATABASE IS SYNCED ---');
    } catch (err) {
        console.error('MIGRATION FAILED:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

migrate();
