#!/usr/bin/env node
'use strict';
// Rédige le rapport d'équilibrage (Markdown, en français) à partir de
// resultats/synthese.json et, s'il existe, resultats/ajustements.json.
//   node rapport.js [--synthese ...] [--ajustements ...] [--sortie RAPPORT.md]
const fs = require('fs');
const path = require('path');

function args() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
  return o;
}
const o = args();
const dir = path.join(__dirname, 'resultats');
const S = JSON.parse(fs.readFileSync(path.resolve(o.synthese || path.join(dir, 'synthese.json')), 'utf8'));
const fA = path.resolve(o.ajustements || path.join(dir, 'ajustements.json'));
const A = fs.existsSync(fA) ? JSON.parse(fs.readFileSync(fA, 'utf8')) : null;
const fAC = path.resolve(o['ajustements-classes'] || path.join(dir, 'ajustements-classes.json'));
const AC = fs.existsSync(fAC) ? JSON.parse(fs.readFileSync(fAC, 'utf8')) : null;

const nb = (x, d = 1) => (x == null || Number.isNaN(x) ? '–' : x.toFixed(d).replace('.', ',').replace(/^-/, '−'));
const pct = (x, d = 1) => (x == null ? '–' : nb(100 * x, d) + ' %');
const pts = (x, d = 1) => (x >= 0 ? '+' : '−') + nb(Math.abs(100 * x), d) + ' pt';
const mil = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const tv = (t) => (t && t.n ? `${pct(t.taux)} (${pct(t.ic[0])}–${pct(t.ic[1])})` : '–');
const RAR = { blanche: 'Blanche', verte: 'Verte', bleue: 'Bleue', violette: 'Violette', orange: 'Orange', rouge: 'Rouge' };
// Deux cartes peuvent porter le même nom (ex. une verte et une rouge) : on précise la rareté.
const doublons = (() => {
  const vus = {};
  S.cartes.forEach((c) => { vus[c.nom] = (vus[c.nom] || 0) + 1; });
  return new Set(Object.keys(vus).filter((k) => vus[k] > 1));
})();
const RAR0 = { blanche: 'blanche', verte: 'verte', bleue: 'bleue', violette: 'violette', orange: 'orange', rouge: 'rouge' };
for (const c of S.cartes.concat(A ? A.cartes : [])) if (doublons.has(c.nom)) c.nom = `${c.nom} (${RAR0[c.rarete] || c.rarete})`;
const ET = S.etages;
const ETS = ['1', '2', '3', '4', '5'];
const signif = (t) => t && t.n && (t.ic[0] > 0.5 || t.ic[1] < 0.5);
const gras = (t, s) => (signif(t) ? `**${s}**` : s);

const L = [];
const p = (s = '') => L.push(s);

// --- Synthèses calculées
const classes = Object.entries(S.classes).map(([id, c]) => ({ id, ...c })).sort((a, b) => b.tous.taux - a.tous.taux);
const familles = Object.entries(S.familles).filter(([k]) => k !== '(aucune)').map(([k, v]) => ({ k, ...v })).sort((a, b) => b.tous.taux - a.tous.taux);
const cartes = S.cartes.filter((c) => c.decks >= 200 && !c.coupBas);
const fortes = cartes.filter((c) => c.zRel >= 3 && c.effetRel >= 0.02).sort((a, b) => b.effetRel - a.effetRel);
const faibles = cartes.filter((c) => c.zRel <= -3 && c.effetRel <= -0.02).sort((a, b) => a.effetRel - b.effetRel);
const { chargerMoteur } = require('./moteur.js');
const MOT = chargerMoteur();
const note = (c) => {
  const k = MOT.CARDS[c.id] || {};
  const n = [];
  if (k.target === 'all') n.push('touche « tous les ennemis » : un seul en duel');
  if (k.jealous) n.push('Jalousie : détourne vers un partenaire absent en duel');
  if (k.keepBlock || k.blockLock) n.push('valeur sur plusieurs tours, mal vue par le bot');
  if (c.tauxJouee < 0.5) n.push(`le bot ne la joue que ${pct(c.tauxJouee, 0)} du temps`);
  return n.join(' ; ');
};
const ajust = A ? new Map(A.cartes.map((c) => [c.id, c])) : new Map();

