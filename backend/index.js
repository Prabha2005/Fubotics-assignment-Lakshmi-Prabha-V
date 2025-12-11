// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

app.use(cors());
app.use(express.json());

// read messages file (create file if not exist)
async function readMessages() {
  try {
    const txt = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    // if file not exists create
    await fs.writeFile(MESSAGES_FILE, '[]', 'utf8');
    return [];
  }
}

async function writeMessages(msgs) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf8');
}

// Simple mock AI reply — replace with real AI call later
async function getAIReply(userText) {
  // simple echo (OK for demo). Replace this function to call OpenAI or other AI.
  return `Echo: ${userText}`;
}

// GET all messages
app.get('/api/messages', async (req, res) => {
  const msgs = await readMessages();
  res.json(msgs);
});

// POST a new user message, then add AI reply
app.post('/api/messages', async (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'author and text required' });

  const msgs = await readMessages();
  const userMsg = { id: Date.now() + '-u', author, text, timestamp: new Date().toISOString() };
  msgs.push(userMsg);

  // get AI reply
  const aiText = await getAIReply(text);
  const aiMsg = { id: Date.now() + '-a', author: 'ai', text: aiText, timestamp: new Date().toISOString() };
  msgs.push(aiMsg);

  await writeMessages(msgs);
  res.json({ user: userMsg, ai: aiMsg });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
