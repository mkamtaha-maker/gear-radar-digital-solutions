/* Free CV checker. Everything runs in the visitor's browser: the CV is never uploaded. */
(function(){
  var T = window.CVC_T, AR = document.documentElement.lang === 'ar', DEP = document.documentElement.lang === 'de', ESP = document.documentElement.lang === 'es', FRP = document.documentElement.lang === 'fr';
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

  /* German CVs (Lebenslauf): own verbs, headings, clichés and stop words. Picked from the CV text, not the page. */
  var DE_RULES = {
    verbs: 'geleitet,geführt,verantwortet,gesteigert,gesenkt,reduziert,entwickelt,eingeführt,aufgebaut,organisiert,koordiniert,umgesetzt,optimiert,verhandelt,geschult,betreut,erstellt,realisiert,durchgeführt,implementiert,analysiert,konzipiert,gewonnen,erreicht,verbessert,ausgebaut,gestaltet,geplant,gesteuert,eingearbeitet,beraten,verkauft,akquiriert,präsentiert,automatisiert,migriert,standardisiert,etabliert,überwacht,abgeschlossen,leitung,führung,steuerung,steigerung,senkung,reduzierung,entwicklung,einführung,aufbau,koordination,umsetzung,optimierung,planung,betreuung,schulung,durchführung,erstellung,konzeption,beratung,akquise,verhandlung,implementierung'.split(','),
    weak: ['zuständig für','mitarbeit bei','unterstützung bei','mithilfe bei','aufgaben waren','zu meinen aufgaben','teamfähig','teamplayer','belastbar','flexibel','zuverlässig','motiviert','kommunikationsstark','ehrgeizig','engagiert','dynamisch','leidenschaftlich','referenzen auf anfrage','sehr geehrte'],
    personal: [['date of birth',/\b(geburtsdatum|geboren am|geb\.)/i],['age',/\balter\s*:\s*\d/i],['marital status',/\b(familienstand|verheiratet|ledig|geschieden)\b/i],['nationality',/\b(staatsangehörigkeit|nationalität)\b/i],['religion',/\b(religion|konfession)\b/i],['gender',/\bgeschlecht\s*:/i],['passport number',/\b(passnummer|reisepassnummer)\b/i]],
    sections: [
      ['profile', /^\s*(profil|kurzprofil|berufsprofil|über mich|zusammenfassung|persönliches profil)\b/im],
      ['experience', /^\s*(berufserfahrung|beruflicher werdegang|berufliche erfahrung|berufspraxis|werdegang|praktische erfahrung|praktika)\b/im],
      ['education', /^\s*(ausbildung|bildungsweg|bildung|schulbildung|studium|aus- und weiterbildung|weiterbildung|qualifikationen)\b/im],
      ['skills', /^\s*(kenntnisse|fähigkeiten|kompetenzen|fachkenntnisse|edv-kenntnisse|it-kenntnisse|sprachkenntnisse|besondere kenntnisse|skills)\b/im]
    ],
    units: /\b\d+\s?(tsd|mio|mitarbeiter(innen)?|kunden|projekte|filialen|standorte|patienten|betten|nutzer|mitglieder|teams?)\b/i,
    present: /\b(heute|aktuell|derzeit|seit)\b/i,
    pronouns: /(^|[\s.,;(])(ich|mich|mir|mein|meine|meinen|meinem|meiner)(?=[\s.,;)'])/gi,
    stop: 'der,die,das,den,dem,des,ein,eine,einen,einem,einer,eines,und,oder,aber,wenn,von,zu,zur,zum,im,in,an,am,auf,für,mit,bei,aus,als,ist,sind,war,waren,wird,werden,wurde,sein,haben,hat,hatte,kann,können,soll,sollen,muss,müssen,sie,ihr,ihre,ihren,ihrem,wir,uns,unser,unsere,unseren,unserem,es,sich,dies,diese,dieser,dieses,wer,was,wie,wo,alle,jede,jeder,mehr,nicht,nur,auch,sehr,so,um,über,unter,nach,vor,durch,gegen,ohne,bis,ab,bzw,sowie,sowohl,zwischen,innerhalb,bereich,bereichen,aufgaben,aufgabe,profil,stelle,position,unternehmen,team,teams,arbeit,arbeiten,bewerbung,bewerben,gehalt,vollzeit,teilzeit,unbefristet,befristet,standort,homeoffice,remote,hybrid,benefits,urlaub,erfahrung,erfahrungen,kenntnisse,fähigkeiten,gute,guten,sehr,idealerweise,wünschenswert,erforderlich,abgeschlossene,abgeschlossenes,mindestens,jahre,jahren,neue,neuen,wir,bieten,bietet,freuen,ihre,ihr,m/w/d,w/m/d,m,w,d,gmbh,ag,heute,jetzt,online,senden,bitte,du,dein,deine,dich,dir,euch'.split(',')
  };
  function isGerman(t){
    var w = t.toLowerCase().match(/[a-zäöüß]+/g) || [], de = 0, en = 0;
    w.forEach(function(x){ if (/^(und|der|die|das|mit|für|bei|von|im|auf|zur|zum|sowie|bis|seit|heute|des|eine|einer|einem)$/.test(x)) de++; else if (/^(and|the|with|for|of|to|in|on|at|from|by|an|present)$/.test(x)) en++; });
    return de > 8 && de > en;
  }

  /* Spanish CVs (currículum): own verbs, headings, clichés and stop words. Picked from the CV text, not the page. */
  var ES_RULES = {
    verbs: 'dirigí,lideré,gestioné,coordiné,organicé,aumenté,incrementé,reduje,disminuí,desarrollé,implanté,implementé,creé,diseñé,lancé,negocié,formé,capacité,supervisé,optimicé,mejoré,logré,conseguí,alcancé,planifiqué,analicé,vendí,atendí,asesoré,elaboré,automaticé,migré,estandaricé,establecí,amplié,impulsé,dirigió,lideró,gestionó,coordinó,dirección,liderazgo,coordinación,implantación,implementación,negociación,supervisión,optimización,planificación,elaboración,lanzamiento,aumento,reducción,captación,puesta en marcha'.split(','),
    weak: ['responsable de la','responsable del','responsable de las','responsable de los','ayudar en','apoyo en','colaboración en','mis funciones','entre mis funciones','funciones:','trabajo en equipo','proactivo','proactiva','dinámico','dinámica','motivado','motivada','comprometido','comprometida','apasionado','apasionada','con ganas de aprender','capacidad de trabajo bajo presión','referencias a petición','referencias disponibles','estimado'],
    personal: [['date of birth',/(fecha de nacimiento|nacid[oa] el)/i],['age',/\bedad\s*:?\s*\d/i],['marital status',/(estado civil|\bcasad[oa]\b|\bsolter[oa]\b|\bdivorciad[oa]\b)/i],['nationality',/\bnacionalidad\b/i],['religion',/religi[oó]n/i],['gender',/(\bsexo\s*:|g[eé]nero\s*:)/i],['passport number',/(pasaporte|\bdni\b|\bnie\b)/i]],
    sections: [
      ['profile', /^\s*(perfil profesional|perfil|resumen profesional|resumen|sobre mí|objetivo profesional|objetivo|extracto)(?![a-zñáéíóú])/im],
      ['experience', /^\s*(experiencia profesional|experiencia laboral|experiencia|trayectoria profesional|historial laboral|prácticas)(?![a-zñáéíóú])/im],
      ['education', /^\s*(formación académica|formación|educación|estudios|titulación|titulaciones)(?![a-zñáéíóú])/im],
      ['skills', /^\s*(habilidades|competencias|aptitudes|conocimientos|conocimientos informáticos|idiomas|skills)(?![a-zñáéíóú])/im]
    ],
    units: /\b\d+\s?(mil|millones|empleados|personas|clientes|proyectos|tiendas|sedes|pacientes|camas|usuarios|socios|equipos?)\b/i,
    present: /\b(actualidad|actualmente|presente|hoy)\b|a la fecha/i,
    pronouns: /(^|[\s.,;(])(yo|me|mi|mis|conmigo)(?=[\s.,;)'])/gi,
    stop: 'el,la,los,las,lo,un,una,unos,unas,y,e,o,u,pero,si,de,del,a,al,en,con,para,por,sin,sobre,entre,hasta,desde,hacia,como,que,qué,es,son,era,eran,ser,será,está,están,estar,ha,han,haber,hay,tiene,tienen,tener,puede,pueden,debe,deben,se,su,sus,tu,tus,te,ti,nos,nuestro,nuestra,nuestros,nuestras,este,esta,estos,estas,ese,esa,eso,quien,cual,cuál,donde,dónde,cuando,cómo,todo,todos,toda,todas,cada,más,menos,muy,no,solo,sólo,también,ya,otro,otra,otros,otras,mismo,así,empresa,equipo,equipos,puesto,puestos,trabajo,trabajar,oferta,ofrecemos,buscamos,candidato,candidata,candidatos,perfil,funciones,requisitos,requisito,experiencia,conocimientos,valorable,imprescindible,mínimo,años,año,meses,jornada,completa,parcial,contrato,indefinido,temporal,salario,sueldo,bruto,anual,horario,incorporación,inmediata,ubicación,teletrabajo,remoto,híbrido,presencial,beneficios,vacaciones,desarrollo,buen,buena,buenas,buenos,alto,alta,nivel,capacidad,persona,personas,área,sector,proceso,selección,inscríbete,enviar,envía,cv,currículum,gracias,usted,ustedes,s.l,s.a,etc'.split(',')
  };
  function isSpanish(t){
    var w = t.toLowerCase().match(/[a-zñáéíóúü]+/g) || [], es = 0, en = 0;
    w.forEach(function(x){ if (/^(y|el|la|los|las|del|en|con|para|por|una|desde|hasta|actualidad|actualmente|que|más|año|años)$/.test(x)) es++; else if (/^(and|the|with|for|of|to|in|on|at|from|by|an|present)$/.test(x)) en++; });
    return es > 8 && es > en;
  }

  /* French CVs: own verbs, headings, clichés and stop words. Picked from the CV text, not the page. */
  var FR_RULES = {
    verbs: 'piloté,dirigé,géré,encadré,managé,coordonné,organisé,augmenté,accru,réduit,diminué,développé,créé,conçu,lancé,négocié,formé,supervisé,optimisé,amélioré,atteint,dépassé,réalisé,planifié,analysé,vendu,conseillé,élaboré,automatisé,déployé,instauré,fidélisé,recruté,restructuré,mis en place,mis en œuvre,piloter,diriger,gérer,encadrer,coordonner,développer,négocier,pilotage,encadrement,coordination,mise en place,mise en œuvre,négociation,supervision,optimisation,planification,élaboration,lancement,augmentation,réduction,déploiement,création,conception,refonte,recrutement'.split(','),
    weak: ['en charge de','en charge du','en charge des','chargé de la','chargé du','chargée de la','chargée du','participation à','participation au','aide à la','aide au','assistance à','mes missions','mes tâches','missions principales','esprit d\'équipe','travail en équipe','dynamique','motivé','motivée','polyvalent','polyvalente','rigoureux','rigoureuse','passionné','passionnée','sérieux','sérieuse','force de proposition','capacité d\'adaptation','références sur demande','références disponibles','madame, monsieur'],
    personal: [['date of birth',/(date de naissance|né le|née le|né\(e\) le)/i],['age',/(^|[^a-z])âge\s*:?\s*\d|\b\d{2}\s?ans\b(?!\s*d)/i],['marital status',/(situation familiale|situation de famille|\bmarié(e)?\b|\bcélibataire\b|\bdivorcé(e)?\b|\bpacsé(e)?\b)/i],['nationality',/nationalité/i],['religion',/\breligion\b/i],['gender',/(\bsexe\s*:|\bgenre\s*:)/i],['passport number',/(passeport|sécurité sociale|\bn° ss\b)/i]],
    sections: [
      ['profile', /^\s*(profil professionnel|profil|résumé|à propos|objectif professionnel|objectif|présentation)(?![a-zäöüßñáéíóúàâçèêëîïôûùÿœ])/im],
      ['experience', /^\s*(expériences? professionnelles?|expériences?|parcours professionnel|historique professionnel|stages?)(?![a-zäöüßñáéíóúàâçèêëîïôûùÿœ])/im],
      ['education', /^\s*(formations?|diplômes?|études|cursus|scolarité)(?![a-zäöüßñáéíóúàâçèêëîïôûùÿœ])/im],
      ['skills', /^\s*(compétences( techniques| clés)?|savoir-faire|aptitudes|connaissances|informatique|langues|skills)(?![a-zäöüßñáéíóúàâçèêëîïôûùÿœ])/im]
    ],
    units: /\b\d+\s?(k€|m€|millions?|salariés|personnes|collaborateurs|clients|projets|magasins|boutiques|agences|sites|patients|lits|utilisateurs|membres|adhérents|équipes?)\b/i,
    present: /\b(aujourd.hui|actuellement|en cours|présent)\b|à ce jour/i,
    pronouns: /(^|[\s.,;(])(je|moi|mon|ma|mes)(?=[\s.,;)'])|(^|[\s.,;(])j['’](?=[a-zàâéèêîôû])/gi,
    stop: 'le,la,les,l,un,une,des,du,de,d,et,ou,mais,si,à,au,aux,en,dans,sur,sous,avec,pour,par,sans,chez,entre,jusqu,depuis,vers,comme,que,qu,qui,quoi,est,sont,était,être,sera,a,ont,avoir,il,elle,ils,elles,on,se,sa,son,ses,leur,leurs,vous,votre,vos,nous,notre,nos,ce,cet,cette,ces,dont,où,quand,comment,tout,tous,toute,toutes,chaque,plus,moins,très,ne,pas,non,seulement,aussi,déjà,autre,autres,même,ainsi,entreprise,société,équipe,équipes,poste,postes,travail,travailler,offre,offres,proposons,recherchons,recherche,candidat,candidate,candidats,profil,missions,mission,requis,expérience,expériences,connaissances,compétences,souhaitée,souhaité,apprécié,appréciée,indispensable,minimum,ans,an,année,années,mois,temps,plein,partiel,contrat,cdi,cdd,intérim,salaire,brut,annuel,rémunération,horaires,prise,immédiate,lieu,télétravail,hybride,avantages,congés,tickets,restaurant,mutuelle,bon,bonne,bonnes,bons,haut,haute,niveau,capacité,personne,personnes,domaine,secteur,processus,recrutement,postuler,postulez,envoyer,envoyez,cv,merci,h/f,f/h,sas,sarl,sa,etc'.split(',')
  };
  function isFrench(t){
    var w = t.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿœ]+/g) || [], fr = 0, en = 0;
    w.forEach(function(x){ if (/^(et|le|les|des|du|avec|pour|une|depuis|chez|dans|au|aux|sur|aujourd|actuellement|ans)$/.test(x)) fr++; else if (/^(and|the|with|for|of|to|in|on|at|from|by|an|present)$/.test(x)) en++; });
    return fr > 8 && fr > en;
  }
  function cvLang(t){ return isGerman(t) ? 'de' : isFrench(t) ? 'fr' : isSpanish(t) ? 'es' : ''; }
  var RULES = {de: DE_RULES, es: ES_RULES, fr: FR_RULES};
  function words(t){ return (t.toLowerCase().match(/[a-zäöüßñáéíóúàâçèêëîïôûùÿœ][a-zäöüßñáéíóúàâçèêëîïôûùÿœ+#.\-']*[a-zäöüßñáéíóúàâçèêëîïôûùÿœ+#]|[a-zäöüßñáéíóúàâçèêëîïôûùÿœ]/g) || []); }
  function count(re, t){ var m = t.match(re); return m ? m.length : 0; }

  function check(cv){
    var CL = cvLang(cv), G = CL ? RULES[CL] : null;
    var VERBS_ = G ? G.verbs : VERBS, WEAK_ = G ? G.weak : WEAK, PERSONAL_ = G ? G.personal : PERSONAL, SECTIONS_ = G ? G.sections : SECTIONS;
    var low = cv.toLowerCase(), lines = cv.split(/\n/).map(function(l){ return l.trim(); }).filter(Boolean);
    var wc = (cv.match(/\S+/g) || []).length, res = [], score = 0;
    function add(key, pts, max, status, detail){ score += pts; res.push({k:key, pts:pts, max:max, s:status, d:detail || ''}); }

    // 1. Contact details (15)
    var email = /[\w.+\-]+@[\w\-]+\.[\w.\-]+/.test(cv), phone = /(\+?\d[\d\s\-().]{8,}\d)/.test(cv), li = /linkedin\.com\/|xing\.com\//i.test(cv);
    var c = (email ? 7 : 0) + (phone ? 6 : 0) + (li ? 2 : 0), miss = [];
    if (!email) miss.push(T.w_email); if (!phone) miss.push(T.w_phone); if (!li) miss.push('LinkedIn');
    add('contact', c, 15, c >= 13 ? 'ok' : (c >= 7 ? 'warn' : 'bad'), miss.length ? T.missing + ' ' + miss.join(', ') : '');

    // 2. Length (10)
    var pages = +cvBox.dataset.pages || 0, lp = 0, ls;
    if (wc >= (G ? 250 : 350) && wc <= 900 && (!pages || pages <= 2)) { lp = 10; ls = 'ok'; }
    else if (wc >= (G ? 150 : 200) && wc <= 1200 && (!pages || pages <= 3)) { lp = 5; ls = 'warn'; }
    else { lp = 0; ls = 'bad'; }
    add('length', lp, 10, ls, T.wordsN.replace('{n}', wc) + (pages ? ' · ' + T.pagesN.replace('{n}', pages) : ''));

    // 3. Sections (20)
    var have = [], lack = [];
    SECTIONS_.forEach(function(s){ (s[1].test(cv) ? have : lack).push(T['sec_' + s[0]]); });
    var sp = have.length * 5;
    add('sections', sp, 20, sp === 20 ? 'ok' : (sp >= 10 ? 'warn' : 'bad'), lack.length ? T.missing + ' ' + lack.join(', ') : '');

    // 4. Measurable results (15)
    var nums = 0;
    lines.forEach(function(l){
      if (/\b(19|20)\d{2}\b/.test(l) && !/[%£$€]|\b\d+\s?(k|m|people|staff|clients|customers|users|projects|sites|stores|patients|beds|members)\b/i.test(l) && !(G && G.units.test(l))) return;
      if (/\d/.test(l) && /[%£$€]|\b\d+(\.\d+)?\s?(k|m|x)?\b/i.test(l)) nums++;
    });
    var np = nums >= 6 ? 15 : nums >= 3 ? 9 : nums >= 1 ? 4 : 0;
    add('numbers', np, 15, np === 15 ? 'ok' : (np >= 9 ? 'warn' : 'bad'), T.foundN.replace('{n}', nums));

    // 5. Action verbs (10)
    var vset = {}, vc = 0;
    VERBS_.forEach(function(v){ var n = count(new RegExp('(^|[^a-zäöüßñáéíóúàâçèêëîïôûùÿœ])' + v.replace(/ /g, '\\s') + '(?![a-zäöüßñáéíóúàâçèêëîïôûùÿœ])', 'gi'), cv); if (n){ vc += n; vset[v] = 1; } });
    var vk = Object.keys(vset).length, vp = vk >= 8 ? 10 : vk >= 4 ? 6 : vk >= 1 ? 2 : 0;
    add('verbs', vp, 10, vp === 10 ? 'ok' : (vp >= 6 ? 'warn' : 'bad'), T.foundN.replace('{n}', vk) + (vk ? ': ' + Object.keys(vset).slice(0, 8).join(', ') : ''));

    // 6. Clichés and weak phrases (10)
    var weak = WEAK_.filter(function(w){ return low.indexOf(w) > -1; });
    weak = weak.filter(function(w){ return !weak.some(function(o){ return o !== w && o.indexOf(w) > -1; }); });
    var wp = Math.max(0, 10 - weak.length * 3);
    add('weak', wp, 10, weak.length === 0 ? 'ok' : (wp >= 4 ? 'warn' : 'bad'), weak.length ? T.found + ' "' + weak.slice(0, 5).join('", "') + '"' : '');

    // 7. Personal pronouns (5)
    var pr = count(G ? G.pronouns : /(^|[\s.,;(])(i|me|my|myself)(?=[\s.,;)'])/gi, cv);
    var pp = pr <= 2 ? 5 : pr <= 6 ? 2 : 0;
    add('pronouns', pp, 5, pp === 5 ? 'ok' : (pp ? 'warn' : 'bad'), T.foundN.replace('{n}', pr));

    // 8. Personal details employers don't need (5)
    var pers = PERSONAL_.filter(function(p){ return p[1].test(cv); }).map(function(p){ return T['p_' + p[0].replace(/ /g, '_')] || p[0]; });
    var ppts = pers.length === 0 ? 5 : G ? 3 : pers.length === 1 ? 2 : 0;
    add('personal', ppts, 5, ppts === 5 ? 'ok' : (ppts ? 'warn' : 'bad'), pers.length ? T.found + ' ' + pers.join(', ') : '');

    // 9. Dates on roles (5)
    var years = count(/\b(19[89]\d|20[0-3]\d)\b/g, cv), present = /\b(present|current|now|to date)\b/i.test(cv) || !!(G && G.present.test(cv));
    var dp = years >= 3 ? 5 : years >= 1 ? 2 : 0;
    add('dates', dp, 5, dp === 5 ? 'ok' : (dp ? 'warn' : 'bad'), T.foundN.replace('{n}', years) + (present ? ' · ' + T.presentOk : ''));

    // 10. Readability: long paragraphs (5)
    var longL = lines.filter(function(l){ return (l.match(/\S+/g) || []).length > 45; }).length;
    var bullets = lines.filter(function(l){ return /^[•\-–*·▪●◦]/.test(l); }).length;
    var rp = longL === 0 ? 5 : longL <= 2 ? 3 : 0;
    add('read', rp, 5, rp === 5 ? 'ok' : (rp ? 'warn' : 'bad'), T.longN.replace('{n}', longL) + ' · ' + T.bulletsN.replace('{n}', bullets));

    return {score: Math.round(score), items: res, wc: wc, de: CL === 'de', cvlang: CL};
  }

  function jobMatch(cv, job){
    var SS = STOPSET;
    var JL = cvLang(job);
    if (JL) { SS = {}; STOP.concat(RULES[JL].stop).forEach(function(w){ SS[w] = 1; }); }
    var STOPSET_ = SS;
    var jw = words(job), freq = {}, cvLow = ' ' + words(cv).join(' ') + ' ';
    jw.forEach(function(w){ w = w.replace(/[.']+$/, ''); if (w.length < 3 || STOPSET_[w] || /^\d/.test(w)) return; freq[w] = (freq[w] || 0) + 1; });
    for (var i = 0; i < jw.length - 1; i++){
      var a = jw[i], b = jw[i + 1];
      if (STOPSET_[a] || STOPSET_[b] || a.length < 3 || b.length < 3) continue;
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
    else if (T.germanCv && isGerman(cv)) { fileMsg.textContent = T.germanCv; }
    else if (T.frenchCv && cvLang(cv) === 'fr') { fileMsg.textContent = T.frenchCv; }
    else if (T.spanishCv && cvLang(cv) === 'es') { fileMsg.textContent = T.spanishCv; }
    var r = check(cv), job = jobBox.value.trim(), m = job.length > 80 ? jobMatch(cv, job) : null;
    var band = r.score >= 80 ? 'good' : r.score >= 60 ? 'mid' : 'low';
    var h = '<div class="res-top ' + band + '"><div class="ring" style="--p:' + r.score + '"><b>' + r.score + '</b><small>/100</small></div><div><h3>' + T['band_' + band] + '</h3><p>' + T['bandTxt_' + band] + '</p></div></div>';
    h += '<ul class="checks">';
    r.items.slice().sort(function(a, b){ return (a.pts / a.max) - (b.pts / b.max); }).forEach(function(it){
      h += '<li class="' + it.s + '">' + icon(it.s) + '<div><b>' + T['t_' + it.k] + ' <span class="pts">' + it.pts + '/' + it.max + '</span></b>' +
           (it.d ? '<small class="det">' + esc(it.d) + '</small>' : '') + (it.s !== 'ok' ? '<p>' + ((r.cvlang && T[r.cvlang + 'tip_' + it.k]) || T['tip_' + it.k]) + '</p>' : '') + '</div></li>';
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
    if (window.grConsent && grConsent.track) grConsent.track('cv_check', {score: r.score, job_match: m ? m.pct : -1, lang: AR ? 'ar' : (DEP ? 'de' : ESP ? 'es' : FRP ? 'fr' : 'en'), cv_lang: r.cvlang || 'other'});
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({path: 'cv-check-done' + (AR ? '-ar' : DEP ? '-de' : ESP ? '-es' : FRP ? '-fr' : ''), title: 'CV check done', event: true}); } catch (x) {}
  });
  out.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-cta]');
    if (!a) return;
    if (window.grConsent && grConsent.track) grConsent.track('cv_check_cta', {target: a.getAttribute('data-cta')});
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({path: 'cv-check-cta-' + a.getAttribute('data-cta'), title: 'CV check CTA', event: true}); } catch (x) {}
  });
  $('sampleBtn') && $('sampleBtn').addEventListener('click', function(){ cvBox.value = T.sample; delete cvBox.dataset.pages; fileMsg.textContent = ''; });
})();
