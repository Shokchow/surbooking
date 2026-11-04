#!/usr/bin/env node
'use strict';
// Analyse statistique des duels simulés.
//   node analyse.js --entree resultats/duels.jsonl --sortie resultats/synthese.json
// Produit : taux de victoire par classe, par famille, par carte, avantage du camp
// qui commence, et un modèle logistique « toutes choses égales par ailleurs » qui
// isole l'effet de chaque carte (log-cote par exemplaire dans le deck).
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { chargerMoteur } = require('./moteur.js');

const E = chargerMoteur();
const C = E.CARDS;
const idCarte = (id) => (C[id] ? id : String(id).replace(/_\d+$/, ''));
const estBase = (id) => !C[id] || C[id].rarity === 'base';

function args() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
  return o;
}

// Intervalle de Wilson à 95 %
function wilson(v, n) {
  if (!n) return [0, 1];
  const z = 1.96;
  const p = v / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - r) / d, (c + r) / d];
}
const taux = (v, n) => ({ n, v, taux: n ? v / n : null, ic: wilson(v, n) });

// Régression logistique L2 par Newton (IRLS). X : lignes creuses {indice: valeur}.
function logistique(X, y, p, lambda, iter) {
  const b = new Float64Array(p);
  let H;
  for (let it = 0; it < (iter || 12); it++) {
    const g = new Float64Array(p);
    H = Array.from({ length: p }, () => new Float64Array(p));
    for (let r = 0; r < X.length; r++) {
      const x = X[r];
      let z = 0;
      for (const k in x) z += b[k] * x[k];
      const q = 1 / (1 + Math.exp(-z));
      const w = q * (1 - q);
      const e = y[r] - q;
      const ks = Object.keys(x).map(Number);
      for (const i of ks) {
        g[i] += e * x[i];
        const hi = H[i];
        for (const j of ks) hi[j] += w * x[i] * x[j];
      }
    }
    for (let i = 0; i < p; i++) { g[i] -= lambda[i] * b[i]; H[i][i] += lambda[i]; }
    const d = resoudre(H.map((l) => Array.from(l)), Array.from(g));
    let m = 0;
    for (let i = 0; i < p; i++) { b[i] += d[i]; m = Math.max(m, Math.abs(d[i])); }
    if (m < 1e-6) break;
  }
  const inv = inverse(H.map((l) => Array.from(l)));
  return { b: Array.from(b), se: inv.map((l, i) => Math.sqrt(Math.max(0, l[i]))) };
}
function resoudre(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) A[i].push(b[i]);
  return eliminer(A, n).map((l) => l[n]);
}
function inverse(A) {
  const n = A.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) A[i].push(i === j ? 1 : 0);
  return eliminer(A, n).map((l) => l.slice(n));
}
function eliminer(A, n) {
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c] || 1e-12;
    for (let j = c; j < A[c].length; j++) A[c][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c];
      if (!f) continue;
      for (let j = c; j < A[r].length; j++) A[r][j] -= f * A[c][j];
    }
  }
  return A;
}

function principale(specs, pts) {
  const fams = Object.keys(specs);
  if (!fams.length) return null;
  return fams.sort((a, b) => specs[b] - specs[a] || (pts[b] || 0) - (pts[a] || 0))[0];
}