p('# Rapport d’équilibrage de Surbooking (simulation de bots)');
p();
p(`Jeu ${S.jeu.version} (empreinte du moteur \`${S.jeu.moteur}\`). Rapport généré le ${S.genere.slice(0, 10)}.`);
p(`**${mil(S.tables)} tables** de 4 bots, soit **${mil(S.duels)} duels**, jouées par \`outils/simulateur\`.`);
p();
p('> Aucune carte n’a été modifiée dans le jeu. Les ajustements proposés plus bas ont seulement été essayés dans la mémoire du simulateur, sur les mêmes decks et les mêmes graines, pour en chiffrer l’effet.');
p();

// --- Résumé
p('## En bref');
p();
const cHaut = classes[0];
const cBas = classes[classes.length - 1];
p(`- **Classes** : écart de ${pts(cHaut.tous.taux - cBas.tous.taux)} entre la plus forte, ${cHaut.nom} (${pct(cHaut.tous.taux)}), et la plus faible, ${cBas.nom} (${pct(cBas.tous.taux)}). Voir [Classes](#classes).`);
const fH = familles[0];
const fB = familles[familles.length - 1];
p(`- **Familles** : ${fH.k} domine (${pct(fH.tous.taux)} de victoires quand c’est la famille principale du deck), ${fB.k} ferme la marche (${pct(fB.tous.taux)}). Voir [Familles](#familles).`);
p(`- **Cartes** : ${fortes.length} cartes nettement trop fortes et ${faibles.length} nettement trop faibles pour leur rareté (au moins 2 points de victoire par exemplaire d’écart avec la moyenne de leur rareté, |z| ≥ 3).`);
if (fortes.length) p(`  - Les plus fortes : ${fortes.slice(0, 5).map((c) => `${c.nom} (${pts(c.effetRel)})`).join(', ')}.`);
if (faibles.length) p(`  - Les plus faibles : ${faibles.slice(0, 5).map((c) => `${c.nom} (${pts(c.effetRel)})`).join(', ')}.`);
const ch = S.camp.tous;
p(`- **Qui commence** : le camp qui joue en premier gagne ${pct(ch.taux)} des duels (${pct(ch.ic[0])}–${pct(ch.ic[1])}).`);
if (A) {
  const retenus = A.cartes.filter((c) => c.choix);
  p(`- **${retenus.length} ajustements chiffrés** proposés et testés en simulation, voir [Ajustements proposés](#ajustements-proposés).`);
}
p();

// --- Lecture rédigée à la main (facultative), gardée d'une génération à l'autre
const fCom = path.resolve(o.commentaire || path.join(__dirname, 'commentaire.md'));
if (fCom && fs.existsSync(fCom)) {
  p(fs.readFileSync(fCom, 'utf8').trim());
  p();
}

// --- Méthode
p('## Méthode');
p();
p('1. **Draft** : à chaque table, 4 bots de classes tirées au hasard draftent les 4 étages avec l’IA de draft du jeu (`ghostFloor1` du moteur : 4 boosters par étage, 12 choix, 8 cartes gardées). Les familles en jeu, les boosters et les choix sont ceux du vrai moteur.');
p('2. **Duels d’étage** : après chaque étage, chaque bot affronte les 3 autres avec son deck du moment (cartes de base de sa classe comprises, fusions automatiques), **dans les deux ordres** (premier et second à jouer), soit 12 duels par étage. PV : ceux de la classe à l’étage (75, 143, 165, 180 de base).');
p('3. **Finale** : deux paires tirées au hasard draftent le booster de finale (2 × 4 cartes, oranges et rouges comprises, choix à la manière de l’IA de finale du jeu), puis s’affrontent dans les deux ordres à 280 PV de base.');
p('4. **Combat** : le mode duel en ligne du moteur (`duelBuild` / `duelAct`), donc les vraies règles. Les deux camps sont joués par le même bot : il essaie chaque carte jouable sur une copie de la partie, termine le tour de façon gloutonne pour les 3 meilleures (plus les cartes de pioche ou d’énergie), et joue celle qui donne la meilleure position (PV, armure utile face à la menace mesurée, Force, Faiblesse, Vulnérabilité, Gel, Radiation…). Il passe quand plus rien n’améliore sa position.');
p('5. **Statistiques** : taux de victoire avec intervalle de confiance à 95 % (Wilson). Pour les cartes, en plus des taux bruts, un **modèle logistique** sur tous les duels estime l’effet propre de chaque exemplaire d’une carte, *toutes choses égales par ailleurs* (autres cartes, classes, étage, ordre de jeu). L’« effet » est exprimé en points de probabilité de victoire par exemplaire, autour de 50 %, **comparé à la moyenne des cartes de même rareté** (une violette doit battre une blanche : ce qu’on cherche, ce sont les cartes hors norme pour leur rang).');
p();
p('**Limites à garder en tête** : un bot glouton sous-estime les cartes de mise en place (Radiation à long terme, combos en plusieurs tours, cartes qui demandent de garder de l’énergie) et surestime les effets immédiats. Les decks sont ceux de l’IA de draft, pas ceux de joueurs humains. Les duels d’étage partent à PV pleins, alors qu’en vrai partie le duel d’étage suit des combats contre les monstres. Les monstres de l’arche (combats JcE) ne sont pas simulés. Les classements ci-dessous sont donc des **signaux à confirmer en jeu**, pas des verdicts.');
p();

