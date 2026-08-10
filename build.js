const fs = require('fs');
const path = require('path');

const root = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const jsonLd = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const absoluteUrl = (value) => new URL(String(value).replace(/^\.\//, ''), `${config.site.url}/`).href;
const isExternalUrl = (value) => /^https?:\/\//i.test(value);
const isContactUrl = (value) => /^(tel|mailto):/i.test(value);

const icons = {
  person: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.8 21a7.2 7.2 0 0 1 14.4 0"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>`,
  article: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.8h8.3L19 7.5v13.7H6Z"/><path d="M14 2.8v5h5M9 12h6M9 16h6"/></svg>`,
  contact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.1-.9L3 21l1.8-4.8A8.8 8.8 0 0 1 3.5 12a8.5 8.5 0 0 1 9-8.5A8.4 8.4 0 0 1 21 11.5Z"/><path d="M8.5 10h7M8.5 14h4.5"/></svg>`,
  consult: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.1-.9L3 21l1.8-4.8A8.8 8.8 0 0 1 3.5 12a8.5 8.5 0 0 1 9-8.5A8.4 8.4 0 0 1 21 11.5Z"/><path d="M8.5 10h7M8.5 14h4.5"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M12 9v6M9 12h6"/></svg>`,
  external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,
  zhihu: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#0066ff"/><text x="12" y="16" fill="#fff" font-size="12" font-weight="700" font-family="sans-serif" text-anchor="middle">知</text></svg>`,
  xiaohongshu: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#ff2442"/><text x="12" y="16" fill="#fff" font-size="12" font-weight="700" font-family="sans-serif" text-anchor="middle">红</text></svg>`,
  bilibili: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#fb7299"/><path d="m8 5 2 2m6-2-2 2M6.8 8.5h10.4A1.8 1.8 0 0 1 19 10.3v6.2a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.5v-6.2a1.8 1.8 0 0 1 1.8-1.8Z" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M9 12.2v1.7m6-1.7v1.7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`
};

const pageUrl = (file) => file === 'index.html' ? `${config.site.url}/` : `${config.site.url}/${file}`;

const personEntity = {
  '@type': 'Person',
  '@id': `${config.site.url}/#person`,
  name: config.profile.full_name,
  alternateName: config.profile.name,
  url: `${config.site.url}/about.html`,
  image: absoluteUrl(config.profile.images.jpg_1920),
  jobTitle: config.profile.job_title,
  description: config.profile.summary,
  email: `mailto:${config.profile.email}`,
  telephone: config.profile.phones.map((phone) => phone.value),
  worksFor: {
    '@type': 'Organization',
    name: config.profile.firm
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: '北京师范大学'
  },
  knowsAbout: [
    '民商事诉讼',
    '公司法',
    '公司与股东争议',
    '强制执行',
    '财产保全',
    '执行衍生诉讼',
    '互联网行业',
    '区块链行业'
  ],
  sameAs: [
    'https://www.niuzonghui.com/',
    ...config.socials.map((social) => social.url)
  ]
};

const websiteEntity = {
  '@type': 'WebSite',
  '@id': `${config.site.url}/#website`,
  url: `${config.site.url}/`,
  name: config.site.name,
  description: config.site.description,
  thumbnailUrl: absoluteUrl('/assets/baidu-site-logo-200x150.jpg'),
  inLanguage: 'zh-CN',
  publisher: { '@id': `${config.site.url}/#person` },
  hasPart: config.navigation.map((item) => ({
    '@type': 'WebPage',
    name: item.name,
    url: absoluteUrl(item.url)
  }))
};

function structuredDataForPage({ file, title, description, navName }) {
  const url = pageUrl(file);
  const graph = [websiteEntity, personEntity];
  const pageConfig = config.pages.find((page) => page.file === file);

  const webpage = {
    '@type': file === 'about.html' ? 'ProfilePage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'zh-CN',
    isPartOf: { '@id': `${config.site.url}/#website` },
    about: { '@id': `${config.site.url}/#person` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: absoluteUrl(config.site.og_image),
      width: 1200,
      height: 630
    },
    dateModified: config.site.last_modified
  };

  if (pageConfig?.search_terms?.length) webpage.keywords = pageConfig.search_terms.join(', ');
  if (file === 'about.html') webpage.mainEntity = { '@id': `${config.site.url}/#person` };
  graph.push(webpage);

  if (file !== 'index.html') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首页',
          item: `${config.site.url}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: navName,
          item: url
        }
      ]
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function renderHead({ file, title, description, navName, noindex = false, preloadHero = false }) {
  const canonical = pageUrl(file);
  const robots = noindex
    ? 'noindex,follow'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  const preload = preloadHero ? `
    <link rel="preload" as="image" href="${escapeHtml(config.profile.images.avif_1280)}" type="image/avif" fetchpriority="high" imagesrcset="${escapeHtml(config.profile.images.avif_1280)} 1280w, ${escapeHtml(config.profile.images.avif_1920)} 1920w" imagesizes="(max-width: 720px) 100vw, 680px">` : '';
  const baiduVerification = file === 'index.html'
    ? '\n    <meta name="baidu-site-verification" content="codeva-Y9cLvzfXfq">'
    : '';
  const data = structuredDataForPage({ file, title, description, navName });

  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="applicable-device" content="pc,mobile">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="author" content="${escapeHtml(config.profile.full_name)}">${baiduVerification}
    <meta name="robots" content="${robots}">
    <meta name="theme-color" content="${escapeHtml(config.site.theme_color)}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="./assets/favicon-48.png" type="image/png" sizes="48x48">
    <link rel="apple-touch-icon" href="./assets/apple-touch-icon.png">
    <link rel="stylesheet" href="./style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">${preload}
    <meta property="og:locale" content="zh_CN">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escapeHtml(config.site.name)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${absoluteUrl(config.site.og_image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(config.profile.name)}职业形象">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${absoluteUrl(config.site.og_image)}">
    <script type="application/ld+json">${jsonLd(data)}</script>`;
}

function renderSiteNav(currentFile) {
  const homeCurrent = currentFile === 'index.html' ? ' aria-current="page"' : '';
  const items = [
    `<a href="./"${homeCurrent}>首页</a>`,
    ...config.navigation.map((item) => {
      const current = item.url === `./${currentFile}` ? ' aria-current="page"' : '';
      return `<a href="${escapeHtml(item.url)}"${current}>${escapeHtml(item.name)}</a>`;
    })
  ];
  return `<nav class="site-nav" aria-label="主要导航">${items.join('')}</nav>`;
}

function renderFooter({ includeNavigation = true } = {}) {
  const footerLinks = [
    ...(includeNavigation
      ? config.navigation.map((item) => `<a href="${escapeHtml(item.url)}" class="footer-link">${escapeHtml(item.name)}</a>`)
      : []),
    '<a href="./privacy.html" class="footer-link">隐私权政策</a>'
  ].join(' &middot; ');

  return `
      <footer class="site-footer">
        <nav class="footer-nav" aria-label="页脚导航">${footerLinks}</nav>
        <p class="copyright-line">
          <span class="copyright-text">© <span data-copyright-year data-start-year="${config.copyright.start_year}">${config.copyright.start_year}</span> ${escapeHtml(config.copyright.site_name)} ${escapeHtml(config.copyright.suffix)}</span>
          <span class="icp-item"><span>${escapeHtml(config.copyright.icp_prefix)}</span><a href="${escapeHtml(config.copyright.icp_url)}" class="icp-link" target="_blank" rel="noopener noreferrer">${escapeHtml(config.copyright.icp_label)}</a></span>
        </p>
      </footer>`;
}

function renderShareButton(className = 'share-button') {
  return `<button class="${className}" type="button" data-share-button aria-label="分享此页面" title="分享此页面">${icons.share}</button>`;
}

function renderCopyrightAndShareScript(description) {
  return `
    <div class="share-toast" role="status" aria-live="polite"></div>
    <script>
      (function () {
        const copyrightYear = document.querySelector('[data-copyright-year]');
        const shareButton = document.querySelector('[data-share-button]');
        const shareToast = document.querySelector('.share-toast');

        if (copyrightYear) {
          const startYear = Number(copyrightYear.dataset.startYear);
          const currentYear = new Date().getFullYear();
          copyrightYear.textContent = currentYear > startYear ? startYear + '-' + currentYear : String(startYear);
        }

        if (!shareButton || !shareToast) return;
        let toastTimer;

        function showShareMessage(message) {
          shareToast.textContent = message;
          shareToast.classList.add('is-visible');
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(function () {
            shareToast.classList.remove('is-visible');
          }, 2200);
        }

        async function copyCurrentUrl() {
          try {
            await navigator.clipboard.writeText(window.location.href);
          } catch (error) {
            const input = document.createElement('textarea');
            input.value = window.location.href;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
          }
          showShareMessage('链接已复制');
        }

        shareButton.addEventListener('click', async function () {
          const shareData = {
            title: document.title,
            text: ${JSON.stringify(description)},
            url: window.location.href
          };

          if (navigator.share) {
            try {
              await navigator.share(shareData);
            } catch (error) {
              if (error.name !== 'AbortError') await copyCurrentUrl();
            }
          } else {
            await copyCurrentUrl();
          }
        });
      }());
    </script>`;
}

function renderPicture({ className = 'hero-image-layer', alt = config.profile.image_alt, eager = false } = {}) {
  const loading = eager ? '' : ' loading="lazy"';
  const priority = eager ? ' fetchpriority="high"' : '';
  return `<picture>
            <source type="image/avif" srcset="${config.profile.images.avif_1280} 1280w, ${config.profile.images.avif_1920} 1920w" sizes="(max-width: 720px) 100vw, 680px">
            <source type="image/webp" srcset="${config.profile.images.webp_1280} 1280w, ${config.profile.images.webp_1920} 1920w" sizes="(max-width: 720px) 100vw, 680px">
            <img class="${className}" src="${config.profile.images.jpg_1280}" srcset="${config.profile.images.jpg_1280} 1280w, ${config.profile.images.jpg_1920} 1920w" sizes="(max-width: 720px) 100vw, 680px" width="1920" height="1280" alt="${escapeHtml(alt)}" decoding="async"${loading}${priority}>
          </picture>`;
}

function renderInternalNavigation() {
  return `
        <section class="internal-navigation" aria-labelledby="internal-navigation-title">
          <div class="section-heading-row">
            <h2 id="internal-navigation-title" class="category-title">了解牛宗汇律师</h2>
            <span>站内导航</span>
          </div>
          <div class="internal-link-grid">
            ${config.navigation.map((item) => `
              <a href="${escapeHtml(item.url)}" class="internal-link-card">
                <span class="internal-link-icon" aria-hidden="true">${icons[item.icon_type] || icons.arrow}</span>
                <span class="internal-link-copy">
                  <strong>${escapeHtml(item.name)}</strong>
                  <small>${escapeHtml(item.description)}</small>
                </span>
                <span class="internal-link-arrow" aria-hidden="true">${icons.arrow}</span>
              </a>`).join('')}
          </div>
        </section>`;
}

function renderHomepageCategories() {
  return config.homepage_categories.map((category) => `
          <section class="category-section">
            <h2 class="category-title">${escapeHtml(category.title)}</h2>
            <div class="links-container">
              ${category.links.map((link, index) => `
                <a href="${escapeHtml(link.url)}" class="link-btn${index === 0 && category === config.homepage_categories[0] ? ' jump-anim' : ''}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(link.name)}（在新窗口打开）">
                  <span class="btn-left-icon" aria-hidden="true">${icons[link.icon_type] || icons.article}</span>
                  <span class="btn-text">${escapeHtml(link.name)}</span>
                  <span class="btn-right-icon" aria-hidden="true">${icons.external}</span>
                </a>`).join('')}
            </div>
          </section>`).join('');
}

function renderSocials() {
  return config.socials.map((social) => `
          <a href="${escapeHtml(social.url)}" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="访问${escapeHtml(social.label)}（在新窗口打开）" title="${escapeHtml(social.label)}">
            ${icons[social.platform] || ''}
          </a>`).join('');
}

function renderHomeScript() {
  return `
    <script>
      (function () {
        const hero = document.querySelector('.hero-bg');
        const pageShell = document.querySelector('.page-shell');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let scrollFramePending = false;

        function updateScrollProgress() {
          scrollFramePending = false;
          if (reduceMotion.matches) {
            document.documentElement.style.setProperty('--scroll-progress', 0);
            pageShell.style.setProperty('--scroll-progress', 0);
            pageShell.style.setProperty('--hero-drift', '0px');
            return;
          }

          const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
          const distance = Math.max(0, scrollTop - pageShell.offsetTop);
          const progress = Math.min(1, distance / Math.max(hero.offsetHeight * 0.95, 1));
          const heroDrift = Math.min(distance * 0.16, hero.offsetHeight * 0.16);
          const value = progress.toFixed(3);
          document.documentElement.style.setProperty('--scroll-progress', value);
          pageShell.style.setProperty('--scroll-progress', value);
          pageShell.style.setProperty('--hero-drift', heroDrift.toFixed(1) + 'px');
        }

        function requestScrollUpdate() {
          if (scrollFramePending) return;
          scrollFramePending = true;
          window.requestAnimationFrame(updateScrollProgress);
        }

        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
        window.addEventListener('resize', requestScrollUpdate, { passive: true });
        reduceMotion.addEventListener?.('change', requestScrollUpdate);
        updateScrollProgress();

        document.documentElement.classList.add('has-motion');
        const revealItems = document.querySelectorAll('.category-section, .socials-section');

        if (reduceMotion.matches || !('IntersectionObserver' in window)) {
          revealItems.forEach(function (item) { item.classList.add('is-visible'); });
        } else {
          const revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            });
          }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

          revealItems.forEach(function (item) { revealObserver.observe(item); });
        }

        window.requestAnimationFrame(function () { pageShell.classList.add('is-ready'); });

        function applyImageGlow(imageUrl) {
          const image = new Image();
          image.decoding = 'async';
          image.onload = function () {
            try {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d', { willReadFrequently: true });
              const sampleWidth = 48;
              const sampleHeight = 32;
              canvas.width = sampleWidth;
              canvas.height = sampleHeight;
              context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
              const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
              const buckets = Array.from({ length: 24 }, function () { return { weight: 0, r: 0, g: 0, b: 0 }; });

              for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const chroma = max - min;
                const brightness = (r + g + b) / 3;
                if (chroma < 16 || brightness < 24 || brightness > 246) continue;

                let hue = 0;
                if (max === r) hue = ((g - b) / chroma) % 6;
                else if (max === g) hue = ((b - r) / chroma) + 2;
                else hue = ((r - g) / chroma) + 4;
                hue = (hue * 60 + 360) % 360;

                const bucket = buckets[Math.floor(hue / 15)];
                const weight = Math.pow(chroma / 255, 2) * (0.35 + brightness / 255);
                bucket.weight += weight;
                bucket.r += r * weight;
                bucket.g += g * weight;
                bucket.b += b * weight;
              }

              const colors = buckets
                .filter(function (bucket) { return bucket.weight > 0; })
                .sort(function (a, b) { return b.weight - a.weight; })
                .slice(0, 2)
                .map(function (bucket) {
                  return [
                    Math.round(bucket.r / bucket.weight),
                    Math.round(bucket.g / bucket.weight),
                    Math.round(bucket.b / bucket.weight)
                  ].join(', ');
                });

              if (colors[0]) document.documentElement.style.setProperty('--halo-primary', colors[0]);
              if (colors[1]) document.documentElement.style.setProperty('--halo-secondary', colors[1]);
            } catch (error) {
              // 像素读取失败时保留 CSS 中的安全默认色。
            }
          };
          image.src = imageUrl;
        }

        applyImageGlow(hero.dataset.imageSrc);
      }());
    </script>`;
}

function buildHomePage() {
  const title = config.site.title;
  const description = config.site.description;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>${renderHead({ file: 'index.html', title, description, navName: '首页' })}
</head>
<body>
  <div class="ambient-backdrop" aria-hidden="true"></div>
  <div class="page-shell">
    <div class="hero-bg" data-image-src="${config.profile.images.original}">
      <div class="hero-image-layer" style="background-image: url('${config.profile.images.original}');" aria-hidden="true"></div>
      <div class="gradient-overlay" aria-hidden="true"></div>
      ${renderShareButton()}
    </div>

    <main class="main-container">
      <header class="profile-header">
        <h1 class="profile-name">${escapeHtml(config.profile.homepage_display_name)}</h1>
      </header>

      <div class="links-section">
        ${renderHomepageCategories()}
      </div>

      <section class="socials-section" aria-label="牛宗汇律师的社交媒体账号">
        ${renderSocials()}
      </section>
    </main>
    ${renderFooter()}
  </div>
  ${renderCopyrightAndShareScript(description)}
  ${renderHomeScript()}
</body>
</html>`;
}

function renderContentLinks(links = []) {
  if (!links.length) return '';
  return `<div class="content-link-list">${links.map((link) => {
    const external = isExternalUrl(link.url);
    const attributes = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    const icon = external ? icons.external : icons.arrow;
    return `
      <a href="${escapeHtml(link.url)}" class="content-link"${attributes}>
        <span>
          <strong>${escapeHtml(link.name)}</strong>
          ${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}
        </span>
        <span aria-hidden="true">${icon}</span>
      </a>`;
  }).join('')}</div>`;
}

function renderContentSection(section) {
  return `
        <section class="content-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
          ${(section.bullets || []).length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
          ${renderContentLinks(section.links)}
        </section>`;
}

function buildContentPage(page) {
  const file = page.file;
  const isContact = file === 'contact.html';
  const aboutImage = file === 'about.html' ? `
        <figure class="content-portrait">
          ${renderPicture({ className: 'content-portrait-image', alt: config.profile.image_alt })}
          <figcaption>${escapeHtml(config.profile.name)} · ${escapeHtml(config.profile.firm)}</figcaption>
        </figure>` : '';
  const ctaHref = isContact ? './' : './contact.html';
  const ctaLabel = isContact ? '返回首页' : '联系牛宗汇律师';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>${renderHead({ file, title: page.title, description: page.description, navName: page.nav_name })}
</head>
<body class="content-body">
  <div class="ambient-backdrop" aria-hidden="true"></div>
  <div class="content-shell">
    <header class="content-topbar">
      <a href="./" class="brand-link" aria-label="返回牛宗汇律师首页">
        <span class="brand-mark" aria-hidden="true">牛</span>
        <span>${escapeHtml(config.site.name)}</span>
      </a>
      ${renderShareButton('content-share-button')}
    </header>
    ${renderSiteNav(file)}

    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑导航">
        <a href="./">首页</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(page.nav_name)}</span>
      </nav>
      <header class="content-hero">
        <p class="content-eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.heading)}</h1>
        <p class="content-lead">${escapeHtml(page.lead)}</p>
      </header>
      ${aboutImage}
      ${page.sections.map(renderContentSection).join('')}

      <aside class="legal-note">
        <strong>重要说明</strong>
        <p>${escapeHtml(config.profile.disclaimer)}</p>
      </aside>
      <a class="content-cta" href="${ctaHref}">${ctaLabel}<span aria-hidden="true">${icons.arrow}</span></a>
    </main>
    ${renderFooter()}
  </div>
  ${renderCopyrightAndShareScript(page.description)}
</body>
</html>`;
}

function buildPrivacyPage() {
  const file = 'privacy.html';
  const title = '隐私权政策 - 牛宗汇律师';
  const description = '牛宗汇律师个人网站隐私权政策，说明访问日志、第三方链接、Cookie及联系方式的处理方式。';
  const privacySections = [
    {
      heading: '1. 信息收集',
      paragraphs: ['本网站主要提供律师个人信息、内容导航和链接跳转服务，不设置账号注册或登录功能。当您访问本网站时，服务器可能产生 IP 地址、访问时间、浏览器类型等基础网络日志，用于保障网站安全和排查故障。']
    },
    {
      heading: '2. 电话与邮件沟通',
      paragraphs: ['当您主动拨打电话或发送电子邮件时，您提供的信息将用于回应咨询、进行利益冲突检索或评估是否能够接受委托。请勿在尚未确认委托关系前发送身份证件、账户密码等不必要的敏感信息。']
    },
    {
      heading: '3. 第三方链接',
      paragraphs: ['本网站包含前往咨询网站、微信公众号、知乎、小红书、哔哩哔哩等第三方服务的链接。离开本网站后，第三方服务将按照其自身的隐私政策处理信息，请在提交个人信息前阅读相应规则。']
    },
    {
      heading: '4. Cookie 与类似技术',
      paragraphs: ['本静态网站当前不提供依赖 Cookie 的账号或个性化功能。服务器、CDN 或安全防护服务可能使用必要的网络标识，以提供访问、安全和故障排查功能。']
    },
    {
      heading: '5. 政策更新',
      paragraphs: ['本政策可能因网站功能或适用规则变化而更新。更新后的版本将在本页面发布，并在页面中标注最近更新日期。']
    },
    {
      heading: '6. 联系方式',
      paragraphs: [`如对本政策有疑问，可发送邮件至 ${config.profile.email}。`]
    }
  ];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>${renderHead({ file, title, description, navName: '隐私权政策', noindex: true })}
</head>
<body class="content-body">
  <div class="ambient-backdrop" aria-hidden="true"></div>
  <div class="content-shell">
    <header class="content-topbar">
      <a href="./" class="brand-link"><span class="brand-mark" aria-hidden="true">牛</span><span>${escapeHtml(config.site.name)}</span></a>
    </header>
    ${renderSiteNav(file)}
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑导航"><a href="./">首页</a><span aria-hidden="true">/</span><span aria-current="page">隐私权政策</span></nav>
      <header class="content-hero">
        <p class="content-eyebrow">隐私权政策</p>
        <h1>隐私权政策</h1>
        <p class="content-lead">最近更新：2026年8月8日</p>
      </header>
      ${privacySections.map(renderContentSection).join('')}
    </main>
    ${renderFooter()}
  </div>
  ${renderCopyrightAndShareScript(description)}
</body>
</html>`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${config.site.url}/sitemap.xml
`;
}

function buildSitemap() {
  const entries = [
    { file: 'index.html', priority: '1.0', changefreq: 'weekly' },
    ...config.pages.map((page) => ({ file: page.file, priority: '0.8', changefreq: page.file === 'insights.html' ? 'weekly' : 'monthly' }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:mobile="http://www.baidu.com/schemas/sitemap-mobile/1/">
${entries.map((entry) => `  <url>
    <loc>${escapeXml(pageUrl(entry.file))}</loc>
    <lastmod>${config.site.last_modified}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <mobile:mobile type="pc,mobile"/>
  </url>`).join('\n')}
</urlset>
`;
}

function writeOutput(file, content) {
  fs.writeFileSync(path.join(root, file), `${content.trim().replace(/[ \t]+$/gm, '')}\n`, 'utf8');
}

writeOutput('index.html', buildHomePage());
config.pages.forEach((page) => writeOutput(page.file, buildContentPage(page)));
writeOutput('privacy.html', buildPrivacyPage());
writeOutput('robots.txt', buildRobots());
writeOutput('sitemap.xml', buildSitemap());

console.log(`✅ 构建成功：生成首页、${config.pages.length} 个栏目页、隐私页、robots.txt 与 sitemap.xml`);
