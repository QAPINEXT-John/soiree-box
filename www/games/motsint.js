/* Mots interdits — faire deviner un mot à son équipe sans dire les mots interdits. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist } = SB.u;

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
  ["Pirate",["Bateau","Trésor","Œil","Perroquet","Capitaine"]],["Hiver",["Froid","Neige","Saison","Décembre","Manteau"]],
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
  ["Boulanger",["Pain","Baguette","Four","Croissant","Farine"]],["Igloo",["Glace","Esquimau","Maison","Neige","Froid"]],
  ["Cactus",["Épines","Désert","Plante","Piquer","Arroser"]],["Pharaon",["Égypte","Pyramide","Roi","Momie","Tombeau"]],
  ["Trampoline",["Sauter","Rebondir","Toile","Jardin","Haut"]],["Sous-marin",["Mer","Plonger","Bateau","Périscope","Eau"]],
  ["Moustache",["Poils","Lèvre","Visage","Barbe","Homme"]],["Cerf-volant",["Vent","Ficelle","Voler","Plage","Ciel"]],
  ["Chaussette",["Pied","Paire","Laine","Trou","Chaussure"]],["Arbitre",["Sifflet","Match","Carton","Faute","Football"]],
  ["Magicien",["Tour","Chapeau","Lapin","Baguette","Magie"]],["Bougie",["Flamme","Cire","Allumer","Anniversaire","Lumière"]],
  ["Microbe",["Maladie","Petit","Virus","Microscope","Laver"]],["Cow-boy",["Cheval","Chapeau","Western","Lasso","Far West"]],
  ["Échecs",["Roi","Reine","Plateau","Pion","Mat"]],["Hérisson",["Piquants","Animal","Boule","Forêt","Épines"]],
  ["Plombier",["Fuite","Tuyau","Eau","Réparer","Robinet"]],["Tempête",["Vent","Pluie","Orage","Météo","Fort"]],
  ["Mouette",["Oiseau","Mer","Plage","Crier","Blanc"]],["Sapin",["Noël","Arbre","Vert","Aiguilles","Forêt"]],
  ["Chevalier",["Armure","Épée","Cheval","Moyen Âge","Roi"]],["Sieste",["Dormir","Après-midi","Canapé","Repos","Fatigue"]],
  ["Pâtes",["Italie","Spaghetti","Cuire","Sauce","Eau"]],["Sirène",["Poisson","Mer","Queue","Chanter","Femme"]],
  ["Tornade",["Vent","Tourner","Ouragan","Maison","Météo"]],["Balançoire",["Jardin","Enfant","Pousser","Aller","Corde"]],
  ["Loup-garou",["Lune","Pleine","Transformer","Poils","Hurler"]],["Fromage",["Lait","Vache","Camembert","Trou","Odeur"]],
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
  ["Gigolo",["Payer","Homme","Escort","Riche","Femme"]],["Orgasme",["Plaisir","Jouir","Sommet","Sexe","Crier"]],
  ["Suçon",["Cou","Bisou","Marque","Aspirer","Rouge"]],["Préliminaires",["Avant","Caresses","Sexe","Bisous","Chauffer"]],
  ["Walk of shame",["Matin","Retour","Honte","Soirée","Vêtements"]],["Lubrifiant",["Glisser","Gel","Sexe","Tube","Huile"]],
  ["Pole dance",["Barre","Danser","Strip","Sport","Club"]],["Cocu",["Tromper","Cornes","Mari","Infidèle","Couple"]],
  ["Testament",["Mort","Héritage","Notaire","Volonté","Papier"]],["Cercueil",["Mort","Bois","Enterrement","Boîte","Cimetière"]],
  ["Croque-mort",["Pompes funèbres","Cadavre","Enterrement","Métier","Cercueil"]],["Cimetière",["Tombe","Mort","Enterrement","Croix","Fleurs"]],
  ["Porno",["Film","Sexe","Acteur","Site","X"]],["Sextape",["Vidéo","Filmer","Sexe","Célébrité","Fuite"]],
  ["Jacuzzi",["Bulles","Eau","Chaud","Bain","Spa"]],["Body shot",["Boire","Corps","Sel","Citron","Tequila"]],
  ["Sugar daddy",["Riche","Vieux","Cadeaux","Payer","Jeune"]],["Infidélité",["Tromper","Couple","Amant","Mensonge","Cocu"]],
  ["Strip-poker",["Cartes","Déshabiller","Perdre","Vêtements","Jeu"]],["Nuisette",["Dentelle","Nuit","Soie","Lingerie","Sexy"]],
  ["Speed dating",["Rencontre","Minutes","Table","Célibataire","Rapide"]],["Ivresse",["Alcool","Saoul","Boire","Tituber","Vin"]],
  ["Shooter",["Verre","Petit","Cul sec","Alcool","Tequila"]],["Massage",["Huile","Mains","Dos","Détente","Masser"]],
  ["Corbillard",["Voiture","Mort","Cercueil","Enterrement","Noir"]],["Épitaphe",["Tombe","Inscription","Mort","Pierre","Phrase"]],
  ["Fossoyeur",["Creuser","Tombe","Cimetière","Pelle","Mort"]],["Rupture",["Couple","Quitter","Larmes","Ex","Séparer"]],
  ["Coup d'un soir",["Nuit","Lendemain","Inconnu","Coucher","Une fois"]]
];
const ALL = CARDS.concat(HARD_CARDS);
const BYW = {}; ALL.forEach(c => { BYW[c[0]] = c; });
// Paquet de mots : ceux jamais vus sur ce téléphone sortent en premier.
function newDeck(hard){ return SB.u.fresh("motsint:cards", (hard ? ALL : CARDS).map(c => c[0])); }
function cardOf(w){ return BYW[w] || CARDS[0]; }
let lastLeft = 99;
const TEAMS = [{ n: "Équipe Rouge", c: "#d23b3b" }, { n: "Équipe Bleue", c: "#2f6fd6" }];

/* ---------- Coups de théâtre : un tour sur trois environ ---------- */
const TWISTS = [
  { id: "eclair", name: "Manche éclair", desc: "Chrono divisé par deux, mais chaque mot trouvé vaut 2 points." },
  { id: "double", name: "Points doublés", desc: "Mot trouvé : +2. Mot interdit : −2." },
  { id: "mime", name: "Mime", desc: "Interdit de parler, on mime. Mot trouvé : +2. Un mot prononcé se buzze." },
  { id: "sanspasse", name: "Sans filet", desc: "Impossible de passer une carte pendant ce tour." },
  { id: "passe", name: "Passe payante", desc: "Chaque carte passée coûte 1 point." },
  { id: "or", name: "Mot en or", desc: "Le premier mot trouvé du tour vaut 3 points." },
  { id: "rebond", name: "Rebond", desc: "Un mot interdit donne 1 point à l'équipe adverse." },
  { id: "temps", name: "Prolongations", desc: "Chaque mot trouvé ajoute 5 secondes au chrono." },
  { id: "unmot", name: "Un mot à la fois", desc: "Un seul mot par indice. Une phrase se buzze comme un mot interdit." }
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
  if(!l.length) return '<p class="sm">Aucune carte jouée.</p>';
  return '<ul class="list">' + l.map(x => '<li><span class="t" style="font-size:24px">' + esc(x[0]) + '</span><span class="by">' + (x[1] === "f" ? "Trouvé" : x[1] === "b" ? "Mot interdit" : "Passé") + (x[2] && x[2] !== "0" ? " · " + esc(x[2]) : x[1] === "f" ? " · +1" : x[1] === "b" ? " · −1" : "") + "</span></li>").join("") + "</ul>";
}
const miniTwist = tw => { const t = TW(tw); return t ? SB.u.twistHTML({ name: t.name }) : ""; };
function turnSum(log){ const l = A(log).map(A); return [l.filter(x => x[1] === "f").length, l.filter(x => x[1] === "b").length, l.filter(x => x[1] === "p").length]; }

