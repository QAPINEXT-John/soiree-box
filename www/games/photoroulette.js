/* Photo roulette — chacun choisit quelques photos de sa galerie, une s'affiche : c'est la photo de qui ?
   Réseau : les photos restent sur le téléphone de leur propriétaire. Une photo n'est envoyée (chiffrée,
   par morceaux, jamais gardée par les serveurs) qu'au moment où elle s'affiche, puis tout est effacé à la fin.
   Un seul téléphone : chacun ajoute ses photos à son tour, puis on devine tous ensemble. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz, toast, tr } = SB.u;

const TW = [
  { id: "flou", name: tr("Photo floue", "Blurry photo"), desc: tr("La photo devient nette petit à petit. Qui la reconnaîtra en premier ?", "The photo slowly comes into focus. Who'll recognize it first?") },
  { id: "zoom", name: tr("Gros plan", "Close-up"), desc: tr("La photo commence en très gros plan, puis le zoom recule peu à peu.", "The photo starts as an extreme close-up, then slowly zooms out.") },
  { id: "double", name: tr("Points doublés", "Double points"), desc: tr("Une bonne réponse rapporte le double.", "A right answer is worth double.") },
  { id: "eclair", name: tr("Éclair", "Flash"), desc: tr("La photo n'apparaît que 3 secondes. Ouvre bien les yeux.", "The photo only shows for 3 seconds. Keep your eyes peeled."), net: true }
];
const CSS = '<style>' +
  '.pr-ph{position:relative; overflow:hidden; border-radius:20px; background:var(--soft); aspect-ratio:4/5; max-height:38vh; width:100%; display:grid; place-items:center}' +
  '.pr-ph.sm{max-height:24vh; aspect-ratio:auto; height:24vh}.pr-ph img{width:100%; height:100%; object-fit:contain; transition:filter .4s linear, transform .4s linear}' +
  '.pr-ph .pr-hide{position:absolute; inset:0; display:grid; place-items:center; background:var(--soft); color:var(--muted); font-weight:700}' +
  '.pr-who{display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px}' +
  '.pr-who button{min-height:52px; border-radius:14px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:16px; padding:8px; overflow-wrap:anywhere}' +
  '.pr-who button[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--on-acc)}' +
  '.pr-thumbs{display:grid; grid-template-columns:repeat(auto-fill,minmax(76px,1fr)); gap:6px}' +
  '.pr-thumbs div{position:relative; aspect-ratio:1; border-radius:12px; overflow:hidden; background:var(--soft)}' +
  '.pr-thumbs img{width:100%; height:100%; object-fit:cover}' +
  '.pr-thumbs button{position:absolute; top:4px; right:4px; width:28px; height:28px; border-radius:99px; border:0; background:rgba(0,0,0,.65); color:#fff; font-weight:800}' +
  '.pr-hid{display:grid !important; place-items:center; font-family:var(--f-disp); font-weight:800; font-size:28px; color:var(--muted); background:repeating-linear-gradient(45deg,var(--soft),var(--soft) 8px,var(--card) 8px,var(--card) 16px) !important}' +
  '.row2{display:grid; grid-template-columns:1fr 1fr; gap:8px}.row2 .btn{font-size:15px; padding-inline:8px}.pr-mode{margin-bottom:4px}' +
  '.pr-file{position:absolute; width:1px; height:1px; opacity:0; pointer-events:none}' +
  '.pr-res{list-style:none; margin:0; padding:0; display:grid; gap:6px}' +
  '.pr-res li{display:flex; justify-content:space-between; gap:10px; padding:9px 12px; border-radius:12px; background:var(--soft)}' +
  '.pr-res li.ok b{color:var(--ok)}.pr-res .pts{font-variant-numeric:tabular-nums; font-weight:800; white-space:nowrap}' +
  '.pr-cd{font-family:var(--f-disp); font-weight:800; font-size:22px; color:var(--acc); text-align:center}' +
  '</style>';
const PRIVACY = tr("Tu choisis toi-même tes photos. N'en mets aucune que tu ne veux pas montrer au groupe.", "You pick your photos yourself. Don't add any you wouldn't want the group to see.");

/* ---------- Photos : réduites et compressées sur le téléphone ---------- */
function shrink(file){
  return new Promise(res => {
    if(!file || !/^image\//.test(file.type || "image/")){ res(null); return; }
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      try{
        const M = 640, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, M / Math.max(w, h, 1));
        const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
        const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        let d = c.toDataURL("image/jpeg", .6);
        if(d.length > 150000) d = c.toDataURL("image/jpeg", .42);
        res(d.length <= 400000 && /^data:image\/jpeg;base64,/.test(d) ? d : null);
      }catch(e){ res(null); }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  });
}
// Ancienne appli Android : le choix de photos n'y marche pas (il faut l'APK 4.6 ou plus récent).
const APK_MSG = tr("Pour ce jeu, la mise à jour dans l'appli ne suffit pas : il faut réinstaller l'appli (une seule fois) pour qu'elle puisse accéder à ta galerie. Appuie sur le bouton, télécharge le fichier, puis installe-le par-dessus l'ancienne version (tes réglages sont conservés).",
  "For this game, the in-app update isn't enough: you need to reinstall the app (just once) so it can access your gallery. Tap the button, download the file, then install it over the old version (your settings are kept).");
const apkBtn = '<button class="btn ghost" type="button" data-apk>' + tr("Télécharger la nouvelle appli", "Download the new app") + "</button>";
const bindApk = r => { const b = r.querySelector("[data-apk]"); if(b) b.addEventListener("click", () => { try{ window.AndroidUpdate.openApk(); }catch(e){} }); };
const oldApk = () => !!window.AndroidUpdate && !(window.AndroidShare && typeof window.AndroidShare.photos === "function");

