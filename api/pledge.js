/**
 * AeroPulse AI — Vercel Serverless Function: /api/pledge
 * Handles community pact retrieval and atomic pledge commitment incrementation.
 */

const pledges = [
  {
    id: "p1",
    title: "Zero Open Biomass Burning Protocol",
    members: 1,
    impact: "Eliminates local leaf & biomass smoke plumes across neighborhood",
    status: "Active Zone",
    area: "Anand Vihar"
  },
  {
    id: "p2",
    title: "Electric Carpooling & Anti-Idling School Transit Pact",
    members: 1,
    impact: "Displaces vehicular exhaust plumes near elementary schools",
    status: "Active Zone",
    area: "Sector 4 & 5"
  },
  {
    id: "p3",
    title: "DIY Corsi-Rosenthal Purifier Assembly Drive",
    members: 1,
    impact: "Creates low-cost clean air sanctuary rooms in local community centers",
    status: "Active Zone",
    area: "East Delhi Schools"
  }
];

/**
 * Serverless HTTP Handler for Community Pledges.
 *
 * @param {import('node:http').IncomingMessage} req - Incoming HTTP request stream.
 * @param {import('node:http').ServerResponse} res - Server HTTP response stream.
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ pledges, storageMode: 'vercel-edge' }));
    return;
  }

  if (req.method === 'POST') {
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

    const pledgeId = payload.pledgeId;
    if (pledgeId) {
      const p = pledges.find(x => x.id === pledgeId);
      if (p) {
        p.members += 1;
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, updatedMembers: p.members }));
        return;
      }
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Pledge not found' }));
      return;
    }

    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid pledge request' }));
    return;
  }

  res.writeHead(405);
  res.end(JSON.stringify({ error: 'Method not allowed' }));
}
