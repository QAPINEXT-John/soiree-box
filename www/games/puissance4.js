/* Puissance 4 — aligne 4 pions (ou 5 en grille géante) avant l'autre.
   En salon : à 2 c'est un duel, à plus de 2 deux équipes (Rouges contre Jaunes) qui jouent chacun leur tour.
   Sur un seul téléphone : duel, équipes ou contre un bot (facile, moyen, difficile). */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, tr, buzz } = SB.u;
const SIDE = { 1: { name: tr("Rouges", "Red"), c: "#e8414e" }, 2: { name: tr("Jaunes", "Yellow"), c: "#f2c230" } };
const SIZES = { classique: { cols: 7, rows: 6, need: 4 }, geant: { cols: 9, rows: 7, need: 5 } };
const TW = [
  { id: "or", name: tr("Manche en or", "Golden round"), desc: tr("Cette manche compte double.", "This round counts double.") },
  { id: "eclair", name: tr("Chrono éclair", "Lightning clock"), desc: tr("8 secondes par coup, sinon le pion tombe au hasard.", "8 seconds per move, or the disc drops at random.") },
  { id: "aveugle", name: tr("Dernier coup caché", "Hidden last move"), desc: tr("On ne voit plus où l'adversaire vient de jouer.", "You can't see where your opponent just played.") }
];
const CSS = '<style data-p4>' +
  '.p4-wrap{display:flex; flex-direction:column; gap:10px; align-items:center}' +
  '.p4{position:relative; display:grid; gap:5px; padding:8px; border-radius:18px; background:#2a4fd1; box-shadow:inset 0 -6px 0 rgba(0,0,0,.25); width:100%; max-width:420px; box-sizing:border-box}' +
  '.p4 .col{display:grid; gap:5px; border:0; padding:0; background:transparent; border-radius:10px; cursor:pointer}.p4 .col:disabled{cursor:default}.p4 .col:not(:disabled):active{background:rgba(255,255,255,.12)}' +
  '.p4 .h{aspect-ratio:1; border-radius:50%; background:#141032; box-shadow:inset 0 3px 6px rgba(0,0,0,.55); position:relative; overflow:hidden}' +
  '.p4 .h i{position:absolute; inset:0; border-radius:50%; box-shadow:inset 0 -4px 0 rgba(0,0,0,.22)}.p4 .h i.s1{background:#e8414e}.p4 .h i.s2{background:#f2c230}' +
  '.p4 .h i.drop{animation:p4drop .38s cubic-bezier(.4,0,.6,1)}@keyframes p4drop{from{transform:translateY(var(--dy))}to{transform:translateY(0)}}' +
  '.p4 .h i.win{box-shadow:inset 0 0 0 4px #fff, 0 0 14px #fff}.p4 .h i.last::after{content:""; position:absolute; inset:36%; border-radius:50%; background:rgba(255,255,255,.55)}' +
  '.p4-turn{display:flex; align-items:center; gap:8px; justify-content:center; font-weight:800; min-height:30px}.p4-turn i{width:22px; height:22px; border-radius:50%; display:inline-block; box-shadow:inset 0 -3px 0 rgba(0,0,0,.25)}' +
  '.p4-score{display:flex; gap:10px; justify-content:center; font-family:var(--f-disp); font-size:22px}.p4-score span{display:flex; align-items:center; gap:6px}.p4-score i{width:16px; height:16px; border-radius:50%}' +
  '.p4-t{font-family:var(--f-disp); font-size:28px; color:var(--acc); text-align:center; line-height:1}.p4-t.low{color:var(--bad)}' +
  '.p4-sides{display:grid; grid-template-columns:1fr 1fr; gap:8px}.p4-side{border:2px solid; border-radius:16px; padding:10px; display:flex; flex-direction:column; gap:6px; background:var(--card)}.p4-side b{font-family:var(--f-disp); font-size:18px}.p4-side button{min-height:44px; border-radius:12px; border:1.5px solid var(--line); background:var(--bg); color:var(--ink); font-weight:700}.p4-side button:disabled{opacity:1}' +
  '.p4-pick{display:grid; grid-template-columns:1fr 1fr; gap:8px}.p4-pick button{min-height:48px; border-radius:14px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800}.p4-pick button[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--on-acc)}</style>';
