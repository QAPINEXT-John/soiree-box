/* Agents secrets — deux équipes, 25 mots, un espion par équipe qui donne des indices.
   Mode Duo : deux joueurs en coopération, chacun voit sa propre carte secrète.
   Les cartes secrètes sont dans l'état partagé (comme les mots d'Undercover) : seul l'affichage les cache. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz, clean } = SB.u;

/* ---------- Les mots ---------- */
const W = s => s.split("|");
const FR = {
  cl: W("Avion|Banque|Plage|Lune|Soleil|Étoile|Cœur|Main|Pied|Œil|Dent|Nez|Tête|Livre|Plume|Clé|Porte|Fenêtre|Mur|Pont|Tour|Château|Roi|Reine|Prince|Chevalier|Dragon|Fantôme|Sorcière|Vampire|Robot|Espion|Pirate|Ninja|Cowboy|Shérif|Police|Pompier|Docteur|Avocat|Juge|Prison|École|Tableau|Crayon|Papier|Carte|Plan|Bouteille|Couteau|Fourchette|Assiette|Table|Chaise|Lit|Canapé|Lampe|Bougie|Feu|Glace|Neige|Pluie|Orage|Vent|Nuage|Mer|Rivière|Lac|Montagne|Forêt|Arbre|Feuille|Fleur|Rose|Racine|Pomme|Orange|Citron|Banane|Fraise|Cerise|Pêche|Raisin|Pain|Fromage|Beurre|Chocolat|Sucre|Sel|Œuf|Lait|Café|Thé|Chat|Chien|Lion|Tigre|Ours|Loup|Renard|Lapin|Souris|Cheval|Vache|Cochon|Poule|Aigle|Hibou|Requin|Baleine|Dauphin|Serpent|Araignée|Abeille|Papillon|Fourmi|Train|Voiture|Bus|Vélo|Bateau|Fusée|Métro|Gare|Hôtel|Hôpital|Musée|Cinéma|Théâtre|Cirque|Zoo|Stade|Ballon|Coupe|Médaille|Or|Argent|Diamant|Bague|Couronne|Trésor|Pièce|Billet|Code|Message|Lettre|Timbre|Téléphone|Écran|Clavier|Internet|Virus|Bombe|Laser|Bouclier|Épée|Flèche|Cible|Piège|Cage|Chaîne|Corde|Nœud|Sac|Boîte|Valise|Montre|Horloge|Jour|Nuit|Hiver|Été|Noël|Fête|Cadeau|Gâteau|Ange|Diable|Paradis|Enfer|Rêve|Cauchemar|Ombre|Lumière|Miroir|Photo|Film|Piano|Guitare|Tambour|Danse|Opéra|Jazz|Rock|Héros|Génie|Magie|Baguette|Chapeau|Masque|Gant|Botte|Ceinture|Robe|Cravate|Lunettes|Parapluie|Mars|Planète|Satellite|Alien|Pyramide|Momie|Désert|Île|Volcan|Grotte|Mine|Ferme|Tracteur|Moulin|Usine|Bureau|Patron|Vacances|Banc|Cloche|Ancre|Phare|Sirène|Vague|Sable|Coquillage|Perle|Marteau|Clou|Scie|Échelle|Toit|Cheminée|Jardin|Pelouse|Poubelle|Égout|Tunnel|Mine|Radar|Sous-marin|Hélicoptère|Parachute|Ticket|Moustache|Barbe|Cheveux|Perruque|Savon|Brosse|Peigne|Serviette|Vampire"),
  kid: W("Bonbon|Glace|Gâteau|Doudou|Ballon|Toboggan|Balançoire|Cabane|Trampoline|Piscine|Vélo|Trottinette|Pirate|Princesse|Licorne|Dinosaure|Dragon|Fusée|Astronaute|Robot|Puzzle|Poupée|Peluche|Crayon|Cartable|Récré|Cantine|Maîtresse|Goûter|Crêpe|Frites|Pizza|Pâtes|Yaourt|Chocolat|Câlin|Pyjama|Bain|Mousse|Dentifrice|Histoire|Cirque|Clown|Magicien|Fée|Sorcier|Château|Chevalier|Ogre|Géant|Lutin|Sapin|Neige|Bonhomme|Luge|Plage|Sable|Coquillage|Crabe|Poisson|Requin|Baleine|Tortue|Lapin|Chaton|Chiot|Poney|Cochon|Vache|Poule|Canard|Grenouille|Escargot|Papillon|Coccinelle|Abeille|Dessin|Peinture|Paillettes|Arc-en-ciel|Soleil|Lune|Étoile|Nuage|Pluie|Bottes|Parapluie|Cache-cache|Football|Chanson|Tambour|Sifflet|Trésor|Carte|Boussole|Cape|Masque|Super-héros|Monstre|Fantôme|Squelette|Citrouille|Bougie|Train|Avion|Bateau|Tracteur|Camion|Pompier|Police|Ferme|Zoo|Lion|Girafe|Éléphant|Singe|Zèbre|Ours|Loup|Renard|Hibou"),
  pop: W("Netflix|YouTube|TikTok|Instagram|Selfie|Emoji|Mème|Influenceur|Podcast|Playlist|Zombie|Jedi|Sabre laser|Poudlard|Pokémon|Mario|Zelda|Minecraft|Fortnite|Manette|Superman|Batman|Spider-Man|Avengers|Hulk|Joker|Titanic|Terminator|Matrix|Shrek|Disney|Pixar|Star Wars|Harry Potter|Gandalf|Hobbit|Game of Thrones|Squid Game|Stranger Things|Casa de papel|Rap|Karaoké|Eurovision|Téléréalité|Koh-Lanta|Top Chef|Tour de France|Jeux olympiques|Coupe du monde|Barbie|Tamagotchi|Rubik's cube|iPhone|Wi-Fi|Bluetooth|Hashtag|Filtre|Story|Like|Tinder|Uber|Airbnb|Amazon|Google|Wikipédia|Bitcoin|IA|Drone|Fast-food|Burger|Sushi|Kebab|Tacos|Licorne|Dark Vador|Pikachu|Simpson|Bob l'éponge|Le Roi lion|La Reine des neiges|Astérix|Tintin|James Bond|Rocky|Godzilla|King Kong|Dracula|Frankenstein|Sherlock|Zorro|Indiana Jones|Les Minions|Toy Story|Nemo|Marvel"),
  soir: W("Apéro|Glaçon|Paille|Citron vert|After|Boîte de nuit|Videur|Vestiaire|DJ|Dancefloor|Playlist|Karaoké|Enceinte|Voisins|Police|Taxi|Kebab|Chips|Cacahuètes|Pizza|Canapé|Comptoir|Pourboire|Toast|Gobelet|Jeu de cartes|Dé|Selfie|Photo floue|Story|Ex|Crush|Slow|Bisou|Chaussures|Talons|Réveil|Brunch|Lendemain|Bougie|Ballon|Confettis|Gâteau|Anniversaire|Invités|Sono|Lumière noire|Boule à facettes|Déguisement|Perruque|Masque|Limbo|Conga|Chenille|Macarena|Micro|Battle|Fou rire|Secret|Bêtise|Promesse"),
  alc: W("Bière|Vodka|Rhum|Tequila|Shot|Cocktail|Mojito|Champagne|Vin|Rosé|Pastis|Gueule de bois|Bar|Barman|Tournée|Santé|Bouchon|Tire-bouchon|Beer-pong|Jeu à boire|Fond de verre|Aspirine|Sangria|Whisky|Gin|Pinte|Demi|Happy hour|Ivre|Cul sec"),
  hot: W("Menottes|String|Lingerie|Préservatif|Langue|Suçon|Préliminaires|Strip-tease|Massage|Huile|Plume|Bandeau|Fouet|Cuir|Latex|Porte-jarretelles|Nuisette|Draps|Jacuzzi|Douche|Baignoire|Plan à trois|Coup d'un soir|Nudes|Sexto|Fantasme|Orgasme|Gémissement|Fesses|Seins|Tétons|Cou|Oreille|Lèvres|Hanches|Cuisses|Missionnaire|Levrette|Cuillère|Sex-shop|Vibromasseur|Lubrifiant|Kamasutra|Chambre d'hôtel|Banquette arrière|Plage nudiste|Sauna|Striptease|Lap dance|Body|Tatouage|Piercing|Bouche|Nuque|Chantilly|Fraise|Glaçon|Miroir|Caméra"),
  trash: W("Pipe|Cunni|Sodomie|Branlette|Éjaculation|Sperme|Partouze|Échangisme|Club libertin|Gang bang|Sextape|Porno|OnlyFans|Plan cul|Gorge profonde|Soixante-neuf|Fellation|Anulingus|Squirt|Godemiché|Plug anal|Bite|Chatte|Couilles|Clito|Point G|Nichons|Cul|Doigté|Masturbation|Éjac précoce|Érection|Viagra|Panne|Quickie|Domination|Soumission|Fessée|Bondage|Martinet|Collier|Laisse|Trio|Dark room|Glory hole|Strip-club|Camgirl|Gode-ceinture|Sex toy|Vaginal|Anal|Cyprine|Gland|Prépuce|Capote|Pénétration|Leche-cul|Exhib|Voyeur|Dirty talk")
};
const EN = {
  cl: W("Plane|Bank|Beach|Moon|Sun|Star|Heart|Hand|Foot|Eye|Tooth|Nose|Head|Book|Feather|Key|Door|Window|Wall|Bridge|Tower|Castle|King|Queen|Prince|Knight|Dragon|Ghost|Witch|Vampire|Robot|Spy|Pirate|Ninja|Cowboy|Sheriff|Police|Firefighter|Doctor|Lawyer|Judge|Prison|School|Board|Pencil|Paper|Map|Plan|Bottle|Knife|Fork|Plate|Table|Chair|Bed|Couch|Lamp|Candle|Fire|Ice|Snow|Rain|Storm|Wind|Cloud|Sea|River|Lake|Mountain|Forest|Tree|Leaf|Flower|Rose|Root|Apple|Orange|Lemon|Banana|Strawberry|Cherry|Peach|Grape|Bread|Cheese|Butter|Chocolate|Sugar|Salt|Egg|Milk|Coffee|Tea|Cat|Dog|Lion|Tiger|Bear|Wolf|Fox|Rabbit|Mouse|Horse|Cow|Pig|Chicken|Eagle|Owl|Shark|Whale|Dolphin|Snake|Spider|Bee|Butterfly|Ant|Train|Car|Bus|Bike|Boat|Rocket|Subway|Station|Hotel|Hospital|Museum|Cinema|Theater|Circus|Zoo|Stadium|Ball|Cup|Medal|Gold|Silver|Diamond|Ring|Crown|Treasure|Coin|Ticket|Code|Message|Letter|Stamp|Phone|Screen|Keyboard|Internet|Virus|Bomb|Laser|Shield|Sword|Arrow|Target|Trap|Cage|Chain|Rope|Knot|Bag|Box|Suitcase|Watch|Clock|Day|Night|Winter|Summer|Christmas|Party|Gift|Cake|Angel|Devil|Heaven|Hell|Dream|Nightmare|Shadow|Light|Mirror|Photo|Movie|Piano|Guitar|Drum|Dance|Opera|Jazz|Rock|Hero|Genius|Magic|Wand|Hat|Mask|Glove|Boot|Belt|Dress|Tie|Glasses|Umbrella|Mars|Planet|Satellite|Alien|Pyramid|Mummy|Desert|Island|Volcano|Cave|Mine|Farm|Tractor|Mill|Factory|Office|Boss|Vacation|Bench|Bell|Anchor|Lighthouse|Mermaid|Wave|Sand|Shell|Pearl|Hammer|Nail|Saw|Ladder|Roof|Chimney|Garden|Lawn|Trash|Sewer|Tunnel|Radar|Submarine|Helicopter|Parachute|Mustache|Beard|Hair|Wig|Soap|Brush|Comb|Towel"),
  kid: W("Candy|Ice cream|Cake|Teddy|Ball|Slide|Swing|Treehouse|Trampoline|Pool|Bike|Scooter|Pirate|Princess|Unicorn|Dinosaur|Dragon|Rocket|Astronaut|Robot|Puzzle|Doll|Plushie|Crayon|Backpack|Recess|Lunchroom|Teacher|Snack|Pancake|Fries|Pizza|Pasta|Yogurt|Chocolate|Hug|Pajamas|Bath|Bubbles|Toothpaste|Story|Circus|Clown|Magician|Fairy|Wizard|Castle|Knight|Ogre|Giant|Elf|Christmas tree|Snow|Snowman|Sled|Beach|Sand|Seashell|Crab|Fish|Shark|Whale|Turtle|Bunny|Kitten|Puppy|Pony|Pig|Cow|Chicken|Duck|Frog|Snail|Butterfly|Ladybug|Bee|Drawing|Paint|Glitter|Rainbow|Sun|Moon|Star|Cloud|Rain|Boots|Umbrella|Hide-and-seek|Soccer|Song|Drum|Whistle|Treasure|Map|Compass|Cape|Mask|Superhero|Monster|Ghost|Skeleton|Pumpkin|Candle|Train|Plane|Boat|Tractor|Truck|Firefighter|Police|Farm|Zoo|Lion|Giraffe|Elephant|Monkey|Zebra|Bear|Wolf|Fox|Owl"),
  pop: W("Netflix|YouTube|TikTok|Instagram|Selfie|Emoji|Meme|Influencer|Podcast|Playlist|Zombie|Jedi|Lightsaber|Hogwarts|Pokémon|Mario|Zelda|Minecraft|Fortnite|Controller|Superman|Batman|Spider-Man|Avengers|Hulk|Joker|Titanic|Terminator|Matrix|Shrek|Disney|Pixar|Star Wars|Harry Potter|Gandalf|Hobbit|Game of Thrones|Squid Game|Stranger Things|Money Heist|Rap|Karaoke|Eurovision|Reality TV|Survivor|Bake Off|Super Bowl|Olympics|World Cup|Barbie|Tamagotchi|Rubik's cube|iPhone|Wi-Fi|Bluetooth|Hashtag|Filter|Story|Like|Tinder|Uber|Airbnb|Amazon|Google|Wikipedia|Bitcoin|AI|Drone|Fast food|Burger|Sushi|Kebab|Tacos|Unicorn|Darth Vader|Pikachu|Simpsons|SpongeBob|The Lion King|Frozen|James Bond|Rocky|Godzilla|King Kong|Dracula|Frankenstein|Sherlock|Zorro|Indiana Jones|Minions|Toy Story|Nemo|Marvel"),
  soir: W("Snacks|Ice cube|Straw|Lime|Afterparty|Nightclub|Bouncer|Coat check|DJ|Dance floor|Playlist|Karaoke|Speaker|Neighbors|Police|Taxi|Kebab|Chips|Peanuts|Pizza|Couch|Counter|Tip|Toast|Cup|Deck of cards|Dice|Selfie|Blurry photo|Story|Ex|Crush|Slow dance|Kiss|Shoes|Heels|Alarm|Brunch|Morning after|Candle|Balloon|Confetti|Cake|Birthday|Guests|Sound system|Black light|Disco ball|Costume|Wig|Mask|Limbo|Conga line|Macarena|Mic|Dance battle|Giggles|Secret|Prank|Promise"),
  alc: W("Beer|Vodka|Rum|Tequila|Shot|Cocktail|Mojito|Champagne|Wine|Rosé|Hangover|Bar|Bartender|Round|Cheers|Cork|Corkscrew|Beer pong|Drinking game|Aspirin|Sangria|Whiskey|Gin|Pint|Happy hour|Drunk|Chug"),
  hot: W("Handcuffs|Thong|Lingerie|Condom|Tongue|Hickey|Foreplay|Striptease|Massage|Oil|Feather|Blindfold|Whip|Leather|Latex|Garter belt|Nightie|Sheets|Hot tub|Shower|Bathtub|Threesome|One-night stand|Nudes|Sexting|Fantasy|Orgasm|Moan|Butt|Boobs|Nipples|Neck|Ear|Lips|Hips|Thighs|Missionary|Doggy style|Spooning|Sex shop|Vibrator|Lube|Kama Sutra|Hotel room|Back seat|Nude beach|Sauna|Lap dance|Bodysuit|Tattoo|Piercing|Mouth|Whipped cream|Strawberry|Ice cube|Mirror|Camera"),
  trash: W("Blowjob|Cunnilingus|Anal|Handjob|Cumshot|Cum|Orgy|Swinging|Swingers club|Gangbang|Sex tape|Porn|OnlyFans|Fuck buddy|Deepthroat|Sixty-nine|Rimming|Squirt|Dildo|Butt plug|Dick|Pussy|Balls|Clit|G-spot|Tits|Ass|Fingering|Masturbation|Premature|Boner|Viagra|Quickie|Domination|Submission|Spanking|Bondage|Collar|Leash|Dark room|Glory hole|Strip club|Camgirl|Strap-on|Sex toy|Penetration|Exhibitionist|Voyeur|Dirty talk|Facial|Creampie|Edging|Booty call|Hand cuffs|Pegging|Kinky|Safe word")
};
const LISTS = { fr: FR, en: EN };
const L = lg => LISTS[lg === "en" ? "en" : "fr"];
const PACKS = [
  { v: "cl", label: tr("Classique", "Classic"), desc: tr("Des mots de tous les jours", "Everyday words"), list: L(SB.lang()).cl },
  { v: "kid", label: tr("Copains", "Buddies"), desc: tr("Tout public, parfait avec des enfants", "For everyone, great with kids"), list: L(SB.lang()).kid, kid: true },
  { v: "pop", label: tr("Pop culture", "Pop culture"), desc: tr("Films, séries, jeux vidéo, réseaux", "Movies, shows, video games, socials"), list: L(SB.lang()).pop },
  { v: "soir", label: tr("Soirée", "Party"), desc: tr("Apéro, after, dancefloor…", "Drinks, afterparties, dance floor…"), list: L(SB.lang()).soir },
  { v: "hot", label: "Hot", desc: tr("Ça chauffe : indices gênants garantis", "Getting steamy: awkward clues guaranteed"), list: L(SB.lang()).hot, hot: true },
  { v: "trash", label: "Trash", desc: tr("Sexe cru, sans filtre", "Raw, unfiltered sex"), list: L(SB.lang()).trash, hot: true }
];
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; };
const myWords = () => A(store().agWords).map(w => clean(w, 24)).filter(Boolean).slice(0, 80);
// 25 mots : d'abord les mots perso (8 maximum, prénoms compris), puis les paquets, sans doublon.
function pickWords(packs, lg, extra){
  const LL = L(lg), sel = A(packs);
  let pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => LL[p.v].concat(p.v === "soir" && SB.hard() ? LL.alc : []));
  if(!pool.length) pool = LL.cl.slice();
  pool = kidF(pool);
  const seen = new Set(), out = [], push = w => { const k = String(w).toLowerCase(); if(w && !seen.has(k) && out.length < 25){ seen.add(k); out.push(w); } };
  shuffle(A(extra)).slice(0, 8).forEach(push);
  const fr = SB.u.fresh("agents:w", pool); while(out.length < 25 && fr.length) push(fr.pop());
  if(out.length < 25) shuffle(LL.cl).forEach(push);
  out.forEach(w => SB.u.saw("agents:w", w));
  return shuffle(out);
}

