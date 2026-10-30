/* 7 secondes — un thème, 7 secondes pour citer 3 choses. Les autres valident ou non.
   Duel : deux joueurs en même temps, le plus rapide gagne. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz, clean } = SB.u;

/* ---------- Les thèmes (sans le nombre : « 3 marques de voiture ») ---------- */
const T = s => s.split("|");
const FR = {
  cl: T("marques de voiture|choses qu'on trouve dans une salle de bain|pays qui commencent par un M|animaux avec des rayures|métiers où on porte un uniforme|fruits rouges|choses qui volent|capitales européennes|instruments de musique|choses rondes|outils de bricolage|mots qui riment avec « bateau »|langues étrangères|animaux qui vivent dans l'eau|choses qu'on trouve dans une cuisine|marques de vêtements|choses qui piquent|planètes|meubles|moyens de transport|choses froides|fleurs|choses qu'on emporte à la plage|villes françaises|métiers de la santé|animaux à plumes|objets de bureau|choses qui font du bruit|prénoms qui commencent par un L|jeux de société|choses jaunes|insectes|pièces d'une maison|choses qu'on fait le dimanche|matières à l'école|choses qui ont des roues|arbres|choses qu'on met dans un sac|mots anglais qu'on utilise en français|marques de téléphone|super-pouvoirs|monuments célèbres|animaux de la savane|choses qui brillent|métiers de nuit|vêtements d'hiver|choses dans une trousse|départements français|émotions|choses qui coulent|signes du zodiaque|choses avec des boutons|animaux qui font peur|objets qu'on oublie toujours|langages de programmation|réseaux sociaux|marques de chaussures|choses qui sentent bon|choses qui sentent mauvais|pays d'Afrique"),
  bouffe: T("fromages|sauces de kebab|plats qu'on mange avec les doigts|céréales du petit-déj|trucs qu'on met dans une raclette|légumes verts|desserts au chocolat|garnitures de pizza|plats italiens|fast-foods|bonbons|épices|plats de Noël|fruits exotiques|sortes de pâtes|boissons chaudes|sandwichs|choses qu'on fait au barbecue|plats asiatiques|parfums de glace|choses qu'on trempe dans le café|marques de chips|plats de cantine|soupes|viennoiseries|fruits secs|plats régionaux français|condiments|légumes qu'on mange crus|trucs qu'on met dans un tacos|biscuits|sodas|plats qu'on commande en livraison|façons de cuire un œuf|aliments orange|choses qu'on mange au cinéma|fruits de mer|plats mexicains|aliments qui puent|choses qu'on mange à l'apéro|trucs qu'on met sur des crêpes|plats qu'on mange à la plage|choses qu'on met dans une salade|desserts aux fruits|marques de yaourt"),
  pop: T("personnages de Disney|séries Netflix|Pokémon|rappeurs français|films avec des zombies|jeux vidéo de foot|super-héros Marvel|personnages de Harry Potter|chanteuses françaises|films de Noël|dessins animés des années 90|personnages des Simpson|youtubeurs français|jeux vidéo de combat|méchants de films|émissions de téléréalité|films d'horreur|séries policières|personnages de Star Wars|films Pixar|tubes de l'été|groupes de rock|jeux sur téléphone|applis qu'on a tous|personnages de Mario|mangas|princesses Disney|acteurs qui ont joué James Bond|personnages de Friends|émissions de cuisine|jeux Nintendo|films qui font pleurer|influenceurs|rappeurs américains|personnages de Dragon Ball|chansons à chanter au karaoké|séries françaises|personnages de contes|BD franco-belges|robots célèbres|sorciers célèbres|animaux célèbres de dessins animés|personnages de One Piece|films de Marvel|chanteurs des années 80|jeux vidéo de course"),
  sport: T("clubs de Ligue 1|sports avec une raquette|joueurs du PSG|sports olympiques d'hiver|sports de combat|clubs de foot anglais|pilotes de Formule 1|sports avec un ballon|marques de sport|sports nautiques|joueurs de l'équipe de France de foot|postes au rugby|sports qu'on fait à la plage|clubs de foot espagnols|joueurs de tennis|joueurs de NBA|stades célèbres|sports de glisse|équipements de foot|sports extrêmes|courses célèbres|sports qui se jouent à deux|disciplines d'athlétisme|coups au tennis|figures en skate|exercices à la salle de sport|championnats de foot|sports de montagne|sports où il y a un filet|sports d'équipe|anciens champions de foot|sports avec un animal"),
  soir: T("excuses pour rentrer tôt|choses qu'on regrette le lendemain|choses qu'on perd en soirée|chansons qui passent en boîte|trucs qu'on mange à 4 h du matin|choses qu'on dit à un videur|soirées à thème|choses qu'on trouve dans un frigo d'étudiant|danses de soirée|jeux de cartes de soirée|choses qu'on envoie à son ex à 3 h du matin|choses dans un sac de soirée|façons de s'incruster dans une soirée|chansons pour finir une soirée|déguisements de soirée"),
  alc: T("cocktails|jeux à boire|marques de bière|alcools forts|façons de dire « je suis bourré »|remèdes contre la gueule de bois|vins|choses qu'on fait bourré|marques de champagne|prétextes pour boire un verre|shots|façons d'ouvrir une bouteille sans décapsuleur|softs pour couper l'alcool|apéritifs"),
  galere: T("excuses pour être en retard|trucs qu'on perd tout le temps|choses qui énervent dans le métro|phrases de parents|excuses pour annuler un rendez-vous|choses qui tombent toujours en panne|bruits qui empêchent de dormir|choses qu'on oublie en vacances|phrases de profs|choses qu'on fait en réunion pour s'occuper|trucs qui coûtent trop cher|façons de se faire mal bêtement|phrases du service client|excuses pour ne pas faire le ménage|choses qui puent dans un appart|petits mensonges du quotidien|choses qu'on fait quand on s'ennuie|corvées ménagères|choses qui collent|galères de déménagement|choses qui font peur la nuit|raisons de se disputer en couple|questions d'entretien d'embauche|trucs qui énervent chez le coloc|choses qu'on dit en arrivant en retard|endroits où on attend longtemps|façons de rater un train|choses qu'on fait sur son téléphone aux toilettes|choses qu'on dit à un enfant qui pleure|papiers administratifs"),
  hot: T("positions sexuelles|endroits insolites pour faire l'amour|sex toys|façons de dire « faire l'amour »|trucs qui tuent l'ambiance au lit|parties du corps sexy|tenues sexy|fantasmes courants|applis de rencontre|choses qu'on dit au lit|zones érogènes|accessoires coquins|choses à faire avant un premier rendez-vous|préliminaires|signes qu'un rencard se passe bien|endroits pour un premier baiser|choses qu'on ne dit jamais au lit|excuses pour ne pas coucher ce soir|choses qu'on cache avant de ramener quelqu'un chez soi|sortes de baisers|mots doux|métiers qui font fantasmer|choses qu'on trouve dans un sex-shop|chansons pour faire l'amour|jeux coquins|sortes de lingerie|choses à écrire dans un sexto"),
  trash: T("surnoms pour le sexe d'un homme|surnoms pour le sexe d'une femme|catégories de sites porno|trucs gênants dans un historique internet|pratiques sexuelles|fétiches|sites porno|mots crus pour dire « baiser »|choses qu'on peut utiliser comme lubrifiant|mots de dirty talk|endroits où il ne faut pas se faire surprendre en train de baiser|accessoires BDSM|trucs dégoûtants pendant le sexe|actrices ou acteurs porno|mots pour dire « se masturber »|choses à ne jamais dire juste après le sexe|positions au nom bizarre"),
  kid: T("couleurs|animaux de la ferme|super-héros|dessins animés|choses dans un cartable|fruits|animaux du zoo|jouets|choses qu'on mange au goûter|sports|métiers|véhicules|choses qu'on voit dans le ciel|vêtements|parties du corps|princesses|choses froides|animaux qui volent|légumes|jeux de la récré|choses dans une chambre|instruments de musique|formes géométriques|personnages de contes|choses qu'on emporte à la plage|monstres|choses vertes|insectes|bonbons|animaux de la mer|choses qu'on fait à Noël|dinosaures|choses qui roulent|mots qui commencent par B|animaux avec de longues oreilles")
};
const EN = {
  cl: T("car brands|things in a bathroom|countries starting with M|animals with stripes|jobs with a uniform|red fruits|things that fly|European capitals|musical instruments|round things|DIY tools|words that rhyme with “cat”|foreign languages|animals that live in water|things in a kitchen|clothing brands|things that sting|planets|pieces of furniture|means of transport|cold things|flowers|things you take to the beach|cities in your country|healthcare jobs|birds|office supplies|noisy things|names starting with L|board games|yellow things|insects|rooms in a house|things you do on Sunday|school subjects|things with wheels|trees|things in a bag|phone brands|superpowers|famous monuments|savanna animals|shiny things|night jobs|winter clothes|things in a pencil case|emotions|zodiac signs|things with buttons|scary animals|things you always forget|programming languages|social networks|shoe brands|things that smell good|things that smell bad"),
  bouffe: T("cheeses|burger toppings|finger foods|breakfast cereals|pizza toppings|green vegetables|chocolate desserts|Italian dishes|fast-food chains|candies|spices|Christmas dishes|exotic fruits|pasta shapes|hot drinks|sandwiches|things you grill on a barbecue|Asian dishes|ice cream flavors|things you dunk in coffee|chip brands|school cafeteria dishes|soups|pastries|condiments|raw vegetables|cookies|sodas|takeout dishes|ways to cook an egg|orange foods|movie snacks|seafood|Mexican dishes|smelly foods|party snacks|pancake toppings|salad ingredients"),
  pop: T("Disney characters|Netflix shows|Pokémon|rappers|zombie movies|soccer video games|Marvel superheroes|Harry Potter characters|female singers|Christmas movies|90s cartoons|Simpsons characters|YouTubers|fighting games|movie villains|reality shows|horror movies|cop shows|Star Wars characters|Pixar movies|summer hits|rock bands|mobile games|apps we all have|Mario characters|manga|Disney princesses|James Bond actors|Friends characters|cooking shows|Nintendo games|tearjerker movies|influencers|Dragon Ball characters|karaoke songs|fairy tale characters|famous robots|famous wizards|famous cartoon animals|One Piece characters|Marvel movies|80s singers|racing games"),
  sport: T("soccer clubs|racket sports|Formula 1 drivers|Winter Olympic sports|combat sports|English soccer clubs|ball sports|sportswear brands|water sports|rugby positions|beach sports|Spanish soccer clubs|tennis players|NBA players|famous stadiums|board sports|soccer gear|extreme sports|famous races|one-on-one sports|track and field events|tennis shots|skateboard tricks|gym exercises|soccer leagues|mountain sports|sports with a net|team sports|soccer legends"),
  soir: T("excuses to leave early|things you regret the next day|things you lose at a party|club songs|4 a.m. foods|things you say to a bouncer|theme parties|things in a student's fridge|party dances|party card games|things you text your ex at 3 a.m.|things in a party bag|ways to crash a party|songs to end a party|party costumes"),
  alc: T("cocktails|drinking games|beer brands|liquors|ways to say “I'm drunk”|hangover cures|wines|things you do drunk|champagne brands|excuses for a drink|shots|ways to open a bottle without an opener|mixers|aperitifs"),
  galere: T("excuses for being late|things you always lose|things that annoy you on the subway|things parents say|excuses to cancel plans|things that always break|noises that keep you awake|things you forget on vacation|things teachers say|things you do in meetings to stay awake|overpriced things|dumb ways to get hurt|customer service phrases|excuses to skip chores|things that smell in an apartment|everyday white lies|things you do when bored|household chores|sticky things|moving day disasters|things that scare you at night|reasons couples fight|job interview questions|annoying roommate habits|things you say when you're late|places with long waits|ways to miss a train|things you do on your phone in the bathroom|paperwork"),
  hot: T("sex positions|unusual places to have sex|sex toys|ways to say “have sex”|mood killers in bed|sexy body parts|sexy outfits|common fantasies|dating apps|things people say in bed|erogenous zones|naughty accessories|things to do before a first date|foreplay moves|signs a date is going well|places for a first kiss|things you never say in bed|excuses not to hook up tonight|things you hide before bringing someone home|kinds of kisses|pet names|jobs people fantasize about|things in a sex shop|songs to have sex to|naughty games|kinds of lingerie|things to write in a sext"),
  trash: T("nicknames for a penis|nicknames for a vagina|porn categories|embarrassing browser history items|sex acts|fetishes|porn sites|crude words for having sex|things you could use as lube|dirty talk words|places you shouldn't get caught having sex|BDSM gear|gross things during sex|porn stars|words for masturbating|things never to say right after sex|weirdly named positions"),
  kid: T("colors|farm animals|superheroes|cartoons|things in a backpack|fruits|zoo animals|toys|snacks|sports|jobs|vehicles|things in the sky|clothes|body parts|princesses|cold things|animals that fly|vegetables|playground games|things in a bedroom|musical instruments|shapes|fairy tale characters|things for the beach|monsters|green things|insects|candies|sea animals|Christmas things|dinosaurs|things that roll|words starting with B|animals with long ears")
};
const LISTS = { fr: FR, en: EN };
const LL = lg => LISTS[lg === "en" ? "en" : "fr"];
// 4 paquets : chacun regroupe plusieurs listes de thèmes (« soir » ajoute les thèmes d'alcool seulement en Hard).
const GROUPS = { cl: ["cl", "bouffe", "sport", "galere"], pop: ["pop", "soir"], x18: ["hot", "trash"], kid: ["kid"] };
const gl = (v, lg) => [].concat(...GROUPS[v].map(k => LL(lg)[k]));
const PACKS = [
  { v: "cl", label: tr("Classique", "Classic"), desc: tr("Culture G, bouffe, sport, galères du quotidien", "General knowledge, food, sports, daily hassles"), list: gl("cl", SB.lang()) },
  { v: "pop", label: tr("Pop & soirée", "Pop & party"), desc: tr("Séries, films, jeux vidéo, musique, soirées", "Shows, movies, video games, music, parties"), list: gl("pop", SB.lang()) },
  { v: "x18", label: "Hot & trash", desc: tr("Sexe, du coquin au très cru", "Sex, from naughty to very raw"), list: gl("x18", SB.lang()), hot: true },
  { v: "kid", label: tr("Enfants", "Kids"), desc: tr("Thèmes faciles, 10 secondes au lieu de 7", "Easy themes, 10 seconds instead of 7"), list: gl("kid", SB.lang()), kid: true }
];
const SEEN = "sept:t";
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; };
const myThemes = () => A(store().septCustom).map(x => clean(x, 80)).filter(Boolean).slice(0, 100);
// Pioche : chaque thème garde son paquet (pour les 10 secondes des enfants).
function deckFor(packs, lg, custom){
  const sel = A(packs), L = LL(lg), out = [];
  PACKS.filter(p => sel.indexOf(p.v) >= 0).forEach(p => GROUPS[p.v].forEach(k => { L[k].concat(k === "soir" && SB.hard() ? L.alc : []).forEach(t => out.push(k + "|" + t)); }));
  A(custom).forEach(t => out.push("perso|" + t));
  let pool = out.length ? out : L.cl.map(t => "cl|" + t);
  if(SB.kid && SB.kid()){ const k = pool.filter(x => x.indexOf("kid|") === 0 || SB.kidOk(x)); if(k.length) pool = k; }
  return SB.u.fresh(SEEN, pool);
}
const thPack = x => String(x).split("|")[0], thText = x => String(x).split("|").slice(1).join("|");
// Le thème affiché : « 3 marques de voiture » (les thèmes perso sont affichés tels quels).
const themeTxt = (x, n) => (thPack(x) === "perso" ? thText(x) : n + " " + thText(x));
const secsFor = (x, tw) => (tw === "cinq" ? 5 : thPack(x) === "kid" ? 10 : 7);

