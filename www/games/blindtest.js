/* Blind test — des extraits de 30 secondes (API publique de Deezer, sans compte).
   QCM : chacun choisit la bonne réponse sur son téléphone, le plus rapide marque plus.
   Buzzer : le premier qui buzze répond à voix haute, l'hôte valide.
   Le module SB.music (thèmes, pioche Deezer, lecteur) peut servir à d'autres jeux musicaux. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz, clean } = SB.u;

/* ---------- Deezer : JSONP (l'API ne permet pas les appels directs depuis une page web) ---------- */
function jsonp1(url, ms){
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
/* Deezer limite à 50 requêtes par 5 secondes : file d'attente (6 à la fois, 40 max par 5 s),
   on réessaie si Deezer répond « quota dépassé », et on garde les réponses 20 minutes. */
const DZQ = [], DZT = [], DZC = new Map(); let dzRun = 0;
function dzPump(){
  while(dzRun < 6 && DZQ.length){
    const now = Date.now(); while(DZT.length && now - DZT[0] > 5200) DZT.shift();
    if(DZT.length >= 40){ setTimeout(dzPump, 5300 - (now - DZT[0])); return; }
    const job = DZQ.shift(); DZT.push(now); dzRun++;
    jsonp1(job.url, job.ms).then(d => {
      if(d && d.error && (d.error.code === 4 || /quota/i.test(d.error.message || "")) && job.tries < 3){ job.tries++; setTimeout(() => { DZQ.unshift(job); dzPump(); }, 1500 * job.tries); return; }
      if(d && !d.error) DZC.set(job.url, { t: Date.now(), d });
      job.res(d);
    }, job.rej).finally(() => { dzRun--; dzPump(); });
  }
}
function jsonp(url, ms){
  const c = DZC.get(url); if(c && Date.now() - c.t < 1200000) return Promise.resolve(c.d);
  return new Promise((res, rej) => { DZQ.push({ url, ms, res, rej, tries: 0 }); dzPump(); });
}
const API = "https://api.deezer.com/";
const trackOf = x => (x && x.preview && x.title && x.artist ? { id: x.id, t: clean(String(x.title_short || x.title).replace(/\s*[(\[](de|du film|from|tir[ée]e? d)[^)\]]*[)\]]\s*$/i, ""), 80), a: clean(x.artist.name, 60), p: x.preview, c: (x.album && (x.album.cover_medium || x.album.cover)) || "", e: x.explicit_lyrics ? 1 : 0, al: clean((x.album && x.album.title) || "", 80), raw: clean(x.title, 120) } : null);
/* Morceaux sans paroles : on les écarte (un blind test se joue sur des chansons).
   L'API ne dit pas si un titre est chanté : on filtre les versions instrumentales par leur nom,
   plus une liste de tubes connus pour être instrumentaux. */
const NOVOC_RX = /\b(instrumental(e|es)?|instru|karaok[eé]|interlude|intro|outro|skit|piano version|version piano|orchestral|lullab\w*|berceuse|bgm|8-bit|music box|backing track|playback)\b/i;
// Tubes instrumentaux connus : [artiste, titre] (artiste vide = quel que soit l'interprète).
const NOVOC = [["daftpunk", "dafunk"], ["daftpunk", "aerodynamic"], ["daftpunk", "derezzed"], ["daftpunk", "veridisquo"], ["daftpunk", "rollinscratchin"], ["daftpunk", "endofline"], ["daftpunk", "thegrid"], ["daftpunk", "contact"],
  ["avicii", "levels"], ["martingarrix", "animals"], ["metallica", "orion"], ["metallica", "thecallofktulu"], ["", "sandstorm"], ["", "children"], ["", "axelf"], ["", "popcorn"], ["", "oxygene"], ["", "tubularbells"], ["", "flightofthebumblebee"]];
