/* CVs Wallet: free, keeps up to 5 CVs per account in a private Supabase bucket (cv-wallet/<user id>/...).
   Sign-in is the same email-code account as the Tala app (n8n webhook tala-app-login + Supabase Auth, storageKey tala-auth),
   so a person signed in on the site is signed in inside the app too. Strings come from window.CVW_T (set per page). */
(function () {
  var T = window.CVW_T || {}, AR = (document.documentElement.lang || '').indexOf('ar') === 0;
  function t(k, n) { var s = T[k] || k; return n == null ? s : s.replace('{n}', n); }
  var SB_URL = 'https://nrkydwotserhniczcgqs.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ya3lkd290c2VyaG5pY3pjZ3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzU0MzMsImV4cCI6MjEwNTgxMTQzM30.6v1fSTrg00Wj7JM0B18aBfwYzNPngv5y4uaf-HmsYq0'; // public anon key: wallet rows and files are readable only by their owner
  var CODE_URL = 'https://kamtyler.app.n8n.cloud/webhook/tala-app-login';
  var BUCKET = 'cv-wallet', MAX = 5, MAX_BYTES = 5 * 1024 * 1024;
  var TYPES = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  var sb = null, user = null, loading = null, items = [];
  var $ = function (id) { return document.getElementById(id); };

  function track(n) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: n, title: n, event: true }); } catch (e) {} }
  function loadSb() {
    if (sb) return Promise.resolve(sb);
    if (loading) return loading;
    loading = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
      s.onload = function () { try { sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'tala-auth' } }); ok(sb); } catch (e) { no(e); } };
      s.onerror = function () { loading = null; no(new Error('load')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  /* ---------- view ---------- */
  function render() {
    $('cvwOut').hidden = !!user; $('cvwIn').hidden = !user;
    if (!user) return;
    $('cvwEmail').textContent = user.email || '';
    $('cvwCount').textContent = t('count', items.length);
    var full = items.length >= MAX;
    $('cvwAdd').hidden = full; $('cvwFull').hidden = !full;
    var list = $('cvwList'); list.innerHTML = '';
    $('cvwEmpty').hidden = items.length > 0;
    items.forEach(function (it) {
      var li = document.createElement('li'); li.className = 'cvw-item';
      var ext = (it.file_name || '').split('.').pop().toUpperCase();
      li.innerHTML = '<span class="cvw-ic" aria-hidden="true">' + (ext === 'PDF' ? 'PDF' : 'DOC') + '</span>'
        + '<span class="cvw-tx"><b></b><small></small></span>'
        + '<span class="cvw-act"><button type="button" class="cvw-b" data-a="get"></button><button type="button" class="cvw-b del" data-a="del"></button></span>';
      li.querySelector('b').textContent = it.label;
      var sm = li.querySelector('small'), fn = document.createElement('bdi'); fn.textContent = it.file_name || '';
      sm.appendChild(fn); sm.appendChild(document.createTextNode(' · ' + size(it.size_bytes) + ' · ' + date(it.created_at)));
      li.querySelector('[data-a=get]').textContent = t('download');
      li.querySelector('[data-a=del]').textContent = t('delete');
      li.querySelector('[data-a=get]').addEventListener('click', function () { download(it, this); });
      li.querySelector('[data-a=del]').addEventListener('click', function () { remove(it, this); });
      list.appendChild(li);
    });
  }
  function size(b) { b = b || 0; return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function date(s) { try { return new Date(s).toLocaleDateString(AR ? 'ar' : (document.documentElement.lang === 'de' ? 'de-DE' : document.documentElement.lang === 'es' ? 'es-ES' : document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-GB'), { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
  function msg(text, bad) { var m = $('cvwMsg'); m.textContent = text || ''; m.className = 'cvw-msg' + (bad ? ' bad' : ''); }

  function refresh() {
    return sb.from('cv_wallet').select('id,label,file_path,file_name,mime,size_bytes,created_at').order('created_at', { ascending: false }).then(function (r) {
      items = (r && r.data) || []; render();
    }, function () { render(); });
  }

  /* ---------- wallet actions ---------- */
  function uid4() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  function upload() {
    var f = $('cvwFile').files[0], label = $('cvwLabel').value.trim(), btn = $('cvwSave');
    msg('');
    if (!f) return msg(t('e_nofile'), true);
    var ext = (f.name.split('.').pop() || '').toLowerCase();
    if (!TYPES[ext]) return msg(t('e_type'), true);
    if (f.size > MAX_BYTES) return msg(t('e_big'), true);
    if (items.length >= MAX) return msg(t('e_full'), true);
    if (!label) label = f.name.replace(/\.[^.]+$/, '').slice(0, 60);
    label = label.slice(0, 60);
    var path = user.id + '/' + uid4() + '.' + ext;
    btn.disabled = true; btn.textContent = t('saving');
    sb.storage.from(BUCKET).upload(path, f, { contentType: TYPES[ext], upsert: false }).then(function (r) {
      if (r.error) throw r.error;
      return sb.from('cv_wallet').insert({ user_id: user.id, label: label, file_path: path, file_name: f.name.slice(0, 200), mime: TYPES[ext], size_bytes: f.size }).then(function (q) {
        if (q.error) { sb.storage.from(BUCKET).remove([path]); throw q.error; }
      });
    }).then(function () {
      $('cvwFile').value = ''; $('cvwLabel').value = ''; $('cvwFileName').textContent = t('choose');
      msg(t('saved')); track('cv-wallet-upload'); return refresh();
    }).catch(function (e) {
      var m = String((e && (e.message || e.error)) || '');
      msg(t(/wallet_full|row-level|policy/i.test(m) ? 'e_full' : (/size|large/i.test(m) ? 'e_big' : 'e_save')), true);
    }).then(function () { btn.disabled = false; btn.textContent = t('save'); });
  }
  function download(it, b) {
    b.disabled = true;
    sb.storage.from(BUCKET).createSignedUrl(it.file_path, 120, { download: it.file_name || true }).then(function (r) {
      b.disabled = false;
      if (r.error || !r.data) return msg(t('e_net'), true);
      track('cv-wallet-download'); location.href = r.data.signedUrl;
    }, function () { b.disabled = false; msg(t('e_net'), true); });
  }
  function remove(it, b) {
    if (!window.confirm(t('del_confirm'))) return;
    b.disabled = true;
    sb.storage.from(BUCKET).remove([it.file_path]).then(function (r) {
      if (r.error) throw r.error;
      return sb.from('cv_wallet').delete().eq('id', it.id);
    }).then(function () { msg(t('deleted')); track('cv-wallet-delete'); return refresh(); }, function () { b.disabled = false; msg(t('e_net'), true); });
  }
  // used before the account itself is deleted, here and in the Tala app
  function wipeFiles() {
    return sb.storage.from(BUCKET).list(user.id, { limit: 100 }).then(function (r) {
      var names = ((r && r.data) || []).map(function (o) { return user.id + '/' + o.name; });
      return names.length ? sb.storage.from(BUCKET).remove(names) : null;
    });
  }
  function deleteAccount() {
    if (!window.confirm(t('acct_del_confirm'))) return;
    wipeFiles().then(function () { return sb.rpc('delete_my_account'); }).then(function (r) {
      if (r && r.error) throw r.error;
      return sb.auth.signOut({ scope: 'local' });
    }).then(function () { user = null; items = []; render(); track('cv-wallet-account-deleted'); window.alert(t('acct_deleted')); }, function () { msg(t('e_net'), true); });
  }

  /* ---------- sign-in sheet (same flow as the Tala app) ---------- */
  var sheet = $('cvwSheet'), emailIn = $('cvwEmailIn'), codeIn = $('cvwCodeIn'), pending = '', timer = null;
  function step(x) { $('cvwStepEmail').hidden = x !== 'email'; $('cvwStepCode').hidden = x !== 'code'; }
  function openSheet() { sheet.hidden = false; step('email'); $('cvwEmailErr').textContent = ''; setTimeout(function () { emailIn.focus(); }, 50); loadSb().catch(function () {}); track('cv-wallet-signin-open'); }
  function closeSheet() { sheet.hidden = true; clearInterval(timer); }
  function resendTimer() {
    var b = $('cvwResend'), n = 30; b.disabled = true; clearInterval(timer);
    function tick() { if (n <= 0) { clearInterval(timer); b.disabled = false; b.textContent = t('resend'); return; } b.textContent = t('resend_in', n); n--; }
    tick(); timer = setInterval(tick, 1000);
  }
  function requestCode(email, errEl, btn) {
    btn.disabled = true; var label = btn.textContent; btn.textContent = t('sending'); errEl.textContent = '';
    return fetch(CODE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, lang: AR ? 'ar' : 'en', website: $('cvwHp').value }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok) return true; errEl.textContent = t(j && j.error === 'wait' ? 'e_wait' : (j && j.error === 'email' ? 'e_email' : 'e_send')); return false; },
            function () { errEl.textContent = t('e_send'); return false; })
      .then(function (ok) { btn.disabled = false; btn.textContent = label; return ok; });
  }
  function verify() {
    var code = codeIn.value.replace(/\D/g, ''), err = $('cvwCodeErr'), btn = $('cvwVerify');
    if (code.length < 6) { err.textContent = t('e_code'); return; }
    btn.disabled = true; btn.textContent = t('checking'); err.textContent = '';
    loadSb().then(function () {
      return sb.auth.verifyOtp({ email: pending, token: code, type: 'email' }).then(function (r) { return r.error ? sb.auth.verifyOtp({ email: pending, token: code, type: 'magiclink' }) : r; });
    }).then(function (r) {
      if (!r || r.error || !r.data || !r.data.session) { err.textContent = t('e_code'); return; }
      user = r.data.session.user; closeSheet(); track('cv-wallet-signin-ok');
      sb.from('app_users').upsert({ user_id: user.id, email: user.email, lang: AR ? 'ar' : 'en', last_seen_at: new Date().toISOString() }, { onConflict: 'user_id', ignoreDuplicates: true }).then(function () {}, function () {});
      return refresh();
    }, function () { err.textContent = t('e_net'); }).then(function () { btn.disabled = false; btn.textContent = t('verify'); });
  }

  /* ---------- wire up ---------- */
  document.querySelectorAll('[data-cvw-signin]').forEach(function (b) { b.addEventListener('click', openSheet); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  $('cvwClose').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  $('cvwSend').addEventListener('click', function () {
    var email = emailIn.value.trim().toLowerCase(), err = $('cvwEmailErr');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = t('e_email'); return; }
    requestCode(email, err, this).then(function (ok) {
      if (!ok) return;
      pending = email; $('cvwCodeTo').textContent = email; codeIn.value = ''; $('cvwCodeErr').textContent = '';
      step('code'); resendTimer(); setTimeout(function () { codeIn.focus(); }, 50); track('cv-wallet-code-sent');
    });
  });
  emailIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('cvwSend').click(); } });
  $('cvwResend').addEventListener('click', function () { var b = this; requestCode(pending, $('cvwCodeErr'), b).then(function (ok) { if (ok) resendTimer(); }); });
  $('cvwChange').addEventListener('click', function () { step('email'); clearInterval(timer); });
  $('cvwVerify').addEventListener('click', verify);
  codeIn.addEventListener('input', function () { var v = codeIn.value.replace(/\D/g, ''); if (v !== codeIn.value) codeIn.value = v; if (v.length === 8) verify(); });

  $('cvwFile').addEventListener('change', function () { var f = this.files[0]; $('cvwFileName').textContent = f ? f.name : t('choose'); if (f && !$('cvwLabel').value) $('cvwLabel').value = f.name.replace(/\.[^.]+$/, '').slice(0, 60); });
  $('cvwSave').addEventListener('click', upload);
  $('cvwSignOut').addEventListener('click', function () { if (sb) sb.auth.signOut().then(function () { user = null; items = []; render(); msg(''); }); });
  $('cvwDelAcct').addEventListener('click', deleteAccount);

  // restore a session (from this page or the Tala app) without loading the library for everyone
  var has = false; try { has = !!localStorage.getItem('tala-auth'); } catch (e) {}
  if (has) loadSb().then(function () { return sb.auth.getSession(); }).then(function (r) {
    user = r && r.data && r.data.session ? r.data.session.user : null;
    if (user) return refresh(); render();
  }).catch(function () { render(); });
  else render();
})();
