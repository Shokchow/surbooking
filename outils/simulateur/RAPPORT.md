# Rapport d’équilibrage de Surbooking (simulation de bots)

Jeu 0.87.2 (empreinte du moteur `15da6f0efef6`). Rapport généré le 2026-11-04.
**1 200 tables** de 4 bots, soit **62 400 duels**, jouées par `outils/simulateur`.

> Aucune carte n’a été modifiée dans le jeu. Les ajustements proposés plus bas ont seulement été essayés dans la mémoire du simulateur, sur les mêmes decks et les mêmes graines, pour en chiffrer l’effet.

## En bref

- **Classes** : écart de +13,9 pt entre la plus forte, Clandestin de soute (58,7 %), et la plus faible, Stand-by (44,8 %). Voir [Classes](#classes).
- **Familles** : Instinct domine (66,1 % de victoires quand c’est la famille principale du deck), Zizanie ferme la marche (31,4 %). Voir [Familles](#familles).
- **Cartes** : 23 cartes nettement trop fortes et 30 nettement trop faibles pour leur rareté (au moins 2 points de victoire par exemplaire d’écart avec la moyenne de leur rareté, |z| ≥ 3).
  - Les plus fortes : Tout pour la place (+12,8 pt), Furie du grizzli (+10,3 pt), Transfusion d’urgence (+9,4 pt), Humiliation publique (+8,9 pt), Sirène d'évacuation (+8,1 pt).
  - Les plus faibles : Éperon de proue (−10,9 pt), Arche de Noé (−9,0 pt), Coque de l’arche (−8,8 pt), Crise de jalousie (−7,3 pt), Mutation incontrôlée (−6,2 pt).
- **Qui commence** : le camp qui joue en premier gagne 49,9 % des duels (49,5 %–50,3 %).
- **16 ajustements chiffrés** proposés et testés en simulation, voir [Ajustements proposés](#ajustements-proposés).

## Ce qu’il faut retenir

Lecture rédigée à partir des chiffres ci-dessous (simulation de novembre 2026, jeu 0.87.2). Les tableaux qui suivent sont régénérés par `rapport.js`, cette section non : la mettre à jour si on relance la simulation.

**1. L’ordre de jeu est bien compensé.** Le camp qui commence gagne 49,9 % des 62 400 duels. Le malus d’énergie du premier joueur et le bonus du second se compensent : rien à changer.

**2. Le Clandestin de soute est la classe trop forte, et ce n’est pas son talent.** Il gagne 58,7 % de ses duels, +9,6 points au-dessus du Postulant à decks égaux. Pourtant, son talent (prendre 2 cartes dans un booster) n’est jamais utilisé par l’IA de draft simulée : il ne garde que son inconvénient (une carte de moins au premier tour). L’avantage vient de ses cartes de base, qui se remplacent toutes seules : *Coup en douce* pioche une carte et *Se planquer* ne coûte rien. Le deck tourne plus vite vers les cartes draftées. Avec le même deck drafté des deux côtés, il bat encore le Postulant 59,7 % du temps (300 duels). En vraie partie, avec son talent de draft, l’écart est sans doute plus grand. Pistes testées : *Coup en douce* à 2 d’énergie (50,2 %), ou *Se planquer* à 1 d’armure (52,3 %), ou PV ×0,91 (52,8 %). *Se planquer* à 1 d’énergie corrige trop (44,5 %).

**3. Le Stand-by et le Vétérinaire paient trop cher leurs PV en moins.** 44,8 % et 45,0 %. Leur talent ne compense pas −13 % et −8 % de PV. Pistes : Stand-by à ×0,93 (49,4 %), Vétérinaire à ×0,98 (49,2 %). Le Mécano est un peu fort (52,5 %) : ×1,03 suffit (50,1 %).

**4. Familles : Instinct domine, Zizanie est à la traîne, et deux familles changent de camp en cours de partie.**
- **Instinct** gagne 66 % des duels où c’est la famille principale, à toutes les phases. La Force qui s’empile en est le moteur : *Morsure*, *Morsure enragée*, *Cri primal*, *Instinct de meute* et *Furie du grizzli* sont toutes dans la liste des cartes trop fortes.
- **Mutation** (60 %) est faible au premier étage puis forte dès le deuxième, une fois la Radiation en place.
- **Blindage** est la meilleure famille des étages 1 et 2 (61–63 %), mais s’effondre ensuite (36 % en finale). Ses cartes rares (*Coque de l’arche*, *Éperon de proue*, *Arche de Noé*) sont les plus faibles du jeu pour le bot. Mais ce sont des cartes d’armure durable, que le bot sait mal valoriser : à tester à la main avant de les renforcer.
- **Sacrifice** fait l’inverse : 35 % au premier étage, 64 % au quatrième, porté par *Tout pour la place* et *Transfusion d’urgence*. La courbe est peut-être voulue ; la pente l’est sans doute moins.
- **Zizanie** ne gagne que 31 % de ses duels, et plus elle monte en palier, moins elle gagne (44 % au palier 1, 34 % au palier 3). En duel, la Jalousie retourne le coup contre la cible elle-même, à moitié : la famille est pensée pour les couples de monstres de l’arche. À juger aussi en JcE, mais en duel elle est clairement sous le niveau.
- **Cryogénie** (45 %) et **Panique** (44 %) sont aussi en dessous. Le palier 4 de Panique (*Terreur*) ne gagne que 35,5 % de ses duels, presque aussi mal que le palier 3 de Zizanie (34,1 %), le pire du jeu.

**5. Les cartes à regarder en premier** (effet comparé aux cartes de même rareté) :
- **Trop fortes** : *Tout pour la place* (+12,8 pt), *Furie du grizzli* (+10,3), *Transfusion d’urgence* (+9,4), *Humiliation publique* (+8,9), *Sirène d’évacuation* (+8,1). Parmi les cartes courantes, *Charge blindée* et *Moquerie cruelle* (+7 pt chacune, présentes dans 15 000 à 18 000 decks) pèsent le plus sur les parties.
- **Trop faibles** : *Éperon de proue* (−10,9 pt), *Arche de Noé* (−9,0), *Coque de l’arche* (−8,8), *Crise de jalousie* (−7,3), *Mutation incontrôlée* (−6,2), *Ère glaciaire* (−6,2).
- Les propositions chiffrées sont dans [Ajustements proposés](#ajustements-proposés). Le coût ressort souvent : pour plusieurs cartes, baisser un chiffre ne suffit pas. *Furie du grizzli* reste à +8,5 pt même à 1 dégât par coup, parce que sa force vient de la Force gagnée à chaque coup.

**6. Deux cartes portent le même nom** : la verte `mouvement` et la rouge `foule` s’appellent toutes deux « Mouvement de foule ». À vérifier si c’est voulu.

## Méthode

1. **Draft** : à chaque table, 4 bots de classes tirées au hasard draftent les 4 étages avec l’IA de draft du jeu (`ghostFloor1` du moteur : 4 boosters par étage, 12 choix, 8 cartes gardées). Les familles en jeu, les boosters et les choix sont ceux du vrai moteur.
2. **Duels d’étage** : après chaque étage, chaque bot affronte les 3 autres avec son deck du moment (cartes de base de sa classe comprises, fusions automatiques), **dans les deux ordres** (premier et second à jouer), soit 12 duels par étage. PV : ceux de la classe à l’étage (75, 143, 165, 180 de base).
3. **Finale** : deux paires tirées au hasard draftent le booster de finale (2 × 4 cartes, oranges et rouges comprises, choix à la manière de l’IA de finale du jeu), puis s’affrontent dans les deux ordres à 280 PV de base.
4. **Combat** : le mode duel en ligne du moteur (`duelBuild` / `duelAct`), donc les vraies règles. Les deux camps sont joués par le même bot : il essaie chaque carte jouable sur une copie de la partie, termine le tour de façon gloutonne pour les 3 meilleures (plus les cartes de pioche ou d’énergie), et joue celle qui donne la meilleure position (PV, armure utile face à la menace mesurée, Force, Faiblesse, Vulnérabilité, Gel, Radiation…). Il passe quand plus rien n’améliore sa position.
5. **Statistiques** : taux de victoire avec intervalle de confiance à 95 % (Wilson). Pour les cartes, en plus des taux bruts, un **modèle logistique** sur tous les duels estime l’effet propre de chaque exemplaire d’une carte, *toutes choses égales par ailleurs* (autres cartes, classes, étage, ordre de jeu). L’« effet » est exprimé en points de probabilité de victoire par exemplaire, autour de 50 %, **comparé à la moyenne des cartes de même rareté** (une violette doit battre une blanche : ce qu’on cherche, ce sont les cartes hors norme pour leur rang).

**Limites à garder en tête** : un bot glouton sous-estime les cartes de mise en place (Radiation à long terme, combos en plusieurs tours, cartes qui demandent de garder de l’énergie) et surestime les effets immédiats. Les decks sont ceux de l’IA de draft, pas ceux de joueurs humains. Les duels d’étage partent à PV pleins, alors qu’en vrai partie le duel d’étage suit des combats contre les monstres. Les monstres de l’arche (combats JcE) ne sont pas simulés. Les classements ci-dessous sont donc des **signaux à confirmer en jeu**, pas des verdicts.

## Avantage de jouer en premier

| Phase | Victoires du camp qui commence | Tours moyens | Duels allant jusqu’à la limite de tours |
|---|---|---|---|
| Étage 1 | **50,8 % (50,0 %–51,7 %)** | 6,1 | 5,2 % |
| Étage 2 | 50,2 % (49,4 %–51,0 %) | 6,2 | 2,3 % |
| Étage 3 | 49,8 % (49,0 %–50,6 %) | 5,0 | 0,5 % |
| Étage 4 | **48,9 % (48,1 %–49,7 %)** | 4,4 | 0,3 % |
| Finale | 49,8 % (48,3 %–51,2 %) | 4,8 | 0,3 % |
| **Tous** | 49,9 % (49,5 %–50,3 %) | | |

En duel en ligne, le camp qui commence joue son premier tour avec 1 énergie de moins, et l’autre reçoit 1 énergie de plus à son premier tour. Un taux proche de 50 % indique que cette compensation est bien calibrée ; un écart en gras est statistiquement significatif.

## Classes

Taux de victoire des classes (duels miroirs exclus), avec l’intervalle à 95 %. La colonne « effet propre » vient du modèle : c’est l’écart de la classe par rapport au Postulant **à decks égaux** : il mesure le talent, l’inconvénient et les PV de la classe, sans l’effet des cartes draftées.

| Classe | PV | Tous duels | Étage 1 | Étage 2 | Étage 3 | Étage 4 | Finale | Effet propre vs Postulant |
|---|---|---|---|---|---|---|---|---|
| Clandestin de soute | ×1,00 | **58,7 % (57,9 %–59,4 %)** | **58,6 %** | **60,6 %** | **58,8 %** | **56,7 %** | **58,8 %** | +9,6 pt (z = 18,2) |
| Mécano de l’arche | ×1,06 | **52,5 % (51,7 %–53,2 %)** | **54,9 %** | **51,8 %** | 51,3 % | **52,1 %** | 51,6 % | +3,9 pt (z = 7,5) |
| Androïde de maintenance | ×1,04 | **51,0 % (50,3 %–51,8 %)** | 49,9 % | 50,0 % | **52,0 %** | **51,7 %** | 52,6 % | +2,6 pt (z = 5,1) |
| Postulant | ×1,00 | **47,9 % (47,2 %–48,7 %)** | **48,0 %** | **47,3 %** | 49,0 % | **48,3 %** | **45,2 %** | référence |
| Vétérinaire | ×0,92 | **45,0 % (44,3 %–45,7 %)** | **45,1 %** | **46,0 %** | **44,3 %** | **44,4 %** | **46,1 %** | −2,3 pt (z = −4,5) |
| Stand-by | ×0,87 | **44,8 % (44,0 %–45,5 %)** | **43,5 %** | **44,2 %** | **44,6 %** | **46,8 %** | **45,2 %** | −3,2 pt (z = −6,0) |

**Matchups** (ligne contre colonne, taux de victoire de la ligne, toutes phases) :

| | Clandestin de soute | Mécano de l’arche | Androïde de maintenance | Postulant | Vétérinaire | Stand-by |
|---|---|---|---|---|---|---|
| **Clandestin de soute** | · | **55 %** | **55 %** | **60 %** | **60 %** | **63 %** |
| **Mécano de l’arche** | **45 %** | · | 51 % | **54 %** | **56 %** | **57 %** |
| **Androïde de maintenance** | **45 %** | 49 % | · | **52 %** | **56 %** | **53 %** |
| **Postulant** | **40 %** | **46 %** | **48 %** | · | **53 %** | **53 %** |
| **Vétérinaire** | **40 %** | **44 %** | **44 %** | **47 %** | · | 50 % |
| **Stand-by** | **37 %** | **43 %** | **47 %** | **47 %** | 50 % | · |

**Ajustements de classes testés** : pour chaque classe à plus de 2 points de 50 %, on a rejoué jusqu’à 600 de ses duels (hors miroirs) en changeant ses PV ou un chiffre d’une de ses deux cartes de base. Deux pistes par classe, au choix : la plus proche de 50 % côté PV, et côté carte de base.

| Classe | Victoires actuelles | Piste PV | → victoires | Piste carte de base | → victoires |
|---|---|---|---|---|---|
| Postulant | 47,9 % | PV ×1,00 → **×1,03** | 50,4 % | Poing nu : dégâts 4 → **5** | 49,4 % |
| Vétérinaire | 45,0 % | PV ×0,92 → **×0,98** | 49,2 % | Fléchette tranquillisante : dégâts 4 → **5** | 46,5 % |
| Mécano de l’arche | 52,5 % | PV ×1,06 → **×1,03** | 50,1 % | Clé à molette : dégâts 3 → **2** | 51,0 % |
| Clandestin de soute | 58,7 % | PV ×1,00 → **×0,91** | 52,8 % | Coup en douce : coût 1 → **2** | 50,2 % |
| Stand-by | 44,8 % | PV ×0,87 → **×0,93** | 49,4 % | Gilet de sauvetage : armure 4 → **5** | 45,9 % |

<details><summary>Toutes les variantes de classes essayées</summary>

| Classe | Variante | Victoires après (estimées) | Écart | Duels qui basculent |
|---|---|---|---|---|
| Postulant | PV ×1,00 → ×1,03 | 50,4 % | +2,5 pt | 21 / 600 |
| Postulant | PV ×1,00 → ×1,06 | 52,9 % | +5,0 pt | 34 / 600 |
| Postulant | PV ×1,00 → ×1,09 | 54,9 % | +7,0 pt | 46 / 600 |
| Postulant | Poing nu : dégâts 4 → 5 | 49,4 % | +1,5 pt | 27 / 600 |
| Postulant | Poing nu : coût 1 → 0 | 66,2 % | +18,3 pt | 124 / 600 |
| Postulant | Esquive : armure 4 → 5 | 49,2 % | +1,3 pt | 30 / 600 |
| Postulant | Esquive : coût 1 → 0 | 62,6 % | +14,7 pt | 108 / 600 |
| Vétérinaire | PV ×0,92 → ×0,95 | 46,5 % | +1,5 pt | 17 / 600 |
| Vétérinaire | PV ×0,92 → ×0,98 | 49,2 % | +4,2 pt | 39 / 600 |
| Vétérinaire | PV ×0,92 → ×1,01 | 51,0 % | +6,0 pt | 44 / 600 |
| Vétérinaire | Fléchette tranquillisante : dégâts 4 → 5 | 46,5 % | +1,5 pt | 23 / 600 |
| Vétérinaire | Fléchette tranquillisante : coût 1 → 0 | 60,5 % | +15,5 pt | 103 / 600 |
| Vétérinaire | Premiers soins : armure 3 → 4 | 45,7 % | +0,7 pt | 24 / 600 |
| Vétérinaire | Premiers soins : coût 1 → 0 | 58,0 % | +13,0 pt | 106 / 600 |
| Mécano de l’arche | PV ×1,06 → ×1,03 | 50,1 % | −2,3 pt | 16 / 600 |
| Mécano de l’arche | PV ×1,06 → ×1,00 | 48,8 % | −3,7 pt | 32 / 600 |
| Mécano de l’arche | PV ×1,06 → ×0,97 | 47,6 % | −4,8 pt | 33 / 600 |
| Mécano de l’arche | Clé à molette : dégâts 3 → 2 | 51,0 % | −1,5 pt | 31 / 600 |
| Mécano de l’arche | Clé à molette : coût 1 → 2 | 48,3 % | −4,2 pt | 63 / 600 |
| Mécano de l’arche | Tôle rivetée : armure 4 → 3 | 51,3 % | −1,2 pt | 31 / 600 |
| Mécano de l’arche | Tôle rivetée : coût 1 → 2 | 48,3 % | −4,2 pt | 47 / 600 |
| Clandestin de soute | PV ×1,00 → ×0,97 | 57,0 % | −1,7 pt | 16 / 600 |
| Clandestin de soute | PV ×1,00 → ×0,94 | 55,3 % | −3,3 pt | 24 / 600 |
| Clandestin de soute | PV ×1,00 → ×0,91 | 52,8 % | −5,8 pt | 39 / 600 |
| Clandestin de soute | Coup en douce : coût 1 → 2 | 50,2 % | −8,5 pt | 99 / 600 |
| Clandestin de soute | Se planquer : armure 2 → 1 | 52,3 % | −6,3 pt | 50 / 600 |
| Clandestin de soute | Se planquer : coût 0 → 1 | 44,5 % | −14,2 pt | 111 / 600 |
| Stand-by | PV ×0,87 → ×0,90 | 47,9 % | +3,2 pt | 27 / 600 |
| Stand-by | PV ×0,87 → ×0,93 | 49,4 % | +4,7 pt | 38 / 600 |
| Stand-by | PV ×0,87 → ×0,96 | 52,1 % | +7,3 pt | 48 / 600 |
| Stand-by | Coup de valise : dégâts 4 → 5 | 45,8 % | +1,0 pt | 36 / 600 |
| Stand-by | Coup de valise : coût 1 → 0 | 57,8 % | +13,0 pt | 110 / 600 |
| Stand-by | Gilet de sauvetage : armure 4 → 5 | 45,9 % | +1,2 pt | 33 / 600 |
| Stand-by | Gilet de sauvetage : coût 1 → 0 | 56,1 % | +11,3 pt | 94 / 600 |

</details>

## Familles

La famille principale d’un deck est sa spécialisation active au palier le plus haut (le moteur en active 2 au plus). Taux de victoire selon la famille principale :

| Famille | Part des decks | Tous duels | Étage 1 | Étage 2 | Étage 3 | Étage 4 | Finale |
|---|---|---|---|---|---|---|---|
| Instinct | 13,2 % | **66,1 % (65,4 %–66,8 %)** | **70,4 %** | **68,3 %** | **64,3 %** | **62,3 %** | **60,6 %** |
| Mutation | 12,4 % | **60,3 % (59,5 %–61,1 %)** | 49,6 % | **65,9 %** | **64,5 %** | **61,0 %** | **60,4 %** |
| Blindage | 11,9 % | **54,1 % (53,3 %–54,9 %)** | **60,5 %** | **63,0 %** | **56,3 %** | **42,7 %** | **36,4 %** |
| Débrouille | 13,3 % | 50,1 % (49,4 %–50,9 %) | **55,1 %** | **45,1 %** | **47,0 %** | 50,9 % | **56,3 %** |
| Sacrifice | 12,4 % | 49,6 % (48,8 %–50,4 %) | **35,1 %** | **38,6 %** | **52,1 %** | **64,4 %** | **61,2 %** |
| Cryogénie | 12,4 % | **44,6 % (43,8 %–45,3 %)** | **46,4 %** | **46,1 %** | **44,7 %** | **44,4 %** | **35,2 %** |
| Panique | 12,1 % | **43,9 % (43,1 %–44,7 %)** | **46,1 %** | **43,5 %** | **42,0 %** | **43,0 %** | 48,0 % |
| Zizanie | 12,4 % | **31,4 % (30,7 %–32,2 %)** | **32,1 %** | **30,3 %** | **29,8 %** | **30,5 %** | **40,5 %** |

**Par palier de spécialisation** (taux de victoire des decks ayant cette famille active à ce palier) :

| Famille | Palier 1 | Palier 2 | Palier 3 | Palier 4 |
|---|---|---|---|---|
| Instinct | **61,2 %** <sub>(8 422)</sub> | **60,5 %** <sub>(9 534)</sub> | **62,5 %** <sub>(8 938)</sub> | **76,1 %** <sub>(758)</sub> |
| Mutation | **42,3 %** <sub>(7 780)</sub> | **55,9 %** <sub>(9 510)</sub> | **62,1 %** <sub>(9 030)</sub> | **74,5 %** <sub>(710)</sub> |
| Blindage | 49,2 % <sub>(7 228)</sub> | **51,2 %** <sub>(9 316)</sub> | 49,0 % <sub>(8 608)</sub> | **55,3 %** <sub>(624)</sub> |
| Débrouille | **55,6 %** <sub>(8 468)</sub> | **48,7 %** <sub>(10 054)</sub> | 50,3 % <sub>(9 242)</sub> | **70,4 %** <sub>(636)</sub> |
| Sacrifice | **41,9 %** <sub>(9 042)</sub> | **42,1 %** <sub>(10 806)</sub> | **59,4 %** <sub>(9 524)</sub> | **76,2 %** <sub>(496)</sub> |
| Cryogénie | **43,4 %** <sub>(7 338)</sub> | **48,7 %** <sub>(9 380)</sub> | **44,3 %** <sub>(9 238)</sub> | **45,5 %** <sub>(718)</sub> |
| Panique | **57,4 %** <sub>(7 632)</sub> | **54,1 %** <sub>(9 780)</sub> | **46,8 %** <sub>(8 776)</sub> | **35,5 %** <sub>(678)</sub> |
| Zizanie | **44,3 %** <sub>(8 084)</sub> | **39,2 %** <sub>(10 424)</sub> | **34,1 %** <sub>(9 152)</sub> | **37,4 %** <sub>(674)</sub> |

**Matchups de familles** (famille principale de la ligne contre celle de la colonne) :

| | Instinct | Mutation | Blindage | Débrouille | Sacrifice | Cryogénie | Panique | Zizanie |
|---|---|---|---|---|---|---|---|---|
| **Instinct** | · | **66 %** | **68 %** | **61 %** | **68 %** | **73 %** | **71 %** | **58 %** |
| **Mutation** | **34 %** | · | **68 %** | 52 % | **59 %** | **59 %** | **65 %** | **90 %** |
| **Blindage** | **32 %** | **32 %** | · | **66 %** | **59 %** | 49 % | **62 %** | **79 %** |
| **Débrouille** | **39 %** | 48 % | **34 %** | · | **47 %** | **56 %** | **57 %** | **68 %** |
| **Sacrifice** | **32 %** | **41 %** | **41 %** | **53 %** | · | **55 %** | **56 %** | **72 %** |
| **Cryogénie** | **27 %** | **41 %** | 51 % | **44 %** | **45 %** | · | **46 %** | **56 %** |
| **Panique** | **29 %** | **35 %** | **38 %** | **43 %** | **44 %** | **54 %** | · | **64 %** |
| **Zizanie** | **42 %** | **10 %** | **21 %** | **32 %** | **28 %** | **44 %** | **36 %** | · |

## Cartes trop fortes

Effet propre d’au moins +2 points de victoire par exemplaire au-dessus de la moyenne de sa rareté, avec z ≥ 3 (très peu de chances que ce soit du bruit). Moyennes par rareté, par rapport à une carte moyenne du jeu : Blanche −2,4 pt, Verte −1,0 pt, Bleue +1,7 pt, Violette +4,4 pt, Orange +4,4 pt, Rouge +7,0 pt. « Effet brut » = sans cette correction.

| Carte | Rareté | Famille | Coût | Effet vs sa rareté | z | Effet brut | Victoires (dans le deck) | Victoires (jouée) | Jouée quand présente | Decks | À savoir |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tout pour la place | Violette | Sacrifice | 1 | **+12,8 pt** | 9,0 | +17,2 pt | 62,8 % | 68,2 % | 77 % | 1 440 |  |
| Furie du grizzli | Violette | Instinct | 1 | **+10,3 pt** | 7,2 | +14,7 pt | 66,7 % | 72,9 % | 76 % | 1 494 |  |
| Transfusion d’urgence | Violette | Sacrifice | 1 | **+9,4 pt** | 6,6 | +13,8 pt | 58,7 % | 63,9 % | 76 % | 1 498 |  |
| Humiliation publique | Bleue | Panique | 1 | **+8,9 pt** | 9,0 | +10,6 pt | 59,5 % | 63,2 % | 80 % | 3 226 |  |
| Sirène d'évacuation | Bleue | Panique | 1 | **+8,1 pt** | 6,8 | +9,8 pt | 57,9 % | 59,6 % | 67 % | 2 126 | touche « tous les ennemis » : un seul en duel |
| Charge blindée | Verte | Blindage | 1 | **+7,0 pt** | 13,3 | +6,0 pt | 53,4 % | 55,8 % | 86 % | 14 960 |  |
| Moquerie cruelle | Verte | Panique | 1 | **+6,9 pt** | 14,5 | +6,0 pt | 54,5 % | 55,6 % | 83 % | 18 386 |  |
| Évacuation générale | Orange | Panique | 1 | **+6,8 pt** | 4,1 | +11,2 pt | 58,1 % | 61,2 % | 73 % | 1 184 | touche « tous les ennemis » : un seul en duel |
| Mouvement de foule (rouge) | Rouge | Panique | 1 | **+6,3 pt** | 3,7 | +13,3 pt | 60,2 % | 62,9 % | 74 % | 1 160 | touche « tous les ennemis » : un seul en duel |
| Dévaliser la soute | Violette | Débrouille | 0 | **+6,3 pt** | 4,5 | +10,7 pt | 57,3 % | 59,2 % | 89 % | 1 484 |  |
| Morsure | Blanche | Instinct | 1 | **+6,1 pt** | 11,4 | +3,7 pt | 59,3 % | 61,9 % | 66 % | 14 424 |  |
| Divorce express | Bleue | Zizanie | 1 | **+5,8 pt** | 5,7 | +7,5 pt | 51,9 % | 66,6 % | 51 % | 2 992 |  |
| Morsure enragée | Verte | Instinct | 1 | **+5,7 pt** | 11,4 | +4,8 pt | 60,1 % | 63,1 % | 76 % | 15 862 |  |
| Fission | Rouge | Mutation | 2 | **+5,3 pt** | 3,2 | +12,3 pt | 57,9 % | 63,0 % | 60 % | 1 174 | touche « tous les ennemis » : un seul en duel |
| Cri primal | Blanche | Instinct | 1 | **+5,0 pt** | 9,2 | +2,6 pt | 58,7 % | 56,8 % | 55 % | 13 912 |  |
| Plateau-repas | Blanche | Débrouille | 1 | **+3,9 pt** | 7,7 | +1,6 pt | 52,1 % | 54,5 % | 73 % | 15 110 |  |
| Instinct de meute | Verte | Instinct | 1 | **+3,9 pt** | 7,7 | +2,9 pt | 58,6 % | 57,8 % | 70 % | 16 100 |  |
| Mutation accélérée | Verte | Mutation | 1 | **+3,9 pt** | 7,8 | +2,9 pt | 55,1 % | 57,5 % | 82 % | 16 762 |  |
| Sérum mutagène | Blanche | Mutation | 1 | **+3,8 pt** | 7,2 | +1,5 pt | 54,3 % | 55,2 % | 79 % | 14 250 |  |
| Chariot de service | Verte | Débrouille | 1 | **+3,3 pt** | 6,8 | +2,3 pt | 52,8 % | 54,9 % | 79 % | 18 090 |  |
| Coup d'épaule | Blanche | Blindage | 1 | **+2,7 pt** | 4,6 | +0,3 pt | 50,5 % | 57,7 % | 69 % | 11 746 |  |
| Givre | Blanche | Cryogénie | 1 | **+2,5 pt** | 4,7 | +0,1 pt | 46,9 % | 50,5 % | 69 % | 14 342 |  |
| Boîte de Petri | Verte | Mutation | 1 | **+2,1 pt** | 4,2 | +1,1 pt | 54,1 % | 55,8 % | 83 % | 16 640 |  |

## Cartes trop faibles

Au moins 2 points de victoire par exemplaire sous la moyenne de sa rareté, avec z ≤ −3. **Attention** : seuls les duels sont simulés. Les cartes qui touchent « tous les ennemis » ou qui misent sur la Jalousie (détourner un coup vers le partenaire) sont pensées pour les couples de monstres de l’arche, et perdent forcément de leur intérêt en duel. Une carte peu jouée par le bot peut aussi être une carte de mise en place qu’un joueur glouton exploite mal. La colonne « À savoir » le signale : ces cartes-là sont à juger aussi en JcE avant d’y toucher.

| Carte | Rareté | Famille | Coût | Effet vs sa rareté | z | Effet brut | Victoires (dans le deck) | Victoires (jouée) | Jouée quand présente | Decks | À savoir |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Éperon de proue | Violette | Blindage | 2 | **−10,9 pt** | −7,4 | −6,5 pt | 41,9 % | 55,9 % | 36 % | 1 330 | touche « tous les ennemis » : un seul en duel ; le bot ne la joue que 36 % du temps |
| Arche de Noé | Rouge | Blindage | 2 | **−9,0 pt** | −5,4 | −2,0 pt | 44,8 % | 47,9 % | 63 % | 1 182 | valeur sur plusieurs tours, mal vue par le bot |
| Coque de l’arche | Violette | Blindage | 2 | **−8,8 pt** | −6,3 | −4,5 pt | 44,6 % | 43,2 % | 36 % | 1 472 | valeur sur plusieurs tours, mal vue par le bot ; le bot ne la joue que 36 % du temps |
| Crise de jalousie | Violette | Zizanie | 1 | **−7,3 pt** | −5,0 | −2,9 pt | 43,0 % | 39,0 % | 44 % | 1 368 | touche « tous les ennemis » : un seul en duel ; Jalousie : détourne vers un partenaire absent en duel ; le bot ne la joue que 44 % du temps |
| Mutation incontrôlée | Bleue | Mutation | 1 | **−6,2 pt** | −5,0 | −4,5 pt | 45,3 % | 47,3 % | 64 % | 1 930 |  |
| Ère glaciaire | Rouge | Cryogénie | 2 | **−6,2 pt** | −3,7 | +0,8 pt | 44,7 % | 46,5 % | 64 % | 1 190 | touche « tous les ennemis » : un seul en duel |
| Pluie radioactive | Bleue | Mutation | 1 | **−5,7 pt** | −5,5 | −4,0 pt | 47,9 % | 48,6 % | 73 % | 2 764 | touche « tous les ennemis » : un seul en duel |
| Chef de meute | Violette | Instinct | 1 | **−4,7 pt** | −3,5 | −0,3 pt | 54,3 % | 55,9 % | 54 % | 1 596 |  |
| Rumeur de couloir | Blanche | Zizanie | 1 | **−4,6 pt** | −8,8 | −6,9 pt | 38,7 % | 37,5 % | 65 % | 15 008 | Jalousie : détourne vers un partenaire absent en duel |
| Hiver nucléaire | Violette | Cryogénie | 2 | **−4,5 pt** | −3,4 | −0,1 pt | 47,6 % | 49,7 % | 57 % | 1 618 | touche « tous les ennemis » : un seul en duel |
| Extincteur | Verte | Cryogénie | 2 | **−4,4 pt** | −9,0 | −5,4 pt | 44,2 % | 45,6 % | 44 % | 16 968 | touche « tous les ennemis » : un seul en duel ; le bot ne la joue que 44 % du temps |
| Scène de ménage | Verte | Zizanie | 1 | **−4,1 pt** | −8,4 | −5,0 pt | 41,0 % | 59,0 % | 40 % | 17 632 | le bot ne la joue que 40 % du temps |
| Ragot venimeux | Verte | Zizanie | 1 | **−3,8 pt** | −8,2 | −4,8 pt | 41,4 % | 41,2 % | 72 % | 18 848 | Jalousie : détourne vers un partenaire absent en duel |
| Sas de confinement | Bleue | Blindage | 1 | **−3,8 pt** | −3,3 | −2,1 pt | 46,4 % | 46,1 % | 71 % | 2 332 | valeur sur plusieurs tours, mal vue par le bot |
| Brise-glace | Bleue | Cryogénie | 1 | **−3,6 pt** | −3,5 | −1,9 pt | 44,6 % | 45,7 % | 66 % | 2 908 |  |
| Saignée | Verte | Sacrifice | 1 | **−3,6 pt** | −7,9 | −4,6 pt | 45,3 % | 47,1 % | 69 % | 19 394 |  |
| Kit de survie | Bleue | Sacrifice | 1 | **−3,5 pt** | −3,7 | −1,8 pt | 46,4 % | 44,2 % | 74 % | 3 492 |  |
| Dossier compromettant | Verte | Zizanie | 1 | **−3,1 pt** | −6,0 | −4,1 pt | 40,3 % | 42,0 % | 78 % | 14 966 | Jalousie : détourne vers un partenaire absent en duel |
| Cri de panique | Blanche | Panique | 1 | **−3,1 pt** | −5,5 | −5,5 pt | 47,9 % | 43,1 % | 47 % | 13 040 | touche « tous les ennemis » : un seul en duel ; le bot ne la joue que 47 % du temps |
| Pic à glace | Blanche | Cryogénie | 1 | **−3,1 pt** | −5,8 | −5,4 pt | 44,3 % | 46,7 % | 65 % | 14 298 |  |
| Alarme incendie | Verte | Panique | 1 | **−3,0 pt** | −5,7 | −3,9 pt | 48,8 % | 47,1 % | 72 % | 15 004 | touche « tous les ennemis » : un seul en duel |
| Prise de sang | Blanche | Sacrifice | 1 | **−2,8 pt** | −6,1 | −5,1 pt | 45,2 % | 45,3 % | 40 % | 19 634 | le bot ne la joue que 40 % du temps |
| Huile sur le feu | Blanche | Zizanie | 1 | **−2,7 pt** | −5,3 | −5,0 pt | 40,4 % | 64,1 % | 28 % | 15 862 | le bot ne la joue que 28 % du temps |
| Stalactite | Verte | Cryogénie | 1 | **−2,6 pt** | −5,3 | −3,6 pt | 44,4 % | 47,2 % | 72 % | 16 218 |  |
| Porte de casier | Blanche | Blindage | 1 | **−2,3 pt** | −4,2 | −4,7 pt | 47,6 % | 49,0 % | 63 % | 13 316 |  |
| Couverture de survie | Verte | Blindage | 1 | **−2,2 pt** | −4,5 | −3,2 pt | 48,5 % | 49,8 % | 74 % | 16 758 |  |
| Barricade de caisses | Verte | Blindage | 1 | **−2,1 pt** | −4,3 | −3,1 pt | 48,2 % | 49,1 % | 73 % | 16 352 | valeur sur plusieurs tours, mal vue par le bot |
| Lettre anonyme | Blanche | Zizanie | 1 | **−2,1 pt** | −3,8 | −4,5 pt | 39,6 % | 41,3 % | 72 % | 13 476 | Jalousie : détourne vers un partenaire absent en duel |
| Bandage serré | Verte | Sacrifice | 1 | **−2,1 pt** | −4,4 | −3,1 pt | 45,4 % | 42,6 % | 77 % | 17 890 |  |
| Mouvement de foule (verte) | Verte | Panique | 1 | **−2,0 pt** | −4,1 | −3,0 pt | 49,2 % | 50,0 % | 68 % | 16 158 | touche « tous les ennemis » : un seul en duel |

## Ajustements proposés

Pour chaque carte signalée, plusieurs variantes chiffrées ont été essayées en mémoire, en rejouant jusqu’à 600 duels où un seul camp possède la carte (ou en a plus d’exemplaires), avec les mêmes decks et les mêmes graines. Le rejeu sans modification redonne le même résultat (colonne « Rejeu identique »), donc toute différence vient de la variante. On retient la variante dont l’effet résiduel estimé est le plus proche de 0.

| Carte | Proposition | Effet vs sa rareté, actuel | Effet estimé après | Victoires du porteur avant → après | Rejeu identique | Duels |
|---|---|---|---|---|---|---|
| Tout pour la place | **coût 1 → 2** | +12,8 pt | +0,3 pt | 63,0 % → 50,3 % | 100 % | 600 |
| Furie du grizzli | **coût 1 → 2** | +10,3 pt | −0,3 pt | 65,7 % → 55,2 % | 100 % | 600 |
| Transfusion d’urgence | **coût 1 → 2** | +9,4 pt | +4,7 pt | 58,8 % → 54,2 % | 100 % | 600 |
| Humiliation publique | **coût 1 → 2** | +8,9 pt | +2,6 pt | 64,7 % → 58,7 % | 100 % | 600 |
| Sirène d'évacuation | **Faiblesse 2 → 1 et Vulnérabilité 2 → 1** | +8,1 pt | +3,6 pt | 58,5 % → 54,0 % | 100 % | 600 |
| Charge blindée | **coût 1 → 2** | +7,0 pt | +0,1 pt | 50,8 % → 44,0 % | 100 % | 600 |
| Moquerie cruelle | **dégâts 9 → 6 et Vulnérabilité 2 → 1** | +6,9 pt | +0,3 pt | 58,7 % → 52,2 % | 100 % | 600 |
| Évacuation générale | **coût 1 → 2** | +6,8 pt | +1,6 pt | 56,2 % → 51,0 % | 100 % | 600 |
| Éperon de proue | **coût 2 → 1** | −10,9 pt | −4,8 pt | 41,5 % → 47,7 % | 100 % | 600 |
| Arche de Noé | **armure 12 → 16 et nombre de coups 2 → 3** | −9,0 pt | −0,6 pt | 44,8 % → 53,2 % | 100 % | 600 |
| Coque de l’arche | **coût 2 → 1** | −8,8 pt | −3,8 pt | 45,8 % → 51,0 % | 100 % | 600 |
| Crise de jalousie | **coût 1 → 0** | −7,3 pt | −3,2 pt | 43,0 % → 47,2 % | 100 % | 600 |
| Mutation incontrôlée | **coût 1 → 0** | −6,2 pt | −0,8 pt | 42,3 % → 47,7 % | 100 % | 600 |
| Ère glaciaire | **coût 2 → 1** | −6,2 pt | −1,8 pt | 44,3 % → 48,7 % | 100 % | 600 |
| Pluie radioactive | **coût 1 → 0** | −5,7 pt | +1,0 pt | 44,0 % → 50,7 % | 100 % | 600 |
| Chef de meute | **multiplicateur de Force 2 → 3** | −4,7 pt | +0,5 pt | 54,7 % → 59,8 % | 100 % | 600 |

<details><summary>Toutes les variantes essayées</summary>

**Tout pour la place** (Violette, Sacrifice) — effet actuel +12,8 pt, porteur à 63,0 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| multiplicateur de dégâts 3 → 2 | 52,5 % | −10,5 pt | 85 | +2,4 pt |
| multiplicateur de dégâts 3 → 1 | 41,3 % | −21,7 pt | 172 | −8,5 pt |
| plafond de PV perdus 20 → 19 | 61,3 % | −1,7 pt | 16 | +11,1 pt |
| multiplicateur de dégâts 3 → 2 et plafond de PV perdus 20 → 19 | 52,0 % | −11,0 pt | 88 | +1,9 pt |
| coût 1 → 2 | 50,3 % | −12,7 pt | 88 | +0,3 pt |

**Furie du grizzli** (Violette, Instinct) — effet actuel +10,3 pt, porteur à 65,7 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| dégâts 3 → 2 | 64,3 % | −1,3 pt | 24 | +8,9 pt |
| dégâts 3 → 1 | 64,0 % | −1,7 pt | 32 | +8,5 pt |
| coût 1 → 2 | 55,2 % | −10,5 pt | 91 | −0,3 pt |

**Transfusion d’urgence** (Violette, Sacrifice) — effet actuel +9,4 pt, porteur à 58,8 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| armure 4 → 3 | 58,5 % | −0,3 pt | 2 | +9,1 pt |
| armure 4 → 2 | 58,3 % | −0,5 pt | 5 | +8,9 pt |
| coût 1 → 2 | 54,2 % | −4,7 pt | 68 | +4,7 pt |

**Humiliation publique** (Bleue, Panique) — effet actuel +8,9 pt, porteur à 64,7 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| dégâts 15 → 14 | 64,3 % | −0,3 pt | 6 | +8,5 pt |
| dégâts 15 → 13 | 63,5 % | −1,2 pt | 9 | +7,6 pt |
| dégâts 15 → 11 | 61,8 % | −2,8 pt | 17 | +5,9 pt |
| dégâts 15 → 8 | 61,0 % | −3,7 pt | 34 | +5,0 pt |
| Vulnérabilité 3 → 2 | 63,0 % | −1,7 pt | 14 | +7,1 pt |
| dégâts 15 → 11 et Vulnérabilité 3 → 2 | 60,0 % | −4,7 pt | 34 | +3,9 pt |
| coût 1 → 2 | 58,7 % | −6,0 pt | 66 | +2,6 pt |

**Sirène d'évacuation** (Bleue, Panique) — effet actuel +8,1 pt, porteur à 58,5 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| Faiblesse 2 → 1 | 56,0 % | −2,5 pt | 31 | +5,6 pt |
| Vulnérabilité 2 → 1 | 55,7 % | −2,8 pt | 31 | +5,2 pt |
| Faiblesse 2 → 1 et Vulnérabilité 2 → 1 | 54,0 % | −4,5 pt | 45 | +3,6 pt |
| coût 1 → 2 | 54,3 % | −4,2 pt | 55 | +3,9 pt |

**Charge blindée** (Verte, Blindage) — effet actuel +7,0 pt, porteur à 50,8 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| armure 8 → 7 | 50,3 % | −0,5 pt | 17 | +6,5 pt |
| armure 8 → 6 | 48,2 % | −2,7 pt | 32 | +4,3 pt |
| armure 8 → 4 | 45,7 % | −5,2 pt | 49 | +1,8 pt |
| coût 1 → 2 | 44,0 % | −6,8 pt | 65 | +0,1 pt |

**Moquerie cruelle** (Verte, Panique) — effet actuel +6,9 pt, porteur à 58,7 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| dégâts 9 → 8 | 57,8 % | −0,8 pt | 11 | +6,1 pt |
| dégâts 9 → 7 | 56,3 % | −2,3 pt | 28 | +4,5 pt |
| dégâts 9 → 6 | 55,2 % | −3,5 pt | 37 | +3,4 pt |
| dégâts 9 → 5 | 53,5 % | −5,2 pt | 47 | +1,7 pt |
| Vulnérabilité 2 → 1 | 56,0 % | −2,7 pt | 30 | +4,2 pt |
| dégâts 9 → 6 et Vulnérabilité 2 → 1 | 52,2 % | −6,5 pt | 59 | +0,3 pt |
| coût 1 → 2 | 49,7 % | −9,0 pt | 88 | −2,2 pt |

**Évacuation générale** (Orange, Panique) — effet actuel +6,8 pt, porteur à 56,2 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| dégâts 8 → 7 | 55,5 % | −0,7 pt | 8 | +6,1 pt |
| dégâts 8 → 6 | 55,3 % | −0,8 pt | 11 | +6,0 pt |
| dégâts 8 → 4 | 54,8 % | −1,3 pt | 20 | +5,5 pt |
| Faiblesse 3 → 2 | 55,2 % | −1,0 pt | 12 | +5,8 pt |
| dégâts 8 → 6 et Faiblesse 3 → 2 | 54,5 % | −1,7 pt | 16 | +5,1 pt |
| coût 1 → 2 | 51,0 % | −5,2 pt | 39 | +1,6 pt |

**Éperon de proue** (Violette, Blindage) — effet actuel −10,9 pt, porteur à 41,5 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| coût 2 → 1 | 47,7 % | +6,2 pt | 59 | −4,8 pt |

**Arche de Noé** (Rouge, Blindage) — effet actuel −9,0 pt, porteur à 44,8 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| armure 12 → 13 | 45,3 % | +0,5 pt | 9 | −8,5 pt |
| armure 12 → 14 | 45,7 % | +0,8 pt | 13 | −8,1 pt |
| armure 12 → 16 | 47,5 % | +2,7 pt | 26 | −6,3 pt |
| armure 12 → 18 | 49,5 % | +4,7 pt | 38 | −4,3 pt |
| nombre de coups 2 → 3 | 49,3 % | +4,5 pt | 37 | −4,5 pt |
| armure 12 → 16 et nombre de coups 2 → 3 | 53,2 % | +8,3 pt | 58 | −0,6 pt |
| coût 2 → 1 | 49,0 % | +4,2 pt | 51 | −4,8 pt |

**Coque de l’arche** (Violette, Blindage) — effet actuel −8,8 pt, porteur à 45,8 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| armure 16 → 17 | 46,0 % | +0,2 pt | 5 | −8,7 pt |
| armure 16 → 18 | 46,5 % | +0,7 pt | 10 | −8,2 pt |
| armure 16 → 21 | 47,7 % | +1,8 pt | 15 | −7,1 pt |
| armure 16 → 24 | 48,3 % | +2,5 pt | 27 | −6,4 pt |
| coût 2 → 1 | 51,0 % | +5,2 pt | 59 | −3,8 pt |

**Crise de jalousie** (Violette, Zizanie) — effet actuel −7,3 pt, porteur à 43,0 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| Rancune 4 → 5 | 44,2 % | +1,2 pt | 11 | −6,2 pt |
| Rancune 4 → 6 | 43,8 % | +0,8 pt | 17 | −6,5 pt |
| coût 1 → 0 | 47,2 % | +4,2 pt | 47 | −3,2 pt |

**Mutation incontrôlée** (Bleue, Mutation) — effet actuel −6,2 pt, porteur à 42,3 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| Radiation 3 → 4 | 43,0 % | +0,7 pt | 10 | −5,5 pt |
| Radiation 3 → 5 | 43,2 % | +0,8 pt | 21 | −5,4 pt |
| multiplicateur de Radiation 3 → 4 | 45,0 % | +2,7 pt | 22 | −3,5 pt |
| Radiation 3 → 4 et multiplicateur de Radiation 3 → 4 | 46,0 % | +3,7 pt | 34 | −2,5 pt |
| coût 1 → 0 | 47,7 % | +5,3 pt | 60 | −0,8 pt |

**Ère glaciaire** (Rouge, Cryogénie) — effet actuel −6,2 pt, porteur à 44,3 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| dégâts 12 → 13 | 45,0 % | +0,7 pt | 6 | −5,5 pt |
| dégâts 12 → 14 | 45,3 % | +1,0 pt | 12 | −5,2 pt |
| dégâts 12 → 16 | 45,0 % | +0,7 pt | 22 | −5,5 pt |
| dégâts 12 → 18 | 46,7 % | +2,3 pt | 30 | −3,8 pt |
| Gel 3 → 4 | 44,3 % | +0,0 pt | 4 | −6,2 pt |
| dégâts 12 → 16 et Gel 3 → 4 | 45,7 % | +1,3 pt | 22 | −4,8 pt |
| coût 2 → 1 | 48,7 % | +4,3 pt | 58 | −1,8 pt |

**Pluie radioactive** (Bleue, Mutation) — effet actuel −5,7 pt, porteur à 44,0 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| Radiation 6 → 7 | 45,5 % | +1,5 pt | 15 | −4,2 pt |
| Radiation 6 → 8 | 47,5 % | +3,5 pt | 29 | −2,2 pt |
| Radiation 6 → 9 | 47,8 % | +3,8 pt | 31 | −1,9 pt |
| coût 1 → 0 | 50,7 % | +6,7 pt | 62 | +1,0 pt |

**Chef de meute** (Violette, Instinct) — effet actuel −4,7 pt, porteur à 54,7 % sur 600 duels.

| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |
|---|---|---|---|---|
| multiplicateur de Force 2 → 3 | 59,8 % | +5,2 pt | 61 | +0,5 pt |
| multiplicateur de Force 2 → 4 | 62,5 % | +7,8 pt | 73 | +3,3 pt |
| pioche 1 → 2 | 58,5 % | +3,8 pt | 59 | −0,8 pt |
| multiplicateur de Force 2 → 3 et pioche 1 → 2 | 61,3 % | +6,7 pt | 90 | +2,1 pt |
| coût 1 → 0 | 61,8 % | +7,2 pt | 69 | +2,6 pt |

</details>

Ces chiffres supposent des decks inchangés : en vrai partie, l’IA de draft choisit selon la valeur `value` des cartes, qui n’a pas été modifiée. Si un ajustement est retenu, penser aussi à mettre à jour le texte et, au besoin, la valeur de draft de la carte.

## Annexe : toutes les cartes

Triées par effet comparé à leur rareté. Les coups bas et les cartes vues dans moins de 200 decks sont en fin de tableau (estimation peu fiable).

<details><summary>Afficher le tableau complet</summary>

| Carte | Rareté | Famille | Coût | Effet vs sa rareté | z | Effet brut | Victoires (dans le deck) | Victoires (jouée) | Jouée quand présente | Decks |
|---|---|---|---|---|---|---|---|---|---|---|
| Tout pour la place | Violette | Sacrifice | 1 | **+12,8 pt** | 9,0 | +17,2 pt | 62,8 % | 68,2 % | 77 % | 1 440 |
| Furie du grizzli | Violette | Instinct | 1 | **+10,3 pt** | 7,2 | +14,7 pt | 66,7 % | 72,9 % | 76 % | 1 494 |
| Transfusion d’urgence | Violette | Sacrifice | 1 | **+9,4 pt** | 6,6 | +13,8 pt | 58,7 % | 63,9 % | 76 % | 1 498 |
| Humiliation publique | Bleue | Panique | 1 | **+8,9 pt** | 9,0 | +10,6 pt | 59,5 % | 63,2 % | 80 % | 3 226 |
| Sirène d'évacuation | Bleue | Panique | 1 | **+8,1 pt** | 6,8 | +9,8 pt | 57,9 % | 59,6 % | 67 % | 2 126 |
| Charge blindée | Verte | Blindage | 1 | **+7,0 pt** | 13,3 | +6,0 pt | 53,4 % | 55,8 % | 86 % | 14 960 |
| Moquerie cruelle | Verte | Panique | 1 | **+6,9 pt** | 14,5 | +6,0 pt | 54,5 % | 55,6 % | 83 % | 18 386 |
| Évacuation générale | Orange | Panique | 1 | **+6,8 pt** | 4,1 | +11,2 pt | 58,1 % | 61,2 % | 73 % | 1 184 |
| Mouvement de foule (rouge) | Rouge | Panique | 1 | **+6,3 pt** | 3,7 | +13,3 pt | 60,2 % | 62,9 % | 74 % | 1 160 |
| Dévaliser la soute | Violette | Débrouille | 0 | **+6,3 pt** | 4,5 | +10,7 pt | 57,3 % | 59,2 % | 89 % | 1 484 |
| Morsure | Blanche | Instinct | 1 | **+6,1 pt** | 11,4 | +3,7 pt | 59,3 % | 61,9 % | 66 % | 14 424 |
| Divorce express | Bleue | Zizanie | 1 | **+5,8 pt** | 5,7 | +7,5 pt | 51,9 % | 66,6 % | 51 % | 2 992 |
| Morsure enragée | Verte | Instinct | 1 | **+5,7 pt** | 11,4 | +4,8 pt | 60,1 % | 63,1 % | 76 % | 15 862 |
| Fission | Rouge | Mutation | 2 | **+5,3 pt** | 3,2 | +12,3 pt | 57,9 % | 63,0 % | 60 % | 1 174 |
| Cri primal | Blanche | Instinct | 1 | **+5,0 pt** | 9,2 | +2,6 pt | 58,7 % | 56,8 % | 55 % | 13 912 |
| Marché noir | Rouge | Débrouille | 0 | **+4,1 pt** | 2,5 | +11,0 pt | 56,7 % | 57,6 % | 86 % | 1 238 |
| Plateau-repas | Blanche | Débrouille | 1 | **+3,9 pt** | 7,7 | +1,6 pt | 52,1 % | 54,5 % | 73 % | 15 110 |
| Instinct de meute | Verte | Instinct | 1 | **+3,9 pt** | 7,7 | +2,9 pt | 58,6 % | 57,8 % | 70 % | 16 100 |
| Mutation accélérée | Verte | Mutation | 1 | **+3,9 pt** | 7,8 | +2,9 pt | 55,1 % | 57,5 % | 82 % | 16 762 |
| Sérum mutagène | Blanche | Mutation | 1 | **+3,8 pt** | 7,2 | +1,5 pt | 54,3 % | 55,2 % | 79 % | 14 250 |
| Humiliation en direct | Violette | Panique | 1 | **+3,4 pt** | 2,5 | +7,8 pt | 57,5 % | 61,5 % | 80 % | 1 452 |
| Chariot de service | Verte | Débrouille | 1 | **+3,3 pt** | 6,8 | +2,3 pt | 52,8 % | 54,9 % | 79 % | 18 090 |
| Coup d'épaule | Blanche | Blindage | 1 | **+2,7 pt** | 4,6 | +0,3 pt | 50,5 % | 57,7 % | 69 % | 11 746 |
| Pillage de soute | Bleue | Débrouille | 0 | **+2,7 pt** | 2,7 | +4,4 pt | 52,4 % | 54,5 % | 84 % | 3 098 |
| Alerte rouge | Violette | Panique | 1 | **+2,5 pt** | 1,8 | +6,9 pt | 56,8 % | 57,6 % | 70 % | 1 462 |
| Givre | Blanche | Cryogénie | 1 | **+2,5 pt** | 4,7 | +0,1 pt | 46,9 % | 50,5 % | 69 % | 14 342 |
| Grand déballage | Orange | Zizanie | 1 | **+2,5 pt** | 1,5 | +6,8 pt | 48,7 % | 68,3 % | 40 % | 1 198 |
| Réacteur à nu | Violette | Mutation | 2 | **+2,1 pt** | 1,6 | +6,5 pt | 56,1 % | 60,1 % | 60 % | 1 614 |
| Boîte de Petri | Verte | Mutation | 1 | **+2,1 pt** | 4,2 | +1,1 pt | 54,1 % | 55,8 % | 83 % | 16 640 |
| Volée de griffes | Verte | Instinct | 1 | **+1,4 pt** | 3,0 | +0,4 pt | 56,7 % | 60,5 % | 77 % | 18 144 |
| Nuage de retombées | Verte | Mutation | 1 | **+1,3 pt** | 2,7 | +0,4 pt | 53,2 % | 54,5 % | 82 % | 16 824 |
| Coup de griffe | Blanche | Instinct | 1 | **+1,3 pt** | 2,5 | −1,1 pt | 56,4 % | 60,6 % | 68 % | 16 410 |
| Don du sang universel | Orange | Sacrifice | 1 | **+1,2 pt** | 0,8 | +5,6 pt | 50,9 % | 51,5 % | 71 % | 1 198 |
| Coup de folie | Verte | Sacrifice | 1 | **+1,2 pt** | 2,6 | +0,2 pt | 48,0 % | 48,9 % | 79 % | 19 144 |
| Loi de la jungle | Rouge | Instinct | 1 | **+1,0 pt** | 0,6 | +8,0 pt | 55,9 % | 60,8 % | 70 % | 1 246 |
| Fuite d'azote | Blanche | Cryogénie | 1 | **+0,9 pt** | 1,7 | −1,5 pt | 46,3 % | 49,9 % | 69 % | 14 148 |
| Scandale public | Bleue | Zizanie | 1 | **+0,8 pt** | 0,7 | +2,5 pt | 48,7 % | 48,7 % | 62 % | 2 228 |
| Desserte du commandant | Bleue | Débrouille | 1 | **+0,8 pt** | 0,7 | +2,5 pt | 50,6 % | 53,6 % | 66 % | 2 218 |
| Goutte de culture | Blanche | Mutation | 1 | **+0,8 pt** | 1,5 | −1,6 pt | 52,5 % | 54,6 % | 72 % | 14 552 |
| Ruée du troupeau | Orange | Instinct | 1 | **+0,7 pt** | 0,4 | +5,1 pt | 54,9 % | 59,7 % | 72 % | 1 190 |
| Coup de sang | Blanche | Sacrifice | 1 | **+0,6 pt** | 1,2 | −1,7 pt | 46,8 % | 47,1 % | 72 % | 16 502 |
| Drame conjugal | Rouge | Zizanie | 1 | **+0,3 pt** | 0,2 | +7,3 pt | 50,0 % | 53,7 % | 62 % | 1 212 |
| Cale sèche | Orange | Blindage | 1 | **+0,2 pt** | 0,1 | +4,5 pt | 47,3 % | 50,0 % | 76 % | 1 220 |
| Ticket froissé | Blanche | Débrouille | 0 | **−0,0 pt** | −0,0 | −2,4 pt | 49,7 % | 51,6 % | 86 % | 14 728 |
| Insulte | Blanche | Panique | 1 | **−0,1 pt** | −0,1 | −2,4 pt | 49,9 % | 49,9 % | 75 % | 15 252 |
| Inventaire express | Verte | Débrouille | 0 | **−0,1 pt** | −0,3 | −1,1 pt | 51,1 % | 52,9 % | 81 % | 16 412 |
| Rage du dernier mâle | Bleue | Instinct | 1 | **−0,3 pt** | −0,3 | +1,4 pt | 53,3 % | 54,0 % | 79 % | 2 202 |
| Bousculade | Blanche | Panique | 1 | **−0,5 pt** | −0,9 | −2,8 pt | 49,0 % | 49,9 % | 70 % | 14 030 |
| Bélier | Bleue | Blindage | 1 | **−0,5 pt** | −0,5 | +1,2 pt | 50,4 % | 52,6 % | 80 % | 3 148 |
| Fuite de la cuve | Blanche | Mutation | 1 | **−0,9 pt** | −1,8 | −3,3 pt | 51,8 % | 53,0 % | 68 % | 14 176 |
| Bâche goudronnée | Blanche | Blindage | 1 | **−1,1 pt** | −2,0 | −3,5 pt | 48,6 % | 50,5 % | 64 % | 13 212 |
| Frénésie du glouton | Bleue | Instinct | 1 | **−1,2 pt** | −1,2 | +0,5 pt | 52,4 % | 56,3 % | 77 % | 2 902 |
| Fouiller les caisses | Blanche | Débrouille | 0 | **−1,3 pt** | −2,3 | −3,6 pt | 49,0 % | 50,9 % | 74 % | 13 520 |
| Ticket de rationnement | Verte | Débrouille | 0 | **−1,3 pt** | −2,7 | −2,3 pt | 49,8 % | 51,5 % | 87 % | 17 256 |
| Congère | Verte | Cryogénie | 1 | **−1,4 pt** | −2,8 | −2,4 pt | 45,8 % | 49,4 % | 64 % | 16 522 |
| Dernière volonté | Rouge | Sacrifice | 1 | **−1,9 pt** | −1,2 | +5,0 pt | 50,6 % | 51,8 % | 76 % | 1 198 |
| Pansement de fortune | Blanche | Sacrifice | 1 | **−1,9 pt** | −3,7 | −4,3 pt | 45,0 % | 41,0 % | 72 % | 14 938 |
| Mouvement de foule (verte) | Verte | Panique | 1 | **−2,0 pt** | −4,1 | −3,0 pt | 49,2 % | 50,0 % | 68 % | 16 158 |
| Éclat de caisson | Violette | Cryogénie | 1 | **−2,1 pt** | −1,5 | +2,3 pt | 47,3 % | 52,3 % | 70 % | 1 434 |
| Bandage serré | Verte | Sacrifice | 1 | **−2,1 pt** | −4,4 | −3,1 pt | 45,4 % | 42,6 % | 77 % | 17 890 |
| Lettre anonyme | Blanche | Zizanie | 1 | **−2,1 pt** | −3,8 | −4,5 pt | 39,6 % | 41,3 % | 72 % | 13 476 |
| Barricade de caisses | Verte | Blindage | 1 | **−2,1 pt** | −4,3 | −3,1 pt | 48,2 % | 49,1 % | 73 % | 16 352 |
| Baroud d’honneur | Bleue | Sacrifice | 1 | **−2,1 pt** | −1,8 | −0,4 pt | 47,8 % | 50,6 % | 75 % | 2 086 |
| Couverture de survie | Verte | Blindage | 1 | **−2,2 pt** | −4,5 | −3,2 pt | 48,5 % | 49,8 % | 74 % | 16 758 |
| Porte de casier | Blanche | Blindage | 1 | **−2,3 pt** | −4,2 | −4,7 pt | 47,6 % | 49,0 % | 63 % | 13 316 |
| Stalactite | Verte | Cryogénie | 1 | **−2,6 pt** | −5,3 | −3,6 pt | 44,4 % | 47,2 % | 72 % | 16 218 |
| Huile sur le feu | Blanche | Zizanie | 1 | **−2,7 pt** | −5,3 | −5,0 pt | 40,4 % | 64,1 % | 28 % | 15 862 |
| Règlement de comptes | Violette | Zizanie | 1 | **−2,7 pt** | −1,9 | +1,7 pt | 45,3 % | 63,7 % | 51 % | 1 458 |
| Prise de sang | Blanche | Sacrifice | 1 | **−2,8 pt** | −6,1 | −5,1 pt | 45,2 % | 45,3 % | 40 % | 19 634 |
| Caisson cryogénique | Bleue | Cryogénie | 2 | **−2,8 pt** | −2,3 | −1,1 pt | 47,5 % | 47,8 % | 47 % | 2 040 |
| Masse critique | Violette | Mutation | 1 | **−2,8 pt** | −1,9 | +1,6 pt | 53,1 % | 66,7 % | 44 % | 1 326 |
| Alarme incendie | Verte | Panique | 1 | **−3,0 pt** | −5,7 | −3,9 pt | 48,8 % | 47,1 % | 72 % | 15 004 |
| Pic à glace | Blanche | Cryogénie | 1 | **−3,1 pt** | −5,8 | −5,4 pt | 44,3 % | 46,7 % | 65 % | 14 298 |
| Cri de panique | Blanche | Panique | 1 | **−3,1 pt** | −5,5 | −5,5 pt | 47,9 % | 43,1 % | 47 % | 13 040 |
| Dossier compromettant | Verte | Zizanie | 1 | **−3,1 pt** | −6,0 | −4,1 pt | 40,3 % | 42,0 % | 78 % | 14 966 |
| Buffet à volonté | Orange | Débrouille | 1 | **−3,4 pt** | −2,1 | +1,0 pt | 48,6 % | 49,6 % | 64 % | 1 208 |
| Kit de survie | Bleue | Sacrifice | 1 | **−3,5 pt** | −3,7 | −1,8 pt | 46,4 % | 44,2 % | 74 % | 3 492 |
| Saignée | Verte | Sacrifice | 1 | **−3,6 pt** | −7,9 | −4,6 pt | 45,3 % | 47,1 % | 69 % | 19 394 |
| Brise-glace | Bleue | Cryogénie | 1 | **−3,6 pt** | −3,5 | −1,9 pt | 44,6 % | 45,7 % | 66 % | 2 908 |
| Zéro kelvin | Orange | Cryogénie | 1 | **−3,6 pt** | −2,2 | +0,7 pt | 44,8 % | 48,0 % | 69 % | 1 218 |
| Sas de confinement | Bleue | Blindage | 1 | **−3,8 pt** | −3,3 | −2,1 pt | 46,4 % | 46,1 % | 71 % | 2 332 |
| Banquet du commandant | Violette | Débrouille | 1 | **−3,8 pt** | −2,9 | +0,6 pt | 49,3 % | 52,5 % | 64 % | 1 690 |
| Ragot venimeux | Verte | Zizanie | 1 | **−3,8 pt** | −8,2 | −4,8 pt | 41,4 % | 41,2 % | 72 % | 18 848 |
| Scène de ménage | Verte | Zizanie | 1 | **−4,1 pt** | −8,4 | −5,0 pt | 41,0 % | 59,0 % | 40 % | 17 632 |
| Fuite du cœur | Orange | Mutation | 1 | **−4,2 pt** | −2,5 | +0,1 pt | 48,7 % | 50,2 % | 76 % | 1 184 |
| Extincteur | Verte | Cryogénie | 2 | **−4,4 pt** | −9,0 | −5,4 pt | 44,2 % | 45,6 % | 44 % | 16 968 |
| Hiver nucléaire | Violette | Cryogénie | 2 | **−4,5 pt** | −3,4 | −0,1 pt | 47,6 % | 49,7 % | 57 % | 1 618 |
| Rumeur de couloir | Blanche | Zizanie | 1 | **−4,6 pt** | −8,8 | −6,9 pt | 38,7 % | 37,5 % | 65 % | 15 008 |
| Chef de meute | Violette | Instinct | 1 | **−4,7 pt** | −3,5 | −0,3 pt | 54,3 % | 55,9 % | 54 % | 1 596 |
| Pluie radioactive | Bleue | Mutation | 1 | **−5,7 pt** | −5,5 | −4,0 pt | 47,9 % | 48,6 % | 73 % | 2 764 |
| Ère glaciaire | Rouge | Cryogénie | 2 | **−6,2 pt** | −3,7 | +0,8 pt | 44,7 % | 46,5 % | 64 % | 1 190 |
| Mutation incontrôlée | Bleue | Mutation | 1 | **−6,2 pt** | −5,0 | −4,5 pt | 45,3 % | 47,3 % | 64 % | 1 930 |
| Crise de jalousie | Violette | Zizanie | 1 | **−7,3 pt** | −5,0 | −2,9 pt | 43,0 % | 39,0 % | 44 % | 1 368 |
| Coque de l’arche | Violette | Blindage | 2 | **−8,8 pt** | −6,3 | −4,5 pt | 44,6 % | 43,2 % | 36 % | 1 472 |
| Arche de Noé | Rouge | Blindage | 2 | **−9,0 pt** | −5,4 | −2,0 pt | 44,8 % | 47,9 % | 63 % | 1 182 |
| Éperon de proue | Violette | Blindage | 2 | **−10,9 pt** | −7,4 | −6,5 pt | 41,9 % | 55,9 % | 36 % | 1 330 |
| Faux témoignage | Verte | Coup bas | 1 | **+19,8 pt** | 4,3 | +18,8 pt | 71,7 % | 76,8 % | 79 % | 120 |
| Croche-pied | Verte | Coup bas | 1 | **+3,9 pt** | 1,2 | +2,9 pt | 53,1 % | 55,6 % | 59 % | 228 |
| Pot-de-vin | Verte | Coup bas | 1 | **−2,8 pt** | −0,7 | −3,8 pt | 52,5 % | 60,0 % | 22 % | 204 |
| Coup de coude | Verte | Coup bas | 1 | **−3,9 pt** | −1,1 | −4,8 pt | 46,0 % | 45,1 % | 67 % | 198 |

</details>

## Reproduire

Depuis `outils/simulateur` (Node 18 ou plus récent, aucune dépendance) :

```bash
node simuler.js --tables 1200
node analyse.js
node ajustements.js
node ajustements-classes.js
node rapport.js
```
