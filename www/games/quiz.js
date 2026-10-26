/* Quiz de culture — QCM, estimations (le plus proche gagne) et vrai ou faux.
   Avant chaque question, chacun mise 1, 2 ou 3 points sur sa confiance : bonne réponse = + la mise, mauvaise = − la mise.
   Les questions sont dans quiz-data.js (SB.QUIZ), plus « Nos questions » (gardées sur le téléphone). */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, tr, buzz, clean } = SB.u;
const LG = () => (SB.lang() === "en" ? "en" : "fr");
const DATA = () => SB.QUIZ || {};
const SEEN = "quiz";
const PACKS0 = [
  ["culture", tr("Culture G", "General knowledge"), tr("Arts, sciences, inventions, langue…", "Arts, science, inventions, language…")],
  ["pop", tr("Pop culture", "Pop culture"), tr("Films, séries, musique, jeux vidéo", "Films, shows, music, video games")],
  ["histoire", tr("Histoire", "History"), tr("De l'Antiquité à nos jours", "From antiquity to today")],
  ["geo", tr("Géographie", "Geography"), tr("Capitales, fleuves, montagnes, régions", "Capitals, rivers, mountains, regions")],
  ["sport", "Sport", tr("Foot, rugby, tennis, JO, F1…", "Football, rugby, tennis, Olympics, F1…")],
  ["bouffe", tr("Bouffe", "Food"), tr("Fromages, plats, origines des aliments", "Cheeses, dishes, where food comes from")],
  ["insolite", tr("Insolite", "Weird but true"), tr("Des faits bizarres mais vrais", "Strange but true facts")],
  ["soiree", tr("Soirée", "Party"), tr("Cocktails, vins, bières, tubes de soirée", "Cocktails, wine, beer, party anthems")],
  ["hot", tr("Culture coquine", "Naughty trivia"), tr("Amour, séduction et sexe, version culture G", "Love, seduction and sex, trivia style"), "hot"],
  ["kid", tr("Enfants", "Kids"), tr("Animaux, dessins animés, sciences, espace", "Animals, cartoons, science, space"), "kid"]
];
const myQs = () => A(store().quizCustom).filter(x => x && x.q && A(x.a).length >= 2).slice(0, 200);
const PACKS = () => PACKS0.map(p => ({ v: p[0], label: p[1], desc: p[2], hot: p[3] === "hot", kid: p[3] === "kid", count: A(DATA()[p[0]]).length }))
  .concat([{ v: "perso", label: tr("Nos questions", "Our questions"), desc: tr("Vos propres questions", "Your own questions"), count: myQs().length }]);
const TYPES = [["q", "QCM"], ["n", tr("Estimations", "Estimates")], ["vf", tr("Vrai ou faux", "True or false")]];
const VF = () => [tr("Vrai", "True"), tr("Faux", "False")];
const fmt = n => { const r = Math.round(n * 100) / 100; return LG() === "fr" ? String(r).replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".", ",") : String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
const numOf = s => { const v = parseFloat(String(s || "").replace(/\s/g, "").replace(",", ".")); return isFinite(v) ? v : null; };
const catName = c => (PACKS0.find(p => p[0] === c) || [0, tr("Nos questions", "Our questions")])[1];
const typeName = t => (TYPES.find(x => x[0] === t) || [0, ""])[1];

