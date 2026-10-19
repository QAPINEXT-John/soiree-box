/* Action ou vérité — chacun son tour : une vérité à avouer ou une action à faire. Refuser coûte cher. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, clean, armTap, pick, buzz } = SB.u;
const tr = SB.u.tr;

/* Cartes : VT = vérités, AC = actions. {A} et {B} = autres joueurs. Hot et Hard réservés aux adultes. */
const VT = {
  "soft": [
  "Quelle est la chose la plus honteuse que tu as faite au collège ?",
  "Quel est ton plaisir coupable que personne ici ne connaît ?",
  "Quelle est la dernière chose que tu as recherchée sur internet ?",
  "Qui ici t'a fait la pire première impression, et pourquoi ?",
  "Quel est le plus gros mensonge que tu as dit à tes parents ?",
  "Quelle est la chanson que tu chantes à fond quand tu es seul ?",
  "Quel est le surnom le plus ridicule qu'on t'a donné ?",
  "Quel est ton pire souvenir de vacances ?",
  "As-tu déjà fait semblant d'être malade pour éviter quelqu'un ? Raconte.",
  "Quel est le truc le plus bizarre que tu as mangé ?",
  "Quelle est ta plus grosse peur irrationnelle ?",
  "Quelle est la pire coupe de cheveux que tu as eue ?",
  "Quel est le dernier message que tu as regretté d'avoir envoyé ?",
  "Qui ici survivrait le moins longtemps sur une île déserte ?",
  "Quel est le talent inutile dont tu es secrètement fier ?",
  "As-tu déjà lu les messages de quelqu'un en cachette ?",
  "Quelle est la pire excuse que tu as inventée pour arriver en retard ?",
  "Quel est le film qui t'a fait pleurer comme un bébé ?",
  "Quelle est la chose la plus chère que tu as cassée ?",
  "Si tu pouvais échanger ta vie avec quelqu'un ici, ce serait qui ?",
  "Quel est le pire cadeau que tu as reçu, et l'as-tu revendu ?",
  "Quelle habitude bizarre as-tu quand personne ne te regarde ?",
  "Quel est ton pire fail en public ?",
  "Adulte, as-tu déjà fait pipi ailleurs qu'aux toilettes ? Où ?",
  "Quand as-tu pleuré pour la dernière fois, et pourquoi ?",
  "De qui es-tu le plus jaloux ici, et pourquoi ?",
  "Quel est le pire job que tu as fait ?",
  "Quel est le secret que tu as gardé le plus longtemps ?",
  "As-tu déjà oublié le prénom de quelqu'un en pleine conversation ?",
  "Quelle est la chose la plus gênante dans ta chambre en ce moment ?",
  "Quel est ton pire souvenir de soirée ?",
  "Qui ici a le pire goût musical selon toi ?",
  "Quelle célébrité aimerais-tu être le temps d'une journée ?",
  "Quel mensonge racontes-tu le plus souvent ?",
  "As-tu déjà accusé quelqu'un d'autre d'une bêtise que tu avais faite ?",
  "Quel est le compliment le plus étrange qu'on t'a fait ?",
  "Quelle est ta pire honte au travail ou en cours ?",
  "Quel est le dernier truc que tu as volé, même minuscule ?",
  "Quelle application ouvres-tu le plus, et combien d'heures par jour ?",
  "Quel est le rêve le plus bizarre dont tu te souviens ?",
  "Avec qui ici partirais-tu en road trip, et qui laisserais-tu sur une aire d'autoroute ?",
  "Quelle est ta plus grosse dépense inutile de l'année ?",
  "Quelle est la chose la plus immature que tu fais encore ?",
  "Quel est le pire bide que tu as fait en racontant une blague ?",
  "As-tu déjà stalké un ex sur les réseaux ? Jusqu'où ?",
  "Quelle est la pire chose que tu as dite sur quelqu'un ici dans son dos ?",
  "Quel est le défaut que tu détestes le plus chez toi ?",
  "Quel est le plat que tu rates à chaque fois ?",
  "Quand as-tu eu le plus peur de ta vie ?",
  "As-tu déjà fait semblant d'aimer un cadeau offert par quelqu'un ici ?",
  "Quelle est la chose la plus folle que tu as faite pour impressionner quelqu'un ?",
  "Quel est ton pire souvenir de premier rendez-vous ?",
  "À qui ici confierais-tu tes clés, et à qui jamais ?",
  "Quelle est la règle que tu enfreins le plus souvent ?",
  "Qu'est-ce que tu n'avouerais jamais à ta famille ?",
  "Quel est ton record de jours sans te laver les cheveux ?",
  "Quelle est la plus grosse bêtise à laquelle tu as cru pendant des années ?",
  "Quel est le truc que tu fais mal mais que tu prétends maîtriser ?",
  "Quelle est ta théorie du complot préférée, même si tu n'y crois pas ?",
  "Quelle est la dernière personne que tu as bloquée, et pourquoi ?",
  "As-tu déjà fait une sieste au travail ou en cours ? Où ?",
  "Quand t'es-tu senti le plus ridicule ?",
  "Avec qui ici ne voudrais-tu surtout pas être en coloc ?",
  "Qu'est-ce que tu caches dans ton téléphone ?",
  "Quel est le pire conseil que tu as donné à quelqu'un ?",
  "As-tu déjà mangé un truc tombé par terre devant tout le monde ?",
  "Quel est le jeu dans lequel tu triches sans aucune honte ?",
  "Quelle est la pire tenue que tu as portée en soirée ?",
  "Quelle est ta plus grande fierté inutile ?",
  "Quelle est la chose la plus enfantine qui te fait encore peur ?",
  "Si {A} était un plat, ce serait lequel ?",
  "Quelle a été ta toute première impression de {A} ?",
  "Qu'est-ce que tu changerais chez {A} si tu le pouvais ?",
  "Quel souvenir avec {A} te fait encore rire ?",
  "Quel secret de {A} pourrais-tu révéler sans vous fâcher ?",
  "Quel surnom donnerais-tu à {A} ?",
  "Que fera {A} dans dix ans, selon toi ?",
  "Quelle manie de {A} t'agace le plus ?",
  "Pour partir deux semaines en voyage, tu choisis {A} ou {B} ?",
  "Quel est le moment le plus gênant que tu as vécu avec {A} ?",
  "Qu'est-ce que tu admires secrètement chez {A} ?",
  "Quel animal serait {A} dans une autre vie ?",
  "Quelle est la dernière chose qui t'a vraiment mis en colère ?",
  "As-tu déjà menti dans ce jeu ? Quand ?",
  "Quel est le truc le plus bizarre que tu as googlé sur toi-même ?",
  "Quel est le meilleur mensonge que tu as servi à un prof ou à un patron ?",
  "Quel est le contact le plus gênant de ton téléphone ?",
  "Quelle est la phrase que tu dis tout le temps sans t'en rendre compte ?",
  "Qu'est-ce que tu as fait de plus nul pour avoir des likes ?",
  "Quel est le dernier truc que tu as acheté en cachette ?",
  "Quel est le pire anniversaire que tu as vécu ?",
  "Qui ici te ressemble le plus, et est-ce que ça te gêne ?",
  "As-tu déjà chanté ou parlé tout seul sans savoir que quelqu'un écoutait ?",
  "Quel personnage de dessin animé était ton premier crush ?",
  "Quelle est la plus grosse bêtise que tu as faite en étant pompette ?",
  "Quel est ton record de messages non lus ?",
  "Quel prénom n'oserais-tu jamais donner à ton enfant ?",
  "Quelle est l'excuse la plus nulle que tu as donnée pour annuler une soirée ?",
  "Qu'as-tu fait de plus courageux dans ta vie ?",
  "Quelle est la dernière personne qui t'a fait rougir ?",
  "Quel est ton rituel le plus étrange avant de dormir ?",
  "Quel est le dernier compliment que tu as fait sans le penser ?",
  "Quelle est la pire photo de toi qui existe, et qui l'a ?",
  "Quel est ton plus gros regret de l'année ?",
  "À quel âge as-tu arrêté de croire au père Noël, et qui a brisé le rêve ?",
  "As-tu déjà fait un câlin à quelqu'un juste pour finir une conversation ?",
  "Quel métier aurais-tu fait si tu n'avais peur de rien ?",
  "Quelle est la plus grosse dispute que tu as eue pour un truc débile ?",
  "Quelle est la dernière chose que tu as dite que tu n'aurais pas dû ?",
  "Quelle est la pire crasse que tu as faite à ton frère, ta sœur ou un cousin ?",
  "Qui ici est le plus susceptible d'avoir une double vie ?",
  "Quelle est la phrase la plus nulle que tu as utilisée pour draguer ?"
  ],
  "hot": [
  "Avec combien de personnes as-tu couché ? Le vrai chiffre.",
  "Quel est ton fantasme le plus avouable ?",
  "Quel est le lieu le plus insolite où tu as embrassé quelqu'un ?",
  "Qui ici embrasse le mieux, d'après toi ?",
  "Quelle partie du corps te fait craquer chez quelqu'un ?",
  "Quel est ton pire premier baiser ?",
  "As-tu déjà eu un crush sur quelqu'un dans cette pièce ?",
  "Quelle est la chose la plus osée que tu as faite pour séduire ?",
  "As-tu déjà couché le premier soir ? Raconte le contexte.",
  "Quelle a été ta relation la plus courte, et pourquoi ça n'a pas duré ?",
  "As-tu déjà envoyé un message coquin à la mauvaise personne ?",
  "Qu'est-ce qui te fait perdre tous tes moyens au lit ?",
  "Quelle est ta technique de drague secrète ?",
  "As-tu déjà simulé ? Combien de fois, à peu près ?",
  "Quel est le pire rencard que tu as eu sur une appli ?",
  "Quelle tenue te fait le plus d'effet chez quelqu'un ?",
  "Si tu devais sortir avec quelqu'un ici, ce serait qui ?",
  "Quel est le compliment physique qui te fait le plus d'effet ?",
  "As-tu déjà dragué l'ex d'un ami ?",
  "As-tu déjà eu un plan d'un soir que tu as regretté le lendemain matin ?",
  "Quelle est ta position préférée ? Juste le nom.",
  "As-tu déjà été surpris en plein câlin ? Par qui ?",
  "Quel est ton type physique, honnêtement ?",
  "Qu'est-ce que tu regardes en premier chez quelqu'un qui te plaît ?",
  "As-tu déjà fait l'amour dans une voiture ?",
  "Quelle a été ta plus longue période sans sexe ?",
  "Quel est le message le plus chaud que tu as reçu ?",
  "As-tu déjà eu une aventure avec un collègue ?",
  "Quel est ton pire souvenir au lit ?",
  "As-tu déjà été en couple avec deux personnes en même temps ?",
  "As-tu déjà embrassé quelqu'un du même sexe que toi ?",
  "Quelle est la chose la plus romantique que tu as faite pour quelqu'un ?",
  "Quelle est la personne la plus âgée avec qui tu es sorti ?",
  "Qu'est-ce qui t'excite le plus : la voix, le regard ou l'odeur ?",
  "As-tu déjà fait l'amour dans un lieu public ?",
  "As-tu déjà eu un plan cul régulier ? Comment ça s'est terminé ?",
  "Quel est ton plus gros râteau amoureux ?",
  "As-tu déjà recouché avec un ex ? Combien de fois ?",
  "Qui ici a le plus beau sourire ?",
  "Qui ici a le plus beau corps, selon toi ?",
  "As-tu déjà dragué quelqu'un uniquement pour rendre un autre jaloux ?",
  "As-tu déjà menti sur ton nombre de partenaires ? Dans quel sens ?",
  "Quel est ton record de baisers en une seule soirée ?",
  "Quelle est la chanson parfaite pour une nuit torride ?",
  "Quel est le truc le plus gênant que tu as dit pendant un moment intime ?",
  "Préfères-tu dominer ou être dominé ?",
  "As-tu déjà eu terriblement envie de quelqu'un au pire moment possible ? Raconte.",
  "As-tu déjà été attiré par le partenaire d'un ami ?",
  "Quel est le meilleur endroit où tu as fait l'amour ?",
  "Quel est le premier truc que tu fais après un rencard raté ?",
  "As-tu déjà regardé du porno avec quelqu'un ?",
  "Quelle est ta zone érogène préférée ?",
  "Que penses-tu vraiment de la vie amoureuse de {A} ?",
  "Si tu devais embrasser {A} ou {B}, tu choisirais qui ?",
  "Qu'est-ce que tu trouves sexy chez {A} ?",
  "Quel genre d'amant serait {A}, à ton avis ?",
  "Quel serait le rencard idéal pour {A} ?",
  "As-tu déjà eu une pensée coquine sur {A} ? Sois honnête.",
  "Quel est le défaut amoureux de {A}, selon toi ?",
  "Devant le miroir, quelle partie de ton corps préfères-tu ?",
  "Dans quel scénario rêverais-tu de rencontrer quelqu'un ?",
  "As-tu déjà dormi avec quelqu'un sans rien faire, et l'as-tu regretté ?",
  "Quelle est la chose la plus folle que tu as faite par amour ?",
  "As-tu déjà été trompé ? Comment l'as-tu appris ?",
  "As-tu déjà trompé quelqu'un ?",
  "Quel est ton plus gros tue-l'amour ?",
  "Combien de temps attends-tu avant d'envoyer un message après un rencard ?",
  "As-tu déjà eu un coup de foudre ? Pour qui ?",
  "As-tu déjà fait un strip-tease à quelqu'un ?",
  "Quelle est la chose la plus coquine dans ta table de nuit ?",
  "As-tu déjà été pris en flagrant délit de drague par ton partenaire ?",
  "Quelle est la dernière personne à qui tu as pensé avant de t'endormir ?",
  "Quel est le surnom le plus mignon qu'on t'a donné en couple ?",
  "Quel est ton plus gros fail sur une appli de rencontre ?",
  "As-tu déjà dragué quelqu'un sans savoir qu'il ou elle était déjà en couple ?",
  "Au lit : lumière allumée ou éteinte ?",
  "À quel moment de la journée as-tu le plus envie de faire l'amour ?",
  "As-tu déjà fait l'amour en sachant que quelqu'un pouvait entendre ?",
  "Quel est ton record de rapports en une nuit ?",
  "As-tu déjà eu une relation à distance ? Comment tu gérais le manque ?",
  "Quelle est la phrase de drague qui marcherait sur toi ?",
  "Qu'est-ce qui te fait fuir immédiatement chez quelqu'un ?",
  "As-tu déjà eu un crush sur ton patron ou ta patronne ?",
  "Quel est le rencard le plus cher que tu as payé pour rien ?",
  "As-tu déjà été dans un jacuzzi avec quelqu'un qui te plaisait ?",
  "Quelle est la chose la plus sexy qu'on t'a dite ?",
  "Quand t'es-tu senti le plus désirable ?",
  "As-tu déjà échangé des photos coquines ?",
  "As-tu déjà fait un plan à trois, ou failli en faire un ?",
  "Avec qui ici aurais-tu le plus d'alchimie ?",
  "Quelle est ta plus grosse peur au lit ?",
  "Quelle est la chose que tu n'as jamais osé demander à un partenaire ?",
  "As-tu déjà pleuré après une rupture que tu avais provoquée ?",
  "Quelle a été ta plus longue relation, et pourquoi s'est-elle arrêtée ?",
  "Quel est le moment le plus gênant que tu as vécu avec un ex ?",
  "Plutôt câlin du matin ou du soir ?",
  "Qui ici serait le plus sauvage au lit, selon toi ?",
  "À quand remonte la dernière fois que tu as fait l'amour ?",
  "Qu'est-ce qui te rend le plus jaloux en couple ?",
  "Quel est le geste tendre qui te fait fondre ?",
  "As-tu déjà dragué dans ce groupe sans que personne ne le remarque ?"
  ],
  "hard": [
  "Quel est ton kink le plus inavouable ?",
  "Quelle catégorie regardes-tu le plus sur les sites pour adultes ?",
  "Raconte en détail ta dernière fois.",
  "Quel sex-toy as-tu chez toi, ou rêves-tu d'avoir ?",
  "As-tu déjà tourné une sextape ? Avec qui (sans donner de nom) ?",
  "Quelle est la position que tu détestes, et pourquoi ?",
  "Quel est le truc le plus sale que tu as fait au lit ?",
  "As-tu déjà joui en moins d'une minute ? Raconte.",
  "Quelle est ta plus grosse honte sexuelle ?",
  "Quelle est la chose la plus bizarre qu'un partenaire t'a demandée ?",
  "As-tu déjà été dans une soirée échangiste ou libertine ?",
  "Combien de fois par semaine te fais-tu plaisir tout seul ?",
  "Quel est l'endroit le plus risqué où tu t'es fait plaisir ?",
  "As-tu déjà bandé les yeux de quelqu'un au lit, ou l'inverse ?",
  "Quel est le meilleur orgasme de ta vie ? Contexte complet.",
  "As-tu déjà essayé la sodomie ? Verdict ?",
  "Quelle est la phrase la plus crue qu'on t'a dite au lit ?",
  "As-tu déjà couché avec quelqu'un dont tu ne connaissais pas le prénom ?",
  "Quel est ton record de partenaires en une semaine ?",
  "Quel est le scénario porno que tu aimerais vivre ?",
  "As-tu déjà été surpris en train de te faire plaisir ? Par qui ?",
  "Qu'est-ce que tu préfères recevoir au lit ?",
  "Qu'est-ce que tu préfères donner au lit ?",
  "Pour un plan à trois, quelle serait ta configuration idéale ?",
  "Qu'as-tu déjà fait une fois au lit, mais plus jamais depuis ?",
  "As-tu déjà fait l'amour au travail ? Où exactement ?",
  "Quel est ton record de durée au lit ?",
  "Tu avales, tu recraches, ou ça dépend ?",
  "Quelle partie de ton corps est la plus sensible ?",
  "As-tu déjà utilisé de la nourriture pendant un rapport ? Laquelle ?",
  "As-tu déjà dit le mauvais prénom pendant l'acte ?",
  "Quel est le pire bruit que tu as fait pendant un rapport ?",
  "As-tu déjà fait l'amour en essayant de ne faire aucun bruit ? Mission réussie ?",
  "Rasé, taillé ou nature ? Pour toi et chez les autres.",
  "As-tu déjà regardé du porno en pensant à quelqu'un ici ?",
  "As-tu déjà eu un fantasme sur quelqu'un dans cette pièce ? Décris-le sans dire qui.",
  "Quelle est ta pire panne au lit ?",
  "As-tu déjà payé pour un service coquin en ligne ?",
  "As-tu déjà fait du sexting avec un inconnu ?",
  "Combien de temps ont duré tes plus longs préliminaires ?",
  "As-tu déjà eu une MST ? Comment l'as-tu annoncé ?",
  "Quel fétiche as-tu qui te surprend toi-même ?",
  "As-tu déjà fait l'amour sur une plage ? Le sable, alors ?",
  "Quelle est la chose la plus dégoûtante qui t'est arrivée pendant un rapport ?",
  "Quel est ton rapport le plus court, et que s'est-il passé ?",
  "As-tu déjà eu une relation purement sexuelle de plus d'un an ?",
  "As-tu déjà été dans un club de strip-tease ?",
  "Quelle est la taille idéale, pour toi ? Tu peux répondre avec les mains.",
  "As-tu déjà simulé tellement bien que l'autre a applaudi ?",
  "Quelle est la chose la plus soumise ou la plus dominante que tu as faite au lit ?",
  "Quel est le bruit qui t'excite le plus pendant un rapport ?",
  "Quel objet du quotidien as-tu déjà détourné en jouet coquin ?",
  "Quel est le rapport le plus bruyant de ta vie ? Les voisins ont dit quoi ?",
  "As-tu déjà couché avec deux personnes différentes le même jour ?",
  "As-tu déjà regretté un tatouage ou un piercing intime ?",
  "As-tu déjà fait l'amour dans un avion, un train ou un bateau ?",
  "Quelle est la chose la plus folle que tu as faite en plan d'un soir ?",
  "As-tu déjà fait un massage qui a fini au lit ?",
  "Quelle est la réplique de film porno qui te fait le plus rire ?",
  "As-tu déjà eu une crampe en plein ébat ? Raconte.",
  "As-tu déjà été trop bruyant dans une maison de vacances entre amis ?",
  "Quelle est la chose que tu aimerais que {A} te fasse au lit, en théorie ?",
  "Selon toi, {A} est plutôt fesses, seins ou regard ?",
  "Quel kink imagines-tu chez {A} ?",
  "Qui ici a le plus de partenaires au compteur, selon toi ?",
  "Qui ici a le plus de jouets dans sa table de nuit, selon toi ?",
  "Qui ici serait le plus doué pour les préliminaires ?",
  "Si tu devais faire un plan à trois avec {A} et {B}, qui ferait quoi ?",
  "Quel est le pire endroit où tu as eu un rapport ?",
  "As-tu déjà eu des menottes ou des liens ? Qui tenait la clé ?",
  "As-tu déjà eu une expérience avec quelqu'un du même sexe ? Raconte.",
  "As-tu déjà fait l'amour pendant tes règles ou celles de ta ou ton partenaire ?",
  "Quel est le jeu de rôle que tu as déjà fait, ou que tu voudrais faire ?",
  "As-tu déjà filmé un moment intime à deux, d'un commun accord ? Vous l'avez gardé ?",
  "As-tu déjà fait un pari coquin ? Qui a gagné ?",
  "Quel est le plus gros mensonge que tu as dit pour coucher avec quelqu'un ?",
  "Quel est ton plus gros fail de sous-vêtements au moment crucial ?",
  "T'es-tu déjà endormi en plein rapport ?",
  "Quelle est la chose que tu fais au lit et dont tu es le plus fier ?",
  "As-tu déjà été dans une partouze ? Si non, tu irais ?",
  "As-tu déjà eu un rencard qui s'est fini dans les toilettes du bar ?",
  "Quel est le son que tu fais quand tu jouis ? Imite-le en une seconde.",
  "As-tu déjà dû te rhabiller en urgence parce que quelqu'un rentrait ?",
  "Quel est le compliment sur ton corps qu'on t'a fait au lit et que tu n'oublies pas ?",
  "As-tu déjà eu une envie irrésistible dans un endroit où c'était impossible ?",
  "Quelle est ta pire expérience avec un préservatif ?",
  "Quelle est la plus longue nuit blanche de sexe de ta vie ?",
  "Quel est le truc que tu fais en solo et que tu n'as jamais fait à deux ?",
  "As-tu déjà eu un orgasme sans être touché ?",
  "Quel est le sex-toy le plus étrange que tu as vu en vrai ?",
  "Quel est ton plus gros regret sexuel ?",
  "Quelle est la dernière vidéo pour adultes que tu as regardée ? Donne le titre, à peu près."
  ]
};
const AC = {
  "soft": [
  "Imite quelqu'un de la pièce jusqu'à ce qu'on devine qui c'est.",
  "Chante le refrain d'une chanson d'amour avec une voix d'opéra.",
  "Montre la dernière photo de ta galerie à tout le monde.",
  "Fais ta meilleure imitation d'un animal pendant 20 secondes.",
  "Parle avec un accent étranger inventé jusqu'à ton prochain tour.",
  "Lis à voix haute ton dernier message envoyé.",
  "Fais 10 pompes, ou 20 squats si tu préfères.",
  "Danse sans musique pendant 30 secondes.",
  "Laisse {A} publier un statut (gentil) sur ton réseau social préféré.",
  "Appelle un ami et chante-lui « Joyeux anniversaire », même si ce n'est pas le jour.",
  "Fais une déclaration d'amour dramatique à un objet de la pièce.",
  "Raconte une blague nulle. Si personne ne rit, recommence.",
  "Garde une cuillère sur le nez pendant 15 secondes.",
  "Parle uniquement en chantant jusqu'à ton prochain tour.",
  "Montre ton historique de recherche des dernières 24 heures.",
  "Fais un défilé de mode avec trois vêtements empruntés aux autres.",
  "Laisse {A} te coiffer comme il ou elle veut.",
  "Envoie un message vocal à ta mère ou à un proche pour lui dire que tu l'aimes.",
  "Fais un discours de remerciement comme si tu venais de gagner un prix.",
  "Mime ton film préféré jusqu'à ce que quelqu'un trouve.",
  "Fais une pub de 30 secondes pour un objet choisi par {A}.",
  "Laisse le groupe choisir ta photo de profil pendant 24 heures.",
  "Fais le tour de la pièce en marchant comme un mannequin.",
  "Raconte ta journée comme un commentateur sportif.",
  "Parle sans utiliser la lettre E pendant une minute.",
  "Fais une grimace et garde-la pendant que tout le monde te prend en photo.",
  "Dessine {A} en 30 secondes et montre le résultat.",
  "Écris un poème de quatre vers sur {A} et lis-le.",
  "Fais deviner un métier uniquement avec des bruits.",
  "Échange un vêtement avec {A} jusqu'à ton prochain tour.",
  "Mets tes chaussettes sur tes mains jusqu'à ton prochain tour.",
  "Imite le rire de chaque personne de la pièce.",
  "Fais un compliment sincère à chaque joueur.",
  "Laisse {A} lire ta dernière conversation pendant 10 secondes.",
  "Appelle un contact au hasard dans ton répertoire et souhaite-lui une bonne soirée.",
  "Improvise une chorégraphie sur le son que le groupe choisit.",
  "Raconte une histoire en inventant un mot sur deux.",
  "Tiens-toi sur un pied jusqu'à ton prochain tour.",
  "Prends un selfie avec la tête la plus moche possible et mets-le en fond d'écran.",
  "Présente la météo de la soirée comme à la télé.",
  "Dis l'alphabet à l'envers le plus vite possible.",
  "Fais semblant d'être un robot pendant une minute.",
  "Laisse {A} t'appeler par un surnom de son choix jusqu'à la fin de la partie.",
  "Joue une scène de rupture dramatique avec {A}.",
  "Fais un tutoriel beauté avec ce que tu trouves sur la table.",
  "Dis le mot le plus long que tu connais, puis fais une phrase avec.",
  "Fais rire {A} en moins de 30 secondes, sans contact.",
  "Imite un influenceur qui présente un produit absurde.",
  "Parle à la troisième personne jusqu'à ton prochain tour.",
  "Écris une ode à ton plat préféré et déclame-la.",
  "Fais 20 secondes de beatbox.",
  "Montre ta capture d'écran la plus gênante.",
  "Mange ce que le groupe choisit parmi ce qu'il y a sur la table.",
  "Laisse {A} t'imposer une pose de statue pendant 30 secondes.",
  "Raconte le pire rêve que tu as fait, en mimant les passages clés.",
  "Joue un solo d'air guitar endiablé.",
  "Envoie un emoji au hasard à la cinquième personne de tes conversations.",
  "Fais un tour de magie, même raté.",
  "Lis une notice de produit comme un poème romantique.",
  "Fais une interview de {A} comme un journaliste de télé.",
  "Invente le cri de guerre de la soirée et fais-le répéter à tout le monde.",
  "Mime une célébrité jusqu'à ce que quelqu'un trouve.",
  "Laisse le groupe faire défiler ta galerie photo pendant 10 secondes.",
  "Essaie de lécher ton coude.",
  "Imite le prof ou le patron qui t'a le plus marqué.",
  "Change de place avec {A} et imite sa posture jusqu'à ton prochain tour.",
  "Fais un rap improvisé de huit mesures sur la soirée.",
  "Raconte ta pire honte avec une voix de conteur pour enfants.",
  "Mets ton pull à l'envers jusqu'à ton prochain tour.",
  "Fais semblant d'être un guide touristique qui présente la pièce.",
  "Garde les yeux fermés jusqu'à ton prochain tour.",
  "Laisse {A} choisir ta sonnerie de téléphone pour la soirée.",
  "Jusqu'à ton prochain tour, fais un bruit d'animal chaque fois que quelqu'un dit ton prénom.",
  "Invente un jeu et explique ses règles en 30 secondes, le plus sérieusement du monde.",
  "Fais un slow avec un balai ou un coussin.",
  "Ne dis ni oui ni non jusqu'à ton prochain tour.",
  "Prends la pose de la statue de la Liberté avec ce que tu as sous la main.",
  "Parle comme un pirate jusqu'à ton prochain tour.",
  "Invente une poignée de main secrète avec {A} et apprenez-la en 30 secondes.",
  "Raconte une anecdote sur {A} que personne ne connaît.",
  "Fais l'éloge de {B} comme si c'était un héros national.",
  "Chuchote un secret à {A}, qui décide s'il doit être révélé.",
  "Fais 30 secondes de planche.",
  "Imite un bébé qui découvre le monde pendant 20 secondes.",
  "Laisse {A} écrire un mot sur ta main au stylo.",
  "Fais semblant de pleurer de joie en ouvrant un cadeau imaginaire.",
  "Prends l'accent de ta région ou d'une autre pour lire un message de ton téléphone.",
  "Jusqu'à ton prochain tour, fais une danse de la victoire chaque fois que quelqu'un relève un défi.",
  "Garde un glaçon dans ta main le plus longtemps possible, puis passe-le à {A}.",
  "Réponds à toutes les questions par une question jusqu'à ton prochain tour.",
  "Mets ton téléphone aux enchères comme un commissaire-priseur.",
  "Décris {A} uniquement avec des noms de plats.",
  "Fais un discours de mariage pour {A} et {B}.",
  "Rejoue la dernière dispute que tu as eue, en jouant les deux rôles.",
  "Imite une sirène d'alarme pendant 10 secondes.",
  "Laisse le groupe te maquiller avec ce qu'il trouve, sans abîmer tes vêtements.",
  "Fais une vidéo de 10 secondes où tu présentes la soirée comme un reportage.",
  "Envoie « Tu me manques » au dernier contact à qui tu as écrit, puis explique.",
  "Fais deviner un dessin animé en mimant uniquement avec ton visage.",
  "Raconte une histoire d'horreur en 30 secondes avec la lumière éteinte."
  ],
  "hot": [
  "Fais un bisou sur la joue à la personne de ton choix, si elle accepte.",
  "Enlève un vêtement de ton choix, hors sous-vêtements.",
  "Fais une danse sensuelle de 30 secondes devant le groupe.",
  "Murmure une phrase coquine à l'oreille de {A}, si {A} est d'accord.",
  "Fais un massage des épaules à {A} pendant une minute, si {A} accepte.",
  "Envoie un message de drague à ton crush actuel, ou à ton dernier match.",
  "Embrasse dans le cou la personne de ton choix, si elle accepte.",
  "Fais ton meilleur regard de séduction à {A} pendant 10 secondes sans rire.",
  "Assieds-toi sur les genoux de {A} jusqu'à ton prochain tour, si {A} est d'accord.",
  "Lis ta dernière conversation avec un crush avec une voix langoureuse.",
  "Retire un seul accessoire façon strip-tease, en musique.",
  "Mime ta façon de draguer en boîte, avec {A} comme cible s'il ou elle accepte.",
  "Mords-toi doucement la lèvre en regardant {A} dans les yeux pendant 5 secondes, si {A} est d'accord pour jouer le jeu.",
  "Fais un slow collé-serré avec la personne de ton choix qui accepte.",
  "Montre la conversation la plus coquine de ton téléphone, en cachant le nom.",
  "Fais un compliment sexy à chaque personne de la pièce.",
  "Embrasse la main de {A} comme dans un film d'époque, s'il ou elle est d'accord.",
  "Laisse {A} choisir un vêtement que tu dois enlever, hors sous-vêtements.",
  "Récite un poème d'amour improvisé à {A}, les yeux dans les yeux.",
  "Mime ta position préférée, seul et sans un mot.",
  "Échange ton haut avec {A} jusqu'à ton prochain tour, si {A} accepte.",
  "Décris ton rencard idéal comme une publicité de parfum.",
  "Fais un bisou sur le front de chaque personne qui accepte.",
  "Danse un tango avec {A}, si {A} est d'accord.",
  "Raconte ton meilleur baiser en mimant les moments clés.",
  "Laisse {A} te faire un suçon sur le bras, si vous êtes tous les deux d'accord.",
  "Fais semblant d'être sur une appli de rencontre et présente-toi en 20 secondes.",
  "Prends un selfie sexy (mais habillé) et mets-le en fond d'écran jusqu'à demain.",
  "Caresse les cheveux de {A} pendant 20 secondes, si {A} accepte.",
  "Fais un câlin de 10 secondes à la personne de ton choix qui accepte.",
  "Imite un gémissement de film romantique pendant 3 secondes.",
  "Dis à {A} ce que tu trouves le plus attirant chez lui ou elle.",
  "Fais un défilé en sous-vêtements imaginaire, en restant habillé, et commente-le.",
  "Fais un bisou esquimau à {A}, s'il ou elle est d'accord.",
  "Écris un SMS coquin à ton ou ta partenaire, ou à ton crush, et montre-le avant d'envoyer.",
  "Fais un massage des mains à {A} avec de la crème, si {A} accepte.",
  "Enlève tes chaussettes avec les dents.",
  "Lis à voix haute le message de drague type que tu enverrais.",
  "Fais un twerk de 10 secondes.",
  "Laisse {A} t'écrire un mot doux au feutre sur l'épaule, si tu es d'accord.",
  "Regarde {A} dans les yeux pendant 30 secondes sans parler, si {A} accepte.",
  "Choisis quelqu'un qui accepte et faites-vous un bisou sur la joue en même temps.",
  "Fais une pose de calendrier sexy pendant que le groupe compte jusqu'à 10.",
  "Décris en trois mots ce que tu ferais à {A} sur une île déserte.",
  "Danse lascivement autour d'une chaise pendant 20 secondes.",
  "Laisse la personne à ta droite poser sa main sur ton genou jusqu'à ton prochain tour, si vous êtes d'accord.",
  "Fais une déclaration d'amour à {A} comme dans une série à l'eau de rose.",
  "Lèche lentement une cuillère de quelque chose de sucré en regardant {A}, si {A} accepte d'être ta cible.",
  "Mange une fraise ou un fruit de la façon la plus sensuelle possible.",
  "Envoie un cœur rouge à ton dernier ex, puis gère les conséquences.",
  "Fais un bisou sur l'épaule de la personne de ton choix qui accepte.",
  "Joue une scène de premier rendez-vous gênant avec {A}.",
  "Dis la phrase la plus sexy que tu connais avec une voix grave.",
  "Fais une danse du ventre de 20 secondes.",
  "Laisse {A} poser sa tête sur tes genoux jusqu'à ton prochain tour, si vous êtes d'accord.",
  "Fais un baiser passionné à ton reflet dans un miroir ou un écran.",
  "Montre ton profil sur une appli de rencontre, ou crée-en un fictif à voix haute.",
  "Joue les serveurs sexy pour {A} jusqu'à ton prochain tour, et sers-lui à boire avec style.",
  "Fais une demande en mariage romantique à {A}, à genoux, si {A} accepte de jouer la scène.",
  "Retire un accessoire de {A} avec les dents, si {A} est d'accord.",
  "Raconte ton plus beau souvenir de séduction en 30 secondes.",
  "Fais semblant de séduire un objet de la pièce pendant 20 secondes.",
  "Laisse {A} te faire une coiffure sexy, si tu es d'accord.",
  "Fais un bisou sur le bout du nez à la personne choisie par le groupe, si elle accepte.",
  "Fais un clin d'œil séducteur à chaque joueur, sans rire.",
  "Imite la scène de séduction d'un film romantique célèbre avec {A}, s'il ou elle accepte.",
  "Danse collé-serré avec un coussin comme si c'était l'amour de ta vie.",
  "Masse les pieds de {A} pendant 30 secondes, si {A} est d'accord.",
  "Raconte ton fantasme le plus soft en chuchotant.",
  "Choisis la personne qui a le plus beau sourire et dis-lui pourquoi.",
  "Fais un câlin par derrière à {A}, si {A} accepte.",
  "Mets du baume à lèvres de la façon la plus sensuelle possible.",
  "Dépose un bisou sur le poignet de {A}, si {A} est d'accord ; sinon, fais-en un à ta propre main.",
  "Montre au groupe comment tu embrasses, sur ta main.",
  "Laisse {A} te dessiner un cœur au rouge à lèvres sur la joue, si tu acceptes.",
  "Joue la scène de la réconciliation sur l'oreiller avec un coussin.",
  "Fais un compliment sur le corps de {A}, élégant mais honnête.",
  "Berce {A} dans tes bras pendant 10 secondes, si {A} est d'accord.",
  "Fais semblant d'enlever un vêtement très lentement, sans rien enlever.",
  "Invente un surnom sexy pour {A} et utilise-le jusqu'à la fin de la partie.",
  "Fais une danse sensuelle avec {A} pendant 20 secondes, si {A} accepte.",
  "Dis à {A} une phrase de drague ringarde avec le plus grand sérieux.",
  "Laisse la personne choisie par le groupe te faire un bisou sur le visage, où elle veut sauf sur la bouche, si vous êtes d'accord.",
  "Pose ta main sur le cœur de {A} pendant 10 secondes, si {A} est d'accord.",
  "Raconte ton pire rencard en mimant la personne en face.",
  "Ferme les yeux et laisse la personne de ton choix qui accepte te faire un bisou sur la joue, puis devine qui.",
  "Souffle doucement dans le cou de {A}, si {A} est d'accord.",
  "Imite ta tête quand tu reçois un message de ton crush.",
  "Fais un strip-tease de ta veste ou de ton pull en musique.",
  "Écris un mot coquin sur un papier et donne-le à la personne de ton choix."
  ],
  "hard": [
  "Fais un lap dance d'une minute à {A}, si {A} est d'accord.",
  "Enlève deux vêtements, sans aller plus loin que tes sous-vêtements.",
  "Lèche de la chantilly sur le cou de {A}, si {A} accepte.",
  "Mime trois positions sexuelles avec {A}, habillés, si {A} est d'accord.",
  "Fais ton plus beau bruit d'orgasme simulé pendant 10 secondes.",
  "Mime ta dernière fois en 15 secondes, sans un mot.",
  "Mets-toi en sous-vêtements jusqu'à ton prochain tour.",
  "Fais un strip-tease en musique jusqu'aux sous-vêtements (tu peux garder un vêtement si tu préfères).",
  "Embrasse {A} sur la bouche, si {A} est d'accord ; sinon, fais un bisou sur la joue à quelqu'un qui accepte.",
  "Mime ce que tu fais quand tu te fais plaisir, habillé et en 5 secondes.",
  "Lis à voix haute le message le plus chaud de ton téléphone, en cachant les noms.",
  "Fais un suçon dans le cou de {A}, si {A} accepte.",
  "Laisse {A} t'attacher les mains avec une écharpe jusqu'à ton prochain tour, si vous êtes d'accord.",
  "Explique avec tes mains et un fruit comment tu fais une fellation ou un cunni, au choix.",
  "Simule une scène de film X de 15 secondes avec un coussin, habillé.",
  "Mange une banane de la manière la plus suggestive possible.",
  "Fais un massage des cuisses à {A} pendant 30 secondes, par-dessus les vêtements, si {A} accepte.",
  "Mets-toi à califourchon sur {A} pendant 10 secondes, si {A} est d'accord.",
  "Décris ton fantasme le plus cru en 30 secondes, sans t'arrêter.",
  "Raconte à voix haute ce que tu ferais à {A} si vous étiez seuls, si {A} accepte d'écouter.",
  "Donne une fessée à {A}, si {A} est d'accord, ou reçois-en une de la personne de ton choix qui accepte.",
  "Fais une démonstration de levrette avec un coussin.",
  "Lèche le lobe de l'oreille de {A}, si {A} accepte.",
  "Montre ta catégorie préférée de vidéos pour adultes en la mimant.",
  "Mordille la nuque de {A}, si {A} est d'accord.",
  "Enlève ton haut et garde-le enlevé jusqu'à ton prochain tour.",
  "Jusqu'à ton prochain tour, gémis chaque fois que quelqu'un dit un chiffre.",
  "Simule un orgasme en chuchotant, comme si tes colocs dormaient à côté.",
  "Raconte ton plan d'un soir le plus fou comme un commentateur sportif.",
  "Danse collé contre {A} en musique pendant 30 secondes, si {A} est d'accord.",
  "Laisse {A} écrire un mot coquin au feutre sur ton ventre, si tu acceptes.",
  "Mime le geste de défaire la ceinture de {A} d'une seule main, à 10 cm sans le toucher, si {A} est d'accord.",
  "Mets un glaçon dans ta bouche et fais-le glisser sur le bras de {A}, si {A} accepte.",
  "Fais une démonstration de ta technique de baiser sur une pêche ou une prune.",
  "Mime la position du missionnaire avec {A}, habillés et à distance, si {A} accepte.",
  "Mime la position de l'Andromaque avec {A}, habillés, si {A} est d'accord.",
  "Assieds-toi dos à {A} entre ses jambes jusqu'à ton prochain tour, si {A} accepte.",
  "Fais un bisou sur le ventre de {A}, si {A} est d'accord.",
  "Embrasse la personne de ton choix qui accepte pendant 5 secondes.",
  "Fais la voix que tu prends au lit pour dire une phrase banale.",
  "Raconte ta nuit la plus torride en trois phrases, avec un maximum de détails.",
  "Explique comment tu te fais plaisir comme si c'était une recette de cuisine.",
  "Enfile un sous-vêtement par-dessus tes vêtements jusqu'à ton prochain tour.",
  "Fais un baiser de cinéma renversé à {A}, si {A} accepte ; sinon, fais-le à un coussin.",
  "Lèche du sucre ou du sel sur le poignet de {A}, si {A} est d'accord.",
  "Laisse le groupe choisir un vêtement que tu enlèves, sans aller plus loin que les sous-vêtements.",
  "Fais un lap dance à une chaise vide, comme si ton fantasme y était assis.",
  "Mime avec {A} une scène de jambes en l'air dans un ascenseur, habillés, si {A} accepte.",
  "Imite les bruits de tes voisins les soirs agités.",
  "Laisse {A} te mettre un bandeau et te faire deviner trois parties de son bras ou de son visage par le toucher, si vous êtes d'accord.",
  "Fais ton meilleur dirty talk à un coussin pendant 15 secondes.",
  "Laisse {A} te donner un ordre coquin à exécuter, dans les limites de ce que tu acceptes.",
  "Montre comment tu ouvres l'emballage d'un préservatif avec les dents (un emballage de bonbon fera l'affaire).",
  "Fais une fouille au corps façon douanier sexy à la personne de ton choix, si elle accepte : mains par-dessus les vêtements, zones intimes exclues.",
  "Vante tes talents au lit comme dans une pub de télé-achat.",
  "Choisis la personne avec qui tu ferais un plan à trois parmi {A} et {B}, et explique pourquoi.",
  "Enlève ton pantalon ou ta jupe jusqu'à ton prochain tour, sous-vêtements gardés.",
  "Mime la fin d'un rapport, version film dramatique.",
  "Fais un suçon sur ta propre main en regardant {A} dans les yeux, si {A} accepte de soutenir ton regard.",
  "Lèche de la chantilly sur ton propre doigt de la façon la plus obscène possible.",
  "Masse le dos de {A} sous son haut pendant 30 secondes, si {A} est d'accord.",
  "Laisse {A} te lécher la joue, si vous êtes tous les deux d'accord.",
  "Raconte ton meilleur souvenir au lit comme une bande-annonce de film.",
  "Mime avec {A} une position du Kamasutra choisie par le groupe, habillés, si {A} accepte.",
  "Fais le tour de la pièce à quatre pattes en ronronnant comme un fauve.",
  "Embrasse le nombril de {A}, si {A} est d'accord.",
  "Jusqu'à ton prochain tour, enlève un vêtement chaque fois que quelqu'un dit ton prénom (sous-vêtements gardés).",
  "Imite la tête que tu fais au moment de jouir.",
  "Dessine au feutre sur ta peau ton sex-toy idéal et présente-le.",
  "Fais un bruit de lit qui grince avec ta bouche pendant que tu danses.",
  "Chevauche un coussin pendant 10 secondes comme au rodéo, regard brûlant.",
  "Laisse {A} t'enlever une chaussette avec les dents, si vous êtes d'accord.",
  "Fais un slow très collé avec {A} en lui murmurant des cochonneries, si {A} accepte.",
  "Décris l'anatomie de ton ex en trois adjectifs, sans dire son nom.",
  "Embrasse le genou de {A} en remontant de deux bisous, si {A} est d'accord.",
  "Fais semblant de passer un coup de fil coquin à quelqu'un d'imaginaire, à voix haute.",
  "Mime comment tu enlèves un soutien-gorge, sur toi ou sur un coussin.",
  "Pose un glaçon sur le cou de {A} et laisse-le fondre 10 secondes, si {A} accepte.",
  "Fais une démonstration de ton geste fétiche au lit, sur un coussin.",
  "Enlève ton haut et défile dans la pièce comme sur un podium."
  ]
};

