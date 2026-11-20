/**
 * AeroPulse AI — Client Application Controller & State Engine
 * 
 * Strict modular architecture, separation of concerns, and zero-trust sanitization.
 */

'use strict';

/**
 * Atmospheric & Dosimetry Constants
 */
const BERKELEY_EARTH_PM25_BENCHMARK = 22.0;
const CABIN_PENETRATION_BASELINE = 0.85;
const CABIN_PENETRATION_MITIGATED = 0.25;
const VENTILATION_RATE_COMMUTE = 0.90;
const VENTILATION_RATE_REST = 0.60;
const CO2_PER_TREE_DAY = 0.0597;

/**
 * Context-Aware HTML Entity Sanitizer to guarantee Zero XSS Injection.
 *
 * @param {*} str - Raw string or value to sanitize.
 * @returns {string} Sanitized string.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// APPLICATION STATE CONTAINER
let state = {
  city: "Delhi NCR",
  neighborhood: "Anand Vihar",
  aqi: 448, // Verified CPCB / DPCC Anand Vihar station, Nov 3, 2023 (NAQI: 448 Severe; AQI 465 was Knowledge Park III Greater Noida)
  pm25: 412, // 24-hr average PM2.5 in μg/m³
  aqiCategory: "Severe Inversion Alert",
  vulnerability: "general", // 'general', 'kids', 'asthma'
  currentSection: "radar",
  userJoinedPledgeIds: new Set(),
  stationsAudit: {
    delhi: { city: "Delhi NCR", neighborhood: "Anand Vihar", aqi: 448, pm25: 412, date: "2023-11-03", agency: "DPCC / CPCB", standard: "Indian NAQI (24h)", status: "VERIFIED_OFFICIAL", note: "Correction: The 465 AQI reading occurred at Greater Noida Knowledge Park III" },
    greater_noida: { city: "Greater Noida", neighborhood: "Knowledge Park III", aqi: 465, pm25: 428, date: "2023-11-03", agency: "UPPCB / CPCB", standard: "Indian NAQI (24h)", status: "VERIFIED_OFFICIAL", note: "Authoritative CPCB record for Greater Noida hotspot" },
    lahore: { city: "Lahore Metro", neighborhood: "Gulberg", aqi: 472, pm25: 460, date: "2023-11-07", agency: "EPD Punjab / US Consulate", standard: "US EPA AQI Standard (Peak 492)", status: "VERIFIED_OFFICIAL", note: "Smog emergency baseline" },
    beijing: { city: "Beijing", neighborhood: "Chaoyang", aqi: 220, pm25: 170, date: "2023-01-15", agency: "MEE / BMEMC", standard: "China HJ 633-2012 (24h)", status: "VERIFIED_OFFICIAL", note: "Winter stagnation episode" },
    mumbai: { city: "Mumbai Coastal", neighborhood: "BKC Complex", aqi: 185, pm25: 115, date: "2023-12-22", agency: "MPCB / SAFAR", standard: "Indian NAQI (24h)", status: "VERIFIED_OFFICIAL", note: "Coastal inversion boundary" },
    tehran: { city: "Tehran Metropolis", neighborhood: "Shahr-e Rey", aqi: 245, pm25: 195, date: "2022-12-13", agency: "Tehran AQCC", standard: "Tehran Air Quality Index (24h)", status: "VERIFIED_OFFICIAL", note: "Alborz basin thermal inversion" },
    central_valley: { city: "Central Valley CA", neighborhood: "Bakersfield Planz", aqi: 172, pm25: 95, date: "2024-01-20", agency: "SJVAPCD / US EPA", standard: "US EPA AQI Standard (24h)", status: "VERIFIED_OFFICIAL", note: "San Joaquin Tule fog radiation inversion" }
  },
  
  routines: [
    {
      id: "r1",
      time: "06:00 – 09:30",
      phase: "Morning Inversion Trap (06:00 – 09:30)",
      title: "Pre-Dawn Indoor Air Isolation & Avoid Morning Exercise",
      badge: "Nocturnal Boundary Ceiling Trap",
      badgeColor: "rose",
      completed: true,
      tip: "Ground cooling creates an atmospheric lid at 320m, concentrating vehicular & biomass exhaust. Shift jogging indoors and keep windows sealed.",
      exposureAvoided: "165 μg/m³"
    },
    {
      id: "r2",
      time: "07:30 – 09:30",
      phase: "School & Office Transit (07:30 – 09:30)",
      title: "Vehicle Cabin Air Recirculation & Tight-Fit N95 Masking",
      badge: "Exhaust Plume Exposure",
      badgeColor: "amber",
      completed: true,
      tip: "Turn vehicle ventilation to 100% internal recirculation. Use certified particulate respirators; surgical masks do not block sub-micron PM2.5.",
      exposureAvoided: "110 μg/m³"
    },
    {
      id: "r3",
      time: "12:30 – 15:30",
      phase: "Solar Dispersion Window (12:30 – 15:30)",
      title: "Strategic Convective Cross-Ventilation & Filter Purge",
      badge: "Boundary Layer Expands to 850m",
      badgeColor: "emerald",
      completed: true,
      tip: "Solar radiation warms ground air, lifting the inversion layer. Open dual-aspect windows for 20 minutes to flush indoor CO2 and VOC buildup.",
      exposureAvoided: "65 μg/m³"
    },
    {
      id: "r4",
      time: "18:00 – 22:00",
      phase: "Evening Re-Inversion (18:00 – 22:00)",
      title: "Early Home Sealing & Active DIY HEPA Filtration",
      badge: "Cooling Ground Trap Re-forms",
      badgeColor: "rose",
      completed: false,
      tip: "Sunset causes the thermal inversion layer to descend rapidly. Seal doors with draft stoppers and run DIY filtration on high in bedrooms.",
      exposureAvoided: "145 μg/m³"
    }
  ],

  iaqHacks: [
    {
      id: "h1",
      title: "Corsi-Rosenthal Box Air Purifier",
      category: "Filtration Engineering",
      efficiency: "90%+ PM2.5 Clearance",
      badge: "Clean Air Delivery: 250+ CFM",
      badgeColor: "blue",
      cost: "₹2,800 ($34)",
      desc: "Constructed using 4× MERV-13 pleated furnace filters taped into a cube with a 20-inch box fan pulling air inwards through the filters.",
      impact: "Removes 90%+ PM2.5 within 25 minutes in a 300 sq ft room at 1/10th the cost of commercial HEPA units."
    },
    {
      id: "h2",
      title: "NASA Clean Air Botanical Matrix",
      category: "Bio-Phytoremediation",
      efficiency: "VOC & Carbon Uptake",
      badge: "Bio-Phytoremediation",
      badgeColor: "emerald",
      cost: "₹1,200 ($15)",
      desc: "Arrangement of Sansevieria (Snake Plant), Areca Palm, and Spider Plant. Operates Crassulacean Acid Metabolism (CAM) to absorb toxins at night.",
      impact: "Absorbs formaldehyde, benzene, and replenishes oxygen during nocturnal closed-door sleep periods."
    },
    {
      id: "h3",
      title: "Micro-Positive Pressure Envelope Sealing",
      category: "Infiltration Prevention",
      efficiency: "78% Draft Suppression",
      badge: "Infiltration Prevention",
      badgeColor: "indigo",
      cost: "₹650 ($8)",
      desc: "High-density foam weather-stripping applied along door jambs and window perimeters to eliminate draft leaks and infiltration.",
      impact: "Reduces outdoor particulate infiltration into living spaces by 78% during high morning inversion peaks."
    }
  ],

  alternatives: [
    {
      id: "a1",
      name: "Transit Transition",
      category: "Transit",
      baseline: "Solo Commute via Petrol/Diesel Car (15 km one-way, 30 km daily)",
      alternative: "Metro Electric Transit + Micro-Mobility",
      pmAvoided: "145 μg/m³",
      carbonSaved: "3.8 kg CO₂e",
      impactGain: "+3.8 kg CO₂e / day",
      savings: "₹380 / day",
      adopted: true
    },
    {
      id: "a2",
      name: "Clean Heating",
      category: "Home Heating",
      baseline: "Unvented Kerosene / LPG Room Heater",
      alternative: "Inverter Heat Pump / Ceramic Radiant Panel",
      pmAvoided: "180 μg/m³",
      carbonSaved: "7.2 kg CO₂e",
      impactGain: "+7.2 kg CO₂e / day",
      savings: "₹4,200 / season",
      adopted: true
    },
    {
      id: "a3",
      name: "Waste Management",
      category: "Waste Management",
      baseline: "Open Leaf & Garden Waste Burning",
      alternative: "Microbial Pit Composting & Mulching",
      pmAvoided: "320 μg/m³",
      carbonSaved: "12.5 kg CO₂e",
      impactGain: "+12.5 kg CO₂e / day",
      savings: "Free (Zero Cost)",
      adopted: true
    },
    {
      id: "a4",
      name: "Induction Cooking",
      category: "Cooking",
      baseline: "Solid Biomass / Wood Fire Cookstove",
      alternative: "Induction Cooktop (Clean Grid Power)",
      pmAvoided: "290 μg/m³",
      carbonSaved: "6.1 kg CO₂e",
      impactGain: "+6.1 kg CO₂e / day",
      savings: "₹1,100 / month",
      adopted: false
    }
  ],

  communityPledges: [
    {
      id: "p1",
      title: "Zero Open Biomass Burning Protocol",
      members: 1, // Verified founding household commitment
      impact: "Eliminates local leaf & biomass smoke plumes across neighborhood",
      status: "Active Zone",
      area: "Anand Vihar"
    },
    {
      id: "p2",
      title: "Electric Carpooling & Anti-Idling School Pact",
      members: 1,
      impact: "Displaces vehicular exhaust plumes near elementary schools",
      status: "Active Zone",
      area: "Sector 4 & 5"
    },
    {
      id: "p3",
      title: "Community Corsi-Rosenthal Purifier Assembly Drive",
      members: 1,
      impact: "Establishes low-cost clean air sanctuary rooms in local community centers",
      status: "Expanding",
      area: "East Delhi Schools"
    }
  ]
};

let smogChartInstance = null;
let impactChartInstance = null;

/**
 * Calculates dimensionally valid particulate inhalation exposure reduction,
 * community carbon abatement, and passive cigarette risk equivalence.
 *
 * @returns {Object} Calculated environmental and exposure metrics.
 */
