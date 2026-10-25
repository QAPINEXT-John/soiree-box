/* C'est un(e) 10 mais… — un défaut s'affiche, chacun redonne une note sur 10 en secret.
   On marque des points en étant proche de la moyenne du groupe (ou de la note du juge). */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz, clean } = SB.u;

/* ---------- Les défauts (phrases qui suivent « C'est un(e) 10 mais… ») ---------- */
const CL = [
  "mâche la bouche ouverte", "met des chaussettes avec ses sandales", "répond « ok » à tous tes messages", "appelle sa mère six fois par jour",
  "met de la mayonnaise sur ses pâtes", "s'endort devant chaque film", "parle de crypto à chaque repas", "a un rire de phoque",
  "dit « au jour d'aujourd'hui »", "met le papier toilette à l'envers", "regarde tes stories mais ne répond jamais à tes messages",
  "remet le pack de lait vide au frigo", "envoie des vocaux de sept minutes", "met le son de son téléphone à fond dans le train",
  "a les ongles de pieds beaucoup trop longs", "applaudit quand l'avion atterrit", "marche super lentement sur le trottoir",
  "fait des fautes à chaque mot", "ne sait pas cuire des pâtes", "dort avec la télé allumée", "a 14 000 mails non lus",
  "met « mdr » à la fin de chaque phrase", "n'aime pas les animaux", "parle de son ex à chaque conversation",
  "commence chaque histoire par « en fait, en vrai, du coup »", "a peur des papillons", "fait du yoga à 5 h du matin et veut que tu viennes",
  "donne un prénom à sa voiture", "met des emojis clown partout", "a froid même en plein mois de juillet",
  "a une collection de figurines qui prend tout le salon", "refuse de partager ses frites", "regarde des vidéos sans écouteurs dans le métro",
  "lit la fin du livre en premier", "te coupe la parole tout le temps", "dit « moi je suis pas comme les autres »",
  "n'a jamais de batterie", "a toujours une heure de retard minimum", "fait des imitations… très mauvaises",
  "chante faux, tout le temps, et très fort", "a sa propre photo en fond d'écran", "ronfle comme un tracteur",
  "prend en photo tous ses plats", "garde les étiquettes des vêtements pour pouvoir les rendre", "ne sait pas nager",
  "se ronge les ongles devant toi", "ne range jamais rien", "répond « on verra » à chaque proposition",
  "croit que la Terre est plate", "n'a jamais lu un seul livre", "commente chaque match comme un entraîneur",
  "lèche son couteau à table", "compte chaque centime quand on partage l'addition", "fait sonner son réveil douze fois chaque matin",
  "parle à son chien comme à un bébé, en public", "poste un message motivant sur LinkedIn tous les matins", "met du ketchup sur tout",
  "te spoile toutes les séries", "ne connaît aucune chanson par cœur", "fait des pompes dès qu'il y a un miroir",
  "a un rire qui fait peur aux enfants", "met ses pieds froids sur toi", "a des chaussettes trouées, toutes",
  "conduit à 40 sur l'autoroute", "klaxonne à chaque feu rouge", "suce son pouce en dormant"
];
const KID = [
  "triche au Uno", "mange tous les bonbons sans partager", "raconte la fin des films", "boude pendant une heure après chaque défaite",
  "met ses doigts dans le pot de pâte à tartiner", "ne prête jamais ses jeux vidéo", "parle super fort au téléphone",
  "ne fait jamais de passes au foot", "a les pieds qui sentent fort", "rit à ses propres blagues avant la fin",
  "fait des bruits de bouche en mangeant", "ne sait pas garder un secret", "veut toujours choisir le jeu",
  "mange le dernier gâteau sans demander", "répond toujours « c'est celui qui dit qui est »", "dit « on recommence » à chaque défaite",
  "raconte ses rêves pendant vingt minutes", "prend toujours la meilleure place sur le canapé", "chante les génériques de dessins animés en boucle",
  "dit « je le savais » après chaque réponse", "fait des blagues pas drôles du tout", "ne sait pas perdre à Mario Kart",
  "a toujours les mains collantes", "oublie toujours ton anniversaire", "dort encore avec son doudou",
  "met des chaussettes dépareillées", "te réveille à 6 h le samedi", "ne range jamais sa chambre", "mâchouille tous les crayons",
  "copie tous tes dessins", "dit « moi d'abord ! » à chaque fois", "met de la sauce tomate sur les crêpes",
  "parle à ses plantes", "a peur des pigeons", "fait des grimaces sur toutes les photos de classe"
];
const LOVE = [
  "like encore les photos de son ex", "répond « mdr » à tes « je t'aime »", "t'a enregistré sous un faux nom dans son téléphone",
  "a encore une appli de rencontre « juste pour voir »", "te présente ses parents au deuxième rendez-vous", "poste votre couple tous les jours",
  "ne poste jamais votre couple", "dit « on n'est pas vraiment ensemble » après un an", "a un meilleur ami qui dort chez vous",
  "appelle tout le monde « bébé »", "compare tout avec son ex", "fouille ton téléphone pendant que tu dors",
  "ne paie jamais au resto", "partage l'addition au centime près au premier rendez-vous", "envoie des captures de vos disputes à ses potes",
  "a donné ton code Netflix à son ex", "a trois ex qui lui écrivent encore", "dit « je t'aime » au premier rendez-vous", "veut six enfants",
  "regarde votre série en avance sans toi", "vit encore chez ses parents à 35 ans", "t'appelle par le prénom de son ex",
  "ne s'excuse jamais", "répond aux messages au bout de trois jours", "t'a ghosté une fois « par erreur »",
  "a une photo de profil de 2015", "t'a dragué avec une phrase copiée sur Internet", "a pour meilleure amie son ex",
  "invite sa mère en vacances avec vous", "fait une crise de jalousie pour un like", "reste très flou sur sa soirée d'hier",
  "a le prénom de son ex tatoué sur le bras", "prévoit votre mariage dès le troisième rendez-vous", "n'a jamais dit « je t'aime » en trois ans",
  "note tous tes défauts dans une appli", "dit « on en reparle » et n'en reparle jamais", "oublie ton anniversaire, chaque année",
  "t'a demandé ton signe astrologique avant ton prénom", "refuse de te présenter à ses potes", "garde tous les cadeaux de ses ex",
  "choisit toujours le resto, et toujours le même", "lit tes messages par-dessus ton épaule", "parle en bébé quand vous êtes seuls",
  "laisse ses ex commenter toutes ses photos", "veut qu'on porte des tenues assorties"
];
const HOT = [
  "simule à chaque fois", "appelle sa mère juste après le sexe", "a un fétiche des pieds très insistant", "parle de son ex au lit",
  "garde ses chaussettes pendant", "regarde son téléphone pendant l'amour", "crie le prénom de quelqu'un d'autre", "dure deux minutes, montre en main",
  "veut tout filmer, à chaque fois", "n'embrasse jamais", "n'a pas lavé ses draps depuis des mois", "ronfle trente secondes après",
  "zappe tous les préliminaires", "veut le faire quand ses potes sont dans la pièce d'à côté", "garde les sex toys de ses ex",
  "fait du dirty talk avec une voix de dessin animé", "note ta performance sur 10 après", "propose un plan à trois au deuxième rendez-vous",
  "envoie des nudes à tout le monde, toi compris", "dort dans un lit superposé", "veut la lumière à fond", "met de la musique de fête foraine pendant",
  "a les mains toujours gelées", "s'endort pendant les préliminaires", "dit « merci » après", "ne veut le faire que dans la voiture",
  "commente comme un match de foot", "parle de ses exploits passés pendant", "ne se lave pas avant", "mord beaucoup trop fort",
  "te demande une note sur cinq étoiles après", "ne veut le faire que le dimanche à 15 h", "a des miroirs partout au plafond",
  "fait des bruits d'animaux", "a un tableur avec toutes ses préférences au lit", "refuse de dormir avec toi après",
  "éclate de rire au pire moment", "garde ses lunettes de soleil au lit", "veut un mot de sécurité dès le premier soir", "est accro au porno"
];
const CL_EN = [
  "chews with their mouth open", "wears socks with sandals", "replies “k” to all your texts", "calls their mom six times a day",
  "puts mayo on pasta", "falls asleep during every movie", "talks about crypto at every meal", "laughs like a seal",
  "hangs the toilet paper the wrong way", "watches your stories but never answers your texts", "puts the empty milk carton back in the fridge",
  "sends seven-minute voice notes", "plays their phone on speaker on the train", "has way too long toenails", "claps when the plane lands",
  "walks painfully slowly on the sidewalk", "misspells every other word", "can't cook pasta", "sleeps with the TV on", "has 14,000 unread emails",
  "ends every sentence with “lol”", "doesn't like animals", "brings up their ex in every conversation", "is scared of butterflies",
  "does yoga at 5 a.m. and wants you to join", "has named their car", "uses the clown emoji everywhere", "is cold even in July",
  "has a figurine collection taking over the living room", "won't share their fries", "watches videos without headphones on the subway",
  "reads the last page of a book first", "interrupts you constantly", "says “I'm not like other people”", "never has any battery",
  "is always at least an hour late", "does impressions… terrible ones", "sings off-key, all the time, really loud", "has their own photo as a wallpaper",
  "snores like a tractor", "photographs every meal", "keeps the tags on clothes so they can return them", "can't swim",
  "bites their nails in front of you", "never tidies anything", "answers “we'll see” to everything", "thinks the Earth is flat",
  "has never read a book", "coaches the TV during every game", "licks their knife at the table", "splits the bill down to the cent",
  "snoozes their alarm twelve times every morning", "baby-talks to their dog in public", "posts a motivational LinkedIn post every morning",
  "puts ketchup on everything", "spoils every show for you", "does push-ups whenever there's a mirror", "puts cold feet on you",
  "drives 25 mph on the highway", "honks at every red light"
];
const KID_EN = [
  "cheats at Uno", "eats all the candy without sharing", "spoils the end of movies", "sulks for an hour after every loss",
  "sticks their fingers in the chocolate spread", "never lends their video games", "talks really loud on the phone", "never passes the ball in soccer",
  "has stinky feet", "laughs at their own jokes before the end", "makes noises while eating", "can't keep a secret", "always wants to pick the game",
  "eats the last cookie without asking", "always says “I know you are but what am I”", "says “let's start over” after every loss",
  "tells you their dreams for twenty minutes", "always takes the best spot on the couch", "sings cartoon theme songs nonstop",
  "says “I knew it” after every answer", "tells really unfunny jokes", "can't lose at Mario Kart", "always has sticky hands",
  "always forgets your birthday", "still sleeps with their stuffed animal", "wears mismatched socks", "wakes you up at 6 a.m. on Saturday",
  "never cleans their room", "chews on every pencil", "copies all your drawings", "always says “me first!”", "talks to their plants",
  "is scared of pigeons", "pulls faces in every class photo"
];
const LOVE_EN = [
  "still likes their ex's photos", "replies “lol” to your “I love you”", "saved you under a fake name in their phone", "still has a dating app “just to look”",
  "introduces you to their parents on the second date", "posts about you two every single day", "never posts about you two",
  "says “we're not really together” after a year", "has a best friend who sleeps at your place", "calls everyone “babe”", "compares everything to their ex",
  "goes through your phone while you sleep", "never pays at restaurants", "splits the bill to the cent on the first date",
  "sends screenshots of your fights to their friends", "gave your Netflix password to their ex", "has three exes who still text them",
  "says “I love you” on the first date", "wants six kids", "watches your show ahead without you", "still lives with their parents at 35",
  "calls you by their ex's name", "never apologizes", "takes three days to answer texts", "ghosted you once “by accident”",
  "has a profile picture from 2015", "hit on you with a line copied from the internet", "is best friends with their ex",
  "invites their mom on your vacations", "gets jealous over a like", "is very vague about where they were last night",
  "has their ex's name tattooed on their arm", "plans your wedding by the third date", "hasn't said “I love you” in three years",
  "keeps a list of your flaws in an app", "says “we'll talk about it later” and never does", "forgets your birthday every year",
  "asked your star sign before your name", "won't introduce you to their friends", "keeps every gift from their exes",
  "baby-talks when you're alone", "wants matching outfits"
];
const HOT_EN = [
  "fakes it every time", "calls their mom right after sex", "has a very insistent foot fetish", "talks about their ex in bed",
  "keeps their socks on", "checks their phone during sex", "moans someone else's name", "lasts two minutes, tops", "wants to film every time",
  "never kisses", "hasn't washed their sheets in months", "snores thirty seconds after", "skips foreplay entirely",
  "wants to do it with their friends in the next room", "kept their exes' sex toys", "does dirty talk in a cartoon voice",
  "rates your performance out of 10 afterwards", "suggests a threesome on the second date", "sends nudes to everyone, you included",
  "sleeps in a bunk bed", "wants the lights all the way up", "plays carnival music during", "always has freezing hands",
  "falls asleep during foreplay", "says “thank you” afterwards", "only wants to do it in the car", "narrates like a sports commentator",
  "brags about past exploits during", "doesn't shower before", "bites way too hard", "asks for a five-star review afterwards",
  "only wants to do it Sundays at 3 p.m.", "has mirrors all over the ceiling", "makes animal noises", "keeps a spreadsheet of their bedroom preferences",
  "won't sleep next to you afterwards", "bursts out laughing at the worst moment", "keeps their sunglasses on in bed", "watches way too much porn"
];
const LISTS = { fr: { cl: CL, kid: KID, love: LOVE, hot: HOT }, en: { cl: CL_EN, kid: KID_EN, love: LOVE_EN, hot: HOT_EN } };
const lists = lg => LISTS[lg === "en" ? "en" : "fr"];
const PACKS = [
  { v: "cl", label: tr("Classique", "Classic"), desc: tr("Manies, habitudes, petits défauts", "Quirks, habits, little flaws"), list: lists(SB.lang()).cl },
  { v: "kid", label: tr("Copains", "Buddies"), desc: tr("Le pote parfait… ou presque. Tout public", "The perfect buddy… almost. For everyone"), list: lists(SB.lang()).kid, kid: true },
  { v: "love", label: tr("Love & dates", "Love & dates"), desc: tr("Couple, ex, rencards ratés", "Couples, exes, bad dates"), list: lists(SB.lang()).love },
  { v: "hot", label: tr("Hot", "Hot"), desc: tr("Au lit, ça se complique", "In bed, things get complicated"), list: lists(SB.lang()).hot, hot: true }
];
const SEEN = "dixmais:q";
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; };
function deckFor(packs, lg){
  const sel = A(packs), L = lists(lg); const pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => L[p.v]);
  return SB.u.fresh(SEEN, kidF(pool.length ? pool : L.cl));
}
const PREFIX = lg => (lg === "en" ? "They're a 10 but…" : "C'est un(e) 10 mais…");

