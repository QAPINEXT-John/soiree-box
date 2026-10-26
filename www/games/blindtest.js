/* Blind test — des extraits de 30 secondes (API publique de Deezer, sans compte).
   QCM : chacun choisit la bonne réponse sur son téléphone, le plus rapide marque plus.
   Buzzer : le premier qui buzze répond à voix haute, l'hôte valide.
   Le module SB.music (thèmes, pioche Deezer, lecteur) peut servir à d'autres jeux musicaux. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz, clean } = SB.u;

/* ---------- Deezer : JSONP (l'API ne permet pas les appels directs depuis une page web) ---------- */
function jsonp(url, ms){
  return new Promise((res, rej) => {
    const cb = "dzcb" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), s = document.createElement("script");
    const done = () => { clearTimeout(t); try{ delete window[cb]; }catch(e){ window[cb] = undefined; } s.remove(); };
    const t = setTimeout(() => { done(); rej(new Error("timeout")); }, ms || 9000);
    window[cb] = d => { done(); res(d); };
    s.onerror = () => { done(); rej(new Error("net")); };
    s.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "output=jsonp&callback=" + cb;
    document.head.appendChild(s);
  });
}
const API = "https://api.deezer.com/";
const trackOf = x => (x && x.preview && x.title && x.artist ? { id: x.id, t: clean(String(x.title_short || x.title).replace(/\s*[(\[](de|du film|from|tir[ée]e? d)[^)\]]*[)\]]\s*$/i, ""), 80), a: clean(x.artist.name, 60), p: x.preview, c: (x.album && (x.album.cover_medium || x.album.cover)) || "", e: x.explicit_lyrics ? 1 : 0 } : null);
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/* ---------- Les thèmes ---------- */
const THEMES = [
  { v: "top", label: tr("Top du moment", "Current hits"), desc: tr("Les titres les plus écoutés en ce moment", "The most played tracks right now"), chart: 1 },
  { v: "fr", label: tr("Tubes français", "French hits"), desc: "Stromae, Angèle, Indila, Vianney…", artists: ["Stromae", "Angèle", "Indila", "Zaz", "Vianney", "Kendji Girac", "Louane", "Christophe Maé", "Soprano", "Aya Nakamura", "Gims", "Julien Doré", "Clara Luciani", "Amir", "Slimane", "Calogero"] },
  { v: "rapfr", label: tr("Rap français", "French rap"), desc: "PNL, Jul, Ninho, Nekfeu, Orelsan…", artists: ["PNL", "Jul", "Ninho", "Booba", "Nekfeu", "Orelsan", "SCH", "Damso", "Niska", "Gazo", "Tiakola", "Lomepal", "Bigflo & Oli", "IAM", "Diam's", "Sexion d'Assaut"] },
  { v: "80s", label: tr("Années 80", "The 80s"), desc: "Michael Jackson, Madonna, Goldman…", artists: ["Michael Jackson", "Madonna", "Queen", "a-ha", "Cyndi Lauper", "Daniel Balavoine", "Jean-Jacques Goldman", "Indochine", "Téléphone", "Wham!", "Dire Straits", "Eurythmics", "Whitney Houston", "Bon Jovi", "Desireless", "Images"] },
  { v: "90s", label: tr("Années 90-2000", "90s & 2000s"), desc: "Spice Girls, Britney, Eminem, Alizée…", artists: ["Spice Girls", "Britney Spears", "Backstreet Boys", "Eminem", "Nirvana", "Oasis", "Destiny's Child", "Shakira", "Moby", "Eiffel 65", "Alizée", "Lorie", "Las Ketchup", "Lou Bega", "Ricky Martin", "Linkin Park"] },
  { v: "variete", label: tr("Variété française", "French classics"), desc: "Johnny, Piaf, Goldman, Céline Dion…", artists: ["Johnny Hallyday", "Edith Piaf", "Charles Aznavour", "Joe Dassin", "Claude François", "Michel Sardou", "France Gall", "Céline Dion", "Francis Cabrel", "Renaud", "Michel Berger", "Dalida", "Serge Gainsbourg", "Mylène Farmer", "Patrick Bruel"] },
  { v: "dance", label: tr("Soirée dance", "Dance party"), desc: "Guetta, Avicii, Daft Punk, Dua Lipa…", artists: ["David Guetta", "Calvin Harris", "Avicii", "Bob Sinclar", "Daft Punk", "Martin Garrix", "Dua Lipa", "The Black Eyed Peas", "Pitbull", "LMFAO", "Major Lazer", "Kygo", "Lady Gaga", "Rihanna"] },
  { v: "rock", label: "Rock", desc: "Queen, AC/DC, Nirvana, Muse…", artists: ["Queen", "AC/DC", "Nirvana", "Red Hot Chili Peppers", "Muse", "Arctic Monkeys", "Linkin Park", "The Rolling Stones", "U2", "Green Day", "The Beatles", "Guns N' Roses", "Metallica", "Coldplay"] },
  { v: "disney", label: tr("Disney & dessins animés", "Disney & cartoons"), desc: tr("Les chansons des films, en français. On devine le film (ou le titre).", "Songs from the movies, in French. Guess the movie (or the title)."), kid: true, songs: [
    ["Libérée, délivrée", "La Reine des neiges"], ["Je voudrais un bonhomme de neige", "La Reine des neiges"], ["L'histoire de la vie", "Le Roi lion"], ["Hakuna Matata", "Le Roi lion"],
    ["Je voudrais déjà être roi", "Le Roi lion"], ["Soyez prêtes", "Le Roi lion"], ["Sous l'océan", "La Petite Sirène"], ["Partir là-bas", "La Petite Sirène"],
    ["Ce rêve bleu", "Aladdin"], ["Prince Ali", "Aladdin"], ["Je suis ton meilleur ami", "Aladdin"], ["Il en faut peu pour être heureux", "Le Livre de la jungle"],
    ["Être un homme comme vous", "Le Livre de la jungle"], ["Bibbidi-Bobbidi-Boo", "Cendrillon"], ["Je suis ton ami", "Toy Story"], ["Ne parlons pas de Bruno", "Encanto"],
    ["Sous pression", "Encanto"], ["Comme un homme", "Mulan"], ["Le bleu lumière", "Vaiana"], ["Un jour mon prince viendra", "Blanche-Neige"],
    ["Où est la vraie vie", "Raiponce"], ["Histoire éternelle", "La Belle et la Bête"], ["C'est la fête", "La Belle et la Bête"], ["L'air du vent", "Pocahontas"],
    ["Un morceau de sucre", "Mary Poppins"], ["Tout le monde veut devenir un cat", "Les Aristochats"]
  ] },
  { v: "perso", label: tr("Ma playlist Deezer", "My Deezer playlist"), desc: tr("Colle le lien d'une playlist Deezer publique", "Paste a public Deezer playlist link"), perso: 1 }
];
const myPlaylist = () => String(store().dzPlaylist || "");
const playlistId = s => { const m = String(s || "").match(/playlist\/(\d+)/) || String(s || "").match(/^(\d{4,})$/); return m ? m[1] : ""; };
// Construit la pioche (morceaux avec extrait) pour les thèmes choisis. Renvoie une promesse.
async function buildPool(themes, need){
  const sel = THEMES.filter(t => A(themes).indexOf(t.v) >= 0 && (!t.perso || playlistId(myPlaylist())));
  const jobs = [];
  sel.forEach(t => {
    if(t.chart) jobs.push(jsonp(API + "chart/0/tracks?limit=100").then(d => A(d && d.data).map(trackOf)));
    if(t.perso) jobs.push(jsonp(API + "playlist/" + playlistId(myPlaylist()) + "/tracks?limit=300").then(d => A(d && d.data).map(trackOf)));
    if(t.artists) shuffle(t.artists).slice(0, 12).forEach(a => jobs.push(jsonp(API + "search?q=" + encodeURIComponent('artist:"' + a + '"') + "&limit=8").then(d => A(d && d.data).filter(x => x && x.artist && norm(x.artist.name).indexOf(norm(a)) >= 0).map(trackOf)).catch(() => [])));
    // Disney : on cherche le titre et on ne garde que la version du film (album ou artiste qui citent le film ou Disney),
    // jamais une reprise, une version karaoké ou instrumentale. L'« artiste » affiché devient le nom du film.
    if(t.songs) shuffle(t.songs).slice(0, 16).forEach(x => jobs.push(jsonp(API + "search?q=" + encodeURIComponent(x[0]) + "&limit=25").then(d => {
      const film = norm(x[1]).replace(/^(la|le|les)/, ""), want = norm(x[0]).slice(0, 12);
      const hit = A(d && d.data).find(y => {
        if(!y || !y.preview || !y.title) return false;
        const meta = norm((y.album && y.album.title) + " " + (y.artist && y.artist.name)), tt = norm(y.title);
        if(/karaok|instrumental|cover|piano|lullab|berceuse|remix|acoustic|guitar|reprise/.test(tt + meta)) return false;
        return tt.indexOf(want) >= 0 && (meta.indexOf(film) >= 0 || meta.indexOf("disney") >= 0);
      });
      const tk = trackOf(hit); if(tk){ tk.a = x[1]; tk.f = 1; } return tk ? [tk] : [];
    }).catch(() => [])));
  });
  const all = [].concat(...(await Promise.all(jobs.map(j => j.catch(() => [])))));
  const seen = new Set(), out = [];
  const kid = SB.kid();
  shuffle(all).forEach(x => { if(!x || (kid && (x.e || !SB.kidOk(x.t + " " + x.a)))) return; const k = norm(x.a) + "|" + norm(x.t); if(seen.has(k)) return; seen.add(k); out.push(x); });
  if(out.length < Math.min(need || 6, 6)) throw new Error("pool");
  return out;
}
/* ---------- Le lecteur (un seul pour toute l'appli) ---------- */
const AUD = typeof Audio !== "undefined" ? new Audio() : null;
let stopT = null;
function play(url, maxMs){
  if(!AUD || !url) return Promise.resolve(false);
  clearTimeout(stopT);
  try{ AUD.pause(); }catch(e){}
  AUD.src = url; AUD.currentTime = 0; AUD.volume = 1;
  if(maxMs) stopT = setTimeout(() => { try{ AUD.pause(); }catch(e){} }, maxMs);
  return AUD.play().then(() => true).catch(() => false);
}
function pause(){ clearTimeout(stopT); try{ AUD && AUD.pause(); }catch(e){} }
function resume(){ try{ return AUD ? AUD.play().catch(() => {}) : null; }catch(e){} }
SB.music = { THEMES, buildPool, play, pause, resume, playlistId, myPlaylist, jsonp, norm };
SB.music.packs = () => THEMES.filter(t => !t.perso || playlistId(myPlaylist()));
SB.music.editor = function(){
  SB.page(tr("Ma playlist Deezer", "My Deezer playlist"), root => {
    root.innerHTML = '<div class="gs"><p class="howto">' + tr("Dans Deezer, ouvre une playlist publique, touche « Partager » puis « Copier le lien », et colle-le ici. Elle apparaîtra dans les thèmes du blind test.", "In Deezer, open a public playlist, tap “Share” then “Copy link”, and paste it here. It will show up in the blind test themes.") + "</p>" +
      '<input class="txt" id="dz-pl" placeholder="https://www.deezer.com/fr/playlist/…" autocomplete="off"><p class="sm" data-st></p></div>';
    const i = root.querySelector("#dz-pl"), st = root.querySelector("[data-st]");
    i.value = myPlaylist();
    const show = () => { st.textContent = i.value.trim() ? (playlistId(i.value) ? tr("Lien reconnu : playlist n° " + playlistId(i.value), "Link recognized: playlist #" + playlistId(i.value)) : tr("Ce lien ne ressemble pas à une playlist Deezer (les liens courts deezer.page.link ne marchent pas : ouvre-le d'abord dans le navigateur).", "This doesn't look like a Deezer playlist link (short deezer.page.link links don't work: open it in the browser first).")) : ""; };
    i.addEventListener("input", () => { persist({ dzPlaylist: i.value.trim() }); show(); }); show();
  });
};

