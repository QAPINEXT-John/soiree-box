/* Qui a dit ça ? — chacun répond en secret, les réponses tombent sans les noms, à vous de trouver l'auteur. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, clean, armTap, pick } = SB.u;
const tr = SB.tr, PL = SB.u.plural2;

const SOFT = [
  "Ton pire rencard en 5 mots","Le métier dont tu as toujours rêvé","Ce que tu ne dirais jamais à ta mère","Ta pire honte au collège",
  "Le truc le plus cher que tu as acheté sur un coup de tête","Ce que tu ferais si tu gagnais un million demain matin","Ton plaisir coupable","Le pire cadeau que tu as reçu",
  "Ta phobie la plus bizarre","Le mensonge que tu racontes le plus souvent","Ta pire coupe de cheveux","Ta première impression de {p}",
  "Un secret sur {p} que tu pourrais révéler","Le surnom parfait pour {p}","Ce que {p} fera dans 10 ans","La chanson que tu chantes sous la douche",
  "Ta dernière recherche Google gênante","Le pire job que tu as fait","Ton talent caché","La célébrité que tu détestes sans raison","Le film qui t'a le plus fait pleurer",
  "Ta pire cuite en une phrase","Ce que tu volerais dans un musée","Ta dernière grosse colère","L'excuse la plus nulle que tu as donnée pour annuler un plan",
  "Les 3 trucs que tu emporterais sur une île déserte","Le plat que tu ne peux pas avaler","Le pire conseil qu'on t'a donné","Le titre de ton autobiographie",
  "Ton rêve le plus bizarre","Ta plus grosse bêtise d'enfant","Ce que tu fais quand tu es seul(e) chez toi","La règle que tu enfreindrais si personne ne regardait",
  "Ce qui te rend jaloux","Le pire prénom que tu pourrais donner à un enfant","La phrase que tu dis tout le temps","Ton plus gros fail en public",
  "Ce que tu as déjà fait pour éviter quelqu'un","Le message que tu regrettes d'avoir envoyé","Ce que tu dirais au toi d'il y a 10 ans","Ta théorie du complot préférée",
  "Le pire endroit où tu t'es endormi(e)","Ce que tu caches dans ta chambre","Ta dernière dispute pour un truc débile","Le personnage de fiction dont tu étais amoureux(se)",
  "La pire chose que tu as mangée","L'appli que tu ouvres le plus, et pourquoi","Un truc que tu n'as jamais avoué à {p}","Ce qui t'agace le plus chez les gens",
  "Ta pire tenue de soirée","Ce que tu ferais si tu étais invisible pendant une journée","Le pire surnom qu'on t'a donné","Ce que tu changerais chez {p}",
  "La pire chose que tu as dite à un prof","Ton premier crush en 3 mots","Ce que tu fais en douce au travail ou en cours",
  "Complète : « Je ne l'ai jamais dit à personne, mais… »","Complète : « Ma plus grande fierté inutile, c'est… »","Complète : « Si j'étais un plat, je serais… »",
  "Complète : « Le jour où j'ai eu le plus honte, c'est quand… »","Complète : « Mon pire défaut, selon ma famille, c'est… »","Complète : « Dans une autre vie, j'étais sûrement… »",
  "Avoue : un truc de gamin que tu fais encore","Avoue : la dernière fois que tu as menti à quelqu'un ici","Avoue : ce que tu as vraiment pensé de cette soirée en arrivant",
  "Avoue : le truc que tu as cassé sans jamais le dire","Avoue : une série que tu regardes en cachette",
  "Prédis : ce que {p} fera demain matin","Prédis : le prochain gros achat de {p}","Prédis : la phrase que {p} dira avant la fin de la soirée",
  "Prédis : qui ici se mariera en premier, et pourquoi","Prédis : la prochaine lubie de {p}",
  "Écris comme {p} : son message pour annuler une soirée","Écris comme {p} : sa bio sur une appli de rencontre","Écris comme {p} : son discours de remerciement en recevant un prix",
  "Écris comme {p} : son avis sur la pizza à l'ananas","Écris comme {p} : sa réaction en gagnant au loto",
  "Le pire conseil que tu pourrais donner à {p}","Ton excuse la plus extrême pour justifier un retard","La pire idée de start-up possible",
  "Ce que tu ferais si tu dirigeais le pays pendant une journée","Le slogan de ta vie","Le super-pouvoir inutile que tu voudrais avoir","Ce que tu crierais en gagnant une médaille d'or",
  "Le nom de ton futur animal de compagnie","Un mot pour décrire {p}, et pas le plus gentil","Ta tactique pour quitter une soirée sans dire au revoir","Le pire endroit pour une demande en mariage"
];
const HOT = [
  "Ton fantasme le plus inavouable","Le pire endroit où tu l'as fait","Ton surnom au lit","Ta pire expérience sexuelle en 5 mots","Le premier truc que tu regardes chez quelqu'un",
  "Le pire message coquin que tu as envoyé","La célébrité avec qui tu passerais une nuit","Ce que tu penses vraiment de la vie sexuelle de {p}","La personne ici avec qui tu pourrais finir la nuit",
  "Ton pire plan d'un soir","Le mot le plus gênant que tu as dit pendant l'acte","Ta technique de drague infaillible","Le bruit le plus gênant que tu as fait au lit","Ce que tu fais sur une appli de rencontre à 3 h du matin",
  "Le truc le plus bizarre qui t'excite","La pire excuse pour ne pas rappeler quelqu'un","Ton plus gros mensonge à un partenaire","Ta catégorie préférée sur un site X",
  "Le sextoy que tu aimerais essayer","Ce que tu as déjà fait dans une voiture","La pire chose que tu as faite à un ex","Ce que {p} cache dans sa table de nuit",
  "Le pire moment où tu t'es fait surprendre","Ton record en une nuit","La phrase qui te fait craquer","Ce que tu ferais si tu te réveillais dans le corps de {p}",
  "Le lieu public où tu rêves de le faire","Le pire nude que tu as reçu","La personne la plus improbable avec qui tu as couché, en 3 mots","Ce que tu as déjà simulé","Ton plus gros tabou",
  "La blague la plus noire que tu oses raconter","Ce que tu voudrais qu'on fasse à ton enterrement","Le pire truc que tu as dit à un enterrement","Le truc le plus illégal que tu as fait",
  "Ce que tu regardes en navigation privée","Le pire endroit où tu as embrassé quelqu'un","Ta position préférée, décrite comme une recette de cuisine","La première phrase de {p} au réveil, après une nuit torride",
  "La pire chose que tu as faite pour coucher avec quelqu'un",
  "Complète : « Au lit, je suis plutôt… »","Complète : « Mon pire rencard s'est fini par… »","Complète : « Ce qui me fait craquer chez quelqu'un, c'est… »",
  "Avoue : le dernier message coquin que tu as reçu, en 5 mots","Avoue : le contact que tu ne devrais plus avoir dans ton téléphone","Avoue : ton fantasme le plus banal",
  "Avoue : le truc le plus fou que tu as fait pour un crush","Prédis : le rencard idéal de {p}","Prédis : la phrase de drague préférée de {p}",
  "Écris comme {p} : son message de rupture","Écris comme {p} : son premier message sur une appli de rencontre","Écris comme {p} : son avis sur sa dernière nuit",
  "La pire musique pour une nuit romantique","Ton pire bisou en 5 mots","La chose la plus gênante que tu as dite pendant un rencard","Ce que tu ferais avec la personne à ta gauche sur une île déserte",
  "Le surnom le plus ridicule que tu as donné à quelqu'un au lit","Ce que tu caches dans ton téléphone","La pire excuse pour filer le matin","Ton plus gros râteau en une phrase",
  "Le pire endroit où tu as reçu un message coquin","Ce que tu as fait en soirée et nié le lendemain","La pire chose à crier pendant l'acte","Ce que tu demanderais au génie de la lampe, version 18+"
];
// Fausses réponses du coup de théâtre « L'imposteur » : assez vagues pour coller à presque toutes les questions.
const FAKE = [
  "Je préfère ne pas en parler","Une histoire avec une licorne gonflable","Un karaoké qui a mal tourné","Ça s'est passé dans un camping","Franchement ? Rien de tout ça",
  "Mon ex, sans hésiter","Un truc avec beaucoup trop de fromage","Trois mots : plus jamais ça","C'était en vacances, il faisait trop chaud","Le voisin du dessus",
  "Une raclette à 4 h du matin","Un costume de pirate","Au fond d'un tiroir","Avec beaucoup trop de paillettes","Un message vocal de sept minutes",
  "Dans le noir complet","Je l'ai fait pour un pari","Un vieux sweat à capuche","Mon coloc était là, évidemment","Une trottinette et beaucoup de confiance",
  "C'était il y a longtemps, laissez-moi tranquille","Le réveil n'a pas sonné","Une danse improvisée sur une table","Des chaussettes dépareillées","Une erreur de groupe de discussion",
  "Je ne regrette absolument rien","Un plat surgelé et une bougie","Tout le monde s'en souvient sauf moi","Un mardi soir, sans raison","Le GPS m'a lâché"
];
const FAKE_HOT = ["Dans un ascenseur, évidemment","Avec des menottes en peluche","Le lendemain, j'ai changé de numéro","Une histoire de massage","Dans la voiture de mes parents","Je n'ai jamais rappelé","Sous la douche, en chantant"];
const SOFT_EN = [
  "Your worst date in 5 words","The job you've always dreamed of","Something you'd never tell your mom","Your most embarrassing moment in middle school",
  "The most expensive thing you've ever bought on impulse","What you'd do if you won a million tomorrow morning","Your guilty pleasure","The worst gift you've ever received",
  "Your weirdest phobia","The lie you tell most often","Your worst haircut ever","Your first impression of {p}",
  "A secret about {p} you could spill","The perfect nickname for {p}","What {p} will be doing in 10 years","The song you sing in the shower",
  "Your last embarrassing Google search","The worst job you've ever had","Your hidden talent","The celebrity you hate for no reason","The movie that made you cry the most",
  "Your messiest night out in one sentence","What you'd steal from a museum","The last time you totally lost it","The lamest excuse you've ever used to cancel plans",
  "The 3 things you'd take to a desert island","The food you just can't stomach","The worst advice you've ever been given","The title of your autobiography",
  "Your weirdest dream","The dumbest thing you did as a kid","What you do when you're home alone","The rule you'd break if nobody was watching",
  "What makes you jealous","The worst name you could give a baby","The phrase you say all the time","Your biggest fail in public",
  "Something you've done to avoid someone","The text you regret sending","What you'd tell yourself 10 years ago","Your favorite conspiracy theory",
  "The weirdest place you've ever fallen asleep","What you hide in your bedroom","Your last argument over something stupid","The fictional character you had a crush on",
  "The worst thing you've ever eaten","The app you open the most, and why","Something you've never admitted to {p}","What annoys you most about people",
  "Your worst party outfit","What you'd do if you were invisible for a day","The worst nickname you've ever been given","What you'd change about {p}",
  "The worst thing you ever said to a teacher","Your first crush in 3 words","What you sneakily do at work or in class",
  "Finish the sentence: \"I've never told anyone, but…\"","Finish the sentence: \"My proudest useless achievement is…\"","Finish the sentence: \"If I were a dish, I'd be…\"",
  "Finish the sentence: \"The most embarrassed I've ever been was when…\"","Finish the sentence: \"According to my family, my worst flaw is…\"","Finish the sentence: \"In another life, I was probably…\"",
  "Confess: something childish you still do","Confess: the last time you lied to someone here","Confess: what you really thought of this party when you walked in",
  "Confess: something you broke and never told anyone about","Confess: a show you watch in secret",
  "Predict: what {p} will be doing tomorrow morning","Predict: {p}'s next big purchase","Predict: something {p} will say before the night is over",
  "Predict: who here will get married first, and why","Predict: {p}'s next obsession",
  "Write like {p}: their text canceling a night out","Write like {p}: their dating app bio","Write like {p}: their acceptance speech for an award",
  "Write like {p}: their take on pineapple pizza","Write like {p}: their reaction to winning the lottery",
  "The worst advice you could give {p}","Your most extreme excuse for being late","The worst possible startup idea",
  "What you'd do if you ran the country for a day","The slogan of your life","The useless superpower you'd love to have","What you'd shout while winning a gold medal",
  "The name of your future pet","One word to describe {p}, and not the nicest one","Your strategy for leaving a party without saying goodbye","The worst place for a marriage proposal"
];
const HOT_EN = [
  "Your most unspeakable fantasy","The worst place you've ever done it","Your nickname in bed","Your worst sexual experience in 5 words","The first thing you check out on someone",
  "The worst dirty text you've ever sent","The celebrity you'd spend a night with","What you really think of {p}'s sex life","The person here you could end the night with",
  "Your worst one-night stand","The most embarrassing thing you've said during sex","Your foolproof pickup technique","The most embarrassing noise you've made in bed","What you do on a dating app at 3 a.m.",
  "The weirdest thing that turns you on","The worst excuse for not calling someone back","Your biggest lie to a partner","Your favorite category on a porn site",
  "The sex toy you'd love to try","Something you've done in a car","The worst thing you've done to an ex","What {p} keeps in their nightstand",
  "The worst moment you've ever been caught","Your record in one night","The line that makes you weak","What you'd do if you woke up in {p}'s body",
  "The public place where you dream of doing it","The worst nude you've ever received","The most unlikely person you've slept with, in 3 words","Something you've faked","Your biggest taboo",
  "The darkest joke you dare to tell","What you'd want people to do at your funeral","The worst thing you've said at a funeral","The most illegal thing you've ever done",
  "What you watch in incognito mode","The worst place you've ever kissed someone","Your favorite position, described like a recipe","{p}'s first words when waking up after a steamy night",
  "The worst thing you've done to sleep with someone",
  "Finish the sentence: \"In bed, I'm more of a…\"","Finish the sentence: \"My worst date ended with…\"","Finish the sentence: \"What makes me weak in the knees is…\"",
  "Confess: the last dirty text you got, in 5 words","Confess: the contact you really shouldn't still have in your phone","Confess: your most basic fantasy",
  "Confess: the craziest thing you've done for a crush","Predict: {p}'s ideal date","Predict: {p}'s go-to pickup line",
  "Write like {p}: their breakup text","Write like {p}: their opening message on a dating app","Write like {p}: their review of their last night",
  "The worst music for a romantic night","Your worst kiss in 5 words","The most embarrassing thing you've said on a date","What you'd do with the person on your left on a desert island",
  "The most ridiculous nickname you've called someone in bed","What you're hiding on your phone","The worst excuse to sneak out in the morning","Your worst rejection in one sentence",
  "The worst place you've ever gotten a dirty text","Something you did at a party and denied the next day","The worst thing to shout during sex","What you'd ask a genie for, 18+ version"
];
// Impostor fake answers: vague enough to fit almost any question, adult-safe (no family, no minors, no animals).
const FAKE_EN = [
  "I'd rather not talk about it","A story involving a giant pool float","A karaoke night gone wrong","It happened at a campsite","Honestly? None of the above",
  "My ex, no question","Something with way too much cheese","Three words: never again","It was on vacation and way too hot","My upstairs neighbor",
  "Fondue at 4 a.m.","A pirate costume","At the back of a drawer","With way too much glitter","A seven-minute voice note",
  "In complete darkness","I did it on a dare","An old hoodie","My roommate was there, obviously","An electric scooter and way too much confidence",
  "That was ages ago, leave me alone","My alarm didn't go off","An improvised dance on a table","Mismatched socks","Wrong group chat",
  "I regret absolutely nothing","A frozen dinner and a candle","Everyone remembers it except me","A random Tuesday night","My GPS gave up on me"
];
const FAKE_HOT_EN = ["In an elevator, obviously","With fuzzy handcuffs","The next day, I changed my number","It involved a massage","In the back seat of an Uber","I never called back","In the shower, singing"];
// Contenu selon la langue de l'hôte (s.lg) ; mêmes identifiants de paquets dans les deux langues.
const DECK = { fr: { soft: SOFT, adulte: HOT, fake: FAKE, fakeHot: FAKE_HOT }, en: { soft: SOFT_EN, adulte: HOT_EN, fake: FAKE_EN, fakeHot: FAKE_HOT_EN } };
const deck = lg => DECK[lg === "en" ? "en" : "fr"];
const PACKS = [
  { v: "soft", label: tr("Classique", "Classic"), desc: tr("Hontes, souvenirs, petits secrets, prédictions", "Embarrassing moments, memories, little secrets, predictions"), list: deck(SB.lang()).soft },
  { v: "adulte", label: tr("Hot & Hard", "Hot & Hard"), desc: tr("Sexe, fantasmes, tabous, humour noir", "Sex, fantasies, taboos, dark humor"), list: deck(SB.lang()).adulte, hot: true }
];
const SEEN = "quiadit:q", SEENF = "quiadit:fake", BOT = "bot";
function deckFor(packs, lg){
  const sel = A(packs), d = deck(lg), pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => d[p.v]);
  return SB.u.fresh(SEEN, pool.length ? pool : d.soft);
}
function fakeFor(packs, lg){ const d = deck(lg), f = SB.u.fresh(SEENF, d.fake.concat(A(packs).indexOf("adulte") >= 0 ? d.fakeHot : [])).pop(); SB.u.saw(SEENF, f); return f; }
function words(t){ return String(t || "").trim().split(/\s+/).filter(Boolean); }
function clip(t, tw){ t = clean(t, 140); return tw === "short" ? words(t).slice(0, 5).join(" ") : t; }
// Coups de théâtre : un par question au maximum, jamais à la première.
const TW = [
  { id: "short", name: tr("Cinq mots maximum", "Five words max"), desc: tr("Réponses de 5 mots au plus : chaque mot compte.", "Answers of 5 words or fewer: every word counts.") },
  { id: "fake", name: tr("L'imposteur", "The Impostor"), desc: tr("Le jeu glisse une fausse réponse. La démasquer rapporte 1 point.", "The game slips in a fake answer. Spotting it earns 1 point.") },
  { id: "x2", name: tr("Points doublés", "Double points"), desc: tr("Tous les points de cette question comptent double.", "Every point on this question counts double.") },
  { id: "disg", name: tr("Déguisement", "Disguise"), desc: tr("Réponds comme le ferait le joueur indiqué. Chaque joueur berné rapporte 2 points.", "Answer the way the player shown would. Each player you fool earns 2 points.") },
  { id: "perfect", name: tr("Crime parfait", "Perfect crime"), desc: tr("Si personne ne trouve ta réponse, tu gagnes 3 points bonus.", "If nobody guesses your answer, you get 3 bonus points.") },
  { id: "lone", name: tr("Flair solitaire", "Lone wolf"), desc: tr("Seul(e) à trouver l'auteur(e) ? 3 points au lieu d'un.", "The only one to find the author? 3 points instead of 1.") }
];
const twBanner = t => SB.u.twistHTML(t, tr("Coup de théâtre", "Plot twist"));
function pickTw(on, round, last){ return on && round > 1 ? SB.u.twist(TW, { last, rate: .4 }) : null; }
function derange(ids){ const o = shuffle(ids), m = {}; o.forEach((id, i) => { m[id] = o[(i + 1) % o.length]; }); return m; }
// Points d'une réponse : renvoie les gains par catégorie.
function scoreAnswer(aid, voters, right, tw){
  const m = tw === "x2" ? 2 : 1, d = { pts: {}, det: {}, fool: {}, fnd: {}, bot: {}, perf: {} }, add = (k, id, n) => { d[k][id] = (d[k][id] || 0) + n; };
  if(aid === BOT){ right.forEach(v => { add("pts", v, m); add("bot", v, 1); }); return d; }
  const lone = tw === "lone" && right.length === 1;
  right.forEach(v => { add("pts", v, (lone ? 3 : 1) * m); add("det", v, 1); });
  if(right.length) add("fnd", aid, right.length);
  voters.filter(v => right.indexOf(v) < 0).forEach(() => { add("pts", aid, (tw === "disg" ? 2 : 1) * m); add("fool", aid, 1); });
  if(tw === "perfect" && voters.length >= 2 && !right.length){ add("pts", aid, 3 * m); add("perf", aid, 1); }
  return d;
}
// Gages d'une réponse révélée : l'auteur démasqué par la majorité boit, celui que personne n'a trouvé distribue,
// ceux qui tombent dans le piège de l'imposteur boivent. ids : joueurs ayant voté (hors auteur).
function qdGages(aid, voters, right){
  if(aid === BOT) return voters.filter(v => right.indexOf(v) < 0).map(id => ({ id, ev: "piege" }));
  if(right.length && right.length * 2 >= voters.length) return [{ id: aid, ev: "demasque" }];
  if(!right.length && voters.length >= 2) return [{ id: aid, ev: "berne" }];
  return [];
}
function merge(base, d){ const o = {}; Object.keys(d).forEach(k => { o[k] = Object.assign({}, base[k] || {}); Object.keys(d[k]).forEach(id => { o[k][id] = (o[k][id] || 0) + d[k][id]; }); }); return o; }
const FL = tr({
  win: ["Vainqueur(e)", "Le cerveau de la soirée", "Imbattable", "Le plus fin limier"],
  det: ["Meilleur(e) détective", "Œil de lynx", "Rien ne lui échappe"],
  fool: ["Le plus imprévisible", "Maître du bluff", "Insaisissable"],
  fnd: ["Le livre ouvert", "Trop facile à lire", "Cartes sur table"],
  bot: ["Chasseur d'imposteurs", "Détecteur de mensonges", "Pas dupe une seconde"]
}, {
  win: ["Winner", "The brains of the party", "Unbeatable", "Master sleuth"],
  det: ["Best detective", "Eagle eye", "Nothing gets past them"],
  fool: ["Most unpredictable", "Master bluffer", "Impossible to read"],
  fnd: ["The open book", "Way too easy to read", "Cards on the table"],
  bot: ["Impostor hunter", "Human lie detector", "Not fooled for a second"]
});
function fl(list, seed, k){ return list[((seed || 0) + k) % list.length]; }
function awards(ids, s, nameOf){
  const out = [], seed = s.fl || 0, used = [];
  // Le meilleur pour une stat, en évitant si possible quelqu'un qui a déjà un trophée.
  const best = m => { const by = list => { let b = "", v = 0; list.forEach(id => { if((m[id] || 0) > v){ v = m[id]; b = id; } }); return b; }; const r = by(ids.filter(id => used.indexOf(id) < 0)) || by(ids); if(r) used.push(r); return r; };
  const d = best(s.det || {}); if(d) out.push([fl(FL.det, seed, 1), nameOf(d), tr(s.det[d] + " bonne" + (s.det[d] > 1 ? "s" : "") + " réponse" + (s.det[d] > 1 ? "s" : ""), PL(s.det[d], "", "", "correct guess", "correct guesses"))]);
  const f = best(s.fool || {}); if(f) out.push([fl(FL.fool, seed, 2), nameOf(f), tr("A berné les autres " + s.fool[f] + " fois", "Fooled people " + PL(s.fool[f], "", "", "time"))]);
  const n = best(s.fnd || {}); if(n) out.push([fl(FL.fnd, seed, 3), nameOf(n), tr("Démasqué(e) " + s.fnd[n] + " fois", "Unmasked " + PL(s.fnd[n], "", "", "time"))]);
  const b = best(s.bot || {}); if(b) out.push([fl(FL.bot, seed, 4), nameOf(b), tr("A repéré " + s.bot[b] + " fausse" + (s.bot[b] > 1 ? "s" : "") + " réponse" + (s.bot[b] > 1 ? "s" : ""), "Spotted " + PL(s.bot[b], "", "", "fake answer"))]);
  return out;
}
function awardsHTML(aw){ return aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : ""; }
function fill(q, nm){ return q.replace(/\{p\}/g, nm); }
const CSS = '<style>.qd-a{font-family:var(--f-hand); font-weight:700; font-size:40px; line-height:1.1; overflow-wrap:anywhere; color:var(--ink)}.qd-q{font-size:17px; font-weight:700}' +
  '.qd-in{min-height:96px; resize:vertical}.qd-ok{display:flex; flex-wrap:wrap; gap:6px}.qd-rows{display:flex; flex-direction:column; gap:8px}' +
  '.qd-r{display:flex; justify-content:space-between; align-items:center; gap:10px; background:var(--card); border:1.5px solid var(--line); border-radius:14px; padding:12px 14px; font-weight:800; width:100%; text-align:left}' +
  '.qd-r[aria-pressed="true"]{border-color:var(--ok); color:var(--ok)}.qd-r .m{font-size:14px}</style>';
function scoreBars(ids, pts, nameOf){
  const max = Math.max(1, ...ids.map(id => pts[id] || 0));
  return '<div class="bars">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map(id => '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + (pts[id] || 0) + ' pt' + (tr((pts[id] || 0) > 1, (pts[id] || 0) !== 1) ? "s" : "") + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (pts[id] || 0) / max) + '%"></div></div></div>').join("") + "</div>";
}
function best(ids, m){ let b = "", v = 0; ids.forEach(id => { if((m[id] || 0) > v){ v = m[id]; b = id; } }); return b; }
// lg : langue du contenu (celle de l'hôte, gardée dans s.lg).
function roundState(c, round, last, lg){
  lg = lg === "en" ? "en" : "fr";
  let deck = A(c.priv().deck).slice(); if(!deck.length) deck = deckFor(c.opts.packs, lg);
  const q = deck.pop(); c.setPriv({ deck }); SB.u.saw(SEEN, q);
  const t = pickTw(c.opts.twists !== false, round, last), tw = t ? t.id : "";
  return { phase: "write", lg, q, p: pick(c.ids), round, tw, fk: tw === "fake" ? fakeFor(c.opts.packs, lg) : "", disg: tw === "disg" ? derange(c.ids) : {}, ans: [], i: 0, votes: {}, gain: {}, k: c.rid() };
}
function toGuess(c){
  const tw = c.s.tw || "";
  const real = c.ids.filter(id => { const x = c.input(id); return x && clip(x.a, tw); }).map(id => ({ id, t: clip(c.input(id).a, tw) }));
  if(real.length < 2){ return false; }
  const ans = shuffle(tw === "fake" && c.s.fk ? real.concat([{ id: BOT, t: c.s.fk }]) : real);
  c.set({ phase: "guess", ans, i: 0, votes: {}, k: c.rid() });
  return true;
}
function toReveal(c){
  const s = c.s, a = A(s.ans)[s.i]; if(!a) return;
  const votes = {};
  c.ids.forEach(id => { const x = c.input(id); if(x && x.g) votes[id] = x.g; });
  const voters = Object.keys(votes).filter(v => v !== a.id), right = voters.filter(v => votes[v] === a.id);
  const d = scoreAnswer(a.id, voters, right, s.tw || "");
  const gl = qdGages(a.id, voters, right); if(gl.length) c.gage(gl, s.k);
  c.set(Object.assign({ phase: "rev", votes, gain: d.pts }, merge(s, d)));
}

const DEF = {
  id: "quiadit", name: tr("Qui a dit ça ?", "Who Said It?"), glyph: tr("Qui ?!", "Who?!"), pitch: tr("Réponses anonymes : trouve qui a écrit quoi.", "Anonymous answers: figure out who wrote what."), hot: true,
  accent: { light: "#6cc3ff", dark: "#6cc3ff" },
  tag: tr("Une question, chacun répond en secret. Les réponses tombent sans les noms : à vous de trouver qui a écrit quoi.", "One question, everyone answers in secret. The answers drop without names: your job is to figure out who wrote what."),
  min: 3, max: 12,
  gages: [
    { ev: "demasque", label: tr("Démasqué(e) par la majorité", "Unmasked by most players"), kind: "boit", n: 1 },
    { ev: "berne", label: tr("Auteur(e) jamais démasqué(e)", "Nobody guessed you"), kind: "distribue", n: 2 },
    { ev: "piege", label: tr("Piégé(e) par l'imposteur", "Fooled by the Impostor"), kind: "boit", n: 1 }
  ],
  rules: tr([
    "Une question s'affiche. Chacun écrit sa réponse en secret sur son téléphone.",
    "Les réponses apparaissent une par une, sans le nom. Tout le monde vote pour désigner l'auteur(e), y compris l'auteur(e) lui-même (elle-même), pour brouiller les pistes.",
    "1 point si tu trouves l'auteur(e). L'auteur(e) gagne 1 point par joueur qu'il (elle) a berné.",
    "Coups de théâtre : cinq mots maximum, imposteur glissé par le jeu, déguisement, crime parfait, points doublés…",
    "Questions variées (complète, avoue, prédis, écris comme…), sans redites d'une soirée à l'autre. À la fin : podium et trophées."
  ], [
    "A question appears. Everyone writes their answer in secret on their phone.",
    "The answers show up one by one, without names. Everyone votes for who wrote it, including the author, to throw people off.",
    "1 point if you find the author. The author gets 1 point for every player they fooled.",
    "Plot twists: five words max, an impostor answer slipped in by the game, disguise, perfect crime, double points…",
    "All kinds of questions (finish the sentence, confess, predict, write like…), no repeats from one party to the next. At the end: podium and trophies."
  ]),
  options: [
    { id: "rounds", label: "Questions", type: "seg", def: 3, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["soft"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une question", "Every now and then, a rule changes for one question"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet de questions.", "Pick at least one question pack."));
    const lg = SB.lang();
    ctx.setPriv({ deck: deckFor(o.packs, lg) });
    return Object.assign(roundState(ctx, 1, "", lg), { lg, rounds: o.rounds || 3, pts: {}, det: {}, fool: {}, fnd: {}, bot: {}, perf: {} });
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id)), tw = s.tw || "";
    if(!live.length) return;
    if(s.phase === "write"){
      if(live.every(id => { const x = ctx.input(id); return x && clip(x.a, tw); })) toGuess(ctx);
    } else if(s.phase === "guess"){
      if(live.every(id => { const x = ctx.input(id); return x && x.g; })) toReveal(ctx);
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, live = ctx.ids.filter(id => ctx.here(id)), tw = s.tw || "", T = SB.u.byTwist(TW, tw);
    const nameOf = id => id === BOT ? tr("L'imposteur", "The Impostor") : ctx.name(id);
    const q = fill(s.q || "", nameOf(s.p));
    const lab = '<span class="eyebrow">Question ' + s.round + " / " + s.rounds + "</span>" + twBanner(T);
    if(s.phase === "write"){
      const mine = ctx.mine(), sent = !!(mine && clip(mine.a, tw)), dg = (s.disg || {})[me];
      screen(root, "w" + s.k + sent, CSS + lab + '<div class="card acc"><div class="big">' + esc(q) + "</div>" + (s.p === me && /\{p\}/.test(s.q) ? '<span class="sm">' + tr("Oui, la question parle de toi : réponds quand même !", "Yes, this question is about you: answer anyway!") + "</span>" : "") + "</div>" +
        (dg ? '<p class="note-box">' + tr("Déguisement : réponds comme le ferait ", "Disguise: answer the way this player would: ") + "<b>" + esc(nameOf(dg)) + "</b>.</p>" : "") +
        (sent ? '<div class="sent"><span class="t">' + esc(clip(mine.a, tw)) + '</span><button class="link" type="button" data-edit>' + tr("Modifier", "Edit") + "</button></div>"
          : '<textarea class="txt qd-in" maxlength="140" placeholder="' + (tw === "short" ? tr("5 mots maximum…", "5 words max…") : tr("Ta réponse, en secret…", "Your answer, in secret…")) + '" aria-label="' + tr("Ta réponse", "Your answer") + '"></textarea>' + (tw === "short" ? '<p class="sm" data-wc>' + tr("0 / 5 mots", "0 / 5 words") + "</p>" : "")) +
        dock((sent ? "" : '<button class="btn acc" type="button" data-send disabled>' + tr("Envoyer", "Send") + "</button>") + '<p class="wait" data-wait></p>' +
          (ctx.isHost ? '<button class="link" type="button" data-skip style="align-self:center" hidden>' + tr("Continuer sans les retardataires", "Continue without the stragglers") + "</button>" : "")), r => {
        const ta = r.querySelector("textarea"), b = r.querySelector("[data-send]");
        if(ta){
          ta.value = "";
          ta.addEventListener("input", () => {
            const n = words(ta.value).length, over = tw === "short" && n > 5;
            b.disabled = !clean(ta.value, 140) || over;
            const wc = r.querySelector("[data-wc]"); if(wc){ wc.textContent = n + tr(" / 5 mots", " / 5 words") + (over ? tr(" · trop long !", " · too long!") : ""); wc.style.color = over ? "var(--bad)" : ""; }
          });
          b.addEventListener("click", () => { const v = clip(ta.value, tw); if(v) ctx.send({ a: v }); });
        }
        const e = r.querySelector("[data-edit]"); if(e) e.addEventListener("click", () => { const old = clip(mine.a, tw); ctx.send({ a: "" }); setTimeout(() => { const t2 = root.querySelector("textarea"); if(t2){ t2.value = old; t2.dispatchEvent(new Event("input")); t2.focus(); } }, 60); });
        const sk = r.querySelector("[data-skip]"); if(sk) armTap(sk, () => ctx.act(c => { if(c.s.phase === "write") toGuess(c); }), tr("Touche encore pour continuer", "Tap again to continue"));
      });
      const done = live.filter(id => { const x = ctx.input(id); return x && clip(x.a, tw); }).length;
      txt(root, "[data-wait]", done + " / " + live.length + tr(" réponses", " answers"));
      const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = done < 2 || done >= live.length;
    } else if(s.phase === "guess" || s.phase === "rev"){
      const ans = A(s.ans), a = ans[s.i] || { id: "", t: "" }, authors = ans.map(x => x.id);
      const head = lab + '<p class="qd-q">' + esc(q) + '</p><span class="eyebrow">' + tr("Réponse ", "Answer ") + (s.i + 1) + " / " + ans.length + '</span><div class="card acc"><div class="qd-a">' + tr("« ", "“") + esc(a.t) + tr(" »", "”") + "</div></div>";
      if(s.phase === "guess"){
        const mine = ctx.mine(), voted = mine && mine.g;
        screen(root, "g" + s.k + (voted || ""), CSS + head + (a.id === me ? '<p class="note-box">' + tr("C'est ta réponse ! Vote quand même pour quelqu'un d'autre, pour brouiller les pistes.", "That's your answer! Vote for someone else anyway, to throw people off.") + "</p>" : '<span class="eyebrow">' + tr("Qui a écrit ça ?", "Who wrote this?") + "</span>") +
          '<div class="choices">' + authors.filter(id => id !== me).map(id => '<button type="button" class="opt" data-v="' + esc(id) + '" aria-pressed="' + (voted === id) + '">' + esc(id === BOT ? tr("L'imposteur (le jeu)", "The Impostor (the game)") : nameOf(id)) + "</button>").join("") + "</div>" +
          dock('<p class="wait" data-wait></p>' + (ctx.isHost ? '<button class="link" type="button" data-skip style="align-self:center" hidden>' + tr("Révéler sans attendre", "Reveal without waiting") + "</button>" : "")), r => {
          r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => ctx.send({ g: b.dataset.v })));
          const sk = r.querySelector("[data-skip]"); if(sk) armTap(sk, () => ctx.act(c => { if(c.s.phase === "guess") toReveal(c); }), tr("Touche encore pour révéler", "Tap again to reveal"));
        });
        const done = live.filter(id => { const x = ctx.input(id); return x && x.g; }).length;
        txt(root, "[data-wait]", (voted ? tr("Vote enregistré · ", "Vote saved · ") : "") + done + " / " + live.length + " votes");
        const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = done < 1 || done >= live.length;
      } else {
        const votes = s.votes || {}, voters = Object.keys(votes).filter(v => v !== a.id);
        const right = voters.filter(v => votes[v] === a.id), wrong = voters.filter(v => votes[v] !== a.id), gain = s.gain || {};
        const lastA = s.i + 1 >= ans.length, lastQ = s.round >= s.rounds, isBot = a.id === BOT;
        let note = "";
        if(isBot) note = '<p class="sm">' + tr("Fausse réponse glissée par le jeu. ", "Fake answer slipped in by the game. ") + (right.length ? tr("Bien vu !", "Nice catch!") : tr("Tout le monde s'est fait avoir.", "Everyone fell for it.")) + "</p>";
        else if(wrong.length) note = '<p class="sm">' + tr(esc(nameOf(a.id)) + " a berné " + wrong.length + " joueur" + (wrong.length > 1 ? "s" : "") + " : ", esc(nameOf(a.id)) + " fooled " + PL(wrong.length, "", "", "player") + ": ") + esc(wrong.map(v => nameOf(v) + " (" + nameOf(votes[v]) + ")").join(", ")) + "</p>";
        if(tw === "perfect" && !isBot && !right.length && voters.length >= 2) note += '<p class="note-box">' + tr("Crime parfait ! " + esc(nameOf(a.id)) + " prend 3 points bonus.", "Perfect crime! " + esc(nameOf(a.id)) + " gets 3 bonus points.") + "</p>";
        if(tw === "lone" && right.length === 1 && !isBot) note += '<p class="note-box">' + tr("Flair solitaire : " + esc(nameOf(right[0])) + " est le (la) seul(e) à avoir trouvé, +3 !", "Lone wolf: " + esc(nameOf(right[0])) + " was the only one to get it: +3!") + "</p>";
        const gk = Object.keys(gain).filter(id => gain[id]);
        screen(root, "r" + s.k + ctx.isHost, CSS + head + '<span class="eyebrow">' + tr("C'était", "It was") + '</span><div class="who">' + esc(nameOf(a.id)) + "</div>" +
          '<div class="field"><span class="eyebrow">' + tr("Ont trouvé", "Got it right") + '</span><div class="qd-ok">' + (right.length ? right.map(v => '<span class="chip ok">' + esc(nameOf(v)) + "</span>").join("") : '<span class="sm">' + tr("Personne !", "Nobody!") + "</span>") + "</div></div>" + note +
          (gk.length ? '<p class="sm">' + tr("Points : ", "Points: ") + esc(gk.map(id => nameOf(id) + " +" + gain[id]).join(", ")) + "</p>" : "") +
          '<div class="field"><span class="eyebrow">Scores</span>' + scoreBars(ctx.ids, s.pts || {}, nameOf) + "</div>" +
          dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (!lastA ? tr("Réponse suivante", "Next answer") : lastQ ? tr("Voir le podium", "See the podium") : tr("Question suivante", "Next question")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
          const b = r.querySelector("[data-next]");
          if(b) b.addEventListener("click", () => ctx.act(c => {
            const st = c.s; if(st.phase !== "rev") return;
            if(st.i + 1 < A(st.ans).length){ c.set({ phase: "guess", i: st.i + 1, votes: {}, gain: {}, k: c.rid() }); return; }
            if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
            c.set(roundState(c, st.round + 1, st.tw, st.lg));
          }));
        });
      }
    } else if(s.phase === "end"){
      const pts = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + esc(fl(FL.win, s.fl, 0)) + '</span><div class="who">' + esc(nameOf(order[0])) + "</div>" + scoreBars(ctx.ids, pts, nameOf) +
        awardsHTML(awards(ctx.ids, s, nameOf)) +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const p = c.s.pts || {}, o2 = c.ids.slice().sort((x, y) => (p[y] || 0) - (p[x] || 0)), mx = p[o2[0]] || 0;
          c.end({ title: tr("Qui a dit ça ? · " + c.name(o2[0]) + " gagne", "Who Said It? · " + c.name(o2[0]) + " wins"), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (p[id] || 0) + " pts").concat(awards(c.ids, c.s, c.name).slice(0, 2).map(a => a[0] + tr(" : ", ": ") + a[1])),
            win: mx ? o2.filter(id => (p[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : on se le passe pour écrire, puis on devine ensemble ---------- */
  local: {
    players: { min: 3, max: 12 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => id === BOT ? tr("L'imposteur", "The Impostor") : names[+id], lg = SB.lang();
      let sel = A(store().qdPacks).length ? A(store().qdPacks).slice() : ["soft"];
      let rounds = [3, 5, 8].indexOf(store().qdRounds) >= 0 ? store().qdRounds : 3, twOn = store().qdTw !== false;
      const gk = "qd" + Math.random().toString(36).slice(2, 8);
      let deck = [], round = 0, q = "", w = 0, ans = [], i = 0, found = [], st = {}, tw = null, disg = {}, fk = "", gain = {}, seed = 0;
      const qOf = () => fill(q.t, nameOf(q.p)), t = () => (tw ? tw.id : "");
      function newRound(){
        if(!deck.length) deck = deckFor(SB.okPacks(sel, PACKS), lg);
        q = { t: deck.pop(), p: pick(ids) }; SB.u.saw(SEEN, q.t); round++; w = 0; ans = [];
        tw = pickTw(twOn, round, t()); disg = t() === "disg" ? derange(ids) : {}; fk = t() === "fake" ? fakeFor(SB.okPacks(sel, PACKS), lg) : "";
        go("pass");
      }
      const go = ph => {
        if(ph === "setup"){
          screen(root, "su" + sel.join() + rounds + twOn, CSS + '<p class="howto">' + tr("Chacun à son tour prend le téléphone et écrit sa réponse en secret. Ensuite, les réponses s'affichent une par une : devinez ensemble qui a écrit quoi.", "Take turns with the phone and write your answer in secret. Then the answers appear one by one: guess together who wrote what.") + "</p>" +
            '<div class="field"><span class="eyebrow">Questions</span><div class="seg">' + [3, 5, 8].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (n === rounds) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variante", "Variant") + '</span><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change pour une question", "Every now and then, a rule changes for one question") + "</span></span></button></div></div>" +
            dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ qdRounds: rounds }); go("setup"); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ qdPacks: sel }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ qdTw: twOn }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => { if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; } deck = deckFor(SB.okPacks(sel, PACKS), lg); round = 0; st = {}; tw = null; seed = Math.floor(Math.random() * 12); newRound(); });
          });
        } else if(ph === "pass"){
          screen(root, "pa" + round + "-" + w, '<span class="eyebrow">Question ' + round + " / " + rounds + "</span>" + (w === 0 ? twBanner(tw) : "") + '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(names[w]) + "</div><p>" + tr("Les autres, ne regardez pas l'écran.", "Everyone else, don't look at the screen.") + "</p></div>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi", "It's me") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => go("write")));
        } else if(ph === "write"){
          const dg = disg[String(w)];
          screen(root, "wr" + round + "-" + w, CSS + '<span class="eyebrow">' + esc(names[w]) + "</span>" + twBanner(tw) + '<div class="card acc"><div class="big">' + esc(qOf()) + "</div></div>" +
            (dg ? '<p class="note-box">' + tr("Déguisement : réponds comme le ferait ", "Disguise: answer the way this player would: ") + "<b>" + esc(nameOf(dg)) + "</b>.</p>" : "") +
            '<textarea class="txt qd-in" maxlength="140" placeholder="' + (t() === "short" ? tr("5 mots maximum…", "5 words max…") : tr("Ta réponse, en secret…", "Your answer, in secret…")) + '" aria-label="' + tr("Ta réponse", "Your answer") + '"></textarea>' + (t() === "short" ? '<p class="sm" data-wc>' + tr("0 / 5 mots", "0 / 5 words") + "</p>" : "") +
            dock('<button class="btn acc" type="button" data-n disabled>' + tr("Valider et cacher", "Confirm and hide") + "</button>"), r => {
            const ta = r.querySelector("textarea"), b = r.querySelector("[data-n]");
            ta.addEventListener("input", () => {
              const n = words(ta.value).length, over = t() === "short" && n > 5;
              b.disabled = !clean(ta.value, 140) || over;
              const wc = r.querySelector("[data-wc]"); if(wc){ wc.textContent = n + tr(" / 5 mots", " / 5 words") + (over ? tr(" · trop long !", " · too long!") : ""); wc.style.color = over ? "var(--bad)" : ""; }
            });
            b.addEventListener("click", () => {
              const v = clip(ta.value, t()); if(!v) return;
              ans.push({ id: String(w), t: v }); w++;
              if(w < names.length) go("pass"); else { if(fk) ans.push({ id: BOT, t: fk }); ans = shuffle(ans); i = 0; go("guess"); }
            });
          });
        } else if(ph === "guess" || ph === "rev"){
          const a = ans[i];
          const head = '<span class="eyebrow">Question ' + round + " / " + rounds + "</span>" + twBanner(tw) + '<p class="qd-q">' + esc(qOf()) + '</p><span class="eyebrow">' + tr("Réponse ", "Answer ") + (i + 1) + " / " + ans.length + '</span><div class="card acc"><div class="qd-a">' + tr("« ", "“") + esc(a.t) + tr(" »", "”") + "</div></div>";
          if(ph === "guess"){
            screen(root, "gu" + round + "-" + i, CSS + head + '<p class="howto">' + tr("Débattez : qui a écrit ça ?", "Debate: who wrote this?") + (fk ? tr(" Attention, l'une des réponses a été écrite par le jeu.", " Careful, one of the answers was written by the game.") : "") + tr(" Chacun annonce son suspect à voix haute, puis on révèle.", " Everyone names their suspect out loud, then reveal.") + "</p>" + dock('<button class="btn acc" type="button" data-n>' + tr("Révéler l'auteur(e)", "Reveal the author") + "</button>"), r => {
              r.querySelector("[data-n]").addEventListener("click", () => { found = []; go("rev"); });
            });
          } else {
            const lastA = i + 1 >= ans.length, lastQ = round >= rounds;
            screen(root, "rv" + round + "-" + i + found.join(), CSS + head + '<span class="eyebrow">' + tr("C'était", "It was") + '</span><div class="who">' + esc(nameOf(a.id)) + "</div>" + (a.id === BOT ? '<p class="sm">' + tr("Fausse réponse glissée par le jeu !", "Fake answer slipped in by the game!") + "</p>" : "") +
              '<span class="eyebrow">' + tr("Qui a trouvé ? Touchez les prénoms", "Who got it right? Tap their names") + '</span><div class="qd-rows">' + ids.filter(id => id !== a.id).map(id => '<button type="button" class="qd-r" data-p="' + id + '" aria-pressed="' + (found.indexOf(id) >= 0) + '"><span>' + esc(nameOf(id)) + '</span><span class="m">' + (found.indexOf(id) >= 0 ? tr("Trouvé ✓", "Got it ✓") : tr("Raté", "Missed")) + "</span></button>").join("") + "</div>" +
              dock('<button class="btn acc" type="button" data-n>' + (!lastA ? tr("Réponse suivante", "Next answer") : lastQ ? tr("Voir le podium", "See the podium") : tr("Question suivante", "Next question")) + "</button>"), r => {
              r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const x = found.indexOf(b.dataset.p); if(x >= 0) found.splice(x, 1); else found.push(b.dataset.p); go("rev"); }));
              r.querySelector("[data-n]").addEventListener("click", () => {
                const d = scoreAnswer(a.id, ids.filter(id => id !== a.id), found.slice(), t());
                st = merge(st, d); gain = d.pts;
                const gl = qdGages(a.id, ids.filter(id => id !== a.id), found.slice());
                if(api.gage && gl.length) api.gage(gl.map(x => ({ id: nameOf(x.id), ev: x.ev })), gk + ":" + round + ":" + i);
                const notes = [];
                if(t() === "perfect" && a.id !== BOT && !found.length) notes.push(tr("Crime parfait ! " + nameOf(a.id) + " prend 3 points bonus.", "Perfect crime! " + nameOf(a.id) + " gets 3 bonus points."));
                if(t() === "lone" && a.id !== BOT && found.length === 1) notes.push(tr("Flair solitaire : " + nameOf(found[0]) + " marque 3 points.", "Lone wolf: " + nameOf(found[0]) + " scores 3 points."));
                notes.forEach(n => SB.u.toast(n));
                if(!lastA){ i++; go("guess"); } else if(!lastQ) newRound(); else go("end");
              });
            });
          }
        } else if(ph === "end"){
          const pts = st.pts || {}, order = ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[order[0]] || 0;
          api.win(mx ? order.filter(id => (pts[id] || 0) === mx).map(nameOf) : []);
          screen(root, "end", CSS + '<span class="eyebrow">' + esc(fl(FL.win, seed, 0)) + '</span><div class="who">' + esc(nameOf(order[0])) + "</div>" + scoreBars(ids, pts, nameOf) +
            awardsHTML(awards(ids, Object.assign({ fl: seed }, st), nameOf)) +
            dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go("setup");
    }
  }
};
SB.register(DEF);
})();