// --- Ordre de jeu
p('## Avantage de jouer en premier');
p();
p('| Phase | Victoires du camp qui commence | Tours moyens | Duels allant jusqu’à la limite de tours |');
p('|---|---|---|---|');
for (const e of ETS) if (S.camp[e]) p(`| ${ET[e]} | ${gras(S.camp[e], tv(S.camp[e]))} | ${nb(S.tours[e].moy)} | ${pct(S.tours[e].limite)} |`);
p(`| **Tous** | ${gras(S.camp.tous, tv(S.camp.tous))} | | |`);
p();
p('En duel en ligne, le camp qui commence joue son premier tour avec 1 énergie de moins, et l’autre reçoit 1 énergie de plus à son premier tour. Un taux proche de 50 % indique que cette compensation est bien calibrée ; un écart en gras est statistiquement significatif.');
p();

// --- Classes
p('## Classes');
p();
p('Taux de victoire des classes (duels miroirs exclus), avec l’intervalle à 95 %. La colonne « effet propre » vient du modèle : c’est l’écart de la classe par rapport au Postulant **à decks égaux** : il mesure le talent, l’inconvénient et les PV de la classe, sans l’effet des cartes draftées.');
p();
p(`| Classe | PV | Tous duels | ${ETS.map((e) => ET[e]).join(' | ')} | Effet propre vs Postulant |`);
p(`|---|---|---|${ETS.map(() => '---').join('|')}|---|`);
for (const c of classes) {
  const eff = c.id === 'postulant' ? 'référence' : `${pts(c.beta / 4)} (z = ${nb(c.beta / (c.se || 1), 1)})`;
  p(`| ${c.nom} | ×${nb(c.pv, 2)} | ${gras(c.tous, tv(c.tous))} | ${ETS.map((e) => gras(c.parEtage[e], pct(c.parEtage[e].taux))).join(' | ')} | ${eff} |`);
}
p();
p('**Matchups** (ligne contre colonne, taux de victoire de la ligne, toutes phases) :');
p();
p(`| | ${classes.map((c) => c.nom).join(' | ')} |`);
p(`|---|${classes.map(() => '---').join('|')}|`);
for (const a of classes) p(`| **${a.nom}** | ${classes.map((b) => (a.id === b.id ? '·' : gras(S.matchups[a.id + '|' + b.id], pct((S.matchups[a.id + '|' + b.id] || {}).taux, 0)))).join(' | ')} |`);
p();

if (AC) {
  p('**Ajustements de classes testés** : pour chaque classe à plus de 2 points de 50 %, on a rejoué jusqu’à ' + AC.echantillon + ' de ses duels (hors miroirs) en changeant ses PV ou un chiffre d’une de ses deux cartes de base. Deux pistes par classe, au choix : la plus proche de 50 % côté PV, et côté carte de base.');
  p();
  p('| Classe | Victoires actuelles | Piste PV | → victoires | Piste carte de base | → victoires |');
  p('|---|---|---|---|---|---|');
  const desc = (v) => (v ? (v.classe ? `PV ×${nb(v.avant, 2)} → **×${nb(v.valeur, 2)}**` : `${v.nomCarte} : ${v.nomChamp} ${v.avant} → **${v.valeur}**`) : '_aucune ne suffit_');
  for (const c of AC.classes) p(`| ${c.nom} | ${pct(c.taux)} | ${desc(c.choixPv)} | ${c.choixPv ? pct(c.choixPv.apres) : '–'} | ${desc(c.choixCarte)} | ${c.choixCarte ? pct(c.choixCarte.apres) : '–'} |`);
  p();
  p('<details><summary>Toutes les variantes de classes essayées</summary>');
  p();
  p('| Classe | Variante | Victoires après (estimées) | Écart | Duels qui basculent |');
  p('|---|---|---|---|---|');
  for (const c of AC.classes) for (const v of c.essais) p(`| ${c.nom} | ${desc(v).replace(/\*\*/g, '')} | ${pct(v.apres)} | ${pts(v.delta)} | ${v.bascules} / ${c.echantillon} |`);
  p();
  p('</details>');
  p();
}