/* Écran de choix des photos, commun au réseau et au mode un seul téléphone. */
function pickerHTML(imgs, max){
  const full = imgs.length >= max;
  return '<p class="note-box">' + esc(PRIVACY) + "</p>" +
    '<div class="field"><span class="eyebrow">' + tr("Tes photos · ", "Your photos · ") + imgs.length + " / " + max + "</span>" +
    (imgs.length ? '<div class="pr-thumbs">' + imgs.map((d, i) => '<div><img alt="" src="' + d + '"><button type="button" data-rm="' + i + '" aria-label="' + tr("Retirer", "Remove") + '">×</button></div>').join("") + "</div>" : '<p class="sm">' + tr("Aucune photo pour l'instant.", "No photos yet.") + "</p>") +
    "</div>" +
    '<input class="pr-file" type="file" accept="image/*" multiple data-file>' +
    (full ? "" : '<button class="btn ghost" type="button" data-add>' + (imgs.length ? tr("Ajouter des photos", "Add photos") : tr("Choisir dans ma galerie", "Pick from my gallery")) + "</button>");
}
function bindPicker(r, imgs, max, onChange){
  const inp = r.querySelector("[data-file]"), add = r.querySelector("[data-add]");
  if(add) add.addEventListener("click", () => inp.click());
  inp.addEventListener("change", async () => {
    const files = Array.from(inp.files || []).slice(0, Math.max(0, max - imgs.length));
    if(!files.length) return;
    if(add){ add.disabled = true; add.textContent = tr("Préparation des photos…", "Preparing photos…"); }
    let bad = 0;
    for(const f of files){ const d = await shrink(f); if(d && imgs.length < max) imgs.push(d); else bad++; }
    if(bad) toast(bad > 1 ? tr(bad + " photos n'ont pas pu être lues", bad + " photos couldn't be read") : tr("Une photo n'a pas pu être lue", "One photo couldn't be read"));
    if(Array.from(inp.files || []).length > files.length) toast(tr(max + " photos maximum", max + " photos max"));
    inp.value = "";
    onChange();
  });
  r.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => { imgs.splice(+b.dataset.rm, 1); onChange(); }));
}

/* ---------- Tirage au hasard dans la galerie (comme le vrai Photo roulette) ----------
   Appli Android récente : le jeu pioche lui-même dans toute la galerie, après l'autorisation « Photos ».
   iPhone, site ou appli plus ancienne : le joueur sélectionne un gros paquet de photos, le jeu en garde quelques-unes au hasard.
   Dans les deux cas, le joueur peut jouer la surprise ou regarder ses photos et en changer avant de valider. */
