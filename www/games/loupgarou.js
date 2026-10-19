/* Loup-garou — l'appli distribue les rôles en secret et fait le narrateur : nuit, sorcière, voyante, chasseur, votes.
   Rôles étendus (Cupidon, Salvateur, Ancien), composition surprise et événements de village pour varier les parties.
   Sur un seul téléphone, elle devient l'assistant du meneur de jeu. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, armTap, buzz, pick, tr } = SB.u;
// Texte dans une langue donnée (lg : langue de l'hôte, s.lg) ; sans lg, langue du téléphone.
const T = (lg, fr, en) => lg == null ? tr(fr, en) : lg === "en" ? en : fr;

const RNAME = { loup: ["Loup-garou", "Werewolf"], voyante: ["Voyante", "Seer"], sorciere: ["Sorcière", "Witch"], chasseur: ["Chasseur", "Hunter"], cupidon: ["Cupidon", "Cupid"],
  salvateur: ["Salvateur", "Bodyguard"], ancien: ["Ancien", "Elder"], villageois: ["Villageois", "Villager"] };
const ROLES = {
  loup: { n: tr(...RNAME.loup), camp: "loups", d: tr("Chaque nuit, avec ta meute, tu dévores un villageois. Le jour, fais-toi passer pour un innocent.", "Every night, you and your pack devour a villager. By day, act innocent.") },
  voyante: { n: tr(...RNAME.voyante), camp: "village", d: tr("Chaque nuit, tu découvres le rôle d'un joueur de ton choix.", "Every night, you learn the role of a player of your choice.") },
  sorciere: { n: tr(...RNAME.sorciere), camp: "village", d: tr("Tu as une potion de vie pour sauver la victime des loups et une potion de mort pour éliminer qui tu veux. Chacune ne sert qu'une fois.", "You have a healing potion to save the wolves' victim and a death potion to kill anyone you like. Each one works only once.") },
  chasseur: { n: tr(...RNAME.chasseur), camp: "village", d: tr("Si tu meurs, de nuit comme de jour, tu emportes immédiatement quelqu'un avec toi.", "If you die, night or day, you instantly take someone down with you.") },
  cupidon: { n: tr(...RNAME.cupidon), camp: "village", d: tr("La première nuit, tu désignes deux joueurs qui tombent fous amoureux (tu peux te choisir). Si l'un meurt, l'autre meurt de chagrin.", "On the first night, you pick two players who fall madly in love (you can pick yourself). If one dies, the other dies of a broken heart.") },
  salvateur: { n: tr(...RNAME.salvateur), camp: "village", d: tr("Chaque nuit, tu protèges un joueur (toi compris) de l'attaque des loups, mais jamais le même deux nuits de suite.", "Every night, you protect one player (yourself included) from the wolves, but never the same one two nights in a row.") },
  ancien: { n: tr(...RNAME.ancien), camp: "village", d: tr("Tu es coriace : tu survis à la première attaque des loups. La deuxième te sera fatale.", "You're tough: you survive the first wolf attack. The second one will finish you.") },
  villageois: { n: tr(...RNAME.villageois), camp: "village", d: tr("Tu n'as aucun pouvoir, juste ton flair. Démasque les loups et élimine-les au vote.", "No powers, just your gut. Sniff out the wolves and vote them out.") }
};
const SPECIALS = [
  { v: "voyante", label: tr("Voyante", "Seer"), desc: tr("Découvre un rôle chaque nuit", "Learns a role every night") },
  { v: "sorciere", label: tr("Sorcière", "Witch"), desc: tr("Une potion de vie, une potion de mort", "One healing potion, one death potion") },
  { v: "chasseur", label: tr("Chasseur", "Hunter"), desc: tr("Emporte quelqu'un en mourant", "Takes someone down when dying") },
  { v: "cupidon", label: tr("Cupidon", "Cupid"), desc: tr("Désigne deux amoureux la première nuit", "Makes two players fall in love on night 1") },
  { v: "salvateur", label: tr("Salvateur", "Bodyguard"), desc: tr("Protège un joueur chaque nuit", "Protects a player every night") },
  { v: "ancien", label: tr("Ancien", "Elder"), desc: tr("Survit à la première attaque des loups", "Survives the first wolf attack") }
];
/* Événements de village : un par cycle au maximum, jamais deux fois de suite, jamais la première nuit.
   t : "night" (s'applique à la nuit qui commence) ou "day" (annoncé à l'aube, s'applique au vote du jour). */
const EVENTS = [
  { id: "secret", t: "day", name: tr("Vote à bulletin secret", "Secret ballot"), desc: tr("Aujourd'hui, personne ne saura qui a voté contre qui.", "Today, nobody will know who voted for whom."), ok: o => !o.local },
  { id: "maire", t: "day", name: tr("Maire d'un jour", "Mayor for a day"), desc: tr("Aujourd'hui, la voix de {p} compte double au vote.", "Today, {p}'s vote counts double.") },
  { id: "corbeau", t: "day", name: tr("Le corbeau", "The Raven"), desc: tr("Une lettre anonyme accuse {p} : au vote, cette personne part avec une voix contre elle.", "An anonymous letter accuses {p}: they start the vote with one vote against them.") },
  { id: "couvrefeu", t: "day", name: tr("Couvre-feu", "Curfew"), desc: tr("Une minute de débat, pas une de plus : ensuite, on passe au vote.", "One minute of debate, not a second more. Then it's time to vote.") },
  { id: "sort", t: "day", name: tr("Le sort tranche", "Fate decides"), desc: tr("Aujourd'hui, en cas d'égalité, le hasard départage les ex aequo.", "Today, if there's a tie, chance picks between the tied players."), ok: o => !o.local },
  { id: "eclipse", t: "night", name: tr("Éclipse", "Eclipse"), desc: tr("Cette nuit, la voyante ne voit rien.", "Tonight, the Seer sees nothing."), ok: o => o.seer }
];
const CURFEW = 60000;
function evView(id, p, nameOf){ const t = SB.u.byTwist(EVENTS, id); return t ? { name: t.name, desc: t.desc.replace("{p}", p ? nameOf(p) : tr("quelqu'un", "someone")) } : null; }
function evType(id){ const t = SB.u.byTwist(EVENTS, id); return t ? t.t : ""; }

function wolvesFor(n, w){ return w && w !== "auto" ? Math.min(+w, Math.floor((n - 1) / 2)) : n <= 6 ? 1 : n <= 11 ? 2 : 3; }
function deal(ids, specials, w, compo){
  const order = shuffle(ids), roles = {}, nw = wolvesFor(ids.length, w), room = Math.max(0, ids.length - nw - 1);
  const sp = compo === "surprise" ? shuffle(SPECIALS.map(x => x.v)).slice(0, Math.min(room, Math.max(1, Math.round((ids.length - nw) / 2))))
    : SPECIALS.map(x => x.v).filter(v => A(specials).indexOf(v) >= 0).slice(0, room);
  order.forEach((id, i) => { roles[id] = i < nw ? "loup" : sp[i - nw] || "villageois"; });
  return roles;
}
function rn(r, lg){ const x = RNAME[r] || RNAME.villageois; return T(lg, x[0], x[1]); }
function mixed(lov, roles){ const L = A(lov); return L.length === 2 && (roles[L[0]] === "loup") !== (roles[L[1]] === "loup"); }
function winner(alive, roles, lov){
  // Un couple loup + villageois forme un camp à part : tant qu'il vit, seule sa victoire est possible.
  if(mixed(lov, roles) && A(lov).every(id => alive.indexOf(id) >= 0)) return alive.length === 2 ? "amants" : "";
  const w = alive.filter(id => roles[id] === "loup").length;
  if(!w) return "village";
  if(w >= alive.length - w) return "loups";
  return "";
}
function winIds(win, ids, roles, lov){
  const L = A(lov), mx = mixed(L, roles);
  if(win === "amants") return L.slice();
  return ids.filter(id => (win === "loups" ? roles[id] === "loup" : roles[id] !== "loup") && !(mx && L.indexOf(id) >= 0));
}
const WIN_T = { loups: [["Les loups gagnent", "La meute a tout dévoré", "Victoire des loups-garous"], ["The wolves win", "The pack ate everyone", "Werewolf victory"]],
  village: [["Le village gagne", "Le village est sauvé", "Victoire du village"], ["The village wins", "The village is saved", "Village victory"]],
  amants: [["Les amoureux gagnent", "L'amour a triomphé", "Victoire des amoureux"], ["The lovers win", "Love conquers all", "Lovers' victory"]] };
function winT(win, i, lg){ const w = WIN_T[win] || WIN_T.village; return T(lg, w[0][i], w[1][i]); }
function seedOf(str){ let h = 7; String(str).split("").forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; }); return h; }
function compoHTML(roles, compo){
  if(compo === "surprise") return '<p class="sm">' + tr("Composition surprise : même toi, tu ne sais pas quels rôles sont en jeu.", "Surprise lineup: not even you knows which roles are in play.") + "</p>";
  const n = {}; Object.keys(roles).forEach(id => { n[roles[id]] = (n[roles[id]] || 0) + 1; });
  return '<p class="sm">' + tr("En jeu : ", "In play: ") + esc(Object.keys(ROLES).filter(r => n[r]).map(r => (n[r] > 1 ? n[r] + " × " : "") + rn(r)).join(", ")) + "</p>";
}
/* Trophées de fin, tirés des stats de la partie. lg : langue (sinon celle du téléphone).
   Le tirage se fait sur le titre français, pour garder les mêmes trophées quelle que soit la langue. */
