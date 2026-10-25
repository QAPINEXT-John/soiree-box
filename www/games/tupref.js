/* Tu préfères — deux choix impossibles, tout le monde vote en secret. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick } = SB.u;
const tr = SB.u.tr;

const SOFT = [
  ["Pouvoir voler","Être invisible"],["Ne plus jamais manger de fromage","Ne plus jamais manger de chocolat"],["Vivre sans internet","Vivre sans eau chaude"],
  ["Parler toutes les langues","Jouer de tous les instruments"],["Avoir 10 ans de plus","Avoir 10 ans de moins"],["Vivre au bord de la mer","Vivre à la montagne"],
  ["Lire dans les pensées","Voir le futur"],["Ne plus jamais voyager","Ne plus jamais regarder de séries"],["Être célèbre mais fauché","Être riche mais inconnu"],
  ["Toujours avoir trop chaud","Toujours avoir trop froid"],["Toujours dire la vérité","Toujours mentir"],["Manger très épicé à chaque repas","Manger sans sel à chaque repas"],
  ["Rester coincé dans un ascenseur avec ton ex","Rester coincé dans un ascenseur avec ton patron"],["Ne plus avoir de téléphone","Ne plus avoir d'ordinateur"],
  ["Vivre au Moyen Âge","Vivre en l'an 3000"],["Gagner au loto","Trouver l'amour de ta vie"],["Être drôle","Être brillant"],
  ["Avoir les cheveux bleus à vie","Être chauve à vie"],["Chanter au lieu de parler","Danser au lieu de marcher"],["Faire le tour du monde en solo","Passer un an enfermé chez toi avec tes potes"],
  ["Parler aux animaux","Comprendre les bébés"],["Avoir un dragon","Être un dragon"],["Avoir un bouton pause sur ta vie","Avoir un bouton retour en arrière"],
  ["Être le meilleur d'une équipe nulle","Être le plus nul d'une équipe de champions"],["Ne boire que de l'eau","Ne boire que du soda"],
  ["Connaître la date de ta mort","Connaître la cause de ta mort"],["Pouvoir te téléporter","Pouvoir remonter le temps"],["Vivre sans musique","Vivre sans films"],
  ["Que tout le monde entende tes pensées pendant une heure","Lire ton historique de recherche à voix haute"],["Passer un an sans réseaux sociaux","Passer un an sans sortir le soir"],
  ["Être un génie incompris","Être un idiot adoré"],["Avoir un majordome","Avoir un chef cuisinier à domicile"],["Ne plus jamais faire la queue","Ne plus jamais être coincé dans les bouchons"],
  ["Éclater de rire chaque fois que tu es triste","Fondre en larmes chaque fois que tu ris"],["Revivre ton enfance","Découvrir à quoi ressemblera ta vie dans 20 ans"],
  ["Savoir cuisiner comme un chef","Savoir danser comme un pro"],["Vivre dans un château hanté","Vivre dans une cabane au fond des bois"],["Avoir des yeux dans le dos","Avoir l'ouïe d'une chauve-souris"],
  ["Ne manger que des pâtes pendant un an","Ne manger que de la soupe pendant un an"],["Rester enfermé tout un week-end dans un supermarché","Rester enfermé tout un week-end dans un parc d'attractions"],
  ["Rire comme un dauphin","Éternuer comme une trompette"],["Retrouver tous les objets que tu as perdus","Retrouver tous les messages que tu as effacés"],
  ["Que ta vie soit une comédie musicale","Que ta vie soit un film muet"],["Ne plus jamais avoir de courbatures","Ne plus jamais avoir le hoquet"],
  ["Être le meilleur ami d'un dragon","Être le meilleur ami d'un fantôme"],["Habiter dans un aquarium géant","Habiter dans une cabane dans les arbres"],
  ["Toujours dire ce que tu penses","Ne jamais pouvoir donner ton avis"],["Gagner toutes tes disputes","Gagner à tous les jeux de société"],
  ["Avoir un sosie qui fait des bêtises en ton nom","Avoir un jumeau maléfique"],["Voyager dans l'espace","Explorer le fond des océans"],
  ["Pouvoir parler à l'enfant que tu étais","Pouvoir parler à toi-même à 80 ans"],["Avoir un super-pouvoir inutile","Avoir un super-pouvoir qui te met en danger"],
  ["Avoir la voix off d'une bande-annonce de film d'action","Faire coin-coin à chacun de tes pas"],["Être payé pour dormir","Être payé pour manger"],
  ["Vivre sans réveil","Vivre sans calendrier"],["Ne plus jamais rater ton bus","Réussir toutes tes blagues"],["Avoir une piscine dans ton salon","Avoir un toboggan géant à la place de l'escalier"],
  ["Connaître à l'avance la fin de toutes les séries","Ne jamais pouvoir voir la fin d'une série"],["Changer de prénom chaque année","Changer de couleur de cheveux chaque mois"]
];
const HOT = [
  ["Que ta mère lise tes messages","Que ton patron voie ton historique"],["Te faire surprendre en pleine action par tes parents","Surprendre tes parents en pleine action"],
  ["Faire l'amour uniquement dans le noir","Faire l'amour uniquement en pleine lumière"],["Vivre un plan d'un soir incroyable","Vivre une longue relation bien sage"],
  ["Ne plus jamais embrasser","Ne plus jamais faire l'amour"],["Sortir avec quelqu'un de très beau mais ennuyeux","Sortir avec quelqu'un de banal mais hilarant"],
  ["Que tous tes ex viennent à ton mariage","Qu'aucun de tes amis ne vienne à ton mariage"],["Lire les textos coquins de ton meilleur pote","Que tes potes lisent tes textos coquins"],
  ["T'offrir un dîner dans un grand restaurant","Passer une nuit torride à la belle étoile"],["Envoyer par erreur une photo osée sur le groupe famille","Recevoir par erreur une photo osée d'un collègue"],
  ["Embrasser la personne à ta droite","Raconter ta pire première fois"],["Faire un strip-tease devant tes potes","Faire une déclaration d'amour en public"],
  ["Entendre tes voisins faire l'amour toute la nuit","Que tes voisins t'entendent toute la nuit"],["Trouver un sex toy chez tes parents","Que tes parents trouvent le tien"],
  ["Coucher avec quelqu'un qui parle trop au lit","Coucher avec quelqu'un qui ne dit pas un mot"],["Tester un plan à trois","Tester un jeu de rôle"],
  ["Te faire larguer par texto","Te faire larguer devant tout le monde"],["Que ton historique soit projeté au repas de famille","Que ta galerie photo y soit projetée"],
  ["Faire l'amour dans un avion","Faire l'amour dans un ascenseur"],["Ne plus pouvoir mentir au lit","Ne plus pouvoir parler au lit"],
  ["Draguer en ne parlant qu'en alexandrins","Draguer en ne parlant qu'en émojis"],["Ressortir avec ton ex pendant un mois","Sortir avec l'ex de ton meilleur pote"],
  ["Avoir ton premier rencard chez tes parents","Avoir ton premier rencard avec ton ex assis à la table d'à côté"],["Avoir un crush secret toute ta vie","Que tout le monde connaisse tes crushs"],
  ["Embrasser ton crush devant tout le monde","Écrire une lettre d'amour anonyme à ton crush"],["Aller à un rencard arrangé par tes potes","Aller à un rencard arrangé par tes parents"],
  ["Que ton crush lise tes messages à son sujet","Que ton ex lise ton journal intime"],["Embrasser quelqu'un pendant trois heures non-stop","Faire un câlin de huit heures sans pause"],
  ["Draguer uniquement avec des répliques de films","Draguer uniquement avec des anecdotes sur les escargots"],["Te faire larguer par lettre recommandée","Te faire larguer en chanson"],
  ["Que ton rencard arrive avec sa mère","Que ton rencard arrive avec son ex"],["Laisser ton ex choisir ton prochain rencard","Laisser un algorithme choisir ton prochain rencard"],
  ["Avouer ton crush à la personne concernée","L'avouer à tout le monde sauf à la personne concernée"],["Passer une nuit dans un hôtel de luxe avec un inconnu","Passer une nuit sous une tente avec ton ex"]
];
const TRASH = [["Que tes parents tombent sur ta sextape", "Que tes collègues tombent sur ta sextape"], ["Ne plus jamais avoir d'orgasme", "Avoir un orgasme à chaque éternuement"], ["Faire l'amour devant tes potes", "Regarder tes potes faire l'amour"], ["Un plan à trois avec deux inconnus", "Un plan à trois avec deux personnes de ce groupe"], ["Que ton historique porno devienne public", "Que tes nudes fuitent sur internet"], ["Coucher avec ton boss", "Coucher avec ton pire ennemi"], ["Faire l'amour une fois par an, mais divinement", "Faire l'amour tous les jours, mais très moyennement"], ["Tourner un porno amateur", "Être figurant dans un vrai porno"], ["Ne plus jamais regarder de porno", "Ne plus jamais coucher avec quelqu'un"], ["Que ton partenaire crie le prénom de son ex au lit", "Crier toi-même le prénom de ton ex au lit"], ["Avoir un sex toy qui parle", "Avoir un sex toy qui chante"], ["Décrocher par erreur un appel visio de ta mère en plein acte", "Décrocher par erreur un appel visio de ton patron en plein acte"], ["Faire l'amour dans un cimetière", "Faire l'amour dans une église"], ["Coucher avec une célébrité que tu détestes", "Recoucher avec ton premier amour, 30 ans plus tard"], ["Ne faire l'amour qu'en costume de mascotte", "Ne faire l'amour qu'en écoutant l'hymne national"], ["Avoir un plan cul différent chaque semaine", "Ne coucher qu'avec une seule personne de toute ta vie"], ["Sortir avec quelqu'un qui fantasme sur tes pieds", "Sortir avec quelqu'un qui fantasme sur tes aisselles"], ["Montrer tes nudes à tes potes", "Voir les nudes de tous tes potes"], ["Faire un strip-tease à un mariage", "Faire un strip-tease à un enterrement"], ["Que ton ex ait ton prénom tatoué sur les fesses", "Avoir le prénom de ton ex tatoué sur les fesses"], ["Tomber sur un partenaire qui imite des cris d'animaux au lit", "Tomber sur un partenaire qui commente tout en direct"], ["Que ta sextape devienne un mème", "Que ton historique de recherche soit lu dans un podcast"], ["Faire l'amour sur un lit à eau", "Faire l'amour dans un hamac"], ["Coucher avec ton sosie", "Coucher avec le sosie de ton ex"], ["Ne plus jamais faire de préliminaires", "Ne faire que des préliminaires"], ["Que ta boîte à sex toys s'ouvre en plein repas de famille", "Que ta boîte à sex toys s'ouvre au contrôle de sécurité de l'aéroport"], ["Passer la nuit avec quelqu'un qui pleure à la fin", "Passer la nuit avec quelqu'un qui applaudit à la fin"], ["Être ajouté à un groupe de discussion avec tous tes ex", "Voir débarquer tous tes plans d'un soir à ton anniversaire"], ["Faire l'amour sur une musique d'ascenseur", "Faire l'amour sur des bruitages de dessin animé"], ["Jouer au strip-poker avec tes collègues", "Jouer au strip-poker avec ta belle-famille"]];
const NOIR = [["Mourir dans 10 ans pile, en le sachant", "Mourir n'importe quand, sans prévenir"], ["Être enterré", "Être incinéré et finir dans un sablier"], ["Avoir un enterrement qui tourne à la fête", "Avoir un enterrement où personne ne vient"], ["Hanter ton ex", "Hanter ton patron"], ["Mourir de rire", "Mourir d'ennui"], ["Finir dévoré par des requins", "Finir dévoré par tes chats"], ["Connaître la date de la mort de tous tes potes", "Que tous tes potes connaissent la date de la tienne"], ["Vivre éternellement seul", "Mourir demain entouré de tes proches"], ["Que ton testament soit lu en direct sur TikTok", "Que ton historique de navigation soit lu à ton enterrement"], ["Être le dernier humain sur Terre", "Être le premier à mourir pendant l'apocalypse"], ["Être réincarné en moustique", "Être réincarné en pigeon parisien"], ["Avoir un enterrement karaoké", "Avoir un enterrement en drive"], ["Mourir en héros, mais de façon ridicule", "Vivre jusqu'à 100 ans et tomber dans l'oubli"], ["Que ton épitaphe soit écrite par ton ex", "Que ton éloge funèbre soit prononcé par ton patron"], ["Être enterré avec ton téléphone", "Être enterré avec la liste de tes rancunes"], ["Revenir en fantôme très poli", "Revenir en zombie très câlin"], ["Que ton enterrement soit un défilé de mode", "Que ton enterrement soit un spectacle de magie"], ["Savoir comment chaque personne ici va mourir", "Que tout le monde ici sache comment tu vas mourir"], ["Hériter d'une maison hantée", "Hériter des dettes d'un inconnu"], ["Être cryogénisé pendant 500 ans", "Te réincarner dans 500 ans en un animal tiré au sort"]];
// English decks (same packs). Each option reads after "Would you rather…" and also stands alone on a button.
const SOFT_EN = [
  ["Be able to fly","Be invisible"],["Never eat cheese again","Never eat chocolate again"],["Live without internet","Live without hot water"],
  ["Speak every language","Play every instrument"],["Be 10 years older","Be 10 years younger"],["Live by the sea","Live in the mountains"],
  ["Read minds","See the future"],["Never travel again","Never watch another TV show"],["Be famous but broke","Be rich but unknown"],
  ["Always be too hot","Always be too cold"],["Always tell the truth","Always lie"],["Eat super spicy food at every meal","Eat unsalted food at every meal"],
  ["Get stuck in an elevator with your ex","Get stuck in an elevator with your boss"],["Have no phone","Have no computer"],
  ["Live in the Middle Ages","Live in the year 3000"],["Win the lottery","Find the love of your life"],["Be funny","Be brilliant"],
  ["Have blue hair for life","Be bald for life"],["Sing instead of talking","Dance instead of walking"],["Travel the world solo","Spend a year locked in at home with your friends"],
  ["Talk to animals","Understand babies"],["Own a dragon","Be a dragon"],["Have a pause button on your life","Have a rewind button on your life"],
  ["Be the best player on a terrible team","Be the worst player on a team of champions"],["Only drink water","Only drink soda"],
  ["Know the date of your death","Know the cause of your death"],["Be able to teleport","Be able to travel back in time"],["Live without music","Live without movies"],
  ["Have everyone hear your thoughts for an hour","Read your search history out loud"],["Go a year without social media","Go a year without going out at night"],
  ["Be a misunderstood genius","Be a beloved idiot"],["Have a butler","Have a personal chef"],["Never wait in line again","Never get stuck in traffic again"],
  ["Burst out laughing every time you're sad","Burst into tears every time you laugh"],["Relive your childhood","See what your life looks like in 20 years"],
  ["Cook like a chef","Dance like a pro"],["Live in a haunted castle","Live in a cabin deep in the woods"],["Have eyes in the back of your head","Have the hearing of a bat"],
  ["Eat only pasta for a year","Eat only soup for a year"],["Get locked in a supermarket for a whole weekend","Get locked in a theme park for a whole weekend"],
  ["Laugh like a dolphin","Sneeze like a trumpet"],["Get back everything you've ever lost","Get back every message you've ever deleted"],
  ["Live your life as a musical","Live your life as a silent movie"],["Never be sore again","Never get the hiccups again"],
  ["Be best friends with a dragon","Be best friends with a ghost"],["Live in a giant aquarium","Live in a treehouse"],
  ["Always say exactly what you think","Never be allowed to give your opinion"],["Win every argument","Win every board game"],
  ["Have a lookalike who messes up in your name","Have an evil twin"],["Travel to space","Explore the bottom of the ocean"],
  ["Talk to your childhood self","Talk to yourself at 80"],["Have a useless superpower","Have a superpower that puts you in danger"],
  ["Have the voice of an action movie trailer","Quack with every step you take"],["Get paid to sleep","Get paid to eat"],
  ["Live without an alarm clock","Live without a calendar"],["Never miss your bus again","Land every joke you tell"],["Have a pool in your living room","Have a giant slide instead of stairs"],
  ["Know the ending of every show in advance","Never get to see the ending of a show"],["Change your first name every year","Change your hair color every month"]
];
const HOT_EN = [
  ["Have your mom read your texts","Have your boss see your browser history"],["Get caught in the act by your parents","Catch your parents in the act"],
  ["Only have sex in the dark","Only have sex with all the lights on"],["Have one incredible one-night stand","Have a long, very well-behaved relationship"],
  ["Never kiss again","Never have sex again"],["Date someone gorgeous but boring","Date someone average but hilarious"],
  ["Have all your exes come to your wedding","Have none of your friends come to your wedding"],["Read your best friend's dirty texts","Have your friends read your dirty texts"],
  ["Get treated to dinner at a fancy restaurant","Spend a steamy night under the stars"],["Accidentally send a racy pic to the family group chat","Accidentally get a racy pic from a coworker"],
  ["Kiss the person on your right","Tell the story of your worst first time"],["Do a striptease in front of your friends","Declare your love in public"],
  ["Hear your neighbors having sex all night","Have your neighbors hear you all night"],["Find a sex toy at your parents' place","Have your parents find yours"],
  ["Sleep with someone who talks way too much in bed","Sleep with someone who doesn't say a word"],["Try a threesome","Try role-play"],
  ["Get dumped by text","Get dumped in front of everyone"],["Have your browser history shown on a big screen at a family dinner","Have your camera roll shown there instead"],
  ["Have sex on a plane","Have sex in an elevator"],["Never be able to lie in bed","Never be able to talk in bed"],
  ["Flirt only in Shakespearean verse","Flirt only in emojis"],["Get back together with your ex for a month","Date your best friend's ex"],
  ["Have your first date at your parents' house","Have your first date with your ex at the next table"],["Have a secret crush your whole life","Have everyone know all your crushes"],
  ["Kiss your crush in front of everyone","Write your crush an anonymous love letter"],["Go on a date set up by your friends","Go on a date set up by your parents"],
  ["Have your crush read your texts about them","Have your ex read your diary"],["Make out for three hours non-stop","Cuddle for eight hours without a break"],
  ["Flirt using only movie quotes","Flirt using only fun facts about snails"],["Get dumped by certified mail","Get dumped in a song"],
  ["Have your date show up with their mom","Have your date show up with their ex"],["Let your ex pick your next date","Let an algorithm pick your next date"],
  ["Confess your crush to the person","Tell everyone except the person"],["Spend a night in a luxury hotel with a stranger","Spend a night in a tent with your ex"]
];
const TRASH_EN = [["Have your parents stumble on your sex tape", "Have your coworkers stumble on your sex tape"], ["Never have an orgasm again", "Have an orgasm every time you sneeze"], ["Have sex in front of your friends", "Watch your friends have sex"], ["Have a threesome with two strangers", "Have a threesome with two people in this group"], ["Have your porn history go public", "Have your nudes leak online"], ["Sleep with your boss", "Sleep with your worst enemy"], ["Have sex once a year, but it's divine", "Have sex every day, but it's very meh"], ["Shoot an amateur porno", "Be an extra in a real porno"], ["Never watch porn again", "Never sleep with anyone again"], ["Have your partner scream their ex's name in bed", "Scream your ex's name in bed yourself"], ["Own a sex toy that talks", "Own a sex toy that sings"], ["Accidentally answer a video call from your mom mid-act", "Accidentally answer a video call from your boss mid-act"], ["Have sex in a cemetery", "Have sex in a church"], ["Sleep with a celebrity you can't stand", "Sleep with your first love again, 30 years later"], ["Only have sex in a mascot costume", "Only have sex while the national anthem plays"], ["Have a different hookup every week", "Sleep with only one person your whole life"], ["Date someone with a thing for your feet", "Date someone with a thing for your armpits"], ["Show your nudes to your friends", "See all your friends' nudes"], ["Do a striptease at a wedding", "Do a striptease at a funeral"], ["Have your ex get your name tattooed on their butt", "Have your ex's name tattooed on your butt"], ["End up with a partner who makes animal noises in bed", "End up with a partner who does live commentary in bed"], ["Have your sex tape become a meme", "Have your search history read out on a podcast"], ["Have sex on a waterbed", "Have sex in a hammock"], ["Sleep with your doppelgänger", "Sleep with your ex's doppelgänger"], ["Never have foreplay again", "Only ever have foreplay"], ["Have your sex toy box burst open at a family dinner", "Have your sex toy box burst open at airport security"], ["Spend the night with someone who cries at the end", "Spend the night with someone who claps at the end"], ["Get added to a group chat with all your exes", "Have all your one-night stands crash your birthday"], ["Have sex to elevator music", "Have sex to cartoon sound effects"], ["Play strip poker with your coworkers", "Play strip poker with your in-laws"]];
const NOIR_EN = [["Die in exactly 10 years, and know it", "Die at any moment, without warning"], ["Be buried", "Be cremated and end up in an hourglass"], ["Have a funeral that turns into a party", "Have a funeral nobody shows up to"], ["Haunt your ex", "Haunt your boss"], ["Die laughing", "Die of boredom"], ["Get eaten by sharks", "Get eaten by your own cats"], ["Know when all your friends will die", "Have all your friends know when you'll die"], ["Live forever, alone", "Die tomorrow, surrounded by the people you love"], ["Have your will read live on TikTok", "Have your browser history read out at your funeral"], ["Be the last human on Earth", "Be the first to die in the apocalypse"], ["Be reincarnated as a mosquito", "Be reincarnated as a city pigeon"], ["Have a karaoke funeral", "Have a drive-thru funeral"], ["Die a hero, but in a ridiculous way", "Live to 100 and be completely forgotten"], ["Have your epitaph written by your ex", "Have your eulogy given by your boss"], ["Be buried with your phone", "Be buried with a list of all your grudges"], ["Come back as a very polite ghost", "Come back as a very cuddly zombie"], ["Have your funeral be a fashion show", "Have your funeral be a magic show"], ["Know how everyone here is going to die", "Have everyone here know how you're going to die"], ["Inherit a haunted house", "Inherit a stranger's debts"], ["Be cryogenically frozen for 500 years", "Come back in 500 years as a random animal"]];
// Contenu des parties : langue de l'hôte (s.lg) en réseau, langue du téléphone en local.
const LISTS = { fr: { soft: SOFT, adulte: HOT.concat(TRASH, NOIR) }, en: { soft: SOFT_EN, adulte: HOT_EN.concat(TRASH_EN, NOIR_EN) } };
const lists = lg => LISTS[lg === "en" ? "en" : "fr"];
const PACKS = [
  { v: "soft", label: tr("Classique", "Classic"), desc: tr("Pour tout le monde", "For everyone"), list: lists(SB.lang()).soft },
  { v: "adulte", label: tr("Adultes", "Adults"), desc: tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult stuff"), list: lists(SB.lang()).adulte, hot: true }
];
const SEEN = "tupref:q";
function deckFor(packs, lg){
  const L = lists(lg), sel = A(packs); const pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => L[p.v]);
  return SB.u.fresh(SEEN, pool.length ? pool : L.soft);
}
function packButtons(sel){
  return '<div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>";
}
function twToggle(on){
  return '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + !!on + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(tr("Coups de théâtre", "Plot twists")) + '</span><span class="ds">' + esc(tr("De temps en temps, une règle change pour une question", "Every now and then, a rule changes for one question")) + '</span></span></button></div>';
}
const TWL_LABEL = tr("Coup de théâtre", "Plot twist");
function pairs(ids){ const out = []; for(let i = 0; i < ids.length; i++) for(let j = i + 1; j < ids.length; j++) out.push([ids[i], ids[j]]); return out; }
function resHTML(p, a, b, nameOf){
  const n = Math.max(1, a.length + b.length), pa = Math.round(100 * a.length / n), pb = 100 - pa;
  const col = (label, list, pct) => '<div class="bar"><div class="lb"><span>' + esc(label) + "</span><span>" + pct + tr(" %", "%") + '</span></div><div class="tr"><div class="fl" style="width:' + pct + '%"></div></div><span class="vt">' + (list.length ? esc(list.map(nameOf).join(", ")) : tr("Personne", "Nobody")) + "</span></div>";
  return '<div class="bars">' + col(p[0], a, a.length + b.length ? pa : 0) + col(p[1], b, a.length + b.length ? pb : 0) + "</div>";
}
// Coups de théâtre (réseau). Les points ne viennent que d'eux : le vainqueur est celui qui en a le plus.
const CHRONO = 12;
const TW = [
  { id: "predict", name: tr("Pronostic", "Prediction"), desc: tr("Choisis, puis parie sur le choix de la majorité : +1 point si tu as vu juste.", "Pick, then bet on what the majority will choose: +1 point if you call it.") },
  { id: "tele", name: tr("Télépathie", "Telepathy"), desc: tr("Devine aussi le choix d'un joueur tiré au sort : +1 point si tu trouves.", "Also guess what a random player picked: +1 point if you get it right."), ok: o => o.n >= 2 },
  { id: "devil", name: tr("Avocat du diable", "Devil's advocate"), desc: tr("Après le vote, un joueur tiré au sort défend le camp opposé au sien pendant 30 secondes.", "After the vote, a random player argues for the side they didn't pick for 30 seconds.") },
  { id: "chrono", name: tr("Chrono " + CHRONO + " secondes", CHRONO + "-second timer"), desc: tr("Le vote se ferme au bout de " + CHRONO + " secondes. Trop tard, c'est trop tard.", "Voting closes after " + CHRONO + " seconds. Too late is too late.") },
  { id: "lock", name: tr("Pas de retour", "No take-backs"), desc: tr("Ton premier choix est définitif.", "Your first pick is final.") },
  { id: "rare", name: tr("Prime au courage", "Bravery bonus"), desc: tr("Le camp minoritaire gagne 2 points chacun.", "Everyone on the minority side gets 2 points."), ok: o => o.n >= 3 },
  { id: "maj", name: tr("Suivez le troupeau", "Follow the herd"), desc: tr("Le camp majoritaire gagne 1 point chacun.", "Everyone on the majority side gets 1 point."), ok: o => o.n >= 3 }
];
const TWL = [
  { id: "predict", name: tr("Pronostic", "Prediction"), desc: tr("Avant de lever la main, chacun annonce le choix qui va gagner. Ceux qui se trompent choisissent la question suivante.", "Before hands go up, everyone calls which option will win. Whoever gets it wrong picks the next question.") },
  { id: "chrono", name: tr("Chrono 5 secondes", "5-second timer"), desc: tr("Vous avez 5 secondes pour lever la main. Pas de main levée, pas d'avis !", "You've got 5 seconds to raise your hand. No hand, no say!") },
  { id: "devil", name: tr("Avocat du diable", "Devil's advocate"), desc: tr("Le premier à lever la main défend le camp opposé pendant 30 secondes.", "The first person to raise a hand argues for the other side for 30 seconds.") },
  { id: "rare", name: tr("La minorité décide", "Minority rules"), desc: tr("Le camp le moins nombreux choisit un petit gage pour l'autre camp.", "The smaller side picks a little forfeit for the other side.") },
  { id: "swap", name: tr("Retournement", "Switch sides"), desc: tr("La majorité a une minute pour convaincre quelqu'un d'en face de changer de camp.", "The majority has one minute to convince someone on the other side to switch.") },
  { id: "blind", name: tr("Les yeux fermés", "Eyes closed"), desc: tr("Tout le monde ferme les yeux pour voter, et on les rouvre ensemble.", "Everyone votes with their eyes closed, then you all open them together.") }
];
const FL = {
  duo: [tr("Les plus d'accord", "Most in sync"), tr("Les âmes sœurs", "Soulmates"), tr("Un cerveau pour deux", "Two bodies, one brain")],
  anti: [tr("Les moins d'accord", "Least in sync"), tr("Chien et chat", "Cats and dogs"), tr("Jamais du même avis", "Never on the same page")],
  rebel: [tr("Le plus à contre-courant", "Most contrarian"), tr("L'esprit rebelle", "The rebel"), tr("Seul contre tous", "Alone against the world")],
  dither: [tr("Le plus indécis", "Most indecisive"), tr("La girouette", "The weathervane"), tr("Change d'avis comme de chemise", "Flip-flopper in chief")],
  champ: [tr("Meilleur score", "Top score"), tr("Le plus fin stratège", "Master strategist"), tr("Le roi des coups de théâtre", "Twist royalty")]
};
function fl(list, seed, k){ return list[((seed || 0) + k) % list.length]; }
function nextTw(o, round, last, n){ return o.twists !== false && round > 1 ? SB.u.twist(TW, { last, n, rate: .4 }) : null; }
function roundExtras(c, t){
  const x = { tw: t ? t.id : "", dl: 0, tgt: {}, dev: "" };
  if(!t) return x;
  if(t.id === "chrono") x.dl = c.now() + CHRONO * 1000 + 600;
  if(t.id === "tele"){ const o = shuffle(c.ids); o.forEach((id, i) => { x.tgt[id] = o[(i + 1) % o.length]; }); }
  return x;
}
function stats(ids, hist){
  const agree = {}, minor = {};
  pairs(ids).forEach(([x, y]) => { let same = 0, both = 0; hist.forEach(([a, b]) => { const cx = a.indexOf(x) >= 0 ? "a" : b.indexOf(x) >= 0 ? "b" : "", cy = a.indexOf(y) >= 0 ? "a" : b.indexOf(y) >= 0 ? "b" : ""; if(cx && cy){ both++; if(cx === cy) same++; } }); if(both) agree[x + "|" + y] = [same, both]; });
  hist.forEach(([a, b]) => { if(a.length === b.length) return; (a.length < b.length ? a : b).forEach(id => { minor[id] = (minor[id] || 0) + 1; }); });
  const ks = Object.keys(agree).sort((k1, k2) => agree[k2][0] / agree[k2][1] - agree[k1][0] / agree[k1][1]);
  const rebel = ids.slice().sort((x, y) => (minor[y] || 0) - (minor[x] || 0))[0];
  return { agree, minor, ks, rebel };
}

SB.register({
  id: "tupref", name: tr("Tu préfères", "Would You Rather"), glyph: "A/B", pitch: tr("Deux choix impossibles, chacun tranche en secret.", "Two impossible choices, everyone picks in secret."), hot: true,
  accent: { light: "#4fd1bf", dark: "#4fd1bf" },
  tag: tr("Deux choix impossibles. Tout le monde vote, puis on découvre qui a choisi quoi.", "Two impossible choices. Everyone votes, then you find out who picked what."),
  min: 2, max: 20, ticks: true,
  gages: [
    { ev: "minor", label: tr("Dans le camp minoritaire", "On the minority side"), kind: "boit", n: 1 },
    { ev: "seul", label: tr("Seul contre tous", "Alone against everyone"), kind: "boit", n: 2 },
    { ev: "unan", label: tr("Tout le monde d'accord", "Everyone agrees"), kind: "tous", n: 1 }
  ],
  rules: [
    tr("Deux options s'affichent. Chacun choisit en secret celle qu'il préfère.", "Two options pop up. Everyone secretly picks the one they'd rather."),
    tr("Quand tout le monde a voté, on voit qui a choisi quoi.", "Once everyone has voted, you see who picked what."),
    tr("Justifiez vos choix, surtout si vous êtes seul dans votre camp.", "Defend your choice, especially if you're the only one on your side."),
    tr("Coups de théâtre : pronostic, télépathie, chrono, prime au courage… Ce sont eux qui rapportent des points.", "Twists: prediction, telepathy, timer, bravery bonus… They're the only way to score points."),
    tr("À la fin : le duo le plus d'accord, le plus à contre-courant, le plus indécis et le meilleur score.", "At the end: the most in-sync pair, the most contrarian, the most indecisive and the top score.")
  ],
  options: [
    { id: "rounds", label: tr("Questions", "Questions"), type: "seg", def: 10, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["soft"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une question", "Every now and then, a rule changes for one question"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet de questions.", "Pick at least one question pack."));
    const lg = SB.lang(), deck = deckFor(o.packs, lg), p = deck.pop();
    SB.u.saw(SEEN, [p]);
    ctx.setPriv({ deck });
    return Object.assign({ phase: "vote", p, round: 1, rounds: o.rounds || 10, a: [], b: [], hist: [], pts: {}, got: {}, chg: {}, lg }, roundExtras(ctx, null));
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "vote") return;
    const tw = s.tw || "", need = tw === "predict" || tw === "tele";
    const live = ctx.ids.filter(id => ctx.here(id));
    const ok1 = i => i && (i.c === "a" || i.c === "b") && (!need || i.g === "a" || i.g === "b");
    const late = tw === "chrono" && s.dl && ctx.now() > s.dl;
    if(!late && !(live.length && live.every(id => ok1(ctx.input(id))))) return;
    const voted = ctx.ids.filter(id => ok1(ctx.input(id)));
    const a = voted.filter(id => ctx.input(id).c === "a"), b = voted.filter(id => ctx.input(id).c === "b");
    const pts = Object.assign({}, s.pts || {}), got = {}, chg = Object.assign({}, s.chg || {});
    const add = (id, n) => { got[id] = (got[id] || 0) + n; pts[id] = (pts[id] || 0) + n; };
    voted.forEach(id => { const n = +ctx.input(id).n || 0; if(n) chg[id] = (chg[id] || 0) + n; });
    const win = a.length === b.length ? "" : a.length > b.length ? "a" : "b";
    if(tw === "predict") voted.forEach(id => { if(win && ctx.input(id).g === win) add(id, 1); });
    if(tw === "tele") voted.forEach(id => { const t = (s.tgt || {})[id], ti = t ? ctx.input(t) : null; if(ti && ok1(ti) && ti.c === ctx.input(id).g) add(id, 1); });
    if(tw === "rare" && win && a.length && b.length) (win === "a" ? b : a).forEach(id => add(id, 2));
    if(tw === "maj" && win) (win === "a" ? a : b).forEach(id => add(id, 1));
    ctx.set({ phase: "res", a, b, hist: A(s.hist).concat([[a, b]]), pts, got, chg, dev: tw === "devil" && voted.length ? pick(voted) : "" });
    // Gages : la minorité trinque (sauf « Prime au courage », où elle marque), seul contre tous compte double, unanimité = tout le monde.
    const mino = win && a.length && b.length ? (win === "a" ? b : a) : [];
    if(voted.length >= 3 && mino.length && tw !== "rare") ctx.gage(mino.map(id => ({ id, ev: mino.length === 1 ? "seul" : "minor" })), "tp" + s.k);
    else if(voted.length >= 2 && (!a.length || !b.length)) ctx.gage([{ ev: "unan" }], "tp" + s.k);
  },
  render(ctx, root){
    const s = ctx.s, p = A(s.p), tw = s.tw || "", T = SB.u.byTwist(TW, tw);
    const lab = '<span class="eyebrow">Question ' + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T, TWL_LABEL);
    if(s.phase === "vote"){
      const need = tw === "predict" || tw === "tele", tgt = (s.tgt || {})[ctx.me];
      const ask = tw === "predict" ? tr("Et selon toi, quel choix l'emporte ?", "And which one do you think wins?") : tw === "tele" && tgt ? tr("Et qu'a choisi " + ctx.name(tgt) + " ?", "And what did " + ctx.name(tgt) + " pick?") : "";
      screen(root, "v" + s.k, lab + '<p class="big">' + tr("Tu préfères…", "Would you rather…") + '</p><div class="ab"><button type="button" data-c="a">' + esc(p[0]) + '</button><span class="or2">' + tr("ou", "or") + '</span><button type="button" data-c="b">' + esc(p[1]) + "</button></div>" +
        (need ? '<span class="eyebrow">' + esc(ask) + '</span><div class="seg"><button type="button" data-g="a">' + esc(p[0]) + '</button><button type="button" data-g="b">' + esc(p[1]) + "</button></div>" : "") +
        (tw === "chrono" ? '<div class="who" data-cd></div>' : "") + "<p class=\"wait\" data-wait></p>", r => {
        let c = "", g = "", n = 0;
        const sync = () => {
          r.querySelectorAll("[data-c]").forEach(x => x.setAttribute("aria-pressed", x.dataset.c === c));
          r.querySelectorAll("[data-g]").forEach(x => x.setAttribute("aria-pressed", x.dataset.g === g));
          if(c && (!need || g)) ctx.send({ c, g, n });
        };
        r.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => {
          if(tw === "lock" && c) return;
          if(c && c !== b.dataset.c) n++;
          c = b.dataset.c; sync();
          if(tw === "lock") r.querySelectorAll("[data-c]").forEach(x => { x.disabled = true; });
        }));
        r.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { g = b.dataset.g; sync(); }));
      });
      const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && i.c && (!need || i.g); }).length;
      txt(root, "[data-wait]", (tw === "lock" ? tr("Choix définitif · ", "Final answer · ") : tr("Tu peux changer d'avis tant que tout le monde n'a pas voté · ", "You can change your mind until everyone has voted · ")) + done + " / " + live.length);
      if(tw === "chrono") txt(root, "[data-cd]", Math.max(0, Math.ceil((s.dl - ctx.now() - 600) / 1000)) + " s");
    } else if(s.phase === "res"){
      const a = A(s.a), b = A(s.b), mine = a.indexOf(ctx.me) >= 0 ? "a" : b.indexOf(ctx.me) >= 0 ? "b" : "";
      const minority = a.length === b.length ? "" : (a.length < b.length ? "a" : "b");
      const head = !mine ? tr("Résultats", "Results") : (!minority ? tr("Le groupe est coupé en deux", "The group is split down the middle") : mine === minority ? tr("Tu es dans la minorité", "You're in the minority") : tr("Tu es avec la majorité", "You're with the majority"));
      const got = s.got || {}, gk = Object.keys(got).filter(id => got[id]);
      let extra = "";
      if(gk.length) extra += '<div class="field"><span class="eyebrow">' + tr("Points de la manche", "Points this round") + '</span><div class="chips">' + gk.map(id => '<span class="chip ok">' + esc(ctx.name(id)) + " +" + got[id] + "</span>").join("") + "</div></div>";
      else if(tw === "predict" || tw === "tele" || tw === "rare" || tw === "maj") extra += '<p class="sm">' + tr("Personne ne marque sur ce coup-là.", "Nobody scores on this one.") + "</p>";
      if(s.dev) extra += '<p class="note-box">' + esc(tr(ctx.name(s.dev) + " défend le camp opposé au sien pendant 30 secondes. On écoute !", ctx.name(s.dev) + " now argues for the other side for 30 seconds. We're listening!")) + "</p>";
      screen(root, "r" + s.k + ctx.isHost, lab + '<span class="eyebrow">' + esc(head) + "</span>" + resHTML(p, a, b, ctx.name) + extra +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le bilan", "See the recap") : tr("Question suivante", "Next question")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const bt = r.querySelector("[data-next]");
        if(bt) bt.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "res") return;
          if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
          let deck = A(c.priv().deck).map(A); if(!deck.length) deck = deckFor(c.opts.packs, st.lg);
          const np = deck.pop(); c.setPriv({ deck }); SB.u.saw(SEEN, [np]);
          const t = nextTw(c.opts, st.round + 1, st.tw, c.ids.length);
          c.set(Object.assign({ phase: "vote", p: np, round: st.round + 1, a: [], b: [], got: {}, k: c.rid() }, roundExtras(c, t)));
        }));
      });
    } else if(s.phase === "end"){
      const hist = A(s.hist).map(h => [A(A(h)[0]), A(A(h)[1])]);
      const ids = ctx.ids, st = stats(ids, hist), agree = st.agree, ks = st.ks, chg = s.chg || {}, pts = s.pts || {}, seed = s.fl;
      const duo = k => k ? esc(ctx.name(k.split("|")[0])) + " & " + esc(ctx.name(k.split("|")[1])) + " · " + Math.round(100 * agree[k][0] / agree[k][1]) + tr(" %", "%") : "—";
      const dith = ids.slice().sort((x, y) => (chg[y] || 0) - (chg[x] || 0))[0];
      const best = ids.slice().sort((x, y) => (pts[y] || 0) - (pts[x] || 0))[0];
      const card = (t, big, sm) => '<div class="card"><span class="eyebrow">' + esc(t) + '</span><div class="big">' + big + "</div>" + (sm ? '<span class="sm">' + esc(sm) + "</span>" : "") + "</div>";
      const times = n => tr(n + " fois", n === 1 ? "once" : n + " times"), sep = tr(" : ", ": ");
      screen(root, "end" + ctx.isHost, '<span class="eyebrow">' + tr("Bilan", "Recap") + "</span>" +
        (pts[best] ? card(fl(FL.champ, seed, 0), esc(ctx.name(best)), tr((pts[best] || 0) + " point" + (pts[best] > 1 ? "s" : "") + " grâce aux coups de théâtre", SB.u.plural2(pts[best] || 0, "point", "points", "point") + " from twists")) : "") +
        card(fl(FL.duo, seed, 1), duo(ks[0])) +
        (ks.length > 1 ? card(fl(FL.anti, seed, 2), duo(ks[ks.length - 1])) : "") +
        card(fl(FL.rebel, seed, 3), esc(ctx.name(st.rebel)), tr("Dans le camp minoritaire ", "In the minority ") + times(st.minor[st.rebel] || 0)) +
        (chg[dith] ? card(fl(FL.dither, seed, 4), esc(ctx.name(dith)), tr("A changé d'avis ", "Changed their mind ") + times(chg[dith])) : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, mx = Math.max.apply(null, c.ids.map(id => pp[id] || 0).concat([0]));
          const lines = [fl(FL.rebel, 0, 0) + sep + c.name(st.rebel)];
          if(mx) lines.unshift(fl(FL.champ, seed, 0) + sep + c.ids.filter(id => (pp[id] || 0) === mx).map(c.name).join(" & ") + " · " + mx + tr(" pts", mx === 1 ? " pt" : " pts"));
          c.end({ title: fl(FL.duo, seed, 1) + sep + (ks[0] ? ks[0].split("|").map(c.name).join(" & ") : "—"), lines, win: mx ? c.ids.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
    }
  },
  local: {
    start(root, api){
      let sel = A(store().tpPacks).length ? A(store().tpPacks).slice() : ["soft"], deck = [], p = null, n = 0, tw = null, twOn = store().tpTw !== false, cd = 0;
      api.onTick(() => {
        if(!cd) return;
        const left = Math.max(0, Math.ceil((cd - Date.now()) / 1000)), el = root.querySelector("[data-cd]");
        if(el) el.textContent = left ? left + "…" : tr("Levez la main !", "Hands up!");
        if(!left) cd = 0;
      });
      const go = phase => {
        if(phase === "setup"){
          screen(root, "setup" + sel.join() + twOn, '<p class="howto">' + tr("Mode cartes : lisez les deux choix à voix haute, puis chacun lève la main pour A ou pour B. Ensuite, débattez !", "Card mode: read both options out loud, then everyone raises a hand for A or B. Then argue it out!") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + "</span>" + packButtons(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variante", "Variant") + "</span>" + twToggle(twOn) + "</div>" +
            '<div class="dock"><button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button></div>", r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ tpPacks: sel }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ tpTw: twOn }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => { if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; } deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); n = 0; tw = null; next(); });
          });
        } else {
          const ch = tw && tw.id === "chrono";
          screen(root, "q" + n, '<span class="eyebrow">Question ' + n + "</span>" + SB.u.twistHTML(tw, TWL_LABEL) + '<p class="big">' + tr("Tu préfères…", "Would you rather…") + '</p><div class="ab"><button type="button" disabled>' + esc(p[0]) + '</button><span class="or2">' + tr("ou", "or") + '</span><button type="button" disabled>' + esc(p[1]) + "</button></div>" +
            (ch ? '<div class="who" data-cd>5…</div>' : "") +
            '<div class="dock">' + (ch ? '<button class="btn ghost" type="button" data-cs>' + tr("Relancer le chrono", "Restart the timer") + "</button>" : "") + '<button class="btn acc" type="button" data-n>' + tr("Question suivante", "Next question") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", next);
            r.querySelector("[data-q]").addEventListener("click", api.exit);
            const cs = r.querySelector("[data-cs]"); if(cs) cs.addEventListener("click", () => { cd = Date.now() + 5000; });
          });
          if(ch) cd = Date.now() + 5000;
        }
      };
      function next(){
        if(!deck.length) deck = deckFor(SB.okPacks(sel, PACKS), SB.lang());
        p = deck.pop(); n++; SB.u.saw(SEEN, [p]); cd = 0;
        tw = twOn && n > 1 ? SB.u.twist(TWL, { last: tw ? tw.id : "", rate: .35 }) : null;
        go("q");
      }
      go("setup");
    }
  }
});
})();