/* ---------- Coups de théâtre ---------- */
const TW = [
  { id: "cinq", name: tr("5 secondes", "5 seconds"), desc: tr("Seulement 5 secondes pour ce tour !", "Only 5 seconds this turn!") },
  { id: "quatre", name: tr("4 réponses", "4 answers"), desc: tr("Il faut en citer 4 au lieu de 3.", "Name 4 instead of 3.") },
  { id: "choix", name: tr("Thème imposé", "Imposed theme"), desc: tr("Le joueur précédent choisit le thème parmi trois.", "The previous player picks the theme out of three."), ok: o => o.n >= 2 },
  { id: "duel", name: tr("Duel", "Duel"), desc: tr("Deux joueurs répondent en même temps. Le plus rapide gagne le point.", "Two players answer at the same time. The fastest gets the point."), ok: o => o.n >= 3 }
];

/* ---------- Bip de fin ---------- */
let AC = null;
function beep(ms, f){ try{ AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f || 880; o.connect(g); g.connect(AC.destination); g.gain.setValueAtTime(.25, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + ms / 1000); o.start(); o.stop(AC.currentTime + ms / 1000); }catch(e){} }

const CSS = '<style data-sp>' +
  '.sp-t{font-family:var(--f-disp); font-size:110px; line-height:1; text-align:center; color:var(--acc)}.sp-t.low{color:var(--bad)}.sp-t.end{font-size:56px}' +
  '.sp-th{text-align:center}.sp-th .eyebrow{display:block}.sp-th b{display:block; font-family:var(--f-disp); font-size:30px; line-height:1.1}' +
  '.sp-ab{display:grid; grid-template-columns:1fr 1fr; gap:8px}.sp-ab button{min-height:64px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:900; font-size:18px}' +
  '.sp-ab button.ok[aria-pressed="true"]{background:#2fa860; border-color:#2fa860; color:#fff}.sp-ab button.ko[aria-pressed="true"]{background:#e8414e; border-color:#e8414e; color:#fff}.sp-ab button.x[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--dark,#14101a)}' +
  '.sp-v{text-align:center; font-family:var(--f-disp); font-weight:800; font-size:32px; margin:0}.sp-v.ok{color:#2fa860}.sp-v.ko{color:var(--bad)}' +
  '.sp-who{text-align:center; font-family:var(--f-disp); font-size:36px; line-height:1.1}.sp-row{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line)}.sp-row b{flex:1}.sp-row .n{font-family:var(--f-disp); font-weight:800; font-size:22px}.sp-list{display:flex; flex-direction:column; gap:6px}</style>';
