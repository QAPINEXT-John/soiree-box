/* Qui est le plus… — chacun vote pour le joueur qui correspond le mieux. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr } = SB.u;

const SOFT = [
  "finir en garde à vue","devenir célèbre","oublier l'anniversaire de sa mère","se perdre même avec un GPS","pleurer devant un dessin animé",
  "survivre à une apocalypse zombie","devenir millionnaire","se marier à Las Vegas","rater son avion","manger le dernier morceau sans demander",
  "parler à ses plantes","finir une série en une nuit","se faire virer le premier jour","adopter dix chats","arriver en retard à son propre mariage",
  "croire à une fausse info","devenir président de la République","tomber amoureux en vacances","se battre avec un pigeon","rire à un enterrement",
  "partir vivre au bout du monde","gagner à un jeu télé","casser son téléphone cette année","s'endormir en pleine soirée","inventer une excuse bidon",
  "rester coincé dans un ascenseur","lancer une start-up qui coule","devenir influenceur","chanter faux au karaoké en y croyant à fond","dépenser tout son salaire en une journée",
  "se faire arnaquer en ligne","oublier un prénom juste après l'avoir entendu","mourir le premier dans un film d'horreur","avoir un compte secret sur les réseaux",
  "tout raconter après deux verres","faire un selfie dans une situation grave","passer la nuit sur un jeu vidéo","envoyer un message gênant au mauvais destinataire",
  "parler tout seul dans la rue","se lancer dans un projet complètement fou","pleurer de rire pour rien","avoir une théorie du complot préférée",
  "se faire passer pour quelqu'un d'autre au téléphone","rire de sa propre blague avant la chute","perdre ses clés trois fois dans la même journée","finir la soirée en pyjama chez quelqu'un d'autre",
  "devenir le meilleur ami d'un inconnu dans le train","s'inscrire à la salle de sport sans jamais y aller","spoiler la fin d'un film sans le faire exprès","envoyer un vocal de dix minutes",
  "tomber dans les escaliers devant tout le monde","oublier son propre anniversaire","se faire adopter par un chat errant","ouvrir un restaurant","pleurer à la fin d'une pub",
  "monter un groupe de musique","se perdre dans un magasin de meubles","gagner un concours de danse improvisé","partir en week-end sans prévenir personne",
  "tenir une conversation entière en citant des films","devenir accro à un jeu sur téléphone","acheter un objet inutile à 3 h du matin","faire la une du journal local",
  "se tromper de soirée et rester quand même","battre un record du monde absurde","se lancer dans le stand-up","oublier son téléphone dans un taxi",
  "répondre « vous aussi » au serveur qui souhaite bon appétit","survivre seul sur une île déserte","se disputer avec un GPS","devenir maire de son village","réveiller tout l'immeuble en rentrant"
];
const HOT = [
  "envoyer un message coquin à la mauvaise personne","avoir un coup d'un soir ce week-end","recoucher avec son ex","se faire surprendre en pleine action",
  "avoir un fantasme inavouable","draguer quelqu'un de casé sans le savoir","mentir sur son nombre de partenaires","tomber amoureux de son boss",
  "avoir une appli de rencontre installée en ce moment","embrasser quelqu'un de cette pièce ce soir","faire un strip-tease en soirée","avoir un tatouage caché",
  "finir la soirée chez un inconnu","avoir déjà envoyé une photo osée","rompre par texto","espionner son ex à 3 h du matin","avoir un crush sur un pote de pote",
  "tester un plan à trois","se réveiller sans savoir où il est","draguer le serveur ou la serveuse","garder une photo compromettante de quelqu'un",
  "faire l'amour dans un lieu public","donner un faux prénom en soirée","retourner avec quelqu'un qu'il a juré de ne plus revoir","avoir un historique de recherche honteux",
  "séduire avec une technique ridicule","mentir sur son âge sur une appli","avoir le plus de conquêtes dans ce groupe","être le plus bruyant au lit","oser une déclaration en plein repas de famille",
  "liker par erreur une vieille photo de son crush","avoir un crush sur quelqu'un de cette pièce","envoyer un « tu dors ? » à 2 h du matin","se faire repérer sur une appli de rencontre par un collègue",
  "oublier le prénom de son rencard","donner rendez-vous dans un lieu complètement improbable","embrasser un inconnu à minuit au Nouvel An","garder le pull d'un ex comme trophée",
  "avoir un rendez-vous galant pendant les heures de travail","s'inventer un faux métier pour séduire","faire semblant d'aimer un film pour plaire","espionner le nouveau partenaire de son ex",
  "se remettre avec quelqu'un après une seule nuit de réflexion","faire un compliment beaucoup trop osé à son boss"
];
const TRASH = ["avoir déjà regardé du porno au travail", "avoir un dossier secret bien rempli sur son ordi", "avoir déjà fait l'amour dans une cabine d'essayage", "avoir couché avec quelqu'un de ce groupe", "avoir déjà couché avec deux personnes le même jour", "avoir déjà simulé", "envoyer des nudes ce soir", "avoir un abonnement à un site X", "avoir déjà fait un plan à plusieurs", "finir dans un club libertin ce week-end", "avoir le fétiche le plus bizarre", "avoir déjà été surpris en train de se faire plaisir", "coucher le premier soir", "coucher avec son boss pour une promotion", "avoir une collection de sex toys", "tourner un porno amateur", "avoir déjà fait l'amour au bureau", "oublier le prénom de la personne avec qui il vient de coucher", "faire l'amour sur une musique ridicule", "avoir des menottes dans sa table de nuit", "avoir déjà eu une panne mémorable", "avoir un plan cul avec un voisin", "coucher avec l'ex d'un pote", "faire le premier pas sur une appli à 3 h du matin", "avoir le dirty talk le plus gênant", "avoir un mot de sécurité ridicule", "faire l'amour en sachant que le coloc entend tout", "avoir déjà joué au strip-poker", "avoir une liste de fantasmes rédigée quelque part", "se tromper de prénom au pire moment", "avoir déjà testé un déguisement coquin", "acheter de la lingerie pour une soirée qui n'a jamais eu lieu", "avoir fait l'amour dans le lit de quelqu'un d'autre", "s'être déjà fait recaler en pleins préliminaires", "avoir un plan cul régulier que personne ne connaît", "proposer un jeu coquin à la fin de cette soirée", "transformer un massage innocent en tout autre chose"];
const NOIR = ["mourir de la manière la plus stupide", "finir dans la rubrique faits divers", "oublier l'enterrement de sa propre grand-mère", "rire pendant une minute de silence", "se faire déshériter", "avoir été un tueur en série dans une autre vie", "vendre son âme au diable pour un téléphone", "faire une blague au chevet d'un mourant", "finir dévoré par ses chats", "transformer son propre enterrement en soirée à thème", "vendre ses amis aux zombies pour survivre", "léguer ses dettes à ses amis", "se faire virer des pompes funèbres", "tomber amoureux d'un croque-mort", "faire un selfie devant un cercueil", "hanter ses ex après sa mort", "mourir bêtement en allant voir d'où vient le bruit", "rédiger son propre éloge funèbre à l'avance", "se faire virer d'un enterrement pour fou rire", "mourir en essayant de tourner une vidéo virale", "léguer sa collection de chaussettes à un musée", "demander à être enterré avec son téléphone chargé", "survivre à tout le monde dans ce groupe", "finir en fantôme qui fait grincer les portes", "écrire un testament plein de règlements de comptes", "choisir une chanson ridicule pour son enterrement", "se réincarner en plante verte"];
/* English decks: verb phrases that follow "Who's most likely to…". */
const SOFT_EN = [
  "end up in a police cell","become famous","forget their mom's birthday","get lost even with GPS","cry at a cartoon",
  "survive a zombie apocalypse","become a millionaire","get married in Vegas","miss their flight","eat the last slice without asking",
  "talk to their plants","binge a whole series in one night","get fired on their first day","adopt ten cats","show up late to their own wedding",
  "fall for fake news","become president","fall in love on vacation","get into a fight with a pigeon","laugh at a funeral",
  "move to the other side of the world","win a game show","break their phone this year","fall asleep in the middle of a party","make up a terrible excuse",
  "get stuck in an elevator","launch a startup that tanks","become an influencer","sing off-key at karaoke and fully commit","blow their whole paycheck in one day",
  "get scammed online","forget someone's name right after hearing it","die first in a horror movie","have a secret social media account",
  "spill everything after two drinks","take a selfie at the worst possible moment","pull an all-nighter on a video game","send an awkward text to the wrong person",
  "talk to themselves in the street","dive into a completely insane project","cry laughing over nothing","have a favorite conspiracy theory",
  "pretend to be someone else on the phone","laugh at their own joke before the punchline","lose their keys three times in one day","end the night in pajamas at someone else's place",
  "become best friends with a stranger on the train","join a gym and never go","accidentally spoil the end of a movie","send a ten-minute voice note",
  "fall down the stairs in front of everyone","forget their own birthday","get adopted by a stray cat","open a restaurant","cry at a commercial",
  "start a band","get lost in a giant furniture store","win an improvised dance-off","go away for the weekend without telling anyone",
  "hold an entire conversation in movie quotes","get hooked on a phone game","buy something useless at 3 a.m.","make the front page of the local paper",
  "crash the wrong party and stay anyway","break an absurd world record","try stand-up comedy","leave their phone in a cab",
  "say “you too” when the waiter says “enjoy your meal”","survive alone on a desert island","argue with their GPS","become mayor of their hometown","wake up the whole building coming home"
];
const HOT_EN = [
  "send a dirty text to the wrong person","have a one-night stand this weekend","sleep with their ex again","get caught in the act",
  "have an unspeakable fantasy","hit on someone taken without knowing it","lie about their body count","fall for their boss",
  "have a dating app installed right now","kiss someone in this room tonight","do a striptease at a party","have a hidden tattoo",
  "end the night at a stranger's place","have sent a risqué photo before","break up over text","stalk their ex at 3 a.m.","have a crush on a friend of a friend",
  "try a threesome","wake up with no idea where they are","flirt with the waiter or waitress","keep a compromising photo of someone",
  "have sex in a public place","give a fake name at a party","get back with someone they swore never to see again","have a shameful search history",
  "seduce someone with a ridiculous move","lie about their age on a dating app","have the most hookups in this group","be the loudest in bed","declare their love in the middle of a family dinner",
  "accidentally like their crush's old photo","have a crush on someone in this room","send a “you up?” text at 2 a.m.","get spotted on a dating app by a coworker",
  "forget their date's name","suggest a first date somewhere completely bizarre","kiss a stranger at midnight on New Year's Eve","keep an ex's hoodie as a trophy",
  "go on a date during work hours","invent a fake job to impress someone","pretend to love a movie to impress a date","stalk their ex's new partner",
  "get back together with someone after one night of thinking it over","give their boss a way-too-forward compliment"
];
const TRASH_EN = ["have watched porn at work", "have a very full secret folder on their computer", "have had sex in a fitting room", "have slept with someone in this group", "have slept with two people on the same day", "have faked it", "send nudes tonight", "pay for a porn site subscription", "have had group sex", "end up at a swingers' club this weekend", "have the weirdest fetish", "have been caught pleasuring themselves", "sleep with someone on the first date", "sleep with their boss for a promotion", "own a sex toy collection", "film an amateur porno", "have had sex at the office", "forget the name of the person they just slept with", "have sex to a ridiculous song", "keep handcuffs in their nightstand", "have had a legendary failure to perform", "have a friends-with-benefits thing with a neighbor", "sleep with a friend's ex", "make the first move on a dating app at 3 a.m.", "have the most cringe dirty talk", "have a ridiculous safe word", "have sex knowing the roommate can hear everything", "have played strip poker", "have a written list of fantasies somewhere", "moan the wrong name at the worst moment", "have tried a naughty costume", "buy lingerie for a night that never happened", "have had sex in someone else's bed", "have been turned down in the middle of foreplay", "have a regular hookup nobody knows about", "suggest a naughty game at the end of this party", "turn an innocent massage into something else entirely"];
const NOIR_EN = ["die in the dumbest way possible", "end up in the crime section of the news", "forget their own grandma's funeral", "laugh during a minute of silence", "get cut out of the will", "have been a serial killer in a past life", "sell their soul to the devil for a new phone", "crack a joke at someone's deathbed", "get eaten by their own cats", "turn their own funeral into a theme party", "sell out their friends to zombies to survive", "leave their debts to their friends", "get fired from a funeral home", "fall in love with an undertaker", "take a selfie in front of a coffin", "haunt their exes after they die", "die stupidly going to check where that noise came from", "write their own eulogy in advance", "get kicked out of a funeral for giggling", "die trying to film a viral video", "leave their sock collection to a museum", "ask to be buried with a fully charged phone", "outlive everyone in this group", "come back as a ghost who makes doors creak", "write a will full of payback", "pick a ridiculous song for their funeral", "be reincarnated as a houseplant"];
// Contenu dans la langue de l'hôte (s.lg) ; l'interface suit le téléphone (tr).
const LISTS = { fr: { soft: SOFT, adulte: HOT.concat(TRASH, NOIR) }, en: { soft: SOFT_EN, adulte: HOT_EN.concat(TRASH_EN, NOIR_EN) } };
const lists = lg => LISTS[lg === "en" ? "en" : "fr"];
const PREFIX = "Qui est le plus susceptible de…";
const PACKS = [
  { v: "soft", label: tr("Classique", "Classic"), desc: tr("Pour tout le monde", "For everyone"), list: lists(SB.lang()).soft },
  { v: "adulte", label: tr("Adultes", "Adults"), desc: tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult stuff"), list: lists(SB.lang()).adulte, hot: true }
];
const SEEN = "quiplus:q";
function deckFor(packs, lg){
  const sel = A(packs), L = lists(lg); const pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => L[p.v]);
  return SB.u.fresh(SEEN, pool.length ? pool : L.soft);
}
function packButtons(sel){
  return '<div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>";
}
function twToggle(on){
  return '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + !!on + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change pour une question", "Now and then, a rule changes for one question") + '</span></span></button></div>';
}
function bars(ids, counts, nameOf, voters){
  const total = Math.max(1, ids.reduce((a, id) => a + (counts[id] || 0), 0));
  return '<div class="bars">' + ids.filter(id => counts[id]).sort((a, b) => counts[b] - counts[a]).map(id =>
    '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + counts[id] + " vote" + (counts[id] > 1 ? "s" : "") + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * counts[id] / total) + '%"></div></div>' +
    (voters ? '<span class="vt">' + esc(A(voters[id]).map(nameOf).join(", ")) + "</span>" : "") + "</div>").join("") + "</div>";
}
// Coups de théâtre (réseau) : un par question au maximum, jamais à la première.
const TW = [
  { id: "x2", name: tr("Question en or", "Golden question"), desc: tr("Les votes de cette question comptent double pour le titre de la soirée.", "Votes on this question count double toward the title of the night.") },
  { id: "noself", name: tr("Pas moi !", "Not me!"), desc: tr("Interdit de voter pour soi sur cette question.", "No voting for yourself on this question.") },
  { id: "open", name: tr("Vote à découvert", "Open vote"), desc: tr("Cette fois, tout le monde voit qui a voté pour qui.", "This time, everyone sees who voted for whom.") },
  { id: "moins", name: tr("Le monde à l'envers", "Upside down"), desc: tr("On vote pour le MOINS susceptible. Ces votes ne comptent pas pour le titre.", "Vote for the LEAST likely. These votes don't count toward the title.") },
  { id: "duo", name: tr("Double vote", "Double vote"), desc: tr("Chacun désigne deux joueurs différents.", "Everyone picks two different players."), ok: o => o.n >= 3 },
  { id: "pick", name: tr("Le désigné choisit", "Chosen one picks"), desc: tr("Le plus désigné choisit la prochaine question parmi trois.", "The most-voted player picks the next question out of three.") },
  { id: "jackpot", name: "Jackpot", desc: tr("Si tout le monde désigne la même personne, elle gagne 3 votes bonus.", "If everyone picks the same person, they get 3 bonus votes."), ok: o => o.n >= 3 }
];
// Coups de théâtre (un seul téléphone, sans scores)
const TWL = [
  { id: "noself", name: tr("Pas moi !", "Not me!"), desc: tr("Interdit de se désigner soi-même.", "No pointing at yourself.") },
  { id: "duo", name: tr("Deux doigts", "Two fingers"), desc: tr("Pointez deux personnes à la fois, une par main.", "Point at two people at once, one with each hand.") },
  { id: "moins", name: tr("Le monde à l'envers", "Upside down"), desc: tr("Désignez le MOINS susceptible du groupe.", "Point at the LEAST likely person in the group.") },
  { id: "plea", name: tr("Plaidoirie", "Plead your case"), desc: tr("Le plus désigné a 20 secondes pour se défendre, puis on revote : s'il convainc la moitié du groupe, il est blanchi.", "The most-pointed-at player gets 20 seconds to defend themselves, then everyone votes again: if they win over half the group, they're cleared.") },
  { id: "pick", name: tr("Le désigné choisit", "Chosen one picks"), desc: tr("Le plus désigné choisit la prochaine question parmi trois.", "The most-pointed-at player picks the next question out of three.") },
  { id: "eyes", name: tr("Yeux fermés", "Eyes closed"), desc: tr("Tout le monde ferme les yeux pour pointer, et on les rouvre en même temps.", "Everyone closes their eyes to point, then opens them at the same time.") }
];
const PREFIX_MOINS = "Qui est le MOINS susceptible de…";
// « de avoir » → « d'avoir » : le début de la question décide de l'élision (français uniquement).
const elide = q => { const t = String(q || "").trim(); return /^[aeiouyàâäéèêëîïôöùûüœ]/i.test(t) || /^h(abit|abill|ésit|érit|umili|allucin|onor|ospital)/i.test(t); };
// Le préfixe fait partie de la phrase : il suit la langue du contenu (lg = s.lg en réseau).
const prefixFor = (moins, q, lg) => lg === "en" ? (moins ? "Who's LEAST likely to…" : "Who's most likely to…") : (moins ? PREFIX_MOINS : PREFIX).replace(/de…$/, elide(q) ? "d'…" : "de…");
const FL = {
  champ: tr(["Titre de la soirée", "Élu par le peuple", "La star du groupe", "Suspect numéro un"], ["Title of the night", "Elected by the people", "Star of the group", "Prime suspect"]),
  mav: tr(["L'électron libre", "Le franc-tireur", "Jamais d'accord avec personne"], ["The free spirit", "The lone wolf", "Never agrees with anyone"]),
  self: tr(["Assume tout", "Lucide sur soi-même", "Autocritique en chef"], ["Owns it all", "Brutally self-aware", "Chief self-critic"]),
  saint: tr(["L'insoupçonnable", "Passé sous les radars", "Le saint du groupe"], ["Above suspicion", "Flew under the radar", "The group's saint"])
};
function fl(list, seed, k){ return list[((seed || 0) + k) % list.length]; }
function awards(ids, s, nameOf){
  const t = s.total || {}, mv = s.mav || {}, sf = s.self || {}, seed = s.fl || 0, out = [];
  const used = [], top = m => { const by = l => l.filter(id => m[id]).sort((a, b) => m[b] - m[a])[0]; const r = by(ids.filter(id => used.indexOf(id) < 0)) || by(ids); if(r) used.push(r); return r; };
  const m = top(mv); if(m) out.push([fl(FL.mav, seed, 1), nameOf(m), tr("À contre-courant du groupe " + mv[m] + " fois", "Went against the group " + mv[m] + (mv[m] === 1 ? " time" : " times"))]);
  const f = top(sf); if(f) out.push([fl(FL.self, seed, 2), nameOf(f), tr("A voté pour soi " + sf[f] + " fois", "Voted for themselves " + sf[f] + (sf[f] === 1 ? " time" : " times"))]);
  const low = ids.slice().sort((a, b) => ((t[a] || 0) - (t[b] || 0)) || ((used.indexOf(a) >= 0) - (used.indexOf(b) >= 0)))[0];
  if(low && ids.length > 2) out.push([fl(FL.saint, seed, 3), nameOf(low), (t[low] || 0) ? tr("Seulement " + t[low] + " vote" + (t[low] > 1 ? "s" : ""), "Only " + t[low] + " vote" + (t[low] > 1 ? "s" : "")) : tr("Jamais désigné", "Never picked")]);
  return out;
}
function nextTw(o, round, last, n){ return o.twists !== false && round > 1 ? SB.u.twist(TW, { last, n, rate: .35 }) : null; }

