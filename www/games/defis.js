/* Défis en chaîne — des cartes qui citent les joueurs par leur prénom : défis, votes, mini-jeux
   et règles qui durent plusieurs cartes. Avec gorgées ou sans alcool (gages). */
(function(){
"use strict";
const { esc, A, shuffle, screen, store, persist, dock } = SB.u;

/* {A} {B} {C} : joueurs tirés au hasard. {T2} : « 2 gorgées » ou « 2 gages ». {CS} : « un cul sec » ou « un gage XXL ». */
const CARDS = [
  "{A}, cite 5 marques de bière en 10 secondes, sinon {T3} pour toi.","Ceux qui ont déjà dormi en cours ou au travail : {T2}.",
  "{A} distribue {T3} à la personne qui a le plus de batterie.","{A} contre {B} : pierre-feuille-ciseaux. Le perdant prend {T2}.",
  "Le dernier à toucher son nez prend {T2}.","{A}, imite quelqu'un de la soirée. Si personne ne trouve en 10 secondes : {T2} pour toi.",
  "Vote : qui est le plus radin ? À 3, tout le monde pointe quelqu'un du doigt. Le plus désigné prend {T2}.",
  "Jeu : {A} commence, chacun cite un pays d'Europe à tour de rôle. Le premier qui sèche ou répète prend {T3}.",
  "{A}, fais un compliment sincère à {B}, ou {T2}.","Ceux qui ont moins de 20 % de batterie : {T1}.",
  "{A} et {B} : concours de compliments, chacun son tour. Le premier qui sèche prend {T2}.","Ceux qui ont une appli de rencontre sur leur téléphone : {T2}.",
  "{A}, raconte ton pire râteau en 30 secondes, ou {T3}.","Le plus jeune de la soirée distribue {T2}.","Le plus âgé de la soirée prend {T2}.",
  "{A}, fais deviner un film en le mimant. Si personne ne trouve : {T2} pour toi.","Ceux qui ont déjà menti sur leur âge : {T2}.",
  "{A}, montre la dernière photo de ta galerie, ou {T3}.","Tous ceux qui portent du noir : {T1}.",
  "{A}, chante le refrain d'une chanson choisie par {B}, ou {T3}.",
  "Ni oui ni non : {B} pose des questions à {A} pendant 30 secondes. Si {A} dit oui ou non : {T3}.",
  "Les célibataires prennent {T2}. Les couples, {T1} chacun.","{A}, devine la couleur des chaussettes de {B}. Raté : {T2}.",
  "Ceux qui ont déjà vomi en soirée : {T2}.","{A}, fais 10 pompes ou prends {T3}.","Le premier à lever la main distribue {T3}.",
  "{A} raconte une anecdote, vraie ou fausse. Les autres votent. Ceux qui se trompent : {T1}.",
  "Ceux qui ont déjà oublié l'anniversaire d'un proche : {T2}.","{A} et {B} échangent de place jusqu'à la fin de la partie.",
  "Jeu : {A} commence, chacun cite une marque de voiture. Le premier qui sèche ou répète prend {T3}.",
  "Tout le monde lit à voix haute son dernier message envoyé. Ceux qui refusent : {T3}.",
  "{A}, fais rire {B} en moins de 20 secondes. Réussi : {B} prend {T2}. Raté : {T2} pour toi.",
  "Celui qui a le plus d'abonnés sur Instagram distribue {T3}.","Ceux qui ont déjà stalké un ex : {T2}.",
  "{A}, cite 3 joueurs de foot en 5 secondes, ou {T2}.","{A}, appelle quelqu'un de ton répertoire au hasard et dis-lui « je pense à toi ». Sinon : {CS}.",
  "Le dernier arrivé à la soirée prend {T2}.","{A}, mime ton animal préféré. Si personne ne trouve : {T2} pour toi.",
  "Les gauchers prennent {T1}. Les droitiers distribuent {T1}.","Ceux qui ont déjà pleuré devant un Disney : {T1}.",
  "{A} contre {B} : le premier qui cite 3 capitales africaines gagne. Le perdant prend {T2}.","Celui qui a le prénom le plus long prend {T2}.",
  "{A}, choisis : soit tu prends {T2}, soit {B} prend {T4}.","Tout le monde ferme les yeux. {A} touche l'épaule de quelqu'un, qui prend {T2}.",
  "Ceux qui ont déjà fait semblant d'être malades pour sécher : {T2}.","{A}, récite l'alphabet à l'envers, de Z à P. Une erreur : {T3}.",
  "{A}, si tu devais sortir avec quelqu'un d'ici, ce serait qui ? Réponds ou prends {T3}.","{A} fait une grimace. Le premier qui rit prend {T2}.",
  "{A}, prends un selfie de groupe en 10 secondes, sinon {T2} pour toi.","{A}, raconte ta pire honte. Si le groupe trouve que ce n'est pas si grave : {T2}.",
  "Je n'ai jamais : {A} commence, chacun dit une chose qu'il n'a jamais faite. Ceux qui l'ont faite prennent {T1}. Un tour complet.",
  "Ceux qui ont déjà eu une amende : {T2}.","{A} parle à {B} uniquement en chantant jusqu'à la prochaine carte, ou {T2}.",
  "Vote : qui s'endormira en premier ce soir ? Le plus désigné prend {T2}.","{A}, fais un compliment à chaque joueur, ou {T3}.",
  "Les fans de pizza à l'ananas : {T2}. Oui, c'est une punition.","{A}, devine le deuxième prénom de {B}. Raté : {T2}. Trouvé : {B} prend {T2}.",
  "{A} et {B} trinquent et prennent {T1} chacun en se regardant dans les yeux.","Celui qui a le moins dormi la nuit dernière distribue {T2}.",
  "{A}, révèle ton dernier achat en ligne, ou {T2}.","Ceux qui ont des chaussettes dépareillées : {T1}.",
  "{A}, fais une déclaration d'amour à {B} en 15 secondes. Si c'est réussi, distribue {T3}.",
  "Jeu : comptez jusqu'à 21 chacun votre tour en remplaçant les multiples de 3 par « bip ». {A} commence. Le premier qui se trompe : {T3}.",
  "{A}, imite {B}. Si {B} trouve ça ressemblant, distribue {T2}. Sinon : {T2} pour toi.","Ceux qui ont déjà dragué sur internet : {T1}.",
  "{A} prend {T1}, {B} {T2} et {C} {T3}. Pas de raison, c'est la vie.","{A}, cite 3 films d'horreur en 10 secondes, ou {T2}.",
  "Ceux qui portent des lunettes distribuent {T2}.","{A} donne son téléphone déverrouillé à {B} pendant 30 secondes. Refuser : {CS}.",
  "Ceux qui ont déjà raté un avion ou un train : {T2}.","{A}, cite 5 mots qui finissent en « -tion » en 10 secondes. Échec : {T2}.",
  "{A} contre {B} : bras de fer. Le perdant prend {T3}.","Celui qui a visité le plus de pays distribue {T3}.",
  "{A}, cite trois de tes qualités sans rire. Si tu bloques : {T2}.","Les voisins de gauche et de droite de {A} prennent {T1}.",
  "{A} invente une règle pour le reste de la soirée. Ceux qui l'enfreignent : {T1}.","Le premier qui touche le sol distribue {T3}.",
  "{A}, montre ton fond d'écran. Si tu es dessus : {T2}.","Ceux qui ont un tatouage : {T1} par tatouage.",
  "{A}, quel est le pire défaut de {B} ? Réponds honnêtement ou {T3}.","Les joueurs nés en été prennent {T1}. Ceux nés en hiver distribuent {T1}.",
  "{A}, cite 4 personnages des Simpson en 10 secondes, ou {T2}.","Ceux qui ont déjà envoyé un message à la mauvaise personne : {T2}.",
  "{A}, présente la météo de la soirée comme à la télé. Si le groupe trouve ça bof : {T2}.","{A} et {B} : le premier qui cligne des yeux prend {T2}.",
  "Vote : qui a la pire playlist ? Le plus désigné prend {T2} et ne choisit plus la musique.","{A}, raconte ton plus gros mensonge à tes parents, ou {T3}.",
  "Ceux qui ont déjà été virés d'un boulot : {T2}.","{A}, fais le tour de la pièce à cloche-pied, ou {T2}.",
  "Jeu : {A} commence, chacun cite un fruit. Le premier qui sèche ou répète prend {T2}.","{A}, mets ton téléphone au milieu jusqu'à la prochaine carte. S'il sonne ou vibre : {T3}.",
  "Le joueur qui a le plus d'ex distribue {T3}.","{A}, devine l'âge de {B} à un an près. Raté : {T2}.",
  "Duel : {A} contre {B}, le premier qui cite 5 pays d'Asie gagne. Le perdant prend {T2}.","Duel : {A} et {B} gardent leur sérieux pendant que le groupe essaie de les faire rire. Le premier qui craque prend {T2}.",
  "Duel : {A} contre {B}, à qui tiendra le plus longtemps sur un pied. Le perdant prend {T2}.","Duel : {A} et {B} chantent le même refrain. Le groupe désigne le pire, qui prend {T3}.",
  "Duel : {A} contre {B}, le premier à trouver un objet rouge dans la pièce gagne. Le perdant prend {T2}.","Duel : {A} et {B} racontent chacun une blague. Le groupe vote : le moins drôle prend {T2}.",
  "Duel : {A} contre {B}, chacun cite un animal à tour de rôle. Le premier qui sèche prend {T2}.","Duel : {A} et {B} imitent un présentateur télé. Le groupe vote : le perdant prend {T2}.",
  "Duel : {A} contre {B}, bataille de pouces. Le perdant prend {T2}.","Duel : {A} et {B} devinent la pointure de {C}. Le plus loin prend {T2}.",
  "Duel : {A} contre {B}, le premier qui trouve 3 mots qui riment avec « chaussette » gagne. Le perdant prend {T2}.","Duel : {A} et {B} répondent en même temps : chat ou chien ? S'ils ne disent pas la même chose : {T1} chacun.",
  "Duel : {A} contre {B}, la meilleure tête de poisson. Le groupe tranche : le perdant prend {T2}.","Duel : {A} et {B} comptent à rebours de 30 à 0 à tour de rôle. Le premier qui se trompe prend {T2}.",
  "Duel : {A} contre {B}, celui qui a le plus de photos dans sa galerie distribue {T3}.","Duel : {A} contre {B}, le premier à toucher un mur gagne. Le perdant prend {T2}.",
  "Confession : {A}, la chanson que tu adores en secret ? Réponds ou {T2}.","Confession : {A}, la dernière fois que tu as menti, c'était à qui ? Réponds ou {T2}.",
  "Confession : {A}, ta pire habitude ? Réponds ou {T2}.","Confession : {A}, qui ici t'a fait la pire première impression ? Réponds ou {T3}.",
  "Confession : {A}, le surnom le plus gênant qu'on t'ait donné ? Réponds ou {T2}.","Confession : {A}, raconte la dernière fois que tu as pleuré, ou {T2}.",
  "Confession : {A}, le métier dont tu rêvais petit ? Si le groupe rit : {T1}.","Ceux qui ont déjà fait semblant de connaître une chanson : {T1}.",
  "Ceux qui ont déjà espionné leurs voisins par la fenêtre : {T2}.","Ceux qui ont déjà relu une conversation entière avec un ex : {T2}.",
  "Ceux qui ont déjà pris un selfie dans un ascenseur : {T1}.","Ceux qui parlent à leur animal comme à un humain : {T1}.",
  "Ceux qui ont déjà fait semblant d'être au téléphone pour éviter quelqu'un : {T2}.","Ceux qui ont déjà mangé le plat d'un colocataire : {T2}.",
  "Vote : qui serait éliminé en premier dans une émission de survie ? Le plus désigné prend {T2}.","Vote : qui a le meilleur style ce soir ? Le plus désigné distribue {T3}.",
  "Vote : qui raconterait le mieux une histoire d'horreur ? Le plus désigné en raconte une en 30 secondes, ou {T2}.","Vote : qui oublie toujours de répondre aux messages ? Le plus désigné prend {T2}.",
  "Jeu : {A} commence, chacun cite un super-héros. Le premier qui sèche ou répète prend {T2}.","Jeu : {A} dit un mot, le suivant enchaîne avec un mot qui commence par la dernière lettre. Le premier qui bloque prend {T2}.",
  "Jeu : {A} commence une histoire, chacun ajoute une phrase. Celui qui bloque ou casse l'histoire prend {T2}.","Jeu : {A} murmure une phrase à son voisin, qui la fait passer jusqu'au dernier. Si elle arrive intacte, {A} distribue {T2}. Sinon, tout le monde prend {T1}.",
  "{A}, parle comme un robot jusqu'à la prochaine carte, ou {T2}.","{A}, fais une publicité de 15 secondes pour la chaussure de {B}. Si le groupe est convaincu, distribue {T2}.",
  "{A}, donne un surnom à chaque joueur. Celui qui proteste prend {T1}.","{A}, devine ce que {B} a mangé à midi. Raté : {T1}.",
  "{A}, fais un discours de mariage pour {B} et {C}, ou {T3}.","{A}, décris {B} en trois mots. Si {B} n'est pas d'accord : {T2} pour toi.",
  "{A}, tiens une cuillère en équilibre sur ton nez 10 secondes, ou {T2}.","Le dernier à avoir envoyé un message prend {T1}.",
  "Celui dont l'anniversaire est le plus proche distribue {T3}.","Ceux qui ont déjà raté leur arrêt de bus ou de métro : {T1}."
];
const RULES = [
  ["Nouvelle règle : interdit de dire « oui » ou « non ». À chaque erreur : {T1}.", "Fin de la règle : vous pouvez de nouveau dire « oui » et « non »."],
  ["{A} devient le maître des questions : quiconque répond à une de ses questions prend {T1}.", "{A} n'est plus le maître des questions."],
  ["{A} et {B} sont liés : quand l'un trinque, l'autre aussi.", "{A} et {B} ne sont plus liés."],
  ["Nouvelle règle : interdit de prononcer un prénom. À chaque erreur : {T1}.", "Fin de la règle : les prénoms sont de nouveau autorisés."],
  ["{A} parle avec un accent anglais. À chaque oubli : {T1}.", "{A} peut arrêter l'accent anglais."],
  ["Nouvelle règle : interdit de montrer quelqu'un du doigt. Erreur : {T1}.", "Fin de la règle : vous pouvez de nouveau pointer du doigt."],
  ["{A} a le pouvoir du pouce : dès que son pouce se pose sur la table, tout le monde l'imite. Le dernier prend {T2}.", "{A} perd son pouvoir du pouce."],
  ["Nouvelle règle : chaque gros mot coûte {T1}.", "Fin de la règle : les gros mots sont de nouveau gratuits."],
  ["{A} doit finir chaque phrase par « mon capitaine ». Oubli : {T1}.", "{A} peut arrêter de dire « mon capitaine »."],
  ["Nouvelle règle : on boit et on mange uniquement de la main gauche. Erreur : {T1}.", "Fin de la règle : la main droite est de retour."],
  ["{A} est de service : c'est à {A} de servir à boire à quiconque le demande.", "{A} n'est plus de service."],
  ["{B} n'a plus le droit de parler à {A}. À chaque erreur : {T2}.", "{B} peut de nouveau parler à {A}."],
  ["Nouvelle règle : interdit de dire « je ». Erreur : {T1}.", "Fin de la règle : vous pouvez de nouveau dire « je »."],
  ["{A} doit rire à chaque phrase de {B}. Oubli : {T1}.", "{A} peut arrêter de rire aux phrases de {B}."],
  ["Nouvelle règle : interdit de toucher son téléphone. Celui qui craque : {T2}.", "Fin de la règle : vous pouvez reprendre vos téléphones."],
  ["{A} garde les toilettes : personne n'y va sans sa permission.", "{A} ne garde plus les toilettes."],
  ["{A} devient photographe officiel : à chaque carte, il faut photographier le joueur cité. Oubli : {T1}.", "{A} range l'appareil photo."],
  ["Nouvelle règle : on applaudit après chaque carte. Le dernier à applaudir prend {T1}.", "Fin de la règle : vous pouvez arrêter d'applaudir."],
  ["{A} devient une statue : interdit de bouger sauf pour jouer. Erreur : {T1}.", "{A} peut de nouveau bouger."],
  ["Nouvelle règle : interdit de dire « boire » ou « gage ». Erreur : {T1}.", "Fin de la règle : « boire » et « gage » sont de nouveau autorisés."],
  ["{A} et {B} échangent leurs prénoms : appelez chacun par le prénom de l'autre. Erreur : {T1}.", "{A} et {B} récupèrent leur prénom."],
  ["Nouvelle règle : chaque phrase commence par « Mesdames et messieurs ». Oubli : {T1}.", "Fin de la règle : plus besoin de « Mesdames et messieurs »."],
  ["{A} devient narrateur : tout ce qui se passe doit être commenté comme dans un documentaire animalier. Un blanc trop long : {T1}.", "{A} peut arrêter de commenter."],
  ["Nouvelle règle : interdit de rire. Chaque fou rire coûte {T1}.", "Fin de la règle : vous pouvez de nouveau rire."]
];
const HOT = [
  "Ceux qui ont déjà couché le premier soir : {T2}.","{A}, raconte ton pire plan d'un soir, ou {T3}.","{A} fait un bisou sur la joue à la personne de son choix, ou {T2}.",
  "Ceux qui ont déjà envoyé un nude : {T2}.","{A}, ton nombre de partenaires : réponds ou {CS}.","Vote : qui est le meilleur coup du groupe, à votre avis ? Le plus désigné distribue {T3}.",
  "{A}, mime ta position préférée, ou {T3}.","Ceux qui l'ont déjà fait dans un lieu public : {T2}.","{A}, révèle ton dernier match sur une appli de rencontre, ou {T3}.",
  "Ceux qui ont déjà simulé : {T2}.","{A}, qui embrasse le mieux ici, à ton avis ? Réponds ou {T3}.","Ceux qui ont déjà recouché avec un ex après la rupture : {T2}.",
  "{A}, raconte ton fantasme le plus soft, ou {T2}.","{A} enlève un vêtement de son choix, ou {T3}.","Ceux qui ont déjà fait un plan à trois : {T3}. Les autres : {T1} par jalousie.",
  "{A}, dis à {B} ce que tu trouves sexy chez lui ou elle, ou {T2}.","Ceux qui ont regardé du porno cette semaine : {T2}.","{A}, montre ta dernière recherche en navigation privée, ou {CS}.",
  "{A}, imite un orgasme, ou {T3}.","Ceux qui ont des menottes ou un sextoy chez eux : {T2}.","{A}, si tu devais coucher avec quelqu'un ici, ce serait qui ? Réponds ou {T3}.",
  "Ceux qui se sont déjà fait surprendre en pleine action : {T2}.","{A} et {B} échangent un vêtement, ou prennent {T2} chacun.","{A}, le pire endroit où tu l'as fait : raconte ou {T2}.",
  "Ceux qui sont déjà sortis avec quelqu'un de ce groupe : {T2}.","{A}, donne une note sur 10 à ta dernière fois. En dessous de 5 : {T2}.","{A} danse un slow de 15 secondes avec {B}, ou {T3} chacun.",
  "Ceux qui ont déjà dragué leur boss ou un client : {T2}.","{A}, décris ton dernier rêve érotique, ou {T3}.","Ceux qui dorment nus : {T1}.",
  "{A} murmure une phrase coquine à l'oreille de {B}, ou {T2}.","Ceux qui ont déjà envoyé un message coquin à la mauvaise personne : {T3}.","{A}, ta pire panne au lit en une phrase, ou {T2}.",
  "Vote : qui a le plus de partenaires au compteur ? Le plus désigné prend {T2}.","{A}, envoie « tu me manques » à ton ex. Sinon : {CS}.","Ceux qui l'ont déjà fait sur une musique ridicule : {T1}.",
  "{A} masse les épaules de {B} pendant 20 secondes, ou {T2}.","Ceux qui ont un compte OnlyFans ou y sont abonnés : {T3}.","{A}, décris ta première fois en 3 mots, ou {T2}.",
  "Ceux qui ont déjà eu une aventure avec un collègue : {T2}.","Humour noir : {A}, invente l'épitaphe de {B}. Si le groupe rit, {B} prend {T2}.",
  "{A}, raconte la blague la plus noire que tu connaisses. Si personne ne rit : {T3}.","Ceux qui ont déjà ri à un enterrement : {T2}.","Vote : qui finira seul avec douze chats ? Le plus désigné prend {T2}.",
  "Vote : qui mourrait en premier dans un film d'horreur ? Le plus désigné prend {T2}.","{A}, avoue le fantasme que tu n'as jamais osé proposer, ou {CS}.",
  "Ceux qui ont déjà oublié le prénom de la personne avec qui ils ont couché : {T3}.","{A}, lis à voix haute le dernier message coquin que tu as envoyé, ou {CS}.",
  "Confession : {A}, ta pire technique de drague, en démonstration, ou {T2}.","Confession : {A}, ton crush le plus inavouable, ou {CS}.",
  "Confession : {A}, le message le plus osé que tu aies reçu : raconte ou {T3}.","Ceux qui ont déjà embrassé quelqu'un dans cette pièce : {T2}.",
  "Ceux qui ont déjà dragué sans le savoir quelqu'un de déjà pris : {T2}.","Ceux qui l'ont déjà fait dans une voiture : {T2}.",
  "Ceux qui ont déjà eu deux rendez-vous galants le même jour : {T2}.","Ceux qui ont déjà menti sur leur nombre de partenaires : {T2}.",
  "Duel : {A} et {B} font leur meilleur regard de séduction. Le groupe vote : le perdant prend {T2}.","Duel : {A} contre {B}, la meilleure phrase de drague en 10 secondes. Le perdant prend {T2}.",
  "Duel : {A} et {B} décrivent leur date idéal en une phrase. Le moins convaincant prend {T2}.","Vote : qui a le plus de messages coquins dans son téléphone ? Le plus désigné prend {T2}.",
  "Vote : qui rougit le plus vite ? Le plus désigné prend {T2}.","Vote : qui serait le plus doué en strip-tease ? Le plus désigné fait une démo de 10 secondes, ou prend {T3}.",
  "{A}, chuchote ton fantasme en un mot à l'oreille de {B}. {B} décide si tu prends {T2}.","{A}, rejoue la pire tentative de drague que tu aies subie, ou {T3}.",
  "{A}, la partie du corps que tu regardes en premier ? Réponds ou {T2}.","{A}, raconte ton date le plus gênant, ou {T3}.",
  "{A} fait un compliment osé à {B}. Si {B} rougit, {B} prend {T2}.","{A}, montre ta dernière conversation sur une appli de rencontre, ou {CS}.",
  "{A}, la chose la plus folle que tu aies faite par amour ? Réponds ou {T2}.","{A} et {B} se regardent dans les yeux 20 secondes. Le premier qui détourne le regard prend {T2}.",
  "Ceux qui ont déjà dû se cacher dans un placard ou sous un lit : {T2}.","Ceux qui ont déjà envoyé « tu dors ? » après minuit : {T1}.",
  "Ceux qui ont déjà eu un crush sur leur médecin, leur kiné ou leur coiffeur : {T1}.","Je n'ai jamais, version adulte : {A} commence. Ceux qui l'ont fait prennent {T1}. Un tour complet."
];
const HOT_RULES = [
  ["Nouvelle règle : chaque fois que quelqu'un dit « sexe », tout le monde prend {T1}.", "Fin de la règle : le mot « sexe » est de nouveau gratuit."],
  ["{A} et {B} se tiennent la main jusqu'à nouvel ordre. Lâcher : {T2}.", "{A} et {B} peuvent se lâcher la main."],
  ["{A} appelle tout le monde « mon amour ». Oubli : {T1}.", "{A} peut arrêter de dire « mon amour »."],
  ["{A} est au service de {B} et exécute tous ses ordres (raisonnables).", "{A} n'est plus au service de {B}."],
  ["Nouvelle règle : interdit de croiser les jambes, c'est trop sage. Erreur : {T1}.", "Fin de la règle : vous pouvez recroiser les jambes."],
  ["{A} fait un clin d'œil à chaque phrase. Oubli : {T1}.", "{A} peut arrêter les clins d'œil."],
  ["Nouvelle règle : chaque compliment doit être un peu osé. Compliment trop sage : {T1}.", "Fin de la règle : les compliments sages sont de nouveau acceptés."],
  ["{A} devient juge du flirt : à chaque carte, {A} désigne la personne la plus séduisante, qui distribue {T1}.", "{A} n'est plus juge du flirt."]
];
const PACKS = [
  { v: "classique", label: "Classique", desc: "Défis, votes, mini-jeux et règles", list: CARDS, rules: RULES },
  { v: "adulte", label: "Adultes", desc: "Sexe, confessions, humour noir", list: HOT, rules: HOT_RULES, hot: true }
];

const DECKS = [
  { v: "classique", label: "Classique", desc: "Un peu de tout" },
  { v: "chaos", label: "Chaos", desc: "Plus de règles, plus de cartes chaos" },
  { v: "confessions", label: "Confessions", desc: "Surtout des aveux et des questions" },
  { v: "duels", label: "Duels", desc: "Surtout des face-à-face" }
];
/* Cartes chaos : rares, elles cassent la chaîne. Leur effet est appliqué par l'appli. */
const CHAOS = [
  { id: "cancel", name: "Grand ménage", desc: "Toutes les règles en cours sont annulées sur-le-champ.", t: "Grand ménage : toutes les règles en cours sont annulées. Respirez.", ok: o => o.active > 0 },
  { id: "double", name: "Double peine", desc: "Les sanctions des 3 prochaines cartes sont doublées.", t: "Double peine : sur les 3 prochaines cartes, toutes les sanctions sont doublées." },
  { id: "immune", name: "Immunité", desc: "Un joueur tiré au sort n'est plus cité pendant 6 cartes.", t: "{A} est intouchable : son prénom ne sort plus pendant 6 cartes.", ok: o => o.np > 2 },
  { id: "target", name: "Dans le viseur", desc: "Un joueur est cité dans chacune des 4 prochaines cartes.", t: "{A} est dans le viseur : son prénom sort dans chacune des 4 prochaines cartes.", ok: o => o.np > 1 },
  { id: "rush", name: "Duels en série", desc: "Les 3 prochaines cartes sont des duels.", t: "Duels en série : les 3 prochaines cartes sont des face-à-face. Échauffez-vous.", ok: o => o.np > 1 && o.duels >= 3 },
  { id: "avalanche", name: "Avalanche", desc: "Deux nouvelles règles tombent d'un coup.", t: "Avalanche : deux nouvelles règles d'un coup !", ok: o => o.rules >= 2 },
  { id: "overtime", name: "Prolongations", desc: "Les règles en cours durent 5 cartes de plus.", t: "Prolongations : les règles en cours durent 5 cartes de plus.", ok: o => o.active > 0 }
];
function tok(mode, mult){
  const drink = mode !== "soft", m = mult || 1;
  return { T: n => (n * m) + " " + (drink ? "gorgée" : "gage") + (n * m > 1 ? "s" : ""), CS: drink ? (m > 1 ? "deux culs secs" : "un cul sec") : (m > 1 ? "deux gages XXL" : "un gage XXL") };
}
function need(t){ return /\{C\}/.test(t) ? 3 : /\{B\}/.test(t) ? 2 : /\{A\}/.test(t) ? 1 : 0; }
function kindOf(t){
  if(/^(Jeu|Je n'ai jamais|Ni oui ni non)/.test(t)) return "game";
  if(/^Vote/.test(t)) return "vote";
  if(/^Duel|\{A\} contre \{B\}|^\{A\} et \{B\} :/.test(t)) return "duel";
  if(/^(Confession|Ceux qui)/.test(t)) return "conf";
  return "card";
}
function render(t, who, mode, mult){
  const k = tok(mode, mult);
  return t.replace(/\{A\}/g, who[0] || "").replace(/\{B\}/g, who[1] || "").replace(/\{C\}/g, who[2] || "")
    .replace(/\{T(\d)\}/g, (_, n) => k.T(+n)).replace(/\{CS\}/g, k.CS);
}
/* Fabrique toute la partie : n cartes, avec des règles de durée variable et, de temps en temps, une carte chaos.
   Les cartes déjà jouées sur ce téléphone sont gardées pour la fin (anti-répétition). */
function build(names, packs, mode, n, deck, twists){
  const sel = A(packs).length ? A(packs) : ["classique"], P = PACKS.filter(p => sel.indexOf(p.v) >= 0);
  const np = names.length, ok = t => need(t) <= np, th = deck || "classique";
  const cardPool = () => P.flatMap(p => p.list).filter(ok);
  const RB = {}; P.forEach(p => p.rules.forEach(r => { RB[r[0]] = r; }));
  const rulePool = () => SB.u.fresh("defis:r", Object.keys(RB).filter(ok)).map(t => RB[t]);
  let cards = SB.u.fresh("defis:c", cardPool()), rules = rulePool();
  const used = {}; names.forEach(x => { used[x] = 0; });
  let imm = null, tgt = null, dbl = -1, rush = null, force = 0, lastChaos = -9, lastTw = "";
  const who = cnt => {
    let pool = names.filter(x => !(imm && out.length <= imm.until && x === imm.name));
    if(pool.length < cnt) pool = names.slice();
    let order = shuffle(pool).sort((a, b) => used[a] - used[b]);
    if(tgt && out.length <= tgt.until && cnt > 0 && pool.indexOf(tgt.name) >= 0) order = [tgt.name].concat(order.filter(x => x !== tgt.name));
    order = order.slice(0, cnt); order.forEach(x => { used[x]++; }); return order;
  };
  // Tire la carte la plus fraîche qui respecte pred (sinon la plus fraîche tout court).
  const take = pred => {
    if(!cards.length) cards = SB.u.fresh("defis:c", cardPool());
    if(pred) for(let j = cards.length - 1; j >= 0; j--) if(pred(cards[j])) return cards.splice(j, 1)[0];
    return cards.pop();
  };
  const out = [], ends = [];
  let active = 0, rid = 0;
  const pushRule = () => {
    const r = rules.pop(); if(!rules.length) rules = rulePool();
    const w = who(need(r[0])), id = "r" + (rid++), long = Math.random() < .7;
    out.push({ t: render(r[0], w, mode), kind: "rule", r: id, w, src: r[0], sk: "defis:r" });
    ends.push({ at: out.length + (long ? 5 + Math.floor(Math.random() * 8) : 3 + Math.floor(Math.random() * 3)), t: render(r[1], w, mode), r: id }); active++;
  };
  const duels = cardPool().filter(t => kindOf(t) === "duel" && need(t) <= np).length;
  while(out.length < n){
    const due = ends.findIndex(e => e.at <= out.length);
    if(due >= 0){ const e = ends.splice(due, 1)[0]; out.push({ t: e.t, kind: "end", r: e.r }); active--; continue; }
    if(force > 0 && rules.length){ force--; pushRule(); continue; }
    const crate = th === "chaos" ? .15 : .07;
    if(twists && out.length >= 3 && out.length < n - 4 && out.length - lastChaos > 5){
      const t = SB.u.twist(CHAOS, { rate: crate, last: lastTw, active, np, duels, rules: rules.length });
      if(t){
        const w = /\{A\}/.test(t.t) ? who(1) : [], ci = out.length, c = { t: render(t.t, w, mode), kind: "chaos", tw: t.id, w };
        lastChaos = ci; lastTw = t.id;
        if(t.id === "cancel"){ c.cancel = 1; ends.length = 0; active = 0; }
        if(t.id === "overtime") ends.forEach(e => { e.at += 5; });
        if(t.id === "double"){ dbl = ci + 3; c.add = [{ r: "x" + ci, t: "Sanctions doublées", u: ci + 4 }]; }
        if(t.id === "immune"){ imm = { name: w[0], until: ci + 6 }; c.add = [{ r: "x" + ci, t: w[0] + " est intouchable", u: ci + 7 }]; }
        if(t.id === "target"){ tgt = { name: w[0], until: ci + 4 }; c.add = [{ r: "x" + ci, t: w[0] + " est dans le viseur", u: ci + 5 }]; }
        if(t.id === "rush") rush = { until: ci + 3 };
        if(t.id === "avalanche") force = 2;
        out.push(c); continue;
      }
    }
    const rp = th === "chaos" ? .28 : .16, cap = th === "chaos" ? 3 : 2;
    const wantRule = rules.length && active < cap && out.length < n - 4 && Math.random() < rp;
    if(wantRule){ pushRule(); continue; }
    const want = rush && out.length <= rush.until ? "duel" : th === "duels" && Math.random() < .5 ? "duel" : th === "confessions" && Math.random() < .55 ? "conf" : "";
    const needA = tgt && out.length <= tgt.until;
    const c = take(want || needA ? x => (!want || kindOf(x) === want) && (!needA || need(x) > 0) : null), w = who(need(c));
    out.push({ t: render(c, w, mode, out.length <= dbl ? 2 : 1), kind: kindOf(c), w, src: c, sk: "defis:c" });
  }
  // Les règles encore en cours se terminent avant la dernière carte.
  ends.forEach(e => out.splice(out.length - 1, 0, { t: e.t, kind: "end", r: e.r }));
  // Chaque règle connaît la carte où elle s'arrête (pour afficher « encore N cartes »).
  out.forEach((c, i) => { if(c.kind === "rule"){ const e = out.findIndex((x, j) => j > i && x.kind === "end" && x.r === c.r); if(e > 0) c.u = e; } });
  return out;
}
const LABEL = { card: "Défi", game: "Mini-jeu", vote: "Vote", duel: "Duel", conf: "Confession", rule: "Nouvelle règle", end: "Fin de règle", chaos: "Carte chaos" };
const CSS = '<style>.df-card{flex:1; min-height:44vh; background:var(--acc); color:var(--on-acc); border-radius:22px; padding:22px 20px; display:flex; flex-direction:column; justify-content:center; gap:14px; box-shadow:0 14px 34px -20px rgba(0,0,0,.6)}' +
  '.df-card .k{font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; opacity:.85}.df-card .t{font-size:26px; font-weight:800; line-height:1.25; overflow-wrap:anywhere}' +
  '.df-card.rule{background:var(--card); color:var(--ink); border:3px dashed var(--acc)}.df-card.end{background:var(--soft); color:var(--ink)}' +
  '.df-card.chaos{background:var(--ink); color:var(--bg)}.df-card.duel .k::before{content:"VS · "}' +
  '.df-rules{display:flex; flex-direction:column; gap:6px}.df-rules span{font-size:14px; background:var(--soft); border-radius:10px; padding:8px 10px; border-left:4px solid var(--acc); display:flex; gap:8px; justify-content:space-between}.df-rules em{font-style:normal; color:var(--muted); white-space:nowrap}' +
  '.df-aw{display:flex; flex-direction:column; gap:10px; margin-top:6px}</style>';
function cardHTML(c, i, n, rules){
  const r = A(rules), tw = c.kind === "chaos" ? SB.u.byTwist(CHAOS, c.tw) : null;
  return CSS + '<span class="eyebrow">Carte ' + (i + 1) + " / " + n + "</span>" + (tw ? SB.u.twistHTML({ name: tw.name }, "Carte chaos") : "") + '<div class="df-card ' + esc(c.kind) + '"><span class="k">' + esc(LABEL[c.kind] || "Défi") + '</span><span class="t">' + esc(c.t) + "</span></div>" +
    (r.length ? '<div class="field"><span class="eyebrow">Règles en cours</span><div class="df-rules">' + r.map(x => "<span><b>" + esc(x.t) + "</b>" + (x.u != null && +x.u > i ? "<em>encore " + (+x.u - i) + "</em>" : "") + "</span>").join("") + "</div></div>" : "");
}
function applyRules(rules, c, i){
  let r = A(rules).filter(x => x.u == null || +x.u > i);
  if(c.kind === "rule") r.push({ r: c.r, t: c.t, u: c.u });
  if(c.kind === "end") r = r.filter(x => x.r !== c.r);
  if(c.cancel) r = r.filter(x => !/^r/.test(x.r));
  A(c.add).forEach(x => r.push(x));
  return r.map(x => ({ r: x.r, t: x.t, u: x.u == null ? null : x.u }));
}
function plainCard(c){ const o = Object.assign({}, c); delete o.src; delete o.sk; delete o.add; return o; }
function sawCard(c){ if(c && c.src) SB.u.saw(c.sk, c.src); }
// Statistiques de fin : le plus cité, le moins cité, le roi des duels.
const AWT = {
  star: ["La star de la soirée", "Le chouchou des cartes", "Sur toutes les lèvres"],
  ghost: ["Le fantôme", "Passe-muraille", "Profil bas"],
  glad: ["Gladiateur", "Roi de l'arène", "Toujours prêt à en découdre"]
};
function stats(seq, names, upto){
  const cite = {}, duel = {}; names.forEach(x => { cite[x] = 0; duel[x] = 0; });
  A(seq).slice(0, upto).forEach(c => { A(c.w).forEach(x => { if(cite[x] != null){ cite[x]++; if(c.kind === "duel") duel[x]++; } }); });
  const o = names.slice().sort((a, b) => cite[b] - cite[a]), d = names.slice().sort((a, b) => duel[b] - duel[a])[0], seed = Math.floor(Math.random() * 3);
  const res = [[AWT.star[seed], o[0], "Cité " + cite[o[0]] + " fois"]];
  if(names.length > 2) res.push([AWT.ghost[seed], o[o.length - 1], (cite[o[o.length - 1]] ? "Cité seulement " + cite[o[o.length - 1]] + " fois" : "Jamais cité")]);
  if(duel[d]) res.push([AWT.glad[seed], d, duel[d] + " duel" + (duel[d] > 1 ? "s" : "")]);
  return res;
}
function awardsHTML(aw){ return A(aw).length ? '<div class="df-aw">' + A(aw).map(A).map(x => '<div class="card"><span class="eyebrow">' + esc(x[0]) + '</span><div class="big">' + esc(x[1]) + '</div><span class="sm">' + esc(x[2]) + "</span></div>").join("") + "</div>" : ""; }

const DEF = {
  id: "defis", name: "Défis en chaîne", glyph: "Défi !", pitch: "Des défis et des règles qui vous citent par vos prénoms.", hot: true,
  accent: { light: "#b8e65a", dark: "#b8e65a" },
  tag: "Des cartes qui vous citent par vos prénoms : défis, votes, mini-jeux et règles qui durent. Avec ou sans alcool.",
  min: 2, max: 20,
  rules: [
    "Une carte s'affiche. Lisez-la à voix haute et faites ce qu'elle dit.",
    "Certaines cartes posent une règle qui dure quelques cartes : elle reste affichée en bas tant qu'elle est active.",
    "Mode avec gorgées, ou sans alcool : on prend alors des gages (pompes, compliment forcé, ce que le groupe décide).",
    "Ambiance au choix : Classique, Chaos (plus de règles), Confessions ou Duels. Les règles durent plus ou moins longtemps : le compteur indique combien de cartes il leur reste.",
    "Cartes chaos : de temps en temps, une carte casse la chaîne (règles annulées, sanctions doublées, immunité, joueur dans le viseur, duels en série…).",
    "N'importe qui peut passer à la carte suivante. Buvez avec modération : rien n'est obligatoire."
  ],
  options: [
    { id: "mode", label: "Sanctions", type: "seg", def: "drink", values: [{ v: "drink", label: "Gorgées" }, { v: "soft", label: "Sans alcool" }] },
    { id: "len", label: "Cartes", type: "seg", def: 50, values: [{ v: 30, label: "30" }, { v: 50, label: "50" }, { v: 80, label: "80" }] },
    { id: "deck", label: "Ambiance", type: "seg", def: "classique", values: DECKS.map(d => ({ v: d.v, label: d.label })) },
    { id: "packs", label: "Paquets", type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length + p.rules.length })) },
    { id: "twists", label: "Rebondissements", type: "toggle", text: "Cartes chaos", desc: "De temps en temps, une carte casse la chaîne", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet de cartes.");
    return DEF.deal(ctx, o);
  },
  deal(c, o){
    const seq = build(c.players.map(p => p.name), o.packs, o.mode, o.len || 50, o.deck, o.twists !== false);
    c.setPriv({ seq }); sawCard(seq[0]);
    return { phase: "play", i: 0, n: seq.length, c: plainCard(seq[0]), rules: applyRules([], seq[0], 0), aw: [] };
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "play") return;
    if(!ctx.ids.some(id => { const x = ctx.input(id); return x && x.nx === s.i + 1; })) return;
    const seq = A(ctx.priv().seq), i = s.i + 1;
    if(i >= seq.length){ ctx.set({ phase: "end", aw: stats(seq, ctx.players.map(p => p.name), seq.length), k: ctx.rid() }); return; }
    sawCard(seq[i]);
    ctx.set({ i, c: plainCard(seq[i]), rules: applyRules(s.rules, seq[i], i), k: ctx.rid() });
  },
  render(ctx, root){
    const s = ctx.s;
    if(s.phase === "play"){
      screen(root, "c" + s.k, cardHTML(s.c || { t: "", kind: "card" }, s.i, s.n, s.rules) + dock('<button class="btn acc big-tap" type="button" data-n>Carte suivante</button>'), r => {
        const b = r.querySelector("[data-n]");
        // Courte pause à l'arrivée d'une carte : deux joueurs qui touchent en même temps ne sautent pas une carte.
        b.disabled = true; setTimeout(() => { if(b.isConnected) b.disabled = false; }, 900);
        b.addEventListener("click", () => { b.disabled = true; ctx.send({ nx: s.i + 1 }); });
      });
    } else {
      screen(root, "end" + s.k + ctx.isHost, CSS + '<div class="pass"><span class="eyebrow">Fin de la partie</span><div class="who">Santé !</div><p>' + s.n + " cartes jouées. Hydratez-vous, et rentrez prudemment.</p></div>" + awardsHTML(s.aw) +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-again>Nouvelle partie</button><button class="btn ghost" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va relancer ou revenir au salon.</p>'), r => {
        const a = r.querySelector("[data-again]");
        if(a) a.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "end") c.set(Object.assign(DEF.deal(c, c.opts), { k: c.rid() })); }));
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => c.end({ title: "Défis en chaîne · " + c.s.n + " cartes", lines: A(c.s.aw).map(A).map(x => x[0] + " : " + x[1]) })));
      });
    }
  },

  /* ---------- Un seul téléphone : le jeu idéal pour le poser au milieu ---------- */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.dfPacks).length ? A(st.dfPacks).slice() : ["classique"];
      let mode = st.dfMode === "soft" ? "soft" : "drink", len = [30, 50, 80].indexOf(st.dfLen) >= 0 ? st.dfLen : 50;
      let deck = DECKS.some(d => d.v === st.dfDeck) ? st.dfDeck : "classique", twists = st.dfTw !== false;
      let seq = [], i = 0, rules = [];
      const go = ph => {
        if(ph === "setup"){
          screen(root, "su" + sel.join() + mode + len + deck + twists, '<div class="field"><span class="eyebrow">Sanctions</span><div class="seg"><button type="button" data-m="drink" aria-pressed="' + (mode === "drink") + '">Gorgées</button><button type="button" data-m="soft" aria-pressed="' + (mode === "soft") + '">Sans alcool</button></div></div>' +
            '<p class="howto">' + (mode === "drink" ? "Posez le téléphone au milieu et lisez chaque carte à voix haute. Buvez avec modération : rien n'est obligatoire." : "Sans alcool : chaque gage, c'est une pompe, un compliment forcé ou ce que le groupe décide.") + "</p>" +
            '<div class="field"><span class="eyebrow">Cartes</span><div class="seg">' + [30, 50, 80].map(n => '<button type="button" data-l="' + n + '" aria-pressed="' + (n === len) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Ambiance</span><div class="seg">' + DECKS.map(d => '<button type="button" data-d="' + d.v + '" aria-pressed="' + (d.v === deck) + '">' + esc(d.label) + "</button>").join("") + '</div><span class="sm">' + esc(DECKS.find(d => d.v === deck).desc) + "</span></div>" +
            '<div class="field"><span class="eyebrow">Paquets</span><div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + (p.list.length + p.rules.length) + "</span></button>").join("") +
            '<button type="button" class="pack" data-tw aria-pressed="' + twists + '"><span class="box">✓</span><span class="tx"><span class="nm">Cartes chaos</span><span class="ds">De temps en temps, une carte casse la chaîne</span></span></button></div></div>' +
            dock('<button class="btn acc" type="button" data-go>Commencer</button>'), r => {
            r.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => { deck = b.dataset.d; persist({ dfDeck: deck }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twists = !twists; persist({ dfTw: twists }); go("setup"); });
            r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ dfMode: mode }); go("setup"); }));
            r.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => { len = +b.dataset.l; persist({ dfLen: len }); go("setup"); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ dfPacks: sel }); go("setup"); }));
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!sel.length){ SB.u.toast("Choisis au moins un paquet"); return; }
              seq = build(names, sel, mode, len, deck, twists); i = 0; rules = applyRules([], seq[0], 0); go("card");
            });
          });
        } else if(ph === "card"){
          sawCard(seq[i]);
          screen(root, "c" + i, cardHTML(seq[i], i, seq.length, rules) + dock('<button class="btn acc big-tap" type="button" data-n>' + (i + 1 < seq.length ? "Carte suivante" : "Terminer") + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(i + 1 >= seq.length){ go("end"); return; }
              i++; rules = applyRules(rules, seq[i], i); go("card");
            });
          });
        } else {
          screen(root, "end" + seq.length + i, CSS + '<div class="pass"><span class="eyebrow">Fin de la partie</span><div class="who">Santé !</div><p>' + seq.length + " cartes jouées. Hydratez-vous, et rentrez prudemment.</p></div>" + awardsHTML(stats(seq, names, seq.length)) +
            dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button>'), r => {
            r.querySelector("[data-a]").addEventListener("click", api.again);
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
