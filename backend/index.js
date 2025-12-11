// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// allow setting frontend origin via env (set this in Render: FRONTEND_URL=https://<your-vercel>.vercel.app)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'https://fubotics-assignment-lakshmi-prabha.vercel.app';

// CORS config (explicit)
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// apply CORS middleware and handle preflight
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// simple request logger to help debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url} - origin: ${req.get('Origin')}`);
  next();
});

// Health endpoint required by Render's health check
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// read messages file (create file if not exist)
async function readMessages() {
  try {
    const txt = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    await fs.writeFile(MESSAGES_FILE, '[]', 'utf8');
    return [];
  }
}

async function writeMessages(msgs) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf8');
}

// Simple mock AI reply — replace with real AI call later
async function getAIReply(userText) {
  return `Echo: ${userText}`;
}

// GET all messages
app.get('/api/messages', async (req, res) => {
  try {
    const msgs = await readMessages();
    res.json(msgs);
  } catch (err) {
    console.error('Read messages error:', err);
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

// POST a new user message
app.post('/api/messages', async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!author || !text) return res.status(400).json({ error: 'author and text required' });

    const msgs = await readMessages();
    const userMsg = { id: Date.now() + '-u', author, text, timestamp: new Date().toISOString() };
    msgs.push(userMsg);

    const aiText = await getAIReply(text);
    const aiMsg = { id: Date.now() + '-a', author: 'ai', text: aiText, timestamp: new Date().toISOString() };
    msgs.push(aiMsg);

    await writeMessages(msgs);
    res.json({ user: userMsg, ai: aiMsg });
  } catch (err) {
    console.error('Post message error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

