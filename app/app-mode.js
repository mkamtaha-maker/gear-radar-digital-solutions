/* Tala app mode: when a site page is opened from the Tala app (installed app, Android app,
   or the /app page in this tab), hide the website header, footer, menus and sales chat,
   and show a back bar to the app instead. Loaded by consent.js only in app mode. */
(function () {
  if (window.__talaAppMode) return; window.__talaAppMode = true;
  function ar() { return (document.documentElement.lang || '').slice(0, 2) === 'ar'; }
  var css = ''
    + 'body > header, body > footer, header.site, .gr-dd, .grc-btn, .grc-panel, .wa-float, .mm-overlay, .float-cta, .sticky-cta{display:none !important}'
    /* signup: only the job-seeker services inside the app */
    + '[data-group="web"],[data-group="qr"],[data-group="combo"]{display:none !important}'
    + '.tala-bar{position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:6px;background:#15171C;color:#F5F5F4;'
    + 'padding:calc(env(safe-area-inset-top,0px) + 8px) max(10px,env(safe-area-inset-right,0px)) 8px max(10px,env(safe-area-inset-left,0px));font:600 15px/1.2 system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif}'
    + '.tala-bar button,.tala-bar a{display:flex;align-items:center;gap:6px;background:none;border:0;color:inherit;font:inherit;padding:8px 10px;border-radius:10px;cursor:pointer;text-decoration:none}'
    + '.tala-bar button:active,.tala-bar a:active{background:rgba(255,255,255,.1)}'
    + '.tala-bar svg{width:20px;height:20px}'
    + 'html[dir="rtl"] .tala-bar .tb-back svg{transform:scaleX(-1)}'
    + '.tala-bar .sp{flex:1}'
    + '.tala-bar img{width:22px;height:22px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function build() {
    if (document.querySelector('.tala-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'tala-bar';
    bar.innerHTML = '<button type="button" class="tb-back">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
      + '<span class="tb-l1"></span></button><span class="sp"></span>'
      + '<a href="/app/" class="tb-home"><img src="/images/brand/tala-dark.svg" alt=""><span class="tb-l2"></span></a>';
    function labels() { bar.querySelector('.tb-l1').textContent = ar() ? 'رجوع' : 'Back'; bar.querySelector('.tb-l2').textContent = ar() ? 'تالا' : 'Tala'; }
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
