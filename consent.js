/* Gear Radar cookie consent (UK GDPR + PECR).
   Non-essential storage only starts after the visitor taps Accept:
   - the Google Ads tag (pages that load this file with data-ads="AW-...");
   - the partner code from ?ref= (ref.js asks via grConsent.whenGranted).
   Language and currency choices are essential and are not covered here.
   The choice is kept for 6 months; grConsent.open() shows the banner again. */
(function(){
  var KEY = 'gr_consent', MONTHS = 6;
  var me = document.currentScript;
  var ADS = me && me.getAttribute('data-ads');
  var ar = (document.documentElement.lang || '').toLowerCase().indexOf('ar') === 0;
  var T = ar ? {
    text: 'نستخدم ملفات تعريف الارتباط (الكوكيز) بإذنك فقط: تستخدمها إعلانات Google لقياس أداء إعلاناتنا، ويُحفَظ رمز الشريك عند الدخول من رابطه لمدة 60 يوماً. أمّا الإعدادات الأساسية كاللغة والعملة فتُحفَظ دائماً.',
    yes: 'موافقة', no: 'رفض', more: 'الخصوصية والكوكيز'
  } : {
    text: 'We use cookies only with your permission: Google Ads uses them to measure our adverts, and a partner code from a partner link is remembered for 60 days. Essential settings such as your language and currency are always kept.',
    yes: 'Accept', no: 'Reject', more: 'Privacy & cookies'
  };

  function read(){
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && v.t && Date.now() - v.t < MONTHS * 30 * 864e5) return v.c;
    } catch(e) {}
    return '';
  }
  function save(c){ try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch(e) {} }

  var state = read(), queue = [], box = null;

  function loadAds(){
    if (!ADS || window.__grAds) return;
    window.__grAds = 1;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', ADS);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS);
    document.head.appendChild(s);
  }
  function clearOptional(){
    try { localStorage.removeItem('gr_ref'); } catch(e) {}
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function(c){
      var n = c.split('=')[0].trim();
      if (/^_gcl_|^_ga/.test(n)) ['', '; domain=.' + host, '; domain=' + location.hostname].forEach(function(d){
        document.cookie = n + '=; Max-Age=0; path=/' + d;
      });
    });
  }
  function decide(c){
    var was = state;
    state = c; save(c); hide();
    if (c === 'yes') { loadAds(); queue.splice(0).forEach(function(fn){ try { fn(); } catch(e) {} }); }
    else { queue = []; clearOptional(); if (was === 'yes' && window.__grAds) location.reload(); }
  }

  function hide(){ if (box) { box.remove(); box = null; } }
  function show(){
    if (box) return;
    if (!document.body) { document.addEventListener('DOMContentLoaded', show); return; }
    var css = document.createElement('style');
    css.textContent =
      '.gr-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483646;max-width:640px;margin:0 auto;background:#15171C;color:#F5F5F4;border-radius:16px;padding:16px 18px;box-shadow:0 20px 50px -20px rgba(0,0,0,.5);font:14px/1.55 Inter,Cairo,system-ui,sans-serif}' +
      '.gr-cc p{margin:0 0 12px}.gr-cc a{color:#FF8A50}' +
      '.gr-cc .gr-cc-b{display:flex;gap:10px;flex-wrap:wrap}' +
      '.gr-cc button{flex:1 1 120px;border:1px solid #FF8A50;border-radius:999px;padding:9px 16px;font:600 14px Inter,Cairo,system-ui,sans-serif;cursor:pointer;background:transparent;color:#F5F5F4}' +
      '.gr-cc button:hover,.gr-cc button:focus-visible{background:#FF8A50;color:#15171C}';
    box = document.createElement('div');
    box.className = 'gr-cc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', T.more);
    box.dir = ar ? 'rtl' : 'ltr';
    box.innerHTML = '<p>' + T.text + ' <a href="privacy.html#cookies">' + T.more + '</a></p>' +
      '<div class="gr-cc-b"><button type="button" data-c="no">' + T.no + '</button><button type="button" data-c="yes">' + T.yes + '</button></div>';
    box.appendChild(css);
    box.addEventListener('click', function(e){ var c = e.target.getAttribute && e.target.getAttribute('data-c'); if (c) decide(c); });
    document.body.appendChild(box);
  }

  window.grConsent = {
    granted: function(){ return state === 'yes'; },
    // Runs fn now if the visitor accepted, later if they accept, never if they reject.
    whenGranted: function(fn){
      if (state === 'yes') return fn();
      if (state === 'no') return;
      queue.push(fn); show();
    },
    open: show
  };

  if (state === 'yes') loadAds();
  else if (!state && ADS) show();
})();
