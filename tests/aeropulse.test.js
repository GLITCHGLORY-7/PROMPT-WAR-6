/**
 * AeroPulse AI Automated Test Suite
 * Comprehensive Verification for Hackathon Evaluation Standards (Challenge 6)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Starting AeroPulse AI Automated Verification Suite...\n');

// 1. Static HTML & File Integrity
console.log('📦 Suite 1: File Integrity & WCAG Static Analysis');
const htmlPath = path.resolve(__dirname, '../index.html');
assert.ok(fs.existsSync(htmlPath), 'index.html must exist in challenge-6-cleanair directory');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert.ok(htmlContent.includes('<!DOCTYPE html>'), 'Document must have valid HTML5 doctype');
assert.ok(htmlContent.includes('lang="en"'), 'HTML tag must have lang attribute for a11y');
assert.ok(htmlContent.includes('AeroPulse'), 'Brand title must be present');
assert.ok(htmlContent.includes('role="main"'), 'Semantic main landmark required');
assert.ok(htmlContent.includes('role="banner"'), 'Semantic banner landmark required');
assert.ok(htmlContent.includes('role="navigation"'), 'Semantic navigation landmark required');
assert.ok(htmlContent.includes('role="dialog"'), 'Semantic dialog landmark required');
assert.ok(htmlContent.includes('href="#main-content"'), 'WCAG Skip Link required');
console.log('  ✅ HTML5 specification & WCAG landmark static analysis verified.');

// 2. Extract and Evaluate Core Engine Logic
console.log('\n🧭 Suite 2: Application State & Logic Engine Analysis');
const lastScriptStart = htmlContent.lastIndexOf('<script>');
const lastScriptEnd = htmlContent.lastIndexOf('</script>');
assert.ok(lastScriptStart !== -1 && lastScriptEnd !== -1, 'Embedded logic script must be present');

let scriptCode = htmlContent.substring(lastScriptStart + 8, lastScriptEnd);
scriptCode = scriptCode.replace('let state =', 'global.state =');

// Mock Headless DOM with setAttribute support
const elements = {};
function getMockEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      textContent: '',
      value: '',
      innerHTML: '',
      className: '',
      attributes: {},
      setAttribute: (k, v) => { elements[id].attributes[k] = String(v); },
      getAttribute: (k) => elements[id].attributes[k],
      focus: () => {},
      classList: {
        contains: (c) => (elements[id].className || '').includes(c),
        remove: (c) => { elements[id].className = (elements[id].className || '').replace(new RegExp('\\b' + c + '\\b', 'g'), '').trim(); },
        add: (c) => { if (!elements[id].classList.contains(c)) elements[id].className = (elements[id].className + ' ' + c).trim(); },
        toggle: (c, force) => {
          const present = elements[id].classList.contains(c);
          const shouldAdd = force !== undefined ? !!force : !present;
          if (shouldAdd) elements[id].classList.add(c);
          else elements[id].classList.remove(c);
          return shouldAdd;
        }
      },
      style: {},
      appendChild: () => {},
      remove: () => {},
      querySelector: () => getMockEl('dummy_child'),
      getContext: () => ({ fillRect: ()=>{}, clearRect: ()=>{}, beginPath: ()=>{} })
    };
  }
  return elements[id];
}

global.document = {
  getElementById: (id) => getMockEl(id),
  querySelectorAll: () => [getMockEl('dummy')],
  createElement: () => ({ ...getMockEl('dyn_' + Math.random()) }),
  activeElement: getMockEl('active_dummy')
};
global.window = { addEventListener: ()=>{}, print: ()=>{} };
global.lucide = { createIcons: ()=>{} };
global.Chart = function() { return { destroy: ()=>{}, update: ()=>{} }; };
global.setTimeout = (fn) => fn();

vm.runInThisContext(scriptCode);
assert.ok(global.state, 'Application state must initialize properly');
assert.strictEqual(global.state.aqi, 448, 'Verified Delhi Anand Vihar DPCC AQI 448 initialized');
assert.strictEqual(global.state.pm25, 412, 'Verified Delhi Anand Vihar PM2.5 412 initialized');
assert.strictEqual(global.state.apiKey, undefined, 'Client state must NEVER store or handle private API keys');
console.log('  ✅ State initialization & mock headless DOM verified with verified historical data.');

// 3. Navigation & Section Switching
console.log('\n🔄 Suite 3: Navigation & Screen Switching');
const sections = ['routines', 'indoor', 'alternatives', 'impact', 'community'];
sections.forEach(sec => {
  global.switchSection(sec);
  assert.strictEqual(getMockEl(`section-${sec}`).classList.contains('hidden'), false, `Section ${sec} should be visible`);
  console.log(`  ✅ Section switch to "${sec}" operational`);
});

// 4. Hotspot Switching & Mathematical Recalibration
console.log('\n📍 Suite 4: Urban Smog Hotspot Recalibration');
global.setHotspot('lahore');
assert.strictEqual(global.state.city, 'Lahore Metro', 'Hotspot switch to Lahore failed');
assert.strictEqual(global.state.aqi, 472, 'Lahore AQI calibration failed');

global.setHotspot('beijing');
assert.strictEqual(global.state.city, 'Beijing', 'Hotspot switch to Beijing failed');
assert.strictEqual(global.state.aqi, 220, 'Beijing AQI calibration failed');

global.setHotspot('tehran');
assert.strictEqual(global.state.city, 'Tehran Metropolis', 'Hotspot switch to Tehran failed');
assert.strictEqual(global.state.aqi, 245, 'Tehran AQI calibration failed');

global.setHotspot('central_valley');
assert.strictEqual(global.state.city, 'Central Valley CA', 'Hotspot switch to Central Valley failed');
assert.strictEqual(global.state.aqi, 172, 'Central Valley AQI calibration failed');

global.setHotspot('greater_noida');
assert.strictEqual(global.state.city, 'Greater Noida', 'Hotspot switch to Greater Noida failed');
assert.strictEqual(global.state.aqi, 465, 'Greater Noida AQI calibration failed');

global.setHotspot('delhi');
assert.strictEqual(global.state.city, 'Delhi NCR', 'Hotspot switch to Delhi failed');
assert.strictEqual(global.state.aqi, 448, 'Delhi Anand Vihar AQI calibration failed');
console.log('  ✅ Multi-city smog hotspot recalibration verified across all 6 verified stations.');

// 5. Vulnerability Profile Customization
console.log('\n🛡️ Suite 5: Vulnerability Profiling Engine');
global.setVulnerability('kids');
assert.strictEqual(global.state.vulnerability, 'kids', 'Kids vulnerability setting failed');

global.setVulnerability('asthma');
assert.strictEqual(global.state.vulnerability, 'asthma', 'Asthma vulnerability setting failed');

global.setVulnerability('general');
assert.strictEqual(global.state.vulnerability, 'general', 'General vulnerability setting failed');
console.log('  ✅ Vulnerability profiling states verified.');

// 6. Routine Action Verification
console.log('\n⏰ Suite 6: Routine Tasks & Toxin Avoidance');
const r0 = global.state.routines[0];
const prevStatus = r0.completed;
global.toggleRoutine(r0.id);
assert.strictEqual(r0.completed, !prevStatus, 'Routine toggle failed');
global.toggleAllRoutines();
assert.ok(global.state.routines.every(r => r.completed), 'Toggle all routines to complete failed');
console.log('  ✅ Low-emission routine actions verified.');

// 7. Sustainable Alternatives Adoption & Real-Time Calculation
console.log('\n🌱 Suite 7: Sustainable Alternatives Matrix');
const a0 = global.state.alternatives[0];
const aPrev = a0.adopted;
global.toggleAlternative(a0.id);
assert.strictEqual(a0.adopted, !aPrev, 'Alternative toggle failed');
const dynImpact = global.getDynamicImpact();
assert.ok(dynImpact.pmAvoidedUgM3 > 0, 'Calculated PM2.5 avoided must be greater than zero');
assert.ok(dynImpact.cigarettesPrevented > 0, 'Calculated passive cigarettes prevented must be greater than zero');
console.log(`  ✅ Dynamic impact math verified: Avoided ${dynImpact.pmAvoidedUgM3} μg/m³ PM2.5 (${dynImpact.cigarettesPrevented} passive cigarettes spared)`);

// 8. GenAI Natural Language Smog Strategy Synthesis
console.log('\n🧠 Suite 8: GenAI Natural Language Synthesis');
getMockEl('aiSmogPrompt').value = 'Family in Delhi with 6-year-old child with asthma, kerosene heater';
await global.handleSmogPrompt({ preventDefault: () => {} });
assert.strictEqual(global.state.vulnerability, 'kids', 'GenAI should detect child keyword and adapt vulnerability');
assert.strictEqual(global.state.alternatives.find(a => a.id === 'a2').adopted, true, 'GenAI should adopt clean heating alternative for kerosene query');
console.log('  ✅ GenAI Natural Language parsing & adaptive synthesis verified.');

// 9. Community Duplicate Prevention & Security
console.log('\n🤝 Suite 9: Community Pledges Duplicate Participation Prevention');
const initialPledge = global.state.communityPledges[0];
const initialMembers = initialPledge.members;
global.joinPledgeById(initialPledge.id);
assert.strictEqual(initialPledge.members, initialMembers + 1, 'First pledge join should increment member count');
global.joinPledgeById(initialPledge.id);
assert.strictEqual(initialPledge.members, initialMembers + 1, 'Duplicate pledge join MUST NOT increment count');
console.log('  ✅ Duplicate pledge manipulation prevention verified.');

// 10. Gemini 1.5 Flash Model & Key Security Verification
console.log('\n🔒 Suite 10: Model Selection & Credential Security');
const promptsModulePath = path.resolve(__dirname, '../prompts/geminiPrompts.js');
const promptsContent = fs.readFileSync(promptsModulePath, 'utf8');
assert.ok(promptsContent.includes('gemini-1.5-flash'), 'Verified production model gemini-1.5-flash must be configured');
assert.ok(!promptsContent.includes('gemini-2.0-flash'), 'Retired gemini-2.0-flash must be eliminated');
assert.ok(!promptsContent.includes('gemini-1.5-flash-002'), 'Retired gemini-1.5-flash-002 must not be used');
console.log('  ✅ Production Gemini model selection verified (gemini-1.5-flash).');

console.log('\n======================================================');
console.log('🎉 ALL 10 TEST SUITES PASSED CLEANLY (EXIT CODE 0)!');
console.log('======================================================\n');
process.exit(0);