const disc = s => '<i style="background:' + SIDE[s].c + '"></i>';

/* ---------- Règles du jeu ---------- */
const empty = (cols, rows) => Array(cols * rows).fill(0);
const at = (b, cols, c, r) => b[r * cols + c];
function dropRow(b, cols, rows, c){ for(let r = rows - 1; r >= 0; r--) if(!at(b, cols, c, r)) return r; return -1; }
function lineAt(b, cols, rows, need, idx){
  const s = b[idx]; if(!s) return null;
  const c0 = idx % cols, r0 = Math.floor(idx / cols);
  for(const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]){
    const cells = [idx];
    for(const k of [1, -1]){ let c = c0 + dc * k, r = r0 + dr * k; while(c >= 0 && c < cols && r >= 0 && r < rows && at(b, cols, c, r) === s){ cells.push(r * cols + c); c += dc * k; r += dr * k; } }
    if(cells.length >= need) return cells;
  }
  return null;
}
const full = b => b.every(x => x);
const validCols = (b, cols, rows) => { const o = []; for(let c = 0; c < cols; c++) if(dropRow(b, cols, rows, c) >= 0) o.push(c); return o; };
function place(b, cols, rows, c, s){ const r = dropRow(b, cols, rows, c); if(r < 0) return -1; b[r * cols + c] = s; return r * cols + c; }

/* ---------- Le bot (minimax avec élagage) ---------- */
function evalBoard(b, cols, rows, need, me){
  const op = 3 - me; let sc = 0;
  const mid = Math.floor(cols / 2); for(let r = 0; r < rows; r++) if(at(b, cols, mid, r) === me) sc += 3;
  const win = cells => { let m = 0, o = 0, e = 0; cells.forEach(v => { if(v === me) m++; else if(v === op) o++; else e++; });
    if(m === need) return 1000; if(o === need) return -1000;
    if(o === 0) return m === need - 1 ? 8 : m === need - 2 ? 2 : 0;
    if(m === 0) return o === need - 1 ? -9 : o === need - 2 ? -2 : 0; return 0; };
  for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
    for(const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]){
      const ec = c + dc * (need - 1), er = r + dr * (need - 1); if(ec < 0 || ec >= cols || er < 0 || er >= rows) continue;
      const cells = []; for(let k = 0; k < need; k++) cells.push(at(b, cols, c + dc * k, r + dr * k)); sc += win(cells);
    }
  }
  return sc;
}
function minimax(b, cols, rows, need, depth, a, be, maxi, me, last){
  if(last >= 0 && lineAt(b, cols, rows, need, last)) return { s: b[last] === me ? 100000 + depth : -100000 - depth };
  const V = validCols(b, cols, rows); if(!V.length) return { s: 0 }; if(depth === 0) return { s: evalBoard(b, cols, rows, need, me) };
  const mid = (cols - 1) / 2, order = V.slice().sort((x, y) => Math.abs(x - mid) - Math.abs(y - mid));
  let best = { s: maxi ? -Infinity : Infinity, c: order[0] };
  for(const c of order){
    const nb = b.slice(), i = place(nb, cols, rows, c, maxi ? me : 3 - me), r = minimax(nb, cols, rows, need, depth - 1, a, be, !maxi, me, i);
    if(maxi ? r.s > best.s : r.s < best.s) best = { s: r.s, c };
    if(maxi) a = Math.max(a, r.s); else be = Math.min(be, r.s); if(a >= be) break;
  }
  return best;
}
function botMove(b, cols, rows, need, me, level){
  const V = validCols(b, cols, rows);
  if(level === "facile" && Math.random() < .5) return V[Math.floor(Math.random() * V.length)];
  const depth = level === "difficile" ? (cols > 7 ? 5 : 6) : level === "moyen" ? 3 : 2;
  return minimax(b, cols, rows, need, depth, -Infinity, Infinity, true, me, -1).c;
}

