'use strict';
// Charge le moteur de règles directement depuis la page publiée (index.html),
// sans en recopier le code : le simulateur reste synchronisé avec le jeu.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerMoteur(page) {
  page = page || path.join(__dirname, '..', '..', 'index.html');
  const html = fs.readFileSync(page, 'utf8');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const src = scripts.find((s) => s.includes('SURBOOKING_ENGINE_FP') && s.includes('module.exports'));
  if (!src) throw new Error('Script du moteur introuvable dans ' + page);
  const module = { exports: {} };
  const window = {};
  const ctx = vm.createContext({ module, exports: module.exports, window, globalThis: window, console, Math, JSON, Object, Array, Set, Map, String, Number, Boolean, Symbol, Infinity, NaN, isFinite, parseInt, parseFloat, Error, TypeError, RangeError });
  window.window = window;
  vm.runInContext(src, ctx, { filename: 'moteur-surbooking.js' });
  const E = module.exports;
  if (!E || !E.CARDS) throw new Error('Le moteur ne s\'est pas exporté');
  E.__empreinte = window.SURBOOKING_ENGINE_FP || null;
  E.__version = (html.match(/SURBOOKING_WEB_PAGE\s*=\s*'([^']+)'/) || [])[1] || null;
  return E;
}
module.exports = { chargerMoteur };