/* ---------- Trophées : tl = [[qui, équipe, trouvés, buzz, passes]] ---------- */
function vary(list, seed){ return list[Math.abs(seed) % list.length]; }
function awards(tl, name, who){
  who = who || name;
  const t = A(tl).map(A), out = [], seed = t.reduce((a, x) => a + (+x[2] || 0) * 3 + (+x[3] || 0), 0);
  const best = t.slice().sort((a, b) => b[2] - a[2])[0];
  if(best && best[2] > 0) out.push([vary(["Langue bien pendue", "Moulin à paroles", "Machine à faire deviner", "Orateur de génie"], seed), name(best), SB.u.plural(best[2], "mot") + " en un tour"]);
  const agg = {}; t.forEach(x => { const k = who(x); agg[k] = agg[k] || [0, 0]; agg[k][0] += +x[3] || 0; agg[k][1] += +x[4] || 0; });
  const bz = Object.keys(agg).sort((a, b) => agg[b][0] - agg[a][0])[0];
  if(bz && agg[bz][0] > 0) out.push([vary(["Langue qui fourche", "Gaffeur en chef", "Abonné au buzz", "Lapsus ambulant"], seed + 1), bz, SB.u.plural(agg[bz][0], "mot interdit", "mots interdits")]);
  const ps = Object.keys(agg).sort((a, b) => agg[b][1] - agg[a][1])[0];
  if(ps && agg[ps][1] >= 2) out.push([vary(["Roi de la passe", "Zappeur fou", "Joker permanent", "Esquive olympique"], seed + 2), ps, SB.u.plural(agg[ps][1], "carte passée", "cartes passées")]);
  return out;
}
function awardsHTML(a){ return a.length ? '<div class="field"><span class="eyebrow">Trophées</span><ul class="list">' + a.map(x => '<li><span class="t" style="font-size:19px">' + esc(x[0]) + '</span><span class="by">' + esc(x[1]) + " · " + esc(x[2]) + "</span></li>").join("") + "</ul></div>" : ""; }

