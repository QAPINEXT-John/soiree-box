/* Grille — chacun a 12 cartes face cachée en 3 lignes × 4 colonnes. À ton tour, prends la défausse ou pioche,
   remplace une de tes cartes, et vise le plus petit total. 3 cartes identiques dans une colonne : elle disparaît.
   En réseau, ou sur un téléphone contre des robots. */
(function(){
"use strict";
const { esc, A, shuffle, screen, store, persist, dock, buzz, tr } = SB.u;
// Textes du moteur (journal) : dans la langue de la partie (E.lg = langue de l'hôte, ou du téléphone en solo).
const L = (E, fr, en) => E && E.lg === "en" ? en : fr;
const rnd = n => Math.floor(Math.random() * n);

/* ---------- Cartes ----------
   150 cartes : −2 ×5, −1 ×10, 0 ×15, puis 1 à 12 ×10.
   Une grille = 12 cases, case i = ligne (i / 4) et colonne (i % 4).
   Dans le moteur : vals[id] = valeurs, up[id] = 0 (cachée), 1 (visible), 2 (retirée).
   À l'écran (et dans l'état partagé) : cells[id] = un nombre (visible), "h" (cachée) ou "x" (retirée). */
const ROWS = 3, COLS = 4, N = ROWS * COLS;
function newDeck(){
  const d = [];
  const add = (v, n) => { for(let i = 0; i < n; i++) d.push(v); };
  add(-2, 5); add(-1, 10); add(0, 15);
  for(let v = 1; v <= 12; v++) add(v, 10);
  return shuffle(d);
}
const fmt = v => (v < 0 ? "−" + (-v) : String(v));
function hue(v){ return v < 0 ? "neg" : v === 0 ? "zero" : v <= 4 ? "low" : v <= 8 ? "mid" : "high"; }

/* ---------- Coups de théâtre (au début d'une manche, jamais la première) ---------- */
const TWISTS = [
  { id: "glace", name: tr("Manche glacée", "Frozen round"), desc: tr("Les 0 comptent −1 au décompte.", "0s count as −1 when scoring.") },
  { id: "douze", name: tr("Douze maudits", "Cursed twelves"), desc: tr("Les 12 comptent 20 au décompte.", "12s count as 20 when scoring.") },
  { id: "trois", name: tr("Coup d'œil", "Sneak peek"), desc: tr("Chacun retourne 3 cartes au départ au lieu de 2.", "Everyone flips 3 cards at the start instead of 2.") },
  { id: "filet", name: tr("Sans filet", "No safety net"), desc: tr("Si celui qui finit n'a pas le plus petit score, il est triplé au lieu de doublé.", "If whoever finishes doesn't have the lowest score, it's tripled instead of doubled.") },
  { id: "cadeau", name: tr("Cadeau de la maison", "On the house"), desc: tr("La défausse démarre avec un −2.", "The discard pile starts with a −2.") }
];
const twistOf = id => SB.u.byTwist ? SB.u.byTwist(TWISTS, id) : TWISTS.find(t => t.id === id) || null;

/* ---------- Règles pures (testables sans écran) ---------- */
function cardPts(v, twi){ return twi === "glace" && v === 0 ? -1 : twi === "douze" && v === 12 ? 20 : v; }
// Somme des cartes encore en jeu (toutes, visibles ou non).
function gridScore(vals, up, twi){ let t = 0; for(let i = 0; i < N; i++) if(up[i] !== 2) t += cardPts(vals[i], twi); return t; }
// Somme des cartes visibles d'une grille vue de l'extérieur (cells).
function visScore(cells, twi){ return A(cells).reduce((t, c) => typeof c === "number" ? t + cardPts(c, twi) : t, 0); }
// Colonnes complètes : 3 cartes visibles de même valeur. Renvoie les colonnes retirées (et met leurs cartes sur la défausse).
function clearCols(vals, up, disc){
  const out = [];
  for(let c = 0; c < COLS; c++){
    const ix = [c, c + COLS, c + 2 * COLS];
    if(ix.every(i => up[i] === 1) && ix.every(i => vals[i] === vals[ix[0]])){
      ix.forEach(i => { up[i] = 2; if(disc) disc.push(vals[i]); });
      out.push(c);
    }
  }
  return out;
}
const allUp = up => A(up).every(u => u !== 0);
const hiddenIdx = up => A(up).map((u, i) => (u === 0 ? i : -1)).filter(i => i >= 0);
/* Doublement : si celui qui a fini n'a pas le score strictement le plus bas et que son score est positif,
   son score est doublé (triplé avec « Sans filet »). Renvoie { scores, doubled }. */
function applyDouble(raw, closer, mult){
  const scores = Object.assign({}, raw);
  if(!closer || raw[closer] == null) return { scores, doubled: false };
  const mine = raw[closer], lowest = Object.keys(raw).every(id => id === closer || raw[id] > mine);
  if(!lowest && mine > 0){ scores[closer] = mine * (mult || 2); return { scores, doubled: true }; }
  return { scores, doubled: false };
}
// Fin de partie : quelqu'un atteint ou dépasse l'objectif (goal 1 = une seule manche).
function gameOver(score, goal, round){ if(goal === 1) return round >= 1; return Object.keys(score).some(id => (score[id] || 0) >= goal); }
function winners(score, order){ const lo = Math.min.apply(null, order.map(id => score[id] || 0)); return order.filter(id => (score[id] || 0) === lo); }
// Qui commence la 1re manche : la plus grosse somme de cartes visibles (à égalité, le premier dans l'ordre).
function starter(E){
  let best = null, bv = -1e9;
  E.order.forEach(id => { const v = gridScoreVisible(E, id); if(v > bv){ bv = v; best = id; } });
  return best;
}
function gridScoreVisible(E, id){ let t = 0; for(let i = 0; i < N; i++) if(E.up[id][i] === 1) t += cardPts(E.vals[id][i], E.twi); return t; }

/* ---------- Moteur commun (réseau et un seul téléphone) ----------
   E = { lg, order, round, goal, tw, twi, nflip, phase ("flip" | "play" | "roundend" | "end"), turn, step ("pick" | "held" | "done"),
         held, vals, up, draw, disc, closer, prev, score, rs, raw, dbl, log, mv } */
/* Gages : le moteur note les événements du coup en cours (GX), l'hôte ou le téléphone les envoie ensuite d'un seul coup. */
const GX = [];
function draw1(E){
  if(!E.draw.length && E.disc.length > 1){ const top = E.disc.pop(); E.draw = shuffle(E.disc); E.disc = [top]; }
  return E.draw.length ? E.draw.pop() : null;
}
function newRound(E){
  if(E.round > 1 && E.tw){ const t = SB.u.twist ? SB.u.twist(TWISTS, { rate: 0.5, last: E.twi }) : null; E.twi = t ? t.id : ""; }
  else E.twi = "";
  E.draw = newDeck(); E.disc = []; E.vals = {}; E.up = {};
  if(E.twi === "cadeau"){ const k = E.draw.indexOf(-2); E.draw.splice(k, 1); }
  E.order.forEach(id => { E.vals[id] = []; E.up[id] = []; for(let i = 0; i < N; i++){ E.vals[id].push(E.draw.pop()); E.up[id].push(0); } });
  E.disc.push(E.twi === "cadeau" ? -2 : E.draw.pop());
  E.nflip = E.twi === "trois" ? 3 : 2;
  E.phase = "flip"; E.turn = ""; E.step = "pick"; E.held = ""; E.closer = ""; E.rs = {}; E.raw = {}; E.dbl = ""; E.mv = (E.mv || 0) + 1;
  E.log = L(E, "Manche " + E.round + " : retourne " + E.nflip + " cartes.", "Round " + E.round + ": flip " + E.nflip + " cards.");
}
const flipped = (E, id) => A(E.up[id]).filter(u => u === 1).length;
function doFlipStart(E, id, i, nameOf){
  if(E.phase !== "flip" || !E.up[id] || E.up[id][i] !== 0 || flipped(E, id) >= E.nflip) return false;
  E.up[id][i] = 1; E.mv++;
  if(E.order.every(x => flipped(E, x) >= E.nflip)) beginPlay(E, nameOf);
  return true;
}
function botFlipStart(E, id, nameOf){
  let ok = false;
  while(E.phase === "flip" && flipped(E, id) < E.nflip){ const h = hiddenIdx(E.up[id]); ok = doFlipStart(E, id, h[rnd(h.length)], nameOf) || ok; }
  return ok;
}
function beginPlay(E, nameOf){
  const first = E.prev && E.order.indexOf(E.prev) >= 0 ? E.prev : starter(E);
  E.phase = "play"; E.turn = first; E.step = "pick"; E.held = "";
  const nm = nameOf ? nameOf(first) : "?";
  E.log = E.prev ? L(E, nm + " a fini la manche d'avant : à lui de commencer.", nm + " finished last round, so they go first.") : L(E, nm + " a la plus grosse somme : à lui de commencer.", nm + " has the highest total, so they go first.");
}
const nextOf = (E, id) => E.order[(E.order.indexOf(id) + 1) % E.order.length];
const topOf = E => (E.disc.length ? E.disc[E.disc.length - 1] : "");
// A. Prendre la défausse et l'échanger avec la case i.
function doTake(E, id, i, nameOf){
  if(E.phase !== "play" || E.turn !== id || E.step !== "pick" || !E.disc.length) return false;
  if(!(i >= 0 && i < N) || E.up[id][i] === 2) return false;
  const v = E.disc.pop(), old = E.vals[id][i];
  E.vals[id][i] = v; E.up[id][i] = 1; E.disc.push(old);
  E.log = L(E, nameOf(id) + " prend le " + fmt(v) + " de la défausse et jette un " + fmt(old), nameOf(id) + " takes the " + fmt(v) + " from the discard and throws away a " + fmt(old));
  return afterMove(E, id, nameOf);
}
// B. Piocher : la carte reste en main jusqu'au choix suivant.
function doDraw(E, id, nameOf){
  if(E.phase !== "play" || E.turn !== id || E.step !== "pick") return false;
  const c = draw1(E); if(c === null) return false;
  E.held = c; E.step = "held"; E.mv++;
  E.log = L(E, nameOf(id) + " pioche un " + fmt(c), nameOf(id) + " draws a " + fmt(c));
  return true;
}
// B1. Échanger la carte piochée avec la case i.
function doSwap(E, id, i, nameOf){
  if(E.phase !== "play" || E.turn !== id || E.step !== "held") return false;
  if(!(i >= 0 && i < N) || E.up[id][i] === 2) return false;
  const v = E.held, old = E.vals[id][i];
  E.vals[id][i] = v; E.up[id][i] = 1; E.disc.push(old); E.held = "";
  E.log = L(E, nameOf(id) + " garde le " + fmt(v) + " et jette un " + fmt(old), nameOf(id) + " keeps the " + fmt(v) + " and throws away a " + fmt(old));
  return afterMove(E, id, nameOf);
}
// B2. Défausser la carte piochée et retourner la case cachée i.
function doToss(E, id, i, nameOf){
  if(E.phase !== "play" || E.turn !== id || E.step !== "held") return false;
  const hid = hiddenIdx(E.up[id]);
  if(hid.length && hid.indexOf(i) < 0) return false;
  E.disc.push(E.held);
  const v = E.held; E.held = "";
  if(hid.length) E.up[id][i] = 1;
  E.log = hid.length ? L(E, nameOf(id) + " défausse le " + fmt(v) + " et retourne un " + fmt(E.vals[id][i]), nameOf(id) + " discards the " + fmt(v) + " and flips a " + fmt(E.vals[id][i])) : L(E, nameOf(id) + " défausse le " + fmt(v), nameOf(id) + " discards the " + fmt(v));
  return afterMove(E, id, nameOf);
}
function afterMove(E, id, nameOf){
  const cols = clearCols(E.vals[id], E.up[id], E.disc);
  cols.forEach(() => GX.push({ id, ev: "col" }));
  if(cols.length) E.log += L(E, " · colonne éliminée !", " · column cleared!");
  // Le coup est joué : le joueur le regarde, puis touche « Fin du tour » (doEnd) pour passer la main.
  E.step = "done"; E.mv++;
  if(!E.closer && allUp(E.up[id])){ E.closer = id; E.log += L(E, " · " + nameOf(id) + " a tout retourné : dernier tour pour les autres !", " · " + nameOf(id) + " has flipped everything: last turn for everyone else!"); }
  return true;
}
// Fin du tour : on passe au joueur suivant (ou on termine la manche après le dernier tour).
function doEnd(E, id, nameOf){
  if(E.phase !== "play" || E.turn !== id || E.step !== "done") return false;
  const nx = nextOf(E, id);
  E.step = "pick"; E.mv++;
  if(E.closer && nx === E.closer){ endRound(E, nameOf); return true; }
  E.turn = nx;
  return true;
}
function endRound(E, nameOf){
  E.order.forEach(id => {
    for(let i = 0; i < N; i++) if(E.up[id][i] === 0) E.up[id][i] = 1;
    clearCols(E.vals[id], E.up[id], E.disc).forEach(() => GX.push({ id, ev: "col" }));
  });
  const raw = {}; E.order.forEach(id => { raw[id] = gridScore(E.vals[id], E.up[id], E.twi); });
  const r = applyDouble(raw, E.closer, E.twi === "filet" ? 3 : 2);
  E.raw = raw; E.rs = r.scores; E.dbl = r.doubled ? E.closer : "";
  E.order.forEach(id => { E.score[id] = (E.score[id] || 0) + E.rs[id]; });
  if(r.doubled) GX.push({ id: E.closer, ev: "double" });
  E.phase = gameOver(E.score, E.goal, E.round) ? "end" : "roundend";
  // Plus gros / plus petit score : pas à la dernière manche, la fin de partie (gagnant, perdants) est gérée par le cœur.
  const vs = E.order.map(id => E.rs[id]), hi = Math.max.apply(null, vs), lo = Math.min.apply(null, vs);
  if(hi !== lo && E.phase === "roundend"){
    E.order.filter(id => E.rs[id] === hi).forEach(id => GX.push({ id, ev: "max" }));
    E.order.filter(id => E.rs[id] === lo).forEach(id => GX.push({ id, ev: "min" }));
  }
  E.prev = E.closer; E.turn = ""; E.held = ""; E.step = "pick"; E.mv++;
  E.log = L(E, nameOf(E.closer) + " a fini la manche", nameOf(E.closer) + " finished the round") + (r.doubled ? L(E, " sans le plus petit score : ses points sont " + (E.twi === "filet" ? "triplés" : "doublés") + " !", " without the lowest score: their points are " + (E.twi === "filet" ? "tripled" : "doubled") + "!") : ".");
}

/* ---------- Robots : une stratégie simple et raisonnable ---------- */
// Case qui compléterait une colonne avec la valeur v (les deux autres cartes de la colonne sont visibles et valent v).
function colSlot(vals, up, v){
  for(let c = 0; c < COLS; c++){
    const ix = [c, c + COLS, c + 2 * COLS];
    if(ix.some(i => up[i] === 2)) continue;
    const same = ix.filter(i => up[i] === 1 && vals[i] === v);
    if(same.length === 2){ const t = ix.find(i => same.indexOf(i) < 0); return t; }
  }
  return -1;
}
// Où poser une carte v : la plus grosse carte visible si v est nettement mieux, sinon une case cachée (de préférence dans une colonne où v a un double).
function placeFor(E, id, v, margin){
  const vals = E.vals[id], up = E.up[id], tw = E.twi;
  const cs = colSlot(vals, up, v); if(cs >= 0) return cs;
  let hiI = -1, hiV = -1e9;
  for(let i = 0; i < N; i++) if(up[i] === 1 && cardPts(vals[i], tw) > hiV && !inPair(vals, up, i)){ hiV = cardPts(vals[i], tw); hiI = i; }
  if(hiI >= 0 && hiV - cardPts(v, tw) >= margin) return hiI;
  const hid = hiddenIdx(up);
  if(hid.length && cardPts(v, tw) <= 4){
    const pref = hid.filter(i => { const c = i % COLS; return [c, c + COLS, c + 2 * COLS].some(j => j !== i && up[j] === 1 && vals[j] === v); });
    // Ne pas retourner sa dernière carte cachée avec un gros total : on garde la main.
    if(hid.length > 1 || safeToClose(E, id, v)) return (pref.length ? pref : hid)[rnd((pref.length ? pref : hid).length)];
  }
  return -1;
}
function inPair(vals, up, i){ const c = i % COLS; return [c, c + COLS, c + 2 * COLS].filter(j => j !== i && up[j] === 1 && vals[j] === vals[i]).length >= 1 && up[i] === 1; }
// Finir maintenant est raisonnable si on a sans doute le plus petit total.
function safeToClose(E, id, v){
  const mine = gridScoreVisible(E, id) + (v == null ? 0 : cardPts(v, E.twi));
  return E.order.every(x => x === id || mine < gridScoreVisible(E, x) + hiddenIdx(E.up[x]).length * 4);
}
// Les robots (et l'hôte qui joue pour un absent) finissent leur tour tout seuls.
function botMove(E, id, nameOf){
  if(E.phase === "flip") return botFlipStart(E, id, nameOf);
  if(E.phase !== "play" || E.turn !== id) return false;
  if(E.step === "done") return doEnd(E, id, nameOf);
  const r = botAct(E, id, nameOf);
  if(E.phase === "play" && E.turn === id && E.step === "done") doEnd(E, id, nameOf);
  return r;
}
function botAct(E, id, nameOf){
  if(E.step === "pick"){
    const t = topOf(E);
    if(t !== ""){
      const cs = colSlot(E.vals[id], E.up[id], t);
      if(cs >= 0) return doTake(E, id, cs, nameOf);
      if(cardPts(t, E.twi) <= 3){ const i = placeFor(E, id, t, 1); if(i >= 0) return doTake(E, id, i, nameOf); }
    }
    if(!doDraw(E, id, nameOf)) return false;
  }
  if(E.step === "held"){
    const v = E.held, i = placeFor(E, id, v, 2);
    if(i >= 0) return doSwap(E, id, i, nameOf);
    const hid = hiddenIdx(E.up[id]);
    if(hid.length === 1 && !safeToClose(E, id, null)){
      // Retourner la dernière carte finirait la manche en mauvaise posture : on échange plutôt la plus grosse visible.
      let hiI = -1, hiV = -1e9;
      for(let k = 0; k < N; k++) if(E.up[id][k] === 1 && E.vals[id][k] > hiV){ hiV = E.vals[id][k]; hiI = k; }
      if(hiI >= 0 && hiV > v) return doSwap(E, id, hiI, nameOf);
    }
    return doToss(E, id, hid.length ? hid[rnd(hid.length)] : -1, nameOf);
  }
  return false;
}

/* ---------- Vue (ce que tout le monde peut voir) ---------- */
function cellsOf(E, id){ return E.vals[id].map((v, i) => (E.up[id][i] === 1 ? v : E.up[id][i] === 2 ? "x" : "h")); }
function viewOf(E){
  const V = { cells: {} };
  ["lg", "order", "round", "goal", "twi", "nflip", "phase", "turn", "step", "held", "closer", "score", "rs", "raw", "dbl", "log", "mv"].forEach(k => { V[k] = E[k]; });
  E.order.forEach(id => { V.cells[id] = cellsOf(E, id); });
  V.top = topOf(E); V.left = E.draw.length;
  return V;
}

/* ---------- Affichage ---------- */
const CSS = '<style data-gr>' +
  '.gr-c{--c:#333; --t:#fff; position:relative; aspect-ratio:3/4; width:100%; border-radius:12px; background:var(--c); color:var(--t); border:3px solid #fff; box-shadow:0 1px 0 rgba(0,0,0,.15), 0 6px 14px -8px rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; font-family:var(--f-hand); font-weight:800; font-size:30px; line-height:1; padding:0; font-variant-numeric:tabular-nums}' +
  '.gr-c .cr{position:absolute; top:4px; left:6px; font-size:12px; font-weight:800}' +
  '.gr-c.neg{--c:#1e3a8a}.gr-c.zero{--c:#8fd0fb; --t:#0d2a45}.gr-c.low{--c:#22964a}.gr-c.mid{--c:#f2c230; --t:#2a1d00}.gr-c.high{--c:#e0393e}' +
  '.gr-c.h{background:repeating-linear-gradient(45deg,#1d1b2e 0 10px,#2b2846 10px 20px); color:rgba(255,255,255,.55); font-size:22px}' +
  '.gr-c.x{background:transparent; border:2px dashed var(--line); box-shadow:none}' +
  '.gr-c:disabled{cursor:default}.gr-c.can{box-shadow:0 0 0 3px var(--acc), 0 8px 16px -8px rgba(0,0,0,.7)}.gr-c.sel{transform:translateY(-4px) scale(1.04); box-shadow:0 0 0 3px var(--bg), 0 0 0 6px var(--ink)}' +
  '.gr-c.new{animation:gr-flip .45s cubic-bezier(.3,.7,.3,1)}@keyframes gr-flip{0%{transform:rotateY(90deg)}100%{transform:none}}' +
  '.gr-grid{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; max-width:284px; width:100%; margin:0 auto}' +
  '.gr-me{display:flex; justify-content:space-between; align-items:baseline; max-width:284px; width:100%; margin:0 auto}.gr-me b{font-family:var(--f-disp); font-size:18px}' +
  '.gr-opp{display:flex; flex-wrap:wrap; gap:8px; justify-content:center}' +
  '.gr-o{display:flex; flex-direction:column; gap:4px; padding:6px 8px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); min-width:78px}' +
  '.gr-o.on{border-color:var(--acc); box-shadow:0 0 0 2px var(--acc)}.gr-o .nm{display:flex; justify-content:space-between; gap:6px; font-weight:800; font-size:12px; white-space:nowrap}.gr-o .nm span{max-width:70px; overflow:hidden; text-overflow:ellipsis}.gr-o .nm i{font-style:normal; color:var(--muted); font-variant-numeric:tabular-nums}' +
  '.gr-mini{display:grid; grid-template-columns:repeat(4,14px); gap:2px}.gr-mini .gr-c{width:14px; border-radius:3px; border-width:1px; font-size:8px; box-shadow:none}.gr-mini .gr-c.h{background:#2b2846}.gr-mini .gr-c.x{border-width:1px}.gr-mini .gr-c .cr,.gr-pile .gr-c .cr{display:none}.gr-mini .gr-c.h{font-size:0}' +
  '.gr-o.big .gr-mini{grid-template-columns:repeat(4,22px); gap:3px}.gr-o.big .gr-mini .gr-c{width:22px; font-size:11px; border-radius:4px}' +
  '.gr-table{display:flex; justify-content:center; align-items:flex-end; gap:16px; padding:0}' +
  '.gr-pile{display:flex; flex-direction:column; align-items:center; gap:3px; width:54px; font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; background:none; border:0; padding:0}' +
  '.gr-pile .gr-c{font-size:24px; border-width:2px; border-radius:9px}.gr-held{width:64px}.gr-held .gr-c{box-shadow:0 0 0 3px var(--acc), 0 10px 20px -8px rgba(0,0,0,.8); font-size:30px}' +
  '.gr-pile:disabled{opacity:1}.gr-pile.on .gr-c{box-shadow:0 0 0 3px var(--acc)}' +
  '.gr-turn{text-align:center; font-family:var(--f-hand); font-weight:800; font-size:24px; color:var(--acc); line-height:1.05}.gr-last{display:block; font-family:var(--f-body,inherit); font-size:13px; color:var(--bad); letter-spacing:.04em; text-transform:uppercase; margin-top:2px}' +
  '.gr-log{text-align:center; font-weight:700; font-size:13px; min-height:1.3em; margin:0; color:var(--muted)}' +
  '.gr-log.gr-hint{color:var(--ink); font-weight:800; font-size:15px}.gr-mid{display:flex; flex-direction:column; gap:8px}.gr-mine{display:flex; flex-direction:column; gap:6px}' +
  '.gr-sc{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.gr-sc li{display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; background:var(--card); border:1.5px solid var(--line); font-weight:700}.gr-sc li .r{color:var(--muted); font-size:13px}.gr-sc li b{font-variant-numeric:tabular-nums}.gr-sc .x2{color:var(--bad); font-weight:800}' +
  '.gr-sc li.w{border-color:var(--ok)}' +
  '.gr-ends{display:flex; flex-wrap:wrap; gap:8px; justify-content:center}</style>';
function cardHTML(v, extra, attrs, tag){
  tag = tag || "button";
  const cls = v === "h" ? "h" : v === "x" ? "x" : hue(v);
  const lab = v === "h" ? tr("Carte cachée", "Hidden card") : v === "x" ? tr("Case vide", "Empty slot") : fmt(v);
  const face = v === "h" ? "?" : v === "x" ? "" : '<span class="cr">' + esc(fmt(v)) + "</span>" + esc(fmt(v));
  return "<" + tag + (tag === "button" ? ' type="button"' : ' role="img"') + ' class="gr-c ' + cls + (extra ? " " + extra : "") + '"' + (attrs || "") + ' aria-label="' + esc(lab) + '">' + face + "</" + tag + ">";
}
function miniHTML(cells){ return '<div class="gr-mini">' + A(cells).map(c => cardHTML(c, "", "", "span")).join("") + "</div>"; }
function ptsTxt(n){ return tr(n + " pt" + (Math.abs(n) > 1 ? "s" : ""), n + (Math.abs(n) === 1 ? " pt" : " pts")); }
/* Plateau vu par `me` (ou par personne si me est vide).
   ui : { take (défausse choisie), toss (mode « défausser et retourner »), pend (coup envoyé), mine: [cases retournées en attente], fresh: [cases qui viennent d'être retournées] } */
function tableHTML(V, me, nameOf, ui){
  const myTurn = V.phase === "play" && V.turn === me && !ui.pend;
  const others = V.order.filter(id => id !== me);
  const t = twistOf(V.twi);
  let h = CSS;
  if(t) h += SB.u.twistHTML(t);
  h += '<div class="gr-opp">' + others.map(id => '<div class="gr-o' + (V.turn === id ? " on" : "") + '" data-o="' + esc(id) + '"><div class="nm"><span>' + esc(nameOf(id)) + "</span><i>" + visScore(V.cells[id], V.twi) + "</i></div>" + miniHTML(V.cells[id]) + "</div>").join("") + "</div>";
  // À qui le tour
  let turn = "";
  if(V.phase === "flip"){
    const left = me && V.cells[me] ? V.nflip - A(V.cells[me]).filter(c => typeof c === "number").length - (ui.mine || []).length : 0;
    turn = me && left > 0 ? (left < V.nflip ? tr("Retourne encore " + left + " carte", "Flip " + left + " more card" + (left > 1 ? "s" : "")) : tr("Retourne " + left + " cartes pour commencer", "Flip " + left + " cards to start")) : tr("C'est bon ! On attend que les autres retournent leurs cartes…", "Done! Waiting for the others to flip their cards…");
  } else if(V.phase === "play") turn = V.turn === me ? tr("À toi !", "Your turn!") : tr("Au tour de " + esc(nameOf(V.turn)), esc(nameOf(V.turn)) + "'s turn");
  h += '<div class="gr-mid"><div class="gr-turn">' + turn + (V.closer && V.phase === "play" ? '<span class="gr-last">' + tr("Dernier tour ! " + esc(nameOf(V.closer)) + " a tout retourné", "Last turn! " + esc(nameOf(V.closer)) + " flipped everything") + "</span>" : "") + "</div>";
  // Pioche, carte en main, défausse
  const canPick = myTurn && V.step === "pick";
  h += '<div class="gr-table"><button type="button" class="gr-pile" data-draw' + (canPick && !ui.take ? "" : " disabled") + ">" + cardHTML("h", "", "", "span") + tr("Pioche", "Draw") + " · " + (V.left || 0) + "</button>";
  if(V.step === "held" && V.held !== "") h += '<div class="gr-pile gr-held">' + cardHTML(V.held, "", "", "span") + tr("Piochée", "Drawn") + "</div>";
  h += '<button type="button" class="gr-pile' + (ui.take ? " on" : "") + '" data-take' + (canPick && V.top !== "" ? "" : " disabled") + ">" + (V.top !== "" ? cardHTML(V.top, ui.take ? "sel" : "", "", "span") : cardHTML("x", "", "", "span")) + tr("Défausse", "Discard") + "</button></div>";
  const hint = hintTxt(V, me, ui);
  h += hint ? '<p class="gr-log gr-hint">' + esc(hint) + "</p></div>" : '<p class="gr-log">' + esc(V.log || "") + "</p></div>";
  if(me && V.cells[me]){
    const cells = V.cells[me], fr = ui.fresh || [];
    const can = i => {
      const c = cells[i];
      if(ui.pend) return false;
      if(V.phase === "flip") return c === "h" && (ui.mine || []).indexOf(i) < 0 && V.nflip - cells.filter(x => typeof x === "number").length - (ui.mine || []).length > 0;
      if(!myTurn) return false;
      if(V.step === "pick") return !!ui.take && c !== "x";
      if(V.step === "held") return ui.toss ? c === "h" : c !== "x";
      return false;
    };
    h += '<div class="gr-mine"><div class="gr-me"><span class="eyebrow">' + tr("Ta grille", "Your grid") + '</span><b>' + ptsTxt(visScore(cells, V.twi)) + "</b></div>";
    h += '<div class="gr-grid">' + cells.map((c, i) => {
      const pend = (ui.mine || []).indexOf(i) >= 0, ok = can(i);
      return cardHTML(c, (ok ? "can" : "") + (pend ? " sel" : "") + (fr.indexOf(i) >= 0 ? " new" : ""), ' data-i="' + i + '"' + (ok ? "" : " disabled"));
    }).join("") + "</div></div>";
  }
  return h;
}
/* Ce qu'il faut faire maintenant (à la place du journal quand c'est à toi). */
function hintTxt(V, me, ui){
  if(!me || ui.pend || V.phase !== "play" || V.turn !== me) return "";
  if(V.step === "pick") return ui.take ? tr("Touche la carte à remplacer par le " + fmt(V.top), "Tap the card to replace with the " + fmt(V.top)) : "";
  if(V.step === "held") return ui.toss ? tr("Touche une carte cachée à retourner", "Tap a hidden card to flip") : tr("Touche une carte pour l'échanger avec le " + fmt(V.held), "Tap a card to swap it with the " + fmt(V.held));
  if(V.step === "done") return tr("C'est joué. Touche « Fin du tour » pour passer la main.", "Done. Tap “End turn” to pass.");
  return "";
}
/* Barre du bas : ce qu'il faut faire maintenant. */
function dockHTML(V, me, ui){
  if(!me || ui.pend) return ui.pend ? dock('<p class="wait">' + tr("C'est joué…", "Played…") + "</p>") : "";
  if(V.phase !== "play" || V.turn !== me) return "";
  if(V.step === "pick"){
    if(ui.take) return dock('<button class="btn ghost" type="button" data-cancel>' + tr("Annuler", "Cancel") + "</button>");
    return dock('<div class="row">' + (V.top !== "" ? '<button class="btn ghost" type="button" data-take>' + tr("Prendre le ", "Take the ") + esc(fmt(V.top)) + "</button>" : "") + '<button class="btn acc" type="button" data-draw>' + tr("Piocher", "Draw") + "</button></div>");
  }
  if(V.step === "held"){
    if(ui.toss) return dock('<button class="btn ghost" type="button" data-cancel>' + tr("Annuler", "Cancel") + "</button>");
    const hid = A(V.cells[me]).some(c => c === "h");
    return dock('<button class="btn ghost" type="button" data-toss>' + (hid ? tr("Défausser et retourner une carte", "Discard it and flip a card") : tr("Défausser", "Discard it")) + "</button>");
  }
  if(V.step === "done") return dock('<button class="btn acc" type="button" data-end>' + tr("Fin du tour", "End turn") + "</button>");
  return "";
}
/* Met à jour la table sans l'animation d'entrée ni remonter en haut. */
function paint(root, key, html, bind){
  key = "gr:" + key;
  if(root.dataset.key === key) return;
  if(!/^gr:/.test(root.dataset.key || "")){ screen(root, key, html, bind); return; }
  const sc = root.closest(".screen"), top = sc ? sc.scrollTop : 0;
  root.dataset.key = key; root.innerHTML = html;
  if(sc) sc.scrollTop = top;
  if(bind) bind(root);
}
// Cartes qui viennent d'être retournées (pour la petite animation), par rapport au dernier affichage.
const SEENC = { key: "", cells: null };
function freshCells(key, cells){
  const prev = SEENC.key === key ? SEENC.cells : null, out = [];
  if(prev) A(cells).forEach((c, i) => { if(typeof c === "number" && prev[i] !== c) out.push(i); });
  SEENC.key = key; SEENC.cells = A(cells).slice();
  return out;
}
function endHTML(V, nameOf){
  const last = V.phase === "end", w = winners(V.score, V.order);
  const rows = V.order.slice().sort((a, b) => (V.score[a] || 0) - (V.score[b] || 0)).map(id =>
    '<li class="' + (last && w.indexOf(id) >= 0 ? "w" : "") + '"><span>' + esc(nameOf(id)) + '<br><span class="r">' + tr("Manche : ", "Round: ") + (V.dbl === id ? (V.raw || {})[id] + ' <span class="x2">' + (V.twi === "filet" ? "×3" : "×2") + "</span> = " : "") + (V.rs[id] || 0) + "</span></span><b>" + ptsTxt(V.score[id] || 0) + "</b></li>").join("");
  return CSS + '<span class="eyebrow">' + (last ? (w.length > 1 ? tr("Égalité !", "It's a tie!") : tr("Vainqueur", "Winner")) : tr("Fin de la manche " + V.round, "End of round " + V.round)) + "</span>" +
    (last ? '<div class="who">' + esc(w.map(nameOf).join(" & ")) + "</div>" : "") +
    '<p class="gr-log">' + esc(V.log) + "</p>" +
    '<div class="field"><span class="eyebrow">' + (V.goal === 1 ? tr("Scores", "Scores") : tr("Scores · objectif " + V.goal, "Scores · target " + V.goal)) + '</span><ul class="gr-sc">' + rows + "</ul></div>" +
    '<div class="gr-ends">' + V.order.map(id => '<div class="gr-o big"><div class="nm"><span>' + esc(nameOf(id)) + "</span><i>" + (V.rs[id] || 0) + "</i></div>" + miniHTML(V.cells[id]) + "</div>").join("") + "</div>";
}
function endLines(V, nameOf, sep){ return V.order.slice().sort((a, b) => (V.score[a] || 0) - (V.score[b] || 0)).slice(0, 3).map((id, i) => (i + 1) + ". " + nameOf(id) + sep + (V.score[id] || 0) + " pts"); }

/* ---------- Réseau : l'état public (s) + la pioche et les cartes cachées chez l'hôte (priv) ---------- */
function fromState(s, priv){
  const E = JSON.parse(JSON.stringify(s)); delete E.k; delete E.cells; delete E.top; delete E.left;
  E.order = A(s.order).slice(); E.vals = {}; E.up = {};
  const pv = (priv && priv.vals) || {};
  E.order.forEach(id => {
    const cells = A((s.cells || {})[id]), v = A(pv[id]);
    E.vals[id] = cells.map((c, i) => (typeof c === "number" ? c : v[i] != null ? +v[i] : 0));
    E.up[id] = cells.map(c => (c === "h" ? 0 : c === "x" ? 2 : 1));
  });
  E.draw = A(priv && priv.draw).slice(); E.disc = A(priv && priv.disc).slice();
  E.score = Object.assign({}, s.score); E.rs = Object.assign({}, s.rs); E.raw = Object.assign({}, s.raw); E.seen = Object.assign({}, s.seen);
  E.held = s.held === "" || s.held == null ? "" : +s.held; E.mv = +s.mv || 0; E.goal = +s.goal || 100; E.round = +s.round || 1; E.nflip = +s.nflip || 2;
  E.tw = !!s.tw; E.twi = s.twi || ""; E.closer = s.closer || ""; E.prev = s.prev || ""; E.dbl = s.dbl || ""; E.turn = s.turn || ""; E.step = s.step || "pick";
  return E;
}
function publish(c, E){
  c.setPriv({ draw: E.draw, disc: E.disc, vals: E.vals });
  const o = Object.assign({}, E); delete o.draw; delete o.disc; delete o.vals; delete o.up;
  o.cells = {}; E.order.forEach(id => { o.cells[id] = cellsOf(E, id); });
  o.top = topOf(E); o.left = E.draw.length;
  c.set(o);
}
// Envoie les gages notés pendant le coup (une clé unique par coup : manche, numéro du coup, phase).
function flushNet(c, E){
  const list = GX.splice(0);
  if(list.length) c.gage(list, "gr" + c.g.gid + ":" + E.round + ":" + E.mv + ":" + E.phase);
}
function netView(s){ const V = Object.assign({}, s); V.order = A(s.order); V.cells = {}; V.order.forEach(id => { V.cells[id] = A((s.cells || {})[id]); }); V.score = Object.assign({}, s.score); V.rs = Object.assign({}, s.rs); V.raw = Object.assign({}, s.raw); V.top = s.top === "" || s.top == null ? "" : +s.top; V.held = s.held === "" || s.held == null ? "" : +s.held; V.goal = +s.goal || 100; return V; }
const UI = { k: "", take: false, toss: false, pend: null, mine: [] };
let LTOK = 0;

const DEF = {
  id: "grille", name: tr("Grille", "Grid"), glyph: "−2", pitch: tr("12 cartes cachées, vise le plus petit total.", "12 hidden cards, aim for the lowest total."), hot: false,
  accent: { light: "#1aa6b7", dark: "#3ccbd9" },
  tag: tr("12 cartes face cachée en grille. Prends la défausse ou pioche, remplace tes grosses cartes, aligne 3 cartes identiques pour faire disparaître une colonne. Le plus petit total gagne.", "12 face-down cards in a grid. Take the discard or draw, swap out your big cards, line up 3 identical cards to clear a column. Lowest total wins."),
  min: 2, max: 8,
  gages: [
    { ev: "max", label: tr("Plus gros score de la manche", "Highest score of the round"), kind: "boit", n: 2 },
    { ev: "double", label: tr("Score doublé (fin de manche ratée)", "Score doubled (botched finish)"), kind: "boit", n: 1 },
    { ev: "col", label: tr("Colonne éliminée", "Column cleared"), kind: "distribue", n: 1 },
    { ev: "min", label: tr("Plus petit score de la manche", "Lowest score of the round"), kind: "distribue", n: 2 }
  ],
  rules: tr([
    "Chacun a 12 cartes face cachée, en 3 lignes de 4. Les cartes vont de −2 à 12. Au début de la manche, retourne 2 cartes de ton choix.",
    "La plus grosse somme commence la première manche. Ensuite, c'est celui qui a fini la manche d'avant qui commence.",
    "À ton tour, au choix : prends la carte du dessus de la défausse et échange-la avec une de tes cartes (visible ou cachée), ou pioche.",
    "Si tu pioches : échange la carte avec une des tiennes, ou défausse-la et retourne une de tes cartes cachées.",
    "La carte que tu remplaces part face visible sur la défausse.",
    "Colonne complète : 3 cartes visibles de même valeur dans une colonne, et elle disparaît.",
    "Dès qu'un joueur a toutes ses cartes visibles, chacun des autres joue encore un tour. Puis on retourne tout et on compte.",
    "Attention : si celui qui a fini n'a pas le score strictement le plus bas, et que son score est positif, ses points de la manche sont doublés.",
    "La partie s'arrête quand quelqu'un atteint l'objectif (50 ou 100 points), ou après une seule manche. Le plus petit total gagne.",
    "Coups de théâtre : certaines manches changent une règle (les 0 comptent −1, 3 cartes retournées au départ…)."
  ], [
    "Everyone has 12 face-down cards, in 3 rows of 4. Cards go from −2 to 12. At the start of the round, flip 2 cards of your choice.",
    "Highest total goes first in the first round. After that, whoever finished the previous round goes first.",
    "On your turn, either take the top card of the discard pile and swap it with one of your cards (face-up or face-down), or draw.",
    "If you draw: swap the card with one of yours, or discard it and flip one of your face-down cards.",
    "The card you replace goes face-up on the discard pile.",
    "Full column: 3 face-up cards of the same value in a column, and it disappears.",
    "As soon as a player has all their cards face-up, everyone else plays one more turn. Then flip everything and count.",
    "Watch out: if whoever finished doesn't have the strictly lowest score, and their score is positive, their round points are doubled.",
    "The game ends when someone reaches the target (50 or 100 points), or after a single round. Lowest total wins.",
    "Plot twists: some rounds change a rule (0s count −1, 3 cards flipped at the start…)."
  ]),
  options: [
    { id: "goal", label: tr("Objectif", "Target"), type: "seg", def: 100, values: [{ v: 50, label: "50" }, { v: 100, label: "100" }, { v: 1, label: tr("1 manche", "1 round") }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Une règle change de temps en temps, au début d'une manche", "A rule changes now and then, at the start of a round"), def: true }
  ],
  start(ctx, o){
    const E = { lg: SB.lang(), order: shuffle(ctx.ids), round: 1, goal: [50, 100, 1].indexOf(o.goal) >= 0 ? o.goal : 100, tw: o.twists !== false, twi: "", score: {}, seen: {}, prev: "", mv: 0 };
    newRound(E);
    ctx.setPriv({ draw: E.draw, disc: E.disc, vals: E.vals });
    const s = Object.assign({}, E); delete s.draw; delete s.disc; delete s.vals; delete s.up;
    s.cells = {}; E.order.forEach(id => { s.cells[id] = cellsOf(E, id); }); s.top = topOf(E); s.left = E.draw.length;
    return s;
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "flip" && s.phase !== "play") return;
    const E = fromState(s, ctx.priv());
    let changed = false;
    GX.length = 0;
    ctx.ids.forEach(id => {
      const x = ctx.input(id); if(!x) return;
      const sn = Object.assign({}, E.seen[id] || {});
      // Retournements du début : liste cumulée, valable pour la manche en cours.
      if(x.f && +x.f.r === E.round && E.phase === "flip") A(x.f.l).forEach(i => { if(doFlipStart(E, id, +i, ctx.name)) changed = true; });
      if(x.p && x.p.n > (sn.p || 0)){
        sn.p = x.p.n; changed = true;
        if(x.p.t === "take") doTake(E, id, +x.p.i, ctx.name);
        else if(x.p.t === "draw") doDraw(E, id, ctx.name);
        else if(x.p.t === "swap") doSwap(E, id, +x.p.i, ctx.name);
        else if(x.p.t === "toss") doToss(E, id, +x.p.i, ctx.name);
        else if(x.p.t === "end") doEnd(E, id, ctx.name);
      }
      E.seen[id] = sn;
    });
    if(changed){ publish(ctx, E); flushNet(ctx, E); }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.playing ? ctx.me : "", V = netView(s);
    if(UI.k !== ctx.g.gid + ":" + s.round){ UI.k = ctx.g.gid + ":" + s.round; UI.take = false; UI.toss = false; UI.pend = null; UI.mine = []; }
    if(UI.pend && (V.mv !== UI.pend.mv || Date.now() - UI.pend.at > 5000)) UI.pend = null;
    if(V.phase !== "play" || V.turn !== me){ UI.take = false; UI.toss = false; }
    if(V.step !== "pick") UI.take = false;
    if(V.step !== "held") UI.toss = false;
    if(me && V.cells[me]) UI.mine = UI.mine.filter(i => V.cells[me][i] === "h");
    const again = () => { root.dataset.key = "gr:"; DEF.render(SB.ctx(), root); };
    const n = () => (((ctx.mine() || {}).p || {}).n || 0) + 1;
    const sendP = (t, i) => { UI.pend = { mv: V.mv, at: Date.now() }; UI.take = false; UI.toss = false; ctx.send({ p: { n: n(), t, i: i == null ? -1 : i } }); again(); if(UI.pend) setTimeout(() => { if(UI.pend && Date.now() - UI.pend.at >= 5000){ UI.pend = null; again(); } }, 5100); };
    if(V.phase === "flip" || V.phase === "play"){
      const ui = { take: UI.take, toss: UI.toss, pend: !!UI.pend, mine: UI.mine };
      const key = JSON.stringify([s.k, V.cells, V.top, V.held, V.turn, V.step, V.closer, V.log, V.left, V.phase, UI.take, UI.toss, !!UI.pend, UI.mine]);
      if(root.dataset.key === "gr:" + key) return;
      ui.fresh = me && V.cells[me] ? freshCells(ctx.g.gid + ":" + s.round + ":" + me, V.cells[me]) : [];
      paint(root, key, '<span class="eyebrow">' + tr("Manche ", "Round ") + V.round + (V.goal === 1 ? "" : tr(" · objectif ", " · target ") + V.goal) + "</span>" + tableHTML(V, me, ctx.name, ui) + dockHTML(V, me, ui), r => {
        r.querySelectorAll(".gr-grid [data-i]").forEach(b => b.addEventListener("click", () => {
          const i = +b.dataset.i; buzz(8);
          const c = SB.ctx(), cur = netView(c.s);
          if(cur.phase === "flip"){ UI.mine = UI.mine.concat(i); c.send({ f: { r: cur.round, l: A(cur.cells[me]).map((x, k) => (typeof x === "number" ? k : -1)).filter(k => k >= 0).concat(UI.mine) } }); again(); return; }
          if(cur.step === "pick" && UI.take) sendP("take", i);
          else if(cur.step === "held") sendP(UI.toss ? "toss" : "swap", i);
        }));
        r.querySelectorAll("[data-take]").forEach(b => b.addEventListener("click", () => { buzz(6); UI.take = !UI.take; again(); }));
        r.querySelectorAll("[data-draw]").forEach(b => b.addEventListener("click", () => sendP("draw")));
        r.querySelectorAll("[data-end]").forEach(b => b.addEventListener("click", () => { buzz(10); sendP("end"); }));
        const ts = r.querySelector("[data-toss]"); if(ts) ts.addEventListener("click", () => {
          if(!A(V.cells[me]).some(c => c === "h")){ sendP("toss", -1); return; }
          UI.toss = true; again();
        });
        const cn = r.querySelector("[data-cancel]"); if(cn) cn.addEventListener("click", () => { UI.take = false; UI.toss = false; again(); });
        // Hôte : jouer à la place d'un absent pour ne pas bloquer la partie.
        const away = V.phase === "flip" ? V.order.filter(id => !ctx.here(id) && A(V.cells[id]).filter(c => typeof c === "number").length < V.nflip) : V.order.filter(id => id === V.turn && !ctx.here(id));
        if(ctx.isHost && away.length){
          const box = document.createElement("button"); box.type = "button"; box.className = "link warn"; box.style.alignSelf = "center";
          box.textContent = tr("Faire jouer " + away.map(ctx.name).join(", ") + " (absent)", "Play for " + away.map(ctx.name).join(", ") + " (away)");
          box.addEventListener("click", () => ctx.act(c => {
            const F = fromState(c.s, c.priv()); GX.length = 0;
            away.forEach(id => botMove(F, id, c.name));
            publish(c, F); flushNet(c, F);
          }));
          r.append(box);
        }
      });
    } else {
      const last = V.phase === "end";
      screen(root, "e" + s.k + V.phase + V.round + ctx.isHost, endHTML(V, ctx.name) +
        dock(ctx.isHost ? (last ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<button class="btn acc" type="button" data-next>' + tr("Manche suivante", "Next round") + "</button>") : '<p class="wait">' + tr("L'hôte passe à la suite…", "The host is moving on…") + "</p>"), r => {
        const nx = r.querySelector("[data-next]");
        if(nx) nx.addEventListener("click", () => ctx.act(c => { const F = fromState(c.s, c.priv()); if(F.phase !== "roundend") return; F.round++; newRound(F); publish(c, F); }));
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = netView(c.s), w = winners(F.score, F.order);
          c.end({ title: L(c.s, "Grille : " + w.map(c.name).join(" & ") + (w.length > 1 ? " gagnent" : " gagne"), "Grid: " + w.map(c.name).join(" & ") + (w.length > 1 ? " win" : " wins")), lines: endLines(F, c.name, " · "), win: w });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : joueurs qui se passent le téléphone, et/ou robots ---------- */
  local: {
    players: { min: 1, max: 8 },
    start(root, api){
      const names = api.names, st = store();
      let bots = [0, 1, 2, 3].indexOf(st.grBots) >= 0 ? st.grBots : (names.length === 1 ? 1 : 0);
      let goal = [50, 100, 1].indexOf(st.grGoal) >= 0 ? st.grGoal : 100;
      let tw = st.grTw !== false;
      const BOTN = tr(["Robotte", "Bipbip", "Zorglub"], ["Robbie", "Beepboop", "Zorglub"]);
      let E = null, timer = null, nameMap = {}, gno = 0, take = false, toss = false, viewer = "";
      const nameOf = id => nameMap[id] || "?";
      const isBot = id => id[0] === "b";
      const humans = () => E.order.filter(id => !isBot(id));
      const tok = ++LTOK;
      const alive = () => tok === LTOK && root.isConnected && !!root.querySelector("style[data-gr]") && !root.closest(".screen").hidden;
      const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(() => { if(alive()) fn(); }, ms); };
      function setup(){
        clearTimeout(timer);
        const total = names.length + bots;
        screen(root, "su" + bots + goal + tw, CSS + '<p class="howto">' + (names.length > 1 ? tr("Les joueurs se passent le téléphone à leur tour.", "Players pass the phone around on their turn.") : tr("Une partie contre les robots.", "A game against the bots.")) + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Robots", "Bots") + '</span><div class="seg">' + [0, 1, 2, 3].map(b => '<button type="button" data-b="' + b + '" aria-pressed="' + (b === bots) + '">' + b + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Objectif", "Target") + '</span><div class="seg">' + [[50, "50"], [100, "100"], [1, tr("1 manche", "1 round")]].map(x => '<button type="button" data-g="' + x[0] + '" aria-pressed="' + (x[0] === goal) + '">' + x[1] + "</button>").join("") + "</div></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + tw + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Une règle change de temps en temps, au début d'une manche", "A rule changes now and then, at the start of a round") + "</span></span></button></div></div>" +
          (total < 2 ? '<p class="err">' + tr("Ajoute au moins un robot pour jouer seul.", "Add at least one bot to play solo.") + "</p>" : total > 8 ? '<p class="err">' + tr("8 joueurs maximum, robots compris.", "8 players max, bots included.") + "</p>" : "") +
          dock('<button class="btn acc" type="button" data-go' + (total < 2 || total > 8 ? " disabled" : "") + ">" + tr("Distribuer", "Deal") + "</button>"), r => {
          r.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { bots = +b.dataset.b; persist({ grBots: bots }); setup(); }));
          r.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { goal = +b.dataset.g; persist({ grGoal: goal }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { tw = !tw; persist({ grTw: tw }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            nameMap = {}; const ids = names.map((nm, i) => { nameMap["h" + i] = nm; return "h" + i; });
            for(let i = 0; i < bots; i++){ nameMap["b" + i] = BOTN[i] + " 🤖"; ids.push("b" + i); }
            E = { lg: SB.lang(), order: shuffle(ids), round: 1, goal, tw, twi: "", score: {}, prev: "", mv: 0 };
            GX.length = 0; newRound(E); gno++; viewer = "";
            step();
          });
        });
      }
      // Gages sur un seul téléphone : seulement pour les humains (les robots ne boivent pas).
      function flushLocal(){
        const list = GX.splice(0).filter(x => !isBot(x.id)).map(x => ({ id: nameOf(x.id), ev: x.ev }));
        if(list.length && api.gage) api.gage(list, "gr" + tok + "-" + gno + ":" + E.round + ":" + E.mv + ":" + E.phase);
      }
      function step(){
        flushLocal();
        if(E.phase === "roundend" || E.phase === "end"){ end(); return; }
        if(E.phase === "flip"){
          // Les robots retournent leurs cartes d'un coup, puis chaque humain à son tour.
          E.order.filter(isBot).forEach(id => botFlipStart(E, id, nameOf));
          if(E.phase !== "flip"){ step(); return; }
          const who = humans().find(id => flipped(E, id) < E.nflip);
          if(who !== viewer && humans().length > 1){ passTo(who); return; }
          viewer = who; draw(who); return;
        }
        const cur = E.turn;
        if(isBot(cur)){
          draw(humans().length === 1 ? humans()[0] : viewer);
          later(() => {
            if(E.step === "pick"){
              // Le robot réfléchit en deux temps quand il pioche : on montre la carte piochée.
              const t = topOf(E), cs = t !== "" ? colSlot(E.vals[cur], E.up[cur], t) : -1;
              const takes = cs >= 0 || (t !== "" && cardPts(t, E.twi) <= 3 && placeFor(E, cur, t, 1) >= 0);
              if(!takes){ doDraw(E, cur, nameOf); draw(humans().length === 1 ? humans()[0] : viewer); later(() => { botMove(E, cur, nameOf); step(); }, 1100); return; }
            }
            botMove(E, cur, nameOf); step();
          }, 1100);
          return;
        }
        if(cur !== viewer && humans().length > 1){ passTo(cur); return; }
        viewer = cur; draw(cur);
      }
      function passTo(id){
        clearTimeout(timer);
        screen(root, "pass" + id + E.mv, CSS + '<p class="gr-log">' + esc(E.log) + '</p><div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(nameOf(id)) + "</div></div>" +
          dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi", "It's me") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => { viewer = id; step(); }));
      }
      function act(fn){ clearTimeout(timer); take = false; toss = false; if(fn()) buzz(10); step(); }
      function draw(me){
        const V = viewOf(E);
        if(V.phase !== "play" || V.turn !== me){ take = false; toss = false; }
        if(V.step !== "pick") take = false;
        if(V.step !== "held") toss = false;
        const key = JSON.stringify([V.cells, V.top, V.held, V.turn, V.step, V.closer, V.log, V.phase, take, toss, me]);
        if(root.dataset.key === "gr:" + key) return;
        const ui = { take, toss, mine: [], fresh: freshCells("local" + tok + "-" + gno + ":" + E.round + ":" + me, V.cells[me] || []) };
        paint(root, key, '<span class="eyebrow">' + tr("Manche ", "Round ") + V.round + (V.goal === 1 ? "" : tr(" · objectif ", " · target ") + V.goal) + "</span>" + tableHTML(V, me, nameOf, ui) + dockHTML(V, me, ui), r => {
          r.querySelectorAll(".gr-grid [data-i]").forEach(b => b.addEventListener("click", () => {
            const i = +b.dataset.i; buzz(8);
            if(E.phase === "flip"){ doFlipStart(E, me, i, nameOf); step(); return; }
            if(E.step === "pick" && take) act(() => doTake(E, me, i, nameOf));
            else if(E.step === "held") act(() => (toss ? doToss(E, me, i, nameOf) : doSwap(E, me, i, nameOf)));
          }));
          r.querySelectorAll("[data-take]").forEach(b => b.addEventListener("click", () => { buzz(6); take = !take; draw(me); }));
          r.querySelectorAll("[data-draw]").forEach(b => b.addEventListener("click", () => { clearTimeout(timer); if(doDraw(E, me, nameOf)) buzz(10); draw(me); }));
          r.querySelectorAll("[data-end]").forEach(b => b.addEventListener("click", () => act(() => doEnd(E, me, nameOf))));
          const ts = r.querySelector("[data-toss]"); if(ts) ts.addEventListener("click", () => {
            if(!hiddenIdx(E.up[me]).length){ act(() => doToss(E, me, -1, nameOf)); return; }
            toss = true; draw(me);
          });
          const cn = r.querySelector("[data-cancel]"); if(cn) cn.addEventListener("click", () => { take = false; toss = false; draw(me); });
        });
      }
      function end(){
        clearTimeout(timer);
        const V = viewOf(E), last = E.phase === "end", w = winners(E.score, E.order);
        // Classement et gages de fin : après la feuille des gages de la manche, sinon elle serait remplacée.
        if(last && api.win){ let tries = 0; const win = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(win, 500); else api.win(w.map(nameOf)); }; win(); }
        screen(root, "end" + gno + E.round + E.phase, endHTML(V, nameOf) +
          dock(last ? '<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>" : '<button class="btn acc" type="button" data-n>' + tr("Manche suivante", "Next round") + "</button>"), r => {
          const nx = r.querySelector("[data-n]"); if(nx) nx.addEventListener("click", () => { E.round++; newRound(E); viewer = ""; step(); });
          const a = r.querySelector("[data-a]"); if(a) a.addEventListener("click", api.again);
          const q = r.querySelector("[data-q]"); if(q) q.addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
};
DEF.engine = { newDeck, cardPts, gridScore, visScore, clearCols, applyDouble, gameOver, winners, starter, newRound, beginPlay, doFlipStart, botFlipStart, doTake, doDraw, doSwap, doToss, doEnd, endRound, botMove, colSlot, cellsOf, viewOf, fromState, TWISTS, GX };
SB.register(DEF);
})();
