/* Le jeu du PMU — la course des as. Chacun parie sur un as, on retourne les cartes :
   chaque carte fait avancer l'as de sa couleur. Quand tous les chevaux ont passé une étape,
   on retourne la carte cachée de l'étape : le cheval de sa couleur recule. Le premier qui franchit la ligne gagne. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz } = SB.u;

const SU = ["h", "d", "s", "c"], SYM = { h: "♥", d: "♦", s: "♠", c: "♣" };
const SUN = { h: tr("Cœur", "Hearts"), d: tr("Carreau", "Diamonds"), s: tr("Pique", "Spades"), c: tr("Trèfle", "Clubs") };
const red = su => su === "h" || su === "d";
const rank = v => (v <= 10 ? String(v) : tr({ 11: "V", 12: "D", 13: "R" }[v], { 11: "J", 12: "Q", 13: "K" }[v]));
// Paquet sans les as (les as sont les chevaux).
const deck48 = () => shuffle([].concat(...SU.map(su => [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(v => v + su))));
const cs = c => String(c).slice(-1), cv = c => parseInt(c, 10);

/* ---------- La course, calculée d'avance (tout le monde voit exactement la même) ----------
   ev = [{ c: carte, su, pos: {h,d,s,c}, trap: étape | 0, msg }] ; L = nombre d'étapes ; arrivée à L + 1. */
function simulate(L, tw){
  const pos = { h: 0, d: 0, s: 0, c: 0 }, deck = deck48(), traps = deck.splice(0, L), rev = new Array(L + 1).fill(false), ev = [];
  let dope = "";
  if(tw === "dope"){ dope = pick(SU); pos[dope] = 1; }
  const lead = () => SU.slice().sort((a, b) => pos[b] - pos[a])[0];
  let leader = "", fell = false, win = "";
  ev.push({ c: "", su: dope, pos: Object.assign({}, pos), trap: 0, msg: dope ? tr(SUN[dope] + " est dopé : il part avec une case d'avance !", SUN[dope] + " is doped: starts one step ahead!") : tr("Et c'est parti !", "And they're off!") });
  for(let guard = 0; guard < 200 && !win; guard++){
    if(!deck.length) deck.push(...deck48().filter(c => traps.indexOf(c) < 0));
    const c = deck.pop(), su = cs(c);
    pos[su]++;
    let msg = tr(SUN[su] + " avance.", SUN[su] + " moves up.");
    if(pos[su] > L){ win = su; msg = tr(SUN[su] + " franchit la ligne ! Victoire !", SUN[su] + " crosses the line! Victory!"); }
    else { const l = lead(); if(pos[l] > 0 && l !== leader && SU.filter(x => pos[x] === pos[l]).length === 1){ leader = l; msg = tr(SUN[l] + " prend la tête !", SUN[l] + " takes the lead!"); } }
    ev.push({ c, su, pos: Object.assign({}, pos), trap: 0, msg });
    if(win) break;
    // Chute générale (coup de théâtre) : la première fois qu'un cheval atteint la mi-course.
    if(tw === "chute" && !fell && pos[su] >= Math.ceil(L / 2)){ fell = true; SU.forEach(x => { pos[x] = Math.max(0, pos[x] - 1); }); ev.push({ c: "", su: "", pos: Object.assign({}, pos), trap: 0, fall: 1, msg: tr("Chute générale ! Tout le monde recule d'une case.", "Pile-up! Everyone moves back one step.") }); }
    // Étapes passées par tous les chevaux : on retourne la carte piège.
    for(let k = 1; k <= L; k++){
      if(rev[k] || !SU.every(x => pos[x] >= k)) continue;
      rev[k] = true; const t = traps[k - 1], ts = cs(t);
      pos[ts] = Math.max(0, pos[ts] - 1);
      ev.push({ c: t, su: ts, pos: Object.assign({}, pos), trap: k, msg: tr("Étape " + k + " : la carte piège est " + SUN[ts] + ", qui recule !", "Step " + k + ": the trap card is " + SUN[ts] + ", who moves back!") });
    }
  }
  return { ev, win, traps };
}
// Résultat des paris : bets = { id: { h: couleur, m: mise } }. Cote double pour l'outsider (le cheval le moins parié) si le coup de théâtre est actif.
function payout(bets, win, tw){
  const cnt = { h: 0, d: 0, s: 0, c: 0 }; Object.keys(bets).forEach(id => { cnt[bets[id].h]++; });
  const bet = SU.filter(x => cnt[x] > 0), min = Math.min(...bet.map(x => cnt[x])), outs = tw === "cote" && bet.length > 1 ? bet.filter(x => cnt[x] === min) : [];
  const gl = [], gain = {};
  Object.keys(bets).forEach(id => {
    const b = bets[id], k = outs.indexOf(b.h) >= 0 ? 4 : 2;
    if(b.h === win){ gain[id] = b.m * k; gl.push({ id, ev: "gagne", x: b.m * k }); }
    else { gain[id] = -b.m; gl.push({ id, ev: "perdu", x: b.m }); }
  });
  return { gl, gain, outs };
}

