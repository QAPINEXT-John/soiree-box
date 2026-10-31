/* King's Cup : on tire les cartes une par une, chaque valeur déclenche une règle.
   Le 4e roi boit la coupe (ou prend le gage XXL en mode sans alcool) et la partie s'arrête.
   Toute la logique est dans un « réducteur » pur (init / draw / resolve / next) partagé par le salon et le
   mode un seul téléphone. Les textes des règles sont calculés à l'affichage, dans la langue de chaque téléphone :
   l'état ne contient que des valeurs de cartes et des ids. */
(function(){
"use strict";
const { esc, A, shuffle, screen, buzz, store, persist, clean } = SB.u;
const tr = SB.tr;

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"], SUITS = ["h", "d", "c", "s"];
const SYM = { h: "♥", d: "♦", c: "♣", s: "♠" };
const rankOf = c => String(c || "").slice(0, -1), suitOf = c => String(c || "").slice(-1);
const RLAB = r => (r === "J" ? tr("V", "J") : r === "Q" ? tr("D", "Q") : r === "K" ? tr("R", "K") : r);
const newDeck = () => shuffle(RANKS.flatMap(r => SUITS.map(s => r + s)));
// Cartes qui demandent un choix : un joueur (2, 8), les perdants d'un mini-jeu (4, 6, 7, 9, 10), une règle (V).
const PICK1 = ["2", "8"], LOSERS = ["4", "6", "7", "9", "10"];
// Élision devant un prénom qui commence par une voyelle : « d'Anna », « qu'Anna ».
const VOW = /^[aeiouyhàâäéèêëîïôöûüAEIOUYHÀÂÄÉÈÊËÎÏÔÖÛÜ]/;
const de = n => (VOW.test(n) ? "d'" : "de ") + n, que = n => (VOW.test(n) ? "qu'" : "que ") + n;

// Textes des règles (calculés sur chaque téléphone). hard = gages avec alcool ; hot = version Hot & Hard.
function rule(card, o){
  const r = rankOf(card), h = o.hard, hot = o.hot, who = o.who || "";
  const V = (b, g) => (h ? b : g); // verbe avec / sans alcool
  switch(r){
    case "A": return { t: tr("Cascade", "Waterfall"), d: h ? tr("Tout le monde boit en même temps. Personne n'arrête avant son voisin (sa voisine) de droite, en commençant par " + who + ".", "Everyone drinks at once. Nobody stops before the person on their right, starting with " + who + ".") : tr("Tout le monde prend un gage.", "Everyone takes a forfeit.") };
    case "2": return { t: tr("Pour toi", "You"), d: tr(who + " choisit qui " + V("boit", "prend un gage") + ".", who + " picks who " + V("drinks", "takes a forfeit") + ".") };
    case "3": return { t: tr("Pour moi", "Me"), d: tr(who + " " + V("boit", "prend un gage") + ".", who + " " + V("drinks", "takes a forfeit") + ".") };
    case "4": return { t: tr("Au sol", "Floor"), d: tr("Tout le monde touche le sol : le dernier (la dernière) " + V("boit", "prend un gage") + ".", "Everyone touches the floor: the last one " + V("drinks", "takes a forfeit") + ".") };
    case "5": return { t: tr("Maître du pouce", "Thumb master"), d: tr(who + " pose discrètement son pouce sur la table quand il (elle) veut : le dernier (la dernière) à l'imiter " + V("boit", "prend un gage") + ". Pouvoir valable jusqu'au prochain 5.", who + " quietly puts a thumb on the table whenever they like: the last one to copy " + V("drinks", "takes a forfeit") + ". Lasts until the next 5.") };
    case "6": return { t: hot ? tr("Je n'ai jamais (Hot & Hard)", "Never have I ever (Hot & Hard)") : tr("Je n'ai jamais", "Never have I ever"), d: tr(who + " dit une chose " + (hot ? "coquine " : "") + "qu'il (elle) n'a jamais faite : ceux qui l'ont faite " + V("boivent", "prennent un gage") + ".", who + " says something " + (hot ? "naughty " : "") + "they've never done: everyone who has " + V("drinks", "takes a forfeit") + ".") };
    case "7": return { t: tr("Au ciel", "Heaven"), d: tr("Tout le monde lève la main : le dernier (la dernière) " + V("boit", "prend un gage") + ".", "Everyone raises a hand: the last one " + V("drinks", "takes a forfeit") + ".") };
    case "8": return { t: tr("Partenaire", "Mate"), d: tr(who + " choisit un(e) partenaire : jusqu'au prochain 8, il (elle) " + V("boit", "prend un gage") + " chaque fois " + que(who) + " " + V("boit", "en prend un") + ".", who + " picks a mate: until the next 8, the mate " + V("drinks", "takes a forfeit") + " every time " + who + " " + V("drinks", "does") + ".") };
    case "9": return { t: tr("Rimes", "Rhymes"), d: tr(who + " dit un mot, chacun à son tour trouve une rime : le premier (la première) qui sèche ou répète " + V("boit", "prend un gage") + ".", who + " says a word, everyone in turn finds a rhyme: the first to dry up or repeat " + V("drinks", "takes a forfeit") + ".") };
    case "10": return { t: tr("Catégories", "Categories"), d: tr(who + " choisit une catégorie (" + (hot ? "positions, lieux insolites, sex-toys…" : "marques de bière, pays, Pokémon…") + "). Chacun à son tour cite un élément : le premier (la première) qui sèche " + V("boit", "prend un gage") + ".", who + " picks a category (" + (hot ? "positions, wild places, sex toys…" : "beer brands, countries, Pokémon…") + "). Everyone in turn names one: the first to dry up " + V("drinks", "takes a forfeit") + ".") };
    case "J": return { t: tr("Nouvelle règle", "New rule"), d: tr(who + " invente une règle valable toute la partie (ex. : interdit de dire « oui »). Qui l'oublie " + V("boit", "prend un gage") + ".", who + " makes up a rule for the whole game (e.g. no saying \"yes\"). Whoever forgets " + V("drinks", "takes a forfeit") + ".") };
    case "Q": return { t: tr("Maître des questions", "Question master"), d: tr("Jusqu'à la prochaine dame, quiconque répond à une question " + de(who) + " " + V("boit", "prend un gage") + ".", "Until the next queen, anyone who answers one of " + who + "'s questions " + V("drinks", "takes a forfeit") + ".") };
    case "K": return o.kings >= 4 ? { t: "King's Cup", d: h ? tr("4e roi : " + who + " boit la King's Cup !", "4th king: " + who + " drinks the King's Cup!") : tr("4e roi : " + who + " prend le gage XXL de la coupe !", "4th king: " + who + " takes the cup's XXL forfeit!") }
      : { t: tr("Roi n° " + o.kings, "King no. " + o.kings), d: h ? tr(who + " verse un peu de son verre dans la King's Cup. Au 4e roi, on la boit.", who + " pours a little of their drink into the King's Cup. The 4th king drinks it.") : tr(who + " ajoute un gage à la coupe. Au 4e roi, on le prend.", who + " adds a forfeit to the cup. The 4th king takes it.") };
  }
  return { t: "", d: "" };
}

/* ---------- Réducteur (pur, données sérialisables) ---------- */
function init(ids, o){
  return { order: ids.slice(), cur: ids[0], step: "draw", card: "", left: 52, kings: 0, thumb: "", qm: "", mates: [], rules: [], last: [], done: false, hot: !!o.hot, full: o.fin === "paquet" };
}
// Gages d'une liste d'ids, partenaires compris.
function withMates(st, ev, ids){
  const out = []; A(ids).forEach(id => { out.push({ id, ev }); A(st.mates).forEach(m => { if(m[0] === id && m[1] !== id) out.push({ id: m[1], ev: "partenaire" }); }); });
  return out;
}
function draw(st, deck){
  const s = JSON.parse(JSON.stringify(st)), card = deck.pop() || "";
  s.card = card; s.left = deck.length; s.last = []; let gl = [];
  const r = rankOf(card);
  if(r === "A") gl = [{ id: s.cur, ev: "cascade" }];
  else if(r === "3") gl = withMates(s, "pourmoi", [s.cur]);
  else if(r === "5") s.thumb = s.cur;
  else if(r === "Q") s.qm = s.cur;
  else if(r === "K"){ s.kings++; if(s.kings >= 4){ gl = withMates(s, "coupe", [s.cur]); if(!s.full) s.done = true; } }
  s.step = PICK1.indexOf(r) >= 0 || LOSERS.indexOf(r) >= 0 || r === "J" ? "act" : "next";
  if(!card){ s.done = true; s.step = "next"; }
  return { s, gl };
}
function resolve(st, a){
  const s = JSON.parse(JSON.stringify(st)), r = rankOf(s.card); let gl = [];
  const ok = id => s.order.indexOf(id) >= 0;
  if(r === "2"){ const t = A(a.pick).filter(ok)[0]; if(!t) return null; gl = withMates(s, "pourtoi", [t]); s.last = [t]; }
  else if(r === "8"){ const t = A(a.pick).filter(id => ok(id) && id !== s.cur)[0]; if(!t) return null; s.mates = A(s.mates).filter(m => m[0] !== s.cur).concat([[s.cur, t]]); s.last = [t]; }
  else if(LOSERS.indexOf(r) >= 0){ const L = A(a.pick).filter(ok).filter((x, i, arr) => arr.indexOf(x) === i); gl = withMates(s, "perdu", L); s.last = L; }
  else if(r === "J"){ const t = clean(a.rule, 80); if(!t) return null; s.rules = A(s.rules).concat([{ t, by: s.cur }]).slice(-6); }
  else return null;
  s.step = "next";
  return { s, gl };
}
function next(st){
  const s = JSON.parse(JSON.stringify(st));
  if(s.done || s.left <= 0){ s.done = true; return s; }
  const i = s.order.indexOf(s.cur); s.cur = s.order[(i + 1) % s.order.length]; s.step = "draw"; s.card = ""; s.last = [];
  return s;
}

/* ---------- Affichage commun ---------- */
const CSS = '<style>' +
  '.kc-top{display:flex; justify-content:space-between; align-items:center; font-weight:800; color:var(--muted); font-size:13px}.kc-top b{color:var(--ink)}' +
  // Cartes : face façon carte à jouer (index dans les coins, figures de points, figures couronnées), dos bordeaux et or avec couronne.
  '.kc-stage{align-self:center; width:160px; height:224px; perspective:900px}' +
  '.kc-flip{position:relative; width:100%; height:100%; transform-style:preserve-3d}.kc-flip.go{animation:kcFlip .55s cubic-bezier(.2,.7,.2,1) both}@keyframes kcFlip{from{transform:rotateY(180deg)}to{transform:none}}' +
  '.kc-face,.kc-bk{position:absolute; inset:0; border-radius:16px; backface-visibility:hidden; -webkit-backface-visibility:hidden; box-shadow:0 14px 34px rgba(0,0,0,.45), 0 2px 0 rgba(255,255,255,.06) inset}' +
  '.kc-bk{transform:rotateY(180deg)}.kc-stage.back .kc-bk{transform:none}' +
  '.kc-face{background:#fffdf7; color:#1b1726; border:1px solid rgba(0,0,0,.08)}.kc-face.red{color:#c8102e}' +
  '.kc-ix{position:absolute; display:flex; flex-direction:column; align-items:center; line-height:.95; font-family:var(--f-disp); font-weight:800}.kc-ix b{font-size:22px; letter-spacing:-.04em}.kc-ix i{font-style:normal; font-size:17px}' +
  '.kc-ix.tl{top:9px; left:10px}.kc-ix.br{bottom:9px; right:10px; transform:rotate(180deg)}' +
  '.kc-pips{position:absolute; inset:36px 50px}.kc-pips i{position:absolute; font-style:normal; font-size:22px; line-height:1; transform:translate(-50%,-50%)}.kc-pips i.dn{transform:translate(-50%,-50%) rotate(180deg)}' +
  '.kc-ace{position:absolute; inset:0; display:grid; place-items:center; font-size:84px; line-height:1}' +
  '.kc-fig{position:absolute; inset:32px 26px; border-radius:10px; border:2px solid currentColor; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background:repeating-linear-gradient(135deg, rgba(201,151,0,.10) 0 6px, transparent 6px 12px)}' +
  '.kc-fig svg{width:58px; height:44px; color:#c99700}.kc-fig b{font-family:var(--f-disp); font-size:46px; line-height:1}.kc-fig i{font-style:normal; font-size:20px}' +
  '.kc-bk{background:radial-gradient(circle at 50% 50%, #4a1328 0 34%, transparent 35%), repeating-linear-gradient(45deg, rgba(255,204,61,.16) 0 2px, transparent 2px 13px), repeating-linear-gradient(-45deg, rgba(255,204,61,.16) 0 2px, transparent 2px 13px), #2b0c1a; border:3px solid #ffcc3d; display:grid; place-items:center}' +
  '.kc-bk::before{content:""; position:absolute; inset:7px; border-radius:11px; border:1.5px solid rgba(255,204,61,.55)}' +
  '.kc-bk svg{width:64px; height:50px; color:#ffcc3d; filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))}' +
  '.kc-rule{text-align:center; display:flex; flex-direction:column; gap:6px}.kc-rule b{font-family:var(--f-disp); font-size:26px}.kc-rule p{margin:0; color:var(--ink); font-size:16px; line-height:1.35}' +
  '.kc-kings{display:flex; gap:6px; justify-content:center}.kc-kings i{width:26px; height:26px; border-radius:8px; border:2px solid var(--line); display:grid; place-items:center; font-style:normal; font-weight:800; font-size:13px; color:var(--muted)}.kc-kings i.on{background:var(--acc); border-color:var(--acc); color:var(--on-acc)}' +
  '.kc-pp{display:flex; flex-wrap:wrap; gap:8px; justify-content:center}.kc-pp button{min-height:44px; padding:0 16px; border-radius:99px; border:1.5px solid var(--line); background:var(--card); color:var(--ink); font-weight:800}.kc-pp button[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--on-acc)}' +
  '.kc-roles{display:flex; flex-direction:column; gap:4px; font-size:13px; color:var(--muted); font-weight:600}.kc-roles b{color:var(--ink)}' +
  '.kc-res{text-align:center; font-weight:800; font-size:17px}' +
  "</style>";
const CROWN = '<svg viewBox="0 0 64 48" aria-hidden="true"><path fill="currentColor" d="M4 14l14 12L32 4l14 22 14-12-6 28H10z"/><rect x="10" y="42" width="44" height="5" rx="2" fill="currentColor"/><circle cx="4" cy="12" r="4" fill="currentColor"/><circle cx="32" cy="4" r="4" fill="currentColor"/><circle cx="60" cy="12" r="4" fill="currentColor"/></svg>';
// Emplacement des points (en % de la zone centrale) pour 2 à 10, comme sur une vraie carte.
const PIPS = { 2: [[50, 0], [50, 100]], 3: [[50, 0], [50, 50], [50, 100]], 4: [[0, 0], [100, 0], [0, 100], [100, 100]], 5: [[0, 0], [100, 0], [50, 50], [0, 100], [100, 100]],
  6: [[0, 0], [100, 0], [0, 50], [100, 50], [0, 100], [100, 100]], 7: [[0, 0], [100, 0], [50, 25], [0, 50], [100, 50], [0, 100], [100, 100]],
  8: [[0, 0], [100, 0], [50, 25], [0, 50], [100, 50], [50, 75], [0, 100], [100, 100]], 9: [[0, 0], [100, 0], [0, 33], [100, 33], [50, 50], [0, 67], [100, 67], [0, 100], [100, 100]],
  10: [[0, 0], [100, 0], [50, 17], [0, 33], [100, 33], [0, 67], [100, 67], [50, 83], [0, 100], [100, 100]] };
const backHTML = () => '<div class="kc-bk">' + CROWN + "</div>";
function cardHTML(c, flip){
  const r = rankOf(c), s = suitOf(c), red = s === "h" || s === "d", sym = SYM[s], lab = RLAB(r);
  let mid;
  if(r === "A") mid = '<div class="kc-ace">' + sym + "</div>";
  else if(r === "J" || r === "Q" || r === "K") mid = '<div class="kc-fig">' + CROWN + "<b>" + esc(lab) + "</b><i>" + sym + "</i></div>";
  else mid = '<div class="kc-pips">' + PIPS[r].map(p => '<i class="' + (p[1] > 50 ? "dn" : "") + '" style="left:' + p[0] + "%; top:" + p[1] + '%">' + sym + "</i>").join("") + "</div>";
  const ix = cls => '<span class="kc-ix ' + cls + '"><b>' + esc(lab) + "</b><i>" + sym + "</i></span>";
  return '<div class="kc-stage" role="img" aria-label="' + esc(lab + " " + sym) + '"><div class="kc-flip' + (flip ? " go" : "") + '"><div class="kc-face' + (red ? " red" : "") + '">' + ix("tl") + mid + ix("br") + "</div>" + backHTML() + "</div></div>";
}
const deckBackHTML = () => '<div class="kc-stage back" aria-hidden="true"><div class="kc-flip">' + backHTML() + "</div></div>";
const kingsHTML = n => '<div class="kc-kings" aria-label="' + esc(tr("Rois tirés : " + n + " sur 4", "Kings drawn: " + n + " of 4")) + '">' + [1, 2, 3, 4].map(i => '<i class="' + (i <= n ? "on" : "") + '">' + RLAB("K") + "</i>").join("") + "</div>";
function rolesHTML(s, nameOf){
  const L = [];
  if(s.thumb) L.push(tr("Maître du pouce : ", "Thumb master: ") + "<b>" + esc(nameOf(s.thumb)) + "</b>");
  if(s.qm) L.push(tr("Maître des questions : ", "Question master: ") + "<b>" + esc(nameOf(s.qm)) + "</b>");
  A(s.mates).forEach(m => L.push(tr("Partenaires : ", "Mates: ") + "<b>" + esc(nameOf(m[0])) + " → " + esc(nameOf(m[1])) + "</b>"));
  A(s.rules).forEach(r => L.push(tr("Règle : ", "Rule: ") + "<b>" + esc(r.t) + "</b>"));
  return L.length ? '<div class="card kc-roles"><span class="eyebrow">' + tr("En cours", "In play") + "</span>" + L.map(x => "<span>" + x + "</span>").join("") + "</div>" : "";
}
const resLine = (s, nameOf, hard) => {
  const r = rankOf(s.card), names = A(s.last).map(nameOf);
  if(r === "2" && names.length) return tr(names[0] + " " + (hard ? "boit" : "prend un gage") + ".", names[0] + " " + (hard ? "drinks" : "takes a forfeit") + ".");
  if(r === "8" && names.length) return tr(names[0] + " est le (la) partenaire " + de(nameOf(s.cur)) + ".", names[0] + " is " + nameOf(s.cur) + "'s mate.");
  if(LOSERS.indexOf(r) >= 0) return names.length ? tr(names.join(", ") + " " + (hard ? "boi" + (names.length > 1 ? "vent" : "t") : (names.length > 1 ? "prennent" : "prend") + " un gage") + ".", names.join(", ") + " " + (hard ? "drink" + (names.length > 1 ? "" : "s") : "take" + (names.length > 1 ? "" : "s") + " a forfeit") + ".") : tr("Personne cette fois.", "Nobody this time.");
  if(r === "J" && A(s.rules).length) return tr("Nouvelle règle : ", "New rule: ") + A(s.rules)[A(s.rules).length - 1].t;
  return "";
};
// Zone d'action (choisir un joueur, des perdants, écrire une règle). onDone(a) reçoit { pick:[ids] } ou { rule }.
function actHTML(s, ids, nameOf){
  const r = rankOf(s.card);
  if(r === "J") return '<label class="lbl" for="kc-rule">' + tr("Ta règle", "Your rule") + '<input class="txt" id="kc-rule" maxlength="80" autocomplete="off" placeholder="' + esc(tr("Ex. : interdit de dire « oui »", "E.g. no saying \"yes\"")) + '"></label>' + SB.u.dock('<button class="btn acc" type="button" data-kok>' + tr("Valider la règle", "Set the rule") + "</button>");
  const one = PICK1.indexOf(r) >= 0, pool = ids.filter(id => !(one && id === s.cur));
  return '<p class="howto" style="text-align:center; margin:0">' + (one ? (r === "8" ? tr("Choisis ton (ta) partenaire :", "Pick your mate:") : tr("Choisis qui prend :", "Pick who takes it:")) : tr("Qui a perdu ? Touche les prénoms (ou personne) :", "Who lost? Tap the names (or nobody):")) + "</p>" +
    '<div class="kc-pp">' + pool.map(id => '<button type="button" data-kp="' + esc(id) + '" aria-pressed="false">' + esc(nameOf(id)) + "</button>").join("") + "</div>" +
    SB.u.dock('<button class="btn acc" type="button" data-kok' + (one ? " disabled" : "") + ">" + (one ? tr("Valider", "Confirm") : tr("Valider", "Confirm")) + "</button>");
}
function bindAct(r, s, onDone){
  const rk = rankOf(s.card), one = PICK1.indexOf(rk) >= 0, sel = [];
  const ok = r.querySelector("[data-kok]");
  r.querySelectorAll("[data-kp]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.kp, i = sel.indexOf(id);
    if(one){ sel.length = 0; r.querySelectorAll("[data-kp]").forEach(x => x.setAttribute("aria-pressed", "false")); sel.push(id); b.setAttribute("aria-pressed", "true"); }
    else if(i >= 0){ sel.splice(i, 1); b.setAttribute("aria-pressed", "false"); } else { sel.push(id); b.setAttribute("aria-pressed", "true"); }
    buzz(6); if(ok) ok.disabled = one && !sel.length;
  }));
  if(ok) ok.addEventListener("click", () => {
    if(rk === "J"){ const v = clean((r.querySelector("#kc-rule") || {}).value, 80); if(!v){ SB.u.toast(tr("Écris ta règle.", "Write your rule.")); return; } onDone({ rule: v }); return; }
    if(one && !sel.length) return; onDone({ pick: sel.slice() });
  });
}
function penHTML(ids, nameOf){
  return '<details class="kc-pen"><summary class="link" style="list-style:none; cursor:pointer; align-self:center">' + tr("Quelqu'un a enfreint une règle ?", "Someone broke a rule?") + '</summary><div class="kc-pp" style="margin-top:8px">' + ids.map(id => '<button type="button" data-kpen="' + esc(id) + '">' + esc(nameOf(id)) + "</button>").join("") + "</div></details>";
}