const standings = (ids, pts, nameOf) => '<div class="sp-list">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map((id, i) => '<div class="sp-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="n">' + (pts[id] || 0) + "</span></div>").join("") + "</div>";
function awards(ids, S2, nameOf){
  const out = [], best = S2.best || {}, ko = S2.koc || {};
  const f = ids.filter(id => best[id]).sort((a, b) => best[a] - best[b])[0];
  if(f) out.push([tr("L'éclair", "The lightning"), nameOf(f), tr("Le plus rapide : " + (best[f] / 1000).toFixed(1).replace(".", ",") + " s", "Fastest: " + (best[f] / 1000).toFixed(1) + " s")]);
  const k = ids.filter(id => ko[id]).sort((a, b) => ko[b] - ko[a])[0];
  if(k) out.push([tr("La tête vide", "The blank mind"), nameOf(k), tr(ko[k] + " thème" + (ko[k] > 1 ? "s" : "") + " raté" + (ko[k] > 1 ? "s" : ""), ko[k] + (ko[k] === 1 ? " miss" : " misses"))]);
  return out;
}
function editor(){
  SB.page(tr("Nos thèmes perso", "Our own themes"), root => {
    root.innerHTML = '<div class="gs"><p class="howto">' + tr("Un thème par ligne, écrit en entier avec le nombre. Ex. : « 3 ex de Kévin », « 3 anecdotes de la colo ». Ils se mélangent aux paquets avec l'option « Nos thèmes perso ».", "One theme per line, written in full with the number. E.g. “3 of Kevin's exes”, “3 summer camp stories”. They mix in with the packs when “Our own themes” is on.") + "</p>" +
      '<textarea class="txt" id="sp-th" rows="10" placeholder="' + tr("3 ex de Kévin\n3 trucs que dit toujours Léa", "3 of Kevin's exes\n3 things Lea always says") + '"></textarea><p class="sm" data-n></p></div>';
    const ta = root.querySelector("#sp-th"), n = root.querySelector("[data-n]");
    ta.value = myThemes().join("\n");
    const save = () => { const t = ta.value.split("\n").map(x => clean(x, 80)).filter(Boolean).slice(0, 100); persist({ septCustom: t }); n.textContent = tr(t.length + " thème" + (t.length > 1 ? "s" : ""), t.length + (t.length === 1 ? " theme" : " themes")); };
    ta.addEventListener("input", save); save();
  });
}
const nextTw = (on, n, last, live) => (on && n > 1 ? SB.u.twist(TW, { last, n: live, rate: .3 }) : null);

