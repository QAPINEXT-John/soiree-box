/* Karaoké — chacun son tour choisit une chanson parmi 3, l'extrait (30 s, Deezer) sort du téléphone de l'hôte,
   le chanteur chante par-dessus de mémoire (aucune parole affichée), parfois avec un défi, puis les autres notent sur 10.
   Rien n'est enregistré : le micro n'est jamais utilisé. S'appuie sur SB.music (défini dans blindtest.js). */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt, store, persist, tr, buzz } = SB.u;
const M = () => SB.music;
const SING_MS = 32000, VOTE_MS = 30000;

const DEFIS = [
  { id: "chuchote", name: tr("En chuchotant", "Whispering"), desc: tr("Toute la chanson à voix basse, comme un secret.", "The whole song in a whisper, like a secret.") },
  { id: "yaourt", name: tr("En yaourt", "Gibberish"), desc: tr("Interdit de dire les vraies paroles : invente des mots qui sonnent pareil.", "No real lyrics allowed: make up words that sound the same.") },
  { id: "opera", name: tr("Façon opéra", "Opera style"), desc: tr("Voix lyrique, vibrato et grands gestes obligatoires.", "Operatic voice, vibrato and big gestures required.") },
  { id: "accent", name: tr("Avec un accent", "With an accent"), desc: tr("Le groupe choisit l'accent : marseillais, anglais, québécois, belge…", "The group picks the accent: Southern, British, Australian, French…") },
  { id: "robot", name: tr("Comme un robot", "Like a robot"), desc: tr("Voix monocorde et mouvements saccadés.", "Monotone voice and jerky moves.") },
  { id: "danse", name: tr("En dansant", "Dancing"), desc: tr("Interdit de s'arrêter de danser jusqu'à la fin de l'extrait.", "You can't stop dancing until the clip ends.") },
  { id: "mime", name: tr("En mimant", "Acting it out"), desc: tr("Chaque phrase chantée doit être mimée.", "Every line you sing must be acted out.") },
  { id: "duo", name: tr("En duo", "Duet"), desc: tr("Tu chantes avec un autre joueur, tiré au sort. Vous partagez la note.", "You sing with another player, picked at random. You share the score.") }
];
const CSS = '<style data-kr>' +
  '.kr-songs{display:flex; flex-direction:column; gap:8px}.kr-song{display:flex; align-items:center; gap:12px; text-align:left; padding:8px; border-radius:16px; border:2px solid var(--line); background:var(--card); color:var(--ink); min-height:64px; width:100%}' +
  '.kr-song img,.kr-song i{width:52px; height:52px; border-radius:10px; object-fit:cover; flex:none; background:var(--line)}.kr-song b{display:block; font-size:16px; line-height:1.15}.kr-song span{color:var(--muted); font-weight:700; font-size:13px}' +
  '.kr-song[aria-pressed="true"]{border-color:var(--acc)}' +
  '.kr-mic{width:120px; height:120px; margin:4px auto; border-radius:50%; display:grid; place-items:center; background:radial-gradient(circle at 35% 30%,var(--acc),#7a2b8f); color:#fff; font-family:var(--f-disp); font-size:54px; box-shadow:0 10px 30px -10px rgba(0,0,0,.8)}.kr-mic.on{animation:kr-p 1s ease-in-out infinite}@keyframes kr-p{50%{transform:scale(1.06)}}' +
  '.kr-defi{border:2px dashed var(--acc); border-radius:16px; padding:10px 12px; text-align:center}.kr-defi b{display:block; font-family:var(--f-disp); font-size:22px; color:var(--acc)}.kr-defi span{font-weight:700}' +
  '.kr-notes{display:grid; grid-template-columns:repeat(6,1fr); gap:6px}.kr-notes button{min-height:52px; border-radius:14px; border:2px solid var(--line); background:var(--card); color:var(--ink); font-family:var(--f-disp); font-size:22px}' +
  '.kr-notes button[aria-pressed="true"]{background:var(--acc); border-color:var(--acc); color:var(--dark,#14101a)}' +
  '.kr-avg{font-family:var(--f-disp); font-size:64px; line-height:1; text-align:center; color:var(--acc)}.kr-avg small{font-size:24px; color:var(--muted)}' +
  '.kr-t{font-family:var(--f-disp); font-size:40px; text-align:center; color:var(--acc); line-height:1}' +
  '.kr-row{display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:var(--card); border:1.5px solid var(--line); font-weight:800}.kr-row b{flex:1}.kr-row .n{font-family:var(--f-disp); font-size:20px}.kr-list{display:flex; flex-direction:column; gap:6px}</style>';
