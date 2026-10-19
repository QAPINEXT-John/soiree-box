/* Mots interdits — faire deviner un mot à son équipe sans dire les mots interdits. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, tr } = SB.u;

// [mot à faire deviner, [5 mots interdits]]
const CARDS = [
  ["Pizza",["Italie","Fromage","Four","Pâte","Tomate"]],["Plage",["Sable","Mer","Soleil","Serviette","Vacances"]],
  ["Vampire",["Sang","Dents","Nuit","Cercueil","Dracula"]],["Football",["Ballon","But","Équipe","Match","Pied"]],
  ["Téléphone",["Appeler","Écran","Portable","Sonner","Message"]],["Noël",["Sapin","Cadeau","Décembre","Père","Neige"]],
  ["Pompier",["Feu","Camion","Échelle","Sirène","Incendie"]],["Chocolat",["Cacao","Tablette","Sucré","Pâques","Brun"]],
  ["Avion",["Voler","Pilote","Aéroport","Ciel","Billet"]],["Dentiste",["Dent","Carie","Fauteuil","Brosse","Bouche"]],
  ["Cinéma",["Film","Écran","Pop-corn","Salle","Acteur"]],["Mariage",["Alliance","Robe","Époux","Église","Fête"]],
  ["Zombie",["Mort","Vivant","Cerveau","Manger","Apocalypse"]],["Café",["Tasse","Noir","Matin","Boire","Expresso"]],
  ["Licorne",["Corne","Cheval","Arc-en-ciel","Magique","Blanc"]],["Ascenseur",["Étage","Bouton","Monter","Descendre","Immeuble"]],
  ["Pirate",["Bateau","Trésor","Bandeau","Perroquet","Capitaine"]],["Hiver",["Froid","Neige","Saison","Décembre","Manteau"]],
  ["Anniversaire",["Gâteau","Bougie","Âge","Cadeau","Fête"]],["Banane",["Jaune","Fruit","Singe","Éplucher","Peau"]],
  ["Police",["Agent","Voleur","Sirène","Commissariat","Arrêter"]],["Guitare",["Cordes","Musique","Jouer","Instrument","Rock"]],
  ["Selfie",["Photo","Téléphone","Visage","Instagram","Prendre"]],["Fantôme",["Drap","Mort","Hanter","Blanc","Peur"]],
  ["Bibliothèque",["Livre","Lire","Silence","Emprunter","Étagère"]],["Hôpital",["Médecin","Malade","Infirmière","Urgences","Lit"]],
  ["Montagne",["Sommet","Ski","Neige","Haut","Alpes"]],["Karaoké",["Chanter","Micro","Paroles","Soirée","Faux"]],
  ["Abeille",["Miel","Piquer","Jaune","Ruche","Insecte"]],["Pyjama",["Dormir","Nuit","Lit","Vêtement","Soir"]],
  ["Tatouage",["Encre","Peau","Aiguille","Dessin","Bras"]],["Volcan",["Lave","Éruption","Feu","Montagne","Cratère"]],
  ["Wifi",["Internet","Code","Connexion","Réseau","Box"]],["Clown",["Cirque","Nez","Rouge","Rire","Maquillage"]],
  ["Bisou",["Lèvres","Embrasser","Joue","Amour","Bouche"]],["Réveil",["Matin","Sonner","Heure","Dormir","Lever"]],
  ["Sushi",["Japon","Poisson","Riz","Cru","Baguettes"]],["Requin",["Mer","Dents","Poisson","Dangereux","Aileron"]],
  ["Gâteau",["Anniversaire","Sucre","Four","Part","Crème"]],["Sorcière",["Balai","Chapeau","Magie","Potion","Halloween"]],
  ["Dinosaure",["Préhistoire","T-Rex","Disparu","Grand","Fossile"]],["Facteur",["Lettre","Courrier","Boîte","Poste","Colis"]],
  ["Parapluie",["Pluie","Ouvrir","Mouillé","Protéger","Météo"]],["Robot",["Machine","Métal","Intelligence","Futur","Programmer"]],
  ["Escargot",["Lent","Coquille","Bave","Bourgogne","Manger"]],["Astronaute",["Espace","Fusée","Lune","Combinaison","Planète"]],
  ["Frites",["Pomme de terre","Huile","Belgique","Ketchup","Frire"]],["Bébé",["Couche","Pleurer","Biberon","Petit","Naître"]],
  ["Télécommande",["Télé","Bouton","Chaîne","Zapper","Canapé"]],["Moustique",["Piquer","Été","Sang","Insecte","Bourdonner"]],
  ["Château",["Roi","Princesse","Tour","Fort","Moyen Âge"]],["Douche",["Eau","Laver","Salle de bain","Savon","Shampoing"]],
  ["Arc-en-ciel",["Couleurs","Pluie","Soleil","Ciel","Sept"]],["Chewing-gum",["Mâcher","Bulle","Coller","Menthe","Bouche"]],
  ["Paris",["Capitale","France","Tour Eiffel","Ville","Seine"]],["Lunettes",["Yeux","Voir","Verres","Nez","Myope"]],
  ["Poker",["Cartes","Jeu","Bluff","Jetons","Casino"]],["Ninja",["Japon","Noir","Discret","Sabre","Combat"]],
  ["Cauchemar",["Rêve","Nuit","Peur","Dormir","Réveiller"]],["Bowling",["Quilles","Boule","Strike","Piste","Lancer"]],
  ["Miroir",["Reflet","Glace","Voir","Visage","Salle de bain"]],["Barbe",["Poils","Menton","Homme","Raser","Visage"]],
  ["Tortue",["Lente","Carapace","Animal","Vieille","Ninja"]],["Influenceur",["Instagram","Abonnés","Réseaux","Placement","Vidéo"]],
  ["Camping",["Tente","Vacances","Dormir","Nature","Caravane"]],["Hamburger",["Pain","Steak","Fast-food","Fromage","Américain"]],
  ["Glace",["Froid","Cornet","Boule","Parfum","Été"]],["Pingouin",["Oiseau","Noir","Blanc","Banquise","Glisser"]],
  ["Halloween",["Citrouille","Bonbons","Déguisement","Octobre","Peur"]],["Marathon",["Courir","Kilomètres","Course","Sport","Long"]],
  ["Électricité",["Courant","Prise","Lumière","Câble","Ampoule"]],["Fusée",["Espace","Décoller","Lune","Astronaute","Moteur"]],
  ["Ordinateur",["Clavier","Écran","Souris","Internet","Travail"]],["Montgolfière",["Ballon","Air chaud","Voler","Panier","Ciel"]],
  ["Boulanger",["Pain","Baguette","Four","Croissant","Farine"]],["Igloo",["Glace","Inuit","Maison","Neige","Froid"]],
  ["Cactus",["Épines","Désert","Plante","Piquer","Arroser"]],["Pharaon",["Égypte","Pyramide","Roi","Momie","Tombeau"]],
  ["Trampoline",["Sauter","Rebondir","Toile","Jardin","Haut"]],["Sous-marin",["Mer","Plonger","Bateau","Périscope","Eau"]],
  ["Moustache",["Poils","Lèvre","Visage","Barbe","Homme"]],["Cerf-volant",["Vent","Ficelle","Voler","Plage","Ciel"]],
  ["Chaussette",["Pied","Paire","Laine","Trou","Chaussure"]],["Arbitre",["Sifflet","Match","Carton","Faute","Football"]],
  ["Magicien",["Tour","Chapeau","Lapin","Baguette","Magie"]],["Bougie",["Flamme","Cire","Allumer","Anniversaire","Lumière"]],
  ["Microbe",["Maladie","Petit","Virus","Microscope","Bactérie"]],["Cow-boy",["Cheval","Chapeau","Western","Lasso","Far West"]],
  ["Échecs",["Roi","Reine","Plateau","Pion","Mat"]],["Hérisson",["Piquants","Animal","Boule","Forêt","Épines"]],
  ["Plombier",["Fuite","Tuyau","Eau","Réparer","Robinet"]],["Tempête",["Vent","Pluie","Orage","Météo","Fort"]],
  ["Mouette",["Oiseau","Mer","Plage","Crier","Blanc"]],["Sapin",["Noël","Arbre","Vert","Aiguilles","Forêt"]],
  ["Chevalier",["Armure","Épée","Cheval","Moyen Âge","Roi"]],["Sieste",["Dormir","Après-midi","Canapé","Repos","Fatigue"]],
  ["Pâtes",["Italie","Spaghetti","Cuire","Sauce","Eau"]],["Sirène",["Poisson","Mer","Queue","Chanter","Femme"]],
  ["Tornade",["Vent","Tourner","Ouragan","Détruire","Météo"]],["Balançoire",["Jardin","Enfant","Pousser","Parc","Corde"]],
  ["Loup-garou",["Lune","Griffes","Transformer","Poils","Hurler"]],["Fromage",["Lait","Vache","Camembert","Trou","Odeur"]],
  ["Valise",["Voyage","Vêtements","Roulettes","Aéroport","Partir"]],["Thermomètre",["Température","Fièvre","Degré","Malade","Chaud"]],
  ["Escalier",["Marches","Monter","Descendre","Étage","Rampe"]],["Dragon",["Feu","Cracher","Ailes","Château","Princesse"]],
  ["Coiffeur",["Cheveux","Couper","Ciseaux","Salon","Brushing"]],["Pique-nique",["Herbe","Panier","Manger","Nappe","Dehors"]],
  ["Taupe",["Trou","Terre","Aveugle","Jardin","Creuser"]],["Boomerang",["Revenir","Lancer","Australie","Bois","Courbe"]],
  ["Squelette",["Os","Mort","Halloween","Crâne","Corps"]],["Sablier",["Temps","Sable","Retourner","Couler","Verre"]],
  ["Grenouille",["Sauter","Vert","Mare","Prince","Coasser"]],["Fondue",["Fromage","Savoie","Piquer","Pain","Caquelon"]],
  ["Feu d'artifice",["Exploser","Ciel","Couleurs","Juillet","Fusée"]],["Kangourou",["Australie","Sauter","Poche","Bébé","Animal"]]
];
// Cartes hard : sexe, fête et humour noir (option 18+)
const HARD_CARDS = [
  ["Préservatif",["Capote","Protection","Sexe","Latex","Pharmacie"]],["Strip-tease",["Déshabiller","Danse","Barre","Vêtements","Lentement"]],
  ["Menottes",["Police","Poignets","Attacher","Clé","Métal"]],["Sex toy",["Vibrer","Plaisir","Jouet","Piles","Coquin"]],
  ["Kamasutra",["Positions","Inde","Livre","Sexe","Amour"]],["Lingerie",["Dentelle","Sous-vêtements","Soutien-gorge","Sexy","Culotte"]],
  ["Gueule de bois",["Alcool","Lendemain","Mal de tête","Soirée","Vomir"]],["Plan cul",["Sexe","Sans lendemain","Appli","Coucher","Relation"]],
  ["Nudes",["Photo","Nu","Envoyer","Téléphone","Snap"]],["Fessée",["Taper","Fesses","Main","Punir","Coquin"]],
  ["Tinder",["Appli","Rencontre","Swipe","Match","Droite"]],["Club libertin",["Échangiste","Couple","Soirée","Sexe","Masque"]],
  ["Gigolo",["Payer","Homme","Escort","Riche","Femme"]],["Orgasme",["Plaisir","Jouir","Septième ciel","Sexe","Crier"]],
  ["Suçon",["Cou","Bisou","Marque","Aspirer","Rouge"]],["Préliminaires",["Avant","Caresses","Sexe","Bisous","Chauffer"]],
  ["Walk of shame",["Matin","Retour","Honte","Soirée","Vêtements"]],["Lubrifiant",["Glisser","Gel","Sexe","Tube","Huile"]],
  ["Pole dance",["Barre","Danser","Strip","Sport","Club"]],["Cocu",["Tromper","Cornes","Mari","Infidèle","Couple"]],
  ["Testament",["Mort","Héritage","Notaire","Volonté","Papier"]],["Cercueil",["Mort","Bois","Enterrement","Boîte","Cimetière"]],
  ["Croque-mort",["Pompes funèbres","Cadavre","Enterrement","Métier","Cercueil"]],["Cimetière",["Tombe","Mort","Enterrement","Croix","Fleurs"]],
  ["Porno",["Film","Sexe","Acteur","Site","X"]],["Sextape",["Vidéo","Filmer","Sexe","Célébrité","Fuite"]],
  ["Jacuzzi",["Bulles","Eau","Chaud","Bain","Spa"]],["Body shot",["Boire","Corps","Sel","Citron","Tequila"]],
  ["Sugar daddy",["Riche","Vieux","Cadeaux","Payer","Jeune"]],["Infidélité",["Tromper","Couple","Amant","Mensonge","Cocu"]],
  ["Strip-poker",["Cartes","Déshabiller","Perdre","Vêtements","Jeu"]],["Nuisette",["Dentelle","Nuit","Soie","Lingerie","Sexy"]],
  ["Speed dating",["Rencontre","Minutes","Table","Célibataire","Rapide"]],["Ivresse",["Alcool","Soûl","Boire","Tituber","Vin"]],
  ["Shooter",["Verre","Petit","Cul sec","Alcool","Tequila"]],["Massage",["Huile","Mains","Dos","Détente","Masser"]],
  ["Corbillard",["Voiture","Mort","Cercueil","Enterrement","Noir"]],["Épitaphe",["Tombe","Inscription","Mort","Pierre","Phrase"]],
  ["Fossoyeur",["Creuser","Tombe","Cimetière","Pelle","Mort"]],["Rupture",["Couple","Quitter","Larmes","Ex","Séparer"]],
  ["Coup d'un soir",["Nuit","Lendemain","Inconnu","Coucher","Une fois"]]
];
// English deck: [word to guess, [5 forbidden words]]
const CARDS_EN = [
  ["Pizza",["Italy","Cheese","Slice","Dough","Pepperoni"]],["Beach",["Sand","Sea","Sun","Towel","Waves"]],
  ["Vampire",["Blood","Fangs","Night","Coffin","Dracula"]],["Soccer",["Ball","Goal","Team","Kick","World Cup"]],
  ["Phone",["Call","Screen","Mobile","Ring","Text"]],["Christmas",["Tree","Presents","December","Santa","Snow"]],
  ["Firefighter",["Fire","Truck","Ladder","Siren","Hose"]],["Chocolate",["Cocoa","Bar","Sweet","Easter","Brown"]],
  ["Airplane",["Fly","Pilot","Airport","Sky","Wings"]],["Dentist",["Teeth","Cavity","Chair","Drill","Mouth"]],
  ["Cinema",["Movie","Screen","Popcorn","Theater","Actor"]],["Wedding",["Ring","Dress","Bride","Groom","Married"]],
  ["Zombie",["Dead","Undead","Brains","Walking","Apocalypse"]],["Coffee",["Cup","Black","Morning","Caffeine","Espresso"]],
  ["Unicorn",["Horn","Horse","Rainbow","Magic","White"]],["Elevator",["Floor","Button","Up","Down","Building"]],
  ["Pirate",["Ship","Treasure","Eye patch","Parrot","Captain"]],["Winter",["Cold","Snow","Season","December","Coat"]],
  ["Birthday",["Cake","Candles","Age","Presents","Party"]],["Banana",["Yellow","Fruit","Monkey","Peel","Split"]],
  ["Police",["Cop","Thief","Siren","Arrest","Station"]],["Guitar",["Strings","Music","Play","Instrument","Rock"]],
  ["Selfie",["Photo","Phone","Face","Instagram","Camera"]],["Ghost",["Sheet","Dead","Haunt","Boo","Scary"]],
  ["Library",["Books","Read","Quiet","Borrow","Shelves"]],["Hospital",["Doctor","Sick","Nurse","Emergency","Bed"]],
  ["Mountain",["Peak","Ski","Snow","High","Climb"]],["Karaoke",["Sing","Microphone","Lyrics","Song","Off-key"]],
  ["Bee",["Honey","Sting","Yellow","Hive","Buzz"]],["Pajamas",["Sleep","Night","Bed","Clothes","Comfy"]],
  ["Tattoo",["Ink","Skin","Needle","Drawing","Arm"]],["Volcano",["Lava","Erupt","Fire","Mountain","Crater"]],
  ["Wi-Fi",["Internet","Password","Connection","Network","Router"]],["Clown",["Circus","Nose","Red","Funny","Makeup"]],
  ["Kiss",["Lips","Mouth","Cheek","Love","Smooch"]],["Alarm clock",["Morning","Ring","Time","Wake up","Snooze"]],
  ["Sushi",["Japan","Fish","Rice","Raw","Chopsticks"]],["Shark",["Sea","Teeth","Fish","Jaws","Fin"]],
  ["Cake",["Birthday","Sugar","Oven","Slice","Frosting"]],["Witch",["Broom","Hat","Magic","Potion","Halloween"]],
  ["Dinosaur",["Prehistoric","T-Rex","Extinct","Big","Fossil"]],["Mail carrier",["Letter","Mail","Mailbox","Post office","Package"]],
  ["Umbrella",["Rain","Open","Wet","Weather","Protect"]],["Robot",["Machine","Metal","Artificial","Future","Program"]],
  ["Snail",["Slow","Shell","Slime","French","Garden"]],["Astronaut",["Space","Rocket","Moon","Suit","NASA"]],
  ["French fries",["Potato","Oil","Ketchup","Fried","McDonald's"]],["Baby",["Diaper","Cry","Bottle","Small","Born"]],
  ["Remote control",["TV","Button","Channel","Couch","Batteries"]],["Mosquito",["Bite","Summer","Blood","Insect","Itch"]],
  ["Castle",["King","Princess","Tower","Fort","Medieval"]],["Shower",["Water","Wash","Bathroom","Soap","Shampoo"]],
  ["Rainbow",["Colors","Rain","Sun","Sky","Seven"]],["Chewing gum",["Chew","Bubble","Sticky","Mint","Mouth"]],
  ["New York",["City","Big Apple","Statue of Liberty","Manhattan","America"]],["Glasses",["Eyes","See","Lenses","Nose","Frames"]],
  ["Poker",["Cards","Game","Bluff","Chips","Casino"]],["Ninja",["Japan","Black","Stealth","Sword","Fight"]],
  ["Nightmare",["Dream","Night","Scary","Sleep","Wake up"]],["Bowling",["Pins","Ball","Strike","Lane","Shoes"]],
  ["Mirror",["Reflection","Glass","See","Face","Bathroom"]],["Beard",["Hair","Chin","Man","Shave","Face"]],
  ["Turtle",["Slow","Shell","Animal","Old","Ninja"]],["Influencer",["Instagram","Followers","Social media","Sponsored","Video"]],
  ["Camping",["Tent","Vacation","Sleep","Nature","Campfire"]],["Hamburger",["Bun","Patty","Fast food","Cheese","McDonald's"]],
  ["Ice cream",["Cold","Cone","Scoop","Flavor","Summer"]],["Penguin",["Bird","Black","White","Ice","Antarctica"]],
  ["Halloween",["Pumpkin","Candy","Costume","October","Trick or treat"]],["Marathon",["Run","Miles","Race","Sport","Long"]],
  ["Electricity",["Current","Outlet","Light","Cable","Power"]],["Rocket",["Space","Launch","Moon","Astronaut","Engine"]],
  ["Computer",["Keyboard","Screen","Mouse","Internet","Laptop"]],["Hot-air balloon",["Balloon","Hot air","Fly","Basket","Sky"]],
  ["Baker",["Bread","Bakery","Oven","Croissant","Flour"]],["Igloo",["Ice","Inuit","House","Snow","Cold"]],
  ["Cactus",["Spines","Desert","Plant","Prickly","Water"]],["Pharaoh",["Egypt","Pyramid","King","Mummy","Tomb"]],
  ["Trampoline",["Jump","Bounce","Backyard","High","Spring"]],["Submarine",["Sea","Dive","Boat","Periscope","Underwater"]],
  ["Mustache",["Hair","Lip","Face","Beard","Man"]],["Kite",["Wind","String","Fly","Beach","Sky"]],
  ["Sock",["Foot","Pair","Wool","Hole","Shoe"]],["Referee",["Whistle","Game","Card","Foul","Soccer"]],
  ["Magician",["Trick","Hat","Rabbit","Wand","Magic"]],["Candle",["Flame","Wax","Light","Birthday","Wick"]],
  ["Germ",["Sick","Tiny","Virus","Microscope","Bacteria"]],["Cowboy",["Horse","Hat","Western","Lasso","Wild West"]],
  ["Chess",["King","Queen","Board","Pawn","Checkmate"]],["Hedgehog",["Spikes","Animal","Ball","Forest","Sonic"]],
  ["Plumber",["Leak","Pipe","Water","Fix","Mario"]],["Storm",["Wind","Rain","Thunder","Weather","Lightning"]],
  ["Seagull",["Bird","Sea","Beach","Squawk","Fries"]],["Pine tree",["Christmas","Tree","Green","Needles","Forest"]],
  ["Knight",["Armor","Sword","Horse","Medieval","King"]],["Nap",["Sleep","Afternoon","Couch","Rest","Tired"]],
  ["Pasta",["Italy","Spaghetti","Boil","Sauce","Noodles"]],["Mermaid",["Fish","Sea","Tail","Ariel","Woman"]],
  ["Tornado",["Wind","Spin","Hurricane","Destroy","Twister"]],["Swing",["Playground","Kid","Push","Park","Chains"]],
  ["Werewolf",["Moon","Claws","Transform","Fur","Howl"]],["Cheese",["Milk","Cow","Cheddar","Holes","Mouse"]],
  ["Suitcase",["Travel","Clothes","Wheels","Airport","Pack"]],["Thermometer",["Temperature","Fever","Degrees","Sick","Hot"]],
  ["Stairs",["Steps","Up","Down","Floor","Railing"]],["Dragon",["Fire","Breathe","Wings","Castle","Princess"]],
  ["Hairdresser",["Hair","Cut","Scissors","Salon","Blow-dry"]],["Picnic",["Grass","Basket","Eat","Blanket","Outside"]],
  ["Mole",["Hole","Dirt","Blind","Garden","Dig"]],["Boomerang",["Return","Throw","Australia","Wood","Come back"]],
  ["Skeleton",["Bones","Dead","Halloween","Skull","Body"]],["Hourglass",["Time","Sand","Flip","Glass","Timer"]],
  ["Frog",["Jump","Green","Pond","Prince","Ribbit"]],["Fondue",["Cheese","Swiss","Dip","Bread","Pot"]],
  ["Fireworks",["Explode","Sky","Colors","Fourth of July","New Year"]],["Kangaroo",["Australia","Jump","Pouch","Joey","Animal"]]
];
// English hard cards: sex, partying and dark humor (18+ option)
const HARD_CARDS_EN = [
  ["Condom",["Rubber","Protection","Sex","Latex","Pharmacy"]],["Striptease",["Undress","Dance","Pole","Clothes","Slowly"]],
  ["Handcuffs",["Police","Wrists","Tie up","Key","Metal"]],["Sex toy",["Vibrate","Pleasure","Toy","Batteries","Naughty"]],
  ["Kama Sutra",["Positions","India","Book","Sex","Love"]],["Lingerie",["Lace","Underwear","Bra","Sexy","Panties"]],
  ["Hangover",["Alcohol","Morning","Headache","Party","Puke"]],["Booty call",["Sex","Late night","Text","Phone","Casual"]],
  ["Nudes",["Photo","Naked","Send","Phone","Snapchat"]],["Spanking",["Slap","Butt","Hand","Punish","Naughty"]],
  ["Tinder",["App","Dating","Swipe","Match","Right"]],["Swingers club",["Swap","Couples","Party","Sex","Mask"]],
  ["Gigolo",["Pay","Man","Escort","Rich","Woman"]],["Orgasm",["Pleasure","Climax","Come","Sex","Scream"]],
  ["Hickey",["Neck","Kiss","Mark","Suck","Bruise"]],["Foreplay",["Before","Caress","Sex","Kissing","Warm up"]],
  ["Walk of shame",["Morning","Home","Shame","Party","Last night's clothes"]],["Lube",["Slippery","Gel","Sex","Bottle","Wet"]],
  ["Pole dancing",["Pole","Dance","Strip","Workout","Club"]],["Side piece",["Cheat","Mistress","Secret","Lover","Affair"]],
  ["Last will",["Death","Inheritance","Lawyer","Testament","Estate"]],["Coffin",["Dead","Wood","Funeral","Box","Cemetery"]],
  ["Undertaker",["Funeral home","Corpse","Funeral","Job","Coffin"]],["Cemetery",["Grave","Dead","Funeral","Tombstone","Flowers"]],
  ["Porn",["Movie","Sex","Actor","Website","XXX"]],["Sex tape",["Video","Film","Sex","Celebrity","Leak"]],
  ["Hot tub",["Bubbles","Water","Hot","Bath","Jacuzzi"]],["Body shot",["Drink","Body","Salt","Lime","Tequila"]],
  ["Sugar daddy",["Rich","Old","Gifts","Pay","Young"]],["Infidelity",["Cheat","Couple","Lover","Lie","Affair"]],
  ["Strip poker",["Cards","Undress","Lose","Clothes","Game"]],["Negligee",["Lace","Night","Silk","Lingerie","Sexy"]],
  ["Speed dating",["Meet","Minutes","Table","Single","Fast"]],["Drunk",["Alcohol","Wasted","Drink","Stumble","Wine"]],
  ["Shot",["Glass","Small","Down it","Alcohol","Tequila"]],["Massage",["Oil","Hands","Back","Relax","Rub"]],
  ["Hearse",["Car","Dead","Coffin","Funeral","Black"]],["Epitaph",["Grave","Inscription","Dead","Stone","Words"]],
  ["Gravedigger",["Dig","Grave","Cemetery","Shovel","Dead"]],["Breakup",["Couple","Dump","Tears","Ex","Split"]],
  ["One-night stand",["Night","Morning after","Stranger","Sleep with","Once"]]
];
// Contenu par langue : en réseau, c'est la langue de l'hôte (s.lg) qui compte.
const DECK = { fr: { base: CARDS, hard: HARD_CARDS }, en: { base: CARDS_EN, hard: HARD_CARDS_EN } };
const deckOf = lg => DECK[lg === "en" ? "en" : "fr"];
const BYW = { fr: {}, en: {} };
["fr", "en"].forEach(l => DECK[l].base.concat(DECK[l].hard).forEach(c => { BYW[l][c[0]] = c; }));
// Paquet de mots : ceux jamais vus sur ce téléphone sortent en premier.
function newDeck(hard, lg){ const d = deckOf(lg); return SB.u.fresh("motsint:cards", (hard ? d.base.concat(d.hard) : d.base).map(c => c[0])); }
function cardOf(w, lg){ const l = lg === "en" ? "en" : "fr"; return BYW[l][w] || DECK[l].base[0]; }
let lastLeft = 99;
const TEAMS = [{ n: tr("Équipe Rouge", "Red Team"), c: "#d23b3b" }, { n: tr("Équipe Bleue", "Blue Team"), c: "#2f6fd6" }];

/* ---------- Coups de théâtre : un tour sur trois environ ---------- */
const TWISTS = [
  { id: "eclair", name: tr("Manche éclair", "Lightning round"), desc: tr("Chrono divisé par deux, mais chaque mot trouvé vaut 2 points.", "Half the time, but every word you get is worth 2 points.") },
  { id: "double", name: tr("Points doublés", "Double points"), desc: tr("Mot trouvé : +2. Mot interdit : −2.", "Word guessed: +2. Forbidden word: −2.") },
  { id: "mime", name: "Mime", desc: tr("Interdit de parler : on mime. Mot trouvé : +2. Au moindre mot prononcé, buzz !", "No talking: act it out. Word guessed: +2. Say a single word and you get buzzed!") },
  { id: "sanspasse", name: tr("Sans filet", "No safety net"), desc: tr("Impossible de passer une carte pendant ce tour.", "No passing cards this turn.") },
  { id: "passe", name: tr("Passe payante", "Pay to pass"), desc: tr("Chaque carte passée coûte 1 point.", "Every card you pass costs 1 point.") },
  { id: "or", name: tr("Mot en or", "Golden word"), desc: tr("Le premier mot trouvé du tour vaut 3 points.", "The first word guessed this turn is worth 3 points.") },
  { id: "rebond", name: tr("Rebond", "Rebound"), desc: tr("Mot interdit : pas de malus, mais 1 point pour l'équipe adverse.", "Forbidden word: no penalty, but the other team gets 1 point.") },
  { id: "temps", name: tr("Prolongations", "Overtime"), desc: tr("Chaque mot trouvé ajoute 5 secondes au chrono.", "Every word guessed adds 5 seconds to the clock.") },
  { id: "unmot", name: tr("Un mot à la fois", "One word at a time"), desc: tr("Un seul mot par indice. Une phrase se buzze comme un mot interdit.", "One word per clue. A full sentence gets buzzed like a forbidden word.") }
];
const TW = id => SB.u.byTwist(TWISTS, id);
function rollTwist(on, last){ const t = on ? SB.u.twist(TWISTS, { rate: .38, last }) : null; return t ? t.id : ""; }
function turnMs(dur, tw){ return Math.round(dur * (tw === "eclair" ? .5 : 1)) * 1000; }
// Effet d'une action : [points pour l'équipe qui joue, points pour l'adversaire, ms ajoutées au chrono]
function effect(act, tw, found){
  if(act === "f") return [tw === "eclair" || tw === "double" || tw === "mime" ? 2 : tw === "or" && !found ? 3 : 1, 0, tw === "temps" ? 5000 : 0];
  if(act === "b") return tw === "rebond" ? [0, 1, 0] : [tw === "double" ? -2 : -1, 0, 0];
  if(act === "p") return [tw === "passe" ? -1 : 0, 0, 0];
  return [0, 0, 0];
}
function fx(e){ return e[1] ? "+1 adverse" : (e[0] > 0 ? "+" : e[0] < 0 ? "−" : "") + Math.abs(e[0]); }
function scoreHTML(score, tt){
  return '<div class="score2">' + TEAMS.map((t, i) => '<div class="' + (i === tt ? "on" : "") + '"><span style="color:' + t.c + '">' + esc(t.n) + "</span><b>" + (A(score)[i] || 0) + "</b></div>").join("") + "</div>";
}
function cardHTML(c){ return '<div class="taboo"><div class="w">' + esc(c.w) + "</div><ul>" + A(c.t).map(x => "<li>" + esc(x) + "</li>").join("") + "</ul></div>"; }
function logHTML(log){
  const l = A(log).map(A);
  if(!l.length) return '<p class="sm">' + tr("Aucune carte jouée.", "No cards played.") + "</p>";
  // x[2] vient de fx() (stocké dans l'état) : « +1 adverse » est traduit à l'affichage.
  return '<ul class="list">' + l.map(x => '<li><span class="t" style="font-size:24px">' + esc(x[0]) + '</span><span class="by">' + (x[1] === "f" ? tr("Trouvé", "Got it") : x[1] === "b" ? tr("Mot interdit", "Forbidden word") : tr("Passé", "Passed")) + (x[2] && x[2] !== "0" ? " · " + esc(x[2] === "+1 adverse" ? tr("+1 adverse", "+1 other team") : x[2]) : x[1] === "f" ? " · +1" : x[1] === "b" ? " · −1" : "") + "</span></li>").join("") + "</ul>";
}
const miniTwist = tw => { const t = TW(tw); return t ? SB.u.twistHTML({ name: t.name }) : ""; };
function turnSum(log){ const l = A(log).map(A); return [l.filter(x => x[1] === "f").length, l.filter(x => x[1] === "b").length, l.filter(x => x[1] === "p").length]; }

