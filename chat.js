/* Gear Radar website chat — talks to the same sales assistant as our WhatsApp number.
   Include once per page:  <script src="chat.js" defer></script>  */
(function () {
  'use strict';
  if (window.__grChat) return;
  window.__grChat = true;

  var ENDPOINT = 'https://kamtyler.app.n8n.cloud/webhook/gearradar-chat';
  var WA = 'https://wa.me/447442309417';
  var MAX_LEN = 800;

  var T = {
    en: {
      open: 'Chat with us', title: 'Gear Radar assistant', sub: 'Usually replies in seconds',
      hello: 'Hi! 👋 I can help you choose the right plan: Tala, your personal assistant (plans Tala Essential and Tala Pro, with add-ons like Job Hunter), a business website or a QR menu. What are you looking for?',
      ph: 'Type your message…', send: 'Send', close: 'Close chat',
      chips: ['See prices', 'QR menu for my business', 'A website for my business', 'Tala personal assistant'],
      err: 'Sorry, something went wrong. Please try again, or message us on WhatsApp.',
      wa: 'WhatsApp us instead', note: 'Chats are saved so we can follow up. See our <a href="privacy.html">privacy notice</a>.'
    },
    ar: {
      open: 'تحدّث معنا', title: 'مساعد Gear Radar', sub: 'يرد عادةً خلال ثوانٍ',
      hello: 'أهلاً! 👋 أقدر أساعدك تختار الباقة المناسبة: تالا، مساعدتك الشخصية (Tala Essential أو Tala Pro، مع إضافات مثل صائد الوظائف)، موقع لنشاطك أو قائمة QR. عن ماذا تبحث؟',
      ph: 'اكتب رسالتك…', send: 'إرسال', close: 'إغلاق المحادثة',
      chips: ['الأسعار', 'قائمة QR لنشاطي', 'موقع لنشاطي', 'تالا، مساعدتك الشخصية'],
      err: 'عذراً، حدث خطأ. حاول مرة أخرى أو راسلنا على واتساب.',
      wa: 'راسلنا على واتساب', note: 'نحفظ المحادثة لنتابع معك. راجع <a href="privacy.html">سياسة الخصوصية</a>.'
    }
  };

  function lang() { return (document.documentElement.lang || 'en').slice(0, 2) === 'ar' ? 'ar' : 'en'; }
  function t(k) { return T[lang()][k]; }

  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  function get(kind, key) { try { var s = store(kind); return s ? s.getItem(key) : null; } catch (e) { return null; } }
  function set(kind, key, val) { try { var s = store(kind); if (s) s.setItem(key, val); } catch (e) {} }

  function newSession() {
    var d = '9';
    var bytes = null;
    try { bytes = window.crypto.getRandomValues(new Uint8Array(17)); } catch (e) { bytes = null; }
    for (var i = 0; i < 17; i++) d += String((bytes ? bytes[i] : Math.floor(Math.random() * 256)) % 10);
    return d;
  }
  var session = get('localStorage', 'gr_chat_session');
  if (!/^9\d{17}$/.test(session || '')) { session = newSession(); set('localStorage', 'gr_chat_session', session); }

  var history = [];
  try { history = JSON.parse(get('sessionStorage', 'gr_chat_log') || '[]') || []; } catch (e) { history = []; }
  function save() { set('sessionStorage', 'gr_chat_log', JSON.stringify(history.slice(-40))); }

  var css = ''
    + '.grc-btn{position:fixed;inset-inline-end:22px;bottom:22px;z-index:70;height:58px;padding:0 20px 0 16px;border:0;border-radius:999px;background:#15171C;color:#fff;display:flex;align-items:center;gap:10px;font-family:inherit;font-weight:600;font-size:15px;line-height:1;cursor:pointer;box-shadow:0 14px 34px -10px rgba(21,23,28,.55);transition:transform .2s}'
    + '.grc-btn:hover{transform:translateY(-2px)}'
    + '.grc-btn svg{width:24px;height:24px;color:#FF8A50;flex:none}'
    + '.grc-dot{width:9px;height:9px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.25)}'
    + '.wa-float{bottom:92px !important}'
    + '.grc-panel{box-sizing:border-box;margin:0;padding:0;position:fixed;inset-inline-end:22px;bottom:92px;z-index:80;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;box-shadow:0 30px 70px -20px rgba(21,23,28,.5);display:none;flex-direction:column;overflow:hidden;border:1px solid #E6E2D8}'
    + '.grc-panel.open{display:flex}'
    + '.grc-head{flex:none;background:#15171C;color:#F5F5F4;padding:14px 16px;display:flex;align-items:center;gap:12px}'
    + '.grc-av{width:38px;height:38px;border-radius:50%;background:rgba(255,138,80,.15);display:grid;place-items:center;flex:none}'
    + '.grc-av svg{width:22px;height:22px;color:#FF8A50}'
    + '.grc-head b{display:block;font-size:15px}.grc-head small{color:#A8A29E;font-size:12px}'
    + '.grc-x{margin-inline-start:auto;background:none;border:0;color:#A8A29E;font-size:26px;line-height:1;cursor:pointer;padding:4px 6px}'
    + '.grc-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:16px;background:#F7F5F0;display:flex;flex-direction:column;gap:10px}'
    + '.grc-m{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.55;white-space:normal;word-wrap:break-word;overflow-wrap:anywhere}'
    + '.grc-m a{color:#1d4ed8;text-decoration:underline}'
    + '.grc-bot{background:#fff;border:1px solid #E6E2D8;align-self:flex-start;border-end-start-radius:4px;color:#0F172A}'
    + '.grc-me{background:#15171C;color:#fff;align-self:flex-end;border-end-end-radius:4px}'
    + '.grc-chips{display:flex;flex-wrap:wrap;gap:6px}'
    + '.grc-chip{border:1px solid #FF8A50;background:#fff;color:#15171C;border-radius:999px;padding:6px 12px;font-family:inherit;font-weight:500;font-size:13px;cursor:pointer}'
    + '.grc-chip:hover{background:rgba(255,138,80,.12)}'
    + '.grc-typing{align-self:flex-start;background:#fff;border:1px solid #E6E2D8;border-radius:14px;padding:12px 14px;display:flex;gap:4px}'
    + '.grc-typing i{width:7px;height:7px;border-radius:50%;background:#A8A29E;animation:grcb 1s infinite}'
    + '.grc-typing i:nth-child(2){animation-delay:.15s}.grc-typing i:nth-child(3){animation-delay:.3s}'
    + '@keyframes grcb{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}'
    + '.grc-foot{flex:none;border-top:1px solid #E6E2D8;padding:10px;background:#fff}'
    + '.grc-form{display:flex;gap:8px;align-items:flex-end}'
    + '.grc-in{flex:1;resize:none;border:1px solid #E6E2D8;border-radius:12px;padding:10px 12px;font-family:inherit;font-size:14px;line-height:1.4;max-height:110px;min-height:42px;outline:none;color:#0F172A;background:#fff}'
    + '.grc-in:focus{border-color:#FF8A50}'
    + '.grc-send{border:0;border-radius:12px;background:#FF8A50;color:#15171C;width:44px;height:42px;display:grid;place-items:center;cursor:pointer;flex:none}'
    + '.grc-send:disabled{opacity:.5;cursor:default}'
    + '.grc-send svg{width:20px;height:20px}'
    + 'html[dir="rtl"] .grc-send svg{transform:scaleX(-1)}'
    + '.grc-meta{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:11px;color:#5B6475}'
    + '.grc-meta a{color:#5B6475;text-decoration:underline}'
    + '.grc-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}'
    + '@media (max-width:520px){.grc-panel{inset-inline-end:8px;left:8px;right:8px;width:auto;max-width:none;top:64px;bottom:84px;height:auto;max-height:none}.grc-btn span.grc-label{display:none}.grc-btn{padding:0 18px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'grc-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = ICON_CHAT + '<span class="grc-label"></span><span class="grc-dot" aria-hidden="true"></span>';

  var panel = document.createElement('div');
  panel.className = 'grc-panel';
  panel.setAttribute('role', 'dialog');
  panel.innerHTML = ''
    + '<div class="grc-head"><div class="grc-av">' + ICON_CHAT + '</div><div><b class="grc-title"></b><small class="grc-sub"></small></div><button type="button" class="grc-x">×</button></div>'
    + '<div class="grc-body" aria-live="polite"></div>'
    + '<div class="grc-foot"><form class="grc-form"><input class="grc-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><textarea class="grc-in" rows="1" maxlength="' + MAX_LEN + '"></textarea><button class="grc-send" type="submit">' + ICON_SEND + '</button></form>'
    + '<div class="grc-meta"><span class="grc-note"></span><a class="grc-wa" href="' + WA + '" target="_blank" rel="noopener"></a></div></div>';

  document.body.appendChild(panel);
  document.body.appendChild(btn);

  var body = panel.querySelector('.grc-body');
  var input = panel.querySelector('.grc-in');
  var form = panel.querySelector('.grc-form');
  var sendBtn = panel.querySelector('.grc-send');
  var hp = panel.querySelector('.grc-hp');
  var busy = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function format(text) {
    var h = esc(text);
    h = h.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; });
    h = h.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<b>$2</b>');
    return h.replace(/\n/g, '<br>');
  }
  // Show prices in the visitor's chosen currency (set by currency.js); answers stay in USD in the saved history.
  function localPrices(text) { try { return window.grFx ? window.grFx.convert(text) : text; } catch (e) { return text; } }
  function bubble(role, text) {
    var d = document.createElement('div');
    d.className = 'grc-m ' + (role === 'me' ? 'grc-me' : 'grc-bot');
    d.setAttribute('dir', 'auto');
    d.innerHTML = format(role === 'me' ? text : localPrices(text));
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function chips() {
    var old = body.querySelector('.grc-chips');
    if (old) old.remove();
    if (history.length) return;
    var w = document.createElement('div');
    w.className = 'grc-chips';
    t('chips').forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'grc-chip'; b.textContent = c;
      b.addEventListener('click', function () { send(c); });
      w.appendChild(b);
    });
    body.appendChild(w);
  }
  function render() {
    body.innerHTML = '';
    bubble('bot', t('hello'));
    history.forEach(function (m) { bubble(m.r, m.t); });
    chips();
  }
  function labels() {
    btn.querySelector('.grc-label').textContent = t('open');
    btn.setAttribute('aria-label', t('open'));
    panel.setAttribute('aria-label', t('title'));
    panel.querySelector('.grc-title').textContent = t('title');
    panel.querySelector('.grc-sub').textContent = t('sub');
    panel.querySelector('.grc-x').setAttribute('aria-label', t('close'));
    input.placeholder = t('ph');
    sendBtn.setAttribute('aria-label', t('send'));
    panel.querySelector('.grc-note').innerHTML = t('note');
    panel.querySelector('.grc-wa').textContent = t('wa');
  }
  function typing(on) {
    var el = body.querySelector('.grc-typing');
    if (on && !el) { el = document.createElement('div'); el.className = 'grc-typing'; el.innerHTML = '<i></i><i></i><i></i>'; body.appendChild(el); body.scrollTop = body.scrollHeight; }
    if (!on && el) el.remove();
  }

  function send(text) {
    text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true;
    history.push({ r: 'me', t: text }); save();
    var c = body.querySelector('.grc-chips'); if (c) c.remove();
    bubble('me', text);
    input.value = ''; input.style.height = '';
    typing(true);
    var ctrl = null, timer = null;
    try { ctrl = new AbortController(); timer = setTimeout(function () { ctrl.abort(); }, 45000); } catch (e) { ctrl = null; }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: session, text: text, lang: lang(), page: location.pathname, website: hp.value }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok || !j.reply) throw new Error('bad reply');
      history.push({ r: 'bot', t: j.reply }); save();
      typing(false); bubble('bot', j.reply);
    }).catch(function () {
      typing(false); bubble('bot', t('err'));
    }).then(function () {
      if (timer) clearTimeout(timer);
      busy = false; sendBtn.disabled = false; input.focus();
    });
  }

  function toggle(open) {
    var isOpen = typeof open === 'boolean' ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) { body.scrollTop = body.scrollHeight; setTimeout(function () { input.focus(); }, 50); }
  }

  btn.addEventListener('click', function () { toggle(); });
  panel.querySelector('.grc-x').addEventListener('click', function () { toggle(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) { toggle(false); btn.focus(); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', function () { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 110) + 'px'; });

  // Redraw when the visitor changes currency, or when exchange rates finish loading.
  document.addEventListener('gr-currency-change', function () { if (!busy) render(); });

  // Follow the page's language toggle.
  try { new MutationObserver(function () { labels(); render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}

  labels();
  render();
})();