/* English cards (same levels). {A} and {B} = other players. */
const VT_EN = {
  "soft": [
  "What's the most embarrassing thing you did in middle school?",
  "What's a guilty pleasure nobody here knows about?",
  "What's the last thing you searched for online?",
  "Who here made the worst first impression on you, and why?",
  "What's the biggest lie you ever told your parents?",
  "What song do you belt out when you're home alone?",
  "What's the most ridiculous nickname you've ever had?",
  "What's your worst vacation memory?",
  "Have you ever faked being sick to avoid someone? Spill.",
  "What's the weirdest thing you've ever eaten?",
  "What's your biggest irrational fear?",
  "What's the worst haircut you've ever had?",
  "What's the last text you regretted sending?",
  "Who here would last the shortest time on a desert island?",
  "What useless talent are you secretly proud of?",
  "Have you ever secretly read someone else's messages?",
  "What's the worst excuse you've ever made up for being late?",
  "What movie made you cry like a baby?",
  "What's the most expensive thing you've ever broken?",
  "If you could swap lives with someone here, who would it be?",
  "What's the worst gift you've ever gotten, and did you regift it?",
  "What weird habit do you have when nobody's watching?",
  "What's your worst fail in public?",
  "As an adult, have you ever peed somewhere other than a toilet? Where?",
  "When did you last cry, and why?",
  "Who here are you most jealous of, and why?",
  "What's the worst job you've ever had?",
  "What secret have you kept the longest?",
  "Have you ever forgotten someone's name in the middle of a conversation?",
  "What's the most embarrassing thing in your bedroom right now?",
  "What's your worst party memory?",
  "Who here has the worst taste in music?",
  "Which celebrity would you like to be for a day?",
  "What lie do you tell most often?",
  "Have you ever blamed someone else for something you did?",
  "What's the strangest compliment you've ever gotten?",
  "What's your most embarrassing moment at work or school?",
  "What's the last thing you stole, even something tiny?",
  "Which app do you open the most, and for how many hours a day?",
  "What's the weirdest dream you can remember?",
  "Who here would you take on a road trip, and who would you ditch at a gas station?",
  "What's the most pointless thing you've bought this year?",
  "What's the most immature thing you still do?",
  "What's the worst a joke of yours has ever bombed?",
  "Have you ever stalked an ex on social media? How deep did you go?",
  "What's the worst thing you've said behind the back of someone here?",
  "What flaw do you hate most about yourself?",
  "What dish do you mess up every single time?",
  "When were you the most scared in your life?",
  "Have you ever pretended to like a gift from someone here?",
  "What's the craziest thing you've done to impress someone?",
  "What's your worst first-date memory?",
  "Who here would you trust with your keys, and who never?",
  "What rule do you break most often?",
  "What would you never admit to your family?",
  "What's your record for going without washing your hair?",
  "What's the dumbest thing you believed for years?",
  "What do you pretend to be great at when you're actually bad at it?",
  "What's your favorite conspiracy theory, even if you don't buy it?",
  "Who's the last person you blocked, and why?",
  "Have you ever napped at work or in class? Where?",
  "When did you feel the most ridiculous?",
  "Who here would you never want as a roommate?",
  "What are you hiding on your phone?",
  "What's the worst advice you've ever given someone?",
  "Have you ever eaten something off the floor in front of everyone?",
  "What game do you cheat at with zero shame?",
  "What's the worst outfit you've ever worn to a party?",
  "What's your proudest useless achievement?",
  "What childish thing still scares you?",
  "If {A} were a dish, what would it be?",
  "What was your very first impression of {A}?",
  "What would you change about {A} if you could?",
  "What memory with {A} still makes you laugh?",
  "What secret of {A}'s could you spill without starting a fight?",
  "What nickname would you give {A}?",
  "Where do you think {A} will be in ten years?",
  "Which of {A}'s habits annoys you the most?",
  "For a two-week trip, do you pick {A} or {B}?",
  "What's the most awkward moment you've had with {A}?",
  "What do you secretly admire about {A}?",
  "What animal would {A} be in another life?",
  "What's the last thing that made you really angry?",
  "Have you ever lied in this game? When?",
  "What's the weirdest thing you've ever googled about yourself?",
  "What's the best lie you ever told a teacher or a boss?",
  "Who's the most embarrassing contact in your phone?",
  "What phrase do you say all the time without realizing it?",
  "What's the lamest thing you've done for likes?",
  "What's the last thing you bought in secret?",
  "What's the worst birthday you've ever had?",
  "Who here is the most like you, and does that bother you?",
  "Have you ever sung or talked to yourself without realizing someone was listening?",
  "Which cartoon character was your first crush?",
  "What's the dumbest thing you've done while tipsy?",
  "What's your record number of unread messages?",
  "What name would you never dare give your kid?",
  "What's the lamest excuse you've given to bail on a party?",
  "What's the bravest thing you've ever done?",
  "Who's the last person who made you blush?",
  "What's your weirdest bedtime ritual?",
  "What's the last compliment you gave without meaning it?",
  "What's the worst photo of you in existence, and who has it?",
  "What's your biggest regret this year?",
  "How old were you when you stopped believing in Santa, and who ruined it?",
  "Have you ever hugged someone just to end a conversation?",
  "What job would you do if you weren't afraid of anything?",
  "What's the biggest fight you've had over something stupid?",
  "What's the last thing you said that you really shouldn't have?",
  "What's the meanest prank you've ever pulled on a sibling or cousin?",
  "Who here is most likely to be living a double life?",
  "What's the cheesiest pickup line you've ever used?"
  ],
  "hot": [
  "How many people have you slept with? The real number.",
  "What's the tamest fantasy you're willing to admit?",
  "What's the weirdest place you've ever kissed someone?",
  "Who here do you think is the best kisser?",
  "What body part makes you weak at the knees?",
  "What was your worst first kiss?",
  "Have you ever had a crush on someone in this room?",
  "What's the boldest thing you've done to seduce someone?",
  "Have you ever slept with someone on the first date? Set the scene.",
  "What was your shortest relationship, and why didn't it last?",
  "Have you ever sent a dirty text to the wrong person?",
  "What makes you completely lose it in bed?",
  "What's your secret flirting technique?",
  "Have you ever faked it? Roughly how many times?",
  "What's the worst date you've had from a dating app?",
  "What outfit on someone drives you wild?",
  "If you had to date someone here, who would it be?",
  "What physical compliment gets you every time?",
  "Have you ever hit on a friend's ex?",
  "Have you ever had a one-night stand you regretted the next morning?",
  "What's your favorite position? Just the name.",
  "Have you ever been caught mid-hookup? By who?",
  "What's your physical type, honestly?",
  "What's the first thing you check out on someone you're into?",
  "Have you ever had sex in a car?",
  "What's the longest you've gone without sex?",
  "What's the hottest text you've ever received?",
  "Have you ever had a fling with a coworker?",
  "What's your worst memory in bed?",
  "Have you ever dated two people at the same time?",
  "Have you ever kissed someone of the same sex?",
  "What's the most romantic thing you've ever done for someone?",
  "Who's the oldest person you've ever dated?",
  "What turns you on most: the voice, the eyes or the smell?",
  "Have you ever had sex in a public place?",
  "Have you ever had a regular hookup? How did it end?",
  "What's the most brutal rejection you've ever had?",
  "Have you ever hooked up with an ex again? How many times?",
  "Who here has the best smile?",
  "Who here has the best body, in your opinion?",
  "Have you ever flirted with someone just to make someone else jealous?",
  "Have you ever lied about your number of partners? Up or down?",
  "What's your record for people kissed in a single night?",
  "What's the perfect song for a steamy night?",
  "What's the most awkward thing you've said during an intimate moment?",
  "Do you prefer to dominate or be dominated?",
  "Have you ever badly wanted someone at the worst possible moment? Spill.",
  "Have you ever been attracted to a friend's partner?",
  "What's the best place you've ever had sex?",
  "What's the first thing you do after a bad date?",
  "Have you ever watched porn with someone?",
  "What's your favorite erogenous zone?",
  "What do you really think of {A}'s love life?",
  "If you had to kiss {A} or {B}, who would you pick?",
  "What do you find sexy about {A}?",
  "What kind of lover do you think {A} would be?",
  "What would {A}'s ideal date be?",
  "Have you ever had a dirty thought about {A}? Be honest.",
  "What's {A}'s biggest flaw in love, in your opinion?",
  "In the mirror, what's your favorite part of your body?",
  "What's your dream meet-cute?",
  "Have you ever shared a bed with someone without anything happening, and regretted it?",
  "What's the craziest thing you've ever done for love?",
  "Have you ever been cheated on? How did you find out?",
  "Have you ever cheated on someone?",
  "What's your biggest turn-off?",
  "How long do you wait before texting after a date?",
  "Have you ever fallen for someone at first sight? Who?",
  "Have you ever given someone a striptease?",
  "What's the naughtiest thing in your nightstand?",
  "Have you ever been caught flirting by your partner?",
  "Who's the last person you thought about before falling asleep?",
  "What's the cutest nickname a partner has ever given you?",
  "What's your biggest dating app fail?",
  "Have you ever flirted with someone without knowing they were taken?",
  "In bed: lights on or off?",
  "What time of day are you most in the mood?",
  "Have you ever had sex knowing someone could hear?",
  "What's your record for rounds in one night?",
  "Have you ever been in a long-distance relationship? How did you deal with missing them?",
  "What pickup line would actually work on you?",
  "What makes you run for the hills immediately?",
  "Have you ever had a crush on your boss?",
  "What's the most expensive date you paid for that went nowhere?",
  "Have you ever been in a hot tub with someone you were into?",
  "What's the sexiest thing anyone has ever said to you?",
  "When did you feel the most desirable?",
  "Have you ever swapped naughty pics?",
  "Have you ever had a threesome, or almost had one?",
  "Who here would you have the most chemistry with?",
  "What's your biggest fear in bed?",
  "What have you never dared ask a partner for?",
  "Have you ever cried after a breakup you caused?",
  "What was your longest relationship, and why did it end?",
  "What's the most awkward moment you've had with an ex?",
  "Morning cuddles or bedtime cuddles?",
  "Who here would be the wildest in bed, in your opinion?",
  "When was the last time you had sex?",
  "What makes you most jealous in a relationship?",
  "What tender gesture makes you melt?",
  "Have you ever flirted with someone in this group without anyone noticing?"
  ],
  "hard": [
  "What's your most unspeakable kink?",
  "What category do you watch most on adult sites?",
  "Describe your last time in detail.",
  "What sex toy do you own, or dream of owning?",
  "Have you ever made a sex tape? With who (no names)?",
  "What position do you hate, and why?",
  "What's the dirtiest thing you've ever done in bed?",
  "Have you ever finished in under a minute? Spill.",
  "What's your most embarrassing sex moment?",
  "What's the weirdest thing a partner has ever asked you to do?",
  "Have you ever been to a swingers' party or a sex club?",
  "How many times a week do you get yourself off?",
  "What's the riskiest place you've ever gotten yourself off?",
  "Have you ever blindfolded someone in bed, or been blindfolded?",
  "What's the best orgasm of your life? Full context.",
  "Have you ever tried anal? Verdict?",
  "What's the filthiest thing anyone has said to you in bed?",
  "Have you ever slept with someone whose name you didn't know?",
  "What's your record for partners in one week?",
  "What porn scenario would you love to live out?",
  "Have you ever been caught getting yourself off? By who?",
  "What do you like receiving most in bed?",
  "What do you like giving most in bed?",
  "For a threesome, what would your ideal lineup be?",
  "What have you done once in bed but never again?",
  "Have you ever had sex at work? Where exactly?",
  "What's your record for how long you've lasted in bed?",
  "Spit or swallow, or does it depend?",
  "What's the most sensitive part of your body?",
  "Have you ever used food during sex? What kind?",
  "Have you ever said the wrong name during sex?",
  "What's the worst noise you've ever made during sex?",
  "Have you ever tried to have sex without making a sound? Mission accomplished?",
  "Shaved, trimmed or natural? For you and for others.",
  "Have you ever watched porn while thinking about someone here?",
  "Have you ever had a fantasy about someone in this room? Describe it without saying who.",
  "What's your worst performance fail in bed?",
  "Have you ever paid for a naughty service online?",
  "Have you ever sexted a stranger?",
  "How long did your longest foreplay session last?",
  "Have you ever had an STI? How did you break the news?",
  "What fetish do you have that even surprises you?",
  "Have you ever had sex on a beach? How was the sand?",
  "What's the grossest thing that's ever happened to you during sex?",
  "What's the quickest sex you've ever had, and what happened?",
  "Have you ever had a purely physical relationship for more than a year?",
  "Have you ever been to a strip club?",
  "What's the ideal size for you? You can answer with your hands.",
  "Have you ever faked it so well the other person applauded?",
  "What's the most submissive or most dominant thing you've done in bed?",
  "What sound turns you on most during sex?",
  "What everyday object have you turned into a sex toy?",
  "What's the loudest sex of your life? What did the neighbors say?",
  "Have you ever slept with two different people on the same day?",
  "Have you ever regretted an intimate tattoo or piercing?",
  "Have you ever had sex on a plane, a train or a boat?",
  "What's the wildest thing you've done on a one-night stand?",
  "Have you ever had a massage that ended in bed?",
  "What porn line makes you laugh the most?",
  "Have you ever gotten a cramp in the middle of the action? Spill.",
  "Have you ever been way too loud in a vacation rental full of friends?",
  "In theory, what would you want {A} to do to you in bed?",
  "Do you think {A} is more of a butt, boobs or eyes person?",
  "What kink do you imagine {A} has?",
  "Who here has the highest body count, in your opinion?",
  "Who here has the most toys in their nightstand, in your opinion?",
  "Who here would be the best at foreplay?",
  "If you had a threesome with {A} and {B}, who would do what?",
  "What's the worst place you've ever had sex?",
  "Have you ever used handcuffs or restraints? Who held the key?",
  "Have you ever hooked up with someone of the same sex? Spill.",
  "Have you ever had period sex, yours or your partner's?",
  "What role-play have you tried, or would you like to try?",
  "Have you ever filmed an intimate moment together, with both of you on board? Did you keep it?",
  "Have you ever made a dirty bet? Who won?",
  "What's the biggest lie you've told to get someone into bed?",
  "What's your worst underwear fail at the crucial moment?",
  "Have you ever fallen asleep in the middle of sex?",
  "What do you do in bed that you're proudest of?",
  "Have you ever been to an orgy? If not, would you go?",
  "Have you ever had a date that ended in the bar bathroom?",
  "What sound do you make when you come? Do a one-second impression.",
  "Have you ever had to get dressed in a panic because someone was coming home?",
  "What compliment about your body did you get in bed that you'll never forget?",
  "Have you ever been desperately horny somewhere it was impossible to do anything?",
  "What's your worst condom experience?",
  "What's the longest all-nighter of sex you've ever pulled?",
  "What do you do solo that you've never done with a partner?",
  "Have you ever had an orgasm without being touched?",
  "What's the strangest sex toy you've seen in real life?",
  "What's your biggest sexual regret?",
  "What's the last adult video you watched? Give the title, roughly."
  ]
};
const AC_EN = {
  "soft": [
  "Impersonate someone in the room until we guess who it is.",
  "Sing the chorus of a love song in an opera voice.",
  "Show everyone the last photo in your camera roll.",
  "Do your best animal impression for 20 seconds.",
  "Speak in a made-up foreign accent until your next turn.",
  "Read the last message you sent out loud.",
  "Do 10 push-ups, or 20 squats if you prefer.",
  "Dance with no music for 30 seconds.",
  "Let {A} post a (nice) status on your favorite social network.",
  "Call a friend and sing them “Happy Birthday”, even if it's not their birthday.",
  "Make a dramatic declaration of love to an object in the room.",
  "Tell a terrible joke. If nobody laughs, go again.",
  "Balance a spoon on your nose for 15 seconds.",
  "Only speak by singing until your next turn.",
  "Show your search history from the last 24 hours.",
  "Put on a fashion show with three pieces of clothing borrowed from the others.",
  "Let {A} style your hair however they want.",
  "Send a voice message to your mom or someone close telling them you love them.",
  "Give an acceptance speech as if you just won an award.",
  "Act out your favorite movie until someone gets it.",
  "Do a 30-second commercial for an object chosen by {A}.",
  "Let the group choose your profile picture for 24 hours.",
  "Strut around the room like a runway model.",
  "Narrate your day like a sports commentator.",
  "Talk for one minute without using the letter E.",
  "Pull a face and hold it while everyone takes your picture.",
  "Draw {A} in 30 seconds and show the result.",
  "Write a four-line poem about {A} and read it out.",
  "Get people to guess a job using only sound effects.",
  "Swap a piece of clothing with {A} until your next turn.",
  "Wear your socks on your hands until your next turn.",
  "Imitate the laugh of every person in the room.",
  "Give every player a sincere compliment.",
  "Let {A} read your latest conversation for 10 seconds.",
  "Call a random contact and wish them a lovely evening.",
  "Improvise a dance routine to a song the group picks.",
  "Tell a story where every other word is made up.",
  "Stand on one foot until your next turn.",
  "Take the ugliest selfie possible and make it your lock screen.",
  "Present tonight's weather forecast like a TV meteorologist.",
  "Say the alphabet backwards as fast as you can.",
  "Act like a robot for one minute.",
  "Let {A} give you a nickname that everyone uses until the end of the game.",
  "Act out a dramatic breakup scene with {A}.",
  "Do a beauty tutorial with whatever's on the table.",
  "Say the longest word you know, then use it in a sentence.",
  "Make {A} laugh in under 30 seconds, without touching them.",
  "Impersonate an influencer pitching an absurd product.",
  "Talk about yourself in the third person until your next turn.",
  "Write an ode to your favorite food and perform it.",
  "Beatbox for 20 seconds.",
  "Show your most embarrassing screenshot.",
  "Eat whatever the group picks from what's on the table.",
  "Let {A} put you in a statue pose for 30 seconds.",
  "Describe your worst nightmare, acting out the key moments.",
  "Play a wild air guitar solo.",
  "Send a random emoji to the fifth person in your chats.",
  "Do a magic trick, even if it flops.",
  "Read a product manual like a romantic poem.",
  "Interview {A} like a TV reporter.",
  "Invent tonight's battle cry and get everyone to repeat it.",
  "Act out a celebrity until someone guesses who.",
  "Let the group scroll through your camera roll for 10 seconds.",
  "Try to lick your elbow.",
  "Impersonate the teacher or boss who left the biggest mark on you.",
  "Swap seats with {A} and copy their posture until your next turn.",
  "Freestyle an eight-bar rap about tonight.",
  "Tell your most embarrassing story in a bedtime-story voice.",
  "Wear your sweater inside out until your next turn.",
  "Pretend you're a tour guide showing off the room.",
  "Keep your eyes closed until your next turn.",
  "Let {A} pick your ringtone for the night.",
  "Until your next turn, make an animal noise every time someone says your name.",
  "Invent a game and explain the rules in 30 seconds, with a totally straight face.",
  "Slow dance with a broom or a cushion.",
  "Don't say yes or no until your next turn.",
  "Strike the Statue of Liberty pose with whatever you've got at hand.",
  "Talk like a pirate until your next turn.",
  "Invent a secret handshake with {A} and learn it in 30 seconds.",
  "Tell a story about {A} that nobody here knows.",
  "Praise {B} as if they were a national hero.",
  "Whisper a secret to {A}, who decides whether it gets revealed.",
  "Hold a plank for 30 seconds.",
  "Act like a baby discovering the world for 20 seconds.",
  "Let {A} write a word on your hand in pen.",
  "Pretend to cry tears of joy while opening an imaginary present.",
  "Read a message from your phone in a strong regional accent.",
  "Until your next turn, do a victory dance every time someone completes a dare.",
  "Hold an ice cube in your hand as long as you can, then pass it to {A}.",
  "Answer every question with a question until your next turn.",
  "Auction off your phone like a professional auctioneer.",
  "Describe {A} using only names of dishes.",
  "Give a wedding toast for {A} and {B}.",
  "Reenact your last argument, playing both parts.",
  "Imitate an alarm siren for 10 seconds.",
  "Let the group do your makeup with whatever they find, without ruining your clothes.",
  "Film a 10-second video presenting tonight like a news report.",
  "Text “I miss you” to the last person you messaged, then explain.",
  "Get people to guess a cartoon by acting it out with just your face.",
  "Tell a 30-second horror story with the lights off."
  ],
  "hot": [
  "Kiss the person of your choice on the cheek, if they agree.",
  "Take off one item of clothing of your choice, underwear excluded.",
  "Do a 30-second sensual dance in front of the group.",
  "Whisper something naughty in {A}'s ear, if {A} is okay with it.",
  "Give {A} a one-minute shoulder massage, if {A} agrees.",
  "Send a flirty text to your current crush, or to your last match.",
  "Kiss the neck of the person of your choice, if they agree.",
  "Give {A} your best bedroom eyes for 10 seconds without laughing.",
  "Sit on {A}'s lap until your next turn, if {A} is okay with it.",
  "Read your last conversation with a crush in a sultry voice.",
  "Remove a single accessory striptease-style, with music.",
  "Act out how you flirt at a club, with {A} as your target if they agree.",
  "Bite your lip while looking {A} in the eyes for 5 seconds, if {A} is up for playing along.",
  "Slow dance up close with someone of your choice who agrees.",
  "Show the naughtiest conversation on your phone, hiding the name.",
  "Give everyone in the room a sexy compliment.",
  "Kiss {A}'s hand like in a period drama, if they agree.",
  "Let {A} choose an item of clothing you have to take off, underwear excluded.",
  "Recite an improvised love poem to {A}, looking deep into their eyes.",
  "Act out your favorite position, alone and without a word.",
  "Swap tops with {A} until your next turn, if {A} agrees.",
  "Describe your ideal date like a perfume commercial.",
  "Kiss the forehead of everyone who agrees.",
  "Dance a tango with {A}, if {A} is okay with it.",
  "Tell the story of your best kiss, acting out the key moments.",
  "Let {A} give you a hickey on the arm, if you both agree.",
  "Pretend you're on a dating app and pitch yourself in 20 seconds.",
  "Take a sexy (but fully clothed) selfie and make it your wallpaper until tomorrow.",
  "Stroke {A}'s hair for 20 seconds, if {A} agrees.",
  "Give a 10-second hug to the person of your choice who agrees.",
  "Imitate a romance-movie moan for 3 seconds.",
  "Tell {A} what you find most attractive about them.",
  "Do an imaginary lingerie runway show, fully dressed, and narrate it.",
  "Rub noses with {A}, if they agree.",
  "Write a flirty text to your partner or your crush, and show it to us before sending.",
  "Give {A} a hand massage with lotion, if {A} agrees.",
  "Take your socks off with your teeth.",
  "Read out loud the flirty opening line you'd usually send.",
  "Twerk for 10 seconds.",
  "Let {A} write a sweet note in marker on your shoulder, if you're okay with it.",
  "Look into {A}'s eyes for 30 seconds without talking, if {A} agrees.",
  "Pick someone who agrees and kiss each other on the cheek at the same time.",
  "Strike a sexy calendar pose while the group counts to 10.",
  "Describe in three words what you'd do to {A} on a desert island.",
  "Dance seductively around a chair for 20 seconds.",
  "Let the person on your right rest their hand on your knee until your next turn, if you both agree.",
  "Declare your love to {A} like in a cheesy soap opera.",
  "Slowly lick a spoonful of something sweet while looking at {A}, if {A} agrees to be your target.",
  "Eat a strawberry or a piece of fruit as sensually as possible.",
  "Send a red heart to your last ex, then deal with the fallout.",
  "Kiss the shoulder of the person of your choice who agrees.",
  "Act out an awkward first date scene with {A}.",
  "Say the sexiest line you know in a deep voice.",
  "Belly dance for 20 seconds.",
  "Let {A} rest their head on your lap until your next turn, if you both agree.",
  "Give your reflection a passionate kiss in a mirror or a screen.",
  "Show your dating app profile, or make up a fake one out loud.",
  "Play {A}'s sexy waiter until your next turn, and serve them a drink with style.",
  "Propose to {A}, down on one knee, if {A} agrees to play the scene.",
  "Remove one of {A}'s accessories with your teeth, if {A} is okay with it.",
  "Tell your best seduction story in 30 seconds.",
  "Pretend to seduce an object in the room for 20 seconds.",
  "Let {A} give you a sexy hairstyle, if you're okay with it.",
  "Kiss the tip of the nose of the person the group picks, if they agree.",
  "Give every player a seductive wink, without laughing.",
  "Recreate the seduction scene from a famous romantic movie with {A}, if they agree.",
  "Slow dance up close with a cushion as if it's the love of your life.",
  "Massage {A}'s feet for 30 seconds, if {A} is okay with it.",
  "Whisper your softest fantasy.",
  "Pick the person with the best smile and tell them why.",
  "Hug {A} from behind, if {A} agrees.",
  "Put on lip balm as sensually as possible.",
  "Plant a kiss on {A}'s wrist, if {A} is okay with it; otherwise, kiss your own hand.",
  "Show the group how you kiss, using your hand.",
  "Let {A} draw a lipstick heart on your cheek, if you agree.",
  "Act out a make-up-in-bed scene with a pillow.",
  "Compliment {A}'s body, classy but honest.",
  "Cradle {A} in your arms for 10 seconds, if {A} is okay with it.",
  "Pretend to take off an item of clothing very slowly, without actually taking anything off.",
  "Make up a sexy nickname for {A} and use it until the end of the game.",
  "Dance sensually with {A} for 20 seconds, if {A} agrees.",
  "Hit {A} with a cheesy pickup line, with a totally straight face.",
  "Let the person the group picks kiss you on the face, anywhere but the mouth, if you both agree.",
  "Put your hand on {A}'s heart for 10 seconds, if {A} is okay with it.",
  "Tell us about your worst date, impersonating the other person.",
  "Close your eyes and let a player who agrees kiss you on the cheek, then guess who it was.",
  "Blow gently on {A}'s neck, if {A} is okay with it.",
  "Show us the face you make when you get a text from your crush.",
  "Strip off your jacket or sweater, striptease-style, with music.",
  "Write a naughty note on a piece of paper and give it to the person of your choice."
  ],
  "hard": [
  "Give {A} a one-minute lap dance, if {A} is okay with it.",
  "Take off two items of clothing, without going further than your underwear.",
  "Lick whipped cream off {A}'s neck, if {A} agrees.",
  "Act out three sex positions with {A}, fully clothed, if {A} is okay with it.",
  "Do your best fake orgasm for 10 seconds.",
  "Act out your last time in 15 seconds, without a word.",
  "Strip down to your underwear until your next turn.",
  "Do a striptease to music down to your underwear (you can keep one item on if you prefer).",
  "Kiss {A} on the mouth, if {A} is okay with it; otherwise, kiss someone who agrees on the cheek.",
  "Act out what you do when you get yourself off, fully clothed and in 5 seconds.",
  "Read the hottest message on your phone out loud, hiding the names.",
  "Give {A} a hickey on the neck, if {A} agrees.",
  "Let {A} tie your hands with a scarf until your next turn, if you both agree.",
  "Using your hands and a piece of fruit, explain your technique for going down on someone, any way you like.",
  "Act out a 15-second porn scene with a cushion, fully clothed.",
  "Eat a banana in the most suggestive way possible.",
  "Massage {A}'s thighs for 30 seconds, over their clothes, if {A} agrees.",
  "Straddle {A} for 10 seconds, if {A} is okay with it.",
  "Describe your filthiest fantasy for 30 seconds, without stopping.",
  "Say out loud what you'd do to {A} if you were alone, if {A} agrees to listen.",
  "Spank {A}, if {A} is okay with it, or get spanked by someone of your choice who agrees.",
  "Demonstrate doggy style with a cushion.",
  "Lick {A}'s earlobe, if {A} agrees.",
  "Act out your favorite category of adult videos.",
  "Nibble the back of {A}'s neck, if {A} is okay with it.",
  "Take your top off and keep it off until your next turn.",
  "Until your next turn, moan every time someone says a number.",
  "Fake an orgasm in a whisper, as if your roommates were asleep next door.",
  "Tell the story of your wildest one-night stand like a sports commentator.",
  "Dance pressed up against {A} to music for 30 seconds, if {A} is okay with it.",
  "Let {A} write a naughty word in marker on your stomach, if you agree.",
  "Mime undoing {A}'s belt with one hand, a few inches away without touching, if {A} is okay with it.",
  "Put an ice cube in your mouth and slide it along {A}'s arm, if {A} agrees.",
  "Demonstrate your kissing technique on a peach or a plum.",
  "Act out missionary with {A}, clothed and at a distance, if {A} agrees.",
  "Act out cowgirl with {A}, fully clothed, if {A} is okay with it.",
  "Sit with your back to {A}, between their legs, until your next turn, if {A} agrees.",
  "Kiss {A}'s stomach, if {A} is okay with it.",
  "Kiss the person of your choice who agrees for 5 seconds.",
  "Say something totally boring in your bedroom voice.",
  "Describe your steamiest night in three sentences, with as many details as possible.",
  "Explain how you get yourself off as if it were a cooking recipe.",
  "Put on a piece of underwear over your clothes until your next turn.",
  "Give {A} a dramatic movie dip kiss, if {A} agrees; otherwise, do it to a cushion.",
  "Lick sugar or salt off {A}'s wrist, if {A} is okay with it.",
  "Let the group pick an item of clothing for you to take off, without going further than your underwear.",
  "Give a lap dance to an empty chair, as if your fantasy were sitting in it.",
  "Act out an elevator hookup with {A}, fully clothed, if {A} agrees.",
  "Imitate your neighbors' noises on a wild night.",
  "Let {A} blindfold you and have you guess three parts of their arm or face by touch, if you both agree.",
  "Do your best dirty talk to a cushion for 15 seconds.",
  "Let {A} give you a naughty order to carry out, within whatever limits you set.",
  "Show how you open a condom wrapper with your teeth (a candy wrapper will do).",
  "Give the person of your choice a sexy airport pat-down, if they agree: hands over clothes, private areas off-limits.",
  "Brag about your skills in bed like an infomercial host.",
  "Choose between {A} and {B} for a threesome, and explain why.",
  "Take off your pants or skirt until your next turn, underwear stays on.",
  "Act out the end of sex, dramatic-movie version.",
  "Give your own hand a hickey while looking {A} in the eyes, if {A} agrees to hold your gaze.",
  "Lick whipped cream off your own finger in the most obscene way possible.",
  "Massage {A}'s back under their top for 30 seconds, if {A} is okay with it.",
  "Let {A} lick your cheek, if you both agree.",
  "Tell your best memory in bed like a movie trailer.",
  "Act out a Kama Sutra position chosen by the group with {A}, fully clothed, if {A} agrees.",
  "Crawl around the room on all fours, purring like a big cat.",
  "Kiss {A}'s belly button, if {A} is okay with it.",
  "Until your next turn, take off an item of clothing every time someone says your name (underwear stays on).",
  "Make the face you make when you come.",
  "Draw your ideal sex toy on your skin in marker and present it.",
  "Make squeaky-bed noises with your mouth while you dance.",
  "Ride a cushion like a rodeo bull for 10 seconds, with a smoldering look.",
  "Let {A} take off one of your socks with their teeth, if you both agree.",
  "Slow dance very close with {A} while whispering dirty things, if {A} agrees.",
  "Describe your ex's anatomy in three adjectives, without saying their name.",
  "Kiss {A}'s knee and work your way up two kisses, if {A} is okay with it.",
  "Pretend to make a dirty phone call to an imaginary person, out loud.",
  "Act out how you take off a bra, on yourself or on a cushion.",
  "Put an ice cube on {A}'s neck and let it melt for 10 seconds, if {A} agrees.",
  "Demonstrate your signature move in bed, on a cushion.",
  "Take your top off and strut around the room like it's a runway."
  ]
};