/* ---------- Trophées : tl = [[qui, équipe, trouvés, buzz, passes]] ---------- */
function vary(list, seed){ return list[Math.abs(seed) % list.length]; }
function awards(tl, name, who){
  who = who || name;
  const t = A(tl).map(A), out = [], seed = t.reduce((a, x) => a + (+x[2] || 0) * 3 + (+x[3] || 0), 0);
  const best = t.slice().sort((a, b) => b[2] - a[2])[0];
  if(best && best[2] > 0) out.push([vary(tr(["Langue bien pendue", "Moulin à paroles", "Pro de l'indice", "Orateur de génie"], ["Silver tongue", "Chatterbox", "Clue master", "Born orator"]), seed), name(best), SB.u.plural2(best[2], "mot", null, "word") + tr(" en un tour", " in one turn")]);
  const agg = {}; t.forEach(x => { const k = who(x); agg[k] = agg[k] || [0, 0]; agg[k][0] += +x[3] || 0; agg[k][1] += +x[4] || 0; });
  const bz = Object.keys(agg).sort((a, b) => agg[b][0] - agg[a][0])[0];
  if(bz && agg[bz][0] > 0) out.push([vary(tr(["Langue qui fourche", "Gaffeur en chef", "Abonné au buzz", "Lapsus ambulant"], ["Slip of the tongue", "Chief blunderer", "Buzz magnet", "Walking blooper"]), seed + 1), bz, SB.u.plural2(agg[bz][0], "mot interdit", "mots interdits", "forbidden word")]);
  const ps = Object.keys(agg).sort((a, b) => agg[b][1] - agg[a][1])[0];
  if(ps && agg[ps][1] >= 2) out.push([vary(tr(["Passeur compulsif", "Zappeur fou", "Joker permanent", "Esquive olympique"], ["Compulsive passer", "Channel surfer", "Permanent joker", "Olympic dodger"]), seed + 2), ps, SB.u.plural2(agg[ps][1], "carte passée", "cartes passées", "card passed", "cards passed")]);
  return out;
}
function awardsHTML(a){ return a.length ? '<div class="field"><span class="eyebrow">' + tr("Trophées", "Awards") + '</span><ul class="list">' + a.map(x => '<li><span class="t" style="font-size:19px">' + esc(x[0]) + '</span><span class="by">' + esc(x[1]) + " · " + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : ""; }

SB.register({
  id: "motsint", name: tr("Mots interdits", "Forbidden Words"), glyph: tr("Chut", "Shh"), pitch: tr("Fais deviner un mot sans dire les mots interdits.", "Get your team to guess a word without saying the forbidden ones."), ticks: true, hot: true,
  accent: { light: "#c49bff", dark: "#c49bff" },
  tag: tr("Fais deviner un mot à ton équipe sans dire les mots interdits. Chrono en main.", "Get your team to guess a word without saying the forbidden words. Against the clock."),
  min: 4, max: 20,
  rules: [
    tr("Deux équipes. À chaque tour, un joueur fait deviner un maximum de mots à son équipe avant la fin du chrono.", "Two teams. Each turn, one player gets their team to guess as many words as possible before time runs out."),
    tr("Interdit de dire le mot lui-même, un mot de la même famille ou l'un des 5 mots interdits de la carte.", "You can't say the word itself, any form of it, or any of the 5 forbidden words on the card."),
    tr("L'équipe adverse voit la carte et appuie sur « Buzz » si un mot interdit est prononcé : −1 point.", "The other team sees the card and hits “Buzz” if a forbidden word is said: −1 point."),
    tr("Mot trouvé : +1. On peut passer une carte sans pénalité.", "Word guessed: +1. You can pass a card with no penalty."),
    tr("Coups de théâtre : un tour sur trois environ, la règle change (manche éclair, mime, mot en or, sans filet…).", "Plot twists: about one turn in three, a rule changes (lightning round, mime, golden word, no safety net…)."),
    tr("Les cartes déjà jouées sur ce téléphone reviennent en dernier.", "Cards already played on this phone come back last.")
  ],
  options: [
    { id: "dur", label: tr("Durée d'un tour", "Turn length"), type: "seg", def: 60, values: [{ v: 45, label: "45 s" }, { v: 60, label: "60 s" }, { v: 90, label: "90 s" }] },
    { id: "turns", label: tr("Tours par équipe", "Turns per team"), type: "seg", def: 3, values: [{ v: 2, label: "2" }, { v: 3, label: "3" }, { v: 4, label: "4" }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Un tour sur trois environ, la règle change", "About one turn in three, a rule changes"), def: true },
    { id: "hard", label: tr("Cartes", "Cards"), type: "toggle", text: tr("Ajouter le contenu 18+", "Add 18+ content"), desc: tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult content"), hot: true, def: false }
  ],
  start(ctx, o){
    const ids = shuffle(ctx.ids), teams = [[], []];
    ids.forEach((id, i) => teams[i % 2].push(id));
    ctx.setPriv({ deck: newDeck(o.hard, SB.lang()) });
    return { phase: "ready", lg: SB.lang(), teams, score: [0, 0], tt: 0, sp: [0, 0], turnNo: 0, turns: o.turns || 3, dur: o.dur || 60, card: null, endAt: 0, log: [], seen: {}, tw: "", tl: [] };
  },
  host(ctx){
    const s = ctx.s, teams = A(s.teams).map(A);
    const speaker = currentSpeaker(ctx);
    if(s.phase === "ready"){
      const i = ctx.input(speaker);
      if(i && i.go) ctx.set({ phase: "play", endAt: ctx.now() + turnMs(s.dur, s.tw), card: draw(ctx), log: [], seen: {} });
    } else if(s.phase === "play"){
      if(ctx.now() >= s.endAt){ const ts = turnSum(s.log); ctx.set({ phase: "turnEnd", tl: A(s.tl).concat([[speaker, s.tt].concat(ts)]) }); return; }
      const card = s.card || {}, seen = Object.assign({}, s.seen || {}), opp = teams[1 - s.tt] || [];
      for(const id of ctx.ids){
        const i = ctx.input(id);
        if(!i || i.c !== card.id || !(i.n > (seen[id] || 0))) continue;
        seen[id] = i.n;
        let act = "";
        if(id === speaker && (i.a === "f" || (i.a === "p" && s.tw !== "sanspasse"))) act = i.a;
        else if(opp.indexOf(id) >= 0 && i.a === "b") act = "b";
        if(!act){ ctx.set({ seen }); continue; }
        const e = effect(act, s.tw, turnSum(s.log)[0]), score = A(s.score).slice();
        score[s.tt] = (score[s.tt] || 0) + e[0]; score[1 - s.tt] = (score[1 - s.tt] || 0) + e[1];
        ctx.set({ seen, score, endAt: s.endAt + e[2], log: A(s.log).concat([[card.w, act, fx(e)]]), card: draw(ctx) });
        return;
      }
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, teams = A(s.teams).map(A);
    const myTeam = teams[0].indexOf(me) >= 0 ? 0 : teams[1].indexOf(me) >= 0 ? 1 : -1;
    const speaker = currentSpeaker(ctx), isSp = speaker === me, opp = myTeam === 1 - s.tt;
    const lab = '<span class="eyebrow">' + tr("Tour ", "Turn ") + (s.turnNo + 1) + " / " + s.turns * 2 + " · " + esc(TEAMS[s.tt].n) + "</span>";
    const secs = Math.round(turnMs(s.dur, s.tw) / 1000), spName = esc(ctx.name(speaker));
    if(s.phase === "ready"){
      screen(root, "rd" + s.k + "|" + speaker + isSp, lab + SB.u.twistHTML(TW(s.tw)) + scoreHTML(s.score, s.tt) +
        '<div class="pass"><span class="eyebrow">' + (isSp ? tr("C'est toi qui fais deviner", "You're giving the clues") : myTeam === s.tt ? tr("Ton équipe joue", "Your team is up") : tr("Vous surveillez", "You're on watch")) + '</span><div class="who">' + esc(ctx.name(speaker)) + "</div><p>" +
        (isSp ? tr("Prends ton téléphone, fais deviner un maximum de mots à ton équipe. " + secs + " secondes.", "Grab your phone and get your team to guess as many words as you can. " + secs + " seconds.") : myTeam === s.tt ? tr("Écoute " + spName + " et crie tes réponses.", "Listen to " + spName + " and shout your answers.") : tr("Tu verras la carte : buzze si " + spName + (s.tw === "mime" ? " parle." : s.tw === "unmot" ? " dit un mot interdit ou fait une phrase." : " dit un mot interdit."), "You'll see the card: buzz if " + spName + (s.tw === "mime" ? " talks." : s.tw === "unmot" ? " says a forbidden word or a full sentence." : " says a forbidden word."))) + "</p></div>" +
        '<details><summary>' + tr("Les équipes", "Teams") + '</summary><ul>' + teams.map((t, i) => "<li><b>" + esc(TEAMS[i].n) + "</b>" + tr(" : ", ": ") + esc(t.map(ctx.name).join(", ")) + "</li>").join("") + "</ul></details>" +
        SB.u.dock(isSp ? '<button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button>" : '<p class="wait">' + tr("On attend que " + spName + " lance le chrono…", "Waiting for " + spName + " to start the clock…") + "</p>"), r => {
        const b = r.querySelector("[data-go]"); if(b) b.addEventListener("click", () => { b.disabled = true; ctx.send({ go: 1 }); });
      });
    } else if(s.phase === "play"){
      const card = s.card || { id: "", w: "", t: [] };
      const role = isSp ? "sp" : opp ? "op" : "tm";
      screen(root, "pl" + s.k + "|" + card.id + "|" + role, lab + miniTwist(s.tw) + scoreHTML(s.score, s.tt) + '<div class="timer" data-t></div>' +
        (role === "tm" ? '<div class="pass" style="min-height:24vh"><span class="eyebrow">' + tr("Devinez !", "Guess!") + '</span><div class="who">' + esc(ctx.name(speaker)) + (s.tw === "mime" ? tr(" mime", " is miming") : tr(" fait deviner", " is giving clues")) + '</div><p data-found></p></div>' : cardHTML(card)) +
        SB.u.dock((role === "sp" ? '<div class="row"><button class="btn ghost" type="button" data-a="p"' + (s.tw === "sanspasse" ? " disabled" : "") + ">" + (s.tw === "sanspasse" ? tr("Pas de passe", "No passing") : s.tw === "passe" ? tr("Passer (−1)", "Pass (−1)") : tr("Passer", "Pass")) + '</button><button class="btn ok" type="button" data-a="f">' + tr("Trouvé !", "Got it!") + "</button></div>" : "") +
        (role === "op" ? '<button class="btn bad big-tap" type="button" data-a="b">' + tr("Buzz ! ", "Buzz! ") + (s.tw === "mime" ? tr("Il a parlé", "They talked") : tr("Mot interdit", "Forbidden word")) + "</button>" : "")), r => {
        r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => {
          r.querySelectorAll("[data-a]").forEach(x => { x.disabled = true; });
          ctx.send({ c: card.id, a: b.dataset.a, n: Date.now() });
        }));
      });
      const left = Math.max(0, Math.ceil((s.endAt - ctx.now()) / 1000));
      const t = txt(root, "[data-t]", left); if(t) t.classList.toggle("low", left <= 10);
      if(left !== lastLeft){ if(left <= 5 && left > 0 && lastLeft > left) SB.u.buzz(left === 1 ? 60 : 15); lastLeft = left; }
      const nf = A(s.log).filter(x => A(x)[1] === "f").length;
      txt(root, "[data-found]", tr(nf + " mot(s) trouvé(s)", nf + (nf === 1 ? " word guessed" : " words guessed")));
    } else if(s.phase === "turnEnd"){
      const last = s.turnNo + 1 >= s.turns * 2;
      if(root.dataset.key && root.dataset.key.slice(0, 2) === "pl") SB.u.buzz([80, 60, 80]);
      screen(root, "te" + s.k + ctx.isHost, lab + '<div class="verdict">' + tr("Temps écoulé", "Time's up") + '</div>' + scoreHTML(s.score, s.tt) + '<div class="field"><span class="eyebrow">' + tr("Ce tour", "This turn") + "</span>" + logHTML(s.log) + "</div>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le résultat", "See the result") : tr("Équipe suivante", "Next team")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à l'équipe suivante…", "The host is moving on to the next team…") + "</p>"), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "turnEnd") return;
          if(st.turnNo + 1 >= st.turns * 2){ c.set({ phase: "end" }); return; }
          const sp = A(st.sp).slice(); sp[st.tt] = (sp[st.tt] || 0) + 1;
          c.set({ phase: "ready", tt: 1 - st.tt, sp, turnNo: st.turnNo + 1, card: null, log: [], seen: {}, tw: rollTwist(c.opts.twists !== false, st.tw), k: c.rid() });
        }));
      });
    } else if(s.phase === "end"){
      const sc = A(s.score), win = sc[0] === sc[1] ? -1 : sc[0] > sc[1] ? 0 : 1;
      screen(root, "end" + ctx.isHost, '<span class="eyebrow">' + tr("Résultat", "Result") + '</span><div class="verdict">' + (win < 0 ? tr("Égalité !", "It's a tie!") : esc(TEAMS[win].n) + tr(" gagne", " wins")) + "</div>" + scoreHTML(sc, win < 0 ? -1 : win) +
        awardsHTML(awards(s.tl, x => ctx.name(x[0]))) +
        '<details open><summary>' + tr("Les équipes", "Teams") + '</summary><ul>' + teams.map((t, i) => "<li><b>" + esc(TEAMS[i].n) + "</b>" + tr(" : ", ": ") + esc(t.map(ctx.name).join(", ")) + "</li>").join("") + "</ul></details>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const s2 = A(c.s.score), w = s2[0] === s2[1] ? -1 : s2[0] > s2[1] ? 0 : 1, tm = A(c.s.teams).map(A);
          c.end({ title: w < 0 ? tr("Égalité " + s2[0] + " à " + s2[1], "Tie, " + s2[0] + " to " + s2[1]) : tr(TEAMS[w].n + " gagne " + s2[w] + " à " + s2[1 - w], TEAMS[w].n + " wins " + s2[w] + " to " + s2[1 - w]),
            lines: tm.map((t, i) => TEAMS[i].n + tr(" : ", ": ") + t.map(c.name).join(", ")).concat(awards(c.s.tl, x => c.name(x[0])).map(a => a[0] + tr(" : ", ": ") + a[1])), win: w < 0 ? [] : tm[w] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    start(root, api){
      const st = store();
      let L = { phase: "setup", hard: !!st.miHard, twOn: st.miTw !== false, dur: [45, 60, 90].indexOf(st.miDur) >= 0 ? st.miDur : 60, turns: [2, 3, 4].indexOf(st.miTurns) >= 0 ? st.miTurns : 3, score: [0, 0], tt: 0, turnNo: 0, deck: [], card: null, endAt: 0, log: [], tw: "", tl: [] };
      const lg = SB.lang();
      const draw = () => { if(!L.deck.length) L.deck = newDeck(L.hard, lg); const w = L.deck.pop(), c = cardOf(w, lg); SB.u.saw("motsint:cards", c[0]); L.card = { id: Math.random().toString(36).slice(2), w: c[0], t: c[1] }; };
      const lab = () => '<span class="eyebrow">' + tr("Tour ", "Turn ") + (L.turnNo + 1) + " / " + L.turns * 2 + "</span>";
      const go = () => {
        if(L.phase === "setup"){
          screen(root, "su" + L.dur + "|" + L.turns + "|" + L.hard + "|" + L.twOn, '<p class="howto">' + tr("Deux équipes. Celui qui fait deviner tient le téléphone, un adversaire regarde par-dessus son épaule pour surveiller les mots interdits.", "Two teams. The clue-giver holds the phone while someone from the other team watches over their shoulder for forbidden words.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Durée d'un tour", "Turn length") + '</span><div class="seg">' + [45, 60, 90].map(n => '<button type="button" data-d="' + n + '" aria-pressed="' + (n === L.dur) + '">' + n + " s</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Tours par équipe", "Turns per team") + '</span><div class="seg">' + [2, 3, 4].map(n => '<button type="button" data-u="' + n + '" aria-pressed="' + (n === L.turns) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + L.twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("Un tour sur trois environ, la règle change", "About one turn in three, a rule changes") + "</span></span></button>" +
            '<button type="button" class="pack hot" data-h aria-pressed="' + L.hard + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Ajouter le contenu 18+", "Add 18+ content") + '<span class="pill hot">18+</span></span><span class="ds">' + tr("Sexe, porno, tabous, humour noir : tout le contenu adulte", "Sex, porn, taboos, dark humor: all the adult content") + "</span></span></button></div>" +
            '<div class="dock"><button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button></div>", r => {
            r.querySelector("[data-h]").addEventListener("click", () => { L.hard = !L.hard; persist({ miHard: L.hard }); go(); });
            r.querySelector("[data-tw]").addEventListener("click", () => { L.twOn = !L.twOn; persist({ miTw: L.twOn }); go(); });
            r.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => { L.dur = +b.dataset.d; persist({ miDur: L.dur }); go(); }));
            r.querySelectorAll("[data-u]").forEach(b => b.addEventListener("click", () => { L.turns = +b.dataset.u; persist({ miTurns: L.turns }); go(); }));
            r.querySelector("[data-go]").addEventListener("click", () => { L.phase = "ready"; L.deck = newDeck(L.hard, lg); go(); });
          });
        } else if(L.phase === "ready"){
          const sec = Math.round(turnMs(L.dur, L.tw) / 1000);
          screen(root, "rd" + L.turnNo, lab() + SB.u.twistHTML(TW(L.tw)) + scoreHTML(L.score, L.tt) + '<div class="pass"><span class="eyebrow">' + tr("À vous", "You're up") + '</span><div class="who">' + esc(TEAMS[L.tt].n) + "</div><p>" + tr("Un joueur de l'équipe prend le téléphone et fait deviner. " + sec + " secondes.", "One player on the team takes the phone and gives the clues. " + sec + " seconds.") + "</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-go>" + tr("C'est parti", "Let's go") + "</button></div>", r => {
            r.querySelector("[data-go]").addEventListener("click", () => { L.endAt = Date.now() + turnMs(L.dur, L.tw); L.log = []; draw(); L.phase = "play"; go(); });
          });
        } else if(L.phase === "play"){
          screen(root, "pl" + L.card.id, lab() + miniTwist(L.tw) + scoreHTML(L.score, L.tt) + '<div class="timer" data-t></div>' + cardHTML(L.card) +
            '<div class="dock"><div class="row"><button class="btn ghost" type="button" data-a="p"' + (L.tw === "sanspasse" ? " disabled" : "") + ">" + (L.tw === "sanspasse" ? tr("Pas de passe", "No passing") : L.tw === "passe" ? tr("Passer (−1)", "Pass (−1)") : tr("Passer", "Pass")) + '</button><button class="btn ok" type="button" data-a="f">' + tr("Trouvé !", "Got it!") + '</button></div><button class="btn bad" type="button" data-a="b">' + (L.tw === "mime" ? tr("Il a parlé", "They talked") : tr("Mot interdit", "Forbidden word")) + "</button></div>", r => {
            r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => {
              const a = b.dataset.a; SB.u.buzz(a === "b" ? 80 : 12);
              const e = effect(a, L.tw, turnSum(L.log)[0]);
              L.score[L.tt] += e[0]; L.score[1 - L.tt] += e[1]; L.endAt += e[2];
              L.log.push([L.card.w, a, fx(e)]); draw(); go();
            }));
          });
          tick();
        } else if(L.phase === "turnEnd"){
          const last = L.turnNo + 1 >= L.turns * 2;
          screen(root, "te" + L.turnNo, lab() + '<div class="verdict">' + tr("Temps écoulé", "Time's up") + '</div>' + scoreHTML(L.score, L.tt) + '<div class="field"><span class="eyebrow">' + tr("Ce tour", "This turn") + "</span>" + logHTML(L.log) + '</div><button class="btn acc" type="button" data-n>' + (last ? tr("Voir le résultat", "See the result") : tr("Équipe suivante", "Next team")) + "</button>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(last){ L.phase = "end"; const w = L.score[0] === L.score[1] ? -1 : L.score[0] > L.score[1] ? 0 : 1; if(w >= 0) api.win([TEAMS[w].n]); }
              else { L.turnNo++; L.tt = 1 - L.tt; L.tw = rollTwist(L.twOn, L.tw); L.phase = "ready"; }
              go();
            });
          });
        } else if(L.phase === "end"){
          const w = L.score[0] === L.score[1] ? -1 : L.score[0] > L.score[1] ? 0 : 1;
          screen(root, "end", '<span class="eyebrow">' + tr("Résultat", "Result") + '</span><div class="verdict">' + (w < 0 ? tr("Égalité !", "It's a tie!") : esc(TEAMS[w].n) + tr(" gagne", " wins")) + "</div>" + scoreHTML(L.score, w) + awardsHTML(awards(L.tl, x => TEAMS[x[1]].n + tr(", tour ", ", turn ") + (x[0] + 1), x => TEAMS[x[1]].n)) + '<div class="dock"><button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      function tick(){
        if(L.phase !== "play") return;
        const left = Math.max(0, Math.ceil((L.endAt - Date.now()) / 1000));
        const t = txt(root, "[data-t]", left); if(t) t.classList.toggle("low", left <= 10);
        if(left !== lastLeft){ if(left <= 5 && left > 0 && lastLeft > left) SB.u.buzz(left === 1 ? 60 : 15); lastLeft = left; }
        if(left <= 0){ SB.u.buzz([80, 60, 80]); L.tl.push([L.turnNo, L.tt].concat(turnSum(L.log))); L.phase = "turnEnd"; go(); }
      }
      api.onTick(tick);
      go();
    }
  }
});

function currentSpeaker(ctx){
  const s = ctx.s, team = A(A(s.teams)[s.tt]);
  if(!team.length) return "";
  const start = (A(s.sp)[s.tt] || 0) % team.length;
  for(let i = 0; i < team.length; i++){ const id = team[(start + i) % team.length]; if(ctx.here(id)) return id; }
  return team[start];
}
function draw(ctx){
  let deck = A(ctx.priv().deck).filter(w => typeof w === "string");
  const lg = ctx.s && ctx.s.lg || "fr";
  if(!deck.length) deck = newDeck(ctx.opts.hard, lg);
  const c = cardOf(deck.pop(), lg); ctx.setPriv({ deck }); SB.u.saw("motsint:cards", c[0]);
  return { id: ctx.rid(), w: c[0], t: c[1] };
}
})();
