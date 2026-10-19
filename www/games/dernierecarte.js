/* Dernière carte — le jeu de cartes des couleurs : même couleur ou même valeur, +2, +4, inversion, passe-tour,
   et n'oublie pas de crier « Dernière ! » quand il te reste une carte. En réseau, ou sur un téléphone contre des robots. */
(function(){
"use strict";
const { esc, A, shuffle, screen, store, persist, dock, buzz, tr } = SB.u;
// Textes du moteur (journal de la partie) : dans la langue de la partie (E.lg = langue de l'hôte, ou du téléphone en solo).
const L = (E, fr, en) => E && E.lg === "en" ? en : fr;

/* ---------- Cartes ----------
   Une carte = couleur + valeur : "r7", "gS" (passe), "bR" (inversion), "yD" (+2), "wW" (joker), "wF" (+4). */
const COLS = ["r", "y", "g", "b"];
const CN_FR = { r: "rouge", y: "jaune", g: "vert", b: "bleu" }, CN_EN = { r: "red", y: "yellow", g: "green", b: "blue" };
const CNAME = tr(CN_FR, CN_EN); // langue du téléphone (interface)
const CNAME_F = { r: "rouge", y: "jaune", g: "verte", b: "bleue" }; // accord avec « Inversion »
const cname = (E, k) => L(E, CN_FR, CN_EN)[k]; // langue de la partie (journal)
const CHEX = { r: "#e0393e", y: "#f2a900", g: "#22964a", b: "#1f6fd6" };
const col = c => c[0], val = c => c.slice(1), wild = c => c[0] === "w";
function newDeck(){
  const d = [];
  COLS.forEach(c => { d.push(c + "0"); for(let v = 1; v <= 9; v++) d.push(c + v, c + v); ["S", "R", "D"].forEach(x => d.push(c + x, c + x)); });
  for(let i = 0; i < 4; i++) d.push("wW", "wF");
  return shuffle(d);
}
function glyph(c){ const v = val(c); return v === "S" ? "⊘" : v === "R" ? "⇄" : v === "D" ? "+2" : v === "F" ? "+4" : v === "W" ? "★" : v; }
// lg : "fr" / "en" (journal de la partie) ; sans lg, langue du téléphone.
function label(c, lg){
  const v = val(c);
  if((lg || SB.lang()) === "en"){
    const e = v === "S" ? "Skip" : v === "R" ? "Reverse" : v === "D" ? "+2" : v === "F" ? "Wild +4" : v === "W" ? "Wild" : v;
    return wild(c) ? e : CN_EN[col(c)] + " " + e;
  }
  const n = v === "S" ? "Passe-tour" : v === "R" ? "Inversion" : v === "D" ? "+2" : v === "F" ? "+4" : v === "W" ? "Joker" : v;
  return wild(c) ? n : n + " " + (v === "R" ? CNAME_F : CN_FR)[col(c)];
}
function points(c){ const v = val(c); return /^\d$/.test(v) ? +v : wild(c) ? 50 : 20; }
function order(cards){
  const rk = c => COLS.concat("w").indexOf(col(c)) * 100 + ("0123456789SRDWF".indexOf(val(c)));
  return cards.map((c, i) => ({ c, i })).sort((a, b) => rk(a.c) - rk(b.c));
}

/* ---------- Moteur commun (réseau et un seul téléphone) ----------
   E = { order, hands, draw, disc, top, color, turn, dir, pend, drew, called, stack, round, rounds, score, phase, winner, gain, log,
         sz (sept-zéro), jump (interception), dp (pioche jusqu'à pouvoir jouer), tw (coups de théâtre),
         tc (tours joués), evAt, ev, evn, evt, evx, ban, banTo, dbl, dblTo, extra, st (stats par joueur), aw (trophées) } */
const rnd = n => Math.floor(Math.random() * n);
function stat(E, id, k, n){ const S = E.st = E.st || {}; const o = S[id] = Object.assign({}, S[id]); o[k] = (o[k] || 0) + (n == null ? 1 : n); S[id] = o; }
function draw1(E){
  if(!E.draw.length){ E.draw = shuffle(E.disc); E.disc = []; }
  return E.draw.pop() || null;
}
function give(E, id, n, pen){
  const h = E.hands[id]; let got = 0;
  for(let i = 0; i < n; i++){ const c = draw1(E); if(c){ h.push(c); got++; } }
  if(h.length > 1) E.called[id] = false;
  E.dc = (E.dc || 0) + 1; E.dby = id; E.dn = n; // pour l'animation de pioche
  stat(E, id, "dr", got); if(pen) stat(E, id, "pen", got);
}
function nextFrom(E, from, steps){
  const n = E.order.length, i = E.order.indexOf(from);
  return E.order[(((i + E.dir * steps) % n) + n) % n];
}
function nextOf(E, steps){ return nextFrom(E, E.turn, steps); }
const dur = E => Math.max(E.order.length, 3);
function newRound(E){
  E.draw = newDeck(); E.disc = []; E.hands = {}; E.called = {};
  E.order.forEach(id => { E.hands[id] = []; for(let i = 0; i < 7; i++) E.hands[id].push(E.draw.pop()); });
  let c = E.draw.pop();
  while(!/^\d$/.test(val(c))){ E.draw.unshift(c); c = E.draw.pop(); }
  E.top = c; E.color = col(c);
  E.turn = E.order[(E.round - 1) % E.order.length]; E.dir = 1; E.pend = 0; E.drew = false;
  E.phase = "play"; E.winner = ""; E.gain = 0; E.log = L(E, "Manche " + E.round + " : c'est parti !", "Round " + E.round + ": let's go!");
  E.tc = 0; E.stuck = 0; E.evAt = 5 + rnd(4); E.evt = -99; E.ban = ""; E.banTo = 0; E.dbl = false; E.dblTo = 0; E.extra = "";
  E.st = E.st || {}; E.aw = [];
}
function canPlay(E, c){
  if(E.ban && !wild(c) && col(c) === E.ban) return false;
  if(E.pend > 0){ if(!E.stack) return false; return val(c) === "F" || (val(c) === "D" && val(E.top) === "D"); }
  return wild(c) || col(c) === E.color || val(c) === val(E.top);
}
function playable(E, id){
  const h = E.hands[id] || [];
  return h.map((c, i) => (E.drew ? i === h.length - 1 : true) && canPlay(E, c));
}
/* Interception : poser hors de son tour une carte identique à celle du dessus. */
function canJump(E, id, i){
  const c = (E.hands[id] || [])[i];
  return !!(E.jump && E.phase === "play" && E.turn !== id && !E.pend && c && !wild(c) && c === E.top && !(E.ban && col(c) === E.ban));
}
function jumpable(E, id){ return (E.hands[id] || []).map((c, i) => canJump(E, id, i)); }

/* ---------- Coups de théâtre (au milieu d'une manche, environ tous les 8 tours) ---------- */
const EVENTS = [
  { id: "pluie", name: tr("Pluie de cartes", "Card shower"), ok: o => o.E.draw.length + o.E.disc.length >= o.E.order.length + 2 },
  { id: "sens", name: tr("Demi-tour", "U-turn"), ok: o => o.E.order.length > 2 },
  { id: "voisin", name: tr("Mains échangées", "Hand swap") },
  { id: "interdit", name: tr("Couleur interdite", "Banned colour") },
  { id: "double", name: tr("Double tour", "Double turn") },
  { id: "x2", name: tr("Pénalités doublées", "Double penalties") },
  { id: "pouce", name: tr("Coup de pouce", "Helping hand"), ok: o => o.E.order.some(id => o.E.hands[id].length >= 5) }
];
const pickTwist = (list, o) => (SB.u.twist ? SB.u.twist(list, o) : null);
function evInfo(E, nameOf){
  const n = dur(E);
  switch(E.ev){
    case "pluie": return { name: tr("Pluie de cartes", "Card shower"), desc: tr("Tout le monde pioche une carte.", "Everyone draws a card.") };
    case "sens": return { name: tr("Demi-tour", "U-turn"), desc: tr("Le sens du jeu s'inverse.", "The direction of play reverses.") };
    case "voisin": return { name: tr("Mains échangées", "Hand swap"), desc: tr("Chacun passe sa main à son voisin, dans le sens du jeu.", "Everyone passes their hand to the next player, in the direction of play.") };
    case "interdit": return { name: tr("Couleur interdite", "Banned colour"), desc: tr("Pendant " + n + " tours, interdit de jouer du " + CNAME[E.evx] + ", même en le choisissant avec un joker.", "For " + n + " turns, no " + CNAME[E.evx] + " allowed, not even by choosing it with a Wild.") };
    case "double": return { name: tr("Double tour", "Double turn"), desc: tr(nameOf(E.evx) + " joue deux fois de suite.", nameOf(E.evx) + " plays twice in a row.") };
    case "x2": return { name: tr("Pénalités doublées", "Double penalties"), desc: tr("Pendant " + n + " tours, les +2 font piocher 4 et les +4 font piocher 8.", "For " + n + " turns, +2s make you draw 4 and +4s make you draw 8.") };
    case "pouce": return { name: tr("Coup de pouce", "Helping hand"), desc: tr(nameOf(E.evx) + " croule sous les cartes : 2 d'entre elles partent à la défausse.", nameOf(E.evx) + " is drowning in cards: 2 of them go to the discard pile.") };
  }
  return null;
}
function evActive(E){ return !!E.ev && E.phase === "play" && (E.tc - E.evt < dur(E) || (E.ev === "double" && E.extra)); }
function rotate(E){
  const old = {}; E.order.forEach(x => { old[x] = E.hands[x]; });
  E.order.forEach(x => { E.hands[nextFrom(E, x, 1)] = old[x]; });
}
function grace(E, ids){ ids.forEach(x => { E.called[x] = E.hands[x].length === 1; }); } // pas de « Contre ! » sur une main qu'on vient de recevoir
function applyEvent(E, id){
  const n = dur(E);
  E.ev = id; E.evn = (E.evn || 0) + 1; E.evt = E.tc; E.evx = "";
  if(id === "pluie"){ E.order.forEach(x => give(E, x, 1)); E.dby = "*"; E.dn = 1; }
  else if(id === "sens") E.dir *= -1;
  else if(id === "voisin"){ rotate(E); grace(E, E.order); E.sw = (E.sw || 0) + 1; }
  else if(id === "interdit"){ const opts = COLS.filter(k => k !== E.color); E.ban = E.evx = opts[rnd(opts.length)]; E.banTo = E.tc + n; }
  else if(id === "double"){ E.extra = E.evx = E.turn; }
  else if(id === "x2"){ E.dbl = true; E.dblTo = E.tc + n; }
  else if(id === "pouce"){
    const big = E.order.slice().sort((a, b) => E.hands[b].length - E.hands[a].length)[0], h = E.hands[big];
    for(let k = 0; k < 2; k++) E.disc.unshift(h.splice(rnd(h.length), 1)[0]);
    E.evx = big; grace(E, [big]);
  }
}
function tick(E){
  if(E.ban && E.tc >= E.banTo) E.ban = "";
  if(E.dbl && E.tc >= E.dblTo) E.dbl = false;
  if(!E.tw || E.phase !== "play" || E.tc < (E.evAt || 0)) return;
  E.evAt = E.tc + 7 + rnd(4);
  const t = pickTwist(EVENTS, { rate: 0.4, last: E.ev, E });
  if(t) applyEvent(E, t.id);
}
/* Fin d'une action : on passe la main (sauf double tour), puis on regarde si un coup de théâtre tombe. */
function advance(E, steps, nameOf){
  if(E.extra && E.extra === E.turn && !E.pend){ E.extra = ""; E.log += L(E, " · " + nameOf(E.turn) + " rejoue (double tour)", " · " + nameOf(E.turn) + " goes again (double turn)"); }
  else E.turn = nextOf(E, steps);
  E.tc = (E.tc || 0) + 1;
  tick(E);
}

/* ---------- Trophées de fin de partie ---------- */
const AWARDS = {
  pl: { t: tr(["Mitraillette à cartes", "Distributeur automatique", "Le bras le plus rapide"], ["Card machine gun", "Vending machine", "Fastest arm in the room"]), d: v => tr(v + " cartes posées", v + (v === 1 ? " card played" : " cards played")), min: 3 },
  dr: { t: tr(["Aspirateur à cartes", "Collectionneur malgré lui", "Éventail géant"], ["Card vacuum", "Reluctant collector", "Giant fan of cards"]), d: v => tr(v + " cartes piochées", v + (v === 1 ? " card drawn" : " cards drawn")), min: 4 },
  pen: { t: tr(["Cible préférée des +4", "Punching-ball de la table", "Victime désignée"], ["Favourite +4 target", "The table's punching bag", "Designated victim"]), d: v => tr(v + " cartes de pénalité", v + (v === 1 ? " penalty card" : " penalty cards")), min: 2 },
  ct: { t: tr(["Œil de lynx", "Gendarme de la table", "Radar à « Dernière ! »"], ["Eagle eye", "Table cop", "“Last card!” radar"]), d: v => tr(v + " oubli" + (v > 1 ? "s" : "") + " attrapé" + (v > 1 ? "s" : ""), v + (v === 1 ? " slip caught" : " slips caught")), min: 1 },
  jp: { t: tr(["Intercepteur", "Voleur de tour", "Sniper de la défausse"], ["Interceptor", "Turn thief", "Discard pile sniper"]), d: v => tr(v + " interception" + (v > 1 ? "s" : ""), v + (v === 1 ? " jump-in" : " jump-ins")), min: 1 },
  sw: { t: tr(["Roi du troc", "Pickpocket", "As de l'échange"], ["King of trading", "Pickpocket", "Swap master"]), d: v => tr(v + " main" + (v > 1 ? "s" : "") + " échangée" + (v > 1 ? "s" : ""), v + (v === 1 ? " hand swapped" : " hands swapped")), min: 1 }
};
function awards(E){
  const S = E.st || {}, out = [];
  shuffle(Object.keys(AWARDS)).forEach(k => {
    const best = E.order.slice().sort((a, b) => ((S[b] || {})[k] || 0) - ((S[a] || {})[k] || 0))[0], v = (S[best] || {})[k] || 0;
    if(v >= AWARDS[k].min && out.length < 3) out.push([k, best, v, rnd(AWARDS[k].t.length)]);
  });
  return out;
}
function awardLines(E, nameOf){ return A(E.aw).map(A).filter(x => AWARDS[x[0]]).map(x => [AWARDS[x[0]].t[x[3]] || AWARDS[x[0]].t[0], nameOf(x[1]), AWARDS[x[0]].d(x[2])]); }

function roundEnd(E, w, nameOf){
  let pts = 0;
  E.order.forEach(id => { if(id !== w) (E.hands[id] || []).forEach(c => { pts += points(c); }); });
  E.score[w] = (E.score[w] || 0) + pts;
  E.winner = w; E.gain = pts; E.extra = ""; E.ban = ""; E.dbl = false;
  E.phase = E.round >= E.rounds ? "end" : "roundend";
  E.log = L(E, nameOf(w) + " pose sa dernière carte et gagne " + pts + " points !", nameOf(w) + " plays their last card and scores " + pts + (pts === 1 ? " point!" : " points!"));
  if(E.phase === "end") E.aw = awards(E);
}
/* Sept-zéro : 7 = on échange sa main avec un adversaire ; 0 = toutes les mains tournent. */
function bestSwap(E, id){ return E.order.filter(x => x !== id).sort((a, b) => E.hands[a].length - E.hands[b].length)[0]; }
function needsTarget(E, id, i){ const h = E.hands[id] || []; return !!(E.sz && h[i] && val(h[i]) === "7" && h.length > 1); }
function sevenZero(E, id, v, to, nameOf){
  if(v === "7"){
    const t = E.order.indexOf(to) >= 0 && to !== id ? to : bestSwap(E, id);
    const a = E.hands[id]; E.hands[id] = E.hands[t]; E.hands[t] = a;
    grace(E, [id, t]); stat(E, id, "sw"); E.sw = (E.sw || 0) + 1;
    E.log += L(E, " · échange sa main avec " + nameOf(t), " · swaps hands with " + nameOf(t));
  } else { rotate(E); grace(E, E.order); E.sw = (E.sw || 0) + 1; E.log += L(E, " · toutes les mains tournent", " · all hands rotate"); }
}
function apply(E, id, i, chosen, nameOf, to, jump){
  const h = E.hands[id], c = h[i];
  h.splice(i, 1); E.disc.push(E.top); E.top = c; E.stuck = 0;
  E.pc = (E.pc || 0) + 1; E.pby = id; // pour l'animation de la carte posée
  stat(E, id, "pl");
  E.color = wild(c) ? (COLS.indexOf(chosen) >= 0 && chosen !== E.ban ? chosen : COLS.filter(k => k !== E.ban)[0]) : col(c);
  E.drew = false;
  const v = val(c), n = E.order.length;
  let steps = 1;
  E.log = L(E, nameOf(id) + (jump ? " intercepte avec " : " joue ") + (val(c) === "R" ? "une " : "un ") + label(c, "fr") + (wild(c) ? " et choisit le " + cname(E, E.color) : ""),
    nameOf(id) + (jump ? " jumps in with a " : " plays a ") + label(c, "en") + (wild(c) ? " and picks " + cname(E, E.color) : ""));
  if(v === "S"){ steps = 2; E.log += L(E, " · " + nameOf(nextOf(E, 1)) + " passe son tour", " · " + nameOf(nextOf(E, 1)) + " is skipped"); }
  if(v === "R"){ E.dir *= -1; steps = n === 2 ? 2 : 1; E.log += n === 2 ? L(E, " · et rejoue", " · and goes again") : L(E, " · le sens change", " · direction reverses"); }
  if(v === "D" || v === "F"){
    const k = (v === "D" ? 2 : 4) * (E.dbl ? 2 : 1);
    if(E.stack){ E.pend += k; E.log += L(E, " · " + nameOf(nextOf(E, 1)) + " doit encaisser " + E.pend + " ou renchérir", " · " + nameOf(nextOf(E, 1)) + " must take " + E.pend + " or stack on top"); }
    else { const vic = nextOf(E, 1); give(E, vic, k, true); steps = 2; E.log += L(E, " · " + nameOf(vic) + " pioche " + k + " cartes et passe son tour", " · " + nameOf(vic) + " draws " + k + " cards and is skipped"); }
  }
  if(!h.length){ roundEnd(E, id, nameOf); return true; }
  if(E.sz && (v === "7" || v === "0")) sevenZero(E, id, v, to, nameOf);
  if(E.hands[id].length > 1) E.called[id] = false;
  advance(E, steps, nameOf);
  return true;
}
function doPlay(E, id, i, chosen, nameOf, to){
  if(E.phase !== "play" || E.turn !== id) return false;
  if(!E.hands[id][i] || !playable(E, id)[i]) return false;
  return apply(E, id, i, chosen, nameOf, to, false);
}
function doJump(E, id, i, nameOf, to){
  if(!canJump(E, id, i)) return false;
  E.turn = id; E.drew = false; E.extra = ""; stat(E, id, "jp");
  return apply(E, id, i, "", nameOf, to, true);
}
function doDraw(E, id, nameOf){
  if(E.phase !== "play" || E.turn !== id) return false;
  if(E.pend > 0){
    const k = E.pend; give(E, id, k, true); E.pend = 0; E.drew = false;
    E.log = L(E, nameOf(id) + " encaisse " + k + " cartes", nameOf(id) + " takes " + k + " cards"); advance(E, 1, nameOf); return true;
  }
  if(E.drew) return false;
  let c = draw1(E), got = 0;
  if(!c){
    // Plus rien à piocher : si toute la table passe, la manche s'arrête et la main la plus légère gagne.
    E.stuck = (E.stuck || 0) + 1;
    if(E.stuck >= E.order.length){
      const w = E.order.slice().sort((a, b) => E.hands[a].reduce((t, x) => t + points(x), 0) - E.hands[b].reduce((t, x) => t + points(x), 0))[0];
      roundEnd(E, w, nameOf); E.log = L(E, "Table bloquée : " + nameOf(w) + " a la main la plus légère et gagne " + E.gain + " points.", "Deadlock: " + nameOf(w) + " has the lightest hand and scores " + E.gain + (E.gain === 1 ? " point." : " points."));
      return true;
    }
    E.log = L(E, nameOf(id) + " passe (pioche vide)", nameOf(id) + " passes (draw pile empty)"); advance(E, 1, nameOf); return true;
  }
  // Pioche jusqu'à pouvoir jouer (règle maison) : on continue tant que la carte ne va pas, 8 cartes au plus.
  for(;;){ E.hands[id].push(c); got++; if(!E.dp || canPlay(E, c) || got >= 8) break; const nx = draw1(E); if(!nx) break; c = nx; }
  E.called[id] = false;
  E.dc = (E.dc || 0) + 1; E.dby = id; E.dn = got; stat(E, id, "dr", got);
  const what = got > 1 ? L(E, " pioche " + got + " cartes", " draws " + got + " cards") : L(E, " pioche", " draws");
  if(canPlay(E, c)){ E.drew = true; E.log = nameOf(id) + what + (got > 1 ? L(E, "… et peut jouer la dernière", "… and can play the last one") : L(E, "… et peut la jouer", "… and can play it")); }
  else { E.drew = false; E.log = nameOf(id) + what + L(E, " et passe", " and passes"); advance(E, 1, nameOf); }
  return true;
}
function doPass(E, id, nameOf){
  if(E.phase !== "play" || E.turn !== id || !E.drew) return false;
  E.drew = false; E.log = L(E, nameOf(id) + " garde sa carte et passe", nameOf(id) + " keeps the card and passes"); advance(E, 1, nameOf); return true;
}
function doCall(E, id, nameOf){
  if(E.phase !== "play" || (E.hands[id] || []).length > 2 || E.called[id]) return false;
  E.called[id] = true; E.log = L(E, nameOf(id) + " crie « Dernière ! »", nameOf(id) + " calls “Last card!”"); return true;
}
function doCatch(E, by, who, nameOf){
  if(E.phase !== "play" || by === who || (E.hands[who] || []).length !== 1 || E.called[who]) return false;
  give(E, who, 2, true); stat(E, by, "ct"); E.log = L(E, nameOf(by) + " prend " + nameOf(who) + " en flagrant délit : oubli de « Dernière ! », +2 cartes", nameOf(by) + " catches " + nameOf(who) + " red-handed: forgot to call “Last card!”, +2 cards"); return true;
}
function catchable(E, id){ return E.phase === "play" && (E.hands[id] || []).length === 1 && !E.called[id]; }

/* ---------- Robots ---------- */
function bestColor(E, h){
  const cnt = {}; h.forEach(c => { if(!wild(c)) cnt[col(c)] = (cnt[col(c)] || 0) + 1; });
  return COLS.filter(k => k !== E.ban).sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0))[0];
}
function botMove(E, id, nameOf){
  const h = E.hands[id], ok = playable(E, id);
  const idx = h.map((c, i) => i).filter(i => ok[i]);
  if(!idx.length){ if(doDraw(E, id, nameOf)) return; doPass(E, id, nameOf); return; }
  const best = bestColor(E, h), to = bestSwap(E, id);
  // Sept-zéro : un 7 vaut de l'or si quelqu'un a moins de cartes que nous ; sinon on le garde.
  const sevenGood = E.sz && E.hands[to].length < h.length - 1;
  const rank = i => { const c = h[i], v = val(c); return (wild(c) ? 10 : 0) - (v === "D" || v === "S" ? 2 : 0) + (E.sz && v === "7" ? (sevenGood ? -5 : 4) : 0); };
  // Garde les jokers pour la fin, sauf s'il faut renchérir sur un +2/+4.
  idx.sort((a, b) => rank(a) - rank(b));
  const i = idx[0];
  if(h.length === 2 && Math.random() < 0.8) doCall(E, id, nameOf);
  doPlay(E, id, i, best, nameOf, to);
}
/* Un robot qui a la même carte que celle du dessus peut l'intercepter. */
function botJump(E, id, nameOf){
  const i = jumpable(E, id).indexOf(true);
  return i >= 0 && doJump(E, id, i, nameOf, bestSwap(E, id));
}

