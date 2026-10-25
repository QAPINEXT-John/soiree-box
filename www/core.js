/* Soirée Box — cœur de la plateforme.
   - SB.register(def) : ajoute un jeu (voir games/_modele.js et AJOUTER-UN-JEU.md)
   - Réseau : relais Internet sans configuration (tous réseaux : wifi, 4G…), ou Firebase si firebase-config.js est rempli
   - Salon : on choisit un jeu, on règle ses options, on joue, on revient au salon
   - Mode un seul téléphone pour les jeux qui le proposent */
(function(){
"use strict";

const SB = window.SB = { games: [], byId: {} };
SB.register = function(def){
  if(!def || !def.id || SB.byId[def.id]) return;
  SB.games.push(def); SB.byId[def.id] = def;
};

/* =================== Utilitaires partagés =================== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function clean(s, max){ return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2060-\u206f]/g, "").trim().slice(0, max || 200); }
function A(x){
  if(Array.isArray(x)) return x;
  if(x && typeof x === "object") return Object.keys(x).sort((a, b) => a - b).map(k => x[k]);
  return [];
}
function shuffle(a){ a = A(a).slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function rid(){ return Math.random().toString(36).slice(2, 9); }
function pick(a){ a = A(a); return a[Math.floor(Math.random() * a.length)]; }
// Firebase transforme les tableaux en objets {0:…,1:…} : on les remet en tableaux.
function fix(v){
  if(Array.isArray(v)) return v.map(fix);
  if(v && typeof v === "object"){
    const ks = Object.keys(v);
    if(ks.length && ks.every(k => /^\d+$/.test(k))) return A(v).map(fix);
    const o = {}; ks.forEach(k => { o[k] = fix(v[k]); }); return o;
  }
  return v;
}
function plain(v){ return JSON.parse(JSON.stringify(v === undefined ? null : v)); }
const STORE = "soiree-box";
function store(){ try{ return JSON.parse(localStorage.getItem(STORE) || "{}") || {}; }catch(e){ return {}; } }
function persist(patch){ try{ localStorage.setItem(STORE, JSON.stringify(Object.assign(store(), patch))); }catch(e){} }

/* =================== Langue (français / anglais) ===================
   La langue est choisie sur l'accueil et gardée sur le téléphone ; changer de langue recharge l'appli.
   - tr("texte français", "English text") : la bonne version selon la langue du téléphone.
   - Textes fixes de index.html : traduits par le dictionnaire EN_HTML (texte exact → anglais).
   - En réseau, le contenu des parties (cartes, questions) suit la langue de l'hôte (ctx.s.lg),
     l'interface suit la langue de chaque téléphone. */
const LANG = (() => {
  const l = store().lang;
  if(l === "fr" || l === "en") return l;
  try{ return /^fr\b/i.test(navigator.language || "fr") ? "fr" : "en"; }catch(e){ return "fr"; }
})();
function tr(fr, en){ return LANG === "en" && en != null ? en : fr; }
SB.lang = () => LANG;
SB.tr = tr;
SB.setLang = function(l){ if((l === "fr" || l === "en") && l !== LANG){ persist({ lang: l }); location.reload(); } };
// Dictionnaire des textes fixes de index.html (texte exact, sans espaces autour → anglais).
const EN_HTML = {
  "Un salon, un code, et toute la bande joue, chacun sur son téléphone.": "One room, one code, and the whole crew plays, each on their own phone.",
  "Ton prénom": "Your name", "Léa": "Alex", "Créer un salon": "Create a room", "Code du salon": "Room code", "Rejoindre": "Join",
  "Jouer sur un seul téléphone": "Play on one phone", "On se le passe, ou on joue contre des robots": "Pass it around, or play against bots",
  "Les jeux": "Games", "Un bug, un souci ?": "Bug or problem?", "Signale-le": "Report it",
  "Salon": "Room", "Hors ligne…": "Offline…", "Signaler un bug": "Report a bug", "Quitter": "Leave",
  "Code à partager": "Code to share", "Partager l'invitation": "Share the invite", "QR code du salon": "Room QR code", "Invitation": "Invite", "Choisis un jeu": "Pick a game",
  "Partie en cours": "Game in progress",
  "Tu es arrivé en cours de partie. Tu pourras jouer à la prochaine, quand l'hôte la lancera depuis le salon.": "You joined mid-game. You can play the next one when the host starts it from the room.",
  "Salon fermé": "Room closed", "L'hôte est parti": "The host left",
  "La personne qui a créé le salon a fermé l'appli. Crée un nouveau salon pour continuer.": "The person who created the room closed the app. Create a new room to keep playing.",
  "Retour à l'accueil": "Back to home", "Sur ce téléphone": "On this phone", "Accueil": "Home", "Un seul téléphone": "One phone",
  "Choisis un jeu. Le téléphone passe de main en main, ou tu joues contre des robots.": "Pick a game. Pass the phone around, or play against bots.",
  "Retour": "Back", "+ Ajouter un joueur": "+ Add a player", "C'est parti": "Let's go", "Terminé": "Done",
  "Lancer un jeu": "Start a game", "Fermer": "Close"
};
function i18nDom(root){
  if(LANG !== "en") return;
  const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT), nodes = [];
  while(w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => { const t = n.nodeValue.trim(); if(t && EN_HTML[t]) n.nodeValue = n.nodeValue.replace(t, EN_HTML[t]); });
  $$("[placeholder],[aria-label],[title]", root || document).forEach(el => ["placeholder", "aria-label", "title"].forEach(a => {
    const v = el.getAttribute(a); if(v && EN_HTML[v.trim()]) el.setAttribute(a, EN_HTML[v.trim()]);
  }));
}
/* ---------- Rejouabilité : mémoire anti-répétition ----------
   fresh(clé, paquet) mélange un paquet en mettant au-dessus (fin du tableau, on tire avec pop())
   ce qui n'a jamais été vu sur ce téléphone, puis ce qui a été vu il y a le plus longtemps.
   fresh(clé, paquet, true) fait l'inverse (pour les jeux qui tirent avec splice(0, n)).
   saw(clé, élément | [éléments]) note ce qui vient d'être joué. */
const SEEN = "soiree-seen";
function hkey(x){ const s = typeof x === "string" ? x : JSON.stringify(x); let h = 5381; for(let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
function seenAll(){ try{ return JSON.parse(localStorage.getItem(SEEN) || "{}") || {}; }catch(e){ return {}; } }
function fresh(key, pool, front){
  const m = seenAll()[key] || {};
  const out = shuffle(pool).map((x, i) => [x, m[hkey(x)] || 0, i]).sort((a, b) => (b[1] - a[1]) || (a[2] - b[2])).map(r => r[0]);
  return front ? out.reverse() : out;
}
function saw(key, items){
  try{
    const all = seenAll(), m = all[key] = all[key] || {};
    let n = +m._n || 0;
    (Array.isArray(items) ? items : [items]).forEach(x => { if(x != null) m[hkey(x)] = ++n; });
    m._n = n;
    const ks = Object.keys(m).filter(k => k !== "_n");
    if(ks.length > 1500) ks.sort((a, b) => m[a] - m[b]).slice(0, ks.length - 1200).forEach(k => { delete m[k]; });
    localStorage.setItem(SEEN, JSON.stringify(all));
  }catch(e){}
}
/* ---------- Rejouabilité : coups de théâtre ----------
   twist(liste, { rate, last, ...contexte }) : renvoie un événement au hasard (ou null),
   jamais le même deux fois de suite. Chaque événement : { id, name, desc, ok?(contexte) }.
   On garde seulement t.id dans l'état du jeu, et on retrouve l'objet avec byTwist(liste, id).
   twistHTML(t) : le bandeau à afficher en haut de la manche. */
function twist(list, o){
  o = o || {};
  const rate = o.rate == null ? .35 : o.rate;
  if(Math.random() >= rate) return null;
  const pool = A(list).filter(t => t && t.id !== o.last && (!t.ok || t.ok(o)));
  return pool.length ? pick(pool) : null;
}
function byTwist(list, id){ return id ? A(list).find(t => t.id === id) || null : null; }
const BOLT = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M13.5 2 4 14h6.5L9 22l11-13h-7z"/></svg>';
function twistHTML(t, label){
  if(!t) return "";
  return '<div class="twist" role="note"><span class="tw-k">' + BOLT + esc(label || tr("Coup de théâtre", "Plot twist")) + '</span><b>' + esc(t.name) + "</b>" + (t.desc ? '<span class="sm">' + esc(t.desc) + "</span>" : "") + "</div>";
}
function armTap(btn, action, armedText){
  const base = btn.textContent; let t = null;
  btn.addEventListener("click", () => {
    if(btn.dataset.armed){ clearTimeout(t); delete btn.dataset.armed; btn.textContent = base; action(); return; }
    btn.dataset.armed = "1"; btn.textContent = armedText || tr("Touche encore pour confirmer", "Tap again to confirm");
    t = setTimeout(() => { delete btn.dataset.armed; btn.textContent = base; }, 3000);
  });
}
// Reconstruit le contenu de root seulement quand la clé change (évite de perdre la saisie).
function screen(root, key, html, bind){
  if(root.dataset.key === key) return false;
  root.dataset.key = key; root.innerHTML = html; enter(root);
  const sc = root.closest(".screen"); if(sc) sc.scrollTop = 0;
  if(bind) bind(root);
  return true;
}
function buzz(p){ try{ if(navigator.vibrate) navigator.vibrate(p || 12); }catch(e){} }
let toastT = null;
function toast(msg){
  let t = document.getElementById("sb-toast");
  if(!t){ t = document.createElement("div"); t.id = "sb-toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = msg; t.classList.add("on"); clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("on"), 2200);
}
function enter(el){ if(!el) return; el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
function dock(html){ return '<div class="dock">' + html + "</div>"; }
function txt(root, sel, value){ const el = root.querySelector(sel); if(el && el.textContent !== String(value)) el.textContent = value; return el; }
function plural(n, one, many){ return n + " " + (n > 1 ? (many || one + "s") : one); }
// Anglais : 0 et 2+ au pluriel (« 0 games »), contrairement au français (« 0 jeu »).
function plural2(n, one, many, oneEn, manyEn){ return LANG === "en" ? n + " " + (n === 1 ? oneEn : (manyEn || oneEn + "s")) : plural(n, one, many); }
function copyText(text, done, fail){
  try{ navigator.clipboard.writeText(text).then(done, fail); }catch(e){ fail && fail(); }
}
function shareText(text, url, fallbackInput, onDone){
  if(window.AndroidShare){ try{ AndroidShare.share(url ? text + " " + url : text); onDone && onDone("Partagé"); return; }catch(e){} }
  const v = url || text;
  const show = () => { if(fallbackInput){ fallbackInput.value = v; fallbackInput.hidden = false; fallbackInput.select(); } };
  const copy = () => copyText(v, () => onDone && onDone("Copié"), show);
  if(navigator.share){ navigator.share({ title: "Soirée Box", text, url: url || undefined }).then(() => onDone && onDone("Partagé"), e => { if(!e || e.name !== "AbortError") copy(); }); return; }
  copy();
}
function players(names){ return A(names); }
/* ---------- Animations de cartes (partagées par les jeux de cartes) ---------- */
// Les animations de jeu (cartes qui volent, se posent, se retournent) font partie du jeu : elles sont jouées
// même si le téléphone ou l'ordinateur demande moins d'animations (réglage système souvent coupé sur Windows).
// On peut les couper dans l'appli : localStorage « soiree-box ».anim = "off".
const reduced = () => store().anim === "off";
const mid = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
// Fait arriver `el` depuis l'endroit `from` (un DOMRect) jusqu'à sa place, avec un petit rebond.
/* Trajectoire douce : une courbe en cloche de `from` vers la cible, accélération et freinage progressifs,
   la carte grossit un peu au sommet avec une ombre portée, puis se pose. */
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function arcFrames(dx, dy, s0, rot, lift, shadow){
  const cx = dx * .45, cy = Math.min(dy, 0) * .5 - lift, kf = [], N = 30;
  for(let i = 0; i <= N; i++){
    const e = easeIO(i / N), u = 1 - e, h = Math.sin(Math.PI * e);
    const x = u * u * dx + 2 * u * e * cx, y = u * u * dy + 2 * u * e * cy;
    const sc = s0 + (1 - s0) * e + h * .2, r = rot * u + h * (rot > 0 ? -6 : 6);
    const f = { transform: "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + r.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")" };
    if(shadow) f.boxShadow = "0 " + (6 + 26 * h).toFixed(1) + "px " + (12 + 30 * h).toFixed(1) + "px rgba(0,0,0," + (.25 + .35 * h).toFixed(2) + ")";
    kf.push(f);
  }
  return kf;
}
// Fait arriver `el` depuis l'endroit `from` (un DOMRect) jusqu'à sa place.
function fly(el, from, o){
  if(!el || !from || !el.animate || reduced()) return;
  o = o || {};
  const to = el.getBoundingClientRect(); if(!to.width) return;
  const a = mid(from), b = mid(to), s0 = Math.max(.3, Math.min(1.6, (from.width || to.width) / to.width));
  const dx = a.x - b.x, dy = a.y - b.y, lift = o.lift == null ? Math.max(60, Math.abs(dy) * .25) : o.lift;
  el.animate(arcFrames(dx, dy, s0, o.rot == null ? -16 : o.rot, lift, false), { duration: o.ms || 900, delay: o.delay || 0, easing: "linear", fill: "backwards" });
}
// Variante robuste : une copie de la carte vole au-dessus de l'écran (elle survit aux rafraîchissements),
// puis `done` est appelé à l'atterrissage pour révéler la vraie carte.
function flyTo(html, from, toEl, o){
  o = o || {};
  const done = () => { if(o.done){ const d = o.done; o.done = null; d(); } };
  if(!from || !toEl || reduced() || !document.body.animate){ done(); return; }
  const to = toEl.getBoundingClientRect();
  const box = document.createElement("div"); box.innerHTML = html;
  const el = box.firstElementChild;
  if(!el || !to.width){ done(); return; }
  el.removeAttribute("id");
  Object.assign(el.style, { position: "fixed", left: to.left + "px", top: to.top + "px", width: to.width + "px", height: to.height + "px", margin: "0", zIndex: "60", pointerEvents: "none", transformOrigin: "50% 50%", visibility: "visible" });
  document.body.append(el);
  const a = mid(from), b = mid(to), s0 = Math.max(.3, Math.min(1.6, from.width / to.width));
  const dx = a.x - b.x, dy = a.y - b.y, lift = o.lift == null ? Math.max(90, Math.abs(dy) * .35) : o.lift;
  const an = el.animate(arcFrames(dx, dy, s0, o.rot == null ? -18 : o.rot, lift, true), { duration: o.ms || 1100, delay: o.delay || 0, easing: "linear", fill: "both" });
  // o.keep : la copie reste posée sur la pile à l'arrivée (jusqu'à remove()), le temps que le vrai jeu suive.
  const end = () => { if(!o.keep) el.remove(); done(); };
  an.onfinish = end; an.oncancel = end;
  setTimeout(end, (o.ms || 1100) + (o.delay || 0) + 400);
  if(o.keep) setTimeout(() => el.remove(), (o.ms || 1100) + (o.delay || 0) + 9000);
  return { remove(){ el.remove(); } };
}
// Choc quand une carte atterrit sur la pile : la pile s'écrase un peu, et une onde part autour.
function thud(el, delay){
  if(!el || !el.animate || reduced()) return;
  el.animate([{ transform: "scale(1)" }, { transform: "scale(.93)", offset: .25 }, { transform: "scale(1.07)", offset: .6 }, { transform: "scale(1)" }], { duration: 420, delay: delay || 0, easing: "ease-out" });
  ripple(el.querySelector(".dc-c, .lb-c, [class$='-c']") || el, delay);
}
function ripple(el, delay){
  if(!el || !document.body.animate || reduced()) return;
  const r = el.getBoundingClientRect(); if(!r.width) return;
  const cs = getComputedStyle(el), col = (cs.getPropertyValue("--c") || "").trim() || "var(--tone, #ff5a36)";
  for(let k = 0; k < 2; k++){
    const w = document.createElement("div");
    Object.assign(w.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: cs.borderRadius || "14px",
      border: "3px solid " + col, boxShadow: "0 0 18px " + col, zIndex: "55", pointerEvents: "none" });
    document.body.append(w);
    const an = w.animate([{ transform: "scale(1)", opacity: .95 }, { transform: "scale(" + (1.45 + k * .3) + ")", opacity: 0 }], { duration: 560 + k * 160, delay: (delay || 0) + k * 90, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" });
    an.onfinish = () => w.remove(); setTimeout(() => w.remove(), 2000 + (delay || 0));
  }
}
// Une carte fantôme qui part de `from` et file vers `to` (par exemple de la pioche vers un adversaire).
function ghost(html, from, to, o){
  if(!from || !to || !document.body.animate || reduced()) return;
  o = o || {};
  const box = document.createElement("div"); box.innerHTML = html;
  const el = box.firstElementChild; if(!el) return;
  Object.assign(el.style, { position: "fixed", left: from.left + "px", top: from.top + "px", margin: "0", zIndex: "50", pointerEvents: "none" });
  document.body.append(el);
  const r = el.getBoundingClientRect(), a = mid(from), b = mid(to), c = mid(r);
  const x0 = a.x - c.x, y0 = a.y - c.y, s = Math.max(.25, Math.min(1, to.height / r.height));
  const an = el.animate([
    { transform: "translate(" + x0 + "px," + y0 + "px)", opacity: 1 },
    { transform: "translate(" + (x0 + b.x - a.x) + "px," + (y0 + b.y - a.y) + "px) rotate(14deg) scale(" + s + ")", opacity: .15 }
  ], { duration: o.ms || 520, delay: o.delay || 0, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" });
  an.onfinish = () => el.remove();
  setTimeout(() => el.remove(), (o.delay || 0) + 2500);
}
// Retourne une carte (révélation).
function flip(el, delay){
  if(!el || !el.animate || reduced()) return;
  el.animate([
    { transform: "perspective(600px) rotateY(180deg) scale(.9)", filter: "brightness(.2)" },
    { transform: "perspective(600px) rotateY(90deg) scale(1.05)", filter: "brightness(.2)", offset: .5 },
    { transform: "perspective(600px) rotateY(0) scale(1)", filter: "none" }
  ], { duration: 520, delay: delay || 0, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
}
// Petit coup d'éclat (verdict, tir…).
function pop(el, delay, shake){
  if(!el || !el.animate || reduced()) return;
  el.animate(shake ? [{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1.25) rotate(-4deg)", opacity: 1, offset: .45 }, { transform: "translateX(-8px) rotate(3deg)", offset: .6 }, { transform: "translateX(8px)", offset: .75 }, { transform: "none" }]
    : [{ transform: "scale(.5)", opacity: 0 }, { transform: "scale(1.12)", opacity: 1, offset: .65 }, { transform: "none" }], { duration: shake ? 650 : 420, delay: delay || 0, easing: "ease-out", fill: "backwards" });
}
SB.fx = { fly, flyTo, ghost, flip, pop, thud, ripple };

SB.u = { $, $$, esc, clean, A, shuffle, rid, pick, fix, store, persist, armTap, screen, txt, plural, plural2, tr, shareText, copyText, buzz, toast, dock, fresh, saw, twist, byTwist, twistHTML };

/* ---------- Écran toujours allumé ---------- */
let wakeLock = null, wantWake = false;
async function keepAwake(on){
  wantWake = on;
  try{
    if(on && !wakeLock && navigator.wakeLock && document.visibilityState === "visible"){
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { wakeLock = null; });
    } else if(!on && wakeLock){ const w = wakeLock; wakeLock = null; await w.release(); }
  }catch(e){ wakeLock = null; }
}
document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible" && wantWake) keepAwake(true); });

/* =================== Réseau : outils communs =================== */
function mergePatch(obj, patch, allowed){
  const out = Object.assign({}, obj);
  Object.keys(patch || {}).forEach(k => { if(allowed && allowed.indexOf(k) < 0) return; if(patch[k] === null) delete out[k]; else out[k] = patch[k]; });
  return out;
}
function listeners(){ const a = []; return { add(h){ a.push(h); return () => { const i = a.indexOf(h); if(i >= 0) a.splice(i, 1); }; }, fire(...x){ a.slice().forEach(h => { try{ h(...x); }catch(e){ console.error(e); } }); } }; }

/* =================== Réseau : relais Internet (par défaut, sans configuration) ===================
   Les téléphones ne se parlent pas directement : chacun ouvre une connexion WebSocket sortante
   (port HTTPS) vers plusieurs serveurs MQTT publics à la fois. Ça passe donc sur n'importe quel
   réseau (wifi, 4G/5G, partage de connexion), même si les joueurs sont sur des réseaux différents.
   - Tout est envoyé sur tous les serveurs : si l'un tombe, les autres prennent le relais.
   - Les messages sont chiffrés (AES-GCM) avec une clé tirée du code du salon.
   - L'hôte fait autorité ; s'il disparaît, le joueur suivant reprend la partie (reprise d'hôte). */
const BROKERS = (Array.isArray(window.SB_BROKERS) && window.SB_BROKERS.length ? window.SB_BROKERS : [
  "wss://broker.emqx.io:8084/mqtt",
  "wss://broker.hivemq.com:8884/mqtt",
  "wss://test.mosquitto.org:8081/mqtt",
  { url: "wss://public.cloud.shiftr.io", user: "public", pass: "public" }
]).map(b => (typeof b === "string" ? { url: b } : b));
const TE = new TextEncoder(), TD = new TextDecoder();
function cat(parts){ let n = 0; parts.forEach(p => { n += p.length; }); const o = new Uint8Array(n); let i = 0; parts.forEach(p => { o.set(p, i); i += p.length; }); return o; }
function mStr(s){ const b = typeof s === "string" ? TE.encode(s) : s; return cat([Uint8Array.of(b.length >> 8, b.length & 255), b]); }
function mPkt(head, parts){
  const body = cat(parts), len = []; let n = body.length;
  do{ let d = n % 128; n = Math.floor(n / 128); if(n > 0) d |= 128; len.push(d); }while(n > 0);
  return cat([Uint8Array.of(head), Uint8Array.from(len), body]);
}
// Client MQTT 3.1.1 minimal sur WebSocket (QoS 0, messages retenus).
function mqttConn(b, topics, on){
  let ws = null, ok = false, closed = false, buf = new Uint8Array(0), tries = 0, ping = null, guard = null;
  const cid = "sb" + rid() + rid();
  function send(p){ try{ if(ws && ws.readyState === 1) ws.send(p); }catch(e){} }
  function down(){
    clearInterval(ping); clearTimeout(guard);
    const was = ok; ok = false; buf = new Uint8Array(0);
    if(ws){ ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null; try{ ws.close(); }catch(e){} ws = null; }
    if(was) on.down();
    if(!closed) setTimeout(open, Math.min(15000, 800 * Math.pow(2, tries++)));
  }
  function open(){
    if(closed) return;
    try{ ws = new WebSocket(b.url, ["mqtt"]); }catch(e){ down(); return; }
    ws.binaryType = "arraybuffer";
    guard = setTimeout(down, 9000);
    ws.onopen = () => {
      const fl = 0x02 | (b.user ? 0x80 : 0) | (b.pass ? 0x40 : 0);
      const parts = [mStr("MQTT"), Uint8Array.of(4, fl, 0, 30), mStr(cid)];
      if(b.user) parts.push(mStr(b.user)); if(b.pass) parts.push(mStr(b.pass));
      send(mPkt(0x10, parts));
    };
    ws.onmessage = e => { if(typeof e.data === "string") return; buf = cat([buf, new Uint8Array(e.data)]); parse(); };
    ws.onclose = down; ws.onerror = () => {};
  }
  function parse(){
    for(;;){
      if(buf.length < 2) return;
      let len = 0, mul = 1, i = 1, d;
      do{ if(i >= buf.length) return; d = buf[i++]; len += (d & 127) * mul; mul *= 128; }while(d & 128 && i < 5);
      if(buf.length < i + len) return;
      const h = buf[0], body = buf.subarray(i, i + len); buf = buf.slice(i + len);
      const type = h >> 4;
      if(type === 2){ // CONNACK
        if(body[1] !== 0){ down(); return; }
        clearTimeout(guard); ok = true; tries = 0;
        const sub = [Uint8Array.of(0, 1)]; topics.forEach(t => { sub.push(mStr(t), Uint8Array.of(0)); });
        send(mPkt(0x82, sub));
        ping = setInterval(() => send(Uint8Array.of(0xc0, 0)), 20000);
        on.up(api);
      } else if(type === 3){ // PUBLISH
        const tl = (body[0] << 8) | body[1], topic = TD.decode(body.subarray(2, 2 + tl));
        const qos = (h >> 1) & 3; let o = 2 + tl;
        if(qos){ const id = body.subarray(o, o + 2); o += 2; if(qos === 1) send(cat([Uint8Array.of(0x40, 2), id])); }
        on.msg(topic, body.slice(o), !!(h & 1));
      }
    }
  }
  const api = {
    ok: () => ok,
    pub(topic, payload, retain){ if(ok) send(mPkt(0x30 | (retain ? 1 : 0), [mStr(topic), payload])); },
    close(){ closed = true; if(ok) send(Uint8Array.of(0xe0, 0)); setTimeout(down, 50); }
  };
  open();
  return api;
}
async function relayKey(code){
  try{
    if(!(window.crypto && crypto.subtle)) return null;
    const raw = await crypto.subtle.digest("SHA-256", TE.encode("soiree-box/cle/" + code));
    return await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  }catch(e){ return null; }
}
async function seal(key, obj){
  const data = TE.encode(JSON.stringify(obj));
  if(!key) return cat([Uint8Array.of(0), data]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return cat([Uint8Array.of(1), iv, new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data))]);
}
async function unseal(key, b){
  if(!b.length) return null;
  if(b[0] === 0) return JSON.parse(TD.decode(b.subarray(1)));
  if(b[0] === 1 && key) return JSON.parse(TD.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.subarray(1, 13) }, key, b.subarray(13))));
  return null;
}
// Bus : publie sur tous les serveurs, reçoit de tous (les doublons sont filtrés plus haut).
function relayBus(code, key, onMsg, onUp){
  const base = "soireebox-r1/" + code.toLowerCase(), mine = {};
  let q = Promise.resolve(), up = false;
  const state = () => { const u = conns.some(c => c.ok()); if(u !== up){ up = u; onUp(u); } };
  const conns = BROKERS.map(b => mqttConn(b, [base + "/#"], {
    up(c){ Object.keys(mine).forEach(t => c.pub(base + "/" + t, mine[t], true)); state(); },
    down: state,
    msg(t, payload, ret){ if(t.indexOf(base + "/") !== 0) return; unseal(key, payload).then(o => { if(o && typeof o === "object") onMsg(t.slice(base.length + 1), o, ret); }, () => {}); }
  }));
  return {
    up: () => up,
    count: () => conns.filter(c => c.ok()).length,
    pub(t, obj, retain){ q = q.then(() => seal(key, obj)).then(p => { if(retain) mine[t] = p; conns.forEach(c => c.pub(base + "/" + t, p, retain)); }).catch(() => {}); return q; },
    clear(t){ q = q.then(() => { delete mine[t]; conns.forEach(c => c.pub(base + "/" + t, new Uint8Array(0), true)); }); return q; },
    forget(){ Object.keys(mine).forEach(t => { delete mine[t]; }); },
    close(){ return q.then(() => new Promise(r => setTimeout(r, 120))).then(() => conns.forEach(c => c.close())); }
  };
}
async function relayRoom(code, asHost){
  const me = "r" + rid() + rid(), key = await relayKey(code);
  const ph = listeners(), ch = listeners(), hh = listeners(), seen = {};
  let bus = null, host = false, ep = 0, hid = null, hostSeen = Date.now(), gone = false, hb = null;
  let self = {}, game = null, priv = {}, list = [], snap = [], offset = 0, n = 0;
  let roster = new Map(), gT = null, pT = null, cT = null, tick = Date.now(), liveSeen = false, lastC = 0;
  // Pièces jointes (photos) : découpées en morceaux, jamais retenues par les serveurs, assemblées à l'arrivée.
  const bh = listeners(), bparts = {}, bdone = {};
  function gotBlob(t, o){
    const id = String(o.id || ""), i = +o.i, of = +o.of, d = o.d, now = Date.now();
    if(typeof o.f !== "string" || t !== "b/" + o.f || o.f === me) return;
    if(!/^[a-z0-9]{4,40}$/i.test(id) || !(of >= 1 && of <= 40) || !(i >= 0 && i < of) || i !== Math.floor(i) || typeof d !== "string" || d.length > 20000) return;
    if(bdone[id] && now - bdone[id] < 2500) return;
    Object.keys(bparts).forEach(k => { if(now - bparts[k].at > 60000) delete bparts[k]; });
    Object.keys(bdone).forEach(k => { if(now - bdone[k] > 60000) delete bdone[k]; });
    let p = bparts[id];
    if(!p){ if(Object.keys(bparts).length >= 8) return; p = bparts[id] = { of, got: [], n: 0, at: now }; }
    if(p.of !== of || p.got[i] != null) return;
    p.got[i] = d; p.n++;
    if(p.n === of){ delete bparts[id]; bdone[id] = now; bh.fire(id, p.got.join(""), o.f); }
  }
  const better = (e, h) => e > ep || (e === ep && (!hid || h < hid));
  function build(){
    let arr;
    if(host){
      arr = [{ peer: me, sameTab: true, presence: Object.freeze(Object.assign({}, self)) }];
      roster.forEach((r, id) => arr.push({ peer: id, sameTab: false, presence: r.p }));
    } else {
      const quiet = Date.now() - hostSeen > 7000;
      arr = list.filter(x => x && typeof x.peer === "string" && !(quiet && x.peer === hid)).map(x => ({
        peer: x.peer, sameTab: x.peer === me,
        presence: Object.freeze(Object.assign({}, x.presence && typeof x.presence === "object" ? x.presence : {}, x.peer === me ? self : {}))
      }));
      if(!arr.some(p => p.sameTab)) arr.push({ peer: me, sameTab: true, presence: Object.freeze(Object.assign({}, self)) });
    }
    snap = Object.freeze(arr);
  }
  function emit(){ build(); ph.fire(); }
  const msg = (t, extra) => Object.assign({ t, f: me, n: ++n, ep, hid }, extra);
  function pubG(){ clearTimeout(gT); gT = setTimeout(() => { if(host) bus.pub("g", msg("g", { g: game, list: snap.map(p => ({ peer: p.peer, presence: p.presence })), ts: Date.now() }), true); }, 16); }
  function pubP(){ clearTimeout(pT); pT = setTimeout(() => { if(host) bus.pub("p", msg("p", { pv: priv }), true); }, 16); }
  function pubH(x){ bus.pub("h", msg("h", Object.assign({ ts: Date.now() }, x || {})), true); }
  function pubC(){ clearTimeout(cT); cT = setTimeout(() => { if(!host){ lastC = Date.now(); bus.pub("c/" + me, msg("c", { p: self }), false); } }, 16); }
  function changed(){ emit(); pubG(); }
  function demote(){ host = false; bus.forget(); roster = new Map(); hostSeen = Date.now(); hh.fire(false, null); pubC(); }
  function onMsg(t, o, ret){
    if(t.indexOf("b/") === 0){ if(!ret) gotBlob(t, o); return; }
    if(typeof o.f !== "string" || typeof o.n !== "number") return;
    const top = t.indexOf("c/") === 0 ? "c" : t, dk = o.f + "|" + top;
    if(o.n <= (seen[dk] || 0)) return; seen[dk] = o.n;
    if(top === "c"){
      if(!host || o.f === me || o.f !== t.slice(2)) return;
      if(o.bye){ if(roster.delete(o.f)) changed(); return; }
      const p = mergePatch({}, o.p && typeof o.p === "object" ? o.p : {}, ["name", "in", "x", "v"]), pj = JSON.stringify(p);
      if(pj.length > 8000) return;
      const r = roster.get(o.f);
      if(!r && roster.size >= 16) return;
      roster.set(o.f, { p: Object.freeze(p), pj, last: Date.now() });
      if(!r || r.pj !== pj) changed();
      return;
    }
    if(typeof o.ep !== "number" || typeof o.hid !== "string" || o.f !== o.hid) return;
    if(o.hid !== hid){
      if(!better(o.ep, o.hid)){ if(host && o.hid !== me){ pubH(); pubG(); pubP(); } return; }
      ep = o.ep; hid = o.hid; game = null; list = []; priv = {};
      if(host && hid !== me) demote();
    } else if(o.ep < ep) return;
    if(top === "h"){
      const fresh = !ret || Math.abs(Date.now() - (+o.ts || 0)) < 12000;
      if(fresh && !o.gone){ hostSeen = Date.now(); gone = false; liveSeen = true; if(typeof o.ts === "number" && !ret) offset = o.ts - Date.now(); }
      if(o.gone && !ret && hid !== me){ gone = true; hostSeen = Math.min(hostSeen, Date.now() - 8500); }
      if(o.gone && ret){ gone = true; }
      emit();
    } else if(hid !== me){
      if(!ret){ hostSeen = Date.now(); liveSeen = true; gone = false; }
      if(top === "g" && o.g && typeof o.g === "object"){ game = o.g; list = A(o.list); emit(); }
      else if(top === "p") priv = o.pv && typeof o.pv === "object" ? o.pv : {};
    }
  }
  function takeOver(){
    const old = hid;
    ep += 1; hid = me; host = true; gone = false; hostSeen = Date.now();
    roster = new Map(list.filter(x => x && x.peer !== me && x.peer !== old).map(x => [x.peer, { p: Object.freeze(Object.assign({}, x.presence || {})), pj: "", last: Date.now() }]));
    build(); pubH(); pubP();
    hh.fire(true, game ? fix(game) : null);
    pubG();
  }
  const conn = listeners();
  bus = relayBus(code, key, onMsg, u => { if(u) hostSeen = Math.max(hostSeen, Date.now() - 2000); conn.fire(u); ch.fire(u); });
  const beat = setInterval(() => {
    const now = Date.now();
    if(now - tick > 4000) hostSeen = now; // le téléphone était en veille : on laisse à l'hôte le temps de se manifester
    tick = now;
    if(!bus.up()) return;
    if(host){
      if(!hb || now - hb > 2500){ hb = now; pubH(); }
      let drop = false; roster.forEach((r, id) => { if(now - r.last > 20000){ roster.delete(id); drop = true; } });
      if(drop) changed();
      return;
    }
    if(now - lastC > 4000) pubC();
    if(!hid || !liveSeen && !gone) return;
    const order = A(game && fix(game).players).map(r => String(A(r)[0]));
    const alive = list.map(x => x && x.peer).filter(id => id && id !== hid);
    const cand = order.filter(id => alive.indexOf(id) >= 0).concat(alive.filter(id => order.indexOf(id) < 0).sort());
    let rank = cand.indexOf(me); if(rank < 0) rank = cand.length;
    if(now - hostSeen > 10000 + rank * 6000) takeOver();
  }, 1000);
  const onVis = () => { if(document.visibilityState === "visible") hostSeen = Math.max(hostSeen, Date.now()); };
  document.addEventListener("visibilitychange", onVis);
  const room = {
    kind: "relay", me: () => me, isHost: () => host, hostId: () => hid,
    diag: () => "relais Internet · serveurs joignables " + bus.count() + "/" + BROKERS.length + " · époque " + ep,
    presence(p){ self = mergePatch(self, p); if(host) changed(); else { emit(); pubC(); } },
    peers: () => snap,
    game: () => (host ? game : (game ? fix(game) : null)),
    setGame(g){ if(!host) return; game = plain(g); changed(); },
    blob(id, data){
      const of = Math.ceil(data.length / 16000) || 1;
      if(of > 40) return false;
      for(let i = 0; i < of; i++) bus.pub("b/" + me, { t: "b", f: me, id, i, of, d: data.slice(i * 16000, (i + 1) * 16000) }, false);
      return true;
    },
    onBlob(h){ return bh.add(h); },
    priv: () => (host ? priv : fix(priv) || {}),
    setPriv(o){ if(!host) return; priv = plain(o || {}); pubP(); },
    now: () => Date.now() + (host ? 0 : offset),
    onPeers(h){ const off = ph.add(h); setTimeout(h, 0); return off; },
    onConnection(h){ const off = ch.add(h); setTimeout(() => h(bus.up()), 0); return off; },
    onHostChange(f){ return hh.add(f); },
    leave(){
      clearInterval(beat); document.removeEventListener("visibilitychange", onVis);
      clearTimeout(gT); clearTimeout(pT); clearTimeout(cT);
      if(host){
        if(roster.size){ bus.pub("h", msg("h", { ts: Date.now(), gone: true }), true); }
        else { bus.clear("h"); bus.clear("g"); bus.clear("p"); }
      } else bus.pub("c/" + me, msg("c", { bye: true, p: {} }), false);
      return bus.close();
    }
  };
  // Connexion à au moins un serveur.
  const upOk = await new Promise(res => {
    if(bus.up()) return res(true);
    const off = conn.add(u => { if(u){ off(); clearTimeout(t); res(true); } });
    const t = setTimeout(() => { off(); res(false); }, 12000);
  });
  if(!upOk){ room.leave(); throw { code: "network" }; }
  // Laisse arriver les messages retenus (salon déjà ouvert avec ce code ?).
  await new Promise(r => setTimeout(r, asHost ? 1600 : 400));
  if(asHost){
    if(hid && !gone && Date.now() - hostSeen < 9000 && liveSeen){ room.leave(); throw { code: "taken" }; }
    ep += 1; hid = me; host = true; game = null; list = []; priv = {};
    build(); pubH();
    return room;
  }
  const t0 = Date.now();
  while(!(hid && liveSeen && !gone && game) && Date.now() - t0 < 8000) await new Promise(r => setTimeout(r, 200));
  if(!(hid && liveSeen && !gone && game)){ room.leave(); throw { code: "not_found" }; }
  emit(); pubC();
  return room;
}

/* =================== Réseau : Firebase (Realtime Database) =================== */
const FB_ON = !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.databaseURL && window.firebase && typeof firebase.database === "function");
const FB = { db: null, uid: null };
const STALE = 12 * 3600 * 1000;
function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms))]); }
function fbErr(e){
  const c = String((e && (e.code || e.message)) || "");
  if(/operation-not-allowed|admin-restricted/i.test(c)) return { code: "auth_off" };
  if(/permission/i.test(c)) return { code: "rules" };
  if(c === "taken" || c === "not_found") return { code: c };
  return { code: "network" };
}
async function fbInit(){
  if(FB.db) return;
  if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
  const auth = firebase.auth();
  if(!auth.currentUser) await auth.signInAnonymously();
  FB.uid = auth.currentUser.uid; FB.db = firebase.database();
}
async function fbOpen(code){
  try{
    await withTimeout(fbInit(), 15000);
    const meta = { hostUid: FB.uid, created: Date.now() };
    const r = await withTimeout(FB.db.ref("rooms/" + code + "/meta").transaction(cur => {
      if(cur && typeof cur.created === "number" && cur.created > Date.now() - STALE) return;
      return meta;
    }), 15000);
    if(!r.committed) throw { code: "taken" };
    try{ await FB.db.ref("rooms/" + code + "/g").set(null); await FB.db.ref("rooms/" + code + "/priv").set(null); }catch(e){}
    return fbRoom(code, meta);
  }catch(e){ throw fbErr(e); }
}
async function fbJoin(code){
  try{
    await withTimeout(fbInit(), 15000);
    const snap = await withTimeout(FB.db.ref("rooms/" + code + "/meta").once("value"), 15000);
    const m = snap.val();
    if(!m || typeof m.created !== "number" || m.created < Date.now() - STALE) throw { code: "not_found" };
    return fbRoom(code, m);
  }catch(e){ throw fbErr(e); }
}
function fbRoom(code, initialMeta){
  const uid = FB.uid, base = FB.db.ref("rooms/" + code), meRef = base.child("players/" + uid);
  let roster = {}, game = null, meta = initialMeta || null, priv = {}, self = {}, snap = [], connected = true, takeTimer = null, offset = 0;
  const ph = listeners(), ch = listeners(), hh = listeners(), offs = [];
  const isHost = () => !!(meta && meta.hostUid === uid);
  let wasHost = isHost();
  function build(){
    const arr = [];
    Object.keys(roster).forEach(id => {
      const p = roster[id]; if(!p || typeof p !== "object") return;
      if(id !== uid && p.online !== true) return;
      const pr = Object.assign({}, p, id === uid ? self : {}); delete pr.online; delete pr.seen;
      arr.push({ peer: id, sameTab: id === uid, presence: Object.freeze(fix(pr)) });
    });
    if(!arr.some(p => p.sameTab)) arr.push({ peer: uid, sameTab: true, presence: Object.freeze(Object.assign({}, self)) });
    snap = Object.freeze(arr);
  }
  function emit(){ build(); ph.fire(); }
  function hostOnline(){ const hp = meta && roster[meta.hostUid]; return !!(hp && hp.online === true); }
  function hostCheck(){
    const h = isHost();
    if(h !== wasHost){ wasHost = h; hh.fire(h, game ? fix(game) : null); }
    if(!meta || h || hostOnline()){ clearTimeout(takeTimer); takeTimer = null; return; }
    if(takeTimer) return;
    const order = A((game && fix(game).players) || []).map(r => String(A(r)[0]));
    const online = Object.keys(roster).filter(id => roster[id] && roster[id].online === true).sort();
    const next = order.find(id => online.indexOf(id) >= 0) || online[0];
    const old = meta.hostUid;
    takeTimer = setTimeout(() => {
      takeTimer = null;
      if(!meta || meta.hostUid !== old || hostOnline()) return;
      base.child("meta").transaction(cur => {
        if(!cur || cur.hostUid !== old) return;
        return { hostUid: uid, created: cur.created };
      }).catch(() => {});
    }, next === uid ? 8000 : 20000);
  }
  const listen = (ref, fn) => { ref.on("value", fn, () => {}); offs.push(() => ref.off("value", fn)); };
  listen(base.child("players"), s => { roster = s.val() || {}; emit(); hostCheck(); });
  listen(base.child("g"), s => { game = s.val(); emit(); });
  listen(base.child("meta"), s => { meta = s.val(); emit(); hostCheck(); });
  listen(base.child("priv"), s => { priv = s.val() || {}; });
  listen(FB.db.ref(".info/serverTimeOffset"), s => { const v = s.val(); offset = typeof v === "number" ? v : 0; });
  listen(FB.db.ref(".info/connected"), s => {
    const c = s.val() === true;
    if(c){
      meRef.onDisconnect().update({ online: false });
      meRef.update(Object.assign(plain(self), { online: true, seen: firebase.database.ServerValue.TIMESTAMP })).catch(() => {});
    }
    if(c !== connected){ connected = c; ch.fire(c); }
  });
  build();
  return {
    kind: "fb", diag: () => "Firebase", me: () => uid, isHost, hostId: () => (meta ? meta.hostUid : null),
    presence(patch){
      self = mergePatch(self, patch);
      meRef.update(plain(patch)).catch(() => {});
      emit();
    },
    peers: () => snap,
    game: () => (game ? fix(game) : null),
    setGame(g){ if(!isHost()) return; game = plain(g); base.child("g").set(game).catch(() => {}); emit(); },
    priv: () => fix(priv) || {},
    setPriv(o){ if(!isHost()) return; priv = plain(o || {}); base.child("priv").set(priv).catch(() => {}); },
    now: () => Date.now() + offset,
    onPeers(h){ const off = ph.add(h); setTimeout(h, 0); return off; },
    onConnection(h){ const off = ch.add(h); setTimeout(() => h(connected), 0); return off; },
    onHostChange(f){ return hh.add(f); },
    leave(){
      clearTimeout(takeTimer); offs.forEach(f => f());
      try{ meRef.onDisconnect().cancel(); }catch(e){}
      return meRef.update({ online: false }).catch(() => {});
    }
  };
}


