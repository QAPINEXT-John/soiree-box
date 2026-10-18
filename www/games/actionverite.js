/* Action ou vérité — chacun son tour : une vérité à avouer ou une action à faire. Refuser coûte cher. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, clean, armTap, pick, buzz } = SB.u;

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
  "Qui ici pourrait survivre le moins longtemps sur une île déserte ?",
  "Quel est le talent inutile dont tu es secrètement fier ?",
  "As-tu déjà lu les messages de quelqu'un en cachette ?",
  "Quelle est la pire excuse que tu as inventée pour arriver en retard ?",
  "Quel est le film qui t'a fait pleurer comme un bébé ?",
  "Quelle est la chose la plus chère que tu as cassée ?",
  "Si tu pouvais échanger ta vie avec quelqu'un ici, ce serait qui ?",
  "Quel est le pire cadeau que tu as reçu, et l'as-tu revendu ?",
  "Quelle habitude bizarre as-tu quand personne ne te regarde ?",
  "Quel est ton pire fail en public ?",
  "As-tu déjà fait pipi ailleurs que dans des toilettes à l'âge adulte ?",
  "Quelle est la dernière fois que tu as pleuré, et pourquoi ?",
  "Quelle est la personne ici dont tu es le plus jaloux, et de quoi ?",
  "Quel est le pire job que tu as fait ?",
  "Quel est le secret que tu as gardé le plus longtemps ?",
  "As-tu déjà oublié le prénom de quelqu'un en pleine conversation ?",
  "Quelle est la chose la plus gênante dans ta chambre en ce moment ?",
  "Quel est ton pire souvenir de soirée ?",
  "Qui ici a le pire goût musical selon toi ?",
  "Quelle célébrité imaginaire inventerais-tu pour te remplacer ?",
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
  "Quel est ton plus gros râteau ?",
  "As-tu déjà stalké un ex sur les réseaux ? Jusqu'où ?",
  "Quelle est la pire chose que tu as dite sur quelqu'un ici dans son dos ?",
  "Quel est le défaut que tu détestes chez toi ?",
  "Quel est le plat que tu rates à chaque fois ?",
  "Quel est le moment où tu as eu le plus peur de ta vie ?",
  "As-tu déjà fait semblant d'aimer un cadeau devant la personne ici ?",
  "Quelle est la chose la plus folle que tu as faite pour impressionner quelqu'un ?",
  "Quel est ton pire souvenir de premier rendez-vous ?",
  "À qui ici confierais-tu tes clés, et à qui jamais ?",
  "Quelle est la règle que tu enfreins le plus souvent ?",
  "Qu'est-ce que tu n'avouerais jamais à ta famille ?",
  "Quel est ton record de jours sans te laver les cheveux ?",
  "Quel est le pire mensonge que tu as cru pendant des années ?",
  "Quel est le truc que tu fais mal mais que tu prétends maîtriser ?",
  "Quelle est ta théorie du complot préférée, même si tu n'y crois pas ?",
  "Quelle est la dernière personne que tu as bloquée, et pourquoi ?",
  "As-tu déjà fait une sieste au travail ou en cours ? Où ?",
  "Quel est le moment où tu t'es senti le plus ridicule ?",
  "Quelle est la personne ici avec qui tu ne voudrais pas être coloc ?",
  "Quelle est la chose que tu caches dans ton téléphone ?",
  "Quel est le pire conseil que tu as donné à quelqu'un ?",
  "As-tu déjà mangé un truc tombé par terre devant tout le monde ?",
  "Quel est le jeu dans lequel tu triches sans aucune honte ?",
  "Quelle est la pire tenue que tu as portée en soirée ?",
  "Quelle est ta plus grande fierté inutile ?",
  "Quelle est la chose la plus enfantine qui te fait encore peur ?",
  "Si {A} était un plat, ce serait lequel ?",
  "Quel est le premier truc que tu as pensé de {A} ?",
  "Qu'est-ce que tu changerais chez {A} si tu pouvais ?",
  "Quel souvenir avec {A} te fait encore rire ?",
  "Quel est le secret de {A} que tu pourrais révéler sans te fâcher avec ?",
  "Quel surnom donnerais-tu à {A} ?",
  "Que fera {A} dans dix ans, selon toi ?",
  "Quelle est la chose la plus agaçante que fait {A} ?",
  "Qui préfères-tu entre {A} et {B} pour un voyage de deux semaines ?",
  "Quel est le moment le plus gênant que tu as vécu avec {A} ?",
  "Quelle est la chose que tu admires secrètement chez {A} ?",
  "Quel animal serait {A} dans une autre vie ?",
  "Quelle est la dernière chose qui t'a mis vraiment en colère ?",
  "As-tu déjà menti dans ce jeu ? Quand ?",
  "Quel est le truc le plus bizarre que tu as googlé sur toi-même ?",
  "Quel est le meilleur mensonge que tu as servi à un prof ou un patron ?",
  "Quel est le contact le plus gênant de ton téléphone ?",
  "Quelle est la phrase que tu dis tout le temps sans t'en rendre compte ?",
  "Qu'est-ce que tu as fait de plus nul pour avoir des likes ?",
  "Quel est le dernier truc que tu as acheté et caché ?",
  "Quel est le pire anniversaire que tu as vécu ?",
  "Qui ici te ressemble le plus, et ça te gêne ?",
  "As-tu déjà chanté ou parlé tout seul sans savoir que quelqu'un écoutait ?",
  "Quel personnage de dessin animé était ton premier crush ?",
  "Quelle est la plus grosse bêtise que tu as faite en étant pompette ?",
  "Quel est ton record de messages non lus ?",
  "Quel prénom n'oserais-tu jamais donner à ton enfant ?",
  "Quelle est l'excuse la plus nulle que tu as donnée pour annuler une soirée ?",
  "Qu'as-tu fait de plus courageux dans ta vie ?",
  "Quelle est la dernière personne qui t'a fait rougir ?",
  "Quel est ton rituel le plus étrange avant de dormir ?",
  "Quelle est la dernière fois que tu as menti dans cette soirée ?",
  "Quelle est la pire photo de toi qui existe, et qui l'a ?",
  "Quel est ton plus gros regret de l'année ?",
  "À quel âge as-tu arrêté de croire au père Noël, et qui t'a cassé le rêve ?",
  "As-tu déjà fait un câlin à quelqu'un juste pour finir une conversation ?",
  "Quel métier aurais-tu fait si tu n'avais peur de rien ?",
  "Quelle est la plus grosse dispute que tu as eue pour un truc débile ?",
  "Quelle est la dernière chose que tu as dite que tu n'aurais pas dû ?",
  "Quelle est la pire chose que tu as faite à un frère, une sœur ou un cousin ?",
  "Qui ici est le plus susceptible d'avoir une double vie ?",
  "Quelle est la phrase la plus nulle que tu as utilisée pour draguer ?"
  ],
  "hot": [
  "Avec combien de personnes as-tu couché ? Le vrai chiffre.",
  "Quel est ton fantasme le plus avouable ?",
  "Quel est le lieu le plus insolite où tu as embrassé quelqu'un ?",
  "Qui ici embrasse le mieux, d'après toi ?",
  "Quelle est la partie du corps qui te fait craquer chez quelqu'un ?",
  "Quel est ton pire premier baiser ?",
  "As-tu déjà eu un crush sur quelqu'un dans cette pièce ?",
  "Quelle est la chose la plus osée que tu as faite pour séduire ?",
  "As-tu déjà couché le premier soir ? Raconte le contexte.",
  "Quel est ton record de durée sans relation, dans un sens ou dans l'autre ?",
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
  "Quel est le plus long moment que tu as passé sans sexe ?",
  "Quel est le message le plus chaud que tu as reçu ?",
  "As-tu déjà eu une aventure avec un collègue ?",
  "Quel est ton pire souvenir au lit ?",
  "As-tu déjà été en couple avec deux personnes en même temps ?",
  "Est-ce que tu as déjà embrassé quelqu'un du même genre que toi ?",
  "Quelle est la chose la plus romantique que tu as faite pour quelqu'un ?",
  "Quelle est la personne la plus âgée avec qui tu es sorti ?",
  "Qu'est-ce qui t'excite le plus, la voix, le regard ou l'odeur ?",
  "As-tu déjà fait l'amour dans un lieu public ?",
  "As-tu déjà eu un sex-friend ? Comment ça s'est terminé ?",
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
  "Quel est le pire moment où tu as eu envie de quelqu'un ?",
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
  "Quelle partie de toi préfères-tu dans un miroir ?",
  "Quel est ton plus gros fantasme de rencontre ?",
  "As-tu déjà dormi avec quelqu'un sans rien faire, et regretté ?",
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
  "Lumière allumée ou éteinte ?",
  "Quel est le moment de la journée où tu as le plus envie ?",
  "As-tu déjà fait l'amour en sachant que quelqu'un pouvait entendre ?",
  "Quel est ton record de rapports en une nuit ?",
  "As-tu déjà eu une relation à distance ? Comment tu gérais le manque ?",
  "Quelle est la phrase de drague qui marcherait sur toi ?",
  "Qu'est-ce qui te fait fuir immédiatement chez quelqu'un ?",
  "As-tu déjà eu un crush sur ton patron ou ta patronne ?",
  "Quel est le rencard le plus cher que tu as payé pour rien ?",
  "As-tu déjà été dans un jacuzzi avec quelqu'un qui te plaisait ?",
  "Quelle est la chose la plus sexy qu'on t'a dite ?",
  "Quel est le moment où tu t'es senti le plus désirable ?",
  "As-tu déjà échangé des photos coquines ?",
  "As-tu déjà fait un plan à trois, ou failli en faire un ?",
  "Quelle est la personne ici avec qui tu aurais le plus d'alchimie ?",
  "Quelle est ta plus grosse peur au lit ?",
  "Quelle est la chose que tu n'as jamais osé demander à un partenaire ?",
  "As-tu déjà pleuré après une rupture que tu avais provoquée ?",
  "Quelle est ta plus longue relation, et pourquoi elle s'est arrêtée ?",
  "Quel est le moment le plus gênant que tu as vécu avec un ex ?",
  "Câlin du matin ou du soir ?",
  "Qui ici serait le plus sauvage au lit, selon toi ?",
  "Quelle est la dernière fois que tu as fait l'amour ?",
  "Qu'est-ce qui te rend le plus jaloux en couple ?",
  "Quel est le geste tendre qui te fait fondre ?",
  "As-tu déjà dragué dans ce groupe sans que personne ne le remarque ?"
  ],
  "hard": [
  "Quel est ton kink le plus inavouable ?",
  "Quelle est la catégorie que tu regardes le plus sur les sites pour adultes ?",
  "Raconte en détail ta dernière fois.",
  "Quel est le sex-toy que tu possèdes ou que tu rêves d'avoir ?",
  "As-tu déjà fait une sextape ? Avec qui, sans nom ?",
  "Quelle est la position que tu détestes, et pourquoi ?",
  "Quel est le truc le plus sale que tu as fait au lit ?",
  "As-tu déjà joui en moins d'une minute ? Raconte.",
  "Quelle est ta plus grosse honte sexuelle ?",
  "Quelle est la chose la plus bizarre qu'un partenaire t'a demandée ?",
  "As-tu déjà été dans une soirée échangiste ou libertine ?",
  "Combien de fois par semaine te fais-tu plaisir tout seul ?",
  "Quel est l'endroit le plus risqué où tu t'es fait plaisir ?",
  "As-tu déjà été attaché ou attaché quelqu'un ?",
  "Quel est le meilleur orgasme de ta vie ? Contexte complet.",
  "As-tu déjà essayé la sodomie ? Verdict ?",
  "Quelle est la phrase la plus crue qu'on t'a dite au lit ?",
  "As-tu déjà couché avec quelqu'un dont tu ne connaissais pas le prénom ?",
  "Quel est le plus de partenaires que tu as eus en une semaine ?",
  "Quel est le scénario porno que tu aimerais vivre ?",
  "As-tu déjà été surpris en train de te faire plaisir ? Par qui ?",
  "Qu'est-ce que tu préfères recevoir au lit ?",
  "Qu'est-ce que tu préfères donner au lit ?",
  "As-tu déjà eu un plan à trois ? Avec quelle configuration ?",
  "Quelle est la chose que tu as faite au lit et jamais refaite ?",
  "As-tu déjà fait l'amour au travail ? Où exactement ?",
  "Quel est ton record de durée au lit ?",
  "Avale ou recrache, ou ça dépend ?",
  "Quelle partie de ton corps est la plus sensible ?",
  "As-tu déjà utilisé de la nourriture pendant un rapport ? Laquelle ?",
  "As-tu déjà dit le mauvais prénom pendant l'acte ?",
  "Quel est le pire bruit que tu as fait pendant un rapport ?",
  "As-tu déjà fait l'amour en essayant de ne faire aucun bruit ? Réussi ?",
  "Rasé, taillé ou nature ? Pour toi et chez les autres.",
  "As-tu déjà regardé du porno en pensant à quelqu'un ici ?",
  "As-tu déjà eu un fantasme sur quelqu'un dans cette pièce ? Décris-le sans dire qui.",
  "Quelle est ta pire panne au lit ?",
  "As-tu déjà payé pour un service coquin en ligne ?",
  "As-tu déjà fait du sexting avec un inconnu ?",
  "Quel est le plus long préliminaire que tu as vécu ?",
  "As-tu déjà eu une MST ? Comment tu l'as annoncé ?",
  "Quel est le fétiche qui te surprend toi-même ?",
  "As-tu déjà fait l'amour sur une plage ? Le sable, alors ?",
  "Quelle est la chose la plus dégoûtante qui t'est arrivée pendant un rapport ?",
  "Quel est ton rapport le plus court, et que s'est-il passé ?",
  "As-tu déjà eu une relation purement sexuelle de plus d'un an ?",
  "As-tu déjà été dans un club de strip-tease ?",
  "Quelle est la taille idéale, pour toi ? Tu peux répondre en geste.",
  "As-tu déjà simulé tellement bien que l'autre a applaudi ?",
  "Dominant, soumis, ou ça dépend de la personne ?",
  "Quel est le bruit qui t'excite le plus pendant un rapport ?",
  "Quel est l'objet du quotidien que tu as déjà détourné en jouet ?",
  "Quel est le rapport le plus bruyant de ta vie ? Les voisins ont dit quoi ?",
  "As-tu déjà couché avec deux personnes différentes le même jour ?",
  "As-tu déjà regretté un tatouage ou un piercing intime ?",
  "As-tu déjà fait l'amour dans un avion, un train ou un bateau ?",
  "Quelle est la chose la plus folle que tu as faite en plan d'un soir ?",
  "As-tu déjà fait un massage qui a fini au lit ?",
  "Quelle est la réplique de film porno qui te fait le plus rire ?",
  "As-tu déjà eu une crampe en plein milieu ? Raconte.",
  "As-tu déjà été trop bruyant dans une maison de vacances entre amis ?",
  "Quelle est la chose que tu aimerais que {A} te fasse au lit, en théorie ?",
  "Selon toi, {A} est plutôt fesses, seins ou regard ?",
  "Quel kink imagines-tu chez {A} ?",
  "Qui ici a le plus de partenaires au compteur, selon toi ?",
  "Qui ici a le plus de jouets dans sa table de nuit, selon toi ?",
  "Qui ici serait le plus doué en préliminaires ?",
  "Si tu devais faire un plan à trois avec {A} et {B}, qui ferait quoi ?",
  "Quel est le pire endroit où tu as eu un rapport ?",
  "As-tu déjà eu des menottes ou des liens ? Qui tenait la clé ?",
  "As-tu déjà eu une expérience avec quelqu'un du même genre ? Raconte.",
  "As-tu déjà fait l'amour pendant tes règles ou celles de ton partenaire ?",
  "Quel est le jeu de rôle que tu as déjà fait, ou que tu voudrais faire ?",
  "As-tu déjà filmé un moment intime à deux, d'un commun accord ? Vous l'avez gardé ?",
  "As-tu déjà fait un concours de quelque chose de sexuel ?",
  "Quel est le plus gros mensonge que tu as dit pour coucher avec quelqu'un ?",
  "Quel est ton plus gros fail de sous-vêtements au moment crucial ?",
  "As-tu déjà eu un rapport sous l'emprise de la fatigue au point de t'endormir pendant ?",
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
  "Quelle est la dernière vidéo pour adultes que tu as regardée ? Le titre approximatif."
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
  "Laisse {A} écrire un statut sur ton réseau social préféré, en restant gentil.",
  "Appelle un ami et chante-lui joyeux anniversaire, même si ce n'est pas le jour.",
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
  "Appelle un numéro de ton répertoire au hasard et souhaite-lui une bonne soirée.",
  "Fais une chorégraphie sur le prochain son que le groupe choisit.",
  "Raconte une histoire en inventant un mot sur deux.",
  "Tiens-toi sur un pied jusqu'à ton prochain tour.",
  "Prends un selfie avec la tête la plus moche possible et mets-le en fond d'écran.",
  "Fais le présentateur météo de la soirée.",
  "Dis l'alphabet à l'envers le plus vite possible.",
  "Fais semblant d'être un robot pendant une minute.",
  "Laisse {A} t'appeler par un surnom de son choix jusqu'à la fin de la partie.",
  "Joue une scène de rupture dramatique avec {A}.",
  "Fais un tutoriel beauté avec ce que tu trouves sur la table.",
  "Récite le plus long mot que tu connais, puis fais une phrase avec.",
  "Fais rire {A} en moins de 30 secondes, sans le toucher.",
  "Imite un influenceur qui présente un produit absurde.",
  "Parle à la troisième personne jusqu'à ton prochain tour.",
  "Fais une déclaration enflammée à ton plat préféré.",
  "Fais 20 secondes de beatbox.",
  "Montre ta capture d'écran la plus gênante.",
  "Mange un aliment choisi par le groupe dans ce qu'il y a sur la table.",
  "Laisse {A} t'imposer une pose de statue pendant 30 secondes.",
  "Raconte le pire rêve que tu as fait, en mimant les passages clés.",
  "Joue de l'air guitar sur un solo imaginaire.",
  "Envoie un emoji au hasard à la cinquième personne de tes conversations.",
  "Fais un tour de magie, même raté.",
  "Lis une notice de produit comme un poème romantique.",
  "Fais une interview de {A} comme un journaliste de télé.",
  "Fais le cri de guerre de la soirée et fais-le répéter à tout le monde.",
  "Mime un métier pendant que les autres devinent.",
  "Laisse le groupe regarder tes trois dernières photos de la galerie.",
  "Essaie de lécher ton coude.",
  "Fais une imitation de ton prof ou patron le plus marquant.",
  "Change de place avec {A} et imite sa posture jusqu'à ton prochain tour.",
  "Fais un rap improvisé de huit mesures sur la soirée.",
  "Raconte ta pire honte avec une voix de conteur pour enfants.",
  "Mets ton pull à l'envers jusqu'à ton prochain tour.",
  "Fais semblant d'être un guide touristique qui présente la pièce.",
  "Garde les yeux fermés jusqu'à ton prochain tour.",
  "Laisse {A} choisir ta sonnerie de téléphone pour la soirée.",
  "Fais le bruit d'un animal à chaque fois que quelqu'un dit ton prénom, jusqu'à ton prochain tour.",
  "Explique la règle d'un jeu inventé en 30 secondes, avec sérieux.",
  "Fais un slow avec un balai ou un coussin.",
  "Ne dis ni oui ni non jusqu'à ton prochain tour.",
  "Fais la statue de la liberté avec ce que tu as sous la main.",
  "Parle comme un pirate jusqu'à ton prochain tour.",
  "Fais un massage des épaules à {A}, s'il ou elle est d'accord.",
  "Raconte une anecdote sur {A} que personne ne connaît.",
  "Fais l'éloge de {B} comme si c'était un héros national.",
  "Chuchote un secret à {A}, qui décide s'il doit être révélé.",
  "Fais 30 secondes de planche.",
  "Imite un bébé qui découvre le monde pendant 20 secondes.",
  "Laisse {A} écrire un mot sur ta main au stylo.",
  "Fais semblant de pleurer de joie en ouvrant un cadeau imaginaire.",
  "Prends l'accent de ta région ou d'une autre pour lire un message de ton téléphone.",
  "Fais une danse de la victoire à chaque fois que quelqu'un réussit une action jusqu'à ton prochain tour.",
  "Garde un glaçon dans ta main le plus longtemps possible, puis passe-le à {A}.",
  "Réponds à toutes les questions par une question jusqu'à ton prochain tour.",
  "Fais semblant de vendre ton téléphone aux enchères au groupe.",
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
  "Fais un bisou sur la joue de la personne de ton choix qui accepte.",
  "Enlève un vêtement de ton choix, hors sous-vêtements.",
  "Fais une danse sensuelle de 30 secondes devant le groupe.",
  "Murmure une phrase coquine à l'oreille de {A}, si {A} est d'accord.",
  "Fais un massage des épaules à {A} pendant une minute, si {A} accepte.",
  "Envoie un message de drague à ton crush actuel, ou à ton dernier match.",
  "Embrasse le cou de la personne de ton choix qui accepte.",
  "Fais ton meilleur regard de séduction à {A} pendant 10 secondes sans rire.",
  "Assieds-toi sur les genoux de {A} jusqu'à ton prochain tour, si {A} est d'accord.",
  "Lis ta dernière conversation avec un crush avec une voix langoureuse.",
  "Fais un strip-tease d'un seul accessoire en musique.",
  "Mime ta façon de draguer en boîte, avec {A} comme cible s'il ou elle accepte.",
  "Mords-toi doucement la lèvre en regardant {A} dans les yeux pendant 5 secondes, si {A} est d'accord pour jouer le jeu.",
  "Fais un slow collé-serré avec la personne de ton choix qui accepte.",
  "Montre la conversation la plus coquine de ton téléphone, en cachant le nom.",
  "Fais un compliment sexy à chaque personne de la pièce.",
  "Embrasse la main de {A} comme dans un film d'époque, s'il ou elle est d'accord.",
  "Laisse {A} choisir un vêtement que tu dois enlever, hors sous-vêtements.",
  "Fais une déclaration enflammée à {A}, en le regardant dans les yeux.",
  "Mime ta position préférée seul, sans un mot.",
  "Échange ton haut avec {A} jusqu'à ton prochain tour, si {A} accepte.",
  "Décris ton rencard idéal comme une publicité de parfum.",
  "Fais un bisou sur le front de chaque personne qui accepte.",
  "Danse un tango avec {A}, si {A} est d'accord.",
  "Raconte ton meilleur baiser en mimant les moments clés.",
  "Laisse {A} te faire un suçon sur le bras, si vous êtes tous les deux d'accord.",
  "Fais semblant d'être sur une appli de rencontre et présente-toi en 20 secondes.",
  "Prends une photo sexy, mais habillée, et mets-la en fond d'écran jusqu'à demain.",
  "Caresse les cheveux de {A} pendant 20 secondes, si {A} accepte.",
  "Fais un câlin de 10 secondes à la personne de ton choix qui accepte.",
  "Imite un gémissement de film romantique pendant 3 secondes.",
  "Dis à {A} ce que tu trouves le plus attirant chez lui ou elle.",
  "Fais un défilé en sous-vêtements imaginaire, en restant habillé, et commente-le.",
  "Fais un bisou esquimau à {A}, s'il ou elle est d'accord.",
  "Écris un SMS coquin à ton ou ta partenaire, ou à ton crush, et montre-le avant d'envoyer.",
  "Fais un massage des mains à {A} avec de la crème, si {A} accepte.",
  "Enlève tes chaussettes avec les dents.",
  "Imite la façon dont tu dragues par message, à voix haute.",
  "Fais un twerk de 10 secondes.",
  "Laisse {A} t'écrire un mot doux au feutre sur l'épaule, si tu es d'accord.",
  "Regarde {A} dans les yeux pendant 30 secondes sans parler, si {A} accepte.",
  "Choisis quelqu'un qui accepte et faites-vous un bisou sur la joue en même temps.",
  "Fais une pose de calendrier sexy pendant que le groupe compte jusqu'à 10.",
  "Décris en trois mots ce que tu ferais à {A} sur une île déserte.",
  "Danse lascivement avec un coussin pendant 20 secondes.",
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
  "Mime un baiser passionné avec ta propre main.",
  "Montre ton profil sur une appli de rencontre, ou crée-en un fictif à voix haute.",
  "Fais le serveur sexy pour {A} pendant un tour : sers-le avec style.",
  "Fais une demande en mariage romantique à {A}, à genoux, si {A} accepte de jouer la scène.",
  "Retire un accessoire de {A} avec les dents, si {A} est d'accord.",
  "Raconte ton plus beau souvenir de séduction en 30 secondes.",
  "Fais semblant de séduire un objet de la pièce pendant 20 secondes.",
  "Laisse {A} te faire une coiffure sexy, si tu es d'accord.",
  "Laisse le groupe choisir une personne qui accepte de recevoir un bisou de toi sur la joue.",
  "Fais un clin d'œil séducteur à chaque joueur, sans rire.",
  "Imite la scène de séduction d'un film romantique célèbre avec {A}, s'il ou elle accepte.",
  "Danse collé-serré avec un coussin comme si c'était l'amour de ta vie.",
  "Masse les pieds de {A} pendant 30 secondes, si {A} est d'accord.",
  "Raconte ton fantasme le plus soft en chuchotant.",
  "Choisis la personne qui a le plus beau sourire et dis-lui pourquoi.",
  "Fais un câlin par derrière à {A}, si {A} accepte.",
  "Enlève ta ceinture ou ton bijou de la façon la plus sensuelle possible.",
  "Fais un bisou dans le cou de {A}, si {A} est d'accord, sinon fais-en un à ta propre main.",
  "Montre au groupe comment tu embrasses, sur ta main.",
  "Laisse {A} te dessiner un cœur au rouge à lèvres sur la joue, si tu acceptes.",
  "Joue la scène de la réconciliation sur l'oreiller avec un coussin.",
  "Fais un compliment sur le corps de {A}, élégant mais honnête.",
  "Prends {A} dans tes bras et berce-le pendant 10 secondes, si {A} est d'accord.",
  "Fais semblant d'enlever un vêtement très lentement, sans rien enlever.",
  "Invente un surnom sexy pour {A} et utilise-le jusqu'à la fin de la partie.",
  "Fais une danse sensuelle avec {A} pendant 20 secondes, si {A} accepte.",
  "Dis à {A} une phrase de drague ringarde avec le plus grand sérieux.",
  "Laisse quelqu'un qui accepte te faire un bisou sur la joue, au choix du groupe.",
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
  "Décris ta dernière fois en détail, sans nommer la personne.",
  "Reste en sous-vêtements jusqu'à ton prochain tour, ou enlève un vêtement de plus.",
  "Fais un strip-tease jusqu'aux sous-vêtements en musique, ou en garde un si tu préfères.",
  "Embrasse {A} sur la bouche, si {A} est d'accord, sinon un bisou sur la joue de ton choix.",
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
  "Fais un gémissement à chaque fois que quelqu'un dit un chiffre jusqu'à ton prochain tour.",
  "Simule un orgasme comme si tu avais un public de mille personnes.",
  "Raconte ton plan d'un soir le plus fou comme un commentateur sportif.",
  "Danse collé contre {A} en musique pendant 30 secondes, si {A} est d'accord.",
  "Laisse {A} écrire un mot coquin au feutre sur ton ventre, si tu acceptes.",
  "Fais semblant d'enlever la ceinture de {A} d'une seule main, sans toucher, à 10 centimètres, si {A} est d'accord.",
  "Mets un glaçon dans ta bouche et fais-le glisser sur le bras de {A}, si {A} accepte.",
  "Fais une démonstration de ta technique de baiser sur une pêche ou une prune.",
  "Mime la position du missionnaire avec {A}, habillés et à distance, si {A} accepte.",
  "Mime la position de l'Andromaque avec {A}, habillés, si {A} est d'accord.",
  "Assieds-toi dos à {A} entre ses jambes jusqu'à ton prochain tour, si {A} accepte.",
  "Fais un bisou sur le ventre de {A}, si {A} est d'accord.",
  "Embrasse la personne de ton choix qui accepte pendant 5 secondes.",
  "Fais la voix que tu prends au lit pour dire une phrase banale.",
  "Raconte la chose la plus sale que tu as faite au lit, avec des détails.",
  "Explique comment tu te fais plaisir comme si c'était une recette de cuisine.",
  "Mets un sous-vêtement par-dessus tes vêtements jusqu'à la fin du tour.",
  "Embrasse {A} sur la bouche pendant 3 secondes, si {A} accepte, sinon embrasse ta main avec passion.",
  "Lèche du sucre ou du sel sur le poignet de {A}, si {A} est d'accord.",
  "Laisse le groupe choisir un vêtement que tu enlèves, sans aller plus loin que les sous-vêtements.",
  "Fais un lap dance à la chaise vide, comme si ta personne préférée était assise.",
  "Mime avec {A} une scène de jambes en l'air dans un ascenseur, habillés, si {A} accepte.",
  "Imite les bruits de tes voisins les soirs agités.",
  "Laisse {A} te mettre un bandeau et te faire deviner trois parties de son bras ou de son visage par le toucher, si vous êtes d'accord.",
  "Fais ton meilleur dirty talk à un coussin pendant 15 secondes.",
  "Laisse {A} te donner un ordre coquin à exécuter, dans les limites de ce que tu acceptes.",
  "Montre comment tu enlèves un préservatif de son emballage avec les dents, à vide ou avec un emballage de bonbon.",
  "Fais un body-check sexy à la personne de ton choix qui accepte, mains au-dessus des vêtements et hors zones intimes.",
  "Dis à voix haute ton nombre de partenaires et ta meilleure performance.",
  "Choisis la personne avec qui tu ferais un plan à trois parmi {A} et {B}, et explique pourquoi.",
  "Enlève ton pantalon ou ta jupe jusqu'à ton prochain tour, sous-vêtements gardés.",
  "Mime la fin d'un rapport, version film dramatique.",
  "Fais un suçon sur ta propre main en regardant {A} dans les yeux, si {A} accepte de soutenir ton regard.",
  "Lèche de la chantilly sur ton propre doigt de la façon la plus obscène possible.",
  "Masse le dos de {A} sous son haut pendant 30 secondes, si {A} est d'accord.",
  "Laisse {A} te lécher la joue, si vous êtes tous les deux d'accord.",
  "Raconte ton meilleur orgasme avec les bruitages.",
  "Mime avec {A} une position du Kamasutra choisie par le groupe, habillés, si {A} accepte.",
  "Fais le tour de la pièce à quatre pattes en ronronnant comme un fauve.",
  "Embrasse le nombril de {A}, si {A} est d'accord.",
  "Reste en sous-vêtements jusqu'à la fin de la manche, ou rhabille-toi en gardant un vêtement de moins.",
  "Imite la tête que tu fais au moment de jouir.",
  "Dessine au feutre sur ta peau ton sex-toy idéal et présente-le.",
  "Fais un bruit de lit qui grince avec ta bouche pendant que tu danses.",
  "Chevauche un coussin pendant 10 secondes comme au rodéo, regard brûlant.",
  "Laisse {A} t'enlever une chaussette avec les dents, si vous êtes d'accord.",
  "Fais un slow très collé avec {A} en lui murmurant des cochonneries, si {A} accepte.",
  "Décris l'anatomie de ton ex en trois adjectifs, sans le nommer.",
  "Embrasse le genou de {A} en remontant de deux bisous, si {A} est d'accord.",
  "Fais semblant de passer un coup de fil coquin à quelqu'un d'imaginaire, à voix haute.",
  "Mime comment tu enlèves un soutien-gorge, sur toi ou sur un coussin.",
  "Pose un glaçon sur le cou de {A} et laisse-le fondre 10 secondes, si {A} accepte.",
  "Fais une démonstration de ton geste fétiche au lit, sur un coussin.",
  "Enlève ton haut et fais un défilé dans la pièce."
  ]
};

const LEVELS = [
  { v: "soft", label: "Classique", desc: "Hontes, imitations, petits secrets : pour tout le monde" },
  { v: "hot", label: "Hot", desc: "Séduction, bisous, confessions sur ta vie sexuelle", hot: true },
  { v: "hard", label: "Hard", desc: "Très cru : sexe explicite, strip, défis sans filtre", hot: true }
];
// Gages du mode sans alcool.
const GAGES = [
  "10 pompes, tout de suite", "chante le refrain que le groupe choisit", "parle avec un accent jusqu'à ton prochain tour", "laisse le groupe écrire ton prochain statut",
  "fais le tour de la pièce en marchant comme un pingouin", "garde les yeux fermés jusqu'à ton prochain tour", "fais un compliment sincère à chaque joueur",
  "imite le joueur de ton choix pendant 30 secondes", "reste debout sur un pied pendant 1 minute", "danse 20 secondes sans musique",
  "laisse le joueur à ta gauche te coiffer comme il veut", "parle à la troisième personne jusqu'à ton prochain tour", "raconte une blague, et elle doit faire rire quelqu'un",
  "fais une déclaration d'amour dramatique à un objet de la pièce", "mange une cuillère du condiment choisi par le groupe", "envoie un emoji au hasard au 5e contact de ton téléphone",
  "porte un vêtement à l'envers jusqu'à la fin de la partie", "fais 20 squats en comptant à voix haute", "laisse le groupe choisir ta photo de profil pour 1 heure",
  "fais une pub de 20 secondes pour le verre de ton voisin", "réponds uniquement par des questions jusqu'à ton prochain tour", "fais le bruit d'un animal choisi par le groupe à chaque fois qu'on te parle",
  "garde une cuillère dans la bouche jusqu'à ton prochain tour", "masse les épaules du joueur à ta droite pendant 30 secondes, s'il est d'accord", "fais ta meilleure imitation d'une star du rap"
];
const SEEN = "actionverite:";
const TW = [
  { id: "x2", name: "Quitte ou double", desc: "Points doublés, et sanction doublée si tu refuses." },
  { id: "group", name: "Le groupe décide", desc: "Ce sont les autres qui choisissent : action ou vérité." },
  { id: "all", name: "Tout le monde y passe", desc: "Vérité imposée, et chacun doit y répondre à son tour.", ok: o => o.n >= 3 },
  { id: "mirror", name: "Effet miroir", desc: "Après toi, un autre joueur doit faire exactement la même chose." },
  { id: "nojk", name: "Sans filet", desc: "Pas de joker possible pour cette carte." },
  { id: "heat", name: "Montée en température", desc: "La carte est tirée dans le niveau au-dessus.", ok: o => o.up }
];
const twOf = id => SB.u.byTwist(TW, id);

/* ---------- Moteur commun ---------- */
const lvlIndex = v => LEVELS.findIndex(l => l.v === v);
function newGame(order, o){
  const lv = LEVELS.map(l => l.v).filter(v => A(o.packs).indexOf(v) >= 0);
  return { order: order.slice(), lv: lv.length ? lv : ["soft"], mode: o.mode === "soft" ? "soft" : "drink", laps: o.laps || 3, prog: o.prog !== false, twOn: o.twists !== false,
    i: 0, lap: 1, n: 0, phase: "choose", cur: order[0], kind: "", card: "", lvl: "", tw: "", mir: "", last: null,
    jk: Object.fromEntries(order.map(id => [id, o.jokers === false ? 0 : 2])),
    pts: {}, did: {}, told: {}, ref: {}, jok: {}, sips: {}, dk: {}, fl: Math.floor(Math.random() * 12) };
}
// Niveau de la carte : progressif (on monte au fil des tours) ou au hasard parmi les niveaux choisis.
function levelFor(E){
  const L = E.lv; if(L.length === 1) return L[0];
  if(!E.prog) return pick(L);
  const total = E.laps * E.order.length, done = (E.lap - 1) * E.order.length + E.i, k = Math.min(L.length - 1, Math.floor(done / total * L.length));
  return Math.random() < .2 && k > 0 ? L[k - 1] : L[k];
}
function draw(E, kind, lvl){
  const key = kind + ":" + lvl, src = (kind === "v" ? VT : AC)[lvl] || [];
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
function penText(E, n){ return E.mode === "drink" ? n + " gorgée" + (n > 1 ? "s" : "") : "gage : " + pick(GAGES) + (n >= 4 ? " (et un deuxième au choix du groupe)" : ""); }
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
  return esc(t).replace(/\{A\}/g, '<b class="av-n">' + esc(E.ca ? nameOf(E.ca) : "quelqu'un") + "</b>").replace(/\{B\}/g, '<b class="av-n">' + esc(E.cb ? nameOf(E.cb) : "quelqu'un d'autre") + "</b>");
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
  win: ["Le plus téméraire", "Sans peur et sans reproche", "Champion de la soirée", "Rien ne lui fait peur"],
  did: ["Trompe-la-mort", "Le plus courageux", "Toujours partant"],
  told: ["Livre ouvert", "Zéro secret", "Confessions intimes"],
  ref: ["Poule mouillée", "Champion du refus", "Le plus prudent"],
  sips: ["Gosier en pente", "Le plus assoiffé", "Abonné aux gorgées"]
};
const fl = (l, s, k) => l[((s || 0) + k) % l.length];
function awards(E, nameOf){
  const out = [], used = [];
  const top = (m, min, label, one, many) => { let b = "", v = min - 1; Object.keys(m || {}).forEach(id => { if((m[id] || 0) > v && used.indexOf(id) < 0){ v = m[id]; b = id; } }); if(b){ used.push(b); out.push([label, nameOf(b), m[b] + " " + (m[b] > 1 ? many : one)]); } };
  top(E.did, 2, fl(FL.did, E.fl, 1), "action", "actions");
  top(E.told, 2, fl(FL.told, E.fl, 2), "vérité", "vérités");
  top(E.ref, 2, fl(FL.ref, E.fl, 3), "refus", "refus");
  if(E.mode === "drink") top(E.sips, 4, fl(FL.sips, E.fl, 4), "gorgée", "gorgées");
  return out;
}
function awardsHTML(aw){ return aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : ""; }
function bars(E, nameOf){
  const max = Math.max(1, ...E.order.map(id => E.pts[id] || 0));
  return '<div class="bars">' + ranking(E).map(id => '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + (E.pts[id] || 0) + " pt" + ((E.pts[id] || 0) > 1 ? "s" : "") + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (E.pts[id] || 0) / max) + '%"></div></div></div>').join("") + "</div>";
}
function lastHTML(E, nameOf){
  const l = E.last; if(!l || !l.who) return "";
  const what = l.res === "no" ? '<span class="no">a refusé ' + (l.kind === "a" ? "l'action" : "la vérité") + "</span> · " + esc(l.txt) : l.res === "jk" ? "a utilisé un joker" : '<span class="ok">' + (l.kind === "a" ? "a relevé le défi" : "a dit la vérité") + "</span> · " + esc(l.txt);
  return '<div class="av-last"><b>' + esc(nameOf(l.who)) + "</b> " + what + "</div>";
}
function headHTML(E, nameOf){
  return CSS + '<div class="av-row"><span>Tour ' + Math.min(E.lap, E.laps) + " / " + E.laps + "</span><span>" + (E.mode === "drink" ? "Mode gorgées" : "Mode gages") + "</span></div>" + lastHTML(E, nameOf) + SB.u.twistHTML(twOf(E.tw));
}
/* Écran commun. can : { choose, settle } = ce téléphone peut agir. act(type, val). */
function turnHTML(E, nameOf, can){
  const who = nameOf(E.cur), jk = E.jk[E.cur] || 0;
  if(E.phase === "choose"){
    const grp = E.tw === "group";
    return headHTML(E, nameOf) + '<span class="eyebrow">' + (grp ? "Le groupe choisit pour" : "Au tour de") + '</span><div class="who">' + esc(who) + "</div>" +
      (can.choose ? '<div class="av-big"><button type="button" class="v" data-c="v">Vérité<small>+1 point</small></button><button type="button" class="a" data-c="a">Action<small>+2 points</small></button></div>' +
        '<button class="btn ghost" type="button" data-c="h">Au hasard · 1 point bonus</button>'
        : '<p class="howto">' + (grp ? "Les autres joueurs choisissent pour " + esc(who) + "…" : esc(who) + " choisit : action ou vérité ?") + "</p>") +
      '<p class="sm">Jokers restants : ' + jk + "</p>";
  }
  const lv = LEVELS[lvlIndex(E.lvl)] || LEVELS[0];
  return headHTML(E, nameOf) + '<span class="eyebrow">' + esc(who) + (E.rand ? " · tiré au hasard" : "") + "</span>" +
    '<div class="card acc"><span class="av-tag">' + (E.kind === "a" ? "Action" : "Vérité") + " · " + esc(lv.label) + '</span><div class="av-card">' + fillHTML(E.card, E, nameOf) + "</div>" +
    (E.tw === "all" ? '<span class="sm">Tout le monde répond, en commençant par ' + esc(who) + ".</span>" : "") +
    (E.mir ? '<span class="sm">Effet miroir : ' + esc(nameOf(E.mir)) + " le fait aussi juste après.</span>" : "") + "</div>" +
    (can.settle ? dock('<button class="btn acc" type="button" data-r="ok">' + (E.kind === "a" ? "Défi relevé !" : "J'ai répondu") + "</button>" +
      '<div class="row2">' + (jk > 0 && E.tw !== "nojk" ? '<button class="btn ghost" type="button" data-r="jk">Joker (' + jk + ")</button>" : '<button class="btn ghost" type="button" disabled>' + (E.tw === "nojk" ? "Sans filet" : "Plus de joker") + "</button>") +
      '<button class="btn ghost" type="button" data-r="no">Je refuse</button></div>' +
      '<p class="sm" style="text-align:center">Refuser : ' + esc(E.mode === "drink" ? pen(E, E.kind) + " gorgées" : "un gage") + "</p>")
      : dock('<p class="wait">' + esc(who) + " s'exécute… Le groupe juge !</p>"));
}
function bindTurn(r, act){
  r.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => { buzz(16); act("c", b.dataset.c); }));
  r.querySelectorAll("[data-r]").forEach(b => {
    if(b.dataset.r === "no") armTap(b, () => act("r", "no"), "Sûr ? Toucher encore");
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
  id: "actionverite", name: "Action ou vérité", glyph: "A/V", pitch: "Une vérité à avouer ou une action à faire. Refuser coûte cher.", hot: true,
  accent: { light: "#ff3d6e", dark: "#ff3d6e" },
  tag: "Chacun son tour choisit : une vérité à avouer devant tout le monde, ou une action à faire tout de suite. Refuser, c'est boire (ou prendre un gage).",
  min: 2, max: 16,
  rules: [
    "Chacun son tour choisit Vérité (+1 point) ou Action (+2 points). Au hasard : 1 point bonus.",
    "Le groupe juge : si tu as répondu franchement ou relevé le défi, tu marques. Tu peux refuser, mais ça coûte des gorgées (ou un gage en mode sans alcool).",
    "Deux jokers par partie pour passer une carte sans sanction.",
    "Trois niveaux : Classique, Hot (18+) et Hard (18+, très cru). En mode progressif, ça monte au fil des tours.",
    "Coups de théâtre : quitte ou double, le groupe décide, tout le monde y passe, effet miroir, sans filet, montée en température.",
    "Les actions qui touchent quelqu'un d'autre se font seulement si cette personne est d'accord. Les cartes ne reviennent pas d'une soirée à l'autre."
  ],
  options: [
    { id: "laps", label: "Tours de table", type: "seg", def: 3, values: [{ v: 2, label: "2" }, { v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "packs", label: "Niveaux", type: "multi", def: ["soft"], values: LEVELS.map(l => ({ v: l.v, label: l.label, desc: l.desc, hot: l.hot, count: VT[l.v].length + AC[l.v].length })) },
    { id: "mode", label: "Sanctions", type: "seg", def: "drink", values: [{ v: "drink", label: "Gorgées" }, { v: "soft", label: "Sans alcool" }] },
    { id: "prog", label: "Progressif", type: "toggle", text: "Niveau progressif", desc: "On commence doux, et ça monte au fil des tours", def: true },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "De temps en temps, une règle change pour un tour", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un niveau.");
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
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const F = fromState(c.s, {}), o2 = ranking(F), mx = F.pts[o2[0]] || 0;
          c.end({ title: "Action ou vérité · " + c.name(o2[0]) + " gagne", lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (F.pts[id] || 0) + " pts").concat(awards(F, c.name).slice(0, 2).map(a => a[0] + " : " + a[1])),
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
      (ctx.isHost ? '<button class="link" type="button" data-stop style="align-self:center">Terminer la partie</button>' : ""), r => {
      bindTurn(r, act);
      const st = r.querySelector("[data-stop]"); if(st) armTap(st, () => ctx.act(c => { const F = fromState(c.s, c.priv()); F.phase = "end"; publish(c, F); }), "Toucher encore pour terminer");
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
        screen(root, "su" + sel.join() + laps + mode + prog + twOn, CSS + '<p class="howto">Posez le téléphone au milieu. Chacun son tour choisit vérité ou action, le groupe juge, et on passe au suivant.</p>' +
          '<div class="field"><span class="eyebrow">Tours de table</span><div class="seg">' + [2, 3, 5, 8].map(n => '<button type="button" data-l="' + n + '" aria-pressed="' + (n === laps) + '">' + n + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">Niveaux</span><div class="packs">' + LEVELS.map(l => '<button type="button" class="pack' + (l.hot ? " hot" : "") + '" data-k="' + l.v + '" aria-pressed="' + (sel.indexOf(l.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(l.label) + (l.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(l.desc) + '</span></span><span class="ct">' + (VT[l.v].length + AC[l.v].length) + "</span></button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">Sanctions</span><div class="seg"><button type="button" data-m="drink" aria-pressed="' + (mode === "drink") + '">Gorgées</button><button type="button" data-m="soft" aria-pressed="' + (mode === "soft") + '">Sans alcool</button></div></div>' +
          '<div class="field"><span class="eyebrow">Variantes</span><div class="packs">' + tog("pg", prog, "Niveau progressif", "On commence doux, et ça monte au fil des tours") + tog("tw", twOn, "Coups de théâtre", "De temps en temps, une règle change pour un tour") + "</div></div>" +
          dock('<button class="btn acc" type="button" data-go>Commencer</button>'), r => {
          r.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => { laps = +b.dataset.l; persist({ avLaps: laps }); setup(); }));
          r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ avPacks: sel }); setup(); }));
          r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ avMode: mode }); setup(); }));
          r.querySelector("[data-pg]").addEventListener("click", () => { prog = !prog; persist({ avProg: prog }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ avTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast("Choisis au moins un niveau"); return; }
            E = newGame(shuffle(ids), { packs: sel, laps, mode, prog, twists: twOn }); startTurn(E, ids); turn();
          });
        });
      }
      function turn(){
        if(E.phase === "end") return finish();
        screen(root, "t" + E.n + E.phase, turnHTML(E, nameOf, { choose: true, settle: true }) + '<button class="link" type="button" data-stop style="align-self:center">Terminer la partie</button>', r => {
          bindTurn(r, (t, v) => { if(t === "c") reveal(E, v); else settle(E, v, ids); turn(); });
          armTap(r.querySelector("[data-stop]"), finish, "Toucher encore pour terminer");
        });
        if(E.phase === "card" && SB.fx) SB.fx.flip(root.querySelector(".card.acc"));
      }
      function finish(){
        E.phase = "end";
        const o2 = ranking(E), mx = E.pts[o2[0]] || 0;
        if(api.win && mx) api.win(o2.filter(id => (E.pts[id] || 0) === mx).map(nameOf));
        screen(root, "end" + E.n, endHTML(E, nameOf) + dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button>'), r => {
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
