/* Killer — chacun reçoit en secret une cible et une mission. Réussis ta mission
   et tu récupères la cible de ta victime. Le jeu tourne toute la soirée en fond. */
(function(){
"use strict";
const { esc, A, shuffle, screen, store, persist, dock, armTap, buzz, txt, pick } = SB.u;

const MISSIONS = [
  "Fais dire « ananas » à ta cible","Fais trinquer ta cible avec toi en la regardant dans les yeux","Fais tenir ton verre à ta cible pendant 10 secondes",
  "Fais chanter ta cible, ne serait-ce qu'un bout de chanson","Fais dire à ta cible le prénom de son premier crush","Fais en sorte que ta cible te prête son téléphone",
  "Fais un selfie avec ta cible","Fais dire « c'est pas faux » à ta cible","Fais en sorte que ta cible t'invente un surnom et t'appelle comme ça","Fais goûter quelque chose à ta cible",
  "Fais enlever une chaussure à ta cible","Fais en sorte que ta cible te donne l'heure","Fais imiter un animal à ta cible","Fais en sorte que ta cible te tape dans la main",
  "Fais dire « je t'aime » à ta cible, à n'importe qui","Fais en sorte que ta cible te donne un conseil amoureux","Fais danser ta cible, ne serait-ce que 5 secondes",
  "Fais en sorte que ta cible te raconte un souvenir d'enfance","Fais dire « parapluie » à ta cible","Fais en sorte que ta cible te montre une photo de sa galerie",
  "Fais compter ta cible jusqu'à 10","Fais en sorte que ta cible te serve à boire","Fais en sorte que ta cible te fasse un compliment","Fais en sorte que ta cible te cède sa place",
  "Fais en sorte que ta cible te dise son signe astrologique","Fais en sorte que ta cible accepte un pari avec toi","Fais rire ta cible avec une blague nulle",
  "Fais en sorte que ta cible t'explique les règles d'un jeu","Fais répéter à ta cible, mot pour mot, une phrase que tu viens de dire","Fais en sorte que ta cible prenne une photo de toi",
  "Fais lever le pouce à ta cible","Fais en sorte que ta cible te donne un objet qu'elle a dans sa poche","Fais dire « oui » trois fois de suite à ta cible","Fais changer de place à ta cible",
  "Fais citer à ta cible une ville qui commence par M","Fais imiter quelqu'un de la soirée à ta cible","Fais en sorte que ta cible te montre sa dernière recherche Google",
  "Fais en sorte que ta cible te dise son plat préféré","Fais faire un clin d'œil à ta cible","Fais siffler ta cible","Fais en sorte que ta cible te serre la main",
  "Fais lire un texte à voix haute à ta cible","Fais fredonner le générique d'un dessin animé à ta cible","Fais dire « c'est la vie » à ta cible","Fais en sorte que ta cible te fasse goûter son verre",
  "Fais en sorte que ta cible t'aide à porter quelque chose","Fais dire « catastrophe » à ta cible","Fais en sorte que ta cible te demande « ça va ? »","Invente un check avec ta cible et faites-le ensemble",
  "Fais en sorte que ta cible t'appelle sur ton portable","Fais en sorte que ta cible t'envoie un message","Fais raconter son pire rendez-vous à ta cible","Fais tenir ta cible en équilibre sur une jambe",
  "Fais en sorte que ta cible te dise quel métier elle rêvait de faire enfant","Fais dire un mot en anglais à ta cible","Fais en sorte que ta cible te prête un vêtement ou un accessoire",
  "Fais applaudir ta cible","Fais en sorte que ta cible te dise son pire défaut","Fais en sorte que ta cible te recommande une série","Fais dire « incroyable » à ta cible",
  "Fais en sorte que ta cible te donne son avis sur ta tenue","Fais en sorte que ta cible te dise quel super-pouvoir elle aimerait avoir",
  "Fais dire « croissant » à ta cible","Fais en sorte que ta cible te montre son fond d'écran","Fais faire un vœu à voix haute à ta cible",
  "Fais en sorte que ta cible te dise son film préféré","Fais en sorte que ta cible imite ta voix","Fais en sorte que ta cible te dise sa chanson préférée du moment",
  "Fais réciter l'alphabet à l'envers à ta cible (au moins 5 lettres)","Fais en sorte que ta cible te fasse une révérence","Fais en sorte que ta cible te dessine quelque chose",
  "Fais en sorte que ta cible te raconte le dernier rêve dont elle se souvient","Fais dire « absolument » à ta cible","Fais en sorte que ta cible te prédise ton avenir",
  "Fais en sorte que ta cible te fasse un pronostic sur la fin de la soirée","Fais en sorte que ta cible te pose une question sur ton travail ou tes études","Fais compter à ta cible le nombre de personnes dans la pièce",
  "Fais en sorte que ta cible t'aide à chercher un objet que tu as « perdu »","Fais chuchoter ta cible","Fais en sorte que ta cible te raconte son dernier fou rire",
  "Fais en sorte que ta cible te montre l'appli qu'elle utilise le plus","Fais bâiller ta cible","Fais en sorte que ta cible t'appelle par ton nom de famille",
  "Fais écrire son prénom à ta cible, sur n'importe quoi","Fais en sorte que ta cible te donne une note sur 10 pour quelque chose","Fais dire « bizarre » à ta cible",
  "Fais en sorte que ta cible te dise ce qu'elle a mangé ce midi","Fais en sorte que ta cible pose sa main sur ton épaule","Fais en sorte que ta cible te cite une réplique de film",
  "Fais en sorte que ta cible te parle avec un accent","Fais en sorte que ta cible te parle de son animal de compagnie (ou de celui qu'elle rêve d'avoir)","Fais en sorte que ta cible te propose de jouer à un jeu",
  "Fais dire « à la tienne » à ta cible","Fais en sorte que ta cible t'emprunte un objet","Fais en sorte que ta cible réponde à une devinette","Fais faire une grimace à ta cible"
];
const HOT = [
  "Fais dire « préliminaires » à ta cible","Fais raconter son pire plan d'un soir à ta cible","Fais avouer son nombre de partenaires à ta cible",
  "Fais dire à ta cible qui elle trouve le plus sexy ici","Fais dire « capote » à ta cible","Fais en sorte que ta cible te montre son dernier match sur une appli de rencontre",
  "Fais en sorte que ta cible te fasse un compliment sur ton physique","Fais avouer un fantasme à ta cible","Fais dire « j'ai envie de toi » à ta cible, à n'importe qui",
  "Fais raconter à ta cible l'endroit le plus insolite où elle a fait l'amour","Fais en sorte que ta cible te raconte son premier baiser","Fais mimer une position du Kamasutra à ta cible",
  "Fais dire « menottes » à ta cible","Fais avouer à ta cible son plus gros coup de foudre","Fais en sorte que ta cible te masse les épaules pendant 10 secondes","Fais en sorte que ta cible t'appelle « mon cœur »",
  "Fais en sorte que ta cible t'explique sa technique de drague","Fais raconter son pire râteau à ta cible","Fais pousser un soupir langoureux à ta cible","Fais avouer à ta cible si elle a déjà simulé",
  "Fais enlever un vêtement à ta cible (veste, chaussette, ce qu'elle veut)","Fais en sorte que ta cible te fasse un bisou sur la joue","Fais avouer à ta cible la couleur de ses sous-vêtements",
  "Danse un slow avec ta cible","Fais en sorte que ta cible te fasse une fausse déclaration d'amour","Fais dire « oh oui » à ta cible, de la façon la plus suggestive possible",
  "Fais raconter son rêve le plus chaud à ta cible","Fais avouer à ta cible sur quelle célébrité elle fantasme","Fais avouer à ta cible sa plus longue période sans sexe",
  "Fais avouer à ta cible le pire message qu'elle a envoyé à un ex","Fais dire à ta cible ce qu'il y a dans sa table de nuit","Fais avouer à ta cible son nude le plus raté",
  "Fais avouer à ta cible le surnom le plus gênant qu'on lui a donné au lit","Fais dire « lingerie » à ta cible","Fais avouer à ta cible la chose la plus osée qu'elle a faite dans un lieu public",
  "Fais en sorte que ta cible te sorte sa meilleure phrase de drague","Fais dire « strip-poker » à ta cible","Fais avouer à ta cible si elle a déjà embrassé quelqu'un de cette soirée",
  "Fais en sorte que ta cible te murmure quelque chose à l'oreille","Fais avouer à ta cible le prénom de la dernière personne qu'elle a embrassée","Fais avouer à ta cible ce qu'elle regarde en premier chez quelqu'un",
  "Fais dire « viens par ici » à ta cible, d'une voix sensuelle","Fais raconter son plus long baiser à ta cible","Fais en sorte que ta cible te tienne la main pendant 10 secondes",
  "Fais avouer à ta cible ce qu'elle porte pour dormir","Fais avouer à ta cible si elle a déjà envoyé un message coquin à la mauvaise personne","Fais dire « déshabille-toi » à ta cible, à n'importe qui",
  "Fais décrire à ta cible son partenaire idéal en trois mots","Fais avouer à ta cible son endroit préféré pour un premier rendez-vous"
];
const PACKS = [
  { v: "classique", label: "Classique", desc: "Des missions faisables en pleine soirée", list: MISSIONS },
  { v: "adulte", label: "Adultes", desc: "Confessions coquines, sexe, tabous", list: HOT, hot: true }
];
const SEEN = "killer:m";
// Paquet de missions : celles jamais vues sur ce téléphone sortent en premier.
function deckFor(packs){
  const sel = A(packs), pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => p.list);
  return SB.u.fresh(SEEN, pool.length ? pool : MISSIONS);
}
function take(deck){ const m = deck.pop(); if(m) SB.u.saw(SEEN, m); return m; }
function packButtons(sel){
  return '<div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>";
}
const CSS = '<style>.kl-m{font-size:22px; font-weight:800; line-height:1.25; overflow-wrap:anywhere}.kl-hid{font-size:15px; color:var(--muted)}' +
  '.kl-chain{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.kl-chain li{display:flex; justify-content:space-between; gap:8px; background:var(--card); border:1.5px solid var(--line); border-radius:10px; padding:8px 12px; font-weight:700}' +
  '.kl-chain li span:last-child{color:var(--muted); text-align:right}.kl-pend{display:flex; flex-direction:column; gap:6px; background:var(--soft); border-radius:12px; padding:10px 12px}' +
  '.kl-x{border-top:1.5px dashed currentColor; padding-top:10px; margin-top:4px; display:flex; flex-direction:column; gap:4px}.kl-x .kl-m{font-size:18px}' +
  '.kl-cd{margin:-6px 0 12px; font-size:13px; font-weight:700; color:var(--muted)}.kl-aw{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}' +
  '.kl-aw li{background:var(--soft); border-radius:12px; padding:8px 12px; font-size:14px}.kl-aw b{display:block; font-family:var(--f-disp); font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:var(--tone, var(--acc))}</style>';

/* ----- Coups de théâtre : des événements qui relancent la chasse ----- */
const MIN = 60000;
const EVENTS = [
  { id: "prime", name: "Prime sur une tête", desc: "Celui qui élimine {p} gagne 2 points de bonus. Prime valable 10 minutes.", ms: 10 * MIN, ok: o => o.n >= 3 },
  { id: "treve", name: "Trêve", desc: "Pendant 3 minutes, aucune mission ne peut être annoncée. Préparez vos coups en douce.", ms: 3 * MIN },
  { id: "express", name: "Contrat express", desc: "Pendant 10 minutes, tu peux aussi éliminer ta cible avec la mission bonus : « {m} ». Elle rapporte 1 point de plus.", ms: 10 * MIN },
  { id: "double", name: "Chasse ouverte", desc: "Pendant 10 minutes, chaque élimination rapporte 2 points.", ms: 10 * MIN },
  { id: "melange", name: "Grand chambardement", desc: "Les cibles sont redistribuées et chacun reçoit une nouvelle mission. Allez vite voir la vôtre !", ok: o => o.n >= 3 },
  { id: "inverse", name: "Demi-tour", desc: "La chaîne s'inverse : tu chasses maintenant la personne qui te chassait. Nouvelles missions pour tous.", ok: o => o.n >= 3 },
  { id: "ordres", name: "Nouveaux ordres", desc: "Même cible, mais tout le monde reçoit une nouvelle mission.", ok: o => o.n >= 2 },
  { id: "amnistie", name: "Amnistie", desc: "Ceux qui ont déjà utilisé leur accusation la récupèrent : chacun peut de nouveau tenter de démasquer son chasseur.", ok: o => o.used > 0 }
];
const RETARGET = { melange: "Coup de théâtre : nouvelle cible et nouvelle mission !", inverse: "Demi-tour : tu chasses la personne qui te chassait. Nouvelle mission !", ordres: "Nouveaux ordres : même cible, nouvelle mission." };
function evOn(W, now){
  const e = W.ev;
  if(!e || !e.id) return "";
  if(e.until) return now < e.until && !(e.id === "prime" && W.alive.indexOf(e.p) < 0) ? e.id : "";
  return now - e.at < 2 * MIN ? e.id : "";
}
function evView(e, nameOf){
  const t = SB.u.byTwist(EVENTS, e && e.id); if(!t) return null;
  return { name: t.name, desc: t.desc.replace("{p}", e.p ? nameOf(e.p) : "").replace("{m}", e.m || "") };
}
function startEvent(W, t, fresh, now){
  const e = { id: t.id, at: now, until: t.ms ? now + t.ms : 0 };
  if(t.id === "prime") e.p = pick(W.alive);
  if(t.id === "express") e.m = fresh();
  if(t.id === "melange"){ const o = shuffle(W.alive); o.forEach((id, i) => { W.tgt[id] = o[(i + 1) % o.length]; }); }
  if(t.id === "inverse"){ const nt = {}; W.alive.forEach(h => { if(W.tgt[h]) nt[W.tgt[h]] = h; }); Object.assign(W.tgt, nt); }
  if(RETARGET[t.id]){ W.claims = {}; W.alive.forEach(id => { W.mis[id] = fresh(); W.since[id] = now; W.note[id] = { t: RETARGET[t.id], at: now }; }); }
  if(t.id === "amnistie") W.used = {};
  W.ev = e; W.evLast = t.id; W.lastEv = now;
  return e;
}
// Après une élimination (ou après 12 minutes sans rien), un événement peut tomber.
function maybeEvent(W, fresh, now, force){
  if(W.phase !== "play" || W.alive.length < 2) return null;
  const on = evOn(W, now);
  if(on && W.ev.until) return null;
  const t = SB.u.twist(EVENTS, { rate: force ? 1 : 0.45, last: W.evLast, n: W.alive.length, used: W.alive.filter(id => W.used[id]).length });
  return t ? startEvent(W, t, fresh, now) : null;
}
function idle(W, now){ const l = A(W.log), last = l.length ? l[l.length - 1].at || 0 : 0; return now - Math.max(W.t0 || 0, W.lastEv || 0, last); }

/* Élimine `victim`. Son chasseur récupère sa cible. how : "k" (mission réussie) ou "u" (démasqué). x : contrat express. */
function eliminate(W, victim, by, how, fresh, now, x){
  now = now || Date.now();
  const on = evOn(W, now);
  const used = x && W.ev && W.ev.m ? W.ev.m : W.mis[by] || "";
  let pts = (on === "double" ? 2 : 1) + (x ? 1 : 0), bonus = "";
  if(on === "prime" && W.ev.p === victim){ pts += 2; bonus = "p"; }
  if(how === "k"){ const dt = now - (W.since[by] || W.t0 || now); if(dt > 0 && (!W.fast || dt < W.fast.dt)) W.fast = { id: by, dt }; }
  W.alive = W.alive.filter(z => z !== victim);
  const hunter = Object.keys(W.tgt).find(h => W.tgt[h] === victim && W.alive.indexOf(h) >= 0);
  if(hunter){
    W.tgt[hunter] = W.tgt[victim];
    W.mis[hunter] = how === "k" && hunter === by ? W.mis[victim] : fresh();
    W.since[hunter] = now;
  }
  delete W.claims[victim];
  Object.keys(W.claims).forEach(v => { if(W.claims[v] && W.claims[v].by === victim) delete W.claims[v]; });
  delete W.tgt[victim]; delete W.mis[victim];
  W.kills[by] = (W.kills[by] || 0) + 1;
  W.pts[by] = (W.pts[by] || 0) + pts;
  W.log.push({ by, on: victim, how, m: how === "k" ? used : "", at: now, b: bonus, x: x ? 1 : 0, p: pts });
  if(W.alive.length <= 1){ W.phase = "end"; W.win = W.alive[0] || ""; }
  return hunter;
}
function work(s){
  const o = { phase: s.phase, win: s.win || "", t0: s.t0 || 0, jk: s.jk !== false, evs: s.evs !== false, alive: A(s.alive).slice(), log: A(s.log).slice(), ev: s.ev || null, evLast: s.evLast || "", lastEv: s.lastEv || 0, fast: s.fast || null };
  ["tgt", "mis", "kills", "pts", "claims", "used", "note", "seen", "jok", "acc", "nope", "since"].forEach(k => { o[k] = Object.assign({}, s[k]); });
  return o;
}
function freshFrom(ctx){
  return () => { let deck = A(ctx.priv().deck).slice(); if(!deck.length) deck = deckFor(ctx.opts.packs); const m = take(deck); ctx.setPriv({ deck }); return m; };
}
function score(W, id){ return (W.pts || {})[id] != null ? W.pts[id] : (W.kills || {})[id] || 0; }
function ranking(ids, W){ return ids.slice().sort((a, b) => (score(W, b) - score(W, a)) || (((W.kills || {})[b] || 0) - ((W.kills || {})[a] || 0))); }
function ptsTxt(n){ return n + " pt" + (n > 1 ? "s" : ""); }
function graveHTML(log, nameOf){
  const l = A(log).slice().reverse();
  if(!l.length) return '<p class="sm">Personne n\'est encore tombé.</p>';
  return '<ul class="list">' + l.map(x => '<li><span class="t">' + esc(nameOf(x.on)) + '</span><span class="by">' + (x.how === "u" ? "Démasqué par " + esc(nameOf(x.by)) : "Éliminé par " + esc(nameOf(x.by)) + (x.m ? " · « " + esc(x.m) + " »" : "")) + (x.b === "p" ? " · prime encaissée" : x.x ? " · contrat express" : "") + "</span></li>").join("") + "</ul>";
}
/* ----- Trophées de fin : tirés des stats de la partie, formulés différemment à chaque fois ----- */
function seedOf(str){ let h = 7; String(str).split("").forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; }); return h; }
function dur(ms){ return ms < 60000 ? Math.max(1, Math.round(ms / 1000)) + " s" : Math.round(ms / 60000) + " min"; }
function awards(W, ids, nameOf, seed){
  const out = [], P = (a, i) => a[(seed + i) % a.length], log = A(W.log);
  if(W.fast && W.fast.id) out.push([P(["Gâchette la plus rapide", "Tir éclair", "Plus rapide que son ombre"], 0), nameOf(W.fast.id) + ", une mission bouclée en " + dur(W.fast.dt)]);
  if(log.length) out.push([P(["Premier sang", "A ouvert le bal", "Premier coup de couteau"], 1), nameOf(log[0].by) + " a frappé en premier"]);
  const u = log.find(x => x.how === "u");
  if(u) out.push([P(["L'arroseur arrosé", "Pris à son propre piège", "Grillé par sa propre cible"], 2), nameOf(u.on) + ", démasqué par " + nameOf(u.by)]);
  const pr = log.find(x => x.b === "p");
  if(pr) out.push([P(["Chasseur de primes", "Mercenaire de la soirée", "A encaissé la prime"], 3), nameOf(pr.by) + " a eu la tête de " + nameOf(pr.on)]);
  const acc = W.acc || {}, ghost = ranking(ids.filter(id => !acc[id] && (W.kills[id] || 0) > 0), W)[0];
  if(ghost) out.push([P(["Fantôme de la soirée", "Ninja silencieux", "Insoupçonnable"], 4), nameOf(ghost) + ", aucune accusation reçue"]);
  const nope = W.nope || {}, liar = ids.filter(id => nope[id]).sort((a, b) => nope[b] - nope[a])[0];
  if(liar) out.push([P(["Mauvaise foi d'or", "Jamais coupable", "Avocat du diable"], 5), nameOf(liar) + ", " + nope[liar] + " mission" + (nope[liar] > 1 ? "s" : "") + " contestée" + (nope[liar] > 1 ? "s" : "")]);
  // Plus de 4 trophées possibles : on en garde 4, différents d'une partie à l'autre.
  return out.length > 4 ? out.map(x => [seedOf(x[0] + seed), x]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(x => x[1]) : out;
}
function awardsHTML(list){
  return list.length ? '<div class="field"><span class="eyebrow">Trophées</span><ul class="kl-aw">' + list.map(a => "<li><b>" + esc(a[0]) + "</b>" + esc(a[1]) + "</li>").join("") + "</ul></div>" : "";
}
function winTitle(W, ids, nameOf, seed){
  const o = ranking(ids, W), w = W.win || o[0];
  return { w, t: W.win ? nameOf(w) + " " + ["survit à la soirée", "reste en vie jusqu'au bout", "a eu tout le monde"][seed % 3] : nameOf(w) + " " + ["gagne aux points", "domine le tableau de chasse", "a le plus beau palmarès"][seed % 3] };
}
function cdText(W, now){ const e = W.ev; if(!e || !e.until) return ""; const r = Math.max(0, e.until - now); return "Encore " + (r >= 60000 ? Math.floor(r / 60000) + " min " : "") + Math.floor(r % 60000 / 1000) + " s"; }

const UI = { gid: "", open: false, acc: false };

const DEF = {
  id: "killer", name: "Killer", glyph: "Tué !", pitch: "Une cible, une mission secrète, toute la soirée.", hot: true, ticks: true,
  accent: { light: "#d6dbe4", dark: "#d6dbe4" },
  tag: "Une cible, une mission secrète. Réussis-la sans te faire griller et récupère la cible de ta victime.",
  min: 4, max: 20,
  rules: [
    "Chacun reçoit en secret une cible et une mission, par exemple : faire dire « ananas » à ta cible.",
    "Le jeu tourne en fond pendant toute la soirée : vous pouvez jouer aux autres jeux en même temps.",
    "Mission réussie ? Touche « J'ai réussi ma mission ». Ta victime confirme, tu marques un point et tu récupères sa cible et sa mission.",
    "Tu penses savoir qui te chasse ? Tu n'as droit qu'à une accusation : si tu as raison, ton chasseur est éliminé.",
    "Mission impossible ? Ton joker te donne une nouvelle mission, une seule fois.",
    "Coups de théâtre : après une élimination, ou quand ça traîne, un événement peut tomber. Prime sur une tête, trêve, contrat express, cibles mélangées…",
    "Le dernier survivant gagne. L'hôte peut arrêter la partie avant la fin : le meilleur score l'emporte alors."
  ],
  options: [
    { id: "packs", label: "Missions", type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "jokers", label: "Joker", type: "toggle", text: "Un joker par joueur", desc: "Pour changer une fois de mission", def: true },
    { id: "events", label: "Coups de théâtre", type: "toggle", text: "Événements surprises", desc: "Primes, trêves, contrats express, cibles mélangées", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet de missions.");
    const order = shuffle(ctx.ids), tgt = {}, mis = {}, since = {}, deck = deckFor(o.packs), now = ctx.now();
    order.forEach((id, i) => { tgt[id] = order[(i + 1) % order.length]; mis[id] = take(deck) || MISSIONS[0]; since[id] = now; });
    ctx.setPriv({ deck });
    return { phase: "play", t0: now, jk: o.jokers !== false, evs: o.events !== false, alive: ctx.ids.slice(), tgt, mis, since, kills: {}, pts: {}, log: [], claims: {}, used: {}, note: {}, seen: {}, jok: {}, acc: {}, nope: {}, ev: null, evLast: "", lastEv: 0, fast: null, win: "" };
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "play") return;
    const W = work(s), fresh = freshFrom(ctx), now = ctx.now(), n0 = W.log.length;
    let changed = false;
    ctx.ids.forEach(id => {
      const inp = ctx.input(id); if(!inp) return;
      const sn = Object.assign({}, W.seen[id] || {});
      if(inp.c && inp.c.n > (sn.c || 0)){
        sn.c = inp.c.n; changed = true;
        const t = inp.c.t;
        if(W.phase === "play" && W.alive.indexOf(id) >= 0 && W.tgt[id] === t && W.alive.indexOf(t) >= 0 && !W.claims[t]){
          if(evOn(W, now) === "treve") W.note[id] = { t: "Trêve en cours : attends la fin pour annoncer ta mission.", at: now };
          else W.claims[t] = { by: id, at: now, x: inp.c.x && evOn(W, now) === "express" ? 1 : 0 };
        }
      }
      if(inp.v && inp.v.n > (sn.v || 0)){
        sn.v = inp.v.n; changed = true;
        const cl = W.claims[id];
        if(cl && W.phase === "play"){
          if(inp.v.ok){ eliminate(W, id, cl.by, "k", fresh, now, cl.x); W.note[cl.by] = { t: "Bien joué, " + ctx.name(id) + " est hors jeu ! Tu récupères sa cible et sa mission.", at: now }; }
          else { delete W.claims[id]; W.nope[id] = (W.nope[id] || 0) + 1; W.note[cl.by] = { t: ctx.name(id) + " conteste ta mission. Réglez ça entre vous, puis retente ta chance.", at: now }; }
        }
      }
      if(inp.a && inp.a.n > (sn.a || 0)){
        sn.a = inp.a.n; changed = true;
        if(W.phase === "play" && W.alive.indexOf(id) >= 0 && !W.used[id]){
          W.used[id] = true;
          if(inp.a.w) W.acc[inp.a.w] = (W.acc[inp.a.w] || 0) + 1;
          const hunter = W.alive.find(h => W.tgt[h] === id);
          if(hunter && inp.a.w === hunter){
            const g = eliminate(W, hunter, id, "u", fresh, now);
            if(g && g !== id) W.note[g] = { t: "Ta cible a été éliminée par quelqu'un d'autre. Tu as une nouvelle cible et une nouvelle mission.", at: now };
            W.note[id] = { t: "Bien vu, c'était " + ctx.name(hunter) + " ! Ton chasseur est hors jeu.", at: now };
          } else W.note[id] = { t: "Raté, ce n'était pas " + ctx.name(inp.a.w) + ". Tu n'as plus d'accusation.", at: now };
        }
      }
      if(inp.j && inp.j.n > (sn.j || 0)){
        sn.j = inp.j.n; changed = true;
        if(W.phase === "play" && W.jk && W.alive.indexOf(id) >= 0 && !W.jok[id] && !(W.claims[W.tgt[id]] && W.claims[W.tgt[id]].by === id)){
          W.jok[id] = true; W.mis[id] = fresh(); W.since[id] = now;
          W.note[id] = { t: "Joker utilisé : voici ta nouvelle mission. Plus de joker !", at: now };
        }
      }
      W.seen[id] = sn;
    });
    // Victime hors ligne depuis 30 s : la mission est validée.
    Object.keys(W.claims).forEach(v => {
      const cl = W.claims[v];
      if(W.phase === "play" && cl && !ctx.here(v) && now - (cl.at || now) > 30000){ eliminate(W, v, cl.by, "k", fresh, now, cl.x); changed = true; }
    });
    if(W.evs && W.phase === "play" && (W.log.length > n0 || idle(W, now) > 12 * MIN)){
      if(maybeEvent(W, fresh, now, W.log.length === n0)) changed = true;
      else if(W.log.length === n0){ W.lastEv = now; changed = true; }
    }
    if(changed) ctx.set(W);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, nameOf = ctx.name, now = ctx.now();
    if(UI.gid !== ctx.g.gid){ UI.gid = ctx.g.gid; UI.open = false; UI.acc = false; }
    const again = () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); };
    const W = work(s);
    const alive = W.alive, tgt = W.tgt, mis = W.mis, claims = W.claims, used = W.used, note = W.note[me];
    const seed = seedOf(ctx.g.gid || "k");
    if(s.phase === "end"){
      const order = ranking(ctx.ids, W), wt = winTitle(W, ctx.ids, nameOf, seed);
      screen(root, "end" + ctx.isHost + W.log.length, CSS + '<span class="eyebrow">' + (W.win ? "Dernier survivant" : "Meilleur score") + '</span><div class="who">' + esc(nameOf(wt.w)) + "</div>" +
        '<div class="field"><span class="eyebrow">Tableau de chasse</span><ul class="kl-chain">' + order.map(id => "<li><span>" + esc(nameOf(id)) + (alive.indexOf(id) >= 0 ? " · vivant" : "") + "</span><span>" + ptsTxt(score(W, id)) + "</span></li>").join("") + "</ul></div>" +
        awardsHTML(awards(W, ctx.ids, nameOf, seed)) +
        '<div class="field"><span class="eyebrow">Cimetière</span>' + graveHTML(W.log, nameOf) + "</div>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const W2 = work(c.s), o2 = ranking(c.ids, W2), sd = seedOf(c.g.gid || "k"), t2 = winTitle(W2, c.ids, c.name, sd);
          c.end({ title: "Killer : " + t2.t, win: [t2.w], lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + ptsTxt(score(W2, id))).concat(awards(W2, c.ids, c.name, sd).slice(0, 2).map(a => a[0] + " : " + a[1])) });
        }));
      });
      return;
    }
    const on = evOn(W, now), ev = on ? evView(W.ev, nameOf) : null, treve = on === "treve", express = on === "express";
    const isAlive = alive.indexOf(me) >= 0, myT = tgt[me], myClaim = myT && claims[myT] && claims[myT].by === me, onMe = claims[me];
    const pend = Object.keys(claims).filter(v => claims[v]);
    const banner = ev ? SB.u.twistHTML(ev) + (W.ev.until ? '<p class="kl-cd" data-cd></p>' : "") : "";
    const hostBox = ctx.isHost ? '<div class="field"><span class="eyebrow">Arbitre (hôte)</span>' +
      (pend.length ? pend.map(v => '<div class="kl-pend"><span><b>' + esc(nameOf(claims[v].by)) + "</b> dit avoir eu <b>" + esc(nameOf(v)) + '</b></span><div class="row"><button class="btn ok" type="button" data-hv="' + esc(v) + '">Valider</button><button class="btn ghost" type="button" data-hx="' + esc(v) + '">Annuler</button></div></div>').join("") : "") +
      '<button class="link warn" type="button" data-stop style="align-self:flex-start">Arrêter la partie et voir le classement</button></div>' : "";
    const key = JSON.stringify([s.k, isAlive, myT, mis[me], !!myClaim, onMe ? onMe.by + onMe.x : "", used[me], W.jok[me], note ? note.at : 0, W.log.length, pend, UI.open, UI.acc, ctx.isHost, alive.length, on, W.ev ? W.ev.at : 0]);
    let html = CSS, dk = "";
    if(!isAlive){
      const dead = W.log.find(x => x.on === me);
      html += banner + '<div class="card acc"><span class="eyebrow">Tu es mort</span><div class="big">' + (dead ? (dead.how === "u" ? "Démasqué par " + esc(nameOf(dead.by)) : "Éliminé par " + esc(nameOf(dead.by))) : "Éliminé") + "</div>" + (dead && dead.m ? '<p class="sm">Mission : « ' + esc(dead.m) + " »</p>" : "") +
        '<p class="sm">Tu peux maintenant suivre toutes les chasses. Chut, ne dis rien !</p></div>' +
        '<div class="field"><span class="eyebrow">Qui chasse qui</span><ul class="kl-chain">' + alive.map(h => "<li><span>" + esc(nameOf(h)) + "</span><span>→ " + esc(nameOf(tgt[h])) + "</span></li>").join("") + "</ul></div>";
    } else if(onMe){
      html += '<div class="pass" style="min-height:0"><span class="eyebrow">Alerte</span><div class="who">' + esc(nameOf(onMe.by)) + '</div><p>dit avoir réussi ' + (onMe.x ? "le contrat express" : "sa mission") + ' sur toi :</p></div><div class="card acc"><div class="kl-m">« ' + esc(onMe.x && W.ev && W.ev.m ? W.ev.m : mis[onMe.by]) + ' »</div></div>';
      dk = dock('<div class="row"><button class="btn bad" type="button" data-yes>Oui, je suis mort</button><button class="btn ghost" type="button" data-no>Non, c\'est faux</button></div>');
    } else {
      html += '<span class="eyebrow">' + alive.length + " joueurs encore en vie · " + ptsTxt(score(W, me)) + "</span>" + banner + (note ? '<p class="note-box">' + esc(note.t) + "</p>" : "") +
        '<div class="card acc"><span class="eyebrow">Ta cible</span>' +
        (UI.open ? '<div class="who">' + esc(nameOf(myT)) + '</div><span class="eyebrow">Ta mission</span><div class="kl-m">' + esc(mis[me]) + "</div>" +
          (express ? '<div class="kl-x"><span class="eyebrow">Ou le contrat express (+1 point)</span><div class="kl-m">' + esc(W.ev.m) + "</div></div>" : "") : '<p class="kl-hid">Cache ton écran, puis touche « Voir ma mission ».</p>') +
        '<button class="btn ghost" type="button" data-eye>' + (UI.open ? "Cacher" : "Voir ma mission") + "</button>" +
        (UI.open && W.jk && !W.jok[me] && !myClaim ? '<button class="link" type="button" data-jok style="align-self:center">Joker : changer de mission</button>' : "") + "</div>";
      if(UI.acc){
        html += '<div class="field"><span class="eyebrow">Qui te chasse ? Une seule chance</span><div class="choices">' + alive.filter(id => id !== me).map(id => '<button type="button" class="opt" data-w="' + esc(id) + '">' + esc(nameOf(id)) + "</button>").join("") + '</div><button class="link" type="button" data-accx style="align-self:flex-start">Annuler</button></div>';
      }
    }
    html += hostBox + '<div class="field"><span class="eyebrow">Cimetière</span>' + graveHTML(W.log, nameOf) + "</div>";
    if(isAlive && !onMe){
      dk = dock(myClaim ? '<p class="wait">En attente : ' + esc(nameOf(myT)) + " doit confirmer…</p>"
        : (treve ? '<p class="wait">Trêve : aucune mission ne peut être annoncée pour l\'instant.</p>' : '<button class="btn acc" type="button" data-kill>J\'ai réussi ma mission</button>' + (express ? '<button class="btn ghost" type="button" data-killx>J\'ai réussi le contrat express</button>' : "")) +
          (!used[me] && !UI.acc ? '<button class="link" type="button" data-acc style="align-self:center">Je sais qui me chasse</button>' : ""));
    }
    screen(root, key, html + dk, r => {
      const q = sel => r.querySelector(sel);
      const n = f => (((ctx.mine() || {})[f] || {}).n || 0) + 1;
      if(q("[data-eye]")) q("[data-eye]").addEventListener("click", () => { UI.open = !UI.open; buzz(8); again(); });
      if(q("[data-kill]")) armTap(q("[data-kill]"), () => { buzz([30, 40, 30]); ctx.send({ c: { n: n("c"), t: myT } }); }, "Toucher encore : mission réussie sur " + nameOf(myT) + " ?");
      if(q("[data-killx]")) armTap(q("[data-killx]"), () => { buzz([30, 40, 30]); ctx.send({ c: { n: n("c"), t: myT, x: 1 } }); }, "Toucher encore : contrat express réussi ?");
      if(q("[data-jok]")) armTap(q("[data-jok]"), () => { buzz(20); ctx.send({ j: { n: n("j") } }); }, "Toucher encore : utiliser ton joker ?");
      if(q("[data-acc]")) q("[data-acc]").addEventListener("click", () => { UI.acc = true; again(); });
      if(q("[data-accx]")) q("[data-accx]").addEventListener("click", () => { UI.acc = false; again(); });
      r.querySelectorAll("[data-w]").forEach(b => armTap(b, () => { UI.acc = false; ctx.send({ a: { n: n("a"), w: b.dataset.w } }); }, "Toucher encore : c'est " + nameOf(b.dataset.w) + " ?"));
      if(q("[data-yes]")) armTap(q("[data-yes]"), () => ctx.send({ v: { n: n("v"), ok: true } }), "Toucher encore pour confirmer");
      if(q("[data-no]")) q("[data-no]").addEventListener("click", () => ctx.send({ v: { n: n("v"), ok: false } }));
      r.querySelectorAll("[data-hv]").forEach(b => b.addEventListener("click", () => ctx.act(c => {
        const W2 = work(c.s), v = b.dataset.hv, cl = W2.claims[v]; if(!cl || W2.phase !== "play") return;
        const fr = freshFrom(c), t = c.now();
        eliminate(W2, v, cl.by, "k", fr, t, cl.x);
        if(W2.evs) maybeEvent(W2, fr, t, false);
        c.set(W2);
      })));
      r.querySelectorAll("[data-hx]").forEach(b => b.addEventListener("click", () => ctx.act(c => {
        const W2 = work(c.s), v = b.dataset.hx; delete W2.claims[v]; c.set({ claims: W2.claims });
      })));
      if(q("[data-stop]")) armTap(q("[data-stop]"), () => ctx.act(c => { c.set({ phase: "end", win: A(c.s.alive).length === 1 ? A(c.s.alive)[0] : "" }); }), "Toucher encore pour arrêter");
    });
    txt(root, "[data-cd]", cdText(W, now));
  },

  /* ---------- Un seul téléphone : on se le passe pour découvrir sa mission ---------- */
  local: {
    players: { min: 4, max: 20 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id];
      const st = store();
      let sel = A(st.klPacks).length ? A(st.klPacks).slice() : ["classique"], jk = st.klJk !== false, evs = st.klEv !== false;
      let W = null, deck = [], i = 0, cur = "", open = false, last = null, at = "", arg0 = "", news = null, seed = 0;
      const fresh = () => { if(!deck.length) deck = deckFor(sel); return take(deck); };
      const toggle = (k, v, label, desc) => '<button type="button" class="pack" data-t="' + k + '" aria-pressed="' + v + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(label) + '</span><span class="ds">' + esc(desc) + "</span></span></button>";
      const evNow = () => { const on = evOn(W, Date.now()); return { on, v: on ? evView(W.ev, nameOf) : null }; };
      const bannerL = () => { const e = evNow(); return e.v ? SB.u.twistHTML(e.v) + (W.ev.until ? '<p class="kl-cd" data-cd>' + esc(cdText(W, Date.now())) + "</p>" : "") : ""; };
      api.onTick(() => {
        if(!W || W.phase !== "play") return;
        const now = Date.now();
        if(evs && (at === "main" || at === "me") && idle(W, now) > 12 * MIN){ if(!maybeEvent(W, fresh, now, true)) W.lastEv = now; else news = W.ev; }
        if(at === "main" || at === "me") go(at, arg0);
        txt(root, "[data-cd]", cdText(W, now));
      });
      const go = (ph, arg) => {
        at = ph; arg0 = arg || "";
        if(ph === "setup"){
          screen(root, "su" + sel.join() + jk + evs, CSS + '<p class="howto">Le téléphone passe de main en main : chacun découvre en secret sa cible et sa mission. Ensuite on le pose au milieu, et on revient dessus quand on a réussi sa mission, ou pour la relire.</p>' +
            '<div class="field"><span class="eyebrow">Missions</span>' + packButtons(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">Variantes</span><div class="packs">' + toggle("jk", jk, "Un joker par joueur", "Pour changer une fois de mission") + toggle("ev", evs, "Coups de théâtre", "Primes, trêves, contrats express, cibles mélangées") + "</div></div>" +
            dock('<button class="btn acc" type="button" data-go>Distribuer les missions</button>'), r => {
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ klPacks: sel }); go("setup"); }));
            r.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { if(b.dataset.t === "jk"){ jk = !jk; persist({ klJk: jk }); } else { evs = !evs; persist({ klEv: evs }); } go("setup"); }));
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!sel.length){ SB.u.toast("Choisis au moins un paquet"); return; }
              deck = deckFor(sel); const order = shuffle(ids), tgt = {}, mis = {}, since = {}, now = Date.now();
              order.forEach((id, x) => { tgt[id] = order[(x + 1) % order.length]; mis[id] = fresh(); since[id] = now; });
              W = { phase: "play", win: "", t0: now, jk, evs, alive: ids.slice(), tgt, mis, since, kills: {}, pts: {}, log: [], claims: {}, used: {}, note: {}, jok: {}, acc: {}, nope: {}, ev: null, evLast: "", lastEv: 0, fast: null };
              seed = seedOf(String(now)); news = null; i = 0; go("pass");
            });
          });
        } else if(ph === "pass"){
          screen(root, "pa" + i, '<div class="pass"><span class="eyebrow">Passe le téléphone à</span><div class="who">' + esc(names[i]) + '</div><p>Les autres, regardez ailleurs.</p></div>' + dock('<button class="btn acc" type="button" data-n>C\'est moi, voir ma mission</button>'), r => {
            r.querySelector("[data-n]").addEventListener("click", () => go("deal"));
          });
        } else if(ph === "deal"){
          const id = String(i);
          screen(root, "de" + i, CSS + '<span class="eyebrow">' + esc(names[i]) + '</span><div class="card acc"><span class="eyebrow">Ta cible</span><div class="who">' + esc(nameOf(W.tgt[id])) + '</div><span class="eyebrow">Ta mission</span><div class="kl-m">' + esc(W.mis[id]) + '</div></div><p class="howto">Retiens-la bien. Tu pourras la relire en touchant ton prénom.</p>' +
            dock('<button class="btn acc" type="button" data-n>J\'ai retenu, cacher</button>'), r => {
            r.querySelector("[data-n]").addEventListener("click", () => { i++; if(i < names.length) go("pass"); else go("main"); });
          });
        } else if(ph === "main"){
          if(news){ const e = news; news = null; go("event", e); return; }
          const e = evNow();
          screen(root, "ma" + W.log.length + W.alive.length + e.on + (W.ev ? W.ev.at : 0), CSS + '<span class="eyebrow">' + W.alive.length + ' joueurs encore en vie</span>' + bannerL() + '<p class="howto">Posez le téléphone au milieu. Touche ton prénom pour relire ta mission, annoncer que tu l\'as réussie, ou accuser ton chasseur.</p>' +
            '<div class="choices">' + W.alive.map(id => '<button type="button" class="opt" data-p="' + id + '">' + esc(nameOf(id)) + (score(W, id) ? ' <span class="pill">' + ptsTxt(score(W, id)) + "</span>" : "") + "</button>").join("") + "</div>" +
            '<div class="field"><span class="eyebrow">Cimetière</span>' + graveHTML(W.log, nameOf) + "</div>" +
            dock('<button class="link warn" type="button" data-stop style="align-self:center">Arrêter et voir le classement</button>'), r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { cur = b.dataset.p; open = false; go("me"); }));
            armTap(r.querySelector("[data-stop]"), () => { W.phase = "end"; W.win = W.alive.length === 1 ? W.alive[0] : ""; go("end"); }, "Toucher encore pour arrêter");
          });
        } else if(ph === "event"){
          const v = evView(arg, nameOf);
          screen(root, "ev" + arg.at, CSS + '<div class="pass" style="min-height:0"><span class="eyebrow">Tout le monde écoute</span><div class="who">Coup de théâtre</div></div>' + SB.u.twistHTML(v) +
            (RETARGET[arg.id] ? '<p class="howto">Chacun repasse par le téléphone pour découvrir sa nouvelle mission.</p>' : "") +
            dock('<button class="btn acc" type="button" data-n>Compris</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => go("main")));
        } else if(ph === "me"){
          const t = W.tgt[cur], e = evNow(), treve = e.on === "treve", express = e.on === "express", nt = W.note[cur];
          screen(root, "me" + cur + open + (arg || "") + e.on + W.jok[cur] + W.mis[cur], CSS + '<span class="eyebrow">' + esc(nameOf(cur)) + " · " + ptsTxt(score(W, cur)) + "</span>" + bannerL() +
            (open && nt ? '<p class="note-box">' + esc(nt.t) + "</p>" : "") +
            (open ? '<div class="card acc"><span class="eyebrow">Ta cible</span><div class="who">' + esc(nameOf(t)) + '</div><span class="eyebrow">Ta mission</span><div class="kl-m">' + esc(W.mis[cur]) + "</div>" +
                (express ? '<div class="kl-x"><span class="eyebrow">Ou le contrat express (+1 point)</span><div class="kl-m">' + esc(W.ev.m) + "</div></div>" : "") +
                (W.jk && !W.jok[cur] ? '<button class="link" type="button" data-jok style="align-self:center">Joker : changer de mission</button>' : "") + "</div>"
              : '<div class="pass" style="min-height:24vh"><p>C\'est bien toi, ' + esc(nameOf(cur)) + " ? Cache l'écran avant d'ouvrir.</p></div>") +
            (arg === "acc" ? '<div class="field"><span class="eyebrow">Qui te chasse ? Une seule chance</span><div class="choices">' + W.alive.filter(id => id !== cur).map(id => '<button type="button" class="opt" data-w="' + id + '">' + esc(nameOf(id)) + "</button>").join("") + "</div></div>" : "") +
            dock((open ? (treve ? '<p class="wait">Trêve : aucune mission ne peut être annoncée pour l\'instant.</p>' : '<button class="btn acc" type="button" data-kill>J\'ai réussi ma mission</button>' + (express ? '<button class="btn ghost" type="button" data-killx>J\'ai réussi le contrat express</button>' : "")) : '<button class="btn acc" type="button" data-open>Voir ma mission</button>') +
              (!W.used[cur] && arg !== "acc" ? '<button class="btn ghost" type="button" data-acc>Je sais qui me chasse</button>' : "") +
              '<button class="link" type="button" data-back style="align-self:center">Cacher et revenir</button>'), r => {
            const q = x => r.querySelector(x);
            const kill = x => {
              const victim = W.tgt[cur], m = x ? W.ev.m : W.mis[cur], now = Date.now();
              eliminate(W, victim, cur, "k", fresh, now, x); delete W.note[cur];
              last = { by: cur, on: victim, m, how: "k" }; buzz([40, 60, 40]);
              if(W.evs && maybeEvent(W, fresh, now, false)) news = W.ev;
              go("news");
            };
            if(q("[data-open]")) q("[data-open]").addEventListener("click", () => { open = true; go("me", arg); });
            if(q("[data-kill]")) armTap(q("[data-kill]"), () => kill(0), "Toucher encore : " + nameOf(t) + " confirme ?");
            if(q("[data-killx]")) armTap(q("[data-killx]"), () => kill(1), "Toucher encore : " + nameOf(t) + " confirme ?");
            if(q("[data-jok]")) armTap(q("[data-jok]"), () => { W.jok[cur] = true; W.mis[cur] = fresh(); W.since[cur] = Date.now(); W.note[cur] = { t: "Joker utilisé : voici ta nouvelle mission.", at: Date.now() }; buzz(20); go("me", arg); }, "Toucher encore : utiliser ton joker ?");
            if(q("[data-acc]")) q("[data-acc]").addEventListener("click", () => go("me", "acc"));
            r.querySelectorAll("[data-w]").forEach(b => armTap(b, () => {
              W.used[cur] = true; W.acc[b.dataset.w] = (W.acc[b.dataset.w] || 0) + 1;
              const hunter = W.alive.find(h => W.tgt[h] === cur), now = Date.now();
              if(hunter === b.dataset.w){
                const g = eliminate(W, hunter, cur, "u", fresh, now);
                if(g && g !== cur) W.note[g] = { t: "Ta cible a été éliminée par quelqu'un d'autre. Voici ta nouvelle cible et ta nouvelle mission.", at: now };
                last = { by: cur, on: hunter, how: "u" }; buzz([40, 60, 40]);
                if(W.evs && maybeEvent(W, fresh, now, false)) news = W.ev;
                go("news");
              } else { last = { miss: b.dataset.w }; go("news"); }
            }, "Toucher encore : c'est " + nameOf(b.dataset.w) + " ?"));
            q("[data-back]").addEventListener("click", () => { if(open) delete W.note[cur]; go("main"); });
          });
        } else if(ph === "news"){
          const L2 = last;
          if(L2.miss !== undefined){
            screen(root, "nw-miss" + W.log.length + Math.random(), '<div class="pass"><span class="eyebrow">Raté</span><div class="who">Pas ' + esc(nameOf(L2.miss)) + '</div><p>' + esc(nameOf(cur)) + " n'a plus d'accusation. Son chasseur court toujours…</p></div>" + dock('<button class="btn acc" type="button" data-n>Continuer</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => go("main")));
            return;
          }
          const over = W.phase === "end";
          const heir = L2.how === "k" && !(news && RETARGET[news.id]) ? L2.by : "";
          const lg = W.log[W.log.length - 1] || {};
          screen(root, "nw" + W.log.length, '<div class="pass"><span class="eyebrow">' + (L2.how === "u" ? "Démasqué !" : "Éliminé !") + '</span><div class="who">' + esc(nameOf(L2.on)) + "</div><p>" +
            (L2.how === "u" ? esc(nameOf(L2.by)) + " a démasqué son chasseur." : "par " + esc(nameOf(L2.by)) + ", avec la mission « " + esc(L2.m) + " ».") + "</p>" +
            (lg.p > 1 ? '<p class="sm">' + esc(nameOf(L2.by)) + " marque " + ptsTxt(lg.p) + (lg.b === "p" ? ", prime comprise" : "") + ".</p>" : "") + "</div>" +
            dock(over ? '<button class="btn acc" type="button" data-end>Voir le vainqueur</button>'
              : heir ? '<button class="btn acc" type="button" data-heir>' + esc(nameOf(heir)) + " : voir ma nouvelle cible</button>" : '<button class="btn acc" type="button" data-n>Continuer</button>'), r => {
            const q = x => r.querySelector(x);
            if(q("[data-end]")) q("[data-end]").addEventListener("click", () => go("end"));
            if(q("[data-n]")) q("[data-n]").addEventListener("click", () => go("main"));
            if(q("[data-heir]")) q("[data-heir]").addEventListener("click", () => { cur = heir; open = false; go("me"); });
          });
        } else if(ph === "end"){
          const order = ranking(ids, W), wt = winTitle(W, ids, nameOf, seed);
          api.win([nameOf(wt.w)]);
          screen(root, "end", CSS + '<span class="eyebrow">' + (W.win ? "Dernier survivant" : "Meilleur score") + '</span><div class="who">' + esc(nameOf(wt.w)) + "</div>" +
            '<div class="field"><span class="eyebrow">Tableau de chasse</span><ul class="kl-chain">' + order.map(id => "<li><span>" + esc(nameOf(id)) + (W.alive.indexOf(id) >= 0 ? " · vivant" : "") + "</span><span>" + ptsTxt(score(W, id)) + "</span></li>").join("") + "</ul></div>" +
            awardsHTML(awards(W, ids, nameOf, seed)) +
            '<div class="field"><span class="eyebrow">Cimetière</span>' + graveHTML(W.log, nameOf) + "</div>" +
            dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button>'), r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go("setup");
    }
  }
};
DEF.engine = { eliminate, work, maybeEvent, startEvent, evOn, awards, EVENTS };
SB.register(DEF);
})();
