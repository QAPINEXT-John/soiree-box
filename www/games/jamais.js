/* Je n'ai jamais… — une phrase, chacun répond en secret « Déjà fait » ou « Jamais », on découvre qui l'a fait.
   Un seul téléphone : la version aux doigts (chacun a 5 doigts, on en baisse un quand on l'a déjà fait). */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz, clean } = SB.u;

/* ---------- Les phrases (elles suivent « Je n'ai jamais… ») ---------- */
const P = s => s.split("|");
const FR = {
  cl: P("dormi dans une gare|raté un avion|menti sur mon âge|chanté sous la douche à pleine voix|oublié l'anniversaire d'un proche|fait semblant d'être malade pour éviter le travail ou l'école|été viré(e) d'un cours|perdu mes clés trois fois dans la même année|pleuré devant un dessin animé|parlé tout(e) seul(e) dans la rue|mangé un truc tombé par terre|regardé une saison entière en une nuit|fait une sieste de plus de trois heures|envoyé un message à la mauvaise personne|stalké quelqu'un sur les réseaux pendant des heures|fait semblant de connaître une chanson|ri à un enterrement|cassé l'écran de mon téléphone|participé à une bagarre|pris un selfie dans les toilettes|menti sur mon CV|triché à un examen|volé quelque chose dans un magasin|pris les transports sans ticket|eu une amende|appelé un prof « maman » ou « papa »|fait pipi dans une piscine|oublié un prénom juste après l'avoir entendu|fait semblant de rire à une blague nulle|fouillé dans les affaires de quelqu'un|lu le journal intime de quelqu'un|écouté une conversation en cachette|inventé une excuse bidon pour annuler un plan|eu un fou rire pendant un moment sérieux|dormi plus de 14 heures d'affilée|mangé un pot entier de pâte à tartiner|vomi en public|été bloqué(e) dans un ascenseur|raté une couleur de cheveux|coupé mes cheveux moi-même|gagné à un jeu à gratter|appelé les pompiers ou la police|fini aux urgences pour un truc bête|fait le mur|menti à mes parents sur l'endroit où j'étais|refourgué un cadeau qu'on m'avait offert|dit du mal de quelqu'un présent dans cette pièce|lu les messages de quelqu'un dans son dos|fait semblant de dormir pour éviter une conversation|oublié quelqu'un quelque part"),
  soir: P("dansé sur une table|fini une soirée en pyjama chez quelqu'un|chanté au karaoké devant des inconnus|été mis(e) dehors d'une soirée|été refoulé(e) d'une boîte de nuit|menti pour entrer dans une boîte|mangé un kebab à 5 h du matin|réveillé tout l'immeuble en rentrant|organisé une fête chez mes parents sans leur dire|fini une soirée avec la police|perdu mon téléphone en soirée|perdu une chaussure en soirée|posté une story dont j'ai eu honte le lendemain|dansé avec un inconnu jusqu'au matin|enchaîné trois soirées dans la même nuit|été le (la) dernier(ère) à partir d'une soirée|dormi par terre après une fête|pleuré en soirée sans savoir pourquoi|fait un discours gênant à un anniversaire|été ivre avant midi|vomi après avoir trop bu|oublié toute une soirée|envoyé un message bourré(e) à mon ex|bu directement à la bouteille|eu la gueule de bois pendant deux jours|caché une bouteille dans mon sac pour entrer quelque part|bu un shot sans savoir ce qu'il y avait dedans|dormi dans une baignoire après une soirée|embrassé quelqu'un dont je ne connaissais pas le prénom|appelé quelqu'un à 4 h du matin|dormi dans une voiture après une soirée|ramené quelqu'un chez moi après une soirée|fait la fête deux jours d'affilée sans dormir"),
  love: P("eu un crush sur un prof|été en couple plus de trois ans|trompé quelqu'un|été trompé(e)|rompu par message|ghosté quelqu'un|été ghosté(e)|dit « je t'aime » en premier|eu un coup de foudre|été amoureux(se) de deux personnes en même temps|fouillé le téléphone de mon partenaire|stalké le nouveau partenaire de mon ex|écrit à mon ex en pleine nuit|ressorti avec un ex|eu une relation à distance|eu un crush sur le partenaire d'un ami|embrassé quelqu'un dès le premier rendez-vous|utilisé une appli de rencontre|eu un rendez-vous catastrophique|été en couple avec un collègue|menti sur mon métier pour séduire|fait une déclaration en public|écrit une lettre d'amour|pleuré pour une rupture pendant plus d'un mois|gardé une photo de mon ex|eu un crush sur quelqu'un de cette pièce|été le plan B de quelqu'un|dragué quelqu'un de casé|eu deux rendez-vous le même jour|recalé quelqu'un avec une fausse excuse|bloqué un ex partout|été amoureux(se) d'un ami|embrassé un ami « pour rire »|attendu un message toute une nuit|fait semblant d'être célibataire|caché une relation à mes amis|présenté quelqu'un à mes parents beaucoup trop tôt|eu le cœur brisé par quelqu'un qui ne l'a jamais su"),
  hot: P("couché le premier soir|fait l'amour dans une voiture|fait l'amour dans un lieu public|envoyé un nude|reçu un nude que je n'avais pas demandé|fait du sexting|regardé du porno avec quelqu'un|simulé un orgasme|eu un coup d'un soir|recouché avec un ex|eu un plan cul régulier|utilisé un sex toy|fait l'amour sous la douche|été surpris(e) en pleine action|fait l'amour chez mes parents|couché avec quelqu'un de plus de dix ans mon aîné|fait un strip-tease|joué au strip-poker|embrassé quelqu'un du même sexe|fantasmé sur un collègue|couché avec un collègue|fait l'amour à la belle étoile|raté une position du Kamasutra|fait l'amour au travail|fait un plan à trois|utilisé des menottes|été attaché(e) au lit|fait l'amour plus de trois fois dans la même nuit|oublié le prénom de quelqu'un avec qui j'avais couché|eu une panne au lit|acheté de la lingerie pour une occasion spéciale|fait l'amour dans un avion ou un train|couché avec quelqu'un rencontré le soir même|fait l'amour en sachant que quelqu'un entendait|filmé un moment intime|eu une aventure de vacances|couché avec deux personnes différentes la même semaine|reçu une fessée au lit|dit le mauvais prénom au lit|regardé du porno au travail|fait l'amour dans une cabine d'essayage|fait l'amour sur une plage|acheté quelque chose dans un sex-shop"),
  trash: P("fait une sodomie|fait une gorge profonde|avalé|fait un 69|joui en moins d'une minute|participé à une partouze|mis les pieds dans un club libertin|couché avec quelqu'un dont j'ignorais le prénom|tourné une sextape|payé un abonnement à un site porno|vendu des photos de moi en petite tenue|couché avec deux personnes la même nuit|couché avec quelqu'un de ce groupe|fait l'amour pendant les règles|utilisé un plug anal|fait du BDSM|été dominé(e) au lit|dominé quelqu'un au lit|fait l'amour dans le lit de quelqu'un d'autre|couché avec l'ex d'un pote|couché avec un pote de mon ex|fait un plan à plusieurs avec des inconnus|léché des pieds|regardé un couple faire l'amour en vrai|été regardé(e) pendant l'amour|couché pour obtenir quelque chose|envoyé un nude à la mauvaise personne|fait des préliminaires au cinéma|utilisé de la nourriture au lit|fait l'amour plus de cinq fois en une nuit|couché avec un ex juste pour me venger|couché avec quelqu'un rencontré sur une appli moins d'une heure avant|eu un fétiche que personne ne connaît|fait un dirty talk qui m'a fait honte|fait l'amour au téléphone|eu un orgasme rien qu'en embrassant|testé le sexe tantrique|fait l'amour dans un ascenseur|reçu une fessée qui a laissé des traces"),
  kid: P("mangé un crayon|caché des légumes sous mon assiette|eu 20 sur 20|cassé quelque chose et accusé mon frère ou ma sœur|regardé un film qui fait peur|fait un gâteau tout(e) seul(e)|grimpé tout en haut d'un arbre|fait du cheval|dormi chez un copain|perdu une dent à l'école|vu la mer|pris l'avion|fait semblant d'être malade pour rater l'école|mangé des escargots|construit une cabane avec des coussins|chanté devant toute la classe|parlé à un animal comme à une personne|fait une bataille de boules de neige|vu une étoile filante|gagné une médaille|eu un plâtre|eu peur d'un clown|mangé une glace en plein hiver|fait un tour de magie|construit un château de sable géant|dormi sous une tente|fait de la trottinette dans la maison|oublié mon cartable|mis mes chaussures à l'envers|eu le hoquet pendant une heure|fait rire toute la classe|joué à cache-cache dans un magasin|rêvé que je volais|mangé tout un paquet de bonbons d'un coup|appelé la maîtresse « maman »")
};
const EN = {
  cl: P("slept in a train station|missed a flight|lied about my age|sung in the shower at full volume|forgotten a close friend's birthday|faked being sick to skip work or school|been kicked out of class|lost my keys three times in one year|cried at a cartoon|talked to myself in the street|eaten something that fell on the floor|binged a whole season in one night|taken a nap longer than three hours|texted the wrong person|stalked someone on social media for hours|pretended to know a song|laughed at a funeral|cracked my phone screen|been in a fight|taken a selfie in a bathroom|lied on my résumé|cheated on a test|stolen something from a store|ridden public transport without a ticket|gotten a fine|called a teacher “mom” or “dad”|peed in a pool|forgotten a name right after hearing it|fake-laughed at a bad joke|gone through someone's stuff|read someone's diary|eavesdropped on a conversation|made up a fake excuse to cancel plans|had a laughing fit at a serious moment|slept more than 14 hours straight|eaten a whole jar of chocolate spread|thrown up in public|been stuck in an elevator|had a hair dye disaster|cut my own hair|won on a scratch card|called the police or firefighters|ended up in the ER for something dumb|snuck out at night|lied to my parents about where I was|regifted a present|talked trash about someone in this room|faked being asleep to avoid a conversation"),
  soir: P("danced on a table|ended a party in pajamas at someone's place|sung karaoke in front of strangers|been kicked out of a party|been turned away at a club|lied to get into a club|eaten a kebab at 5 a.m.|woken up the whole building coming home|thrown a party at my parents' place without telling them|had a party end with the police|lost my phone at a party|lost a shoe at a party|posted a story I regretted the next day|danced with a stranger until morning|hit three parties in one night|been the last one to leave a party|slept on the floor after a party|cried at a party for no reason|given an embarrassing birthday speech|been drunk before noon|thrown up from drinking too much|blacked out a whole night|drunk-texted my ex|drunk straight from the bottle|had a two-day hangover|snuck a bottle in my bag|taken a shot without knowing what was in it|slept in a bathtub after a party|kissed someone without knowing their name|called someone at 4 a.m.|slept in a car after a party|brought someone home after a party|partied two days straight without sleeping"),
  love: P("had a crush on a teacher|been in a relationship for over three years|cheated on someone|been cheated on|broken up over text|ghosted someone|been ghosted|said “I love you” first|fallen in love at first sight|been in love with two people at once|gone through my partner's phone|stalked my ex's new partner|texted my ex in the middle of the night|gotten back with an ex|been in a long-distance relationship|had a crush on a friend's partner|kissed someone on the first date|used a dating app|had a disastrous date|dated a coworker|lied about my job to impress someone|made a public declaration of love|written a love letter|cried over a breakup for more than a month|kept a photo of my ex|had a crush on someone in this room|been someone's plan B|hit on someone who was taken|had two dates on the same day|turned someone down with a fake excuse|blocked an ex everywhere|been in love with a friend|kissed a friend “as a joke”|waited all night for a text|pretended to be single|hidden a relationship from my friends"),
  hot: P("slept with someone on the first night|had sex in a car|had sex in a public place|sent a nude|received an unsolicited nude|sexted|watched porn with someone|faked an orgasm|had a one-night stand|slept with an ex again|had a regular hookup|used a sex toy|had sex in the shower|been caught in the act|had sex at my parents' place|slept with someone more than ten years older|done a striptease|played strip poker|kissed someone of the same sex|fantasized about a coworker|slept with a coworker|had sex under the stars|failed a Kama Sutra position|had sex at work|had a threesome|used handcuffs|been tied to the bed|had sex more than three times in one night|forgotten the name of someone I slept with|had a performance problem in bed|bought lingerie for a special occasion|had sex on a plane or train|slept with someone I met that same night|had sex knowing someone could hear|filmed an intimate moment|had a vacation fling|slept with two different people the same week|been spanked in bed|said the wrong name in bed|watched porn at work|had sex in a fitting room|had a friend with benefits|bought something at a sex shop"),
  trash: P("had anal sex|deep-throated|swallowed|done a 69|come in under a minute|been to an orgy|set foot in a swingers' club|slept with someone without knowing their name|made a sex tape|paid for a porn subscription|sold photos of myself in my underwear|slept with two people the same night|slept with someone in this group|had period sex|used a butt plug|done BDSM|been dominated in bed|dominated someone in bed|had sex in someone else's bed|slept with a friend's ex|slept with my ex's friend|had group sex with strangers|licked someone's feet|watched a couple have sex in real life|been watched during sex|slept with someone to get something|sent a nude to the wrong person|fooled around in a movie theater|used food in bed|had sex more than five times in one night|slept with an ex just for revenge|hooked up with someone less than an hour after matching|had a fetish nobody knows about|said dirty talk that made me cringe|had phone sex|had sex in an elevator"),
  kid: P("eaten a crayon|hidden vegetables under my plate|gotten a perfect score|broken something and blamed my brother or sister|watched a scary movie|baked a cake all by myself|climbed to the top of a tree|ridden a horse|had a sleepover|lost a tooth at school|seen the ocean|been on a plane|faked being sick to skip school|eaten snails|built a pillow fort|sung in front of the whole class|talked to an animal like a person|had a snowball fight|seen a shooting star|won a medal|had a cast|been scared of a clown|eaten ice cream in winter|done a magic trick|built a giant sandcastle|slept in a tent|ridden a scooter inside the house|forgotten my backpack|put my shoes on the wrong feet|had hiccups for an hour|made the whole class laugh|played hide-and-seek in a store|dreamed I could fly|eaten a whole bag of candy at once|called my teacher “mom”")
};
// 18+ : Hot, Trash (et Sans filtre) ne font plus qu'un paquet « Hot & Hard » (id « hot »). Les anciens ids valent « hot ».
const PK = p => Array.from(new Set(A(p).map(v => (v === "trash" || v === "hard" ? "hot" : v))));
const uniq = l => Array.from(new Set(l));
try{
  const st = store(), O = st.opts && st.opts.jamais, old = v => v === "trash" || v === "hard";
  if(O && A(O.packs).some(old)) persist({ opts: Object.assign({}, st.opts, { jamais: Object.assign({}, O, { packs: PK(O.packs) }) }) });
  if(A(st.jmPacks).some(old)) persist({ jmPacks: PK(st.jmPacks) });
}catch(e){}
[FR, EN].forEach(X => { X.hot = uniq(A(X.hot).concat(A(X.trash))); });
const LISTS = { fr: FR, en: EN };
const LL = lg => LISTS[lg === "en" ? "en" : "fr"];
const ALC = /ivre|bourré|bu |bu$|bouteille|gueule de bois|shot|drunk|drinking|bottle|hangover/i;
const PACKS = [
  { v: "cl", label: tr("Classique", "Classic"), desc: tr("Galères, mensonges et petites hontes", "Mishaps, lies and small embarrassments"), list: LL(SB.lang()).cl },
  { v: "soir", label: tr("Soirée", "Party"), desc: tr("Boîtes, afters et lendemains difficiles", "Clubs, afterparties and rough mornings"), list: LL(SB.lang()).soir },
  { v: "love", label: "Love", desc: tr("Crushs, ex, ruptures et rencards", "Crushes, exes, breakups and dates"), list: LL(SB.lang()).love },
  { v: "hot", label: tr("Hot & Hard", "Hot & Hard"), desc: tr("Tout le 18+ : au lit et ailleurs, jusqu'au sexe cru sans filtre", "All the 18+: in bed and elsewhere, up to raw, unfiltered sex"), list: LL(SB.lang()).hot, hot: true },
  { v: "kid", label: tr("Enfants", "Kids"), desc: tr("Tout public, parfait avec des enfants", "For everyone, great with kids"), list: LL(SB.lang()).kid, kid: true }
];
const SEEN = "jamais:q";
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; };
function deckFor(packs, lg){
  const sel = PK(packs), L = LL(lg);
  let pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => L[p.v]);
  if(!SB.hard()) pool = pool.filter(x => !ALC.test(x));
  return SB.u.fresh(SEEN, kidF(pool.length ? pool : L.cl));
}
const PRE = lg => (lg === "en" ? "Never have I ever…" : "Je n'ai jamais…");

