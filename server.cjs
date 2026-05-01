require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ CYBER-DB: SUCCESSFUL CONNECTION TO [cyber_gatepass_dev]');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 SANDBOX SERVER ACTIVE: http://localhost:${PORT}`);
            console.log(`📡 MONITORING ISOLATED TRAFFIC...`);
        });
    })
    .catch(err => {
        console.error('❌ CYBER-DB: FATAL CONNECTION ERROR');
        console.error(err.message);
    });

// Define Schema (Aligned with Cloud)
const gatepassSchema = new mongoose.Schema({
    title: String,
    assets: String,
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: String,
    createdAt: { type: Date, default: Date.now }
});

const Gatepass = mongoose.models.Gatepass || mongoose.model('Gatepass', gatepassSchema);

// Middleware for logging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// GET all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { 
        console.error('GET ERROR:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// GET trash items
app.get('/api/trash', async (req, res) => {
    try {
        const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { 
        console.error('TRASH ERROR:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// POST new item
app.post('/api/items', async (req, res) => {
    try {
        console.log('📥 RECEIVING NEW RECORD:', req.body.title);
        const newItem = new Gatepass(req.body);
        await newItem.save();
        console.log('✨ RECORD SAVED TO DEV DATABASE');
        res.json(newItem);
    } catch (err) { 
        console.error('POST ERROR:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// PATCH update item
app.patch('/api/items', async (req, res) => {
    try {
        const id = req.query.id;
        console.log('✏️ EDITING RECORD:', id);
        const updated = await Gatepass.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (err) { 
        console.error('PATCH ERROR:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// DELETE (Wipe) item
app.delete('/api/items', async (req, res) => {
    try {
        const id = req.query.id;
        console.log('🧨 WIPING RECORD:', id);
        await Gatepass.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) { 
        console.error('DELETE ERROR:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});
