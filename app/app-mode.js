/* Tala app mode: when a site page is opened from the Tala app (installed app, Android app,
   or the /app page in this tab), the page takes the app's look: app bar with back button and
   page title, app colours and fonts, light compact header, and no website header, footer,
   menus, sales chat or long marketing sections. Loaded by consent.js only in app mode. */
(function () {
  if (window.__talaAppMode) return; window.__talaAppMode = true;
  function ar() { return (document.documentElement.lang || '').slice(0, 2) === 'ar'; }
  function de() { return (document.documentElement.lang || '').slice(0, 2) === 'de'; }
  function es() { return (document.documentElement.lang || '').slice(0, 2) === 'es'; }
  function fr() { return (document.documentElement.lang || '').slice(0, 2) === 'fr'; }
  var TITLES = {
    'cv-checker': ['CV Checker', 'فحص السيرة', 'Lebenslauf-Check', 'Revisión de CV', 'Analyse de CV'], 'cv-wallet': ['CVs Wallet', 'محفظة السير', 'CVs Wallet', 'CVs Wallet', 'CVs Wallet'], 'career-finder': ['Career Finder', 'اكتشف مسارك', 'Career Finder', 'Career Finder', 'Career Finder'],
    'linkedin-makeover': ['LinkedIn Makeover', 'LinkedIn Makeover', 'LinkedIn-Makeover', 'LinkedIn Makeover', 'LinkedIn Makeover'], 'polishly': ['Polishly', 'Polishly', 'Polishly', 'Polishly', 'Polishly'],
    'signup': ['Sign up', 'الاشتراك', 'Anmelden', 'Registro', 'Inscription'], 'privacy': ['Privacy notice', 'سياسة الخصوصية', 'Datenschutz', 'Privacidad', 'Confidentialité'], 'terms': ['Terms', 'الشروط', 'AGB', 'Términos', 'Conditions'], 'impressum': ['Impressum', 'Impressum', 'Impressum', 'Aviso legal', 'Mentions légales']
  };
  function title() {
    var k = location.pathname.replace(/^\/|\.html$/g, '').replace(/-(ar|de|es|fr)$/, '');
    var t = TITLES[k]; if (t) return ar() ? t[1] : (de() ? t[2] : (es() ? t[3] : (fr() ? t[4] : t[0])));
    return (document.title || '').split(/[|·–-]/)[0].trim();
  }

  var fl = document.createElement('link'); fl.rel = 'stylesheet';
  fl.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';
  document.head.appendChild(fl);

  var css = ''
    /* website chrome off */
    + 'body > header, body > footer, header.site, .gr-dd, .grc-btn, .grc-panel, .wa-float, .mm-overlay, .float-cta, .sticky-cta{display:none !important}'
    /* signup: only the job-seeker services inside the app */
    + '[data-group="web"],[data-group="qr"],[data-group="combo"]{display:none !important}'
    /* long marketing sections off: FAQ, how-it-works, resources, closing banners */
    + 'section.faq, section.final, #resources, #what, #how, #why, #more, .hero-art, .hero .art, section.block:not([id]):not(.faq){display:none !important}'
    /* app colours and fonts */
    + ':root{--paper:#F5F6F8 !important;--line:#E7E9ED !important;--muted:#6B7280 !important;--text:#0F1115 !important;--gold:#FF7A3D !important;--tapp-f:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif}'
    + 'html[lang="ar"]{--tapp-f:"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif}'
    + 'html,body{background:#F5F6F8 !important}'
    + 'body, body h1, body h2, body h3, body h4, body p, body button, body input, body select, body textarea, body label, body a, body li, body small, body b, body strong{font-family:var(--tapp-f) !important}'
    + 'body section{padding-top:20px !important;padding-bottom:20px !important}'
    /* page header: light and compact instead of the dark website hero */
    + '.hero, section.intro{background:transparent !important;color:#0F1115 !important;padding:18px 0 6px !important;min-height:0 !important;border:0 !important}'
    + '.hero::before, .hero::after, section.intro::before, section.intro::after{display:none !important}'
    + '.hero h1, section.intro h1{color:#0F1115 !important;font-size:26px !important;line-height:1.25 !important;font-weight:800 !important;letter-spacing:-.01em !important;margin:4px 0 8px !important}'
    + '.hero p, section.intro p{color:#6B7280 !important;font-size:15px !important;line-height:1.55 !important;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin:0 0 6px !important}'
    + '.hero a:not(.btn), section.intro a:not(.btn){color:#C2410C !important}'
    + '.hero .pchip{background:#fff !important;border:1px solid #E7E9ED !important;color:#0F1115 !important}'
    + '.hero .pchip small, .hero .pchip s{color:#6B7280 !important}'
    + '.hero .btn{display:none !important}'
    + '.hero .container, section.intro .container{padding-top:0 !important}'
    + '.hero .stack, .hero .visual, .hero picture{display:none !important}'
    + '.hero .wrap{grid-template-columns:1fr !important}'
    + '.hero .pchip b{color:#0F1115 !important}'
    + 'body main.container{margin-top:0 !important}'
    /* cookie notice: compact one-row light sheet */
    + '.gr-cc{display:flex !important;align-items:center;gap:10px;background:#fff !important;color:#0F1115 !important;border:1px solid #E7E9ED;box-shadow:0 8px 30px rgba(16,24,40,.16) !important;border-radius:16px !important;font:12.5px/1.45 var(--tapp-f) !important;padding:10px 10px 10px 14px !important;left:12px !important;right:12px !important;bottom:calc(env(safe-area-inset-bottom,0px) + 10px) !important}'
    + 'html[dir="rtl"] .gr-cc, .gr-cc[dir="rtl"]{padding:10px 14px 10px 10px !important}'
    + '.gr-cc p{margin:0 !important;flex:1;min-width:0}'
    + '.gr-cc a{color:#6B7280 !important;text-decoration:underline}'
    + '.gr-cc .gr-cc-b{flex:none;gap:6px !important;flex-wrap:nowrap !important}'
    + '.gr-cc button{flex:none !important;border:0 !important;border-radius:10px !important;padding:8px 12px !important;font:700 13px var(--tapp-f) !important;background:#F0F1F4 !important;color:#0F1115 !important}'
    + '.gr-cc button:last-child{background:#FF7A3D !important;color:#1A0B03 !important}'
    /* app bar */
    + '.tala-bar{position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:8px;background:rgba(245,246,248,.9);-webkit-backdrop-filter:saturate(1.4) blur(14px);backdrop-filter:saturate(1.4) blur(14px);color:#0F1115;border-bottom:1px solid #E7E9ED;'
    + 'padding:calc(env(safe-area-inset-top,0px) + 8px) max(12px,env(safe-area-inset-right,0px)) 8px max(12px,env(safe-area-inset-left,0px));font:700 16px/1.2 var(--tapp-f)}'
    + '.tala-bar .tb-back{width:40px;height:40px;flex:none;display:grid;place-items:center;background:#fff;border:1px solid #E7E9ED;border-radius:12px;color:inherit;cursor:pointer;padding:0}'
    + '.tala-bar .tb-back:active{transform:scale(.96)}'
    + '.tala-bar svg{width:20px;height:20px}'
    + 'html[dir="rtl"] .tala-bar .tb-back svg{transform:scaleX(-1)}'
    + '.tala-bar .tb-t{flex:1;min-width:0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.tala-bar .tb-home{width:40px;height:40px;flex:none;border-radius:12px;overflow:hidden;display:block}'
    + '.tala-bar .tb-home img{width:100%;height:100%;display:block}';
  /* dark appearance follows the app setting (Settings > Appearance): the light page is inverted, photos and logos are turned back */
  var dark = false;
  try { var tp = localStorage.getItem('tala_theme') || 'auto'; dark = tp === 'dark' || (tp === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) {}
  if (dark) {
    document.documentElement.classList.add('tala-dark');
    css += 'html.tala-dark{filter:invert(1) hue-rotate(180deg);background:#F5F6F8 !important;color-scheme:light}'
      + 'html.tala-dark img, html.tala-dark video, html.tala-dark picture, html.tala-dark iframe, html.tala-dark canvas{filter:invert(1) hue-rotate(180deg)}'
      + 'html.tala-dark .gr-cc{box-shadow:none !important}';
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', '#0A0907');
  }
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function build() {
    if (document.querySelector('.tala-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'tala-bar';
    bar.innerHTML = '<button type="button" class="tb-back">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>'
      + '<span class="tb-t"></span>'
      + '<a href="/app/" class="tb-home"><img src="/app/icons/icon-192.png" alt="Tala"></a>';
    function labels() { bar.querySelector('.tb-back').setAttribute('aria-label', ar() ? 'رجوع' : (de() ? 'Zurück' : (es() ? 'Atrás' : (fr() ? 'Retour' : 'Back')))); bar.querySelector('.tb-t').textContent = title(); }
    labels();
    try { new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
    bar.querySelector('.tb-back').addEventListener('click', function () {
      var sameSite = false; try { sameSite = document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
      if (sameSite && history.length > 1) history.back(); else location.href = '/app/';
    });
    document.body.insertBefore(bar, document.body.firstChild);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