const LEVELS = [
  { v: "soft", label: tr("Classique", "Classic"), desc: tr("Hontes, imitations, petits secrets : pour tout le monde", "Cringe stories, impressions, little secrets: for everyone") },
  { v: "hot", label: "Hot", desc: tr("Séduction, bisous, confessions sur ta vie sexuelle", "Flirting, kisses, confessions about your sex life"), hot: true },
  { v: "hard", label: "Hard", desc: tr("Très cru : sexe explicite, strip, défis sans filtre", "Very explicit: graphic sex, stripping, no-filter dares"), hot: true }
];
// Gages du mode sans alcool.
const GAGES = [
  "10 pompes, tout de suite", "chante le refrain que le groupe choisit", "parle avec un accent jusqu'à ton prochain tour", "laisse le groupe écrire ton prochain statut",
  "fais le tour de la pièce en marchant comme un pingouin", "garde les yeux fermés jusqu'à ton prochain tour", "fais un compliment sincère à chaque joueur",
  "imite le joueur de ton choix pendant 30 secondes", "reste debout sur un pied pendant 1 minute", "danse 20 secondes sans musique",
  "laisse le joueur à ta gauche te coiffer comme il veut", "parle à la troisième personne jusqu'à ton prochain tour", "raconte des blagues jusqu'à faire rire quelqu'un",
  "fais une déclaration d'amour dramatique à un objet de la pièce", "mange une cuillère du condiment choisi par le groupe", "envoie un emoji au hasard au 5e contact de ton téléphone",
  "porte un vêtement à l'envers jusqu'à la fin de la partie", "fais 20 squats en comptant à voix haute", "laisse le groupe choisir ta photo de profil pour 1 heure",
  "fais une pub de 20 secondes pour le verre de ton voisin", "réponds uniquement par des questions jusqu'à ton prochain tour", "fais le cri d'un animal choisi par le groupe chaque fois qu'on te parle, jusqu'à ton prochain tour",
  "garde une cuillère dans la bouche jusqu'à ton prochain tour", "masse les épaules du joueur à ta droite pendant 30 secondes, s'il est d'accord", "fais ta meilleure imitation d'une star du rap"
];
// Forfeits for alcohol-free mode (shown after "forfeit: ").
const GAGES_EN = [
  "10 push-ups, right now", "sing a chorus the group picks", "talk in an accent until your next turn", "let the group write your next status update",
  "waddle around the room like a penguin", "keep your eyes closed until your next turn", "give every player a sincere compliment",
  "impersonate the player of your choice for 30 seconds", "stand on one foot for 1 minute", "dance for 20 seconds with no music",
  "let the player on your left style your hair however they want", "talk about yourself in the third person until your next turn", "tell jokes until someone laughs",
  "make a dramatic declaration of love to an object in the room", "eat a spoonful of a condiment the group picks", "send a random emoji to the 5th contact in your phone",
  "wear something inside out until the end of the game", "do 20 squats, counting out loud", "let the group pick your profile picture for 1 hour",
  "do a 20-second commercial for your neighbor's drink", "only answer with questions until your next turn", "make the sound of an animal the group picks every time someone talks to you, until your next turn",
  "keep a spoon in your mouth until your next turn", "massage the shoulders of the player on your right for 30 seconds, if they agree", "do your best impression of a rap star"
];
// Cartes de la partie : langue de l'hôte (E.lg) en réseau, langue du téléphone en local.
const DECK = { fr: { VT, AC, GAGES }, en: { VT: VT_EN, AC: AC_EN, GAGES: GAGES_EN } };
const deckOf = lg => DECK[lg === "en" ? "en" : "fr"];
const UI = deckOf(SB.lang());
const SEEN = "actionverite:";
const TW = [
  { id: "x2", name: tr("Quitte ou double", "Double or nothing"), desc: tr("Points doublés, et sanction doublée si tu refuses.", "Double points, and double penalty if you refuse.") },
  { id: "group", name: tr("Le groupe décide", "The group decides"), desc: tr("Ce sont les autres qui choisissent : action ou vérité.", "The others choose for you: truth or dare.") },
  { id: "all", name: tr("Tout le monde y passe", "Everyone's in"), desc: tr("Vérité imposée, et chacun doit y répondre à son tour.", "It's a truth, and everyone has to answer it in turn."), ok: o => o.n >= 3 },
  { id: "mirror", name: tr("Effet miroir", "Mirror effect"), desc: tr("Après toi, un autre joueur doit faire exactement la même chose.", "After you, another player has to do exactly the same thing.") },
  { id: "nojk", name: tr("Sans filet", "No safety net"), desc: tr("Pas de joker possible pour cette carte.", "No jokers allowed on this card.") },
  { id: "heat", name: tr("Montée en température", "Turning up the heat"), desc: tr("La carte est tirée dans le niveau supérieur.", "The card is drawn from the next level up."), ok: o => o.up }
];
const twOf = id => SB.u.byTwist(TW, id);