const songBtn = (x, i, on) => '<button type="button" class="kr-song" data-pick="' + i + '" aria-pressed="' + !!on + '">' + (x.c ? '<img alt="" src="' + esc(x.c) + '">' : "<i></i>") + "<div><b>" + esc(x.t) + "</b><span>" + esc(x.a) + "</span></div></button>";
const defiHTML = (d, partner) => (d ? '<div class="kr-defi"><b>' + esc(d.name) + (d.id === "duo" && partner ? " " + tr("avec ", "with ") + esc(partner) : "") + "</b><span>" + esc(d.desc) + "</span></div>" : "");
const notesHTML = cur => '<div class="kr-notes">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => '<button type="button" data-note="' + v + '" aria-pressed="' + (cur === v) + '">' + v + "</button>").join("") + "</div>";
const fmt = v => (Math.round(v * 10) / 10).toString().replace(".", ",");
const ranking = (ids, pts, nameOf) => '<div class="kr-list">' + ids.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)).map((id, i) => '<div class="kr-row"><b>' + (i + 1) + ". " + esc(nameOf(id)) + '</b><span class="n">' + fmt(pts[id] || 0) + "</span></div>").join("") + "</div>";
const pub = x => ({ t: x.t, a: x.a, c: x.c });
const LOAD_ERR = tr("Impossible de charger les chansons Deezer. Vérifie la connexion Internet du téléphone de l'hôte, ou choisis d'autres thèmes.", "Couldn't load the Deezer songs. Check the host phone's internet connection, or pick other themes.");
let LOADING = "";

