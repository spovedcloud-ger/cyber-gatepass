import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'SERVER_IS_ALIVE_MODERN', 
        has_uri: !!MONGODB_URI,
        time: new Date().toISOString()
    });
});

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI) throw new Error('MONGODB_URI_MISSING');
  cachedDb = await mongoose.connect(MONGODB_URI);
  return cachedDb;
}

const gatepassSchema = new mongoose.Schema({
    title: String,
    assets: String,
    status: { type: String, default: 'In Process' },
    isDeleted: { type: Boolean, default: false },
    filedDate: String,
    createdAt: { type: Date, default: Date.now }
});

const Gatepass = mongoose.models.Gatepass || mongoose.model('Gatepass', gatepassSchema);

app.get('/api/items', async (req, res) => {
    try {
        await connectToDatabase();
        const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/trash', async (req, res) => {
    try {
        await connectToDatabase();
        const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/items', async (req, res) => {
    try {
        await connectToDatabase();
        const newItem = new Gatepass(req.body);
        await newItem.save();
        res.json(newItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/items/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const updated = await Gatepass.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        await connectToDatabase();
        await Gatepass.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default app;