/* ---------- Affichage ---------- */
const CSS = '<style data-dc>' +
  '.dc-c{--c:#333; position:relative; width:58px; height:84px; flex:none; border-radius:11px; background:var(--c); color:#fff; border:3px solid #fff; box-shadow:0 1px 0 rgba(0,0,0,.15), 0 6px 14px -8px rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; font-family:var(--f-hand); font-weight:700; font-size:34px; line-height:1; padding:0}' +
  '.dc-c .cr{position:absolute; top:3px; left:6px; font-family:var(--f-body,inherit); font-size:12px; font-weight:800}' +
  '.dc-c.w{background:conic-gradient(' + CHEX.r + ' 0 25%, ' + CHEX.y + ' 0 50%, ' + CHEX.g + ' 0 75%, ' + CHEX.b + ' 0)}.dc-c.w .g{background:#15151c; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:26px}' +
  '.dc-c.big{width:104px; height:150px; font-size:62px; border-width:4px; border-radius:16px}.dc-c.big .cr{font-size:15px}.dc-c.big.w .g{width:68px; height:68px; font-size:42px}' +
  '.dc-back{width:104px; height:150px; border-radius:16px; border:4px solid #fff; background:repeating-linear-gradient(45deg,#1d1b2e 0 10px,#2b2846 10px 20px); color:#fff; font-weight:800; font-size:15px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; box-shadow:0 8px 18px -10px rgba(0,0,0,.7)}' +
  '.dc-back b{font-family:var(--f-hand); font-size:30px}.dc-ghost{display:block; width:46px; height:66px; border-radius:9px; border:3px solid #fff; background:repeating-linear-gradient(45deg,#1d1b2e 0 6px,#2b2846 6px 12px); box-shadow:0 8px 16px -8px rgba(0,0,0,.7)}.dc-back:disabled{opacity:.55}' +
  '.dc-table{display:flex; justify-content:center; align-items:center; gap:18px; padding:8px 0}.dc-top{border-radius:22px; padding:6px; box-shadow:0 0 0 4px var(--tc)}' +
  '.dc-opp{display:flex; flex-wrap:wrap; gap:6px}.dc-o{display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:99px; background:var(--card); border:1.5px solid var(--line); font-weight:700; font-size:14px}' +
  '.dc-o.on{border-color:var(--acc); box-shadow:0 0 0 2px var(--acc)}.dc-o .n{background:var(--soft); border-radius:99px; padding:1px 8px; font-variant-numeric:tabular-nums}.dc-o .last{color:var(--bad); font-size:12px; font-weight:800}' +
  '.dc-o button{border:0; background:var(--bad); color:#fff; font-weight:800; font-size:12px; border-radius:99px; padding:6px 10px}' +
  '.dc-log{text-align:center; font-weight:700; min-height:2.6em}.dc-turn{text-align:center; font-family:var(--f-hand); font-size:30px; color:var(--acc); line-height:1}' +
  '.dc-hand{display:flex; flex-wrap:wrap; gap:6px; justify-content:center; padding:22px 0 4px}.dc-hand .dc-c:disabled{opacity:.38; transform:none}.dc-hand .dc-c.ok{transform:translateY(-6px)}.dc-hand .dc-c.sel{transform:translateY(-22px) scale(1.1); box-shadow:0 0 0 3px var(--bg), 0 0 0 6px var(--ink), 0 16px 24px -10px #000; z-index:1}.dc-hand .dc-c{transition:transform .22s cubic-bezier(.3,.7,.3,1), box-shadow .22s}.dc-landing .dc-top .dc-c{visibility:hidden}.dc-hand .dc-c.idle{pointer-events:none}.dc-hand .dc-c.gone{visibility:hidden}.dc-hand .dc-c.idle:disabled{opacity:1}' +
  '.dc-pick{display:grid; grid-template-columns:1fr 1fr; gap:10px}.dc-pick button{min-height:72px; border:0; border-radius:16px; color:#fff; font-weight:800; font-size:18px}' +
  '.dc-call{background:var(--bad); color:#fff}.dc-pend{display:inline-block; background:var(--bad); color:#fff; border-radius:99px; padding:2px 10px; font-weight:800}' +
  '.dc-sc{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.dc-sc li{display:flex; justify-content:space-between; padding:8px 12px; border-radius:10px; background:var(--card); border:1.5px solid var(--line); font-weight:700}' +
  '.dc-mods{display:flex; flex-wrap:wrap; gap:6px; justify-content:center}.dc-mod{font-size:12px; font-weight:800; padding:4px 10px; border-radius:99px; background:var(--soft); color:var(--ink); border:1.5px solid var(--line)}.dc-mod i{display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:5px; vertical-align:-1px; background:var(--c)}' +
  '.dc-ev .twist{margin:2px 0 0}.dc-to{display:grid; grid-template-columns:1fr 1fr; gap:8px}.dc-to button{min-height:58px; border-radius:14px; border:1.5px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:15px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px}.dc-to button small{font-weight:700; color:var(--muted); font-size:12px}' +
  '.dc-pick button:disabled{opacity:.25; text-decoration:line-through}.dc-aw{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.dc-aw li{padding:9px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); display:flex; flex-direction:column; gap:1px}.dc-aw b{font-family:var(--f-disp); font-size:16px}.dc-aw span{font-size:13px; color:var(--muted)}</style>';
