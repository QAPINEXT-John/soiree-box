/* Punchline — une phrase à trous, chacun la complète avec une carte de sa main, le juge garde la plus drôle. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, clean, armTap, pick, buzz } = SB.u;

/* Cartes : PQ = phrases à trous (___), PA = réponses. Paquets hard et noir réservés aux adultes. */
const PQ = {
 "classique": [
  "Ce soir, j'ai fini aux urgences. Le coupable : ___.",
  "Le secret de ma réussite ? ___.",
  "Ma mère m'a toujours mis en garde contre ___.",
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
  "La pire excuse pour annuler un rendez-vous : « Désolé, j'ai ___. »",
  "Dans mon testament, je lègue à mon voisin ___.",
  "Le jury de l'émission culinaire a recraché ___.",
  "Mon coach de sport a jeté l'éponge en voyant ___.",
  "Au réveillon, la belle-mère a encore ramené ___.",
  "La voyante du quartier voit dans votre avenir ___.",
  "Tout a commencé à déraper quand quelqu'un a sorti ___.",
  "Le nouveau parfum à la mode sent ___.",
  "Si je deviens président, ma première mesure sera ___.",
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
  "Mon banquier m'a convoqué : il a vu passer ___ sur mon relevé.",
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
  "Ma mère m'a surpris avec ___ et ___ dans la même pièce.",
  "Le nouveau couple star de la téléréalité : ___ et ___.",
  "À l'apéro, on a commencé par évoquer ___, puis ___ a tout fait dégénérer.",
  "Le duo improbable des vacances : ___ et ___.",
  "La spécialité régionale qui fait polémique : ___ en sauce, avec ___ en accompagnement.",
  "Mon week-end en résumé : ___, puis ___.",
  "Recette de la soirée parfaite : ___, ___, et on ne parle plus de rien.",
  "La dispute de l'année : ___ contre ___.",
  "Le combo gagnant pour un dimanche réussi : ___ et ___.",
  "Mon chef m'a pris en flagrant délit avec ___.",
  "L'invention qui va changer le monde : ___, mais en version connectée.",
  "Quand j'ai trop bu, je ne parle plus que d'une chose : ___."
 ],
 "hard": [
  "Mon plan cul m'a largué. Sa raison : ___.",
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
  "On m'a surpris avec ___ dans les toilettes de la boîte.",
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
  "Je suis interdit de sauna depuis ___.",
  "Mes plans cul me mettent cinq étoiles pour ___.",
  "Le pire aphrodisiaque du monde : ___.",
  "Mon coloc m'a surpris seul dans ma chambre avec ___.",
  "Mon dernier achat à 3 h du matin, complètement déchiré : ___.",
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
  "Mon ex m'a quitté pour ___, puis est revenu pour ___.",
  "J'ai échangé ___ contre ___ en soirée échangiste.",
  "Dans le dark room, j'ai senti ___ puis ___.",
  "Le safe word, c'était ___, mais j'ai crié ___.",
  "Le kit de survie du lendemain de cuite : ___ et ___.",
  "On m'a surpris en train de lécher ___.",
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
  "L'éloge funèbre le plus gênant : « Il adorait ___. »",
  "Dans la cave du voisin, la police a trouvé ___.",
  "Le zombie m'a épargné : il a préféré ___.",
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
  "Dans le film d'horreur, le premier à mourir est celui qui ramène ___.",
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
  "Mon répondeur après ma mort : « Désolé, je suis occupé avec ___. »",
  "Le dernier cri en matière d'embaumement : ___.",
  "Ce qui pousse sur la tombe de mon ex : ___.",
  "L'exorciste a dû s'enfuir devant ___.",
  "Pour mes funérailles, le dress code est ___.",
  "La vie, c'est comme ___ : ça finit toujours mal.",
  "Mon horoscope : la Mort est dans votre signe, évitez ___.",
  "___ : la raison pour laquelle les morts reviennent.",
  "___ : la dernière chose que tu verras avant de mourir.",
  "Au programme des funérailles : ___, puis ___.",
  "La fin du monde selon les prophètes : ___ puis ___.",
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
  "un pigeon avec un seul œil",
  "le karaoké de tonton",
  "une chaussette orpheline",
  "mon ex qui like encore mes photos",
  "un hamster sous antidépresseurs",
  "la belle-mère en maillot de bain",
  "un kebab à 4 h du matin",
  "une soirée diapos de vacances",
  "le cri du lama en colère",
  "un mime qui ne s'arrête jamais",
  "la sieste de 14 h",
  "un saucisson caché dans la poche",
  "le groupe de discussion des voisins",
  "une licorne en déprime",
  "mes chaussettes de la veille",
  "un influenceur en burn-out",
  "le dernier biscuit au chocolat",
  "un poney nommé Gérard",
  "la playlist de mariage de mes parents",
  "un sudoku impossible",
  "le pull moche de Noël",
  "un tupperware qui ne ferme plus",
  "des pieds qui sentent le fromage",
  "un selfie avec le pape des pigeons",
  "la danse du ventre de papy",
  "un plat de lentilles froides",
  "un chef qui crie pour rien",
  "une réunion qui aurait pu être un mail",
  "le fond de la piscine municipale",
  "un mot de passe oublié",
  "un chat qui juge tout le monde",
  "la file d'attente à la préfecture",
  "un barbecue sous la pluie",
  "le slip de bain du maître-nageur",
  "une tartiflette au petit-déjeuner",
  "un concert de flûte à bec",
  "mon horoscope chinois",
  "un diaporama de 80 slides",
  "la voisine qui chante faux",
  "une chèvre en trottinette",
  "les miettes dans le clavier",
  "un bébé phoque en colère",
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
  "une perruque en poils de chat",
  "un jogging fluo",
  "la réunion de copropriété",
  "un gâteau en forme de dinosaure",
  "un chihuahua possédé",
  "la recette secrète de mamie",
  "un SMS envoyé à la mauvaise personne",
  "la vaisselle de la semaine dernière",
  "un DJ qui ne passe que de l'accordéon",
  "mon compte en banque à la fin du mois",
  "un pique-nique avec des fourmis",
  "un rat qui fait mieux la cuisine que moi",
  "un piercing au sourcil raté",
  "la carte de fidélité du kebab",
  "une mamie en roller",
  "un repas de Noël sans fromage",
  "des lunettes de soleil la nuit",
  "la clim en panne en plein été",
  "un dossier « Impôts 2019 » de 40 Go",
  "un chien qui parle mieux que moi",
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
  "un hérisson sous caféine",
  "mon voisin du dessus et sa perceuse",
  "une tente qui prend l'eau",
  "un gobelet réutilisable plein de bière tiède",
  "un concours de pets",
  "les cheveux dans la bonde de la douche",
  "une gaufre au fromage",
  "la timidité du lama",
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
  "un écureuil qui a tout vu",
  "la voix de ma mère au réveil",
  "un tatouage en chinois mal traduit",
  "le régime à base de chips",
  "une omelette au chocolat",
  "une pizza à l'ananas",
  "le collègue qui se croit drôle",
  "un repas sans pain",
  "la carte des vins du camping",
  "un pigeon qui me suit partout",
  "un short en jean trop court",
  "un pot de départ sans alcool",
  "le stagiaire qui a tout cassé",
  "la touche Entrée qui ne marche plus",
  "une glace qui coule sur les doigts",
  "une chanson de l'été en boucle",
  "un poisson rouge dépressif",
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
  "un cheval qui a le vertige",
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
  "un perroquet qui répète tout",
  "un pique-assiette professionnel",
  "un frigo vide",
  "la soupe aux choux",
  "un éternuement en plein discours",
  "un bonnet de bain trop serré",
  "la playlist « chill » de mon père",
  "un dauphin qui fait la gueule",
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
  "un panda qui fait du kung-fu",
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
  "le dernier souffle de mon poisson rouge",
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
  "le dernier humain sur Terre et son chat",
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
  "un orphelinat de pigeons",
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

const PACKS = [
  { v: "classique", label: "Classique", desc: "Absurde, gênant, sous-entendus : pour tout le monde" },
  { v: "hard", label: "Hard", desc: "Sexe, trash, excès : aucune limite de bon goût", hot: true },
  { v: "noir", label: "Humour noir", desc: "Mort, enterrements, fin du monde", hot: true }
];
const HAND = 7, BL = "b:";
const SEEN_Q = "punchline:q", SEEN_A = "punchline:a";
const qPool = packs => { const p = A(packs).filter(k => PQ[k]); return (p.length ? p : ["classique"]).flatMap(k => PQ[k]); };
const aPool = packs => { const p = A(packs).filter(k => PA[k]); return (p.length ? p : ["classique"]).flatMap(k => PA[k]); };
const holes = q => Math.max(1, Math.min(2, (String(q).match(/___/g) || []).length));

/* Coups de théâtre : une règle change pour une manche (jamais la première, jamais deux fois de suite). */
const TW = [
  { id: "jackpot", name: "Jackpot", desc: "La réponse gagnante rapporte 2 points." },
  { id: "public", name: "Vote du public", desc: "Pas de juge : tout le monde vote, et on ne vote pas pour soi.", ok: o => o.n >= 4 },
  { id: "reverse", name: "Le monde à l'envers", desc: "Le juge choisit la réponse la plus nulle : c'est elle qui gagne." },
  { id: "double", name: "Deux chances", desc: "Chacun joue deux réponses séparées. Le juge n'en garde qu'une.", ok: o => o.need === 1 },
  { id: "roulette", name: "Roulette", desc: "Pas de choix : vos cartes sont tirées au hasard dans votre main. Pourvu que le sort soit drôle !" },
  { id: "duel", name: "Duel", desc: "Seuls deux joueurs s'affrontent. La victoire vaut 2 points.", ok: o => o.n >= 4 },
  { id: "fresh", name: "Main neuve", desc: "Tout le monde défausse sa main et reçoit 7 nouvelles cartes." }
];
const twOf = id => SB.u.byTwist(TW, id);

/* ---------- Moteur commun (réseau et un seul téléphone) ---------- */
function drawA(E){
  if(!E.ad.length){
    const inHands = new Set(); Object.keys(E.hands).forEach(id => A(E.hands[id]).forEach(a => inHands.add(a)));
    E.ad = SB.u.fresh(SEEN_A, aPool(E.packs).filter(a => !inHands.has(a)));
    if(!E.ad.length) E.ad = SB.u.fresh(SEEN_A, aPool(E.packs));
  }
  const a = E.ad.pop(); SB.u.saw(SEEN_A, a); return a;
}
function drawQ(E){ if(!E.qd.length) E.qd = SB.u.fresh(SEEN_Q, qPool(E.packs)); const q = E.qd.pop(); SB.u.saw(SEEN_Q, q); return q; }
function deal(E){ E.order.forEach(id => { E.hands[id] = A(E.hands[id]).slice(); while(E.hands[id].length < HAND) E.hands[id].push(drawA(E)); }); }
function newGame(order, o){
  const E = { order: order.slice(), packs: A(o.packs).length ? A(o.packs).slice() : ["classique"], target: o.target || 5, twOn: o.twists !== false,
    round: 0, judge: "", phase: "play", q: "", need: 1, tw: "", duel: [], subs: [], win: [], votes: {}, hands: {}, blanks: {},
    pts: {}, wins: {}, bw: {}, byJ: {}, miss: {}, qd: [], ad: [], fl: Math.floor(Math.random() * 12) };
  E.order.forEach(id => { E.hands[id] = []; E.blanks[id] = o.blank === false ? 0 : 2; });
  E.qd = SB.u.fresh(SEEN_Q, qPool(E.packs)); E.ad = SB.u.fresh(SEEN_A, aPool(E.packs));
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
  win: ["Roi de la punchline", "Champion du mauvais goût", "Plus drôle que tout le monde", "Maître de la vanne", "Légende de la soirée"],
  fav: ["Chouchou du juge", "Fait toujours rire le même juge", "Dans les petits papiers du juge"],
  blank: ["Plume libre", "Auteur maison", "Carte blanche en or"],
  miss: ["Incompris", "Trop en avance sur son temps", "Un humour venu du futur"]
};
const fl = (list, seed, k) => list[((seed || 0) + k) % list.length];
function awards(E, nameOf){
  const out = [], used = [], seed = E.fl || 0;
  const top = (m, min) => { let b = "", v = min - 1; Object.keys(m || {}).forEach(id => { if((m[id] || 0) > v && used.indexOf(id) < 0){ v = m[id]; b = id; } }); if(b) used.push(b); return b; };
  let fk = "", fv = 1; Object.keys(E.byJ || {}).forEach(k => { if(E.byJ[k] > fv){ fv = E.byJ[k]; fk = k; } });
  if(fk){ const [j, w] = fk.split("|"); used.push(w); out.push([fl(FL.fav, seed, 1) + (/de$/.test(fl(FL.fav, seed, 1)) ? " " + nameOf(j) : ""), nameOf(w), fv + " victoires avec " + nameOf(j) + " comme juge"]); }
  const b = top(E.bw, 1); if(b) out.push([fl(FL.blank, seed, 2), nameOf(b), E.bw[b] + " victoire" + (E.bw[b] > 1 ? "s" : "") + " avec une carte blanche"]);
  const losers = {}; E.order.forEach(id => { if(!(E.wins[id] || 0) && (E.miss[id] || 0) >= 3) losers[id] = E.miss[id]; });
  const m = top(losers, 3); if(m) out.push([fl(FL.miss, seed, 3), nameOf(m), E.miss[m] + " réponses, zéro victoire"]);
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
  const who = E.tw === "public" ? "Vote du public" : E.tw === "duel" ? "Duel : " + E.duel.map(nameOf).join(" contre ") + " · juge " + nameOf(E.judge) : "Juge : " + nameOf(E.judge);
  return CSS + '<span class="eyebrow">Manche ' + E.round + " · " + esc(who) + "</span>" + SB.u.twistHTML(T) +
    '<div class="card acc"><div class="pl-q">' + filled(E.q, extra || []) + "</div>" + (E.need === 2 && E.tw !== "double" ? '<span class="sm">Deux cartes, dans l\'ordre</span>' : E.tw === "double" ? '<span class="sm">Deux réponses séparées</span>' : "") + "</div>";
}
// Main du joueur : sélection dans l'ordre, carte blanche en option.
function handHTML(E, id, sel, blankOpen){
  const hand = A(E.hands[id]), n = needOf(E), bl = E.blanks[id] || 0;
  return '<span class="eyebrow">Ta main · choisis ' + (n === 2 ? "2 cartes" : "1 carte") + "</span>" +
    '<div class="pl-h">' + hand.map((a, i) => { const k = sel.indexOf(String(i)); return '<button type="button" class="pl-c" data-i="' + i + '" aria-pressed="' + (k >= 0) + '">' + (k >= 0 && n > 1 ? '<span class="no">' + (k + 1) + "</span>" : "") + "<span>" + esc(a) + "</span></button>"; }).join("") +
    (bl > 0 ? (blankOpen ? '<textarea class="txt pl-ta" maxlength="80" placeholder="Écris ta propre réponse…" aria-label="Carte blanche"></textarea>' :
      '<button type="button" class="pl-c blank" data-blank>Carte blanche : écris ta réponse (' + bl + " restante" + (bl > 1 ? "s" : "") + ")</button>") : "") + "</div>";
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
  return dock('<button class="btn acc" type="button" data-play disabled>' + (needOf(E) === 2 ? "Jouer ces 2 cartes" : "Jouer cette carte") + "</button>" + (st.blankOpen ? '<button class="link" type="button" data-noblank style="align-self:center">Annuler la carte blanche</button>' : ""));
}
function subsHTML(E, nameOf, opts){
  // opts : { sel, reveal, me }
  return '<div class="pl-list">' + E.subs.map((s, i) => {
    const win = opts.reveal && E.win.indexOf(i) >= 0;
    const mine = opts.me && s.id === opts.me;
    return '<button type="button" class="pl-s' + (win ? " win" : "") + '" data-s="' + i + '" aria-pressed="' + (opts.sel === i) + '"' + (opts.reveal || mine ? " disabled" : "") + ">" + filled(E.q, s.a) +
      (opts.reveal ? '<span class="by">' + (win ? "Gagnant · " : "") + esc(nameOf(s.id)) + (s.b ? " · carte blanche" : "") + "</span>" : mine ? '<span class="by">Ta réponse</span>' : "") + "</button>";
  }).join("") + "</div>";
}
function revHTML(E, nameOf){
  const w = E.win.map(i => E.subs[i]).filter(Boolean), names = [];
  w.forEach(s => { if(names.indexOf(s.id) < 0) names.push(s.id); });
  const verb = E.tw === "reverse" ? "La plus nulle, donc la gagnante" : E.tw === "public" ? "Le public a choisi" : "Le juge a choisi";
  return '<span class="eyebrow">' + esc(verb) + '</span><div class="card acc"><div class="pl-q">' + filled(E.q, (w[0] || {}).a || []) + "</div></div>" +
    '<div class="who">' + esc(names.map(nameOf).join(" & ")) + "</div><p class=\"sm\">+" + (E.gain || 1) + " point" + ((E.gain || 1) > 1 ? "s" : "") + (names.length > 1 ? " chacun (égalité)" : "") + "</p>" +
    '<span class="eyebrow">Toutes les réponses</span>' + subsHTML(E, nameOf, { reveal: true });
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
function publish(c, E){ c.setPriv({ qd: E.qd, ad: E.ad }); const o = Object.assign({}, E); delete o.qd; delete o.ad; o.k = c.rid(); c.set(o); }
const UI = { k: "", sel: [], blankOpen: false, blank: "", js: null };
function liveIds(ctx){ return ctx.ids.filter(id => ctx.here(id)); }

const DEF = {
  id: "punchline", name: "Punchline", glyph: "___ !", pitch: "Complète la phrase avec ta carte la plus trash.", hot: true,
  accent: { light: "#ff4fd8", dark: "#ff4fd8" },
  tag: "Une phrase à trous, sept cartes en main : complète-la avec la réponse la plus drôle (ou la plus horrible). Le juge garde sa préférée.",
  min: 3, max: 12,
  rules: [
    "Chacun reçoit 7 cartes réponses. À chaque manche, une phrase à trous s'affiche et un juge est désigné (chacun son tour).",
    "Les autres complètent la phrase avec une carte de leur main (deux pour les phrases à deux trous), en secret.",
    "Les réponses arrivent sans les noms. Le juge choisit sa préférée : son auteur marque 1 point. Le premier à atteindre le score visé gagne.",
    "Carte blanche : deux fois par partie, tu peux écrire ta propre réponse.",
    "Coups de théâtre : jackpot, vote du public, monde à l'envers, deux chances, roulette, duel, main neuve. Les phrases et les cartes déjà vues passent après les nouvelles d'une soirée à l'autre.",
    "Paquets Hard et Humour noir : réservés aux adultes, vraiment sans filtre."
  ],
  options: [
    { id: "target", label: "Points pour gagner", type: "seg", def: 5, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "packs", label: "Paquets", type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: PQ[p.v].length + PA[p.v].length })) },
    { id: "blank", label: "Cartes blanches", type: "toggle", text: "Cartes blanches", desc: "Deux réponses libres à écrire soi-même par partie", def: true },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "De temps en temps, une règle change pour une manche", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet de cartes.");
    const E = newGame(shuffle(ctx.ids), o);
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
          (role === "sent" ? '<div class="sent"><span class="t">' + (E.tw === "double" ? esc(my.map(x => x.t).join(" / ")) : "Réponse envoyée") + '</span><button class="link" type="button" data-edit>Changer</button></div>'
            : '<p class="howto">' + (me === E.judge ? "Tu es le juge de cette manche. Les réponses arrivent en secret : tu choisiras ta préférée." : "Tu ne joues pas cette manche : regarde le duel.") + "</p>") +
          dock('<p class="wait" data-wait></p>' + (ctx.isHost ? '<button class="link" type="button" data-skip style="align-self:center" hidden>Continuer sans les retardataires</button>' : "")), r => {
          const e = r.querySelector("[data-edit]"); if(e) e.addEventListener("click", () => { UI.sel = []; UI.blankOpen = false; ctx.send({ p: null }); });
          const sk = r.querySelector("[data-skip]"); if(sk) armTap(sk, () => ctx.act(c => {
            const F = fromState(c.s, c.priv()); if(F.phase !== "play") return;
            const picks = {}; players(F, liveIds(c)).forEach(id => { const x = c.input(id); if(x && x.p && x.p.r === F.round && check(F, id, x.p.o)) picks[id] = x.p.o; });
            if(Object.keys(picks).length >= 1){ toJudge(F, picks); publish(c, F); }
          }), "Toucher encore pour continuer");
        });
      }
      txt(root, "[data-wait]", done + " / " + need.length + " réponses");
      const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = done < 1 || done >= need.length;
    } else if(E.phase === "judge"){
      const isPub = E.tw === "public", amJudge = me === E.judge && !isPub;
      const mine = ctx.mine(), myVote = isPub && mine && mine.v && mine.v.r === E.round ? mine.v.i : null;
      const canPick = amJudge || (isPub && myVote == null && E.subs.some(x => x.id !== me)) || (ctx.isHost && !isPub && !ctx.here(E.judge));
      const key = "pj:" + s.k + canPick + UI.js + myVote;
      const verb = E.tw === "reverse" ? "Choisis la réponse la plus nulle" : isPub ? "Vote pour ta préférée (pas la tienne)" : "Choisis ta réponse préférée";
      view(root, "pj" + s.k, key, head(E, nameOf) + '<span class="eyebrow">' + (canPick ? esc(verb) : isPub ? "Vote enregistré" : esc(nameOf(E.judge)) + " choisit…") + "</span>" +
        subsHTML(E, nameOf, { sel: UI.js, me: isPub ? me : "" }) +
        dock((canPick ? '<button class="btn acc" type="button" data-pick' + (UI.js == null ? " disabled" : "") + ">" + (isPub ? "Voter pour celle-là" : "Elle gagne !") + "</button>" : "") + '<p class="wait" data-wait></p>'), r => {
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
      else txt(root, "[data-wait]", !ctx.here(E.judge) && ctx.isHost ? nameOf(E.judge) + " est absent : choisis à sa place." : "");
    } else if(E.phase === "rev"){
      const end = over(E);
      screen(root, "pr:" + s.k + ctx.isHost, CSS + '<span class="eyebrow">Manche ' + E.round + "</span>" + SB.u.twistHTML(twOf(E.tw)) + revHTML(E, nameOf) +
        '<div class="field"><span class="eyebrow">Scores</span>' + bars(E, nameOf) + "</div>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (end ? "Voir le podium" : "Manche suivante") + '</button><button class="link" type="button" data-stop style="align-self:center">Terminer la partie</button>' : '<p class="wait">L\'hôte passe à la suite…</p>'), r => {
        const nx = r.querySelector("[data-next]");
        if(nx) nx.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s, c.priv()); if(F.phase !== "rev") return;
          if(over(F)) F.phase = "end"; else nextRound(F, liveIds(c));
          publish(c, F);
        }));
        const st = r.querySelector("[data-stop]"); if(st) armTap(st, () => ctx.act(c => { const F = fromState(c.s, c.priv()); F.phase = "end"; publish(c, F); }), "Toucher encore pour terminer");
      });
    } else if(E.phase === "end"){
      const rk2 = ranking(E), champ = rk2[0];
      screen(root, "pe:" + s.k + ctx.isHost, CSS + '<span class="eyebrow">' + esc(fl(FL.win, E.fl, 0)) + '</span><div class="who">' + esc(nameOf(champ)) + "</div>" + bars(E, nameOf) + awardsHTML(awards(E, nameOf)) +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s, {}), o2 = ranking(F), mx = F.pts[o2[0]] || 0;
          c.end({ title: "Punchline · " + c.name(o2[0]) + " gagne", lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (F.pts[id] || 0) + " pts").concat(awards(F, c.name).slice(0, 2).map(a => a[0] + " : " + a[1])),
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
        screen(root, "su" + sel.join() + target + twOn + blOn, CSS + '<p class="howto">Chacun à son tour prend le téléphone et choisit sa carte en secret. Puis on passe le téléphone au juge, qui lit les phrases à voix haute et garde sa préférée.</p>' +
          '<div class="field"><span class="eyebrow">Points pour gagner</span><div class="seg">' + [3, 5, 8].map(n => '<button type="button" data-t="' + n + '" aria-pressed="' + (n === target) + '">' + n + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">Paquets</span><div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + (PQ[p.v].length + PA[p.v].length) + "</span></button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">Variantes</span><div class="packs">' +
            '<button type="button" class="pack" data-bl aria-pressed="' + blOn + '"><span class="box">✓</span><span class="tx"><span class="nm">Cartes blanches</span><span class="ds">Deux réponses libres à écrire soi-même par partie</span></span></button>' +
            '<button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">De temps en temps, une règle change pour une manche</span></span></button></div></div>' +
          dock('<button class="btn acc" type="button" data-go>Commencer</button>'), r => {
          r.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { target = +b.dataset.t; persist({ plTarget: target }); setup(); }));
          r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ plPacks: sel }); setup(); }));
          r.querySelector("[data-bl]").addEventListener("click", () => { blOn = !blOn; persist({ plBlank: blOn }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ plTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast("Choisis au moins un paquet"); return; }
            E = newGame(ids, { packs: sel, target, twists: twOn, blank: blOn });
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
        screen(root, "pa" + E.round + "-" + id, CSS + '<span class="eyebrow">Manche ' + E.round + "</span>" + SB.u.twistHTML(twOf(E.tw)) + '<div class="pass"><span class="eyebrow">Passe le téléphone à</span><div class="who">' + esc(nameOf(id)) + "</div><p>Les autres, ne regardez pas l'écran.</p></div>" +
          dock('<button class="btn acc" type="button" data-n>C\'est moi</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => choose(id)));
      }
      function choose(id){
        view(root, "ch" + E.round + id, "ch" + E.round + id + st.sel.join() + st.blankOpen, '<span class="eyebrow">' + esc(nameOf(id)) + " choisit</span>" + head(E, nameOf, preview(E, id, st)) + handHTML(E, id, st.sel, st.blankOpen) + playDock(E, st), r => {
          bindHand(r, E, id, st, () => { root.dataset.key = ""; choose(id); }, o => { picks[id] = o; queue.shift(); buzz(18); passTo(); });
        });
      }
      function toJudgeScreen(){
        const isPub = E.tw === "public";
        screen(root, "pj" + E.round, CSS + '<span class="eyebrow">Manche ' + E.round + "</span>" + '<div class="pass"><span class="eyebrow">' + (isPub ? "Tout le monde autour du téléphone !" : "Passe le téléphone au juge") + '</span><div class="who">' + esc(isPub ? "Vote du public" : nameOf(E.judge)) + "</div><p>" + (isPub ? "Lisez les phrases à voix haute, votez à main levée, puis touchez la gagnante." : "Lis les phrases à voix haute, puis choisis ta préférée.") + "</p></div>" +
          dock('<button class="btn acc" type="button" data-n>' + (isPub ? "C'est parti" : "C'est moi, le juge") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", judge));
      }
      function judge(){
        const verb = E.tw === "reverse" ? "Choisis la réponse la plus nulle" : E.tw === "public" ? "Touchez la réponse qui a le plus de voix" : "Choisis ta réponse préférée";
        view(root, "ju" + E.round, "ju" + E.round + js, head(E, nameOf) + '<span class="eyebrow">' + esc(verb) + "</span>" + subsHTML(E, nameOf, { sel: js }) +
          dock('<button class="btn acc" type="button" data-pick' + (js == null ? " disabled" : "") + ">Elle gagne !</button>"), r => {
          r.querySelectorAll("[data-s]").forEach(b => b.addEventListener("click", () => { js = +b.dataset.s; buzz(8); judge(); }));
          r.querySelector("[data-pick]").addEventListener("click", () => { if(js == null) return; buzz(24); decide(E, [js]); reveal(); });
        });
      }
      function reveal(){
        const end = over(E);
        screen(root, "rv" + E.round, CSS + '<span class="eyebrow">Manche ' + E.round + "</span>" + SB.u.twistHTML(twOf(E.tw)) + revHTML(E, nameOf) + '<div class="field"><span class="eyebrow">Scores</span>' + bars(E, nameOf) + "</div>" +
          dock('<button class="btn acc" type="button" data-n>' + (end ? "Voir le podium" : "Manche suivante") + '</button><button class="link" type="button" data-stop style="align-self:center">Terminer la partie</button>'), r => {
          r.querySelector("[data-n]").addEventListener("click", () => (end ? finish() : round()));
          armTap(r.querySelector("[data-stop]"), finish, "Toucher encore pour terminer");
        });
      }
      function finish(){
        const o2 = ranking(E), mx = E.pts[o2[0]] || 0;
        if(api.win && mx) api.win(o2.filter(id => (E.pts[id] || 0) === mx).map(nameOf));
        screen(root, "end" + E.round, CSS + '<span class="eyebrow">' + esc(fl(FL.win, E.fl, 0)) + '</span><div class="who">' + esc(nameOf(o2[0])) + "</div>" + bars(E, nameOf) + awardsHTML(awards(E, nameOf)) +
          dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button>'), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
};
DEF.engine = { newGame, nextRound, players, check, toJudge, decide, tally, over, needOf, filled, holes, PQ, PA };
SB.register(DEF);
})();