/* ---------- Coups de théâtre ---------- */
const TW = [
  { id: "or", name: tr("Phrase en or", "Golden line"), desc: tr("Les gages de cette phrase comptent double.", "Forfeits for this line count double.") },
  { id: "raconte", name: tr("Raconte !", "Spill it!"), desc: tr("Si quelqu'un l'a déjà fait, l'appli en choisit un(e) : il (elle) doit raconter l'histoire.", "If someone has done it, the app picks one of them: they have to tell the story.") },
  { id: "devine", name: tr("Devine qui", "Guess who"), desc: tr("Avant de répondre, chacun parie sur une personne qui l'a déjà fait (ou personne).", "Before answering, everyone bets on someone who has done it (or nobody)."), ok: o => o.n >= 3 },
  { id: "plume", name: tr("La plume", "The pen"), desc: tr("Un joueur écrit lui-même (elle-même) la phrase de cette manche.", "One player writes this round's line themselves."), ok: o => o.n >= 3 }
];
const TWL = [
  { id: "or", name: tr("Phrase en or", "Golden line"), desc: tr("Ceux qui l'ont déjà fait baissent deux doigts.", "Those who've done it put down two fingers.") },
  { id: "raconte", name: tr("Raconte !", "Spill it!"), desc: tr("L'appli choisit quelqu'un qui l'a fait : il (elle) raconte l'histoire.", "The app picks someone who's done it: they tell the story.") },
  { id: "plume", name: tr("La plume", "The pen"), desc: tr("Un joueur invente la phrase à voix haute.", "One player makes up the line out loud."), ok: o => o.n >= 3 }
];
const CSS = '<style data-jm>' +
  '.jm-ab{display:grid; grid-template-columns:1fr 1fr; gap:8px}.jm-ab button{min-height:72px; border-radius:18px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:18px}' +
  '.jm-ab button[aria-pressed="true"].y{background:#e8414e; border-color:#e8414e; color:#fff}.jm-ab button[aria-pressed="true"].n{background:#2fa860; border-color:#2fa860; color:#fff}' +
  '.jm-col{border-radius:16px; padding:12px; display:flex; flex-direction:column; gap:6px}.jm-col.y{background:rgba(232,65,78,.15); border:2px solid #e8414e}.jm-col.n{background:rgba(47,168,96,.13); border:2px solid #2fa860}' +
  '.jm-col b.h{font-family:var(--f-disp); font-size:20px}.jm-col span{font-weight:800}.jm-two{display:grid; grid-template-columns:1fr 1fr; gap:8px}' +
  '.jm-p{display:flex; align-items:center; gap:10px; width:100%; min-height:56px; padding:8px 14px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:17px; text-align:left}' +
  '.jm-p[aria-pressed="true"]{border-color:#e8414e; background:rgba(232,65,78,.18)}.jm-p:disabled{opacity:.4}.jm-p .f{margin-left:auto; letter-spacing:2px; font-size:14px; color:var(--acc)}.jm-p .f s{color:var(--muted); text-decoration:none; opacity:.4}' +
  '.jm-list{display:flex; flex-direction:column; gap:6px}</style>';