/* ---------- Coups de théâtre ---------- */
const TW = [
  { id: "x2", name: tr("Manche en or", "Golden round"), desc: tr("Les points de cette manche comptent double.", "Points this round count double.") },
  { id: "juge", name: tr("Le juge", "The judge"), desc: tr("Une seule note compte : celle du juge. Les autres doivent la deviner.", "Only one rating counts: the judge's. Everyone else has to guess it."), ok: o => o.n >= 3 },
  { id: "cache", name: tr("Notes cachées", "Hidden ratings"), desc: tr("On ne saura pas qui a mis quoi : seulement la moyenne et la répartition.", "Nobody will know who gave what: only the average and the spread.") },
  { id: "pick", name: tr("Le plus sévère choisit", "The harshest picks"), desc: tr("Celui qui met la note la plus basse choisit la phrase suivante parmi trois.", "Whoever gives the lowest rating picks the next line out of three.") },
  { id: "plume", name: tr("La plume", "The pen"), desc: tr("Un joueur invente le défaut de cette manche.", "One player makes up this round's flaw."), ok: o => o.n >= 3 }
];
const TWL = [
  { id: "x2", name: tr("Manche en or", "Golden round"), desc: tr("Les points de cette manche comptent double.", "Points this round count double.") },
  { id: "juge", name: tr("Le juge", "The judge"), desc: tr("Une seule note compte : celle du juge. Les autres doivent la deviner.", "Only one rating counts: the judge's. Everyone else has to guess it."), ok: o => o.n >= 3 },
  { id: "cache", name: tr("Notes cachées", "Hidden ratings"), desc: tr("On ne montre que la moyenne et la répartition, pas qui a mis quoi.", "Only the average and the spread are shown, not who gave what.") },
  { id: "plume", name: tr("La plume", "The pen"), desc: tr("Un joueur invente le défaut à voix haute, puis tout le monde note.", "One player makes up the flaw out loud, then everyone rates.") }
];
function nextTw(on, round, last, n){ return on && round > 1 ? SB.u.twist(TW, { last, n, rate: .35 }) : null; }

