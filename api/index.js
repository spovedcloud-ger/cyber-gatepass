import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI) throw new Error('MONGODB_URI_MISSING_IN_CLOUD');
  
  cachedDb = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
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

export default async function handler(req, res) {
  // Add CORS headers manually for the native handler
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectToDatabase();

    // 1. Health Check
    if (req.url === '/api/test' || req.url.includes('test')) {
      return res.status(200).json({ status: 'NATIVE_ALIVE', uri_found: !!MONGODB_URI });
    }

    // 2. Main Logic based on URL and Method
    const url = req.url;

    if (url.includes('/api/trash')) {
      const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
      return res.status(200).json(items);
    }

    if (url.includes('/api/items')) {
      if (req.method === 'GET') {
        const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json(items);
      }
      
      if (req.method === 'POST') {
        const newItem = new Gatepass(req.body);
        await newItem.save();
        return res.status(201).json(newItem);
      }
      
      if (req.method === 'PATCH') {
        // Extract ID from URL (e.g., /api/items/123)
        const id = url.split('/').pop();
        const updated = await Gatepass.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updated);
      }

      if (req.method === 'DELETE') {
        const id = url.split('/').pop();
        await Gatepass.findByIdAndDelete(id);
        return res.status(200).json({ success: true });
      }
    }

    res.status(404).json({ error: 'PATH_NOT_FOUND', url });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_CRASH', message: err.message });
  }
}
