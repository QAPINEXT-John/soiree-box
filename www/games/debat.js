/* Débats — un sujet, deux orateurs (pour / contre), un chrono, et le public vote.
   Mode libre : tout le monde débat, on compare les avis avant et après. Aucun gage dans ce jeu. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, pick, tr, buzz } = SB.u;

/* ---------- Les sujets ---------- */
const S = s => s.split("|");
const FR = {
  leger: S("L'ananas a sa place sur la pizza|Le petit-déjeuner est le repas le plus important de la journée|On dit « chocolatine », pas « pain au chocolat »|Il vaut mieux être en avance qu'en retard|Le livre est toujours mieux que le film|Les vacances à la mer, c'est mieux qu'à la montagne|Il faut répondre aux messages dans l'heure|Dormir avec des chaussettes, c'est normal|La pâte à tartiner se mange à la cuillère|Les comédies musicales sont insupportables|Manger des céréales le soir, c'est un vrai repas|Noël en famille, c'est surcoté|Les vocaux, c'est mieux que les messages écrits|Le karaoké est la meilleure façon de finir une soirée|La sieste devrait être obligatoire au travail|Les sports d'hiver ne valent pas leur prix|Spoiler une série devrait être puni|On devrait pouvoir manger le dessert avant le plat|Il vaut mieux être drôle que beau|Il faut toujours finir son assiette|Le café, c'est meilleur que le thé|Le meilleur moment d'un voyage, c'est de le préparer|Les jeux de société révèlent la vraie personnalité des gens|Faire la queue pour un resto à la mode, c'est ridicule|Les selfies devraient être interdits dans les musées|Porter des sandales en ville, c'est acceptable|Un bon film à la maison vaut mieux qu'une séance de cinéma|La dernière part de pizza revient à celui qui l'a commandée|Les emojis rendent les conversations meilleures|L'été est la pire saison|Le ketchup va avec tout|La téléréalité est un plaisir coupable à assumer|Les films d'horreur, c'est mieux à plusieurs|Partir en vacances sans téléphone, c'est le vrai luxe|Mieux vaut un petit appart en ville qu'une grande maison à la campagne|Les gens qui se lèvent tôt sont plus heureux|On peut rire de soi-même sur les réseaux sans regret|Il vaut mieux un ami honnête qu'un ami gentil|Les réunions de famille devraient durer deux heures maximum|Le fromage est le meilleur aliment du monde"),
  societe: S("Le télétravail devrait devenir la norme|La semaine de quatre jours devrait être généralisée|Les réseaux sociaux devraient être interdits avant 15 ans|L'uniforme à l'école est une bonne idée|Les zoos devraient fermer|Il faudrait manger beaucoup moins de viande|L'intelligence artificielle va détruire plus d'emplois qu'elle n'en créera|Les influenceurs ont trop de pouvoir|Les transports en commun devraient être gratuits|Les voitures devraient être interdites en centre-ville|Le vote devrait être obligatoire|Les devoirs à la maison devraient être supprimés|Les jeux vidéo rendent violent|Les étudiants devraient être payés pour étudier|Un service civique devrait être obligatoire pour tous|La publicité devrait être interdite dans la rue|Tout le monde devrait apprendre à coder à l'école|Le smartphone nous rend plus seuls|La téléréalité abîme la société|Les célébrités devraient s'engager publiquement|Il faudrait limiter le nombre de vols en avion par personne|Les notes à l'école devraient disparaître|Les footballeurs sont trop payés|L'anonymat sur Internet devrait être interdit|Le permis de conduire devrait être repassé tous les dix ans|Les animaux de compagnie devraient avoir des droits|La mode jetable devrait être interdite|Tout le monde devrait faire un an de bénévolat|Les écrans devraient être interdits aux moins de 3 ans|Le tutoiement au travail est une bonne chose|Les livraisons à domicile tuent les commerces de quartier|Les robots devraient payer des impôts|Le bac ne sert plus à rien|On devrait pouvoir voter dès 16 ans|Les plateformes de streaming tuent le cinéma"),
  philo: S("Le bonheur est un choix|L'argent fait le bonheur|Mentir est parfois la bonne chose à faire|La liberté totale est dangereuse|L'être humain est naturellement bon|Il vaut mieux connaître la vérité, même si elle fait mal|Le destin existe|Le libre arbitre est une illusion|Une machine pourra un jour avoir une conscience|Il faut obéir à la loi, même quand elle est injuste|On est le produit de son éducation|Le travail est indispensable pour être épanoui|L'art doit être beau|La beauté est subjective|On ne peut pas être ami avec quelqu'un qui ne partage pas nos valeurs|Mieux vaut une vie courte et intense qu'une vie longue et calme|Le progrès technique rend les gens plus heureux|Vivre éternellement serait une bonne chose|La vérité absolue existe|On peut tout pardonner|L'amitié est plus importante que l'amour|Savoir trop de choses rend malheureux|Coloniser Mars est une priorité pour l'humanité|Il existe de la vie intelligente ailleurs dans l'univers|Nous vivons peut-être dans une simulation|Les animaux ont une conscience comparable à la nôtre|Le hasard n'existe pas|L'intelligence compte plus que la gentillesse|L'école apprend à penser|On peut rire de tout|L'ennui est nécessaire|La politesse est une forme d'hypocrisie|Une vie sans regrets est une vie où l'on n'a rien osé|Il faut juger les gens sur leurs actes, pas sur leurs intentions|La nature humaine ne change jamais"),
  love: S("Le coup de foudre existe|On peut rester ami avec son ex|Dans un couple, il faut tout se dire|Regarder le téléphone de son partenaire, c'est parfois justifié|Il faut vivre ensemble avant de se marier|Le mariage est dépassé|L'âme sœur existe|Les applis de rencontre ont tué la romance|La jalousie est une preuve d'amour|Celui qui invite paie au premier rendez-vous|On peut aimer deux personnes en même temps|Un couple doit garder des comptes bancaires séparés|Il faut attendre avant de répondre à un crush|Les filles devraient faire le premier pas plus souvent|Une relation à distance peut marcher|Les couples qui se disputent sont les plus solides|Liker les photos d'une autre personne, c'est déjà tromper|Partir en vacances en couple, c'est le vrai test|On peut tomber amoureux de son meilleur ami sans tout gâcher|On peut être heureux en couple sans jamais avoir d'enfants|Le romantisme est mort|Il faut avoir le même humour pour être en couple|Faire chambre à part, c'est bon pour le couple|Un couple peut survivre à une tromperie|Sortir avec un collègue est une mauvaise idée|L'amour dure trois ans|Il faut connaître les mots de passe de son partenaire|On peut sortir avec l'ex d'un ami|Dire « je t'aime » en premier, c'est prendre un risque inutile|Les surnoms mignons sont indispensables dans un couple"),
  hot: S("Coucher le premier soir, c'est une bonne idée|Regarder du porno en couple, c'est sain|La taille compte|Un plan à trois peut renforcer un couple|Avoir un sex friend, c'est mieux qu'être en couple|On peut être fidèle toute sa vie|Simuler, c'est parfois rendre service|Il faut dire son nombre de partenaires à son crush|Les sextos font partie d'une relation normale|Attendre le mariage pour coucher est une bonne idée|Un sex toy est un cadeau comme un autre|Le couple libre, c'est l'avenir|Le sexe le matin est meilleur que le soir|Le sexe sans sentiments, ça n'existe pas vraiment|Recoucher avec un ex, ça ne compte pas|Envoyer des nudes à son partenaire, c'est normal|Les préliminaires comptent plus que l'acte|Au lit, il faut tout essayer au moins une fois|Il faut raconter ses fantasmes à son partenaire|Le nombre de rapports dit tout de la santé d'un couple|Les clubs libertins devraient être mieux acceptés|On peut tomber amoureux d'un coup d'un soir|Le dirty talk, c'est gênant|Un couple peut tenir sans sexe|L'expérience compte plus que l'alchimie au lit|Le premier baiser décide de tout|Il faudrait faire un « essai » au lit avant de s'engager|Les applis de rencontre, c'est surtout pour le sexe|Raconter ses nuits à ses potes, c'est trahir son partenaire|Regarder du porno quand on est en couple, c'est tromper"),
  kid: S("Les devoirs devraient être interdits|Les chats sont mieux que les chiens|Il devrait y avoir un dessert à chaque repas|Les vacances d'été devraient durer six mois|Il vaut mieux être un super-héros qu'un sorcier|Les dinosaures sont les animaux les plus cool de tous les temps|L'école devrait commencer à 10 h|Les légumes, en fait, c'est bon|On devrait avoir le droit d'amener son animal à l'école|La pizza, c'est mieux que les frites|On devrait pouvoir choisir l'heure du coucher|Les jeux vidéo sont mieux que les jeux de société|La neige, c'est mieux que la plage|Il vaut mieux savoir voler que devenir invisible|Les dessins animés ne sont pas que pour les petits|Il faudrait une récré de deux heures|Le chocolat blanc, ce n'est pas du vrai chocolat|Avoir des frères et sœurs, ça apporte plus de bien que de mal|Il faut toujours dire la vérité|Les licornes sont mieux que les dragons|On devrait avoir le droit de manger avec les doigts|Il vaut mieux vivre à la campagne qu'en ville|Les pirates sont plus forts que les chevaliers|La cantine devrait servir des frites tous les jours|Ranger sa chambre ne sert à rien|Les adultes s'amusent moins que les enfants|Les robots feront un jour nos devoirs à notre place|Il vaut mieux un chien qu'un poisson rouge|L'hiver est la meilleure saison|Les grands frères et grandes sœurs ont toujours raison")
};
const EN = {
  leger: S("Pineapple belongs on pizza|Cats are better than dogs|Being early is better than being late|The book is always better than the movie|Beach vacations beat mountain vacations|You should answer texts within the hour|Sleeping with socks on is normal|Chocolate spread is meant to be eaten with a spoon|Musicals are unbearable|Cereal counts as dinner|Christmas with family is overrated|Voice notes are better than texts|Karaoke is the best way to end a night out|Naps should be mandatory at work|Ski trips aren't worth the money|Spoiling a show should be punishable|You should be allowed to eat dessert first|Being funny beats being good-looking|You should always finish your plate|Coffee is better than tea|Planning a trip is the best part of the trip|Board games reveal people's true personality|Waiting in line for a trendy restaurant is ridiculous|Selfies should be banned in museums|Wearing sandals in the city is fine|A good movie at home beats a night at the cinema|The last slice belongs to whoever ordered the pizza|Emojis make conversations better|Summer is the worst season|Ketchup goes with everything|Reality TV is a guilty pleasure worth owning|Unicorns are cooler than dragons|A vacation without your phone is true luxury|A small city apartment beats a big house in the country|Early risers are happier|A brutally honest friend beats a nice one|Family gatherings should last two hours max|Cheese is the best food in the world"),
  societe: S("Remote work should become the norm|The four-day week should be everywhere|Social media should be banned under 15|School uniforms are a good idea|Zoos should close|We should eat a lot less meat|AI will destroy more jobs than it creates|Influencers have too much power|Public transportation should be free|Cars should be banned from city centers|Voting should be mandatory|Homework should be abolished|Video games make people violent|Students should be paid to study|Everyone should do a year of community service|Billboards should be banned|Everyone should learn to code at school|Smartphones make us lonelier|Reality TV is bad for society|Celebrities should speak out publicly|Flights per person should be limited|Grades at school should disappear|Soccer players are overpaid|Online anonymity should be banned|Drivers should retake their test every ten years|Pets should have rights|Fast fashion should be banned|Screens should be banned for kids under 3|Home delivery is killing local shops|Robots should pay taxes|The voting age should be 16|Streaming platforms are killing cinema"),
  philo: S("Happiness is a choice|Money buys happiness|Lying is sometimes the right thing to do|Total freedom is dangerous|Humans are naturally good|It's better to know the truth, even if it hurts|Destiny exists|Free will is an illusion|A machine will one day be conscious|You must obey the law, even when it's unjust|We are the product of our upbringing|Work is essential to a fulfilling life|Art should be beautiful|Beauty is subjective|You can't be friends with someone who doesn't share your values|A short, intense life beats a long, calm one|Technology makes people happier|Living forever would be a good thing|Absolute truth exists|Everything can be forgiven|Friendship matters more than love|Knowing too much makes you unhappy|Colonizing Mars should be a priority|There is intelligent life elsewhere in the universe|We might be living in a simulation|Animals have a consciousness like ours|Chance doesn't exist|Intelligence matters more than kindness|School teaches you how to think|You can joke about anything|Boredom is necessary|Politeness is a form of hypocrisy|Judge people by their actions, not their intentions|Human nature never changes"),
  love: S("Love at first sight exists|You can stay friends with your ex|Couples should tell each other everything|Checking your partner's phone is sometimes justified|You should live together before marriage|Marriage is outdated|Soulmates exist|Dating apps killed romance|Jealousy is proof of love|Whoever asks pays on the first date|You can love two people at once|Couples should keep separate bank accounts|Women should make the first move more often|Long-distance relationships can work|Couples who fight are the strongest|Liking someone else's photos is already cheating|Traveling together is the real test|You can fall for your best friend without ruining everything|You can be happy as a couple without ever having kids|Romance is dead|You need the same sense of humor to be together|Sleeping in separate beds is good for a couple|A couple can survive cheating|Dating a coworker is a bad idea|Love lasts three years|You should know your partner's passwords|You can date a friend's ex|Saying “I love you” first is a pointless risk"),
  hot: S("Sleeping together on the first date is a good idea|Watching porn as a couple is healthy|Size matters|A threesome can make a couple stronger|A friend with benefits beats a relationship|You can be faithful your whole life|Faking it is sometimes doing them a favor|You should tell your crush your body count|Sexting is part of a normal relationship|Waiting until marriage is a good idea|A sex toy is a gift like any other|Open relationships are the future|Morning sex beats evening sex|Sex without feelings doesn't really exist|Sleeping with an ex doesn't count|Sending nudes to your partner is normal|Foreplay matters more than the act|You should try everything in bed at least once|You should tell your partner your fantasies|How often a couple has sex says everything|Swingers' clubs should be more accepted|You can fall in love with a one-night stand|Dirty talk is cringe|A relationship can last without sex|Experience matters more than chemistry in bed|The first kiss decides everything|You should have a “trial run” in bed before committing|Dating apps are mostly for sex|Telling your friends about your nights betrays your partner|Watching porn while in a relationship is cheating"),
  kid: S("Homework should be banned|Cats are better than dogs|Every meal should come with dessert|Summer break should last six months|Being a superhero beats being a wizard|Dinosaurs are the coolest animals ever|School should start at 10 a.m.|Vegetables are actually good|We should be allowed to bring pets to school|Pizza is better than fries|Kids should pick their own bedtime|Video games are better than board games|Snow is better than the beach|Flying beats being invisible|Cartoons aren't just for little kids|Recess should last two hours|White chocolate isn't real chocolate|Having siblings is more good than bad|You should always tell the truth|Unicorns are better than dragons|We should be allowed to eat with our fingers|Living in the country beats living in the city|Pirates are stronger than knights|The cafeteria should serve fries every day|Cleaning your room is pointless|Grown-ups have less fun than kids|Robots will do our homework one day|A dog is better than a goldfish|Winter is the best season|Big brothers and sisters are always right")
};
const LISTS = { fr: FR, en: EN };
const LL = lg => LISTS[lg === "en" ? "en" : "fr"];
const PACKS = [
  { v: "leger", label: tr("Léger", "Light"), desc: tr("Pizza, chaussettes et grands débats du quotidien", "Pizza, socks and everyday great debates"), list: LL(SB.lang()).leger },
  { v: "societe", label: tr("Société", "Society"), desc: tr("École, travail, écrans, écologie…", "School, work, screens, environment…"), list: LL(SB.lang()).societe },
  { v: "philo", label: tr("Philo & sciences", "Philosophy & science"), desc: tr("Bonheur, liberté, vérité, univers", "Happiness, freedom, truth, the universe"), list: LL(SB.lang()).philo },
  { v: "love", label: tr("Love", "Love"), desc: tr("Couple, ex, jalousie, applis de rencontre", "Couples, exes, jealousy, dating apps"), list: LL(SB.lang()).love },
  { v: "hot", label: "Hot", desc: tr("Sexe, fidélité, fantasmes : ça va chauffer", "Sex, fidelity, fantasies: it's going to get heated"), list: LL(SB.lang()).hot, hot: true },
  { v: "kid", label: tr("Enfants", "Kids"), desc: tr("Devoirs, dinosaures et licornes. Tout public", "Homework, dinosaurs and unicorns. For everyone"), list: LL(SB.lang()).kid, kid: true }
];
const SEEN = "debat:q";
const kidF = l => { if(!(SB.kid && SB.kid())) return l; const k = l.filter(x => SB.kidOk(x)); return k.length ? k : l; };
function deckFor(packs, lg){
  const sel = A(packs), L = LL(lg); const pool = PACKS.filter(p => sel.indexOf(p.v) >= 0).flatMap(p => L[p.v]);
  return SB.u.fresh(SEEN, kidF(pool.length ? pool : L.leger));
}