/* ---------- Le calcul d'une manche (réseau et un seul téléphone) ----------
   notes : { id: 0..10 }. Cible = moyenne du groupe, ou note du juge.
   Points : le plus proche 2, les autres à 1 point ou moins 1 (×2 en manche en or). */
function scoreRound(notes, judge, x2){
  const ids = Object.keys(notes); if(!ids.length) return { avg: 0, target: 0, pts: {}, gl: [] };
  const avg = Math.round(ids.reduce((a, id) => a + notes[id], 0) / ids.length * 10) / 10;
  const hasJ = judge && notes[judge] != null && ids.length > 1;
  const target = hasJ ? notes[judge] : avg, pl = hasJ ? ids.filter(id => id !== judge) : ids;
  const d = {}; pl.forEach(id => { d[id] = Math.round(Math.abs(notes[id] - target) * 10) / 10; });
  const min = Math.min.apply(null, pl.map(id => d[id])), max = Math.max.apply(null, pl.map(id => d[id]));
  const m = x2 ? 2 : 1, pts = {}, gl = [];
  pl.forEach(id => { pts[id] = d[id] === min ? 2 * m : d[id] <= 1 ? m : 0; });
  if(max >= 3 && max > min) pl.filter(id => d[id] === max).forEach(id => gl.push({ id, ev: "loin" }));
  pl.filter(id => d[id] === 0).forEach(id => gl.push({ id, ev: "pile" }));
  if(ids.length >= 3 && ids.every(id => notes[id] <= 2)) gl.push({ id: ids[0], ev: "zero" });
  return { avg, target, pts, gl, d };
}
const num = v => String(v).replace(".", tr(",", "."));
const ptsTxt = n => tr("+" + n + " pt" + (n > 1 ? "s" : ""), "+" + n + (n === 1 ? " pt" : " pts"));
function verdict(avg){
  if(avg >= 9) return tr("Rien à faire, ça reste un 10.", "Nothing to be done, still a 10.");
  if(avg >= 7) return tr("Ça passe, on ferme les yeux.", "We'll let it slide.");
  if(avg >= 5) return tr("Ça se discute…", "Debatable…");
  if(avg >= 3) return tr("Gros doute.", "Big doubts.");
  return tr("Rédhibitoire !", "Dealbreaker!");
}
const CSS = '<style data-dm>' +
  '.dm-notes{display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:6px}' +
  '.dm-notes button{min-height:52px; border-radius:14px; border:1.5px solid var(--line); background:var(--card); color:var(--ink); font-family:var(--f-disp); font-weight:800; font-size:22px}' +
  '.dm-notes button[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--dark,#14101a)}.dm-notes button:disabled{opacity:.5}' +
  '.dm-avg{display:flex; align-items:baseline; justify-content:center; gap:6px; margin:4px 0}.dm-avg b{font-family:var(--f-disp); font-size:64px; line-height:1; color:var(--acc)}.dm-avg span{font-weight:800; color:var(--muted); font-size:20px}' +
  '.dm-vd{text-align:center; font-weight:800; font-size:18px; margin:0}' +
  '.dm-row{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line)}.dm-row b{flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}' +
  '.dm-row .n{font-family:var(--f-disp); font-weight:800; font-size:22px; min-width:34px; text-align:right}.dm-row .p{font-size:13px; font-weight:800; color:var(--ok,#3ccb7f); min-width:46px; text-align:right}.dm-row.j{border-color:var(--acc)}' +
  '.dm-list{display:flex; flex-direction:column; gap:6px}.dm-dist{display:grid; grid-template-columns:repeat(11,1fr); gap:3px; align-items:end; height:70px}.dm-dist i{display:block; background:var(--acc); border-radius:4px 4px 0 0; min-height:2px}' +
  '.dm-dl{display:grid; grid-template-columns:repeat(11,1fr); gap:3px; font-size:11px; font-weight:800; color:var(--muted); text-align:center}</style>';