/* Prépare une question jouable : choix mélangés et index de la bonne réponse (le secret reste chez l'hôte). */
function prep(key){
  const [cat, i] = key.split(":"), lg = LG();
  if(cat === "perso"){
    const x = myQs()[+i]; if(!x) return null;
    const a = A(x.a).map(s => clean(s, 60)).filter(Boolean), ch = shuffle(a.slice());
    return { key, cat, t: "q", q: clean(x.q, 200), ch, ok: ch.indexOf(a[0]) };
  }
  const raw = A(DATA()[cat])[+i]; if(!raw) return null;
  const L = raw[lg] || raw.fr || {};
  if(raw.t === "q"){ const a = A(L.a).slice(0, 4), ch = shuffle(a.slice()); return { key, cat, t: "q", q: L.q, ch, ok: ch.indexOf(a[0]) }; }
  if(raw.t === "vf") return { key, cat, t: "vf", q: L.q, ch: VF(), ok: raw.v ? 0 : 1, x: L.x || "" };
  if(raw.t === "n") return { key, cat, t: "n", q: L.q, n: +raw.n, u: L.u || "" };
  return null;
}
function deckFor(packs, types, kid){
  const keys = [];
  A(packs).forEach(p => {
    if(p === "perso"){ myQs().forEach((x, i) => { if(types.indexOf("q") >= 0) keys.push("perso:" + i); }); return; }
    A(DATA()[p]).forEach((x, i) => { if(types.indexOf(x.t) >= 0 && (!kid || SB.kidOk([x.fr && x.fr.q, x.fr && x.fr.a]))) keys.push(p + ":" + i); });
  });
  return SB.u.fresh(SEEN, keys);
}
// Points d'une question. ans : { id: { a (index ou nombre), t (ms) } } ; bets : { id: 1..3 }.
function score(Q, ans, bets, ids, tw, betsOn){
  const got = {}, x = tw === "or" ? 2 : 1, B = id => Math.max(1, Math.min(3, +bets[id] || 1));
  let good = [], bad = [];
  if(Q.t === "n"){
    const dist = id => Math.abs(+ans[id].a - Q.n), withA = ids.filter(id => ans[id] && ans[id].a != null);
    if(withA.length){
      const best = Math.min(...withA.map(dist)), worst = Math.max(...withA.map(dist));
      good = withA.filter(id => dist(id) === best);
      bad = ids.filter(id => !ans[id] || ans[id].a == null || (withA.length > 1 && dist(id) === worst && worst > best));
    } else bad = ids.slice();
    good.forEach(id => { got[id] = (B(id) + (dist(id) === 0 ? 2 : 1)) * x; });
    if(betsOn) bad.forEach(id => { got[id] = -B(id) * x; });
  } else {
    good = ids.filter(id => ans[id] && +ans[id].a === Q.ok).sort((a, b) => ans[a].t - ans[b].t);
    bad = ids.filter(id => good.indexOf(id) < 0);
    good.forEach((id, i) => { got[id] = (B(id) + (i === 0 && good.length > 1 ? 1 : 0)) * x; });
    if(betsOn) bad.forEach(id => { got[id] = -B(id) * x; });
  }
  return { got, good, bad };
}
const TW = [
  { id: "or", name: tr("Question en or", "Golden question"), desc: tr("Tous les points de cette question comptent double, en plus comme en moins.", "Every point on this question counts double, won or lost.") },
  { id: "eclair", name: tr("Chrono éclair", "Lightning clock"), desc: tr("10 secondes seulement pour répondre.", "Only 10 seconds to answer.") },
  { id: "tapis", name: tr("Tapis !", "All in!"), desc: tr("Tout le monde mise 3, pas le choix.", "Everyone bets 3, no choice.") }
];
const CSS = '<style data-qz>' +
  '.qz-cat{display:flex; gap:8px; flex-wrap:wrap; justify-content:center}.qz-cat span{font-size:12px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; padding:4px 10px; border-radius:99px; background:var(--soft); color:var(--muted)}' +
  '.qz-q{font-family:var(--f-disp); font-size:24px; line-height:1.2; text-align:center; margin:4px 0}.qz-q.l1{font-size:20px}.qz-q.l2{font-size:17px}' +
  '.qz-ch{display:grid; grid-template-columns:1fr 1fr; gap:8px}.qz-ch.vf button{min-height:84px; font-size:20px}.qz-ch button{min-height:64px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:15px; padding:6px 8px; line-height:1.15}' +
  '.qz-ch button[aria-pressed="true"]{border-color:var(--acc); background:var(--acc); color:var(--on-acc)}.qz-ch button:disabled{opacity:1}.qz-ch button.ok{border-color:#2fa860; background:#2fa860; color:#fff}.qz-ch button.ko{border-color:var(--bad); opacity:.6}' +
  '.qz-bets{display:grid; grid-template-columns:repeat(3,1fr); gap:8px}.qz-bets button{min-height:96px; border-radius:18px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-family:var(--f-disp); font-size:40px}.qz-bets button small{display:block; font-family:var(--f-body); font-size:12px; font-weight:700; color:var(--muted)}' +
  '.qz-bets button[aria-pressed="true"]{border-color:var(--acc); background:var(--acc); color:var(--on-acc)}.qz-bets button[aria-pressed="true"] small{color:var(--on-acc)}' +
  '.qz-num{display:flex; gap:8px}.qz-num input{flex:1; font-size:22px; text-align:center}.qz-t{font-family:var(--f-disp); font-size:40px; text-align:center; color:var(--acc); line-height:1}' +
  '.qz-ans{text-align:center}.qz-ans b{display:block; font-family:var(--f-disp); font-size:30px; line-height:1.1; color:var(--acc)}.qz-ans span{color:var(--muted); font-weight:600}' +
  '.qz-row{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:800}.qz-row b{flex:1}.qz-row .n{font-family:var(--f-disp); font-size:20px}.qz-row .d{font-size:13px; min-width:44px; text-align:right}.qz-row .d.p{color:#2fa860}.qz-row .d.m{color:var(--bad)}.qz-row small{color:var(--muted); font-weight:600}.qz-list{display:flex; flex-direction:column; gap:6px}</style>';
