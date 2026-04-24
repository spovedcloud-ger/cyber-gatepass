require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('CYBER-DB: CONNECTED TO MONGODB'))
    .catch(err => console.error('CYBER-DB: CONNECTION ERROR', err));

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
        const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET trash items
app.get('/api/trash', async (req, res) => {
    try {
        const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST new item
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Gatepass(req.body);
        await newItem.save();
        res.json(newItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH update item
app.patch('/api/items/:id', async (req, res) => {
    try {
        const updated = await Gatepass.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE (Wipe) item
app.delete('/api/items/:id', async (req, res) => {
    try {
        await Gatepass.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = app;
