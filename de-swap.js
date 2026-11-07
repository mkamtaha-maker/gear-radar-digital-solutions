/* German / Spanish / French view for pages that only have English + Arabic built in (work, galleries).
   The page keeps running in English; this swaps the visible English text for German
   using window.DE_SWAP / window.ES_SWAP / window.FR_SWAP = { map: {en: de}, rx: [[regex source, replacement]], skip: 'css selector' }.
   Load it in <head> (before the page's own scripts) so it can read the saved language first. */
(function () {
  var CFG = { de: window.DE_SWAP, es: window.ES_SWAP, fr: window.FR_SWAP }, C = { map: {} }, MAP = {}, RX = [], L = '';
  Object.keys(CFG).forEach(function (k) { if (!CFG[k]) delete CFG[k]; });
  function use(l) { L = l; C = CFG[l] || { map: {} }; MAP = C.map || {}; RX = (C.rx || []).map(function (r) { return [new RegExp(r[0]), r[1]]; }); }
  var want = '';
  try { var q = new URLSearchParams(location.search).get('lang'), g = localStorage.getItem('gr_lang'); want = CFG[q] ? q : (!q && CFG[g] ? g : ''); } catch (e) {}
  var on = false, orig = new Map(), origAttr = [], mo = null;
  function tr(s) {
    var k = s.trim(); if (!k) return null;
    var v = MAP[k];
    if (v == null) { for (var i = 0; i < RX.length; i++) { if (RX[i][0].test(k)) { v = k.replace(RX[i][0], RX[i][1]); break; } } }
    if (v == null || v === k) return null;
    return s.replace(k, v);
  }
  function skip(el) { return C.skip && el && el.closest && el.closest(C.skip); }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { node(root); return; }
    if (root.nodeType !== 1 || skip(root) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(root.nodeName)) return;
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (a) {
      var v = root.getAttribute(a); if (v == null) return; var t = tr(v); if (t != null) { origAttr.push([root, a, v]); root.setAttribute(a, t); }
    });
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(node);
    root.querySelectorAll && root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function (el) {
      if (skip(el)) return;
      ['placeholder', 'aria-label', 'title'].forEach(function (a) { var v = el.getAttribute(a); if (v == null) return; var t = tr(v); if (t != null) { origAttr.push([el, a, v]); el.setAttribute(a, t); } });
    });
  }
  function node(n) {
    var p = n.parentElement; if (!p || skip(p) || /^(SCRIPT|STYLE)$/.test(p.nodeName) || p.closest('#langSelect')) return;
    var t = tr(n.nodeValue); if (t == null) return;
    if (!orig.has(n)) orig.set(n, n.nodeValue);
    n.nodeValue = t;
  }
  function activate(l) {
    if (on) deactivate();
    use(l); on = true;
    document.documentElement.lang = l; document.documentElement.dir = 'ltr';
    try { localStorage.setItem('gr_lang', l); } catch (e) {}
    walk(document.body);
    if (!mo) mo = new MutationObserver(function (ms) {
      if (!on) return;
      ms.forEach(function (m) {
        if (m.type === 'characterData') { if (!orig.has(m.target) || orig.get(m.target) !== m.target.nodeValue) { orig.delete(m.target); node(m.target); } }
        else m.addedNodes.forEach(walk);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    var s = document.getElementById('langSelect'); if (s) s.value = l;
  }
  function deactivate() {
    on = false; if (mo) mo.disconnect();
    orig.forEach(function (v, n) { n.nodeValue = v; }); orig.clear();
    origAttr.forEach(function (a) { a[0].setAttribute(a[1], a[2]); }); origAttr = [];
    document.documentElement.lang = 'en';
  }
  function init() {
    var s = document.getElementById('langSelect'), b = document.getElementById('langToggle');
    Object.keys(CFG).forEach(function (l) { if (s && !s.querySelector('option[value="' + l + '"]')) { var o = document.createElement('option'); o.value = l; o.textContent = l.toUpperCase(); s.appendChild(o); } });
    if (s) s.addEventListener('change', function (e) {
      if (CFG[s.value]) {
        e.stopImmediatePropagation();
        if ((document.documentElement.lang || '').slice(0, 2) === 'ar' && b) b.click();
        activate(s.value);
      } else if (on) { deactivate(); }
    }, true);
    new MutationObserver(function () { if (on && s && s.value !== L) s.value = L; if (on && document.documentElement.lang !== L) document.documentElement.lang = L; })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if (want) {
      if ((document.documentElement.lang || '').slice(0, 2) === 'ar' && b) b.click();
      activate(want);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
