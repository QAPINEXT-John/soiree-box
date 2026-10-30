/* Test kink — questionnaire secret sur ses envies (entre adultes consentants), profil en pourcentages par archétype.
   Les réponses ne quittent jamais le téléphone : en réseau, chacun choisit s'il partage son profil avec le groupe. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, dock, buzz, tr } = SB.u;

/* Archétypes : nom, description courte. switch et vanille sont aussi calculés à partir des autres. */
const ARCH = {
  dominant: [tr("Dominant·e", "Dominant"), tr("Tu aimes mener la danse et poser les règles.", "You like taking the lead and setting the rules.")],
  soumis: [tr("Soumis·e", "Submissive"), tr("Tu aimes lâcher prise et suivre les règles de l'autre.", "You like letting go and following your partner's rules.")],
  switch: ["Switch", tr("Tu passes d'un rôle à l'autre selon l'humeur et le ou la partenaire.", "You swap roles depending on the mood and the partner.")],
  sadique: [tr("Sadique", "Sadist"), tr("Faire monter la douleur, toujours consentie, t'excite.", "Turning up the pain, always consensual, excites you.")],
  maso: [tr("Maso", "Masochist"), tr("Un peu de douleur rend le plaisir plus fort.", "A little pain makes pleasure stronger.")],
  rigger: ["Rigger", tr("Cordes, menottes, bandeau : c'est toi qui attaches.", "Rope, cuffs, blindfold: you're the one doing the tying.")],
  ropebunny: ["Rope bunny", tr("Être attaché·e et ne plus rien contrôler te plaît.", "Being tied up and giving up control appeals to you.")],
  exhib: [tr("Exhibitionniste", "Exhibitionist"), tr("Être vu·e, c'est la moitié du plaisir.", "Being seen is half the fun.")],
  voyeur: [tr("Voyeur·se", "Voyeur"), tr("Regarder t'excite autant que participer.", "Watching turns you on as much as joining in.")],
  brat: ["Brat", tr("Tu provoques exprès pour te faire recadrer.", "You misbehave on purpose to get put in your place.")],
  dompteur: [tr("Dompteur·se de brat", "Brat tamer"), tr("Tu adores recadrer les insolent·es.", "You love putting cheeky partners in their place.")],
  primal: ["Primal", tr("Sauvage et instinctif(ve) : lutte, morsures, zéro retenue.", "Wild and instinctive: wrestling, biting, zero restraint.")],
  fetiche: [tr("Fétichiste", "Fetishist"), tr("Matières, tenues, détails précis : ça compte énormément.", "Materials, outfits, specific details: they matter a lot.")],
  libertin: [tr("Libertin·e", "Non-monogamist"), tr("Plusieurs partenaires, ça ne te fait pas peur.", "More than one partner doesn't scare you.")],
  explorateur: [tr("Explorateur·rice", "Experimentalist"), tr("Curieux·se de tout, tu veux tout essayer.", "Curious about everything, you want to try it all.")],
  vanille: [tr("Vanille", "Vanilla"), tr("Le sexe tendre et simple te va très bien.", "Soft, simple sex suits you just fine.")]
};
const BASE = ["dominant", "soumis", "sadique", "maso", "rigger", "ropebunny", "exhib", "voyeur", "brat", "dompteur", "primal", "fetiche", "libertin", "explorateur", "vanille"];