SB.register({
  id: "quiplus", name: tr("Qui est le plus…", "Most Likely To…"), glyph: tr("Qui ?", "Who?"), pitch: tr("Votez pour le joueur le plus susceptible de…", "Vote for the player most likely to…"), hot: true,
  accent: { light: "#ffb34d", dark: "#ffb34d" },
  tag: tr("Une question, tout le monde vote pour un joueur. Les résultats tombent d'un coup.", "One question, everyone votes for a player. The results drop all at once."),
  min: 3, max: 20,
  gages: [{ ev: "top", label: tr("Le plus désigné de la question", "Most voted on a question"), kind: "boit", n: 2 }],
  rules: tr([
    "Une question s'affiche : « Qui est le plus susceptible de… ».",
    "Chacun vote en secret pour un joueur, y compris pour lui-même.",
    "Les résultats s'affichent quand tout le monde a voté. Défendez-vous !",
    "Coups de théâtre : de temps en temps, une question change les règles (question en or, double vote, monde à l'envers, jackpot…).",
    "Les questions déjà vues passent après les nouvelles. À la fin : le titre de la soirée et quelques trophées."
  ], [
    "A question pops up: “Who's most likely to…”.",
    "Everyone secretly votes for one player, themselves included.",
    "Results show up once everyone has voted. Defend yourselves!",
    "Twists: now and then, a question changes the rules (golden question, double vote, upside down, jackpot…).",
    "Questions you've already seen come after new ones. At the end: the title of the night and a few trophies."
  ]),
  options: [
    { id: "rounds", label: "Questions", type: "seg", def: 10, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["soft"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "anon", label: "Votes", type: "toggle", text: tr("Votes anonymes", "Anonymous votes"), desc: tr("Sinon, on voit qui a voté pour qui", "Otherwise, everyone sees who voted for whom"), def: true },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une question", "Now and then, a rule changes for one question"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet de questions.", "Pick at least one question pack."));
    const lg = SB.lang(), deck = deckFor(o.packs, lg), q = deck.pop();
    SB.u.saw(SEEN, q);
    ctx.setPriv({ deck });
    return { lg, phase: "vote", q, tw: "", round: 1, rounds: o.rounds || 10, anon: o.anon !== false, counts: {}, voters: {}, total: {}, mav: {}, self: {} };
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "vote") return;
    const live = ctx.ids.filter(id => ctx.here(id)), tw = s.tw || "";
    const votes = {};
    const valid = (id, i) => i && ctx.ids.indexOf(i.v) >= 0 && !(tw === "noself" && i.v === id) &&
      (tw !== "duo" || (ctx.ids.indexOf(i.w) >= 0 && i.w !== i.v));
    const ok = live.length && live.every(id => { const i = ctx.input(id); if(valid(id, i)){ votes[id] = tw === "duo" ? [i.v, i.w] : [i.v]; return true; } return false; });
    if(!ok) return;
    const w = tw === "x2" ? 2 : tw === "moins" ? 0 : 1;
    const counts = {}, voters = {}, total = Object.assign({}, s.total || {}), mav = Object.assign({}, s.mav || {}), self = Object.assign({}, s.self || {});
    Object.keys(votes).forEach(v => votes[v].forEach(t => { counts[t] = (counts[t] || 0) + 1; (voters[t] = voters[t] || []).push(v); total[t] = (total[t] || 0) + w; }));
    const max = Math.max.apply(null, Object.keys(counts).map(k => counts[k]).concat([0])), top = Object.keys(counts).filter(k => counts[k] === max);
    Object.keys(votes).forEach(v => { if(votes[v].indexOf(v) >= 0) self[v] = (self[v] || 0) + 1; if(!votes[v].some(t => top.indexOf(t) >= 0)) mav[v] = (mav[v] || 0) + 1; });
    if(top.length && max > 0) ctx.gage(top.map(id => ({ id, ev: "top" })), s.k);
    const patch = { phase: "res", counts, voters: s.anon && tw !== "open" ? {} : voters, total, mav, self, jack: "" };
    if(tw === "jackpot" && top.length === 1 && Object.keys(votes).length >= 3 && counts[top[0]] === Object.keys(votes).length){ total[top[0]] += 3; patch.jack = top[0]; }
    if(tw === "pick" && s.round < s.rounds){
      let deck = A(ctx.priv().deck); if(deck.length < 3) deck = deckFor(ctx.opts.packs, s.lg).concat(deck);
      patch.ch = [deck.pop(), deck.pop(), deck.pop()]; patch.by = pick(top); ctx.setPriv({ deck });
    }
    ctx.set(patch);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, tw = s.tw || "", T = SB.u.byTwist(TW, tw);
    const lab = '<span class="eyebrow">Question ' + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T);
    const qCard = '<div class="card acc"><span class="eyebrow">' + prefixFor(tw === "moins", s.q, s.lg) + '</span><div class="big">… ' + esc(s.q) + "</div></div>";
    if(s.phase === "vote"){
      const duo = tw === "duo", noself = tw === "noself";
      screen(root, "v" + s.k, lab + qCard + (duo ? '<p class="sm">' + tr("Choisis deux joueurs.", "Pick two players.") + '</p>' : "") + '<div class="choices">' + ctx.players.map(p => '<button type="button" class="opt" data-v="' + esc(p.id) + '"' + (noself && p.id === me ? " disabled" : "") + ">" + esc(p.name) + (p.id === me ? ' <span class="pill me">' + tr("Moi", "Me") + "</span>" : "") + "</button>").join("") +
        '</div>' + SB.u.dock('<button class="btn acc" type="button" data-vote disabled>' + tr("Voter", "Vote") + '</button><p class="wait" data-wait></p>'), r => {
        let v = [];
        const vb = r.querySelector("[data-vote]");
        r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
          const id = b.dataset.v, x = v.indexOf(id);
          if(duo){ if(x >= 0) v.splice(x, 1); else { v.push(id); if(v.length > 2) v.shift(); } } else v = [id];
          r.querySelectorAll("[data-v]").forEach(y => y.setAttribute("aria-pressed", v.indexOf(y.dataset.v) >= 0));
          vb.disabled = v.length !== (duo ? 2 : 1);
        }));
        vb.addEventListener("click", () => { if(v.length !== (duo ? 2 : 1)) return; ctx.send(duo ? { v: v[0], w: v[1] } : { v: v[0] }); vb.disabled = true; vb.textContent = tr("Vote envoyé", "Vote sent"); r.querySelectorAll("[data-v]").forEach(x => { x.disabled = true; }); });
      });
      const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && i.v; }).length;
      txt(root, "[data-wait]", done + " / " + live.length + " votes");
    } else if(s.phase === "res"){
      const counts = s.counts || {}, max = Math.max.apply(null, Object.keys(counts).map(k => counts[k]).concat([0]));
      const top = Object.keys(counts).filter(k => counts[k] === max).map(ctx.name);
      const ch = A(s.ch), by = s.by || "", chosen = by ? ctx.input(by) : null, pk = chosen && chosen.pk != null ? +chosen.pk : -1;
      let extra = "";
      if(s.jack) extra += '<p class="note-box">' + tr("Jackpot ! Tout le monde a désigné " + esc(ctx.name(s.jack)) + " : +3 votes bonus.", "Jackpot! Everyone picked " + esc(ctx.name(s.jack)) + ": +3 bonus votes.") + "</p>";
      if(tw === "x2") extra += '<p class="sm">' + tr("Question en or : ces votes comptent double.", "Golden question: these votes count double.") + "</p>";
      if(tw === "moins") extra += '<p class="sm">' + tr("Le monde à l'envers : ces votes ne comptent pas pour le titre.", "Upside down: these votes don't count toward the title.") + "</p>";
      if(ch.length){
        extra += '<div class="field"><span class="eyebrow">' + (by === me ? tr("À toi de choisir la prochaine question", "Your turn to pick the next question") : tr(esc(ctx.name(by)) + " choisit la prochaine question", esc(ctx.name(by)) + " picks the next question")) + '</span><div class="choices">' +
          ch.map((x, i) => '<button type="button" class="opt" data-pk="' + i + '" aria-pressed="' + (pk === i) + '"' + (by === me ? "" : " disabled") + ">… " + esc(x) + "</button>").join("") + "</div></div>";
      }
      screen(root, "r" + s.k + ctx.isHost + pk, lab + qCard + '<span class="eyebrow">' + (top.length > 1 ? tr("Égalité", "It's a tie") : tr("Le groupe a parlé", "The group has spoken")) + '</span><div class="who">' + esc(top.join(" & ")) + "</div>" +
        bars(ctx.ids, counts, ctx.name, s.voters && Object.keys(s.voters).length ? s.voters : null) + extra +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir les résultats", "See the results") : tr("Question suivante", "Next question")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        r.querySelectorAll("[data-pk]").forEach(b => b.addEventListener("click", () => ctx.send({ pk: +b.dataset.pk })));
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "res") return;
          if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
          let deck = A(c.priv().deck), q;
          const cs = A(st.ch);
          if(cs.length){
            const sel = st.by ? c.input(st.by) : null, i = sel && sel.pk != null && cs[+sel.pk] ? +sel.pk : Math.floor(Math.random() * cs.length);
            q = cs[i]; deck = cs.filter((_, j) => j !== i).concat(deck);
          } else { if(!deck.length) deck = deckFor(c.opts.packs, st.lg); q = deck.pop(); }
          SB.u.saw(SEEN, q); c.setPriv({ deck });
          const t = nextTw(c.opts, st.round + 1, st.tw, c.ids.length);
          c.set({ phase: "vote", q, tw: t ? t.id : "", round: st.round + 1, counts: {}, voters: {}, ch: [], by: "", jack: "", k: c.rid() });
        }));
      });
    } else if(s.phase === "end"){
      const t = s.total || {}, order = ctx.ids.slice().sort((a, b) => (t[b] || 0) - (t[a] || 0));
      const champ = order[0], aw = awards(ctx.ids, s, ctx.name);
      screen(root, "end" + ctx.isHost, '<span class="eyebrow">' + esc(fl(FL.champ, s.fl, 0)) + '</span><div class="who">' + esc(ctx.name(champ)) + '</div><p style="font-size:17px">' + tr((t[champ] || 0) + " votes au compteur. Le groupe vous connaît bien.", (t[champ] || 0) + ((t[champ] || 0) === 1 ? " vote" : " votes") + " in total. The group knows you well.") + "</p>" +
        '<div class="field"><span class="eyebrow">' + tr("Classement", "Standings") + '</span>' + bars(ctx.ids, t, ctx.name, null) + "</div>" +
        (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + '</button>' : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const tt = c.s.total || {}, o2 = c.ids.slice().sort((a, b2) => (tt[b2] || 0) - (tt[a] || 0)), mx = tt[o2[0]] || 0;
          c.end({ title: fl(FL.champ, c.s.fl, 0) + tr(" : ", ": ") + c.name(o2[0]), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (tt[id] || 0) + tr(" votes", (tt[id] || 0) === 1 ? " vote" : " votes")).concat(awards(c.ids, c.s, c.name).map(a => a[0] + tr(" : ", ": ") + a[1])),
            win: mx ? o2.filter(id => (tt[id] || 0) === mx) : [] });
        }));
      });
    }
  },
  local: {
    start(root, api){
      let sel = A(store().qpPacks).length ? A(store().qpPacks).slice() : ["soft"], deck = [], q = "", n = 0, tw = null, twOn = store().qpTw !== false, ch = [];
      const go = phase => {
        if(phase === "setup"){
          screen(root, "setup" + sel.join() + twOn, '<p class="howto">' + tr("Mode cartes : lisez la question à voix haute, comptez jusqu'à 3, et tout le monde pointe du doigt la personne de son choix.", "Card mode: read the question out loud, count to 3, and everyone points at the person of their choice.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + "</span>" + packButtons(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variante", "Variant") + "</span>" + twToggle(twOn) + "</div>" +
            '<div class="dock"><button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button></div>", r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ qpPacks: sel }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ qpTw: twOn }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => { if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; } deck = deckFor(sel, SB.lang()); n = 0; tw = null; next(); });
          });
        } else {
          const t = tw ? tw.id : "";
          const foot = t === "pick"
            ? '<span class="eyebrow">' + tr("Le plus désigné choisit la suite", "The most-pointed-at picks what's next") + '</span><div class="choices">' + ch.map((x, i) => '<button type="button" class="opt" data-ch="' + i + '">… ' + esc(x) + "</button>").join("") + "</div>"
            : "";
          screen(root, "q" + n, '<span class="eyebrow">Question ' + n + "</span>" + SB.u.twistHTML(tw) + '<div class="card acc"><span class="eyebrow">' + prefixFor(t === "moins", q, SB.lang()) + '</span><div class="big">… ' + esc(q) + '</div></div><div class="pass" style="min-height:' + (foot ? "10" : "20") + 'vh"><div class="who">' + (t === "eyes" ? tr("Yeux fermés… 3, 2, 1, pointez !", "Eyes closed… 3, 2, 1, point!") : tr("3, 2, 1… pointez !", "3, 2, 1… point!")) + "</div></div>" + foot +
            '<div class="dock">' + (foot ? "" : '<button class="btn acc" type="button" data-n>' + tr("Question suivante", "Next question") + "</button>") + '<button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button></div>", r => {
            const nb = r.querySelector("[data-n]"); if(nb) nb.addEventListener("click", () => next());
            r.querySelectorAll("[data-ch]").forEach(b => b.addEventListener("click", () => next(+b.dataset.ch)));
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      function next(ci){
        if(ch.length && ci != null){ q = ch[ci]; deck = ch.filter((_, j) => j !== ci).concat(deck); }
        else { if(!deck.length) deck = deckFor(sel, SB.lang()); q = deck.pop(); }
        ch = []; n++; SB.u.saw(SEEN, q);
        tw = twOn && n > 1 ? SB.u.twist(TWL, { last: tw ? tw.id : "", rate: .35 }) : null;
        if(tw && tw.id === "pick"){ if(deck.length < 3) deck = deckFor(sel, SB.lang()).concat(deck); ch = [deck.pop(), deck.pop(), deck.pop()]; }
        go("q");
      }
      go("setup");
    }
  }
});
})();
