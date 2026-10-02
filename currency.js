/* Gear Radar – show prices in the visitor's local currency.
   Prices stay defined in USD in the page (.p-amt, data-m, data-y). This script:
   1. guesses the visitor's currency from their device time zone (no tracking, no extra request),
   2. gets today's rates from open.er-api.com (free, cached for 12 hours),
   3. rewrites every "$<number>" inside .p-amt and .per-note, including after the monthly/yearly toggle,
   4. adds a small currency picker above the plans. If anything fails, USD stays as it is. */
(function () {
  var CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP'];
  var DECIMALS = { KWD: 1, BHD: 1, OMR: 1 };
  var TZ = {
    'Europe/London': 'GBP', 'Europe/Belfast': 'GBP', 'Europe/Guernsey': 'GBP', 'Europe/Jersey': 'GBP', 'Europe/Isle_of_Man': 'GBP',
    'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR', 'Asia/Kuwait': 'KWD', 'Asia/Bahrain': 'BHD', 'Asia/Muscat': 'OMR',
    'Africa/Cairo': 'EGP'
  };
  var EURO = ['Dublin', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Brussels', 'Vienna', 'Lisbon', 'Athens', 'Helsinki',
    'Luxembourg', 'Monaco', 'Malta', 'Bratislava', 'Ljubljana', 'Tallinn', 'Riga', 'Vilnius', 'Zagreb'];
  var CANADA = ['Toronto', 'Vancouver', 'Edmonton', 'Winnipeg', 'Halifax', 'St_Johns', 'Regina', 'Montreal', 'Moncton', 'Whitehorse'];

  var SEL = '.p-amt, .per-note';
  var STORE_RATES = 'gr_fx_rates', STORE_CUR = 'gr_currency';
  var ar = (document.documentElement.lang || '').toLowerCase().indexOf('ar') === 0;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function guessCurrency() {
    var saved = store(STORE_CUR);
    if (saved && CURRENCIES.indexOf(saved) > -1) return saved;
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (TZ[tz]) return TZ[tz];
    var city = tz.split('/')[1] || '';
    if (tz.indexOf('Europe/') === 0 && EURO.indexOf(city) > -1) return 'EUR';
    if (tz.indexOf('America/') === 0 && CANADA.indexOf(city) > -1) return 'CAD';
    return 'USD';
  }

  function getRates() {
    try {
      var c = JSON.parse(store(STORE_RATES) || 'null');
      if (c && c.rates && Date.now() - c.t < 12 * 3600 * 1000) return Promise.resolve(c.rates);
    } catch (e) {}
    return fetch('https://open.er-api.com/v6/latest/USD')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.result !== 'success' || !j.rates) throw new Error('rates');
        store(STORE_RATES, JSON.stringify({ t: Date.now(), rates: j.rates }));
        return j.rates;
      });
  }

  var currency = guessCurrency(), rates = null;

  function fmt(usd) {
    var v = usd * rates[currency], d = DECIMALS[currency] || 0;
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
    } catch (e) { return currency + ' ' + v.toFixed(d); }
  }

  // Keep the USD text each element was given by the page, and redraw it in the chosen currency.
  function render(el) {
    var shown = el.getAttribute('data-fx-shown');
    if (shown === null || el.textContent !== shown) el.setAttribute('data-fx-usd', el.innerHTML);
    var usdHtml = el.getAttribute('data-fx-usd');
    var html = (currency === 'USD' || !rates) ? usdHtml
      : usdHtml.replace(/\$\s?(\d[\d,]*(?:\.\d+)?)/g, function (m, n) { return fmt(parseFloat(n.replace(/,/g, ''))); });
    if (el.innerHTML !== html) el.innerHTML = html;
    el.setAttribute('data-fx-shown', el.textContent);
  }
  function renderAll() {
    Array.prototype.forEach.call(document.querySelectorAll(SEL), render);
    ar = (document.documentElement.lang || '').toLowerCase().indexOf('ar') === 0;
    var note = document.getElementById('fx-note-text') || (function () {
      var n = document.getElementById('fx-note'); if (!n) return null;
      var sp = document.createElement('span'); sp.id = 'fx-note-text'; n.appendChild(sp); return sp;
    })();
    if (note) note.innerHTML = currency === 'USD' ? '' : (ar
      ? 'الأسعار محوّلة تقريبياً من الدولار الأمريكي بسعر صرف اليوم. <a href="https://www.exchangerate-api.com" rel="noopener" target="_blank">Rates by Exchange Rate API</a>'
      : 'Approximate prices, converted from US dollars at today\'s rate. <a href="https://www.exchangerate-api.com" rel="noopener" target="_blank">Rates by Exchange Rate API</a>');
  }

  // Re-render when the page's own script changes a price (e.g. monthly / yearly toggle).
  var busy = false;
  var mo = new MutationObserver(function () {
    if (busy) return;
    busy = true;
    try { renderAll(); } finally { setTimeout(function () { busy = false; }, 0); }
  });

  // Picker goes in the top bar next to the language button; the "approximate" note sits above the plans.
  function addPicker() {
    var firstCard = document.querySelector('.pcard');
    if (!firstCard) return;
    var grid = (firstCard.closest('.pgroup') || firstCard).parentNode;

    var sel = document.createElement('select');
    sel.id = 'fx-select';
    sel.setAttribute('aria-label', 'Currency');
    CURRENCIES.forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c; o.style.color = '#0B1220'; sel.appendChild(o); });
    sel.value = currency;
    sel.addEventListener('change', function () { currency = sel.value; store(STORE_CUR, currency); renderAll(); });

    // Find the language toggle in the header (the button that says "العربية" / "English").
    var bar = document.querySelector('header') || document.querySelector('nav');
    var langBtn = null;
    if (bar) {
      Array.prototype.some.call(bar.querySelectorAll('a, button'), function (el) {
        var t = (el.textContent || '').trim();
        if (t === 'العربية' || t === 'English' || t === 'EN' || t === 'AR') { langBtn = el; return true; }
        return false;
      });
    }
    if (langBtn) {
      sel.style.cssText = 'appearance:none;-webkit-appearance:none;cursor:pointer;font:inherit;font-size:14px;font-weight:600;'
        + 'color:inherit;background:transparent;border:1px solid rgba(255,255,255,.35);border-radius:999px;'
        + 'padding:9px 30px 9px 16px;margin-inline-end:10px;line-height:1.2;'
        + 'background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%276%27%3E%3Cpath d=%27M1 1l4 4 4-4%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-width=%271.6%27/%3E%3C/svg%3E");'
        + 'background-repeat:no-repeat;background-position:right 13px center;';
      var cs = window.getComputedStyle(langBtn);
      if (cs.color) sel.style.color = cs.color;
      langBtn.parentNode.insertBefore(sel, langBtn);
    } else {
      // No header button found: put the picker above the plans instead.
      sel.style.cssText = 'padding:6px 10px;border-radius:8px;border:1px solid rgba(127,127,127,.4);font:inherit;margin-inline-end:10px;';
    }

    var note = document.createElement('p');
    note.id = 'fx-note';
    note.style.cssText = 'text-align:center;opacity:.7;font-size:12.5px;margin:0 0 16px;';
    if (!langBtn) { note.style.textAlign = 'start'; note.insertBefore(sel, null); }
    grid.parentNode.insertBefore(note, grid);
  }

  function start() {
    addPicker();
    Array.prototype.forEach.call(document.querySelectorAll(SEL), function (el) {
      mo.observe(el, { childList: true, characterData: true, subtree: true });
    });
    // Update the note's language when the visitor switches between English and Arabic.
    new MutationObserver(function () { if (rates) renderAll(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    getRates().then(function (r) {
      rates = r;
      if (!rates[currency]) currency = 'USD';
      var s = document.getElementById('fx-select'); if (s) s.value = currency;
      renderAll();
    }).catch(function () {
      currency = 'USD';
      var s = document.getElementById('fx-select'); if (s) s.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
