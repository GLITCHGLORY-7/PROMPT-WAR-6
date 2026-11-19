# 🌫️ AeroPulse AI — Clean Air & Winter Smog Navigator

> **GenAI-powered decision-support assistant that helps families and communities navigate severe winter smog and urban air pollution with low-emission routines, indoor air quality hacks, and direct impact quantification.**

[![Hackathon Standards](https://img.shields.io/badge/A11y-WCAG_2.1_AA-emerald.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Automated Tests](https://img.shields.io/badge/Tests-8%20Suites%20Passed-blue.svg)](tests/aeropulse.test.js)
[![Performance](https://img.shields.io/badge/Performance-Zero--Lag%20Client-sky.svg)](#)
[![Model](https://img.shields.io/badge/GenAI-Gemini%202.0%20Flash-violet.svg)](#)

---

## 🎯 Problem Statement Alignment (PromptWars Challenge 6)

During winter months across major urban regions (Delhi-NCR, Lahore, Beijing, Tehran, Central Valley), meteorological **thermal inversions** trap toxic industrial emissions, vehicular exhaust, and biomass smoke close to the surface, causing particulate matter ($\text{PM}_{2.5}$ & $\text{PM}_{10}$) to spike into hazardous territories ($\text{AQI } 400-500+$).

**AeroPulse AI** addresses this through 5 integrated defense pillars:
1. **Low-Emission Daily Routines**: Synchronizes school runs, morning transit, and fitness schedules to avoid deadly nocturnal inversion peaks, prioritizing safe solar dispersion windows (1:00 PM – 3:30 PM).
2. **Indoor Air Quality (IAQ) Bio-Hacks**: Science-backed, low-cost interventions including DIY Corsi-Rosenthal MERV-13 air purifiers ($25 equivalent to $500 commercial units), NASA botanical air-filtering plant triads, and window weather-stripping.
3. **Sustainable Alternatives Matrix**: Quantified swap recommendations (Electric Metro + EV last-mile vs single-occupant petrol/diesel ICE; Induction cooktops vs open gas/biomass; Microbial compost pits vs garden waste burning).
4. **Direct Impact Quantification Dashboard**: Calculates exact personal $\text{PM}_{2.5}$ inhalation avoided ($\mu\text{g/m}^3$), carbon footprint reduction ($\text{kg CO}_2\text{e}$), and passive cigarette equivalency spared per day.
5. **Community Vanguard**: Connects housing societies, schools, and streets to monitor micro-hotspots, coordinate electric carpooling, and enforce zero open-smoldering neighborhood watches.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                          │
│   • Conversational Prompt Input ("Family with asthmatic child...")     │
│   • Hotspot Calibrator (Delhi, Lahore, Beijing, Mumbai, Custom)        │
│   • Vulnerability Profiler (General Adult, Kids/School, Asthma/Elderly)│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AEROPULSE GENAI SYNTHESIS ENGINE                     │
│   • Natural Language Entity Extractor (Vulnerabilities, Commute, Fuel) │
│   • 24-Hour Thermal Inversion Curve Modeler (Nocturnal Trap Bypass)    │
│   • IAQ Exposure & Carbon Offset Calculator Engine                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Routine Timeline│       │ IAQ Bio-Hacks   │       │ Sustainable Alt │
│ • Hour-by-Hour  │       │ • DIY HEPA Box  │       │ • Metro/EV Swap │
│ • Window Guides │       │ • NASA Plants   │       │ • Induction Heat│
└─────────────────┘       └─────────────────┘       └─────────────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     IMPACT QUANTIFICATION DASHBOARD                    │
│   • Chart.js Inversion Curve + Exposure Comparison Chart               │
│   • PM2.5 Inhaled vs Avoided  • Cigarettes Equivalent Spared           │
│   • 1-Click Clean Air Action Plan Dossier (Executive Print View)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Automated Testing Suite (100% Passed)

AeroPulse AI includes an automated test harness designed for zero-dependency execution across any evaluation container:

```bash
# Navigate to challenge folder
cd challenge-6-cleanair

# Run the test suite
npm test
```

### Verified Test Matrix:
- **Suite 1:** File integrity, HTML5 doctype, and WCAG 2.1 AA landmark verification (`role="banner"`, `role="main"`, `role="dialog"`, `role="navigation"`, Skip Link).
- **Suite 2:** Application state initialization and headless DOM verification.
- **Suite 3:** Interactive switching across all 5 modules (`routines`, `indoor`, `alternatives`, `impact`, `community`).
- **Suite 4:** Smog hotspot recalibration across Delhi, Lahore, Beijing, and Mumbai.
- **Suite 5:** Vulnerability profiling (General, Kids, Asthma) and alert prioritizing.
- **Suite 6:** Routine task toggles, bulk verification, and exposure calculation.
- **Suite 7:** Sustainable alternatives adoption and carbon offset ledger.
- **Suite 8:** GenAI natural language prompt parsing and adaptive strategy synthesis.

---

## ♿ WCAG 2.1 AA Accessibility Standards Built-In

- **Form Association:** Every `<input>` and `<select>` is linked to an explicit matching `<label for="...">`.
- **Keyboard & Screen Reader Support:** Skip navigation links (`href="#main-content"`), semantic landmarks, visible focus outlines (`outline: 2px solid #38BDF8`), and ARIA live regions for notifications.
- **Table Scopes:** Structured tables with `scope="col"` headers.

---

## 🚀 Quick Start Guide

### Option 1: Instant Local View
```bash
# From repository root
start challenge-6-cleanair/index.html
```

### Option 2: Run via Local HTTP Server
```bash
cd challenge-6-cleanair
python -m http.server 3000
# Open http://localhost:3000 in your browser
```
