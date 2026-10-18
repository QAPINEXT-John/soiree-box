/* Loup-garou — l'appli distribue les rôles en secret et fait le narrateur : nuit, sorcière, voyante, chasseur, votes.
   Rôles étendus (Cupidon, Salvateur, Ancien), composition surprise et événements de village pour varier les parties.
   Sur un seul téléphone, elle devient l'assistant du meneur de jeu. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, armTap, buzz, pick } = SB.u;

const ROLES = {
  loup: { n: "Loup-garou", camp: "loups", d: "Chaque nuit, avec la meute, tu dévores un villageois. Le jour, fais-toi passer pour un innocent." },
  voyante: { n: "Voyante", camp: "village", d: "Chaque nuit, tu découvres le rôle d'un joueur de ton choix." },
  sorciere: { n: "Sorcière", camp: "village", d: "Une potion de vie pour sauver la victime des loups, une potion de mort pour tuer qui tu veux. Une seule fois chacune." },
  chasseur: { n: "Chasseur", camp: "village", d: "Si tu meurs, de nuit comme de jour, tu emportes immédiatement quelqu'un avec toi." },
  cupidon: { n: "Cupidon", camp: "village", d: "La première nuit, tu lies deux joueurs par un coup de foudre (toi compris si tu veux). Si l'un meurt, l'autre meurt de chagrin." },
  salvateur: { n: "Salvateur", camp: "village", d: "Chaque nuit, tu protèges un joueur de l'attaque des loups, toi compris. Jamais le même deux nuits de suite." },
  ancien: { n: "Ancien", camp: "village", d: "Tu es coriace : tu survis à la première attaque des loups. La deuxième te sera fatale." },
  villageois: { n: "Villageois", camp: "village", d: "Tu n'as pas de pouvoir, juste ton flair. Démasque les loups et élimine-les au vote." }
};
const SPECIALS = [
  { v: "voyante", label: "Voyante", desc: "Découvre un rôle chaque nuit" },
  { v: "sorciere", label: "Sorcière", desc: "Une potion de vie, une potion de mort" },
  { v: "chasseur", label: "Chasseur", desc: "Emporte quelqu'un en mourant" },
  { v: "cupidon", label: "Cupidon", desc: "Lie deux amoureux la première nuit" },
  { v: "salvateur", label: "Salvateur", desc: "Protège un joueur chaque nuit" },
  { v: "ancien", label: "Ancien", desc: "Survit à la première attaque des loups" }
];
/* Événements de village : un par cycle au maximum, jamais deux fois de suite, jamais la première nuit.
   t : "night" (s'applique à la nuit qui commence) ou "day" (annoncé à l'aube, s'applique au vote du jour). */
const EVENTS = [
  { id: "secret", t: "day", name: "Vote à bulletin secret", desc: "Aujourd'hui, personne ne saura qui a voté contre qui.", ok: o => !o.local },
  { id: "maire", t: "day", name: "Maire d'un jour", desc: "Aujourd'hui, la voix de {p} compte double au vote." },
  { id: "corbeau", t: "day", name: "Le corbeau", desc: "Une lettre anonyme accuse {p} : une voix de plus contre cette personne au vote." },
  { id: "couvrefeu", t: "day", name: "Couvre-feu", desc: "Une minute de débat, pas une de plus : le vote s'ouvre tout seul." },
  { id: "sort", t: "day", name: "Le sort tranche", desc: "Aujourd'hui, en cas d'égalité, le sort désigne un des ex aequo.", ok: o => !o.local },
  { id: "eclipse", t: "night", name: "Éclipse", desc: "Cette nuit, la voyante ne voit rien.", ok: o => o.seer }
];
const CURFEW = 60000;
function evView(id, p, nameOf){ const t = SB.u.byTwist(EVENTS, id); return t ? { name: t.name, desc: t.desc.replace("{p}", p ? nameOf(p) : "quelqu'un") } : null; }
function evType(id){ const t = SB.u.byTwist(EVENTS, id); return t ? t.t : ""; }

