/* Punchline — une phrase à trous, chacun la complète avec une carte de sa main, le juge garde la plus drôle. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, clean, armTap, pick, buzz, tr } = SB.u;

/* Cartes : PQ = phrases à trous (___), PA = réponses. Paquets hard et noir réservés aux adultes. */
const PQ = {
 "classique": [
  "Ce soir, j'ai fini aux urgences. Le coupable : ___.",
  "Le secret de ma réussite ? ___.",
  "Ma mère m'a toujours mis(e) en garde contre ___.",
  "Nouveau film au cinéma : « ___, le retour ».",
  "Pourquoi je suis célibataire ? Un seul responsable : ___.",
  "Règle numéro 1 de la colocation : on ne partage jamais ___.",
  "Le conseil de mamie pour réussir sa vie : ___.",
  "Mon CV, rubrique « centres d'intérêt » : ___.",
  "Avis client, une étoile : « On m'a servi ___ à la place du dessert. »",
  "Le Petit Prince version 2.0 : « Dessine-moi ___. »",
  "Ce que j'ai vraiment fait pendant le confinement : ___.",
  "Horoscope du jour : Vénus vous conseille d'éviter ___.",
  "Discours du témoin au mariage : « Ce qui les a réunis ? ___. »",
  "Notification du jour : « Votre colis contenant ___ est arrivé. »",
  "Le prochain sport olympique : ___.",
  "Mon plan pour devenir riche : ___.",
  "Ce qui m'empêche de dormir la nuit : ___.",
  "La vraie raison de mon retard au boulot : ___.",
  "Mon talent caché, c'est ___.",
  "Ma dernière recherche internet : « ___ : comment s'en débarrasser ? »",
  "Au repas de famille, tonton a encore remis sur le tapis ___.",
  "Nouvelle appli de rencontre : le seul critère pour matcher, c'est ___.",
  "Le dernier cri en décoration intérieure : ___.",
  "J'ai dû payer une amende pour ___.",
  "Selon mon psy, tout vient de là : ___.",
  "Ce week-end, au programme : ___ et beaucoup de sieste.",
  "Le bruit bizarre dans la cuisine ? C'était ___.",
  "La nouvelle série dont tout le monde parle : « ___ : la vérité éclate ».",
  "Pour mon anniversaire, je veux ___.",
  "La pire excuse pour annuler un rendez-vous : « Désolé(e), j'ai ___. »",
  "Dans mon testament, je lègue à mon voisin ___.",
  "Le jury de l'émission culinaire a recraché ___.",
  "Mon coach de sport a jeté l'éponge en voyant ___.",
  "Au réveillon, la belle-mère a encore ramené ___.",
  "La voyante du quartier voit dans votre avenir ___.",
  "Tout a commencé à déraper quand quelqu'un a sorti ___.",
  "Le nouveau parfum à la mode sent ___.",
  "Si je deviens président(e), ma première mesure sera ___.",
  "Le dernier livre de développement personnel : « Lâcher prise avec ___ ».",
  "Je me suis fait virer du club de lecture pour ___.",
  "Le guide touristique déconseille fortement ___.",
  "Refoulé à l'entrée de la boîte. La raison : ___.",
  "Ma grand-mère cache dans son armoire ___.",
  "Le slogan du nouveau supermarché : « Chez nous, tout est en promo, même ___. »",
  "Le plus gros mensonge de mon profil de rencontre : ___.",
  "Mon chat me regarde bizarrement depuis ___.",
  "J'ai appelé le service client. Objet de ma réclamation : ___.",
  "Message de mon ex à 3 h du matin : « Tu te rappelles ___ ? »",
  "Le gros lot de la tombola du village : ___.",
  "Ce que les pompiers ont trouvé dans ma cheminée : ___.",
  "Le nom de mon futur groupe de rock : « ___ ».",
  "Mon arme secrète pour finir le marathon : ___.",
  "Le tuto qui a fait exploser ma chaîne : « 10 façons d'utiliser ___ ».",
  "Le dress code de la soirée : ___.",
  "Alerte météo : demain, il va pleuvoir ___.",
  "Mon colocataire a encore laissé ___ dans le frigo.",
  "Au musée, la nouvelle œuvre s'appelle tout simplement ___.",
  "Mon superpouvoir serait ___.",
  "Je ne bois plus depuis ___.",
  "En réunion, mon patron a présenté ___ comme la solution à tout.",
  "Ce qui m'a fait pleurer devant un film : ___.",
  "La cagnotte en ligne pour ___ a dépassé le million d'euros.",
  "Dans mon sac de plage, il y a toujours ___.",
  "Le prochain défi viral : ___.",
  "Le plat du jour au resto du coin : ___, sauce surprise.",
  "Message dans le groupe de la famille : « Qui a posté ___ ? »",
  "On m'a confisqué ___ à l'aéroport.",
  "Le chef cuisinier recommande ___ en entrée.",
  "Mon voisin a porté plainte contre moi pour ___.",
  "Ce qui m'a fait quitter le groupe de randonnée : ___.",
  "La photo de profil la plus gênante : moi avec ___.",
  "Le cadeau de départ à la retraite du chef : ___.",
  "L'ingrédient secret de la recette de mamie : ___.",
  "Recalé au permis. Motif : ___.",
  "Flash spécial au 20 h : ___ en rupture de stock dans toute la France.",
  "Le jeu de société qui va diviser les familles à Noël : ___.",
  "Mon kiné m'a dit d'arrêter ___.",
  "L'élément le plus suspect de ma playlist : ___.",
  "Piscine municipale évacuée en urgence : on a retrouvé ___ dans le grand bain.",
  "Ce qui se passe vraiment à la machine à café du bureau : ___.",
  "Le nouveau régime miracle : uniquement ___.",
  "Ma vie, résumée en une image : ___.",
  "Le prochain documentaire animalier : « ___ dans son milieu naturel ».",
  "J'ai perdu le pari : maintenant, je dois vivre une semaine avec ___.",
  "La conférence la plus courte du monde : « ___ ».",
  "À la fête des voisins, quelqu'un a ramené ___.",
  "Ce que j'ai retrouvé sous le canapé : ___.",
  "Le dernier stage de team building : ___ en pleine forêt.",
  "Le génie de la lampe m'accorde un vœu : ___.",
  "Mon banquier m'a convoqué(e) : il a vu passer ___ sur mon relevé.",
  "Le titre de mon autobiographie : « ___ et autres catastrophes ».",
  "Le moniteur d'auto-école a fait une crise en voyant ___.",
  "Le meilleur moyen de faire fuir les invités : ___.",
  "Ma résolution de la nouvelle année : ___.",
  "Le maire a inauguré une statue représentant ___.",
  "Le wifi de l'hôtel s'appelle « ___ ».",
  "___ : la raison numéro 1 des divorces en France.",
  "___ ? Il y a une appli pour ça.",
  "___, c'est comme le vélo : ça ne s'oublie pas.",
  "Rien ne vaut ___ un dimanche matin.",
  "J'ai remplacé ___ par ___ et personne n'a rien remarqué.",
  "Film de l'été : « ___ contre ___ ».",
  "Le mélange interdit : ___ avec ___.",
  "Pour réussir un premier rendez-vous : ___ et surtout pas ___.",
  "Ma mère m'a surpris(e) avec ___ et ___ dans la même pièce.",
  "Le nouveau couple star de la téléréalité : ___ et ___.",
  "À l'apéro, on a commencé par évoquer ___, puis ___ a tout fait dégénérer.",
  "Le duo improbable des vacances : ___ et ___.",
  "La spécialité régionale qui fait polémique : ___ en sauce, avec ___ en accompagnement.",
  "Mon week-end en résumé : ___, puis ___.",
  "Recette de la soirée parfaite : ___, ___, et on n'en parle plus jamais.",
  "La dispute de l'année : ___ contre ___.",
  "Le combo gagnant pour un dimanche réussi : ___ et ___.",
  "Mon chef m'a pris(e) en flagrant délit avec ___.",
  "L'invention qui va changer le monde : ___, mais en version connectée.",
  "Quand j'ai trop bu, je ne parle plus que d'une chose : ___."
 ],
 "hard": [
  "Mon plan cul m'a largué(e). Sa raison : ___.",
  "Ce que j'ai retrouvé dans mon lit après la soirée : ___.",
  "Le nouveau jouet érotique à la mode : ___.",
  "En plein orgasme, j'ai crié : « ___ ! »",
  "Ma pire gueule de bois a commencé avec ___.",
  "Le secret d'une nuit torride ? ___.",
  "J'ai dû expliquer ___ à mon médecin.",
  "Mon fantasme le plus inavouable : ___.",
  "Notification gênante : « Votre commande a été expédiée en colis discret. Contenu : ___. »",
  "J'ai vomi sur ___.",
  "La nouvelle position du Kamasutra s'appelle ___.",
  "Ce qui s'est vraiment passé dans le jacuzzi : ___.",
  "Mon ex raconte à tout le monde que je kiffe ___.",
  "Pour pimenter le couple, le sexologue conseille ___.",
  "Ce que j'ai sniffé à la fête : ___.",
  "Dans la table de nuit de mes colocs : ___.",
  "Je me suis fait virer de la soirée échangiste pour ___.",
  "Le pire endroit pour faire l'amour : ___.",
  "Mon historique de navigation privée : ___.",
  "Au réveil, il y avait ___ sur mes fesses.",
  "Le nouveau film porno à succès : « ___ ».",
  "Ma technique de drague infaillible : ___.",
  "Le premier truc que j'ai fait après ma rupture : ___.",
  "Le préservatif a craqué. Le coupable : ___.",
  "Mon rencard de l'appli a sorti ___ au premier rendez-vous.",
  "Le pire bruit pendant le sexe : ___.",
  "La raison pour laquelle on m'appelle « l'aspirateur » : ___.",
  "Ce qui me fait mouiller : ___.",
  "Mon gynéco a éclaté de rire en voyant ___.",
  "Au strip-poker, j'ai perdu ___.",
  "Le cocktail de la soirée : vodka, jus de pomme et ___.",
  "Le plus gros fail de ma vie sexuelle : ___.",
  "Ce qui traîne dans la boîte à gants de mon plan cul : ___.",
  "Le safe word de ce soir : « ___ ».",
  "Ma dernière branlette a été interrompue par ___.",
  "J'ai envoyé au mauvais groupe de discussion une photo de moi avec ___.",
  "Au sex-shop, le vendeur m'a recommandé ___.",
  "Le meilleur aphrodisiaque du monde : ___.",
  "Le trip sous champignons a dérapé quand on a vu ___.",
  "Le gang bang a été annulé. Motif officiel : ___.",
  "Ce que j'ai trouvé dans l'historique de mon boss : ___.",
  "Mon plan à trois s'est terminé avec ___.",
  "Ce qui me fait jouir plus vite que prévu : ___.",
  "L'odeur bizarre de la chambre ? C'est ___.",
  "Ce que j'ai pris en photo pendant que je vomissais : ___.",
  "Le pire moment pour avoir une érection : pendant ___.",
  "Mon vibro préféré s'appelle ___.",
  "La MST du moment s'attrape en touchant ___.",
  "Après dix shots, j'ai fini par galocher ___.",
  "Le pire endroit pour retrouver un préservatif usagé : ___.",
  "On m'a surpris(e) avec ___ dans les toilettes de la boîte.",
  "Urgences, 4 h du matin. Ce qu'il a fallu m'extraire : ___.",
  "Ma bite a un nom, et c'est ___.",
  "Ce qui m'a fait débander d'un coup : ___.",
  "Le menu du brunch après une nuit d'orgie : ___.",
  "L'accessoire indispensable de toute soirée SM : ___.",
  "Dans ma valise pour un week-end coquin : ___.",
  "Mon ex m'a laissé en souvenir ___.",
  "La vraie raison pour laquelle je ne peux plus m'asseoir : ___.",
  "Ce qui reste de ma dignité après la soirée : ___.",
  "Le nouveau goût de lubrifiant : ___.",
  "J'ai couché avec mon boss pour ___.",
  "Le pire texto à recevoir le lendemain : « Merci pour ___. »",
  "Le DJ a balancé ___ et tout le monde s'est déshabillé.",
  "Le kink le plus bizarre que j'ai testé : ___.",
  "Après une nuit avec moi, on ne peut plus regarder ___ pareil.",
  "À la soirée mousse, j'ai perdu ___.",
  "Ce qui est sorti de mon nez après la soirée : ___.",
  "Le casting du prochain film X demande ___.",
  "La première chose que je cache quand mes parents débarquent : ___.",
  "Mon nouveau tatouage, juste au-dessus de la raie : ___.",
  "Le dernier sujet de conversation sur l'oreiller : ___.",
  "Ce qui m'a valu un blocage sur toutes les applis de rencontre : ___.",
  "Je suis interdit(e) de sauna depuis ___.",
  "Mes plans cul me mettent cinq étoiles pour ___.",
  "Le pire aphrodisiaque du monde : ___.",
  "Mon coloc m'a surpris(e) seul(e) dans ma chambre avec ___.",
  "Mon dernier achat à 3 h du matin, complètement déchiré(e) : ___.",
  "Le test de grossesse est positif, merci ___.",
  "Ma pire honte en after : ___.",
  "Le chef d'orchestre de l'orgie, c'était ___.",
  "Le cadeau d'enterrement de vie de garçon : ___.",
  "Le cadeau d'enterrement de vie de jeune fille : ___.",
  "Le meilleur moyen de finir une soirée trop arrosée : ___.",
  "Mon médecin m'interdit formellement ___.",
  "Ce qui gicle partout quand on n'y fait pas attention : ___.",
  "Sur la nouvelle appli de plans cul, tout le monde met en photo de profil ___.",
  "___ : ça a l'air propre, mais ça ne l'est pas.",
  "___ : la meilleure façon de finir sa nuit.",
  "Après ___, plus jamais de sodomie sans ___.",
  "Ma nuit en résumé : ___, puis ___, puis le noir complet.",
  "Le combo parfait pour une nuit sauvage : ___ et ___.",
  "J'ai mélangé ___ avec ___ et j'ai vomi pendant deux jours.",
  "Le titre de ma sextape : « ___ et ___ ».",
  "Mon kink secret : ___ pendant ___.",
  "Mon ex m'a quitté(e) pour ___, puis est revenu pour ___.",
  "J'ai échangé ___ contre ___ en soirée échangiste.",
  "Dans le dark room, j'ai senti ___ puis ___.",
  "Le safe word, c'était ___, mais j'ai crié ___.",
  "Le kit de survie du lendemain de cuite : ___ et ___.",
  "On m'a surpris(e) en train de lécher ___.",
  "L'accessoire qui a ruiné mon dernier plan cul : ___.",
  "Au menu de l'after : ___, servi avec ___."
 ],
 "noir": [
  "À mon enterrement, je veux qu'on passe ___.",
  "Le croque-mort a trouvé dans le cercueil ___.",
  "Ce qui va survivre à l'apocalypse : les cafards et ___.",
  "La cause officielle du décès : ___.",
  "Mon testament tient en une ligne : ___.",
  "Le tueur en série de la ville signe ses crimes avec ___.",
  "En enfer, le supplice éternel, c'est ___.",
  "Le dernier mot de mon grand-oncle avant de mourir : « ___. »",
  "Au cimetière, quelqu'un a déposé ___ sur la tombe.",
  "Le nouveau service des pompes funèbres : ___ en option.",
  "L'urne de papi a été confondue avec ___.",
  "La fin du monde a été repoussée. Raison officielle : ___.",
  "Le médecin légiste a éclaté de rire en découvrant ___.",
  "Ce qui m'attend au paradis : ___.",
  "L'éloge funèbre le plus gênant : « Il (elle) adorait ___. »",
  "Dans la cave du voisin, la police a trouvé ___.",
  "Le zombie m'a épargné(e) : il a préféré ___.",
  "Le dernier repas du condamné : ___.",
  "La Mort frappe à ma porte et me tend ___.",
  "Le cimetière le plus branché de la ville propose ___.",
  "Mon fantôme hante la maison pour récupérer ___.",
  "Le prêtre a refusé l'extrême-onction en découvrant ___.",
  "Le pire endroit pour faire un arrêt cardiaque : ___.",
  "Le nouveau jeu télé : « Qui veut gagner ___ avant de mourir ? »",
  "Les héritiers se battent pour ___.",
  "La boîte noire de l'avion a enregistré ___.",
  "L'épitaphe sur ma tombe : « Ci-gît ___ ».",
  "Le diable m'a proposé un contrat contre ___.",
  "Dans le film d'horreur, le (la) premier(ère) à mourir est celui (celle) qui ramène ___.",
  "L'autopsie a révélé ___ dans l'estomac.",
  "Ce qui reste de l'humanité après la guerre nucléaire : ___.",
  "La secte du coin vénère ___.",
  "Le serial killer s'est fait coincer à cause d'un détail : ___.",
  "Dernier message avant la fin du monde : « N'oubliez pas ___. »",
  "Au crématorium, ça sent ___.",
  "Le meilleur cadeau pour un mourant : ___.",
  "La crise de la quarantaine m'a fait acheter ___.",
  "La seule chose qui donne encore un sens à ma vie : ___.",
  "L'assurance-vie ne couvre pas ___.",
  "Le tueur à la tronçonneuse a fait demi-tour en voyant ___.",
  "Les survivants de l'apocalypse se battent pour ___.",
  "Le corbillard est tombé en panne. Le garagiste a trouvé ___ dans le moteur.",
  "Ce que j'ai découvert en creusant le jardin : ___.",
  "Le nouveau parfum des pompes funèbres sent ___.",
  "La malédiction de la momie ? Levée avec ___.",
  "La voyante m'a prédit une mort causée par ___.",
  "Les vautours ont repéré ___.",
  "Mon répondeur après ma mort : « Désolé(e), je suis occupé(e) avec ___. »",
  "Le dernier cri en matière d'embaumement : ___.",
  "Ce qui pousse sur la tombe de mon ex : ___.",
  "L'exorciste a dû s'enfuir devant ___.",
  "Pour mes funérailles, le dress code est ___.",
  "La vie, c'est comme ___ : ça finit toujours mal.",
  "Mon horoscope : la Mort est dans votre signe, évitez ___.",
  "___ : la raison pour laquelle les morts reviennent.",
  "___ : la dernière chose que tu verras avant de mourir.",
  "Au programme des funérailles : ___, puis ___.",
  "La fin du monde selon les prophètes : ___, puis ___.",
  "Le kit de survie post-apocalyptique : ___ et ___.",
  "Mon fantôme hante ___ en hurlant ___.",
  "L'apocalypse en deux étapes : ___ et ensuite ___.",
  "Les dernières paroles du chef de secte : « ___, et surtout ___. »",
  "Dans le film d'horreur, on trouve ___ dans le grenier et ___ à la cave.",
  "Le seul souvenir de mon existence ratée : ___."
 ]
};
const PA = {
 "classique": [
  "ma dignité",
  "le regard insistant du voisin",
  "une raclette en plein mois d'août",
  "un nain de jardin avec un seul œil",
  "le karaoké de tonton",
  "une chaussette orpheline",
  "mon ex qui like encore mes photos",
  "un GPS sous antidépresseurs",
  "la belle-mère en maillot de bain",
  "un kebab à 4 h du matin",
  "une soirée diapos de vacances",
  "le cri de guerre de mamie",
  "un mime qui ne s'arrête jamais",
  "la sieste de 14 h",
  "un saucisson caché dans la poche",
  "le groupe de discussion des voisins",
  "une licorne en déprime",
  "mes chaussettes de la veille",
  "un influenceur en burn-out",
  "le dernier biscuit au chocolat",
  "un aspirateur robot nommé Gérard",
  "la playlist de mariage de mes parents",
  "un sudoku impossible",
  "le pull moche de Noël",
  "un tupperware qui ne ferme plus",
  "des pieds qui sentent le fromage",
  "un selfie avec le sosie de mon père",
  "la danse du ventre de papy",
  "un plat de lentilles froides",
  "un chef qui crie pour rien",
  "une réunion qui aurait pu être un mail",
  "le fond de la piscine municipale",
  "un mot de passe oublié",
  "une belle-mère qui juge tout le monde",
  "la file d'attente à la préfecture",
  "un barbecue sous la pluie",
  "le slip de bain du maître-nageur",
  "une tartiflette au petit-déjeuner",
  "un concert de flûte à bec",
  "mon horoscope chinois",
  "un diaporama de 80 diapos",
  "la voisine qui chante faux",
  "un retraité en trottinette électrique",
  "les miettes dans le clavier",
  "un videur de boîte en colère",
  "une coupe mulet assumée",
  "un tonton complotiste",
  "un yaourt périmé depuis 2019",
  "une moustache en chocolat",
  "le canapé de mes grands-parents",
  "une partie de cartes qui dure six heures",
  "une calvitie précoce",
  "un rôti brûlé",
  "un garde du corps de 1 m 50",
  "le chant des baleines en boucle",
  "le vélo d'appartement jamais utilisé",
  "une perruque en poils de moquette",
  "un jogging fluo",
  "la réunion de copropriété",
  "un gâteau en forme de dinosaure",
  "un grille-pain possédé",
  "la recette secrète de mamie",
  "un SMS envoyé à la mauvaise personne",
  "la vaisselle de la semaine dernière",
  "un DJ qui ne passe que de l'accordéon",
  "mon compte en banque à la fin du mois",
  "un pique-nique avec des fourmis",
  "un coloc qui fait mieux la cuisine que moi",
  "un piercing au sourcil raté",
  "la carte de fidélité du kebab",
  "une mamie en roller",
  "un repas de Noël sans fromage",
  "des lunettes de soleil la nuit",
  "la clim en panne en plein été",
  "un dossier « Impôts 2019 » de 40 Go",
  "une IA qui parle mieux que moi",
  "une sauce samouraï sur des pâtes",
  "une perceuse un dimanche matin",
  "un coach de vie de 19 ans",
  "un appel de mon banquier",
  "mon double menton en visio",
  "un mime en grève",
  "la queue au fast-food du coin",
  "le chant du coq à 5 h",
  "une crise existentielle au rayon fromage",
  "une trottinette dans le canal",
  "le dernier rouleau de PQ",
  "un vendeur de calendriers trop insistant",
  "une moule qui a vu des choses",
  "le wifi qui saute",
  "un costume de mascotte trop chaud",
  "le café de la machine du bureau",
  "un cours de zumba pour seniors",
  "la boîte à chaussures pleine de factures",
  "un pot de pâte à tartiner sans cuillère",
  "un DJ sous caféine",
  "mon voisin du dessus et sa perceuse",
  "une tente qui prend l'eau",
  "un gobelet réutilisable plein de bière tiède",
  "un concours de pets",
  "les cheveux dans la bonde de la douche",
  "une gaufre au fromage",
  "la timidité de mon banquier",
  "un vieux chewing-gum sous la table",
  "la dernière part de pizza",
  "la carte bleue de mes parents",
  "un réveil qui sonne pour rien",
  "la tante qui demande quand je me marie",
  "un plombier poète",
  "la sueur du voisin de métro",
  "un tracteur sur l'autoroute",
  "un coup de sabot en pleine tête",
  "une coloc qui ne fait jamais le ménage",
  "un chauffeur de VTC qui raconte sa vie",
  "une pantoufle en fausse fourrure",
  "un brushing raté",
  "le sapin de Noël encore là en mars",
  "un voisin de palier qui a tout vu",
  "la voix de ma mère au réveil",
  "un tatouage en chinois mal traduit",
  "le régime à base de chips",
  "une omelette au chocolat",
  "une pizza à l'ananas",
  "le collègue qui se croit drôle",
  "un repas sans pain",
  "la carte des vins du camping",
  "une odeur de friture qui me suit partout",
  "un short en jean trop court",
  "un pot de départ sans alcool",
  "le stagiaire qui a tout cassé",
  "la touche Entrée qui ne marche plus",
  "une glace qui coule sur les doigts",
  "une chanson de l'été en boucle",
  "un clown dépressif",
  "le cousin qui fait de la magie",
  "un ronflement de tracteur",
  "une chips au goût poulet rôti",
  "un cours de yoga raté",
  "le bonnet de grand-père",
  "un panier de linge sale",
  "une boîte de nuit vide",
  "un voisin trop poli pour être honnête",
  "un tour de magie qui finit mal",
  "la clé de la boîte aux lettres",
  "le boomerang qui ne revient pas",
  "une sieste de trois jours",
  "un dentier dans un verre d'eau",
  "le film d'auteur en noir et blanc",
  "les cookies brûlés",
  "un concours de grimaces",
  "un orchestre de kazoos",
  "un mannequin en plastique trop réaliste",
  "la queue pour les toilettes en festival",
  "un rendez-vous chez le dentiste",
  "un parachutiste qui a le vertige",
  "une dinde de Noël crue",
  "un sac banane",
  "un barbecue au gaz qui explose",
  "la machine à laver qui danse",
  "la voisine qui parle à ses plantes",
  "une plante verte en plastique",
  "mon talent pour le lancer de cacahuètes",
  "une bagarre de polochons",
  "un cours de salsa pour débutants",
  "des chaussettes avec des sandales",
  "un selfie au bord du volcan",
  "un saut à l'élastique raté",
  "une partie de pétanque tendue",
  "les mots fléchés de mamie",
  "une passion pour les timbres",
  "un bermuda à fleurs",
  "un mur de post-it",
  "un ex qui revient comme un boomerang",
  "le moustique de 3 h du matin",
  "une gourde qui fuit",
  "la vieille voiture de papa",
  "un appartement de 9 m²",
  "une sortie au bowling avec les collègues",
  "une confiture de navets",
  "mon cousin qui vend des cryptos",
  "un rire de hyène",
  "une enceinte connectée qui répète tout",
  "un pique-assiette professionnel",
  "un frigo vide",
  "la soupe aux choux",
  "un éternuement en plein discours",
  "un bonnet de bain trop serré",
  "la playlist « chill » de mon père",
  "un Père Noël qui fait la gueule",
  "une valise qui roule toute seule",
  "un bouton sur le nez avant un rendez-vous",
  "un repas végan chez des carnivores",
  "une bataille de nourriture",
  "un balai sans manche",
  "la musique d'attente du service client",
  "un concours de mangeurs de hot-dogs",
  "un livre jamais lu sur la table de nuit",
  "un chapeau de cow-boy",
  "un nain de jardin volé",
  "une partie de cache-cache qui a duré trois jours",
  "une passion secrète pour les comédies musicales",
  "la boîte de chocolats sans les pralinés",
  "mon colocataire en peignoir",
  "un mariage en tongs",
  "une fondue au fromage en plein désert",
  "un discours de témoin trop long",
  "une couverture de survie",
  "un mojito sans menthe",
  "un notaire qui fait du kung-fu",
  "le voisin qui tond la pelouse à 7 h",
  "un tapis de souris en forme de chat",
  "un karaoké en duo avec mon boss",
  "un calendrier de l'Avent vide",
  "un costume de dinosaure gonflable",
  "un appel en visio en pyjama",
  "une soirée raclette sans raclette",
  "un apéro qui finit à midi le lendemain",
  "un ticket de loto gagnant perdu",
  "la fausse plante de l'open space",
  "une cravate en forme de poisson",
  "une grand-mère qui joue aux jeux vidéo",
  "un lit superposé qui grince",
  "le dernier épisode de la série",
  "une ola dans un ascenseur",
  "un bocal de cornichons impossible à ouvrir",
  "une crêpe collée au plafond",
  "le parfum de papy",
  "une guerre de boules de neige en juillet",
  "un détecteur de fumée sans pile",
  "une bouteille de rosé tiède",
  "un plongeon raté",
  "un mime de dinosaure",
  "une moustache dessinée au feutre",
  "un toutou en costume de Père Noël"
 ],
 "hard": [
  "une capote périmée",
  "un plug anal oublié dans le lave-vaisselle",
  "une levrette dans un préfabriqué",
  "mon ex en string léopard",
  "une branlette sous la table",
  "un vibromasseur à piles qui s'emballe",
  "une éjaculation précoce en pleine déclaration",
  "du lubrifiant goût kebab",
  "un plan à trois avec le livreur",
  "un suçon géant sur le front",
  "une fellation ratée en plein virage",
  "mes poils pubiens dans la soupe",
  "un gode ceinture fluo",
  "une gorge profonde au pastis",
  "une sextape filmée en mode portrait",
  "le sperme sur le rideau de douche",
  "un trou de balle épilé à la cire",
  "une pipe dans un photomaton",
  "un cunni sous la couette en canicule",
  "un dildo de 40 centimètres",
  "une partouze au camping",
  "une mycose mal soignée",
  "les menottes perdues sans la clé",
  "un string comestible",
  "une gaule matinale devant le facteur",
  "un vomi sur la chaussure du videur",
  "une diarrhée en plein rapport",
  "la levrette du dimanche matin",
  "un orgasme simulé très mal joué",
  "un pet vaginal en plein silence",
  "une boulette de shit dans la chaussette",
  "un rail de coke sur le dos du coloc",
  "une biture au rhum arrangé",
  "un trip sous champignons au supermarché",
  "le préservatif resté coincé",
  "une baignoire pleine de lubrifiant",
  "une fessée qui laisse des marques",
  "un sex-toy qui parle trop fort",
  "une branlette espagnole ratée",
  "un herpès bien placé",
  "un cocu professionnel",
  "un fist au saindoux",
  "une gaule qui ne retombe pas",
  "un plan cul qui dit « je t'aime »",
  "une éjac faciale dans l'œil",
  "une pipe sans les dents… presque",
  "un 69 en équilibre sur une chaise",
  "mes boules qui collent à la cuisse",
  "un poil de cul dans la brosse à dents",
  "une soirée échangiste à l'agence pour l'emploi",
  "un gang bang mal organisé",
  "une bite en érection sur une photo de groupe",
  "une capote parfumée dans le sac de mamie",
  "une colique néphrétique en plein trip",
  "un vomi de vodka-pomme",
  "un réveil dans la baignoire en slip",
  "un tanga dans le cul toute la soirée",
  "les poppers du voisin",
  "un mec qui jouit en trois secondes",
  "un orgasme en hurlant le nom de son ex",
  "une chatte qui fait des bruits de ventouse",
  "une sodomie sans préparation",
  "mes tétons qui pointent en réunion",
  "un chaud lapin sous viagra",
  "une queue minuscule mais motivée",
  "un string en dentelle sous le costard",
  "un bukkake de crème chantilly",
  "la sodomie du nouvel an",
  "un string fluo qui dépasse du jean",
  "une fessée au martinet",
  "une bougie de massage qui brûle",
  "mes couilles prises dans la braguette",
  "un pénis en forme de banane",
  "un tampon oublié depuis une semaine",
  "une MST offerte pour Noël",
  "une partouze dans la salle de pause",
  "une gueule de bois de trois jours",
  "un pet foireux en position du missionnaire",
  "une pelle au goût de vomi",
  "un coït dans la cabine d'essayage",
  "une chaude-pisse carabinée",
  "un dildo dans la valise à l'aéroport",
  "mes fesses sur la photocopieuse",
  "un strip-teaseur en imperméable",
  "une branlette au gant de cuisine",
  "un vagin qui sent le reblochon",
  "un slip kangourou plein de traces",
  "une capote utilisée comme ballon",
  "une sex-machine achetée sur un coup de tête",
  "un plan cul qui garde ses chaussettes",
  "le sex-shop du centre commercial",
  "une soirée cuir et latex chez les voisins",
  "un trip d'acide au mariage",
  "les joints roulés avec du papier toilette",
  "une crise de foie au cognac",
  "un ecstasy coupé à la lessive",
  "la gerbe de minuit dans le taxi",
  "une prof de pole dance qui m'a tout appris",
  "une queue qui sent le camembert",
  "un cocktail de MDMA et de boisson énergisante",
  "un tabouret vibrant",
  "une cagoule de soumission",
  "la pince à tétons de mamie",
  "un cul qui pète au moindre effort",
  "un réveil à côté d'un inconnu tatoué",
  "une trace de rouge à lèvres sur le caleçon",
  "une capote sur la tête façon bonnet",
  "les poils de mon ex dans le siphon",
  "un pipi au lit après dix pintes",
  "un aller simple aux urgences proctologiques",
  "mon dealer qui fait aussi traiteur",
  "un cunni à la chantilly",
  "un massage qui finit mal",
  "une bite tatouée",
  "un piercing au clito qui sonne au portique",
  "une gaine amincissante arrachée avec les dents",
  "un plan à trois avec deux collègues de la compta",
  "un godemichet en forme de tour Eiffel",
  "une baise rapide dans l'ascenseur",
  "une pipe à la menthe forte",
  "une chatte rasée en étoile",
  "du sperme dans les cheveux au réveil",
  "des fesses pleines de sable",
  "une pénétration sur le capot de la voiture",
  "un accident scato évité de justesse",
  "une golden shower ratée",
  "un caleçon sale reniflé en secret",
  "une nuit à quatre dans un lit simple",
  "le vibro coincé dans la machine à laver",
  "une orgie au club du troisième âge",
  "un glory hole percé trop bas",
  "mes seins qui s'échappent du maillot",
  "un pet en pleine pipe",
  "les fesses du livreur de pizza",
  "un mec tout nu sur le palier",
  "une nana qui sniffe sur le comptoir",
  "un plan cul trouvé dans la file du kebab",
  "un slip en latex qui fait ventouse",
  "un shot de tequila bu dans le nombril",
  "un beer-pong à la vodka",
  "un réveil sur le parking de la boîte",
  "un vomi en jet sur la piste de danse",
  "un épilateur électrique sur les couilles",
  "mon herpès qui revient pour les fêtes",
  "un cul plein de paillettes",
  "une bite qui fait la gueule",
  "une mouille record",
  "un orgasme si bruyant que les voisins ont appelé les flics",
  "un coup d'un soir avec mon prof de yoga",
  "une capote en guise de chapeau de fête",
  "un clito introuvable",
  "une éjaculation dans la sauce bolognaise",
  "un orgasme en pleine messe",
  "une queue qui se coince dans la fermeture éclair",
  "un plan à quatre avec deux inconnus du bus",
  "une fessée devant tout le bureau",
  "les menottes en fourrure rose",
  "une boîte de capotes vide le lundi",
  "un nichon qui sort en visio",
  "une nuit dans la cage d'escalier",
  "un cul poilu comme un ours",
  "un coup de rein qui casse le sommier",
  "un reste de coke dans le billet de dix",
  "un bang fait avec une bouteille d'eau",
  "une descente de champignons en pleine forêt",
  "la gueule de bois du siècle",
  "une trace de pneu dans le slip",
  "un vomi dans la boîte à gants",
  "un fist sans gant",
  "une couche pour adulte en soirée",
  "mon lubrifiant dans la salade de pâtes",
  "un cocu qui filme",
  "un réveil collé au matelas",
  "la capote retrouvée trois jours plus tard",
  "une soirée strip-poker qui dégénère",
  "les gémissements des voisins à 3 h",
  "une fellation sous les étoiles et les moustiques",
  "une pipe sur l'aire d'autoroute",
  "une queue qui brasse surtout du vent",
  "des boules de geisha oubliées dans le métro",
  "un orgasme en pleine réunion en visio",
  "un plug en forme de sapin de Noël",
  "mes poils de torse dans ta bouche",
  "le string qui reste coincé entre les fesses",
  "un concours de pipes au séminaire d'entreprise",
  "une fessée avec une tong",
  "une sodomie au clair de lune",
  "mon gode qui sent le pied",
  "un camping naturiste en pleine tempête",
  "une cuite au calva à 9 h du matin",
  "une capote mise à l'envers",
  "des préliminaires de quatre secondes",
  "un coït interrompu par la belle-mère",
  "un vibro qui démarre en pleine messe",
  "un jacuzzi plein de choses non identifiées",
  "un suppositoire mis à l'envers",
  "un plan cul de 82 ans très en forme",
  "un pénis qui siffle quand il rétrécit",
  "le chewing-gum utilisé comme lubrifiant",
  "les toilettes de la boîte après 4 h",
  "un orgasme dans le train de nuit",
  "une crampe en pleine levrette",
  "un réveil avec du vomi dans les cheveux",
  "une branlette dans les toilettes de l'avion",
  "un rapport sexuel de quarante-cinq secondes",
  "une pipe offerte pour un ticket de bus",
  "des menottes accrochées au radiateur brûlant",
  "un plan cul qui ronfle comme un camion",
  "une capote retournée trois fois",
  "un jacuzzi de vin chaud",
  "une gueule de bois au mezcal et au regret",
  "un string qui sent le cumin"
 ],
 "noir": [
  "un cercueil en kit à monter soi-même",
  "les cendres de papi dans le sucrier",
  "une veillée funèbre avec karaoké",
  "un corbillard en double file",
  "le testament rédigé au feutre",
  "une pierre tombale en promo",
  "un zombie qui a gardé ses bonnes manières",
  "un croque-mort qui fait des blagues",
  "une fosse commune avec vue sur la mer",
  "la tronçonneuse de l'oncle Albert",
  "un squelette dans le placard, au sens propre",
  "un pacte avec le diable signé en soirée",
  "une malédiction familiale très tenace",
  "l'odeur du crématorium un jour de vent",
  "un fantôme qui squatte la salle de bain",
  "la fin du monde un mardi matin",
  "un astéroïde nommé Gérard",
  "un bunker rempli de conserves de cassoulet",
  "un clown tueur au chômage",
  "une poupée qui cligne des yeux toute seule",
  "la Faucheuse en arrêt maladie",
  "une messe d'enterrement sponsorisée",
  "le dernier souffle de mon téléphone",
  "un hachoir rangé avec les couverts",
  "une cave insonorisée",
  "un cadavre dans le congélateur du garage",
  "une seconde vie en enfer",
  "la chambre froide de la boucherie",
  "une momie qui sent le renfermé",
  "un cimetière avec le wifi gratuit",
  "une urne funéraire utilisée comme vase",
  "un héritage de dettes",
  "une pelle et un alibi",
  "le fantôme de mon ex",
  "les vers qui m'attendent patiemment",
  "un sacrifice humain pour avoir du réseau",
  "une secte qui fait aussi traiteur",
  "la peste revenue par erreur",
  "une grippe zombie",
  "une guerre nucléaire déclenchée par erreur",
  "le dernier humain sur Terre et sa plante verte",
  "de la poudre d'os dans le café",
  "un embaumement raté",
  "une tombe ouverte un soir de pleine lune",
  "le cri qui vient de la cave",
  "une hache plantée dans la porte",
  "un tueur masqué très ponctuel",
  "un médecin légiste qui mange sur le cadavre",
  "la planche de ouija du grenier",
  "un démon qui se fait appeler Kevin",
  "le compte à rebours de l'apocalypse",
  "une vie entière gâchée en open space",
  "une crise existentielle à la caisse automatique",
  "le vide intersidéral de mon existence",
  "une retraite qui n'arrivera jamais",
  "un cimetière de Tamagotchi",
  "les condoléances par message vocal",
  "une couronne de fleurs en plastique",
  "un fossoyeur qui siffle en travaillant",
  "le cercueil trop petit",
  "un mort qui bouge encore un peu",
  "une exhumation pour récupérer un bijou",
  "une dent en or arrachée au cadavre",
  "un notaire qui ricane",
  "les héritiers qui se crêpent le chignon",
  "un dernier repas au micro-ondes",
  "un caveau familial en colocation",
  "le grand vide après la mort",
  "l'enfer, c'est les autres en réunion",
  "un purgatoire avec musique d'attente",
  "les dix plaies d'Égypte en même temps",
  "un ange déchu en jogging",
  "la messe noire du jeudi soir",
  "un cannibale végétarien depuis peu",
  "des os de poulet en guise de collier",
  "un pendule qui annonce ma mort",
  "une malle remplie de cheveux",
  "une maison hantée vendue à bon prix",
  "la porte qui grince toute seule",
  "une ambulance qui prend son temps",
  "un arrêt cardiaque en plein loto de la mairie",
  "la dernière fournée du crématorium",
  "le cimetière des animaux de compagnie",
  "un mausolée en forme de pyramide",
  "des asticots dans le gâteau d'anniversaire",
  "une autopsie en direct",
  "la chaise électrique en promotion",
  "une prophétie très précise",
  "une épidémie de morts-vivants polis",
  "la fin de l'humanité, mais en HD",
  "les quatre cavaliers de l'Apocalypse en trottinette",
  "un tueur en série qui collectionne les dents",
  "le cadavre de mes ambitions",
  "mon âme vendue pour un pain au chocolat",
  "une vie de regrets bien rangée",
  "une veuve noire très souriante",
  "le cri d'une banshee enrhumée",
  "la morgue un samedi soir",
  "une chambre d'hôpital sans télé",
  "un corps qui flotte dans la piscine",
  "un piano qui joue tout seul la nuit",
  "un serial killer qui fait du yoga",
  "la boîte crânienne de tonton",
  "un loup-garou en dépression",
  "une fin du monde annulée faute de participants",
  "le cimetière du coin un soir d'Halloween",
  "une crypte avec un digicode",
  "un vampire allergique au sang",
  "le néant absolu, mais avec des pubs",
  "la mort, mais en version payante",
  "une décapitation au coupe-papier",
  "une tombe sans nom au fond du jardin"
 ]
};
/* English decks (same packs, same ___ blank marker). */
const PQ_EN = {
 "classique": [
  "Tonight I ended up in the ER. The culprit: ___.",
  "The secret to my success? ___.",
  "My mom always warned me about ___.",
  "Now in theaters: \"___ 2: This Time It's Personal.\"",
  "Why am I still single? Blame ___.",
  "Roommate rule number one: we never share ___.",
  "Grandma's advice for a happy life: ___.",
  "My résumé, under \"Hobbies\": ___.",
  "One-star review: \"They served me ___ instead of dessert.\"",
  "My therapist says it all goes back to ___.",
  "What I actually did during lockdown: ___.",
  "Today's horoscope: Venus says avoid ___.",
  "Best man's speech: \"What brought these two together? ___.\"",
  "Delivery update: \"Your package containing ___ has arrived.\"",
  "The next Olympic sport: ___.",
  "My get-rich-quick plan: ___.",
  "3 a.m. thoughts: ___.",
  "The real reason I was late for work: ___.",
  "My hidden talent is ___.",
  "My latest search: \"how to get rid of ___.\"",
  "At Thanksgiving, my uncle brought up ___ again.",
  "New dating app: the only thing you match on is ___.",
  "The hottest trend in interior design: ___.",
  "I got a $500 fine for ___.",
  "This weekend's plan: ___ and a lot of napping.",
  "That weird noise in the kitchen? It was ___.",
  "The show everyone's bingeing: \"___: The Untold Story.\"",
  "For my birthday, all I want is ___.",
  "Worst excuse to cancel a date: \"Sorry, I have ___.\"",
  "In my will, I leave my neighbor ___.",
  "The cooking show judges spat out ___.",
  "My personal trainer quit after seeing ___.",
  "At Christmas, my mother-in-law brought ___ again.",
  "The neighborhood psychic sees ___ in your future.",
  "Everything went downhill when someone pulled out ___.",
  "The new designer perfume smells like ___.",
  "If I'm elected, my first act will be ___.",
  "New self-help bestseller: \"Letting Go of ___.\"",
  "I got kicked out of book club for ___.",
  "The travel guide strongly advises against ___.",
  "Turned away at the club. The reason: ___.",
  "What Grandma keeps hidden in her closet: ___.",
  "The new supermarket's slogan: \"Everything's on sale, even ___!\"",
  "The biggest lie on my dating profile: ___.",
  "My cat has been giving me weird looks ever since ___.",
  "I called customer service to complain about ___.",
  "Text from my ex at 3 a.m.: \"Remember ___?\"",
  "Grand prize at the county fair raffle: ___.",
  "What the firefighters found in my chimney: ___.",
  "The name of my future rock band: \"___.\"",
  "My secret weapon for finishing the marathon: ___.",
  "The video that blew up my channel: \"10 Ways to Use ___.\"",
  "Tonight's dress code: ___.",
  "Weather alert: tomorrow it'll be raining ___.",
  "My roommate left ___ in the fridge again.",
  "The new piece at the art museum is simply called ___.",
  "If I had a superpower, it would be ___.",
  "I've been sober ever since ___.",
  "In the meeting, my boss pitched ___ as the solution to everything.",
  "What made me cry during a movie: ___.",
  "The online fundraiser for ___ just passed a million dollars.",
  "There's always ___ in my beach bag.",
  "The next viral challenge: ___.",
  "Today's special at the diner: ___ with mystery sauce.",
  "Family group chat: \"Who posted ___?\"",
  "Airport security confiscated ___.",
  "The chef recommends ___ as a starter.",
  "My neighbor filed a complaint against me for ___.",
  "Why I quit the hiking club: ___.",
  "My most embarrassing profile pic: me with ___.",
  "The boss's retirement gift: ___.",
  "Grandma's secret ingredient: ___.",
  "Failed my driving test. Reason: ___.",
  "Breaking news: a nationwide shortage of ___.",
  "The board game that will tear families apart this Christmas: ___.",
  "My physical therapist told me to stop ___.",
  "The most suspicious thing on my playlist: ___.",
  "Public pool evacuated: lifeguards found ___ in the deep end.",
  "What really goes on by the office coffee machine: ___.",
  "The new miracle diet: nothing but ___.",
  "My life, summed up in one picture: ___.",
  "New nature documentary: \"___ in the Wild.\"",
  "I lost the bet, so now I have to live with ___ for a week.",
  "The world's shortest TED talk: \"___.\"",
  "Someone brought ___ to the block party.",
  "What I found under the couch: ___.",
  "The latest team-building retreat: ___ in the woods.",
  "The genie grants me one wish: ___.",
  "My bank called: they noticed ___ on my statement.",
  "The title of my memoir: \"___ and Other Disasters.\"",
  "My driving instructor lost it when he saw ___.",
  "The best way to make guests leave: ___.",
  "My New Year's resolution: ___.",
  "The mayor unveiled a statue of ___.",
  "The hotel Wi-Fi network is called \"___.\"",
  "___: the number one cause of divorce.",
  "___? There's an app for that.",
  "___ is like riding a bike: you never forget how.",
  "Nothing beats ___ on a Sunday morning.",
  "My landlord just banned ___ from the building.",
  "My boss caught me red-handed with ___.",
  "The invention that will change the world: ___, but with Bluetooth.",
  "When I've had too much to drink, all I talk about is ___.",
  "I replaced ___ with ___ and nobody noticed.",
  "Summer blockbuster: \"___ vs. ___.\"",
  "The forbidden combo: ___ with ___.",
  "First date tips: ___, and never ___.",
  "My mom walked in on me with ___ and ___ in the same room.",
  "Reality TV's new power couple: ___ and ___.",
  "At happy hour, we started talking about ___, then ___ ruined everything.",
  "The unlikely vacation duo: ___ and ___.",
  "The controversial local specialty: ___ in gravy with a side of ___.",
  "My weekend in a nutshell: ___, then ___.",
  "Recipe for the perfect night: ___, ___, and nobody ever mentions it again.",
  "Fight of the year: ___ vs. ___.",
  "The winning combo for a lazy Sunday: ___ and ___."
 ],
 "hard": [
  "My hookup dumped me. Their reason: ___.",
  "What I found in my bed after the party: ___.",
  "The hottest new sex toy: ___.",
  "Mid-orgasm, I screamed: \"___!\"",
  "My worst hangover started with ___.",
  "The secret to a steamy night? ___.",
  "I had to explain ___ to my doctor.",
  "My most unspeakable fantasy: ___.",
  "Embarrassing notification: \"Your order has shipped in discreet packaging. Contents: ___.\"",
  "I threw up on ___.",
  "The new Kama Sutra position is called ___.",
  "What really happened in the hot tub: ___.",
  "My ex is telling everyone I'm into ___.",
  "To spice things up, the sex therapist recommends ___.",
  "What I snorted at the party: ___.",
  "In my roommates' nightstand: ___.",
  "I got kicked out of the swingers' party for ___.",
  "The worst place to have sex: ___.",
  "My incognito browsing history: ___.",
  "When I woke up, there was ___ on my ass.",
  "The hit new porno: \"___.\"",
  "My never-fail pickup move: ___.",
  "The first thing I did after the breakup: ___.",
  "The condom broke. The culprit: ___.",
  "My date from the app brought ___ to our first date.",
  "The worst noise during sex: ___.",
  "Why they call me \"the vacuum\": ___.",
  "What gets me wet: ___.",
  "My gynecologist burst out laughing at ___.",
  "At strip poker, I lost ___.",
  "Tonight's cocktail: vodka, apple juice, and ___.",
  "The biggest fail of my sex life: ___.",
  "What's rolling around in my hookup's glove box: ___.",
  "Tonight's safe word: \"___.\"",
  "My last jerk-off session was interrupted by ___.",
  "I sent the wrong group chat a photo of me with ___.",
  "The sex shop clerk recommended ___.",
  "The world's best aphrodisiac: ___.",
  "The mushroom trip went sideways when we saw ___.",
  "The gangbang was canceled. Official reason: ___.",
  "What I found in my boss's browser history: ___.",
  "My threesome ended with ___.",
  "What makes me finish way too early: ___.",
  "That weird smell in the bedroom? It's ___.",
  "What I took a picture of while throwing up: ___.",
  "The worst time to get a boner: during ___.",
  "My favorite vibrator is named ___.",
  "This season's hottest STD is caught by touching ___.",
  "Ten shots later, I ended up making out with ___.",
  "The worst place to find a used condom: ___.",
  "I got caught with ___ in the club bathroom.",
  "ER, 4 a.m. What they had to pull out of me: ___.",
  "My dick has a name, and it's ___.",
  "What killed my boner instantly: ___.",
  "The brunch menu after an all-night orgy: ___.",
  "The must-have accessory for any BDSM party: ___.",
  "Packed for a dirty weekend: ___.",
  "My ex left me a little souvenir: ___.",
  "The real reason I can't sit down anymore: ___.",
  "What's left of my dignity after last night: ___.",
  "The new lube flavor: ___.",
  "I slept with my boss to get ___.",
  "Worst text to get the morning after: \"Thanks for ___.\"",
  "The DJ dropped ___ and everyone took their clothes off.",
  "The weirdest kink I've ever tried: ___.",
  "After a night with me, you'll never look at ___ the same way.",
  "I lost ___ at the foam party.",
  "What came out of my nose after the party: ___.",
  "The casting call for the next adult film requires ___.",
  "The first thing I hide when my parents drop by: ___.",
  "My new tattoo, right above my butt crack: ___.",
  "Last night's pillow talk: ___.",
  "What got me banned from every dating app: ___.",
  "I've been banned from the sauna ever since ___.",
  "My hookups give me five stars for ___.",
  "The world's worst aphrodisiac: ___.",
  "My roommate walked in on me alone with ___.",
  "My last 3 a.m. purchase, totally wasted: ___.",
  "The pregnancy test is positive. Thanks a lot, ___.",
  "My most shameful afterparty moment: ___.",
  "The ringleader of the orgy was ___.",
  "The perfect bachelor party gift: ___.",
  "The perfect bachelorette party gift: ___.",
  "The best way to end a boozy night: ___.",
  "My doctor has strictly forbidden ___.",
  "What squirts everywhere if you're not careful: ___.",
  "On the new hookup app, everyone's profile pic is ___.",
  "___: looks clean, but it's really not.",
  "___: the best way to end the night.",
  "After ___, no more anal without ___.",
  "My night in a nutshell: ___, then ___, then total blackout.",
  "The perfect combo for a wild night: ___ and ___.",
  "I mixed ___ with ___ and puked for two days.",
  "The title of my sex tape: \"___ and ___.\"",
  "My secret kink: ___ during ___.",
  "My ex left me for ___, then came back for ___.",
  "At the swingers' party, I traded ___ for ___.",
  "In the dark room, I felt ___ and then ___.",
  "The safe word was ___, but I screamed ___.",
  "Hangover survival kit: ___ and ___.",
  "I got caught licking ___.",
  "The accessory that ruined my last hookup: ___.",
  "On the afterparty menu: ___, served with ___."
 ],
 "noir": [
  "At my funeral, I want them to play ___.",
  "The undertaker found ___ in the coffin.",
  "What will survive the apocalypse: cockroaches and ___.",
  "Official cause of death: ___.",
  "My entire will is one line long: ___.",
  "The town's serial killer signs his work with ___.",
  "Eternal punishment in hell: ___.",
  "My great-uncle's last words: \"___.\"",
  "Someone left ___ on the grave.",
  "New funeral home service: ___ as an add-on.",
  "Grandpa's urn got mixed up with ___.",
  "The end of the world has been postponed. Official reason: ___.",
  "The medical examiner burst out laughing when she found ___.",
  "What's waiting for me in heaven: ___.",
  "The most awkward eulogy ever: \"He just loved ___.\"",
  "In the neighbor's basement, the police found ___.",
  "The zombie spared me: it went for ___ instead.",
  "The condemned man's last meal: ___.",
  "Death knocks on my door and hands me ___.",
  "The trendiest cemetery in town now offers ___.",
  "My ghost haunts the house to get back ___.",
  "The priest refused to give last rites after discovering ___.",
  "The worst place to have a heart attack: ___.",
  "New game show: \"Who Wants to Win ___ Before They Die?\"",
  "The heirs are fighting over ___.",
  "The plane's black box recorded ___.",
  "My epitaph: \"Here lies ___.\"",
  "The devil offered me a deal in exchange for ___.",
  "In horror movies, the first to die is whoever brings ___.",
  "The autopsy found ___ in the stomach.",
  "What's left of humanity after the nuclear war: ___.",
  "The local cult worships ___.",
  "The serial killer got caught because of one tiny detail: ___.",
  "Last message before the end of the world: \"Don't forget ___.\"",
  "At the crematorium, it smells like ___.",
  "The perfect gift for a dying man: ___.",
  "My midlife crisis made me buy ___.",
  "The only thing that still gives my life meaning: ___.",
  "Life insurance doesn't cover ___.",
  "The chainsaw killer turned back when he saw ___.",
  "The apocalypse survivors are fighting over ___.",
  "The hearse broke down. The mechanic found ___ in the engine.",
  "What I dug up in the backyard: ___.",
  "The funeral home's new air freshener smells like ___.",
  "The mummy's curse? Lifted with ___.",
  "The psychic predicted I'll die because of ___.",
  "The vultures are circling over ___.",
  "My voicemail after I die: \"Sorry, I'm busy with ___.\"",
  "The latest thing in embalming: ___.",
  "What's growing on my ex's grave: ___.",
  "The exorcist ran away from ___.",
  "Dress code for my funeral: ___.",
  "Life is like ___: it always ends badly.",
  "My horoscope: Death is in your sign, so avoid ___.",
  "___: the reason the dead come back.",
  "___: the last thing you'll see before you die.",
  "On the funeral program: ___, then ___.",
  "The end of the world, according to the prophets: ___, then ___.",
  "Post-apocalyptic survival kit: ___ and ___.",
  "My ghost haunts ___ while screaming about ___.",
  "The apocalypse in two easy steps: ___, then ___.",
  "The cult leader's last words: \"___, and above all, ___.\"",
  "In the horror movie, there's ___ in the attic and ___ in the basement.",
  "The only proof I ever existed: ___."
 ]
};
const PA_EN = {
 "classique": [
  "my dignity",
  "a gas station sushi platter",
  "a fondue party in mid-August",
  "a garden gnome with one eye",
  "a karaoke solo nobody asked for",
  "a single lonely sock",
  "an ex who still likes all my posts",
  "a GPS with an attitude problem",
  "a neighbor in a tiny Speedo",
  "a 4 a.m. kebab",
  "a three-hour vacation slideshow",
  "a battle cry from the back row",
  "a mime who never stops",
  "the 2 p.m. food coma",
  "a salami hidden in my coat pocket",
  "the neighborhood group chat",
  "a sad clown at a corporate party",
  "yesterday's socks",
  "a burned-out influencer",
  "the last chocolate chip cookie",
  "a robot vacuum named Steve",
  "a wedding playlist from 1997",
  "an impossible sudoku",
  "an ugly Christmas sweater",
  "a Tupperware lid that fits nothing",
  "feet that smell like blue cheese",
  "a selfie with a celebrity lookalike",
  "a belly dance at the office party",
  "a bowl of cold lentils",
  "a boss who yells for no reason",
  "a meeting that could have been an email",
  "the bottom of the public pool",
  "a forgotten password",
  "a coworker who judges everyone's lunch",
  "the line at the DMV",
  "a barbecue in the pouring rain",
  "the lifeguard's tiny swim trunks",
  "mac and cheese for breakfast",
  "a bagpipe recital at dawn",
  "my horoscope",
  "an 80-slide PowerPoint",
  "a neighbor who sings off-key",
  "a retiree on an electric scooter",
  "crumbs in the keyboard",
  "an angry bouncer",
  "a proudly owned mullet",
  "a conspiracy theorist at the dinner table",
  "a yogurt that expired in 2019",
  "a chocolate mustache",
  "a plastic-covered couch",
  "a card game that lasts six hours",
  "premature balding",
  "a burnt pot roast",
  "a four-foot-ten bodyguard",
  "rainforest sounds on repeat",
  "an exercise bike used as a coat rack",
  "a wig made of carpet",
  "a neon tracksuit",
  "the homeowners' association meeting",
  "a birthday cake shaped like a tax form",
  "a possessed toaster",
  "a family secret recipe",
  "a text sent to the wrong person",
  "last week's dishes",
  "a DJ who only plays accordion music",
  "my bank account at the end of the month",
  "a picnic in a hailstorm",
  "a roommate who cooks better than me",
  "a botched eyebrow piercing",
  "a punch card from the late-night burrito place",
  "a flash mob in the dentist's waiting room",
  "a Christmas dinner without cheese",
  "sunglasses at night",
  "a broken AC in mid-July",
  "a 40-gigabyte folder named \"Taxes 2019\"",
  "an AI that talks better than me",
  "hot sauce on spaghetti",
  "a power drill on a Sunday morning",
  "a life coach who lives in a van",
  "a call from my bank",
  "my double chin on a video call",
  "a mime on strike",
  "the drive-thru line at midnight",
  "a car alarm at 5 a.m.",
  "an existential crisis in the cheese aisle",
  "an electric scooter in the canal",
  "the last roll of toilet paper",
  "a pushy calendar salesman",
  "a vending machine that has seen things",
  "Wi-Fi that keeps cutting out",
  "a mascot costume in August",
  "office coffee",
  "a Zumba class for seniors",
  "a shoebox full of unpaid bills",
  "a jar of chocolate spread and no spoon",
  "a DJ on six espressos",
  "the upstairs neighbor and his power drill",
  "a leaky tent",
  "a reusable cup full of warm beer",
  "a farting contest",
  "hair in the shower drain",
  "a waffle with ketchup",
  "my banker's crippling shyness",
  "old gum under the table",
  "the last slice of pizza",
  "my parents' credit card",
  "an alarm that goes off for no reason",
  "the coworker who asks when I'm getting married",
  "a plumber who writes poetry",
  "the sweat of the guy next to me on the subway",
  "a tractor on the freeway",
  "a flip-flop to the face",
  "a roommate who never cleans",
  "an Uber driver who tells me his whole life story",
  "fake-fur slippers",
  "a blowout gone wrong",
  "a Christmas tree still up in March",
  "a neighbor who saw everything",
  "a tattoo in badly translated Chinese",
  "a diet based on potato chips",
  "a chocolate omelet",
  "pineapple pizza",
  "the coworker who thinks he's hilarious",
  "a dinner with no bread",
  "the campground wine list",
  "a smell of fried food that follows me everywhere",
  "jean shorts that are way too short",
  "a farewell party with no alcohol",
  "the intern who broke everything",
  "an Enter key that doesn't work",
  "ice cream melting down my fingers",
  "the song of the summer on repeat",
  "a depressed clown",
  "an amateur magician at every party",
  "snoring like a chainsaw",
  "roast-chicken-flavored chips",
  "a yoga class gone wrong",
  "a basket of dirty laundry",
  "an empty nightclub",
  "a neighbor who's too polite to be trusted",
  "a magic trick that ends badly",
  "the mailbox key",
  "a boomerang that never comes back",
  "a three-day nap",
  "dentures in a glass of water",
  "an artsy black-and-white film",
  "burnt cookies",
  "a funny-face contest",
  "a kazoo orchestra",
  "a creepily realistic mannequin",
  "the bathroom line at a music festival",
  "a dentist appointment",
  "a skydiver who's afraid of heights",
  "a raw Christmas roast",
  "a fanny pack",
  "an exploding gas grill",
  "a washing machine that dances across the floor",
  "the neighbor who talks to her plants",
  "a plastic houseplant",
  "my talent for catching peanuts in my mouth",
  "a pillow fight",
  "a beginner salsa class",
  "socks with sandals",
  "a selfie at the edge of a volcano",
  "a bungee jump gone wrong",
  "a tense game of bocce",
  "a crossword puzzle done in pen",
  "a passion for stamp collecting",
  "Hawaiian-print shorts",
  "a wall of sticky notes",
  "an ex who keeps coming back",
  "the 3 a.m. smoke detector chirp",
  "a leaky water bottle",
  "a beat-up old station wagon",
  "a 90-square-foot apartment",
  "bowling night with coworkers",
  "turnip jam",
  "a friend who just got into crypto",
  "a laugh like a car alarm",
  "a smart speaker that repeats everything",
  "a professional freeloader",
  "an empty fridge",
  "cabbage soup",
  "a sneeze in the middle of a speech",
  "a swim cap that's way too tight",
  "a \"chill vibes\" playlist",
  "a grumpy mall Santa",
  "a suitcase that rolls away on its own",
  "a zit on my nose before a date",
  "a vegan dinner at a steakhouse",
  "a food fight",
  "a broom with no handle",
  "customer service hold music",
  "a hot-dog-eating contest",
  "an unread book on the nightstand",
  "a cowboy hat",
  "a stolen garden gnome",
  "a game of Monopoly that lasted three days",
  "a secret love of musicals",
  "a box of chocolates with only the gross ones left",
  "my roommate in a bathrobe",
  "a wedding in flip-flops",
  "cheese fondue in the desert",
  "a best man's speech that won't end",
  "a space blanket",
  "a mojito with no mint",
  "a tax accountant who does kung fu",
  "the neighbor who mows the lawn at 7 a.m.",
  "a mouse pad with a motivational quote",
  "a karaoke duet with my boss",
  "an empty Advent calendar",
  "an inflatable T. rex costume",
  "a video call in pajamas",
  "a fondue night with no cheese",
  "drinks that end at noon the next day",
  "a winning lottery ticket I lost",
  "the fake plant in the open-plan office",
  "a tie with tiny tacos on it",
  "a retiree who's ranked in online shooters",
  "a squeaky bunk bed",
  "the season finale",
  "a stadium wave in an elevator",
  "a pickle jar that won't open",
  "a pancake stuck to the ceiling",
  "a cologne called Midlife Crisis",
  "a snowball fight in July",
  "a smoke detector with no battery",
  "a bottle of warm rosé",
  "a belly flop",
  "an interpretive dance about taxes",
  "a mustache drawn on in Sharpie",
  "a bodybuilder in a Santa costume",
  "a gym membership I never use",
  "a work group project where I did everything"
 ],
 "hard": [
  "an expired condom",
  "a butt plug forgotten in the dishwasher",
  "doggy style in a construction trailer",
  "my ex in a leopard-print thong",
  "a handjob under the dinner table",
  "a battery-powered vibrator going haywire",
  "premature ejaculation mid-proposal",
  "kebab-flavored lube",
  "a threesome with the delivery guy",
  "a giant hickey on my forehead",
  "a blowjob that went wrong on a sharp turn",
  "my pubes in the soup",
  "a glow-in-the-dark strap-on",
  "deep throat after six tequilas",
  "a sex tape filmed vertically",
  "cum on the shower curtain",
  "a waxed asshole",
  "a blowjob in a photo booth",
  "going down on someone under the duvet in a heat wave",
  "a 16-inch dildo",
  "an orgy at the campground",
  "a badly treated yeast infection",
  "handcuffs with no key",
  "edible underwear",
  "morning wood in front of the mailman",
  "puking on the bouncer's shoes",
  "diarrhea mid-hookup",
  "Sunday morning doggy style",
  "a really badly faked orgasm",
  "a queef in total silence",
  "a baggie of weed in my sock",
  "a line of coke off my roommate's back",
  "a rum-punch bender",
  "a mushroom trip at the supermarket",
  "a condom stuck where it shouldn't be",
  "a bathtub full of lube",
  "a spanking that leaves marks",
  "a sex toy that talks way too loud",
  "a titty-fuck gone wrong",
  "herpes in a very specific spot",
  "a professional cuckold",
  "fisting with a tub of margarine",
  "a boner that won't go down",
  "a hookup who says \"I love you\"",
  "a facial right in the eye",
  "a blowjob, no teeth… almost",
  "a 69 balanced on a folding chair",
  "balls stuck to my thigh",
  "an ass hair on my toothbrush",
  "a swingers' night at the unemployment office",
  "a badly organized gangbang",
  "a boner in the group photo",
  "a flavored condom in my boss's briefcase",
  "a kidney stone mid-trip",
  "a vodka-cranberry puke",
  "waking up in a bathtub in my underwear",
  "a thong wedged up my ass all night",
  "the neighbor's poppers",
  "a guy who finishes in three seconds",
  "an orgasm screaming my ex's name",
  "a pussy making suction-cup noises",
  "anal with zero warm-up",
  "my nipples poking through my shirt in a meeting",
  "a horndog on Viagra",
  "a tiny but very motivated dick",
  "a lace thong under a business suit",
  "a whipped-cream bukkake",
  "New Year's Eve anal",
  "a neon thong sticking out of my jeans",
  "a spanking with a riding crop",
  "a massage candle that actually burns",
  "my balls caught in my zipper",
  "a banana-shaped penis",
  "a tampon forgotten for a week",
  "an STD for Christmas",
  "an orgy in the break room",
  "a three-day hangover",
  "a wet fart in missionary position",
  "a kiss that tastes like vomit",
  "sex in a fitting room",
  "a raging case of the clap",
  "a dildo in my carry-on at the airport",
  "my ass on the office photocopier",
  "a stripper in a trench coat",
  "a handjob with an oven mitt",
  "a crotch that smells like gorgonzola",
  "tighty-whities full of skid marks",
  "a condom used as a water balloon",
  "a sex machine bought on impulse",
  "a hookup who keeps their socks on",
  "the sex shop at the mall",
  "a leather-and-latex party at the neighbors'",
  "an acid trip at a wedding",
  "joints rolled with toilet paper",
  "a liver crying for help after a cognac night",
  "ecstasy cut with laundry detergent",
  "a midnight puke in the taxi",
  "a pole-dance instructor who taught me everything",
  "a dick that smells like old camembert",
  "an MDMA and energy drink cocktail",
  "a vibrating barstool",
  "a gimp mask",
  "a vintage pair of nipple clamps",
  "an ass that farts at the slightest effort",
  "waking up next to a tattooed stranger",
  "lipstick on my boxers",
  "a condom worn as a beanie",
  "my ex's hair in the drain",
  "wetting the bed after ten pints",
  "an emergency trip to the proctologist",
  "my dealer who also sells insurance",
  "whipped-cream oral",
  "a massage that ended badly",
  "a tattooed dick",
  "a clit piercing that sets off the metal detector",
  "shapewear ripped off with teeth",
  "a threesome with two coworkers from accounting",
  "an Eiffel Tower–shaped dildo",
  "a quickie in the elevator",
  "a blowjob with extra-strong mints",
  "a star-shaped bikini wax",
  "cum in my hair in the morning",
  "a butt full of sand",
  "sex on the hood of the car",
  "a near-miss poop accident",
  "a golden shower gone wrong",
  "secretly sniffing dirty underwear",
  "four people in a twin bed",
  "a vibrator stuck in the washing machine",
  "an orgy at the retirement home",
  "a glory hole drilled way too low",
  "my boobs escaping my swimsuit",
  "a fart mid-blowjob",
  "the pizza guy's ass",
  "a naked guy in the hallway",
  "a woman doing lines off the bar",
  "a hookup I met in the kebab line",
  "latex underwear that creates suction",
  "a tequila body shot from a belly button",
  "beer pong with vodka",
  "waking up in the club parking lot",
  "projectile vomiting on the dance floor",
  "an epilator on my balls",
  "my herpes flaring up for the holidays",
  "an ass covered in glitter",
  "a sulking dick",
  "a record-breaking wet spot",
  "an orgasm so loud the neighbors called the cops",
  "a one-night stand with my yoga instructor",
  "a condom as a party hat",
  "a clit I just couldn't find",
  "cumming in the spaghetti sauce",
  "an orgasm in the middle of Sunday mass",
  "a dick that bends hard to the left",
  "a foursome with two strangers from the bus",
  "a spanking in front of the whole office",
  "pink fluffy handcuffs",
  "an empty box of condoms on Monday morning",
  "a boob slip on a video call",
  "a night in the stairwell",
  "an ass as hairy as a shag carpet",
  "a thrust that broke the bed frame",
  "coke residue on a ten-dollar bill",
  "a bong made from a water bottle",
  "a mushroom comedown in the middle of the woods",
  "the hangover of the century",
  "a pair of crusty gym shorts",
  "puke in the glove box",
  "fisting without gloves",
  "an adult diaper at a party",
  "my lube in the pasta salad",
  "a cuckold who films everything",
  "waking up stuck to the mattress",
  "the condom found three days later",
  "a strip poker night that got out of hand",
  "the neighbors moaning at 3 a.m.",
  "a blowjob under the stars in a thunderstorm",
  "a blowjob at a highway rest stop",
  "a dick that mostly stirs the air",
  "Ben Wa balls forgotten on the subway",
  "an orgasm during a video meeting",
  "a Christmas-tree-shaped butt plug",
  "my chest hair in your mouth",
  "a thong made of dental floss",
  "a blowjob contest at the company retreat",
  "a spanking with a flip-flop",
  "anal by moonlight",
  "a dildo that smells like feet",
  "a nudist campground in a hurricane",
  "a brandy bender at 9 a.m.",
  "a condom put on inside out",
  "four seconds of foreplay",
  "sex interrupted by my mother-in-law",
  "a vibrator going off in a job interview",
  "a hot tub full of unidentified things",
  "a suppository put in backwards",
  "an 82-year-old hookup in great shape",
  "a penis that whistles when it shrinks",
  "chewing gum used as lube",
  "the club bathrooms after 4 a.m.",
  "an orgasm on the night train",
  "a cramp mid–doggy style",
  "waking up with puke in my hair",
  "a handjob in the airplane bathroom",
  "forty-five seconds of sex",
  "a blowjob traded for a bus ticket",
  "handcuffs chained to a burning-hot radiator",
  "a hookup who snores like a truck",
  "a condom flipped over three times",
  "a hot tub full of mulled wine",
  "a hangover made of mezcal and regret",
  "a thong that smells like cumin"
 ],
 "noir": [
  "a flat-pack coffin with missing screws",
  "Grandpa's ashes in the sugar bowl",
  "a wake with karaoke",
  "a double-parked hearse",
  "a will written in eyeliner",
  "a headstone on clearance",
  "a zombie with excellent manners",
  "an undertaker who does stand-up",
  "a mass grave with an ocean view",
  "a chainsaw with a name engraved on it",
  "a skeleton in the closet, literally",
  "a deal with the devil signed at a party",
  "a very stubborn family curse",
  "the crematorium smell on a windy day",
  "a ghost who hogs the bathroom",
  "the end of the world on a Tuesday morning",
  "an asteroid named Gary",
  "a bunker full of canned chili",
  "an unemployed killer clown",
  "a doll that blinks on its own",
  "the Grim Reaper on sick leave",
  "a sponsored funeral",
  "my phone's dying breath",
  "a meat cleaver in the cutlery drawer",
  "a soundproofed basement",
  "a body in the garage freezer",
  "a second life in hell",
  "the butcher shop's walk-in freezer",
  "a mummy that smells musty",
  "a cemetery with free Wi-Fi",
  "a funeral urn used as a vase",
  "inheriting a mountain of debt",
  "a shovel and an alibi",
  "my ex's ghost",
  "the worms waiting patiently for me",
  "a human sacrifice for better cell reception",
  "a cult that also does catering",
  "the plague, back by mistake",
  "zombie flu",
  "a nuclear war started by accident",
  "the last human on Earth and his houseplant",
  "bone dust in the coffee",
  "a botched embalming",
  "an open grave on a full-moon night",
  "the scream coming from the basement",
  "an axe stuck in the front door",
  "a very punctual masked killer",
  "a coroner who eats lunch on the autopsy table",
  "the Ouija board from the attic",
  "a demon who goes by Brad",
  "the countdown to the apocalypse",
  "a whole life wasted in an open-plan office",
  "an existential crisis at the self-checkout",
  "the bottomless void of my existence",
  "a retirement that will never come",
  "a graveyard of dead smartphones",
  "condolences by voice note",
  "a plastic funeral wreath",
  "a gravedigger who whistles while he works",
  "a coffin that's one size too small",
  "a dead guy who's still twitching a little",
  "digging someone up to get back a ring",
  "a gold tooth pulled from a corpse",
  "a lawyer who giggles during the will reading",
  "heirs pulling each other's hair out",
  "a last meal from the microwave",
  "a family crypt with roommates",
  "the great nothingness after death",
  "hell, which is other people in a meeting",
  "purgatory with hold music",
  "all ten plagues of Egypt at once",
  "a fallen angel in sweatpants",
  "Thursday night black mass",
  "a cannibal who just went vegetarian",
  "a crystal skull from a gift shop",
  "a pendulum that predicts my death",
  "a trunk full of human hair",
  "a haunted house at a bargain price",
  "a door that creaks open by itself",
  "an ambulance taking its sweet time",
  "a heart attack at bingo night",
  "the crematorium's last batch of the day",
  "a pyramid-shaped mausoleum",
  "a birthday cake shaped like a tombstone",
  "a live-streamed autopsy",
  "the electric chair, now on sale",
  "a very specific prophecy",
  "a zombie outbreak at the office",
  "the end of humanity, but in 4K",
  "the Four Horsemen of the Apocalypse on electric scooters",
  "a serial killer who collects teeth",
  "the corpse of my ambitions",
  "my soul, sold for a croissant",
  "a neatly organized life of regrets",
  "a black widow with a big smile",
  "a banshee with a head cold",
  "the morgue on a Saturday night",
  "a hospital room with no TV",
  "a body floating in the pool",
  "a piano that plays itself at night",
  "a serial killer who does yoga",
  "a skull on the mantelpiece",
  "a poltergeist with anger issues",
  "an apocalypse canceled due to low turnout",
  "the local cemetery on Halloween night",
  "a crypt with a keypad lock",
  "a vampire who faints at the sight of blood",
  "absolute nothingness, but with ads",
  "death, now with a subscription plan",
  "a beheading with a letter opener",
  "an unmarked grave at the bottom of the yard",
  "a life-size cardboard cutout of the deceased"
 ]
};

