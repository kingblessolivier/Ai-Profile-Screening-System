require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing Gemini API...');
    console.log('✓ API Key loaded:', apiKey.substring(0, 10) + '...');
    
    const client = new GoogleGenAI({ apiKey });
    console.log('✓ GoogleGenAI client initialized');
    
    console.log('🔄 Sending test request to Gemini...');
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Say "Gemini API is working perfectly" in exactly 5 words' }] 
      }],
    });
    
    // Extract text from response
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || response.response?.text?.() || response.text;
    console.log('✓ Response received:', text);
    console.log('\n✅ Gemini API is working properly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401')) console.error('  → Invalid API key');
    if (error.message.includes('403')) console.error('  → Access denied');
    if (error.message.includes('429')) console.error('  → Rate limit exceeded');
    if (error.message.includes('503')) console.error('  → Service unavailable');
  }
}

testGemini();
