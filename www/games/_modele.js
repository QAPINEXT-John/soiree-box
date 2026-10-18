/* MODÈLE DE JEU — copie ce fichier pour créer un nouveau jeu.
   Exemple minimal mais complet : « J'ai déjà / Jamais ». Une phrase s'affiche,
   chacun répond en secret, puis on voit qui a déjà fait quoi.

   Pour l'activer :
   1. Copie ce fichier en games/monjeu.js et change l'id (lettres minuscules, sans espace).
   2. Dans index.html, ajoute <script src="games/monjeu.js"></script> avec les autres jeux.
   3. Dans sw.js, ajoute "games/monjeu.js" à la liste FILES et change le nom du CACHE.

   Comment ça marche :
   - L'état de la partie (ctx.s) est partagé avec tout le monde. Seul l'hôte le modifie, avec ctx.set({...}).
   - Chaque joueur envoie ses réponses avec ctx.send({...}). L'hôte les lit avec ctx.input(idDuJoueur).
   - Les réponses sont liées à ctx.s.k : quand l'hôte change k (ctx.rid()), les anciennes réponses sont oubliées.
   - host(ctx) est appelé chez l'hôte à chaque changement : il fait avancer la partie.
   - render(ctx, root) est appelé chez chacun : il affiche l'écran. screen(root, clé, html, bind)
     ne reconstruit l'écran que si la clé change, ce qui évite d'effacer ce que le joueur tape.
   - Les boutons réservés à l'hôte passent par ctx.act(c => ...) pour agir sur l'état le plus récent.
   - ctx.end({ title, lines, win }) termine la partie et ramène tout le monde au salon (win : ids des gagnants).
   - Rejouabilité : SB.u.fresh / SB.u.saw (pas de répétition d'une soirée à l'autre), SB.u.twist / SB.u.twistHTML (coups de théâtre).
   - SB.u.dock(html) place les boutons principaux dans la barre collée en bas de l'écran, sous le pouce. */
(function(){
"use strict";
const { esc, A, shuffle, screen, txt } = SB.u;

const PHRASES = [
  "J'ai déjà dormi dans une gare", "J'ai déjà menti sur mon âge", "J'ai déjà raté un avion",
  "J'ai déjà chanté sous la douche à fond", "J'ai déjà oublié l'anniversaire d'un proche"
];

SB.register({
  id: "modele",                       // identifiant unique, sans espace
  name: "J'ai déjà",                  // nom affiché
  glyph: "Déjà ?",                    // petit mot affiché en gros sur la tuile
  pitch: "Qui a déjà osé ? Répondez en secret.", // une phrase courte sous le nom, sur l'accueil
  accent: { light: "#b5179e", dark: "#f07ad8" },  // couleur du jeu (thème clair / sombre)
  tag: "Une phrase, chacun répond en secret. Qui a déjà osé ?",
  min: 2, max: 20,                    // nombre de joueurs
  hot: false,                         // true si le jeu a une option 18+
  rules: ["Une phrase s'affiche.", "Chacun répond « Déjà » ou « Jamais » en secret.", "On découvre les réponses de tout le monde."],

  // Options réglées par l'hôte dans le salon. Types : "seg", "toggle", "multi", "button".
  options: [
    { id: "rounds", label: "Phrases", type: "seg", def: 5, values: [{ v: 3, label: "3" }, { v: 5, label: "5" }] }
  ],

  // Lancement (chez l'hôte) : renvoie l'état de départ. ctx.players = [{id, name}].
  start(ctx, o){
    const deck = shuffle(PHRASES);
    ctx.setPriv({ deck });            // données gardées par l'hôte (pioche), invisibles à l'écran
    return { phase: "vote", q: deck.pop(), round: 1, rounds: o.rounds || 5, yes: [], no: [] };
  },

  // Arbitrage (chez l'hôte) : quand tous les joueurs présents ont répondu, on montre le résultat.
  host(ctx){
    const s = ctx.s;
    if(s.phase !== "vote") return;
    const live = ctx.ids.filter(id => ctx.here(id));
    if(!live.length || !live.every(id => ctx.input(id))) return;
    ctx.set({ phase: "res", yes: live.filter(id => ctx.input(id).r === "y"), no: live.filter(id => ctx.input(id).r === "n") });
  },

  // Affichage (chez chaque joueur).
  render(ctx, root){
    const s = ctx.s;
    if(s.phase === "vote"){
      screen(root, "v" + s.k, '<span class="eyebrow">Phrase ' + s.round + " / " + s.rounds + '</span><div class="card acc"><div class="big">' + esc(s.q) + "</div></div>" +
        SB.u.dock('<div class="row"><button class="btn ok" type="button" data-r="y">Déjà</button><button class="btn ghost" type="button" data-r="n">Jamais</button></div><p class="wait" data-wait></p>'), r => {
        r.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => ctx.send({ r: b.dataset.r })));
      });
      const live = ctx.ids.filter(id => ctx.here(id));
      txt(root, "[data-wait]", live.filter(id => ctx.input(id)).length + " / " + live.length + " réponses");
    } else if(s.phase === "res"){
      screen(root, "r" + s.k + ctx.isHost, '<div class="card acc"><div class="big">' + esc(s.q) + "</div></div>" +
        '<div class="card"><span class="eyebrow">Déjà</span><b>' + esc(A(s.yes).map(ctx.name).join(", ") || "Personne") + '</b><span class="eyebrow">Jamais</span><b>' + esc(A(s.no).map(ctx.name).join(", ") || "Personne") + "</b></div>" +
        SB.u.dock(ctx.isHost ? '<button class="btn acc" type="button" data-next>' + (s.round >= s.rounds ? "Terminer" : "Phrase suivante") + "</button>" : '<p class="wait">L\'hôte passe à la suite…</p>'), r => {
        const b = r.querySelector("[data-next]");
        if(b) b.addEventListener("click", () => ctx.act(c => {
          if(c.s.round >= c.s.rounds){ c.end({ title: "J'ai déjà · " + c.s.rounds + " phrases", lines: [] }); return; }
          const deck = A(c.priv().deck); const q = deck.pop() || PHRASES[0]; c.setPriv({ deck });
          c.set({ phase: "vote", q, round: c.s.round + 1, yes: [], no: [], k: c.rid() });
        }));
      });
    }
  },

  // Facultatif : version « un seul téléphone ». Retire ce bloc si ton jeu ne s'y prête pas.
  local: {
    // players: { min: 2, max: 12 },   // décommente pour demander les prénoms avant de jouer (api.names)
    start(root, api){
      let deck = shuffle(PHRASES);
      const go = () => {
        const q = deck.pop(); if(!q){ deck = shuffle(PHRASES); return go(); }
        screen(root, "q" + Math.random(), '<div class="card acc"><div class="big">' + esc(q) + '</div></div><p class="howto">Levez la main si vous l\'avez déjà fait !</p><div class="dock"><button class="btn acc" type="button" data-n>Suivante</button><button class="link" type="button" data-q style="align-self:center">Choisir un autre jeu</button></div>', r => {
          r.querySelector("[data-n]").addEventListener("click", go);
          r.querySelector("[data-q]").addEventListener("click", api.exit);
        });
      };
      go();
    }
  }
});
})();
