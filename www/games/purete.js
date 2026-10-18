/* Test de pureté — questionnaire secret, score en pourcentage, puis les aveux du groupe. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz } = SB.u;

const SOIREE = [
  "été ivre au point de ne plus te souvenir de ta soirée","vomi en soirée","vomi sur quelqu'un","dormi dehors après une soirée","fait un black-out complet",
  "bu de l'alcool au travail ou en cours","conduit en ayant trop bu","été viré d'un bar ou d'une boîte","fini une soirée aux urgences",
  "envoyé un message que tu as regretté le lendemain","appelé ton ex en étant bourré","menti à tes parents sur l'endroit où tu dormais",
  "raté un examen ou un rendez-vous important à cause d'une gueule de bois","dansé sur une table","fini une soirée tout nu","été réveillé par la police",
  "passé une nuit en garde à vue","volé quelque chose dans un magasin","fraudé dans les transports plus de dix fois","fait pipi dans un lieu public",
  "pris un taxi sans être capable de donner ton adresse","fait la fête plus de 24 heures d'affilée","dépensé plus de 200 € en une seule soirée",
  "menti sur ton âge pour entrer quelque part","fait semblant d'être malade pour ne pas aller travailler","été viré d'un boulot",
  "fait un tatouage sur un coup de tête","été identifié sur une photo compromettante","fini une soirée chez de parfaits inconnus","bu dans une chaussure",
  "enchaîné deux soirées sans dormir entre les deux","oublié où tu avais garé ta voiture après une soirée","perdu ton téléphone en soirée","fini une bouteille entière seul",
  "mélangé tous les alcools de la soirée dans un seul verre","dormi dans une baignoire","raté le dernier train et dormi à la gare","découvert ta soirée le lendemain grâce aux photos des autres",
  "commandé à manger à 5 h du matin","chanté au karaoké jusqu'à perdre ta voix","organisé une fête chez toi sans prévenir tes colocs","fait la fête un soir de semaine avant un examen"
];
const SEXE = [
  "embrassé quelqu'un dont tu ne connaissais pas le prénom","embrassé plus de trois personnes dans la même soirée","embrassé quelqu'un du même sexe",
  "couché avec quelqu'un le premier soir","eu un plan d'un soir","eu un plan cul régulier","recouché avec un ex après la rupture",
  "couché avec quelqu'un de ce groupe","couché avec l'ex d'un pote","couché avec un collègue","couché avec quelqu'un qui était en couple",
  "trompé quelqu'un","été trompé et l'avoir découvert","fait l'amour dans un lieu public","fait l'amour dans une voiture","fait l'amour au travail",
  "fait l'amour dans les toilettes d'un bar ou d'une boîte","fait un plan à trois","mis les pieds dans un club libertin","envoyé des nudes",
  "filmé ou photographié un moment intime, avec l'accord de l'autre","utilisé un sex toy","utilisé des menottes ou un bandeau","fait un jeu de rôle au lit",
  "simulé un orgasme","regardé du porno avec ton partenaire","regardé du porno au travail","été surpris en pleine action","surpris quelqu'un en pleine action",
  "couché avec quelqu'un rencontré sur une appli le jour même","payé pour un strip-tease privé","fait l'amour plus de cinq fois dans la même journée",
  "fait l'amour dans le lit de quelqu'un sans qu'il le sache","couché avec quelqu'un de plus de quinze ans ton aîné","fait du sexting avec quelqu'un que tu n'avais jamais vu",
  "participé à une partouze","couché avec deux personnes différentes dans la même journée","fait l'amour alors que quelqu'un dormait dans la même pièce",
  "oublié le prénom de quelqu'un avec qui tu venais de coucher","eu une relation avec deux personnes en même temps sans qu'elles le sachent",
  "fait l'amour à la plage","fait l'amour dans un ascenseur","dragué quelqu'un uniquement pour rendre ton ex jaloux","eu une aventure pendant des vacances",
  "fait l'amour chez tes parents pendant qu'ils étaient là","eu une aventure avec un voisin ou une voisine","fait l'amour plus de trois heures d'affilée","échangé des photos coquines avec quelqu'un de cette pièce",
  "acheté de la lingerie spécialement pour un rendez-vous","fait l'amour sous une tente","fini un premier rendez-vous au lit avant le dessert","eu un plan d'un soir avec quelqu'un rencontré le soir même dans un bar"
];
const INTERDIT = [
  "fumé du cannabis","pris une drogue plus forte que le cannabis","vendu quelque chose d'illégal","été arrêté par la police",
  "escaladé un endroit interdit (toit, grue, monument)","pénétré dans un lieu abandonné ou interdit","fait un excès de vitesse de plus de 50 km/h",
  "triché à un examen important","menti sur ton CV","fouillé dans le téléphone de ton partenaire","créé un faux compte pour espionner quelqu'un",
  "lu les messages privés de quelqu'un en cachette","gardé l'argent d'un portefeuille trouvé","quitté un restaurant sans payer",
  "cassé quelque chose et accusé quelqu'un d'autre","menti à la police","dit « je t'aime » sans le penser","gardé un secret qui pourrait détruire un couple",
  "piqué de l'argent à tes parents","fait croire à une maladie pour obtenir quelque chose",
  "conduit sans permis","fait le mur pour sortir la nuit","menti à un contrôleur pour éviter une amende","emporté autre chose que les savons d'un hôtel",
  "ouvert le courrier de quelqu'un d'autre","gonflé une note de frais","utilisé le compte de streaming de quelqu'un sans lui demander","inventé un décès pour sécher",
  "imité la signature de tes parents","acheté de l'alcool avant l'âge légal","revendu un cadeau qu'on t'avait offert"
];
const COEUR = [
  "ghosté quelqu'un après plusieurs rendez-vous","été ghosté","dit « je t'aime » dès le premier mois","rompu par message",
  "stalké le nouveau partenaire de ton ex","menti sur ton métier pour séduire quelqu'un","utilisé une photo retouchée sur une appli de rencontre","dragué quelqu'un de déjà pris",
  "été amoureux de deux personnes en même temps","écrit une lettre d'amour que tu n'as jamais envoyée","écrit à ton ex au milieu de la nuit","fait une scène de jalousie en public",
  "fait semblant d'adorer un cadeau de ton partenaire","oublié un anniversaire de couple","rompu le jour de l'anniversaire de l'autre","craqué pour le partenaire d'un ami",
  "été en couple avec deux personnes du même groupe d'amis","rompu puis recommencé plus de deux fois avec la même personne","annulé un rendez-vous avec une fausse excuse","quitté un date avant la fin tellement c'était raté",
  "pleuré une rupture devant tes collègues","gardé un cadeau d'un ex en souvenir… et en cachette"
];
const BOULOT = [
  "dormi sur ton lieu de travail","fait une sieste dans les toilettes du bureau","envoyé un message moqueur à la personne dont tu te moquais","menti en entretien d'embauche",
  "copié sur ton voisin pendant un examen","rendu un devoir écrit par quelqu'un d'autre","inventé une panne de réveil pour justifier un retard","quitté un job sans prévenir personne",
  "critiqué ton chef sans savoir qu'il pouvait t'entendre","fait semblant de travailler pendant une journée entière","coupé ta caméra en visio pour faire tout autre chose","gardé ton bas de pyjama pendant une visio",
  "piqué des fournitures au bureau","pris un arrêt pour partir en week-end","séché plus de la moitié des cours d'un semestre","raté un examen à cause d'une soirée la veille",
  "pleuré dans les toilettes du travail","réussi un examen sans avoir ouvert un seul cours","démissionné sur un coup de tête","postulé en douce pour le poste de ton chef"
];
const VOYAGE = [
  "raté un avion","voyagé sans avoir réservé de logement","dormi dans un aéroport","perdu ton passeport ou ta carte d'identité en voyage",
  "fait du stop","vécu une histoire de vacances que personne ne connaît","menti sur tes vacances pour impressionner quelqu'un","acheté un billet d'avion la veille sur un coup de tête",
  "fait un bain de minuit tout nu","été malade dans un bus ou un bateau","dépensé tout ton budget vacances en trois jours","menti à la douane",
  "dormi à la belle étoile sans tente","été perdu dans une ville étrangère sans batterie","pris une photo interdite dans un musée","prolongé tes vacances sans prévenir ton travail"
];
const HONTE = [
  "appelé un prof « maman » ou « papa »","répondu à un coucou qui ne t'était pas destiné","raté une marche devant tout le monde","envoyé une capture d'écran à la personne dont il était question",
  "répondu « vous aussi » au serveur qui te souhaitait bon appétit","liké une vieille photo en stalkant quelqu'un","chanté à tue-tête avec un casque sans savoir qu'on t'entendait","appelé ton partenaire par le prénom de ton ex",
  "été surpris en train de parler tout seul","été surpris en train de danser devant un miroir","oublié le prénom de quelqu'un juste avant de le présenter","eu un fou rire à un moment totalement déplacé",
  "ri si fort que ta boisson est ressortie par le nez","fait tomber ton téléphone dans les toilettes","porté un vêtement à l'envers toute une journée","foncé dans une porte vitrée",
  "mangé un truc tombé par terre devant des invités","eu le ventre qui gargouille pendant un grand silence","fait semblant d'avoir lu un livre dont tout le monde parlait","posté une story pour une seule personne",
  "menti sur tes goûts pour plaire à quelqu'un","envoyé un message vocal sans faire exprès"
];
const PACKS = [
  { v: "soiree", label: "Soirées & excès", desc: "Alcool, fêtes, galères", list: SOIREE },
  { v: "sexe", label: "Sexe & couple", desc: "Plans d'un soir, infidélités, expériences", list: SEXE, hot: true },
  { v: "interdit", label: "Interdit & limites", desc: "Police, drogues, mensonges, coups bas", list: INTERDIT, hot: true },
  { v: "coeur", label: "Cœur & ex", desc: "Ruptures, ghosting, jalousie", list: COEUR },
  { v: "boulot", label: "Boulot & études", desc: "Retards, triches, siestes clandestines", list: BOULOT },
  { v: "voyage", label: "Voyages", desc: "Vols ratés, aventures, passeports perdus", list: VOYAGE },
  { v: "honte", label: "Moments gênants", desc: "Les hontes qu'on n'avoue jamais", list: HONTE }
];
const ALL = PACKS.flatMap(p => p.list.map(q => ({ pack: p.v, q })));
const QIX = {}; ALL.forEach((x, i) => { QIX[x.q] = i; });
const PREFIX = "As-tu déjà…";
const TITLES = [
  [90, [["Ange tombé du ciel", "Pur comme de l'eau de roche. Personne ne te croit."], ["Auréole certifiée", "Tu as forcément menti au moins une fois. Non ?"], ["Page blanche", "Ta vie est un livre blanc. Très, très blanc."]]],
  [75, [["Plutôt sage", "Quelques écarts, rien de grave. Pour l'instant."], ["Enfant de chœur repenti", "Tu as goûté au vice, du bout des lèvres."], ["Sage avec options", "Un dossier léger, mais un dossier quand même."]]],
  [55, [["Bien vécu", "Tu as des histoires à raconter, et tu les racontes."], ["Vie bien remplie", "Tes souvenirs valent un podcast."], ["Équilibriste", "Un pied dans la sagesse, l'autre dans le chaos."]]],
  [35, [["Sulfureux", "Ta réputation te précède. Tes parents ne savent pas tout."], ["Dossier épais", "Ton casier moral mérite deux classeurs."], ["Tentation ambulante", "Les ennuis te trouvent, et tu leur ouvres la porte."]]],
  [-1, [["Démon certifié", "Il n'y a plus rien de pur chez toi. Respect."], ["Légende noire", "On racontera tes exploits pendant des générations."], ["Chaos incarné", "Même le diable prend des notes."]]]
];
function title(pct, seed){ const b = TITLES.find(t => pct >= t[0]) || TITLES[TITLES.length - 1]; return b[1][(+seed || 0) % b[1].length]; }
// Questions choisies parmi les thèmes, en commençant par celles jamais vues sur ce téléphone.
function pickQuestions(packs, n){
  const sel = A(packs).length ? A(packs) : PACKS.map(p => p.v);
  let d = SB.u.fresh("purete:q", ALL.filter(x => sel.indexOf(x.pack) >= 0).map(x => x.q));
  if(n) d = d.slice(-n);
  SB.u.saw("purete:q", d);
  return shuffle(d.map(q => QIX[q]));
}
/* ---------- Rejouabilité : questions piégées ---------- */
const TW = [
  { id: "x2", name: "Question piège", desc: "Un « oui » ici compte double dans ton score." },
  { id: "x3", name: "Question fatale", desc: "Un « oui » ici compte triple. Courage." },
  { id: "free", name: "Joker", desc: "Un « oui » ici ne te coûte rien… mais il apparaîtra dans les aveux." },
  { id: "gold", name: "Question en or", desc: "Un « jamais » ici te fait regagner des points." },
  { id: "reveal", name: "Révélation", desc: "Ceux qui disent oui seront nommés, même si les aveux sont anonymes.", ok: o => o.n > 1 },
  { id: "story", name: "Raconte !", desc: "Parmi les « oui », un nom sera tiré au sort pour raconter l'histoire.", ok: o => o.n > 1 },
  { id: "suspense", name: "Suspense", desc: "Aux aveux, le nombre de « oui » restera caché : pariez avant de le révéler.", ok: o => o.n > 1 }
];
// Place quelques coups de théâtre dans le questionnaire (jamais sur la première question).
function placeTwists(len, on, n){
  if(!on || len < 8) return [];
  const cnt = Math.max(2, Math.min(6, Math.round(len / 12))), pos = shuffle(Array.from({ length: len - 1 }, (_, i) => i + 1)).slice(0, cnt).sort((a, b) => a - b);
  let last = ""; const out = [];
  pos.forEach(p => { const t = SB.u.twist(TW, { rate: 1, last, n }); if(t){ out.push([p, t.id]); last = t.id; } });
  return out;
}
function twMap(tw){ const m = {}; A(tw).map(A).forEach(x => { m[+x[0]] = String(x[1]); }); return m; }
function score(ans, tw){
  const s = String(ans || ""), m = twMap(tw); if(!s.length) return 100;
  let W = 0, bad = 0;
  for(let i = 0; i < s.length; i++){
    const t = m[i], w = t === "x2" ? 2 : t === "x3" ? 3 : t === "free" ? 0 : 1;
    W += w; if(s[i] === "1") bad += w; else if(t === "gold") bad -= 1;
  }
  return Math.max(0, Math.min(100, Math.round(100 * (1 - bad / Math.max(1, W)))));
}
function hsh(x){ let h = 7; String(x).split("").forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; }
const AW = {
  pure: ["Le plus pur", "L'ange de la bande", "Casier vierge"],
  demon: ["Le démon de la bande", "Le diable en personne", "Mauvaise influence officielle"],
  solo: ["Seul au monde", "L'aveu en solitaire", "Le seul à avoir osé"],
  trap: ["Tombé dans tous les pièges", "Roi des questions piège", "Aimant à embrouilles"]
};
const aw = (k, seed) => AW[k][(+seed || 0) % AW[k].length];
const CSS = '<style>.pu-q{font-size:28px; font-weight:800; line-height:1.2; overflow-wrap:anywhere}' +
  '.pu-bar{height:8px; border-radius:99px; background:var(--soft); overflow:hidden}.pu-bar i{display:block; height:100%; background:var(--acc); transition:width .2s}' +
  '.pu-yn{display:grid; grid-template-columns:1fr 1fr; gap:10px}.pu-yn .btn{min-height:84px; font-size:22px}' +
  '.pu-score{font-family:var(--f-hand); font-weight:700; font-size:110px; line-height:.9; color:var(--acc)}' +
  '.pu-rank{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}' +
  '.pu-rank li{display:flex; align-items:center; gap:12px; background:var(--card); border:1.5px solid var(--line); border-radius:14px; padding:10px 14px}' +
  '.pu-rank .p{font-family:var(--f-hand); font-weight:700; font-size:34px; color:var(--acc); min-width:2.6em; text-align:right; font-variant-numeric:tabular-nums}' +
  '.pu-rank .n{flex:1; min-width:0; display:flex; flex-direction:column}.pu-rank .n b{font-size:17px}' +
  '.pu-av{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}' +
  '.pu-av li{background:var(--card); border:1.5px solid var(--line); border-radius:12px; padding:10px 14px; display:flex; flex-direction:column; gap:4px}' +
  '.pu-av .c{font-weight:800; color:var(--acc)}.pu-av li.tw{border-style:dashed; border-color:var(--acc)}.pu-tw{font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--acc)}' +
  '.pu-sus{min-height:40px; padding:6px 14px; font-size:14px; align-self:flex-start}</style>';