const nativeGal = () => !!(window.AndroidGallery && typeof window.AndroidGallery.random === "function");
const GAL = { n: 0, cb: {} };
SB.onGallery = e => { const f = e && GAL.cb[e.req]; if(f) f(e); };
function galDraw(n){
  return new Promise(res => {
    const req = "g" + (++GAL.n), out = [];
    const fin = (t, x) => { if(!GAL.cb[req]) return; delete GAL.cb[req]; clearTimeout(tm); res(Object.assign({ imgs: out, t }, x || {})); };
    const tm = setTimeout(() => fin("error"), 90000);
    GAL.cb[req] = e => {
      if(e.t === "img"){ if(typeof e.d === "string" && /^data:image\/jpeg;base64,/.test(e.d) && e.d.length < 400000) out.push(e.d); }
      else fin(e.t, { total: +e.total || 0 });
    };
    try{ window.AndroidGallery.random(n, req); }catch(err){ fin("error"); }
  });
}
async function poolDraw(P, n){
  const out = [];
  while(out.length < n && P.pool.length){ const d = await shrink(P.pool.pop()); if(d) out.push(d); }
  return out;
}
function drawHTML(P, max){
  const nat = nativeGal(), n = P.imgs.length;
  let h = '<div class="seg pr-mode"><button type="button" data-mode="hasard" aria-pressed="' + (P.mode === "hasard") + '">' + tr("Au hasard", "Random") + '</button><button type="button" data-mode="choix" aria-pressed="' + (P.mode === "choix") + '">' + tr("Je choisis", "I'll choose") + "</button></div>";
  if(P.mode === "choix") return h + '<p class="howto">' + tr("Choisis jusqu'à " + max + " photos de ta galerie. Les autres devront deviner qu'elles sont à toi.", "Pick up to " + max + " photos from your gallery. The others will have to guess they're yours.") + "</p>" + pickerHTML(P.imgs, max);
  h += '<p class="note-box">' + tr("Le jeu tire " + max + " photos au hasard dans ta galerie, comme dans le vrai Photo roulette. Elles ne sont montrées au groupe que pendant la partie, puis effacées. Tu peux garder la surprise, ou les regarder et en changer avant de valider.", "The game draws " + max + " random photos from your gallery, just like the real Photo Roulette. They're only shown to the group during the game, then erased. Keep the surprise, or look at them and swap some before confirming.") + "</p>";
  h += '<input class="pr-file" type="file" accept="image/*" multiple data-pool>';
  if(P.busy) return h + '<div class="card"><b>' + tr("Tirage au hasard…", "Drawing at random…") + '</b><span class="sm">' + (nat ? tr("Si le téléphone te le demande, autorise l'accès aux photos.", "If your phone asks, allow access to your photos.") : tr("Préparation des photos…", "Preparing photos…")) + "</span></div>";
  if(!n){
    h += nat ? '<button class="btn acc" type="button" data-draw>' + tr("Tirer " + max + " photos au hasard", "Draw " + max + " random photos") + "</button>"
      : '<p class="sm">' + tr("Sélectionne un maximum de photos d'un coup, au moins " + max * 4 + " (sur iPhone, fais glisser ton doigt sur les photos). Le jeu en garde " + max + " au hasard.", "Select as many photos as you can in one go, at least " + max * 4 + " (on iPhone, slide your finger across the photos). The game keeps " + max + " of them at random.") + '</p><button class="btn ghost" type="button" data-draw>' + tr("Sélectionner un lot de photos", "Select a batch of photos") + "</button>";
    if(P.denied) h += '<p class="note-box">' + tr("Accès aux photos refusé. Tu peux l'autoriser dans les réglages Android (Soirée Box › Autorisations › Photos), ou passer en « Je choisis ».", "Photo access denied. You can allow it in Android settings (Soirée Box › Permissions › Photos), or switch to “I'll choose”.") + "</p>";
    if(window.AndroidUpdate && !nat && !oldApk()) h += '<p class="sm">' + tr("Avec la dernière version de l'appli, le tirage se fait directement dans toute ta galerie.", "With the latest version of the app, photos are drawn straight from your whole gallery.") + "</p>" + apkBtn;
    return h;
  }
  h += '<div class="field"><span class="eyebrow">' + tr(n + " photo" + (n > 1 ? "s" : "") + " tirée" + (n > 1 ? "s" : "") + " au hasard" + (P.look ? "" : " · cachées"), SB.u.plural2(n, "", "", "random photo") + " drawn" + (P.look ? "" : " · hidden")) + "</span>";
  h += '<div class="pr-thumbs">' + P.imgs.map((d, i) => P.look
    ? '<div><img alt="" src="' + d + '"><button type="button" data-re="' + i + '" aria-label="' + tr("Changer cette photo", "Swap this photo") + '">↻</button></div>'
    : '<div class="pr-hid">?</div>').join("") + "</div></div>";
  h += '<div class="row2"><button class="btn ghost" type="button" data-look>' + (P.look ? tr("Cacher mes photos", "Hide my photos") : tr("Les regarder (et changer)", "Look (and swap)")) + '</button><button class="btn ghost" type="button" data-redraw>' + tr("Nouveau tirage", "New draw") + "</button></div>";
  if(P.look) h += '<p class="sm">' + tr("Appuie sur ↻ pour remplacer une photo par une autre, tirée au hasard.", "Tap ↻ to replace a photo with another random one.") + "</p>";
  return h;
}
function bindDraw(r, P, max, onChange){
  const nat = nativeGal(), inp = r.querySelector("[data-pool]");
  const v = () => { P.v = (P.v || 0) + 1; onChange(); };
  r.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { if(P.busy || P.mode === b.dataset.mode) return; P.mode = b.dataset.mode; P.imgs.length = 0; P.look = false; persist({ prMode: P.mode }); v(); }));
  if(P.mode === "choix"){ bindPicker(r, P.imgs, max, v); return; }
  // count photos à tirer, à mettre à la place `at` (ou à la suite)
  async function draw(count, at){
    if(P.busy) return;
    if(!nat && !P.pool.length){ P.want = [count, at]; inp.click(); return; }
    P.busy = true; P.denied = false; v();
    let got = [];
    if(nat){ const res = await galDraw(count); got = res.imgs; if(res.t === "denied") P.denied = true; else if(!got.length) toast(res.total === 0 ? tr("Aucune photo trouvée dans la galerie", "No photos found in the gallery") : tr("Le tirage a échoué, réessaie", "The draw failed, try again")); }
    else got = await poolDraw(P, count);
    P.busy = false;
    if(at == null) got.forEach(d => { if(P.imgs.length < max) P.imgs.push(d); });
    else if(got[0]) P.imgs[at] = got[0];
    else if(!nat) toast(tr("Plus de photos dans ta sélection : fais un nouveau tirage pour en choisir d'autres", "No more photos in your selection: do a new draw to pick others"));
    v();
  }
  if(inp) inp.addEventListener("change", () => {
    const files = Array.from(inp.files || []).filter(f => /^image\//.test(f.type || "image/"));
    inp.value = "";
    if(!files.length) return;
    P.pool = shuffle(files);
    if(files.length < max) toast(tr("Seulement " + files.length + " photo" + (files.length > 1 ? "s" : "") + " sélectionnée" + (files.length > 1 ? "s" : ""), "Only " + SB.u.plural2(files.length, "", "", "photo") + " selected"));
    const w = P.want || [max, null]; P.want = null; draw(w[0], w[1]);
  });
  const d = r.querySelector("[data-draw]"); if(d) d.addEventListener("click", () => draw(max, null));
  const lk = r.querySelector("[data-look]"); if(lk) lk.addEventListener("click", () => { P.look = !P.look; v(); });
  const rd = r.querySelector("[data-redraw]"); if(rd) rd.addEventListener("click", () => { if(P.busy) return; P.imgs.length = 0; P.look = false; if(!nat) P.pool = []; draw(max, null); });
  r.querySelectorAll("[data-re]").forEach(b => b.addEventListener("click", () => draw(1, +b.dataset.re)));
  bindApk(r);
}

/* Ordre des photos : jamais deux fois de suite le même propriétaire quand c'est possible. */
function deal(counts, rounds){
  const left = {}; Object.keys(counts).forEach(id => { if(counts[id] > 0) left[id] = shuffle(Array.from({ length: counts[id] }, (_, i) => i)); });
  const out = []; let last = "";
  for(;;){
    const ids = Object.keys(left).filter(id => left[id].length);
    if(!ids.length || out.length >= rounds) break;
    const pool = ids.length > 1 ? ids.filter(id => id !== last) : ids;
    const tot = pool.reduce((n, id) => n + left[id].length, 0);
    let x = Math.random() * tot, who = pool[0];
    for(const id of pool){ x -= left[id].length; if(x < 0){ who = id; break; } }
    out.push([who, left[who].pop()]); last = who;
  }
  return out;
}
const topOf = sc => { const mx = Math.max.apply(null, Object.keys(sc).map(k => sc[k]).concat([0])); return mx > 0 ? Object.keys(sc).filter(k => sc[k] === mx) : []; };
function rankHTML(rows){
  let rk = 0, prev = null;
  return '<ul class="pr-res">' + rows.map((r, i) => { if(r[1] !== prev){ rk = i + 1; prev = r[1]; } return "<li><span>" + rk + ". " + esc(r[0]) + '</span><span class="pts">' + r[1] + " pt" + (tr(r[1] > 1, r[1] !== 1) ? "s" : "") + "</span></li>"; }).join("") + "</ul>";
}
// Effet visuel de la manche (flou ou zoom qui diminuent avec le temps).
function fxStyle(tw, since){
  const p = Math.min(1, Math.max(0, since / 9000));
  if(tw === "flou") return "filter:blur(" + (22 * (1 - p)).toFixed(1) + "px)";
  if(tw === "zoom") return "transform:scale(" + (1 + 3 * (1 - p)).toFixed(2) + ")";
  return "";
}