function wolvesFor(n, w){ return w && w !== "auto" ? Math.min(+w, Math.floor((n - 1) / 2)) : n <= 6 ? 1 : n <= 11 ? 2 : 3; }
function deal(ids, specials, w, compo){
  const order = shuffle(ids), roles = {}, nw = wolvesFor(ids.length, w), room = Math.max(0, ids.length - nw - 1);
  const sp = compo === "surprise" ? shuffle(SPECIALS.map(x => x.v)).slice(0, Math.min(room, Math.max(1, Math.round((ids.length - nw) / 2))))
    : SPECIALS.map(x => x.v).filter(v => A(specials).indexOf(v) >= 0).slice(0, room);
  order.forEach((id, i) => { roles[id] = i < nw ? "loup" : sp[i - nw] || "villageois"; });
  return roles;
}
function rn(r){ return (ROLES[r] || ROLES.villageois).n; }
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
const WIN_T = { loups: ["Les loups gagnent", "La meute a tout dévoré", "Victoire des loups-garous"], village: ["Le village gagne", "Le village est sauvé", "Victoire du village"], amants: ["Les amoureux gagnent", "L'amour a triomphé", "Victoire des amoureux"] };
function seedOf(str){ let h = 7; String(str).split("").forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; }); return h; }
function compoHTML(roles, compo){
  if(compo === "surprise") return '<p class="sm">Composition surprise : même toi, tu ne sais pas quels rôles sont en jeu.</p>';
  const n = {}; Object.keys(roles).forEach(id => { n[roles[id]] = (n[roles[id]] || 0) + 1; });
  return '<p class="sm">En jeu : ' + esc(Object.keys(ROLES).filter(r => n[r]).map(r => (n[r] > 1 ? n[r] + " × " : "") + rn(r)).join(", ")) + "</p>";
}
/* Trophées de fin, tirés des stats de la partie. */
function awards(G, ids, nameOf, seed){
  const out = [], P = (a, i) => a[(seed + i) % a.length], roles = G.roles || {}, vr = G.vr || {}, vw = G.vw || {}, sus = G.sus || {};
  const fl = ids.filter(id => roles[id] !== "loup" && vw[id]).sort((a, b) => vw[b] - vw[a])[0];
  if(fl) out.push([P(["Flair d'or", "Nez fin", "Détective du village"], 0), nameOf(fl) + ", " + vw[fl] + " vote" + (vw[fl] > 1 ? "s" : "") + " contre un loup"]);
  const wl = ids.filter(id => roles[id] === "loup").sort((a, b) => ((vr[a] || 0) + (sus[a] || 0)) - ((vr[b] || 0) + (sus[b] || 0)))[0];
  if(wl && G.vr) out.push([P(["Loup le plus discret", "Loup en peau d'agneau", "Masque parfait"], 1), nameOf(wl) + ", " + ((vr[wl] || 0) + (sus[wl] || 0)) + " soupçon" + ((vr[wl] || 0) + (sus[wl] || 0) > 1 ? "s" : "")]);
  const tt = ids.filter(id => vr[id]).sort((a, b) => vr[b] - vr[a])[0];
  if(tt) out.push([P(["Bouc émissaire", "Tête de turc", "Cible favorite"], 2), nameOf(tt) + ", " + vr[tt] + " voix reçue" + (vr[tt] > 1 ? "s" : "")]);
  if(G.fd) out.push([P(["Premier à tomber", "Pas de chance", "Première victime"], 3), nameOf(G.fd) + " (" + rn(roles[G.fd]) + ")"]);
  const L = A(G.lov);
  if(L.length === 2) out.push([P(["Coup de foudre", "Les tourtereaux", "Amour fou"], 4), nameOf(L[0]) + " et " + nameOf(L[1]) + (mixed(L, roles) ? ", un amour interdit" : "")]);
  if(G.anc) out.push([P(["Peau dure", "Increvable", "Coriace"], 5), nameOf(ids.find(id => roles[id] === "ancien") || "") + " a survécu aux crocs des loups"]);
  return out.length > 4 ? out.map(x => [seedOf(x[0] + seed), x]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(x => x[1]) : out;
}
function awardsHTML(list){
  return list.length ? '<div class="field"><span class="eyebrow">Trophées</span><ul class="lg-aw">' + list.map(a => "<li><b>" + esc(a[0]) + "</b>" + esc(a[1]) + "</li>").join("") + "</ul></div>" : "";
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
  return '<ul class="lg-all">' + ids.map(id => '<li class="' + (alive.indexOf(id) >= 0 ? "" : "dead") + '"><span>' + esc(nameOf(id)) + (L.indexOf(id) >= 0 ? " · amoureux" : "") + "</span><span>" + esc(rn(roles[id])) + "</span></li>").join("") + "</ul>";
}
function choicesHTML(list, nameOf, cur, attr){
  const sel = A(Array.isArray(cur) ? cur : [cur]);
  return '<div class="choices">' + list.map(id => '<button type="button" class="opt" data-' + attr + '="' + esc(id) + '" aria-pressed="' + (sel.indexOf(id) >= 0) + '">' + esc(nameOf(id)) + "</button>").join("") + "</div>";
}
const CAUSE = { loups: "victime des loups", poison: "victime de la sorcière", tir: "victime du chasseur", chagrin: "victime du chagrin", vote: "victime du vote" };
function deathLine(d, roles, reveal, nameOf){
  return nameOf(d.id) + " · " + (CAUSE[d.c] || CAUSE.vote) + (reveal ? " · " + rn(roles[d.id]) : "");
}
function loveHTML(me, lov, nameOf){
  const L = A(lov); if(L.length !== 2 || L.indexOf(me) < 0) return "";
  const o = L[0] === me ? L[1] : L[0];
  return '<p class="lg-love"><b>Coup de foudre</b> : tu es lié à ' + esc(nameOf(o)) + ". Si l'un de vous meurt, l'autre aussi. Pas du même camp ? Votre seule façon de gagner : être les deux derniers en vie.</p>";
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
  W.log.push({ t: "Nuit " + c.s.night + " : " + (W.deaths.length ? W.deaths.map(d => deathLine(d, roles, c.s.reveal, c.name)).join(", ") : "personne n'est mort") });
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
    W.log.push({ t: c.name(h) + " (chasseur) emporte " + W.deaths.slice(n0).map(d => c.name(d.id) + (d.c === "chagrin" ? " (victime du chagrin)" : "") + (s.reveal ? " · " + rn(roles[d.id]) : "")).join(", ") });
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
  const extra = W.deaths.filter(d => d.c === "chagrin").map(d => c.name(d.id) + " meurt de chagrin");
  W.log.push({ t: "Jour " + s.day + " : " + (W.elim ? (W.lot ? "égalité, le sort désigne " : "le village élimine ") + c.name(W.elim) + (s.reveal ? " · " + rn(roles[W.elim]) : "") : "égalité, personne n'est éliminé") + (extra.length ? " · " + extra.join(", ") : "") });
  W.phase = "verdict"; W.k = c.rid();
  settle(c, W);
}

const DEF = {
  id: "loupgarou", name: "Loup-garou", glyph: "Ahouu", pitch: "Loups contre villageois, l'appli fait le narrateur.", hot: false, ticks: true,
  accent: { light: "#7bd88f", dark: "#7bd88f" },
  tag: "Rôles secrets, nuits sanglantes, votes sans pitié. L'appli fait le narrateur : personne n'a besoin d'être meneur.",
  min: 5, max: 18,
  rules: [
    "Chacun découvre son rôle en secret : loup-garou, villageois, ou un rôle spécial.",
    "La nuit, tout le monde touche son écran pour ne pas se trahir. Les loups choisissent une victime ensemble, la voyante espionne un joueur.",
    "La sorcière peut sauver la victime ou empoisonner quelqu'un, une seule fois chacune. Le chasseur emporte quelqu'un en mourant.",
    "Rôles étendus : Cupidon lie deux amoureux la première nuit (si l'un meurt, l'autre aussi), le Salvateur protège un joueur chaque nuit, l'Ancien survit à la première attaque.",
    "Composition surprise : l'appli choisit les rôles en jeu, et personne ne sait lesquels.",
    "Événements de village : certains jours, un maire dont la voix compte double, un corbeau, un couvre-feu, une éclipse qui aveugle la voyante…",
    "Le jour, on débat, puis chacun vote pour éliminer un suspect. Égalité : personne ne part.",
    "Les villageois gagnent quand tous les loups sont morts. Les loups gagnent quand ils sont aussi nombreux que les autres. Un couple loup et villageois gagne s'il reste seul en vie."
  ],
  options: [
    { id: "wolves", label: "Loups-garous", type: "seg", def: "auto", values: [{ v: "auto", label: "Auto" }, { v: "1", label: "1" }, { v: "2", label: "2" }, { v: "3", label: "3" }] },
    { id: "compo", label: "Composition", type: "seg", def: "choix", values: [{ v: "choix", label: "Au choix" }, { v: "surprise", label: "Surprise" }] },
    { id: "specials", label: "Rôles spéciaux (au choix)", type: "multi", def: ["voyante", "sorciere", "chasseur"], values: SPECIALS },
    { id: "events", label: "Événements", type: "toggle", text: "Événements de village", desc: "Maire, corbeau, couvre-feu, éclipse…", def: true },
    { id: "reveal", label: "Morts", type: "toggle", text: "Révéler le rôle des morts", desc: "Sinon, tout est révélé à la fin", def: true }
  ],
  start(ctx, o){
    const compo = o.compo === "surprise" ? "surprise" : "choix";
    const roles = deal(ctx.ids, o.specials, o.wolves, compo);
    return { phase: "roles", roles, compo, alive: ctx.ids.slice(), night: 0, day: 0, pot: { heal: true, poison: true }, reveal: o.reveal !== false, evs: o.events !== false, log: [], deaths: [], hq: [], votes: {}, elim: "", wv: "", sus: {}, vis: [], win: "",
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
    const visBox = myRole === "voyante" && vis.length ? '<details><summary>Tes visions</summary><ul class="lg-log">' + vis.map(v => "<li>Nuit " + v.n + " : " + esc(nameOf(v.w)) + " est " + esc(rn(roles[v.w])) + "</li>").join("") + "</ul></details>" : "";
    const logHTML = (A(s.log).length ? '<details><summary>Chronique du village</summary><ul class="lg-log">' + A(s.log).map(l => "<li>" + esc(l.t) + "</li>").join("") + "</ul></details>" : "") + visBox;
    const deadBox = !isAlive && s.phase !== "end" ? '<div class="field"><span class="eyebrow">Tu es mort · tu vois tous les rôles. Chut !</span>' + allRolesHTML(ctx.ids, roles, alive, nameOf, s.lov) + "</div>" : "";
    const love = isAlive ? loveHTML(me, s.lov, nameOf) : "";
    const hostBtn = (label, attr) => ctx.isHost ? '<button class="link warn" type="button" data-' + attr + ' style="align-self:center">' + label + "</button>" : "";
    const bindHost = (r, attr, fn, armed) => { const b = r.querySelector("[data-" + attr + "]"); if(b) armTap(b, () => ctx.act(fn), armed || "Toucher encore pour confirmer"); };
    const banner = when => s.ev && evType(s.ev) === when ? SB.u.twistHTML(evView(s.ev, s.evP, nameOf), "Événement de village") : "";

    if(s.phase === "roles"){
      const ok = !!mine.ok;
      screen(root, "ro" + s.k + ok, CSS + '<div class="card acc"><span class="eyebrow">Ton rôle · ne le montre à personne</span><div class="lg-role' + (myRole === "loup" ? " wolf" : "") + '" data-r hidden>' + esc(rn(myRole)) + '</div><p data-d hidden>' + esc(ROLES[myRole].d) + "</p>" +
        (myRole === "loup" && wolves.length > 1 ? '<p data-d hidden>Ta meute : <b>' + esc(wolves.filter(id => id !== me).map(nameOf).join(", ")) + "</b></p>" : "") +
        '<button class="btn ghost" type="button" data-eye>Voir mon rôle</button></div>' + compoHTML(roles, s.compo) +
        dock(ok ? '<p class="wait" data-wait></p>' : '<button class="btn acc" type="button" data-ok>J\'ai retenu mon rôle</button><p class="wait" data-wait></p>'), r => {
        r.querySelector("[data-eye]").addEventListener("click", e => {
          const hid = r.querySelector("[data-r]").hidden;
          r.querySelectorAll("[data-r],[data-d]").forEach(x => { x.hidden = !hid; });
          e.target.textContent = hid ? "Cacher" : "Voir mon rôle";
        });
        const b = r.querySelector("[data-ok]"); if(b) b.addEventListener("click", () => ctx.send({ ok: 1 }));
      });
      const live = ctx.ids.filter(id => ctx.here(id));
      txt(root, "[data-wait]", live.filter(id => (ctx.input(id) || {}).ok).length + " / " + live.length + " prêts");
      return;
    }

    if(s.phase === "night"){
      const targets = alive.filter(id => roles[id] !== "loup");
      let act = "", key = "n" + s.k + isAlive;
      if(UI.k !== s.k){ UI.k = s.k; UI.cu = []; }
      if(isAlive && myRole === "loup"){
        const team = alive.filter(id => roles[id] === "loup" && id !== me);
        act = '<span class="eyebrow">Loups-garous : choisissez votre victime</span>' + choicesHTML(targets, nameOf, mine.w, "w") +
          (team.length ? '<div class="field"><span class="eyebrow">La meute</span><div class="lg-team">' + team.map(id => { const t = (ctx.input(id) || {}).w; return '<span class="chip' + (t ? " ok" : "") + '">' + esc(nameOf(id)) + " → " + esc(t ? nameOf(t) : "…") + "</span>"; }).join("") + "</div><p class=\"sm\">Mettez-vous d'accord : il faut la même victime pour tous.</p></div>" : "");
        key += JSON.stringify([mine.w, team.map(id => (ctx.input(id) || {}).w)]);
      } else if(isAlive && myRole === "voyante" && s.ev !== "eclipse"){
        act = mine.s ? '<div class="card acc"><span class="eyebrow">Ta vision</span><div class="big">' + esc(nameOf(mine.s)) + ' est</div><div class="lg-role' + (roles[mine.s] === "loup" ? " wolf" : "") + '">' + esc(rn(roles[mine.s])) + "</div>" +
            (mine.sd ? '<span class="sm">Tu te rendors…</span>' : '<button class="btn acc" type="button" data-sd>J\'ai vu, me rendormir</button>') + "</div>"
          : '<span class="eyebrow">Voyante : de qui veux-tu découvrir le rôle ?</span>' + choicesHTML(alive.filter(id => id !== me), nameOf, "", "s");
        key += (mine.s || "") + (mine.sd || "");
      } else if(isAlive && myRole === "cupidon" && s.night === 1){
        const sent = validCu(mine.cu, alive);
        act = sent ? '<div class="card acc"><span class="eyebrow">Cupidon</span><div class="big">Tes flèches ont touché ' + esc(A(mine.cu).map(nameOf).join(" et ")) + ".</div><span class=\"sm\">Ils le découvriront au réveil.</span></div>"
          : '<span class="eyebrow">Cupidon : touche les deux amoureux (' + UI.cu.length + " / 2)</span>" + choicesHTML(alive, nameOf, UI.cu, "cu") +
            (UI.cu.length === 2 ? '<button class="btn acc" type="button" data-cuok>Décocher les flèches</button>' : "");
        key += JSON.stringify([mine.cu, UI.cu]);
      } else if(isAlive && myRole === "salvateur"){
        act = mine.g ? '<div class="card acc"><span class="eyebrow">Salvateur</span><div class="big">Tu protèges ' + esc(nameOf(mine.g)) + " cette nuit.</div></div>"
          : '<span class="eyebrow">Salvateur : qui protèges-tu cette nuit ?</span>' + choicesHTML(alive.filter(id => id !== s.gLast), nameOf, "", "g") + (s.gLast && alive.indexOf(s.gLast) >= 0 ? '<p class="sm">Pas ' + esc(nameOf(s.gLast)) + ", protégé la nuit dernière : choisis quelqu'un d'autre.</p>" : "");
        key += mine.g || "";
      } else if(isAlive){
        act = (myRole === "voyante" ? '<p class="sm">Éclipse : ta boule de cristal reste noire cette nuit.</p>' : "") + '<span class="eyebrow">Qui soupçonnes-tu ? Touche un nom pour ne pas te trahir</span>' + choicesHTML(alive.filter(id => id !== me), nameOf, mine.x, "x");
        key += mine.x || "";
      }
      screen(root, key, CSS + '<div class="lg-night"><span class="eyebrow">Nuit ' + s.night + '</span><div class="big">La nuit tombe sur le village…</div><p>' + (isAlive ? "Tout le monde touche son écran, pour que personne ne se trahisse." : "Les vivants agissent dans l'ombre.") + "</p></div>" +
        banner("night") + love + act + deadBox + logHTML + dock('<p class="wait" data-wait></p>' + hostBtn("Forcer la fin de la nuit", "force")), r => {
        const again = () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); };
        r.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => ctx.send({ w: b.dataset.w })));
        r.querySelectorAll("[data-s]").forEach(b => armTap(b, () => ctx.send({ s: b.dataset.s }), "Toucher encore : espionner " + nameOf(b.dataset.s) + " ?"));
        r.querySelectorAll("[data-x]").forEach(b => b.addEventListener("click", () => ctx.send({ x: b.dataset.x })));
        r.querySelectorAll("[data-cu]").forEach(b => b.addEventListener("click", () => { const i = UI.cu.indexOf(b.dataset.cu); if(i >= 0) UI.cu.splice(i, 1); else if(UI.cu.length < 2) UI.cu.push(b.dataset.cu); buzz(8); again(); }));
        const cuok = r.querySelector("[data-cuok]"); if(cuok) armTap(cuok, () => ctx.send({ cu: UI.cu.slice() }), "Toucher encore : " + UI.cu.map(nameOf).join(" et ") + " ?");
        r.querySelectorAll("[data-g]").forEach(b => armTap(b, () => ctx.send({ g: b.dataset.g }), "Toucher encore : protéger " + nameOf(b.dataset.g) + " ?"));
        const sd = r.querySelector("[data-sd]"); if(sd) sd.addEventListener("click", () => ctx.send({ sd: 1 }));
        bindHost(r, "force", c => { if(c.s.phase === "night") endNight(c, wolfPick(c)); }, "Toucher encore : les absents ne joueront pas");
      });
      txt(root, "[data-wait]", "Le village dort…");
      return;
    }

    if(s.phase === "witch"){
      const pot = Object.assign({ heal: true, poison: true }, s.pot), isWitch = isAlive && myRole === "sorciere";
      let body;
      if(isWitch){
        if(mine.d) body = '<p class="wait">Tes potions sont prêtes. Le jour va se lever…</p>';
        else {
          const W = WI.k === s.k ? WI : (WI.k = s.k, WI.h = false, WI.p = "", WI);
          body = '<div class="card acc"><span class="eyebrow">Sorcière</span><div class="big">' + (s.wv ? "Les loups ont attaqué " + esc(nameOf(s.wv)) + "." : "Personne n'est en danger cette nuit.") + "</div></div>" +
            (pot.heal && s.wv ? '<div class="packs"><button type="button" class="pack" data-heal aria-pressed="' + W.h + '"><span class="box">✓</span><span class="tx"><span class="nm">Potion de vie</span><span class="ds">Sauver ' + esc(nameOf(s.wv)) + "</span></span></button></div>" : '<p class="sm">' + (pot.heal ? "" : "Potion de vie déjà utilisée.") + "</p>") +
            (pot.poison ? '<div class="field"><span class="eyebrow">Potion de mort : empoisonner quelqu\'un ?</span>' + choicesHTML(alive.filter(id => id !== me), nameOf, W.p, "p") + "</div>" : '<p class="sm">Potion de mort déjà utilisée.</p>');
        }
      } else body = isAlive ? '<p class="howto">La sorcière se réveille et prépare ses potions… Patiente.</p>' : "";
      screen(root, "wi" + s.k + (isWitch ? JSON.stringify([mine.d, WI.h, WI.p]) : ""), CSS + '<div class="lg-night"><span class="eyebrow">Nuit ' + s.night + '</span><div class="big">La sorcière se réveille…</div></div>' + body + deadBox + logHTML +
        dock((isWitch && !mine.d ? '<button class="btn acc" type="button" data-done>Valider</button>' : '<p class="wait">Le village dort…</p>') + hostBtn("Passer la sorcière", "force")), r => {
        const again = () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); };
        const hb = r.querySelector("[data-heal]"); if(hb) hb.addEventListener("click", () => { WI.h = !WI.h; again(); });
        r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { WI.p = WI.p === b.dataset.p ? "" : b.dataset.p; again(); }));
        const d = r.querySelector("[data-done]"); if(d) armTap(d, () => ctx.send({ h: WI.h, p: WI.p, d: 1 }), WI.h || WI.p ? "Toucher encore pour confirmer" : "Toucher encore : ne rien faire ?");
        bindHost(r, "force", c => { if(c.s.phase === "witch") dawn(c, Object.assign(W0(c.s), { wv: c.s.wv }), false, ""); });
      });
      return;
    }

    if(s.phase === "day" || s.phase === "verdict"){
      const hq = A(s.hq), h = hq[0], deaths = A(s.deaths), curfew = s.phase === "day" && s.ev === "couvrefeu" && s.dl;
      const title = s.phase === "day" ? (deaths.length ? "Le village se réveille… en deuil." : "Le village se réveille. Personne n'est mort cette nuit !")
        : (s.elim ? (s.lot ? "Égalité… le sort a tranché." : "Le village a tranché.") : "Égalité : personne n'est éliminé.");
      const votes = s.votes || {};
      let html = CSS + '<span class="eyebrow">' + (s.phase === "day" ? "Jour " + s.day : "Vote du jour " + s.day) + "</span>" + banner("day") + (curfew && !h ? '<p class="lg-cd" data-cd></p>' : "") +
        '<div class="card acc"><div class="big">' + esc(title) + "</div>" +
        deaths.map(d => '<div><div class="who">' + esc(nameOf(d.id)) + '</div><span class="sm">' + esc(deathLine(d, roles, s.reveal, nameOf).replace(nameOf(d.id) + " · ", "")) + "</span></div>").join("") + "</div>";
      if(s.phase === "verdict" && Object.keys(votes).length) html += '<details><summary>Qui a voté quoi</summary><ul class="lg-log">' + Object.keys(votes).map(v => "<li>" + esc(nameOf(v)) + " → " + esc(nameOf(votes[v])) + "</li>").join("") + "</ul></details>";
      else if(s.phase === "verdict" && s.ev === "secret") html += '<p class="sm">Bulletin secret : les votes restent cachés.</p>';
      if(h){
        html += h === me ? '<div class="field"><span class="eyebrow">Tu es le chasseur : qui emportes-tu avec toi ?</span>' + choicesHTML(alive, nameOf, "", "shot") + "</div>"
          : '<p class="howto">' + esc(nameOf(h)) + " était chasseur : il choisit qui il emporte avec lui…</p>";
      } else if(s.phase === "day") html += '<p class="howto">' + (curfew ? "Couvre-feu : vite, débattez ! Le vote s'ouvre tout seul." : "Débattez ! Qui est loup-garou ? Quand vous êtes prêts, l'hôte lance le vote.") + "</p>";
      html += love + deadBox + logHTML;
      const dk = h ? hostBtn("Passer le tir du chasseur", "skip") : ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.phase === "day" ? "Passer au vote" : "La nuit tombe") + "</button>" : '<p class="wait">' + (s.phase === "day" ? "Débat en cours…" : "La nuit va tomber…") + "</p>";
      screen(root, "d" + s.k + (h || "") + ctx.isHost + isAlive + deaths.length + A(s.lov).length + (s.ev || "") + (s.evP || "") + !!curfew, html + dock(dk), r => {
        r.querySelectorAll("[data-shot]").forEach(b => armTap(b, () => ctx.send({ shot: b.dataset.shot }), "Toucher encore : tirer sur " + nameOf(b.dataset.shot) + " ?"));
        bindHost(r, "skip", c => { if(A(c.s.hq).length) shoot(c, ""); });
        const n = r.querySelector("[data-next]");
        if(n) n.addEventListener("click", () => ctx.act(c => {
          if(A(c.s.hq).length) return;
          if(c.s.phase === "day") c.set({ phase: "vote", votes: {}, k: c.rid() }); else if(c.s.phase === "verdict") startNight(c);
        }));
      });
      if(curfew){ const r = Math.max(0, s.dl - ctx.now()); txt(root, "[data-cd]", "Vote dans " + Math.ceil(r / 1000) + " s"); }
      return;
    }

    if(s.phase === "vote"){
      const live = alive.filter(id => ctx.here(id));
      screen(root, "v" + s.k + isAlive + (mine.v || ""), CSS + '<span class="eyebrow">Vote du jour ' + s.day + "</span>" + banner("day") + '<div class="card acc"><div class="big">Qui éliminer ?</div><span class="sm">' + (s.ev === "sort" ? "Égalité : le sort tranche entre les ex aequo." : "Égalité : personne ne part.") + "</span></div>" +
        (isAlive ? choicesHTML(alive.filter(id => id !== me), nameOf, mine.v, "v") : "") + love + deadBox + logHTML +
        dock('<p class="wait" data-wait></p>' + hostBtn("Dépouiller sans attendre", "force")), r => {
        r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => ctx.send({ v: b.dataset.v })));
        bindHost(r, "force", c => { if(c.s.phase === "vote") countVotes(c); });
      });
      txt(root, "[data-wait]", live.filter(id => (ctx.input(id) || {}).v).length + " / " + live.length + " votes");
      return;
    }

    if(s.phase === "end"){
      const sus = s.sus || {}, top = Object.keys(sus).sort((a, b) => sus[b] - sus[a])[0], seed = seedOf(ctx.g.gid || "lg");
      screen(root, "end" + s.k + ctx.isHost, CSS + '<span class="eyebrow">Fin de la partie</span><div class="who">' + esc((WIN_T[s.win] || WIN_T.village)[seed % 3]) + "</div>" +
        '<div class="field"><span class="eyebrow">Les rôles</span>' + allRolesHTML(ctx.ids, roles, alive, nameOf, s.lov) + "</div>" +
        awardsHTML(awards(s, ctx.ids, nameOf, seed)) +
        (top ? '<p class="sm">Le plus soupçonné pendant les nuits : <b>' + esc(nameOf(top)) + "</b> (" + esc(rn(roles[top])) + ")</p>" : "") + logHTML +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const ro = c.s.roles || {}, sd = seedOf(c.g.gid || "lg"), L = A(c.s.lov);
          c.end({ title: (WIN_T[c.s.win] || WIN_T.village)[2], win: winIds(c.s.win, c.ids, ro, L),
            lines: ["Loups : " + c.ids.filter(id => ro[id] === "loup").map(c.name).join(", ")].concat(L.length === 2 ? ["Amoureux : " + L.map(c.name).join(" et ")] : []).concat(awards(c.s, c.ids, c.name, sd).slice(0, 2).map(a => a[0] + " : " + a[1])) });
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
      const allBox = () => '<details><summary>Tous les rôles (meneur)</summary>' + allRolesHTML(ids, G.roles, G.alive, nameOf, G.lov) + "</details>";
      const say = t => '<p class="lg-say">« ' + esc(t) + " »</p>";
      const bannerL = when => G.ev && evType(G.ev) === when ? SB.u.twistHTML(evView(G.ev, G.evP, nameOf), "Événement de village") : "";
      api.onTick(() => { if(G && G.dl){ const r = Math.max(0, G.dl - Date.now()); txt(root, "[data-cd]", r ? "Débat : encore " + Math.ceil(r / 1000) + " s" : "Temps écoulé : on vote !"); } });
      function pickScreen(key, head, list, onPick, extra){
        screen(root, key, CSS + head + choicesHTML(list, nameOf, "", "p") + (extra || "") + allBox(), r => {
          r.querySelectorAll("[data-p]").forEach(b => armTap(b, () => onPick(b.dataset.p), "Toucher encore : " + nameOf(b.dataset.p) + " ?"));
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
      const deadTxt = list => list.map(id => nameOf(id) + " (" + rn(R(id)) + ")").join(" et ");
      function check(next){
        if(G.hq.length){ hunter(next); return; }
        const w = winner(G.alive, G.roles, G.lov);
        if(w){ G.win = w; go("end"); } else next();
      }
      function hunter(next){
        const h = G.hq.shift();
        pickScreen("hu" + h + G.alive.length, CSS + '<span class="eyebrow">Chasseur</span>' + say(nameOf(h) + " était chasseur. Qui emportes-tu avec toi ?"), G.alive, t => {
          const dead = fallL(t, []);
          G.log.push(nameOf(h) + " (chasseur) emporte " + deadTxt(dead));
          screen(root, "hr" + t, CSS + say("Le chasseur emporte " + nameOf(t) + ". Son rôle : " + rn(R(t)) + "." + (dead.length > 1 ? " Par amour, " + deadTxt(dead.slice(1)) + " meurt de chagrin." : "")) + dock('<button class="btn acc" type="button" data-n>Continuer</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => check(next)));
        });
      }
      function night(){
        G.night++; G.wv = ""; G.dl = 0; G.evP = "";
        const t = evs && G.night >= 2 ? SB.u.twist(EVENTS, { rate: 0.4, last: G.evLast, seer: !!roleHolder("voyante"), local: true }) : null;
        G.ev = t ? t.id : ""; if(t) G.evLast = t.id;
        screen(root, "n0" + G.night, CSS + '<div class="lg-night"><span class="eyebrow">Nuit ' + G.night + '</span><div class="big">La nuit tombe sur le village…</div></div>' + bannerL("night") + say("Tout le monde ferme les yeux.") + allBox() + dock('<button class="btn acc" type="button" data-n>Tout le monde dort</button>'), r => r.querySelector("[data-n]").addEventListener("click", cupidTurn));
      }
      function cupidTurn(){
        const c = roleHolder("cupidon");
        if(G.night !== 1 || !c){ guardTurn(); return; }
        let pk = [];
        const draw = () => screen(root, "nc" + pk.join(), CSS + '<span class="eyebrow">Nuit 1 · Cupidon</span>' + say("Cupidon, réveille-toi. Désigne les deux amoureux.") + '<p class="sm">Cupidon : ' + esc(nameOf(c)) + " · " + pk.length + " / 2</p>" + choicesHTML(G.alive, nameOf, pk, "c") + allBox() +
          dock(pk.length === 2 ? '<button class="btn acc" type="button" data-n>Ces deux-là</button>' : '<p class="wait">Touche deux joueurs.</p>'), r => {
          r.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => { const x = pk.indexOf(b.dataset.c); if(x >= 0) pk.splice(x, 1); else if(pk.length < 2) pk.push(b.dataset.c); draw(); }));
          const n = r.querySelector("[data-n]"); if(n) n.addEventListener("click", () => {
            G.lov = pk.slice();
            screen(root, "ncl", CSS + say("Cupidon se rendort. Je vais toucher l'épaule des deux amoureux : ouvrez les yeux, regardez-vous, puis refermez-les.") + '<p class="sm">Amoureux : ' + esc(G.lov.map(nameOf).join(" et ")) + "</p>" + dock('<button class="btn acc" type="button" data-n>Les amoureux se rendorment</button>'), r2 => r2.querySelector("[data-n]").addEventListener("click", guardTurn));
          });
        });
        draw();
      }
      function guardTurn(){
        const g = roleHolder("salvateur");
        if(!g){ G.guard = ""; wolvesTurn(); return; }
        pickScreen("ng" + G.night, CSS + '<span class="eyebrow">Nuit ' + G.night + " · le salvateur</span>" + say("Salvateur, réveille-toi. Qui protèges-tu cette nuit ?") + '<p class="sm">Salvateur : ' + esc(nameOf(g)) + (G.gLast && G.alive.indexOf(G.gLast) >= 0 ? " · pas " + esc(nameOf(G.gLast)) + ", protégé la nuit dernière" : "") + "</p>",
          G.alive.filter(id => id !== G.gLast), t => { G.guard = t; G.gLast = t; wolvesTurn(); });
      }
      function wolvesTurn(){
        const wl = G.alive.filter(id => R(id) === "loup");
        pickScreen("nw" + G.night, CSS + '<span class="eyebrow">Nuit ' + G.night + " · les loups</span>" + say("Loups-garous, réveillez-vous et désignez votre victime.") + '<p class="sm">Loups : ' + esc(wl.map(nameOf).join(", ")) + "</p>",
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
          screen(root, "nse" + G.night, CSS + '<span class="eyebrow">Nuit ' + G.night + " · éclipse</span>" + say("Éclipse : la voyante ne se réveille pas cette nuit.") + dock('<button class="btn acc" type="button" data-n>Continuer</button>'), r => r.querySelector("[data-n]").addEventListener("click", witchTurn));
          return;
        }
        pickScreen("ns" + G.night, CSS + '<span class="eyebrow">Nuit ' + G.night + " · la voyante</span>" + say("Les loups se rendorment. Voyante, réveille-toi : de qui veux-tu connaître le rôle ?") + '<p class="sm">Voyante : ' + esc(nameOf(v)) + "</p>", G.alive.filter(id => id !== v), t => {
          screen(root, "nsr" + G.night, CSS + '<span class="eyebrow">Montre l\'écran à la voyante</span><div class="card acc"><div class="big">' + esc(nameOf(t)) + ' est</div><div class="lg-role' + (R(t) === "loup" ? " wolf" : "") + '">' + esc(rn(R(t))) + "</div></div>" + dock('<button class="btn acc" type="button" data-n>La voyante se rendort</button>'), r => r.querySelector("[data-n]").addEventListener("click", witchTurn));
        });
      }
      function witchTurn(){
        const w = roleHolder("sorciere");
        if(!w || (!G.pot.heal && !G.pot.poison)){ dawn(false, ""); return; }
        let h = false, p = "";
        const draw = () => screen(root, "nwi" + G.night + h + p, CSS + '<span class="eyebrow">Nuit ' + G.night + " · la sorcière</span>" + say("Sorcière, réveille-toi. " + (G.wv ? "Cette nuit, les loups ont attaqué " + nameOf(G.wv) + ". Veux-tu utiliser ta potion de vie ?" : "Personne n'est en danger cette nuit.") + " Veux-tu empoisonner quelqu'un ?") + '<p class="sm">Sorcière : ' + esc(nameOf(w)) + "</p>" +
          (G.pot.heal && G.wv ? '<div class="packs"><button type="button" class="pack" data-heal aria-pressed="' + h + '"><span class="box">✓</span><span class="tx"><span class="nm">Potion de vie</span><span class="ds">Sauver ' + esc(nameOf(G.wv)) + "</span></span></button></div>" : '<p class="sm">' + (G.pot.heal ? "" : "Potion de vie déjà utilisée.") + "</p>") +
          (G.pot.poison ? '<div class="field"><span class="eyebrow">Potion de mort</span>' + choicesHTML(G.alive.filter(id => id !== w), nameOf, p, "q") + "</div>" : '<p class="sm">Potion de mort déjà utilisée.</p>') +
          dock('<button class="btn acc" type="button" data-n>La sorcière se rendort</button>'), r => {
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
        G.log.push("Nuit " + G.night + " : " + (dead.length ? dead.map(id => nameOf(id) + " · " + rn(R(id))).join(", ") : "personne"));
        const ev = evView(G.ev, G.evP, nameOf), dayEv = evType(G.ev) === "day";
        screen(root, "dw" + G.day, CSS + '<span class="eyebrow">Jour ' + G.day + "</span>" + say("Le village se réveille. " + (dead.length ? "Cette nuit, le village a perdu " + deadTxt(dead) + "." : "Personne n'est mort cette nuit !") + (dayEv && ev ? " " + ev.name + " : " + ev.desc : "")) +
          bannerL("day") + dock('<button class="btn acc" type="button" data-n>Continuer</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => check(vote)));
      }
      function vote(){
        const ev = evType(G.ev) === "day" ? G.ev : "", tip = ev === "maire" ? '<p class="sm">Compte double la voix de ' + esc(nameOf(G.evP)) + ".</p>" : ev === "corbeau" ? '<p class="sm">Ajoute une voix contre ' + esc(nameOf(G.evP)) + ".</p>" : "";
        pickScreen("vo" + G.day, CSS + '<span class="eyebrow">Jour ' + G.day + " · le vote</span>" + bannerL("day") + (G.dl ? '<p class="lg-cd" data-cd></p>' : "") + say((G.dl ? "Une minute de débat, puis votez à main levée." : "Débattez, puis votez à main levée.") + " Qui le village élimine-t-il ?") + tip, G.alive, t => {
          G.dl = 0;
          if(!t){ G.log.push("Jour " + G.day + " : égalité"); night(); return; }
          G.hq = [];
          const dead = fallL(t, []);
          G.log.push("Jour " + G.day + " : " + deadTxt(dead));
          screen(root, "vr" + G.day, CSS + say("Le village chasse " + nameOf(t) + ". Son rôle : " + rn(R(t)) + "." + (dead.length > 1 ? " Par amour, " + deadTxt(dead.slice(1)) + " meurt de chagrin." : "")) + dock('<button class="btn acc" type="button" data-n>Continuer</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => check(night)));
        }, '<button class="btn ghost" type="button" data-none>Égalité : personne</button>');
      }
      const go = ph => {
        if(ph === "setup"){
          screen(root, "su" + sp.join() + nw + compo + evs, CSS + '<p class="howto">Il faut un meneur qui ne joue pas : c\'est lui qui garde le téléphone et lit le texte à voix haute. On commence par se passer le téléphone pour découvrir les rôles. Ne mets pas le meneur dans la liste des joueurs.</p>' +
            '<div class="field"><span class="eyebrow">Loups-garous</span><div class="seg">' + ["auto", "1", "2", "3"].map(v => '<button type="button" data-w="' + v + '" aria-pressed="' + (v === nw) + '">' + (v === "auto" ? "Auto (" + wolvesFor(names.length, "auto") + ")" : v) + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Composition</span><div class="seg"><button type="button" data-cp="choix" aria-pressed="' + (compo === "choix") + '">Au choix</button><button type="button" data-cp="surprise" aria-pressed="' + (compo === "surprise") + '">Surprise</button></div></div>' +
            (compo === "choix" ? '<div class="field"><span class="eyebrow">Rôles spéciaux</span><div class="packs">' + SPECIALS.map(x => '<button type="button" class="pack" data-k="' + x.v + '" aria-pressed="' + (sp.indexOf(x.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(x.label) + '</span><span class="ds">' + esc(x.desc) + "</span></span></button>").join("") + "</div></div>"
              : '<p class="sm">L\'appli tire les rôles spéciaux au hasard. Seul le meneur saura lesquels sont en jeu.</p>') +
            '<div class="field"><span class="eyebrow">Événements</span><div class="packs"><button type="button" class="pack" data-ev aria-pressed="' + evs + '"><span class="box">✓</span><span class="tx"><span class="nm">Événements de village</span><span class="ds">Maire, corbeau, couvre-feu, éclipse…</span></span></button></div></div>' +
            dock('<button class="btn acc" type="button" data-go>Distribuer les rôles</button>'), r => {
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
          screen(root, "pa" + i, '<div class="pass"><span class="eyebrow">Passe le téléphone à</span><div class="who">' + esc(names[i]) + "</div><p>Les autres, regardez ailleurs.</p></div>" + dock('<button class="btn acc" type="button" data-n>C\'est moi, voir mon rôle</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => go("deal")));
        } else if(ph === "deal"){
          const id = String(i), r0 = R(id), pack = ids.filter(x => R(x) === "loup" && x !== id);
          screen(root, "de" + i, CSS + '<span class="eyebrow">' + esc(names[i]) + '</span><div class="card acc"><span class="eyebrow">Ton rôle</span><div class="lg-role' + (r0 === "loup" ? " wolf" : "") + '">' + esc(rn(r0)) + "</div><p>" + esc(ROLES[r0].d) + "</p>" + (r0 === "loup" && pack.length ? "<p>Ta meute : <b>" + esc(pack.map(nameOf).join(", ")) + "</b></p>" : "") + "</div>" +
            dock('<button class="btn acc" type="button" data-n>J\'ai retenu, cacher</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => { i++; if(i < names.length) go("pass"); else go("meneur"); }));
        } else if(ph === "meneur"){
          screen(root, "mj", CSS + '<div class="pass"><span class="eyebrow">C\'est parti</span><div class="who">Au meneur !</div><p>Donne le téléphone au meneur. Il lira le texte à voix haute et notera les choix de chacun.</p></div>' + compoHTML(G.roles, "choix") + dock('<button class="btn acc" type="button" data-n>Je suis le meneur</button>'), r => r.querySelector("[data-n]").addEventListener("click", night));
        } else if(ph === "end"){
          buzz([40, 60, 40]); G.dl = 0;
          api.win(winIds(G.win, ids, G.roles, G.lov).map(nameOf));
          screen(root, "end", CSS + '<span class="eyebrow">Fin de la partie</span><div class="who">' + esc((WIN_T[G.win] || WIN_T.village)[seed % 3]) + "</div>" +
            '<div class="field"><span class="eyebrow">Les rôles</span>' + allRolesHTML(ids, G.roles, G.alive, nameOf, G.lov) + "</div>" + awardsHTML(awards(G, ids, nameOf, seed)) +
            '<details><summary>Chronique du village</summary><ul class="lg-log">' + G.log.map(l => "<li>" + esc(l) + "</li>").join("") + "</ul></details>" +
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
const WI = { k: "", h: false, p: "" };
const UI = { k: "", cu: [] };
DEF.engine = { deal, winner, winIds, awards, EVENTS, ROLES, endNight, dawn, countVotes, shoot, startNight, W0 };
SB.register(DEF);
})();
