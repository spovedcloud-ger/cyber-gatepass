import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Connection Cache
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    if (!MONGODB_URI) throw new Error('MONGODB_URI_MISSING');
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
}

// Schema
const Gatepass = mongoose.models.Gatepass || mongoose.model('Gatepass', new mongoose.Schema({
    title: String,
    assets: String,
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: String,
    createdAt: { type: Date, default: Date.now }
}));

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectDB();

        // Heartbeat
        if (req.url.includes('test')) {
            return res.status(200).json({ status: 'ONLINE', db: isConnected });
        }

        const url = req.url;

        // Trash
        if (url.includes('trash')) {
            const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
            return res.status(200).json(items);
        }

        // Items
        if (url.includes('items')) {
            const id = url.split('/').pop();

            if (req.method === 'GET') {
                const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
                return res.status(200).json(items);
            }
            if (req.method === 'POST') {
                const item = await Gatepass.create(req.body);
                return res.status(201).json(item);
            }
            if (req.method === 'PATCH') {
                const item = await Gatepass.findByIdAndUpdate(id, req.body, { new: true });
                return res.status(200).json(item);
            }
            if (req.method === 'DELETE') {
                await Gatepass.findByIdAndDelete(id);
                return res.status(200).json({ success: true });
            }
        }

        res.status(404).json({ error: 'NOT_FOUND' });
    } catch (err) {
        res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
}