const qCls = q => (String(q).length > 140 ? " l2" : String(q).length > 80 ? " l1" : "");
const head = (n, rounds, Q, T) => CSS + '<span class="eyebrow">' + tr("Question ", "Question ") + n + " / " + rounds + "</span>" + SB.u.twistHTML(T) + '<div class="qz-cat"><span>' + esc(catName(Q.cat)) + "</span><span>" + esc(typeName(Q.t)) + "</span></div>";
const ansText = Q => (Q.t === "n" ? fmt(Q.n) + (Q.u ? " " + Q.u : "") : A(Q.ch)[Q.ok]);
function board(ids, pts, nameOf, got, extra){
  return '<div class="qz-list">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map((id, i) => {
    const d = got && got[id];
    return '<div class="qz-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + (extra && extra[id] != null ? " <small>" + esc(extra[id]) + "</small>" : "") + "</b>" + (d ? '<span class="d ' + (d > 0 ? "p" : "m") + '">' + (d > 0 ? "+" : "") + d + "</span>" : '<span class="d"></span>') + '<span class="n">' + (pts[id] || 0) + "</span></div>";
  }).join("") + "</div>";
}
// Éditeur « Nos questions » : une question, la bonne réponse, puis 1 à 3 mauvaises.
function editor(){
  SB.page(tr("Nos questions", "Our questions"), root => {
    const draw = () => {
      const L = myQs();
      root.innerHTML = '<div class="gs"><p class="howto">' + tr("Ajoutez vos propres questions (sur vous, votre bande, vos soirées…). Elles se jouent en QCM avec le paquet « Nos questions ».", "Add your own questions (about you, your crew, your parties…). They play as multiple choice with the “Our questions” pack.") + "</p>" +
        '<div class="gs-box" style="padding:12px 14px; gap:8px">' +
        '<label class="lbl">' + tr("La question", "The question") + '<input class="txt" id="qz-q" maxlength="200" placeholder="' + tr("Dans quelle ville Léa a-t-elle fait son Erasmus ?", "Where did Lea do her semester abroad?") + '"></label>' +
        '<label class="lbl">' + tr("La bonne réponse", "The right answer") + '<input class="txt" id="qz-a0" maxlength="60"></label>' +
        [1, 2, 3].map(i => '<label class="lbl">' + tr("Mauvaise réponse ", "Wrong answer ") + i + (i > 1 ? tr(" (facultatif)", " (optional)") : "") + '<input class="txt" id="qz-a' + i + '" maxlength="60"></label>').join("") +
        '<p class="err" data-err hidden></p><button class="btn acc" type="button" data-add>' + tr("Ajouter la question", "Add the question") + "</button></div>" +
        (L.length ? '<div class="field"><span class="eyebrow">' + tr(L.length + (L.length > 1 ? " questions" : " question"), L.length + (L.length > 1 ? " questions" : " question")) + '</span><div class="gs-box">' +
          L.map((x, i) => '<div class="gs-row"><span class="tx"><b>' + esc(x.q) + '</b><span class="sm">' + esc(x.a[0]) + " · " + esc(x.a.slice(1).join(" · ")) + '</span></span><button type="button" class="gs-b" data-del="' + i + '" aria-label="' + tr("Retirer", "Remove") + '">×</button></div>').join("") + "</div></div>" : "") + "</div>";
      root.querySelector("[data-add]").addEventListener("click", () => {
        const q = clean(root.querySelector("#qz-q").value, 200), a = [0, 1, 2, 3].map(i => clean(root.querySelector("#qz-a" + i).value, 60)).filter(Boolean), er = root.querySelector("[data-err]");
        if(!q || a.length < 2){ er.textContent = tr("Il faut une question, la bonne réponse et au moins une mauvaise.", "You need a question, the right answer and at least one wrong one."); er.hidden = false; return; }
        persist({ quizCustom: myQs().concat([{ q, a }]) }); buzz(10); draw();
      });
      root.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { const L2 = myQs(); L2.splice(+b.dataset.del, 1); persist({ quizCustom: L2 }); draw(); }));
    };
    draw();
  });
}
const QMS = (Q, tw) => (tw === "eclair" ? 10000 : Q.t === "n" ? 30000 : 20000);
const BET_MS = 12000;

