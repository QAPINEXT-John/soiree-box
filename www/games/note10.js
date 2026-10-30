/* Note sur 10 — faire deviner une note secrète de 1 à 10 avec des exemples. */
(function(){
"use strict";
const { esc, clean, A, store, persist, screen, txt, pick, tr } = SB.u;

const CATS = [
  ["Un film","Navet","Chef-d'œuvre"],["Un plat","Immangeable","Le repas de ma vie"],
  ["Une destination de vacances","Jamais de la vie","Rêve absolu"],["Un superpouvoir","Inutile","Imbattable"],
  ["Un animal","Inoffensif","Terrifiant"],["Un métier","Ennui total","Passionnant"],
  ["Une chanson pour un mariage","Piste vide","Tout le monde danse"],["Une série","Abandonnée à l'épisode 1","Vue trois fois"],
  ["Un jeu vidéo","Désinstallé","Des centaines d'heures"],["Un prénom pour un enfant","Cruel","Magnifique"],
  ["Un cadeau d'anniversaire","Sourire forcé","Je pleure de joie"],["Une excuse pour être en retard","Personne n'y croit","Imparable"],
  ["Une odeur","Insupportable","Divine"],["Un endroit pour un premier rendez-vous","Catastrophe","Parfait"],
  ["Un objet à emporter sur une île déserte","Inutile","Vital"],["Une boisson","Imbuvable","Délicieuse"],
  ["Un sport","Soporifique","Spectaculaire"],["Une tâche ménagère","Presque agréable","Cauchemar"],
  ["Une phobie","Compréhensible","Absurde"],["Une invention","Gadget","A changé le monde"],
  ["Un personnage de fiction","Insupportable","Légende"],["Un dessert","Je passe mon tour","J'en reprends trois fois"],
  ["Une ville française","Je n'y vivrais pas","Je déménage demain"],["Un moyen de transport","Pénible","Un pur bonheur"],
  ["Une application sur ton téléphone","Supprimée","Je ne peux pas m'en passer"],["Une émission de télé","La honte","Culte"],
  ["Une matière à l'école","Torture","Ma préférée"],["Un truc qui fait peur la nuit","Même pas peur","Je ne dors plus"],
  ["Une star","Inconnue au bataillon","Tout le monde la connaît"],["Une saison ou une météo","Déprimante","Idéale"],
  ["Une habitude","Saine","Toxique"],["Un aliment au petit-déjeuner","Bizarre","Indispensable"],
  ["Un bruit","Apaisant","Insupportable"],["Une couleur pour repeindre ta chambre","Jamais","Coup de cœur"],
  ["Un dessin animé","Raté","Culte"],["Un mot de la langue française","Moche","Magnifique"],
  ["Une activité du dimanche","Corvée","Bonheur"],["Une situation gênante","Petit malaise","Je veux disparaître"],
  ["Un ustensile de cuisine","Inutile","Indispensable"],["Une marque","Ringarde","Iconique"],
  ["Un fromage","Fade","Puissant"],["Un monstre ou une créature","Mignon","Cauchemardesque"],
  ["Un talent caché","Banal","Impressionnant"],["Une boisson énergisante ou un soda","Écœurant","Parfait"],
  ["Une époque historique","Pour rien au monde","J'y vais demain"],["Un lieu pour faire la fête","Ambiance morte","Soirée mythique"],
  ["Une épice ou un condiment","Doux","Ça brûle"],["Une tenue pour un entretien d'embauche","Recalé(e) direct","Embauché(e)"],
  ["Un mensonge","Innocent","Impardonnable"],["Un animal de compagnie","Facile à vivre","Ingérable"],
  ["Un instrument de musique","Insupportable","Envoûtant"],["Un film d'horreur","Rigolo","Traumatisant"],
  ["Un nom de groupe de musique","Ridicule","Génial"],["Une façon de perdre dans un jeu vidéo","Banale","Humiliante"],
  ["Une façon d'être réveillé(e) le matin","En douceur","Brutale"],["Un sujet de conversation à table","Sans risque","Dispute garantie"],
  ["Un gâteau d'anniversaire","Raté","Œuvre d'art"],["Un plat de cantine","Plateau intact","On en redemande"],
  ["Un look","Classique","Extravagant"],["Un endroit pour se cacher","Trouvé en 2 s","Introuvable"],
  ["Un bruit de voisin", "Supportable", "Je déménage"],["Un petit plaisir de la vie", "Sympa", "Le paradis"],["Une manie agaçante", "Mignonne", "Rupture immédiate"],["Un cadeau de collègue", "Oubliable", "Je le garde à vie"],["Un plat surgelé", "Triste", "Meilleur que le resto"],["Une raison d'annuler une soirée", "Valable", "Honteuse"],["Un endroit pour faire la sieste", "Inconfortable", "Comme sur un nuage"],["Un jeu de cour de récré", "Ennuyeux", "Légendaire"],["Une compétence à apprendre", "Inutile", "Ça change la vie"],["Une boisson chaude", "Imbuvable", "Réconfort absolu"],["Un fruit", "Décevant", "Parfait"],["Un légume", "Laissé dans l'assiette", "J'en reprends"],["Un souvenir d'enfance", "Flou", "Inoubliable"],["Une fête du calendrier", "Corvée", "Vivement qu'elle arrive"],["Un objet perdu", "Tant pis", "Drame"],["Une activité sous la pluie", "Déprimante", "Géniale"],["Une sauce", "Fade", "Je la bois"],["Un trajet en voiture", "Interminable", "Road trip de rêve"],["Une coupe de cheveux", "Accident capillaire", "Iconique"],["Un bruit de la nature", "Inquiétant", "Apaisant"],["Une pièce de la maison", "Lugubre", "Mon refuge"],["Un émoji", "Inutile", "Je l'utilise tout le temps"],["Une façon de dire au revoir", "Glaciale", "Touchante"],["Un parfum de glace", "Bizarre", "Mon préféré"],["Un jour de la semaine", "Le pire jour", "Le meilleur jour"],["Un loisir créatif", "Ennuyeux", "Ma passion"],["Une qualité chez un ami", "Accessoire", "Essentielle"],["Un défaut chez un coloc", "Pardonnable", "Rédhibitoire"],["Un jeu de cartes", "Soporifique", "Addictif"],["Une pâtisserie", "Sèche", "Divine"],["Un endroit pour pique-niquer", "Sinistre", "Idyllique"],["Un souvenir de vacances à ramener", "Kitsch", "Précieux"],["Une tradition familiale", "Pénible", "Sacrée"],["Une odeur de cuisine", "Écœurante", "Irrésistible"]
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
  ["Un pseudo en ligne", "Gênant", "Légendaire"],["Un mot de passe", "Piraté en 2 s", "Coffre-fort"],["Un gadget high-tech", "Inutile", "Révolution"],["Une fin de jeu vidéo", "Décevante", "Larmes aux yeux"],["Un personnage secondaire", "Oubliable", "Mérite sa propre série"],["Un robot de film", "Tas de ferraille", "Iconique"],["Une planète de science-fiction", "Hostile", "J'y emménage"],["Une vidéo à regarder à 2 h du matin", "Je m'endors devant", "Impossible de décrocher"],["Un sortilège dans Harry Potter", "Inutile", "Redoutable"],["Un tutoriel en ligne", "Incompréhensible", "Il m'a sauvé la vie"],["Une notification", "Agaçante", "Excellente nouvelle"],["Un jeu sur téléphone", "Désinstallé", "Addiction totale"],["Un costume de cosplay", "Raté", "Bluffant"],
  ["Un Pokémon","Inutile","Premier choix, toujours"],["Un personnage de Star Wars","Agaçant","Légende"]
];
const ABSURDE = [
  ["Tu te réveilles avec un superpouvoir, mais il est nul. Lequel ?","Totalement inutile","Finalement pratique"],
  ["Le Père Noël s'est trompé de hotte. Qu'y a-t-il sous ton sapin ?","Catastrophe","Meilleur Noël de ma vie"],
  ["Un génie exauce ton vœu mais comprend tout de travers. Que se passe-t-il ?","Désastre","Coup de chance"],
  ["Tu dois survivre une semaine sur une île avec un seul objet de tes poches. Lequel ?","Mort(e) au jour 1","Roi (reine) de l'île"],
  ["Des extraterrestres veulent voir le meilleur de l'humanité. Tu leur montres quoi ?","Ils repartent vexés","Ils signent la paix"],
  ["Ta nouvelle appli révolutionnaire. Elle sert à quoi ?","Flop total","Licorne de la tech"],
  ["Ton animal se met à parler. Sa première phrase ?","Glaçante","Adorable"],
  ["Ton dernier repas avant la fin du monde","Triste","Parfait"],
  ["Tu restes coincé(e) six heures dans un ascenseur. Avec qui ?","Cauchemar","Meilleur moment de ma vie"],
  ["Le nouveau parfum de glace que personne n'a demandé","Immangeable","Je veux goûter"],
  ["Ta reconversion si l'informatique disparaît demain","Galère","Carrière de rêve"],
  ["Tu remontes cinq siècles en arrière avec ton téléphone. Tu fais quoi ?","Brûlé(e) pour sorcellerie","Empereur (impératrice) du monde"],
  ["Ton slogan de campagne pour devenir maire","Zéro voix","Élu(e) au premier tour"],
  ["Ton plat signature dans une émission de cuisine","Éliminé","Étoilé"],
  ["Le nom de ton groupe de rock de garage","Ridicule","Mythique"],
  ["Une nouvelle épreuve aux Jeux olympiques","Personne ne regarde","Audience record"],
  ["Tu es invisible, mais seulement quand personne ne te regarde. Ça te sert à quoi ?","À rien","Coup de génie"],
  ["Ton dernier message avant un aller simple pour Mars","Banal","Légendaire"],
  ["La mascotte des prochains Jeux olympiques","Ratée","Iconique"],
  ["Ce que tu ramènes d'une boutique de souvenirs en enfer","Pourri","Trop stylé"],
  ["Ton excuse quand la police te trouve en pyjama dans un zoo à 4 h du matin","Personne n'y croit","Ils s'excusent"],
  ["Le jouet star du prochain Noël","Flop","Rupture de stock"],
  ["Ce que fait le fantôme qui hante ton appart","Inoffensif","Je déménage"],
  ["Tu gagnes un an d'abonnement gratuit. À quoi ?","Inutile","Jackpot"],
  ["La première loi que tu fais voter une fois au pouvoir","Inutile","Révolution"],
  ["Ce que tu trouves dans la poche d'un manteau de friperie","Rien d'intéressant","Ça change ma vie"],
  ["Tu es le (la) méchant(e) d'un film. Ton plan diabolique ?","Pathétique","Terrifiant"],
  ["Ta stratégie de survie pendant une apocalypse zombie","Mort(e) dans la première scène","Dernier(ère) survivant(e)"],
  ["Ce que ta brosse à dents dirait de toi si elle parlait","Elle démissionne","Elle t'adore"],
  ["Un métier qui existera en 2100","Absurde","Indispensable"],
  ["Tu te fais cloner. Que fait ton clone en premier ?","Il me trahit","Il fait tout à ma place"],
  ["Ce que tu mets dans une capsule temporelle pour dans 50 ans","Inutile","Trésor historique"],
  ["Le titre de ton autobiographie","Personne ne l'achète","Best-seller"],
  ["L'objet du quotidien qui te sert d'arme contre un cambrioleur","Inefficace","Redoutable"],
  ["Tu deviens chef de ta résidence. Ta première décision ?","Émeute","Statue en ton honneur"],
  ["Ce que tu dis à un dinosaure ressuscité pour qu'il ne te mange pas","Il te mange","Il devient ton ami"],
  ["Le pire superpouvoir pour un premier rendez-vous","Ça passe","Rendez-vous gâché"],
  ["Ton menu de restaurant pour extraterrestres","Incident diplomatique","Ils veulent la recette"],
  ["Ce que garde un agent secret au fond de son sac","Banal","Arsenal complet"],
  ["Tu inventes une fête nationale. On y fait quoi ?","Personne ne vient","Meilleur jour de l'année"],
  ["Tu te réveilles dans le corps de ton chat. Ta première action ?", "Sieste", "Domination du foyer"],["Une loi bizarre votée demain matin", "Inoffensive", "Chaos national"],["Ta voix devient celle d'un commentateur sportif. Ça donne quoi au quotidien ?", "Agaçant", "Génial"],["Un musée consacré à ta vie. La pièce maîtresse ?", "Embarrassante", "Chef-d'œuvre"],["Tu peux parler à un seul type d'objet. Lequel ?", "Inutile", "Indispensable"],["Le sport de combat inventé par ta famille", "Inoffensif", "Interdit"],["La notice de montage de ta personnalité", "Limpide", "Incompréhensible"],["Ta chambre devient un escape game. L'énigme finale ?", "Évidente", "Personne n'en sort"],["Ce que les pigeons pensent vraiment des humains", "Ils nous aiment", "Ils préparent un coup"],["Le parc d'attractions de tes rêves. L'attraction phare ?", "Ennuyeuse", "Mythique"],["Tu remplaces la mascotte d'un club de sport. Ton costume ?", "Ridicule", "Culte"],["Une nouvelle couleur vient d'être découverte. Son nom ?", "Moche", "Sublime"],["Les nuages forment un message pour toi. Il dit quoi ?", "Banal", "Bouleversant"],["Le bruit de ton frigo la nuit, ça veut dire quoi ?", "Rien", "Il complote"],["Tu ouvres un restaurant avec un seul plat. Lequel ?", "Faillite", "Queue jusqu'au coin de la rue"],["Une téléréalité dont tu serais le héros (l'héroïne)", "Annulée", "Record d'audience"],["Ton super-héros a un point faible ridicule. Lequel ?", "Gênant", "Fatal"],["Le cri de guerre de ton équipe de pétanque", "Timide", "Terrifiant"],["Tu gagnes un objet magique dans un vide-grenier. Lequel ?", "Inutile", "Tout-puissant"],["La première phrase du manuel pour devenir adulte", "Rassurante", "Effrayante"],["Ta journée idéale si la gravité disparaissait", "Banale", "Grandiose"]
];
const HARD = [
  ["Ta mère lit ton dernier message envoyé. Qu'est-ce qu'il dit ?","Elle sourit","Elle appelle un prêtre"],
  ["Ce que tu cries en te réveillant chez un inconnu après une soirée","Zen","Panique totale"],
  ["La pire phrase pour commencer un discours de mariage","Maladroite","Divorce le jour même"],
  ["Ce que tu trouves en fouillant le téléphone de ton pote","Rien de grave","J'appelle un avocat"],
  ["Ton excuse pour avoir vomi sur le canapé de l'hôte","Crédible","Personne n'y croit"],
  ["Ce que tu dis à ton patron en arrivant bourré(e) au boulot","Discret","Viré(e) sur-le-champ"],
  ["Le pire nom pour un bar de nuit","Ça passe","Fermé par la préfecture"],
  ["Ce qu'on trouve dans ton sac le lendemain d'une soirée","Normal","Il faut appeler quelqu'un"],
  ["Ce que tu ferais pendant 24 h sans aucune conséquence","Sage","Interdit dans tous les pays"],
  ["Ce que la voyante t'annonce pour tes 40 ans","Rassurant","Cauchemar"],
  ["La pire tenue pour un enterrement","Maladroite","On t'escorte dehors"],
  ["Ce que tu fais quand tes potes sont partis et que t'es seul(e) chez toi","Normal","Personne ne doit savoir"],
  ["Ce qu'on trouve au fond du frigo d'un étudiant","Encore mangeable","Ça bouge"],
  ["Ce que ton ex raconte sur toi à ses potes","Gentil","Diffamation"],
  ["Un vocal de 4 minutes de ta tante. De quoi il parle ?","Banal","Drame familial"],
  ["Le pire cadeau pour ta belle-mère","Maladroit","Déshérité(e)"],
  ["Ce que tu dis au contrôleur quand t'as pas de ticket","Crédible","Garde à vue"],
  ["Le truc le plus honteux que t'as fait bourré(e)","Mignon","Banni(e) à vie"],
  ["Le pire tatouage à se faire sur le front","Ça passe","Vie gâchée"],
  ["Ce que ta grand-mère découvre sur ton Insta","Elle like","Elle te déshérite"],
  ["Ce que tu cries en marchant sur un Lego à 3 h du mat","Poli","Tout l'immeuble entend"],
  ["Le pire endroit pour une envie pressante","Pas grave","Fin de vie sociale"],
  ["Une rumeur à lancer sur le prof le plus strict","Gentille","Il quitte l'établissement"],
  ["Le mot que tu laisses sur le frigo au coloc qui vole tes courses","Passif-agressif","Déclaration de guerre"],
  ["Ce qu'on entend à travers le mur de la chambre d'hôtel","Rien de spécial","On appelle la réception"],
  ["La raison de ton retard, version donnée au patron","Crédible","Mytho de l'année"],
  ["Ton talent caché en soirée","Utile","Inquiétant"],
  ["Ce que tu ferais si t'étais invisible pendant une journée","Sage","Prison à vie"],
  ["Ce que tu dis quand on te surprend à pleurer devant une pub","Assumé","Mensonge énorme"],
  ["Ta réaction quand le wifi coupe en pleine partie classée","Zen","Violence"],
  ["La pire chose à crier dans une bibliothèque","Gênant","Évacuation du bâtiment"],
  ["Le souvenir de vacances le plus douteux pour tes potes","Pourri","Légendaire"],
  ["Le pire endroit pour se faire larguer","Ça passe","Traumatisme public"],
  ["Ce que tu reçois par la poste sans l'avoir commandé","Décevant","On appelle le déminage"],
  ["Ce que fait ton pote quand il a trop bu","Mignon","Il faut le surveiller"],
  ["Le pire prénom à donner à ton enfant","Original","Il (elle) te poursuivra en justice"],
  ["Ce que tu dis en croisant la personne qui t'a ghosté(e)","Poli","Scène publique"],
  ["Ce que tu écris dans le livre d'or d'un mariage après six verres","Touchant","Gros malaise"],
  ["Le pire sujet pour briser la glace au premier rendez-vous","Maladroit","Il ou elle s'enfuit"],
  ["Ce que tu fais en premier si tu gagnes au loto","Raisonnable","Complètement fou"],
  ["Ce que tu dis au taxi à 5 h du matin", "Poli", "Il te dépose au commissariat"],["Ton dernier achat en ligne à 3 h du matin", "Raisonnable", "Je n'assume pas"],["Le pire message à envoyer par erreur au groupe de la famille", "Anodin", "Repas de Noël annulé"],["Ce que tu fais quand le livreur sonne et que t'es pas prêt(e)", "Je gère", "Je fais le mort"],["La pire excuse pour ne pas rembourser un pote", "Crédible", "Amitié terminée"],["Ce que ton chef découvre sur ton écran", "Un tableur", "Lettre de démission"],["La pire chose à oublier en partant en vacances", "Rien de grave", "Vacances gâchées"],["Ce que tu fais en premier après une rupture", "Sain", "Inquiétant"],["Le pire moment pour s'endormir", "Devant la télé", "En pleine réunion"],["Ta réaction quand on te réveille d'une sieste", "Douce", "Danger"],["Ce que tu racontes à ton coiffeur", "Banal", "Toute ta vie"],["La pire chose à dire à un date au moment de payer", "Maladroite", "Il ou elle part en courant"],["Ce que tu as fait de pire pour un pari", "Rien", "Légendaire"],["Le pire endroit pour vomir en soirée", "Les toilettes", "Dans le sac de quelqu'un"],["Ce que tu fais en voyant ton ex en terrasse", "Je salue", "Je change de ville"],["Le message envoyé au mauvais destinataire", "Anodin", "Catastrophe nucléaire"],["Le pire déguisement pour une soirée d'entreprise", "Ça passe", "Convoqué(e) aux RH"],["Le pire plat à servir à ta belle-famille", "Raté", "Hospitalisation"],["Ce que tu inventes pour quitter une soirée nulle", "Crédible", "Personne n'y croit"],["Ce que tu fais dans l'ascenseur quand t'es seul(e)", "Rien", "Concert privé"]
];
const TABOU = [
  ["Un endroit chez tes parents pour faire l'amour","Ça passe","Sacrilège"],
  ["Le nom d'un sex-shop","Classe","Fermé dans la semaine"],
  ["Ce que tu dis à tes parents qui te surprennent en pleine action","Crédible","Je change d'identité"],
  ["Ta phrase d'accroche sur une appli de rencontre","Bloqué(e) direct","Match immédiat"],
  ["Ce qu'on trouve dans la table de nuit de ton voisin","Banal","Je déménage"],
  ["Ton nom de scène de star du X","Ridicule","Légendaire"],
  ["Le titre du film de ta vie sexuelle","Gênant","Chef-d'œuvre"],
  ["Ce que tu murmures à l'oreille pour séduire","Tue-l'amour","Irrésistible"],
  ["Un fantasme que tu n'avoueras qu'à cette table","Sage","Inavouable"],
  ["Ce que ton ex dirait de toi au lit","Bâillements garantis","Il ou elle en parle encore"],
  ["Ta réaction quand ton ou ta partenaire a une panne au lit","Rassurante","Vexante"],
  ["Le message que tu envoies à ton ex à 2 h du matin","Innocent","Clairement pas innocent"],
  ["Un jeu de rôle à proposer à ton ou ta partenaire","Sage","Beaucoup trop loin"],
  ["Ce que tu fais en te réveillant à côté de ton boss","Je gère","Je démissionne par SMS"],
  ["Le truc le plus bizarre qui t'excite","Normal","Très, très bizarre"],
  ["Une célébrité pour un plan à trois","Bof","Je signe direct"],
  ["Ce que tu avoues à ton (ta) partenaire après trois verres","Mignon","Rupture"],
  ["La tenue la moins sexy pour un rendez-vous coquin","Ça passe","Tue-l'amour absolu"],
  ["Le prénom à ne jamais crier au lit","Pardonnable","C'est fini"],
  ["Ce que dit ton (ta) partenaire en tombant sur ton historique","Fou rire","Valises bouclées"],
  ["Un sex toy qu'il faudrait inventer","Inutile","Révolutionnaire"],
  ["Ce que tu proposes pour pimenter un couple qui s'ennuie","Sage","Très osé"],
  ["Ce que tu n'as jamais osé demander au lit","Anodin","Tabou absolu"],
  ["La pire phrase pour conclure un premier rendez-vous","Maladroite","Plus jamais de nouvelles"],
  ["Ce que tes voisins ont entendu cette nuit","Rien de spécial","Ils ont appelé la police"],
  ["Le pire moment pour sortir un préservatif","Gênant","Scandale"],
  ["Ce que tu dis quand un collègue tombe sur ton profil de rencontre","Assumé","Mensonge énorme"],
  ["La question que tu poses au médecin en chuchotant","Banale","Il appelle un collègue"],
  ["Ce que contient le dossier caché de ton téléphone","Rien de grave","Mise en quarantaine"],
  ["La pire chose à dire en pleine action","Maladroite","On arrête tout"],
  ["Ce que tu ferais pour un million d'euros","Facile","Plus aucune dignité"],
  ["Un secret de famille que personne ne doit connaître","Anodin","Héritage annulé"],
  ["Ce que tu penses vraiment pendant le repas de famille","Poli","Guerre ouverte"],
  ["La pensée la plus déplacée pendant un enterrement","Légère","Je vais en enfer"],
  ["Le pire endroit où tu as fait pipi","Normal","Interdit par la loi"],
  ["Le plus gros mensonge que tu as dit à un ex","Pieux","Monumental"],
  ["Ta vengeance contre un ex infidèle","Classe","Fait divers"],
  ["Ta technique pour t'éclipser après un plan d'un soir","Élégante","Fuite par la fenêtre"],
  ["Ce que tu tapes en premier dans un moteur de recherche à 3 h du matin","Normal","Je suis fiché(e)"],
  ["L'endroit le plus risqué pour un câlin coquin","Tranquille","Interpellé(e)"],
  ["Cupidon s'est trompé de flèche. De qui tombes-tu amoureux(se) ?","Catastrophe","Jackpot"],
  ["Un colis anonyme de sex-shop arrive chez toi. Qu'y a-t-il dedans ?","Banal","Je n'ouvre plus aucun colis"],
  ["Un génie coquin t'accorde un vœu au lit. Lequel ?","Sage","Inavouable"],
  ["Ta mère s'inscrit sur la même appli de rencontre que toi. Sa bio ?","Mignonne","Traumatisante"],
  ["La première ligne de la notice d'un sex toy","Technique","Torride"],
  ["Ton (ta) partenaire organise un week-end coquin surprise. Où ?","Tue-l'amour","Inoubliable"],
  ["Ton matelas se met à parler. Que dit-il ?","Rien à signaler","Il en a trop vu"],
  ["Le nom de la position que tu viens d'inventer","Ridicule","Direct dans le Kamasutra"],
  ["Le message d'adieu de ton dernier plan d'un soir","Poli","Assassin"],
  ["Le pire endroit pour un premier bisou", "Mignon", "Scandale public"],["Ce que tu mets dans ta bio de rencontre pour mentir", "Petit arrangement", "Faux profil"],["Ta technique de drague la plus nulle", "Juste maladroite", "Légendairement nulle"],["Ce que tu fais si ton date ressemble à ton ex", "Je reste", "Je fuis"],["Ce que tu n'avouerais jamais à tes beaux-parents", "Anodin", "Rupture familiale"],["La pire chose à trouver dans la salle de bain de ton date", "Rien", "Je pars sans dire au revoir"],["Le surnom ridicule que tu donnes à ton ou ta partenaire", "Mignon", "Insoutenable"],["Ce que tu fais en visio quand ta caméra est coupée", "Rien", "Inavouable"],["La pire façon de rompre", "Avec tact", "Par Post-it"],["La pire chose à dire au réveil après une première nuit", "Maladroite", "Fuite immédiate"],["Ce que ton clavier suggère quand tu tapes « je »", "Innocent", "Accablant"],["Ce que tu fais si tu croises ton ancien prof en boîte", "Je salue", "Je danse avec"],["Ton pire râteau", "Gentil", "Humiliation publique"],["La pire déclaration d'amour", "Maladroite", "Ordonnance d'éloignement"],["Ce que tu caches sous ton lit", "Des chaussettes", "Personne ne doit savoir"],["Ton crush le plus inavouable", "Normal", "Je l'emporte dans la tombe"],["Le pire endroit où se faire surprendre en train de s'embrasser", "Ça passe", "Viral sur internet"],["Le mot doux que tu laisses sur l'oreiller", "Mignon", "Torride"],["Le pire cadeau de Saint-Valentin", "Banal", "Rupture"],["Ce que tu fais pour rendre ton ex jaloux", "Subtil", "Pathétique"],["La pire réponse à « tu penses à quoi ? »", "Rien", "Gâchis total"],["Le défi coquin que tu proposes en soirée", "Sage", "Personne n'ose"],["Ce que ton ou ta partenaire ne saura jamais", "Rien de grave", "Ça finirait mal"],["La tenue que tu mets pour séduire", "Classique", "Arme fatale"],["La pire chanson pour une ambiance romantique", "Ça passe", "Tue-l'amour total"]
];


const TRASH = [["Le titre du porno parodique de ton film préféré", "Nul", "Chef-d'œuvre du genre"], ["Ce que ton historique de navigation privée dit de toi", "Rien de grave", "Il faut te faire suivre"], ["Une catégorie de site porno", "Classique", "Je ne savais pas que ça existait"], ["Le pire endroit pour un plan cul", "Ça passe", "Casier judiciaire"], ["Ton bruit au moment de l'orgasme", "Discret", "Les voisins appellent la police"], ["Ce que tu cries au moment fatidique", "Normal", "Inavouable"], ["Une position que tu n'oseras jamais tenter", "Facile", "Il faut un kiné"], ["Le pire sex toy à offrir au Père Noël secret du bureau", "Gênant", "Licenciement"], ["Ce que tu dis à ton plan cul en partant au petit matin", "Classe", "Goujat absolu"], ["Ton fantasme le plus inavouable", "Sage", "Interdit dans 40 pays"], ["Le nom de ton futur sex toy connecté", "Ridicule", "Best-seller"], ["Un endroit où tu l'as fait (ou où tu rêves de le faire)", "Banal", "Attentat à la pudeur"], ["Ce qui t'a coupé l'envie en plein acte", "Rien", "Traumatisme"], ["La pire chose à trouver sous le lit d'un date", "Une chaussette", "J'appelle un exorciste"], ["Ta technique de préliminaires", "Expédiée", "Légendaire"], ["Un dirty talk raté", "Gênant", "Fou rire général"], ["Le scénario de porno le plus nul", "Ennuyeux", "Oscar du X"], ["Ce que tu fais avec de la chantilly", "Un dessert", "Plus jamais propre"], ["Ton record de durée au lit", "Trente secondes", "Marathon"], ["Un accessoire inattendu pendant l'acte", "Une bougie", "Appel aux pompiers"], ["La pire rencontre sur une appli de cul", "Bof", "Fait divers"], ["Ce que tu n'avoueras jamais à ton médecin", "Banal", "Il en tombe de sa chaise"], ["Un fétiche surprenant", "Les pieds", "Je ne comprends même pas"], ["Ta pire histoire de capote", "Elle a craqué", "Souvenir de 9 mois"], ["Ce que ton ex raconte sur tes performances", "Élogieux", "Humiliant"], ["Le plan à plusieurs le plus improbable", "Trois potes", "Tout l'immeuble"], ["Un nude raté", "Flou", "Envoyé à la famille"], ["Ce que tu mets sur ta liste de cadeaux coquine", "Des menottes", "Un donjon complet"], ["La pire excuse après une panne", "La fatigue", "Je t'aime trop"], ["Le surnom de ton entrejambe", "Mignon", "Légendaire"], ["Une soirée qui risque de finir en partouze", "Aucune chance", "Couru d'avance"], ["Ce que tu as découvert en regardant du porno", "Rien", "Ma vocation"], ["La partie de jambes en l'air la plus gênante de ta vie", "Juste ratée", "Ambulance"], ["Ta performance au lit, notée par ton (ta) dernier(ère) partenaire", "Remboursez", "Standing ovation"], ["Le lubrifiant le plus improbable", "Huile d'olive", "Je ne veux pas savoir"], ["Un endroit au travail pour un quickie", "Le placard", "Le bureau du patron"], ["Ce que tu as fait pour un plan cul", "Un trajet en bus", "Un vol long-courrier"], ["La pire phrase après l'amour", "Merci", "Tu peux partir"], ["La pratique que tu refuses catégoriquement", "Peut-être un jour", "Jamais de la vie"], ["Le slogan publicitaire de ta marque de capotes", "Raté", "Culte"],
  ["Le pire bruit pendant l'acte", "Discret", "Fou rire"],["Le nom de code pour dire « on rentre faire l'amour »", "Discret", "Tout le monde a compris"],["Ce que tu fais quand le lit grince trop", "On ralentit", "On finit par terre"],["La pire interruption pendant un câlin", "Le chat", "Les beaux-parents"],["La position la plus ridicule", "Classique", "Il faut un mode d'emploi"],["Ce que tu as acheté au sex-shop par erreur", "Un truc banal", "Je ne sais pas ce que c'est"],["Le pire endroit pour prendre un nude", "Dans la salle de bain", "Au bureau"],["Ta playlist pour faire l'amour", "Romantique", "Un générique de dessin animé"],["Le pire costume pour un jeu de rôle", "Infirmier", "Mascotte de stade"],["Ce que tu fais juste après l'amour", "Un câlin", "Je joue à la console"],["Ce que tu tapes dans la recherche d'un site X", "Classique", "Ça m'inquiète"],["Le pire objet pour remplacer un sex toy", "Créatif", "Urgences"],["Ton excuse pour la marque dans ton cou", "Crédible", "Personne n'y croit"],["Le pire moment pour que ton téléphone sonne", "Pendant un câlin", "En pleine action"],["La pire chose à dire pendant un strip-tease", "Maladroite", "Le show s'arrête"],["Ta technique de drague la plus directe", "Subtile", "Interdite"],["Ce qu'on trouve dans la valise d'un couple en week-end coquin", "Un pyjama", "Toute une boutique"],["Le mot de sécurité le moins pratique", "Facile", "Imprononçable"],["La pire chose à dire en enlevant ses vêtements", "Gênante", "On se rhabille"],["Le fantasme le plus cliché", "Original", "Vu mille fois"]
];
const NOIR = [["Ta dernière phrase avant de mourir", "Banale", "Légendaire"], ["Ce que tu écris dans ton testament", "Classique", "Vengeance posthume"], ["La musique à jouer à ton enterrement", "Triste", "Tout le monde danse"], ["Une façon ridicule de mourir", "Bête", "Prix Darwin"], ["Ce que tu fais quand le médecin t'annonce qu'il te reste une semaine", "Digne", "Je vide mon compte en banque"], ["Ton épitaphe", "Sobre", "Culte"], ["Le pire cadeau à offrir à un mourant", "Gênant", "Cynique"], ["Ce que tu ferais si tu étais un fantôme", "Hanter gentiment", "Terreur absolue"], ["La pire blague à faire à un enterrement", "Maladroite", "Expulsé(e) du cimetière"], ["Ta place en enfer", "Sous-sol", "Carré VIP avec le diable"], ["Ce que tu fais de ton héritage", "Raisonnable", "Tout claqué en une nuit"], ["L'animal de compagnie qui te mangerait après ta mort", "Fidèle jusqu'au bout", "Sans hésiter"], ["Une raison de ne pas aller à un enterrement", "Valable", "Monstrueuse"], ["Ce que la Mort te dit en venant te chercher", "Polie", "Elle se moque de toi"], ["Le pire endroit pour mourir", "Paisible", "Ridicule"], ["Ce qu'on trouvera dans ton ordi après ta mort", "Rien", "Scandale posthume"], ["La pire façon d'annoncer un décès", "Maladroite", "Par un mème"], ["Ton plan pour survivre à la fin du monde", "Mort(e) dans la semaine", "Seigneur des ruines"], ["Ce que tu glisses dans le cercueil de ton pire ennemi", "Une fleur", "Un mot doux bien senti"], ["Une mauvaise nouvelle à annoncer au repas de Noël", "Gênante", "La bûche est gâchée"], ["Le pire nom pour une entreprise de pompes funèbres", "Sobre", "Scandale"], ["Ce que tu dis au diable pour négocier ton âme", "Faible", "Il te doit de l'argent"], ["Le hobby du tueur en série dans un film", "Banal", "Glaçant"], ["Ce que tu fais si tu te réveilles dans ton cercueil", "Panique", "Je fais la sieste"], ["La réaction de ta famille à ta mort", "Effondrée", "Soulagée"], ["Le pire souvenir à ramener d'un cimetière", "Une fleur", "Un tibia"], ["Ta réincarnation", "Moustique", "Chat de riche"], ["Ce que tu publies en apprenant ta fin imminente", "Digne", "Règlement de comptes"], ["Le pire dernier repas", "Fade", "Plat de cantine"], ["Ce que dirait le prêtre à ton enterrement s'il te connaissait vraiment", "Élogieux", "Il se signe trois fois"], ["La pire manière d'apprendre qu'on est adopté", "Avec douceur", "À la lecture du testament"], ["Le pire moment pour un fou rire", "Pas grave", "Pendant la minute de silence"], ["Ce que tu ferais si tu étais le (la) dernier(ère) humain(e) sur Terre", "Je pleure", "Enfin la paix"], ["Le pire job dans un film d'horreur", "Figurant(e)", "Babysitter de la maison hantée"],
  ["Ce que tu lègues à ton pire ennemi", "Rien", "Tes dettes"],["La pire façon de quitter un groupe d'amis", "Discrète", "Mise en scène de ta mort"],["Le pire fantôme à avoir chez soi", "Discret", "Ton ex"],["Ce que fait ton chat le jour de ton enterrement", "Il te pleure", "Il dort sur le cercueil"],["La pire musique d'attente du paradis", "Supportable", "Interminable"],["Le message de ton répondeur après ta mort", "Sobre", "Hilarant"],["La pire manière de rater sa propre fête surprise", "En retard", "Crise cardiaque"],["La pire chose à graver sur une urne", "Sobre", "Indécent"],["Le pire cadeau d'adieu à un collègue", "Banal", "Un cercueil en kit"],["Ce que tu fais si tu apprends que tu es immortel(le)", "Je profite", "Je m'ennuie à mourir"],["Le pire endroit pour disperser des cendres", "Un jardin", "Devant un ventilateur"],["Ce que disait ton horoscope le jour de ta mort", "Rassurant", "Il avait prévenu"],["Ta stratégie dans un film catastrophe", "Premier(ère) à mourir", "Seul(e) survivant(e)"],["Ta dernière volonté la plus absurde", "Raisonnable", "Impossible"],["Le pire sujet de discours à une veillée funèbre", "Touchant", "Règlement de comptes"],["Ce que tu emportes dans l'au-delà", "Un souvenir", "Le Wi-Fi"],["Ce que tu fais si la Mort se trompe d'adresse", "Je la renvoie", "Je lui donne l'adresse du voisin"]
];

/* ---------- English decks: [category, what 1 means, what 10 means] ---------- */
const CATS_EN = [
  ["A movie","Total flop","Masterpiece"],["A dish","Inedible","Meal of my life"],
  ["A vacation destination","Not in a million years","Absolute dream"],["A superpower","Useless","Unbeatable"],
  ["An animal","Harmless","Terrifying"],["A job","Mind-numbing","Fascinating"],
  ["A song for a wedding","Empty dance floor","Everyone's dancing"],["A TV show","Quit after episode one","Watched it three times"],
  ["A video game","Uninstalled","Hundreds of hours"],["A baby name","Cruel","Beautiful"],
  ["A birthday present","Forced smile","Tears of joy"],["An excuse for being late","Nobody buys it","Bulletproof"],
  ["A smell","Unbearable","Heavenly"],["A first-date spot","Disaster","Perfect"],
  ["Something to bring to a desert island","Useless","Vital"],["A drink","Undrinkable","Delicious"],
  ["A sport","Snooze-fest","Spectacular"],["A household chore","Almost fun","Nightmare"],
  ["A phobia","Understandable","Ridiculous"],["An invention","Gimmick","Changed the world"],
  ["A fictional character","Unbearable","Legend"],["A dessert","I'll pass","Thirds, please"],
  ["A city to live in","Never","Moving tomorrow"],["A way to get around","Painful","Pure joy"],
  ["An app on your phone","Deleted","Can't live without it"],["A TV program","Embarrassing","Cult classic"],
  ["A school subject","Torture","My favorite"],["Something scary at night","Not scared","Never sleeping again"],
  ["A celebrity","Never heard of them","Everyone knows them"],["A season or kind of weather","Depressing","Ideal"],
  ["A habit","Healthy","Toxic"],["A breakfast food","Weird","Essential"],
  ["A sound","Soothing","Unbearable"],["A color to paint your bedroom","Never","Love it"],
  ["A cartoon","Flop","Cult classic"],["A word in the English language","Ugly","Gorgeous"],
  ["A Sunday activity","Chore","Bliss"],["An awkward situation","Slightly awkward","Let me disappear"],
  ["A kitchen utensil","Useless","Essential"],["A brand","Dated","Iconic"],
  ["A cheese","Bland","Powerful"],["A monster or creature","Cute","Nightmare fuel"],
  ["A hidden talent","Meh","Impressive"],["An energy drink or soda","Gross","Perfect"],
  ["A period in history","Not for anything","Sign me up"],["A place to party","Dead vibe","Legendary night"],
  ["A spice or condiment","Mild","It burns"],["An outfit for a job interview","Instant rejection","Hired on the spot"],
  ["A lie","Innocent","Unforgivable"],["A pet","Low-maintenance","Out of control"],
  ["A musical instrument","Unbearable","Mesmerizing"],["A horror movie","Funny","Traumatizing"],
  ["A band name","Ridiculous","Brilliant"],["A way to lose a video game","Ordinary","Humiliating"],
  ["A way to be woken up","Gently","Brutally"],["A dinner-table topic","Totally safe","Guaranteed fight"],
  ["A birthday cake","Failed","Work of art"],["A school cafeteria meal","Tray untouched","Seconds, please"],
  ["A look","Classic","Over the top"],["A hiding spot","Found in 2 seconds","Never found"],
  ["A noise from the neighbors","Bearable","I'm moving out"],["A small pleasure in life","Nice","Paradise"],["An annoying habit","Cute","Instant breakup"],["A gift from a coworker","Forgettable","Keeping it forever"],["A frozen meal","Sad","Better than takeout"],["A reason to cancel plans","Fair enough","Shameful"],["A place for a nap","Uncomfortable","Like a cloud"],["A playground game","Boring","Legendary"],["A skill to learn","Pointless","Life-changing"],["A hot drink","Undrinkable","Pure comfort"],["A fruit","Disappointing","Perfect"],["A vegetable","Left on the plate","I'll have more"],["A childhood memory","Fuzzy","Unforgettable"],["A holiday","Chore","Can't wait"],["A lost item","Oh well","Tragedy"],["A rainy-day activity","Depressing","Awesome"],["A sauce","Bland","I'd drink it"],["A car trip","Endless","Dream road trip"],["A haircut","Hair disaster","Iconic"],["A sound of nature","Unsettling","Soothing"],["A room in the house","Gloomy","My safe place"],["An emoji","Useless","Use it constantly"],["A way to say goodbye","Ice cold","Heartwarming"],["An ice cream flavor","Weird","My favorite"],["A day of the week","Worst day","Best day"],["A craft hobby","Boring","My passion"],["A quality in a friend","Optional","Essential"],["A roommate flaw","Forgivable","Deal-breaker"],["A card game","Snooze-fest","Addictive"],["A pastry","Dry","Divine"],["A picnic spot","Grim","Idyllic"],["A vacation souvenir","Tacky","Priceless"],["A family tradition","Tedious","Sacred"],["A cooking smell","Nauseating","Irresistible"]
];
const GEEK_EN = [
  ["A video game boss","Easy","Rage quit"],["A superhero","Lame","Coolest ever"],
  ["A movie villain","Ridiculous","Terrifying"],["A meme","Cringe","Iconic"],
  ["An anime or manga","Dropped it","Masterpiece"],["A series finale","Botched","Perfect"],
  ["A spoiler","No big deal","Unforgivable"],["A game console","Flop","Legendary"],
  ["A YouTuber or streamer","Unbearable","Awesome"],["A remake or reboot","Pointless","Better than the original"],
  ["A video game soundtrack","Forgettable","Legendary"],["A movie franchise","One movie too many","Flawless"],
  ["A magic power","Gimmick","Overpowered"],["A weapon in a game","Useless","Broken OP"],
  ["A video game character","Annoying","Iconic"],["An app update","Disaster","Revolution"],
  ["A social network","Toxic","Can't live without it"],["A TikTok trend","Cringe","Viral"],
  ["A board game","Boring","Perfect game night"],["A comic book","Unreadable","Cult classic"],
  ["An easter egg","Impossible to find","Everyone knows it"],["A video game glitch","Barely noticeable","Legendary"],
  ["An online username","Cringe","Legendary"],["A password","Hacked in 2 seconds","Fort Knox"],["A tech gadget","Useless","Game changer"],["A video game ending","Disappointing","I cried"],["A side character","Forgettable","Deserves a spin-off"],["A movie robot","Scrap metal","Iconic"],["A sci-fi planet","Hostile","Moving there"],["A video to watch at 2 a.m.","Fell asleep","Can't look away"],["A spell from Harry Potter","Useless","Deadly"],["An online tutorial","Incomprehensible","Saved my life"],["A notification","Annoying","Great news"],["A mobile game","Uninstalled","Total addiction"],["A cosplay costume","Fail","Mind-blowing"],
  ["A Pokémon","Useless","First pick, always"],["A Star Wars character","Annoying","Legend"]
];
const ABSURDE_EN = [
  ["You wake up with a superpower, but it's lame. What is it?","Totally useless","Actually handy"],
  ["Santa mixed up the sacks. What's under your tree?","Disaster","Best Christmas ever"],
  ["A genie grants your wish but gets it all wrong. What happens?","Disaster","Lucky break"],
  ["You must survive a week on an island with one thing from your pockets. What is it?","Dead on day one","King of the island"],
  ["Aliens want to see the best of humanity. What do you show them?","They leave offended","They sign a peace deal"],
  ["Your revolutionary new app. What does it do?","Total flop","Tech unicorn"],
  ["Your pet starts talking. Its first sentence?","Chilling","Adorable"],
  ["Your last meal before the end of the world","Sad","Perfect"],
  ["You're stuck in an elevator for six hours. With who?","Nightmare","Best time of my life"],
  ["The new ice cream flavor nobody asked for","Inedible","I want to try it"],
  ["Your new career if computers vanished tomorrow","Struggle","Dream career"],
  ["You go back five centuries with your phone. What do you do?","Burned as a witch","Emperor of the world"],
  ["Your campaign slogan to become mayor","Zero votes","Landslide win"],
  ["Your signature dish on a cooking show","Eliminated","Michelin star"],
  ["Your garage band's name","Ridiculous","Legendary"],
  ["A new Olympic event","Nobody watches","Record ratings"],
  ["You're invisible, but only when nobody's looking. What's it good for?","Nothing","Genius move"],
  ["Your last message before a one-way trip to Mars","Boring","Legendary"],
  ["The mascot of the next Olympics","Fail","Iconic"],
  ["What you bring back from a gift shop in hell","Junk","So stylish"],
  ["Your excuse when the cops find you in pajamas at the zoo at 4 a.m.","Nobody buys it","They apologize"],
  ["Next Christmas's must-have toy","Flop","Sold out everywhere"],
  ["What the ghost haunting your apartment does","Harmless","I'm moving out"],
  ["You win a free one-year subscription. To what?","Useless","Jackpot"],
  ["The first law you pass once in power","Pointless","Revolution"],
  ["What you find in the pocket of a thrift-store coat","Nothing interesting","Life-changing"],
  ["You're a movie villain. Your evil plan?","Pathetic","Terrifying"],
  ["Your survival strategy in a zombie apocalypse","Dead in the first scene","Last one standing"],
  ["What your toothbrush would say about you if it could talk","It quits","It adores you"],
  ["A job that will exist in 2100","Absurd","Essential"],
  ["You get cloned. What does your clone do first?","Betrays me","Does all my chores"],
  ["What you put in a time capsule to open in 50 years","Useless","Historic treasure"],
  ["The title of your autobiography","Nobody buys it","Bestseller"],
  ["The everyday object you'd use against a burglar","Useless","Lethal"],
  ["You become head of your building. Your first decision?","Riot","Statue in your honor"],
  ["What you say to a resurrected dinosaur so it won't eat you","It eats you","It becomes your friend"],
  ["The worst superpower for a first date","It's fine","Date ruined"],
  ["Your restaurant menu for aliens","Diplomatic incident","They want the recipe"],
  ["What a secret agent keeps at the bottom of their bag","Boring","Full arsenal"],
  ["You invent a national holiday. What do people do?","Nobody shows up","Best day of the year"],
  ["You wake up in your cat's body. First move?","Nap","Household domination"],["A weird law passed tomorrow morning","Harmless","National chaos"],["Your voice turns into a sports commentator's. How's daily life?","Annoying","Awesome"],["A museum about your life. Its centerpiece?","Embarrassing","Masterpiece"],["You can talk to only one kind of object. Which one?","Useless","Essential"],["The combat sport your family invented","Harmless","Banned"],["The assembly instructions for your personality","Crystal clear","Incomprehensible"],["Your bedroom becomes an escape room. The final puzzle?","Obvious","Nobody gets out"],["What pigeons really think of humans","They love us","They're plotting"],["Your dream theme park. The star ride?","Boring","Legendary"],["You replace a sports team's mascot. Your costume?","Ridiculous","Cult classic"],["A new color was just discovered. Its name?","Ugly","Sublime"],["The clouds spell out a message for you. What does it say?","Boring","Life-changing"],["Your fridge's noises at night. What do they mean?","Nothing","It's plotting"],["You open a restaurant with just one dish. Which one?","Bankrupt","Line around the block"],["A reality show starring you","Canceled","Record ratings"],["Your superhero has a ridiculous weakness. What is it?","Embarrassing","Fatal"],["Your bowling team's battle cry","Timid","Terrifying"],["You find a magic item at a yard sale. What is it?","Useless","All-powerful"],["The first line of the manual for becoming an adult","Reassuring","Terrifying"],["Your ideal day if gravity disappeared","Ordinary","Epic"]
];
const HARD_EN = [
  ["Your mom reads the last text you sent. What does it say?","She smiles","She calls a priest"],
  ["What you yell waking up at a stranger's place after a party","Zen","Total panic"],
  ["The worst opening line for a wedding speech","Clumsy","Divorced by dessert"],
  ["What you find going through your buddy's phone","Nothing major","Calling a lawyer"],
  ["Your excuse for puking on the host's couch","Believable","Nobody buys it"],
  ["What you tell your boss when you show up to work drunk","Smooth","Fired on the spot"],
  ["The worst name for a nightclub","It works","Shut down by the city"],
  ["What's in your bag the morning after a party","Normal","Someone call someone"],
  ["What you'd do for 24 hours with zero consequences","Well-behaved","Illegal everywhere"],
  ["What the psychic predicts for your 40th","Reassuring","Nightmare"],
  ["The worst thing to say at a funeral","Awkward","Escorted out"],
  ["What you do when your friends leave and you're home alone","Normal","Nobody can know"],
  ["What's at the back of a college student's fridge","Still edible","It's moving"],
  ["What your ex tells their friends about you","Kind","Defamation"],
  ["A four-minute voice note from your aunt. What's it about?","Mundane","Family drama"],
  ["The worst gift for your mother-in-law","Awkward","Written out of the will"],
  ["What you tell the ticket inspector when you didn't pay","Believable","Night in a cell"],
  ["The most shameful thing you've done drunk","Cute","Banned for life"],
  ["The worst tattoo to get on your forehead","It works","Life ruined"],
  ["What your grandma finds on your Instagram","She likes it","You're out of the will"],
  ["What you yell stepping on a Lego at 3 a.m.","Polite","Whole building hears"],
  ["The worst place to really need the bathroom","No big deal","Social death"],
  ["A rumor to start about the strictest teacher","Harmless","They quit the school"],
  ["The note you leave on the fridge for the roommate who steals your food","Passive-aggressive","Declaration of war"],
  ["What you hear through the hotel room wall","Nothing special","Calling the front desk"],
  ["Why you're late, the version you give your boss","Believable","Lie of the year"],
  ["Your hidden party talent","Useful","Concerning"],
  ["What you'd do if you were invisible for a day","Well-behaved","Life in prison"],
  ["What you say when caught crying at a commercial","Owning it","Huge lie"],
  ["Your reaction when the Wi-Fi drops mid ranked match","Zen","Violence"],
  ["The worst thing to shout in a library","Awkward","Building evacuated"],
  ["The sketchiest vacation souvenir for your friends","Junk","Legendary"],
  ["The worst place to get dumped","It's fine","Public trauma"],
  ["What shows up in the mail that you never ordered","Disappointing","Call the bomb squad"],
  ["What your buddy does when he's had too much","Cute","Keep an eye on him"],
  ["The worst name to give your kid","Original","They'll sue you"],
  ["What you say running into the person who ghosted you","Polite","Public scene"],
  ["What you write in a wedding guest book after six drinks","Touching","Deeply awkward"],
  ["The worst icebreaker on a first date","Awkward","They run away"],
  ["The first thing you do if you win the lottery","Sensible","Totally insane"],
  ["What you tell the cab driver at 5 a.m.","Polite","Drops you at the police station"],["Your last online purchase at 3 a.m.","Reasonable","Can't own it"],["The worst text to send by mistake to the family group chat","Harmless","Christmas canceled"],["What you do when the delivery guy rings and you're not ready","I handle it","I play dead"],["The worst excuse for not paying a friend back","Believable","Friendship over"],["What your manager sees on your screen","A spreadsheet","Resignation letter"],["The worst thing to forget when leaving on vacation","No big deal","Trip ruined"],["The first thing you do after a breakup","Healthy","Worrying"],["The worst moment to fall asleep","In front of the TV","Mid-meeting"],["Your reaction when someone wakes you from a nap","Sweet","Danger"],["What you tell your hairdresser","Small talk","Your whole life"],["The worst thing to say to a date when the bill comes","Awkward","They run for it"],["The worst thing you've done on a dare","Nothing","Legendary"],["The worst place to throw up at a party","The toilet","In someone's bag"],["What you do when you spot your ex at a café","I wave","I move cities"],["The text sent to the wrong person","Harmless","Nuclear disaster"],["The worst costume for an office party","It works","Called in by HR"],["The worst dish to serve your in-laws","Flop","Hospitalized"],["What you make up to leave a lame party","Believable","Nobody buys it"],["What you do in the elevator when you're alone","Nothing","Private concert"]
];
const TABOU_EN = [
  ["A place at your parents' house to have sex","It's fine","Sacrilege"],
  ["The name of a sex shop","Classy","Closed within a week"],
  ["What you tell your parents when they walk in on you mid-act","Believable","New identity"],
  ["Your opening line on a dating app","Blocked instantly","Instant match"],
  ["What's in your neighbor's nightstand","Ordinary","I'm moving"],
  ["Your porn star stage name","Ridiculous","Legendary"],
  ["The title of the movie of your sex life","Embarrassing","Masterpiece"],
  ["What you whisper in someone's ear to seduce them","Mood killer","Irresistible"],
  ["A fantasy you'd only admit at this table","Tame","Unspeakable"],
  ["What your ex would say about you in bed","Snooze-fest","Still talks about it"],
  ["Your reaction when your partner can't perform","Reassuring","Hurtful"],
  ["The text you send your ex at 2 a.m.","Innocent","Clearly not innocent"],
  ["A role-play to suggest to your partner","Tame","Way too far"],
  ["What you do when you wake up next to your boss","I handle it","I quit by text"],
  ["The weirdest thing that turns you on","Normal","Very, very weird"],
  ["A celebrity for a threesome","Meh","Sign me up"],
  ["What you confess to your partner after three drinks","Cute","Breakup"],
  ["The least sexy outfit for a hookup","It works","Ultimate mood killer"],
  ["The name you should never shout in bed","Forgivable","It's over"],
  ["What your partner says on finding your browser history","Laughs it off","Packs their bags"],
  ["A sex toy someone should invent","Pointless","Revolutionary"],
  ["What you suggest to spice up a bored couple","Tame","Very daring"],
  ["What you've never dared to ask for in bed","Harmless","Total taboo"],
  ["The worst line to end a first date","Clumsy","Never heard from again"],
  ["What your neighbors heard last night","Nothing special","They called the cops"],
  ["The worst moment to pull out a condom","Awkward","Scandal"],
  ["What you say when a coworker finds your dating profile","Owning it","Huge lie"],
  ["The question you whisper to your doctor","Ordinary","They call a colleague"],
  ["What's in your phone's hidden folder","Nothing major","Quarantined"],
  ["The worst thing to say mid-act","Awkward","We stop everything"],
  ["What you'd do for a million dollars","Easy","Zero dignity left"],
  ["A family secret nobody must know","Harmless","Inheritance canceled"],
  ["What you really think during family dinner","Polite","Open war"],
  ["The most inappropriate thought at a funeral","Mild","I'm going to hell"],
  ["The worst place you've peed","Normal","Illegal"],
  ["The biggest lie you told an ex","White lie","Monumental"],
  ["Your revenge on a cheating ex","Classy","Breaking news"],
  ["Your technique for sneaking out after a one-night stand","Graceful","Out the window"],
  ["What you search for in incognito mode","Normal","I'm on a list"],
  ["The riskiest place to get frisky","Chill","Arrested"],
  ["Cupid used the wrong arrow. Who do you fall for?","Disaster","Jackpot"],
  ["An anonymous sex-shop package arrives at your place. What's inside?","Ordinary","Never opening a package again"],
  ["A naughty genie grants you one wish in bed. What is it?","Tame","Unspeakable"],
  ["Your mom joins the same dating app as you. Her bio?","Cute","Traumatizing"],
  ["The first line of a sex toy's manual","Technical","Steamy"],
  ["Your partner plans a surprise sexy weekend. Where?","Mood killer","Unforgettable"],
  ["Your mattress starts talking. What does it say?","Nothing to report","It's seen too much"],
  ["The name of the position you just invented","Ridiculous","Straight into the Kama Sutra"],
  ["The goodbye text from your last one-night stand","Polite","Brutal"],
  ["The worst place for a first kiss","Cute","Public scandal"],["The lie you put in your dating bio","Small stretch","Fake profile"],["Your lamest pick-up technique","Just clumsy","Legendarily bad"],["What you do if your date looks like your ex","I stay","I bolt"],["What you'd never admit to your in-laws","Harmless","Family rift"],["The worst thing to find in your date's bathroom","Nothing","I leave without a word"],["The ridiculous pet name you give your partner","Cute","Unbearable"],["What you do on a video call when your camera's off","Nothing","Unspeakable"],["The worst way to break up","Tactfully","By Post-it"],["The worst thing to say waking up after a first night together","Awkward","Instant escape"],["What your keyboard suggests when you type “I”","Innocent","Damning"],["What you do if you run into your old teacher at a club","I say hi","I dance with them"],["Your worst rejection","Kind","Public humiliation"],["The worst declaration of love","Clumsy","Restraining order"],["What you hide under your bed","Socks","Nobody can know"],["Your most embarrassing crush","Normal","Taking it to my grave"],["The worst place to get caught making out","It's fine","Viral online"],["The love note you leave on the pillow","Sweet","Steamy"],["The worst Valentine's gift","Basic","Breakup"],["What you do to make your ex jealous","Subtle","Pathetic"],["The worst answer to “what are you thinking about?”","Nothing","Total buzzkill"],["The naughty dare you suggest at a party","Tame","Nobody dares"],["What your partner will never know","Nothing major","It'd end badly"],["The outfit you wear to seduce","Classic","Lethal weapon"],["The worst song for a romantic mood","It works","Total mood killer"]
];
const TRASH_EN = [["The porn parody title of your favorite movie","Lame","Genre masterpiece"],["What your incognito history says about you","Nothing major","You need help"],["A porn site category","Classic","Didn't know that existed"],["The worst place for a hookup","It works","Criminal record"],["Your noise when you climax","Discreet","Neighbors call the cops"],["What you yell at the big moment","Normal","Unspeakable"],["A position you'll never dare try","Easy","Need a physio"],["The worst sex toy for the office Secret Santa","Awkward","Fired"],["What you tell your hookup leaving at dawn","Classy","Total jerk"],["Your most unspeakable fantasy","Tame","Illegal in 40 countries"],["The name of your future smart sex toy","Ridiculous","Bestseller"],["A place you did it, or dreamed of doing it","Ordinary","Public indecency"],["What killed the mood mid-act","Nothing","Trauma"],["The worst thing to find under a date's bed","A sock","Calling an exorcist"],["Your foreplay technique","Rushed","Legendary"],["A dirty talk fail","Awkward","Everyone loses it"],["The lamest porn plot","Boring","Adult Oscar winner"],["What you do with whipped cream","Dessert","Never clean again"],["Your record for lasting in bed","Thirty seconds","Marathon"],["An unexpected prop during sex","A candle","Firefighters called"],["The worst match on a hookup app","Meh","Breaking news"],["What you'll never confess to your doctor","Ordinary","Falls off their chair"],["A surprising fetish","Feet","I don't even get it"],["Your worst condom story","It broke","9-month souvenir"],["What your ex says about your performance","Glowing","Humiliating"],["The most unlikely group hookup","Three buddies","The whole building"],["A nude gone wrong","Blurry","Sent to family"],["What's on your naughty wish list","Handcuffs","A full dungeon"],["The worst excuse after a performance fail","I'm tired","I love you too much"],["The nickname for your private parts","Cute","Legendary"],["A party that might end in an orgy","No chance","Called it"],["What you discovered watching porn","Nothing","My calling"],["The most embarrassing sex of your life","Just bad","Ambulance"],["Your performance in bed, rated by your last partner","Refund, please","Standing ovation"],["The most unlikely lube","Olive oil","Don't want to know"],["A spot at work for a quickie","The supply closet","The boss's office"],["How far you've traveled for a hookup","A bus ride","A long-haul flight"],["The worst line after sex","Thanks","You can go now"],["The thing you flat-out refuse in bed","Maybe someday","Never in my life"],["Your condom brand's slogan","Fail","Iconic"],
  ["The worst noise during sex","Subtle","Giggle fit"],["Your code phrase for “let's go home and have sex”","Discreet","Everyone got it"],["What you do when the bed creaks too much","Slow down","End up on the floor"],["The worst interruption during a cuddle","The cat","The in-laws"],["The most ridiculous position","Classic","Needs a manual"],["What you bought at the sex shop by mistake","Something basic","No idea what it is"],["The worst place to take a nude","In the bathroom","At the office"],["Your sex playlist","Romantic","A cartoon theme song"],["The worst role-play costume","Nurse","Stadium mascot"],["What you do right after sex","Cuddle","Play video games"],["What you type in a porn site's search bar","Classic","Worries me"],["The worst object to replace a sex toy","Creative","ER visit"],["Your excuse for the hickey on your neck","Believable","Nobody buys it"],["The worst moment for your phone to ring","During a cuddle","Mid-act"],["The worst thing to say during a striptease","Awkward","Show's over"],["Your most direct pick-up line","Subtle","Illegal"],["What's in a couple's suitcase for a dirty weekend","Pajamas","A whole store"],["The least practical safe word","Easy","Unpronounceable"],["The worst thing to say while undressing","Awkward","Getting dressed again"],["The most cliché fantasy","Original","Seen it a thousand times"]
];
const NOIR_EN = [["Your last words before dying","Ordinary","Legendary"],["What you write in your will","Standard","Revenge from the grave"],["The song to play at your funeral","Sad","Everyone dances"],["A ridiculous way to die","Dumb","Darwin Award"],["What you do when the doctor says you have a week left","Dignified","Empty my bank account"],["Your epitaph","Simple","Iconic"],["The worst gift for someone on their deathbed","Awkward","Cynical"],["What you'd do as a ghost","Gentle haunting","Pure terror"],["The worst joke to make at a funeral","Clumsy","Kicked out of the cemetery"],["Your spot in hell","Basement","VIP with the devil"],["What you do with your inheritance","Sensible","Blown in one night"],["The pet that would eat you after you die","Loyal to the end","Without hesitation"],["A reason to skip a funeral","Valid","Monstrous"],["What Death says when it comes for you","Polite","Mocks you"],["The worst place to die","Peaceful","Ridiculous"],["What they'll find on your computer after you die","Nothing","Posthumous scandal"],["The worst way to announce a death","Clumsy","With a meme"],["Your plan to survive the end of the world","Dead within a week","Lord of the ruins"],["What you slip into your worst enemy's coffin","A flower","A pointed little note"],["Bad news to share at Christmas dinner","Awkward","Dessert ruined"],["The worst name for a funeral home","Tasteful","Scandal"],["What you tell the devil to negotiate for your soul","Weak","He owes you money"],["A movie serial killer's hobby","Ordinary","Chilling"],["What you do if you wake up in your coffin","Panic","Take a nap"],["Your family's reaction to your death","Devastated","Relieved"],["The worst souvenir from a cemetery","A flower","A shinbone"],["Your reincarnation","Mosquito","Rich person's cat"],["What you post when you learn the end is near","Dignified","Settling scores"],["The worst last meal","Bland","Cafeteria food"],["What the priest would say at your funeral if he really knew you","Glowing","Crosses himself three times"],["The worst way to find out you're adopted","Gently","At the reading of the will"],["The worst moment for a laughing fit","No big deal","During the minute of silence"],["What you'd do as the last human on Earth","Cry","Finally, peace"],["The worst job in a horror movie","Extra","Haunted-house babysitter"],
  ["What you leave to your worst enemy","Nothing","Your debts"],["The worst way to leave a friend group","Quietly","Fake your own death"],["The worst ghost to have at home","Quiet","Your ex"],["What your cat does on the day of your funeral","Mourns you","Naps on the coffin"],["The worst hold music in heaven","Bearable","Endless"],["Your voicemail greeting after you die","Simple","Hilarious"],["The worst way to miss your own surprise party","Running late","Heart attack"],["The worst thing to engrave on an urn","Simple","Indecent"],["The worst farewell gift for a coworker","Basic","A flat-pack coffin"],["What you do if you learn you're immortal","Enjoy it","Bored to death"],["The worst place to scatter ashes","A garden","In front of a fan"],["What your horoscope said on the day you died","Reassuring","It warned you"],["Your strategy in a disaster movie","First to die","Sole survivor"],["Your most absurd last wish","Reasonable","Impossible"],["The worst topic for a eulogy","Touching","Settling scores"],["What you take with you to the afterlife","A memory","The Wi-Fi"],["What you do if Death gets the wrong address","Send it away","Give it the neighbor's"]
];

// Contenu par langue (mêmes paquets) : en réseau, c'est la langue de l'hôte (s.lg) qui compte.
const DECK = {
  fr: { classique: CATS, geek: GEEK, absurde: ABSURDE, adulte: HARD.concat(TABOU, TRASH, NOIR) },
  en: { classique: CATS_EN, geek: GEEK_EN, absurde: ABSURDE_EN, adulte: HARD_EN.concat(TABOU_EN, TRASH_EN, NOIR_EN) }
};
const deckOf = lg => DECK[lg === "en" ? "en" : "fr"];
const catsOf = (p, lg) => deckOf(lg)[p.v] || [];
const PACKS = [
  { v: "classique", label: tr("Classique", "Classic"), desc: tr("Pour tout le monde", "For everyone"), kid: true },
  { v: "geek", label: tr("Culture pop & geek", "Pop culture & geek"), desc: tr("Jeux vidéo, séries, internet", "Video games, TV shows, the internet"), kid: true },
  { v: "absurde", label: tr("Situations absurdes", "Absurd situations"), desc: tr("Des situations folles, des réponses à inventer", "Wild scenarios, answers you make up"), kid: true },
  { v: "adulte", label: tr("Hot & Hard", "Hot & Hard"), desc: tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult content"), hot: true },
  { v: "perso", label: tr("Catégories perso", "Custom categories"), desc: tr("Les tiennes, et en réseau celles des joueurs du salon", "Yours, plus everyone's in the room when playing online") }
];
function norm(c){ c = A(c); if(c.length !== 3) return null; const x = [clean(c[0], 90), clean(c[1], 24) || tr("Le pire", "The worst"), clean(c[2], 24) || tr("Le meilleur", "The best")]; return x[0] ? x : null; }
function myCustom(){ return A(store().n10custom).map(norm).filter(Boolean); }
function sharedCustom(peers){
  const seen = new Set(), out = [];
  const add = c => { const x = norm(c); if(!x) return; const k = x[0].toLowerCase(); if(seen.has(k)) return; seen.add(k); out.push(x); };
  myCustom().forEach(add);
  A(peers).forEach(p => { const x = p.presence && p.presence.x; if(x && x.note10) A(x.note10).forEach(add); });
  return out;
}
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; }; // mode Enfant : jamais de pool vide
function buildPool(packs, peers, lg){
  const sel = A(packs);
  return kidF(PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => (p.v === "perso" ? sharedCustom(peers) : catsOf(p, lg)).map(c => c.slice())));
}
/* ---------- Coups de théâtre : une manche sur trois environ, une règle change ---------- */
const TWISTS = [
  { id: "inv", name: tr("Note inversée", "Flipped scale"), desc: tr("Cette manche, l'échelle est retournée : les bornes du 1 et du 10 échangent leur place.", "This round, the scale is upside down: the 1 and 10 labels swap places.") },
  { id: "mot", name: tr("Un seul mot", "One word only"), desc: tr("Chaque indice tient en un seul mot, pas un de plus.", "Every clue is a single word, not one more.") },
  { id: "double", name: tr("Double ou rien", "Double or nothing"), desc: tr("Pile : 6 points. Sinon : rien du tout.", "Spot on: 6 points. Otherwise: nothing at all.") },
  { id: "large", name: tr("Tolérance large", "Wide margin"), desc: tr("À 3 près, ça rapporte encore 1 point.", "Off by 3 still scores 1 point.") },
  { id: "aveugle", name: tr("Devineur à l'aveugle", "Blind guess"), desc: tr("Les devineurs ne voient pas la catégorie, seulement les indices.", "Guessers don't see the category, only the clues.") },
  { id: "extreme", name: tr("Note extrême", "Extreme number"), desc: tr("La note secrète est forcément 1, 2, 9 ou 10.", "The secret number is always 1, 2, 9 or 10.") },
  { id: "milieu", name: tr("Ventre mou", "Middle of the road"), desc: tr("La note secrète est forcément entre 4 et 7.", "The secret number is always between 4 and 7.") },
  { id: "chrono", name: tr("Chrono", "Against the clock"), desc: tr("40 secondes pour donner les indices, pas une de plus.", "40 seconds to give the clues, not one more.") }
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
const VERDICTS = { 6: [tr("Jackpot !", "Jackpot!"), tr("Double ou rien… et c'est double.", "Double or nothing… and it's double.")], 3: [tr("Pile !", "Spot on!"), tr("Vous êtes sur la même longueur d'onde.", "You're on the same wavelength.")], 2: [tr("Presque !", "So close!"), tr("À une note près. Très belle lecture.", "Off by one. Great read.")], 1: [tr("Pas loin", "Not far"), tr("Pas pile, mais ça compte quand même.", "Not spot on, but it still counts.")], 0: [tr("Raté", "Missed"), tr("Les indices n'ont pas parlé à tout le monde.", "The clues didn't click for everyone.")] };
function mention(pct){
  if(pct >= .9) return [tr("Félicitations du jury", "Top of the class"), tr("Vous partagez visiblement un seul cerveau.", "You clearly share a single brain.")];
  if(pct >= .7) return [tr("Très bien", "Very good"), tr("Vous vous comprenez à demi-mot. Belle équipe.", "You barely need words. Great team.")];
  if(pct >= .5) return [tr("Assez bien", "Good"), tr("Des éclairs de génie et quelques malentendus.", "Flashes of genius and a few mix-ups.")];
  if(pct >= .3) return [tr("Peut mieux faire", "Could do better"), tr("Avez-vous déjà discuté ensemble ?", "Have you ever actually talked?")];
  return [tr("Bavardages", "Talks too much in class"), tr("Vous ne parlez pas encore la même langue. Revanche ?", "You're not speaking the same language yet. Rematch?")];
}
// Trophées de fin de partie, tirés de l'historique. Le titre change d'une partie à l'autre.
function vary(list, seed){ return list[Math.abs(seed) % list.length]; }
function awards(hist, tous){
  const h = A(hist).map(A), out = [], seed = h.reduce((a, x) => a + (+x[2] || 0) * 7 + (+x[3] || 0), 0);
  const gp = {}, gn = {};
  h.forEach(x => { gp[x[5]] = (gp[x[5]] || 0) + (+x[4] || 0); gn[x[5]] = (gn[x[5]] || 0) + 1; });
  const gk = Object.keys(gp).sort((a, b) => gp[b] - gp[a] || gn[a] - gn[b]);
  if(gk.length && gp[gk[0]] > 0) out.push([vary(tr(["Liseur(se) de pensées", "Télépathe officiel(le)", "Radar humain", "Antenne parabolique"], ["Mind reader", "Official telepath", "Human radar", "Satellite dish"]), seed), gk[0], SB.u.plural2(gp[gk[0]], "point", null, "point") + tr(" en devinant", " from guessing")]);
  const miss = h.filter(x => +x[3] > 0).sort((a, b) => Math.abs(b[2] - b[3]) - Math.abs(a[2] - a[3]))[0];
  if(miss && Math.abs(miss[2] - miss[3]) >= 3) out.push([vary(tr(["Boussole cassée", "Complètement à l'ouest", "Lecture très créative", "Antenne débranchée"], ["Broken compass", "Totally lost", "Very creative reading", "Antenna unplugged"]), seed + 1), miss[5], tr("a dit " + miss[3] + " pour un " + miss[2], "said " + miss[3] + " when it was " + miss[2])]);
  const cp = {}, cn = {};
  h.forEach(x => A(x[7]).forEach(n => { cp[n] = (cp[n] || 0) + (+x[4] || 0); cn[n] = (cn[n] || 0) + 1; }));
  const ck = Object.keys(cp).filter(n => cn[n] >= 2).map(n => [n, cp[n] / cn[n]]).sort((a, b) => b[1] - a[1]);
  if(ck.length > 1 && ck[0][1] > ck[ck.length - 1][1]){ const av = Math.round(ck[0][1] * 10) / 10; out.push([vary(tr(["Indice en or", "Boussole du groupe", "Traducteur(trice) officiel(le)", "Phare dans la nuit"], ["Golden clue", "The group's compass", "Official translator", "Lighthouse in the dark"]), seed + 2), ck[0][0], tr(String(av).replace(".", ",") + (av >= 2 ? " pts" : " pt") + (tous ? " en moyenne par devineur(se)" : " en moyenne par indice"), av + (av === 1 ? " pt" : " pts") + (tous ? " per guesser on average" : " per clue on average"))]); }
  return out;
}
function awardsHTML(a){ return a.length ? '<div class="field"><span class="eyebrow">' + tr("Trophées", "Awards") + '</span><ul class="list">' + a.map(x => '<li><span class="t" style="font-size:19px">' + esc(x[0]) + '</span><span class="by">' + esc(x[1]) + " · " + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : ""; }
const TW_TOGGLE = on => '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + on + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Une manche sur trois environ, une règle change", "About one round in three, a rule changes") + "</span></span></button></div>";
const CSS = '<style>.n10-grade{position:relative; align-self:center; width:220px; height:150px; max-width:100%; display:grid; place-items:center; color:var(--acc)}' +
  '.n10-grade svg{position:absolute; inset:0; width:100%; height:100%; overflow:visible}' +
  '.n10-grade path{fill:none; stroke:var(--acc); stroke-width:4; stroke-linecap:round; stroke-dasharray:640; animation:n10draw .7s ease-out}' +
  '.n10-grade .num{font-family:var(--f-hand); font-weight:700; font-size:104px; line-height:1}.n10-grade .num small{font-size:40px; font-weight:500}' +
  '@keyframes n10draw{from{stroke-dashoffset:640}} @media (prefers-reduced-motion:reduce){.n10-grade path{animation:none}}' +
  '.n10-ruler{display:grid; grid-template-columns:repeat(10,1fr); gap:3px}.n10-ruler div{height:50px; border-radius:8px; background:var(--soft); display:grid; place-items:center; font-family:var(--f-hand); font-size:24px; color:var(--muted)}' +
  '.n10-ruler .is-note{background:var(--acc); color:var(--card); font-weight:700}.n10-ruler .is-guess{outline:2.5px solid var(--ink); outline-offset:-2.5px; color:var(--ink); font-weight:700}' +
  '.n10-legend{display:flex; gap:16px; font-size:13px; color:var(--muted); flex-wrap:wrap}.n10-legend i{display:inline-block; width:12px; height:12px; border-radius:3px; vertical-align:-1px; margin-right:6px}' +
  '.n10-legend .ln{background:var(--acc)}.n10-legend .lg{outline:2px solid var(--ink); outline-offset:-2px}' +
  '.n10-sc{list-style:none; margin:0; padding:0; display:grid; gap:6px}.n10-sc li{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; background:var(--soft)}' +
  '.n10-sc .rk{flex:none; width:22px; height:22px; display:grid; place-items:center; border-radius:99px; background:var(--card); color:var(--muted); font-weight:800; font-size:13px}' +
  '.n10-sc .nm{flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}.n10-sc li.first .rk{background:var(--acc); color:var(--card)}' +
  '.n10-res li.ind{opacity:.85; border-top:1px dashed var(--line, var(--soft))}</style>';
const GRADE = '<svg viewBox="0 0 220 150" aria-hidden="true"><path d="M48 34 C 92 6, 190 12, 203 62 C 215 112, 120 142, 58 128 C 10 117, 6 70, 36 44 C 52 30, 80 22, 104 20"/></svg>';
function catCard(c, eyebrow, extra){
  return '<div class="card"><span class="eyebrow">' + esc(eyebrow || tr("Catégorie", "Category")) + '</span><div class="big">' + esc(c[0]) + '</div><div class="scale"><span>1 · ' + esc(c[1]) + '</span><span>10 · ' + esc(c[2]) + "</span></div>" + (extra || "") + "</div>";
}
function gradeHTML(note){ return '<div class="n10-grade">' + GRADE + '<div class="num">' + note + "<small>/10</small></div></div>"; }
function padHTML(){ let h = '<div class="pad" data-pad>'; for(let n = 1; n <= 10; n++) h += '<button type="button" data-n="' + n + '" aria-label="' + tr("Note ", "Number ") + n + '">' + n + "</button>"; return h + "</div>"; }
function rulerHTML(note, guess){ let h = '<div class="n10-ruler">'; for(let n = 1; n <= 10; n++) h += '<div class="' + (n === note ? "is-note " : "") + (n === guess ? "is-guess" : "") + '">' + n + "</div>"; return h + "</div>"; }
function legendHTML(name){ return '<div class="n10-legend"><span><i class="ln"></i>' + tr("Note secrète", "Secret number") + '</span><span><i class="lg"></i>' + tr("Proposition de " + esc(name), esc(name) + "'s guess") + "</span></div>"; }
// Libellé « changer de catégorie » (réseau et téléphone unique).
function rrLabel(rr){ return rr > 0 ? tr("Changer de catégorie (" + rr + " restant" + (rr > 1 ? "s" : "") + ")", "Change category (" + rr + " left)") : tr("Plus de changement de catégorie", "No category changes left"); }
function histTable(rows){
  return '<div class="tablewrap"><table><thead><tr><th>' + tr("Manche", "Round") + "</th><th>" + tr("Devineur", "Guesser") + '</th><th style="text-align:center">' + tr("Note", "Number") + '</th><th style="text-align:center">' + tr("Dit", "Said") + '</th><th style="text-align:center">Pts</th></tr></thead><tbody>' +
    rows.map(h => '<tr><td>' + esc(h[0]) + '<div class="sm">' + esc(h[1]) + (TW(h[6]) ? " · " + esc(TW(h[6]).name) : "") + "</div></td><td>" + esc(h[5]) + '</td><td style="text-align:center" class="hand"><b>' + esc(h[2]) + '</b></td><td style="text-align:center" class="hand">' + esc(h[3] || "—") + '</td><td style="text-align:center">+' + esc(h[4]) + "</td></tr>").join("") + "</tbody></table></div>";
}
function reportHTML(score, max){
  const [m, a] = mention(score / max);
  return '<span class="eyebrow">' + tr("Bulletin de complicité", "Team chemistry report card") + '</span><div class="report"><span class="n">' + score + '</span><span class="o">/' + max + "</span></div><b>" + tr("Mention : ", "Grade: ") + esc(m) + '</b><p class="appre">' + tr("« " + esc(a) + " »", "“" + esc(a) + "”") + "</p>";
}

/* ---------- Éditeur de catégories perso (page annexe) ---------- */
function b64e(str){ const b = new TextEncoder().encode(str); let s = ""; b.forEach(x => { s += String.fromCharCode(x); }); return btoa(s); }
function b64d(t){ return new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0))); }
function openEditor(onClose){
  SB.page(tr("Mes catégories", "My categories"), root => {
    root.innerHTML = '<p style="font-size:15px">' + tr("Ajoute tes catégories. Elles restent sur ton téléphone et, en réseau, elles sont proposées à tout le salon dans le paquet « Catégories perso ».", "Add your own categories. They stay on your phone and, when playing online, they're offered to the whole room in the “Custom categories” pack.") + "</p>" +
      '<div class="field"><label class="eyebrow" for="n10e-name">' + tr("Catégorie", "Category") + '</label><input class="txt" id="n10e-name" maxlength="90" autocomplete="off" placeholder="' + tr("Ex. Un prof du lycée", "E.g. A high school teacher") + '"></div>' +
      '<div class="row"><div class="field" style="flex:1"><label class="eyebrow" for="n10e-lo">' + tr("La note 1, c'est…", "A 1 means…") + '</label><input class="txt" id="n10e-lo" maxlength="24" autocomplete="off" placeholder="' + tr("Le pire", "The worst") + '"></div>' +
      '<div class="field" style="flex:1"><label class="eyebrow" for="n10e-hi">' + tr("La note 10, c'est…", "A 10 means…") + '</label><input class="txt" id="n10e-hi" maxlength="24" autocomplete="off" placeholder="' + tr("Le meilleur", "The best") + '"></div></div>' +
      '<button class="btn" id="n10e-add" type="button">' + tr("Ajouter la catégorie", "Add category") + '</button><p class="err" id="n10e-err" hidden></p><ul class="mine" id="n10e-list"></ul>' +
      '<div class="field"><span class="eyebrow">' + tr("Transférer mes catégories", "Transfer my categories") + '</span><button class="btn ghost" id="n10e-exp" type="button">' + tr("Exporter en code", "Export as a code") + "</button>" +
      '<label class="eyebrow" for="n10e-imp">' + tr("Importer un code reçu", "Import a code you received") + '</label><div class="row"><input class="txt" id="n10e-imp" autocomplete="off" placeholder="' + tr("Colle un code NOTE10:…", "Paste a NOTE10:… code") + '"><button class="btn ghost" id="n10e-impb" type="button" style="flex:none">' + tr("Importer", "Import") + '</button></div><p class="sm" id="n10e-msg" hidden></p></div>';
    const $ = s => root.querySelector(s);
    const msg = t => { const m = $("#n10e-msg"); m.textContent = t; m.hidden = !t; };
    function list(){
      const all = myCustom(), ul = $("#n10e-list");
      ul.innerHTML = all.length ? "" : '<li><span class="tx sm">' + tr("Aucune catégorie pour l'instant.", "No categories yet.") + "</span></li>";
      all.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="tx"><b></b><div class="sm"></div></span><button class="x" type="button">×</button>';
        li.querySelector("b").textContent = c[0]; li.querySelector(".sm").textContent = "1 · " + c[1] + "   ·   10 · " + c[2];
        const x = li.querySelector("button"); x.setAttribute("aria-label", tr("Supprimer ", "Delete ") + c[0]);
        x.addEventListener("click", () => { const a = myCustom(); a.splice(i, 1); persist({ n10custom: a }); list(); SB.refreshExtras(); });
        ul.append(li);
      });
    }
    function add(){
      const n = clean($("#n10e-name").value, 90), err = $("#n10e-err");
      if(!n){ err.textContent = tr("Donne un nom à ta catégorie, par exemple « Un prof du lycée ».", "Give your category a name, for example “A high school teacher”."); err.hidden = false; return; }
      const all = myCustom();
      if(all.length >= 100){ err.textContent = tr("Tu as atteint 100 catégories. Supprimes-en une pour en ajouter.", "You've reached 100 categories. Delete one to add another."); err.hidden = false; return; }
      err.hidden = true;
      all.push([n, clean($("#n10e-lo").value, 24) || tr("Le pire", "The worst"), clean($("#n10e-hi").value, 24) || tr("Le meilleur", "The best")]);
      persist({ n10custom: all });
      $("#n10e-name").value = ""; $("#n10e-lo").value = ""; $("#n10e-hi").value = "";
      list(); SB.refreshExtras(); $("#n10e-name").focus();
    }
    $("#n10e-add").addEventListener("click", add);
    $("#n10e-name").addEventListener("keydown", e => { if(e.key === "Enter") add(); });
    $("#n10e-exp").addEventListener("click", () => {
      const all = myCustom(); if(!all.length){ msg(tr("Crée au moins une catégorie avant d'exporter.", "Create at least one category before exporting.")); return; }
      const code = "NOTE10:" + b64e(JSON.stringify(all));
      SB.u.shareText(code, "", $("#n10e-imp"), m => msg(m === "Copié" ? tr("Code copié. Colle-le dans un message pour tes potes.", "Code copied. Paste it in a message to your friends.") : tr("Code partagé.", "Code shared.")));
    });
    $("#n10e-impb").addEventListener("click", () => {
      const raw = $("#n10e-imp").value.trim(); let got = null;
      try{ if(!raw.startsWith("NOTE10:")) throw 0; got = JSON.parse(b64d(raw.slice(7))); }catch(e){ got = null; }
      if(!Array.isArray(got)){ msg(tr("Ce code n'est pas valide. Il doit commencer par NOTE10:", "This code isn't valid. It must start with NOTE10:")); return; }
      const all = myCustom(), names = new Set(all.map(c => c[0].toLowerCase())); let n = 0;
      got.forEach(c => { const x = norm(c); if(!x || all.length >= 100 || names.has(x[0].toLowerCase())) return; names.add(x[0].toLowerCase()); all.push(x); n++; });
      persist({ n10custom: all }); $("#n10e-imp").value = ""; list(); SB.refreshExtras();
      msg(n ? SB.u.plural2(n, "catégorie ajoutée", "catégories ajoutées", "category added", "categories added") + "." : tr("Rien de nouveau : ces catégories sont déjà là.", "Nothing new: these categories are already here."));
    });
    list();
  }, onClose);
}