// Contenu dans la langue de l'hôte (E.lg / s.lg) ; l'interface suit le téléphone (tr).
const QX = { fr: PQ, en: PQ_EN }, AX = { fr: PA, en: PA_EN };
const lgOf = lg => (lg === "en" ? "en" : "fr");
const PACKS = [
  { v: "classique", label: tr("Classique", "Classic"), desc: tr("Absurde, gênant, sous-entendus : pour tout le monde", "Absurd, awkward, innuendo: for everyone") },
  { v: "hard", label: "Hard", desc: tr("Sexe, trash, excès : aucune limite de bon goût", "Sex, trash, excess: zero limits on good taste"), hot: true },
  { v: "noir", label: tr("Humour noir", "Dark humor"), desc: tr("Mort, enterrements, fin du monde", "Death, funerals, the end of the world"), hot: true }
];
const packCount = k => QX[lgOf(SB.lang())][k].length + AX[lgOf(SB.lang())][k].length;
const HAND = 7, BL = "b:";
const SEEN_Q = "punchline:q", SEEN_A = "punchline:a";
const qPool = (packs, lg) => { const Q = QX[lgOf(lg)], p = A(packs).filter(k => Q[k]); return (p.length ? p : ["classique"]).flatMap(k => Q[k]); };
const aPool = (packs, lg) => { const P = AX[lgOf(lg)], p = A(packs).filter(k => P[k]); return (p.length ? p : ["classique"]).flatMap(k => P[k]); };
const holes = q => Math.max(1, Math.min(2, (String(q).match(/___/g) || []).length));