/* ---------- Plateau ---------- */
function boardHTML(o){
  // o : { b, cols, rows, line, last, hideLast, can, drop }
  const winSet = new Set(A(o.line));
  let h = '<div class="p4" style="grid-template-columns:repeat(' + o.cols + ',1fr)">';
  for(let c = 0; c < o.cols; c++){
    h += '<button type="button" class="col" data-col="' + c + '" style="grid-template-rows:repeat(' + o.rows + ',1fr)"' + (o.can && dropRow(o.b, o.cols, o.rows, c) >= 0 ? "" : " disabled") + ' aria-label="' + tr("Colonne ", "Column ") + (c + 1) + '">';
    for(let r = 0; r < o.rows; r++){
      const i = r * o.cols + c, v = o.b[i], isLast = i === o.last && !o.hideLast;
      h += '<span class="h">' + (v ? '<i class="s' + v + (winSet.has(i) ? " win" : "") + (isLast ? " last" : "") + (isLast && o.drop ? " drop" : "") + '" style="--dy:' + (-(r + 1) * 110) + '%"></i>' : "") + "</span>";
    }
    h += "</button>";
  }
  return h + "</div>";
}
const scoreHTML = (sc, n1, n2) => '<div class="p4-score"><span>' + disc(1).replace("<i", '<i class="d"') + esc(n1) + " " + (sc[1] || 0) + "</span><span>–</span><span>" + (sc[2] || 0) + " " + esc(n2) + disc(2) + "</span></div>";

