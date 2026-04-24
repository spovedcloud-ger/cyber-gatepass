const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// IMPORTANT: Do NOT use dotenv in Vercel. Vercel injects environment variables directly.
const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

// Singleton connection to prevent multiple connections in serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  if (!MONGODB_URI) {
    throw new Error('CRITICAL: MONGODB_URI is missing from Vercel Environment Variables');
  }

  // Use a promise-based cache to prevent multiple simultaneous connection attempts
  cachedDb = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  }).then(m => m);

  return cachedDb;
}

// Define Schema
const gatepassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    assets: { type: String, required: true },
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Gatepass = mongoose.models.Gatepass || mongoose.model('Gatepass', gatepassSchema);

// GET all items
app.get('/api/items', async (req, res) => {
    try {
        await connectToDatabase();
        const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) { 
        res.status(500).json({ error: 'FETCH_ERROR', message: err.message }); 
    }
});

// GET trash items
app.get('/api/trash', async (req, res) => {
    try {
        await connectToDatabase();
        const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) { 
        res.status(500).json({ error: 'TRASH_FETCH_ERROR', message: err.message }); 
    }
});

// POST new item
app.post('/api/items', async (req, res) => {
    try {
        await connectToDatabase();
        const newItem = new Gatepass(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) { 
        res.status(500).json({ error: 'POST_ERROR', message: err.message }); 
    }
});

// PATCH update item
app.patch('/api/items/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const updated = await Gatepass.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) { 
        res.status(500).json({ error: 'PATCH_ERROR', message: err.message }); 
    }
});

// DELETE (Wipe) item
app.delete('/api/items/:id', async (req, res) => {
    try {
        await connectToDatabase();
        await Gatepass.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (err) { 
        res.status(500).json({ error: 'DELETE_ERROR', message: err.message }); 
    }
});

module.exports = app;