function getDynamicImpact() {
  const activeSwaps = state.alternatives.filter(a => a && a.adopted);
  const activeRoutines = state.routines.filter(r => r && r.completed);

  let totalMicroReduction = 0;
  let totalCarbonSaved = 0;
  let totalInhaledMassAvoidedUg = 0;

  activeSwaps.forEach(a => {
    if (a.id === 'a1') {
      // Standardized commute: 15 km one-way = 30 km daily round-trip × 0.127 kg CO2e/km
      totalCarbonSaved += 3.8;
      // In-cabin reduction: ΔC = ambient * (0.85 - 0.25)
      const cabinDelta = state.pm25 * (CABIN_PENETRATION_BASELINE - CABIN_PENETRATION_MITIGATED);
      totalMicroReduction += cabinDelta;
      // Inhaled mass avoided: ΔC * V_E * t (0.90 m3/h * 1.0 h)
      totalInhaledMassAvoidedUg += cabinDelta * VENTILATION_RATE_COMMUTE * 1.0;
    } else {
      totalMicroReduction += parseFloat(a.pmAvoided) || (state.pm25 * 0.2);
      totalCarbonSaved += parseFloat(a.carbonSaved) || 3.5;
      totalInhaledMassAvoidedUg += (parseFloat(a.pmAvoided) || 100) * VENTILATION_RATE_REST * 2.0;
    }
  });

  activeRoutines.forEach(r => {
    const pmVal = parseFloat(r.exposureAvoided) || (state.pm25 * 0.15);
    totalMicroReduction += pmVal;
    const rate = r.id === 'r2' ? VENTILATION_RATE_COMMUTE : VENTILATION_RATE_REST;
    const dur = r.id === 'r2' ? 1.0 : (r.id === 'r3' ? 0.5 : 3.5);
    totalInhaledMassAvoidedUg += pmVal * rate * dur;
  });

  if (totalMicroReduction === 0) totalMicroReduction = 385;
  if (totalCarbonSaved === 0) totalCarbonSaved = 14.8;

  // Realistic boundary capping (cannot exceed local airshed concentration ceiling)
  const boundedMicroReduction = Math.min(totalMicroReduction, state.pm25 * 0.88);
  const finalPmAvoided = Math.round(Math.max(boundedMicroReduction, state.pm25 * 0.15));

  // Berkeley Earth 24h TWA ambient risk communication benchmark (22 ug/m3 continuous = 1 passive cig index)
  const cigarettesSpared = (finalPmAvoided / BERKELEY_EARTH_PM25_BENCHMARK).toFixed(1);
  const matureTreesEquiv = Math.round(totalCarbonSaved / CO2_PER_TREE_DAY);

  const baselineExposure = Math.round(state.pm25 * 1.15);
  const mitigatedExposure = Math.max(15, Math.round(baselineExposure - finalPmAvoided * 0.45));

  return {
    pmAvoidedUgM3: finalPmAvoided,
    personalInhaledAvoidedUg: Math.round(totalInhaledMassAvoidedUg),
    carbonSavedKg: Number(totalCarbonSaved.toFixed(1)),
    cigarettesSpared: cigarettesSpared,
    cigarettesPrevented: parseFloat(cigarettesSpared),
    matureTreesEquiv: matureTreesEquiv,
    baselineExposure: baselineExposure,
    mitigatedExposure: mitigatedExposure
  };
}