/* ---------- Le moteur (réseau et un seul téléphone) ----------
   Équipes : key[i] = "r" | "b" | "n" (neutre) | "a" (assassin) | "p" (piège : neutre qui fait sauter le prochain tour).
   rev[i] = "" ou la couleur révélée. */
function newTeamGame(words, o){
  const start = Math.random() < .5 ? "r" : "b", other = start === "r" ? "b" : "r", na = o.assassins === 2 ? 2 : 1;
  const key = [].concat(new Array(9).fill(start), new Array(8).fill(other), new Array(na).fill("a"), o.piege ? ["p"] : []);
  while(key.length < 25) key.push("n");
  return { mode: "eq", w: words, key: shuffle(key), rev: new Array(25).fill(""), start, turn: start, step: "clue", clue: null, got: 0, ok: 0, skip: { r: 0, b: 0 }, win: "", why: "", log: "" };
}
const other = t => (t === "r" ? "b" : "r");
const left = (G, t) => G.key.filter((k, i) => k === t && !G.rev[i]).length;
const TN = t => (t === "r" ? tr("Rouges", "Red") : tr("Bleus", "Blue"));
const TN1 = t => (t === "r" ? tr("rouge", "red") : tr("bleu", "blue"));
// Retourne un mot. Renvoie ce qui s'est passé : "own" | "other" | "n" | "p" | "a" | "" (rien).
function teamReveal(G, i){
  if(G.step !== "guess" || G.win || i < 0 || i > 24 || G.rev[i]) return "";
  const k = G.key[i], t = G.turn; G.rev[i] = k;
  const W2 = G.w[i];
  if(k === "a"){ G.win = other(t); G.why = "a"; G.log = tr("💀 " + W2 + " : l'assassin ! Les " + TN(t) + " perdent.", "💀 " + W2 + ": the assassin! " + TN(t) + " lose."); return "a"; }
  if(k === t){
    G.got++; G.ok++;
    if(!left(G, t)){ G.win = t; G.why = "all"; G.log = tr(W2 + " : les " + TN(t) + " ont trouvé tous leurs agents !", W2 + ": " + TN(t) + " found all their agents!"); return "own"; }
    const n = G.clue ? G.clue.n : 0;
    if(n > 0 && n < 10 && G.got >= n + 1){ G.log = tr(W2 + " : bien joué ! Plus d'essai pour ce tour.", W2 + ": nice! No more guesses this turn."); endTurn(G); }
    else G.log = tr(W2 + " : bien joué ! Vous pouvez continuer.", W2 + ": nice! Keep going.");
    return "own";
  }
  if(k === other(t)){
    if(!left(G, other(t))){ G.win = other(t); G.why = "all"; G.log = tr(W2 + " était aux " + TN(other(t)) + " : c'était leur dernier, ils gagnent !", W2 + " was " + TN1(other(t)) + ": their last one, they win!"); return "other"; }
    G.log = tr(W2 + " : raté, c'est un agent " + TN1(other(t)) + ".", W2 + ": miss, that's a " + TN1(other(t)) + " agent."); endTurn(G); return "other";
  }
  if(k === "p"){ G.skip[t] = 1; G.log = tr(W2 + " : mot piégé ! Les " + TN(t) + " passeront leur prochain tour.", W2 + ": booby-trapped! " + TN(t) + " skip their next turn."); endTurn(G); return "p"; }
  G.log = tr(W2 + " : un simple passant. Fin du tour.", W2 + ": just a bystander. Turn over."); endTurn(G); return "n";
}
function endTurn(G){
  if(G.win) return;
  let nx = other(G.turn);
  if(G.skip[nx]){ G.skip[nx] = 0; nx = G.turn; G.log += tr(" Les " + TN(other(nx)) + " passent leur tour.", " " + TN(other(nx)) + " skip their turn."); }
  G.turn = nx; G.step = "clue"; G.clue = null; G.got = 0;
}
/* Duo : deux cartes. ka[i] / kb[i] = "g" (agent) | "n" | "a". found[i] = 1 quand l'agent est trouvé.
   na[i] / nb[i] = 1 quand ce mot s'est révélé passant sur la carte de A (ou de B).
   Le joueur qui donne l'indice regarde SA carte ; l'autre devine. 9 tours pour trouver les 15 agents. */
