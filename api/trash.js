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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectDB();
        const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};
