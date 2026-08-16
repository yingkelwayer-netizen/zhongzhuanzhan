const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const aboutConfig = config.pages.find((page) => page.file === 'about.html');

assert(aboutConfig, 'config.json must define about.html');
assert.strictEqual(config.profile.license_number, '11101202610281300');
assert.match(aboutConfig.sections[0].paragraphs[0], /^专注于民商事诉讼/);

function build() {
  execFileSync(process.execPath, ['build.js'], { cwd: root, stdio: 'pipe' });
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

build();

const about = read('about.html');
const styles = read('style.css');
const sitemap = read('sitemap.xml');

assert.strictEqual(count(about, /class="about-profile-hero"/g), 1, 'About must have one portrait hero');
assert.strictEqual(count(about, /<h1>牛宗汇<\/h1>/g), 1, 'About must have one approved H1');
assert.match(about, /<body class="content-body about-body">/);
assert.match(about, /<main class="content-main about-main">/);
assert.match(about, /<img class="about-portrait-image"[^>]*fetchpriority="high"/);
assert.doesNotMatch(about.match(/<img class="about-portrait-image"[^>]*>/)[0], /loading="lazy"/);
assert.match(about, /<link rel="preload" as="image"[^>]*fetchpriority="high"/);

const escapedLicenseUrl = config.profile.license_url.replace('&', '&amp;');
const licenseMarkup = `执业证号：<a href="${escapedLicenseUrl}" target="_blank" rel="noopener noreferrer">${config.profile.license_number}</a>`;
assert(about.includes(licenseMarkup), 'Only the license number must be linked to the official lookup');
assert.doesNotMatch(about, /<a[^>]*>执业证号/);
assert(about.includes(aboutConfig.disclaimer), 'About must use its page-specific disclaimer');

const structuredData = JSON.parse(about.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const profilePage = structuredData['@graph'].find((node) => node['@type'] === 'ProfilePage');
const person = structuredData['@graph'].find((node) => node['@type'] === 'Person');
assert(profilePage, 'About JSON-LD must use ProfilePage');
assert.strictEqual(profilePage.datePublished, aboutConfig.date_published);
assert.strictEqual(profilePage.dateModified, aboutConfig.last_modified);
assert.strictEqual(person.jobTitle, config.profile.job_title);
assert.strictEqual(person.worksFor.url, config.profile.firm_url);
assert.strictEqual(person.address.addressLocality, '北京市');

assert.match(styles, /\.about-body \.content-shell\s*{[^}]*width:\s*min\(680px, 100%\)/s, 'Desktop About must retain the 680px vertical frame');
assert.match(styles, /\.about-profile-hero\s*{[^}]*background:\s*linear-gradient\(180deg, #ededee 0%, #f8f8fa 100%\)/s, 'Only the portrait hero gets the Apple-inspired light surface');
assert.match(styles, /\.about-profile-hero::after\s*{[^}]*rgba\(246, 246, 248, 0\.98\)/s);
assert.match(styles, /\.about-profile-copy\s*{[^}]*color:\s*#1d1d1f/s, 'Portrait copy must remain legible on the light surface');
assert.match(styles, /\.about-body\s*{[^}]*--about-paper:\s*var\(--bg-color\)/s, 'The rest of About must retain the site dark palette');

const mobileStart = styles.indexOf('@media (max-width: 720px)');
const mobileEnd = styles.indexOf('@media (max-width: 480px)', mobileStart);
assert(mobileStart >= 0 && mobileEnd > mobileStart, 'About must define its mobile composition');
const mobileBlock = styles.slice(mobileStart, mobileEnd);
assert.match(mobileBlock, /\.about-profile-hero\s*{[^}]*display:\s*grid[^}]*background:\s*#fff/s);
assert.match(mobileBlock, /\.about-portrait-stage\s*{[^}]*order:\s*1[^}]*height:\s*300px/s, 'Portrait must precede copy on mobile');
assert.match(mobileBlock, /\.about-profile-copy\s*{[^}]*order:\s*2/s, 'Copy must follow portrait on mobile');

for (const page of config.pages.filter((page) => page.file !== 'about.html')) {
  const html = read(page.file);
  assert.doesNotMatch(html, /about-(?:body|main|profile-hero|section)/, `${page.file} must not receive About-only layout classes`);
}

assert.match(
  sitemap,
  new RegExp(`<loc>${config.site.url}/about\\.html<\\/loc>\\s*<lastmod>${aboutConfig.last_modified}<\\/lastmod>`),
  'Sitemap must publish the About-specific modification date'
);

const firstHash = crypto.createHash('sha256').update(about).digest('hex');
build();
const secondHash = crypto.createHash('sha256').update(read('about.html')).digest('hex');
assert.strictEqual(secondHash, firstHash, 'About generation must be idempotent');

console.log('About portrait layout and generated output checks passed.');
