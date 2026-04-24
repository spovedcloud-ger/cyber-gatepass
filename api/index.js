require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

// Global connection state
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from environment variables');
  }

  // Set options to handle serverless timeouts
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  };

  cachedConnection = await mongoose.connect(MONGODB_URI, opts);
  return cachedConnection;
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

// Middleware for DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('DB ERROR:', error);
    res.status(500).json({ error: 'DATABASE_CONNECTION_ERROR', details: error.message });
  }
});

// Routes supporting both prefixed and unprefixed paths
const registerRoutes = (pathPrefix = '') => {
  app.get(`${pathPrefix}/items`, async (req, res) => {
      try {
          const items = await Gatepass.find({ isDeleted: false }).sort({ createdAt: -1 });
          res.json(items);
      } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get(`${pathPrefix}/trash`, async (req, res) => {
      try {
          const items = await Gatepass.find({ isDeleted: true }).sort({ createdAt: -1 });
          res.json(items);
      } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post(`${pathPrefix}/items`, async (req, res) => {
      try {
          const newItem = new Gatepass(req.body);
          await newItem.save();
          res.json(newItem);
      } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.patch(`${pathPrefix}/items/:id`, async (req, res) => {
      try {
          const updated = await Gatepass.findByIdAndUpdate(req.params.id, req.body, { new: true });
          res.json(updated);
      } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete(`${pathPrefix}/items/:id`, async (req, res) => {
      try {
          await Gatepass.findByIdAndDelete(req.params.id);
          res.json({ success: true });
      } catch (err) { res.status(500).json({ error: err.message }); }
  });
};

// Support both /api/items and /items
registerRoutes('/api');
registerRoutes('');

module.exports = app;
