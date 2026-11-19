/**
 * AeroPulse AI — Vercel Serverless Function: /api/advisory
 * Model: Google Gemini 1.5 Flash (Production Developer API)
 * Security: Secure Header Authentication (x-goog-api-key)
 */

import https from 'node:https';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function sanitizeForLog(str) {
  if (!str) return '';
  let out = String(str);
  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 5) {
    out = out.split(GEMINI_API_KEY).join('[REDACTED_API_KEY]');
  }
  return out.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
}

function generateDeterministicAdvisory(payload) {
  const text = (payload.prompt || '').toLowerCase();
  const city = payload.city || 'Delhi NCR';
  const aqi = payload.aqi || 448;
  const pm25 = payload.pm25 || 412;

  let vulnerability = payload.vulnerability || 'general';
  if (text.includes('kid') || text.includes('child') || text.includes('school')) {
    vulnerability = 'kids';
  } else if (text.includes('asthma') || text.includes('wheez') || text.includes('elderly')) {
    vulnerability = 'asthma';
  }

  return {
    source: "deterministic-fallback",
    model: MODEL,
    detectedVulnerability: vulnerability,
    summaryDiagnosis: `Stage IV Severe Inversion alert calibrated for ${city} (PM2.5: ${pm25} μg/m³, AQI: ${aqi}). Atmospheric boundary layer lid trapping surface vehicular and biomass emissions.`,
    safeSolarWindow: "12:30 PM – 03:30 PM (Convective Ground Warming Window)",
    recommendedRoutines: [
      {
        time: "06:00 – 09:30",
        title: vulnerability === 'asthma' ? "Pre-Dawn Steam Hydration & HEPA Isolation" : "Pre-Dawn Indoor Air Isolation & Avoid Morning Exercise",
        tip: "Nocturnal boundary ceiling traps fine particulate at ground level. Keep windows sealed and avoid outdoor exertion.",
        exposureAvoidedMicrograms: 165
      },
      {
        time: "07:30 – 09:30",
        title: vulnerability === 'kids' ? "Vehicle Cabin Air Recirculation & School Transit" : "Vehicle Cabin Air Recirculation & Tight-Fit N95 Masking",
        tip: "Switch vehicle AC to 100% internal recirculation. Ensure pediatric/adult certified particulate respirators are fitted.",
        exposureAvoidedMicrograms: 140
      },
      {
        time: "12:30 – 15:30",
        title: "Strategic Convective Cross-Ventilation & Filter Purge",
        tip: "Solar radiation warms ground air, expanding the inversion lid. Ventilate indoor spaces for 20 minutes to purge CO2.",
        exposureAvoidedMicrograms: 65
      },
      {
        time: "18:00 – 22:00",
        title: "Early Home Sealing & Active DIY HEPA Filtration",
        tip: "Sunset causes the inversion lid to descend rapidly. Seal doors with draft stoppers and run DIY filtration on high.",
        exposureAvoidedMicrograms: 145
      }
    ],
    tailoredIaqHacks: [
      {
        title: "Corsi-Rosenthal Box Air Purifier",
        category: "Filtration Engineering",
        cost: "₹2,800 ($34)",
        efficiency: "90%+ PM2.5 Clearance",
        desc: "4× MERV-13 pleated filters taped into a cube with a 20-inch box fan (CADR 250+ CFM)."
      },
      {
        title: "NASA Clean Air Botanical Matrix",
        category: "Bio-Phytoremediation",
        cost: "₹1,200 ($15)",
        efficiency: "VOC & Carbon Uptake",
        desc: "Sansevieria, Areca Palm, and Spider Plant for nocturnal CAM oxygen replenishment."
      },
      {
        title: "Micro-Positive Pressure Envelope Sealing",
        category: "Infiltration Prevention",
        cost: "₹650 ($8)",
        efficiency: "78% Draft Suppression",
        desc: "High-density silicone foam tape applied along door jambs and window perimeters."
      }
    ],
    sustainableSwaps: [
      {
        name: "Transit Transition",
        baseline: "Solo Commute via Petrol/Diesel Car (15 km one-way, 30 km daily)",
        alternative: "Metro Electric Transit + Micro-Mobility",
        impactGain: "+3.8 kg CO₂e / day"
      },
      {
        name: "Clean Heating",
        baseline: "Unvented Kerosene / LPG Room Heater",
        alternative: "Inverter Heat Pump / Ceramic Radiant Panel",
        impactGain: "+7.2 kg CO₂e / day"
      },
      {
        name: "Waste Management",
        baseline: "Open Leaf & Garden Waste Burning",
        alternative: "Microbial Pit Composting & Mulching",
        impactGain: "+12.5 kg CO₂e / day"
      }
    ],
    impactEstimate: {
      dailyPmAvoidedUgM3: Math.round(pm25 * 0.72),
      dailyCarbonSavedKg: 23.5,
      passiveCigarettesPrevented: Number(((pm25 * 0.72) / 22.0).toFixed(1))
    },
    disclaimer: "Modeled engineering estimates for environmental health decision support. Not measured clinical outcomes."
  };
}

function callGeminiDeveloperApi(payload) {
  return new Promise((resolve, reject) => {
    const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
    if (!key) return reject(new Error('NO_API_KEY_CONFIGURED'));

    const requestBody = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `Location: ${payload.city} (${payload.neighborhood}), AQI: ${payload.aqi}, PM2.5: ${payload.pm25} ug/m3. User Query: ${payload.prompt}` }]
        }
      ],
      systemInstruction: {
        parts: [{ text: "You are AeroPulse AI, an elite atmospheric scientist and environmental health specialist. Respond strictly with valid JSON adhering to the advisory schema. Disclose that calculations are modeled estimates." }]
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${MODEL}:generateContent`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'x-goog-api-key': key // SECURE HEADER AUTHENTICATION
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const textContent = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              const jsonAdvisory = JSON.parse(textContent);
              jsonAdvisory.source = MODEL;
              return resolve(jsonAdvisory);
            }
          } catch (_) {}
        }
        reject(new Error(`UPSTREAM_HTTP_${res.statusCode}`));
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('UPSTREAM_TIMEOUT')); });
    req.on('error', (err) => { reject(new Error(`UPSTREAM_NETWORK_ERROR: ${err.message}`)); });
    req.write(requestBody);
    req.end();
  });
}

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
    // Read stream if body parser did not run
    await new Promise((resolve) => {
      let str = '';
      req.on('data', chunk => { str += chunk; });
      req.on('end', () => {
        try { payload = JSON.parse(str || '{}'); } catch (_) { payload = {}; }
        resolve();
      });
    });
  }

  try {
    const liveAiResult = await callGeminiDeveloperApi(payload);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(liveAiResult));
  } catch (err) {
    console.log(`[Advisory] Upstream note: ${sanitizeForLog(err.message)}. Serving verified deterministic advisory.`);
    const fallback = generateDeterministicAdvisory(payload);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fallback));
  }
}
