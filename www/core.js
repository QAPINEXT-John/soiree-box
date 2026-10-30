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
// Statistiques d'utilisation (beta 4.39.0) retirées : on efface ce qu'elles avaient laissé sur le téléphone.
try{ localStorage.removeItem("soiree-stats"); localStorage.removeItem("soiree-stats-col"); const o = JSON.parse(localStorage.getItem(STORE) || "{}"); if(o && ("statsOff" in o || "statsAdmin" in o)){ delete o.statsOff; delete o.statsAdmin; localStorage.setItem(STORE, JSON.stringify(o)); } }catch(e){}

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
  "Jouer sur un seul téléphone": "Play on one phone", "On se le passe, ou on joue contre des bots": "Pass it around, or play against bots",
  "Les jeux": "Games", "Un bug, un souci ?": "Bug or problem?", "Signale-le": "Report it",
  "Salon": "Room", "Hors ligne…": "Offline…", "Signaler un bug": "Report a bug", "Règles du jeu": "Game rules", "Quitter": "Leave",
  "Code à partager": "Code to share", "Partager l'invitation": "Share the invite", "QR code du salon": "Room QR code", "Mon profil": "My profile", "Invitation": "Invite", "Choisis un jeu": "Pick a game",
  "Partie en cours": "Game in progress",
  "Tu as rejoint une partie déjà commencée. Tu pourras jouer à la prochaine, quand l'hôte la lancera depuis le salon.": "You joined mid-game. You can play the next one when the host starts it from the room.",
  "Salon fermé": "Room closed", "L'hôte est parti(e)": "The host left",
  "La personne qui a créé le salon a quitté l'appli ou perdu la connexion. Crée un nouveau salon pour continuer.": "The person who created the room left the app or lost connection. Create a new room to keep playing.",
  "Retour à l'accueil": "Back to home", "Sur ce téléphone": "On this phone", "Accueil": "Home", "Un seul téléphone": "One phone",
  "Entre les prénoms des joueurs une fois, puis choisis un jeu. Le téléphone passe de main en main, ou tu joues contre des bots.": "Enter your names once, then pick a game. Pass the phone around, or play against bots.",
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
  // Écran de réglages redessiné après un choix (clé « su… » → « su… ») : on garde la position, sans animation.
  const same = /^su/.test(key) && /^su/.test(root.dataset.key || ""), sc = root.closest(".screen"), y = sc ? sc.scrollTop : 0;
  root.dataset.key = key; root.innerHTML = html;
  if(same){ if(sc) sc.scrollTop = y; } else { enter(root); if(sc) sc.scrollTop = 0; }
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
// Coupe la musique des jeux (blind test…) quand on quitte une partie ou qu'une autre commence.
function stopSounds(){ try{ if(SB.music && SB.music.pause) SB.music.pause(); }catch(e){} A(SB._stops).forEach(f => { try{ f(); }catch(e){} }); }
// Les jeux qui font du son (tic-tac…) s'inscrivent ici pour être coupés quand on quitte la partie.
SB.onStop = f => { (SB._stops = SB._stops || []).push(f); };
function show(name){
  if(current === name) return;
  closeSheet();
  if(name !== "game" && name !== "local"){ closeRulesOv(); closeQuitOv(); closeGlassOv(); stopSounds(); }
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
  if(closeGlassOv()) return true;
  if(closeQuitOv()) return true;
  if(closeRulesOv()) return true;
  if(sheetOpen){ closeSheet(); return true; }
  if(current === "page"){ if(SB._pageBack && SB._pageBack()) return true; SB.closePage(); return true; }
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
  const prev = current === "page" ? (SB._pagePrev || "home") : current;
  SB._pagePrev = prev; SB._pageBack = null; SB._pageParent = null; SB._pageT0 = title;
  closeSheet();
  $("#pg-title").textContent = title; pgHead();
  const root = $("#page-root"); root.innerHTML = ""; root.dataset.key = "";
  show("page");
  SB._pageClose = () => { SB._pageClose = null; SB._pageBack = null; show(prev); if(onClose) onClose(); $("#sa-panel").dataset.key = ""; $("#sa-dock").dataset.key = ""; scheduleRender(); };
  build(root);
};
// En-tête des pages : petit sur-titre + grand titre + bouton rond. Sur la page principale, une croix (fermer) ;
// dans une sous-vue (Avatar, Déclencheurs…) ou une page ouverte depuis une autre, une flèche, et le sur-titre dit où elle ramène.
function pgHead(){
  const t = $("#pg-title"), b = $("#pg-done"), eb = $("#pg-eb"); if(!t || !b || !eb) return;
  const inner = t.textContent !== SB._pageT0, sub = inner || !!SB._pageParent;
  eb.textContent = inner ? SB._pageT0 : SB._pageParent || "Soirée Box";
  b.classList.toggle("sub", sub); b.setAttribute("aria-label", sub ? tr("Retour", "Back") : tr("Fermer", "Close"));
}
try{ new MutationObserver(pgHead).observe($("#pg-title"), { childList: true, characterData: true, subtree: true }); }catch(e){}
SB.closePage = function(){ if(SB._pageClose) SB._pageClose(); };

/* =================== Signaler un bug ===================
   - Les erreurs JavaScript et les derniers évènements (écrans, réseau, phases de jeu) sont
     gardés sur le téléphone (localStorage « soiree-buglog »), même si l'appli a planté.
   - « Signaler un bug » ouvre un formulaire ; le rapport part par mail (BUG_MAIL), ou se partage / se copie. */
const VERSION = "4.40.3";
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
  b.innerHTML = BUGICON + tr("<span>Un souci ? <u>Signale le bug</u></span>", "<span>Something wrong? <u>Report the bug</u></span>");
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
      '<label class="lbl" for="bg-what">' + tr("Ce qui s'est passé", "What happened") + '<textarea class="txt area" id="bg-what" rows="4" maxlength="1500" placeholder="' + esc(tr("Ex. : dans Dernière carte, j'ai posé un +2 et plus personne ne pouvait jouer.", "E.g. in Last Card, I played a +2 and then nobody could play.")) + '"></textarea></label>' +
      '<label class="lbl" for="bg-how">' + tr("Comment reproduire le problème (si tu sais)", "How to reproduce it (if you know)") + '<textarea class="txt area" id="bg-how" rows="3" maxlength="800" placeholder="' + esc(tr("Ex. : 3 joueurs, cumul activé, j'étais l'hôte en 4G.", "E.g. 3 players, stacking on, I was the host on mobile data.")) + '"></textarea></label>' +
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
const CATS = { jamais: "votes", debat: "votes", dixmais: "votes", note10: "votes", photoroulette: "wip", kink: "votes", quiplus: "votes", tupref: "votes", redflag: "votes", purete: "votes", quiadit: "votes", priorites: "votes",
  undercover: "bluff", killer: "bluff", loupgarou: "bluff", menteurs: "bluff", motsint: "cartes", defis: "action", dernierecarte: "cartes", punchline: "votes", actionverite: "action", grille: "cartes", agents: "cartes", rougenoir: "cartes", sept: "cartes", pmu: "cartes", blindtest: "quiz", quiz: "quiz", course: "action", puissance4: "cartes", bombe: "action" };
const FILTERS = [["all", tr("Tous", "All")], ["votes", tr("Votes", "Voting")], ["bluff", "Bluff"], ["cartes", tr("Cartes", "Cards")], ["quiz", "Quiz"], ["action", "Action"], ["hot", "18+"], ["wip", tr("En travaux", "Beta")]];
// Jeux « en travaux » : jouables pour les tester, mais rangés à part, seulement dans leur filtre.
const isWip = d => CATS[d.id] === "wip";
/* ---------- Mode Hard / Soft ----------
   Hard par défaut. Le Soft (réglé dans le profil) cache le contenu 18+ : jeux pour adultes, paquets et options 18+,
   avatars Hot et gages avec alcool. En salon, c'est le mode de l'hôte qui compte pour les jeux et les gages ;
   pour les avatars, chacun garde le sien. */
/* Mode Enfant : un Soft verrouillé par un code à 4 chiffres, avec seulement des jeux tout public. */
const KID_GAMES = ["undercover", "motsint", "loupgarou", "priorites", "dernierecarte", "note10", "grille", "dixmais", "agents", "debat", "jamais", "rougenoir", "sept", "blindtest", "quiz", "course", "puissance4", "bombe"];
const myKid = () => !!(store().kid && store().kid.on);
const roomKid = () => { const g = N.nr ? G() : null; return g ? g.kid === true : myKid(); };
const pinHash = p => { let h = 5381; String(p).split("").forEach(c => { h = ((h << 5) + h + c.charCodeAt(0)) | 0; }); return "k" + (h >>> 0).toString(36); };
const KID_RX = new RegExp("(?<![\\p{L}])(alcool|alcools|alcohol|bière|bières|beer|vin|vins|wine|champagne|vodka|whisky|tequila|rhum|rum|cocktail|cocktails|apéro|apéros|shot|shots|shooter|cuite|ivre|ivresse|drunk|soûl|saoul|bourré|bourrée|gueule de bois|hangover|sexe|sex|sexy|bisou|bisous|kiss|nu|nue|nus|nude|naked|strip|strip-tease|porno|porn|préservatif|capote|condom|drogue|drogues|drug|drugs|joint|cannabis|weed|clope|clopes|cigarette|cigarettes|ex|plan cul|coquin|coquine|érotique|erotic|seins|boobs|fesses|lingerie|string|tinder|draguer|drague|flirt|flirter|cocu|tromper|infidèle|bar|boîte de nuit|nightclub|casino|pari|paris|bet|gamble)(?![\\p{L}])", "iu");
SB.kid = () => roomKid();
// Pour les jeux : ce texte (ou tableau de textes) est-il tout public ?
SB.kidOk = x => !KID_RX.test(Array.isArray(x) ? x.flat(Infinity).join(" | ") : String(x == null ? "" : x));
const gameOk = (d, kid, hard) => (kid ? KID_GAMES.indexOf(d.id) >= 0 : !d.adult || hard);
const myHard = () => !myKid() && store().hard !== false;
const roomHard = () => { const g = N.nr ? G() : null; return g ? g.hd !== false : myHard(); };
const HD_OK = {};
let HOME_REDRAW = null;
SB.hard = () => roomHard();
// Pour les jeux : un paquet est-il permis dans le mode actuel ?
/* Équipes pour les jeux qui le proposent (Quiz, Blind test) : 2 à 4 équipes de couleur.
   m = { joueur: "a" | "b" | "c" | "d" }. Le capitaine tourne à chaque manche. */
