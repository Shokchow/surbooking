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
