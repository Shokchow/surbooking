# Simulateur d’équilibrage

Fait jouer des milliers de parties entre bots (draft puis duels) avec le **vrai moteur du jeu**,
puis rédige un rapport en français : cartes trop fortes ou trop faibles, familles dominantes,
taux de victoire par classe, et ajustements chiffrés testés en simulation.

Le moteur n’est pas recopié : `moteur.js` le charge directement depuis `index.html` à la racine
du dépôt. Le simulateur suit donc toujours la version publiée du jeu, et ne modifie aucun fichier
du jeu (les variantes de cartes n’existent que dans sa mémoire, le temps d’un test).

Le dernier rapport : [RAPPORT.md](RAPPORT.md).

## Utilisation

Node 18 ou plus récent, aucune dépendance à installer. Depuis ce dossier :

```bash
node simuler.js --tables 1200
```

```bash
node analyse.js
```

```bash
node ajustements.js
```

```bash
node ajustements-classes.js
```

```bash
node rapport.js
```

| Étape | Rôle | Sortie |
|---|---|---|
| `simuler.js` | Joue les tables en parallèle (un fil par cœur, `--fils N` pour changer). Une table = 4 bots, drafts des étages 1 à 4, 12 duels par étage, draft et duels de finale (52 duels). `--depart` change la première graine. | `resultats/duels.jsonl` (non versionné, ~25 Mo pour 1 200 tables) |
| `analyse.js` | Taux de victoire (Wilson 95 %), modèle logistique de l’effet propre de chaque carte et de chaque classe. | `resultats/synthese.json` |
| `ajustements.js` | Pour les cartes signalées (`--cartes 8` de chaque côté), rejoue jusqu’à `--echantillon 600` duels avec plusieurs variantes chiffrées et retient la plus équilibrée. | `resultats/ajustements.json` |
| `ajustements-classes.js` | Même chose pour les classes à plus de 2 points de 50 % : PV de la classe, puis chiffres de ses cartes de base. | `resultats/ajustements-classes.json` |
| `rapport.js` | Rédige le rapport ; insère `commentaire.md` (lecture rédigée à la main) après le résumé. | `RAPPORT.md` |

Compter environ 0,65 s par table sur 4 cœurs (13 min pour 1 200 tables), une douzaine de minutes pour les ajustements de cartes et 5 pour ceux des classes.

## Fichiers

- `moteur.js` : charge le moteur depuis `index.html` (script qui contient `SURBOOKING_ENGINE_FP`).
- `bot.js` : bot de combat, le même pour les deux camps (anticipation sur copie de la partie, puis fin de tour gloutonne).
- `partie.js` : déroulé d’une table (drafts, duels d’étage, finale).
- `simuler.js`, `analyse.js`, `ajustements.js`, `ajustements-classes.js`, `rapport.js` : voir ci-dessus.
- `commentaire.md` : la lecture des résultats, rédigée à la main ; à mettre à jour après une nouvelle simulation.

## Limites

Le bot ne pense qu’à son tour : il sous-estime les cartes de mise en place et surestime les effets
immédiats. Les decks viennent de l’IA de draft du jeu, pas de joueurs humains. Seuls les duels
entre postulants sont simulés, pas les combats contre les monstres de l’arche. Le rapport donne des
signaux à confirmer en jeu, pas des verdicts.