/* ---------- Réseau ---------- */
const newPick = () => ({ imgs: [], mode: store().prMode === "choix" ? "choix" : "hasard", look: false, busy: false, pool: [], v: 0 });
const MY = Object.assign({ pid: "", put: {} }, newPick());
function mine(s){ if(MY.pid !== s.pid){ Object.assign(MY, newPick(), { pid: s.pid, put: {} }); } return MY; }
function wipe(ctx){ Object.assign(MY, newPick(), { pid: "", put: {} }); if(ctx && ctx.blob) ctx.blob.clear(); }

function nextRound(c){
  const st = c.s, deck = A(c.priv().deck).map(A);
  const sc = st.sc || {};
  if(!deck.length || st.round >= st.rounds){ c.set({ phase: "end", k: c.rid() }); return; }
  const [o, i] = deck.shift(); c.setPriv({ deck });
  const tw = st.twOn && st.round >= 1 ? SB.u.twist(TW, { rate: .3, last: st.tw || "" }) : null;
  const t0 = c.now(), lim = st.timer ? (tw && tw.id === "eclair" ? 15 : st.timer) : 0;
  c.set({ phase: "show", round: st.round + 1, o, i, b: "p" + c.rid() + c.rid(), tw: tw ? tw.id : "", t0, lim, at: 0, dl: 0, k: c.rid(), sc });
}

