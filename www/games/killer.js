/* Killer — chacun reçoit en secret une cible et une mission. Réussis ta mission
   et tu récupères la cible de ta victime. Le jeu tourne toute la soirée en fond. */
(function(){
"use strict";
const { esc, A, shuffle, screen, store, persist, dock, armTap, buzz, txt, pick, tr } = SB.u;
// Texte dans une langue donnée (lg : langue de l'hôte, s.lg) ; sans lg, langue du téléphone.
const T = (lg, fr, en) => lg == null ? tr(fr, en) : lg === "en" ? en : fr;

const MISSIONS = [
  "Fais dire « ananas » à ta cible","Fais trinquer ta cible avec toi en la regardant dans les yeux","Fais tenir ton verre à ta cible pendant 10 secondes",
  "Fais chanter ta cible, ne serait-ce qu'un bout de chanson","Fais dire à ta cible le prénom de son premier crush","Fais en sorte que ta cible te prête son téléphone",
  "Fais un selfie avec ta cible","Fais dire « c'est pas faux » à ta cible","Fais en sorte que ta cible t'invente un surnom et t'appelle comme ça","Fais goûter quelque chose à ta cible",
  "Fais enlever une chaussure à ta cible","Fais en sorte que ta cible te donne l'heure","Fais imiter un animal à ta cible","Fais en sorte que ta cible te tape dans la main",
  "Fais dire « je t'aime » à ta cible, à n'importe qui","Fais en sorte que ta cible te donne un conseil amoureux","Fais danser ta cible, ne serait-ce que 5 secondes",
  "Fais en sorte que ta cible te raconte un souvenir d'enfance","Fais dire « parapluie » à ta cible","Fais en sorte que ta cible te montre une photo de sa galerie",
  "Fais compter ta cible jusqu'à 10","Fais en sorte que ta cible te serve à boire","Fais en sorte que ta cible te fasse un compliment","Fais en sorte que ta cible te cède sa place",
  "Fais en sorte que ta cible te dise son signe astrologique","Fais en sorte que ta cible accepte un pari avec toi","Fais rire ta cible avec une blague nulle",
  "Fais en sorte que ta cible t'explique les règles d'un jeu","Fais répéter à ta cible, mot pour mot, une phrase que tu viens de dire","Fais en sorte que ta cible prenne une photo de toi",
  "Fais lever le pouce à ta cible","Fais en sorte que ta cible te donne un objet qu'elle a dans sa poche","Fais dire « oui » trois fois de suite à ta cible","Fais changer de place à ta cible",
  "Fais citer à ta cible une ville qui commence par M","Fais imiter quelqu'un de la soirée à ta cible","Fais en sorte que ta cible te montre sa dernière recherche Google",
  "Fais en sorte que ta cible te dise son plat préféré","Fais faire un clin d'œil à ta cible","Fais siffler ta cible","Fais en sorte que ta cible te serre la main",
  "Fais lire un texte à voix haute à ta cible","Fais fredonner le générique d'un dessin animé à ta cible","Fais dire « c'est la vie » à ta cible","Fais en sorte que ta cible te fasse goûter son verre",
  "Fais en sorte que ta cible t'aide à porter quelque chose","Fais dire « catastrophe » à ta cible","Fais en sorte que ta cible te demande « ça va ? »","Invente un check avec ta cible et faites-le ensemble",
  "Fais en sorte que ta cible t'appelle sur ton portable","Fais en sorte que ta cible t'envoie un message","Fais raconter son pire rendez-vous à ta cible","Fais tenir ta cible en équilibre sur une jambe",
  "Fais en sorte que ta cible te dise quel métier elle rêvait de faire enfant","Fais dire un mot en anglais à ta cible","Fais en sorte que ta cible te prête un vêtement ou un accessoire",
  "Fais applaudir ta cible","Fais en sorte que ta cible te dise son pire défaut","Fais en sorte que ta cible te recommande une série","Fais dire « incroyable » à ta cible",
  "Fais en sorte que ta cible te donne son avis sur ta tenue","Fais en sorte que ta cible te dise quel super-pouvoir elle aimerait avoir",
  "Fais dire « croissant » à ta cible","Fais en sorte que ta cible te montre son fond d'écran","Fais faire un vœu à voix haute à ta cible",
  "Fais en sorte que ta cible te dise son film préféré","Fais en sorte que ta cible imite ta voix","Fais en sorte que ta cible te dise sa chanson préférée du moment",
  "Fais réciter l'alphabet à l'envers à ta cible (au moins 5 lettres)","Fais en sorte que ta cible te fasse une révérence","Fais en sorte que ta cible te dessine quelque chose",
  "Fais en sorte que ta cible te raconte le dernier rêve dont elle se souvient","Fais dire « absolument » à ta cible","Fais en sorte que ta cible te prédise ton avenir",
  "Fais en sorte que ta cible te fasse un pronostic sur la fin de la soirée","Fais en sorte que ta cible te pose une question sur ton travail ou tes études","Fais compter à ta cible le nombre de personnes dans la pièce",
  "Fais en sorte que ta cible t'aide à chercher un objet que tu as « perdu »","Fais chuchoter ta cible","Fais en sorte que ta cible te raconte son dernier fou rire",
  "Fais en sorte que ta cible te montre l'appli qu'elle utilise le plus","Fais bâiller ta cible","Fais en sorte que ta cible t'appelle par ton nom de famille",
  "Fais écrire son prénom à ta cible, sur n'importe quoi","Fais en sorte que ta cible te donne une note sur 10 pour quelque chose","Fais dire « bizarre » à ta cible",
  "Fais en sorte que ta cible te dise ce qu'elle a mangé ce midi","Fais en sorte que ta cible pose sa main sur ton épaule","Fais en sorte que ta cible te cite une réplique de film",
  "Fais en sorte que ta cible te parle avec un accent","Fais en sorte que ta cible te parle de son animal de compagnie (ou de celui qu'elle rêve d'avoir)","Fais en sorte que ta cible te propose de jouer à un jeu",
  "Fais dire « à la tienne » à ta cible","Fais en sorte que ta cible t'emprunte un objet","Fais en sorte que ta cible réponde à une devinette","Fais faire une grimace à ta cible"
];
const HOT = [
  "Fais dire « préliminaires » à ta cible","Fais raconter son pire plan d'un soir à ta cible","Fais avouer son nombre de partenaires à ta cible",
  "Fais dire à ta cible qui elle trouve le plus sexy ici","Fais dire « capote » à ta cible","Fais en sorte que ta cible te montre son dernier match sur une appli de rencontre",
  "Fais en sorte que ta cible te fasse un compliment sur ton physique","Fais avouer un fantasme à ta cible","Fais dire « j'ai envie de toi » à ta cible, à n'importe qui",
  "Fais raconter à ta cible l'endroit le plus insolite où elle a fait l'amour","Fais en sorte que ta cible te raconte son premier baiser","Fais mimer une position du Kamasutra à ta cible",
  "Fais dire « menottes » à ta cible","Fais avouer à ta cible son plus gros coup de foudre","Fais en sorte que ta cible te masse les épaules pendant 10 secondes","Fais en sorte que ta cible t'appelle « mon cœur »",
  "Fais en sorte que ta cible t'explique sa technique de drague","Fais raconter son pire râteau à ta cible","Fais pousser un soupir langoureux à ta cible","Fais avouer à ta cible si elle a déjà simulé",
  "Fais enlever un vêtement à ta cible (veste, chaussette, ce qu'elle veut)","Fais en sorte que ta cible te fasse un bisou sur la joue","Fais avouer à ta cible la couleur de ses sous-vêtements",
  "Danse un slow avec ta cible","Fais en sorte que ta cible te fasse une fausse déclaration d'amour","Fais dire « oh oui » à ta cible, de la façon la plus suggestive possible",
  "Fais raconter son rêve le plus chaud à ta cible","Fais avouer à ta cible sur quelle célébrité elle fantasme","Fais avouer à ta cible sa plus longue période sans sexe",
  "Fais avouer à ta cible le pire message qu'elle a envoyé à un ex","Fais dire à ta cible ce qu'il y a dans sa table de nuit","Fais avouer à ta cible son nude le plus raté",
  "Fais avouer à ta cible le surnom le plus gênant qu'on lui a donné au lit","Fais dire « lingerie » à ta cible","Fais avouer à ta cible la chose la plus osée qu'elle a faite dans un lieu public",
  "Fais en sorte que ta cible te sorte sa meilleure phrase de drague","Fais dire « strip-poker » à ta cible","Fais avouer à ta cible si elle a déjà embrassé quelqu'un de cette soirée",
  "Fais en sorte que ta cible te murmure quelque chose à l'oreille","Fais avouer à ta cible le prénom de la dernière personne qu'elle a embrassée","Fais avouer à ta cible ce qu'elle regarde en premier chez quelqu'un",
  "Fais dire « viens par ici » à ta cible, d'une voix sensuelle","Fais raconter son plus long baiser à ta cible","Fais en sorte que ta cible te tienne la main pendant 10 secondes",
  "Fais avouer à ta cible ce qu'elle porte pour dormir","Fais avouer à ta cible si elle a déjà envoyé un message coquin à la mauvaise personne","Fais dire « déshabille-toi » à ta cible, à n'importe qui",
  "Fais décrire à ta cible son partenaire idéal en trois mots","Fais avouer à ta cible son endroit préféré pour un premier rendez-vous"
];
const MISSIONS_EN = [
  "Get your target to say “pineapple”","Clink glasses with your target while looking them in the eye","Get your target to hold your drink for 10 seconds",
  "Get your target to sing, even just a line of a song","Get your target to tell you the name of their first crush","Get your target to lend you their phone",
  "Take a selfie with your target","Get your target to say “fair enough”","Get your target to make up a nickname for you and call you by it","Get your target to taste something",
  "Get your target to take off a shoe","Get your target to tell you the time","Get your target to do an animal impression","Get your target to high-five you",
  "Get your target to say “I love you” to anyone","Get your target to give you dating advice","Get your target to dance, even for just 5 seconds",
  "Get your target to tell you a childhood memory","Get your target to say “umbrella”","Get your target to show you a photo from their camera roll",
  "Get your target to count to 10","Get your target to pour you a drink","Get your target to pay you a compliment","Get your target to give up their seat for you",
  "Get your target to tell you their star sign","Get your target to take a bet with you","Make your target laugh with a terrible joke",
  "Get your target to explain the rules of a game to you","Get your target to repeat, word for word, something you just said","Get your target to take a photo of you",
  "Get your target to give you a thumbs-up","Get your target to hand you something from their pocket","Get your target to say “yes” three times in a row","Get your target to change seats",
  "Get your target to name a city starting with M","Get your target to do an impression of someone at the party","Get your target to show you their last Google search",
  "Get your target to tell you their favorite food","Get your target to wink","Get your target to whistle","Get your target to shake your hand",
  "Get your target to read something out loud","Get your target to hum a cartoon theme song","Get your target to say “that's life”","Get your target to let you taste their drink",
  "Get your target to help you carry something","Get your target to say “disaster”","Get your target to ask you “how are you?”","Invent a secret handshake with your target and do it together",
  "Get your target to call your phone","Get your target to text you","Get your target to tell you about their worst date","Get your target to balance on one leg",
  "Get your target to tell you what they wanted to be when they grew up","Get your target to say a word in French","Get your target to lend you a piece of clothing or an accessory",
  "Get your target to clap","Get your target to tell you their worst flaw","Get your target to recommend you a TV show","Get your target to say “incredible”",
  "Get your target to give you their opinion on your outfit","Get your target to tell you which superpower they'd love to have",
  "Get your target to say “croissant”","Get your target to show you their lock screen","Get your target to make a wish out loud",
  "Get your target to tell you their favorite movie","Get your target to imitate your voice","Get your target to tell you their favorite song right now",
  "Get your target to say the alphabet backwards (at least 5 letters)","Get your target to bow or curtsy to you","Get your target to draw you something",
  "Get your target to tell you the last dream they remember","Get your target to say “absolutely”","Get your target to predict your future",
  "Get your target to predict how tonight will end","Get your target to ask you a question about your job or your studies","Get your target to count how many people are in the room",
  "Get your target to help you look for something you've “lost”","Get your target to whisper","Get your target to tell you about the last time they couldn't stop laughing",
  "Get your target to show you the app they use the most","Make your target yawn","Get your target to call you by your last name",
  "Get your target to write their name on anything","Get your target to rate something out of 10","Get your target to say “weird”",
  "Get your target to tell you what they had for lunch","Get your target to put their hand on your shoulder","Get your target to quote a line from a movie",
  "Get your target to talk to you in an accent","Get your target to tell you about their pet (or the one they dream of having)","Get your target to suggest playing a game",
  "Get your target to say “cheers”","Get your target to borrow something from you","Get your target to answer a riddle","Get your target to pull a funny face"
];
const HOT_EN = [
  "Get your target to say “foreplay”","Get your target to tell you about their worst one-night stand","Get your target to confess how many people they've slept with",
  "Get your target to tell you who they find sexiest here","Get your target to say “condom”","Get your target to show you their latest match on a dating app",
  "Get your target to compliment your body","Get your target to confess a fantasy","Get your target to say “I want you” to anyone",
  "Get your target to tell you the weirdest place they've had sex","Get your target to tell you about their first kiss","Get your target to act out a Kama Sutra position",
  "Get your target to say “handcuffs”","Get your target to confess their biggest crush ever","Get your target to massage your shoulders for 10 seconds","Get your target to call you “babe”",
  "Get your target to explain their flirting technique","Get your target to tell you about their worst rejection","Get your target to let out a sultry sigh","Get your target to confess whether they've ever faked it",
  "Get your target to take off a piece of clothing (jacket, sock, their call)","Get your target to kiss you on the cheek","Get your target to confess the color of their underwear",
  "Slow dance with your target","Get your target to make you a fake declaration of love","Get your target to say “oh yes” as suggestively as possible",
  "Get your target to tell you about their steamiest dream","Get your target to confess which celebrity they fantasize about","Get your target to confess their longest dry spell",
  "Get your target to confess the worst text they've ever sent an ex","Get your target to tell you what's in their nightstand","Get your target to confess their worst nude fail",
  "Get your target to confess the most embarrassing nickname they've been called in bed","Get your target to say “lingerie”","Get your target to confess the naughtiest thing they've done in public",
  "Get your target to hit you with their best pickup line","Get your target to say “strip poker”","Get your target to confess whether they've ever kissed someone at this party",
  "Get your target to whisper something in your ear","Get your target to confess the name of the last person they kissed","Get your target to confess what they check out first on someone",
  "Get your target to say “come here” in a sultry voice","Get your target to tell you about their longest kiss","Get your target to hold your hand for 10 seconds",
  "Get your target to confess what they wear to bed","Get your target to confess whether they've ever sent a dirty text to the wrong person","Get your target to say “take your clothes off” to anyone",
  "Get your target to describe their ideal partner in three words","Get your target to confess their favorite spot for a first date"
];
// list : missions en français, en : en anglais (mêmes paquets, mêmes identifiants).
const PACKS = [
  { v: "classique", label: tr("Classique", "Classic"), desc: tr("Des missions faisables en pleine soirée", "Missions you can pull off mid-party"), list: MISSIONS, en: MISSIONS_EN },
  { v: "adulte", label: tr("Adultes", "Adults"), desc: tr("Confessions coquines, sexe, tabous", "Naughty confessions, sex, taboos"), list: HOT, en: HOT_EN, hot: true }
];
const SEEN = "killer:m";
const listOf = (p, lg) => lg === "en" ? p.en : p.list;
// Paquet de missions dans la langue lg (celle de l'hôte) : celles jamais vues sur ce téléphone sortent en premier.
function deckFor(packs, lg){
  const sel = A(packs), pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => listOf(p, lg));
  return SB.u.fresh(SEEN, pool.length ? pool : listOf(PACKS[0], lg));
}
function take(deck){ const m = deck.pop(); if(m) SB.u.saw(SEEN, m); return m; }
function packButtons(sel){
  return '<div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-k="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + listOf(p, SB.lang()).length + "</span></button>").join("") + "</div>";
}
const CSS = '<style>.kl-m{font-size:22px; font-weight:800; line-height:1.25; overflow-wrap:anywhere}.kl-hid{font-size:15px; color:var(--muted)}' +
  '.kl-chain{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}.kl-chain li{display:flex; justify-content:space-between; gap:8px; background:var(--card); border:1.5px solid var(--line); border-radius:10px; padding:8px 12px; font-weight:700}' +
  '.kl-chain li span:last-child{color:var(--muted); text-align:right}.kl-pend{display:flex; flex-direction:column; gap:6px; background:var(--soft); border-radius:12px; padding:10px 12px}' +
  '.kl-x{border-top:1.5px dashed currentColor; padding-top:10px; margin-top:4px; display:flex; flex-direction:column; gap:4px}.kl-x .kl-m{font-size:18px}' +
  '.kl-cd{margin:-6px 0 12px; font-size:13px; font-weight:700; color:var(--muted)}.kl-aw{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}' +
  '.kl-aw li{background:var(--soft); border-radius:12px; padding:8px 12px; font-size:14px}.kl-aw b{display:block; font-family:var(--f-disp); font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:var(--tone, var(--acc))}</style>';

/* ----- Coups de théâtre : des événements qui relancent la chasse ----- */
const MIN = 60000;
const EVENTS = [
  { id: "prime", name: tr("Prime sur une tête", "Bounty"), desc: tr("Celui qui élimine {p} gagne 2 points de bonus. Prime valable 10 minutes.", "Whoever takes out {p} gets 2 bonus points. Bounty lasts 10 minutes."), ms: 10 * MIN, ok: o => o.n >= 3 },
  { id: "treve", name: tr("Trêve", "Truce"), desc: tr("Pendant 3 minutes, aucune mission ne peut être annoncée. Préparez vos coups en douce.", "For 3 minutes, nobody can claim a mission. Set up your moves on the sly."), ms: 3 * MIN },
  { id: "express", name: tr("Contrat express", "Express contract"), desc: tr("Pendant 10 minutes, tu peux aussi éliminer ta cible avec la mission bonus : « {m} ». Elle rapporte 1 point de plus.", "For 10 minutes, you can also take out your target with the bonus mission: “{m}”. It's worth 1 extra point."), ms: 10 * MIN },
  { id: "double", name: tr("Chasse ouverte", "Open season"), desc: tr("Pendant 10 minutes, chaque élimination rapporte 2 points.", "For 10 minutes, every kill is worth 2 points."), ms: 10 * MIN },
  { id: "melange", name: tr("Grand chambardement", "Big shake-up"), desc: tr("Les cibles sont redistribuées et chacun reçoit une nouvelle mission. Allez vite voir la vôtre !", "Targets are reshuffled and everyone gets a new mission. Go check yours!"), ok: o => o.n >= 3 },
  { id: "inverse", name: tr("Demi-tour", "U-turn"), desc: tr("La chaîne s'inverse : tu chasses maintenant la personne qui te chassait. Nouvelles missions pour tous.", "The chain flips: you're now hunting the person who was hunting you. New missions for everyone."), ok: o => o.n >= 3 },
  { id: "ordres", name: tr("Nouveaux ordres", "New orders"), desc: tr("Même cible, mais tout le monde reçoit une nouvelle mission.", "Same target, but everyone gets a new mission."), ok: o => o.n >= 2 },
  { id: "amnistie", name: tr("Amnistie", "Amnesty"), desc: tr("Ceux qui ont déjà utilisé leur accusation la récupèrent : chacun peut de nouveau tenter de démasquer son chasseur.", "Anyone who already used their accusation gets it back: everyone can try to unmask their hunter again."), ok: o => o.used > 0 }
];
// Messages personnels (W.note) : { t: français, en: anglais, at } ; chaque téléphone affiche sa langue.
const RETARGET = { melange: ["Coup de théâtre : nouvelle cible et nouvelle mission !", "Plot twist: new target and new mission!"], inverse: ["Demi-tour : tu chasses la personne qui te chassait. Nouvelle mission !", "U-turn: you're hunting the person who was hunting you. New mission!"], ordres: ["Nouveaux ordres : même cible, nouvelle mission.", "New orders: same target, new mission."] };
const noteOf = (fr, en, at) => ({ t: fr, en, at });
const noteTxt = n => tr(n.t, n.en);
function evOn(W, now){
  const e = W.ev;
  if(!e || !e.id) return "";
  if(e.until) return now < e.until && !(e.id === "prime" && W.alive.indexOf(e.p) < 0) ? e.id : "";
  return now - e.at < 2 * MIN ? e.id : "";
}
function evView(e, nameOf){
  const t = SB.u.byTwist(EVENTS, e && e.id); if(!t) return null;
  return { name: t.name, desc: t.desc.replace("{p}", e.p ? nameOf(e.p) : "").replace("{m}", e.m || "") };
}
function startEvent(W, t, fresh, now){
  const e = { id: t.id, at: now, until: t.ms ? now + t.ms : 0 };
  if(t.id === "prime") e.p = pick(W.alive);
  if(t.id === "express") e.m = fresh();
  if(t.id === "melange"){ const o = shuffle(W.alive); o.forEach((id, i) => { W.tgt[id] = o[(i + 1) % o.length]; }); }
  if(t.id === "inverse"){ const nt = {}; W.alive.forEach(h => { if(W.tgt[h]) nt[W.tgt[h]] = h; }); Object.assign(W.tgt, nt); }
  if(RETARGET[t.id]){ W.claims = {}; W.alive.forEach(id => { W.mis[id] = fresh(); W.since[id] = now; W.note[id] = noteOf(RETARGET[t.id][0], RETARGET[t.id][1], now); }); }
  if(t.id === "amnistie") W.used = {};
  W.ev = e; W.evLast = t.id; W.lastEv = now;
  return e;
}
// Après une élimination (ou après 12 minutes sans rien), un événement peut tomber.
function maybeEvent(W, fresh, now, force){
  if(W.phase !== "play" || W.alive.length < 2) return null;
  const on = evOn(W, now);
  if(on && W.ev.until) return null;
  const t = SB.u.twist(EVENTS, { rate: force ? 1 : 0.45, last: W.evLast, n: W.alive.length, used: W.alive.filter(id => W.used[id]).length });
  return t ? startEvent(W, t, fresh, now) : null;
}
function idle(W, now){ const l = A(W.log), last = l.length ? l[l.length - 1].at || 0 : 0; return now - Math.max(W.t0 || 0, W.lastEv || 0, last); }

/* Élimine `victim`. Son chasseur récupère sa cible. how : "k" (mission réussie) ou "u" (démasqué). x : contrat express. */
function eliminate(W, victim, by, how, fresh, now, x){
  now = now || Date.now();
  const on = evOn(W, now);
  const used = x && W.ev && W.ev.m ? W.ev.m : W.mis[by] || "";
  let pts = (on === "double" ? 2 : 1) + (x ? 1 : 0), bonus = "";
  if(on === "prime" && W.ev.p === victim){ pts += 2; bonus = "p"; }
  if(how === "k"){ const dt = now - (W.since[by] || W.t0 || now); if(dt > 0 && (!W.fast || dt < W.fast.dt)) W.fast = { id: by, dt }; }
  W.alive = W.alive.filter(z => z !== victim);
  const hunter = Object.keys(W.tgt).find(h => W.tgt[h] === victim && W.alive.indexOf(h) >= 0);
  if(hunter){
    W.tgt[hunter] = W.tgt[victim];
    W.mis[hunter] = how === "k" && hunter === by ? W.mis[victim] : fresh();
    W.since[hunter] = now;
  }
  delete W.claims[victim];
  Object.keys(W.claims).forEach(v => { if(W.claims[v] && W.claims[v].by === victim) delete W.claims[v]; });
  delete W.tgt[victim]; delete W.mis[victim];
  W.kills[by] = (W.kills[by] || 0) + 1;
  W.pts[by] = (W.pts[by] || 0) + pts;
  W.log.push({ by, on: victim, how, m: how === "k" ? used : "", at: now, b: bonus, x: x ? 1 : 0, p: pts });
  if(W.alive.length <= 1){ W.phase = "end"; W.win = W.alive[0] || ""; }
  return hunter;
}
// Gages des éliminations ajoutées au journal depuis l'entrée n0 : la victime boit, le tueur distribue.
// Les accusations ratées ne donnent pas de gage : la feuille, vue par tous, trahirait un secret.
function klGages(W, n0){
  const out = [];
  A(W.log).slice(n0).forEach(x => {
    out.push(x.how === "u" ? { id: x.on, ev: "mort", why: tr("Démasqué par ta cible", "Unmasked by your target") } : { id: x.on, ev: "mort" });
    out.push({ id: x.by, ev: "tue" });
  });
  return out;
}
function work(s){
  const o = { phase: s.phase, win: s.win || "", t0: s.t0 || 0, jk: s.jk !== false, evs: s.evs !== false, alive: A(s.alive).slice(), log: A(s.log).slice(), ev: s.ev || null, evLast: s.evLast || "", lastEv: s.lastEv || 0, fast: s.fast || null };
  ["tgt", "mis", "kills", "pts", "claims", "used", "note", "seen", "jok", "acc", "nope", "since"].forEach(k => { o[k] = Object.assign({}, s[k]); });
  return o;
}
function freshFrom(ctx){
  return () => { let deck = A(ctx.priv().deck).slice(); if(!deck.length) deck = deckFor(ctx.opts.packs, ctx.s.lg || "fr"); const m = take(deck); ctx.setPriv({ deck }); return m; };
}
function score(W, id){ return (W.pts || {})[id] != null ? W.pts[id] : (W.kills || {})[id] || 0; }
function ranking(ids, W){ return ids.slice().sort((a, b) => (score(W, b) - score(W, a)) || (((W.kills || {})[b] || 0) - ((W.kills || {})[a] || 0))); }
function ptsTxt(n, lg){ return T(lg, n + " pt" + (n > 1 ? "s" : ""), n + (n === 1 ? " pt" : " pts")); }
function graveHTML(log, nameOf){
  const l = A(log).slice().reverse();
  if(!l.length) return '<p class="sm">' + tr("Personne n'est encore tombé.", "Nobody has fallen yet.") + "</p>";
  return '<ul class="list">' + l.map(x => '<li><span class="t">' + esc(nameOf(x.on)) + '</span><span class="by">' + (x.how === "u" ? tr("Démasqué par ", "Unmasked by ") + esc(nameOf(x.by)) : tr("Éliminé par ", "Taken out by ") + esc(nameOf(x.by)) + (x.m ? tr(" · « " + esc(x.m) + " »", " · “" + esc(x.m) + "”") : "")) + (x.b === "p" ? tr(" · prime encaissée", " · bounty claimed") : x.x ? tr(" · contrat express", " · express contract") : "") + "</span></li>").join("") + "</ul>";
}
/* ----- Trophées de fin : tirés des stats de la partie, formulés différemment à chaque fois ----- */
function seedOf(str){ let h = 7; String(str).split("").forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; }); return h; }
function dur(ms){ return ms < 60000 ? Math.max(1, Math.round(ms / 1000)) + " s" : Math.round(ms / 60000) + " min"; }
// lg : langue (sinon celle du téléphone). Le tirage se fait sur le titre français : mêmes trophées dans les deux langues.
function awards(W, ids, nameOf, seed, lg){
  const out = [], E = T(lg, 0, 1) === 1, log = A(W.log);
  const P = (fr, en, i) => { const k = (seed + i) % fr.length; return [E ? en[k] : fr[k], fr[k]]; }, add = (t, d) => out.push([t[0], d, t[1]]);
  if(W.fast && W.fast.id) add(P(["Gâchette la plus rapide", "Tir éclair", "Plus rapide que son ombre"], ["Quickest trigger", "Lightning strike", "Faster than their shadow"], 0), nameOf(W.fast.id) + (E ? ", a mission done in " : ", une mission bouclée en ") + dur(W.fast.dt));
  if(log.length) add(P(["Premier sang", "A ouvert le bal", "Premier coup de couteau"], ["First blood", "Kicked things off", "First stab"], 1), nameOf(log[0].by) + (E ? " struck first" : " a frappé en premier"));
  const u = log.find(x => x.how === "u");
  if(u) add(P(["L'arroseur arrosé", "Pris à son propre piège", "Grillé par sa propre cible"], ["Hunter hunted", "Caught in their own trap", "Busted by their own target"], 2), nameOf(u.on) + (E ? ", unmasked by " : ", démasqué par ") + nameOf(u.by));
  const pr = log.find(x => x.b === "p");
  if(pr) add(P(["Chasseur de primes", "Mercenaire de la soirée", "A encaissé la prime"], ["Bounty hunter", "Party mercenary", "Cashed the bounty"], 3), nameOf(pr.by) + (E ? " got " + nameOf(pr.on) + "'s head" : " a eu la tête de " + nameOf(pr.on)));
  const acc = W.acc || {}, ghost = ranking(ids.filter(id => !acc[id] && (W.kills[id] || 0) > 0), W)[0];
  if(ghost) add(P(["Fantôme de la soirée", "Ninja silencieux", "Insoupçonnable"], ["Ghost of the party", "Silent ninja", "Above suspicion"], 4), nameOf(ghost) + (E ? ", not a single accusation" : ", aucune accusation reçue"));
  const nope = W.nope || {}, liar = ids.filter(id => nope[id]).sort((a, b) => nope[b] - nope[a])[0];
  if(liar) add(P(["Mauvaise foi d'or", "Jamais coupable", "Avocat du diable"], ["Golden denial", "Never guilty", "Devil's advocate"], 5), nameOf(liar) + ", " + nope[liar] + (E ? (nope[liar] > 1 ? " missions disputed" : " mission disputed") : " mission" + (nope[liar] > 1 ? "s" : "") + " contestée" + (nope[liar] > 1 ? "s" : "")));
  // Plus de 4 trophées possibles : on en garde 4, différents d'une partie à l'autre.
  return (out.length > 4 ? out.map(x => [seedOf(x[2] + seed), x]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(x => x[1]) : out).map(x => [x[0], x[1]]);
}
function awardsHTML(list){
  return list.length ? '<div class="field"><span class="eyebrow">' + tr("Trophées", "Awards") + '</span><ul class="kl-aw">' + list.map(a => "<li><b>" + esc(a[0]) + "</b>" + esc(a[1]) + "</li>").join("") + "</ul></div>" : "";
}
function winTitle(W, ids, nameOf, seed, lg){
  const o = ranking(ids, W), w = W.win || o[0];
  return { w, t: W.win ? nameOf(w) + " " + T(lg, ["survit à la soirée", "reste en vie jusqu'au bout", "a eu tout le monde"], ["survives the night", "stays alive to the very end", "got everyone"])[seed % 3] : nameOf(w) + " " + T(lg, ["gagne aux points", "domine le tableau de chasse", "a le plus beau palmarès"], ["wins on points", "tops the kill board", "has the best track record"])[seed % 3] };
}
function cdText(W, now){ const e = W.ev; if(!e || !e.until) return ""; const r = Math.max(0, e.until - now), t = (r >= 60000 ? Math.floor(r / 60000) + " min " : "") + Math.floor(r % 60000 / 1000) + " s"; return tr("Encore " + t, t + " left"); }

const UI = { gid: "", open: false, acc: false };

const DEF = {
  id: "killer", name: "Killer", glyph: tr("Cible", "Target"), pitch: tr("Une cible, une mission secrète, toute la soirée.", "One target, one secret mission, all night long."), hot: true, ticks: true,
  accent: { light: "#d6dbe4", dark: "#d6dbe4" },
  tag: tr("Une cible, une mission secrète. Réussis-la sans te faire griller et récupère la cible de ta victime.", "One target, one secret mission. Pull it off without getting caught and inherit your victim's target."),
  min: 4, max: 20,
  gages: [
    { ev: "mort", label: tr("Éliminé", "Taken out"), kind: "boit", n: 2 },
    { ev: "tue", label: tr("Élimine quelqu'un", "Takes someone out"), kind: "distribue", n: 1 }
  ],
  rules: tr([
    "Chacun reçoit en secret une cible et une mission, par exemple : faire dire « ananas » à ta cible.",
    "Le jeu tourne en fond pendant toute la soirée : vous pouvez jouer aux autres jeux en même temps.",
    "Mission réussie ? Touche « J'ai réussi ma mission ». Ta victime confirme, tu marques un point et tu récupères sa cible et sa mission.",
    "Tu penses savoir qui te chasse ? Tu n'as droit qu'à une accusation : si tu as raison, ton chasseur est éliminé.",
    "Mission impossible ? Ton joker te donne une nouvelle mission, une seule fois.",
    "Coups de théâtre : après une élimination, ou quand ça traîne, un événement peut tomber. Prime sur une tête, trêve, contrat express, cibles mélangées…",
    "Le dernier survivant gagne. L'hôte peut arrêter la partie avant la fin : le meilleur score l'emporte alors."
  ], [
    "Everyone secretly gets a target and a mission, for example: get your target to say “pineapple”.",
    "The game runs in the background all night: you can play other games at the same time.",
    "Mission accomplished? Tap “I pulled off my mission”. Your victim confirms, you score a point and inherit their target and mission.",
    "Think you know who's hunting you? You only get one accusation: if you're right, your hunter is out.",
    "Impossible mission? Your joker gets you a new one, once.",
    "Plot twists: after a kill, or when things drag, an event can drop. Bounty, truce, express contract, shuffled targets…",
    "The last survivor wins. The host can stop the game early: the best score wins."
  ]),
  options: [
    { id: "packs", label: tr("Missions", "Missions"), type: "multi", def: ["classique"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, count: listOf(p, SB.lang()).length })) },
    { id: "jokers", label: tr("Joker", "Joker"), type: "toggle", text: tr("Un joker par joueur", "One joker per player"), desc: tr("Pour changer une fois de mission", "To swap your mission once"), def: true },
    { id: "events", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Événements surprises", "Surprise events"), desc: tr("Primes, trêves, contrats express, cibles mélangées", "Bounties, truces, express contracts, shuffled targets"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet de missions.", "Pick at least one mission pack."));
    const lg = SB.lang(), order = shuffle(ctx.ids), tgt = {}, mis = {}, since = {}, deck = deckFor(o.packs, lg), now = ctx.now();
    order.forEach((id, i) => { tgt[id] = order[(i + 1) % order.length]; mis[id] = take(deck) || listOf(PACKS[0], lg)[0]; since[id] = now; });
    ctx.setPriv({ deck });
    return { phase: "play", lg, t0: now, jk: o.jokers !== false, evs: o.events !== false, alive: ctx.ids.slice(), tgt, mis, since, kills: {}, pts: {}, log: [], claims: {}, used: {}, note: {}, seen: {}, jok: {}, acc: {}, nope: {}, ev: null, evLast: "", lastEv: 0, fast: null, win: "" };
  },
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "play") return;
    const W = work(s), fresh = freshFrom(ctx), now = ctx.now(), n0 = W.log.length;
    let changed = false;
    ctx.ids.forEach(id => {
      const inp = ctx.input(id); if(!inp) return;
      const sn = Object.assign({}, W.seen[id] || {});
      if(inp.c && inp.c.n > (sn.c || 0)){
        sn.c = inp.c.n; changed = true;
        const t = inp.c.t;
        if(W.phase === "play" && W.alive.indexOf(id) >= 0 && W.tgt[id] === t && W.alive.indexOf(t) >= 0 && !W.claims[t]){
          if(evOn(W, now) === "treve") W.note[id] = noteOf("Trêve en cours : attends la fin pour annoncer ta mission.", "Truce in progress: wait until it's over to claim your mission.", now);
          else W.claims[t] = { by: id, at: now, x: inp.c.x && evOn(W, now) === "express" ? 1 : 0 };
        }
      }
      if(inp.v && inp.v.n > (sn.v || 0)){
        sn.v = inp.v.n; changed = true;
        const cl = W.claims[id];
        if(cl && W.phase === "play"){
          if(inp.v.ok){ eliminate(W, id, cl.by, "k", fresh, now, cl.x); W.note[cl.by] = noteOf("Bien joué, " + ctx.name(id) + " est hors jeu ! Tu récupères sa cible et sa mission.", "Nice work, " + ctx.name(id) + " is out! You inherit their target and mission.", now); }
          else { delete W.claims[id]; W.nope[id] = (W.nope[id] || 0) + 1; W.note[cl.by] = noteOf(ctx.name(id) + " conteste ta mission. Réglez ça entre vous, puis retente ta chance.", ctx.name(id) + " disputes your mission. Sort it out between you, then try again.", now); }
        }
      }
      if(inp.a && inp.a.n > (sn.a || 0)){
        sn.a = inp.a.n; changed = true;
        if(W.phase === "play" && W.alive.indexOf(id) >= 0 && !W.used[id]){
          W.used[id] = true;
          if(inp.a.w) W.acc[inp.a.w] = (W.acc[inp.a.w] || 0) + 1;
          const hunter = W.alive.find(h => W.tgt[h] === id);
          if(hunter && inp.a.w === hunter){
            const g = eliminate(W, hunter, id, "u", fresh, now);
            if(g && g !== id) W.note[g] = noteOf("Ta cible a été éliminée par quelqu'un d'autre. Tu as une nouvelle cible et une nouvelle mission.", "Your target was taken out by someone else. You have a new target and a new mission.", now);
            W.note[id] = noteOf("Bien vu, c'était " + ctx.name(hunter) + " ! Ton chasseur est hors jeu.", "Good call, it was " + ctx.name(hunter) + "! Your hunter is out.", now);
          } else W.note[id] = noteOf("Raté, ce n'était pas " + ctx.name(inp.a.w) + ". Tu n'as plus d'accusation.", "Wrong, it wasn't " + ctx.name(inp.a.w) + ". You're out of accusations.", now);
        }
      }
      if(inp.j && inp.j.n > (sn.j || 0)){
        sn.j = inp.j.n; changed = true;
        if(W.phase === "play" && W.jk && W.alive.indexOf(id) >= 0 && !W.jok[id] && !(W.claims[W.tgt[id]] && W.claims[W.tgt[id]].by === id)){
          W.jok[id] = true; W.mis[id] = fresh(); W.since[id] = now;
          W.note[id] = noteOf("Joker utilisé : voici ta nouvelle mission. Plus de joker !", "Joker used: here's your new mission. No more jokers!", now);
        }
      }
      W.seen[id] = sn;
    });
    // Victime hors ligne depuis 30 s : la mission est validée.
    Object.keys(W.claims).forEach(v => {
      const cl = W.claims[v];
      if(W.phase === "play" && cl && !ctx.here(v) && now - (cl.at || now) > 30000){ eliminate(W, v, cl.by, "k", fresh, now, cl.x); changed = true; }
    });
    if(W.evs && W.phase === "play" && (W.log.length > n0 || idle(W, now) > 12 * MIN)){
      if(maybeEvent(W, fresh, now, W.log.length === n0)) changed = true;
      else if(W.log.length === n0){ W.lastEv = now; changed = true; }
    }
    if(W.log.length > n0) ctx.gage(klGages(W, n0), s.k + ":" + W.log.length);
    if(changed) ctx.set(W);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, nameOf = ctx.name, now = ctx.now();
    if(UI.gid !== ctx.g.gid){ UI.gid = ctx.g.gid; UI.open = false; UI.acc = false; }
    const again = () => { root.dataset.key = ""; DEF.render(SB.ctx(), root); };
    const W = work(s);
    const alive = W.alive, tgt = W.tgt, mis = W.mis, claims = W.claims, used = W.used, note = W.note[me];
    const seed = seedOf(ctx.g.gid || "k");
    if(s.phase === "end"){
      const order = ranking(ctx.ids, W), wt = winTitle(W, ctx.ids, nameOf, seed);
      screen(root, "end" + ctx.isHost + W.log.length, CSS + '<span class="eyebrow">' + (W.win ? tr("Dernier survivant", "Last survivor") : tr("Meilleur score", "Top score")) + '</span><div class="who">' + esc(nameOf(wt.w)) + "</div>" +
        '<div class="field"><span class="eyebrow">' + tr("Tableau de chasse", "Kill board") + '</span><ul class="kl-chain">' + order.map(id => "<li><span>" + esc(nameOf(id)) + (alive.indexOf(id) >= 0 ? tr(" · vivant", " · alive") : "") + "</span><span>" + ptsTxt(score(W, id)) + "</span></li>").join("") + "</ul></div>" +
        awardsHTML(awards(W, ctx.ids, nameOf, seed)) +
        '<div class="field"><span class="eyebrow">' + tr("Cimetière", "Graveyard") + "</span>" + graveHTML(W.log, nameOf) + "</div>" +
        dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const lg = c.s.lg || "fr", sep = T(lg, " : ", ": ");
          const W2 = work(c.s), o2 = ranking(c.ids, W2), sd = seedOf(c.g.gid || "k"), t2 = winTitle(W2, c.ids, c.name, sd, lg);
          c.end({ title: "Killer" + sep + t2.t, win: [t2.w], lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + ptsTxt(score(W2, id), lg)).concat(awards(W2, c.ids, c.name, sd, lg).slice(0, 2).map(a => a[0] + sep + a[1])) });
        }));
      });
      return;
    }
    const on = evOn(W, now), ev = on ? evView(W.ev, nameOf) : null, treve = on === "treve", express = on === "express";
    const isAlive = alive.indexOf(me) >= 0, myT = tgt[me], myClaim = myT && claims[myT] && claims[myT].by === me, onMe = claims[me];
    const pend = Object.keys(claims).filter(v => claims[v]);
    const banner = ev ? SB.u.twistHTML(ev) + (W.ev.until ? '<p class="kl-cd" data-cd></p>' : "") : "";
    const hostBox = ctx.isHost ? '<div class="field"><span class="eyebrow">' + tr("Arbitre (hôte)", "Referee (host)") + "</span>" +
      (pend.length ? pend.map(v => '<div class="kl-pend"><span>' + tr("<b>" + esc(nameOf(claims[v].by)) + "</b> dit avoir eu <b>" + esc(nameOf(v)) + "</b>", "<b>" + esc(nameOf(claims[v].by)) + "</b> says they got <b>" + esc(nameOf(v)) + "</b>") + '</span><div class="row"><button class="btn ok" type="button" data-hv="' + esc(v) + '">' + tr("Valider", "Confirm") + '</button><button class="btn ghost" type="button" data-hx="' + esc(v) + '">' + tr("Annuler", "Cancel") + "</button></div></div>").join("") : "") +
      '<button class="link warn" type="button" data-stop style="align-self:flex-start">' + tr("Arrêter la partie et voir le classement", "Stop the game and see the rankings") + "</button></div>" : "";
    const key = JSON.stringify([s.k, isAlive, myT, mis[me], !!myClaim, onMe ? onMe.by + onMe.x : "", used[me], W.jok[me], note ? note.at : 0, W.log.length, pend, UI.open, UI.acc, ctx.isHost, alive.length, on, W.ev ? W.ev.at : 0]);
    let html = CSS, dk = "";
    if(!isAlive){
      const dead = W.log.find(x => x.on === me);
      html += banner + '<div class="card acc"><span class="eyebrow">' + tr("Tu es mort", "You're dead") + '</span><div class="big">' + (dead ? (dead.how === "u" ? tr("Démasqué par ", "Unmasked by ") + esc(nameOf(dead.by)) : tr("Éliminé par ", "Taken out by ") + esc(nameOf(dead.by))) : tr("Éliminé", "Taken out")) + "</div>" + (dead && dead.m ? '<p class="sm">' + tr("Mission : « " + esc(dead.m) + " »", "Mission: “" + esc(dead.m) + "”") + "</p>" : "") +
        '<p class="sm">' + tr("Tu peux maintenant suivre toutes les chasses. Chut, ne dis rien !", "You can now follow every hunt. Shh, don't say a word!") + "</p></div>" +
        '<div class="field"><span class="eyebrow">' + tr("Qui chasse qui", "Who's hunting whom") + '</span><ul class="kl-chain">' + alive.map(h => "<li><span>" + esc(nameOf(h)) + "</span><span>→ " + esc(nameOf(tgt[h])) + "</span></li>").join("") + "</ul></div>";
    } else if(onMe){
      const om = esc(onMe.x && W.ev && W.ev.m ? W.ev.m : mis[onMe.by]);
      html += '<div class="pass" style="min-height:0"><span class="eyebrow">' + tr("Alerte", "Alert") + '</span><div class="who">' + esc(nameOf(onMe.by)) + "</div><p>" + tr("dit avoir réussi " + (onMe.x ? "le contrat express" : "sa mission") + " sur toi :", "says they pulled off " + (onMe.x ? "the express contract" : "their mission") + " on you:") + '</p></div><div class="card acc"><div class="kl-m">' + tr("« " + om + " »", "“" + om + "”") + "</div></div>";
      dk = dock('<div class="row"><button class="btn bad" type="button" data-yes>' + tr("Oui, je suis mort", "Yes, I'm dead") + '</button><button class="btn ghost" type="button" data-no>' + tr("Non, c'est faux", "No, that's not true") + "</button></div>");
    } else {
      html += '<span class="eyebrow">' + tr(alive.length + " joueurs encore en vie", alive.length + (alive.length === 1 ? " player still alive" : " players still alive")) + " · " + ptsTxt(score(W, me)) + "</span>" + banner + (note ? '<p class="note-box">' + esc(noteTxt(note)) + "</p>" : "") +
        '<div class="card acc"><span class="eyebrow">' + tr("Ta cible", "Your target") + "</span>" +
        (UI.open ? '<div class="who">' + esc(nameOf(myT)) + '</div><span class="eyebrow">' + tr("Ta mission", "Your mission") + '</span><div class="kl-m">' + esc(mis[me]) + "</div>" +
          (express ? '<div class="kl-x"><span class="eyebrow">' + tr("Ou le contrat express (+1 point)", "Or the express contract (+1 point)") + '</span><div class="kl-m">' + esc(W.ev.m) + "</div></div>" : "") : '<p class="kl-hid">' + tr("Cache ton écran, puis touche « Voir ma mission ».", "Hide your screen, then tap “Show my mission”.") + "</p>") +
        '<button class="btn ghost" type="button" data-eye>' + (UI.open ? tr("Cacher", "Hide") : tr("Voir ma mission", "Show my mission")) + "</button>" +
        (UI.open && W.jk && !W.jok[me] && !myClaim ? '<button class="link" type="button" data-jok style="align-self:center">' + tr("Joker : changer de mission", "Joker: swap my mission") + "</button>" : "") + "</div>";
      if(UI.acc){
        html += '<div class="field"><span class="eyebrow">' + tr("Qui te chasse ? Une seule chance", "Who's hunting you? One shot only") + '</span><div class="choices">' + alive.filter(id => id !== me).map(id => '<button type="button" class="opt" data-w="' + esc(id) + '">' + esc(nameOf(id)) + "</button>").join("") + '</div><button class="link" type="button" data-accx style="align-self:flex-start">' + tr("Annuler", "Cancel") + "</button></div>";
      }
    }
    html += hostBox + '<div class="field"><span class="eyebrow">' + tr("Cimetière", "Graveyard") + "</span>" + graveHTML(W.log, nameOf) + "</div>";
    if(isAlive && !onMe){
      dk = dock(myClaim ? '<p class="wait">' + tr("En attente : " + esc(nameOf(myT)) + " doit confirmer…", "Waiting for " + esc(nameOf(myT)) + " to confirm…") + "</p>"
        : (treve ? '<p class="wait">' + tr("Trêve : aucune mission ne peut être annoncée pour l'instant.", "Truce: nobody can claim a mission right now.") + "</p>" : '<button class="btn acc" type="button" data-kill>' + tr("J'ai réussi ma mission", "I pulled off my mission") + "</button>" + (express ? '<button class="btn ghost" type="button" data-killx>' + tr("J'ai réussi le contrat express", "I pulled off the express contract") + "</button>" : "")) +
          (!used[me] && !UI.acc ? '<button class="link" type="button" data-acc style="align-self:center">' + tr("Je sais qui me chasse", "I know who's hunting me") + "</button>" : ""));
    }
    screen(root, key, html + dk, r => {
      const q = sel => r.querySelector(sel);
      const n = f => (((ctx.mine() || {})[f] || {}).n || 0) + 1;
      if(q("[data-eye]")) q("[data-eye]").addEventListener("click", () => { UI.open = !UI.open; buzz(8); again(); });
      if(q("[data-kill]")) armTap(q("[data-kill]"), () => { buzz([30, 40, 30]); ctx.send({ c: { n: n("c"), t: myT } }); }, tr("Toucher encore : mission réussie sur " + nameOf(myT) + " ?", "Tap again: mission done on " + nameOf(myT) + "?"));
      if(q("[data-killx]")) armTap(q("[data-killx]"), () => { buzz([30, 40, 30]); ctx.send({ c: { n: n("c"), t: myT, x: 1 } }); }, tr("Toucher encore : contrat express réussi ?", "Tap again: express contract done?"));
      if(q("[data-jok]")) armTap(q("[data-jok]"), () => { buzz(20); ctx.send({ j: { n: n("j") } }); }, tr("Toucher encore : utiliser ton joker ?", "Tap again: use your joker?"));
      if(q("[data-acc]")) q("[data-acc]").addEventListener("click", () => { UI.acc = true; again(); });
      if(q("[data-accx]")) q("[data-accx]").addEventListener("click", () => { UI.acc = false; again(); });
      r.querySelectorAll("[data-w]").forEach(b => armTap(b, () => { UI.acc = false; ctx.send({ a: { n: n("a"), w: b.dataset.w } }); }, tr("Toucher encore : c'est " + nameOf(b.dataset.w) + " ?", "Tap again: it's " + nameOf(b.dataset.w) + "?")));
      if(q("[data-yes]")) armTap(q("[data-yes]"), () => ctx.send({ v: { n: n("v"), ok: true } }), tr("Toucher encore pour confirmer", "Tap again to confirm"));
      if(q("[data-no]")) q("[data-no]").addEventListener("click", () => ctx.send({ v: { n: n("v"), ok: false } }));
      r.querySelectorAll("[data-hv]").forEach(b => b.addEventListener("click", () => ctx.act(c => {
        const W2 = work(c.s), v = b.dataset.hv, cl = W2.claims[v]; if(!cl || W2.phase !== "play") return;
        const fr = freshFrom(c), t = c.now(), n1 = W2.log.length;
        eliminate(W2, v, cl.by, "k", fr, t, cl.x);
        c.gage(klGages(W2, n1), c.s.k + ":" + W2.log.length);
        if(W2.evs) maybeEvent(W2, fr, t, false);
        c.set(W2);
      })));
      r.querySelectorAll("[data-hx]").forEach(b => b.addEventListener("click", () => ctx.act(c => {
        const W2 = work(c.s), v = b.dataset.hx; delete W2.claims[v]; c.set({ claims: W2.claims });
      })));
      if(q("[data-stop]")) armTap(q("[data-stop]"), () => ctx.act(c => { c.set({ phase: "end", win: A(c.s.alive).length === 1 ? A(c.s.alive)[0] : "" }); }), tr("Toucher encore pour arrêter", "Tap again to stop"));
    });
    txt(root, "[data-cd]", cdText(W, now));
  },

  /* ---------- Un seul téléphone : on se le passe pour découvrir sa mission ---------- */
  local: {
    players: { min: 4, max: 20 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id];
      const st = store();
      let sel = A(st.klPacks).length ? A(st.klPacks).slice() : ["classique"], jk = st.klJk !== false, evs = st.klEv !== false;
      const gk = "kl" + Math.random().toString(36).slice(2, 8);
      const gage = n0 => { if(api.gage && W.log.length > n0) api.gage(klGages(W, n0).map(e => Object.assign({}, e, { id: nameOf(e.id) })), gk + ":" + W.log.length); };
      let W = null, deck = [], i = 0, cur = "", open = false, last = null, at = "", arg0 = "", news = null, seed = 0;
      const fresh = () => { if(!deck.length) deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); return take(deck); };
      const toggle = (k, v, label, desc) => '<button type="button" class="pack" data-t="' + k + '" aria-pressed="' + v + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(label) + '</span><span class="ds">' + esc(desc) + "</span></span></button>";
      const evNow = () => { const on = evOn(W, Date.now()); return { on, v: on ? evView(W.ev, nameOf) : null }; };
      const bannerL = () => { const e = evNow(); return e.v ? SB.u.twistHTML(e.v) + (W.ev.until ? '<p class="kl-cd" data-cd>' + esc(cdText(W, Date.now())) + "</p>" : "") : ""; };
      api.onTick(() => {
        if(!W || W.phase !== "play") return;
        const now = Date.now();
        if(evs && (at === "main" || at === "me") && idle(W, now) > 12 * MIN){ if(!maybeEvent(W, fresh, now, true)) W.lastEv = now; else news = W.ev; }
        if(at === "main" || at === "me") go(at, arg0);
        txt(root, "[data-cd]", cdText(W, now));
      });
      const go = (ph, arg) => {
        at = ph; arg0 = arg || "";
        if(ph === "setup"){
          screen(root, "su" + sel.join() + jk + evs, CSS + '<p class="howto">' + tr("Le téléphone passe de main en main : chacun découvre en secret sa cible et sa mission. Ensuite on le pose au milieu, et on revient dessus quand on a réussi sa mission, ou pour la relire.", "The phone goes around: everyone secretly sees their target and mission. Then leave it in the middle, and come back to it when you've pulled off your mission, or to reread it.") + "</p>" +
            '<div class="field"><span class="eyebrow">' + tr("Missions", "Missions") + "</span>" + packButtons(sel) + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Variantes", "Variants") + '</span><div class="packs">' + toggle("jk", jk, tr("Un joker par joueur", "One joker per player"), tr("Pour changer une fois de mission", "To swap your mission once")) + toggle("ev", evs, tr("Coups de théâtre", "Plot twists"), tr("Primes, trêves, contrats express, cibles mélangées", "Bounties, truces, express contracts, shuffled targets")) + "</div></div>" +
            dock('<button class="btn acc" type="button" data-go>' + tr("Distribuer les missions", "Deal the missions") + "</button>"), r => {
            r.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => { const x = sel.indexOf(b.dataset.k); if(x >= 0) sel.splice(x, 1); else sel.push(b.dataset.k); persist({ klPacks: sel }); go("setup"); }));
            r.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { if(b.dataset.t === "jk"){ jk = !jk; persist({ klJk: jk }); } else { evs = !evs; persist({ klEv: evs }); } go("setup"); }));
            r.querySelector("[data-go]").addEventListener("click", () => {
              if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; }
              deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); const order = shuffle(ids), tgt = {}, mis = {}, since = {}, now = Date.now();
              order.forEach((id, x) => { tgt[id] = order[(x + 1) % order.length]; mis[id] = fresh(); since[id] = now; });
              W = { phase: "play", win: "", t0: now, jk, evs, alive: ids.slice(), tgt, mis, since, kills: {}, pts: {}, log: [], claims: {}, used: {}, note: {}, jok: {}, acc: {}, nope: {}, ev: null, evLast: "", lastEv: 0, fast: null };
              seed = seedOf(String(now)); news = null; i = 0; go("pass");
            });
          });
        } else if(ph === "pass"){
          screen(root, "pa" + i, '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(names[i]) + "</div><p>" + tr("Les autres, regardez ailleurs.", "Everyone else, look away.") + "</p></div>" + dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi, voir ma mission", "It's me, show my mission") + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => go("deal"));
          });
        } else if(ph === "deal"){
          const id = String(i);
          screen(root, "de" + i, CSS + '<span class="eyebrow">' + esc(names[i]) + '</span><div class="card acc"><span class="eyebrow">' + tr("Ta cible", "Your target") + '</span><div class="who">' + esc(nameOf(W.tgt[id])) + '</div><span class="eyebrow">' + tr("Ta mission", "Your mission") + '</span><div class="kl-m">' + esc(W.mis[id]) + '</div></div><p class="howto">' + tr("Retiens-la bien. Tu pourras la relire en touchant ton prénom.", "Remember it well. You can reread it by tapping your name.") + "</p>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("J'ai retenu, cacher", "Got it, hide") + "</button>"), r => {
            r.querySelector("[data-n]").addEventListener("click", () => { i++; if(i < names.length) go("pass"); else go("main"); });
          });
        } else if(ph === "main"){
          if(news){ const e = news; news = null; go("event", e); return; }
          const e = evNow();
          screen(root, "ma" + W.log.length + W.alive.length + e.on + (W.ev ? W.ev.at : 0), CSS + '<span class="eyebrow">' + tr(W.alive.length + " joueurs encore en vie", W.alive.length + (W.alive.length === 1 ? " player still alive" : " players still alive")) + "</span>" + bannerL() + '<p class="howto">' + tr("Posez le téléphone au milieu. Touche ton prénom pour relire ta mission, annoncer que tu l'as réussie, ou accuser ton chasseur.", "Leave the phone in the middle. Tap your name to reread your mission, claim you pulled it off, or accuse your hunter.") + "</p>" +
            '<div class="choices">' + W.alive.map(id => '<button type="button" class="opt" data-p="' + id + '">' + esc(nameOf(id)) + (score(W, id) ? ' <span class="pill">' + ptsTxt(score(W, id)) + "</span>" : "") + "</button>").join("") + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Cimetière", "Graveyard") + "</span>" + graveHTML(W.log, nameOf) + "</div>" +
            dock('<button class="link warn" type="button" data-stop style="align-self:center">' + tr("Arrêter et voir le classement", "Stop and see the rankings") + "</button>"), r => {
            r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { cur = b.dataset.p; open = false; go("me"); }));
            armTap(r.querySelector("[data-stop]"), () => { W.phase = "end"; W.win = W.alive.length === 1 ? W.alive[0] : ""; go("end"); }, tr("Toucher encore pour arrêter", "Tap again to stop"));
          });
        } else if(ph === "event"){
          const v = evView(arg, nameOf);
          screen(root, "ev" + arg.at, CSS + '<div class="pass" style="min-height:0"><span class="eyebrow">' + tr("Tout le monde écoute", "Listen up, everyone") + '</span><div class="who">' + tr("Coup de théâtre", "Plot twist") + "</div></div>" + SB.u.twistHTML(v) +
            (RETARGET[arg.id] ? '<p class="howto">' + tr("Chacun repasse par le téléphone pour découvrir sa nouvelle mission.", "Everyone comes back to the phone to see their new mission.") + "</p>" : "") +
            dock('<button class="btn acc" type="button" data-n>' + tr("Compris", "Got it") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => go("main")));
        } else if(ph === "me"){
          const t = W.tgt[cur], e = evNow(), treve = e.on === "treve", express = e.on === "express", nt = W.note[cur];
          screen(root, "me" + cur + open + (arg || "") + e.on + W.jok[cur] + W.mis[cur], CSS + '<span class="eyebrow">' + esc(nameOf(cur)) + " · " + ptsTxt(score(W, cur)) + "</span>" + bannerL() +
            (open && nt ? '<p class="note-box">' + esc(noteTxt(nt)) + "</p>" : "") +
            (open ? '<div class="card acc"><span class="eyebrow">' + tr("Ta cible", "Your target") + '</span><div class="who">' + esc(nameOf(t)) + '</div><span class="eyebrow">' + tr("Ta mission", "Your mission") + '</span><div class="kl-m">' + esc(W.mis[cur]) + "</div>" +
                (express ? '<div class="kl-x"><span class="eyebrow">' + tr("Ou le contrat express (+1 point)", "Or the express contract (+1 point)") + '</span><div class="kl-m">' + esc(W.ev.m) + "</div></div>" : "") +
                (W.jk && !W.jok[cur] ? '<button class="link" type="button" data-jok style="align-self:center">' + tr("Joker : changer de mission", "Joker: swap my mission") + "</button>" : "") + "</div>"
              : '<div class="pass" style="min-height:24vh"><p>' + tr("C'est bien toi, " + esc(nameOf(cur)) + " ? Cache l'écran avant d'ouvrir.", "Is that really you, " + esc(nameOf(cur)) + "? Hide the screen before opening.") + "</p></div>") +
            (arg === "acc" ? '<div class="field"><span class="eyebrow">' + tr("Qui te chasse ? Une seule chance", "Who's hunting you? One shot only") + '</span><div class="choices">' + W.alive.filter(id => id !== cur).map(id => '<button type="button" class="opt" data-w="' + id + '">' + esc(nameOf(id)) + "</button>").join("") + "</div></div>" : "") +
            dock((open ? (treve ? '<p class="wait">' + tr("Trêve : aucune mission ne peut être annoncée pour l'instant.", "Truce: nobody can claim a mission right now.") + "</p>" : '<button class="btn acc" type="button" data-kill>' + tr("J'ai réussi ma mission", "I pulled off my mission") + "</button>" + (express ? '<button class="btn ghost" type="button" data-killx>' + tr("J'ai réussi le contrat express", "I pulled off the express contract") + "</button>" : "")) : '<button class="btn acc" type="button" data-open>' + tr("Voir ma mission", "Show my mission") + "</button>") +
              (!W.used[cur] && arg !== "acc" ? '<button class="btn ghost" type="button" data-acc>' + tr("Je sais qui me chasse", "I know who's hunting me") + "</button>" : "") +
              '<button class="link" type="button" data-back style="align-self:center">' + tr("Cacher et revenir", "Hide and go back") + "</button>"), r => {
            const q = x => r.querySelector(x);
            const kill = x => {
              const victim = W.tgt[cur], m = x ? W.ev.m : W.mis[cur], now = Date.now(), n0 = W.log.length;
              eliminate(W, victim, cur, "k", fresh, now, x); delete W.note[cur]; gage(n0);
              last = { by: cur, on: victim, m, how: "k" }; buzz([40, 60, 40]);
              if(W.evs && maybeEvent(W, fresh, now, false)) news = W.ev;
              go("news");
            };
            if(q("[data-open]")) q("[data-open]").addEventListener("click", () => { open = true; go("me", arg); });
            if(q("[data-kill]")) armTap(q("[data-kill]"), () => kill(0), tr("Toucher encore : " + nameOf(t) + " confirme ?", "Tap again: " + nameOf(t) + " confirms?"));
            if(q("[data-killx]")) armTap(q("[data-killx]"), () => kill(1), tr("Toucher encore : " + nameOf(t) + " confirme ?", "Tap again: " + nameOf(t) + " confirms?"));
            if(q("[data-jok]")) armTap(q("[data-jok]"), () => { W.jok[cur] = true; W.mis[cur] = fresh(); W.since[cur] = Date.now(); W.note[cur] = noteOf("Joker utilisé : voici ta nouvelle mission.", "Joker used: here's your new mission.", Date.now()); buzz(20); go("me", arg); }, tr("Toucher encore : utiliser ton joker ?", "Tap again: use your joker?"));
            if(q("[data-acc]")) q("[data-acc]").addEventListener("click", () => go("me", "acc"));
            r.querySelectorAll("[data-w]").forEach(b => armTap(b, () => {
              W.used[cur] = true; W.acc[b.dataset.w] = (W.acc[b.dataset.w] || 0) + 1;
              const hunter = W.alive.find(h => W.tgt[h] === cur), now = Date.now(), n0 = W.log.length;
              if(hunter === b.dataset.w){
                const g = eliminate(W, hunter, cur, "u", fresh, now); gage(n0);
                if(g && g !== cur) W.note[g] = noteOf("Ta cible a été éliminée par quelqu'un d'autre. Voici ta nouvelle cible et ta nouvelle mission.", "Your target was taken out by someone else. Here's your new target and your new mission.", now);
                last = { by: cur, on: hunter, how: "u" }; buzz([40, 60, 40]);
                if(W.evs && maybeEvent(W, fresh, now, false)) news = W.ev;
                go("news");
              } else { last = { miss: b.dataset.w }; go("news"); }
            }, tr("Toucher encore : c'est " + nameOf(b.dataset.w) + " ?", "Tap again: it's " + nameOf(b.dataset.w) + "?")));
            q("[data-back]").addEventListener("click", () => { if(open) delete W.note[cur]; go("main"); });
          });
        } else if(ph === "news"){
          const L2 = last;
          if(L2.miss !== undefined){
            screen(root, "nw-miss" + W.log.length + Math.random(), '<div class="pass"><span class="eyebrow">' + tr("Raté", "Miss") + '</span><div class="who">' + tr("Pas ", "Not ") + esc(nameOf(L2.miss)) + "</div><p>" + tr(esc(nameOf(cur)) + " n'a plus d'accusation. Son chasseur court toujours…", esc(nameOf(cur)) + " is out of accusations. Their hunter is still on the loose…") + "</p></div>" + dock('<button class="btn acc" type="button" data-n>' + tr("Continuer", "Continue") + "</button>"), r => r.querySelector("[data-n]").addEventListener("click", () => go("main")));
            return;
          }
          const over = W.phase === "end";
          const heir = L2.how === "k" && !(news && RETARGET[news.id]) ? L2.by : "";
          const lg = W.log[W.log.length - 1] || {};
          screen(root, "nw" + W.log.length, '<div class="pass"><span class="eyebrow">' + (L2.how === "u" ? tr("Démasqué !", "Unmasked!") : tr("Éliminé !", "Taken out!")) + '</span><div class="who">' + esc(nameOf(L2.on)) + "</div><p>" +
            (L2.how === "u" ? tr(esc(nameOf(L2.by)) + " a démasqué son chasseur.", esc(nameOf(L2.by)) + " unmasked their hunter.") : tr("par " + esc(nameOf(L2.by)) + ", avec la mission « " + esc(L2.m) + " ».", "by " + esc(nameOf(L2.by)) + ", with the mission “" + esc(L2.m) + "”.")) + "</p>" +
            (lg.p > 1 ? '<p class="sm">' + tr(esc(nameOf(L2.by)) + " marque " + ptsTxt(lg.p) + (lg.b === "p" ? ", prime comprise" : "") + ".", esc(nameOf(L2.by)) + " scores " + ptsTxt(lg.p) + (lg.b === "p" ? ", bounty included" : "") + ".") + "</p>" : "") + "</div>" +
            dock(over ? '<button class="btn acc" type="button" data-end>' + tr("Voir le vainqueur", "See the winner") + "</button>"
              : heir ? '<button class="btn acc" type="button" data-heir>' + esc(nameOf(heir)) + tr(" : voir ma nouvelle cible", ": see my new target") + "</button>" : '<button class="btn acc" type="button" data-n>' + tr("Continuer", "Continue") + "</button>"), r => {
            const q = x => r.querySelector(x);
            if(q("[data-end]")) q("[data-end]").addEventListener("click", () => go("end"));
            if(q("[data-n]")) q("[data-n]").addEventListener("click", () => go("main"));
            if(q("[data-heir]")) q("[data-heir]").addEventListener("click", () => { cur = heir; open = false; go("me"); });
          });
        } else if(ph === "end"){
          const order = ranking(ids, W), wt = winTitle(W, ids, nameOf, seed);
          api.win([nameOf(wt.w)]);
          screen(root, "end", CSS + '<span class="eyebrow">' + (W.win ? tr("Dernier survivant", "Last survivor") : tr("Meilleur score", "Top score")) + '</span><div class="who">' + esc(nameOf(wt.w)) + "</div>" +
            '<div class="field"><span class="eyebrow">' + tr("Tableau de chasse", "Kill board") + '</span><ul class="kl-chain">' + order.map(id => "<li><span>" + esc(nameOf(id)) + (W.alive.indexOf(id) >= 0 ? tr(" · vivant", " · alive") : "") + "</span><span>" + ptsTxt(score(W, id)) + "</span></li>").join("") + "</ul></div>" +
            awardsHTML(awards(W, ids, nameOf, seed)) +
            '<div class="field"><span class="eyebrow">' + tr("Cimetière", "Graveyard") + "</span>" + graveHTML(W.log, nameOf) + "</div>" +
            dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
            r.querySelector("[data-a]").addEventListener("click", () => api.again());
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go("setup");
    }
  }
};
DEF.engine = { eliminate, work, maybeEvent, startEvent, evOn, awards, EVENTS };
SB.register(DEF);
})();