const qCard = (q, lg, own) => '<div class="card acc"><span class="eyebrow">' + esc(PRE(lg)) + '</span><div class="big">… ' + esc(q) + "</div>" + (own ? '<span class="sm">' + tr("Phrase écrite par ", "Line written by ") + esc(own) + "</span>" : "") + "</div>";
function awards(ids, s, nameOf){
  const out = [], t = s.tot || {}, f = s.fl || {}, n = s.round || 1;
  if(ids.length > 1){
    const hi = ids.slice().sort((a, b) => (t[b] || 0) - (t[a] || 0))[0], lo = ids.slice().sort((a, b) => (t[a] || 0) - (t[b] || 0))[0];
    out.push([tr("Le plus expérimenté(e)", "Most experienced"), nameOf(hi), tr((t[hi] || 0) + " « déjà fait » sur " + n, (t[hi] || 0) + " “done it” out of " + n)]);
    if(lo !== hi) out.push([tr("L'ange du groupe", "The group's angel"), nameOf(lo), tr((t[lo] || 0) + " « déjà fait » seulement", "only " + (t[lo] || 0) + " “done it”")]);
  }
  const fx = ids.filter(id => f[id]).sort((a, b) => f[b] - f[a])[0];
  if(fx) out.push([tr("Le flair", "The sixth sense"), nameOf(fx), tr(f[fx] + " bon" + (f[fx] > 1 ? "s" : "") + " pari" + (f[fx] > 1 ? "s" : ""), f[fx] + (f[fx] === 1 ? " right guess" : " right guesses"))]);
  return out;
}