/* =================== Réseau : salons partagés de Claude (aperçu dans claude.ai) =================== */
let ROOM = null;
function roomRoom(nr, host, code){
  let self = {}, game = null, priv = {}, snap = [], connected = true;
  const ph = listeners(), ch = listeners();
  const meId = () => { const m = nr.peers().find(p => p.sameTab); return m ? m.peer : "moi"; };
  function build(){
    const arr = nr.peers().filter(p => p.kind === "viewer").map(p => ({ peer: p.peer, sameTab: p.sameTab,
      presence: Object.freeze(Object.assign({}, p.presence || {}, p.sameTab ? self : {})) }));
    if(!arr.some(p => p.sameTab)) arr.push({ peer: meId(), sameTab: true, presence: Object.freeze(Object.assign({}, self)) });
    snap = Object.freeze(arr);
  }
  const hostPeer = () => nr.peers().find(p => !p.sameTab && p.presence && p.presence.g && typeof p.presence.g === "object" && p.presence.g.code === code);
  nr.onPeers(() => { build(); ph.fire(); }, () => {});
  nr.onConnection(c => { if(c !== connected){ connected = c; ch.fire(c); } }, () => {});
  function push(p){
    self = mergePatch(self, p);
    if(JSON.stringify(self).length > 3900 && self.x){ delete self.x; p = Object.assign({}, p, { x: null }); }
    nr.presence(plain(p)).catch(e => console.warn("Soirée Box :", e && e.message));
    build(); ph.fire();
  }
  build();
  return {
    kind: "p2p", diag: () => "salon claude.ai", me: meId, isHost: () => host,
    hostId: () => host ? meId() : ((hostPeer() || {}).peer || null),
    presence: push, peers: () => snap,
    game(){ if(host) return game; const h = hostPeer(); return h ? fix(h.presence.g) : null; },
    setGame(g){ if(!host) return; game = plain(g); push({ g: game }); },
    priv: () => priv, setPriv(o){ priv = plain(o || {}); },
    now: () => Date.now(),
    onPeers(h){ const off = ph.add(h); setTimeout(h, 0); return off; },
    onConnection(h){ const off = ch.add(h); setTimeout(() => h(connected), 0); return off; },
    onHostChange(){ return () => {}; },
    leave(){ return nr.leave().catch(() => {}); }
  };
}
function roomWait(nr, test, ms){
  return new Promise(res => {
    const t0 = Date.now();
    const iv = setInterval(() => { if(test()){ clearInterval(iv); res(true); } else if(Date.now() - t0 > ms){ clearInterval(iv); res(false); } }, 200);
  });
}
async function roomOpen(code){
  let nr;
  try{ nr = await ROOM.join("sb-" + code.toLowerCase()); }catch(e){ throw { code: e && e.code === "not_permitted" ? "room_denied" : "network" }; }
  await roomWait(nr, () => nr.peers().some(p => p.sameTab), 5000);
  await roomWait(nr, () => false, 1200);
  if(nr.peers().some(p => !p.sameTab && p.presence && p.presence.g)){ await nr.leave().catch(() => {}); throw { code: "taken" }; }
  return roomRoom(nr, true, code);
}
async function roomJoin(code){
  let nr;
  try{ nr = await ROOM.join("sb-" + code.toLowerCase()); }catch(e){ throw { code: e && e.code === "not_permitted" ? "room_denied" : "network" }; }
  const ok = await roomWait(nr, () => nr.peers().some(p => !p.sameTab && p.presence && p.presence.g && p.presence.g.code === code), 8000);
  if(!ok){ await nr.leave().catch(() => {}); throw { code: "not_found" }; }
  return roomRoom(nr, false, code);
}

