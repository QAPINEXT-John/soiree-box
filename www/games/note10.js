/* Note sur 10 — faire deviner une note secrète de 1 à 10 avec des exemples. */
(function(){
"use strict";
const { esc, clean, A, store, persist, screen, txt, pick } = SB.u;

const CATS = [
  ["Un film","Navet","Chef-d'œuvre"],["Un plat","Immangeable","Le repas de ma vie"],
  ["Une destination de vacances","Jamais de la vie","Rêve absolu"],["Un super-pouvoir","Inutile","Le plus fort"],
  ["Un animal","Inoffensif","Terrifiant"],["Un métier","Ennui total","Passionnant"],
  ["Une chanson pour un mariage","Fuite de la piste","Tout le monde danse"],["Une série","Abandonnée à l'épisode 1","Vue trois fois"],
  ["Un jeu vidéo","Désinstallé","Des centaines d'heures"],["Un prénom pour un enfant","Cruel","Magnifique"],
  ["Un cadeau d'anniversaire","Je fais semblant","Je pleure de joie"],["Une excuse pour être en retard","Personne n'y croit","Imparable"],
  ["Une odeur","Insupportable","Divine"],["Un endroit pour un premier rendez-vous","Catastrophe","Parfait"],
  ["Un objet à emporter sur une île déserte","Inutile","Vital"],["Une boisson","Imbuvable","Délicieuse"],
  ["Un sport","Soporifique","Spectaculaire"],["Une tâche ménagère","Presque agréable","Cauchemar"],
  ["Une phobie","Compréhensible","Absurde"],["Une invention","Gadget","A changé le monde"],
  ["Un personnage de fiction","Insupportable","Légende"],["Un dessert","Je passe","Je reprends trois fois"],
  ["Une ville française","Je n'y vivrais pas","Je déménage demain"],["Un moyen de transport","Pénible","Le meilleur"],
  ["Une application sur ton téléphone","Supprimée","Je ne peux pas vivre sans"],["Une émission de télé","Honte de regarder","Culte"],
  ["Une matière à l'école","Torture","Ma préférée"],["Un truc qui fait peur la nuit","Rien du tout","Je ne dors plus"],
  ["Une star","Inconnue au bataillon","Tout le monde la connaît"],["Une saison ou une météo","Déprimante","Idéale"],
  ["Une habitude","Saine","Toxique"],["Un aliment au petit-déjeuner","Bizarre","Indispensable"],
  ["Un bruit","Apaisant","Insupportable"],["Une couleur pour repeindre sa chambre","Jamais","Coup de cœur"],
  ["Un dessin animé","Raté","Culte"],["Un mot de la langue française","Moche","Magnifique"],
  ["Une activité un dimanche","Corvée","Bonheur"],["Une situation gênante","Un peu","Je veux disparaître"],
  ["Un objet dans une cuisine","Inutile","Indispensable"],["Une marque","Ringarde","Iconique"],
  ["Un fromage","Fade","Puissant"],["Un monstre ou une créature","Mignon","Cauchemardesque"],
  ["Un talent caché","Banal","Impressionnant"],["Une boisson énergisante ou un soda","Écœurant","Parfait"],
  ["Une époque historique","Pour rien au monde","J'y vais demain"],["Un lieu pour faire la fête","Ambiance morte","Soirée mythique"],
  ["Une épice ou un condiment","Doux","Ça brûle"],["Une tenue pour un entretien d'embauche","Recalé direct","Embauché"],
  ["Un mensonge","Innocent","Impardonnable"],["Un animal de compagnie","Facile","Ingérable"],
  ["Un instrument de musique","Insupportable","Envoûtant"],["Un film d'horreur","Rigolo","Traumatisant"],
  ["Un nom de groupe de musique","Ridicule","Génial"],["Une façon de perdre dans un jeu vidéo","Banale","Humiliante"],
  ["Un réveil le matin","Doux","Brutal"],["Un sujet de conversation à table","Sans risque","Dispute garantie"],
  ["Un gâteau d'anniversaire","Raté","Œuvre d'art"],["Un plat de cantine","Fuite","On en redemande"],
  ["Un look","Classique","Extravagant"],["Un endroit pour se cacher","Trouvé en 2 s","Introuvable"],
  ["Un bruit de voisin", "Supportable", "Je déménage"],["Un petit plaisir de la vie", "Sympa", "Le paradis"],["Une manie agaçante", "Mignonne", "Rupture immédiate"],["Un cadeau de collègue", "Oubliable", "Je le garde à vie"],["Un plat surgelé", "Triste", "Meilleur que le resto"],["Une raison d'annuler une soirée", "Valable", "Honteuse"],["Un endroit pour faire la sieste", "Inconfortable", "Un nuage"],["Un jeu de cour de récré", "Ennuyeux", "Légendaire"],["Une compétence à apprendre", "Inutile", "Ça change la vie"],["Une boisson chaude", "Imbuvable", "Réconfort absolu"],["Un fruit", "Décevant", "Parfait"],["Un légume", "Je le trie", "J'en reprends"],["Un souvenir d'enfance", "Flou", "Inoubliable"],["Une fête de l'année", "Corvée", "Vivement"],["Un objet perdu", "Tant pis", "Drame"],["Une activité sous la pluie", "Déprimante", "Géniale"],["Une sauce", "Fade", "Je la bois"],["Un trajet en voiture", "Interminable", "Road trip de rêve"],["Une coupe de cheveux", "Accident", "Iconique"],["Un bruit de la nature", "Inquiétant", "Apaisant"],["Une pièce de la maison", "Lugubre", "Mon refuge"],["Un emoji", "Inutile", "Je l'utilise tout le temps"],["Une façon de dire au revoir", "Glaciale", "Touchante"],["Un parfum de glace", "Bizarre", "Le meilleur"],["Un jour de la semaine", "Le pire jour", "Le meilleur jour"],["Un loisir créatif", "Ennuyeux", "Passion"],["Une qualité chez un ami", "Accessoire", "Essentielle"],["Un défaut chez un coloc", "Pardonnable", "Rédhibitoire"],["Un jeu de cartes", "Soporifique", "Addictif"],["Une pâtisserie", "Sèche", "Divine"],["Un endroit pour pique-niquer", "Raté", "Idyllique"],["Un souvenir de vacances à ramener", "Kitsch", "Précieux"],["Une tradition familiale", "Pénible", "Sacrée"],["Une odeur de cuisine", "Écœurante", "Irrésistible"]
];
const GEEK = [
  ["Un boss de jeu vidéo","Fastoche","Rage quit"],["Un super-héros","Nul","Le plus classe"],
  ["Un méchant de film","Ridicule","Terrifiant"],["Un mème","Gênant","Culte"],
  ["Un anime ou un manga","Abandonné","Chef-d'œuvre"],["Une fin de série","Ratée","Parfaite"],
  ["Un spoiler","Rien de grave","Impardonnable"],["Une console","Flop","Légendaire"],
  ["Un youtubeur ou un streamer","Insupportable","Génial"],["Un remake ou un reboot","Inutile","Meilleur que l'original"],
  ["Une musique de jeu vidéo","Oubliable","Mythique"],["Une saga de films","Un film de trop","Parfaite"],
  ["Un pouvoir magique","Gadget","Surpuissant"],["Une arme dans un jeu","Inutile","Cheatée"],
  ["Un personnage de jeu vidéo","Agaçant","Iconique"],["Une mise à jour d'appli","Catastrophe","Révolution"],
  ["Un réseau social","Toxique","Indispensable"],["Une tendance TikTok","Ringarde","Virale"],
  ["Un jeu de société","Ennuyeux","Soirée parfaite"],["Une BD ou un comics","Illisible","Culte"],
  ["Un easter egg","Introuvable","Tout le monde le connaît"],["Un bug de jeu vidéo","Discret","Légendaire"],
  ["Un pseudo en ligne", "Gênant", "Légendaire"],["Un mot de passe", "Piraté en 2 s", "Coffre-fort"],["Un gadget high-tech", "Inutile", "Révolution"],["Une fin de jeu vidéo", "Décevante", "Larmes aux yeux"],["Un personnage secondaire", "Oubliable", "Mérite sa propre série"],["Un robot de film", "Ferraille", "Iconique"],["Une planète de science-fiction", "Hostile", "J'y emménage"],["Une vidéo à regarder à 2 h du matin", "Soporifique", "Je ne dors plus"],["Un sort de magie", "Inutile", "Surpuissant"],["Un tutoriel en ligne", "Incompréhensible", "Il m'a sauvé"],["Une notification", "Agaçante", "Excellente nouvelle"],["Un jeu sur téléphone", "Désinstallé", "Addiction totale"],["Un costume de cosplay", "Raté", "Bluffant"]
];
const ABSURDE = [
  ["Tu te réveilles avec un super-pouvoir, mais il est nul. Lequel ?","Totalement inutile","Finalement pratique"],
  ["Le Père Noël s'est trompé de hotte. Qu'y a-t-il sous ton sapin ?","Catastrophe","Meilleur Noël de ma vie"],
  ["Un génie exauce ton vœu mais comprend tout de travers. Que se passe-t-il ?","Désastre","Coup de chance"],
  ["Tu survis une semaine sur une île avec un seul objet de tes poches. Lequel ?","Mort au jour 1","Roi de l'île"],
  ["Des extraterrestres veulent voir le meilleur de l'humanité. Tu leur montres quoi ?","Ils repartent vexés","Ils signent la paix"],
  ["Ta nouvelle appli révolutionnaire. Elle sert à quoi ?","Flop total","Licorne de la tech"],
  ["Ton animal se met à parler. Sa première phrase ?","Glaçante","Adorable"],
  ["Ton dernier repas avant la fin du monde","Triste","Parfait"],
  ["Coincé six heures dans un ascenseur. Avec qui ?","Cauchemar","Meilleur moment de ma vie"],
  ["Le nouveau parfum de glace que personne n'a demandé","Immangeable","Je veux goûter"],
  ["Ta reconversion si l'informatique disparaît demain","Galère","Carrière de rêve"],
  ["Tu remontes cent ans en arrière avec ton téléphone. Tu fais quoi ?","Brûlé pour sorcellerie","Empereur du monde"],
  ["Ton slogan de campagne pour devenir maire","Zéro voix","Élu au premier tour"],
  ["Ton plat signature dans une émission de cuisine","Éliminé","Étoilé"],
  ["Le nom de ton groupe de rock de garage","Ridicule","Mythique"],
  ["Une nouvelle épreuve aux Jeux olympiques","Personne ne regarde","Audience record"],
  ["Tu es invisible, mais seulement quand personne ne te regarde. Ça te sert à quoi ?","À rien","Coup de génie"],
  ["Ton dernier message avant un aller simple pour Mars","Banal","Légendaire"],
  ["La mascotte des prochains Jeux olympiques","Ratée","Iconique"],
  ["Ce que tu ramènes d'une boutique de souvenirs en enfer","Pourri","Trop stylé"],
  ["Ton excuse quand la police te trouve en pyjama dans un zoo à 4 h","Personne n'y croit","Ils s'excusent"],
  ["Le jouet star du prochain Noël","Flop","Rupture de stock"],
  ["Ce que fait le fantôme qui hante ton appart","Inoffensif","Je déménage"],
  ["Tu gagnes un an d'abonnement gratuit. À quoi ?","Inutile","Jackpot"],
  ["La première loi que tu fais voter au pouvoir","Inutile","Révolution"],
  ["Ce que tu trouves dans la poche d'un manteau de friperie","Rien d'intéressant","Ça change ma vie"],
  ["Tu es le méchant d'un film. Ton plan diabolique ?","Pathétique","Terrifiant"],
  ["Ta stratégie de survie pendant une apocalypse zombie","Mort dans la première scène","Dernier survivant"],
  ["Ce que ta brosse à dents dirait de toi si elle parlait","Elle démissionne","Elle t'adore"],
  ["Un métier qui existera en 2100","Absurde","Indispensable"],
  ["Tu te fais cloner. Que fait ton clone en premier ?","Il me trahit","Il fait tout à ma place"],
  ["Ce que tu mets dans une capsule temporelle pour dans 50 ans","Inutile","Trésor historique"],
  ["Le titre de ton autobiographie","Personne ne l'achète","Best-seller"],
  ["L'objet du quotidien qui te sert d'arme contre un cambrioleur","Inefficace","Redoutable"],
  ["Tu deviens chef de ta résidence. Ta première décision ?","Émeute","Statue en ton honneur"],
  ["Ce que tu dis à un dinosaure ressuscité pour qu'il ne te mange pas","Il te mange","Il devient ton ami"],
  ["Le pire super-pouvoir pour un premier rendez-vous","Ça passe","Rendez-vous gâché"],
  ["Ton menu de restaurant pour extraterrestres","Incident diplomatique","Ils veulent la recette"],
  ["Ce que garde un agent secret au fond de son sac","Banal","Arsenal complet"],
  ["Tu inventes une fête nationale. On y fait quoi ?","Personne ne vient","Meilleur jour de l'année"],
  ["Tu te réveilles dans le corps de ton chat. Ta première action ?", "Sieste", "Domination du foyer"],["Une loi bizarre votée demain matin", "Inoffensive", "Chaos national"],["Ta voix devient celle d'un commentateur sportif. Ça donne quoi au quotidien ?", "Agaçant", "Génial"],["Un musée consacré à ta vie. La pièce maîtresse ?", "Embarrassante", "Chef-d'œuvre"],["Tu peux parler à un seul type d'objet. Lequel ?", "Inutile", "Indispensable"],["Le sport de combat inventé par ta famille", "Inoffensif", "Interdit"],["La notice de montage de ta personnalité", "Simple", "Introuvable"],["Ta chambre devient un escape game. L'énigme finale ?", "Évidente", "Personne n'en sort"],["Ce que les pigeons pensent vraiment des humains", "Ils nous aiment", "Ils préparent un coup"],["Le parc d'attractions de tes rêves. L'attraction phare ?", "Ennuyeuse", "Mythique"],["Tu remplaces la mascotte d'un club de sport. Ton costume ?", "Ridicule", "Culte"],["Une nouvelle couleur vient d'être découverte. Son nom ?", "Moche", "Sublime"],["Les nuages forment un message pour toi. Il dit quoi ?", "Banal", "Bouleversant"],["Le bruit de ton frigo la nuit veut dire quoi ?", "Rien", "Il complote"],["Tu ouvres un restaurant avec un seul plat. Lequel ?", "Faillite", "Queue jusqu'au coin de la rue"],["Une télé-réalité dont tu serais le héros", "Annulée", "Record d'audience"],["Ton super-héros a un point faible ridicule. Lequel ?", "Gênant", "Fatal"],["Le cri de guerre de ton équipe de pétanque", "Timide", "Terrifiant"],["Tu gagnes un objet magique dans un vide-grenier. Lequel ?", "Inutile", "Tout-puissant"],["La première phrase du manuel pour devenir adulte", "Rassurante", "Effrayante"],["Ta journée idéale si la gravité disparaissait", "Banale", "Grandiose"]
];
const HARD = [
  ["Ta mère lit ton dernier message envoyé. Qu'est-ce qu'il dit ?","Elle sourit","Elle appelle un prêtre"],
  ["Ce que tu cries en te réveillant chez un inconnu après une soirée","Calme","Panique totale"],
  ["La pire phrase pour commencer un discours de mariage","Maladroite","Divorce le jour même"],
  ["Ce que tu trouves en fouillant le téléphone de ton pote","Rien de grave","J'appelle un avocat"],
  ["Ton excuse pour avoir vomi sur le canapé de l'hôte","Crédible","Personne n'y croit"],
  ["Ce que tu dis à ton patron en arrivant bourré au boulot","Discret","Viré sur-le-champ"],
  ["Le pire nom pour un bar de nuit","Ça passe","Fermé par la préfecture"],
  ["Ce qu'on trouve dans ton sac le lendemain d'une soirée","Normal","Il faut appeler quelqu'un"],
  ["Ce que tu ferais pendant 24 h sans aucune conséquence","Sage","Interdit dans tous les pays"],
  ["Ce que la voyante t'annonce pour tes 40 ans","Rassurant","Cauchemar"],
  ["La pire chose à dire à un enterrement","Maladroit","On t'escorte dehors"],
  ["Ce que tu fais quand tes potes sont partis et que t'es seul chez toi","Normal","Personne ne doit savoir"],
  ["Ce qu'on trouve au fond du frigo d'un étudiant","Encore mangeable","Ça bouge"],
  ["Ce que ton ex raconte sur toi à ses potes","Gentil","Diffamation"],
  ["Un vocal de 4 minutes de ta tante. De quoi il parle ?","Banal","Drame familial"],
  ["Le pire cadeau pour ta belle-mère","Maladroit","Déshérité"],
  ["Ce que tu dis au contrôleur quand t'as pas de ticket","Crédible","Garde à vue"],
  ["Le truc le plus honteux que t'as fait bourré","Mignon","Banni à vie"],
  ["Le pire tatouage à se faire sur le front","Ça passe","Vie gâchée"],
  ["Ce que ta grand-mère découvre sur ton Insta","Elle like","Elle te déshérite"],
  ["Ce que tu cries en marchant sur un Lego à 3 h du mat","Poli","Tout l'immeuble entend"],
  ["Le pire endroit pour une envie pressante","Pas grave","Fin de vie sociale"],
  ["Une rumeur à lancer sur le prof le plus strict","Gentille","Il quitte l'établissement"],
  ["Le mot que tu laisses sur le frigo au coloc qui vole tes courses","Passif-agressif","Déclaration de guerre"],
  ["Ce qu'on entend à travers le mur de la chambre d'hôtel","Rien de spécial","On appelle la réception"],
  ["La raison de ton retard, version donnée au patron","Crédible","Mytho de l'année"],
  ["Ton talent caché en soirée","Utile","Inquiétant"],
  ["Ce que tu fais si t'es invisible pendant une journée","Sage","Prison à vie"],
  ["Ce que tu dis quand on te surprend à pleurer devant une pub","Assumé","Mensonge énorme"],
  ["Ta réaction quand le Wi-Fi coupe en pleine partie classée","Zen","Violence"],
  ["La pire chose à crier dans une bibliothèque","Gênant","Évacuation du bâtiment"],
  ["Le souvenir que tu ramènes de vacances pour tes potes","Pourri","Légendaire"],
  ["Le pire endroit pour se faire larguer","Ça passe","Traumatisme public"],
  ["Ce que tu reçois par la poste sans l'avoir commandé","Décevant","On appelle le déminage"],
  ["Ce que fait ton pote quand il a trop bu","Mignon","Il faut le surveiller"],
  ["Le pire prénom à donner à ton enfant","Original","Il te poursuivra en justice"],
  ["Ce que tu dis en croisant la personne qui t'a ghosté","Poli","Scène publique"],
  ["Ce que tu écris dans le livre d'or d'un mariage après six verres","Touchant","Gros malaise"],
  ["Le pire sujet pour briser la glace au premier rendez-vous","Maladroit","Il ou elle s'enfuit"],
  ["Ce que tu fais en premier si tu gagnes au loto","Raisonnable","Complètement fou"],
  ["Ce que tu dis au taxi à 5 h du matin", "Poli", "Il te dépose au commissariat"],["Ton dernier achat en ligne à 3 h du matin", "Raisonnable", "Je n'assume pas"],["Le pire message à envoyer par erreur au groupe de la famille", "Anodin", "Repas de Noël annulé"],["Ce que tu fais quand le livreur sonne et que t'es pas prêt", "Je gère", "Je fais le mort"],["La pire excuse pour ne pas rembourser un pote", "Crédible", "Amitié terminée"],["Ce que ton chef découvre sur ton écran", "Un tableur", "Lettre de démission"],["La pire chose à oublier en partant en vacances", "Rien de grave", "Vacances gâchées"],["Ce que tu fais en premier après une rupture", "Sain", "Inquiétant"],["Le pire endroit pour s'endormir", "Le canapé", "La garde à vue"],["Ta réaction quand on te réveille d'une sieste", "Douce", "Danger"],["Ce que tu racontes à ton coiffeur", "Banal", "Toute ta vie"],["La pire chose à dire à un date au moment de payer", "Maladroite", "Il ou elle part en courant"],["Ce que tu as fait de pire pour un pari", "Rien", "Légendaire"],["Le pire endroit pour vomir en soirée", "Les toilettes", "Dans le sac de quelqu'un"],["Ce que tu fais en voyant ton ex en terrasse", "Je salue", "Je change de ville"],["Le message envoyé au mauvais destinataire", "Anodin", "Catastrophe nucléaire"],["Le pire déguisement pour une soirée d'entreprise", "Ça passe", "Convoqué aux RH"],["Le pire plat à servir à ta belle-famille", "Raté", "Hospitalisation"],["Ce que tu inventes pour quitter une soirée nulle", "Crédible", "Personne n'y croit"],["Ce que tu fais dans l'ascenseur quand t'es seul", "Rien", "Concert privé"]
];
const TABOU = [
  ["Un endroit chez tes parents pour faire l'amour","Ça passe","Sacrilège"],
  ["Le nom d'un sex-shop","Classe","Fermé dans la semaine"],
  ["Ce que tu dis à tes parents qui te surprennent en pleine action","Crédible","Je change d'identité"],
  ["Ta phrase d'accroche sur une appli de rencontre","Bloqué direct","Match immédiat"],
  ["Ce qu'on trouve dans la table de nuit de ton voisin","Banal","Je déménage"],
  ["Ton nom de scène de star du X","Ridicule","Légendaire"],
  ["Le titre du film de ta vie sexuelle","Gênant","Chef-d'œuvre"],
  ["Ce que tu murmures à l'oreille pour séduire","Tue-l'amour","Irrésistible"],
  ["Un fantasme que tu n'avoueras qu'à cette table","Sage","Inavouable"],
  ["Ce que ton ex dirait de toi au lit","S'est endormi en plein milieu","En parle encore"],
  ["La pire excuse pour une panne au lit","Crédible","Personne n'y croit"],
  ["Le message que tu envoies à ton ex à 2 h du matin","Innocent","Clairement pas innocent"],
  ["Un jeu de rôle à proposer à ton ou ta partenaire","Sage","Beaucoup trop loin"],
  ["Ce que tu fais en te réveillant à côté de ton boss","Je gère","Je démissionne par SMS"],
  ["Le truc le plus bizarre qui t'excite","Normal","Très, très bizarre"],
  ["Une célébrité pour un plan à trois","Bof","Je signe direct"],
  ["Ce que tu avoues à ton partenaire après trois verres","Mignon","Rupture"],
  ["La tenue la moins sexy pour un rendez-vous coquin","Ça passe","Tue-l'amour absolu"],
  ["Le prénom à ne jamais crier au lit","Pardonnable","C'est fini"],
  ["Ce que dit ton partenaire en tombant sur ton historique","Il rigole","Il fait ses valises"],
  ["Un sex toy qu'il faudrait inventer","Inutile","Révolutionnaire"],
  ["Ce que tu proposes pour pimenter un couple qui s'ennuie","Sage","Très osé"],
  ["Ce que tu n'as jamais osé demander au lit","Anodin","Tabou absolu"],
  ["La pire phrase après une première nuit","Maladroite","On ne se rappelle jamais"],
  ["Ce que tes voisins ont entendu cette nuit","Rien de spécial","Ils ont appelé la police"],
  ["Le pire moment pour sortir un préservatif","Gênant","Scandale"],
  ["Ce que tu dis quand un collègue tombe sur ton profil de rencontre","Assumé","Mensonge énorme"],
  ["La question que tu poses au médecin en chuchotant","Banale","Il appelle un collègue"],
  ["Ce que contient le dossier caché de ton téléphone","Rien de grave","Mise en quarantaine"],
  ["La pire chose à dire en pleine action","Maladroit","On arrête tout"],
  ["Ce que tu ferais pour un million d'euros","Facile","Plus aucune dignité"],
  ["Un secret de famille que personne ne doit connaître","Anodin","Héritage annulé"],
  ["Ce que tu penses vraiment pendant le repas de famille","Poli","Guerre ouverte"],
  ["La pensée la plus déplacée pendant un enterrement","Légère","Je vais en enfer"],
  ["Le pire endroit où tu as fait pipi","Normal","Interdit par la loi"],
  ["Le plus gros mensonge que tu as dit à un ex","Pieux","Monumental"],
  ["Ta vengeance contre un ex infidèle","Classe","Fait divers"],
  ["Ta technique pour t'éclipser après un plan d'un soir","Élégante","Fuite par la fenêtre"],
  ["Ce que tu cherches sur internet en navigation privée","Normal","Je suis fiché"],
  ["L'endroit le plus risqué pour un câlin coquin","Tranquille","Interpellé"],
  ["Cupidon s'est trompé de flèche. De qui tombes-tu amoureux ?","Catastrophe","Jackpot"],
  ["Un colis anonyme de sex-shop arrive chez toi. Qu'y a-t-il dedans ?","Banal","J'ouvre plus jamais un colis"],
  ["Un génie coquin t'accorde un vœu au lit. Lequel ?","Sage","Inavouable"],
  ["Ta mère s'inscrit sur la même appli de rencontre que toi. Sa bio ?","Mignonne","Traumatisante"],
  ["La première ligne de la notice d'un sex toy","Technique","Torride"],
  ["Ton partenaire organise un week-end coquin surprise. Où ?","Tue-l'amour","Inoubliable"],
  ["Ton matelas se met à parler. Que dit-il ?","Rien à signaler","Il en a trop vu"],
  ["Le nom de la position que tu viens d'inventer","Ridicule","Direct dans le Kamasutra"],
  ["Le message d'adieu de ton dernier plan d'un soir","Poli","Assassin"],
  ["Le pire endroit pour un premier bisou", "Mignon", "Scandale public"],["Ce que tu mets dans ta bio de rencontre pour mentir", "Petit arrangement", "Faux profil"],["Ta technique de drague la plus nulle", "Ratée", "Légendairement nulle"],["Ce que tu fais si ton date ressemble à ton ex", "Je reste", "Je fuis"],["Ce que tu n'avouerais jamais à tes beaux-parents", "Anodin", "Rupture familiale"],["La pire chose à trouver dans la salle de bain de ton date", "Rien", "Je pars sans dire au revoir"],["Le surnom ridicule que tu donnes à ton ou ta partenaire", "Mignon", "Insoutenable"],["Ce que tu fais en visio quand ta caméra est coupée", "Rien", "Inavouable"],["Le pire endroit pour rompre", "Le salon", "Au mariage d'un pote"],["La pire chose à dire au réveil après une première nuit", "Maladroite", "Inoubliable"],["Ce que ton clavier suggère quand tu tapes « je »", "Innocent", "Accablant"],["Ce que tu fais si tu croises ton ancien prof en boîte", "Je salue", "Je danse avec"],["Ton pire râteau", "Gentil", "Humiliation publique"],["La pire déclaration d'amour", "Maladroite", "Ordonnance d'éloignement"],["Ce que tu caches sous ton lit", "Des chaussettes", "Personne ne doit savoir"],["Ton crush le plus inavouable", "Normal", "Je l'emporte dans la tombe"],["Le pire endroit où se faire surprendre en train de s'embrasser", "Ça passe", "Viral sur internet"],["Le mot doux que tu laisses sur l'oreiller", "Mignon", "Torride"],["Le pire cadeau de Saint-Valentin", "Banal", "Rupture"],["Ce que tu fais pour rendre ton ex jaloux", "Subtil", "Pathétique"],["La pire réponse à « tu penses à quoi ? »", "Rien", "Tout gâcher"],["Le défi coquin que tu proposes en soirée", "Sage", "Personne n'ose"],["Ce que ton ou ta partenaire ne saura jamais", "Rien de grave", "Ça finirait mal"],["La tenue que tu mets pour séduire", "Classique", "Arme fatale"],["La pire chanson pour une ambiance romantique", "Ça passe", "Tue-l'amour total"]
];


const TRASH = [["Le titre du porno parodique de ton film préféré", "Nul", "Chef-d'œuvre du genre"], ["Ce que ton historique de navigation privée dit de toi", "Rien de grave", "Il faut te faire suivre"], ["Une catégorie de site porno", "Classique", "Je ne savais pas que ça existait"], ["Le pire endroit pour un plan cul", "Ça passe", "Casier judiciaire"], ["Ton bruit au moment de l'orgasme", "Discret", "Les voisins appellent la police"], ["Ce que tu cries au moment fatidique", "Normal", "Inavouable"], ["Une position que tu n'oseras jamais tenter", "Facile", "Il faut un kiné"], ["Le pire sex toy à offrir à ta grand-mère", "Gênant", "Déshérité"], ["Ce que tu dis à ton plan cul en partant au petit matin", "Classe", "Goujat absolu"], ["Ton fantasme le plus inavouable", "Sage", "Interdit dans 40 pays"], ["Le nom de ton futur sex toy connecté", "Ridicule", "Best-seller"], ["Un endroit où tu l'as fait, ou rêvé de le faire", "Banal", "Attentat à la pudeur"], ["Ce qui t'a coupé l'envie en plein acte", "Rien", "Traumatisme"], ["La pire chose à trouver sous le lit d'un date", "Une chaussette", "J'appelle un prêtre"], ["Ta technique de préliminaires", "Expédiée", "Légendaire"], ["Un dirty talk raté", "Gênant", "Fou rire général"], ["Le scénario de porno le plus nul", "Ennuyeux", "Oscar du X"], ["Ce que tu fais avec de la chantilly", "Un dessert", "Plus jamais propre"], ["Ton record de durée au lit", "Trente secondes", "Marathon"], ["Un accessoire inattendu pendant l'acte", "Une bougie", "Appel aux pompiers"], ["La pire rencontre sur une appli de cul", "Bof", "Fait divers"], ["Ce que tu n'avoueras jamais à ton médecin", "Banal", "Il appelle un collègue"], ["Un fétiche surprenant", "Les pieds", "Je ne comprends même pas"], ["Ta pire histoire de capote", "Elle a craqué", "Souvenir de 9 mois"], ["Ce que ton ex raconte sur tes performances", "Élogieux", "Diffamation"], ["Le plan à plusieurs le plus improbable", "Trois potes", "Tout l'immeuble"], ["Un nude raté", "Flou", "Envoyé au groupe famille"], ["Ce que tu mets sur ta liste de cadeaux coquine", "Des menottes", "Un donjon complet"], ["La pire excuse après une panne", "La fatigue", "Je t'aime trop"], ["Le surnom de ton entrejambe", "Mignon", "Légendaire"], ["Une soirée qui finit en partouze", "Impossible", "Classique du samedi"], ["Ce que tu as découvert en regardant du porno", "Rien", "Ma vocation"], ["Le sexe le plus gênant de ta vie", "Raté", "Ambulance"], ["Ta performance au lit, notée par ton dernier partenaire", "Remboursez", "Standing ovation"], ["Le lubrifiant le plus improbable", "Huile d'olive", "Je ne veux pas savoir"], ["Un endroit au travail pour un quickie", "Le placard", "Le bureau du patron"], ["Ce que tu as fait pour un plan cul", "Un trajet en bus", "Un vol long-courrier"], ["La pire phrase après l'amour", "Merci", "Tu peux partir"], ["La pratique que tu refuses catégoriquement", "Rien", "Tout sauf ça"], ["Ton nom de star du X", "Ridicule", "Légende du X"],
  ["Le pire bruit pendant l'acte", "Discret", "Fou rire"],["Le nom de code pour dire « on rentre faire l'amour »", "Discret", "Tout le monde a compris"],["Ce que tu fais quand le lit grince trop", "On ralentit", "On finit par terre"],["La pire interruption pendant un câlin", "Le chat", "Les beaux-parents"],["La position la plus ridicule", "Classique", "Il faut un mode d'emploi"],["Ce que tu as acheté au sex-shop par erreur", "Rien", "Je ne sais pas ce que c'est"],["Le pire endroit pour prendre un nude", "La salle de bain", "Au bureau"],["Ta playlist pour faire l'amour", "Romantique", "Un générique de dessin animé"],["Le pire costume pour un jeu de rôle", "Infirmier", "Mascotte de stade"],["Ce que tu fais juste après l'amour", "Câlin", "Je joue à la console"],["Ce que tu tapes dans la recherche d'un site X", "Classique", "Ça m'inquiète"],["Le pire objet pour remplacer un sex toy", "Créatif", "Urgences"],["Ton excuse pour la marque dans ton cou", "Crédible", "Personne n'y croit"],["Le pire moment pour que ton téléphone sonne", "Pendant un câlin", "En pleine action"],["La pire chose à dire pendant un strip-tease", "Maladroite", "Le show s'arrête"],["Ta technique de drague la plus directe", "Subtile", "Interdite"],["Ce qu'on trouve dans la table de nuit d'un couple marié", "Rien", "Toute une boutique"],["Le mot de sécurité le moins pratique", "Facile", "Imprononçable"],["La pire chose à dire en enlevant ses vêtements", "Gênante", "On se rhabille"],["Le fantasme le plus cliché", "Original", "Vu mille fois"]
];
const NOIR = [["Ta dernière phrase avant de mourir", "Banale", "Légendaire"], ["Ce que tu écris dans ton testament", "Classique", "Vengeance posthume"], ["La musique à jouer à ton enterrement", "Triste", "Tout le monde danse"], ["Une façon ridicule de mourir", "Bête", "Prix Darwin"], ["Ce que tu fais quand le médecin t'annonce qu'il te reste une semaine", "Digne", "Je vide mon compte en banque"], ["Ton épitaphe", "Sobre", "Culte"], ["Le pire cadeau à offrir à un mourant", "Gênant", "Cynique"], ["Ce que tu ferais si tu étais un fantôme", "Hanter gentiment", "Terreur absolue"], ["La pire blague à faire à un enterrement", "Maladroite", "Expulsé du cimetière"], ["Ta place en enfer", "Sous-sol", "Carré VIP avec le diable"], ["Ce que tu fais de ton héritage", "Raisonnable", "Tout claqué en une nuit"], ["L'animal de compagnie qui te mangerait après ta mort", "Le hamster", "Tous, sans hésiter"], ["Une raison de ne pas aller à un enterrement", "Valable", "Monstrueuse"], ["Ce que la Mort te dit en venant te chercher", "Polie", "Elle se moque de toi"], ["Le pire endroit pour mourir", "Paisible", "Ridicule"], ["Ce qu'on trouvera dans ton ordi après ta mort", "Rien", "Scandale posthume"], ["La pire façon d'annoncer un décès", "Maladroite", "Par un mème"], ["Ton plan pour survivre à l'apocalypse", "Mort au jour 1", "Seigneur des ruines"], ["Ce que tu glisses dans le cercueil de ton pire ennemi", "Une fleur", "Un mot doux bien senti"], ["Une mauvaise nouvelle à annoncer au repas de Noël", "Gênante", "La bûche est gâchée"], ["Le pire nom pour une entreprise de pompes funèbres", "Sobre", "Scandale"], ["Ce que tu dis au diable pour négocier ton âme", "Faible", "Il te doit de l'argent"], ["Le hobby du tueur en série dans un film", "Banal", "Glaçant"], ["Ce que tu fais si tu te réveilles dans ton cercueil", "Panique", "Je fais la sieste"], ["La réaction de ta famille à ta mort", "Effondrée", "Soulagée"], ["Le pire souvenir à ramener d'un cimetière", "Une fleur", "Un tibia"], ["Ta réincarnation", "Moustique", "Chat de riche"], ["Ce que tu publies en apprenant ta fin imminente", "Digne", "Règlement de comptes"], ["Le pire dernier repas", "Fade", "Plat de cantine"], ["Ce que dirait le prêtre à ton enterrement s'il te connaissait vraiment", "Élogieux", "Il se signe trois fois"], ["La pire manière d'apprendre qu'on est adopté", "Avec douceur", "À la lecture du testament"], ["Le pire moment pour un fou rire", "Pas grave", "Pendant la minute de silence"], ["Ce que tu ferais si tu étais le dernier humain sur Terre", "Pleurer", "Enfin la paix"], ["Le pire job dans un film d'horreur", "Figurant", "Babysitter de la maison hantée"],
  ["Ce que tu lègues à ton pire ennemi", "Rien", "Tes dettes"],["La pire façon de quitter un groupe d'amis", "Discrète", "Mise en scène de ta mort"],["Le pire fantôme à avoir chez soi", "Discret", "Ton ex"],["Ce que ton chat fera de toi après ta mort", "Il te respecte", "Il te grignote"],["La pire musique d'attente du paradis", "Supportable", "Interminable"],["Le message de ton répondeur après ta mort", "Sobre", "Hilarant"],["La pire manière de rater sa propre fête surprise", "Retard", "Crise cardiaque"],["La pire chose à graver sur une urne", "Sobre", "Scandale"],["Le pire cadeau d'adieu à un collègue", "Banal", "Un cercueil en kit"],["Ce que tu fais si tu apprends que tu es immortel", "Je profite", "Je m'ennuie à mourir"],["Le pire endroit pour disperser des cendres", "Un jardin", "Devant un ventilateur"],["Ce que disait ton horoscope le jour de ta mort", "Rassurant", "Il avait prévenu"],["Ta stratégie dans un film catastrophe", "Courir", "Se cacher sous la table"],["Ta dernière volonté la plus absurde", "Raisonnable", "Impossible"],["Le pire sujet de discours à une veillée funèbre", "Touchant", "Règlement de comptes"],["Ce que tu emportes dans l'au-delà", "Un souvenir", "Le wifi"],["Ce que tu fais si la Mort se trompe d'adresse", "Je la renvoie", "Je lui donne l'adresse du voisin"]
];

const PACKS = [
  { v: "classique", label: "Classique", desc: "Pour tout le monde", cats: CATS },
  { v: "geek", label: "Pop culture & geek", desc: "Jeux vidéo, séries, internet", cats: GEEK },
  { v: "absurde", label: "Situations absurdes", desc: "Des prémisses folles, réponses à inventer", cats: ABSURDE },
  { v: "adulte", label: "Adultes", desc: "Sexe, porno, tabous, humour noir : tout le contenu adulte", cats: HARD.concat(TABOU, TRASH, NOIR), hot: true },
  { v: "perso", label: "Catégories perso", desc: "Les tiennes, et en réseau celles des joueurs du salon", cats: null }
];
function norm(c){ c = A(c); if(c.length !== 3) return null; const x = [clean(c[0], 90), clean(c[1], 24) || "Le pire", clean(c[2], 24) || "Le meilleur"]; return x[0] ? x : null; }
function myCustom(){ return A(store().n10custom).map(norm).filter(Boolean); }
function sharedCustom(peers){
  const seen = new Set(), out = [];
  const add = c => { const x = norm(c); if(!x) return; const k = x[0].toLowerCase(); if(seen.has(k)) return; seen.add(k); out.push(x); };
  myCustom().forEach(add);
  A(peers).forEach(p => { const x = p.presence && p.presence.x; if(x && x.note10) A(x.note10).forEach(add); });
  return out;
}
function buildPool(packs, peers){
  const sel = A(packs);
  return PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => (p.v === "perso" ? sharedCustom(peers) : p.cats).map(c => c.slice()));
}
/* ---------- Coups de théâtre : une manche sur trois environ, une règle change ---------- */
const TWISTS = [
  { id: "inv", name: "Note inversée", desc: "Cette manche, 1 est la meilleure note et 10 la pire." },
  { id: "mot", name: "Un seul mot", desc: "Chaque indice tient en un seul mot, pas un de plus." },
  { id: "double", name: "Double ou rien", desc: "Pile : 6 points. Sinon : rien du tout." },
  { id: "large", name: "Tolérance large", desc: "À 3 près, ça rapporte encore 1 point." },
  { id: "aveugle", name: "Devineur à l'aveugle", desc: "Le devineur ne voit pas la catégorie, seulement les indices." },
  { id: "extreme", name: "Note extrême", desc: "La note secrète est forcément 1, 2, 9 ou 10." },
  { id: "milieu", name: "Ventre mou", desc: "La note secrète est forcément entre 4 et 7." },
  { id: "chrono", name: "Chrono", desc: "40 secondes pour donner les indices, pas une de plus." }
];
const CHRONO = 40;
const TW = id => SB.u.byTwist(TWISTS, id);
function rollTwist(on, last){ const t = on ? SB.u.twist(TWISTS, { rate: .38, last }) : null; return t ? t.id : ""; }
function rollNote(tw){ return tw === "extreme" ? pick([1, 2, 9, 10]) : tw === "milieu" ? 4 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 10); }
function rmax(tw){ return tw === "double" ? 6 : 3; }
function points(n, g, tw){
  const d = Math.abs(n - g);
  if(tw === "double") return d === 0 ? 6 : 0;
  return d === 0 ? 3 : d === 1 ? 2 : d === 2 ? 1 : d === 3 && tw === "large" ? 1 : 0;
}
// Note inversée : on échange les deux bouts de l'échelle.
function view(c, tw){ c = A(c); return tw === "inv" ? [c[0], c[2], c[1]] : c; }
const VERDICTS = { 6: ["Jackpot !", "Double ou rien… et c'est double."], 3: ["Pile !", "Vous êtes sur la même longueur d'onde."], 2: ["Presque !", "À un point près. Très belle lecture."], 1: ["Pas loin", "Pas pile, mais ça compte quand même."], 0: ["Raté", "Les indices n'ont pas parlé à tout le monde."] };
function mention(pct){
  if(pct >= .9) return ["Félicitations du jury", "Vous partagez visiblement un seul cerveau."];
  if(pct >= .7) return ["Très bien", "Vous vous comprenez à demi-mot. Belle équipe."];
  if(pct >= .5) return ["Assez bien", "Des éclairs de génie et quelques malentendus."];
  if(pct >= .3) return ["Peut mieux faire", "Avez-vous déjà discuté ensemble ?"];
  return ["Bavardages", "Vous ne parlez pas encore la même langue. Revanche ?"];
}
// Trophées de fin de partie, tirés de l'historique. Le titre change d'une partie à l'autre.
function vary(list, seed){ return list[Math.abs(seed) % list.length]; }
function awards(hist){
  const h = A(hist).map(A), out = [], seed = h.reduce((a, x) => a + (+x[2] || 0) * 7 + (+x[3] || 0), 0);
  const gp = {}, gn = {};
  h.forEach(x => { gp[x[5]] = (gp[x[5]] || 0) + (+x[4] || 0); gn[x[5]] = (gn[x[5]] || 0) + 1; });
  const gk = Object.keys(gp).sort((a, b) => gp[b] - gp[a] || gn[a] - gn[b]);
  if(gk.length && gp[gk[0]] > 0) out.push([vary(["Lecture d'esprit", "Télépathe officiel", "Radar humain", "Antenne parabolique"], seed), gk[0], SB.u.plural(gp[gk[0]], "point") + " en devinant"]);
  const miss = h.filter(x => +x[3] > 0).sort((a, b) => Math.abs(b[2] - b[3]) - Math.abs(a[2] - a[3]))[0];
  if(miss && Math.abs(miss[2] - miss[3]) >= 3) out.push([vary(["Boussole cassée", "Complètement à l'ouest", "Lecture très créative", "Antenne débranchée"], seed + 1), miss[5], "a dit " + miss[3] + " pour un " + miss[2]]);
  const cp = {}, cn = {};
  h.forEach(x => A(x[7]).forEach(n => { cp[n] = (cp[n] || 0) + (+x[4] || 0); cn[n] = (cn[n] || 0) + 1; }));
  const ck = Object.keys(cp).filter(n => cn[n] >= 2).map(n => [n, cp[n] / cn[n]]).sort((a, b) => b[1] - a[1]);
  if(ck.length > 1 && ck[0][1] > ck[ck.length - 1][1]) out.push([vary(["Indice en or", "Boussole du groupe", "Traducteur officiel", "Phare dans la nuit"], seed + 2), ck[0][0], String(Math.round(ck[0][1] * 10) / 10).replace(".", ",") + " pt par indice en moyenne"]);
  return out;
}
function awardsHTML(a){ return a.length ? '<div class="field"><span class="eyebrow">Trophées</span><ul class="list">' + a.map(x => '<li><span class="t" style="font-size:19px">' + esc(x[0]) + '</span><span class="by">' + esc(x[1]) + " · " + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : ""; }
const TW_TOGGLE = on => '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + on + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">Une manche sur trois environ, une règle change</span></span></button></div>';
const CSS = '<style>.n10-grade{position:relative; align-self:center; width:220px; height:150px; max-width:100%; display:grid; place-items:center; color:var(--acc)}' +
  '.n10-grade svg{position:absolute; inset:0; width:100%; height:100%; overflow:visible}' +
  '.n10-grade path{fill:none; stroke:var(--acc); stroke-width:4; stroke-linecap:round; stroke-dasharray:640; animation:n10draw .7s ease-out}' +
  '.n10-grade .num{font-family:var(--f-hand); font-weight:700; font-size:104px; line-height:1}.n10-grade .num small{font-size:40px; font-weight:500}' +
  '@keyframes n10draw{from{stroke-dashoffset:640}} @media (prefers-reduced-motion:reduce){.n10-grade path{animation:none}}' +
  '.n10-ruler{display:grid; grid-template-columns:repeat(10,1fr); gap:3px}.n10-ruler div{height:50px; border-radius:8px; background:var(--soft); display:grid; place-items:center; font-family:var(--f-hand); font-size:24px; color:var(--muted)}' +
  '.n10-ruler .is-note{background:var(--acc); color:var(--card); font-weight:700}.n10-ruler .is-guess{outline:2.5px solid var(--ink); outline-offset:-2.5px; color:var(--ink); font-weight:700}' +
  '.n10-legend{display:flex; gap:16px; font-size:13px; color:var(--muted); flex-wrap:wrap}.n10-legend i{display:inline-block; width:12px; height:12px; border-radius:3px; vertical-align:-1px; margin-right:6px}' +
  '.n10-legend .ln{background:var(--acc)}.n10-legend .lg{outline:2px solid var(--ink); outline-offset:-2px}</style>';
const GRADE = '<svg viewBox="0 0 220 150" aria-hidden="true"><path d="M48 34 C 92 6, 190 12, 203 62 C 215 112, 120 142, 58 128 C 10 117, 6 70, 36 44 C 52 30, 80 22, 104 20"/></svg>';
function catCard(c, eyebrow, extra){
  return '<div class="card"><span class="eyebrow">' + esc(eyebrow || "Catégorie") + '</span><div class="big">' + esc(c[0]) + '</div><div class="scale"><span>1 · ' + esc(c[1]) + '</span><span>10 · ' + esc(c[2]) + "</span></div>" + (extra || "") + "</div>";
}
function gradeHTML(note){ return '<div class="n10-grade">' + GRADE + '<div class="num">' + note + "<small>/10</small></div></div>"; }
function padHTML(){ let h = '<div class="pad" data-pad>'; for(let n = 1; n <= 10; n++) h += '<button type="button" data-n="' + n + '" aria-label="Note ' + n + '">' + n + "</button>"; return h + "</div>"; }
function rulerHTML(note, guess){ let h = '<div class="n10-ruler">'; for(let n = 1; n <= 10; n++) h += '<div class="' + (n === note ? "is-note " : "") + (n === guess ? "is-guess" : "") + '">' + n + "</div>"; return h + "</div>"; }
function legendHTML(name){ return '<div class="n10-legend"><span><i class="ln"></i>Note secrète</span><span><i class="lg"></i>Proposition de ' + esc(name) + "</span></div>"; }
function histTable(rows){
  return '<div class="tablewrap"><table><thead><tr><th>Manche</th><th>Devineur</th><th style="text-align:center">Note</th><th style="text-align:center">Dit</th><th style="text-align:center">Pts</th></tr></thead><tbody>' +
    rows.map(h => '<tr><td>' + esc(h[0]) + '<div class="sm">' + esc(h[1]) + (TW(h[6]) ? " · " + esc(TW(h[6]).name) : "") + "</div></td><td>" + esc(h[5]) + '</td><td style="text-align:center" class="hand"><b>' + esc(h[2]) + '</b></td><td style="text-align:center" class="hand">' + esc(h[3] || "—") + '</td><td style="text-align:center">+' + esc(h[4]) + "</td></tr>").join("") + "</tbody></table></div>";
}
function reportHTML(score, max){
  const [m, a] = mention(score / max);
  return '<span class="eyebrow">Bulletin de complicité</span><div class="report"><span class="n">' + score + '</span><span class="o">/' + max + '</span></div><b>Mention : ' + esc(m) + '</b><p class="appre">« ' + esc(a) + " »</p>";
}

/* ---------- Éditeur de catégories perso (page annexe) ---------- */
function b64e(str){ const b = new TextEncoder().encode(str); let s = ""; b.forEach(x => { s += String.fromCharCode(x); }); return btoa(s); }
function b64d(t){ return new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0))); }
function openEditor(onClose){
  SB.page("Mes catégories", root => {
    root.innerHTML = '<p style="font-size:15px">Ajoute tes catégories. Elles restent sur ton téléphone et, en réseau, elles sont proposées à tout le salon dans le paquet « Catégories perso ».</p>' +
      '<div class="field"><label class="eyebrow" for="n10e-name">Catégorie</label><input class="txt" id="n10e-name" maxlength="90" autocomplete="off" placeholder="Ex. Un prof du lycée"></div>' +
      '<div class="row"><div class="field" style="flex:1"><label class="eyebrow" for="n10e-lo">La note 1, c\'est…</label><input class="txt" id="n10e-lo" maxlength="24" autocomplete="off" placeholder="Le pire"></div>' +
      '<div class="field" style="flex:1"><label class="eyebrow" for="n10e-hi">La note 10, c\'est…</label><input class="txt" id="n10e-hi" maxlength="24" autocomplete="off" placeholder="Le meilleur"></div></div>' +
      '<button class="btn" id="n10e-add" type="button">Ajouter la catégorie</button><p class="err" id="n10e-err" hidden></p><ul class="mine" id="n10e-list"></ul>' +
      '<div class="field"><span class="eyebrow">Transférer mes catégories</span><button class="btn ghost" id="n10e-exp" type="button">Exporter en code</button>' +
      '<label class="eyebrow" for="n10e-imp">Importer un code reçu</label><div class="row"><input class="txt" id="n10e-imp" autocomplete="off" placeholder="Colle un code NOTE10:…"><button class="btn ghost" id="n10e-impb" type="button" style="flex:none">Importer</button></div><p class="sm" id="n10e-msg" hidden></p></div>';
    const $ = s => root.querySelector(s);
    const msg = t => { const m = $("#n10e-msg"); m.textContent = t; m.hidden = !t; };
    function list(){
      const all = myCustom(), ul = $("#n10e-list");
      ul.innerHTML = all.length ? "" : '<li><span class="tx sm">Aucune catégorie pour l\'instant.</span></li>';
      all.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="tx"><b></b><div class="sm"></div></span><button class="x" type="button">×</button>';
        li.querySelector("b").textContent = c[0]; li.querySelector(".sm").textContent = "1 · " + c[1] + "   ·   10 · " + c[2];
        const x = li.querySelector("button"); x.setAttribute("aria-label", "Supprimer " + c[0]);
        x.addEventListener("click", () => { const a = myCustom(); a.splice(i, 1); persist({ n10custom: a }); list(); SB.refreshExtras(); });
        ul.append(li);
      });
    }
    function add(){
      const n = clean($("#n10e-name").value, 90), err = $("#n10e-err");
      if(!n){ err.textContent = "Donne un nom à ta catégorie, par exemple « Un prof du lycée »."; err.hidden = false; return; }
      const all = myCustom();
      if(all.length >= 100){ err.textContent = "Tu as atteint 100 catégories. Supprimes-en une pour en ajouter."; err.hidden = false; return; }
      err.hidden = true;
      all.push([n, clean($("#n10e-lo").value, 24) || "Le pire", clean($("#n10e-hi").value, 24) || "Le meilleur"]);
      persist({ n10custom: all });
      $("#n10e-name").value = ""; $("#n10e-lo").value = ""; $("#n10e-hi").value = "";
      list(); SB.refreshExtras(); $("#n10e-name").focus();
    }
    $("#n10e-add").addEventListener("click", add);
    $("#n10e-name").addEventListener("keydown", e => { if(e.key === "Enter") add(); });
    $("#n10e-exp").addEventListener("click", () => {
      const all = myCustom(); if(!all.length){ msg("Crée au moins une catégorie avant d'exporter."); return; }
      const code = "NOTE10:" + b64e(JSON.stringify(all));
      SB.u.shareText(code, "", $("#n10e-imp"), m => msg(m === "Copié" ? "Code copié. Colle-le dans un message pour tes potes." : "Code partagé."));
    });
    $("#n10e-impb").addEventListener("click", () => {
      const raw = $("#n10e-imp").value.trim(); let got = null;
      try{ if(!raw.startsWith("NOTE10:")) throw 0; got = JSON.parse(b64d(raw.slice(7))); }catch(e){ got = null; }
      if(!Array.isArray(got)){ msg("Ce code n'est pas valide. Il doit commencer par NOTE10:"); return; }
      const all = myCustom(), names = new Set(all.map(c => c[0].toLowerCase())); let n = 0;
      got.forEach(c => { const x = norm(c); if(!x || all.length >= 100 || names.has(x[0].toLowerCase())) return; names.add(x[0].toLowerCase()); all.push(x); n++; });
      persist({ n10custom: all }); $("#n10e-imp").value = ""; list(); SB.refreshExtras();
      msg(n ? SB.u.plural(n, "catégorie ajoutée", "catégories ajoutées") + "." : "Rien de nouveau : ces catégories sont déjà là.");
    });
    list();
  }, onClose);
}