SB.register({
  id: "photoroulette", name: tr("Photo roulette", "Photo Roulette"), glyph: tr("Clic", "Snap"), pitch: tr("Une photo s'affiche : de quelle galerie sort-elle ?", "A photo pops up: whose gallery is it from?"),
  accent: { light: "#e8590c", dark: "#ff8a4c" },
  tag: tr("Chacun choisit quelques photos de sa galerie. Une photo s'affiche : à qui est-elle ?", "Everyone picks a few photos from their gallery. A photo pops up: whose is it?"),
  min: 3, max: 12, ticks: true,
  rules: tr([
    "Au hasard (par défaut) : le jeu tire quelques photos dans ta galerie, directement sur ton téléphone et seulement quand tu appuies sur « Tirer ». Garde la surprise, ou regarde-les et remplace celles que tu ne veux pas montrer.",
    "Je choisis : tu sélectionnes toi-même tes photos.",
    "Une photo s'affiche sur tous les téléphones. Devine à qui elle appartient.",
    "Bonne réponse : 2 points, plus 1 point bonus pour le plus rapide. Si personne ne trouve, le (la) propriétaire gagne 2 points.",
    "Si c'est ta photo, vote quand même pour brouiller les pistes.",
    "En réseau, une photo ne quitte ton téléphone qu'au moment où elle s'affiche. Elle est chiffrée avec le code du salon, passe par des serveurs publics sans y être conservée, et tout est effacé à la fin de la partie.",
    "Coups de théâtre : photo floue, gros plan, points doublés, éclair."
  ], [
    "Random (default): the game draws a few photos from your gallery, right on your phone and only when you tap “Draw”. Keep the surprise, or look at them and replace any you don't want to show.",
    "I'll choose: you pick your photos yourself.",
    "A photo shows up on every phone. Guess who it belongs to.",
    "Right answer: 2 points, plus 1 bonus point for the fastest. If nobody gets it, the owner scores 2 points.",
    "If it's your photo, vote anyway to throw everyone off.",
    "Online, a photo only leaves your phone at the moment it's shown. It's encrypted with the room code, passes through public servers without being stored there, and everything is erased at the end of the game.",
    "Plot twists: blurry photo, close-up, double points, flash."
  ]),
  options: [
    { id: "per", label: tr("Photos par joueur", "Photos per player"), type: "seg", def: 5, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "rounds", label: tr("Photos dans la partie", "Photos in the game"), type: "seg", def: 15, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 25, label: "25" }] },
    { id: "timer", label: tr("Chrono", "Timer"), type: "seg", def: 20, values: [{ v: 0, label: tr("Sans", "Off") }, { v: 20, label: "20 s" }, { v: 30, label: "30 s" }] },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("Photo floue, gros plan, points doublés…", "Blurry photo, close-up, double points…"), def: true }
  ],
  start(ctx, o){
    const sc = {}; ctx.players.forEach(p => { sc[p.id] = 0; });
    if(!ctx.blob || !ctx.blob.ok) throw new Error(tr("En réseau, Photo roulette a besoin du relais Internet. Ici, joue plutôt sur un seul téléphone.", "Online, Photo Roulette needs the internet relay. Here, play on a single phone instead."));
    return { phase: "pick", lg: SB.lang(), pid: "g" + ctx.rid(), per: o.per || 5, rounds: o.rounds || 15, timer: o.timer == null ? 20 : +o.timer, twOn: o.twists !== false, round: 0, sc, cnt: {}, who: [], hist: [] };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "pick"){
      const allOk = live.length > 0 && live.every(id => { const i = ctx.input(id); return i && i.ok; });
      if(!s.go && !allOk) return;
      const cnt = {};
      ctx.ids.forEach(id => { const i = ctx.input(id); if(i && i.ok) cnt[id] = Math.max(0, Math.min(s.per, Math.floor(+i.n || 0))); });
      const who = Object.keys(cnt).filter(id => cnt[id] > 0);
      if(who.length < 2){ if(s.go) ctx.set({ go: 0 }); return; }
      const deck = deal(cnt, s.rounds);
      ctx.setPriv({ deck });
      ctx.set({ cnt, who, rounds: deck.length, go: 0 });
      nextRound(ctx);
      return;
    }
    if(s.phase !== "show") return;
    const now = ctx.now(), oi = ctx.input(s.o);
    // Propriétaire parti ou photo perdue (appli relancée) : on passe à la suivante.
    if((oi && oi.miss) || (!ctx.here(s.o) && now - s.t0 > 8000) || (!s.at && now - s.t0 > 25000)){ nextRound(ctx); return; }
    // Le chrono part quand la photo est arrivée chez presque tout le monde.
    const others = live.filter(id => id !== s.o);
    if(!s.at){
      const got = others.filter(id => { const i = ctx.input(id); return i && i.got; }).length;
      if(got >= Math.max(1, Math.ceil(others.length * .6)) || now - s.t0 > 10000) ctx.set({ at: now, dl: s.lim ? now + s.lim * 1000 : 0 });
      return;
    }
    const voted = others.filter(id => { const i = ctx.input(id); return i && i.v; });
    if(!(voted.length >= others.length || (s.dl && now > s.dl) || s.rev)) return;
    const sc = Object.assign({}, s.sc), got = {}, votes = {};
    const mult = s.tw === "double" ? 2 : 1;
    ctx.ids.filter(id => id !== s.o).forEach(id => { const i = ctx.input(id); if(i && typeof i.v === "string") votes[id] = [i.v, +i.t || 0]; });
    const right = Object.keys(votes).filter(id => votes[id][0] === s.o);
    right.forEach(id => { got[id] = 2 * mult; });
    if(right.length){ const fast = right.slice().sort((a, b) => votes[a][1] - votes[b][1])[0]; got[fast] += 1; }
    else if(Object.keys(votes).length) got[s.o] = 2;
    Object.keys(got).forEach(id => { sc[id] = (sc[id] || 0) + got[id]; });
    ctx.set({ phase: "res", votes, got, sc, rev: 0, hist: A(s.hist).concat([[s.o, right.length, Object.keys(votes).length]]) });
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, M = mine(s), T = SB.u.byTwist(TW, s.tw);
    if(s.phase === "pick"){
      const live = ctx.ids.filter(id => ctx.here(id)), my = ctx.mine() || {};
      const ready = ctx.ids.filter(id => { const i = ctx.input(id); return i && i.ok; });
      const withPh = ready.filter(id => (+ctx.input(id).n || 0) > 0);
      const old = oldApk(), playing = ctx.playing;
      screen(root, "pick" + s.k + "|" + M.imgs.length + "|" + M.v + (my.ok ? 1 : 0) + ctx.isHost + old, CSS +
        '<span class="eyebrow">' + tr("Photo roulette · choix des photos", "Photo Roulette · picking photos") + "</span>" +
        (!playing ? '<p class="howto">' + tr("Tu es spectateur(trice). Les joueurs choisissent leurs photos.", "You're watching. The players are picking their photos.") + "</p>" :
          my.ok ? '<div class="card"><b>' + (M.imgs.length ? tr(M.imgs.length + " photo" + (M.imgs.length > 1 ? "s" : "") + " prête" + (M.imgs.length > 1 ? "s" : "") + (M.mode === "hasard" && !M.look ? " · surprise !" : ""), SB.u.plural2(M.imgs.length, "", "", "photo") + " ready" + (M.mode === "hasard" && !M.look ? " · surprise!" : "")) : tr("Tu joues sans photo", "You're playing without photos")) + '</b><span class="sm">' + tr("Tes photos restent sur ton téléphone jusqu'à ce qu'elles s'affichent.", "Your photos stay on your phone until they're shown.") + '</span></div><button class="link" type="button" data-edit>' + tr("Modifier mes photos", "Change my photos") + "</button>" :
          old ? '<p class="note-box">' + esc(APK_MSG) + tr(" En attendant, tu peux jouer sans photo et deviner quand même.", " Meanwhile, you can play without photos and still guess.") + "</p>" + apkBtn :
          drawHTML(M, s.per)) +
        '<p class="wait" data-wait></p>' +
        dock((playing && !my.ok ? '<button class="btn acc" type="button" data-ok' + (M.imgs.length || old ? "" : " disabled") + ">" + (M.imgs.length ? tr("C'est bon, je joue avec celles-ci", "All good, I'll play these") : old ? tr("Jouer sans photo", "Play without photos") : M.mode === "hasard" ? tr("Tire tes photos d'abord", "Draw your photos first") : tr("Choisis au moins une photo", "Pick at least one photo")) + "</button>" : "") +
          (ctx.isHost ? '<button class="btn ' + (playing && !my.ok ? "ghost" : "acc") + '" type="button" data-go>' + tr("Lancer la partie", "Start the game") + "</button>" : "")), r => {
        if(playing && !my.ok && !old) bindDraw(r, M, s.per, () => { root.dataset.key = ""; ctx.send({ ok: 0, n: M.imgs.length }); });
        const ok = r.querySelector("[data-ok]"); if(ok) ok.addEventListener("click", () => { if(M.busy) return; buzz(15); ctx.send({ ok: 1, n: M.imgs.length }); });
        const ed = r.querySelector("[data-edit]"); if(ed) ed.addEventListener("click", () => ctx.send({ ok: 0, n: M.imgs.length }));
        bindApk(r);
        const go = r.querySelector("[data-go]"); if(go) go.addEventListener("click", () => ctx.act(c => {
          const n = c.ids.filter(id => { const i = c.input(id); return i && i.ok && (+i.n || 0) > 0; }).length;
          if(n < 2){ toast(tr("Il faut au moins 2 joueurs avec des photos prêtes", "You need at least 2 players with photos ready")); return; }
          c.set({ go: 1 });
        }));
      });
      txt(root, "[data-wait]", tr(ready.length + " / " + live.length + " prêts · " + withPh.length + " avec des photos" + (ctx.isHost && ready.length < live.length ? " · tu peux lancer sans attendre" : ""), ready.length + " / " + live.length + " ready · " + withPh.length + " with photos" + (ctx.isHost && ready.length < live.length ? " · you can start without waiting" : "")));
      return;
    }
    if(s.phase === "show" || s.phase === "res"){
      const isOwner = s.o === me, img = ctx.blob.get(s.b), now = ctx.now(), my = ctx.mine() || {};
      // Le propriétaire envoie sa photo, et la renvoie tant que quelqu'un ne l'a pas reçue.
      if(s.phase === "show" && isOwner){
        const d = M.imgs[s.i];
        if(!d){ if(!my.miss) ctx.send({ miss: 1 }); }
        else {
          const others = ctx.ids.filter(id => id !== me && ctx.here(id));
          const missing = others.some(id => { const i = ctx.input(id); return !(i && i.got); });
          if(!M.put[s.b] || (missing && Date.now() - M.put[s.b] > 3500)){ M.put[s.b] = Date.now(); ctx.blob.put(s.b, d); }
          if(!my.got) ctx.send({ got: 1 });
        }
      } else if(s.phase === "show" && img && !my.got) ctx.send({ got: 1 });
      const lab = '<span class="eyebrow">Photo ' + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T);
      const shown = img || (isOwner ? M.imgs[s.i] : null);
      const hidden = s.phase === "show" && s.tw === "eclair" && s.at && now - s.at > 3000 && !isOwner;
      const ph = '<div class="pr-ph">' + (shown ? '<img alt="' + tr("Photo mystère", "Mystery photo") + '" data-img src="' + shown + '">' + (hidden ? '<div class="pr-hide">' + tr("Photo cachée · fais confiance à ta mémoire", "Photo hidden · trust your memory") + "</div>" : "") : '<div class="pr-hide">' + tr("La photo arrive…", "Photo incoming…") + "</div>") + "</div>";
      if(s.phase === "show"){
        const choices = ctx.playing ? A(s.who).filter(id => id !== me) : [];
        screen(root, "show" + s.k + (shown ? 1 : 0) + (hidden ? 1 : 0), CSS + lab + ph +
          '<p class="big" style="margin:4px 0 0">' + (isOwner ? tr("C'est ta photo ! Vote quand même pour brouiller les pistes.", "It's your photo! Vote anyway to throw everyone off.") : tr("À qui est cette photo ?", "Whose photo is this?")) + "</p>" +
          '<div class="pr-who">' + choices.map(id => '<button type="button" data-v="' + esc(id) + '" aria-pressed="' + (my.v === id) + '">' + esc(ctx.name(id)) + "</button>").join("") + "</div>" +
          (s.lim ? '<div class="pr-cd" data-cd></div>' : "") + '<p class="wait" data-wait></p>' +
          (ctx.isHost ? dock('<button class="btn ghost" type="button" data-rev>' + tr("Révéler sans attendre", "Reveal now") + "</button>") : ""), r => {
          r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
            if(!shown && !isOwner){ toast(tr("Attends que la photo arrive", "Wait for the photo to arrive")); return; }
            buzz(10); ctx.send({ v: b.dataset.v, t: ctx.now() });
            r.querySelectorAll("[data-v]").forEach(x => x.setAttribute("aria-pressed", x === b));
          }));
          const rv = r.querySelector("[data-rev]"); if(rv) rv.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "show" && c.s.at) c.set({ rev: 1 }); }));
        });
        const el = root.querySelector("[data-img]");
        if(el && !isOwner){ const st = s.at ? fxStyle(s.tw, now - s.at) : fxStyle(s.tw, 0); if(el.getAttribute("style") !== st) el.setAttribute("style", st); }
        const others = ctx.ids.filter(id => id !== s.o && ctx.here(id)), nv = others.filter(id => { const i = ctx.input(id); return i && i.v; }).length;
        txt(root, "[data-wait]", !s.at ? tr("Envoi de la photo…", "Sending the photo…") : nv + " / " + others.length + " votes");
        if(s.lim) txt(root, "[data-cd]", s.dl ? Math.max(0, Math.ceil((s.dl - now) / 1000)) + " s" : "");
        return;
      }
      // Résultat de la manche.
      const votes = s.votes || {}, got = s.got || {};
      const rows = Object.keys(votes).map(id => '<li class="' + (votes[id][0] === s.o ? "ok" : "") + '"><span>' + esc(ctx.name(id)) + " → <b>" + esc(ctx.name(votes[id][0])) + '</b></span><span class="pts">' + (got[id] ? "+" + got[id] : "") + "</span></li>").join("");
      const sc = s.sc || {}, rank = ctx.ids.map(id => [ctx.name(id), sc[id] || 0]).sort((a, b) => b[1] - a[1]);
      const right = Object.keys(votes).filter(id => votes[id][0] === s.o).length;
      screen(root, "res" + s.k + (shown ? 1 : 0) + ctx.isHost, CSS + '<span class="eyebrow">Photo ' + s.round + " / " + s.rounds + "</span>" +
        '<div class="card"><span class="eyebrow">' + tr("C'était la photo de", "This photo belongs to") + '</span><div class="who">' + esc(ctx.name(s.o)) + "</div>" +
        '<span class="sm">' + (right ? tr((right > 1 ? "Bonnes réponses : " : "Bonne réponse : ") + right + " sur " + Object.keys(votes).length, "Right answers: " + right + " of " + Object.keys(votes).length) : Object.keys(votes).length ? tr("Personne n'a trouvé : " + esc(ctx.name(s.o)) + " gagne 2 points", "Nobody got it: " + esc(ctx.name(s.o)) + " scores 2 points") : tr("Personne n'a voté", "Nobody voted")) + "</span></div>" + ph.replace('class="pr-ph"', 'class="pr-ph sm"') +
        (rows ? '<ul class="pr-res">' + rows + "</ul>" : "") +
        '<div class="field"><span class="eyebrow">' + tr("Classement", "Leaderboard") + "</span>" + rankHTML(rank) + "</div>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le classement final", "See the final standings") : tr("Photo suivante", "Next photo")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "res") nextRound(c); }));
      });
      return;
    }
    if(s.phase === "end"){
      wipe(ctx);
      const sc = s.sc || {}, rank = ctx.ids.map(id => [ctx.name(id), sc[id] || 0]).sort((a, b) => b[1] - a[1]);
      const h = A(s.hist).map(A), byO = {};
      h.forEach(x => { const o = byO[x[0]] = byO[x[0]] || [0, 0]; o[0] += x[1]; o[1] += x[2]; });
      const mys = Object.keys(byO).filter(id => byO[id][1]).sort((a, b) => byO[a][0] / byO[a][1] - byO[b][0] / byO[b][1])[0];
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Classement final", "Final standings") + "</span>" + rankHTML(rank) +
        (mys ? '<div class="card"><span class="eyebrow">' + tr("Galerie la plus mystérieuse", "Most mysterious gallery") + '</span><div class="big">' + esc(ctx.name(mys)) + '</div><span class="sm">' + tr("Ses photos ont été reconnues " + byO[mys][0] + " fois sur " + byO[mys][1], "Their photos were recognized " + byO[mys][0] + " out of " + byO[mys][1] + " times") + "</span></div>" : "") +
        '<p class="sm">' + tr("Toutes les photos de la partie ont été effacées des téléphones.", "All the photos from this game have been erased from the phones.") + "</p>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const scc = c.s.sc || {}, win = topOf(scc), mx = win.length ? scc[win[0]] : 0;
          c.end({ title: tr("Photo roulette · " + (win.length ? win.map(c.name).join(" & ") + " · " + mx + " pts" : "égalité"), "Photo Roulette · " + (win.length ? win.map(c.name).join(" & ") + " · " + mx + " pts" : "tie")), lines: mys ? [tr("Galerie la plus mystérieuse : " + c.name(mys), "Most mysterious gallery: " + c.name(mys))] : [], win });
        }));
      });
    }
  },
  local: {
    players: { min: 3, max: 12 },
    start(root, api){
      const names = api.names, st = store();
      const L = { phase: "setup", per: [3, 5, 8].indexOf(st.prPer) >= 0 ? st.prPer : 5, rounds: [10, 15, 25].indexOf(st.prRounds) >= 0 ? st.prRounds : 15, twOn: st.prTw !== false,
        imgs: names.map(() => []), who: 0, deck: [], n: 0, cur: null, tw: null, sc: {}, found: {}, t0: 0 };
      api.onTick && api.onTick(() => {
        if(L.phase !== "show" || !L.tw) return;
        const el = root.querySelector("[data-img]"); if(el) el.setAttribute("style", fxStyle(L.tw.id, Date.now() - L.t0));
      });
      const go = () => {
        if(L.phase === "setup"){
          screen(root, "setup" + L.per + L.rounds + L.twOn, CSS + '<p class="howto">' + tr("Sur un seul téléphone, toutes les photos viennent de la galerie de ce téléphone. Chacun à son tour en choisit quelques-unes en secret, celles qui lui correspondent le plus. Ensuite, elles défilent : qui a choisi quoi ?", "On a single phone, all the photos come from its gallery. Taking turns, everyone secretly picks a few that feel the most like them. Then they roll by: who picked what?") + '</p><p class="sm">' + tr("Pour le vrai Photo roulette (photos tirées au hasard dans la galerie de chacun), jouez en réseau, chacun sur son téléphone.", "For the real Photo Roulette (random photos from everyone's own gallery), play online, each on your own phone.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Photos par joueur", "Photos per player") + '</span><div class="seg">' + [3, 5, 8].map(v => '<button type="button" data-per="' + v + '" aria-pressed="' + (v === L.per) + '">' + v + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Photos dans la partie", "Photos in the game") + '</span><div class="seg">' + [10, 15, 25].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (v === L.rounds) + '">' + v + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variante", "Variant") + '</span><div class="seg"><button type="button" data-tw aria-pressed="' + L.twOn + '">' + tr("Coups de théâtre : " + (L.twOn ? "oui" : "non"), "Plot twists: " + (L.twOn ? "on" : "off")) + "</button></div></div>" +
            (oldApk() ? '<p class="note-box">' + esc(APK_MSG) + "</p>" + apkBtn : "") +
            '<div class="dock"><button class="btn acc" type="button" data-go' + (oldApk() ? " disabled" : "") + ">" + tr("Commencer", "Start") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
            r.querySelectorAll("[data-per]").forEach(b => b.addEventListener("click", () => { L.per = +b.dataset.per; persist({ prPer: L.per }); go(); }));
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { L.rounds = +b.dataset.r; persist({ prRounds: L.rounds }); go(); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { L.twOn = !L.twOn; persist({ prTw: L.twOn }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => { L.who = 0; L.imgs = names.map(() => []); L.phase = "pass"; go(); });
            r.querySelector("[data-q]").addEventListener("click", api.exit);
            bindApk(r);
          });
        } else if(L.phase === "pass"){
          screen(root, "pass" + L.who, CSS + '<span class="eyebrow">' + tr("Joueur ", "Player ") + (L.who + 1) + " / " + names.length + '</span><p class="howto">' + tr("Passe le téléphone à", "Pass the phone to") + '</p><div class="who">' + esc(names[L.who]) + "</div>" +
            '<p class="sm">' + tr("Les autres, ne regardez pas l'écran.", "Everyone else, don't look at the screen.") + '</p><div class="dock"><button class="btn acc" type="button" data-n>' + tr("C'est moi", "It's me") + "</button></div>", r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "pick"; go(); });
          });
        } else if(L.phase === "pick"){
          const imgs = L.imgs[L.who], last = L.who === names.length - 1;
          screen(root, "pick" + L.who + "|" + imgs.length, CSS + '<span class="eyebrow">' + esc(names[L.who]) + tr(" · tes photos", " · your photos") + '</span><p class="howto">' + tr("Choisis en secret jusqu'à " + L.per + " photos de ce téléphone, celles qui te correspondent le plus. Les autres devront deviner que c'est toi qui les as choisies.", "Secretly pick up to " + L.per + " photos from this phone, the ones that feel the most like you. The others will have to guess you picked them.") + "</p>" + pickerHTML(imgs, L.per) +
            '<div class="dock"><button class="btn acc" type="button" data-n>' + (last ? tr("Terminé, on joue !", "Done, let's play!") : tr("Terminé, au suivant", "Done, next player")) + '</button><button class="link" type="button" data-skip style="align-self:center">' + tr("Je joue sans photo", "I'll play without photos") + "</button></div>", r => {
            bindPicker(r, imgs, L.per, () => { root.dataset.key = ""; go(); });
            const done = () => {
              if(!last){ L.who++; L.phase = "pass"; go(); return; }
              const cnt = {}; names.forEach((n, i) => { cnt[i] = L.imgs[i].length; });
              if(Object.keys(cnt).filter(i => cnt[i] > 0).length < 2){ toast(tr("Il faut au moins 2 joueurs avec des photos", "You need at least 2 players with photos")); return; }
              L.deck = deal(cnt, L.rounds); L.total = L.deck.length; L.n = 0; L.sc = {}; names.forEach(n => { L.sc[n] = 0; }); L.tw = null; next();
            };
            r.querySelector("[data-n]").addEventListener("click", () => { if(!imgs.length){ toast(tr("Ajoute au moins une photo, ou joue sans photo", "Add at least one photo, or play without photos")); return; } done(); });
            r.querySelector("[data-skip]").addEventListener("click", () => { imgs.length = 0; done(); });
          });
        } else if(L.phase === "show" || L.phase === "res"){
          const [oi, ii] = L.cur, img = L.imgs[oi][ii], owner = names[oi], res = L.phase === "res";
          screen(root, L.phase + L.n, CSS + '<span class="eyebrow">Photo ' + L.n + " / " + L.total + "</span>" + (res ? "" : SB.u.twistHTML(L.tw)) +
            (res ? '<div class="card"><span class="eyebrow">' + tr("Photo choisie par", "Photo picked by") + '</span><div class="who">' + esc(owner) + "</div></div>" : "") +
            '<div class="pr-ph' + (res ? " sm" : "") + '"><img alt="' + tr("Photo mystère", "Mystery photo") + '" data-img src="' + img + '"' + (!res && L.tw ? ' style="' + fxStyle(L.tw.id, Date.now() - L.t0) + '"' : "") + "></div>" +
            (!res ? '<p class="big" style="margin:4px 0 0">' + tr("Qui a choisi cette photo ?", "Who picked this photo?") + '</p><p class="howto">' + tr("À trois, tout le monde pointe quelqu'un du doigt !", "On three, everyone points at someone!") + "</p>" +
              '<div class="dock"><button class="btn acc" type="button" data-rev>' + tr("Révéler", "Reveal") + "</button></div>" :
              '<div class="field"><span class="eyebrow">' + tr("Qui a trouvé ? (", "Who got it? (") + (L.tw && L.tw.id === "double" ? "4" : "2") + ' pts)</span><div class="pr-who">' +
              names.filter(n => n !== owner).map(n => '<button type="button" data-f="' + esc(n) + '" aria-pressed="' + !!L.found[n] + '">' + esc(n) + "</button>").join("") + "</div></div>" +
              '<p class="sm">' + tr("Si personne n'a trouvé, " + esc(owner) + " gagne 2 points.", "If nobody got it, " + esc(owner) + " scores 2 points.") + "</p>" +
              '<div class="dock"><button class="btn acc" type="button" data-n>' + (L.deck.length ? tr("Photo suivante", "Next photo") : tr("Voir le classement", "See the standings")) + "</button></div>"), r => {
            const rv = r.querySelector("[data-rev]"); if(rv) rv.addEventListener("click", () => { L.phase = "res"; L.found = {}; go(); });
            r.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => { const n = b.dataset.f; if(L.found[n]) delete L.found[n]; else L.found[n] = 1; b.setAttribute("aria-pressed", !!L.found[n]); buzz(8); }));
            const nx = r.querySelector("[data-n]"); if(nx) nx.addEventListener("click", () => {
              const f = Object.keys(L.found), m = L.tw && L.tw.id === "double" ? 2 : 1;
              if(f.length) f.forEach(n => { L.sc[n] = (L.sc[n] || 0) + 2 * m; }); else L.sc[owner] = (L.sc[owner] || 0) + 2;
              next();
            });
          });
        } else if(L.phase === "end"){
          const rank = names.map(n => [n, L.sc[n] || 0]).sort((a, b) => b[1] - a[1]);
          screen(root, "end", CSS + '<span class="eyebrow">' + tr("Classement final", "Final standings") + "</span>" + rankHTML(rank) + '<p class="sm">' + tr("Les photos ont été effacées du jeu.", "The photos have been erased from the game.") + "</p>" +
            '<div class="dock"><button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Pick another game") + "</button></div>", r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      function next(){
        if(!L.deck.length){
          L.phase = "end"; L.imgs = names.map(() => []); L.cur = null;
          const sc = {}; names.forEach(n => { sc[n] = L.sc[n] || 0; }); const top = topOf(sc); if(top.length) api.win(top);
          go(); return;
        }
        L.cur = L.deck.shift(); L.n++; L.found = {};
        L.tw = L.twOn && L.n > 1 ? SB.u.twist(TW.filter(t => !t.net), { rate: .3, last: L.tw ? L.tw.id : "" }) : null;
        L.t0 = Date.now(); L.phase = "show"; go();
      }
      go();
    }
  }
});
})();
