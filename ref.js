/* Gear Radar Partners: remembers the partner code from ?ref=CODE for 60 days
   (only after the visitor accepts cookies, see consent.js) so signup.html can apply it, and counts one visit per code per visitor per day. */
(function(){
  var KEY = 'gr_ref', DAYS = 60;
  var ENDPOINT = 'https://kamtyler.app.n8n.cloud/webhook/gearradar-affiliate';
  function clean(c){ c = String(c || '').toUpperCase().replace(/[^A-Z0-9_-]/g, ''); return c.length >= 3 && c.length <= 30 ? c : ''; }
  function read(){
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && v.code && Date.now() - v.t < DAYS * 864e5) return v.code;
    } catch(e) {}
    return '';
  }
  window.grRef = read;
  var qs = new URLSearchParams(location.search);
  // Stripe/PayPal send customers back with ?ref=<order ref>&paid=1: that is not a partner code.
  if (qs.get('paid') || qs.get('cancelled') || qs.get('payfailed')) return;
  var code = clean(qs.get('ref'));
  if (!code) return;
  // Remembering the code is optional storage, so it waits for cookie consent (consent.js). Last click wins.
  var C = window.grConsent;
  if (C) C.whenGranted(function(){ try { localStorage.setItem(KEY, JSON.stringify({ code: code, t: Date.now() })); } catch(e) {} });
  var seen = 'gr_ref_seen_' + code;
  if (C && C.granted()) try { if (sessionStorage.getItem(seen)) return; sessionStorage.setItem(seen, '1'); } catch(e) {}
  try {
    fetch(ENDPOINT, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click', code: code, page: location.pathname }) }).catch(function(){});
  } catch(e) {}
})();
