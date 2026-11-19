/**
 * AeroPulse AI — Vercel Serverless Function: /api/status
 */

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  res.writeHead(200);
  res.end(JSON.stringify({
    status: 'active',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    serverKeyConfigured: !!process.env.GEMINI_API_KEY,
    secureHeaderAuth: true,
    authMethod: 'x-goog-api-key-header',
    deployment: 'vercel-serverless'
  }));
}