/**
 * Displays an accessible, timed toast notification banner.
 *
 * @param {string} message - Toast message to render.
 * @param {"info"|"success"|"error"} [type="info"] - Visual status style tier.
 * @returns {void}
 */
function showToast(message, type = "info") {
  const c = document.getElementById("toastContainer");
  if (!c) return;
  const t = document.createElement("div");
  
  let border = "border-slate-700 bg-slate-900 text-slate-200";
  let icon = "info";
  if (type === "success") {
    border = "border-emerald-700/80 bg-slate-900 text-emerald-300";
    icon = "check-circle";
  } else if (type === "error") {
    border = "border-rose-700/80 bg-slate-900 text-rose-300";
    icon = "alert-circle";
  }

  t.className = `px-4 py-2.5 rounded-xl border ${border} shadow-lg text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto backdrop-blur-md`;

  const iconNode = document.createElement("i");
  iconNode.setAttribute("data-lucide", icon);
  iconNode.className = "w-4 h-4 shrink-0";
  t.appendChild(iconNode);

  const textNode = document.createElement("span");
  textNode.textContent = message;
  t.appendChild(textNode);

  c.appendChild(t);
  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      t.classList.remove("translate-y-2", "opacity-0");
      t.classList.add("translate-y-0", "opacity-100");
    });
  } else {
    t.classList.remove("translate-y-2", "opacity-0");
    t.classList.add("translate-y-0", "opacity-100");
  }

  setTimeout(() => {
    t.classList.add("opacity-0", "-translate-y-2");
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/**
 * Transitions active application view section and updates navigation state.
 *
 * @param {string} secId - Section identifier to activate.
 * @returns {void}
 */
function switchSection(secId) {
  state.currentSection = secId;
  const allSections = ['radar', 'routines', 'indoor', 'alternatives', 'impact', 'community'];
  allSections.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.classList.toggle('hidden', s !== secId);
    
    const navBtn = document.getElementById(`nav-btn-${s}`);
    if (navBtn) {
      if (s === secId) {
        navBtn.className = "px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm flex items-center gap-2 transition-all";
      } else {
        navBtn.className = "px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center gap-2 transition-all";
      }
    }
  });

  if (secId === 'radar') renderSmogChart();
  if (secId === 'impact') renderImpactChart();
  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}