/* Affirmations : [archétype, français, anglais]. Mêmes positions dans les deux langues. */
const Q = [
  ["dominant", "J'aime mener la danse au lit et décider de ce qui va se passer.", "I like taking the lead in bed and deciding what happens next."],
  ["dominant", "Donner des ordres à mon ou ma partenaire m'excite.", "Giving my partner orders turns me on."],
  ["dominant", "J'aime voir l'autre s'abandonner complètement à moi.", "I love watching my partner surrender completely to me."],
  ["dominant", "J'aime fixer des règles que l'autre doit respecter, même en dehors du lit.", "I like setting rules my partner has to follow, even outside the bedroom."],
  ["soumis", "J'aime qu'on prenne les commandes et qu'on décide pour moi au lit.", "I like it when someone takes charge and decides for me in bed."],
  ["soumis", "Obéir à des ordres m'excite.", "Following orders turns me on."],
  ["soumis", "Me sentir à la merci de l'autre, en toute confiance, me fait de l'effet.", "Feeling at my partner's mercy, with complete trust, does something for me."],
  ["soumis", "J'aime faire plaisir à l'autre en suivant ses instructions à la lettre.", "I like pleasing my partner by following their instructions to the letter."],
  ["sadique", "Donner une fessée bien appuyée me plaît.", "I enjoy giving a good hard spanking."],
  ["sadique", "Faire monter la douleur chez un ou une partenaire consentant·e m'excite.", "Turning up the pain for a willing partner excites me."],
  ["sadique", "J'aime laisser des marques sur l'autre (suçons, traces de fessée).", "I like leaving marks on my partner (hickeys, spanking marks)."],
  ["sadique", "Mordre, griffer ou pincer l'autre fait partie du plaisir pour moi.", "Biting, scratching or pinching my partner is part of the fun for me."],
  ["maso", "Recevoir une fessée me plaît.", "I enjoy being spanked."],
  ["maso", "Un peu de douleur rend le plaisir plus intense pour moi.", "A bit of pain makes pleasure more intense for me."],
  ["maso", "J'aime garder des marques le lendemain, comme un souvenir.", "I like having marks the next day, like a souvenir."],
  ["maso", "Me faire mordre, griffer ou pincer m'excite.", "Being bitten, scratched or pinched turns me on."],
  ["rigger", "Attacher mon ou ma partenaire m'excite.", "Tying my partner up turns me on."],
  ["rigger", "J'aimerais apprendre le bondage avec des cordes, ou je le pratique déjà.", "I'd like to learn rope bondage, or I already do it."],
  ["rigger", "Bander les yeux de l'autre et l'empêcher de bouger me plaît.", "Blindfolding my partner and keeping them from moving appeals to me."],
  ["rigger", "Quand il y a des menottes, c'est moi qui garde la clé.", "When there are handcuffs, I'm the one holding the key."],
  ["ropebunny", "Être attaché·e m'excite.", "Being tied up turns me on."],
  ["ropebunny", "J'aime ne plus pouvoir bouger et laisser l'autre faire ce qu'il ou elle veut.", "I like not being able to move and letting my partner do what they want."],
  ["ropebunny", "Avoir les yeux bandés rend tout plus intense.", "Being blindfolded makes everything more intense."],
  ["ropebunny", "Le contact des cordes ou des menottes sur ma peau me plaît.", "I like the feel of rope or cuffs on my skin."],
  ["exhib", "L'idée qu'on puisse me voir pendant l'amour m'excite.", "The idea that someone might see me during sex turns me on."],
  ["exhib", "J'aime m'exhiber, me montrer ou envoyer des photos sexy.", "I like showing off, putting myself on display or sending sexy pics."],
  ["exhib", "Faire l'amour dans un endroit où l'on risque d'être surpris(e) me tente.", "Having sex somewhere we might get caught tempts me."],
  ["exhib", "Être regardé·e par d'autres pendant un rapport me plairait.", "Being watched by others during sex would appeal to me."],
  ["voyeur", "Regarder d'autres personnes faire l'amour m'excite.", "Watching other people have sex turns me on."],
  ["voyeur", "J'aime regarder mon ou ma partenaire se caresser.", "I love watching my partner touch themselves."],
  ["voyeur", "Un club où l'on peut regarder sans participer me tente.", "A club where you can watch without taking part tempts me."],
  ["voyeur", "Je préfère souvent regarder plutôt que participer.", "I often prefer watching to taking part."],
  ["brat", "J'aime provoquer l'autre pour qu'il ou elle me « punisse ».", "I like provoking my partner so they'll “punish” me."],
  ["brat", "Désobéir exprès fait partie du jeu pour moi.", "Disobeying on purpose is part of the game for me."],
  ["brat", "J'aime résister et me faire « dompter ».", "I like resisting and being “tamed”."],
  ["brat", "Taquiner l'autre et le ou la pousser à bout m'amuse au lit.", "Teasing my partner and pushing their buttons is fun for me in bed."],
  ["dompteur", "Remettre à sa place un ou une partenaire insolent·e m'excite.", "Putting a cheeky partner back in their place turns me on."],
  ["dompteur", "J'aime quand l'autre me résiste : la victoire n'en est que meilleure.", "I like it when my partner resists: it makes winning sweeter."],
  ["dompteur", "Inventer des « punitions » coquines me plaît.", "Coming up with naughty “punishments” appeals to me."],
  ["dompteur", "Quand l'autre me provoque, j'ai envie de reprendre le contrôle.", "When my partner provokes me, I want to take back control."],
  ["primal", "J'aime le sexe sauvage, instinctif, sans filtre.", "I like wild, instinctive, unfiltered sex."],
  ["primal", "Les jeux de lutte ou de poursuite avant l'amour m'excitent.", "Wrestling or chasing games before sex turn me on."],
  ["primal", "Grogner, mordre, griffer : au lit, je me lâche complètement.", "Growling, biting, scratching: in bed, I let myself go completely."],
  ["primal", "J'aime quand on oublie toute retenue et toute douceur.", "I like it when all restraint and gentleness go out the window."],
  ["fetiche", "Certaines matières (cuir, latex, dentelle) m'excitent particulièrement.", "Certain materials (leather, latex, lace) really turn me on."],
  ["fetiche", "J'ai un fétiche précis (pieds, talons, uniformes…).", "I have a specific fetish (feet, heels, uniforms…)."],
  ["fetiche", "Les tenues et les déguisements comptent beaucoup pour moi au lit.", "Outfits and costumes matter a lot to me in bed."],
  ["fetiche", "Un accessoire ou une tenue précise peut suffire à m'exciter.", "A specific accessory or outfit can be enough to turn me on."],
  ["libertin", "L'idée d'un plan à trois me tente.", "The idea of a threesome tempts me."],
  ["libertin", "Je pourrais vivre une relation ouverte.", "I could be in an open relationship."],
  ["libertin", "L'échangisme ou les clubs libertins me tentent.", "Partner swapping or swingers' clubs tempt me."],
  ["libertin", "Voir mon ou ma partenaire avec quelqu'un d'autre, d'un commun accord, m'excite.", "Seeing my partner with someone else, with everyone's consent, turns me on."],
  ["explorateur", "J'ai envie d'essayer des choses que je n'ai jamais faites.", "I want to try things I've never done."],
  ["explorateur", "J'adore les sextoys et les nouveaux accessoires.", "I love sex toys and new gadgets."],
  ["explorateur", "Les jeux de rôle et les scénarios m'excitent.", "Role-play and scenarios turn me on."],
  ["explorateur", "Je suis curieux·se de presque tout, tant que c'est entre adultes consentants.", "I'm curious about almost anything, as long as it's between consenting adults."],
  ["vanille", "Pour moi, le sexe tendre et doux suffit largement.", "For me, soft and tender sex is more than enough."],
  ["vanille", "La douleur, même légère, ne m'intéresse pas au lit.", "Pain, even light, does nothing for me in bed."],
  ["vanille", "Je préfère l'intimité à deux, sans accessoires ni mise en scène.", "I prefer intimacy just the two of us, no gadgets or staging."],
  ["vanille", "Les jeux de pouvoir au lit ne m'attirent pas.", "Power games in bed don't appeal to me."]
];
const qText = (i, lg) => { const q = Q[i]; return q ? (lg === "en" ? q[2] : q[1]) : "…"; };
const SCALE = [[4, tr("Carrément", "Absolutely")], [3, tr("Plutôt oui", "Kind of")], [2, tr("Bof, neutre", "Meh, neutral")], [1, tr("Plutôt non", "Not really")], [0, tr("Pas du tout", "Not at all")]];