/* ---------- Moteur commun ---------- */
const lvlIndex = v => LEVELS.findIndex(l => l.v === v);
function newGame(order, o){
  const lv = LEVELS.map(l => l.v).filter(v => A(o.packs).indexOf(v) >= 0);
  return { order: order.slice(), lv: lv.length ? lv : ["soft"], mode: o.mode === "soft" ? "soft" : "drink", laps: o.laps || 3, prog: o.prog !== false, twOn: o.twists !== false,
    i: 0, lap: 1, n: 0, phase: "choose", cur: order[0], kind: "", card: "", lvl: "", tw: "", mir: "", last: null,
    jk: Object.fromEntries(order.map(id => [id, o.jokers === false ? 0 : 2])),
    pts: {}, did: {}, told: {}, ref: {}, jok: {}, sips: {}, dk: {}, fl: Math.floor(Math.random() * 12), lg: o.lg === "en" || o.lg === "fr" ? o.lg : SB.lang() };
}
// Niveau de la carte : progressif (on monte au fil des tours) ou au hasard parmi les niveaux choisis.
function levelFor(E){
  const L = E.lv; if(L.length === 1) return L[0];
  if(!E.prog) return pick(L);
  const total = E.laps * E.order.length, done = (E.lap - 1) * E.order.length + E.i, k = Math.min(L.length - 1, Math.floor(done / total * L.length));
  return Math.random() < .2 && k > 0 ? L[k - 1] : L[k];
}
function draw(E, kind, lvl){
  const D = deckOf(E.lg), key = kind + ":" + lvl, src = (kind === "v" ? D.VT : D.AC)[lvl] || [];
  let d = A(E.dk[key]).slice(); if(!d.length) d = SB.u.fresh(SEEN + key, src);
  const c = d.pop(); E.dk[key] = d; SB.u.saw(SEEN + key, c); return c || "";
}
function fillCard(E, t){
  const others = shuffle(E.order.filter(id => id !== E.cur)), a = others[0] || "", b = others[1] || "";
  return { t, a, b };
}
function startTurn(E, live){
  const L = live && live.length ? live : E.order;
  let guard = 0;
  while(L.indexOf(E.order[E.i]) < 0 && guard++ < E.order.length) advance(E);
  if(E.lap > E.laps){ E.phase = "end"; return; }
  E.cur = E.order[E.i]; E.n++; E.phase = "choose"; E.kind = ""; E.card = ""; E.mir = "";
  const up = lvlIndex(E.lv[E.lv.length - 1]) > lvlIndex(levelFor(E));
  const t = E.twOn && E.n > 2 ? SB.u.twist(TW, { last: E.tw, rate: .3, n: L.length, up }) : null;
  E.tw = t ? t.id : "";
  if(E.tw === "all") reveal(E, "v");
}
function advance(E){ E.i++; if(E.i >= E.order.length){ E.i = 0; E.lap++; } }
function reveal(E, kind){
  let lvl = levelFor(E);
  if(E.tw === "heat"){ const k = E.lv.indexOf(lvl); if(k >= 0 && k < E.lv.length - 1) lvl = E.lv[k + 1]; else { const all = LEVELS.map(l => l.v), j = lvlIndex(lvl); if(j < all.length - 1 && E.lv.indexOf(all[j + 1]) >= 0) lvl = all[j + 1]; } }
  if(kind === "h") kind = Math.random() < .5 ? "v" : "a", E.rand = 1; else E.rand = 0;
  const c = fillCard(E, draw(E, kind, lvl));
  E.kind = kind; E.lvl = lvl; E.card = c.t; E.ca = c.a; E.cb = c.b; E.phase = "card";
  if(E.tw === "mirror") E.mir = shuffle(E.order.filter(id => id !== E.cur && id !== c.a))[0] || c.a || "";
}
function pen(E, kind){ return (kind === "a" ? 3 : 2) * (E.tw === "x2" ? 2 : 1); }
// Texte de la sanction, dans la langue de la partie (E.lg). Le nombre de gorgées est réaffiché dans la langue de chaque téléphone (sipsText).
function sipsText(n){ return tr(n + " gorgée" + (n > 1 ? "s" : ""), n === 1 ? "1 sip" : n + " sips"); }
function penText(E, n){
  if(E.lg === "en") return E.mode === "drink" ? (n === 1 ? "1 sip" : n + " sips") : "forfeit: " + pick(GAGES_EN) + (n >= 4 ? " (plus a second one picked by the group)" : "");
  return E.mode === "drink" ? n + " gorgée" + (n > 1 ? "s" : "") : "gage : " + pick(GAGES) + (n >= 4 ? " (et un deuxième au choix du groupe)" : "");
}
// Résultat du tour : "ok" (fait / répondu), "jk" (joker), "no" (refus).
function settle(E, res, live){
  const id = E.cur, m = E.tw === "x2" ? 2 : 1;
  if(res === "jk" && (E.jk[id] || 0) > 0 && E.tw !== "nojk"){ E.jk[id]--; E.jok[id] = (E.jok[id] || 0) + 1; E.last = { who: id, kind: E.kind, res: "jk", txt: "joker utilisé" }; }
  else if(res === "ok"){
    const p = ((E.kind === "a" ? 2 : 1) + (E.rand ? 1 : 0)) * m;
    E.pts[id] = (E.pts[id] || 0) + p; (E.kind === "a" ? E.did : E.told)[id] = ((E.kind === "a" ? E.did : E.told)[id] || 0) + 1;
    E.last = { who: id, kind: E.kind, res: "ok", txt: "+" + p + " point" + (p > 1 ? "s" : "") };
  } else {
    const n = pen(E, E.kind);
    E.ref[id] = (E.ref[id] || 0) + 1; if(E.mode === "drink") E.sips[id] = (E.sips[id] || 0) + n;
    E.last = { who: id, kind: E.kind, res: "no", txt: penText(E, n) };
  }
  advance(E);
  if(E.lap > E.laps){ E.phase = "end"; return; }
  startTurn(E, live);
}
const ranking = E => E.order.slice().sort((a, b) => (E.pts[b] || 0) - (E.pts[a] || 0));

