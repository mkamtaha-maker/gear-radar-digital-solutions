/* Free CV checker. Everything runs in the visitor's browser: the CV is never uploaded. */
(function(){
  var T = window.CVC_T, AR = document.documentElement.lang === 'ar';
  var $ = function(id){ return document.getElementById(id); };
  var cvBox = $('cvText'), jobBox = $('jobText'), out = $('cvcResult'), fileIn = $('cvFile'), fileMsg = $('fileMsg');

  /* ---------- PDF reading (pdf.js loaded only when a file is chosen) ---------- */
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  function loadPdfJs(cb){
    if (window.pdfjsLib) return cb();
    var s = document.createElement('script');
    s.src = PDFJS + 'pdf.min.js';
    s.onload = function(){ window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; cb(); };
    s.onerror = function(){ fileMsg.textContent = T.pdfFail; };
    document.head.appendChild(s);
  }
  function readPdf(file){
    fileMsg.textContent = T.reading;
    loadPdfJs(function(){
      file.arrayBuffer().then(function(buf){ return window.pdfjsLib.getDocument({data: buf}).promise; })
      .then(function(pdf){
        var pages = [], n = pdf.numPages;
        function next(i){
          if (i > n){ done(pages.join('\n'), n); return; }
          pdf.getPage(i).then(function(p){ return p.getTextContent(); }).then(function(tc){
            var lines = [], lastY = null, line = '';
            tc.items.forEach(function(it){
              var y = it.transform ? Math.round(it.transform[5]) : null;
              if (lastY !== null && y !== null && Math.abs(y - lastY) > 2){ lines.push(line); line = ''; }
              line += (line && !/\s$/.test(line) && !/^\s/.test(it.str) ? ' ' : '') + it.str;
              lastY = y;
            });
            lines.push(line);
            pages.push(lines.join('\n'));
            next(i + 1);
          });
        }
        next(1);
      }).catch(function(){ fileMsg.textContent = T.pdfFail; });
    });
    function done(text, n){
      cvBox.value = text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      cvBox.dataset.pages = n;
      fileMsg.textContent = cvBox.value.length > 50 ? T.readOk.replace('{n}', n) : T.pdfScan;
    }
  }
  fileIn.addEventListener('change', function(){
    var f = fileIn.files[0]; if (!f) return;
    if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') readPdf(f);
    else if (/\.txt$/i.test(f.name)) f.text().then(function(t){ cvBox.value = t; fileMsg.textContent = T.readOk.replace('{n}', 1); });
    else fileMsg.textContent = T.wordFile;
  });
  cvBox.addEventListener('input', function(){ delete cvBox.dataset.pages; });

  /* ---------- Checks ---------- */
  var VERBS = 'achieved,managed,led,delivered,improved,increased,reduced,created,developed,designed,built,launched,organised,organized,coordinated,implemented,negotiated,trained,mentored,supervised,resolved,streamlined,generated,won,secured,planned,introduced,established,analysed,analyzed,completed,handled,supported,prepared,produced,maintained,oversaw,saved,cut,grew,boosted,exceeded,ran,set up,restructured,automated,migrated,cared,assisted,served,processed,drove,raised,recruited,presented,wrote,owned,spearheaded,transformed,optimised,optimized'.split(',');
  var WEAK = ['responsible for','duties included','duties include','tasks included','worked on','helped with','hard-working','hard working','hardworking','team player','go-getter','self-starter','think outside the box','detail-oriented','detail oriented','results-driven','results driven','dynamic','passionate','references available','references on request','to whom it may concern','curriculum vitae'];
  var PERSONAL = [['date of birth',/\b(date of birth|d\.?o\.?b\.?|born on)\b/i],['age',/\bage\s*:\s*\d/i],['marital status',/\b(marital status|married|single|divorced)\b/i],['nationality',/\bnationality\b/i],['religion',/\breligion\b/i],['gender',/\bgender\s*:/i],['passport number',/\bpassport (no|number)\b/i],['photo',/\bphoto(graph)?\b/i]];
  var SECTIONS = [
    ['profile', /^\s*(profile|personal profile|professional profile|summary|professional summary|career summary|about me|personal statement|objective|career objective)\b/im],
    ['experience', /^\s*(experience|work experience|employment|employment history|work history|professional experience|career history|relevant experience)\b/im],
    ['education', /^\s*(education|qualifications|education and training|education & training|academic)\b/im],
    ['skills', /^\s*(skills|key skills|core skills|technical skills|competencies|core competencies|skills summary)\b/im]
  ];
  var STOP = ('a,an,the,and,or,but,if,of,to,in,on,at,for,with,by,from,as,is,are,was,were,be,been,being,will,would,can,could,should,may,might,must,shall,you,your,we,our,us,they,their,them,he,she,it,its,this,that,these,those,who,what,which,when,where,how,all,any,both,each,few,more,most,other,some,such,no,not,only,own,same,so,than,too,very,just,also,about,into,over,under,up,down,out,off,again,further,then,once,here,there,why,do,does,did,doing,have,has,had,having,i,me,my,am,per,via,etc,within,across,including,include,includes,ensure,ensuring,able,ability,role,job,work,working,candidate,candidates,applicant,applicants,company,team,teams,join,looking,seeking,opportunity,opportunities,apply,application,salary,hours,week,weeks,day,days,month,months,year,years,full,part,time,permanent,temporary,contract,location,based,benefits,benefit,pension,holiday,holidays,annual,leave,offer,offers,new,well,good,great,excellent,strong,essential,desirable,required,requirements,requirement,preferred,plus,experience,experienced,skills,skill,knowledge,understanding,minimum,least,must,need,needs,needed,make,making,help,helping,use,using,used,within,etc,e.g,ie,eg,uk,london,hybrid,remote,office,days,please,click,below,above,successful,responsibilities,responsibility,key,main,duties,duty,provide,providing,support,supporting,environment,range,variety,levels,level,high,highly,based,role,roles,position,positions,hire,hiring,recruitment,agency,employer,equal,diverse,diversity,inclusive,inclusion,disability,apply,today,now,via,£,k').split(',');
  var STOPSET = {}; STOP.forEach(function(w){ STOPSET[w] = 1; });

  function words(t){ return (t.toLowerCase().match(/[a-z][a-z+#.\-']*[a-z+#]|[a-z]/g) || []); }
  function count(re, t){ var m = t.match(re); return m ? m.length : 0; }

  function check(cv){
    var low = cv.toLowerCase(), lines = cv.split(/\n/).map(function(l){ return l.trim(); }).filter(Boolean);
    var wc = (cv.match(/\S+/g) || []).length, res = [], score = 0;
    function add(key, pts, max, status, detail){ score += pts; res.push({k:key, pts:pts, max:max, s:status, d:detail || ''}); }

    // 1. Contact details (15)
    var email = /[\w.+\-]+@[\w\-]+\.[\w.\-]+/.test(cv), phone = /(\+?\d[\d\s\-().]{8,}\d)/.test(cv), li = /linkedin\.com\//i.test(cv);
    var c = (email ? 7 : 0) + (phone ? 6 : 0) + (li ? 2 : 0), miss = [];
    if (!email) miss.push(T.w_email); if (!phone) miss.push(T.w_phone); if (!li) miss.push('LinkedIn');
    add('contact', c, 15, c >= 13 ? 'ok' : (c >= 7 ? 'warn' : 'bad'), miss.length ? T.missing + ' ' + miss.join(', ') : '');

    // 2. Length (10)
    var pages = +cvBox.dataset.pages || 0, lp = 0, ls;
    if (wc >= 350 && wc <= 900 && (!pages || pages <= 2)) { lp = 10; ls = 'ok'; }
    else if (wc >= 200 && wc <= 1200 && (!pages || pages <= 3)) { lp = 5; ls = 'warn'; }
    else { lp = 0; ls = 'bad'; }
    add('length', lp, 10, ls, T.wordsN.replace('{n}', wc) + (pages ? ' · ' + T.pagesN.replace('{n}', pages) : ''));

    // 3. Sections (20)
    var have = [], lack = [];
    SECTIONS.forEach(function(s){ (s[1].test(cv) ? have : lack).push(T['sec_' + s[0]]); });
    var sp = have.length * 5;
    add('sections', sp, 20, sp === 20 ? 'ok' : (sp >= 10 ? 'warn' : 'bad'), lack.length ? T.missing + ' ' + lack.join(', ') : '');

    // 4. Measurable results (15)
    var nums = 0;
    lines.forEach(function(l){
      if (/\b(19|20)\d{2}\b/.test(l) && !/[%£$€]|\b\d+\s?(k|m|people|staff|clients|customers|users|projects|sites|stores|patients|beds|members)\b/i.test(l)) return;
      if (/\d/.test(l) && /[%£$€]|\b\d+(\.\d+)?\s?(k|m|x)?\b/i.test(l)) nums++;
    });
    var np = nums >= 6 ? 15 : nums >= 3 ? 9 : nums >= 1 ? 4 : 0;
    add('numbers', np, 15, np === 15 ? 'ok' : (np >= 9 ? 'warn' : 'bad'), T.foundN.replace('{n}', nums));

    // 5. Action verbs (10)
    var vset = {}, vc = 0;
    VERBS.forEach(function(v){ var n = count(new RegExp('\\b' + v.replace(' ', '\\s') + '\\b', 'gi'), cv); if (n){ vc += n; vset[v] = 1; } });
    var vk = Object.keys(vset).length, vp = vk >= 8 ? 10 : vk >= 4 ? 6 : vk >= 1 ? 2 : 0;
    add('verbs', vp, 10, vp === 10 ? 'ok' : (vp >= 6 ? 'warn' : 'bad'), T.foundN.replace('{n}', vk) + (vk ? ': ' + Object.keys(vset).slice(0, 8).join(', ') : ''));

    // 6. Clichés and weak phrases (10)
    var weak = WEAK.filter(function(w){ return low.indexOf(w) > -1; });
    weak = weak.filter(function(w){ return !weak.some(function(o){ return o !== w && o.indexOf(w) > -1; }); });
    var wp = Math.max(0, 10 - weak.length * 3);
    add('weak', wp, 10, weak.length === 0 ? 'ok' : (wp >= 4 ? 'warn' : 'bad'), weak.length ? T.found + ' "' + weak.slice(0, 5).join('", "') + '"' : '');

    // 7. Personal pronouns (5)
    var pr = count(/(^|[\s.,;(])(i|me|my|myself)(?=[\s.,;)'])/gi, cv);
    var pp = pr <= 2 ? 5 : pr <= 6 ? 2 : 0;
    add('pronouns', pp, 5, pp === 5 ? 'ok' : (pp ? 'warn' : 'bad'), T.foundN.replace('{n}', pr));

    // 8. Personal details employers don't need (5)
    var pers = PERSONAL.filter(function(p){ return p[1].test(cv); }).map(function(p){ return T['p_' + p[0].replace(/ /g, '_')] || p[0]; });
    var ppts = pers.length === 0 ? 5 : pers.length === 1 ? 2 : 0;
    add('personal', ppts, 5, ppts === 5 ? 'ok' : (ppts ? 'warn' : 'bad'), pers.length ? T.found + ' ' + pers.join(', ') : '');

    // 9. Dates on roles (5)
    var years = count(/\b(19[89]\d|20[0-3]\d)\b/g, cv), present = /\b(present|current|now|to date)\b/i.test(cv);
    var dp = years >= 3 ? 5 : years >= 1 ? 2 : 0;
    add('dates', dp, 5, dp === 5 ? 'ok' : (dp ? 'warn' : 'bad'), T.foundN.replace('{n}', years) + (present ? ' · ' + T.presentOk : ''));

    // 10. Readability: long paragraphs (5)
    var longL = lines.filter(function(l){ return (l.match(/\S+/g) || []).length > 45; }).length;
    var bullets = lines.filter(function(l){ return /^[•\-–*·▪●◦]/.test(l); }).length;
    var rp = longL === 0 ? 5 : longL <= 2 ? 3 : 0;
    add('read', rp, 5, rp === 5 ? 'ok' : (rp ? 'warn' : 'bad'), T.longN.replace('{n}', longL) + ' · ' + T.bulletsN.replace('{n}', bullets));

    return {score: Math.round(score), items: res, wc: wc};
  }

  function jobMatch(cv, job){
    var jw = words(job), freq = {}, cvLow = ' ' + words(cv).join(' ') + ' ';
    jw.forEach(function(w){ w = w.replace(/[.']+$/, ''); if (w.length < 3 || STOPSET[w] || /^\d/.test(w)) return; freq[w] = (freq[w] || 0) + 1; });
    for (var i = 0; i < jw.length - 1; i++){
      var a = jw[i], b = jw[i + 1];
      if (STOPSET[a] || STOPSET[b] || a.length < 3 || b.length < 3) continue;
      var bg = a + ' ' + b; freq[bg] = (freq[bg] || 0) + 1.5;
    }
    var keys = Object.keys(freq).filter(function(k){ return freq[k] >= 2 || k.indexOf(' ') < 0 && /[+#]|^[a-z]{2,5}$/.test(k) && job.indexOf(k.toUpperCase()) > -1; });
    keys.sort(function(x, y){ return freq[y] - freq[x]; });
    // keep bigrams, drop single words already covered by a chosen bigram
    var top = [];
    keys.forEach(function(k){ if (top.length >= 20) return; if (k.indexOf(' ') < 0 && top.some(function(t){ return t.indexOf(' ') > -1 && t.split(' ').indexOf(k) > -1; })) return; top.push(k); });
    if (top.length < 5){ top = Object.keys(freq).sort(function(x, y){ return freq[y] - freq[x]; }).slice(0, 15); }
    var hit = [], miss = [];
    top.forEach(function(k){ (cvLow.indexOf(' ' + k + ' ') > -1 || cvLow.indexOf(' ' + k + 's ') > -1 ? hit : miss).push(k); });
    return {pct: top.length ? Math.round(hit.length / top.length * 100) : 0, hit: hit, miss: miss};
  }

  /* ---------- Render ---------- */
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function icon(s){ return s === 'ok' ? '<span class="ic ok">✓</span>' : s === 'warn' ? '<span class="ic warn">!</span>' : '<span class="ic bad">✕</span>'; }

  $('cvcForm').addEventListener('submit', function(e){
    e.preventDefault();
    var cv = cvBox.value.trim();
    if ((cv.match(/\S+/g) || []).length < 60){ fileMsg.textContent = T.tooShort; cvBox.focus(); return; }
    if (/[؀-ۿ]/.test(cv) && !/[a-z]{3,}/i.test(cv.slice(0, 400))){ fileMsg.textContent = T.arabicCv; }
    var r = check(cv), job = jobBox.value.trim(), m = job.length > 80 ? jobMatch(cv, job) : null;
    var band = r.score >= 80 ? 'good' : r.score >= 60 ? 'mid' : 'low';
    var h = '<div class="res-top ' + band + '"><div class="ring" style="--p:' + r.score + '"><b>' + r.score + '</b><small>/100</small></div><div><h3>' + T['band_' + band] + '</h3><p>' + T['bandTxt_' + band] + '</p></div></div>';
    h += '<ul class="checks">';
    r.items.slice().sort(function(a, b){ return (a.pts / a.max) - (b.pts / b.max); }).forEach(function(it){
      h += '<li class="' + it.s + '">' + icon(it.s) + '<div><b>' + T['t_' + it.k] + ' <span class="pts">' + it.pts + '/' + it.max + '</span></b>' +
           (it.d ? '<small class="det">' + esc(it.d) + '</small>' : '') + (it.s !== 'ok' ? '<p>' + T['tip_' + it.k] + '</p>' : '') + '</div></li>';
    });
    h += '</ul>';
    if (m){
      h += '<div class="match"><h3>' + T.matchTitle.replace('{p}', m.pct) + '</h3><p>' + T.matchTxt + '</p>';
      if (m.miss.length) h += '<p class="kw-h">' + T.kwMiss + '</p><div class="kw">' + m.miss.map(function(k){ return '<span class="miss">' + esc(k) + '</span>'; }).join('') + '</div>';
      if (m.hit.length) h += '<p class="kw-h">' + T.kwHit + '</p><div class="kw">' + m.hit.map(function(k){ return '<span class="hit">' + esc(k) + '</span>'; }).join('') + '</div>';
      h += '</div>';
    }
    h += T.ctaHtml.replace('{score}', r.score);
    out.innerHTML = h; out.hidden = false;
    out.scrollIntoView({behavior: 'smooth', block: 'start'});
    if (window.grConsent && grConsent.track) grConsent.track('cv_check', {score: r.score, job_match: m ? m.pct : -1, lang: AR ? 'ar' : 'en'});
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({path: 'cv-check-done' + (AR ? '-ar' : ''), title: 'CV check done', event: true}); } catch (x) {}
  });
  out.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-cta]');
    if (!a) return;
    if (window.grConsent && grConsent.track) grConsent.track('cv_check_cta', {target: a.getAttribute('data-cta')});
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({path: 'cv-check-cta-' + a.getAttribute('data-cta'), title: 'CV check CTA', event: true}); } catch (x) {}
  });
  $('sampleBtn') && $('sampleBtn').addEventListener('click', function(){ cvBox.value = T.sample; delete cvBox.dataset.pages; fileMsg.textContent = ''; });
})();