// Ordre des questions : complet (toutes) ou rapide (2 par archétype), mélangé.
function deal(len){
  const by = {}; Q.forEach((q, i) => { (by[q[0]] = by[q[0]] || []).push(i); });
  const ids = len === "rapide" ? BASE.flatMap(k => shuffle(by[k] || []).slice(0, 2)) : Q.map((_, i) => i);
  return shuffle(ids);
}
// Profil : % par archétype (réponses 0 à 4), switch = le plus petit de dominant/soumis, vanille mêlée à l'absence d'envies kink.
function profile(qi, a){
  const sum = {}, n = {}; a = String(a || "");
  A(qi).forEach((qx, i) => { const q = Q[qx]; if(!q || i >= a.length) return; const v = +a[i]; sum[q[0]] = (sum[q[0]] || 0) + v; n[q[0]] = (n[q[0]] || 0) + 1; });
  const p = {}; BASE.forEach(k => { p[k] = n[k] ? Math.round(100 * sum[k] / (4 * n[k])) : 0; });
  const kinks = BASE.filter(k => k !== "vanille" && k !== "explorateur"), avg = kinks.reduce((x, k) => x + p[k], 0) / kinks.length;
  p.vanille = Math.round((n.vanille ? p.vanille : 50) * .5 + (100 - avg) * .5);
  p.switch = Math.min(p.dominant, p.soumis);
  return p;
}
const ranked = p => Object.keys(ARCH).filter(k => p[k] != null).map(k => [k, p[k]]).sort((x, y) => y[1] - x[1]);
const pc = n => tr(n + " %", n + "%");