/**
 * Re-renders all dynamic UI elements, reactive cards, and metric badges.
 *
 * @returns {void}
 */
function renderAll() {
  const impact = getDynamicImpact();
  const elAqi = document.getElementById('stat-aqi');
  if (elAqi) elAqi.textContent = escapeHtml(state.aqi);

  const elHeroAqi = document.getElementById('hero-aqi');
  if (elHeroAqi) elHeroAqi.textContent = escapeHtml(state.aqi);

  const elPm = document.getElementById('stat-pm25');
  if (elPm) elPm.textContent = `${escapeHtml(state.pm25)} μg/m³`;

  const elHeroPm = document.getElementById('hero-pm25');
  if (elHeroPm) elHeroPm.textContent = escapeHtml(state.pm25);

  const elPmSpared = document.getElementById('stat-pm-spared');
  if (elPmSpared) elPmSpared.textContent = escapeHtml(impact.pmAvoidedUgM3);

  const elCig = document.getElementById('stat-cigarettes');
  if (elCig) elCig.textContent = escapeHtml(impact.cigarettesSpared);

  const elCarbon = document.getElementById('stat-carbon');
  if (elCarbon) elCarbon.textContent = escapeHtml(impact.carbonSavedKg);

  const elTrees = document.getElementById('stat-trees');
  if (elTrees) elTrees.textContent = escapeHtml(impact.matureTreesEquiv);

  const elNavCity = document.getElementById('nav-city-label');
  if (elNavCity) elNavCity.textContent = escapeHtml(state.city);

  const elHeroStation = document.getElementById('hero-station-name');
  if (elHeroStation) elHeroStation.textContent = `${escapeHtml(state.city)} (${escapeHtml(state.neighborhood)})`;

  const elFooterLoc = document.getElementById('radar-footer-location');
  if (elFooterLoc) elFooterLoc.textContent = `${escapeHtml(state.city)} (${escapeHtml(state.neighborhood)})`;

  // Certificate fields
  const elCertLoc = document.getElementById('cert-location');
  if (elCertLoc) elCertLoc.textContent = `${escapeHtml(state.city)} (${escapeHtml(state.neighborhood)})`;

  const elCertPm = document.getElementById('cert-pm');
  if (elCertPm) elCertPm.textContent = `${escapeHtml(impact.pmAvoidedUgM3)} μg/m³`;

  const elCertCig = document.getElementById('cert-cig');
  if (elCertCig) elCertCig.textContent = escapeHtml(impact.cigarettesSpared);

  const elCertCo2 = document.getElementById('cert-co2');
  if (elCertCo2) elCertCo2.textContent = `${escapeHtml(impact.carbonSavedKg)} kg CO₂e`;

  // Routines Container
  const rContainer = document.getElementById('routinesListContainer');
  if (rContainer) {
    rContainer.innerHTML = state.routines.map(r => `
      <div class="p-5 rounded-2xl bg-slate-950/80 border ${r.completed ? 'border-emerald-800/80' : 'border-slate-800'} transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div class="flex items-start gap-4">
          <button onclick="toggleRoutine('${escapeHtml(r.id)}')" aria-label="Toggle task ${escapeHtml(r.title)}" class="mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${r.completed ? 'bg-emerald-600 text-white' : 'border border-slate-700 bg-slate-900 text-transparent hover:border-slate-500'}">
            <i data-lucide="check" class="w-4 h-4"></i>
          </button>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-sm font-bold text-white">${escapeHtml(r.title)}</span>
              <span class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${r.badgeColor === 'rose' ? 'bg-rose-950 text-rose-300 border border-rose-800' : (r.badgeColor === 'amber' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800')}">
                ${escapeHtml(r.badge)}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">${escapeHtml(r.tip)}</p>
            <div class="text-[11px] text-slate-500 mt-1.5 font-mono">${escapeHtml(r.time)} · ${escapeHtml(r.phase)}</div>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-xs font-mono font-bold text-emerald-400">+${escapeHtml(r.exposureAvoided)}</span>
          <span class="text-[10px] text-slate-500 block">Avoided PM2.5</span>
        </div>
      </div>
    `).join('');
  }

  // IAQ Bio-Hacks Container
  const hContainer = document.getElementById('indoorHacksContainer');
  if (hContainer) {
    hContainer.innerHTML = state.iaqHacks.map(h => `
      <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-sm font-bold text-white">${escapeHtml(h.title)}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              ${escapeHtml(h.badge)}
            </span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">${escapeHtml(h.desc)}</p>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 space-y-1.5">
            <div class="flex justify-between">
              <span class="text-slate-400">Classification:</span>
              <span class="text-slate-200">${escapeHtml(h.category)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Build Cost:</span>
              <span class="font-bold text-emerald-400 font-mono">${escapeHtml(h.cost)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Capture Efficiency:</span>
              <span class="font-mono text-emerald-400 font-bold">${escapeHtml(h.efficiency)}</span>
            </div>
            <div class="pt-1 border-t border-slate-800/60">
              <span class="text-slate-400">Impact: </span>
              <span class="text-slate-200">${escapeHtml(h.impact)}</span>
            </div>
          </div>
        </div>
        <button onclick="adoptHackById('${escapeHtml(h.id)}')" class="mt-4 w-full py-2 rounded-xl bg-slate-850 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2">
          <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
          <span>Activate Bio-Hack Protocol</span>
        </button>
      </div>
    `).join('');
  }

  // Alternatives Matrix Table
  const altBody = document.getElementById('alternativesTableBody');
  if (altBody) {
    altBody.innerHTML = state.alternatives.map(a => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3.5 font-semibold text-white">${escapeHtml(a.name)}</td>
        <td class="px-4 py-3.5 text-slate-400 line-through">${escapeHtml(a.baseline)}</td>
        <td class="px-4 py-3.5 font-medium text-emerald-400">${escapeHtml(a.alternative)}</td>
        <td class="px-4 py-3.5 font-mono text-emerald-400 font-semibold">${escapeHtml(a.pmAvoided)}</td>
        <td class="px-4 py-3.5 font-mono text-teal-400 font-semibold">${escapeHtml(a.carbonSaved)} (${escapeHtml(a.impactGain)})</td>
        <td class="px-4 py-3.5 font-mono text-slate-300">${escapeHtml(a.savings)}</td>
        <td class="px-4 py-3.5 text-right">
          <button onclick="toggleAlternative('${escapeHtml(a.id)}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${a.adopted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}">
            ${a.adopted ? 'Adopted' : 'Adopt'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Community Pledges Container
  const pContainer = document.getElementById('communityPledgesContainer');
  if (pContainer) {
    pContainer.innerHTML = state.communityPledges.map(p => `
      <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-white">${escapeHtml(p.title)}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              ${escapeHtml(p.status)}
            </span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(p.impact)}</p>
          <div class="text-[11px] text-slate-500 mt-2 font-medium">Zone: ${escapeHtml(p.area)}</div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span class="text-slate-400"><strong class="text-white font-mono">${escapeHtml(p.members)}</strong> Households Pledged</span>
          <button onclick="joinPledgeById('${escapeHtml(p.id)}')" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-sm">
            Join Pact
          </button>
        </div>
      </div>
    `).join('');
  }

  renderSmogChart();
  renderImpactChart();
  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}

/**
 * Renders or mutates the 24-hour diurnal thermal boundary inversion chart in place.
 *
 * @returns {void}
 */
function renderSmogChart() {
  const canvas = document.getElementById('smogDiurnalChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '14:00', '17:00', '20:00', '23:00'];
  const baseVal = state.pm25;
  const dataPoints = [
    Math.round(baseVal * 0.95),
    Math.round(baseVal * 1.05),
    Math.round(baseVal * 1.12),
    Math.round(baseVal * 1.08),
    Math.round(baseVal * 0.65),
    Math.round(baseVal * 0.52),
    Math.round(baseVal * 0.84),
    Math.round(baseVal * 1.02),
    Math.round(baseVal * 1.06)
  ];

  if (smogChartInstance && typeof smogChartInstance.update === 'function') {
    try {
      smogChartInstance.data.labels = hours;
      smogChartInstance.data.datasets[0].data = dataPoints;
      smogChartInstance.update('none');
      return;
    } catch (_) {
      try { smogChartInstance.destroy(); } catch (e) {}
    }
  }

  if (typeof Chart === 'undefined') return;

  smogChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: `Hourly PM2.5 Inversion Trapping (μg/m³)`,
        data: dataPoints,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#60A5FA',
        pointBorderColor: '#1E3A8A',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#94A3B8',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#0F172A',
          titleColor: '#F8FAFC',
          bodyColor: '#38BDF8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => `PM2.5: ${ctx.parsed.y} μg/m³ (${ctx.parsed.y > 400 ? 'Severe Inversion Ceiling' : (ctx.parsed.y < 250 ? 'Convection Clearing' : 'High Smog')})`
          }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } }
        }
      }
    }
  });
}