/* Questionnaire réutilisé en réseau et sur un seul téléphone */
function runQuiz(root, key, qi, onDone, header, note, tw){
  const tm = twMap(tw);
  const saved = (store().puRun || {});
  let st = saved.key === key ? { i: saved.i || 0, a: String(saved.a || "") } : { i: 0, a: "" };
  const save = () => persist({ puRun: { key, i: st.i, a: st.a } });
  const draw = () => {
    if(st.i >= qi.length){ persist({ puRun: null }); onDone(st.a); return; }
    const q = ALL[qi[st.i]];
    screen(root, "q" + key + "|" + st.i, CSS + (header || "") + SB.u.twistHTML(SB.u.byTwist(TW, tm[st.i])) + '<div class="pu-bar"><i style="width:' + Math.round(100 * st.i / qi.length) + '%"></i></div>' +
      '<span class="eyebrow">Question ' + (st.i + 1) + " / " + qi.length + "</span>" +
      '<div class="card acc"><span class="eyebrow">' + PREFIX + '</span><div class="pu-q">… ' + esc(q.q) + " ?</div></div>" +
      '<p class="sm">' + esc(note || "Réponds honnêtement. Les autres ne verront que ton score et le nombre de « oui » par question, sauf si l'hôte a désactivé l'anonymat.") + "</p>" +
      dock('<div class="pu-yn"><button class="btn ghost" type="button" data-a="0">Jamais</button><button class="btn acc" type="button" data-a="1">Oui, déjà</button></div>' +
        (st.i ? '<button class="link" type="button" data-back style="align-self:center">Revenir à la question précédente</button>' : "")), r => {
      r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { buzz(8); st.a = st.a.slice(0, st.i) + b.dataset.a; st.i++; save(); draw(); }));
      const bk = r.querySelector("[data-back]"); if(bk) bk.addEventListener("click", () => { st.i = Math.max(0, st.i - 1); st.a = st.a.slice(0, st.i); save(); draw(); });
    });
  };
  draw();
}
function rankHTML(rows, seed){
  return '<ul class="pu-rank">' + rows.map(r => { const t = title(r.p, seed); return '<li><span class="p">' + r.p + '%</span><span class="n"><b>' + esc(r.name) + '</b><span class="sm">' + esc(t[0]) + "</span></span></li>"; }).join("") + "</ul>";
}
function aveuxHTML(qi, rows, anon, total, tw, key){
  const tm = twMap(tw);
  const items = qi.map((q, k) => ({ q, k, t: tm[k] || "", yes: rows.filter(r => r.a[k] === "1") })).filter(x => x.yes.length || x.t === "suspense")
    .sort((a, b) => (b.t ? 1 : 0) - (a.t ? 1 : 0) || b.yes.length - a.yes.length);
  if(!items.length) return '<p class="note-box">Personne n\'a répondu oui à quoi que ce soit. Bande d\'anges… ou de menteurs.</p>';
  return '<ul class="pu-av">' + items.map(x => {
    const t = SB.u.byTwist(TW, x.t), cnt = x.yes.length + " / " + total + " oui";
    const names = esc(x.yes.map(r => r.name).join(", "));
    const teller = x.t === "story" && x.yes.length ? x.yes[hsh(key + "|" + x.k) % x.yes.length].name : "";
    return '<li' + (t ? ' class="tw"' : "") + ">" + (t ? '<span class="pu-tw">' + esc(t.name) + "</span>" : "") + "<span>" + PREFIX + " " + esc(ALL[x.q].q) + " ?</span>" +
      (x.t === "suspense" ? '<button class="btn ghost pu-sus" type="button" data-sus="' + esc(cnt) + '">Pariez… puis révélez</button>' : '<span class="c">' + cnt + "</span>") +
      (teller ? '<span class="sm">Au tour de <b>' + esc(teller) + "</b> de raconter.</span>" : "") +
      (x.t === "reveal" ? '<span class="sm">Démasqués : ' + names + "</span>" : anon || x.t === "suspense" ? "" : '<span class="sm">' + names + "</span>") + "</li>";
  }).join("") + "</ul>";
}
function bindAveux(r){ r.querySelectorAll("[data-sus]").forEach(b => b.addEventListener("click", () => { const sp = document.createElement("span"); sp.className = "c"; sp.textContent = b.dataset.sus; b.replaceWith(sp); if(SB.fx) SB.fx.pop(sp); buzz(20); })); }
// Trophées : le plus pur, le démon, l'aveu solitaire, les questions piège.
function awardsHTML(rows, qi, tw, seed){
  if(rows.length < 2) return "";
  const tm = twMap(tw), solo = {}, trap = {};
  qi.forEach((q, k) => {
    const yes = rows.filter(r => r.a[k] === "1");
    if(yes.length === 1 && rows.length > 2) solo[yes[0].name] = (solo[yes[0].name] || 0) + 1;
    if(tm[k]) yes.forEach(r => { trap[r.name] = (trap[r.name] || 0) + 1; });
  });
  const best = m => Object.keys(m).sort((a, b) => m[b] - m[a])[0];
  const so = best(solo), tr = best(trap);
  return '<div class="card acc"><span class="eyebrow">' + esc(aw("pure", seed)) + '</span><div class="big">' + esc(rows[0].name) + " · " + rows[0].p + '%</div><span class="eyebrow">' + esc(aw("demon", seed)) + '</span><div class="big">' + esc(rows[rows.length - 1].name) + " · " + rows[rows.length - 1].p + "%</div></div>" +
    (so ? '<div class="card"><span class="eyebrow">' + esc(aw("solo", seed)) + '</span><div class="big">' + esc(so) + '</div><span class="sm">Seul à dire oui à ' + solo[so] + " question" + (solo[so] > 1 ? "s" : "") + "</span></div>" : "") +
    (tr ? '<div class="card"><span class="eyebrow">' + esc(aw("trap", seed)) + '</span><div class="big">' + esc(tr) + '</div><span class="sm">' + trap[tr] + " « oui » sur les coups de théâtre</span></div>" : "");
}