/* ---------- Partie en réseau ---------- */
function givers(ctx){ return ctx.ids.filter(id => id !== ctx.s.guesser && ctx.here(id)); }
function clueOf(ctx, id){ const i = ctx.input(id); return i && typeof i.t === "string" ? clean(i.t, 60) : ""; }
function drawCat(ctx){
  let deck = A(ctx.priv().deck).map(A).filter(c => c.length === 3);
  const lg = ctx.s && ctx.s.lg || "fr";
  if(!deck.length) deck = SB.u.fresh("note10:cats", buildPool(ctx.opts.packs, ctx.peers, lg));
  const c = deck.pop() || deckOf(lg).classique[0].slice();
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
  const who = ctx.players[gi].id;
  ctx.set(Object.assign({ phase: "clues", round: reroll ? s.round : s.round + 1, rr: reroll ? s.rr - 1 : s.rr, gi,
    c: drawCat(ctx), tw, note: rollNote(tw), dl: tw === "chrono" ? ctx.now() + CHRONO * 1000 : 0, guess: 0, pts: 0, k: ctx.rid() },
    s.mode === "tous" ? { ind: who, res: [], ip: 0 } : { guesser: who }));
}
/* ---------- Mode « Tout le monde devine » : un indicateur, tous les autres devinent chacun pour soi ---------- */
const MAXCL = 3;
// L'indicateur marque la moyenne (arrondie) des points de ses devineurs : plus il est clair, plus il gagne.
function indPts(res){ return res.length ? Math.round(res.reduce((a, x) => a + (+x[2] || 0), 0) / res.length) : 0; }
function tgs(ctx){ return ctx.ids.filter(id => id !== ctx.s.ind); }
function gOf(ctx, id){ const i = ctx.input(id); return i && Number.isInteger(i.n) && i.n >= 1 && i.n <= 10 ? i.n : 0; }
function clList(ctx){ const i = ctx.input(ctx.s.ind); return A(i && i.cl).map(t => typeof t === "string" ? clean(t, 60) : "").filter(Boolean).slice(0, MAXCL); }
function revealTous(ctx){
  const s = ctx.s, iname = ctx.name(s.ind), cat = A(s.c)[0];
  const res = tgs(ctx).map(id => [id, gOf(ctx, id)]).filter(x => x[1]).map(x => [x[0], x[1], points(s.note, x[1], s.tw)]);
  const ip = indPts(res), sc = Object.assign({}, s.sc);
  res.forEach(x => { sc[x[0]] = (sc[x[0]] || 0) + x[2]; });
  sc[s.ind] = (sc[s.ind] || 0) + ip;
  const gl = res.map(x => { const d = Math.abs(s.note - x[1]); return d === 0 ? { id: x[0], ev: "pile" } : d >= 3 ? { id: x[0], ev: "rate" } : null; }).filter(Boolean);
  if(res.length && !ip) gl.push({ id: s.ind, ev: "flop" });
  ctx.gage(gl, s.k);
  ctx.set({ phase: "result", res, ip, sc,
    hist: A(s.hist).concat(res.map(x => [s.round, cat, s.note, x[1], x[2], ctx.name(x[0]), s.tw || "", [iname]])),
    rh: A(s.rh).concat([[s.round, cat, s.note, iname, s.tw || "", res.map(x => [ctx.name(x[0]), x[1], x[2]]), ip]]) });
}
// Classement : [nom, points], ex aequo au même rang.
function standHTML(rows, title){
  rows = rows.slice().sort((a, b) => b[1] - a[1]);
  let rk = 0, prev = null;
  return '<div class="field"><span class="eyebrow">' + esc(title || tr("Classement", "Standings")) + '</span><ul class="n10-sc">' + rows.map((r, i) => {
    if(r[1] !== prev){ rk = i + 1; prev = r[1]; }
    return '<li' + (rk === 1 && r[1] > 0 ? ' class="first"' : "") + '><span class="rk">' + rk + '</span><span class="nm">' + esc(r[0]) + "</span><b>" + SB.u.plural2(r[1], "pt", null, "pt") + "</b></li>";
  }).join("") + "</ul></div>";
}
function rulerMulti(note, gs){ let h = '<div class="n10-ruler">'; for(let n = 1; n <= 10; n++) h += '<div class="' + (n === note ? "is-note " : "") + (gs.indexOf(n) >= 0 ? "is-guess" : "") + '">' + n + "</div>"; return h + "</div>"; }
// Résultat d'une manche : res = [[nom, note proposée, points]].
function guessesHTML(res, iname, ip, tw){
  const rows = res.slice().sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
  return '<ul class="list n10-res">' + (rows.length ? rows.map(x => '<li><span class="t">' + esc(x[0]) + '</span><span class="by">' + tr("a dit ", "said ") + '<b class="hand">' + x[1] + "</b> · " + esc((VERDICTS[x[2]] || VERDICTS[0])[0]) + " · +" + x[2] + "</span></li>").join("") : '<li><span class="by">' + tr("Personne n'a proposé de note.", "Nobody guessed a number.") + "</span></li>") +
    '<li class="ind"><span class="t">' + esc(iname) + '</span><span class="by">' + tr("indicateur(trice) · moyenne de ses devineurs · +", "clue-giver · average of their guessers · +") + ip + "</span></li></ul>";
}
function roundTable(rh){
  return '<div class="tablewrap"><table><thead><tr><th>' + tr("Manche", "Round") + "</th><th>" + tr("Indicateur", "Clue-giver") + '</th><th style="text-align:center">' + tr("Note", "Number") + "</th><th>" + tr("Propositions", "Guesses") + "</th></tr></thead><tbody>" +
    A(rh).map(A).map(h => '<tr><td>' + esc(h[0]) + '<div class="sm">' + esc(h[1]) + (TW(h[4]) ? " · " + esc(TW(h[4]).name) : "") + "</div></td><td>" + esc(h[3]) + '<div class="sm">+' + esc(h[6]) + '</div></td><td style="text-align:center" class="hand"><b>' + esc(h[2]) + "</b></td><td>" +
      (A(h[5]).length ? A(h[5]).map(A).map(x => esc(x[0]) + " " + esc(x[1]) + ' <span class="sm">(+' + esc(x[2]) + ")</span>").join("<br>") : "—") + "</td></tr>").join("") + "</tbody></table></div>";
}
// "Alice, Bob and Chloe"
const andList = a => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a.join("");
const etList = a => a.length > 1 ? a.slice(0, -1).join(", ") + " et " + a[a.length - 1] : a.join("");
// Titre de fin du mode « tout le monde devine » : « Alice et Bob gagnent » / "Alice and Bob win".
function winHTML(top){ return top.length ? tr(esc(etList(top)) + (top.length > 1 ? " gagnent" : " gagne"), esc(andList(top)) + (top.length > 1 ? " win" : " wins")) : tr("Personne ne marque", "Nobody scored"); }
function topOf(rows){ const m = Math.max(0, ...rows.map(r => r[1])); return m > 0 ? rows.filter(r => r[1] === m).map(r => r[0]) : []; }
function scoreRows(ctx){
  const sc = ctx.s.sc || {}, ids = ctx.ids.slice();
  Object.keys(sc).forEach(id => { if(ids.indexOf(id) < 0) ids.push(id); });
  return ids.map(id => [ctx.name(id), +sc[id] || 0, id]);
}
const hiddenCard = '<div class="card"><span class="eyebrow">' + tr("Catégorie", "Category") + '</span><div class="big">' + tr("Cachée !", "Hidden!") + '</div><div class="scale"><span>1</span><span>10</span></div></div>';
let clK = "", clV = [];