function awards(G, ids, nameOf, seed, lg){
  const out = [], E = T(lg, 0, 1) === 1, roles = G.roles || {}, vr = G.vr || {}, vw = G.vw || {}, sus = G.sus || {};
  const P = (fr, en, i) => { const k = (seed + i) % fr.length; return [E ? en[k] : fr[k], fr[k]]; }, add = (t, d) => out.push([t[0], d, t[1]]);
  const fl = ids.filter(id => roles[id] !== "loup" && vw[id]).sort((a, b) => vw[b] - vw[a])[0];
  if(fl) add(P(["Flair d'or", "Nez fin", "Détective du village"], ["Golden nose", "Sharp instincts", "Village detective"], 0), nameOf(fl) + ", " + vw[fl] + (E ? (vw[fl] > 1 ? " votes against wolves" : " vote against a wolf") : (vw[fl] > 1 ? " votes contre des loups" : " vote contre un loup")));
  const wl = ids.filter(id => roles[id] === "loup").sort((a, b) => ((vr[a] || 0) + (sus[a] || 0)) - ((vr[b] || 0) + (sus[b] || 0)))[0], ws = wl ? (vr[wl] || 0) + (sus[wl] || 0) : 0;
  if(wl && G.vr) add(P(["Loup le plus discret", "Loup en peau d'agneau", "Masque parfait"], ["Sneakiest wolf", "Wolf in sheep's clothing", "Perfect poker face"], 1), nameOf(wl) + ", " + (E ? ws + (ws === 1 ? " suspicion" : " suspicions") : ws + " soupçon" + (ws > 1 ? "s" : "")));
  const tt = ids.filter(id => vr[id]).sort((a, b) => vr[b] - vr[a])[0];
  if(tt) add(P(["Bouc émissaire", "Souffre-douleur", "Cible favorite"], ["Scapegoat", "Punching bag", "Favourite target"], 2), nameOf(tt) + ", " + vr[tt] + (E ? (vr[tt] > 1 ? " votes received" : " vote received") : " voix reçue" + (vr[tt] > 1 ? "s" : "")));
  if(G.fd) add(P(["Premier à tomber", "Pas de chance", "Première victime"], ["First to fall", "Bad luck", "First victim"], 3), nameOf(G.fd) + " (" + rn(roles[G.fd], E ? "en" : "fr") + ")");
  const L = A(G.lov);
  if(L.length === 2) add(P(["Coup de foudre", "Les tourtereaux", "Amour fou"], ["Love at first sight", "Lovebirds", "Crazy in love"], 4), nameOf(L[0]) + (E ? " and " : " et ") + nameOf(L[1]) + (mixed(L, roles) ? (E ? ", a forbidden love" : ", un amour interdit") : ""));
  if(G.anc) add(P(["Peau dure", "Increvable", "Coriace"], ["Thick skin", "Unkillable", "Tough as nails"], 5), nameOf(ids.find(id => roles[id] === "ancien") || "") + (E ? " survived the wolves' fangs" : " a survécu aux crocs des loups"));
  return (out.length > 4 ? out.map(x => [seedOf(x[2] + seed), x]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(x => x[1]) : out).map(x => [x[0], x[1]]);
}
function awardsHTML(list){
  return list.length ? '<div class="field"><span class="eyebrow">' + tr("Trophées", "Awards") + '</span><ul class="lg-aw">' + list.map(a => "<li><b>" + esc(a[0]) + "</b>" + esc(a[1]) + "</li>").join("") + "</ul></div>" : "";
}

const CSS = '<style>.lg-night{background:#14162b; color:#e8e9ff; border-radius:18px; padding:20px 18px; display:flex; flex-direction:column; gap:10px}.lg-night .eyebrow{color:#9aa0d6}' +
  '.lg-night .big{color:#fff}.lg-role{font-family:var(--f-hand); font-weight:700; font-size:54px; line-height:1; color:var(--acc)}.lg-role.wolf{color:#d93025}.card.acc .lg-role.wolf{color:#7a0d18}' +
  '.lg-log{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px; font-size:14px; color:var(--muted)}' +
  '.lg-team{display:flex; flex-wrap:wrap; gap:6px}.lg-pot{display:flex; flex-direction:column; gap:8px; background:var(--soft); border-radius:12px; padding:12px}' +
  '.lg-say{font-size:19px; font-weight:700; background:var(--soft); border-left:5px solid var(--acc); border-radius:12px; padding:12px 14px}' +
  '.lg-all{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px}.lg-all li{display:flex; justify-content:space-between; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1.5px solid var(--line); font-weight:700}' +
  '.lg-all li.dead{opacity:.5; text-decoration:line-through}.lg-all li span:last-child{color:var(--muted)}' +
  '.lg-love{background:var(--soft); border:1.5px dashed #ff8fc8; border-radius:12px; padding:10px 12px; font-size:14px}.lg-love b{color:#ff8fc8}' +
  '.lg-cd{margin:-6px 0 12px; font-size:13px; font-weight:700; color:var(--muted)}' +
  '.lg-aw{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.lg-aw li{background:var(--soft); border-radius:12px; padding:8px 12px; font-size:14px}' +
  '.lg-aw b{display:block; font-family:var(--f-disp); font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:var(--tone, var(--acc))}</style>';
function allRolesHTML(ids, roles, alive, nameOf, lov){
  const L = A(lov);
  return '<ul class="lg-all">' + ids.map(id => '<li class="' + (alive.indexOf(id) >= 0 ? "" : "dead") + '"><span>' + esc(nameOf(id)) + (L.indexOf(id) >= 0 ? tr(" · amoureux", " · in love") : "") + "</span><span>" + esc(rn(roles[id])) + "</span></li>").join("") + "</ul>";
}
function choicesHTML(list, nameOf, cur, attr){
  const sel = A(Array.isArray(cur) ? cur : [cur]);
  return '<div class="choices">' + list.map(id => '<button type="button" class="opt" data-' + attr + '="' + esc(id) + '" aria-pressed="' + (sel.indexOf(id) >= 0) + '">' + esc(nameOf(id)) + "</button>").join("") + "</div>";
}
const CAUSE = { loups: ["victime des loups", "killed by the wolves"], poison: ["victime de la sorcière", "poisoned by the Witch"], tir: ["victime du chasseur", "shot by the Hunter"], chagrin: ["victime du chagrin", "died of a broken heart"], vote: ["victime du vote", "voted out"] };
function deathLine(d, roles, reveal, nameOf, lg){
  const c = CAUSE[d.c] || CAUSE.vote;
  return nameOf(d.id) + " · " + T(lg, c[0], c[1]) + (reveal ? " · " + rn(roles[d.id], lg) : "");
}
function loveHTML(me, lov, nameOf){
  const L = A(lov); if(L.length !== 2 || L.indexOf(me) < 0) return "";
  const o = L[0] === me ? L[1] : L[0];
  return '<p class="lg-love">' + tr("<b>Coup de foudre</b> : ton cœur bat pour " + esc(nameOf(o)) + ". Si l'un de vous meurt, l'autre aussi. Pas du même camp ? Votre seule façon de gagner : être les deux derniers en vie.",
    "<b>Love at first sight</b>: your heart beats for " + esc(nameOf(o)) + ". If one of you dies, so does the other. On opposite sides? Your only way to win: be the last two standing.") + "</p>";
}

/* ----- Arbitrage (hôte) ----- */
function W0(s){
  return { alive: A(s.alive).slice(), pot: Object.assign({ heal: true, poison: true }, s.pot), log: A(s.log).slice(), hq: A(s.hq).slice(), deaths: A(s.deaths).slice(), sus: Object.assign({}, s.sus), vis: A(s.vis).slice(),
    lov: A(s.lov).slice(), gLast: s.gLast || "", anc: !!s.anc, vr: Object.assign({}, s.vr), vw: Object.assign({}, s.vw), fd: s.fd || "" };
}
function kill(W, id, c){
  if(W.alive.indexOf(id) < 0) return;
  W.alive = W.alive.filter(x => x !== id);
  W.deaths.push({ id, c });
  if(!W.fd) W.fd = id;
  return id;
}
// Une mort entraîne les autres : chasseur qui tire, amoureux qui meurt de chagrin.
function fall(W, id, c, roles){
  if(!kill(W, id, c)) return;
  if(roles[id] === "chasseur") W.hq.push(id);
  const L = A(W.lov);
  if(L.length === 2 && L.indexOf(id) >= 0) fall(W, L[0] === id ? L[1] : L[0], "chagrin", roles);
}
function settle(c, W){
  // Plus de tir de chasseur en attente : on vérifie si la partie est finie.
  if(!W.hq.length){ const win = winner(W.alive, c.s.roles || {}, W.lov); if(win){ W.phase = "end"; W.win = win; W.k = c.rid(); } }
  c.set(W);
}
function wolfPick(c){
  const s = c.s, roles = s.roles || {}, alive = A(s.alive);
  const picks = alive.filter(id => roles[id] === "loup").map(id => (c.input(id) || {}).w).filter(t => t && alive.indexOf(t) >= 0 && roles[t] !== "loup");
  if(!picks.length) return "";
  const n = {}; picks.forEach(t => { n[t] = (n[t] || 0) + 1; });
  const max = Math.max(...Object.values(n)), top = Object.keys(n).filter(t => n[t] === max);
  return pick(top);
}
function validCu(cu, alive){ const a = A(cu); return a.length === 2 && a[0] !== a[1] && a.every(id => alive.indexOf(id) >= 0); }
function endNight(c, victim){
  const s = c.s, roles = s.roles || {}, alive = A(s.alive), W = W0(s);
  alive.forEach(id => { const x = (c.input(id) || {}).x; if(x) W.sus[x] = (W.sus[x] || 0) + 1; });
  const seer = alive.find(id => roles[id] === "voyante"), sv = seer && s.ev !== "eclipse" && (c.input(seer) || {}).s;
  if(sv) W.vis.push({ n: s.night, w: sv });
  const cup = alive.find(id => roles[id] === "cupidon"), cu = cup && (c.input(cup) || {}).cu;
  if(s.night === 1 && !W.lov.length && validCu(cu, alive)) W.lov = A(cu).slice();
  const sal = alive.find(id => roles[id] === "salvateur"), g = sal && (c.input(sal) || {}).g;
  const guard = g && alive.indexOf(g) >= 0 && g !== s.gLast ? g : "";
  W.gLast = guard;
  if(victim && victim === guard) victim = "";
  if(victim && roles[victim] === "ancien" && !W.anc){ W.anc = true; victim = ""; }
  const witch = alive.find(id => roles[id] === "sorciere");
  if(witch && c.here(witch) && (W.pot.heal || W.pot.poison)){ c.set(Object.assign(W, { phase: "witch", wv: victim, k: c.rid() })); return; }
  dawn(c, Object.assign(W, { wv: victim }), false, "");
}
function dawn(c, W, heal, poison){
  const roles = c.s.roles || {};
  W.deaths = []; W.hq = [];
  if(heal) W.pot.heal = false;
  if(poison) W.pot.poison = false;
  if(W.wv && !heal) fall(W, W.wv, "loups", roles);
  if(poison) fall(W, poison, "poison", roles);
  W.day = (c.s.day || 0) + 1;
  const dl = lg => W.deaths.length ? W.deaths.map(d => deathLine(d, roles, c.s.reveal, c.name, lg)).join(", ") : T(lg, "personne n'est mort", "nobody died");
  W.log.push({ t: "Nuit " + c.s.night + " : " + dl("fr"), en: "Night " + c.s.night + ": " + dl("en") });
  // Événement du jour : on désigne la personne concernée parmi les survivants.
  if(evType(c.s.ev) === "day"){
    if(c.s.ev === "maire" || c.s.ev === "corbeau") W.evP = pick(W.alive);
    if(c.s.ev === "couvrefeu") W.dl = c.now() + CURFEW;
  }
  W.phase = "day"; W.k = c.rid();
  settle(c, W);
}
function shoot(c, target){
  const s = c.s, roles = s.roles || {}, W = W0(s), h = W.hq.shift(), n0 = W.deaths.length;
  if(target && W.alive.indexOf(target) >= 0){
    fall(W, target, "tir", roles);
    const who = lg => W.deaths.slice(n0).map(d => c.name(d.id) + (d.c === "chagrin" ? T(lg, " (victime du chagrin)", " (died of a broken heart)") : "") + (s.reveal ? " · " + rn(roles[d.id], lg) : "")).join(", ");
    W.log.push({ t: c.name(h) + " (chasseur) emporte " + who("fr"), en: c.name(h) + " (Hunter) takes down " + who("en") });
  }
  settle(c, W);
}
function startNight(c){
  const s = c.s, roles = s.roles || {}, alive = A(s.alive), n = (s.night || 0) + 1;
  const t = s.evs && n >= 2 ? SB.u.twist(EVENTS, { rate: 0.4, last: s.evLast, seer: alive.some(id => roles[id] === "voyante"), local: false }) : null;
  c.set({ phase: "night", night: n, deaths: [], hq: [], votes: {}, elim: "", wv: "", lot: false, ev: t ? t.id : "", evP: "", dl: 0, evLast: t ? t.id : s.evLast || "", k: c.rid() });
}
function countVotes(c){
  const s = c.s, alive = A(s.alive), roles = s.roles || {}, votes = {}, n = {};
  alive.forEach(id => { const v = (c.input(id) || {}).v; if(v && alive.indexOf(v) >= 0){ votes[id] = v; n[v] = (n[v] || 0) + (s.ev === "maire" && id === s.evP ? 2 : 1); } });
  if(s.ev === "corbeau" && s.evP && alive.indexOf(s.evP) >= 0) n[s.evP] = (n[s.evP] || 0) + 1;
  const max = Math.max(0, ...Object.values(n)), top = Object.keys(n).filter(t => n[t] === max);
  const W = W0(s); W.deaths = []; W.hq = []; W.votes = s.ev === "secret" ? {} : votes; W.lot = false;
  Object.keys(votes).forEach(id => { const v = votes[id]; W.vr[v] = (W.vr[v] || 0) + 1; if(roles[v] === "loup" && roles[id] !== "loup") W.vw[id] = (W.vw[id] || 0) + 1; });
  W.elim = top.length === 1 ? top[0] : (s.ev === "sort" && top.length > 1 ? (W.lot = true, pick(top)) : "");
  if(W.elim) fall(W, W.elim, "vote", roles);
  const extra = lg => W.deaths.filter(d => d.c === "chagrin").map(d => c.name(d.id) + T(lg, " meurt de chagrin", " dies of a broken heart"));
  const line = lg => (W.elim ? (W.lot ? T(lg, "égalité, le sort désigne ", "tie, fate picks ") : T(lg, "le village élimine ", "the village eliminates ")) + c.name(W.elim) + (s.reveal ? " · " + rn(roles[W.elim], lg) : "") : T(lg, "égalité, personne n'est éliminé", "tie, nobody is eliminated")) + (extra(lg).length ? " · " + extra(lg).join(", ") : "");
  W.log.push({ t: "Jour " + s.day + " : " + line("fr"), en: "Day " + s.day + ": " + line("en") });
  W.phase = "verdict"; W.k = c.rid();
  settle(c, W);
}

const DEF = {
  id: "loupgarou", name: tr("Loup-garou", "Werewolf"), glyph: tr("Ahouu", "Awoo"), pitch: tr("Loups contre villageois, l'appli fait le narrateur.", "Wolves vs villagers, the app is the narrator."), hot: false, ticks: true,
  accent: { light: "#7bd88f", dark: "#7bd88f" },
  tag: tr("Rôles secrets, nuits sanglantes, votes sans pitié. L'appli fait le narrateur : personne n'a besoin d'être meneur.", "Secret roles, bloody nights, ruthless votes. The app narrates, so nobody has to sit out as game master."),
  min: 5, max: 18,
  rules: tr([
    "Chacun découvre son rôle en secret : loup-garou, villageois, ou un rôle spécial.",
    "La nuit, tout le monde touche son écran pour ne pas se trahir. Les loups choisissent une victime ensemble, la voyante découvre le rôle d'un joueur.",
    "La sorcière a deux potions à usage unique : l'une sauve la victime des loups, l'autre empoisonne quelqu'un. Le chasseur emporte quelqu'un avec lui en mourant.",
    "Rôles étendus : Cupidon désigne deux amoureux la première nuit (si l'un meurt, l'autre aussi), le Salvateur protège un joueur chaque nuit, l'Ancien survit à la première attaque des loups.",
    "Composition surprise : l'appli choisit les rôles en jeu, et personne ne sait lesquels.",
    "Événements de village : de temps en temps, un maire dont la voix compte double, la lettre anonyme du corbeau, un couvre-feu, une éclipse qui aveugle la voyante…",
    "Le jour, on débat, puis chacun vote pour éliminer un suspect. En cas d'égalité, personne n'est éliminé.",
    "Les villageois gagnent quand tous les loups sont morts. Les loups gagnent dès qu'ils sont aussi nombreux que les autres joueurs. Un couple d'amoureux loup + villageois gagne s'il est le dernier en vie."
  ], [
    "Everyone secretly gets a role: Werewolf, Villager, or a special role.",
    "At night, everyone taps their screen so nobody gives themselves away. The wolves pick a victim together, and the Seer learns one player's role.",
    "The Witch has two single-use potions: one saves the wolves' victim, the other poisons someone. The Hunter takes someone down with them when they die.",
    "Extra roles: Cupid makes two players fall in love on the first night (if one dies, so does the other), the Bodyguard protects a player every night, and the Elder survives the first wolf attack.",
    "Surprise lineup: the app picks which roles are in play, and nobody knows which.",
    "Village events: every now and then, a mayor whose vote counts double, the Raven's anonymous letter, a curfew, an eclipse that blinds the Seer…",
    "By day, you debate, then everyone votes to eliminate a suspect. If there's a tie, nobody is eliminated.",
    "The villagers win when every wolf is dead. The wolves win as soon as they match the number of other players. A Werewolf + Villager couple wins if they're the last two alive."
  ]),
  options: [
    { id: "wolves", label: tr("Loups-garous", "Werewolves"), type: "seg", def: "auto", values: [{ v: "auto", label: "Auto" }, { v: "1", label: "1" }, { v: "2", label: "2" }, { v: "3", label: "3" }] },
    { id: "compo", label: tr("Composition", "Lineup"), type: "seg", def: "choix", values: [{ v: "choix", label: tr("Au choix", "Pick") }, { v: "surprise", label: tr("Surprise", "Surprise") }] },
    { id: "specials", label: tr("Rôles spéciaux (au choix)", "Special roles (if picking)"), type: "multi", def: ["voyante", "sorciere", "chasseur"], values: SPECIALS },
    { id: "events", label: tr("Événements", "Events"), type: "toggle", text: tr("Événements de village", "Village events"), desc: tr("Maire, corbeau, couvre-feu, éclipse…", "Mayor, Raven, curfew, eclipse…"), def: true },
    { id: "reveal", label: tr("Morts", "Deaths"), type: "toggle", text: tr("Révéler le rôle des morts", "Reveal the dead's roles"), desc: tr("Sinon, tout est révélé à la fin", "Otherwise, everything is revealed at the end"), def: true }
  ],
  start(ctx, o){
    const compo = o.compo === "surprise" ? "surprise" : "choix";
    const roles = deal(ctx.ids, o.specials, o.wolves, compo);
    return { phase: "roles", lg: SB.lang(), roles, compo, alive: ctx.ids.slice(), night: 0, day: 0, pot: { heal: true, poison: true }, reveal: o.reveal !== false, evs: o.events !== false, log: [], deaths: [], hq: [], votes: {}, elim: "", wv: "", sus: {}, vis: [], win: "",
      lov: [], gLast: "", anc: false, vr: {}, vw: {}, fd: "", ev: "", evP: "", evLast: "", dl: 0, lot: false };
  },
  host(ctx){
    const s = ctx.s, roles = s.roles || {}, alive = A(s.alive), live = alive.filter(id => ctx.here(id));
    if(s.phase === "roles"){
      const all = ctx.ids.filter(id => ctx.here(id));
      if(all.length && all.every(id => (ctx.input(id) || {}).ok)) startNight(ctx);
    } else if(s.phase === "night"){
      const wolves = live.filter(id => roles[id] === "loup");
      const wp = wolves.map(id => (ctx.input(id) || {}).w);
      const agreed = !wolves.length || (wp.every(t => t && t === wp[0] && alive.indexOf(t) >= 0));
      const others = live.filter(id => roles[id] !== "loup").every(id => {
        const x = ctx.input(id) || {}, r = roles[id];
        if(r === "voyante" && s.ev !== "eclipse") return x.s && x.sd;
        if(r === "cupidon" && s.night === 1) return validCu(x.cu, alive);
        if(r === "salvateur") return x.g && alive.indexOf(x.g) >= 0 && x.g !== s.gLast;
        return x.x;
      });
      if(agreed && others) endNight(ctx, wolves.length ? wp[0] : "");
    } else if(s.phase === "witch"){
      const witch = alive.find(id => roles[id] === "sorciere"), x = witch ? ctx.input(witch) : null;
      if(!witch || !ctx.here(witch)){ dawn(ctx, Object.assign(W0(s), { wv: s.wv }), false, ""); return; }
      if(x && x.d){
        const pot = Object.assign({ heal: true, poison: true }, s.pot);
        const heal = !!(x.h && pot.heal && s.wv), poison = pot.poison && x.p && alive.indexOf(x.p) >= 0 ? x.p : "";
        dawn(ctx, Object.assign(W0(s), { wv: s.wv }), heal, poison);
      }
    } else if(s.phase === "day" || s.phase === "verdict"){
      const h = A(s.hq)[0];
      if(h){ const x = ctx.input(h); if(x && x.shot) shoot(ctx, x.shot); }
      else if(s.phase === "day" && s.ev === "couvrefeu" && s.dl && ctx.now() >= s.dl) ctx.set({ phase: "vote", votes: {}, k: ctx.rid() });
    } else if(s.phase === "vote"){
      if(live.length && live.every(id => (ctx.input(id) || {}).v)) countVotes(ctx);
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, nameOf = ctx.name, roles = s.roles || {}, alive = A(s.alive), myRole = roles[me] || "villageois";
    const isAlive = alive.indexOf(me) >= 0, mine = ctx.mine() || {};
    const wolves = ctx.ids.filter(id => roles[id] === "loup");
    const vis = A(s.vis);
    const visBox = myRole === "voyante" && vis.length ? "<details><summary>" + tr("Tes visions", "Your visions") + '</summary><ul class="lg-log">' + vis.map(v => "<li>" + tr("Nuit " + v.n + " : " + esc(nameOf(v.w)) + " est " + esc(rn(roles[v.w])), "Night " + v.n + ": " + esc(nameOf(v.w)) + " is the " + esc(rn(roles[v.w]))) + "</li>").join("") + "</ul></details>" : "";
    const logHTML = (A(s.log).length ? "<details><summary>" + tr("Chronique du village", "Village chronicle") + '</summary><ul class="lg-log">' + A(s.log).map(l => "<li>" + esc(tr(l.t, l.en)) + "</li>").join("") + "</ul></details>" : "") + visBox;
    const deadBox = !isAlive && s.phase !== "end" ? '<div class="field"><span class="eyebrow">' + tr("Tu es mort · tu vois tous les rôles. Chut !", "You're dead · you can see every role. Shh!") + "</span>" + allRolesHTML(ctx.ids, roles, alive, nameOf, s.lov) + "</div>" : "";
    const love = isAlive ? loveHTML(me, s.lov, nameOf) : "";
    const hostBtn = (label, attr) => ctx.isHost ? '<button class="link warn" type="button" data-' + attr + ' style="align-self:center">' + label + "</button>" : "";
    const bindHost = (r, attr, fn, armed) => { const b = r.querySelector("[data-" + attr + "]"); if(b) armTap(b, () => ctx.act(fn), armed || tr("Toucher encore pour confirmer", "Tap again to confirm")); };
    const banner = when => s.ev && evType(s.ev) === when ? SB.u.twistHTML(evView(s.ev, s.evP, nameOf), tr("Événement de village", "Village event")) : "";

    if(s.phase === "roles"){
      const ok = !!mine.ok;
      screen(root, "ro" + s.k + ok, CSS + '<div class="card acc"><span class="eyebrow">' + tr("Ton rôle · ne le montre à personne", "Your role · don't show anyone") + '</span><div class="lg-role' + (myRole === "loup" ? " wolf" : "") + '" data-r hidden>' + esc(rn(myRole)) + '</div><p data-d hidden>' + esc(ROLES[myRole].d) + "</p>" +
        (myRole === "loup" && wolves.length > 1 ? '<p data-d hidden>' + tr("Ta meute : ", "Your pack: ") + "<b>" + esc(wolves.filter(id => id !== me).map(nameOf).join(", ")) + "</b></p>" : "") +
        '<button class="btn ghost" type="button" data-eye>' + tr("Voir mon rôle", "Show my role") + "</button></div>" + compoHTML(roles, s.compo) +
        dock(ok ? '<p class="wait" data-wait></p>' : '<button class="btn acc" type="button" data-ok>' + tr("J'ai retenu mon rôle", "Got it, I know my role") + '</button><p class="wait" data-wait></p>'), r => {
        r.querySelector("[data-eye]").addEventListener("click", e => {
          const hid = r.querySelector("[data-r]").hidden;
          r.querySelectorAll("[data-r],[data-d]").forEach(x => { x.hidden = !hid; });
          e.target.textContent = hid ? tr("Cacher", "Hide") : tr("Voir mon rôle", "Show my role");
        });
        const b = r.querySelector("[data-ok]"); if(b) b.addEventListener("click", () => ctx.send({ ok: 1 }));
      });
      const live = ctx.ids.filter(id => ctx.here(id));
      txt(root, "[data-wait]", live.filter(id => (ctx.input(id) || {}).ok).length + " / " + live.length + tr(" prêts", " ready"));
      return;
    }

    if(s.phase === "night"){
      const targets = alive.filter(id => roles[id] !== "loup");
      let act = "", key = "n" + s.k + isAlive;
      if(UI.k !== s.k){ UI.k = s.k; UI.cu = []; }
      if(isAlive && myRole === "loup"){
        const team = alive.filter(id => roles[id] === "loup" && id !== me);
        act = '<span class="eyebrow">' + tr("Loups-garous : choisissez votre victime", "Werewolves: choose your victim") + "</span>" + choicesHTML(targets, nameOf, mine.w, "w") +
          (team.length ? '<div class="field"><span class="eyebrow">' + tr("La meute", "The pack") + '</span><div class="lg-team">' + team.map(id => { const t = (ctx.input(id) || {}).w; return '<span class="chip' + (t ? " ok" : "") + '">' + esc(nameOf(id)) + " → " + esc(t ? nameOf(t) : "…") + "</span>"; }).join("") + "</div><p class=\"sm\">" + tr("Mettez-vous d'accord : vous devez tous choisir la même victime.", "Agree among yourselves: you must all pick the same victim.") + "</p></div>" : "");
        key += JSON.stringify([mine.w, team.map(id => (ctx.input(id) || {}).w)]);
      } else if(isAlive && myRole === "voyante" && s.ev !== "eclipse"){
        act = mine.s ? '<div class="card acc"><span class="eyebrow">' + tr("Ta vision", "Your vision") + '</span><div class="big">' + tr(esc(nameOf(mine.s)) + " est", esc(nameOf(mine.s)) + " is the") + '</div><div class="lg-role' + (roles[mine.s] === "loup" ? " wolf" : "") + '">' + esc(rn(roles[mine.s])) + "</div>" +
            (mine.sd ? '<span class="sm">' + tr("Tu te rendors…", "You drift back to sleep…") + "</span>" : '<button class="btn acc" type="button" data-sd>' + tr("Vu, je me rendors", "Seen it, back to sleep") + "</button>") + "</div>"
          : '<span class="eyebrow">' + tr("Voyante : de qui veux-tu découvrir le rôle ?", "Seer: whose role do you want to see?") + "</span>" + choicesHTML(alive.filter(id => id !== me), nameOf, "", "s");
        key += (mine.s || "") + (mine.sd || "");
      } else if(isAlive && myRole === "cupidon" && s.night === 1){
        const sent = validCu(mine.cu, alive);
        act = sent ? '<div class="card acc"><span class="eyebrow">' + tr("Cupidon", "Cupid") + '</span><div class="big">' + tr("Tes flèches ont touché " + esc(A(mine.cu).map(nameOf).join(" et ")) + ".", "Your arrows hit " + esc(A(mine.cu).map(nameOf).join(" and ")) + ".") + '</div><span class="sm">' + tr("Ils le découvriront au réveil.", "They'll find out when they wake up.") + "</span></div>"
          : '<span class="eyebrow">' + tr("Cupidon : choisis les deux amoureux (", "Cupid: choose the two lovers (") + UI.cu.length + " / 2)</span>" + choicesHTML(alive, nameOf, UI.cu, "cu") +
            (UI.cu.length === 2 ? '<button class="btn acc" type="button" data-cuok>' + tr("Décocher les flèches", "Fire the arrows") + "</button>" : "");
        key += JSON.stringify([mine.cu, UI.cu]);
      } else if(isAlive && myRole === "salvateur"){
        act = mine.g ? '<div class="card acc"><span class="eyebrow">' + tr("Salvateur", "Bodyguard") + '</span><div class="big">' + tr("Tu protèges " + esc(nameOf(mine.g)) + " cette nuit.", "You're protecting " + esc(nameOf(mine.g)) + " tonight.") + "</div></div>"
          : '<span class="eyebrow">' + tr("Salvateur : qui protèges-tu cette nuit ?", "Bodyguard: who are you protecting tonight?") + "</span>" + choicesHTML(alive.filter(id => id !== s.gLast), nameOf, "", "g") + (s.gLast && alive.indexOf(s.gLast) >= 0 ? '<p class="sm">' + tr("Tu ne peux pas protéger " + esc(nameOf(s.gLast)) + " deux nuits de suite : choisis quelqu'un d'autre.", "You can't protect " + esc(nameOf(s.gLast)) + " two nights in a row: pick someone else.") + "</p>" : "");
        key += mine.g || "";
      } else if(isAlive){
        act = (myRole === "voyante" ? '<p class="sm">' + tr("Éclipse : ta boule de cristal reste noire cette nuit.", "Eclipse: your crystal ball stays dark tonight.") + "</p>" : "") + '<span class="eyebrow">' + tr("Qui soupçonnes-tu ? Touche un nom pour ne pas te trahir", "Who do you suspect? Tap a name so you don't give yourself away") + "</span>" + choicesHTML(alive.filter(id => id !== me), nameOf, mine.x, "x");
        key += mine.x || "";
      }
      screen(root, key, CSS + '<div class="lg-night"><span class="eyebrow">' + tr("Nuit ", "Night ") + s.night + '</span><div class="big">' + tr("La nuit tombe sur le village…", "Night falls on the village…") + "</div><p>" + (isAlive ? tr("Tout le monde touche son écran, pour que personne ne se trahisse.", "Everyone taps their screen, so nobody gives themselves away.") : tr("Les vivants agissent dans l'ombre.", "The living act in the shadows.")) + "</p></div>" +
        banner("night") + love + act + deadBox + logHTML + dock('<p class="wait" data-wait></p>' + hostBtn(tr("Forcer la fin de la nuit", "Force the night to end"), "force")), r => {
        const again = () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); };
        r.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => ctx.send({ w: b.dataset.w })));
        r.querySelectorAll("[data-s]").forEach(b => armTap(b, () => ctx.send({ s: b.dataset.s }), tr("Toucher encore : espionner " + nameOf(b.dataset.s) + " ?", "Tap again: spy on " + nameOf(b.dataset.s) + "?")));
        r.querySelectorAll("[data-x]").forEach(b => b.addEventListener("click", () => ctx.send({ x: b.dataset.x })));
        r.querySelectorAll("[data-cu]").forEach(b => b.addEventListener("click", () => { const i = UI.cu.indexOf(b.dataset.cu); if(i >= 0) UI.cu.splice(i, 1); else if(UI.cu.length < 2) UI.cu.push(b.dataset.cu); buzz(8); again(); }));
        const cuok = r.querySelector("[data-cuok]"); if(cuok) armTap(cuok, () => ctx.send({ cu: UI.cu.slice() }), tr("Toucher encore : " + UI.cu.map(nameOf).join(" et ") + " ?", "Tap again: " + UI.cu.map(nameOf).join(" and ") + "?"));
        r.querySelectorAll("[data-g]").forEach(b => armTap(b, () => ctx.send({ g: b.dataset.g }), tr("Toucher encore : protéger " + nameOf(b.dataset.g) + " ?", "Tap again: protect " + nameOf(b.dataset.g) + "?")));
        const sd = r.querySelector("[data-sd]"); if(sd) sd.addEventListener("click", () => ctx.send({ sd: 1 }));
        bindHost(r, "force", c => { if(c.s.phase === "night") endNight(c, wolfPick(c)); }, tr("Toucher encore : les absents ne joueront pas", "Tap again: absent players will be skipped"));
      });
      txt(root, "[data-wait]", tr("Le village dort…", "The village is asleep…"));
      return;
    }

    if(s.phase === "witch"){
      const pot = Object.assign({ heal: true, poison: true }, s.pot), isWitch = isAlive && myRole === "sorciere";
      let body;
      if(isWitch){
        if(mine.d) body = '<p class="wait">' + tr("C'est noté. Le jour va bientôt se lever…", "Noted. Dawn is coming soon…") + "</p>";
        else {
          const W = WI.k === s.k ? WI : (WI.k = s.k, WI.h = false, WI.p = "", WI);
          body = '<div class="card acc"><span class="eyebrow">' + tr("Sorcière", "Witch") + '</span><div class="big">' + (s.wv ? tr("Les loups ont attaqué " + esc(nameOf(s.wv)) + ".", "The wolves attacked " + esc(nameOf(s.wv)) + ".") : tr("Personne n'est en danger cette nuit.", "Nobody is in danger tonight.")) + "</div></div>" +
            (pot.heal && s.wv ? '<div class="packs"><button type="button" class="pack" data-heal aria-pressed="' + W.h + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Potion de vie", "Healing potion") + '</span><span class="ds">' + tr("Sauver ", "Save ") + esc(nameOf(s.wv)) + "</span></span></button></div>" : '<p class="sm">' + (pot.heal ? "" : tr("Potion de vie déjà utilisée.", "Healing potion already used.")) + "</p>") +
            (pot.poison ? '<div class="field"><span class="eyebrow">' + tr("Potion de mort : empoisonner quelqu'un ?", "Death potion: poison someone?") + "</span>" + choicesHTML(alive.filter(id => id !== me), nameOf, W.p, "p") + "</div>" : '<p class="sm">' + tr("Potion de mort déjà utilisée.", "Death potion already used.") + "</p>");
        }
      } else body = isAlive ? '<p class="howto">' + tr("La sorcière se réveille et prépare ses potions… Patiente.", "The Witch wakes up and prepares her potions… Hang tight.") + "</p>" : "";
      screen(root, "wi" + s.k + (isWitch ? JSON.stringify([mine.d, WI.h, WI.p]) : ""), CSS + '<div class="lg-night"><span class="eyebrow">' + tr("Nuit ", "Night ") + s.night + '</span><div class="big">' + tr("La sorcière se réveille…", "The Witch wakes up…") + "</div></div>" + body + deadBox + logHTML +
        dock((isWitch && !mine.d ? '<button class="btn acc" type="button" data-done>' + tr("Valider", "Confirm") + "</button>" : '<p class="wait">' + tr("Le village dort…", "The village is asleep…") + "</p>") + hostBtn(tr("Passer le tour de la sorcière", "Skip the Witch's turn"), "force")), r => {
        const again = () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); };
        const hb = r.querySelector("[data-heal]"); if(hb) hb.addEventListener("click", () => { WI.h = !WI.h; again(); });
        r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { WI.p = WI.p === b.dataset.p ? "" : b.dataset.p; again(); }));
        const d = r.querySelector("[data-done]"); if(d) armTap(d, () => ctx.send({ h: WI.h, p: WI.p, d: 1 }), WI.h || WI.p ? tr("Toucher encore pour confirmer", "Tap again to confirm") : tr("Toucher encore : ne rien faire ?", "Tap again: do nothing?"));
        bindHost(r, "force", c => { if(c.s.phase === "witch") dawn(c, Object.assign(W0(c.s), { wv: c.s.wv }), false, ""); });
      });
      return;
    }

    if(s.phase === "day" || s.phase === "verdict"){
      const hq = A(s.hq), h = hq[0], deaths = A(s.deaths), curfew = s.phase === "day" && s.ev === "couvrefeu" && s.dl;
      const title = s.phase === "day" ? (deaths.length ? tr("Le village se réveille… en deuil.", "The village wakes up… in mourning.") : tr("Le village se réveille. Personne n'est mort cette nuit !", "The village wakes up. Nobody died tonight!"))
        : (s.elim ? (s.lot ? tr("Égalité… le sort a tranché.", "A tie… fate has decided.") : tr("Le village a tranché.", "The village has decided.")) : tr("Égalité : personne n'est éliminé.", "Tie: nobody is eliminated."));
      const votes = s.votes || {};
      let html = CSS + '<span class="eyebrow">' + (s.phase === "day" ? tr("Jour ", "Day ") + s.day : tr("Vote du jour ", "Vote · day ") + s.day) + "</span>" + banner("day") + (curfew && !h ? '<p class="lg-cd" data-cd></p>' : "") +
        '<div class="card acc"><div class="big">' + esc(title) + "</div>" +
        deaths.map(d => '<div><div class="who">' + esc(nameOf(d.id)) + '</div><span class="sm">' + esc(deathLine(d, roles, s.reveal, nameOf).replace(nameOf(d.id) + " · ", "")) + "</span></div>").join("") + "</div>";
      if(s.phase === "verdict" && Object.keys(votes).length) html += "<details><summary>" + tr("Qui a voté contre qui", "Who voted for whom") + '</summary><ul class="lg-log">' + Object.keys(votes).map(v => "<li>" + esc(nameOf(v)) + " → " + esc(nameOf(votes[v])) + "</li>").join("") + "</ul></details>";
      else if(s.phase === "verdict" && s.ev === "secret") html += '<p class="sm">' + tr("Bulletin secret : les votes restent cachés.", "Secret ballot: the votes stay hidden.") + "</p>";
      if(h){
        html += h === me ? '<div class="field"><span class="eyebrow">' + tr("Tu es le chasseur : qui emportes-tu avec toi ?", "You're the Hunter: who are you taking down with you?") + "</span>" + choicesHTML(alive, nameOf, "", "shot") + "</div>"
          : '<p class="howto">' + tr(esc(nameOf(h)) + " était chasseur et choisit qui emporter dans sa tombe…", esc(nameOf(h)) + " was the Hunter and is choosing who to take to the grave…") + "</p>";
      } else if(s.phase === "day") html += '<p class="howto">' + (curfew ? tr("Couvre-feu : débattez vite ! Le vote s'ouvrira tout seul.", "Curfew: debate fast! The vote will open on its own.") : tr("Débattez ! Qui est loup-garou ? Quand vous êtes prêts, l'hôte lance le vote.", "Debate! Who's a werewolf? When you're ready, the host opens the vote.")) + "</p>";
      html += love + deadBox + logHTML;
      const dk = h ? hostBtn(tr("Passer le tir du chasseur", "Skip the Hunter's shot"), "skip") : ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.phase === "day" ? tr("Passer au vote", "Go to the vote") : tr("Passer à la nuit", "On to the night")) + "</button>" : '<p class="wait">' + (s.phase === "day" ? tr("Débat en cours…", "Debate in progress…") : tr("La nuit va tomber…", "Night is about to fall…")) + "</p>";
      screen(root, "d" + s.k + (h || "") + ctx.isHost + isAlive + deaths.length + A(s.lov).length + (s.ev || "") + (s.evP || "") + !!curfew, html + dock(dk), r => {
        r.querySelectorAll("[data-shot]").forEach(b => armTap(b, () => ctx.send({ shot: b.dataset.shot }), tr("Toucher encore : tirer sur " + nameOf(b.dataset.shot) + " ?", "Tap again: shoot " + nameOf(b.dataset.shot) + "?")));
        bindHost(r, "skip", c => { if(A(c.s.hq).length) shoot(c, ""); });
        const n = r.querySelector("[data-next]");
        if(n) n.addEventListener("click", () => ctx.act(c => {
          if(A(c.s.hq).length) return;
          if(c.s.phase === "day") c.set({ phase: "vote", votes: {}, k: c.rid() }); else if(c.s.phase === "verdict") startNight(c);
        }));
      });
      if(curfew){ const r = Math.max(0, s.dl - ctx.now()); txt(root, "[data-cd]", tr("Vote dans ", "Vote in ") + Math.ceil(r / 1000) + " s"); }
      return;
    }

    if(s.phase === "vote"){
      const live = alive.filter(id => ctx.here(id));
      screen(root, "v" + s.k + isAlive + (mine.v || ""), CSS + '<span class="eyebrow">' + tr("Vote du jour ", "Vote · day ") + s.day + "</span>" + banner("day") + '<div class="card acc"><div class="big">' + tr("Qui éliminer ?", "Who gets eliminated?") + '</div><span class="sm">' + (s.ev === "sort" ? tr("Égalité : le sort tranche entre les ex aequo.", "Tie: fate picks between the tied players.") : tr("Égalité : personne ne part.", "Tie: nobody leaves.")) + "</span></div>" +
        (isAlive ? choicesHTML(alive.filter(id => id !== me), nameOf, mine.v, "v") : "") + love + deadBox + logHTML +
        dock('<p class="wait" data-wait></p>' + hostBtn(tr("Dépouiller sans attendre", "Count the votes now"), "force")), r => {
        r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => ctx.send({ v: b.dataset.v })));
        bindHost(r, "force", c => { if(c.s.phase === "vote") countVotes(c); });
      });
      txt(root, "[data-wait]", live.filter(id => (ctx.input(id) || {}).v).length + " / " + live.length + tr(" votes", " votes"));
      return;
    }

    if(s.phase === "end"){
      const sus = s.sus || {}, top = Object.keys(sus).sort((a, b) => sus[b] - sus[a])[0], seed = seedOf(ctx.g.gid || "lg");
      screen(root, "end" + s.k + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Fin de la partie", "Game over") + '</span><div class="who">' + esc(winT(s.win, seed % 3)) + "</div>" +
        '<div class="field"><span class="eyebrow">' + tr("Les rôles", "The roles") + "</span>" + allRolesHTML(ctx.ids, roles, alive, nameOf, s.lov) + "</div>" +
        awardsHTML(awards(s, ctx.ids, nameOf, seed)) +
        (top ? '<p class="sm">' + tr("Le plus soupçonné pendant les nuits : ", "Most suspected during the nights: ") + "<b>" + esc(nameOf(top)) + "</b> (" + esc(rn(roles[top])) + ")</p>" : "") + logHTML +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the lobby") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the lobby.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const ro = c.s.roles || {}, sd = seedOf(c.g.gid || "lg"), L = A(c.s.lov), lg = c.s.lg || "fr", sep = T(lg, " : ", ": ");
          c.end({ title: winT(c.s.win, 2, lg), win: winIds(c.s.win, c.ids, ro, L),
            lines: [T(lg, "Loups", "Wolves") + sep + c.ids.filter(id => ro[id] === "loup").map(c.name).join(", ")].concat(L.length === 2 ? [T(lg, "Amoureux", "Lovers") + sep + L.map(c.name).join(T(lg, " et ", " and "))] : []).concat(awards(c.s, c.ids, c.name, sd, lg).slice(0, 2).map(a => a[0] + sep + a[1])) });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : l'appli aide le meneur de jeu ---------- */
  local: {
    players: { min: 5, max: 18 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id];
      const st = store();
      let sp = Array.isArray(st.lgSpecials) ? st.lgSpecials.slice() : ["voyante", "sorciere", "chasseur"], nw = st.lgWolves || "auto", compo = st.lgCompo === "surprise" ? "surprise" : "choix", evs = st.lgEv !== false;
      let G = null, i = 0, seed = 0;
      const R = id => G.roles[id];
      const roleHolder = r => G.alive.find(id => R(id) === r);
      const allBox = () => "<details><summary>" + tr("Tous les rôles (meneur)", "All roles (narrator)") + "</summary>" + allRolesHTML(ids, G.roles, G.alive, nameOf, G.lov) + "</details>";
      const say = t => '<p class="lg-say">' + tr("« " + esc(t) + " »", "“" + esc(t) + "”") + "</p>";
      const bannerL = when => G.ev && evType(G.ev) === when ? SB.u.twistHTML(evView(G.ev, G.evP, nameOf), tr("Événement de village", "Village event")) : "";
      api.onTick(() => { if(G && G.dl){ const r = Math.max(0, G.dl - Date.now()); txt(root, "[data-cd]", r ? tr("Débat : encore ", "Debate: ") + Math.ceil(r / 1000) + tr(" s", " s left") : tr("Temps écoulé : on vote !", "Time's up: vote now!")); } });
      function pickScreen(key, head, list, onPick, extra){
        screen(root, key, CSS + head + choicesHTML(list, nameOf, "", "p") + (extra || "") + allBox(), r => {
          r.querySelectorAll("[data-p]").forEach(b => armTap(b, () => onPick(b.dataset.p), tr("Toucher encore : " + nameOf(b.dataset.p) + " ?", "Tap again: " + nameOf(b.dataset.p) + "?")));
          const z = r.querySelector("[data-none]"); if(z) z.addEventListener("click", () => onPick(""));
        });
      }
      // Morts en chaîne (amoureux, chasseur). Renvoie la liste des morts.
      function fallL(id, out){
        if(G.alive.indexOf(id) < 0) return out;
        G.alive = G.alive.filter(x => x !== id); out.push(id);
        if(!G.fd) G.fd = id;
        if(R(id) === "chasseur") G.hq.push(id);
        const L = G.lov; if(L.length === 2 && L.indexOf(id) >= 0) fallL(L[0] === id ? L[1] : L[0], out);
        return out;
      }
      const deadTxt = list => list.map(id => nameOf(id) + " (" + rn(R(id)) + ")").join(tr(" et ", " and "));
      function check(next){
        if(G.hq.length){ hunter(next); return; }
        const w = winner(G.alive, G.roles, G.lov);
        if(w){ G.win = w; go("end"); } else next();
      }
      function hunter(next){
        const h = G.hq.shift();
        pickScreen("hu" + h + G.alive.length, CSS + '<span class="eyebrow">' + tr("Chasseur", "Hunter") + "</span>" + say(tr(nameOf(h) + ", tu étais chasseur : qui emportes-tu avec toi ?", nameOf(h) + ", you were the Hunter: who are you taking down with you?")), G.alive, t => {
          const dead = fallL(t, []);
          G.log.push(tr(nameOf(h) + " (chasseur) emporte " + deadTxt(dead), nameOf(h) + " (Hunter) takes down " + deadTxt(dead)));
          screen(root, "hr" + t, CSS + say(tr("Le chasseur emporte " + nameOf(t) + ". Son rôle : " + rn(R(t)) + "." + (dead.length > 1 ? " Par amour, " + deadTxt(dead.slice(1)) + " meurt de chagrin." : ""),
            "The Hunter takes down " + nameOf(t) + ". Their role: " + rn(R(t)) + "." + (dead.length > 1 ? " Out of love, " + deadTxt(dead.slice(1)) + " dies of a broken heart." : ""))) + dock('<button class="btn acc" type="button" data-n>' + tr("Continuer", "Continue") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => check(next)));
        });
      }
      function night(){
        G.night++; G.wv = ""; G.dl = 0; G.evP = "";
        const t = evs && G.night >= 2 ? SB.u.twist(EVENTS, { rate: 0.4, last: G.evLast, seer: !!roleHolder("voyante"), local: true }) : null;
        G.ev = t ? t.id : ""; if(t) G.evLast = t.id;
        screen(root, "n0" + G.night, CSS + '<div class="lg-night"><span class="eyebrow">' + tr("Nuit ", "Night ") + G.night + '</span><div class="big">' + tr("La nuit tombe sur le village…", "Night falls on the village…") + "</div></div>" + bannerL("night") + say(tr("Tout le monde ferme les yeux.", "Everyone, close your eyes.")) + allBox() + dock('<button class="btn acc" type="button" data-n>' + tr("Tout le monde dort", "Everyone's asleep") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", cupidTurn));
      }
      function cupidTurn(){
        const c = roleHolder("cupidon");
        if(G.night !== 1 || !c){ guardTurn(); return; }
        let pk = [];
        const draw = () => screen(root, "nc" + pk.join(), CSS + '<span class="eyebrow">' + tr("Nuit 1 · Cupidon", "Night 1 · Cupid") + "</span>" + say(tr("Cupidon, réveille-toi. Désigne les deux amoureux.", "Cupid, wake up. Point to the two lovers.")) + '<p class="sm">' + tr("Cupidon : ", "Cupid: ") + esc(nameOf(c)) + " · " + pk.length + " / 2</p>" + choicesHTML(G.alive, nameOf, pk, "c") + allBox() +
          dock(pk.length === 2 ? '<button class="btn acc" type="button" data-n>' + tr("Ces deux-là", "These two") + "</button>" : '<p class="wait">' + tr("Touche deux joueurs.", "Tap two players.") + "</p>"), r => {
          r.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => { const x = pk.indexOf(b.dataset.c); if(x >= 0) pk.splice(x, 1); else if(pk.length < 2) pk.push(b.dataset.c); draw(); }));
          const n = r.querySelector("[data-n]"); if(n) n.addEventListener("click", () => {
            G.lov = pk.slice();
            screen(root, "ncl", CSS + say(tr("Cupidon se rendort. Je vais toucher l'épaule des deux amoureux : ouvrez les yeux, regardez-vous, puis refermez-les.", "Cupid goes back to sleep. I'll tap the two lovers on the shoulder: open your eyes, look at each other, then close them again.")) + '<p class="sm">' + tr("Amoureux : ", "Lovers: ") + esc(G.lov.map(nameOf).join(tr(" et ", " and "))) + "</p>" + dock('<button class="btn acc" type="button" data-n>' + tr("Les amoureux se rendorment", "The lovers go back to sleep") + "</button>"), r2 => r2.querySelector("[data-n]").addEventListener("click", guardTurn));
          });
        });
        draw();
      }
      function guardTurn(){
        const g = roleHolder("salvateur");
        if(!g){ G.guard = ""; wolvesTurn(); return; }
        pickScreen("ng" + G.night, CSS + '<span class="eyebrow">' + tr("Nuit " + G.night + " · le salvateur", "Night " + G.night + " · the Bodyguard") + "</span>" + say(tr("Salvateur, réveille-toi. Qui protèges-tu cette nuit ?", "Bodyguard, wake up. Who are you protecting tonight?")) + '<p class="sm">' + tr("Salvateur : ", "Bodyguard: ") + esc(nameOf(g)) + (G.gLast && G.alive.indexOf(G.gLast) >= 0 ? tr(" · interdit cette nuit : " + esc(nameOf(G.gLast)) + " (déjà protégé hier)", " · off-limits tonight: " + esc(nameOf(G.gLast)) + " (protected last night)") : "") + "</p>",
          G.alive.filter(id => id !== G.gLast), t => { G.guard = t; G.gLast = t; wolvesTurn(); });
      }
      function wolvesTurn(){
        const wl = G.alive.filter(id => R(id) === "loup");
        pickScreen("nw" + G.night, CSS + '<span class="eyebrow">' + tr("Nuit " + G.night + " · les loups", "Night " + G.night + " · the wolves") + "</span>" + say(tr("Loups-garous, réveillez-vous et désignez votre victime.", "Werewolves, wake up and point to your victim.")) + '<p class="sm">' + tr("Loups : ", "Wolves: ") + esc(wl.map(nameOf).join(", ")) + "</p>",
          G.alive.filter(id => R(id) !== "loup"), t => {
            G.wv = t;
            if(G.guard && G.guard === t) G.wv = "";
            else if(R(t) === "ancien" && !G.anc){ G.anc = true; G.wv = ""; }
            seerTurn();
          });
      }
      function seerTurn(){
        const v = roleHolder("voyante");
        if(!v){ witchTurn(); return; }
        if(G.ev === "eclipse"){
          screen(root, "nse" + G.night, CSS + '<span class="eyebrow">' + tr("Nuit " + G.night + " · éclipse", "Night " + G.night + " · eclipse") + "</span>" + say(tr("Les loups se rendorment. Éclipse : la voyante ne se réveille pas cette nuit.", "The wolves go back to sleep. Eclipse: the Seer doesn't wake up tonight.")) + dock('<button class="btn acc" type="button" data-n>' + tr("Continuer", "Continue") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", witchTurn));
          return;
        }
        pickScreen("ns" + G.night, CSS + '<span class="eyebrow">' + tr("Nuit " + G.night + " · la voyante", "Night " + G.night + " · the Seer") + "</span>" + say(tr("Les loups se rendorment. Voyante, réveille-toi : de qui veux-tu connaître le rôle ?", "The wolves go back to sleep. Seer, wake up: whose role do you want to know?")) + '<p class="sm">' + tr("Voyante : ", "Seer: ") + esc(nameOf(v)) + "</p>", G.alive.filter(id => id !== v), t => {
          screen(root, "nsr" + G.night, CSS + '<span class="eyebrow">' + tr("Montre l'écran à la voyante", "Show the screen to the Seer") + '</span><div class="card acc"><div class="big">' + tr(esc(nameOf(t)) + " est", esc(nameOf(t)) + " is the") + '</div><div class="lg-role' + (R(t) === "loup" ? " wolf" : "") + '">' + esc(rn(R(t))) + "</div></div>" + dock('<button class="btn acc" type="button" data-n>' + tr("La voyante se rendort", "The Seer goes back to sleep") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", witchTurn));
        });
      }
      function witchTurn(){
        const w = roleHolder("sorciere");
        if(!w || (!G.pot.heal && !G.pot.poison)){ dawn(false, ""); return; }
        let h = false, p = "";
        const draw = () => screen(root, "nwi" + G.night + h + p, CSS + '<span class="eyebrow">' + tr("Nuit " + G.night + " · la sorcière", "Night " + G.night + " · the Witch") + "</span>" + say(tr((roleHolder("voyante") ? "" : "Les loups se rendorment. ") + "Sorcière, réveille-toi. " + (G.wv ? "Cette nuit, les loups ont attaqué " + nameOf(G.wv) + "." + (G.pot.heal ? " Veux-tu utiliser ta potion de vie ?" : "") : "Personne n'est en danger cette nuit.") + (G.pot.poison ? " Veux-tu empoisonner quelqu'un ?" : ""),
            (roleHolder("voyante") ? "" : "The wolves go back to sleep. ") + "Witch, wake up. " + (G.wv ? "Tonight, the wolves attacked " + nameOf(G.wv) + "." + (G.pot.heal ? " Do you want to use your healing potion?" : "") : "Nobody is in danger tonight.") + (G.pot.poison ? " Do you want to poison someone?" : ""))) + '<p class="sm">' + tr("Sorcière : ", "Witch: ") + esc(nameOf(w)) + "</p>" +
          (G.pot.heal && G.wv ? '<div class="packs"><button type="button" class="pack" data-heal aria-pressed="' + h + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Potion de vie", "Healing potion") + '</span><span class="ds">' + tr("Sauver ", "Save ") + esc(nameOf(G.wv)) + "</span></span></button></div>" : '<p class="sm">' + (G.pot.heal ? "" : tr("Potion de vie déjà utilisée.", "Healing potion already used.")) + "</p>") +
          (G.pot.poison ? '<div class="field"><span class="eyebrow">' + tr("Potion de mort", "Death potion") + "</span>" + choicesHTML(G.alive.filter(id => id !== w), nameOf, p, "q") + "</div>" : '<p class="sm">' + tr("Potion de mort déjà utilisée.", "Death potion already used.") + "</p>") +
          dock('<button class="btn acc" type="button" data-n>' + tr("La sorcière se rendort", "The Witch goes back to sleep") + "</button>"), r => {
          const hb = r.querySelector("[data-heal]"); if(hb) hb.addEventListener("click", () => { h = !h; draw(); });
          r.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => { p = p === b.dataset.q ? "" : b.dataset.q; draw(); }));
          r.querySelector("[data-n]").addEventListener("click", () => dawn(h, p));
        });
        draw();
      }
      function dawn(heal, poison){
        const dead = [];
        G.hq = [];
        if(heal) G.pot.heal = false;
        if(poison) G.pot.poison = false;
        if(G.wv && !heal) fallL(G.wv, dead);
        if(poison) fallL(poison, dead);
        G.day++;
        if(evType(G.ev) === "day"){
          if(G.ev === "maire" || G.ev === "corbeau") G.evP = pick(G.alive);
          if(G.ev === "couvrefeu") G.dl = Date.now() + CURFEW;
        }
        G.log.push(tr("Nuit " + G.night + " : ", "Night " + G.night + ": ") + (dead.length ? dead.map(id => nameOf(id) + " · " + rn(R(id))).join(", ") : tr("personne n'est mort", "nobody died")));
        const ev = evView(G.ev, G.evP, nameOf), dayEv = evType(G.ev) === "day";
        screen(root, "dw" + G.day, CSS + '<span class="eyebrow">' + tr("Jour ", "Day ") + G.day + "</span>" + say(tr("Le village se réveille. " + (dead.length ? "Cette nuit, le village a perdu " + deadTxt(dead) + "." : "Personne n'est mort cette nuit !") + (dayEv && ev ? " " + ev.name + " : " + ev.desc : ""),
            "The village wakes up. " + (dead.length ? "Tonight, the village lost " + deadTxt(dead) + "." : "Nobody died tonight!") + (dayEv && ev ? " " + ev.name + ": " + ev.desc : ""))) +
          bannerL("day") + dock('<button class="btn acc" type="button" data-n>' + tr("Continuer", "Continue") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => check(vote)));
      }
      function vote(){
        const ev = evType(G.ev) === "day" ? G.ev : "", tip = ev === "maire" ? '<p class="sm">' + tr("La voix de " + esc(nameOf(G.evP)) + " compte double.", esc(nameOf(G.evP)) + "'s vote counts double.") + "</p>" : ev === "corbeau" ? '<p class="sm">' + tr("Compte une voix de plus contre " + esc(nameOf(G.evP)) + " (corbeau).", "Count one extra vote against " + esc(nameOf(G.evP)) + " (Raven).") + "</p>" : "";
        pickScreen("vo" + G.day, CSS + '<span class="eyebrow">' + tr("Jour " + G.day + " · le vote", "Day " + G.day + " · the vote") + "</span>" + bannerL("day") + (G.dl ? '<p class="lg-cd" data-cd></p>' : "") + say(tr((G.dl ? "Une minute de débat, puis votez à main levée." : "Débattez, puis votez à main levée.") + " Qui le village élimine-t-il ?", (G.dl ? "One minute of debate, then vote by show of hands." : "Debate, then vote by show of hands.") + " Who does the village eliminate?")) + tip, G.alive, t => {
          G.dl = 0;
          if(!t){ G.log.push(tr("Jour " + G.day + " : égalité, personne n'est éliminé", "Day " + G.day + ": tie, nobody is eliminated")); night(); return; }
          G.hq = [];
          const dead = fallL(t, []);
          G.log.push(tr("Jour " + G.day + " : ", "Day " + G.day + ": ") + deadTxt(dead));
          screen(root, "vr" + G.day, CSS + say(tr("Le village chasse " + nameOf(t) + ". Son rôle : " + rn(R(t)) + "." + (dead.length > 1 ? " Par amour, " + deadTxt(dead.slice(1)) + " meurt de chagrin." : ""),
            "The village banishes " + nameOf(t) + ". Their role: " + rn(R(t)) + "." + (dead.length > 1 ? " Out of love, " + deadTxt(dead.slice(1)) + " dies of a broken heart." : ""))) + dock('<button class="btn acc" type="button" data-n>' + tr("Continuer", "Continue") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => check(night)));
        }, '<button class="btn ghost" type="button" data-none>' + tr("Égalité : personne n'est éliminé", "Tie: nobody is eliminated") + "</button>");
      }
      const go = ph => {
        if(ph === "setup"){
          screen(root, "su" + sp.join() + nw + compo + evs, CSS + '<p class="howto">' + tr("Il faut un meneur qui ne joue pas : c'est lui qui garde le téléphone et lit le texte à voix haute. On commence par se passer le téléphone pour découvrir les rôles. Ne mets pas le meneur dans la liste des joueurs.", "You need a narrator who doesn't play: they keep the phone and read the lines out loud. First, pass the phone around so everyone sees their role. Don't put the narrator in the player list.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Loups-garous", "Werewolves") + '</span><div class="seg">' + ["auto", "1", "2", "3"].map(v => '<button type="button" data-w="' + v + '" aria-pressed="' + (v === nw) + '">' + (v === "auto" ? "Auto (" + wolvesFor(names.length, "auto") + ")" : v) + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Composition", "Lineup") + '</span><div class="seg"><button type="button" data-cp="choix" aria-pressed="' + (compo === "choix") + '">' + tr("Au choix", "Pick") + '</button><button type="button" data-cp="surprise" aria-pressed="' + (compo === "surprise") + '">' + tr("Surprise", "Surprise") + "</button></div></div>" +
            (compo === "choix" ? '<div class="field"><span class="eyebrow">' + tr("Rôles spéciaux", "Special roles") + '</span><div class="packs">' + SPECIALS.map(x => '<button type="button" class="pack" data-k="' + x.v + '" aria-pressed="' + (sp.indexOf(x.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(x.label) + '</span><span class="ds">' + esc(x.desc) + "</span></span></button>").join("") + "</div></div>"
              : '<p class="sm">' + tr("L'appli tire les rôles spéciaux au hasard. Seul le meneur saura lesquels sont en jeu.", "The app draws the special roles at random. Only the narrator will know which ones are in play.") + "</p>") +
            '<div class="field"><span class="eyebrow">' + tr("Événements", "Events") + '</span><div class="packs"><button type="button" class="pack" data-ev aria-pressed="' + evs + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Événements de village", "Village events") + '</span><span class="ds">' + tr("Maire, corbeau, couvre-feu, éclipse…", "Mayor, Raven, curfew, eclipse…") + "</span></span></button></div></div>" +
            dock('<button class="btn acc" type="button" data-go>' + tr("Distribuer les rôles", "Deal the roles") + "</button>"), r => {
            r.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => { nw = b.dataset.w; persist({ lgWolves: nw }); go("setup"); }));
            r.querySelectorAll("[data-cp]").forEach(b => b.addEventListener("click", () => { compo = b.dataset.cp; persist({ lgCompo: compo }); go("setup"); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sp.indexOf(b.dataset.k); if(x >= 0) sp.splice(x, 1); else sp.push(b.dataset.k); persist({ lgSpecials: sp }); go("setup"); }));
            r.querySelector("[data-ev]").addEventListener("click", () => { evs = !evs; persist({ lgEv: evs }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => {
              G = { roles: deal(ids, sp, nw, compo), alive: ids.slice(), night: 0, day: 0, pot: { heal: true, poison: true }, hq: [], log: [], wv: "", win: "", lov: [], gLast: "", guard: "", anc: false, fd: "", ev: "", evP: "", evLast: "", dl: 0 };
              seed = seedOf(String(Date.now())); i = 0; go("pass");
            });
          });
        } else if(ph === "pass"){
          screen(root, "pa" + i, '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(names[i]) + "</div><p>" + tr("Les autres, regardez ailleurs.", "Everyone else, look away.") + "</p></div>" + dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi, voir mon rôle", "It's me, show my role") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => go("deal")));
        } else if(ph === "deal"){
          const id = String(i), r0 = R(id), pack = ids.filter(x => R(x) === "loup" && x !== id);
          screen(root, "de" + i, CSS + '<span class="eyebrow">' + esc(names[i]) + '</span><div class="card acc"><span class="eyebrow">' + tr("Ton rôle", "Your role") + '</span><div class="lg-role' + (r0 === "loup" ? " wolf" : "") + '">' + esc(rn(r0)) + "</div><p>" + esc(ROLES[r0].d) + "</p>" + (r0 === "loup" && pack.length ? "<p>" + tr("Ta meute : ", "Your pack: ") + "<b>" + esc(pack.map(nameOf).join(", ")) + "</b></p>" : "") + "</div>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("C'est retenu, cacher", "Got it, hide") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => { i++; if(i < names.length) go("pass"); else go("meneur"); }));
        } else if(ph === "meneur"){
          screen(root, "mj", CSS + '<div class="pass"><span class="eyebrow">' + tr("C'est parti", "Here we go") + '</span><div class="who">' + tr("Au meneur !", "Over to the narrator!") + "</div><p>" + tr("Donne le téléphone au meneur. Il lira le texte à voix haute et notera les choix de chacun.", "Hand the phone to the narrator. They'll read the lines out loud and record everyone's choices.") + "</p></div>" + compoHTML(G.roles, "choix") + dock('<button class="btn acc" type="button" data-n>' + tr("Je suis le meneur", "I'm the narrator") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", night));
        } else if(ph === "end"){
          buzz([40, 60, 40]); G.dl = 0;
          api.win(winIds(G.win, ids, G.roles, G.lov).map(nameOf));
          screen(root, "end", CSS + '<span class="eyebrow">' + tr("Fin de la partie", "Game over") + '</span><div class="who">' + esc(winT(G.win, seed % 3)) + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Les rôles", "The roles") + "</span>" + allRolesHTML(ids, G.roles, G.alive, nameOf, G.lov) + "</div>" + awardsHTML(awards(G, ids, nameOf, seed)) +
            "<details><summary>" + tr("Chronique du village", "Village chronicle") + '</summary><ul class="lg-log">' + G.log.map(l => "<li>" + esc(l) + "</li>").join("") + "</ul></details>" +
            dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go("setup");
    }
  }
};
const WI = { k: "", h: false, p: "" };
const UI = { k: "", cu: [] };
DEF.engine = { deal, winner, winIds, awards, EVENTS, ROLES, endNight, dawn, countVotes, shoot, startNight, W0 };
SB.register(DEF);
})();