const TEAMS = [["a", tr("Rouges", "Red"), "#e8414e"], ["b", tr("Bleus", "Blue"), "#3a7bff"], ["c", tr("Verts", "Green"), "#2fa860"], ["d", tr("Jaunes", "Yellow"), "#d99a00"]];
SB.teams = {
  ids: n => TEAMS.slice(0, Math.max(2, Math.min(4, n || 2))).map(t => t[0]),
  name: t => (TEAMS.find(x => x[0] === t) || [0, ""])[1],
  color: t => (TEAMS.find(x => x[0] === t) || [0, 0, "#888"])[2],
  split(ids, n){ const m = {}, T = SB.teams.ids(n); shuffle(A(ids)).forEach((id, i) => { m[id] = T[i % T.length]; }); return m; },
  members: (m, t, ids) => A(ids).filter(id => (m || {})[id] === t),
  cycle(m, id, n){ const T = SB.teams.ids(n), i = T.indexOf((m || {})[id]); return Object.assign({}, m, { [id]: T[(i + 1) % T.length] }); },
  ok: (m, n, ids) => SB.teams.ids(n).every(t => SB.teams.members(m, t, ids).length > 0),
  captain(m, t, ids, round, here){ const L = SB.teams.members(m, t, ids).filter(id => !here || here(id)); return L.length ? L[Math.max(0, (round || 1) - 1) % L.length] : ""; },
  pill: t => '<span class="tm-pill" style="background:' + SB.teams.color(t) + '">' + esc(SB.teams.name(t)) + "</span>",
  // Les colonnes d'équipes ; avec editable, chaque prénom est un bouton (data-tmv) qui le fait passer à l'équipe suivante.
  grid(m, n, ids, nameOf, editable){
    return '<div class="tm-grid">' + SB.teams.ids(n).map(t => '<div class="tm-col" style="border-color:' + SB.teams.color(t) + '"><b style="color:' + SB.teams.color(t) + '">' + esc(SB.teams.name(t)) + "</b>" +
      SB.teams.members(m, t, ids).map(id => '<button type="button" data-tmv="' + esc(id) + '"' + (editable ? "" : " disabled") + ">" + esc(nameOf(id)) + "</button>").join("") + "</div>").join("") + "</div>";
  },
  // Classement par équipe : tp = { a: points }, got = { a: points de la manche }.
  board(m, n, tp, ids, nameOf, got){
    return '<div class="tm-board">' + SB.teams.ids(n).slice().sort((x, y) => (tp[y] || 0) - (tp[x] || 0)).map((t, i) => {
      const d = got && got[t];
      return '<div class="tm-row" style="border-color:' + SB.teams.color(t) + '"><span class="tx"><b style="color:' + SB.teams.color(t) + '">' + (i + 1) + ". " + esc(SB.teams.name(t)) + "</b><small>" + esc(SB.teams.members(m, t, ids).map(nameOf).join(", ")) + "</small></span>" +
        (d ? '<span class="d ' + (d > 0 ? "p" : "m") + '">' + (d > 0 ? "+" : "") + d + "</span>" : "") + '<span class="n">' + (tp[t] || 0) + "</span></div>";
    }).join("") + "</div>";
  },
  best(tp, n){ const T = SB.teams.ids(n), mx = Math.max(...T.map(t => tp[t] || 0)); return { mx, win: T.filter(t => (tp[t] || 0) === mx) }; }
};
SB.packOk = p => !p || (roomKid() ? !!p.kid : !p.hot || roomHard());
// Pour les jeux : garde de la sélection sel les paquets permis (packs = liste { v, hot }). Jamais vide si un paquet soft existe.
SB.okPacks = (sel, packs) => {
  const ps = A(packs), ok = roomKid() && ps.some(p => p.kid) ? (p => !!p.kid) : roomHard() ? (() => true) : (p => !p.hot);
  const allowed = ps.filter(ok).map(p => p.v);
  if(allowed.length === ps.length) return A(sel);
  const out = A(sel).filter(v => allowed.indexOf(v) >= 0);
  if(out.length) return out;
  const f = ps.find(p => ok(p) && p.count !== 0); return f ? [f.v] : [];
};
function syncSoftClass(){ document.documentElement.classList.toggle("soft", !roomHard()); }
const FSEL = { home: "all", salon: "all" };
function inFilter(d, f){ if(isWip(d)) return f === "wip" || f === "all"; return f === "all" || (f === "hot" ? !!d.hot : CATS[d.id] === f); }
function filterHTML(which){
  const hard = which === "salon" ? roomHard() : myHard(), kid = which === "salon" ? roomKid() : myKid();
  if((!hard && FSEL[which] === "hot") || (kid && FSEL[which] === "wip")) FSEL[which] = "all";
  return FILTERS.filter(f => (hard || f[0] !== "hot") && (!kid || f[0] !== "wip")).map(f => '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (FSEL[which] === f[0]) + '"' + (f[0] === "hot" ? ' class="hot"' : "") + ">" + f[1] + "</button>").join("");
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
  const meta = esc(range) + (def.hot && myHard() ? " · 18+" : "") + (def.local && def.local.players && def.local.players.min === 1 ? " · solo" : "");
  const wip = isWip(def);
  return '<button type="button" class="tile acc-' + esc(def.id) + (wip ? " wip" : "") + '" data-id="' + esc(def.id) + '"' + (opts.disabled || wip ? " disabled" : "") + (wip ? ' aria-label="' + esc(def.name) + tr(" : en travaux", ": under construction") + '"' : "") + (opts.pressed ? ' aria-pressed="true"' : "") + '>' +
    '<span class="gl">' + esc(def.glyph || def.name.slice(0, 2)) + '</span><span class="nm">' + esc(def.name) + '</span><span class="ds">' + esc(def.pitch || def.tag || "") + '</span><span class="meta">' + (isWip(def) ? '<b class="wipb">' + tr("En travaux", "Beta") + '</b> · ' : "") + (opts.metaHTML || meta) + "</span>" + CHECK + (wip ? '<span class="tape" aria-hidden="true"><i></i><i><b>' + tr("EN TRAVAUX", "UNDER CONSTRUCTION") + "</b></i></span>" : "") + "</button>";
}
function rulesHTML(def){
  const r = A(def.rules);
  return r.length ? '<details><summary>' + tr("Règles", "Rules") + '</summary><ol>' + r.map(x => "<li>" + esc(x) + "</li>").join("") + '</ol></details>' : "";
}
function openRules(def, inGame){
  SB.page(def.name, root => {
    accent(def.id);
    root.innerHTML = '<div class="card acc"><span class="gl hand huge">' + esc(def.glyph || "") + '</span><p class="lead">' + esc(def.tag || "") + '</p><span class="sm">' +
      esc(rangeLong(def)) + (def.local ? tr(" · aussi sur un seul téléphone", " · also on a single phone") : "") + '</span></div>' +
      '<ol class="howto" style="margin:0; padding-left:30px; display:flex; flex-direction:column; gap:6px">' + A(def.rules).map(x => "<li>" + esc(x) + "</li>").join("") + "</ol>";
  }, () => accent(inGame ? def.id : ""));
}

// Bouton « quitter » des parties : une croix, puis une confirmation dans un panneau (le jeu reste derrière).
const QUIT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
function quitButton(box, o){
  box.innerHTML = '<button class="bugbtn quitbtn" type="button" aria-label="' + esc(o.label) + '">' + QUIT_SVG + "</button>";
  box.firstChild.addEventListener("click", () => { buzz(8); openQuitOv(o); });
}
function closeQuitOv(){ const x = document.getElementById("quit-ov"); if(!x) return false; x.classList.remove("on"); setTimeout(() => x.remove(), 200); return true; }
function openQuitOv(o){
  closeQuitOv(); closeRulesOv();
  const x = document.createElement("div"); x.id = "quit-ov"; x.className = "rules-ov";
  x.innerHTML = '<div class="rules-in quit-in" role="dialog" aria-modal="true" aria-labelledby="qo-t"><b id="qo-t" class="quit-t">' + esc(o.title) + '</b><p class="sm" style="margin:0">' + esc(o.text) + "</p>" +
    '<button class="btn warn-btn" type="button" data-qok>' + esc(o.ok) + '</button><button class="btn ghost" type="button" data-qno>' + tr("Continuer à jouer", "Keep playing") + "</button></div>";
  document.body.appendChild(x);
  x.addEventListener("click", e => { if(e.target === x || e.target.closest("[data-qno]")) closeQuitOv(); });
  x.querySelector("[data-qok]").addEventListener("click", () => { buzz(12); closeQuitOv(); o.action(); });
  requestAnimationFrame(() => x.classList.add("on"));
}
// Règles par-dessus la partie : un panneau qui laisse voir le jeu derrière (la partie continue).
function closeRulesOv(){ const o = document.getElementById("rules-ov"); if(!o) return false; o.classList.remove("on"); setTimeout(() => o.remove(), 200); return true; }
function openRulesOv(def){
  closeRulesOv();
  const o = document.createElement("div"); o.id = "rules-ov"; o.className = "rules-ov acc-" + def.id;
  o.innerHTML = '<div class="rules-in" role="dialog" aria-modal="true" aria-labelledby="ro-t"><div class="rules-hd"><span class="gsq">' + esc(def.glyph || "") + '</span><b id="ro-t">' + esc(def.name) + '</b><button type="button" class="link" data-roc>' + tr("Fermer", "Close") + "</button></div>" +
    '<p class="sm" style="margin:0">' + esc(def.tag || "") + "</p>" +
    '<ol class="howto">' + A(def.rules).map(x => "<li>" + esc(x) + "</li>").join("") + "</ol></div>";
  document.body.appendChild(o);
  o.addEventListener("click", e => { if(e.target === o || e.target.closest("[data-roc]")) closeRulesOv(); });
  requestAnimationFrame(() => o.classList.add("on"));
}

/* =================== Accueil =================== */
let netReady = false, netLoading = false;
const SHARE_BASE = window.SB_SHARE_BASE || ((location.protocol === "https:" && !/^(localhost|127\.|\[::1\])/.test(location.hostname)) ? location.origin + location.pathname : "");
// Adresse publique du jeu (site + appli) : sert aux liens d'invitation et au QR code, même depuis l'appli Android.
const PUBLIC_BASE = window.SB_PUBLIC_BASE || "https://qapinext-john.github.io/soiree-box/";
// Version beta (https://…/soiree-box/beta/) : pour tester une mise à jour avant de l'envoyer à tout le monde.
const IS_BETA = /\/beta\//.test(location.pathname);
// Lien d'invitation : « #ABCD », ou « #ABCD-soft » pour un salon Soft (le téléphone invité passe en Soft dès l'ouverture du lien).
const inviteURL = code => (SHARE_BASE || PUBLIC_BASE) + "#" + code + (roomKid() ? "-kid" + (N.g && N.g.kpin ? "-" + N.g.kpin : "") : roomHard() ? "" : "-soft");
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
  if(!svg || el.dataset.code === url) return;
  el.dataset.code = url;
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
  if(box.dataset.code === hashCode + hashMode) return;
  box.dataset.code = hashCode + hashMode;
  if(android){
    const intent = "intent://join/" + hashCode + (hashMode ? "?" + hashMode + "=1" : "") + "#Intent;scheme=soireebox;package=fr.soireebox.app;S.browser_fallback_url=" + encodeURIComponent(location.href.split("#")[0] + "#" + hashCode + (hashMode ? "-" + hashMode : "")) + ";end";
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
  const mm = /^([A-Z]{4})(-SOFT|-KID)?$/.exec(String(code || "").toUpperCase());
  if(!mm) return;
  code = mm[1]; if(mm[2] === "-KID") inviteKid(); else if(mm[2]) inviteSoft();
  if(N.nr){ if(N.code !== code) toast(tr("Quitte d'abord ce salon pour rejoindre " + code, "Leave this room first to join " + code)); return; }
  hashCode = code; const cd = $("#h-code"); if(cd) cd.value = code;
  if(typeof goHome === "function") goHome();
  const nm = $("#h-name"); if(nm && !clean(nm.value, 16)) setTimeout(() => nm.focus(), 200);
};
function homeErr(msg){ const e = $("#h-err"); e.textContent = msg || ""; e.hidden = !msg; }
let hashCode = null, hashMode = "";
// Invitation vers un salon Soft : le téléphone passe en Soft tout de suite, même avant de rejoindre.
function inviteSoft(){
  if(!hashMode) hashMode = "soft";
  if(!myHard()) return;
  persist({ hard: false }); syncSoftClass(); renderMe(); if(HOME_REDRAW) HOME_REDRAW();
}
// Invitation vers un salon Enfant (lien, QR code, ou salon rejoint) : le téléphone passe en mode Enfant et on choisit le code.
// Invitation vers un salon Enfant (lien, QR code ou salon rejoint) : le téléphone passe en mode Enfant,
// verrouillé avec le code choisi par l'hôte. Celui qui scanne n'a rien à faire.
function inviteKid(pin){
  hashMode = "kid";
  const k = store().kid || {};
  if(!myKid() || (!k.pin && pin)){ persist({ kid: { on: true, pin: pin || k.pin || null }, hard: false }); syncSoftClass(); renderMe(); if(HOME_REDRAW) HOME_REDRAW(); }
}
// L'hôte passe son salon en mode Enfant : il choisit le code qui verrouillera les téléphones des enfants.
function hostKidPrompt(onOk){
  const old = document.getElementById("kid-pin"); if(old) old.remove();
  const el = document.createElement("div"); el.id = "kid-pin"; el.className = "hdgate";
  const inp = (id, ph) => '<input class="txt pin" id="' + id + '" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="' + ph + '">';
  el.innerHTML = '<div class="hdgate-in" role="dialog" aria-modal="true" aria-labelledby="kp-t"><span class="modepill kid">' + tr("Mode Enfant", "Kids mode") + '</span><h2 id="kp-t">' + tr("Choisis le code du mode Enfant", "Pick the Kids mode code") + "</h2>" +
    "<p>" + tr("Les téléphones qui rejoignent ce salon, ou qui scannent son QR code, passent en mode Enfant, verrouillés avec ce code. Il faudra ce code pour leur faire quitter le mode Enfant. Ne le donne pas aux enfants.", "Phones that join this room, or scan its QR code, switch to Kids mode, locked with this code. You'll need it to take them out of Kids mode. Don't give it to the kids.") + "</p>" +
    inp("kp-1", tr("Code à 4 chiffres", "4-digit code")) + inp("kp-2", tr("Confirme le code", "Once more")) + '<p class="err" data-kperr hidden></p>' +
    '<button class="btn acc" type="button" data-kpok>' + tr("Passer le salon en mode Enfant", "Switch the room to Kids mode") + '</button><button class="btn ghost" type="button" data-kpno>' + tr("Annuler", "Cancel") + "</button></div>";
  document.body.appendChild(el);
  const a = $("#kp-1", el), b = $("#kp-2", el), er = $("[data-kperr]", el);
  setTimeout(() => { try{ a.focus(); }catch(e){} }, 100);
  $("[data-kpno]", el).addEventListener("click", () => el.remove());
  $("[data-kpok]", el).addEventListener("click", () => {
    const bad = t => { er.textContent = t; er.hidden = false; buzz([20, 40, 20]); };
    if(!/^\d{4}$/.test(a.value)) return bad(tr("Le code doit faire 4 chiffres.", "The code must be 4 digits."));
    if(a.value !== b.value) return bad(tr("Les deux codes ne correspondent pas.", "The two codes don't match."));
    el.remove(); buzz(15); onOk(pinHash(a.value));
  });
}
function renderHome(){
  renderInvite(); renderMe();
  const nm = clean($("#h-name").value, 16);
  $("#h-create").disabled = !netReady || N.joining;
  $("#h-join").disabled = !netReady || N.joining;
  void nm;
  const info = $("#h-netinfo");
  if(netLoading){ info.textContent = tr("Connexion au mode réseau…", "Connecting to online mode…"); info.hidden = false; }
  else if(!netReady){ info.textContent = window.claude ? tr("Le mode réseau n'est pas disponible ici. Ouvre la page depuis claude.ai en étant connecté(e), ou joue sur un seul téléphone.", "Online mode isn't available here. Open the page from claude.ai while signed in, or play on one phone.") : tr("Le mode réseau n'a pas pu démarrer. Vérifie ta connexion internet puis relance l'appli, ou joue sur un seul téléphone.", "Online mode couldn't start. Check your internet connection and restart the app, or play on one phone."); info.hidden = false; }
  else if(N.joining){ info.hidden = false; }
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
    '<div class="h"><span class="eyebrow">' + tr("Mise à jour obligatoire", "Update required") + '</span><b>' + tr("Ce salon utilise Soirée Box " + esc(salonV), "This room is playing on Soirée Box " + esc(salonV)) + '</b><span class="sm">' + tr("Tu as la version " + esc(VERSION) + ". Mets à jour pour jouer avec les autres.", "You have version " + esc(VERSION) + ". Update to play with the others.") + "</span></div>" +
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
function freshSalon(){ return { v: 1, code: N.code, phase: "salon", sel: "", game: "", gid: "", players: [], s: null, opts: null, last: null, gages: gLocalSettings(), gt: {}, hd: myHard(), kid: myKid(), kpin: myKid() ? (store().kid || {}).pin || null : null }; }
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
    homeErr(e && e.code === "not_found" ? tr("Aucun salon ouvert avec le code " + code + ". Vérifie le code et que l'hôte a toujours l'appli ouverte.", "No open room with code " + code + ". Check the code, and make sure the host still has the app open.") :
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
// Salon en mode Hard rejoint par quelqu'un réglé en Soft : on prévient avant d'entrer.
function hdGate(g){
  const old = document.getElementById("hd-gate");
  let type = "";
  if(g && !N.host){ if(myKid()){ if(g.kid !== true) type = "kid"; } else if(g.hd !== false && !myHard() && !HD_OK[N.code]) type = "hard"; }
  if(!type){ if(old) old.remove(); return false; }
  if(old && old.dataset.t === type) return true;
  if(old) old.remove();
  const el = document.createElement("div"); el.id = "hd-gate"; el.className = "hdgate"; el.dataset.t = type;
  el.innerHTML = type === "kid"
    ? '<div class="hdgate-in" role="dialog" aria-modal="true" aria-labelledby="hdg-t"><span class="modepill kid">' + tr("Mode Enfant", "Kids mode") + '</span><h2 id="hdg-t">' + tr("Ce salon n'est pas pour les enfants", "This room isn't for kids") + "</h2>" +
      '<p>' + tr("Ce téléphone est en mode Enfant. Demande à l'hôte de toucher le badge en haut du salon pour passer le salon en mode Enfant : tu pourras entrer tout de suite.", "This phone is in Kids mode. Ask the host to tap the badge at the top of the room to switch it to Kids mode: you'll get in right away.") + "</p>" +
      '<button class="btn ghost" type="button" data-hdno>' + tr("Quitter le salon", "Leave the room") + "</button></div>"
    : '<div class="hdgate-in" role="dialog" aria-modal="true" aria-labelledby="hdg-t"><span class="modepill hard">Hard</span><h2 id="hdg-t">' + tr("Ce salon est en mode Hard", "This room is in Hard mode") + "</h2>" +
      '<p>' + tr("L'hôte joue avec le contenu 18+ : questions et défis trash, sexe, gages avec alcool. Toi, ton appli est réglée en Soft.", "The host plays with 18+ content: trashy questions and dares, sex, drinking forfeits. You're set to Soft.") + "</p>" +
      '<p class="sm">' + tr("Si tu rejoins, tu joues en Hard pour ce salon seulement. Ton appli reste en Soft après.", "If you join, you play in Hard for this room only. Your app stays in Soft afterwards.") + "</p>" +
      '<button class="btn acc" type="button" data-hdok>' + tr("Rejoindre en Hard", "Join in Hard") + '</button><button class="btn ghost" type="button" data-hdno>' + tr("Quitter le salon", "Leave the room") + "</button></div>";
  document.body.appendChild(el);
  const ok = $("[data-hdok]", el); if(ok) ok.addEventListener("click", () => { HD_OK[N.code] = 1; el.remove(); buzz(15); scheduleRender(); });
  $("[data-hdno]", el).addEventListener("click", () => { el.remove(); netLeave(); });
  return true;
}
async function netLeave(){
  BLOBS.clear();
  { const hg = document.getElementById("hd-gate"); if(hg) hg.remove(); }
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
  try{ alcTrackNet(G()); }catch(e){}
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
  // Rejoindre un salon Enfant fait passer le téléphone en mode Enfant (avec choix du code).
  if(g && !N.host && g.kid === true && (!myKid() || (!(store().kid || {}).pin && g.kpin))) inviteKid(typeof g.kpin === "string" ? g.kpin : null);
  // Rejoindre un salon Soft fait passer tout le téléphone en Soft, même après avoir quitté le salon.
  if(g && !N.host && g.hd === false && myHard()){
    persist({ hard: false }); renderMe(); if(HOME_REDRAW) HOME_REDRAW();
  }
  syncSoftClass();
  if(hdGate(g)) return;
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
    if(root.dataset.gid !== g.gid){ stopSounds(); root.dataset.gid = g.gid; root.dataset.key = ""; root.innerHTML = ""; buzz([30, 50, 30]); }
    $("#gm-title").textContent = def.name; $("#gm-gl").textContent = def.glyph || "";
    const ex = $("#gm-exit");
    const exKey = g.gid + (N.host ? "h" : "p");
    if(ex.dataset.key !== exKey){
      ex.dataset.key = exKey;
      quitButton(ex, N.host
        ? { label: tr("Arrêter la partie", "Stop the game"), title: tr("Arrêter la partie ?", "Stop the game?"), text: tr("Tout le monde revient au salon. La partie en cours sera perdue.", "Everyone goes back to the room. The current game will be lost."), ok: tr("Arrêter et revenir au salon", "Stop and go back to the room"), action: () => runHost(c => c.end({ title: def.name, lines: [tr("Partie arrêtée par l'hôte.", "Game stopped by the host.")] })) }
        : { label: tr("Quitter le salon", "Leave the room"), title: tr("Quitter le salon ?", "Leave the room?"), text: tr("Tu quittes la partie et le salon. Tu pourras revenir avec le code.", "You leave the game and the room. You can come back with the code."), ok: tr("Quitter le salon", "Leave the room"), action: netLeave });
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
  if(!roomHard()) softOpts(def, o);
  return o;
}
// Mode Soft : options 18+ coupées, paquets 18+ retirés (avec un paquet sans risque si plus rien n'est choisi).
function softOpts(def, o){
  let ctx = null;
  const valsOf = op => typeof op.values === "function" ? A(op.values(ctx || (ctx = makeCtx()))) : A(op.values);
  optList(def).forEach(op => {
    if(op.type === "toggle"){ if(op.hot) o[op.id] = false; return; }
    if(op.type !== "multi" && op.type !== "seg") return;
    const vals = valsOf(op), kidv = roomKid() && vals.some(v => v.kid), hot = vals.filter(v => v.hot || (kidv && !v.kid)).map(v => JSON.stringify(v.v));
    if(!hot.length) return;
    const ok = v => hot.indexOf(JSON.stringify(v)) < 0;
    if(op.type === "seg"){ if(!ok(o[op.id])){ const f = vals.find(v => ok(v.v)); if(f) o[op.id] = f.v; } return; }
    let sel = A(o[op.id]).filter(ok);
    if(!sel.length) sel = A(op.def).filter(ok);
    if(!sel.length){ const f = vals.find(v => ok(v.v) && v.count !== 0); if(f) sel = [f.v]; }
    o[op.id] = sel;
  });
}
function saveOpt(def, id, v){
  const all = store().opts || {}; all[def.id] = Object.assign({}, all[def.id] || {}, { [id]: v }); persist({ opts: all });
}
function optionsHTML(def, ctx, vals){
  return optList(def).map((op, i) => {
    if(op.type === "button") return '<button class="link" type="button" data-ob="' + i + '" style="align-self:flex-start">' + esc(op.label) + "</button>";
    if(op.hot && !roomHard()) return "";
    const allv = typeof op.values === "function" ? A(op.values(ctx)) : A(op.values), kidv = roomKid() && allv.some(v => v.kid);
    const values = allv.filter(v => (!v.hot || roomHard()) && (!kidv || v.kid));
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
/* Vote du prochain jeu : chaque joueur touche un jeu dans le salon, l'hôte voit les votes et garde le dernier mot.
   Le vote est dans la présence du joueur (CORE_X._vote = { id, r }) ; r = la partie d'avant, donc les votes s'effacent à chaque nouvelle partie. */
const voteRound = g => (g && g.gid) || "";
function voteCounts(g){
  const r = voteRound(g), c = {};
  namedPeers().forEach(p => { const v = (pres(p).x || {})._vote; if(v && v.r === r && SB.byId[v.id] && gameOk(SB.byId[v.id], roomKid(), roomHard()) && !isWip(SB.byId[v.id])) c[v.id] = (c[v.id] || 0) + 1; });
  return c;
}
const myVote = g => { const v = CORE_X._vote; return v && v.r === voteRound(g) ? v.id : ""; };
const topVote = c => { const ks = Object.keys(c).sort((a, b) => c[b] - c[a]); return ks.length && (ks.length < 2 || c[ks[0]] !== c[ks[1]]) ? ks[0] : ""; };
function salonDock(g, np){
  const d = $("#sa-dock"), def = g ? SB.byId[g.sel] : null;
  const vc = voteCounts(g), mv = myVote(g), tv = topVote(vc);
  const key = JSON.stringify([!!g, N.host, def ? def.id : "", np.length, vc, mv]);
  if(d.dataset.key === key) return;
  d.dataset.key = key;
  if(!g){ d.innerHTML = '<p class="wait">' + tr("Connexion à l'hôte…", "Connecting to the host…") + '</p>'; return; }
  if(N.host){
    d.innerHTML = def ? '<button class="btn acc acc-' + esc(def.id) + '" type="button" data-open>' + tr("Lancer " + esc(def.name), "Play " + esc(def.name)) + '</button>'
      : tv ? '<button class="btn acc acc-' + esc(tv) + '" type="button" data-top>' + tr("Choisir le jeu le plus voté : " + esc(SB.byId[tv].name) + " (" + vc[tv] + ")", "Pick the top vote: " + esc(SB.byId[tv].name) + " (" + vc[tv] + ")") + '</button><p class="wait">' + tr("Ou touche un autre jeu.", "Or tap another game.") + "</p>"
      : '<p class="wait">' + (Object.keys(vc).length ? tr("Égalité dans les votes : à toi de trancher !", "Tied votes: your call!") : tr("Touche un jeu pour le choisir. Les autres peuvent voter.", "Tap a game to pick it. The others can vote.")) + '</p>';
    const tp = $("[data-top]", d); if(tp) tp.addEventListener("click", () => { buzz(10); if(N.g && N.g.phase === "salon"){ $("#sa-panel").dataset.key = ""; hostSetG({ sel: tv }); renderSalon(G()); openSheet(); } });
    const b = $("[data-open]", d); if(b) b.addEventListener("click", () => { $("#sa-panel").dataset.key = ""; openSheet(); renderSalon(G()); });
  } else {
    d.innerHTML = def ? '<div class="pick acc-' + esc(def.id) + '"><span class="gl">' + esc(def.glyph || "") + '</span><span class="tx"><span class="eyebrow">' + tr("L'hôte a choisi", "The host picked") + '</span><b>' + esc(def.name) + '</b></span><button class="link" type="button" data-rules>' + tr("Règles", "Rules") + '</button></div><p class="wait">' + tr("L'hôte règle les options et lance la partie…", "The host is setting the options and starting the game…") + '</p>'
      : (mv ? '<div class="pick acc-' + esc(mv) + '"><span class="gl">' + esc(SB.byId[mv].glyph || "") + '</span><span class="tx"><span class="eyebrow">' + tr("Ton vote", "Your vote") + " · " + (vc[mv] || 1) + " vote" + ((vc[mv] || 1) > 1 ? "s" : "") + '</span><b>' + esc(SB.byId[mv].name) + '</b></span><button class="link" type="button" data-vrules>' + tr("Règles", "Rules") + "</button></div>" : "") +
        '<p class="wait">' + (mv ? tr("L'hôte voit les votes et choisit le jeu.", "The host picks the game and sees the votes.") : tr("Touche un jeu pour voter. L'hôte voit les votes et choisit.", "Tap a game to vote. The host sees the votes and picks.")) + '</p>';
    const r = $("[data-rules]", d); if(r) r.addEventListener("click", () => openRules(def));
    const vr = $("[data-vrules]", d); if(vr) vr.addEventListener("click", () => openRules(SB.byId[mv]));
  }
}
function renderSalon(g){
  accent("");
  show("salon");
  $("#sa-code").textContent = N.code; renderQR(); gSalonBar(g);
  { const mp = $("#sa-mode"), hd = roomHard(), kd = roomKid(); if(mp){ mp.className = "modepill " + (kd ? "kid" : hd ? "hard" : "soft") + (N.host ? " can" : ""); mp.textContent = (kd ? tr("Enfant", "Kids") : hd ? "Hard" : "Soft") + (N.host && !myKid() ? " ⇄" : ""); mp.setAttribute("aria-label", N.host ? tr("Mode du salon : " + (hd ? "Hard" : "Soft") + ". Touche pour passer en " + (hd ? "Soft" : "Hard"), "Room mode: " + (hd ? "Hard" : "Soft") + ". Tap to switch to " + (hd ? "Soft" : "Hard")) : tr("Mode du salon : ", "Room mode: ") + (hd ? "Hard" : "Soft"));
    if(!mp.dataset.ok){ mp.dataset.ok = "1"; mp.addEventListener("click", () => {
      if(!N.nr) return;
      if(!N.host){ toast(tr("C'est l'hôte qui choisit le mode du salon.", "The host picks the room mode.")); return; }
      if(!N.g) return;
      if(myKid()){ toast(tr("Mode Enfant : le salon reste en mode Enfant. Pour en sortir, entre le code dans ton profil.", "Kids mode: the room stays in Kids. To change it, go to your profile with the code.")); return; }
      const cur = N.g.kid === true ? "kid" : N.g.hd === false ? "soft" : "hard", nx = { hard: "soft", soft: "kid", kid: "hard" }[cur]; buzz(12);
      const after = () => { const pn = $("#sa-panel"); if(pn) pn.dataset.key = ""; const tl = $("#sa-tiles"); if(tl) tl.dataset.key = ""; renderQR(); };
      if(nx === "kid"){ hostKidPrompt(pin => { hostSetG({ hd: false, kid: true, kpin: pin }); toast(tr("Salon en mode Enfant : seulement les jeux tout public.", "Room in Kids mode: family-friendly games only.")); after(); }); return; }
      hostSetG({ hd: nx === "hard", kid: false, kpin: null });
      toast({ hard: tr("Salon en mode Hard : contenu 18+ et gages avec alcool.", "Room in Hard mode: 18+ content and drinking forfeits."), soft: tr("Salon en mode Soft : pas de contenu 18+ ni d'alcool.", "Room in Soft mode: no 18+ content, no alcohol."), kid: tr("Salon en mode Enfant : seulement les jeux tout public.", "Room in Kids mode: family-friendly games only.") }[nx]);
      const pn = $("#sa-panel"); if(pn) pn.dataset.key = ""; const tl = $("#sa-tiles"); if(tl) tl.dataset.key = "";
    }); } mp.title = hd ? tr("Salon en mode Hard : contenu 18+ et gages avec alcool", "Hard room: 18+ content and drinking forfeits") : tr("Salon en mode Soft : pas de contenu 18+ ni d'alcool", "Soft room: no 18+ content, no alcohol"); } }
  const np = namedPeers();
  const hostId = N.host ? N.nr.me() : N.nr.hostId();
  $("#sa-count").textContent = tr(plural(np.length, "joueur") + " dans le salon", plural2(np.length, "joueur", "joueurs", "player") + " in the room");
  const roster = np.map((p, i) => { const nm = clean(pres(p).name, 16); const ph = gPhotoOf(p); return '<li' + (p.sameTab ? ' class="me"' : "") + '><span class="av" style="--c:' + AVC[i % AVC.length] + '" aria-hidden="true">' + (ph ? phHTML(ph) : esc(nm.slice(0, 1).toUpperCase())) + '</span><span class="nm">' + esc(nm) + (p.sameTab ? tr(" · toi", " · you") : "") + "</span>" +
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
  const vc = voteCounts(g), mv = myVote(g);
  const tKey = (N.host ? "h" : "p") + "|" + sel + "|" + np.length + "|" + FSEL.salon + "|" + roomHard() + roomKid() + JSON.stringify(vc) + mv;
  const fb = $("#sa-filter");
  if(fb.dataset.ok !== String(roomHard()) + roomKid()){ fb.dataset.ok = String(roomHard()) + roomKid(); bindFilter(fb, "salon", () => { tiles.dataset.key = ""; renderSalon(G()); }); }
  if(tiles.dataset.key !== tKey){
    tiles.dataset.key = tKey;
    tiles.innerHTML = SB.games.filter(d => (inFilter(d, FSEL.salon) && gameOk(d, roomKid(), roomHard())) || d.id === sel).sort((a, b) => isWip(a) - isWip(b)).map(d => {
      const n = np.length, ok = n >= d.min && (!d.max || n <= d.max);
      const range = rangeTxt(d);
      const meta = (ok ? esc(range) : '<span class="bad">' + esc(range) + "</span>") + (d.hot && roomHard() ? " · 18+" : "") + (vc[d.id] ? ' <b class="vcount">' + vc[d.id] + " vote" + (vc[d.id] > 1 ? "s" : "") + "</b>" : "");
      return tileHTML(d, { pressed: N.host ? d.id === sel : d.id === mv, metaHTML: meta });
    }).join("");
    $$(".tile", tiles).forEach(b => b.addEventListener("click", () => {
      if(!N.host){
        // Vote pour le prochain jeu (toucher encore pour retirer son vote).
        const id = b.dataset.id, gg = G(), cur = myVote(gg);
        if(cur === id){ delete CORE_X._vote; toast(tr("Vote retiré", "Vote removed")); }
        else { CORE_X._vote = { id, r: voteRound(gg) }; toast(tr("Tu votes pour " + SB.byId[id].name, "You voted for " + SB.byId[id].name)); }
        buzz(8); SB.refreshExtras(); tiles.dataset.key = ""; $("#sa-dock").dataset.key = ""; renderSalon(gg); return;
      }
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
  closeRulesOv();
  accent(""); keepAwake(false); L.def = null; L.tick = null;
  const gs0 = $("#gage-sheet"); if(gs0) gs0.remove();
  renderLLPlayers();
  renderLLTiles();
  const lt = $("#ll-tally"), th = tallyHTML(LT.tally, LT.played);
  if(lt){ lt.hidden = !th; lt.innerHTML = th; }
  gLocalBar();
  show("llist");
}
/* Les joueurs, saisis une fois sur la première page « Un seul téléphone » : chaque jeu les reprend directement. */
const llNames = () => { const out = []; A(store().localNames).forEach(x => { const n = clean(x, 16); if(n && !out.some(o => o.toLowerCase() === n.toLowerCase())) out.push(n); }); return out.slice(0, 20); };
const llFits = (lp, n) => n >= lp.min && (!lp.max || n <= lp.max);
function renderLLPlayers(focus){
  const t = $("#ll-tiles"); if(!t) return;
  let el = $("#ll-players");
  if(!el){ el = document.createElement("div"); el.id = "ll-players"; el.className = "field"; t.parentNode.insertBefore(el, $("#ll-gages") || t); }
  const names = llNames();
  el.innerHTML = '<span class="eyebrow">' + tr("Les joueurs", "Players") + (names.length ? " (" + names.length + ")" : "") + "</span>" +
    '<div class="llp">' + names.map((n, i) => '<span class="llp-c">' + esc(n) + '<button type="button" data-llx="' + i + '" aria-label="' + tr("Retirer ", "Remove ") + esc(n) + '">×</button></span>').join("") + "</div>" +
    '<div class="row"><input class="txt" id="ll-new" maxlength="16" autocomplete="off" placeholder="' + (names.length ? tr("Ajouter un joueur", "Add a player") : tr("Prénom du premier joueur", "First player's name")) + '"><button class="btn ghost" type="button" data-lladd style="flex:none; width:auto; padding:0 18px">' + tr("Ajouter", "Add") + "</button></div>" +
    (names.length ? "" : '<p class="sm" style="margin:0">' + tr("Entre vos prénoms une fois : tous les jeux les reprennent.", "Enter your names once: every game uses them.") + "</p>");
  const inp = $("#ll-new", el);
  const add = () => {
    const n = clean(inp.value, 16); if(!n) return;
    const cur = llNames();
    if(cur.some(o => o.toLowerCase() === n.toLowerCase())){ toast(tr("« " + n + " » est déjà dans la liste.", "“" + n + "” is already in the list.")); return; }
    if(cur.length >= 20){ toast(tr("20 joueurs maximum.", "20 players max.")); return; }
    buzz(6); persist({ localNames: cur.concat([n]) }); renderLLPlayers(true); renderLLTiles();
  };
  $("[data-lladd]", el).addEventListener("click", add);
  inp.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); add(); } });
  $$("[data-llx]", el).forEach(b => b.addEventListener("click", () => { const cur = llNames(); cur.splice(+b.dataset.llx, 1); persist({ localNames: cur }); buzz(6); renderLLPlayers(); renderLLTiles(); }));
  if(focus) setTimeout(() => { try{ inp.focus(); }catch(e){} }, 30);
}
function renderLLTiles(){
  const t = $("#ll-tiles"), n = llNames().length;
  t.innerHTML = SB.games.filter(d => d.local && gameOk(d, myKid(), myHard())).sort((a, b) => isWip(a) - isWip(b)).map(d => {
    const lp = d.local.players;
    const need = lp && n && !llFits(lp, n) ? ' <b class="llp-need">' + (n < lp.min ? tr(lp.min + " joueurs min.", lp.min + " players min.") : tr(lp.max + " joueurs max.", lp.max + " players max.")) + "</b>" : "";
    const meta = (lp ? (lp.min === 1 ? tr("Seul(e) ou jusqu'à " + lp.max + " · bots", "Solo or up to " + lp.max + " · bots") : rangeTxt(lp)) : tr("Tout le groupe", "Whole group")) + (d.hot && myHard() ? " · 18+" : "") + need;
    return tileHTML(d, { metaHTML: meta });
  }).join("");
  $$(".tile", t).forEach(b => b.addEventListener("click", () => {
    const d = SB.byId[b.dataset.id], lp = d.local.players, names = llNames();
    if(!lp){ startLocal(d, []); return; }
    // Les joueurs sont déjà entrés et le nombre convient : on lance directement.
    if(llFits(lp, names.length)){ startLocal(d, names); return; }
    openLocalPlayers(d);
  }));
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
  const n0 = llNames().length, er = $("#lp-err");
  er.hidden = !n0 || llFits(lp, n0);
  if(!er.hidden) er.textContent = n0 < lp.min ? tr("Ce jeu se joue à " + lp.min + " joueurs minimum : ajoute des prénoms.", "This game needs at least " + lp.min + " players: add some names.") : tr("Ce jeu se joue à " + lp.max + " joueurs maximum : retire des prénoms pour cette partie.", "This game is for " + lp.max + " players max: remove some names for this game.");
  renderLocalPlayers();
  show("lplayers");
}
function renderLocalPlayers(){
  const lp = LP.def.local.players, box = $("#lp-list");
  box.innerHTML = "";
  LP.names.forEach((nm, i) => {
    const row = document.createElement("div"); row.className = "prow";
    const inp = document.createElement("input"); inp.className = "txt"; inp.id = "lp-" + i; inp.value = nm; inp.maxLength = 16; inp.placeholder = tr("Joueur ", "Player ") + (i + 1); inp.autocomplete = "off";
    inp.setAttribute("aria-label", tr("Prénom du joueur ", "Player name ") + (i + 1));
    inp.addEventListener("input", () => { LP.names[i] = inp.value; persist({ localNames: LP.names }); });
    const x = document.createElement("button"); x.type = "button"; x.className = "x"; x.textContent = "×"; x.setAttribute("aria-label", tr("Retirer ce joueur", "Remove this player"));
    x.disabled = LP.names.length <= lp.min; if(x.disabled) x.style.opacity = .35;
    x.addEventListener("click", () => { LP.names.splice(i, 1); persist({ localNames: LP.names }); renderLocalPlayers(); });
    row.append(inp, x); box.append(row);
  });
  $("#lp-add").hidden = !!lp.max && LP.names.length >= lp.max;
}
function startLocal(def, names){
  L.def = def; L.tick = null; syncSoftClass();
  trail("Un seul téléphone : " + def.id + " · " + plural(A(names).length, "joueur"));
  accent(def.id); keepAwake(true);
  $("#lc-title").textContent = def.name; $("#lc-gl").textContent = def.glyph || "";
  const ex = $("#lc-exit");
  quitButton(ex, { label: tr("Quitter la partie", "Quit the game"), title: tr("Quitter la partie ?", "Quit the game?"), text: tr("Tu reviens à la liste des jeux. La partie en cours sera perdue.", "You go back to the game list. The current game will be lost."), ok: tr("Quitter la partie", "Quit the game"), action: () => api.exit() });
  const root = $("#local-root"); root.innerHTML = ""; root.dataset.key = "";
  show("local");
  let won = false;
  const api = { names: names.slice(), u: SB.u, exit: openLocalList, onTick(fn){ L.tick = fn; }, again(){ startLocal(def, names); },
    // Le jeu signale les gagnants de la partie (noms) : ça alimente le classement de la soirée.
    win(list){ if(won) return; won = true; LT.tally = addTally(LT.tally, list); LT.played++;
      const w = A(list); if(def.gagesEnd !== false) gLocalApply(def.id, names, w.map(n => ({ id: n, ev: "_win" })).concat(names.filter(n => w.indexOf(n) < 0).map(n => ({ id: n, ev: "_lose" }))), "end" + rid()); },
    // Gages d'une manche : [{ id: prénom, ev }], clé unique par manche.
    gage(list, key){ gLocalApply(def.id, names, list, key); } };
  stopSounds();
  try{ def.local.start(root, api); }catch(e){ console.error(e); }
}

/* =================== Gages (alcool ou sans alcool, entièrement réglables) ===================
   - L'hôte règle les gages du salon (unité, intensité, plafond, rappel d'eau, joker, déclencheurs par jeu, gages perso).
   - Chaque téléphone a son profil : « je bois » ou « sans alcool », et son propre plafond.
   - Les jeux déclarent leurs déclencheurs (def.gages = [{ ev, label, kind: "boit"|"distribue"|"tous", n }]) et appellent
     ctx.gage([{ id, ev }], clé) en réseau (chez l'hôte) ou api.gage([{ id: nom, ev }], clé) sur un seul téléphone.
   - Fin de partie : tous les jeux, le gagnant distribue et les autres boivent (réglable).
   - Un panneau « Gages de la manche » s'affiche alors sur chaque téléphone. */
const GDEF = { on: true, unit: "gorgee", level: "classique", cap: 15, capOff: false, water: 8, joker: true, trig: {}, glv: {}, custom: [] };
// Noms des niveaux de gages (« perso » : ancien réglage, traité comme Moyen).
// Plafond conseillé selon l'unité et le niveau : il change tout seul quand on change de niveau ou d'unité (on peut l'ajuster après).
const GCAP = { gorgee: { chill: 8, classique: 15, chaud: 30 }, shot: { chill: 3, classique: 5, chaud: 10 }, culsec: { chill: 1, classique: 2, chaud: 4 } };
const gCapFor = (unit, level) => (GCAP[unit] || GCAP.gorgee)[level === "chill" || level === "chaud" ? level : "classique"];
// Verre d'eau conseillé (toutes les N unités bues) : plus le niveau est fort, plus il revient souvent.
const GWATER = { gorgee: { chill: 10, classique: 8, chaud: 6 }, shot: { chill: 4, classique: 3, chaud: 2 }, culsec: { chill: 2, classique: 1, chaud: 1 } };
const gWaterFor = (unit, level) => (GWATER[unit] || GWATER.gorgee)[level === "chill" || level === "chaud" ? level : "classique"];
const GLV_NAME = () => ({ off: tr("Aucun gage", "No forfeits"), chill: tr("Basique", "Basic"), classique: tr("Moyen", "Medium"), chaud: "Hard", perso: tr("Moyen", "Medium") });
const GMULT = { chill: .5, classique: 1, chaud: 2, perso: 1 };
const GEND = [
  { ev: "_win", label: tr("Gagnant(e) de la partie", "Game winner"), kind: "distribue", n: 3 },
  { ev: "_lose", label: tr("Tous les autres joueurs", "Everyone else"), kind: "boit", n: 1 }
];
const GTASKS = { fr: ["Fais 10 squats", "Chante le refrain de ton choix", "Fais un compliment sincère à chaque joueur", "Parle avec un accent pendant 2 minutes", "Imite quelqu'un du groupe, les autres devinent", "Danse 20 secondes sans musique", "Raconte ta pire honte en 30 secondes", "Fais 10 pompes (ou 20 sur les genoux)", "Montre la dernière photo de ta galerie", "Laisse le groupe choisir ta photo de profil pour 1 h", "Tiens la planche 30 secondes", "Envoie « tu me manques » au 3e contact de ta liste", "Mange une cuillère de moutarde ou de sauce piquante", "Parle à la 3e personne jusqu'à la prochaine manche"],
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
const gLim = gp => (gp.drink === "sans" || gp.nolim ? 0 : gp.lim[gp.drink] != null ? +gp.lim[gp.drink] : DRINKS[gp.drink].def);
// Combien de « verres » de sa boisson représente 1 gage dans l'unité de l'hôte.
function gGlass(S, drink){
  const d = DRINKS[drink] || DRINKS.biere;
  if(S.unit === "culsec") return 1;
  if(S.unit === "shot") return drink === "fort" ? 1 : Math.min(1, 3 / d.sips);
  return 1 / d.sips;
}
const gVerres = (n, drink) => { const d = DRINKS[drink] || DRINKS.biere, v = Math.round(n * 10) / 10; return String(v).replace(".", tr(",", ".")) + " " + (v > 1 ? d.glasses[1] : d.glasses[0]); };
const gSettings = s => Object.assign({}, GDEF, s && typeof s === "object" ? s : {}, { trig: Object.assign({}, (s && s.trig) || {}), glv: Object.assign({}, (s && s.glv) || {}), custom: A(s && s.custom).map(x => clean(x, 120)).filter(Boolean).slice(0, 40) });
const gUnit = (S, n) => { const u = { gorgee: [tr("gorgée", "sip"), tr("gorgées", "sips")], shot: ["shot", "shots"], culsec: [tr("cul-sec", "chug"), tr("culs-secs", "chugs")] }[S.unit] || ["", ""]; return n + " " + (n === 1 ? u[0] : u[1]); };
function gEvents(gameId){ const d = SB.byId[gameId]; return A(d && d.gages).concat(GEND); }
function gBase(S, gameId, ev){ const k = gameId + ":" + ev; if(S.trig[k] != null) return Math.max(0, Math.min(10, +S.trig[k] || 0)); const e = gEvents(gameId).find(x => x.ev === ev); return e ? e.n : 0; }
// Niveau d'un jeu : le sien s'il en a un (« off » = aucun gage), sinon le niveau choisi pour tous les jeux.
const gLevel = (S, gameId) => ((S.glv || {})[gameId] || S.level || "classique");
function gAmount(S, gameId, ev){ const lv = gLevel(S, gameId); if(lv === "off") return 0; const b = gBase(S, gameId, ev); return b > 0 ? Math.max(1, Math.round(b * (GMULT[lv] || 1))) : 0; }
function gTask(S){
  const base = A(S.custom).length ? A(S.custom) : GTASKS[LANG === "en" ? "en" : "fr"];
  // Mode Enfant : pas de gages autour du téléphone, des contacts ou de la honte.
  const kid = roomKid() ? base.filter(t => SB.kidOk(t) && !/photo|contact|galerie|gallery|text|envoie|honte|embarrass|moutarde|mustard|piquante|hot sauce/i.test(t)) : base;
  const pool = kid.length ? kid : base; return pool[Math.floor(Math.random() * pool.length)] || "…";
}
const gT = (t, name) => { t = Object.assign({}, t || {}); t[name] = Object.assign({ s: 0, g: 0, t: 0, w: 0, v: 0 }, t[name] || {}); return t; };
// Calcule les gages d'une liste d'événements. players : [{ id, name, alc, cap }] ; tally : { nom: { s, g, t, w } }.
function gCompute(S, gameId, list, players, tally){
  const items = []; let T = Object.assign({}, tally || {});
  const P = id => players.find(p => p.id === id);
  const drink = (p, n, why) => {
    if(!p || n <= 0) return;
    T = gT(T, p.name); const cur = T[p.name].s, g1 = gGlass(S, p.drink), v = +T[p.name].v || 0;
    const byLim = p.lim > 0 ? Math.floor((p.lim - v) / g1 + 1e-9) : Infinity;
    const nn = !p.alc ? 0 : Math.min(n, (S.capOff ? Infinity : S.cap) - cur, byLim);
    if(nn <= 0){ T[p.name].t++; items.push({ t: "task", who: p.id, name: p.name, txt: gTask(S), why }); return; }
    T[p.name].s = cur + nn; T[p.name].v = Math.round((v + nn * g1) * 100) / 100;
    items.push({ t: "drink", who: p.id, name: p.name, n: nn, why });
    if(S.water > 0 && Math.floor(cur / S.water) < Math.floor((cur + nn) / S.water)) items.push({ t: "water", who: p.id, name: p.name });
  };
  A(list).forEach(e => {
    const ed = gEvents(gameId).find(x => x.ev === e.ev); if(!ed) return;
    const times = e.x != null ? Math.max(0, Math.floor(+e.x || 0)) : 1;
    const lv = gLevel(S, gameId);
    const n = (e.n != null ? (lv === "off" ? 0 : Math.max(0, Math.round(+e.n * (GMULT[lv] || 1)))) : gAmount(S, gameId, e.ev)) * times; if(!n) return;
    const why = e.why || ed.label;
    if(ed.kind === "tous") players.forEach(p => drink(p, n, why));
    else if(ed.kind === "distribue"){ const p = P(e.id); if(p && players.length > 1 && players.some(x => x.alc && x.id !== p.id)) items.push({ t: "give", who: p.id, name: p.name, n, why, done: 0 }); }
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
  const r = gCompute(Object.assign({}, S, { level: "perso", glv: {} }), gameId, [], players, tally); let T = r.tally;
  const items = A(q.items).map(x => (x === it ? Object.assign({}, x, { done: 1 }) : x));
  list.forEach(([id, k]) => { const c = gCompute(Object.assign({}, S, { level: "perso", glv: {}, trig: Object.assign({}, S.trig, { [gameId + ":_give"]: k }) }), gameId, [{ id, ev: "_give", n: k, why: tr("de la part de ", "from ") + it.name }], players, T); T = c.tally; c.items.forEach(x => items.push(x)); });
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
    else if(x.t === "task"){ t = esc(x.name) + " : " + esc(x.txt); sub = (roomHard() ? tr("Gage sans alcool", "No-alcohol forfeit") : tr("Gage", "Forfeit")) + (x.why ? " · " + esc(x.why) : ""); }
    else if(x.t === "give") t = x.done ? tr(esc(x.name) + " a distribué " + gUnit(S, x.n), esc(x.name) + " handed out " + gUnit(S, x.n)) : tr(esc(x.name) + " distribue " + gUnit(S, x.n), esc(x.name) + " hands out " + gUnit(S, x.n));
    else if(x.t === "water"){ t = tr(esc(x.name) + " : petit verre d'eau ?", esc(x.name) + ": time for a glass of water?"); sub = tr("Rappel", "Reminder"); }
    else if(x.t === "joker"){ t = tr(esc(x.name) + " utilise son joker : un verre d'eau", esc(x.name) + " uses their joker: a glass of water"); sub = ""; }
    return '<li class="g-' + x.t + (mine ? " gme" : "") + '"><span class="av">' + esc(String(x.name || "?").slice(0, 1).toUpperCase()) + '</span><span class="tx"><b>' + t + "</b>" + (sub ? '<span class="sm">' + sub + "</span>" : "") + "</span>" +
      (x.t === "drink" ? '<span class="n">' + x.n + "</span>" : "") + "</li>";
  };
  let h = '<div class="gsheet-card" role="dialog" aria-label="' + tr("Gages de la manche", "Round forfeits") + '"><div class="gsheet-h"><b>' + tr("Gages de la manche", "Round forfeits") + "</b><span class=\"sm\">" + esc(roomHard() ? (GLV_NAME()[S.level] || "") : "Soft") + "</span></div>" +
    '<ul class="gsheet-l">' + items.map(line).join("") + "</ul>";
  if(myGive){
    const others = A(opts.players).filter(p => p.id !== myGive.who);
    h += '<div class="gsheet-give"><b>' + (me == null ? tr(esc(myGive.name) + " distribue " + gUnit(S, myGive.n), esc(myGive.name) + " hands out " + gUnit(S, myGive.n)) : tr("Tu distribues " + gUnit(S, myGive.n), "You hand out " + gUnit(S, myGive.n))) + '</b><span class="sm">' +
      (used < myGive.n ? tr("Touche un prénom à chaque appui. Il en reste " + (myGive.n - used) + ".", "Tap names, one per tap. " + (myGive.n - used) + " left.") : tr("Tout est distribué.", "All handed out.")) + '</span><div class="gsheet-pp">' +
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
  return ids.map(id => { const p = peerById(id), x = pres(p).x || {}, gp = x._gp || {}, r = list.find(r => String(r[0]) === id); const pf = gProf(gp); return { id, name: clean((r && r[1]) || pres(p).name, 16) || "Joueur", alc: roomHard() && pf.drink !== "sans", drink: roomHard() ? pf.drink : "sans", lim: gLim(pf) }; });
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
function gLocalDrink(n){ if(!myHard()) return "sans"; const st = store(), m = st.gagesDrinks || {}; if(m[n]) return m[n]; return A(st.gagesSober).indexOf(n) >= 0 ? "sans" : "biere"; }
// Sur un seul téléphone : la limite de chaque joueur (par boisson), ou « sans limite ». 0 = pas de limite.
function gLocalLimCfg(n){ const m = (store().gagesLims || {})[n]; return { lim: Object.assign({}, m && m.lim), nolim: !!(m && m.nolim) }; }
function gLocalLim(n, dk){ if(dk === "sans" || !DRINKS[dk]) return 0; const c = gLocalLimCfg(n); if(c.nolim) return 0; return c.lim[dk] != null ? Math.max(1, Math.min(20, +c.lim[dk] || 1)) : DRINKS[dk].def; }
function gLocalLimSave(n, patch){ const all = Object.assign({}, store().gagesLims || {}); all[n] = Object.assign(gLocalLimCfg(n), patch); persist({ gagesLims: all }); }
function gLocalSettings(){ const st = store(); return gSettings(st.gages || st.gagesLocal); }
function gSaveSettings(s){ persist({ gages: s }); }
function gLocalApply(gameId, names, list, key, rerender){
  const S = gLocalSettings(); if(!S.on) return;
  if(key && LGG.key === key) return; LGG.key = key || "";
  const players = names.map(n => { const d = gLocalDrink(n); return { id: n, name: n, alc: d !== "sans", drink: d, lim: gLocalLim(n, d) }; });
  const r = gCompute(S, gameId, list, players, LGG.tally); alcTrackLocal(LGG.tally, r.tally); LGG.tally = r.tally;
  if(!r.items.length) return;
  const q = { id: rid(), game: gameId, items: r.items };
  const show2 = () => gageSheet(q, { S, me: null, players,
    jokerOk: () => false,
    onGive: (it, to) => { const g2 = gGive(S, gameId, q, it.who, to, players, LGG.tally); if(g2){ alcTrackLocal(LGG.tally, g2.tally); LGG.tally = g2.tally; q.items = g2.items; $("#gage-sheet").dataset.key = ""; show2(); } } });
  show2();
}

/* ---------- Réglages (hôte ou un seul téléphone) et profil ---------- */
const gRefresh = () => { try{ renderMe(); if(!$("#s-llist").hidden) gLocalBar(); }catch(e){} };
function gSettingsPage(get, set, editable, tally, onReset){
  SB.page(tr("Gages", "Forfeits"), root => {
    // Vues : « main » (réglages), « jeux » (déclencheurs par jeu), « fin » (fin de partie), « sans » (gages sans alcool).
    let view = "main", openG = "";
    const TITLES = () => ({ main: tr("Gages", "Forfeits"), jeux: tr("Déclencheurs", "Triggers"), fin: tr("Fin de partie", "End of game"), sans: tr("Gages sans alcool", "No-alcohol forfeits") });
    const go = v => { view = v; buzz(6); draw(); try{ $("#s-page").scrollTop = 0; window.scrollTo(0, 0); }catch(e){} };
    SB._pageBack = () => { if(view === "main") return false; go("main"); return true; };
    const CHEV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    const backRow = () => ""; // le bouton retour de l'en-tête ramène déjà au menu
    const LV = ["chill", "classique", "chaud"], lvOf = S => (LV.indexOf(S.level) >= 0 ? S.level : "classique");
    const gGames = () => SB.games.filter(d => A(d.gages).some(e => !e.hidden));
    const gameKeys = (S, gid) => Object.keys(S.trig).filter(k => k.indexOf(gid + ":") === 0 && k.slice(gid.length + 1).charAt(0) !== "_");
    const apart = (S, gid) => !!(S.glv || {})[gid] || gameKeys(S, gid).length > 0;
    const draw = () => {
      const S = get(), dis = editable ? "" : " disabled", hard = roomHard(), GN = GLV_NAME(), lv = lvOf(S);
      const evsOf = gid => A((SB.byId[gid] || {}).gages).filter(e => !e.hidden && (hard || e.kind !== "distribue"));
      const kindTxt = k => (!hard ? (k === "tous" ? tr("tout le monde a un gage", "everyone gets a forfeit") : tr("a un gage", "gets a forfeit")) : k === "distribue" ? tr("distribue", "hands out") : k === "tous" ? tr("tout le monde boit", "everyone drinks") : tr("boit", "drinks"));
      const amtTxt = n => (!n ? tr("désactivé", "off") : hard ? gUnit(S, n) : tr("un gage", "a forfeit"));
      const stepper = (attr, n) => '<button type="button" class="gs-b" ' + attr + ' data-d="-1" aria-label="' + tr("Moins", "Less") + '"' + dis + '>−</button><b class="gs-n gd-n">' + esc(amtTxt(n)) + '</b><button type="button" class="gs-b" ' + attr + ' data-d="1" aria-label="' + tr("Plus", "More") + '"' + dis + ">+</button>";
      const seg = (attr, cur, opts) => '<div class="seg">' + opts.map(o => '<button type="button" ' + attr + '="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '"' + dis + ">" + o[1] + "</button>").join("") + "</div>";
      const sw = (attr, on, label) => '<button type="button" class="gs-sw" ' + attr + ' aria-pressed="' + !!on + '" aria-label="' + esc(label) + '"' + dis + "><i></i></button>";
      const step = (k, label, sub) => '<div class="gs-row"><span class="tx"><b>' + label + '</b><span class="sm">' + sub + '</span></span><button type="button" class="gs-b" data-gst="' + k + '" data-d="-1" aria-label="' + tr("Moins", "Less") + '"' + dis + '>−</button><b class="gs-n">' + S[k] + '</b><button type="button" class="gs-b" data-gst="' + k + '" data-d="1" aria-label="' + tr("Plus", "More") + '"' + dis + ">+</button></div>";
      const link = (v, title, sub) => '<div class="gs-row"><button type="button" class="pf-go" data-gview="' + v + '"><span class="t">' + title + '<span class="sm" style="display:block; font-weight:600">' + sub + "</span></span>" + CHEV + "</button></div>";
      let h = '<div class="gs pf2">';
      if(view === "main"){
        const nApart = gGames().filter(d => apart(S, d.id)).length, unitWord = gUnit(S, 2).replace(/^2 /, "");
        h += '<div class="gs-box"><div class="gs-row"><span class="tx"><b>' + tr("Gages activés", "Forfeits on") + '</b><span class="sm">' + (hard ? tr("Les jeux affichent les gages à la fin des manches. Chacun peut jouer sans alcool.", "Games show forfeits at the end of rounds. Anyone can play without alcohol.") : tr("Les jeux donnent des gages à la fin des manches : défis, chansons, pompes…", "Games give forfeits at the end of rounds: dares, songs, push-ups…")) + "</span></span>" + sw("data-gon", S.on, tr("Gages activés", "Forfeits on")) + "</div></div>" +
          (editable ? "" : '<p class="note-box">' + tr("Seul l'hôte modifie ces réglages.", "Only the host can change these settings.") + "</p>") +
          (hard ? '<div class="field"><span class="eyebrow">' + tr("On boit en", "Drink in") + "</span>" + seg("data-gunit", S.unit, [["gorgee", tr("Gorgées", "Sips")], ["shot", "Shots"], ["culsec", tr("Culs-secs", "Chugs")]]) +
            '<p class="sm pf-desc">' + ({ gorgee: tr("« Bob boit 2 » = deux gorgées de sa boisson. Le plus doux.", "“Bob drinks 2” = two sips of their drink. The gentlest."), shot: tr("« Bob boit 2 » = deux shots, ou 3 gorgées de sa boisson par shot s'il ne boit pas d'alcool fort.", "“Bob drinks 2” = two shots, or 3 sips of their drink per shot if they don't drink spirits."), culsec: tr("« Bob boit 2 » = finir son verre deux fois. Très fort.", "“Bob drinks 2” = finish their drink twice. Very strong.") }[S.unit] || "") + "</p></div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Niveau pour tous les jeux", "Level for all games") + "</span>" + seg("data-glevel", lv, LV.map(k => [k, GN[k]])) +
            '<p class="sm pf-desc">' + ({ chill: tr("Gages légers : environ moitié moins à boire. Idéal pour commencer la soirée.", "Light forfeits: about half as much. Great to start the night."), classique: tr("Les gages prévus par chaque jeu, tels quels.", "Each game's forfeits as they are."), chaud: tr("Tous les gages sont doublés. Pour les soirées qui dérapent.", "All forfeits doubled. For wild nights.") }[lv]) +
            tr(" Un jeu peut avoir son propre niveau dans « Déclencheurs par jeu ».", " A game can have its own level in “Triggers by game”.") + "</p></div>" +
          (hard ? '<div class="field"><span class="eyebrow">' + tr("Garde-fous", "Safety") + '</span><div class="gs-box">' +
            (S.capOff ? "" : step("cap", tr("Plafond par joueur", "Cap per player"), tr(unitWord.charAt(0).toUpperCase() + unitWord.slice(1) + " max par joueur pour la soirée", "Max " + unitWord + " per player tonight") + (S.cap === gCapFor(S.unit, lv) ? tr(" · conseillé pour le niveau " + GN[lv], " · suggested for " + GN[lv]) : tr(" · conseillé : " + gCapFor(S.unit, lv) + " au niveau " + GN[lv], " · suggested: " + gCapFor(S.unit, lv) + " at " + GN[lv])) + tr(". La limite de chacun, dans son profil, compte aussi.", ". Each player's own limit also applies."))) +
            '<div class="gs-row"><span class="tx"><b>' + tr("Sans plafond", "No cap") + "</b>" + (S.capOff ? '<span class="sm">' + tr("Seule la limite de chacun, dans son profil, compte.", "Only each player's own limit applies.") + "</span>" : "") + "</span>" + sw("data-gcapoff", S.capOff, tr("Sans plafond", "No cap")) + "</div>" +
            step("water", tr("Verre d'eau", "Water"), (S.water ? tr("Proposé " + (S.unit === "gorgee" ? "toutes" : "tous") + " les " + S.water + " " + unitWord, "Suggested every " + S.water + " " + unitWord) : tr("Jamais", "Never")) + (S.water === gWaterFor(S.unit, lv) ? tr(" · conseillé pour le niveau " + GN[lv], " · suggested for " + GN[lv]) : tr(" · conseillé : " + (S.unit === "gorgee" ? "toutes" : "tous") + " les " + gWaterFor(S.unit, lv) + " en " + GN[lv], " · suggested: every " + gWaterFor(S.unit, lv) + " at " + GN[lv]))) +
            '<div class="gs-row"><span class="tx"><b>' + tr("Joker eau", "Water joker") + '</b><span class="sm">' + tr("Une fois par partie, de l'eau à la place d'un gage", "Once per game, water instead of a forfeit") + "</span></span>" + sw("data-gjk", S.joker, tr("Joker eau", "Water joker")) + "</div></div></div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Dans les jeux", "In the games") + '</span><div class="gs-box">' +
            link("jeux", tr("Déclencheurs par jeu", "Triggers by game"), nApart ? tr(nApart + (nApart > 1 ? " jeux à part" : " jeu à part") + ", les autres au niveau " + GN[lv], nApart + " game" + (nApart > 1 ? "s" : "") + " set apart, the rest at " + GN[lv]) : tr("Tous au niveau " + GN[lv], "All at " + GN[lv])) +
            link("fin", tr("Fin de partie", "End of game"), hard ? tr("Le (la) gagnant(e) distribue " + gBase(S, (SB.games[0] || {}).id, "_win") + " · les autres boivent " + gBase(S, (SB.games[0] || {}).id, "_lose"), "Winner hands out " + gBase(S, (SB.games[0] || {}).id, "_win") + " · the others drink " + gBase(S, (SB.games[0] || {}).id, "_lose")) : tr("Les perdants ont un gage", "Losers get a forfeit")) +
            link("sans", hard ? tr("Gages sans alcool", "No-alcohol forfeits") : tr("Les gages", "The forfeits"), A(S.custom).length ? tr(A(S.custom).length + " perso", A(S.custom).length + " custom") : tr("Liste du jeu", "Built-in list")) +
          "</div></div>";
        const tk = Object.keys(tally() || {});
        if(tk.length){
          const T = tally();
          h += '<div class="field"><span class="eyebrow">' + tr("Compteur de la soirée", "Tonight's counter") + '</span><div class="gs-box">' +
            tk.sort((a, b) => T[b].s - T[a].s).map(n => '<div class="gs-row"><span class="tx"><b>' + esc(n) + '</b><span class="sm">' + (!hard ? tr(T[n].t + " gage" + (T[n].t > 1 ? "s" : "") + " fait" + (T[n].t > 1 ? "s" : ""), T[n].t + " forfeit" + (T[n].t > 1 ? "s" : "") + " done") + "</span></span></div>" : tr("Bu : " + gUnit(S, T[n].s) + " (≈ " + String(Math.round((+T[n].v || 0) * 10) / 10).replace(".", ",") + " verre" + ((+T[n].v || 0) > 1 ? "s" : "") + ") · distribué : " + gUnit(S, T[n].g) + " · " + plural(T[n].t, "gage sans alcool", "gages sans alcool") + " · " + plural(T[n].w, "verre d'eau", "verres d'eau"), gUnit(S, T[n].s) + " drunk (≈ " + (Math.round((+T[n].v || 0) * 10) / 10) + " drinks) · " + T[n].g + " handed out · " + T[n].t + " no-alcohol forfeits · " + T[n].w + " water") + '</span></span><b class="gs-n">' + T[n].s + "</b></div>")).join("") + "</div>" +
            (editable && onReset ? '<button class="link" type="button" data-greset2>' + tr("Remettre le compteur à zéro", "Reset the counter") + "</button>" : "") + "</div>";
        }
      } else if(view === "jeux"){
        h += backRow() + '<p class="sm pf-desc">' + tr("Par défaut, chaque jeu suit le niveau choisi pour tous (" + GN[lv] + "). Touche un jeu seulement si tu veux qu'il soit différent.", "By default, every game follows the level chosen for all (" + GN[lv] + "). Only open a game if you want it to be different.") + "</p>" +
          (hard ? '<div class="gd-legend"><span><i class="gk-boit"></i>' + tr("boit", "drinks") + '</span><span><i class="gk-distribue"></i>' + tr("distribue (il (elle) choisit qui boit)", "hands out (picks who drinks)") + '</span><span><i class="gk-tous"></i>' + tr("tout le monde", "everyone") + "</span></div>" : "");
        const fams = FILTERS.filter(f => ["votes", "bluff", "cartes", "quiz", "action"].indexOf(f[0]) >= 0).map(f => [f[1], gGames().filter(d => CATS[d.id] === f[0])]);
        const rest = gGames().filter(d => ["votes", "bluff", "cartes", "quiz", "action"].indexOf(CATS[d.id]) < 0);
        if(rest.length) fams.push([tr("Autres", "Others"), rest]);
        fams.filter(f => f[1].length).forEach(f => {
          h += '<div class="field"><span class="eyebrow">' + esc(f[0]) + '</span><div class="gs-box gd-list">';
          f[1].forEach(d => {
            const own = (S.glv || {})[d.id], hand = gameKeys(S, d.id).length > 0, glv = own || lv, open = openG === d.id, evs = evsOf(d.id);
            const sum = evs.length + (evs.length > 1 ? tr(" déclencheurs", " triggers") : tr(" déclencheur", " trigger")) + " · " + (own === "off" ? tr("aucun gage", "no forfeits") : hand ? tr("réglé à la main", "set by hand") : own ? tr("niveau ", "level ") + GN[own] : tr("suit le niveau ", "follows ") + GN[lv]);
            h += '<div class="gd-g"><button type="button" class="gd-h" data-gopen="' + d.id + '" aria-expanded="' + open + '"><span class="tx"><b>' + esc(d.name) + '</b><span class="sm">' + esc(sum) + "</span></span>" + (apart(S, d.id) ? '<span class="gd-tag">' + tr("à part", "custom") + "</span>" : "") + '<svg class="gd-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>';
            if(open){
              const curP = own === "off" ? "off" : hand ? "" : glv;
              h += '<div class="gd-body">' + seg('data-gpre="' + d.id + '" data-p', curP, [["off", "Off"]].concat(LV.map(k => [k, GN[k]]))) +
                evs.map(e => { const n = gAmount(S, d.id, e.ev); return '<div class="gd-t"><b>' + esc(e.label) + '</b><div class="gd-r"><span class="gd-pill gk-' + e.kind + '">' + kindTxt(e.kind) + '</span><span style="flex:1"></span>' + stepper('data-gtr="' + esc(e.ev) + '" data-gid="' + d.id + '"', n) + "</div></div>"; }).join("");
              const e0 = evs[0], n0 = e0 ? gAmount(S, d.id, e0.ev) : 0;
              if(e0) h += '<p class="sm" style="margin:0">' + esc(!n0 ? tr("Exemple : « " + e0.label + " » ne donne plus de gage.", "Example: “" + e0.label + "” no longer gives a forfeit.") : tr("Exemple : « " + e0.label + " » → " + (e0.kind === "tous" ? "tout le monde " + (hard ? "boit " + gUnit(S, n0) : "a un gage") : "Bob " + (hard ? kindTxt(e0.kind) + " " + gUnit(S, n0) : "a un gage")) + ".", "Example: “" + e0.label + "” → " + (e0.kind === "tous" ? "everyone " + (hard ? "drinks " + gUnit(S, n0) : "gets a forfeit") : "Bob " + (hard ? kindTxt(e0.kind) + " " + gUnit(S, n0) : "gets a forfeit")) + ".")) + "</p>";
              if(apart(S, d.id) && editable) h += '<button class="link" type="button" data-greset="' + d.id + '" style="align-self:flex-start">' + tr("Revenir au niveau de tous les jeux", "Back to the level for all games") + "</button>";
              h += "</div>";
            }
            h += "</div>";
          });
          h += "</div></div>";
        });
      } else if(view === "fin"){
        const g0 = (SB.games[0] || {}).id;
        h += backRow() + '<p class="sm pf-desc">' + tr("À la fin de chaque partie, quel que soit le jeu. Le niveau du jeu s'applique aussi.", "At the end of every game, whatever the game. The game's level applies too.") + '</p><div class="gs-box">' +
          GEND.filter(e => hard || e.kind !== "distribue").map(e => { const b = gBase(S, g0, e.ev); return '<div class="gs-row"><span class="tx"><b>' + esc(e.label) + '</b><span class="sm gk-' + e.kind + '">' + kindTxt(e.kind) + '</span></span><button type="button" class="gs-b" data-gfin="' + e.ev + '" data-d="-1" aria-label="' + tr("Moins", "Less") + '"' + dis + '>−</button><b class="gs-n gd-n">' + esc(amtTxt(b)) + '</b><button type="button" class="gs-b" data-gfin="' + e.ev + '" data-d="1" aria-label="' + tr("Plus", "More") + '"' + dis + ">+</button></div>"; }).join("") + "</div>";
      } else if(view === "sans"){
        h += backRow() + '<p class="sm pf-desc">' + (hard ? tr("Pour ceux qui ne boivent pas ou qui ont atteint leur plafond. Vide = la liste du jeu.", "For players who don't drink or hit their cap. Empty = the built-in list.") : tr("Ajoute tes propres gages. Vide = la liste du jeu.", "Add your own forfeits. Empty = the built-in list.")) + '</p><div class="gs-box">' +
          A(S.custom).map((t, i) => '<div class="gs-row"><span class="tx"><b>' + esc(t) + '</b></span>' + (editable ? '<button type="button" class="gs-b" data-gdel="' + i + '" aria-label="' + tr("Retirer", "Remove") + '">×</button>' : "") + "</div>").join("") +
          (editable ? '<div class="gs-row"><input class="txt" id="gs-new" maxlength="120" placeholder="' + tr("Ex. : fais 10 pompes", "E.g. do 10 push-ups") + '"><button type="button" class="gs-b" data-gadd aria-label="' + tr("Ajouter", "Add") + '">+</button></div>' : "") + "</div>";
      }
      root.innerHTML = h + "</div>";
      $("#pg-title").textContent = TITLES()[view];
      const upd = p => { set(Object.assign(get(), p)); draw(); };
      $$("[data-gback]", root).forEach(b => b.addEventListener("click", () => go("main")));
      $$("[data-gview]", root).forEach(b => b.addEventListener("click", () => go(b.dataset.gview)));
      if(!editable) return;
      $$("[data-gunit]", root).forEach(b => b.addEventListener("click", () => upd({ unit: b.dataset.gunit, cap: gCapFor(b.dataset.gunit, get().level), water: get().water ? gWaterFor(b.dataset.gunit, get().level) : 0 })));
      $$("[data-glevel]", root).forEach(b => b.addEventListener("click", () => { buzz(6); const S2 = get(), g = Object.assign({}, S2.glv); Object.keys(g).forEach(k => { if(g[k] === b.dataset.glevel && !gameKeys(S2, k).length) delete g[k]; }); upd({ level: b.dataset.glevel, glv: g, cap: gCapFor(S2.unit, b.dataset.glevel), water: S2.water ? gWaterFor(S2.unit, b.dataset.glevel) : 0 }); }));
      $$("[data-gst]", root).forEach(b => b.addEventListener("click", () => { const k = b.dataset.gst, lim = k === "cap" ? [1, 60] : [0, 30]; upd({ [k]: Math.max(lim[0], Math.min(lim[1], (+get()[k] || 0) + +b.dataset.d)) }); }));
      $$("[data-gopen]", root).forEach(b => b.addEventListener("click", () => { openG = openG === b.dataset.gopen ? "" : b.dataset.gopen; buzz(6); draw(); }));
      // Niveau d'un jeu : Off / Basique / Moyen / Hard. Choisir le niveau de tous les jeux le refait suivre le niveau général.
      $$("[data-gpre]", root).forEach(b => b.addEventListener("click", () => {
        const S2 = get(), gid = b.dataset.gpre, p = b.dataset.p, g = Object.assign({}, S2.glv), t = Object.assign({}, S2.trig);
        gameKeys(S2, gid).forEach(k => { delete t[k]; });
        if(p === lvOf(S2)) delete g[gid]; else g[gid] = p;
        buzz(6); upd({ glv: g, trig: t });
      }));
      // Réglage à la main : on fige les valeurs affichées du jeu (niveau Moyen = tels quels), puis on change celle-là.
      $$("[data-gtr]", root).forEach(b => b.addEventListener("click", () => {
        const S2 = get(), gid = b.dataset.gid, ev = b.dataset.gtr, g = Object.assign({}, S2.glv), t = Object.assign({}, S2.trig);
        evsOf(gid).forEach(e => { t[gid + ":" + e.ev] = gAmount(S2, gid, e.ev); });
        t[gid + ":" + ev] = Math.max(0, Math.min(10, t[gid + ":" + ev] + +b.dataset.d));
        g[gid] = "classique"; buzz(6); upd({ glv: g, trig: t });
      }));
      $$("[data-greset]", root).forEach(b => b.addEventListener("click", () => { const S2 = get(), gid = b.dataset.greset, g = Object.assign({}, S2.glv), t = Object.assign({}, S2.trig); delete g[gid]; gameKeys(S2, gid).forEach(k => { delete t[k]; }); buzz(6); upd({ glv: g, trig: t }); }));
      $$("[data-gfin]", root).forEach(b => b.addEventListener("click", () => { const S2 = get(), t = Object.assign({}, S2.trig), ev = b.dataset.gfin, v = Math.max(0, Math.min(10, gBase(S2, (SB.games[0] || {}).id, ev) + +b.dataset.d)); SB.games.forEach(d => { t[d.id + ":" + ev] = v; }); upd({ trig: t }); }));
      const on = $("[data-gon]", root); if(on) on.addEventListener("click", () => upd({ on: !get().on }));
      const jk = $("[data-gjk]", root); if(jk) jk.addEventListener("click", () => upd({ joker: !get().joker }));
      const co = $("[data-gcapoff]", root); if(co) co.addEventListener("click", () => upd({ capOff: !get().capOff }));
      $$("[data-gdel]", root).forEach(b => b.addEventListener("click", () => { const c = A(get().custom).slice(); c.splice(+b.dataset.gdel, 1); upd({ custom: c }); }));
      const add = $("[data-gadd]", root); if(add) add.addEventListener("click", () => { const v = clean($("#gs-new", root).value, 120); if(v) upd({ custom: A(get().custom).concat([v]) }); });
      const rs = $("[data-greset2]", root); if(rs) armTap(rs, () => { onReset(); draw(); }, tr("Touche encore pour remettre à zéro", "Tap again to reset"));
    };
    draw();
  }, gRefresh);
}
/* ---------- Photo de profil : petite image carrée gardée sur le téléphone, partagée dans les salons ---------- */
const PHOTO_RX = /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/;
/* ---------- Avatars intégrés : dessins originaux, partagés par leur numéro (« av:3 ») ---------- */
const AVK = "#14101a";
const AVATARS = [
  ["#5bc0ff","<path d=\"M42 30h5a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-5\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"18\" y=\"24\" width=\"24\" height=\"27\" rx=\"4\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M26 31v14M34 31v14\" stroke=\"#c97a00\" stroke-width=\"2.5\"/><rect x=\"16.5\" y=\"18\" width=\"27\" height=\"7\" rx=\"3.5\" fill=\"#fff\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"22\" cy=\"18\" r=\"5\" fill=\"#fff\"/><circle cx=\"31\" cy=\"16\" r=\"6\" fill=\"#fff\"/><circle cx=\"39\" cy=\"18\" r=\"5\" fill=\"#fff\"/>"],
  ["#8b7bff","<path d=\"M20 13h24c0 15-5 23-12 23s-12-8-12-23z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M21.6 23h20.8c-1.3 7-5 10.5-10.4 10.5S22.9 30 21.6 23z\" fill=\"#c2185b\"/><path d=\"M32 36v14M24 51h16\" stroke=\"#14101a\" stroke-width=\"3.5\"/>"],
  ["#7fd3a3","<path d=\"M27 25 20 7\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M15 18h34L32 37z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 37v13M24 51h16\" stroke=\"#14101a\" stroke-width=\"3.5\"/><circle cx=\"45\" cy=\"17\" r=\"7\" fill=\"#c6f06b\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M45 12v10M40 17h10\" stroke=\"#7aa82a\" stroke-width=\"1.6\"/>"],
  ["#ff5a36","<g transform=\"rotate(-12 32 32)\"><rect x=\"16\" y=\"16\" width=\"32\" height=\"32\" rx=\"7\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><g fill=\"#14101a\"><circle cx=\"24\" cy=\"24\" r=\"3.3\"/><circle cx=\"40\" cy=\"24\" r=\"3.3\"/><circle cx=\"32\" cy=\"32\" r=\"3.3\"/><circle cx=\"24\" cy=\"40\" r=\"3.3\"/><circle cx=\"40\" cy=\"40\" r=\"3.3\"/></g></g>"],
  ["#ff7eb6","<path d=\"M14 42 16 22l9 10 7-14 7 14 9-10 2 20z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"14\" y=\"42\" width=\"36\" height=\"8\" rx=\"2.5\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"46\" r=\"2.4\" fill=\"#ff5a36\"/><circle cx=\"16\" cy=\"21\" r=\"2.8\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"17\" r=\"2.8\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"48\" cy=\"21\" r=\"2.8\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#ffb020","<path d=\"M17 33 16 13l12 10M47 33l1-20-12 10\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"38\" r=\"17\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"25.5\" cy=\"36\" rx=\"3.2\" ry=\"4.2\" fill=\"#c6f06b\"/><ellipse cx=\"38.5\" cy=\"36\" rx=\"3.2\" ry=\"4.2\" fill=\"#c6f06b\"/><ellipse cx=\"25.5\" cy=\"36\" rx=\"1.2\" ry=\"3.4\" fill=\"#14101a\"/><ellipse cx=\"38.5\" cy=\"36\" rx=\"1.2\" ry=\"3.4\" fill=\"#14101a\"/><path d=\"M30 43h4l-2 2.4z\" fill=\"#ff7eb6\"/><path d=\"M10 41h11M11 47l10-3M54 41H43M53 47l-10-3\" stroke=\"#f5efe6\" stroke-width=\"1.6\"/>"],
  ["#5bc0ff","<path d=\"M11 21 21 10l11 9 11-9 10 11-6 19-15 13-15-13z\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M17 40 32 53l15-13-8-2-7 5-7-5z\" fill=\"#f5efe6\"/><path d=\"M16 20l5-6 4 7z M48 20l-5-6-4 7z\" fill=\"#14101a\"/><circle cx=\"25\" cy=\"30\" r=\"2.7\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"30\" r=\"2.7\" fill=\"#14101a\"/><circle cx=\"32\" cy=\"49\" r=\"2.8\" fill=\"#14101a\"/>"],
  ["#8b7bff","<path d=\"M18 51V29a14 14 0 0 1 28 0v22l-4.7-4-4.7 4-4.6-4-4.7 4-4.6-4z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"27\" cy=\"29\" rx=\"2.7\" ry=\"3.7\" fill=\"#14101a\"/><ellipse cx=\"37\" cy=\"29\" rx=\"2.7\" ry=\"3.7\" fill=\"#14101a\"/><ellipse cx=\"32\" cy=\"38.5\" rx=\"3\" ry=\"4\" fill=\"#14101a\"/><circle cx=\"22.5\" cy=\"35\" r=\"2.2\" fill=\"#ff7eb6\"/><circle cx=\"41.5\" cy=\"35\" r=\"2.2\" fill=\"#ff7eb6\"/>"],
  ["#ffb020","<path d=\"M27 16 23 9M37 16l4-7\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.5\"/><path d=\"M27 16 23 9M37 16l4-7\" fill=\"none\" stroke=\"#7fd3a3\" stroke-width=\"2.5\"/><circle cx=\"23\" cy=\"9\" r=\"3\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"41\" cy=\"9\" r=\"3\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M32 14c11 0 19 8 19 18 0 12-10 23-19 23S13 44 13 32c0-10 8-18 19-18z\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"24\" cy=\"34\" rx=\"7\" ry=\"4.5\" transform=\"rotate(28 24 34)\" fill=\"#14101a\"/><ellipse cx=\"40\" cy=\"34\" rx=\"7\" ry=\"4.5\" transform=\"rotate(-28 40 34)\" fill=\"#14101a\"/><circle cx=\"22.5\" cy=\"32.5\" r=\"1.4\" fill=\"#f5efe6\"/><circle cx=\"38.5\" cy=\"32.5\" r=\"1.4\" fill=\"#f5efe6\"/><path d=\"M28 46q4 3 8 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/>"],
  ["#ff7eb6","<path d=\"M32 5v9\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"32\" cy=\"34\" r=\"19\" fill=\"#c9d3dd\"/><rect x=\"23\" y=\"27.5\" width=\"8\" height=\"5.5\" fill=\"#f5efe6\"/><rect x=\"33\" y=\"35.5\" width=\"8\" height=\"5.5\" fill=\"#5bc0ff\"/><rect x=\"42\" y=\"27.5\" width=\"6\" height=\"5.5\" fill=\"#8b7bff\"/><rect x=\"15.5\" y=\"35.5\" width=\"7\" height=\"5.5\" fill=\"#ffb020\"/><rect x=\"33\" y=\"19.5\" width=\"7\" height=\"5.5\" fill=\"#ff7eb6\"/><rect x=\"24\" y=\"43.5\" width=\"7\" height=\"6\" fill=\"#8b7bff\"/><path d=\"M15.8 26H48.2M13.0 34H51.0M15.8 42H48.2\" stroke=\"#4a4157\" stroke-width=\"2\"/><ellipse cx=\"32\" cy=\"34\" rx=\"9.5\" ry=\"19\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"2\"/><path d=\"M32 15v38\" stroke=\"#4a4157\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"34\" r=\"19\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"28\" y=\"12.5\" width=\"8\" height=\"4\" rx=\"1.5\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M50 9Q50 15 56 15Q50 15 50 21Q50 15 44 15Q50 15 50 9z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M13 40Q13 45 18 45Q13 45 13 50Q13 45 8 45Q13 45 13 40z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#5bc0ff","<path d=\"M32 9 46 51H18z\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"30\" cy=\"27\" r=\"2.6\" fill=\"#ffb020\"/><circle cx=\"36\" cy=\"37\" r=\"2.6\" fill=\"#f5efe6\"/><circle cx=\"27\" cy=\"43\" r=\"2.6\" fill=\"#ffb020\"/><circle cx=\"39\" cy=\"46\" r=\"2.2\" fill=\"#ffb020\"/><circle cx=\"32\" cy=\"8\" r=\"5\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M11 14l4 3M52 22l3-4M50 34l5 1M10 30l4-1\" stroke=\"#f5efe6\" stroke-width=\"2.5\"/>"],
  ["#7fd3a3","<path d=\"M32 55 12 17q20-9 40 0z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M12 17q20-9 40 0l-3 6q-17-8-34 0z\" fill=\"#d98a2b\" stroke=\"#14101a\" stroke-width=\"3\"/><g fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"1.6\"><circle cx=\"27\" cy=\"29\" r=\"4\"/><circle cx=\"38\" cy=\"32\" r=\"3.6\"/><circle cx=\"32\" cy=\"42\" r=\"3.2\"/></g>"],
  ["#8b7bff","<path d=\"M32 55c-10 0-16-7-16-16 0-9 7-13 8-23 5 4 6 9 6 13 2-3 3-7 2-13 8 5 14 14 14 23 0 9-6 16-14 16z\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 55c-5 0-8-3.5-8-8 0-5 4-7 5-12 4 3 11 7 11 12 0 4.5-3 8-8 8z\" fill=\"#ffb020\"/><circle cx=\"29\" cy=\"47\" r=\"1.8\" fill=\"#14101a\"/><circle cx=\"35\" cy=\"47\" r=\"1.8\" fill=\"#14101a\"/>"],
  ["#5bc0ff","<path d=\"M36 10A22 22 0 1 0 54 42 18 18 0 0 1 36 10z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"27\" cy=\"38\" r=\"1.8\" fill=\"#14101a\"/><path d=\"M30 44q3 2 6-1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M50 10l1.5 4 4 1.5-4 1.5L50 21l-1.5-4-4-1.5 4-1.5zM15 9l1 2.6 2.6 1-2.6 1L15 16l-1-2.4-2.6-1 2.6-1z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.6\"/>"],
  ["#ff7eb6","<path d=\"M26 33h-5a3 3 0 0 1-3-3v-6M38 28h5a3 3 0 0 0 3-3v-6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"9\"/><path d=\"M26 33h-5a3 3 0 0 1-3-3v-6M38 28h5a3 3 0 0 0 3-3v-6\" fill=\"none\" stroke=\"#7fd3a3\" stroke-width=\"3.5\"/><rect x=\"26\" y=\"14\" width=\"12\" height=\"34\" rx=\"6\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"13\" r=\"3.6\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"29.5\" cy=\"27\" r=\"1.6\" fill=\"#14101a\"/><circle cx=\"34.5\" cy=\"27\" r=\"1.6\" fill=\"#14101a\"/><path d=\"M19 44h26l-3 12H22z\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/>"],
  ["#ff5a36","<circle cx=\"32\" cy=\"32\" r=\"18\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M15 28h34\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"18\" y=\"26\" width=\"12\" height=\"9\" rx=\"3.5\" fill=\"#14101a\"/><rect x=\"34\" y=\"26\" width=\"12\" height=\"9\" rx=\"3.5\" fill=\"#14101a\"/><path d=\"M21 28.5l3-1.5\" stroke=\"#fff\" stroke-width=\"1.6\"/><path d=\"M24 41q8 7 16 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/>"],
  ["#5bc0ff","<path d=\"M18 27 16 12l11 7M46 27l2-15-11 7\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M15 36c0-12 6-20 17-20s17 8 17 20-7 18-17 18-17-6-17-18z\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"46\" rx=\"8.5\" ry=\"6\" fill=\"#e8c79a\"/><circle cx=\"25\" cy=\"31\" r=\"7\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"39\" cy=\"31\" r=\"7\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"25\" cy=\"31\" r=\"3\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"31\" r=\"3\" fill=\"#14101a\"/><path d=\"M30 37h4l-2 4z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"1.2\"/>"],
  ["#ffb020","<circle cx=\"22\" cy=\"26\" r=\"7.5\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"42\" cy=\"26\" r=\"7.5\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"40\" rx=\"21\" ry=\"13\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M15 31a7.5 7.5 0 0 1 14-2M35 29a7.5 7.5 0 0 1 14 2\" fill=\"#7fd3a3\"/><circle cx=\"22\" cy=\"26\" r=\"4\" fill=\"#f5efe6\"/><circle cx=\"42\" cy=\"26\" r=\"4\" fill=\"#f5efe6\"/><circle cx=\"22\" cy=\"26.5\" r=\"2\" fill=\"#14101a\"/><circle cx=\"42\" cy=\"26.5\" r=\"2\" fill=\"#14101a\"/><path d=\"M21 42q11 8 22 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"17\" cy=\"40\" r=\"2.4\" fill=\"#ff7eb6\"/><circle cx=\"47\" cy=\"40\" r=\"2.4\" fill=\"#ff7eb6\"/>"],
  ["#ff5a36","<path d=\"M32 19v-8\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"9\" r=\"3.2\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M13 62c0-7 7-10 19-10s19 3 19 10\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"11\" y=\"28\" width=\"6\" height=\"10\" rx=\"2\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"47\" y=\"28\" width=\"6\" height=\"10\" rx=\"2\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"16\" y=\"19\" width=\"32\" height=\"28\" rx=\"7\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"25\" cy=\"31\" r=\"4.2\" fill=\"#5bc0ff\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"39\" cy=\"31\" r=\"4.2\" fill=\"#5bc0ff\" stroke=\"#14101a\" stroke-width=\"2\"/><rect x=\"24\" y=\"39\" width=\"16\" height=\"4\" rx=\"2\" fill=\"#14101a\"/>"],
  ["#5bc0ff","<circle cx=\"32\" cy=\"32\" r=\"19\" fill=\"#d98a2b\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 16c5 0 6 2 9 2.5s5 3 5 6 3 4 2.5 7.5-3 4-3 7.5-3 4-6 5-4 3-7.5 3-5-2-8-3-5-2-5.5-5-3-4.5-3-7.5 2.5-4 3-7.5 3-4 6-5 4-3.5 7.5-3.5z\" fill=\"#ff7eb6\"/><circle cx=\"32\" cy=\"32\" r=\"6.5\" fill=\"#5bc0ff\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M24 22l3 1M40 21l-1 3M45 31l-3 1M41 42l-2-2M28 44l1-3M20 34l3-1M22 27l2 2\" stroke-width=\"2.4\" stroke=\"#f5efe6\"/><path d=\"M36 23l2 2M19 30l1 2M44 37l2-1\" stroke-width=\"2.4\" stroke=\"#ffb020\"/>"],
  ["#8b7bff","<path d=\"M20 20h24l-3 30H23z\" fill=\"#f5efe6\"/><path d=\"M21.2 31h21.6l-1.9 18H23.1z\" fill=\"#ffb020\"/><path d=\"M20 20h24l-3 30H23z\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M25.5 24v22\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".7\"/><circle cx=\"43\" cy=\"17\" r=\"6\" fill=\"#c6f06b\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M43 13v8M39 17h8\" stroke=\"#7aa82a\" stroke-width=\"1.5\"/>"],
  ["#ffb020","<g transform=\"translate(2 0) rotate(20 30 40) translate(30 40) scale(.9) translate(-30 -40)\"><path d=\"M27 19h8v7c0 3 7 5 7 11v14a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V37c0-6 7-8 7-11z\" fill=\"#2e7d4f\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"20\" y=\"38\" width=\"22\" height=\"10\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"31\" cy=\"43\" r=\"2.4\" fill=\"#e53950\"/><path d=\"M24 31v4\" stroke=\"#7fd3a3\" stroke-width=\"2.5\"/><rect x=\"25.5\" y=\"16\" width=\"11\" height=\"10\" rx=\"2\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2.5\"/></g><path d=\"M37 22c-3-1-4-5-1-7 0-4 5-5 7-2 3-2 7 0 6 4 3 1 3 6-1 7-1 3-5 4-7 1-2 1-5 0-4-3z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"34\" cy=\"12\" r=\"2\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.6\"/><circle cx=\"54\" cy=\"27\" r=\"1.8\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.6\"/><rect x=\"45\" y=\"8\" width=\"7\" height=\"6\" rx=\"2\" transform=\"rotate(35 48.5 11)\" fill=\"#d98a2b\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#ff5a36","<g fill=\"#f5efe6\"><circle cx=\"29\" cy=\"13\" r=\"1.6\"/><circle cx=\"35\" cy=\"9\" r=\"1.4\"/><circle cx=\"33\" cy=\"15\" r=\"1.1\"/></g><path d=\"M13 20h38c0 9-8 15-19 15S13 29 13 20z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><g fill=\"#fff\"><circle cx=\"25\" cy=\"25\" r=\"1.5\"/><circle cx=\"33\" cy=\"28\" r=\"1.2\"/><circle cx=\"39\" cy=\"24\" r=\"1.5\"/></g><path d=\"M32 35v14M24 50h16\" stroke=\"#14101a\" stroke-width=\"3.5\"/>"],
  ["#5bc0ff","<path d=\"M47 49c0 2-1.4 3.4-3 3.4s-3-1.4-3-3.4 3-5.5 3-5.5 3 3.5 3 5.5z\" fill=\"#e6f7ff\" stroke=\"#14101a\" stroke-width=\"2\"/><rect x=\"15\" y=\"16\" width=\"32\" height=\"30\" rx=\"7\" fill=\"#e6f7ff\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M20 21h11\" stroke=\"#fff\" stroke-width=\"3\"/><circle cx=\"25\" cy=\"31\" r=\"2.3\" fill=\"#14101a\"/><circle cx=\"37\" cy=\"31\" r=\"2.3\" fill=\"#14101a\"/><path d=\"M27 37q4 3.5 8 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"21\" cy=\"36\" r=\"2\" fill=\"#ff7eb6\"/><circle cx=\"41\" cy=\"36\" r=\"2\" fill=\"#ff7eb6\"/>"],
  ["#ff5a36","<circle cx=\"32\" cy=\"32\" r=\"19\" fill=\"#7cb342\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"32\" r=\"14.5\" fill=\"#d9f99d\"/><g stroke=\"#7cb342\" stroke-width=\"2.5\"><path d=\"M32 18v28M18 32h28M22 22l20 20M42 22 22 42\"/></g><circle cx=\"32\" cy=\"32\" r=\"2.5\" fill=\"#f5efe6\"/>"],
  ["#ff7eb6","<ellipse cx=\"27\" cy=\"13\" rx=\"6\" ry=\"4\" transform=\"rotate(-18 27 13)\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"38\" cy=\"12\" rx=\"6\" ry=\"4\" transform=\"rotate(14 38 12)\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M17 15h30l-3 7v22l3 7H17l3-7V22z\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"33\" r=\"8\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M27 34q2.5-4 5 0t5 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#7fd3a3","<path d=\"M32 9c7 0 11 5 11 11 0 4-2 6-2 11s2 7 2 11c0 6-4 12-11 12s-11-6-11-12c0-4 2-6 2-11s-2-7-2-11c0-6 4-11 11-11z\" fill=\"#e0b878\" stroke=\"#14101a\" stroke-width=\"3\"/><g fill=\"#b98c4a\"><circle cx=\"27\" cy=\"34\" r=\"1.2\"/><circle cx=\"37\" cy=\"40\" r=\"1.2\"/><circle cx=\"29\" cy=\"46\" r=\"1.2\"/><circle cx=\"36\" cy=\"14\" r=\"1.2\"/></g><circle cx=\"28\" cy=\"21\" r=\"1.9\" fill=\"#14101a\"/><circle cx=\"36\" cy=\"21\" r=\"1.9\" fill=\"#14101a\"/><path d=\"M29.5 26q2.5 2 5 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#8b7bff","<path d=\"M40 50 26 40C14 32 16 17 26 17c6 0 7.5 6 6 11-1.5-5 0-11 6-11 10 0 12 15 0 23L24 50\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"11\"/><path d=\"M40 50 26 40C14 32 16 17 26 17c6 0 7.5 6 6 11-1.5-5 0-11 6-11 10 0 12 15 0 23L24 50\" fill=\"none\" stroke=\"#c9813a\" stroke-width=\"6.5\"/><g fill=\"#fff\"><rect x=\"20\" y=\"24\" width=\"2.4\" height=\"2.4\" rx=\".6\"/><rect x=\"40\" y=\"27\" width=\"2.4\" height=\"2.4\" rx=\".6\"/><rect x=\"30\" y=\"44\" width=\"2.4\" height=\"2.4\" rx=\".6\"/><rect x=\"25\" y=\"17\" width=\"2.4\" height=\"2.4\" rx=\".6\"/><rect x=\"43\" y=\"20\" width=\"2.4\" height=\"2.4\" rx=\".6\"/></g>"],
  ["#ff7eb6","<path d=\"M10 30c0-6 8-8 22-8s22 2 22 8v4c0 8-8 12-22 12s-22-4-22-12z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"6\" y=\"27\" width=\"52\" height=\"10\" rx=\"5\" fill=\"#e0603a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M13 32l4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3\" fill=\"none\" stroke=\"#ffb020\" stroke-width=\"2.5\"/><path d=\"M11 36c2 7 9 10 21 10s19-3 21-10\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/>"],
  ["#5bc0ff","<g transform=\"rotate(-10 32 36)\"><path d=\"M16 30c-1-6 3-11 8-11 1-4 7-5 9-2 3-3 9-2 10 2 5 0 8 5 6 11z\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M23 20l1 3M31 16.5l.5 3M39 18l-.5 3M45 22l-1.5 2\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M13 33q2.5-4.5 5.5-1.5 2.5-4.5 6-1.5 3-4.5 6.5-1 3-4.5 6.5-1 3-4.5 6.5-1 3-3 5.5 2.5L50 37H14z\" fill=\"#7cb342\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"22\" cy=\"29\" r=\"3.2\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"40\" cy=\"28.5\" r=\"3.2\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"31\" cy=\"28\" r=\"2.2\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.8\"/><path d=\"M12 30Q13 56 32 56Q51 56 52 30Q32 39 12 30z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M19 39l3 4M27 41l3 4M35 41l3 4M43 39l3 4\" stroke=\"#d98a2b\" stroke-width=\"2.5\"/><path d=\"M14 46 50.5 46Q47 57.5 32 57.5Q17 57.5 14 46z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M17 50.5h30\" stroke=\"#e53950\" stroke-width=\"2.5\"/></g>"],
  ["#ff5a36","<g transform=\"rotate(-8 32 31)\"><rect x=\"18\" y=\"10\" width=\"28\" height=\"42\" rx=\"4\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 20c-5 6-10 9-10 14 0 3 2.5 5 5 5 2 0 3.5-1 4-2l-2 7h6l-2-7c.5 1 2 2 4 2 2.5 0 5-2 5-5 0-5-5-8-10-14z\" fill=\"#14101a\"/><text x=\"21.5\" y=\"19\" font-size=\"7\" font-weight=\"800\" font-family=\"sans-serif\" fill=\"#14101a\">A</text></g>"],
  ["#5bc0ff","<circle cx=\"32\" cy=\"32\" r=\"19\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"32\" r=\"16\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"5\" stroke-dasharray=\"6 6.57\" stroke-linecap=\"butt\"/><circle cx=\"32\" cy=\"32\" r=\"10.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M32 25l5 7-5 7-5-7z\" fill=\"#e53950\"/>"],
  ["#2e9e6a","<circle cx=\"32\" cy=\"32\" r=\"19\" fill=\"#14101a\"/><ellipse cx=\"23\" cy=\"22\" rx=\"4.5\" ry=\"2.5\" transform=\"rotate(-40 23 22)\" fill=\"#fff\" opacity=\".35\"/><circle cx=\"33\" cy=\"31\" r=\"8.5\" fill=\"#f5efe6\"/><text x=\"33\" y=\"35.6\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"800\" font-family=\"sans-serif\" fill=\"#14101a\">8</text>"],
  ["#5bc0ff","<circle cx=\"30\" cy=\"34\" r=\"19\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"30\" cy=\"34\" r=\"13.5\" fill=\"#f5efe6\"/><circle cx=\"30\" cy=\"34\" r=\"8.5\" fill=\"#e53950\"/><circle cx=\"30\" cy=\"34\" r=\"3.5\" fill=\"#f5efe6\"/><path d=\"M31 33 50 14\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M37 27l7-7\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\"/><path d=\"M37 27l7-7\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"4\"/><path d=\"M47 10l9-2-2 9-4-3z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#7fd3a3","<path d=\"M23 50c0-10 4-17 9-21 5 4 9 11 9 21z\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"29\" rx=\"8\" ry=\"2.6\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"32\" cy=\"18\" r=\"7.5\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"17\" y=\"48\" width=\"30\" height=\"7\" rx=\"3\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"29\" cy=\"15.5\" rx=\"2\" ry=\"1.3\" fill=\"#fff\" opacity=\".5\"/>"],
  ["#8b7bff","<path d=\"M21 15h22c0 10-8 13-8 17s8 7 8 17H21c0-10 8-13 8-17s-8-7-8-17z\" fill=\"#e6f7ff\"/><path d=\"M24.5 21h15c-1 5-5.5 7-7.5 9-2-2-6.5-4-7.5-9z\" fill=\"#ffcf73\"/><path d=\"M23.5 47c1-5 4.5-8 8.5-8s7.5 3 8.5 8z\" fill=\"#ffcf73\"/><path d=\"M32 30v9\" stroke=\"#ffcf73\" stroke-width=\"1.6\"/><path d=\"M21 15h22c0 10-8 13-8 17s8 7 8 17H21c0-10 8-13 8-17s-8-7-8-17z\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"16\" y=\"9\" width=\"32\" height=\"6\" rx=\"2\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"16\" y=\"49\" width=\"32\" height=\"6\" rx=\"2\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"3\"/>"],
  ["#ff7eb6","<path d=\"M23 24a9 9 0 1 1 14 7.5c-3 2-5 4-5 8v2\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"11\"/><path d=\"M23 24a9 9 0 1 1 14 7.5c-3 2-5 4-5 8v2\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"6.5\"/><circle cx=\"32\" cy=\"50\" r=\"4.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/>"],
  ["#8b7bff","<path d=\"M28 34h8l-2 22h-4z\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"22\" r=\"12\" fill=\"#c9d3dd\"/><path d=\"M22 17h20M21 23h22M24 29h16\" stroke=\"#8a95a3\" stroke-width=\"1.6\"/><circle cx=\"32\" cy=\"22\" r=\"12\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"26\" y=\"33\" width=\"12\" height=\"4\" rx=\"1\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M50 18V9l6-2v9\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"2\"/><circle cx=\"48.5\" cy=\"18\" r=\"2\" fill=\"#f5efe6\"/><circle cx=\"54.5\" cy=\"16\" r=\"2\" fill=\"#f5efe6\"/>"],
  ["#ff5a36","<path d=\"M15 40v-8a17 17 0 0 1 34 0v8\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"8\"/><path d=\"M15 40v-8a17 17 0 0 1 34 0v8\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"3.5\"/><rect x=\"9\" y=\"34\" width=\"12\" height=\"19\" rx=\"5\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"43\" y=\"34\" width=\"12\" height=\"19\" rx=\"5\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"19\" y=\"37\" width=\"5\" height=\"13\" rx=\"2.5\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"2\"/><rect x=\"40\" y=\"37\" width=\"5\" height=\"13\" rx=\"2.5\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#ffb020","<circle cx=\"32\" cy=\"32\" r=\"20\" fill=\"#14101a\"/><circle cx=\"32\" cy=\"32\" r=\"16\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"1.2\"/><circle cx=\"32\" cy=\"32\" r=\"12.5\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"1.2\"/><path d=\"M17 25a16 16 0 0 1 8-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".35\"/><circle cx=\"32\" cy=\"32\" r=\"7.5\" fill=\"#ff5a36\"/><circle cx=\"32\" cy=\"32\" r=\"1.8\" fill=\"#ffb020\"/>"],
  ["#5bc0ff","<path d=\"M32 46c-3 4 3 6 0 10s2 5 0 8\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M32 7c9 0 15 7 15 16 0 11-8 19-15 19S17 34 17 23c0-9 6-16 15-16z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M29.5 42h5l-2.5 4z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"25\" cy=\"18\" rx=\"3\" ry=\"5\" transform=\"rotate(25 25 18)\" fill=\"#fff\" opacity=\".5\"/>"],
  ["#7fd3a3","<path d=\"M37 22c-2-5 3-7 1-12\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"6.5\"/><path d=\"M37 22c-2-5 3-7 1-12\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"3.5\"/><path d=\"M42 28c5-2 7 3 12 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"6.5\"/><path d=\"M42 28c5-2 7 3 12 0\" fill=\"none\" stroke=\"#5bc0ff\" stroke-width=\"3.5\"/><path d=\"M41 24c3-4 6-3 9-8\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"6.5\"/><path d=\"M41 24c3-4 6-3 9-8\" fill=\"none\" stroke=\"#ffb020\" stroke-width=\"3.5\"/><rect x=\"27\" y=\"11\" width=\"5\" height=\"5\" rx=\"1\" transform=\"rotate(25 29.5 13.5)\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"1.8\"/><rect x=\"48\" y=\"34\" width=\"5\" height=\"5\" rx=\"1\" transform=\"rotate(-20 50.5 36.5)\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.8\"/><circle cx=\"48\" cy=\"9\" r=\"2.4\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.8\"/><circle cx=\"23\" cy=\"21\" r=\"2.2\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"1.8\"/><path d=\"M53 19.5Q53 23 56.5 23Q53 23 53 26.5Q53 23 49.5 23Q53 23 53 19.5z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.5\"/><path d=\"M12 52 29 22 42 35z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M21 38.5l5 5M25.5 31.5l8 8\" stroke=\"#ff5a36\" stroke-width=\"3.2\"/><ellipse cx=\"35.5\" cy=\"28.5\" rx=\"9.2\" ry=\"4\" transform=\"rotate(45 35.5 28.5)\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/>"],
  ["#ff7eb6","<circle cx=\"32\" cy=\"34\" r=\"20\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M21 39c-6.5-4-9.5-7.5-9.5-11.5a4.8 4.8 0 0 1 9.5-1.5 4.8 4.8 0 0 1 9.5 1.5c0 4-3 7.5-9.5 11.5zM43 39c-6.5-4-9.5-7.5-9.5-11.5a4.8 4.8 0 0 1 9.5-1.5 4.8 4.8 0 0 1 9.5 1.5c0 4-3 7.5-9.5 11.5z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M30 28q2-2 4 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M25 46q7 5 14 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M15 27l2-1.5\" stroke=\"#fff\" stroke-width=\"1.8\"/>"],
  ["#8b7bff","<path d=\"M45 26c3-8 9-13 14-13-1 6-6 12-12 15z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M42 24c1-8 5-15 9-17 1 6-2 13-7 18z\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M9 27c6-4 15-4 23 2 8-6 17-6 23-2 0 10-4 16-11 16-5 0-8-4-12-7-4 3-7 7-12 7-7 0-11-6-11-16z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"21.5\" cy=\"32\" rx=\"5\" ry=\"3.4\" transform=\"rotate(12 21.5 32)\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"42.5\" cy=\"32\" rx=\"5\" ry=\"3.4\" transform=\"rotate(-12 42.5 32)\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"35\" r=\"1.8\" fill=\"#ff5a36\"/><circle cx=\"15\" cy=\"38\" r=\"1.5\" fill=\"#ff5a36\"/><circle cx=\"49\" cy=\"38\" r=\"1.5\" fill=\"#ff5a36\"/>"],
  ["#2b2340","<rect x=\"9\" y=\"19\" width=\"46\" height=\"26\" rx=\"7\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"8\" opacity=\".22\"/><rect x=\"9\" y=\"19\" width=\"46\" height=\"26\" rx=\"7\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"2.5\"/><text x=\"32\" y=\"38.5\" text-anchor=\"middle\" font-size=\"17\" font-weight=\"800\" font-family=\"sans-serif\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"4\" opacity=\".35\">18+</text><text x=\"32\" y=\"38.5\" text-anchor=\"middle\" font-size=\"17\" font-weight=\"800\" font-family=\"sans-serif\" fill=\"#ffd6ea\">18+</text>"],
  ["#7fd3a3","<circle cx=\"18\" cy=\"19\" r=\"6.5\" fill=\"#14101a\"/><circle cx=\"46\" cy=\"19\" r=\"6.5\" fill=\"#14101a\"/><circle cx=\"32\" cy=\"35\" r=\"18\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"24\" cy=\"33\" rx=\"5\" ry=\"6.5\" transform=\"rotate(-28 24 33)\" fill=\"#14101a\"/><ellipse cx=\"40\" cy=\"33\" rx=\"5\" ry=\"6.5\" transform=\"rotate(28 40 33)\" fill=\"#14101a\"/><circle cx=\"25\" cy=\"32\" r=\"1.9\" fill=\"#fff\"/><circle cx=\"39\" cy=\"32\" r=\"1.9\" fill=\"#fff\"/><ellipse cx=\"32\" cy=\"41\" rx=\"3.2\" ry=\"2.2\" fill=\"#14101a\"/><path d=\"M28.5 45q3.5 2.5 3.5-1 0 3.5 3.5 1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.8\"/>"],
  ["#5bc0ff","<ellipse cx=\"25\" cy=\"56\" rx=\"5\" ry=\"2.5\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"39\" cy=\"56\" rx=\"5\" ry=\"2.5\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"32\" cy=\"35\" rx=\"17\" ry=\"20\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 22c-4-4-12-3-12 4 0 3 1 5 1 8 0 9 5 16 11 16s11-7 11-16c0-3 1-5 1-8 0-7-8-8-12-4z\" fill=\"#f5efe6\"/><circle cx=\"27\" cy=\"29\" r=\"2.3\" fill=\"#14101a\"/><circle cx=\"37\" cy=\"29\" r=\"2.3\" fill=\"#14101a\"/><path d=\"M29 33h6l-3 4z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"1.5\"/><circle cx=\"23.5\" cy=\"34\" r=\"2\" fill=\"#ff7eb6\"/><circle cx=\"40.5\" cy=\"34\" r=\"2\" fill=\"#ff7eb6\"/>"],
  ["#8b7bff","<path d=\"M16 28 17 11l11 9M48 28l-1-17-11 9\" fill=\"#8a8f99\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"36\" rx=\"19\" ry=\"16\" fill=\"#a9aeb8\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M13 35c4-6 11-6 19-2 8-4 15-4 19 2-4 6-11 6-19 2-8 4-15 4-19-2z\" fill=\"#14101a\"/><circle cx=\"24\" cy=\"35\" r=\"2.3\" fill=\"#fff\"/><circle cx=\"40\" cy=\"35\" r=\"2.3\" fill=\"#fff\"/><ellipse cx=\"32\" cy=\"44.5\" rx=\"7\" ry=\"5\" fill=\"#f5efe6\"/><ellipse cx=\"32\" cy=\"42\" rx=\"2.8\" ry=\"1.9\" fill=\"#14101a\"/>"],
  ["#7fd3a3","<path d=\"M-2 14 66 10\" stroke=\"#14101a\" stroke-width=\"10\"/><path d=\"M-2 14 66 10\" stroke=\"#b07a4a\" stroke-width=\"6\"/><path d=\"M44 11l3-4\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M19 34C15 26 15 18 19 11M45 34c4-8 4-16 0-23\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"10\"/><path d=\"M19 34C15 26 15 18 19 11M45 34c4-8 4-16 0-23\" fill=\"none\" stroke=\"#8a5a32\" stroke-width=\"6\"/><path d=\"M15 9q4-3 7 1M42 10q3-4 7-1\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"2\"/><ellipse cx=\"32\" cy=\"38\" rx=\"18\" ry=\"16\" fill=\"#8a5a32\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"40\" rx=\"14.5\" ry=\"12\" fill=\"#ffcf73\"/><ellipse cx=\"24\" cy=\"38\" rx=\"6.5\" ry=\"3.8\" transform=\"rotate(-22 24 38)\" fill=\"#4a2f1c\"/><ellipse cx=\"40\" cy=\"38\" rx=\"6.5\" ry=\"3.8\" transform=\"rotate(22 40 38)\" fill=\"#4a2f1c\"/><circle cx=\"25\" cy=\"37.5\" r=\"2.3\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"37.5\" r=\"2.3\" fill=\"#14101a\"/><circle cx=\"25.8\" cy=\"36.7\" r=\".9\" fill=\"#fff\"/><circle cx=\"39.8\" cy=\"36.7\" r=\".9\" fill=\"#fff\"/><ellipse cx=\"32\" cy=\"43\" rx=\"3.2\" ry=\"2.2\" fill=\"#14101a\"/><path d=\"M27.5 47q4.5 3.5 9 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.2\"/>"],
  ["#8b7bff","<circle cx=\"18\" cy=\"22\" r=\"4.5\" fill=\"#8a5a32\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"46\" cy=\"22\" r=\"4.5\" fill=\"#8a5a32\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"13\" y=\"20\" width=\"38\" height=\"34\" rx=\"15\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"21\" y=\"35\" width=\"22\" height=\"16\" rx=\"8\" fill=\"#9c6a3c\"/><circle cx=\"24\" cy=\"31\" r=\"2.2\" fill=\"#14101a\"/><circle cx=\"40\" cy=\"31\" r=\"2.2\" fill=\"#14101a\"/><ellipse cx=\"28.5\" cy=\"40\" rx=\"1.6\" ry=\"2.2\" fill=\"#14101a\"/><ellipse cx=\"35.5\" cy=\"40\" rx=\"1.6\" ry=\"2.2\" fill=\"#14101a\"/><path d=\"M29 46q3 2 6 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"15\" r=\"6.5\" fill=\"#ff8a1f\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M32 9q2-5 7-4-2 4-7 4z\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"1.5\"/>"],
  ["#5bc0ff","<path d=\"M0 52q8-4 16 0t16 0 16 0 16 0v12H0z\" fill=\"#3b8fd1\"/><path d=\"M27 19 23 6l13 13z\" fill=\"#8a95a3\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M7 41c6-15 17-23 31-23 8 0 16 6 18 14 1 6-4 10-10 10H13c-4 0-6-0-6-1z\" fill=\"#8a95a3\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M12 41h33c4 0 8-2 9-6-4 3-10 3-14 3H12z\" fill=\"#f5efe6\"/><circle cx=\"43\" cy=\"28\" r=\"2.4\" fill=\"#14101a\"/><path d=\"M27 38l2.2 3.4 2.2-3.4 2.2 3.4 2.2-3.4 2.2 3.4 2.2-3.4\" fill=\"#fff\" stroke=\"#14101a\" stroke-width=\"1.6\"/><path d=\"M22 27v7M26 26v8\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#ffb020","<path d=\"M18 36c0 8-6 10-6 14M25 36c0 8-2 12 0 16M32 36v16M39 36c0 8 2 12 0 16M46 36c0 8 6 10 6 14\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"8\"/><path d=\"M18 36c0 8-6 10-6 14M25 36c0 8-2 12 0 16M32 36v16M39 36c0 8 2 12 0 16M46 36c0 8 6 10 6 14\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"4\"/><path d=\"M15 33c0-12 7-20 17-20s17 8 17 20v4H15z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"26\" cy=\"27\" r=\"4\" fill=\"#f5efe6\"/><circle cx=\"38\" cy=\"27\" r=\"4\" fill=\"#f5efe6\"/><circle cx=\"26.5\" cy=\"27.5\" r=\"2\" fill=\"#14101a\"/><circle cx=\"38.5\" cy=\"27.5\" r=\"2\" fill=\"#14101a\"/><path d=\"M29 33q3 2 6 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"24\" cy=\"18\" r=\"1.6\" fill=\"#ffc2dd\"/><circle cx=\"40\" cy=\"19\" r=\"2\" fill=\"#ffc2dd\"/>"],
  ["#8b7bff","<path d=\"M21 26 19 14l9 7M43 26l2-12-9 7\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M29.5 21 32 3l2.5 18z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M30 15h4M30.6 10h2.8\" stroke=\"#c97a00\" stroke-width=\"1.5\"/><ellipse cx=\"32\" cy=\"38\" rx=\"15\" ry=\"16\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M19 32c-6-6-2-16 7-14 2-4 8-4 10 0-6 0-9 4-10 8-2-2-5-2-7 6z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"32\" cy=\"46\" rx=\"9\" ry=\"6\" fill=\"#ffd6ea\"/><circle cx=\"28.5\" cy=\"46\" r=\"1.2\" fill=\"#14101a\"/><circle cx=\"35.5\" cy=\"46\" r=\"1.2\" fill=\"#14101a\"/><path d=\"M23 36q3 2.5 6 0M35 36q3 2.5 6 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#ffb020","<path d=\"M22 19l3-9 5 7M31 16l4-9 4 9M40 17l5-7 2 9\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M13 40c0-14 8-24 20-24s17 8 17 18v6c0 8-6 13-18 13S13 48 13 40z\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"26\" cy=\"31\" r=\"4.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"40\" cy=\"31\" r=\"4.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"27\" cy=\"31.5\" r=\"2\" fill=\"#14101a\"/><circle cx=\"41\" cy=\"31.5\" r=\"2\" fill=\"#14101a\"/><path d=\"M22 43q11 7 22 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M26 45.2l1.5 3 1.5-2.4M36 45.6l1.5 2.4 1.5-3\" fill=\"#fff\" stroke=\"#14101a\" stroke-width=\"1.3\"/>"],
  ["#7fd3a3","<path d=\"M23 42h18v24H23z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M37 48h7v12h-7z\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"18\" y=\"44\" width=\"28\" height=\"8\" rx=\"4\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M24 44.5v7M30 44.5v7M36 44.5v7M40.5 52v7.5\" stroke=\"#ffb020\" stroke-width=\"2.2\"/><path d=\"M23 21C18 17 17 12 19 8c4 1 7 5 7 10zM41 21c5-4 6-9 4-13-4 1-7 5-7 10z\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2.5\"/><ellipse cx=\"32\" cy=\"30\" rx=\"13.5\" ry=\"15\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"26.5\" cy=\"17\" r=\"4.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"37.5\" cy=\"17\" r=\"4.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"15\" r=\"5.2\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"32\" cy=\"39\" rx=\"7.5\" ry=\"6\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><ellipse cx=\"25.5\" cy=\"28\" rx=\"2.5\" ry=\"3\" fill=\"#14101a\"/><ellipse cx=\"38.5\" cy=\"28\" rx=\"2.5\" ry=\"3\" fill=\"#14101a\"/><circle cx=\"26.3\" cy=\"27\" r=\".9\" fill=\"#fff\"/><circle cx=\"39.3\" cy=\"27\" r=\".9\" fill=\"#fff\"/><path d=\"M29.5 37h0M34.5 37h0\" stroke=\"#14101a\" stroke-width=\"2.4\"/><path d=\"M32 38.5v2.5M29 41.5q1.5 1.5 3 0 1.5 1.5 3 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.8\"/>"],
  ["#ff5a36","<ellipse cx=\"16\" cy=\"33\" rx=\"6\" ry=\"12\" transform=\"rotate(15 16 33)\" fill=\"#8a5a32\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"48\" cy=\"33\" rx=\"6\" ry=\"12\" transform=\"rotate(-15 48 33)\" fill=\"#8a5a32\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"32\" r=\"17\" fill=\"#e0b878\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"39.5\" cy=\"27\" r=\"5.5\" fill=\"#f5efe6\"/><circle cx=\"25\" cy=\"28\" r=\"2.4\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"28\" r=\"2.4\" fill=\"#14101a\"/><ellipse cx=\"32\" cy=\"40\" rx=\"8.5\" ry=\"6\" fill=\"#f5efe6\"/><path d=\"M29 44h6v6a3 3 0 0 1-6 0z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"32\" cy=\"37\" rx=\"3.5\" ry=\"2.5\" fill=\"#14101a\"/><path d=\"M32 39.5v3.5\" stroke=\"#14101a\" stroke-width=\"1.8\"/>"],
  ["#8b7bff","<path d=\"M10 64 13 44q19 10 38 0l3 20z\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M12 22 22 48h20l10-26 2 24-12 10H24L10 46z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"31\" rx=\"14.5\" ry=\"17\" fill=\"#e6e0f0\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M17.5 29c0-11 6-16 14.5-16s14.5 5 14.5 16l-6-5-8.5 7-8.5-7z\" fill=\"#14101a\"/><path d=\"M23 31.5l5 2M41 31.5l-5 2\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"35\" r=\"2.6\" fill=\"#e53950\"/><circle cx=\"38\" cy=\"35\" r=\"2.6\" fill=\"#e53950\"/><path d=\"M26.5 42q5.5 3.5 11 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.2\"/><path d=\"M28.6 42.8l1.1 3.4 1.1-2.8M33.2 43.4l1.1 2.8 1.1-3.4\" fill=\"#fff\" stroke=\"#14101a\" stroke-width=\"1.2\"/>"],
  ["#8b7bff","<rect x=\"15\" y=\"13\" width=\"34\" height=\"38\" rx=\"13\" fill=\"#9bc27a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M17 22c3-6 7-9 9-6 2-4 7-5 9-1 3-3 8-1 10 5\" fill=\"none\" stroke=\"#3a5a2a\" stroke-width=\"3\"/><circle cx=\"25\" cy=\"31\" r=\"5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"32\" r=\"1.6\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"31\" r=\"3.2\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"39\" cy=\"31\" r=\"1.1\" fill=\"#14101a\"/><path d=\"M24 43h16\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M28 41v4M32 41v4M36 41v4\" stroke=\"#14101a\" stroke-width=\"1.6\"/><path d=\"M38 18l7 6M40 22l2-3M43 24l2-3\" stroke=\"#14101a\" stroke-width=\"1.6\"/>"],
  ["#ff5a36","<path d=\"M19 30c-5 9-4 19-1 25h28c3-6 4-16-1-25z\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"32\" cy=\"41\" rx=\"13\" ry=\"13.5\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M24.5 36.5l5 1.5M39.5 36.5l-5 1.5\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"27\" cy=\"40.5\" r=\"2.3\" fill=\"#14101a\"/><circle cx=\"37\" cy=\"40.5\" r=\"2.3\" fill=\"#14101a\"/><circle cx=\"27.8\" cy=\"39.7\" r=\".8\" fill=\"#fff\"/><circle cx=\"37.8\" cy=\"39.7\" r=\".8\" fill=\"#fff\"/><path d=\"M32 41l3.5 5-3.5 1\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M26.5 49q5.5 3.5 11-1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.2\"/><circle cx=\"39\" cy=\"45.5\" r=\"1.2\" fill=\"#4a4157\"/><ellipse cx=\"32\" cy=\"29\" rx=\"23\" ry=\"5\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M20 28 30 10q3-5 9-4-4 2-4 7l6 15z\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M21.5 21.5h20.5v4.5H20.5z\" fill=\"#ffb020\"/><rect x=\"28.5\" y=\"20.5\" width=\"6\" height=\"6.5\" rx=\"1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#5bc0ff","<circle cx=\"32\" cy=\"36\" r=\"16\" fill=\"#f0c8a0\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M14 29c0-10 8-16 18-16s18 6 18 16z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M48 26l9 3-4 5z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/><g fill=\"#fff\"><circle cx=\"24\" cy=\"21\" r=\"1.5\"/><circle cx=\"32\" cy=\"18\" r=\"1.5\"/><circle cx=\"40\" cy=\"22\" r=\"1.5\"/></g><path d=\"M18 30 48 39\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"39\" cy=\"36\" r=\"4.5\" fill=\"#14101a\"/><circle cx=\"25\" cy=\"35\" r=\"2.2\" fill=\"#14101a\"/><path d=\"M26 44q5 3 10 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.2\"/><circle cx=\"16.5\" cy=\"43\" r=\"2.6\" fill=\"none\" stroke=\"#ffb020\" stroke-width=\"2\"/>"],
  ["#ffb020","<path d=\"M47 22l11-4-4 6 6 2-13 1z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"32\" r=\"18\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"15\" y=\"26\" width=\"34\" height=\"11\" rx=\"5.5\" fill=\"#f0c8a0\"/><path d=\"M15 23h34\" stroke=\"#e53950\" stroke-width=\"4\"/><circle cx=\"25\" cy=\"32\" r=\"2.2\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"32\" r=\"2.2\" fill=\"#14101a\"/><path d=\"M20 28.5l7 1.8M44 28.5l-7 1.8\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#7fd3a3","<circle cx=\"15\" cy=\"29\" r=\"8\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"49\" cy=\"29\" r=\"8\" fill=\"#ff5a36\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"35\" r=\"16\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M28 19 32 6l4 13z\" fill=\"#5bc0ff\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"6\" r=\"2.6\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"1.5\"/><path d=\"M26 27v6M38 27v6\" stroke=\"#5bc0ff\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"31\" r=\"2\" fill=\"#14101a\"/><circle cx=\"38\" cy=\"31\" r=\"2\" fill=\"#14101a\"/><path d=\"M22 42q10 9 20 0\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"38\" r=\"4.5\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#5bc0ff","<path d=\"M32 40v22\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\"/><path d=\"M32 40v22\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"3.5\"/><path d=\"M22.5 48q9.5 4 19 0M24 54q8 3.5 16 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\"/><path d=\"M22.5 48q9.5 4 19 0M24 54q8 3.5 16 0\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"3.5\"/><path d=\"M22 45 14 38l-1-10M42 45l6 7\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\"/><path d=\"M22 45 14 38l-1-10M42 45l6 7\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"3.5\"/><circle cx=\"13\" cy=\"26.5\" r=\"3\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"24\" y=\"31\" width=\"16\" height=\"11\" rx=\"4\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"24\" r=\"14\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M25 37.5v4M29 38v4M33 38v4M37 37.5v4\" stroke=\"#14101a\" stroke-width=\"1.6\"/><path d=\"M25 36q7 3 14 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><ellipse cx=\"26.5\" cy=\"24\" rx=\"4.2\" ry=\"4.8\" fill=\"#14101a\"/><ellipse cx=\"37.5\" cy=\"24\" rx=\"4.2\" ry=\"4.8\" fill=\"#14101a\"/><circle cx=\"27.5\" cy=\"23\" r=\"1.4\" fill=\"#f5efe6\"/><circle cx=\"38.5\" cy=\"23\" r=\"1.4\" fill=\"#f5efe6\"/><path d=\"M32 29l-1.8 3h3.6z\" fill=\"#14101a\"/><path d=\"M50 14v6M47 17h6\" stroke=\"#ffb020\" stroke-width=\"2.2\"/>"],
  ["#ffb020","<path d=\"M22 18c-4-3-5-8-3-12 2 3 5 4 8 5M42 18c4-3 5-8 3-12-2 3-5 4-8 5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M32.0 12.5L34.6 16.7L38.3 13.4L39.7 18.2L44.2 16.1L44.1 21.0L49.0 20.3L47.6 25.0L52.5 25.7L49.8 29.8L54.3 31.8L50.5 35.0L54.3 38.2L49.8 40.2L52.5 44.3L47.6 45.0L49.0 49.7L44.1 49.0L44.2 53.9L39.7 51.8L38.3 56.6L34.6 53.3L32.0 57.5L29.4 53.3L25.7 56.6L24.3 51.8L19.8 53.9L19.9 49.0L15.0 49.7L16.4 45.0L11.5 44.3L14.2 40.2L9.7 38.2L13.5 35.0L9.7 31.8L14.2 29.8L11.5 25.7L16.4 25.0L15.0 20.3L19.9 21.0L19.8 16.1L24.3 18.2L25.7 13.4L29.4 16.7z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"25.5\" cy=\"30\" r=\"5.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.2\"/><circle cx=\"38.5\" cy=\"30\" r=\"5.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.2\"/><circle cx=\"26.5\" cy=\"31\" r=\"2.5\" fill=\"#14101a\"/><circle cx=\"39.5\" cy=\"31\" r=\"2.5\" fill=\"#14101a\"/><path d=\"M22 39q10 15 20 0z\" fill=\"#14101a\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M28 46q4-3 8 0q-4 4-8 0z\" fill=\"#e53950\"/><path d=\"M24.5 39.6l2.2 3.6 2.2-3.6M35.1 39.6l2.2 3.6 2.2-3.6\" fill=\"#fff\"/>"],
  ["#7fd3a3","<ellipse cx=\"24\" cy=\"55\" rx=\"5\" ry=\"3\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"2.5\"/><ellipse cx=\"40\" cy=\"55\" rx=\"5\" ry=\"3\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M15 40c-5-2-7-6-6-11M49 40c4 3 6 7 5 11\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"8.5\"/><path d=\"M15 40c-5-2-7-6-6-11M49 40c4 3 6 7 5 11\" fill=\"none\" stroke=\"#8b7bff\" stroke-width=\"4.5\"/><path d=\"M29 15l3-8 3 8\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M13 48c-2-18 7-34 19-34s21 16 19 34c-1 5-37 5-38 0z\" fill=\"#8b7bff\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M22 19.5q10-5 20 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"32\" cy=\"30\" r=\"9.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"33\" cy=\"31\" r=\"5\" fill=\"#5bc0ff\"/><circle cx=\"33\" cy=\"31\" r=\"2.4\" fill=\"#14101a\"/><circle cx=\"31\" cy=\"28.8\" r=\"1.2\" fill=\"#fff\"/><path d=\"M23 42q9 9 18 0z\" fill=\"#14101a\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M28 42.5v3h3v-3M33 42.5v3h3v-3\" fill=\"#fff\"/>"],
  ["#8b7bff","<path d=\"M21 23c-5-4-5-11-1-15 0 5 3 8 7 10zM43 23c5-4 5-11 1-15 0 5-3 8-7 10z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M30 49l2 6 2-6z\" fill=\"#14101a\"/><circle cx=\"32\" cy=\"34\" r=\"16\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M22 27.5l6 3M42 27.5l-6 3\" stroke=\"#14101a\" stroke-width=\"2.2\"/><circle cx=\"26\" cy=\"33\" r=\"2.1\" fill=\"#14101a\"/><circle cx=\"38\" cy=\"33\" r=\"2.1\" fill=\"#14101a\"/><path d=\"M24 40q8 7 16 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M36.5 42.5l1 3 1.3-3.6\" fill=\"#fff\" stroke=\"#14101a\" stroke-width=\"1.2\"/>"],
  ["#5bc0ff","<ellipse cx=\"32\" cy=\"9\" rx=\"10\" ry=\"3\" fill=\"none\" stroke=\"#ffb020\" stroke-width=\"3\"/><path d=\"M18 36c-9-2-13-11-11-18 4 5 10 4 15 9zM46 36c9-2 13-11 11-18-4 5-10 4-15 9z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"32\" cy=\"33\" r=\"15\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M19 28c1-8 7-12 13-12s12 4 13 12c-3-3-6-4-8-4 1 1 1 3 0 4-2-3-6-5-10-4 1 1 1 2 0 3-3-1-6 0-8 1z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M24 33q3 2 6 0M34 33q3 2 6 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M28 39q4 3 8 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"22.5\" cy=\"37\" r=\"2\" fill=\"#ff7eb6\"/><circle cx=\"41.5\" cy=\"37\" r=\"2\" fill=\"#ff7eb6\"/>"],
  ["#ffb020","<path d=\"M41 16c4-7 9-7 13-4\" fill=\"none\" stroke=\"#d98a2b\" stroke-width=\"2.5\"/><path d=\"M54 6l1.4 3.6 3.6 1.4-3.6 1.4L54 16l-1.4-3.6L49 11l3.6-1.4z\" fill=\"#ff5a36\"/><circle cx=\"54\" cy=\"11\" r=\"1.4\" fill=\"#fff\"/><rect x=\"33\" y=\"14\" width=\"10\" height=\"9\" rx=\"2\" transform=\"rotate(35 38 18.5)\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"30\" cy=\"37\" r=\"17\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"22\" cy=\"29\" rx=\"4.5\" ry=\"2.6\" transform=\"rotate(-38 22 29)\" fill=\"#fff\" opacity=\".3\"/>"],
  ["#7fd3a3","<path d=\"M24 36h16v15a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M9 37c0-13 10-23 23-23s23 10 23 23z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><g fill=\"#f5efe6\"><circle cx=\"21\" cy=\"26\" r=\"3.6\"/><circle cx=\"34\" cy=\"21\" r=\"3\"/><circle cx=\"44\" cy=\"30\" r=\"3.5\"/><circle cx=\"29\" cy=\"31\" r=\"2.4\"/></g><circle cx=\"29\" cy=\"43\" r=\"1.6\" fill=\"#14101a\"/><circle cx=\"35\" cy=\"43\" r=\"1.6\" fill=\"#14101a\"/><path d=\"M30 47q2 1.5 4 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.6\"/>"],
  ["#ff7eb6","<path d=\"M32 7c8 0 12 10 14 18 3 6 6 12 6 18 0 9-8 14-20 14S12 52 12 43c0-6 3-12 6-18 2-8 6-18 14-18z\" fill=\"#3f7a3a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 11.5c6 0 9 9 11 16 2.5 5 5 10 5 15.5 0 7-7 11-16 11s-16-4-16-11c0-5.5 2.5-10.5 5-15.5 2-7 5-16 11-16z\" fill=\"#c6f06b\"/><circle cx=\"32\" cy=\"42\" r=\"8\" fill=\"#b07a4a\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"27.5\" cy=\"26\" r=\"1.8\" fill=\"#14101a\"/><circle cx=\"36.5\" cy=\"26\" r=\"1.8\" fill=\"#14101a\"/><path d=\"M29.5 30.5q2.5 2 5 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.8\"/>"],
  ["#5bc0ff","<path d=\"M13 15c1 20 14 33 36 30 4-.5 6-2.5 6-4.5-15 2-28-6-32-24-1-4-10-5-10-1.5z\" fill=\"#ffcf3f\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M13 15l-2-5 5 1\" fill=\"#6b4a33\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M19 22c4 11 13 18 26 19\" fill=\"none\" stroke=\"#e0a800\" stroke-width=\"2\"/><circle cx=\"33\" cy=\"35\" r=\"1.6\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"37\" r=\"1.6\" fill=\"#14101a\"/><path d=\"M34 40q2 2 4 1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.5\"/>"],
  ["#8b7bff","<path d=\"M13 31c0-11 10-17 21-15 8 1 14 6 16 12s0 14-8 18-15 4-21 2-8-8-8-17z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"32\" r=\"8.5\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"29\" cy=\"29\" r=\"2\" fill=\"#fff\"/><circle cx=\"29.5\" cy=\"33\" r=\"1.3\" fill=\"#14101a\"/><circle cx=\"34.5\" cy=\"33\" r=\"1.3\" fill=\"#14101a\"/><path d=\"M30.5 36q1.5 1.2 3 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.4\"/>"],
  ["#5bc0ff","<circle cx=\"32\" cy=\"32\" r=\"19\" fill=\"#d9a35b\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"51\" cy=\"15\" r=\"7.5\" fill=\"#5bc0ff\"/><circle cx=\"45\" cy=\"9\" r=\"4\" fill=\"#5bc0ff\"/><g fill=\"#5a3a22\"><circle cx=\"24\" cy=\"26\" r=\"2.6\"/><circle cx=\"35\" cy=\"22\" r=\"2.2\"/><circle cx=\"40\" cy=\"34\" r=\"2.7\"/><circle cx=\"27\" cy=\"40\" r=\"2.4\"/><circle cx=\"32\" cy=\"31\" r=\"1.8\"/><circle cx=\"20\" cy=\"34\" r=\"1.8\"/><circle cx=\"36\" cy=\"44\" r=\"1.9\"/></g>"],
  ["#ff7eb6","<path d=\"M21 34 32 58l11-24z\" fill=\"#d9a35b\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M25 40l12 10M28 35l11 10M39 40 27 50M36 35l-10 10\" stroke=\"#a8763a\" stroke-width=\"1.5\"/><circle cx=\"32\" cy=\"30\" r=\"10.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M24 34c1 4 3 5 4 3s3 3 5 1 3 2 5 0 2-2 3-4\" fill=\"#f5efe6\"/><circle cx=\"32\" cy=\"18\" r=\"9\" fill=\"#8b5a3c\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"36\" cy=\"8\" r=\"3.2\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M36 5q2-3 5-3\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"1.5\"/>"],
  ["#5bc0ff","<path d=\"M32 23 25 6l7 8 2-10 2 10 7-8-7 17z\" fill=\"#3f9a4f\" stroke=\"#14101a\" stroke-width=\"2.5\"/><ellipse cx=\"32\" cy=\"40\" rx=\"14\" ry=\"17\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M22 30l17 21M28 25l15 18M19 41l13 15M42 30 25 51M36 25 21 43M45 41 32 56\" stroke=\"#c97a00\" stroke-width=\"1.5\"/><rect x=\"19\" y=\"33\" width=\"11\" height=\"7\" rx=\"3\" fill=\"#14101a\"/><rect x=\"34\" y=\"33\" width=\"11\" height=\"7\" rx=\"3\" fill=\"#14101a\"/><path d=\"M30 35h4\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M28 46q4 3 8 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2\"/>"],
  ["#ff5a36","<g transform=\"translate(32 32) scale(.84) translate(-32 -35)\"><path d=\"M14 50l36 10M50 50 14 60\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7.5\"/><path d=\"M14 50l36 10M50 50 14 60\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"3.5\"/><path d=\"M32 9c11 0 18 7 18 17 0 6-3 9-6 11v6a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3v-6c-3-2-6-5-6-11 0-10 7-17 18-17z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"25\" cy=\"27\" r=\"5\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"27\" r=\"5\" fill=\"#14101a\"/><path d=\"M32 32l-2.6 4.5h5.2z\" fill=\"#14101a\"/><path d=\"M27 41v4M32 41v4M37 41v4\" stroke=\"#14101a\" stroke-width=\"2\"/></g>"],
  ["#ff7eb6","<path d=\"M9 32c5-6 11-11 17-11 3 0 4.5 1.5 6 3 1.5-1.5 3-3 6-3 6 0 12 5 17 11-6 8-14 13-23 13S15 40 9 32z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M9 32c8 2.5 15 3.5 23 3.5S47 34.5 55 32\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.2\"/><ellipse cx=\"24\" cy=\"39\" rx=\"4.5\" ry=\"1.6\" fill=\"#fff\" opacity=\".5\"/>"],
  ["#8b7bff","<path d=\"M32 18c-1-3-1-5 0-8\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M32 18c2-6 8-10 15-9-2 6-8 10-15 9z\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M32 19c-4-4-12-5-17 0-6 6-5 18 2 26 5 6 11 9 15 9s10-3 15-9c7-8 8-20 2-26-5-5-13-4-17 0z\" fill=\"#ffa47a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 19c-3 9-3 18 0 31\" fill=\"none\" stroke=\"#e0603a\" stroke-width=\"2.2\"/><ellipse cx=\"22\" cy=\"30\" rx=\"3\" ry=\"5\" transform=\"rotate(20 22 30)\" fill=\"#fff\" opacity=\".35\"/>"],
  ["#ffb020","<path d=\"M18 51c-7-6-2-17 6-25s14-14 20-14c4 0 6 4 6 8 0 6-6 12-14 20s-12 15-18 11z\" fill=\"#7b3fa0\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M49 6l3-4\" stroke=\"#3f9a4f\" stroke-width=\"3.5\"/><path d=\"M40 14c2-5 7-8 12-6 2 4 0 9-4 12-1-3-3-4-5-3-2-2-3-2-3-3z\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M23 41c3-5 7-9 11-13\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" opacity=\".35\"/>"],
  ["#5bc0ff","<g transform=\"rotate(-8 32 34) translate(32 33) scale(.95) translate(-32 -32)\"><ellipse cx=\"24\" cy=\"19.5\" rx=\"5\" ry=\"3\" transform=\"rotate(-40 24 19.5)\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.2\"/><ellipse cx=\"24\" cy=\"19.5\" rx=\"5\" ry=\"3\" transform=\"rotate(-40 24 19.5)\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.3\"/><ellipse cx=\"32\" cy=\"16\" rx=\"5\" ry=\"3\" transform=\"rotate(0 32 16)\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.2\"/><ellipse cx=\"32\" cy=\"16\" rx=\"5\" ry=\"3\" transform=\"rotate(0 32 16)\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.3\"/><ellipse cx=\"40\" cy=\"19.5\" rx=\"5\" ry=\"3\" transform=\"rotate(40 40 19.5)\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.2\"/><ellipse cx=\"40\" cy=\"19.5\" rx=\"5\" ry=\"3\" transform=\"rotate(40 40 19.5)\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.3\"/><rect x=\"11.5\" y=\"23\" width=\"15\" height=\"11\" rx=\"2.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2.6\"/><circle cx=\"19\" cy=\"27.5\" r=\"1.7\" fill=\"#14101a\"/><path d=\"M19 28v3\" stroke=\"#14101a\" stroke-width=\"1.8\"/><rect x=\"37.5\" y=\"23\" width=\"15\" height=\"11\" rx=\"2.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2.6\"/><circle cx=\"45\" cy=\"27.5\" r=\"1.7\" fill=\"#14101a\"/><path d=\"M45 28v3\" stroke=\"#14101a\" stroke-width=\"1.8\"/><circle cx=\"19\" cy=\"43\" r=\"10.6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\" stroke-dasharray=\"0 5.5\"/><circle cx=\"19\" cy=\"43\" r=\"8.2\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"10.5\"/><circle cx=\"19\" cy=\"43\" r=\"10.6\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"4\" stroke-dasharray=\"0 5.5\"/><circle cx=\"19\" cy=\"43\" r=\"8.2\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"7\"/><path d=\"M13 38a8 8 0 0 1 7-3.5\" fill=\"none\" stroke=\"#ffc2dd\" stroke-width=\"2\"/><circle cx=\"45\" cy=\"43\" r=\"10.6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\" stroke-dasharray=\"0 5.5\"/><circle cx=\"45\" cy=\"43\" r=\"8.2\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"10.5\"/><circle cx=\"45\" cy=\"43\" r=\"10.6\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"4\" stroke-dasharray=\"0 5.5\"/><circle cx=\"45\" cy=\"43\" r=\"8.2\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"7\"/><path d=\"M39 38a8 8 0 0 1 7-3.5\" fill=\"none\" stroke=\"#ffc2dd\" stroke-width=\"2\"/></g>"],
  ["#7fd3a3","<path d=\"M22 40c2-14 8-22 17-28M43 42c-2-12-3-22-4-30\" fill=\"none\" stroke=\"#3f7a3a\" stroke-width=\"3\"/><path d=\"M39 12c6-5 12-3 15 1-6 3-11 3-15-1z\" fill=\"#3f9a4f\" stroke=\"#14101a\" stroke-width=\"2\"/><circle cx=\"21\" cy=\"44\" r=\"9.5\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"43\" cy=\"46\" r=\"9.5\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"17.5\" cy=\"40.5\" r=\"2.4\" fill=\"#fff\" opacity=\".55\"/><circle cx=\"39.5\" cy=\"42.5\" r=\"2.4\" fill=\"#fff\" opacity=\".55\"/>"],
  null,
  ["#8b7bff","<path d=\"M26 31V17l12-8v22z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"24\" y=\"30\" width=\"16\" height=\"7\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"22\" y=\"36\" width=\"20\" height=\"20\" rx=\"2.5\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M28 18v10\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".45\"/><path d=\"M47 46c-3-2-5-3.5-5-5.5a2.5 2.5 0 0 1 5-.6 2.5 2.5 0 0 1 5 .6c0 2-2 3.5-5 5.5z\" fill=\"#ff7eb6\"/>"],
  null,
  ["#5bc0ff","<path d=\"M13 32c-2-8 2-15 7-19 0 6 3 9 6 9-1-8 2-14 6-18 1 6 4 10 7 12 2-4 1-8 0-10 7 5 11 13 9 26z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M32 55c-12-8-20-14-20-24a10 10 0 0 1 20-4 10 10 0 0 1 20 4c0 10-8 16-20 24z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"22\" cy=\"31\" rx=\"2.6\" ry=\"4\" transform=\"rotate(30 22 31)\" fill=\"#fff\" opacity=\".45\"/>"],
  null,
  null,
  null,
  ["#7fd3a3","<g transform=\"translate(33 31) scale(.86) translate(-32 -32)\"><path d=\"M24 42C34 34 42 24 52 10M24 42c12-6 22-12 32-20M24 42c6-12 10-22 16-34M24 42c14-2 24-6 34-12M24 42c2-12 2-24 8-34\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.5\"/><path d=\"M24 42C34 34 42 24 52 10M24 42c12-6 22-12 32-20M24 42c6-12 10-22 16-34M24 42c14-2 24-6 34-12M24 42c2-12 2-24 8-34\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"2\"/><path d=\"M11 55 24 42\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"10\"/><path d=\"M11 55 24 42\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"6\"/><path d=\"M15 47l6 6M18 44l6 6\" stroke=\"#2b2340\" stroke-width=\"1.5\"/><circle cx=\"10\" cy=\"56\" r=\"3.2\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2\"/></g>"],
  ["#ff7eb6","<g transform=\"rotate(-28 32 32)\"><rect x=\"28.5\" y=\"41\" width=\"7\" height=\"19\" rx=\"2.5\" fill=\"#6b4a33\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"17\" y=\"5\" width=\"30\" height=\"38\" rx=\"11\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 24c-6.6-4.2-10.8-7.8-10.8-12.6a5.4 5.4 0 0 1 10.8-2.4 5.4 5.4 0 0 1 10.8 2.4c0 4.8-4.2 8.4-10.8 12.6z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M22 12v18\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".25\"/></g>"],
  ["#8b7bff","<path d=\"M9 30C5 34 3 40 5 47M55 30c4 4 6 10 4 17\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"3.5\"/><path d=\"M8 30c8-6 16-9 24-9s16 3 24 9c-2 8-10 12-16 12-4 0-6-3-8-3s-4 3-8 3c-6 0-14-4-16-12z\" fill=\"#14101a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M15 29q8-5 16-4\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".25\"/><path d=\"M18 32q4.5 3.5 9 0M37 32q4.5 3.5 9 0M19.5 34l-1 2M22.5 35.2v2.2M25.5 34l1 2M38.5 34l-1 2M41.5 35.2v2.2M44.5 34l1 2\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"1.8\"/>"],
  ["#e53950","<path d=\"M52 34a20 10 0 1 1 0-.1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"11\"/><path d=\"M52 34a20 10 0 1 1 0-.1\" fill=\"none\" stroke=\"#2b2340\" stroke-width=\"7\"/><circle cx=\"50.1\" cy=\"38.2\" r=\"2.6\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1.3\"/><circle cx=\"44.9\" cy=\"41.7\" r=\"2.6\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1.3\"/><circle cx=\"38.8\" cy=\"43.4\" r=\"2.6\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1.3\"/><circle cx=\"25.2\" cy=\"43.4\" r=\"2.6\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1.3\"/><circle cx=\"19.1\" cy=\"41.7\" r=\"2.6\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1.3\"/><circle cx=\"13.9\" cy=\"38.2\" r=\"2.6\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1.3\"/><rect x=\"27\" y=\"21\" width=\"10\" height=\"7\" rx=\"1.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M32 44a4.5 4.5 0 1 1 0 9 4.5 4.5 0 1 1 0-9\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5\"/><path d=\"M32 44a4.5 4.5 0 1 1 0 9 4.5 4.5 0 1 1 0-9\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.4\"/>"],
  null,
  null,
  ["#ff7eb6","<path d=\"M17 24 19 9M47 24 45 9\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M9 34c0-8 6-14 13-14 4 0 8 2 10 6 2-4 6-6 10-6 7 0 13 6 13 14 0 4-4 8-11 8-5 0-9-3-11-6-2 3-6 6-11 6-7 0-13-4-13-8z\" fill=\"#14101a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M10.5 31c1-6 6-10 11.5-10 4 0 8 2 10 6 2-4 6-6 10-6 5.5 0 10.5 4 11.5 10\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"2.2\" stroke-dasharray=\".5 3.2\"/><path d=\"M22 28q3 6 0 11M42 28q-3 6 0 11\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"1.6\"/><circle cx=\"32\" cy=\"34\" r=\"2.6\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"1.4\"/>"],
  ["#5bc0ff","<path d=\"M5 20c4 2 7 3 10 4M49 24c3-1 6-2 10-4\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M14 23c8 3 28 3 36 0L36 45c-2 4-6 4-8 0z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M16 25.5c8 2.5 24 2.5 32 0\" fill=\"none\" stroke=\"#ffc2dd\" stroke-width=\"2\" stroke-dasharray=\".5 3\"/><path d=\"M32 33.2c-3.5-2.2-5.8-4.2-5.8-6.7a2.9 2.9 0 0 1 5.8-1.3 2.9 2.9 0 0 1 5.8 1.3c0 2.6-2.2 4.5-5.8 6.7z\" fill=\"#ffc2dd\"/>"],
  ["#7fd3a3","<ellipse cx=\"32\" cy=\"27\" rx=\"24.2\" ry=\"12.7\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"6\" stroke-dasharray=\"0 5.2\"/><ellipse cx=\"32\" cy=\"27\" rx=\"24.2\" ry=\"12.7\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"3.2\" stroke-dasharray=\"0 5.2\"/><ellipse cx=\"32\" cy=\"27\" rx=\"21\" ry=\"9.5\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"9.5\"/><ellipse cx=\"32\" cy=\"27\" rx=\"21\" ry=\"9.5\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"6\"/><path d=\"M30 39 24 53l4.5-1.5L31 55l2-15zM34 39l6 14-4.5-1.5L33 55l-2-15z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M32 38C25 30 14 30 14 38s11 8 18 0zM32 38c7-8 18-8 18 0s-11 8-18 0z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M30 38c-4-3-9-4-11-2M34 38c4-3 9-4 11-2\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"2\"/><rect x=\"28\" y=\"34\" width=\"8\" height=\"8\" rx=\"3\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"2.5\"/>"],
  ["#2b2340","<rect x=\"11\" y=\"16\" width=\"42\" height=\"32\" rx=\"8\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"8\" opacity=\".22\"/><rect x=\"11\" y=\"16\" width=\"42\" height=\"32\" rx=\"8\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"2.5\"/><text x=\"32\" y=\"39.5\" text-anchor=\"middle\" font-size=\"21\" font-weight=\"800\" font-family=\"sans-serif\" fill=\"none\" stroke=\"#ff5d6c\" stroke-width=\"4.5\" opacity=\".35\">69</text><text x=\"32\" y=\"39.5\" text-anchor=\"middle\" font-size=\"21\" font-weight=\"800\" font-family=\"sans-serif\" fill=\"#ffd0d5\">69</text>"],
  ["#7fd3a3","<g transform=\"rotate(5 32 32)\"><path d=\"M25 8h14a5 5 0 0 1 5 5v38a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"17\" r=\"5\" fill=\"#7fd3a3\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M35.5 20.5 44 29\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"32\" cy=\"39\" r=\"10\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2.6\"/><rect x=\"24.5\" y=\"36.3\" width=\"15\" height=\"5.4\" rx=\"1.4\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2\"/></g>"],
  null,
  ["#8b7bff","<circle cx=\"32\" cy=\"15\" r=\"10\" fill=\"#ffb020\" opacity=\".25\"/><path d=\"M32 7c3 4 4.5 6.5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.5 1.5-5 4.5-9z\" fill=\"#ffb020\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M32 13c1.2 1.8 1.8 2.8 1.8 4a1.8 1.8 0 0 1-3.6 0c0-1.2.6-2.2 1.8-4z\" fill=\"#fff3b0\"/><path d=\"M32 21v4\" stroke=\"#14101a\" stroke-width=\"2\"/><rect x=\"23\" y=\"24\" width=\"18\" height=\"32\" rx=\"3\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M23.5 27c0 6 4 6 4 1 0 9 4 9 4 0 0 4 4 4 4-1 0 6 5 6 5 0\" fill=\"none\" stroke=\"#ff8d97\" stroke-width=\"2.4\"/><path d=\"M47 38c0 1.8-1.3 3-2.8 3s-2.8-1.2-2.8-3 2.8-5 2.8-5 2.8 3.2 2.8 5z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"1.6\"/>"],
  null,
  null,
  ["#ffb020","<path d=\"M32 15.5C28 10.5 20 10.5 17 17c-4 8-4 18 1 25 4 5 9 6.5 14 6.5s10-1.5 14-6.5c5-7 5-17 1-25-3-6.5-11-6.5-15-1.5z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M21.5 30c0-7 4.5-10 10.5-8.5 6-1.5 10.5 1.5 10.5 8.5S38 42 32 42s-10.5-5-10.5-12z\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M23.3 25.5c2-3 6-4 8.7-3 2.7-1 6.7 0 8.7 3l-1 2.3H24.3z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"1.6\"/><path d=\"M25 35c0-4 14-4 14 0v12c0 5-3.5 8-7 8s-7-3-7-8z\" fill=\"#ff7eb6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 37.5v9\" stroke=\"#e53950\" stroke-width=\"2.2\"/><ellipse cx=\"22\" cy=\"20\" rx=\"3\" ry=\"1.8\" transform=\"rotate(-50 22 20)\" fill=\"#f5efe6\" opacity=\".6\"/>"],
  ["#5bc0ff","<path d=\"M32 30C22 30 17 22 19 15c2-6 11-8 13-2 2-6 11-4 13 2 2 7-3 15-13 15\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7.5\"/><path d=\"M32 30C22 30 17 22 19 15c2-6 11-8 13-2 2-6 11-4 13 2 2 7-3 15-13 15\" fill=\"none\" stroke=\"#ffcf73\" stroke-width=\"4.5\"/><path d=\"M32 30C22 30 17 22 19 15c2-6 11-8 13-2 2-6 11-4 13 2 2 7-3 15-13 15\" fill=\"none\" stroke=\"#d98a2b\" stroke-width=\"4.5\" stroke-dasharray=\"1.4 2.6\" stroke-linecap=\"butt\"/><path d=\"M32 29c-5-3-8-9-6-14M32 29c5-3 8-9 6-14\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7.5\"/><path d=\"M32 29c-5-3-8-9-6-14M32 29c5-3 8-9 6-14\" fill=\"none\" stroke=\"#ffcf73\" stroke-width=\"4.5\"/><path d=\"M32 29c-5-3-8-9-6-14M32 29c5-3 8-9 6-14\" fill=\"none\" stroke=\"#d98a2b\" stroke-width=\"4.5\" stroke-dasharray=\"1.4 2.6\" stroke-linecap=\"butt\"/><path d=\"M29 44c-2 5-6 8-9 11\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7.5\"/><path d=\"M29 44c-2 5-6 8-9 11\" fill=\"none\" stroke=\"#ffcf73\" stroke-width=\"4.5\"/><path d=\"M29 44c-2 5-6 8-9 11\" fill=\"none\" stroke=\"#d98a2b\" stroke-width=\"4.5\" stroke-dasharray=\"1.4 2.6\" stroke-linecap=\"butt\"/><path d=\"M35 44c2 5 5 8 9 10\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7.5\"/><path d=\"M35 44c2 5 5 8 9 10\" fill=\"none\" stroke=\"#ffcf73\" stroke-width=\"4.5\"/><path d=\"M35 44c2 5 5 8 9 10\" fill=\"none\" stroke=\"#d98a2b\" stroke-width=\"4.5\" stroke-dasharray=\"1.4 2.6\" stroke-linecap=\"butt\"/><rect x=\"23.5\" y=\"27\" width=\"17\" height=\"19\" rx=\"6\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M24.5 32.5l15-2.5M24.5 37.5l15-2.5M24.5 42.5l15-2.5\" stroke=\"#d98a2b\" stroke-width=\"2.4\"/><path d=\"M24.5 32.5l15-2.5M24.5 37.5l15-2.5M24.5 42.5l15-2.5\" stroke=\"#14101a\" stroke-width=\".9\"/><circle cx=\"20\" cy=\"55\" r=\"3.3\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2.2\"/><circle cx=\"44\" cy=\"54\" r=\"3.3\" fill=\"#ffcf73\" stroke=\"#14101a\" stroke-width=\"2.2\"/><path d=\"M18.5 54.5l3 1M42.5 53.5l3 1\" stroke=\"#d98a2b\" stroke-width=\"1.4\"/>"],
  ["#ff7eb6","<path d=\"M5 28c12 7 42 7 54 0\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"9\"/><path d=\"M5 28c12 7 42 7 54 0\" fill=\"none\" stroke=\"#2b2340\" stroke-width=\"5.5\"/><rect x=\"3\" y=\"24\" width=\"6\" height=\"7\" rx=\"1.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"1.8\"/><rect x=\"55\" y=\"24\" width=\"6\" height=\"7\" rx=\"1.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"1.8\"/><circle cx=\"32\" cy=\"34\" r=\"10\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"28.5\" cy=\"30\" rx=\"3\" ry=\"2\" transform=\"rotate(-30 28.5 30)\" fill=\"#fff\" opacity=\".55\"/>"],
  ["#5bc0ff","<path d=\"M32 8c11 0 18 8.5 18 21v8c0 7.5-3.5 12.5-8 15l2.5 4.5h-25L22 52c-4.5-2.5-8-7.5-8-15v-8C14 16.5 21 8 32 8z\" fill=\"#14101a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M20 30c0-9 4-15 10-17\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"3.6\" opacity=\".85\"/><path d=\"M45.5 33c.2 5-1 9-3.5 12\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"2.6\" opacity=\".6\"/><circle cx=\"37.5\" cy=\"14\" r=\"1.7\" fill=\"#f5efe6\" opacity=\".85\"/><path d=\"M32 33v5\" stroke=\"#4a4157\" stroke-width=\"3\"/><path d=\"M18.5 28.5c3-4 9.5-4 12 0-2.5 4-9 4-12 0z\" fill=\"#f5efe6\" stroke=\"#4a4157\" stroke-width=\"1.6\"/><path d=\"M33.5 28.5c2.5-4 9-4 12 0-3 4-9.5 4-12 0z\" fill=\"#f5efe6\" stroke=\"#4a4157\" stroke-width=\"1.6\"/><circle cx=\"25\" cy=\"28.5\" r=\"2.7\" fill=\"#b07a4a\"/><circle cx=\"39\" cy=\"28.5\" r=\"2.7\" fill=\"#b07a4a\"/><circle cx=\"25\" cy=\"28.5\" r=\"1.3\" fill=\"#14101a\"/><circle cx=\"39\" cy=\"28.5\" r=\"1.3\" fill=\"#14101a\"/><circle cx=\"25.9\" cy=\"27.6\" r=\".7\" fill=\"#f5efe6\"/><circle cx=\"39.9\" cy=\"27.6\" r=\".7\" fill=\"#f5efe6\"/><rect x=\"20.5\" y=\"41\" width=\"23\" height=\"7\" rx=\"3.5\" fill=\"#e53950\" stroke=\"#f5efe6\" stroke-width=\"1.2\"/><path d=\"M23.5 44.5h17\" stroke=\"#14101a\" stroke-width=\"3\" stroke-dasharray=\"1.1 1.2\" stroke-linecap=\"butt\"/><path d=\"M23.5 44.5h17\" stroke=\"#c9d3dd\" stroke-width=\"1\" stroke-dasharray=\"1.1 1.2\" stroke-linecap=\"butt\"/><rect x=\"40.5\" y=\"42.5\" width=\"4\" height=\"9\" rx=\"1.3\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"1.6\"/>"],
  null,
  ["#ffb020","<g transform=\"translate(32 32) scale(.9) translate(-31 -33)\"><path d=\"M20 44 40 22\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7\"/><path d=\"M20 44 40 22\" fill=\"none\" stroke=\"#2b2340\" stroke-width=\"3.4\"/><circle cx=\"12\" cy=\"53\" r=\"3.6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.5\"/><circle cx=\"12\" cy=\"53\" r=\"3.6\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"2\"/><path d=\"M15 50 23 41\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"11\"/><path d=\"M15 50 23 41\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"7.5\"/><path d=\"M16.5 45.5l3.5 3.2M19 42.8l3.5 3.2\" stroke=\"#2b2340\" stroke-width=\"1.6\"/><path d=\"M32 29.4c-3.7-2.4-6.1-4.4-6.1-7.1a3.1 3.1 0 0 1 6.1-1.4 3.1 3.1 0 0 1 6.1 1.4c0 2.7-2.4 4.8-6.1 7.1z\" transform=\"translate(43.5 18.5) rotate(45) scale(1.55) translate(-32 -24.5)\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"1.7\"/><path d=\"M37.5 15.5c1.5-2 4-2.5 5.5-1.5\" transform=\"translate(4 -2)\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"1.6\" opacity=\".7\"/></g>"],
  null,
  ["#ff7eb6","<path d=\"M32 13v-2.5a3 3 0 1 0-3-3M13 22l19-8 19 8\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"2.6\"/><path d=\"M19 22c5 4 21 4 26 0l-2 14c2 7 4 13 4 20H17c0-7 2-13 4-20z\" fill=\"#14101a\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M20 23.5c5 3.5 19 3.5 24 0\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"2\" stroke-dasharray=\".5 2.8\"/><path d=\"M29 28l6 3.5-6 3.5 6 3.5-6 3.5 6 3.5-6 3.5 6 3.5\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"1.7\"/><path d=\"M24 28c1 9-1 18-2 26M40 28c-1 9 1 18 2 26\" fill=\"none\" stroke=\"#4a4157\" stroke-width=\"1.6\"/>"],
  null,
  null,
  ["#ff5a36","<path d=\"M9 27c6-4 15-4 23 2 8-6 17-6 23-2 0 10-4 16-11 16-5 0-8-4-12-7-4 3-7 7-12 7-7 0-11-6-11-16z\" fill=\"#14101a\" stroke=\"#ff7eb6\" stroke-width=\"2\"/><g fill=\"none\" stroke=\"#4a4157\" stroke-width=\"1.2\"><circle cx=\"14\" cy=\"31\" r=\"1.8\"/><circle cx=\"50\" cy=\"31\" r=\"1.8\"/><circle cx=\"32\" cy=\"34\" r=\"1.6\"/><circle cx=\"18\" cy=\"38\" r=\"1.5\"/><circle cx=\"46\" cy=\"38\" r=\"1.5\"/></g><ellipse cx=\"22\" cy=\"32\" rx=\"5\" ry=\"3.4\" fill=\"#f5efe6\"/><circle cx=\"22.5\" cy=\"32.5\" r=\"2\" fill=\"#14101a\"/><path d=\"M17.5 29.5l-2-2M20 28.4l-1-2.4M23 28.2l.2-2.6\" stroke=\"#ff7eb6\" stroke-width=\"1.4\"/><path d=\"M37.5 33q4.5 3 9 0\" fill=\"none\" stroke=\"#f5efe6\" stroke-width=\"2.2\"/><path d=\"M32 46c-3.5 4 3.5 5 0 9\" fill=\"none\" stroke=\"#ff7eb6\" stroke-width=\"2\"/>"],
  ["#7fd3a3","<path d=\"M18 22v6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.5\"/><path d=\"M18 22v6\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2\"/><ellipse cx=\"18\" cy=\"40\" rx=\"7.5\" ry=\"9\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"9.5\"/><ellipse cx=\"18\" cy=\"40\" rx=\"7.5\" ry=\"9\" fill=\"none\" stroke=\"#2b2340\" stroke-width=\"6.5\"/><ellipse cx=\"18\" cy=\"40\" rx=\"5\" ry=\"6.5\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"1.8\"/><circle cx=\"18\" cy=\"29.5\" r=\"2.6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.2\"/><circle cx=\"18\" cy=\"29.5\" r=\"2.6\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"1.8\"/><rect x=\"6.9\" y=\"36.5\" width=\"5.2\" height=\"7\" rx=\"1\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"1.8\"/><path d=\"M46 22v6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.5\"/><path d=\"M46 22v6\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2\"/><ellipse cx=\"46\" cy=\"40\" rx=\"7.5\" ry=\"9\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"9.5\"/><ellipse cx=\"46\" cy=\"40\" rx=\"7.5\" ry=\"9\" fill=\"none\" stroke=\"#2b2340\" stroke-width=\"6.5\"/><ellipse cx=\"46\" cy=\"40\" rx=\"5\" ry=\"6.5\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"1.8\"/><circle cx=\"46\" cy=\"29.5\" r=\"2.6\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.2\"/><circle cx=\"46\" cy=\"29.5\" r=\"2.6\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"1.8\"/><rect x=\"51.9\" y=\"36.5\" width=\"5.2\" height=\"7\" rx=\"1\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"1.8\"/><path d=\"M12 20H52\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"7.5\"/><path d=\"M12 20H52\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"4\"/><rect x=\"7\" y=\"15\" width=\"6\" height=\"10\" rx=\"2\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"51\" y=\"15\" width=\"6\" height=\"10\" rx=\"2\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M32 29.4c-3.7-2.4-6.1-4.4-6.1-7.1a3.1 3.1 0 0 1 6.1-1.4 3.1 3.1 0 0 1 6.1 1.4c0 2.7-2.4 4.8-6.1 7.1z\" transform=\"translate(0 -6)\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"1.8\"/>"],
  ["#ff7eb6","<g transform=\"translate(32 32) scale(.93) translate(-32 -33)\"><path d=\"M15.5 36C18 50 26 54 32 54s14-4 16.5-18\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.5\"/><path d=\"M15.5 36C18 50 26 54 32 54s14-4 16.5-18\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.6\" stroke-dasharray=\"3 1.6\" stroke-linecap=\"butt\"/><g transform=\"rotate(-18 17 23)\"><path d=\"M12 14h10v14a5 5 0 0 1-10 0z\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M17 16v9\" stroke=\"#14101a\" stroke-width=\"1.8\"/><rect x=\"10.5\" y=\"9\" width=\"13\" height=\"6.5\" rx=\"2.2\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2.2\"/><rect x=\"11\" y=\"24\" width=\"12\" height=\"3.6\" rx=\"1.4\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"1.8\"/><circle cx=\"17\" cy=\"35.5\" r=\"2.4\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4\"/><circle cx=\"17\" cy=\"35.5\" r=\"2.4\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"1.7\"/></g><g transform=\"rotate(18 47 23)\"><path d=\"M42 14h10v14a5 5 0 0 1-10 0z\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M47 16v9\" stroke=\"#14101a\" stroke-width=\"1.8\"/><rect x=\"40.5\" y=\"9\" width=\"13\" height=\"6.5\" rx=\"2.2\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2.2\"/><rect x=\"41\" y=\"24\" width=\"12\" height=\"3.6\" rx=\"1.4\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"1.8\"/><circle cx=\"47\" cy=\"35.5\" r=\"2.4\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4\"/><circle cx=\"47\" cy=\"35.5\" r=\"2.4\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"1.7\"/></g><path d=\"M32 29.4c-3.7-2.4-6.1-4.4-6.1-7.1a3.1 3.1 0 0 1 6.1-1.4 3.1 3.1 0 0 1 6.1 1.4c0 2.7-2.4 4.8-6.1 7.1z\" transform=\"translate(32 49) scale(1.25) translate(-32 -21)\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"1.6\"/></g>"],
  ["#5bc0ff","<path d=\"M16 30 11 56M48 30l5 26M23 30l5 26M41 30l-5 26\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"6\"/><path d=\"M16 30 11 56M48 30l5 26M23 30l5 26M41 30l-5 26\" fill=\"none\" stroke=\"#b07a4a\" stroke-width=\"3\"/><rect x=\"7\" y=\"40\" width=\"15\" height=\"6\" rx=\"3\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2.5\"/><rect x=\"42\" y=\"40\" width=\"15\" height=\"6\" rx=\"3\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"2.5\"/><path d=\"M10 26c0-4 4-6 8-6h28c4 0 8 2 8 6v5H10z\" fill=\"#e53950\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M17 23h30\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".3\"/><circle cx=\"12\" cy=\"52\" r=\"2.6\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2\"/><circle cx=\"52\" cy=\"52\" r=\"2.6\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2\"/>"],
  ["#ffb020","<path d=\"M24 48c10 0 18-14 22-24 3-7 6-11 9-13\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.5\"/><path d=\"M24 48c10 0 18-14 22-24 3-7 6-11 9-13\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"2.6\"/><circle cx=\"55\" cy=\"10\" r=\"5\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"6\"/><circle cx=\"55\" cy=\"10\" r=\"5\" fill=\"none\" stroke=\"#e53950\" stroke-width=\"2.8\"/><path d=\"M38 40a14 7 0 1 1 0-.1\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"9\"/><path d=\"M38 40a14 7 0 1 1 0-.1\" fill=\"none\" stroke=\"#2b2340\" stroke-width=\"5.5\"/><circle cx=\"37.2\" cy=\"42.4\" r=\"1.9\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1\"/><circle cx=\"33.9\" cy=\"44.9\" r=\"1.9\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1\"/><circle cx=\"14.1\" cy=\"44.9\" r=\"1.9\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1\"/><circle cx=\"10.8\" cy=\"42.4\" r=\"1.9\" fill=\"#e6ebf0\" stroke=\"#14101a\" stroke-width=\"1\"/><path d=\"M24 44.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 1 1 0-6.4\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"4.5\"/><path d=\"M24 44.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 1 1 0-6.4\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2\"/>"],
  ["#5bc0ff","<g transform=\"rotate(-32 32 32)\"><path d=\"M23 16h15a8 16 0 0 1 0 32H23a8 16 0 0 1 0-32z\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"23\" cy=\"32\" rx=\"8\" ry=\"16\" fill=\"#4a4157\" stroke=\"#14101a\" stroke-width=\"3\"/><ellipse cx=\"24.3\" cy=\"32\" rx=\"4.6\" ry=\"12.3\" fill=\"#14101a\"/><path d=\"M30 20h10M30 44h10\" stroke=\"#ff7eb6\" stroke-width=\"1.5\" stroke-dasharray=\"1.2 2\"/><path d=\"M30 48v3.5a5 5 0 0 0 10 0V48\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.5\"/><path d=\"M30 48v3.5a5 5 0 0 0 10 0V48\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.6\"/><rect x=\"28.5\" y=\"45\" width=\"13\" height=\"4\" rx=\"1.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"1.8\"/><path d=\"M37 27.5h12a2.5 2.5 0 0 1 0 9H37z\" fill=\"#2b2340\" stroke=\"#14101a\" stroke-width=\"2.5\"/><circle cx=\"46\" cy=\"32\" r=\"1.2\" fill=\"#c9d3dd\"/><rect x=\"30\" y=\"23\" width=\"11\" height=\"18\" rx=\"2.5\" fill=\"none\" stroke=\"#14101a\" stroke-width=\"5.5\"/><rect x=\"30\" y=\"23\" width=\"11\" height=\"18\" rx=\"2.5\" fill=\"none\" stroke=\"#c9d3dd\" stroke-width=\"2.8\"/><path d=\"M30 32h8\" stroke=\"#14101a\" stroke-width=\"4\"/><path d=\"M30 32h8\" stroke=\"#c9d3dd\" stroke-width=\"1.8\"/></g>"],
  null,
  null,
  null,
  ["#8b7bff","<path d=\"M18 13h28l-4 34H22z\" fill=\"#5bc0ff\" stroke=\"#14101a\" stroke-width=\"3\"/><rect x=\"16\" y=\"7\" width=\"32\" height=\"6\" rx=\"1.5\" fill=\"#c9d3dd\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M20 10h24\" stroke=\"#8a95a3\" stroke-width=\"1.4\" stroke-dasharray=\"1.5 1.5\"/><rect x=\"24.5\" y=\"47\" width=\"15\" height=\"10\" rx=\"2.5\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"3\"/><path d=\"M32 22c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z\" fill=\"#f5efe6\" stroke=\"#14101a\" stroke-width=\"2\"/><path d=\"M24 17c-1 8-1 16 0 24\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".4\"/><path d=\"M52 50c0 1.8-1.3 3-2.8 3s-2.8-1.2-2.8-3 2.8-5 2.8-5 2.8 3.2 2.8 5z\" fill=\"#c6e8ff\" stroke=\"#14101a\" stroke-width=\"1.6\"/>"],
  null,
  null,
  null
];
// Catégories de la grille d'avatars (les numéros ne changent jamais : ils circulent entre téléphones).
const AV_CATS = [["soiree", tr("Soirée", "Party"), [0, 1, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]], ["jeux", tr("Jeux", "Games"), [3, 4, 30, 31, 32, 33, 34, 35, 36]], ["ambiance", tr("Ambiance", "Vibes"), [9, 10, 37, 38, 39, 40, 41, 42, 43, 44]], ["animaux", tr("Animaux", "Animals"), [5, 6, 16, 17, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]], ["persos", tr("Persos", "Characters"), [7, 8, 15, 18, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]], ["objets", tr("Miam & co", "Snacks & stuff"), [11, 19, 12, 13, 14, 67, 68, 69, 70, 71, 72, 73, 74, 75]], ["hot", "Hot", [76, 77, 78, 79, 80, 82, 84, 88, 89, 90, 91, 94, 95, 96, 97, 98, 100, 103, 104, 105, 106, 108, 110, 113, 114, 115, 116, 117, 118, 122]]];
// Vignette de chaque onglet (position dans la liste de l'onglet).
const AV_TABICON = { soiree: 0, jeux: 0, ambiance: 0, animaux: 1, persos: 1, objets: 0, hot: 0 };
const AV_RX = /^av:(\d{1,3})$/;
// Les avatars retirés restent à « null » pour que les numéros des autres ne bougent pas.
const avNum = v => { const m = AV_RX.exec(v || ""); return m && AVATARS[+m[1]] ? +m[1] : -1; };
const avSvg = n => '<svg class="avsvg" viewBox="0 0 64 64" aria-hidden="true"><g stroke-linecap="round" stroke-linejoin="round"><rect width="64" height="64" fill="' + AVATARS[n][0] + '"/>' + AVATARS[n][1] + "</g></svg>";
// Ce qu'on affiche pour une photo : soit une vraie photo, soit un avatar intégré.
const AV_HOT = new Set((AV_CATS.find(c => c[0] === "hot") || [0, 0, []])[2]);
const AV_MASK = '<svg class="avsvg" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#3a3346"/><text x="32" y="38.5" text-anchor="middle" font-size="16" font-weight="800" font-family="sans-serif" fill="#b9afc6">18+</text></svg>';
const phHTML = ph => { const n = avNum(ph); return n >= 0 ? (AV_HOT.has(n) && !myHard() ? AV_MASK : avSvg(n)) : '<img alt="" src="' + ph + '">'; };
const okPhoto = v => typeof v === "string" && (avNum(v) >= 0 || (v.length < 3000 && PHOTO_RX.test(v)));
function gPhotoOf(peer){ const x = pres(peer).x || {}; return okPhoto(x._ph) ? x._ph : ""; }
function myPhoto(){ const v = store().photo; return okPhoto(v) ? v : ""; }
function shrinkPhoto(file){
  return new Promise(res => {
    if(!file){ res(""); return; }
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      try{
        const c = document.createElement("canvas"), S2 = 64, m = Math.min(img.naturalWidth, img.naturalHeight);
        c.width = c.height = S2; const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, S2, S2);
        g.drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, S2, S2);
        let d = c.toDataURL("image/jpeg", .7); if(d.length > 2400) d = c.toDataURL("image/jpeg", .5); if(d.length > 2400) d = c.toDataURL("image/jpeg", .35);
        res(d.length < 2800 ? d : ""); // petite : la présence d'un joueur doit rester légère
      }catch(e){ res(""); }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(""); };
    img.src = url;
  });
}
// Bouton profil en haut à gauche de l'accueil : la photo, sinon l'initiale du prénom.
function renderMe(){
  const el = $("#h-me"); if(!el) return;
  const ph = myPhoto(), nm = clean(store().name, 16), key = (ph ? ph.length + ph.slice(-24) : "") + "|" + nm + "|" + myHard();
  if(el.dataset.key === key) return; el.dataset.key = key;
  el.innerHTML = ph ? phHTML(ph) : nm ? esc(nm.slice(0, 1).toUpperCase()) : '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
}
const gProfShort = () => { const gp = gProf(store().gp); return gp.drink === "sans" ? tr("Sans alcool", "No alcohol") : DRINKS[gp.drink].name + (gp.nolim ? tr(" · sans limite", " · no limit") : " · max " + gVerres(gLim(gp), gp.drink)); };
// Texte d'une limite : « 3 demis (25 cl) ≈ 24 gorgées · environ 3 verres standard ».
function gLimText(drink, lim){
  const d = DRINKS[drink]; if(!d) return "";
  return gVerres(lim, drink) + " · " + tr("≈ " + Math.round(lim * d.sips) + " gorgées", "≈ " + Math.round(lim * d.sips) + " sips") + " · " + tr("environ " + lim * d.std + " verre" + (lim * d.std > 1 ? "s" : "") + " standard", "about " + lim * d.std + " standard drink" + (lim * d.std > 1 ? "s" : ""));
}
function gProfilePage(){
  SB.page(tr("Mon profil", "My profile"), root => {
    let pinUI = null;
    const curMode = () => (myKid() ? "kid" : myHard() ? "hard" : "soft");
    const setMode = (m, pin) => {
      persist(m === "kid" ? { kid: { on: true, pin }, hard: false } : { kid: null, hard: m === "hard" });
      if(N.host && N.g) hostSetG({ hd: m === "hard", kid: m === "kid", kpin: m === "kid" ? pin : null });
      syncSoftClass(); renderMe(); if(HOME_REDRAW) HOME_REDRAW();
      toast({ hard: tr("Mode Hard activé.", "Hard mode on."), soft: tr("Mode Soft activé.", "Soft mode on."), kid: tr("Mode Enfant activé et verrouillé.", "Kids mode on and locked.") }[m]);
    };
    const inp = (id, ph) => '<input class="txt pin" id="' + id + '" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="' + ph + '">';
    const pinBox = () => {
      if(!pinUI) return "";
      const k = pinUI.k;
      const body = k === "set" ? '<b>' + tr("Choisis un code à 4 chiffres", "Pick a 4-digit code") + '</b><span class="sm">' + tr("Il servira à sortir du mode Enfant. Ne le donne pas aux enfants.", "You'll need it to leave Kids mode. Don't give it to the kids.") + "</span>" + inp("pf-pin", tr("Code", "Code")) + inp("pf-pin2", tr("Confirme le code", "Once more"))
        : k === "change" ? '<b>' + tr("Changer le code", "Change the code") + "</b>" + inp("pf-pin", tr("Code actuel", "Current code")) + inp("pf-pin2", tr("Nouveau code", "New code")) + inp("pf-pin3", tr("Confirme le nouveau code", "New code, again"))
        : k === "unlock" ? '<b>' + tr("Code du mode Enfant", "Kids mode code") + '</b><span class="sm">' + tr("Pour quitter le mode Enfant, entre le code.", "To leave Kids mode, enter the code.") + "</span>" + inp("pf-pin", "• • • •")
        : '<b>' + tr("Question pour les adultes", "Grown-ups question") + '</b><span class="sm">' + tr("Combien font " + pinUI.a + " × " + pinUI.b + " ? La bonne réponse désactive le mode Enfant.", "What is " + pinUI.a + " × " + pinUI.b + "? The right answer turns off Kids mode.") + '</span><input class="txt pin" id="pf-pin" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">';
      return '<div class="gs-box pinbox">' + body + '<p class="err" data-perr hidden></p><div class="pinbtns"><button class="btn acc" type="button" data-pok>' + (k === "set" ? tr("Activer le mode Enfant", "Turn on Kids mode") : tr("Valider", "Confirm")) + '</button><button class="btn ghost" type="button" data-pcancel>' + tr("Annuler", "Cancel") + "</button></div>" +
        (k === "unlock" ? '<button class="link" type="button" data-pforgot style="align-self:flex-start">' + tr("Code oublié ?", "Forgot the code?") + "</button>" : "") + "</div>";
    };
    const cur = avNum(store().photo); let avTab = (AV_CATS.find(c => c[2].includes(cur)) || AV_CATS[0])[0];
    // Trois vues dans la même page : le profil, le choix de l'avatar, le taux d'alcool.
    let view = "main";
    const go = v => { view = v; buzz(6); draw(); root.scrollTop = 0; try{ $("#page-root").scrollTop = 0; $("#s-page").scrollTop = 0; window.scrollTo(0, 0); }catch(e){} };
    SB._pageBack = () => { if(view === "main") return false; go("main"); return true; };
    const CHEV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    const LOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    const backRow = () => ""; // le bouton retour de l'en-tête ramène déjà au profil
    const SHORT = { sans: tr("Pas d'alcool", "No alcohol"), biere: tr("Bière", "Beer"), vin: tr("Vin", "Wine"), cocktail: "Cocktail", fort: "Shots" };
    const MODES = [["hard", "Hard", tr("Tout le contenu : jeux et paquets 18+, avatars Hot, gages avec alcool.", "Everything: 18+ games and packs, Hot avatars, drinking forfeits.")],
      ["soft", "Soft", tr("Rien de 18+ et des gages sans alcool. Pratique en famille ou avec des gens que tu connais peu.", "Nothing 18+ and alcohol-free forfeits. Handy with family or people you barely know.")],
      ["kid", tr("Enfant", "Kids"), tr("Jeux tout public seulement. Mode verrouillé par un code à 4 chiffres.", "Family-friendly games only, locked with a 4-digit code.")]];
    const mainHTML = () => {
      const gp = gProf(store().gp), lim = gLim(gp), d = DRINKS[gp.drink], ph = myPhoto(), nm = clean(store().name, 16), t = alcTotals(), bac = alcBac(), S = gLocalSettings();
      const mode = curMode(), md = MODES.find(m => m[0] === mode) || MODES[0];
      return '<div class="gs pf2">' +
        '<div class="pf-id"><button type="button" class="pf-avb" data-pf-av aria-label="' + tr("Changer d'avatar ou de photo", "Change avatar or photo") + '"><span class="face">' + (ph ? phHTML(ph) : nm ? esc(nm.slice(0, 1).toUpperCase()) : "?") + '</span><span class="pen"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></span></button>' +
          '<label class="lbl pf-nm" for="pf-name">' + tr("Ton prénom", "Your name") + '<input class="txt" id="pf-name" maxlength="16" autocomplete="given-name" value="' + esc(nm) + '" placeholder="' + tr("Léa", "Alex") + '"></label></div>' +
        '<div class="field"><span class="eyebrow">' + tr("Mode de jeu", "Game mode") + '</span><div class="seg pf-modes">' +
          MODES.map(m => '<button type="button" data-md="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '">' + (myKid() && m[0] !== "kid" ? LOCK + " " : "") + esc(m[1]) + "</button>").join("") + "</div>" +
          '<p class="sm pf-desc">' + esc(md[2]) + (N.nr ? tr(" Dans un salon, c'est le mode de l'hôte qui compte.", " In a room, the host's mode applies.") : "") + "</p>" + pinBox() +
          (myKid() && !pinUI ? '<div class="row" style="gap:14px"><button class="link" type="button" data-pexit>' + tr("Quitter le mode Enfant", "Leave Kids mode") + '</button><button class="link" type="button" data-pchg>' + tr("Changer le code", "Change the code") + "</button></div>" : "") + "</div>" +
        (roomHard() ? '<div class="field"><span class="eyebrow">' + tr("Ce soir, je bois", "Tonight I'm drinking") + '</span><div class="pf-chips">' +
          ["sans"].concat(Object.keys(DRINKS)).map(k => '<button type="button" class="pf-chip" data-gd="' + k + '" aria-pressed="' + (gp.drink === k) + '">' + esc(SHORT[k]) + "</button>").join("") + "</div>" +
          (d ? '<div class="gs-box">' +
            // Limite : un seul choix « Avec / Sans limite », valable pour tous les alcools ; le nombre de verres n'apparaît qu'avec limite.
            '<div class="gs-row"><span class="tx"><b>' + tr("Ma limite", "My limit") + '</b><span class="sm">' + tr("Pour tous les alcools", "For every drink") + '</span></span><div class="seg pf-lang">' +
              '<button type="button" data-gnolim="0" aria-pressed="' + !gp.nolim + '">' + tr("Avec", "On") + '</button><button type="button" data-gnolim="1" aria-pressed="' + !!gp.nolim + '">' + tr("Sans limite", "No limit") + "</button></div></div>" +
            (gp.nolim ? "" : '<div class="gs-row"><span class="tx"><b>' + esc(gVerres(lim, gp.drink)) + '</b><span class="sm">' + tr("Au-delà, gages sans alcool", "Then no-alcohol forfeits") + "</span></span>" +
              '<button type="button" class="gs-b" data-gl="-1" aria-label="' + tr("Moins", "Less") + '">−</button><b class="gs-n">' + lim + '</b><button type="button" class="gs-b" data-gl="1" aria-label="' + tr("Plus", "More") + '">+</button></div>') +
            '<div class="gs-row"><span class="tx"><b>' + tr("Mon compteur", "My counter") + '</b><span class="sm">' + esc(tr(t.n + (t.n > 1 ? " verres notés" : " verre noté"), t.n + (t.n === 1 ? " drink logged" : " drinks logged")) + " · " + alcStd(t.tot)) + "</span></span>" +
              '<button type="button" class="gs-b" data-alc="-1" aria-label="' + tr("Retirer le dernier verre", "Remove the last drink") + '"' + (t.n ? "" : " disabled") + '>−</button><button type="button" class="gs-b pf-plus" data-alc="1" aria-label="' + tr("Ajouter un verre", "Add a drink") + '">+</button></div>' +
            '<div class="gs-row"><button type="button" class="pf-go" data-pf-alc><span class="t">' + tr("Taux d'alcool estimé", "Blood alcohol estimate") + '</span><span class="v">' + (bac == null ? tr("À régler", "Set up") : "≈ " + alcNum(bac, 2) + " g/L") + "</span>" + CHEV + "</button></div>" +
          "</div>" : "") + "</div>"
          : "") +
        '<div class="field"><span class="eyebrow">' + tr("Réglages", "Settings") + '</span><div class="gs-box">' +
          '<div class="gs-row"><button type="button" class="pf-go" data-pf-gages><span class="t">' + tr("Gages", "Forfeits") + '</span><span class="v">' + (S.on ? tr("Activés", "On") : tr("Désactivés", "Off")) + "</span>" + CHEV + "</button></div>" +
          '<div class="gs-row"><span class="tx"><b>' + tr("Langue", "Language") + '</b></span><div class="seg pf-lang">' + [["fr", "FR"], ["en", "EN"]].map(l => '<button type="button" data-pf-lang="' + l[0] + '" aria-pressed="' + (LANG === l[0]) + '">' + l[1] + "</button>").join("") + "</div></div>" +
        "</div></div>" +
        '<p class="sm pf-priv">' + LOCK + tr(" Tout reste sur ton téléphone. Les autres ne voient que ta photo et ton prénom.", " Everything stays on your phone. Others only see your photo and name.") + "</p>" +
        '<p class="sm" style="margin:0; text-align:center">Soirée Box ' + VERSION + (IS_BETA ? " · beta" : "") + "</p></div>";
    };
    const avatarHTML = () => {
      if(avTab === "hot" && !myHard()) avTab = AV_CATS[0][0];
      const ph = myPhoto(), nm = clean(store().name, 16);
      return '<div class="gs pf2">' + backRow(tr("Profil", "Profile")) +
        '<div class="pf-avtop"><span class="pf-avbig">' + (ph ? phHTML(ph) : nm ? esc(nm.slice(0, 1).toUpperCase()) : "?") + '</span><div class="pf-act">' +
          '<input class="pr-file" type="file" accept="image/*" data-pf-file aria-label="' + tr("Choisir une photo", "Choose a photo") + '">' +
          '<button class="btn ghost" type="button" data-pf-pick>' + tr("Choisir une photo", "Choose a photo") + '</button><div class="row" style="gap:14px"><button class="link" type="button" data-pf-rand>' + tr("Au hasard", "Random") + "</button>" +
          (ph ? '<button class="link" type="button" data-pf-del>' + (avNum(ph) >= 0 ? tr("Retirer l'avatar", "Remove avatar") : tr("Retirer la photo", "Remove photo")) + "</button>" : "") + "</div></div></div>" +
        '<div class="avtabs">' + AV_CATS.filter(c => c[0] !== "hot" || myHard()).map(c => '<button type="button" class="avtab' + (c[0] === "hot" ? " hot" : "") + '" data-avc="' + c[0] + '" aria-pressed="' + (c[0] === avTab) + '"><span class="avtab-i">' + avSvg(c[2][AV_TABICON[c[0]] || 0]) + '</span><span class="avtab-t">' + esc(c[1]) + '</span><span class="avtab-n">' + c[2].length + "</span></button>").join("") + "</div>" +
        '<div class="avgrid">' + (AV_CATS.find(c => c[0] === avTab) || AV_CATS[0])[2].map(i => '<button type="button" class="avpick" data-av="' + i + '" aria-pressed="' + (ph === "av:" + i) + '" aria-label="Avatar ' + (i + 1) + '">' + avSvg(i) + "</button>").join("") + "</div>" +
        '<button class="btn acc" type="button" data-pf-back>' + tr("Valider", "Done") + "</button></div>";
    };
    const alcHTML = () => {
      const gp = gProf(store().gp), d = DRINKS[gp.drink], a = alcStore(), t = alcTotals(), bac = alcBac();
      const pct = bac == null ? 0 : Math.min(100, bac / 1.5 * 100);
      return '<div class="gs pf2">' + backRow(tr("Profil", "Profile")) +
        '<div class="pf-bac"><span class="sm">' + esc(tr("Estimation ce soir · ", "Tonight's estimate · ") + alcStd(t.tot)) + "</span>" +
          (bac == null ? '<p class="pf-bac-n" style="font-size:22px">' + tr("Indique ton poids et la base de calcul", "Enter your weight and calculation basis") + "</p>"
            : '<p class="pf-bac-n">' + alcNum(bac, 2) + " <small>g/L</small></p>") +
          '<div class="pf-gauge"><i style="width:' + pct + '%"></i><span class="mk"></span></div><div class="pf-gl"><span>0</span><span>' + tr("0,5 · limite au volant", "0.5 · French driving limit") + "</span><span>1,5</span></div></div>" +
        '<div class="gs-box">' +
          '<div class="gs-row"><label class="tx" for="pf-kg"><b>' + tr("Poids", "Weight") + '</b><span class="sm">' + tr("Entre 35 et 250 kg", "Between 35 and 250 kg") + '</span></label><span class="pf-kg"><input class="txt" id="pf-kg" type="number" inputmode="numeric" pattern="[0-9]*" min="35" max="250" step="1" placeholder="70" value="' + (a.kg || "") + '"><b>kg</b></span></div>' +
          '<div class="gs-row"><span class="tx"><b>' + tr("Base de calcul", "Basis") + '</b></span><div class="seg pf-lang">' + [[0.7, tr("Homme", "Male")], [0.6, tr("Femme", "Female")]].map(o => '<button type="button" data-alcr="' + o[0] + '" aria-pressed="' + (a.r === o[0]) + '">' + o[1] + "</button>").join("") + "</div></div>" +
        "</div>" +
        '<p class="sm" style="margin:0">' + tr("Calcul très approximatif (formule de Widmark) : il ne tient compte ni du repas, ni de ta santé, ni de tes médicaments. Ton poids reste sur ce téléphone.", "A very rough estimate (Widmark formula): it ignores food, health and medication. Your weight stays on this phone.") + "</p>" +
        '<div class="pf-warn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-5l2-5h11l3 5h2v5h-2M9 17h6M3 12h18"/></svg>' + tr("Si tu as bu, tu ne prends pas le volant.", "If you've been drinking, don't drive.") + "</div>" +
        (d ? '<div class="field"><span class="eyebrow">' + tr("Comment on compte", "How it's counted") + '</span><ul class="gs-how">' +
          "<li><b>" + tr("1 gorgée", "1 sip") + "</b> " + tr("= une gorgée normale de ta boisson (" + d.sips + " par verre).", "= a normal sip of your drink (" + d.sips + " per drink).") + "</li>" +
          "<li><b>1 shot</b> " + (gp.drink === "fort" ? tr("= un shot (3 cl).", "= one shot (3 cl).") : tr("= 3 gorgées de ta boisson.", "= 3 sips of your drink.")) + "</li>" +
          "<li><b>" + tr("1 cul-sec", "1 chug") + "</b> " + tr("= finir ton verre : " + d.glass + ".", "= finish your drink: " + d.glass + ".") + "</li>" +
          "<li>" + tr("1 verre standard = 10 g d'alcool pur. Les repères de santé conseillent de ne pas dépasser 10 verres par semaine, ni 2 par jour.", "1 standard drink = 10 g of pure alcohol. Health guidelines suggest no more than 10 a week and no more than 2 a day.") + "</li></ul></div>" : "") +
        (t.n || t.j ? '<button class="link" type="button" data-alc0 style="align-self:flex-start">' + tr("Remettre mon compteur à zéro", "Reset my counter") + "</button>" : "") + "</div>";
    };
    const draw = () => {
      if(view === "alc" && !DRINKS[gProf(store().gp).drink]) view = "main";
      root.innerHTML = view === "avatar" ? avatarHTML() : view === "alc" ? alcHTML() : mainHTML();
      $("#pg-title").textContent = view === "avatar" ? tr("Avatar", "Avatar") : view === "alc" ? tr("Taux d'alcool", "Blood alcohol") : tr("Mon profil", "My profile");
      const save = p => { const g2 = Object.assign(gProf(store().gp), p); g2.alc = g2.drink !== "sans"; persist({ gp: g2 }); CORE_X._gp = g2; SB.refreshExtras(); draw(); };
      $$("[data-pf-back]", root).forEach(b => b.addEventListener("click", () => go("main")));
      const avb = $("[data-pf-av]", root); if(avb) avb.addEventListener("click", () => go("avatar"));
      const alb = $("[data-pf-alc]", root); if(alb) alb.addEventListener("click", () => go("alc"));
      $$("[data-gd]", root).forEach(b => b.addEventListener("click", () => { buzz(8); save({ drink: b.dataset.gd }); }));
      $$("[data-md]", root).forEach(b => b.addEventListener("click", () => {
        const m = b.dataset.md; if(m === curMode()){ pinUI = null; draw(); return; } buzz(8);
        if(myKid()) pinUI = { k: "unlock", to: m };
        else if(m === "kid") pinUI = { k: "set" };
        else { setMode(m); pinUI = null; }
        draw(); const f = $("#pf-pin", root); if(f) f.focus();
      }));
      const pe = $("[data-pexit]", root); if(pe) pe.addEventListener("click", () => { pinUI = { k: "unlock", to: "soft" }; draw(); const f = $("#pf-pin", root); if(f) f.focus(); });
      const pc = $("[data-pchg]", root); if(pc) pc.addEventListener("click", () => { pinUI = { k: "change" }; draw(); const f = $("#pf-pin", root); if(f) f.focus(); });
      const px = $("[data-pcancel]", root); if(px) px.addEventListener("click", () => { pinUI = null; draw(); });
      const pf = $("[data-pforgot]", root); if(pf) pf.addEventListener("click", () => { pinUI = { k: "forgot", to: pinUI && pinUI.to || "soft", a: 12 + Math.floor(Math.random() * 17), b: 13 + Math.floor(Math.random() * 16) }; draw(); const f = $("#pf-pin", root); if(f) f.focus(); });
      const pok = $("[data-pok]", root); if(pok) pok.addEventListener("click", () => {
        const v1 = ($("#pf-pin", root) || {}).value || "", v2 = ($("#pf-pin2", root) || {}).value || "", er = $("[data-perr]", root), bad = t => { if(er){ er.textContent = t; er.hidden = false; } buzz([20, 40, 20]); };
        const k = pinUI.k, kid = store().kid || {};
        if(k === "set" || k === "change"){
          if(k === "change" && pinHash(v1) !== kid.pin) return bad(tr("Ce n'est pas le bon code.", "That's not the right code."));
          const nw = k === "set" ? v1 : v2, cf = k === "set" ? v2 : ($("#pf-pin3", root) || {}).value || "";
          if(!/^\d{4}$/.test(nw)) return bad(tr("Le code doit faire 4 chiffres.", "The code must be 4 digits."));
          if(nw !== cf) return bad(tr("Les deux codes ne correspondent pas.", "The two codes don't match."));
          if(k === "set") setMode("kid", pinHash(nw)); else { persist({ kid: { on: true, pin: pinHash(nw) } }); toast(tr("Code changé.", "Code changed.")); }
        } else if(k === "unlock"){
          if(pinHash(v1) !== kid.pin) return bad(tr("Ce n'est pas le bon code.", "That's not the right code."));
          setMode(pinUI.to);
        } else if(k === "forgot"){
          if(+v1 !== pinUI.a * pinUI.b) return bad(tr("Ce n'est pas la bonne réponse.", "That's not the right answer."));
          setMode(pinUI.to);
        }
        pinUI = null; draw();
      });
      const setPh = v => { persist({ photo: v }); CORE_X._ph = v; SB.refreshExtras(); renderMe(); draw(); };
      const fi = $("[data-pf-file]", root), pk = $("[data-pf-pick]", root);
      if(fi && pk){
        pk.addEventListener("click", () => fi.click());
        fi.addEventListener("change", async () => { const d = await shrinkPhoto(fi.files && fi.files[0]); fi.value = ""; if(!d){ toast(tr("Cette photo n'a pas pu être lue", "Couldn't read that photo")); return; } setPh(d); });
      }
      const rnd = $("[data-pf-rand]", root); if(rnd) rnd.addEventListener("click", () => {
        const all = [].concat.apply([], AV_CATS.filter(c => c[0] !== "hot" || myHard()).map(c => c[2])).filter(i => AVATARS[i] && "av:" + i !== myPhoto());
        if(!all.length) return;
        buzz(10); const i = all[Math.floor(Math.random() * all.length)];
        const c = AV_CATS.find(c => c[2].indexOf(i) >= 0); if(c) avTab = c[0];
        setPh("av:" + i);
      });
      $$("[data-avc]", root).forEach(b => b.addEventListener("click", () => { avTab = b.dataset.avc; buzz(6); draw(); }));
      $$("[data-av]", root).forEach(b => b.addEventListener("click", () => { buzz(8); setPh("av:" + b.dataset.av); }));
      const del = $("[data-pf-del]", root); if(del) del.addEventListener("click", () => { persist({ photo: "" }); delete CORE_X._ph; SB.refreshExtras(); renderMe(); draw(); });
      const ni = $("#pf-name", root); if(ni) ni.addEventListener("input", () => { const v = clean(ni.value, 16); persist({ name: v }); const hn = $("#h-name"); if(hn) hn.value = v; renderMe(); });
      const gg = $("[data-pf-gages]", root); if(gg) gg.addEventListener("click", () => {
        gSettingsPage(gLocalSettings, gSaveSettings, true, () => ({}), null);
        SB._pageParent = tr("Mon profil", "My profile"); pgHead();
        SB._pageClose = () => { SB._pageClose = null; gProfilePage(); };
      });
      $$("[data-pf-lang]", root).forEach(b => b.addEventListener("click", () => { if(b.dataset.pfLang !== LANG){ buzz(8); SB.setLang(b.dataset.pfLang); } }));
      $$("[data-gnolim]", root).forEach(b => b.addEventListener("click", () => { const v = b.dataset.gnolim === "1"; if(v === !!gProf(store().gp).nolim) return; buzz(8); save({ nolim: v }); }));
      alcMineBind(root, draw);
      // Poids tapé au clavier : enregistré dès qu'il est valable, l'estimation se met à jour quand on quitte le champ.
      const kg = $("#pf-kg", root);
      if(kg){
        const val = () => { const v = Math.round(+String(kg.value).replace(",", ".") || 0); return v >= 35 && v <= 250 ? v : 0; };
        kg.addEventListener("input", () => { const v = val(); if(v) alcSave({ kg: v }); });
        kg.addEventListener("change", () => { const v = val(); if(!v && kg.value !== ""){ toast(tr("Poids entre 35 et 250 kg", "Weight between 35 and 250 kg")); kg.value = alcStore().kg || ""; return; } alcSave({ kg: v }); setTimeout(draw, 0); });
        kg.addEventListener("keydown", e => { if(e.key === "Enter") kg.blur(); });
      }
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
    '<button type="button" data-hgs><b>' + tr("Mes gages", "My forfeits") + '</b><span class="sm">' + (S.on ? esc(GLV_NAME()[S.level] || "") + " · " + gUnit(S, 2).replace(/^2 /, "") : tr("Désactivés", "Off")) + "</span></button>";
  $("[data-hme]", el).addEventListener("click", () => gProfilePage());
  $("[data-hgs]", el).addEventListener("click", () => gSettingsPage(gLocalSettings, gSaveSettings, true, () => ({}), null));
}
/* =================== Compteur d'alcool ===================
   - Journal perso, gardé sur ce téléphone : les verres notés à la main (k: "v") et ce que tu as bu dans les jeux (k: "j"),
     avec l'heure, en verres standard (s). Une soirée = les 12 dernières heures.
   - Les gorgées des jeux viennent de tes verres : le total et l'estimation prennent le plus grand des deux compteurs.
   - Dans un salon, chacun partage seulement son nombre de verres (jamais son poids ni son estimation).
   - Estimation du taux (formule de Widmark), très approximative, jamais pour décider de conduire. */
const ALC_H = 12;
function alcStore(){
  const a = store().alc || {}, now = Date.now();
  return { log: A(a.log).filter(e => e && (e.k === "v" || e.k === "j") && now - (+e.t || 0) < ALC_H * 3600e3 && +e.s > 0).slice(-400),
    kg: Math.max(0, Math.min(250, +a.kg || 0)), r: a.r === 0.6 ? 0.6 : a.r === 0.7 ? 0.7 : 0, gk: typeof a.gk === "string" ? a.gk : "", gv: +a.gv || 0 };
}
function alcSave(p){ persist({ alc: Object.assign(alcStore(), p) }); alcShare(); }
const alcSum = (log, k) => Math.round(log.filter(e => e.k === k).reduce((a, e) => a + e.s, 0) * 100) / 100;
function alcTotals(){ const a = alcStore(), v = alcSum(a.log, "v"), j = alcSum(a.log, "j"); return { v, j, n: a.log.filter(e => e.k === "v").length, tot: Math.max(v, j) }; }
function alcShare(){ const t = alcTotals(); const x = { v: t.v, j: t.j, n: t.n }; if(JSON.stringify(CORE_X._alc) === JSON.stringify(x)) return; CORE_X._alc = x; try{ SB.refreshExtras(); }catch(e){} }
// Taux estimé (g/L), ou null si le poids et la base de calcul ne sont pas réglés.
function alcBac(){
  const a = alcStore(); if(!a.kg || !a.r) return null;
  const use = a.log.filter(e => e.k === (alcSum(a.log, "v") >= alcSum(a.log, "j") ? "v" : "j")).sort((x, y) => x.t - y.t);
  if(!use.length) return 0;
  let b = 0, t0 = use[0].t;
  use.forEach(e => { b = Math.max(0, b - 0.15 * (e.t - t0) / 3600e3) + e.s * 10 / (a.kg * a.r); t0 = e.t; });
  return Math.max(0, b - 0.15 * (Date.now() - t0) / 3600e3);
}
const alcNum = (n, d) => String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).replace(".", tr(",", "."));
const alcStd = n => alcNum(n, 1) + " " + tr(n > 1 ? "verres standard" : "verre standard", n === 1 ? "standard drink" : "standard drinks");
// Ce que j'ai bu dans les jeux en réseau : on suit mon compteur du salon et on note chaque hausse avec l'heure.
function alcTrackNet(g){
  if(!g || !N.nr || g.hd === false || g.kid === true) return;
  const me = gPlayers().find(p => p.id === N.nr.me()); if(!me || me.drink === "sans") return;
  const T = (g.gt || {})[me.name], v = T ? +T.v || 0 : 0, key = N.code + ":" + me.name, a = alcStore();
  if(a.gk !== key){ alcSave({ gk: key, gv: v }); return; }
  if(v > a.gv + 1e-6){ const d = DRINKS[me.drink] || DRINKS.biere; a.log.push({ t: Date.now(), k: "j", s: Math.round((v - a.gv) * d.std * 100) / 100 }); alcSave({ log: a.log, gv: v }); }
  else if(v < a.gv - 1e-6) alcSave({ gv: v });
}
// Sur un seul téléphone : si un des joueurs porte mon prénom, ses gorgées vont dans mon compteur.
function alcTrackLocal(before, after){
  const nm = clean(store().name, 16); if(!nm || !myHard()) return;
  const dk = gLocalDrink(nm); if(dk === "sans") return;
  const b = ((before || {})[nm] || {}).v || 0, a2 = ((after || {})[nm] || {}).v || 0;
  if(a2 > b + 1e-6){ const a = alcStore(); a.log.push({ t: Date.now(), k: "j", s: Math.round((a2 - b) * DRINKS[dk].std * 100) / 100 }); alcSave({ log: a.log }); }
}
// Bloc « Moi » : ajouter un verre, retirer le dernier, total, estimation.
function alcMineHTML(){
  const gp = gProf(store().gp), d = DRINKS[gp.drink], t = alcTotals(), a = alcStore(), bac = alcBac();
  if(!d) return '<p class="sm" style="margin:0">' + tr("Tu as choisi « Pas d'alcool » dans ton profil : rien à compter.", "You picked “I'm not drinking alcohol” in your profile: nothing to count.") + "</p>";
  return '<div class="gs-box"><div class="gs-row"><span class="tx"><b>' + tr(t.n + (t.n > 1 ? " verres notés" : " verre noté"), t.n + (t.n === 1 ? " drink" : " drinks") + " logged") + '</b><span class="sm">' +
      esc(tr("Ce soir : ", "Tonight: ") + alcStd(t.tot) + (t.j ? tr(" · dont " + alcStd(t.j) + " dans les jeux", " · " + alcStd(t.j) + " in games") : "")) + "</span></span>" +
      '<button type="button" class="gs-b" data-alc="-1" aria-label="' + tr("Retirer le dernier verre", "Remove the last drink") + '"' + (t.n ? "" : " disabled") + ">−</button>" +
      '<button type="button" class="gs-b" data-alc="1" aria-label="' + tr("Ajouter un verre", "Add a drink") + '">+</button></div>' +
    '<p class="sm" style="margin:8px 0 0">' + esc(tr("Touche + à chaque nouveau verre et choisis ce que tu bois : demi, pinte, vin, cocktail, shot… Chaque verre compte à sa vraie valeur.", "Tap + for each new drink and pick what it is: half pint, pint, wine, cocktail, shot… Each one counts at its real value.")) + "</p></div>" +
    '<div class="field"><span class="eyebrow">' + tr("Estimation du taux d'alcool", "Blood alcohol estimate") + "</span>" +
    (bac == null ? '<p class="sm" style="margin:0">' + tr("Indique ton poids et la base de calcul pour avoir une estimation. Ils restent sur ce téléphone, ils ne sont jamais partagés.", "Enter your weight and the calculation basis to get an estimate. They stay on this phone and are never shared.") + "</p>"
      : '<div class="alc-bac"><b>≈ ' + alcNum(bac, 2) + " g/L</b><span>" + tr("d'alcool dans le sang", "blood alcohol") + "</span></div>") +
    '<div class="row" style="gap:8px; align-items:center"><label class="lbl" style="flex:1">' + tr("Poids (kg)", "Weight (kg)") + '<input class="txt" id="alc-kg" type="number" inputmode="numeric" min="35" max="250" value="' + (a.kg || "") + '" placeholder="70"></label>' +
      '<div class="seg" style="flex:1.4" role="group" aria-label="' + tr("Base de calcul", "Calculation basis") + '">' + [[0.7, tr("Homme", "Male")], [0.6, tr("Femme", "Female")]].map(o => '<button type="button" data-alcr="' + o[0] + '" aria-pressed="' + (a.r === o[0]) + '">' + o[1] + "</button>").join("") + "</div></div>" +
    '<p class="note-box">' + tr("Estimation très approximative (formule de Widmark) : elle ne tient compte ni de ce que tu as mangé, ni de ta santé, ni de tes médicaments. Ne t'en sers jamais pour décider de conduire : si tu as bu, tu ne prends pas le volant.", "A very rough estimate (Widmark formula): it ignores food, health and medication. Never use it to decide whether to drive: if you've been drinking, don't drive.") + "</p>" +
    (t.n || t.j ? '<button class="link" type="button" data-alc0 style="align-self:flex-start">' + tr("Remettre mon compteur à zéro", "Reset my counter") + "</button>" : "") + "</div>";
}
/* Le + du compteur : on choisit le verre qu'on vient de boire, compté à sa vraie valeur en verres standard (10 g d'alcool pur). */
const GLASSES = [
  ["demi", tr("Demi de bière", "Half pint of beer"), "25 cl · 5 %", 1], ["pinte", tr("Pinte de bière", "Pint of beer"), "50 cl · 5 %", 2],
  ["forte", tr("Bière forte", "Strong beer"), "33 cl · 8 %", 2], ["cidre", tr("Cidre", "Cider"), "25 cl · 5 %", 1],
  ["vin", tr("Verre de vin", "Glass of wine"), "12 cl · 12 %", 1], ["champ", tr("Coupe de champagne", "Glass of champagne"), "10 cl · 12 %", 1],
  ["cocktail", "Cocktail", tr("≈ 2 doses d'alcool", "≈ 2 shots of spirits"), 2], ["long", tr("Long drink", "Mixed drink"), tr("4 cl d'alcool fort", "4 cl of spirits"), 1.3],
  ["shot", "Shot", "3 cl · 40 %", 1]
];
const GLASS_OF = { biere: "demi", vin: "vin", cocktail: "cocktail", fort: "shot" };
function closeGlassOv(){ const o = document.getElementById("glass-ov"); if(!o) return false; o.classList.remove("on"); setTimeout(() => o.remove(), 200); return true; }
function openGlassOv(onPick){
  closeGlassOv();
  const habit = GLASS_OF[gProf(store().gp).drink] || "demi";
  const x = document.createElement("div"); x.id = "glass-ov"; x.className = "rules-ov";
  x.innerHTML = '<div class="rules-in quit-in glass-in" role="dialog" aria-modal="true" aria-labelledby="gl-t"><b id="gl-t" class="quit-t">' + tr("Qu'est-ce que tu bois ?", "What are you drinking?") + "</b>" +
    '<div class="glass-grid">' + GLASSES.map(g => '<button type="button" class="glass-b" data-glass="' + g[0] + '" aria-pressed="' + (g[0] === habit) + '"><b>' + esc(g[1]) + "</b><span>" + esc(g[2]) + "</span><i>" + alcStd(g[3]) + "</i></button>").join("") + "</div>" +
    '<button class="btn ghost" type="button" data-glno>' + tr("Annuler", "Cancel") + "</button></div>";
  document.body.appendChild(x);
  x.addEventListener("click", e => { if(e.target === x || e.target.closest("[data-glno]")) closeGlassOv(); });
  x.querySelectorAll("[data-glass]").forEach(b => b.addEventListener("click", () => { const g = GLASSES.find(y => y[0] === b.dataset.glass); closeGlassOv(); if(g) onPick(g); }));
  requestAnimationFrame(() => x.classList.add("on"));
}
SB.glassOv = openGlassOv;
function alcMineBind(root, redraw){
  const gp = gProf(store().gp), d = DRINKS[gp.drink];
  $$("[data-alc]", root).forEach(b => b.addEventListener("click", () => {
    const a = alcStore();
    if(+b.dataset.alc > 0){
      if(!d) return; buzz(8);
      openGlassOv(g => { const a2 = alcStore(); a2.log.push({ t: Date.now(), k: "v", s: g[3], g: g[0] }); alcSave({ log: a2.log }); buzz(12); toast(tr("+1 noté : ", "+1 logged: ") + g[1].toLowerCase() + " (" + alcStd(g[3]) + ")"); redraw(); });
      return;
    }
    for(let i = a.log.length - 1; i >= 0; i--) if(a.log[i].k === "v"){ a.log.splice(i, 1); break; } buzz(6);
    alcSave({ log: a.log }); redraw();
  }));
  // Redessin différé : « change » arrive pendant que le champ perd le focus.
  const kg = $("#alc-kg", root); if(kg) kg.addEventListener("change", () => { const v = Math.round(+kg.value || 0); alcSave({ kg: v >= 35 && v <= 250 ? v : 0 }); setTimeout(redraw, 0); });
  $$("[data-alcr]", root).forEach(b => b.addEventListener("click", () => { buzz(6); alcSave({ r: +b.dataset.alcr }); redraw(); }));
  const z = $("[data-alc0]", root); if(z) armTap(z, () => { alcSave({ log: [] }); redraw(); }, tr("Touche encore pour tout remettre à zéro", "Tap again to reset everything"));
}
// Le tableau de la soirée : rows() -> [{ name, ph, j (verres std dans les jeux), v (verres std notés), me }]
function alcTablePage(rows){
  SB.page(tr("Compteur d'alcool", "Drink counter"), root => {
    const tok = String(Math.random()); root.dataset.alc = tok;
    let last = "";
    const draw = force => {
      const R = rows().map(r => Object.assign({ tot: Math.max(r.v || 0, r.j || 0) }, r)).sort((x, y) => y.tot - x.tot);
      const key = JSON.stringify([R, alcStore(), store().gp, Math.floor(Date.now() / 60000)]);
      if(!force && key === last) return; last = key;
      const max = Math.max(1, ...R.map(r => r.tot));
      root.innerHTML = '<div class="gs"><div class="field"><span class="eyebrow">' + tr("Moi", "Me") + "</span>" + alcMineHTML() + "</div>" +
        '<div class="field"><span class="eyebrow">' + tr("La soirée", "Tonight") + '</span><div class="gs-box">' +
        (R.length ? R.map(r => '<div class="gs-row alc-r"><span class="tx"><b>' + esc(r.name) + (r.me ? tr(" (moi)", " (me)") : "") + '</b><span class="sm">' +
          (r.sans ? tr("Sans alcool", "No alcohol") : esc(alcStd(r.tot)) + (r.v || r.j ? " · " + esc(tr("jeux " + alcNum(r.j || 0, 1) + " · notés " + alcNum(r.v || 0, 1), "games " + alcNum(r.j || 0, 1) + " · logged " + alcNum(r.v || 0, 1))) : "")) +
          '</span><span class="alc-bar"><i style="width:' + (r.sans ? 0 : Math.round(r.tot / max * 100)) + '%"></i></span></span></div>').join("")
          : '<p class="sm" style="padding:12px 0; margin:0">' + tr("Personne pour l'instant.", "Nobody yet.") + "</p>") + "</div>" +
        '<p class="sm" style="margin:0">' + tr("« Jeux » : ce que les gages ont fait boire. « Notés » : les verres que chacun ajoute avec le +. Les gorgées des jeux sont bues dans ces verres : le total retient le plus grand des deux compteurs. En verres standard (10 g d'alcool pur). Le taux de chacun n'est jamais partagé.", "“Games”: what forfeits made people drink. “Logged”: drinks everyone adds with +. Game sips come out of those drinks: the total takes the bigger of the two. In standard drinks (10 g of pure alcohol). Nobody's estimate is ever shared.") + "</p></div></div>";
      alcMineBind(root, () => draw(true));
    };
    draw(true);
    const iv = setInterval(() => { if(root.dataset.alc !== tok || current !== "page"){ clearInterval(iv); return; } if(document.activeElement && document.activeElement.id === "alc-kg") return; try{ if(N.nr) N.peers = N.nr.peers(); draw(false); }catch(e){} }, 1500);
  }, () => { try{ gRefresh(); }catch(e){} });
}
function alcNetRows(){
  const g = G() || {}, T = g.gt || {};
  const me = N.nr.me();
  return gPlayers().map(p => {
    const x = pres(peerById(p.id)).x || {}, al = x._alc || {}, d = DRINKS[p.drink];
    const v = p.id === me ? alcTotals().v : Math.max(0, Math.min(99, +al.v || 0));
    return { name: p.name, me: p.id === me, sans: !d, v, j: p.id === me ? alcTotals().j : d ? Math.round((+((T[p.name] || {}).v) || 0) * d.std * 10) / 10 : 0 };
  });
}
function alcLocalRows(){
  const me = clean(store().name, 16), names = A(store().localNames).map(n => clean(n, 16)).filter(Boolean);
  if(me && names.indexOf(me) < 0) names.unshift(me);
  return names.map(n => { const dk = gLocalDrink(n), d = DRINKS[dk]; return { name: n, me: n === me, sans: !d, v: n === me ? alcTotals().v : 0, j: n === me ? alcTotals().j : d ? Math.round((+(((LGG.tally || {})[n] || {}).v) || 0) * d.std * 10) / 10 : 0 }; });
}
// Bandeau « Gages » du salon (tout le monde) et de la liste « un seul téléphone ».
function gSalonBar(g){
  let el = $("#sa-gages");
  if(!el){ el = document.createElement("div"); el.id = "sa-gages"; el.className = "gbar"; const r = $("#sa-roster"); if(r && r.parentNode) r.parentNode.parentNode.insertBefore(el, r.parentNode.nextSibling); else return; }
  const S = gSettings(g && g.gages), gp = store().gp || {}, hard = roomHard();
  const at = alcTotals(), key = JSON.stringify([S.on, S.level, S.unit, N.host, gp, hard, at]);
  if(el.dataset.key === key) return; el.dataset.key = key;
  el.innerHTML = '<button type="button" data-gset><b>' + tr("Gages", "Forfeits") + '</b><span class="sm">' + (S.on ? (hard ? esc(GLV_NAME()[S.level] || "") + " · " + gUnit(S, 2).replace(/^2 /, "") : tr("Activés", "On")) : tr("Désactivés", "Off")) + "</span></button>" +
    '<button type="button" data-gme><b>' + tr("Mon profil", "My profile") + '</b><span class="sm">' + (hard ? esc(gProfShort()) : tr("Photo, prénom, mode", "Photo, name, mode")) + "</span></button>" +
    (hard ? '<button type="button" data-galc style="grid-column:1/-1"><b>' + tr("Compteur d'alcool", "Drink counter") + '</b><span class="sm">' + esc(tr("Qui a bu quoi ce soir · moi : ", "Who drank what tonight · me: ") + alcStd(at.tot)) + "</span></button>" : "");
  const ga = $("[data-galc]", el); if(ga) ga.addEventListener("click", () => alcTablePage(alcNetRows));
  $("[data-gset]", el).addEventListener("click", () => gSettingsPage(() => gSettings((G() || {}).gages), s => { if(!N.host) return; persist({ gages: s }); hostSetG({ gages: s }); }, N.host, () => (G() || {}).gt || {}, () => { if(N.host) hostSetG({ gt: {} }); }));
  $("[data-gme]", el).addEventListener("click", gProfilePage);
}
function gLocalBar(){
  const box = $("#ll-tiles"); if(!box) return;
  let el = $("#ll-gages");
  if(!el){ el = document.createElement("div"); el.id = "ll-gages"; el.className = "gbar"; box.parentNode.insertBefore(el, box); }
  const S = gLocalSettings();
  const hard = myHard();
  el.innerHTML = '<button type="button" data-gset><b>' + tr("Gages", "Forfeits") + '</b><span class="sm">' + (S.on ? (hard ? esc(GLV_NAME()[S.level] || "") : tr("Activés", "On")) : tr("Désactivés", "Off")) + "</span></button>" +
    (hard ? "" : '<span hidden data-gsob></span>') + (!hard ? "" : '<button type="button" data-gsob><b>' + tr("Qui boit quoi ?", "Who drinks what?") + '</b><span class="sm">' + tr("Boisson et limite de chacun", "Everyone's drink and limit") + "</span></button>" +
      '<button type="button" data-galc style="grid-column:1/-1"><b>' + tr("Compteur d'alcool", "Drink counter") + '</b><span class="sm">' + esc(tr("Qui a bu quoi ce soir · moi : ", "Who drank what tonight · me: ") + alcStd(alcTotals().tot)) + "</span></button>");
  const ga = $("[data-galc]", el); if(ga) ga.addEventListener("click", () => alcTablePage(alcLocalRows));
  $("[data-gset]", el).addEventListener("click", () => gSettingsPage(gLocalSettings, gSaveSettings, true, () => LGG.tally, () => { LGG.tally = {}; }));
  $("[data-gsob]", el).addEventListener("click", () => SB.page(tr("Qui boit quoi ?", "Who drinks what?"), root => {
    const draw = () => {
      const names = A(store().localNames).map(n => clean(n, 16)).filter(Boolean);
      root.innerHTML = '<div class="gs"><p class="howto">' + tr("Sur un seul téléphone, choisis ce que boit chaque joueur et sa limite pour la soirée. Au-delà de sa limite, il (elle) passe aux gages sans alcool.", "On one phone, pick what each player drinks and their limit for the night. Past their limit, they switch to no-alcohol forfeits.") + "</p>" +
        // Un seul geste pour tout le groupe : tout le monde avec ou sans limite.
        (names.length > 1 ? (() => { const all = names.every(n => gLocalLimCfg(n).nolim), none = names.every(n => !gLocalLimCfg(n).nolim);
          return '<div class="gs-box"><div class="gs-row"><span class="tx"><b>' + tr("Tout le monde", "Everyone") + '</b><span class="sm">' + tr("Limite pour tous les joueurs et tous les alcools", "Limit for every player and every drink") + '</span></span><div class="seg pf-lang">' +
            '<button type="button" data-gnlall="0" aria-pressed="' + none + '">' + tr("Avec", "On") + '</button><button type="button" data-gnlall="1" aria-pressed="' + all + '">' + tr("Sans limite", "No limit") + "</button></div></div></div>"; })() : "") +
        (names.length ? names.map(n => {
          const dk = gLocalDrink(n), cfg = gLocalLimCfg(n), lim = gLocalLim(n, dk);
          return '<div class="field"><span class="eyebrow">' + esc(n) + (dk === "sans" ? "" : cfg.nolim ? tr(" · sans limite", " · no limit") : " · max " + esc(gVerres(lim, dk))) + '</span>' +
            '<div class="filters" style="flex-wrap:wrap; overflow:visible">' + [["sans", tr("Sans alcool", "No alcohol")]].concat(Object.keys(DRINKS).map(k => [k, DRINKS[k].name])).map(o => '<button type="button" data-gn="' + esc(n) + '" data-gk="' + o[0] + '" aria-pressed="' + (dk === o[0]) + '">' + esc(o[1]) + "</button>").join("") + "</div>" +
            (dk === "sans" ? "" : '<div class="gs-box">' +
              '<div class="gs-row"><span class="tx"><b>' + tr("Limite", "Limit") + '</b><span class="sm">' + tr("Pour tous les alcools", "For every drink") + '</span></span><div class="seg pf-lang"><button type="button" data-gnl="' + esc(n) + '" data-v="0" aria-pressed="' + !cfg.nolim + '">' + tr("Avec", "On") + '</button><button type="button" data-gnl="' + esc(n) + '" data-v="1" aria-pressed="' + cfg.nolim + '">' + tr("Sans limite", "No limit") + "</button></div></div>" +
              (cfg.nolim ? "" : '<div class="gs-row"><span class="tx"><b>' + esc(gVerres(lim, dk)) + '</b><span class="sm">' + esc(gLimText(dk, lim)) + '</span></span><button type="button" class="gs-b" data-gln="' + esc(n) + '" data-d="-1" aria-label="' + tr("Moins", "Less") + '">−</button><b class="gs-n">' + lim + '</b><button type="button" class="gs-b" data-gln="' + esc(n) + '" data-d="1" aria-label="' + tr("Plus", "More") + '">+</button></div>') + "</div>") + "</div>";
        }).join("")
          : '<p class="sm">' + tr("Ajoute d'abord les prénoms en haut de la page « Un seul téléphone ».", "First add the names at the top of the “One phone” page.") + "</p>") + "</div>";
      $$("[data-gn]", root).forEach(b => b.addEventListener("click", () => { const m = Object.assign({}, store().gagesDrinks || {}); m[b.dataset.gn] = b.dataset.gk; persist({ gagesDrinks: m }); buzz(6); draw(); }));
      $$("[data-gln]", root).forEach(b => b.addEventListener("click", () => { const n = b.dataset.gln, dk = gLocalDrink(n), c = gLocalLimCfg(n); c.lim[dk] = Math.max(1, Math.min(20, gLocalLim(n, dk) + +b.dataset.d)); gLocalLimSave(n, { lim: c.lim }); buzz(6); draw(); }));
      $$("[data-gnl]", root).forEach(b => b.addEventListener("click", () => { const n = b.dataset.gnl, v = b.dataset.v === "1"; if(v === gLocalLimCfg(n).nolim) return; gLocalLimSave(n, { nolim: v }); buzz(8); draw(); }));
      $$("[data-gnlall]", root).forEach(b => b.addEventListener("click", () => { const v = b.dataset.gnlall === "1"; names.forEach(n => gLocalLimSave(n, { nolim: v })); buzz(8); draw(); }));
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
  try{ alcShare(); }catch(e){}
  if(myPhoto()) CORE_X._ph = myPhoto();
  const hm = $("#h-me"); if(hm) hm.addEventListener("click", () => { buzz(8); gProfilePage(); });
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
  if(IS_BETA){ const br = $("h1.brand"); if(br && !$(".modepill.beta", br)) br.insertAdjacentHTML("beforeend", '<span class="modepill beta">beta</span>'); document.title = "Soirée Box (beta)"; }
  const nm = $("#h-name"), cd = $("#h-code");
  nm.value = store().name || "";
  const m = (location.hash || "").match(/^#([A-Za-z]{4})(-soft|-kid(?:-(k[a-z0-9]{1,12}))?)?$/i);
  if(m){ hashCode = m[1].toUpperCase(); cd.value = hashCode; if(m[2]) setTimeout(() => (/^-kid/i.test(m[2]) ? inviteKid(m[3] ? m[3].toLowerCase() : null) : inviteSoft()), 0); }
  nm.addEventListener("input", () => { persist({ name: clean(nm.value, 16) }); renderHome(); renderMe(); });
  cd.addEventListener("input", () => { cd.value = cd.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4); renderHome(); });
  cd.addEventListener("keydown", e => { if(e.key === "Enter" && !$("#h-join").disabled) $("#h-join").click(); });
  $("#h-create").addEventListener("click", () => netEnter(makeCode(), true));
  $("#h-join").addEventListener("click", () => netEnter(clean(cd.value, 4).toUpperCase(), false));
  $("#h-local").addEventListener("click", openLocalList);
  const ht = $("#h-tiles");
  const drawHome = () => {
    $("#h-count").textContent = plural2(SB.games.filter(d => !isWip(d) && gameOk(d, myKid(), myHard())).length, "jeu", "jeux", "game");
    ht.innerHTML = SB.games.filter(d => inFilter(d, FSEL.home) && gameOk(d, myKid(), myHard())).sort((a, b) => isWip(a) - isWip(b)).map(d => tileHTML(d)).join("");
    $$(".tile", ht).forEach(b => b.addEventListener("click", () => openRules(SB.byId[b.dataset.id])));
  };
  bindFilter($("#h-filter"), "home", drawHome);
  drawHome();
  // Changement Hard / Soft dans le profil : l'accueil se met à jour.
  HOME_REDRAW = () => { bindFilter($("#h-filter"), "home", drawHome); drawHome(); };

  armTap($("#sa-quit"), netLeave, tr("Touche encore pour quitter", "Tap again to leave"));
  armTap($("#sp-quit"), netLeave, tr("Touche encore pour quitter", "Tap again to leave"));
  $("#lo-home").addEventListener("click", netLeave);
  $("#sa-qr").addEventListener("click", () => { buzz(8); openQR(); });
  $("#sa-share").addEventListener("click", () => {
    const url = inviteURL(N.code);
    shareText(tr("Rejoins mon salon Soirée Box ! Code : " + N.code, "Join my Soirée Box room! Code: " + N.code), url, $("#sa-link"), msg => toast(msg === "Copié" ? tr("Invitation copiée", "Invite copied") : tr("Invitation partagée", "Invite shared")));
  });
  $("#ll-back").addEventListener("click", goHome);
  // Rappel des règles pendant une partie (en réseau ou sur un seul téléphone).
  $$("[data-grules]").forEach(b => b.addEventListener("click", () => {
    const g = N.nr ? G() : null, def = current === "local" ? L.def : g && g.game ? SB.byId[g.game] : null;
    if(def){ buzz(6); if(document.getElementById("rules-ov")) closeRulesOv(); else openRulesOv(def); }
  }));
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
  // Bouton retour de l'en-tête : dans un sous-écran (avatar, taux d'alcool…), on revient d'abord à l'écran principal de la page.
  $("#pg-done").addEventListener("click", () => { if(SB._pageBack && SB._pageBack()) return; SB.closePage(); });
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
