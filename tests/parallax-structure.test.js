const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const buildSource = fs.readFileSync(path.join(root, 'build.js'), 'utf8');

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  assert(match, `Missing CSS rule: ${selector}`);
  return match[1];
}

const shellRule = rule('.page-shell');
const heroRule = rule('.hero-bg');
const contentRule = rule('.main-container');

assert.match(shellRule, /overflow:\s*clip/, 'The shell must not create a scroll container that disables sticky positioning');
assert.match(heroRule, /position:\s*sticky/, 'The hero must be a sticky background stage');
assert.doesNotMatch(heroRule, /position:\s*absolute/, 'The old single-layer absolute hero must not return');
assert.match(heroRule, /var\(--hero-drift\)/, 'The sticky stage must expose an independent drift transform');
assert.match(contentRule, /margin-top:\s*var\(--content-overlap\)/, 'Content must overlap the sticky stage instead of reserving an absolute-position gap');

const driftRateMatch = buildSource.match(/heroDrift\s*=\s*Math\.min\(distance\s*\*\s*([0-9.]+)/);
assert(driftRateMatch, 'Missing scroll-driven hero drift calculation');
const driftRate = Number(driftRateMatch[1]);

const mobileSeparationAt100 = 100 - (100 * driftRate);
const desktopStickyStart = 42;
const desktopDistanceAt100 = 100 - desktopStickyStart;
const desktopHeroMovementAt100 = desktopStickyStart + (desktopDistanceAt100 * driftRate);
const desktopSeparationAt100 = 100 - desktopHeroMovementAt100;

assert(mobileSeparationAt100 >= 75, `Mobile layer separation is too subtle: ${mobileSeparationAt100.toFixed(1)}px`);
assert(desktopSeparationAt100 >= 45, `Desktop layer separation is too subtle: ${desktopSeparationAt100.toFixed(1)}px`);

console.log(`Parallax structure verified: mobile separation ${mobileSeparationAt100.toFixed(1)}px, desktop separation ${desktopSeparationAt100.toFixed(1)}px at 100px scroll.`);
