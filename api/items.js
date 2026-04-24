const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
}

const Gatepass = mongoose.models.Gatepass || mongoose.model('Gatepass', new mongoose.Schema({
    title: String,
    assets: String,
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: String,
    createdAt: { type: Date, default: Date.now }
}));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectDB();
        
        if (req.method === 'GET') {
            const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
            return res.status(200).json(items);
        }

        if (req.method === 'POST') {
            const item = await Gatepass.create(req.body);
            return res.status(201).json(item);
        }

        if (req.method === 'PATCH') {
            // In Vercel, the ID is often passed in req.query
            const { id } = req.query;
            const item = await Gatepass.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).json(item);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            await Gatepass.findByIdAndDelete(id);
            return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    } catch (err) {
        res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};