/* Coups de théâtre : une règle change pour une manche (jamais la première, jamais deux fois de suite). */
const TW = [
  { id: "jackpot", name: "Jackpot", desc: tr("La réponse gagnante rapporte 2 points.", "The winning answer scores 2 points.") },
  { id: "public", name: tr("Vote du public", "Crowd vote"), desc: tr("Pas de juge : tout le monde vote, et on ne vote pas pour soi.", "No judge: everyone votes, and you can't vote for yourself."), ok: o => o.n >= 4 },
  { id: "reverse", name: tr("Le monde à l'envers", "Upside down"), desc: tr("Le juge choisit la réponse la plus nulle : c'est elle qui gagne.", "The judge picks the worst answer: that one wins.") },
  { id: "double", name: tr("Deux chances", "Two shots"), desc: tr("Chacun joue deux réponses séparées. Le juge n'en garde qu'une.", "Everyone plays two separate answers. The judge keeps only one."), ok: o => o.need === 1 },
  { id: "roulette", name: "Roulette", desc: tr("Pas de choix : tes cartes sont tirées au hasard dans ta main. Pourvu que le sort soit drôle !", "No choosing: your cards are drawn at random from your hand. Here's hoping fate is funny!") },
  { id: "duel", name: "Duel", desc: tr("Seuls deux joueurs s'affrontent. La victoire vaut 2 points.", "Only two players face off. The win is worth 2 points."), ok: o => o.n >= 4 },
  { id: "fresh", name: tr("Main neuve", "Fresh hand"), desc: tr("Tout le monde défausse sa main et reçoit 7 nouvelles cartes.", "Everyone discards their hand and draws 7 new cards.") }
];
const twOf = id => SB.u.byTwist(TW, id);

