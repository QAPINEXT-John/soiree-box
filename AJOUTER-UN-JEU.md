# Ajouter un jeu à Soirée Box

Chaque jeu est un fichier JavaScript dans `www/games/`. La plateforme s'occupe du reste :
- le salon et le code d'invitation ;
- les joueurs et le réseau ;
- la reprise d'hôte ;
- l'écran allumé ;
- le retour au salon ;
- l'écran « un seul téléphone ».

## En 3 étapes
1. Copie `www/games/_modele.js` en `www/games/monjeu.js`, et change `id` (minuscules, sans espace) ainsi que `name`.
2. Dans `www/index.html`, ajoute la ligne `<script src="games/monjeu.js"></script>` sous les autres jeux.
3. Dans `www/sw.js`, ajoute `"games/monjeu.js"` à la liste `FILES`, puis change le nom du `CACHE` (par exemple `soireebox-v2`).

Ensuite, republie `www` et recompile l'APK avec `./android/build.sh`.

## Ce que contient un jeu

```js
SB.register({
  id, name, glyph, pitch, tag, accent: { light, dark },  // identité, phrase courte de la tuile, description, couleur
  min, max, hot, rules: [...],                      // nombre de joueurs, badge 18+, règles
  options: [...],                                   // réglages de l'hôte dans le salon
  start(ctx, options) { return étatDeDépart },      // chez l'hôte, au lancement
  host(ctx) { ... },                                // chez l'hôte, fait avancer la partie
  render(ctx, root) { ... },                        // chez chaque joueur, affiche l'écran
  ticks: false,                                     // true si le jeu a un chrono à rafraîchir
  local: { players: {min, max}, start(root, api) }  // facultatif : version un seul téléphone
});
```

## Les outils du contexte `ctx`

| Outil | Rôle |
|---|---|
| `ctx.s` | État partagé de la partie (lecture) |
| `ctx.set({...})` | Hôte : modifier l'état |
| `ctx.players`, `ctx.ids`, `ctx.name(id)`, `ctx.here(id)` | Joueurs, leurs prénoms, présents ou non |
| `ctx.me`, `ctx.isHost` | Qui je suis, et si je suis l'hôte |
| `ctx.send({...})` | Joueur : envoyer sa réponse |
| `ctx.input(id)`, `ctx.mine()` | Lire une réponse (celles qui datent d'avant le dernier changement de `s.k` sont ignorées) |
| `ctx.rid()` | Nouvel identifiant, à utiliser pour `k` à chaque nouvelle manche |
| `ctx.priv()`, `ctx.setPriv({...})` | Données de l'hôte non affichées, comme une pioche |
| `ctx.now()` | Heure synchronisée entre les téléphones, pour les chronos |
| `ctx.act(c => ...)` | Bouton réservé à l'hôte : agir sur l'état le plus récent |
| `ctx.end({ title, lines, win })` | Terminer la partie et revenir au salon avec un résumé. `win` : identifiants des gagnants (alimente le classement de la soirée) |

`SB.u.screen(root, clé, html, bind)` ne reconstruit l'écran que si la clé change, pour ne pas effacer ce qu'un joueur est en train de taper. Les classes CSS prêtes à l'emploi sont : `card`, `big`, `huge`, `btn`, `btn acc`, `choices`/`opt`, `ab`, `bars`/`bar`, `list`, `chips`/`chip`, `timer`, `pass`/`who`, `verdict`.

## Rejouabilité (à utiliser dans chaque jeu)

- `SB.u.fresh("monjeu:questions", POOL)` remplace `shuffle(POOL)` : ce qui n'a jamais été vu sur ce téléphone sort en premier (tirage avec `pop()`). `SB.u.fresh(clé, POOL, true)` pour un tirage avec `splice(0, n)`.
- `SB.u.saw("monjeu:questions", item)` quand l'élément est vraiment montré.
- Coups de théâtre : une liste `[{ id, name, desc, ok? }]`, puis `SB.u.twist(LISTE, { rate: .35, last: idPrécédent })` au début d'une manche (jamais à la première). On garde seulement `id` dans l'état, on retrouve l'objet avec `SB.u.byTwist(LISTE, id)` et on affiche `SB.u.twistHTML(t)` en haut de la manche. Prévoir une option `twists` (activée par défaut).
- Un seul téléphone : `api.win([noms])` à la fin d'une partie pour le classement de la soirée.

## Types d'options
- `seg` : un choix parmi plusieurs valeurs, par exemple le nombre de manches.
- `toggle` : oui ou non, par exemple « Ajouter les questions hot ». Ajoute `hot: true` pour afficher le badge 18+.
- `multi` : plusieurs paquets à cocher. `values` peut être une fonction `ctx => [...]`.
- `button` : un lien qui ouvre une page annexe (`onClick`), par exemple un éditeur de contenu.
