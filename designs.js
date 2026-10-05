/* Gear Radar – website themes and design templates.
   One list for gallery.html and signup.html. Names and tiers must match "Apply Plan" in the n8n Website Agent.
   tier: 0 = every plan (Starter, Pro, Premium), 1 = Pro and Premium, 2 = Premium only. */
window.GR_DESIGNS = {
  themes: [
    { name:'Modern Blue',             ar:'الأزرق العصري',        tier:0, sw:['#0f172a','#2563eb','#38bdf8'],
      v:{ bg:'#ffffff', fg:'#0f172a', sub:'#64748b', nav:'#0f172a', navfg:'#ffffff', pri:'#2563eb', prifg:'#ffffff', acc:'#38bdf8', card:'#f1f5f9' } },
    { name:'Emerald Green',           ar:'الأخضر الزمردي',       tier:0, sw:['#065f46','#059669','#2dd4bf'],
      v:{ bg:'#f0fdfa', fg:'#064e3b', sub:'#4b6b63', nav:'#065f46', navfg:'#ffffff', pri:'#059669', prifg:'#ffffff', acc:'#2dd4bf', card:'#ffffff' } },
    { name:'Warm Sand & Terracotta',  ar:'الرملي والطوبي',       tier:0, sw:['#fffbeb','#c2410c','#fcd34d'],
      v:{ bg:'#fafaf9', fg:'#292524', sub:'#78716c', nav:'#fffbeb', navfg:'#292524', pri:'#c2410c', prifg:'#ffffff', acc:'#f59e0b', card:'#ffffff' } },
    { name:'Clean Mono',              ar:'الأبيض والأسود',        tier:0, sw:['#ffffff','#171717','#a3a3a3'],
      v:{ bg:'#ffffff', fg:'#171717', sub:'#737373', nav:'#ffffff', navfg:'#171717', pri:'#171717', prifg:'#ffffff', acc:'#a3a3a3', card:'#f5f5f5' } },
    { name:'Vibrant Orange & Purple', ar:'البرتقالي والبنفسجي',  tier:1, sw:['#7c3aed','#f97316','#faf5ff'],
      v:{ bg:'#faf5ff', fg:'#1e1b4b', sub:'#6b6790', nav:'#7c3aed', navfg:'#ffffff', pri:'#f97316', prifg:'#ffffff', acc:'#7c3aed', card:'#ffffff' } },
    { name:'Ocean Teal & Coral',      ar:'الفيروزي والمرجاني',   tier:1, sw:['#164e63','#0d9488','#fb7185'],
      v:{ bg:'#ecfeff', fg:'#164e63', sub:'#4f7480', nav:'#164e63', navfg:'#ffffff', pri:'#fb7185', prifg:'#ffffff', acc:'#0d9488', card:'#ffffff' } },
    { name:'Rose & Blush',            ar:'الوردي الناعم',         tier:1, sw:['#fff1f2','#f43f5e','#fbcfe8'],
      v:{ bg:'#fff1f2', fg:'#4c0519', sub:'#9f5b68', nav:'#ffffff', navfg:'#4c0519', pri:'#f43f5e', prifg:'#ffffff', acc:'#f9a8d4', card:'#ffffff' } },
    { name:'Luxury Dark & Gold',      ar:'الداكن والذهبي',        tier:2, sw:['#020617','#fbbf24','#eab308'],
      v:{ bg:'#020617', fg:'#f8fafc', sub:'#94a3b8', nav:'#020617', navfg:'#fbbf24', pri:'#fbbf24', prifg:'#020617', acc:'#eab308', card:'#0f172a' } },
    { name:'Royal Navy & Champagne',  ar:'الكحلي والشامبين',      tier:2, sw:['#1e1b4b','#fde68a','#fafaf9'],
      v:{ bg:'#fafaf9', fg:'#1e1b4b', sub:'#57534e', nav:'#1e1b4b', navfg:'#fde68a', pri:'#1e1b4b', prifg:'#fde68a', acc:'#d6b85a', card:'#ffffff' } },
    { name:'Midnight Neon',           ar:'النيون الليلي',         tier:2, sw:['#09090b','#d946ef','#22d3ee'],
      v:{ bg:'#09090b', fg:'#fafafa', sub:'#a1a1aa', nav:'#09090b', navfg:'#fafafa', pri:'#d946ef', prifg:'#ffffff', acc:'#22d3ee', card:'#18181b' } }
  ],
  templates: [
    { name:'Classic',         ar:'كلاسيكي',        tier:0, en_d:'Centred hero, cards for everything. Safe and clear.',          ar_d:'واجهة في المنتصف وبطاقات لكل قسم. واضح ومريح.' },
    { name:'Split Hero',      ar:'واجهة مقسومة',   tier:0, en_d:'Text on one side, a big visual on the other.',                ar_d:'النص في جهة وصورة كبيرة في الجهة الأخرى.' },
    { name:'Minimal',         ar:'بسيط',            tier:0, en_d:'Lots of white space and a clean price list.',                 ar_d:'مساحات واسعة وقائمة أسعار نظيفة.' },
    { name:'Bold Banner',     ar:'بانر جريء',       tier:0, en_d:'Huge headline on a full colour banner.',                      ar_d:'عنوان ضخم على شريط ملوّن بعرض الصفحة.' },
    { name:'Photo Showcase',  ar:'عرض الصور',       tier:1, en_d:'Full-screen photo at the top, gallery up front.',             ar_d:'صورة بملء الشاشة في الأعلى والمعرض في المقدمة.' },
    { name:'Card Grid',       ar:'شبكة بطاقات',     tier:1, en_d:'Modern bento grid with a sticky call bar on phones.',         ar_d:'شبكة بطاقات عصرية وشريط اتصال ثابت على الجوال.' },
    { name:'Local Shop',      ar:'محل محلي',        tier:1, en_d:'Info bar, menu-style prices, map and hours up top.',          ar_d:'شريط معلومات وأسعار كالمنيو والخريطة والمواعيد في الأعلى.' },
    { name:'Editorial',       ar:'مجلة',            tier:2, en_d:'Magazine look with serif headings and big numbers.',          ar_d:'شكل مجلة بعناوين أنيقة وأرقام كبيرة.' },
    { name:'Luxury Showcase', ar:'عرض فاخر',        tier:2, en_d:'Elegant serif titles, gold lines, soft fade-ins.',            ar_d:'عناوين فاخرة وخطوط ذهبية وظهور ناعم.' },
    { name:'Story Scroll',    ar:'قصة متتابعة',     tier:2, en_d:'Storytelling sections, a how-it-works timeline, progress bar.', ar_d:'أقسام تحكي قصتك وخطوات العمل وشريط تقدّم.' }
  ],
  // Lowest plan key for each tier.
  planForTier: ['web_basic', 'web_pro', 'web_premium']
};