async function main() {
  const o = args();
  const entree = path.resolve(o.entree || path.join(__dirname, 'resultats', 'duels.jsonl'));
  const sortie = path.resolve(o.sortie || path.join(__dirname, 'resultats', 'synthese.json'));
  const duels = [];
  const rl = readline.createInterface({ input: fs.createReadStream(entree) });
  for await (const l of rl) if (l.trim()) duels.push(JSON.parse(l));
  if (!duels.length) throw new Error('Aucun duel dans ' + entree);

  const ETAGES = [1, 2, 3, 4, 5];
  const nomEtage = { 1: 'Étage 1', 2: 'Étage 2', 3: 'Étage 3', 4: 'Étage 4', 5: 'Finale' };
  const classes = E.CLASS_IDS;
  const familles = E.ARCHS;
  const cartesIds = Object.keys(C).filter((id) => !estBase(id));

  const camp = { tous: { h: 0, n: 0 } };
  const cls = {};
  const clsEt = {};
  const matchup = {};
  const fam = {};
  const famEt = {};
  const famPalier = {};
  const famMatch = {};
  const carte = {};
  const tours = {};
  const fins = {};
  for (const id of cartesIds) carte[id] = { deck: [0, 0], joue: [0, 0], absente: [0, 0], copies: 0, parEtage: {} };
  const mkey = (o, k) => (o[k] = o[k] || [0, 0]);

  // Préparation des lignes pour le modèle
  const featCarte = new Map(cartesIds.map((id, i) => [id, i]));
  let p = cartesIds.length;
  const featClasse = new Map(classes.slice(1).map((c, i) => [c, p + i]));
  p += classes.length - 1;
  const featCamp = new Map(ETAGES.map((e, i) => [e, p + i]));
  p += ETAGES.length;
  const X = [];
  const Y = [];

  for (const d of duels) {
    if (d.gagnant < 0) continue;
    const et = d.etage;
    const decks = d.cartes.map((c, i) => E.autoFuseIds(E.classDeck(d.cls[i]).concat(c)).filter((x) => !estBase(x)));
    const joues = d.joues.map((s) => new Set(s.map(idCarte)));
    const gagne = [d.gagnant === 0 ? 1 : 0, d.gagnant === 1 ? 1 : 0];

    camp.tous.n++; camp.tous.h += gagne[0];
    const ce = (camp[et] = camp[et] || { h: 0, n: 0 }); ce.n++; ce.h += gagne[0];
    const t = (tours[et] = tours[et] || { s: 0, n: 0, max: 0 }); t.s += d.tours; t.n++; if (d.tours >= 15) t.max++;
    fins[d.fin] = (fins[d.fin] || 0) + 1;

    // classes (miroirs exclus)
    if (d.cls[0] !== d.cls[1]) for (let s = 0; s < 2; s++) {
      const k = d.cls[s];
      const a = mkey(cls, k); a[0] += gagne[s]; a[1]++;
      const b = mkey((clsEt[et] = clsEt[et] || {}), k); b[0] += gagne[s]; b[1]++;
      const m = mkey(matchup, k + '|' + d.cls[1 - s]); m[0] += gagne[s]; m[1]++;
    }
    // familles : spécialisations actives (2 au plus) et famille principale
    const princ = [];
    for (let s = 0; s < 2; s++) {
      const pts = E.familyPoints(decks[s]);
      const specs = E.specsOf(decks[s]);
      const pr = principale(specs, pts);
      princ.push(pr);
      const k = pr || '(aucune)';
      const a = mkey(fam, k); a[0] += gagne[s]; a[1]++;
      const b = mkey((famEt[et] = famEt[et] || {}), k); b[0] += gagne[s]; b[1]++;
      for (const f in specs) { const c = mkey(famPalier, f + '|' + specs[f]); c[0] += gagne[s]; c[1]++; }
    }
    if (princ[0] !== princ[1]) for (let s = 0; s < 2; s++) {
      const m = mkey(famMatch, (princ[s] || '(aucune)') + '|' + (princ[1 - s] || '(aucune)')); m[0] += gagne[s]; m[1]++;
    }
    // cartes
    const comptes = decks.map((dk) => { const m = {}; for (const x of dk) m[x] = (m[x] || 0) + 1; return m; });
    for (let s = 0; s < 2; s++) {
      for (const id in comptes[s]) {
        const c = carte[id]; if (!c) continue;
        c.deck[0] += gagne[s]; c.deck[1]++; c.copies += comptes[s][id];
        const pe = (c.parEtage[et] = c.parEtage[et] || [0, 0]); pe[0] += gagne[s]; pe[1]++;
        if (joues[s].has(id)) { c.joue[0] += gagne[s]; c.joue[1]++; }
      }
    }
    // ligne du modèle : point de vue du camp qui commence (h)
    const x = {};
    for (const id of new Set([...Object.keys(comptes[0]), ...Object.keys(comptes[1])])) {
      const i = featCarte.get(id); if (i == null) continue;
      const v = (comptes[0][id] || 0) - (comptes[1][id] || 0);
      if (v) x[i] = v;
    }
    for (let s = 0; s < 2; s++) { const i = featClasse.get(d.cls[s]); if (i != null) x[i] = (x[i] || 0) + (s ? -1 : 1); }
    for (const k in x) if (!x[k]) delete x[k];
    x[featCamp.get(et)] = 1;
    X.push(x);
    Y.push(gagne[0]);
  }

  const lambda = new Array(p).fill(2);
  for (const [, i] of featCamp) lambda[i] = 0.01;
  const t0 = Date.now();
  const modele = logistique(X, Y, p, lambda, 15);
  process.stderr.write(`Modèle ajusté en ${((Date.now() - t0) / 1000).toFixed(1)} s sur ${X.length} duels, ${p} variables\n`);

  const cartesRes = cartesIds.map((id) => {
    const c = carte[id];
    const k = C[id];
    const i = featCarte.get(id);
    const b = modele.b[i];
    const se = modele.se[i];
    return {
      id, nom: k.name, rarete: k.rarity, famille: k.arch, cout: k.cost, valeur: k.value, texte: k.text,
      decks: c.deck[1], copiesMoy: c.deck[1] ? c.copies / c.deck[1] : 0,
      tvDeck: taux(c.deck[0], c.deck[1]), tvJouee: taux(c.joue[0], c.joue[1]),
      tauxJouee: c.deck[1] ? c.joue[1] / c.deck[1] : 0,
      parEtage: Object.fromEntries(Object.entries(c.parEtage).map(([e, v]) => [e, taux(v[0], v[1])])),
      beta: b, se, z: se ? b / se : 0,
      effet: b / 4, // ≈ points de probabilité de victoire par exemplaire, autour de 50 %
    };
  });
  // Effet relatif à la rareté : une violette doit battre une blanche ; on compare
  // donc chaque carte à la moyenne (pondérée par les decks) des cartes de même rareté.
  const moyRar = {};
  for (const c of cartesRes) {
    if (C[c.id].lowblow || c.decks < 200) continue;
    const m = (moyRar[c.rarete] = moyRar[c.rarete] || { s: 0, n: 0 });
    m.s += c.beta * c.decks; m.n += c.decks;
  }
  for (const c of cartesRes) {
    const m = moyRar[c.rarete];
    c.coupBas = !!C[c.id].lowblow;
    c.betaRel = c.beta - (m ? m.s / m.n : 0);
    c.effetRel = c.betaRel / 4;
    c.zRel = c.se ? c.betaRel / c.se : 0;
  }
  const out = {
    moyennesRarete: Object.fromEntries(Object.entries(moyRar).map(([k, v]) => [k, v.s / v.n / 4])),
    genere: new Date().toISOString(),
    jeu: { version: E.__version, moteur: E.__empreinte },
    duels: X.length,
    tables: new Set(duels.map((d) => d.table)).size,
    etages: nomEtage,
    camp: Object.fromEntries(Object.entries(camp).map(([k, v]) => [k, taux(v.h, v.n)])),
    campModele: Object.fromEntries([...featCamp].map(([e, i]) => [e, { beta: modele.b[i], se: modele.se[i] }])),
    tours: Object.fromEntries(Object.entries(tours).map(([k, v]) => [k, { moy: v.s / v.n, limite: v.max / v.n }])),
    fins,
    classes: Object.fromEntries(classes.map((c) => [c, {
      nom: E.className(c), pv: E.classHp(c, 100) / 100,
      tous: taux(...(cls[c] || [0, 0])),
      parEtage: Object.fromEntries(ETAGES.map((e) => [e, taux(...(((clsEt[e] || {})[c]) || [0, 0]))])),
      beta: featClasse.has(c) ? modele.b[featClasse.get(c)] : 0,
      se: featClasse.has(c) ? modele.se[featClasse.get(c)] : 0,
    }])),
    matchups: Object.fromEntries(Object.entries(matchup).map(([k, v]) => [k, taux(v[0], v[1])])),
    familles: Object.fromEntries(Object.entries(fam).map(([k, v]) => [k, {
      tous: taux(v[0], v[1]),
      parEtage: Object.fromEntries(ETAGES.map((e) => [e, taux(...(((famEt[e] || {})[k]) || [0, 0]))])),
    }])),
    famillesPaliers: Object.fromEntries(Object.entries(famPalier).map(([k, v]) => [k, taux(v[0], v[1])])),
    famillesMatchups: Object.fromEntries(Object.entries(famMatch).map(([k, v]) => [k, taux(v[0], v[1])])),
    cartes: cartesRes,
  };
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, JSON.stringify(out, null, 1));
  process.stderr.write(`Synthèse écrite dans ${sortie}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
