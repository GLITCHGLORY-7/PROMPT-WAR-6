/**
 * AeroPulse AI — Vercel Serverless Function: /api/pledge
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

    const { action, pledgeId, title, goal, area } = payload;
    if (action === 'create' && title && goal) {
      const newPledge = {
        id: `p_${Date.now()}`,
        title: String(title).slice(0, 80),
        members: 1,
        impact: String(goal).slice(0, 120),
        status: "Active Zone",
        area: String(area || 'Local District').slice(0, 50)
      };
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, pledge: newPledge }));
      return;
    }

    if (action === 'join' && pledgeId) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, updatedMembers: 2 }));
      return;
    }

    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid pledge request' }));
    return;
  }

  res.writeHead(405);
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