SB.register({
  id: "purete", name: "Test de pureté", glyph: "99 %", pitch: "Un test secret et sans filtre : ange ou démon ?", hot: true,
  accent: { light: "#ff8fc8", dark: "#ff8fc8" },
  tag: "Un questionnaire secret et sans filtre. Qui est l'ange de la bande, et qui est le démon ?",
  min: 1, max: 20,
  rules: [
    "Chacun répond en secret, sur son téléphone, à une série de « As-tu déjà… ? » 100 % adultes, tirés au hasard dans les thèmes choisis : soirées, sexe, interdits, cœur, boulot, voyages, moments gênants.",
    "Chaque test est différent : les questions déjà posées sur ce téléphone reviennent en dernier.",
    "Ton score de pureté : 100 % si tu n'as rien fait, et ça baisse à chaque « oui ».",
    "Quand tout le monde a fini, le classement tombe, de l'ange au démon.",
    "Puis les aveux : combien ont dit oui à chaque question, avec ou sans les noms selon le réglage de l'hôte.",
    "Coups de théâtre : quelques questions sont piégées (compte double ou triple, joker, question en or, révélation des noms, « Raconte ! », suspense)."
  ],
  options: [
    { id: "n", label: "Longueur", type: "seg", def: 40, values: [{ v: 25, label: "25" }, { v: 40, label: "40" }, { v: 60, label: "60" }, { v: 0, label: "Tout" }] },
    { id: "packs", label: "Thèmes", type: "multi", def: PACKS.map(p => p.v), values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "anon", label: "Aveux", type: "toggle", text: "Aveux anonymes", desc: "Sinon, on voit qui a dit oui à quoi", def: true },
    { id: "twists", label: "Rebondissements", type: "toggle", text: "Coups de théâtre", desc: "Des questions piégées glissées dans le test", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un thème.");
    const qi = pickQuestions(o.packs, o.n);
    return { phase: "play", qi, anon: o.anon !== false, res: [], tw: placeTwists(qi.length, o.twists !== false, ctx.ids.length), seed: Math.floor(Math.random() * 999) };
  },
  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    const n = A(s.qi).length, live = ctx.ids.filter(id => ctx.here(id));
    if(!live.length || !live.every(id => { const i = ctx.input(id); return i && typeof i.a === "string" && i.a.length === n; })) return;
    const res = live.map(id => [id, ctx.input(id).a.replace(/[^01]/g, "0")]);
    ctx.set({ phase: "res", res });
  },
  render(ctx, root){
    const s = ctx.s, qi = A(s.qi);
    if(s.phase === "play"){
      const mine = ctx.mine();
      if(mine && typeof mine.a === "string" && mine.a.length === qi.length){
        screen(root, "w" + s.k, CSS + '<span class="eyebrow">Ton score</span><div class="pu-score">' + score(mine.a, s.tw) + '%</div><p class="big">' + esc(title(score(mine.a, s.tw), s.seed)[0]) + "</p>" +
          '<p class="howto">Garde-le pour toi. Le classement s\'affiche quand tout le monde a fini.</p>' + dock('<p class="wait" data-wait></p>'));
        const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && typeof i.a === "string" && i.a.length === qi.length; }).length;
        txt(root, "[data-wait]", done + " / " + live.length + " ont terminé");
      } else {
        if(root.dataset.quiz !== s.k){ root.dataset.quiz = s.k; root.dataset.key = ""; runQuiz(root, s.k, qi, a => ctx.send({ a }), "", "", s.tw); }
      }
    } else if(s.phase === "res"){
      root.dataset.quiz = "";
      const rows = A(s.res).map(A).map(r => ({ id: r[0], name: ctx.name(r[0]), a: String(r[1] || ""), p: score(r[1], s.tw) })).sort((a, b) => b.p - a.p);
      const me = rows.find(r => r.id === ctx.me);
      screen(root, "res" + s.k + ctx.isHost, CSS + '<span class="eyebrow">Classement de pureté</span>' +
        awardsHTML(rows, qi, s.tw, s.seed) +
        rankHTML(rows, s.seed) + (me ? '<p class="appre">« ' + esc(title(me.p, s.seed)[1]) + " »</p>" : "") +
        '<div class="field"><span class="eyebrow">Les aveux' + (s.anon ? " (anonymes)" : "") + "</span>" + aveuxHTML(qi, rows, s.anon, rows.length, s.tw, s.k) + "</div>" +
        (ctx.isHost ? dock('<button class="btn acc" type="button" data-back>Retour au salon</button>') : dock('<p class="wait">L\'hôte va vous ramener au salon.</p>')), r => {
        bindAveux(r);
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const rr = A(c.s.res).map(A).map(x => ({ id: x[0], n: c.name(x[0]), p: score(x[1], c.s.tw) })).sort((a, b2) => b2.p - a.p);
          c.end({ title: rr.length ? aw("pure", c.s.seed) + " : " + rr[0].n + " (" + rr[0].p + " %)" : "Test de pureté", lines: rr.map(x => x.n + " · " + x.p + " % · " + title(x.p, c.s.seed)[0]),
            win: rr.length > 1 ? rr.filter(x => x.p === rr[0].p).map(x => x.id) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 1, max: 12 },
    start(root, api){
      const names = api.names, st = store();
      let L = { phase: "setup", packs: A(st.puPacks).filter(v => PACKS.some(p => p.v === v)), n: [25, 40, 60, 0].indexOf(st.puN) >= 0 ? st.puN : 40, anon: st.puAnon !== false, tw: st.puTw !== false, twl: [], seed: 0, qi: [], p: 0, ans: [], key: "" };
      if(!L.packs.length) L.packs = PACKS.map(p => p.v);
      const cnt = () => ALL.filter(x => L.packs.indexOf(x.pack) >= 0).length;
      const go = () => {
        if(L.phase === "setup"){
          screen(root, "setup" + JSON.stringify([L.n, L.anon, L.tw, L.packs]), CSS + '<p class="howto">Le téléphone passe de main en main. Chacun répond seul, sans regarder les réponses des autres.</p>' +
            '<p class="sm">' + cnt() + " questions 18+ dans les thèmes choisis. Celles déjà posées sur ce téléphone reviennent en dernier.</p>" +
            '<div class="field"><span class="eyebrow">Longueur</span><div class="seg">' + [25, 40, 60, 0].map(n => '<button type="button" data-n="' + n + '" aria-pressed="' + (n === L.n) + '">' + (n || "Tout") + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Thèmes</span><div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (L.packs.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Réglages</span><div class="packs">' +
            (names.length > 1 ? '<button type="button" class="pack" data-an aria-pressed="' + L.anon + '"><span class="box">✓</span><span class="tx"><span class="nm">Aveux anonymes</span><span class="ds">Sinon, on voit qui a dit oui à quoi</span></span></button>' : "") +
            '<button type="button" class="pack" data-tw aria-pressed="' + L.tw + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">Des questions piégées glissées dans le test</span></span></button></div></div>' +
            dock('<button class="btn acc" type="button" data-go>Commencer le test</button>'), r => {
            r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { L.n = +b.dataset.n; persist({ puN: L.n }); go(); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const i = L.packs.indexOf(b.dataset.k); if(i >= 0) L.packs.splice(i, 1); else L.packs.push(b.dataset.k); persist({ puPacks: L.packs }); go(); }));
            const an = r.querySelector("[data-an]"); if(an) an.addEventListener("click", () => { L.anon = !L.anon; persist({ puAnon: L.anon }); go(); });
            r.querySelector("[data-tw]").addEventListener("click", () => { L.tw = !L.tw; persist({ puTw: L.tw }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!L.packs.length){ SB.u.toast("Choisis au moins un thème"); return; }
              L.qi = pickQuestions(L.packs, L.n); L.twl = placeTwists(L.qi.length, L.tw, names.length); L.seed = Math.floor(Math.random() * 999);
              L.key = "loc" + Math.random().toString(36).slice(2); L.p = 0; L.ans = []; L.phase = names.length > 1 ? "pass" : "quiz"; go();
            });
          });
        } else if(L.phase === "pass"){
          screen(root, "pass" + L.p, '<div class="pass"><span class="eyebrow">Joueur ' + (L.p + 1) + " / " + names.length + '</span><div class="who">' + esc(names[L.p]) + "</div><p>Prends le téléphone et réponds seul. Les autres, on ne regarde pas.</p></div>" +
            dock('<button class="btn acc" type="button" data-n>C\'est moi, je commence</button>'), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "quiz"; go(); }); });
        } else if(L.phase === "quiz"){
          runQuiz(root, L.key + "-" + L.p, L.qi, a => {
            L.ans.push(a);
            if(names.length > 1 && L.p < names.length - 1){ L.phase = "done1"; } else L.phase = "res";
            go();
          }, '<span class="eyebrow">' + esc(names[L.p]) + "</span>", "Réponds honnêtement, personne ne regarde.", L.twl);
        } else if(L.phase === "done1"){
          screen(root, "d1" + L.p, '<div class="pass"><span class="eyebrow">C\'est noté</span><div class="who">Merci ' + esc(names[L.p]) + "</div><p>Ton score restera secret jusqu'à la fin. Passe le téléphone au suivant.</p></div>" +
            dock('<button class="btn acc" type="button" data-n>Joueur suivant</button>'), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.p++; L.phase = "pass"; go(); }); });
        } else if(L.phase === "res"){
          const rows = names.map((n, i) => ({ name: n, a: L.ans[i] || "", p: score(L.ans[i], L.twl) })).sort((a, b) => b.p - a.p);
          const solo = names.length === 1;
          if(!solo) api.win(rows.filter(x => x.p === rows[0].p).map(x => x.name));
          screen(root, "res" + L.key, CSS + (solo ? '<span class="eyebrow">Ton score de pureté</span><div class="pu-score">' + rows[0].p + '%</div><p class="big">' + esc(title(rows[0].p, L.seed)[0]) + '</p><p class="appre">« ' + esc(title(rows[0].p, L.seed)[1]) + " »</p>"
            : '<span class="eyebrow">Classement de pureté</span>' + awardsHTML(rows, L.qi, L.twl, L.seed) + rankHTML(rows, L.seed) + '<div class="field"><span class="eyebrow">Les aveux' + (L.anon ? " (anonymes)" : "") + "</span>" + aveuxHTML(L.qi, rows, L.anon, rows.length, L.twl, L.key) + "</div>") +
            dock('<button class="btn acc" type="button" data-a>Refaire un test</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button>'), r => {
            bindAveux(r);
            r.querySelector("[data-a]").addEventListener("click", api.again);
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go();
    }
  }
});
})();
