/**
 * AeroPulse AI — Gemini 2.0 Flash Agentic Prompts & Schemas
 * Implements competition Pillar 1: Dedicated Prompts Module & LLM Orchestration
 */

export const GEMINI_MODEL = "gemini-2.0-flash";

export const SYSTEM_PROMPT = `You are AeroPulse AI, an elite atmospheric scientist, environmental health physician, and urban clean air strategist.
Your mission is to help families and urban communities navigate severe winter smog and thermal inversion episodes.

Given the user's location, household demographics, commute patterns, and heating sources:
1. Identify high-risk family vulnerabilities (infants, asthmatics, pregnant women, elderly).
2. Construct a 24-hour diurnal low-emission routine that bypasses peak nocturnal thermal inversion traps (06:00 AM - 09:30 AM) and leverages the safe solar dispersion window (12:30 PM - 03:30 PM).
3. Recommend 3 low-cost, physics-backed indoor air quality (IAQ) bio-hacks (e.g., Corsi-Rosenthal MERV-13 box, NASA botanical pairings, silicone draft sealing).
4. Propose 3 high-impact sustainable alternatives with quantified PM2.5 and CO2e savings.
5. Accurately estimate the avoided PM2.5 inhalation (in ug/m3) and passive cigarette equivalency based on Berkeley Earth standards (22 ug/m3 over 24h = 1 passive cigarette).

Output MUST be strictly valid JSON conforming to the requested schema. No markdown ticks outside the JSON.`;

export const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    detectedVulnerability: { type: "STRING", enum: ["general", "kids", "asthma"] },
    summaryDiagnosis: { type: "STRING" },
    safeSolarWindow: { type: "STRING" },
    recommendedRoutines: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING" },
          title: { type: "STRING" },
          tip: { type: "STRING" },
          exposureAvoidedMicrograms: { type: "NUMBER" }
        },
        required: ["time", "title", "tip", "exposureAvoidedMicrograms"]
      }
    },
    tailoredIaqHacks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          category: { type: "STRING" },
          cost: { type: "STRING" },
          efficiency: { type: "STRING" },
          desc: { type: "STRING" }
        },
        required: ["title", "category", "cost", "efficiency", "desc"]
      }
    },
    sustainableSwaps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          baseline: { type: "STRING" },
          alternative: { type: "STRING" },
          impactGain: { type: "STRING" }
        },
        required: ["name", "baseline", "alternative", "impactGain"]
      }
    },
    impactEstimate: {
      type: "OBJECT",
      properties: {
        dailyPmAvoidedUgM3: { type: "NUMBER" },
        dailyCarbonSavedKg: { type: "NUMBER" },
        passiveCigarettesPrevented: { type: "NUMBER" }
      },
      required: ["dailyPmAvoidedUgM3", "dailyCarbonSavedKg", "passiveCigarettesPrevented"]
    }
  },
  required: [
    "detectedVulnerability",
    "summaryDiagnosis",
    "safeSolarWindow",
    "recommendedRoutines",
    "tailoredIaqHacks",
    "sustainableSwaps",
    "impactEstimate"
  ]
};