/* ---------- Affichage ---------- */
function fillHTML(t, E, nameOf){
  const en = E.lg === "en";
  return esc(t).replace(/\{A\}/g, '<b class="av-n">' + esc(E.ca ? nameOf(E.ca) : en ? "someone" : "quelqu'un") + "</b>").replace(/\{B\}/g, '<b class="av-n">' + esc(E.cb ? nameOf(E.cb) : en ? "someone else" : "quelqu'un d'autre") + "</b>");
}
const CSS = '<style>' +
  '.av-k{display:flex; gap:10px}.av-k .btn{flex:1}' +
  '.av-card{font-family:var(--f-disp); font-weight:800; font-size:27px; line-height:1.15; letter-spacing:-.01em; overflow-wrap:anywhere}' +
  '.av-n{text-decoration:underline; text-decoration-thickness:3px; text-underline-offset:4px}' +
  '.av-tag{display:inline-flex; align-self:flex-start; gap:6px; align-items:center; font-size:12px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; padding:4px 10px; border-radius:99px; background:rgba(20,16,26,.14)}' +
  '.av-last{display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; font-size:14px; color:var(--muted); background:var(--card); border-radius:14px; padding:10px 14px}' +
  '.av-last b{color:var(--ink)}.av-last .no{color:var(--bad); font-weight:800}.av-last .ok{color:var(--ok); font-weight:800}' +
  '.av-big{display:grid; grid-template-columns:1fr 1fr; gap:10px}' +
  '.av-big button{min-height:120px; border:0; border-radius:22px; font-family:var(--f-disp); font-weight:800; font-size:26px; letter-spacing:-.01em; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:4px}' +
  '.av-big button small{font-family:var(--f-body, inherit); font-size:13px; font-weight:700; opacity:.75}' +
  '.av-big .v{background:#8f9bff; color:#14101a}.av-big .a{background:var(--acc); color:#14101a}' +
  '.av-big button:disabled{opacity:.35}.av-big button:active{transform:scale(.97)}' +
  '.av-row{display:flex; justify-content:space-between; gap:8px; font-size:13px; color:var(--muted); font-weight:700}' +
  '</style>';