/* ---------- Coups de théâtre ---------- */
const MOTS = { fr: ["genre", "en fait", "vraiment", "je pense", "franchement", "du coup", "voilà", "carrément", "grave", "c'est clair"], en: ["like", "actually", "really", "I think", "honestly", "basically", "literally", "totally", "you know", "so"] };
const TW = [
  { id: "express", name: tr("Débat express", "Speed debate"), desc: tr("Tous les temps de parole sont divisés par deux.", "Every speaking time is cut in half.") },
  { id: "diable", name: tr("Avocat du diable", "Devil's advocate"), desc: tr("Les orateurs défendent le contraire de ce qu'ils pensent vraiment.", "The speakers defend the opposite of what they really think."), ok: o => o.n >= 3 },
  { id: "mot", name: tr("Mot interdit", "Forbidden word"), desc: tr("Un mot est interdit aux orateurs. Le public peut huer chaque fois qu'il est prononcé !", "One word is off-limits for the speakers. The audience may boo every time!") },
  { id: "public", name: tr("Question du public", "Audience question"), desc: tr("Avant les répliques, quelqu'un du public pose une question à chaque orateur.", "Before the rebuttals, someone in the audience asks each speaker a question."), ok: o => o.n >= 3 }
];
const TWL = TW.filter(t => t.id !== "diable");
// Les temps de parole : ouverture pour, ouverture contre, réplique pour, réplique contre.
const STEPS = [["p", 60, "ouv"], ["c", 60, "ouv"], ["p", 30, "rep"], ["c", 30, "rep"]];
const dur = (i, tw) => STEPS[i][1] * (tw === "express" ? .5 : 1) * 1000;
const SIDE = x => (x === "p" ? tr("POUR", "FOR") : tr("CONTRE", "AGAINST"));
const CSS = '<style data-db>' +
  '.db-side{display:inline-block; font-weight:800; font-size:12px; letter-spacing:.08em; padding:3px 10px; border-radius:99px; color:#fff}.db-side.p{background:#2fa860}.db-side.c{background:#e8414e}' +
  '.db-duo{display:grid; grid-template-columns:1fr 1fr; gap:8px}.db-o{border-radius:16px; padding:12px; background:var(--card); border:2px solid var(--line); display:flex; flex-direction:column; gap:6px; align-items:flex-start}.db-o b{font-family:var(--f-disp); font-size:22px; line-height:1.1}.db-o.on{border-color:var(--acc); box-shadow:0 0 0 2px var(--acc)}' +
  '.db-t{font-family:var(--f-disp); font-size:76px; line-height:1; text-align:center; color:var(--acc)}.db-t.low{color:var(--bad)}' +
  '.db-sp{text-align:center; font-weight:800; font-size:18px; margin:0}.db-sp b{font-family:var(--f-disp); font-size:28px; display:block}' +
  '.db-ab{display:grid; grid-template-columns:1fr 1fr; gap:8px}.db-ab button{min-height:64px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-weight:800; font-size:17px}.db-ab button[aria-pressed="true"].p{background:#2fa860; border-color:#2fa860; color:#fff}.db-ab button[aria-pressed="true"].c{background:#e8414e; border-color:#e8414e; color:#fff}' +
  '.db-bar{display:flex; height:28px; border-radius:10px; overflow:hidden; font-weight:800; font-size:13px; color:#fff}.db-bar i{display:flex; align-items:center; justify-content:center; font-style:normal; min-width:0}.db-bar .p{background:#2fa860}.db-bar .c{background:#e8414e}' +
  '.db-steps{display:flex; gap:4px}.db-steps i{flex:1; height:6px; border-radius:99px; background:var(--soft)}.db-steps i.done{background:var(--acc)}.db-steps i.on{background:var(--ink)}' +
  '.db-row{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line)}.db-row b{flex:1}.db-row .n{font-family:var(--f-disp); font-weight:800; font-size:22px}.db-list{display:flex; flex-direction:column; gap:6px}</style>';