const notesHTML = (sel, dis) => '<div class="dm-notes" role="group" aria-label="' + tr("Ta note", "Your rating") + '">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => '<button type="button" data-n="' + n + '" aria-pressed="' + (sel === n) + '"' + (dis ? " disabled" : "") + ">" + n + "</button>").join("") + "</div>";
function distHTML(vals){
  const c = new Array(11).fill(0); vals.forEach(v => { c[v]++; }); const mx = Math.max(1, ...c);
  return '<div class="dm-dist" aria-hidden="true">' + c.map(n => '<i style="height:' + Math.round(n / mx * 100) + '%"></i>').join("") + '</div><div class="dm-dl">' + c.map((_, i) => "<span>" + i + "</span>").join("") + "</div>";
}
// Résultats d'une manche : moyenne, répartition, et (sauf notes cachées) la note de chacun avec ses points.
function resHTML(R, ids, nameOf, notes, judge, hide){
  const head = judge ? '<span class="eyebrow" style="text-align:center">' + tr("La note du juge, " + esc(nameOf(judge)), "The judge's rating, " + esc(nameOf(judge))) + "</span>" : '<span class="eyebrow" style="text-align:center">' + tr("Le 10 devient un…", "The 10 becomes a…") + "</span>";
  const tgt = judge ? R.target : R.avg;
  let h = head + '<div class="dm-avg"><b>' + num(tgt) + "</b><span>/10</span></div>" + '<p class="dm-vd">' + esc(verdict(tgt)) + "</p>";
  if(judge) h += '<p class="sm" style="text-align:center; margin:0">' + tr("Moyenne du groupe : ", "Group average: ") + num(R.avg) + "</p>";
  h += distHTML(ids.filter(id => notes[id] != null).map(id => notes[id]));
  if(!hide) h += '<div class="dm-list">' + ids.filter(id => notes[id] != null).sort((a, b) => (id2 => (id2 === judge ? -1 : 0))(a) - (id2 => (id2 === judge ? -1 : 0))(b) || notes[b] - notes[a]).map(id =>
    '<div class="dm-row' + (id === judge ? " j" : "") + '"><b>' + esc(nameOf(id)) + (id === judge ? " · " + tr("juge", "judge") : "") + '</b><span class="p">' + (R.pts[id] ? ptsTxt(R.pts[id]) : "") + '</span><span class="n">' + notes[id] + "</span></div>").join("") + "</div>";
  else h += '<p class="sm" style="text-align:center">' + tr("Notes cachées : personne ne saura qui a mis quoi.", "Hidden ratings: nobody will know who gave what.") + (Object.keys(R.pts).some(id => R.pts[id]) ? tr(" Points : ", " Points: ") + esc(Object.keys(R.pts).filter(id => R.pts[id]).map(id => nameOf(id) + " " + ptsTxt(R.pts[id])).join(", ")) : "") + "</p>";
  return h;
}
// Trophées de fin : le plus indulgent, le plus sévère, le plus rédhibitoire.
function awards(ids, s, nameOf){
  const out = [], sum = s.sum || {}, cnt = s.cnt || {}, z = s.zero || {};
  const avgOf = id => (cnt[id] ? sum[id] / cnt[id] : null), withN = ids.filter(id => cnt[id]);
  if(withN.length > 1){
    const hi = withN.slice().sort((a, b) => avgOf(b) - avgOf(a))[0], lo = withN.slice().sort((a, b) => avgOf(a) - avgOf(b))[0];
    out.push([tr("Le cœur d'artichaut", "The softie"), nameOf(hi), tr("Note moyenne : ", "Average rating: ") + num(Math.round(avgOf(hi) * 10) / 10)]);
    if(lo !== hi) out.push([tr("Le jury impitoyable", "The ruthless judge"), nameOf(lo), tr("Note moyenne : ", "Average rating: ") + num(Math.round(avgOf(lo) * 10) / 10)]);
  }
  const zz = ids.filter(id => z[id]).sort((a, b) => z[b] - z[a])[0];
  if(zz) out.push([tr("Tolérance zéro", "Zero tolerance"), nameOf(zz), tr(z[zz] + " fois 0/10", z[zz] + (z[zz] === 1 ? " zero" : " zeros"))]);
  return out;
}
// Met à jour les totaux (notes données, zéros) après une manche.
function addTotals(s, notes){
  const sum = Object.assign({}, s.sum || {}), cnt = Object.assign({}, s.cnt || {}), zero = Object.assign({}, s.zero || {});
  Object.keys(notes).forEach(id => { sum[id] = (sum[id] || 0) + notes[id]; cnt[id] = (cnt[id] || 0) + 1; if(notes[id] === 0) zero[id] = (zero[id] || 0) + 1; });
  return { sum, cnt, zero };
}
function packButtons(sel){
  return '<div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + '</span></span><span class="ct">' + p.list.length + "</span></button>").join("") + "</div>";
}
const qCard = (q, lg, own) => '<div class="card acc"><span class="eyebrow">' + esc(PREFIX(lg)) + '</span><div class="big">… ' + esc(q) + "</div>" + (own ? '<span class="sm">' + tr("Défaut inventé par ", "Flaw made up by ") + esc(own) + "</span>" : "") + "</div>";