function newDuoGame(words){
  const cats = [].concat(new Array(3).fill("gg"), new Array(5).fill("gn"), ["ga"], new Array(5).fill("ng"), ["ag", "aa", "an", "na"], new Array(7).fill("nn"));
  const c = shuffle(cats);
  return { mode: "duo", w: words, ka: c.map(x => x[0]), kb: c.map(x => x[1]), found: new Array(25).fill(0), na: new Array(25).fill(0), nb: new Array(25).fill(0),
    giver: Math.random() < .5 ? "A" : "B", step: "clue", clue: null, got: 0, ok: 0, turns: 9, win: "", why: "", log: "" };
}
const duoKey = (G, side) => (side === "A" ? G.ka : G.kb);
const duoLeftFor = (G, side) => duoKey(G, side).filter((k, i) => k === "g" && !G.found[i]).length;
const duoLeft = G => G.found.length - G.found.filter(Boolean).length - G.ka.map((k, i) => (k !== "g" && G.kb[i] !== "g" ? 1 : 0)).reduce((a, b) => a + b, 0);
function duoReveal(G, i){
  if(G.step !== "guess" || G.win || i < 0 || i > 24 || G.found[i]) return "";
  const side = G.giver, k = duoKey(G, side)[i], nn = side === "A" ? G.na : G.nb, W2 = G.w[i];
  if(nn[i]) return "";
  if(k === "a"){ G.win = "lose"; G.why = "a"; G.log = tr("💀 " + W2 + " : un assassin ! Mission ratée.", "💀 " + W2 + ": an assassin! Mission failed."); return "a"; }
  if(k === "g"){
    G.found[i] = 1; G.got++; G.ok++;
    if(duoLeft(G) <= 0){ G.win = "win"; G.why = "all"; G.log = tr("Les 15 agents sont trouvés : mission réussie !", "All 15 agents found: mission accomplished!"); return "own"; }
    G.log = tr(W2 + " : agent trouvé ! Continue ou arrête-toi.", W2 + ": agent found! Keep going or stop."); return "own";
  }
  nn[i] = 1; G.log = tr(W2 + " : un passant. Fin du tour.", W2 + ": a bystander. Turn over."); duoEnd(G); return "n";
}
function duoEnd(G){
  if(G.win) return;
  G.turns--; G.clue = null; G.got = 0; G.step = "clue";
  if(G.turns <= 0){ G.win = "lose"; G.why = "time"; G.log += tr(" Plus de tours : mission ratée.", " Out of turns: mission failed."); return; }
  // On alterne ; celui dont tous les agents sont trouvés ne donne plus d'indice.
  const nx = G.giver === "A" ? "B" : "A";
  G.giver = duoLeftFor(G, nx) > 0 ? nx : G.giver;
}

/* ---------- Coups de théâtre (un tour au maximum, jamais au premier) ---------- */
const TW = [
  { id: "mime", name: tr("Indice mimé", "Mimed clue"), desc: tr("L'espion n'a pas le droit de parler : il donne seulement le nombre et mime son indice.", "The spymaster can't speak: they only give the number and mime the clue.") },
  { id: "chrono", name: tr("Chrono", "Clock"), desc: tr("Les agents ont 60 secondes pour tout le tour. Au bout du temps, on prend les votes déjà faits.", "Agents have 60 seconds for the whole turn. When time's up, the votes cast so far count.") },
  { id: "flash", name: tr("Indice flash", "Flash clue"), desc: tr("L'espion a 30 secondes pour donner son indice, sinon son équipe passe son tour.", "The spymaster has 30 seconds to give a clue, or the team loses the turn.") },
  { id: "muet", name: tr("Silence radio", "Radio silence"), desc: tr("Les agents ne parlent pas entre eux pendant ce tour : chacun vote seul.", "Agents can't talk to each other this turn: everyone votes alone.") }
];
const TWL = TW.filter(t => t.id !== "chrono" && t.id !== "flash").concat([{ id: "dos", name: tr("Dos tourné", "Back turned"), desc: tr("L'espion donne son indice dos aux agents, sans les regarder.", "The spymaster gives the clue with their back to the agents.") }]);
const nextTw = (on, n, last) => (on && n > 1 ? SB.u.twist(TW, { last, rate: .3 }) : null);