SB.register({
  id: "motsint", name: "Mots interdits", glyph: "Chut", pitch: "Fais deviner un mot sans dire les mots interdits.", ticks: true, hot: true,
  accent: { light: "#c49bff", dark: "#c49bff" },
  tag: "Fais deviner un mot à ton équipe sans dire les mots interdits. Chrono en main.",
  min: 4, max: 20,
  rules: [
    "Deux équipes. À chaque tour, un joueur fait deviner un maximum de mots à son équipe avant la fin du chrono.",
    "Interdit de dire le mot, ses dérivés, ou les 5 mots interdits de la carte.",
    "L'équipe adverse voit la carte et appuie sur « Buzz » si un mot interdit est prononcé : −1 point.",
    "Mot trouvé : +1. On peut passer une carte sans pénalité.",
    "Coups de théâtre : un tour sur trois environ, la règle change (manche éclair, mime, mot en or, sans filet…).",
    "Les cartes déjà jouées sur ce téléphone reviennent en dernier."
  ],
  options: [
    { id: "dur", label: "Durée d'un tour", type: "seg", def: 60, values: [{ v: 45, label: "45 s" }, { v: 60, label: "60 s" }, { v: 90, label: "90 s" }] },
    { id: "turns", label: "Tours par équipe", type: "seg", def: 3, values: [{ v: 2, label: "2" }, { v: 3, label: "3" }, { v: 4, label: "4" }] },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "Un tour sur trois environ, la règle change", def: true },
    { id: "hard", label: "Cartes", type: "toggle", text: "Ajouter le contenu 18+", desc: "Sexe, porno, tabous, humour noir : tout le contenu adulte", hot: true, def: false }
  ],
  start(ctx, o){
    const ids = shuffle(ctx.ids), teams = [[], []];
    ids.forEach((id, i) => teams[i % 2].push(id));
    ctx.setPriv({ deck: newDeck(o.hard) });
    return { phase: "ready", teams, score: [0, 0], tt: 0, sp: [0, 0], turnNo: 0, turns: o.turns || 3, dur: o.dur || 60, card: null, endAt: 0, log: [], seen: {}, tw: "", tl: [] };
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
    const lab = '<span class="eyebrow">Tour ' + (s.turnNo + 1) + " / " + s.turns * 2 + " · " + esc(TEAMS[s.tt].n) + "</span>";
    const secs = Math.round(turnMs(s.dur, s.tw) / 1000);
    if(s.phase === "ready"){
      screen(root, "rd" + s.k + "|" + speaker + isSp, lab + SB.u.twistHTML(TW(s.tw)) + scoreHTML(s.score, s.tt) +
        '<div class="pass"><span class="eyebrow">' + (isSp ? "C'est toi qui fais deviner" : myTeam === s.tt ? "Ton équipe joue" : "Vous surveillez") + '</span><div class="who">' + esc(ctx.name(speaker)) + "</div><p>" +
        (isSp ? "Prends ton téléphone, fais deviner un maximum de mots à ton équipe. " + secs + " secondes." : myTeam === s.tt ? "Écoute " + esc(ctx.name(speaker)) + " et crie tes réponses." : "Tu verras la carte : buzze si " + esc(ctx.name(speaker)) + (s.tw === "mime" ? " parle." : s.tw === "unmot" ? " dit un mot interdit ou fait une phrase." : " dit un mot interdit.")) + "</p></div>" +
        '<details><summary>Les équipes</summary><ul>' + teams.map((t, i) => "<li><b>" + esc(TEAMS[i].n) + "</b> : " + esc(t.map(ctx.name).join(", ")) + "</li>").join("") + "</ul></details>" +
        SB.u.dock(isSp ? '<button class="btn acc" type="button" data-go>C\'est parti</button>' : '<p class="wait">On attend que ' + esc(ctx.name(speaker)) + " lance le chrono…</p>"), r => {
        const b = r.querySelector("[data-go]"); if(b) b.addEventListener("click", () => { b.disabled = true; ctx.send({ go: 1 }); });
      });
    } else if(s.phase === "play"){
      const card = s.card || { id: "", w: "", t: [] };
      const role = isSp ? "sp" : opp ? "op" : "tm";
      screen(root, "pl" + s.k + "|" + card.id + "|" + role, lab + miniTwist(s.tw) + scoreHTML(s.score, s.tt) + '<div class="timer" data-t></div>' +
        (role === "tm" ? '<div class="pass" style="min-height:24vh"><span class="eyebrow">Devinez !</span><div class="who">' + esc(ctx.name(speaker)) + (s.tw === "mime" ? " mime" : " fait deviner") + '</div><p data-found></p></div>' : cardHTML(card)) +
        SB.u.dock((role === "sp" ? '<div class="row"><button class="btn ghost" type="button" data-a="p"' + (s.tw === "sanspasse" ? " disabled" : "") + ">" + (s.tw === "sanspasse" ? "Pas de passe" : s.tw === "passe" ? "Passer (−1)" : "Passer") + '</button><button class="btn ok" type="button" data-a="f">Trouvé !</button></div>' : "") +
        (role === "op" ? '<button class="btn bad big-tap" type="button" data-a="b">Buzz ! ' + (s.tw === "mime" ? "Il a parlé" : "Mot interdit") + "</button>" : "")), r => {
        r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => {
          r.querySelectorAll("[data-a]").forEach(x => { x.disabled = true; });
          ctx.send({ c: card.id, a: b.dataset.a, n: Date.now() });
        }));
      });
      const left = Math.max(0, Math.ceil((s.endAt - ctx.now()) / 1000));
      const t = txt(root, "[data-t]", left); if(t) t.classList.toggle("low", left <= 10);
      if(left !== lastLeft){ if(left <= 5 && left > 0 && lastLeft > left) SB.u.buzz(left === 1 ? 60 : 15); lastLeft = left; }
      txt(root, "[data-found]", A(s.log).filter(x => A(x)[1] === "f").length + " mot(s) trouvé(s)");
    } else if(s.phase === "turnEnd"){
      const last = s.turnNo + 1 >= s.turns * 2;
      if(root.dataset.key && root.dataset.key.slice(0, 2) === "pl") SB.u.buzz([80, 60, 80]);
      screen(root, "te" + s.k + ctx.isHost, lab + '<div class="verdict">Temps écoulé</div>' + scoreHTML(s.score, s.tt) + '<div class="field"><span class="eyebrow">Ce tour</span>' + logHTML(s.log) + "</div>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? "Voir le résultat" : "Équipe suivante") + "</button>" : '<p class="wait">L\'hôte passe à l\'équipe suivante…</p>'), r => {
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
      screen(root, "end" + ctx.isHost, '<span class="eyebrow">Résultat</span><div class="verdict">' + (win < 0 ? "Égalité !" : esc(TEAMS[win].n) + " gagne") + "</div>" + scoreHTML(sc, win < 0 ? -1 : win) +
        awardsHTML(awards(s.tl, x => ctx.name(x[0]))) +
        '<details open><summary>Les équipes</summary><ul>' + teams.map((t, i) => "<li><b>" + esc(TEAMS[i].n) + "</b> : " + esc(t.map(ctx.name).join(", ")) + "</li>").join("") + "</ul></details>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const s2 = A(c.s.score), w = s2[0] === s2[1] ? -1 : s2[0] > s2[1] ? 0 : 1, tm = A(c.s.teams).map(A);
          c.end({ title: w < 0 ? "Égalité " + s2[0] + " à " + s2[1] : TEAMS[w].n + " gagne " + s2[w] + " à " + s2[1 - w],
            lines: tm.map((t, i) => TEAMS[i].n + " : " + t.map(c.name).join(", ")).concat(awards(c.s.tl, x => c.name(x[0])).map(a => a[0] + " : " + a[1])), win: w < 0 ? [] : tm[w] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    start(root, api){
      const st = store();
      let L = { phase: "setup", hard: !!st.miHard, twOn: st.miTw !== false, dur: [45, 60, 90].indexOf(st.miDur) >= 0 ? st.miDur : 60, turns: [2, 3, 4].indexOf(st.miTurns) >= 0 ? st.miTurns : 3, score: [0, 0], tt: 0, turnNo: 0, deck: [], card: null, endAt: 0, log: [], tw: "", tl: [] };
      const draw = () => { if(!L.deck.length) L.deck = newDeck(L.hard); const w = L.deck.pop(), c = cardOf(w); SB.u.saw("motsint:cards", c[0]); L.card = { id: Math.random().toString(36).slice(2), w: c[0], t: c[1] }; };
      const lab = () => '<span class="eyebrow">Tour ' + (L.turnNo + 1) + " / " + L.turns * 2 + "</span>";
      const go = () => {
        if(L.phase === "setup"){
          screen(root, "su" + L.dur + "|" + L.turns + "|" + L.hard + "|" + L.twOn, '<p class="howto">Deux équipes. Celui qui fait deviner tient le téléphone, un adversaire regarde par-dessus son épaule pour surveiller les mots interdits.</p>' +
            '<div class="field"><span class="eyebrow">Durée d\'un tour</span><div class="seg">' + [45, 60, 90].map(n => '<button type="button" data-d="' + n + '" aria-pressed="' + (n === L.dur) + '">' + n + " s</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Tours par équipe</span><div class="seg">' + [2, 3, 4].map(n => '<button type="button" data-u="' + n + '" aria-pressed="' + (n === L.turns) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + L.twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">Un tour sur trois environ, la règle change</span></span></button>' +
            '<button type="button" class="pack hot" data-h aria-pressed="' + L.hard + '"><span class="box">✓</span><span class="tx"><span class="nm">Ajouter le contenu 18+<span class="pill hot">18+</span></span><span class="ds">Sexe, porno, tabous, humour noir : tout le contenu adulte</span></span></button></div>' +
            '<div class="dock"><button class="btn acc" type="button" data-go>Commencer</button></div>', r => {
            r.querySelector("[data-h]").addEventListener("click", () => { L.hard = !L.hard; persist({ miHard: L.hard }); go(); });
            r.querySelector("[data-tw]").addEventListener("click", () => { L.twOn = !L.twOn; persist({ miTw: L.twOn }); go(); });
            r.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => { L.dur = +b.dataset.d; persist({ miDur: L.dur }); go(); }));
            r.querySelectorAll("[data-u]").forEach(b => b.addEventListener("click", () => { L.turns = +b.dataset.u; persist({ miTurns: L.turns }); go(); }));
            r.querySelector("[data-go]").addEventListener("click", () => { L.phase = "ready"; L.deck = newDeck(L.hard); go(); });
          });
        } else if(L.phase === "ready"){
          screen(root, "rd" + L.turnNo, lab() + SB.u.twistHTML(TW(L.tw)) + scoreHTML(L.score, L.tt) + '<div class="pass"><span class="eyebrow">À vous</span><div class="who">' + esc(TEAMS[L.tt].n) + "</div><p>Un joueur de l'équipe prend le téléphone et fait deviner. " + Math.round(turnMs(L.dur, L.tw) / 1000) + " secondes.</p></div><div class=\"dock\"><button class=\"btn acc\" type=\"button\" data-go>C'est parti</button></div>", r => {
            r.querySelector("[data-go]").addEventListener("click", () => { L.endAt = Date.now() + turnMs(L.dur, L.tw); L.log = []; draw(); L.phase = "play"; go(); });
          });
        } else if(L.phase === "play"){
          screen(root, "pl" + L.card.id, lab() + miniTwist(L.tw) + scoreHTML(L.score, L.tt) + '<div class="timer" data-t></div>' + cardHTML(L.card) +
            '<div class="dock"><div class="row"><button class="btn ghost" type="button" data-a="p"' + (L.tw === "sanspasse" ? " disabled" : "") + ">" + (L.tw === "sanspasse" ? "Pas de passe" : L.tw === "passe" ? "Passer (−1)" : "Passer") + '</button><button class="btn ok" type="button" data-a="f">Trouvé !</button></div><button class="btn bad" type="button" data-a="b">' + (L.tw === "mime" ? "Il a parlé" : "Mot interdit") + "</button></div>", r => {
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
          screen(root, "te" + L.turnNo, lab() + '<div class="verdict">Temps écoulé</div>' + scoreHTML(L.score, L.tt) + '<div class="field"><span class="eyebrow">Ce tour</span>' + logHTML(L.log) + '</div><button class="btn acc" type="button" data-n>' + (last ? "Voir le résultat" : "Équipe suivante") + "</button>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => {
              if(last){ L.phase = "end"; const w = L.score[0] === L.score[1] ? -1 : L.score[0] > L.score[1] ? 0 : 1; if(w >= 0) api.win([TEAMS[w].n]); }
              else { L.turnNo++; L.tt = 1 - L.tt; L.tw = rollTwist(L.twOn, L.tw); L.phase = "ready"; }
              go();
            });
          });
        } else if(L.phase === "end"){
          const w = L.score[0] === L.score[1] ? -1 : L.score[0] > L.score[1] ? 0 : 1;
          screen(root, "end", '<span class="eyebrow">Résultat</span><div class="verdict">' + (w < 0 ? "Égalité !" : esc(TEAMS[w].n) + " gagne") + "</div>" + scoreHTML(L.score, w) + awardsHTML(awards(L.tl, x => TEAMS[x[1]].n + ", tour " + (x[0] + 1), x => TEAMS[x[1]].n)) + '<div class="dock"><button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button></div>', r => {
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
  if(!deck.length) deck = newDeck(ctx.opts.hard);
  const c = cardOf(deck.pop()); ctx.setPriv({ deck }); SB.u.saw("motsint:cards", c[0]);
  return { id: ctx.rid(), w: c[0], t: c[1] };
}
})();
