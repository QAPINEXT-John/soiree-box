/* Qui a dit ça ? — chacun répond en secret, les réponses tombent sans les noms, à vous de trouver l'auteur. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, clean, armTap, pick } = SB.u;

const SOFT = [
  "Ton pire date en 5 mots","Le métier que tu aurais rêvé de faire","Ce que tu ne dirais jamais à ta mère","Ta pire honte au collège",
  "Le truc le plus cher que tu as acheté sur un coup de tête","Ce que tu ferais avec un million demain matin","Ton plaisir coupable","Le pire cadeau que tu as reçu",
  "Ta phobie la plus bizarre","Le mensonge que tu racontes le plus souvent","Ta pire coupe de cheveux","Ce que tu as pensé de {p} la première fois",
  "Un secret sur {p} que tu pourrais révéler","Le surnom parfait pour {p}","Ce que {p} fera dans 10 ans","La chanson que tu chantes sous la douche",
  "Ta dernière recherche Google gênante","Le pire job que tu as fait","Ton talent caché","La célébrité que tu détestes sans raison","Le film qui t'a fait pleurer",
  "Ta pire cuite en une phrase","Ce que tu volerais dans un musée","Ta dernière grosse colère","L'excuse la plus nulle que tu as donnée pour annuler",
  "Les 3 trucs que tu emportes sur une île déserte","Le plat que tu ne peux pas avaler","Le pire conseil qu'on t'a donné","Le titre de ton autobiographie",
  "Ton rêve le plus bizarre","Ta plus grosse bêtise d'enfant","Ce que tu fais quand tu es seul chez toi","La règle que tu briserais si personne ne regardait",
  "Ce qui te rend jaloux","Le pire prénom que tu pourrais donner à un enfant","La phrase que tu dis tout le temps","Ton plus gros fail en public",
  "Ce que tu as déjà fait pour éviter quelqu'un","Le message que tu regrettes d'avoir envoyé","Ce que tu dirais au toi d'il y a 10 ans","Ta théorie du complot préférée",
  "Le pire endroit où tu t'es endormi","Ce que tu caches dans ta chambre","Ta dernière dispute pour un truc débile","Le personnage de fiction dont tu étais amoureux",
  "La pire chose que tu as mangée","L'appli que tu ouvres le plus, et pourquoi","Un truc que tu n'as jamais avoué à {p}","Ce qui t'agace le plus chez les gens",
  "Ta pire tenue de soirée","Ce que tu ferais si tu étais invisible une journée","Le pire surnom qu'on t'a donné","Ce que tu changerais chez {p}",
  "La pire chose que tu as dite à un prof","Ton premier crush en 3 mots","Ce que tu fais en douce au travail ou en cours",
  "Complète : « Je ne l'ai jamais dit à personne, mais… »","Complète : « Ma plus grande fierté inutile, c'est… »","Complète : « Si j'étais un plat, je serais… »",
  "Complète : « Le jour où j'ai eu le plus honte, c'est quand… »","Complète : « Mon pire défaut, selon ma famille, c'est… »","Complète : « Dans une autre vie, j'étais sûrement… »",
  "Avoue : un truc que tu fais encore comme un enfant","Avoue : la dernière fois que tu as menti à quelqu'un ici","Avoue : ce que tu as vraiment pensé de cette soirée en arrivant",
  "Avoue : le truc que tu as cassé sans jamais le dire","Avoue : une série que tu regardes en cachette",
  "Prédis : ce que {p} fera demain matin","Prédis : le prochain gros achat de {p}","Prédis : la phrase que {p} dira avant la fin de la soirée",
  "Prédis : qui ici se mariera en premier, et pourquoi","Prédis : le métier de {p} dans une autre vie",
  "Écris comme {p} : son message pour annuler une soirée","Écris comme {p} : sa bio sur une appli de rencontre","Écris comme {p} : son discours de remerciement après un prix",
  "Écris comme {p} : son avis sur la pizza à l'ananas","Écris comme {p} : sa réaction en gagnant au loto",
  "Le pire conseil que tu pourrais donner à {p}","Ton excuse pour arriver en retard, version extrême","La pire idée de start-up possible",
  "Ce que tu ferais si tu dirigeais le pays pendant une journée","Le slogan de ta vie","Ton super-pouvoir le plus inutile","Ce que tu crierais en gagnant une médaille d'or",
  "Le nom de ton futur animal de compagnie","Un mot pour décrire {p}, et pas le plus gentil","Ta tactique pour quitter une soirée sans dire au revoir","Le pire endroit pour une demande en mariage"
];
const HOT = [
  "Ton fantasme le plus inavouable","Le pire endroit où tu l'as fait","Ton surnom au lit","Ta pire expérience sexuelle en 5 mots","Ce que tu as déjà fait pour séduire quelqu'un",
  "Le pire message coquin que tu as envoyé","La célébrité avec qui tu passerais une nuit","Ce que tu penses vraiment de la vie sexuelle de {p}","La personne ici avec qui tu pourrais finir la nuit",
  "Ton pire plan d'un soir","Le mot le plus gênant que tu as dit pendant l'acte","Ta technique de drague infaillible","Ton pire fiasco au lit","Ce que tu fais sur une appli de rencontre à 3 h du matin",
  "Le truc le plus bizarre qui t'excite","La pire excuse pour ne pas rappeler quelqu'un","Ton plus gros mensonge à un partenaire","Ta catégorie préférée sur un site X",
  "Le jouet que tu aimerais essayer","Ce que tu as déjà fait dans une voiture","La pire chose que tu as faite à un ex","Ce que {p} cache dans sa table de nuit",
  "Le pire moment où tu t'es fait surprendre","Ton record en une nuit","La phrase qui te fait craquer","Ce que tu ferais si tu te réveillais dans le corps de {p}",
  "Le lieu public où tu rêves de le faire","Le pire nude que tu as reçu","Ton plan cul le plus honteux en 3 mots","Ce que tu as déjà simulé","Ton plus gros tabou",
  "La blague la plus noire que tu oses raconter","Ce que tu veux qu'on fasse à ton enterrement","Le pire truc que tu as dit à un enterrement","Le truc le plus illégal que tu as fait",
  "Ce que tu regardes en navigation privée","Le pire endroit où tu as embrassé quelqu'un","Ta position préférée, décrite comme une recette de cuisine","Ce que {p} fait sûrement au lit",
  "La pire chose que tu as faite pour coucher avec quelqu'un",
  "Complète : « Au lit, je suis plutôt… »","Complète : « Mon pire rencard s'est fini par… »","Complète : « Ce qui me fait craquer chez quelqu'un, c'est… »",
  "Avoue : le dernier message coquin que tu as reçu, en 5 mots","Avoue : le contact que tu ne devrais plus avoir dans ton téléphone","Avoue : ton fantasme le plus banal",
  "Avoue : le truc le plus fou que tu as fait pour un crush","Prédis : le rencard idéal de {p}","Prédis : la phrase de drague préférée de {p}",
  "Écris comme {p} : son message de rupture","Écris comme {p} : son premier message sur une appli de rencontre","Écris comme {p} : son avis sur sa dernière nuit",
  "La pire musique pour une nuit romantique","Ton pire bisou en 5 mots","La chose la plus gênante que tu as dite à un rencard","Ce que tu ferais avec la personne à ta gauche sur une île déserte",
  "Le surnom le plus ridicule qu'on t'a donné au lit","Ce que tu caches dans ton téléphone","La pire excuse pour filer le matin","Ton plus gros râteau en une phrase",
  "Le pire endroit où tu as reçu un message coquin","Ce que tu as fait en soirée et nié le lendemain","La pire chose à crier pendant l'acte","Ce que tu demanderais au génie de la lampe, version 18+"
];
// Fausses réponses du coup de théâtre « L'imposteur » : assez vagues pour coller à presque toutes les questions.
const FAKE = [
  "Je préfère ne pas en parler","Une histoire avec un canard","Un karaoké qui a mal tourné","Ça s'est passé dans un camping","Franchement ? Rien de tout ça",
  "Ma grand-mère, sans hésiter","Un truc avec beaucoup trop de fromage","Trois mots : plus jamais ça","C'était en vacances, il faisait trop chaud","Le chat du voisin",
  "Une raclette à 4 h du matin","Un costume de pirate","Au fond d'un tiroir","Avec beaucoup trop de paillettes","Un message vocal de sept minutes",
  "Dans le noir complet","Je l'ai fait pour un pari","Un vieux sweat à capuche","Ma mère était là, évidemment","Une trottinette et beaucoup de confiance",
  "J'avais quinze ans, laissez-moi tranquille","Le réveil n'a pas sonné","Une danse improvisée sur une table","Des chaussettes dépareillées","Une erreur de groupe de discussion",
  "Je ne regrette absolument rien","Un plat surgelé et une bougie","Tout le monde s'en souvient sauf moi","Un mardi soir, sans raison","Le GPS m'a lâché"
];
const FAKE_HOT = ["Dans un ascenseur, évidemment","Avec des menottes en peluche","Le lendemain, j'ai changé de numéro","Une histoire de massage","Dans la voiture de mes parents","Je n'ai jamais rappelé","Sous la douche, en chantant"];
const PACKS = [
  { v: "soft", label: "Classique", desc: "Hontes, souvenirs, petits secrets, prédictions", list: SOFT },
  { v: "adulte", label: "Adultes", desc: "Sexe, fantasmes, tabous, humour noir", list: HOT, hot: true }
];
const SEEN = "quiadit:q", SEENF = "quiadit:fake", BOT = "bot";
function deckFor(packs){
  const sel = A(packs), pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => p.list);
  return SB.u.fresh(SEEN, pool.length ? pool : SOFT);
}
function fakeFor(packs){ const f = SB.u.fresh(SEENF, FAKE.concat(A(packs).indexOf("adulte") >= 0 ? FAKE_HOT : [])).pop(); SB.u.saw(SEENF, f); return f; }
function words(t){ return String(t || "").trim().split(/\s+/).filter(Boolean); }
function clip(t, tw){ t = clean(t, 140); return tw === "short" ? words(t).slice(0, 5).join(" ") : t; }
// Coups de théâtre : un par question au maximum, jamais à la première.
const TW = [
  { id: "short", name: "Cinq mots maximum", desc: "Réponses de 5 mots au plus : chaque mot compte." },
  { id: "fake", name: "L'imposteur", desc: "Le jeu glisse une fausse réponse. La démasquer rapporte 1 point." },
  { id: "x2", name: "Points doublés", desc: "Tous les points de cette question comptent double." },
  { id: "disg", name: "Déguisement", desc: "Réponds comme le ferait le joueur indiqué. Chaque joueur berné rapporte 2 points." },
  { id: "perfect", name: "Crime parfait", desc: "Si personne ne trouve ta réponse, tu prends 3 points bonus." },
  { id: "lone", name: "Flair solitaire", desc: "Seul à trouver l'auteur ? 3 points au lieu d'un." }
];
function pickTw(on, round, last){ return on && round > 1 ? SB.u.twist(TW, { last, rate: .4 }) : null; }
function derange(ids){ const o = shuffle(ids), m = {}; o.forEach((id, i) => { m[id] = o[(i + 1) % o.length]; }); return m; }
// Points d'une réponse : renvoie les gains par catégorie.
function scoreAnswer(aid, voters, right, tw){
  const m = tw === "x2" ? 2 : 1, d = { pts: {}, det: {}, fool: {}, fnd: {}, bot: {}, perf: {} }, add = (k, id, n) => { d[k][id] = (d[k][id] || 0) + n; };
  if(aid === BOT){ right.forEach(v => { add("pts", v, m); add("bot", v, 1); }); return d; }
  const lone = tw === "lone" && right.length === 1;
  right.forEach(v => { add("pts", v, (lone ? 3 : 1) * m); add("det", v, 1); });
  if(right.length) add("fnd", aid, right.length);
  voters.filter(v => right.indexOf(v) < 0).forEach(() => { add("pts", aid, (tw === "disg" ? 2 : 1) * m); add("fool", aid, 1); });
  if(tw === "perfect" && voters.length >= 2 && !right.length){ add("pts", aid, 3 * m); add("perf", aid, 1); }
  return d;
}
function merge(base, d){ const o = {}; Object.keys(d).forEach(k => { o[k] = Object.assign({}, base[k] || {}); Object.keys(d[k]).forEach(id => { o[k][id] = (o[k][id] || 0) + d[k][id]; }); }); return o; }
const FL = {
  win: ["Vainqueur", "Le cerveau de la soirée", "Imbattable", "Le plus fin limier"],
  det: ["Meilleur détective", "Œil de lynx", "Rien ne lui échappe"],
  fool: ["Le plus imprévisible", "Maître du bluff", "Insaisissable"],
  fnd: ["Le livre ouvert", "Trop facile à lire", "Démasqué à chaque fois"],
  bot: ["Chasseur d'imposteurs", "Détecteur de mensonges", "Pas dupe une seconde"]
};
function fl(list, seed, k){ return list[((seed || 0) + k) % list.length]; }
function awards(ids, s, nameOf){
  const out = [], seed = s.fl || 0, used = [];
  // Le meilleur pour une stat, en évitant si possible quelqu'un qui a déjà un trophée.
  const best = m => { const by = list => { let b = "", v = 0; list.forEach(id => { if((m[id] || 0) > v){ v = m[id]; b = id; } }); return b; }; const r = by(ids.filter(id => used.indexOf(id) < 0)) || by(ids); if(r) used.push(r); return r; };
  const d = best(s.det || {}); if(d) out.push([fl(FL.det, seed, 1), nameOf(d), s.det[d] + " bonne" + (s.det[d] > 1 ? "s" : "") + " réponse" + (s.det[d] > 1 ? "s" : "")]);
  const f = best(s.fool || {}); if(f) out.push([fl(FL.fool, seed, 2), nameOf(f), "A berné " + s.fool[f] + " fois"]);
  const n = best(s.fnd || {}); if(n) out.push([fl(FL.fnd, seed, 3), nameOf(n), "Démasqué " + s.fnd[n] + " fois"]);
  const b = best(s.bot || {}); if(b) out.push([fl(FL.bot, seed, 4), nameOf(b), "A repéré " + s.bot[b] + " fausse" + (s.bot[b] > 1 ? "s" : "") + " réponse" + (s.bot[b] > 1 ? "s" : "")]);
  return out;
}
function awardsHTML(aw){ return aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : ""; }
function fill(q, nm){ return q.replace(/\{p\}/g, nm); }
const CSS = '<style>.qd-a{font-family:var(--f-hand); font-weight:700; font-size:40px; line-height:1.1; overflow-wrap:anywhere; color:var(--ink)}.qd-q{font-size:17px; font-weight:700}' +
  '.qd-in{min-height:96px; resize:vertical}.qd-ok{display:flex; flex-wrap:wrap; gap:6px}.qd-rows{display:flex; flex-direction:column; gap:8px}' +
  '.qd-r{display:flex; justify-content:space-between; align-items:center; gap:10px; background:var(--card); border:1.5px solid var(--line); border-radius:14px; padding:12px 14px; font-weight:800; width:100%; text-align:left}' +
  '.qd-r[aria-pressed="true"]{border-color:var(--ok); color:var(--ok)}.qd-r .m{font-size:14px}</style>';
function scoreBars(ids, pts, nameOf){
  const max = Math.max(1, ...ids.map(id => pts[id] || 0));
  return '<div class="bars">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map(id => '<div class="bar"><div class="lb"><span>' + esc(nameOf(id)) + "</span><span>" + (pts[id] || 0) + ' pt' + ((pts[id] || 0) > 1 ? "s" : "") + '</span></div><div class="tr"><div class="fl" style="width:' + Math.round(100 * (pts[id] || 0) / max) + '%"></div></div></div>').join("") + "</div>";
}
function best(ids, m){ let b = "", v = 0; ids.forEach(id => { if((m[id] || 0) > v){ v = m[id]; b = id; } }); return b; }
function roundState(c, round, last){
  let deck = A(c.priv().deck).slice(); if(!deck.length) deck = deckFor(c.opts.packs);
  const q = deck.pop(); c.setPriv({ deck }); SB.u.saw(SEEN, q);
  const t = pickTw(c.opts.twists !== false, round, last), tw = t ? t.id : "";
  return { phase: "write", q, p: pick(c.ids), round, tw, fk: tw === "fake" ? fakeFor(c.opts.packs) : "", disg: tw === "disg" ? derange(c.ids) : {}, ans: [], i: 0, votes: {}, gain: {}, k: c.rid() };
}
function toGuess(c){
  const tw = c.s.tw || "";
  const real = c.ids.filter(id => { const x = c.input(id); return x && clip(x.a, tw); }).map(id => ({ id, t: clip(c.input(id).a, tw) }));
  if(real.length < 2){ return false; }
  const ans = shuffle(tw === "fake" && c.s.fk ? real.concat([{ id: BOT, t: c.s.fk }]) : real);
  c.set({ phase: "guess", ans, i: 0, votes: {}, k: c.rid() });
  return true;
}
function toReveal(c){
  const s = c.s, a = A(s.ans)[s.i]; if(!a) return;
  const votes = {};
  c.ids.forEach(id => { const x = c.input(id); if(x && x.g) votes[id] = x.g; });
  const voters = Object.keys(votes).filter(v => v !== a.id), right = voters.filter(v => votes[v] === a.id);
  const d = scoreAnswer(a.id, voters, right, s.tw || "");
  c.set(Object.assign({ phase: "rev", votes, gain: d.pts }, merge(s, d)));
}

const DEF = {
  id: "quiadit", name: "Qui a dit ça ?", glyph: "Qui ?!", pitch: "Réponses anonymes : trouve qui a écrit quoi.", hot: true,
  accent: { light: "#6cc3ff", dark: "#6cc3ff" },
  tag: "Une question, chacun répond en secret. Les réponses tombent sans les noms : à vous de trouver qui a écrit quoi.",
  min: 3, max: 12,
  rules: [
    "Une question s'affiche. Chacun écrit sa réponse en secret sur son téléphone.",
    "Les réponses apparaissent une par une, sans le nom. Tout le monde vote pour l'auteur, l'auteur aussi pour brouiller les pistes.",
    "1 point si tu trouves l'auteur. L'auteur gagne 1 point par joueur qu'il a berné.",
    "Coups de théâtre : cinq mots maximum, imposteur glissé par le jeu, déguisement, crime parfait, points doublés…",
    "Questions variées (complète, avoue, prédis, écris comme…), sans redites d'une soirée à l'autre. À la fin, le podium et des trophées."
  ],
  options: [
    { id: "rounds", label: "Questions", type: "seg", def: 3, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "packs", label: "Paquets", type: "multi", def: ["soft"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: p.list.length })) },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "De temps en temps, une règle change pour une question", def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error("Choisis au moins un paquet de questions.");
    ctx.setPriv({ deck: deckFor(o.packs) });
    return Object.assign(roundState(ctx, 1, ""), { rounds: o.rounds || 3, pts: {}, det: {}, fool: {}, fnd: {}, bot: {}, perf: {} });
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id)), tw = s.tw || "";
    if(!live.length) return;
    if(s.phase === "write"){
      if(live.every(id => { const x = ctx.input(id); return x && clip(x.a, tw); })) toGuess(ctx);
    } else if(s.phase === "guess"){
      if(live.every(id => { const x = ctx.input(id); return x && x.g; })) toReveal(ctx);
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, live = ctx.ids.filter(id => ctx.here(id)), tw = s.tw || "", T = SB.u.byTwist(TW, tw);
    const nameOf = id => id === BOT ? "L'imposteur" : ctx.name(id);
    const q = fill(s.q || "", nameOf(s.p));
    const lab = '<span class="eyebrow">Question ' + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T);
    if(s.phase === "write"){
      const mine = ctx.mine(), sent = !!(mine && clip(mine.a, tw)), dg = (s.disg || {})[me];
      screen(root, "w" + s.k + sent, CSS + lab + '<div class="card acc"><div class="big">' + esc(q) + "</div>" + (s.p === me && /\{p\}/.test(s.q) ? '<span class="sm">Oui, c\'est toi : réponds sur toi-même !</span>' : "") + "</div>" +
        (dg ? '<p class="note-box">Déguisement : réponds comme le ferait <b>' + esc(nameOf(dg)) + "</b>.</p>" : "") +
        (sent ? '<div class="sent"><span class="t">' + esc(clip(mine.a, tw)) + '</span><button class="link" type="button" data-edit>Modifier</button></div>'
          : '<textarea class="txt qd-in" maxlength="140" placeholder="' + (tw === "short" ? "5 mots maximum…" : "Ta réponse, en secret…") + '" aria-label="Ta réponse"></textarea>' + (tw === "short" ? '<p class="sm" data-wc>0 / 5 mots</p>' : "")) +
        dock((sent ? "" : '<button class="btn acc" type="button" data-send disabled>Envoyer</button>') + '<p class="wait" data-wait></p>' +
          (ctx.isHost ? '<button class="link" type="button" data-skip style="align-self:center" hidden>Continuer sans les retardataires</button>' : "")), r => {
        const ta = r.querySelector("textarea"), b = r.querySelector("[data-send]");
        if(ta){
          ta.value = "";
          ta.addEventListener("input", () => {
            const n = words(ta.value).length, over = tw === "short" && n > 5;
            b.disabled = !clean(ta.value, 140) || over;
            const wc = r.querySelector("[data-wc]"); if(wc){ wc.textContent = n + " / 5 mots" + (over ? " · trop long !" : ""); wc.style.color = over ? "var(--bad)" : ""; }
          });
          b.addEventListener("click", () => { const v = clip(ta.value, tw); if(v) ctx.send({ a: v }); });
        }
        const e = r.querySelector("[data-edit]"); if(e) e.addEventListener("click", () => { const old = clip(mine.a, tw); ctx.send({ a: "" }); setTimeout(() => { const t2 = root.querySelector("textarea"); if(t2){ t2.value = old; t2.dispatchEvent(new Event("input")); t2.focus(); } }, 60); });
        const sk = r.querySelector("[data-skip]"); if(sk) armTap(sk, () => ctx.act(c => { if(c.s.phase === "write") toGuess(c); }), "Toucher encore pour continuer");
      });
      const done = live.filter(id => { const x = ctx.input(id); return x && clip(x.a, tw); }).length;
      txt(root, "[data-wait]", done + " / " + live.length + " réponses");
      const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = done < 2 || done >= live.length;
    } else if(s.phase === "guess" || s.phase === "rev"){
      const ans = A(s.ans), a = ans[s.i] || { id: "", t: "" }, authors = ans.map(x => x.id);
      const head = lab + '<p class="qd-q">' + esc(q) + '</p><span class="eyebrow">Réponse ' + (s.i + 1) + " / " + ans.length + '</span><div class="card acc"><div class="qd-a">« ' + esc(a.t) + " »</div></div>";
      if(s.phase === "guess"){
        const mine = ctx.mine(), voted = mine && mine.g;
        screen(root, "g" + s.k + (voted || ""), CSS + head + (a.id === me ? '<p class="note-box">C\'est ta réponse ! Vote quand même pour quelqu\'un d\'autre, pour brouiller les pistes.</p>' : '<span class="eyebrow">Qui a écrit ça ?</span>') +
          '<div class="choices">' + authors.filter(id => id !== me).map(id => '<button type="button" class="opt" data-v="' + esc(id) + '" aria-pressed="' + (voted === id) + '">' + esc(id === BOT ? "L'imposteur (le jeu)" : nameOf(id)) + "</button>").join("") + "</div>" +
          dock('<p class="wait" data-wait></p>' + (ctx.isHost ? '<button class="link" type="button" data-skip style="align-self:center" hidden>Révéler sans attendre</button>' : "")), r => {
          r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => ctx.send({ g: b.dataset.v })));
          const sk = r.querySelector("[data-skip]"); if(sk) armTap(sk, () => ctx.act(c => { if(c.s.phase === "guess") toReveal(c); }), "Toucher encore pour révéler");
        });
        const done = live.filter(id => { const x = ctx.input(id); return x && x.g; }).length;
        txt(root, "[data-wait]", (voted ? "Vote enregistré · " : "") + done + " / " + live.length + " votes");
        const sk = root.querySelector("[data-skip]"); if(sk) sk.hidden = done < 1 || done >= live.length;
      } else {
        const votes = s.votes || {}, voters = Object.keys(votes).filter(v => v !== a.id);
        const right = voters.filter(v => votes[v] === a.id), wrong = voters.filter(v => votes[v] !== a.id), gain = s.gain || {};
        const lastA = s.i + 1 >= ans.length, lastQ = s.round >= s.rounds, isBot = a.id === BOT;
        let note = "";
        if(isBot) note = '<p class="sm">Fausse réponse glissée par le jeu. ' + (right.length ? "Bien vu !" : "Tout le monde s'est fait avoir.") + "</p>";
        else if(wrong.length) note = '<p class="sm">' + esc(nameOf(a.id)) + " a berné " + wrong.length + " joueur" + (wrong.length > 1 ? "s" : "") + " : " + esc(wrong.map(v => nameOf(v) + " (" + nameOf(votes[v]) + ")").join(", ")) + "</p>";
        if(tw === "perfect" && !isBot && !right.length && voters.length >= 2) note += '<p class="note-box">Crime parfait ! ' + esc(nameOf(a.id)) + " prend 3 points bonus.</p>";
        if(tw === "lone" && right.length === 1 && !isBot) note += '<p class="note-box">Flair solitaire : ' + esc(nameOf(right[0])) + " est seul à trouver, +3 !</p>";
        const gk = Object.keys(gain).filter(id => gain[id]);
        screen(root, "r" + s.k + ctx.isHost, CSS + head + '<span class="eyebrow">C\'était</span><div class="who">' + esc(nameOf(a.id)) + "</div>" +
          '<div class="field"><span class="eyebrow">Ont trouvé</span><div class="qd-ok">' + (right.length ? right.map(v => '<span class="chip ok">' + esc(nameOf(v)) + "</span>").join("") : '<span class="sm">Personne !</span>') + "</div></div>" + note +
          (gk.length ? '<p class="sm">Points : ' + esc(gk.map(id => nameOf(id) + " +" + gain[id]).join(", ")) + "</p>" : "") +
          '<div class="field"><span class="eyebrow">Scores</span>' + scoreBars(ctx.ids, s.pts || {}, nameOf) + "</div>" +
          dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (!lastA ? "Réponse suivante" : lastQ ? "Voir le podium" : "Question suivante") + "</button>" : '<p class="wait">L\'hôte passe à la suite…</p>'), r => {
          const b = r.querySelector("[data-next]");
          if(b) b.addEventListener("click", () => ctx.act(c => {
            const st = c.s; if(st.phase !== "rev") return;
            if(st.i + 1 < A(st.ans).length){ c.set({ phase: "guess", i: st.i + 1, votes: {}, gain: {}, k: c.rid() }); return; }
            if(st.round >= st.rounds){ c.set({ phase: "end", fl: Math.floor(Math.random() * 12) }); return; }
            c.set(roundState(c, st.round + 1, st.tw));
          }));
        });
      }
    } else if(s.phase === "end"){
      const pts = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + esc(fl(FL.win, s.fl, 0)) + '</span><div class="who">' + esc(nameOf(order[0])) + "</div>" + scoreBars(ctx.ids, pts, nameOf) +
        awardsHTML(awards(ctx.ids, s, nameOf)) +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const p = c.s.pts || {}, o2 = c.ids.slice().sort((x, y) => (p[y] || 0) - (p[x] || 0)), mx = p[o2[0]] || 0;
          c.end({ title: "Qui a dit ça ? · " + c.name(o2[0]) + " gagne", lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (p[id] || 0) + " pts").concat(awards(c.ids, c.s, c.name).slice(0, 2).map(a => a[0] + " : " + a[1])),
            win: mx ? o2.filter(id => (p[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : on se le passe pour écrire, puis on devine ensemble ---------- */
  local: {
    players: { min: 3, max: 12 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => id === BOT ? "L'imposteur" : names[+id];
      let sel = A(store().qdPacks).length ? A(store().qdPacks).slice() : ["soft"];
      let rounds = [3, 5, 8].indexOf(store().qdRounds) >= 0 ? store().qdRounds : 3, twOn = store().qdTw !== false;
      let deck = [], round = 0, q = "", w = 0, ans = [], i = 0, found = [], st = {}, tw = null, disg = {}, fk = "", gain = {}, seed = 0;
      const qOf = () => fill(q.t, nameOf(q.p)), t = () => (tw ? tw.id : "");
      function newRound(){
        if(!deck.length) deck = deckFor(sel);
        q = { t: deck.pop(), p: pick(ids) }; SB.u.saw(SEEN, q.t); round++; w = 0; ans = [];
        tw = pickTw(twOn, round, t()); disg = t() === "disg" ? derange(ids) : {}; fk = t() === "fake" ? fakeFor(sel) : "";
        go("pass");
      }
      const go = ph => {
        if(ph === "setup"){
          screen(root, "su" + sel.join() + rounds + twOn, CSS + '<p class="howto">Chacun à son tour prend le téléphone et écrit sa réponse en secret. Ensuite, les réponses s\'affichent une par une : devinez ensemble qui a écrit quoi.</p>' +
            '<div class="field"><span class="eyebrow">Questions</span><div class="seg">' + [3, 5, 8].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (n === rounds) + '">' + n + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Paquets</span><div class="packs">' + PACKS.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Variante</span><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">Coups de théâtre</span><span class="ds">De temps en temps, une règle change pour une question</span></span></button></div></div>' +
            dock('<button class="btn acc" type="button" data-go>Commencer</button>'), r => {
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ qdRounds: rounds }); go("setup"); }));
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ qdPacks: sel }); go("setup"); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ qdTw: twOn }); go("setup"); });
            r.querySelector("[data-go]").addEventListener("click", () => { if(!sel.length){ SB.u.toast("Choisis au moins un paquet"); return; } deck = deckFor(sel); round = 0; st = {}; tw = null; seed = Math.floor(Math.random() * 12); newRound(); });
          });
        } else if(ph === "pass"){
          screen(root, "pa" + round + "-" + w, '<span class="eyebrow">Question ' + round + " / " + rounds + "</span>" + (w === 0 ? SB.u.twistHTML(tw) : "") + '<div class="pass"><span class="eyebrow">Passe le téléphone à</span><div class="who">' + esc(names[w]) + "</div><p>Les autres, ne regardez pas l'écran.</p></div>" +
            dock('<button class="btn acc" type="button" data-n>C\'est moi</button>'), r => r.querySelector("[data-n]").addEventListener("click", () => go("write")));
        } else if(ph === "write"){
          const dg = disg[String(w)];
          screen(root, "wr" + round + "-" + w, CSS + '<span class="eyebrow">' + esc(names[w]) + "</span>" + SB.u.twistHTML(tw) + '<div class="card acc"><div class="big">' + esc(qOf()) + "</div></div>" +
            (dg ? '<p class="note-box">Déguisement : réponds comme le ferait <b>' + esc(nameOf(dg)) + "</b>.</p>" : "") +
            '<textarea class="txt qd-in" maxlength="140" placeholder="' + (t() === "short" ? "5 mots maximum…" : "Ta réponse, en secret…") + '" aria-label="Ta réponse"></textarea>' + (t() === "short" ? '<p class="sm" data-wc>0 / 5 mots</p>' : "") +
            dock('<button class="btn acc" type="button" data-n disabled>Valider et cacher</button>'), r => {
            const ta = r.querySelector("textarea"), b = r.querySelector("[data-n]");
            ta.addEventListener("input", () => {
              const n = words(ta.value).length, over = t() === "short" && n > 5;
              b.disabled = !clean(ta.value, 140) || over;
              const wc = r.querySelector("[data-wc]"); if(wc){ wc.textContent = n + " / 5 mots" + (over ? " · trop long !" : ""); wc.style.color = over ? "var(--bad)" : ""; }
            });
            b.addEventListener("click", () => {
              const v = clip(ta.value, t()); if(!v) return;
              ans.push({ id: String(w), t: v }); w++;
              if(w < names.length) go("pass"); else { if(fk) ans.push({ id: BOT, t: fk }); ans = shuffle(ans); i = 0; go("guess"); }
            });
          });
        } else if(ph === "guess" || ph === "rev"){
          const a = ans[i];
          const head = '<span class="eyebrow">Question ' + round + " / " + rounds + "</span>" + SB.u.twistHTML(tw) + '<p class="qd-q">' + esc(qOf()) + '</p><span class="eyebrow">Réponse ' + (i + 1) + " / " + ans.length + '</span><div class="card acc"><div class="qd-a">« ' + esc(a.t) + " »</div></div>";
          if(ph === "guess"){
            screen(root, "gu" + round + "-" + i, CSS + head + '<p class="howto">Débattez : qui a écrit ça ?' + (fk ? " Attention, l'une des réponses a été écrite par le jeu." : "") + " Chacun annonce son suspect à voix haute, puis on révèle.</p>" + dock('<button class="btn acc" type="button" data-n>Révéler l\'auteur</button>'), r => {
              r.querySelector("[data-n]").addEventListener("click", () => { found = []; go("rev"); });
            });
          } else {
            const lastA = i + 1 >= ans.length, lastQ = round >= rounds;
            screen(root, "rv" + round + "-" + i + found.join(), CSS + head + '<span class="eyebrow">C\'était</span><div class="who">' + esc(nameOf(a.id)) + "</div>" + (a.id === BOT ? '<p class="sm">Fausse réponse glissée par le jeu !</p>' : "") +
              '<span class="eyebrow">Qui a trouvé ? Touchez les prénoms</span><div class="qd-rows">' + ids.filter(id => id !== a.id).map(id => '<button type="button" class="qd-r" data-p="' + id + '" aria-pressed="' + (found.indexOf(id) >= 0) + '"><span>' + esc(nameOf(id)) + '</span><span class="m">' + (found.indexOf(id) >= 0 ? "Trouvé ✓" : "Raté") + "</span></button>").join("") + "</div>" +
              dock('<button class="btn acc" type="button" data-n>' + (!lastA ? "Réponse suivante" : lastQ ? "Voir le podium" : "Question suivante") + "</button>"), r => {
              r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const x = found.indexOf(b.dataset.p); if(x >= 0) found.splice(x, 1); else found.push(b.dataset.p); go("rev"); }));
              r.querySelector("[data-n]").addEventListener("click", () => {
                const d = scoreAnswer(a.id, ids.filter(id => id !== a.id), found.slice(), t());
                st = merge(st, d); gain = d.pts;
                const notes = [];
                if(t() === "perfect" && a.id !== BOT && !found.length) notes.push("Crime parfait ! " + nameOf(a.id) + " prend 3 points bonus.");
                if(t() === "lone" && a.id !== BOT && found.length === 1) notes.push("Flair solitaire : " + nameOf(found[0]) + " marque 3 points.");
                notes.forEach(n => SB.u.toast(n));
                if(!lastA){ i++; go("guess"); } else if(!lastQ) newRound(); else go("end");
              });
            });
          }
        } else if(ph === "end"){
          const pts = st.pts || {}, order = ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[order[0]] || 0;
          api.win(mx ? order.filter(id => (pts[id] || 0) === mx).map(nameOf) : []);
          screen(root, "end", CSS + '<span class="eyebrow">' + esc(fl(FL.win, seed, 0)) + '</span><div class="who">' + esc(nameOf(order[0])) + "</div>" + scoreBars(ids, pts, nameOf) +
            awardsHTML(awards(ids, Object.assign({ fl: seed }, st), nameOf)) +
            dock('<button class="btn acc" type="button" data-a>Rejouer</button><button class="btn ghost" type="button" data-q>Choisir un autre jeu</button>'), r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go("setup");
    }
  }
};
SB.register(DEF);
})();
