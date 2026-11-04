#!/usr/bin/env node
'use strict';
// Teste des ajustements chiffrés sur les cartes signalées par l'analyse.
//   node ajustements.js --duels resultats/duels.jsonl --synthese resultats/synthese.json \
//                       --sortie resultats/ajustements.json [--echantillon 600] [--cartes 8]
//
// Rien n'est modifié dans le jeu : la variante d'une carte n'existe que dans la
// mémoire du simulateur, le temps de rejouer les mêmes duels (mêmes decks, mêmes
// graines). La différence de résultat du camp qui possède la carte mesure l'effet
// de l'ajustement ; on retient celui qui ramène l'effet de la carte (relatif aux
// cartes de même rareté) vers 0.
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Worker, isMainThread, parentPort } = require('worker_threads');

const CHAMPS = ['dmg', 'block', 'poison', 'heal', 'halfMult', 'halfCap', 'freeze', 'weak', 'vuln', 'jealous', 'force', 'forcePerHit', 'forceMult', 'poisonMult', 'draw', 'energy', 'grudgeGain', 'grudgeK', 'perCard', 'dmgFromBlock', 'bonusFrozen', 'jealousBoost', 'hits'];
const NOMS = { dmg: 'dégâts', block: 'armure', poison: 'Radiation', heal: 'soin', freeze: 'Gel', weak: 'Faiblesse', vuln: 'Vulnérabilité', jealous: 'Jalousie', force: 'Force', forcePerHit: 'Force par coup', draw: 'pioche', energy: 'énergie', grudgeGain: 'Rancune', perCard: 'bonus par carte', dmgFromBlock: 'dégâts par armure', bonusFrozen: 'bonus contre gelé', jealousBoost: 'bonus de Jalousie', hits: 'nombre de coups', cost: 'coût', halfMult: 'multiplicateur de dégâts', halfCap: 'plafond de PV perdus', forceMult: 'multiplicateur de Force', poisonMult: 'multiplicateur de Radiation', grudgeK: 'part des Griefs' };

function args() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
  return o;
}

// Variantes candidates d'une carte : chiffre principal (±1, ±2, ±30 %, ±50 %),
// chiffre secondaire (±1), les deux ensemble, et le coût (±1).
function variantes(carte, sens) {
  const out = [];
  const champs = CHAMPS.filter((k) => typeof carte[k] === 'number' && carte[k] > 0);
  const ajouter = (modifs) => {
    modifs = modifs.filter((m) => m.valeur !== carte[m.champ]);
    if (!modifs.length) return;
    for (const m of modifs) {
      if (m.champ === 'cost' && (m.valeur < 0 || m.valeur > 3)) return;
      if (m.champ !== 'cost' && m.valeur < 1) return;
    }
    const cle = modifs.map((m) => m.champ + '=' + m.valeur).join('&');
    if (out.some((v) => v.cle === cle)) return;
    out.push({ cle, modifs: modifs.map((m) => ({ champ: m.champ, avant: carte[m.champ], valeur: m.valeur })) });
  };
  const [prim, sec] = champs;
  const ech = (v, f) => (sens < 0 ? Math.min(v - 1, Math.round(v * f)) : Math.max(v + 1, Math.round(v * f)));
  if (prim) {
    const v = carte[prim];
    ajouter([{ champ: prim, valeur: v + sens }]);
    ajouter([{ champ: prim, valeur: v + 2 * sens }]);
    ajouter([{ champ: prim, valeur: ech(v, sens < 0 ? 0.7 : 1.3) }]);
    ajouter([{ champ: prim, valeur: ech(v, sens < 0 ? 0.5 : 1.5) }]);
  }
  if (sec) {
    ajouter([{ champ: sec, valeur: carte[sec] + sens }]);
    ajouter([{ champ: prim, valeur: ech(carte[prim], sens < 0 ? 0.7 : 1.3) }, { champ: sec, valeur: carte[sec] + sens }]);
  }
  ajouter([{ champ: 'cost', valeur: (carte.cost || 0) - sens }]);
  return out;
}