const qCard = q => '<div class="card acc"><span class="eyebrow">' + tr("Pour ou contre ?", "For or against?") + '</span><div class="big">' + esc(q) + "</div></div>";
const pct = (a, b) => (a + b ? Math.round(a / (a + b) * 100) : 50);
function barHTML(label, p, c){
  const x = pct(p, c);
  return '<div class="field"><span class="eyebrow">' + esc(label) + '</span><div class="db-bar"><i class="p" style="width:' + x + '%">' + (p ? tr("Pour ", "For ") + p : "") + '</i><i class="c" style="width:' + (100 - x) + '%">' + (c ? tr("Contre ", "Against ") + c : "") + "</i></div></div>";
}
const stepsHTML = st => '<div class="db-steps">' + STEPS.map((_, i) => '<i class="' + (i < st ? "done" : i === st ? "on" : "") + '"></i>').join("") + "</div>";
// Trophées de fin.
function awards(ids, s, nameOf){
  const out = [], dv = s.dv || {}, ch = s.ch || {}, nb = s.nb || {};
  const d = ids.filter(id => dv[id]).sort((a, b) => dv[b] - dv[a])[0];
  if(d) out.push([tr("Avocat du diable", "Devil's advocate"), nameOf(d), tr(dv[d] + " victoire" + (dv[d] > 1 ? "s" : "") + " en défendant le contraire de son avis", dv[d] + (dv[d] === 1 ? " win" : " wins") + " defending the opposite of their view")]);
  const g = ids.filter(id => ch[id]).sort((a, b) => ch[b] - ch[a])[0];
  if(g) out.push([tr("La girouette", "The weathervane"), nameOf(g), tr("A changé d'avis " + ch[g] + " fois", "Changed their mind " + ch[g] + (ch[g] === 1 ? " time" : " times"))]);
  const k = ids.filter(id => nb[id] >= 2 && !ch[id])[0];
  if(k) out.push([tr("Inflexible", "Unshakable"), nameOf(k), tr("N'a jamais changé d'avis", "Never changed their mind")]);
  return out;
}
const lead = (ids, p) => ids.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0));