SB.register({
  id: "karaoke", name: tr("Karaoké", "Karaoke"), glyph: "♫", pitch: tr("Chante de mémoire, le groupe note", "Sing from memory, the group scores"), hot: false, ticks: true,
  accent: { light: "#9b4fe0", dark: "#c99bff" },
  tag: tr("Choisis une chanson, la musique part, tu chantes de mémoire (pas de paroles à l'écran !), parfois avec un défi. Les autres te notent sur 10.", "Pick a song, the music starts, you sing from memory (no lyrics on screen!), sometimes with a challenge. The others score you out of 10."),
  min: 2, max: 20,
  gages: [
    { ev: "flop", label: tr("Note moyenne sous 5", "Average score under 5"), kind: "boit", n: 1 },
    { ev: "star", label: tr("Note moyenne de 8 ou plus", "Average score of 8 or more"), kind: "distribue", n: 1 }
  ],
  rules: tr([
    "Chacun son tour : le chanteur choisit une chanson parmi 3 (il peut en demander 3 autres une fois).",
    "L'hôte lance la musique : l'extrait de 30 secondes sort de son téléphone. Le chanteur chante par-dessus, de mémoire : aucune parole n'est affichée.",
    "Défis : parfois il faut chanter en chuchotant, en yaourt, façon opéra, avec un accent, comme un robot, en dansant, en mimant, ou en duo.",
    "Ensuite, les autres notent la prestation de 0 à 10. La moyenne s'ajoute au score du chanteur (et de son partenaire en duo).",
    "Rien n'est enregistré : le micro du téléphone n'est jamais utilisé.",
    "Il faut Internet pour les extraits (Deezer), mais aucun compte."
  ], [
    "Take turns: the singer picks a song out of 3 (they can ask for 3 others once).",
    "The host starts the music: the 30-second clip plays from their phone. The singer sings over it, from memory: no lyrics are shown.",
    "Challenges: sometimes you must whisper, sing gibberish, go opera style, use an accent, sing like a robot, dance, act it out, or sing a duet.",
    "Then the others score the performance from 0 to 10. The average adds to the singer's score (and their duet partner's).",
    "Nothing is recorded: the phone's microphone is never used.",
    "You need internet for the clips (Deezer), but no account."
  ]),
  options: [
    { id: "turns", label: tr("Chansons par joueur", "Songs per player"), type: "seg", def: 2, values: [{ v: 1, label: "1" }, { v: 2, label: "2" }, { v: 3, label: "3" }] },
    { id: "packs", label: tr("Thèmes", "Themes"), type: "multi", def: ["top", "fr", "90s"], values: () => M().packs().map(t => ({ v: t.v, label: t.label, desc: t.desc, kid: t.kid })) },
    { id: "edit", type: "button", label: tr("Ajouter ma playlist Deezer", "Add my Deezer playlist"), onClick: () => M().editor() },
    { id: "defis", label: tr("Défis", "Challenges"), type: "toggle", text: tr("Défis", "Challenges"), desc: tr("Chuchoter, yaourt, opéra, accent, duo…", "Whisper, gibberish, opera, accent, duet…"), def: true }
  ],
  start(ctx, o){
    if(!A(o.packs).length) throw new Error(tr("Choisis au moins un thème.", "Pick at least one theme."));
    LOADING = "";
    return { phase: "load", order: shuffle(ctx.ids.slice()), ti: 0, turns: o.turns || 2, pts: {}, cnt: {}, ch: [], sel: -1, re: 0, df: "", duo: "", startAt: 0, res: null, err: "" };
  },
  host(ctx){
    const s = ctx.s, live = ctx.ids.filter(id => ctx.here(id)), singer = s.order[s.ti % Math.max(1, s.order.length)];
    if(s.phase === "load"){
      if(LOADING === ctx.g.gid) return; LOADING = ctx.g.gid;
      M().buildPool(ctx.opts.packs, 6).then(pool => ctx.act(c => { c.setPriv({ pool: pool.slice(0, Math.min(pool.length, c.s.order.length * c.s.turns * 6 + 6)) }); nextTurn(c, true); }))
        .catch(() => ctx.act(c => c.set({ phase: "err", err: LOAD_ERR })));
      return;
    }
    if(["pick", "ready", "sing"].indexOf(s.phase) >= 0 && !ctx.here(singer)){ nextTurn(ctx); return; }
    if(s.phase === "pick"){
      const i = ctx.input(singer);
      if(i && i.re && !s.re) reroll(ctx);
      else if(i && i.pick != null && A(s.ch)[+i.pick]) ctx.set({ phase: "ready", sel: +i.pick });
      return;
    }
    if(s.phase === "sing" && ctx.now() >= s.startAt + SING_MS){ ctx.set({ phase: "vote", startAt: ctx.now(), k: ctx.rid() }); return; }
    if(s.phase === "vote"){
      const voters = live.filter(id => id !== singer && id !== s.duo), got = voters.filter(id => { const i = ctx.input(id); return i && i.note != null; });
      if(got.length < voters.length && ctx.now() < s.startAt + VOTE_MS) return;
      closeVote(ctx);
    }
  },
  render(ctx, root){
    const s = ctx.s, me = ctx.me, singer = s.order[s.ti % Math.max(1, s.order.length)], total = s.order.length * s.turns, inp = ctx.mine() || {};
    const D = DEFIS.find(d => d.id === s.df) || null, partner = s.duo ? ctx.name(s.duo) : "", sel = A(s.ch)[s.sel];
    const head = CSS + '<span class="eyebrow">' + tr("Chanson ", "Song ") + Math.min(total, s.ti + 1) + " / " + total + '</span><div class="who">' + esc(ctx.name(singer)) + "</div>";
    const mine = singer === me || (s.duo && s.duo === me);
    if(s.phase === "load"){ screen(root, "ld" + s.k, CSS + '<div class="kr-mic on">♫</div><p class="wait" style="text-align:center">' + tr("Chargement des chansons…", "Loading the songs…") + "</p>"); return; }
    if(s.phase === "err"){
      screen(root, "er" + ctx.isHost, CSS + '<p class="note-box">' + esc(s.err) + "</p>" + SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : ""), r => {
        const b = r.querySelector("[data-back]"); if(b) b.addEventListener("click", () => ctx.act(c => c.end({ title: tr("Karaoké", "Karaoke"), lines: [] })));
      });
      return;
    }
    if(s.phase === "pick"){
      const can = singer === me || ctx.isHost;
      screen(root, "pk" + s.k + can + (inp.pick != null ? inp.pick : "") + s.re, head + defiHTML(D, partner) +
        '<p class="howto" style="text-align:center; margin:0">' + (singer === me ? tr("Choisis la chanson que tu connais le mieux :", "Pick the song you know best:") : tr("choisit sa chanson…", "is picking a song…")) + "</p>" +
        '<div class="kr-songs">' + A(s.ch).map((x, i) => songBtn(x, i, +inp.pick === i && inp.pick != null)).join("") + "</div>" +
        SB.u.dock(singer === me && !s.re ? '<button class="btn ghost" type="button" data-re>' + tr("Je n'en connais aucune : 3 autres", "I don't know any: 3 others") + "</button>" : '<p class="wait"></p>'), r => {
        r.querySelectorAll("[data-pick]").forEach(b => {
          if(!can){ b.disabled = true; return; }
          b.addEventListener("click", () => { buzz(10); const i = +b.dataset.pick; if(singer === me) ctx.send({ pick: i }); else ctx.act(c => { if(c.s.phase === "pick") c.set({ phase: "ready", sel: i }); }); });
        });
        const re = r.querySelector("[data-re]"); if(re) re.addEventListener("click", () => { ctx.send({ re: 1 }); re.disabled = true; });
      });
      return;
    }
    if(s.phase === "ready" || s.phase === "sing"){
      const sing = s.phase === "sing", sec = Math.max(0, Math.ceil((s.startAt + 30000 - ctx.now()) / 1000));
      screen(root, "sg" + s.k + s.phase + ctx.isHost, head + (sel ? '<div class="kr-songs">' + songBtn(sel, 0, true).replace("<button", '<button disabled') + "</div>" : "") + defiHTML(D, partner) +
        '<div class="kr-mic' + (sing ? " on" : "") + '">♫</div>' + (sing ? '<div class="kr-t" data-t>' + sec + "</div>" : "") +
        '<p class="howto" style="text-align:center">' + (sing ? (mine ? tr("Chante ! De mémoire, à fond.", "Sing! From memory, all out.") : tr("Écoutez bien, vous noterez juste après.", "Listen up, you'll score right after.")) : ctx.isHost ? tr("Monte le son, puis lance la musique.", "Turn the volume up, then start the music.") : tr("L'hôte va lancer la musique…", "The host is about to start the music…")) + "</p>" +
        SB.u.dock(ctx.isHost ? (sing ? '<button class="btn acc" type="button" data-done>' + tr("Fini : on note", "Done: score it") + "</button>" : '<button class="btn acc" type="button" data-play>' + tr("Lancer la musique", "Start the music") + "</button>") : '<p class="wait"></p>'), r => {
        const p = r.querySelector("[data-play]");
        if(p) p.addEventListener("click", () => {
          const ch = A(ctx.priv().ch)[s.sel]; M().play(ch && ch.p).then(ok => { if(!ok) SB.u.toast(tr("Le son n'a pas démarré : touche encore.", "Sound didn't start: tap again.")); });
          buzz(10); ctx.act(c => { if(c.s.phase === "ready") c.set({ phase: "sing", startAt: c.now() }); });
        });
        const d = r.querySelector("[data-done]"); if(d) d.addEventListener("click", () => { M().pause(); ctx.act(c => { if(c.s.phase === "sing") c.set({ phase: "vote", startAt: c.now(), k: c.rid() }); }); });
      });
      if(sing) txt(root, "[data-t]", String(sec));
      return;
    }
    if(s.phase === "vote"){
      if(ctx.isHost && root.dataset.krp !== s.k){ root.dataset.krp = s.k; M().pause(); }
      const voter = ctx.playing && !mine, live = ctx.ids.filter(id => ctx.here(id)), voters = live.filter(id => id !== singer && id !== s.duo);
      const sec = Math.max(0, Math.ceil((s.startAt + VOTE_MS - ctx.now()) / 1000));
      screen(root, "vt" + s.k + (inp.note != null ? inp.note : "") + voter + ctx.isHost, head + (voter ? '<p class="howto" style="text-align:center; margin:0">' + tr("Ta note pour cette prestation :", "Your score for this performance:") + "</p>" + notesHTML(inp.note != null ? +inp.note : -1) : '<div class="kr-mic">♫</div><p class="howto" style="text-align:center">' + tr("Les autres te notent…", "The others are scoring you…") + "</p>") +
        '<div class="kr-t" data-t>' + sec + "</div>" + SB.u.dock('<p class="wait" data-w></p>' + (ctx.isHost ? '<button class="btn ghost" type="button" data-close>' + tr("Clore le vote", "Close the vote") + "</button>" : "")), r => {
        r.querySelectorAll("[data-note]").forEach(b => b.addEventListener("click", () => { buzz(8); ctx.send({ note: +b.dataset.note }); }));
        const c0 = r.querySelector("[data-close]"); if(c0) c0.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "vote") closeVote(c); }));
      });
      txt(root, "[data-t]", String(sec));
      txt(root, "[data-w]", voters.filter(id => { const i = ctx.input(id); return i && i.note != null; }).length + " / " + voters.length + tr(" notes", " scores"));
      return;
    }
    if(s.phase === "res"){
      const R = s.res || {}, last = s.ti + 1 >= total;
      screen(root, "rs" + s.k + ctx.isHost, head + (R.avg == null ? '<p class="howto" style="text-align:center">' + tr("Personne n'a noté.", "Nobody scored.") + "</p>" : '<div class="kr-avg">' + fmt(R.avg) + "<small>/10</small></div>" + '<p class="sm" style="text-align:center">' + esc(A(R.notes).map(n => ctx.name(n[0]) + " " + n[1]).join(" · ")) + "</p>") +
        ranking(s.order, s.pts, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (last ? tr("Voir le classement", "See the standings") : tr("Chanteur suivant", "Next singer")) + "</button>" : '<p class="wait">' + tr("L'hôte passe à la suite…", "Waiting for the host…") + "</p>"), r => {
        const b = r.querySelector("[data-next]"); if(b) b.addEventListener("click", () => ctx.act(c => { if(c.s.phase === "res") nextTurn(c); }));
      });
      return;
    }
    if(s.phase === "end"){
      if(ctx.isHost) M().pause();
      const p = s.pts || {}, order = s.order.slice().sort((a, b) => (p[b] || 0) - (p[a] || 0));
      screen(root, "end" + ctx.isHost, CSS + '<span class="eyebrow">' + tr("Star du karaoké", "Karaoke star") + '</span><div class="who">' + esc(ctx.name(order[0])) + "</div>" + ranking(s.order, p, ctx.name) +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-back>' + tr("Retour au salon", "Back to the room") + "</button>" : '<p class="wait">' + tr("L'hôte va vous ramener au salon.", "The host will take you back to the room.") + "</p>"), r => {
        const b = r.querySelector("[data-back]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          const pp = c.s.pts || {}, o2 = c.s.order.slice().sort((a, b2) => (pp[b2] || 0) - (pp[a] || 0)), mx = pp[o2[0]] || 0;
          c.end({ title: tr("Karaoké : ", "Karaoke: ") + c.name(o2[0]), lines: o2.slice(0, 3).map((id, i) => (i + 1) + ". " + c.name(id) + " · " + fmt(pp[id] || 0) + " pts"), win: mx ? o2.filter(id => (pp[id] || 0) === mx) : [] });
        }));
      });
    }
  },

  /* ---------- Un seul téléphone ---------- */
  local: {
    players: { min: 2, max: 20 },
    start(root, api){
      const names = api.names, st = store();
      let sel = A(st.krPacks).length ? A(st.krPacks).slice() : ["top", "fr", "90s"], turns = [1, 2, 3].indexOf(st.krTurns) >= 0 ? st.krTurns : 2, dfOn = st.krDefis !== false;
      let pool = [], ti = 0, order = [], pts = {}, ch = [], re = 0, df = null, duo = "", gno = 0, tok = Math.random().toString(36).slice(2, 7), note = -1, timer = null;
      const total = () => order.length * turns, singer = () => order[ti % order.length];
      function setup(){
        M().pause();
        const packs = M().packs().filter(SB.packOk);
        screen(root, "su" + Math.random(), CSS + '<p class="howto">' + tr("Chacun son tour, le chanteur choisit une chanson, le téléphone joue la musique, et le groupe donne une note sur 10.", "Take turns: the singer picks a song, the phone plays the music, and the group gives a score out of 10.") + "</p>" +
          '<div class="field"><span class="eyebrow">' + tr("Chansons par joueur", "Songs per player") + '</span><div class="seg">' + [1, 2, 3].map(v => '<button type="button" data-tn="' + v + '" aria-pressed="' + (turns === v) + '">' + v + "</button>").join("") + "</div></div>" +
          '<div class="field"><span class="eyebrow">' + tr("Thèmes", "Themes") + '</span><div class="packs">' + packs.map(p => '<button type="button" class="pack" data-p="' + p.v + '" aria-pressed="' + (sel.indexOf(p.v) >= 0) + '"><span class="box">✓</span><span class="tx"><span class="nm">' + esc(p.label) + '</span><span class="ds">' + esc(p.desc) + "</span></span></button>").join("") + "</div>" +
          '<button class="link" type="button" data-ed style="align-self:flex-start">' + tr("Ajouter ma playlist Deezer", "Add my Deezer playlist") + "</button></div>" +
          '<div class="field"><div class="packs"><button type="button" class="pack" data-df aria-pressed="' + dfOn + '"><span class="box">✓</span><span class="tx"><span class="nm">' + tr("Défis", "Challenges") + '</span><span class="ds">' + tr("Chuchoter, yaourt, opéra, accent, duo…", "Whisper, gibberish, opera, accent, duet…") + "</span></span></button></div></div>" +
          SB.u.dock('<button class="btn acc" type="button" data-go>' + tr("Charger les chansons", "Load the songs") + "</button>"), r => {
          r.querySelectorAll("[data-tn]").forEach(b => b.addEventListener("click", () => { turns = +b.dataset.tn; persist({ krTurns: turns }); setup(); }));
          r.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { const i = sel.indexOf(b.dataset.p); if(i >= 0) sel.splice(i, 1); else sel.push(b.dataset.p); persist({ krPacks: sel }); setup(); }));
          r.querySelector("[data-df]").addEventListener("click", () => { dfOn = !dfOn; persist({ krDefis: dfOn }); setup(); });
          r.querySelector("[data-ed]").addEventListener("click", () => M().editor());
          r.querySelector("[data-go]").addEventListener("click", () => {
            if(!sel.length){ SB.u.toast(tr("Choisis au moins un thème", "Pick at least one theme")); return; }
            screen(root, "ld" + Math.random(), CSS + '<div class="kr-mic on">♫</div><p class="wait" style="text-align:center">' + tr("Chargement des chansons…", "Loading the songs…") + "</p>");
            M().buildPool(SB.okPacks(sel, M().packs()), 6).then(p => { pool = p; order = shuffle(names.slice()); ti = 0; pts = {}; gno++; turn(); }).catch(() => {
              screen(root, "le" + Math.random(), CSS + '<p class="note-box">' + esc(LOAD_ERR) + "</p>" + SB.u.dock('<button class="btn acc" type="button" data-b>' + tr("Retour", "Back") + "</button>"), r2 => r2.querySelector("[data-b]").addEventListener("click", setup));
            });
          });
        });
      }
      const head = () => CSS + '<span class="eyebrow">' + tr("Chanson ", "Song ") + (ti + 1) + " / " + total() + '</span><div class="who">' + esc(singer()) + "</div>";
      function draw3(){ ch = []; while(ch.length < 3 && pool.length) ch.push(pool.pop()); }
      function turn(){
        if(ti >= total()){ end(); return; }
        re = 0; draw3();
        if(!ch.length){ end(); return; }
        df = dfOn && Math.random() < .45 ? SB.u.twist(DEFIS, { last: df ? df.id : "", rate: 1 }) : null;
        if(df && df.id === "duo" && names.length < 2) df = null;
        duo = df && df.id === "duo" ? shuffle(names.filter(x => x !== singer()))[0] : "";
        pick();
      }
      function pick(){
        screen(root, "pk" + gno + ":" + ti + ":" + re, head() + defiHTML(df, duo) + '<p class="howto" style="text-align:center; margin:0">' + tr("Choisis la chanson que tu connais le mieux :", "Pick the song you know best:") + '</p><div class="kr-songs">' + ch.map((x, i) => songBtn(x, i, false)).join("") + "</div>" +
          SB.u.dock((!re && pool.length >= 3 ? '<button class="btn ghost" type="button" data-re>' + tr("Aucune : 3 autres", "None: 3 others") + "</button>" : "") + '<button class="link" type="button" data-q style="align-self:center">' + tr("Choisir un autre jeu", "Choose another game") + "</button>"), r => {
          r.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => { buzz(10); ready(ch[+b.dataset.pick]); }));
          const rr = r.querySelector("[data-re]"); if(rr) rr.addEventListener("click", () => { re = 1; draw3(); pick(); });
          r.querySelector("[data-q]").addEventListener("click", () => { M().pause(); api.exit(); });
        });
      }
      function ready(tk){
        screen(root, "rd" + gno + ":" + ti, head() + '<div class="kr-songs">' + songBtn(tk, 0, true).replace("<button", "<button disabled") + "</div>" + defiHTML(df, duo) + '<div class="kr-mic">♫</div><p class="howto" style="text-align:center">' + tr("Monte le son, et à toi !", "Turn it up, and go!") + "</p>" +
          SB.u.dock('<button class="btn acc" type="button" data-play>' + tr("Lancer la musique", "Start the music") + "</button>"), r => {
          r.querySelector("[data-play]").addEventListener("click", () => { buzz(10); M().play(tk.p); sing(tk); });
        });
      }
      function sing(tk){
        const t0 = Date.now();
        screen(root, "sg" + gno + ":" + ti, head() + '<div class="kr-songs">' + songBtn(tk, 0, true).replace("<button", "<button disabled") + "</div>" + defiHTML(df, duo) + '<div class="kr-mic on">♫</div><div class="kr-t" data-t>30</div>' +
          SB.u.dock('<button class="btn acc" type="button" data-done>' + tr("Fini : on note", "Done: score it") + "</button>"), r => {
          r.querySelector("[data-done]").addEventListener("click", () => { clearInterval(timer); M().pause(); note = -1; rate(); });
        });
        clearInterval(timer);
        timer = setInterval(() => { const left = Math.max(0, Math.ceil((t0 + 30000 - Date.now()) / 1000)); txt(root, "[data-t]", String(left)); if(left <= 0) clearInterval(timer); }, 300);
      }
      function rate(){
        screen(root, "rt" + gno + ":" + ti + ":" + note, head() + '<p class="howto" style="text-align:center; margin:0">' + tr("La note du groupe pour cette prestation :", "The group's score for this performance:") + "</p>" + notesHTML(note) +
          SB.u.dock('<button class="btn acc" type="button" data-ok' + (note < 0 ? " disabled" : "") + ">" + tr("Valider la note", "Confirm the score") + "</button>"), r => {
          r.querySelectorAll("[data-note]").forEach(b => b.addEventListener("click", () => { buzz(8); note = +b.dataset.note; rate(); }));
          r.querySelector("[data-ok]").addEventListener("click", () => { if(note >= 0) result(); });
        });
      }
      function result(){
        const who = [singer()].concat(duo ? [duo] : []);
        who.forEach(x => { pts[x] = (pts[x] || 0) + note; });
        const ev = note < 5 ? "flop" : note >= 8 ? "star" : "";
        if(ev && api.gage) api.gage(who.map(x => ({ id: x, ev })), "kr" + tok + "-" + gno + ":" + ti);
        const last = ti + 1 >= total();
        screen(root, "rs" + gno + ":" + ti, head() + '<div class="kr-avg">' + note + "<small>/10</small></div>" + ranking(order, pts, z => z) +
          SB.u.dock('<button class="btn acc" type="button" data-n>' + (last ? tr("Voir le classement", "See the standings") : tr("Chanteur suivant", "Next singer")) + "</button>"), r => {
          r.querySelector("[data-n]").addEventListener("click", () => { ti++; turn(); });
        });
      }
      function end(){
        M().pause(); clearInterval(timer);
        const o = order.slice().sort((a, b) => (pts[b] || 0) - (pts[a] || 0)), mx = pts[o[0]] || 0;
        if(api.win) api.win(mx ? o.filter(x => (pts[x] || 0) === mx) : []);
        screen(root, "end" + gno, CSS + '<span class="eyebrow">' + tr("Star du karaoké", "Karaoke star") + '</span><div class="who">' + esc(o[0] || "") + "</div>" + ranking(order, pts, z => z) +
          SB.u.dock('<button class="btn acc" type="button" data-a>' + tr("Rejouer", "Play again") + '</button><button class="btn ghost" type="button" data-q>' + tr("Choisir un autre jeu", "Pick another game") + "</button>"), r => {
          r.querySelector("[data-a]").addEventListener("click", api.again);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      }
      setup();
    }
  }
});
// Tour suivant (chez l'hôte) : 3 chansons pour le chanteur, un défi de temps en temps.
function nextTurn(c, first){
  const s = c.s, pv = c.priv(), pool = A(pv.pool).slice();
  let ti = first ? 0 : s.ti + 1;
  const total = s.order.length * s.turns;
  while(ti < total && !c.here(s.order[ti % s.order.length])) ti++;
  if(ti >= total || pool.length < 1){ M().pause(); c.set({ phase: "end", ti: Math.min(ti, total - 1) }); return; }
  const singer = s.order[ti % s.order.length], ch = [];
  while(ch.length < 3 && pool.length) ch.push(pool.pop());
  let d = c.opts.defis !== false && Math.random() < .45 ? SB.u.twist(DEFIS, { last: s.df, rate: 1 }) : null;
  const others = c.ids.filter(id => id !== singer && c.here(id));
  if(d && d.id === "duo" && others.length < 2) d = null; // il faut au moins un autre joueur pour noter
  const duo = d && d.id === "duo" ? shuffle(others)[0] : "";
  c.setPriv({ pool, ch });
  c.set({ phase: "pick", ti, ch: ch.map(pub), sel: -1, re: 0, df: d ? d.id : "", duo, res: null, startAt: 0, k: c.rid() });
}
function reroll(c){
  const pv = c.priv(), pool = A(pv.pool).slice(), ch = [];
  while(ch.length < 3 && pool.length) ch.push(pool.pop());
  if(!ch.length){ c.set({ re: 1 }); return; }
  c.setPriv({ pool, ch });
  c.set({ ch: ch.map(pub), re: 1, k: c.rid() });
}
function closeVote(c){
  const s = c.s, singer = s.order[s.ti % s.order.length], live = c.ids.filter(id => c.here(id));
  const notes = live.filter(id => id !== singer && id !== s.duo).map(id => { const i = c.input(id); return i && i.note != null ? [id, Math.max(0, Math.min(10, +i.note))] : null; }).filter(Boolean);
  const avg = notes.length ? notes.reduce((a, n) => a + n[1], 0) / notes.length : null, pts = Object.assign({}, s.pts), who = [singer].concat(s.duo ? [s.duo] : []);
  if(avg != null){
    who.forEach(id => { pts[id] = Math.round(((pts[id] || 0) + avg) * 10) / 10; });
    const ev = avg < 5 ? "flop" : avg >= 8 ? "star" : "";
    if(ev) c.gage(who.map(id => ({ id, ev })), s.k);
  }
  c.set({ phase: "res", pts, res: { avg, notes } });
}
})();