/* ---------- Affichage ---------- */
const CSS = '<style data-ag>' +
  '.ag-grid{display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:5px}' +
  '.ag-c{position:relative; min-height:54px; padding:4px 3px; border-radius:10px; border:2px solid var(--line); background:#efe7da; color:#1c1622; font-weight:800; font-size:12px; line-height:1.1; text-align:center; display:flex; align-items:center; justify-content:center; overflow-wrap:anywhere}.ag-c.l1{font-size:10.5px}.ag-c.l2{font-size:9px; letter-spacing:-.02em}' +
  '.ag-c.kr{box-shadow:inset 0 -7px 0 #e8414e}.ag-c.kb{box-shadow:inset 0 -7px 0 #3a7bff}.ag-c.ka{box-shadow:inset 0 -7px 0 #14101a; outline:2px dashed #14101a; outline-offset:-5px}.ag-c.kp{box-shadow:inset 0 -7px 0 #f2a20c}.ag-c.kg{box-shadow:inset 0 -7px 0 #2fa860}' +
  '.ag-c.r{background:#e8414e; color:#fff; border-color:#e8414e}.ag-c.b{background:#3a7bff; color:#fff; border-color:#3a7bff}.ag-c.n,.ag-c.p{background:#4a4453; color:#cfc8d6; border-color:#4a4453}.ag-c.p{background:#8a5a00; border-color:#8a5a00}.ag-c.a{background:#0b090d; color:#ff5d6c; border-color:#ff5d6c}.ag-c.g{background:#2fa860; color:#fff; border-color:#2fa860}' +
  '.ag-c.dim{opacity:.45}.ag-c.sel{outline:3px solid var(--acc); outline-offset:1px}.ag-c:disabled{cursor:default}' +
  '.ag-c .v{position:absolute; top:-6px; right:-4px; min-width:20px; height:20px; border-radius:99px; background:var(--acc); color:var(--dark,#14101a); font-size:11px; display:grid; place-items:center; padding:0 4px}' +
  '.ag-c .nb{position:absolute; top:2px; left:4px; font-size:9px; opacity:.8}' +
  '.ag-score{display:flex; justify-content:space-between; align-items:center; gap:8px}.ag-score b{font-family:var(--f-disp); font-size:22px; padding:1px 11px; border-radius:12px; border:3px solid transparent}' +
  '.ag-score .r{background:#e8414e; color:#fff}.ag-score .b{background:#3a7bff; color:#fff}.ag-score .on{border-color:var(--ink)}' +
  '.ag-clue{text-align:center; font-family:var(--f-disp); font-weight:800; font-size:30px; line-height:1.1}.ag-clue small{display:block; font-size:13px; color:var(--muted); font-family:var(--f-body,inherit)}' +
  '.ag-log{text-align:center; font-weight:700; font-size:14px; margin:0; color:var(--muted); min-height:1.2em}' +
  '.ag-teams{display:grid; grid-template-columns:1fr 1fr; gap:8px}.ag-team{border-radius:16px; padding:10px; display:flex; flex-direction:column; gap:6px}.ag-team.r{background:rgba(232,65,78,.16); border:2px solid #e8414e}.ag-team.b{background:rgba(58,123,255,.16); border:2px solid #3a7bff}' +
  '.ag-team button{border:0; background:var(--card); color:var(--ink); border-radius:10px; padding:8px; font-weight:800; text-align:left; display:flex; justify-content:space-between; gap:6px; align-items:center}.ag-team .spy{font-size:11px; color:var(--acc)}' +
  '.ag-n{display:grid; grid-template-columns:repeat(6,1fr); gap:5px}.ag-n button{min-height:44px; border-radius:12px; border:1.5px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:18px}.ag-n button[aria-pressed="true"]{background:var(--acc); color:var(--dark,#14101a); border-color:var(--acc)}' +
  '.ag-key{display:flex; gap:10px; flex-wrap:wrap; justify-content:center; font-size:12px; font-weight:700; color:var(--muted)}.ag-key i{display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:4px; vertical-align:-1px}</style>';
const KC = { r: "kr", b: "kb", a: "ka", p: "kp", n: "", g: "kg" };
// Grille. view : { key (tableau de couleurs à montrer en indice, ou null), votes: {i: n}, sel: i, can: i => bool }
function gridHTML(G, view){
  return '<div class="ag-grid">' + G.w.map((w, i) => {
    let cls = "ag-c", rv = "";
    if(G.mode === "duo"){ if(G.found[i]) rv = "g"; else if(view.side && (view.side === "A" ? G.na : G.nb)[i]) rv = "n"; else if(G.na[i] || G.nb[i]) cls += " dim"; }
    else rv = G.rev[i];
    if(rv) cls += " " + rv; else if(view.key && KC[view.key[i]]) cls += " " + KC[view.key[i]];
    if(view.sel === i) cls += " sel";
    const lw = Math.max(...String(w).split(/[\s-]/).map(x => x.length)); if(lw >= 11) cls += " l2"; else if(lw >= 9) cls += " l1";
    const ok = view.can ? view.can(i) : false, v = view.votes && view.votes[i];
    return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (ok ? "" : " disabled") + ">" + esc(w) + (v ? '<span class="v">' + v + "</span>" : "") + "</button>";
  }).join("") + "</div>";
}
const legend = duo => '<div class="ag-key">' + (duo ? '<span><i style="background:#2fa860"></i>' + tr("Agents", "Agents") + '</span><span><i style="background:#14101a; outline:1px solid #ff5d6c"></i>' + tr("Assassins", "Assassins") + "</span>"
  : '<span><i style="background:#e8414e"></i>' + tr("Rouges", "Red") + '</span><span><i style="background:#3a7bff"></i>' + tr("Bleus", "Blue") + '</span><span><i style="background:#14101a; outline:1px solid #ff5d6c"></i>' + tr("Assassin", "Assassin") + '</span><span><i style="background:#f2a20c"></i>' + tr("Piège", "Trap") + "</span>") + "</div>";
