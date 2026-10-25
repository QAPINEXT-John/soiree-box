/* Test de pureté — questionnaire secret, score en pourcentage, puis les aveux du groupe. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz, tr } = SB.u;

const SOIREE = [
  "été ivre au point de ne plus te souvenir de ta soirée","vomi en soirée","vomi sur quelqu'un","dormi dehors après une soirée","fait un black-out complet",
  "bu de l'alcool au travail ou en cours","conduit après avoir trop bu","été viré d'un bar ou d'une boîte","fini une soirée aux urgences",
  "envoyé un message que tu as regretté le lendemain","appelé ton ex en étant bourré","menti à tes parents sur l'endroit où tu dormais",
  "raté un examen ou un rendez-vous important à cause d'une gueule de bois","dansé sur une table","fini une soirée tout nu","été réveillé par la police",
  "passé une nuit en garde à vue","volé quelque chose dans un magasin","fraudé dans les transports plus de dix fois","fait pipi dans un lieu public",
  "pris un taxi sans être capable de donner ton adresse","fait la fête plus de 24 heures d'affilée","dépensé plus de 200 € en une seule soirée",
  "menti sur ton âge pour entrer quelque part","fait semblant d'être malade pour ne pas aller travailler","été viré d'un boulot",
  "fait un tatouage sur un coup de tête","été tagué sur une photo compromettante","fini une soirée chez de parfaits inconnus","bu dans une chaussure",
  "enchaîné deux soirées sans dormir","oublié où tu avais garé ta voiture après une soirée","perdu ton téléphone en soirée","fini une bouteille entière tout seul",
  "mélangé tous les alcools de la soirée dans un seul verre","dormi dans une baignoire","raté le dernier train et dormi à la gare","découvert le lendemain, grâce aux photos des autres, ce que tu avais fait la veille",
  "commandé à manger à 5 h du matin","chanté au karaoké jusqu'à perdre ta voix","organisé une fête chez toi sans prévenir tes colocs","fait la fête toute la nuit la veille d'un examen"
];
const SEXE = [
  "embrassé quelqu'un dont tu ne connaissais pas le prénom","embrassé plus de trois personnes dans la même soirée","embrassé quelqu'un du même sexe",
  "couché avec quelqu'un le premier soir","eu un plan d'un soir","eu un plan cul régulier","recouché avec ton ex après la rupture",
  "couché avec quelqu'un de ce groupe","couché avec l'ex d'un pote","couché avec un collègue","couché avec quelqu'un qui était en couple",
  "trompé quelqu'un","découvert que ton partenaire te trompait","fait l'amour dans un lieu public","fait l'amour dans une voiture","fait l'amour au travail",
  "fait l'amour dans les toilettes d'un bar ou d'une boîte","fait un plan à trois","mis les pieds dans un club libertin","envoyé des nudes",
  "filmé ou photographié un moment intime, avec l'accord de l'autre","utilisé un sex toy","utilisé des menottes ou un bandeau","fait un jeu de rôle au lit",
  "simulé un orgasme","regardé du porno avec ton partenaire","regardé du porno au travail","été surpris en pleine action","surpris quelqu'un en pleine action",
  "couché avec quelqu'un rencontré sur une appli le jour même","payé pour un strip-tease privé","fait l'amour plus de cinq fois dans la même journée",
  "fait l'amour dans le lit de quelqu'un sans qu'il le sache","couché avec quelqu'un qui avait au moins quinze ans de plus que toi","fait du sexting avec quelqu'un que tu n'avais jamais rencontré",
  "participé à une partouze","couché avec deux personnes différentes dans la même journée","fait l'amour alors que quelqu'un dormait dans la même pièce",
  "oublié le prénom de quelqu'un avec qui tu venais de coucher","eu une relation avec deux personnes en même temps sans qu'elles le sachent",
  "fait l'amour à la plage","fait l'amour dans un ascenseur","dragué quelqu'un uniquement pour rendre ton ex jaloux","eu une aventure pendant des vacances",
  "fait l'amour chez tes parents pendant qu'ils étaient là","eu une aventure avec un voisin ou une voisine","fait l'amour plus de trois heures d'affilée","échangé des photos coquines avec quelqu'un de cette pièce",
  "acheté de la lingerie spécialement pour un rendez-vous","fait l'amour sous une tente","fini au lit dès le premier rendez-vous, avant même le dessert","ramené chez toi quelqu'un rencontré le soir même dans un bar"
];
const INTERDIT = [
  "fumé du cannabis","pris une drogue plus forte que le cannabis","vendu quelque chose d'illégal","été arrêté par la police",
  "escaladé un endroit interdit (toit, grue, monument)","exploré un lieu abandonné ou interdit d'accès","fait un excès de vitesse de plus de 50 km/h",
  "triché à un examen important","menti sur ton CV","fouillé dans le téléphone de ton partenaire","créé un faux compte pour espionner quelqu'un",
  "lu les messages privés de quelqu'un en cachette","gardé l'argent d'un portefeuille trouvé","quitté un restaurant sans payer",
  "cassé quelque chose et accusé quelqu'un d'autre","menti à la police","dit « je t'aime » sans le penser","gardé un secret qui pourrait détruire un couple",
  "piqué de l'argent à tes parents","inventé une maladie pour obtenir quelque chose",
  "conduit sans permis","fait le mur pour sortir la nuit","menti à un contrôleur pour éviter une amende","piqué dans un hôtel autre chose que les petits savons",
  "ouvert le courrier de quelqu'un d'autre","gonflé une note de frais","utilisé le compte de streaming de quelqu'un sans lui demander","inventé un décès pour sécher les cours ou le travail",
  "imité la signature de tes parents","acheté de l'alcool avant l'âge légal","revendu un cadeau qu'on t'avait offert"
];
const COEUR = [
  "ghosté quelqu'un après plusieurs rendez-vous","été ghosté","dit « je t'aime » dès le premier mois","rompu par message",
  "stalké le nouveau copain ou la nouvelle copine de ton ex","menti sur ton métier pour séduire quelqu'un","utilisé une photo retouchée sur une appli de rencontre","dragué quelqu'un qui était déjà en couple",
  "été amoureux de deux personnes en même temps","écrit une lettre d'amour que tu n'as jamais envoyée","écrit à ton ex au milieu de la nuit","fait une scène de jalousie en public",
  "fait semblant d'adorer un cadeau de ton partenaire","oublié un anniversaire de couple","rompu le jour de l'anniversaire de l'autre","craqué pour le partenaire d'un ami",
  "été en couple avec deux personnes du même groupe d'amis","rompu puis remis ça plus de deux fois avec la même personne","annulé un rendez-vous avec une fausse excuse","quitté un rendez-vous galant avant la fin tellement c'était raté",
  "pleuré à cause d'une rupture devant tes collègues","gardé un cadeau d'un ex en souvenir… et en cachette"
];
const BOULOT = [
  "dormi sur ton lieu de travail","fait une sieste dans les toilettes du bureau","envoyé un message moqueur à la personne dont tu te moquais","menti en entretien d'embauche",
  "copié sur ton voisin pendant un examen","rendu un devoir écrit par quelqu'un d'autre","inventé une panne de réveil pour justifier un retard","quitté un job sans prévenir personne",
  "critiqué ton chef sans savoir qu'il t'entendait","fait semblant de travailler pendant une journée entière","coupé ta caméra en visio pour faire tout autre chose","gardé ton bas de pyjama pendant une visio",
  "piqué des fournitures au bureau","pris un arrêt maladie pour partir en week-end","séché plus de la moitié des cours d'un semestre","fait une présentation importante avec une gueule de bois",
  "pleuré dans les toilettes du travail","réussi un examen sans avoir ouvert tes cours","démissionné sur un coup de tête","postulé en douce pour le poste de ton chef"
];
const VOYAGE = [
  "raté un avion","voyagé sans avoir réservé de logement","dormi dans un aéroport","perdu ton passeport ou ta carte d'identité en voyage",
  "fait du stop","gardé secrète une histoire de vacances","menti sur tes vacances pour impressionner quelqu'un","acheté un billet d'avion la veille sur un coup de tête",
  "pris un bain de minuit tout nu","été malade dans un bus ou un bateau","dépensé tout ton budget vacances en trois jours","menti à la douane",
  "dormi à la belle étoile sans tente","été perdu dans une ville étrangère avec ton téléphone à plat","pris une photo interdite dans un musée","prolongé tes vacances sans prévenir ton boulot"
];
const HONTE = [
  "appelé un prof « maman » ou « papa »","répondu à un signe de la main qui ne t'était pas destiné","raté une marche devant tout le monde","envoyé une capture d'écran à la personne dont il était question",
  "répondu « vous aussi » au serveur qui te souhaitait bon appétit","liké une vieille photo en stalkant quelqu'un","chanté à tue-tête avec ton casque sur les oreilles sans te rendre compte que tout le monde t'entendait","appelé ton partenaire par le prénom de ton ex",
  "été surpris en train de parler tout seul","été surpris en train de danser devant un miroir","oublié le prénom de quelqu'un juste avant de le présenter","eu un fou rire à un moment totalement déplacé",
  "ri si fort que ta boisson est ressortie par le nez","fait tomber ton téléphone dans les toilettes","porté un vêtement à l'envers toute une journée","foncé dans une porte vitrée",
  "mangé un truc tombé par terre devant des invités","eu le ventre qui gargouillait en plein silence","fait semblant d'avoir lu un livre dont tout le monde parlait","posté une story pour une seule personne",
  "menti sur tes goûts pour plaire à quelqu'un","envoyé un message vocal sans faire exprès"
];
const HARD = [
  "fait une gorge profonde", "avalé après une fellation", "fait un 69", "essayé la sodomie",
  "aimé la sodomie", "fait un anulingus", "reçu un anulingus", "joui sur le visage de quelqu'un, ou reçu ça sur le tien",
  "fait squirter quelqu'un, ou squirté toi-même", "utilisé un plug anal", "utilisé un gode-ceinture", "été attaché(e) pendant l'amour",
  "attaché quelqu'un pendant l'amour", "joué le rôle du soumis ou de la soumise au lit", "joué le rôle du dominant ou de la dominante au lit", "donné ou reçu une fessée qui a laissé des marques",
  "utilisé un fouet, des pinces ou de la cire chaude", "réalisé un de tes fétiches au lit (pieds, latex, uniformes…)", "fait l'amour déguisé(e)", "fait un plan à quatre ou plus",
  "été la seule fille ou le seul mec dans un plan à plusieurs", "fait de l'échangisme", "regardé ton ou ta partenaire coucher avec quelqu'un d'autre", "couché avec quelqu'un pendant que d'autres regardaient",
  "filmé un plan à plusieurs, avec l'accord de tous", "mis les pieds dans un club BDSM ou fétichiste", "fait l'amour dans un backroom", "testé un glory hole",
  "couché avec plus de 20 personnes", "couché avec plus de 50 personnes", "couché avec trois personnes différentes en une semaine", "fait l'amour plus de dix fois en un seul week-end",
  "eu une relation sexuelle avec quelqu'un du même sexe", "couché avec quelqu'un dont tu n'as jamais su le prénom", "couché avec quelqu'un rencontré sur internet sans jamais avoir vu son visage avant", "fait l'amour sans capote avec quelqu'un rencontré le soir même",
  "fait l'amour sous l'effet d'une drogue", "couché avec ton patron ou un de tes profs à la fac", "couché avec le copain ou la copine d'un ami", "été pendant des mois l'amant ou la maîtresse de quelqu'un de marié",
  "trompé ton ou ta partenaire pendant une soirée où il ou elle était aussi", "couché avec deux personnes qui se connaissaient, sans que l'une sache pour l'autre", "couché avec quelqu'un juste pour obtenir quelque chose", "eu des aventures avec deux personnes présentes ce soir",
  "masturbé quelqu'un sous la table", "été masturbé(e) sous la table", "eu un orgasme en public sans que personne ne le remarque", "fait l'amour dans un train ou un avion",
  "fait l'amour dans une cabine d'essayage", "fait l'amour dans un parc ou une forêt en pleine journée", "fait l'amour sur un balcon visible depuis la rue", "fait l'amour dans une piscine ou un jacuzzi avec du monde autour",
  "fait l'amour dans le lit de tes parents", "été surpris(e) en pleine action par tes parents", "fait l'amour pendant les règles (les tiennes ou celles de l'autre)", "eu une séance coquine par webcam avec quelqu'un que tu ne connaissais pas",
  "envoyé une vidéo de toi en train de te faire plaisir", "envoyé un nude à la mauvaise personne", "vendu des photos ou vidéos sexy de toi en ligne", "payé pour du contenu sexy en ligne",
  "fait un strip-tease intégral devant plusieurs personnes", "bu un shot sur le corps de quelqu'un", "proposé un plan à trois à ton ou ta partenaire", "couché avec quelqu'un qui avait au moins vingt ans de plus que toi",
  "couché avec quelqu'un juste pour pouvoir dire que tu l'avais fait", "joui en moins d'une minute", "eu un orgasme rien qu'avec des mots"
];
/* ---------- English decks: each entry follows "Have you ever…" ---------- */
const SOIREE_EN = [
  "gotten so drunk you couldn't remember the night","thrown up at a party","thrown up on someone","slept outside after a night out","completely blacked out",
  "drunk alcohol at work or in class","driven after drinking too much","been kicked out of a bar or a club","ended a night out in the ER",
  "sent a text you regretted the next morning","drunk-dialed your ex","lied to your parents about where you were sleeping",
  "missed an exam or an important meeting because of a hangover","danced on a table","ended a party completely naked","been woken up by the cops",
  "spent a night in a police cell","shoplifted","skipped paying for public transit more than ten times","peed in a public place",
  "taken a cab without being able to tell the driver your address","partied for more than 24 hours straight","blown more than 200 bucks in a single night",
  "lied about your age to get in somewhere","called in sick to work when you weren't","been fired from a job",
  "gotten a tattoo on a whim","been tagged in a compromising photo","ended a night out at total strangers' place","drunk out of a shoe",
  "done two nights out back to back without sleeping","forgotten where you parked after a night out","lost your phone at a party","finished a whole bottle by yourself",
  "mixed every drink at the party into one glass","slept in a bathtub","missed the last train and slept at the station","found out what you did last night from other people's photos",
  "ordered food at 5 a.m.","sung karaoke until you lost your voice","thrown a party at your place without telling your roommates","partied all night before an exam"
];
const SEXE_EN = [
  "kissed someone without knowing their name","kissed more than three people in the same night","kissed someone of the same sex",
  "slept with someone on the first night","had a one-night stand","had a regular booty call","slept with your ex after the breakup",
  "slept with someone in this group","slept with a friend's ex","slept with a coworker","slept with someone who was in a relationship",
  "cheated on someone","found out your partner was cheating on you","had sex in a public place","had sex in a car","had sex at work",
  "had sex in a bar or club bathroom","had a threesome","set foot in a swingers' club","sent nudes",
  "filmed or photographed an intimate moment, with the other person's consent","used a sex toy","used handcuffs or a blindfold","role-played in bed",
  "faked an orgasm","watched porn with your partner","watched porn at work","been caught in the act","walked in on someone in the act",
  "slept with someone you matched with on an app that same day","paid for a private lap dance","had sex more than five times in one day",
  "had sex in someone's bed without them knowing","slept with someone at least fifteen years older than you","sexted someone you'd never met in person",
  "taken part in an orgy","slept with two different people on the same day","had sex while someone was asleep in the same room",
  "forgotten the name of someone you'd just slept with","dated two people at once without either of them knowing",
  "had sex on the beach","had sex in an elevator","flirted with someone just to make your ex jealous","had a vacation fling",
  "had sex at your parents' place while they were home","had a fling with a neighbor","had sex for more than three hours straight","swapped naughty pics with someone in this room",
  "bought lingerie especially for a date","had sex in a tent","ended up in bed on a first date before dessert even showed up","taken home someone you'd met at a bar that same night"
];
const INTERDIT_EN = [
  "smoked weed","taken a drug harder than weed","sold something illegal","been arrested",
  "climbed somewhere off-limits (a roof, a crane, a monument)","explored an abandoned or off-limits place","driven more than 30 mph over the speed limit",
  "cheated on an important exam","lied on your resume","gone through your partner's phone","made a fake account to spy on someone",
  "secretly read someone's private messages","kept the cash from a wallet you found","dined and dashed",
  "broken something and blamed someone else","lied to the police","said “I love you” without meaning it","kept a secret that could wreck a relationship",
  "stolen money from your parents","faked an illness to get something",
  "driven without a license","snuck out at night","lied to a ticket inspector to get out of a fine","stolen something from a hotel besides the little soaps",
  "opened someone else's mail","padded an expense report","used someone's streaming account without asking","made up a death in the family to skip class or work",
  "forged your parents' signature","bought alcohol underage","resold a gift someone gave you"
];
const COEUR_EN = [
  "ghosted someone after several dates","been ghosted","said “I love you” in the first month","broken up with someone over text",
  "stalked your ex's new partner online","lied about your job to impress someone","used a heavily edited photo on a dating app","hit on someone who was already taken",
  "been in love with two people at the same time","written a love letter you never sent","texted your ex in the middle of the night","thrown a jealous fit in public",
  "pretended to love a gift from your partner","forgotten your anniversary","broken up with someone on their birthday","fallen for a friend's partner",
  "dated two people from the same friend group","broken up and gotten back together with the same person more than twice","canceled a date with a fake excuse","walked out of a date early because it was that bad",
  "cried over a breakup in front of your coworkers","kept a gift from an ex as a keepsake… in secret"
];
const BOULOT_EN = [
  "slept at your workplace","napped in the office bathroom","sent a mean message about someone… to that exact person","lied in a job interview",
  "copied off your neighbor during an exam","handed in an assignment someone else wrote","blamed a dead alarm clock for being late","quit a job without telling anyone",
  "trash-talked your boss without realizing they could hear you","pretended to work for an entire day","turned off your camera on a video call to do something else entirely","worn pajama pants on a video call",
  "stolen office supplies","called in sick to go away for the weekend","skipped more than half your classes in a semester","given an important presentation hungover",
  "cried in the bathroom at work","passed an exam without ever opening your notes","quit a job on a whim","secretly applied for your boss's job"
];
const VOYAGE_EN = [
  "missed a flight","traveled without booking anywhere to stay","slept in an airport","lost your passport or ID while traveling",
  "hitchhiked","kept a vacation story secret","lied about your vacation to impress someone","booked a flight the day before on a whim",
  "gone skinny-dipping at midnight","gotten sick on a bus or a boat","blown your whole vacation budget in three days","lied at customs",
  "slept under the stars without a tent","been lost in a foreign city with a dead phone","taken a forbidden photo in a museum","extended your vacation without telling work"
];
const HONTE_EN = [
  "called a teacher “Mom” or “Dad”","waved back at someone who wasn't waving at you","tripped on a step in front of everyone","sent a screenshot to the very person it was about",
  "said “you too” when the waiter told you to enjoy your meal","accidentally liked an old photo while stalking someone","sung at the top of your lungs with headphones on, not realizing everyone could hear you","called your partner by your ex's name",
  "been caught talking to yourself","been caught dancing in front of a mirror","forgotten someone's name right as you were introducing them","burst out laughing at a totally inappropriate moment",
  "laughed so hard your drink came out of your nose","dropped your phone in the toilet","worn something inside out all day","walked straight into a glass door",
  "eaten something off the floor in front of guests","had your stomach growl in dead silence","pretended to have read a book everyone was talking about","posted a story for just one person",
  "lied about what you like to impress someone","sent a voice message by accident"
];
const HARD_EN = [
  "deep-throated someone", "swallowed after giving a blowjob", "done a 69", "tried anal",
  "enjoyed anal", "given a rim job", "gotten a rim job", "come on someone's face, or had someone come on yours",
  "made someone squirt, or squirted yourself", "used a butt plug", "used a strap-on", "been tied up during sex",
  "tied someone up during sex", "played the sub in bed", "played the dom in bed", "given or gotten a spanking that left marks",
  "used a whip, nipple clamps or hot wax", "acted out one of your fetishes in bed (feet, latex, uniforms…)", "had sex in costume", "had a foursome or more",
  "been the only guy or the only girl in a group thing", "gone swinging", "watched your partner have sex with someone else", "had sex while other people watched",
  "filmed group sex, with everyone's consent", "set foot in a BDSM or fetish club", "had sex in a club backroom", "tried a glory hole",
  "slept with more than 20 people", "slept with more than 50 people", "slept with three different people in one week", "had sex more than ten times in one weekend",
  "had sex with someone of the same sex", "slept with someone whose name you never found out", "slept with someone from the internet without ever having seen their face", "had sex without a condom with someone you'd met that night",
  "had sex high", "slept with your boss or one of your college professors", "slept with a friend's boyfriend or girlfriend", "been a married person's secret lover for months",
  "cheated on your partner at a party they were also at", "slept with two people who knew each other, without either knowing about the other", "slept with someone just to get something out of it", "hooked up with two people who are here tonight",
  "gotten someone off under the table", "had someone get you off under the table", "had an orgasm in public without anyone noticing", "had sex on a train or a plane",
  "had sex in a fitting room", "had sex in a park or the woods in broad daylight", "had sex on a balcony in full view of the street", "had sex in a pool or a hot tub with people around",
  "had sex in your parents' bed", "been caught in the act by your parents", "had period sex (yours or theirs)", "had a naughty webcam session with a total stranger",
  "sent someone a video of yourself getting off", "sent a nude to the wrong person", "sold sexy pics or videos of yourself online", "paid for sexy content online",
  "done a full striptease in front of a group", "done a body shot off someone", "suggested a threesome to your partner", "slept with someone at least twenty years older than you",
  "slept with someone just so you could say you'd done it", "come in under a minute", "had an orgasm from words alone"
];
const DROGUES = [
  "fumé un joint avant d'aller travailler ou en cours", "pris de la MDMA ou de l'ecstasy en soirée", "goûté aux champignons hallucinogènes",
  "pris du LSD", "pris de la cocaïne", "acheté de la drogue à un inconnu",
  "fait un bad trip", "caché de la drogue chez quelqu'un sans le lui dire", "passé une soirée tellement défoncé que tu ne t'en souviens plus",
  "été défoncé à un repas de famille", "pris du protoxyde d'azote (les ballons)", "mangé un space cake",
  "été défoncé au travail", "mélangé alcool et drogue dans la même soirée", "dealé, même juste à des potes",
  "fait pousser du cannabis chez toi", "passé une frontière avec de la drogue sur toi", "été contrôlé par la police avec de la drogue sur toi",
  "pris de la kétamine", "vapoté du THC"
];
const DROGUES_EN = [
  "smoked a joint before work or class", "taken MDMA or ecstasy at a party", "tried magic mushrooms",
  "taken LSD", "done cocaine", "bought drugs from a stranger",
  "had a bad trip", "hidden drugs at someone's place without telling them", "been so high at a party that you can't remember it",
  "been high at a family dinner", "done laughing gas (nitrous balloons)", "eaten a space cake",
  "been high at work", "mixed alcohol and drugs on the same night", "dealt drugs, even just to friends",
  "grown weed at home", "crossed a border with drugs on you", "been stopped by the police with drugs on you",
  "taken ketamine", "vaped THC"
];
const CRADO = [
  "porté le même caleçon ou la même culotte trois jours de suite", "passé plus de trois jours sans te doucher", "utilisé la brosse à dents de quelqu'un d'autre",
  "reniflé un vêtement sale pour savoir s'il pouvait encore se porter", "appliqué la règle des cinq secondes", "remis des chaussettes sales faute d'en avoir des propres",
  "dormi sans te laver les dents ni te démaquiller", "fait pipi sous la douche", "mangé quelque chose périmé depuis plus d'une semaine",
  "laissé de la vaisselle sale traîner plus d'une semaine", "mangé une crotte de nez depuis que tu es adulte", "gardé les mêmes draps plus d'un mois",
  "pété dans un ascenseur bondé", "accusé quelqu'un d'autre de ton pet", "fait tes besoins dans la nature sans papier",
  "remâché un chewing-gum que tu avais déjà mâché", "fini le fond de verre de quelqu'un d'autre en soirée", "oublié de te laver les mains en sortant des toilettes",
  "dormi tout habillé, chaussures aux pieds, après une soirée", "mangé de la nourriture récupérée dans une poubelle", "coupé tes ongles de pied dans un lieu public",
  "dormi dans un lit plein de miettes parce que tu mangeais dedans"
];
const CRADO_EN = [
  "worn the same underwear three days in a row", "gone more than three days without showering", "used someone else's toothbrush",
  "sniffed dirty clothes to see if they could be worn again", "followed the five-second rule", "put dirty socks back on because you had no clean ones",
  "gone to bed without brushing your teeth or taking your makeup off", "peed in the shower", "eaten something more than a week past its date",
  "left dirty dishes lying around for over a week", "eaten a booger as an adult", "kept the same sheets on for over a month",
  "farted in a packed elevator", "blamed someone else for your fart", "had to go in the woods with no toilet paper",
  "re-chewed gum you'd already chewed", "finished the dregs of someone else's glass at a party", "skipped washing your hands after using the toilet",
  "fallen asleep fully dressed, shoes on, after a night out", "eaten food you fished out of a bin", "clipped your toenails in public",
  "slept in a bed full of crumbs from eating in it"
];
const QS = {
  fr: { soiree: SOIREE, sexe: SEXE, interdit: INTERDIT, coeur: COEUR, boulot: BOULOT, voyage: VOYAGE, honte: HONTE, hardcore: HARD, drogues: DROGUES, crado: CRADO },
  en: { soiree: SOIREE_EN, sexe: SEXE_EN, interdit: INTERDIT_EN, coeur: COEUR_EN, boulot: BOULOT_EN, voyage: VOYAGE_EN, honte: HONTE_EN, hardcore: HARD_EN, drogues: DROGUES_EN, crado: CRADO_EN }
};
const LG = lg => lg === "en" ? "en" : "fr";
const PACKS = [
  { v: "soiree", label: tr("Soirées & excès", "Parties & excess"), desc: tr("Alcool, fêtes, galères", "Booze, parties, disasters") },
  { v: "sexe", label: tr("Sexe & couple", "Sex & relationships"), desc: tr("Plans d'un soir, infidélités, expériences", "One-night stands, cheating, experiments"), hot: true },
  { v: "interdit", label: tr("Interdit & limites", "Off-limits"), desc: tr("Police, drogues, mensonges, coups bas", "Cops, drugs, lies, dirty tricks"), hot: true },
  { v: "coeur", label: tr("Cœur & ex", "Love & exes"), desc: tr("Ruptures, ghosting, jalousie", "Breakups, ghosting, jealousy") },
  { v: "boulot", label: tr("Boulot & études", "Work & studies"), desc: tr("Retards, triches, siestes clandestines", "Late again, cheating, secret naps") },
  { v: "voyage", label: tr("Voyages", "Travel"), desc: tr("Vols ratés, aventures, passeports perdus", "Missed flights, flings, lost passports") },
  { v: "honte", label: tr("Moments gênants", "Cringe moments"), desc: tr("Les hontes qu'on n'avoue jamais", "The shame you never admit to") },
  { v: "drogues", label: tr("Drogues & substances", "Drugs & substances"), desc: tr("Joints, pilules, bad trips", "Joints, pills, bad trips"), hot: true },
  { v: "crado", label: tr("Hygiène & crasse", "Hygiene & gross stuff"), desc: tr("Les petits secrets pas très propres", "Your not-so-clean little secrets") },
  { v: "hardcore", label: "Hardcore 18+", desc: tr("Pratiques, plans à plusieurs, records : zéro filtre", "Kinks, group sex, body counts: zero filter"), hot: true }
];
PACKS.forEach(p => { p.list = QS[LG(SB.lang())][p.v]; }); // listes de ce téléphone (réglages, compteurs)
// Index des questions par langue : en réseau, les index (s.qi) se résolvent avec la langue de l'hôte (s.lg).
const ALLS = {}, QIXS = {};
["fr", "en"].forEach(l => { ALLS[l] = PACKS.flatMap(p => QS[l][p.v].map(q => ({ pack: p.v, q }))); QIXS[l] = {}; ALLS[l].forEach((x, i) => { QIXS[l][x.q] = i; }); });
const ALL = lg => ALLS[LG(lg)], QIX = lg => QIXS[LG(lg)];
const PREFIX = { fr: "As-tu déjà…", en: "Have you ever…" };
const pre = lg => PREFIX[LG(lg)];
// Question complète (aveux) : « As-tu déjà… vomi ? » / "Have you ever thrown up?"
const qfull = (lg, q) => LG(lg) === "en" ? "Have you ever " + q + "?" : PREFIX.fr + " " + q + " ?";
const pct = p => tr(p + " %", p + "%");
const TITLES = [
  [90, [[tr("Ange tombé du ciel", "Heaven-sent angel"), tr("Pur comme de l'eau de roche. Personne ne te croit.", "Pure as the driven snow. Nobody believes you.")], [tr("Auréole certifiée", "Certified halo"), tr("Tu as forcément menti au moins une fois. Non ?", "You must have lied at least once. Right?")], [tr("Page blanche", "Blank page"), tr("Ta vie est un livre blanc. Très, très blanc.", "Your life is a blank book. Very, very blank.")]]],
  [75, [[tr("Plutôt sage", "Pretty tame"), tr("Quelques écarts, rien de grave. Pour l'instant.", "A few slip-ups, nothing serious. For now.")], [tr("Enfant de chœur repenti", "Reformed goody two-shoes"), tr("Tu as goûté au vice, du bout des lèvres.", "You've had a taste of sin. Just a tiny sip.")], [tr("Sage avec options", "Well-behaved, mostly"), tr("Un dossier léger, mais un dossier quand même.", "A thin file, but a file all the same.")]]],
  [55, [[tr("Bien vécu", "Well lived"), tr("Tu as des histoires à raconter, et tu les racontes.", "You've got stories to tell, and you tell them.")], [tr("Vie bien remplie", "Full life"), tr("Tes souvenirs valent un podcast.", "Your memories could fill a podcast.")], [tr("Équilibriste", "Tightrope walker"), tr("Un pied dans la sagesse, l'autre dans le chaos.", "One foot in good behavior, the other in chaos.")]]],
  [35, [[tr("Sulfureux", "Scandalous"), tr("Ta réputation te précède. Tes parents ne savent pas tout.", "Your reputation precedes you. Your parents don't know the half of it.")], [tr("Dossier épais", "Thick file"), tr("Ton casier moral mérite deux classeurs.", "Your moral rap sheet needs two binders.")], [tr("Tentation ambulante", "Walking temptation"), tr("Les ennuis te trouvent, et tu leur ouvres la porte.", "Trouble finds you, and you hold the door open.")]]],
  [-1, [[tr("Démon certifié", "Certified demon"), tr("Il n'y a plus rien de pur chez toi. Respect.", "There's nothing pure left in you. Respect.")], [tr("Légende noire", "Dark legend"), tr("On racontera tes exploits pendant des générations.", "Your exploits will be told for generations.")], [tr("Chaos incarné", "Chaos incarnate"), tr("Même le diable prend des notes.", "Even the devil takes notes.")]]]
];
function title(pct, seed){ const b = TITLES.find(t => pct >= t[0]) || TITLES[TITLES.length - 1]; return b[1][(+seed || 0) % b[1].length]; }
// Questions choisies parmi les thèmes, en commençant par celles jamais vues sur ce téléphone.
function pickQuestions(packs, n, lg){
  const sel = A(packs).length ? A(packs) : PACKS.map(p => p.v);
  let d = SB.u.fresh("purete:q", ALL(lg).filter(x => sel.indexOf(x.pack) >= 0).map(x => x.q));
  if(n) d = d.slice(-n);
  SB.u.saw("purete:q", d);
  return shuffle(d.map(q => QIX(lg)[q]));
}
/* ---------- Rejouabilité : questions piégées ---------- */
const TW = [
  { id: "x2", name: tr("Question piège", "Trick question"), desc: tr("Un « oui » ici compte double dans ton score.", "A “yes” here counts double against your score.") },
  { id: "x3", name: tr("Question fatale", "Deadly question"), desc: tr("Un « oui » ici compte triple. Courage.", "A “yes” here counts triple. Good luck.") },
  { id: "free", name: tr("Joker", "Free pass"), desc: tr("Un « oui » ici ne te coûte rien… mais il apparaîtra dans les aveux.", "A “yes” here costs you nothing… but it still shows up in the confessions.") },
  { id: "gold", name: tr("Question en or", "Golden question"), desc: tr("Un « jamais » ici te fait regagner des points.", "A “never” here wins you points back.") },
  { id: "reveal", name: tr("Révélation", "Unmasked"), desc: tr("Ceux qui disent oui seront nommés, même si les aveux sont anonymes.", "Whoever says yes gets named, even if confessions are anonymous."), ok: o => o.n > 1 },
  { id: "story", name: tr("Raconte !", "Spill it!"), desc: tr("Parmi les « oui », un nom sera tiré au sort pour raconter l'histoire.", "One of the “yes” crowd gets picked at random to tell the story."), ok: o => o.n > 1 },
  { id: "suspense", name: "Suspense", desc: tr("Aux aveux, le nombre de « oui » restera caché : pariez avant de le révéler.", "In the confessions, the number of “yes” stays hidden: place your bets before revealing it."), ok: o => o.n > 1 }
];
const TWL = tr("Coup de théâtre", "Plot twist");
// Place quelques coups de théâtre dans le questionnaire (jamais sur la première question).
function placeTwists(len, on, n){
  if(!on || len < 8) return [];
  const cnt = Math.max(2, Math.min(6, Math.round(len / 12))), pos = shuffle(Array.from({ length: len - 1 }, (_, i) => i + 1)).slice(0, cnt).sort((a, b) => a - b);
  let last = ""; const out = [];
  pos.forEach(p => { const t = SB.u.twist(TW, { rate: 1, last, n }); if(t){ out.push([p, t.id]); last = t.id; } });
  return out;
}
function twMap(tw){ const m = {}; A(tw).map(A).forEach(x => { m[+x[0]] = String(x[1]); }); return m; }
function score(ans, tw){
  const s = String(ans || ""), m = twMap(tw); if(!s.length) return 100;
  let W = 0, bad = 0;
  for(let i = 0; i < s.length; i++){
    const t = m[i], w = t === "x2" ? 2 : t === "x3" ? 3 : t === "free" ? 0 : 1;
    W += w; if(s[i] === "1") bad += w; else if(t === "gold") bad -= 1;
  }
  return Math.max(0, Math.min(100, Math.round(100 * (1 - bad / Math.max(1, W)))));
}
/* ---------- Profil par thème : graphique radar en fin de test ---------- */
// Le graphique ne suit pas les thèmes du test mais 5 axes : chaque question est rangée dans l'un d'eux.
const DIMS = ["sexe", "drogues", "alcool", "hygiene", "morale"];
const SHORT = { sexe: tr("Sexe", "Sex"), drogues: tr("Drogues", "Drugs"), alcool: tr("Alcool", "Alcohol"), hygiene: tr("Hygiène", "Hygiene"), morale: tr("Morale", "Morals") };
const RX = {
  drogues: /cannabis|drogue|joint|ecstasy|mdma|cocaïne|champignons? halluc|\blsd\b|kétamine|space cake|défoncé|protoxyde|\bthc\b|\bdeal|\bweed\b|\bdrugs?\b|cocaine|mushrooms|ketamine|\bhigh\b|laughing gas|\bdealt\b/i,
  alcool: /\bivre\b|vomi|\bbu\b|bourré|gueule de bois|black-out|bouteille|alcool|\bshot|soûl|saoul|bière|karaoké|\bfête|soirée|drunk|wasted|hungover|hangover|booze|threw up|puke|blacked out|alcohol|bottle|\bbeer|\bparty|karaoke|night out|drinking/i,
  hygiene: /pipi|doucher|douche|brosse à dents|\bdents\b|tombé par terre|à l'envers|caleçon|culotte|chaussettes|crotte|draps|\bpété|ton pet\b|besoins dans la nature|chewing-gum|poubelle|ongles|miettes|vaisselle|périmé|reniflé|cinq secondes|\bpee|shower|toothbrush|\bteeth\b|off the floor|inside out|underwear|\bsocks\b|booger|\bsheets\b|farted|your fart|toilet paper|\bgum\b|\bbin\b|toenails|crumbs|dishes|past its date|sniffed|five-second/i,
  morale: /volé|fraud|police|garde à vue|menti|triché|viré d'un boulot|semblant d'être malade|stole|shoplift|\bfares?\b|\bcops\b|arrest|police cell|\blied\b|cheated|fired|faked being sick|pretended to be sick/i
};
function dimOf(pack, q){
  if(pack === "sexe" || pack === "hardcore") return "sexe";
  if(pack === "drogues") return "drogues";
  if(pack === "crado") return "hygiene";
  if(RX.drogues.test(q)) return "drogues";
  if(pack === "soiree"){ if(RX.hygiene.test(q)) return "hygiene"; if(RX.morale.test(q)) return "morale"; return "alcool"; }
  if(RX.alcool.test(q)) return "alcool";
  if(RX.hygiene.test(q)) return "hygiene";
  return "morale";
}
const PAL = ["var(--acc)", "#4fd1bf", "#ffb020", "#8b7bff", "#5bc0ff", "#9be15d", "#ff8a4c", "#ff6b8a"];
// Thèmes présents dans le test (dans l'ordre des thèmes) et % de « oui » de chaque réponse.
function themesOf(qi, lg){ const all = ALL(lg), seen = {}; A(qi).forEach(i => { const x = all[i]; if(x) seen[dimOf(x.pack, x.q)] = 1; }); return DIMS.filter(v => seen[v]); }
function profile(qi, ans, lg){
  const all = ALL(lg), a = String(ans || ""), st = {};
  A(qi).forEach((qx, i) => { const x = all[qx]; if(!x || i >= a.length) return; const d = dimOf(x.pack, x.q), o = st[d] = st[d] || [0, 0]; o[1]++; if(a[i] === "1") o[0]++; });
  return st;
}
const pcOf = st => v => (st[v] && st[v][1] ? Math.round(100 * st[v][0] / st[v][1]) : 0);
function radarSVG(themes, series){
  const n = themes.length, cx = 170, cy = 150, R = 104, ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))].map(x => x.toFixed(1));
  let g = "";
  [25, 50, 75, 100].forEach(k => { g += '<polygon points="' + themes.map((_, i) => pt(i, R * k / 100).join(",")).join(" ") + '" style="fill:none;stroke:var(--line);stroke-width:1"/>'; });
  themes.forEach((_, i) => { const e = pt(i, R); g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0] + '" y2="' + e[1] + '" style="stroke:var(--line);stroke-width:1"/>'; });
  g += '<text x="' + (cx + 4) + '" y="' + (cy - R / 2 + 4) + '" style="fill:var(--muted);font-size:10px">50</text>';
  series.forEach(sr => {
    const pts = themes.map((v, i) => pt(i, R * Math.max(3, sr.pc(v)) / 100));
    g += '<polygon points="' + pts.map(p => p.join(",")).join(" ") + '" style="fill:' + sr.c + ';fill-opacity:.22;stroke:' + sr.c + ';stroke-width:2.5;stroke-linejoin:round"/>';
    g += pts.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" style="fill:' + sr.c + '"/>').join("");
  });
  themes.forEach((v, i) => {
    const e = pt(i, R + 16), c = Math.cos(ang(i)), anc = Math.abs(c) < .2 ? "middle" : c > 0 ? "start" : "end", dy = Math.sin(ang(i)) > .5 ? 10 : Math.sin(ang(i)) < -.5 ? -2 : 4;
    g += '<text x="' + e[0] + '" y="' + (+e[1] + dy) + '" text-anchor="' + anc + '" style="fill:var(--ink);font-size:14px;font-weight:700">' + esc(SHORT[v] || v) + "</text>";
  });
  return '<svg class="pu-radar" viewBox="0 0 340 300" role="img" aria-label="' + esc(tr("Profil par thème", "Profile by theme")) + '">' + g + "</svg>";
}
function barsHTML(themes, sr){ return '<ul class="pu-bars">' + themes.map(v => '<li><span>' + esc(SHORT[v] || v) + '</span><span class="pu-bar"><i style="width:' + sr.pc(v) + '%;background:' + sr.c + '"></i></span><b>' + pct(sr.pc(v)) + "</b></li>").join("") + "</ul>"; }
// Bloc complet : radar (3 thèmes ou plus) ou barres, chiffres du joueur mis en avant, légende si plusieurs joueurs.
function profileHTML(qi, lg, series, mineIdx, title){
  const themes = themesOf(qi, lg); if(!themes.length || !series.length) return "";
  const m = mineIdx == null ? series[0] : mineIdx >= 0 ? series[mineIdx] : null;
  const tot = m && m.st ? Object.keys(m.st).reduce((a, k) => [a[0] + m.st[k][0], a[1] + m.st[k][1]], [0, 0]) : [0, 0];
  let h = '<div class="field pu-prof"><span class="eyebrow">' + esc(title || tr("Ton profil", "Your profile")) + "</span>";
  h += themes.length >= 3 ? radarSVG(themes, series) : series.map(sr => (series.length > 1 ? '<b class="sm">' + esc(sr.name) + "</b>" : "") + barsHTML(themes, sr)).join("");
  if(series.length > 1 && themes.length >= 3) h += '<div class="pu-leg">' + series.map(sr => '<span><i style="background:' + sr.c + '"></i>' + esc(sr.name) + "</span>").join("") + "</div>";
  if(m && m.st) h += '<ul class="pu-stats"><li>' + tr("Réponses positives", "“Yes” answers") + " <b>" + pct(Math.round(100 * tot[0] / Math.max(1, tot[1]))) + "</b></li>" +
    themes.map(v => "<li>" + esc(SHORT[v] || v) + " <b>" + pct(m.pc(v)) + "</b></li>").join("") + "</ul>";
  return h + "</div>";
}
/* Plusieurs joueurs : un seul profil affiché à la fois (lisible même à 20), on touche un prénom pour changer.
   Par défaut : ton profil (ou celui du groupe si tu regardes sans jouer). */
