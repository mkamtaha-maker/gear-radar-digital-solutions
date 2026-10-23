// Polishly design preview: renders the sample CV in any design + theme, in the browser.
// The renderer below is a copy of the n8n "Render CV" node (/polishly/templates/render.js); keep them in sync.
(function () {

const THEMES = {
  'classic-navy': { name: 'Classic Navy', accent: '#1F3A5F', soft: '#E8EEF5', head: 'Source Serif 4', body: 'Lato' },
  'charcoal': { name: 'Charcoal Minimal', accent: '#2B2B2B', soft: '#EFEFEF', head: 'Lato', body: 'Lato' },
  'emerald': { name: 'Emerald', accent: '#0F766E', soft: '#E3F3F1', head: 'Merriweather', body: 'Open Sans' },
  'burgundy': { name: 'Burgundy', accent: '#7A1F3D', soft: '#F5E6EB', head: 'Playfair Display', body: 'Lato' },
  'royal-blue': { name: 'Royal Blue', accent: '#1D4ED8', soft: '#E6EDFD', head: 'Roboto', body: 'Roboto' },
  'slate-gold': { name: 'Slate & Gold', accent: '#334155', soft: '#F3EEE4', head: 'Montserrat', body: 'Open Sans', line: '#B08D57' },
  'sunset': { name: 'Sunset Orange', accent: '#D9541E', soft: '#FDEDE4', head: 'Montserrat', body: 'Open Sans' },
  'plum': { name: 'Plum', accent: '#5B2A86', soft: '#EFE7F6', head: 'Merriweather', body: 'Lato' }
};

const LANG_LEVEL = { native: 5, fluent: 4, professional: 4, conversational: 3, intermediate: 3, basic: 2 };

const e = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const arr = v => (Array.isArray(v) ? v : []).filter(x => x !== null && x !== undefined && String(typeof x === 'object' ? JSON.stringify(x) : x).trim() !== '');
const str = v => String(v ?? '').trim();

function normalize(cv) {
  cv = cv || {};
  const p = cv.personal || {};
  return {
    name: str(cv.name) || 'Your Name',
    title: str(cv.title),
    email: str(cv.email), phone: str(cv.phone), location: str(cv.location), linkedin: str(cv.linkedin),
    profile: str(cv.profile),
    skills: arr(cv.skills).map(str).slice(0, 14),
    experience: arr(cv.experience).map(j => ({ role: str(j.role), org: str(j.org), place: str(j.place), dates: str(j.dates), points: arr(j.points).map(str) })),
    education: arr(cv.education).map(d => ({ degree: str(d.degree), org: str(d.org), dates: str(d.dates) })),
    certs: arr(cv.certs).map(str),
    languages: arr(cv.languages).map(l => typeof l === 'string'
      ? { name: l.replace(/\s*\(.*\)\s*$/, ''), level: (l.match(/\(([^)]+)\)/) || [])[1] || '' }
      : { name: str(l.name), level: str(l.level) }),
    personal: { nationality: str(p.nationality), visa: str(p.visa), dob: str(p.dob), licence: str(p.licence) }
  };
}

function render(cvIn, designKey, themeKey, photo) {
  const CV = normalize(cvIn);
  const t = THEMES[themeKey] || THEMES['classic-navy'];
  const gold = t.line || t.accent;
  const parts = CV.name.replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  const INITIALS = ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  const first = parts[0] || CV.name, rest = parts.slice(1).join(' ');
  const contacts = () => [CV.phone, CV.email, CV.location, CV.linkedin].filter(Boolean);
  const contactList = sep => contacts().map(e).join(sep);
  const contactLines = () => contacts().map(e).join('<br>');
  const pts = (j, n) => j.points.length ? '<ul>' + j.points.slice(0, n || 99).map(x => '<li>' + e(x) + '</li>').join('') + '</ul>' : '';
  const dots = (n, of = 5) => "<span class='dots'>" + Array.from({ length: of }, (_, i) => "<span class='" + (i < n ? '' : 'off') + "'></span>").join('') + '</span>';
  const langRows = color => CV.languages.map(l => "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:4px'><span>" + e(l.name) + "</span><span style='color:" + color + "'>" + dots(LANG_LEVEL[l.level.toLowerCase()] || 3) + '</span></div>').join('');
  const langText = () => CV.languages.map(l => e(l.name) + (l.level ? ' (' + e(l.level.toLowerCase()) + ')' : '')).join(', ');
  const chips = () => CV.skills.map(s => "<span class='chip'>" + e(s) + '</span>').join('');
  const certs = sep => CV.certs.map(e).join(sep);
  const det = (labels) => [[labels[0], CV.personal.nationality], [labels[1], CV.personal.visa], [labels[2], CV.personal.dob], [labels[3], CV.personal.licence]].filter(x => x[1]);
  const photoOr = (size, border) => photo
    ? "<img src='" + photo + "' style='width:" + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;' + border + "'>"
    : "<div class='hf' style='display:inline-block;width:" + size + 'px;height:' + size + 'px;border-radius:50%;' + border + ';text-align:center;line-height:' + (size - 6) + 'px;font-size:' + Math.round(size / 3.4) + "pt;background:rgba(255,255,255,.18)'>" + INITIALS + '</div>';
  const has = { profile: !!CV.profile, skills: CV.skills.length > 0, exp: CV.experience.length > 0, edu: CV.education.length > 0, certs: CV.certs.length > 0, langs: CV.languages.length > 0 };
  const eduRowsFlex = () => CV.education.map(d => "<div style='display:flex;justify-content:space-between'><span><b>" + e(d.degree) + '</b>' + (d.org ? ', ' + e(d.org) : '') + "</span><span class='muted'>" + e(d.dates) + '</span></div>').join('');
  const eduParas = mb => CV.education.map(d => "<p style='margin-bottom:" + mb + "px'><b>" + e(d.degree) + "</b><br><span class='muted'>" + [d.org, d.dates].filter(Boolean).map(e).join(' · ') + '</span></p>').join('');
  const orgPlace = j => [j.org, j.place].filter(Boolean).map(e).join(', ');

  const D = {};

  D['uk-executive'] = [true, () => {
    const h = title => "<div style='display:flex;align-items:center;margin:14px 0 7px'><span style='width:5px;height:16px;background:" + t.accent + ";margin-right:8px'></span><span class='hf acc b' style='font-size:11.5pt;letter-spacing:.4px'>" + e(title) + "</span><span style='flex:1;height:1px;background:#d6dae0;margin-left:10px'></span></div>";
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:8px'><div style='display:flex;justify-content:space-between'><span><span class='b'>" + e(j.role) + '</span>' + (j.org ? " · <span class='acc b'>" + e(j.org) + '</span>' : '') + "</span><span class='muted'>" + e(j.dates) + '</span></div>' + (j.place ? "<div class='muted' style='font-size:8.8pt'>" + e(j.place) + '</div>' : '') + pts(j) + '</div>').join('');
    const extra = [has.langs ? 'Languages: ' + langText() + '.' : '', CV.personal.licence ? e(CV.personal.licence) + '.' : '', 'References available on request.'].filter(Boolean).join(' ');
    return "<div style='background:" + t.accent + ";color:#fff;padding:13mm 15mm 9mm'><div class='hf' style='font-size:28pt;font-weight:700;line-height:1'>" + e(CV.name) + '</div>' + (CV.title ? "<div style='font-size:12pt;opacity:.9;margin-top:5px;letter-spacing:1.5px;text-transform:uppercase'>" + e(CV.title) + '</div>' : '') + '</div>'
      + "<div style='background:" + t.soft + ";padding:3mm 15mm;font-size:8.8pt;color:#333'>" + contactList(' &nbsp;·&nbsp; ') + '</div>'
      + "<div style='padding:2mm 15mm 12mm'>"
      + (has.profile ? h('Personal Profile') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.skills ? h('Key Skills') + '<div>' + chips() + '</div>' : '')
      + (has.exp ? h('Employment History') + jobs : '')
      + (has.edu || has.certs ? h('Education & Qualifications') + eduRowsFlex() + (has.certs ? "<p style='margin-top:4px'>" + certs(' · ') + '</p>' : '') : '')
      + h('Additional Information') + '<p>' + extra + '</p></div>';
  }];

  D['uk-elegant'] = [false, () => {
    const line = "<span style='display:inline-block;width:40px;height:1px;background:" + t.accent + ";vertical-align:middle'></span>";
    const h = title => "<div style='text-align:center;margin:16px 0 8px'>" + line + "<span class='hf acc' style='font-size:12.5pt;margin:0 12px;letter-spacing:2px;font-variant:small-caps'>" + e(title) + '</span>' + line + '</div>';
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:9px'><div class='hf b' style='font-size:11pt'>" + e(j.role) + "</div><div class='muted' style='font-style:italic'>" + [orgPlace(j), e(j.dates)].filter(Boolean).join(' &nbsp;—&nbsp; ') + '</div>' + pts(j) + '</div>').join('');
    return "<div style='text-align:center'><div style='display:inline-block;width:54px;height:54px;border:1.5px solid " + t.accent + ";border-radius:50%;line-height:51px' class='hf acc'><span style='font-size:17pt'>" + INITIALS + '</span></div>'
      + "<div class='hf' style='font-size:27pt;margin-top:8px;color:#1d1f24;letter-spacing:1px'>" + e(CV.name) + '</div>'
      + (CV.title ? "<div class='acc' style='letter-spacing:3px;text-transform:uppercase;font-size:9pt;margin-top:3px'>" + e(CV.title) + '</div>' : '')
      + "<div style='border-top:1px solid " + t.accent + ';border-bottom:1px solid ' + t.accent + ";padding:5px 0;margin-top:10px;font-size:8.8pt' class='muted'>" + contactList(' &nbsp;◆&nbsp; ') + '</div></div>'
      + (has.profile ? h('Personal Profile') + "<p style='text-align:center;font-style:italic;padding:0 6mm'>" + e(CV.profile) + '</p>' : '')
      + (has.exp ? h('Employment History') + jobs : '')
      + "<table style='width:100%;border-collapse:collapse'><tr><td style='width:50%;vertical-align:top;padding-right:6mm'>" + h('Education')
      + CV.education.map(d => '<p><b>' + e(d.degree) + "</b><br><span class='muted'>" + [d.org, d.dates].filter(Boolean).map(e).join(', ') + '</span></p>').join('')
      + (has.certs ? "<p class='muted'>" + certs(' · ') + '</p>' : '') + (has.langs ? "<p class='muted'>Languages: " + langText() + '</p>' : '')
      + "</td><td style='width:50%;vertical-align:top;padding-left:6mm;border-left:1px solid #e2e2e2'>" + h('Key Skills')
      + CV.skills.slice(0, 8).map(s => "<p style='margin:0 0 3px'>" + e(s) + '</p>').join('')
      + "<p class='muted' style='margin-top:6px'>References available on request.</p></td></tr></table>";
  }];

  D['us-bold'] = [false, () => {
    const h = title => "<div style='background:" + t.accent + ";color:#fff;padding:3px 9px;margin:12px 0 7px;font-weight:700;letter-spacing:1.5px;font-size:9.6pt' class='hf'>" + e(title.toUpperCase()) + '</div>';
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:7px'><div style='display:flex;justify-content:space-between;align-items:baseline'><span><span class='b' style='font-size:10.5pt'>" + e(j.role) + '</span>' + (orgPlace(j) ? " <span class='muted'>| " + orgPlace(j) + '</span>' : '') + '</span>' + (j.dates ? "<span style='background:" + t.soft + ';color:' + t.accent + ";font-weight:700;font-size:8.4pt;padding:1px 7px;border-radius:3px;white-space:nowrap'>" + e(j.dates) + '</span>' : '') + '</div>' + pts(j) + '</div>').join('');
    return "<div style='border-left:9px solid " + t.accent + ";padding-left:12px'><div class='hf' style='font-size:30pt;font-weight:700;line-height:1;color:#15171c'>" + e(first) + (rest ? " <span class='acc'>" + e(rest) + '</span>' : '') + '</div>'
      + (CV.title ? "<div style='font-size:12pt;font-weight:700;margin-top:4px'>" + e(CV.title) + '</div>' : '')
      + "<div class='muted' style='margin-top:2px'>" + contactList(' | ') + '</div></div>'
      + (has.profile ? h('Summary') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? h('Experience') + jobs : '')
      + (has.skills ? h('Skills') + '<p>' + CV.skills.map((s, i) => i < 3 ? '<b>' + e(s) + '</b>' : e(s)).join(' · ') + '</p>' : '')
      + (has.edu || has.certs ? h('Education & Certifications') + eduRowsFlex() + (has.certs ? "<p class='muted' style='margin-top:3px'>" + certs(', ') + '</p>' : '') : '')
      + (has.langs ? h('Languages') + '<p>' + langText() + '</p>' : '');
  }];

  D['us-timeline'] = [false, () => {
    let n = 0;
    const h = title => { n++; return "<div style='margin:14px 0 8px;display:flex;align-items:baseline'><span class='hf acc' style='font-size:15pt;font-weight:700;margin-right:8px'>" + String(n).padStart(2, '0') + "</span><span class='hf b' style='font-size:11.5pt;letter-spacing:1px;text-transform:uppercase'>" + e(title) + '</span></div>'; };
    const items = CV.experience.map(j => "<div class='job' style='position:relative;padding:0 0 9px 20px;border-left:2px solid " + t.soft + ";margin-left:5px'><span style='position:absolute;left:-7px;top:2px;width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid " + t.accent + "'></span><div style='display:flex;justify-content:space-between'><span class='b'>" + e(j.role) + "</span><span class='acc b' style='font-size:8.8pt'>" + e(j.dates) + "</span></div><div class='muted'>" + [j.org, j.place].filter(Boolean).map(e).join(' · ') + '</div>' + pts(j) + '</div>').join('');
    return "<table style='width:100%;border-collapse:collapse'><tr><td style='vertical-align:bottom'><div class='hf' style='font-size:28pt;font-weight:700;line-height:1'>" + e(CV.name) + '</div>' + (CV.title ? "<div class='acc b' style='font-size:11.5pt;margin-top:4px'>" + e(CV.title) + '</div>' : '') + "</td><td style='vertical-align:bottom;text-align:right;font-size:8.8pt' class='muted'>" + contactLines() + '</td></tr></table>'
      + "<div style='height:3px;background:" + t.accent + ";margin:9px 0 2px'></div>"
      + (has.profile ? h('Summary') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? h('Experience') + items : '')
      + (has.skills ? h('Skills') + '<div>' + chips() + '</div>' : '')
      + (has.edu || has.certs ? h('Education') + eduRowsFlex() + (has.certs ? "<p class='muted' style='margin-top:3px'>Certifications: " + certs(', ') + '</p>' : '') : '')
      + (has.langs ? h('Languages') + '<p>' + langText() + '</p>' : '');
  }];

  D['modern-sidebar'] = [true, () => {
    const sh = title => "<div class='hf' style='font-size:9.5pt;letter-spacing:2px;text-transform:uppercase;margin:16px 0 7px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.35)'>" + e(title) + '</div>';
    const mh = title => "<div class='hf acc b' style='font-size:12pt;margin:14px 0 6px'>" + e(title) + "<span style='display:block;width:28px;height:3px;background:" + t.accent + ";margin-top:3px'></span></div>";
    const W = [92, 88, 85, 80, 78, 75, 72, 70];
    const bars = CV.skills.slice(0, 8).map((s, i) => "<div style='margin-bottom:6px'><div style='font-size:8.6pt'>" + e(s) + "</div><div style='height:4px;background:rgba(255,255,255,.25);border-radius:2px'><div style='height:4px;width:" + W[i] + "%;background:#fff;border-radius:2px'></div></div></div>").join('');
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:8px'><div class='b' style='font-size:10.3pt'>" + e(j.role) + "</div><div style='font-size:8.8pt' class='acc b'>" + e(j.org) + (j.dates ? " <span class='muted' style='font-weight:400'>· " + e(j.dates) + '</span>' : '') + '</div>' + pts(j, 3) + '</div>').join('');
    return "<div style='display:flex;min-height:297mm'><div style='width:72mm;background:" + t.accent + ";color:#fff;padding:14mm 8mm 10mm'>"
      + photoOr(66, 'border:2px solid #fff')
      + sh('Contact') + "<div style='font-size:8.6pt;line-height:1.7;word-break:break-word'>" + contactLines() + '</div>'
      + (has.skills ? sh('Skills') + bars : '')
      + (has.langs ? sh('Languages') + "<div style='font-size:8.8pt'>" + langRows('#fff') + '</div>' : '')
      + (has.certs ? sh('Certifications') + "<div style='font-size:8.6pt'>" + certs('<br>') + '</div>' : '')
      + "</div><div style='flex:1;padding:14mm 11mm 10mm 9mm'><div class='hf' style='font-size:27pt;font-weight:700;line-height:1.05;color:#15171c'>" + e(CV.name) + '</div>'
      + (CV.title ? "<div style='font-size:11.5pt;letter-spacing:2px;text-transform:uppercase;margin-top:5px' class='acc'>" + e(CV.title) + '</div>' : '')
      + (has.profile ? mh('Profile') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? mh('Experience') + jobs : '')
      + (has.edu ? mh('Education') + eduParas(4) : '')
      + '</div></div>';
  }];

  D['modern-split'] = [true, () => {
    const h = title => "<div class='hf b' style='font-size:10.5pt;letter-spacing:1.5px;text-transform:uppercase;margin:13px 0 6px;color:" + t.accent + "'>" + e(title) + '</div>';
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:8px;padding-left:9px;border-left:3px solid " + t.soft + "'><div style='display:flex;justify-content:space-between'><span class='b'>" + e(j.role) + "</span><span class='muted' style='font-size:8.6pt;white-space:nowrap'>" + e(j.dates) + "</span></div><div class='muted'>" + e(j.org) + '</div>' + pts(j, 3) + '</div>').join('');
    const cl = [['Phone', CV.phone], ['Email', CV.email], ['Location', CV.location]].filter(x => x[1]).map(x => "<b class='acc'>" + x[0] + '</b><br>' + e(x[1])).join('<br>');
    return "<div style='display:flex'><div style='flex:1.35;background:" + t.accent + ";color:#fff;padding:13mm 9mm 9mm 13mm'><div class='hf' style='font-size:28pt;font-weight:700;line-height:1'>" + e(first) + (rest ? '<br>' + e(rest) : '') + '</div>'
      + (CV.title ? "<div style='margin-top:7px;letter-spacing:2px;text-transform:uppercase;font-size:9.5pt;opacity:.9'>" + e(CV.title) + '</div>' : '')
      + "</div><div style='flex:1;background:" + t.soft + ";padding:13mm 11mm 9mm 9mm;font-size:8.8pt;line-height:1.8;word-break:break-word'>" + cl + '</div></div>'
      + "<div style='display:flex;padding:3mm 11mm 10mm 13mm'><div style='flex:1.35;padding-right:8mm'>"
      + (has.profile ? h('About me') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? h('Experience') + jobs : '')
      + "</div><div style='flex:1'>"
      + (has.skills ? h('Skills') + '<div>' + chips() + '</div>' : '')
      + (has.edu ? h('Education') + eduParas(5) : '')
      + (has.langs ? h('Languages') + "<div style='color:#23262d'>" + langRows(t.accent) + '</div>' : '')
      + (has.certs ? h('Certifications') + '<p>' + certs('<br>') + '</p>' : '')
      + (CV.linkedin ? h('Online') + '<p>' + e(CV.linkedin) + '</p>' : '')
      + '</div></div>';
  }];

  const gulfDetails = cols => det(['Nationality', 'Visa status', 'Date of birth', 'Driving licence']).map(([k, v]) => "<div style='display:inline-block;width:" + (Math.floor(100 / cols) - 2) + '%;margin:0 1% 6px 0;background:' + t.soft + ";padding:5px 8px;border-radius:4px;vertical-align:top'><div class='muted' style='font-size:7.8pt;text-transform:uppercase;letter-spacing:1px'>" + e(k) + "</div><div class='b'>" + e(v) + '</div></div>').join('');

  D['gulf-premium'] = [true, () => {
    const h = title => "<div class='hf b' style='font-size:11pt;letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 7px;color:" + t.accent + "'>" + e(title) + "<span style='display:block;width:36px;height:2px;background:" + gold + ";margin-top:4px'></span></div>";
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:8px'><div style='display:flex;justify-content:space-between'><span><span class='b'>" + e(j.role) + '</span>' + (orgPlace(j) ? ' — ' + orgPlace(j) : '') + "</span><span class='gold b' style='font-size:8.8pt;white-space:nowrap'>" + e(j.dates) + '</span></div>' + pts(j) + '</div>').join('');
    const d = gulfDetails(4);
    return "<div style='background:" + t.accent + ";color:#fff;padding:11mm 15mm 9mm;display:flex;align-items:center;border-bottom:4px solid " + gold + "'><div style='margin-right:9mm;flex:none'>" + photoOr(96, 'border:3px solid ' + gold) + '</div>'
      + "<div><div class='hf' style='font-size:27pt;font-weight:700;line-height:1'>" + e(CV.name) + '</div>'
      + (CV.title ? "<div style='color:" + gold + ";font-size:11.5pt;margin-top:5px;letter-spacing:1px' class='b'>" + e(CV.title) + '</div>' : '')
      + "<div style='font-size:8.8pt;margin-top:6px;opacity:.9'>" + contactList(' &nbsp;|&nbsp; ') + '</div></div></div>'
      + "<div style='padding:2mm 15mm 10mm'>"
      + (d ? h('Personal Details') + '<div>' + d + '</div>' : '')
      + (has.profile ? h('Career Objective') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? h('Professional Experience') + jobs : '')
      + "<div style='display:flex'><div style='flex:1;padding-right:6mm'>"
      + (has.edu ? h('Education') + eduParas(4) : '')
      + (has.langs ? h('Languages') + langRows(gold) : '')
      + "</div><div style='flex:1.3'>"
      + (has.skills || has.certs ? h('Skills & Certifications') + '<div>' + chips() + '</div>' + (has.certs ? "<p class='muted'>" + certs(' · ') + '</p>' : '') : '')
      + '</div></div></div>';
  }];

  D['gulf-sidebar'] = [true, () => {
    const sh = title => "<div class='hf b acc' style='font-size:9.5pt;letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 6px'>" + e(title) + '</div>';
    const mh = title => "<div class='hf b' style='font-size:11.5pt;margin:14px 0 6px;color:#15171c;border-bottom:2px solid " + t.accent + ";padding-bottom:3px'>" + e(title) + '</div>';
    const d = det(['Nationality', 'Visa', 'Born', 'Licence']);
    const jobs = CV.experience.map(j => "<div class='job' style='margin-bottom:8px'><div class='b' style='font-size:10.3pt'>" + e(j.role) + "</div><div class='acc' style='font-size:8.8pt'>" + [orgPlace(j), e(j.dates)].filter(Boolean).join(' · ') + '</div>' + pts(j) + '</div>').join('');
    return "<div style='display:flex;min-height:297mm'><div style='width:70mm;background:" + t.soft + ";padding:12mm 8mm 10mm;font-size:8.8pt'>"
      + "<div style='text-align:center;color:" + t.accent + "'>" + photoOr(112, 'border:4px solid ' + t.accent) + '</div>'
      + (d.length ? sh('Personal Details') + d.map(([k, v]) => "<div style='margin-bottom:5px'><span class='muted'>" + e(k) + '</span><br><b>' + e(v) + '</b></div>').join('') : '')
      + sh('Contact') + "<div style='line-height:1.7;word-break:break-word'>" + contactLines() + '</div>'
      + (has.langs ? sh('Languages') + langRows(t.accent) : '')
      + (has.skills ? sh('Skills') + CV.skills.map(s => "<div style='margin-bottom:3px'>▸ " + e(s) + '</div>').join('') : '')
      + "</div><div style='flex:1;padding:14mm 11mm 10mm 9mm'><div class='hf acc' style='font-size:27pt;font-weight:700;line-height:1.05'>" + e(CV.name) + '</div>'
      + (CV.title ? "<div style='font-size:11.5pt;margin-top:5px;letter-spacing:1px' class='b'>" + e(CV.title) + '</div>' : '')
      + (has.profile ? mh('Career Objective') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? mh('Professional Experience') + jobs : '')
      + (has.edu ? mh('Education') + eduParas(4) : '')
      + (has.certs ? mh('Certifications') + '<p>' + certs(' · ') + '</p>' : '')
      + '</div></div>';
  }];

  // Classic layouts (v1): table-based, also the base of the Word file.
  const h2 = title => '<h2>' + e(title) + '</h2>';
  const jobRows = sep => CV.experience.map(j => "<div class='job'><table><tr><td><span class='role'>" + e(j.role) + '</span>' + (orgPlace(j) ? sep + orgPlace(j) : '') + "</td><td class='dates'>" + e(j.dates) + '</td></tr></table>' + pts(j) + '</div>').join('');
  const eduRows = () => CV.education.map(d => "<table style='margin-bottom:3px'><tr><td><span class='role'>" + e(d.degree) + '</span>' + (d.org ? ' | ' + e(d.org) : '') + "</td><td class='dates'>" + e(d.dates) + '</td></tr></table>').join('');
  const skillsGrid = () => { const rows = []; for (let i = 0; i < CV.skills.length; i += 2) rows.push(CV.skills.slice(i, i + 2)); return '<table>' + rows.map(r => '<tr>' + r.map(x => "<td style='padding:1px 0'>• " + e(x) + '</td>').join('') + '</tr>').join('') + '</table>'; };
  const classicUk = () => "<div style='text-align:center'><h1>" + e(CV.name) + '</h1>' + (CV.title ? "<p style='font-size:12pt;margin:4px 0 0'><b>" + e(CV.title) + '</b></p>' : '') + "<p class='muted' style='margin-top:6px'>" + [CV.location, CV.phone, CV.email, CV.linkedin].filter(Boolean).map(e).join(' &nbsp;|&nbsp; ') + '</p></div>'
    + (has.profile ? h2('Personal Profile') + '<p>' + e(CV.profile) + '</p>' : '')
    + (has.skills ? h2('Key Skills') + skillsGrid() : '')
    + (has.exp ? h2('Employment History') + jobRows(' | ') : '')
    + (has.edu || has.certs ? h2('Education & Qualifications') + eduRows() + (has.certs ? "<p style='margin-top:4px'>" + certs(' · ') + '</p>' : '') : '')
    + h2('Additional Information') + (has.langs ? '<p>Languages: ' + langText() + '.' + (CV.personal.licence ? ' ' + e(CV.personal.licence) + '.' : '') + '</p>' : '') + '<p>References available on request.</p>';
  D['uk-classic'] = [false, classicUk, 'classic'];

  D['us-classic'] = [false, () => "<h1 style='font-size:26pt'>" + e(CV.name) + '</h1>' + (CV.title ? "<p style='font-size:11.5pt;margin:3px 0 2px'><b>" + e(CV.title) + '</b></p>' : '') + "<p class='muted'>" + [CV.location, CV.phone, CV.email, CV.linkedin].filter(Boolean).map(e).join(' • ') + '</p>'
    + (has.profile ? h2('Summary') + '<p>' + e(CV.profile) + '</p>' : '')
    + (has.exp ? h2('Experience') + jobRows(', ') : '')
    + (has.skills ? h2('Skills') + '<p>' + CV.skills.map(e).join(' • ') + '</p>' : '')
    + (has.edu ? h2('Education') + eduRows() : '')
    + (has.certs ? "<p class='muted'>Certifications: " + certs(', ') + '</p>' : '')
    + (has.langs ? "<p class='muted'>Languages: " + langText() + '</p>' : ''), 'classic'];

  D['modern-classic'] = [false, () => {
    const sideH = "font-family:'" + t.head + "',serif;color:" + t.accent + ";font-size:10.5pt;text-transform:uppercase;letter-spacing:.6px;margin:14px 0 5px;border:0;padding:0";
    const list = a => a.map(s => "<p style='margin:0 0 3px'>" + e(s) + '</p>').join('');
    const side = "<p style=\"" + sideH + "\">Contact</p><p style='word-break:break-word'>" + contactLines() + '</p>'
      + (has.skills ? "<p style=\"" + sideH + "\">Skills</p>" + list(CV.skills) : '')
      + (has.langs ? "<p style=\"" + sideH + "\">Languages</p>" + list(CV.languages.map(l => l.name + (l.level ? ' (' + l.level.toLowerCase() + ')' : ''))) : '')
      + (has.certs ? "<p style=\"" + sideH + "\">Certifications</p>" + list(CV.certs) : '');
    const jobs = CV.experience.map(j => "<div class='job'><p style='margin:0'><span class='role'>" + e(j.role) + "</span></p><p class='muted' style='margin:0 0 2px'>" + [j.org, j.dates].filter(Boolean).map(e).join(' · ') + '</p>' + pts(j, 3) + '</div>').join('');
    return "<table><tr><td style='width:33%;background:" + t.soft + ";padding:18px 14px;font-size:9.2pt'>" + side + "</td><td style='width:67%;padding:4px 0 0 20px'><h1>" + e(CV.name) + '</h1>'
      + (CV.title ? "<p style='font-size:12pt;color:#444;margin:4px 0 0'>" + e(CV.title) + '</p>' : '')
      + (has.profile ? h2('Profile') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? h2('Experience') + jobs : '')
      + (has.edu ? h2('Education') + eduRows() : '')
      + '</td></tr></table>';
  }, 'classic'];

  D['gulf-classic'] = [false, () => {
    const dd = det(['Nationality', 'Visa status', 'Date of birth', 'Driving licence']).concat(has.langs ? [['Languages', CV.languages.map(l => l.name + (l.level ? ' (' + l.level.toLowerCase() + ')' : '')).join(', ')]] : []);
    const img = photo ? "<td style='width:118px;padding:12px 14px 12px 0;text-align:right'><img src='" + photo + "' style='width:96px;height:115px;object-fit:cover;border:3px solid #fff'></td>" : '';
    return "<table style='background:" + t.soft + "'><tr><td style='padding:14px 16px'><h1>" + e(CV.name) + '</h1>' + (CV.title ? "<p style='font-size:12pt;margin:4px 0 8px'><b>" + e(CV.title) + '</b></p>' : '')
      + "<p class='muted' style='margin:0'>" + [CV.phone, CV.email].filter(Boolean).map(e).join(' &nbsp;|&nbsp; ') + '<br>' + [CV.location, CV.linkedin].filter(Boolean).map(e).join(' &nbsp;|&nbsp; ') + '</p></td>' + img + '</tr></table>'
      + (dd.length ? h2('Personal Details') + '<table>' + dd.map(([k, v]) => "<tr><td style='width:34%;padding:2px 0' class='muted'>" + e(k) + "</td><td style='padding:2px 0'>" + e(v) + '</td></tr>').join('') + '</table>' : '')
      + (has.profile ? h2('Career Objective') + '<p>' + e(CV.profile) + '</p>' : '')
      + (has.exp ? h2('Professional Experience') + jobRows(' | ') : '')
      + (has.edu ? h2('Education') + eduRows() : '')
      + (has.skills || has.certs ? h2('Skills & Certifications') + skillsGrid() + (has.certs ? "<p style='margin-top:4px'>" + certs(' · ') + '</p>' : '') : '');
  }, 'classic'];

  const fonts = [...new Set([t.head, t.body])].map(f => 'family=' + f.replace(/ /g, '+') + ':ital,wght@0,400;0,700;1,400').join('&');
  const fontLink = "<link rel='stylesheet' href='https://fonts.googleapis.com/css2?" + fonts + "&display=swap'>";

  const v2css = bleed => '@page { size: A4; margin: ' + (bleed ? '0' : '15mm 15mm') + '; }\n'
    + '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\nhtml, body { margin: 0; }\n'
    + "body { font-family: '" + t.body + "', Arial, sans-serif; font-size: 9.6pt; color: #23262d; line-height: 1.42; }\n"
    + "@media screen { " + (bleed ? '' : 'body { padding: 15mm; } ') + 'body { width: 210mm; } }\n'
    + ".hf { font-family: '" + t.head + "', Georgia, serif; }\n.acc { color: " + t.accent + "; }\n.gold { color: " + gold + "; }\n"
    + 'p { margin: 0 0 5px; }\nul { margin: 3px 0 6px; padding-left: 15px; }\nli { margin-bottom: 2px; }\n.muted { color: #5b616b; }\n.b { font-weight: 700; }\n'
    + '.chip { display: inline-block; padding: 3px 9px; margin: 0 5px 5px 0; border-radius: 12px; background: ' + t.soft + '; color: ' + t.accent + '; font-size: 8.6pt; font-weight: 700; }\n'
    + '.dots span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 3px; background: currentColor; }\n.dots span.off { opacity: .25; }\n'
    + '.job { page-break-inside: avoid; }\n';
  const classicCss = () => '@page { size: A4; margin: 16mm 15mm; }\n* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n'
    + "body { font-family: '" + t.body + "', Arial, sans-serif; font-size: 10pt; color: #222; line-height: 1.4; margin: 0; }\n"
    + "h1 { font-family: '" + t.head + "', Georgia, serif; color: " + t.accent + '; margin: 0; font-size: 24pt; line-height: 1.1; }\n'
    + "h2 { font-family: '" + t.head + "', Georgia, serif; color: " + t.accent + '; font-size: 12pt; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 1.5px solid ' + gold + '; text-transform: uppercase; letter-spacing: .6px; }\n'
    + 'p { margin: 0 0 6px; }\nul { margin: 3px 0 8px 0; padding-left: 16px; }\nli { margin: 0 0 2px; }\ntable { border-collapse: collapse; width: 100%; }\ntd { vertical-align: top; padding: 0; }\n'
    + '.muted { color: #555; }\n.role { font-weight: 700; }\n.dates { text-align: right; white-space: nowrap; color: #555; }\n.job { margin-bottom: 6px; page-break-inside: avoid; }\n@media screen { body { padding: 16mm 15mm; width: 210mm; } }\n';

  const d = D[designKey] || D['uk-executive'];
  const css = d[2] === 'classic' ? classicCss() : v2css(d[0]);
  const html = "<!doctype html><html><head><meta charset='utf-8'>" + fontLink + '<style>' + css + '</style></head><body>' + d[1]() + '</body></html>';

  // Word (.doc): Word opens HTML saved as .doc. Always the simple table layout (UK classic, or Gulf classic for Gulf designs), no web fonts.
  const wordBody = /^gulf-/.test(designKey) ? D['gulf-classic'][1]() : classicUk();
  const word = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + e(CV.name) + ' CV</title><style>'
    + classicCss().replace(/'[^']+', (Arial|Georgia)/g, "'$1'").replace(/@media screen[^\n]*\n/, '') + '</style></head><body>' + wordBody + '</body></html>';

  return { html, word, name: CV.name };
}

// Cover letter (Polishly Plus): one A4 page in the same theme.
function renderLetter(cvIn, letter, themeKey) {
  const CV = normalize(cvIn);
  const t = THEMES[themeKey] || THEMES['classic-navy'];
  const paras = String(letter || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).map(x => '<p>' + e(x).replace(/\n/g, '<br>') + '</p>').join('');
  const fonts = [...new Set([t.head, t.body])].map(f => 'family=' + f.replace(/ /g, '+') + ':wght@400;700').join('&');
  return "<!doctype html><html><head><meta charset='utf-8'><link rel='stylesheet' href='https://fonts.googleapis.com/css2?" + fonts + "&display=swap'><style>@page { size: A4; margin: 22mm 22mm; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }"
    + " body { font-family: '" + t.body + "', Arial, sans-serif; font-size: 10.5pt; color: #222; line-height: 1.55; margin: 0; } p { margin: 0 0 11px; }</style></head><body>"
    + "<div style=\"border-bottom:2px solid " + (t.line || t.accent) + ";padding-bottom:8px;margin-bottom:18px\"><div style=\"font-family:'" + t.head + "',Georgia,serif;font-size:20pt;font-weight:700;color:" + t.accent + "\">" + e(CV.name) + '</div>'
    + "<div style='color:#555;font-size:9pt;margin-top:3px'>" + [CV.phone, CV.email, CV.location].filter(Boolean).map(e).join(' &nbsp;|&nbsp; ') + '</div></div>' + paras + '</body></html>';
}

  // Sample person shown in every preview (the same data as the gallery images).
  const SAMPLE = {
    name: 'James Carter', title: 'Operations & Project Manager',
    email: 'james.carter@example.com', phone: '+44 7700 900123', location: 'Manchester, UK', linkedin: 'linkedin.com/in/james-carter',
    profile: "Operations and project manager with 9 years' experience across logistics and facilities in the UK and Saudi Arabia. Delivered projects worth up to £4.2m on time, cut operating costs by 18% and led teams of 25+. Calm under pressure, data-driven and known for turning messy processes into simple ones.",
    skills: ['Project planning (PRINCE2)', 'Budget control', 'Team leadership', 'Supplier negotiation', 'Process improvement (Lean)', 'Power BI & Excel', 'Health & safety', 'Stakeholder reporting'],
    experience: [
      { role: 'Operations Manager', org: 'Northway Logistics', place: 'Manchester, UK', dates: '2022 – Present', points: ['Run daily operations for a 60,000 sq ft warehouse handling 12,000 orders a week.', 'Cut late deliveries from 9% to 2% in 8 months by redesigning picking routes.', 'Lead a team of 28 staff across 3 shifts; reduced staff turnover by 30%.'] },
      { role: 'Project Manager', org: 'Al Bayan Facilities Co.', place: 'Riyadh, KSA', dates: '2018 – 2022', points: ['Managed 14 fit-out projects worth £4.2m, all delivered within budget.', 'Introduced a supplier scorecard that saved SAR 1.1m a year.', 'Reported weekly to the board on cost, time and risk.'] },
      { role: 'Site Coordinator', org: 'Gulf Build Contracting', place: 'Jeddah, KSA', dates: '2015 – 2018', points: ['Coordinated subcontractors on sites with up to 120 workers.', 'Kept a zero lost-time-injury record for 3 years.'] }
    ],
    education: [{ degree: 'MSc Project Management', org: 'University of Salford', dates: '2021' }, { degree: 'BSc Civil Engineering', org: 'University of Leeds', dates: '2014' }],
    certs: ['PRINCE2 Practitioner', 'NEBOSH General Certificate'],
    languages: ['English (native)', 'Arabic (conversational)'],
    personal: { nationality: 'British', visa: 'Employment visa (transferable)', dob: '12 March 1990', licence: 'UK & GCC driving licence' }
  };
  // Gulf designs show a photo; the preview uses a plain silhouette.
  const PHOTO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="#cbd5e1"/><circle cx="50" cy="45" r="22" fill="#94a3b8"/><path d="M10 120c4-30 22-42 40-42s36 12 40 42z" fill="#94a3b8"/></svg>');

  window.PolishlyPreview = function (designKey, themeKey) {
    return render(SAMPLE, designKey, themeKey, /^gulf-/.test(designKey) ? PHOTO : '').html;
  };
})();
