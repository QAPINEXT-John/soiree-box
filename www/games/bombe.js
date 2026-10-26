/* La Bombe — une syllabe (ou une catégorie) tombe, la mèche est allumée, personne ne sait quand elle explose.
   Le joueur qui a la bombe dit un mot qui va, puis la passe au suivant. Celui qui l'a quand elle explose a perdu la manche.
   En salon, la bombe saute de téléphone en téléphone. Sur un seul téléphone, on se passe le téléphone. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, tr, buzz, clean } = SB.u;
const W = s => s.split("|");
const FR = {
  syll: W("TRA|PLA|CHE|ON|OU|AN|IN|OI|CON|PRE|BLE|TION|MAN|SON|TER|RI|LA|MO|PA|GRA|BRI|CRO|FRI|STA|QUE|GUE|PHO|VI|BOU|CHA|TOU|POR|MAR|CAR|DOU|PIN|LON|TEN|VER|SOU|PER|COU|GAR|TOR|ROU|FLE|GLA|NOI|BAL|FOR|MI|NA|LO|SA|DE|PO|TI|RE|LU|ME"),
  debut: W("PA|MA|CHA|BO|TRA|RE|CO|PRE|DE|SA|LI|MON|PI|BA|GA|FA|VA|CA|PO|TA|PER|SOU|AR|EN|IN"),
  fin: W("TION|AGE|EUR|ETTE|ISTE|ABLE|MENT|ERIE|OIR|ON|ELLE|IQUE|AIN|OUR|ADE|ANCE|URE|IER|OT|ARD"),
  cat: W("un animal|un pays|une ville de France|une marque de voiture|un fruit|un légume|un métier|un sport|un prénom de fille|un prénom de garçon|un film|une série|un chanteur ou une chanteuse|un personnage de dessin animé|une boisson|un fromage|un plat|un instrument de musique|une couleur|un vêtement|une partie du corps|un objet de la cuisine|un jeu de société|un super-héros|une marque de vêtements|un réseau social ou une appli|un monument|un fleuve ou une rivière|une capitale|un oiseau|un poisson|un insecte|une fleur|un arbre|un dessert|un bonbon|une matière à l'école|un outil|un meuble|un moyen de transport|une langue|un personnage de Disney|un jeu vidéo|une marque de nourriture|une émission de télé|une célébrité française|un footballeur|un mot en anglais|un gros mot gentil|un mot qui rime avec « eau »|une chose ronde|une chose qui pique|une chose qui colle|une chose qu'on trouve à la plage|une chose qu'on emporte en vacances|une excuse pour être en retard|une chose qu'on fait le dimanche|un truc qui fait peur|un cadeau nul"),
  hot: W("un mot pour dire « faire l'amour »|un endroit insolite pour s'embrasser|une position du Kama-sutra (ou inventée)|un accessoire coquin|un surnom d'amoureux|un sous-vêtement|une partie du corps sexy|une excuse pour ne pas rappeler|un truc qui tue l'ambiance au lit|un film érotique ou sexy|une chanson pour faire l'amour|un aphrodisiaque|un fantasme classique|un mot qu'on crie (ou pas)|une appli de rencontre|une phrase de drague nulle|un lieu de premier rendez-vous|un truc qu'on fait le lendemain matin|un mot pour dire « fesses »|un mot pour dire « seins »|une boisson de séduction|une raison de rompre|un red flag|un green flag|un geste de séduction"),
  kid: W("un animal|un fruit|une couleur|un dessin animé|un personnage de Disney|un jouet|un légume|un animal de la ferme|un animal de la mer|un super-héros|un sport|un dessert|un bonbon|un vêtement|un moyen de transport|un métier|une chose qui vole|une chose ronde|une chose qu'on trouve à l'école|une chose qu'on trouve dans la chambre|une chose froide|une chose chaude|un instrument de musique|un prénom|une chose qui fait du bruit|une forme|une chose dans le ciel|un insecte|une fleur|un jeu de récré")
};
const EN = {
  syll: W("ING|TER|CON|PRE|AN|OUT|EST|CH|ST|ER|OR|AT|IN|ON|UN|AR|EN|OW|ART|ALL|AIR|ACK|ICE|OOK|EAR|OLD|ARE|ATE|INE|OUN|PL|BR|CR|GR|TR|SH|TH|WH|SP|FL"),
  debut: W("PA|MA|CHA|BO|TRA|RE|CO|PRE|DE|SA|LI|MO|PI|BA|GA|FA|VA|CA|PO|TA|PER|SU|AR|EN|IN"),
  fin: W("TION|AGE|ER|ING|IST|ABLE|MENT|LY|NESS|FUL|OUS|IC|ARD|ISH|ITY|ANCE|URE|IER|ED|EST"),
  cat: W("an animal|a country|a city|a car brand|a fruit|a vegetable|a job|a sport|a girl's name|a boy's name|a movie|a TV show|a singer|a cartoon character|a drink|a cheese|a dish|a musical instrument|a color|a piece of clothing|a body part|a kitchen object|a board game|a superhero|a clothing brand|an app or social network|a landmark|a river|a capital city|a bird|a fish|an insect|a flower|a tree|a dessert|a candy|a school subject|a tool|a piece of furniture|a way to travel|a language|a Disney character|a video game|a food brand|a TV show host|a famous person|a footballer|a French word|a mild swear word|a word that rhymes with \"go\"|something round|something sharp|something sticky|something at the beach|something you pack for holidays|an excuse for being late|something you do on Sundays|something scary|a terrible gift"),
  hot: W("a word for \"having sex\"|a weird place to kiss|a Kama Sutra position (or made up)|a naughty accessory|a lovers' nickname|a piece of underwear|a sexy body part|an excuse not to call back|a mood killer in bed|a sexy movie|a song to make love to|an aphrodisiac|a classic fantasy|something you shout (or not)|a dating app|a terrible pickup line|a first date spot|a morning-after thing|a word for \"butt\"|a word for \"boobs\"|a seductive drink|a reason to break up|a red flag|a green flag|a flirting move"),
  kid: W("an animal|a fruit|a color|a cartoon|a Disney character|a toy|a vegetable|a farm animal|a sea animal|a superhero|a sport|a dessert|a candy|a piece of clothing|a way to travel|a job|something that flies|something round|something at school|something in your bedroom|something cold|something hot|a musical instrument|a first name|something noisy|a shape|something in the sky|an insect|a flower|a playground game")
};
const PACKS = [
  { v: "syll", label: tr("Syllabe dans le mot", "Syllable inside"), desc: tr("Un mot qui contient « TRA » : tracteur, patrouille…", "A word containing \"ING\": king, singer…"), kind: "syll" },
  { v: "debut", label: tr("Ça commence par…", "Starts with…"), desc: tr("Un mot qui commence par « CHA »", "A word starting with \"CHA\""), kind: "debut" },
  { v: "fin", label: tr("Ça finit par…", "Ends with…"), desc: tr("Un mot qui finit par « TION »", "A word ending in \"TION\""), kind: "fin" },
  { v: "cat", label: tr("Catégories", "Categories"), desc: tr("Cite un animal, une marque, un film…", "Name an animal, a brand, a film…"), kind: "cat" },
  { v: "hot", label: tr("Catégories 18+", "18+ categories"), desc: tr("Coquin et sans filtre", "Naughty and unfiltered"), kind: "cat", hot: true },
  { v: "kid", label: tr("Enfants", "Kids"), desc: tr("Catégories faciles pour les petits", "Easy categories for kids"), kind: "cat", kid: true },
  { v: "perso", label: tr("Nos cartes", "Our cards"), desc: tr("Vos propres catégories", "Your own categories"), kind: "cat" }
];
const myCards = () => A(store().bombeCustom).map(x => clean(x, 80)).filter(Boolean).slice(0, 100);
const listOf = v => (v === "perso" ? myCards() : A((SB.lang() === "en" ? EN : FR)[v]));
const packList = () => PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: listOf(p.v).length }));
// Une carte : { k: type, t: texte } (le texte s'affiche avec sa consigne).
function deckFor(packs){
  const out = [];
  PACKS.forEach(p => { if(A(packs).indexOf(p.v) >= 0) listOf(p.v).forEach(t => out.push(p.kind + "|" + t)); });
  return SB.u.fresh("bombe", out);
}
const LEAD = { syll: tr("Un mot qui contient", "A word containing"), debut: tr("Un mot qui commence par", "A word starting with"), fin: tr("Un mot qui finit par", "A word ending in"), cat: tr("Cite", "Name") };
function cardHTML(card){ const [k, t] = String(card || "").split("|"); return '<div class="bm-card"><span>' + esc(LEAD[k] || "") + "</span><b" + (k === "cat" ? ' class="cat"' : "") + ">" + esc(t || "") + "</b></div>"; }
function editor(){
  SB.page(tr("Nos cartes", "Our cards"), root => {
    root.innerHTML = '<div class="gs"><p class="howto">' + tr("Une catégorie par ligne, écrite comme on la dit : « un ex de Kévin », « un plat de la cantine ». Elles se jouent avec le paquet « Nos cartes ».", "One category per line, the way you'd say it: \"one of Kevin's exes\", \"a cafeteria dish\". They play with the \"Our cards\" pack.") + "</p>" +
      '<textarea class="txt" id="bm-t" rows="10" placeholder="' + tr("un ex de Kévin\nun plat de la cantine", "one of Kevin's exes\na cafeteria dish") + '"></textarea><p class="sm" data-n></p></div>';
    const ta = root.querySelector("#bm-t"), n = root.querySelector("[data-n]");
    ta.value = myCards().join("\n");
    const save = () => { const t = ta.value.split("\n").map(x => clean(x, 80)).filter(Boolean).slice(0, 100); persist({ bombeCustom: t }); n.textContent = tr(t.length + " carte" + (t.length > 1 ? "s" : ""), t.length + (t.length === 1 ? " card" : " cards")); };
    ta.addEventListener("input", save); save();
  });
}
const FUSE = { courte: [8, 20], normale: [15, 40], longue: [25, 60] };
const TW = [
  { id: "inverse", name: tr("Sens inverse", "Reverse"), desc: tr("La bombe tourne dans l'autre sens.", "The bomb goes the other way round.") },
  { id: "courte", name: tr("Mèche courte", "Short fuse"), desc: tr("Elle peut exploser beaucoup plus vite que d'habitude.", "It can blow up much sooner than usual.") },
  { id: "eclabousse", name: tr("Éclaboussures", "Splash damage"), desc: tr("Quand elle explose, les deux voisins prennent aussi.", "When it blows, both neighbours get hit too.") },
  { id: "long", name: tr("Mots de 6 lettres", "6-letter words"), desc: tr("Pour passer, ton mot doit faire au moins 6 lettres.", "To pass, your word must have at least 6 letters.") }
];

/* ---------- Son : tic-tac qui accélère, puis explosion (Web Audio, rien à télécharger) ---------- */
let AC = null, tickT = null, tickOn = false;
const ac = () => { try{ if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if(AC.state === "suspended") AC.resume(); }catch(e){ AC = null; } return AC; };
function beep(f, d, v){ const a = ac(); if(!a) return; try{ const o = a.createOscillator(), g = a.createGain(); o.type = "square"; o.frequency.value = f; g.gain.setValueAtTime(v || .05, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + d + .02); }catch(e){} }
function boomSound(){
  const a = ac(); if(!a) return;
  try{
    const len = a.sampleRate * .9, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "lowpass"; f.frequency.setValueAtTime(1800, a.currentTime); f.frequency.exponentialRampToValueAtTime(80, a.currentTime + .8); g.gain.value = .9;
    src.connect(f).connect(g).connect(a.destination); src.start();
  }catch(e){}
}
// elapsed() : secondes depuis l'allumage. Le rythme accélère avec le temps (sans trahir la vraie durée de la mèche).
function startTick(elapsed, loud){
  stopTick(); tickOn = true;
  const step = () => {
    if(!tickOn) return;
    const e = elapsed(), gap = Math.max(130, 760 - e * 16);
    beep(e % 2 < 1 ? 1500 : 1150, .03, loud ? .07 : .025);
    tickT = setTimeout(step, gap);
  };
  step();
}
function stopTick(){ tickOn = false; clearTimeout(tickT); }
SB.onStop(stopTick);

