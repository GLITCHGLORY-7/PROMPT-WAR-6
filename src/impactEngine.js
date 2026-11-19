/**
 * AeroPulse AI — Deterministic Scientific Calculation Engine
 * 
 * Implements:
 * 1. Dimensionally valid human particulate dosimetry:
 *    Inhaled mass (μg) = concentration (μg/m³) × ventilation rate (m³/h) × exposure duration (h)
 * 2. Compatible Well-to-Wheel (WTW) passenger-km transport carbon emission factors
 * 3. Berkeley Earth ambient risk communication benchmarks
 * 
 * Strict separation maintained between personal inhaled dose (μg),
 * ambient microenvironment concentration (μg/m³), and community GHG emissions (kg CO2e).
 */

// EPA / USDA Forest Service: 1 mature tree absorbs ~21.8 kg CO2/year = 0.0597 kg CO2/day
export const CO2_KG_PER_TREE_DAY = 0.0597;

// Berkeley Earth epidemiological benchmark: 22 μg/m³ 24h continuous ambient PM2.5 = 1 passive cigarette risk index
// (Muller & Rohde, 2015. Note: Used strictly for ambient public health risk communication, not direct biological combustion equivalence).
export const BERKELEY_EARTH_PM25_BENCHMARK = 22.0;

// Breathing rate assumptions based on US EPA Exposure Factors Handbook:
// - Sedentary / resting indoor adult: ~10 L/min = 0.60 m³/h
// - Light exertion / transit walking & driving: ~15 L/min = 0.90 m³/h
export const VENTILATION_RATE_REST_M3_H = 0.60;
export const VENTILATION_RATE_COMMUTE_M3_H = 0.90;

// Vehicle cabin penetration factor assumptions:
// - Baseline: unsealed or fresh-air intake mode with standard/degraded filter: ~85% ambient penetration
// - Mitigated: 100% recirculation mode + clean high-efficiency aftermarket/OEM filter: ~25% ambient penetration
// (Illustrative engineering assumption: actual penetration varies by cabin airtightness and filter seating).
export const CABIN_PENETRATION_BASELINE = 0.85;
export const CABIN_PENETRATION_MITIGATED = 0.25;

// Transport GHG Emission Factors (Well-to-Wheel operational per passenger-km):
// - Solo gasoline passenger car (occupancy 1.0): 0.165 kg CO2e / p-km (India MoRTH / UK DEFRA)
// - Electric mass rapid transit (Delhi Metro): ~0.038 kg CO2e / p-km (0.053 kWh/p-km × 0.716 kg CO2/kWh grid factor)
// - Net abatement: 0.165 - 0.038 = 0.127 kg CO2e / passenger-km
export const EF_SOLO_CAR_KG_CO2E_PKM = 0.165;
export const EF_METRO_KG_CO2E_PKM = 0.038;
export const NET_TRANSIT_ABATEMENT_KG_CO2E_PKM = 0.127;

// Standardized commute trip distance:
// Defined consistently as 15 km one-way = 30 km daily round-trip.
export const COMMUTE_DISTANCE_ONE_WAY_KM = 15;
export const COMMUTE_DISTANCE_ROUND_TRIP_KM = 30;

/**
 * Dimensionally valid human particulate inhalation dosimetry.
 * @param {number} concentrationUgM3 - Microenvironment PM2.5 in μg/m³
 * @param {number} ventilationRateM3H - Minute breathing rate in m³/hour
 * @param {number} durationHours - Exposure duration in hours
 * @returns {number} Inhaled particulate mass in micrograms (μg)
 */
export function calculateInhaledMass(concentrationUgM3, ventilationRateM3H, durationHours) {
  return concentrationUgM3 * ventilationRateM3H * durationHours;
}

/**
 * Calculates personal exposure mitigation and community carbon abatement.
 * @param {Object} state - Application state containing ambient PM2.5, routines, and adopted alternatives.
 * @returns {Object} Calculated environmental health metrics with disclosed assumptions.
 */