/* ---------- Le jeu ---------- */
const CSS = '<style data-bt>' +
  '.bt-disc{width:150px; height:150px; margin:6px auto; border-radius:50%; background:radial-gradient(circle,#14101a 0 18%,#2c2638 19% 21%,#14101a 22% 100%); box-shadow:0 10px 30px -10px rgba(0,0,0,.8); position:relative; display:grid; place-items:center}' +
  '.bt-disc::before{content:""; position:absolute; inset:8px; border-radius:50%; background:repeating-radial-gradient(circle,transparent 0 3px,rgba(255,255,255,.05) 3px 4px)}.bt-disc i{width:44px; height:44px; border-radius:50%; background:var(--acc); z-index:1}' +
  '.bt-disc.spin{animation:bt-spin 2.2s linear infinite}@keyframes bt-spin{to{transform:rotate(360deg)}}' +
  '.bt-cover{width:150px; height:150px; margin:6px auto; border-radius:16px; object-fit:cover; display:block; box-shadow:0 10px 30px -10px rgba(0,0,0,.8)}' +
  '.bt-ans{text-align:center}.bt-ans b{display:block; font-family:var(--f-disp); font-size:26px; line-height:1.1}.bt-ans span{color:var(--muted); font-weight:700}' +
  '.bt-ch{display:grid; grid-template-columns:1fr 1fr; gap:8px}.bt-ch button{min-height:64px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:15px; padding:6px 8px; line-height:1.15}' +
  '.bt-ch button[aria-pressed="true"]{border-color:var(--acc); background:var(--acc); color:var(--dark,#14101a)}.bt-ch button.ok{border-color:#2fa860; background:#2fa860; color:#fff}.bt-ch button:disabled{opacity:1}.bt-ch button.ko{border-color:var(--bad); opacity:.6}' +
  '.bt-buzz{width:190px; height:190px; margin:8px auto; border-radius:50%; border:0; background:radial-gradient(circle at 35% 30%,#ff8a8a,#e8414e 60%,#a31d2a); color:#fff; font-family:var(--f-disp); font-size:36px; box-shadow:0 12px 0 #7a1420, 0 20px 30px -10px rgba(0,0,0,.6); display:block}.bt-buzz:active{transform:translateY(8px); box-shadow:0 4px 0 #7a1420}.bt-buzz:disabled{filter:grayscale(1); opacity:.5}' +
  '.bt-t{font-family:var(--f-disp); font-size:44px; text-align:center; color:var(--acc); line-height:1}' +
  '.bt-row{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:800}.bt-row b{flex:1}.bt-row .n{font-family:var(--f-disp); font-size:20px}.bt-row .p{color:#2fa860; font-size:13px}.bt-list{display:flex; flex-direction:column; gap:6px}</style>';
