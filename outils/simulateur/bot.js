'use strict';
// Bot de combat pour les duels (mode duel en ligne du moteur : duelBuild / duelAct).
// Les deux camps ("h" qui commence, "g" qui répond) sont joués par le même bot,
// pour que la comparaison entre decks soit équitable.
//
// Méthode : à chaque décision, le bot essaie chaque carte jouable sur une copie
// de l'état, garde les meilleures, termine le tour de façon gloutonne sur la copie
// et joue la carte dont le tour complet obtient la meilleure évaluation.
// Il passe son tour quand plus aucune carte n'améliore la position.

const clone = (s) => JSON.parse(JSON.stringify(s));
const bossOf = (e) => e.combat.monsters.find((m) => m.duel);

function camp(E, e, cote) {
  const p = e.combat.player;
  const b = bossOf(e);
  const h = { hp: e.hp, max: E.maxHpOf(e), block: p.block || 0, force: p.force || 0, weak: p.weak || 0, vuln: p.vuln || 0, poison: p.poison || 0, frozen: p.frozen || 0, tripped: p.tripped || 0, jealous: p.jealous || 0, grudge: p.grudge || 0 };
  const g = { hp: b.hp, max: b.maxHp, block: b.block || 0, force: b.force || 0, weak: b.weak || 0, vuln: b.vuln || 0, poison: b.poison || 0, frozen: b.frozen || 0, tripped: b.tripped || 0, jealous: b.jealous || 0, grudge: b.grudge || 0 };
  return cote === 'h' ? { moi: h, lui: g } : { moi: g, lui: h };
}

// Évaluation symétrique d'une position, du point de vue de `cote`.
// `menace` = dégâts attendus au prochain tour adverse (l'armure au-delà vaut peu).
function evaluer(E, e, cote, menace) {
  const c = e.combat;
  if (c.over) return E.duelWinner(e) === cote ? 1e6 : -1e6;
  const { moi, lui } = camp(E, e, cote);
  const urgence = moi.hp <= menace * 1.5 ? 1.5 : 1;
  let v = moi.hp * 1.1 * urgence - lui.hp;
  v += Math.min(moi.block, menace) * 0.9 * urgence + Math.max(0, moi.block - menace) * 0.12;
  v += (moi.force - lui.force) * 2.6;
  const malus = (x) => x.weak * 2.6 + x.vuln * 1.6 + x.frozen * 3 + x.poison * 1.6 + x.tripped * 4 + (x.jealous ? 4 : 0);
  v += malus(lui) - malus(moi);
  v += (moi.grudge || 0) * 0.8;
  return v;
}

const mainDe = (e, cote) => (cote === 'h' ? e.combat.hand : bossOf(e).duel.hand);

function jouerSurCopie(E, e, cote, i) {
  const c = clone(e);
  c.events = [];
  return E.duelAct(c, cote, { a: 'play', h: i }) ? c : null;
}

function finirGlouton(E, e, cote, menace, pas) {
  let n = 0;
  while (n++ < pas && !e.combat.over && e.combat.side === cote) {
    const main = mainDe(e, cote);
    let meilleur = null;
    let v0 = evaluer(E, e, cote, menace) + 0.01;
    for (let i = 0; i < main.length; i++) {
      const c = jouerSurCopie(E, e, cote, i);
      if (!c) continue;
      const v = evaluer(E, c, cote, menace);
      if (v > v0) { v0 = v; meilleur = c; }
    }
    if (!meilleur) break;
    e = meilleur;
  }
  return evaluer(E, e, cote, menace);
}

// Choisit l'index de la carte à jouer, ou -1 pour finir le tour.
function choisir(E, e, cote, menace, opts) {
  const main = mainDe(e, cote);
  const base = evaluer(E, e, cote, menace);
  const essais = [];
  for (let i = 0; i < main.length; i++) {
    const c = jouerSurCopie(E, e, cote, i);
    if (!c) continue;
    const v = evaluer(E, c, cote, menace);
    if (v >= 1e6) return i; // coup gagnant
    const carte = E.CARDS[main[i].id] || {};
    essais.push({ i, c, v, pioche: !!(carte.draw || carte.energy) });
  }
  if (!essais.length) return -1;
  essais.sort((a, b) => b.v - a.v);
  const largeur = opts.largeur || 3;
  const retenus = essais.filter((x, k) => k < largeur || x.pioche);
  let choix = -1;
  let vMax = base + 0.01;
  for (const x of retenus) {
    const v = opts.anticipation === false ? x.v : finirGlouton(E, x.c, cote, menace, 12);
    if (v > vMax) { vMax = v; choix = x.i; }
  }
  return choix;
}

// Joue un duel complet. `suivi(cote, idCarte)` est appelé à chaque carte jouée.
// La « menace » de chaque camp (dégâts reçus pendant le dernier tour adverse,
// armure comprise) sert à estimer combien d'armure il est utile de poser.
function jouerDuel(E, e, opts, suivi) {
  opts = opts || {};
  const menace = { h: opts.menaceInit || 12, g: opts.menaceInit || 12 };
  const photo = { h: null, g: null };
  let demiTours = 0;
  while (!e.combat.over && demiTours++ < 80) {
    const cote = e.combat.side;
    const autre = cote === 'h' ? 'g' : 'h';
    let n = 0;
    while (n++ < 30 && !e.combat.over && e.combat.side === cote) {
      const i = choisir(E, e, cote, menace[cote], opts);
      if (i < 0) break;
      const id = mainDe(e, cote)[i].id;
      if (!E.duelAct(e, cote, { a: 'play', h: i })) break;
      if (suivi) suivi(cote, id);
      e.events.length = 0;
    }
    if (e.combat.over) break;
    if (photo[autre]) {
      const a = photo[autre];
      const m = camp(E, e, autre).moi;
      const subi = Math.max(0, a.hp - m.hp) + Math.max(0, a.block - m.block);
      menace[autre] = Math.round(0.5 * menace[autre] + 0.5 * Math.max(4, subi));
    }
    E.duelAct(e, cote, { a: 'end' });
    e.events.length = 0;
    if (!e.combat.over) photo[cote] = camp(E, e, cote).moi;
  }
  return E.duelWinner(e);
}

module.exports = { jouerDuel, evaluer, choisir };
