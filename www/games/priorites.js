/* Priorités — un joueur classe 5 trucs au hasard en secret, les autres devinent son ordre. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz } = SB.u;

// Tout et n'importe quoi : objets, gens, situations, petits plaisirs et grosses galères
const CLASSIQUE = [
  "Les lundis","Le wifi des gares","Les pigeons","Les chaussettes dépareillées","L'autotune","La raclette","Les plantes vertes","Le ketchup","Les profs de sport",
  "Les réveils","Le Nutella","Les clowns","Les mariages","Les vocaux de 5 minutes","Les belles-mères","Les ronds-points","Les licornes","Les impôts","Les Crocs",
  "Les selfies","La pluie","Le RER B","Les dauphins","Les trottinettes électriques","Les feux d'artifice","Le café","Les tongs","Les hamsters","Les sushis",
  "Les réunions Teams","Les influenceurs","La pizza ananas","Le karaoké","Les poneys","Le dentiste","Les ex","Les chiens qui aboient la nuit","Le fromage qui pue",
  "Les bisous baveux","La neige","Les soldes","Le Monopoly","Les chats","Les PowerPoint","Les voisins bruyants","Les anniversaires surprise",
  "Les bébés qui pleurent dans l'avion","Les nains de jardin","Les cactus","Les tubes de l'été","Les montagnes russes","Les bouchons sur le périph",
  "Les mots de passe oubliés","Le haut-parleur dans le métro","Le pastis","Les escargots","Les zombies","Les dinosaures","Les sacs Ikea","Les capybaras",
  "Les chips au vinaigre","Les dimanches soir","Les doudounes sans manches","Les apéros qui finissent à 6 h","Les blagues de papa","Les moustiques",
  "Les comédies romantiques","Les arnaques par SMS","Les siestes","Le camping sous la pluie",
  "Se lever à 5 h tous les matins","Un mois sans téléphone","Un massage d'une heure","Les huîtres","Chanter seul au karaoké","Un câlin de grand-mère",
  "Gagner 1 000 €","Dormir 12 heures d'affilée","Un saut en parachute","Les araignées","Le métro à l'heure de pointe","Une soirée Netflix sous la couette",
  "Le prénom de ton ex tatoué sur le bras","Le brocoli","Ne plus jamais manger de fromage","Un road trip entre potes","Une heure dans une file d'attente",
  "Un dîner avec ta belle-famille","Un chiot","Le sport à 7 h du matin","Une pizza à 2 h du matin","Un concert au premier rang","Les cours de maths",
  "Un week-end sans réseaux sociaux","Les cris de mouettes","Une coupe de cheveux ratée","Retrouver 20 € dans une poche","Le ménage de printemps",
  "Un selfie avec ta star préférée","Les embouteillages","Se faire larguer par SMS","Une bataille de boules de neige","Le pain chaud du matin",
  "Les bouchons de bouteille qui ne s'ouvrent pas","Un voyage en avion de 12 heures","Une glace en été","Le bruit de la craie sur un tableau",
  "Les fêtes de village","Le chant des grillons","Les bains moussants","Les lasagnes de mamie","Les jeux de société qui finissent en dispute","Les répondeurs automatiques",
  "Les pulls de Noël moches","Les tartines qui tombent côté beurre","Les marchés du dimanche","Les escape games","Les panneaux « peinture fraîche »","Les chaises qui grincent",
  "Les feux de camp","Les coussins péteurs","Les guirlandes lumineuses","Les cours de yoga","Les vide-greniers","Le bruit des couverts sur une assiette","Les parcs aquatiques",
  "Les canapés trop mous","Les crêpes de la Chandeleur","Les orages d'été","Les mouchoirs oubliés dans la machine","Les lunettes de soleil miroir","Les cabanes dans les arbres",
  "Faire quatre bises à tout le monde","Les visios qui coupent","Les escalators en panne","Les goûters d'anniversaire","Les fourmis dans la cuisine","Les parapluies retournés par le vent",
  "Les marshmallows grillés","Les bandes-annonces qui racontent tout le film","Les cartes postales","Les mots croisés","Les mouettes qui volent les frites",
  "Les bouées géantes en forme d'animal","Les douches froides","Les coups de soleil","Les livres de 900 pages","Les fins de séries décevantes","Les soirées pyjama",
  "Les selfies de groupe ratés","Les chewing-gums collés sous les tables","Le pop-corn au cinéma","Les tickets de caisse d'un mètre","Les vocaux écoutés en accéléré",
  "Les visites de musées","Les déménagements","Les plats trop salés","Les chats qui font tomber des objets","Les bonnets à pompon","Les après-midi au bord d'un lac",
  "Faire la vaisselle à la main","Gagner un concours de pétanque","Un pique-nique au soleil","Rater son train de deux minutes","Trouver une place de parking du premier coup",
  "Recevoir une lettre écrite à la main","Monter un meuble sans notice","Une soirée jeux vidéo jusqu'à l'aube","Une nuit dans un hôtel de glace","Une journée sans électricité",
  "Danser seul dans sa cuisine","Un petit-déjeuner au lit","Se perdre dans une ville inconnue","Un tour en montgolfière"
];
const ADULTE = [
  "Un plan à trois","Les préliminaires","Le sexe au réveil","Les menottes","Un strip-tease","Un nude envoyé au mauvais groupe","Le porno","Un plan cul régulier",
  "Coucher le premier soir","Le sexe dans la douche","Les applis de rencontre","Un club libertin","Une nuit avec ton crush","Le dirty talk","Les sex toys",
  "Le sexe en public","Se faire surprendre par ses parents","Les suçons","Une fessée","Le walk of shame","Un ex qui écrit à 3 h du matin","Une gueule de bois",
  "Un black-out total","Ton propre enterrement","Ton testament","Être réincarné en moustique","Mourir de rire","Une partouze","La lingerie","Le sexting",
  "Un plan d'un soir raté","Simuler","Un rendez-vous Tinder catastrophique","Faire l'amour dans une voiture","La levrette","Un massage qui dérape",
  "Embrasser un inconnu en soirée","Un jeu de rôle coquin","Le missionnaire","Se réveiller à côté d'un inconnu",
  "Les rendez-vous à l'aveugle","Un bisou sous le gui","Un slow à un mariage","Le premier message après un rencard","Les photos de profil trompeuses","Un massage aux huiles",
  "Les draps en satin","Le jacuzzi à deux","Un week-end en amoureux","Une déclaration d'amour en public","Un ex qui like une vieille photo","La lingerie en dentelle",
  "Les jeux à boire qui dérapent","Le strip-poker","Les bisous dans le cou","Le réveil après une nuit blanche","Les mots doux au téléphone","Se faire draguer au supermarché",
  "Les sextos pleins de fautes d'orthographe","Le premier rendez-vous chez les parents","Les miroirs au plafond"
];
const PACKS = [
  { v: "classique", label: "Tout et n'importe quoi", desc: "Objets, gens, galères, petits plaisirs", list: CLASSIQUE },
  { v: "adulte", label: "Adultes", desc: "Sexe, porno, tabous, humour noir : tout le contenu adulte", list: ADULTE, hot: true }
];
const SEEN = "priorites:t";
function pool(packs){ const sel = A(packs); const p = PACKS.filter(x => sel.indexOf(x.v) >= 0).flatMap(x => x.list); return p.length ? p : CLASSIQUE; }
// Tire n trucs en tête de paquet (les jamais vus d'abord).
function drawN(deck, packs, n){
  let d = A(deck).slice(); if(d.length < n) d = SB.u.fresh(SEEN, pool(packs), true);
  const five = d.splice(0, n); SB.u.saw(SEEN, five); return { five, deck: d };
}
function correct(a, b){ let c = 0; for(let i = 0; i < a.length; i++) if(a[i] !== undefined && a[i] === b[i]) c++; return c; }
function validOrder(o, n){ return o && typeof o.o === "string" && o.o.length === n && new RegExp("^[0-" + (n - 1) + "]+$").test(o.o) && new Set(o.o.split("")).size === n; }
// Coups de théâtre : un par manche au maximum, jamais à la première.
const TW = [
  { id: "rev", name: "Le pire d'abord", desc: "On classe à l'envers : du plus détesté (1) au préféré." },
  { id: "six", name: "Manche à six", desc: "Six trucs à classer au lieu de cinq." },
  { id: "x2", name: "Points doublés", desc: "Tous les points de la manche comptent double." },
  { id: "edges", name: "Les extrêmes", desc: "Seuls la 1re et la dernière place comptent : 2 points chacune, +1 si les deux sont justes." },
  { id: "mate", name: "Invité surprise", desc: "Un des trucs à classer est un joueur du groupe.", ok: o => o.n >= 3 },
  { id: "ally", name: "Complicité", desc: "Celui qui classe marque autant que le meilleur devin, au lieu de la moyenne.", ok: o => o.n >= 3 }
];
const TWL = TW.filter(t => t.id !== "ally").concat([{ id: "turns", name: "Chacun son tour", desc: "Pas de débat : chaque joueur, à tour de rôle, place un seul truc." }]);
function scoreGuess(g, o, tw){
  const n = o.length, c = correct(g, o);
  let base, bonus = 0;
  if(tw === "edges"){ const e1 = g[0] === o[0], e2 = g[n - 1] === o[n - 1]; base = (e1 ? 2 : 0) + (e2 ? 2 : 0); bonus = e1 && e2 ? 1 : 0; }
  else { base = c; bonus = c === n ? 3 : 0; }
  const m = tw === "x2" ? 2 : 1;
  return { c, base, pts: (base + bonus) * m, max: (tw === "edges" ? 5 : n + 3) * m };
}
function itemsFor(packs, deck, tw, mates){
  const n = tw === "six" ? 6 : 5, d = drawN(deck, packs, n);
  if(tw === "mate" && mates.length){ d.five[Math.floor(Math.random() * n)] = SB.u.pick(mates); }
  return d;
}
const FL = {
  win: ["Classement final", "Le plus fin psychologue", "Lit dans les pensées", "Champion des priorités"],
  open: ["Le livre ouvert", "Transparent comme du verre", "Zéro mystère"],
  myst: ["Le mystère", "L'énigme du groupe", "Impossible à cerner"],
  med: ["Le médium", "Boule de cristal", "Sixième sens"]
};
function fl(list, seed, k){ return list[((seed || 0) + k) % list.length]; }
const CSS = '<style>.pr-list{display:flex; flex-direction:column; gap:8px}' +
  '.pr-it{display:flex; align-items:center; gap:12px; width:100%; text-align:left; border:2px solid var(--line); background:var(--card); border-radius:14px; padding:12px 14px; font-weight:700; font-size:17px; min-height:58px}' +
  '.pr-it .n{width:34px; height:34px; flex:none; border-radius:50%; display:grid; place-items:center; font-family:var(--f-hand); font-size:24px; font-weight:700; background:var(--soft); color:var(--muted)}' +
  '.pr-it.on{border-color:var(--acc)}.pr-it.on .n{background:var(--acc); color:var(--on-acc)}' +
  '.pr-it .t{flex:1; min-width:0; overflow-wrap:anywhere}' +
  '.pr-scale{display:flex; justify-content:space-between; font-size:13px; color:var(--muted); font-weight:600}' +
  '.pr-ok{color:var(--ok); font-weight:800}.pr-ko{color:var(--muted); text-decoration:line-through}' +
  '.pr-row{background:var(--card); border:1.5px solid var(--line); border-radius:12px; padding:10px 14px; display:flex; flex-direction:column; gap:6px}' +
  '.pr-row .h{display:flex; justify-content:space-between; font-weight:800}.pr-row .h span:last-child{color:var(--acc); font-family:var(--f-hand); font-size:26px; line-height:1}' +
  '.pr-mini{display:flex; flex-wrap:wrap; gap:4px}.pr-mini span{font-size:12px; font-weight:700; padding:3px 8px; border-radius:8px; background:var(--soft)}' +
  '.pr-mini span.ok{background:var(--ok); color:var(--bg)}</style>';

/* Sélection par touches successives : 1er touché = rang 1 */
function orderPicker(root, items, onSubmit, submitLabel){
  let order = [];
  const n = items.length, box = root.querySelector("[data-picker]"), go = root.querySelector("[data-submit]"), reset = root.querySelector("[data-reset]");
  const draw = () => {
    box.innerHTML = items.map((it, i) => { const p = order.indexOf(i); return '<button type="button" class="pr-it' + (p >= 0 ? " on" : "") + '" data-i="' + i + '"><span class="n">' + (p >= 0 ? p + 1 : "") + '</span><span class="t">' + esc(it) + "</span></button>"; }).join("");
    box.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.i, p = order.indexOf(i);
      if(p >= 0) order.splice(p, 1); else order.push(i);
      buzz(6); draw();
    }));
    go.disabled = order.length !== n;
    go.textContent = order.length === n ? submitLabel : "Touche les " + n + " dans l'ordre (" + order.length + " / " + n + ")";
    if(reset) reset.hidden = !order.length;
  };
  go.addEventListener("click", () => { if(order.length === n){ go.disabled = true; onSubmit(order.join("")); } });
  if(reset) reset.addEventListener("click", () => { order = []; draw(); });
  draw();
}
function scaleHTML(tw, n){
  const a = "1 · Ce que tu préfères", b = n + " · Ce que tu détestes";
  return '<div class="pr-scale"><span>' + (tw === "rev" ? "1 · Ce que tu détestes" : a) + "</span><span>" + (tw === "rev" ? n + " · Ce que tu préfères" : b) + "</span></div>";
}
function pickerHTML(lead, tw, n){
  return CSS + lead + scaleHTML(tw, n) + '<div class="pr-list" data-picker></div>' +
    dock('<button class="btn acc" type="button" data-submit disabled></button><button class="link" type="button" data-reset hidden style="align-self:center">Recommencer le classement</button>');
}
function orderList(items, ord){ return '<div class="pr-list">' + String(ord).split("").map((x, k) => '<div class="pr-it on"><span class="n">' + (k + 1) + '</span><span class="t">' + esc(items[+x]) + "</span></div>").join("") + "</div>"; }
function packsHTML(sel){ return '<div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>"; }

function roundOf(c, round, ri, last){
  const t = c.opts.twists !== false && round > 1 ? SB.u.twist(TW, { last, n: c.ids.length, rate: .4 }) : null, tw = t ? t.id : "";
  const ranker = c.players[ri].id, mates = c.players.filter(p => p.id !== ranker).map(p => p.name);
  const d = itemsFor(c.opts.packs, c.priv().deck, tw, mates); c.setPriv({ deck: d.deck });
  return { phase: "play", round, ri, ranker, items: d.five, tw, order: "", guesses: {}, pts: {}, k: c.rid() };
}

SB.register({
  id: "priorites", name: "Priorités", glyph: "1·2·3", pitch: "Devine dans quel ordre ton pote classe 5 trucs.", hot: true,
  accent: { light: "#ffd25e", dark: "#ffd25e" },
  tag: "Un joueur classe 5 trucs au hasard, du préféré au plus détesté. Les autres doivent deviner son ordre.",
  min: 2, max: 16,
  rules: [
    "À chaque manche, un joueur reçoit 5 trucs au hasard : la raclette, les pigeons, un saut en parachute…",
    "Il les classe en secret, de ce qu'il préfère (1) à ce qu'il déteste le plus (5).",
    "Pendant ce temps, les autres devinent son classement sur leur téléphone.",
    "1 point par place devinée, +3 pour un sans-faute. Celui qui classe marque la moyenne des bonnes réponses : il faut être prévisible !",
    "Coups de théâtre : classement à l'envers, manche à six, les extrêmes, invité surprise, complicité, points doublés. Les trucs déjà vus reviennent en dernier."
  ],
  options: [
    { id: "packs", label: "Paquets", type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "laps", label: "Manches", type: "seg", def: 1, values: [{ v: 1, label: "1 par joueur" }, { v: 2, label: "2 par joueur" }] },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "De temps en temps, une règle change pour une manche", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet.");
    ctx.setPriv({ deck: SB.u.fresh(SEEN, pool(o.packs), true) });
    const ri = Math.floor(Math.random() * ctx.players.length);
    return Object.assign(roundOf(ctx, 1, ri, ""), { rounds: ctx.players.length * (o.laps || 1), scores: {}, known: {}, sf: {} });
  },
  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    const items = A(s.items), n = items.length, tw = s.tw || "";
    const r = ctx.input(s.ranker);
    if(!validOrder(r, n)) return;
    const guessers = ctx.ids.filter(id => id !== s.ranker && ctx.here(id));
    if(!guessers.every(id => validOrder(ctx.input(id), n))) return;
    const guesses = {}, pts = {}, scores = Object.assign({}, s.scores || {}), sf = Object.assign({}, s.sf || {}); let sum = 0, sumB = 0, best = 0;
    guessers.forEach(id => {
      const g = ctx.input(id).o, x = scoreGuess(g, r.o, tw);
      guesses[id] = g; pts[id] = x.pts; sum += x.c; sumB += x.base; best = Math.max(best, x.pts);
      scores[id] = (scores[id] || 0) + x.pts; if(x.c === n) sf[id] = (sf[id] || 0) + 1;
    });
    const avg = guessers.length ? Math.round(sumB / guessers.length) * (tw === "x2" ? 2 : 1) : 0;
    const rk = tw === "ally" ? best : avg;
    pts[s.ranker] = rk; scores[s.ranker] = (scores[s.ranker] || 0) + rk;
    const known = Object.assign({}, s.known || {}), k0 = A(known[s.ranker]);
    known[s.ranker] = [(k0[0] || 0) + sum * 5 / n, (k0[1] || 0) + guessers.length];
    ctx.set({ phase: "reveal", order: r.o, guesses, pts, scores, known, sf });
  },
  render(ctx, root){
    const s = ctx.s, items = A(s.items), n = items.length, isR = s.ranker === ctx.me, rn = ctx.name(s.ranker), tw = s.tw || "";
    const lab = '<span class="eyebrow">Manche ' + s.round + " / " + s.rounds + " · " + esc(rn) + " classe</span>" + SB.u.twistHTML(SB.u.byTwist(TW, tw));
    const nextRound = c => {
      const st = c.s;
      if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
      let ri = (st.ri + 1) % c.players.length;
      for(let t = 0; t < c.players.length && !c.here(c.players[ri].id); t++) ri = (ri + 1) % c.players.length;
      c.set(roundOf(c, st.round + 1, ri, st.tw));
    };
    if(s.phase === "play"){
      const mine = ctx.mine();
      if(mine && mine.o){
        const live = ctx.ids.filter(id => ctx.here(id));
        screen(root, "w" + s.k, CSS + lab + '<div class="pass" style="min-height:24vh"><span class="eyebrow">' + (isR ? "Ton classement est enregistré" : "Ta prédiction est enregistrée") + '</span><div class="who">Suspense…</div><p>On attend les autres.</p></div>' +
          '<div class="field"><span class="eyebrow">Prêts</span><div class="chips" data-chips></div></div>' +
          (ctx.isHost ? dock('<button class="link warn" type="button" data-skip hidden style="align-self:center">' + esc(rn) + " est parti, passer la manche</button>") : ""), r => {
          const sk = r.querySelector("[data-skip]"); if(sk) sk.addEventListener("click", () => ctx.act(nextRound));
        });
        const chips = live.map(id => { const i = ctx.input(id), ok = !!(i && i.o); return '<span class="chip' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + esc(ctx.name(id)) + (id === s.ranker ? " (classe)" : "") + "</span>"; }).join("");
        const ch = root.querySelector("[data-chips]"); if(ch && ch.innerHTML !== chips) ch.innerHTML = chips;
        const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = ctx.here(s.ranker);
      } else {
        const dir = tw === "rev" ? "du plus détesté au préféré" : "du préféré au plus détesté";
        screen(root, "p" + s.k + isR, pickerHTML(lab + (isR ? '<p class="big">À toi de classer !</p><p class="sm">Touche les ' + n + " trucs dans l'ordre, " + dir + ". Les autres essaient de deviner.</p>"
          : '<p class="big">Comment ' + esc(rn) + " les classe ?</p><p class=\"sm\">Touche les " + n + " trucs dans l'ordre où, selon toi, " + esc(rn) + " les classe (" + dir + ").</p>"), tw, n), r => {
          orderPicker(r, items, o => ctx.send({ o }), isR ? "Valider mon classement" : "Valider ma prédiction");
        });
      }
    } else if(s.phase === "reveal"){
      const ord = String(s.order || ""), g = s.guesses || {}, pts = s.pts || {};
      const rows = Object.keys(g).sort((a, b) => (pts[b] || 0) - (pts[a] || 0));
      screen(root, "r" + s.k + ctx.isHost, CSS + lab + '<span class="eyebrow">Le vrai classement de ' + esc(rn) + "</span>" + scaleHTML(tw, n) + orderList(items, ord) +
        '<div class="field"><span class="eyebrow">Les prédictions</span>' + rows.map(id => { const gs = String(g[id]); return '<div class="pr-row"><div class="h"><span>' + esc(ctx.name(id)) + "</span><span>+" + (pts[id] || 0) + '</span></div><div class="pr-mini">' +
          gs.split("").map((x, k) => '<span class="' + (x === ord[k] ? "ok" : "") + '">' + (k + 1) + ". " + esc(items[+x]) + "</span>").join("") + "</div></div>"; }).join("") +
        '<p class="sm">' + esc(rn) + " marque " + (pts[s.ranker] || 0) + " point" + ((pts[s.ranker] || 0) > 1 ? "s" : "") + (tw === "ally" ? " (autant que le meilleur devin)." : " (moyenne des bonnes réponses).") + "</p></div>" +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Voir le classement final" : "Manche suivante") + "</button>") : dock('<p class="wait">L\'hôte lance la suite…</p>')), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "reveal") nextRound(c); }));
      });
    } else if(s.phase === "end"){
      const sc = s.scores || {}, kn = s.known || {}, sf = s.sf || {}, ids = ctx.ids.slice().sort((a, b) => (sc[b] || 0) - (sc[a] || 0));
      const read = ctx.ids.filter(id => A(kn[id])[1]).sort((a, b) => A(kn[b])[0] / A(kn[b])[1] - A(kn[a])[0] / A(kn[a])[1]);
      const med = ctx.ids.slice().sort((a, b) => (sf[b] || 0) - (sf[a] || 0))[0];
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + esc(fl(FL.win, s.fl, 0)) + '</span><div class="who">' + esc(ctx.name(ids[0])) + "</div>" +
        '<div class="bars">' + ids.map(id => '<div class="bar"><div class="lb"><span>' + esc(ctx.name(id)) + "</span><span>" + (sc[id] || 0) + ' pts</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (sc[id] || 0) / Math.max(1, sc[ids[0]] || 1)) + '%"></div></div></div>').join("") + "</div>" +
        (read.length ? '<div class="card"><span class="eyebrow">' + esc(fl(FL.open, s.fl, 1)) + '</span><div class="big">' + esc(ctx.name(read[0])) + '</div><span class="sm">Le plus facile à deviner</span></div>' : "") +
        (read.length > 1 ? '<div class="card"><span class="eyebrow">' + esc(fl(FL.myst, s.fl, 2)) + '</span><div class="big">' + esc(ctx.name(read[read.length - 1])) + '</div><span class="sm">Le plus imprévisible</span></div>' : "") +
        (sf[med] ? '<div class="card"><span class="eyebrow">' + esc(fl(FL.med, s.fl, 3)) + '</span><div class="big">' + esc(ctx.name(med)) + '</div><span class="sm">' + sf[med] + " sans-faute</span></div>" : "") +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-back>Retour au salon</button>') : dock('<p class="wait">L\'hôte va vous ramener au salon.</p>')), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const s2 = c.s.scores || {}, o2 = c.ids.slice().sort((a, b2) => (s2[b2] || 0) - (s2[a] || 0)), mx = s2[o2[0]] || 0;
          c.end({ title: "Priorités · " + c.name(o2[0]) + " gagne", lines: o2.map(id => c.name(id) + " · " + (s2[id] || 0) + " pts"), win: mx ? o2.filter(id => (s2[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : version coopérative ---------- */
  local: {
    players: { min: 2, max: 12 },
    start(root, api){
      const names = api.names;
      let sel = A(store().prPacks).length ? A(store().prPacks).slice() : ["classique"], twOn = store().prTw !== false;
      let L = { phase: "setup", ri: 0, round: 0, rounds: names.length, deck: [], items: [], order: "", guess: "", score: 0, max: 0, tw: null, gain: 0 };
      const newItems = () => {
        L.tw = twOn && L.round > 1 ? SB.u.twist(TWL, { last: L.tw ? L.tw.id : "", n: names.length, rate: .4 }) : null;
        const d = itemsFor(sel, L.deck, L.tw ? L.tw.id : "", names.filter((_, i) => i !== L.ri)); L.items = d.five; L.deck = d.deck;
      };
      const go = () => {
        const rn = names[L.ri], tw = L.tw ? L.tw.id : "", n = L.items.length;
        const lab = '<span class="eyebrow">Manche ' + L.round + " / " + L.rounds + " · score du groupe " + L.score + "</span>" + (L.phase === "pass" || L.phase === "group" ? SB.u.twistHTML(L.tw) : "");
        const dir = tw === "rev" ? "du plus détesté au préféré" : "du préféré au plus détesté";
        if(L.phase === "setup"){
          screen(root, "setup" + sel.join() + twOn, CSS + '<p class="howto">Version coopérative : à chaque manche, un joueur classe en secret, puis le groupe devine son classement ensemble.</p>' +
            '<div class="field"><span class="eyebrow">Paquets</span>' + packsHTML(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">Variante</span><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">De temps en temps, une règle change pour une manche</span></span></button></div></div>' +
            dock('<button class="btn acc" type="button" data-go>Commencer</button>'), r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ prPacks: sel }); go(); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ prTw: twOn }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!sel.length){ SB.u.toast("Choisis au moins un paquet"); return; }
              L.deck = SB.u.fresh(SEEN, pool(sel), true); L.round = 1; L.score = 0; L.max = 0; L.tw = null; L.ri = Math.floor(Math.random() * names.length);
              newItems(); L.phase = "pass"; go();
            });
          });
        } else if(L.phase === "pass"){
          screen(root, "pa" + L.round, lab + '<div class="pass"><span class="eyebrow">Passe le téléphone à</span><div class="who">' + esc(rn) + "</div><p>Classe les " + n + " trucs en secret, " + dir + ". Les autres ne regardent pas.</p></div>" +
            dock('<button class="btn acc" type="button" data-n>C\'est moi, je classe</button>'), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "rank"; go(); }); });
        } else if(L.phase === "rank"){
          screen(root, "rk" + L.round, pickerHTML(lab + '<p class="big">' + esc(rn) + ", classe-les !</p>", tw, n), r => {
            orderPicker(r, L.items, o => { L.order = o; L.phase = "group"; go(); }, "Valider et cacher");
          });
        } else if(L.phase === "group"){
          screen(root, "gr" + L.round, pickerHTML(lab + '<p class="big">À vous : comment ' + esc(rn) + " les a classés ?</p><p class=\"sm\">" + (tw === "turns" ? "Chacun son tour, sans débattre : chaque joueur place un seul truc. " : "Discutez, puis touchez les " + n + " trucs dans l'ordre. ") + esc(rn) + " ne dit rien !</p>", tw, n), r => {
            orderPicker(r, L.items, o => { L.guess = o; const x = scoreGuess(o, L.order, tw); L.gain = x.pts; L.score += x.pts; L.max += x.max; L.phase = "reveal"; go(); }, "Valider notre prédiction");
          });
        } else if(L.phase === "reveal"){
          const c = correct(L.guess, L.order);
          screen(root, "rv" + L.round, CSS + lab + '<div class="verdict">' + (c === n ? "Sans-faute ! +" + L.gain : c + " / " + n + " · +" + L.gain) + '</div><span class="eyebrow">Le vrai classement de ' + esc(rn) + "</span>" + scaleHTML(tw, n) + orderList(L.items, L.order) +
            '<div class="field"><span class="eyebrow">Votre prédiction</span><div class="pr-mini">' + L.guess.split("").map((x, k) => '<span class="' + (x === L.order[k] ? "ok" : "") + '">' + (k + 1) + ". " + esc(L.items[+x]) + "</span>").join("") + "</div></div>" +
            dock('<button class="btn acc" type="button" data-n>' + (L.round >= L.rounds ? "Voir le score final" : "Manche suivante") + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(L.round >= L.rounds){ L.phase = "end"; go(); return; }
              L.round++; L.ri = (L.ri + 1) % names.length; newItems(); L.phase = "pass"; go();
            });
          });
        } else if(L.phase === "end"){
          const pct = L.max ? L.score / L.max : 0;
          if(pct >= .6) api.win(names);
          screen(root, "end" + L.score, CSS + '<span class="eyebrow">Score du groupe</span><div class="report"><span class="n">' + L.score + '</span><span class="o">/' + L.max + '</span></div><p class="appre">« ' +
            (pct >= .7 ? "Vous vous connaissez par cœur." : pct >= .45 ? "Pas mal, quelques surprises quand même." : "Vous êtes sûrs d'être amis ?") + " »</p>" +
            (pct >= .6 ? '<p class="sm">Victoire collective : tout le monde marque une victoire au classement de la soirée.</p>' : "") +
            dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button>'), r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go();
    }
  }
});
})();
