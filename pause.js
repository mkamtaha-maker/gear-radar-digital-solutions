/* Temporary pause (Nov 2026 - Jan 2027): Gear Radar is not taking new orders.
   Shows a notice bar on every page that loads it and replaces order/sign-up forms
   with a short message. To end the pause: remove the loader line in consent.js,
   the script tags in app/index.html and get.html, and this file. */
(function () {
  'use strict';
  if (window.__grPause) return;
  window.__grPause = true;

  var lang = (document.documentElement.lang || '').toLowerCase().slice(0, 2);
  try {
    var m = location.search.match(/[?&]lang=(ar|en|de|es|fr)\b/);
    var saved = localStorage.getItem('gr_lang') || localStorage.getItem('tala_lang');
    if (m) lang = m[1]; else if (saved && /^(ar|en|de|es|fr)$/.test(saved) && !/^(ar|de|es|fr)$/.test(lang)) lang = saved;
  } catch (e) {}
  if (!/^(ar|de|es|fr)$/.test(lang)) lang = 'en';

  var MAIL = '<a href="mailto:info@gearradar.co.uk">info@gearradar.co.uk</a>';
  var T = {
    en: { bar: 'Gear Radar is taking a short break. New orders and sign-ups are paused until January 2027. Free tools like the CV checker still work. Questions: ' + MAIL,
          form: 'New orders and sign-ups are paused until January 2027. Thank you for your patience. Questions: ' + MAIL },
    ar: { bar: 'تتوقف Gear Radar مؤقتاً، وسنعود في يناير 2027. الطلبات والتسجيلات الجديدة متوقفة حتى ذلك الحين، وما زالت الأدوات المجانية مثل فحص السيرة الذاتية متاحة. للاستفسار: ' + MAIL,
          form: 'الطلبات والتسجيلات الجديدة متوقفة مؤقتاً حتى يناير 2027. شكراً لتفهّمك. للاستفسار: ' + MAIL },
    de: { bar: 'Gear Radar macht eine kurze Pause. Neue Bestellungen und Anmeldungen sind bis Januar 2027 pausiert. Kostenlose Tools wie der Lebenslauf-Check funktionieren weiter. Fragen: ' + MAIL,
          form: 'Neue Bestellungen und Anmeldungen sind bis Januar 2027 pausiert. Danke für Ihr Verständnis. Fragen: ' + MAIL },
    es: { bar: 'Gear Radar hace una breve pausa. Los nuevos pedidos y registros están en pausa hasta enero de 2027. Las herramientas gratuitas, como el revisor de CV, siguen funcionando. Preguntas: ' + MAIL,
          form: 'Los nuevos pedidos y registros están en pausa hasta enero de 2027. Gracias por tu paciencia. Preguntas: ' + MAIL },
    fr: { bar: 'Gear Radar fait une courte pause. Les nouvelles commandes et inscriptions sont suspendues jusqu\'en janvier 2027. Les outils gratuits, comme le vérificateur de CV, restent disponibles. Questions : ' + MAIL,
          form: 'Les nouvelles commandes et inscriptions sont suspendues jusqu\'en janvier 2027. Merci de votre patience. Questions : ' + MAIL }
  }[lang];
  var rtl = lang === 'ar';

  var css = '.gr-pause-bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;background:#1A1210;color:#FFF1EA;font:500 14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"IBM Plex Sans Arabic",sans-serif;padding:10px 16px;text-align:center}' +
    '.gr-pause-bar a,.gr-pause-note a{color:#FF8A50;font-weight:700}' +
    '.gr-pause-note{margin:16px 0;padding:18px 20px;border-radius:14px;background:#FFF1EA;color:#2A1A12;border:1px solid #FFB38A;font:500 16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,"IBM Plex Sans Arabic",sans-serif}' +
    '.gr-pause-note a{color:#C2410C}';

  var FORMS = ['#signup', '#orderForm', '#applyForm', '#cfForm', '#enquiryForm', '#demoForm'];

  function run() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var bar = document.createElement('div');
    bar.className = 'gr-pause-bar'; bar.setAttribute('role', 'status');
    if (rtl) bar.dir = 'rtl';
    bar.innerHTML = T.bar;
    document.body.insertBefore(bar, document.body.firstChild);
    /* keep the page and any fixed/sticky top bars below the notice */
    var shifted = [];
    function fit() {
      var h = bar.offsetHeight;
      document.documentElement.style.scrollPaddingTop = h + 'px';
      document.body.style.paddingTop = h + 'px';
      shifted.forEach(function (el) { el.style.top = h + 'px'; });
    }
    var all = document.body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i]; if (el === bar) continue;
      var cs = getComputedStyle(el);
      if ((cs.position === 'fixed' || cs.position === 'sticky') && parseFloat(cs.top) === 0 && el.getBoundingClientRect().height < window.innerHeight * 0.4) shifted.push(el);
    }
    fit(); window.addEventListener('resize', fit);

    FORMS.forEach(function (sel) {
      var f = document.querySelector(sel);
      if (!f) return;
      var n = document.createElement('div');
      n.className = 'gr-pause-note'; if (rtl) n.dir = 'rtl';
      n.innerHTML = T.form;
      f.parentNode.insertBefore(n, f);
      f.style.display = 'none';
      f.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