/* ---------- Moteur commun (réseau et un seul téléphone) ---------- */
function drawA(E){
  if(!E.ad.length){
    const inHands = new Set(); Object.keys(E.hands).forEach(id => A(E.hands[id]).forEach(a => inHands.add(a)));
    E.ad = SB.u.fresh(SEEN_A, aPool(E.packs, E.lg).filter(a => !inHands.has(a)));
    if(!E.ad.length) E.ad = SB.u.fresh(SEEN_A, aPool(E.packs, E.lg));
  }
  const a = E.ad.pop(); SB.u.saw(SEEN_A, a); return a;
}
function drawQ(E){ if(!E.qd.length) E.qd = SB.u.fresh(SEEN_Q, qPool(E.packs, E.lg)); const q = E.qd.pop(); SB.u.saw(SEEN_Q, q); return q; }
function deal(E){ E.order.forEach(id => { E.hands[id] = A(E.hands[id]).slice(); while(E.hands[id].length < HAND) E.hands[id].push(drawA(E)); }); }
function newGame(order, o){
  const E = { lg: lgOf(o.lg || SB.lang()), order: order.slice(), packs: A(o.packs).length ? A(o.packs).slice() : ["classique"], target: o.target || 5, twOn: o.twists !== false,
    round: 0, judge: "", phase: "play", q: "", need: 1, tw: "", duel: [], subs: [], win: [], votes: {}, hands: {}, blanks: {},
    pts: {}, wins: {}, bw: {}, byJ: {}, miss: {}, qd: [], ad: [], fl: Math.floor(Math.random() * 12) };
  E.order.forEach(id => { E.hands[id] = []; E.blanks[id] = o.blank === false ? 0 : 2; });
  E.qd = SB.u.fresh(SEEN_Q, qPool(E.packs, E.lg)); E.ad = SB.u.fresh(SEEN_A, aPool(E.packs, E.lg));
  deal(E);
  return E;
}
// Qui doit jouer cette manche (parmi les présents).
function players(E, live){ const L = live || E.order; if(E.tw === "duel") return E.duel.filter(id => L.indexOf(id) >= 0); return E.order.filter(id => (E.tw === "public" || id !== E.judge) && L.indexOf(id) >= 0); }
function needOf(E){ return E.tw === "double" ? 2 : E.need; }
function nextRound(E, live){
  live = live && live.length ? live : E.order;
  E.round++;
  const L = E.order.filter(id => live.indexOf(id) >= 0), cur = L.indexOf(E.judge);
  E.judge = L[(cur + 1) % L.length] || E.order[0];
  E.q = drawQ(E); E.need = holes(E.q);
  const t = E.twOn && E.round > 1 ? SB.u.twist(TW, { last: E.tw, rate: .35, n: L.length, need: E.need }) : null;
  E.tw = t ? t.id : "";
  E.duel = E.tw === "duel" ? shuffle(L.filter(id => id !== E.judge)).slice(0, 2) : [];
  if(E.tw === "fresh"){ E.order.forEach(id => { E.hands[id] = []; }); deal(E); }
  E.subs = []; E.win = []; E.votes = {}; E.phase = "play";
  if(E.tw === "roulette") roulette(E, live);
}
// Une réponse jouée : o = liste ordonnée d'éléments ("3" = carte n°3 de la main, "b:texte" = carte blanche).
function check(E, id, o){
  o = A(o).map(String); const n = needOf(E), hand = A(E.hands[id]);
  if(o.length !== n) return null;
  const idx = o.filter(x => x.indexOf(BL) !== 0).map(Number), bl = o.filter(x => x.indexOf(BL) === 0);
  if(idx.some(i => !(i >= 0 && i < hand.length)) || new Set(idx).size !== idx.length) return null;
  if(bl.length > (E.blanks[id] || 0) || bl.some(x => !clean(x.slice(2), 80))) return null;
  return o.map(x => (x.indexOf(BL) === 0 ? { t: clean(x.slice(2), 80), b: 1 } : { t: hand[+x], i: +x }));
}
function toJudge(E, picks){
  const subs = [];
  Object.keys(picks).forEach(id => {
    const items = check(E, id, picks[id]); if(!items) return;
    if(E.tw === "double") items.forEach(it => subs.push({ id, a: [it.t], b: it.b ? 1 : 0 }));
    else subs.push({ id, a: items.map(it => it.t), b: items.some(it => it.b) ? 1 : 0 });
    const used = items.filter(it => it.i != null).map(it => it.i).sort((x, y) => y - x);
    used.forEach(i => E.hands[id].splice(i, 1));
    E.blanks[id] = (E.blanks[id] || 0) - items.filter(it => it.b).length;
  });
  deal(E);
  E.subs = shuffle(subs); E.votes = {}; E.phase = "judge";
  return subs.length;
}
function roulette(E, live){
  const picks = {};
  players(E, live).forEach(id => { const n = needOf(E); picks[id] = shuffle(A(E.hands[id]).map((_, i) => String(i))).slice(0, n); });
  toJudge(E, picks);
}
// Le juge (ou le public) a choisi : `chosen` = liste d'indices de E.subs gagnants.
function decide(E, chosen){
  const w = A(chosen).filter(i => E.subs[i]).map(Number);
  if(!w.length) return false;
  const gain = E.tw === "jackpot" || E.tw === "duel" ? 2 : 1;
  const authors = [];
  w.forEach(i => { const s = E.subs[i]; if(authors.indexOf(s.id) < 0) authors.push(s.id); if(s.b) E.bw[s.id] = (E.bw[s.id] || 0) + 1; });
  authors.forEach(id => {
    E.pts[id] = (E.pts[id] || 0) + gain; E.wins[id] = (E.wins[id] || 0) + 1;
    if(E.tw !== "public") E.byJ[E.judge + "|" + id] = (E.byJ[E.judge + "|" + id] || 0) + 1;
  });
  E.subs.forEach(s => { if(authors.indexOf(s.id) < 0) E.miss[s.id] = (E.miss[s.id] || 0) + 1; });
  E.win = w; E.gain = gain; E.phase = "rev";
  // Gages de la manche : les gagnants distribuent, les autres auteurs boivent.
  E.gl = authors.map(id => ({ id, ev: "gagne" })).concat(E.subs.map(s => s.id).filter((id, i, a) => a.indexOf(id) === i && authors.indexOf(id) < 0).map(id => ({ id, ev: "perd" })));
  return true;
}
// Vote du public : la ou les réponses avec le plus de voix (on ne vote pas pour soi).
function tally(E){
  const c = {};
  Object.keys(E.votes).forEach(v => { const i = +E.votes[v]; if(E.subs[i] && E.subs[i].id !== v) c[i] = (c[i] || 0) + 1; });
  const mx = Math.max(0, ...Object.values(c));
  return mx ? Object.keys(c).filter(i => c[i] === mx).map(Number) : [];
}
const over = E => E.order.some(id => (E.pts[id] || 0) >= E.target);
const ranking = E => E.order.slice().sort((a, b) => (E.pts[b] || 0) - (E.pts[a] || 0));

