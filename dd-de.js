/* German text + links for the Services dropdown on pages that switch language in place (signup, polishly, cv-checker...). */
(function () {
  var M = {"Services": "Leistungen", "For you": "Für Sie", "Tala": "Tala", "Main": "Hauptprodukt", "Your personal assistant on Telegram and WhatsApp": "Ihre persönliche Assistentin auf Telegram und WhatsApp", "JobRadar": "JobRadar", "Jobs that match your CV, every day · Tala add-on": "Jobs, die zu Ihrem Lebenslauf passen, jeden Tag · Tala-Zusatz", "Your CV rewritten and redesigned · from £3": "Ihr Lebenslauf neu geschrieben und gestaltet · ab £3", "LinkedIn Makeover": "LinkedIn Makeover", "Your LinkedIn profile rewritten · £5": "Ihr LinkedIn-Profil neu geschrieben · £5", "Career Finder": "Career Finder", "Free": "Kostenlos", "Find the jobs that suit your experience": "Finden Sie die Jobs, die zu Ihrer Erfahrung passen", "CV Checker": "Lebenslauf-Check", "Score your CV out of 100 in 30 seconds": "Bewerten Sie Ihren Lebenslauf in 30 Sekunden (0–100)", "CVs Wallet": "CVs Wallet", "Keep up to 5 CVs in one safe place": "Bis zu 5 Lebensläufe sicher an einem Ort", "For your business": "Für Ihr Unternehmen", "A website that brings calls and WhatsApp messages": "Eine Website, die Anrufe und WhatsApp-Nachrichten bringt", "Smart QR menu with table orders": "Smarte QR-Speisekarte mit Tischbestellung", "Website + QR menu together, for less": "Website + QR-Speisekarte zusammen, günstiger", "Not sure which one you need? Talk to us": "Nicht sicher, was Sie brauchen? Sprechen Sie uns an"};
  var DE_PAGES = ['tala', 'jobradar', 'webly', 'menutap', 'duo', 'cv-wallet', 'linkedin-makeover', 'career-finder', 'cv-checker'];
  var orig = null;
  function run() {
    var dd = document.getElementById('grDD'); if (!dd) return;
    var de = (document.documentElement.lang || '').slice(0, 2) === 'de';
    var w = document.createTreeWalker(dd, NodeFilter.SHOW_TEXT), n, nodes = [];
    while ((n = w.nextNode())) nodes.push(n);
    if (!orig) orig = nodes.map(function (x) { return x.nodeValue; });
    nodes.forEach(function (x, i) {
      var o = orig[i], k = o.trim();
      x.nodeValue = de && M[k] ? o.replace(k, M[k]) : o;
    });
    dd.querySelectorAll('a[href]').forEach(function (a) {
      if (!a.dataset.enHref) a.dataset.enHref = a.getAttribute('href');
      var h = a.dataset.enHref, mm = h.match(/^(\/?)([a-z-]+)\.html(.*)$/);
      a.setAttribute('href', de && mm && DE_PAGES.indexOf(mm[2]) >= 0 ? mm[1] + mm[2] + '-de.html' + mm[3] : h);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  new MutationObserver(run).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