SB.register({
  id: "jamais", name: tr("Je n'ai jamais…", "Never Have I Ever"), glyph: tr("Jamais", "Never"), pitch: tr("Déjà fait ou jamais ? Réponds en secret, tout se révèle d'un coup.", "Done it or never? Answer in secret, it all comes out at once."), hot: true,
  accent: { light: "#f25f3a", dark: "#ff8a5c" },
  tag: tr("Une phrase « Je n'ai jamais… », chacun répond en secret. On découvre d'un coup qui l'a déjà fait.", "A “Never have I ever…” line, everyone answers in secret. Then you find out who's done it."),
  min: 2, max: 20, gagesEnd: false,
  gages: [
    { ev: "deja", label: tr("L'a déjà fait", "Has done it"), kind: "boit", n: 1 },
    { ev: "seul", label: tr("Le (la) seul(e) à l'avoir fait", "The only one who's done it"), kind: "boit", n: 2 },
    { ev: "personne", label: tr("Personne ne l'a fait (le (la) lecteur(trice))", "Nobody has done it (the reader)"), kind: "boit", n: 1 }
  ],
  rules: tr([
    "Une phrase s'affiche : « Je n'ai jamais… ». Le (la) lecteur(trice) du tour la lit à voix haute.",
    "Chacun répond en secret : « Déjà fait » ou « Jamais ».",
    "Quand tout le monde a répondu, on découvre qui l'a déjà fait (ou seulement combien, avec les réponses anonymes).",
    "Gages : ceux qui l'ont fait ont un gage, le double si on est le (la) seul(e). Si personne ne l'a fait, c'est le (la) lecteur(trice).",
    "Coups de théâtre : phrase en or, « Raconte ! », « Devine qui » (on parie sur qui l'a fait), « La plume » (un joueur écrit la phrase).",
    "Sur un seul téléphone : chacun a 5 doigts levés et en baisse un à chaque « déjà fait ». Le (la) dernier(ère) à avoir encore des doigts levés gagne."
  ], [
    "A line appears: “Never have I ever…”. This round's reader reads it out loud.",
    "Everyone answers in secret: “Done it” or “Never”.",
    "Once everyone has answered, you find out who has done it (or just how many, with anonymous answers).",
    "Forfeits: those who've done it get one, double if they're the only one. If nobody has, the reader gets it.",
    "Twists: golden line, “Spill it!”, “Guess who” (bet on who's done it), “The pen” (a player writes the line).",
    "On one phone: everyone holds up 5 fingers and puts one down for each “done it”. Last one with fingers up wins."
  ]),
  options: [
    { id: "rounds", label: tr("Phrases", "Lines"), type: "seg", def: 15, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["cl", "soir", "love"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length })) },
    { id: "anon", label: tr("Réponses", "Answers"), type: "toggle", text: tr("Réponses anonymes", "Anonymous answers"), desc: tr("On montre seulement combien de joueurs l'ont fait, pas qui", "Only show how many have done it, not who"), def: false },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une phrase", "Now and then, a rule changes for one line"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet.", "Pick at least one pack."));
    const lg = SB.lang(), deck = deckFor(o.packs, lg), q = deck.pop(); SB.u.saw(SEEN, q); ctx.setPriv({ deck });
    return { lg, phase: "q", q, own: "", round: 1, rounds: o.rounds || 15, anon: !!o.anon, tw: "", rd: pick(ctx.ids), au: "", yes: [], no: [], g: {}, story: "", tot: {}, fl: {} };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "write"){
      const i = ctx.input(s.au), w = i && typeof i.w === "string" ? clean(i.w, 100).replace(/^(je n'ai jamais|never have i ever)\s*…?\s*/i, "") : "";
      if(w) ctx.set({ phase: "q", q: w, own: s.au });
      else if(!ctx.here(s.au)){ let deck = A(ctx.priv().deck); if(!deck.length) deck = deckFor(ctx.opts.packs, s.lg); const q = deck.pop(); ctx.setPriv({ deck }); ctx.set({ phase: "q", q, own: "", tw: "" }); }
      return;
    }
    if(s.phase === "guess"){
      const g = {};
      if(!live.length || !live.every(id => { const i = ctx.input(id); if(i && i.gu && (i.gu === "none" || ctx.ids.indexOf(i.gu) >= 0)){ g[id] = i.gu; return true; } return false; })) return;
      ctx.set({ phase: "q", g, k: ctx.rid() });
      return;
    }
    if(s.phase !== "q") return;
    const ans = {};
    if(!live.length || !live.every(id => { const i = ctx.input(id); if(i && (i.r === "y" || i.r === "n")){ ans[id] = i.r; return true; } return false; })) return;
    const yes = live.filter(id => ans[id] === "y"), no = live.filter(id => ans[id] === "n");
    const tot = Object.assign({}, s.tot || {}), fl = Object.assign({}, s.fl || {});
    yes.forEach(id => { tot[id] = (tot[id] || 0) + 1; });
    Object.keys(s.g || {}).forEach(id => { const gu = s.g[id]; if((gu === "none" && !yes.length) || (gu !== "none" && yes.indexOf(gu) >= 0)) fl[id] = (fl[id] || 0) + 1; });
    const x = s.tw === "or" ? 2 : 1;
    if(!yes.length){ if(s.rd) ctx.gage([{ id: s.rd, ev: "personne", x }], s.k); }
    else if(yes.length === 1) ctx.gage([{ id: yes[0], ev: "seul", x }], s.k);
    else ctx.gage(yes.map(id => ({ id, ev: "deja", x })), s.k);
    ctx.set({ phase: "res", yes, no, tot, fl, story: s.tw === "raconte" && yes.length ? pick(yes) : "" });
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), mine = ctx.mine() || {}, live = ctx.ids.filter(id => ctx.here(id));
    const lab = CSS + '<span class="eyebrow">' + tr("Phrase ", "Line ") + s.round + " / " + s.rounds + (s.rd ? tr(" · lecteur(trice) : ", " · reader: ") + esc(ctx.name(s.rd)) : "") + "</span>" + SB.u.twistHTML(T);
    if(s.phase === "write"){
      const mineW = s.au === me;
      screen(root, "w" + s.k + mineW, lab + (mineW
        ? '<div class="card acc"><span class="eyebrow">' + esc(PRE(s.lg)) + '</span><textarea class="txt" id="jm-w" maxlength="100" rows="3" placeholder="' + tr("… dormi dans un aéroport", "… slept in an airport") + '"></textarea></div><p class="sm">' + tr("Écris la phrase de cette manche. Astuce : vise quelque chose que tu sais sur quelqu'un !", "Write this round's line. Pro tip: aim at something you know about someone!") + "</p>" + SB.u.dock('<button class="btn acc" type="button" data-w>' + tr("Envoyer", "Send") + "</button>")
        : '<div class="pass"><span class="eyebrow">' + tr("La plume", "The pen") + '</span><div class="who">' + esc(ctx.name(s.au)) + '</div><p class="wait">' + tr("écrit la phrase de cette manche…", "is writing this round's line…") + "</p></div>"), r => {
        const b = r.querySelector("[data-w]"); if(!b) return;
        b.addEventListener("click", () => { const v = clean(r.querySelector("#jm-w").value, 100); if(v.length < 3){ SB.u.toast(tr("Écris une phrase", "Write a line")); return; } buzz(10); ctx.send({ w: v }); b.disabled = true; b.textContent = tr("Envoyé", "Sent"); });
      });
    } else if(s.phase === "guess"){
      screen(root, "g" + s.k + (mine.gu || ""), lab + qCard(s.q, s.lg, s.own ? ctx.name(s.own) : "") + '<p class="howto" style="text-align:center">' + tr("Parie : qui l'a déjà fait, à ton avis ?", "Place your bet: who do you think has done it?") + '</p><div class="choices">' +
        ctx.players.map(p => '<button type="button" class="opt" data-gu="' + esc(p.id) + '" aria-pressed="' + (mine.gu === p.id) + '">' + esc(p.name) + (p.id === me ? ' <span class="pill me">' + tr("Moi", "Me") + "</span>" : "") + "</button>").join("") +
        '<button type="button" class="opt" data-gu="none" aria-pressed="' + (mine.gu === "none") + '">' + tr("Personne", "Nobody") + "</button></div>" + SB.u.dock('<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-gu]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ gu: b.dataset.gu }); }));
      });
      txt(root, "[data-wait]", live.filter(id => { const i = ctx.input(id); return i && i.gu; }).length + " / " + live.length + tr(" paris", " bets"));
    } else if(s.phase === "q"){
      screen(root, "q" + s.k + s.q + (mine.r || ""), lab + qCard(s.q, s.lg, s.own ? ctx.name(s.own) : "") + (s.rd === me ? '<p class="note-box">' + tr("Tu es le (la) lecteur(trice) : lis la phrase à voix haute !", "You're the reader: read the line out loud!") + "</p>" : "") +
        '<div class="jm-ab"><button type="button" class="y" data-r="y" aria-pressed="' + (mine.r === "y") + '">' + tr("Déjà fait", "Done it") + '</button><button type="button" class="n" data-r="n" aria-pressed="' + (mine.r === "n") + '">' + tr("Jamais", "Never") + "</button></div>" +
        '<p class="sm" style="text-align:center">' + tr("Réponse secrète, tu peux changer d'avis jusqu'à la fin.", "Secret answer, you can change it until everyone's in.") + "</p>" + SB.u.dock('<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { buzz(10); ctx.send({ r: b.dataset.r }); }));
      });
      txt(root, "[data-wait]", live.filter(id => { const i = ctx.input(id); return i && i.r; }).length + " / " + live.length + tr(" réponses", " answers"));
    } else if(s.phase === "res"){
      const yes = A(s.yes), no = A(s.no), anon = s.anon;
      const col = (cls, h, ids) => '<div class="jm-col ' + cls + '"><b class="h">' + h + " · " + ids.length + "</b>" + (anon ? "" : ids.map(id => "<span>" + esc(ctx.name(id)) + "</span>").join("")) + "</div>";
      let extra = "";
      if(!yes.length) extra += '<p class="note-box">' + tr("Personne ne l'a fait ! Le (la) lecteur(trice), " + esc(ctx.name(s.rd)) + ", prend le gage.", "Nobody has done it! The reader, " + esc(ctx.name(s.rd)) + ", takes the forfeit.") + "</p>";
      else if(yes.length === 1 && !anon) extra += '<p class="note-box">' + tr(esc(ctx.name(yes[0])) + " est le (la) seul(e) à l'avoir fait !", esc(ctx.name(yes[0])) + " is the only one who's done it!") + "</p>";
      if(s.story) extra += '<p class="note-box">' + tr("Raconte ! " + esc(ctx.name(s.story)) + ", on veut l'histoire.", "Spill it! " + esc(ctx.name(s.story)) + ", we want the story.") + "</p>";
      const g = s.g || {}, gk = Object.keys(g);
      if(gk.length){ const ok = gk.filter(id => (g[id] === "none" && !yes.length) || (g[id] !== "none" && yes.indexOf(g[id]) >= 0)); extra += '<p class="sm" style="text-align:center">' + (ok.length ? tr("Bon pari : ", "Right guess: ") + esc(ok.map(ctx.name).join(", ")) : tr("Personne n'a vu juste.", "Nobody guessed right.")) + "</p>"; }
      screen(root, "r" + s.k + ctx.isHost, lab + qCard(s.q, s.lg, s.own ? ctx.name(s.own) : "") + '<div class="jm-two">' + col("y", tr("Déjà fait", "Done it"), yes) + col("n", tr("Jamais", "Never"), no) + "</div>" + extra +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le bilan", "See the results") : tr("Phrase suivante", "Next line")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "res") return;
          if(st.round >= st.rounds){ c.set({ phase: "end" }); return; }
          let deck = A(c.priv().deck); if(!deck.length) deck = deckFor(c.opts.packs, st.lg); const q = deck.pop(); SB.u.saw(SEEN, q); c.setPriv({ deck });
          const lv = c.ids.filter(id => c.here(id)), t = c.opts.twists !== false ? SB.u.twist(TW, { last: st.tw, n: lv.length, rate: .3 }) : null, tw = t ? t.id : "";
          const rd = lv.length ? lv[(lv.indexOf(st.rd) + 1) % lv.length] : st.rd;
          const base = { round: st.round + 1, tw, rd, yes: [], no: [], g: {}, story: "", own: "", au: "", k: c.rid() };
          if(tw === "plume") c.set(Object.assign(base, { phase: "write", q: "", au: pick(lv) }));
          else c.set(Object.assign(base, { phase: tw === "devine" ? "guess" : "q", q }));
        }));
      });
    } else if(s.phase === "end"){
      const t = s.tot || {}, order = ctx.ids.slice().sort((a, b) => (t[b] || 0) - (t[a] || 0)), aw = awards(ctx.ids, s, ctx.name);
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Le bilan", "The results") + '</span><div class="jm-list">' + order.map(id => '<div class="jm-p"><span>' + esc(ctx.name(id)) + '</span><span class="f">' + (t[id] || 0) + tr(" déjà fait", " done") + "</span></div>").join("") + "</div>" +
        (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const tt = c.s.tot || {}, o2 = c.ids.slice().sort((a, b2) => (tt[b2] || 0) - (tt[a] || 0));
          c.end({ title: tr("Je n'ai jamais… : " + c.name(o2[0]) + " a tout fait", "Never Have I Ever: " + c.name(o2[0]) + " has done it all"), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (tt[id] || 0) + tr(" déjà fait", " done")).concat(awards(c.ids, c.s, c.name).map(a => a[0] + tr(" : ", ": ") + a[1])), win: [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : la version aux doigts ---------- */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.jmPacks).length ? PK(st.jmPacks) : ["cl", "soir", "love"], lives = [3, 5, 10].indexOf(st.jmLives) >= 0 ? st.jmLives : 5, twOn = st.jmTw !== false;
      let mode = st.jmMode === "score" ? "score" : "doigts", rounds = [10, 15, 20].indexOf(st.jmRounds) >= 0 ? st.jmRounds : 15;
      let deck = [], q = "", round = 0, tw = null, au = "", fing = {}, picked = [], gno = 0, tok = Math.random().toString(36).slice(2, 7), tot = {};
      function setup(){
        const sc = mode === "score";
        screen(root, "su" + Math.random(), CSS +
          '<div class="field"><span class="eyebrow">' + tr("Mode", "Mode") + '</span><div class="seg">' + [["doigts", tr("Avec des vies (doigts)", "With lives (fingers)")], ["score", tr("Aux points", "With points")]].map(x => '<button type="button" data-m="' + x[0] + '" aria-pressed="' + (mode === x[0]) + '">' + x[1] + "</button>").join("") + "</div>" +
          '<p class="sm" style="margin:0">' + (sc ? tr("Pas d'élimination : chaque « déjà fait » rapporte 1 point. Après la dernière phrase, celui (celle) qui a le plus de points gagne : c'est le plus expérimenté(e) du groupe !", "No elimination: each “done it” scores 1 point. After the last line, the most points wins: the group's most experienced!") : tr("Tout le monde lève ses doigts. À chaque phrase, ceux qui l'ont déjà fait baissent un doigt. Le (la) dernier(ère) avec des doigts levés gagne.", "Everyone holds up their fingers. For each line, those who've done it put a finger down. Last one with fingers up wins.")) + "</p></div>" +
          (sc ? '<div class="field"><span class="eyebrow">' + tr("Phrases", "Lines") + '</span><div class="seg">' + [10, 15, 20].map(n => '<button type="button" data-rd="' + n + '" aria-pressed="' + (rounds === n) + '">' + n + "</button>").join("") + "</div></div>"
            : '<div class="field"><span class="eyebrow">' + tr("Doigts au départ", "Starting fingers") + '</span><div class="seg">' + [3, 5, 10].map(n => '<button type="button" data-l="' + n + '" aria-pressed="' + (lives === n) + '">' + n + "</button>").join("") + "</div></div>") +
          '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change", "Now and then, a rule changes") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + (sc ? tr("Commencer", "Start") : tr("Lever les doigts", "Fingers up")) + "</button>"), r => {
          r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ jmMode: mode }); setup(); }));
          r.querySelectorAll("[data-rd]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.rd; persist({ jmRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => { lives = +b.dataset.l; persist({ jmLives: lives }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ jmPacks: sel }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ jmTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; }
            deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); round = 0; tw = null; fing = {}; tot = {}; names.forEach(n => { fing[n] = lives; }); gno++; next();
          });
        });
      }
      const SC = () => mode === "score";
      const alive = () => (SC() ? names.slice() : names.filter(n => fing[n] > 0));
      const fingers = n => { if(SC()) return '<span style="letter-spacing:0">' + tr((tot[n] || 0) + " pt" + ((tot[n] || 0) > 1 ? "s" : ""), (tot[n] || 0) + ((tot[n] || 0) === 1 ? " pt" : " pts")) + "</span>"; let h = ""; for(let i = 0; i < lives; i++) h += i < fing[n] ? "●" : "<s>●</s>"; return h; };
      const lab = () => CSS + '<span class="eyebrow">' + tr("Phrase ", "Line ") + round + (SC() ? " / " + rounds : "") + "</span>" + SB.u.twistHTML(tw);
      function next(){
        round++; picked = [];
        tw = twOn && round > 1 ? SB.u.twist(TWL, { last: tw ? tw.id : "", n: alive().length, rate: .3 }) : null;
        au = tw && tw.id === "plume" ? pick(alive()) : "";
        if(!au){ if(!deck.length) deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); q = deck.pop(); SB.u.saw(SEEN, q); }
        draw();
      }
      function draw(){
        const top = au ? '<div class="pass"><span class="eyebrow">' + tr("La plume", "The pen") + '</span><div class="who">' + esc(au) + '</div><p class="howto">' + tr("invente une phrase à voix haute : « Je n'ai jamais… »", "makes up a line out loud: “Never have I ever…”") + "</p></div>" : qCard(q, SB.lang(), "");
        screen(root, "d" + gno + ":" + round + ":" + picked.join(","), lab() + top + '<p class="howto" style="text-align:center; margin:0">' + tr("Touche ceux qui l'ont déjà fait.", "Tap everyone who's done it.") + '</p><div class="jm-list">' +
          names.map(n => '<button type="button" class="jm-p" data-n="' + esc(n) + '" aria-pressed="' + (picked.indexOf(n) >= 0) + '"' + (SC() || fing[n] > 0 ? "" : " disabled") + "><span>" + esc(n) + '</span><span class="f">' + fingers(n) + "</span></button>").join("") + "</div>" +
          SB.u.dock('<button class="btn acc" type="button" data-ok>' + (picked.length ? (SC() ? tr("Valider (" + picked.length + ")", "Confirm (" + picked.length + ")") : tr("Baisser un doigt (" + picked.length + ")", "Put a finger down (" + picked.length + ")")) : tr("Personne ne l'a fait", "Nobody has done it")) + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { const n = b.dataset.n, i = picked.indexOf(n); if(i >= 0) picked.splice(i, 1); else picked.push(n); buzz(6); draw(); }));
          r.querySelector("[data-ok]").addEventListener("click", resolve);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      function resolve(){
        const down = tw && tw.id === "or" ? 2 : 1, before = alive();
        picked.forEach(n => { if(!SC()) fing[n] = Math.max(0, fing[n] - down); tot[n] = (tot[n] || 0) + (SC() ? down : 1); });
        buzz(picked.length ? [20, 30, 20] : 10);
        if(api.gage && picked.length){ const x = down; api.gage(picked.length === 1 ? [{ id: picked[0], ev: "seul", x }] : picked.map(id => ({ id, ev: "deja", x })), "jm" + tok + "-" + gno + ":" + round); }
        const out = before.filter(n => fing[n] <= 0), left = alive(), story = tw && tw.id === "raconte" && picked.length ? pick(picked) : "";
        const mx = Math.max(0, ...names.map(n => tot[n] || 0));
        const over = SC() ? round >= rounds : left.length <= 1;
        const win = !over ? [] : SC() ? (mx ? names.filter(n => (tot[n] || 0) === mx) : []) : (left.length ? left : out);
        screen(root, "r" + gno + ":" + round, lab() + (au ? "" : qCard(q, SB.lang(), "")) +
          (picked.length ? '<p class="note-box">' + tr(esc(picked.join(", ")) + (SC() ? " : +" + down + (down > 1 ? " points." : " point.") : (picked.length > 1 ? " baissent " : " baisse ") + (down > 1 ? "deux doigts" : "un doigt") + "."), esc(picked.join(", ")) + (SC() ? ": +" + down + (down > 1 ? " points." : " point.") : " put down " + (down > 1 ? "two fingers" : "a finger") + ".")) + "</p>" : '<p class="note-box">' + tr("Personne ne l'a fait !", "Nobody has done it!") + "</p>") +
          (story ? '<p class="note-box">' + tr("Raconte ! " + esc(story) + ", on veut l'histoire.", "Spill it! " + esc(story) + ", we want the story.") + "</p>" : "") +
          (out.length ? '<p class="sm" style="text-align:center">' + tr("Plus de doigts : " + esc(out.join(", ")), "Out of fingers: " + esc(out.join(", "))) + "</p>" : "") +
          '<div class="jm-list">' + (SC() ? names.slice().sort((a, b) => (tot[b] || 0) - (tot[a] || 0)) : names).map(n => '<div class="jm-p"' + (SC() || fing[n] > 0 ? "" : ' style="opacity:.4"') + "><span>" + esc(n) + '</span><span class="f">' + fingers(n) + "</span></div>").join("") + "</div>" +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (over ? (SC() ? tr("Voir le classement", "See the standings") : tr("Voir le gagnant", "See the winner")) : tr("Phrase suivante", "Next line")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { if(over) end(win); else next(); });
        });
      }
      function end(win){
        if(api.win){ let tries = 0; const go = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(go, 500); else api.win(win); }; go(); }
        const order = names.slice().sort((a, b) => (tot[b] || 0) - (tot[a] || 0));
        const low = order[order.length - 1];
        screen(root, "end" + gno, CSS + (SC()
          ? '<span class="eyebrow">' + (win.length > 1 ? tr("Égalité : les plus expérimentés", "Tie: the most experienced") : tr("Le plus expérimenté(e)", "The most experienced")) + '</span><div class="who">' + esc(win.join(" & ") || "—") + "</div>" +
            '<div class="jm-list">' + order.map((n, i) => '<div class="jm-p"><span>' + (i + 1) + ". " + esc(n) + '</span><span class="f">' + fingers(n) + "</span></div>").join("") + "</div>" +
            (names.length > 2 ? '<p class="sm" style="text-align:center">' + tr("L'ange du groupe : " + esc(low) + " (" + (tot[low] || 0) + ")", "The group's angel: " + esc(low) + " (" + (tot[low] || 0) + ")") + "</p>" : "")
          : '<span class="eyebrow">' + (win.length > 1 ? tr("Égalité", "It's a tie") : tr("Le plus sage", "The most innocent")) + '</span><div class="who">' + esc(win.join(" & ")) + "</div>" +
            '<p class="sm" style="text-align:center">' + tr("Le plus de « déjà fait » : " + esc(order[0]) + " (" + (tot[order[0]] || 0) + ")", "Most “done it”: " + esc(order[0]) + " (" + (tot[order[0]] || 0) + ")") + "</p>") +
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
