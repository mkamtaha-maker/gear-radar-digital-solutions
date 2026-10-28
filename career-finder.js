/* Free career finder (career-finder.html / career-finder-ar.html).
   Sends the answers to the Gear Radar career finder service and shows the directions it returns. */
(function(){
  var T = window.CF_T || {}, AR = T.lang === 'ar';
  var URL = 'https://kamtyler.app.n8n.cloud/webhook/career-finder';
  var form = document.getElementById('cfForm'), btn = document.getElementById('cfBtn');
  var err = document.getElementById('cfErr'), out = document.getElementById('cfResult');
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function ev(path, title){ try { if (window.goatcounter && goatcounter.count) goatcounter.count({path: path + (AR ? '-ar' : ''), title: title, event: true}); } catch (x) {} }
  function ga(name, p){ try { if (window.grConsent) grConsent.track(name, p); } catch (x) {} }

  function render(r, email){
    var h = '<div class="sum"><h3>' + esc(T.r_summary) + '</h3><p>' + esc(r.summary) + '</p></div>';
    h += '<h3 class="rh">' + esc(T.r_dirs) + '</h3><div class="dirs">';
    (r.directions || []).forEach(function(d, i){
      h += '<div class="dir"><span class="fit ' + (d.fit === 'high' ? 'high' : 'medium') + '">' + esc(d.fit === 'high' ? T.r_fit_high : T.r_fit_medium) + '</span>'
        + '<h4>' + (i + 1) + '. ' + esc(d.title) + '</h4><p>' + esc(d.why) + '</p>'
        + ((d.titles || []).length ? '<span class="k">' + esc(T.r_search) + '</span><div class="tags">' + d.titles.map(function(t){ return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '')
        + '<span class="k">' + esc(T.r_first) + '</span><p>' + esc(d.first_step) + '</p></div>';
    });
    h += '</div>';
    if ((r.skills || []).length) h += '<h3 class="rh">' + esc(T.r_skills) + '</h3><div class="tags sk">' + r.skills.map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('') + '</div>';
    if ((r.quick_wins || []).length) h += '<h3 class="rh">' + esc(T.r_wins) + '</h3><ul class="wins">' + r.quick_wins.map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    h += '<h3 class="rh">' + esc(T.cta_h) + '</h3><div class="cta-box">' + T.ctas + '</div>';
    h += '<p class="small">' + esc(T.r_sent.replace('{email}', email)) + '</p><button type="button" class="again" id="cfAgain">' + esc(T.r_again) + '</button>';
    out.innerHTML = h; out.hidden = false;
    out.scrollIntoView({behavior: 'smooth', block: 'start'});
    $('cfAgain').onclick = function(){ out.hidden = true; out.innerHTML = ''; $('cf_tasks').focus(); };
  }

  out.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-cta]');
    if (!a) return;
    var k = a.getAttribute('data-cta');
    ev('career-finder-cta-' + k, 'Career finder CTA');
    ga('select_promotion', {promotion_name: 'career_finder_' + k});
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    err.textContent = '';
    var wants = [].slice.call(form.querySelectorAll('input[name=wants]:checked')).map(function(i){ return i.value; });
    var p = {
      language: AR ? 'ar' : 'en',
      current_role: $('cf_role').value.trim(), years: $('cf_years').value,
      tasks: $('cf_tasks').value.trim(), enjoy: $('cf_enjoy').value.trim(), background: $('cf_bg').value.trim(),
      wants: wants, country: $('cf_country').value.trim(),
      full_name: $('cf_name').value.trim(), email: $('cf_email').value.trim(),
      marketing_ok: $('cf_mkt').checked, website: $('cf_website').value
    };
    var bad = p.tasks.length < 30 ? 'tasks' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email) ? 'email' : !p.country ? 'country' : '';
    if (bad){ err.textContent = T.err[bad]; $({tasks: 'cf_tasks', email: 'cf_email', country: 'cf_country'}[bad]).focus(); return; }
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span>' + esc(T.loading);
    ev('career-finder-submit', 'Career finder submit');
    fetch(URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(p)})
      .then(function(r){ return r.json().catch(function(){ return {ok: false, error: 'busy'}; }); })
      .then(function(j){
        if (j && j.ok && j.result){
          render(j.result, p.email);
          ev('career-finder-done', 'Career finder done');
          ga('generate_lead', {lead_source: 'career_finder'});
        } else {
          var k = j && j.error;
          if (k === 'invalid' && j.errors && j.errors[0] && T.err[j.errors[0]]) k = j.errors[0];
          err.textContent = T.err[k] || T.err.busy;
        }
      })
      .catch(function(){ err.textContent = T.err.network; })
      .then(function(){ btn.disabled = false; btn.textContent = T.btn; });
  });
})();
