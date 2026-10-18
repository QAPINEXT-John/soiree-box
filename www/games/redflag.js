/* Red Flag — red, beige ou green flag ? Et jusqu'où tu restes avec ton date ? */
(function(){
"use strict";
const { esc, A, screen, txt, store, persist, dock, buzz } = SB.u;

const FLAGS = [
  "Ton date répond « mdr » à tout","Ton date a quatre chats","Ton date n'a jamais quitté sa ville natale","Ton date like encore les photos de son ex",
  "Ton date met du ketchup sur les pâtes","Ton date dit « on » quand il parle de lui et sa mère","Ton date a encore son ex en fond d'écran",
  "Ton date te fait une déclaration au bout de deux jours","Ton date ne boit jamais d'alcool","Ton date est à fond dans l'astrologie","Ton date n'aime pas les animaux",
  "Ton date te présente à ses parents au deuxième rendez-vous","Ton date est toujours en retard","Ton date partage son compte Netflix avec son ex",
  "Ton date poste toute sa vie sur Instagram","Ton date n'a aucun réseau social","Ton date tient un journal intime","Ton date mange la bouche ouverte",
  "Ton date est encore très proche de son ex","Ton date a le prénom de son ex tatoué","Ton date pleure devant les films Disney","Ton date dort avec un doudou",
  "Ton date ne s'excuse jamais","Ton date est jaloux de ton chat","Ton date calcule l'addition au centime près","Ton date t'offre des fleurs sans raison",
  "Ton date se souvient de tout ce que tu lui racontes","Ton date t'envoie des vocaux de 8 minutes","Ton date vit en colocation à 35 ans","Ton date vit chez ses parents à 30 ans",
  "Ton date ne parle que de cryptomonnaie","Ton date parle de son ex au premier rendez-vous","Ton date est resté ami avec tous ses ex","Ton date va à la salle à 5 h du matin",
  "Ton date n'a jamais lu un livre","Ton date dit « je t'aime » en premier","Ton date déteste tes amis","Ton date est adorable avec les serveurs",
  "Ton date est désagréable avec les serveurs","Ton date ronfle comme un tracteur","Ton date lit tes messages par-dessus ton épaule","Ton date a 100 000 abonnés sur TikTok",
  "Ton date veut six enfants","Ton date ne veut pas d'enfant","Ton date n'a pas de lit, juste un matelas par terre","Ton date joue aux jeux vidéo toute la nuit",
  "Ton date cuisine comme un chef","Ton date tient toujours ses promesses","Ton date te demande ton signe astro avant ton prénom","Ton date dit que son ex était « folle »",
  "Ton date a peur des chiens","Ton date s'excuse auprès des meubles quand il se cogne","Ton date te bloque après chaque dispute","Ton date répond à tes messages en trois secondes",
  "Ton date met trois jours à répondre","Ton date rit à ses propres blagues","Ton date ne sait pas faire cuire des pâtes","Ton date garde tous les tickets de caisse",
  "Ton date appelle sa mère trois fois par jour","Ton date a un plan de carrière sur 20 ans","Ton date change de passion toutes les semaines","Ton date ne quitte jamais ses lunettes de soleil",
  "Ton date parle en citations de films","Ton date te prépare le petit-déjeuner au lit","Ton date fait des listes pour tout","Ton date n'a jamais d'argent sur lui",
  "Ton date te demande l'autorisation avant de t'embrasser","Ton date connaît par cœur toutes les chansons de Disney","Ton date regarde ses mails pendant le dîner",
  "Ton date est végétarien et te le rappelle à chaque repas","Ton date commente tes stories en moins d'une minute","Ton date veut un chien dès le premier mois",
  "Ton date applaudit quand l'avion atterrit","Ton date a donné un surnom à sa voiture","Ton date connaît le prénom de tous ses voisins","Ton date ne regarde jamais un film jusqu'au bout",
  "Ton date lit la fin des livres en premier","Ton date photographie chaque plat au restaurant","Ton date commande toujours exactement la même chose","Ton date mange la pizza avec un couteau et une fourchette",
  "Ton date fait sonner son réveil dix fois avant de se lever","Ton date ne sait pas nager","Ton date a créé un compte dédié à son animal","Ton date parle à ses plantes",
  "Ton date garde les étiquettes sur ses vêtements au cas où","Ton date n'a jamais vu la mer","Ton date a déjà choisi le prénom de vos futurs enfants","Ton date veut emménager avec toi au bout d'un mois",
  "Ton date t'envoie des articles avec ses commentaires surlignés","Ton date parle de lui à la troisième personne","Ton date refuse de partager ses frites","Ton date te laisse toujours la dernière part",
  "Ton date fait du karaoké seul dans sa voiture","Ton date collectionne des figurines et interdit qu'on les touche","Ton date paie la salle de sport mais n'y va jamais","Ton date est en procès avec ses voisins",
  "Ton date prend toujours la défense de son ex","Ton date note chaque restaurant sur 5 en sortant","Ton date t'appelle par ton nom de famille","Ton date fête chaque mois de votre rencontre",
  "Ton date demande l'avis de sa bande d'amis avant chaque décision","Ton date tient un tableur de toutes ses dépenses","Ton date donne un prénom à chacun de ses objets","Ton date dort en chaussettes en plein été",
  "Ton date n'a d'avis sur rien","Ton date a un avis sur absolument tout","Ton date poste une citation inspirante tous les matins","Ton date te glisse des petits mots dans les poches",
  "Ton date te demande ton avis avant de commander","Ton date divise l'addition sur une appli devant toi","Ton date fait un escape game chaque week-end","Ton date parle cinq langues mais ne répond à aucun message",
  "Ton date t'interdit de manger dans sa voiture","Ton date veut adopter un serpent","Ton date déteste le fromage","Ton date se lève à 4 h pour méditer",
  "Ton date garde sa veste au restaurant, prêt à partir","Ton date relit ses messages à voix haute avant de les envoyer"
];
const ADULTE = [
  "Ton date propose un plan à trois au deuxième rendez-vous","Ton date garde ses chaussettes pendant l'acte","Ton date a gardé les nudes de tous ses ex",
  "Ton date tient un tableur de ses partenaires","Ton date te demande ton nombre de partenaires au premier verre","Ton date simule, et tu le sais",
  "Ton date parle de son ex pendant l'acte","Ton date veut tout filmer","Ton date est abonné à quinze comptes OnlyFans","Ton date a un compte OnlyFans",
  "Ton date propose un club libertin pour ton anniversaire","Ton date crie le prénom de son ex","Ton date fait l'amour sur l'hymne national",
  "Ton date dit « merci » après l'amour","Ton date s'endort pendant les préliminaires","Ton date a des menottes dans la boîte à gants","Ton date n'embrasse jamais",
  "Ton date a couché avec ton meilleur pote avant toi","Ton date fait du dirty talk avec une voix de dessin animé","Ton date veut le faire trois fois par jour",
  "Ton date ne veut le faire que le samedi soir","Ton date a un fétiche des pieds","Ton date te met une note sur 10 après","Ton date a déjà tourné un porno amateur",
  "Ton date est encore sur Tinder « juste pour voir »","Ton date garde une photo de son ex dans son portefeuille","Ton date like les photos de ta mère",
  "Ton date veut un dernier plan cul avec son ex « pour tourner la page »","Ton date fait l'amour avec ses lunettes de soleil","Ton date dort tout nu chez ses parents",
  "Ton date veut faire l'amour dans la voiture de ton père","Ton date a déjà fait un plan à trois avec ses colocs","Ton date te demande un nude dès le premier soir",
  "Ton date veut écrire votre première fois dans un livre","Ton date a son propre lubrifiant dans son sac de sport",
  "Ton date veut un mot de sécurité même pour aller au cinéma","Ton date fait l'amour avec les infos en fond sonore","Ton date garde son téléphone à la main pendant l'acte",
  "Ton date te demande une note détaillée, par écrit","Ton date tient un calendrier de vos rapports accroché au frigo","Ton date ne veut le faire que dans le noir complet",
  "Ton date rêve d'un miroir au plafond","Ton date parle de sa mère juste après l'amour","Ton date range ses jouets coquins par couleur","Ton date veut inviter ses colocs à regarder",
  "Ton date s'excuse à chaque mouvement","Ton date lance une playlist de quatre heures « au cas où »","Ton date veut le faire dans une cabine d'essayage","Ton date exige un débrief complet le lendemain",
  "Ton date garde ses chaussures au lit","Ton date commente l'acte comme un match de foot","Ton date a des draps à l'effigie d'un dessin animé","Ton date veut te présenter à son ex « pour comparer »",
  "Ton date est actif sur trois applis de rencontre en même temps","Ton date veut que tu l'appelles « chef » au lit","Ton date s'endort dans la seconde, à chaque fois","Ton date veut toujours le faire juste avant un repas de famille"
];
const PERKS = [
  "est beau ou belle à tomber","est riche à millions","est drôle comme personne","cuisine comme un grand chef","te masse tous les soirs","a une maison avec piscine",
  "est fou amoureux de toi","t'offre un voyage par mois","est une star de cinéma","s'entend à merveille avec tes parents","adore tes amis","fait le ménage sans qu'on lui demande",
  "a le même humour que toi","te fait rire aux larmes tous les jours","est le meilleur coup de ta vie","est médecin, pompier et chanteur","sent toujours incroyablement bon",
  "te prépare des surprises chaque semaine","a un chien adorable","a une voix à tomber",
  "parle six langues","a son propre bateau","est champion du monde de quelque chose","te fait des crêpes tous les dimanches","joue de la guitare comme personne",
  "t'écrit des poèmes","est toujours de bonne humeur","a un chalet à la montagne","sait tout réparer","a un sourire qui fait fondre tout le monde",
  "te soutient dans tous tes projets","connaît les meilleures tables de la ville","danse divinement bien","se souvient de tout ce qui compte pour toi"
];
function flagsFor(packs){ const sel = A(packs); return (sel.indexOf("classique") >= 0 || !sel.length ? FLAGS : []).concat(sel.indexOf("adulte") >= 0 ? ADULTE : []); }
const PACKS = [
  { v: "classique", label: "Classique", desc: "Les petites manies et les vrais défauts", count: FLAGS.length },
  { v: "adulte", label: "Adultes", desc: "Sexe, porno, tabous : tout le contenu adulte", count: ADULTE.length, hot: true }
];
const KIND = { r: ["Red flag", "#d93025"], b: ["Beige flag", "#c8a36a"], g: ["Green flag", "#1e8e3e"] };

/* ---------- Rejouabilité : coups de théâtre ---------- */
const TW_V = [
  { id: "deal", name: "Deal breaker", desc: "Un seul red flag suffit : si quelqu'un vote rouge, c'est rouge, et seuls les rouges marquent." },
  { id: "double", name: "Double flag", desc: "Deux défauts d'un coup : on juge le combo." },
  { id: "perk", name: "Perk empoisonné", desc: "Le défaut arrive avec une qualité de rêve. Ça change tout ?" },
  { id: "minor", name: "Minorité gagnante", desc: "Cette fois, ce sont les votes les plus rares qui marquent." },
  { id: "gold", name: "Flag en or", desc: "Points doublés sur cette manche." },
  { id: "blind", name: "Vote à l'aveugle", desc: "On ne saura pas qui a voté quoi, seulement les pourcentages." },
  { id: "nobeige", name: "Pas de beige", desc: "Interdit de botter en touche : red ou green, c'est tout." }
];
const TW_D = [
  { id: "express", name: "Date express", desc: "Seulement 3 red flags : décide vite." },
  { id: "long", name: "Le date de trop", desc: "7 red flags au lieu de 5. Accroche-toi." },
  { id: "dream", name: "Date de rêve", desc: "Deux qualités au lieu d'une : partir sera plus dur." },
  { id: "crush", name: "Coup de foudre", desc: "Impossible de partir au premier red flag." },
  { id: "last", name: "Dernier debout", desc: "Ceux qui tiennent jusqu'au bout gagnent 3 points bonus." },
  { id: "gold", name: "Date en or", desc: "Chaque red flag encaissé compte double." },
  { id: "blind", name: "Fuite discrète", desc: "On ne découvre qui est parti qu'à la fin du date." }
];
const KF = "redflag:flags", KP = "redflag:perks";
const twOf = (list, id) => SB.u.byTwist(list, id && id !== "-" ? id : "");
function pickTw(list, on, round, last){ if(!on || round < 2) return "-"; const t = SB.u.twist(list, { rate: .35, last: last && last !== "-" ? last : "" }); return t ? t.id : "-"; }
// Tire un élément d'un paquet anti-répétition (D[k] est modifié).
function pull(D, k, src, key){ let d = A(D[k]).slice(); if(!d.length) d = SB.u.fresh(key, src()); const x = d.pop(); D[k] = d; SB.u.saw(key, x); return x; }
function voteRound(D, packs, tw){
  const o = { f: pull(D, "deck", () => flagsFor(packs), KF), tw: tw || "-", f2: "", pk: "" };
  if(tw === "double"){ o.f2 = pull(D, "deck", () => flagsFor(packs), KF); if(o.f2 === o.f) o.f2 = pull(D, "deck", () => flagsFor(packs), KF); }
  if(tw === "perk") o.pk = pull(D, "perks", () => PERKS, KP);
  return o;
}
function dateRound(D, packs, tw){
  const nf = tw === "express" ? 3 : tw === "long" ? 7 : 5, flags = [];
  for(let i = 0; i < nf; i++) flags.push(pull(D, "deck", () => flagsFor(packs), KF));
  let perk = pull(D, "perks", () => PERKS, KP);
  if(tw === "dream"){ const p2 = pull(D, "perks", () => PERKS, KP); if(p2 !== perk) perk += " et " + p2; }
  return { flags, perk, tw: tw || "-" };
}
// Catégories qui marquent sur une manche (votes = une lettre par joueur, « - » si pas de vote).
function scorers(v, tw){
  const c = { r: 0, b: 0, g: 0 }; String(v).split("").forEach(x => { if(c[x] != null) c[x]++; });
  const ks = ["r", "b", "g"].filter(k => c[k]);
  if(!ks.length) return [];
  if(tw === "deal" && c.r) return ["r"];
  if(tw === "minor"){ if(ks.length < 2) return []; const m = Math.min.apply(null, ks.map(k => c[k])); return ks.filter(k => c[k] === m); }
  const m = Math.max.apply(null, ks.map(k => c[k])); return ks.filter(k => c[k] === m);
}
function verdict(v, tw){
  const c = k => String(v).split("").filter(x => x === k).length;
  if(tw === "deal" && c("r")) return "r";
  const srt = ["r", "b", "g"].sort((a, b) => c(b) - c(a));
  return c(srt[0]) === c(srt[1]) ? "" : srt[0];
}
// Statistiques de fin du mode vote : points, rouges, verts, rebelles, duo.
function voteStats(n, hist, th){
  const pts = {}, red = {}, green = {}, reb = {};
  hist.forEach((h, r) => {
    const tw = String(A(th)[r] || "-"), win = scorers(h, tw), mult = tw === "gold" ? 2 : 1;
    const c = { r: 0, b: 0, g: 0 }; h.split("").forEach(x => { if(c[x] != null) c[x]++; });
    const top = Math.max(c.r, c.b, c.g);
    for(let i = 0; i < n; i++){
      const x = h[i]; if(!c[x]) continue;
      if(x === "r") red[i] = (red[i] || 0) + 1; if(x === "g") green[i] = (green[i] || 0) + 1;
      if(win.indexOf(x) >= 0) pts[i] = (pts[i] || 0) + mult;
      if(c[x] < top) reb[i] = (reb[i] || 0) + 1;
    }
  });
  let duo = null, best = -1;
  for(let a = 0; a < n; a++) for(let b = a + 1; b < n; b++){ let same = 0; hist.forEach(h => { if(h[a] !== "-" && h[a] === h[b]) same++; }); if(same > best){ best = same; duo = [a, b]; } }
  const by = m => { let k = 0; for(let i = 1; i < n; i++) if((m[i] || 0) > (m[k] || 0)) k = i; return k; };
  const top = by(pts), winners = []; for(let i = 0; i < n; i++) if((pts[i] || 0) === (pts[top] || 0) && pts[top]) winners.push(i);
  return { pts, red, green, reb, duo, best, top, winners, strict: by(red), cool: by(green), rebel: by(reb) };
}
// Fin d'un date : on cumule les red flags encaissés (et les bonus).
function closeDate(ids, st){
  const nf = A(st.flags).length || 5, tw = st.tw, mult = tw === "gold" ? 2 : 1, outAt = st.outAt || {};
  const total = Object.assign({}, st.total || {}), full = Object.assign({}, st.full || {}), first = Object.assign({}, st.first || {});
  ids.forEach(id => {
    const left = outAt[id] !== undefined, n = left ? +outAt[id] : nf;
    total[id] = (total[id] || 0) + n * mult + (!left && tw === "last" ? 3 : 0);
    if(!left) full[id] = (full[id] || 0) + 1;
    if(left && +outAt[id] === 0) first[id] = (first[id] || 0) + 1;
  });
  return { total, full, first };
}
const PH = {
  strict: ["Le plus exigeant", "Tolérance zéro", "Juge impitoyable"],
  cool: ["Le plus cool", "Cœur d'artichaut", "Prêt à tout pardonner"],
  duo: ["Le duo le plus compatible", "Les âmes sœurs du jugement", "Même cerveau, deux corps"],
  sync: ["En phase avec le groupe", "La voix du peuple", "Le baromètre de la bande"],
  rebel: ["Le rebelle", "Toujours à contre-courant", "L'avis qui dérange"],
  desp: ["Le plus désespéré", "Prêt à tout pour l'amour", "Accro aux causes perdues"],
  full: ["Fidèle jusqu'au bout", "Ne lâche jamais rien", "Le roc"],
  first: ["Fuite express", "Les baskets toujours lacées", "Premier à la porte"]
};
const ph = (k, seed) => PH[k][(+seed || 0) % PH[k].length];
function awardCard(title, who, sub){ return '<div class="card"><span class="eyebrow">' + esc(title) + '</span><div class="big">' + esc(who) + "</div>" + (sub ? '<span class="sm">' + esc(sub) + "</span>" : "") + "</div>"; }
function voteEndHTML(st, nameAt, n, seed, hl){
  return (st.pts[st.top] ? '<div class="card acc"><span class="eyebrow">' + esc(ph("sync", seed)) + '</span><div class="big">' + esc(st.winners.map(nameAt).join(" & ")) + '</div><span class="sm">' + (st.pts[st.top] || 0) + " points</span></div>" : "") +
    awardCard(ph("strict", seed), nameAt(st.strict), (st.red[st.strict] || 0) + " red flags distribués") +
    awardCard(ph("cool", seed + 1), nameAt(st.cool), (st.green[st.cool] || 0) + " green flags") +
    (st.reb[st.rebel] ? awardCard(ph("rebel", seed), nameAt(st.rebel), st.reb[st.rebel] + " fois dans la minorité") : "") +
    (st.duo && n > 2 ? awardCard(ph("duo", seed + 2), nameAt(st.duo[0]) + " & " + nameAt(st.duo[1]), st.best + " / " + hl + " votes identiques") : "");
}
function dateEndHTML(ids, t, full, first, nameOf, seed, max){
  const order = ids.slice().sort((a, b) => (t[b] || 0) - (t[a] || 0));
  const fk = ids.slice().sort((a, b) => (full[b] || 0) - (full[a] || 0))[0], ek = ids.slice().sort((a, b) => (first[b] || 0) - (first[a] || 0))[0];
  return '<span class="eyebrow">' + esc(ph("desp", seed)) + '</span><div class="who">' + esc(nameOf(order[0])) + "</div><p>" + (t[order[0]] || 0) + " points de red flags encaissés.</p>" +
    '<div class="bars">' + order.map(id => '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + (t[id] || 0) + ' pts</span></div><div class="tr"><div class="fl" style="width:' + Math.min(100, Math.round(100 * (t[id] || 0) / Math.max(1, max))) + '%"></div></div></div>').join("") + "</div>" +
    awardCard(ph("strict", seed), nameOf(order[order.length - 1])) +
    (full[fk] ? awardCard(ph("full", seed), nameOf(fk), full[fk] + " date" + (full[fk] > 1 ? "s" : "") + " jusqu'au bout") : "") +
    (first[ek] ? awardCard(ph("first", seed), nameOf(ek), first[ek] + " fuite" + (first[ek] > 1 ? "s" : "") + " dès le premier red flag") : "");
}
const CSS = '<style>.rf-card{background:var(--card); border-radius:18px; padding:22px 18px; box-shadow:0 1px 0 var(--line), 0 10px 26px -18px rgba(0,0,0,.45); display:flex; flex-direction:column; gap:10px; border-top:6px solid var(--acc)}' +
  '.rf-t{font-size:27px; font-weight:800; line-height:1.2; overflow-wrap:anywhere}.rf-plus{font-size:19px; font-weight:700; line-height:1.25; color:var(--muted)}.rf-plus b{color:var(--ink)}' +
  '.rf-3{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px}.rf-3.two{grid-template-columns:1fr 1fr}.rf-3 button{min-height:92px; border:3px solid transparent; border-radius:16px; color:#fff; font-weight:800; font-size:16px; line-height:1.15; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px}' +
  '.rf-3 button .f{font-size:30px; line-height:1}.rf-3 button[aria-pressed="true"]{border-color:var(--ink); box-shadow:0 0 0 3px var(--bg), 0 0 0 6px var(--ink)}' +
  '.rf-res{display:flex; flex-direction:column; gap:10px}.rf-res .bar .fl{background:var(--c)}.rf-pts{font-size:14px; color:var(--muted)}.rf-pts b{color:var(--ink)}' +
  '.rf-2{display:grid; grid-template-columns:1fr 1fr; gap:10px}.rf-2 .btn{min-height:84px; font-size:20px}' +
  '.rf-steps{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.rf-steps li{background:var(--card); border:1.5px solid var(--line); border-left:6px solid #d93025; border-radius:10px; padding:8px 12px; font-weight:700}' +
  '.rf-steps li.perk{border-left-color:#1e8e3e}</style>';
function flagSVG(){ return '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M5 3v18" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M6 4h11l-2.5 4L17 12H6z" fill="#fff" opacity=".95"/></svg>'; }
const kinds = tw => tw === "nobeige" ? ["r", "g"] : ["r", "b", "g"];
function voteBtns(sel, tw){ const ks = kinds(tw); return '<div class="rf-3' + (ks.length === 2 ? " two" : "") + '">' + ks.map(k => '<button type="button" data-v="' + k + '" style="background:' + KIND[k][1] + '" aria-pressed="' + (k === sel) + '"><span class="f">' + flagSVG() + "</span>" + KIND[k][0] + "</button>").join("") + "</div>"; }
function flagCard(o, small){
  return '<div class="rf-card">' + (small ? "" : '<span class="eyebrow">Red flag ou green flag ?</span>') + '<div class="rf-t"' + (small ? ' style="font-size:22px"' : "") + ">" + esc(o.f) + "</div>" +
    (o.f2 ? '<div class="rf-plus">et en plus, <b>' + esc(String(o.f2).replace(/^Ton date /, "")) + "</b></div>" : "") +
    (o.pk ? '<div class="rf-plus">… mais ton date <b>' + esc(o.pk) + "</b></div>" : "") + "</div>";
}
function resBars(ids, votes, nameOf, blind){
  const by = { r: [], b: [], g: [] }; ids.forEach((id, i) => { const v = votes[i]; if(by[v]) by[v].push(id); });
  const n = Math.max(1, by.r.length + by.b.length + by.g.length);
  return '<div class="rf-res">' + ["r", "b", "g"].map(k => '<div class="bar" style="--c:' + KIND[k][1] + '"><div class="lb"><span style="color:' + KIND[k][1] + '">' + KIND[k][0] + "</span><span>" + Math.round(100 * by[k].length / n) + ' %</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * by[k].length / n) + '%"></div></div><span class="vt">' + (blind ? (by[k].length ? by[k].length + " vote" + (by[k].length > 1 ? "s" : "") + " secret" + (by[k].length > 1 ? "s" : "") : "Personne") : esc(by[k].map(nameOf).join(", ") || "Personne")) + "</span></div>").join("") + "</div>";
}
function resHTML(o, ids, nameOf){
  const v = String(o.votes), tw = o.tw, vd = verdict(v, tw), win = scorers(v, tw), mult = tw === "gold" ? 2 : 1;
  const who = ids.filter((id, i) => win.indexOf(v[i]) >= 0);
  return flagCard(o, true) + (vd ? '<div class="verdict" style="color:' + KIND[vd][1] + '">' + KIND[vd][0] + " !</div>" : '<div class="verdict">Avis partagés</div>') + resBars(ids, v, nameOf, tw === "blind") +
    '<p class="rf-pts">' + (who.length ? (tw === "blind" ? who.length + " joueur" + (who.length > 1 ? "s" : "") + " marque" + (who.length > 1 ? "nt" : "") : "Marquent : <b>" + esc(who.map(nameOf).join(", ")) + "</b>") + " · +" + mult : "Personne ne marque cette fois") + "</p>";
}
function storyHTML(perk, flags, upto){ return '<ul class="rf-steps"><li class="perk">Ton date ' + esc(perk) + "…</li>" + A(flags).slice(0, upto).map(f => "<li>… mais " + esc(String(f).replace(/^Ton date /, "")) + "</li>").join("") + "</ul>"; }

SB.register({
  id: "redflag", name: "Red Flag", glyph: "Flag", pitch: "Red, beige ou green flag pour ton date ?", hot: true,
  accent: { light: "#ff5d6c", dark: "#ff5d6c" },
  tag: "Red, beige ou green flag ? Et jusqu'où tu restes avec un date parfait… plein de défauts ?",
  min: 2, max: 20,
  rules: [
    "Mode « Red ou green ? » : un trait de ton date s'affiche. Chacun vote en secret : red flag, beige flag (bizarre mais ça passe) ou green flag.",
    "Ceux qui votent comme la majorité marquent un point. À la fin : le plus en phase avec le groupe gagne, avec le plus exigeant, le plus cool, le rebelle et le duo le plus compatible.",
    "Mode « Tu restes ou tu pars ? » : un date parfait sur le papier, puis des red flags révélés un par un. À chaque fois, tu restes ou tu fuis. Chaque red flag encaissé rapporte un point.",
    "Coups de théâtre : de temps en temps, une manche change de règle (deal breaker, double flag, minorité gagnante, date express, coup de foudre…).",
    "Les flags déjà vus sur ce téléphone reviennent en dernier. Sur un seul téléphone, chacun répond à côté de son prénom, puis on révèle."
  ],
  options: [
    { id: "mode", label: "Mode", type: "seg", def: "vote", values: [{ v: "vote", label: "Red ou green ?" }, { v: "date", label: "Tu restes ou tu pars ?" }] },
    { id: "rounds", label: "Manches", type: "seg", def: 10, values: [{ v: 5, label: "5" }, { v: 10, label: "10" }, { v: 15, label: "15" }] },
    { id: "packs", label: "Paquets", type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.count })) },
    { id: "twists", label: "Rebondissements", type: "toggle", text: "Coups de théâtre", desc: "Des manches qui changent de règle sans prévenir", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet.");
    const D = { deck: [], perks: [] }, seed = Math.floor(Math.random() * 999);
    if(o.mode === "date"){
      const r = dateRound(D, o.packs, "-"); ctx.setPriv(D);
      return { mode: "date", phase: "step", round: 1, rounds: Math.min(o.rounds || 10, 8), seed, perk: r.perk, flags: r.flags, tw: "-", step: 0, stay: ctx.ids.slice(), outAt: {}, total: {}, full: {}, first: {} };
    }
    const r = voteRound(D, o.packs, "-"); ctx.setPriv(D);
    return { mode: "vote", phase: "vote", round: 1, rounds: o.rounds || 10, seed, f: r.f, f2: "", pk: "", tw: "-", votes: "", hist: [], th: [] };
  },
  host(ctx){
    const s = ctx.s;
    if(s.mode === "vote" && s.phase === "vote"){
      const ks = kinds(s.tw), ok = i => i && ks.indexOf(i.v) >= 0;
      const live = ctx.ids.filter(id => ctx.here(id));
      if(!live.length || !live.every(id => ok(ctx.input(id)))) return;
      const votes = ctx.ids.map(id => { const i = ctx.input(id); return ok(i) ? i.v : "-"; }).join("");
      ctx.set({ phase: "res", votes, hist: A(s.hist).concat([votes]), th: A(s.th).concat([s.tw || "-"]) });
    } else if(s.mode === "date" && s.phase === "step"){
      const stay = A(s.stay), live = stay.filter(id => ctx.here(id));
      if(!live.length || !live.every(id => { const i = ctx.input(id); return i && (i.d === "s" || i.d === "l"); })) return;
      const crush = s.tw === "crush" && !s.step;
      const leave = crush ? [] : live.filter(id => ctx.input(id).d === "l"), outAt = Object.assign({}, s.outAt || {});
      leave.forEach(id => { outAt[id] = s.step; });
      ctx.set({ phase: "stepres", stay: stay.filter(id => leave.indexOf(id) < 0 && ctx.here(id)), left: leave, outAt });
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, tw = s.tw || "-";
    const lab = '<span class="eyebrow">Manche ' + s.round + " / " + s.rounds + "</span>";
    const back = (title, lines, win) => ctx.act(c => c.end({ title, lines, win }));
    /* ===== Mode Red ou green ===== */
    if(s.mode === "vote"){
      const banner = SB.u.twistHTML(twOf(TW_V, tw));
      const nextVote = c => {
        const st = c.s; if(st.round >= st.rounds){ c.set({ phase: "end" }); return; }
        const D = { deck: A(c.priv().deck), perks: A(c.priv().perks) };
        const t = pickTw(TW_V, c.opts.twists !== false, st.round + 1, st.tw), r = voteRound(D, c.opts.packs, t); c.setPriv(D);
        c.set({ phase: "vote", round: st.round + 1, f: r.f, f2: r.f2, pk: r.pk, tw: t, votes: "", k: c.rid() });
      };
      if(s.phase === "vote"){
        screen(root, "v" + s.k, CSS + lab + banner + flagCard(s) + dock(voteBtns("", tw) + '<p class="wait" data-wait></p>'), r => {
          r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => { ctx.send({ v: b.dataset.v }); r.querySelectorAll("[data-v]").forEach(x => x.setAttribute("aria-pressed", x === b)); }));
        });
        const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && kinds(tw).indexOf(i.v) >= 0; }).length;
        txt(root, "[data-wait]", done + " / " + live.length + " votes · tu peux changer d'avis");
      } else if(s.phase === "res"){
        screen(root, "r" + s.k + ctx.isHost, CSS + lab + banner + resHTML(s, ctx.ids, ctx.name) +
          (ctx.isHost ? dock('<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Voir le bilan" : "Flag suivant") + "</button>") : dock('<p class="wait">L\'hôte passe à la suite…</p>')), r => {
          const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "res") nextVote(c); }));
        });
      } else if(s.phase === "end"){
        const ids = ctx.ids, hist = A(s.hist).map(String), st = voteStats(ids.length, hist, s.th), nm = i => ctx.name(ids[i]);
        screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">Bilan</span>' + voteEndHTML(st, nm, ids.length, s.seed, hist.length) +
          (ctx.isHost ? dock('<button class="btn acc" type="button" data-back>Retour au salon</button>') : dock('<p class="wait">L\'hôte va vous ramener au salon.</p>')), r => {
          const b = r.querySelector("[data-back]");
          if(b) b.addEventListener("click", () => back(st.pts[st.top] ? ph("sync", s.seed) + " : " + st.winners.map(nm).join(" & ") : "Red Flag · " + hist.length + " flags",
            [ph("strict", s.seed) + " : " + nm(st.strict), ph("cool", s.seed + 1) + " : " + nm(st.cool)].concat(st.duo && ids.length > 2 ? [ph("duo", s.seed + 2) + " : " + nm(st.duo[0]) + " & " + nm(st.duo[1])] : []),
            st.winners.map(i => ids[i])));
        });
      }
      return;
    }
    /* ===== Mode Tu restes ou tu pars ===== */
    const flags = A(s.flags), nf = flags.length || 5, stay = A(s.stay), step = s.step || 0, inGame = stay.indexOf(me) >= 0;
    const blind = tw === "blind", crush = tw === "crush" && !step, banner = SB.u.twistHTML(twOf(TW_D, tw));
    const nextRound = c => {
      const st = c.s, sums = closeDate(c.ids, st);
      if(st.round >= st.rounds){ c.set(Object.assign({ phase: "end" }, sums)); return; }
      const D = { deck: A(c.priv().deck), perks: A(c.priv().perks) };
      const t = pickTw(TW_D, c.opts.twists !== false, st.round + 1, st.tw), r = dateRound(D, c.opts.packs, t); c.setPriv(D);
      c.set(Object.assign({ phase: "step", round: st.round + 1, perk: r.perk, flags: r.flags, tw: t, step: 0, stay: c.ids.filter(id => c.here(id)), outAt: {}, left: [], k: c.rid() }, sums));
    };
    if(s.phase === "step"){
      screen(root, "s" + s.k + "|" + step + inGame, CSS + lab + banner + '<span class="eyebrow">Red flag ' + (step + 1) + " / " + nf + "</span>" + storyHTML(s.perk, flags, step) +
        '<div class="rf-card"><span class="eyebrow">… mais</span><div class="rf-t">' + esc(flags[step]) + "</div></div>" +
        (inGame ? dock((crush ? '<p class="wait">Coup de foudre : personne ne peut partir maintenant.</p><button class="btn ok" type="button" data-d="s">Je reste, évidemment</button>' : '<div class="rf-2"><button class="btn ok" type="button" data-d="s">Je reste</button><button class="btn bad" type="button" data-d="l">Je pars</button></div>') + '<p class="wait" data-wait></p>')
          : dock('<p class="wait">Tu es déjà parti. Regarde qui tient encore…</p><p class="wait" data-wait></p>')), r => {
        r.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => { ctx.send({ d: b.dataset.d, st: step }); r.querySelectorAll("[data-d]").forEach(x => { x.disabled = true; }); b.textContent = b.dataset.d === "s" ? "Tu restes…" : "Tu fuis !"; }));
      });
      const live = stay.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && i.d; }).length;
      txt(root, "[data-wait]", done + " / " + live.length + " ont décidé" + (blind ? "" : " · encore là : " + stay.map(ctx.name).join(", ")));
    } else if(s.phase === "stepres"){
      const left = A(s.left), last = step >= nf - 1 || !stay.length;
      screen(root, "sr" + s.k + "|" + step + ctx.isHost, CSS + lab + banner + storyHTML(s.perk, flags, step + 1) +
        (blind ? '<div class="card"><span class="eyebrow">Fuite discrète</span><div class="big">' + (left.length ? left.length + " départ" + (left.length > 1 ? "s" : "") + " en douce" : "Personne ne bouge") + '</div><span class="sm">Les noms tombent à la fin du date.</span></div>'
          : '<div class="card"><span class="eyebrow">' + (left.length ? "Ont pris la fuite" : "Personne ne part") + '</span><div class="big">' + esc(left.map(ctx.name).join(", ") || "Ils tiennent bon…") + "</div>" +
          '<span class="sm">Encore là : ' + esc(stay.map(ctx.name).join(", ") || "plus personne") + "</span></div>") +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-next>' + (last ? "Fin de la manche" : "Red flag suivant") + "</button>") : dock('<p class="wait">L\'hôte révèle la suite…</p>')), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "stepres") return;
          if(st.step >= (A(st.flags).length || 5) - 1 || !A(st.stay).length) c.set({ phase: "roundend" });
          else c.set({ phase: "step", step: st.step + 1, left: [], k: c.rid() });
        }));
      });
    } else if(s.phase === "roundend"){
      const outAt = s.outAt || {}, gone = ctx.ids.filter(id => outAt[id] !== undefined);
      screen(root, "re" + s.k + ctx.isHost, CSS + lab + banner + storyHTML(s.perk, flags, Math.min(nf, step + 1)) +
        '<div class="card"><span class="eyebrow">' + (stay.length ? "Restent jusqu'au bout" : "Tout le monde a fui") + '</span><div class="big">' + esc(stay.map(ctx.name).join(", ") || "Ce date finira seul") + "</div>" +
        (gone.length ? '<span class="sm">' + esc(gone.map(id => ctx.name(id) + " (flag " + (+outAt[id] + 1) + ")").join(", ")) + "</span>" : "") + "</div>" +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Voir le bilan" : "Date suivant") + "</button>") : dock('<p class="wait">L\'hôte lance le date suivant…</p>')), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "roundend") nextRound(c); }));
      });
    } else if(s.phase === "end"){
      const t = s.total || {}, ids = ctx.ids.slice().sort((a, b) => (t[b] || 0) - (t[a] || 0)), top = t[ids[0]] || 0;
      screen(root, "end" + ctx.isHost, CSS + dateEndHTML(ctx.ids, t, s.full || {}, s.first || {}, ctx.name, s.seed, Math.max(1, top)) +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-back>Retour au salon</button>') : dock('<p class="wait">L\'hôte va vous ramener au salon.</p>')), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => back(ph("desp", s.seed) + " : " + ctx.name(ids[0]), [ph("strict", s.seed) + " : " + ctx.name(ids[ids.length - 1])], ids.filter(id => (t[id] || 0) === top && top > 0)));
      });
    }
  },

  /* ---------- Un seul téléphone : chacun répond dans l'appli ---------- */
  local: {
    players: { min: 2, max: 16 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id];
      let mode = store().rfMode === "date" ? "date" : "vote", sel = A(store().rfPacks).length ? A(store().rfPacks).slice() : ["classique"];
      let rounds = [5, 10, 15].indexOf(store().rfRounds) >= 0 ? store().rfRounds : 10, twists = store().rfTw !== false;
      let L = null;
      const fresh0 = () => ({ D: { deck: [], perks: [] }, round: 0, seed: Math.floor(Math.random() * 999), tw: "-", f: "", f2: "", pk: "", votes: {}, hist: [], th: [], perk: "", flags: [], step: 0, stay: [], left: [], outAt: {}, total: {}, full: {}, first: {} });
      const rowsHTML = (list, kind) => '<div class="rf-rows">' + list.map(id => '<div class="rf-r"><span class="nm">' + esc(nameOf(id)) + '</span><span class="bt">' +
        (kind === "vote" ? kinds(L.tw).map(k => '<button type="button" data-p="' + id + '" data-v="' + k + '" style="--c:' + KIND[k][1] + '" aria-pressed="' + (L.votes[id] === k) + '" aria-label="' + esc(nameOf(id)) + " : " + KIND[k][0] + '">' + k.toUpperCase() + "</button>").join("")
          : '<button type="button" class="lv" data-p="' + id + '" aria-pressed="' + (L.left.indexOf(id) >= 0) + '">' + (L.left.indexOf(id) >= 0 ? "Je pars" : "Je reste") + "</button>") + "</span></div>").join("") + "</div>";
      const ROWCSS = '<style>.rf-rows{display:flex; flex-direction:column; gap:8px}.rf-r{display:flex; align-items:center; gap:10px; background:var(--card); border:1.5px solid var(--line); border-radius:14px; padding:8px 10px 8px 14px}' +
        '.rf-r .nm{flex:1; min-width:0; font-weight:800; overflow-wrap:anywhere}.rf-r .bt{display:flex; gap:6px}' +
        '.rf-r .bt button{width:46px; height:46px; border-radius:12px; border:2px solid var(--c); background:transparent; color:var(--c); font-weight:800; font-size:16px}' +
        '.rf-r .bt button[aria-pressed="true"]{background:var(--c); color:#fff}' +
        '.rf-r .bt .lv{width:auto; padding:0 14px; --c:#1e8e3e}.rf-r .bt .lv[aria-pressed="true"]{--c:#d93025}</style>';
      const lab = () => '<span class="eyebrow">Manche ' + L.round + " / " + (mode === "date" ? Math.min(rounds, 8) : rounds) + "</span>";
      const banner = () => SB.u.twistHTML(twOf(mode === "date" ? TW_D : TW_V, L.tw));
      const endBtns = '<button class="btn acc" type="button" data-a>Rejouer</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button>';
      function nextF(){ L.round++; L.tw = pickTw(TW_V, twists, L.round, L.tw); Object.assign(L, voteRound(L.D, sel, L.tw)); L.votes = {}; go("vote"); }
      function nextDate(){ L.round++; L.tw = pickTw(TW_D, twists, L.round, L.tw); const r = dateRound(L.D, sel, L.tw); L.perk = r.perk; L.flags = r.flags; L.step = 0; L.stay = ids.slice(); L.left = []; L.outAt = {}; go("step"); }
      const go = ph2 => {
        if(ph2 === "setup"){
          screen(root, "su" + mode + sel.join() + rounds + twists, CSS + '<div class="field"><span class="eyebrow">Mode</span><div class="seg"><button type="button" data-m="vote" aria-pressed="' + (mode === "vote") + '">Red ou green ?</button><button type="button" data-m="date" aria-pressed="' + (mode === "date") + '">Tu restes ou tu pars ?</button></div></div>' +
            '<p class="howto">' + (mode === "vote" ? "Un flag s'affiche, chacun touche sa couleur à côté de son prénom, puis on révèle. Voter comme la majorité rapporte un point." : "Un date parfait, puis des red flags. À chaque flag, ceux qui fuient touchent « Je pars ». Chaque flag encaissé rapporte un point.") + "</p>" +
            '<div class="field"><span class="eyebrow">Manches</span><div class="seg">' + [5, 10, 15].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (n === rounds) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Paquets</span><div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.count + "</span></button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Rebondissements</span><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twists + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">Des manches qui changent de règle sans prévenir</span></span></button></div></div>' +
            dock('<button class="btn acc" type="button" data-go>Commencer</button>'), r => {
            r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ rfMode: mode }); go("setup"); }));
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ rfRounds: rounds }); go("setup"); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.k); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.k); persist({ rfPacks: sel }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twists = !twists; persist({ rfTw: twists }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!sel.length) return;
              L = fresh0();
              if(mode === "vote") nextF(); else nextDate();
            });
          });
        } else if(ph2 === "vote"){
          const n = Object.keys(L.votes).length;
          screen(root, "v" + L.round, CSS + ROWCSS + lab() + banner() + flagCard(L) +
            '<div class="scale"><span style="color:#d93025">R · red</span>' + (L.tw === "nobeige" ? "" : '<span style="color:#c8a36a">B · beige</span>') + '<span style="color:#1e8e3e">G · green</span></div>' + rowsHTML(ids, "vote") +
            dock('<button class="btn acc" type="button" data-rev' + (n ? "" : " disabled") + ">" + (n === ids.length ? "Révéler les votes" : "Révéler (" + n + " / " + ids.length + " ont voté)") + "</button>"), r => {
            const rev = r.querySelector("[data-rev]");
            const upd = () => { const k = Object.keys(L.votes).length; rev.disabled = !k; rev.textContent = k === ids.length ? "Révéler les votes" : "Révéler (" + k + " / " + ids.length + " ont voté)"; };
            r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
              buzz(8); const p = b.dataset.p; if(L.votes[p] === b.dataset.v) delete L.votes[p]; else L.votes[p] = b.dataset.v;
              r.querySelectorAll('[data-p="' + p + '"]').forEach(x => x.setAttribute("aria-pressed", L.votes[p] === x.dataset.v)); upd();
            }));
            rev.addEventListener("click", () => { L.hist.push(ids.map(id => L.votes[id] || "-").join("")); L.th.push(L.tw); go("res"); });
          });
        } else if(ph2 === "res"){
          screen(root, "r" + L.round, CSS + lab() + banner() + resHTML(Object.assign({}, L, { votes: L.hist[L.hist.length - 1] }), ids, nameOf) +
            dock('<button class="btn acc" type="button" data-n>' + (L.round >= rounds ? "Voir le bilan" : "Flag suivant") + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => { if(L.round >= rounds) go("vend"); else nextF(); });
          });
        } else if(ph2 === "vend"){
          const st = voteStats(ids.length, L.hist, L.th), nm = i => names[i];
          if(st.pts[st.top]) api.win(st.winners.map(nm));
          screen(root, "ve" + L.seed + "|" + L.hist.length, CSS + '<span class="eyebrow">Bilan</span>' + voteEndHTML(st, nm, ids.length, L.seed, L.hist.length) + dock(endBtns), r => {
            r.querySelector("[data-a]").addEventListener("click", api.again); r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        } else if(ph2 === "step"){
          const crush = L.tw === "crush" && !L.step;
          if(crush) L.left = [];
          screen(root, "s" + L.round + "|" + L.step, CSS + ROWCSS + lab() + banner() + '<span class="eyebrow">Red flag ' + (L.step + 1) + " / " + L.flags.length + "</span>" + storyHTML(L.perk, L.flags, L.step) +
            '<div class="rf-card"><span class="eyebrow">… mais</span><div class="rf-t">' + esc(L.flags[L.step]) + "</div></div>" +
            (crush ? '<p class="howto">Coup de foudre : personne ne peut partir sur ce premier red flag.</p>' : '<span class="eyebrow">Qui part ?</span>' + rowsHTML(L.stay, "date")) + dock('<button class="btn acc" type="button" data-ok>Valider</button>'), r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => {
              buzz(8); const p = b.dataset.p, i = L.left.indexOf(p); if(i >= 0) L.left.splice(i, 1); else L.left.push(p);
              const on = L.left.indexOf(p) >= 0; b.setAttribute("aria-pressed", on); b.textContent = on ? "Je pars" : "Je reste";
            }));
            r.querySelector("[data-ok]").addEventListener("click", () => { L.left.forEach(id => { L.outAt[id] = L.step; }); L.stay = L.stay.filter(id => L.left.indexOf(id) < 0); go("stepres"); });
          });
        } else if(ph2 === "stepres"){
          const last = L.step >= L.flags.length - 1 || !L.stay.length, blind = L.tw === "blind";
          screen(root, "sr" + L.round + "|" + L.step, CSS + lab() + banner() + storyHTML(L.perk, L.flags, L.step + 1) +
            (blind ? '<div class="card"><span class="eyebrow">Fuite discrète</span><div class="big">' + (L.left.length ? L.left.length + " départ" + (L.left.length > 1 ? "s" : "") + " en douce" : "Personne ne bouge") + '</div><span class="sm">Les noms tombent à la fin du date.</span></div>'
              : '<div class="card"><span class="eyebrow">' + (L.left.length ? "Ont pris la fuite" : "Personne ne part") + '</span><div class="big">' + esc(L.left.map(nameOf).join(", ") || "Ils tiennent bon…") + '</div><span class="sm">Encore là : ' + esc(L.stay.map(nameOf).join(", ") || "plus personne") + "</span></div>") +
            dock('<button class="btn acc" type="button" data-n>' + (last ? "Fin du date" : "Red flag suivant") + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(!last){ L.step++; L.left = []; go("step"); return; }
              Object.assign(L, closeDate(ids, L));
              go("roundend");
            });
          });
        } else if(ph2 === "roundend"){
          const gone = ids.filter(id => L.outAt[id] !== undefined), fin = L.round >= Math.min(rounds, 8);
          screen(root, "re" + L.round, CSS + lab() + banner() + storyHTML(L.perk, L.flags, Math.min(L.flags.length, L.step + 1)) + '<div class="card"><span class="eyebrow">' + (L.stay.length ? "Restent jusqu'au bout" : "Tout le monde a fui") + '</span><div class="big">' + esc(L.stay.map(nameOf).join(", ") || "Ce date finira seul") + "</div>" +
            (gone.length ? '<span class="sm">' + esc(gone.map(id => nameOf(id) + " (flag " + (L.outAt[id] + 1) + ")").join(", ")) + "</span>" : "") + "</div>" +
            dock('<button class="btn acc" type="button" data-n>' + (fin ? "Voir le bilan" : "Date suivant") + "</button>"), r => { r.querySelector("[data-n]").addEventListener("click", () => { if(fin) go("dend"); else nextDate(); }); });
        } else if(ph2 === "dend"){
          const t = L.total, order = ids.slice().sort((a, b) => (t[b] || 0) - (t[a] || 0)), top = t[order[0]] || 0;
          if(top) api.win(order.filter(id => (t[id] || 0) === top).map(nameOf));
          screen(root, "de" + L.seed + "|" + L.round, CSS + dateEndHTML(ids, t, L.full, L.first, nameOf, L.seed, Math.max(1, top)) + dock(endBtns), r => {
            r.querySelector("[data-a]").addEventListener("click", api.again); r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go("setup");
    }
  }
});
})();
