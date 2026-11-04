#!/usr/bin/env node
'use strict';
// Teste des ajustements chiffrés pour les classes dont le taux de victoire s'écarte
// de 50 % : PV de la classe (multiplicateur), puis chiffres de ses deux cartes de base.
//   node ajustements-classes.js [--echantillon 600] [--sortie resultats/ajustements-classes.json]
// Comme pour les cartes, rien n'est modifié dans le jeu : les variantes ne vivent que
// dans la mémoire du simulateur, le temps de rejouer les mêmes duels.
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Worker } = require('worker_threads');
const { chargerMoteur } = require('./moteur.js');

const NOMS = { dmg: 'dégâts', block: 'armure', heal: 'soin', draw: 'pioche', cost: 'coût', hpMult: 'PV de la classe' };
function args() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
  return o;
}

(async () => {
  const o = args();
  const dir = path.join(__dirname, 'resultats');
  const S = JSON.parse(fs.readFileSync(path.resolve(o.synthese || path.join(dir, 'synthese.json')), 'utf8'));
  const E = chargerMoteur();
  const nEch = +(o.echantillon || 600);
  const seuil = +(o.seuil || 0.02);
  const cibles = Object.entries(S.classes).filter(([, c]) => Math.abs(c.tous.taux - 0.5) >= seuil).map(([id, c]) => ({ id, nom: c.nom, taux: c.tous.taux, sens: c.tous.taux > 0.5 ? -1 : 1 }));

  // Variantes : PV (±3, ±6, ±9 % du multiplicateur), puis cartes de base (chiffre principal ±1, coût ±1)
  const variantes = (cl, sens) => {
    const out = [];
    const T = E.CLASSES[cl];
    for (const d of [0.03, 0.06, 0.09]) out.push({ classe: cl, champ: 'hpMult', avant: T.hpMult, valeur: Math.round((T.hpMult + sens * d) * 100) / 100 });
    for (const id of new Set(E.classDeck(cl))) {
      const k = E.CARDS[id];
      const prim = ['dmg', 'block', 'heal', 'draw'].find((f) => typeof k[f] === 'number' && k[f] > 0);
      if (prim && k[prim] + sens >= 1) out.push({ carte: id, nomCarte: k.name, champ: prim, avant: k[prim], valeur: k[prim] + sens });
      const c = (k.cost || 0) - sens;
      if (c >= 0 && c <= 2) out.push({ carte: id, nomCarte: k.name, champ: 'cost', avant: k.cost || 0, valeur: c });
    }
    return out;
  };

  const ech = new Map(cibles.map((c) => [c.id, []]));
  const vus = new Map(cibles.map((c) => [c.id, 0]));
  let alea = 777;
  const rnd = () => ((alea = (alea * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const rl = readline.createInterface({ input: fs.createReadStream(path.resolve(o.duels || path.join(dir, 'duels.jsonl'))) });
  for await (const l of rl) {
    if (!l.trim()) continue;
    const d = JSON.parse(l);
    if (d.gagnant < 0 || d.cls[0] === d.cls[1]) continue;
    for (const c of cibles) {
      const s = d.cls.indexOf(c.id);
      if (s < 0) continue;
      const k = vus.get(c.id) + 1;
      vus.set(c.id, k);
      const item = { d: { table: d.table, etage: d.etage, graine: d.graine, cls: d.cls, cartes: d.cartes }, gagnant: d.gagnant, porteur: s };
      const liste = ech.get(c.id);
      if (liste.length < nEch) liste.push(item);
      else { const j = Math.floor(rnd() * k); if (j < nEch) liste[j] = item; }
    }
  }

  const travaux = [];
  for (const c of cibles) {
    travaux.push({ cl: c.id, variante: null });
    for (const v of variantes(c.id, c.sens)) travaux.push({ cl: c.id, variante: v });
  }
  const resultats = new Array(travaux.length);
  let prochain = 0;
  let faits = 0;
  const t0 = Date.now();
  const fils = Math.max(1, +(o.fils || os.cpus().length));
  await new Promise((fin) => {
    let actifs = fils;
    for (let f = 0; f < fils; f++) {
      const w = new Worker(path.join(__dirname, 'ajustements.js'));
      const donner = () => {
        if (prochain >= travaux.length) return w.postMessage(null);
        const k = prochain++;
        w.postMessage({ k, id: travaux[k].variante && travaux[k].variante.carte, variante: travaux[k].variante, duels: ech.get(travaux[k].cl).map((x) => x.d) });
      };
      w.on('message', (m) => {
        if (m.pret) return donner();
        resultats[m.k] = m.gagnants;
        process.stderr.write(`\r${++faits}/${travaux.length} variantes testées, ${((Date.now() - t0) / 1000).toFixed(0)} s   `);
        donner();
      });
      w.on('exit', () => { if (--actifs === 0) fin(); });
      w.on('error', (e) => { console.error(e); process.exitCode = 1; });
    }
  });
  process.stderr.write('\n');

  const sortie = [];
  for (const c of cibles) {
    const liste = ech.get(c.id);
    const n = liste.length;
    const tv = (g) => liste.reduce((s, x, i) => s + (g[i] === x.porteur ? 1 : 0), 0) / n;
    const temoin = resultats[travaux.findIndex((t) => t.cl === c.id && !t.variante)];
    const base = tv(temoin);
    const essais = travaux.map((t, k) => ({ t, k })).filter(({ t }) => t.cl === c.id && t.variante).map(({ t, k }) => {
      const tvV = tv(resultats[k]);
      return { ...t.variante, nomChamp: NOMS[t.variante.champ] || t.variante.champ, tv: tvV, delta: tvV - base, bascules: liste.filter((x, i) => resultats[k][i] !== temoin[i]).length, apres: c.taux + (tvV - base) };
    });
    // une proposition « PV » et une proposition « carte de base », chacune la plus proche de 50 %
    const meilleur = (f) => essais.filter(f).filter((v) => v.bascules > 0 && Math.sign(v.delta) === c.sens).sort((a, b) => Math.abs(a.apres - 0.5) - Math.abs(b.apres - 0.5))[0] || null;
    sortie.push({ ...c, echantillon: n, base, rejeuIdentique: liste.filter((x, i) => temoin[i] === x.gagnant).length / n, essais, choixPv: meilleur((v) => v.classe), choixCarte: meilleur((v) => v.carte) });
  }
  const out = path.resolve(o.sortie || path.join(dir, 'ajustements-classes.json'));
  fs.writeFileSync(out, JSON.stringify({ genere: new Date().toISOString(), echantillon: nEch, classes: sortie }, null, 1));
  process.stderr.write(`Ajustements de classes écrits dans ${out}\n`);
})().catch((e) => { console.error(e); process.exit(1); });