const FL = {
  win: [tr("Le plus téméraire", "Most fearless"), tr("Sans peur et sans reproche", "Fearless and flawless"), tr("Champion de la soirée", "Champion of the night"), tr("Rien ne lui fait peur", "Scared of nothing")],
  did: [tr("Trompe-la-mort", "Daredevil"), tr("Le plus courageux", "The bravest"), tr("Toujours partant", "Always up for it")],
  told: [tr("Livre ouvert", "Open book"), tr("Zéro secret", "Zero secrets"), tr("Confessions intimes", "True confessions")],
  ref: [tr("Poule mouillée", "Scaredy-cat"), tr("Champion du refus", "Refusal champion"), tr("Le plus prudent", "Plays it safe")],
  sips: [tr("Gosier en pente", "Hollow legs"), tr("Le plus assoiffé", "The thirstiest"), tr("Abonné aux gorgées", "Sip subscriber")]
};
const fl = (l, s, k) => l[((s || 0) + k) % l.length];
function awards(E, nameOf){
  const out = [], used = [];
  const top = (m, min, label, one, many) => { let b = "", v = min - 1; Object.keys(m || {}).forEach(id => { if((m[id] || 0) > v && used.indexOf(id) < 0){ v = m[id]; b = id; } }); if(b){ used.push(b); out.push([label, nameOf(b), m[b] + " " + (m[b] > 1 ? many : one)]); } };
  top(E.did, 2, fl(FL.did, E.fl, 1), tr("action", "dare"), tr("actions", "dares"));
  top(E.told, 2, fl(FL.told, E.fl, 2), tr("vérité", "truth"), tr("vérités", "truths"));
  top(E.ref, 2, fl(FL.ref, E.fl, 3), tr("refus", "refusal"), tr("refus", "refusals"));
  if(E.mode === "drink") top(E.sips, 4, fl(FL.sips, E.fl, 4), tr("gorgée", "sip"), tr("gorgées", "sips"));
  return out;
}
function awardsHTML(aw){ return aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : ""; }
function bars(E, nameOf){
  const max = Math.max(1, ...E.order.map(id => E.pts[id] || 0));
  return '<div class="bars">' + ranking(E).map(id => '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + tr((E.pts[id] || 0) + " pt" + ((E.pts[id] || 0) > 1 ? "s" : ""), (E.pts[id] || 0) + ((E.pts[id] || 0) === 1 ? " pt" : " pts")) + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (E.pts[id] || 0) / max) + '%"></div></div></div>').join("") + "</div>";
}
function lastHTML(E, nameOf){
  const l = E.last; if(!l || !l.who) return "";
  const sips = l.res === "no" && E.mode === "drink" && parseInt(l.txt, 10) > 0 ? sipsText(parseInt(l.txt, 10)) : l.txt;
  const what = l.res === "no" ? '<span class="no">' + (l.kind === "a" ? tr("a refusé l'action", "chickened out of the dare") : tr("a refusé la vérité", "dodged the truth")) + "</span> · " + esc(sips) : l.res === "jk" ? tr("a utilisé un joker", "used a joker") : '<span class="ok">' + (l.kind === "a" ? tr("a relevé le défi", "completed the dare") : tr("a dit la vérité", "told the truth")) + "</span> · " + esc(l.txt);
  return '<div class="av-last"><b>' + esc(nameOf(l.who)) + "</b> " + what + "</div>";
}
function headHTML(E, nameOf){
  return CSS + '<div class="av-row"><span>' + tr("Tour ", "Round ") + Math.min(E.lap, E.laps) + " / " + E.laps + "</span><span>" + (E.mode === "drink" ? tr("Mode gorgées", "Sip mode") : tr("Mode gages", "Forfeit mode")) + "</span></div>" + lastHTML(E, nameOf) + SB.u.twistHTML(twOf(E.tw), tr("Coup de théâtre", "Twist"));
}
/* Écran commun. can : { choose, settle } = ce téléphone peut agir. act(type, val). */
function turnHTML(E, nameOf, can){
  const who = nameOf(E.cur), jk = E.jk[E.cur] || 0;
  if(E.phase === "choose"){
    const grp = E.tw === "group";
    return headHTML(E, nameOf) + '<span class="eyebrow">' + (grp ? tr("Le groupe choisit pour", "The group picks for") : tr("Au tour de", "Up now")) + '</span><div class="who">' + esc(who) + "</div>" +
      (can.choose ? '<div class="av-big"><button type="button" class="v" data-c="v">' + tr("Vérité", "Truth") + '<small>+1 point</small></button><button type="button" class="a" data-c="a">' + tr("Action", "Dare") + "<small>+2 points</small></button></div>" +
        '<button class="btn ghost" type="button" data-c="h">' + tr("Au hasard · 1 point bonus", "Random · 1 bonus point") + "</button>"
        : '<p class="howto">' + (grp ? tr("Les autres joueurs choisissent pour " + esc(who) + "…", "The other players are choosing for " + esc(who) + "…") : tr(esc(who) + " choisit : action ou vérité ?", esc(who) + " is choosing: truth or dare?")) + "</p>") +
      '<p class="sm">' + tr("Jokers restants : ", "Jokers left: ") + jk + "</p>";
  }
  const lv = LEVELS[lvlIndex(E.lvl)] || LEVELS[0];
  return headHTML(E, nameOf) + '<span class="eyebrow">' + esc(who) + (E.rand ? tr(" · tiré au hasard", " · picked at random") : "") + "</span>" +
    '<div class="card acc"><span class="av-tag">' + (E.kind === "a" ? tr("Action", "Dare") : tr("Vérité", "Truth")) + " · " + esc(lv.label) + '</span><div class="av-card">' + fillHTML(E.card, E, nameOf) + "</div>" +
    (E.tw === "all" ? '<span class="sm">' + tr("Tout le monde répond, en commençant par " + esc(who) + ".", "Everyone answers, starting with " + esc(who) + ".") + "</span>" : "") +
    (E.mir ? '<span class="sm">' + tr("Effet miroir : " + esc(nameOf(E.mir)) + " le fait aussi juste après.", "Mirror effect: " + esc(nameOf(E.mir)) + " does it too, right after.") + "</span>" : "") + "</div>" +
    (can.settle ? dock('<button class="btn acc" type="button" data-r="ok">' + (E.kind === "a" ? tr("Défi relevé !", "Dare done!") : tr("J'ai répondu", "I answered")) + "</button>" +
      '<div class="row2">' + (jk > 0 && E.tw !== "nojk" ? '<button class="btn ghost" type="button" data-r="jk">Joker (' + jk + ")</button>" : '<button class="btn ghost" type="button" disabled>' + (E.tw === "nojk" ? tr("Sans filet", "No safety net") : tr("Plus de joker", "No jokers left")) + "</button>") +
      '<button class="btn ghost" type="button" data-r="no">' + tr("Je refuse", "I refuse") + "</button></div>" +
      '<p class="sm" style="text-align:center">' + tr("Refuser : ", "If you refuse: ") + esc(E.mode === "drink" ? tr(pen(E, E.kind) + " gorgées", "take " + pen(E, E.kind) + " sips") : tr("un gage", "do a forfeit")) + "</p>")
      : dock('<p class="wait">' + tr(esc(who) + " s'exécute… Le groupe juge !", esc(who) + " is on it… The group judges!") + "</p>"));
}
function bindTurn(r, act){
  r.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => { buzz(16); act("c", b.dataset.c); }));
  r.querySelectorAll("[data-r]").forEach(b => {
    if(b.dataset.r === "no") armTap(b, () => act("r", "no"), tr("Sûr ? Toucher encore", "Sure? Tap again"));
    else b.addEventListener("click", () => { buzz(20); act("r", b.dataset.r); });
  });
}
function endHTML(E, nameOf){
  const o = ranking(E);
  return CSS + '<span class="eyebrow">' + esc(fl(FL.win, E.fl, 0)) + '</span><div class="who">' + esc(nameOf(o[0])) + "</div>" + bars(E, nameOf) + awardsHTML(awards(E, nameOf));
}