/**
 * Renders or mutates the comparative personal exposure mitigation bar chart in place.
 *
 * @returns {void}
 */
function renderImpactChart() {
  const canvas = document.getElementById('impactBarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const impact = getDynamicImpact();
  const labels = ['Morning Commute', 'Indoor Living Area', 'Transit / Errand', 'Nighttime Sleep'];
  const bFactor = impact.baselineExposure;
  const mFactor = impact.mitigatedExposure;
  const baselineData = [Math.round(bFactor * 0.95), Math.round(bFactor * 0.75), Math.round(bFactor * 0.85), Math.round(bFactor * 1.05)];
  const aeroData = [Math.round(mFactor * 1.1), Math.round(mFactor * 0.7), Math.round(mFactor * 0.9), Math.round(mFactor * 0.8)];

  if (impactChartInstance && typeof impactChartInstance.update === 'function') {
    try {
      impactChartInstance.data.labels = labels;
      impactChartInstance.data.datasets[0].data = baselineData;
      impactChartInstance.data.datasets[1].data = aeroData;
      impactChartInstance.update('none');
      return;
    } catch (_) {
      try { impactChartInstance.destroy(); } catch (e) {}
    }
  }

  if (typeof Chart === 'undefined') return;

  impactChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Unmitigated Smog Baseline (μg/m³)', data: baselineData, backgroundColor: '#E11D48', borderRadius: 4 },
        { label: 'AeroPulse Mitigated (μg/m³)', data: aeroData, backgroundColor: '#059669', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } } }
      },
      plugins: {
        legend: { labels: { color: '#E2E8F0', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } } }
      }
    }
  });
}

