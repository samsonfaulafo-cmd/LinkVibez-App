const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// Prefer GEMINI_API_KEY from the root .env; fall back to the frontend .env VITE_GEMINI_API_KEY
if (!process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  const envPath = path.join(__dirname, 'linkvibez-app', '.env');
  try {
    require('dotenv').config({ path: envPath });
    console.log('Loaded env from', envPath);
  } catch (e) {
    console.warn('Could not load env from', envPath);
  }
}
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Proxy endpoint for Gemini API calls (now named /api/analyze)
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    // Ensure API key is loaded at request time (fallback)
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || (() => {
      try {
        const dotenv = require('dotenv');
        const path = require('path');
        const envPath = path.join(__dirname, 'linkvibez-app', '.env');
        dotenv.config({ path: envPath });
        return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      } catch (e) {
        return undefined;
      }
    })();

    if (!apiKey) {
      return res.status(400).json({ error: 'API key not configured' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use the stable generateContent endpoint with an available model
    const modelToUse = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent`;
    console.log('Calling Gemini URL:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug route: only indicates whether API key is present (does not return the key)
app.get('/api/key-status', (req, res) => {
  res.json({ configured: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY) });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