/* ---------- Affichage ---------- */
const CSS = '<style data-pm>' +
  '.pm-track{display:flex; flex-direction:column; gap:6px; padding:10px; border-radius:18px; background:#1d5a33; border:3px solid #0f3a20; position:relative}' +
  '.pm-traps,.pm-lane{display:grid; gap:3px; align-items:center}' +
  '.pm-lane{height:46px; border-radius:10px; background:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 2px,transparent 2px 100%); position:relative}' +
  '.pm-lane .fin{position:absolute; right:0; top:0; bottom:0; width:8px; background:repeating-linear-gradient(0deg,#fff 0 6px,#14101a 6px 12px); border-radius:2px}' +
  '.pm-h{position:absolute; left:0; top:3px; width:34px; height:40px; border-radius:7px; background:#fbf7f0; border:2px solid #fff; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:900; line-height:1; box-shadow:0 4px 10px -4px rgba(0,0,0,.7); transition:left .45s cubic-bezier(.3,.8,.3,1), transform .3s}' +
  '.pm-h i{font-style:normal; font-size:13px}.pm-h b{font-size:18px}.pm-h.r{color:#d8263a}.pm-h.k{color:#14101a}.pm-h.win{transform:scale(1.25); box-shadow:0 0 0 3px #ffd400}.pm-h.back{animation:pm-back .5s}@keyframes pm-back{50%{transform:translateX(-6px) rotate(-12deg)}}' +
  '.pm-tc{height:34px; border-radius:6px; background:repeating-linear-gradient(45deg,#7a2fd0 0 6px,#5a1fa3 6px 12px); border:2px solid #fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:13px}.pm-tc.open{background:#fbf7f0}.pm-tc.open.r{color:#d8263a}.pm-tc.open.k{color:#14101a}.pm-tc.none{visibility:hidden}' +
  '.pm-cur{display:flex; align-items:center; justify-content:center; gap:12px; min-height:70px}.pm-card{width:48px; height:66px; border-radius:8px; background:#fbf7f0; border:2px solid #fff; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:900; line-height:1; animation:pm-flip .35s}.pm-card.r{color:#d8263a}.pm-card.k{color:#14101a}.pm-card i{font-style:normal; font-size:20px}.pm-card b{font-size:22px}@keyframes pm-flip{0%{transform:rotateY(90deg)}100%{transform:none}}' +
  '.pm-msg{font-weight:800; font-size:17px; margin:0; text-align:center; flex:1}' +
  '.pm-hs{display:grid; grid-template-columns:repeat(4,1fr); gap:6px}.pm-hs button{min-height:62px; border-radius:14px; border:2px solid var(--line); background:#fbf7f0; font-weight:900; font-size:15px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; line-height:1}.pm-hs button b{font-size:24px}.pm-hs button.r{color:#d8263a}.pm-hs button.k{color:#14101a}.pm-hs button[aria-pressed="true"]{outline:4px solid var(--acc); outline-offset:1px}.pm-hs button span{font-size:11px; color:#5d556a}' +
  '.pm-m{display:flex; align-items:center; justify-content:center; gap:14px}.pm-m b{font-family:var(--f-disp); font-size:34px; min-width:40px; text-align:center}' +
  '.pm-bets{display:flex; flex-direction:column; gap:6px}.pm-bet{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:800}.pm-bet b{flex:1}.pm-bet .s{font-size:20px}.pm-bet .s.r{color:#ff5d6c}.pm-bet .g{font-family:var(--f-disp); font-size:18px}.pm-bet .g.p{color:#2fa860}.pm-bet .g.n{color:var(--bad)}' +
  '.pm-pl{display:flex; flex-direction:column; gap:8px; padding:10px 12px; border-radius:14px; background:var(--card); border:1.5px solid var(--line)}.pm-pl .top{display:flex; align-items:center; justify-content:space-between; font-weight:800}.pm-pl .pm-hs button{min-height:48px}</style>';