SB.register({
  id: "puissance4", name: tr("Puissance 4", "Connect Four"), glyph: "4", pitch: tr("Aligne 4 pions avant l'autre", "Line up 4 before they do"), hot: false, ticks: true,
  accent: { light: "#2a4fd1", dark: "#6f8fff" },
  tag: tr("Le classique : chacun son tour, fais tomber un pion dans une colonne. Le premier qui en aligne 4 gagne la manche. À plus de 2, Rouges contre Jaunes en équipes.", "The classic: take turns dropping a disc into a column. First to line up 4 wins the round. With more than 2, Red vs Yellow in teams."),
  min: 2, max: 20,
  gages: [
    { ev: "perdu", label: tr("Manche perdue", "Round lost"), kind: "boit", n: 2 },
    { ev: "gagne", label: tr("Manche gagnée", "Round won"), kind: "distribue", n: 1 },
    { ev: "nul", label: tr("Match nul (grille pleine)", "Draw (full grid)"), kind: "tous", n: 1 },
    { ev: "temps", label: tr("Temps écoulé : pion joué au hasard", "Time's up: random disc"), kind: "boit", n: 1 }
  ],
  rules: tr([
    "Chacun son tour, touche une colonne : ton pion tombe tout en bas. Le premier qui aligne 4 pions (en ligne, en colonne ou en diagonale) gagne la manche.",
    "À 2 joueurs, c'est un duel. À plus de 2, deux équipes (Rouges et Jaunes) jouent chacun leur tour : le joueur qui pose change à chaque coup.",
    "Grille géante : 9 colonnes, 7 lignes, et il faut aligner 5 pions.",
    "Chrono par coup (option) : si le temps est écoulé, le pion tombe au hasard.",
    "Le perdant d'une manche commence la suivante. Coups de théâtre : manche en or, chrono éclair, dernier coup caché.",
    "Sur un seul téléphone, tu peux aussi jouer contre un bot (facile, moyen ou difficile)."
  ], [
    "Take turns tapping a column: your disc drops to the bottom. First to line up 4 (across, down or diagonally) wins the round.",
    "With 2 players it's a duel. With more, two teams (Red and Yellow) take turns: the player who drops changes every move.",
    "Giant grid: 9 columns, 7 rows, and you need 5 in a row.",
    "Move timer (option): when time runs out, the disc drops at random.",
    "The loser of a round starts the next one. Twists: golden round, lightning clock, hidden last move.",
    "On one phone you can also play against a bot (easy, medium or hard)."
  ]),
  options: [
    { id: "rounds", label: tr("Manches", "Rounds"), type: "seg", def: 3, values: [{ v: 1, label: "1" }, { v: 3, label: tr("2 gagnantes", "Best of 3") }, { v: 5, label: tr("3 gagnantes", "Best of 5") }] },
    { id: "size", label: tr("Grille", "Grid"), type: "seg", def: "classique", values: [{ v: "classique", label: tr("Classique (4)", "Classic (4)") }, { v: "geant", label: tr("Géante (5)", "Giant (5)") }] },
    { id: "clock", label: tr("Chrono par coup", "Move timer"), type: "seg", def: 0, values: [{ v: 0, label: tr("Sans", "None") }, { v: 15, label: "15 s" }, { v: 30, label: "30 s" }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Manche en or, chrono éclair, dernier coup caché", "Golden round, lightning clock, hidden last move"), def: true }
  ],
  start(ctx, o){
    const S = SIZES[o.size] || SIZES.classique, sh = shuffle(ctx.ids), sides = [[], [], []];
    sh.forEach((id, i) => sides[i % 2 ? 2 : 1].push(id));
    return Object.assign({ phase: ctx.ids.length > 2 ? "teams" : "play", sides, idx: [0, 0, 0], rounds: [1, 3, 5].indexOf(+o.rounds) >= 0 ? +o.rounds : 3, round: 1, sc: [0, 0, 0], first: 1, turn: 1, clock: +o.clock || 0,
      b: empty(S.cols, S.rows), last: -1, line: null, tw: "", res: null, startAt: ctx.now() }, S);
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "play") return;
    const who = curPlayer(s), live = ctx.ids.filter(id => ctx.here(id));
    // Un joueur parti : on passe au suivant de son équipe.
    if(who && !ctx.here(who)){ const L = s.sides[s.turn].filter(id => ctx.here(id)); if(L.length){ const idx = A(s.idx).slice(); idx[s.turn] = s.sides[s.turn].indexOf(L[0]); ctx.set({ idx }); } return; }
    const i = ctx.input(who);
    let c = i && i.c != null ? +i.c : null, forced = false;
    const lim = s.tw === "eclair" ? 8 : s.clock;
    if(c == null && lim && s.startAt && ctx.now() > s.startAt + lim * 1000 + 600){ const V = validCols(s.b, s.cols, s.rows); c = V[Math.floor(Math.random() * V.length)]; forced = true; }
    if(c == null || dropRow(s.b, s.cols, s.rows, c) < 0) return;
    if(forced) ctx.gage([{ id: who, ev: "temps" }], s.k + ":t");
    applyMove(ctx, c, live);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), mySide = s.sides[1].indexOf(me) >= 0 ? 1 : s.sides[2].indexOf(me) >= 0 ? 2 : 0;
    const n1 = s.sides[1].length > 1 ? SIDE[1].name : ctx.name(s.sides[1][0]), n2 = s.sides[2].length > 1 ? SIDE[2].name : ctx.name(s.sides[2][0]);
    if(s.phase === "teams"){
      const col = side => '<div class="p4-side" style="border-color:' + SIDE[side].c + '"><b style="color:' + SIDE[side].c + '">' + esc(SIDE[side].name) + "</b>" + s.sides[side].map(id => '<button type="button" data-sw="' + esc(id) + '"' + (ctx.isHost ? "" : " disabled") + ">" + esc(ctx.name(id)) + "</button>").join("") + "</div>";
      screen(root, "tm" + JSON.stringify(s.sides) + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Les équipes", "The teams") + '</span><div class="p4-sides">' + col(1) + col(2) + "</div>" +
        '<p class="sm" style="margin:0">' + tr("Chaque équipe joue à tour de rôle, et le joueur qui pose change à chaque coup : tout le monde joue.", "Teams take turns, and the player who drops changes every move: everyone plays.") + (ctx.isHost ? tr(" Touche un joueur pour le changer d'équipe.", " Tap a player to switch their team.") : "") + "</p>" +
        (ctx.isHost ? '<button class="link" type="button" data-mix style="align-self:flex-start">' + tr("Mélanger les équipes", "Shuffle the teams") + "</button>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-go' + (s.sides[1].length && s.sides[2].length ? "" : " disabled") + ">" + tr("C'est parti", "Let's go") + "</button>" : '<p class="wait">' + tr("L'hôte prépare les équipes…", "The host is setting up the teams…") + "</p>"), r => {
        if(!ctx.isHost) return;
        r.querySelectorAll("[data-sw]").forEach(b => b.addEventListener("click", () => { buzz(6); ctx.act(c => { const sd = [[], c.s.sides[1].slice(), c.s.sides[2].slice()], id = b.dataset.sw, from = sd[1].indexOf(id) >= 0 ? 1 : 2; sd[from].splice(sd[from].indexOf(id), 1); sd[3 - from].push(id); c.set({ sides: sd }); }); }));
        r.querySelector("[data-mix]").addEventListener("click", () => ctx.act(c => { const sh = shuffle(c.ids), sd = [[], [], []]; sh.forEach((id, i) => sd[i % 2 ? 2 : 1].push(id)); c.set({ sides: sd }); }));
        r.querySelector("[data-go]").addEventListener("click", () => ctx.act(c => { if(c.s.sides[1].length && c.s.sides[2].length) c.set({ phase: "play", startAt: c.now(), k: c.rid() }); }));
      });
      return;
    }
    const head = CSS + '<span class="eyebrow">' + (s.rounds > 1 ? tr("Manche ", "Round ") + s.round : tr("Manche unique", "Single round")) + (mySide ? " · " + tr("tu joues les ", "you play ") + SIDE[mySide].name.toLowerCase() : "") + "</span>" + SB.u.twistHTML(T) + scoreHTML(s.sc, n1, n2);
    if(s.phase === "play"){
      const who = curPlayer(s), mine = who === me, lim = s.tw === "eclair" ? 8 : s.clock, left = lim && s.startAt ? Math.max(0, Math.ceil((s.startAt + lim * 1000 - ctx.now()) / 1000)) : 0;
      const turn = '<div class="p4-turn">' + disc(s.turn) + (mine ? tr("À toi de jouer !", "Your turn!") : esc(tr("Au tour de ", "Turn: ") + ctx.name(who) + (s.sides[s.turn].length > 1 ? " (" + SIDE[s.turn].name + ")" : ""))) + "</div>";
      const drop = root.dataset.p4last !== String(s.last) + s.round; root.dataset.p4last = String(s.last) + s.round;
      screen(root, "pl" + s.round + ":" + s.b.join("") + mine, head + turn + '<div class="p4-wrap">' + boardHTML({ b: s.b, cols: s.cols, rows: s.rows, last: s.last, hideLast: s.tw === "aveugle", can: mine, drop }) + "</div>" +
        (lim ? '<div class="p4-t" data-t>' + left + "</div>" : "") + SB.u.dock('<p class="wait">' + esc(mine ? tr("Touche une colonne", "Tap a column") : tr("Attends ton tour…", "Wait for your turn…")) + "</p>"), r => {
        r.querySelectorAll("[data-col]").forEach(b => b.addEventListener("click", () => { buzz(12); ctx.send({ c: +b.dataset.col }); r.querySelectorAll("[data-col]").forEach(x => { x.disabled = true; }); }));
      });
      const t = root.querySelector("[data-t]"); if(t){ t.textContent = String(left); t.classList.toggle("low", left <= 5); }
      if(mine && root.dataset.p4me !== s.k){ root.dataset.p4me = s.k; buzz([20, 40, 20]); }
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {}, done = matchOver(s);
      const msg = R.draw ? tr("Match nul : la grille est pleine !", "Draw: the grid is full!") : tr("Les ", "") + "";
      screen(root, "rs" + s.round + ctx.isHost, head + (R.draw ? '<div class="who" style="text-align:center">' + tr("Match nul", "Draw") + "</div>" : '<span class="eyebrow" style="text-align:center">' + tr("Manche gagnée par", "Round won by") + '</span><div class="who" style="text-align:center; color:' + SIDE[R.side].c + '">' + esc(R.side === 1 ? n1 : n2) + "</div>") +
        '<div class="p4-wrap">' + boardHTML({ b: s.b, cols: s.cols, rows: s.rows, last: s.last, line: s.line, can: false }) + "</div>" + (R.draw ? '<p class="sm" style="text-align:center">' + esc(msg) + "</p>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (done ? tr("Voir le résultat", "See the result") : tr("Manche suivante", "Next round")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase !== "res") return; if(matchOver(c.s)) c.set({ phase: "end" }); else nextRound(c); }));
      });
      return;
    }
    if(s.phase === "end"){
      const w = (s.sc[1] || 0) > (s.sc[2] || 0) ? 1 : (s.sc[2] || 0) > (s.sc[1] || 0) ? 2 : 0;
      screen(root, "end" + ctx.isHost, head + (w ? '<span class="eyebrow" style="text-align:center">' + tr("Victoire", "Winner") + '</span><div class="who" style="text-align:center; color:' + SIDE[w].c + '">' + esc(w === 1 ? n1 : n2) + "</div>" : '<div class="who" style="text-align:center">' + tr("Égalité !", "It's a tie!") + "</div>") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const sc = c.s.sc, w2 = (sc[1] || 0) > (sc[2] || 0) ? 1 : (sc[2] || 0) > (sc[1] || 0) ? 2 : 0;
          const nm = side => (c.s.sides[side].length > 1 ? SIDE[side].name : c.name(c.s.sides[side][0]));
          c.end({ title: tr("Puissance 4 : ", "Connect Four: ") + (w2 ? nm(w2) : tr("égalité", "tie")), lines: [nm(1) + " " + (sc[1] || 0) + " – " + (sc[2] || 0) + " " + nm(2)], win: w2 ? c.s.sides[w2].slice() : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : duel, équipes, ou contre un bot ---------- */
  local: {
    players: { min: 1, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let mode = names.length < 2 ? "bot" : ["duel", "equipes", "bot"].indexOf(st.p4Mode) >= 0 ? st.p4Mode : "duel", level = ["facile", "moyen", "difficile"].indexOf(st.p4Bot) >= 0 ? st.p4Bot : "moyen";
      let size = SIZES[st.p4Size] ? st.p4Size : "classique", rounds = [1, 3, 5].indexOf(st.p4Rounds) >= 0 ? st.p4Rounds : 3, duo = names.slice(0, 2), me1 = names[0] || tr("Toi", "You");
      let sides = { 1: [], 2: [] }, S, b, turn, first, last, sc, round, idx, gno = 0, tok = Math.random().toString(36).slice(2, 7), busy = false;
      const BOT = tr("Le bot", "The bot");
      const nm = side => (mode === "equipes" ? SIDE[side].name : sides[side][0]);
      function mkSides(){
        if(mode === "duel") sides = { 1: [duo[0]], 2: [duo[1]] };
        else if(mode === "bot") sides = { 1: [me1], 2: [BOT] };
        else { const sh = shuffle(names); sides = { 1: [], 2: [] }; sh.forEach((n, i) => sides[i % 2 ? 2 : 1].push(n)); }
      }
      function setup(){
        if(mode === "duel" && (duo.length < 2 || duo[0] === duo[1])) duo = names.slice(0, 2);
        screen(root, "su" + Math.random(), CSS + '<div class="field"><span class="eyebrow">' + tr("Mode", "Mode") + '</span><div class="seg">' +
          [["duel", tr("Duel", "Duel")], ["equipes", tr("Équipes", "Teams")], ["bot", tr("Contre le bot", "Vs the bot")]].map(m => '<button type="button" data-m="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '"' + (m[0] !== "bot" && names.length < (m[0] === "duel" ? 2 : 3) ? " disabled" : "") + ">" + m[1] + "</button>").join("") + "</div></div>" +
          (mode === "duel" ? '<div class="field"><span class="eyebrow">' + tr("Qui joue ? (touche 2 prénoms)", "Who plays? (tap 2 names)") + '</span><div class="p4-pick">' + names.map(n => '<button type="button" data-dn="' + esc(n) + '" aria-pressed="' + (duo.indexOf(n) >= 0) + '">' + esc(n) + "</button>").join("") + "</div></div>" : "") +
          (mode === "bot" ? '<div class="field"><span class="eyebrow">' + tr("Qui affronte le bot ?", "Who takes on the bot?") + '</span><div class="p4-pick">' + (names.length ? names : [me1]).map(n => '<button type="button" data-bn="' + esc(n) + '" aria-pressed="' + (me1 === n) + '">' + esc(n) + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Niveau du bot", "Bot level") + '</span><div class="seg">' + [["facile", tr("Facile", "Easy")], ["moyen", tr("Moyen", "Medium")], ["difficile", tr("Difficile", "Hard")]].map(l => '<button type="button" data-lv="' + l[0] + '" aria-pressed="' + (level === l[0]) + '">' + l[1] + "</button>").join("") + "</div></div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Grille", "Grid") + '</span><div class="seg">' + [["classique", tr("Classique (4)", "Classic (4)")], ["geant", tr("Géante (5)", "Giant (5)")]].map(z => '<button type="button" data-sz="' + z[0] + '" aria-pressed="' + (size === z[0]) + '">' + z[1] + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Manches", "Rounds") + '</span><div class="seg">' + [[1, "1"], [3, tr("2 gagnantes", "Best of 3")], [5, tr("3 gagnantes", "Best of 5")]].map(v => '<button type="button" data-r="' + v[0] + '" aria-pressed="' + (rounds === v[0]) + '">' + v[1] + "</button>").join("") + "</div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button>"), r => {
          r.querySelectorAll("[data-m]").forEach(x => x.addEventListener("click", () => { mode = x.dataset.m; persist({ p4Mode: mode }); setup(); }));
          r.querySelectorAll("[data-dn]").forEach(x => x.addEventListener("click", () => { const n = x.dataset.dn, i = duo.indexOf(n); if(i >= 0) duo.splice(i, 1); else { duo.push(n); if(duo.length > 2) duo.shift(); } setup(); }));
          r.querySelectorAll("[data-bn]").forEach(x => x.addEventListener("click", () => { me1 = x.dataset.bn; setup(); }));
          r.querySelectorAll("[data-lv]").forEach(x => x.addEventListener("click", () => { level = x.dataset.lv; persist({ p4Bot: level }); setup(); }));
          r.querySelectorAll("[data-sz]").forEach(x => x.addEventListener("click", () => { size = x.dataset.sz; persist({ p4Size: size }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(x => x.addEventListener("click", () => { rounds = +x.dataset.r; persist({ p4Rounds: rounds }); setup(); }));
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(mode === "duel" && duo.length < 2){ SB.u.toast(tr("Choisis 2 joueurs", "Pick 2 players")); return; }
            mkSides(); S = SIZES[size]; sc = {}; round = 0; first = 1; gno++; newRound();
          });
        });
      }
      function newRound(){ round++; b = empty(S.cols, S.rows); turn = first; last = -1; idx = { 1: 0, 2: 0 }; busy = false; draw(); }
      const who = () => sides[turn][idx[turn] % sides[turn].length];
      const isBot = () => mode === "bot" && turn === 2;
      function head(){ return CSS + '<span class="eyebrow">' + (rounds > 1 ? tr("Manche ", "Round ") + round : tr("Manche unique", "Single round")) + "</span>" + scoreHTML(sc, nm(1), nm(2)); }
      function draw(line, over){
        const drop = true;
        screen(root, "pl" + gno + ":" + round + ":" + b.join("") + (over ? "o" : ""), head() + (over ? "" : '<div class="p4-turn">' + disc(turn) + esc(isBot() ? tr("Le bot réfléchit…", "The bot is thinking…") : tr("Au tour de ", "Turn: ") + who() + (mode === "equipes" ? " (" + SIDE[turn].name + ")" : "")) + "</div>") +
          '<div class="p4-wrap">' + boardHTML({ b, cols: S.cols, rows: S.rows, last, line, can: !over && !isBot() && !busy, drop }) + "</div>" +
          (over ? over : SB.u.dock('<button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>")), r => {
          r.querySelectorAll("[data-col]").forEach(x => x.addEventListener("click", () => { if(busy) return; buzz(12); move(+x.dataset.col); }));
          const q = r.querySelector("[data-q]"); if(q) q.addEventListener("click", api.exit);
          const nx = r.querySelector("[data-nx]"); if(nx) nx.addEventListener("click", () => { if(over && matchDone()) end(); else newRound(); });
        });
        if(!over && isBot()){ busy = true; setTimeout(() => { const c = botMove(b, S.cols, S.rows, S.need, 2, level); busy = false; move(c); }, 650); }
      }
      function move(c){
        const i = place(b, S.cols, S.rows, c, turn); if(i < 0) return;
        last = i; const line = lineAt(b, S.cols, S.rows, S.need, i);
        if(line || full(b)){
          const w = line ? turn : 0, key = "p4" + tok + "-" + gno + ":" + round;
          if(w){ sc[w] = (sc[w] || 0) + 1; first = 3 - w; if(api.gage){ const L = sides[3 - w].filter(n => n !== BOT); api.gage(L.map(n => ({ id: n, ev: "perdu" })).concat(sides[w][0] !== BOT ? [{ id: sides[w][0], ev: "gagne" }] : []), key); } }
          else if(api.gage) api.gage([{ id: names[0] || me1, ev: "nul" }], key);
          buzz([60, 40, 60]);
          const msg = (w ? '<span class="eyebrow" style="text-align:center">' + tr("Manche gagnée par", "Round won by") + '</span><div class="who" style="text-align:center; color:' + SIDE[w].c + '">' + esc(nm(w)) + "</div>" : '<div class="who" style="text-align:center">' + tr("Match nul", "Draw") + "</div>");
          draw(line, msg + SB.u.dock('<button class="btn acc" type="button" data-nx>' + (matchDone() ? tr("Voir le résultat", "See the result") : tr("Manche suivante", "Next round")) + "</button>"));
          return;
        }
        idx[turn]++; turn = 3 - turn; draw();
      }
      const matchDone = () => { const need = Math.ceil(rounds / 2); return (sc[1] || 0) >= need || (sc[2] || 0) >= need || round >= rounds; };
      function end(){
        const w = (sc[1] || 0) > (sc[2] || 0) ? 1 : (sc[2] || 0) > (sc[1] || 0) ? 2 : 0;
        if(api.win) api.win(w ? sides[w].filter(n => n !== BOT) : []);
        screen(root, "end" + gno, head() + (w ? '<span class="eyebrow" style="text-align:center">' + tr("Victoire", "Winner") + '</span><div class="who" style="text-align:center; color:' + SIDE[w].c + '">' + esc(nm(w)) + "</div>" : '<div class="who" style="text-align:center">' + tr("Égalité !", "It's a tie!") + "</div>") +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
const curPlayer = s => { const L = A(s.sides[s.turn]); return L.length ? L[(s.idx[s.turn] || 0) % L.length] : ""; };
const matchOver = s => { const need = Math.ceil(s.rounds / 2); return (s.sc[1] || 0) >= need || (s.sc[2] || 0) >= need || s.round >= s.rounds; };
// Joue un coup (chez l'hôte) et vérifie la fin de manche.
function applyMove(c, col, live){
  const s = c.s, b = s.b.slice(), i = place(b, s.cols, s.rows, col, s.turn); if(i < 0) return;
  const line = lineAt(b, s.cols, s.rows, s.need, i);
  if(line || full(b)){
    const w = line ? s.turn : 0, sc = A(s.sc).slice(), x = s.tw === "or" ? 2 : 1;
    if(w){
      sc[w] = (sc[w] || 0) + x;
      c.gage(s.sides[3 - w].map(id => ({ id, ev: "perdu" })).concat([{ id: curPlayer(s), ev: "gagne" }]), s.k + ":end");
    } else c.gage([{ id: live[0] || c.ids[0], ev: "nul" }], s.k + ":end");
    c.set({ b, last: i, line, sc, phase: "res", res: { side: w, draw: !w }, first: w ? 3 - w : 3 - s.first });
    return;
  }
  const idx = A(s.idx).slice(); idx[s.turn] = (idx[s.turn] || 0) + 1;
  c.set({ b, last: i, idx, turn: 3 - s.turn, startAt: c.now(), k: c.rid() });
}
function nextRound(c){
  const s = c.s, t = c.opts.twists !== false ? SB.u.twist(TW, { last: s.tw, rate: .35 }) : null;
  c.set({ phase: "play", round: s.round + 1, b: empty(s.cols, s.rows), last: -1, line: null, turn: s.first, idx: [0, 0, 0], tw: t ? t.id : "", res: null, startAt: c.now(), k: c.rid() });
}
})();