const scoreHTML = G => '<div class="ag-score"><b class="r' + (G.turn === "r" && !G.win ? " on" : "") + '">' + left(G, "r") + '</b><span class="ag-log" style="flex:1">' + (G.win ? "" : tr("Au tour des ", "") + TN(G.turn) + tr("", "'s turn")) + '</span><b class="b' + (G.turn === "b" && !G.win ? " on" : "") + '">' + left(G, "b") + "</b></div>";
const duoHead = G => '<div class="ag-score"><b style="background:#2fa860; color:#fff">' + duoLeft(G) + '</b><span class="ag-log" style="flex:1">' + tr("agents à trouver", "agents left") + " · " + tr(G.turns + (G.turns > 1 ? " tours restants" : " tour restant"), G.turns + (G.turns === 1 ? " turn left" : " turns left")) + "</span></div>";
const clueHTML = (c, G) => c ? '<div class="ag-clue">' + (c.m ? "🤫 " + tr("Indice mimé", "Mimed clue") : esc(c.w)) + " · " + (c.n >= 10 ? "∞" : c.n) + "<small>" + (G.mode === "duo" ? tr(G.got + " trouvé" + (G.got > 1 ? "s" : "") + " sur ce tour", G.got + " found this turn") : (c.n > 0 && c.n < 10 ? tr("Encore " + Math.max(0, c.n + 1 - G.got) + " essai" + (c.n + 1 - G.got > 1 ? "s" : "") + " maximum", "Up to " + Math.max(0, c.n + 1 - G.got) + " more " + (c.n + 1 - G.got === 1 ? "guess" : "guesses")) : tr("Essais illimités", "Unlimited guesses"))) + "</small></div>" : "";
// Formulaire de l'espion : un mot + un nombre (0 à 9, ou ∞).
function clueForm(mime){
  return '<div class="card"><span class="eyebrow">' + (mime ? tr("Indice mimé : choisis seulement le nombre", "Mimed clue: just pick the number") : tr("Ton indice : un seul mot et un nombre", "Your clue: one word and a number")) + "</span>" +
    (mime ? "" : '<input class="txt" id="ag-cw" maxlength="24" autocomplete="off" autocapitalize="off" placeholder="' + tr("Ex. : Océan", "E.g. Ocean") + '">') +
    '<div class="ag-n">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => '<button type="button" data-cn="' + n + '" aria-pressed="false">' + (n >= 10 ? "∞" : n) + "</button>").join("") + "</div>" +
    '<p class="err" data-cerr hidden></p></div>';
}
// Lit le formulaire ; renvoie { w, n, m } ou affiche l'erreur.
function readClue(r, G, mime, n){
  const err = t => { const e = r.querySelector("[data-cerr]"); e.textContent = t; e.hidden = false; buzz([20, 40, 20]); return null; };
  if(n == null) return err(tr("Choisis un nombre.", "Pick a number."));
  if(mime) return { w: "", n, m: 1 };
  const w = clean((r.querySelector("#ag-cw") || {}).value || "", 24).trim();
  if(!w) return err(tr("Écris ton indice.", "Type your clue."));
  if(/\s/.test(w.replace(/[-']/g, ""))) return err(tr("Un seul mot !", "Just one word!"));
  const lw = w.toLowerCase(), hit = G.w.some((x, i) => { const open = G.mode === "duo" ? !G.found[i] : !G.rev[i]; return open && String(x).toLowerCase() === lw; });
  if(hit) return err(tr("Ce mot est dans la grille : interdit !", "That word is on the grid: not allowed!"));
  return { w, n, m: 0 };
}
function bindClue(r, onPick){
  let n = null;
  r.querySelectorAll("[data-cn]").forEach(b => b.addEventListener("click", () => { n = +b.dataset.cn; buzz(6); r.querySelectorAll("[data-cn]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.cn === n)); }));
  return () => n;
}
function wordsEditor(){
  SB.page(tr("Nos mots perso", "Our own words"), root => {
    root.innerHTML = '<div class="gs"><p class="howto">' + tr("Vos surnoms, vos private jokes, vos lieux… Jusqu'à 8 mots perso sont glissés dans chaque grille (avec l'option « Mots perso »). Un mot par ligne.", "Your nicknames, inside jokes, places… Up to 8 of your own words go into each grid (with the “Our own words” option). One word per line.") + "</p>" +
      '<textarea class="txt" id="ag-words" rows="10" placeholder="' + tr("Kéké\nLe camping\nTonton Michel", "Big Mike\nThe campsite\nUncle Joe") + '"></textarea><p class="sm" data-agn></p></div>';
    const ta = root.querySelector("#ag-words"), n = root.querySelector("[data-agn]");
    ta.value = myWords().join("\n");
    const save = () => { const ws = ta.value.split(/[\n,;]/).map(w => clean(w, 24)).filter(Boolean).slice(0, 80); persist({ agWords: ws }); n.textContent = tr(ws.length + " mot" + (ws.length > 1 ? "s" : ""), ws.length + (ws.length === 1 ? " word" : " words")); };
    ta.addEventListener("input", save); save();
  });
}
const TEAMC = t => (t === "r" ? "#e8414e" : "#3a7bff");

SB.register({
  id: "agents", name: tr("Agents secrets", "Secret Agents"), glyph: "Code Names", pitch: tr("Deux équipes, 25 mots, un espion qui donne des indices.", "Two teams, 25 words, a spymaster giving clues."), hot: true,
  accent: { light: "#d63b47", dark: "#ff6b74" },
  tag: tr("Votre espion connaît la carte secrète. Un mot, un nombre : retrouvez vos agents avant l'autre équipe, sans toucher l'assassin.", "Your spymaster knows the secret map. One word, one number: find your agents before the other team, without hitting the assassin."),
  min: 2, max: 16,
  gages: [
    { ev: "mauvais", label: tr("Mot de l'autre équipe touché", "Hit the other team's word"), kind: "boit", n: 1 },
    { ev: "assassin", label: tr("L'assassin touché", "Hit the assassin"), kind: "boit", n: 3 },
    { ev: "indice", label: tr("Indice qui fait trouver 3 mots ou plus (l'espion)", "Clue that finds 3+ words (spymaster)"), kind: "distribue", n: 2 }
  ],
  rules: tr([
    "Deux équipes, rouges et bleus. Dans chaque équipe, un espion voit la carte secrète : quels mots sont à son équipe, à l'autre, neutres, et où se cache l'assassin.",
    "À son tour, l'espion donne un indice : un seul mot et un nombre (combien de mots de la grille vont avec). Le mot ne doit pas être dans la grille.",
    "Les agents de l'équipe votent sur leur téléphone. Le mot le plus voté est retourné.",
    "Bon mot : on peut continuer (jusqu'au nombre + 1). Neutre ou mot adverse : fin du tour. L'assassin : l'équipe perd tout de suite.",
    "La première équipe qui retrouve tous ses agents gagne. L'équipe qui commence a 9 mots, l'autre 8.",
    "Mode Duo (2 joueurs) : en coopération, chacun voit sa propre carte. Trouvez les 15 agents en 9 tours, sans toucher un des 3 assassins de la carte de l'autre.",
    "Options : mots perso (vos surnoms et private jokes dans la grille), 2 assassins, un mot piégé qui fait sauter un tour, coups de théâtre (indice mimé, chrono, silence radio…)."
  ], [
    "Two teams, red and blue. Each team has a spymaster who sees the secret map: which words belong to their team, to the other team, which are neutral, and where the assassin hides.",
    "On their turn, the spymaster gives a clue: one word and a number (how many grid words it fits). The word can't be on the grid.",
    "The team's agents vote on their phones. The most-voted word is revealed.",
    "Right word: keep going (up to the number + 1). Neutral or the other team's word: turn over. The assassin: that team loses on the spot.",
    "First team to find all its agents wins. The starting team has 9 words, the other 8.",
    "Duo mode (2 players): co-op, each player sees their own map. Find all 15 agents in 9 turns without hitting one of the 3 assassins on the other player's map.",
    "Options: your own words (nicknames and inside jokes on the grid), 2 assassins, a booby-trapped word that skips a turn, twists (mimed clue, clock, radio silence…)."
  ]),
  options: [
    { id: "mode", label: tr("Mode", "Mode"), type: "seg", def: "eq", values: [{ v: "eq", label: tr("Équipes (4+)", "Teams (4+)") }, { v: "duo", label: tr("Duo (2)", "Duo (2)") }] },
    { id: "packs", label: tr("Paquets de mots", "Word packs"), type: "multi", def: ["cl", "pop"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length })) },
    { id: "perso", label: tr("Mots perso", "Our own words"), type: "toggle", text: tr("Mots perso et prénoms", "Our own words and names"), desc: tr("Vos mots à vous et vos prénoms glissés dans la grille", "Your own words and your names slipped into the grid"), def: true },
    { id: "edit", type: "button", label: tr("Modifier nos mots perso", "Edit our own words"), onClick: () => wordsEditor() },
    { id: "assassins", label: tr("Assassins (équipes)", "Assassins (teams)"), type: "seg", def: 1, values: [{ v: 1, label: "1" }, { v: 2, label: "2" }] },
    { id: "piege", label: tr("Mot piégé", "Booby trap"), type: "toggle", text: tr("Mot piégé", "Booby-trapped word"), desc: tr("Un mot neutre fait sauter le prochain tour de l'équipe qui le touche", "One neutral word makes the team that hits it skip their next turn"), def: false },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour un tour", "Now and then, a rule changes for one turn"), def: true }
  ],
  ticks: true,
  start(ctx, o){
    const duo = o.mode === "duo", n = ctx.ids.length;
    if(duo && n !== 2) throw new Error(tr("Le mode Duo se joue à 2 exactement.", "Duo mode is for exactly 2 players."));
    if(!duo && n < 4) throw new Error(tr("En équipes, il faut au moins 4 joueurs. À 2, prends le mode Duo.", "Teams need at least 4 players. With 2, pick Duo mode."));
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet de mots.", "Pick at least one word pack."));
    const lg = SB.lang(), extra = o.perso !== false ? myWords().concat(ctx.players.map(p => p.name)) : [];
    const words = pickWords(o.packs, lg, extra);
    if(duo){ const sh = shuffle(ctx.ids); return Object.assign(newDuoGame(words), { lg, phase: "play", pa: sh[0], pb: sh[1], tw: "", n: 1 }); }
    const sh = shuffle(ctx.ids), teams = {}; sh.forEach((id, i) => { teams[id] = i % 2 ? "b" : "r"; });
    return Object.assign(newTeamGame(words, o), { lg, phase: "teams", teams, spy: { r: sh[0], b: sh[1] }, tw: "", n: 1, endAt: 0 });
  },
  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    if(s.win){ return; }
    const G = JSON.parse(JSON.stringify(s));
    if(G.mode === "duo"){
      const giverId = G.giver === "A" ? G.pa : G.pb, guessId = G.giver === "A" ? G.pb : G.pa;
      if(G.step === "clue"){
        const i = ctx.input(giverId);
        if(i && i.c && typeof i.c === "object"){ G.clue = { w: clean(i.c.w || "", 24), n: Math.max(0, Math.min(10, +i.c.n || 0)), m: i.c.m ? 1 : 0 }; G.step = "guess"; G.log = ""; ctx.set(Object.assign(G, { k: ctx.rid() })); }
        return;
      }
      const g = ctx.input(guessId);
      if(g && g.g != null){
        const before = G.found.filter(Boolean).length;
        let res = "";
        if(+g.g === -1){ if(G.got > 0){ G.log = tr("Tour terminé.", "Turn over."); duoEnd(G); res = "stop"; } }
        else res = duoReveal(G, +g.g);
        if(res === "a") ctx.gage([{ id: guessId, ev: "assassin" }], s.k + ":a");
        if((res === "n" || res === "stop" || (G.win && res === "own")) && G.ok >= 3) ctx.gage([{ id: giverId, ev: "indice" }], s.k + ":i");
        if(G.step === "clue") G.ok = 0;
        if(res || G.found.filter(Boolean).length !== before){
          if(G.win) G.phase = "end";
          const nt = G.step === "clue" && !G.win ? nextTw(ctx.opts.twists !== false, G.n + 1, G.tw) : null;
          ctx.set(Object.assign(G, { k: ctx.rid(), tw: G.step === "clue" ? (nt && (nt.id === "mime" || nt.id === "muet") ? nt.id : "") : G.tw, n: G.step === "clue" ? G.n + 1 : G.n }));
        }
      }
      return;
    }
    // Équipes : un espion absent est remplacé par un coéquipier présent.
    ["r", "b"].forEach(t => { if(!ctx.here(G.spy[t])){ const alt = ctx.ids.find(id => G.teams[id] === t && ctx.here(id)); if(alt && alt !== G.spy[t]){ G.spy[t] = alt; ctx.set({ spy: Object.assign({}, G.spy) }); } } });
    const t = G.turn, spy = G.spy[t];
    if(G.step === "clue"){
      const i = ctx.input(spy);
      if(i && i.c && typeof i.c === "object"){
        G.clue = { w: clean(i.c.w || "", 24), n: Math.max(0, Math.min(10, +i.c.n || 0)), m: i.c.m ? 1 : 0 }; G.step = "guess"; G.log = "";
        ctx.set(Object.assign(G, { k: ctx.rid(), endAt: G.tw === "chrono" ? ctx.now() + 60000 : 0 }));
      } else if(G.tw === "flash" && G.endAt && ctx.now() > G.endAt){
        G.log = tr("Trop tard ! Les " + TN(t) + " passent leur tour.", "Too late! " + TN(t) + " lose their turn."); endTurn(G); afterTurn(ctx, G, s);
      }
      return;
    }
    // Votes des agents présents de l'équipe (l'espion ne vote pas).
    const agents = ctx.ids.filter(id => G.teams[id] === t && id !== spy && ctx.here(id));
    const votes = {}; let all = agents.length > 0;
    agents.forEach(id => { const x = ctx.input(id); if(x && x.v != null && (+x.v === -1 || (+x.v >= 0 && +x.v < 25 && !G.rev[+x.v]))) votes[id] = +x.v; else all = false; });
    const late = G.tw === "chrono" && G.endAt && ctx.now() > G.endAt;
    if(!all && !late) return;
    const cnt = {}; Object.keys(votes).forEach(id => { cnt[votes[id]] = (cnt[votes[id]] || 0) + 1; });
    const ks = Object.keys(cnt), mx = Math.max(0, ...ks.map(k => cnt[k])), top = ks.filter(k => cnt[k] === mx);
    if(!ks.length){ G.log = tr("Personne n'a voté : fin du tour.", "Nobody voted: turn over."); endTurn(G); afterTurn(ctx, G, s); return; }
    if(top.length > 1){ ctx.set({ log: tr("Égalité entre plusieurs mots : revotez !", "Tie between several words: vote again!"), k: ctx.rid(), endAt: G.tw === "chrono" ? ctx.now() + 30000 : 0 }); return; }
    const pickI = +top[0];
    if(pickI === -1){ G.log = tr("Les " + TN(t) + " s'arrêtent là.", TN(t) + " stop here."); endTurn(G); }
    else {
      const res = teamReveal(G, pickI);
      if(res === "other") ctx.gage(agents.map(id => ({ id, ev: "mauvais" })), s.k + ":m");
      if(res === "a") ctx.gage(agents.map(id => ({ id, ev: "assassin" })), s.k + ":a");
    }
    afterTurn(ctx, G, s);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me;
    if(s.mode === "duo") return renderDuo(ctx, root);
    const myT = s.teams ? s.teams[me] : "", isSpy = s.spy && (s.spy.r === me || s.spy.b === me), T = SB.u.byTwist(TW, s.tw || "");
    if(s.phase === "teams"){
      const col = t => '<div class="ag-team ' + t + '"><b style="color:' + TEAMC(t) + '">' + TN(t) + "</b>" + ctx.ids.filter(id => s.teams[id] === t).map(id => '<button type="button" data-tm="' + esc(id) + '"' + (ctx.isHost ? "" : " disabled") + "><span>" + esc(ctx.name(id)) + "</span>" + (s.spy[t] === id ? '<span class="spy">' + tr("ESPION", "SPYMASTER") + "</span>" : "") + "</button>").join("") + "</div>";
      screen(root, "tm" + JSON.stringify([s.teams, s.spy]) + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Les équipes", "The teams") + '</span><div class="ag-teams">' + col("r") + col("b") + "</div>" +
        (ctx.isHost ? '<p class="sm">' + tr("Touche un joueur : 1 fois pour en faire l'espion, 2 fois pour le changer d'équipe.", "Tap a player once to make them spymaster, twice to switch their team.") + "</p>" : '<p class="wait">' + tr("L'hôte règle les équipes…", "The host is setting up the teams…") + "</p>") +
        SB.u.dock(ctx.isHost ? '<div class="row"><button class="btn ghost" type="button" data-mix>' + tr("Mélanger", "Shuffle") + '</button><button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button></div>" : ""), r => {
        r.querySelectorAll("[data-tm]").forEach(b => b.addEventListener("click", () => ctx.act(c => {
          const id = b.dataset.tm, st = c.s, tm = Object.assign({}, st.teams), sp = Object.assign({}, st.spy), t = tm[id];
          if(sp[t] !== id){ sp[t] = id; c.set({ spy: sp }); return; }
          const nt = other(t); tm[id] = nt;
          if(!c.ids.some(x => tm[x] === t)){ return; }
          sp[t] = c.ids.find(x => tm[x] === t); if(!c.ids.some(x => tm[x] === nt && x !== id) || !sp[nt]) sp[nt] = id;
          c.set({ teams: tm, spy: sp });
        })));
        const mx = r.querySelector("[data-mix]"); if(mx) mx.addEventListener("click", () => ctx.act(c => { const sh = shuffle(c.ids), tm = {}; sh.forEach((id, i) => { tm[id] = i % 2 ? "b" : "r"; }); c.set({ teams: tm, spy: { r: sh[0], b: sh[1] } }); }));
        const go = r.querySelector("[data-go]"); if(go) go.addEventListener("click", () => ctx.act(c => {
          const st = c.s, cnt = t => c.ids.filter(id => st.teams[id] === t).length;
          if(cnt("r") < 2 || cnt("b") < 2){ SB.u.toast(tr("Il faut au moins 2 joueurs par équipe.", "Each team needs at least 2 players.")); return; }
          c.set({ phase: "play", log: tr("Les " + TN(st.start) + " commencent : ils ont 9 mots à trouver.", TN(st.start) + " go first: they have 9 words to find."), k: c.rid() });
        }));
      });
      return;
    }
    const G = s, spyT = G.spy[G.turn], myTurnSpy = G.step === "clue" && spyT === me && !G.win, agent = !isSpy && myT === G.turn && G.step === "guess" && !G.win;
    const mine = ctx.mine(), myVote = mine && mine.v != null ? +mine.v : null;
    const votes = {}; if(G.step === "guess") ctx.ids.filter(id => s.teams[id] === G.turn).forEach(id => { const x = ctx.input(id); if(x && x.v != null && +x.v >= 0) votes[+x.v] = (votes[+x.v] || 0) + 1; });
    const left2 = G.tw === "chrono" || G.tw === "flash" ? Math.max(0, Math.ceil((G.endAt - ctx.now()) / 1000)) : 0;
    const tm = myT ? '<span class="pill" style="background:' + TEAMC(myT) + '; color:#fff">' + TN(myT) + (isSpy ? " · " + tr("espion", "spymaster") : "") + "</span>" : "";
    let mid = "", dockH = "";
    if(G.win){
      mid = '<div class="ag-clue" style="color:' + TEAMC(G.win) + '">' + tr("Les " + TN(G.win) + " gagnent !", TN(G.win) + " win!") + "<small>" + esc(G.log) + "</small></div>";
      dockH = ctx.isHost ? '<div class="row"><button class="btn ghost" type="button" data-again>' + tr("Nouvelle grille", "New grid") + '</button><button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button></div>" : '<p class="wait">' + tr("L'hôte choisit la suite…", "The host is picking what's next…") + "</p>";
    } else if(G.step === "clue"){
      mid = myTurnSpy ? clueForm(G.tw === "mime") + (G.tw === "flash" ? '<p class="ag-log" data-left>' + left2 + " s</p>" : "") : '<p class="ag-clue" style="font-size:20px">' + tr("L'espion " + TN1(G.turn) + ", " + esc(ctx.name(spyT)) + ", réfléchit…", "The " + TN1(G.turn) + " spymaster, " + esc(ctx.name(spyT)) + ", is thinking…") + "</p>";
      dockH = myTurnSpy ? '<button class="btn acc" type="button" data-clue>' + tr("Donner l'indice", "Give the clue") + "</button>" : "";
    } else {
      mid = clueHTML(G.clue, G) + (G.tw === "chrono" ? '<p class="ag-log" data-left>' + left2 + " s</p>" : "");
      dockH = agent ? '<div class="row"><button class="btn ghost" type="button" data-pass>' + (myVote === -1 ? tr("Vote : on s'arrête", "Vote: stop") : tr("On s'arrête là", "Stop here")) + '</button></div><p class="wait" data-wait></p>'
        : '<p class="wait">' + (myT === G.turn && isSpy ? tr("Tes agents cherchent… Pas un mot !", "Your agents are searching… Not a word!") : tr("Les " + TN(G.turn) + " cherchent…", TN(G.turn) + " are searching…")) + "</p>";
    }
    const view = { key: isSpy || G.win ? G.key : null, votes: myT === G.turn || isSpy ? votes : null, sel: agent ? myVote : null, can: i => agent && !G.rev[i] };
    screen(root, "p" + s.k + G.step + G.win + myVote + JSON.stringify(votes) + isSpy + JSON.stringify(G.spy), CSS + (tm ? '<div style="display:flex; justify-content:space-between; align-items:center">' + tm + "</div>" : "") + SB.u.twistHTML(T) + scoreHTML(G) + mid + gridHTML(G, view) + (isSpy ? legend(false) : "") + '<p class="ag-log">' + esc(G.win ? "" : G.log || "") + "</p>" +
      SB.u.dock(dockH), r => {
      const cl = r.querySelector("[data-clue]");
      if(cl){ const nGet = bindClue(r); cl.addEventListener("click", () => { const c = readClue(r, G, G.tw === "mime", nGet()); if(!c) return; buzz(12); ctx.send({ c }); cl.disabled = true; cl.textContent = tr("Indice envoyé", "Clue sent"); }); }
      r.querySelectorAll(".ag-grid [data-i]").forEach(b => b.addEventListener("click", () => { if(!agent) return; buzz(8); ctx.send({ v: myVote === +b.dataset.i ? null : +b.dataset.i }); }));
      const ps = r.querySelector("[data-pass]"); if(ps) ps.addEventListener("click", () => { buzz(8); ctx.send({ v: myVote === -1 ? null : -1 }); });
      const ag = r.querySelector("[data-again]"); if(ag) ag.addEventListener("click", () => ctx.act(c => {
        const st = c.s, words = pickWords(c.opts.packs, st.lg, c.opts.perso !== false ? myWords().concat(c.players.map(p => p.name)) : []);
        const nxtSpy = t => { const tl = c.ids.filter(id => st.teams[id] === t); return tl[(tl.indexOf(st.spy[t]) + 1) % tl.length]; };
        c.set(Object.assign(newTeamGame(words, c.opts), { phase: "play", spy: { r: nxtSpy("r"), b: nxtSpy("b") }, tw: "", n: 1, endAt: 0, k: c.rid() }));
      }));
      const bk = r.querySelector("[data-back]"); if(bk) bk.addEventListener("click", () => ctx.act(c => {
        const st = c.s, w = c.ids.filter(id => st.teams[id] === st.win);
        c.end({ title: tr("Agents secrets : les " + TN(st.win) + " gagnent", "Secret Agents: " + TN(st.win) + " win"), lines: [w.map(c.name).join(", "), st.log].filter(Boolean), win: w });
      }));
    });
    if(agent){ const tl = ctx.ids.filter(id => s.teams[id] === G.turn && id !== spyT && ctx.here(id)); txt(root, "[data-wait]", tl.filter(id => { const x = ctx.input(id); return x && x.v != null; }).length + " / " + tl.length + tr(" votes", " votes")); }
    if(left2 || G.tw === "chrono" || G.tw === "flash") txt(root, "[data-left]", left2 + " s");
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 2, max: 16 },
    start(root, api){
      const names = api.names, st = store();
      let mode = names.length === 2 ? "duo" : (st.agMode === "duo" ? "duo" : "eq"), sel = A(st.agPacks).length ? A(st.agPacks).slice() : ["cl", "pop"];
      let perso = st.agPerso !== false, nass = st.agAss === 2 ? 2 : 1, piege = !!st.agPiege, twOn = st.agTw !== false;
      let teams = {}, spy = { r: "", b: "" }, G = null, tw = null, nTurn = 0, sel1 = null, gno = 0, tok = Math.random().toString(36).slice(2, 7);
      const mixTeams = () => { const sh = shuffle(names); teams = {}; sh.forEach((n, i) => { teams[n] = i % 2 ? "b" : "r"; }); spy = { r: sh[0], b: sh[1] || sh[0] }; };
      mixTeams();
      function setup(){
        const okEq = names.length >= 4, okDuo = names.length === 2;
        if(mode === "eq" && !okEq && okDuo) mode = "duo"; if(mode === "duo" && !okDuo && okEq) mode = "eq";
        const col = t => '<div class="ag-team ' + t + '"><b style="color:' + TEAMC(t) + '">' + TN(t) + "</b>" + names.filter(n => teams[n] === t).map(n => '<button type="button" data-tm="' + esc(n) + '"><span>' + esc(n) + "</span>" + (spy[t] === n ? '<span class="spy">' + tr("ESPION", "SPYMASTER") + "</span>" : "") + "</button>").join("") + "</div>";
        screen(root, "su" + Math.random(), CSS +
          '<div class="field"><span class="eyebrow">' + tr("Mode", "Mode") + '</span><div class="seg"><button type="button" data-m="eq" aria-pressed="' + (mode === "eq") + '"' + (okEq ? "" : " disabled") + ">" + tr("Équipes (4+)", "Teams (4+)") + '</button><button type="button" data-m="duo" aria-pressed="' + (mode === "duo") + '"' + (okDuo ? "" : " disabled") + ">" + tr("Duo (2)", "Duo (2)") + "</button></div>" +
          (!okEq && !okDuo ? '<p class="err">' + tr("Il faut 2 joueurs (Duo) ou au moins 4 (équipes).", "You need 2 players (Duo) or at least 4 (teams).") + "</p>" : "") + "</div>" +
          (mode === "eq" && okEq ? '<div class="field"><span class="eyebrow">' + tr("Les équipes", "The teams") + '</span><div class="ag-teams">' + col("r") + col("b") + '</div><p class="sm" style="margin:0">' + tr("Touche un joueur : 1 fois pour l'espion, 2 fois pour changer d'équipe.", "Tap a player once for spymaster, twice to switch team.") + '</p><button class="link" type="button" data-mix style="align-self:flex-start">' + tr("Mélanger les équipes", "Shuffle teams") + "</button></div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Paquets de mots", "Word packs") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div></div>" +
          '<div class="field"><div class="packs">' +
            '<button type="button" class="pack" data-perso aria-pressed="' + perso + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Mots perso et prénoms", "Our own words and names") + '</span><span class="ds">' + tr(myWords().length + " mot(s) perso", myWords().length + " own word(s)") + "</span></span></button>" +
            (mode === "eq" ? '<button type="button" class="pack" data-piege aria-pressed="' + piege + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Mot piégé", "Booby-trapped word") + '</span><span class="ds">' + tr("Fait sauter le prochain tour", "Skips your next turn") + "</span></span></button>" +
              '<button type="button" class="pack" data-ass aria-pressed="' + (nass === 2) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("2 assassins", "2 assassins") + '</span><span class="ds">' + tr("Plus de danger", "More danger") + "</span></span></button>" : "") +
            '<button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Une règle change de temps en temps", "A rule changes now and then") + "</span></span></button>" +
          '</div><button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Modifier nos mots perso", "Edit our own words") + "</button></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go' + (okEq || okDuo ? "" : " disabled") + ">" + tr("Distribuer la grille", "Deal the grid") + "</button>"), r => {
          r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ agMode: mode }); setup(); }));
          r.querySelectorAll("[data-tm]").forEach(b => b.addEventListener("click", () => {
            const n = b.dataset.tm, t = teams[n];
            if(spy[t] !== n){ spy[t] = n; setup(); return; }
            if(names.filter(x => teams[x] === t).length <= 2) { SB.u.toast(tr("Au moins 2 joueurs par équipe.", "At least 2 players per team.")); return; }
            teams[n] = other(t); spy[t] = names.find(x => teams[x] === t); setup();
          }));
          const mx = r.querySelector("[data-mix]"); if(mx) mx.addEventListener("click", () => { mixTeams(); setup(); });
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ agPacks: sel }); setup(); }));
          r.querySelector("[data-perso]").addEventListener("click", () => { perso = !perso; persist({ agPerso: perso }); setup(); });
          const pg = r.querySelector("[data-piege]"); if(pg) pg.addEventListener("click", () => { piege = !piege; persist({ agPiege: piege }); setup(); });
          const as = r.querySelector("[data-ass]"); if(as) as.addEventListener("click", () => { nass = nass === 2 ? 1 : 2; persist({ agAss: nass }); setup(); });
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ agTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => wordsEditor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; }
            const words = pickWords(SB.okPacks(sel, PACKS), SB.lang(), perso ? myWords().concat(names) : []);
            G = mode === "duo" ? Object.assign(newDuoGame(words), { pa: names[0], pb: names[1] }) : newTeamGame(words, { assassins: nass, piege });
            gno++; nTurn = 0; tw = null; turnStart();
          });
        });
      }
      const giverName = () => (G.mode === "duo" ? (G.giver === "A" ? G.pa : G.pb) : spy[G.turn]);
      const guesserLabel = () => (G.mode === "duo" ? (G.giver === "A" ? G.pb : G.pa) : tr("les " + TN(G.turn), TN(G.turn)));
      const head = () => CSS + SB.u.twistHTML(tw) + (G.mode === "duo" ? duoHead(G) : scoreHTML(G));
      // Début d'un tour : on passe le téléphone à l'espion (ou au joueur qui donne l'indice en Duo).
      function turnStart(){
        if(G.win){ end(); return; }
        nTurn++; tw = twOn && nTurn > 1 ? SB.u.twist(TWL, { last: tw ? tw.id : "", rate: .3 }) : null; sel1 = null;
        screen(root, "ts" + gno + ":" + nTurn, head() + '<p class="ag-log">' + esc(G.log || "") + '</p><div class="pass"><span class="eyebrow">' + (G.mode === "duo" ? tr("Donne l'indice", "Gives the clue") : tr("Espion " + TN1(G.turn), TN(G.turn) + " spymaster")) + '</span><div class="who">' + esc(giverName()) + '</div><p class="howto">' + tr("Prends le téléphone, les autres ne regardent pas l'écran.", "Take the phone, nobody else looks at the screen.") + "</p></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-me>' + tr("C'est moi, je regarde la carte", "It's me, show me the map") + "</button>"), r => r.querySelector("[data-me]").addEventListener("click", spyView));
      }
      function spyView(){
        const key = G.mode === "duo" ? duoKey(G, G.giver) : G.key, mime = tw && tw.id === "mime";
        screen(root, "sv" + gno + ":" + nTurn, head() + gridHTML(G, { key, side: G.giver }) + legend(G.mode === "duo") + clueForm(mime) +
          SB.u.dock('<button class="btn acc" type="button" data-clue>' + tr("Cacher la carte et donner l'indice", "Hide the map and give the clue") + "</button>"), r => {
          const nGet = bindClue(r);
          r.querySelector("[data-clue]").addEventListener("click", () => { const c = readClue(r, G, mime, nGet()); if(!c) return; G.clue = c; G.step = "guess"; G.got = 0; G.ok = 0; G.log = ""; buzz(12); guess(); });
        });
      }
      function guess(){
        if(G.win){ end(); return; }
        if(G.step !== "guess"){ turnEnd(); return; }
        const duo = G.mode === "duo", can = i => (duo ? !G.found[i] && !(G.giver === "A" ? G.na : G.nb)[i] : !G.rev[i]);
        screen(root, "g" + gno + ":" + nTurn + ":" + (duo ? G.found.join("") + G.na.join("") + G.nb.join("") : G.rev.join(",")) + sel1, head() + clueHTML(G.clue, G) +
          '<p class="howto" style="text-align:center; margin:0">' + tr("Au tour de ", "") + esc(guesserLabel()) + tr(" : touchez un mot puis « Retourner ».", ": tap a word then “Reveal”.") + "</p>" +
          gridHTML(G, { side: G.giver, sel: sel1, can }) + '<p class="ag-log">' + esc(G.log || "") + "</p>" +
          SB.u.dock('<div class="row"><button class="btn ghost" type="button" data-stop' + (duo && !G.got ? " disabled" : "") + ">" + tr("Fin du tour", "End turn") + '</button><button class="btn acc" type="button" data-rv' + (sel1 == null ? " disabled" : "") + ">" + tr("Retourner", "Reveal") + "</button></div>"), r => {
          r.querySelectorAll(".ag-grid [data-i]").forEach(b => b.addEventListener("click", () => { const i = +b.dataset.i; sel1 = sel1 === i ? null : i; buzz(6); guess(); }));
          r.querySelector("[data-rv]").addEventListener("click", () => {
            if(sel1 == null) return; const t = G.turn, i = sel1; sel1 = null;
            const res = duo ? duoReveal(G, i) : teamReveal(G, i); buzz(res === "own" ? 15 : [30, 40, 30]);
            gLocal(res, t);
            guess();
          });
          r.querySelector("[data-stop]").addEventListener("click", () => {
            const t = G.turn;
            if(duo){ G.log = tr("Tour terminé.", "Turn over."); if(G.ok >= 3) giveIndice(); duoEnd(G); }
            else { G.log = tr("Les " + TN(t) + " s'arrêtent là.", TN(t) + " stop here."); if(G.ok >= 3) giveIndice(); endTurn(G); }
            turnEnd();
          });
        });
      }
      const key0 = () => "ag" + tok + "-" + gno + ":" + nTurn;
      function giveIndice(){ if(api.gage) api.gage([{ id: giverName(), ev: "indice" }], key0() + ":i"); }
      // Gages sur un seul téléphone.
      function gLocal(res, t){
        if(!api.gage || !res) return;
        const teamOf = tt => names.filter(n => teams[n] === tt && n !== spy[tt]);
        if(G.mode === "duo"){
          if(res === "a") api.gage([{ id: guesserLabel(), ev: "assassin" }], key0() + ":a");
          if((res === "n" || G.win) && G.ok >= 3) giveIndice();
          return;
        }
        if(res === "other") api.gage(teamOf(t).map(n => ({ id: n, ev: "mauvais" })), key0() + ":m" + G.rev.join(""));
        if(res === "a") api.gage(teamOf(t).map(n => ({ id: n, ev: "assassin" })), key0() + ":a");
        if((res === "n" || res === "p" || res === "other" || G.win) && G.ok >= 3) giveIndice();
      }
      function turnEnd(){ if(G.win){ end(); return; } turnStart(); }
      function end(){
        const duo = G.mode === "duo", w = duo ? (G.win === "win" ? names.slice() : []) : names.filter(n => teams[n] === G.win);
        if(api.win){ let tries = 0; const win = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(win, 500); else api.win(w); }; win(); }
        const title = duo ? (G.win === "win" ? tr("Mission réussie !", "Mission accomplished!") : tr("Mission ratée…", "Mission failed…")) : tr("Les " + TN(G.win) + " gagnent !", TN(G.win) + " win!");
        screen(root, "end" + gno, CSS + '<div class="ag-clue" style="color:' + (duo ? (G.win === "win" ? "#2fa860" : "#ff5d6c") : TEAMC(G.win)) + '">' + title + "<small>" + esc(G.log || "") + "</small></div>" +
          '<span class="eyebrow">' + tr("La carte complète", "The full map") + "</span>" + (duo
            ? gridHTML(G, { key: G.ka.map((k, i) => (k === "g" || G.kb[i] === "g" ? "g" : k === "a" || G.kb[i] === "a" ? "a" : "n")), side: "" })
            : gridHTML(G, { key: G.key })) + legend(duo) +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", () => {
            if(G.mode === "eq") ["r", "b"].forEach(t => { const tl = names.filter(n => teams[n] === t); spy[t] = tl[(tl.indexOf(spy[t]) + 1) % tl.length]; });
            setup();
          });
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// Après un tour en réseau : gage « indice » si l'espion a fait trouver 3 mots ou plus, coup de théâtre du tour suivant.
function afterTurn(ctx, G, s){
  const turned = G.step === "clue" || G.win;
  if(turned && G.ok >= 3) ctx.gage([{ id: s.spy[s.turn], ev: "indice" }], s.k + ":i");
  if(G.win){ ctx.set(Object.assign(G, { phase: "end", k: ctx.rid() })); return; }
  if(G.step === "clue"){
    const t = nextTw(ctx.opts.twists !== false, G.n + 1, G.tw);
    G.ok = 0; G.n = G.n + 1; G.tw = t ? t.id : "";
    ctx.set(Object.assign(G, { k: ctx.rid(), endAt: G.tw === "flash" ? ctx.now() + 30000 : 0 }));
    return;
  }
  ctx.set(Object.assign(G, { k: ctx.rid() }));
}
// Duo en réseau : chacun voit sa carte ; celui qui donne l'indice tape le mot, l'autre touche les mots.
function renderDuo(ctx, root){
  const s = ctx.s, me = ctx.me, side = s.pa === me ? "A" : s.pb === me ? "B" : "", giverId = s.giver === "A" ? s.pa : s.pb, guessId = s.giver === "A" ? s.pb : s.pa;
  const T = SB.u.byTwist(TW, s.tw || ""), iGive = giverId === me && s.step === "clue" && !s.win, iGuess = guessId === me && s.step === "guess" && !s.win;
  const myKey = side ? duoKey(s, side) : null;
  let mid = "", dockH = "";
  if(s.win){
    mid = '<div class="ag-clue" style="color:' + (s.win === "win" ? "#2fa860" : "#ff5d6c") + '">' + (s.win === "win" ? tr("Mission réussie !", "Mission accomplished!") : tr("Mission ratée…", "Mission failed…")) + "<small>" + esc(s.log || "") + "</small></div>";
    dockH = ctx.isHost ? '<div class="row"><button class="btn ghost" type="button" data-again>' + tr("Nouvelle grille", "New grid") + '</button><button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button></div>" : '<p class="wait">' + tr("L'hôte choisit la suite…", "The host is picking what's next…") + "</p>";
  } else if(s.step === "clue"){
    mid = iGive ? clueForm(s.tw === "mime") : '<p class="ag-clue" style="font-size:20px">' + tr(esc(ctx.name(giverId)) + " cherche un indice…", esc(ctx.name(giverId)) + " is thinking of a clue…") + "</p>";
    dockH = iGive ? '<button class="btn acc" type="button" data-clue>' + tr("Donner l'indice", "Give the clue") + "</button>" : "";
  } else {
    mid = clueHTML(s.clue, s);
    dockH = iGuess ? '<button class="btn ghost" type="button" data-stop' + (s.got ? "" : " disabled") + ">" + tr("Fin du tour", "End turn") + "</button>" : '<p class="wait">' + tr(esc(ctx.name(guessId)) + " cherche… Pas un mot !", esc(ctx.name(guessId)) + " is searching… Not a word!") + "</p>";
  }
  const nn = s.giver === "A" ? s.na : s.nb;
  const view = { key: s.win ? s.ka.map((k, i) => (k === "g" || s.kb[i] === "g" ? "g" : k === "a" || s.kb[i] === "a" ? "a" : "n")) : myKey, side: s.giver, can: i => iGuess && !s.found[i] && !nn[i] };
  screen(root, "d" + s.k + s.step + s.win, CSS + SB.u.twistHTML(T) + duoHead(s) + mid + gridHTML(s, view) + (side ? '<p class="sm" style="text-align:center; margin:0">' + tr("Les couleurs en bas des mots : TA carte secrète.", "The colors under the words: YOUR secret map.") + "</p>" + legend(true) : "") + '<p class="ag-log">' + esc(s.win ? "" : s.log || "") + "</p>" + SB.u.dock(dockH), r => {
    const cl = r.querySelector("[data-clue]");
    if(cl){ const nGet = bindClue(r); cl.addEventListener("click", () => { const c = readClue(r, s, s.tw === "mime", nGet()); if(!c) return; buzz(12); ctx.send({ c }); cl.disabled = true; cl.textContent = tr("Indice envoyé", "Clue sent"); }); }
    r.querySelectorAll(".ag-grid [data-i]").forEach(b => b.addEventListener("click", () => { if(!iGuess) return; buzz(8); ctx.send({ g: +b.dataset.i }); }));
    const sp = r.querySelector("[data-stop]"); if(sp) sp.addEventListener("click", () => { buzz(8); ctx.send({ g: -1 }); });
    const ag = r.querySelector("[data-again]"); if(ag) ag.addEventListener("click", () => ctx.act(c => {
      const words = pickWords(c.opts.packs, c.s.lg, c.opts.perso !== false ? myWords().concat(c.players.map(p => p.name)) : []);
      c.set(Object.assign(newDuoGame(words), { phase: "play", pa: c.s.pb, pb: c.s.pa, tw: "", n: 1, k: c.rid() }));
    }));
    const bk = r.querySelector("[data-back]"); if(bk) bk.addEventListener("click", () => ctx.act(c => {
      c.end({ title: c.s.win === "win" ? tr("Agents secrets (Duo) : mission réussie", "Secret Agents (Duo): mission accomplished") : tr("Agents secrets (Duo) : mission ratée", "Secret Agents (Duo): mission failed"), lines: [c.s.log], win: c.s.win === "win" ? c.ids.slice() : [] });
    }));
  });
}
})();