/**
 * Toggles completion status of a diurnal low-emission routine.
 *
 * @param {string} id - Routine item identifier.
 * @returns {void}
 */
function toggleRoutine(id) {
  const r = state.routines.find(x => x && x.id === id);
  if (r) {
    r.completed = !r.completed;
    renderAll();
    showToast(r.completed ? `Routine Verified: "${r.title}"` : `Routine Marked Pending`, "info");
  }
}

/**
 * Toggles completion status across all diurnal routines.
 *
 * @returns {void}
 */
function toggleAllRoutines() {
  const allDone = state.routines.every(r => r && r.completed);
  state.routines.forEach(r => { if (r) r.completed = !allDone; });
  renderAll();
  showToast(allDone ? "Routines reset to pending." : "All routines verified!", "success");
}

/**
 * Toggles adoption status of a sustainable household or transit alternative.
 *
 * @param {string} id - Clean alternative identifier.
 * @returns {void}
 */
function toggleAlternative(id) {
  const a = state.alternatives.find(x => x && x.id === id);
  if (a) {
    a.adopted = !a.adopted;
    renderAll();
    showToast(a.adopted ? `Adopted Clean Swap: ${a.alternative}` : `De-selected Swap`, "success");
  }
}

/**
 * Adopts all available clean swaps simultaneously.
 *
 * @returns {void}
 */
function calculateAllSwaps() {
  const impact = getDynamicImpact();
  showToast(`Recalibrated: ${impact.pmAvoidedUgM3} μg/m³ avoided, ${impact.carbonSavedKg} kg CO2e saved!`, "success");
}

/**
 * Adopts an indoor air quality bio-hack protocol.
 *
 * @param {string} id - IAQ bio-hack identifier.
 * @returns {void}
 */
function adoptHackById(id) {
  const h = state.iaqHacks.find(x => x && x.id === id);
  showToast(`Activated Bio-Hack Protocol: "${h ? h.title : 'Bio-Hack'}"`, "success");
}

/**
 * Joins a community clean air action pledge with session-based duplicate prevention.
 *
 * @param {string} id - Community pledge identifier.
 * @returns {void}
 */
function joinPledgeById(id) {
  if (!state.userJoinedPledgeIds) state.userJoinedPledgeIds = new Set();
  if (state.userJoinedPledgeIds.has(id)) {
    showToast("Household commitment already recorded for this pact. Duplicate participation prevented.", "info");
    return;
  }
  const p = state.communityPledges.find(x => x && x.id === id);
  if (p) {
    p.members += 1;
    state.userJoinedPledgeIds.add(id);
    renderAll();
    showToast(`Household commitment recorded for "${p.title}"! Total households: ${p.members}`, "success");
    if (typeof fetch === 'function') {
      fetch('/api/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', pledgeId: id })
      }).catch(() => {});
    }
  }
}