const CSS = '<style>' +
  '.ki-q{font-size:25px; font-weight:800; line-height:1.25}' +
  '.ki-bar{height:8px; border-radius:99px; background:var(--soft); overflow:hidden}.ki-bar i{display:block; height:100%; background:var(--acc); transition:width .2s}' +
  '.ki-sc{display:flex; flex-direction:column; gap:7px}.ki-sc .btn{min-height:52px; font-size:17px}' +
  '.ki-top{font-family:var(--f-disp); font-weight:800; font-size:40px; line-height:1.05; color:var(--acc); overflow-wrap:anywhere}.ki-pct{font-family:var(--f-hand); font-weight:700; font-size:64px; line-height:.9; color:var(--ink)}.ki-desc{margin:0; font-size:17px; font-weight:700}' +
  '.ki-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}' +
  '.ki-list li{display:grid; grid-template-columns:1fr 46px; gap:4px 10px; align-items:center}.ki-list b{font-size:15px}.ki-list .p{text-align:right; font-weight:800; font-variant-numeric:tabular-nums}' +
  '.ki-list .bar{grid-column:1 / -1; height:7px; border-radius:99px; background:var(--soft); overflow:hidden}.ki-list .bar i{display:block; height:100%; background:var(--acc)}' +
  '.ki-list .d{grid-column:1 / -1; font-size:12px; color:var(--muted); margin-top:-2px}' +
  '.ki-pl{background:var(--card); border:1.5px solid var(--line); border-radius:16px; padding:12px 14px; display:flex; flex-direction:column; gap:6px}.ki-pl .chips{gap:6px}' +
  '.ki-pl .chip.a{background:var(--acc); color:var(--on-acc)}.ki-hid{color:var(--muted); font-style:italic}' +
  '</style>';
const NOTE = tr("Tout ça entre adultes consentants. Il n'y a pas de bonne réponse : réponds pour toi, sans juger. Ce test est un jeu, pas un diagnostic.", "All of this is between consenting adults. There's no right answer: answer for yourself, no judgment. This test is a game, not a diagnosis.");

/* Questionnaire (réutilisé en réseau et sur un seul téléphone). Progression gardée sur le téléphone. */
function runQuiz(root, key, qi, lg, onDone, header){
  const saved = store().kiRun || {};
  const st = saved.key === key ? { i: saved.i || 0, a: String(saved.a || "") } : { i: 0, a: "" };
  const save = () => persist({ kiRun: { key, i: st.i, a: st.a } });
  const draw = () => {
    if(st.i >= qi.length){ onDone(st.a); return; }
    screen(root, "kq" + key + "|" + st.i, CSS + (header || "") + '<div class="ki-bar"><i style="width:' + Math.round(100 * st.i / qi.length) + '%"></i></div>' +
      '<span class="eyebrow">' + tr("Affirmation ", "Statement ") + (st.i + 1) + " / " + qi.length + "</span>" +
      '<div class="card acc"><div class="ki-q">' + esc(qText(qi[st.i], lg)) + "</div></div>" +
      (st.i === 0 ? '<p class="sm">' + esc(NOTE) + "</p>" : "") +
      dock('<div class="ki-sc">' + SCALE.map(x => '<button class="btn ' + (x[0] >= 3 ? "acc" : "ghost") + '" type="button" data-v="' + x[0] + '">' + esc(x[1]) + "</button>").join("") + "</div>" +
        (st.i ? '<button class="link" type="button" data-back style="align-self:center">' + tr("Revenir à la précédente", "Back to the previous one") + "</button>" : "")), r => {
      r.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => { buzz(8); st.a = st.a.slice(0, st.i) + b.dataset.v; st.i++; save(); draw(); }));
      const bk = r.querySelector("[data-back]"); if(bk) bk.addEventListener("click", () => { st.i = Math.max(0, st.i - 1); st.a = st.a.slice(0, st.i); save(); draw(); });
    });
  };
  draw();
}
function answersFor(key){ const s = store().kiRun || {}; return s.key === key ? String(s.a || "") : ""; }

