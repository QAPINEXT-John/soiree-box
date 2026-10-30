/* Undercover — tout le monde a le même mot, sauf les intrus. Démasquez-les. */
(function(){
"use strict";
const { esc, clean, A, shuffle, screen, txt, tr } = SB.u;

// Paires de mots proches : [mot A, mot B]. L'un va aux civils, l'autre aux intrus (au hasard).
const PAIRS = [
  ["Café","Thé"],["Plage","Piscine"],["Pizza","Tacos"],["Netflix","YouTube"],["Avion","Train"],["Vélo","Trottinette"],
  ["Guitare","Piano"],["Ski","Snowboard"],["Croissant","Pain au chocolat"],["Instagram","TikTok"],["Mariage","Anniversaire"],["Lion","Tigre"],
  ["Bière","Vin"],["Harry Potter","Le Seigneur des anneaux"],["Football","Rugby"],["Montagne","Forêt"],["Dentiste","Médecin"],["Sushi","Ramen"],
  ["Pluie","Neige"],["Baskets","Tongs"],["Ascenseur","Escalator"],["Prison","École"],["Zoo","Cirque"],["Chocolat","Caramel"],
  ["Mer","Lac"],["Policier","Pompier"],["Fourchette","Cuillère"],["Lune","Soleil"],["Disneyland","Parc Astérix"],["Mario","Sonic"],
  ["Rap","Rock"],["Camping","Hôtel"],["Batman","Spider-Man"],["Paris","Londres"],["Clown","Magicien"],["Vampire","Zombie"],
  ["Crêpe","Gaufre"],["Bowling","Billard"],["Ketchup","Mayonnaise"],["Bateau","Sous-marin"],["Lunettes","Lentilles"],["Douche","Bain"],
  ["Fantôme","Sorcière"],["Licorne","Dragon"],["Professeur","Directeur"],["Cinéma","Théâtre"],["Pomme","Poire"],["Réveil","Montre"],
  ["PlayStation","Xbox"],["Mojito","Margarita"],["Chat","Lapin"],["Boulangerie","Pâtisserie"],["Tatouage","Piercing"],["Karaoké","Boîte de nuit"],
  ["Doudou","Oreiller"],["Pirate","Viking"],["Volcan","Geyser"],["Moto","Scooter"],["Burger","Kebab"],["Facebook","LinkedIn"],
  ["Noël","Halloween"],["Abeille","Guêpe"],["Requin","Dauphin"],["Pyjama","Peignoir"],["Avocat","Notaire"],["Cerf-volant","Montgolfière"],
  ["Escalade","Randonnée"],["Fromage","Beurre"],["Miel","Confiture"],["Coussin","Matelas"],["Peigne","Brosse"],["Rideau","Volet"],
  ["Hibou","Chouette"],["Grenouille","Crapaud"],["Corbeau","Pigeon"],["Loup","Renard"],["Cheval","Âne"],["Fusée","Satellite"],
  ["Planète","Étoile"],["Château","Palais"],["Église","Cathédrale"],["Musée","Galerie d'art"],["Marché","Supermarché"],["Taxi","Ambulance"],
  ["Hélicoptère","Drone"],["Kayak","Canoë"],["Natation","Plongée"],["Tennis","Badminton"],["Judo","Karaté"],["Échecs","Dames"],
  ["Puzzle","Mots croisés"],["Violon","Violoncelle"],["Trompette","Saxophone"],["Batterie","Tambour"],["Opéra","Comédie musicale"],["Roman","Bande dessinée"],
  ["Journal","Magazine"],["Radio","Podcast"],["Peinture","Sculpture"],["Crayon","Stylo"],["Agenda","Calendrier"],["Valise","Sac à dos"],
  ["Écharpe","Bonnet"],["Gants","Moufles"],["Chemise","Tee-shirt"],["Jupe","Robe"],["Bague","Bracelet"],["Parfum","Déodorant"],
  ["Shampoing","Gel douche"],["Brosse à dents","Fil dentaire"],["Four","Micro-ondes"],["Frigo","Congélateur"],["Casserole","Poêle"],["Couteau","Ciseaux"],
  ["Salade","Soupe"],["Riz","Pâtes"],["Omelette","Œuf au plat"],["Frites","Chips"],["Soda","Jus de fruit"],["Champagne","Cidre"],
  ["Raclette","Fondue"],["Quiche","Tarte"],["Cookie","Brownie"],["Macaron","Meringue"],["Fraise","Framboise"],["Citron","Orange"],
  ["Pastèque","Melon"],["Carotte","Navet"],["Ail","Oignon"],["Été","Printemps"],["Orage","Tempête"],["Brouillard","Nuage"],
  ["Désert","Savane"],["Grotte","Tunnel"],["Rivière","Cascade"],["Boulanger","Boucher"],["Coiffeur","Barbier"],["Infirmier","Pharmacien"],
  ["Cuisinier","Serveur"],["Détective","Espion"],["Chevalier","Samouraï"],["Momie","Squelette"],["Sirène","Fée"],["Ogre","Géant"],
  ["Extraterrestre","Monstre"],["Pique-nique","Barbecue"],["Concert","Festival"],["Pyramide","Temple"],["Balançoire","Toboggan"],["Trampoline","Château gonflable"],
  ["Hamac","Transat"],["Bougie","Lampe"],["Clé","Cadenas"],["Coffre-fort","Tirelire"],["Télescope","Jumelles"],["Boussole","Carte routière"],
  ["Sifflet","Klaxon"],["E-mail","Lettre"]
];
// Mots hard : sexe, fête et humour noir (option 18+)
const HARD_PAIRS = [
  ["Préservatif","Pilule"],["Menottes","Bandeau"],["Plan cul","Ex"],["Strip-tease","Lap dance"],
  ["Sextoy","Lubrifiant"],["Kamasutra","Cinquante nuances de Grey"],["Club libertin","Boîte de nuit"],["Nudes","Sexto"],
  ["Lingerie","Pyjama"],["Tinder","Grindr"],["Plan à trois","Partouze"],["Fessée","Martinet"],
  ["Préliminaires","Câlin"],["Porno","Film érotique"],["Gueule de bois","Cuite"],["Suçon","Morsure"],
  ["Walk of shame","After"],["Cercueil","Urne"],["Cimetière","Morgue"],["Testament","Héritage"],
  ["Enterrement","Veillée funèbre"],["Croque-mort","Médecin légiste"],["Tueur en série","Tueur à gages"],["Enfer","Purgatoire"],
  ["Jacuzzi","Sauna"],["Body shot","Shooter"],["Sugar daddy","Gigolo"],["Infidélité","Jalousie"],
  ["Strip-poker","Action ou vérité"],["Nuisette","Porte-jarretelles"],["Massage","Caresse"],["Coup d'un soir","Relation libre"],
  ["Love hotel","Motel"],["Fouet","Cravache"],["Huile de massage","Bougie parfumée"],["Latex","Cuir"],
  ["Fossoyeur","Embaumeur"],["Pierre tombale","Épitaphe"],["Crémation","Inhumation"],["Chaise électrique","Guillotine"],
  ["Barman","Videur"],["Rendez-vous galant","Speed dating"]
];
// English word pairs (same structure: normal + 18+).
const PAIRS_EN = [
  ["Coffee","Tea"],["Beach","Swimming pool"],["Pizza","Tacos"],["Netflix","YouTube"],["Plane","Train"],["Bike","Scooter"],
  ["Guitar","Piano"],["Skiing","Snowboarding"],["Bagel","Donut"],["Instagram","TikTok"],["Wedding","Birthday party"],["Lion","Tiger"],
  ["Beer","Wine"],["Harry Potter","The Lord of the Rings"],["Basketball","Volleyball"],["Mountain","Forest"],["Dentist","Doctor"],["Sushi","Ramen"],
  ["Rain","Snow"],["Sneakers","Flip-flops"],["Elevator","Escalator"],["Prison","School"],["Zoo","Circus"],["Chocolate","Caramel"],
  ["Ocean","Lake"],["Police officer","Firefighter"],["Fork","Spoon"],["Moon","Sun"],["Disneyland","Universal Studios"],["Mario","Sonic"],
  ["Rap","Rock"],["Camping","Hotel"],["Batman","Spider-Man"],["New York","London"],["Clown","Magician"],["Vampire","Zombie"],
  ["Pancake","Waffle"],["Bowling","Darts"],["Ketchup","Mayo"],["Boat","Submarine"],["Glasses","Contact lenses"],["Shower","Bath"],
  ["Ghost","Witch"],["Unicorn","Dragon"],["Teacher","Principal"],["Cinema","Theater"],["Apple","Pear"],["Alarm clock","Watch"],
  ["PlayStation","Xbox"],["Mojito","Margarita"],["Cat","Rabbit"],["Bakery","Candy store"],["Tattoo","Piercing"],["Karaoke","Nightclub"],
  ["Teddy bear","Pillow"],["Pirate","Viking"],["Volcano","Geyser"],["Motorcycle","Moped"],["Burger","Hot dog"],["Facebook","LinkedIn"],
  ["Christmas","Halloween"],["Bee","Wasp"],["Shark","Dolphin"],["Pajamas","Bathrobe"],["Lawyer","Judge"],["Kite","Hot-air balloon"],
  ["Rock climbing","Hiking"],["Cheese","Butter"],["Honey","Jam"],["Cushion","Mattress"],["Comb","Hairbrush"],["Curtains","Blinds"],
  ["Owl","Bat"],["Frog","Toad"],["Crow","Pigeon"],["Wolf","Fox"],["Horse","Donkey"],["Rocket","Satellite"],
  ["Planet","Star"],["Castle","Palace"],["Church","Cathedral"],["Museum","Art gallery"],["Farmers market","Supermarket"],["Taxi","Ambulance"],
  ["Helicopter","Drone"],["Kayak","Canoe"],["Swimming","Scuba diving"],["Tennis","Badminton"],["Judo","Karate"],["Chess","Checkers"],
  ["Jigsaw puzzle","Crossword"],["Violin","Cello"],["Trumpet","Saxophone"],["Drums","Tambourine"],["Opera","Musical"],["Novel","Comic book"],
  ["Newspaper","Magazine"],["Radio","Podcast"],["Painting","Sculpture"],["Pencil","Pen"],["Planner","Calendar"],["Suitcase","Backpack"],
  ["Scarf","Beanie"],["Gloves","Mittens"],["Shirt","T-shirt"],["Skirt","Dress"],["Ring","Bracelet"],["Perfume","Deodorant"],
  ["Shampoo","Shower gel"],["Toothbrush","Dental floss"],["Oven","Microwave"],["Fridge","Freezer"],["Saucepan","Frying pan"],["Knife","Scissors"],
  ["Salad","Soup"],["Rice","Pasta"],["Omelette","Fried egg"],["French fries","Potato chips"],["Soda","Fruit juice"],["Champagne","Cider"],
  ["Fondue","Hot pot"],["Quiche","Pie"],["Cookie","Brownie"],["Cupcake","Muffin"],["Strawberry","Raspberry"],["Lemon","Orange"],
  ["Watermelon","Cantaloupe"],["Carrot","Parsnip"],["Garlic","Onion"],["Summer","Spring"],["Thunderstorm","Hurricane"],["Fog","Cloud"],
  ["Desert","Savanna"],["Cave","Tunnel"],["River","Waterfall"],["Baker","Butcher"],["Hairdresser","Barber"],["Nurse","Pharmacist"],
  ["Chef","Waiter"],["Detective","Spy"],["Knight","Samurai"],["Mummy","Skeleton"],["Mermaid","Fairy"],["Ogre","Giant"],
  ["Alien","Monster"],["Picnic","Barbecue"],["Concert","Festival"],["Pyramid","Temple"],["Swing","Slide"],["Trampoline","Bouncy castle"],
  ["Hammock","Deck chair"],["Candle","Lamp"],["Key","Padlock"],["Safe","Piggy bank"],["Telescope","Binoculars"],["Compass","Map"],
  ["Whistle","Car horn"],["Email","Letter"]
];
const HARD_PAIRS_EN = [
  ["Condom","The pill"],["Handcuffs","Blindfold"],["Booty call","Ex"],["Striptease","Lap dance"],
  ["Vibrator","Lube"],["Kama Sutra","Fifty Shades of Grey"],["Swingers club","Strip club"],["Nudes","Sexting"],
  ["Lingerie","Boxers"],["Tinder","Grindr"],["Threesome","Orgy"],["Spanking","Paddle"],
  ["Foreplay","Cuddling"],["Porn","Erotic movie"],["Hangover","Blackout"],["Hickey","Bite mark"],
  ["Walk of shame","Afterparty"],["Coffin","Urn"],["Cemetery","Morgue"],["Will","Inheritance"],
  ["Funeral","Wake"],["Undertaker","Coroner"],["Serial killer","Hitman"],["Hell","Purgatory"],
  ["Hot tub","Sauna"],["Body shot","Jello shot"],["Sugar daddy","Gigolo"],["Cheating","Jealousy"],
  ["Strip poker","Truth or dare"],["Corset","Garter belt"],["Massage","Caress"],["One-night stand","Open relationship"],
  ["Love hotel","Motel"],["Whip","Riding crop"],["Massage oil","Scented candle"],["Latex","Leather"],
  ["Gravedigger","Embalmer"],["Tombstone","Epitaph"],["Cremation","Burial"],["Electric chair","Guillotine"],
  ["Bartender","Bouncer"],["First date","Speed dating"]
];
const DECK = { fr: { n: PAIRS, h: HARD_PAIRS }, en: { n: PAIRS_EN, h: HARD_PAIRS_EN } };
const deck = lg => DECK[lg === "en" ? "en" : "fr"];
function count(ids, roles, r){ return ids.filter(id => roles[id] === r).length; }
function roleLabel(r){ return r === "u" ? tr("un intrus", "an Undercover") : r === "w" ? "Mister White" : tr("un civil", "a Civilian"); }
function roleName(r){ return r === "u" ? tr("Intrus", "Undercover") : r === "w" ? "Mister White" : tr("Civil", "Civilian"); }
// Comparaison souple pour la proposition de Mister White : sans accents, sans casse, sans ponctuation.
function norm(t){ return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^(?:(?:le|la|les|un|une|des|the|an|a)\s+|l')/, "").replace(/[^a-z0-9]/g, ""); }
// Distribution : nombre d'intrus, Mister White en option. Au moins deux civils de plus que d'imposteurs.
function cast(n, imp, white){
  const cap = Math.max(1, Math.floor((n - 1) / 2));
  imp = imp || (n >= 7 ? 2 : 1);
  if(white) return { imp: Math.max(0, Math.min(imp, cap - 1)), white: 1 };
  return { imp: Math.max(1, Math.min(imp, cap)), white: 0 };
}
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; }; // mode Enfant : jamais de pool vide
function pickPair(hard, lg){
  const D = deck(lg), pool = kidF(hard ? D.n.concat(D.h) : D.n);
  const pair = SB.u.fresh("undercover:pairs", pool).pop();
  SB.u.saw("undercover:pairs", [pair]);
  const flip = Math.random() < .5;
  return { civ: flip ? pair[1] : pair[0], und: flip ? pair[0] : pair[1] };
}
// Mister White ne parle jamais en premier.
function firstNotWhite(order, roles){
  order = order.slice();
  if(order.length > 1 && roles[order[0]] === "w"){ const j = 1 + Math.floor(Math.random() * (order.length - 1)); const t = order[0]; order[0] = order[j]; order[j] = t; }
  return order;
}

/* ---------- Coups de théâtre : un tour d'indices sur trois environ ---------- */
const LETTERS = "BCDFGLMPRST";
const TWISTS = [
  { id: "lettre", name: tr("Lettre imposée", "Forced letter"), desc: tr("Chaque indice doit commencer par la lettre indiquée.", "Every clue must start with the given letter.") },
  { id: "deux", name: tr("Deux mots", "Two words"), desc: tr("Chaque indice fait exactement deux mots.", "Every clue is exactly two words.") },
  { id: "verbe", name: tr("Que des verbes", "Verbs only"), desc: tr("Chaque indice est un verbe à l'infinitif.", "Every clue is a single verb.") },
  { id: "emotion", name: tr("Thème : émotions", "Theme: feelings"), desc: tr("Chaque indice est une émotion ou une sensation.", "Every clue is an emotion or a feeling.") },
  { id: "lieu", name: tr("Thème : lieux", "Theme: places"), desc: tr("Chaque indice est un lieu.", "Every clue is a place.") },
  { id: "immunite", name: tr("Immunité", "Immunity"), desc: tr("Le (la) premier(ère) à parler ne peut pas être éliminé(e) à ce tour.", "The first player to speak can't be voted out this round.") },
  { id: "double", name: tr("Voix double", "Double vote"), desc: tr("Le vote du (de la) premier(ère) à parler compte double.", "The first speaker's vote counts twice.") },
  { id: "mortsubite", name: tr("Mort subite", "Sudden death"), desc: tr("Pas d'égalité : le sort départage les ex aequo.", "No ties: fate picks between the tied players."), ok: o => !o.local },
  { id: "decouvert", name: tr("Vote à découvert", "Open vote"), desc: tr("Tout le monde verra qui a voté pour qui.", "Everyone will see who voted for whom."), ok: o => !o.local },
  { id: "aveugle", name: tr("Indices à l'aveugle", "Blind clues"), desc: tr("On ne voit les indices des autres qu'au moment du vote.", "You only see the other clues when it's time to vote."), ok: o => !o.local }
];
const TW = id => SB.u.byTwist(TWISTS, id);
function rollTwist(on, last, local){ const t = on ? SB.u.twist(TWISTS, { rate: .38, last, local }) : null; return t ? t.id : ""; }
function twBanner(tw, tp){
  const t = TW(tw); if(!t) return "";
  return SB.u.twistHTML(tw === "lettre" ? { name: tr(t.name + " : " + tp, t.name + ": " + tp), desc: tr("Chaque indice commence par la lettre " + tp + ".", "Every clue starts with the letter " + tp + ".") } : t);
}
// lg : langue des mots de la partie (celle de l'hôte) pour vérifier les verbes.
function clueErr(t, tw, tp, lg){
  const w = t.trim().split(/\s+/);
  if(tw === "lettre" && norm(t).charAt(0) !== String(tp || "").toLowerCase()) return tr("Coup de théâtre : ton indice doit commencer par la lettre " + tp + ".", "Plot twist: your clue must start with the letter " + tp + ".");
  if(tw === "deux" && w.length !== 2) return tr("Coup de théâtre : ton indice doit faire exactement deux mots.", "Plot twist: your clue must be exactly two words.");
  if(tw === "verbe" && (w.length !== 1 || (lg !== "en" && !/(er|ir|re)$/.test(norm(t))))) return tr("Coup de théâtre : il faut un seul verbe à l'infinitif (manger, partir, prendre…).", "Plot twist: give a single verb (eat, run, dance…).");
  return "";
}

/* ---------- Trophées ---------- */
function vary(list, seed){ return list[Math.abs(seed) % list.length]; }
// vh : [[tour, votant, cible]], outAt : {id: tour d'élimination}, last : dernier tour joué
function awards(ids, roles, vh, outAt, last, name){
  const out = [], seed = A(vh).length * 3 + ids.length + last;
  const bad = id => roles[id] === "u" || roles[id] === "w";
  const hit = {}, got = {};
  A(vh).map(A).forEach(v => { if(!bad(v[1]) && bad(v[2])) hit[v[1]] = (hit[v[1]] || 0) + 1; if(!bad(v[2])) got[v[2]] = (got[v[2]] || 0) + 1; });
  const h = Object.keys(hit).sort((a, b) => hit[b] - hit[a])[0];
  if(h) out.push([vary(tr(["Flair de limier", "Œil de lynx", "Détecteur de mensonges", "Inspecteur en chef"], ["Bloodhound", "Eagle Eye", "Human Lie Detector", "Chief Inspector"]), seed), name(h), tr(SB.u.plural(hit[h], "vote") + " contre les intrus", SB.u.plural2(hit[h], "", "", "vote") + " against the impostors")]);
  const g = Object.keys(got).sort((a, b) => got[b] - got[a])[0];
  if(g && got[g] >= 2) out.push([vary(tr(["Tête de suspect", "Coupable idéal(e)", "Paratonnerre", "Bouc émissaire"], ["Usual Suspect", "Perfect Fall Guy", "Lightning Rod", "Scapegoat"]), seed + 1), name(g), tr(SB.u.plural(got[g], "vote") + " reçus sans être coupable", "took " + SB.u.plural2(got[g], "", "", "vote") + " while innocent")]);
  const b = ids.filter(bad).map(id => [id, outAt[id] || last + 1]).sort((x, y) => y[1] - x[1])[0];
  if(b && b[1] >= 2) out.push([vary(tr(["Caméléon", "Agent dormant", "Maître du bluff", "Visage de marbre"], ["Chameleon", "Sleeper Agent", "Master of Bluff", "Poker Face"]), seed + 2), name(b[0]), outAt[b[0]] ? tr("a tenu " + SB.u.plural(b[1] - 1, "tour") + " avant d'être démasqué(e)", "lasted " + SB.u.plural2(b[1] - 1, "", "", "round") + " before getting caught") : tr("jamais démasqué(e)", "never caught")]);
  return out;
}
function awardsHTML(a){ return a.length ? '<div class="field"><span class="eyebrow">' + tr("Trophées", "Awards") + '</span><ul class="list">' + a.map(x => '<li><span class="t" style="font-size:19px">' + esc(x[0]) + '</span><span class="by">' + esc(x[1]) + " · " + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : ""; }
function winTitle(w){ return w === "c" ? tr("Victoire des civils", "The Civilians win") : w === "w" ? tr("Mister White a deviné !", "Mister White guessed it!") : tr("Victoire des intrus", "The impostors win"); }
function winners(ids, roles, w){ return ids.filter(id => w === "c" ? roles[id] === "c" : w === "w" ? roles[id] === "w" : roles[id] !== "c"); }
function packBtn(attr, on, name, desc, hot){ return '<button type="button" class="pack' + (hot ? " hot" : "") + '" ' + attr + ' aria-pressed="' + on + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(name) + (hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(desc) + "</span></span></button>"; }

SB.register({
  id: "undercover", name: "Undercover", glyph: tr("Intrus", "Spy"), pitch: tr("Un mot secret pour tous… sauf pour les intrus.", "One secret word for everyone… except the Undercovers."), hot: true,
  accent: { light: "#8f9bff", dark: "#8f9bff" },
  tag: tr("Tout le monde a le même mot, sauf les intrus. Démasquez-les avant qu'ils gagnent.", "Everyone has the same word, except the Undercovers. Unmask them before they win."),
  min: 3, max: 16,
  gages: [
    { ev: "demasque", label: tr("Démasqué(e) : intrus ou Mister White éliminé(e)", "Unmasked: Undercover or Mister White voted out"), kind: "boit", n: 2 },
    { ev: "innocent", label: tr("Civil éliminé(e) à tort", "Civilian voted out by mistake"), kind: "boit", n: 1 },
    { ev: "egalite", label: tr("Égalité au vote, personne ne sort", "Tied vote, nobody's out"), kind: "tous", n: 1 }
  ],
  rules: tr([
    "Chacun reçoit un mot secret. Les intrus ont un mot proche mais différent, et ne savent pas qu'ils le sont.",
    "Chacun son tour, donnez un indice en un seul mot en rapport avec votre mot secret, sans le prononcer.",
    "Votez ensuite pour éliminer le joueur qui vous semble le plus suspect.",
    "Les civils gagnent s'ils éliminent tous les intrus. Les intrus gagnent s'ils sont aussi nombreux que les civils.",
    "Variante Mister White : un joueur n'a aucun mot. S'il (elle) est éliminé(e), il (elle) peut encore gagner seul(e) en devinant le mot des civils.",
    "Coups de théâtre : certains tours imposent une contrainte (lettre, thème, deux mots, immunité, voix double…)."
  ], [
    "Everyone gets a secret word. The Undercovers get a similar but different word, and don't know they're Undercover.",
    "Take turns giving a one-word clue about your secret word, without saying it.",
    "Then vote to eliminate the player who seems the most suspicious.",
    "The Civilians win if they eliminate every Undercover. The Undercovers win once they're as many as the Civilians.",
    "Mister White variant: one player gets no word at all. If eliminated, they can still win alone by guessing the Civilians' word.",
    "Plot twists: some rounds add a constraint (letter, theme, two words, immunity, double vote…)."
  ]),
  options: [
    { id: "imp", label: tr("Nombre d'intrus", "Undercovers"), type: "seg", def: 0, values: [{ v: 0, label: "Auto" }, { v: 1, label: "1" }, { v: 2, label: "2" }, { v: 3, label: "3" }] },
    { id: "white", label: tr("Variante", "Variant"), type: "toggle", text: "Mister White", desc: tr("Un joueur sans mot qui peut gagner en devinant celui des civils", "A player with no word who can win by guessing the Civilians' word"), def: false },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Environ un tour sur trois, une contrainte s'ajoute", "About one round in three adds a constraint"), def: true },
    { id: "hard", label: tr("Mots", "Words"), type: "toggle", text: tr("Ajouter le contenu 18+", "Add 18+ content"), desc: tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult content"), hot: true, def: false }
  ],
  start(ctx, o){
    const ids = ctx.ids, n = ids.length, cs = cast(n, o.imp, !!o.white), lg = SB.lang();
    const { civ, und } = pickPair(o.hard, lg);
    const sh = shuffle(ids), imps = sh.slice(0, cs.imp), wh = cs.white ? sh[cs.imp] : "", roles = {}, words = {};
    ids.forEach(id => { const r = id === wh ? "w" : imps.indexOf(id) >= 0 ? "u" : "c"; roles[id] = r; words[id] = r === "w" ? "" : r === "u" ? und : civ; });
    return { phase: "reveal", lg, roles, words, civ, und, alive: ids.slice(), order: [], turn: 0, clues: [], round: 1, out: "", tie: false, tally: {}, winner: "", tw: "", tp: "", vl: [], vh: [], outAt: {}, wg: "" };
  },
  host(ctx){
    const s = ctx.s, alive = A(s.alive), roles = s.roles || {};
    const live = alive.filter(id => ctx.here(id));
    if(s.phase === "reveal"){
      if(live.length && live.every(id => { const i = ctx.input(id); return i && i.ok; }))
        ctx.set({ phase: "clues", order: firstNotWhite(shuffle(live), roles), turn: 0, clues: [], k: ctx.rid() });
    } else if(s.phase === "clues"){
      const order = A(s.order), clues = A(s.clues).map(A); let turn = s.turn || 0, changed = false;
      while(turn < order.length){
        const id = order[turn];
        if(!ctx.here(id) || alive.indexOf(id) < 0){ turn++; changed = true; continue; }
        const i = ctx.input(id);
        if(i && clean(i.t, 30)){ clues.push([id, clean(i.t, 30)]); turn++; changed = true; continue; }
        break;
      }
      if(turn >= order.length) ctx.set({ phase: "vote", clues, turn, k: ctx.rid() });
      else if(changed) ctx.set({ turn, clues });
    } else if(s.phase === "vote"){
      const first = A(s.order)[0] || "", imm = s.tw === "immunite" ? first : "";
      const votes = {};
      const ok = live.length && live.every(id => { const i = ctx.input(id); if(i && alive.indexOf(i.v) >= 0 && i.v !== id && i.v !== imm){ votes[id] = i.v; return true; } return false; });
      if(!ok) return;
      const tally = {}; Object.keys(votes).forEach(v => { tally[votes[v]] = (tally[votes[v]] || 0) + (s.tw === "double" && v === first ? 2 : 1); });
      const max = Math.max.apply(null, Object.keys(tally).map(k => tally[k]));
      let top = Object.keys(tally).filter(k => tally[k] === max);
      if(top.length > 1 && s.tw === "mortsubite") top = [SB.u.pick(top)];
      const vl = Object.keys(votes).map(v => [v, votes[v]]), vh = A(s.vh).concat(vl.map(x => [s.round, x[0], x[1]]));
      if(top.length > 1){ ctx.set({ phase: "out", out: "", tie: true, tally, vl, vh, wg: "" }); ctx.gage([{ id: "", ev: "egalite" }], "uc" + s.k + ":" + s.round); return; }
      const out = top[0], outAt = Object.assign({}, s.outAt || {}, { [out]: s.round });
      ctx.set({ phase: roles[out] === "w" ? "wguess" : "out", out, tie: false, tally, vl, vh, outAt, wg: "", alive: alive.filter(id => id !== out), k: roles[out] === "w" ? ctx.rid() : s.k });
      // Gage : l'intrus démasqué ou le civil éliminé à tort. Mister White, lui, attend d'avoir raté sa proposition.
      if(roles[out] !== "w") ctx.gage([{ id: out, ev: roles[out] === "u" ? "demasque" : "innocent" }], "uc" + s.k + ":" + s.round);
    } else if(s.phase === "wguess"){
      const i = ctx.input(s.out), g = i ? clean(i.g, 30) : "";
      if(g){ if(norm(g) && norm(g) === norm(s.civ)) ctx.set({ phase: "end", winner: "w", wg: g }); else { ctx.set({ phase: "out", wg: g }); ctx.gage([{ id: s.out, ev: "demasque" }], "uc" + s.k + ":w"); } }
      else if(!ctx.here(s.out)){ ctx.set({ phase: "out", wg: "" }); ctx.gage([{ id: s.out, ev: "demasque" }], "uc" + s.k + ":w"); }
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, roles = s.roles || {}, words = s.words || {}, alive = A(s.alive);
    const isAlive = alive.indexOf(me) >= 0, myWord = words[me] || "", amW = roles[me] === "w";
    const lab = '<span class="eyebrow">' + tr("Tour " + s.round + " · " + SB.u.plural(alive.length, "joueur") + " en jeu", "Round " + s.round + " · " + SB.u.plural2(alive.length, "", "", "player") + " left") + "</span>" + (s.phase === "clues" || s.phase === "vote" ? twBanner(s.tw, s.tp) : "");
    const reminder = isAlive ? '<details><summary>' + tr("Revoir mon mot", "Show my word again") + '</summary><p class="huge" style="margin-top:6px">' + (amW ? tr("Aucun mot", "No word") : esc(myWord)) + "</p>" + (amW ? '<p class="sm">' + tr("Tu es Mister White : bluffe.", "You're Mister White: bluff!") + "</p>" : "") + "</details>" : '<p class="note-box">' + tr("Tu es éliminé(e) : regarde la suite sans rien dévoiler.", "You're out: keep watching without giving anything away.") + "</p>";
    const cluesHTML = hide => { const cl = A(s.clues).map(A); if(hide) return '<li><span class="by">' + tr("Indices à l'aveugle : ils seront révélés au moment du vote. " + SB.u.plural(cl.length, "indice") + " donné" + (cl.length > 1 ? "s" : "") + ".", "Blind clues: they'll be revealed at vote time. " + SB.u.plural2(cl.length, "", "", "clue") + " given.") + "</span></li>"; return cl.length ? cl.map(c => '<li><span class="t">' + esc(c[1]) + '</span><span class="by">' + esc(ctx.name(c[0])) + "</span></li>").join("") : '<li><span class="by">' + tr("Pas encore d'indice.", "No clues yet.") + "</span></li>"; };
    if(s.phase === "reveal"){
      screen(root, "rv" + s.k, lab + '<div class="card acc"><span class="eyebrow">' + (amW ? tr("Ton rôle", "Your role") : tr("Ton mot secret", "Your secret word")) + '</span><div data-w hidden>' + (amW ? '<p class="huge">Mister White</p><p class="sm">' + tr("Tu n'as pas de mot. Écoute les indices et bluffe. Si on t'élimine, devine le mot des civils pour gagner.", "You have no word. Listen to the clues and bluff. If you get voted out, guess the Civilians' word to win.") + "</p>" : '<p class="huge">' + esc(myWord) + "</p>") + '</div><p class="sm" data-hint>' + tr("Cache ton écran, puis touche le bouton.", "Hide your screen, then tap the button.") + "</p>" +
        '<button class="btn ghost" type="button" data-show>' + tr("Voir mon mot", "Show my word") + '</button></div><p class="howto">' + tr("Personne ne sait s'il (elle) est un intrus. Retiens ton mot, puis confirme.", "Nobody knows if they're Undercover. Memorize your word, then confirm.") + "</p>" +
        '<div class="field"><span class="eyebrow">' + tr("Prêts", "Ready") + '</span><div class="chips" data-chips></div></div>' + SB.u.dock('<button class="btn acc" type="button" data-ok>' + tr("J'ai retenu mon mot", "Got my word") + "</button>"), r => {
        const w = r.querySelector("[data-w]"), b = r.querySelector("[data-show]");
        b.addEventListener("click", () => { w.hidden = !w.hidden; b.textContent = w.hidden ? tr("Voir mon mot", "Show my word") : tr("Cacher mon mot", "Hide my word"); r.querySelector("[data-hint]").hidden = !w.hidden; });
        r.querySelector("[data-ok]").addEventListener("click", () => ctx.send({ ok: 1 }));
      });
      const mine = ctx.mine(), okBtn = root.querySelector("[data-ok]");
      okBtn.disabled = !!(mine && mine.ok); okBtn.textContent = mine && mine.ok ? tr("C'est noté, on attend les autres", "Got it, waiting for the others") : tr("J'ai retenu mon mot", "Got my word");
      const chips = alive.map(id => { const i = ctx.input(id), ok = !!(i && i.ok); return '<span class="chip' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + esc(ctx.name(id)) + "</span>"; }).join("");
      const ch = root.querySelector("[data-chips]"); if(ch.innerHTML !== chips) ch.innerHTML = chips;
    } else if(s.phase === "clues"){
      const order = A(s.order), cur = order[s.turn] || "", myTurn = cur === me;
      const ask = tr(s.tw === "deux" ? "un indice de deux mots" : s.tw === "verbe" ? "un verbe à l'infinitif" : s.tw === "emotion" ? "une émotion ou une sensation" : s.tw === "lieu" ? "un lieu" : s.tw === "lettre" ? "un indice en un mot commençant par " + esc(s.tp) : "un indice en un seul mot",
        s.tw === "deux" ? "a two-word clue" : s.tw === "verbe" ? "a single verb" : s.tw === "emotion" ? "an emotion or a feeling" : s.tw === "lieu" ? "a place" : s.tw === "lettre" ? "a one-word clue starting with " + esc(s.tp) : "a one-word clue");
      screen(root, "cl" + s.k + "|" + s.turn + "|" + myTurn, lab + reminder + '<div class="field"><span class="eyebrow">' + tr("Indices du tour", "This round's clues") + '</span><ul class="list" data-clues></ul></div>' +
        SB.u.dock(myTurn ? '<div class="card acc"><span class="eyebrow">' + tr("À toi", "Your turn") + "</span><p>" + tr("Donne " + ask + " en rapport avec ton mot, sans le dire.", "Give " + ask + " about your word, without saying it.") + "</p><div class=\"row\"><input class=\"txt\" id=\"uc-in\" maxlength=\"30\" autocomplete=\"off\" placeholder=\"" + tr("Ton indice", "Your clue") + "\"><button class=\"btn acc\" type=\"button\" data-send style=\"flex:none\">" + tr("Envoyer", "Send") + "</button></div><p class=\"err\" data-err hidden></p></div>"
          : '<p class="wait">' + tr(esc(ctx.name(cur)) + " cherche son indice…", esc(ctx.name(cur)) + " is thinking of a clue…") + "</p>"), r => {
        const b = r.querySelector("[data-send]");
        if(b){
          const inp = r.querySelector("#uc-in"), err = r.querySelector("[data-err]");
          const go = () => {
            const t = clean(inp.value, 30);
            if(!t){ err.textContent = tr("Écris un indice avant d'envoyer.", "Type a clue before sending."); err.hidden = false; return; }
            if(myWord && norm(t) === norm(myWord)){ err.textContent = tr("Tu ne peux pas donner ton propre mot.", "You can't give your own word."); err.hidden = false; return; }
            const e = clueErr(t, s.tw, s.tp, s.lg); if(e){ err.textContent = e; err.hidden = false; return; }
            err.hidden = true; b.disabled = true; ctx.send({ t });
          };
          b.addEventListener("click", go); inp.addEventListener("keydown", e => { if(e.key === "Enter") go(); });
        }
      });
      const ul = root.querySelector("[data-clues]"), h = cluesHTML(s.tw === "aveugle"); if(ul.innerHTML !== h) ul.innerHTML = h;
    } else if(s.phase === "vote"){
      const imm = s.tw === "immunite" ? A(s.order)[0] : "";
      screen(root, "vo" + s.k, lab + reminder + '<div class="field"><span class="eyebrow">' + tr("Indices du tour", "This round's clues") + '</span><ul class="list">' + cluesHTML(false) + "</ul></div>" +
        (isAlive ? '<div class="field"><span class="eyebrow">' + tr("Qui est l'intrus ?", "Who's the Undercover?") + '</span><div class="choices">' + alive.filter(id => id !== me).map(id => '<button type="button" class="opt" data-v="' + esc(id) + '"' + (id === imm ? " disabled" : "") + ">" + esc(ctx.name(id)) + (id === imm ? tr(" · immunisé(e)", " · immune") : "") + "</button>").join("") + '</div></div>' : "") +
        SB.u.dock((isAlive ? '<button class="btn acc" type="button" data-vote disabled>' + tr("Voter", "Vote") + "</button>" : "") + '<p class="wait" data-wait></p>'), r => {
        let pickV = "";
        r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => { pickV = b.dataset.v; r.querySelectorAll("[data-v]").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === pickV)); r.querySelector("[data-vote]").disabled = false; }));
        const vb = r.querySelector("[data-vote]");
        if(vb) vb.addEventListener("click", () => { if(!pickV) return; ctx.send({ v: pickV }); vb.disabled = true; vb.textContent = tr("Vote envoyé", "Vote sent"); r.querySelectorAll("[data-v]").forEach(x => { x.disabled = true; }); });
      });
      const live = alive.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && i.v; }).length;
      txt(root, "[data-wait]", done + " / " + live.length + " votes");
    } else if(s.phase === "wguess"){
      const isW = s.out === me;
      screen(root, "wg" + s.k + isW, '<span class="eyebrow">' + tr("Éliminé(e)", "Voted out") + '</span><div class="who">' + esc(ctx.name(s.out)) + '</div><p style="font-size:18px">' + tr(esc(ctx.name(s.out)) + " était <b>Mister White</b>. Dernière chance : s'il (elle) devine le mot des civils, il (elle) gagne seul(e).", esc(ctx.name(s.out)) + " was <b>Mister White</b>. Last chance: if they guess the Civilians' word, they win alone.") + "</p>" +
        (isW ? '<div class="card acc"><span class="eyebrow">' + tr("Ta proposition", "Your guess") + '</span><div class="row"><input class="txt" id="uc-wg" maxlength="30" autocomplete="off" placeholder="' + tr("Le mot des civils", "The Civilians' word") + '"><button class="btn acc" type="button" data-wg style="flex:none">' + tr("Tenter", "Guess") + "</button></div></div>" : SB.u.dock('<p class="wait">' + tr(esc(ctx.name(s.out)) + " cherche le mot…", esc(ctx.name(s.out)) + " is trying to guess the word…") + "</p>")), r => {
        const b = r.querySelector("[data-wg]");
        if(b){ const inp = r.querySelector("#uc-wg"); const go = () => { const g = clean(inp.value, 30); if(!g) return; b.disabled = true; ctx.send({ g }); }; b.addEventListener("click", go); inp.addEventListener("keydown", e => { if(e.key === "Enter") go(); }); }
      });
    } else if(s.phase === "out"){
      const t = s.tally || {}, rows = Object.keys(t).sort((a, b) => t[b] - t[a]);
      const head = s.tie ? '<div class="verdict">' + tr("Égalité", "Tie") + '</div><p style="font-size:17px">' + tr("Personne n'est éliminé ce tour-ci. On repart pour un tour d'indices.", "Nobody is out this round. On to another round of clues.") + "</p>"
        : '<span class="eyebrow">' + tr("Éliminé(e)", "Voted out") + '</span><div class="who">' + esc(ctx.name(s.out)) + '</div><p style="font-size:18px">' + tr(esc(ctx.name(s.out)) + " était <b>", esc(ctx.name(s.out)) + " was <b>") + roleLabel(roles[s.out]) + "</b>." + (roles[s.out] === "w" ? (s.wg ? tr(" Sa proposition, « " + esc(s.wg) + " », est fausse.", " Their guess, “" + esc(s.wg) + "”, is wrong.") : tr(" Il (elle) n'a rien proposé.", " They didn't make a guess.")) : tr(" Son mot : « " + esc(words[s.out]) + " ».", " Their word: “" + esc(words[s.out]) + "”.")) + "</p>";
      const open = s.tw === "decouvert" ? '<div class="field"><span class="eyebrow">' + tr("Vote à découvert", "Open vote") + '</span><ul class="list">' + A(s.vl).map(A).map(v => '<li><span class="t" style="font-size:17px">' + esc(ctx.name(v[0])) + " → " + esc(ctx.name(v[1])) + "</span></li>").join("") + "</ul></div>" : "";
      screen(root, "out" + s.k + ctx.isHost + s.tie + s.out, head + '<div class="field"><span class="eyebrow">Votes</span><div class="bars">' + rows.map(id => '<div class="bar"><div class="lb"><span>' + esc(ctx.name(id)) + "</span><span>" + t[id] + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * t[id] / Math.max(1, alive.length + (s.tie ? 0 : 1))) + '%"></div></div></div>').join("") + "</div></div>" + open +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + tr("Continuer", "Continue") + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s, al = A(st.alive), ro = st.roles || {};
          if(st.phase !== "out") return;
          const bad = count(al, ro, "u") + count(al, ro, "w"), civ = count(al, ro, "c");
          if(bad === 0) c.set({ phase: "end", winner: "c" });
          else if(bad >= civ) c.set({ phase: "end", winner: "u" });
          else {
            const tw = rollTwist(c.opts.twists !== false, st.tw, false);
            c.set({ phase: "clues", order: firstNotWhite(shuffle(al.filter(id => c.here(id))), ro), turn: 0, clues: [], round: st.round + 1, tw, tp: tw === "lettre" ? SB.u.pick(LETTERS.split("")) : "", k: c.rid() });
          }
        }));
      });
    } else if(s.phase === "end"){
      const aw = awards(ctx.ids, roles, s.vh, s.outAt || {}, s.round, ctx.name);
      screen(root, "end" + ctx.isHost, '<span class="eyebrow">' + tr("Fin de la partie", "Game over") + '</span><div class="verdict">' + winTitle(s.winner) + "</div>" + (s.winner === "w" ? '<p style="font-size:17px">' + tr(esc(ctx.name(s.out)) + " a trouvé « " + esc(s.civ) + " ».", esc(ctx.name(s.out)) + " found “" + esc(s.civ) + "”.") + "</p>" : "") +
        '<div class="card"><div class="scale"><span>' + tr("Mot des civils", "Civilians' word") + "</span><span>" + tr("Mot des intrus", "Undercover word") + '</span></div><div class="scale" style="color:var(--ink); font-size:22px; font-weight:800"><span>' + esc(s.civ) + "</span><span>" + esc(s.und) + "</span></div></div>" +
        awardsHTML(aw) +
        '<ul class="list">' + ctx.ids.map(id => '<li><span class="t">' + esc(ctx.name(id)) + '</span><span class="by">' + roleName(roles[id]) + (alive.indexOf(id) >= 0 ? tr(" · encore en jeu", " · still in") : tr(" · éliminé(e)", " · out")) + "</span></li>").join("") + "</ul>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const ro = c.s.roles || {}, bads = c.ids.filter(id => ro[id] !== "c").map(id => c.name(id) + (ro[id] === "w" ? " (Mister White)" : ""));
          const aw2 = awards(c.ids, ro, c.s.vh, c.s.outAt || {}, c.s.round, c.name);
          c.end({ title: winTitle(c.s.winner), lines: tr(["Camp des intrus : " + bads.join(", "), "Civils : « " + c.s.civ + " » · Intrus : « " + c.s.und + " »"].concat(aw2.map(a => a[0] + " : " + a[1])), ["Impostors: " + bads.join(", "), "Civilians: “" + c.s.civ + "” · Undercover: “" + c.s.und + "”"].concat(aw2.map(a => a[0] + ": " + a[1]))), win: winners(c.ids, ro, c.s.winner) });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 3, max: 16 },
    start(root, api){
      const names = api.names, n = names.length;
      let L;
      function deal(){
        const st = SB.u.store(), cs = cast(n, 0, !!st.ucWhite);
        const { civ, und } = pickPair(!!st.ucHard && SB.hard(), SB.lang());
        const sh = shuffle(names.map((_, i) => i)), imps = sh.slice(0, cs.imp), wh = cs.white ? sh[cs.imp] : -1;
        L = { phase: "deal", i: 0, seen: false, civ, und, roles: names.map((_, i) => i === wh ? "w" : imps.indexOf(i) >= 0 ? "u" : "c"), alive: names.map((_, i) => i), out: -1, round: 1, winner: "", tw: "", tp: "", first: -1, outAt: {}, wg: "", twOn: st.ucTw !== false, gk: Math.random().toString(36).slice(2, 8) };
      }
      function talk(){
        const ok = L.alive.filter(i => L.roles[i] !== "w");
        L.first = SB.u.pick(ok.length ? ok : L.alive); L.phase = "talk";
      }
      function after(){
        const bad = L.alive.filter(i => L.roles[i] !== "c").length, c = L.alive.length - bad;
        if(bad === 0){ L.winner = "c"; L.phase = "end"; }
        else if(bad >= c){ L.winner = "u"; L.phase = "end"; }
        else { L.round++; L.tw = rollTwist(L.twOn, L.tw, true); L.tp = L.tw === "lettre" ? SB.u.pick(LETTERS.split("")) : ""; talk(); }
        if(L.phase === "end") api.win(names.filter((_, i) => L.winner === "c" ? L.roles[i] === "c" : L.winner === "w" ? L.roles[i] === "w" : L.roles[i] !== "c"));
      }
      // Gages sur un seul téléphone : une clé par tour, pour ne jamais compter deux fois.
      const gage = (i, ev) => { if(api.gage) api.gage([{ id: i < 0 ? "" : names[i], ev }], "uc" + L.gk + ":" + L.round); };
      L = { phase: "setup" };
      const go = () => {
        if(L.phase === "setup"){
          const st = SB.u.store(), hard = !!st.ucHard, white = !!st.ucWhite, tw = st.ucTw !== false;
          screen(root, "setup" + hard + white + tw, '<p class="howto">' + tr("Le téléphone passe de main en main : chacun découvre son mot en secret. Les intrus ne savent pas qu'ils le sont.", "Pass the phone around: everyone sees their word in secret. The Undercovers don't know they're Undercover.") + "</p>" +
            '<div class="packs">' + packBtn("data-w", white, "Mister White", tr("Un joueur sans mot qui peut gagner en devinant celui des civils", "A player with no word who can win by guessing the Civilians' word")) + packBtn("data-t", tw, tr("Coups de théâtre", "Plot twists"), tr("Environ un tour sur trois, une contrainte s'ajoute", "About one round in three adds a constraint")) +
            (SB.hard() ? packBtn("data-h", hard, tr("Ajouter le contenu 18+", "Add 18+ content"), tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult content"), true) : "") + "</div>" +
            '<div class="dock"><button class="btn acc" type="button" data-go>' + tr("Distribuer les mots", "Deal the words") + "</button></div>", r => {
            const h = r.querySelector("[data-h]"); if(h) h.addEventListener("click", () => { SB.u.persist({ ucHard: !hard }); go(); });
            r.querySelector("[data-w]").addEventListener("click", () => { SB.u.persist({ ucWhite: !white }); go(); });
            r.querySelector("[data-t]").addEventListener("click", () => { SB.u.persist({ ucTw: !tw }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => { deal(); go(); });
          });
        } else if(L.phase === "deal"){
          const nm = names[L.i], isW = L.roles[L.i] === "w";
          if(!L.seen){
            screen(root, "d" + L.i, '<span class="eyebrow">' + tr("Distribution · ", "Dealing · ") + (L.i + 1) + " / " + n + '</span><div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(nm) + "</div><p>" + tr("Seul(e) " + esc(nm) + " doit voir l'écran.", "Only " + esc(nm) + " should see the screen.") + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("Voir mon mot", "Show my word") + "</button></div>", r => {
              r.querySelector("[data-n]").addEventListener("click", () => { L.seen = true; go(); });
            });
          } else {
            screen(root, "s" + L.i, '<span class="eyebrow">' + esc(nm) + '</span><div class="card acc"><span class="eyebrow">' + (isW ? tr("Ton rôle", "Your role") : tr("Ton mot secret", "Your secret word")) + '</span><p class="huge">' + (isW ? "Mister White" : esc(L.roles[L.i] === "u" ? L.und : L.civ)) + "</p>" + (isW ? '<p class="sm">' + tr("Tu n'as pas de mot. Bluffe ! Si on t'élimine, devine le mot des civils pour gagner.", "You have no word. Bluff! If you get voted out, guess the Civilians' word to win.") + "</p>" : "") + '</div><p class="howto">' + tr("Retiens-le, puis cache l'écran.", "Memorize it, then hide the screen.") + '</p><div class="dock"><button class="btn acc" type="button" data-n>' + tr("C'est retenu", "Got it, hide") + "</button></div>", r => {
              r.querySelector("[data-n]").addEventListener("click", () => { L.seen = false; L.i++; if(L.i >= n) talk(); go(); });
            });
          }
        } else if(L.phase === "talk"){
          const how = L.tw === "deux" ? "un indice de deux mots" : L.tw === "verbe" ? "un verbe à l'infinitif" : L.tw === "emotion" ? "une émotion ou une sensation" : L.tw === "lieu" ? "un lieu" : L.tw === "lettre" ? "un indice commençant par " + esc(L.tp) : "un indice en un mot";
          const howEn = L.tw === "deux" ? "a two-word clue" : L.tw === "verbe" ? "a single verb" : L.tw === "emotion" ? "an emotion" : L.tw === "lieu" ? "a place" : L.tw === "lettre" ? "a clue starting with " + esc(L.tp) : "a one-word clue";
          screen(root, "t" + L.round, '<span class="eyebrow">' + tr("Tour ", "Round ") + L.round + "</span>" + twBanner(L.tw, L.tp) + '<div class="pass"><span class="eyebrow">' + tr("À vous de jouer", "Your turn, everyone") + '</span><div class="who">' + tr("Indices !", "Clues!") + "</div><p>" + tr("Chacun son tour, donnez " + how + " en rapport avec votre mot, sans le prononcer. C'est <b>" + esc(names[L.first]) + "</b> qui commence. Ensuite, votez à voix haute." + (L.tw === "double" ? " Le vote de " + esc(names[L.first]) + " compte double." : ""), "Take turns giving " + howEn + " about your word, without saying it. <b>" + esc(names[L.first]) + "</b> goes first. Then vote out loud." + (L.tw === "double" ? " " + esc(names[L.first]) + "'s vote counts twice." : "")) + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("On a voté", "We've voted") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "elim"; go(); });
          });
        } else if(L.phase === "elim"){
          const imm = L.tw === "immunite" ? L.first : -1;
          screen(root, "e" + L.round, '<span class="eyebrow">' + tr("Tour ", "Round ") + L.round + '</span><p class="big">' + tr("Qui a été éliminé(e) ?", "Who got voted out?") + '</p><div class="choices">' + L.alive.map(i => '<button type="button" class="opt" data-i="' + i + '"' + (i === imm ? " disabled" : "") + ">" + esc(names[i]) + (i === imm ? tr(" · immunisé(e)", " · immune") : "") + "</button>").join("") + '</div><button class="link" type="button" data-tie style="align-self:center">' + tr("Égalité, personne ne sort", "Tie, nobody's out") + "</button>", r => {
            r.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => { L.out = +b.dataset.i; L.alive = L.alive.filter(i => i !== L.out); L.outAt[L.out] = L.round; L.wg = ""; L.phase = L.roles[L.out] === "w" ? "wpass" : "out"; if(L.phase === "out") gage(L.out, L.roles[L.out] === "u" ? "demasque" : "innocent"); go(); }));
            r.querySelector("[data-tie]").addEventListener("click", () => { gage(-1, "egalite"); L.round++; L.tw = rollTwist(L.twOn, L.tw, true); L.tp = L.tw === "lettre" ? SB.u.pick(LETTERS.split("")) : ""; talk(); go(); });
          });
        } else if(L.phase === "wpass"){
          screen(root, "wp" + L.round, '<span class="eyebrow">' + tr("Éliminé(e)", "Voted out") + '</span><div class="who">' + esc(names[L.out]) + '</div><p style="font-size:18px">' + tr(esc(names[L.out]) + " était <b>Mister White</b>. Donnez-lui le téléphone : s'il (elle) devine le mot des civils, il (elle) gagne seul(e).", esc(names[L.out]) + " was <b>Mister White</b>. Hand them the phone: if they guess the Civilians' word, they win alone.") + "</p>" +
            '<div class="card acc"><span class="eyebrow">' + tr("Ta proposition", "Your guess") + '</span><div class="row"><input class="txt" id="uc-wg" maxlength="30" autocomplete="off" placeholder="' + tr("Le mot des civils", "The Civilians' word") + '"><button class="btn acc" type="button" data-wg style="flex:none">' + tr("Tenter", "Guess") + "</button></div></div>", r => {
            const inp = r.querySelector("#uc-wg");
            const go2 = () => { const g = clean(inp.value, 30); if(!g) return; L.wg = g; if(norm(g) && norm(g) === norm(L.civ)){ L.winner = "w"; L.phase = "end"; api.win([names[L.out]]); } else { L.phase = "out"; gage(L.out, "demasque"); } go(); };
            r.querySelector("[data-wg]").addEventListener("click", go2); inp.addEventListener("keydown", e => { if(e.key === "Enter") go2(); });
          });
        } else if(L.phase === "out"){
          const r0 = L.roles[L.out];
          screen(root, "o" + L.round, '<span class="eyebrow">' + tr("Éliminé(e)", "Voted out") + '</span><div class="who">' + esc(names[L.out]) + '</div><p style="font-size:18px">' + tr(esc(names[L.out]) + " était <b>", esc(names[L.out]) + " was <b>") + roleLabel(r0) + "</b>." + (r0 === "w" ? tr(" Sa proposition, « " + esc(L.wg) + " », est fausse.", " Their guess, “" + esc(L.wg) + "”, is wrong.") : "") + "</p><div class=\"grow\"></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("Continuer", "Continue") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { after(); go(); });
          });
        } else if(L.phase === "end"){
          const aw = awards(names.map((_, i) => i), L.roles, [], L.outAt, L.round, i => names[i]);
          screen(root, "end", '<span class="eyebrow">' + tr("Fin de la partie", "Game over") + '</span><div class="verdict">' + winTitle(L.winner) + '</div><div class="card"><div class="scale"><span>' + tr("Mot des civils", "Civilians' word") + "</span><span>" + tr("Mot des intrus", "Undercover word") + '</span></div><div class="scale" style="color:var(--ink); font-size:22px; font-weight:800"><span>' + esc(L.civ) + "</span><span>" + esc(L.und) + "</span></div></div>" + awardsHTML(aw) + '<ul class="list">' +
            names.map((nm, i) => '<li><span class="t">' + esc(nm) + '</span><span class="by">' + roleName(L.roles[i]) + "</span></li>").join("") + '</ul><div class="dock"><button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
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