if (isMainThread) {
  (async () => {
    const o = args();
    const dir = path.join(__dirname, 'resultats');
    const synth = JSON.parse(fs.readFileSync(path.resolve(o.synthese || path.join(dir, 'synthese.json')), 'utf8'));
    const nEch = +(o.echantillon || 600);
    const nCartes = +(o.cartes || 8);
    const { chargerMoteur } = require('./moteur.js');
    const E = chargerMoteur();
    const estBase = (id) => !E.CARDS[id] || E.CARDS[id].rarity === 'base';

    const seuilDecks = +(o['min-decks'] || 400);
    const seuilZ = +(o['min-z'] || 3);
    const ok = (c) => !c.coupBas && c.decks >= seuilDecks && Math.abs(c.zRel) >= seuilZ;
    const fortes = synth.cartes.filter((c) => ok(c) && c.effetRel >= 0.02).sort((a, b) => b.effetRel - a.effetRel).slice(0, nCartes);
    const faibles = synth.cartes.filter((c) => ok(c) && c.effetRel <= -0.02).sort((a, b) => a.effetRel - b.effetRel).slice(0, nCartes);
    const cibles = fortes.map((c) => ({ c, sens: -1 })).concat(faibles.map((c) => ({ c, sens: 1 })));

    // Échantillon de duels par carte : ceux où les deux camps n'en ont pas le même nombre.
    const ech = new Map(cibles.map((x) => [x.c.id, []]));
    const vus = new Map(cibles.map((x) => [x.c.id, 0]));
    let alea = 12345;
    const rnd = () => ((alea = (alea * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const rl = readline.createInterface({ input: fs.createReadStream(path.resolve(o.duels || path.join(dir, 'duels.jsonl'))) });
    for await (const l of rl) {
      if (!l.trim()) continue;
      const d = JSON.parse(l);
      if (d.gagnant < 0) continue;
      const decks = d.cartes.map((c, i) => E.autoFuseIds(E.classDeck(d.cls[i]).concat(c)).filter((x) => !estBase(x)));
      for (const { c } of cibles) {
        const n0 = decks[0].filter((x) => x === c.id).length;
        const n1 = decks[1].filter((x) => x === c.id).length;
        if (n0 === n1) continue;
        const k = vus.get(c.id) + 1;
        vus.set(c.id, k);
        const liste = ech.get(c.id);
        const item = { d: { table: d.table, etage: d.etage, graine: d.graine, cls: d.cls, cartes: d.cartes }, gagnant: d.gagnant, porteur: n0 > n1 ? 0 : 1, ecart: Math.abs(n0 - n1) };
        if (liste.length < nEch) liste.push(item);
        else { const j = Math.floor(rnd() * k); if (j < nEch) liste[j] = item; }
      }
    }

    const travaux = [];
    for (const { c, sens } of cibles) {
      travaux.push({ id: c.id, variante: null }); // témoin : vérifie que le rejeu est identique
      for (const v of variantes(E.CARDS[c.id], sens)) travaux.push({ id: c.id, variante: v });
    }
    const fils = Math.max(1, +(o.fils || os.cpus().length));
    const resultats = new Array(travaux.length);
    let prochain = 0;
    let faits = 0;
    const t0 = Date.now();
    await new Promise((fin) => {
      let actifs = fils;
      for (let f = 0; f < fils; f++) {
        const w = new Worker(__filename);
        const donner = () => {
          if (prochain >= travaux.length) return w.postMessage(null);
          const k = prochain++;
          w.postMessage({ k, id: travaux[k].id, variante: travaux[k].variante, duels: ech.get(travaux[k].id).map((x) => x.d) });
        };
        w.on('message', (m) => {
          if (m.pret) return donner();
          resultats[m.k] = m.gagnants;
          faits++;
          process.stderr.write(`\r${faits}/${travaux.length} variantes testées, ${((Date.now() - t0) / 1000).toFixed(0)} s   `);
          donner();
        });
        w.on('exit', () => { if (--actifs === 0) fin(); });
        w.on('error', (e) => { console.error(e); process.exitCode = 1; });
      }
    });
    process.stderr.write('\n');

    const logit = (p) => Math.log(Math.max(1e-3, p) / Math.max(1e-3, 1 - p));
    const sortie = [];
    for (const { c, sens } of cibles) {
      const liste = ech.get(c.id);
      const n = liste.length;
      const tv = (gagnants) => liste.reduce((s, x, i) => s + (gagnants[i] === x.porteur ? 1 : 0), 0) / n;
      const ecartMoy = liste.reduce((s, x) => s + x.ecart, 0) / n;
      const tvOrig = liste.reduce((s, x) => s + (x.gagnant === x.porteur ? 1 : 0), 0) / n;
      const idxT = travaux.findIndex((t) => t.id === c.id && !t.variante);
      const temoin = resultats[idxT];
      const identiques = liste.filter((x, i) => temoin[i] === x.gagnant).length / n;
      const tvBase = tv(temoin);
      // Cible : annuler l'effet estimé (log-cote par exemplaire × écart moyen d'exemplaires)
      const cible = -c.betaRel * ecartMoy;
      const essais = travaux
        .map((t, k) => ({ t, k }))
        .filter(({ t }) => t.id === c.id && t.variante)
        .map(({ t, k }) => {
          const g = resultats[k];
          const tvV = tv(g);
          const bascules = liste.filter((x, i) => g[i] !== temoin[i]).length;
          const desc = t.variante.modifs.map((m) => `${NOMS[m.champ] || m.champ} ${m.avant ?? 0} → ${m.valeur}`).join(' et ');
          return { ...t.variante, desc, cout: t.variante.modifs.some((m) => m.champ === 'cost'), tvPorteur: tvV, delta: tvV - tvBase, dLogit: logit(tvV) - logit(tvBase), bascules, betaApres: c.betaRel + (logit(tvV) - logit(tvBase)) / ecartMoy };
        });
      // Meilleur : effet résiduel le plus proche de 0, sans changer de signe trop fort
      // (seules comptent les variantes qui bougent dans le bon sens et font basculer des duels)
      const utiles = essais.filter((v) => v.bascules > 0 && Math.sign(v.dLogit) === Math.sign(cible));
      // Préférence : un changement de chiffre qui ramène l'écart sous 1,5 point ; sinon le
      // coût s'il y parvient ; sinon la variante la plus proche de l'équilibre.
      const proche = (l) => l.slice().sort((a, b) => Math.abs(a.betaApres) - Math.abs(b.betaApres))[0] || null;
      const assez = (v) => Math.abs(v.betaApres / 4) <= 0.015;
      const choix = proche(utiles.filter((v) => !v.cout && assez(v))) || proche(utiles.filter(assez)) || proche(utiles);
      sortie.push({ id: c.id, nom: c.nom, rarete: c.rarete, famille: c.famille, sens, beta: c.betaRel, betaBrut: c.beta, effet: c.effet, z: c.z, echantillon: n, ecartMoy, tvPorteurOrig: tvOrig, tvPorteurBase: tvBase, rejeuIdentique: identiques, cible, essais, choix });
    }
    const out = path.resolve(o.sortie || path.join(dir, 'ajustements.json'));
    fs.writeFileSync(out, JSON.stringify({ genere: new Date().toISOString(), echantillon: nEch, cartes: sortie }, null, 1));
    process.stderr.write(`Ajustements écrits dans ${out}\n`);
  })().catch((e) => { console.error(e); process.exit(1); });
} else {
  const { chargerMoteur } = require('./moteur.js');
  const { jouerUnDuel } = require('./partie.js');
  const E = chargerMoteur();
  parentPort.on('message', (m) => {
    if (m === null) return process.exit(0);
    // variante d'une carte (par défaut) ou d'une classe ({ classe: 'mecano', champ: 'hpMult' })
    const v = m.variante;
    const modifs = !v ? [] : v.modifs ? v.modifs : [v];
    const cible = v ? (v.classe ? E.CLASSES[v.classe] : E.CARDS[v.carte || m.id]) : null;
    const avant = modifs.map((x) => cible[x.champ]);
    modifs.forEach((x) => { cible[x.champ] = x.valeur; });
    const gagnants = m.duels.map((d) => jouerUnDuel(E, d).gagnant);
    modifs.forEach((x, i) => { cible[x.champ] = avant[i]; });
    parentPort.postMessage({ k: m.k, gagnants });
  });
  parentPort.postMessage({ pret: true });
}