/* =================== Navigation =================== */
const SCREENS = ["home", "salon", "game", "spect", "lost", "llist", "lplayers", "local", "page"];
let current = "home";
function show(name){
  if(current === name) return;
  closeSheet();
  SCREENS.forEach(s => { $("#s-" + s).hidden = s !== name; });
  const el = $("#s-" + name); if(el){ el.scrollTop = 0; enter(el); }
  current = name; trail("Écran " + name);
  if(typeof updateGate === "function") try{ updateGate(); }catch(e){}
}

/* ---------- Panneau du bas (fiche de jeu) ---------- */
let sheetOpen = false;
function openSheet(){
  const sh = $("#sheet"); if(!sh) return;
  sheetOpen = true; sh.hidden = false; requestAnimationFrame(() => sh.classList.add("on"));
  const body = $("#sheet-body"); if(body) body.scrollTop = 0;
}
function closeSheet(){
  const sh = $("#sheet"); if(!sh || !sheetOpen) return;
  sheetOpen = false; sh.classList.remove("on"); setTimeout(() => { if(!sheetOpen) sh.hidden = true; }, 220);
}

/* ---------- Bouton retour (Android et appli web installée) ---------- */
let backArm = 0;
function armedBack(msg, action){
  if(Date.now() - backArm < 2500){ backArm = 0; action(); return true; }
  backArm = Date.now(); toast(msg); return true;
}
SB.back = function(){
  if(sheetOpen){ closeSheet(); return true; }
  if(current === "page"){ SB.closePage(); return true; }
  if(current === "lplayers"){ openLocalList(); return true; }
  if(current === "llist"){ goHome(); return true; }
  if(current === "local") return armedBack(tr("Appuie encore sur retour pour quitter la partie", "Press back again to quit the game"), openLocalList);
  if(current === "salon" || current === "game" || current === "spect") return armedBack(tr("Appuie encore sur retour pour quitter le salon", "Press back again to leave the room"), netLeave);
  if(current === "lost"){ netLeave(); return true; }
  return false;
};
function accent(id){
  const app = $("#app");
  app.className = id ? "acc-" + id : "";
}
SB.page = function(title, build, onClose){
  const prev = current;
  closeSheet();
  $("#pg-title").textContent = title;
  const root = $("#page-root"); root.innerHTML = ""; root.dataset.key = "";
  show("page");
  SB._pageClose = () => { SB._pageClose = null; show(prev); if(onClose) onClose(); $("#sa-panel").dataset.key = ""; $("#sa-dock").dataset.key = ""; scheduleRender(); };
  build(root);
};
SB.closePage = function(){ if(SB._pageClose) SB._pageClose(); };

/* =================== Signaler un bug ===================
   - Les erreurs JavaScript et les derniers évènements (écrans, réseau, phases de jeu) sont
     gardés sur le téléphone (localStorage « soiree-buglog »), même si l'appli a planté.
   - « Signaler un bug » ouvre un formulaire ; le rapport part par mail (BUG_MAIL), ou se partage / se copie. */
const VERSION = "4.11";
SB.VERSION = VERSION;
const BUG_MAIL = window.SB_BUG_MAIL || "johnvenien@gmail.com";
const BUGLOG = "soiree-buglog", BUGDRAFT = "soiree-bugdraft";
const BL = { err: [], trail: [], t: null, nudged: 0 };
try{ const o = JSON.parse(localStorage.getItem(BUGLOG) || "{}") || {}; BL.err = A(o.err).filter(x => typeof x === "string").slice(-15); BL.trail = A(o.trail).filter(x => typeof x === "string").slice(-30); }catch(e){}
function blSave(){ clearTimeout(BL.t); BL.t = setTimeout(() => { try{ localStorage.setItem(BUGLOG, JSON.stringify({ err: BL.err.slice(-15), trail: BL.trail.slice(-30) })); }catch(e){} }, 300); }
function stamp(){ const d = new Date(), z = n => String(n).padStart(2, "0"); return z(d.getDate()) + "/" + z(d.getMonth() + 1) + " " + z(d.getHours()) + ":" + z(d.getMinutes()) + ":" + z(d.getSeconds()); }
function trail(msg){ BL.trail.push(stamp() + " " + clean(msg, 140)); if(BL.trail.length > 40) BL.trail.splice(0, BL.trail.length - 40); blSave(); }
function logErr(msg){
  msg = clean(msg, 320); if(!msg) return;
  const last = BL.err[BL.err.length - 1] || "";
  if(last.slice(15) === msg) return; // même erreur en boucle
  BL.err.push(stamp() + " " + msg); if(BL.err.length > 20) BL.err.splice(0, BL.err.length - 20);
  blSave(); bugNudge();
}
window.addEventListener("error", e => { logErr((e.message || "Erreur") + (e.filename ? " @ " + String(e.filename).split("/").pop() + ":" + e.lineno + ":" + e.colno : "")); });
window.addEventListener("unhandledrejection", e => { const r = e.reason; logErr("Promesse rejetée : " + (r && (r.message || r.code) ? (r.message || r.code) : String(r))); });
(function(){
  const ce = console.error;
  console.error = function(){
    try{ logErr(Array.prototype.map.call(arguments, x => (x && x.stack ? String(x.stack).split("\n").slice(0, 2).join(" ← ") : typeof x === "object" ? JSON.stringify(x) : String(x))).join(" ")); }catch(e){}
    return ce.apply(console, arguments);
  };
})();
trail("Ouverture de l'appli v" + VERSION);
// Petit rappel discret quand une erreur vient de se produire.
function bugNudge(){
  if(current === "page" || Date.now() - BL.nudged < 180000 || !document.body) return;
  BL.nudged = Date.now();
  let b = document.getElementById("bug-nudge");
  if(!b){ b = document.createElement("button"); b.id = "bug-nudge"; b.type = "button"; b.className = "bug-nudge"; document.body.append(b); b.addEventListener("click", () => { b.classList.remove("on"); openBug("plante"); }); }
  b.innerHTML = BUGICON + tr("<span>Un souci ? <u>Signaler le bug</u></span>", "<span>Something wrong? <u>Report the bug</u></span>");
  requestAnimationFrame(() => b.classList.add("on"));
  clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove("on"), 7000);
}
const BUGICON = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="13" rx="5"/><path d="M9.5 7a2.5 2.5 0 015 0M12 11v9M7 12H3m4 5l-3 2m3-9L4 8m13 4h4m-4 5l3 2m-3-9l3-2"/></g></svg>';
const BUGTYPES = [["plante", tr("Plantage / blocage", "Crash / freeze")], ["reseau", tr("Réseau", "Network")], ["jeu", tr("Règles du jeu", "Game rules")], ["affichage", tr("Affichage", "Display")], ["autre", tr("Autre", "Other")]];
function platform(){
  if(window.AndroidShare) return "appli Android";
  try{ if(matchMedia("(display-mode: standalone)").matches || navigator.standalone) return "appli installée (web)"; }catch(e){}
  return window.claude ? "aperçu claude.ai" : "navigateur";
}
function bugDiag(){
  const lines = [];
  const nav = navigator, cn = nav.connection || {};
  lines.push("Version : " + VERSION + " · " + platform());
  lines.push("Date : " + new Date().toLocaleString("fr-FR"));
  lines.push("Téléphone : " + clean(nav.userAgent, 220));
  lines.push("Écran : " + innerWidth + "×" + innerHeight + " · densité " + (window.devicePixelRatio || 1) + " · langue " + (nav.language || "?"));
  lines.push("Connexion : " + (nav.onLine === false ? "HORS LIGNE" : "en ligne") + (cn.effectiveType ? " · " + cn.effectiveType : "") + (cn.type ? " · " + cn.type : ""));
  lines.push("Vue : " + current);
  if(N.nr){
    const g = G() || {}, def = g.phase === "game" ? SB.byId[g.game] : null, s = g.s || {};
    lines.push("Réseau : " + (N.nr.diag ? N.nr.diag() : N.nr.kind) + " · " + (N.connected ? "connecté" : "déconnecté"));
    lines.push("Salon " + N.code + " · " + (N.host ? "hôte" : "joueur") + " · " + plural(namedPeers().length, "joueur") + " en ligne");
    if(def){
      lines.push("Jeu : " + def.name + " (" + def.id + ") · phase " + (s.phase || "?") + (s.round ? " · manche " + s.round : "") + " · " + plural(A(g.players).length, "joueur") + " au départ");
      const o = g.opts && typeof g.opts === "object" ? JSON.stringify(g.opts) : "";
      if(o) lines.push("Options : " + clean(o, 300));
    } else lines.push("Salon : " + (g.sel ? "jeu choisi " + g.sel : "aucun jeu choisi"));
  } else if(L.def) lines.push("Un seul téléphone : " + L.def.name + " (" + L.def.id + ")");
  else lines.push("Pas de salon en cours");
  lines.push("", "Erreurs récentes :");
  lines.push.apply(lines, BL.err.length ? BL.err.slice(-8).map(x => "• " + x) : ["• aucune"]);
  lines.push("", "Derniers évènements :");
  lines.push.apply(lines, BL.trail.slice(-15).map(x => "• " + x));
  return lines.join("\n");
}
function openBug(type){
  let draft = {};
  try{ draft = JSON.parse(localStorage.getItem(BUGDRAFT) || "{}") || {}; }catch(e){}
  const st = { type: type || draft.type || "plante", id: rid().slice(0, 5).toUpperCase() };
  const diag = bugDiag();
  SB.page(tr("Signaler un bug", "Report a bug"), root => {
    root.innerHTML =
      '<p class="lead">' + tr("Dis-nous ce qui cloche. Le rapport contient aussi les infos techniques utiles (version, écran, jeu, erreurs) pour corriger plus vite.", "Tell us what went wrong. The report also includes useful technical info (version, screen, game, errors) so it can be fixed faster.") + '</p>' +
      '<div class="field"><span class="eyebrow">' + tr("Type de problème", "Type of problem") + '</span><div class="filters" id="bg-type">' +
        BUGTYPES.map(t => '<button type="button" data-t="' + t[0] + '" aria-pressed="' + (st.type === t[0]) + '">' + esc(t[1]) + "</button>").join("") + "</div></div>" +
      '<label class="lbl" for="bg-what">' + tr("Ce qui s'est passé", "What happened") + '<textarea class="txt area" id="bg-what" rows="4" maxlength="1500" placeholder="' + esc(tr("Ex : dans Dernière carte, j'ai posé un +2 et plus personne ne pouvait jouer.", "E.g. in Last Card, I played a +2 and then nobody could play.")) + '"></textarea></label>' +
      '<label class="lbl" for="bg-how">' + tr("Comment reproduire le problème (si tu sais)", "How to reproduce it (if you know)") + '<textarea class="txt area" id="bg-how" rows="3" maxlength="800" placeholder="' + esc(tr("Ex : 3 joueurs, cumul activé, j'étais l'hôte en 4G.", "E.g. 3 players, stacking on, I was the host on mobile data.")) + '"></textarea></label>' +
      '<label class="chk"><input type="checkbox" id="bg-tech" checked><span>' + tr("Joindre les infos techniques", "Attach technical info") + '</span></label>' +
      '<details class="bg-det"><summary>' + tr("Voir les infos techniques", "Show technical info") + '</summary><pre class="bg-pre">' + esc(diag) + "</pre></details>" +
      '<p class="sm">' + tr("Le rapport s'ouvre dans ton appli mail, prêt à envoyer à " + esc(BUG_MAIL) + ". Tu peux aussi le partager ou le copier.", "The report opens in your mail app, ready to send to " + esc(BUG_MAIL) + ". You can also share or copy it.") + "</p>" +
      dock('<p class="err" id="bg-err" hidden></p><button class="btn acc" id="bg-mail" type="button">' + tr("Envoyer par mail", "Send by email") + '</button><div class="row2"><button class="btn ghost" id="bg-share" type="button">' + tr("Partager", "Share") + '</button><button class="btn ghost" id="bg-copy" type="button">' + tr("Copier", "Copy") + '</button></div>');
    const what = $("#bg-what", root), how = $("#bg-how", root), tech = $("#bg-tech", root), err = $("#bg-err", root);
    what.value = draft.what || ""; how.value = draft.how || "";
    const save = () => { try{ localStorage.setItem(BUGDRAFT, JSON.stringify({ type: st.type, what: what.value, how: how.value })); }catch(e){} };
    what.addEventListener("input", () => { save(); err.hidden = true; }); how.addEventListener("input", save);
    $$("#bg-type button", root).forEach(b => b.addEventListener("click", () => {
      st.type = b.dataset.t; buzz(6); save();
      $$("#bg-type button", root).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    }));
    const label = () => (BUGTYPES.find(t => t[0] === st.type) || BUGTYPES[4])[1];
    const subject = () => "[Soirée Box " + VERSION + "] Bug #" + st.id + " · " + label() + (L.def && !N.nr ? " · " + L.def.name : N.nr && G() && G().phase === "game" && SB.byId[G().game] ? " · " + SB.byId[G().game].name : "");
    const body = () => tr("Rapport de bug #" + st.id + "\nType : " + label() + "\n\nCe qui s'est passé :\n", "Bug report #" + st.id + "\nType: " + label() + "\n\nWhat happened:\n") + clean(what.value, 1500) +
      (clean(how.value, 800) ? tr("\n\nPour le reproduire :\n", "\n\nHow to reproduce:\n") + clean(how.value, 800) : "") +
      (tech.checked ? tr("\n\n— Infos techniques —\n", "\n\n— Technical info —\n") + diag : "") + "\n";
    const ok = () => {
      if(clean(what.value, 1500).length < 5){ err.textContent = tr("Décris le problème en quelques mots.", "Describe the problem in a few words."); err.hidden = false; buzz([20, 60, 20]); what.focus(); return false; }
      return true;
    };
    const done = msg => {
      trail("Rapport de bug #" + st.id + " préparé");
      try{ localStorage.removeItem(BUGDRAFT); }catch(e){}
      BL.err = []; blSave(); toast(msg);
    };
    $("#bg-mail", root).addEventListener("click", () => {
      if(!ok()) return;
      let b = body(); if(b.length > 6000) b = b.slice(0, 6000) + "\n…";
      const a = document.createElement("a");
      a.href = "mailto:" + BUG_MAIL + "?subject=" + encodeURIComponent(subject()) + "&body=" + encodeURIComponent(b);
      a.rel = "noopener"; document.body.append(a); a.click(); a.remove();
      done(tr("Ton appli mail s'ouvre avec le rapport. Merci !", "Your mail app is opening with the report. Thanks!"));
    });
    $("#bg-share", root).addEventListener("click", () => { if(!ok()) return; shareText(subject() + "\n\n" + body(), "", null, m => done(m === "Copié" ? tr("Rapport copié. Merci !", "Report copied. Thanks!") : tr("Merci pour le rapport !", "Thanks for the report!"))); });
    $("#bg-copy", root).addEventListener("click", () => { if(!ok()) return; copyText(subject() + "\n\n" + body(), () => done(tr("Rapport copié : colle-le où tu veux. Merci !", "Report copied: paste it wherever you like. Thanks!")), () => toast(tr("Impossible de copier ici.", "Can't copy here."))); });
  });
}
SB.bug = openBug;