function compareHTML(qi, lg, rows, meId, title){
  const themes = themesOf(qi, lg); if(!themes.length || !rows.length) return "";
  const tot = st => { const t = Object.keys(st).reduce((a, k) => [a[0] + st[k][0], a[1] + st[k][1]], [0, 0]); return Math.round(100 * t[0] / Math.max(1, t[1])); };
  const sr = seriesOf(rows, qi, lg), avg = avgSeries(rows, qi, lg);
  const all = sr.map(x => ({ n: x.name, v: themes.map(t => x.pc(t)), p: tot(x.st), me: x.id != null && x.id === meId })).concat([{ n: avg.name, v: themes.map(t => avg.pc(t)), p: tot(avg.st), g: 1 }]);
  const mi = all.findIndex(x => x.me), sel = mi >= 0 ? mi : all.length - 1;
  return '<div class="field pu-prof" data-prof="' + esc(JSON.stringify({ t: themes, a: all, s: sel })) + '"><span class="eyebrow">' + esc(title || tr("Profils par thème", "Profiles by theme")) + "</span>" +
    '<div class="pu-who"></div><div class="pu-plot"></div>' +
    '<p class="sm" style="margin:0;text-align:center">' + tr("Touche un prénom pour voir son profil.", "Tap a name to see their profile.") + "</p>" +
    '<div class="pu-cmp">' + all.map((x, i) => '<button type="button" data-pi="' + i + '"' + (x.g ? ' class="g"' : "") + ">" + esc(x.me ? tr("Toi", "You") : x.n) + "</button>").join("") + "</div>" +
    '<ul class="pu-stats"></ul></div>';
}
function bindProfile(r){
  r.querySelectorAll("[data-prof]").forEach(box => {
    let d; try{ d = JSON.parse(box.dataset.prof); }catch(e){ return; }
    const draw = () => {
      const x = d.a[d.s] || d.a[0], ser = [{ name: x.n, c: "var(--acc)", pc: t => x.v[d.t.indexOf(t)] || 0 }];
      box.querySelector(".pu-who").textContent = x.me ? tr("Ton profil", "Your profile") : x.g ? tr("Profil moyen du groupe", "Group average") : tr("Profil de ", "Profile: ") + x.n;
      box.querySelector(".pu-plot").innerHTML = d.t.length >= 3 ? radarSVG(d.t, ser) : barsHTML(d.t, ser[0]);
      box.querySelector(".pu-stats").innerHTML = "<li>" + tr("Réponses positives", "“Yes” answers") + " <b>" + pct(x.p) + "</b></li>" + d.t.map((t, i) => "<li>" + esc(SHORT[t] || t) + " <b>" + pct(x.v[i] || 0) + "</b></li>").join("");
      box.querySelectorAll("[data-pi]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.pi === d.s));
    };
    box.querySelectorAll("[data-pi]").forEach(b => b.addEventListener("click", () => { d.s = +b.dataset.pi; buzz(6); draw(); }));
    draw();
  });
}
function seriesOf(rows, qi, lg){ return rows.map((r, i) => { const st = profile(qi, r.a, lg); return { name: r.name, st, pc: pcOf(st), c: PAL[i % PAL.length], id: r.id }; }); }
function avgSeries(rows, qi, lg){
  const sum = {}; rows.forEach(r => { const st = profile(qi, r.a, lg); Object.keys(st).forEach(k => { const o = sum[k] = sum[k] || [0, 0]; o[0] += st[k][0]; o[1] += st[k][1]; }); });
  return { name: tr("Le groupe", "The group"), st: sum, pc: pcOf(sum), c: "var(--acc)" };
}

// Gages de fin de test : une gorgée par tranche de 5 « oui », le moins pur boit, le plus pur distribue.
function puGages(rows, tw){
  const out = [], sc = rows.map(r => ({ id: r.id, p: score(r.a, tw), y: (String(r.a).match(/1/g) || []).length }));
  if(sc.length > 1){
    const mx = Math.max.apply(null, sc.map(r => r.p)), mn = Math.min.apply(null, sc.map(r => r.p));
    if(mx !== mn){ sc.filter(r => r.p === mx).forEach(r => out.push({ id: r.id, ev: "pur" })); sc.filter(r => r.p === mn).forEach(r => out.push({ id: r.id, ev: "impur" })); }
  }
  return out;
}
function hsh(x){ let h = 7; String(x).split("").forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; }
const AW = {
  pure: [tr("Le plus pur", "The purest"), tr("L'ange de la bande", "The group's angel"), tr("Casier vierge", "Spotless record")],
  demon: [tr("Le démon de la bande", "The group's demon"), tr("Le diable en personne", "The devil in person"), tr("Mauvaise influence officielle", "Official bad influence")],
  solo: [tr("Seul au monde", "All alone"), tr("L'aveu en solitaire", "The lone confession"), tr("Le seul à avoir osé", "The only one who dared")],
  trap: [tr("Tombé dans tous les pièges", "Fell for every trap"), tr("Roi des questions pièges", "Trick question champion"), tr("Aimant à embrouilles", "Trouble magnet")]
};
const aw = (k, seed) => AW[k][(+seed || 0) % AW[k].length];
const CSS = '<style>.pu-q{font-size:28px; font-weight:800; line-height:1.2; overflow-wrap:anywhere}' +
  '.pu-bar{height:8px; border-radius:99px; background:var(--soft); overflow:hidden}.pu-bar i{display:block; height:100%; background:var(--acc); transition:width .2s}' +
  '.pu-yn{display:grid; grid-template-columns:1fr 1fr; gap:10px}.pu-yn .btn{min-height:84px; font-size:22px}' +
  '.pu-score{font-family:var(--f-hand); font-weight:700; font-size:110px; line-height:.9; color:var(--acc)}' +
  '.pu-rank{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}' +
  '.pu-rank li{display:flex; align-items:center; gap:12px; background:var(--card); border:1.5px solid var(--line); border-radius:14px; padding:10px 14px}' +
  '.pu-rank .p{font-family:var(--f-hand); font-weight:700; font-size:34px; color:var(--acc); min-width:2.6em; text-align:right; font-variant-numeric:tabular-nums}' +
  '.pu-rank .n{flex:1; min-width:0; display:flex; flex-direction:column}.pu-rank .n b{font-size:17px}' +
  '.pu-av{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}' +
  '.pu-av li{background:var(--card); border:1.5px solid var(--line); border-radius:12px; padding:10px 14px; display:flex; flex-direction:column; gap:4px}' +
  '.pu-av .c{font-weight:800; color:var(--acc)}.pu-av li.tw{border-style:dashed; border-color:var(--acc)}.pu-tw{font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--acc)}' +
  '.pu-sus{min-height:40px; padding:6px 14px; font-size:14px; align-self:flex-start}' +
  '.pu-prof{background:var(--card); border:1.5px solid var(--line); border-radius:18px; padding:12px}.pu-radar{width:100%; max-width:380px; height:auto; display:block; margin:0 auto; overflow:visible}' +
  '.pu-leg{display:flex; flex-wrap:wrap; gap:6px 12px; justify-content:center; font-size:13px; font-weight:700}.pu-leg i{display:inline-block; width:10px; height:10px; border-radius:99px; margin-right:5px; vertical-align:-1px}' +
  '.pu-stats{list-style:none; margin:4px 0 0; padding:0; display:flex; flex-wrap:wrap; gap:6px}.pu-stats li{background:var(--soft); border-radius:99px; padding:5px 11px; font-size:13px; color:var(--muted)}.pu-stats b{color:var(--ink); margin-left:3px}' +
  '.pu-who{text-align:center; font-weight:800; font-size:17px}' +
  '.pu-cmp{display:flex; flex-wrap:wrap; gap:6px; justify-content:center}.pu-cmp button{display:inline-flex; align-items:center; gap:6px; min-height:34px; padding:0 12px; border-radius:99px; border:1.5px solid var(--line); background:transparent; color:var(--muted); font-weight:700; font-size:13px}' +
  '.pu-cmp button[aria-pressed="true"]{color:var(--ink); border-color:var(--ink)}.pu-cmp button.g{font-style:italic}.pu-cmp i{width:10px; height:10px; border-radius:99px; border:1.5px solid var(--line)}' +
  '.pu-bars{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}.pu-bars li{display:grid; grid-template-columns:80px 1fr 48px; gap:10px; align-items:center; font-weight:700; font-size:14px}.pu-bars b{text-align:right}</style>';

/* Questionnaire réutilisé en réseau et sur un seul téléphone */
function runQuiz(root, key, qi, onDone, header, note, tw, lg){
  const tm = twMap(tw), en = LG(lg) === "en";
  const saved = (store().puRun || {});
  let st = saved.key === key ? { i: saved.i || 0, a: String(saved.a || "") } : { i: 0, a: "" };
  const save = () => persist({ puRun: { key, i: st.i, a: st.a } });
  const draw = () => {
    if(st.i >= qi.length){ persist({ puRun: null }); onDone(st.a); return; }
    const q = ALL(lg)[qi[st.i]] || { q: "…" };
    screen(root, "q" + key + "|" + st.i, CSS + (header || "") + SB.u.twistHTML(SB.u.byTwist(TW, tm[st.i]), TWL) + '<div class="pu-bar"><i style="width:' + Math.round(100 * st.i / qi.length) + '%"></i></div>' +
      '<span class="eyebrow">Question ' + (st.i + 1) + " / " + qi.length + "</span>" +
      '<div class="card acc"><span class="eyebrow">' + pre(lg) + '</span><div class="pu-q">… ' + esc(q.q) + (en ? "?" : " ?") + "</div></div>" +
      '<p class="sm">' + esc(note || tr("Réponds honnêtement. Les autres ne verront que ton score et le nombre de « oui » par question, sauf si l'hôte a désactivé l'anonymat.", "Answer honestly. The others will only see your score and how many said “yes” to each question, unless the host turned off anonymity.")) + "</p>" +
      dock('<div class="pu-yn"><button class="btn ghost" type="button" data-a="0">' + tr("Jamais", "Never") + '</button><button class="btn acc" type="button" data-a="1">' + tr("Oui, déjà", "Yes, I have") + "</button></div>" +
        (st.i ? '<button class="link" type="button" data-back style="align-self:center">' + tr("Revenir à la question précédente", "Back to the previous question") + "</button>" : "")), r => {
      r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { buzz(8); st.a = st.a.slice(0, st.i) + b.dataset.a; st.i++; save(); draw(); }));
      const bk = r.querySelector("[data-back]"); if(bk) bk.addEventListener("click", () => { st.i = Math.max(0, st.i - 1); st.a = st.a.slice(0, st.i); save(); draw(); });
    });
  };
  draw();
}
function rankHTML(rows, seed){
  return '<ul class="pu-rank">' + rows.map(r => { const t = title(r.p, seed); return '<li><span class="p">' + r.p + '%</span><span class="n"><b>' + esc(r.name) + '</b><span class="sm">' + esc(t[0]) + "</span></span></li>"; }).join("") + "</ul>";
}
function aveuxHTML(qi, rows, anon, total, tw, key, lg){
  const tm = twMap(tw);
  const items = qi.map((q, k) => ({ q, k, t: tm[k] || "", yes: rows.filter(r => r.a[k] === "1") })).filter(x => x.yes.length || x.t === "suspense")
    .sort((a, b) => (b.t ? 1 : 0) - (a.t ? 1 : 0) || b.yes.length - a.yes.length);
  if(!items.length) return '<p class="note-box">' + tr("Personne n'a répondu oui à quoi que ce soit. Bande d'anges… ou de menteurs.", "Nobody said yes to anything. A bunch of angels… or liars.") + "</p>";
  return '<ul class="pu-av">' + items.map(x => {
    const t = SB.u.byTwist(TW, x.t), cnt = tr(x.yes.length + " / " + total + " oui", x.yes.length + " / " + total + " said yes");
    const names = esc(x.yes.map(r => r.name).join(", "));
    const teller = x.t === "story" && x.yes.length ? x.yes[hsh(key + "|" + x.k) % x.yes.length].name : "";
    return '<li' + (t ? ' class="tw"' : "") + ">" + (t ? '<span class="pu-tw">' + esc(t.name) + "</span>" : "") + "<span>" + esc(qfull(lg, (ALL(lg)[x.q] || { q: "…" }).q)) + "</span>" +
      (x.t === "suspense" ? '<button class="btn ghost pu-sus" type="button" data-sus="' + esc(cnt) + '">' + tr("Pariez… puis révélez", "Place your bets… then reveal") + "</button>" : '<span class="c">' + cnt + "</span>") +
      (teller ? '<span class="sm">' + tr("Au tour de <b>" + esc(teller) + "</b> de raconter.", "<b>" + esc(teller) + "</b>, you're telling this one.") + "</span>" : "") +
      (x.t === "reveal" ? '<span class="sm">' + tr("Démasqués : ", "Unmasked: ") + names + "</span>" : anon || x.t === "suspense" ? "" : '<span class="sm">' + names + "</span>") + "</li>";
  }).join("") + "</ul>";
}
function bindAveux(r){ r.querySelectorAll("[data-sus]").forEach(b => b.addEventListener("click", () => { const sp = document.createElement("span"); sp.className = "c"; sp.textContent = b.dataset.sus; b.replaceWith(sp); if(SB.fx) SB.fx.pop(sp); buzz(20); })); }
// Trophées : le plus pur, le démon, l'aveu solitaire, les questions piège.
function awardsHTML(rows, qi, tw, seed){
  if(rows.length < 2) return "";
  const tm = twMap(tw), solo = {}, trap = {};
  qi.forEach((q, k) => {
    const yes = rows.filter(r => r.a[k] === "1");
    if(yes.length === 1 && rows.length > 2) solo[yes[0].name] = (solo[yes[0].name] || 0) + 1;
    if(tm[k]) yes.forEach(r => { trap[r.name] = (trap[r.name] || 0) + 1; });
  });
  const best = m => Object.keys(m).sort((a, b) => m[b] - m[a])[0];
  const so = best(solo), tp = best(trap);
  return '<div class="card acc"><span class="eyebrow">' + esc(aw("pure", seed)) + '</span><div class="big">' + esc(rows[0].name) + " · " + rows[0].p + '%</div><span class="eyebrow">' + esc(aw("demon", seed)) + '</span><div class="big">' + esc(rows[rows.length - 1].name) + " · " + rows[rows.length - 1].p + "%</div></div>" +
    (so ? '<div class="card"><span class="eyebrow">' + esc(aw("solo", seed)) + '</span><div class="big">' + esc(so) + '</div><span class="sm">' + tr("Seul à dire oui à " + solo[so] + " question" + (solo[so] > 1 ? "s" : ""), "The only one to say yes to " + solo[so] + " question" + (solo[so] > 1 ? "s" : "")) + "</span></div>" : "") +
    (tp ? '<div class="card"><span class="eyebrow">' + esc(aw("trap", seed)) + '</span><div class="big">' + esc(tp) + '</div><span class="sm">' + tr(trap[tp] + " « oui » sur les coups de théâtre", "Said yes to " + trap[tp] + " plot twist" + (trap[tp] > 1 ? "s" : "")) + "</span></div>" : "");
}