function hostTous(ctx){
  const s = ctx.s;
  if(s.phase === "clues"){
    const i = ctx.input(s.ind);
    if(i && i.rr === s.rr && s.rr > 0){ nextRound(ctx, true); return; }
    if((i && i.go && clList(ctx).length) || (s.dl && ctx.now() >= s.dl)) ctx.set({ phase: "guess" });
  } else if(s.phase === "guess"){
    const live = tgs(ctx).filter(id => ctx.here(id));
    if(live.length && live.every(id => gOf(ctx, id))) revealTous(ctx);
  }
}
function renderTous(ctx, root){
  const s = ctx.s, c = view(s.c, s.tw), isI = s.ind === ctx.me, iName = ctx.name(s.ind), playing = ctx.ids.indexOf(ctx.me) >= 0;
  const label = '<span class="eyebrow">' + tr("Manche ", "Round ") + s.round + " / " + s.rounds + tr(" · indicateur : ", " · clue-giver: ") + esc(iName) + "</span>" + SB.u.twistHTML(TW(s.tw));
  const hostBox = '<div class="dock" data-hostbox></div>';
  const one = s.tw === "mot";
  const clues = () => { const l = clList(ctx); return l.length ? l.map(t => '<li><span class="t">' + esc(t) + "</span></li>").join("") : '<li><span class="by">' + esc(iName) + tr(" n'a pas encore donné d'indice.", " hasn't given a clue yet.") + "</span></li>"; };
  const chips = () => tgs(ctx).map(id => { const ok = !!gOf(ctx, id); return '<span class="chip' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + esc(ctx.name(id)) + (ctx.here(id) ? "" : tr(" (parti)", " (left)")) + "</span>"; }).join("");
  const sync = (sel, html) => { const e = root.querySelector(sel); if(e && e.innerHTML !== html) e.innerHTML = html; };
  const hostButtons = (key, html, bind) => {
    const hb = root.querySelector("[data-hostbox]"); if(!hb) return;
    if(!ctx.isHost){ if(hb.innerHTML) hb.innerHTML = ""; return; }
    if(hb.dataset.k === key) return;
    hb.dataset.k = key; hb.innerHTML = html; bind(hb);
  };
  const skip = c2 => { if(c2.s.phase === "clues" || c2.s.phase === "guess"){ c2.set({ rh: A(c2.s.rh).concat([[c2.s.round, A(c2.s.c)[0], c2.s.note, c2.name(c2.s.ind), c2.s.tw || "", [], 0]]) }); nextRound(c2); } };
  if(s.phase === "clues"){
    if(isI){
      if(clK !== s.k){ clK = s.k; clV = A(ctx.mine() && ctx.mine().cl).slice(0, MAXCL); }
      screen(root, "ic" + s.k, CSS + label + (s.dl ? '<div class="timer" data-t></div>' : "") + catCard(c, tr("Catégorie", "Category"), gradeHTML(s.note)) +
        '<p class="howto">' + tr("Tu es l'indicateur(trice). Donne <b>1 à " + MAXCL + " " + (one ? "indices d'un seul mot" : "exemples") + "</b> qui valent cette note pour toi. Sans chiffre. Tous les autres devinent.", "You're the clue-giver. Give <b>1 to " + MAXCL + " " + (one ? "single words" : "examples") + "</b> that are worth this number to you. No digits. Everyone else guesses.") + "</p>" +
        '<div class="field" data-form><label class="eyebrow" for="n10-in">' + tr("Indice", "Clue") + '</label><div class="row"><input class="txt" id="n10-in" maxlength="60" autocomplete="off" placeholder="' + (one ? tr("Un seul mot", "One word only") : tr("Un exemple, sans chiffre", "An example, no digits")) + '"><button class="btn ghost" type="button" data-add style="flex:none">' + tr("Ajouter", "Add") + '</button></div><p class="err" data-err hidden></p></div>' +
        '<ul class="mine" data-mine></ul>' + SB.u.dock('<button class="btn acc" type="button" data-go disabled>' + tr("Faire deviner", "Send clues") + '</button><button class="link" type="button" data-rr style="align-self:center"' + (s.rr > 0 ? "" : " disabled") + ">" + rrLabel(s.rr) + "</button>") + hostBox, r => {
        const inp = r.querySelector("#n10-in"), err = r.querySelector("[data-err]");
        const bad = m => { err.textContent = m; err.hidden = false; };
        const add = () => {
          const t = clean(inp.value, 60);
          if(!t) return bad(tr("Écris un exemple avant d'ajouter.", "Write an example before adding it."));
          if(/[0-9]/.test(t)) return bad(tr("Pas de chiffres dans l'indice, c'est trop facile.", "No digits in your clue, that's too easy."));
          if(one && /\s/.test(t)) return bad(tr("Coup de théâtre : un seul mot, sans espace.", "Plot twist: one word only, no spaces."));
          if(clV.length >= MAXCL) return bad(tr(MAXCL + " indices maximum. Retire-en un pour changer.", MAXCL + " clues max. Remove one to change it."));
          err.hidden = true; clV = clV.concat([t]); inp.value = ""; ctx.send({ cl: clV, go: false }); inp.focus();
        };
        r.querySelector("[data-add]").addEventListener("click", add);
        inp.addEventListener("keydown", e => { if(e.key === "Enter") add(); });
        r.querySelector("[data-mine]").addEventListener("click", e => {
          const b = e.target.closest("[data-x]"); if(!b) return;
          clV = clV.filter((_, j) => j !== +b.dataset.x); ctx.send({ cl: clV, go: false });
        });
        r.querySelector("[data-go]").addEventListener("click", () => { if(!clV.length) return; ctx.send({ cl: clV, go: true }); });
        r.querySelector("[data-rr]").addEventListener("click", () => { if(s.rr > 0) ctx.send({ rr: s.rr }); });
      });
      const sent = ctx.mine() && ctx.mine().go;
      sync("[data-mine]", clV.map((t, j) => '<li><span class="tx"><b>' + esc(t) + '</b></span><button class="x" type="button" data-x="' + j + '" aria-label="' + tr("Retirer ", "Remove ") + esc(t) + '">×</button></li>').join(""));
      const go = root.querySelector("[data-go]");
      go.disabled = !clV.length || !!sent; go.textContent = sent ? tr("Indices envoyés", "Clues sent") : tr("Faire deviner (", "Send clues (") + SB.u.plural2(clV.length, "indice", null, "clue") + ")";
      root.querySelector("[data-form]").hidden = clV.length >= MAXCL || !!sent;
    } else {
      screen(root, "wc" + s.k, CSS + label + (s.dl ? '<div class="timer" data-t></div>' : "") + (s.tw === "aveugle" ? hiddenCard : catCard(c)) +
        '<div class="pass"><span class="eyebrow">' + (playing ? tr("Tu devines", "You're guessing") : tr("Spectateur", "Spectator")) + '</span><div class="who">' + esc(iName) + "</div><p>" + tr("regarde la note secrète et prépare ses indices.", "is looking at the secret number and preparing clues.") + "</p></div>" +
        '<div class="field"><span class="eyebrow">' + tr("Indices", "Clues") + '</span><ul class="list" data-clues></ul></div>' + hostBox);
      sync("[data-clues]", clues());
    }
    if(s.dl){ const left = Math.max(0, Math.ceil((s.dl - ctx.now()) / 1000)), t = txt(root, "[data-t]", left); if(t) t.classList.toggle("low", left <= 10); }
    const gone = !ctx.here(s.ind);
    hostButtons(s.k + "|" + gone, gone ? '<button class="link warn" type="button" data-skip style="align-self:center">' + tr("L'indicateur(trice) est parti(e) : passer la manche", "The clue-giver left, skip the round") + "</button>" : "", hb => {
      const b = hb.querySelector("[data-skip]"); if(b) b.addEventListener("click", () => ctx.act(skip));
    });
  } else if(s.phase === "guess"){
    const isG = !isI && playing;
    screen(root, "tg" + s.k + isG, CSS + label + (isI ? catCard(c, tr("Catégorie", "Category"), gradeHTML(s.note)) : s.tw === "aveugle" ? hiddenCard : catCard(c)) +
      '<div class="field"><span class="eyebrow">' + tr("Les indices de " + esc(iName), esc(iName) + "'s clues") + '</span><ul class="list" data-clues></ul></div>' +
      (isG ? '<div class="field"><span class="eyebrow">' + tr("Quelle est sa note secrète ?", "What number do they have in mind?") + "</span>" + padHTML() + "</div>" + SB.u.dock('<button class="btn acc" type="button" data-val disabled>' + tr("Valider ma note", "Lock in my guess") + "</button>") : "") +
      '<div class="field"><span class="eyebrow">' + tr("Notes reçues", "Guesses in") + '</span><div class="chips" data-chips></div></div>' + (isG ? "" : SB.u.dock('<p class="wait">' + tr("Tout le monde réfléchit…", "Everyone's thinking…") + "</p>")) + hostBox, r => {
      if(pickK !== s.k){ pickK = s.k; pickN = gOf(ctx, ctx.me); }
      const v = r.querySelector("[data-val]");
      const mark = () => r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === pickN));
      r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { pickN = +b.dataset.n; mark(); if(v){ v.disabled = false; v.textContent = tr("Valider ma note", "Lock in my guess"); } }));
      if(v) v.addEventListener("click", () => { if(!pickN) return; ctx.send({ n: pickN }); v.disabled = true; v.textContent = tr("Note envoyée : ", "Guess sent: ") + pickN; });
      if(pickN){ mark(); if(v){ v.disabled = true; v.textContent = tr("Note envoyée : ", "Guess sent: ") + pickN; } }
    });
    sync("[data-clues]", clues());
    sync("[data-chips]", chips());
    const n = tgs(ctx).filter(id => gOf(ctx, id)).length, gone = !ctx.here(s.ind);
    hostButtons(s.k + "|" + (n > 0) + "|" + gone, '<button class="btn ghost" type="button" data-rev' + (n ? "" : " disabled") + ">" + tr("Révéler sans attendre les autres", "Reveal without waiting for the rest") + "</button>" +
      (gone && !n ? '<button class="link warn" type="button" data-skip style="align-self:center">' + tr("L'indicateur(trice) est parti(e) : passer la manche", "The clue-giver left, skip the round") + "</button>" : ""), hb => {
      hb.querySelector("[data-rev]").addEventListener("click", () => ctx.act(c2 => { if(c2.s.phase === "guess") revealTous(c2); }));
      const b = hb.querySelector("[data-skip]"); if(b) b.addEventListener("click", () => ctx.act(skip));
    });
  } else if(s.phase === "result"){
    const res = A(s.res).map(A), mine = res.find(x => x[0] === ctx.me);
    const head = isI ? "+" + s.ip + tr(" pour toi", " for you") : mine ? (VERDICTS[mine[2]] || VERDICTS[0])[0] + " +" + mine[2] : tr("La note était ", "The number was ") + s.note;
    screen(root, "tr" + s.k + ctx.isHost, CSS + label + '<div class="verdict">' + esc(head) + '</div><p style="font-size:17px">' + tr("La note de " + esc(iName) + " était <b>" + s.note + "</b>" + (mine ? ", tu as dit " + mine[1] : ""), esc(iName) + "'s number was <b>" + s.note + "</b>" + (mine ? ", you said " + mine[1] : "")) + ".</p>" +
      '<div class="card"><div class="big" style="font-size:22px">' + esc(c[0]) + "</div>" + rulerMulti(s.note, res.map(x => x[1])) + '<div class="n10-legend"><span><i class="ln"></i>' + tr("Note secrète", "Secret number") + '</span><span><i class="lg"></i>' + tr("Notes proposées", "Guesses") + "</span></div></div>" +
      guessesHTML(res.map(x => [ctx.name(x[0]), x[1], x[2]]), iName, s.ip, s.tw) + standHTML(scoreRows(ctx), tr("Classement", "Standings")) +
      SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le classement final", "See final standings") : tr("Manche suivante", "Next round")) + "</button>" : '<p class="wait">' + tr("L'hôte lance la suite…", "The host is starting the next part…") + "</p>"), r => {
      const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c2 => { if(c2.s.phase === "result") nextRound(c2); }));
    });
  } else if(s.phase === "end"){
    const rows = scoreRows(ctx), top = topOf(rows);
    screen(root, "tend" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Fin de partie", "Game over") + '</span><div class="verdict">' + winHTML(top) + "</div>" +
      standHTML(rows, tr("Classement final", "Final standings")) + awardsHTML(awards(s.hist, true)) + roundTable(s.rh) +
      SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
      const b = r.querySelector("[data-back]");
      if(b) b.addEventListener("click", () => ctx.act(c2 => {
        const R = scoreRows(c2).sort((a, b2) => b2[1] - a[1]), m = R.length ? R[0][1] : 0, W = R.filter(x => x[1] === m).map(x => x[0]);
        c2.end({ title: m > 0 ? tr(etList(W) + " en tête avec " + SB.u.plural(m, "point"), andList(W) + (W.length > 1 ? " lead" : " leads") + " with " + SB.u.plural2(m, "point", null, "point")) : tr("Personne n'a marqué", "Nobody scored"),
          lines: R.slice(0, 5).map(x => x[0] + tr(" : ", ": ") + SB.u.plural2(x[1], "pt", null, "pt")).concat(awards(c2.s.hist, true).map(a => a[0] + tr(" : ", ": ") + a[1])),
          win: m > 0 ? R.filter(x => x[1] === m).map(x => x[2]) : [] });
      }));
    });
  }
}