const BOMB = '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M78 30c6-14 18-18 26-12" fill="none" stroke="#c9b48a" stroke-width="5" stroke-linecap="round"/><circle class="spark" cx="104" cy="17" r="7" fill="#ffd34d"/><rect x="62" y="30" width="22" height="16" rx="4" transform="rotate(35 73 38)" fill="#6b6080"/><circle cx="55" cy="70" r="40" fill="#2e2638" stroke="#6b6080" stroke-width="3"/><circle cx="41" cy="55" r="11" fill="#fff" opacity=".22"/></svg>';
const CSS = '<style data-bm>' +
  '.bm-card{display:flex; flex-direction:column; align-items:center; gap:2px; padding:14px; border-radius:20px; background:var(--card); border:2px solid var(--line); text-align:center}.bm-card span{font-weight:700; color:var(--muted)}.bm-card b{font-family:var(--f-disp); font-size:56px; line-height:1; letter-spacing:.04em; color:var(--acc)}.bm-card b.cat{font-size:28px; letter-spacing:0; line-height:1.15}' +
  '.bm-bomb{width:180px; height:180px; margin:0 auto; display:block; filter:drop-shadow(0 0 18px rgba(255,120,60,.35))}.bm-bomb svg{width:100%; height:100%}.bm-bomb .spark{animation:bmSpark .25s infinite alternate}@keyframes bmSpark{to{r:4; fill:#ff7a2f}}' +
  '.bm-bomb.hot{animation:bmShake .18s infinite}@keyframes bmShake{0%{transform:rotate(-4deg)}50%{transform:rotate(4deg) scale(1.03)}100%{transform:rotate(-4deg)}}' +
  '.bm-bomb.small{width:96px; height:96px; opacity:.9}' +
  '.bm-holder{text-align:center; font-weight:800}.bm-holder b{display:block; font-family:var(--f-disp); font-size:32px; color:var(--acc)}' +
  '.bm-pass{width:100%; min-height:110px; border-radius:24px; border:0; background:var(--acc); color:var(--on-acc); font-family:var(--f-disp); font-size:32px; box-shadow:0 10px 0 rgba(0,0,0,.35)}.bm-pass:active{transform:translateY(6px); box-shadow:0 4px 0 rgba(0,0,0,.35)}' +
  '.bm-boom{font-family:var(--f-disp); font-size:84px; line-height:1; text-align:center; color:#ff5a36; animation:bmBoom .5s ease-out}@keyframes bmBoom{0%{transform:scale(.2); opacity:0}60%{transform:scale(1.25); opacity:1}100%{transform:scale(1)}}' +
  '.bm-flash{position:fixed; inset:0; background:#fff; pointer-events:none; z-index:60; animation:bmFlash .5s ease-out forwards}@keyframes bmFlash{from{opacity:.85}to{opacity:0}}' +
  '.bm-ring{display:flex; flex-wrap:wrap; gap:6px; justify-content:center}.bm-ring span{padding:4px 10px; border-radius:99px; background:var(--soft); font-weight:700; font-size:13px}.bm-ring span.on{background:var(--acc); color:var(--on-acc)}' +
  '.bm-row{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:800}.bm-row b{flex:1}.bm-row .n{font-family:var(--f-disp); font-size:20px; color:#ff5a36}.bm-list{display:flex; flex-direction:column; gap:6px}</style>';