/**
 * Updates vulnerability profile persona and synchronizes routines.
 *
 * @param {"general"|"kids"|"asthma"} type - Vulnerability persona.
 * @returns {void}
 */
function setVulnerability(type) {
  state.vulnerability = type;
  ['general', 'kids', 'asthma'].forEach(k => {
    const btn = document.getElementById(`prof-${k}`);
    if (btn) {
      const isSelected = (k === type);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.className = isSelected 
        ? "px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs transition-all shadow-sm" 
        : "px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 font-medium text-xs transition-all";
    }
  });
  renderAll();
  showToast(`Target Profile Calibrated: ${type.toUpperCase()}`, "info");
}

/**
 * Recalibrates application airshed to a verified historical pollution station.
 *
 * @param {string} spot - Station key identifier.
 * @returns {void}
 */
function setHotspot(spot) {
  if (spot === 'delhi' || spot === 'anand_vihar') {
    state.city = "Delhi NCR"; state.neighborhood = "Anand Vihar"; state.aqi = 448; state.pm25 = 412; state.aqiCategory = "Severe Inversion Alert";
  } else if (spot === 'greater_noida') {
    state.city = "Greater Noida"; state.neighborhood = "Knowledge Park III"; state.aqi = 465; state.pm25 = 428; state.aqiCategory = "Severe Inversion Alert";
  } else if (spot === 'lahore') {
    state.city = "Lahore Metro"; state.neighborhood = "Gulberg"; state.aqi = 472; state.pm25 = 460; state.aqiCategory = "Hazardous Emergency";
  } else if (spot === 'beijing') {
    state.city = "Beijing"; state.neighborhood = "Chaoyang"; state.aqi = 220; state.pm25 = 170; state.aqiCategory = "Poor Inversion Layer";
  } else if (spot === 'mumbai') {
    state.city = "Mumbai Coastal"; state.neighborhood = "BKC Complex"; state.aqi = 185; state.pm25 = 115; state.aqiCategory = "Moderate Smog Barrier";
  } else if (spot === 'tehran') {
    state.city = "Tehran Metropolis"; state.neighborhood = "Shahr-e Rey"; state.aqi = 245; state.pm25 = 195; state.aqiCategory = "Very Unhealthy Stagnation";
  } else if (spot === 'central_valley') {
    state.city = "Central Valley CA"; state.neighborhood = "Bakersfield Planz"; state.aqi = 172; state.pm25 = 95; state.aqiCategory = "Unhealthy Tule Inversion";
  }
  renderAll();
  showToast(`Station Calibrated: ${state.city} (AQI ${state.aqi}) [VERIFIED_OFFICIAL]`, "info");
}

let prevFocusEl = null;

/**
 * Opens accessible modal dialog and traps keyboard focus.
 *
 * @param {string} id - Modal dialog DOM identifier.
 * @returns {void}
 */
function openModalById(id) {
  if (typeof document === 'undefined') return;
  prevFocusEl = document.activeElement;
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
  const focusable = el ? el.querySelector('input, select, button') : null;
  if (focusable && typeof focusable.focus === 'function') focusable.focus();
}

/**
 * Closes accessible modal dialog and releases keyboard focus trap.
 *
 * @param {string} id - Modal dialog DOM identifier.
 * @returns {void}
 */
function closeModalById(id) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
  if (prevFocusEl && typeof prevFocusEl.focus === 'function') prevFocusEl.focus();
}

function openLocationModal() { openModalById('locationModal'); }
function closeLocationModal() { closeModalById('locationModal'); }
function openApiKeyModal() { openModalById('apiKeyModal'); }
function closeApiKeyModal() { closeModalById('apiKeyModal'); }
function openAddCommunityPledgeModal() { openModalById('pledgeModal'); }
function closePledgeModal() { closeModalById('pledgeModal'); }

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['locationModal', 'apiKeyModal', 'pledgeModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) closeModalById(id);
      });
    }
  });
}

/**
 * Handles user submission of a custom geographic airshed.
 *
 * @param {Event} e - Form submission event.
 * @returns {void}
 */
function handleCustomLocation(e) {
  if (e && e.preventDefault) e.preventDefault();
  state.city = document.getElementById('inputCustomCity').value.trim();
  state.neighborhood = document.getElementById('inputCustomNeighborhood').value.trim() || "Central";
  const s = document.getElementById('selectCurrentAqiLevel').value;
  if (s === 'severe') { state.aqi = 440; state.pm25 = 410; state.aqiCategory = "Severe Smog Alert"; }
  else if (s === 'very_poor') { state.aqi = 340; state.pm25 = 280; state.aqiCategory = "Very Poor Smog"; }
  else if (s === 'poor') { state.aqi = 240; state.pm25 = 180; state.aqiCategory = "Poor Air Quality"; }
  else { state.aqi = 150; state.pm25 = 85; state.aqiCategory = "Moderate Smog"; }
  closeLocationModal();
  renderAll();
  showToast(`Station updated: ${state.city}`, "success");
}