const disc = spin => '<div class="bt-disc' + (spin ? " spin" : "") + '"><i></i></div>';
const ansHTML = (tk, guess) => (tk.c ? '<img class="bt-cover" alt="" src="' + esc(tk.c) + '">' : disc(false)) + '<div class="bt-ans"><b>' + esc(guess === "titre" ? tk.t : tk.a) + "</b><span>" + esc(guess === "titre" ? tk.a : tk.t) + "</span></div>";
const label = (tk, guess) => (guess === "titre" ? tk.t : tk.a);
// 4 choix : la bonne réponse + 3 autres réponses différentes (labels = noms d'artistes ou titres de la pioche).
function choicesFor(tk, labels, guess){
  const good = label(tk, guess), seen = new Set([norm(good)]), others = [];
  shuffle(labels).forEach(l => { if(others.length < 3 && !seen.has(norm(l))){ seen.add(norm(l)); others.push(l); } });
  const ch = shuffle([good].concat(others)); return { ch, ok: ch.indexOf(good) };
}
const standings = (ids, pts, nameOf) => '<div class="bt-list">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map((id, i) => '<div class="bt-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="n">' + (pts[id] || 0) + "</span></div>").join("") + "</div>";
const TW = [
  { id: "x2", name: tr("Chanson en or", "Golden song"), desc: tr("Les points de cette chanson comptent double.", "Points for this song count double.") },
  { id: "eclair", name: tr("Extrait éclair", "Lightning clip"), desc: tr("Seulement 5 secondes d'extrait !", "Only 5 seconds of music!") },
  { id: "inverse", name: tr("À l'envers", "Flipped"), desc: tr("Cette fois, on devine l'autre moitié : le titre au lieu de l'artiste, ou l'inverse.", "This time, guess the other half: the title instead of the artist, or vice versa.") }
];
const LOAD_ERR = tr("Impossible de charger les extraits Deezer. Vérifie la connexion Internet du téléphone de l'hôte, ou choisis d'autres thèmes.", "Couldn't load the Deezer clips. Check the host phone's internet connection, or pick other themes.");
let LOADING = "";
const ROUND_MS = 20000;

