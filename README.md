# Soirée Box

Une plateforme de jeux de soirée sur mobile. On crée un salon, les potes le rejoignent avec un code de 4 lettres, et on enchaîne les jeux sans quitter le salon. Chaque jeu se joue aussi sur un seul téléphone qu'on se passe.

## Les jeux

Les jeux qui ont du contenu adulte le regroupent dans un seul paquet **Adultes (18+)** : sexe, porno, tabous, humour noir. Il est décoché par défaut, et l'hôte l'active dans la fiche du jeu.

| Jeu | Joueurs | Principe |
|---|---|---|
| **Note sur 10** | 2–12 | Faire deviner une note secrète avec des exemples. Paquets Classique, Pop culture, Situations absurdes, Adultes, et tes catégories perso. |
| **Undercover** | 3–16 | Tout le monde a le même mot, sauf les intrus. Indices, votes, éliminations. |
| **Qui est le plus…** | 3–20 | Une question, chacun vote pour un joueur. Le plus désigné repart avec le titre de la soirée. |
| **Tu préfères** | 2–20 | Deux choix, chacun vote en secret. Bilan : duo le plus d'accord, joueur le plus à contre-courant. |
| **Mots interdits** | 4–20 | Deux équipes, chrono, faire deviner sans dire les mots interdits. L'équipe adverse buzze. |
| **Priorités** | 2–16 | Un joueur classe 5 trucs au hasard, du préféré au plus détesté. Les autres devinent son ordre (version coopérative sur un seul téléphone). |
| **Red Flag** | 2–20 | « Red ou green ? » : chacun vote red, beige ou green flag sur un trait de ton date. « Tu restes ou tu pars ? » : un date parfait, puis 5 red flags un par un. |
| **Photo roulette** | 3–12 | Le jeu tire des photos au hasard dans la galerie de chacun (avec son accord, en surprise ou à vérifier avant), une s'affiche : c'est à qui ? En réseau, une photo ne quitte le téléphone qu'au moment où elle s'affiche (chiffrée, jamais gardée par les serveurs), et tout est effacé à la fin. |
| **Test de pureté** | 1–20 | Plus de 370 « As-tu déjà… ? » en 8 thèmes, dont Hardcore 18+. Score secret, classement de l'ange au démon, puis les aveux. |
| **Killer** | 4–20 | Chacun reçoit en secret une cible et une mission (« fais-lui dire ananas »). Mission réussie : la victime confirme et tu récupères sa cible. Une accusation par joueur pour démasquer son chasseur. Tourne toute la soirée en fond. |
| **Qui a dit ça ?** | 3–12 | Chacun répond en secret à une question, les réponses s'affichent sans les noms, tout le monde devine l'auteur. Points pour les bons détectives et pour ceux qui bernent les autres. |
| **Défis en chaîne** | 2–20 | Des cartes qui citent les joueurs par leur prénom : défis, votes, mini-jeux et règles qui durent quelques cartes. Avec gorgées ou sans alcool (gages). |
| **Loup-garou** | 5–18 | Rôles secrets (loups, voyante, sorcière, chasseur), nuits et votes gérés par l'appli. Sur un seul téléphone, l'appli devient l'assistant du meneur. |
| **Dernière carte** | 2–10 | Le jeu de cartes des couleurs : même couleur ou même valeur, +2, +4, inversion, passe-tour, cumul des pénalités en option. Crie « Dernière ! » ou tu pioches 2. Sur un seul téléphone : contre 1 à 3 robots, ou en se passant le téléphone. |
| **Roulette des menteurs** | 2–6 | La table annonce Rois, Dames ou As. On pose 1 à 3 cartes face cachée en bluffant, le suivant peut crier « Menteur ! ». Celui qui a tort tire au revolver (6 chambres, 1 balle). Dernier survivant gagne. Contre des robots sur un seul téléphone. |
| **Punchline** | 3–12 | Une phrase à trous, 7 cartes réponses en main : chacun complète en secret, le juge (tour à tour) garde la plus drôle. Cartes blanches à écrire soi-même, coups de théâtre. Paquets Classique, Hard (18+) et Humour noir (18+). Aussi sur un seul téléphone. |
| **Action ou vérité** | 2–16 | Chacun son tour : une vérité à avouer (+1) ou une action à faire (+2). Refuser coûte des gorgées ou un gage, 2 jokers par partie. Niveaux Classique, Hot (18+) et Hard (18+), en progressif ou au hasard. Coups de théâtre et trophées. Aussi sur un seul téléphone. |

