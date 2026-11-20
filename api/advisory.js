/**
 * AeroPulse AI — Vercel Serverless Function: /api/advisory
 * Model: Google Gemini 1.5 Flash (Production Developer API)
 * Security: Secure Header Authentication (x-goog-api-key)
 * Modular Architecture: Delegates inference to shared advisoryService.
 */

import https from 'node:https';
import {
  sanitizeForLog as serviceSanitize,
  generateDeterministicAdvisory as serviceGenerateAdvisory,
  callGeminiDeveloperApi as serviceCallGemini
} from '../src/advisoryService.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Sanitizes input strings by redacting any sensitive API key patterns.
 *
 * @param {string} str - Raw string to sanitize.
 * @returns {string} Sanitized string with API keys masked.
 */
function sanitizeForLog(str) {
  return serviceSanitize(str, GEMINI_API_KEY || process.env.GEMINI_API_KEY || '');
}

/**
 * Generates a deterministic, rule-based environmental health advisory fallback.
 *
 * @param {Object} payload - User query and localized telemetry parameters.
 * @returns {Object} Structured advisory response adhering to the advisory schema.
 */
function generateDeterministicAdvisory(payload) {
  return serviceGenerateAdvisory(payload, MODEL);
}

/**
 * Executes a secure HTTP POST request to the Google Gemini Developer API.
 * Uses official x-goog-api-key header authentication.
 *
 * @param {Object} payload - User context and telemetry parameters.
 * @returns {Promise<Object>} Parsed JSON response from Gemini.
 */
function callGeminiDeveloperApi(payload) {
  const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!key) return Promise.reject(new Error('NO_API_KEY_CONFIGURED'));
  // Enforces x-goog-api-key header authentication
  const headers = { 'x-goog-api-key': key };
  return serviceCallGemini(payload, MODEL, key);
}

/**
 * Serverless HTTP Handler for Gemini Advisory Proxy.
 *
 * @param {import('node:http').IncomingMessage} req - Incoming HTTP request stream.
 * @param {import('node:http').ServerResponse} res - Server HTTP response stream.
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse Body
  let payload = req.body || {};
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
  } else if (!req.body) {
    await new Promise((resolve) => {
      let str = '';
      req.on('data', chunk => { str += chunk; });
      req.on('end', () => {
        try { payload = JSON.parse(str || '{}'); } catch (_) { payload = {}; }
        resolve();
      });
    });
  }

  // Input validation
  if (typeof payload !== 'object' || payload === null) payload = {};

  try {
    const liveAiResult = await callGeminiDeveloperApi(payload);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(liveAiResult));
  } catch (err) {
    const fallback = generateDeterministicAdvisory(payload);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fallback));
  }
}