SB.register({
  id: "dixmais", name: tr("C'est un 10 mais…", "They're a 10 but…"), glyph: tr("10 mais", "10 but"), pitch: tr("Un 10/10 avec un gros défaut : quelle note tu lui redonnes ?", "A perfect 10 with one big flaw: what's the new rating?"), hot: true,
  accent: { light: "#e0457b", dark: "#ff7aa8" },
  tag: tr("Un défaut tombe, chacun redonne une note sur 10 en secret. Sois dans la tête du groupe pour marquer des points.", "A flaw drops, everyone secretly gives a new rating out of 10. Read the group's mind to score points."),
  min: 2, max: 20,
  gages: [
    { ev: "loin", label: tr("Le plus loin de la moyenne", "Furthest from the average"), kind: "boit", n: 2 },
    { ev: "pile", label: tr("Pile sur la moyenne (ou la note du juge)", "Spot on the average (or the judge's rating)"), kind: "distribue", n: 2 },
    { ev: "zero", label: tr("Rédhibitoire pour tout le monde (toutes les notes à 2 ou moins)", "Dealbreaker for everyone (every rating 2 or less)"), kind: "tous", n: 1 }
  ],
  rules: tr([
    "Une phrase s'affiche : « C'est un(e) 10 mais… » suivie d'un défaut.",
    "Chacun redonne une note sur 10 en secret : ce défaut, ça te fait descendre à combien ?",
    "On découvre la moyenne du groupe et la note de chacun.",
    "Points : le plus proche de la moyenne gagne 2 points, ceux à 1 point ou moins de la moyenne gagnent 1 point.",
    "Coups de théâtre : manche en or, juge (il faut deviner sa note), notes cachées, la plume (un joueur invente le défaut)…",
    "À la fin : le classement, le cœur d'artichaut et le jury impitoyable de la soirée."
  ], [
    "A line pops up: “They're a 10 but…” followed by a flaw.",
    "Everyone secretly gives a new rating out of 10: how far does that flaw drop them?",
    "Reveal the group average and everyone's rating.",
    "Points: closest to the average gets 2 points, anyone within 1 point of the average gets 1.",
    "Twists: golden round, the judge (guess their rating), hidden ratings, the pen (a player makes up the flaw)…",
    "At the end: the standings, the softie and the ruthless judge of the night."
  ]),
  options: [
    { id: "rounds", label: tr("Manches", "Rounds"), type: "seg", def: 10, values: [{ v: 6, label: "6" }, { v: 10, label: "10" }, { v: 15, label: "15" }] },
    { id: "packs", label: tr("Paquets", "Packs"), type: "multi", def: ["cl", "love"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length })) },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour une manche", "Now and then, a rule changes for one round"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un paquet.", "Pick at least one pack."));
    const lg = SB.lang(), deck = deckFor(o.packs, lg), q = deck.pop();
    SB.u.saw(SEEN, q); ctx.setPriv({ deck });
    return { lg, phase: "vote", q, own: "", tw: "", ju: "", au: "", round: 1, rounds: o.rounds || 10, notes: {}, res: null, pts: {}, sum: {}, cnt: {}, zero: {}, ch: [], by: "" };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "write"){
      const au = s.au, i = ctx.input(au), w = i && typeof i.w === "string" ? clean(i.w, 90).replace(/^(c'est un\(?e?\)? 10 mais|mais)\s*…?\s*/i, "") : "";
      if(w) ctx.set({ phase: "vote", q: w, own: au });
      else if(!ctx.here(au)){ let deck = A(ctx.priv().deck); if(!deck.length) deck = deckFor(ctx.opts.packs, s.lg); const q = deck.pop(); ctx.setPriv({ deck }); ctx.set({ phase: "vote", q, own: "", tw: "" }); }
      return;
    }
    if(s.phase !== "vote") return;
    const notes = {};
    const ok = live.length && live.every(id => { const i = ctx.input(id); if(i && i.n != null && +i.n >= 0 && +i.n <= 10 && Math.round(+i.n) === +i.n){ notes[id] = +i.n; return true; } return false; });
    if(!ok) return;
    const ju = s.tw === "juge" && notes[s.ju] != null ? s.ju : "";
    const R = scoreRound(notes, ju, s.tw === "x2");
    const pts = Object.assign({}, s.pts || {}); Object.keys(R.pts).forEach(id => { pts[id] = (pts[id] || 0) + R.pts[id]; });
    if(R.gl.length) ctx.gage(R.gl, s.k);
    const patch = Object.assign({ phase: "res", notes, res: { avg: R.avg, target: R.target, pts: R.pts }, pts }, addTotals(s, notes));
    if(s.tw === "pick" && s.round < s.rounds){
      const lo = Math.min.apply(null, Object.keys(notes).map(id => notes[id]));
      let deck = A(ctx.priv().deck); if(deck.length < 3) deck = deckFor(ctx.opts.packs, s.lg).concat(deck);
      patch.ch = [deck.pop(), deck.pop(), deck.pop()]; patch.by = pick(Object.keys(notes).filter(id => notes[id] === lo)); ctx.setPriv({ deck });
    }
    ctx.set(patch);
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || "");
    const lab = CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T);
    if(s.phase === "write"){
      const mine = s.au === me;
      screen(root, "w" + s.k + mine, lab + (mine
        ? '<div class="card acc"><span class="eyebrow">' + esc(PREFIX(s.lg)) + '</span><textarea class="txt" id="dm-w" maxlength="90" rows="3" placeholder="' + tr("… ronfle comme un camion", "… snores like a truck") + '"></textarea></div><p class="sm">' + tr("Invente le défaut de cette manche. Les autres vont redonner une note.", "Make up this round's flaw. Everyone else will re-rate.") + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-w>' + tr("Envoyer", "Send") + "</button>")
        : '<div class="pass"><span class="eyebrow">' + tr("La plume", "The pen") + '</span><div class="who">' + esc(ctx.name(s.au)) + '</div><p class="wait">' + tr("invente le défaut de cette manche…", "is making up this round's flaw…") + "</p></div>"), r => {
        const b = r.querySelector("[data-w]"); if(!b) return;
        b.addEventListener("click", () => { const v = clean(r.querySelector("#dm-w").value, 90); if(v.length < 3){ SB.u.toast(tr("Écris un défaut", "Write a flaw")); return; } buzz(10); ctx.send({ w: v }); b.disabled = true; b.textContent = tr("Envoyé", "Sent"); });
      });
    } else if(s.phase === "vote"){
      const ju = s.tw === "juge" ? s.ju : "";
      const hint = ju ? (ju === me ? tr("Tu es le juge : ta note est la seule qui compte. Les autres doivent la deviner.", "You're the judge: your rating is the only one that counts. Everyone else has to guess it.") : tr("Devine la note que va mettre " + esc(ctx.name(ju)) + ".", "Guess the rating " + esc(ctx.name(ju)) + " will give.")) : tr("Quelle note tu lui redonnes ?", "What's the new rating?");
      screen(root, "v" + s.k + s.q, lab + qCard(s.q, s.lg, s.own ? ctx.name(s.own) : "") + '<p class="howto" style="text-align:center">' + hint + "</p>" + notesHTML(-1) +
        SB.u.dock('<button class="btn acc" type="button" data-ok disabled>' + tr("Valider ma note", "Lock in my rating") + '</button><p class="wait" data-wait></p>'), r => {
        let v = -1; const ok = r.querySelector("[data-ok]");
        r.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { v = +b.dataset.n; buzz(6); r.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === v)); ok.disabled = false; }));
        ok.addEventListener("click", () => { if(v < 0) return; buzz(12); ctx.send({ n: v }); ok.disabled = true; ok.textContent = tr("Note envoyée", "Rating sent"); r.querySelectorAll("[data-n]").forEach(x => { x.disabled = true; }); });
      });
      const live = ctx.ids.filter(id => ctx.here(id)), done = live.filter(id => { const i = ctx.input(id); return i && i.n != null; }).length;
      txt(root, "[data-wait]", done + " / " + live.length + tr(" notes", " ratings"));
    } else if(s.phase === "res"){
      const R = s.res || { avg: 0, target: 0, pts: {} }, notes = s.notes || {}, ju = s.tw === "juge" && notes[s.ju] != null ? s.ju : "";
      const ch = A(s.ch), by = s.by || "", chosen = by ? ctx.input(by) : null, pk = chosen && chosen.pk != null ? +chosen.pk : -1;
      let extra = "";
      if(s.tw === "x2") extra += '<p class="sm" style="text-align:center">' + tr("Manche en or : points doublés.", "Golden round: double points.") + "</p>";
      if(ch.length) extra += '<div class="field"><span class="eyebrow">' + (by === me ? tr("Tu as été le plus sévère : choisis la prochaine phrase", "You were the harshest: pick the next line") : tr(esc(ctx.name(by)) + " (le plus sévère) choisit la prochaine phrase", esc(ctx.name(by)) + " (the harshest) picks the next line")) + '</span><div class="choices">' +
        ch.map((x, i) => '<button type="button" class="opt" data-pk="' + i + '" aria-pressed="' + (pk === i) + '"' + (by === me ? "" : " disabled") + ">… " + esc(x) + "</button>").join("") + "</div></div>";
      screen(root, "r" + s.k + ctx.isHost + pk, lab + qCard(s.q, s.lg, s.own ? ctx.name(s.own) : "") + resHTML(R, ctx.ids, ctx.name, notes, ju, s.tw === "cache") + extra +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le classement", "See the standings") : tr("Manche suivante", "Next round")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        r.querySelectorAll("[data-pk]").forEach(b => b.addEventListener("click", () => ctx.send({ pk: +b.dataset.pk })));
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "res") return;
          if(st.round >= st.rounds){ c.set({ phase: "end" }); return; }
          let deck = A(c.priv().deck), q; const cs = A(st.ch);
          if(cs.length){ const sel = st.by ? c.input(st.by) : null, i = sel && sel.pk != null && cs[+sel.pk] ? +sel.pk : Math.floor(Math.random() * cs.length); q = cs[i]; deck = cs.filter((_, j) => j !== i).concat(deck); }
          else { if(!deck.length) deck = deckFor(c.opts.packs, st.lg); q = deck.pop(); }
          SB.u.saw(SEEN, q); c.setPriv({ deck });
          const live = c.ids.filter(id => c.here(id)), t = nextTw(c.opts.twists !== false, st.round + 1, st.tw, live.length);
          const base = { notes: {}, res: null, ch: [], by: "", own: "", ju: "", au: "", round: st.round + 1, k: c.rid() };
          if(t && t.id === "plume") c.set(Object.assign(base, { phase: "write", q: "", tw: "plume", au: pick(live) }));
          else c.set(Object.assign(base, { phase: "vote", q, tw: t ? t.id : "", ju: t && t.id === "juge" ? pick(live) : "" }));
        }));
      });
    } else if(s.phase === "end"){
      const p = s.pts || {}, order = ctx.ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0)), top = order[0], aw = awards(ctx.ids, s, ctx.name);
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Dans la tête du groupe", "Reads the group's mind") + '</span><div class="who">' + esc(ctx.name(top)) + "</div>" +
        '<div class="dm-list">' + order.map((id, i) => '<div class="dm-row"><b>' + (i + 1) + ". " + esc(ctx.name(id)) + '</b><span class="n">' + (p[id] || 0) + "</span></div>").join("") + "</div>" +
        (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.ids.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0, w = mx ? o2.filter(id => (pp[id] || 0) === mx) : [];
          c.end({ title: tr("C'est un 10 mais… : ", "They're a 10 but…: ") + (w.length ? w.map(c.name).join(" & ") : tr("égalité", "tie")),
            lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0) + " pts").concat(awards(c.ids, c.s, c.name).map(a => a[0] + tr(" : ", ": ") + a[1])), win: w });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ----------
     « Chacun son tour » : on se passe le téléphone, chacun note en secret, points et gages comme en réseau.
     « Avec les doigts » : on lit la phrase, 3, 2, 1, tout le monde montre sa note avec ses doigts. */
  local: {
    players: { min: 2, max: 12 },
    start(root, api){
      const names = api.names, ids = names.map((_, i) => String(i)), nameOf = id => names[+id] || "?";
      let sel = A(store().dmPacks).length ? A(store().dmPacks).slice() : ["cl", "love"], twOn = store().dmTw !== false, mode = store().dmMode === "doigts" ? "doigts" : "tour", rounds = [6, 10, 15].indexOf(store().dmRounds) >= 0 ? store().dmRounds : 10;
      const E = { deck: [], q: "", round: 0, tw: null, ju: "", au: "", notes: {}, pts: {}, sum: {}, cnt: {}, zero: {}, gno: 0, tok: Math.random().toString(36).slice(2, 7) };
      function setup(){
        screen(root, "su" + sel.join() + twOn + mode + rounds, CSS +
          '<div class="field"><span class="eyebrow">' + tr("Comment on joue", "How to play") + '</span><div class="seg">' + [["tour", tr("Chacun son tour", "Take turns")], ["doigts", tr("Avec les doigts", "With fingers")]].map(x => '<button type="button" data-m="' + x[0] + '" aria-pressed="' + (mode === x[0]) + '">' + x[1] + "</button>").join("") + "</div>" +
          '<p class="sm" style="margin:0">' + (mode === "tour" ? tr("On se passe le téléphone, chacun note en secret. Points, classement et gages.", "Pass the phone, everyone rates in secret. Points, standings and forfeits.") : tr("Lisez la phrase, comptez jusqu'à 3 et montrez votre note avec vos doigts. Rapide, sans points.", "Read the line, count to 3 and show your rating with your fingers. Quick, no points.")) + "</p></div>" +
          (mode === "tour" ? '<div class="field"><span class="eyebrow">' + tr("Manches", "Rounds") + '</span><div class="seg">' + [6, 10, 15].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (rounds === n) + '">' + n + "</button>").join("") + "</div></div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Paquets", "Packs") + "</span>" + packButtons(sel) + "</div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change pour une manche", "Now and then, a rule changes for one round") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
          r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ dmMode: mode }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ dmRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ dmPacks: sel }); setup(); }));
          r.querySelector("[data-tw]").addEventListener("click", () => { twOn = !twOn; persist({ dmTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un paquet", "Pick at least one pack")); return; }
            E.deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); E.round = 0; E.tw = null; E.pts = {}; E.sum = {}; E.cnt = {}; E.zero = {}; E.gno++;
            next();
          });
        });
      }
      const draw1 = () => { if(!E.deck.length) E.deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); const q = E.deck.pop(); SB.u.saw(SEEN, q); return q; };
      function next(){
        E.round++; E.notes = {}; E.ju = ""; E.au = "";
        E.tw = twOn && E.round > 1 ? SB.u.twist(mode === "tour" ? TWL : TWL.filter(t => t.id === "juge" || t.id === "plume"), { last: E.tw ? E.tw.id : "", n: ids.length, rate: .35 }) : null;
        const t = E.tw ? E.tw.id : "";
        if(t === "juge") E.ju = pick(ids);
        if(t === "plume") E.au = pick(ids);
        E.q = t === "plume" ? "" : draw1();
        if(mode === "doigts") fingers(); else if(t === "plume") plume(); else turn(0);
      }
      const lab = () => CSS + '<span class="eyebrow">' + tr("Manche ", "Round ") + E.round + (mode === "tour" ? " / " + rounds : "") + "</span>" + SB.u.twistHTML(E.tw);
      const quit = '<button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>";
      function fingers(){
        const t = E.tw ? E.tw.id : "";
        const top = t === "plume" ? '<div class="pass"><span class="eyebrow">' + tr("La plume", "The pen") + '</span><div class="who">' + esc(nameOf(E.au)) + '</div><p class="howto">' + tr("invente un défaut à voix haute : « C'est un(e) 10 mais… »", "makes up a flaw out loud: “They're a 10 but…”") + "</p></div>" : qCard(E.q, SB.lang(), "");
        const how = t === "juge" ? tr(esc(nameOf(E.ju)) + " est le juge : 3, 2, 1… tout le monde montre la note que le juge va mettre, et le juge montre la sienne !", esc(nameOf(E.ju)) + " is the judge: 3, 2, 1… everyone shows the rating they think the judge will give, and the judge shows theirs!") : tr("3, 2, 1… montrez votre note avec vos doigts !", "3, 2, 1… show your rating with your fingers!");
        screen(root, "f" + E.round, lab() + top + '<div class="pass" style="min-height:14vh"><div class="who" style="font-size:28px">' + how + "</div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + tr("Phrase suivante", "Next line") + "</button>" + quit), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { buzz(8); next(); });
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      function plume(){
        screen(root, "pl" + E.round, lab() + '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(nameOf(E.au)) + "</div></div>" +
          '<div class="card acc"><span class="eyebrow">' + esc(PREFIX(SB.lang())) + '</span><textarea class="txt" id="dm-w" maxlength="90" rows="3" placeholder="' + tr("… ronfle comme un camion", "… snores like a truck") + '"></textarea></div>' +
          SB.u.dock('<button class="btn acc" type="button" data-w>' + tr("Valider le défaut", "Lock in the flaw") + "</button>"), r => {
          r.querySelector("[data-w]").addEventListener("click", () => { const v = clean(r.querySelector("#dm-w").value, 90); if(v.length < 3){ SB.u.toast(tr("Écris un défaut", "Write a flaw")); return; } E.q = v; buzz(10); turn(0); });
        });
      }
      // Chacun son tour : écran « passe le téléphone », puis la note en secret.
      function turn(i){
        if(i >= ids.length){ reveal(); return; }
        const id = ids[i], t = E.tw ? E.tw.id : "";
        screen(root, "p" + E.round + ":" + i, lab() + '<div class="pass"><span class="eyebrow">' + tr("Passe le téléphone à", "Pass the phone to") + '</span><div class="who">' + esc(nameOf(id)) + "</div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-me>' + tr("C'est moi", "It's me") + "</button>"), r => r.querySelector("[data-me]").addEventListener("click", () => {
          const hint = t === "juge" ? (E.ju === id ? tr("Tu es le juge : ta note est la seule qui compte.", "You're the judge: your rating is the only one that counts.") : tr("Devine la note que va mettre " + esc(nameOf(E.ju)) + ".", "Guess the rating " + esc(nameOf(E.ju)) + " will give.")) : tr("Quelle note tu lui redonnes ?", "What's the new rating?");
          screen(root, "n" + E.round + ":" + i, lab() + qCard(E.q, SB.lang(), t === "plume" ? nameOf(E.au) : "") + '<p class="howto" style="text-align:center">' + hint + "</p>" + notesHTML(-1) +
            SB.u.dock('<button class="btn acc" type="button" data-ok disabled>' + tr("Valider ma note", "Lock in my rating") + "</button>"), r2 => {
            let v = -1; const ok = r2.querySelector("[data-ok]");
            r2.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { v = +b.dataset.n; buzz(6); r2.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", +x.dataset.n === v)); ok.disabled = false; }));
            ok.addEventListener("click", () => { if(v < 0) return; buzz(12); E.notes[id] = v; turn(i + 1); });
          });
        }));
      }
      function reveal(){
        const t = E.tw ? E.tw.id : "", R = scoreRound(E.notes, t === "juge" ? E.ju : "", t === "x2");
        Object.keys(R.pts).forEach(id => { E.pts[id] = (E.pts[id] || 0) + R.pts[id]; });
        const tt = addTotals(E, E.notes); E.sum = tt.sum; E.cnt = tt.cnt; E.zero = tt.zero;
        if(R.gl.length && api.gage) api.gage(R.gl.map(x => ({ id: nameOf(x.id), ev: x.ev })), "dm" + E.tok + "-" + E.gno + ":" + E.round);
        const last = E.round >= rounds;
        screen(root, "res" + E.round, lab() + qCard(E.q, SB.lang(), t === "plume" ? nameOf(E.au) : "") + resHTML(R, ids, nameOf, E.notes, t === "juge" ? E.ju : "", t === "cache") +
          (t === "x2" ? '<p class="sm" style="text-align:center">' + tr("Manche en or : points doublés.", "Golden round: double points.") + "</p>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (last ? tr("Voir le classement", "See the standings") : tr("Manche suivante", "Next round")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { if(last) end(); else next(); });
        });
      }
      function end(){
        const p = E.pts, order = ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0)), mx = p[order[0]] || 0, aw = awards(ids, E, nameOf);
        // Classement et gages de fin : après la feuille des gages de la manche, sinon elle serait remplacée.
        if(api.win){ let tries = 0; const win = () => { if(document.getElementById("gage-sheet") && tries++ < 1200) setTimeout(win, 500); else api.win(mx ? order.filter(id => (p[id] || 0) === mx).map(nameOf) : []); }; win(); }
        screen(root, "end" + E.gno, CSS + '<span class="eyebrow">' + tr("Dans la tête du groupe", "Reads the group's mind") + '</span><div class="who">' + esc(nameOf(order[0])) + "</div>" +
          '<div class="dm-list">' + order.map((id, i) => '<div class="dm-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="n">' + (p[id] || 0) + "</span></div>").join("") + "</div>" +
          (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
})();