const noVoice = x => NOVOC_RX.test(x.raw + " " + x.al) || NOVOC.some(n => norm(x.t) === n[1] && (!n[0] || norm(x.a) === n[0]));
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/* ---------- Les thèmes ---------- */
const THEMES = [
  { v: "top", label: tr("Top du moment", "Current hits"), desc: tr("Les titres les plus écoutés en ce moment", "The most played tracks right now"), chart: 1 },
  { v: "fr", label: tr("Tubes français", "French hits"), desc: "Stromae, Angèle, Indila, Vianney…", artists: ["Stromae", "Angèle", "Indila", "Zaz", "Vianney", "Kendji Girac", "Louane", "Christophe Maé", "Soprano", "Aya Nakamura", "Gims", "Julien Doré", "Clara Luciani", "Amir", "Slimane", "Calogero"] },
  { v: "rapfr", label: tr("Rap français", "French rap"), desc: "PNL, Jul, Ninho, Nekfeu, Orelsan…", artists: ["PNL", "Jul", "Ninho", "Booba", "Nekfeu", "Orelsan", "SCH", "Damso", "Niska", "Gazo", "Tiakola", "Lomepal", "Bigflo & Oli", "IAM", "Diam's", "Sexion d'Assaut"] },
  { v: "80s", label: tr("Années 80", "The 80s"), desc: "Michael Jackson, Madonna, Goldman…", artists: ["Michael Jackson", "Madonna", "Queen", "a-ha", "Cyndi Lauper", "Daniel Balavoine", "Jean-Jacques Goldman", "Indochine", "Téléphone", "Wham!", "Dire Straits", "Eurythmics", "Whitney Houston", "Bon Jovi", "Desireless", "Images"] },
  { v: "90s", label: tr("Années 90-2000", "90s & 2000s"), desc: "Spice Girls, Britney, Eminem, Alizée…", artists: ["Spice Girls", "Britney Spears", "Backstreet Boys", "Eminem", "Nirvana", "Oasis", "Destiny's Child", "Shakira", "Haddaway", "Eiffel 65", "Alizée", "Lorie", "Las Ketchup", "Lou Bega", "Ricky Martin", "Linkin Park"] },
  { v: "variete", label: tr("Variété française", "French classics"), desc: "Johnny, Piaf, Goldman, Céline Dion…", artists: ["Johnny Hallyday", "Edith Piaf", "Charles Aznavour", "Joe Dassin", "Claude François", "Michel Sardou", "France Gall", "Céline Dion", "Francis Cabrel", "Renaud", "Michel Berger", "Dalida", "Serge Gainsbourg", "Mylène Farmer", "Patrick Bruel"] },
  { v: "dance", label: tr("Soirée dance", "Dance party"), desc: "Guetta, Avicii, Daft Punk, Dua Lipa…", artists: ["David Guetta", "Calvin Harris", "Avicii", "Bob Sinclar", "Daft Punk", "Clean Bandit", "Dua Lipa", "The Black Eyed Peas", "Pitbull", "LMFAO", "Major Lazer", "Kygo", "Lady Gaga", "Rihanna"] },
  { v: "rock", label: "Rock", desc: "Queen, AC/DC, Nirvana, Muse…", artists: ["Queen", "AC/DC", "Nirvana", "Red Hot Chili Peppers", "Muse", "Arctic Monkeys", "Linkin Park", "The Rolling Stones", "U2", "Green Day", "The Beatles", "Guns N' Roses", "Metallica", "Coldplay"] },
  { v: "metal", label: "Metal", desc: "Metallica, Rammstein, Slipknot, Gojira…", artists: ["Metallica", "Iron Maiden", "Rammstein", "Slipknot", "System of a Down", "Gojira", "Mass Hysteria", "Black Sabbath", "Ozzy Osbourne", "Motörhead", "Megadeth", "Pantera", "Korn", "Disturbed", "Avenged Sevenfold", "Sabaton", "Nightwish", "Evanescence", "Ghost", "Rage Against the Machine", "Limp Bizkit", "Bring Me The Horizon"] },
  { v: "disney", kind: "film", label: tr("Disney & dessins animés", "Disney & cartoons"), desc: tr("Les chansons des films, en français. On devine le film (ou le titre).", "Songs from the movies, in French. Guess the movie (or the title)."), kid: true, songs: [
    ["Libérée, délivrée", "La Reine des neiges"], ["Je voudrais un bonhomme de neige", "La Reine des neiges"], ["L'histoire de la vie", "Le Roi lion"], ["Hakuna Matata", "Le Roi lion"],
    ["Je voudrais déjà être roi", "Le Roi lion"], ["Soyez prêtes", "Le Roi lion"], ["Sous l'océan", "La Petite Sirène"], ["Partir là-bas", "La Petite Sirène"],
    ["Ce rêve bleu", "Aladdin"], ["Prince Ali", "Aladdin"], ["Je suis ton meilleur ami", "Aladdin"], ["Il en faut peu pour être heureux", "Le Livre de la jungle"],
    ["Être un homme comme vous", "Le Livre de la jungle"], ["Bibbidi-Bobbidi-Boo", "Cendrillon"], ["Je suis ton ami", "Toy Story"], ["Ne parlons pas de Bruno", "Encanto"],
    ["Sous pression", "Encanto"], ["Comme un homme", "Mulan"], ["Le bleu lumière", "Vaiana"], ["Un jour mon prince viendra", "Blanche-Neige"],
    ["Où est la vraie vie", "Raiponce"], ["Histoire éternelle", "La Belle et la Bête"], ["C'est la fête", "La Belle et la Bête"], ["L'air du vent", "Pocahontas"],
    ["Un morceau de sucre", "Mary Poppins"], ["Tout le monde veut devenir un cat", "Les Aristochats"]
  ] },
  { v: "anime", label: tr("Manga & anime", "Manga & anime"), desc: tr("Génériques d'anime et du Club Dorothée. On devine l'anime (ou le titre).", "Anime openings and classic French cartoon themes. Guess the anime (or the title)."), kid: true, by: "artist", kind: "anime", songs: [
    ["Dragon Ball Z", "Dragon Ball Z", "Bernard Minet"], ["Les Chevaliers du Zodiaque", "Les Chevaliers du Zodiaque", "Bernard Minet"], ["Nicky Larson", "Nicky Larson", "Jean-Paul Césari"],
    ["Goldorak", "Goldorak", "Noam"], ["Albator", "Albator", "Eric Charden"], ["Cha-La Head-Cha-La", "Dragon Ball Z", "Hironobu Kageyama"], ["We Are!", "One Piece", "Hiroshi Kitadani"],
    ["Blue Bird", "Naruto Shippuden", "Ikimonogakari"], ["Silhouette", "Naruto Shippuden", "KANA-BOON"], ["Guren no Yumiya", "L'Attaque des Titans", "Linked Horizon"],
    ["Shinzou wo Sasageyo", "L'Attaque des Titans", "Linked Horizon"], ["Unravel", "Tokyo Ghoul", "TK from Ling tosite sigure"], ["the WORLD", "Death Note", "Nightmare"],
    ["Again", "Fullmetal Alchemist", "YUI"], ["Gurenge", "Demon Slayer", "LiSA"], ["Kaikai Kitan", "Jujutsu Kaisen", "Eve"], ["A Cruel Angel's Thesis", "Neon Genesis Evangelion", "Yoko Takahashi"],
    ["KICK BACK", "Chainsaw Man", "Kenshi Yonezu"], ["Mixed Nuts", "Spy x Family", "Official HIGE DANdism"], ["Cry Baby", "Tokyo Revengers", "Official HIGE DANdism"],
    ["The Day", "My Hero Academia", "Porno Graffitti"], ["Idol", "Oshi no Ko", "YOASOBI"], ["Asterisk", "Bleach", "Orange Range"], ["Colors", "Code Geass", "FLOW"],
    ["Imagination", "Haikyuu!!", "SPYAIR"], ["departure!", "Hunter x Hunter", "Masatoshi Ono"], ["Hacking to the Gate", "Steins;Gate", "Kanako Ito"], ["Crossing Field", "Sword Art Online", "LiSA"],
    ["Bling-Bang-Bang-Born", "Mashle", "Creepy Nuts"], ["Peace Sign", "My Hero Academia", "Kenshi Yonezu"]
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
    // La recherche avancée de Deezer (artist:"…") renvoie n'importe quoi : on passe par la fiche de l'artiste et ses titres les plus écoutés.
    if(t.artists) shuffle(t.artists).slice(0, Math.max(5, Math.ceil(10 / sel.length))).forEach(a => jobs.push(artistTop(a).catch(() => [])));
    // Disney : on cherche le titre et on ne garde que la version du film (album ou artiste qui citent le film ou Disney),
    // jamais une reprise, une version karaoké ou instrumentale. L'« artiste » affiché devient le nom du film.
    if(t.songs) shuffle(t.songs).slice(0, Math.max(10, Math.ceil(20 / sel.length))).forEach(x => jobs.push((t.by === "artist" ? artistSong(x, t.kind) : disneyTrack(x)).catch(() => [])));
  });
  const all = [].concat(...(await Promise.all(jobs.map(j => j.catch(() => [])))));
  const seen = new Set(), out = [];
  const kid = SB.kid();
  shuffle(all).forEach(x => { if(!x || noVoice(x) || (kid && (x.e || !SB.kidOk(x.t + " " + x.a)))) return; const k = norm(x.a) + "|" + norm(x.t); if(seen.has(k)) return; seen.add(k); out.push(x); });
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
/* Disney : seulement la chanson chantée du film. On cherche d'abord titre + album du film, puis le titre seul,
   et on n'accepte un résultat que si l'album ou l'interprète citent le film (« Disney » seul ne suffit pas :
   il y a des dizaines d'albums « Disney au piano / en berceuse / pour bébé » sans paroles). */
const DZ_NOVOC = /karaok|instrument|cover|piano|lullab|berceuse|remix|acoust|guitar|reprise|orchestr|symphon|philharm|jazz|harp|harpe|ukulele|relax|sleep|dodo|baby|bebe|musicbox|boiteamusique|violin|violon|cello|strings|quartet|quatuor|ensemble|lounge|chill|bossa|flute|marimba|xylo|8bit|chiptune|epic|ambient|meditat|zen|yoga|study|tribute|hommage|inspired|madefamous|originallyperformed|score|suite|theme|playback|version longue/;
function disneyTrack(x){
  const film = norm(x[1]).replace(/^(la|le|les)/, ""), want = norm(x[0]).slice(0, 12);
  const pick = d => A(d && d.data).find(y => {
    if(!y || !y.preview || !y.title) return false;
    const meta = norm((y.album && y.album.title) + " " + (y.artist && y.artist.name)), tt = norm(y.title);
    if(DZ_NOVOC.test(tt + " " + meta) || DZ_NOVOC.test(String(y.title + " " + (y.album && y.album.title)).toLowerCase())) return false;
    return tt.indexOf(want) === 0 && meta.indexOf(film) >= 0;
  });
  const done = hit => { const tk = trackOf(hit); if(tk){ tk.a = x[1]; tk.f = "film"; } return tk ? [tk] : []; };
  return jsonp(API + "search?q=" + encodeURIComponent(x[0] + " " + x[1]) + "&limit=25").then(d => pick(d) || jsonp(API + "search?q=" + encodeURIComponent(x[0]) + "&limit=50").then(pick)).then(done);
}
/* Anime : on cherche le générique par titre + interprète, et on n'accepte que le bon interprète
   (jamais une reprise, une version piano, guitare, 8-bit…). Le titre peut être écrit en japonais chez Deezer :
   on garde alors notre titre en lettres latines. L'« artiste » affiché devient le nom de l'anime. */
const AN_NOVOC = /karaok|instrument|cover|piano|lullab|berceuse|remix|acoust|guitar|orchestr|symphon|musicbox|boiteamusique|8bit|chiptune|tribute|hommage|madefamous|originallyperformed|playback|offvocal|inst\b/;
function artistSong(x, kind){
  const art = norm(x[2]), want = norm(x[0]).slice(0, 10);
  const pick = d => A(d && d.data).find(y => {
    if(!y || !y.preview || !y.title || !y.artist) return false;
    const an = norm(y.artist.name), tt = norm(y.title);
    if(AN_NOVOC.test(tt + " " + norm(y.album && y.album.title)) || AN_NOVOC.test(String(y.title + " " + (y.album && y.album.title)).toLowerCase())) return false;
    if(!an || !(an.indexOf(art) >= 0 || art.indexOf(an) >= 0)) return false;
    return tt.indexOf(want) === 0 || !tt; // titre en japonais : norm() le vide, on fait confiance à la recherche titre + interprète
  });
  const done = hit => { const tk = trackOf(hit); if(tk){ tk.t = x[0]; tk.a = x[1]; tk.f = kind; } return tk ? [tk] : []; };
  return jsonp(API + "search?q=" + encodeURIComponent(x[0] + " " + x[2]) + "&limit=25").then(d => pick(d) || jsonp(API + "search?q=" + encodeURIComponent(x[0]) + "&limit=50").then(pick)).then(done);
}
// Titres les plus écoutés d'un artiste (le bon artiste : on vérifie le nom).
function artistTop(name){
  const want = norm(name);
  return jsonp(API + "search/artist?q=" + encodeURIComponent(name) + "&limit=5").then(d => {
    const L = A(d && d.data), ar = L.find(x => x && norm(x.name) === want) || L.find(x => x && norm(x.name).indexOf(want) === 0) || null;
    if(!ar || !ar.id) return [];
    return jsonp(API + "artist/" + ar.id + "/top?limit=12").then(t => A(t && t.data).filter(x => x && x.artist && x.artist.id === ar.id).map(trackOf));
  });
}
SB.music = { THEMES, buildPool, play, pause, resume, audio: AUD, playlistId, myPlaylist, jsonp, norm, noVoice: x => noVoice(trackOf(x)) };
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
    "Thèmes : top du moment, tubes français, rap, années 80, 90-2000, variété, dance, rock, metal, Disney (là, on devine le film), manga & anime (on devine l'anime), ou ta propre playlist Deezer.",
    "Coups de théâtre : chanson en or, extrait éclair de 5 secondes, à l'envers (le titre au lieu de l'artiste).",
    "Les extraits viennent de Deezer : il faut Internet, mais aucun compte.",
    "En équipes (2 à 4) : en QCM, un capitaine différent répond pour son équipe à chaque chanson ; au buzzer, le premier qui buzze répond pour son équipe, et si c'est faux toute l'équipe est bloquée sur cette chanson."
  ], [
    "The host starts the clip: sound plays from their phone, hook it to a speaker if you can.",
    "Multiple choice: 4 answers appear on every phone. Tap the right one fast. First right answer scores 3 points, second 2, the rest 1.",
    "Buzzer: first to buzz answers out loud. The host sees the answer and validates (+2) or not (that player can't buzz again on this song, nor can the host since they saw the answer).",
    "Themes: current hits, French hits, rap, 80s, 90s-2000s, French classics, dance, rock, metal, Disney (guess the movie), manga & anime (guess the anime), or your own Deezer playlist.",
    "Twists: golden song, 5-second lightning clip, flipped (title instead of artist).",
    "Clips come from Deezer: you need internet, but no account.",
    "In teams (2 to 4): in multiple choice, a different captain answers for the team each song; on the buzzer, whoever buzzes first answers for their team, and if wrong the whole team is out for that song."
  ]),
  options: [
    { id: "mode", label: tr("Mode", "Mode"), type: "seg", def: "qcm", values: [{ v: "qcm", label: "QCM" }, { v: "buzz", label: "Buzzer" }] },
    { id: "teams", label: tr("Équipes", "Teams"), type: "seg", def: 0, values: [{ v: 0, label: tr("Non", "No") }, { v: 2, label: "2" }, { v: 3, label: "3" }, { v: 4, label: "4" }] },
    { id: "guess", label: tr("On devine", "Guess the"), type: "seg", def: "artiste", values: [{ v: "artiste", label: tr("L'artiste", "Artist") }, { v: "titre", label: tr("Le titre", "Title") }] },
    { id: "rounds", label: tr("Chansons", "Songs"), type: "seg", def: 10, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 20, label: "20" }] },
    { id: "packs", label: tr("Thèmes", "Themes"), type: "multi", def: ["top", "fr"], values: () => SB.music.packs().map(t => ({ v: t.v, label: t.label, desc: t.desc, kid: t.kid })) },
    { id: "edit", type: "button", label: tr("Ajouter ma playlist Deezer", "Add my Deezer playlist"), onClick: () => SB.music.editor() },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Chanson en or, extrait éclair, à l'envers", "Golden song, lightning clip, flipped"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un thème.", "Pick at least one theme."));
    LOADING = "";
    const tmn = +o.teams >= 2 ? Math.min(4, +o.teams) : 0;
    if(tmn && ctx.ids.length < tmn) throw new Error(tr("Il faut au moins " + tmn + " joueurs pour " + tmn + " équipes.", "You need at least " + tmn + " players for " + tmn + " teams."));
    return { tmn, tm: tmn ? SB.teams.split(ctx.ids, tmn) : null, tp: {}, caps: {}, phase: tmn ? "teams" : "load", mode: o.mode === "buzz" ? "buzz" : "qcm", guess: o.guess === "titre" ? "titre" : "artiste", rounds: o.rounds || 10, n: 0, tw: "", tk: null, ch: [], startAt: 0, pts: {}, res: null, bz: [], out: [], err: "" };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "load"){
      if(LOADING === ctx.g.gid) return; LOADING = ctx.g.gid;
      buildPool(ctx.opts.packs, s.rounds + 4).then(pool => ctx.act(c => {
        // Le secret reste petit : seulement les morceaux joués, plus des listes de noms pour les mauvaises réponses.
        const L = (k) => { const seen = new Set(), o = []; pool.forEach(x => { const v = x[k]; if(!seen.has(norm(v)) && o.length < 60){ seen.add(norm(v)); o.push(v); } }); return o; };
        const sub = f => pool.filter(x => (x.f || "") === f);
        const L2 = (arr, k) => { const seen = new Set(), o = []; arr.forEach(x => { const v = x[k]; if(!seen.has(norm(v)) && o.length < 60){ seen.add(norm(v)); o.push(v); } }); return o; };
        c.setPriv({ pool: pool.slice(0, c.s.rounds + 2), arts: L2(sub(""), "a"), films: L2(sub("film"), "a"), animes: L2(sub("anime"), "a"), tits: L("t") }); nextSong(c);
      }))
        .catch(() => ctx.act(c => c.set({ phase: "err", err: LOAD_ERR })));
      return;
    }
    if(s.phase === "play" && s.mode === "qcm"){
      const now = ctx.now(), ans = {}, act = btActors(s, live);
      act.forEach(id => { const i = ctx.input(id); if(i && i.a != null) ans[id] = { a: +i.a, t: Math.max(0, +i.t || 0) }; });
      if(Object.keys(ans).length < act.length && now < s.startAt + ROUND_MS) return;
      const ok = ctx.priv().ok, x = s.tw === "x2" ? 2 : 1, good = Object.keys(ans).filter(id => ans[id].a === ok).sort((a, b) => ans[a].t - ans[b].t);
      const pts = Object.assign({}, s.pts), tp = Object.assign({}, s.tp), got = {}, tg = {}, gl = [];
      const team = id => (s.tmn ? SB.teams.members(s.tm, s.tm[id], ctx.ids) : [id]);
      good.forEach((id, i) => { got[id] = (i === 0 ? 3 : i === 1 ? 2 : 1) * x; pts[id] = (pts[id] || 0) + got[id]; if(s.tmn){ const t = s.tm[id]; tg[t] = got[id]; tp[t] = (tp[t] || 0) + got[id]; } });
      act.filter(id => good.indexOf(id) < 0).forEach(id => team(id).forEach(m => gl.push({ id: m, ev: "rate" })));
      if(good.length) gl.push({ id: good[0], ev: "rapide" });
      ctx.gage(gl, s.k);
      ctx.set({ phase: "res", pts, tp, res: { ok, got, tg, ans, tk: ctx.priv().tk } });
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
    const myT = s.tmn ? (s.tm || {})[me] : "", cap = myT ? (s.caps || {})[myT] : me, isCap = !s.tmn || cap === me, capIn = (s.tmn && cap && ctx.input(cap)) || inp;
    const head = CSS + '<span class="eyebrow">' + tr("Chanson ", "Song ") + Math.max(1, s.n) + " / " + s.rounds + " · " + (s.mode === "buzz" ? "Buzzer" : "QCM") + "</span>" + SB.u.twistHTML(T) +
      (myT && s.phase !== "teams" ? '<p class="sm" style="text-align:center; margin:0">' + SB.teams.pill(myT) + " " + esc(s.mode === "buzz" ? tr("Le premier qui buzze répond pour l'équipe.", "Whoever buzzes first answers for the team.") : isCap ? tr("Tu es capitaine : tu réponds pour l'équipe.", "You're captain: you answer for the team.") : tr("Capitaine : " + ctx.name(cap) + ". Dites-lui la réponse !", "Captain: " + ctx.name(cap) + ". Tell them the answer!")) + "</p>" : "");
    if(s.phase === "teams"){
      const ok = SB.teams.ok(s.tm, s.tmn, ctx.ids);
      screen(root, "tm" + JSON.stringify(s.tm) + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Les équipes", "The teams") + "</span>" + SB.teams.grid(s.tm, s.tmn, ctx.ids, ctx.name, ctx.isHost) +
        '<p class="sm" style="margin:0">' + (s.mode === "buzz" ? tr("Buzzer : le premier qui buzze répond pour son équipe. Raté, toute l'équipe est bloquée sur cette chanson.", "Buzzer: whoever buzzes first answers for their team. Wrong, and the whole team is out for that song.") : tr("QCM : à chaque chanson, un capitaine différent répond pour son équipe.", "Multiple choice: each song, a different captain answers for the team.")) + (ctx.isHost ? tr(" Touche un joueur pour le changer d'équipe.", " Tap a player to switch their team.") : "") + "</p>" +
        (ctx.isHost ? '<button class="link" type="button" data-mix style="align-self:flex-start">' + tr("Mélanger les équipes", "Shuffle the teams") + "</button>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-go' + (ok ? "" : " disabled") + ">" + tr("C'est parti", "Let's go") + "</button>" : '<p class="wait">' + tr("En attente de l'hôte…", "Waiting for the host…") + "</p>"), r => {
        if(!ctx.isHost) return;
        r.querySelectorAll("[data-tmv]").forEach(b => b.addEventListener("click", () => { buzz(6); ctx.act(c => { if(c.s.phase === "teams") c.set({ tm: SB.teams.cycle(c.s.tm, b.dataset.tmv, c.s.tmn) }); }); }));
        r.querySelector("[data-mix]").addEventListener("click", () => ctx.act(c => { if(c.s.phase === "teams") c.set({ tm: SB.teams.split(c.ids, c.s.tmn) }); }));
        r.querySelector("[data-go]").addEventListener("click", () => ctx.act(c => { if(c.s.phase === "teams" && SB.teams.ok(c.s.tm, c.s.tmn, c.ids)) c.set({ phase: "load" }); }));
      });
      return;
    }
    const g2 = s.tw === "inverse" ? (s.guess === "titre" ? "artiste" : "titre") : s.guess;
    const q = '<p class="howto" style="text-align:center; margin:0">' + (g2 === "titre" ? tr("Quel est le titre ?", "What's the title?") : s.film === "anime" ? tr("De quel anime ?", "Which anime?") : s.film ? tr("De quel film ?", "Which movie?") : tr("Qui chante ?", "Who's singing?")) + "</p>";
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
      screen(root, "pq" + s.k + (capIn.a != null ? capIn.a : "") + isCap, head + disc(true) + q + '<div class="bt-ch">' + A(s.ch).map((c, i) => '<button type="button" data-a="' + i + '" aria-pressed="' + (+capIn.a === i && capIn.a != null) + '"' + (capIn.a != null || !ctx.playing || !isCap ? " disabled" : "") + ">" + esc(c) + "</button>").join("") + "</div>" +
        '<div class="bt-t" data-t>' + sec + "</div>" + SB.u.dock('<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { buzz(10); ctx.send({ a: +b.dataset.a, t: ctx.now() - s.startAt }); }));
      });
      txt(root, "[data-t]", String(sec));
      const act = btActors(s, live);
      txt(root, "[data-wait]", act.filter(id => { const i = ctx.input(id); return i && i.a != null; }).length + " / " + act.length + tr(" réponses", " answers"));
      return;
    }
    if((s.phase === "play" || s.phase === "buzzed") && s.mode === "buzz"){
      const out = A(s.out), canBuzz = s.phase === "play" && ctx.playing && out.indexOf(me) < 0 && !inp.bz;
      if(s.phase === "buzzed" && ctx.isHost && root.dataset.bzp !== s.k + s.who){ root.dataset.bzp = s.k + s.who; pause(); }
      screen(root, "bz" + s.k + s.phase + (s.who || "") + (inp.bz ? 1 : 0) + ctx.isHost + out.join(), head + disc(s.phase === "play") + q +
        (s.phase === "buzzed" ? '<div class="who" style="text-align:center' + (s.tmn ? "; color:" + SB.teams.color(s.tm[s.who]) : "") + '">' + esc(ctx.name(s.who)) + "</div>" + (s.tmn ? '<p class="sm" style="text-align:center; margin:0">' + SB.teams.pill(s.tm[s.who]) + "</p>" : "") + '<p class="howto" style="text-align:center">' + (s.who === me ? tr("Réponds à voix haute !", "Answer out loud!") : tr("a buzzé ! On écoute sa réponse…", "buzzed! Listen to the answer…")) + "</p>" +
          (ctx.isHost && s.who !== me && ctx.priv().tk ? '<p class="note-box" style="text-align:center">' + tr("Réponse (toi seul la vois) : ", "Answer (only you see it): ") + "<b>" + esc(label(ctx.priv().tk, g2)) + "</b></p>" : "")
          : '<button type="button" class="bt-buzz" data-bz' + (canBuzz ? "" : " disabled") + ">BUZZ</button>" + (out.indexOf(me) >= 0 ? '<p class="sm" style="text-align:center">' + (ctx.isHost && !(s.tmn && SB.teams.members(s.tm, myT, ctx.ids).some(id => id !== me && out.indexOf(id) >= 0)) ? tr("Tu as vu la réponse : plus de buzz pour toi sur cette chanson.", "You saw the answer: no more buzzing for you on this song.") : s.tmn ? tr("Raté : ton équipe ne peut plus buzzer sur cette chanson.", "Wrong: your team can't buzz again on this song.") : tr("Raté : tu ne peux plus buzzer sur cette chanson.", "Wrong: you can't buzz again on this song.")) + "</p>" : "")) +
        SB.u.dock(ctx.isHost ? (s.phase === "buzzed" ? '<div class="row"><button class="btn ghost" type="button" data-no>' + tr("Faux", "Wrong") + '</button><button class="btn acc" type="button" data-yes>' + tr("Juste !", "Right!") + "</button></div>" : '<button class="btn ghost" type="button" data-reveal>' + tr("Personne ne trouve : réponse", "Nobody gets it: reveal") + "</button>") : '<p class="wait"></p>'), r => {
        const b = r.querySelector("[data-bz]"); if(b) b.addEventListener("click", () => { buzz([30, 20, 30]); ctx.send({ bz: ctx.now() }); b.disabled = true; });
        const y = r.querySelector("[data-yes]"); if(y) y.addEventListener("click", () => ctx.act(c => {
          if(c.s.phase !== "buzzed") return; const x = c.s.tw === "x2" ? 2 : 1, pts = Object.assign({}, c.s.pts), tp = Object.assign({}, c.s.tp), got = { [c.s.who]: 2 * x }, tg = {}; pts[c.s.who] = (pts[c.s.who] || 0) + 2 * x;
          if(c.s.tmn){ const t = c.s.tm[c.s.who]; tg[t] = 2 * x; tp[t] = (tp[t] || 0) + 2 * x; }
          c.gage([{ id: c.s.who, ev: "rapide" }], c.s.k + ":ok"); c.set({ phase: "res", pts, tp, res: { tk: c.priv().tk, got, tg } });
        }));
        const nb = r.querySelector("[data-no]"); if(nb) nb.addEventListener("click", () => { resume(); ctx.act(c => {
          if(c.s.phase !== "buzzed") return; c.gage([{ id: c.s.who, ev: "rate" }], c.s.k + ":ko:" + c.s.who); c.set({ phase: "play", out: A(c.s.out).concat(c.s.tmn ? SB.teams.members(c.s.tm, c.s.tm[c.s.who], c.ids) : [c.s.who], c.me !== c.s.who ? [c.me] : []), who: "", startAt: Math.max(c.s.startAt, c.now() - 20000) });
        }); });
        const rv = r.querySelector("[data-reveal]"); if(rv) rv.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "play") c.set({ phase: "res", res: { tk: c.priv().tk, got: {}, none: 1 } }); }));
      });
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {}, tk = R.tk || {}, last = s.n >= s.rounds;
      const ch = s.mode === "qcm" ? '<div class="bt-ch">' + A(s.ch).map((c, i) => '<button type="button" disabled class="' + (i === R.ok ? "ok" : capIn.a != null && +capIn.a === i ? "ko" : "") + '">' + esc(c) + "</button>").join("") + "</div>" : "";
      const got = R.got || {}, gk = Object.keys(got).sort((a, b) => got[b] - got[a]), nm = id => (s.tmn ? ctx.name(id) + " (" + SB.teams.name(s.tm[id]) + ")" : ctx.name(id));
      screen(root, "rs" + s.k + ctx.isHost, head + ansHTML(tk, g2) + ch + (gk.length ? '<p class="sm" style="text-align:center">' + esc(gk.map(id => nm(id) + " +" + got[id]).join(" · ")) + "</p>" : '<p class="sm" style="text-align:center">' + tr("Personne n'a trouvé !", "Nobody got it!") + "</p>") + (s.tmn ? SB.teams.board(s.tm, s.tmn, s.tp || {}, ctx.ids, ctx.name, R.tg) : standings(ctx.ids, s.pts, ctx.name)) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Chanson suivante", "Next song")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => { pause(); ctx.act(c => { if(c.s.phase !== "res") return; if(c.s.n >= c.s.rounds) c.set({ phase: "end" }); else nextSong(c); }); });
      });
      return;
    }
    if(s.phase === "end"){
      if(ctx.isHost) pause();
      const p = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0)), TB = s.tmn ? SB.teams.best(s.tp || {}, s.tmn) : null;
      screen(root, "end" + ctx.isHost, CSS + (TB ? '<span class="eyebrow">' + tr("Les meilleures oreilles", "The best ears") + '</span><div class="who" style="color:' + SB.teams.color(TB.win[0]) + '">' + esc(TB.win.map(SB.teams.name).join(" & ")) + "</div>" + SB.teams.board(s.tm, s.tmn, s.tp || {}, ctx.ids, ctx.name)
        : '<span class="eyebrow">' + tr("Meilleure oreille", "Best ear") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + standings(ctx.ids, p, ctx.name)) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          if(c.s.tmn){
            const B = SB.teams.best(c.s.tp || {}, c.s.tmn);
            c.end({ title: tr("Blind test : les ", "Blind Test: ") + B.win.map(SB.teams.name).join(" & "), lines: SB.teams.ids(c.s.tmn).sort((x, y) => ((c.s.tp || {})[y] || 0) - ((c.s.tp || {})[x] || 0)).map((t, i) => (i + 1) + ". " + SB.teams.name(t) + " · " + ((c.s.tp || {})[t] || 0) + " pts"), win: B.mx > 0 ? c.ids.filter(id => B.win.indexOf(c.s.tm[id]) >= 0) : [] });
            return;
          }
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
      let tmn = [2, 3, 4].indexOf(st.btTeams) >= 0 && names.length >= st.btTeams ? st.btTeams : 0, tm = tmn ? SB.teams.split(names, tmn) : {};
      const units = () => (tmn ? SB.teams.ids(tmn) : names), uname = u => (tmn ? SB.teams.name(u) : u), memb = u => (tmn ? SB.teams.members(tm, u, names) : [u]);
      const brd = () => (tmn ? SB.teams.board(tm, tmn, pts, names, z => z) : standings(names, pts, z => z));
      function setup(){
        pause();
        const packs = SB.music.packs().filter(SB.packOk);
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Le téléphone joue l'extrait : criez la réponse ! Ensuite, touchez le prénom de celui qui a trouvé en premier.", "The phone plays the clip: shout the answer! Then tap the name of whoever got it first.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("On devine", "Guess the") + '</span><div class="seg">' + [["artiste", tr("L'artiste", "Artist")], ["titre", tr("Le titre", "Title")]].map(x => '<button type="button" data-g="' + x[0] + '" aria-pressed="' + (guess === x[0]) + '">' + x[1] + "</button>").join("") + "</div></div>" +
          (names.length >= 2 ? '<div class="field"><span class="eyebrow">' + tr("Équipes", "Teams") + '</span><div class="seg">' + [[0, tr("Non", "No")], [2, "2"], [3, "3"], [4, "4"]].map(v => '<button type="button" data-tmn="' + v[0] + '" aria-pressed="' + (tmn === v[0]) + '"' + (v[0] && names.length < v[0] ? " disabled" : "") + ">" + v[1] + "</button>").join("") + "</div>" +
            (tmn ? SB.teams.grid(tm, tmn, names, z => z, true) + '<button class="link" type="button" data-mix style="align-self:flex-start">' + tr("Mélanger les équipes", "Shuffle the teams") + "</button>" : "") + "</div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Chansons", "Songs") + '</span><div class="seg">' + [10, 15, 20].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (rounds === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Thèmes", "Themes") + '</span><div class="packs">' + packs.map(p => '<button type="button" class="pack" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Ajouter ma playlist Deezer", "Add my Deezer playlist") + "</button></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Charger les extraits", "Load the clips") + "</button>"), r => {
          r.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { guess = b.dataset.g; persist({ btGuess: guess }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ btRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-tmn]").forEach(b => b.addEventListener("click", () => { tmn = +b.dataset.tmn; tm = tmn ? SB.teams.split(names, tmn) : {}; persist({ btTeams: tmn }); setup(); }));
          r.querySelectorAll("[data-tmv]").forEach(b => b.addEventListener("click", () => { tm = SB.teams.cycle(tm, b.dataset.tmv, tmn); buzz(6); setup(); }));
          const mx = r.querySelector("[data-mix]"); if(mx) mx.addEventListener("click", () => { tm = SB.teams.split(names, tmn); setup(); });
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ btPacks: sel }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ btTw: twOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => SB.music.editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un thème", "Pick at least one theme")); return; }
            if(tmn && !SB.teams.ok(tm, tmn, names)){ SB.u.toast(tr("Chaque équipe doit avoir au moins un joueur", "Every team needs at least one player")); return; }
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
        screen(root, "rd" + gno + ":" + n, head() + disc(false) + '<p class="howto" style="text-align:center">' + (g2() === "titre" ? tr("Trouvez le titre !", "Find the title!") : tk.f === "anime" ? tr("Trouvez l'anime !", "Find the anime!") : tk.f ? tr("Trouvez le film !", "Find the movie!") : tr("Trouvez l'artiste !", "Find the artist!")) + "</p>" +
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
        screen(root, "rv" + gno + ":" + n + found.join(","), head() + ansHTML(tk, g2()) + (names.length ? '<p class="howto" style="text-align:center; margin:0">' + (tmn ? tr("Quelle équipe a trouvé en premier ?", "Which team got it first?") : tr("Qui a trouvé en premier ?", "Who got it first?")) + '</p><div class="bt-ch">' + units().map(x => '<button type="button" data-who="' + esc(x) + '" aria-pressed="' + (found.indexOf(x) >= 0) + '"' + (tmn ? ' style="border-color:' + SB.teams.color(x) + '"' : "") + ">" + esc(uname(x)) + "</button>").join("") + "</div>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (found.length ? tr("Valider", "Confirm") : tr("Personne", "Nobody")) + "</button>"), r => {
          r.querySelectorAll("[data-who]").forEach(b => b.addEventListener("click", () => { found = found[0] === b.dataset.who ? [] : [b.dataset.who]; buzz(6); reveal(); }));
          r.querySelector("[data-n]").addEventListener("click", () => {
            pause();
            const x = tw && tw.id === "x2" ? 2 : 1;
            if(found.length){ pts[found[0]] = (pts[found[0]] || 0) + 2 * x; if(api.gage) api.gage([{ id: memb(found[0])[0], ev: "rapide" }], "bt" + tok + "-" + gno + ":" + n); }
            screen(root, "sc" + gno + ":" + n, head() + brd() + SB.u.dock('<button class="btn acc" type="button" data-n>' + (n >= rounds ? tr("Voir le classement", "See the standings") : tr("Chanson suivante", "Next song")) + "</button>"), r2 => {
              r2.querySelector("[data-n]").addEventListener("click", () => { if(n >= rounds) end(); else next(); });
            });
          });
        });
      }
      function end(){
        pause();
        const order = units().slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[order[0]] || 0, best = order.filter(x => (pts[x] || 0) === mx);
        if(api.win) api.win(mx ? [].concat(...best.map(memb)) : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + (tmn ? tr("Les meilleures oreilles", "The best ears") : tr("Meilleure oreille", "Best ear")) + '</span><div class="who"' + (tmn ? ' style="color:' + SB.teams.color(best[0]) + '"' : "") + ">" + esc(best.map(uname).join(" & ")) + "</div>" + brd() +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// En équipes (QCM), seuls les capitaines répondent.
function btActors(s, live){ return s.tmn && s.mode === "qcm" ? Object.keys(s.caps || {}).map(t => s.caps[t]).filter(id => id && live.indexOf(id) >= 0) : live; }
// Prépare la chanson suivante (chez l'hôte) : morceau secret dans priv, choix publics.
function nextSong(c){
  const pv = c.priv(), pool = A(pv.pool).slice(), s = c.s;
  if(!pool.length){ c.set({ phase: "end" }); return; }
  const tk = pool.pop(), t = s.n >= 1 && c.opts.twists !== false ? SB.u.twist(TW, { last: s.tw, rate: .3 }) : null, tw = t ? t.id : "";
  const g = tw === "inverse" ? (s.guess === "titre" ? "artiste" : "titre") : s.guess, C = choicesFor(tk, A(g === "titre" ? pv.tits : tk.f === "film" ? pv.films : tk.f === "anime" ? pv.animes : pv.arts), g);
  c.setPriv({ pool, arts: pv.arts, films: pv.films, animes: pv.animes, tits: pv.tits, tk, ok: C.ok });
  const caps = {}; if(s.tmn) SB.teams.ids(s.tmn).forEach(tt => { caps[tt] = SB.teams.captain(s.tm, tt, c.ids, s.n + 1, c.here); });
  c.set({ caps, phase: "ready", n: s.n + 1, tw, film: tk.f || "", ch: s.mode === "qcm" ? C.ch : [], res: null, out: [], who: "", startAt: 0, k: c.rid() });
}
})();