export function calculateImpact(state) {
  const ambientPm25 = Number(state.pm25) || 100;

  // 1. Calculate Personal Inhaled PM2.5 Mass Avoided (μg) from active routines
  // Using dimensionally valid equation: ΔD = (C_base - C_mit) × V_E × t
  let totalInhaledMassAvoidedUg = 0;
  let totalMicroenvironmentReductionUgM3 = 0;

  (state.routines || []).forEach(r => {
    if (r.completed) {
      const numMatch = String(r.exposureAvoided || '').match(/([0-9.]+)/);
      const deltaC = numMatch ? parseFloat(numMatch[1]) : (ambientPm25 * 0.25);
      totalMicroenvironmentReductionUgM3 += deltaC;

      // Assign appropriate duration and breathing rate based on routine phase
      let durationHours = 2.0;
      let ventilationRate = VENTILATION_RATE_REST_M3_H;
      if (r.id === 'r2') {
        // Commute phase: 1.0 hour transit, active ventilation rate
        durationHours = 1.0;
        ventilationRate = VENTILATION_RATE_COMMUTE_M3_H;
      } else if (r.id === 'r1' || r.id === 'r4') {
        // Indoor resting / sleeping phases
        durationHours = 3.5;
        ventilationRate = VENTILATION_RATE_REST_M3_H;
      }
      totalInhaledMassAvoidedUg += calculateInhaledMass(deltaC, ventilationRate, durationHours);
    }
  });

  // 2. Calculate Community Carbon Abatement (kg CO2e) and microenvironment exposure reduction from swaps
  let swapCarbonSum = 0;
  let swapMicroenvironmentSum = 0;

  (state.alternatives || []).forEach(a => {
    if (a.adopted) {
      if (a.id === 'a1') {
        // Solo car to Metro transition: 30 km daily round-trip × 0.127 kg CO2e/km
        const transitCarbon = COMMUTE_DISTANCE_ROUND_TRIP_KM * NET_TRANSIT_ABATEMENT_KG_CO2E_PKM;
        swapCarbonSum += transitCarbon;
        
        // In-transit cabin microenvironment exposure reduction
        const cabinDeltaC = ambientPm25 * (CABIN_PENETRATION_BASELINE - CABIN_PENETRATION_MITIGATED);
        swapMicroenvironmentSum += cabinDeltaC;
        totalInhaledMassAvoidedUg += calculateInhaledMass(cabinDeltaC, VENTILATION_RATE_COMMUTE_M3_H, 1.0);
      } else {
        const carbonMatch = String(a.impactGain || '').match(/([0-9.]+)\s*kg\s*CO/i);
        swapCarbonSum += carbonMatch ? parseFloat(carbonMatch[1]) : 3.5;

        const pmMatch = String(a.impactGain || '').match(/([0-9.]+)\s*μg/i);
        swapMicroenvironmentSum += pmMatch ? parseFloat(pmMatch[1]) : (ambientPm25 * 0.20);
      }
    }
  });

  // Bounded personal exposure reduction (cannot exceed ambient exposure ceiling)
  const effectivePmAvoided = Math.min(
    totalMicroenvironmentReductionUgM3 + swapMicroenvironmentSum,
    ambientPm25 * 0.90
  );
  const finalPmAvoided = Math.round(Math.max(effectivePmAvoided, ambientPm25 * 0.15));

  // Berkeley Earth ambient equivalence risk communication index
  const cigarettesPrevented = Number((finalPmAvoided / BERKELEY_EARTH_PM25_BENCHMARK).toFixed(1));

  // Community carbon sequestered in mature tree-days
  const carbonSavedKg = Number(Math.max(swapCarbonSum, 1.2).toFixed(1));
  const treesEquiv = Math.round(carbonSavedKg / CO2_KG_PER_TREE_DAY);

  // Household economic savings estimate (fuel, cooking, and health expenditure)
  const costSavedInr = Math.round((carbonSavedKg * 180) + (finalPmAvoided * 4.5));

  // Time-Weighted Average (TWA) personal microenvironment exposure
  const baselineExposure = ambientPm25;
  const mitigatedExposure = Math.max(15, Math.round(ambientPm25 - finalPmAvoided));

  return {
    pmAvoidedUgM3: finalPmAvoided,
    personalInhaledMassAvoidedUg: Math.round(totalInhaledMassAvoidedUg),
    carbonSavedKg,
    cigarettesPrevented,
    treesEquiv,
    costSavedInr,
    baselineExposure,
    mitigatedExposure,
    assumptions: {
      commuteDistanceKm: COMMUTE_DISTANCE_ROUND_TRIP_KM,
      ventilationRateCommuteM3H: VENTILATION_RATE_COMMUTE_M3_H,
      ventilationRateRestM3H: VENTILATION_RATE_REST_M3_H,
      cabinPenetrationMitigated: CABIN_PENETRATION_MITIGATED,
      cabinPenetrationBaseline: CABIN_PENETRATION_BASELINE
    },
    disclaimer: "Modeled engineering estimates for environmental decision support. Not measured clinical outcomes."
  };
}