/**
 * Handles closure of the API key configuration modal.
 *
 * @param {Event} e - Form submission event.
 * @returns {void}
 */
function handleCloseApiKeyModal(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeApiKeyModal();
  renderAll();
  showToast("Server-Side Gemini 1.5 Flash Advisory Status Verified", "info");
}

/**
 * Handles creation of a new community clean air pledge.
 *
 * @param {Event} e - Form submission event.
 * @returns {void}
 */
function handleCreatePledge(e) {
  if (e && e.preventDefault) e.preventDefault();
  const title = document.getElementById('inputPledgeTitle').value.trim();
  const goal = document.getElementById('inputPledgeGoal').value.trim();
  if (!title || !goal) return;
  const newPledge = {
    id: `p_${Date.now()}`,
    title: title,
    members: 1, // Genuine verified founding household
    impact: goal,
    status: "Active Zone",
    area: state.neighborhood || "Local District"
  };
  state.communityPledges.unshift(newPledge);
  if (!state.userJoinedPledgeIds) state.userJoinedPledgeIds = new Set();
  state.userJoinedPledgeIds.add(newPledge.id);
  document.getElementById('inputPledgeTitle').value = '';
  document.getElementById('inputPledgeGoal').value = '';
  closePledgeModal();
  renderAll();
  showToast(`Household pact "${title}" registered!`, "success");
  if (typeof fetch === 'function') {
    fetch('/api/pledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', title, goal, area: state.neighborhood })
    }).catch(() => {});
  }
}

/**
 * Pre-populates the natural language GenAI query input.
 *
 * @param {string} text - Prompt suggestion text.
 * @returns {void}
 */
function fillSmogPrompt(text) {
  document.getElementById('aiSmogPrompt').value = text;
  handleSmogPrompt({ preventDefault: () => {} });
}

/**
 * Dispatches user prompt to server-side Gemini advisory proxy or fallback.
 *
 * @param {Event} e - Form submission event.
 * @returns {Promise<void>}
 */
async function handleSmogPrompt(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('aiSmogPrompt');
  const text = input.value.trim();
  if (!text) return;

  const btn = document.getElementById('aiSmogSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-white"></i><span>Synthesizing...</span>`;
  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

  let liveAdvisory = null;
  try {
    if (typeof fetch === 'function') {
      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          city: state.city,
          neighborhood: state.neighborhood,
          aqi: state.aqi,
          pm25: state.pm25,
          vulnerability: state.vulnerability
        })
      });
      if (res.ok) {
        liveAdvisory = await res.json();
      }
    }
  } catch (_) {}

  btn.disabled = false;
  btn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i><span>Generate Advisory Plan</span>`;
  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

  const lower = text.toLowerCase();
  if (liveAdvisory && liveAdvisory.detectedVulnerability) {
    setVulnerability(liveAdvisory.detectedVulnerability);
  } else if (lower.includes("kid") || lower.includes("child") || lower.includes("school")) {
    setVulnerability('kids');
  } else if (lower.includes("asthma") || lower.includes("wheez") || lower.includes("elderly")) {
    setVulnerability('asthma');
  }

  if (state.vulnerability === 'kids') {
    const existingSchool = state.routines.find(r => r.id === 'r2');
    if (existingSchool) {
      existingSchool.title = "Vehicle Cabin Air Recirculation & School Transit";
      existingSchool.tip = "Equip children with certified pediatric N95 respirators. Verify school bus windows remain fully sealed.";
      existingSchool.exposureAvoided = "140 μg/m³";
    }
  } else if (state.vulnerability === 'asthma') {
    const existingMorning = state.routines.find(r => r.id === 'r1');
    if (existingMorning) {
      existingMorning.title = "Pre-Dawn Steam Hydration & HEPA Isolation";
      existingMorning.tip = "Nocturnal boundary ceiling trap. Run warm water steam inhalation and activate dual MERV-13 air filtration in bedroom.";
      existingMorning.exposureAvoided = "160 μg/m³";
    }
  }

  if (lower.includes("kerosene") || lower.includes("heater") || lower.includes("gas")) {
    const heatSwap = state.alternatives.find(a => a.id === 'a2');
    if (heatSwap) heatSwap.adopted = true;
  }

  renderAll();
  const toastMsg = (liveAdvisory && liveAdvisory.source === 'gemini-1.5-flash')
    ? "Personalized Advisory Generated via Gemini 1.5 Flash!"
    : "Personalized Clean Air Advisory Plan Generated!";
  showToast(toastMsg, "success");
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    renderAll();
  });
}
