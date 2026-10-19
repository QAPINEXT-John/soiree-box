/* Photo roulette — chacun choisit quelques photos de sa galerie, une s'affiche : c'est la photo de qui ?
   Réseau : les photos restent sur le téléphone de leur propriétaire. Une photo n'est envoyée (chiffrée,
   par morceaux, jamais gardée par les serveurs) qu'au moment où elle s'affiche, puis tout est effacé à la fin.
   Un seul téléphone : chacun ajoute ses photos à son tour, puis on devine tous ensemble. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz, toast } = SB.u;

const TW = [
  { id: "flou", name: "Photo floue", desc: "La photo se dévoile petit à petit. Les plus rapides marquent un bonus." },
  { id: "zoom", name: "Gros plan", desc: "On commence très zoomé, puis la photo se dézoome." },
  { id: "double", name: "Points doublés", desc: "Une bonne réponse rapporte le double." },
  { id: "eclair", name: "Éclair", desc: "La photo n'apparaît que 3 secondes. Ouvre bien les yeux.", net: true }
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
const PRIVACY = "Tu choisis toi-même tes photos. Ne mets rien que tu ne veux pas montrer au groupe.";

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
const APK_MSG = "Pour ce jeu, la mise à jour dans l'appli ne suffit pas : il faut réinstaller l'appli une seule fois, pour qu'elle puisse ouvrir ta galerie. Appuie sur le bouton, télécharge, puis installe par-dessus (tes réglages sont gardés).";
const apkBtn = '<button class="btn ghost" type="button" data-apk>Télécharger la nouvelle appli</button>';
const bindApk = r => { const b = r.querySelector("[data-apk]"); if(b) b.addEventListener("click", () => { try{ window.AndroidUpdate.openApk(); }catch(e){} }); };
const oldApk = () => !!window.AndroidUpdate && !(window.AndroidShare && typeof window.AndroidShare.photos === "function");

/* Écran de choix des photos, commun au réseau et au mode un seul téléphone. */
function pickerHTML(imgs, max){
  const full = imgs.length >= max;
  return '<p class="note-box">' + esc(PRIVACY) + "</p>" +
    '<div class="field"><span class="eyebrow">Tes photos · ' + imgs.length + " / " + max + "</span>" +
    (imgs.length ? '<div class="pr-thumbs">' + imgs.map((d, i) => '<div><img alt="" src="' + d + '"><button type="button" data-rm="' + i + '" aria-label="Retirer">×</button></div>').join("") + "</div>" : '<p class="sm">Aucune photo pour l\'instant.</p>') +
    "</div>" +
    '<input class="pr-file" type="file" accept="image/*" multiple data-file>' +
    (full ? "" : '<button class="btn ghost" type="button" data-add>' + (imgs.length ? "Ajouter des photos" : "Choisir dans ma galerie") + "</button>");
}
function bindPicker(r, imgs, max, onChange){
  const inp = r.querySelector("[data-file]"), add = r.querySelector("[data-add]");
  if(add) add.addEventListener("click", () => inp.click());
  inp.addEventListener("change", async () => {
    const files = Array.from(inp.files || []).slice(0, Math.max(0, max - imgs.length));
    if(!files.length) return;
    if(add){ add.disabled = true; add.textContent = "Préparation des photos…"; }
    let bad = 0;
    for(const f of files){ const d = await shrink(f); if(d && imgs.length < max) imgs.push(d); else bad++; }
    if(bad) toast(bad > 1 ? bad + " photos n'ont pas pu être lues" : "Une photo n'a pas pu être lue");
    if(Array.from(inp.files || []).length > files.length) toast("Maximum " + max + " photos");
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
  let h = '<div class="seg pr-mode"><button type="button" data-mode="hasard" aria-pressed="' + (P.mode === "hasard") + '">Au hasard</button><button type="button" data-mode="choix" aria-pressed="' + (P.mode === "choix") + '">Je choisis</button></div>';
  if(P.mode === "choix") return h + '<p class="howto">Choisis jusqu\'à ' + max + " photos de ta galerie. Les autres devront deviner qu'elles sont à toi.</p>" + pickerHTML(P.imgs, max);
  h += '<p class="note-box">Le jeu tire ' + max + " photos au hasard dans ta galerie, comme le vrai Photo roulette. Elles ne sont montrées au groupe que pendant la partie, puis effacées. Tu peux jouer la surprise, ou les regarder et en changer avant de valider.</p>";
  h += '<input class="pr-file" type="file" accept="image/*" multiple data-pool>';
  if(P.busy) return h + '<div class="card"><b>Tirage au hasard…</b><span class="sm">' + (nat ? "Si le téléphone te le demande, autorise l'accès aux photos." : "Préparation des photos…") + "</span></div>";
  if(!n){
    h += nat ? '<button class="btn acc" type="button" data-draw>Tirer ' + max + " photos au hasard</button>"
      : '<p class="sm">Sélectionne plein de photos d\'un coup, au moins ' + max * 4 + " (sur iPhone, glisse le doigt sur les photos). Le jeu en garde " + max + ' au hasard.</p><button class="btn ghost" type="button" data-draw>Sélectionner un paquet de photos</button>';
    if(P.denied) h += '<p class="note-box">Accès aux photos refusé. Tu peux l\'autoriser dans les réglages Android (Soirée Box › Autorisations › Photos), ou passer en « Je choisis ».</p>';
    if(window.AndroidUpdate && !nat && !oldApk()) h += '<p class="sm">Avec la dernière version de l\'appli, le tirage se fait directement dans toute ta galerie.</p>' + apkBtn;
    return h;
  }
  h += '<div class="field"><span class="eyebrow">' + n + " photo" + (n > 1 ? "s" : "") + " tirée" + (n > 1 ? "s" : "") + " au hasard" + (P.look ? "" : " · cachées") + "</span>";
  h += '<div class="pr-thumbs">' + P.imgs.map((d, i) => P.look
    ? '<div><img alt="" src="' + d + '"><button type="button" data-re="' + i + '" aria-label="Changer cette photo">↻</button></div>'
    : '<div class="pr-hid">?</div>').join("") + "</div></div>";
  h += '<div class="row2"><button class="btn ghost" type="button" data-look>' + (P.look ? "Cacher mes photos" : "Regarder (et changer)") + '</button><button class="btn ghost" type="button" data-redraw>Tout re-tirer</button></div>';
  if(P.look) h += '<p class="sm">Appuie sur ↻ pour remplacer une photo par une autre, au hasard.</p>';
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
    if(nat){ const res = await galDraw(count); got = res.imgs; if(res.t === "denied") P.denied = true; else if(!got.length) toast(res.total === 0 ? "Aucune photo trouvée dans la galerie" : "Le tirage n'a pas marché, réessaie"); }
    else got = await poolDraw(P, count);
    P.busy = false;
    if(at == null) got.forEach(d => { if(P.imgs.length < max) P.imgs.push(d); });
    else if(got[0]) P.imgs[at] = got[0];
    else if(!nat) toast("Plus de photos dans ta sélection : re-tire tout pour en choisir d'autres");
    v();
  }
  if(inp) inp.addEventListener("change", () => {
    const files = Array.from(inp.files || []).filter(f => /^image\//.test(f.type || "image/"));
    inp.value = "";
    if(!files.length) return;
    P.pool = shuffle(files);
    if(files.length < max) toast("Seulement " + files.length + " photo" + (files.length > 1 ? "s" : "") + " sélectionnée" + (files.length > 1 ? "s" : ""));
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
  return '<ul class="pr-res">' + rows.map((r, i) => { if(r[1] !== prev){ rk = i + 1; prev = r[1]; } return "<li><span>" + rk + ". " + esc(r[0]) + '</span><span class="pts">' + r[1] + " pt" + (r[1] > 1 ? "s" : "") + "</span></li>"; }).join("") + "</ul>";
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
  id: "photoroulette", name: "Photo roulette", glyph: "Clic", pitch: "Une photo de vos galeries s'affiche : c'est à qui ?",
  accent: { light: "#e8590c", dark: "#ff8a4c" },
  tag: "Chacun choisit quelques photos de sa galerie. Une photo s'affiche : à qui est-elle ?",
  min: 3, max: 12, ticks: true,
  rules: [
    "Au hasard (par défaut) : le jeu tire quelques photos dans ta galerie, sur ton téléphone et seulement quand tu appuies sur « Tirer ». Joue la surprise, ou regarde-les et change celles que tu ne veux pas montrer.",
    "Je choisis : tu prends toi-même tes photos.",
    "Une photo s'affiche sur tous les téléphones. Devine à qui elle appartient.",
    "Bonne réponse : 2 points, et 1 de plus pour le plus rapide. Si personne ne trouve, le propriétaire gagne 2 points.",
    "Si c'est ta photo, vote quand même pour brouiller les pistes.",
    "En réseau, une photo ne quitte ton téléphone qu'au moment où elle s'affiche. Elle est chiffrée avec le code du salon, passe par des serveurs publics sans y être gardée, et tout est effacé à la fin de la partie.",
    "Coups de théâtre : photo floue, gros plan, points doublés, éclair."
  ],
  options: [
    { id: "per", label: "Photos par joueur", type: "seg", def: 5, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }] },
    { id: "rounds", label: "Photos dans la partie", type: "seg", def: 15, values: [{ v: 10, label: "10" }, { v: 15, label: "15" }, { v: 25, label: "25" }] },
    { id: "timer", label: "Chrono", type: "seg", def: 20, values: [{ v: 0, label: "Sans" }, { v: 20, label: "20 s" }, { v: 30, label: "30 s" }] },
    { id: "twists", label: "Coups de théâtre", type: "toggle", text: "Coups de théâtre", desc: "Photo floue, gros plan, points doublés…", def: true }
  ],
  start(ctx, o){
    const sc = {}; ctx.players.forEach(p => { sc[p.id] = 0; });
    if(!ctx.blob || !ctx.blob.ok) throw new Error("Photo roulette en réseau a besoin du relais Internet. Ici, joue-la sur un seul téléphone.");
    return { phase: "pick", pid: "g" + ctx.rid(), per: o.per || 5, rounds: o.rounds || 15, timer: o.timer == null ? 20 : +o.timer, twOn: o.twists !== false, round: 0, sc, cnt: {}, who: [], hist: [] };
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
        '<span class="eyebrow">Photo roulette · choix des photos</span>' +
        (!playing ? '<p class="howto">Tu regardes la partie. Les joueurs choisissent leurs photos.</p>' :
          my.ok ? '<div class="card"><b>' + (M.imgs.length ? M.imgs.length + " photo" + (M.imgs.length > 1 ? "s" : "") + " prête" + (M.imgs.length > 1 ? "s" : "") + (M.mode === "hasard" && !M.look ? " · surprise !" : "") : "Tu joues sans photo") + '</b><span class="sm">Tes photos restent sur ton téléphone jusqu\'à leur tour.</span></div><button class="link" type="button" data-edit>Modifier mes photos</button>' :
          old ? '<p class="note-box">' + esc(APK_MSG) + " En attendant, tu peux jouer sans photo et deviner quand même.</p>" + apkBtn :
          drawHTML(M, s.per)) +
        '<p class="wait" data-wait></p>' +
        dock((playing && !my.ok ? '<button class="btn acc" type="button" data-ok' + (M.imgs.length || old ? "" : " disabled") + ">" + (M.imgs.length ? "C'est bon, on joue avec" : old ? "Jouer sans photo" : M.mode === "hasard" ? "Tire tes photos d'abord" : "Choisis au moins une photo") + "</button>" : "") +
          (ctx.isHost ? '<button class="btn ' + (playing && !my.ok ? "ghost" : "acc") + '" type="button" data-go>Lancer la partie</button>' : "")), r => {
        if(playing && !my.ok && !old) bindDraw(r, M, s.per, () => { root.dataset.key = ""; ctx.send({ ok: 0, n: M.imgs.length }); });
        const ok = r.querySelector("[data-ok]"); if(ok) ok.addEventListener("click", () => { if(M.busy) return; buzz(15); ctx.send({ ok: 1, n: M.imgs.length }); });
        const ed = r.querySelector("[data-edit]"); if(ed) ed.addEventListener("click", () => ctx.send({ ok: 0, n: M.imgs.length }));
        bindApk(r);
        const go = r.querySelector("[data-go]"); if(go) go.addEventListener("click", () => ctx.act(c => {
          const n = c.ids.filter(id => { const i = c.input(id); return i && i.ok && (+i.n || 0) > 0; }).length;
          if(n < 2){ toast("Il faut au moins 2 joueurs avec des photos prêtes"); return; }
          c.set({ go: 1 });
        }));
      });
      txt(root, "[data-wait]", ready.length + " / " + live.length + " prêts · " + withPh.length + " avec des photos" + (ctx.isHost && ready.length < live.length ? " · tu peux lancer sans attendre" : ""));
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
      const ph = '<div class="pr-ph">' + (shown ? '<img alt="Photo mystère" data-img src="' + shown + '">' + (hidden ? '<div class="pr-hide">Photo cachée · fais confiance à ta mémoire</div>' : "") : '<div class="pr-hide">La photo arrive…</div>') + "</div>";
      if(s.phase === "show"){
        const choices = ctx.playing ? A(s.who).filter(id => id !== me) : [];
        screen(root, "show" + s.k + (shown ? 1 : 0) + (hidden ? 1 : 0), CSS + lab + ph +
          '<p class="big" style="margin:4px 0 0">' + (isOwner ? "C'est ta photo ! Vote quand même pour brouiller les pistes." : "C'est la photo de qui ?") + "</p>" +
          '<div class="pr-who">' + choices.map(id => '<button type="button" data-v="' + esc(id) + '" aria-pressed="' + (my.v === id) + '">' + esc(ctx.name(id)) + "</button>").join("") + "</div>" +
          (s.lim ? '<div class="pr-cd" data-cd></div>' : "") + '<p class="wait" data-wait></p>' +
          (ctx.isHost ? dock('<button class="btn ghost" type="button" data-rev>Révéler sans attendre</button>') : ""), r => {
          r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
            if(!shown && !isOwner){ toast("Attends que la photo arrive"); return; }
            buzz(10); ctx.send({ v: b.dataset.v, t: ctx.now() });
            r.querySelectorAll("[data-v]").forEach(x => x.setAttribute("aria-pressed", x === b));
          }));
          const rv = r.querySelector("[data-rev]"); if(rv) rv.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "show" && c.s.at) c.set({ rev: 1 }); }));
        });
        const el = root.querySelector("[data-img]");
        if(el && !isOwner){ const st = s.at ? fxStyle(s.tw, now - s.at) : fxStyle(s.tw, 0); if(el.getAttribute("style") !== st) el.setAttribute("style", st); }
        const others = ctx.ids.filter(id => id !== s.o && ctx.here(id)), nv = others.filter(id => { const i = ctx.input(id); return i && i.v; }).length;
        txt(root, "[data-wait]", !s.at ? "Envoi de la photo…" : nv + " / " + others.length + " votes");
        if(s.lim) txt(root, "[data-cd]", s.dl ? Math.max(0, Math.ceil((s.dl - now) / 1000)) + " s" : "");
        return;
      }
      // Résultat de la manche.
      const votes = s.votes || {}, got = s.got || {};
      const rows = Object.keys(votes).map(id => '<li class="' + (votes[id][0] === s.o ? "ok" : "") + '"><span>' + esc(ctx.name(id)) + " → <b>" + esc(ctx.name(votes[id][0])) + '</b></span><span class="pts">' + (got[id] ? "+" + got[id] : "") + "</span></li>").join("");
      const sc = s.sc || {}, rank = ctx.ids.map(id => [ctx.name(id), sc[id] || 0]).sort((a, b) => b[1] - a[1]);
      const right = Object.keys(votes).filter(id => votes[id][0] === s.o).length;
      screen(root, "res" + s.k + (shown ? 1 : 0) + ctx.isHost, CSS + '<span class="eyebrow">Photo ' + s.round + " / " + s.rounds + "</span>" +
        '<div class="card"><span class="eyebrow">C\'était la photo de</span><div class="who">' + esc(ctx.name(s.o)) + "</div>" +
        '<span class="sm">' + (right ? right + " sur " + Object.keys(votes).length + " ont trouvé" : Object.keys(votes).length ? "Personne n'a trouvé : " + esc(ctx.name(s.o)) + " gagne 2 points" : "Personne n'a voté") + "</span></div>" + ph.replace('class="pr-ph"', 'class="pr-ph sm"') +
        (rows ? '<ul class="pr-res">' + rows + "</ul>" : "") +
        '<div class="field"><span class="eyebrow">Classement</span>' + rankHTML(rank) + "</div>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Voir le classement final" : "Photo suivante") + "</button>" : '<p class="wait">L\'hôte passe à la suite…</p>'), r => {
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
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">Classement final</span>' + rankHTML(rank) +
        (mys ? '<div class="card"><span class="eyebrow">Galerie la plus mystérieuse</span><div class="big">' + esc(ctx.name(mys)) + '</div><span class="sm">Ses photos ont été trouvées ' + byO[mys][0] + " fois sur " + byO[mys][1] + "</span></div>" : "") +
        '<p class="sm">Toutes les photos de la partie ont été effacées des téléphones.</p>' +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>Retour au salon</button>' : '<p class="wait">L\'hôte va vous ramener au salon.</p>'), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const scc = c.s.sc || {}, win = topOf(scc), mx = win.length ? scc[win[0]] : 0;
          c.end({ title: "Photo roulette · " + (win.length ? win.map(c.name).join(" & ") + " · " + mx + " pts" : "égalité"), lines: mys ? ["Galerie la plus mystérieuse : " + c.name(mys)] : [], win });
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
          screen(root, "setup" + L.per + L.rounds + L.twOn, CSS + '<p class="howto">Sur un seul téléphone, toutes les photos viennent de sa galerie. Chacun à son tour en choisit quelques-unes en secret, celles qui lui ressemblent le plus. Ensuite elles défilent : qui a choisi quoi ?</p><p class="sm">Pour le vrai Photo roulette (photos tirées au hasard dans la galerie de chacun), jouez en réseau, chacun sur son téléphone.</p>' +
            '<div class="field"><span class="eyebrow">Photos par joueur</span><div class="seg">' + [3, 5, 8].map(v => '<button type="button" data-per="' + v + '" aria-pressed="' + (v === L.per) + '">' + v + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Photos dans la partie</span><div class="seg">' + [10, 15, 25].map(v => '<button type="button" data-r="' + v + '" aria-pressed="' + (v === L.rounds) + '">' + v + "</button>").join("") + "</div></div>" +
            '<div class="field"><span class="eyebrow">Variante</span><div class="seg"><button type="button" data-tw aria-pressed="' + L.twOn + '">Coups de théâtre : ' + (L.twOn ? "oui" : "non") + "</button></div></div>" +
            (oldApk() ? '<p class="note-box">' + esc(APK_MSG) + "</p>" + apkBtn : "") +
            '<div class="dock"><button class="btn acc" type="button" data-go' + (oldApk() ? " disabled" : "") + '>Commencer</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button></div>', r => {
            r.querySelectorAll("[data-per]").forEach(b => b.addEventListener("click", () => { L.per = +b.dataset.per; persist({ prPer: L.per }); go(); }));
            r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { L.rounds = +b.dataset.r; persist({ prRounds: L.rounds }); go(); }));
            r.querySelector("[data-tw]").addEventListener("click", () => { L.twOn = !L.twOn; persist({ prTw: L.twOn }); go(); });
            r.querySelector("[data-go]").addEventListener("click", () => { L.who = 0; L.imgs = names.map(() => []); L.phase = "pass"; go(); });
            r.querySelector("[data-q]").addEventListener("click", api.exit);
            bindApk(r);
          });
        } else if(L.phase === "pass"){
          screen(root, "pass" + L.who, CSS + '<span class="eyebrow">Joueur ' + (L.who + 1) + " / " + names.length + '</span><p class="howto">Passe le téléphone à</p><div class="who">' + esc(names[L.who]) + "</div>" +
            '<p class="sm">Les autres ne regardent pas l\'écran.</p><div class="dock"><button class="btn acc" type="button" data-n>C\'est moi</button></div>', r => {
            r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "pick"; go(); });
          });
        } else if(L.phase === "pick"){
          const imgs = L.imgs[L.who], last = L.who === names.length - 1;
          screen(root, "pick" + L.who + "|" + imgs.length, CSS + '<span class="eyebrow">' + esc(names[L.who]) + ' · tes photos</span><p class="howto">Choisis en secret jusqu\'à ' + L.per + " photos de ce téléphone, celles qui te ressemblent. Les autres devront deviner que c'est toi qui les as choisies.</p>" + pickerHTML(imgs, L.per) +
            '<div class="dock"><button class="btn acc" type="button" data-n>' + (last ? "Terminé, on joue !" : "Terminé, au suivant") + '</button><button class="link" type="button" data-skip style="align-self:center">Je joue sans photo</button></div>', r => {
            bindPicker(r, imgs, L.per, () => { root.dataset.key = ""; go(); });
            const done = () => {
              if(!last){ L.who++; L.phase = "pass"; go(); return; }
              const cnt = {}; names.forEach((n, i) => { cnt[i] = L.imgs[i].length; });
              if(Object.keys(cnt).filter(i => cnt[i] > 0).length < 2){ toast("Il faut au moins 2 joueurs avec des photos"); return; }
              L.deck = deal(cnt, L.rounds); L.total = L.deck.length; L.n = 0; L.sc = {}; names.forEach(n => { L.sc[n] = 0; }); L.tw = null; next();
            };
            r.querySelector("[data-n]").addEventListener("click", () => { if(!imgs.length){ toast("Ajoute au moins une photo, ou joue sans photo"); return; } done(); });
            r.querySelector("[data-skip]").addEventListener("click", () => { imgs.length = 0; done(); });
          });
        } else if(L.phase === "show" || L.phase === "res"){
          const [oi, ii] = L.cur, img = L.imgs[oi][ii], owner = names[oi], res = L.phase === "res";
          screen(root, L.phase + L.n, CSS + '<span class="eyebrow">Photo ' + L.n + " / " + L.total + "</span>" + (res ? "" : SB.u.twistHTML(L.tw)) +
            (res ? '<div class="card"><span class="eyebrow">Photo choisie par</span><div class="who">' + esc(owner) + "</div></div>" : "") +
            '<div class="pr-ph' + (res ? " sm" : "") + '"><img alt="Photo mystère" data-img src="' + img + '"' + (!res && L.tw ? ' style="' + fxStyle(L.tw.id, Date.now() - L.t0) + '"' : "") + "></div>" +
            (!res ? '<p class="big" style="margin:4px 0 0">Qui a choisi cette photo ?</p><p class="howto">À trois, tout le monde pointe quelqu\'un du doigt !</p>' +
              '<div class="dock"><button class="btn acc" type="button" data-rev>Révéler</button></div>' :
              '<div class="field"><span class="eyebrow">Qui avait trouvé ? (' + (L.tw && L.tw.id === "double" ? "4" : "2") + ' pts)</span><div class="pr-who">' +
              names.filter(n => n !== owner).map(n => '<button type="button" data-f="' + esc(n) + '" aria-pressed="' + !!L.found[n] + '">' + esc(n) + "</button>").join("") + "</div></div>" +
              '<p class="sm">Si personne n\'a trouvé, ' + esc(owner) + " gagne 2 points.</p>" +
              '<div class="dock"><button class="btn acc" type="button" data-n>' + (L.deck.length ? "Photo suivante" : "Voir le classement") + "</button></div>"), r => {
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
          screen(root, "end", CSS + '<span class="eyebrow">Classement final</span>' + rankHTML(rank) + '<p class="sm">Les photos ont été effacées du jeu.</p>' +
            '<div class="dock"><button class="btn acc" type="button" data-a>Rejouer</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button></div>', r => {
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