// Profil d'un joueur (privé) : en-tête (archétype principal) et détail de tous les archétypes.
function headHTML(p, title){
  const top = ranked(p)[0] || ["vanille", 0];
  return '<span class="eyebrow">' + esc(title || tr("Ton profil", "Your profile")) + '</span><div class="ki-top">' + esc(ARCH[top[0]][0]) + '</div><div class="ki-pct">' + pc(top[1]) + "</div>" +
    '<p class="ki-desc">' + esc(ARCH[top[0]][1]) + "</p>";
}
function listHTML(p){
  return '<div class="field"><span class="eyebrow">' + tr("Le détail", "The breakdown") + '</span><ul class="ki-list">' + ranked(p).map(x => '<li><b>' + esc(ARCH[x[0]][0]) + '</b><span class="p">' + pc(x[1]) + '</span><span class="bar"><i style="width:' + x[1] + '%"></i></span><span class="d">' + esc(ARCH[x[0]][1]) + "</span></li>").join("") + "</ul></div>";
}
// Top 3 partagé avec le groupe.
function sharedHTML(name, p){
  return '<div class="ki-pl"><b>' + esc(name) + '</b><div class="chips">' + ranked(p).slice(0, 3).map((x, i) => '<span class="chip' + (i ? "" : " a") + '">' + esc(ARCH[x[0]][0]) + " " + pc(x[1]) + "</span>").join("") + "</div></div>";
}
function hiddenHTML(name){ return '<div class="ki-pl"><b>' + esc(name) + '</b><span class="ki-hid">' + tr("garde ses résultats pour lui ou elle", "is keeping their results private") + "</span></div>"; }
const top3 = p => { const o = {}; ranked(cleanP(p)).slice(0, 3).forEach(x => { o[x[0]] = x[1]; }); return o; };
const cleanP = p => { const o = {}; Object.keys(ARCH).forEach(k => { const v = Math.round(+(p && p[k]) || 0); o[k] = Math.max(0, Math.min(100, v)); }); return o; };