/* Familles de jeux pour les filtres de l'accueil et du salon */
const CATS = { note10: "votes", photoroulette: "wip", kink: "votes", quiplus: "votes", tupref: "votes", redflag: "votes", purete: "votes", quiadit: "votes", priorites: "votes",
  undercover: "bluff", killer: "bluff", loupgarou: "bluff", menteurs: "bluff", motsint: "cartes", defis: "cartes", dernierecarte: "cartes", punchline: "votes", actionverite: "cartes" };
const FILTERS = [["all", tr("Tous", "All")], ["votes", tr("Votes", "Voting")], ["bluff", "Bluff"], ["cartes", tr("Cartes", "Cards")], ["hot", "18+"], ["wip", tr("En travaux", "Beta")]];
// Jeux « en travaux » : jouables pour les tester, mais rangés à part, seulement dans leur filtre.
const isWip = d => CATS[d.id] === "wip";
const FSEL = { home: "all", salon: "all" };
function inFilter(d, f){ if(isWip(d)) return f === "wip"; return f === "all" || (f === "hot" ? !!d.hot : CATS[d.id] === f); }
function filterHTML(which){
  return FILTERS.map(f => '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (FSEL[which] === f[0]) + '"' + (f[0] === "hot" ? ' class="hot"' : "") + ">" + f[1] + "</button>").join("");
}
function bindFilter(box, which, redraw){
  box.innerHTML = filterHTML(which);
  $$("[data-f]", box).forEach(b => b.addEventListener("click", () => { FSEL[which] = b.dataset.f; buzz(6); bindFilter(box, which, redraw); redraw(); }));
}
const CHECK = '<svg class="ck" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// « 2–8 joueurs », « 3+ joueurs »
function rangeTxt(d){ const r = d.max ? d.min + "–" + d.max : d.min + "+"; return tr(r + " joueurs", r + " players"); }
// « 2 à 8 joueurs », « 3 joueurs ou plus »
function rangeLong(d){ return d.max ? tr(d.min + " à " + d.max + " joueurs", d.min + " to " + d.max + " players") : tr(d.min + " joueurs ou plus", d.min + " or more players"); }
function tileHTML(def, opts){
  opts = opts || {};
  const range = rangeTxt(def);
  const meta = esc(range) + (def.hot ? " · 18+" : "") + (def.local && def.local.players && def.local.players.min === 1 ? " · solo" : "");
  return '<button type="button" class="tile acc-' + esc(def.id) + (isWip(def) ? " wip" : "") + '" data-id="' + esc(def.id) + '"' + (opts.disabled ? " disabled" : "") + (opts.pressed ? ' aria-pressed="true"' : "") + '>' +
    '<span class="gl">' + esc(def.glyph || def.name.slice(0, 2)) + '</span><span class="nm">' + esc(def.name) + '</span><span class="ds">' + esc(def.pitch || def.tag || "") + '</span><span class="meta">' + (isWip(def) ? '<b class="wipb">' + tr("En travaux", "Beta") + '</b> · ' : "") + (opts.metaHTML || meta) + "</span>" + CHECK + "</button>";
}
function rulesHTML(def){
  const r = A(def.rules);
  return r.length ? '<details><summary>' + tr("Règles", "Rules") + '</summary><ol>' + r.map(x => "<li>" + esc(x) + "</li>").join("") + '</ol></details>' : "";
}
function openRules(def){
  SB.page(def.name, root => {
    accent(def.id);
    root.innerHTML = '<div class="card acc"><span class="gl hand huge">' + esc(def.glyph || "") + '</span><p class="lead">' + esc(def.tag || "") + '</p><span class="sm">' +
      esc(rangeLong(def)) + (def.local ? tr(" · aussi sur un seul téléphone", " · also on a single phone") : "") + '</span></div>' +
      '<ol class="howto" style="margin:0; padding-left:30px; display:flex; flex-direction:column; gap:6px">' + A(def.rules).map(x => "<li>" + esc(x) + "</li>").join("") + "</ol>";
  }, () => accent(""));
}

/* =================== Accueil =================== */
let netReady = false, netLoading = false;
const SHARE_BASE = window.SB_SHARE_BASE || ((location.protocol === "https:" && !/^(localhost|127\.|\[::1\])/.test(location.hostname)) ? location.origin + location.pathname : "");
// Adresse publique du jeu (site + appli) : sert aux liens d'invitation et au QR code, même depuis l'appli Android.
const PUBLIC_BASE = window.SB_PUBLIC_BASE || "https://qapinext-john.github.io/soiree-box/";
const inviteURL = code => (SHARE_BASE || PUBLIC_BASE) + "#" + code;
const APK_URL = PUBLIC_BASE + "SoireeBox.apk";
/* ---------- QR code du salon (scanné avec l'appareil photo : ouvre le site sur le bon salon) ---------- */
function qrSVG(text){
  if(typeof window.qrcode !== "function") return "";
  try{
    const q = window.qrcode(0, "M"); q.addData(text); q.make();
    const n = q.getModuleCount(), m = 2; let d = "";
    for(let r = 0; r < n; r++) for(let c = 0; c < n; c++) if(q.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg viewBox="0 0 ' + (n + 2 * m) + " " + (n + 2 * m) + '" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#14101a"/></svg>';
  }catch(e){ return ""; }
}
function renderQR(){
  const el = $("#sa-qr"); if(!el) return;
  const code = N.code, url = code ? inviteURL(code) : "", svg = code ? qrSVG(url) : "";
  el.hidden = !svg;
  if(!svg || el.dataset.code === code) return;
  el.dataset.code = code;
  el.innerHTML = svg + '<span class="t"><b>' + tr("Scanne pour rejoindre", "Scan to join") + "</b><span>" + tr("Avec l'appareil photo : ça ouvre Soirée Box directement dans ce salon, ou propose d'installer l'appli. Touche pour agrandir.", "With the phone camera: it opens Soirée Box straight into this room, or offers to install the app. Tap to enlarge.") + "</span></span>";
}
function openQR(){
  if(!N.code) return;
  const ov = document.createElement("div"); ov.className = "qrfull"; ov.setAttribute("role", "dialog");
  ov.innerHTML = qrSVG(inviteURL(N.code)) + '<div class="c">' + esc(N.code) + "</div><p>" + tr("Scanne avec l'appareil photo pour rejoindre le salon.", "Scan with the camera to join the room.") + '</p><button class="btn ghost" type="button">' + tr("Fermer", "Close") + "</button>";
  const close = () => ov.remove();
  ov.addEventListener("click", close);
  document.body.append(ov);
}
/* ---------- Arrivée par un lien ou un QR code (#CODE) dans un navigateur ---------- */
function renderInvite(){
  const box = $("#h-invite"); if(!box) return;
  const ua = navigator.userAgent || "", android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
  const standalone = !!(window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  const show = !!hashCode && !window.AndroidShare && !window.claude && !standalone && (android || ios) && !N.nr;
  box.hidden = !show; if(!show){ box.innerHTML = ""; return; }
  if(box.dataset.code === hashCode) return;
  box.dataset.code = hashCode;
  if(android){
    const intent = "intent://join/" + hashCode + "#Intent;scheme=soireebox;package=fr.soireebox.app;S.browser_fallback_url=" + encodeURIComponent(location.href.split("#")[0] + "#" + hashCode) + ";end";
    box.innerHTML = "<p>" + tr("Tu as l'appli Soirée Box ? Ouvre le salon dedans. Sinon, installe-la, ou joue directement ici.", "Got the Soirée Box app? Open the room in it. Otherwise install it, or just play right here.") + "</p>" +
      '<a class="btn acc" href="' + esc(intent) + '">' + tr("Ouvrir dans l'appli", "Open in the app") + "</a>" +
      '<a class="btn ghost" href="' + esc(APK_URL) + '">' + tr("Installer l'appli Android", "Install the Android app") + "</a>" +
      "<p>" + tr("Après l'installation, scanne à nouveau le QR code pour arriver dans le salon.", "After installing, scan the QR code again to land in the room.") + "</p>";
  } else {
    box.innerHTML = "<p>" + tr("Sur iPhone, Soirée Box marche directement ici. Pour l'avoir comme une appli : bouton Partager, puis « Sur l'écran d'accueil ».", "On iPhone, Soirée Box works right here. To get it like an app: tap Share, then “Add to Home Screen”.") + "</p>";
  }
}
// Appelé par l'appli Android quand on l'ouvre avec un lien d'invitation (soireebox://join/CODE).
SB.openInvite = function(code){
  code = String(code || "").toUpperCase();
  if(!/^[A-Z]{4}$/.test(code)) return;
  if(N.nr){ if(N.code !== code) toast(tr("Quitte d'abord ce salon pour rejoindre " + code, "Leave this room first to join " + code)); return; }
  hashCode = code; const cd = $("#h-code"); if(cd) cd.value = code;
  if(typeof goHome === "function") goHome();
  const nm = $("#h-name"); if(nm && !clean(nm.value, 16)) setTimeout(() => nm.focus(), 200);
};
function homeErr(msg){ const e = $("#h-err"); e.textContent = msg || ""; e.hidden = !msg; }
let hashCode = null;
function renderHome(){
  renderInvite(); renderHomeProfile();
  const nm = clean($("#h-name").value, 16);
  $("#h-create").disabled = !netReady || N.joining;
  $("#h-join").disabled = !netReady || N.joining;
  void nm;
  const info = $("#h-netinfo");
  if(netLoading){ info.textContent = tr("Connexion au mode réseau…", "Connecting to online mode…"); info.hidden = false; }
  else if(!netReady){ info.textContent = window.claude ? tr("Le mode réseau n'est pas disponible ici. Ouvre la page depuis claude.ai en étant connecté, ou joue sur un seul téléphone.", "Online mode isn't available here. Open the page from claude.ai while signed in, or play on one phone.") : tr("Le mode réseau n'a pas pu démarrer. Vérifie ta connexion internet puis relance l'appli, ou joue sur un seul téléphone.", "Online mode couldn't start. Check your internet connection and restart the app, or play on one phone."); info.hidden = false; }
  else if(N.joining){ info.hidden = false; }
  else if(hashCode){ info.textContent = tr("Tu es invité dans le salon " + hashCode + ". Entre ton prénom, puis touche « Rejoindre ».", "You're invited to room " + hashCode + ". Enter your name, then tap “Join”."); info.hidden = false; }
  else if(!$("#h-err").hidden){ info.hidden = true; }
  else info.hidden = true;
}
function goHome(){ accent(""); keepAwake(false); const gs0 = document.getElementById("gage-sheet"); if(gs0) gs0.remove(); show("home"); renderHome(); }

/* =================== Mises à jour sans réinstaller (appli Android) ===================
   L'appli vérifie en ligne (version.json) s'il y a une nouvelle version. Les nouveautés se téléchargent
   en quelques secondes dans l'appli ; seul un changement de la partie Android demande un nouvel APK. */
const UP = { st: null, last: 0, manual: false, need: null };
function upInfo(){ try{ return JSON.parse(window.AndroidUpdate.info() || "{}"); }catch(e){ return {}; } }
function checkUpdate(manual){
  if(!window.AndroidUpdate) return;
  UP.manual = !!manual; UP.last = Date.now();
  if(manual){ UP.st = { t: "checking" }; renderUpdate(); }
  try{ window.AndroidUpdate.check(); }catch(e){}
}
SB.onUpdate = function(e){
  if(!e || typeof e !== "object") return;
  if(e.t === "avail" && e.v) UP.need = String(e.v);
  if(e.t === "none") UP.need = null;
  if(e.t === "none"){ if(UP.manual) toast(tr("Tu as déjà la dernière version (" + e.v + ").", "You already have the latest version (" + e.v + ").")); UP.st = null; }
  else if(e.t === "error" && !UP.manual && !(UP.st && (UP.st.t === "progress" || UP.st.t === "avail"))) UP.st = null;
  else if(e.t === "progress") UP.st = Object.assign({}, UP.st, e, { t: "progress" });
  else UP.st = Object.assign({}, e.t === "error" && UP.st ? { prev: UP.st.prev || UP.st } : {}, e);
  if(e.t === "ready") trail("Mise à jour " + e.v + " installée");
  if(e.t === "error") trail("Mise à jour : " + (e.msg || "erreur"));
  renderUpdate();
};
// Toutes les mises à jour sont obligatoires : tant qu'une version plus récente existe, on ne joue pas.
const FORCE_UPDATES = true;
function cmpV(a, b){ const x = String(a || "0").split("."), y = String(b || "0").split("."); for(let i = 0; i < Math.max(x.length, y.length); i++){ const p = +x[i] || 0, q = +y[i] || 0; if(p !== q) return p < q ? -1 : 1; } return 0; }
const PLAYING = ["game", "local", "spect"];
let gateAsked = "";
// Écran bloquant « Mise à jour obligatoire » (jamais pendant une partie en cours : il s'affiche juste après).
function updateGate(){
  let g = document.getElementById("sb-gate");
  const u = UP.st, salonV = N.nr ? newestV(namedPeers()) : VERSION, behind = cmpV(salonV, VERSION) > 0;
  const forced = !!(FORCE_UPDATES && UP.need && cmpV(UP.need, VERSION) > 0);
  const on = (forced || behind) && PLAYING.indexOf(current) < 0;
  if(!on){ if(g) g.hidden = true; return; }
  if(behind && !forced && window.AndroidUpdate && gateAsked !== salonV){ gateAsked = salonV; checkUpdate(false); }
  if(!g){ g = document.createElement("div"); g.id = "sb-gate"; g.className = "gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); document.body.append(g); }
  g.hidden = false;
  const box = forced ? updateHTML(u || { t: "checking" }, true) :
    '<div class="h"><span class="eyebrow">' + tr("Mise à jour obligatoire", "Update required") + '</span><b>' + tr("Ce salon joue avec Soirée Box " + esc(salonV), "This room is playing on Soirée Box " + esc(salonV)) + '</b><span class="sm">' + tr("Tu as la version " + esc(VERSION) + ". Mets à jour pour jouer avec les autres.", "You have version " + esc(VERSION) + ". Update to play with the others.") + "</span></div>" +
    (window.AndroidUpdate ? '<button class="btn acc" type="button" data-retry>' + tr("Chercher la mise à jour", "Check for the update") + '</button>' : '<button class="btn acc" type="button" data-reload>' + tr("Recharger la page", "Reload the page") + '</button>') +
    (N.nr ? '<button class="link" type="button" data-leave style="align-self:center">' + tr("Quitter le salon", "Leave the room") + '</button>' : "");
  const html = '<div class="gate-in"><div class="brand-s">Soirée Box</div><div class="upd">' + box + "</div></div>";
  if(g.dataset.h !== html){ g.dataset.h = html; g.innerHTML = html; bindUpdate(g); }
}
function renderUpdate(){
  const el = $("#h-update"), ver = $("#h-ver");
  if(ver){
    const info = window.AndroidUpdate ? upInfo() : {};
    ver.innerHTML = "Version " + esc(info.version || VERSION) + (window.AndroidUpdate ? ' · <button type="button" data-chk>' + tr("Vérifier les mises à jour", "Check for updates") + '</button>' : "");
    const b = $("[data-chk]", ver); if(b) b.addEventListener("click", () => checkUpdate(true));
  }
  updateGate();
  if(!el) return;
  const u = UP.st;
  if(!u || (FORCE_UPDATES && u.t !== "checking" && u.t !== "error")){ el.hidden = true; el.innerHTML = ""; return; }
  el.innerHTML = updateHTML(u, false); el.hidden = !el.innerHTML;
  bindUpdate(el);
}
function updateHTML(u, forced){
  let h = "";
  if(u.t === "checking") h = '<div class="h"><b>' + tr("Recherche de mises à jour…", "Checking for updates…") + '</b></div>';
  else if(u.t === "avail"){
    const notes = A(u.notes).slice(0, 5);
    h = '<div class="h"><span class="eyebrow">' + (forced ? tr("Mise à jour obligatoire", "Update required") : tr("Nouvelle version", "New version")) + '</span><b>' + tr("Soirée Box " + esc(u.v) + " est disponible", "Soirée Box " + esc(u.v) + " is available") + '</b><span class="sm">' + tr("Ta version : ", "Your version: ") + esc(u.cur || VERSION) + "</span></div>" +
      (notes.length ? "<ul>" + notes.map(n => "<li>" + esc(clean(n, 160)) + "</li>").join("") + "</ul>" : "") +
      (u.needApk ? '<p class="sm">' + tr("Cette version modifie l'appli Android elle-même : télécharge la nouvelle appli et installe-la par-dessus l'ancienne. Tes réglages et ton historique sont conservés.", "This version changes the Android app itself: download the new app and install it over the old one. Your settings and history are kept.") + '</p><button class="btn acc" type="button" data-apk>' + tr("Télécharger la nouvelle appli", "Download the new app") + '</button>'
        : '<button class="btn acc" type="button" data-go>' + tr("Mettre à jour maintenant", "Update now") + '</button>' + (forced ? "" : '<button class="link" type="button" data-later style="align-self:center">' + tr("Plus tard", "Later") + '</button>'));
  } else if(u.t === "progress"){
    const p = u.total ? Math.round(100 * u.done / u.total) : 0;
    h = '<div class="h"><b>' + tr("Mise à jour en cours…", "Updating…") + '</b><span class="sm">' + (u.done || 0) + " / " + (u.total || "?") + tr(" fichiers vérifiés", " files checked") + '</span></div><div class="pg"><i style="width:' + p + '%"></i></div>';
  } else if(u.t === "ready"){
    h = '<div class="h"><span class="eyebrow">' + tr("C'est prêt", "All set") + '</span><b>' + tr("Version " + esc(u.v) + " installée", "Version " + esc(u.v) + " installed") + '</b><span class="sm">' + tr("Redémarre pour en profiter.", "Restart to use it.") + "</span></div>" +
      '<button class="btn acc" type="button" data-restart>' + tr("Redémarrer maintenant", "Restart now") + '</button>';
  } else if(u.t === "error"){
    h = '<div class="h"><b>' + tr("Mise à jour impossible", "Update failed") + '</b><span class="sm">' + esc(u.msg || tr("Vérifie ta connexion internet.", "Check your internet connection.")) + "</span></div>" +
      '<button class="btn ghost" type="button" data-retry>' + tr("Réessayer", "Try again") + '</button>' + (forced ? "" : '<button class="link" type="button" data-later style="align-self:center">' + tr("Fermer", "Close") + '</button>');
  }
  if(forced && u.t === "avail") h += '<p class="sm">' + tr("Il faut la dernière version pour jouer. Ça prend quelques secondes.", "You need the latest version to play. It only takes a few seconds.") + '</p>';
  return h;
}
function bindUpdate(el){
  const on = (sel, fn) => { const b = $(sel, el); if(b) b.addEventListener("click", fn); };
  on("[data-reload]", () => { try{ location.reload(); }catch(e){} });
  on("[data-leave]", () => netLeave());
  on("[data-go]", () => { buzz(16); UP.st = { t: "progress", done: 0, total: 0 }; renderUpdate(); try{ window.AndroidUpdate.apply(); }catch(e){} });
  on("[data-apk]", () => { try{ window.AndroidUpdate.openApk(); }catch(e){} toast(tr("Le téléchargement démarre : installe ensuite le fichier par-dessus l'appli.", "Download starting: then install the file over the app.")); });
  on("[data-restart]", () => { try{ window.AndroidUpdate.restart(); }catch(e){ location.reload(); } });
  on("[data-retry]", () => checkUpdate(true));
  on("[data-later]", () => { UP.st = null; renderUpdate(); });
}

/* =================== Salon en réseau =================== */
const AVC = ["#ff7b5c", "#8f9bff", "#4fd1bf", "#ffd25e", "#ff8fc8", "#7bd88f", "#c49bff", "#6cc3ff", "#ffb34d", "#e0a479"];
const N = { nr: null, code: "", host: false, g: null, peers: [], connected: true, offTimer: null, unsubs: [], seenHost: false, lostTimer: null, joining: false };
// Classement de la soirée : [[nom, victoires], …] (tableau, car Firebase refuse certains caractères dans les clés).
function addTally(t, names){
  const m = new Map(A(t).map(A).filter(x => x[0]).map(x => [String(x[0]), +x[1] || 0]));
  A(names).forEach(n => { n = clean(n, 16); if(n) m.set(n, (m.get(n) || 0) + 1); });
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
}
function tallyHTML(t, played){
  const r = A(t).map(A).filter(x => x[0] && x[1] > 0);
  if(!r.length) return "";
  const top = r[0][1];
  let rank = 0, prev = -1;
  return '<div class="sbt"><span class="eyebrow">' + tr("Classement de la soirée", "Tonight's leaderboard") + (played ? " · " + plural2(played, "partie", "parties", "game") : "") + '</span><ol>' +
    r.slice(0, 6).map((x, i) => { if(x[1] !== prev){ rank = i + 1; prev = x[1]; } return '<li' + (x[1] === top ? ' class="first"' : "") + '><span class="rk">' + rank + '</span><span class="nm">' + esc(x[0]) + '</span><span class="w">' + plural2(x[1], "victoire", "victoires", "win") + "</span></li>"; }).join("") + "</ol></div>";
}
// Versions dans le salon : chaque téléphone annonce la sienne (presence.v).
function peerV(p){ return clean(pres(p).v, 12); }
function newestV(np){ return A(np).reduce((m, p) => (cmpV(peerV(p) || "0", m) > 0 ? peerV(p) : m), VERSION); }
function lateNames(np){ const top = newestV(np); return A(np).filter(p => cmpV(peerV(p) || "0", top) < 0).map(p => clean(pres(p).name, 16)); }
function pres(p){ return p && p.presence && typeof p.presence === "object" ? p.presence : {}; }
function peerById(id){ return N.peers.find(p => p.peer === id); }
function namedPeers(){ return N.peers.filter(p => clean(pres(p).name, 16)); }
function G(){ if(!N.nr) return null; return N.host ? N.g : N.nr.game(); }
function freshSalon(){ return { v: 1, code: N.code, phase: "salon", sel: "", game: "", gid: "", players: [], s: null, opts: null, last: null, gages: gLocalSettings(), gt: {} }; }
function makeCode(){ const L = "ABCDEFGHJKLMNPQRSTUVWXYZ"; let s = ""; for(let i = 0; i < 4; i++) s += L[Math.floor(Math.random() * L.length)]; return s; }
function myExtras(){ const x = Object.assign({}, CORE_X); SB.games.forEach(d => { if(typeof d.presence === "function"){ try{ const v = d.presence(); if(v != null) x[d.id] = v; }catch(e){} } }); return x; }
SB.refreshExtras = function(){ if(N.nr) N.nr.presence({ x: plain(myExtras()) }); };

async function netEnter(code, asHost){
  if(N.joining) return;
  const name = clean($("#h-name").value, 16);
  if(!netReady) return;
  if(!name){ homeErr(tr("Entre ton prénom pour que les autres te reconnaissent.", "Enter your name so the others know who you are.")); buzz([20, 60, 20]); $("#h-name").focus(); return; }
  if(!/^[A-Z]{4}$/.test(code)){ homeErr(tr("Le code du salon doit faire 4 lettres.", "The room code must be 4 letters.")); buzz([20, 60, 20]); $("#h-code").focus(); return; }
  homeErr(""); N.joining = true;
  $("#h-netinfo").textContent = asHost ? tr("Ouverture du salon…", "Opening the room…") : tr("Connexion au salon " + code + "…", "Joining room " + code + "…");
  renderHome();
  let nr;
  try{
    if(asHost){
      for(let i = 0; ; i++){
        try{ nr = FB_ON ? await fbOpen(code) : ROOM ? await roomOpen(code) : await relayRoom(code, true); break; }
        catch(e){ if(e && e.code === "taken" && i < 4){ code = makeCode(); continue; } throw e; }
      }
    } else nr = FB_ON ? await fbJoin(code) : ROOM ? await roomJoin(code) : await relayRoom(code, false);
  }catch(e){
    N.joining = false; renderHome();
    homeErr(e && e.code === "not_found" ? tr("Aucun salon ouvert avec le code " + code + ". Vérifie le code, et vérifie que l'hôte a toujours l'appli ouverte.", "No open room with code " + code + ". Check the code, and make sure the host still has the app open.") :
      e && e.code === "full" ? tr("Ce salon est complet.", "This room is full.") :
      e && e.code === "auth_off" ? tr("Firebase refuse la connexion : active la connexion anonyme dans la console Firebase (voir le guide).", "Firebase refused the connection: enable anonymous sign-in in the Firebase console (see the guide).") :
      e && e.code === "room_denied" ? tr("Le mode réseau n'est pas autorisé pour ton compte sur cette page.", "Online mode isn't allowed for your account on this page.") :
      e && e.code === "rules" ? tr("La base Firebase refuse l'accès : colle les règles du fichier database.rules.json dans la console (voir le guide).", "The Firebase database refused access: paste the rules from database.rules.json into the console (see the guide).") :
      e && e.code === "network" ? tr("Impossible de joindre les serveurs de jeu. Vérifie ta connexion internet (wifi ou données mobiles) et réessaie.", "Can't reach the game servers. Check your internet connection (Wi-Fi or mobile data) and try again.") :
      tr("Connexion impossible. Vérifie ta connexion internet et réessaie.", "Couldn't connect. Check your internet connection and try again."));
    return;
  }
  N.joining = false; hashCode = null;
  Object.assign(N, { nr, code, host: nr.isHost(), peers: nr.peers(), seenHost: false, g: null });
  if(N.host) N.g = freshSalon();
  N.unsubs.push(nr.onHostChange((h, g) => becomeHost(h, g)));
  N.unsubs.push(nr.onPeers(() => { N.peers = nr.peers(); scheduleRender(); }));
  if(typeof nr.onBlob === "function") N.unsubs.push(nr.onBlob(blobGot));
  trail("Salon " + code + " · " + (N.host ? "hôte" : "joueur") + " · " + (nr.diag ? nr.diag() : nr.kind));
  N.unsubs.push(nr.onConnection(c => {
    trail(c ? "Réseau connecté" : "Réseau coupé");
    clearTimeout(N.offTimer);
    if(c){ N.connected = true; renderOffline(); }
    else N.offTimer = setTimeout(() => {
      N.connected = false; renderOffline();
      if(N.nr && N.nr.kind === "p2p" && !N.host) setTimeout(() => { if(N.nr && !N.connected) show("lost"); }, 2500);
    }, 2000);
  }));
  nr.presence({ name, in: null, x: plain(myExtras()), v: VERSION });
  if(N.host) nr.setGame(N.g);
  persist({ name });
  keepAwake(true);
  try{ history.replaceState(null, "", "#" + code); }catch(e){}
  $("#sa-tiles").dataset.key = ""; $("#sa-panel").dataset.key = ""; $("#sa-dock").dataset.key = "";
  render();
}
async function netLeave(){
  BLOBS.clear();
  N.unsubs.forEach(u => { try{ u(); }catch(e){} }); N.unsubs = [];
  clearTimeout(N.lostTimer); N.lostTimer = null;
  if(N.nr){ try{ await N.nr.leave(); }catch(e){} }
  Object.assign(N, { nr: null, host: false, g: null, peers: [], code: "", seenHost: false });
  $("#game-root").dataset.gid = ""; $("#game-root").dataset.key = ""; $("#game-root").innerHTML = "";
  try{ history.replaceState(null, "", location.pathname + location.search); }catch(e){}
  goHome();
}
window.addEventListener("beforeunload", () => { if(N.nr){ try{ N.nr.leave(); }catch(e){} } });

function becomeHost(h, g){
  N.host = h; trail(h ? "Ce téléphone devient l'hôte" : "Ce téléphone n'est plus l'hôte");
  if(h){
    N.g = g && typeof g === "object" && g.phase ? Object.assign({}, g, { code: N.code }) : freshSalon();
    hostSetG({});
  }
  scheduleRender();
}
function hostSetG(patch){
  N.g = Object.assign({}, N.g, patch, { v: ((N.g && N.g.v) || 0) + 1 });
  N.nr.setGame(N.g);
  scheduleRender();
}

/* ---------- Photos partagées pendant une partie (mémoire seulement, effacées à la fin) ---------- */
const BLOBS = new Map();
function blobGot(id, data){
  if(typeof data !== "string" || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(data)) return;
  BLOBS.delete(id); BLOBS.set(id, data);
  while(BLOBS.size > 30) BLOBS.delete(BLOBS.keys().next().value);
  scheduleRender();
}
/* ---------- Contexte passé aux jeux ---------- */
let pending = null, pendingEnd = null, inHost = false;
function makeCtx(){
  const g = G() || {};
  const s = g.s && typeof g.s === "object" ? g.s : {};
  const me = N.nr ? N.nr.me() : "";
  const list = A(g.players).map(r => A(r)).map(r => ({ id: String(r[0]), name: clean(r[1], 16) || tr("Joueur", "Player") }));
  const ctx = {
    me, isHost: N.host, g, s, opts: g.opts || {},
    players: list, ids: list.map(p => p.id),
    playing: list.some(p => p.id === me),
    peers: namedPeers().map(p => ({ id: p.peer, name: clean(pres(p).name, 16), presence: pres(p), me: !!p.sameTab })),
    here: id => !!peerById(id),
    name(id){ const p = list.find(x => x.id === id); if(p) return p.name; const q = peerById(id); return q ? clean(pres(q).name, 16) || tr("Joueur", "Player") : tr("Joueur", "Player"); },
    presence: id => pres(peerById(id)),
    input(id){ const i = pres(peerById(id)).in; return i && typeof i === "object" && i.k === s.k ? fix(i) : null; },
    mine(){ return ctx.input(me); },
    send(patch){
      if(!N.nr) return;
      buzz(10);
      const cur = pres(peerById(me)).in;
      const base = cur && typeof cur === "object" && cur.k === s.k ? cur : {};
      N.nr.presence({ in: plain(Object.assign({}, base, patch, { k: s.k })) });
    },
    set(patch){ if(!N.host) return; pending = Object.assign(pending || {}, patch); },
    end(summary){ if(!N.host) return; pendingEnd = summary || { title: "" }; },
    priv: () => (N.nr ? N.nr.priv() : {}),
    blob: {
      ok: !!(N.nr && typeof N.nr.blob === "function"),
      put(id, data){ if(!N.nr || typeof N.nr.blob !== "function" || typeof data !== "string") return false; blobGot(id, data); return N.nr.blob(id, data); },
      get: id => BLOBS.get(id) || null,
      clear(){ BLOBS.clear(); }
    },
    setPriv(o){ if(N.host && N.nr) N.nr.setPriv(o); },
    now: () => (N.nr ? N.nr.now() : Date.now()),
    act(fn){ runHost(fn); },
    // Gages : [{ id, ev }] (ev déclaré dans def.gages), clé = une par manche pour ne pas compter deux fois.
    gage(list, key){ if(N.host) gHostApply(g.game, list, key); },
    rid, u: SB.u
  };
  return ctx;
}
SB.ctx = makeCtx;
function runHost(fn){
  if(!N.host || !N.g || inHost) return;
  inHost = true; pending = null; pendingEnd = null;
  try{ fn(makeCtx()); }catch(e){ console.error(e); }
  inHost = false;
  if(pendingEnd){
    const sum = pendingEnd; pendingEnd = null; pending = null;
    if(N.g.game && (SB.byId[N.g.game] || {}).gagesEnd !== false){ const w = A(sum.win).map(String), ids = A(N.g.players).map(A).map(r => String(r[0])); if(w.length) gHostApply(N.g.game, w.map(id => ({ id, ev: "_win" })).concat(ids.filter(id => w.indexOf(id) < 0).map(id => ({ id, ev: "_lose" }))), "end" + (N.g.gid || "")); }
    trail("Fin de partie : " + clean(sum.title, 80));
    const who = {}; A(N.g.players).map(A).forEach(p => { who[p[0]] = p[1]; });
    const tally = addTally(N.g.tally, A(sum.win).map(id => who[id]));
    const last = Object.assign({ game: N.g.game }, plain(sum)); delete last.win;
    hostSetG({ phase: "salon", s: null, players: [], last, tally, played: (+N.g.played || 0) + 1 });
    N.nr.setPriv({});
    return;
  }
  if(pending){
    const p = pending; pending = null;
    const s = Object.assign({}, N.g.s || {}, p);
    if(JSON.stringify(s) !== JSON.stringify(N.g.s)) hostSetG({ s: plain(s) });
  }
}

/* ---------- Rendu ---------- */
let rq = false;
function scheduleRender(){ if(rq) return; rq = true; setTimeout(() => { rq = false; render(); }, 0); }
function renderOffline(){
  const hid = N.nr ? N.nr.hostId() : null;
  const hostGone = !!(N.nr && (N.nr.kind === "fb" || N.nr.kind === "relay") && hid && !N.host && N.peers.length > 1 && !peerById(hid));
  $$("[data-offline]").forEach(e => { e.hidden = N.connected && !hostGone; e.textContent = !N.connected ? tr("Hors ligne…", "Offline…") : tr("Changement d'hôte…", "Switching host…"); });
}
let lastPhase = "";
function render(){
  if(!N.nr) return;
  if(BLOBS.size){ const gb = G(); if(!gb || gb.phase !== "game") BLOBS.clear(); }
  if(current === "page"){
    const g0 = G(), d0 = g0 && g0.phase === "game" ? SB.byId[g0.game] : null;
    if(N.host && d0 && typeof d0.host === "function") runHost(ctx => d0.host(ctx));
    return;
  }
  if(current === "lost") return;
  N.peers = N.nr.peers();
  renderOffline();
  const g = G();
  if(!N.host && N.nr.kind === "p2p"){
    if(g){ N.seenHost = true; clearTimeout(N.lostTimer); N.lostTimer = null; }
    else if(N.seenHost && !N.lostTimer) N.lostTimer = setTimeout(() => { if(N.nr && !G()) show("lost"); }, 4000);
  }
  const def = g && g.phase === "game" ? SB.byId[g.game] : null;
  const ph = def && g.s ? def.id + "/" + (g.s.phase || "") : "";
  if(ph && ph !== lastPhase){ lastPhase = ph; trail("Phase " + ph + (g.s.round ? " · manche " + g.s.round : "")); }
  if(def){
    if(N.host && typeof def.host === "function") runHost(ctx => def.host(ctx));
    const ctx = makeCtx();
    accent(def.id);
    if(!ctx.playing){ $("#sp-game").textContent = def.name; show("spect"); return; }
    show("game");
    const root = $("#game-root");
    if(root.dataset.gid !== g.gid){ root.dataset.gid = g.gid; root.dataset.key = ""; root.innerHTML = ""; buzz([30, 50, 30]); }
    $("#gm-title").textContent = def.name; $("#gm-gl").textContent = def.glyph || "";
    const ex = $("#gm-exit");
    const exKey = g.gid + (N.host ? "h" : "p");
    if(ex.dataset.key !== exKey){
      ex.dataset.key = exKey;
      ex.innerHTML = '<button class="link warn" type="button">' + (N.host ? tr("Arrêter", "Stop") : tr("Quitter", "Leave")) + "</button>";
      armTap(ex.firstChild, N.host ? () => runHost(c => c.end({ title: def.name, lines: [tr("Partie arrêtée par l'hôte.", "Game stopped by the host.")] })) : netLeave,
        N.host ? tr("Touche encore pour revenir au salon", "Tap again to go back to the room") : tr("Touche encore pour quitter", "Tap again to leave"));
    }
    try{ def.render(ctx, root); }catch(e){ console.error(e); }
    if(N.host) gHostTick();
    gRenderNet();
    return;
  }
  renderSalon(g);
  if(N.host) gHostTick();
  gRenderNet();
}

function optList(def){ return A(def.options); }
function optValues(def){
  const saved = (store().opts || {})[def.id] || {};
  const o = {};
  optList(def).forEach(op => { if(op.type === "button") return; o[op.id] = saved[op.id] !== undefined ? saved[op.id] : op.def; });
  return o;
}
function saveOpt(def, id, v){
  const all = store().opts || {}; all[def.id] = Object.assign({}, all[def.id] || {}, { [id]: v }); persist({ opts: all });
}
function optionsHTML(def, ctx, vals){
  return optList(def).map((op, i) => {
    if(op.type === "button") return '<button class="link" type="button" data-ob="' + i + '" style="align-self:flex-start">' + esc(op.label) + "</button>";
    const values = typeof op.values === "function" ? op.values(ctx) : A(op.values);
    let h = '<div class="field"><span class="eyebrow">' + esc(op.label) + "</span>";
    if(op.type === "seg"){
      h += '<div class="seg">' + values.map(v => '<button type="button" data-o="' + i + '" data-v="' + esc(JSON.stringify(v.v)) + '" aria-pressed="' + (JSON.stringify(v.v) === JSON.stringify(vals[op.id])) + '">' + esc(v.label) + "</button>").join("") + "</div>";
    } else if(op.type === "toggle"){
      h += '<div class="packs"><button type="button" class="pack' + (op.hot ? " hot" : "") + '" data-o="' + i + '" data-t="1" aria-pressed="' + (!!vals[op.id]) + '"><span class="box" aria-hidden="true">✓</span><span class="tx"><span class="nm">' + esc(op.text || op.label) + (op.hot ? '<span class="pill hot">18+</span>' : "") + "</span>" + (op.desc ? '<span class="ds">' + esc(op.desc) + "</span>" : "") + "</span></button></div>";
    } else if(op.type === "multi"){
      const sel = A(vals[op.id]);
      h += '<div class="packs">' + values.map(v => {
        const empty = v.count === 0;
        return '<button type="button" class="pack' + (v.hot ? " hot" : "") + '" data-o="' + i + '" data-v="' + esc(JSON.stringify(v.v)) + '" aria-pressed="' + (sel.indexOf(v.v) >= 0 && !empty) + '"' + (empty ? " disabled" : "") + '><span class="box" aria-hidden="true">✓</span><span class="tx"><span class="nm">' + esc(v.label) + (v.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(v.desc || "") + "</span></span>" + (v.count != null ? '<span class="ct">' + v.count + "</span>" : "") + "</button>";
      }).join("") + "</div>";
    }
    return h + "</div>";
  }).join("");
}
function salonDock(g, np){
  const d = $("#sa-dock"), def = g ? SB.byId[g.sel] : null;
  const key = JSON.stringify([!!g, N.host, def ? def.id : "", np.length]);
  if(d.dataset.key === key) return;
  d.dataset.key = key;
  if(!g){ d.innerHTML = '<p class="wait">' + tr("Connexion à l'hôte…", "Connecting to the host…") + '</p>'; return; }
  if(N.host){
    d.innerHTML = def ? '<button class="btn acc acc-' + esc(def.id) + '" type="button" data-open>' + tr("Lancer " + esc(def.name), "Play " + esc(def.name)) + '</button>' : '<p class="wait">' + tr("Touche un jeu pour le choisir.", "Tap a game to pick it.") + '</p>';
    const b = $("[data-open]", d); if(b) b.addEventListener("click", () => { $("#sa-panel").dataset.key = ""; openSheet(); renderSalon(G()); });
  } else {
    d.innerHTML = def ? '<div class="pick acc-' + esc(def.id) + '"><span class="gl">' + esc(def.glyph || "") + '</span><span class="tx"><span class="eyebrow">' + tr("L'hôte a choisi", "The host picked") + '</span><b>' + esc(def.name) + '</b></span><button class="link" type="button" data-rules>' + tr("Règles", "Rules") + '</button></div><p class="wait">' + tr("L'hôte règle les options et lance la partie…", "The host is setting the options and starting the game…") + '</p>'
      : '<p class="wait">' + tr("L'hôte choisit le jeu…", "The host is picking the game…") + '</p>';
    const r = $("[data-rules]", d); if(r) r.addEventListener("click", () => openRules(def));
  }
}
function renderSalon(g){
  accent("");
  show("salon");
  $("#sa-code").textContent = N.code; renderQR(); gSalonBar(g);
  const np = namedPeers();
  const hostId = N.host ? N.nr.me() : N.nr.hostId();
  $("#sa-count").textContent = tr(plural(np.length, "joueur") + " dans le salon", plural2(np.length, "joueur", "joueurs", "player") + " in the room");
  const roster = np.map((p, i) => { const nm = clean(pres(p).name, 16); return '<li' + (p.sameTab ? ' class="me"' : "") + '><span class="av" style="--c:' + AVC[i % AVC.length] + '" aria-hidden="true">' + esc(nm.slice(0, 1).toUpperCase()) + '</span><span class="nm">' + esc(nm) + (p.sameTab ? tr(" · toi", " · you") : "") + "</span>" +
    (p.peer === hostId ? '<span class="pill me">' + tr("Hôte", "Host") + '</span>' : "") + (cmpV(peerV(p) || "0", newestV(np)) < 0 ? '<span class="pill late">' + tr("À mettre à jour", "Needs update") + '</span>' : "") + "</li>"; }).join("");
  if($("#sa-roster").innerHTML !== roster) $("#sa-roster").innerHTML = roster;
  const last = $("#sa-last");
  if(g && g.last && g.last.title){
    last.hidden = false;
    const d = SB.byId[g.last.game];
    const n = np.length, canRe = N.host && d && n >= d.min && (!d.max || n <= d.max);
    const lh = '<span class="eyebrow">' + tr("Dernière partie", "Last game") + (d ? " · " + esc(d.name) : "") + "</span><b>" + esc(clean(g.last.title, 120)) + "</b>" + A(g.last.lines).slice(0, 6).map(l => '<span class="sm">' + esc(clean(l, 160)) + "</span>").join("") +
      tallyHTML(g.tally, g.played) +
      (canRe ? '<button class="btn acc acc-' + esc(d.id) + ' again" type="button" data-revanche>' + tr("Revanche · ", "Rematch · ") + esc(d.name) + "</button>" : "");
    if(last.innerHTML !== lh){
      last.innerHTML = lh;
      const rb = $("[data-revanche]", last);
      if(rb) rb.addEventListener("click", () => { const dd = SB.byId[(G() || {}).last && G().last.game]; if(dd && N.g && N.g.phase === "salon"){ buzz(20); launch(dd); } });
    }
  } else last.hidden = true;

  const sel = g ? g.sel : "";
  const tiles = $("#sa-tiles");
  const tKey = (N.host ? "h" : "p") + "|" + sel + "|" + np.length + "|" + FSEL.salon;
  const fb = $("#sa-filter");
  if(!fb.dataset.ok){ fb.dataset.ok = "1"; bindFilter(fb, "salon", () => { tiles.dataset.key = ""; renderSalon(G()); }); }
  if(tiles.dataset.key !== tKey){
    tiles.dataset.key = tKey;
    tiles.innerHTML = SB.games.filter(d => inFilter(d, FSEL.salon) || d.id === sel).map(d => {
      const n = np.length, ok = n >= d.min && (!d.max || n <= d.max);
      const range = rangeTxt(d);
      const meta = (ok ? esc(range) : '<span class="bad">' + esc(range) + "</span>") + (d.hot ? " · 18+" : "");
      return tileHTML(d, { pressed: d.id === sel, metaHTML: meta });
    }).join("");
    $$(".tile", tiles).forEach(b => b.addEventListener("click", () => {
      if(!N.host){ openRules(SB.byId[b.dataset.id]); return; }
      buzz(8);
      if(N.g && N.g.phase === "salon"){ $("#sa-panel").dataset.key = ""; hostSetG({ sel: b.dataset.id }); renderSalon(G()); openSheet(); }
    }));
  }
  $("#sa-pick").textContent = N.host ? tr("Choisis un jeu", "Pick a game") : tr("Les jeux", "Games");
  salonDock(g, np);
  if(!N.host){ closeSheet(); return; }

  const panel = $("#sa-panel");
  const def = SB.byId[sel];
  if(!def){ closeSheet(); return; }
  const ctx = makeCtx();
  const vals = optValues(def);
  const dyn = optList(def).map(op => (typeof op.values === "function" ? op.values(ctx) : null));
  const late = lateNames(np);
  const n = np.length, ok = n >= def.min && (!def.max || n <= def.max) && !late.length;
  const key = JSON.stringify([def.id, vals, dyn, n, late]);
  if(panel.dataset.key === key) return;
  panel.dataset.key = key;
  $("#sheet").className = "sheet" + (sheetOpen ? " on" : "") + " acc-" + def.id;
  let h = '<div class="sheet-head"><span class="gl">' + esc(def.glyph || "") + '</span><div><h2>' + esc(def.name) + '</h2><span class="sm">' + esc(rangeLong(def)) + "</span></div></div>" +
    '<p class="lead">' + esc(def.tag || "") + "</p>" + rulesHTML(def) + optionsHTML(def, ctx, vals);
  h += dock('<p class="err" id="sa-err"' + (ok ? " hidden" : "") + ">" + (ok ? "" : late.length ? tr(esc(late.join(", ")) + (late.length > 1 ? " doivent" : " doit") + " mettre à jour Soirée Box avant de jouer.", esc(late.join(", ")) + (late.length > 1 ? " need" : " needs") + " to update Soirée Box before playing.") : (n < def.min ? tr("Il faut au moins " + def.min + " joueurs dans le salon (" + n + " pour l'instant).", "You need at least " + def.min + " players in the room (" + n + " so far).") : tr("Ce jeu se joue à " + def.max + " joueurs maximum.", "This game is for " + def.max + " players max."))) + "</p>" +
    '<button class="btn acc" id="sa-go" type="button"' + (ok ? "" : " disabled") + ">" + tr("Lancer la partie", "Start the game") + "</button>");
  const st = panel.scrollTop;
  panel.innerHTML = h;
  panel.scrollTop = st;
  $$("[data-o]", panel).forEach(b => b.addEventListener("click", () => {
    const op = optList(def)[+b.dataset.o];
    buzz(6);
    if(op.type === "toggle") saveOpt(def, op.id, !optValues(def)[op.id]);
    else if(op.type === "seg") saveOpt(def, op.id, JSON.parse(b.dataset.v));
    else if(op.type === "multi"){ const v = JSON.parse(b.dataset.v); const cur = A(optValues(def)[op.id]).slice(); const i = cur.indexOf(v); if(i >= 0) cur.splice(i, 1); else cur.push(v); saveOpt(def, op.id, cur); }
    panel.dataset.key = ""; renderSalon(G());
  }));
  $$("[data-ob]", panel).forEach(b => b.addEventListener("click", () => { const op = optList(def)[+b.dataset.ob]; if(op.onClick) op.onClick(); }));
  const go = $("#sa-go"); if(go) go.addEventListener("click", () => launch(def));
}
function launch(def){
  if(!N.host || !N.g) return;
  if(lateNames(namedPeers()).length || cmpV(newestV(namedPeers()), VERSION) > 0){ toast(tr("Tout le monde doit avoir la dernière version de Soirée Box.", "Everyone needs the latest version of Soirée Box.")); return; }
  trail("Lancement : " + def.id);
  const np = namedPeers();
  if(np.length < def.min || (def.max && np.length > def.max)) return;
  const opts = optValues(def);
  const prev = N.g;
  N.g = Object.assign({}, N.g, { phase: "game", game: def.id, gid: rid(), players: np.map(p => [p.peer, clean(pres(p).name, 16)]), opts: plain(opts), s: { k: rid() }, last: null });
  let s0;
  try{ s0 = def.start(makeCtx(), opts) || {}; }
  catch(e){ N.g = prev; const err = $("#sa-err"); if(err){ err.textContent = e.message || tr("Impossible de lancer ce jeu.", "Can't start this game."); err.hidden = false; } return; }
  N.g.s = plain(Object.assign({ k: rid() }, s0));
  closeSheet(); buzz(30);
  hostSetG({});
}

/* =================== Un seul téléphone =================== */
const L = { def: null, tick: null };
function openLocalList(){
  accent(""); keepAwake(false); L.def = null; L.tick = null;
  const gs0 = $("#gage-sheet"); if(gs0) gs0.remove();
  const t = $("#ll-tiles");
  t.innerHTML = SB.games.filter(d => d.local).sort((a, b) => isWip(a) - isWip(b)).map(d => {
    const lp = d.local.players;
    const meta = (lp ? (lp.min === 1 ? tr("Seul ou jusqu'à " + lp.max + " · robots", "Solo or up to " + lp.max + " · bots") : rangeTxt(lp)) : tr("Tout le groupe", "Whole group")) + (d.hot ? " · 18+" : "");
    return tileHTML(d, { metaHTML: meta });
  }).join("");
  $$(".tile", t).forEach(b => b.addEventListener("click", () => { const d = SB.byId[b.dataset.id]; if(d.local.players) openLocalPlayers(d); else startLocal(d, []); }));
  const lt = $("#ll-tally"), th = tallyHTML(LT.tally, LT.played);
  if(lt){ lt.hidden = !th; lt.innerHTML = th; }
  gLocalBar();
  show("llist");
}
let LP = { def: null, names: [] };
const LT = { tally: [], played: 0 };
function openLocalPlayers(def){
  const lp = def.local.players;
  LP.def = def;
  const saved = A(store().localNames).filter(x => typeof x === "string");
  LP.names = saved.length ? saved.slice(0, lp.max || 20) : ["", "", "", ""];
  while(LP.names.length < lp.min) LP.names.push("");
  accent(def.id);
  $("#lp-title").textContent = def.name;
  $("#lp-range").textContent = lp.max ? tr("Joueurs (" + lp.min + " à " + lp.max + ")", "Players (" + lp.min + " to " + lp.max + ")") : tr("Joueurs (" + lp.min + " minimum)", "Players (" + lp.min + " minimum)");
  $("#lp-err").hidden = true;
  renderLocalPlayers();
  show("lplayers");
}
function renderLocalPlayers(){
  const lp = LP.def.local.players, box = $("#lp-list");
  box.innerHTML = "";
  LP.names.forEach((nm, i) => {
    const row = document.createElement("div"); row.className = "prow";
    const inp = document.createElement("input"); inp.className = "txt"; inp.id = "lp-" + i; inp.value = nm; inp.maxLength = 16; inp.placeholder = tr("Joueur ", "Player ") + (i + 1); inp.autocomplete = "off";
    inp.setAttribute("aria-label", tr("Nom du joueur ", "Player name ") + (i + 1));
    inp.addEventListener("input", () => { LP.names[i] = inp.value; persist({ localNames: LP.names }); });
    const x = document.createElement("button"); x.type = "button"; x.className = "x"; x.textContent = "×"; x.setAttribute("aria-label", tr("Retirer ce joueur", "Remove this player"));
    x.disabled = LP.names.length <= lp.min; if(x.disabled) x.style.opacity = .35;
    x.addEventListener("click", () => { LP.names.splice(i, 1); persist({ localNames: LP.names }); renderLocalPlayers(); });
    row.append(inp, x); box.append(row);
  });
  $("#lp-add").hidden = !!lp.max && LP.names.length >= lp.max;
}
function startLocal(def, names){
  L.def = def; L.tick = null;
  trail("Un seul téléphone : " + def.id + " · " + plural(A(names).length, "joueur"));
  accent(def.id); keepAwake(true);
  $("#lc-title").textContent = def.name; $("#lc-gl").textContent = def.glyph || "";
  const ex = $("#lc-exit");
  ex.innerHTML = '<button class="link warn" type="button">' + tr("Quitter", "Quit") + '</button>';
  armTap(ex.firstChild, () => api.exit(), tr("Touche encore pour quitter", "Tap again to quit"));
  const root = $("#local-root"); root.innerHTML = ""; root.dataset.key = "";
  show("local");
  let won = false;
  const api = { names: names.slice(), u: SB.u, exit: openLocalList, onTick(fn){ L.tick = fn; }, again(){ startLocal(def, names); },
    // Le jeu signale les gagnants de la partie (noms) : ça alimente le classement de la soirée.
    win(list){ if(won) return; won = true; LT.tally = addTally(LT.tally, list); LT.played++;
      const w = A(list); if(def.gagesEnd !== false) gLocalApply(def.id, names, w.map(n => ({ id: n, ev: "_win" })).concat(names.filter(n => w.indexOf(n) < 0).map(n => ({ id: n, ev: "_lose" }))), "end" + rid()); },
    // Gages d'une manche : [{ id: prénom, ev }], clé unique par manche.
    gage(list, key){ gLocalApply(def.id, names, list, key); } };
  try{ def.local.start(root, api); }catch(e){ console.error(e); }
}

/* =================== Gages (alcool ou sans alcool, entièrement réglables) ===================
   - L'hôte règle les gages du salon (unité, intensité, plafond, rappel d'eau, joker, déclencheurs par jeu, gages perso).
   - Chaque téléphone a son profil : « je bois » ou « sans alcool », et son propre plafond.
   - Les jeux déclarent leurs déclencheurs (def.gages = [{ ev, label, kind: "boit"|"distribue"|"tous", n }]) et appellent
     ctx.gage([{ id, ev }], clé) en réseau (chez l'hôte) ou api.gage([{ id: nom, ev }], clé) sur un seul téléphone.
   - Fin de partie : tous les jeux, le gagnant distribue et les autres boivent (réglable).
   - Un panneau « Gages de la manche » s'affiche alors sur chaque téléphone. */
const GDEF = { on: false, unit: "gorgee", level: "classique", cap: 15, water: 8, joker: true, trig: {}, custom: [] };
const GMULT = { chill: .5, classique: 1, chaud: 2, perso: 1 };
const GEND = [
  { ev: "_win", label: tr("Gagnant de la partie", "Game winner"), kind: "distribue", n: 3 },
  { ev: "_lose", label: tr("Tous les autres joueurs", "Everyone else"), kind: "boit", n: 1 }
];
const GTASKS = { fr: ["Fais 10 squats", "Chante le refrain de ton choix", "Fais un compliment sincère à chaque joueur", "Parle avec un accent pendant 2 minutes", "Imite quelqu'un du groupe, les autres devinent", "Danse 20 secondes sans musique", "Raconte ta pire honte en 30 secondes", "Fais 10 pompes (ou 20 sur les genoux)", "Montre la dernière photo de ta galerie", "Laisse le groupe choisir ta photo de profil pour 1 h", "Fais la planche 30 secondes", "Envoie « tu me manques » au 3e contact de ta liste", "Mange une cuillère de moutarde ou de sauce piquante", "Parle à la 3e personne jusqu'à la prochaine manche"],
  en: ["Do 10 squats", "Sing the chorus of your choice", "Give every player a sincere compliment", "Talk with an accent for 2 minutes", "Impersonate someone in the group, the others guess", "Dance for 20 seconds with no music", "Tell your most embarrassing moment in 30 seconds", "Do 10 push-ups (or 20 on your knees)", "Show the last photo in your camera roll", "Let the group pick your profile picture for 1 hour", "Hold a plank for 30 seconds", "Text “I miss you” to the 3rd contact in your list", "Eat a spoonful of mustard or hot sauce", "Talk about yourself in the third person until next round"] };
/* Profils de boisson : un « verre » de chaque boisson, combien de gorgées il fait, et la limite proposée par défaut (en verres).
   Chaque verre listé correspond à peu près à un verre standard (10 g d'alcool), le cocktail à environ deux. */
const DRINKS = {
  biere: { name: tr("Bière ou cidre", "Beer or cider"), glass: tr("un demi (25 cl)", "a half pint (25 cl)"), glasses: [tr("demi", "half pint"), tr("demis", "half pints")], sips: 8, std: 1, def: 3 },
  vin: { name: tr("Vin ou champagne", "Wine or champagne"), glass: tr("un verre de vin (12 cl)", "a glass of wine (12 cl)"), glasses: [tr("verre de vin", "glass of wine"), tr("verres de vin", "glasses of wine")], sips: 5, std: 1, def: 3 },
  cocktail: { name: tr("Cocktail ou long drink", "Cocktail or mixed drink"), glass: tr("un cocktail", "a cocktail"), glasses: ["cocktail", "cocktails"], sips: 6, std: 2, def: 2 },
  fort: { name: tr("Alcool fort, en shots", "Spirits, as shots"), glass: tr("un shot (3 cl)", "a shot (3 cl)"), glasses: ["shot", "shots"], sips: 1, std: 1, def: 4 }
};
const gProf = gp => { gp = Object.assign({ alc: true, drink: "", lim: {} }, gp || {}); if(gp.alc === false) gp.drink = "sans"; if(!gp.drink) gp.drink = "biere"; gp.lim = Object.assign({}, gp.lim || {}); return gp; };
const gLim = gp => (gp.drink === "sans" ? 0 : gp.lim[gp.drink] != null ? +gp.lim[gp.drink] : DRINKS[gp.drink].def);
// Combien de « verres » de sa boisson représente 1 gage dans l'unité de l'hôte.
function gGlass(S, drink){
  const d = DRINKS[drink] || DRINKS.biere;
  if(S.unit === "culsec") return 1;
  if(S.unit === "shot") return drink === "fort" ? 1 : Math.min(1, 3 / d.sips);
  return 1 / d.sips;
}
const gVerres = (n, drink) => { const d = DRINKS[drink] || DRINKS.biere, v = Math.round(n * 10) / 10; return String(v).replace(".", tr(",", ".")) + " " + (v > 1 ? d.glasses[1] : d.glasses[0]); };
const gSettings = s => Object.assign({}, GDEF, s && typeof s === "object" ? s : {}, { trig: Object.assign({}, (s && s.trig) || {}), custom: A(s && s.custom).map(x => clean(x, 120)).filter(Boolean).slice(0, 40) });
const gUnit = (S, n) => { const u = { gorgee: [tr("gorgée", "sip"), tr("gorgées", "sips")], shot: ["shot", "shots"], culsec: [tr("cul-sec", "chug"), tr("culs-secs", "chugs")] }[S.unit] || ["", ""]; return n + " " + (n === 1 ? u[0] : u[1]); };
function gEvents(gameId){ const d = SB.byId[gameId]; return A(d && d.gages).concat(GEND); }
function gBase(S, gameId, ev){ const k = gameId + ":" + ev; if(S.trig[k] != null) return Math.max(0, Math.min(10, +S.trig[k] || 0)); const e = gEvents(gameId).find(x => x.ev === ev); return e ? e.n : 0; }
function gAmount(S, gameId, ev){ const b = gBase(S, gameId, ev); return b > 0 ? Math.max(1, Math.round(b * (GMULT[S.level] || 1))) : 0; }
function gTask(S){ const pool = A(S.custom).length ? A(S.custom) : GTASKS[LANG === "en" ? "en" : "fr"]; return pool[Math.floor(Math.random() * pool.length)] || "…"; }
const gT = (t, name) => { t = Object.assign({}, t || {}); t[name] = Object.assign({ s: 0, g: 0, t: 0, w: 0, v: 0 }, t[name] || {}); return t; };
// Calcule les gages d'une liste d'événements. players : [{ id, name, alc, cap }] ; tally : { nom: { s, g, t, w } }.
function gCompute(S, gameId, list, players, tally){
  const items = []; let T = Object.assign({}, tally || {});
  const P = id => players.find(p => p.id === id);
  const drink = (p, n, why) => {
    if(!p || n <= 0) return;
    T = gT(T, p.name); const cur = T[p.name].s, g1 = gGlass(S, p.drink), v = +T[p.name].v || 0;
    const byLim = p.lim > 0 ? Math.floor((p.lim - v) / g1 + 1e-9) : Infinity;
    const nn = !p.alc ? 0 : Math.min(n, S.cap - cur, byLim);
    if(nn <= 0){ T[p.name].t++; items.push({ t: "task", who: p.id, name: p.name, txt: gTask(S), why }); return; }
    T[p.name].s = cur + nn; T[p.name].v = Math.round((v + nn * g1) * 100) / 100;
    items.push({ t: "drink", who: p.id, name: p.name, n: nn, why });
    if(S.water > 0 && Math.floor(cur / S.water) < Math.floor((cur + nn) / S.water)) items.push({ t: "water", who: p.id, name: p.name });
  };
  A(list).forEach(e => {
    const ed = gEvents(gameId).find(x => x.ev === e.ev); if(!ed) return;
    const times = e.x != null ? Math.max(0, Math.floor(+e.x || 0)) : 1;
    const n = (e.n != null ? Math.max(0, Math.round(+e.n * (GMULT[S.level] || 1))) : gAmount(S, gameId, e.ev)) * times; if(!n) return;
    const why = e.why || ed.label;
    if(ed.kind === "tous") players.forEach(p => drink(p, n, why));
    else if(ed.kind === "distribue"){ const p = P(e.id); if(p && players.length > 1) items.push({ t: "give", who: p.id, name: p.name, n, why, done: 0 }); }
    else drink(P(e.id), n, why);
  });
  return { items, tally: T };
}
// Distribution faite par un joueur : chaque destinataire boit (ou fait un gage s'il ne boit pas).
function gGive(S, gameId, q, giverId, to, players, tally){
  const it = A(q.items).find(x => x.t === "give" && x.who === giverId && !x.done); if(!it) return null;
  let sum = 0; const list = [];
  Object.keys(to || {}).forEach(id => { const k = Math.max(0, Math.floor(+to[id] || 0)); if(k && id !== giverId && players.some(p => p.id === id)){ sum += k; list.push([id, k]); } });
  if(sum !== it.n) return null;
  const r = gCompute(Object.assign({}, S, { level: "perso" }), gameId, [], players, tally); let T = r.tally;
  const items = A(q.items).map(x => (x === it ? Object.assign({}, x, { done: 1 }) : x));
  list.forEach(([id, k]) => { const c = gCompute(Object.assign({}, S, { level: "perso", trig: Object.assign({}, S.trig, { [gameId + ":_give"]: k }) }), gameId, [{ id, ev: "_give", n: k, why: tr("de la part de ", "from ") + it.name }], players, T); T = c.tally; c.items.forEach(x => items.push(x)); });
  T = gT(T, it.name); T[it.name].g += it.n;
  return { items, tally: T };
}
GEND.push({ ev: "_give", label: "", kind: "boit", n: 1, hidden: true });

/* ---------- Panneau « Gages de la manche » (commun réseau / un seul téléphone) ---------- */
const GSEEN = {}, GDIST = {};
function gageSheet(q, opts){
  let el = $("#gage-sheet");
  if(!q || !A(q.items).length || GSEEN[q.id]){ if(el) el.remove(); return; }
  const S = opts.S, me = opts.me, items = A(q.items);
  const myGive = items.find(x => x.t === "give" && !x.done && (me == null || x.who === me));
  const dist = myGive ? (GDIST[q.id + myGive.who] = GDIST[q.id + myGive.who] || {}) : null;
  const used = dist ? Object.keys(dist).reduce((a, k) => a + dist[k], 0) : 0;
  const key = JSON.stringify([q.id, items, dist, me, opts.jokerOk && opts.jokerOk(q)]);
  if(!el){ el = document.createElement("div"); el.id = "gage-sheet"; el.className = "gsheet"; document.body.append(el); }
  if(el.dataset.key === key) return;
  el.dataset.key = key;
  const line = x => {
    const mine = me != null && x.who === me;
    let t = "", sub = esc(x.why || "");
    if(x.t === "drink") t = tr(esc(x.name) + " boit " + gUnit(S, x.n), esc(x.name) + " drinks " + gUnit(S, x.n));
    else if(x.t === "task"){ t = esc(x.name) + " : " + esc(x.txt); sub = tr("Gage sans alcool", "No-alcohol forfeit") + (x.why ? " · " + esc(x.why) : ""); }
    else if(x.t === "give") t = x.done ? tr(esc(x.name) + " a distribué " + gUnit(S, x.n), esc(x.name) + " handed out " + gUnit(S, x.n)) : tr(esc(x.name) + " distribue " + gUnit(S, x.n), esc(x.name) + " hands out " + gUnit(S, x.n));
    else if(x.t === "water"){ t = tr(esc(x.name) + " : petit verre d'eau ?", esc(x.name) + ": time for a glass of water?"); sub = tr("Rappel", "Reminder"); }
    else if(x.t === "joker"){ t = tr(esc(x.name) + " utilise son joker : un verre d'eau", esc(x.name) + " uses their joker: a glass of water"); sub = ""; }
    return '<li class="g-' + x.t + (mine ? " gme" : "") + '"><span class="av">' + esc(String(x.name || "?").slice(0, 1).toUpperCase()) + '</span><span class="tx"><b>' + t + "</b>" + (sub ? '<span class="sm">' + sub + "</span>" : "") + "</span>" +
      (x.t === "drink" ? '<span class="n">' + x.n + "</span>" : "") + "</li>";
  };
  let h = '<div class="gsheet-card" role="dialog" aria-label="' + tr("Gages de la manche", "Round forfeits") + '"><div class="gsheet-h"><b>' + tr("Gages de la manche", "Round forfeits") + "</b><span class=\"sm\">" + esc({ chill: "Chill", classique: tr("Classique", "Classic"), chaud: tr("Apéro chaud", "Wild night"), perso: tr("Perso", "Custom") }[S.level] || "") + "</span></div>" +
    '<ul class="gsheet-l">' + items.map(line).join("") + "</ul>";
  if(myGive){
    const others = A(opts.players).filter(p => p.id !== myGive.who);
    h += '<div class="gsheet-give"><b>' + (me == null ? tr(esc(myGive.name) + " distribue " + gUnit(S, myGive.n), esc(myGive.name) + " hands out " + gUnit(S, myGive.n)) : tr("Tu distribues " + gUnit(S, myGive.n), "You hand out " + gUnit(S, myGive.n))) + '</b><span class="sm">' +
      (used < myGive.n ? tr("Touche les prénoms, une par appui. Il en reste " + (myGive.n - used) + ".", "Tap names, one per tap. " + (myGive.n - used) + " left.") : tr("Tout est distribué.", "All handed out.")) + '</span><div class="gsheet-pp">' +
      others.map(p => '<button type="button" data-gp="' + esc(p.id) + '"' + (dist[p.id] ? ' class="on"' : "") + "><span>" + esc(p.name) + "</span><b>" + (dist[p.id] ? "+" + dist[p.id] : "") + "</b></button>").join("") + "</div>" +
      '<button class="link" type="button" data-greset>' + tr("Recommencer", "Start over") + "</button></div>";
  }
  const canJoker = opts.jokerOk && opts.jokerOk(q);
  h += (canJoker ? '<button class="btn ghost" type="button" data-gjoker>' + tr("Joker eau : un verre d'eau à la place", "Water joker: a glass of water instead") + "</button>" : "") +
    (myGive ? '<button class="btn acc" type="button" data-gok' + (used === myGive.n ? "" : " disabled") + ">" + tr("Valider la distribution", "Confirm") + "</button>" : '<button class="btn acc" type="button" data-gclose>OK</button>') + "</div>";
  el.innerHTML = h;
  $$("[data-gp]", el).forEach(b => b.addEventListener("click", () => { if(used >= myGive.n) return; buzz(8); dist[b.dataset.gp] = (dist[b.dataset.gp] || 0) + 1; el.dataset.key = ""; gageSheet(q, opts); }));
  const rs = $("[data-greset]", el); if(rs) rs.addEventListener("click", () => { Object.keys(dist).forEach(k => delete dist[k]); el.dataset.key = ""; gageSheet(q, opts); });
  const ok = $("[data-gok]", el); if(ok) ok.addEventListener("click", () => { buzz(15); opts.onGive(myGive, Object.assign({}, dist)); });
  const cl = $("[data-gclose]", el); if(cl) cl.addEventListener("click", () => { GSEEN[q.id] = 1; el.remove(); });
  const jk = $("[data-gjoker]", el); if(jk) jk.addEventListener("click", () => { buzz(15); opts.onJoker(q); });
}

/* ---------- Réseau : l'hôte applique, chacun affiche ---------- */
const CORE_X = {};
function gPlayers(){
  const g = G() || {}, list = A(g.players).map(A);
  const ids = list.length ? list.map(r => String(r[0])) : namedPeers().map(p => p.peer);
  return ids.map(id => { const p = peerById(id), x = pres(p).x || {}, gp = x._gp || {}, r = list.find(r => String(r[0]) === id); const pf = gProf(gp); return { id, name: clean((r && r[1]) || pres(p).name, 16) || "Joueur", alc: pf.drink !== "sans", drink: pf.drink, lim: gLim(pf) }; });
}
function gHostApply(gameId, list, key){
  if(!N.host || !N.g) return;
  const S = gSettings(N.g.gages); if(!S.on) return;
  if(key && N.g.gqk === key) return;
  const r = gCompute(S, gameId, list, gPlayers(), N.g.gt);
  if(!r.items.length){ hostSetG({ gqk: key || "", gt: r.tally }); return; }
  hostSetG({ gq: { id: rid(), game: gameId, items: r.items }, gqk: key || "", gt: r.tally });
}
// Chez l'hôte, à chaque rendu : distributions et jokers envoyés par les joueurs.
function gHostTick(){
  if(!N.host || !N.g || !N.g.gq) return;
  const S = gSettings(N.g.gages), q = N.g.gq;
  namedPeers().forEach(p => {
    const x = pres(p).x || {}, id = p.peer;
    if(x._gd && x._gd.q === q.id){
      const r = gGive(S, q.game, N.g.gq, id, x._gd.to, gPlayers(), N.g.gt);
      if(r) hostSetG({ gq: Object.assign({}, N.g.gq, { items: r.items }), gt: r.tally });
    }
    if(x._gj && x._gj === q.id){
      const it = A(N.g.gq.items).find(y => y.t === "drink" && y.who === id), used = (N.g.gjk || {})[id] === (N.g.gid || "");
      if(it && !used){
        let T = gT(N.g.gt, it.name); T[it.name].s = Math.max(0, T[it.name].s - it.n); T[it.name].w++;
        const pp = gPlayers().find(x => x.id === id); if(pp) T[it.name].v = Math.max(0, Math.round((T[it.name].v - it.n * gGlass(S, pp.drink)) * 100) / 100);
        hostSetG({ gq: Object.assign({}, N.g.gq, { items: A(N.g.gq.items).map(y => (y === it ? { t: "joker", who: id, name: it.name } : y)) }), gt: T, gjk: Object.assign({}, N.g.gjk || {}, { [id]: N.g.gid || "" }) });
      }
    }
  });
}
function gRenderNet(){
  const g = G(); if(!g || !g.gq){ gageSheet(null); return; }
  const S = gSettings(g.gages), me = N.nr.me();
  gageSheet(g.gq, { S, me, players: gPlayers(),
    jokerOk: q => S.joker && A(q.items).some(y => y.t === "drink" && y.who === me) && (g.gjk || {})[me] !== (g.gid || ""),
    onGive: (it, to) => { CORE_X._gd = { q: g.gq.id, to }; SB.refreshExtras(); },
    onJoker: q => { CORE_X._gj = q.id; SB.refreshExtras(); } });
}

/* ---------- Un seul téléphone ---------- */
const LGG = { tally: {}, q: null, jk: {} };
// Un seul jeu de réglages par téléphone : utilisé quand on crée un salon et sur un seul téléphone.
// Sur un seul téléphone : ce que boit chaque joueur (prénom → boisson). Ancienne liste « sans alcool » reprise.
function gLocalDrink(n){ const st = store(), m = st.gagesDrinks || {}; if(m[n]) return m[n]; return A(st.gagesSober).indexOf(n) >= 0 ? "sans" : "biere"; }
function gLocalSettings(){ const st = store(); return gSettings(st.gages || st.gagesLocal); }
function gSaveSettings(s){ persist({ gages: s }); }
function gLocalApply(gameId, names, list, key, rerender){
  const S = gLocalSettings(); if(!S.on) return;
  if(key && LGG.key === key) return; LGG.key = key || "";
  const players = names.map(n => { const d = gLocalDrink(n); return { id: n, name: n, alc: d !== "sans", drink: d, lim: d === "sans" ? 0 : DRINKS[d].def }; });
  const r = gCompute(S, gameId, list, players, LGG.tally); LGG.tally = r.tally;
  if(!r.items.length) return;
  const q = { id: rid(), game: gameId, items: r.items };
  const show2 = () => gageSheet(q, { S, me: null, players,
    jokerOk: () => false,
    onGive: (it, to) => { const g2 = gGive(S, gameId, q, it.who, to, players, LGG.tally); if(g2){ LGG.tally = g2.tally; q.items = g2.items; $("#gage-sheet").dataset.key = ""; show2(); } } });
  show2();
}

/* ---------- Réglages (hôte ou un seul téléphone) et profil ---------- */
const gRefresh = () => { try{ renderHomeProfile(); if(!$("#s-llist").hidden) gLocalBar(); }catch(e){} };
function gSettingsPage(get, set, editable, tally, onReset){
  SB.page(tr("Gages", "Forfeits"), root => {
    let game = (SB.games.find(d => A(d.gages).length) || {}).id || "_fin";
    const draw = () => {
      const S = get(), mult = GMULT[S.level] || 1, dis = editable ? "" : " disabled";
      const seg = (k, opts) => '<div class="seg">' + opts.map(o => '<button type="button" data-gs="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (S[k] === o[0]) + '"' + dis + ">" + o[1] + "</button>").join("") + "</div>";
      const step = (k, label, sub, min, max) => '<div class="gs-row"><span class="tx"><b>' + label + '</b><span class="sm">' + sub + '</span></span><button type="button" class="gs-b" data-gst="' + k + '" data-d="-1" aria-label="' + tr("Moins", "Less") + '"' + dis + '>−</button><b class="gs-n">' + S[k] + '</b><button type="button" class="gs-b" data-gst="' + k + '" data-d="1" aria-label="' + tr("Plus", "More") + '"' + dis + ">+</button></div>";
      const games = SB.games.filter(d => A(d.gages).length).map(d => [d.id, d.name]).concat([["_fin", tr("Fin de partie (tous les jeux)", "End of game (all games)")]]);
      const evs = (game === "_fin" ? GEND : A((SB.byId[game] || {}).gages)).filter(e => !e.hidden);
      const kindTxt = k => (k === "distribue" ? tr("distribue", "hands out") : k === "tous" ? tr("tout le monde boit", "everyone drinks") : tr("boit", "drinks"));
      const gid = game === "_fin" ? (SB.games[0] || {}).id : game;
      let h = '<div class="gs">' +
        '<button type="button" class="pack" data-gon aria-pressed="' + S.on + '"' + dis + '><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Gages activés", "Forfeits on") + '</span><span class="ds">' + tr("Les jeux affichent les gages à la fin des manches. Chacun peut jouer sans alcool.", "Games show forfeits at the end of rounds. Anyone can play without alcohol.") + "</span></span></button>" +
        (editable ? '<p class="sm" style="margin:0">' + tr("Gardés sur ce téléphone : ils servent automatiquement à chaque salon que tu crées et sur un seul téléphone.", "Saved on this phone: used automatically for every room you create and on one phone.") + "</p>" : '<p class="note-box">' + tr("Seul l'hôte modifie ces réglages.", "Only the host can change these settings.") + "</p>") +
        '<div class="field"><span class="eyebrow">' + tr("L'unité des gages", "Forfeit unit") + "</span>" + seg("unit", [["gorgee", tr("Gorgées", "Sips")], ["shot", "Shots"], ["culsec", tr("Culs-secs", "Chugs")]]) +
          '<p class="sm" style="margin:0">' + ({ gorgee: tr("« Bob boit 2 » = deux gorgées de sa boisson. Le plus doux.", "“Bob drinks 2” = two sips of their drink. The gentlest."), shot: tr("« Bob boit 2 » = deux shots : un vrai shot pour ceux qui boivent de l'alcool fort, sinon 3 gorgées de leur boisson par shot.", "“Bob drinks 2” = two shots: a real shot for spirit drinkers, otherwise 3 sips of their drink per shot."), culsec: tr("« Bob boit 2 » = finir son verre deux fois. Très fort : à garder pour les petites quantités.", "“Bob drinks 2” = finish their drink twice. Very strong: keep amounts small.") }[S.unit] || "") + "</p></div>" +
        '<div class="field"><span class="eyebrow">' + tr("Intensité", "Intensity") + "</span>" + seg("level", [["chill", "Chill ×½"], ["classique", tr("Classique", "Classic")], ["chaud", tr("Chaud ×2", "Wild ×2")], ["perso", "Perso"]]) +
          '<p class="sm" style="margin:0">' + ({ chill: tr("Tous les nombres ci-dessous sont divisés par 2 (arrondis, au moins 1).", "All numbers below are halved (rounded, at least 1)."), classique: tr("Les nombres ci-dessous tels quels.", "The numbers below as they are."), chaud: tr("Tous les nombres ci-dessous sont doublés.", "All numbers below are doubled."), perso: tr("Les nombres ci-dessous tels quels : règle-les un par un.", "The numbers below as they are: set them one by one.") }[S.level] || "") + "</p></div>" +
        '<div class="field"><span class="eyebrow">' + tr("Garde-fous", "Safety") + '</span><div class="gs-box">' +
        step("cap", tr("Plafond par joueur", "Cap per player"), tr("Nombre maximum de gages à boire par joueur pour la soirée (" + gUnit(S, 2).replace(/^2 /, "") + "). Chacun a aussi sa limite dans son profil : la plus basse compte.", "Max forfeits a player drinks tonight (" + gUnit(S, 2).replace(/^2 /, "") + "). Everyone also has a limit in their profile: the lowest wins."), 1, 60) +
        step("water", tr("Rappel verre d'eau", "Water reminder"), S.water ? tr("Toutes les " + S.water + " " + gUnit(S, 2).replace(/^2 /, "") + " bues, le jeu propose un verre d'eau.", "Every " + S.water + " " + gUnit(S, 2).replace(/^2 /, "") + " drunk, the game suggests a glass of water.") : tr("Jamais", "Never"), 0, 30) +
        '<div class="gs-row"><span class="tx"><b>' + tr("Joker eau", "Water joker") + '</b><span class="sm">' + tr("Une fois par partie, un verre d'eau à la place d'un gage", "Once per game, a glass of water instead of a forfeit") + '</span></span><button type="button" class="gs-sw" data-gjk aria-pressed="' + S.joker + '" aria-label="' + tr("Joker eau", "Water joker") + '"' + dis + "><i></i></button></div></div></div>" +
        '<div class="field"><span class="eyebrow">' + tr("Déclencheurs, jeu par jeu", "Triggers, game by game") + '</span><p class="sm" style="margin:0">' + tr("Ce qui donne un gage dans chaque jeu, et combien. « boit » : le joueur boit. « distribue » : il choisit qui boit, en touchant les prénoms. 0 = désactivé.", "What gives a forfeit in each game, and how much. “drinks”: the player drinks. “hands out”: they pick who drinks by tapping names. 0 = off.") + '</p><div class="filters">' + games.map(x => '<button type="button" data-gg="' + x[0] + '" aria-pressed="' + (x[0] === game) + '">' + esc(x[1]) + "</button>").join("") + '</div><div class="gs-box">' +
        evs.map(e => { const b = gBase(S, gid, e.ev), k = (game === "_fin" ? gid : game) + ":" + e.ev; return '<div class="gs-row"><span class="tx"><b>' + esc(e.label) + '</b><span class="sm gk-' + e.kind + '">' + kindTxt(e.kind) + (b && mult !== 1 ? " · " + gUnit(S, Math.max(1, Math.round(b * mult))) : "") + '</span></span><button type="button" class="gs-b" data-gtr="' + esc(e.ev) + '" data-d="-1" aria-label="' + tr("Moins", "Less") + '"' + dis + '>−</button><b class="gs-n">' + b + '</b><button type="button" class="gs-b" data-gtr="' + esc(e.ev) + '" data-d="1" aria-label="' + tr("Plus", "More") + '"' + dis + ">+</button></div>"; }).join("") +
        "</div></div>" +
        '<div class="field"><span class="eyebrow">' + tr("Gages sans alcool", "No-alcohol forfeits") + '</span><p class="sm" style="margin:0">' + tr("Pour ceux qui ne boivent pas ou qui ont atteint leur plafond. Vide = la liste du jeu.", "For players who don't drink or hit their cap. Empty = the built-in list.") + '</p><div class="gs-box">' +
        A(S.custom).map((t, i) => '<div class="gs-row"><span class="tx"><b>' + esc(t) + '</b></span>' + (editable ? '<button type="button" class="gs-b" data-gdel="' + i + '" aria-label="' + tr("Retirer", "Remove") + '">×</button>' : "") + "</div>").join("") +
        (editable ? '<div class="gs-row"><input class="txt" id="gs-new" maxlength="120" placeholder="' + tr("Ex. : fais 10 pompes", "E.g. do 10 push-ups") + '"><button type="button" class="gs-b" data-gadd aria-label="' + tr("Ajouter", "Add") + '">+</button></div>' : "") + "</div></div>";
      const tk = Object.keys(tally() || {});
      if(tk.length){
        const T = tally();
        h += '<div class="field"><span class="eyebrow">' + tr("Compteur de la soirée", "Tonight's counter") + '</span><div class="gs-box">' +
          tk.sort((a, b) => T[b].s - T[a].s).map(n => '<div class="gs-row"><span class="tx"><b>' + esc(n) + '</b><span class="sm">' + tr(gUnit(S, T[n].s) + " bues (≈ " + String(Math.round((+T[n].v || 0) * 10) / 10).replace(".", ",") + " verre" + ((+T[n].v || 0) > 1 ? "s" : "") + ") · " + T[n].g + " distribuées · " + T[n].t + " gages sans alcool · " + T[n].w + " verres d'eau", gUnit(S, T[n].s) + " drunk (≈ " + (Math.round((+T[n].v || 0) * 10) / 10) + " drinks) · " + T[n].g + " handed out · " + T[n].t + " no-alcohol forfeits · " + T[n].w + " water") + '</span></span><b class="gs-n">' + T[n].s + "</b></div>").join("") + "</div>" +
          (editable && onReset ? '<button class="link" type="button" data-greset2>' + tr("Remettre le compteur à zéro", "Reset the counter") + "</button>" : "") + "</div>";
      }
      root.innerHTML = h + "</div>";
      const upd = p => { set(Object.assign(get(), p)); draw(); };
      $$("[data-gs]", root).forEach(b => b.addEventListener("click", () => upd({ [b.dataset.gs]: b.dataset.v })));
      $$("[data-gst]", root).forEach(b => b.addEventListener("click", () => { const k = b.dataset.gst, lim = k === "cap" ? [1, 60] : [0, 30]; upd({ [k]: Math.max(lim[0], Math.min(lim[1], (+get()[k] || 0) + +b.dataset.d)) }); }));
      $$("[data-gtr]", root).forEach(b => b.addEventListener("click", () => { const S2 = get(), k = (game === "_fin" ? gid : game) + ":" + b.dataset.gtr, t = Object.assign({}, S2.trig); t[k] = Math.max(0, Math.min(10, gBase(S2, game === "_fin" ? gid : game, b.dataset.gtr) + +b.dataset.d)); if(game === "_fin") SB.games.forEach(d => { t[d.id + ":" + b.dataset.gtr] = t[k]; }); upd({ trig: t }); }));
      $$("[data-gg]", root).forEach(b => b.addEventListener("click", () => { game = b.dataset.gg; draw(); }));
      const on = $("[data-gon]", root); if(on && editable) on.addEventListener("click", () => upd({ on: !get().on }));
      const jk = $("[data-gjk]", root); if(jk && editable) jk.addEventListener("click", () => upd({ joker: !get().joker }));
      $$("[data-gdel]", root).forEach(b => b.addEventListener("click", () => { const c = A(get().custom).slice(); c.splice(+b.dataset.gdel, 1); upd({ custom: c }); }));
      const add = $("[data-gadd]", root); if(add) add.addEventListener("click", () => { const v = clean($("#gs-new", root).value, 120); if(v) upd({ custom: A(get().custom).concat([v]) }); });
      const rs = $("[data-greset2]", root); if(rs) armTap(rs, () => { onReset(); draw(); }, tr("Touche encore pour remettre à zéro", "Tap again to reset"));
    };
    draw();
  }, gRefresh);
}
const gProfShort = () => { const gp = gProf(store().gp); return gp.drink === "sans" ? tr("Sans alcool", "No alcohol") : DRINKS[gp.drink].name + " · max " + gVerres(gLim(gp), gp.drink); };
// Texte d'une limite : « 3 demis (25 cl) ≈ 24 gorgées · environ 3 verres standard ».
function gLimText(drink, lim){
  const d = DRINKS[drink]; if(!d) return "";
  return gVerres(lim, drink) + " · " + tr("≈ " + Math.round(lim * d.sips) + " gorgées", "≈ " + Math.round(lim * d.sips) + " sips") + " · " + tr("environ " + lim * d.std + " verre" + (lim * d.std > 1 ? "s" : "") + " standard", "about " + lim * d.std + " standard drink" + (lim * d.std > 1 ? "s" : ""));
}
function gProfilePage(){
  SB.page(tr("Mon profil", "My profile"), root => {
    const draw = () => {
      const gp = gProf(store().gp), lim = gLim(gp), d = DRINKS[gp.drink];
      const opts = [["sans", tr("Je ne bois pas d'alcool", "I'm not drinking alcohol"), tr("Tu reçois des gages sans alcool à la place : défis, chansons, pompes…", "You get no-alcohol forfeits instead: dares, songs, push-ups…")]]
        .concat(Object.keys(DRINKS).map(k => [k, DRINKS[k].name, tr("1 verre = ", "1 drink = ") + DRINKS[k].glass + (DRINKS[k].sips > 1 ? tr(" ≈ " + DRINKS[k].sips + " gorgées", " ≈ " + DRINKS[k].sips + " sips") : "")]));
      root.innerHTML = '<div class="gs"><p class="howto">' + tr("Ton profil reste sur ton téléphone et te suit dans chaque salon. Il sert à une chose : que les gages des jeux respectent ce que tu bois et ta limite. Une fois ta limite atteinte, tes gages passent automatiquement en sans alcool, sans que les autres sachent pourquoi.", "Your profile stays on your phone and follows you into every room. It does one thing: makes game forfeits respect what you drink and your limit. Once you hit your limit, your forfeits switch to no-alcohol automatically, without the others knowing why.") + "</p>" +
        '<div class="field"><span class="eyebrow">' + tr("Ce soir, je bois…", "Tonight I'm drinking…") + '</span><div class="packs">' +
        opts.map(o => '<button type="button" class="pack" data-gd="' + o[0] + '" aria-pressed="' + (gp.drink === o[0]) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(o[1]) + '</span><span class="ds">' + esc(o[2]) + "</span></span></button>").join("") + "</div></div>" +
        (d ? '<div class="field"><span class="eyebrow">' + tr("Ma limite pour la soirée", "My limit for the night") + '</span><div class="gs-box"><div class="gs-row"><span class="tx"><b>' + esc(gVerres(lim, gp.drink)) + '</b><span class="sm">' + esc(gLimText(gp.drink, lim)) + '</span></span><button type="button" class="gs-b" data-gl="-1" aria-label="' + tr("Moins", "Less") + '">−</button><b class="gs-n">' + lim + '</b><button type="button" class="gs-b" data-gl="1" aria-label="' + tr("Plus", "More") + '">+</button></div></div>' +
          '<p class="sm" style="margin:0">' + tr("Une limite est gardée pour chaque boisson : si tu passes de la bière au vin, ta limite « vin » reprend.", "A limit is kept for each drink: switch from beer to wine and your “wine” limit comes back.") + "</p></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Comment on compte", "How it's counted") + '</span><ul class="gs-how">' +
          "<li><b>" + tr("1 gorgée", "1 sip") + "</b> " + tr("= une gorgée normale de ta boisson (" + d.sips + " par verre).", "= a normal sip of your drink (" + d.sips + " per drink).") + "</li>" +
          "<li><b>1 shot</b> " + (gp.drink === "fort" ? tr("= un shot (3 cl).", "= one shot (3 cl).") : tr("= 3 gorgées de ta boisson.", "= 3 sips of your drink.")) + "</li>" +
          "<li><b>" + tr("1 cul-sec", "1 chug") + "</b> " + tr("= finir ton verre (" + d.glass + ").", "= finish your drink (" + d.glass + ").") + "</li>" +
          "<li>" + tr("1 verre standard = 10 g d'alcool pur. Les repères santé conseillent pas plus de 10 par semaine et pas plus de 2 par jour.", "1 standard drink = 10 g of pure alcohol. Health guidelines suggest no more than 10 a week and no more than 2 a day.") + "</li></ul></div>" : "") +
        "</div>";
      const save = p => { const g2 = Object.assign(gProf(store().gp), p); g2.alc = g2.drink !== "sans"; persist({ gp: g2 }); CORE_X._gp = g2; SB.refreshExtras(); draw(); };
      $$("[data-gd]", root).forEach(b => b.addEventListener("click", () => { buzz(8); save({ drink: b.dataset.gd }); }));
      $$("[data-gl]", root).forEach(b => b.addEventListener("click", () => { const g2 = gProf(store().gp), l = Object.assign({}, g2.lim); l[g2.drink] = Math.max(1, Math.min(20, gLim(g2) + +b.dataset.gl)); save({ lim: l }); }));
    };
    draw();
  }, gRefresh);
}
// Profil de base sur l'accueil : mes gages par défaut (réutilisés dans chaque salon) et mon profil (je bois ou non).
function renderHomeProfile(){
  const el = $("#h-prof"); if(!el) return;
  const S = gLocalSettings(), gp = Object.assign({ alc: true, cap: 0 }, store().gp || {});
  const key = JSON.stringify([S.on, S.level, S.unit, gp, LANG]);
  if(el.dataset.key === key) return; el.dataset.key = key;
  el.innerHTML = '<button type="button" data-hme><b>' + tr("Mon profil", "My profile") + '</b><span class="sm">' + esc(gProfShort()) + "</span></button>" +
    '<button type="button" data-hgs><b>' + tr("Mes gages", "My forfeits") + '</b><span class="sm">' + (S.on ? esc({ chill: "Chill", classique: tr("Classique", "Classic"), chaud: tr("Apéro chaud", "Wild night"), perso: "Perso" }[S.level]) + " · " + gUnit(S, 2).replace(/^2 /, "") : tr("Désactivés", "Off")) + "</span></button>";
  $("[data-hme]", el).addEventListener("click", () => gProfilePage());
  $("[data-hgs]", el).addEventListener("click", () => gSettingsPage(gLocalSettings, gSaveSettings, true, () => ({}), null));
}
// Bandeau « Gages » du salon (tout le monde) et de la liste « un seul téléphone ».
function gSalonBar(g){
  let el = $("#sa-gages");
  if(!el){ el = document.createElement("div"); el.id = "sa-gages"; el.className = "gbar"; const r = $("#sa-roster"); if(r && r.parentNode) r.parentNode.parentNode.insertBefore(el, r.parentNode.nextSibling); else return; }
  const S = gSettings(g && g.gages), gp = store().gp || {};
  const key = JSON.stringify([S.on, S.level, S.unit, N.host, gp]);
  if(el.dataset.key === key) return; el.dataset.key = key;
  el.innerHTML = '<button type="button" data-gset><b>' + tr("Gages", "Forfeits") + '</b><span class="sm">' + (S.on ? esc({ chill: "Chill", classique: tr("Classique", "Classic"), chaud: tr("Apéro chaud", "Wild night"), perso: "Perso" }[S.level]) + " · " + gUnit(S, 2).replace(/^2 /, "") : tr("Désactivés", "Off")) + "</span></button>" +
    '<button type="button" data-gme><b>' + tr("Mon profil", "My profile") + '</b><span class="sm">' + esc(gProfShort()) + "</span></button>";
  $("[data-gset]", el).addEventListener("click", () => gSettingsPage(() => gSettings((G() || {}).gages), s => { if(!N.host) return; persist({ gages: s }); hostSetG({ gages: s }); }, N.host, () => (G() || {}).gt || {}, () => { if(N.host) hostSetG({ gt: {} }); }));
  $("[data-gme]", el).addEventListener("click", gProfilePage);
}
function gLocalBar(){
  const box = $("#ll-tiles"); if(!box) return;
  let el = $("#ll-gages");
  if(!el){ el = document.createElement("div"); el.id = "ll-gages"; el.className = "gbar"; box.parentNode.insertBefore(el, box); }
  const S = gLocalSettings();
  el.innerHTML = '<button type="button" data-gset><b>' + tr("Gages", "Forfeits") + '</b><span class="sm">' + (S.on ? esc({ chill: "Chill", classique: tr("Classique", "Classic"), chaud: tr("Apéro chaud", "Wild night"), perso: "Perso" }[S.level]) : tr("Désactivés", "Off")) + "</span></button>" +
    '<button type="button" data-gsob><b>' + tr("Qui boit quoi ?", "Who drinks what?") + '</b><span class="sm">' + tr("Boisson et limite de chacun", "Everyone's drink and limit") + "</span></button>";
  $("[data-gset]", el).addEventListener("click", () => gSettingsPage(gLocalSettings, gSaveSettings, true, () => LGG.tally, () => { LGG.tally = {}; }));
  $("[data-gsob]", el).addEventListener("click", () => SB.page(tr("Qui boit quoi ?", "Who drinks what?"), root => {
    const draw = () => {
      const names = A(store().localNames).map(n => clean(n, 16)).filter(Boolean);
      root.innerHTML = '<div class="gs"><p class="howto">' + tr("Sur un seul téléphone, choisis ce que boit chaque joueur. Sa limite est celle proposée pour sa boisson ; au-delà, il passe aux gages sans alcool.", "On one phone, pick what each player drinks. Their limit is the default for that drink; past it, they switch to no-alcohol forfeits.") + "</p>" +
        (names.length ? names.map(n => { const dk = gLocalDrink(n); return '<div class="field"><span class="eyebrow">' + esc(n) + (dk !== "sans" ? " · max " + esc(gVerres(DRINKS[dk].def, dk)) : "") + '</span><div class="filters">' + [["sans", tr("Sans alcool", "No alcohol")]].concat(Object.keys(DRINKS).map(k => [k, DRINKS[k].name])).map(o => '<button type="button" data-gn="' + esc(n) + '" data-gk="' + o[0] + '" aria-pressed="' + (dk === o[0]) + '">' + esc(o[1]) + "</button>").join("") + "</div></div>"; }).join("")
          : '<p class="sm">' + tr("Ajoute d'abord les prénoms en lançant un jeu.", "Add player names first by starting a game.") + "</p>") + "</div>";
      $$("[data-gn]", root).forEach(b => b.addEventListener("click", () => { const m = Object.assign({}, store().gagesDrinks || {}); m[b.dataset.gn] = b.dataset.gk; persist({ gagesDrinks: m }); buzz(6); draw(); }));
    };
    draw();
  }, gLocalBar));
}

/* ---------- Choix de la langue (accueil) ---------- */
function renderLang(){
  const box = $("#h-lang"); if(!box) return;
  box.setAttribute("role", "group"); box.setAttribute("aria-label", tr("Langue", "Language"));
  box.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
    [["fr", "FR", "Français"], ["en", "EN", "English"]].map(l => '<button type="button" data-lang="' + l[0] + '" aria-pressed="' + (LANG === l[0]) + '" aria-label="' + l[2] + '" title="' + l[2] + '">' + l[1] + "</button>").join("");
  $$("[data-lang]", box).forEach(b => b.addEventListener("click", () => { buzz(8); SB.setLang(b.dataset.lang); }));
}
/* =================== Démarrage =================== */
SB.boot = function(){
  CORE_X._gp = Object.assign({ alc: true, cap: 0 }, store().gp || {});
  if(LANG === "en"){ document.documentElement.lang = "en"; i18nDom(document.body); }
  renderLang();
  if(window.AndroidUpdate){
    setTimeout(() => checkUpdate(false), 400);
    document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible" && Date.now() - UP.last > 3 * 3600 * 1000 && !(UP.st && UP.st.t === "progress")) checkUpdate(false); });
  }
  renderUpdate();
  // Couleur de chaque jeu, clair et sombre
  let css = "";
  SB.games.forEach(d => {
    const a = d.accent || {}, c = a.dark || a.light || "#ff5a36";
    css += ".acc-" + d.id + "{--acc:" + c + ";--tone:" + c + ";--on-acc:#14101a}";
  });
  const st = document.createElement("style"); st.textContent = css; document.head.append(st);

  const RELAY_OK = typeof window.WebSocket === "function" && typeof window.TextEncoder === "function";
  netReady = FB_ON || RELAY_OK;
  if(!FB_ON && window.claude && typeof window.claude.use === "function"){
    netLoading = true;
    window.claude.use("room").then(r => { ROOM = r || null; }, () => { ROOM = null; }).then(() => { netLoading = false; netReady = !!ROOM || RELAY_OK; renderHome(); });
  }
  const nm = $("#h-name"), cd = $("#h-code");
  nm.value = store().name || "";
  const m = (location.hash || "").match(/^#([A-Za-z]{4})$/);
  if(m){ hashCode = m[1].toUpperCase(); cd.value = hashCode; }
  nm.addEventListener("input", () => { persist({ name: clean(nm.value, 16) }); renderHome(); });
  cd.addEventListener("input", () => { cd.value = cd.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4); renderHome(); });
  cd.addEventListener("keydown", e => { if(e.key === "Enter" && !$("#h-join").disabled) $("#h-join").click(); });
  $("#h-create").addEventListener("click", () => netEnter(makeCode(), true));
  $("#h-join").addEventListener("click", () => netEnter(clean(cd.value, 4).toUpperCase(), false));
  $("#h-local").addEventListener("click", openLocalList);
  $("#h-count").textContent = plural2(SB.games.filter(d => !isWip(d)).length, "jeu", "jeux", "game");
  const ht = $("#h-tiles");
  const drawHome = () => {
    ht.innerHTML = SB.games.filter(d => inFilter(d, FSEL.home)).map(d => tileHTML(d)).join("");
    $$(".tile", ht).forEach(b => b.addEventListener("click", () => openRules(SB.byId[b.dataset.id])));
  };
  bindFilter($("#h-filter"), "home", drawHome);
  drawHome();

  armTap($("#sa-quit"), netLeave, tr("Touche encore pour quitter", "Tap again to leave"));
  armTap($("#sp-quit"), netLeave, tr("Touche encore pour quitter", "Tap again to leave"));
  $("#lo-home").addEventListener("click", netLeave);
  $("#sa-qr").addEventListener("click", () => { buzz(8); openQR(); });
  $("#sa-share").addEventListener("click", () => {
    const url = inviteURL(N.code);
    shareText(tr("Rejoins mon salon Soirée Box ! Code : " + N.code, "Join my Soirée Box room! Code: " + N.code), url, $("#sa-link"), msg => toast(msg === "Copié" ? tr("Invitation copiée", "Invite copied") : tr("Invitation partagée", "Invite shared")));
  });
  $("#ll-back").addEventListener("click", goHome);
  $$("[data-bug]").forEach(b => {
    if(b.classList.contains("bugbtn")) b.innerHTML = BUGICON; else { const i = b.querySelector(".bi"); if(i) i.innerHTML = BUGICON; }
    b.addEventListener("click", () => { buzz(8); openBug(); });
  });
  $("#lp-back").addEventListener("click", openLocalList);
  $("#lp-add").addEventListener("click", () => { LP.names.push(""); renderLocalPlayers(); const ins = $$("#lp-list input"); ins[ins.length - 1].focus(); });
  $("#lp-go").addEventListener("click", () => {
    const lp = LP.def.local.players, names = LP.names.map(s => clean(s, 16)).filter(Boolean), err = $("#lp-err");
    if(names.length < lp.min){ err.textContent = tr("Il faut au moins " + lp.min + " joueurs avec un prénom.", "You need at least " + lp.min + " players with a name."); err.hidden = false; return; }
    if(lp.max && names.length > lp.max){ err.textContent = tr("Ce jeu se joue à " + lp.max + " joueurs maximum.", "This game is for " + lp.max + " players max."); err.hidden = false; return; }
    const dup = names.find((n, i) => names.findIndex(x => x.toLowerCase() === n.toLowerCase()) !== i);
    if(dup){ err.textContent = tr("Deux joueurs s'appellent « " + dup + " ». Donne-leur des prénoms différents.", "Two players are called “" + dup + "”. Give them different names."); err.hidden = false; return; }
    err.hidden = true; startLocal(LP.def, names);
  });
  $("#pg-done").addEventListener("click", () => SB.closePage());
  $$("#sheet [data-close]").forEach(b => b.addEventListener("click", closeSheet));
  document.addEventListener("keydown", e => { if(e.key === "Escape" && sheetOpen) closeSheet(); });
  // Retour système de l'appli web installée (l'APK passe par SB.back directement)
  if(!window.claude && !window.AndroidShare && window.matchMedia && matchMedia("(display-mode: standalone)").matches){
    try{ history.pushState({ sb: 1 }, ""); }catch(e){}
    window.addEventListener("popstate", () => { if(SB.back()){ try{ history.pushState({ sb: 1 }, ""); }catch(e){} } else history.back(); });
  }

  // Battement : minuteurs des jeux et arbitrage de l'hôte
  setInterval(() => {
    if(N.nr && current !== "page"){ const g = G(); if(g && g.phase === "game"){ const d = SB.byId[g.game]; if(d && (d.ticks || N.host)) render(); } }
    if(L.tick && current === "local"){ try{ L.tick(); }catch(e){ console.error(e); } }
  }, 400);

  renderHome();
};
})();
