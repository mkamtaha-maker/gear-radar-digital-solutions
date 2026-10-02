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
    var note = document.getElementById('fx-note');
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

  function addPicker() {
    var firstCard = document.querySelector('.pcard');
    if (!firstCard) return;
    var group = firstCard.closest('.pgroup') || firstCard.parentNode;
    var box = document.createElement('div');
    box.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:0 0 18px;font-size:14px;';
    var label = document.createElement('label');
    label.textContent = ar ? 'العملة:' : 'Currency:';
    label.setAttribute('for', 'fx-select');
    var sel = document.createElement('select');
    sel.id = 'fx-select';
    sel.style.cssText = 'padding:6px 10px;border-radius:8px;border:1px solid rgba(127,127,127,.4);font:inherit;background:transparent;color:inherit;';
    CURRENCIES.forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c; o.style.color = '#0B1220'; sel.appendChild(o); });
    sel.value = currency;
    sel.addEventListener('change', function () { currency = sel.value; store(STORE_CUR, currency); renderAll(); });
    var note = document.createElement('span');
    note.id = 'fx-note';
    note.style.cssText = 'opacity:.7;font-size:12.5px;';
    box.appendChild(label); box.appendChild(sel); box.appendChild(note);
    group.parentNode.insertBefore(box, group);
  }

  function start() {
    addPicker();
    Array.prototype.forEach.call(document.querySelectorAll(SEL), function (el) {
      mo.observe(el, { childList: true, characterData: true, subtree: true });
    });
    getRates().then(function (r) {
      rates = r;
      if (!rates[currency]) currency = 'USD';
      var s = document.getElementById('fx-select'); if (s) s.value = currency;
      renderAll();
    }).catch(function () {
      currency = 'USD';
      var s = document.getElementById('fx-select'); if (s) s.parentNode.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