SB.register({
  id: "debat", name: tr("Débats", "Debates"), glyph: "VS", pitch: tr("Un sujet, deux orateurs, un chrono. Le public tranche.", "One topic, two speakers, a clock. The audience decides."), hot: true,
  accent: { light: "#7a5cff", dark: "#a08cff" },
  tag: tr("Pour ou contre ? Deux joueurs débattent chrono en main, le public vote pour le plus convaincant. Sujets légers, de société, philo, love ou hot.", "For or against? Two players debate against the clock, the audience votes for the most convincing. Light, society, philosophy, love or hot topics."),
  min: 2, max: 20, ticks: true, gagesEnd: false,
  rules: tr([
    "Un sujet s'affiche : pour ou contre ? Chacun donne d'abord son avis en secret.",
    "Deux orateurs sont désignés : l'un plaide POUR, l'autre CONTRE, peu importe ce qu'ils pensent.",
    "Chrono : 1 minute d'ouverture chacun, puis 30 secondes de réplique chacun. On peut finir plus tôt.",
    "Le public vote pour l'orateur le plus convaincant, et redonne son avis : on voit qui a changé d'avis.",
    "Le gagnant marque 2 points, +1 s'il a défendu le contraire de ce qu'il pensait. En cas d'égalité, chaque orateur marque 1 point.",
    "Mode libre : pas d'orateurs, tout le monde débat ensemble, et on compare les avis avant et après.",
    "Coups de théâtre : débat express, avocat du diable, mot interdit, question du public. Pas de gages dans ce jeu."
  ], [
    "A topic appears: for or against? Everyone first gives their opinion in secret.",
    "Two speakers are picked: one argues FOR, the other AGAINST, whatever they really think.",
    "Clock: 1 minute of opening each, then 30 seconds of rebuttal each. You can finish early.",
    "The audience votes for the most convincing speaker, and gives their opinion again: see who changed their mind.",
    "The winner scores 2 points, +1 if they argued against what they really thought.",
    "Free mode: no speakers, everyone debates together, and you compare opinions before and after.",
    "Twists: speed debate, devil's advocate, forbidden word, audience question. No forfeits in this game."
  ]),
  options: [
    { id: "mode", label: tr("Mode", "Mode"), type: "seg", def: "duel", values: [{ v: "duel", label: tr("Duel (3+)", "Duel (3+)") }, { v: "libre", label: tr("Libre", "Free") }] },
    { id: "rounds", label: tr("Sujets", "Topics"), type: "seg", def: 6, values: [{ v: 4, label: "4" }, { v: 6, label: "6" }, { v: 10, label: "10" }] },
    { id: "packs", label: tr("Catégories", "Categories"), type: "multi", def: ["leger", "societe", "philo"], values: PACKS.map(p => ({ v: p.v, label: p.label, desc: p.desc, hot: p.hot, kid: p.kid, count: p.list.length })) },
    { id: "twists", label: tr("Coups de théâtre", "Plot twists"), type: "toggle", text: tr("Coups de théâtre", "Plot twists"), desc: tr("De temps en temps, une règle change pour un débat", "Now and then, a rule changes for one debate"), def: true }
  ],
  start(ctx, o){
    const libre = o.mode === "libre";
    if(!libre && ctx.ids.length < 3) throw new Error(tr("En duel, il faut au moins 3 joueurs (2 orateurs et du public). À 2, prends le mode Libre.", "Duel needs at least 3 players (2 speakers plus an audience). With 2, pick Free mode."));
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins une catégorie.", "Pick at least one category."));
    const lg = SB.lang(), deck = deckFor(o.packs, lg), q = deck.pop(); SB.u.saw(SEEN, q); ctx.setPriv({ deck });
    return { lg, mode: libre ? "libre" : "duel", phase: "avant", q, round: 1, rounds: o.rounds || 6, tw: "", mot: "", qa: "", deb: null, st: 0, endAt: 0, op: {}, res: null, pts: {}, nd: {}, dv: {}, ch: {}, nb: {} };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id));
    if(s.phase === "avant"){
      const op = {};
      if(!live.length || !live.every(id => { const i = ctx.input(id); if(i && (i.o === "p" || i.o === "c")){ op[id] = i.o; return true; } return false; })) return;
      if(s.mode === "libre"){ ctx.set({ phase: "libre", op, k: ctx.rid(), endAt: ctx.now() + 180000 }); return; }
      // Les orateurs : ceux qui ont le moins débattu. Avocat du diable : chacun défend le contraire de son avis.
      const nd = s.nd || {}, order = shuffle(live).sort((a, b) => (nd[a] || 0) - (nd[b] || 0));
      let p = "", c = "";
      if(s.tw === "diable"){ c = order.find(id => op[id] === "p") || ""; p = order.find(id => op[id] === "c" && id !== c) || ""; }
      if(!p || !c){ const two = order.slice(0, 2); if(Math.random() < .5) two.reverse(); p = two[0]; c = two[1]; }
      const nd2 = Object.assign({}, nd); nd2[p] = (nd2[p] || 0) + 1; nd2[c] = (nd2[c] || 0) + 1;
      const aud = live.filter(id => id !== p && id !== c);
      ctx.set({ phase: "debat", op, deb: { p, c }, st: 0, endAt: ctx.now() + dur(0, s.tw), nd: nd2, qa: s.tw === "public" && aud.length ? pick(aud) : "", k: ctx.rid() });
      return;
    }
    if(s.phase === "debat"){
      const sp = s.deb[STEPS[s.st][0]], i = ctx.input(sp), early = i && +i.done === s.st;
      if(early || ctx.now() >= s.endAt || !ctx.here(sp)) nextStep(ctx);
      return;
    }
    if(s.phase === "libre"){ return; }
    if(s.phase === "vote" || s.phase === "apres"){
      const deb = s.deb ? [s.deb.p, s.deb.c] : [], wv = {}, op2 = {};
      const ok = live.length && live.every(id => {
        const i = ctx.input(id); if(!i || (i.o !== "p" && i.o !== "c")) return false;
        if(s.phase === "vote" && deb.indexOf(id) < 0 && i.w !== "p" && i.w !== "c") return false;
        op2[id] = i.o; if(s.phase === "vote" && deb.indexOf(id) < 0) wv[id] = i.w; return true;
      });
      if(!ok) return;
      const op = s.op || {}, ch = Object.assign({}, s.ch || {}), nb = Object.assign({}, s.nb || {}), moved = [];
      Object.keys(op2).forEach(id => { if(op[id]){ nb[id] = (nb[id] || 0) + 1; if(op[id] !== op2[id]){ ch[id] = (ch[id] || 0) + 1; moved.push(id); } } });
      const res = { wp: 0, wc: 0, op2, moved, win: "" }; const pts = Object.assign({}, s.pts || {}), dv = Object.assign({}, s.dv || {});
      if(s.phase === "vote"){
        Object.keys(wv).forEach(id => { if(wv[id] === "p") res.wp++; else res.wc++; });
        res.win = res.wp > res.wc ? "p" : res.wc > res.wp ? "c" : "=";
        if(res.win === "="){ deb.forEach(id => { pts[id] = (pts[id] || 0) + 1; }); }
        else { const w = s.deb[res.win]; pts[w] = (pts[w] || 0) + 2; if(op[w] && op[w] !== res.win){ pts[w]++; dv[w] = (dv[w] || 0) + 1; res.dv = w; } }
      }
      ctx.set({ phase: "res", res, pts, dv, ch, nb });
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, T = SB.u.byTwist(TW, s.tw || ""), mine = ctx.mine() || {};
    const lab = CSS + '<span class="eyebrow">' + tr("Sujet ", "Topic ") + s.round + " / " + s.rounds + "</span>" + SB.u.twistHTML(T) + (s.tw === "mot" && s.mot ? '<p class="note-box">' + tr("Mot interdit : « " + esc(s.mot) + " »", "Forbidden word: “" + esc(s.mot) + "”") + "</p>" : "");
    const live = ctx.ids.filter(id => ctx.here(id));
    const debs = s.deb ? '<div class="db-duo">' + ["p", "c"].map(x => '<div class="db-o' + (s.phase === "debat" && STEPS[s.st][0] === x ? " on" : "") + '"><span class="db-side ' + x + '">' + SIDE(x) + "</span><b>" + esc(ctx.name(s.deb[x])) + (s.deb[x] === me ? " (" + tr("toi", "you") + ")" : "") + "</b></div>").join("") + "</div>" : "";
    const opBtns = (sel, key) => '<div class="db-ab"><button type="button" class="p" data-' + key + '="p" aria-pressed="' + (sel === "p") + '">' + tr("Pour", "For") + '</button><button type="button" class="c" data-' + key + '="c" aria-pressed="' + (sel === "c") + '">' + tr("Contre", "Against") + "</button></div>";
    if(s.phase === "avant" || s.phase === "apres"){
      const after = s.phase === "apres";
      screen(root, "op" + s.k + (mine.o || ""), lab + qCard(s.q) + '<p class="howto" style="text-align:center">' + (after ? tr("Et maintenant, tu en penses quoi ?", "So, what do you think now?") : tr("Ton avis, en secret : personne ne le verra.", "Your opinion, in secret: nobody will see it.")) + "</p>" + opBtns(mine.o, "o") +
        SB.u.dock('<p class="wait" data-wait></p>'), r => r.querySelectorAll("[data-o]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ o: b.dataset.o }); })));
      txt(root, "[data-wait]", live.filter(id => { const i = ctx.input(id); return i && i.o; }).length + " / " + live.length + tr(" avis", " opinions"));
    } else if(s.phase === "debat"){
      const x = STEPS[s.st][0], sp = s.deb[x], meSp = sp === me, sec = Math.max(0, Math.ceil((s.endAt - ctx.now()) / 1000));
      const qa = s.qa && s.st === 2 ? '<p class="note-box">' + tr(esc(ctx.name(s.qa)) + " pose d'abord une question à chaque orateur.", esc(ctx.name(s.qa)) + " first asks each speaker a question.") + "</p>" : "";
      screen(root, "db" + s.k + s.st + meSp, lab + qCard(s.q) + debs + stepsHTML(s.st) + qa +
        '<p class="db-sp">' + (meSp ? tr("À toi ! Défends :", "Your turn! Argue:") : (STEPS[s.st][2] === "ouv" ? tr("Ouverture", "Opening") : tr("Réplique", "Rebuttal")) + " · " + esc(ctx.name(sp))) + ' <span class="db-side ' + x + '">' + SIDE(x) + '</span></p><div class="db-t" data-t>' + sec + "</div>" +
        SB.u.dock(meSp ? '<button class="btn acc" type="button" data-done>' + tr("J'ai fini", "I'm done") + "</button>" : ctx.isHost ? '<button class="btn ghost" type="button" data-skip>' + tr("Passer à la suite", "Move on") + "</button>" : '<p class="wait">' + tr("On écoute…", "Listening…") + "</p>"), r => {
        const d = r.querySelector("[data-done]"); if(d) d.addEventListener("click", () => { buzz(12); ctx.send({ done: s.st }); d.disabled = true; });
        const k = r.querySelector("[data-skip]"); if(k) k.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "debat" && c.s.st === s.st) nextStep(c); }));
      });
      const el = root.querySelector("[data-t]"); if(el){ el.textContent = sec; el.classList.toggle("low", sec <= 10); }
    } else if(s.phase === "libre"){
      const sec = Math.max(0, Math.ceil((s.endAt - ctx.now()) / 1000));
      screen(root, "lb" + s.k + ctx.isHost, lab + qCard(s.q) + '<p class="db-sp">' + tr("Débattez tous ensemble !", "Everyone, debate!") + '</p><div class="db-t" data-t></div>' +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-fin>' + tr("Fin du débat", "End the debate") + "</button>" : '<p class="wait">' + tr("L'hôte arrête le débat quand vous avez fini.", "The host ends the debate when you're done.") + "</p>"), r => {
        const f = r.querySelector("[data-fin]"); if(f) f.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "libre") c.set({ phase: "apres", k: c.rid() }); }));
      });
      const el = root.querySelector("[data-t]"); if(el){ el.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); el.classList.toggle("low", sec <= 15); }
    } else if(s.phase === "vote"){
      const isDeb = s.deb && (s.deb.p === me || s.deb.c === me);
      screen(root, "vt" + s.k + (mine.o || "") + (mine.w || "") + isDeb, lab + qCard(s.q) + debs +
        (isDeb ? "" : '<span class="eyebrow">' + tr("Le plus convaincant", "Most convincing") + '</span><div class="db-ab">' + ["p", "c"].map(x => '<button type="button" class="' + x + '" data-w="' + x + '" aria-pressed="' + (mine.w === x) + '">' + esc(ctx.name(s.deb[x])) + "</button>").join("") + "</div>") +
        '<span class="eyebrow">' + tr("Ton avis maintenant", "Your opinion now") + "</span>" + opBtns(mine.o, "o") + SB.u.dock('<p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-o]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ o: b.dataset.o }); }));
        r.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ w: b.dataset.w }); }));
      });
      const deb = [s.deb.p, s.deb.c];
      txt(root, "[data-wait]", live.filter(id => { const i = ctx.input(id); return i && i.o && (deb.indexOf(id) >= 0 || i.w); }).length + " / " + live.length + tr(" réponses", " answers"));
    } else if(s.phase === "res"){
      const R = s.res || {}, op = s.op || {}, op2 = R.op2 || {}, cnt = (o, x) => Object.keys(o).filter(id => o[id] === x).length;
      let head = "";
      if(s.mode === "duel"){
        head = R.win === "=" ? '<div class="who">' + tr("Égalité !", "It's a tie!") + "</div>" : '<span class="eyebrow">' + tr("Le plus convaincant", "Most convincing") + '</span><div class="who">' + esc(ctx.name(s.deb[R.win])) + '</div><p class="db-sp"><span class="db-side ' + R.win + '">' + SIDE(R.win) + "</span> · " + tr(Math.max(R.wp, R.wc) + " vote" + (Math.max(R.wp, R.wc) > 1 ? "s" : "") + " sur " + (R.wp + R.wc), Math.max(R.wp, R.wc) + " of " + (R.wp + R.wc) + " votes") + "</p>";
        if(R.dv) head += '<p class="note-box">' + tr(esc(ctx.name(R.dv)) + " a gagné en défendant le contraire de son avis : +1 point bonus !", esc(ctx.name(R.dv)) + " won arguing against their own view: +1 bonus point!") + "</p>";
      }
      const moved = A(R.moved);
      screen(root, "rs" + s.k + ctx.isHost, lab + qCard(s.q) + head + barHTML(tr("Avant le débat", "Before the debate"), cnt(op, "p"), cnt(op, "c")) + barHTML(tr("Après le débat", "After the debate"), cnt(op2, "p"), cnt(op2, "c")) +
        '<p class="sm" style="text-align:center">' + (moved.length ? tr(moved.length + " personne" + (moved.length > 1 ? "s ont" : " a") + " changé d'avis", moved.length + (moved.length === 1 ? " person" : " people") + " changed their mind") : tr("Personne n'a changé d'avis.", "Nobody changed their mind.")) + "</p>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? tr("Voir le classement", "See the standings") : tr("Sujet suivant", "Next topic")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const st = c.s; if(st.phase !== "res") return;
          if(st.round >= st.rounds){ c.set({ phase: "end" }); return; }
          let deck = A(c.priv().deck); if(!deck.length) deck = deckFor(c.opts.packs, st.lg); const q = deck.pop(); SB.u.saw(SEEN, q); c.setPriv({ deck });
          const lv = c.ids.filter(id => c.here(id)).length, t = st.mode === "duel" && c.opts.twists !== false ? SB.u.twist(TW, { last: st.tw, n: lv, rate: .35 }) : null;
          c.set({ phase: "avant", q, round: st.round + 1, tw: t ? t.id : "", mot: t && t.id === "mot" ? pick(MOTS[st.lg === "en" ? "en" : "fr"]) : "", qa: "", deb: null, st: 0, endAt: 0, op: {}, res: null, k: c.rid() });
        }));
      });
    } else if(s.phase === "end"){
      const p = s.pts || {}, order = lead(ctx.ids, p), aw = awards(ctx.ids, s, ctx.name), duel = s.mode === "duel";
      screen(root, "end" + ctx.isHost, CSS + (duel ? '<span class="eyebrow">' + tr("Meilleur orateur", "Best speaker") + '</span><div class="who">' + esc(ctx.name(order[0])) + '</div><div class="db-list">' + order.map((id, i) => '<div class="db-row"><b>' + (i + 1) + ". " + esc(ctx.name(id)) + '</b><span class="n">' + (p[id] || 0) + "</span></div>").join("") + "</div>" : '<div class="who">' + tr("Fin des débats", "Debates over") + "</div>") +
        (aw.length ? '<ul class="list">' + aw.map(a => '<li><span class="t">' + esc(a[1]) + '</span><span class="by">' + esc(a[0]) + " · " + esc(a[2]) + "</span></li>").join("") + "</ul>" : "") +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = lead(c.ids, pp), mx = pp[o2[0]] || 0, w = c.s.mode === "duel" && mx ? o2.filter(id => (pp[id] || 0) === mx) : [];
          c.end({ title: w.length ? tr("Débats : ", "Debates: ") + w.map(c.name).join(" & ") + (w.length > 1 ? tr(", meilleurs orateurs", ", best speakers") : tr(", meilleur orateur", ", best speaker")) : tr("Débats", "Debates"), lines: (c.s.mode === "duel" ? o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + (pp[id] || 0) + ((pp[id] || 0) > 1 ? " pts" : " pt")) : []).concat(awards(c.ids, c.s, c.name).map(a => a[0] + tr(" : ", ": ") + a[1])), win: w });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ----------
     Duel : le téléphone sert de chrono et d'arbitre ; on vote à main levée.
     Libre : une carte sujet, tout le monde débat, puis sujet suivant. */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let mode = names.length < 3 ? "libre" : (st.dbMode === "libre" ? "libre" : "duel"), sel = A(st.dbPacks).length ? A(st.dbPacks).slice() : ["leger", "societe", "philo"];
      let rounds = [4, 6, 10].indexOf(st.dbRounds) >= 0 ? st.dbRounds : 6, twOn = st.dbTw !== false;
      let deck = [], q = "", round = 0, tw = null, mot = "", deb = null, step = 0, timer = null, endAt = 0, pts = {}, nd = {}, gno = 0, qa = "";
      const stop = () => { clearInterval(timer); timer = null; };
      function setup(){
        stop();
        screen(root, "su" + Math.random(), CSS +
          '<div class="field"><span class="eyebrow">' + tr("Mode", "Mode") + '</span><div class="seg">' + [["duel", tr("Duel", "Duel")], ["libre", tr("Libre", "Free")]].map(x => '<button type="button" data-m="' + x[0] + '" aria-pressed="' + (mode === x[0]) + '"' + (x[0] === "duel" && names.length < 3 ? " disabled" : "") + ">" + x[1] + "</button>").join("") + "</div>" +
          '<p class="sm" style="margin:0">' + (mode === "duel" ? tr("Deux orateurs, un chrono, le reste du groupe vote à main levée.", "Two speakers, a clock, everyone else votes by show of hands.") : tr("Un sujet, tout le monde débat ensemble. Pas de points.", "One topic, everyone debates together. No points.")) + "</p></div>" +
          (mode === "duel" ? '<div class="field"><span class="eyebrow">' + tr("Sujets", "Topics") + '</span><div class="seg">' + [4, 6, 10].map(n => '<button type="button" data-r="' + n + '" aria-pressed="' + (rounds === n) + '">' + n + "</button>").join("") + "</div></div>" : "") +
          '<div class="field"><span class="eyebrow">' + tr("Catégories", "Categories") + '</span><div class="packs">' + PACKS.filter(SB.packOk).map(p => '<button type="button" class="pack' + (p.hot ? " hot" : "") + '" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + (p.hot ? '<span class="pill hot">18+</span>' : "") + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div></div>" +
          (mode === "duel" ? '<div class="field"><div class="packs"><button type="button" class="pack" data-tw aria-pressed="' + twOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Coups de théâtre", "Plot twists") + '</span><span class="ds">' + tr("De temps en temps, une règle change", "Now and then, a rule changes") + "</span></span></button></div></div>" : "") +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + "</button>"), r => {
          r.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; persist({ dbMode: mode }); setup(); }));
          r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => { rounds = +b.dataset.r; persist({ dbRounds: rounds }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ dbPacks: sel }); setup(); }));
          const t = r.querySelector("[data-tw]"); if(t) t.addEventListener("click", () => { twOn = !twOn; persist({ dbTw: twOn }); setup(); });
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins une catégorie", "Pick at least one category")); return; }
            deck = deckFor(SB.okPacks(sel, PACKS), SB.lang()); round = 0; pts = {}; nd = {}; tw = null; gno++; next();
          });
        });
      }
      const lab = () => CSS + '<span class="eyebrow">' + tr("Sujet ", "Topic ") + round + (mode === "duel" ? " / " + rounds : "") + "</span>" + SB.u.twistHTML(tw) + (tw && tw.id === "mot" ? '<p class="note-box">' + tr("Mot interdit : « " + esc(mot) + " »", "Forbidden word: “" + esc(mot) + "”") + "</p>" : "");
      const quit = '<button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>";
      function next(){
        stop(); round++;
        if(!deck.length) deck = deckFor(SB.okPacks(sel, PACKS), SB.lang());
        q = deck.pop(); SB.u.saw(SEEN, q);
        if(mode === "libre"){ libre(); return; }
        tw = twOn && round > 1 ? SB.u.twist(TWL, { last: tw ? tw.id : "", n: names.length, rate: .35 }) : null;
        mot = tw && tw.id === "mot" ? pick(MOTS[SB.lang() === "en" ? "en" : "fr"]) : "";
        const order = shuffle(names).sort((a, b) => (nd[a] || 0) - (nd[b] || 0)), two = order.slice(0, 2);
        deb = { p: two[0], c: two[1] }; nd[deb.p] = (nd[deb.p] || 0) + 1; nd[deb.c] = (nd[deb.c] || 0) + 1;
        const aud = names.filter(n => n !== deb.p && n !== deb.c); qa = tw && tw.id === "public" && aud.length ? pick(aud) : "";
        step = -1; intro();
      }
      const duoHTML = cur => '<div class="db-duo">' + ["p", "c"].map(x => '<div class="db-o' + (cur === x ? " on" : "") + '"><span class="db-side ' + x + '">' + SIDE(x) + "</span><b>" + esc(deb[x]) + "</b></div>").join("") + "</div>";
      function intro(){
        screen(root, "in" + gno + ":" + round, lab() + qCard(q) + duoHTML("") + '<p class="howto" style="text-align:center">' + tr("Chacun défend son camp, même s'il pense le contraire !", "Each argues their side, even if they think the opposite!") + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Lancer le chrono", "Start the clock") + "</button>" + quit), r => {
          r.querySelector("[data-go]").addEventListener("click", () => { step = 0; speak(); });
          r.querySelector("[data-q]").addEventListener("click", () => { stop(); api.exit(); });
        });
      }
      function speak(){
        stop();
        if(step >= STEPS.length){ vote(); return; }
        const x = STEPS[step][0]; endAt = Date.now() + dur(step, tw ? tw.id : "");
        const qn = qa && step === 2 ? '<p class="note-box">' + tr(esc(qa) + " pose d'abord une question à chaque orateur.", esc(qa) + " first asks each speaker a question.") + "</p>" : "";
        screen(root, "sp" + gno + ":" + round + ":" + step, lab() + qCard(q) + duoHTML(x) + stepsHTML(step) + qn +
          '<p class="db-sp">' + (STEPS[step][2] === "ouv" ? tr("Ouverture", "Opening") : tr("Réplique", "Rebuttal")) + " · " + esc(deb[x]) + ' <span class="db-side ' + x + '">' + SIDE(x) + '</span></p><div class="db-t" data-t></div>' +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + tr("Suivant", "Next") + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { buzz(8); step++; speak(); });
        });
        const tick = () => {
          const el = root.querySelector("[data-t]"); if(!el || !root.isConnected){ stop(); return; }
          const sec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); el.textContent = sec; el.classList.toggle("low", sec <= 10);
          if(sec <= 0){ buzz([60, 80, 60]); step++; speak(); }
        };
        tick(); timer = setInterval(tick, 250);
      }
      function vote(){
        stop();
        screen(root, "vo" + gno + ":" + round, lab() + qCard(q) + '<p class="db-sp">' + tr("Qui a été le plus convaincant ? Levez la main !", "Who was most convincing? Raise your hands!") + "</p>" +
          '<div class="db-ab">' + ["p", "c"].map(x => '<button type="button" class="' + x + '" data-w="' + x + '" aria-pressed="true">' + esc(deb[x]) + "</button>").join("") + "</div>" +
          SB.u.dock('<button class="btn ghost" type="button" data-w="=">' + tr("Égalité", "Tie") + "</button>"), r => {
          r.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => {
            const w = b.dataset.w; buzz(12);
            if(w === "=") [deb.p, deb.c].forEach(n => { pts[n] = (pts[n] || 0) + 1; }); else pts[deb[w]] = (pts[deb[w]] || 0) + 2;
            res(w);
          }));
        });
      }
      function res(w){
        const last = round >= rounds;
        screen(root, "rs" + gno + ":" + round, lab() + qCard(q) + (w === "=" ? '<div class="who">' + tr("Égalité !", "It's a tie!") + "</div>" : '<span class="eyebrow">' + tr("Le plus convaincant", "Most convincing") + '</span><div class="who">' + esc(deb[w]) + "</div>") +
          '<div class="db-list">' + lead(names, pts).map((n, i) => '<div class="db-row"><b>' + (i + 1) + ". " + esc(n) + '</b><span class="n">' + (pts[n] || 0) + "</span></div>").join("") + "</div>" +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (last ? tr("Voir le classement", "See the standings") : tr("Sujet suivant", "Next topic")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { if(last) end(); else next(); });
        });
      }
      function end(){
        const order = lead(names, pts), mx = pts[order[0]] || 0;
        if(api.win) api.win(mx ? order.filter(n => (pts[n] || 0) === mx) : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Meilleur orateur", "Best speaker") + '</span><div class="who">' + esc(order[0]) + '</div><div class="db-list">' + order.map((n, i) => '<div class="db-row"><b>' + (i + 1) + ". " + esc(n) + '</b><span class="n">' + (pts[n] || 0) + "</span></div>").join("") + "</div>" +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      function libre(){
        screen(root, "lb" + gno + ":" + round, lab() + qCard(q) + '<p class="db-sp">' + tr("Pour ou contre ? Débattez tous ensemble !", "For or against? Everyone, debate!") + '</p><div class="db-t" data-t style="font-size:48px"></div>' +
          SB.u.dock('<button class="btn ghost" type="button" data-c>' + tr("Lancer le chrono (3 min)", "Start the timer (3 min)") + '</button><button class="btn acc" type="button" data-n>' + tr("Sujet suivant", "Next topic") + "</button>" + quit), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { buzz(8); next(); });
          r.querySelector("[data-q]").addEventListener("click", () => { stop(); api.exit(); });
          r.querySelector("[data-c]").addEventListener("click", () => {
            stop(); endAt = Date.now() + 180000;
            const tick = () => { const el = root.querySelector("[data-t]"); if(!el || !root.isConnected){ stop(); return; } const sec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); el.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); el.classList.toggle("low", sec <= 15); if(sec <= 0){ stop(); buzz([60, 80, 60]); } };
            tick(); timer = setInterval(tick, 250);
          });
        });
      }
      setup();
    }
  }
});
// Passe au temps de parole suivant (chez l'hôte) ; après le dernier : le vote.
function nextStep(c){
  const s = c.s, n = s.st + 1;
  if(n >= STEPS.length){ c.set({ phase: "vote", k: c.rid() }); return; }
  c.set({ st: n, endAt: c.now() + dur(n, s.tw) });
}
})();