SB.register({
  id: "kink", adult: true, name: tr("Test kink", "Kink Test"), glyph: "Kink", pitch: tr("Dominant(e), soumis(e), switch… Découvre ton profil, en secret.", "Dominant, submissive, switch… Find out your profile, in secret."), hot: true,
  accent: { light: "#e0245e", dark: "#ff5c8a" },
  tag: tr("Un questionnaire secret sur tes envies, entre adultes consentants. Ton profil reste privé, sauf si tu choisis de le partager.", "A secret questionnaire about what you're into, between consenting adults. Your profile stays private unless you choose to share it."),
  min: 1, max: 20,
  rules: [
    tr("Réservé aux adultes. Chacun répond seul(e), sur son téléphone, à des affirmations sur ses envies : de « Pas du tout » à « Carrément ».", "Adults only. Everyone answers alone, on their own phone, to statements about what they're into: from “Not at all” to “Absolutely”."),
    tr("À la fin, tu découvres ton profil : un pourcentage pour chaque archétype (dominant(e), soumis(e), switch, sadique, maso, rigger, rope bunny, exhibitionniste, voyeur(se), brat, dompteur(se) de brat, primal, fétichiste, libertin(e), explorateur(rice), vanille).", "At the end, you get your profile: a percentage for each archetype (dominant, submissive, switch, sadist, masochist, rigger, rope bunny, exhibitionist, voyeur, brat, brat tamer, primal, fetishist, non-monogamist, experimentalist, vanilla)."),
    tr("Tes réponses ne quittent jamais ton téléphone. Si tu veux, tu partages ton top 3 avec le groupe ; sinon, les autres voient seulement que tu as fini.", "Your answers never leave your phone. If you want, you share your top 3 with the group; otherwise the others only see that you're done."),
    tr("C'est un jeu, pas un diagnostic. Personne ne juge personne.", "It's a game, not a diagnosis. Nobody judges anybody.")
  ],
  options: [
    { id: "len", label: tr("Longueur", "Length"), type: "seg", def: "rapide", values: [{ v: "rapide", label: tr("Rapide (30)", "Quick (30)") }, { v: "complet", label: tr("Complet (60)", "Full (60)") }] }
  ],
  start(ctx, o){ return { phase: "play", lg: SB.lang(), len: o.len === "complet" ? "complet" : "rapide", qi: deal(o.len) }; },
  host(ctx){
    const s = ctx.s; if(s.phase !== "play") return;
    const live = ctx.ids.filter(id => ctx.here(id));
    if(live.length && live.every(id => { const i = ctx.input(id); return i && i.done; })) ctx.set({ phase: "res" });
  },
  render(ctx, root){
    const s = ctx.s, qi = A(s.qi), lg = s.lg || "fr", my = ctx.mine() || {};
    const live = ctx.ids.filter(id => ctx.here(id)), doneN = live.filter(id => { const i = ctx.input(id); return i && i.done; }).length;
    const share = (p, on) => ctx.send({ done: 1, share: on ? 1 : 0, r: on ? top3(p) : null }); // seulement le top 3, comme annoncé
    if(s.phase === "play" && ctx.playing && !my.done){
      if(root.dataset.quiz !== s.k){ root.dataset.quiz = s.k; root.dataset.key = ""; }
      runQuiz(root, s.k + ctx.me, qi, lg, a => { const p = profile(qi, a); share(p, false); });
      return;
    }
    root.dataset.quiz = "";
    const a = answersFor(s.k + ctx.me), mine = a.length >= qi.length ? profile(qi, a) : null;
    const others = '<div class="field"><span class="eyebrow">' + tr("Le groupe", "The group") + "</span>" + ctx.ids.filter(id => id !== ctx.me).map(id => {
      const i = ctx.input(id) || {};
      if(!i.done) return '<div class="ki-pl"><b>' + esc(ctx.name(id)) + '</b><span class="ki-hid">' + tr("répond encore…", "still answering…") + "</span></div>";
      return i.share && i.r ? sharedHTML(ctx.name(id), cleanP(i.r)) : hiddenHTML(ctx.name(id));
    }).join("") + "</div>";
    const end = s.phase === "res";
    screen(root, "kr" + s.k + (my.share ? 1 : 0) + end + ctx.isHost + JSON.stringify(ctx.ids.map(id => { const i = ctx.input(id) || {}; return [i.done ? 1 : 0, i.share ? 1 : 0]; })), CSS +
      (mine ? headHTML(mine) : '<p class="howto">' + tr("Tu regardes la partie. Chacun découvre son profil sur son téléphone.", "You're watching. Everyone sees their own profile on their phone.") + "</p>") +
      (mine ? '<button type="button" class="pack" data-sh aria-pressed="' + !!my.share + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Partager mon top 3 avec le groupe", "Share my top 3 with the group") + '</span><span class="ds">' + tr("Seulement les 3 premiers archétypes. Tes réponses restent sur ton téléphone.", "Only your top 3 archetypes. Your answers stay on your phone.") + "</span></span></button>" : "") +
      others + (mine ? listHTML(mine) : "") +
      dock(end ? (ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>") : '<p class="wait" data-wait></p>'), r => {
      const b = r.querySelector("[data-sh]"); if(b) b.addEventListener("click", () => { buzz(8); share(mine, !my.share); });
      const bk = r.querySelector("[data-back]");
      if(bk) bk.addEventListener("click", () => ctx.act(c => {
        const n = c.ids.filter(id => { const i = c.input(id); return i && i.share && i.r; }).length;
        c.end({ title: tr("Test kink", "Kink Test") + " · " + (n ? tr(n + (n > 1 ? " profils partagés" : " profil partagé"), n + (n > 1 ? " profiles shared" : " profile shared")) : tr("profils gardés secrets", "profiles kept private")), lines: [] });
      }));
    });
    if(!end) txt(root, "[data-wait]", tr(doneN + " / " + live.length + " ont terminé", doneN + " / " + live.length + " done"));
  },
  local: {
    players: { min: 1, max: 12 },
    start(root, api){
      const names = api.names, lg = SB.lang(), st = store();
      const L = { phase: "setup", len: st.kiLen === "complet" ? "complet" : "rapide", p: 0, res: [], share: [], key: "" };
      const go = () => {
        if(L.phase === "setup"){
          screen(root, "ks" + L.len, CSS + '<p class="howto">' + esc(NOTE) + "</p>" +
            (names.length > 1 ? '<p class="sm">' + tr("Le téléphone passe de main en main. Chacun répond seul(e), découvre son profil en privé, puis choisit s'il (si elle) le montre au groupe à la fin.", "The phone goes around. Everyone answers alone, sees their profile privately, then chooses whether to show it to the group at the end.") + "</p>" : "") +
            '<div class="field"><span class="eyebrow">' + tr("Longueur", "Length") + '</span><div class="seg">' + [["rapide", tr("Rapide (30)", "Quick (30)")], ["complet", tr("Complet (60)", "Full (60)")]].map(x => '<button type="button" data-l="' + x[0] + '" aria-pressed="' + (x[0] === L.len) + '">' + x[1] + "</button>").join("") + "</div></div>" +
            dock('<button class="btn acc" type="button" data-go>' + tr("Commencer", "Start") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
            r.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => { L.len = b.dataset.l; persist({ kiLen: L.len }); go(); }));
            r.querySelector("[data-q]").addEventListener("click", api.exit);
            r.querySelector("[data-go]").addEventListener("click", () => { L.key = "kl" + Math.random().toString(36).slice(2); L.qi = deal(L.len); L.p = 0; L.res = []; L.share = []; L.phase = names.length > 1 ? "pass" : "quiz"; go(); });
          });
        } else if(L.phase === "pass"){
          screen(root, "kp" + L.p, CSS + '<span class="eyebrow">' + tr("Joueur ", "Player ") + (L.p + 1) + " / " + names.length + '</span><p class="howto">' + tr("Passe le téléphone à", "Hand the phone to") + '</p><div class="who">' + esc(names[L.p]) + "</div><p class=\"sm\">" + tr("Les autres ne regardent pas l'écran.", "Everyone else, look away.") + "</p>" +
            dock('<button class="btn acc" type="button" data-n>' + tr("C'est moi, je commence", "It's me, let's go") + "</button>"), r => { r.querySelector("[data-n]").addEventListener("click", () => { L.phase = "quiz"; go(); }); });
        } else if(L.phase === "quiz"){
          runQuiz(root, L.key + L.p, L.qi, lg, a => { L.res[L.p] = profile(L.qi, a); L.share[L.p] = false; persist({ kiRun: null }); L.phase = "mine"; go(); }, names.length > 1 ? '<span class="eyebrow">' + esc(names[L.p]) + "</span>" : "");
        } else if(L.phase === "mine"){
          const last = L.p >= names.length - 1, solo = names.length === 1;
          screen(root, "km" + L.p + L.share[L.p], CSS + headHTML(L.res[L.p], solo ? "" : tr("Profil de ", "Profile: ") + names[L.p]) +
            (solo ? "" : '<button type="button" class="pack" data-sh aria-pressed="' + !!L.share[L.p] + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Montrer mon top 3 au groupe à la fin", "Show my top 3 to the group at the end") + '</span><span class="ds">' + tr("Sinon, ton profil reste secret.", "Otherwise your profile stays secret.") + "</span></span></button>") + listHTML(L.res[L.p]) +
            dock(solo ? '<button class="btn acc" type="button" data-a>' + tr("Refaire le test", "Take it again") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"
              : '<button class="btn acc" type="button" data-n>' + (last ? tr("Voir le groupe", "See the group") : tr("Joueur suivant", "Next player")) + "</button>"), r => {
            const sh = r.querySelector("[data-sh]"); if(sh) sh.addEventListener("click", () => { L.share[L.p] = !L.share[L.p]; buzz(8); go(); });
            const n = r.querySelector("[data-n]"); if(n) n.addEventListener("click", () => { if(last){ L.phase = "end"; } else { L.p++; L.phase = "pass"; } go(); });
            const a = r.querySelector("[data-a]"); if(a) a.addEventListener("click", api.again);
            const q = r.querySelector("[data-q]"); if(q) q.addEventListener("click", api.exit);
          });
        } else if(L.phase === "end"){
          screen(root, "ke" + L.key, CSS + '<span class="eyebrow">' + tr("Le groupe", "The group") + "</span>" +
            names.map((n, i) => L.share[i] ? sharedHTML(n, L.res[i]) : hiddenHTML(n)).join("") +
            dock('<button class="btn acc" type="button" data-a>' + tr("Refaire le test", "Take it again") + '</button><button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
            r.querySelector("[data-a]").addEventListener("click", api.again);
            r.querySelector("[data-q]").addEventListener("click", api.exit);
          });
        }
      };
      go();
    }
  }
});
})();