SB.register({
  id: "kingscup", name: "King's Cup", glyph: "K♥",
  pitch: tr("Une carte, une règle. Le 4e roi boit la coupe.", "One card, one rule. The 4th king drinks the cup."),
  accent: { light: "#c99700", dark: "#ffcc3d" },
  tag: tr("Le classique des soirées : chacun tire une carte, chaque valeur déclenche une règle (cascade, rimes, maître du pouce…). Au 4e roi, la coupe est bue.", "The party classic: everyone draws a card, each value triggers a rule (waterfall, rhymes, thumb master…). The 4th king drinks the cup."),
  min: 2, max: 16, hot: true, gagesEnd: false,
  gages: [
    { ev: "cascade", label: tr("Cascade (as)", "Waterfall (ace)"), kind: "tous", n: 1 },
    { ev: "pourmoi", label: tr("Pour moi (3)", "Me (3)"), kind: "boit", n: 2 },
    { ev: "pourtoi", label: tr("Choisi(e) par le 2", "Picked by the 2"), kind: "boit", n: 2 },
    { ev: "perdu", label: tr("Perdu au mini-jeu", "Lost the mini-game"), kind: "boit", n: 1 },
    { ev: "partenaire", label: tr("Ton (ta) partenaire a bu", "Your mate drank"), kind: "boit", n: 1 },
    { ev: "piege", label: tr("Règle pas respectée", "Broke a rule"), kind: "boit", n: 1 },
    { ev: "coupe", label: tr("King's Cup (4e roi)", "King's Cup (4th king)"), kind: "boit", n: 5 }
  ],
  rules: tr([
    "On pose un paquet de 52 cartes. À ton tour, tu tires une carte : sa valeur déclenche une règle.",
    "As : cascade · 2 : pour toi (tu choisis qui prend) · 3 : pour moi · 4 : au sol · 5 : maître du pouce · 6 : je n'ai jamais · 7 : au ciel · 8 : partenaire · 9 : rimes · 10 : catégories · Valet : nouvelle règle · Dame : maître des questions · Roi : on remplit la coupe.",
    "Le maître du pouce, le maître des questions, les partenaires et les règles inventées restent valables jusqu'à ce qu'une autre carte les remplace. Ils s'affichent en bas de l'écran.",
    "Quelqu'un enfreint une règle ? Touche « Quelqu'un a enfreint une règle ? » et son prénom.",
    "Le 4e roi boit la King's Cup (en mode sans alcool : un gage XXL) et la partie s'arrête. En option, on joue tout le paquet.",
    "Sans alcool (mode Soft ou profil sans alcool), chaque « bois » devient un gage."
  ], [
    "Lay out a 52-card deck. On your turn, draw a card: its value triggers a rule.",
    "Ace: waterfall · 2: you (pick who takes it) · 3: me · 4: floor · 5: thumb master · 6: never have I ever · 7: heaven · 8: mate · 9: rhymes · 10: categories · Jack: new rule · Queen: question master · King: fill the cup.",
    "Thumb master, question master, mates and made-up rules stay in play until another card replaces them. They're shown at the bottom of the screen.",
    "Someone broke a rule? Tap \"Someone broke a rule?\" and their name.",
    "The 4th king drinks the King's Cup (alcohol-free: an XXL forfeit) and the game ends. Optionally, play the whole deck.",
    "Without alcohol (Soft mode or alcohol-free profile), every \"drink\" becomes a forfeit."
  ]),
  options: [
    { id: "fin", label: tr("Fin de partie", "Game end"), type: "seg", def: "roi4", values: [{ v: "roi4", label: tr("Au 4e roi", "At the 4th king") }, { v: "paquet", label: tr("Tout le paquet", "Whole deck") }] },
    { id: "hot", label: tr("Cartes", "Cards"), type: "toggle", text: tr("Ajouter le contenu Hot & Hard", "Add Hot & Hard content"), desc: tr("Je n'ai jamais et catégories coquins", "Naughty never-have-I-ever and categories"), hot: true, def: false }
  ],

  start(ctx, o){
    const deck = newDeck(); ctx.setPriv({ deck });
    return Object.assign(init(shuffle(ctx.ids), { hot: o.hot && SB.hard(), fin: o.fin }), { phase: "play" });
  },

  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    const actors = [s.cur, ctx.me].filter((x, i, a) => x && a.indexOf(x) === i);
    // Pénalités (n'importe quel joueur peut en signaler une).
    for(const id of ctx.ids){
      const i = ctx.input(id);
      if(i && i.pen && s.order.indexOf(i.pen) >= 0){ ctx.gage(withMates(s, "piege", [i.pen]), s.k + ":pen:" + id); ctx.set({ k: ctx.rid(), pen: i.pen }); return; }
    }
    for(const id of actors){
      if(id !== s.cur && ctx.here(s.cur)) continue; // l'hôte n'agit à la place du joueur que s'il est absent
      const i = ctx.input(id); if(!i) continue;
      if(s.step === "draw" && i.draw){
        const deck = A(ctx.priv().deck).slice(); const r = draw(s, deck); ctx.setPriv({ deck });
        if(r.gl.length) ctx.gage(r.gl, s.k + ":d");
        ctx.set(Object.assign(r.s, { k: ctx.rid(), pen: "" })); return;
      }
      if(s.step === "act" && (i.pick || i.rule)){
        const r = resolve(s, i); if(!r) continue;
        if(r.gl.length) ctx.gage(r.gl, s.k + ":a");
        ctx.set(Object.assign(r.s, { k: ctx.rid(), pen: "" })); return;
      }
      if(s.step === "next" && i.next){
        const n = next(s);
        if(n.done){ ctx.end({ title: s.kings >= 4 ? SB.both("La King's Cup est bue par " + ctx.name(s.cur) + " !", "The King's Cup is drunk by " + ctx.name(s.cur) + "!") : SB.both("Le paquet est fini", "The deck is done"), lines: [SB.both((52 - s.left) + " cartes tirées", (52 - s.left) + " cards drawn")], win: [] }); return; }
        ctx.set(Object.assign(n, { k: ctx.rid(), pen: "" })); return;
      }
    }
  },

  render(ctx, root){
    const s = ctx.s, hard = SB.hard(), nameOf = id => ctx.name(id), me = ctx.me;
    const canAct = me === s.cur || (ctx.isHost && !ctx.here(s.cur));
    const top = '<div class="kc-top"><span>' + tr("Cartes restantes : ", "Cards left: ") + "<b>" + s.left + "</b></span>" + kingsHTML(s.kings) + "</div>";
    const ru = s.card ? rule(s.card, { hard, hot: s.hot, who: nameOf(s.cur), kings: s.kings }) : null;
    let mid = "", dock = "";
    if(s.step === "draw"){
      mid = deckBackHTML() + '<p class="kc-res">' + (me === s.cur ? tr("À toi de tirer !", "Your turn to draw!") : tr("Au tour de " + esc(nameOf(s.cur)), esc(nameOf(s.cur)) + "'s turn")) + "</p>";
      dock = canAct ? SB.u.dock('<button class="btn acc" type="button" data-draw>' + tr("Tirer une carte", "Draw a card") + "</button>") : "";
    } else {
      const fresh = root.dataset.kcc !== String(s.left); root.dataset.kcc = String(s.left);
      mid = cardHTML(s.card, fresh) + '<div class="kc-rule"><b>' + esc(ru.t) + "</b><p>" + esc(ru.d) + "</p></div>";
      if(s.step === "act") mid += canAct ? actHTML(s, s.order, nameOf) : '<p class="wait" style="text-align:center">' + tr(esc(nameOf(s.cur)) + " choisit…", esc(nameOf(s.cur)) + " is choosing…") + "</p>";
      else { const rl = resLine(s, nameOf, hard); if(rl) mid += '<p class="kc-res">' + esc(rl) + "</p>"; dock = canAct ? SB.u.dock('<button class="btn acc" type="button" data-next>' + (s.done || s.left <= 0 ? tr("Terminer la partie", "End the game") : tr("Joueur suivant", "Next player")) + "</button>") : '<p class="wait" style="text-align:center">' + tr(esc(nameOf(s.cur)) + " passe au joueur suivant…", esc(nameOf(s.cur)) + " moves on…") + "</p>"; }
    }
    const pen = s.pen ? '<p class="sm" style="text-align:center; margin:0">' + esc(tr(nameOf(s.pen) + " a enfreint une règle.", nameOf(s.pen) + " broke a rule.")) + "</p>" : "";
    screen(root, "kc" + s.k + (canAct ? "a" : "w"), CSS + top + mid + pen + rolesHTML(s, nameOf) + penHTML(s.order, nameOf) + dock, r => {
      const d = r.querySelector("[data-draw]"); if(d) d.addEventListener("click", () => { buzz(12); d.disabled = true; ctx.send({ draw: 1 }); });
      const n = r.querySelector("[data-next]"); if(n) n.addEventListener("click", () => { buzz(8); n.disabled = true; ctx.send({ next: 1 }); });
      if(s.step === "act" && canAct) bindAct(r, s, a => { buzz(10); ctx.send(a); });
      r.querySelectorAll("[data-kpen]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ pen: b.dataset.kpen }); r.querySelector(".kc-pen").open = false; }));
    });
  },

  local: {
    players: { min: 2, max: 16 },
    start(root, api){
      const names = api.names, st0 = store();
      let fin = st0.kcFin === "paquet" ? "paquet" : "roi4", hot = !!st0.kcHot && SB.hard(), s = null, deck = [], gno = 0;
      const nameOf = n => n;
      function setup(){
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Posez le téléphone au milieu. À ton tour, tire une carte : sa valeur déclenche une règle. Le 4e roi boit la coupe.", "Put the phone in the middle. On your turn, draw a card: its value triggers a rule. The 4th king drinks the cup.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Fin de partie", "Game end") + '</span><div class="seg">' + [["roi4", tr("Au 4e roi", "At the 4th king")], ["paquet", tr("Tout le paquet", "Whole deck")]].map(x => '<button type="button" data-fin="' + x[0] + '" aria-pressed="' + (fin === x[0]) + '">' + x[1] + "</button>").join("") + "</div></div>" +
          (SB.hard() ? '<div class="field"><div class="packs"><button type="button" class="pack" data-hot aria-pressed="' + hot + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Hot & Hard", "Hot & Hard") + '</span><span class="ds">' + tr("Je n'ai jamais et catégories coquins", "Naughty never-have-I-ever and categories") + "</span></span></button></div></div>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button>"), r => {
          r.querySelectorAll("[data-fin]").forEach(b => b.addEventListener("click", () => { fin = b.dataset.fin; persist({ kcFin: fin }); setup(); }));
          const h = r.querySelector("[data-hot]"); if(h) h.addEventListener("click", () => { hot = !hot; persist({ kcHot: hot }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => { deck = newDeck(); s = init(shuffle(names), { hot, fin }); gno++; draw0(); });
        });
      }
      const gage = (gl, tag) => { if(gl.length && api.gage) api.gage(gl, "kc" + gno + ":" + (52 - s.left) + ":" + tag); };
      function draw0(){ show(); }
      function show(){
        const hard = SB.hard(), ru = s.card ? rule(s.card, { hard, hot: s.hot, who: s.cur, kings: s.kings }) : null;
        const top = '<div class="kc-top"><span>' + tr("Cartes restantes : ", "Cards left: ") + "<b>" + s.left + "</b></span>" + kingsHTML(s.kings) + "</div>";
        let mid = "", dock = "";
        if(s.step === "draw"){
          mid = deckBackHTML() + '<p class="kc-res">' + tr("À " + esc(s.cur) + " de tirer !", esc(s.cur) + "'s turn to draw!") + "</p>";
          dock = SB.u.dock('<button class="btn acc" type="button" data-draw>' + tr("Tirer une carte", "Draw a card") + "</button>");
        } else {
          const fresh = root.dataset.kcc !== String(s.left); root.dataset.kcc = String(s.left);
          mid = cardHTML(s.card, fresh) + '<div class="kc-rule"><b>' + esc(ru.t) + "</b><p>" + esc(ru.d) + "</p></div>";
          if(s.step === "act") mid += actHTML(s, s.order, nameOf);
          else { const rl = resLine(s, nameOf, hard); if(rl) mid += '<p class="kc-res">' + esc(rl) + "</p>"; dock = SB.u.dock('<button class="btn acc" type="button" data-next>' + (s.done || s.left <= 0 ? tr("Terminer la partie", "End the game") : tr("Joueur suivant", "Next player")) + "</button>"); }
        }
        screen(root, "kc" + gno + ":" + (52 - s.left) + s.step, CSS + top + mid + rolesHTML(s, nameOf) + penHTML(s.order, nameOf) + dock, r => {
          const d = r.querySelector("[data-draw]"); if(d) d.addEventListener("click", () => { buzz(12); const x = draw(s, deck); s = x.s; gage(x.gl, "d"); show(); });
          const n = r.querySelector("[data-next]"); if(n) n.addEventListener("click", () => {
            buzz(8); const x = next(s);
            if(x.done){ if(api.win) api.win([]); end(); return; }
            s = x; show();
          });
          if(s.step === "act") bindAct(r, s, a => { const x = resolve(s, a); if(!x) return; buzz(10); s = x.s; gage(x.gl, "a"); show(); });
          r.querySelectorAll("[data-kpen]").forEach(b => b.addEventListener("click", () => { buzz(8); gage(withMates(s, "piege", [b.dataset.kpen]), "p" + Math.random()); SB.u.toast(tr(b.dataset.kpen + " a enfreint une règle.", b.dataset.kpen + " broke a rule.")); r.querySelector(".kc-pen").open = false; }));
        });
      }
      function end(){
        screen(root, "end" + gno, CSS + '<div class="kc-rule"><b>' + (s.kings >= 4 ? tr("La coupe est bue !", "The cup is drunk!") : tr("Le paquet est fini", "The deck is done")) + "</b><p>" + tr((52 - s.left) + " cartes tirées.", (52 - s.left) + " cards drawn.") + "</p></div>" +
          SB.u.dock('<div class="row"><button class="btn ghost" type="button" data-again>' + tr("Rejouer", "Play again") + '</button><button class="btn acc" type="button" data-exit>' + tr("Changer de jeu", "Pick another game") + "</button></div>"), r => {
          r.querySelector("[data-again]").addEventListener("click", () => setup());
          r.querySelector("[data-exit]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
})();
