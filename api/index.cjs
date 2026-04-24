const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    if (!MONGODB_URI) throw new Error('MONGODB_URI_MISSING');
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
}

// Define Schema
const gatepassSchema = new mongoose.Schema({
    title: String,
    assets: String,
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: String,
    createdAt: { type: Date, default: Date.now }
});

const Gatepass = mongoose.models.Gatepass || mongoose.model('Gatepass', gatepassSchema);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectDB();

        // 1. Diagnostic Test
        if (req.url.includes('test')) {
            return res.status(200).json({ status: 'CLASSIC_ALIVE', db: isConnected });
        }

        const url = req.url;

        // 2. Trash Logic
        if (url.includes('trash')) {
            const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
            return res.status(200).json(items);
        }

        // 3. Items Logic
        if (url.includes('items')) {
            // GET
            if (req.method === 'GET') {
                const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
                return res.status(200).json(items);
            }
            
            // POST
            if (req.method === 'POST') {
                const newItem = new Gatepass(req.body);
                await newItem.save();
                return res.status(201).json(newItem);
            }

            // PATCH / DELETE (ID-based)
            const id = url.split('/').pop();
            
            if (req.method === 'PATCH') {
                const updated = await Gatepass.findByIdAndUpdate(id, req.body, { new: true });
                return res.status(200).json(updated);
            }

            if (req.method === 'DELETE') {
                await Gatepass.findByIdAndDelete(id);
                return res.status(200).json({ success: true });
            }
        }

        res.status(404).json({ error: 'NOT_FOUND', url });
    } catch (err) {
        res.status(500).json({ error: 'SERVER_CRASH', message: err.message });
    }
};