// --- Familles
p('## Familles');
p();
p('La famille principale d’un deck est sa spécialisation active au palier le plus haut (le moteur en active 2 au plus). Taux de victoire selon la famille principale :');
p();
const tot = familles.reduce((s, f) => s + f.tous.n, 0);
p(`| Famille | Part des decks | Tous duels | ${ETS.map((e) => ET[e]).join(' | ')} |`);
p(`|---|---|---|${ETS.map(() => '---').join('|')}|`);
for (const f of familles) p(`| ${f.k} | ${pct(f.tous.n / tot)} | ${gras(f.tous, tv(f.tous))} | ${ETS.map((e) => gras(f.parEtage[e], pct(f.parEtage[e].taux))).join(' | ')} |`);
p();
p('**Par palier de spécialisation** (taux de victoire des decks ayant cette famille active à ce palier) :');
p();
const paliers = [1, 2, 3, 4];
p(`| Famille | ${paliers.map((t) => 'Palier ' + t).join(' | ')} |`);
p(`|---|${paliers.map(() => '---').join('|')}|`);
for (const f of familles) p(`| ${f.k} | ${paliers.map((t) => { const x = S.famillesPaliers[f.k + '|' + t]; return x && x.n >= 30 ? `${gras(x, pct(x.taux))} <sub>(${mil(x.n)})</sub>` : '–'; }).join(' | ')} |`);
p();
p('**Matchups de familles** (famille principale de la ligne contre celle de la colonne) :');
p();
p(`| | ${familles.map((f) => f.k).join(' | ')} |`);
p(`|---|${familles.map(() => '---').join('|')}|`);
for (const a of familles) p(`| **${a.k}** | ${familles.map((b) => { if (a.k === b.k) return '·'; const x = S.famillesMatchups[a.k + '|' + b.k]; return x && x.n >= 30 ? gras(x, pct(x.taux, 0)) : '–'; }).join(' | ')} |`);
p();

// --- Cartes
const ligneCarte = (c, avecNote) => `| ${c.nom} | ${RAR[c.rarete] || c.rarete} | ${c.famille} | ${c.cout} | **${pts(c.effetRel)}** | ${nb(c.zRel)} | ${pts(c.effet)} | ${pct(c.tvDeck.taux)} | ${pct(c.tvJouee.taux)} | ${pct(c.tauxJouee, 0)} | ${mil(c.decks)} |${avecNote ? ` ${note(c)} |` : ''}`;
const entete = (avecNote) => ['| Carte | Rareté | Famille | Coût | Effet vs sa rareté | z | Effet brut | Victoires (dans le deck) | Victoires (jouée) | Jouée quand présente | Decks |' + (avecNote ? ' À savoir |' : ''), '|---|---|---|---|---|---|---|---|---|---|---|' + (avecNote ? '---|' : '')];
p('## Cartes trop fortes');
p();
p(`Effet propre d’au moins +2 points de victoire par exemplaire au-dessus de la moyenne de sa rareté, avec z ≥ 3 (très peu de chances que ce soit du bruit). Moyennes par rareté, par rapport à une carte moyenne du jeu : ${Object.entries(S.moyennesRarete).map(([k, v]) => `${RAR[k] || k} ${pts(v)}`).join(', ')}. « Effet brut » = sans cette correction.`);
p();
if (fortes.length) { entete(true).forEach((x) => p(x)); fortes.forEach((c) => p(ligneCarte(c, true))); } else p('_Aucune carte ne franchit le seuil._');
p();
p('## Cartes trop faibles');
p();
p('Au moins 2 points de victoire par exemplaire sous la moyenne de sa rareté, avec z ≤ −3. **Attention** : seuls les duels sont simulés. Les cartes qui touchent « tous les ennemis » ou qui misent sur la Jalousie (détourner un coup vers le partenaire) sont pensées pour les couples de monstres de l’arche, et perdent forcément de leur intérêt en duel. Une carte peu jouée par le bot peut aussi être une carte de mise en place qu’un joueur glouton exploite mal. La colonne « À savoir » le signale : ces cartes-là sont à juger aussi en JcE avant d’y toucher.');
p();
if (faibles.length) { entete(true).forEach((x) => p(x)); faibles.forEach((c) => p(ligneCarte(c, true))); } else p('_Aucune carte ne franchit le seuil._');
p();

