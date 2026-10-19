/* Roulette des menteurs — on pose ses cartes face cachée en jurant que ce sont des cartes de la table.
   Quelqu'un crie « Menteur ! » : celui qui a tort appuie sur la détente. Le dernier en vie gagne. */
(function(){
"use strict";
const { esc, A, shuffle, screen, store, persist, dock, buzz, armTap } = SB.u;

/* Cartes : "K" roi, "Q" dame, "A" as, "J" joker (vaut n'importe quelle carte). */
const KIND = { K: "Roi", Q: "Dame", A: "As", J: "Joker" };
const PLUR = { K: "Rois", Q: "Dames", A: "As", J: "Jokers" };
const SYM = { K: "♚", Q: "♛", A: "A", J: "★" };
const TABLES = ["K", "Q", "A"];
function many(n, t){ return n + " " + (n > 1 ? PLUR[t] : KIND[t]); }
function claim(E, n){ return E.t2 ? n + " carte" + (n > 1 ? "s" : "") + " de la table" : many(n, E.table); }

/* ---------- Moteur commun ----------
   E = { order, alive, hands, table, t2, turn, dir, last, phase, pulls, loser, truth, reveal, caller, boom, winner, round, start, log,
         tw (coups de théâtre), ev (événement de la manche), evl, evn, maxc, blind, more (coups à tirer en plus), st (stats), aw (trophées) } */
const rnd = n => Math.floor(Math.random() * n);
const good = (E, c) => c === "J" || c === E.table || (!!E.t2 && c === E.t2);
function stat(E, id, k, n){ const S = E.st = E.st || {}; const o = S[id] = Object.assign({}, S[id]); o[k] = (o[k] || 0) + (n == null ? 1 : n); S[id] = o; }
/* Coups de théâtre : une règle spéciale pour toute la manche (jamais à la première, jamais deux fois de suite). */
const EVENTS = [
  { id: "joker", name: "Jokers en folie", desc: "Deux jokers de plus dans le paquet : dire la vérité devient plus facile… et démasquer un menteur, plus difficile." },
  { id: "double", name: "Double table", desc: "Cette manche, deux valeurs de cartes sont valables." },
  { id: "sens", name: "Sens inversé", desc: "On joue dans l'autre sens : tu ne passes plus après le même joueur.", ok: o => o.E.order.filter(id => o.E.alive[id]).length > 2 },
  { id: "petit", name: "Mains légères", desc: "Seulement 3 cartes chacun : la manche va vite." },
  { id: "une", name: "Une à la fois", desc: "Une seule carte par tour, pas plus." },
  { id: "aveugle", name: "À l'aveugle", desc: "Tes cartes restent face cachée : tu ne sais pas ce que tu poses." },
  { id: "nerveux", name: "Barillet nerveux", desc: "Celui qui perd la manche tire deux fois de suite." },
  { id: "recharge", name: "Barillet rechargé", desc: "Les compteurs repartent à zéro et chaque barillet est rechargé au hasard.", ok: o => o.E.order.some(id => o.E.alive[id] && (o.E.pulls[id] || 0) >= 2) }
];
const pickTwist = (list, o) => (SB.u.twist ? SB.u.twist(list, o) : null);
const evOf = E => EVENTS.find(t => t.id === E.ev) || null;
function deal(E, forced){
  const ids = E.order.filter(id => E.alive[id]), per = Math.max(6, 2 * ids.length - 2);
  const t = forced ? EVENTS.find(x => x.id === forced) : E.tw && E.round > 1 ? pickTwist(EVENTS, { rate: 0.35, last: E.evl, E }) : null;
  E.ev = t ? t.id : ""; if(t){ E.evl = t.id; E.evn = (E.evn || 0) + 1; }
  let deck = [];
  TABLES.forEach(x => { for(let i = 0; i < per; i++) deck.push(x); });
  deck.push("J", "J"); if(E.ev === "joker") deck.push("J", "J");
  deck = shuffle(deck);
  const hs = E.ev === "petit" ? 3 : 5;
  E.hands = {};
  E.order.forEach(id => { E.hands[id] = E.alive[id] ? deck.splice(0, hs) : []; });
  E.table = TABLES[rnd(3)];
  E.t2 = E.ev === "double" ? TABLES.filter(x => x !== E.table)[rnd(2)] : "";
  E.dir = E.ev === "sens" ? -1 : 1; E.maxc = E.ev === "une" ? 1 : 3; E.blind = E.ev === "aveugle"; E.more = 0;
  if(E.ev === "recharge") E.order.forEach(id => { E.pulls[id] = 0; });
  E.last = null; E.phase = "play"; E.loser = ""; E.truth = false; E.reveal = []; E.caller = ""; E.boom = false;
  E.turn = E.alive[E.start] ? E.start : nextAlive(E, E.start);
  E.log = "Manche " + E.round + " : table des " + tableName(E) + ".";
}
function tableName(E){ return PLUR[E.table] + (E.t2 ? " et des " + PLUR[E.t2] : ""); }
function nextAlive(E, from){
  const n = E.order.length, i = E.order.indexOf(from), d = E.dir || 1;
  for(let k = 1; k <= n; k++){ const id = E.order[(((i + d * k) % n) + n) % n]; if(E.alive[id]) return id; }
  return from;
}
function nextTurn(E, from){
  const n = E.order.length, i = E.order.indexOf(from), d = E.dir || 1;
  for(let k = 1; k < n; k++){ const id = E.order[(((i + d * k) % n) + n) % n]; if(E.alive[id] && E.hands[id].length) return id; }
  return nextAlive(E, from); // plus personne n'a de cartes : le suivant doit crier « Menteur ! »
}
function canCall(E, id){ return E.phase === "play" && E.turn === id && !!E.last && E.last.by !== id; }
function mustCall(E, id){ return canCall(E, id) && !E.hands[id].length; }
function doPlay(E, id, idx, nameOf){
  if(E.phase !== "play" || E.turn !== id) return false;
  const h = E.hands[id], set = Array.from(new Set(A(idx).map(Number))).filter(i => i >= 0 && i < h.length);
  if(!set.length || set.length > (E.maxc || 3)) return false;
  const cards = set.map(i => h[i]);
  E.hands[id] = h.filter((_, i) => set.indexOf(i) < 0);
  E.last = { by: id, cards, n: cards.length };
  E.pc = (E.pc || 0) + 1; // pour l'animation
  stat(E, id, "pl", cards.length); const lies = cards.filter(c => !good(E, c)).length; if(lies) stat(E, id, "bl", lies);
  E.log = nameOf(id) + " pose " + claim(E, cards.length) + (E.hands[id].length ? "" : " · plus de cartes !");
  E.turn = nextTurn(E, id);
  return true;
}
function doCall(E, id, nameOf){
  if(!canCall(E, id)) return false;
  const L = E.last, truth = L.cards.every(c => good(E, c));
  E.phase = "reveal"; E.reveal = L.cards; E.truth = truth; E.caller = id;
  E.loser = truth ? id : L.by; E.more = E.ev === "nerveux" ? 1 : 0;
  if(!truth){ stat(E, id, "gc"); stat(E, L.by, "cg"); }
  E.log = nameOf(id) + " crie « Menteur ! » à " + nameOf(L.by) + ". " + (truth ? "Raté : c'était la vérité." : "Bien vu : c'était du bluff !");
  return true;
}
function canShoot(E, id){ return E.loser === id && (E.phase === "reveal" || (E.phase === "shot" && E.more > 0 && !E.boom)); }
function doShoot(E, id, bullets, nameOf){
  if(!canShoot(E, id)) return false;
  if(E.phase === "shot") E.more--;
  E.pulls[id] = (E.pulls[id] || 0) + 1;
  E.boom = E.pulls[id] >= bullets[id];
  if(E.boom){ E.alive[id] = false; E.more = 0; } else stat(E, id, "cl");
  E.phase = "shot";
  const left = E.order.filter(x => E.alive[x]);
  E.winner = left.length === 1 ? left[0] : "";
  E.log = E.boom ? "PAN ! " + nameOf(id) + " est hors jeu." : "Clic… " + nameOf(id) + " survit (" + E.pulls[id] + "/6)." + (E.more > 0 ? " Barillet nerveux : encore un coup !" : "");
  return true;
}
function nextRound(E){
  if(E.phase !== "shot" || (E.more > 0 && !E.boom)) return false;
  if(E.winner){ E.phase = "end"; E.aw = awards(E); return true; }
  E.round++; E.start = E.alive[E.loser] ? E.loser : nextAlive(E, E.loser);
  deal(E);
  return true;
}
function newBullets(ids){ const b = {}; ids.forEach(id => { b[id] = 1 + rnd(6); }); return b; }

/* ---------- Trophées de fin de partie ---------- */
const AWARDS = {
  bl: { t: ["Menteur professionnel", "Visage de marbre", "Bluffeur en chef"], d: v => v + " fausse" + (v > 1 ? "s" : "") + " carte" + (v > 1 ? "s" : "") + " posée" + (v > 1 ? "s" : ""), min: 2 },
  cg: { t: ["Nez de Pinocchio", "Pris la main dans le sac", "Mauvais menteur"], d: v => "démasqué " + v + " fois", min: 1 },
  gc: { t: ["Détecteur de mensonges", "Flair infaillible", "Inspecteur du bar"], d: v => v + " menteur" + (v > 1 ? "s" : "") + " démasqué" + (v > 1 ? "s" : ""), min: 1 },
  cl: { t: ["Survivant chanceux", "Chat à neuf vies", "Trompe-la-mort"], d: v => v + " clic" + (v > 1 ? "s" : "") + " à vide", min: 2 },
  pl: { t: ["Mitraillette à cartes", "Poseur compulsif", "Croupier du bar"], d: v => v + " cartes posées", min: 4 }
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

/* ---------- Robots ---------- */
function botTurn(E, id, nameOf){
  const h = E.hands[id], max = E.maxc || 3;
  if(canCall(E, id)){
    const n = E.last.n, mine = E.blind ? 0 : h.filter(c => good(E, c)).length;
    const emptied = !E.hands[E.last.by].length;
    let p = E.blind ? 0.2 + 0.15 * n : 0.04 + 0.1 * n + (mine >= 3 ? 0.25 : mine >= 2 ? 0.12 : 0) + (emptied ? 0.15 : 0);
    if(E.t2 || E.ev === "joker") p *= 0.7;
    if(!h.length || Math.random() < Math.min(p, 0.85)){ doCall(E, id, nameOf); return; }
  }
  let pick;
  if(E.blind) pick = shuffle(h.map((c, i) => i)).slice(0, Math.min(max, Math.random() < 0.7 ? 1 : 2));
  else {
    const gd = h.map((c, i) => i).filter(i => good(E, h[i]));
    const bad = h.map((c, i) => i).filter(i => gd.indexOf(i) < 0);
    if(gd.length && (!bad.length || Math.random() > 0.25)){
      pick = shuffle(gd).slice(0, 1 + rnd(Math.min(2, gd.length)));
      if(bad.length && pick.length < 3 && Math.random() < 0.2) pick.push(bad[0]);
    } else pick = shuffle(bad).slice(0, Math.random() < 0.7 ? 1 : Math.min(2, bad.length));
    pick = pick.slice(0, max);
  }
  doPlay(E, id, pick, nameOf);
}

/* ---------- Affichage ---------- */
const CSS = '<style data-lb>' +
  '.lb-c{width:54px; height:78px; flex:none; border-radius:10px; background:#f6ecd9; color:#2b1d14; border:2.5px solid #3a281b; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0; font-family:var(--f-hand); font-weight:700; font-size:34px; line-height:1; padding:0; box-shadow:0 6px 12px -8px rgba(0,0,0,.6); transition:transform .12s}' +
  '.lb-c small{font-family:inherit; font-size:12px; font-weight:800}.lb-c.J{background:#2b1d14; color:#f2c14e}.lb-c.tb{outline:3px solid var(--acc); outline-offset:1px}' +
  '.lb-c[aria-pressed="true"]{transform:translateY(-12px); box-shadow:0 0 0 3px var(--acc), 0 10px 18px -8px rgba(0,0,0,.6)}' +
  '.lb-landing .lb-row .lb-back{visibility:hidden}.lb-back{width:44px; height:64px; border-radius:8px; border:2px solid #f6ecd9; background:repeating-linear-gradient(45deg,#6d1f12 0 6px,#8b2e16 6px 12px); flex:none}' +
  '.lb-table{display:flex; flex-wrap:wrap; align-items:center; column-gap:12px; row-gap:2px; background:#2b1d14; color:#f6ecd9; border-radius:18px; padding:14px 16px}.lb-table .t{font-family:var(--f-hand); font-size:40px; line-height:1; color:#f2c14e}' +
  '.lb-hand{display:flex; flex-wrap:wrap; gap:8px; justify-content:center; padding-top:12px}.lb-row{display:flex; gap:6px; justify-content:center; flex-wrap:wrap}' +
  '.lb-pl{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.lb-pl li{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:700}' +
  '.lb-pl li.on{border-color:var(--acc); box-shadow:0 0 0 2px var(--acc)}.lb-pl li.dead{opacity:.45; text-decoration:line-through}.lb-pl .nm{flex:1; min-width:0; overflow-wrap:anywhere}' +
  '.lb-pl .ct{font-size:13px; color:var(--muted)}.lb-cyl{display:inline-flex; gap:3px}.lb-cyl i{width:9px; height:9px; border-radius:50%; border:1.5px solid var(--muted)}.lb-cyl i.x{background:var(--bad); border-color:var(--bad)}' +
  '.lb-log{text-align:center; font-weight:700}.lb-big{font-family:var(--f-hand); font-size:64px; line-height:1; text-align:center; color:var(--acc)}.lb-big.boom{color:var(--bad)}' +
  '.lb-gun{display:flex; justify-content:center; gap:8px}.lb-gun i{width:26px; height:26px; border-radius:50%; border:3px solid var(--ink)}.lb-gun i.x{background:var(--ink)}.lb-gun i.b{background:var(--bad); border-color:var(--bad)}' +
  '.lb-c.hid{background:repeating-linear-gradient(45deg,#6d1f12 0 6px,#8b2e16 6px 12px); color:#f6ecd9; border-color:#f6ecd9}.lb-ev .twist{margin:0}' +
  '.lb-aw{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.lb-aw li{padding:9px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); display:flex; flex-direction:column; gap:1px}.lb-aw b{font-family:var(--f-disp); font-size:16px}.lb-aw span{font-size:13px; color:var(--muted)}</style>';
function cardHTML(c, attrs, extra){ return '<button type="button" class="lb-c ' + c + (extra ? " " + extra : "") + '"' + (attrs || "") + ' aria-label="' + KIND[c] + '">' + SYM[c] + "<small>" + KIND[c] + "</small></button>"; }
function hidHTML(attrs){ return '<button type="button" class="lb-c hid"' + (attrs || "") + ' aria-label="Carte cachée">?<small>Cachée</small></button>'; }
function evHTML(E){ const t = evOf(E); return t ? '<div class="lb-ev">' + SB.u.twistHTML(t) + "</div>" : ""; }
function cylHTML(n){ let h = '<span class="lb-cyl" aria-label="' + n + ' sur 6">'; for(let i = 0; i < 6; i++) h += '<i class="' + (i < n ? "x" : "") + '"></i>'; return h + "</span>"; }
function playersHTML(E, nameOf, me){
  return '<ul class="lb-pl">' + E.order.map(id => '<li data-p="' + esc(id) + '" class="' + (!E.alive[id] ? "dead" : E.phase === "play" && E.turn === id ? "on" : "") + '"><span class="nm">' + esc(nameOf(id)) + (id === me ? ' <span class="pill me">Toi</span>' : "") + "</span>" +
    (E.alive[id] ? '<span class="ct">' + (E.hands[id] || []).length + " carte" + ((E.hands[id] || []).length > 1 ? "s" : "") + "</span>" : '<span class="ct">hors jeu</span>') + cylHTML(E.pulls[id] || 0) + "</li>").join("") + "</ul>";
}
function tableHTML(E){ return '<div class="lb-table"><span style="white-space:nowrap">Table des</span><span class="t">' + PLUR[E.table] + (E.t2 ? " + " + PLUR[E.t2] : "") + "</span><span class=\"sm\" style=\"flex-basis:100%; color:#c9b89a\">Les jokers valent n'importe quelle carte" + (E.maxc === 1 ? " · une carte par tour" : "") + "</span></div>"; }
function lastHTML(E, nameOf){
  if(!E.last) return '<p class="lb-log">' + esc(E.log) + "</p>";
  return '<p class="lb-log">' + esc(nameOf(E.last.by)) + " jure avoir posé " + esc(claim(E, E.last.n)) + '</p><div class="lb-row">' + E.last.cards.map(() => '<span class="lb-back"></span>').join("") + "</div>";
}
/* Écran de la phase de jeu pour `me` ; sel = cartes sélectionnées */
function playHTML(E, me, nameOf, sel){
  const my = E.turn === me && E.phase === "play", h = E.hands[me] || [];
  let html = CSS + evHTML(E) + tableHTML(E) + lastHTML(E, nameOf) + '<div class="who" style="text-align:center; font-size:36px">' + (my ? "À toi !" : "Au tour de " + esc(nameOf(E.turn))) + "</div>";
  if(me && E.alive[me]){
    const mx = E.maxc || 3;
    html += '<span class="eyebrow">Ta main' + (E.blind ? " · face cachée" : "") + (my && h.length ? (mx === 1 ? " · choisis 1 carte" : " · choisis 1 à " + mx + " cartes") : "") + '</span><div class="lb-hand">' +
      (h.length ? h.map((c, i) => { const at = ' data-c="' + i + '" aria-pressed="' + (sel.indexOf(i) >= 0) + '"' + (my ? "" : " disabled"); return E.blind ? hidHTML(at) : cardHTML(c, at, good(E, c) ? "tb" : ""); }).join("") : '<p class="sm">Plus de cartes : attends la fin de la manche.</p>') + "</div>";
  } else if(me) html += '<p class="howto">Tu es hors jeu. Regarde les autres trembler.</p>';
  html += '<span class="eyebrow">Joueurs · barillet</span>' + playersHTML(E, nameOf, me);
  return html;
}
function playDock(E, me, sel){
  if(E.turn !== me || E.phase !== "play") return "";
  const b = [];
  if(canCall(E, me)) b.push('<button class="btn bad" type="button" data-call>Menteur !</button>');
  if((E.hands[me] || []).length) b.push('<button class="btn acc" type="button" data-play' + (sel.length ? "" : " disabled") + ">" + (sel.length ? "Poser " + sel.length + " carte" + (sel.length > 1 ? "s" : "") : "Choisis tes cartes") + "</button>");
  return dock(b.length > 1 ? '<div class="row">' + b.join("") + "</div>" : b.join(""));
}
function revealHTML(E, me, nameOf){
  return CSS + tableHTML(E) + '<p class="lb-log">' + esc(E.log) + '</p><span class="eyebrow">Les cartes de ' + esc(nameOf(E.last.by)) + '</span><div class="lb-row">' + E.reveal.map(c => cardHTML(c, " disabled", good(E, c) ? "tb" : "")).join("") + "</div>" +
    '<div class="lb-big' + (E.truth ? "" : " boom") + '">' + (E.truth ? "Vérité" : "Bluff !") + "</div>" +
    '<div class="pass" style="min-height:0"><span class="eyebrow">' + (E.loser === me ? "C'est toi qui tires" : "Le revolver passe à") + '</span><div class="who">' + esc(nameOf(E.loser)) + "</div><p>Coups déjà tirés : " + (E.pulls[E.loser] || 0) + " · risque : 1 sur " + (6 - (E.pulls[E.loser] || 0)) + "." + (E.more > 0 ? " Barillet nerveux : il faudra tirer deux fois." : "") + "</p></div>";
}
function shotHTML(E, nameOf, bullet){
  const n = E.pulls[E.loser] || 0;
  let gun = '<div class="lb-gun">'; for(let i = 1; i <= 6; i++) gun += '<i class="' + (E.boom && i === n ? "b" : i <= n ? "x" : "") + '"></i>'; gun += "</div>";
  return CSS + '<div class="pass" style="min-height:30vh"><div class="lb-big' + (E.boom ? " boom" : "") + '">' + (E.boom ? "PAN !" : "Clic…") + '</div><div class="who" style="text-align:center">' + esc(nameOf(E.loser)) + '</div><p style="text-align:center; max-width:none">' +
    (E.boom ? "est hors jeu." : "survit. Prochain coup : 1 risque sur " + Math.max(1, 6 - n) + ".") + (E.more > 0 && !E.boom ? " <b>Barillet nerveux : encore un coup !</b>" : "") + "</p>" + gun + "</div>" + (E.winner ? '<p class="lb-log">Il ne reste que ' + esc(nameOf(E.winner)) + " !</p>" : "");
}
const OUTRO = ["Le seul à tenir encore debout au bar.", "Les autres ont mordu la poussière.", "Le barman lui offre la tournée.", "Personne n'a su lire dans son jeu.", "Des nerfs d'acier… et un peu de chance."];
function endHTML(E, nameOf){
  const L = awardLines(E, nameOf);
  return CSS + '<span class="eyebrow">Dernier survivant</span><div class="who">' + esc(nameOf(E.winner)) + "</div><p>" + OUTRO[(E.round || 1) % OUTRO.length] + "</p>" +
    (L.length ? '<div class="field"><span class="eyebrow">Trophées</span><ul class="lb-aw">' + L.map(x => "<li><b>" + esc(x[0]) + " · " + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : "") +
    playersHTML(E, nameOf, "");
}
/* Le bandeau du coup de théâtre apparaît avec un petit choc et une notification. */
const EVX = { key: "", n: 0 };
function evFx(root, E, key){
  if(EVX.key !== key){ EVX.key = key; EVX.n = E.evn || 0; return; }
  if((E.evn || 0) === EVX.n) return;
  EVX.n = E.evn || 0;
  const t = evOf(E); if(!t) return;
  SB.u.toast(t.name); buzz([30, 40, 30]);
  if(SB.fx) SB.fx.pop(root.querySelector(".lb-ev .twist"), 150, true);
}
function paint(root, key, html, bind){
  key = "lb:" + key;
  if(root.dataset.key === key) return;
  if(!/^lb:/.test(root.dataset.key || "")){ screen(root, key, html, bind); return; }
  const sc = root.closest(".screen"), top = sc ? sc.scrollTop : 0;
  root.dataset.key = key; root.innerHTML = html; if(sc) sc.scrollTop = top;
  if(bind) bind(root);
}

/* ---------- Réseau ---------- */
function fromState(s){
  const hands = {}; A(s.order).forEach(id => { hands[id] = A((s.hands || {})[id]).slice(); });
  return { order: A(s.order).slice(), alive: Object.assign({}, s.alive), hands, table: s.table, turn: s.turn, last: s.last ? { by: s.last.by, n: s.last.n, cards: A(s.last.cards).slice() } : null,
    phase: s.phase, pulls: Object.assign({}, s.pulls), loser: s.loser || "", truth: !!s.truth, reveal: A(s.reveal).slice(), caller: s.caller || "", boom: !!s.boom,
    winner: s.winner || "", round: s.round || 1, start: s.start, log: s.log || "", seen: Object.assign({}, s.seen), pc: s.pc || 0,
    t2: s.t2 || "", dir: s.dir || 1, tw: !!s.tw, ev: s.ev || "", evl: s.evl || "", evn: s.evn || 0, maxc: s.maxc || 3, blind: !!s.blind, more: s.more || 0,
    st: Object.assign({}, s.st), aw: A(s.aw).map(A) };
}
const UI = { k: "", sel: [], prev: [] };
/* Animations : les cartes posées glissent face cachée sur la table, puis se retournent au « Menteur ! ». */
const FX = { key: "", pc: 0, rect: null, at: 0 };
/* Choisir des cartes : chacune monte en douceur, celles qu'on retire redescendent. */
function selFx(root, sel, prev){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = i => root.querySelector('.lb-hand [data-c="' + i + '"]');
  sel.filter(i => prev.indexOf(i) < 0).forEach(i => { const c = el(i); if(c && c.animate) c.animate([{ transform: "none" }, { transform: "translateY(-20px) scale(1.08) rotate(-2deg)", offset: .6 }, { transform: "translateY(-12px)" }], { duration: 440, easing: "cubic-bezier(.3,.7,.3,1)" }); });
  prev.filter(i => sel.indexOf(i) < 0).forEach(i => { const c = el(i); if(c && c.animate) c.animate([{ transform: "translateY(-12px)" }, { transform: "none" }], { duration: 300, easing: "cubic-bezier(.3,.7,.3,1)" }); });
}
function grab(root){ const el = root.querySelector('.lb-hand [aria-pressed="true"]') || root.querySelector(".lb-hand"); if(el){ FX.rect = el.getBoundingClientRect(); FX.at = Date.now(); } }
function animate(root, E, me, key){
  if(!SB.fx) return;
  if(FX.key !== key){ FX.key = key; FX.pc = E.pc || 0; FX.rect = null; return; }
  if((E.pc || 0) === FX.pc || !E.last) return;
  FX.pc = E.pc || 0;
  let from = E.last.by === me && FX.rect && Date.now() - FX.at < 30000 ? FX.rect : null;
  if(!from){ const li = Array.from(root.querySelectorAll(".lb-pl [data-p]")).find(x => x.dataset.p === E.last.by); from = li ? li.getBoundingClientRect() : null; }
  const backs = root.querySelectorAll(".lb-row .lb-back");
  if(!backs.length) return;
  if(!SB.fx.flyTo){ backs.forEach((b, k) => SB.fx.fly(b, from, { rot: k % 2 ? 14 : -14, delay: k * 160 })); return; }
  // Les vraies cartes restent cachées pendant que leurs copies glissent sur la table.
  FX.landing = (FX.landing || 0) + backs.length; root.classList.add("lb-landing");
  backs.forEach((b, k) => SB.fx.flyTo(b.outerHTML, from, b, { rot: k % 2 ? 16 : -16, delay: k * 180, ms: 1050, done: () => {
    FX.landing--; if(FX.landing <= 0){ FX.landing = 0; root.classList.remove("lb-landing"); if(SB.fx.ripple){ const row = root.querySelector(".lb-row"); if(row && row.animate) row.animate([{ transform: "scale(1)" }, { transform: "scale(.94)", offset: .25 }, { transform: "scale(1.05)", offset: .6 }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" }); SB.fx.ripple(b); } }
  } }));
  FX.rect = null;
}
function revealFx(root){
  if(!SB.fx) return;
  const cards = root.querySelectorAll(".lb-row .lb-c");
  cards.forEach((c, k) => SB.fx.flip(c, 200 + k * 260));
  SB.fx.pop(root.querySelector(".lb-big"), 300 + cards.length * 260, false);
}
function shotFx(root, boom){ if(SB.fx) SB.fx.pop(root.querySelector(".lb-big"), 0, boom); }
let LTOK = 0;

const DEF = {
  id: "menteurs", name: "Roulette des menteurs", glyph: "Bluff", pitch: "Bluffe sur tes cartes… ou appuie sur la détente.", hot: false,
  accent: { light: "#e0a479", dark: "#e0a479" },
  tag: "Pose tes cartes face cachée en jurant qu'elles correspondent à la table. « Menteur ! » : celui qui a tort appuie sur la détente.",
  min: 2, max: 6,
  rules: [
    "À chaque manche, la table impose une valeur : Rois, Dames ou As. Chacun reçoit 5 cartes. Les jokers valent n'importe quelle carte.",
    "À ton tour, pose 1 à 3 cartes face cachée en affirmant qu'elles correspondent à la table. Tu as le droit de mentir.",
    "Le joueur suivant pose à son tour, ou crie « Menteur ! » pour retourner les cartes.",
    "Si c'était du bluff, le menteur tire. Si c'était vrai, c'est l'accusateur qui tire. Le barillet a 6 chambres et une seule balle : chaque coup à vide rend le suivant plus risqué.",
    "Ensuite : nouvelle manche, nouvelle donne. Le dernier survivant gagne.",
    "Coups de théâtre : certaines manches ont une règle spéciale (double table, à l'aveugle, une carte à la fois, barillet nerveux…)."
  ],
  options: [
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "Certaines manches ont une règle spéciale", def: true }
  ],
  start(ctx, o){
    const E = { order: shuffle(ctx.ids), alive: {}, pulls: {}, round: 1, seen: {}, tw: !o || o.twists !== false, st: {} };
    E.order.forEach(id => { E.alive[id] = true; E.pulls[id] = 0; });
    E.start = E.order[0]; deal(E);
    ctx.setPriv({ bullets: newBullets(E.order) });
    return E;
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase === "end") return;
    const E = fromState(s), bullets = ctx.priv().bullets || {};
    let changed = false;
    ctx.ids.forEach(id => {
      const x = ctx.input(id); if(!x || !x.p) return;
      const sn = Object.assign({}, E.seen[id] || {});
      if(x.p.n > (sn.p || 0)){
        sn.p = x.p.n; changed = true;
        if(x.p.t === "play") doPlay(E, id, x.p.i, ctx.name);
        else if(x.p.t === "call") doCall(E, id, ctx.name);
        else if(x.p.t === "shoot") doShoot(E, id, bullets, ctx.name);
      }
      E.seen[id] = sn;
    });
    if(changed) ctx.set(E);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, E = fromState(s), nameOf = ctx.name;
    if(UI.k !== ctx.g.gid + "|" + s.round + "|" + (E.last ? E.last.by + E.hands[me].length : "")){ UI.k = ctx.g.gid + "|" + s.round + "|" + (E.last ? E.last.by + E.hands[me].length : ""); UI.sel = []; UI.prev = []; }
    const n = () => (((ctx.mine() || {}).p || {}).n || 0) + 1;
    const again = () => { root.dataset.key = "lb:"; DEF.render(SB.ctx(), root); };
    const absent = E.phase === "play" ? E.turn : E.phase === "reveal" || canShoot(E, E.loser) ? E.loser : "";
    const hostFix = r => {
      if(!ctx.isHost || !absent || absent === me || ctx.here(absent)) return;
      const b = document.createElement("button"); b.type = "button"; b.className = "link warn"; b.style.alignSelf = "center";
      b.textContent = "Faire jouer " + nameOf(absent) + " (absent)";
      b.addEventListener("click", () => ctx.act(c => {
        const F = fromState(c.s), bl = c.priv().bullets || {};
        if(F.phase === "play"){ if(canCall(F, F.turn)) doCall(F, F.turn, c.name); else doPlay(F, F.turn, [0], c.name); }
        else doShoot(F, F.loser, bl, c.name);
        c.set(F);
      }));
      r.append(b);
    };
    if(s.phase === "play"){
      paint(root, JSON.stringify([s.k, E.round, E.hands, E.turn, E.last, E.pulls, E.alive, UI.sel, E.log]), playHTML(E, me, nameOf, UI.sel) + playDock(E, me, UI.sel), r => {
        r.querySelectorAll(".lb-hand [data-c]").forEach(b => b.addEventListener("click", () => {
          const i = +b.dataset.c, k = UI.sel.indexOf(i);
          if(k >= 0) UI.sel.splice(k, 1); else if(UI.sel.length < (E.maxc || 3)) UI.sel.push(i); else if(E.maxc === 1){ UI.sel = [i]; } else { SB.u.toast((E.maxc || 3) + " cartes maximum"); return; }
          buzz(6); again();
        }));
        const pl = r.querySelector("[data-play]"); if(pl) pl.addEventListener("click", () => { grab(r); const i = UI.sel.slice(); UI.sel = []; UI.prev = []; pl.disabled = true; ctx.send({ p: { n: n(), t: "play", i } }); });
        const cl = r.querySelector("[data-call]"); if(cl) cl.addEventListener("click", () => { buzz([30, 30, 60]); cl.disabled = true; ctx.send({ p: { n: n(), t: "call" } }); });
        hostFix(r);
      });
      animate(root, E, me, ctx.g.gid);
      evFx(root, E, ctx.g.gid);
      if(UI.sel.join() !== UI.prev.join()){ selFx(root, UI.sel, UI.prev); UI.prev = UI.sel.slice(); }
    } else if(s.phase === "reveal"){
      paint(root, "rv" + s.k + s.round + E.loser + (E.loser === me), revealHTML(E, me, nameOf) + (E.loser === me ? dock('<button class="btn bad big-tap" type="button" data-shoot>Appuyer sur la détente</button>') : dock('<p class="wait">' + esc(nameOf(E.loser)) + " tient le revolver…</p>")), r => {
        const b = r.querySelector("[data-shoot]"); if(b) armTap(b, () => { buzz(80); ctx.send({ p: { n: n(), t: "shoot" } }); }, "Touche encore… si tu oses");
        hostFix(r); revealFx(r);
      });
    } else if(s.phase === "shot"){
      const again2 = canShoot(E, E.loser);
      paint(root, "sh" + s.k + s.round + ctx.isHost + (E.pulls[E.loser] || 0) + E.more + (E.loser === me), shotHTML(E, nameOf) + dock(again2 ? (E.loser === me ? '<button class="btn bad big-tap" type="button" data-shoot>Tirer encore une fois</button>' : '<p class="wait">' + esc(nameOf(E.loser)) + " doit tirer encore une fois…</p>")
        : ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (E.winner ? "Voir le vainqueur" : "Manche suivante") + "</button>" : '<p class="wait">L\'hôte prépare la manche suivante…</p>'), r => {
        if(E.boom) buzz([200, 80, 200]);
        shotFx(r, E.boom);
        const sh = r.querySelector("[data-shoot]"); if(sh) armTap(sh, () => { buzz(80); ctx.send({ p: { n: n(), t: "shoot" } }); }, "Touche encore… si tu oses");
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s);
          if(!nextRound(F)) return;
          if(F.ev === "recharge" && F.phase === "play") c.setPriv({ bullets: newBullets(F.order) }); // une balle neuve pour tout le monde
          c.set(F);
        }));
        hostFix(r);
      });
    } else {
      screen(root, "end" + s.k + ctx.isHost, endHTML(E, nameOf) + dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]"); if(b) b.addEventListener("click", () => ctx.act(c => { const F = fromState(c.s); c.end({ title: "Roulette des menteurs : " + c.name(c.s.winner) + " survit", lines: [c.s.round + " manches"].concat(awardLines(F, c.name).map(x => x[0] + " : " + x[1])), win: [c.s.winner] }); }));
      });
    }
  },

  /* ---------- Un seul téléphone : contre des robots et/ou en se passant le téléphone ---------- */
  local: {
    players: { min: 1, max: 6 },
    start(root, api){
      const names = api.names, st = store();
      let bots = [0, 1, 2, 3].indexOf(st.lbBots) >= 0 ? st.lbBots : (names.length === 1 ? 2 : 0), tw = st.lbTw !== false;
      const BOTN = ["Le Barman", "Mamie Poker", "Tonton Bluff"];
      let E = null, bullets = {}, viewer = "", sel = [], prevSel = [], timer = null, nameMap = {}, gno = 0;
      const tok = ++LTOK;
      const nameOf = id => nameMap[id] || "?", isBot = id => id[0] === "b";
      const humans = () => E.order.filter(id => !isBot(id));
      const liveHumans = () => humans().filter(id => E.alive[id]);
      const alive = () => tok === LTOK && root.isConnected && !!root.querySelector("style[data-lb]") && !root.closest(".screen").hidden;
      const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(() => { if(alive()) fn(); }, ms); };
      function setup(){
        clearTimeout(timer);
        const total = names.length + bots;
        screen(root, "su" + bots + tw, CSS + '<p class="howto">' + (names.length > 1 ? "Les joueurs se passent le téléphone à leur tour : les mains restent cachées." : "Une partie contre les robots du bar.") + " Pose tes cartes en bluffant et crie « Menteur ! » au bon moment.</p>" +
          '<div class="field"><span class="eyebrow">Robots</span><div class="seg">' + [0, 1, 2, 3].map(b => '<button type="button" data-b="' + b + '" aria-pressed="' + (b === bots) + '">' + b + "</button>").join("") + "</div></div>" +
          '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + tw + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">Certaines manches ont une règle spéciale</span></span></button></div>' +
          (total < 2 ? '<p class="err">Ajoute au moins un robot pour jouer seul.</p>' : total > 6 ? '<p class="err">6 joueurs maximum, robots compris.</p>' : "") +
          dock('<button class="btn acc" type="button" data-go' + (total < 2 || total > 6 ? " disabled" : "") + ">Entrer dans le bar</button>"), r => {
          r.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { bots = +b.dataset.b; persist({ lbBots: bots }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { tw = !tw; persist({ lbTw: tw }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            nameMap = {}; const ids = names.map((nm, i) => { nameMap["h" + i] = nm; return "h" + i; });
            for(let i = 0; i < bots; i++){ nameMap["b" + i] = BOTN[i] + " 🤖"; ids.push("b" + i); }
            E = { order: shuffle(ids), alive: {}, pulls: {}, round: 1, tw, st: {} };
            E.order.forEach(id => { E.alive[id] = true; E.pulls[id] = 0; });
            E.start = E.order[0]; deal(E); bullets = newBullets(E.order); gno++;
            viewer = humans().length === 1 ? humans()[0] : ""; sel = []; prevSel = [];
            step();
          });
        });
      }
      function act(fn){ if(fn()) buzz(10); sel = []; prevSel = []; step(); }
      function step(){
        if(E.phase === "end"){ end(); return; }
        if(E.phase === "reveal"){ reveal(); return; }
        if(E.phase === "shot"){ shot(); return; }
        const cur = E.turn;
        if(isBot(cur)){ draw(viewer); later(() => { botTurn(E, cur, nameOf); step(); }, 1900); return; }
        if(viewer !== cur && liveHumans().length > 1){
          clearTimeout(timer);
          screen(root, "pass" + cur + E.log + Math.random(), CSS + '<p class="lb-log">' + esc(E.log) + '</p><div class="pass"><span class="eyebrow">Passe le téléphone à</span><div class="who">' + esc(nameOf(cur)) + "</div><p>Les autres, ne regardez pas sa main.</p></div>" +
            dock('<button class="btn acc" type="button" data-n>C\'est moi</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => { viewer = cur; step(); }));
          return;
        }
        draw(cur);
      }
      function draw(me){
        paint(root, JSON.stringify([E.round, E.hands, E.turn, E.last, E.pulls, E.alive, sel, E.log, me]), playHTML(E, me, nameOf, sel) + playDock(E, me, sel), r => {
          r.querySelectorAll(".lb-hand [data-c]").forEach(b => b.addEventListener("click", () => {
            const i = +b.dataset.c, k = sel.indexOf(i);
            if(k >= 0) sel.splice(k, 1); else if(sel.length < (E.maxc || 3)) sel.push(i); else if(E.maxc === 1){ sel = [i]; } else { SB.u.toast((E.maxc || 3) + " cartes maximum"); return; }
            buzz(6); draw(me);
          }));
          const pl = r.querySelector("[data-play]"); if(pl) pl.addEventListener("click", () => { grab(r); const i = sel.slice(); act(() => doPlay(E, me, i, nameOf)); });
          const cl = r.querySelector("[data-call]"); if(cl) cl.addEventListener("click", () => { buzz([30, 30, 60]); act(() => doCall(E, me, nameOf)); });
        });
        animate(root, E, me, "local" + tok + "-" + gno);
        evFx(root, E, "local" + tok + "-" + gno);
        if(sel.join() !== prevSel.join()){ selFx(root, sel, prevSel); prevSel = sel.slice(); }
      }
      function reveal(){
        const L = E.loser, me = isBot(L) ? viewer : L;
        paint(root, "rv" + E.round + L, revealHTML(E, me, nameOf) + (isBot(L) ? dock('<p class="wait">' + esc(nameOf(L)) + " tient le revolver…</p>") : dock('<button class="btn bad big-tap" type="button" data-shoot>' + esc(nameOf(L)) + " : appuyer sur la détente</button>")), r => {
          const b = r.querySelector("[data-shoot]"); if(b) armTap(b, () => { buzz(80); doShoot(E, L, bullets, nameOf); step(); }, "Touche encore… si tu oses");
          revealFx(r);
        });
        if(isBot(L)) later(() => { doShoot(E, L, bullets, nameOf); step(); }, 2200);
      }
      function shot(){
        clearTimeout(timer);
        if(E.boom) buzz([200, 80, 200]);
        const L = E.loser, more = canShoot(E, L);
        paint(root, "sh" + E.round + (E.pulls[L] || 0) + E.more, shotHTML(E, nameOf) + dock(!more ? '<button class="btn acc" type="button" data-n>' + (E.winner ? "Voir le vainqueur" : "Manche suivante") + "</button>"
          : isBot(L) ? '<p class="wait">' + esc(nameOf(L)) + " doit tirer encore une fois…</p>" : '<button class="btn bad big-tap" type="button" data-shoot>' + esc(nameOf(L)) + " : tirer encore une fois</button>"), r => {
          shotFx(r, E.boom);
          const sh = r.querySelector("[data-shoot]"); if(sh) armTap(sh, () => { buzz(80); doShoot(E, L, bullets, nameOf); step(); }, "Touche encore… si tu oses");
          const nx = r.querySelector("[data-n]");
          if(nx) nx.addEventListener("click", () => { nextRound(E); if(E.ev === "recharge" && E.phase === "play") bullets = newBullets(E.order); if(liveHumans().length === 1) viewer = liveHumans()[0]; else viewer = ""; step(); });
        });
        if(more && isBot(L)) later(() => { doShoot(E, L, bullets, nameOf); step(); }, 2200);
      }
      function end(){
        clearTimeout(timer);
        if(api.win) api.win([nameOf(E.winner)]);
        screen(root, "end" + E.round, endHTML(E, nameOf) + dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button>'), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
};
DEF.engine = { fromState, deal, doPlay, doCall, doShoot, canShoot, nextRound, botTurn, newBullets, canCall, good, EVENTS, awards, awardLines };
SB.register(DEF);
})();
