/* Course de défis — le téléphone annonce un défi, les équipes foncent : la première qui réussit marque.
   En salon, un joueur de l'équipe touche « On l'a ! », l'hôte valide ou refuse. Sur un seul téléphone, on touche l'équipe gagnante.
   Paquets comme les autres jeux (objets, physique, malin, toute l'équipe, soirée, 18+, enfants) + nos défis. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, tr, buzz, clean } = SB.u;
const L = list => list.map(x => tr(x[0], x[1]));
const PACKS = [
  { v: "objets", label: tr("Chasse aux objets", "Scavenger hunt"), desc: tr("Ramenez vite le bon objet", "Bring back the right thing, fast"), list: L([
    ["Ramenez une chaussette (pas la vôtre).", "Bring back a sock (not your own)."],
    ["Ramenez un objet rouge.", "Bring back something red."],
    ["Ramenez une pièce de monnaie.", "Bring back a coin."],
    ["Ramenez 3 objets qui commencent par la lettre C.", "Bring back 3 things starting with the letter C."],
    ["Ramenez une cuillère.", "Bring back a spoon."],
    ["Ramenez un livre.", "Bring back a book."],
    ["Ramenez quelque chose de plus petit qu'un ongle.", "Bring back something smaller than a fingernail."],
    ["Ramenez un objet rond.", "Bring back something round."],
    ["Ramenez un ticket de caisse.", "Bring back a receipt."],
    ["Ramenez un bouchon.", "Bring back a cork or a bottle cap."],
    ["Ramenez une feuille de papier pliée en avion.", "Bring back a sheet of paper folded into a plane."],
    ["Ramenez 5 objets de 5 couleurs différentes.", "Bring back 5 things in 5 different colors."],
    ["Ramenez un objet qui fait du bruit.", "Bring back something that makes noise."],
    ["Ramenez un fruit ou un légume.", "Bring back a fruit or a vegetable."],
    ["Ramenez une paire de lunettes.", "Bring back a pair of glasses."],
    ["Ramenez un stylo qui marche, et prouvez-le.", "Bring back a working pen, and prove it."],
    ["Ramenez quelque chose de doux.", "Bring back something soft."],
    ["Ramenez une clé.", "Bring back a key."],
    ["Ramenez un objet dont le nom commence par la première lettre du prénom d'un(e) coéquipier(ère).", "Bring back something starting with your captain's first initial."],
    ["Ramenez une étiquette avec un code-barres.", "Bring back a label with a barcode."],
    ["Ramenez un élastique ou une pince à cheveux.", "Bring back a hair tie or a hair clip."],
    ["Ramenez quelque chose de bleu ET de doux.", "Bring back something blue AND soft."],
    ["Ramenez le plus vieil objet que vous puissiez trouver.", "Bring back the oldest thing you can find."],
    ["Ramenez un objet en bois.", "Bring back something made of wood."],
    ["Ramenez un emballage vide.", "Bring back an empty wrapper."],
    ["Ramenez un objet avec un chiffre écrit dessus.", "Bring back something with a number written on it."],
    ["Ramenez une chaussure gauche.", "Bring back a left shoe."],
    ["Ramenez un câble ou un chargeur.", "Bring back a cable or a charger."],
    ["Ramenez quelque chose qui brille.", "Bring back something shiny."],
    ["Ramenez un objet plus lourd qu'un téléphone mais qui tient dans une main.", "Bring back something heavier than a phone that fits in one hand."]
  ]) },
  { v: "physique", label: tr("Défis physiques", "Physical"), desc: tr("Ça bouge, ça transpire", "Get moving"), list: L([
    ["Toute l'équipe en planche pendant 20 secondes.", "Whole team holds a plank for 20 seconds."],
    ["Touchez les 4 murs de la pièce, chacun d'un doigt différent.", "Touch all 4 walls of the room, each with a different finger."],
    ["Formez la lettre T avec vos corps.", "Make the letter T with your bodies."],
    ["10 squats synchronisés, toute l'équipe ensemble.", "10 squats in sync, whole team together."],
    ["Faites tenir une pièce sur votre front et tournez sur vous-même 3 fois.", "Balance a coin on your forehead and spin around 3 times."],
    ["Un joueur fait 10 sauts sur un pied, puis 10 sur l'autre.", "One player does 10 hops on one foot, then 10 on the other."],
    ["Toute l'équipe tient en équilibre sur un pied, les yeux fermés, 10 secondes.", "Whole team stands on one foot, eyes closed, for 10 seconds."],
    ["Faites une chaîne humaine qui touche deux murs opposés.", "Make a human chain that touches two opposite walls."],
    ["Un joueur touche ses orteils sans plier les genoux pendant 10 secondes.", "One player touches their toes with straight legs for 10 seconds."],
    ["Asseyez-vous tous par terre et relevez-vous ensemble en vous tenant les bras, sans les mains au sol.", "All sit on the floor and stand up together arm in arm, no hands on the floor."],
    ["Faites une vague humaine (comme au stade) parfaite, 3 fois de suite.", "Do a perfect stadium wave, 3 times in a row."],
    ["Mimez un sport : les autres doivent deviner lequel.", "Act out a sport: the other team has to guess which one."],
    ["Un joueur fait 15 pompes (ou 25 sur les genoux).", "One player does 15 push-ups (or 25 on their knees)."],
    ["Faites un pont humain sous lequel un(e) coéquipier(ère) passe en rampant.", "Make a human bridge for a teammate to crawl under."],
    ["Tous les membres de l'équipe sautent en même temps, 5 fois, pile ensemble.", "Every team member jumps at the same time, 5 times, perfectly together."],
    ["Faites 20 secondes de chaise contre le mur.", "Hold a wall sit for 20 seconds."],
    ["Transportez un(e) coéquipier(ère) sur 3 mètres sans que ses pieds touchent le sol (en douceur !).", "Carry a teammate 3 meters without their feet touching the floor (gently!)."],
    ["Faites tourner un objet sur votre doigt pendant 5 secondes.", "Spin an object on your finger for 5 seconds."],
    ["Formez avec vos corps le nombre du jour (ex. : 27).", "Make today's day of the month with your bodies."],
    ["Un joueur marche 5 pas en arrière, les yeux fermés, guidé seulement à la voix.", "One player walks 5 steps backwards with eyes closed, guided by voice only."],
    ["Faites rebondir une balle (ou une boulette de papier) 10 fois sur la tête… ou sur le genou.", "Bounce a ball (or a paper ball) 10 times on your head... or your knee."],
    ["Toute l'équipe dos à dos, bras croisés : tenez 15 secondes sans bouger.", "Whole team back to back, arms crossed: hold still for 15 seconds."],
    ["Danse synchronisée de 10 secondes, inventée sur place.", "A 10-second synchronized dance, made up on the spot."],
    ["Un joueur fait le tour de la pièce à quatre pattes.", "One player goes around the room on all fours."],
    ["Lancez une chaussette dans un saladier (ou un verre vide) à 3 mètres.", "Throw a sock into a bowl (or an empty glass) from 3 meters."]
  ]) },
  { v: "malin", label: tr("Créatif et malin", "Creative & clever"), desc: tr("Dessin, mots, chansons, astuce", "Drawing, words, songs, wits"), list: L([
    ["Dessinez un chat les yeux fermés : l'hôte doit le reconnaître.", "Draw a cat with your eyes closed: the host has to recognize it."],
    ["Trouvez 5 mots qui riment avec « soirée ».", "Find 5 words that rhyme with \"night\"."],
    ["Chantez un refrain qui contient le mot « amour ».", "Sing a chorus with the word \"love\" in it."],
    ["Écrivez le prénom de tous les joueurs à l'envers.", "Write every player's name backwards."],
    ["Citez 10 pays d'Afrique.", "Name 10 African countries."],
    ["Faites une phrase de 8 mots qui commencent tous par la même lettre.", "Make an 8-word sentence where every word starts with the same letter."],
    ["Récitez l'alphabet à l'envers sans erreur.", "Say the alphabet backwards without a mistake."],
    ["Faites deviner un film en mime à l'hôte.", "Get the host to guess a film by miming it."],
    ["Inventez un slogan pour la soirée et criez-le tous ensemble.", "Make up a slogan for the party and shout it together."],
    ["Trouvez 3 chansons avec un prénom dans le titre.", "Find 3 songs with a first name in the title."],
    ["Fabriquez un chapeau avec ce que vous trouvez et mettez-le sur la tête d'un joueur.", "Make a hat out of whatever you find and put it on a player's head."],
    ["Écrivez un poème de 4 vers sur l'hôte.", "Write a 4-line poem about the host."],
    ["Citez 7 animaux qui commencent par la lettre P.", "Name 7 animals starting with the letter P."],
    ["Comptez combien il y a de lampes dans la pièce, sans erreur.", "Count exactly how many lamps are in the room."],
    ["Faites une sculpture humaine qui représente « le lundi matin ».", "Make a human sculpture of \"Monday morning\"."],
    ["Trouvez l'objet le plus inutile de la pièce et défendez-le en 15 secondes.", "Find the most useless object in the room and defend it in 15 seconds."],
    ["Fredonnez un générique de dessin animé : l'hôte doit le reconnaître.", "Hum a cartoon theme song: the host has to recognize it."],
    ["Citez 5 marques de voitures françaises ou italiennes.", "Name 5 French or Italian car brands."],
    ["Faites un tour de magie (même nul) devant l'hôte.", "Do a magic trick (even a bad one) for the host."],
    ["Dessinez la soirée en 30 secondes, l'hôte juge.", "Draw tonight's party in 30 seconds, the host judges."],
    ["Trouvez le plus long mot possible avec les lettres de « soirée box ».", "Find the longest word possible from the letters in \"party night\"."],
    ["Racontez une blague qui fait rire l'hôte.", "Tell a joke that makes the host laugh."],
    ["Inventez une danse qui s'appelle « la patate » et apprenez-la à l'hôte.", "Invent a dance called \"the potato\" and teach it to the host."],
    ["Citez 10 fromages.", "Name 10 cheeses."],
    ["Faites deviner « une girafe » sans parler ni mimer le cou.", "Get someone to guess \"a giraffe\" without talking or miming the neck."]
  ]) },
  { v: "equipe", label: tr("Toute l'équipe", "Whole team"), desc: tr("Il faut que tout le monde s'y mette", "Everyone has to join in"), list: L([
    ["Alignez-vous par ordre de taille.", "Line up by height."],
    ["Alignez-vous par date d'anniversaire (de janvier à décembre).", "Line up by birthday (January to December)."],
    ["Alignez-vous par ordre alphabétique de prénom, sans parler.", "Line up in alphabetical order of first names, without talking."],
    ["Prenez une photo de groupe où personne ne sourit.", "Take a group photo where nobody smiles."],
    ["Mettez-vous tous sur une seule chaise (ou un seul coussin) pendant 5 secondes.", "Fit everyone on one chair (or one cushion) for 5 seconds."],
    ["Chantez « Joyeux anniversaire » en canon.", "Sing \"Happy Birthday\" together as a round."],
    ["Faites un cri de guerre d'équipe et montrez-le à l'hôte.", "Make up a team war cry and show it to the host."],
    ["Échangez chacun vos chaussures avec un(e) coéquipier(ère).", "Everyone swaps shoes with a teammate."],
    ["Faites une pyramide humaine à genoux (au moins 3 personnes, en douceur).", "Make a kneeling human pyramid (at least 3 people, gently)."],
    ["Comptez jusqu'à 20 à tour de rôle sans que deux personnes parlent en même temps.", "Count to 20 taking turns, without two people talking at once."],
    ["Faites tous la même grimace en même temps, sans vous concerter.", "Everyone makes the same face at the same time, without discussing it."],
    ["Écrivez un mot par personne pour former une phrase qui a du sens.", "Each person writes one word to make a sentence that makes sense."],
    ["Faites une ola assis, en vous tenant tous par le petit doigt.", "Do a seated wave, all holding pinky fingers."],
    ["Trouvez un point commun que toute l'équipe partage (et que l'hôte valide).", "Find something the whole team has in common (that the host approves)."],
    ["Mimez tous ensemble une machine à laver qui essore.", "Act out a washing machine on spin cycle, all together."],
    ["Formez un cercle et faites faire 3 fois le tour du cercle à un objet, sans les mains.", "Make a circle and pass an object around 3 times without hands."],
    ["Faites un selfie d'équipe avec un joueur d'une autre équipe dedans.", "Take a team selfie with a player from another team in it."],
    ["Chuchotez une phrase de bouche à oreille : la dernière personne doit la redire juste.", "Whisper a sentence down the line: the last person must say it back right."],
    ["Applaudissez tous en rythme pendant 15 secondes sans vous décaler.", "Clap together in rhythm for 15 seconds without losing the beat."],
    ["Racontez une histoire où chacun ajoute une phrase : 2 tours complets.", "Tell a story where each person adds a sentence: 2 full rounds."]
  ]) },
  { v: "soiree", label: tr("Soirée", "Party"), desc: tr("Verres, apéro et ambiance de fête", "Glasses, snacks and party vibes"), hot: true, list: L([
    ["Ramenez un verre rempli d'eau à ras bord sans en renverser une goutte.", "Bring back a glass filled to the brim with water without spilling a drop."],
    ["Faites trinquer toute l'équipe avec quelqu'un de chaque autre équipe.", "Make your whole team clink glasses with someone from every other team."],
    ["Construisez la plus haute tour possible avec des verres ou des gobelets vides.", "Build the tallest tower you can with empty glasses or cups."],
    ["Ramenez 3 bouchons différents.", "Bring back 3 different corks or caps."],
    ["Faites un discours de mariage de 20 secondes pour l'hôte.", "Give a 20-second wedding toast for the host."],
    ["Lancez une chips dans la bouche d'un(e) coéquipier(ère) à 2 mètres.", "Toss a chip into a teammate's mouth from 2 meters."],
    ["Mettez une chanson de mariage et faites danser l'hôte.", "Play a wedding song and get the host dancing."],
    ["Composez un cocktail sans alcool avec ce qu'il y a et faites-le goûter à l'hôte.", "Make an alcohol-free cocktail from what's around and have the host taste it."],
    ["Trouvez qui, dans la pièce, a la plus vieille photo sur son téléphone.", "Find who in the room has the oldest photo on their phone."],
    ["Faites un karaoké de 15 secondes sur le refrain choisi par l'hôte.", "Do 15 seconds of karaoke on a chorus chosen by the host."],
    ["Ramenez un objet que vous n'auriez jamais apporté à une soirée.", "Bring back something you'd never bring to a party."],
    ["Faites la meilleure photo « pochette d'album » avec votre équipe.", "Take the best \"album cover\" photo with your team."],
    ["Retrouvez le prénom complet (avec deuxième prénom) d'un joueur d'une autre équipe.", "Find out the full name (with middle name) of a player from another team."],
    ["Faites un défilé de mode de 10 secondes avec un accessoire improvisé.", "Do a 10-second fashion show with an improvised accessory."],
    ["Mettez en scène une pub de 15 secondes pour la boisson de l'hôte.", "Act out a 15-second ad for the host's drink."],
    ["Faites tenir 3 bouchons empilés sur le dos de votre main pendant 5 secondes.", "Balance 3 stacked caps on the back of your hand for 5 seconds."],
    ["Organisez un slow de 10 secondes entre deux joueurs volontaires de votre équipe.", "Set up a 10-second slow dance between two willing teammates."],
    ["Trouvez la personne de la soirée qui est née le plus loin d'ici.", "Find the person here who was born farthest away."]
  ]) },
  { v: "hot", label: tr("Pimenté 18+", "Spicy 18+"), desc: tr("Coquin, toujours entre volontaires", "Cheeky, always with willing players"), hot: true, list: L([
    ["Échangez un vêtement avec un(e) coéquipier(ère) volontaire (au-dessus de la ceinture).", "Swap a piece of clothing with a willing teammate (above the waist)."],
    ["Faites un câlin collectif de 10 secondes, toute l'équipe.", "Do a 10-second group hug, whole team."],
    ["Ramenez un rouge à lèvres, un baume ou un gloss.", "Bring back a lipstick, lip balm or gloss."],
    ["Un(e) volontaire fait un massage d'épaules de 10 secondes à un joueur d'une autre équipe, si celui-ci (celle-ci) est d'accord.", "A volunteer gives a 10-second shoulder rub to a player from another team, if they agree."],
    ["Faites le regard le plus séducteur possible à l'hôte : il (elle) juge.", "Give the host your most seductive look: they judge."],
    ["Mimez un premier rendez-vous qui tourne mal, en 15 secondes.", "Act out a first date going wrong, in 15 seconds."],
    ["Un(e) volontaire fait une déclaration d'amour passionnée à un objet de la pièce.", "A volunteer makes a passionate declaration of love to an object in the room."],
    ["Faites un bisou sur la joue à chaque membre d'une autre équipe (ceux qui sont d'accord).", "Give a cheek kiss to every member of another team (those who agree)."],
    ["Faites la meilleure pose « couverture de roman d'amour » à deux.", "Strike the best \"romance novel cover\" pose as a pair."],
    ["Un(e) volontaire danse un slow langoureux avec un balai ou un coussin.", "A volunteer slow-dances sensually with a broom or a cushion."],
    ["Sortez une phrase de drague tellement nulle qu'elle fait rire l'hôte.", "Use a pickup line so bad it makes the host laugh."],
    ["Faites un défilé de lingerie… par-dessus vos vêtements, avec ce que vous trouvez.", "Do a lingerie runway... over your clothes, with whatever you find."],
    ["Retrouvez qui, dans la pièce, a le plus d'ex (sans donner de noms).", "Find out who in the room has the most exes (no names)."],
    ["Deux volontaires font un baisemain dramatique, façon film d'époque.", "Two volunteers do a dramatic hand-kiss, period-drama style."],
    ["Mimez la position du Kama-sutra « la brouette »… tout habillés et en restant debout.", "Act out the Kama Sutra \"wheelbarrow\"... fully clothed and standing up."],
    ["Écrivez un SMS de séduction de 2 lignes et lisez-le à voix haute avec la voix la plus sensuelle.", "Write a 2-line flirty text and read it out in your sexiest voice."]
  ]) },
  { v: "kid", label: tr("Enfants", "Kids"), desc: tr("Tout public, parfait avec des enfants", "Family-friendly, great with kids"), kid: true, list: L([
    ["Ramenez un jouet.", "Bring back a toy."],
    ["Faites le cri de 3 animaux différents.", "Make the sounds of 3 different animals."],
    ["Sautez à cloche-pied jusqu'à la porte et revenez.", "Hop on one foot to the door and back."],
    ["Ramenez quelque chose de vert.", "Bring back something green."],
    ["Faites une statue qui ne bouge pas pendant 15 secondes.", "Be a statue that doesn't move for 15 seconds."],
    ["Dessinez une maison en 20 secondes.", "Draw a house in 20 seconds."],
    ["Chantez « Frère Jacques » en entier.", "Sing a whole nursery rhyme."],
    ["Ramenez 3 objets ronds.", "Bring back 3 round things."],
    ["Imitez un robot qui danse pendant 10 secondes.", "Dance like a robot for 10 seconds."],
    ["Faites 10 sauts de grenouille.", "Do 10 frog jumps."],
    ["Ramenez une peluche.", "Bring back a stuffed animal."],
    ["Citez 5 couleurs de l'arc-en-ciel.", "Name 5 colors of the rainbow."],
    ["Faites rire l'hôte sans le toucher.", "Make the host laugh without touching them."],
    ["Ramenez un objet plus grand que vous… ou essayez !", "Bring back something taller than you... or try!"],
    ["Marchez comme un pingouin jusqu'au mur et revenez.", "Waddle like a penguin to the wall and back."],
    ["Comptez jusqu'à 20 en sautant à chaque nombre.", "Count to 20, jumping on every number."],
    ["Faites une grimace de monstre à l'hôte.", "Make a monster face at the host."],
    ["Ramenez un livre avec un animal sur la couverture.", "Bring back a book with an animal on the cover."],
    ["Mimez un animal : les autres devinent.", "Act out an animal: the other team guesses."],
    ["Tenez une cuillère sur votre nez pendant 3 secondes.", "Balance a spoon on your nose for 3 seconds."],
    ["Faites un avion en papier qui vole jusqu'à l'hôte.", "Make a paper plane that flies to the host."],
    ["Citez 5 fruits en moins de 10 secondes.", "Name 5 fruits in under 10 seconds."]
  ]) }
];
const myDefis = () => A(store().courseCustom).map(x => clean(x, 140)).filter(Boolean).slice(0, 100);
const packList = () => PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length }));
function deckFor(packs, perso){
  const all = [];
  PACKS.forEach(p => { if(A(packs).indexOf(p.v) >= 0) p.list.forEach(t => all.push(t)); });
  if(perso) myDefis().forEach(t => all.push(t));
  return SB.u.fresh("course", SB.kid() ? all.filter(t => SB.kidOk(t)) : all);
}
function editor(){
  SB.page(tr("Nos défis", "Our challenges"), root => {
    root.innerHTML = '<div class="gs"><p class="howto">' + tr("Un défi par ligne. Ex. : « Ramenez la casquette de Kévin », « Faites la danse de la colo ». Ils se mélangent aux paquets avec l'option « Nos défis ».", "One challenge per line. E.g. “Bring back Kevin's cap”, “Do the summer camp dance”. They mix in with the packs when “Our challenges” is on.") + "</p>" +
      '<textarea class="txt" id="cd-t" rows="10" placeholder="' + tr("Ramenez la casquette de Kévin\nFaites la danse de la colo", "Bring back Kevin's cap\nDo the summer camp dance") + '"></textarea><p class="sm" data-n></p></div>';
    const ta = root.querySelector("#cd-t"), n = root.querySelector("[data-n]");
    ta.value = myDefis().join("\n");
    const save = () => { const t = ta.value.split("\n").map(x => clean(x, 140)).filter(Boolean).slice(0, 100); persist({ courseCustom: t }); n.textContent = tr(t.length + " défi" + (t.length > 1 ? "s" : ""), t.length + (t.length === 1 ? " challenge" : " challenges")); };
    ta.addEventListener("input", save); save();
  });
}
const TW = [
  { id: "or", name: tr("Défi en or", "Golden challenge"), desc: tr("Ce défi rapporte double.", "This challenge is worth double.") },
  { id: "muet", name: tr("En silence", "In silence"), desc: tr("Interdit de parler : une équipe qui parle est éliminée de ce défi.", "No talking: a team that talks is out of this challenge.") },
  { id: "main", name: tr("Une seule main", "One hand only"), desc: tr("Chacun n'a droit qu'à une main.", "Everyone can only use one hand.") },
  { id: "express", name: tr("Express", "Express"), desc: tr("Moitié moins de temps !", "Half the time!") }
];
const CSS = '<style data-cd>' +
  '.cd-def{font-family:var(--f-disp); font-size:28px; line-height:1.15; text-align:center; margin:6px 0}.cd-def.l1{font-size:23px}.cd-def.l2{font-size:19px}' +
  '.cd-cd{font-family:var(--f-disp); font-size:120px; line-height:1; text-align:center; color:var(--acc)}' +
  '.cd-t{font-family:var(--f-disp); font-size:48px; text-align:center; color:var(--acc); line-height:1}.cd-t.low{color:var(--bad)}' +
  '.cd-go{width:100%; min-height:120px; border-radius:24px; border:0; background:var(--acc); color:var(--on-acc); font-family:var(--f-disp); font-size:34px; box-shadow:0 10px 0 rgba(0,0,0,.35)}.cd-go:active{transform:translateY(6px); box-shadow:0 4px 0 rgba(0,0,0,.35)}.cd-go:disabled{filter:grayscale(1); opacity:.45}' +
  '.cd-units{display:grid; grid-template-columns:1fr 1fr; gap:8px}.cd-units button{min-height:60px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:16px}.cd-units button[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--on-acc)}' +
  '.cd-row{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:800}.cd-row b{flex:1}.cd-row .n{font-family:var(--f-disp); font-size:20px}.cd-list{display:flex; flex-direction:column; gap:6px}</style>';
const dCls = t => (String(t).length > 110 ? " l2" : String(t).length > 60 ? " l1" : "");
const COUNT_MS = 3000;
// Unités qui jouent : les équipes, ou les joueurs en « chacun pour soi ».
const unitsOf = (s, ids) => (s.tmn ? SB.teams.ids(s.tmn) : ids);
const unitOf = (s, id) => (s.tmn ? (s.tm || {})[id] : id);
const membersOf = (s, u, ids) => (s.tmn ? SB.teams.members(s.tm, u, ids) : [u]);
function standings(s, ids, nameOf, got){
  if(s.tmn) return SB.teams.board(s.tm, s.tmn, s.tp || {}, ids, nameOf, got);
  const p = s.tp || {};
  return '<div class="cd-list">' + ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0)).map((id, i) => '<div class="cd-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + "</b>" + (got && got[id] ? '<span style="color:#2fa860">+' + got[id] + "</span>" : "") + '<span class="n">' + (p[id] || 0) + "</span></div>").join("") + "</div>";
}
const uName = (s, u, nameOf) => (s.tmn ? SB.teams.name(u) : nameOf(u));

SB.register({
  id: "course", name: tr("Course de défis", "Challenge Race"), glyph: tr("Go !", "Go!"), pitch: tr("Un défi tombe, la première équipe qui réussit gagne.", "A challenge drops, first team to pull it off wins"), hot: false, ticks: true,
  accent: { light: "#f08a24", dark: "#ffa94d" },
  tag: tr("Le téléphone annonce un défi : ramener un objet, former une lettre avec vos corps, chanter un refrain… La première équipe qui réussit marque le point.", "The phone announces a challenge: bring back an object, make a letter with your bodies, sing a chorus… The first team to pull it off scores."),
  min: 2, max: 30,
  gages: [
    { ev: "gagne", label: tr("Défi gagné", "Challenge won"), kind: "distribue", n: 1 },
    { ev: "refuse", label: tr("« On l'a ! » refusé par l'hôte", "“Got it!” rejected by the host"), kind: "boit", n: 1 },
    { ev: "personne", label: tr("Personne n'a réussi à temps", "Nobody made it in time"), kind: "tous", n: 1 }
  ],
  rules: tr([
    "Le défi s'affiche sur tous les téléphones après un compte à rebours. Foncez !",
    "Dès que votre équipe a réussi, l'un de vous touche « On l'a ! ». L'hôte vérifie et valide (1 point) ou refuse (l'équipe ne peut plus gagner ce défi).",
    "Si personne n'a réussi à la fin du chrono, tout le monde a un gage.",
    "Coups de théâtre : défi en or (double), en silence, une seule main, express (moitié du temps).",
    "Paquets : chasse aux objets, défis physiques, créatif et malin, toute l'équipe, soirée, pimenté (18+), enfants, et vos propres défis.",
    "Sécurité d'abord : pas de course dans les escaliers, on ne grimpe sur rien, on ne casse rien, et personne n'est obligé de participer à un défi qui le gêne."
  ], [
    "The challenge appears on every phone after a countdown. Go go go!",
    "As soon as your team succeeds, one of you taps “Got it!”. The host checks and approves (1 point) or rejects (your team can't win this one anymore).",
    "If nobody makes it before time runs out, everyone gets a forfeit.",
    "Twists: golden challenge (double), in silence, one hand only, express (half the time).",
    "Packs: scavenger hunt, physical, creative & clever, whole team, party, spicy (18+), kids, and your own challenges.",
    "Safety first: no running on stairs, no climbing, no breaking things, and nobody has to take part in a challenge they're not comfortable with."
  ]),
  options: [
    { id: "teams", label: tr("Équipes", "Teams"), type: "seg", def: 2, values: [{ v: 0, label: tr("Chacun pour soi", "Every player") }, { v: 2, label: "2" }, { v: 3, label: "3" }, { v: 4, label: "4" }] },
    { id: "rounds", label: tr("Défis", "Challenges"), type: "seg", def: 10, values: [{ v: 8, label: "8" }, { v: 10, label: "10" }, { v: 15, label: "15" }] },
    { id: "time", label: tr("Chrono", "Timer"), type: "seg", def: 60, values: [{ v: 30, label: "30 s" }, { v: 60, label: "60 s" }, { v: 90, label: "90 s" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["objets", "physique", "malin", "equipe"], values: packList() },
    { id: "perso", label: tr("Nos défis", "Our challenges"), type: "toggle", text: tr("Nos défis", "Our challenges"), desc: tr("Mélanger nos défis aux paquets", "Mix your challenges with the packs"), def: true },
    { id: "edit", type: "button", label: tr("Écrire nos défis", "Write our challenges"), onClick: () => editor() },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Défi en or, en silence, une seule main, express", "Golden, in silence, one hand, express"), def: true }
  ],
  start(ctx, o){
    const deck = deckFor(o.packs, o.perso !== false);
    if(deck.length < 3) throw new Error(tr("Pas assez de défis : choisis plus de paquets.", "Not enough challenges: pick more packs."));
    const tmn = +o.teams >= 2 ? Math.min(4, +o.teams) : 0;
    if(tmn && ctx.ids.length < tmn * 1) throw new Error(tr("Il faut au moins " + tmn + " joueurs pour " + tmn + " équipes.", "You need at least " + tmn + " players for " + tmn + " teams."));
    ctx.setPriv({ deck });
    return { phase: tmn ? "teams" : "next", tmn, tm: tmn ? SB.teams.split(ctx.ids, tmn) : null, tp: {}, n: 0, rounds: Math.min(o.rounds || 10, deck.length), sec: [30, 60, 90].indexOf(+o.time) >= 0 ? +o.time : 60, def: "", tw: "", startAt: 0, out: [], claim: null, res: null };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "next"){ nextDef(ctx); return; }
    if(s.phase === "go"){
      const now = ctx.now(), dur = (s.tw === "express" ? s.sec / 2 : s.sec) * 1000, out = A(s.out);
      if(now < s.startAt) return;
      const cl = live.map(id => { const i = ctx.input(id); return i && i.got && out.indexOf(unitOf(s, id)) < 0 ? [id, +i.got] : null; }).filter(Boolean).sort((a, b) => a[1] - b[1]);
      if(cl.length){ ctx.set({ phase: "claim", claim: { by: cl[0][0], u: unitOf(s, cl[0][0]) } }); return; }
      if(now >= s.startAt + dur){ ctx.gage([{ id: live[0], ev: "personne" }], s.k + ":none"); ctx.set({ phase: "res", res: { none: 1 } }); }
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), inp = ctx.mine() || {}, myU = unitOf(s, me);
    const head = CSS + '<span class="eyebrow">' + tr("Défi ", "Challenge ") + Math.max(1, s.n) + " / " + s.rounds + "</span>" + (s.tmn && myU ? '<p class="sm" style="text-align:center; margin:0">' + SB.teams.pill(myU) + "</p>" : "");
    if(s.phase === "teams"){
      const ok = SB.teams.ok(s.tm, s.tmn, ctx.ids);
      screen(root, "tm" + JSON.stringify(s.tm) + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Les équipes", "The teams") + "</span>" + SB.teams.grid(s.tm, s.tmn, ctx.ids, ctx.name, ctx.isHost) +
        '<p class="sm" style="margin:0">' + (ctx.isHost ? tr("Touche un joueur pour le changer d'équipe.", "Tap a player to switch their team.") : tr("L'hôte prépare les équipes…", "The host is setting up the teams…")) + "</p>" +
        (ctx.isHost ? '<button class="link" type="button" data-mix style="align-self:flex-start">' + tr("Mélanger les équipes", "Shuffle the teams") + "</button>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-go' + (ok ? "" : " disabled") + ">" + tr("C'est parti", "Let's go") + "</button>" : '<p class="wait">' + tr("En attente de l'hôte…", "Waiting for the host…") + "</p>"), r => {
        if(!ctx.isHost) return;
        r.querySelectorAll("[data-tmv]").forEach(b => b.addEventListener("click", () => { buzz(6); ctx.act(c => { if(c.s.phase === "teams") c.set({ tm: SB.teams.cycle(c.s.tm, b.dataset.tmv, c.s.tmn) }); }); }));
        r.querySelector("[data-mix]").addEventListener("click", () => ctx.act(c => { if(c.s.phase === "teams") c.set({ tm: SB.teams.split(c.ids, c.s.tmn) }); }));
        r.querySelector("[data-go]").addEventListener("click", () => ctx.act(c => { if(c.s.phase === "teams" && SB.teams.ok(c.s.tm, c.s.tmn, c.ids)) c.set({ phase: "next" }); }));
      });
      return;
    }
    if(s.phase === "next"){ screen(root, "nx" + s.n, CSS + '<p class="wait" style="text-align:center">' + tr("Défi suivant…", "Next challenge…") + "</p>"); return; }
    if(s.phase === "ready"){
      screen(root, "rd" + s.k + ctx.isHost, head + SB.u.twistHTML(T) + '<p class="howto" style="text-align:center">' + tr("Prêts ? Le défi s'affiche après un compte à rebours de 3 secondes.", "Ready? The challenge appears after a 3-second countdown.") + "</p>" + standings(s, ctx.ids, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-start>' + tr("Lancer le défi", "Start the challenge") + "</button>" : '<p class="wait">' + tr("L'hôte va lancer le défi…", "The host is about to start…") + "</p>"), r => {
        const b = r.querySelector("[data-start]"); if(b) b.addEventListener("click", () => { buzz(10); ctx.act(c => { if(c.s.phase === "ready") c.set({ phase: "go", startAt: c.now() + COUNT_MS, k: c.rid() }); }); });
      });
      return;
    }
    if(s.phase === "go" || s.phase === "claim"){
      const now = ctx.now(), dur = (s.tw === "express" ? s.sec / 2 : s.sec) * 1000;
      if(now < s.startAt){
        const c = Math.ceil((s.startAt - now) / 1000);
        if(root.dataset.cdn !== s.k + c){ root.dataset.cdn = s.k + c; buzz(20); }
        screen(root, "cd" + s.k, head + SB.u.twistHTML(T) + '<div class="cd-cd" data-c>' + c + "</div>");
        txt(root, "[data-c]", String(c));
        return;
      }
      if(root.dataset.gob !== s.k){ root.dataset.gob = s.k; buzz([60, 40, 60]); }
      const left = Math.max(0, Math.ceil((s.startAt + dur - now) / 1000)), out = A(s.out), iamOut = out.indexOf(myU) >= 0, claimed = !!inp.got;
      const cl = s.phase === "claim" ? s.claim : null;
      screen(root, "go" + s.k + s.phase + (cl ? cl.by : "") + out.join() + claimed + ctx.isHost, head + SB.u.twistHTML(T) + '<p class="cd-def' + dCls(s.def) + '">' + esc(s.def) + "</p>" + '<div class="cd-t" data-t>' + left + "</div>" +
        (cl ? '<div class="who" style="text-align:center' + (s.tmn ? "; color:" + SB.teams.color(cl.u) : "") + '">' + esc(uName(s, cl.u, ctx.name)) + '</div><p class="howto" style="text-align:center">' + (ctx.isHost ? tr(ctx.name(cl.by) + " dit que c'est réussi. Tu valides ?", ctx.name(cl.by) + " says it's done. Do you approve?") : tr("L'hôte vérifie…", "The host is checking…")) + "</p>"
          : ctx.playing ? '<button type="button" class="cd-go" data-got' + (iamOut || claimed ? " disabled" : "") + ">" + (iamOut ? tr("Raté pour ce défi", "Out for this one") : claimed ? tr("Envoyé !", "Sent!") : tr("On l'a !", "Got it!")) + "</button>" : "") +
        SB.u.dock(ctx.isHost ? (cl ? '<div class="row"><button class="btn ghost" type="button" data-no>' + tr("Refusé", "Rejected") + '</button><button class="btn acc" type="button" data-yes>' + tr("Validé !", "Approved!") + "</button></div>" : '<button class="btn ghost" type="button" data-skip>' + tr("Personne n'y arrive : on passe", "Nobody can do it: skip") + "</button>") : '<p class="wait"></p>'), r => {
        const g = r.querySelector("[data-got]"); if(g) g.addEventListener("click", () => { buzz([30, 20, 30]); ctx.send({ got: ctx.now() }); g.disabled = true; });
        const y = r.querySelector("[data-yes]"); if(y) y.addEventListener("click", () => ctx.act(c => {
          if(c.s.phase !== "claim") return;
          const u = c.s.claim.u, x = c.s.tw === "or" ? 2 : 1, tp = Object.assign({}, c.s.tp); tp[u] = (tp[u] || 0) + x;
          c.gage([{ id: c.s.claim.by, ev: "gagne" }], c.s.k + ":ok"); c.set({ phase: "res", tp, res: { u, by: c.s.claim.by, got: { [u]: x } } });
        }));
        const n = r.querySelector("[data-no]"); if(n) n.addEventListener("click", () => ctx.act(c => {
          if(c.s.phase !== "claim") return;
          c.gage([{ id: c.s.claim.by, ev: "refuse" }], c.s.k + ":ko:" + c.s.claim.u); c.set({ phase: "go", out: A(c.s.out).concat([c.s.claim.u]), claim: null });
        }));
        const sk = r.querySelector("[data-skip]"); if(sk) sk.addEventListener("click", () => ctx.act(c => { if(c.s.phase !== "go") return; c.gage(c.ids.slice(0, 1).map(id => ({ id, ev: "personne" })), c.s.k + ":none"); c.set({ phase: "res", res: { none: 1 } }); }));
      });
      const t = root.querySelector("[data-t]"); if(t){ t.textContent = String(left); t.classList.toggle("low", left <= 10); }
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {}, last = s.n >= s.rounds;
      screen(root, "rs" + s.k + ctx.isHost, head + '<p class="cd-def' + dCls(s.def) + '" style="font-size:18px">' + esc(s.def) + "</p>" +
        (R.none ? '<p class="howto" style="text-align:center">' + tr("Personne n'a réussi : tout le monde a un gage !", "Nobody made it: everyone gets a forfeit!") + "</p>"
          : '<span class="eyebrow" style="text-align:center">' + tr("Défi gagné par", "Won by") + '</span><div class="who" style="text-align:center' + (s.tmn ? "; color:" + SB.teams.color(R.u) : "") + '">' + esc(uName(s, R.u, ctx.name)) + "</div>") +
        standings(s, ctx.ids, ctx.name, R.got) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Défi suivant", "Next challenge")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase !== "res") return; if(c.s.n >= c.s.rounds) c.set({ phase: "end" }); else nextDef(c); }));
      });
      return;
    }
    if(s.phase === "end"){
      const tp = s.tp || {}, U = unitsOf(s, ctx.ids), mx = Math.max(0, ...U.map(u => tp[u] || 0)), best = U.filter(u => (tp[u] || 0) === mx);
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + (s.tmn ? tr("L'équipe la plus rapide", "The fastest team") : tr("Le plus rapide", "The fastest")) + '</span><div class="who"' + (s.tmn ? ' style="color:' + SB.teams.color(best[0]) + '"' : "") + ">" + esc(best.map(u => uName(s, u, ctx.name)).join(" & ")) + "</div>" + standings(s, ctx.ids, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const t2 = c.s.tp || {}, U2 = unitsOf(c.s, c.ids), m2 = Math.max(0, ...U2.map(u => t2[u] || 0)), b2 = U2.filter(u => (t2[u] || 0) === m2);
          c.end({ title: tr("Course de défis : ", "Challenge Race: ") + b2.map(u => uName(c.s, u, c.name)).join(" & "), lines: U2.slice().sort((x, y) => (t2[y] || 0) - (t2[x] || 0)).slice(0, 4).map((u, i) => (i + 1) + ". " + uName(c.s, u, c.name) + " · " + (t2[u] || 0) + " pts"), win: m2 > 0 ? [].concat(...b2.map(u => membersOf(c.s, u, c.ids))) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : il annonce le défi et le chrono, on touche l'équipe qui a réussi ---------- */
  local: {
    players: { min: 2, max: 30 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.cdPacks).length ? A(st.cdPacks).slice() : ["objets", "physique", "malin", "equipe"], rounds = [8, 10, 15].indexOf(st.cdRounds) >= 0 ? st.cdRounds : 10, sec = [30, 60, 90].indexOf(st.cdTime) >= 0 ? st.cdTime : 60, twOn = st.cdTw !== false, perso = st.cdPerso !== false;
      let tmn = [0, 2, 3, 4].indexOf(st.cdTeams) >= 0 ? st.cdTeams : 2; if(tmn > names.length) tmn = 0;
      let tm = tmn ? SB.teams.split(names, tmn) : {}, deck = [], n = 0, def = "", tw = null, tp = {}, gno = 0, tok = Math.random().toString(36).slice(2, 7), timer = null;
      const units = () => (tmn ? SB.teams.ids(tmn) : names), uname = u => (tmn ? SB.teams.name(u) : u), memb = u => (tmn ? SB.teams.members(tm, u, names) : [u]);
      const brd = got => (tmn ? SB.teams.board(tm, tmn, tp, names, z => z, got) : standings({ tp }, names, z => z, got));
      function setup(){
        clearInterval(timer);
        const packs = packList().filter(SB.packOk);
        sel = SB.okPacks(sel, packList());
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Le téléphone annonce le défi et lance le chrono. Les équipes foncent, puis on touche l'équipe qui a réussi en premier.", "The phone announces the challenge and starts the timer. Teams race, then tap the team that made it first.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Équipes", "Teams") + '</span><div class="seg">' + [[0, tr("Chacun pour soi", "Every player")], [2, "2"], [3, "3"], [4, "4"]].map(v => '<button type="button" data-tmn="' + v[0] + '" aria-pressed="' + (tmn === v[0]) + '"' + (v[0] && names.length < v[0] ? " disabled" : "") + ">" + v[1] + "</button>").join("") + "</div>" +
            (tmn ? SB.teams.grid(tm, tmn, names, z => z, true) + '<button class="link" type="button" data-mix style="align-self:flex-start">' + tr("Mélanger les équipes", "Shuffle the teams") + "</button>" : "") + "</div>" +
          '<div class="field"><span class="eyebrow">' + tr("Défis", "Challenges") + '</span><div class="seg">' + [8, 10, 15].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (rounds === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Chrono", "Timer") + '</span><div class="seg">' + [30, 60, 90].map(v => '<button type="button" data-sec="' + v + '" aria-pressed="' + (sec === v) + '">' + v + " s</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + '</span><div class="packs">' + packs.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.count + "</span></button>").join("") +
            '<button type="button" class="pack" data-perso aria-pressed="' + perso + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Nos défis", "Our challenges") + '</span><span class="ds">' + tr(myDefis().length + " défi" + (myDefis().length > 1 ? "s" : ""), myDefis().length + " challenge" + (myDefis().length === 1 ? "" : "s")) + "</span></span></button></div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Écrire nos défis", "Write our challenges") + "</button></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button>"), r => {
          r.querySelectorAll("[data-tmn]").forEach(b => b.addEventListener("click", () => { tmn = +b.dataset.tmn; tm = tmn ? SB.teams.split(names, tmn) : {}; persist({ cdTeams: tmn }); setup(); }));
          r.querySelectorAll("[data-tmv]").forEach(b => b.addEventListener("click", () => { tm = SB.teams.cycle(tm, b.dataset.tmv, tmn); buzz(6); setup(); }));
          const mx = r.querySelector("[data-mix]"); if(mx) mx.addEventListener("click", () => { tm = SB.teams.split(names, tmn); setup(); });
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ cdRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-sec]").forEach(b => b.addEventListener("click", () => { sec = +b.dataset.sec; persist({ cdTime: sec }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ cdPacks: sel }); setup(); }));
          r.querySelector("[data-perso]").addEventListener("click", () => { perso = !perso; persist({ cdPerso: perso }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ cdTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(tmn && !SB.teams.ok(tm, tmn, names)){ SB.u.toast(tr("Chaque équipe doit avoir au moins un joueur", "Every team needs at least one player")); return; }
            deck = deckFor(sel, perso);
            if(deck.length < 3){ SB.u.toast(tr("Pas assez de défis : choisis plus de paquets", "Not enough challenges: pick more packs")); return; }
            n = 0; tp = {}; tw = null; gno++; next();
          });
        });
      }
      const head = () => CSS + '<span class="eyebrow">' + tr("Défi ", "Challenge ") + n + " / " + rounds + "</span>" + SB.u.twistHTML(tw);
      function next(){
        clearInterval(timer);
        if(n >= rounds || !deck.length){ end(); return; }
        n++; def = deck.pop(); SB.u.saw("course", def);
        tw = twOn && n > 1 ? SB.u.twist(TW, { last: tw ? tw.id : "", rate: .3 }) : null;
        screen(root, "rd" + gno + ":" + n, head() + '<p class="howto" style="text-align:center">' + tr("Prêts ? Le défi s'affiche après un compte à rebours.", "Ready? The challenge appears after a countdown.") + "</p>" + brd() +
          SB.u.dock('<button class="btn acc" type="button" data-start>' + tr("Lancer le défi", "Start the challenge") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelector("[data-start]").addEventListener("click", countdown);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      function countdown(){
        let c = 3; buzz(20);
        screen(root, "cd" + gno + ":" + n, head() + '<div class="cd-cd" data-c>3</div>');
        clearInterval(timer);
        timer = setInterval(() => { c--; if(c > 0){ buzz(20); txt(root, "[data-c]", String(c)); } else { clearInterval(timer); go(); } }, 1000);
      }
      function go(){
        buzz([60, 40, 60]);
        const dur = (tw && tw.id === "express" ? sec / 2 : sec) * 1000, t0 = Date.now();
        screen(root, "go" + gno + ":" + n, head() + '<p class="cd-def' + dCls(def) + '">' + esc(def) + '</p><div class="cd-t" data-t>' + Math.round(dur / 1000) + "</div>" +
          '<p class="howto" style="text-align:center; margin:0">' + tr("Qui a réussi en premier ?", "Who made it first?") + '</p><div class="cd-units">' + units().map(u => '<button type="button" data-u="' + esc(u) + '"' + (tmn ? ' style="border-color:' + SB.teams.color(u) + '"' : "") + ">" + esc(uname(u)) + "</button>").join("") + "</div>" +
          SB.u.dock('<button class="btn ghost" type="button" data-none>' + tr("Personne", "Nobody") + "</button>"), r => {
          r.querySelectorAll("[data-u]").forEach(b => b.addEventListener("click", () => win(b.dataset.u)));
          r.querySelector("[data-none]").addEventListener("click", () => win(""));
        });
        clearInterval(timer);
        timer = setInterval(() => { const left = Math.max(0, Math.ceil((t0 + dur - Date.now()) / 1000)), t = root.querySelector("[data-t]"); if(t){ t.textContent = String(left); t.classList.toggle("low", left <= 10); } if(left <= 0){ clearInterval(timer); buzz([100, 60, 100]); } }, 300);
      }
      function win(u){
        clearInterval(timer);
        const x = tw && tw.id === "or" ? 2 : 1, got = {}, key = "cd" + tok + "-" + gno + ":" + n;
        if(u){ tp[u] = (tp[u] || 0) + x; got[u] = x; if(api.gage) api.gage([{ id: memb(u)[0], ev: "gagne" }], key); }
        else if(api.gage) api.gage([{ id: names[0], ev: "personne" }], key);
        screen(root, "ws" + gno + ":" + n, head() + (u ? '<span class="eyebrow" style="text-align:center">' + tr("Défi gagné par", "Won by") + '</span><div class="who" style="text-align:center' + (tmn ? "; color:" + SB.teams.color(u) : "") + '">' + esc(uname(u)) + "</div>" : '<p class="howto" style="text-align:center">' + tr("Personne n'a réussi : tout le monde a un gage !", "Nobody made it: everyone gets a forfeit!") + "</p>") + brd(got) +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (n >= rounds || !deck.length ? tr("Voir le classement", "See the standings") : tr("Défi suivant", "Next challenge")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", next);
        });
      }
      function end(){
        clearInterval(timer);
        const order = units().slice().sort((a, b) => (tp[b] || 0) - (tp[a] || 0)), mx = tp[order[0]] || 0, best = order.filter(x => (tp[x] || 0) === mx);
        if(api.win) api.win(mx ? [].concat(...best.map(memb)) : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + (tmn ? tr("L'équipe la plus rapide", "The fastest team") : tr("Le plus rapide", "The fastest")) + '</span><div class="who"' + (tmn ? ' style="color:' + SB.teams.color(best[0]) + '"' : "") + ">" + esc(best.map(uname).join(" & ")) + "</div>" + brd() +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
function nextDef(c){
  const pv = c.priv(), deck = A(pv.deck).slice(), s = c.s;
  if(s.n >= s.rounds || !deck.length){ c.set({ phase: "end" }); return; }
  const def = deck.pop(); SB.u.saw("course", def);
  const t = s.n >= 1 && c.opts.twists !== false ? SB.u.twist(TW, { last: s.tw, rate: .3 }) : null;
  c.setPriv({ deck });
  c.set({ phase: "ready", n: s.n + 1, def, tw: t ? t.id : "", out: [], claim: null, res: null, startAt: 0, k: c.rid() });
}
})();