/* ---------- Partie en réseau ---------- */
function givers(ctx){ return ctx.ids.filter(id => id !== ctx.s.guesser && ctx.here(id)); }
function clueOf(ctx, id){ const i = ctx.input(id); return i && typeof i.t === "string" ? clean(i.t, 60) : ""; }
function drawCat(ctx){
  let deck = A(ctx.priv().deck).map(A).filter(c => c.length === 3);
  if(!deck.length) deck = SB.u.fresh("note10:cats", buildPool(ctx.opts.packs, ctx.peers));
  const c = deck.pop() || CATS[0].slice();
  ctx.setPriv({ deck }); SB.u.saw("note10:cats", [c]);
  return c;
}
function nextRound(ctx, reroll){
  const s = ctx.s;
  if(!reroll && s.round >= s.rounds){ ctx.set({ phase: "end" }); return; }
  let gi = s.gi;
  if(!reroll){
    gi = (s.gi + 1) % ctx.players.length;
    for(let t = 0; t < ctx.players.length && !ctx.here(ctx.players[gi].id); t++) gi = (gi + 1) % ctx.players.length;
  }
  const tw = reroll ? (s.tw || "") : rollTwist(ctx.opts.twists !== false, s.tw);
  ctx.set({ phase: "clues", round: reroll ? s.round : s.round + 1, rr: reroll ? s.rr - 1 : s.rr, gi, guesser: ctx.players[gi].id,
    c: drawCat(ctx), tw, note: rollNote(tw), dl: tw === "chrono" ? ctx.now() + CHRONO * 1000 : 0, guess: 0, pts: 0, k: ctx.rid() });
}
function histRow(ctx, guess, pts){ const s = ctx.s; return [s.round, A(s.c)[0], s.note, guess, pts, ctx.name(s.guesser), s.tw || "", ctx.ids.filter(id => id !== s.guesser && clueOf(ctx, id)).map(ctx.name)]; }
let pickN = 0, pickK = "";

