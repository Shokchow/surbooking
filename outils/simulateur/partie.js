'use strict';
// Une « table » simulée : 4 bots de classes tirées au hasard draftent les
// étages 1 à 4 avec l'IA de draft du jeu (ghostFloor1 : 12 choix, 8 cartes gardées
// par étage). Après chaque étage, chacun affronte les 3 autres en duel, dans les
// deux ordres (qui commence / qui répond). Puis deux paires de finalistes draftent
// le booster de finale (4 choix, cartes oranges et rouges) et se rencontrent
// dans les deux ordres, à 280 PV de base.

const { jouerDuel } = require('./bot.js');

// PV de référence par étage (constantes du moteur : 75 / 143 / 165 / 180, finale 280)
const PV_ETAGE = { 1: 75, 2: 143, 3: 165, 4: 180, 5: 280 };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Choix de finale : reprend la logique de l'IA de finale du jeu
// (valeur + affinité de famille + bonus quand le palier monte), bruit compris.
function choixFinale(E, alea, main, deck) {
  const pts = E.familyPoints(deck);
  const top = Object.keys(pts).filter((k) => E.SPECS[k]).sort((a, b) => pts[b] - pts[a]).slice(0, 2);
  let meilleur = 0;
  let max = -Infinity;
  main.forEach((c, i) => {
    const carte = E.CARDS[c.id];
    const p = pts[carte.arch] || 0;
    let v = carte.value + (E.SPECS[carte.arch] ? 1.5 * p : 0) + alea() * 2;
    if (E.SPECS[carte.arch]) {
      if (top.includes(carte.arch)) v += 2;
      const t1 = E.tierFor(p + E.ptsOf(c.id));
      if (t1 > E.tierFor(p)) v += 2 + t1;
    }
    if (v > max) { max = v; meilleur = i; }
  });
  return meilleur;
}

function deckComplet(E, cls, cartes) {
  return E.autoFuseIds(E.classDeck(cls).concat(cartes));
}

// Joue un duel décrit par `d` ({etage, graine, cls:[h,g], cartes:[[...],[...]]})
// et renvoie l'enregistrement. `opts.bot` est passé au bot.
function jouerUnDuel(E, d, opts) {
  const pv = d.cls.map((c) => E.classHp(c, PV_ETAGE[d.etage]));
  const decks = d.cartes.map((cartes, i) => deckComplet(E, d.cls[i], cartes));
  const e = E.duelBuild({
    seed: d.graine,
    floor: Math.min(4, d.etage),
    finale: d.etage === 5,
    h: { name: 'A', cls: d.cls[0], hp: pv[0], maxHp: pv[0], deck: decks[0] },
    g: { name: 'B', cls: d.cls[1], hp: pv[1], maxHp: pv[1], deck: decks[1] },
  });
  const joues = [new Set(), new Set()];
  const nJoues = [0, 0];
  const g = jouerDuel(E, e, (opts && opts.bot) || {}, (cote, id) => {
    const k = cote === 'h' ? 0 : 1;
    joues[k].add(id);
    nJoues[k]++;
  });
  const boss = e.combat.monsters.find((m) => m.duel);
  return {
    etage: d.etage,
    graine: d.graine,
    table: d.table,
    cls: d.cls,
    cartes: d.cartes,

    joues: joues.map((s) => [...s]),
    nJoues,
    gagnant: g === 'h' ? 0 : g === 'g' ? 1 : -1,
    tours: e.combat.turn,
    fin: e.combat.result,
    pvFin: [Math.max(0, e.hp) / pv[0], Math.max(0, boss.hp) / pv[1]],
  };
}

function simulerTable(E, graine, opts) {
  opts = opts || {};
  const alea = mulberry32(graine * 2654435761);
  const classes = E.CLASS_IDS;
  const cls = [0, 1, 2, 3].map(() => classes[Math.floor(alea() * classes.length)]);
  const run = E.newRun(graine);
  let cartes = [[], [], [], []];
  const duels = [];
  const drafts = [];
  let n = 0;
  const etages = opts.etages || [1, 2, 3, 4, 5];
  for (let F = 1; F <= 4; F++) {
    const choix = E.ghostFloor1(run, E.FLOORS[F].booster, cartes);
    drafts.push({ etage: F, choix });
    cartes = cartes.map((c, i) => c.concat(choix[i]));
    if (!etages.includes(F)) continue;
    for (let a = 0; a < 4; a++)
      for (let b = 0; b < 4; b++) {
        if (a === b) continue;
        duels.push(jouerUnDuel(E, { table: graine, etage: F, graine: (graine * 97 + ++n) | 0, cls: [cls[a], cls[b]], cartes: [cartes[a], cartes[b]] }, opts));
      }
  }
  // Finale : deux paires tirées au hasard, draft à 2 de deux boosters de 4 cartes.
  const ordre = [0, 1, 2, 3].sort(() => alea() - 0.5);
  const finales = [];
  for (const [a, b] of [[ordre[0], ordre[1]], [ordre[2], ordre[3]]]) {
    const b1 = E.makeFinaleBooster(run);
    const b2 = E.makeFinaleBooster(run, b1);
    let mains = [b1, b2];
    const pris = [[], []];
    const decksFin = [cartes[a].slice(), cartes[b].slice()];
    for (let k = 0; k < E.FINALE_PICKS; k++) {
      for (let s = 0; s < 2; s++) {
        const i = choixFinale(E, alea, mains[s], deckComplet(E, cls[s ? b : a], decksFin[s]));
        const c = mains[s].splice(i, 1)[0];
        pris[s].push(c.id);
        decksFin[s].push(c.id);
      }
      mains = [mains[1], mains[0]];
    }
    finales.push({ sieges: [a, b], pris });
    if (etages.includes(5))
      for (const [x, y] of [[0, 1], [1, 0]])
        duels.push(jouerUnDuel(E, { table: graine, etage: 5, graine: (graine * 97 + ++n) | 0, cls: [cls[[a, b][x]], cls[[a, b][y]]], cartes: [decksFin[x], decksFin[y]] }, opts));
  }
  return { graine, cls, drafts, finales, duels };
}

module.exports = { simulerTable, jouerUnDuel, PV_ETAGE, mulberry32 };