function histRow(ctx, guess, pts){ const s = ctx.s; return [s.round, A(s.c)[0], s.note, guess, pts, ctx.name(s.guesser), s.tw || "", ctx.ids.filter(id => id !== s.guesser && clueOf(ctx, id)).map(ctx.name)]; }
let pickN = 0, pickK = "";

SB.register({
  id: "note10", name: tr("Note sur 10", "Out of 10"), glyph: "7/10", pitch: tr("Fais deviner une note secrète sur 10 avec des exemples.", "Get others to guess a secret number out of 10 using examples."), hot: true, ticks: true,
  accent: { light: "#ff7b5c", dark: "#ff7b5c" },
  tag: tr("Une catégorie, une note secrète. Faites-la deviner avec des exemples.", "One category, one secret number. Get it guessed with examples."),
  min: 2, max: 12,
  gages: [
    { ev: "rate", label: tr("Note ratée (écart de 3 ou plus)", "Missed the score (by 3 or more)"), kind: "boit", n: 2 },
    { ev: "pile", label: tr("Note pile", "Spot on"), kind: "distribue", n: 2 },
    { ev: "flop", label: tr("Indicateur(trice) : personne n'a marqué", "Clue giver: nobody scored"), kind: "boit", n: 2 }
  ],
  rules: [
    tr("Tout le monde devine (par défaut) : à chaque manche, un(e) indicateur(trice) voit une catégorie et une note secrète de 1 à 10. Il (elle) donne 1 à 3 exemples qui valent cette note pour lui (elle), sans chiffre.", "Everyone guesses (default): each round, a clue-giver sees a category and a secret number from 1 to 10. They give 1 to 3 examples that are worth that number to them, with no digits."),
    tr("Tous les autres proposent une note en secret, chacun pour soi. Pile : 3 points. À 1 près : 2. À 2 près : 1.", "Everyone else secretly guesses a number, each on their own. Spot on: 3 points. Off by 1: 2. Off by 2: 1."),
    tr("L'indicateur(trice) marque la moyenne (arrondie) des points de ses devineurs : plus ses indices sont clairs, plus il (elle) gagne. Le rôle tourne à chaque manche. Le meilleur score gagne.", "The clue-giver scores the (rounded) average of their guessers' points: the clearer the clues, the more they score. The role rotates every round. Highest score wins."),
    tr("Un seul devineur : un joueur devine, tous les autres écrivent chacun un indice. Le score est collectif.", "Single guesser: one player guesses, everyone else writes one clue each. The score is shared by the team."),
    tr("Coups de théâtre : une manche sur trois environ, une règle change (note inversée, un seul mot, double ou rien, chrono…).", "Plot twists: about one round in three, a rule changes (flipped scale, one word only, double or nothing, against the clock…)."),
    tr("Les catégories déjà jouées sur ce téléphone reviennent en dernier.", "Categories already played on this phone come back last.")
  ],
  presence: () => myCustom().slice(0, 50),
  options: [
    { id: "mode", label: "Mode", type: "seg", def: "tous", values: [{ v: "tous", label: tr("Tout le monde devine", "Everyone guesses") }, { v: "un", label: tr("Un seul devineur", "Single guesser") }] },
    { id: "rounds", label: tr("Manches", "Rounds"), type: "seg", def: 6, values: [{ v: 4, label: "4" }, { v: 6, label: "6" }, { v: 10, label: "10" }] },
    { id: "packs", label: tr("Catégories", "Categories"), type: "multi", def: ["classique"],
      values: ctx => PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.v === "perso" ? sharedCustom(ctx.peers).length : catsOf(p, SB.lang()).length })) },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Une manche sur trois environ, une règle change", "About one round in three, a rule changes"), def: true },
    { id: "edit", type: "button", label: tr("Créer mes propres catégories", "Create my own categories"), onClick: () => openEditor() }
  ],
  start(ctx, o){
    const lg = SB.lang(), pool = buildPool(o.packs, ctx.peers, lg);
    if(!pool.length) throw new Error(tr("Choisis au moins un paquet de catégories.", "Pick at least one category pack."));
    const deck = SB.u.fresh("note10:cats", pool), c = deck.pop();
    ctx.setPriv({ deck }); SB.u.saw("note10:cats", [c]);
    const gi = Math.floor(Math.random() * ctx.players.length);
    if(o.mode !== "un") return { phase: "clues", lg, mode: "tous", round: 1, rounds: o.rounds || 6, gi, ind: ctx.players[gi].id, c, tw: "", dl: 0, note: rollNote(""), rr: 2, sc: {}, res: [], ip: 0, hist: [], rh: [] };
    return { phase: "clues", lg, round: 1, rounds: o.rounds || 6, gi, guesser: ctx.players[gi].id, c, tw: "", dl: 0, note: rollNote(""), rr: 2, score: 0, max: 0, guess: 0, pts: 0, hist: [] };
  },
  host(ctx){
    const s = ctx.s;
    if(s.mode === "tous") return hostTous(ctx);
    if(s.phase === "clues"){
      const gv = givers(ctx);
      if((gv.length && gv.every(id => clueOf(ctx, id))) || (s.dl && ctx.now() >= s.dl)) ctx.set({ phase: "guess" });
    } else if(s.phase === "guess"){
      const i = ctx.input(s.guesser);
      if(i && Number.isInteger(i.n) && i.n >= 1 && i.n <= 10){
        const pts = points(s.note, i.n, s.tw), dd = Math.abs(s.note - i.n);
        if(dd === 0 || dd >= 3) ctx.gage([{ id: s.guesser, ev: dd === 0 ? "pile" : "rate" }], s.k);
        ctx.set({ phase: "result", guess: i.n, pts, score: s.score + pts, max: (+s.max || 0) + rmax(s.tw), hist: A(s.hist).concat([histRow(ctx, i.n, pts)]) });
      }
    }
  },
  render(ctx, root){
    if(ctx.s.mode === "tous") return renderTous(ctx, root);
    const s = ctx.s, c = view(s.c, s.tw), isG = s.guesser === ctx.me, gName = ctx.name(s.guesser);
    const label = '<span class="eyebrow">' + tr("Manche ", "Round ") + s.round + " / " + s.rounds + tr(" · devineur : ", " · guesser: ") + esc(gName) + "</span>" + SB.u.twistHTML(TW(s.tw));
    const hostBox = '<div class="dock" data-hostbox></div>';
    const timer = s.dl && s.phase === "clues" ? '<div class="timer" data-t></div>' : "";
    if(s.phase === "clues"){
      if(isG){
        screen(root, "cg" + s.k, CSS + label + timer + '<div class="pass"><span class="eyebrow">' + tr("C'est toi qui devines", "You're the guesser") + '</span><div class="who">' + tr("Patience…", "Hang on…") + "</div><p>" + tr("Tes coéquipiers regardent la note secrète et écrivent leurs indices.", "Your teammates are looking at the secret number and writing their clues.") + '</p></div><div class="field"><span class="eyebrow">' + tr("Indices envoyés", "Clues sent") + '</span><div class="chips" data-chips></div></div>' + hostBox);
      } else {
        const one = s.tw === "mot";
        screen(root, "cc" + s.k, CSS + label + timer + catCard(c, tr("Catégorie", "Category"), gradeHTML(s.note)) +
          '<p class="howto">' + tr("Donne <b>" + (one ? "un seul mot" : "une réponse") + "</b> qui vaut cette note pour toi" + (one ? "" : " : un exemple, une phrase") + ". Sans chiffre.", "Give <b>" + (one ? "a single word" : "an answer") + "</b> that's worth this number to you" + (one ? "" : ": an example, a phrase") + ". No digits.") + "</p>" +
          '<div class="field" data-form><label class="eyebrow" for="n10-in">' + tr("Ton indice", "Your clue") + '</label><div class="row"><input class="txt" id="n10-in" maxlength="60" autocomplete="off" placeholder="' + (one ? tr("Un seul mot", "One word only") : tr("Ta réponse, sans chiffre", "Your answer, no digits")) + '"><button class="btn acc" type="button" data-send style="flex:none">' + tr("Envoyer", "Send") + '</button></div><p class="err" data-err hidden></p></div>' +
          '<div class="sent" data-sent hidden><span class="t" data-senttxt></span><button class="link" type="button" data-edit>' + tr("Modifier", "Edit") + "</button></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Indices envoyés", "Clues sent") + '</span><div class="chips" data-chips></div></div>' + hostBox, r => {
          const inp = r.querySelector("#n10-in"), err = r.querySelector("[data-err]");
          const send = () => {
            const t = clean(inp.value, 60);
            if(!t){ err.textContent = tr("Écris un exemple avant d'envoyer.", "Write an example before sending."); err.hidden = false; return; }
            if(/[0-9]/.test(t)){ err.textContent = tr("Pas de chiffres dans l'indice, c'est trop facile.", "No digits in your clue, that's too easy."); err.hidden = false; return; }
            if(one && /\s/.test(t)){ err.textContent = tr("Coup de théâtre : un seul mot, sans espace.", "Plot twist: one word only, no spaces."); err.hidden = false; return; }
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
      const chips = ctx.ids.filter(id => id !== s.guesser).map(id => { const ok = !!clueOf(ctx, id); return '<span class="chip' + (ok ? " ok" : "") + '">' + (ok ? "✓ " : "") + esc(ctx.name(id)) + (ctx.here(id) ? "" : tr(" (parti)", " (left)")) + "</span>"; }).join("");
      if(ch.innerHTML !== chips) ch.innerHTML = chips;
      const hb = root.querySelector("[data-hostbox]");
      if(ctx.isHost){
        const hk = s.k + "|" + s.rr + "|" + givers(ctx).some(id => clueOf(ctx, id));
        if(hb.dataset.k !== hk){
          hb.dataset.k = hk;
          const any = givers(ctx).some(id => clueOf(ctx, id));
          hb.innerHTML = '<button class="btn ghost" type="button" data-force' + (any ? "" : " disabled") + ">" + tr("Montrer les indices au (à la) devineur(se)", "Show the clues to the guesser") + "</button>" +
            '<button class="link" type="button" data-reroll style="align-self:center"' + (s.rr > 0 ? "" : " disabled") + ">" + rrLabel(s.rr) + "</button>";
          hb.querySelector("[data-force]").addEventListener("click", () => ctx.act(c2 => { if(c2.s.phase === "clues") c2.set({ phase: "guess" }); }));
          hb.querySelector("[data-reroll]").addEventListener("click", () => ctx.act(c2 => { if(c2.s.rr > 0 && c2.s.phase === "clues") nextRound(c2, true); }));
        }
      } else if(hb.innerHTML) hb.innerHTML = "";
    } else if(s.phase === "guess"){
      const blind = isG && s.tw === "aveugle";
      screen(root, "gu" + s.k, CSS + label + (blind ? hiddenCard : catCard(c)) + '<div class="field"><span class="eyebrow">' + tr("Les indices", "The clues") + '</span><ul class="list" data-clues></ul></div>' +
        (isG ? '<div class="field"><span class="eyebrow">' + tr("Quelle note ont-ils en tête ?", "What number do they have in mind?") + "</span>" + padHTML() + '</div>' + SB.u.dock('<button class="btn acc" type="button" data-val disabled>' + tr("Valider ma note", "Lock in my guess") + "</button>") : SB.u.dock('<p class="wait">' + esc(gName) + tr(" réfléchit…", " is thinking…") + "</p>")) +
        '<button class="link warn" type="button" data-skip hidden style="align-self:center">' + tr("Le (la) devineur(se) est parti(e) : passer la manche", "The guesser left, skip the round") + "</button>", r => {
        if(pickK !== s.k){ pickK = s.k; pickN = 0; }
        r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => {
          pickN = +b.dataset.n; r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === pickN)); r.querySelector("[data-val]").disabled = false;
        }));
        const v = r.querySelector("[data-val]");
        if(v) v.addEventListener("click", () => { if(!pickN) return; ctx.send({ n: pickN }); v.disabled = true; v.textContent = tr("Note envoyée", "Guess sent"); });
        r.querySelector("[data-skip]").addEventListener("click", () => ctx.act(c2 => {
          c2.set({ hist: A(c2.s.hist).concat([histRow(c2, 0, 0)]), max: (+c2.s.max || 0) + rmax(c2.s.tw) }); nextRound(c2);
        }));
      });
      const items = ctx.ids.filter(id => id !== s.guesser).map(id => ({ id, t: clueOf(ctx, id) })).filter(x => x.t);
      const html = items.length ? items.map(x => '<li><span class="t">' + esc(x.t) + '</span><span class="by">' + esc(ctx.name(x.id)) + "</span></li>").join("") : '<li><span class="by">' + tr("Aucun indice pour cette manche.", "No clues this round.") + "</span></li>";
      const ul = root.querySelector("[data-clues]"); if(ul.innerHTML !== html) ul.innerHTML = html;
      root.querySelector("[data-skip]").hidden = !(ctx.isHost && !ctx.here(s.guesser));
    } else if(s.phase === "result"){
      const v = VERDICTS[s.pts] || VERDICTS[0];
      screen(root, "re" + s.k + ctx.isHost, CSS + label + '<div class="verdict">' + esc(v[0]) + " +" + s.pts + '</div><p style="font-size:17px">' + tr("La note était " + s.note + ", " + esc(gName) + " a dit " + s.guess + ". ", "The number was " + s.note + ", " + esc(gName) + " said " + s.guess + ". ") + esc(v[1]) + "</p>" +
        '<div class="card"><div class="big" style="font-size:22px">' + esc(c[0]) + "</div>" + rulerHTML(s.note, s.guess) + legendHTML(gName) + "</div>" +
        '<div class="tally"><span>' + tr("Score de l'équipe", "Team score") + "</span><b>" + s.score + " / " + (+s.max || s.round * 3) + "</b></div>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le bulletin", "See the report card") : tr("Manche suivante", "Next round")) + "</button>" : '<p class="wait">' + tr("L'hôte lance la suite…", "The host is starting the next part…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c2 => { if(c2.s.phase === "result") nextRound(c2); }));
      });
    } else if(s.phase === "end"){
      const max = +s.max || s.rounds * 3;
      screen(root, "end" + ctx.isHost, CSS + reportHTML(s.score, max) + awardsHTML(awards(s.hist)) + histTable(A(s.hist).map(A)) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c2 => {
          const mx = +c2.s.max || c2.s.rounds * 3, pct = c2.s.score / mx;
          c2.end({ title: tr("Score de l'équipe : ", "Team score: ") + c2.s.score + " / " + mx, lines: [tr("Mention : ", "Grade: ") + mention(pct)[0]].concat(awards(c2.s.hist).map(a => a[0] + tr(" : ", ": ") + a[1])), win: pct >= .5 ? c2.ids : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 2, max: 12 },
    start(root, api){
      const names = api.names;
      const L = { phase: "setup", rounds: [4, 6, 10].indexOf(store().n10rounds) >= 0 ? store().n10rounds : 6, packs: A(store().n10packs).length ? A(store().n10packs) : ["classique"], twOn: store().n10tw !== false, mode: store().n10mode === "un" ? "un" : "tous",
        sc: {}, order: [], qi: 0, res: [], rh: [], round: 0, gi: 0, deck: [], c: null, note: 0, guess: 0, rr: 2, score: 0, max: 0, hist: [], tw: "", dl: 0 };
      const startTous = () => { L.order = names.map((_, i) => names[(L.gi + 1 + i) % names.length]).filter(n => n !== names[L.gi]); L.qi = 0; L.res = []; };
      const lg = SB.lang();
      const draw = () => { if(!L.deck.length) L.deck = SB.u.fresh("note10:cats", buildPool(SB.okPacks(L.packs, PACKS), [], lg)); L.c = L.deck.pop() || deckOf(lg).classique[0].slice(); SB.u.saw("note10:cats", [L.c]); L.note = rollNote(L.tw); };
      const go = () => {
        const g = names[L.gi], c = view(L.c || ["", "", ""], L.tw);
        const lab = '<span class="eyebrow">' + tr("Manche ", "Round ") + L.round + " / " + L.rounds + "</span>" + SB.u.twistHTML(TW(L.tw));
        if(L.phase === "setup"){
          screen(root, "setup" + JSON.stringify([L.rounds, L.packs, L.twOn, L.mode]), CSS + '<div class="field"><span class="eyebrow">Mode</span><div class="seg">' + [["tous", tr("Tout le monde devine", "Everyone guesses")], ["un", tr("Un seul devineur", "Single guesser")]].map(m => '<button type="button" data-m="' + m[0] + '" aria-pressed="' + (m[0] === L.mode) + '">' + m[1] + "</button>").join("") + '</div><p class="sm" style="margin:6px 0 0">' + (L.mode === "tous" ? tr("Un(e) indicateur(trice) donne les exemples, tous les autres devinent chacun pour soi.", "One clue-giver gives examples, everyone else guesses on their own.") : tr("Un(e) devineur(se), tous les autres donnent un indice. Score d'équipe.", "One guesser, everyone else gives a clue. Team score.")) + "</p></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Manches", "Rounds") + '</span><div class="seg">' + [4, 6, 10].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (n === L.rounds) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Catégories", "Categories") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => { const n = p.v === "perso" ? myCustom().length : catsOf(p, lg).length; return '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (L.packs.indexOf(p.v) >= 0 && n > 0) + '"' + (n ? "" : " disabled") + '><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.v === "perso" ? tr("Celles que tu as créées", "The ones you've created") : p.desc) + '</span></span><span class="ct">' + n + "</span></button>"; }).join("") + "</div>" +
            '<button class="link" type="button" data-edit style="align-self:flex-start">' + tr("Créer mes propres catégories", "Create my own categories") + "</button></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variante", "Variant") + "</span>" + TW_TOGGLE(L.twOn) + "</div>" +
            '<p class="howto">' + (L.mode === "tous" ? tr("L'indicateur(trice) dit ses exemples à voix haute, puis chacun entre sa note en secret sur le téléphone.", "The clue-giver says their examples out loud, then everyone enters their guess in secret on the phone.") : tr("Les indices se disent à voix haute, et on se passe le téléphone entre le groupe et le (la) devineur(se).", "Clues are said out loud, and the phone gets passed between the group and the guesser.")) + "</p>" + '<div class="dock"><p class="err" data-err hidden></p><button class="btn acc" type="button" data-go>' + tr("Commencer la partie", "Start the game") + "</button></div>", r => {
            r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { L.mode = b.dataset.m; persist({ n10mode: L.mode }); go(); }));
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { L.rounds = +b.dataset.r; persist({ n10rounds: L.rounds }); go(); }));
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = L.packs.indexOf(b.dataset.p); if(i >= 0) L.packs.splice(i, 1); else L.packs.push(b.dataset.p); persist({ n10packs: L.packs }); go(); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { L.twOn = !L.twOn; persist({ n10tw: L.twOn }); go(); });
            r.querySelector("[data-edit]").addEventListener("click", () => openEditor(() => { root.dataset.key = ""; go(); }));
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!buildPool(SB.okPacks(L.packs, PACKS), [], lg).length){ const e = r.querySelector("[data-err]"); e.textContent = tr("Choisis au moins un paquet de catégories.", "Pick at least one category pack."); e.hidden = false; return; }
              L.round = 1; L.score = 0; L.max = 0; L.hist = []; L.rr = 2; L.tw = ""; L.gi = Math.floor(Math.random() * names.length); L.sc = {}; L.rh = []; names.forEach(n => { L.sc[n] = 0; }); L.deck = SB.u.fresh("note10:cats", buildPool(SB.okPacks(L.packs, PACKS), [], lg)); draw(); startTous(); L.phase = L.mode === "tous" ? "ipass" : "team"; go();
            });
          });
        } else if(L.phase === "ipass"){
          screen(root, "ipass" + L.round, lab + '<div class="pass"><span class="eyebrow">' + tr("Indicateur(trice) de la manche", "This round's clue-giver") + '</span><div class="who">' + esc(g) + "</div><p>" + tr("Donnez le téléphone à <b>" + esc(g) + "</b>. Personne d'autre ne regarde l'écran : la catégorie et la note secrète vont s'afficher.", "Hand the phone to <b>" + esc(g) + "</b>. Only they look at the screen: they'll see the category and the secret number.") + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("C'est moi, montrer la note", "It's me, show the number") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.dl = L.tw === "chrono" ? Date.now() + CHRONO * 1000 : 0; L.phase = "iclue"; go(); });
          });
        } else if(L.phase === "iclue"){
          screen(root, "iclue" + L.round + c[0] + L.rr, CSS + lab + (L.dl ? '<div class="timer" data-t>' + CHRONO + "</div>" : "") + catCard(c, tr("Catégorie", "Category"), gradeHTML(L.note)) +
            '<p class="howto">' + tr("Dis à voix haute <b>1 à " + MAXCL + " " + (L.tw === "mot" ? "indices d'un seul mot" : "exemples") + "</b> qui valent cette note pour toi. Sans chiffre" + (L.tw === "aveugle" ? ", et sans dire la catégorie" : ""), "Say <b>1 to " + MAXCL + " " + (L.tw === "mot" ? "single words" : "examples") + "</b> out loud that are worth this number to you. No numbers" + (L.tw === "aveugle" ? ", and don't say the category" : "")) + ".</p>" +
            '<div class="dock"><button class="btn acc" type="button" data-n>' + tr("Cacher la note, place aux devineurs", "Hide the number, over to the guessers") + '</button><button class="link" type="button" data-rr style="align-self:center"' + (L.rr > 0 ? "" : " disabled") + ">" + rrLabel(L.rr) + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.dl = 0; L.phase = "gpass"; go(); });
            r.querySelector("[data-rr]").addEventListener("click", () => { if(L.rr > 0){ L.rr--; draw(); if(L.dl) L.dl = Date.now() + CHRONO * 1000; go(); } });
          });
        } else if(L.phase === "gpass"){
          const who = L.order[L.qi];
          screen(root, "gpass" + L.round + "-" + L.qi, lab + '<div class="pass"><span class="eyebrow">' + tr("Devineur " + (L.qi + 1) + " sur " + L.order.length, "Guesser " + (L.qi + 1) + " of " + L.order.length) + '</span><div class="who">' + esc(who) + "</div><p>" + tr("Passe le téléphone à <b>" + esc(who) + "</b>. Les autres ne regardent pas sa note.", "Pass the phone to <b>" + esc(who) + "</b>. Nobody else looks at their guess.") + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("C'est moi, je devine", "It's me, I'm guessing") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.guess = 0; L.phase = "gguess"; go(); });
          });
        } else if(L.phase === "gguess"){
          const who = L.order[L.qi];
          screen(root, "gguess" + L.round + "-" + L.qi, CSS + lab + (L.tw === "aveugle" ? hiddenCard : catCard(c)) + '<span class="eyebrow">' + tr(esc(who) + ", quelle est la note secrète de " + esc(g) + " ?", esc(who) + ", what number does " + esc(g) + " have in mind?") + "</span>" + padHTML() + '<div class="dock"><button class="btn acc" type="button" data-v disabled>' + tr("Valider ma note", "Lock in my guess") + "</button></div>", r => {
            r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { L.guess = +b.dataset.n; r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === L.guess)); r.querySelector("[data-v]").disabled = false; }));
            r.querySelector("[data-v]").addEventListener("click", () => {
              if(!L.guess) return;
              L.res.push([who, L.guess, points(L.note, L.guess, L.tw)]);
              if(++L.qi < L.order.length){ L.phase = "gpass"; go(); return; }
              const ip = indPts(L.res);
              L.res.forEach(x => { L.sc[x[0]] = (L.sc[x[0]] || 0) + x[2]; });
              L.sc[g] = (L.sc[g] || 0) + ip;
              L.res.forEach(x => L.hist.push([L.round, c[0], L.note, x[1], x[2], x[0], L.tw, [g]]));
              L.rh.push([L.round, c[0], L.note, g, L.tw, L.res.slice(), ip]);
              L.phase = "tres"; go();
              const gl = L.res.map(x => { const d = Math.abs(L.note - x[1]); return d === 0 ? { id: x[0], ev: "pile" } : d >= 3 ? { id: x[0], ev: "rate" } : null; }).filter(Boolean);
              if(L.res.length && !ip) gl.push({ id: g, ev: "flop" });
              if(api.gage) api.gage(gl, "n10t" + L.round + "|" + g);
            });
          });
        } else if(L.phase === "tres"){
          const h = L.rh[L.rh.length - 1];
          screen(root, "tres" + L.round, CSS + lab + '<div class="verdict">' + tr("La note était ", "The number was ") + h[2] + '</div><div class="card"><div class="big" style="font-size:22px">' + esc(c[0]) + "</div>" + rulerMulti(h[2], h[5].map(x => x[1])) +
            '<div class="n10-legend"><span><i class="ln"></i>' + tr("Note secrète", "Secret number") + '</span><span><i class="lg"></i>' + tr("Notes proposées", "Guesses") + "</span></div></div>" + guessesHTML(h[5], g, h[6], L.tw) + standHTML(names.map(n => [n, L.sc[n] || 0]), tr("Classement", "Standings")) +
            '<div class="dock"><button class="btn acc" type="button" data-n>' + (L.round >= L.rounds ? tr("Voir le classement final", "See final standings") : tr("Manche suivante", "Next round")) + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(L.round >= L.rounds){ L.phase = "end"; const top = topOf(names.map(n => [n, L.sc[n] || 0])); if(top.length) api.win(top); go(); return; }
              L.round++; L.gi = (L.gi + 1) % names.length; L.tw = rollTwist(L.twOn, L.tw); draw(); startTous(); L.phase = "ipass"; go();
            });
          });
        } else if(L.phase === "team"){
          screen(root, "team" + L.round, lab + '<div class="pass"><span class="eyebrow">' + tr("Devineur(se) de la manche", "This round's guesser") + '</span><div class="who">' + esc(g) + "</div><p>" + tr("<b>" + esc(g) + "</b> détourne les yeux. Tous les autres se regroupent autour du téléphone.", "<b>" + esc(g) + "</b> looks away. Everyone else gathers around the phone.") + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("On est prêts, montrer la note", "We're ready, show the number") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.dl = L.tw === "chrono" ? Date.now() + CHRONO * 1000 : 0; L.phase = "clue"; go(); });
          });
        } else if(L.phase === "clue"){
          screen(root, "clue" + L.round + c[0] + L.rr, CSS + lab + (L.dl ? '<div class="timer" data-t>' + CHRONO + "</div>" : "") + catCard(c, tr("Catégorie", "Category"), gradeHTML(L.note)) + '<p class="howto">' + tr("Chacun votre tour, donnez <b>" + (L.tw === "mot" ? "un seul mot" : "une réponse") + "</b> qui vaut cette note pour vous. Sans chiffre.", "Take turns giving <b>" + (L.tw === "mot" ? "a single word" : "an answer") + "</b> that's worth this number to you. No numbers.") + "</p>" +
            '<div class="dock"><button class="btn acc" type="button" data-n>' + tr("Cacher la note et donner à ", "Hide the number and pass to ") + esc(g) + '</button><button class="link" type="button" data-rr style="align-self:center"' + (L.rr > 0 ? "" : " disabled") + ">" + rrLabel(L.rr) + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "pass"; go(); });
            r.querySelector("[data-rr]").addEventListener("click", () => { if(L.rr > 0){ L.rr--; draw(); if(L.dl) L.dl = Date.now() + CHRONO * 1000; go(); } });
          });
        } else if(L.phase === "pass"){
          screen(root, "pass" + L.round, lab + '<div class="pass"><span class="eyebrow">' + tr("Donnez le téléphone à", "Hand the phone to") + '</span><div class="who">' + esc(g) + "</div><p>" + tr("La note est cachée. Écoute bien les indices, puis devine.", "The number is hidden. Listen carefully to the clues, then guess.") + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-n>" + tr("C'est moi, je devine", "It's me, I'm guessing") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "guess"; L.guess = 0; go(); });
          });
        } else if(L.phase === "guess"){
          screen(root, "guess" + L.round, lab + (L.tw === "aveugle" ? hiddenCard : catCard(c)) + '<span class="eyebrow">' + tr("Quelle note ont-ils en tête ?", "What number do they have in mind?") + "</span>" + padHTML() + '<div class="dock"><button class="btn acc" type="button" data-v disabled>' + tr("Valider ma note", "Lock in my guess") + "</button></div>", r => {
            r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { L.guess = +b.dataset.n; r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === L.guess)); r.querySelector("[data-v]").disabled = false; }));
            r.querySelector("[data-v]").addEventListener("click", () => {
              if(!L.guess) return; const pts = points(L.note, L.guess, L.tw); L.score += pts; L.max += rmax(L.tw); L.hist.push([L.round, c[0], L.note, L.guess, pts, g, L.tw, []]); L.phase = "result"; go();
              const dd = Math.abs(L.note - L.guess); if(api.gage && (dd === 0 || dd >= 3)) api.gage([{ id: g, ev: dd === 0 ? "pile" : "rate" }], "n10u" + L.round + "|" + g);
            });
          });
        } else if(L.phase === "result"){
          const h = L.hist[L.hist.length - 1], v = VERDICTS[h[4]] || VERDICTS[0];
          screen(root, "res" + L.round, CSS + lab + '<div class="verdict">' + esc(v[0]) + " +" + h[4] + '</div><p style="font-size:17px">' + tr("La note était " + h[2] + ", " + esc(g) + " a dit " + h[3] + ". ", "The number was " + h[2] + ", " + esc(g) + " said " + h[3] + ". ") + esc(v[1]) + "</p>" +
            '<div class="card"><div class="big" style="font-size:22px">' + esc(c[0]) + "</div>" + rulerHTML(h[2], h[3]) + legendHTML(g) + '</div><div class="tally"><span>' + tr("Score de l'équipe", "Team score") + "</span><b>" + L.score + " / " + L.max + '</b></div><div class="dock"><button class="btn acc" type="button" data-n>' + (L.round >= L.rounds ? tr("Voir le bulletin", "See the report card") : tr("Manche suivante", "Next round")) + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(L.round >= L.rounds){ L.phase = "end"; if(L.score / Math.max(1, L.max) >= .5) api.win(names); go(); return; }
              L.round++; L.gi = (L.gi + 1) % names.length; L.rr = Math.max(L.rr, 0); L.tw = rollTwist(L.twOn, L.tw); draw(); L.phase = "team"; go();
            });
          });
        } else if(L.phase === "end" && L.mode === "tous"){
          const rows = names.map(n => [n, L.sc[n] || 0]), top = topOf(rows);
          screen(root, "tend", CSS + '<span class="eyebrow">' + tr("Fin de partie", "Game over") + '</span><div class="verdict">' + winHTML(top) + "</div>" +
            standHTML(rows, tr("Classement final", "Final standings")) + awardsHTML(awards(L.hist, true)) + roundTable(L.rh) + '<div class="dock"><button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        } else if(L.phase === "end"){
          screen(root, "end", CSS + reportHTML(L.score, Math.max(1, L.max)) + awardsHTML(awards(L.hist)) + histTable(L.hist) + '<div class="dock"><button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      api.onTick(() => {
        if((L.phase !== "clue" && L.phase !== "iclue") || !L.dl) return;
        const left = Math.max(0, Math.ceil((L.dl - Date.now()) / 1000)), t = txt(root, "[data-t]", left);
        if(t) t.classList.toggle("low", left <= 10);
        if(left <= 0){ SB.u.buzz([80, 60, 80]); L.dl = 0; L.phase = L.phase === "iclue" ? "gpass" : "pass"; go(); }
      });
      go();
    }
  }
});
})();