SB.register({
  id: "note10", name: "Note sur 10", glyph: "7/10", pitch: "Fais deviner une note secrète sur 10 avec des exemples.", hot: true, ticks: true,
  accent: { light: "#ff7b5c", dark: "#ff7b5c" },
  tag: "Une catégorie, une note secrète. Faites-la deviner avec des exemples.",
  min: 2, max: 12,
  rules: [
    "À chaque manche, un joueur devine. Les autres voient une catégorie et une note secrète de 1 à 10.",
    "Chacun écrit un exemple de la catégorie qui vaut cette note pour lui. Pas de chiffres.",
    "Le devineur lit les indices et propose une note.",
    "Pile : 3 points. À 1 près : 2. À 2 près : 1. Le score est collectif.",
    "Coups de théâtre : une manche sur trois environ, une règle change (note inversée, un seul mot, double ou rien, chrono…).",
    "Les catégories déjà jouées sur ce téléphone reviennent en dernier."
  ],
  presence: () => myCustom().slice(0, 50),
  options: [
    { id: "rounds", label: "Manches", type: "seg", def: 6, values: [{ v: 4, label: "4" }, { v: 6, label: "6" }, { v: 10, label: "10" }] },
    { id: "packs", label: "Catégories", type: "multi", def: ["classique"],
      values: ctx => PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.v === "perso" ? sharedCustom(ctx.peers).length : p.cats.length })) },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "Une manche sur trois environ, une règle change", def: true },
    { id: "edit", type: "button", label: "Créer mes propres catégories", onClick: () => openEditor() }
  ],
  start(ctx, o){
    const pool = buildPool(o.packs, ctx.peers);
    if(!pool.length) throw new Error("Choisis au moins un paquet de catégories.");
    const deck = SB.u.fresh("note10:cats", pool), c = deck.pop();
    ctx.setPriv({ deck }); SB.u.saw("note10:cats", [c]);
    const gi = Math.floor(Math.random() * ctx.players.length);
    return { phase: "clues", round: 1, rounds: o.rounds || 6, gi, guesser: ctx.players[gi].id, c, tw: "", dl: 0, note: rollNote(""), rr: 2, score: 0, max: 0, guess: 0, pts: 0, hist: [] };
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase === "clues"){
      const gv = givers(ctx);
      if((gv.length && gv.every(id => clueOf(ctx, id))) || (s.dl && ctx.now() >= s.dl)) ctx.set({ phase: "guess" });
    } else if(s.phase === "guess"){
      const i = ctx.input(s.guesser);
      if(i && Number.isInteger(i.n) && i.n >= 1 && i.n <= 10){
        const pts = points(s.note, i.n, s.tw);
        ctx.set({ phase: "result", guess: i.n, pts, score: s.score + pts, max: (+s.max || 0) + rmax(s.tw), hist: A(s.hist).concat([histRow(ctx, i.n, pts)]) });
      }
    }
  },
  render(ctx, root){
    const s = ctx.s, c = view(s.c, s.tw), isG = s.guesser === ctx.me, gName = ctx.name(s.guesser);
    const label = '<span class="eyebrow">Manche ' + s.round + " / " + s.rounds + " · devineur : " + esc(gName) + "</span>" + SB.u.twistHTML(TW(s.tw));
    const hostBox = '<div class="dock" data-hostbox></div>';
    const timer = s.dl && s.phase === "clues" ? '<div class="timer" data-t></div>' : "";
    if(s.phase === "clues"){
      if(isG){
        screen(root, "cg" + s.k, CSS + label + timer + '<div class="pass"><span class="eyebrow">C\'est toi qui devines</span><div class="who">Patience…</div><p>Tes coéquipiers regardent la note secrète et écrivent leurs indices.</p></div><div class="field"><span class="eyebrow">Indices envoyés</span><div class="chips" data-chips></div></div>' + hostBox);
      } else {
        const one = s.tw === "mot";
        screen(root, "cc" + s.k, CSS + label + timer + catCard(c, "Catégorie", gradeHTML(s.note)) +
          '<p class="howto">Donne <b>' + (one ? "un seul mot" : "une réponse") + '</b> qui vaut cette note pour toi' + (one ? "" : " : un exemple, une phrase") + '. Sans chiffre.</p>' +
          '<div class="field" data-form><label class="eyebrow" for="n10-in">Ton indice</label><div class="row"><input class="txt" id="n10-in" maxlength="60" autocomplete="off" placeholder="' + (one ? "Un seul mot" : "Ta réponse, sans chiffre") + '"><button class="btn acc" type="button" data-send style="flex:none">Envoyer</button></div><p class="err" data-err hidden></p></div>' +
          '<div class="sent" data-sent hidden><span class="t" data-senttxt></span><button class="link" type="button" data-edit>Modifier</button></div>' +
          '<div class="field"><span class="eyebrow">Indices envoyés</span><div class="chips" data-chips></div></div>' + hostBox, r => {
          const inp = r.querySelector("#n10-in"), err = r.querySelector("[data-err]");
          const send = () => {
            const t = clean(inp.value, 60);
            if(!t){ err.textContent = "Écris un exemple avant d'envoyer."; err.hidden = false; return; }
            if(/[0-9]/.test(t)){ err.textContent = "Pas de chiffres dans l'indice, c'est trop facile."; err.hidden = false; return; }
            if(one && /\s/.test(t)){ err.textContent = "Coup de théâtre : un seul mot, sans espace."; err.hidden = false; return; }
            err.hidden = true; r.dataset.editing = ""; ctx.send({ t });
          };
          r.querySelector("[data-send]").addEventListener("click", send);
          inp.addEventListener("keydown", e => { if(e.key === "Enter") send(); });
          r.dataset.editing = "";
          r.querySelector("[data-edit]").addEventListener("click", () => {
            const m = ctx.mine(); inp.value = m && m.t ? m.t : ""; r.dataset.editing = "1";
            r.querySelector("[data-form]").hidden = false; r.querySelector("[data-sent]").hidden = true; inp.focus();
          });
        });
        const mine = clueOf(ctx, ctx.me), editing = root.dataset.editing === "1";
        root.querySelector("[data-form]").hidden = !!mine && !editing;
        root.querySelector("[data-sent]").hidden = !mine || editing;
        txt(root, "[data-senttxt]", mine);
      }
      if(s.dl){ const left = Math.max(0, Math.ceil((s.dl - ctx.now()) / 1000)), t = txt(root, "[data-t]", left); if(t) t.classList.toggle("low", left <= 10); }
      const ch = root.querySelector("[data-chips]");
      const chips = ctx.ids.filter(id => id !== s.guesser).map(id => { const ok = !!clueOf(ctx, id); return '<span class="chip' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + esc(ctx.name(id)) + (ctx.here(id) ? "" : " (parti)") + "</span>"; }).join("");
      if(ch.innerHTML !== chips) ch.innerHTML = chips;
      const hb = root.querySelector("[data-hostbox]");
      if(ctx.isHost){
        const hk = s.k + "|" + s.rr + "|" + givers(ctx).some(id => clueOf(ctx, id));
        if(hb.dataset.k !== hk){
          hb.dataset.k = hk;
          const any = givers(ctx).some(id => clueOf(ctx, id));
          hb.innerHTML = '<button class="btn ghost" type="button" data-force' + (any ? "" : " disabled") + '>Montrer les indices au devineur</button>' +
            '<button class="link" type="button" data-reroll style="align-self:center"' + (s.rr > 0 ? "" : " disabled") + ">" + (s.rr > 0 ? "Changer de catégorie (" + s.rr + " restant" + (s.rr > 1 ? "s" : "") + ")" : "Plus de changement de catégorie") + "</button>";
          hb.querySelector("[data-force]").addEventListener("click", () => ctx.act(c2 => { if(c2.s.phase === "clues") c2.set({ phase: "guess" }); }));
          hb.querySelector("[data-reroll]").addEventListener("click", () => ctx.act(c2 => { if(c2.s.rr > 0 && c2.s.phase === "clues") nextRound(c2, true); }));
        }
      } else if(hb.innerHTML) hb.innerHTML = "";
    } else if(s.phase === "guess"){
      const blind = isG && s.tw === "aveugle";
      screen(root, "gu" + s.k, CSS + label + (blind ? '<div class="card"><span class="eyebrow">Catégorie</span><div class="big">Cachée !</div><div class="scale"><span>1</span><span>10</span></div></div>' : catCard(c)) + '<div class="field"><span class="eyebrow">Les indices</span><ul class="list" data-clues></ul></div>' +
        (isG ? '<div class="field"><span class="eyebrow">Quelle note ont-ils en tête ?</span>' + padHTML() + '</div>' + SB.u.dock('<button class="btn acc" type="button" data-val disabled>Valider ma note</button>') : SB.u.dock('<p class="wait">' + esc(gName) + " réfléchit…</p>")) +
        '<button class="link warn" type="button" data-skip hidden style="align-self:center">Le devineur est parti, passer la manche</button>', r => {
        if(pickK !== s.k){ pickK = s.k; pickN = 0; }
        r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => {
          pickN = +b.dataset.n; r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === pickN)); r.querySelector("[data-val]").disabled = false;
        }));
        const v = r.querySelector("[data-val]");
        if(v) v.addEventListener("click", () => { if(!pickN) return; ctx.send({ n: pickN }); v.disabled = true; v.textContent = "Note envoyée"; });
        r.querySelector("[data-skip]").addEventListener("click", () => ctx.act(c2 => {
          c2.set({ hist: A(c2.s.hist).concat([histRow(c2, 0, 0)]), max: (+c2.s.max || 0) + rmax(c2.s.tw) }); nextRound(c2);
        }));
      });
      const items = ctx.ids.filter(id => id !== s.guesser).map(id => ({ id, t: clueOf(ctx, id) })).filter(x => x.t);
      const html = items.length ? items.map(x => '<li><span class="t">' + esc(x.t) + '</span><span class="by">' + esc(ctx.name(x.id)) + "</span></li>").join("") : '<li><span class="by">Aucun indice pour cette manche.</span></li>';
      const ul = root.querySelector("[data-clues]"); if(ul.innerHTML !== html) ul.innerHTML = html;
      root.querySelector("[data-skip]").hidden = !(ctx.isHost && !ctx.here(s.guesser));
    } else if(s.phase === "result"){
      const v = VERDICTS[s.pts] || VERDICTS[0];
      screen(root, "re" + s.k + ctx.isHost, CSS + label + '<div class="verdict">' + esc(v[0]) + " +" + s.pts + '</div><p style="font-size:17px">La note était ' + s.note + ", " + esc(gName) + " a dit " + s.guess + ". " + esc(v[1]) + "</p>" +
        '<div class="card"><div class="big" style="font-size:22px">' + esc(c[0]) + "</div>" + rulerHTML(s.note, s.guess) + legendHTML(gName) + "</div>" +
        '<div class="tally"><span>Score de l\'équipe</span><b>' + s.score + " / " + (+s.max || s.round * 3) + "</b></div>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Voir le bulletin" : "Manche suivante") + "</button>" : '<p class="wait">L\'hôte lance la suite…</p>'), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c2 => { if(c2.s.phase === "result") nextRound(c2); }));
      });
    } else if(s.phase === "end"){
      const max = +s.max || s.rounds * 3;
      screen(root, "end" + ctx.isHost, CSS + reportHTML(s.score, max) + awardsHTML(awards(s.hist)) + histTable(A(s.hist).map(A)) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c2 => {
          const mx = +c2.s.max || c2.s.rounds * 3, pct = c2.s.score / mx;
          c2.end({ title: "Score de l'équipe : " + c2.s.score + " / " + mx, lines: ["Mention : " + mention(pct)[0]].concat(awards(c2.s.hist).map(a => a[0] + " : " + a[1])), win: pct >= .5 ? c2.ids : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 2, max: 12 },
    start(root, api){
      const names = api.names;
      const L = { phase: "setup", rounds: [4, 6, 10].indexOf(store().n10rounds) >= 0 ? store().n10rounds : 6, packs: A(store().n10packs).length ? A(store().n10packs) : ["classique"], twOn: store().n10tw !== false,
        round: 0, gi: 0, deck: [], c: null, note: 0, guess: 0, rr: 2, score: 0, max: 0, hist: [], tw: "", dl: 0 };
      const draw = () => { if(!L.deck.length) L.deck = SB.u.fresh("note10:cats", buildPool(L.packs, [])); L.c = L.deck.pop() || CATS[0].slice(); SB.u.saw("note10:cats", [L.c]); L.note = rollNote(L.tw); };
      const go = () => {
        const g = names[L.gi], c = view(L.c || ["", "", ""], L.tw);
        const lab = '<span class="eyebrow">Manche ' + L.round + " / " + L.rounds + "</span>" + SB.u.twistHTML(TW(L.tw));
        if(L.phase === "setup"){
          screen(root, "setup" + JSON.stringify([L.rounds, L.packs, L.twOn]), CSS + '<div class="field"><span class="eyebrow">Manches</span><div class="seg">' + [4, 6, 10].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (n === L.rounds) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Catégories</span><div class="packs">' + PACKS.map(p => { const n = p.v === "perso" ? myCustom().length : p.cats.length; return '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (L.packs.indexOf(p.v) >= 0 && n > 0) + '"' + (n ? "" : " disabled") + '><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.v === "perso" ? "Celles que tu as créées" : p.desc) + '</span></span><span class="ct">' + n + "</span></button>"; }).join("") + "</div>" +
            '<button class="link" type="button" data-edit style="align-self:flex-start">Créer mes propres catégories</button></div>' +
            '<div class="field"><span class="eyebrow">Variante</span>' + TW_TOGGLE(L.twOn) + "</div>" +
            '<p class="howto">Les indices se disent à voix haute, et on se passe le téléphone entre le groupe et le devineur.</p><div class="dock"><p class="err" data-err hidden></p><button class="btn acc" type="button" data-go>Commencer la partie</button></div>', r => {
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { L.rounds = +b.dataset.r; persist({ n10rounds: L.rounds }); go(); }));
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = L.packs.indexOf(b.dataset.p); if(i >= 0) L.packs.splice(i, 1); else L.packs.push(b.dataset.p); persist({ n10packs: L.packs }); go(); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { L.twOn = !L.twOn; persist({ n10tw: L.twOn }); go(); });
            r.querySelector("[data-edit]").addEventListener("click", () => openEditor(() => { root.dataset.key = ""; go(); }));
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!buildPool(L.packs, []).length){ const e = r.querySelector("[data-err]"); e.textContent = "Choisis au moins un paquet de catégories."; e.hidden = false; return; }
              L.round = 1; L.score = 0; L.max = 0; L.hist = []; L.rr = 2; L.tw = ""; L.gi = Math.floor(Math.random() * names.length); L.deck = SB.u.fresh("note10:cats", buildPool(L.packs, [])); draw(); L.phase = "team"; go();
            });
          });
        } else if(L.phase === "team"){
          screen(root, "team" + L.round, lab + '<div class="pass"><span class="eyebrow">Devineur de la manche</span><div class="who">' + esc(g) + "</div><p><b>" + esc(g) + "</b> détourne les yeux. Tous les autres se regroupent autour du téléphone.</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>On est prêts, montrer la note</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.dl = L.tw === "chrono" ? Date.now() + CHRONO * 1000 : 0; L.phase = "clue"; go(); });
          });
        } else if(L.phase === "clue"){
          screen(root, "clue" + L.round + c[0] + L.rr, CSS + lab + (L.dl ? '<div class="timer" data-t>' + CHRONO + "</div>" : "") + catCard(c, "Catégorie", gradeHTML(L.note)) + '<p class="howto">Chacun votre tour, donnez <b>' + (L.tw === "mot" ? "un seul mot" : "une réponse") + '</b> qui vaut cette note pour vous. Sans chiffre.</p>' +
            '<div class="dock"><button class="btn acc" type="button" data-n>Cacher la note et donner à ' + esc(g) + '</button><button class="link" type="button" data-rr style="align-self:center"' + (L.rr > 0 ? "" : " disabled") + ">" + (L.rr > 0 ? "Changer de catégorie (" + L.rr + " restant" + (L.rr > 1 ? "s" : "") + ")" : "Plus de changement de catégorie") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "pass"; go(); });
            r.querySelector("[data-rr]").addEventListener("click", () => { if(L.rr > 0){ L.rr--; draw(); if(L.dl) L.dl = Date.now() + CHRONO * 1000; go(); } });
          });
        } else if(L.phase === "pass"){
          screen(root, "pass" + L.round, lab + '<div class="pass"><span class="eyebrow">Donnez le téléphone à</span><div class="who">' + esc(g) + "</div><p>La note est cachée. Écoute bien les indices, puis devine.</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>C'est moi, je devine</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "guess"; L.guess = 0; go(); });
          });
        } else if(L.phase === "guess"){
          screen(root, "guess" + L.round, lab + (L.tw === "aveugle" ? '<div class="card"><span class="eyebrow">Catégorie</span><div class="big">Cachée !</div><div class="scale"><span>1</span><span>10</span></div></div>' : catCard(c)) + '<span class="eyebrow">Quelle note ont-ils en tête ?</span>' + padHTML() + '<div class="dock"><button class="btn acc" type="button" data-v disabled>Valider ma note</button></div>', r => {
            r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { L.guess = +b.dataset.n; r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === L.guess)); r.querySelector("[data-v]").disabled = false; }));
            r.querySelector("[data-v]").addEventListener("click", () => {
              if(!L.guess) return; const pts = points(L.note, L.guess, L.tw); L.score += pts; L.max += rmax(L.tw); L.hist.push([L.round, c[0], L.note, L.guess, pts, g, L.tw, []]); L.phase = "result"; go();
            });
          });
        } else if(L.phase === "result"){
          const h = L.hist[L.hist.length - 1], v = VERDICTS[h[4]] || VERDICTS[0];
          screen(root, "res" + L.round, CSS + lab + '<div class="verdict">' + esc(v[0]) + " +" + h[4] + '</div><p style="font-size:17px">La note était ' + h[2] + ", " + esc(g) + " a dit " + h[3] + ". " + esc(v[1]) + "</p>" +
            '<div class="card"><div class="big" style="font-size:22px">' + esc(c[0]) + "</div>" + rulerHTML(h[2], h[3]) + legendHTML(g) + '</div><div class="tally"><span>Score de l\'équipe</span><b>' + L.score + " / " + L.max + '</b></div><div class="dock"><button class="btn acc" type="button" data-n>' + (L.round >= L.rounds ? "Voir le bulletin" : "Manche suivante") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(L.round >= L.rounds){ L.phase = "end"; if(L.score / Math.max(1, L.max) >= .5) api.win(names); go(); return; }
              L.round++; L.gi = (L.gi + 1) % names.length; L.rr = Math.max(L.rr, 0); L.tw = rollTwist(L.twOn, L.tw); draw(); L.phase = "team"; go();
            });
          });
        } else if(L.phase === "end"){
          screen(root, "end", CSS + reportHTML(L.score, Math.max(1, L.max)) + awardsHTML(awards(L.hist)) + histTable(L.hist) + '<div class="dock"><button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button></div>', r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      api.onTick(() => {
        if(L.phase !== "clue" || !L.dl) return;
        const left = Math.max(0, Math.ceil((L.dl - Date.now()) / 1000)), t = txt(root, "[data-t]", left);
        if(t) t.classList.toggle("low", left <= 10);
        if(left <= 0){ SB.u.buzz([80, 60, 80]); L.phase = "pass"; go(); }
      });
      go();
    }
  }
});
})();