const flash = () => { const f = document.createElement("div"); f.className = "bm-flash"; document.body.appendChild(f); setTimeout(() => f.remove(), 600); };
const ring = (order, holder, nameOf) => '<div class="bm-ring">' + order.map(id => '<span class="' + (id === holder ? "on" : "") + '">' + esc(nameOf(id)) + "</span>").join("") + "</div>";
// Classement : le moins d'explosions en tête.
const board = (ids, booms, nameOf) => '<div class="bm-list">' + ids.slice().sort((a, b) => (booms[a] || 0) - (booms[b] || 0)).map((id, i) => '<div class="bm-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="n">' + (booms[id] || 0) + " " + tr(booms[id] > 1 ? "explosions" : "explosion", booms[id] === 1 ? "blast" : "blasts") + "</span></div>").join("") + "</div>";
// Remplace le contenu d'une zone seulement s'il a changé : l'écran ne se redessine pas à chaque passe.
function put(root, sel, html, bind){ const el = root.querySelector(sel); if(!el || el._h === html) return; el._h = html; el.innerHTML = html; if(bind) bind(el); }
const nextOf = (order, cur, dir) => { const i = order.indexOf(cur); return order[((i < 0 ? 0 : i) + dir + order.length * 4) % order.length]; };

SB.register({
  id: "bombe", name: tr("La Bombe", "The Bomb"), glyph: tr("Boum", "Boom"), pitch: tr("Dis un mot et passe la bombe avant qu'elle explose", "Say a word and pass the bomb before it blows"), hot: false, ticks: true,
  accent: { light: "#e8414e", dark: "#ff6b6b" },
  tag: tr("Une syllabe tombe, la mèche est allumée : dis un mot qui la contient et passe la bombe au suivant. Personne ne sait quand elle explose…", "A syllable drops, the fuse is lit: say a word containing it and pass the bomb on. Nobody knows when it'll blow…"),
  min: 2, max: 20,
  gages: [
    { ev: "boom", label: tr("La bombe t'explose dans les mains", "The bomb blows up in your hands"), kind: "boit", n: 2 },
    { ev: "voisin", label: tr("Éclaboussé (voisin de l'explosion)", "Splashed (next to the blast)"), kind: "boit", n: 1 }
  ],
  rules: tr([
    "Une carte tombe : une syllabe (« un mot qui contient TRA »), un début, une fin, ou une catégorie (« cite un animal »).",
    "L'hôte allume la mèche. Celui qui a la bombe dit un mot qui va, à voix haute, puis touche « Je passe » : la bombe saute chez le joueur suivant.",
    "Pas de mot déjà dit, pas de mot hésitant : si les autres refusent ton mot, tu gardes la bombe et tu en trouves un autre.",
    "Personne ne sait quand la mèche se termine. Celui qui a la bombe quand elle explose a un gage, et il commence la manche suivante.",
    "Coups de théâtre : sens inverse, mèche courte, éclaboussures (les voisins prennent aussi), mots de 6 lettres minimum.",
    "Le moins d'explosions à la fin gagne."
  ], [
    "A card drops: a syllable (\"a word containing ING\"), a start, an ending, or a category (\"name an animal\").",
    "The host lights the fuse. Whoever has the bomb says a matching word out loud, then taps \"Pass\": the bomb jumps to the next player.",
    "No repeated words, no stalling: if the others reject your word, you keep the bomb and find another one.",
    "Nobody knows when the fuse runs out. Whoever holds the bomb when it blows gets a forfeit and starts the next round.",
    "Twists: reverse, short fuse, splash damage (neighbours get hit too), 6-letter words minimum.",
    "Fewest blasts at the end wins."
  ]),
  options: [
    { id: "rounds", label: tr("Manches", "Rounds"), type: "seg", def: 8, values: [{ v: 5, label: "5" }, { v: 8, label: "8" }, { v: 12, label: "12" }] },
    { id: "fuse", label: tr("Mèche", "Fuse"), type: "seg", def: "normale", values: [{ v: "courte", label: tr("Courte", "Short") }, { v: "normale", label: tr("Normale", "Normal") }, { v: "longue", label: tr("Longue", "Long") }] },
    { id: "packs", label: tr("Cartes", "Cards"), type: "multi", def: ["syll", "cat"], values: () => packList() },
    { id: "edit", type: "button", label: tr("Écrire nos cartes", "Write our cards"), onClick: () => editor() },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Sens inverse, mèche courte, éclaboussures, mots de 6 lettres", "Reverse, short fuse, splash damage, 6-letter words"), def: true }
  ],
  start(ctx, o){
    const deck = deckFor(o.packs);
    if(deck.length < 3) throw new Error(tr("Pas assez de cartes : choisis plus de paquets.", "Not enough cards: pick more packs."));
    const order = shuffle(ctx.ids);
    ctx.setPriv({ deck, fuseEnd: 0 });
    return { phase: "ready", order, holder: order[0], dir: 1, n: 1, rounds: [5, 8, 12].indexOf(+o.rounds) >= 0 ? +o.rounds : 8, fuse: FUSE[o.fuse] ? o.fuse : "normale", card: deck[deck.length - 1], booms: {}, np: 0, tw: "", startAt: 0, res: null };
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "run") return;
    const pv = ctx.priv(), now = ctx.now(), live = s.order.filter(id => ctx.here(id));
    // Le porteur est parti : la bombe saute au suivant.
    if(!ctx.here(s.holder) && live.length){ ctx.set({ holder: nextOf(s.order.filter(id => ctx.here(id) || id === s.holder), s.holder, s.dir) }); return; }
    if(pv.fuseEnd && now >= pv.fuseEnd){
      const loser = s.holder, booms = Object.assign({}, s.booms), gl = [{ id: loser, ev: "boom" }];
      booms[loser] = (booms[loser] || 0) + 1;
      if(s.tw === "eclabousse" && s.order.length > 2){ const L = s.order.filter(id => ctx.here(id) || id === loser); [nextOf(L, loser, 1), nextOf(L, loser, -1)].filter(x => x !== loser).forEach(id => gl.push({ id, ev: "voisin" })); }
      ctx.gage(gl, s.k + ":boom");
      ctx.setPriv(Object.assign({}, pv, { fuseEnd: 0 }));
      ctx.set({ phase: "boom", booms, res: { loser, splash: gl.slice(1).map(x => x.id) } });
      return;
    }
    const i = ctx.input(s.holder);
    if(i && i.p === s.np){ const L = s.order.filter(id => ctx.here(id) || id === s.holder); ctx.set({ holder: nextOf(L, s.holder, s.dir), np: s.np + 1 }); }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), mine = s.holder === me;
    const head = CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + s.n + " / " + s.rounds + "</span>";
    if(s.phase === "ready"){
      stopTick();
      screen(root, "rd" + s.n + ctx.isHost, head + SB.u.twistHTML(T) + cardHTML(s.card) + '<div class="bm-bomb small">' + BOMB + "</div>" +
        '<p class="howto" style="text-align:center">' + esc(tr("La bombe commence chez ", "The bomb starts with ") + ctx.name(s.holder) + ". " + tr("Préparez vos mots…", "Get your words ready…")) + "</p>" + ring(s.order, s.holder, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-light>' + tr("Allumer la mèche", "Light the fuse") + "</button>" : '<p class="wait">' + tr("L'hôte va allumer la mèche…", "The host is about to light the fuse…") + "</p>"), r => {
        const b = r.querySelector("[data-light]"); if(b) b.addEventListener("click", () => {
          ac(); buzz(20);
          ctx.act(c => {
            if(c.s.phase !== "ready") return;
            const F = FUSE[c.s.fuse] || FUSE.normale, lo = c.s.tw === "courte" ? 5 : F[0], hi = c.s.tw === "courte" ? Math.round(F[1] / 2) : F[1];
            c.setPriv(Object.assign({}, c.priv(), { fuseEnd: c.now() + (lo + Math.random() * (hi - lo)) * 1000 }));
            c.set({ phase: "run", startAt: c.now(), np: 0, k: c.rid() });
          });
        });
      });
      return;
    }
    if(s.phase === "run"){
      if(root.dataset.bmrun !== s.k){ root.dataset.bmrun = s.k; const st = s.startAt; startTick(() => Math.max(0, (SB.ctx().now() - st) / 1000), false); }
      if(mine && root.dataset.bmme !== s.k + ":" + s.np){ root.dataset.bmme = s.k + ":" + s.np; buzz([25, 30, 25]); }
      const sent = mine && ctx.mine() && ctx.mine().p === s.np;
      screen(root, "run" + s.k, head + SB.u.twistHTML(T) + cardHTML(s.card) + '<div class="bm-bomb" data-bomb>' + BOMB + '</div><div data-who></div><div data-ring></div><div class="dock" data-dock></div>');
      const bomb = root.querySelector("[data-bomb]"); if(bomb){ bomb.classList.toggle("hot", mine); bomb.classList.toggle("small", !mine); }
      put(root, "[data-who]", mine ? '<div class="bm-holder">' + tr("C'est toi qui l'as !", "You've got it!") + "<b>" + tr("Dis un mot, vite !", "Say a word, quick!") + "</b></div>"
        : '<div class="bm-holder">' + tr("La bombe est chez", "The bomb is with") + "<b>" + esc(ctx.name(s.holder)) + "</b></div>");
      put(root, "[data-ring]", ring(s.order, s.holder, ctx.name));
      put(root, "[data-dock]", mine ? '<button type="button" class="bm-pass" data-pass' + (sent ? " disabled" : "") + ">" + tr("Je passe →", "Pass →") + "</button>" : '<p class="wait">' + tr("Écoute bien son mot…", "Listen to their word…") + "</p>", el => {
        const b = el.querySelector("[data-pass]"); if(b) b.addEventListener("click", () => { ac(); const c = SB.ctx(); if(c.s.holder !== c.me) return; c.send({ p: c.s.np }); b.disabled = true; });
      });
      return;
    }
    if(s.phase === "boom"){
      const R = s.res || {};
      if(root.dataset.bmboom !== s.k){ root.dataset.bmboom = s.k; stopTick(); boomSound(); flash(); buzz([300, 80, 400]); }
      const last = s.n >= s.rounds;
      screen(root, "bm" + s.k + ctx.isHost, head + '<div class="bm-boom">' + tr("BOUM !", "BOOM!") + '</div><div class="bm-holder">' + tr("Elle a explosé chez", "It blew up on") + "<b>" + esc(ctx.name(R.loser)) + "</b></div>" +
        (A(R.splash).length ? '<p class="sm" style="text-align:center">' + esc(tr("Éclaboussés : ", "Splashed: ") + A(R.splash).map(ctx.name).join(", ")) + "</p>" : "") + board(s.order, s.booms, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Manche suivante", "Next round")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase !== "boom") return; if(c.s.n >= c.s.rounds) c.set({ phase: "end" }); else nextRound(c); }));
      });
      return;
    }
    if(s.phase === "end"){
      stopTick();
      const bm = s.booms || {}, mn = Math.min(...s.order.map(id => bm[id] || 0)), best = s.order.filter(id => (bm[id] || 0) === mn);
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Le plus sang-froid", "Coolest under pressure") + '</span><div class="who">' + esc(best.map(ctx.name).join(" & ")) + "</div>" + board(s.order, bm, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const b2 = c.s.booms || {}, m2 = Math.min(...c.s.order.map(id => b2[id] || 0)), w = c.s.order.filter(id => (b2[id] || 0) === m2);
          c.end({ title: tr("La Bombe : ", "The Bomb: ") + w.map(c.name).join(" & "), lines: c.s.order.slice().sort((x, y) => (b2[x] || 0) - (b2[y] || 0)).slice(0, 4).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (b2[id] || 0) + tr(" explosion(s)", " blast(s)")), win: w.length < c.s.order.length ? w : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : on se passe le téléphone, c'est lui la bombe ---------- */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.bmPacks).length ? A(st.bmPacks).slice() : ["syll", "cat"], fuse = FUSE[st.bmFuse] ? st.bmFuse : "normale", rounds = [5, 8, 12].indexOf(st.bmRounds) >= 0 ? st.bmRounds : 8, twOn = st.bmTw !== false;
      let deck = [], order = [], holder = "", dir = 1, n = 0, card = "", tw = null, booms = {}, gno = 0, tok = Math.random().toString(36).slice(2, 7), endAt = 0, t0 = 0, chk = null;
      function setup(){
        stopTick(); clearInterval(chk);
        const packs = packList().filter(SB.packOk);
        sel = SB.okPacks(sel, packList());
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Le téléphone, c'est la bombe : dis ton mot, touche « Je passe » et donne le téléphone à ton voisin. Gare à l'explosion !", "The phone is the bomb: say your word, tap \"Pass\" and hand the phone to your neighbour. Watch out for the blast!") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Manches", "Rounds") + '</span><div class="seg">' + [5, 8, 12].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (rounds === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Mèche", "Fuse") + '</span><div class="seg">' + [["courte", tr("Courte", "Short")], ["normale", tr("Normale", "Normal")], ["longue", tr("Longue", "Long")]].map(f => '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (fuse === f[0]) + '">' + f[1] + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Cartes", "Cards") + '</span><div class="packs">' + packs.map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0 && p.count > 0) + '"' + (p.count ? "" : " disabled") + '><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.count + "</span></button>").join("") + "</div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Écrire nos cartes", "Write our cards") + "</button></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("C'est parti", "Let's go") + "</button>"), r => {
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ bmRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => { fuse = b.dataset.f; persist({ bmFuse: fuse }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ bmPacks: sel }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ bmTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            deck = deckFor(sel);
            if(deck.length < 3){ SB.u.toast(tr("Pas assez de cartes : choisis plus de paquets", "Not enough cards: pick more packs")); return; }
            ac(); order = shuffle(names); holder = order[0]; booms = {}; n = 0; tw = null; gno++; next();
          });
        });
      }
      const head = () => CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + n + " / " + rounds + "</span>";
      function next(){
        stopTick(); clearInterval(chk);
        if(n >= rounds){ end(); return; }
        n++; card = deck.length ? deck.pop() : card; SB.u.saw("bombe", card);
        tw = twOn && n > 1 ? SB.u.twist(TW, { last: tw ? tw.id : "", rate: .3 }) : null; dir = tw && tw.id === "inverse" ? -1 : 1;
        screen(root, "rd" + gno + ":" + n, head() + SB.u.twistHTML(tw) + cardHTML(card) + '<div class="bm-bomb small">' + BOMB + "</div>" +
          '<p class="howto" style="text-align:center">' + esc(tr("Donne le téléphone à ", "Hand the phone to ") + holder + tr(" : c'est lui qui commence.", ": they start.")) + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-light>' + tr("Allumer la mèche", "Light the fuse") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelector("[data-light]").addEventListener("click", light);
          r.querySelector("[data-q]").addEventListener("click", () => { stopTick(); api.exit(); });
        });
      }
      function light(){
        ac(); buzz(20);
        const F = FUSE[fuse], lo = tw && tw.id === "courte" ? 5 : F[0], hi = tw && tw.id === "courte" ? Math.round(F[1] / 2) : F[1];
        t0 = Date.now(); endAt = t0 + (lo + Math.random() * (hi - lo)) * 1000;
        startTick(() => (Date.now() - t0) / 1000, true);
        run();
        clearInterval(chk); chk = setInterval(() => { if(Date.now() >= endAt){ clearInterval(chk); boom(); } }, 100);
      }
      function run(){
        screen(root, "run" + gno + ":" + n, head() + SB.u.twistHTML(tw) + cardHTML(card) + '<div class="bm-bomb hot">' + BOMB + '</div><div data-who></div><div data-ring></div>' +
          SB.u.dock('<button type="button" class="bm-pass" data-pass>' + tr("Je passe →", "Pass →") + "</button>"), r => {
          r.querySelector("[data-pass]").addEventListener("click", () => { if(Date.now() >= endAt) return; buzz(15); holder = nextOf(order, holder, dir); run(); });
        });
        put(root, "[data-who]", '<div class="bm-holder">' + esc(holder) + "<b>" + tr("Dis un mot, vite !", "Say a word, quick!") + "</b></div>");
        put(root, "[data-ring]", ring(order, holder, z => z));
      }
      function boom(){
        stopTick(); boomSound(); flash(); buzz([300, 80, 400]);
        const loser = holder, gl = [{ id: loser, ev: "boom" }], key = "bm" + tok + "-" + gno + ":" + n;
        booms[loser] = (booms[loser] || 0) + 1;
        if(tw && tw.id === "eclabousse" && order.length > 2) [nextOf(order, loser, 1), nextOf(order, loser, -1)].filter(x => x !== loser).forEach(id => gl.push({ id, ev: "voisin" }));
        if(api.gage) api.gage(gl, key);
        screen(root, "bm" + gno + ":" + n, head() + '<div class="bm-boom">' + tr("BOUM !", "BOOM!") + '</div><div class="bm-holder">' + tr("Elle a explosé chez", "It blew up on") + "<b>" + esc(loser) + "</b></div>" +
          (gl.length > 1 ? '<p class="sm" style="text-align:center">' + esc(tr("Éclaboussés : ", "Splashed: ") + gl.slice(1).map(x => x.id).join(", ")) + "</p>" : "") + board(order, booms, z => z) +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (n >= rounds ? tr("Voir le classement", "See the standings") : tr("Manche suivante", "Next round")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", next);
        });
      }
      function end(){
        stopTick(); clearInterval(chk);
        const mn = Math.min(...order.map(x => booms[x] || 0)), best = order.filter(x => (booms[x] || 0) === mn);
        if(api.win) api.win(best.length < order.length ? best : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Le plus sang-froid", "Coolest under pressure") + '</span><div class="who">' + esc(best.join(" & ")) + "</div>" + board(order, booms, z => z) +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// Manche suivante (chez l'hôte) : nouvelle carte, le perdant garde la bombe.
function nextRound(c){
  const s = c.s, pv = c.priv(), deck = A(pv.deck).slice();
  deck.pop(); const card = deck.length ? deck[deck.length - 1] : s.card; SB.u.saw("bombe", card);
  const t = c.opts.twists !== false ? SB.u.twist(TW, { last: s.tw, rate: .3 }) : null;
  c.setPriv({ deck, fuseEnd: 0 });
  c.set({ phase: "ready", n: s.n + 1, card, tw: t ? t.id : "", dir: t && t.id === "inverse" ? -1 : 1, holder: (s.res || {}).loser || s.holder, np: 0, res: null, k: c.rid() });
}
})();
