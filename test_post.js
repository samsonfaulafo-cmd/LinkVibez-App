const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

(async () => {
  try {
    // First, check what key we have
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using API key (first 20 chars):', apiKey.substring(0, 20));

    // Try listing models to see what's available
    const listRes = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { 'x-goog-api-key': apiKey },
    });
    const listData = await listRes.json();
    if (listData.models) {
      console.log('\nAvailable models:');
      listData.models.slice(0, 5).forEach(m => {
        console.log(`  ${m.name} - Methods: ${m.supportedGenerationMethods?.join(', ')}`);
      });
    }

    // Now try the API call
    const res = await fetch('http://127.0.0.1:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Test from assistant' }),
    });
    console.log('\nSTATUS', res.status);
    const text = await res.text();
    console.log('BODY', text);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