function cardHTML(c, extra, attrs){
  return '<button type="button" class="dc-c' + (wild(c) ? " w" : "") + (extra ? " " + extra : "") + '" style="--c:' + (CHEX[col(c)] || "#333") + '"' + (attrs || "") + ' aria-label="' + esc(label(c)) + '">' +
    '<span class="cr">' + esc(glyph(c)) + "</span>" + (wild(c) ? '<span class="g">' + esc(glyph(c)) + "</span>" : esc(glyph(c))) + "</button>";
}
/* Plateau vu par `me` (ou par personne si me est vide). ui : { act, sel } (carte choisie, pas encore posée) */
function tableHTML(E, me, nameOf, ui){
  const myTurn = E.turn === me && E.phase === "play";
  const others = E.order.filter(id => id !== me);
  let h = CSS + '<div class="dc-opp">' + others.map(id => {
    const n = (E.hands[id] || []).length;
    return '<span class="dc-o' + (E.turn === id ? " on" : "") + '" data-o="' + esc(id) + '">' + esc(nameOf(id)) + ' <span class="n">' + n + "</span>" +
      (n === 1 && E.called[id] ? '<span class="last">' + tr("Dernière !", "Last card!") + "</span>" : "") +
      (catchable(E, id) && me !== "" ? '<button type="button" data-catch="' + esc(id) + '">' + tr("Contre !", "Catch!") + "</button>" : "") + "</span>";
  }).join("") + "</div>";
  const evOn = evActive(E), mods = [];
  if(evOn) h += '<div class="dc-ev">' + SB.u.twistHTML(evInfo(E, nameOf)) + "</div>";
  if(E.ban) mods.push('<span class="dc-mod" style="--c:' + CHEX[E.ban] + '"><i></i>' + CNAME[E.ban][0].toUpperCase() + CNAME[E.ban].slice(1) + tr(" interdit", " banned") + "</span>");
  if(E.dbl) mods.push('<span class="dc-mod">' + tr("Pénalités ×2", "Penalties ×2") + "</span>");
  if(E.extra) mods.push('<span class="dc-mod">' + tr("Double tour : ", "Double turn: ") + esc(nameOf(E.extra)) + "</span>");
  if(mods.length && !evOn) h += '<div class="dc-mods">' + mods.join("") + "</div>";
  h += '<div class="dc-turn">' + (E.phase !== "play" ? "" : myTurn ? tr("À toi !", "Your turn!") : tr("Au tour de " + esc(nameOf(E.turn)), esc(nameOf(E.turn)) + "'s turn")) + " " + (E.dir === 1 ? "↻" : "↺") + "</div>";
  h += '<div class="dc-table"><span class="dc-top" style="--tc:' + CHEX[E.color] + '">' + cardHTML(E.top, "big", " disabled") + "</span>" +
    '<button type="button" class="dc-back" data-draw' + (myTurn && !E.drew ? "" : " disabled") + "><b>" + (E.pend > 0 ? "+" + E.pend : tr("Pioche", "Draw")) + "</b>" + (E.left != null ? E.left : E.draw.length) + tr(" cartes", " cards") + "</button></div>";
  h += '<p class="dc-log">' + esc(E.log || "") + (E.pend > 0 ? ' <span class="dc-pend">+' + E.pend + tr(" en attente", " pending") + "</span>" : "") + "</p>";
  if(me){
    const mine = E.hands[me] || [], ok = myTurn ? playable(E, me) : jumpable(E, me);
    h += '<span class="eyebrow">' + tr("Ta main · " + mine.length + " carte" + (mine.length > 1 ? "s" : ""), "Your hand · " + mine.length + (mine.length === 1 ? " card" : " cards")) + (ui.sel == null && ok.some(Boolean) ? (myTurn ? tr(" · touche une carte pour la choisir", " · tap a card to pick it") : tr(" · interception possible !", " · you can jump in!")) : "") + '</span><div class="dc-hand">' +
      order(mine).map(x => ui.gone != null ? cardHTML(x.c, "idle" + (ui.gone === x.i ? " gone" : ""), ' data-c="' + x.i + '" disabled') :
        cardHTML(x.c, (ok[x.i] ? "ok" : !myTurn ? "idle" : "") + (ui.sel === x.i ? " sel" : ""), ' data-c="' + x.i + '"' + (myTurn && !ok[x.i] ? " disabled" : "") + (ui.sel === x.i ? ' aria-pressed="true"' : ""))).join("") + "</div>";
  }
  return h;
}
/* Barre du bas : on choisit une carte dans sa main, puis on valide son tour ici. */
function dockHTML(E, me, ui, nameOf){
  if(!me || E.phase !== "play") return "";
  const mine = E.hands[me] || [], myTurn = E.turn === me, b = [], out = [];
  if(mine.length <= 2 && !E.called[me]) b.push('<button class="btn dc-call" type="button" data-call>' + tr("Dernière !", "Last card!") + "</button>");
  const c = ui.sel != null && (myTurn ? playable(E, me)[ui.sel] : canJump(E, me, ui.sel)) ? mine[ui.sel] : null;
  if(c){
    if(b.length) out.push(b.pop());
    if(wild(c)){
      out.push('<span class="eyebrow" style="text-align:center">' + tr("Choisis la couleur pour poser ton ", "Pick a colour to play your ") + esc(label(c)) + '</span><div class="dc-pick">' + COLS.map(k => '<button type="button" data-col="' + k + '" style="background:' + CHEX[k] + (k === "y" ? "; color:#1d1405" : "") + '"' + (k === E.ban ? " disabled" : "") + ">" + CNAME[k][0].toUpperCase() + CNAME[k].slice(1) + "</button>").join("") + "</div>");
    } else if(needsTarget(E, me, ui.sel)){
      out.push('<span class="eyebrow" style="text-align:center">' + (myTurn ? "" : tr("Interception · ", "Jump-in · ")) + tr("Sept : avec qui échanges-tu ta main ?", "Seven: who do you swap hands with?") + '</span><div class="dc-to">' + E.order.filter(x => x !== me).map(x => '<button type="button" data-to="' + esc(x) + '">' + esc(nameOf(x)) + "<small>" + tr(E.hands[x].length + " carte" + (E.hands[x].length > 1 ? "s" : ""), E.hands[x].length + (E.hands[x].length === 1 ? " card" : " cards")) + "</small></button>").join("") + "</div>");
    } else out.push('<button class="btn acc" type="button" data-ok style="min-height:62px">' + (myTurn ? tr("Poser ", "Play ") : tr("Intercepter : ", "Jump in: ")) + esc(label(c)) + (E.sz && val(c) === "0" && mine.length > 1 ? tr(" · les mains tournent", " · hands rotate") : "") + "</button>");
    out.push('<button class="link" type="button" data-cancel style="align-self:center">' + tr("Choisir une autre carte", "Pick another card") + "</button>");
    return dock(out.join(""));
  }
  if(myTurn){
    if(E.pend > 0) b.push('<button class="btn acc" type="button" data-draw>' + tr("Encaisser +", "Take +") + E.pend + "</button>");
    else if(E.drew) b.push('<button class="btn ghost" type="button" data-pass>' + tr("Garder et passer", "Keep it and pass") + "</button>");
  }
  return b.length ? dock(b.length > 1 ? '<div class="row">' + b.join("") + "</div>" : b[0]) : "";
}
/* Met à jour la table sans l'animation d'entrée ni remonter en haut : sinon tout l'écran clignote à chaque carte posée. */
function paint(root, key, html, bind){
  key = "dc:" + key;
  if(root.dataset.key === key) return;
  if(!/^dc:/.test(root.dataset.key || "")){ screen(root, key, html, bind); return; }
  const sc = root.closest(".screen"), top = sc ? sc.scrollTop : 0;
  root.dataset.key = key; root.innerHTML = html;
  if(sc) sc.scrollTop = top;
  if(bind) bind(root);
}
function scoresHTML(E, nameOf){
  return '<ul class="dc-sc">' + E.order.slice().sort((a, b) => (E.score[b] || 0) - (E.score[a] || 0)).map(id => "<li><span>" + esc(nameOf(id)) + "</span><span>" + (E.score[id] || 0) + tr(" pts", " pts") + "</span></li>").join("") + "</ul>";
}
function bestOf(E){ return E.order.slice().sort((a, b) => (E.score[b] || 0) - (E.score[a] || 0))[0]; }
function awardsHTML(E, nameOf){
  const L = awardLines(E, nameOf);
  return L.length ? '<div class="field"><span class="eyebrow">' + tr("Trophées", "Awards") + '</span><ul class="dc-aw">' + L.map(x => "<li><b>" + esc(x[0]) + " · " + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : "";
}
/* Le bandeau du coup de théâtre apparaît avec un petit choc et une notification. */
const EVX = { key: "", n: 0 };
function evFx(root, E, key, nameOf){
  if(EVX.key !== key){ EVX.key = key; EVX.n = E.evn || 0; return; }
  if((E.evn || 0) === EVX.n) return;
  EVX.n = E.evn || 0;
  const t = evInfo(E, nameOf); if(!t) return;
  SB.u.toast(t.name); buzz([30, 40, 30]);
  if(SB.fx) SB.fx.pop(root.querySelector(".dc-ev .twist"), 150, true);
}

/* ---------- Réseau : l'état public (s) + la pioche cachée chez l'hôte (priv) ---------- */
function fromState(s, priv){
  const E = JSON.parse(JSON.stringify(s)); delete E.k; delete E.left;
  E.order = A(s.order).slice(); E.hands = {}; E.order.forEach(id => { E.hands[id] = A((s.hands || {})[id]).slice(); });
  E.draw = A(priv.draw).slice(); E.disc = A(priv.disc).slice();
  E.dir = s.dir || 1; E.pend = s.pend || 0; E.drew = !!s.drew; E.stack = !!s.stack; E.sz = !!s.sz; E.jump = !!s.jump; E.dp = !!s.dp; E.tw = !!s.tw;
  E.called = Object.assign({}, s.called); E.score = Object.assign({}, s.score); E.seen = Object.assign({}, s.seen); E.st = Object.assign({}, s.st);
  E.aw = A(s.aw).map(A); E.ban = s.ban || ""; E.extra = s.extra || ""; E.dbl = !!s.dbl; E.ev = s.ev || ""; E.evx = s.evx || "";
  ["tc", "evAt", "evn", "banTo", "dblTo", "pc", "dc", "dn", "gain", "sw", "stuck"].forEach(k => { E[k] = +s[k] || 0; });
  E.evt = s.evt == null ? -99 : +s.evt;
  return E;
}
function publish(c, E){
  c.setPriv({ draw: E.draw, disc: E.disc });
  const o = Object.assign({}, E); delete o.draw; delete o.disc; o.left = E.draw.length;
  c.set(o);
}
function tableView(s){ const E = fromState(s, {}); E.left = s.left || 0; return E; }
const UI = { k: "", sel: null, prev: null, pend: null };
/* Animations : la carte posée vole jusqu'au centre, les cartes piochées partent de la pioche. */
const FX = { key: "", pc: 0, dc: 0, rect: null, at: 0 };
function grab(el){ FX.rect = el.getBoundingClientRect(); FX.at = Date.now(); }
/* Choisir une carte : elle monte en douceur, l'ancienne redescend, et la barre « Poser » glisse depuis le bas. */
const calm = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
function selFx(root, sel, prev){
  if(calm()) return;
  const up = sel != null ? root.querySelector('.dc-hand [data-c="' + sel + '"]') : null;
  const down = prev != null && prev !== sel ? root.querySelector('.dc-hand [data-c="' + prev + '"]') : null;
  if(up && up.animate) up.animate([{ transform: "translateY(-6px)" }, { transform: "translateY(-32px) scale(1.16) rotate(-2deg)", offset: .6 }, { transform: "translateY(-22px) scale(1.1)" }], { duration: 460, easing: "cubic-bezier(.3,.7,.3,1)" });
  if(down && down.animate) down.animate([{ transform: "translateY(-22px) scale(1.1)" }, { transform: "translateY(-6px)" }], { duration: 320, easing: "cubic-bezier(.3,.7,.3,1)" });
  const dk = root.querySelector(".dock");
  if(dk && dk.animate && (sel == null) !== (prev == null)) dk.animate([{ transform: "translateY(26px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 340, easing: "cubic-bezier(.3,.7,.3,1)" });
}
/* Pose immédiate : dès qu'on touche « Poser », la carte quitte la main et vole jusqu'à la pile,
   sans attendre la réponse de l'hôte. Sa copie reste posée sur la pile jusqu'à ce que le jeu suive. */
const OPT = { at: 0, h: null, landed: false, wait: false, t: null };
function optClear(){ clearTimeout(OPT.t); if(OPT.h) OPT.h.remove(); OPT.h = null; OPT.at = 0; OPT.wait = false; }
function optFly(root, el, c, onLand){
  const top = root.querySelector(".dc-top .dc-c");
  if(!el || !top || !SB.fx || !SB.fx.flyTo){ if(onLand) onLand(); return false; }
  optClear();
  const from = el.getBoundingClientRect();
  el.style.visibility = "hidden";
  OPT.at = Date.now(); OPT.landed = false; OPT.wait = true;
  OPT.h = SB.fx.flyTo(cardHTML(c, "big"), from, top, { rot: -18, ms: 950, keep: true, done: () => {
    OPT.landed = true; SB.fx.thud(root.querySelector(".dc-top"));
    if(onLand){ onLand(); optClear(); return; } // un seul téléphone : le coup est joué à l'atterrissage
    // Le jeu a déjà suivi : on retire la copie. Sinon on attend (au plus 6 s).
    if(!OPT.wait) optClear(); else { clearTimeout(OPT.t); OPT.t = setTimeout(() => { optClear(); root.dataset.key = ""; try{ DEF.render(SB.ctx(), root); }catch(e){} }, 6000); }
  } }) || null;
  return true;
}
function chipOf(root, id){ return Array.from(root.querySelectorAll("[data-o]")).find(x => x.dataset.o === id); }
function animate(root, E, me, key){
  if(!SB.fx) return;
  if(FX.key !== key){ FX.key = key; FX.pc = E.pc || 0; FX.dc = E.dc || 0; FX.rect = null; return; }
  let played = false;
  if((E.pc || 0) !== FX.pc){
    FX.pc = E.pc || 0; played = true;
    if(E.pby === me && OPT.at && Date.now() - OPT.at < 10000){
      // Déjà animée au moment du clic : on laisse la copie finir son vol, puis on la retire.
      OPT.wait = false; if(OPT.landed) optClear();
      root.classList.toggle("dc-landing", !OPT.landed && !!OPT.h);
      if(OPT.h && !OPT.landed){ const iv = setInterval(() => { if(OPT.landed || !OPT.h){ clearInterval(iv); root.classList.remove("dc-landing"); optClear(); } }, 40); }
      FX.rect = null;
    } else {
    const top = root.querySelector(".dc-top .dc-c");
    let from = E.pby === me && FX.rect && Date.now() - FX.at < 30000 ? FX.rect : null;
    if(!from){ const o = chipOf(root, E.pby); from = o ? o.getBoundingClientRect() : null; }
    if(!from){ const opp = root.querySelector(".dc-opp"); from = opp ? opp.getBoundingClientRect() : null; }
    if(top && SB.fx.flyTo){
      // La vraie carte reste cachée pendant que sa copie vole, puis elle se pose avec un petit choc.
      FX.landing = (FX.landing || 0) + 1; root.classList.add("dc-landing");
      SB.fx.flyTo(top.outerHTML, from, top, { rot: E.pby === me ? -18 : 18, ms: 1150, done: () => {
        FX.landing--; if(FX.landing <= 0){ FX.landing = 0; root.classList.remove("dc-landing"); SB.fx.thud(root.querySelector(".dc-top")); }
      } });
    }
    FX.rect = null;
    }
  }
  if((E.dc || 0) !== FX.dc){
    FX.dc = E.dc || 0;
    const pile = root.querySelector(".dc-back"), n = Math.min(E.dn || 1, 6), wait = played ? 700 : 0;
    if(!pile) return;
    const pr = pile.getBoundingClientRect();
    if(E.dby === "*"){
      const mc = root.querySelectorAll(".dc-hand [data-c]"), lc = mc.length ? Array.from(mc).find(c => +c.dataset.c === mc.length - 1) : null;
      if(lc) SB.fx.fly(lc, pr, { rot: 12, delay: wait, ms: 950 });
      root.querySelectorAll("[data-o]").forEach((o, k) => SB.fx.ghost('<span class="dc-ghost"></span>', pr, o.getBoundingClientRect(), { delay: wait + k * 120, ms: 850 }));
    } else if(E.dby === me){
      const len = (E.hands[me] || []).length;
      Array.from(root.querySelectorAll(".dc-hand [data-c]")).filter(c => +c.dataset.c >= len - n).forEach((c, k) => SB.fx.fly(c, pr, { rot: 12, delay: wait + k * 160, ms: 950 }));
    } else {
      const o = chipOf(root, E.dby);
      if(o) for(let k = 0; k < n; k++) SB.fx.ghost('<span class="dc-ghost"></span>', pr, o.getBoundingClientRect(), { delay: wait + k * 160, ms: 850 });
    }
  }
}
let LTOK = 0;

const DEF = {
  id: "dernierecarte", name: tr("Dernière carte", "Last Card"), glyph: "+4 !", pitch: tr("Même couleur ou même chiffre, et crie « Dernière ! ».", "Match the colour or the number, and shout “Last card!”."), hot: false,
  accent: { light: "#ff8a4c", dark: "#ff8a4c" },
  tag: tr("Même couleur ou même valeur, des +2, des +4, des inversions… Et n'oublie pas de crier « Dernière ! » quand il ne te reste plus qu'une carte.", "Match the colour or the value, with +2s, +4s, Reverses… And don't forget to shout “Last card!” when you're down to one card."),
  min: 2, max: 10,
  rules: tr([
    "Chacun reçoit 7 cartes. À ton tour, pose une carte de la même couleur ou de la même valeur que celle du dessus.",
    "Passe-tour : le suivant saute son tour. Inversion : le sens change. +2 et +4 : le suivant pioche. Joker et +4 : tu choisis la couleur.",
    "Pas de carte jouable ? Pioche. Si la carte piochée va, tu peux la poser tout de suite.",
    "Avec le cumul, on peut renvoyer un +2 avec un +2 ou un +4, et un +4 avec un +4. Celui qui ne peut pas (ou ne veut pas) renchérir encaisse le total.",
    "Quand il te reste 2 cartes, touche « Dernière ! » avant de poser l'avant-dernière. Si tu te retrouves avec une seule carte sans l'avoir annoncé, n'importe qui peut toucher « Contre ! » : tu pioches 2 cartes.",
    "Le premier qui n'a plus de cartes gagne la manche et marque la valeur des cartes restées dans la main des autres.",
    "Règles maison au choix : Sept-zéro (7 = tu échanges ta main avec qui tu veux, 0 = toutes les mains tournent), Interception (pose hors de ton tour une carte identique à celle du dessus), Pioche jusqu'à pouvoir jouer (on continue de piocher tant que la carte ne va pas).",
    "Coups de théâtre : de temps en temps, un événement chamboule la partie (couleur interdite, pluie de cartes, mains échangées, double tour…)."
  ], [
    "Everyone gets 7 cards. On your turn, play a card that matches the colour or the value of the top card.",
    "Skip: the next player misses their turn. Reverse: the direction changes. +2 and +4: the next player draws. Wild and +4: you pick the colour.",
    "No playable card? Draw. If the card you drew fits, you can play it right away.",
    "With stacking, you can bounce a +2 back with a +2 or a +4, and a +4 with a +4. Whoever can't (or won't) stack takes the whole total.",
    "When you have 2 cards left, tap “Last card!” before playing your second-to-last. If you end up with one card without calling it, anyone can tap “Catch!”: you draw 2 cards.",
    "The first player with no cards left wins the round and scores the value of the cards left in everyone else's hands.",
    "Optional house rules: Seven-Zero (7 = swap hands with anyone you like, 0 = all hands rotate), Jump-in (play out of turn a card identical to the top card), Draw until you can play (keep drawing until you get a card that fits).",
    "Twists: every now and then, an event shakes up the game (banned colour, card shower, hand swap, double turn…)."
  ]),
  options: [
    { id: "rounds", label: tr("Manches", "Rounds"), type: "seg", def: 1, values: [{ v: 1, label: "1" }, { v: 3, label: "3" }, { v: 5, label: "5" }] },
    { id: "stack", label: tr("Cumul", "Stacking"), type: "toggle", text: tr("Cumul des +2 et +4", "Stack +2s and +4s"), desc: tr("On peut renvoyer la pénalité au suivant", "Pass the penalty on to the next player"), def: true },
    { id: "sz", label: tr("Sept-zéro", "Seven-Zero"), type: "toggle", text: tr("Sept-zéro", "Seven-Zero"), desc: tr("7 : échange ta main avec qui tu veux. 0 : toutes les mains tournent", "7: swap hands with anyone you like. 0: all hands rotate"), def: false },
    { id: "jump", label: tr("Interception", "Jump-in"), type: "toggle", text: tr("Interception", "Jump-in"), desc: tr("Pose hors de ton tour une carte identique à celle du dessus", "Play out of turn a card identical to the top card"), def: false },
    { id: "dp", label: tr("Pioche", "Drawing"), type: "toggle", text: tr("Pioche jusqu'à pouvoir jouer", "Draw until you can play"), desc: tr("On pioche jusqu'à tomber sur une carte jouable", "Keep drawing until you get a playable card"), def: false },
    { id: "twists", label: tr("Coups de théâtre", "Twists"), type: "toggle", text: tr("Coups de théâtre", "Twists"), desc: tr("Des événements surprises en pleine manche", "Surprise events mid-round"), def: true }
  ],
  start(ctx, o){
    const E = { lg: SB.lang(), order: shuffle(ctx.ids), stack: o.stack !== false, sz: !!o.sz, jump: !!o.jump, dp: !!o.dp, tw: o.twists !== false, round: 1, rounds: o.rounds || 1, score: {}, seen: {}, st: {} };
    newRound(E);
    ctx.setPriv({ draw: E.draw, disc: E.disc });
    const s = Object.assign({}, E); delete s.draw; delete s.disc; s.left = E.draw.length;
    return s;
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "play") return;
    const E = fromState(s, ctx.priv());
    let changed = false;
    ctx.ids.forEach(id => {
      const x = ctx.input(id); if(!x) return;
      const sn = Object.assign({}, E.seen[id] || {});
      if(x.c && x.c.n > (sn.c || 0)){ sn.c = x.c.n; changed = true; doCall(E, id, ctx.name); }
      if(x.x && x.x.n > (sn.x || 0)){ sn.x = x.x.n; changed = true; doCatch(E, id, x.x.who, ctx.name); }
      if(x.p && x.p.n > (sn.p || 0)){
        sn.p = x.p.n; changed = true;
        // On retrouve la carte par sa valeur : la main a pu changer (sept-zéro, coup de théâtre) depuis le choix.
        const h = E.hands[id] || [], i = x.p.c && h[x.p.i] !== x.p.c ? h.indexOf(x.p.c) : x.p.i;
        if(x.p.t === "play") doPlay(E, id, i, x.p.col, ctx.name, x.p.to);
        else if(x.p.t === "jump") doJump(E, id, i, ctx.name, x.p.to);
        else if(x.p.t === "draw") doDraw(E, id, ctx.name);
        else if(x.p.t === "pass") doPass(E, id, ctx.name);
      }
      E.seen[id] = sn;
    });
    if(changed) publish(ctx, E);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, E = tableView(s);
    if(UI.k !== ctx.g.gid + s.round){ UI.k = ctx.g.gid + s.round; UI.sel = null; UI.prev = null; }
    if(UI.sel != null && (E.phase !== "play" || !(E.turn === me ? playable(E, me)[UI.sel] : canJump(E, me, UI.sel)))){ UI.sel = null; UI.prev = null; }
    const again = () => { root.dataset.key = "dc:"; DEF.render(SB.ctx(), root); };
    const n = f => (((ctx.mine() || {})[f] || {}).n || 0) + 1;
    // Coup envoyé, en attente de l'hôte : la carte est déjà partie de la main.
    if(UI.pend && (E.phase !== "play" || (E.pc || 0) !== UI.pend.pc || E.log !== UI.pend.log || Date.now() - UI.pend.at > 5800)) UI.pend = null;
    const gone = UI.pend ? UI.pend.i : null;
    if(s.phase === "play"){
      const key = JSON.stringify([s.k, E.hands, E.top, E.color, E.turn, E.dir, E.pend, E.drew, E.called, E.log, UI.sel, s.left, E.ban, E.dbl, E.extra, E.evn, evActive(E), gone]);
      paint(root, key, '<span class="eyebrow">' + tr("Manche ", "Round ") + s.round + " / " + s.rounds + "</span>" + tableHTML(E, me, ctx.name, { act: true, sel: UI.sel, gone }) + (gone != null ? dock('<p class="wait">' + tr("Carte posée…", "Card played…") + "</p>") : dockHTML(E, me, UI, ctx.name)), r => {
        r.querySelectorAll(".dc-hand [data-c]").forEach(b => b.addEventListener("click", () => {
          const i = +b.dataset.c; buzz(6);
          UI.sel = UI.sel === i ? null : i; again();
        }));
        const send = (col, to) => {
          const i = UI.sel; if(i == null) return;
          const el = r.querySelector('.dc-hand [data-c="' + i + '"]'); if(el) grab(el);
          r.querySelectorAll("[data-ok],[data-col],[data-to]").forEach(x => { x.disabled = true; });
          const dk = r.querySelector(".dock"); if(dk) dk.style.visibility = "hidden";
          optFly(r, el, (E.hands[me] || [])[i]);
          UI.pend = { i, pc: E.pc || 0, log: E.log, at: Date.now() };
          UI.sel = null; UI.prev = null; ctx.send({ p: { n: n("p"), t: E.turn === me ? "play" : "jump", i, c: (E.hands[me] || [])[i], col, to: to || "" } });
        };
        const okb = r.querySelector("[data-ok]"); if(okb) okb.addEventListener("click", () => send(""));
        r.querySelectorAll("[data-col]").forEach(b => b.addEventListener("click", () => send(b.dataset.col)));
        r.querySelectorAll("[data-to]").forEach(b => b.addEventListener("click", () => send("", b.dataset.to)));
        const cn = r.querySelector("[data-cancel]"); if(cn) cn.addEventListener("click", () => { UI.sel = null; again(); });
        r.querySelectorAll("[data-draw]").forEach(b => b.addEventListener("click", () => { b.disabled = true; ctx.send({ p: { n: n("p"), t: "draw" } }); }));
        const ps = r.querySelector("[data-pass]"); if(ps) ps.addEventListener("click", () => ctx.send({ p: { n: n("p"), t: "pass" } }));
        const cl = r.querySelector("[data-call]"); if(cl) cl.addEventListener("click", () => { buzz([20, 30, 20]); ctx.send({ c: { n: n("c") } }); });
        r.querySelectorAll("[data-catch]").forEach(b => b.addEventListener("click", () => ctx.send({ x: { n: n("x"), who: b.dataset.catch } })));
        if(ctx.isHost && !ctx.here(E.turn) && E.turn !== me){
          const box = document.createElement("button"); box.type = "button"; box.className = "link warn"; box.style.alignSelf = "center";
          box.textContent = tr("Faire jouer " + ctx.name(E.turn) + " (absent)", "Play for " + ctx.name(E.turn) + " (away)");
          box.addEventListener("click", () => ctx.act(c => {
            const F = fromState(c.s, c.priv());
            if(F.drew) doPass(F, F.turn, c.name); else { doDraw(F, F.turn, c.name); if(F.drew) doPass(F, F.turn, c.name); }
            publish(c, F);
          }));
          r.append(box);
        }
      });
      animate(root, E, me, ctx.g.gid);
      evFx(root, E, ctx.g.gid, ctx.name);
      if(UI.sel !== UI.prev){ selFx(root, UI.sel, UI.prev); UI.prev = UI.sel; }
    } else {
      const last = s.phase === "end", champ = last ? bestOf(E) : s.winner;
      screen(root, "e" + s.k + s.phase + s.round + ctx.isHost, CSS + '<span class="eyebrow">' + (last ? (s.rounds > 1 ? tr("Vainqueur de la partie", "Game winner") : tr("Vainqueur", "Winner")) : tr("Manche " + s.round + " gagnée par", "Round " + s.round + " won by")) + '</span><div class="who">' + esc(ctx.name(champ)) + "</div>" +
        '<p class="dc-log">' + esc(s.log) + "</p>" + (s.rounds > 1 ? '<div class="field"><span class="eyebrow">' + tr("Scores", "Scores") + "</span>" + scoresHTML(E, ctx.name) + "</div>" : "") + (last ? awardsHTML(E, ctx.name) : "") +
        dock(ctx.isHost ? (last ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the lobby") + "</button>" : '<button class="btn acc" type="button" data-next>' + tr("Manche suivante", "Next round") + "</button>") : '<p class="wait">' + tr("L'hôte passe à la suite…", "The host is moving on…") + "</p>"), r => {
        const nx = r.querySelector("[data-next]");
        if(nx) nx.addEventListener("click", () => ctx.act(c => { const F = fromState(c.s, c.priv()); if(F.phase !== "roundend") return; F.round++; newRound(F); publish(c, F); }));
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = tableView(c.s), w = c.s.rounds > 1 ? bestOf(F) : c.s.winner;
          const lines = (c.s.rounds > 1 ? F.order.slice().sort((a, b2) => (F.score[b2] || 0) - (F.score[a] || 0)).slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (F.score[id] || 0) + " pts") : [])
            .concat(awardLines(F, c.name).map(x => x[0] + L(c.s, " : ", ": ") + x[1]));
          c.end({ title: L(c.s, "Dernière carte : " + c.name(w) + " gagne", "Last Card: " + c.name(w) + " wins"), lines, win: [w] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : joueurs qui se passent le téléphone, et/ou robots ---------- */
  local: {
    players: { min: 1, max: 8 },
    start(root, api){
      const names = api.names, st = store();
      let bots = [0, 1, 2, 3].indexOf(st.dcBots) >= 0 ? st.dcBots : (names.length === 1 ? 2 : 0);
      let rounds = [1, 3, 5].indexOf(st.dcRounds) >= 0 ? st.dcRounds : 1;
      // Règles maison (mêmes réglages que le salon en réseau)
      const R = { stack: st.dcStack !== false, sz: !!st.dcSz, jump: !!st.dcJump, dp: !!st.dcDp, tw: st.dcTw !== false };
      const RULES = [["stack", "dcStack", tr("Cumul des +2 et +4", "Stack +2s and +4s"), tr("On peut renvoyer la pénalité au suivant", "Pass the penalty on to the next player")], ["sz", "dcSz", tr("Sept-zéro", "Seven-Zero"), tr("7 : échange ta main avec qui tu veux. 0 : toutes les mains tournent", "7: swap hands with anyone you like. 0: all hands rotate")],
        ["jump", "dcJump", tr("Interception", "Jump-in"), tr("Pose hors de ton tour une carte identique à celle du dessus", "Play out of turn a card identical to the top card")], ["dp", "dcDp", tr("Pioche jusqu'à pouvoir jouer", "Draw until you can play"), tr("On pioche jusqu'à tomber sur une carte jouable", "Keep drawing until you get a playable card")],
        ["tw", "dcTw", tr("Coups de théâtre", "Twists"), tr("Des événements surprises en pleine manche", "Surprise events mid-round")]];
      const BOTN = tr(["Robotte", "Bipbip", "Zorglub"], ["Robbie", "Beepboop", "Zorglub"]);
      let E = null, viewer = "", sel = null, prevSel = null, timer = null, nameMap = {}, gno = 0, jumpPc = -1;
      const nameOf = id => nameMap[id] || "?";
      const isBot = id => id[0] === "b";
      const humans = () => E.order.filter(id => !isBot(id));
      const tok = ++LTOK;
      const alive = () => tok === LTOK && root.isConnected && !!root.querySelector("style[data-dc]") && !root.closest(".screen").hidden;
      const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(() => { if(alive()) fn(); }, ms); };
      function setup(){
        clearTimeout(timer);
        const total = names.length + bots;
        screen(root, "su" + bots + rounds + JSON.stringify(R), CSS + '<p class="howto">' + (names.length > 1 ? tr("Les joueurs se passent le téléphone à leur tour : les mains restent cachées.", "Players pass the phone around on their turn: hands stay hidden.") : tr("Une partie contre les robots.", "A game against the bots.")) + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Robots", "Bots") + '</span><div class="seg">' + [0, 1, 2, 3].map(b => '<button type="button" data-b="' + b + '" aria-pressed="' + (b === bots) + '">' + b + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Manches", "Rounds") + '</span><div class="seg">' + [1, 3, 5].map(x => '<button type="button" data-r="' + x + '" aria-pressed="' + (x === rounds) + '">' + x + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Règles maison", "House rules") + '</span><div class="packs">' + RULES.map(x => '<button type="button" class="pack" data-s="' + x[0] + '" aria-pressed="' + R[x[0]] + '"><span class="box">✓</span><span class="tx"><span class="nm">' + x[2] + '</span><span class="ds">' + x[3] + "</span></span></button>").join("") + "</div></div>" +
          (total < 2 ? '<p class="err">' + tr("Ajoute au moins un robot pour jouer seul.", "Add at least one bot to play solo.") + "</p>" : total > 10 ? '<p class="err">' + tr("10 joueurs maximum, robots compris.", "10 players max, bots included.") + "</p>" : "") +
          dock('<button class="btn acc" type="button" data-go' + (total < 2 || total > 10 ? " disabled" : "") + ">" + tr("Distribuer", "Deal") + "</button>"), r => {
          r.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { bots = +b.dataset.b; persist({ dcBots: bots }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ dcRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-s]").forEach(b => b.addEventListener("click", () => { const x = RULES.find(y => y[0] === b.dataset.s); R[x[0]] = !R[x[0]]; persist({ [x[1]]: R[x[0]] }); setup(); }));
          r.querySelector("[data-go]").addEventListener("click", () => {
            nameMap = {}; const ids = names.map((nm, i) => { nameMap["h" + i] = nm; return "h" + i; });
            for(let i = 0; i < bots; i++){ nameMap["b" + i] = BOTN[i] + " 🤖"; ids.push("b" + i); }
            E = { lg: SB.lang(), order: shuffle(ids), stack: R.stack, sz: R.sz, jump: R.jump, dp: R.dp, tw: R.tw, round: 1, rounds, score: {}, st: {} };
            newRound(E); viewer = humans().length === 1 ? humans()[0] : ""; sel = null; prevSel = null; gno++; jumpPc = E.pc || 0;
            step();
          });
        });
      }
      // Les robots attrapent les humains qui oublient « Dernière ! »
      function botCatch(){
        const bs = E.order.filter(isBot); if(!bs.length) return;
        const vic = humans().find(id => catchable(E, id));
        if(vic) later(() => { if(catchable(E, vic) && E.phase === "play"){ doCatch(E, bs[Math.floor(Math.random() * bs.length)], vic, nameOf); buzz([40, 40, 40]); } step(); }, 2600);
      }
      function step(){
        if(E.phase !== "play"){ end(); return; }
        // Interception : un robot qui a la même carte que celle du dessus saute parfois sur l'occasion.
        if(E.jump && E.pc !== jumpPc){
          jumpPc = E.pc;
          const jb = E.order.filter(id => isBot(id) && jumpable(E, id).some(Boolean))[0];
          if(jb && Math.random() < 0.6){ draw(viewer); later(() => { if(botJump(E, jb, nameOf)){ buzz([20, 20]); jumpPc = -1; } step(); }, 900); return; }
        }
        const cur = E.turn;
        if(isBot(cur)){
          draw(viewer);
          later(() => {
            // Un robot attentif attrape parfois l'humain qui a oublié « Dernière ! »
            const vic = humans().find(id => catchable(E, id));
            if(vic && Math.random() < 0.6){ doCatch(E, cur, vic, nameOf); buzz([40, 40, 40]); draw(viewer); later(() => { botMove(E, cur, nameOf); step(); }, 1700); return; }
            botMove(E, cur, nameOf); step();
          }, 1700);
          return;
        }
        if(viewer !== cur && humans().length > 1){
          clearTimeout(timer);
          screen(root, "pass" + cur + E.log + Math.random(), CSS + '<p class="dc-log">' + esc(E.log) + '</p><div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(nameOf(cur)) + "</div><p>" + tr("Les autres, ne regardez pas sa main.", "Everyone else, don't peek at their hand.") + "</p></div>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi", "It's me") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => { viewer = cur; step(); }));
          return;
        }
        draw(cur);
        botCatch();
      }
      function act(fn){ clearTimeout(timer); sel = null; prevSel = null; if(fn()) buzz(10); step(); }
      function draw(me){
        if(sel != null && !(E.turn === me ? playable(E, me)[sel] : canJump(E, me, sel))){ sel = null; prevSel = null; }
        const key = JSON.stringify([E.hands, E.top, E.color, E.turn, E.dir, E.pend, E.drew, E.called, E.log, sel, me, E.ban, E.dbl, E.extra, E.evn, evActive(E)]);
        paint(root, key, '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + " / " + E.rounds + "</span>" + tableHTML(E, me, nameOf, { act: E.turn === me, sel }) + dockHTML(E, me, { sel }, nameOf), r => {
          r.querySelectorAll(".dc-hand [data-c]").forEach(b => b.addEventListener("click", () => {
            const i = +b.dataset.c; buzz(6);
            sel = sel === i ? null : i; draw(me);
          }));
          const send = (col, to) => {
            const i = sel; if(i == null) return;
            const el = r.querySelector('.dc-hand [data-c="' + i + '"]'); if(el) grab(el);
            r.querySelectorAll("button").forEach(x => { x.disabled = true; });
            const dk = r.querySelector(".dock"); if(dk) dk.style.visibility = "hidden";
            clearTimeout(timer);
            optFly(r, el, (E.hands[me] || [])[i], () => act(() => (E.turn === me ? doPlay(E, me, i, col, nameOf, to) : doJump(E, me, i, nameOf, to) && (jumpPc = E.pc, true))));
          };
          const okb = r.querySelector("[data-ok]"); if(okb) okb.addEventListener("click", () => send(""));
          r.querySelectorAll("[data-col]").forEach(b => b.addEventListener("click", () => send(b.dataset.col)));
          r.querySelectorAll("[data-to]").forEach(b => b.addEventListener("click", () => send("", b.dataset.to)));
          const cn = r.querySelector("[data-cancel]"); if(cn) cn.addEventListener("click", () => { sel = null; draw(me); });
          r.querySelectorAll("[data-draw]").forEach(b => b.addEventListener("click", () => act(() => doDraw(E, me, nameOf))));
          const ps = r.querySelector("[data-pass]"); if(ps) ps.addEventListener("click", () => act(() => doPass(E, me, nameOf)));
          const cl = r.querySelector("[data-call]"); if(cl) cl.addEventListener("click", () => { buzz([20, 30, 20]); doCall(E, me, nameOf); draw(me); });
          r.querySelectorAll("[data-catch]").forEach(b => b.addEventListener("click", () => { doCatch(E, me || viewer, b.dataset.catch, nameOf); step(); }));
        });
        animate(root, E, me, "local" + tok + "-" + gno);
        evFx(root, E, "local" + tok + "-" + gno, nameOf);
        if(sel !== prevSel){ selFx(root, sel, prevSel); prevSel = sel; }
      }
      function end(){
        clearTimeout(timer);
        const last = E.phase === "end", champ = last && E.rounds > 1 ? bestOf(E) : E.winner;
        if(last && api.win) api.win([nameOf(champ)]);
        screen(root, "end" + E.round + E.phase, CSS + '<span class="eyebrow">' + (last ? (E.rounds > 1 ? tr("Vainqueur de la partie", "Game winner") : tr("Vainqueur", "Winner")) : tr("Manche " + E.round + " gagnée par", "Round " + E.round + " won by")) + '</span><div class="who">' + esc(nameOf(champ)) + "</div>" +
          '<p class="dc-log">' + esc(E.log) + "</p>" + (E.rounds > 1 ? '<div class="field"><span class="eyebrow">' + tr("Scores", "Scores") + "</span>" + scoresHTML(E, nameOf) + "</div>" : "") + (last ? awardsHTML(E, nameOf) : "") +
          dock(last ? '<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>" : '<button class="btn acc" type="button" data-n>' + tr("Manche suivante", "Next round") + "</button>"), r => {
          const nx = r.querySelector("[data-n]"); if(nx) nx.addEventListener("click", () => { E.round++; newRound(E); viewer = humans().length === 1 ? humans()[0] : ""; step(); });
          const a = r.querySelector("[data-a]"); if(a) a.addEventListener("click", api.again);
          const q = r.querySelector("[data-q]"); if(q) q.addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
};
DEF.engine = { fromState, publish, newRound, doPlay, doDraw, doPass, doCall, doCatch, doJump, botMove, botJump, playable, jumpable, canPlay, catchable, applyEvent, EVENTS, awards, awardLines, evInfo };
SB.register(DEF);
})();
