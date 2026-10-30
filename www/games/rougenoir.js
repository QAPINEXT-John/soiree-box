/* Rouge, noir ou violet — à ton tour, parie sur la prochaine carte.
   Rouge ou noir : une carte. Violet : deux cartes de couleurs différentes (ça rapporte double).
   Option « Ride the bus » : après la couleur, plus haut ou plus bas, entre ou à l'extérieur, puis l'enseigne exacte. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz } = SB.u;

/* ---------- Les cartes : "14h" = as de cœur. Enseignes : h cœur, d carreau, s pique, c trèfle ---------- */
const SUITS = ["h", "d", "s", "c"], SYM = { h: "♥", d: "♦", s: "♠", c: "♣" };
const newDeck = () => shuffle([].concat(...SUITS.map(su => [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(v => v + su))));
const val = c => parseInt(c, 10), suit = c => String(c).slice(-1), red = c => suit(c) === "h" || suit(c) === "d";
const rank = v => (v <= 10 ? String(v) : tr({ 11: "V", 12: "D", 13: "R", 14: "A" }[v], { 11: "J", 12: "Q", 13: "K", 14: "A" }[v]));
// En toutes lettres, avec l'article, pour les phrases : « que le 7 », « que la dame », « que l'as ».
const rankFR = v => (v <= 10 ? "le " + v : { 11: "le valet", 12: "la dame", 13: "le roi", 14: "l'as" }[v]);
const SUITN = { h: tr("Cœur", "Hearts"), d: tr("Carreau", "Diamonds"), s: tr("Pique", "Spades"), c: tr("Trèfle", "Clubs") };
function cardHTML(c, cls){ return '<span class="rn-c ' + (red(c) ? "r" : "b") + (cls ? " " + cls : "") + '" aria-label="' + esc(rank(val(c)) + " " + SUITN[suit(c)]) + '"><i>' + esc(rank(val(c))) + "</i><b>" + SYM[suit(c)] + "</b></span>"; }
const backHTML = () => '<span class="rn-c back" aria-hidden="true"></span>';

/* ---------- Le moteur (réseau et un seul téléphone) ----------
   E : { order, ti, done: {id: tours faits}, turns, ride, step, cards (cartes du tour), last, pts, ok, ko, tw }
   deck : tableau de cartes (pioche). */
const STEPS_RIDE = 4;
function draw(deck){ if(deck.length < 3) deck.push(...newDeck()); return deck.pop(); }
// Résout le pari b de l'étape en cours. Renvoie { ok, mult, drawn }.
function resolve(E, deck, b){
  const st = E.step, cs = E.cards;
  let ok = false, mult = st + 1, drawn = [];
  if(st === 0){
    if(b === "v"){ drawn = [draw(deck), draw(deck)]; ok = red(drawn[0]) !== red(drawn[1]); mult = 2; }
    else { drawn = [draw(deck)]; ok = (b === "r") === red(drawn[0]); }
  } else if(st === 1){
    const ref = val(cs[cs.length - 1]), c = draw(deck); drawn = [c];
    ok = b === "+" ? val(c) > ref : val(c) < ref;
  } else if(st === 2){
    const a = val(cs[0]), z = val(cs[1]), lo = Math.min(a, z), hi = Math.max(a, z), c = draw(deck), v = val(c); drawn = [c];
    ok = b === "in" ? v > lo && v < hi : v < lo || v > hi;
  } else {
    const c = draw(deck); drawn = [c]; ok = suit(c) === b;
  }
  if(E.tw === "or") mult *= 2;
  E.cards = cs.concat(drawn);
  return { ok, mult, drawn, b, st };
}
// Bornes pour « entre ou à l'extérieur » : les deux premières cartes du tour.
const bounds = cs => { const a = val(cs[0]), z = val(cs[1]); return [Math.min(a, z), Math.max(a, z)]; };
const stepsOf = E => (E.ride ? STEPS_RIDE : 1);
// Tour suivant (le joueur suivant présent). Renvoie false si la partie est finie.
function nextTurn(E, here){
  const me = E.order[E.ti]; E.done[me] = (E.done[me] || 0) + 1;
  for(let k = 1; k <= E.order.length; k++){
    const j = (E.ti + k) % E.order.length, id = E.order[j];
    if((E.done[id] || 0) < E.turns && (!here || here(id))){ E.ti = j; E.step = 0; E.cards = []; E.last = null; return true; }
  }
  return false;
}
const BETS = [
  () => [["r", tr("Rouge", "Red"), "r"], ["n", tr("Noir", "Black"), "b"], ["v", tr("Violet", "Purple"), "v"]],
  () => [["+", tr("Plus haut", "Higher"), ""], ["-", tr("Plus bas", "Lower"), ""]],
  () => [["in", tr("Entre", "Inside"), ""], ["out", tr("À l'extérieur", "Outside"), ""]],
  () => SUITS.map(su => [su, SYM[su] + " " + SUITN[su], su === "h" || su === "d" ? "r" : "b"])
];
const betName = (st, b) => { const x = BETS[st]().find(y => y[0] === b); return x ? x[1] : b; };
function question(E){
  const cs = E.cards;
  if(E.step === 0) return tr("Rouge ou noir ? Ou violet : les deux prochaines cartes seront de couleurs différentes (gain double).", "Red or black? Or purple: the next two cards are different colors (double).");
  if(E.step === 1) return tr("Plus haut ou plus bas que " + rankFR(val(cs[cs.length - 1])) + " ?", "Higher or lower than the " + rank(val(cs[cs.length - 1])) + "?");
  if(E.step === 2){ const b = bounds(cs); return tr("Entre " + rank(b[0]) + " et " + rank(b[1]) + ", ou à l'extérieur ?", "Between " + rank(b[0]) + " and " + rank(b[1]) + ", or outside?"); }
  return tr("Quelle enseigne ?", "Which suit?");
}
const STEPN = [tr("Couleur", "Color"), tr("Plus ou moins", "Higher or lower"), tr("Entre ou à l'extérieur", "Inside or outside"), tr("Enseigne", "Suit")];

/* ---------- Coups de théâtre (un tour au maximum) ---------- */
const TW = [
  { id: "or", name: tr("Tour en or", "Golden turn"), desc: tr("Tous les gages de ce tour comptent double.", "Every forfeit this turn counts double.") },
  { id: "inverse", name: tr("Le monde à l'envers", "Upside down"), desc: tr("Ce tour-ci, si tu as bon, tu prends le gage ; si tu te trompes, tu distribues !", "This turn, if you're right you take the forfeit, if you're wrong you hand it out!") },
  { id: "tous", name: tr("Tout le monde parie", "Everyone bets"), desc: tr("Pour la couleur, tout le monde parie avec le joueur. Ceux qui se trompent prennent un gage.", "For the color, everyone bets along. Those who are wrong get a forfeit."), ok: o => o.n >= 3 }
];
const TWL = TW.filter(t => t.id !== "tous");

const CSS = '<style data-rn>' +
  '.rn-row{display:flex; justify-content:center; gap:8px; flex-wrap:wrap; min-height:96px; align-items:center}' +
  '.rn-c{width:62px; height:88px; border-radius:10px; background:#fbf7f0; border:2px solid #fff; box-shadow:0 6px 16px -6px rgba(0,0,0,.6); display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:900; line-height:1}' +
  '.rn-c i{font-style:normal; font-size:26px; font-family:var(--f-disp)}.rn-c b{font-size:28px}.rn-c.r{color:#d8263a}.rn-c.b{color:#14101a}' +
  '.rn-c.back{background:repeating-linear-gradient(45deg,#7a2fd0 0 8px,#5a1fa3 8px 16px); border-color:#fff}' +
  '.rn-c.big{width:96px; height:136px; border-radius:14px}.rn-c.big i{font-size:40px}.rn-c.big b{font-size:44px}' +
  '.rn-c.new{animation:rn-flip .55s cubic-bezier(.3,.7,.3,1)}@keyframes rn-flip{0%{transform:rotateY(90deg) scale(.9)}100%{transform:none}}' +
  '.rn-bets{display:grid; grid-template-columns:repeat(auto-fit,minmax(0,1fr)); gap:8px}.rn-bets.s4{grid-template-columns:1fr 1fr}' +
  '.rn-bets button{min-height:64px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:900; font-size:18px}' +
  '.rn-bets button.r{background:#d8263a; border-color:#d8263a; color:#fff}.rn-bets button.b{background:#14101a; border-color:#5d556a; color:#fff}.rn-bets button.v{background:#7a2fd0; border-color:#7a2fd0; color:#fff}' +
  '.rn-bets button[aria-pressed="true"]{outline:3px solid var(--acc); outline-offset:2px}' +
  '.rn-v{text-align:center; font-family:var(--f-disp); font-weight:800; font-size:30px; margin:0}.rn-v.ok{color:#2fa860}.rn-v.ko{color:var(--bad)}' +
  '.rn-q{text-align:center; font-weight:800; font-size:17px; margin:0}.rn-steps{display:flex; gap:4px}.rn-steps i{flex:1; height:6px; border-radius:99px; background:var(--soft)}.rn-steps i.done{background:var(--acc)}.rn-steps i.on{background:var(--ink)}' +
  '.rn-row2{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line)}.rn-row2 b{flex:1}.rn-row2 .n{font-family:var(--f-disp); font-weight:800; font-size:22px}.rn-list{display:flex; flex-direction:column; gap:6px}</style>';
const stepsHTML = E => (E.ride ? '<div class="rn-steps">' + [0, 1, 2, 3].map(i => '<i class="' + (i < E.step ? "done" : i === E.step ? "on" : "") + '"></i>').join("") + "</div>" : "");
function cardsHTML(E, fresh){
  const cs = A(E.cards); if(!cs.length) return '<div class="rn-row">' + backHTML() + "</div>";
  return '<div class="rn-row">' + cs.map((c, i) => cardHTML(c, (i >= cs.length - fresh ? "new" : "") + (i === cs.length - 1 ? " big" : ""))).join("") + "</div>";
}
function verdictHTML(E, nameOf){
  const L = E.last; if(!L) return "";
  const inv = E.tw === "inverse", good = L.ok !== inv;
  let h = '<p class="rn-v ' + (L.ok ? "ok" : "ko") + '">' + (L.ok ? tr("Gagné !", "Right!") : tr("Perdu !", "Wrong!")) + "</p>" +
    '<p class="rn-q">' + esc(nameOf(E.order[E.ti])) + tr(" a parié « ", " bet “") + esc(betName(L.st, L.b)) + tr(" » · ", "” · ") + (good ? tr("distribue ", "hands out ") : tr("prend ", "takes ")) + L.mult + "</p>";
  if(L.all) h += '<p class="sm" style="text-align:center">' + (L.all.length ? tr("Se sont trompés : " + esc(L.all.map(nameOf).join(", ")), "Got it wrong: " + esc(L.all.map(nameOf).join(", "))) : tr("Tout le monde avait bon !", "Everyone got it right!")) + "</p>";
  return h;
}
function standings(ids, pts, nameOf){ return '<div class="rn-list">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map((id, i) => '<div class="rn-row2"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="n">' + (pts[id] || 0) + "</span></div>").join("") + "</div>"; }
function awards(ids, E, nameOf){
  const out = [], ok = E.okc || {}, ko = E.koc || {};
  const rate = id => { const t = (ok[id] || 0) + (ko[id] || 0); return t ? (ok[id] || 0) / t : 0; };
  const best = ids.filter(id => (ok[id] || 0) + (ko[id] || 0)).sort((a, b) => rate(b) - rate(a))[0];
  if(best) out.push([tr("La voyante", "The psychic"), nameOf(best), tr(Math.round(rate(best) * 100) + " % de bons paris", Math.round(rate(best) * 100) + "% right")]);
  const bad = ids.filter(id => ko[id]).sort((a, b) => (ko[b] || 0) - (ko[a] || 0))[0];
  if(bad && bad !== best) out.push([tr("Le chat noir", "The black cat"), nameOf(bad), tr(ko[bad] + (ko[bad] > 1 ? " paris ratés" : " pari raté"), ko[bad] + " wrong bets")]);
  const v = E.vio || {}, vi = ids.filter(id => v[id]).sort((a, b) => v[b] - v[a])[0];
  if(vi) out.push([tr("Accro au violet", "Purple addict"), nameOf(vi), tr(v[vi] + (v[vi] > 1 ? " paris violets" : " pari violet"), v[vi] + " purple bets")]);
  return out;
}
// Applique un pari : points, stats, et la liste des gages ({ id, ev, x }).
function apply(E, deck, b, allBets){
  const id = E.order[E.ti], R = resolve(E, deck, b), gl = [];
  E.pts = E.pts || {}; E.okc = E.okc || {}; E.koc = E.koc || {}; E.vio = E.vio || {};
  if(R.ok){ E.pts[id] = (E.pts[id] || 0) + R.mult; E.okc[id] = (E.okc[id] || 0) + 1; } else E.koc[id] = (E.koc[id] || 0) + 1;
  if(b === "v") E.vio[id] = (E.vio[id] || 0) + 1;
  const good = R.ok !== (E.tw === "inverse");
  gl.push({ id, ev: good ? "gagne" : "perdu", x: R.mult });
  let all = null;
  if(allBets){ all = []; const c0 = R.drawn[0]; Object.keys(allBets).forEach(o => { if(o !== id && (allBets[o] === "r") !== red(c0)){ all.push(o); gl.push({ id: o, ev: "public", x: E.tw === "or" ? 2 : 1 }); } }); }
  E.last = { ok: R.ok, mult: R.mult, b, st: R.st, n: R.drawn.length, all };
  return gl;
}

SB.register({
  id: "rougenoir", name: tr("Rouge, noir ou violet", "Red, Black or Purple"), glyph: "♥ ♠", pitch: tr("Parie sur la prochaine carte. Violet : double ou rien.", "Bet on the next card. Purple: double or nothing."), hot: false,
  accent: { light: "#9b3fe0", dark: "#b77cff" },
  tag: tr("Rouge ou noir ? Ou violet, deux cartes de couleurs différentes. En option, le « Ride the bus » complet : plus ou moins, entre ou à l'extérieur, l'enseigne.", "Red or black? Or purple, two cards of different colors. Optional full Ride the Bus: higher or lower, inside or outside, the suit."),
  min: 2, max: 16,
  gages: [
    { ev: "perdu", label: tr("Mauvais pari (× l'étape, × 2 en violet)", "Wrong bet (× the step, × 2 on purple)"), kind: "boit", n: 1 },
    { ev: "gagne", label: tr("Bon pari (× l'étape, × 2 en violet)", "Right bet (× the step, × 2 on purple)"), kind: "distribue", n: 1 },
    { ev: "public", label: tr("Tout le monde parie : raté", "Everyone bets: wrong"), kind: "boit", n: 1 }
  ],
  rules: tr([
    "À ton tour, tu paries sur la prochaine carte : rouge (cœur, carreau) ou noir (pique, trèfle).",
    "Violet : tu paries que les deux prochaines cartes seront de couleurs différentes. Ça compte double.",
    "Bon pari : tu distribues. Mauvais pari : tu prends le gage.",
    "Option Ride the bus : après la couleur, plus haut ou plus bas que la carte, puis entre ou à l'extérieur des deux premières cartes, puis l'enseigne exacte. Chaque étape vaut un peu plus que la précédente (1, 2, 3, puis 4).",
    "Égalité de valeur (plus ou moins, entre ou à l'extérieur) : c'est perdu. L'as est la carte la plus forte.",
    "Les bons paris rapportent des points. À la fin des tours, celui qui a le plus de points gagne.",
    "Coups de théâtre : tour en or, le monde à l'envers, tout le monde parie."
  ], [
    "Taking turns, you bet on the next card: red (hearts, diamonds) or black (spades, clubs).",
    "Purple: you bet the next two cards will be different colors. It counts double.",
    "Right bet: you hand out. Wrong bet: you take the forfeit.",
    "Ride the Bus option: after the color, higher or lower than the card, then inside or outside the first two cards, then the exact suit. Each step is worth a bit more (1, 2, 3, then 4).",
    "Same value (higher/lower, inside/outside): you lose. Aces are high.",
    "Right bets score points. After the last turn, most points wins.",
    "Twists: golden turn, upside down, everyone bets."
  ]),
  options: [
    { id: "ride", label: tr("Variante", "Variant"), type: "toggle", text: "Ride the bus", desc: tr("4 étapes par tour : couleur, plus ou moins, entre ou dehors, enseigne", "4 steps per turn: color, higher or lower, inside or outside, suit"), def: false },
    { id: "turns", label: tr("Tours par joueur", "Turns per player"), type: "seg", def: 3, values: [{ v: 2, label: "2" }, { v: 3, label: "3" }, { v: 5, label: "5" }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour un tour", "Now and then, a rule changes for one turn"), def: true }
  ],
  start(ctx, o){
    const deck = newDeck(); ctx.setPriv({ deck });
    return { phase: "bet", order: shuffle(ctx.ids), ti: 0, done: {}, turns: o.turns || 3, ride: !!o.ride, step: 0, cards: [], last: null, pts: {}, okc: {}, koc: {}, vio: {}, tw: "", n: 1 };
  },
  host(ctx){
    const s = ctx.s; if(s.phase !== "bet" && s.phase !== "show") return;
    const cur = s.order[s.ti];
    const E = JSON.parse(JSON.stringify(s));
    const goNext = () => {
      if(E.step + 1 < stepsOf(E) && E.last){ E.step++; E.last = null; ctx.set(Object.assign(E, { phase: "bet", k: ctx.rid() })); return; }
      if(!nextTurn(E, ctx.here)){ ctx.set(Object.assign(E, { phase: "end" })); return; }
      const lv = ctx.ids.filter(id => ctx.here(id)), t = ctx.opts.twists !== false && E.n > 1 ? SB.u.twist(TW, { last: E.tw, n: lv.length, rate: .3 }) : null;
      E.n++; E.tw = t ? t.id : "";
      ctx.set(Object.assign(E, { phase: "bet", k: ctx.rid() }));
    };
    // Joueur absent : on passe son tour.
    if(!ctx.here(cur)){ E.last = null; E.step = stepsOf(E); goNext(); return; }
    if(s.phase === "bet"){
      const i = ctx.input(cur), ok = i && i.st === s.step && BETS[s.step]().some(x => x[0] === i.b) && !(s.tw === "tous" && s.step === 0 && i.b === "v");
      if(!ok) return;
      let all = null;
      if(s.tw === "tous" && s.step === 0){
        const lv = ctx.ids.filter(id => ctx.here(id) && id !== cur); all = {};
        if(!lv.every(id => { const x = ctx.input(id); if(x && (x.a === "r" || x.a === "n")){ all[id] = x.a; return true; } return false; })) return;
      }
      const deck = A(ctx.priv().deck).slice(), gl = apply(E, deck, i.b, all);
      ctx.setPriv({ deck });
      ctx.gage(gl, s.k + ":" + s.step);
      ctx.set(Object.assign(E, { phase: "show" }));
      return;
    }
    const i = ctx.input(cur); if(i && i.nx === s.step) goNext();
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), cur = s.order[s.ti], mine = cur === me, inp = ctx.mine() || {};
    if(s.phase === "end"){
      const aw = awards(ctx.ids, s, ctx.name), order = ctx.ids.slice().sort((a, b) => ((s.pts || {})[b] || 0) - ((s.pts || {})[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Le meilleur parieur", "Best bettor") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + standings(ctx.ids, s.pts || {}, ctx.name) +
        (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.ids.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0;
          c.end({ title: tr("Rouge, noir ou violet : ", "Red, Black or Purple: ") + c.name(o2[0]), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0) + " pts").concat(awards(c.ids, c.s, c.name).map(a => a[0] + tr(" : ", ": ") + a[1])), win: mx ? o2.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
      return;
    }
    const head = CSS + '<span class="eyebrow">' + tr("Tour de ", "") + esc(ctx.name(cur)) + tr("", "'s turn") + " · " + tr("", "turn ") + (((s.done || {})[cur] || 0) + 1) + " / " + s.turns + (s.ride ? " · " + STEPN[s.step] : "") + "</span>" + SB.u.twistHTML(T) + stepsHTML(s);
    const tousMe = s.tw === "tous" && s.step === 0 && !mine && s.phase === "bet";
    let body = "", dockH = "";
    if(s.phase === "bet"){
      body = cardsHTML(s, 0) + '<p class="rn-q">' + question(s) + "</p>";
      const bets = BETS[s.step]().filter(x => !(s.tw === "tous" && s.step === 0 && x[0] === "v"));
      if(mine) dockH = '<div class="rn-bets' + (s.step === 3 ? " s4" : "") + '">' + bets.map(x => '<button type="button" class="' + x[2] + '" data-b="' + esc(x[0]) + '"' + (inp.b === x[0] && inp.st === s.step ? ' aria-pressed="true"' : "") + ">" + esc(x[1]) + "</button>").join("") + "</div>";
      else if(tousMe) dockH = '<p class="sm" style="text-align:center; margin:0">' + tr("Ton pari à toi :", "Your own bet:") + '</p><div class="rn-bets"><button type="button" class="r" data-a="r"' + (inp.a === "r" ? ' aria-pressed="true"' : "") + ">" + tr("Rouge", "Red") + '</button><button type="button" class="b" data-a="n"' + (inp.a === "n" ? ' aria-pressed="true"' : "") + ">" + tr("Noir", "Black") + "</button></div>";
      else dockH = '<p class="wait">' + tr(esc(ctx.name(cur)) + " réfléchit…", esc(ctx.name(cur)) + " is thinking…") + "</p>";
    } else {
      body = cardsHTML(s, s.last ? s.last.n : 0) + verdictHTML(s, ctx.name);
      const last = s.step + 1 >= stepsOf(s);
      dockH = mine || ctx.isHost ? '<button class="btn acc" type="button" data-nx>' + (last ? tr("Joueur suivant", "Next player") : tr("Étape suivante", "Next step")) + "</button>" : '<p class="wait">' + tr("On attend " + esc(ctx.name(cur)) + "…", "Waiting for " + esc(ctx.name(cur)) + "…") + "</p>";
    }
    screen(root, "rn" + s.k + s.phase + s.step + (inp.a || "") + mine, head + body + SB.u.dock(dockH), r => {
      r.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { buzz(12); ctx.send({ b: b.dataset.b, st: s.step }); r.querySelectorAll("[data-b]").forEach(x => { x.disabled = true; }); }));
      r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ a: b.dataset.a }); }));
      const nx = r.querySelector("[data-nx]"); if(nx) nx.addEventListener("click", () => {
        buzz(8);
        if(mine) ctx.send({ nx: s.step });
        else ctx.act(c => { if(c.s.phase !== "show" || c.s.k !== s.k || c.s.step !== s.step) return; DEF_HOST_NEXT(c); });
      });
    });
  },

  /* ---------- Un seul téléphone : on se passe le téléphone ---------- */
  local: {
    players: { min: 1, max: 16 },
    start(root, api){
      const names = api.names, st = store();
      let ride = !!st.rnRide, turns = [2, 3, 5].indexOf(st.rnTurns) >= 0 ? st.rnTurns : 3, twOn = st.rnTw !== false;
      let E = null, deck = [], gno = 0, tok = Math.random().toString(36).slice(2, 7), fresh = 0;
      const nameOf = id => id;
      function setup(){
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Chacun son tour, le joueur parie sur la prochaine carte. Les autres regardent… et comptent les gages.", "Taking turns, the player bets on the next card. Everyone else watches… and counts the forfeits.") + "</p>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-ride aria-pressed="' + ride + '"><span class="box">✓</span><span class="tx"><span class="nm">Ride the bus</span><span class="ds">' + tr("4 étapes par tour : couleur, plus ou moins, entre ou dehors, enseigne", "4 steps per turn: color, higher or lower, inside or outside, suit") + "</span></span></button>" +
          '<button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Tour en or, le monde à l'envers", "Golden turn, upside down") + "</span></span></button></div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Tours par joueur", "Turns per player") + '</span><div class="seg">' + [2, 3, 5].map(n => '<button type="button" data-t="' + n + '" aria-pressed="' + (turns === n) + '">' + n + "</button>").join("") + "</div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Mélanger le paquet", "Shuffle the deck") + "</button>"), r => {
          r.querySelector("[data-ride]").addEventListener("click", () => { ride = !ride; persist({ rnRide: ride }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ rnTw: twOn }); setup(); });
          r.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { turns = +b.dataset.t; persist({ rnTurns: turns }); setup(); }));
          r.querySelector("[data-go]").addEventListener("click", () => {
            deck = newDeck(); gno++;
            E = { order: shuffle(names), ti: 0, done: {}, turns, ride, step: 0, cards: [], last: null, pts: {}, okc: {}, koc: {}, vio: {}, tw: "", n: 1 };
            bet();
          });
        });
      }
      const head = () => CSS + '<span class="eyebrow">' + tr("Tour de ", "") + esc(E.order[E.ti]) + tr("", "'s turn") + " · " + tr("", "turn ") + ((E.done[E.order[E.ti]] || 0) + 1) + " / " + E.turns + (E.ride ? " · " + STEPN[E.step] : "") + "</span>" + SB.u.twistHTML(SB.u.byTwist(TWL, E.tw)) + stepsHTML(E);
      function bet(){
        screen(root, "b" + gno + ":" + E.n + ":" + E.step, head() + cardsHTML(E, 0) + '<p class="rn-q">' + question(E) + "</p>" +
          SB.u.dock('<div class="rn-bets' + (E.step === 3 ? " s4" : "") + '">' + BETS[E.step]().map(x => '<button type="button" class="' + x[2] + '" data-b="' + esc(x[0]) + '">' + esc(x[1]) + "</button>").join("") + '</div><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => {
            buzz(12); const gl = apply(E, deck, b.dataset.b, null); fresh = E.last.n;
            if(api.gage) api.gage(gl.map(g => ({ id: nameOf(g.id), ev: g.ev, x: g.x })), "rn" + tok + "-" + gno + ":" + E.n + ":" + E.step);
            show();
          }));
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      function show(){
        const last = E.step + 1 >= stepsOf(E);
        screen(root, "s" + gno + ":" + E.n + ":" + E.step, head() + cardsHTML(E, fresh) + verdictHTML(E, nameOf) +
          SB.u.dock('<button class="btn acc" type="button" data-nx>' + (last ? tr("Joueur suivant", "Next player") : tr("Étape suivante", "Next step")) + "</button>"), r => {
          r.querySelector("[data-nx]").addEventListener("click", () => {
            buzz(8);
            if(!last){ E.step++; E.last = null; bet(); return; }
            if(!nextTurn(E, null)){ end(); return; }
            const t = twOn && E.n > 0 ? SB.u.twist(TWL, { last: E.tw, n: names.length, rate: .3 }) : null; E.n++; E.tw = t ? t.id : "";
            bet();
          });
        });
      }
      function end(){
        const order = names.slice().sort((a, b) => (E.pts[b] || 0) - (E.pts[a] || 0)), mx = E.pts[order[0]] || 0, aw = awards(names, E, nameOf);
        if(api.win){ let tries = 0; const go = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(go, 500); else api.win(mx ? order.filter(n => (E.pts[n] || 0) === mx) : []); }; go(); }
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Le meilleur parieur", "Best bettor") + '</span><div class="who">' + esc(order[0]) + "</div>" + standings(names, E.pts, nameOf) +
          (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// L'hôte fait avancer à la place du joueur (bouton « suivant » chez l'hôte).
function DEF_HOST_NEXT(c){
  const E = JSON.parse(JSON.stringify(c.s));
  if(E.step + 1 < stepsOf(E) && E.last){ E.step++; E.last = null; c.set(Object.assign(E, { phase: "bet", k: c.rid() })); return; }
  if(!nextTurn(E, c.here)){ c.set(Object.assign(E, { phase: "end" })); return; }
  const lv = c.ids.filter(id => c.here(id)), t = c.opts.twists !== false && E.n > 1 ? SB.u.twist(TW, { last: E.tw, n: lv.length, rate: .3 }) : null;
  E.n++; E.tw = t ? t.id : "";
  c.set(Object.assign(E, { phase: "bet", k: c.rid() }));
}
})();
