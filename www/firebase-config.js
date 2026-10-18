// Configuration Firebase de Soirée Box (OPTIONNELLE).
//
// Tant que cette valeur reste à null, le mode réseau passe par le relais Internet intégré :
// rien à configurer, ça marche sur tous les réseaux (wifi, 4G/5G, réseaux différents),
// avec reprise d'hôte automatique. Voir README.md, section « Le réseau ».
//
// Si tu préfères utiliser ton propre projet Firebase, remplace null par sa configuration
// (guide pas à pas dans README.md).
//
// Exemple :
// window.FIREBASE_CONFIG = {
//   apiKey: "AIza...",
//   authDomain: "soiree-box-xxxx.firebaseapp.com",
//   databaseURL: "https://soiree-box-xxxx-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "soiree-box-xxxx",
//   appId: "1:1234567890:web:abcdef"
// };

window.FIREBASE_CONFIG = null;