/* ---------- Réseau ---------- */
function fromState(s, p){ const E = JSON.parse(JSON.stringify(s)); delete E.k; E.order = A(E.order); E.dk = Object.assign({}, p.dk || {}); Object.keys(E.dk).forEach(k => { E.dk[k] = A(E.dk[k]); }); return E; }
function publish(c, E){ c.setPriv({ dk: E.dk }); const o = Object.assign({}, E); delete o.dk; o.k = c.rid(); c.set(o); }
const liveIds = ctx => ctx.ids.filter(id => ctx.here(id));

const DEF = {
  id: "actionverite", name: tr("Action ou vérité", "Truth or Dare"), glyph: tr("A/V", "T/D"), pitch: tr("Une vérité à avouer ou une action à faire. Refuser coûte cher.", "A truth to confess or a dare to do. Refusing costs you."), hot: true,
  accent: { light: "#ff3d6e", dark: "#ff3d6e" },
  tag: tr("Chacun son tour choisit : une vérité à avouer devant tout le monde, ou une action à faire tout de suite. Refuser, c'est boire (ou prendre un gage).", "Take turns choosing: a truth to confess in front of everyone, or a dare to do right now. Refuse and you drink (or do a forfeit)."),
  min: 2, max: 16,
  rules: [
    tr("Chacun son tour choisit Vérité (+1 point) ou Action (+2 points). Au hasard : 1 point bonus.", "On your turn, pick Truth (+1 point) or Dare (+2 points). Random: 1 bonus point."),
    tr("Le groupe juge : si tu as répondu franchement ou relevé le défi, tu marques. Tu peux refuser, mais ça coûte des gorgées (ou un gage en mode sans alcool).", "The group judges: if you answered honestly or completed the dare, you score. You can refuse, but it costs you sips (or a forfeit in alcohol-free mode)."),
    tr("Deux jokers par partie pour passer une carte sans sanction.", "Two jokers per game to skip a card with no penalty."),
    tr("Trois niveaux : Classique, Hot (18+) et Hard (18+, très cru). En mode progressif, ça monte au fil des tours.", "Three levels: Classic, Hot (18+) and Hard (18+, very explicit). In progressive mode, things heat up as the rounds go by."),
    tr("Coups de théâtre : quitte ou double, le groupe décide, tout le monde y passe, effet miroir, sans filet, montée en température.", "Twists: double or nothing, the group decides, everyone's in, mirror effect, no safety net, turning up the heat."),
    tr("Les actions qui touchent quelqu'un d'autre se font seulement si cette personne est d'accord. Les cartes ne reviennent pas d'une soirée à l'autre.", "Dares that involve touching someone only happen if that person agrees. Cards don't come back from one party to the next.")
  ],
  options: [
    { id: "laps", label: tr("Tours de table", "Rounds"), type: "seg", def: 3, values: [{ v: 2, label: "2" }, { v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "packs", label: tr("Niveaux", "Levels"), type: "multi", def: ["soft"], values: LEVELS.map(l => ({ v: l.v, label: l.label, desc: l.desc, hot: l.hot, count: UI.VT[l.v].length + UI.AC[l.v].length })) },
    { id: "mode", label: tr("Sanctions", "Penalties"), type: "seg", def: "drink", values: [{ v: "drink", label: tr("Gorgées", "Sips") }, { v: "soft", label: tr("Sans alcool", "Alcohol-free") }] },
    { id: "prog", label: tr("Progressif", "Progressive"), type: "toggle", text: tr("Niveau progressif", "Progressive level"), desc: tr("On commence doux, et ça monte au fil des tours", "Start soft, and it heats up as the rounds go by"), def: true },
    { id: "twists", label: tr("Coups de théâtre", "Twists"), type: "toggle", text: tr("Coups de théâtre", "Twists"), desc: tr("De temps en temps, une règle change pour un tour", "Every now and then, a rule changes for one turn"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un niveau.", "Pick at least one level."));
    const E = newGame(shuffle(ctx.ids), o);
    E.n = 0; startTurn(E, ctx.ids);
    ctx.setPriv({ dk: E.dk });
    const s = Object.assign({}, E); delete s.dk; return s;
  },
  host(ctx){
    const s = ctx.s; if(!s || !s.order || s.phase === "end") return;
    const E = fromState(s, ctx.priv()), live = liveIds(ctx);
    if(E.phase === "choose"){
      const ok = E.tw === "group" ? live.filter(id => id !== E.cur) : [E.cur];
      for(const id of ok){ const x = ctx.input(id); if(x && x.c && x.c.n === E.n && /^[vah]$/.test(x.c.v)){ reveal(E, x.c.v); publish(ctx, E); return; } }
    } else if(E.phase === "card"){
      const x = ctx.input(E.cur);
      if(x && x.r && x.r.n === E.n && /^(ok|jk|no)$/.test(x.r.v)){ settle(E, x.r.v, live); publish(ctx, E); }
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, nameOf = ctx.name;
    if(!s || !s.order) return;
    const E = fromState(s, {});
    if(E.phase === "end"){
      screen(root, "ae:" + s.k + ctx.isHost, endHTML(E, nameOf) +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the lobby") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the lobby.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s, {}), o2 = ranking(F), mx = F.pts[o2[0]] || 0;
          c.end({ title: tr("Action ou vérité · " + c.name(o2[0]) + " gagne", "Truth or Dare · " + c.name(o2[0]) + " wins"), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (F.pts[id] || 0) + tr(" pts", (F.pts[id] || 0) === 1 ? " pt" : " pts")).concat(awards(F, c.name).slice(0, 2).map(a => a[0] + tr(" : ", ": ") + a[1])),
            win: mx ? o2.filter(id => (F.pts[id] || 0) === mx) : [] });
        }));
      });
      return;
    }
    const absent = !ctx.here(E.cur);
    const can = { choose: E.phase === "choose" && (E.tw === "group" ? me !== E.cur : me === E.cur || (ctx.isHost && absent)), settle: E.phase === "card" && (me === E.cur || (ctx.isHost && absent)) };
    const act = (t, v) => {
      if(me === E.cur || (t === "c" && E.tw === "group")) ctx.send(t === "c" ? { c: { n: E.n, v } } : { r: { n: E.n, v } });
      else if(ctx.isHost) ctx.act(c => { const F = fromState(c.s, c.priv()); if(F.n !== E.n) return; if(t === "c" && F.phase === "choose") reveal(F, v); else if(t === "r" && F.phase === "card") settle(F, v, liveIds(c)); publish(c, F); });
    };
    screen(root, "at:" + s.k + JSON.stringify(can) + ctx.isHost, turnHTML(E, nameOf, can) +
      (ctx.isHost ? '<button class="link" type="button" data-stop style="align-self:center">' + tr("Terminer la partie", "End the game") + "</button>" : ""), r => {
      bindTurn(r, act);
      const st = r.querySelector("[data-stop]"); if(st) armTap(st, () => ctx.act(c => { const F = fromState(c.s, c.priv()); F.phase = "end"; publish(c, F); }), tr("Toucher encore pour terminer", "Tap again to end"));
    });
    if(E.phase === "card" && SB.fx && root.dataset.fx !== s.k){ root.dataset.fx = s.k; SB.fx.flip(root.querySelector(".card.acc")); }
  },

  /* ---------- Un seul téléphone : posé au milieu, chacun son tour ---------- */
  local: {
    players: { min: 2, max: 16 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id] || "?";
      const S0 = store();
      let sel = A(S0.avPacks).filter(v => VT[v]).length ? A(S0.avPacks).filter(v => VT[v]) : ["soft"];
      let laps = [2, 3, 5, 8].indexOf(S0.avLaps) >= 0 ? S0.avLaps : 3, mode = S0.avMode === "soft" ? "soft" : "drink", prog = S0.avProg !== false, twOn = S0.avTw !== false;
      let E = null;
      function setup(){
        const tog = (k, on, nm, ds) => '<button type="button" class="pack" data-' + k + ' aria-pressed="' + on + '"><span class="box">✓</span><span class="tx"><span class="nm">' + nm + '</span><span class="ds">' + ds + "</span></span></button>";
        screen(root, "su" + sel.join() + laps + mode + prog + twOn, CSS + '<p class="howto">' + tr("Posez le téléphone au milieu. Chacun son tour choisit vérité ou action, le groupe juge, et on passe au suivant.", "Put the phone in the middle. On your turn, pick truth or dare, the group judges, then it's the next player's go.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Tours de table", "Rounds") + '</span><div class="seg">' + [2, 3, 5, 8].map(n => '<button type="button" data-l="' + n + '" aria-pressed="' + (n === laps) + '">' + n + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Niveaux", "Levels") + '</span><div class="packs">' + LEVELS.map(l => '<button type="button" class="pack' + (l.hot ? " hot" : "") + '" data-k="' + l.v + '" aria-pressed="' + (sel.indexOf(l.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(l.label) + (l.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(l.desc) + '</span></span><span class="ct">' + (UI.VT[l.v].length + UI.AC[l.v].length) + "</span></button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Sanctions", "Penalties") + '</span><div class="seg"><button type="button" data-m="drink" aria-pressed="' + (mode === "drink") + '">' + tr("Gorgées", "Sips") + '</button><button type="button" data-m="soft" aria-pressed="' + (mode === "soft") + '">' + tr("Sans alcool", "Alcohol-free") + "</button></div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Variantes", "Variants") + '</span><div class="packs">' + tog("pg", prog, tr("Niveau progressif", "Progressive level"), tr("On commence doux, et ça monte au fil des tours", "Start soft, and it heats up as the rounds go by")) + tog("tw", twOn, tr("Coups de théâtre", "Twists"), tr("De temps en temps, une règle change pour un tour", "Every now and then, a rule changes for one turn")) + "</div></div>" +
          dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
          r.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => { laps = +b.dataset.l; persist({ avLaps: laps }); setup(); }));
          r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ avPacks: sel }); setup(); }));
          r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ avMode: mode }); setup(); }));
          r.querySelector("[data-pg]").addEventListener("click", () => { prog = !prog; persist({ avProg: prog }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ avTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un niveau", "Pick at least one level")); return; }
            E = newGame(shuffle(ids), { packs: sel, laps, mode, prog, twists: twOn, lg: SB.lang() }); startTurn(E, ids); turn();
          });
        });
      }
      function turn(){
        if(E.phase === "end") return finish();
        screen(root, "t" + E.n + E.phase, turnHTML(E, nameOf, { choose: true, settle: true }) + '<button class="link" type="button" data-stop style="align-self:center">' + tr("Terminer la partie", "End the game") + "</button>", r => {
          bindTurn(r, (t, v) => { if(t === "c") reveal(E, v); else settle(E, v, ids); turn(); });
          armTap(r.querySelector("[data-stop]"), finish, tr("Toucher encore pour terminer", "Tap again to end"));
        });
        if(E.phase === "card" && SB.fx) SB.fx.flip(root.querySelector(".card.acc"));
      }
      function finish(){
        E.phase = "end";
        const o2 = ranking(E), mx = E.pts[o2[0]] || 0;
        if(api.win && mx) api.win(o2.filter(id => (E.pts[id] || 0) === mx).map(nameOf));
        screen(root, "end" + E.n, endHTML(E, nameOf) + dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
};
DEF.engine = { newGame, startTurn, reveal, settle, levelFor, VT, AC };
SB.register(DEF);
})();
