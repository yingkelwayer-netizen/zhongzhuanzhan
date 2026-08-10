const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));

execFileSync(process.execPath, ['build.js'], { cwd: root, stdio: 'pipe' });

const indexableFiles = ['index.html', ...config.pages.map((page) => page.file)];
const titles = new Set();
const canonicals = new Set();

function matches(html, pattern) {
  return [...html.matchAll(pattern)];
}

for (const file of indexableFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/);
  const description = html.match(/<meta name="description" content="([^"]+)">/);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/);
  const structuredData = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

  assert(title, `${file} must have a title`);
  assert(description && description[1].length >= 35, `${file} must have a useful meta description`);
  assert(canonical, `${file} must have a canonical URL`);
  assert.strictEqual(matches(html, /<h1(?:\s|>)/g).length, 1, `${file} must have exactly one H1`);
  assert.match(html, /<meta name="applicable-device" content="pc,mobile">/, `${file} must declare Baidu responsive compatibility`);
  assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large/, `${file} must be indexable with large image previews`);
  assert.match(html, /<meta property="og:image" content="https:\/\/zonghuin\.com\/assets\/og-card\.jpg">/, `${file} must use the absolute OG image`);
  assert.doesNotMatch(html, /<meta name="keywords"/, `${file} must not use obsolete meta keywords`);
  if (file !== 'index.html') {
    assert.doesNotMatch(html, /NIUZONGHUI\.jpg/, `${file} should use an optimized portrait asset`);
  }

  assert(!titles.has(title[1]), `Duplicate title found: ${title[1]}`);
  assert(!canonicals.has(canonical[1]), `Duplicate canonical found: ${canonical[1]}`);
  titles.add(title[1]);
  canonicals.add(canonical[1]);

  const parsed = JSON.parse(structuredData[1]);
  assert.strictEqual(parsed['@context'], 'https://schema.org', `${file} JSON-LD must use schema.org`);
  assert(Array.isArray(parsed['@graph']), `${file} JSON-LD must contain a graph`);
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(
  home,
  /<meta name="baidu-site-verification" content="codeva-Y9cLvzfXfq">/,
  'Homepage must retain the Baidu ownership verification tag'
);
const approvedHomeBody = home.slice(home.indexOf('<body'), home.lastIndexOf('</body>') + '</body>'.length);
const approvedHomeBodyHash = crypto.createHash('sha256').update(approvedHomeBody).digest('hex').toUpperCase();
assert.strictEqual(
  approvedHomeBodyHash,
  '9BF28C49EBBE95EEE8DA9D1AF0D5BAF7127C24F7F66A9376E09CA8445FECA7EC',
  'Homepage body must remain byte-for-byte identical to the owner-approved version'
);
assert.match(home, /background-image: url\('\.\/assets\/NIUZONGHUI\.jpg'\)/, 'Homepage must use the original portrait requested by the owner');
const homeStructuredData = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const websiteNode = homeStructuredData['@graph'].find((node) => node['@type'] === 'WebSite');
const homepageNode = homeStructuredData['@graph'].find((node) => node['@id'] === `${config.site.url}/#webpage`);
const siteParts = new Set((websiteNode.hasPart || []).map((part) => part.url));
assert(!Object.hasOwn(homepageNode, 'keywords'), 'Homepage structured data must remain free of inner-page long-tail keywords');
for (const page of config.pages) {
  assert(home.includes(`href="./${page.file}"`), `Homepage footer must link to ${page.file}`);
  assert(siteParts.has(`${config.site.url}/${page.file}`), `WebSite JSON-LD must identify ${page.file} as a site section`);

  const pageHtml = fs.readFileSync(path.join(root, page.file), 'utf8');
  for (const navigationItem of config.navigation) {
    assert(pageHtml.includes(`href="${navigationItem.url}"`), `${page.file} must link to ${navigationItem.url}`);
  }

  if (page.search_terms?.length) {
    const pageStructuredData = JSON.parse(pageHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const pageNode = pageStructuredData['@graph'].find((node) => node['@id'] === `${config.site.url}/${page.file}#webpage`);
    const visiblePageHtml = pageHtml.replace(/<script[\s\S]*?<\/script>/g, '');
    assert.strictEqual(pageNode.keywords, page.search_terms.join(', '), `${page.file} must expose its long-tail topics in WebPage JSON-LD`);
    for (const term of page.search_terms) {
      assert(visiblePageHtml.includes(term), `${page.file} must visibly and naturally cover its structured long-tail topic: ${term}`);
      assert(!home.includes(term), `Homepage must not contain the inner-page long-tail term: ${term}`);
    }
  }
}

const services = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
assert.match(services, /<h2>北京公司纠纷律师与股东争议<\/h2>/, 'Services page must naturally target Beijing company disputes');
assert.match(services, /<h2>北京强制执行律师与衍生诉讼<\/h2>/, 'Services page must naturally target Beijing enforcement matters');
assert.match(services, /<h2>北京财产保全律师服务<\/h2>/, 'Services page must naturally target Beijing asset preservation matters');

const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
assert.match(contact, /<title>北京法律咨询律师联系方式 - 牛宗汇律师电话与邮箱<\/title>/, 'Contact page must target Beijing legal consultation contact intent');

const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
assert.match(privacy, /<meta name="robots" content="noindex,follow">/, 'Privacy page should not compete as a search landing page');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const file of indexableFiles) {
  const expectedUrl = file === 'index.html' ? `${config.site.url}/` : `${config.site.url}/${file}`;
  assert(sitemap.includes(`<loc>${expectedUrl}</loc>`), `Sitemap must contain ${expectedUrl}`);
}
assert(!sitemap.includes('privacy.html'), 'Privacy page must be excluded from the sitemap');
assert.match(sitemap, /<mobile:mobile type="pc,mobile"\/>/, 'Sitemap must identify responsive URLs for Baidu');

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent: \*\s+Allow: \//, 'robots.txt must allow crawling');
assert.match(robots, /Sitemap: https:\/\/zonghuin\.com\/sitemap\.xml/, 'robots.txt must declare the canonical sitemap');

for (const asset of ['NIUZONGHUI-1920.avif', 'NIUZONGHUI-1920.webp', 'NIUZONGHUI-1920.jpg', 'og-card.jpg']) {
  const size = fs.statSync(path.join(root, 'assets', asset)).size;
  assert(size < 150 * 1024, `${asset} should stay below the 150 KB image budget`);
}

console.log(`SEO output verified: ${indexableFiles.length} indexable pages with unique metadata, canonical URLs, JSON-LD, sitemap coverage, and optimized images.`);
