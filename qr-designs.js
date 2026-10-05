/* Gear Radar – QR menu themes and layouts.
   One list for qr-gallery.html and signup.html. Names and tiers must match "Build Template" and "Merge Input" in the
   n8n Smart QR Catalogue - Generator, and the lists in Client Review "QR Patch".
   tier: 0 = every plan (Starter, Pro, Premium), 1 = Pro and Premium, 2 = Premium only.
   c: page colours (same values as Build Template). */
window.GR_QR_DESIGNS = {
  themes: [
    { name:'Warm Cream & Amber',      ar:'الكريمي والكهرماني',  tier:0, c:{ bg:'#fbf6ee', surface:'#ffffff', text:'#2b2118', muted:'#76675a', accent:'#a8640f', border:'#eadfcd', hero:'#2b2118', heroText:'#fbf6ee', serif:true } },
    { name:'Fresh Olive & Sage',      ar:'الزيتوني والمريمية',  tier:0, c:{ bg:'#f3f5ee', surface:'#ffffff', text:'#1f2a1c', muted:'#5c6a55', accent:'#5b6e2e', border:'#dde3d2', hero:'#3e4d2a', heroText:'#f3f5ee' } },
    { name:'Modern Minimalist Slate', ar:'الرمادي العصري',      tier:0, c:{ bg:'#f8fafc', surface:'#ffffff', text:'#0f172a', muted:'#64748b', accent:'#334155', border:'#e2e8f0', hero:'#0f172a', heroText:'#f8fafc' } },
    { name:'Bold Charcoal & Crimson', ar:'الفحمي والقرمزي',     tier:0, c:{ bg:'#f5f5f4', surface:'#ffffff', text:'#1c1917', muted:'#66605b', accent:'#b91c1c', border:'#e2dfdc', hero:'#1c1917', heroText:'#fafaf9' } },
    { name:'Dark Luxury & Gold',      ar:'الداكن والذهبي',      tier:1, c:{ bg:'#0f0f10', surface:'#19191b', text:'#f3efe6', muted:'#a39d90', accent:'#d4af37', border:'#2e2c28', hero:'#050505', heroText:'#f3efe6', serif:true } },
    { name:'Pastel Rose & Vanilla',   ar:'الوردي والفانيلا',    tier:1, c:{ bg:'#fff8f5', surface:'#ffffff', text:'#3b2a2f', muted:'#856a72', accent:'#b24d67', border:'#f1dcdd', hero:'#f6d6dc', heroText:'#3b2a2f', serif:true } },
    { name:'Ocean Blue & Sand',       ar:'الأزرق والرملي',      tier:1, c:{ bg:'#f6f2e9', surface:'#ffffff', text:'#0c2a3e', muted:'#5b6b76', accent:'#0e6ba8', border:'#e4dccb', hero:'#0c4a6e', heroText:'#f6f2e9' } },
    { name:'Midnight Neon',           ar:'النيون الليلي',       tier:2, c:{ bg:'#0b0b12', surface:'#151522', text:'#f4f4f8', muted:'#a1a1b5', accent:'#e040fb', border:'#2a2a3d', hero:'#07070c', heroText:'#22d3ee' } },
    { name:'Emerald & Brass',         ar:'الزمردي والنحاسي',    tier:2, c:{ bg:'#0f2a22', surface:'#143629', text:'#f1ede0', muted:'#b4b9a6', accent:'#c9a54a', border:'#24493b', hero:'#0a1f19', heroText:'#f1ede0', serif:true } },
    { name:'Royal Burgundy & Gold',   ar:'العنابي الملكي والذهبي', tier:2, c:{ bg:'#fbf7f2', surface:'#ffffff', text:'#3a0d17', muted:'#7a5a60', accent:'#8c1c2e', border:'#ecdcd4', hero:'#5e0f1f', heroText:'#f3d58b', serif:true } }
  ],
  layouts: [
    { name:'Modern Cards',       ar:'بطاقات عصرية',     tier:0, k:'cards',    en_d:'Each item on its own card, two columns on bigger screens.', ar_d:'كل صنف في بطاقة، وعمودين على الشاشات الكبيرة.' },
    { name:'Classic Line Menu',  ar:'قائمة كلاسيكية',   tier:0, k:'line',     en_d:'A traditional printed-menu look with thin lines.',          ar_d:'شكل المنيو المطبوع التقليدي بخطوط رفيعة.' },
    { name:'Compact Dot-Leader', ar:'قائمة منقّطة',      tier:0, k:'dots',     en_d:'Name ..... price. Fits long menus on one screen.',           ar_d:'الاسم ..... السعر. مناسب للقوائم الطويلة.' },
    { name:'Centered Elegant',   ar:'أنيق في المنتصف',  tier:0, k:'centered', en_d:'Everything centred with soft dividers.',                    ar_d:'كل شيء في المنتصف مع فواصل ناعمة.' },
    { name:'Photo Grid',         ar:'شبكة صور',         tier:1, k:'grid',     en_d:'Photo tiles, two or three per row, like a delivery app.',   ar_d:'مربعات بالصور، اثنين أو ثلاثة في الصف مثل تطبيقات التوصيل.' },
    { name:'Big Photo List',     ar:'صور كبيرة',        tier:1, k:'bigphoto', en_d:'A large photo on top of every item.',                       ar_d:'صورة كبيرة فوق كل صنف.' },
    { name:'Two Columns',        ar:'عمودين',           tier:1, k:'twocol',   en_d:'Sections side by side on tablets and computers.',           ar_d:'الأقسام جنب بعض على التابلت والكمبيوتر.' },
    { name:'Magazine',           ar:'مجلة',             tier:2, k:'magazine', en_d:'Big headings and numbered items, like a food magazine.',    ar_d:'عناوين كبيرة وأصناف مرقّمة مثل مجلات الطعام.' },
    { name:'Luxury Frame',       ar:'إطار فاخر',        tier:2, k:'frame',    en_d:'The menu inside a double gold frame with ornaments.',       ar_d:'القائمة داخل إطار مزدوج بزخارف.' },
    { name:'Bento Showcase',     ar:'عرض بينتو',        tier:2, k:'bento',    en_d:'The first item of each section is featured large.',         ar_d:'أول صنف في كل قسم يظهر بشكل مميز وكبير.' }
  ],
  planForTier: ['qr_basic', 'qr_pro', 'qr_premium']
};