SB.register({
  id: "sept", name: tr("7 secondes", "7 Seconds"), glyph: "7s", pitch: tr("Un thème, 7 secondes pour citer 3 choses. Facile ? Non.", "One theme, 7 seconds to name 3 things. Easy? Nope."), hot: true, ticks: true,
  accent: { light: "#13a37f", dark: "#3fd6ad" },
  tag: tr("Un thème tombe, le chrono démarre : 7 secondes pour citer 3 choses. Les autres valident… ou pas.", "A theme drops, the clock starts: 7 seconds to name 3 things. The others decide if it counts."),
  min: 2, max: 20,
  gages: [
    { ev: "rate", label: tr("Thème raté", "Missed theme"), kind: "boit", n: 1 },
    { ev: "eclair", label: tr("Éclair : réussi en moins de 3 secondes", "Lightning: nailed in under 3 seconds"), kind: "distribue", n: 1 },
    { ev: "duel", label: tr("Perdant d'un duel", "Duel loser"), kind: "boit", n: 1 }
  ],
  rules: tr([
    "À ton tour, appuie sur « Go » : le thème s'affiche et le chrono démarre.",
    "Tu as 7 secondes pour citer 3 choses du thème à voix haute (10 secondes avec le paquet Enfants). Appuie sur « Fini ! » dès que c'est bon.",
    "Les autres votent : « Validé » ou « Raté ». En cas d'égalité, c'est validé.",
    "Réussi : 1 point (et tu distribues un gage si tu as fini en moins de 3 secondes). Raté : un gage.",
    "Coups de théâtre : 5 secondes, 4 réponses, thème imposé par le joueur précédent, duel à deux.",
    "Option « Nos thèmes perso » : ajoutez vos propres thèmes (« 3 ex de Kévin »…)."
  ], [
    "On your turn, tap “Go”: the theme appears and the clock starts.",
    "You have 7 seconds to name 3 things out loud (10 seconds with the Kids pack). Tap “Done!” as soon as you have them.",
    "Everyone else votes: “Valid” or “Missed”. A tie counts as valid.",
    "Success: 1 point (and you hand out if you finished in under 3 seconds). Miss: a forfeit.",
    "Twists: 5 seconds, 4 answers, theme imposed by the previous player, duel.",
    "“Our own themes” option: add your own themes (“3 of Kevin's exes”…)."
  ]),
  options: [
    { id: "turns", label: tr("Tours par joueur", "Turns per player"), type: "seg", def: 3, values: [{ v: 2, label: "2" }, { v: 3, label: "3" }, { v: 5, label: "5" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["cl", "pop"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length })) },
    { id: "perso", label: tr("Nos thèmes perso", "Our own themes"), type: "toggle", text: tr("Nos thèmes perso", "Our own themes"), desc: tr("Mélanger vos thèmes aux paquets", "Mix your themes with the packs"), def: true },
    { id: "edit", type: "button", label: tr("Modifier nos thèmes perso", "Edit our own themes"), onClick: () => editor() },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour un tour", "Now and then, a rule changes for one turn"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length && !(o.perso !== false && myThemes().length)) throw new Error(tr("Choisis au moins un paquet.", "Pick at least one pack."));
    const lg = SB.lang(), deck = deckFor(o.packs, lg, o.perso !== false ? myThemes() : []);
    const th = deck.pop(); SB.u.saw(SEEN, th); ctx.setPriv({ deck });
    return { lg, phase: "ready", order: shuffle(ctx.ids), ti: 0, done: {}, turns: o.turns || 3, th, tw: "", op: "", ch: [], startAt: 0, endAt: 0, fin: 0, res: null, pts: {}, okc: {}, koc: {}, best: {}, n: 1 };
  },
  host(ctx){
    const s = ctx.s, cur = s.order[s.ti], live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "end") return;
    if(!ctx.here(cur) && s.phase !== "res"){ nextTurnNet(ctx, s); return; }
    if(s.phase === "choix"){
      const prev = s.pv, i = ctx.input(prev), ch = A(s.ch);
      if(i && i.pk != null && ch[+i.pk]) ctx.set({ phase: "ready", th: ch[+i.pk], ch: [], k: ctx.rid() });
      else if(!ctx.here(prev)) ctx.set({ phase: "ready", th: ch[0], ch: [], k: ctx.rid() });
      return;
    }
    if(s.phase === "ready"){ const i = ctx.input(cur); if(i && i.go){ const ms = secsFor(s.th, s.tw) * 1000; ctx.set({ phase: "run", startAt: ctx.now(), endAt: ctx.now() + ms, fin: 0, k: ctx.rid() }); } return; }
    if(s.phase === "run"){
      const i = ctx.input(cur), o = s.op ? ctx.input(s.op) : null, now = ctx.now();
      const done = s.op ? (i && i.fin) || (o && o.fin) : i && i.fin;
      if(done || now >= s.endAt){
        const fin = {}; if(i && i.fin) fin[cur] = Math.max(0, Math.min(+i.t || 0, s.endAt - s.startAt)); if(o && o.fin) fin[s.op] = Math.max(0, Math.min(+o.t || 0, s.endAt - s.startAt));
        ctx.set({ phase: "vote", fin, k: ctx.rid() });
      }
      return;
    }
    if(s.phase === "vote"){
      const voters = live.filter(id => id !== cur && id !== s.op), v = {};
      const all = voters.every(id => { const x = ctx.input(id); if(x && x.v){ v[id] = x.v; return true; } return false; });
      if(voters.length && !all) return;
      const pts = Object.assign({}, s.pts), okc = Object.assign({}, s.okc), koc = Object.assign({}, s.koc), best = Object.assign({}, s.best), gl = [];
      let res;
      if(s.op){
        const cnt = {}; Object.keys(v).forEach(id => { cnt[v[id]] = (cnt[v[id]] || 0) + 1; });
        const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]), w = top.length && (top.length < 2 || cnt[top[0]] !== cnt[top[1]]) ? top[0] : "both";
        const win = w === "a" ? [cur] : w === "b" ? [s.op] : w === "none" ? [] : [cur, s.op], lose = [cur, s.op].filter(id => win.indexOf(id) < 0);
        win.forEach(id => { pts[id] = (pts[id] || 0) + 1; okc[id] = (okc[id] || 0) + 1; });
        lose.forEach(id => { koc[id] = (koc[id] || 0) + 1; gl.push({ id, ev: "duel" }); });
        res = { duel: 1, win, lose };
      } else {
        const ok = Object.keys(v).filter(id => v[id] === "ok").length, ko = Object.keys(v).length - ok, good = ok >= ko;
        const t = s.fin && s.fin[cur] != null ? s.fin[cur] : null;
        if(good){ pts[cur] = (pts[cur] || 0) + 1; okc[cur] = (okc[cur] || 0) + 1; if(t != null && (!best[cur] || t < best[cur])) best[cur] = t; if(t != null && t < 3000) gl.push({ id: cur, ev: "eclair" }); }
        else { koc[cur] = (koc[cur] || 0) + 1; gl.push({ id: cur, ev: "rate" }); }
        res = { ok: good, okv: ok, kov: ko, t };
      }
      if(gl.length) ctx.gage(gl, s.k);
      ctx.set({ phase: "res", res, pts, okc, koc, best });
      return;
    }
    if(s.phase === "res"){ const i = ctx.input(cur); if(i && i.nx) nextTurnNet(ctx, s); }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, cur = s.order[s.ti], mine = cur === me, T2 = SB.u.byTwist(TW, s.tw || ""), inp = ctx.mine() || {};
    if(s.phase === "end"){
      const aw = awards(ctx.ids, s, ctx.name), order = ctx.ids.slice().sort((a, b) => (s.pts[b] || 0) - (s.pts[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Champion du chrono", "Clock champion") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + standings(ctx.ids, s.pts, ctx.name) +
        (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.ids.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0;
          c.end({ title: tr("7 secondes : ", "7 Seconds: ") + c.name(o2[0]), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0) + " pts").concat(awards(c.ids, c.s, c.name).map(a => a[0] + tr(" : ", ": ") + a[1])), win: mx ? o2.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
      return;
    }
    const n = s.tw === "quatre" ? 4 : 3, who = s.op ? esc(ctx.name(cur)) + " vs " + esc(ctx.name(s.op)) : esc(ctx.name(cur));
    const head = CSS + '<span class="eyebrow">' + tr("Au tour de ", "") + who + tr("", "'s turn") + " · " + tr("tour ", "turn ") + (((s.done || {})[cur] || 0) + 1) + " / " + s.turns + "</span>" + SB.u.twistHTML(T2);
    const thHTML = '<div class="sp-th card acc"><span class="eyebrow">' + tr("Cite", "Name") + " · " + secsFor(s.th, s.tw) + tr(" secondes", " seconds") + "</span><b>" + esc(themeTxt(s.th, n)) + "</b></div>";
    const iPlay = mine || s.op === me;
    if(s.phase === "choix"){
      const ch = A(s.ch), pv = s.pv;
      screen(root, "ch" + s.k + (pv === me), head + (pv === me ? '<p class="howto" style="text-align:center">' + tr("Choisis le thème de " + esc(ctx.name(cur)) + " :", "Pick " + esc(ctx.name(cur)) + "'s theme:") + '</p><div class="choices">' + ch.map((x, i) => '<button type="button" class="opt" data-pk="' + i + '">' + esc(themeTxt(x, n)) + "</button>").join("") + "</div>"
        : '<p class="wait" style="text-align:center">' + tr(esc(ctx.name(pv)) + " choisit un thème pour " + esc(ctx.name(cur)) + "…", esc(ctx.name(pv)) + " is picking a theme for " + esc(ctx.name(cur)) + "…") + "</p>"), r => {
        r.querySelectorAll("[data-pk]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ pk: +b.dataset.pk }); }));
      });
      return;
    }
    if(s.phase === "ready"){
      screen(root, "rd" + s.k + mine, head + '<div class="sp-who">' + who + "</div>" + '<p class="howto" style="text-align:center">' + (mine ? tr("Prêt ? Le thème s'affiche quand tu appuies sur Go.", "Ready? The theme shows up when you tap Go.") : tr("Le thème s'affiche quand " + esc(ctx.name(cur)) + " appuie sur Go.", "The theme appears when " + esc(ctx.name(cur)) + " taps Go.")) + "</p>" +
        SB.u.dock(mine ? '<button class="btn acc" type="button" data-go>Go !</button>' : '<p class="wait">' + tr("On attend " + esc(ctx.name(cur)) + "…", "Waiting for " + esc(ctx.name(cur)) + "…") + "</p>"), r => {
        const g = r.querySelector("[data-go]"); if(g) g.addEventListener("click", () => { buzz(15); beep(120, 660); ctx.send({ go: 1 }); g.disabled = true; });
      });
      return;
    }
    if(s.phase === "run"){
      const sec = Math.max(0, Math.ceil((s.endAt - ctx.now()) / 1000));
      screen(root, "rn" + s.k + iPlay + (inp.fin ? 1 : 0), head + thHTML + '<div class="sp-t" data-t>' + sec + "</div>" + (s.op ? '<p class="sm" style="text-align:center">' + tr("Duel : le premier qui a ses " + n + " réponses appuie sur « Fini ! ».", "Duel: first one with " + n + " answers taps “Done!”.") + "</p>" : "") +
        SB.u.dock(iPlay ? '<button class="btn acc" type="button" data-fin' + (inp.fin ? " disabled" : "") + ">" + tr("Fini !", "Done!") + "</button>" : '<p class="wait">' + tr("Écoutez bien…", "Listen closely…") + "</p>"), r => {
        const f = r.querySelector("[data-fin]"); if(f) f.addEventListener("click", () => { buzz(15); ctx.send({ fin: 1, t: Math.max(0, ctx.now() - s.startAt) }); f.disabled = true; });
      });
      const el = root.querySelector("[data-t]");
      if(el){ el.textContent = sec; el.classList.toggle("low", sec <= 2); if(el.dataset.last !== String(sec)){ if(el.dataset.last && sec <= 3 && sec > 0) beep(80, 520); if(sec === 0 && el.dataset.last) { beep(500, 330); buzz([80, 60, 80]); } el.dataset.last = String(sec); } }
      return;
    }
    if(s.phase === "vote"){
      const voter = !iPlay && ctx.here(me) && ctx.playing, fin = s.fin || {};
      const tline = Object.keys(fin).length ? '<p class="sm" style="text-align:center">' + Object.keys(fin).map(id => esc(ctx.name(id)) + tr(" a fini en ", " finished in ") + (fin[id] / 1000).toFixed(1).replace(".", tr(",", ".")) + " s").join(" · ") + "</p>" : '<p class="sm" style="text-align:center">' + tr("Temps écoulé !", "Time's up!") + "</p>";
      const opts = s.op ? [["a", ctx.name(cur), "x"], ["b", ctx.name(s.op), "x"], ["both", tr("Les deux", "Both"), "x"], ["none", tr("Aucun", "Neither"), "ko"]] : [["ok", tr("Validé", "Valid"), "ok"], ["ko", tr("Raté", "Missed"), "ko"]];
      screen(root, "vt" + s.k + (inp.v || "") + voter, head + thHTML + '<div class="sp-t end">⏱</div>' + tline +
        (voter ? '<p class="howto" style="text-align:center">' + (s.op ? tr("Qui a gagné le duel ?", "Who won the duel?") : tr("Les " + n + " réponses étaient bonnes ?", "Were all " + n + " answers right?")) + '</p><div class="sp-ab">' + opts.map(o => '<button type="button" class="' + o[2] + '" data-v="' + o[0] + '" aria-pressed="' + (inp.v === o[0]) + '">' + esc(o[1]) + "</button>").join("") + "</div>" : '<p class="wait" style="text-align:center">' + tr("Les autres votent…", "The others are voting…") + "</p>") +
        SB.u.dock('<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ v: b.dataset.v }); }));
      });
      const vs = ctx.ids.filter(id => ctx.here(id) && id !== cur && id !== s.op);
      txt(root, "[data-wait]", vs.filter(id => { const x = ctx.input(id); return x && x.v; }).length + " / " + vs.length + " votes");
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {};
      const v = R.duel ? '<p class="sp-v ' + (R.win.length ? "ok" : "ko") + '">' + (R.win.length === 2 ? tr("Égalité !", "Tie!") : R.win.length ? esc(ctx.name(R.win[0])) + tr(" gagne le duel !", " wins the duel!") : tr("Personne ne gagne !", "Nobody wins!")) + "</p>"
        : '<p class="sp-v ' + (R.ok ? "ok" : "ko") + '">' + (R.ok ? tr("Validé !", "Valid!") : tr("Raté !", "Missed!")) + '</p><p class="sm" style="text-align:center">' + R.okv + tr(R.okv > 1 ? " validés · " : " validé · ", " valid · ") + R.kov + tr(R.kov > 1 ? " ratés" : " raté", " missed") + (R.ok && R.t != null && R.t < 3000 ? tr(" · Éclair ! Moins de 3 secondes", " · Lightning! Under 3 seconds") : "") + "</p>";
      screen(root, "rs" + s.k + mine + ctx.isHost, head + thHTML + v + standings(ctx.ids, s.pts, ctx.name) +
        SB.u.dock(mine || ctx.isHost ? '<button class="btn acc" type="button" data-nx>' + tr("Joueur suivant", "Next player") + "</button>" : '<p class="wait">' + tr("On attend " + esc(ctx.name(cur)) + "…", "Waiting for " + esc(ctx.name(cur)) + "…") + "</p>"), r => {
        const b = r.querySelector("[data-nx]"); if(b) b.addEventListener("click", () => { buzz(8); if(mine) ctx.send({ nx: 1 }); else ctx.act(c => { if(c.s.phase === "res" && c.s.k === s.k) nextTurnNet(c, c.s); }); });
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.spPacks).filter(v => GROUPS[v]).length ? A(st.spPacks).filter(v => GROUPS[v]) : ["cl", "pop"], turns = [2, 3, 5].indexOf(st.spTurns) >= 0 ? st.spTurns : 3, twOn = st.spTw !== false, perso = st.spPerso !== false;
      let E = null, deck = [], gno = 0, tok = Math.random().toString(36).slice(2, 7), timer = null;
      const stop = () => { clearInterval(timer); timer = null; };
      function setup(){
        stop();
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Le téléphone tourne : à ton tour, appuie sur Go et cite les réponses à voix haute. Le groupe valide ou non.", "The phone goes around: on your turn, tap Go and say your answers out loud. The group decides.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Tours par joueur", "Turns per player") + '</span><div class="seg">' + [2, 3, 5].map(n => '<button type="button" data-t="' + n + '" aria-pressed="' + (turns === n) + '">' + n + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-perso aria-pressed="' + perso + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Nos thèmes perso", "Our own themes") + '</span><span class="ds">' + tr(myThemes().length + " thème(s)", myThemes().length + " theme(s)") + "</span></span></button>" +
          '<button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("5 secondes, 4 réponses, thème imposé, duel", "5 seconds, 4 answers, imposed theme, duel") + "</span></span></button></div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Modifier nos thèmes perso", "Edit our own themes") + "</button></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
          r.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { turns = +b.dataset.t; persist({ spTurns: turns }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ spPacks: sel }); setup(); }));
          r.querySelector("[data-perso]").addEventListener("click", () => { perso = !perso; persist({ spPerso: perso }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ spTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length && !(perso && myThemes().length)){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; }
            deck = deckFor(SB.okPacks(sel, PACKS), SB.lang(), perso ? myThemes() : []); gno++;
            E = { order: shuffle(names), ti: 0, done: {}, turns, th: "", tw: "", op: "", pts: {}, okc: {}, koc: {}, best: {}, n: 0 };
            turn();
          });
        });
      }
      const drawTh = () => { if(!deck.length) deck = deckFor(SB.okPacks(sel, PACKS), SB.lang(), perso ? myThemes() : []); const t = deck.pop(); SB.u.saw(SEEN, t); return t; };
      const cur = () => E.order[E.ti], nn = () => (E.tw === "quatre" ? 4 : 3);
      const head = () => CSS + '<span class="eyebrow">' + tr("Au tour de ", "") + esc(cur()) + (E.op ? " vs " + esc(E.op) : "") + tr("", "'s turn") + " · " + tr("tour ", "turn ") + ((E.done[cur()] || 0) + 1) + " / " + E.turns + "</span>" + SB.u.twistHTML(SB.u.byTwist(TW, E.tw));
      const thHTML = () => '<div class="sp-th card acc"><span class="eyebrow">' + tr("Cite", "Name") + " · " + secsFor(E.th, E.tw) + tr(" secondes", " seconds") + "</span><b>" + esc(themeTxt(E.th, nn())) + "</b></div>";
      function turn(){
        stop(); E.n++;
        const t = twOn && E.n > 1 ? SB.u.twist(TW, { last: E.tw, n: names.length, rate: .3 }) : null; E.tw = t ? t.id : "";
        E.op = E.tw === "duel" ? pick(names.filter(x => x !== cur())) : "";
        if(E.tw === "choix"){
          const pv = E.order[(E.ti - 1 + E.order.length) % E.order.length], ch = [drawTh(), drawTh(), drawTh()];
          screen(root, "ch" + gno + ":" + E.n, head() + '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(pv) + '</div></div><p class="howto" style="text-align:center">' + tr("Choisis le thème de " + esc(cur()) + " (sans le lui montrer) :", "Pick " + esc(cur()) + "'s theme (don't show it):") + '</p><div class="choices">' + ch.map((x, i) => '<button type="button" class="opt" data-pk="' + i + '">' + esc(themeTxt(x, nn())) + "</button>").join("") + "</div>", r => {
            r.querySelectorAll("[data-pk]").forEach(b => b.addEventListener("click", () => { E.th = ch[+b.dataset.pk]; ready(); }));
          });
          return;
        }
        E.th = drawTh(); ready();
      }
      function ready(){
        screen(root, "rd" + gno + ":" + E.n, head() + '<div class="sp-who">' + esc(cur()) + (E.op ? " vs " + esc(E.op) : "") + '</div><p class="howto" style="text-align:center">' + tr("Prends le téléphone. Le thème s'affiche quand tu appuies sur Go.", "Take the phone. The theme shows up when you tap Go.") + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>Go !</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelector("[data-go]").addEventListener("click", () => { buzz(15); beep(120, 660); run(); });
          r.querySelector("[data-q]").addEventListener("click", () => { stop(); api.exit(); });
        });
      }
      function run(){
        const t0 = Date.now(), end = t0 + secsFor(E.th, E.tw) * 1000; let last = -1;
        screen(root, "rn" + gno + ":" + E.n, head() + thHTML() + '<div class="sp-t" data-t></div>' + SB.u.dock('<button class="btn acc" type="button" data-fin>' + tr("Fini !", "Done!") + "</button>"), r => {
          r.querySelector("[data-fin]").addEventListener("click", () => { buzz(15); stop(); vote(Date.now() - t0); });
        });
        const tick = () => {
          const el = root.querySelector("[data-t]"); if(!el || !root.isConnected){ stop(); return; }
          const sec = Math.max(0, Math.ceil((end - Date.now()) / 1000)); el.textContent = sec; el.classList.toggle("low", sec <= 2);
          if(sec !== last){ if(last > 0 && sec <= 3 && sec > 0) beep(80, 520); last = sec; }
          if(sec <= 0){ stop(); beep(500, 330); buzz([80, 60, 80]); vote(null); }
        };
        tick(); timer = setInterval(tick, 100);
      }
      function vote(t){
        const opts = E.op ? [["a", cur(), "x"], ["b", E.op, "x"], ["both", tr("Les deux", "Both"), "x"], ["none", tr("Aucun", "Neither"), "ko"]] : [["ok", tr("Validé", "Valid"), "ok"], ["ko", tr("Raté", "Missed"), "ko"]];
        screen(root, "vt" + gno + ":" + E.n, head() + thHTML() + '<p class="sm" style="text-align:center">' + (t != null ? tr("Fini en ", "Done in ") + (t / 1000).toFixed(1).replace(".", tr(",", ".")) + " s" : tr("Temps écoulé !", "Time's up!")) + '</p><p class="howto" style="text-align:center">' + (E.op ? tr("Le groupe décide : qui a gagné le duel ?", "The group decides: who won the duel?") : tr("Le groupe décide : c'est validé ?", "The group decides: does it count?")) + '</p><div class="sp-ab">' + opts.map(o => '<button type="button" class="' + o[2] + '" data-v="' + o[0] + '" aria-pressed="true">' + esc(o[1]) + "</button>").join("") + "</div>", r => {
          r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => decide(b.dataset.v, t)));
        });
      }
      function decide(v, t){
        const c = cur(), gl = []; let msg = "", ok = true;
        if(E.op){
          const win = v === "a" ? [c] : v === "b" ? [E.op] : v === "none" ? [] : [c, E.op], lose = [c, E.op].filter(x => win.indexOf(x) < 0);
          win.forEach(x => { E.pts[x] = (E.pts[x] || 0) + 1; E.okc[x] = (E.okc[x] || 0) + 1; }); lose.forEach(x => { E.koc[x] = (E.koc[x] || 0) + 1; gl.push({ id: x, ev: "duel" }); });
          ok = win.length > 0; msg = win.length === 2 ? tr("Égalité !", "Tie!") : win.length ? esc(win[0]) + tr(" gagne le duel !", " wins the duel!") : tr("Personne ne gagne !", "Nobody wins!");
        } else if(v === "ok"){
          E.pts[c] = (E.pts[c] || 0) + 1; E.okc[c] = (E.okc[c] || 0) + 1; if(t != null && (!E.best[c] || t < E.best[c])) E.best[c] = t; if(t != null && t < 3000) gl.push({ id: c, ev: "eclair" }); msg = tr("Validé !", "Valid!");
        } else { ok = false; E.koc[c] = (E.koc[c] || 0) + 1; gl.push({ id: c, ev: "rate" }); msg = tr("Raté !", "Missed!"); }
        if(gl.length && api.gage) api.gage(gl, "sp" + tok + "-" + gno + ":" + E.n);
        buzz(ok ? 15 : [30, 40, 30]);
        screen(root, "rs" + gno + ":" + E.n, head() + thHTML() + '<p class="sp-v ' + (ok ? "ok" : "ko") + '">' + msg + "</p>" + standings(names, E.pts, x => x) +
          SB.u.dock('<button class="btn acc" type="button" data-nx>' + tr("Joueur suivant", "Next player") + "</button>"), r => {
          r.querySelector("[data-nx]").addEventListener("click", () => { buzz(8); if(advance()) turn(); else end(); });
        });
      }
      function advance(){
        const c = cur(); E.done[c] = (E.done[c] || 0) + 1;
        for(let k = 1; k <= E.order.length; k++){ const j = (E.ti + k) % E.order.length; if((E.done[E.order[j]] || 0) < E.turns){ E.ti = j; return true; } }
        return false;
      }
      function end(){
        stop();
        const order = names.slice().sort((a, b) => (E.pts[b] || 0) - (E.pts[a] || 0)), mx = E.pts[order[0]] || 0, aw = awards(names, E, x => x);
        if(api.win){ let tries = 0; const go = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(go, 500); else api.win(mx ? order.filter(x => (E.pts[x] || 0) === mx) : []); }; go(); }
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Champion du chrono", "Clock champion") + '</span><div class="who">' + esc(order[0]) + "</div>" + standings(names, E.pts, x => x) +
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
// Réseau : joueur suivant (en sautant les absents), coup de théâtre, thème.
function nextTurnNet(c, s){
  const E = JSON.parse(JSON.stringify(s)), cur = E.order[E.ti];
  E.done[cur] = (E.done[cur] || 0) + 1;
  let j = -1;
  for(let k = 1; k <= E.order.length; k++){ const x = (E.ti + k) % E.order.length; if((E.done[E.order[x]] || 0) < E.turns && c.here(E.order[x])){ j = x; break; } }
  if(j < 0){ c.set(Object.assign(E, { phase: "end", k: c.rid() })); return; }
  const live = c.ids.filter(id => c.here(id)), t = nextTw(c.opts.twists !== false, E.n + 1, E.tw, live.length);
  let deck = A(c.priv().deck); const refill = () => { if(!deck.length) deck = deckFor(c.opts.packs, E.lg, c.opts.perso !== false ? myThemes() : []); return deck.pop(); };
  const pv = E.order[E.ti], nx = E.order[j];
  const patch = { ti: j, n: E.n + 1, tw: t ? t.id : "", op: "", ch: [], pv: "", fin: 0, res: null, startAt: 0, endAt: 0, k: c.rid() };
  if(patch.tw === "duel") patch.op = pick(live.filter(id => id !== nx)) || "";
  if(patch.tw === "choix" && pv !== nx && c.here(pv)){ patch.ch = [refill(), refill(), refill()]; patch.pv = pv; patch.phase = "choix"; patch.th = patch.ch[0]; }
  else { if(patch.tw === "choix") patch.tw = ""; patch.th = refill(); patch.phase = "ready"; }
  c.setPriv({ deck });
  c.set(Object.assign(E, patch));
}
})();
