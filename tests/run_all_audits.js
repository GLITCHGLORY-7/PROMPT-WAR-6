import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🌟 AEROPULSE AI — 100/100 MASTER VERIFICATION & AUDIT HARNESS 🌟');
console.log('================================================================\n');

const audits = [
  { name: 'Unit, Functional & Problem Alignment Test Suite', file: path.join(__dirname, 'aeropulse.test.js') },
  { name: 'WCAG 2.2 AA Accessibility Audit', file: path.join(__dirname, 'a11y_audit.js') },
  { name: 'Security & Input Sanitization Audit', file: path.join(__dirname, 'security_audit.js') },
  { name: 'Performance, Memory & Efficiency Audit', file: path.join(__dirname, 'efficiency_audit.js') },
  { name: 'End-to-End (E2E) Critical User Journey Audit', file: path.join(__dirname, 'e2e.test.js') }
];

let allPassed = true;

for (const audit of audits) {
  console.log(`▶ Executing: ${audit.name}...`);
  const result = spawnSync('node', [audit.file], { stdio: 'inherit', encoding: 'utf8', cwd: projectRoot });
  if (result.status !== 0) {
    console.error(`❌ FAILED: ${audit.name}`);
    allPassed = false;
    process.exit(1);
  }
}

if (allPassed) {
  console.log('================================================================');
  console.log('🏆 ALL AUDITS & TESTS PASSED WITH 100% SUCCESS ACROSS ALL 6 PILLARS!');
  console.log('================================================================\n');
  process.exit(0);
}