SB.register({
  id: "blindtest", name: tr("Blind test", "Blind Test"), glyph: "♪", pitch: tr("Un extrait, qui trouve le plus vite ?", "One clip, who gets it first?"), hot: false, ticks: true,
  accent: { light: "#e04fa0", dark: "#ff7cc4" },
  tag: tr("Des extraits de 30 secondes de vrais morceaux. Trouve l'artiste (ou le titre) avant les autres. Le son sort du téléphone de l'hôte.", "30-second clips of real songs. Find the artist (or the title) before everyone else. Sound plays from the host's phone."),
  min: 2, max: 20,
  gages: [
    { ev: "rate", label: tr("Mauvaise réponse ou pas de réponse", "Wrong or no answer"), kind: "boit", n: 1 },
    { ev: "rapide", label: tr("Le plus rapide à trouver", "Fastest right answer"), kind: "distribue", n: 1 }
  ],
  rules: tr([
    "L'hôte lance l'extrait : le son sort de son téléphone, mettez-le sur une enceinte si vous pouvez.",
    "Mode QCM : 4 réponses s'affichent sur chaque téléphone. Touche la bonne au plus vite. Le premier qui trouve marque 3 points, le deuxième 2, les suivants 1.",
    "Mode buzzer : le premier qui buzze répond à voix haute. L'hôte voit la réponse et valide (+2) ou non (le joueur ne peut plus buzzer sur cette chanson, l'hôte non plus puisqu'il a vu la réponse).",
    "Thèmes : top du moment, tubes français, rap, années 80, 90-2000, variété, dance, rock, Disney (là, on devine le film), ou ta propre playlist Deezer.",
    "Coups de théâtre : chanson en or, extrait éclair de 5 secondes, à l'envers (le titre au lieu de l'artiste).",
    "Les extraits viennent de Deezer : il faut Internet, mais aucun compte."
  ], [
    "The host starts the clip: sound plays from their phone, hook it to a speaker if you can.",
    "Multiple choice: 4 answers appear on every phone. Tap the right one fast. First right answer scores 3 points, second 2, the rest 1.",
    "Buzzer: first to buzz answers out loud. The host sees the answer and validates (+2) or not (that player can't buzz again on this song, nor can the host since they saw the answer).",
    "Themes: current hits, French hits, rap, 80s, 90s-2000s, French classics, dance, rock, Disney (guess the movie), or your own Deezer playlist.",
    "Twists: golden song, 5-second lightning clip, flipped (title instead of artist).",
    "Clips come from Deezer: you need internet, but no account."
  ]),
  options: [
    { id: "mode", label: tr("Mode", "Mode"), type: "seg", def: "qcm", values: [{ v: "qcm", label: "QCM" }, { v: "buzz", label: "Buzzer" }] },
    { id: "guess", label: tr("On devine", "Guess the"), type: "seg", def: "artiste", values: [{ v: "artiste", label: tr("L'artiste", "Artist") }, { v: "titre", label: tr("Le titre", "Title") }] },
    { id: "rounds", label: tr("Chansons", "Songs"), type: "seg", def: 10, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "packs", label: tr("Thèmes", "Themes"), type: "multi", def: ["top", "fr"], values: () => SB.music.packs().map(t => ({ v: t.v, label: t.label, desc: t.desc, kid: t.kid })) },
    { id: "edit", type: "button", label: tr("Ajouter ma playlist Deezer", "Add my Deezer playlist"), onClick: () => SB.music.editor() },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Chanson en or, extrait éclair, à l'envers", "Golden song, lightning clip, flipped"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un thème.", "Pick at least one theme."));
    LOADING = "";
    return { phase: "load", mode: o.mode === "buzz" ? "buzz" : "qcm", guess: o.guess === "titre" ? "titre" : "artiste", rounds: o.rounds || 10, n: 0, tw: "", tk: null, ch: [], startAt: 0, pts: {}, res: null, bz: [], out: [], err: "" };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "load"){
      if(LOADING === ctx.g.gid) return; LOADING = ctx.g.gid;
      buildPool(ctx.opts.packs, s.rounds + 4).then(pool => ctx.act(c => {
        // Le secret reste petit : seulement les morceaux joués, plus des listes de noms pour les mauvaises réponses.
        const L = (k) => { const seen = new Set(), o = []; pool.forEach(x => { const v = x[k]; if(!seen.has(norm(v)) && o.length < 60){ seen.add(norm(v)); o.push(v); } }); return o; };
        const sub = f => pool.filter(x => !!x.f === f);
        const L2 = (arr, k) => { const seen = new Set(), o = []; arr.forEach(x => { const v = x[k]; if(!seen.has(norm(v)) && o.length < 60){ seen.add(norm(v)); o.push(v); } }); return o; };
        c.setPriv({ pool: pool.slice(0, c.s.rounds + 2), arts: L2(sub(false), "a"), films: L2(sub(true), "a"), tits: L("t") }); nextSong(c);
      }))
        .catch(() => ctx.act(c => c.set({ phase: "err", err: LOAD_ERR })));
      return;
    }
    if(s.phase === "play" && s.mode === "qcm"){
      const now = ctx.now(), ans = {};
      live.forEach(id => { const i = ctx.input(id); if(i && i.a != null) ans[id] = { a: +i.a, t: Math.max(0, +i.t || 0) }; });
      if(Object.keys(ans).length < live.length && now < s.startAt + ROUND_MS) return;
      const ok = ctx.priv().ok, x = s.tw === "x2" ? 2 : 1, good = Object.keys(ans).filter(id => ans[id].a === ok).sort((a, b) => ans[a].t - ans[b].t);
      const pts = Object.assign({}, s.pts), got = {}, gl = [];
      good.forEach((id, i) => { got[id] = (i === 0 ? 3 : i === 1 ? 2 : 1) * x; pts[id] = (pts[id] || 0) + got[id]; });
      live.filter(id => good.indexOf(id) < 0).forEach(id => gl.push({ id, ev: "rate" }));
      if(good.length) gl.push({ id: good[0], ev: "rapide" });
      ctx.gage(gl, s.k);
      ctx.set({ phase: "res", pts, res: { ok, got, ans, tk: ctx.priv().tk } });
      return;
    }
    if(s.phase === "play" && s.mode === "buzz"){
      const out = A(s.out), bz = live.filter(id => out.indexOf(id) < 0).map(id => { const i = ctx.input(id); return i && i.bz ? [id, +i.bz] : null; }).filter(Boolean).sort((a, b) => a[1] - b[1]);
      if(bz.length) ctx.set({ phase: "buzzed", who: bz[0][0] });
      else if(ctx.now() >= s.startAt + 30000) ctx.set({ phase: "res", res: { tk: ctx.priv().tk, got: {}, none: 1 } });
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), inp = ctx.mine() || {}, live = ctx.ids.filter(id => ctx.here(id));
    const head = CSS + '<span class="eyebrow">' + tr("Chanson ", "Song ") + Math.max(1, s.n) + " / " + s.rounds + " · " + (s.mode === "buzz" ? "Buzzer" : "QCM") + "</span>" + SB.u.twistHTML(T);
    const g2 = s.tw === "inverse" ? (s.guess === "titre" ? "artiste" : "titre") : s.guess;
    const q = '<p class="howto" style="text-align:center; margin:0">' + (g2 === "titre" ? tr("Quel est le titre ?", "What's the title?") : s.film ? tr("De quel film ?", "Which movie?") : tr("Qui chante ?", "Who's singing?")) + "</p>";
    if(s.phase === "load"){ screen(root, "ld" + s.k, head + disc(true) + '<p class="wait" style="text-align:center">' + tr("Chargement des extraits…", "Loading the clips…") + "</p>"); return; }
    if(s.phase === "err"){
      screen(root, "er" + ctx.isHost, head + '<p class="note-box">' + esc(s.err) + "</p>" + SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : ""), r => {
        const b = r.querySelector("[data-back]"); if(b) b.addEventListener("click", () => ctx.act(c => c.end({ title: tr("Blind test", "Blind Test"), lines: [] })));
      });
      return;
    }
    if(s.phase === "ready"){
      screen(root, "rd" + s.k + ctx.isHost, head + disc(false) + '<p class="howto" style="text-align:center">' + (ctx.isHost ? tr("Monte le son (ou branche une enceinte), puis lance l'extrait.", "Turn the volume up (or plug in a speaker), then start the clip.") : tr("Prépare-toi… l'hôte lance l'extrait.", "Get ready… the host is starting the clip.")) + "</p>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-play>' + tr("Lancer l'extrait", "Play the clip") + "</button>" : '<p class="wait">' + tr("En attente de l'hôte…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-play]");
        if(b) b.addEventListener("click", () => {
          // Le son doit démarrer dans le geste de l'hôte (règle des navigateurs).
          const tk = ctx.priv().tk; play(tk && tk.p, s.tw === "eclair" ? 5000 : 0).then(ok => { if(!ok) SB.u.toast(tr("Le son n'a pas démarré : touche encore.", "Sound didn't start: tap again.")); });
          buzz(10); ctx.act(c => { if(c.s.phase === "ready") c.set({ phase: "play", startAt: c.now(), bz: [], k: c.rid() }); });
        });
      });
      return;
    }
    if(s.phase === "play" && s.mode === "qcm"){
      const sec = Math.max(0, Math.ceil((s.startAt + ROUND_MS - ctx.now()) / 1000));
      screen(root, "pq" + s.k + (inp.a != null ? inp.a : ""), head + disc(true) + q + '<div class="bt-ch">' + A(s.ch).map((c, i) => '<button type="button" data-a="' + i + '" aria-pressed="' + (+inp.a === i && inp.a != null) + '"' + (inp.a != null || !ctx.playing ? " disabled" : "") + ">" + esc(c) + "</button>").join("") + "</div>" +
        '<div class="bt-t" data-t>' + sec + "</div>" + SB.u.dock('<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { buzz(10); ctx.send({ a: +b.dataset.a, t: ctx.now() - s.startAt }); }));
      });
      txt(root, "[data-t]", String(sec));
      txt(root, "[data-wait]", live.filter(id => { const i = ctx.input(id); return i && i.a != null; }).length + " / " + live.length + tr(" réponses", " answers"));
      return;
    }
    if((s.phase === "play" || s.phase === "buzzed") && s.mode === "buzz"){
      const out = A(s.out), canBuzz = s.phase === "play" && ctx.playing && out.indexOf(me) < 0 && !inp.bz;
      if(s.phase === "buzzed" && ctx.isHost && root.dataset.bzp !== s.k + s.who){ root.dataset.bzp = s.k + s.who; pause(); }
      screen(root, "bz" + s.k + s.phase + (s.who || "") + (inp.bz ? 1 : 0) + ctx.isHost + out.join(), head + disc(s.phase === "play") + q +
        (s.phase === "buzzed" ? '<div class="who" style="text-align:center">' + esc(ctx.name(s.who)) + '</div><p class="howto" style="text-align:center">' + (s.who === me ? tr("Réponds à voix haute !", "Answer out loud!") : tr("a buzzé ! On écoute sa réponse…", "buzzed! Listen to the answer…")) + "</p>" +
          (ctx.isHost && s.who !== me && ctx.priv().tk ? '<p class="note-box" style="text-align:center">' + tr("Réponse (toi seul la vois) : ", "Answer (only you see it): ") + "<b>" + esc(label(ctx.priv().tk, g2)) + "</b></p>" : "")
          : '<button type="button" class="bt-buzz" data-bz' + (canBuzz ? "" : " disabled") + ">BUZZ</button>" + (out.indexOf(me) >= 0 ? '<p class="sm" style="text-align:center">' + (ctx.isHost ? tr("Tu as vu la réponse : plus de buzz pour toi sur cette chanson.", "You saw the answer: no more buzzing for you on this song.") : tr("Raté : tu ne peux plus buzzer sur cette chanson.", "Wrong: you can't buzz again on this song.")) + "</p>" : "")) +
        SB.u.dock(ctx.isHost ? (s.phase === "buzzed" ? '<div class="row"><button class="btn ghost" type="button" data-no>' + tr("Faux", "Wrong") + '</button><button class="btn acc" type="button" data-yes>' + tr("Juste !", "Right!") + "</button></div>" : '<button class="btn ghost" type="button" data-reveal>' + tr("Personne ne trouve : réponse", "Nobody gets it: reveal") + "</button>") : '<p class="wait"></p>'), r => {
        const b = r.querySelector("[data-bz]"); if(b) b.addEventListener("click", () => { buzz([30, 20, 30]); ctx.send({ bz: ctx.now() }); b.disabled = true; });
        const y = r.querySelector("[data-yes]"); if(y) y.addEventListener("click", () => ctx.act(c => {
          if(c.s.phase !== "buzzed") return; const x = c.s.tw === "x2" ? 2 : 1, pts = Object.assign({}, c.s.pts), got = { [c.s.who]: 2 * x }; pts[c.s.who] = (pts[c.s.who] || 0) + 2 * x;
          c.gage([{ id: c.s.who, ev: "rapide" }], c.s.k + ":ok"); c.set({ phase: "res", pts, res: { tk: c.priv().tk, got } });
        }));
        const nb = r.querySelector("[data-no]"); if(nb) nb.addEventListener("click", () => { resume(); ctx.act(c => {
          if(c.s.phase !== "buzzed") return; c.gage([{ id: c.s.who, ev: "rate" }], c.s.k + ":ko:" + c.s.who); c.set({ phase: "play", out: A(c.s.out).concat([c.s.who], c.me !== c.s.who ? [c.me] : []), who: "", startAt: Math.max(c.s.startAt, c.now() - 20000) });
        }); });
        const rv = r.querySelector("[data-reveal]"); if(rv) rv.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "play") c.set({ phase: "res", res: { tk: c.priv().tk, got: {}, none: 1 } }); }));
      });
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {}, tk = R.tk || {}, last = s.n >= s.rounds;
      const ch = s.mode === "qcm" ? '<div class="bt-ch">' + A(s.ch).map((c, i) => '<button type="button" disabled class="' + (i === R.ok ? "ok" : inp.a != null && +inp.a === i ? "ko" : "") + '">' + esc(c) + "</button>").join("") + "</div>" : "";
      const got = R.got || {}, gk = Object.keys(got).sort((a, b) => got[b] - got[a]);
      screen(root, "rs" + s.k + ctx.isHost, head + ansHTML(tk, g2) + ch + (gk.length ? '<p class="sm" style="text-align:center">' + esc(gk.map(id => ctx.name(id) + " +" + got[id]).join(" · ")) + "</p>" : '<p class="sm" style="text-align:center">' + tr("Personne n'a trouvé !", "Nobody got it!") + "</p>") + standings(ctx.ids, s.pts, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Chanson suivante", "Next song")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => { pause(); ctx.act(c => { if(c.s.phase !== "res") return; if(c.s.n >= c.s.rounds) c.set({ phase: "end" }); else nextSong(c); }); });
      });
      return;
    }
    if(s.phase === "end"){
      if(ctx.isHost) pause();
      const p = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Meilleure oreille", "Best ear") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + standings(ctx.ids, p, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.ids.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0;
          c.end({ title: tr("Blind test : ", "Blind Test: ") + c.name(o2[0]), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0) + " pts"), win: mx ? o2.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone : le téléphone joue l'extrait, le groupe crie la réponse ---------- */
  local: {
    players: { min: 1, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.btPacks).length ? A(st.btPacks).slice() : ["top", "fr"], guess = st.btGuess === "titre" ? "titre" : "artiste", rounds = [10, 15, 20].indexOf(st.btRounds) >= 0 ? st.btRounds : 10, twOn = st.btTw !== false;
      let pool = [], n = 0, tw = null, tk = null, pts = {}, gno = 0, tok = Math.random().toString(36).slice(2, 7), found = [];
      function setup(){
        pause();
        const packs = SB.music.packs().filter(SB.packOk);
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Le téléphone joue l'extrait : criez la réponse ! Ensuite, touchez le prénom de celui qui a trouvé en premier.", "The phone plays the clip: shout the answer! Then tap the name of whoever got it first.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("On devine", "Guess the") + '</span><div class="seg">' + [["artiste", tr("L'artiste", "Artist")], ["titre", tr("Le titre", "Title")]].map(x => '<button type="button" data-g="' + x[0] + '" aria-pressed="' + (guess === x[0]) + '">' + x[1] + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Chansons", "Songs") + '</span><div class="seg">' + [10, 15, 20].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (rounds === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Thèmes", "Themes") + '</span><div class="packs">' + packs.map(p => '<button type="button" class="pack" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Ajouter ma playlist Deezer", "Add my Deezer playlist") + "</button></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Charger les extraits", "Load the clips") + "</button>"), r => {
          r.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { guess = b.dataset.g; persist({ btGuess: guess }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ btRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ btPacks: sel }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ btTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => SB.music.editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un thème", "Pick at least one theme")); return; }
            screen(root, "ld" + Math.random(), CSS + disc(true) + '<p class="wait" style="text-align:center">' + tr("Chargement des extraits…", "Loading the clips…") + "</p>");
            buildPool(SB.okPacks(sel, SB.music.packs()), rounds).then(p => { pool = p; n = 0; pts = {}; tw = null; gno++; next(); }).catch(() => {
              screen(root, "le" + Math.random(), CSS + '<p class="note-box">' + esc(LOAD_ERR) + "</p>" + SB.u.dock('<button class="btn acc" type="button" data-b>' + tr("Retour", "Back") + "</button>"), r2 => r2.querySelector("[data-b]").addEventListener("click", setup));
            });
          });
        });
      }
      const g2 = () => (tw && tw.id === "inverse" ? (guess === "titre" ? "artiste" : "titre") : guess);
      const head = () => CSS + '<span class="eyebrow">' + tr("Chanson ", "Song ") + n + " / " + rounds + "</span>" + SB.u.twistHTML(tw);
      function next(){
        n++; tw = twOn && n > 1 ? SB.u.twist(TW, { last: tw ? tw.id : "", rate: .3 }) : null; found = [];
        tk = pool.length ? pool.pop() : null;
        if(!tk){ end(); return; }
        screen(root, "rd" + gno + ":" + n, head() + disc(false) + '<p class="howto" style="text-align:center">' + (g2() === "titre" ? tr("Trouvez le titre !", "Find the title!") : tk.f ? tr("Trouvez le film !", "Find the movie!") : tr("Trouvez l'artiste !", "Find the artist!")) + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-play>' + tr("Lancer l'extrait", "Play the clip") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelector("[data-play]").addEventListener("click", () => { buzz(10); play(tk.p, tw && tw.id === "eclair" ? 5000 : 0); playing(); });
          r.querySelector("[data-q]").addEventListener("click", () => { pause(); api.exit(); });
        });
      }
      function playing(){
        screen(root, "pl" + gno + ":" + n, head() + disc(true) + '<p class="howto" style="text-align:center">' + tr("Criez la réponse !", "Shout the answer!") + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-rv>' + tr("Révéler la réponse", "Reveal the answer") + '</button><button class="btn ghost" type="button" data-again>' + tr("Réécouter", "Play again") + "</button>"), r => {
          r.querySelector("[data-rv]").addEventListener("click", reveal);
          r.querySelector("[data-again]").addEventListener("click", () => play(tk.p, tw && tw.id === "eclair" ? 5000 : 0));
        });
      }
      function reveal(){
        screen(root, "rv" + gno + ":" + n + found.join(","), head() + ansHTML(tk, g2()) + (names.length ? '<p class="howto" style="text-align:center; margin:0">' + tr("Qui a trouvé en premier ?", "Who got it first?") + '</p><div class="bt-ch">' + names.map(x => '<button type="button" data-who="' + esc(x) + '" aria-pressed="' + (found.indexOf(x) >= 0) + '">' + esc(x) + "</button>").join("") + "</div>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (found.length ? tr("Valider", "Confirm") : tr("Personne", "Nobody")) + "</button>"), r => {
          r.querySelectorAll("[data-who]").forEach(b => b.addEventListener("click", () => { found = found[0] === b.dataset.who ? [] : [b.dataset.who]; buzz(6); reveal(); }));
          r.querySelector("[data-n]").addEventListener("click", () => {
            pause();
            const x = tw && tw.id === "x2" ? 2 : 1;
            if(found.length){ pts[found[0]] = (pts[found[0]] || 0) + 2 * x; if(api.gage) api.gage([{ id: found[0], ev: "rapide" }], "bt" + tok + "-" + gno + ":" + n); }
            screen(root, "sc" + gno + ":" + n, head() + standings(names, pts, z => z) + SB.u.dock('<button class="btn acc" type="button" data-n>' + (n >= rounds ? tr("Voir le classement", "See the standings") : tr("Chanson suivante", "Next song")) + "</button>"), r2 => {
              r2.querySelector("[data-n]").addEventListener("click", () => { if(n >= rounds) end(); else next(); });
            });
          });
        });
      }
      function end(){
        pause();
        const order = names.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[order[0]] || 0;
        if(api.win) api.win(mx ? order.filter(x => (pts[x] || 0) === mx) : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Meilleure oreille", "Best ear") + '</span><div class="who">' + esc(order[0] || "") + "</div>" + standings(names, pts, z => z) +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// Prépare la chanson suivante (chez l'hôte) : morceau secret dans priv, choix publics.
function nextSong(c){
  const pv = c.priv(), pool = A(pv.pool).slice(), s = c.s;
  if(!pool.length){ c.set({ phase: "end" }); return; }
  const tk = pool.pop(), t = s.n >= 1 && c.opts.twists !== false ? SB.u.twist(TW, { last: s.tw, rate: .3 }) : null, tw = t ? t.id : "";
  const g = tw === "inverse" ? (s.guess === "titre" ? "artiste" : "titre") : s.guess, C = choicesFor(tk, A(g === "titre" ? pv.tits : tk.f ? pv.films : pv.arts), g);
  c.setPriv({ pool, arts: pv.arts, films: pv.films, tits: pv.tits, tk, ok: C.ok });
  c.set({ phase: "ready", n: s.n + 1, tw, film: tk.f ? 1 : 0, ch: s.mode === "qcm" ? C.ch : [], res: null, out: [], who: "", startAt: 0, k: c.rid() });
}
})();
