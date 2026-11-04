#!/usr/bin/env node
'use strict';
// Lance N tables de bots en parallèle et écrit chaque duel dans un fichier JSONL.
//   node simuler.js --tables 1000 --sortie resultats/duels.jsonl [--fils 4] [--depart 1]
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function args() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
  return o;
}

if (isMainThread) {
  const o = args();
  const tables = +(o.tables || 1000);
  const depart = +(o.depart || 1);
  const fils = Math.max(1, +(o.fils || os.cpus().length));
  const sortie = path.resolve(o.sortie || path.join(__dirname, 'resultats', 'duels.jsonl'));
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  const flux = fs.createWriteStream(sortie);
  const tablesFlux = fs.createWriteStream(sortie.replace(/\.jsonl$/, '') + '.tables.jsonl');
  let prochaine = depart;
  const fin = depart + tables;
  let faites = 0;
  let duels = 0;
  const t0 = Date.now();
  let actifs = 0;
  const lancer = () => {
    const w = new Worker(__filename, { workerData: {} });
    actifs++;
    const donner = () => {
      if (prochaine < fin) w.postMessage(prochaine++);
      else w.postMessage(null);
    };
    w.on('message', (m) => {
      if (m.pret) return donner();
      for (const d of m.duels) flux.write(JSON.stringify(d) + '\n');
      tablesFlux.write(JSON.stringify({ graine: m.graine, cls: m.cls, finales: m.finales }) + '\n');
      duels += m.duels.length;
      faites++;
      if (faites % 25 === 0 || faites === tables) {
        const s = (Date.now() - t0) / 1000;
        process.stderr.write(`\r${faites}/${tables} tables, ${duels} duels, ${s.toFixed(0)} s, reste ~${((s / faites) * (tables - faites)).toFixed(0)} s   `);
      }
      donner();
    });
    w.on('exit', () => {
      if (--actifs === 0) {
        flux.end();
        tablesFlux.end();
        process.stderr.write(`\nTerminé : ${duels} duels dans ${sortie}\n`);
      }
    });
    w.on('error', (e) => { console.error(e); process.exitCode = 1; });
  };
  for (let i = 0; i < fils; i++) lancer();
} else {
  const E = require('./moteur.js').chargerMoteur();
  const { simulerTable } = require('./partie.js');
  parentPort.on('message', (g) => {
    if (g === null) return process.exit(0);
    const r = simulerTable(E, g);
    parentPort.postMessage({ graine: g, cls: r.cls, finales: r.finales, duels: r.duels });
  });
  parentPort.postMessage({ pret: true });
}
