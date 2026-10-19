/* Tu préfères — deux choix impossibles, tout le monde vote en secret. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick } = SB.u;

const SOFT = [
  ["Pouvoir voler","Être invisible"],["Ne plus jamais manger de fromage","Ne plus jamais manger de chocolat"],["Vivre sans internet","Vivre sans eau chaude"],
  ["Parler toutes les langues","Jouer de tous les instruments"],["Avoir 10 ans de plus","Avoir 10 ans de moins"],["Vivre au bord de la mer","Vivre à la montagne"],
  ["Lire dans les pensées","Voir le futur"],["Ne plus jamais voyager","Ne plus jamais regarder de séries"],["Être célèbre mais fauché","Être riche mais inconnu"],
  ["Toujours avoir trop chaud","Toujours avoir trop froid"],["Toujours dire la vérité","Toujours mentir"],["Manger très épicé à chaque repas","Manger sans sel à chaque repas"],
  ["Rester coincé dans un ascenseur avec ton ex","Rester coincé dans un ascenseur avec ton patron"],["Ne plus avoir de téléphone","Ne plus avoir d'ordinateur"],
  ["Vivre au Moyen Âge","Vivre en l'an 3000"],["Gagner au loto","Trouver l'amour de ta vie"],["Être drôle","Être brillant"],
  ["Avoir les cheveux bleus à vie","Être chauve à vie"],["Chanter au lieu de parler","Danser au lieu de marcher"],["Faire le tour du monde en solo","Passer un an enfermé chez toi avec tes potes"],
  ["Parler aux animaux","Comprendre les bébés"],["Avoir un dragon","Être un dragon"],["Avoir un bouton pause sur ta vie","Avoir un bouton retour en arrière"],
  ["Être le meilleur d'une équipe nulle","Être le plus nul d'une équipe de champions"],["Ne boire que de l'eau","Ne boire que du soda"],
  ["Connaître la date de ta mort","Connaître la cause de ta mort"],["Pouvoir te téléporter","Pouvoir remonter le temps"],["Vivre sans musique","Vivre sans films"],
  ["Que tout le monde entende tes pensées pendant une heure","Lire ton historique de recherche à voix haute"],["Passer un an sans réseaux sociaux","Passer un an sans sortir le soir"],
  ["Être un génie incompris","Être un idiot adoré"],["Avoir un majordome","Avoir un chef cuisinier à domicile"],["Ne plus jamais faire la queue","Ne plus jamais être coincé dans les bouchons"],
  ["Éclater de rire chaque fois que tu es triste","Fondre en larmes chaque fois que tu ris"],["Revivre ton enfance","Découvrir à quoi ressemblera ta vie dans 20 ans"],
  ["Savoir cuisiner comme un chef","Savoir danser comme un pro"],["Vivre dans un château hanté","Vivre dans une cabane au fond des bois"],["Avoir des yeux dans le dos","Avoir l'ouïe d'une chauve-souris"],
  ["Ne manger que des pâtes pendant un an","Ne manger que de la soupe pendant un an"],["Rester enfermé tout un week-end dans un supermarché","Rester enfermé tout un week-end dans un parc d'attractions"],
  ["Rire comme un dauphin","Éternuer comme une trompette"],["Retrouver tous les objets que tu as perdus","Retrouver tous les messages que tu as effacés"],
  ["Que ta vie soit une comédie musicale","Que ta vie soit un film muet"],["Ne plus jamais avoir de courbatures","Ne plus jamais avoir le hoquet"],
  ["Être le meilleur ami d'un dragon","Être le meilleur ami d'un fantôme"],["Habiter dans un aquarium géant","Habiter dans une cabane dans les arbres"],
  ["Toujours dire ce que tu penses","Ne jamais pouvoir donner ton avis"],["Gagner toutes tes disputes","Gagner à tous les jeux de société"],
  ["Avoir un sosie qui fait des bêtises en ton nom","Avoir un jumeau maléfique"],["Voyager dans l'espace","Explorer le fond des océans"],
  ["Pouvoir parler à l'enfant que tu étais","Pouvoir parler à toi-même à 80 ans"],["Avoir un super-pouvoir inutile","Avoir un super-pouvoir qui te met en danger"],
  ["Avoir la voix off d'une bande-annonce de film d'action","Faire coin-coin à chacun de tes pas"],["Être payé pour dormir","Être payé pour manger"],
  ["Vivre sans réveil","Vivre sans calendrier"],["Ne plus jamais rater ton bus","Réussir toutes tes blagues"],["Avoir une piscine dans ton salon","Avoir un toboggan géant à la place de l'escalier"],
  ["Connaître à l'avance la fin de toutes les séries","Ne jamais pouvoir voir la fin d'une série"],["Changer de prénom chaque année","Changer de couleur de cheveux chaque mois"]
];
const HOT = [
  ["Que ta mère lise tes messages","Que ton patron voie ton historique"],["Te faire surprendre en pleine action par tes parents","Surprendre tes parents en pleine action"],
  ["Faire l'amour uniquement dans le noir","Faire l'amour uniquement en pleine lumière"],["Vivre un plan d'un soir incroyable","Vivre une longue relation bien sage"],
  ["Ne plus jamais embrasser","Ne plus jamais faire l'amour"],["Sortir avec quelqu'un de très beau mais ennuyeux","Sortir avec quelqu'un de banal mais hilarant"],
  ["Que tous tes ex viennent à ton mariage","Qu'aucun de tes amis ne vienne à ton mariage"],["Lire les textos coquins de ton meilleur pote","Que tes potes lisent tes textos coquins"],
  ["T'offrir un dîner dans un grand restaurant","Passer une nuit torride à la belle étoile"],["Envoyer par erreur une photo osée sur le groupe famille","Recevoir par erreur une photo osée d'un collègue"],
  ["Embrasser la personne à ta droite","Raconter ta pire première fois"],["Faire un strip-tease devant tes potes","Faire une déclaration d'amour en public"],
  ["Entendre tes voisins faire l'amour toute la nuit","Que tes voisins t'entendent toute la nuit"],["Trouver un sex toy chez tes parents","Que tes parents trouvent le tien"],
  ["Coucher avec quelqu'un qui parle trop au lit","Coucher avec quelqu'un qui ne dit pas un mot"],["Tester un plan à trois","Tester un jeu de rôle"],
  ["Te faire larguer par texto","Te faire larguer devant tout le monde"],["Que ton historique soit projeté au repas de famille","Que ta galerie photo y soit projetée"],
  ["Faire l'amour dans un avion","Faire l'amour dans un ascenseur"],["Ne plus pouvoir mentir au lit","Ne plus pouvoir parler au lit"],
  ["Draguer en ne parlant qu'en alexandrins","Draguer en ne parlant qu'en émojis"],["Ressortir avec ton ex pendant un mois","Sortir avec l'ex de ton meilleur pote"],
  ["Avoir ton premier rencard chez tes parents","Avoir ton premier rencard avec ton ex assis à la table d'à côté"],["Avoir un crush secret toute ta vie","Que tout le monde connaisse tes crushs"],
  ["Embrasser ton crush devant tout le monde","Écrire une lettre d'amour anonyme à ton crush"],["Aller à un rencard arrangé par tes potes","Aller à un rencard arrangé par tes parents"],
  ["Que ton crush lise tes messages à son sujet","Que ton ex lise ton journal intime"],["Embrasser quelqu'un pendant trois heures non-stop","Faire un câlin de huit heures sans pause"],
  ["Draguer uniquement avec des répliques de films","Draguer uniquement avec des anecdotes sur les escargots"],["Te faire larguer par lettre recommandée","Te faire larguer en chanson"],
  ["Que ton rencard arrive avec sa mère","Que ton rencard arrive avec son ex"],["Laisser ton ex choisir ton prochain rencard","Laisser un algorithme choisir ton prochain rencard"],
  ["Avouer ton crush à la personne concernée","L'avouer à tout le monde sauf à la personne concernée"],["Passer une nuit dans un hôtel de luxe avec un inconnu","Passer une nuit sous une tente avec ton ex"]
];
const TRASH = [["Que tes parents tombent sur ta sextape", "Que tes collègues tombent sur ta sextape"], ["Ne plus jamais avoir d'orgasme", "Avoir un orgasme à chaque éternuement"], ["Faire l'amour devant tes potes", "Regarder tes potes faire l'amour"], ["Un plan à trois avec deux inconnus", "Un plan à trois avec deux personnes de ce groupe"], ["Que ton historique porno devienne public", "Que tes nudes fuitent sur internet"], ["Coucher avec ton boss", "Coucher avec ton pire ennemi"], ["Faire l'amour une fois par an, mais divinement", "Faire l'amour tous les jours, mais très moyennement"], ["Tourner un porno amateur", "Être figurant dans un vrai porno"], ["Ne plus jamais regarder de porno", "Ne plus jamais coucher avec quelqu'un"], ["Que ton partenaire crie le prénom de son ex au lit", "Crier toi-même le prénom de ton ex au lit"], ["Avoir un sex toy qui parle", "Avoir un sex toy qui chante"], ["Décrocher par erreur un appel visio de ta mère en plein acte", "Décrocher par erreur un appel visio de ton patron en plein acte"], ["Faire l'amour dans un cimetière", "Faire l'amour dans une église"], ["Coucher avec une célébrité que tu détestes", "Recoucher avec ton premier amour, 30 ans plus tard"], ["Ne faire l'amour qu'en costume de mascotte", "Ne faire l'amour qu'en écoutant l'hymne national"], ["Avoir un plan cul différent chaque semaine", "Ne coucher qu'avec une seule personne de toute ta vie"], ["Sortir avec quelqu'un qui fantasme sur tes pieds", "Sortir avec quelqu'un qui fantasme sur tes aisselles"], ["Montrer tes nudes à tes potes", "Voir les nudes de tous tes potes"], ["Faire un strip-tease à un mariage", "Faire un strip-tease à un enterrement"], ["Que ton ex ait ton prénom tatoué sur les fesses", "Avoir le prénom de ton ex tatoué sur les fesses"], ["Tomber sur un partenaire qui imite des cris d'animaux au lit", "Tomber sur un partenaire qui commente tout en direct"], ["Que ta sextape devienne un mème", "Que ton historique de recherche soit lu dans un podcast"], ["Faire l'amour sur un lit à eau", "Faire l'amour dans un hamac"], ["Coucher avec ton sosie", "Coucher avec le sosie de ton ex"], ["Ne plus jamais faire de préliminaires", "Ne faire que des préliminaires"], ["Que ta boîte à sex toys s'ouvre en plein repas de famille", "Que ta boîte à sex toys s'ouvre au contrôle de sécurité de l'aéroport"], ["Passer la nuit avec quelqu'un qui pleure à la fin", "Passer la nuit avec quelqu'un qui applaudit à la fin"], ["Être ajouté à un groupe de discussion avec tous tes ex", "Voir débarquer tous tes plans d'un soir à ton anniversaire"], ["Faire l'amour sur une musique d'ascenseur", "Faire l'amour sur des bruitages de dessin animé"], ["Jouer au strip-poker avec tes collègues", "Jouer au strip-poker avec ta belle-famille"]];
const NOIR = [["Mourir dans 10 ans pile, en le sachant", "Mourir n'importe quand, sans prévenir"], ["Être enterré", "Être incinéré et finir dans un sablier"], ["Avoir un enterrement qui tourne à la fête", "Avoir un enterrement où personne ne vient"], ["Hanter ton ex", "Hanter ton patron"], ["Mourir de rire", "Mourir d'ennui"], ["Finir dévoré par des requins", "Finir dévoré par tes chats"], ["Connaître la date de la mort de tous tes potes", "Que tous tes potes connaissent la date de la tienne"], ["Vivre éternellement seul", "Mourir demain entouré de tes proches"], ["Que ton testament soit lu en direct sur TikTok", "Que ton historique de navigation soit lu à ton enterrement"], ["Être le dernier humain sur Terre", "Être le premier à mourir pendant l'apocalypse"], ["Être réincarné en moustique", "Être réincarné en pigeon parisien"], ["Avoir un enterrement karaoké", "Avoir un enterrement en drive"], ["Mourir en héros, mais de façon ridicule", "Vivre jusqu'à 100 ans et tomber dans l'oubli"], ["Que ton épitaphe soit écrite par ton ex", "Que ton éloge funèbre soit prononcé par ton patron"], ["Être enterré avec ton téléphone", "Être enterré avec la liste de tes rancunes"], ["Revenir en fantôme très poli", "Revenir en zombie très câlin"], ["Que ton enterrement soit un défilé de mode", "Que ton enterrement soit un spectacle de magie"], ["Savoir comment chaque personne ici va mourir", "Que tout le monde ici sache comment tu vas mourir"], ["Hériter d'une maison hantée", "Hériter des dettes d'un inconnu"], ["Être cryogénisé pendant 500 ans", "Te réincarner dans 500 ans en un animal tiré au sort"]];
const PACKS = [
  { v: "soft", label: "Classique", desc: "Pour tout le monde", list: SOFT },
  { v: "adulte", label: "Adultes", desc: "Sexe, porno, tabous, humour noir : tout le contenu adulte", list: HOT.concat(TRASH, NOIR), hot: true }
];
const SEEN = "tupref:q";
function deckFor(packs){
  const sel = A(packs); const pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => p.list);
  return SB.u.fresh(SEEN, pool.length ? pool : SOFT);
}
function packButtons(sel){
  return '<div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>";
}
function twToggle(on){
  return '<div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + !!on + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">De temps en temps, une règle change pour une question</span></span></button></div>';
}
function pairs(ids){ const out = []; for(let i = 0; i < ids.length; i++) for(let j = i + 1; j < ids.length; j++) out.push([ids[i], ids[j]]); return out; }
function resHTML(p, a, b, nameOf){
  const n = Math.max(1, a.length + b.length), pa = Math.round(100 * a.length / n), pb = 100 - pa;
  const col = (label, list, pct) => '<div class="bar"><div class="lb"><span>' + esc(label) + "</span><span>" + pct + ' %</span></div><div class="tr"><div class="fl" style="width:' + pct + '%"></div></div><span class="vt">' + (list.length ? esc(list.map(nameOf).join(", ")) : "Personne") + "</span></div>";
  return '<div class="bars">' + col(p[0], a, a.length + b.length ? pa : 0) + col(p[1], b, a.length + b.length ? pb : 0) + "</div>";
}
// Coups de théâtre (réseau). Les points ne viennent que d'eux : le vainqueur est celui qui en a le plus.
const CHRONO = 12;
const TW = [
  { id: "predict", name: "Pronostic", desc: "Choisis, puis parie sur le choix de la majorité : +1 point si tu as vu juste." },
  { id: "tele", name: "Télépathie", desc: "Devine aussi le choix d'un joueur tiré au sort : +1 point si tu trouves.", ok: o => o.n >= 2 },
  { id: "devil", name: "Avocat du diable", desc: "Après le vote, un joueur tiré au sort défend le camp opposé au sien pendant 30 secondes." },
  { id: "chrono", name: "Chrono " + CHRONO + " secondes", desc: "Le vote se ferme au bout de " + CHRONO + " secondes. Trop tard, c'est trop tard." },
  { id: "lock", name: "Pas de retour", desc: "Ton premier choix est définitif." },
  { id: "rare", name: "Prime au courage", desc: "Le camp minoritaire gagne 2 points chacun.", ok: o => o.n >= 3 },
  { id: "maj", name: "Suivez le troupeau", desc: "Le camp majoritaire gagne 1 point chacun.", ok: o => o.n >= 3 }
];
const TWL = [
  { id: "predict", name: "Pronostic", desc: "Avant de lever la main, chacun annonce le choix qui va gagner. Ceux qui se trompent choisissent la question suivante." },
  { id: "chrono", name: "Chrono 5 secondes", desc: "Vous avez 5 secondes pour lever la main. Pas de main levée, pas d'avis !" },
  { id: "devil", name: "Avocat du diable", desc: "Le premier à lever la main défend le camp opposé pendant 30 secondes." },
  { id: "rare", name: "La minorité décide", desc: "Le camp le moins nombreux choisit un petit gage pour l'autre camp." },
  { id: "swap", name: "Retournement", desc: "La majorité a une minute pour convaincre quelqu'un d'en face de changer de camp." },
  { id: "blind", name: "Les yeux fermés", desc: "Tout le monde ferme les yeux pour voter, et on les rouvre ensemble." }
];
const FL = {
  duo: ["Les plus d'accord", "Les âmes sœurs", "Un cerveau pour deux"],
  anti: ["Les moins d'accord", "Chien et chat", "Jamais du même avis"],
  rebel: ["Le plus à contre-courant", "L'esprit rebelle", "Seul contre tous"],
  dither: ["Le plus indécis", "La girouette", "Change d'avis comme de chemise"],
  champ: ["Meilleur score", "Le plus fin stratège", "Le roi des coups de théâtre"]
};
function fl(list, seed, k){ return list[((seed || 0) + k) % list.length]; }
function nextTw(o, round, last, n){ return o.twists !== false && round > 1 ? SB.u.twist(TW, { last, n, rate: .4 }) : null; }
function roundExtras(c, t){
  const x = { tw: t ? t.id : "", dl: 0, tgt: {}, dev: "" };
  if(!t) return x;
  if(t.id === "chrono") x.dl = c.now() + CHRONO * 1000 + 600;
  if(t.id === "tele"){ const o = shuffle(c.ids); o.forEach((id, i) => { x.tgt[id] = o[(i + 1) % o.length]; }); }
  return x;
}
function stats(ids, hist){
  const agree = {}, minor = {};
  pairs(ids).forEach(([x, y]) => { let same = 0, both = 0; hist.forEach(([a, b]) => { const cx = a.indexOf(x) >= 0 ? "a" : b.indexOf(x) >= 0 ? "b" : "", cy = a.indexOf(y) >= 0 ? "a" : b.indexOf(y) >= 0 ? "b" : ""; if(cx && cy){ both++; if(cx === cy) same++; } }); if(both) agree[x + "|" + y] = [same, both]; });
  hist.forEach(([a, b]) => { if(a.length === b.length) return; (a.length < b.length ? a : b).forEach(id => { minor[id] = (minor[id] || 0) + 1; }); });
  const ks = Object.keys(agree).sort((k1, k2) => agree[k2][0] / agree[k2][1] - agree[k1][0] / agree[k1][1]);
  const rebel = ids.slice().sort((x, y) => (minor[y] || 0) - (minor[x] || 0))[0];
  return { agree, minor, ks, rebel };
}

SB.register({
  id: "tupref", name: "Tu préfères", glyph: "A/B", pitch: "Deux choix impossibles, chacun tranche en secret.", hot: true,
  accent: { light: "#4fd1bf", dark: "#4fd1bf" },
  tag: "Deux choix impossibles. Tout le monde vote, puis on découvre qui a choisi quoi.",
  min: 2, max: 20, ticks: true,
  rules: [
    "Deux options s'affichent. Chacun choisit en secret celle qu'il préfère.",
    "Quand tout le monde a voté, on voit qui a choisi quoi.",
    "Justifiez vos choix, surtout si vous êtes seul dans votre camp.",
    "Coups de théâtre : pronostic, télépathie, chrono, prime au courage… Ce sont eux qui rapportent des points.",
    "À la fin : le duo le plus d'accord, le plus à contre-courant, le plus indécis et le meilleur score."
  ],
  options: [
    { id: "rounds", label: "Questions", type: "seg", def: 10, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "packs", label: "Paquets", type: "multi", def: ["soft"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "De temps en temps, une règle change pour une question", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet de questions.");
    const deck = deckFor(o.packs), p = deck.pop();
    SB.u.saw(SEEN, [p]);
    ctx.setPriv({ deck });
    return Object.assign({ phase: "vote", p, round: 1, rounds: o.rounds || 10, a: [], b: [], hist: [], pts: {}, got: {}, chg: {} }, roundExtras(ctx, null));
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "vote") return;
    const tw = s.tw || "", need = tw === "predict" || tw === "tele";
    const live = ctx.ids.filter(id => ctx.here(id));
    const ok1 = i => i && (i.c === "a" || i.c === "b") && (!need || i.g === "a" || i.g === "b");
    const late = tw === "chrono" && s.dl && ctx.now() > s.dl;
    if(!late && !(live.length && live.every(id => ok1(ctx.input(id))))) return;
    const voted = ctx.ids.filter(id => ok1(ctx.input(id)));
    const a = voted.filter(id => ctx.input(id).c === "a"), b = voted.filter(id => ctx.input(id).c === "b");
    const pts = Object.assign({}, s.pts || {}), got = {}, chg = Object.assign({}, s.chg || {});
    const add = (id, n) => { got[id] = (got[id] || 0) + n; pts[id] = (pts[id] || 0) + n; };
    voted.forEach(id => { const n = +ctx.input(id).n || 0; if(n) chg[id] = (chg[id] || 0) + n; });
    const win = a.length === b.length ? "" : a.length > b.length ? "a" : "b";
    if(tw === "predict") voted.forEach(id => { if(win && ctx.input(id).g === win) add(id, 1); });
    if(tw === "tele") voted.forEach(id => { const t = (s.tgt || {})[id], ti = t ? ctx.input(t) : null; if(ti && ok1(ti) && ti.c === ctx.input(id).g) add(id, 1); });
    if(tw === "rare" && win && a.length && b.length) (win === "a" ? b : a).forEach(id => add(id, 2));
    if(tw === "maj" && win) (win === "a" ? a : b).forEach(id => add(id, 1));
    ctx.set({ phase: "res", a, b, hist: A(s.hist).concat([[a, b]]), pts, got, chg, dev: tw === "devil" && voted.length ? pick(voted) : "" });
  },
  render(ctx, root){
    const s = ctx.s, p = A(s.p), tw = s.tw || "", T = SB.u.byTwist(TW, tw);
    const lab = '<span class="eyebrow">Question ' + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T);
    if(s.phase === "vote"){
      const need = tw === "predict" || tw === "tele", tgt = (s.tgt || {})[ctx.me];
      const ask = tw === "predict" ? "Et selon toi, quel choix l'emporte ?" : tw === "tele" && tgt ? "Et qu'a choisi " + ctx.name(tgt) + " ?" : "";
      screen(root, "v" + s.k, lab + '<p class="big">Tu préfères…</p><div class="ab"><button type="button" data-c="a">' + esc(p[0]) + '</button><span class="or2">ou</span><button type="button" data-c="b">' + esc(p[1]) + "</button></div>" +
        (need ? '<span class="eyebrow">' + esc(ask) + '</span><div class="seg"><button type="button" data-g="a">' + esc(p[0]) + '</button><button type="button" data-g="b">' + esc(p[1]) + "</button></div>" : "") +
        (tw === "chrono" ? '<div class="who" data-cd></div>' : "") + "<p class=\"wait\" data-wait></p>", r => {
        let c = "", g = "", n = 0;
        const sync = () => {
          r.querySelectorAll("[data-c]").forEach(x => x.setAttribute("aria-pressed", x.dataset.c === c));
          r.querySelectorAll("[data-g]").forEach(x => x.setAttribute("aria-pressed", x.dataset.g === g));
          if(c && (!need || g)) ctx.send({ c, g, n });
        };
        r.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => {
          if(tw === "lock" && c) return;
          if(c && c !== b.dataset.c) n++;
          c = b.dataset.c; sync();
          if(tw === "lock") r.querySelectorAll("[data-c]").forEach(x => { x.disabled = true; });
        }));
        r.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { g = b.dataset.g; sync(); }));
      });
      const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && i.c && (!need || i.g); }).length;
      txt(root, "[data-wait]", (tw === "lock" ? "Choix définitif · " : "Tu peux changer d'avis tant que tout le monde n'a pas voté · ") + done + " / " + live.length);
      if(tw === "chrono") txt(root, "[data-cd]", Math.max(0, Math.ceil((s.dl - ctx.now() - 600) / 1000)) + " s");
    } else if(s.phase === "res"){
      const a = A(s.a), b = A(s.b), mine = a.indexOf(ctx.me) >= 0 ? "a" : b.indexOf(ctx.me) >= 0 ? "b" : "";
      const minority = a.length === b.length ? "" : (a.length < b.length ? "a" : "b");
      const head = !mine ? "Résultats" : (!minority ? "Groupe coupé en deux" : mine === minority ? "Tu es dans la minorité" : "Tu es avec la majorité");
      const got = s.got || {}, gk = Object.keys(got).filter(id => got[id]);
      let extra = "";
      if(gk.length) extra += '<div class="field"><span class="eyebrow">Points de la manche</span><div class="chips">' + gk.map(id => '<span class="chip ok">' + esc(ctx.name(id)) + " +" + got[id] + "</span>").join("") + "</div></div>";
      else if(tw === "predict" || tw === "tele" || tw === "rare" || tw === "maj") extra += '<p class="sm">Personne ne marque sur ce coup-là.</p>';
      if(s.dev) extra += '<p class="note-box">' + esc(ctx.name(s.dev)) + " défend le camp opposé au sien pendant 30 secondes. On écoute !</p>";
      screen(root, "r" + s.k + ctx.isHost, lab + '<span class="eyebrow">' + esc(head) + "</span>" + resHTML(p, a, b, ctx.name) + extra +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Voir le bilan" : "Question suivante") + "</button>" : '<p class="wait">L\'hôte passe à la suite…</p>'), r => {
        const bt = r.querySelector("[data-next]");
        if(bt) bt.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "res") return;
          if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
          let deck = A(c.priv().deck).map(A); if(!deck.length) deck = deckFor(c.opts.packs);
          const np = deck.pop(); c.setPriv({ deck }); SB.u.saw(SEEN, [np]);
          const t = nextTw(c.opts, st.round + 1, st.tw, c.ids.length);
          c.set(Object.assign({ phase: "vote", p: np, round: st.round + 1, a: [], b: [], got: {}, k: c.rid() }, roundExtras(c, t)));
        }));
      });
    } else if(s.phase === "end"){
      const hist = A(s.hist).map(h => [A(A(h)[0]), A(A(h)[1])]);
      const ids = ctx.ids, st = stats(ids, hist), agree = st.agree, ks = st.ks, chg = s.chg || {}, pts = s.pts || {}, seed = s.fl;
      const duo = k => k ? esc(ctx.name(k.split("|")[0])) + " & " + esc(ctx.name(k.split("|")[1])) + " · " + Math.round(100 * agree[k][0] / agree[k][1]) + " %" : "—";
      const dith = ids.slice().sort((x, y) => (chg[y] || 0) - (chg[x] || 0))[0];
      const best = ids.slice().sort((x, y) => (pts[y] || 0) - (pts[x] || 0))[0];
      const card = (t, big, sm) => '<div class="card"><span class="eyebrow">' + esc(t) + '</span><div class="big">' + big + "</div>" + (sm ? '<span class="sm">' + esc(sm) + "</span>" : "") + "</div>";
      screen(root, "end" + ctx.isHost, '<span class="eyebrow">Bilan</span>' +
        (pts[best] ? card(fl(FL.champ, seed, 0), esc(ctx.name(best)), (pts[best] || 0) + " point" + (pts[best] > 1 ? "s" : "") + " grâce aux coups de théâtre") : "") +
        card(fl(FL.duo, seed, 1), duo(ks[0])) +
        (ks.length > 1 ? card(fl(FL.anti, seed, 2), duo(ks[ks.length - 1])) : "") +
        card(fl(FL.rebel, seed, 3), esc(ctx.name(st.rebel)), "Seul ou presque " + (st.minor[st.rebel] || 0) + " fois") +
        (chg[dith] ? card(fl(FL.dither, seed, 4), esc(ctx.name(dith)), "A changé d'avis " + chg[dith] + " fois") : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, mx = Math.max.apply(null, c.ids.map(id => pp[id] || 0).concat([0]));
          const lines = ["Le plus à contre-courant : " + c.name(st.rebel)];
          if(mx) lines.unshift(fl(FL.champ, seed, 0) + " : " + c.ids.filter(id => (pp[id] || 0) === mx).map(c.name).join(" & ") + " · " + mx + " pts");
          c.end({ title: fl(FL.duo, seed, 1) + " : " + (ks[0] ? ks[0].split("|").map(c.name).join(" & ") : "—"), lines, win: mx ? c.ids.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
    }
  },
  local: {
    start(root, api){
      let sel = A(store().tpPacks).length ? A(store().tpPacks).slice() : ["soft"], deck = [], p = null, n = 0, tw = null, twOn = store().tpTw !== false, cd = 0;
      api.onTick(() => {
        if(!cd) return;
        const left = Math.max(0, Math.ceil((cd - Date.now()) / 1000)), el = root.querySelector("[data-cd]");
        if(el) el.textContent = left ? left + "…" : "Levez la main !";
        if(!left) cd = 0;
      });
      const go = phase => {
        if(phase === "setup"){
          screen(root, "setup" + sel.join() + twOn, '<p class="howto">Mode cartes : lisez les deux choix, et chacun lève la main pour A ou pour B. Puis débattez.</p>' +
            '<div class="field"><span class="eyebrow">Paquets</span>' + packButtons(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">Variante</span>' + twToggle(twOn) + "</div>" +
            '<div class="dock"><button class="btn acc" type="button" data-go>Commencer</button></div>', r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ tpPacks: sel }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ tpTw: twOn }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => { if(!sel.length){ SB.u.toast("Choisis au moins un paquet"); return; } deck = deckFor(sel); n = 0; tw = null; next(); });
          });
        } else {
          const ch = tw && tw.id === "chrono";
          screen(root, "q" + n, '<span class="eyebrow">Question ' + n + "</span>" + SB.u.twistHTML(tw) + '<p class="big">Tu préfères…</p><div class="ab"><button type="button" disabled>' + esc(p[0]) + '</button><span class="or2">ou</span><button type="button" disabled>' + esc(p[1]) + "</button></div>" +
            (ch ? '<div class="who" data-cd>5…</div>' : "") +
            '<div class="dock">' + (ch ? '<button class="btn ghost" type="button" data-cs>Relancer le chrono</button>' : "") + '<button class="btn acc" type="button" data-n>Question suivante</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button></div>', r => {
            r.querySelector("[data-n]").addEventListener("click", next);
            r.querySelector("[data-q]").addEventListener("click", api.exit);
            const cs = r.querySelector("[data-cs]"); if(cs) cs.addEventListener("click", () => { cd = Date.now() + 5000; });
          });
          if(ch) cd = Date.now() + 5000;
        }
      };
      function next(){
        if(!deck.length) deck = deckFor(sel);
        p = deck.pop(); n++; SB.u.saw(SEEN, [p]); cd = 0;
        tw = twOn && n > 1 ? SB.u.twist(TWL, { last: tw ? tw.id : "", rate: .35 }) : null;
        go("q");
      }
      go("setup");
    }
  }
});
})();