## Installer

- **Android** : installe `android/SoireeBox.apk`. Si Android le demande, autorise l'installation d'applis de source inconnue. Si Play Protect avertit, choisis « Installer quand même ».
- **iPhone et autres** : mets le dossier `www` en ligne (voir plus bas), ouvre le lien dans Safari, puis Partager → « Sur l'écran d'accueil ».

Les deux versions peuvent jouer ensemble dans le même salon, à condition d'utiliser le même moteur réseau (même `firebase-config.js`, laissé à `null` par défaut).

## Le réseau

Par défaut, **rien à configurer** : chaque téléphone a juste besoin d'internet, peu importe lequel. Un joueur en wifi, un autre en 4G, un troisième en partage de connexion : tout le monde est dans le même salon.

Comment ça marche (relais Internet) :
- Les téléphones ne se connectent pas entre eux. Chacun ouvre une connexion sortante sécurisée (WebSocket, comme un site web) vers plusieurs serveurs relais MQTT publics et gratuits en même temps : EMQX, HiveMQ, Mosquitto et shiftr.io.
- Tous les messages partent sur tous les serveurs : si l'un est en panne ou bloqué, les autres prennent le relais.
- Les messages sont chiffrés (AES-GCM) avec une clé tirée du code du salon : les serveurs ne voient pas le contenu.
- L'hôte fait foi. S'il ferme l'appli, perd le réseau ou met son téléphone en veille, le joueur suivant reprend la main au bout d'environ 10 s (2 s s'il quitte avec le bouton Quitter), sans perdre la partie. Quand l'ancien hôte revient, il redevient un joueur normal.
- Si le réseau d'un joueur coupe quelques secondes, il se reconnecte tout seul.

Option : tu peux à la place utiliser ton propre projet Firebase (base de données Google, gratuite), si tu préfères ne pas dépendre des serveurs publics.

| | Relais Internet (par défaut) | Firebase (option) |
|---|---|---|
| Activation | Rien à faire | Coller ta config Firebase |
| Wifi, 4G/5G, réseaux différents | Oui | Oui |
| L'hôte quitte ou se met en veille | Un autre joueur reprend la main | Un autre joueur reprend la main |
| Dépend de | Serveurs publics gratuits (4 en parallèle) | Ton projet Firebase |

### Activer Firebase (option, gratuit, environ 10 minutes)
1. Sur https://console.firebase.google.com, clique sur **Créer un projet** (par exemple `soiree-box`). Google Analytics n'est pas nécessaire.
2. Va dans **Créer → Realtime Database → Créer une base de données**. Choisis l'emplacement **Belgique (europe-west1)** et le mode **verrouillé**.
3. Dans l'onglet **Règles** de la base, remplace tout par le contenu de `database.rules.json`, puis clique sur **Publier**.
4. Va dans **Créer → Authentication → Commencer**, puis l'onglet **Mode de connexion**. Active **Anonyme** et enregistre.
5. Va dans **Paramètres du projet** (roue dentée), section **Vos applications**. Clique sur l'icône **Web `</>`** et donne un surnom à l'appli. Copie le bloc `firebaseConfig`, en vérifiant qu'il contient bien `databaseURL`.
6. Dans `www/firebase-config.js`, remplace `null` par cette configuration.
7. Republie : remets `www` en ligne, et recompile l'APK (`./android/build.sh`).

Les valeurs de la config ne sont pas secrètes. La sécurité vient des règles de l'étape 3.

## Signaler un bug
Un bouton « Signaler un bug » (icône d'insecte) est en haut du salon et des parties, et un lien est en bas de l'accueil. Quand une erreur se produit, un rappel « Un souci ? Signaler le bug » apparaît quelques secondes.

Le joueur choisit le type de problème (plante, réseau, règles, affichage, autre), décrit ce qui s'est passé, puis :
- **Envoyer par mail** ouvre son appli mail avec le rapport prêt à envoyer à l'adresse `BUG_MAIL` de `www/core.js`. Pour la changer sans toucher au code, définis `window.SB_BUG_MAIL` avant `core.js`.
- **Partager** ou **Copier** permettent de l'envoyer par WhatsApp, SMS, etc.

Le rapport contient automatiquement :
- la version de l'appli, le téléphone, l'écran et le type de connexion ;
- le jeu en cours, sa phase et ses options ;
- le mode réseau, le nombre de serveurs joignables et le rôle d'hôte ou de joueur ;
- les dernières erreurs et les 15 derniers évènements (écrans, réseau, phases de jeu).

Ces informations sont gardées sur le téléphone même après un plantage. Le joueur peut décocher « Joindre les infos techniques ».

## Mettre la version web en ligne
- **Netlify Drop**, le plus simple : glisse le dossier `www` sur https://app.netlify.com/drop.
- **GitHub Pages** : pousse ce dossier sur GitHub, puis va dans **Settings → Pages → Source : GitHub Actions**. Le workflow `.github/workflows/pages.yml` publie `www` à chaque push.

## Mises à jour sans réinstaller l'APK
L'appli Android vérifie au démarrage s'il existe une nouvelle version sur `https://qapinext-john.github.io/soiree-box/` (réglable dans `release.json`). On peut aussi la chercher à la main avec le lien « Vérifier les mises à jour » en bas de l'accueil.
- **Nouveaux jeux, cartes, corrections** : un bouton « Mettre à jour maintenant » télécharge seulement les fichiers modifiés, en quelques secondes. Chaque fichier est vérifié par son empreinte SHA-256, puis l'appli redémarre sur la nouvelle version, sans réinstallation et sans perdre de données.
- **Changement de la partie Android** (dossier `android/src`, rare) : l'appli propose de télécharger le nouvel APK. Android l'installe par-dessus l'ancien et garde les réglages, car l'APK est signé avec la même clé.

Pour publier une nouvelle version :
1. Change `VERSION` dans `www/core.js` (par exemple `"4.3"`) et ajoute les nouveautés dans `NOUVEAUTES.json`.
2. Lance `python3 tools/release.py`. Il écrit `www/version.json` et met à jour `sw.js` et le numéro de version de l'APK.
3. Si tu as modifié `android/src` : augmente `versionCode` dans `android/AndroidManifest.xml` et `apkMin` dans `release.json`, puis lance `./android/build.sh`.
4. Fais un `git push`. GitHub Pages met tout en ligne, et les applis installées proposent la mise à jour.

Ne publie jamais le dossier `android/signing/` (il est dans `.gitignore`). Sans cette clé, plus aucune mise à jour de l'APK n'est possible.

## Recompiler l'APK
Sur Linux ou WSL :
```bash
sudo apt install aapt dalvik-exchange zipalign apksigner libandroid-23-java default-jdk python3-pil
./android/build.sh
```
- La clé de signature est dans `android/signing/`. Garde-la précieusement : les téléphones n'acceptent une mise à jour que si elle est signée avec la même clé. Ne la publie jamais (elle est exclue de Git).
- Pour publier une nouvelle version, augmente `versionCode` et `versionName` dans `android/AndroidManifest.xml`.

## Ajouter un jeu
Voir **AJOUTER-UN-JEU.md**. En résumé, tu copies `www/games/_modele.js`, tu écris ton jeu, puis tu ajoutes une ligne dans `index.html` et une dans `sw.js`. Le salon, le réseau, la reprise d'hôte et le mode un seul téléphone sont gérés par la plateforme.

## Contenu du dossier
| Élément | Rôle |
|---|---|
| `www/index.html` | Écrans et design de la plateforme |
| `www/core.js` | Cœur : salon, réseau (relais Internet ou Firebase), reprise d'hôte, mode un seul téléphone |
| `www/games/*.js` | Un fichier par jeu (`_modele.js` est le modèle, il n'est pas chargé) |
| `www/firebase-config.js` | Ta configuration Firebase (option, `null` par défaut) |
| `www/firebase-*-compat.js` | Bibliothèque Firebase 12.18 (licence Apache 2.0), utilisée seulement si Firebase est configuré |
| `www/fonts/` | Polices Bricolage Grotesque et Figtree (licence SIL OFL), incluses pour jouer hors ligne |
| `www/manifest.webmanifest`, `www/sw.js` | Installation en appli web et cache hors ligne |
| `database.rules.json` | Règles de sécurité Firebase |
| `android/` | Appli Android : `SoireeBox.apk`, sources, `build.sh`, clé de signature |

## Langues

L'appli existe en français et en anglais (choix en bas de l'accueil, gardé sur le téléphone ; par défaut la langue du téléphone). Dans le code : `tr("texte français", "English text")`. En réseau, le contenu des parties suit la langue de l'hôte (`ctx.s.lg`), l'interface celle de chaque téléphone.