// --- Ajustements
p('## Ajustements proposés');
p();
if (!A) p('_Pas encore calculés : lancer `node ajustements.js`._');
else {
  p(`Pour chaque carte signalée, plusieurs variantes chiffrées ont été essayées en mémoire, en rejouant jusqu’à ${A.echantillon} duels où un seul camp possède la carte (ou en a plus d’exemplaires), avec les mêmes decks et les mêmes graines. Le rejeu sans modification redonne le même résultat (colonne « Rejeu identique »), donc toute différence vient de la variante. On retient la variante dont l’effet résiduel estimé est le plus proche de 0.`);
  p();
  p('| Carte | Proposition | Effet vs sa rareté, actuel | Effet estimé après | Victoires du porteur avant → après | Rejeu identique | Duels |');
  p('|---|---|---|---|---|---|---|');
  for (const c of A.cartes) {
    if (!c.choix) continue;
    const v = c.choix;
    p(`| ${c.nom} | **${v.desc}** | ${pts(c.beta / 4)} | ${pts(v.betaApres / 4)} | ${pct(c.tvPorteurBase)} → ${pct(v.tvPorteur)} | ${pct(c.rejeuIdentique, 0)} | ${c.echantillon} |`);
  }
  const sans = A.cartes.filter((c) => !c.choix);
  if (sans.length) {
    p();
    p(`Sans proposition (aucune variante essayée ne déplace assez le résultat dans le bon sens) : ${sans.map((c) => `${c.nom} (${pts(c.beta / 4)})`).join(', ')}. Pour celles-ci, l’effet tient sans doute au mécanisme de la carte plus qu’à ses chiffres, ou au jeu du bot : à revoir à la main.`);
  }
  p();
  p('<details><summary>Toutes les variantes essayées</summary>');
  p();
  for (const c of A.cartes) {
    p(`**${c.nom}** (${RAR[c.rarete] || c.rarete}, ${c.famille}) — effet actuel ${pts(c.beta / 4)}, porteur à ${pct(c.tvPorteurBase)} sur ${c.echantillon} duels.`);
    p();
    p('| Variante | Victoires du porteur | Écart | Duels qui basculent | Effet estimé après |');
    p('|---|---|---|---|---|');
    for (const v of c.essais) p(`| ${v.desc} | ${pct(v.tvPorteur)} | ${pts(v.delta)} | ${v.bascules} | ${pts(v.betaApres / 4)} |`);
    p();
  }
  p('</details>');
  p();
  p('Ces chiffres supposent des decks inchangés : en vrai partie, l’IA de draft choisit selon la valeur `value` des cartes, qui n’a pas été modifiée. Si un ajustement est retenu, penser aussi à mettre à jour le texte et, au besoin, la valeur de draft de la carte.');
}
p();

// --- Annexe
p('## Annexe : toutes les cartes');
p();
p('Triées par effet comparé à leur rareté. Les coups bas et les cartes vues dans moins de 200 decks sont en fin de tableau (estimation peu fiable).');
p();
p('<details><summary>Afficher le tableau complet</summary>');
p();
entete(false).forEach((x) => p(x));
const toutes = S.cartes.slice().sort((a, b) => (b.decks >= 200 && !b.coupBas) - (a.decks >= 200 && !a.coupBas) || b.effetRel - a.effetRel);
toutes.forEach((c) => p(ligneCarte(c, false)));
p();
p('</details>');
p();
p('## Reproduire');
p();
p('Depuis `outils/simulateur` (Node 18 ou plus récent, aucune dépendance) :');
p();
p('```bash');
p(`node simuler.js --tables ${S.tables}`);
p('node analyse.js');
p('node ajustements.js');
p('node ajustements-classes.js');
p('node rapport.js');
p('```');
p();

const sortie = path.resolve(o.sortie || path.join(__dirname, 'RAPPORT.md'));
fs.writeFileSync(sortie, L.join('\n'));
process.stderr.write(`Rapport écrit dans ${sortie}\n`);
