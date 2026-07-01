const fs = require('fs');
const path = require('path');

// 导入配置数据
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

// SVG 图标库
const icons = {
  of: `<svg viewBox="0 0 24 24" fill="#00AFF0"><circle cx="12" cy="12" r="12"/><path d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5zm0 11.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="#fff"/><circle cx="12" cy="12" r="3.5" fill="#fff"/></svg>`,
  fansly: `<svg viewBox="0 0 24 24" fill="#0099FF"><rect width="24" height="24" rx="6"/><path d="M12 7c-2.5 0-4.5 2-4.5 4.5 0 3.2 4.5 6.5 4.5 6.5s4.5-3.3 4.5-6.5C16.5 9 14.5 7 12 7zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#fff"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="#2AABEE"><circle cx="12" cy="12" r="12"/><path d="M5.5 11.5l13-5.5-2 14-4-3-2.5 2.5-.5-3.5 6.5-6-7 4.5-3.5-1.5z" fill="#fff"/></svg>`,
  iyaofans: `<svg viewBox="0 0 24 24" fill="#185ABD"><rect width="24" height="24" rx="6"/><text x="12" y="16" fill="#fff" font-size="10" font-weight="bold" font-family="Arial" text-anchor="middle">IYAO</text></svg>`,
  merch: `<svg viewBox="0 0 24 24" fill="#7A2222"><rect width="24" height="24" rx="6"/><circle cx="12" cy="10" r="4" fill="#fff"/><path d="M6 18c0-3 3-4 6-4s6 1 6 4" fill="#fff"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="right-icon"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="right-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="right-icon"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.95C18.88 4 12 4 12 4s-6.88 0-8.6.47a2.78 2.78 0 0 0-1.94 1.95C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 1.95C5.12 20 12 20 12 20s6.88 0 8.6-.47a2.78 2.78 0 0 0 1.94-1.95C23 15.86 23 12 23 12s0-3.86-.46-5.58zM9.54 15.57V8.43L15.82 12z"/></svg>`,
  zhihu: `<svg viewBox="0 0 24 24" fill="#0066FF"><rect width="24" height="24" rx="6"/><text x="12" y="16" fill="#fff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">知</text></svg>`,
  xiaohongshu: `<svg viewBox="0 0 24 24" fill="#FF2442"><rect width="24" height="24" rx="6"/><text x="12" y="16" fill="#fff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">红</text></svg>`
};

const renderLinks = (categories) => {
  return categories.map((cat, catIndex) => `
    <div class="category-section">
      <h3 class="category-title">${cat.title}</h3>
      <div class="links-container">
        ${cat.links.map((link, linkIndex) => {
          const extraClass = (catIndex === 0 && linkIndex === 0) ? ' jump-anim' : '';
          return `
          <a href="${link.url}" class="link-btn${extraClass}" target="_blank" rel="noopener noreferrer">
            <div class="btn-left-icon">
              ${icons[link.icon_type] || ''}
            </div>
            <span class="btn-text">${link.name}</span>
            <div class="btn-right-icon">
              ${icons[link.right_icon] || ''}
            </div>
          </a>
        `;
        }).join('')}
      </div>
    </div>
  `).join('');
};

const renderSocials = (socials) => {
  return socials.map(s => `
    <a href="${s.url}" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="${s.platform}">
      ${icons[s.platform] || s.platform}
    </a>
  `).join('');
};

const renderFooter = (footerLinks) => {
  return footerLinks.map((f, i) => `
    <a href="${f.url}" class="footer-link">${f.name}</a>${i < footerLinks.length - 1 ? ' &middot; ' : ''}
  `).join('');
};

// 拼接完整的 HTML
const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.site_title}</title>
    <meta name="description" content="${config.seo_description}">
    <meta name="keywords" content="${config.seo_keywords}">
    <link rel="stylesheet" href="./style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- 头部背景图 -->
    <div class="hero-bg" style="background-image: url('${config.profile.bg_image}');">
        <div class="gradient-overlay"></div>
    </div>

    <!-- 主容器 -->
    <main class="main-container">
        <!-- 个人资料 -->
        <header class="profile-header">
            <h1 class="profile-name">${config.profile.name}</h1>
        </header>

        <!-- 链接分类区域 -->
        <section class="links-section">
            ${renderLinks(config.categories)}
        </section>

        <!-- 社交媒体图标 -->
        <section class="socials-section">
            ${renderSocials(config.socials)}
        </section>

        <!-- 底部特色按钮 (如果有) -->
        ${config.bottom_button ? `
        <div class="bottom-action">
            <a href="${config.bottom_button.url}" class="pill-btn" target="_blank" rel="noopener noreferrer">
                ${config.bottom_button.text}
            </a>
        </div>
        ` : ''}
    </main>

    <!-- 底部版权和隐私链接 -->
    <footer class="site-footer">
        ${renderFooter(config.footer)}
    </footer>

    <!-- 动态效果和默认处理 -->
    <script>
      // 1. 默认黑色背景处理
      const hero = document.querySelector('.hero-bg');
      const bgImage = window.getComputedStyle(hero).backgroundImage;
      if (bgImage.includes('bg.jpg')) {
          hero.style.backgroundColor = '#111';
          hero.style.backgroundImage = 'none';
      }

      // 2. 页面上滑时的背景渐隐和视差效果 (高级感)
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight * 0.5; // 滑动半个屏幕时完全透明
        let opacity = 1 - (scrollY / maxScroll);
        if (opacity < 0) opacity = 0;
        hero.style.opacity = opacity;
      });
    </script>
</body>
</html>`;

// 写入 index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), htmlTemplate);
console.log('✅ 构建成功：index.html 已生成');