const cols = L => "grid-template-columns:repeat(" + (L + 2) + ",1fr)";
function trackHTML(L, traps){
  return '<div class="pm-track"><div class="pm-traps" style="' + cols(L) + '"><span class="pm-tc none"></span>' + Array.from({ length: L }, (_, k) => '<span class="pm-tc" data-tr="' + (k + 1) + '"></span>').join("") + '<span class="pm-tc none"></span></div>' +
    SU.map(su => '<div class="pm-lane" data-lane="' + su + '"><span class="fin"></span><span class="pm-h ' + (red(su) ? "r" : "k") + '" data-h="' + su + '"><i>A</i><b>' + SYM[su] + "</b></span></div>").join("") + "</div>" +
    '<div class="pm-cur"><span data-cc></span><p class="pm-msg" data-msg>' + tr("Faites vos jeux…", "Place your bets…") + "</p></div>";
}
// Place les chevaux et les cartes pièges pour l'événement i (sans reconstruire l'écran : les transitions restent fluides).
function paintRace(root, L, race, i, prev){
  const e = race.ev[Math.max(0, Math.min(i, race.ev.length - 1))]; if(!e) return;
  SU.forEach(su => {
    const h = root.querySelector('[data-h="' + su + '"]'); if(!h) return;
    h.style.left = "calc(" + (e.pos[su] / (L + 1)) + " * (100% - 38px))";
    h.classList.toggle("win", !!race.win && i >= race.ev.length - 1 && su === race.win);
    if(prev != null && prev !== i && e.trap && e.su === su){ h.classList.remove("back"); void h.offsetWidth; h.classList.add("back"); }
  });
  for(let k = 1; k <= L; k++){
    const t = root.querySelector('[data-tr="' + k + '"]'); if(!t) continue;
    const open = race.ev.slice(0, i + 1).find(x => x.trap === k);
    if(open && !t.classList.contains("open")){ const su = cs(open.c); t.className = "pm-tc open " + (red(su) ? "r" : "k"); t.textContent = rank(cv(open.c)) + SYM[su]; }
  }
  if(prev !== i){
    const cc = root.querySelector("[data-cc]"); if(cc) cc.innerHTML = e.c ? '<span class="pm-card ' + (red(cs(e.c)) ? "r" : "k") + '"><i>' + esc(rank(cv(e.c))) + "</i><b>" + SYM[cs(e.c)] + "</b></span>" : "";
    const m = root.querySelector("[data-msg]"); if(m) m.textContent = e.msg;
  }
}
function betsHTML(bets, nameOf, gain){
  return '<div class="pm-bets">' + Object.keys(bets).map(id => { const b = bets[id], g = gain ? gain[id] : null; return '<div class="pm-bet"><b>' + esc(nameOf(id)) + '</b><span class="s' + (red(b.h) ? " r" : "") + '">' + SYM[b.h] + "</span><span>× " + b.m + "</span>" + (g != null ? '<span class="g ' + (g > 0 ? "p" : "n") + '">' + (g > 0 ? "+" : "") + g + "</span>" : "") + "</div>"; }).join("") + "</div>";
}
const horseBtns = (sel, cnt) => '<div class="pm-hs">' + SU.map(su => '<button type="button" class="' + (red(su) ? "r" : "k") + '" data-hs="' + su + '" aria-pressed="' + (sel === su) + '"><b>' + SYM[su] + "</b>" + esc(SUN[su]) + (cnt ? "<span>" + (cnt[su] || 0) + tr(" pari", " bet") + ((cnt[su] || 0) > 1 ? "s" : "") + "</span>" : "") + "</button>").join("") + "</div>";
const TW = [
  { id: "dope", name: tr("Cheval dopé", "Doped horse"), desc: tr("Un cheval part avec une case d'avance.", "One horse starts a step ahead.") },
  { id: "chute", name: tr("Chute générale", "Pile-up"), desc: tr("À mi-course, tous les chevaux reculent d'une case.", "Halfway through, every horse moves back one step.") },
  { id: "cote", name: tr("Cote de l'outsider", "Outsider odds"), desc: tr("Le cheval le moins parié rapporte le double s'il gagne.", "The least-backed horse pays double if it wins.") }
];
const SPEED = { normal: 1150, rapide: 700 };
function standings(ids, pts, nameOf){ return '<div class="pm-bets">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map((id, i) => '<div class="pm-bet"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="g ' + ((pts[id] || 0) >= 0 ? "p" : "n") + '">' + (pts[id] || 0) + "</span></div>").join("") + "</div>"; }

SB.register({
  id: "pmu", name: tr("Le PMU", "Horse Race"), glyph: "A♠", pitch: tr("La course des as : parie sur ton cheval et croise les doigts.", "The race of the aces: bet on your horse and cross your fingers."), hot: false, ticks: true,
  accent: { light: "#1f8f4e", dark: "#41c47a" },
  tag: tr("Chacun parie sur un as. Les cartes font avancer les chevaux, les cartes pièges les font reculer. Les gagnants distribuent, les perdants boivent.", "Everyone bets on an ace. Cards move the horses forward, trap cards push them back. Winners hand out, losers drink."),
  min: 2, max: 20, gagesEnd: false,
  gages: [
    { ev: "perdu", label: tr("Mauvais cheval (× la mise)", "Wrong horse (× your bet)"), kind: "boit", n: 1 },
    { ev: "gagne", label: tr("Bon cheval (× la mise × 2)", "Right horse (× your bet × 2)"), kind: "distribue", n: 1 }
  ],
  rules: tr([
    "Les 4 as sont les chevaux : Cœur, Carreau, Pique, Trèfle. Une rangée de cartes cachées marque les étapes de la piste.",
    "Avant la course, chacun choisit un cheval et sa mise (de 1 à 5).",
    "Les cartes du paquet se retournent une par une : chaque carte fait avancer d'une case l'as de sa couleur.",
    "Quand les 4 chevaux ont passé une étape, on retourne la carte piège de cette étape : le cheval de sa couleur recule d'une case.",
    "Le premier qui franchit la ligne gagne. Ceux qui l'ont joué distribuent leur mise × 2, les autres prennent leur mise.",
    "Coups de théâtre : cheval dopé, chute générale, cote de l'outsider (le cheval le moins parié rapporte double).",
    "Plusieurs courses : les gains s'additionnent, le meilleur parieur gagne."
  ], [
    "The 4 aces are the horses: Hearts, Diamonds, Spades, Clubs. A row of face-down cards marks the steps of the track.",
    "Before the race, everyone picks a horse and a bet (1 to 5).",
    "Deck cards are flipped one by one: each card moves the ace of its suit one step forward.",
    "Once all 4 horses have passed a step, that step's trap card is flipped: the horse of its suit moves back one step.",
    "First to cross the line wins. Those who backed it hand out their bet × 2, everyone else takes their bet.",
    "Twists: doped horse, pile-up, outsider odds (the least-backed horse pays double).",
    "Several races: winnings add up, the best bettor wins."
  ]),
  options: [
    { id: "len", label: tr("Longueur de la piste", "Track length"), type: "seg", def: 7, values: [{ v: 5, label: tr("5 étapes", "5 steps") }, { v: 7, label: tr("7 étapes", "7 steps") }, { v: 9, label: tr("9 étapes", "9 steps") }] },
    { id: "races", label: tr("Courses", "Races"), type: "seg", def: 3, values: [{ v: 1, label: "1" }, { v: 3, label: "3" }, { v: 5, label: "5" }] },
    { id: "speed", label: tr("Vitesse", "Speed"), type: "seg", def: "normal", values: [{ v: "normal", label: tr("Normale", "Normal") }, { v: "rapide", label: tr("Rapide", "Fast") }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Cheval dopé, chute générale, cote de l'outsider", "Doped horse, pile-up, outsider odds"), def: true }
  ],
  start(ctx, o){
    return { phase: "bet", L: [5, 7, 9].indexOf(o.len) >= 0 ? o.len : 7, races: o.races || 3, n: 1, ms: SPEED[o.speed] || SPEED.normal, tw: "", race: null, bets: {}, res: null, pts: {} };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "bet"){
      const bets = {};
      if(!live.length || !live.every(id => { const i = ctx.input(id); if(i && i.go && SU.indexOf(i.h) >= 0 && +i.m >= 1 && +i.m <= 5){ bets[id] = { h: i.h, m: +i.m }; return true; } return false; })) return;
      const race = simulate(s.L, s.tw);
      ctx.set({ phase: "race", race, bets, startAt: ctx.now() + 1200, k: ctx.rid() });
      return;
    }
    if(s.phase === "race"){
      if(ctx.now() < s.startAt + s.race.ev.length * s.ms + 1500) return;
      const P = payout(s.bets, s.race.win, s.tw), pts = Object.assign({}, s.pts);
      Object.keys(P.gain).forEach(id => { pts[id] = (pts[id] || 0) + P.gain[id]; });
      ctx.gage(P.gl, s.k);
      ctx.set({ phase: "res", res: P, pts });
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), inp = ctx.mine() || {}, live = ctx.ids.filter(id => ctx.here(id));
    const head = CSS + '<span class="eyebrow">' + tr("Course ", "Race ") + s.n + " / " + s.races + " · " + s.L + tr(" étapes", " steps") + "</span>" + SB.u.twistHTML(T);
    if(s.phase === "bet"){
      const sel = inp.h || "", m = +inp.m || 1, cnt = {}; live.forEach(id => { const x = ctx.input(id); if(x && x.go) cnt[x.h] = (cnt[x.h] || 0) + 1; });
      const done = live.filter(id => { const x = ctx.input(id); return x && x.go; });
      screen(root, "bt" + s.k + sel + m + (inp.go ? 1 : 0) + JSON.stringify(cnt), head + trackHTML(s.L, []) +
        (ctx.playing ? '<span class="eyebrow">' + tr("Ton cheval", "Your horse") + "</span>" + horseBtns(sel, cnt) +
          '<div class="pm-m"><button type="button" class="gs-b" data-m="-1" aria-label="' + tr("Moins", "Less") + '">−</button><b>' + m + '</b><button type="button" class="gs-b" data-m="1" aria-label="' + tr("Plus", "More") + '">+</button></div><p class="sm" style="text-align:center; margin:0">' + tr("Ta mise : si ton cheval gagne, tu distribues " + (m * 2) + " ; sinon tu prends " + m + ".", "Your bet: if your horse wins you hand out " + (m * 2) + "; otherwise you take " + m + ".") + "</p>" : "") +
        SB.u.dock(ctx.playing ? '<button class="btn acc" type="button" data-go' + (sel ? "" : " disabled") + ">" + (inp.go ? tr("Pari validé · changer", "Bet placed · change") : tr("Valider mon pari", "Place my bet")) + '</button><p class="wait" data-wait></p>' : '<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-hs]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ h: b.dataset.hs, m, go: 0 }); }));
        r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { buzz(6); ctx.send({ h: sel, m: Math.max(1, Math.min(5, m + +b.dataset.m)), go: 0 }); }));
        const g = r.querySelector("[data-go]"); if(g) g.addEventListener("click", () => { if(!sel) return; buzz(12); ctx.send({ h: sel, m, go: inp.go ? 0 : 1 }); });
      });
      SU.forEach(su => { const h = root.querySelector('[data-h="' + su + '"]'); if(h) h.style.left = "0px"; });
      txt(root, "[data-wait]", done.length + " / " + live.length + tr(" paris", " bets"));
      return;
    }
    if(s.phase === "race" || s.phase === "res"){
      const race = s.race, i = s.phase === "res" ? race.ev.length - 1 : Math.floor((ctx.now() - s.startAt) / s.ms);
      const first = root.dataset.key !== "pm:" + s.k;
      if(first){
        root.dataset.key = "pm:" + s.k; root.innerHTML = head + trackHTML(s.L, race.traps) + '<div data-under></div>' + '<div class="dock" data-dock></div>';
        root.dataset.pi = "";
      }
      const prev = root.dataset.pi === "" ? null : +root.dataset.pi;
      if(i >= 0){ if(prev !== i && prev != null && i < race.ev.length) buzz(race.ev[i].trap ? [20, 30, 20] : 6); paintRace(root, s.L, race, i, prev); root.dataset.pi = String(i); }
      const under = root.querySelector("[data-under]"), dock = root.querySelector("[data-dock]");
      const uk = s.phase + (s.res ? "r" : "") + ctx.isHost;
      if(under.dataset.k !== uk){
        under.dataset.k = uk;
        if(s.phase === "res"){
          const R = s.res, last = s.n >= s.races;
          under.innerHTML = '<p class="pm-msg" style="font-family:var(--f-disp); font-size:26px">' + tr(SUN[race.win] + " gagne !", SUN[race.win] + " wins!") + "</p>" + (A(R.outs).indexOf(race.win) >= 0 ? '<p class="note-box">' + tr("L'outsider a gagné : cote double !", "The outsider won: double odds!") + "</p>" : "") + betsHTML(s.bets, ctx.name, R.gain);
          dock.innerHTML = ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Course suivante", "Next race")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>";
          const b = dock.querySelector("[data-next]");
          if(b) b.addEventListener("click", () => ctx.act(c => {
            const st = c.s; if(st.phase !== "res") return;
            if(st.n >= st.races){ c.set({ phase: "end" }); return; }
            const t = c.opts.twists !== false ? SB.u.twist(TW, { last: st.tw, rate: .4 }) : null;
            c.set({ phase: "bet", n: st.n + 1, tw: t ? t.id : "", race: null, bets: {}, res: null, k: c.rid() });
          }));
        } else { under.innerHTML = betsHTML(s.bets, ctx.name, null); dock.innerHTML = '<p class="wait">' + tr("La course est lancée !", "The race is on!") + "</p>"; }
      }
      return;
    }
    if(s.phase === "end"){
      const p = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Le roi du turf", "King of the track") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + standings(ctx.ids, p, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.ids.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0;
          c.end({ title: tr("Le PMU : ", "Horse Race: ") + c.name(o2[0]) + tr(", roi du turf", ", king of the track"), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0)), win: mx > 0 ? o2.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : tout le monde parie sur le même écran, puis on regarde la course ---------- */
  local: {
    players: { min: 1, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let L = [5, 7, 9].indexOf(st.pmLen) >= 0 ? st.pmLen : 7, races = [1, 3, 5].indexOf(st.pmRaces) >= 0 ? st.pmRaces : 3, fast = !!st.pmFast, twOn = st.pmTw !== false;
      let n = 0, tw = null, bets = {}, pts = {}, gno = 0, tok = Math.random().toString(36).slice(2, 7), timer = null;
      const stop = () => { clearInterval(timer); timer = null; };
      function setup(){
        stop();
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Chacun choisit son cheval et sa mise sur le même écran, puis on regarde la course tous ensemble.", "Everyone picks a horse and a bet on the same screen, then you all watch the race.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Longueur de la piste", "Track length") + '</span><div class="seg">' + [5, 7, 9].map(v => '<button type="button" data-l="' + v + '" aria-pressed="' + (L === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Courses", "Races") + '</span><div class="seg">' + [1, 3, 5].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (races === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-f aria-pressed="' + fast + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Course rapide", "Fast race") + "</span></span></button>" +
          '<button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Cheval dopé, chute générale, cote de l'outsider", "Doped horse, pile-up, outsider odds") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Ouvrir les paris", "Open the betting") + "</button>"), r => {
          r.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => { L = +b.dataset.l; persist({ pmLen: L }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { races = +b.dataset.r; persist({ pmRaces: races }); setup(); }));
          r.querySelector("[data-f]").addEventListener("click", () => { fast = !fast; persist({ pmFast: fast }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ pmTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => { n = 0; pts = {}; tw = null; gno++; nextRace(); });
        });
      }
      const head = () => CSS + '<span class="eyebrow">' + tr("Course ", "Race ") + n + " / " + races + "</span>" + SB.u.twistHTML(tw);
      function nextRace(){
        n++; tw = twOn && n > 1 ? SB.u.twist(TW, { last: tw ? tw.id : "", rate: .4 }) : null;
        bets = {}; names.forEach(x => { bets[x] = { h: "", m: 1 }; });
        betScreen();
      }
      function betScreen(){
        const ok = names.every(x => bets[x].h);
        screen(root, "b" + gno + ":" + n + JSON.stringify(bets), head() + names.map(x => '<div class="pm-pl"><div class="top"><span>' + esc(x) + '</span><span class="pm-m" style="gap:8px"><button type="button" class="gs-b" data-pm="' + esc(x) + '" data-d="-1">−</button><b style="font-size:24px">' + bets[x].m + '</b><button type="button" class="gs-b" data-pm="' + esc(x) + '" data-d="1">+</button></span></div>' +
            '<div class="pm-hs">' + SU.map(su => '<button type="button" class="' + (red(su) ? "r" : "k") + '" data-ph="' + esc(x) + '" data-su="' + su + '" aria-pressed="' + (bets[x].h === su) + '"><b>' + SYM[su] + "</b></button>").join("") + "</div></div>").join("") +
          SB.u.dock('<button class="btn acc" type="button" data-run' + (ok ? "" : " disabled") + ">" + (ok ? tr("Lancer la course", "Start the race") : tr("Chacun choisit un cheval", "Everyone picks a horse")) + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelectorAll("[data-ph]").forEach(b => b.addEventListener("click", () => { bets[b.dataset.ph].h = b.dataset.su; buzz(6); betScreen(); }));
          r.querySelectorAll("[data-pm]").forEach(b => b.addEventListener("click", () => { const x = bets[b.dataset.pm]; x.m = Math.max(1, Math.min(5, x.m + +b.dataset.d)); buzz(6); betScreen(); }));
          r.querySelector("[data-run]").addEventListener("click", run);
          r.querySelector("[data-q]").addEventListener("click", () => { stop(); api.exit(); });
        });
      }
      function run(){
        stop();
        const race = simulate(L, tw ? tw.id : ""), ms = fast ? SPEED.rapide : SPEED.normal, t0 = Date.now() + 900;
        root.dataset.key = "lr" + gno + ":" + n;
        root.innerHTML = head() + trackHTML(L, race.traps) + betsHTML(bets, x => x, null) + '<div class="dock"><p class="wait">' + tr("La course est lancée !", "The race is on!") + "</p></div>";
        let prev = null;
        const tick = () => {
          if(!root.isConnected || root.dataset.key !== "lr" + gno + ":" + n){ stop(); return; }
          const i = Math.floor((Date.now() - t0) / ms);
          if(i < 0) return;
          if(i >= race.ev.length + 1){ stop(); result(race); return; }
          const j = Math.min(i, race.ev.length - 1);
          if(j !== prev){ buzz(race.ev[j].trap ? [20, 30, 20] : 6); paintRace(root, L, race, j, prev); prev = j; }
        };
        timer = setInterval(tick, 120);
      }
      function result(race){
        const P = payout(bets, race.win, tw ? tw.id : "");
        Object.keys(P.gain).forEach(x => { pts[x] = (pts[x] || 0) + P.gain[x]; });
        if(api.gage) api.gage(P.gl, "pm" + tok + "-" + gno + ":" + n);
        const last = n >= races, dock = root.querySelector(".dock");
        const box = document.createElement("div"); box.style.cssText = "display:flex; flex-direction:column; gap:8px";
        box.innerHTML = '<p class="pm-msg" style="font-family:var(--f-disp); font-size:26px">' + tr(SUN[race.win] + " gagne !", SUN[race.win] + " wins!") + "</p>" + (A(P.outs).indexOf(race.win) >= 0 ? '<p class="note-box">' + tr("L'outsider a gagné : cote double !", "The outsider won: double odds!") + "</p>" : "") + betsHTML(bets, x => x, P.gain);
        const old = root.querySelector(".pm-bets"); if(old) old.replaceWith(box);
        dock.innerHTML = '<button class="btn acc" type="button" data-n>' + (last ? tr("Voir le classement", "See the standings") : tr("Course suivante", "Next race")) + "</button>";
        dock.querySelector("[data-n]").addEventListener("click", () => { if(last) end(); else nextRace(); });
      }
      function end(){
        stop();
        const order = names.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[order[0]] || 0;
        if(api.win){ let tries = 0; const go = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(go, 500); else api.win(mx > 0 ? order.filter(x => (pts[x] || 0) === mx) : []); }; go(); }
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Le roi du turf", "King of the track") + '</span><div class="who">' + esc(order[0]) + "</div>" + standings(names, pts, x => x) +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
})();
