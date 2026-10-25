/* Priorités — un joueur classe 5 trucs au hasard en secret, les autres devinent son ordre. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz } = SB.u;
const tr = SB.u.tr, TWLABEL = tr("Coup de théâtre", "Plot twist");

// Tout et n'importe quoi : objets, gens, situations, petits plaisirs et grosses galères
const CLASSIQUE = [
  "Les lundis","Le wifi des gares","Les pigeons","Les chaussettes dépareillées","L'autotune","La raclette","Les plantes vertes","Le ketchup","Les profs de sport",
  "Les réveils","Le Nutella","Les clowns","Les mariages","Les vocaux de 5 minutes","Les belles-mères","Les ronds-points","Les licornes","Les impôts","Les Crocs",
  "Les selfies","La pluie","Le RER B","Les dauphins","Les trottinettes électriques","Les feux d'artifice","Le café","Les tongs","Les hamsters","Les sushis",
  "Les réunions Teams","Les influenceurs","La pizza ananas","Le karaoké","Les poneys","Le dentiste","Les ex","Les chiens qui aboient la nuit","Le fromage qui pue",
  "Les bisous baveux","La neige","Les soldes","Le Monopoly","Les chats","Les PowerPoint","Les voisins bruyants","Les anniversaires surprise",
  "Les bébés qui pleurent dans l'avion","Les nains de jardin","Les cactus","Les tubes de l'été","Les montagnes russes","Les bouchons sur le périph",
  "Les mots de passe oubliés","Les gens qui mettent le haut-parleur dans le métro","Le pastis","Les escargots","Les zombies","Les dinosaures","Les sacs Ikea","Les capybaras",
  "Les chips au vinaigre","Les dimanches soir","Les doudounes sans manches","Les apéros qui finissent à 6 h","Les blagues de papa","Les moustiques",
  "Les comédies romantiques","Les arnaques par SMS","Les siestes","Le camping sous la pluie",
  "Se lever à 5 h tous les matins","Un mois sans téléphone","Un massage d'une heure","Les huîtres","Chanter seul au karaoké","Un câlin de grand-mère",
  "Gagner 1 000 €","Dormir 12 heures d'affilée","Un saut en parachute","Les araignées","Le métro à l'heure de pointe","Une soirée Netflix sous la couette",
  "Le prénom de ton ex tatoué sur le bras","Le brocoli","Ne plus jamais manger de fromage","Un road trip entre potes","Une heure dans une file d'attente",
  "Un dîner avec ta belle-famille","Un chiot","Le sport à 7 h du matin","Une pizza à 2 h du matin","Un concert au premier rang","Les cours de maths",
  "Un week-end sans réseaux sociaux","Les mouettes qui crient à 6 h du matin","Une coupe de cheveux ratée","Retrouver 20 € dans une poche","Le ménage de printemps",
  "Un selfie avec ta star préférée","Les aires d'autoroute","Se faire larguer par SMS","Une bataille de boules de neige","Le pain chaud du matin",
  "Les bocaux impossibles à ouvrir","Un voyage en avion de 12 heures","Une glace en été","Le bruit de la craie sur un tableau",
  "Les fêtes de village","Le chant des grillons","Les bains moussants","Les lasagnes de mamie","Les jeux de société qui finissent en dispute","Les répondeurs automatiques",
  "Les pulls de Noël moches","Les tartines qui tombent côté beurre","Les marchés du dimanche","Les escape games","Les panneaux « peinture fraîche »","Les chaises qui grincent",
  "Les feux de camp","Les coussins péteurs","Les guirlandes lumineuses","Les cours de yoga","Les vide-greniers","Le bruit des couverts sur une assiette","Les parcs aquatiques",
  "Les canapés trop mous","Les crêpes de la Chandeleur","Les orages d'été","Les mouchoirs oubliés dans la machine","Les lunettes de soleil miroir","Les cabanes dans les arbres",
  "Faire quatre bises à tout le monde","Les visios qui coupent","Les escalators en panne","Les goûters d'anniversaire","Les fourmis dans la cuisine","Les parapluies retournés par le vent",
  "Les marshmallows grillés","Les bandes-annonces qui racontent tout le film","Les cartes postales","Les mots croisés","Les goélands qui volent les frites",
  "Les bouées géantes en forme d'animal","Les douches froides","Les coups de soleil","Les livres de 900 pages","Les fins de séries décevantes","Les soirées pyjama",
  "Les selfies de groupe ratés","Les chewing-gums collés sous les tables","Le pop-corn au cinéma","Les tickets de caisse d'un mètre","Les vocaux écoutés en accéléré",
  "Les visites de musées","Les déménagements","Les plats trop salés","Les chats qui font tomber des objets","Les bonnets à pompon","Les après-midi au bord d'un lac",
  "Faire la vaisselle à la main","Gagner un concours de pétanque","Un pique-nique au soleil","Rater son train de deux minutes","Trouver une place de parking du premier coup",
  "Recevoir une lettre écrite à la main","Monter un meuble sans notice","Une soirée jeux vidéo jusqu'à l'aube","Une nuit dans un hôtel de glace","Une journée sans électricité",
  "Danser seul dans sa cuisine","Un petit-déjeuner au lit","Se perdre dans une ville inconnue","Un tour en montgolfière"
];
const ADULTE = [
  "Un plan à trois","Les préliminaires","Le sexe au réveil","Les menottes","Un strip-tease","Un nude envoyé dans le mauvais groupe","Le porno","Un plan cul régulier",
  "Coucher le premier soir","Le sexe dans la douche","Les applis de rencontre","Un club libertin","Une nuit avec ton crush","Le dirty talk","Les sex toys",
  "Le sexe en public","Se faire surprendre au lit par ses parents","Les suçons","Une fessée","Le walk of shame","Un ex qui écrit à 3 h du matin","Une gueule de bois",
  "Un black-out total","Ton propre enterrement","Ton testament","Être réincarné en moustique","Mourir de rire","Une partouze","Les porte-jarretelles","Le sexting",
  "Un plan d'un soir raté","Simuler","Un rencard Tinder catastrophique","Faire l'amour dans une voiture","La levrette","Un massage qui dérape",
  "Embrasser un inconnu en soirée","Un jeu de rôle coquin","Le missionnaire","Se réveiller à côté d'un inconnu",
  "Les rendez-vous à l'aveugle","Un bisou sous le gui","Un slow à un mariage","Le premier message après un rencard","Les photos de profil trompeuses","Un massage aux huiles",
  "Les draps en satin","Le jacuzzi à deux","Un week-end en amoureux","Une déclaration d'amour en public","Un ex qui like une vieille photo","La lingerie en dentelle",
  "Les jeux à boire qui dérapent","Le strip-poker","Les bisous dans le cou","Le petit-déj après une nuit torride","Les mots doux au téléphone","Se faire draguer au supermarché",
  "Les sextos pleins de fautes d'orthographe","La première rencontre avec les beaux-parents","Les miroirs au plafond"
];
// English decks (same packs)
const CLASSIQUE_EN = [
  "Mondays","Train station Wi-Fi","Pigeons","Mismatched socks","Autotune","Cheese fondue","Houseplants","Ketchup","Gym teachers",
  "Alarm clocks","Nutella","Clowns","Weddings","Five-minute voice notes","Mothers-in-law","Roundabouts","Unicorns","Taxes","Crocs",
  "Selfies","Rain","Rail replacement buses","Dolphins","Electric scooters","Fireworks","Coffee","Flip-flops","Hamsters","Sushi",
  "Teams meetings","Influencers","Pineapple on pizza","Karaoke","Ponies","The dentist","Exes","Dogs barking at night","Stinky cheese",
  "Slobbery kisses","Snow","Black Friday sales","Monopoly","Cats","PowerPoint presentations","Noisy neighbors","Surprise parties",
  "Babies crying on planes","Garden gnomes","Cacti","Summer hits","Roller coasters","Bumper-to-bumper traffic",
  "Forgotten passwords","People on speakerphone on the subway","Tequila shots","Escargots","Zombies","Dinosaurs","IKEA bags","Capybaras",
  "Salt and vinegar chips","Sunday nights","Puffer vests","House parties that end at 6 a.m.","Dad jokes","Mosquitoes",
  "Romcoms","Scam texts","Naps","Camping in the rain",
  "Getting up at 5 a.m. every day","A month without your phone","A one-hour massage","Oysters","Singing solo at karaoke","A hug from grandma",
  "Winning a thousand bucks","Sleeping 12 hours straight","A skydive","Spiders","The subway at rush hour","A Netflix night under a blanket",
  "Your ex's name tattooed on your arm","Broccoli","Never eating cheese again","A road trip with friends","An hour waiting in line",
  "Dinner with your in-laws","A puppy","7 a.m. workouts","Pizza at 2 a.m.","Front row at a concert","Math class",
  "A weekend with no social media","Seagulls screaming at 6 a.m.","A bad haircut","Finding 20 bucks in an old jacket","Spring cleaning",
  "A selfie with your favorite celebrity","Highway rest stops","Getting dumped by text","A snowball fight","Bread fresh out of the oven",
  "Jars that won't open","A 12-hour flight","Ice cream in summer","Nails on a chalkboard",
  "County fairs","Crickets chirping","Bubble baths","Grandma's lasagna","Board games that end in a fight","Automated phone menus",
  "Ugly Christmas sweaters","Toast landing butter-side down","Farmers' markets","Escape rooms","\"Wet paint\" signs","Creaky chairs",
  "Campfires","Whoopee cushions","Fairy lights","Yoga classes","Garage sales","Cutlery scraping on a plate","Water parks",
  "Couches that are way too soft","Pancake breakfasts","Summer thunderstorms","Tissues left in the washing machine","Mirrored sunglasses","Treehouses",
  "Greeting everyone with cheek kisses","Video calls that keep freezing","Broken escalators","Kids' birthday parties","Ants in the kitchen","Umbrellas flipped inside out by the wind",
  "Toasted marshmallows","Trailers that spoil the whole movie","Postcards","Crosswords","Seagulls stealing your fries",
  "Giant inflatable animal floats","Cold showers","Sunburns","900-page books","Disappointing series finales","Sleepovers",
  "Botched group selfies","Gum stuck under tables","Movie theater popcorn","Receipts as long as your arm","Voice notes on 2x speed",
  "Museum trips","Moving house","Oversalted food","Cats knocking things off tables","Pom-pom beanies","Afternoons by a lake",
  "Washing dishes by hand","Winning a mini-golf tournament","A picnic in the sun","Missing your train by two minutes","Finding a parking spot on the first try",
  "Getting a handwritten letter","Building furniture without instructions","Gaming until sunrise","A night in an ice hotel","A day without electricity",
  "Dancing alone in your kitchen","Breakfast in bed","Getting lost in a new city","A hot-air balloon ride"
];
const ADULTE_EN = [
  "A threesome","Foreplay","Morning sex","Handcuffs","A striptease","A nude sent to the wrong group chat","Porn","A regular booty call",
  "Sleeping together on the first date","Shower sex","Dating apps","A swingers' club","A night with your crush","Dirty talk","Sex toys",
  "Sex in public","Getting caught in bed by your parents","Hickeys","A spanking","The walk of shame","An ex texting you at 3 a.m.","A hangover",
  "A total blackout","Your own funeral","Your will","Being reincarnated as a mosquito","Dying of laughter","An orgy","Garter belts","Sexting",
  "A one-night stand gone wrong","Faking it","A disastrous Tinder date","Sex in a car","Doggy style","A massage that gets out of hand",
  "Making out with a stranger at a party","Naughty role-play","Missionary","Waking up next to a stranger",
  "Blind dates","A kiss under the mistletoe","A slow dance at a wedding","The first text after a date","Misleading profile pics","An oil massage",
  "Satin sheets","A hot tub for two","A romantic weekend away","A public declaration of love","An ex liking an old photo","Lace lingerie",
  "Drinking games that get out of hand","Strip poker","Kisses on the neck","Breakfast after a steamy night","Sweet nothings on the phone","Getting hit on at the supermarket",
  "Sexts full of typos","Meeting the in-laws for the first time","Mirrors on the ceiling"
];
// Contenu des parties : langue de l'hôte (s.lg) en réseau, langue du téléphone en local.
const LISTS = { fr: { classique: CLASSIQUE, adulte: ADULTE }, en: { classique: CLASSIQUE_EN, adulte: ADULTE_EN } };
const lists = lg => LISTS[lg === "en" ? "en" : "fr"];
const PACKS = [
  { v: "classique", label: tr("Tout et n'importe quoi", "Anything goes"), desc: tr("Objets, gens, galères, petits plaisirs", "Things, people, hassles, little pleasures"), list: lists(SB.lang()).classique, kid: true },
  { v: "adulte", label: tr("Adultes", "Adults"), desc: tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult stuff"), list: lists(SB.lang()).adulte, hot: true }
];
const SEEN = "priorites:t";
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; }; // mode Enfant : jamais de pool vide
function pool(packs, lg){ const L = lists(lg), sel = A(packs); const p = PACKS.filter(x => sel.indexOf(x.v) >= 0).flatMap(x => L[x.v]); return kidF(p.length ? p : L.classique); }
// Tire n trucs en tête de paquet (les jamais vus d'abord).
function drawN(deck, packs, n, lg){
  let d = A(deck).slice(); if(d.length < n) d = SB.u.fresh(SEEN, pool(packs, lg), true);
  const five = d.splice(0, n); SB.u.saw(SEEN, five); return { five, deck: d };
}
function correct(a, b){ let c = 0; for(let i = 0; i < a.length; i++) if(a[i] !== undefined && a[i] === b[i]) c++; return c; }
function validOrder(o, n){ return o && typeof o.o === "string" && o.o.length === n && new RegExp("^[0-" + (n - 1) + "]+$").test(o.o) && new Set(o.o.split("")).size === n; }
// Coups de théâtre : un par manche au maximum, jamais à la première.
const TW = [
  { id: "rev", name: tr("Le pire d'abord", "Worst first"), desc: tr("On classe à l'envers : du plus détesté (1) au préféré.", "Rank it backwards: from most hated (1) to favorite.") },
  { id: "six", name: tr("Manche à six", "Round of six"), desc: tr("Six trucs à classer au lieu de cinq.", "Six things to rank instead of five.") },
  { id: "x2", name: tr("Points doublés", "Double points"), desc: tr("Tous les points de la manche comptent double.", "Every point this round counts double.") },
  { id: "edges", name: tr("Les extrêmes", "The extremes"), desc: tr("Seuls la 1re et la dernière place comptent : 2 points chacune, +1 si les deux sont justes.", "Only first and last place count: 2 points each, +1 if you nail both.") },
  { id: "mate", name: tr("Invité surprise", "Surprise guest"), desc: tr("Un des trucs à classer est un joueur du groupe.", "One of the things to rank is a player from the group."), ok: o => o.n >= 3 },
  { id: "ally", name: tr("Complicité", "Partners in crime"), desc: tr("Celui qui classe marque autant que le meilleur devin, au lieu de la moyenne.", "The ranker scores as much as the best guesser instead of the average."), ok: o => o.n >= 3 }
];
const TWL = TW.filter(t => t.id !== "ally").concat([{ id: "turns", name: tr("Chacun son tour", "Take turns"), desc: tr("Pas de débat : chaque joueur, à tour de rôle, place un seul truc.", "No debating: each player, in turn, places just one thing.") }]);
function scoreGuess(g, o, tw){
  const n = o.length, c = correct(g, o);
  let base, bonus = 0;
  if(tw === "edges"){ const e1 = g[0] === o[0], e2 = g[n - 1] === o[n - 1]; base = (e1 ? 2 : 0) + (e2 ? 2 : 0); bonus = e1 && e2 ? 1 : 0; }
  else { base = c; bonus = c === n ? 3 : 0; }
  const m = tw === "x2" ? 2 : 1;
  return { c, base, pts: (base + bonus) * m, max: (tw === "edges" ? 5 : n + 3) * m };
}
function itemsFor(packs, deck, tw, mates, lg){
  const n = tw === "six" ? 6 : 5, d = drawN(deck, packs, n, lg);
  if(tw === "mate" && mates.length){ d.five[Math.floor(Math.random() * n)] = SB.u.pick(mates); }
  return d;
}
const FL = {
  win: [tr("Classement final", "Final standings"), tr("Le plus fin psychologue", "Master psychologist"), tr("Lit dans les pensées", "Mind reader"), tr("Champion des priorités", "Priorities champion")],
  open: [tr("Le livre ouvert", "Open book"), tr("Transparent comme du verre", "Clear as glass"), tr("Zéro mystère", "Zero mystery")],
  myst: [tr("Le mystère", "The mystery"), tr("L'énigme du groupe", "The group's enigma"), tr("Impossible à cerner", "Impossible to read")],
  med: [tr("Le médium", "The psychic"), tr("Boule de cristal", "Crystal ball"), tr("Sixième sens", "Sixth sense")]
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
    go.textContent = order.length === n ? submitLabel : tr("Touche les " + n + " trucs dans l'ordre (" + order.length + " / " + n + ")", "Tap the " + n + " things in order (" + order.length + " / " + n + ")");
    if(reset) reset.hidden = !order.length;
  };
  go.addEventListener("click", () => { if(order.length === n){ go.disabled = true; onSubmit(order.join("")); } });
  if(reset) reset.addEventListener("click", () => { order = []; draw(); });
  draw();
}
function scaleHTML(tw, n){
  const fav = tr("Le préféré", "Favorite"), hate = tr("Le plus détesté", "Most hated");
  return '<div class="pr-scale"><span>1 · ' + (tw === "rev" ? hate : fav) + "</span><span>" + n + " · " + (tw === "rev" ? fav : hate) + "</span></div>";
}
function pickerHTML(lead, tw, n){
  return CSS + lead + scaleHTML(tw, n) + '<div class="pr-list" data-picker></div>' +
    dock('<button class="btn acc" type="button" data-submit disabled></button><button class="link" type="button" data-reset hidden style="align-self:center">' + tr("Recommencer le classement", "Start the ranking over") + "</button>");
}
function orderList(items, ord){ return '<div class="pr-list">' + String(ord).split("").map((x, k) => '<div class="pr-it on"><span class="n">' + (k + 1) + '</span><span class="t">' + esc(items[+x]) + "</span></div>").join("") + "</div>"; }
function packsHTML(sel){ return '<div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>"; }

function roundOf(c, round, ri, last, lg){
  const t = c.opts.twists !== false && round > 1 ? SB.u.twist(TW, { last, n: c.ids.length, rate: .4 }) : null, tw = t ? t.id : "";
  const ranker = c.players[ri].id, mates = c.players.filter(p => p.id !== ranker).map(p => p.name);
  const d = itemsFor(c.opts.packs, c.priv().deck, tw, mates, lg); c.setPriv({ deck: d.deck });
  return { phase: "play", round, ri, ranker, items: d.five, tw, order: "", guesses: {}, pts: {}, k: c.rid() };
}

SB.register({
  id: "priorites", name: tr("Priorités", "Priorities"), glyph: "1·2·3", pitch: tr("Devine dans quel ordre ton pote classe 5 trucs.", "Guess how your friend ranks 5 random things."), hot: true,
  accent: { light: "#ffd25e", dark: "#ffd25e" },
  tag: tr("Un joueur classe 5 trucs au hasard, du préféré au plus détesté. Les autres doivent deviner son ordre.", "One player ranks 5 random things, from favorite to most hated. Everyone else has to guess their order."),
  min: 2, max: 16,
  gages: [
    { ev: "zero", label: tr("Aucune place juste", "Not a single spot right"), kind: "boit", n: 2 },
    { ev: "sf", label: tr("Sans-faute", "Perfect guess"), kind: "distribue", n: 2 }
  ],
  rules: [
    tr("À chaque manche, un joueur reçoit 5 trucs au hasard : la raclette, les pigeons, un saut en parachute…", "Each round, one player gets 5 random things: cheese fondue, pigeons, a skydive…"),
    tr("Il les classe en secret, de ce qu'il préfère (1) à ce qu'il déteste le plus (5).", "They secretly rank them, from what they love most (1) to what they hate most (5)."),
    tr("Pendant ce temps, les autres devinent son classement sur leur téléphone.", "Meanwhile, everyone else guesses their ranking on their own phone."),
    tr("1 point par place bien devinée, +3 pour un sans-faute. Celui qui classe marque la moyenne des bonnes réponses : il a intérêt à être prévisible !", "1 point per spot guessed right, +3 for a perfect guess. The ranker scores the guessers' average, so it pays to be predictable!"),
    tr("Coups de théâtre : classement à l'envers, manche à six, les extrêmes, invité surprise, complicité, points doublés. Les trucs déjà vus ne reviennent qu'en dernier.", "Twists: worst first, round of six, the extremes, surprise guest, partners in crime, double points. Things you've already seen only come back last.")
  ],
  options: [
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length })) },
    { id: "laps", label: tr("Manches", "Rounds"), type: "seg", def: 1, values: [{ v: 1, label: tr("1 par joueur", "1 per player") }, { v: 2, label: tr("2 par joueur", "2 per player") }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une manche", "Every now and then, a rule changes for one round"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet.", "Pick at least one pack."));
    const lg = SB.lang();
    ctx.setPriv({ deck: SB.u.fresh(SEEN, pool(o.packs, lg), true) });
    const ri = Math.floor(Math.random() * ctx.players.length);
    return Object.assign(roundOf(ctx, 1, ri, "", lg), { rounds: ctx.players.length * (o.laps || 1), scores: {}, known: {}, sf: {}, lg });
  },
  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    const items = A(s.items), n = items.length, tw = s.tw || "";
    const r = ctx.input(s.ranker);
    if(!validOrder(r, n)) return;
    const guessers = ctx.ids.filter(id => id !== s.ranker && ctx.here(id));
    if(!guessers.every(id => validOrder(ctx.input(id), n))) return;
    const guesses = {}, pts = {}, scores = Object.assign({}, s.scores || {}), sf = Object.assign({}, s.sf || {}), gl = []; let sum = 0, sumB = 0, best = 0;
    guessers.forEach(id => {
      const g = ctx.input(id).o, x = scoreGuess(g, r.o, tw);
      guesses[id] = g; pts[id] = x.pts; sum += x.c; sumB += x.base; best = Math.max(best, x.pts);
      scores[id] = (scores[id] || 0) + x.pts; if(x.c === n) sf[id] = (sf[id] || 0) + 1;
      if(x.c === 0) gl.push({ id, ev: "zero" }); else if(x.c === n) gl.push({ id, ev: "sf" });
    });
    if(gl.length) ctx.gage(gl, s.k);
    const avg = guessers.length ? Math.round(sumB / guessers.length) * (tw === "x2" ? 2 : 1) : 0;
    const rk = tw === "ally" ? best : avg;
    pts[s.ranker] = rk; scores[s.ranker] = (scores[s.ranker] || 0) + rk;
    const known = Object.assign({}, s.known || {}), k0 = A(known[s.ranker]);
    known[s.ranker] = [(k0[0] || 0) + sum * 5 / n, (k0[1] || 0) + guessers.length];
    ctx.set({ phase: "reveal", order: r.o, guesses, pts, scores, known, sf });
  },
  render(ctx, root){
    const s = ctx.s, items = A(s.items), n = items.length, isR = s.ranker === ctx.me, rn = ctx.name(s.ranker), tw = s.tw || "";
    const lab = '<span class="eyebrow">' + tr("Manche ", "Round ") + s.round + " / " + s.rounds + " · " + esc(rn) + tr(" classe", " is ranking") + "</span>" + SB.u.twistHTML(SB.u.byTwist(TW, tw), TWLABEL);
    const nextRound = c => {
      const st = c.s;
      if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
      let ri = (st.ri + 1) % c.players.length;
      for(let t = 0; t < c.players.length && !c.here(c.players[ri].id); t++) ri = (ri + 1) % c.players.length;
      c.set(roundOf(c, st.round + 1, ri, st.tw, st.lg));
    };
    if(s.phase === "play"){
      const mine = ctx.mine();
      if(mine && mine.o){
        const live = ctx.ids.filter(id => ctx.here(id));
        screen(root, "w" + s.k, CSS + lab + '<div class="pass" style="min-height:24vh"><span class="eyebrow">' + (isR ? tr("Ton classement est enregistré", "Your ranking is locked in") : tr("Ta prédiction est enregistrée", "Your prediction is locked in")) + '</span><div class="who">Suspense…</div><p>' + tr("On attend les autres.", "Waiting for the others.") + "</p></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Prêts", "Ready") + '</span><div class="chips" data-chips></div></div>' +
          (ctx.isHost ? dock('<button class="link warn" type="button" data-skip hidden style="align-self:center">' + esc(rn) + tr(" est parti : passer la manche", " left: skip this round") + "</button>") : ""), r => {
          const sk = r.querySelector("[data-skip]"); if(sk) sk.addEventListener("click", () => ctx.act(nextRound));
        });
        const chips = live.map(id => { const i = ctx.input(id), ok = !!(i && i.o); return '<span class="chip' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + esc(ctx.name(id)) + (id === s.ranker ? tr(" (classe)", " (ranking)") : "") + "</span>"; }).join("");
        const ch = root.querySelector("[data-chips]"); if(ch && ch.innerHTML !== chips) ch.innerHTML = chips;
        const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = ctx.here(s.ranker);
      } else {
        const dir = tw === "rev" ? tr("du plus détesté au préféré", "from most hated to favorite") : tr("du préféré au plus détesté", "from favorite to most hated");
        screen(root, "p" + s.k + isR, pickerHTML(lab + (isR ? tr('<p class="big">À toi de classer !</p><p class="sm">Touche les ' + n + " trucs dans l'ordre, " + dir + ". Les autres essaient de deviner.</p>", '<p class="big">Your turn to rank!</p><p class="sm">Tap the ' + n + " things in order, " + dir + ". Everyone else will try to guess.</p>")
          : tr('<p class="big">Devine le classement de ' + esc(rn) + " !</p><p class=\"sm\">Touche les " + n + " trucs dans l'ordre où " + esc(rn) + " les classe selon toi (" + dir + ").</p>", '<p class="big">Guess ' + esc(rn) + "'s ranking!</p><p class=\"sm\">Tap the " + n + " things in the order you think " + esc(rn) + " will rank them (" + dir + ").</p>")), tw, n), r => {
          orderPicker(r, items, o => ctx.send({ o }), isR ? tr("Valider mon classement", "Lock in my ranking") : tr("Valider ma prédiction", "Lock in my prediction"));
        });
      }
    } else if(s.phase === "reveal"){
      const ord = String(s.order || ""), g = s.guesses || {}, pts = s.pts || {};
      const rows = Object.keys(g).sort((a, b) => (pts[b] || 0) - (pts[a] || 0));
      screen(root, "r" + s.k + ctx.isHost, CSS + lab + '<span class="eyebrow">' + tr("Le vrai classement de " + esc(rn), esc(rn) + "'s actual ranking") + "</span>" + scaleHTML(tw, n) + orderList(items, ord) +
        '<div class="field"><span class="eyebrow">' + tr("Les prédictions", "Predictions") + "</span>" + rows.map(id => { const gs = String(g[id]); return '<div class="pr-row"><div class="h"><span>' + esc(ctx.name(id)) + "</span><span>+" + (pts[id] || 0) + '</span></div><div class="pr-mini">' +
          gs.split("").map((x, k) => '<span class="' + (x === ord[k] ? "ok" : "") + '">' + (k + 1) + ". " + esc(items[+x]) + "</span>").join("") + "</div></div>"; }).join("") +
        '<p class="sm">' + esc(rn) + tr(" marque " + (pts[s.ranker] || 0) + " point" + ((pts[s.ranker] || 0) > 1 ? "s" : "") + (tw === "ally" ? " (autant que le meilleur devin)." : " (moyenne des bonnes réponses)."), " scores " + SB.u.plural2(pts[s.ranker] || 0, "point", "points", "point") + (tw === "ally" ? " (same as the best guesser)." : " (the guessers' average).")) + "</p></div>" +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le classement final", "See final standings") : tr("Manche suivante", "Next round")) + "</button>") : dock('<p class="wait">' + tr("L'hôte lance la suite…", "Waiting for the host…") + "</p>")), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "reveal") nextRound(c); }));
      });
    } else if(s.phase === "end"){
      const sc = s.scores || {}, kn = s.known || {}, sf = s.sf || {}, ids = ctx.ids.slice().sort((a, b) => (sc[b] || 0) - (sc[a] || 0));
      const read = ctx.ids.filter(id => A(kn[id])[1]).sort((a, b) => A(kn[b])[0] / A(kn[b])[1] - A(kn[a])[0] / A(kn[a])[1]);
      const med = ctx.ids.slice().sort((a, b) => (sf[b] || 0) - (sf[a] || 0))[0];
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + esc(fl(FL.win, s.fl, 0)) + '</span><div class="who">' + esc(ctx.name(ids[0])) + "</div>" +
        '<div class="bars">' + ids.map(id => '<div class="bar"><div class="lb"><span>' + esc(ctx.name(id)) + "</span><span>" + (sc[id] || 0) + tr(" pts", (sc[id] || 0) === 1 ? " pt" : " pts") + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (sc[id] || 0) / Math.max(1, sc[ids[0]] || 1)) + '%"></div></div></div>').join("") + "</div>" +
        (read.length ? '<div class="card"><span class="eyebrow">' + esc(fl(FL.open, s.fl, 1)) + '</span><div class="big">' + esc(ctx.name(read[0])) + '</div><span class="sm">' + tr("Le plus facile à deviner", "The easiest to read") + "</span></div>" : "") +
        (read.length > 1 ? '<div class="card"><span class="eyebrow">' + esc(fl(FL.myst, s.fl, 2)) + '</span><div class="big">' + esc(ctx.name(read[read.length - 1])) + '</div><span class="sm">' + tr("Le plus imprévisible", "The most unpredictable") + "</span></div>" : "") +
        (sf[med] ? '<div class="card"><span class="eyebrow">' + esc(fl(FL.med, s.fl, 3)) + '</span><div class="big">' + esc(ctx.name(med)) + '</div><span class="sm">' + SB.u.plural2(sf[med], "sans-faute", "sans-faute", "perfect guess", "perfect guesses") + "</span></div>" : "") +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>") : dock('<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>")), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const s2 = c.s.scores || {}, o2 = c.ids.slice().sort((a, b2) => (s2[b2] || 0) - (s2[a] || 0)), mx = s2[o2[0]] || 0;
          c.end({ title: tr("Priorités · " + c.name(o2[0]) + " gagne", "Priorities · " + c.name(o2[0]) + " wins"), lines: o2.map(id => c.name(id) + " · " + (s2[id] || 0) + tr(" pts", (s2[id] || 0) === 1 ? " pt" : " pts")), win: mx ? o2.filter(id => (s2[id] || 0) === mx) : [] });
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
      const gk = "pr" + Math.random().toString(36).slice(2, 8);
      let L = { phase: "setup", ri: 0, round: 0, rounds: names.length, deck: [], items: [], order: "", guess: "", score: 0, max: 0, tw: null, gain: 0 };
      const newItems = () => {
        L.tw = twOn && L.round > 1 ? SB.u.twist(TWL, { last: L.tw ? L.tw.id : "", n: names.length, rate: .4 }) : null;
        const d = itemsFor(SB.okPacks(sel, PACKS), L.deck, L.tw ? L.tw.id : "", names.filter((_, i) => i !== L.ri), SB.lang()); L.items = d.five; L.deck = d.deck;
      };
      const go = () => {
        const rn = names[L.ri], tw = L.tw ? L.tw.id : "", n = L.items.length;
        const lab = '<span class="eyebrow">' + tr("Manche ", "Round ") + L.round + " / " + L.rounds + tr(" · score du groupe ", " · group score ") + L.score + "</span>" + (L.phase === "pass" || L.phase === "group" ? SB.u.twistHTML(L.tw, TWLABEL) : "");
        const dir = tw === "rev" ? tr("du plus détesté au préféré", "from most hated to favorite") : tr("du préféré au plus détesté", "from favorite to most hated");
        if(L.phase === "setup"){
          screen(root, "setup" + sel.join() + twOn, CSS + '<p class="howto">' + tr("Version coopérative : à chaque manche, un joueur classe en secret, puis le groupe devine son classement ensemble.", "Co-op version: each round, one player ranks in secret, then the group guesses their ranking together.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + "</span>" + packsHTML(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variante", "Variant") + '</span><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change pour une manche", "Every now and then, a rule changes for one round") + "</span></span></button></div></div>" +
            dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ prPacks: sel }); go(); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ prTw: twOn }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; }
              L.deck = SB.u.fresh(SEEN, pool(SB.okPacks(sel, PACKS), SB.lang()), true); L.round = 1; L.score = 0; L.max = 0; L.tw = null; L.ri = Math.floor(Math.random() * names.length);
              newItems(); L.phase = "pass"; go();
            });
          });
        } else if(L.phase === "pass"){
          screen(root, "pa" + L.round, lab + '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(rn) + "</div><p>" + tr("Classe les " + n + " trucs en secret, " + dir + ". Les autres ne regardent pas.", "Rank the " + n + " things in secret, " + dir + ". No peeking, everyone else!") + "</p></div>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi, je classe", "It's me, I'm ranking") + "</button>"), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "rank"; go(); }); });
        } else if(L.phase === "rank"){
          screen(root, "rk" + L.round, pickerHTML(lab + '<p class="big">' + esc(rn) + tr(", classe-les !", ", rank them!") + "</p>", tw, n), r => {
            orderPicker(r, L.items, o => { L.order = o; L.phase = "group"; go(); }, tr("Valider et cacher", "Lock in and hide"));
          });
        } else if(L.phase === "group"){
          screen(root, "gr" + L.round, pickerHTML(lab + '<p class="big">' + tr("À vous : comment " + esc(rn) + " les a classés ?", "Your turn: how did " + esc(rn) + " rank them?") + "</p><p class=\"sm\">" + (tw === "turns" ? tr("Chacun son tour, sans débattre : chaque joueur place un seul truc. ", "Take turns, no debating: each player places just one thing. ") : tr("Discutez, puis touchez les " + n + " trucs dans l'ordre. ", "Talk it over, then tap the " + n + " things in order. ")) + esc(rn) + tr(" ne dit rien !", " stays quiet!") + "</p>", tw, n), r => {
            orderPicker(r, L.items, o => { L.guess = o; const x = scoreGuess(o, L.order, tw); L.gain = x.pts; L.score += x.pts; L.max += x.max; L.phase = "reveal";
              // Coopératif : si le groupe n'a aucune place juste, chaque devin a un gage (pas de distribution en local).
              if(api.gage && x.c === 0) api.gage(names.filter((_, k) => k !== L.ri).map(id => ({ id, ev: "zero" })), gk + ":" + L.round);
              go(); }, tr("Valider notre prédiction", "Lock in our prediction"));
          });
        } else if(L.phase === "reveal"){
          const c = correct(L.guess, L.order);
          screen(root, "rv" + L.round, CSS + lab + '<div class="verdict">' + (c === n ? tr("Sans-faute ! +", "Perfect! +") + L.gain : c + " / " + n + " · +" + L.gain) + '</div><span class="eyebrow">' + tr("Le vrai classement de " + esc(rn), esc(rn) + "'s actual ranking") + "</span>" + scaleHTML(tw, n) + orderList(L.items, L.order) +
            '<div class="field"><span class="eyebrow">' + tr("Votre prédiction", "Your prediction") + '</span><div class="pr-mini">' + L.guess.split("").map((x, k) => '<span class="' + (x === L.order[k] ? "ok" : "") + '">' + (k + 1) + ". " + esc(L.items[+x]) + "</span>").join("") + "</div></div>" +
            dock('<button class="btn acc" type="button" data-n>' + (L.round >= L.rounds ? tr("Voir le score final", "See the final score") : tr("Manche suivante", "Next round")) + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(L.round >= L.rounds){ L.phase = "end"; go(); return; }
              L.round++; L.ri = (L.ri + 1) % names.length; newItems(); L.phase = "pass"; go();
            });
          });
        } else if(L.phase === "end"){
          const pct = L.max ? L.score / L.max : 0;
          if(pct >= .6) api.win(names);
          screen(root, "end" + L.score, CSS + '<span class="eyebrow">' + tr("Score du groupe", "Group score") + '</span><div class="report"><span class="n">' + L.score + '</span><span class="o">/' + L.max + '</span></div><p class="appre">' + tr("« ", "“") +
            (pct >= .7 ? tr("Vous vous connaissez par cœur.", "You know each other inside out.") : pct >= .45 ? tr("Pas mal, quelques surprises quand même.", "Not bad, but a few surprises in there.") : tr("Vous êtes sûrs d'être amis ?", "Are you sure you're actually friends?")) + tr(" »", "”") + "</p>" +
            (pct >= .6 ? '<p class="sm">' + tr("Victoire collective : tout le monde marque une victoire au classement de la soirée.", "Team win: everyone gets a win on tonight's leaderboard.") + "</p>" : "") +
            dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
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