SB.register({
  id: "purete", name: tr("Test de pureté", "Purity Test"), glyph: tr("99 %", "99%"), pitch: tr("Un test secret et sans filtre : ange ou démon ?", "A secret, no-filter test: angel or demon?"), hot: true,
  accent: { light: "#ff8fc8", dark: "#ff8fc8" },
  tag: tr("Un questionnaire secret et sans filtre. Qui est l'ange de la bande, et qui est le démon ?", "A secret, no-filter questionnaire. Who's the angel of the group, and who's the demon?"),
  min: 1, max: 20,
  gagesEnd: false,
  gages: [
    { ev: "impur", label: tr("Le moins pur de la partie", "The least pure"), kind: "boit", n: 2 },
    { ev: "pur", label: tr("Le plus pur de la partie", "The purest"), kind: "distribue", n: 3 }
  ],
  rules: [
    tr("Chacun répond en secret, sur son téléphone, à une série de « As-tu déjà… ? » 100 % adultes, tirés au hasard dans les thèmes choisis : soirées, sexe, interdits, cœur, boulot, voyages, moments gênants, drogues, hygiène, hardcore.", "Everyone secretly answers, on their own phone, a series of 100% adult “Have you ever…?” questions, drawn at random from the chosen themes: parties, sex, off-limits, love, work, travel, cringe moments, drugs, hygiene, hardcore."),
    tr("Chaque test est différent : les questions déjà posées sur ce téléphone reviennent en dernier.", "Every test is different: questions already asked on this phone come up last."),
    tr("Ton score de pureté : 100 % si tu n'as rien fait, et ça baisse à chaque « oui ».", "Your purity score: 100% if you've done nothing, and it drops with every “yes”."),
    tr("Quand tout le monde a fini, le classement tombe, de l'ange au démon.", "Once everyone's done, the ranking drops, from angel to demon."),
    tr("Puis les aveux : combien ont dit oui à chaque question, avec ou sans les noms selon le réglage de l'hôte.", "Then the confessions: how many said yes to each question, with or without names depending on the host's setting."),
    tr("Coups de théâtre : quelques questions sont piégées (compte double ou triple, joker, question en or, révélation des noms, « Raconte ! », suspense).", "Plot twists: a few questions are rigged (double or triple points, free pass, golden question, names revealed, “Spill it!”, suspense).")
  ],
  options: [
    { id: "n", label: tr("Longueur", "Length"), type: "seg", def: 40, values: [{ v: 25, label: "25" }, { v: 40, label: "40" }, { v: 60, label: "60" }, { v: 0, label: tr("Tout", "All") }] },
    { id: "packs", label: tr("Thèmes", "Themes"), type: "multi", def: PACKS.map(p => p.v), values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "anon", label: tr("Aveux", "Confessions"), type: "toggle", text: tr("Aveux anonymes", "Anonymous confessions"), desc: tr("Sinon, on voit qui a dit oui à quoi", "Otherwise, everyone sees who said yes to what"), def: true },
    { id: "twists", label: tr("Rebondissements", "Twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Des questions piégées glissées dans le test", "Rigged questions slipped into the test"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un thème.", "Pick at least one theme."));
    const lg = SB.lang(), qi = pickQuestions(o.packs, o.n, lg);
    return { phase: "play", lg, qi, anon: o.anon !== false, res: [], tw: placeTwists(qi.length, o.twists !== false, ctx.ids.length), seed: Math.floor(Math.random() * 999) };
  },
  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    const n = A(s.qi).length, live = ctx.ids.filter(id => ctx.here(id));
    if(!live.length || !live.every(id => { const i = ctx.input(id); return i && typeof i.a === "string" && i.a.length === n; })) return;
    const res = live.map(id => [id, ctx.input(id).a.replace(/[^01]/g, "0")]);
    ctx.gage(puGages(res.map(r => ({ id: r[0], a: r[1] })), s.tw), s.k);
    ctx.set({ phase: "res", res });
  },
  render(ctx, root){
    const s = ctx.s, qi = A(s.qi), lg = s.lg || "fr";
    if(s.phase === "play"){
      const mine = ctx.mine();
      if(mine && typeof mine.a === "string" && mine.a.length === qi.length){
        screen(root, "w" + s.k, CSS + '<span class="eyebrow">' + tr("Ton score", "Your score") + '</span><div class="pu-score">' + score(mine.a, s.tw) + '%</div><p class="big">' + esc(title(score(mine.a, s.tw), s.seed)[0]) + "</p>" +
          '<p class="howto">' + tr("Garde-le pour toi. Le classement s'affiche quand tout le monde a fini.", "Keep it to yourself. The ranking shows up once everyone's done.") + "</p>" +
          profileHTML(qi, lg, seriesOf([{ name: "", a: mine.a }], qi, lg), 0) + dock('<p class="wait" data-wait></p>'));
        const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && typeof i.a === "string" && i.a.length === qi.length; }).length;
        txt(root, "[data-wait]", tr(done + " / " + live.length + " ont terminé", done + " / " + live.length + " done"));
      } else {
        if(root.dataset.quiz !== s.k){ root.dataset.quiz = s.k; root.dataset.key = ""; runQuiz(root, s.k, qi, a => ctx.send({ a }), "", "", s.tw, lg); }
      }
    } else if(s.phase === "res"){
      root.dataset.quiz = "";
      const rows = A(s.res).map(A).map(r => ({ id: r[0], name: ctx.name(r[0]), a: String(r[1] || ""), p: score(r[1], s.tw) })).sort((a, b) => b.p - a.p);
      const me = rows.find(r => r.id === ctx.me);
      screen(root, "res" + s.k + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Classement de pureté", "Purity ranking") + "</span>" +
        awardsHTML(rows, qi, s.tw, s.seed) +
        rankHTML(rows, s.seed) + (me ? '<p class="appre">' + tr("« " + esc(title(me.p, s.seed)[1]) + " »", "“" + esc(title(me.p, s.seed)[1]) + "”") + "</p>" : "") +
        (function(){
          if(s.anon){ return me ? profileHTML(qi, lg, seriesOf([me], qi, lg), 0) : profileHTML(qi, lg, [avgSeries(rows, qi, lg)], 0, tr("Profil du groupe", "Group profile")); }
          return compareHTML(qi, lg, rows, ctx.me);
        })() +
        '<div class="field"><span class="eyebrow">' + tr("Les aveux", "Confessions") + (s.anon ? tr(" (anonymes)", " (anonymous)") : "") + "</span>" + aveuxHTML(qi, rows, s.anon, rows.length, s.tw, s.k, lg) + "</div>" +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>") : dock('<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>")), r => {
        bindAveux(r); bindProfile(r);
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const rr = A(c.s.res).map(A).map(x => ({ id: x[0], n: c.name(x[0]), p: score(x[1], c.s.tw) })).sort((a, b2) => b2.p - a.p);
          c.end({ title: rr.length ? tr(aw("pure", c.s.seed) + " : " + rr[0].n + " (" + rr[0].p + " %)", aw("pure", c.s.seed) + ": " + rr[0].n + " (" + rr[0].p + "%)") : tr("Test de pureté", "Purity Test"), lines: rr.map(x => x.n + " · " + pct(x.p) + " · " + title(x.p, c.s.seed)[0]),
            win: rr.length > 1 ? rr.filter(x => x.p === rr[0].p).map(x => x.id) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 1, max: 12 },
    start(root, api){
      const names = api.names, st = store();
      let L = { phase: "setup", packs: A(st.puPacks).filter(v => PACKS.some(p => p.v === v)), n: [25, 40, 60, 0].indexOf(st.puN) >= 0 ? st.puN : 40, anon: st.puAnon !== false, tw: st.puTw !== false, twl: [], seed: 0, qi: [], p: 0, ans: [], key: "" };
      if(!L.packs.length) L.packs = PACKS.map(p => p.v);
      if(!st.puHc){ if(L.packs.indexOf("hardcore") < 0) L.packs.push("hardcore"); persist({ puHc: true, puPacks: L.packs }); } // nouveau thème : coché une fois pour tout le monde
      if(!st.puV2){ ["drogues", "crado"].forEach(v => { if(L.packs.indexOf(v) < 0) L.packs.push(v); }); persist({ puV2: true, puPacks: L.packs }); }
      const lg = SB.lang(), cnt = () => { const k = SB.okPacks(L.packs, PACKS); return ALL(lg).filter(x => k.indexOf(x.pack) >= 0).length; };
      const go = () => {
        if(L.phase === "setup"){
          screen(root, "setup" + JSON.stringify([L.n, L.anon, L.tw, L.packs]), CSS + '<p class="howto">' + tr("Le téléphone passe de main en main. Chacun répond seul, sans regarder les réponses des autres.", "The phone goes from hand to hand. Everyone answers alone, without looking at anyone else's answers.") + "</p>" +
            '<p class="sm">' + tr(cnt() + (SB.hard() ? " questions 18+" : " questions") + " dans les thèmes choisis. Celles déjà posées sur ce téléphone reviennent en dernier.", cnt() + (SB.hard() ? " 18+" : "") + " questions in the chosen themes. The ones already asked on this phone come up last.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Longueur", "Length") + '</span><div class="seg">' + [25, 40, 60, 0].map(n => '<button type="button" data-n="' + n + '" aria-pressed="' + (n === L.n) + '">' + (n || tr("Tout", "All")) + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Thèmes", "Themes") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (L.packs.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Réglages", "Settings") + '</span><div class="packs">' +
            (names.length > 1 ? '<button type="button" class="pack" data-an aria-pressed="' + L.anon + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Aveux anonymes", "Anonymous confessions") + '</span><span class="ds">' + tr("Sinon, on voit qui a dit oui à quoi", "Otherwise, everyone sees who said yes to what") + "</span></span></button>" : "") +
            '<button type="button" class="pack" data-tw aria-pressed="' + L.tw + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Des questions piégées glissées dans le test", "Rigged questions slipped into the test") + "</span></span></button></div></div>" +
            dock('<button class="btn acc" type="button" data-go>' + tr("Commencer le test", "Start the test") + "</button>"), r => {
            r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { L.n = +b.dataset.n; persist({ puN: L.n }); go(); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const i = L.packs.indexOf(b.dataset.k); if(i >= 0) L.packs.splice(i, 1); else L.packs.push(b.dataset.k); persist({ puPacks: L.packs }); go(); }));
            const an = r.querySelector("[data-an]"); if(an) an.addEventListener("click", () => { L.anon = !L.anon; persist({ puAnon: L.anon }); go(); });
            r.querySelector("[data-tw]").addEventListener("click", () => { L.tw = !L.tw; persist({ puTw: L.tw }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!L.packs.length){ SB.u.toast(tr("Choisis au moins un thème", "Pick at least one theme")); return; }
              L.qi = pickQuestions(SB.okPacks(L.packs, PACKS), L.n, lg); L.twl = placeTwists(L.qi.length, L.tw, names.length); L.seed = Math.floor(Math.random() * 999);
              L.key = "loc" + Math.random().toString(36).slice(2); L.p = 0; L.ans = []; L.phase = names.length > 1 ? "pass" : "quiz"; go();
            });
          });
        } else if(L.phase === "pass"){
          screen(root, "pass" + L.p, '<div class="pass"><span class="eyebrow">' + tr("Joueur ", "Player ") + (L.p + 1) + " / " + names.length + '</span><div class="who">' + esc(names[L.p]) + "</div><p>" + tr("Prends le téléphone et réponds seul. Les autres, on ne regarde pas.", "Take the phone and answer alone. Everyone else, no peeking.") + "</p></div>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi, je commence", "It's me, let's go") + "</button>"), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "quiz"; go(); }); });
        } else if(L.phase === "quiz"){
          runQuiz(root, L.key + "-" + L.p, L.qi, a => {
            L.ans.push(a);
            if(names.length > 1 && L.p < names.length - 1){ L.phase = "done1"; } else { L.phase = "res"; if(api.gage) api.gage(puGages(names.map((n, i) => ({ id: n, a: L.ans[i] || "" })), L.twl), "pu" + L.key); }
            go();
          }, '<span class="eyebrow">' + esc(names[L.p]) + "</span>", tr("Réponds honnêtement, personne ne regarde.", "Answer honestly, nobody's looking."), L.twl, lg);
        } else if(L.phase === "done1"){
          screen(root, "d1" + L.p, '<div class="pass"><span class="eyebrow">' + tr("C'est noté", "Got it") + '</span><div class="who">' + tr("Merci ", "Thanks, ") + esc(names[L.p]) + "</div><p>" + tr("Ton score restera secret jusqu'à la fin. Passe le téléphone au suivant.", "Your score stays secret until the end. Pass the phone to the next player.") + "</p></div>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("Joueur suivant", "Next player") + "</button>"), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.p++; L.phase = "pass"; go(); }); });
        } else if(L.phase === "res"){
          const rows = names.map((n, i) => ({ name: n, a: L.ans[i] || "", p: score(L.ans[i], L.twl) })).sort((a, b) => b.p - a.p);
          const solo = names.length === 1;
          if(!solo) api.win(rows.filter(x => x.p === rows[0].p).map(x => x.name));
          screen(root, "res" + L.key, CSS + (solo ? '<span class="eyebrow">' + tr("Ton score de pureté", "Your purity score") + '</span><div class="pu-score">' + rows[0].p + '%</div><p class="big">' + esc(title(rows[0].p, L.seed)[0]) + '</p><p class="appre">' + tr("« " + esc(title(rows[0].p, L.seed)[1]) + " »", "“" + esc(title(rows[0].p, L.seed)[1]) + "”") + "</p>" + profileHTML(L.qi, lg, seriesOf(rows, L.qi, lg), 0)
            : '<span class="eyebrow">' + tr("Classement de pureté", "Purity ranking") + "</span>" + awardsHTML(rows, L.qi, L.twl, L.seed) + rankHTML(rows, L.seed) +
              (L.anon ? profileHTML(L.qi, lg, [avgSeries(rows, L.qi, lg)], 0, tr("Profil du groupe", "Group profile")) : compareHTML(L.qi, lg, rows, null)) + '<div class="field"><span class="eyebrow">' + tr("Les aveux", "Confessions") + (L.anon ? tr(" (anonymes)", " (anonymous)") : "") + "</span>" + aveuxHTML(L.qi, rows, L.anon, rows.length, L.twl, L.key, lg) + "</div>") +
            dock('<button class="btn acc" type="button" data-a>' + tr("Refaire un test", "Take another test") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
            bindAveux(r); bindProfile(r);
            r.querySelector("[data-a]").addEventListener("click", api.again);
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go();
    }
  }
});
})();