SB.register({
  id: "quiz", name: tr("Quiz", "Quiz"), glyph: "?!", pitch: tr("Mise sur ta culture G", "Bet on what you know"), hot: false, ticks: true,
  accent: { light: "#2f7de1", dark: "#6fb0ff" },
  tag: tr("QCM, estimations et vrai ou faux. Avant chaque question, mise 1, 2 ou 3 points sur ta confiance : gagné, tu les prends, raté, tu les perds.", "Multiple choice, estimates and true or false. Before each question, bet 1, 2 or 3 points: right, you win them; wrong, you lose them."),
  min: 2, max: 20,
  gages: [
    { ev: "faux", label: tr("Mauvaise réponse (× la mise)", "Wrong answer (× the bet)"), kind: "boit", n: 1 },
    { ev: "rapide", label: tr("Le plus rapide ou le plus proche", "Fastest or closest"), kind: "distribue", n: 1 },
    { ev: "tous", label: tr("Tout le monde se trompe", "Everyone's wrong"), kind: "tous", n: 1 }
  ],
  rules: tr([
    "Avant chaque question, on voit le thème et le type. Chacun mise 1, 2 ou 3 points selon sa confiance.",
    "QCM et vrai ou faux : bonne réponse = + la mise, mauvaise = − la mise. Le plus rapide des bonnes réponses gagne 1 point de plus.",
    "Estimation : tape un nombre. Le plus proche gagne la mise + 1 (+ 2 s'il tombe pile). Le plus loin perd sa mise.",
    "Coups de théâtre : question en or (tout compte double), chrono éclair (10 secondes), tapis (tout le monde mise 3).",
    "Thèmes : culture G, pop culture, histoire, géo, sport, bouffe, insolite, soirée, culture coquine (18+), enfants, et vos propres questions."
  ], [
    "Before each question you see its theme and type. Everyone bets 1, 2 or 3 points depending on how sure they feel.",
    "Multiple choice and true or false: right = + your bet, wrong = − your bet. The fastest right answer gets 1 extra point.",
    "Estimate: type a number. The closest wins their bet + 1 (+ 2 if spot on). The farthest loses their bet.",
    "Twists: golden question (everything counts double), lightning clock (10 seconds), all in (everyone bets 3).",
    "Themes: general knowledge, pop culture, history, geography, sport, food, weird facts, party, naughty trivia (18+), kids, and your own questions."
  ]),
  options: [
    { id: "rounds", label: tr("Questions", "Questions"), type: "seg", def: 15, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "types", label: tr("Types de questions", "Question types"), type: "multi", def: ["q", "n", "vf"], values: TYPES.map(t => ({ v: t[0], label: t[1], desc: { q: tr("4 réponses, une seule bonne", "4 answers, one right"), n: tr("Le plus proche gagne", "Closest wins"), vf: tr("Des faits surprenants", "Surprising facts") }[t[0]] })) },
    { id: "packs", label: tr("Thèmes", "Themes"), type: "multi", def: ["culture", "pop", "geo", "insolite"], values: () => PACKS().map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.count })) },
    { id: "edit", type: "button", label: tr("Écrire nos questions", "Write our questions"), onClick: () => editor() },
    { id: "bets", label: tr("Mises", "Bets"), type: "toggle", text: tr("Mises", "Bets"), desc: tr("Miser 1, 2 ou 3 points avant chaque question", "Bet 1, 2 or 3 points before each question"), def: true },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Question en or, chrono éclair, tapis", "Golden question, lightning clock, all in"), def: true }
  ],
  start(ctx, o){
    const types = A(o.types).length ? A(o.types) : ["q", "n", "vf"];
    const deck = deckFor(o.packs, types, SB.kid());
    if(deck.length < 3) throw new Error(tr("Pas assez de questions : choisis plus de thèmes ou de types.", "Not enough questions: pick more themes or types."));
    ctx.setPriv({ deck });
    return { phase: "next", rounds: Math.min(o.rounds || 15, deck.length), n: 0, bets: o.bets !== false, pts: {}, tw: "", Q: null, startAt: 0, res: null };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "next"){ nextQ(ctx); return; }
    if(s.phase === "bet"){
      const done = live.filter(id => { const i = ctx.input(id); return i && i.bet; });
      if(done.length >= live.length || ctx.now() >= s.startAt + BET_MS){
        const bets = {}; live.forEach(id => { const i = ctx.input(id); bets[id] = s.tw === "tapis" ? 3 : i && i.bet ? Math.max(1, Math.min(3, +i.bet)) : 1; });
        ctx.set({ phase: "q", bt: bets, startAt: ctx.now(), k: ctx.rid() });
      }
      return;
    }
    if(s.phase === "q"){
      const ans = {}; live.forEach(id => { const i = ctx.input(id); if(i && i.a != null) ans[id] = { a: +i.a, t: Math.max(0, +i.t || 0) }; });
      if(Object.keys(ans).length < live.length && ctx.now() < s.startAt + QMS(s.Q, s.tw)) return;
      const pv = ctx.priv(), Q = Object.assign({}, s.Q, pv.cur || {}), R = score(Q, ans, s.bt || {}, live, s.tw, s.bets), pts = Object.assign({}, s.pts);
      Object.keys(R.got).forEach(id => { pts[id] = (pts[id] || 0) + R.got[id]; });
      const gl = [];
      if(!R.good.length && live.length > 1) gl.push({ id: live[0], ev: "tous" });
      else { R.bad.forEach(id => gl.push({ id, ev: "faux", x: (s.bt || {})[id] || 1 })); if(R.good.length) gl.push({ id: R.good[0], ev: "rapide" }); }
      ctx.gage(gl, s.k);
      ctx.set({ phase: "res", pts, res: { ok: Q.ok, n: Q.n, x: Q.x || "", ans, got: R.got } });
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), Q = s.Q || {}, inp = ctx.mine() || {}, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "next" || !s.Q){ screen(root, "nx" + s.n, CSS + '<p class="wait" style="text-align:center">' + tr("Question suivante…", "Next question…") + "</p>"); return; }
    const H = head(s.n, s.rounds, Q, T);
    if(s.phase === "bet"){
      const my = s.tw === "tapis" ? 3 : +inp.bet || 0, sec = Math.max(0, Math.ceil((s.startAt + BET_MS - ctx.now()) / 1000));
      screen(root, "bt" + s.k + my + ctx.playing, H + '<p class="howto" style="text-align:center; margin:0">' + (s.tw === "tapis" ? tr("Tapis : tout le monde mise 3 !", "All in: everyone bets 3!") : tr("Combien tu mises sur cette question ?", "How much do you bet on this question?")) + "</p>" +
        '<div class="qz-bets">' + [1, 2, 3].map(v => '<button type="button" data-bet="' + v + '" aria-pressed="' + (my === v) + '"' + (!ctx.playing || s.tw === "tapis" ? " disabled" : "") + ">" + v + "<small>" + [tr("prudent", "careful"), tr("confiant", "confident"), tr("sûr de moi", "sure")][v - 1] + "</small></button>").join("") + "</div>" +
        '<div class="qz-t" data-t>' + sec + "</div>" + SB.u.dock('<p class="wait" data-w></p>'), r => {
        r.querySelectorAll("[data-bet]").forEach(b => b.addEventListener("click", () => { buzz(10); ctx.send({ bet: +b.dataset.bet }); }));
      });
      txt(root, "[data-t]", String(sec));
      txt(root, "[data-w]", live.filter(id => { const i = ctx.input(id); return i && i.bet; }).length + " / " + live.length + tr(" ont misé", " have bet"));
      return;
    }
    if(s.phase === "q"){
      const sec = Math.max(0, Math.ceil((s.startAt + QMS(Q, s.tw) - ctx.now()) / 1000)), answered = inp.a != null, mybet = (s.bt || {})[me];
      const body = Q.t === "n"
        ? (answered ? '<div class="qz-ans"><span>' + tr("Ta réponse", "Your answer") + "</span><b>" + esc(fmt(+inp.a)) + (Q.u ? " " + esc(Q.u) : "") + "</b></div>"
          : '<div class="qz-num"><input class="txt" id="qz-n" inputmode="decimal" autocomplete="off" placeholder="' + (Q.u ? esc(Q.u) : tr("ton nombre", "your number")) + '"' + (ctx.playing ? "" : " disabled") + '><button class="btn acc" type="button" data-ok style="width:auto; padding:0 18px"' + (ctx.playing ? "" : " disabled") + ">OK</button></div>")
        : '<div class="qz-ch' + (Q.t === "vf" ? " vf" : "") + '">' + A(Q.ch).map((c, i) => '<button type="button" data-a="' + i + '" aria-pressed="' + (answered && +inp.a === i) + '"' + (answered || !ctx.playing ? " disabled" : "") + ">" + esc(c) + "</button>").join("") + "</div>";
      screen(root, "q" + s.k + (answered ? "a" : "") + ctx.playing, H + '<p class="qz-q' + qCls(Q.q) + '">' + esc(Q.q) + "</p>" + body +
        '<div class="qz-t" data-t>' + sec + "</div>" + SB.u.dock('<p class="wait" data-w></p>' + (mybet ? '<p class="sm" style="text-align:center; margin:0">' + tr("Ta mise : ", "Your bet: ") + mybet + "</p>" : "")), r => {
        r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { buzz(10); ctx.send({ a: +b.dataset.a, t: ctx.now() - s.startAt }); }));
        const ok = r.querySelector("[data-ok]"), ni = r.querySelector("#qz-n");
        const sendN = () => { const v = numOf(ni.value); if(v == null){ SB.u.toast(tr("Tape un nombre", "Type a number")); return; } buzz(10); ctx.send({ a: v, t: ctx.now() - s.startAt }); };
        if(ok) ok.addEventListener("click", sendN);
        if(ni) ni.addEventListener("keydown", e => { if(e.key === "Enter") sendN(); });
      });
      txt(root, "[data-t]", String(sec));
      txt(root, "[data-w]", live.filter(id => { const i = ctx.input(id); return i && i.a != null; }).length + " / " + live.length + tr(" réponses", " answers"));
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {}, last = s.n >= s.rounds, Qr = Object.assign({}, Q, { ok: R.ok, n: R.n });
      const extra = {}; if(Q.t === "n") Object.keys(R.ans || {}).forEach(id => { extra[id] = fmt(R.ans[id].a); });
      const ch = Q.t !== "n" ? '<div class="qz-ch' + (Q.t === "vf" ? " vf" : "") + '">' + A(Q.ch).map((c, i) => '<button type="button" disabled class="' + (i === R.ok ? "ok" : inp.a != null && +inp.a === i ? "ko" : "") + '">' + esc(c) + "</button>").join("") + "</div>" : "";
      screen(root, "rs" + s.k + ctx.isHost, H + '<p class="qz-q' + qCls(Q.q) + '" style="font-size:17px">' + esc(Q.q) + "</p>" +
        '<div class="qz-ans"><span>' + tr("Réponse", "Answer") + "</span><b>" + esc(ansText(Qr)) + "</b>" + (R.x ? "<span>" + esc(R.x) + "</span>" : "") + "</div>" + ch +
        board(ctx.ids, s.pts, ctx.name, R.got, Q.t === "n" ? extra : null) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Question suivante", "Next question")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase !== "res") return; if(c.s.n >= c.s.rounds) c.set({ phase: "end" }); else nextQ(c); }));
      });
      return;
    }
    if(s.phase === "end"){
      const p = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Cerveau de la soirée", "Brain of the night") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + board(ctx.ids, p, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.ids.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0;
          c.end({ title: tr("Quiz : ", "Quiz: ") + c.name(o2[0]), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0) + " pts"), win: mx > 0 ? o2.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : on lit la question, chacun répond à voix haute, on note qui a juste ---------- */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.qzPacks).length ? A(st.qzPacks).slice() : ["culture", "pop", "geo", "insolite"], types = A(st.qzTypes).length ? A(st.qzTypes).slice() : ["q", "n", "vf"], rounds = [10, 15, 20].indexOf(st.qzRounds) >= 0 ? st.qzRounds : 15, twOn = st.qzTw !== false;
      let deck = [], n = 0, Q = null, tw = null, pts = {}, gno = 0, tok = Math.random().toString(36).slice(2, 7), picked = [];
      function setup(){
        const packs = PACKS().filter(SB.packOk);
        sel = SB.okPacks(sel, PACKS());
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Une personne lit la question et les réponses à voix haute, chacun répond, puis on touche les prénoms de ceux qui avaient juste.", "One person reads the question and answers out loud, everyone answers, then tap the names of those who got it right.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Questions", "Questions") + '</span><div class="seg">' + [10, 15, 20].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (rounds === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Types de questions", "Question types") + '</span><div class="packs">' + TYPES.map(t => '<button type="button" class="pack" data-ty="' + t[0] + '" aria-pressed="' + (types.indexOf(t[0]) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(t[1]) + "</span></span></button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Thèmes", "Themes") + '</span><div class="packs">' + packs.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0 && p.count > 0) + '"' + (p.count ? "" : " disabled") + '><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.count + "</span></button>").join("") + "</div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Écrire nos questions", "Write our questions") + "</button></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Question en or, chrono éclair", "Golden question, lightning clock") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button>"), r => {
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ qzRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-ty]").forEach(b => b.addEventListener("click", () => { const i = types.indexOf(b.dataset.ty); if(i >= 0) types.splice(i, 1); else types.push(b.dataset.ty); persist({ qzTypes: types }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ qzPacks: sel }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ qzTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => SB.page && editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            deck = deckFor(sel, types.length ? types : ["q", "n", "vf"], SB.kid());
            if(deck.length < 3){ SB.u.toast(tr("Pas assez de questions : choisis plus de thèmes ou de types", "Not enough questions: pick more themes or types")); return; }
            n = 0; pts = {}; tw = null; gno++; next();
          });
        });
      }
      const H = () => head(n, Math.min(rounds, n + deck.length), Q, tw && tw.id !== "tapis" ? tw : null);
      function next(){
        if(n >= rounds || !deck.length){ end(); return; }
        let key; do { key = deck.pop(); Q = prep(key); } while(!Q && deck.length);
        if(!Q){ end(); return; }
        SB.u.saw(SEEN, key); n++; picked = [];
        tw = twOn && n > 1 ? SB.u.twist(TW.filter(t => t.id !== "tapis"), { last: tw ? tw.id : "", rate: .25 }) : null;
        const body = Q.t === "n" ? '<p class="howto" style="text-align:center">' + tr("Chacun annonce un nombre à voix haute.", "Everyone says a number out loud.") + (Q.u ? " (" + esc(Q.u) + ")" : "") + "</p>" : '<div class="qz-ch' + (Q.t === "vf" ? " vf" : "") + '">' + A(Q.ch).map(c => "<button type=\"button\" disabled>" + esc(c) + "</button>").join("") + "</div>";
        screen(root, "lq" + gno + ":" + n, H() + '<p class="qz-q' + qCls(Q.q) + '">' + esc(Q.q) + "</p>" + body +
          SB.u.dock('<button class="btn acc" type="button" data-rv>' + tr("Voir la réponse", "Show the answer") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelector("[data-rv]").addEventListener("click", reveal);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      function reveal(){
        const ch = Q.t !== "n" ? '<div class="qz-ch' + (Q.t === "vf" ? " vf" : "") + '">' + A(Q.ch).map((c, i) => '<button type="button" disabled class="' + (i === Q.ok ? "ok" : "") + '">' + esc(c) + "</button>").join("") + "</div>" : "";
        screen(root, "lr" + gno + ":" + n + ":" + picked.join(","), H() + '<p class="qz-q' + qCls(Q.q) + '" style="font-size:17px">' + esc(Q.q) + "</p>" + '<div class="qz-ans"><span>' + tr("Réponse", "Answer") + "</span><b>" + esc(ansText(Q)) + "</b>" + (Q.x ? "<span>" + esc(Q.x) + "</span>" : "") + "</div>" + ch +
          '<p class="howto" style="text-align:center; margin:0">' + (Q.t === "n" ? tr("Qui était le plus proche ?", "Who was closest?") : tr("Qui avait juste ?", "Who got it right?")) + '</p><div class="qz-ch">' + names.map(x => '<button type="button" data-who="' + esc(x) + '" aria-pressed="' + (picked.indexOf(x) >= 0) + '">' + esc(x) + "</button>").join("") + "</div>" +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (picked.length ? tr("Valider", "Confirm") : tr("Personne", "Nobody")) + "</button>"), r => {
          r.querySelectorAll("[data-who]").forEach(b => b.addEventListener("click", () => {
            const x = b.dataset.who, i = picked.indexOf(x); buzz(6);
            if(Q.t === "n") picked = i >= 0 ? [] : [x]; else if(i >= 0) picked.splice(i, 1); else picked.push(x);
            reveal();
          }));
          r.querySelector("[data-n]").addEventListener("click", score1);
        });
      }
      function score1(){
        const x = tw && tw.id === "or" ? 2 : 1, got = {}, key = "qz" + tok + "-" + gno + ":" + n;
        picked.forEach(p => { got[p] = (Q.t === "n" ? 2 : 1) * x; pts[p] = (pts[p] || 0) + got[p]; });
        if(api.gage){
          if(!picked.length) api.gage([{ id: names[0], ev: "tous" }], key);
          else api.gage(names.filter(p => picked.indexOf(p) < 0).map(p => ({ id: p, ev: "faux" })).concat(Q.t === "n" || picked.length === 1 ? [{ id: picked[0], ev: "rapide" }] : []), key);
        }
        screen(root, "ls" + gno + ":" + n, CSS + '<span class="eyebrow">' + tr("Question ", "Question ") + n + " / " + rounds + "</span>" + board(names, pts, z => z, got) +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (n >= rounds || !deck.length ? tr("Voir le classement", "See the standings") : tr("Question suivante", "Next question")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", next);
        });
      }
      function end(){
        const order = names.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[order[0]] || 0;
        if(api.win) api.win(mx ? order.filter(x => (pts[x] || 0) === mx) : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Cerveau de la soirée", "Brain of the night") + '</span><div class="who">' + esc(order[0] || "") + "</div>" + board(names, pts, z => z) +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// Question suivante (chez l'hôte) : la bonne réponse reste dans priv jusqu'au résultat.
function nextQ(c){
  const pv = c.priv(), deck = A(pv.deck).slice(), s = c.s;
  if(s.n >= s.rounds || !deck.length){ c.set({ phase: "end" }); return; }
  let key, Q; do { key = deck.pop(); Q = prep(key); } while(!Q && deck.length);
  if(!Q){ c.set({ phase: "end" }); return; }
  SB.u.saw(SEEN, key);
  const t = s.n >= 1 && c.opts.twists !== false ? SB.u.twist(TW.filter(x => x.id !== "tapis" || s.bets), { last: s.tw, rate: .3 }) : null;
  const pub = { cat: Q.cat, t: Q.t, q: Q.q, ch: Q.ch || null, u: Q.u || "" };
  c.setPriv({ deck, cur: { ok: Q.ok, n: Q.n, x: Q.x || "" } });
  c.set({ phase: s.bets ? "bet" : "q", n: s.n + 1, tw: t ? t.id : "", Q: pub, bt: {}, res: null, startAt: c.now(), k: c.rid() });
}
})();