/* ---------- Affichage ---------- */
function cap(s, before){ return /(^|[.!?…:»"]\s*)$/.test(before) && s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
// La phrase avec les trous remplis (ou soulignés s'il manque des réponses).
function filled(q, ans){
  const parts = String(q).split("___"); let h = "", done = "";
  parts.forEach((p, i) => {
    h += esc(p); done += p;
    if(i < parts.length - 1){ const a = A(ans)[i]; h += a ? '<b class="pl-a">' + esc(cap(a, done)) + "</b>" : '<span class="pl-gap"></span>'; done += a || "x"; }
  });
  return h;
}
const FL = {
  win: tr(["Roi (reine) de la punchline", "Champion(ne) du mauvais goût", "Plus drôle que tout le monde", "Maître(sse) de la vanne", "Légende de la soirée"], ["Punchline royalty", "Champion of bad taste", "Funnier than everyone", "Master of the zinger", "Legend of the night"]),
  fav: tr(["Chouchou(te) du juge", "Fait toujours rire le même juge", "Dans les petits papiers du juge"], ["Judge's pet", "Always cracks up the same judge", "In the judge's good books"]),
  blank: tr(["Plume libre", "Auteur(e) maison", "Carte blanche en or"], ["Freelance writer", "In-house author", "Golden blank card"]),
  miss: tr(["Incompris(e)", "Trop en avance sur son temps", "Un humour venu du futur"], ["Misunderstood genius", "Ahead of their time", "Humor from the future"])
};
const fl = (list, seed, k) => list[((seed || 0) + k) % list.length];
function awards(E, nameOf){
  const out = [], used = [], seed = E.fl || 0;
  const top = (m, min) => { let b = "", v = min - 1; Object.keys(m || {}).forEach(id => { if((m[id] || 0) > v && used.indexOf(id) < 0){ v = m[id]; b = id; } }); if(b) used.push(b); return b; };
  let fk = "", fv = 1; Object.keys(E.byJ || {}).forEach(k => { if(E.byJ[k] > fv){ fv = E.byJ[k]; fk = k; } });
  if(fk){ const [j, w] = fk.split("|"); used.push(w); out.push([fl(FL.fav, seed, 1) + (/de$/.test(fl(FL.fav, seed, 1)) ? " " + nameOf(j) : ""), nameOf(w), tr(fv + " victoires avec " + nameOf(j) + " comme juge", fv + " wins with " + nameOf(j) + " as judge")]); }
  const b = top(E.bw, 1); if(b) out.push([fl(FL.blank, seed, 2), nameOf(b), tr(E.bw[b] + " victoire" + (E.bw[b] > 1 ? "s" : "") + " avec une carte blanche", E.bw[b] + (E.bw[b] > 1 ? " wins" : " win") + " with a blank card")]);
  const losers = {}; E.order.forEach(id => { if(!(E.wins[id] || 0) && (E.miss[id] || 0) >= 3) losers[id] = E.miss[id]; });
  const m = top(losers, 3); if(m) out.push([fl(FL.miss, seed, 3), nameOf(m), tr(E.miss[m] + " réponses, zéro victoire", E.miss[m] + " answers, zero wins")]);
  return out;
}
function awardsHTML(aw){ return aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : ""; }
function bars(E, nameOf){
  const max = Math.max(E.target, ...E.order.map(id => E.pts[id] || 0));
  return '<div class="bars">' + ranking(E).map(id => '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + (E.pts[id] || 0) + " / " + E.target + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (E.pts[id] || 0) / max) + '%"></div></div></div>').join("") + "</div>";
}
const CSS = '<style>' +
  '.pl-q{font-family:var(--f-disp); font-weight:800; font-size:26px; line-height:1.18; letter-spacing:-.01em; overflow-wrap:anywhere}' +
  '.pl-q .pl-a,.pl-s .pl-a{background:rgba(20,16,26,.14); border-radius:6px; padding:0 4px; box-decoration-break:clone; -webkit-box-decoration-break:clone}' +
  '.pl-gap{display:inline-block; width:3.2em; border-bottom:3px solid currentColor; transform:translateY(-4px); margin:0 2px}' +
  '.pl-h{display:flex; flex-direction:column; gap:8px}' +
  '.pl-c{position:relative; display:flex; align-items:center; gap:10px; width:100%; min-height:54px; text-align:left; border:2px solid var(--line); background:#f6efe4; color:#14101a; border-radius:14px; padding:10px 14px; font-weight:800; font-size:16px; line-height:1.25}' +
  '.pl-c[aria-pressed="true"]{border-color:var(--acc); box-shadow:0 0 0 3px color-mix(in srgb, var(--acc) 45%, transparent); background:#fff}' +
  '.pl-c .no{flex:none; display:grid; place-items:center; width:26px; height:26px; border-radius:99px; background:var(--acc); color:#14101a; font-size:14px}' +
  '.pl-c.blank{background:transparent; color:var(--ink); border-style:dashed}' +
  '.pl-c{transition:box-shadow .18s, background .18s}.pl-c[aria-pressed="true"]::after{content:"✓"; margin-left:auto; flex:none; display:grid; place-items:center; width:26px; height:26px; border-radius:99px; background:var(--acc); color:#14101a; font-size:15px}.pl-c[aria-pressed="true"]:has(.no)::after{display:none}' +
  '.pl-s{display:block; width:100%; text-align:left; border:2px solid var(--line); background:var(--card); color:var(--ink); border-radius:16px; padding:14px 16px; font-weight:700; font-size:18px; line-height:1.3}' +
  '.pl-s .pl-a{background:var(--acc); color:#14101a}' +
  '.pl-s[aria-pressed="true"]{border-color:var(--acc); box-shadow:0 0 0 3px color-mix(in srgb, var(--acc) 40%, transparent)}' +
  '.pl-s.win{border-color:var(--acc); background:var(--soft)}' +
  '.pl-s .by{display:block; margin-top:6px; font-size:13px; font-weight:800; color:var(--muted)}' +
  '.pl-s.win .by{color:var(--acc)}' +
  '.pl-list{display:flex; flex-direction:column; gap:8px}' +
  '.pl-ta{min-height:74px; resize:vertical; font-size:16px}' +
  '.pl-j{display:flex; align-items:center; gap:8px; flex-wrap:wrap}' +
  '</style>';
function head(E, nameOf, extra){
  const T = twOf(E.tw);
  const who = E.tw === "public" ? tr("Vote du public", "Crowd vote") : E.tw === "duel" ? tr("Duel : " + E.duel.map(nameOf).join(" contre ") + " · juge " + nameOf(E.judge), "Duel: " + E.duel.map(nameOf).join(" vs. ") + " · judge " + nameOf(E.judge)) : tr("Juge : ", "Judge: ") + nameOf(E.judge);
  return CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + " · " + esc(who) + "</span>" + SB.u.twistHTML(T) +
    '<div class="card acc"><div class="pl-q">' + filled(E.q, extra || []) + "</div>" + (E.need === 2 && E.tw !== "double" ? '<span class="sm">' + tr("Deux cartes, dans l'ordre", "Two cards, in order") + "</span>" : E.tw === "double" ? '<span class="sm">' + tr("Deux réponses séparées", "Two separate answers") + "</span>" : "") + "</div>";
}
// Main du joueur : sélection dans l'ordre, carte blanche en option.
function handHTML(E, id, sel, blankOpen){
  const hand = A(E.hands[id]), n = needOf(E), bl = E.blanks[id] || 0;
  return '<span class="eyebrow">' + tr("Ta main · choisis " + (n === 2 ? "2 cartes" : "1 carte"), "Your hand · pick " + (n === 2 ? "2 cards" : "1 card")) + "</span>" +
    '<div class="pl-h">' + hand.map((a, i) => { const k = sel.indexOf(String(i)); return '<button type="button" class="pl-c" data-i="' + i + '" aria-pressed="' + (k >= 0) + '">' + (k >= 0 && n > 1 ? '<span class="no">' + (k + 1) + "</span>" : "") + "<span>" + esc(a) + "</span></button>"; }).join("") +
    (bl > 0 ? (blankOpen ? '<textarea class="txt pl-ta" maxlength="80" placeholder="' + tr("Écris ta propre réponse…", "Write your own answer…") + '" aria-label="' + tr("Carte blanche", "Blank card") + '"></textarea>' :
      '<button type="button" class="pl-c blank" data-blank>' + tr("Carte blanche : écris ta réponse (" + bl + " restante" + (bl > 1 ? "s" : "") + ")", "Blank card: write your own answer (" + bl + " left)") + "</button>") : "") + "</div>";
}
function bindHand(r, E, id, st, redraw, onPlay){
  const n = needOf(E);
  r.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => {
    const k = String(b.dataset.i), x = st.sel.indexOf(k); buzz(6);
    if(x >= 0) st.sel.splice(x, 1); else { if(st.sel.length + (st.blankOpen ? 1 : 0) >= n) st.sel.shift(); st.sel.push(k); }
    redraw();
  }));
  const bb = r.querySelector("[data-blank]"); if(bb) bb.addEventListener("click", () => { st.blankOpen = true; if(st.sel.length >= n) st.sel.shift(); redraw(); setTimeout(() => { const t = r.ownerDocument.querySelector(".pl-ta"); if(t) t.focus(); }, 50); });
  const ta = r.querySelector(".pl-ta"), go = r.querySelector("[data-play]");
  const ready = () => st.sel.length + (st.blankOpen && clean(ta ? ta.value : "", 80) ? 1 : 0) === n;
  if(ta){ ta.value = st.blank || ""; ta.addEventListener("input", () => { st.blank = ta.value; if(go) go.disabled = !ready(); }); }
  if(go){
    go.disabled = !ready();
    go.addEventListener("click", () => {
      if(!ready()) return;
      const o = st.sel.slice(); if(st.blankOpen && clean(st.blank, 80)) o.push(BL + clean(st.blank, 80));
      onPlay(o);
    });
  }
  const cx = r.querySelector("[data-noblank]"); if(cx) cx.addEventListener("click", () => { st.blankOpen = false; st.blank = ""; redraw(); });
}
// Aperçu : la phrase se remplit avec les cartes choisies.
function preview(E, id, st){ if(E.tw === "double") return []; const hand = A(E.hands[id]); const a = st.sel.map(i => hand[+i]); if(st.blankOpen && clean(st.blank, 80)) a.push(clean(st.blank, 80)); return a; }
function playDock(E, st){
  return dock('<button class="btn acc" type="button" data-play disabled>' + (needOf(E) === 2 ? tr("Jouer ces 2 cartes", "Play these 2 cards") : tr("Jouer cette carte", "Play this card")) + "</button>" + (st.blankOpen ? '<button class="link" type="button" data-noblank style="align-self:center">' + tr("Annuler la carte blanche", "Cancel blank card") + "</button>" : ""));
}
function subsHTML(E, nameOf, opts){
  // opts : { sel, reveal, me }
  return '<div class="pl-list">' + E.subs.map((s, i) => {
    const win = opts.reveal && E.win.indexOf(i) >= 0;
    const mine = opts.me && s.id === opts.me;
    return '<button type="button" class="pl-s' + (win ? " win" : "") + '" data-s="' + i + '" aria-pressed="' + (opts.sel === i) + '"' + (opts.reveal || mine ? " disabled" : "") + ">" + filled(E.q, s.a) +
      (opts.reveal ? '<span class="by">' + (win ? tr("Gagnant · ", "Winner · ") : "") + esc(nameOf(s.id)) + (s.b ? tr(" · carte blanche", " · blank card") : "") + "</span>" : mine ? '<span class="by">' + tr("Ta réponse", "Your answer") + "</span>" : "") + "</button>";
  }).join("") + "</div>";
}
function revHTML(E, nameOf){
  const w = E.win.map(i => E.subs[i]).filter(Boolean), names = [];
  w.forEach(s => { if(names.indexOf(s.id) < 0) names.push(s.id); });
  const verb = E.tw === "reverse" ? tr("La plus nulle, donc la gagnante", "The worst, so the winner") : E.tw === "public" ? tr("Le public a choisi", "The crowd picked") : tr("Le juge a choisi", "The judge picked");
  return '<span class="eyebrow">' + esc(verb) + '</span><div class="card acc"><div class="pl-q">' + filled(E.q, (w[0] || {}).a || []) + "</div></div>" +
    '<div class="who">' + esc(names.map(nameOf).join(" & ")) + "</div><p class=\"sm\">+" + (E.gain || 1) + " point" + ((E.gain || 1) > 1 ? "s" : "") + (names.length > 1 ? tr(" chacun (égalité)", " each (tie)") : "") + "</p>" +
    '<span class="eyebrow">' + tr("Toutes les réponses", "All answers") + "</span>" + subsHTML(E, nameOf, { reveal: true });
}

// Redessine sans remonter en haut quand on reste dans la même étape (choix d'une carte…).
function view(root, ph, key, html, bind){
  if(root.dataset.key === key) return;
  if(root.dataset.ph === ph){
    const sc = root.closest(".screen"), top = sc ? sc.scrollTop : 0;
    root.dataset.key = key; root.innerHTML = html; if(bind) bind(root); if(sc) sc.scrollTop = top; return;
  }
  root.dataset.ph = ph; screen(root, key, html, bind);
}

/* ---------- Réseau ---------- */
function fromState(s, p){ const E = JSON.parse(JSON.stringify(s)); delete E.k; E.qd = A(p.qd).slice(); E.ad = A(p.ad).slice(); E.order = A(E.order); E.subs = A(E.subs).map(x => Object.assign({}, x, { a: A(x.a) })); E.win = A(E.win); E.duel = A(E.duel); Object.keys(E.hands || {}).forEach(id => { E.hands[id] = A(E.hands[id]); }); return E; }
function publish(c, E){ if(E.phase === "rev" && E.gl && c.gage) c.gage(E.gl, "pl" + E.round); c.setPriv({ qd: E.qd, ad: E.ad }); const o = Object.assign({}, E); delete o.qd; delete o.ad; delete o.gl; o.k = c.rid(); c.set(o); }
const UI = { k: "", sel: [], blankOpen: false, blank: "", js: null };
function liveIds(ctx){ return ctx.ids.filter(id => ctx.here(id)); }

const DEF = {
  id: "punchline", name: "Punchline", glyph: "Limite limite", pitch: tr("Complète la phrase avec ta carte la plus trash.", "Fill in the blank with your trashiest card."), hot: true,
  accent: { light: "#ff4fd8", dark: "#ff4fd8" },
  tag: tr("Une phrase à trous, sept cartes en main : complète-la avec la réponse la plus drôle (ou la plus horrible). Le juge garde sa préférée.", "A fill-in-the-blank sentence, seven cards in hand: complete it with the funniest (or most horrible) answer. The judge keeps their favorite."),
  min: 3, max: 12,
  gages: [
    { ev: "perd", label: tr("Perdre la manche", "Lose the round"), kind: "boit", n: 1 },
    { ev: "gagne", label: tr("Gagner la manche", "Win the round"), kind: "distribue", n: 2 }
  ],
  rules: tr([
    "Chacun reçoit 7 cartes-réponses. À chaque manche, une phrase à trous s'affiche et un juge est désigné (chacun son tour).",
    "Les autres complètent la phrase avec une carte de leur main (deux pour les phrases à deux trous), en secret.",
    "Les réponses arrivent sans les noms. Le juge choisit sa préférée : son auteur marque 1 point. Le (la) premier(ère) à atteindre le score visé gagne.",
    "Carte blanche : deux fois par partie, tu peux écrire ta propre réponse.",
    "Coups de théâtre : jackpot, vote du public, monde à l'envers, deux chances, roulette, duel, main neuve.",
    "D'une soirée à l'autre, les phrases et cartes déjà vues reviennent après les nouvelles.",
    "Paquets Hard et Humour noir : réservés aux adultes, vraiment sans filtre."
  ], [
    "Everyone gets 7 answer cards. Each round, a fill-in-the-blank sentence appears and a judge is chosen (everyone takes a turn).",
    "Everyone else secretly completes the sentence with a card from their hand (two for sentences with two blanks).",
    "Answers show up without names. The judge picks their favorite: its author scores 1 point. First to reach the target score wins.",
    "Blank card: twice per game, you can write your own answer.",
    "Twists: jackpot, crowd vote, upside down, two shots, roulette, duel, fresh hand. Sentences and cards you've already seen come after new ones from one night to the next.",
    "Hard and Dark humor packs: adults only, seriously unfiltered."
  ]),
  options: [
    { id: "target", label: tr("Points pour gagner", "Points to win"), type: "seg", def: 5, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: packCount(p.v) })) },
    { id: "blank", label: tr("Cartes blanches", "Blank cards"), type: "toggle", text: tr("Cartes blanches", "Blank cards"), desc: tr("Deux réponses libres à écrire soi-même par partie", "Two free answers to write yourself per game"), def: true },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une manche", "Now and then, a rule changes for one round"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet de cartes.", "Pick at least one card pack."));
    const E = newGame(shuffle(ctx.ids), Object.assign({}, o, { lg: SB.lang() }));
    nextRound(E, ctx.ids);
    ctx.setPriv({ qd: E.qd, ad: E.ad });
    const s = Object.assign({}, E); delete s.qd; delete s.ad;
    return s;
  },
  host(ctx){
    const s = ctx.s; if(!s || !s.order) return;
    const live = liveIds(ctx);
    if(s.phase === "play"){
      const E = fromState(s, ctx.priv()), need = players(E, live);
      if(!need.length) return;
      const picks = {};
      need.forEach(id => { const x = ctx.input(id); if(x && x.p && x.p.r === E.round && check(E, id, x.p.o)) picks[id] = x.p.o; });
      if(Object.keys(picks).length === need.length){ toJudge(E, picks); publish(ctx, E); }
    } else if(s.phase === "judge" && s.tw === "public"){
      const E = fromState(s, ctx.priv()), voters = live.filter(id => A(E.subs).some(x => x.id !== id));
      const votes = {};
      voters.forEach(id => { const x = ctx.input(id); if(x && x.v && x.v.r === E.round && E.subs[x.v.i] && E.subs[x.v.i].id !== id) votes[id] = x.v.i; });
      if(voters.length && Object.keys(votes).length === voters.length){ E.votes = votes; const w = tally(E); if(decide(E, w.length ? w : [0])) publish(ctx, E); }
    } else if(s.phase === "judge"){
      const x = ctx.input(s.judge);
      if(x && x.j && x.j.r === s.round && A(s.subs)[x.j.i]){ const E = fromState(s, ctx.priv()); if(decide(E, [x.j.i])) publish(ctx, E); }
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, nameOf = ctx.name;
    if(!s || !s.order) return;
    const E = fromState(s, {}), live = liveIds(ctx);
    const rk = ctx.g.gid + "|" + E.round;
    if(UI.k !== rk){ UI.k = rk; UI.sel = []; UI.blankOpen = false; UI.blank = ""; UI.js = null; }
    if(E.phase === "play"){
      const need = players(E, live), mine = ctx.mine(), sent = !!(mine && mine.p && mine.p.r === E.round && check(E, me, mine.p.o));
      const done = need.filter(id => { const x = ctx.input(id); return x && x.p && x.p.r === E.round; }).length;
      const role = need.indexOf(me) >= 0 ? (sent ? "sent" : "play") : "wait";
      const key = "pl:" + s.k + role + UI.sel.join() + UI.blankOpen + ctx.isHost;
      if(role === "play"){
        view(root, "pp" + s.k, key, head(E, nameOf, preview(E, me, UI)) + handHTML(E, me, UI.sel, UI.blankOpen) + playDock(E, UI), r => {
          bindHand(r, E, me, UI, () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); }, o => { buzz(18); ctx.send({ p: { r: E.round, o } }); });
        });
      } else {
        const my = sent ? check(E, me, mine.p.o) : null;
        view(root, "pw" + s.k, key, head(E, nameOf, my && E.tw !== "double" ? my.map(x => x.t) : []) +
          (role === "sent" ? '<div class="sent"><span class="t">' + (E.tw === "double" ? esc(my.map(x => x.t).join(" / ")) : tr("Réponse envoyée", "Answer sent")) + '</span><button class="link" type="button" data-edit>' + tr("Changer", "Change") + "</button></div>"
            : '<p class="howto">' + (me === E.judge ? tr("Tu es le (la) juge de cette manche. Les réponses arrivent en secret : tu choisiras ta préférée.", "You're the judge this round. Answers come in secretly: you'll pick your favorite.") : tr("Tu ne joues pas cette manche : regarde le duel.", "You're sitting this round out: enjoy the duel.")) + "</p>") +
          dock('<p class="wait" data-wait></p>' + (ctx.isHost ? '<button class="link" type="button" data-skip style="align-self:center" hidden>' + tr("Continuer sans les retardataires", "Continue without the stragglers") + "</button>" : "")), r => {
          const e = r.querySelector("[data-edit]"); if(e) e.addEventListener("click", () => { UI.sel = []; UI.blankOpen = false; ctx.send({ p: null }); });
          const sk = r.querySelector("[data-skip]"); if(sk) armTap(sk, () => ctx.act(c => {
            const F = fromState(c.s, c.priv()); if(F.phase !== "play") return;
            const picks = {}; players(F, liveIds(c)).forEach(id => { const x = c.input(id); if(x && x.p && x.p.r === F.round && check(F, id, x.p.o)) picks[id] = x.p.o; });
            if(Object.keys(picks).length >= 1){ toJudge(F, picks); publish(c, F); }
          }), tr("Toucher encore pour continuer", "Tap again to continue"));
        });
      }
      txt(root, "[data-wait]", done + " / " + need.length + tr(" réponses", " answers"));
      const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = done < 1 || done >= need.length;
    } else if(E.phase === "judge"){
      const isPub = E.tw === "public", amJudge = me === E.judge && !isPub;
      const mine = ctx.mine(), myVote = isPub && mine && mine.v && mine.v.r === E.round ? mine.v.i : null;
      const canPick = amJudge || (isPub && myVote == null && E.subs.some(x => x.id !== me)) || (ctx.isHost && !isPub && !ctx.here(E.judge));
      const key = "pj:" + s.k + canPick + UI.js + myVote;
      const verb = E.tw === "reverse" ? tr("Choisis la réponse la plus nulle", "Pick the worst answer") : isPub ? tr("Vote pour ta préférée (pas la tienne)", "Vote for your favorite (not your own)") : tr("Choisis ta réponse préférée", "Pick your favorite answer");
      view(root, "pj" + s.k, key, head(E, nameOf) + '<span class="eyebrow">' + (canPick ? esc(verb) : isPub ? tr("Vote enregistré", "Vote saved") : tr(esc(nameOf(E.judge)) + " choisit…", esc(nameOf(E.judge)) + " is choosing…")) + "</span>" +
        subsHTML(E, nameOf, { sel: UI.js, me: isPub ? me : "" }) +
        dock((canPick ? '<button class="btn acc" type="button" data-pick' + (UI.js == null ? " disabled" : "") + ">" + (isPub ? tr("Voter pour celle-là", "Vote for this one") : tr("Elle gagne !", "This one wins!")) + "</button>" : "") + '<p class="wait" data-wait></p>'), r => {
        if(canPick){
          r.querySelectorAll("[data-s]").forEach(b => b.addEventListener("click", () => { UI.js = +b.dataset.s; buzz(8); root.dataset.key = ""; DEF.render(SB.ctx(), root); }));
          const pk = r.querySelector("[data-pick]");
          if(pk) pk.addEventListener("click", () => {
            if(UI.js == null) return; buzz(24);
            if(isPub) ctx.send({ v: { r: E.round, i: UI.js } });
            else if(amJudge) ctx.send({ j: { r: E.round, i: UI.js } });
            else ctx.act(c => { const F = fromState(c.s, c.priv()); if(F.phase === "judge" && decide(F, [UI.js])) publish(c, F); });
          });
        } else r.querySelectorAll("[data-s]").forEach(b => { b.disabled = true; });
      });
      if(isPub){ const voters = live.filter(id => E.subs.some(x => x.id !== id)); txt(root, "[data-wait]", voters.filter(id => { const x = ctx.input(id); return x && x.v && x.v.r === E.round; }).length + " / " + voters.length + " votes"); }
      else txt(root, "[data-wait]", !ctx.here(E.judge) && ctx.isHost ? tr(nameOf(E.judge) + " est absent(e) : choisis à sa place.", nameOf(E.judge) + " is away: pick for them.") : "");
    } else if(E.phase === "rev"){
      const end = over(E);
      screen(root, "pr:" + s.k + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + "</span>" + SB.u.twistHTML(twOf(E.tw)) + revHTML(E, nameOf) +
        '<div class="field"><span class="eyebrow">Scores</span>' + bars(E, nameOf) + "</div>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (end ? tr("Voir le podium", "See the podium") : tr("Manche suivante", "Next round")) + '</button><button class="link" type="button" data-stop style="align-self:center">' + tr("Terminer la partie", "End the game") + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const nx = r.querySelector("[data-next]");
        if(nx) nx.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s, c.priv()); if(F.phase !== "rev") return;
          if(over(F)) F.phase = "end"; else nextRound(F, liveIds(c));
          publish(c, F);
        }));
        const st = r.querySelector("[data-stop]"); if(st) armTap(st, () => ctx.act(c => { const F = fromState(c.s, c.priv()); F.phase = "end"; publish(c, F); }), tr("Toucher encore pour terminer", "Tap again to end"));
      });
    } else if(E.phase === "end"){
      const rk2 = ranking(E), champ = rk2[0];
      screen(root, "pe:" + s.k + ctx.isHost, CSS + '<span class="eyebrow">' + esc(fl(FL.win, E.fl, 0)) + '</span><div class="who">' + esc(nameOf(champ)) + "</div>" + bars(E, nameOf) + awardsHTML(awards(E, nameOf)) +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s, {}), o2 = ranking(F), mx = F.pts[o2[0]] || 0;
          c.end({ title: "Punchline · " + c.name(o2[0]) + tr(" gagne", " wins"), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + SB.u.plural2(F.pts[id] || 0, "pt", null, "pt")).concat(awards(F, c.name).slice(0, 2).map(a => a[0] + tr(" : ", ": ") + a[1])),
            win: mx ? o2.filter(id => (F.pts[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : chacun choisit sa carte en secret, puis on passe au juge ---------- */
  local: {
    players: { min: 3, max: 12 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id] || "?";
      const S0 = store();
      let sel = A(S0.plPacks).filter(k => PQ[k]).length ? A(S0.plPacks).filter(k => PQ[k]) : ["classique"];
      let target = [3, 5, 8].indexOf(S0.plTarget) >= 0 ? S0.plTarget : 5, twOn = S0.plTw !== false, blOn = S0.plBlank !== false;
      let E = null, queue = [], picks = {}, st = { sel: [], blankOpen: false, blank: "" }, js = null;
      function setup(){
        screen(root, "su" + sel.join() + target + twOn + blOn, CSS + '<p class="howto">' + tr("Chacun à son tour prend le téléphone et choisit sa carte en secret. Puis on passe le téléphone au juge, qui lit les phrases à voix haute et garde sa préférée.", "Take turns with the phone and secretly pick your card. Then pass the phone to the judge, who reads the sentences out loud and keeps their favorite.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Points pour gagner", "Points to win") + '</span><div class="seg">' + [3, 5, 8].map(n => '<button type="button" data-t="' + n + '" aria-pressed="' + (n === target) + '">' + n + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + packCount(p.v) + "</span></button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Variantes", "Variants") + '</span><div class="packs">' +
            '<button type="button" class="pack" data-bl aria-pressed="' + blOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Cartes blanches", "Blank cards") + '</span><span class="ds">' + tr("Deux réponses libres à écrire soi-même par partie", "Two free answers to write yourself per game") + "</span></span></button>" +
            '<button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change pour une manche", "Now and then, a rule changes for one round") + "</span></span></button></div></div>" +
          dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
          r.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { target = +b.dataset.t; persist({ plTarget: target }); setup(); }));
          r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ plPacks: sel }); setup(); }));
          r.querySelector("[data-bl]").addEventListener("click", () => { blOn = !blOn; persist({ plBlank: blOn }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ plTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet de cartes.", "Pick at least one pack.")); return; }
            E = newGame(ids, { packs: SB.okPacks(sel, PACKS), target, twists: twOn, blank: blOn, lg: SB.lang() });
            E.judge = ids[ids.length - 1];
            round();
          });
        });
      }
      function round(){
        nextRound(E, ids); picks = {}; js = null;
        if(E.phase === "judge"){ toJudgeScreen(); return; } // roulette
        queue = players(E, ids).slice();
        passTo();
      }
      function passTo(){
        const id = queue[0];
        if(id == null){ toJudge(E, picks); toJudgeScreen(); return; }
        st = { sel: [], blankOpen: false, blank: "" };
        screen(root, "pa" + E.round + "-" + id, CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + "</span>" + SB.u.twistHTML(twOf(E.tw)) + '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(nameOf(id)) + "</div><p>" + tr("Les autres, ne regardez pas l'écran.", "Everyone else, don't look at the screen.") + "</p></div>" +
          dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi", "It's me") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => choose(id)));
      }
      function choose(id){
        view(root, "ch" + E.round + id, "ch" + E.round + id + st.sel.join() + st.blankOpen, '<span class="eyebrow">' + tr(esc(nameOf(id)) + " choisit", esc(nameOf(id)) + " is choosing") + "</span>" + head(E, nameOf, preview(E, id, st)) + handHTML(E, id, st.sel, st.blankOpen) + playDock(E, st), r => {
          bindHand(r, E, id, st, () => { root.dataset.key = ""; choose(id); }, o => { picks[id] = o; queue.shift(); buzz(18); passTo(); });
        });
      }
      function toJudgeScreen(){
        const isPub = E.tw === "public";
        screen(root, "pj" + E.round, CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + "</span>" + '<div class="pass"><span class="eyebrow">' + (isPub ? tr("Tout le monde autour du téléphone !", "Everyone gather around the phone!") : tr("Passe le téléphone au juge", "Pass the phone to the judge")) + '</span><div class="who">' + esc(isPub ? tr("Vote du public", "Crowd vote") : nameOf(E.judge)) + "</div><p>" + (isPub ? tr("Lisez les phrases à voix haute, votez à main levée, puis touchez la gagnante.", "Read the sentences out loud, vote by show of hands, then tap the winner.") : tr("Lis les phrases à voix haute, puis choisis ta préférée.", "Read the sentences out loud, then pick your favorite.")) + "</p></div>" +
          dock('<button class="btn acc" type="button" data-n>' + (isPub ? tr("C'est parti", "Let's go") : tr("C'est moi, le (la) juge", "I'm the judge")) + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", judge));
      }
      function judge(){
        const verb = E.tw === "reverse" ? tr("Choisis la réponse la plus nulle", "Pick the worst answer") : E.tw === "public" ? tr("Touchez la réponse qui a le plus de voix", "Tap the answer with the most votes") : tr("Choisis ta réponse préférée", "Pick your favorite answer");
        view(root, "ju" + E.round, "ju" + E.round + js, head(E, nameOf) + '<span class="eyebrow">' + esc(verb) + "</span>" + subsHTML(E, nameOf, { sel: js }) +
          dock('<button class="btn acc" type="button" data-pick' + (js == null ? " disabled" : "") + ">" + tr("Elle gagne !", "This one wins!") + "</button>"), r => {
          r.querySelectorAll("[data-s]").forEach(b => b.addEventListener("click", () => { js = +b.dataset.s; buzz(8); judge(); }));
          r.querySelector("[data-pick]").addEventListener("click", () => { if(js == null) return; buzz(24); decide(E, [js]); reveal(); if(api.gage && E.gl) api.gage(E.gl.map(x => ({ id: nameOf(x.id), ev: x.ev })), "pl" + E.round + Math.random()); });
        });
      }
      function reveal(){
        const end = over(E);
        screen(root, "rv" + E.round, CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + "</span>" + SB.u.twistHTML(twOf(E.tw)) + revHTML(E, nameOf) + '<div class="field"><span class="eyebrow">Scores</span>' + bars(E, nameOf) + "</div>" +
          dock('<button class="btn acc" type="button" data-n>' + (end ? tr("Voir le podium", "See the podium") : tr("Manche suivante", "Next round")) + '</button><button class="link" type="button" data-stop style="align-self:center">' + tr("Terminer la partie", "End the game") + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", () => (end ? finish() : round()));
          armTap(r.querySelector("[data-stop]"), finish, tr("Toucher encore pour terminer", "Tap again to end"));
        });
      }
      function finish(){
        const o2 = ranking(E), mx = E.pts[o2[0]] || 0;
        if(api.win && mx) api.win(o2.filter(id => (E.pts[id] || 0) === mx).map(nameOf));
        screen(root, "end" + E.round, CSS + '<span class="eyebrow">' + esc(fl(FL.win, E.fl, 0)) + '</span><div class="who">' + esc(nameOf(o2[0])) + "</div>" + bars(E, nameOf) + awardsHTML(awards(E, nameOf)) +
          dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
};
DEF.engine = { newGame, nextRound, players, check, toJudge, decide, tally, over, needOf, filled, holes, PQ, PA, PQ_EN, PA_EN };
SB.register(DEF);
})();
