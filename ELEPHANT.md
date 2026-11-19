# 🐘 ELEPHANT.md — Deep Design & Architectural Invariants
## Project: AeroPulse AI (Hack2Skill Challenge 6)
**Framework**: Google Elephant-Goldfish Model (EGM)  
**Persona**: The Elephant (Long-Horizon Drafter & System Architect)  
**Purpose**: Comprehensive technical contract, architectural invariants, Critical User Journeys (CUJs), and state specifications.

---

## 1. Executive Summary & Problem Context
Urban winter smog in major metropolitan basins (Delhi-NCR, Lahore, Beijing, Tehran) is driven by **meteorological temperature inversions**: cold ground air is capped by warmer overhead air layers, trapping vehicular, industrial, and biomass emissions.

AeroPulse AI provides an intelligent, science-backed decision-support system that:
1. Recommends diurnal, low-emission daily routines avoiding toxic nocturnal and early-morning inversion traps.
2. Delivers low-cost indoor air quality (IAQ) bio-hacks and filtration protocols (e.g., DIY Corsi-Rosenthal boxes, NASA botanical filters, weather-stripping).
3. Evaluates sustainable household and mobility alternatives (swapping ICE commutes for electric transit; replacing kerosene/gas coil heaters with heat pumps; composting garden waste).
4. Explains and quantifies the direct personal health and community airshed impact of these choices ($\mu\text{g/m}^3$ avoided, carbon reduction in $\text{kg CO}_2\text{e}$, and passive cigarette equivalencies).

---

## 2. Core Architectural Invariants
The system strictly enforces the following immutable architectural rules:

1. **Zero External Runtime Blocking**:
   - The application core must remain 100% operational offline.
   - External LLM APIs (Gemini 2.0 Flash) must have seamless, deterministic algorithmic synthesis fallbacks to prevent runtime failures during automated scoring or network partitions.
2. **Deterministic Mathematical Integrity**:
   - Every impact metric ($\text{PM}_{2.5}$ avoided, carbon saved, cost reduced) must derive from published scientific baselines:
     - *Berkeley Earth Standard*: $22\,\mu\text{g/m}^3 \text{ of PM}_{2.5} \text{ over 24 hrs} \approx 1 \text{ passive cigarette}$.
     - *Inhalation Volume*: Adult average $0.5\,\text{m}^3/\text{hour}$ active respiration volume.
3. **WCAG 2.2 AA Compliance as a Non-Negotiable Core**:
   - 100% of interactive controls and form inputs must have explicit `<label for="...">` or `aria-label` bindings.
   - Screen reader skip links and landmark roles (`banner`, `main`, `navigation`, `dialog`, `status`) must be present.
4. **Memory-Safe Canvas Operations**:
   - All Chart.js operations must mutate existing dataset arrays in-place (`chart.update('none')`) to prevent canvas context recreation leaks and garbage collection pauses.
5. **Zero-Trust Input Sanitization**:
   - All dynamic strings interpolated into the DOM must pass through an HTML-entity escape sanitizer (`escapeHtml()`) to prevent XSS vulnerabilities.

---

## 3. Critical User Journeys (CUJs)

### CUJ-1: Vulnerable Family Inversion Navigation
- **Actor**: Parent with an asthmatic child and an elderly grandparent in Delhi NCR during an AQI 465 smog event.
- **Trigger**: User inputs a conversational prompt detailing family setup and heating/commute habits.
- **Workflow**:
  1. AI parses the query and flags high-risk vulnerabilities (`Kids`, `Asthma`).
  2. Modeler recalculates 24-hour diurnal inversion curve, identifying the safe outdoor **Solar Dispersion Window** (1:00 PM – 3:30 PM).
  3. Routine dynamically generates protected school transit protocols (N95 pediatric mask, cabin carbon recirculation) and morning indoor breathing routines.
  4. Heating swap automatically activates (replaces kerosene/coil bar heater with heat pump/induction).
  5. Personal health impact is rendered: $384\,\mu\text{g/m}^3 \text{ PM}_{2.5}$ saved, equivalent to **18.2 passive cigarettes prevented**.

### CUJ-2: High-Density Apartment IAQ Hardening
- **Actor**: Work-from-home professional living in a high-rise facing industrial smog drafts.
- **Trigger**: User explores the Indoor Air Quality (IAQ) Bio-Hacks module.
- **Workflow**:
  1. User selects DIY Corsi-Rosenthal MERV-13 filter box setup ($25 build vs $500 commercial purifier).
  2. App presents step-by-step CADR calculations, NASA botanical plant pairings (Snake Plant night $O_2$, Areca Palm humidity buffer), and window weather-stripping guidelines.
  3. User toggles "Apply Hack"; indoor target reflects $<35\,\mu\text{g/m}^3$ clean air envelope.

### CUJ-3: Community Vanguard & Neighborhood Mobilization
- **Actor**: Community organizer / Resident Welfare Association (RWA) member.
- **Trigger**: User creates an anti-smoldering neighborhood pledge in the Community module.
- **Workflow**:
  1. User publishes an air action pledge (e.g., "Sector 9 EV Carpool & Zero Open-Smoldering Watch").
  2. Neighboring families enroll; collective airshed abatement updates in real time.

---

## 4. State Machine Specification
```typescript
interface AeroPulseState {
  city: string;
  neighborhood: string;
  aqi: number;
  pm25: number;
  aqiCategory: "Severe Smog Alert" | "Hazardous Emergency" | "Poor Inversion Layer" | "Moderate Smog Barrier";
  vulnerability: "general" | "kids" | "asthma";
  inversionCurve: Array<{
    time: string;
    aqi: number;
    inversion: string;
  }>;
  routines: Array<{
    id: string;
    time: string;
    title: string;
    tip: string;
    exposureAvoided: string;
    completed: boolean;
  }>;
  iaqHacks: Array<{
    id: string;
    title: string;
    category: string;
    cost: string;
    efficiency: string;
    desc: string;
    icon: string;
  }>;
  alternatives: Array<{
    id: string;
    name: string;
    baseline: string;
    alternative: string;
    impactGain: string;
    adopted: boolean;
  }>;
  communityPledges: Array<{
    id: string;
    title: string;
    members: number;
    impact: string;
    status: string;
    area: string;
  }>;
}
```

---

## 5. Verification Contract
Every modification to the codebase must preserve:
1. `npm test` exit code `0` across all 8 suites.
2. `tests/a11y_audit.js` WCAG 2.2 AA validation score of `100/100`.
3. `tests/security_audit.js` zero-trust input sanitization score of `100/100`.
4. `tests/efficiency_audit.js` in-place memory benchmark of `100/100`.
