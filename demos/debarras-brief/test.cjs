'use strict';

const assert = require('node:assert/strict');
const { computeBrief, formatBrief } = require('./app.js');

const base = {
  space: 'flat',
  volume: '4-8',
  floor: 'ground',
  lift: 'yes',
  parking: 'near',
  constraints: [],
  timing: 'flexible',
  value: 'unknown'
};

const result = computeBrief(base);
assert.equal(result.space, 'Appartement');
assert.equal(result.volume, '4–8 m³');
assert.equal(result.access, 'Rez-de-chaussée · ascenseur disponible');
assert.equal(result.constraints, 'Aucune contrainte signalée');
assert.equal(result.readiness, 6);

const complex = computeBrief({ ...base, space: 'house', volume: '30+', floor: '4plus', lift: 'no', parking: 'far', constraints: ['heavy', 'narrow', 'heavy'], timing: 'urgent', value: 'yes' });
assert.equal(complex.space, 'Maison');
assert.equal(complex.constraints, 'Objet très lourd, Passage étroit');
assert.match(formatBrief(complex, 'Entreprise Test'), /DEMANDE DE DEVIS DÉBARRAS pour Entreprise Test/);
assert.match(formatBrief(complex), /Ce brief ne constitue ni une réservation ni un prix définitif\./);

for (const [key, badValue] of [['space', 'hotel'], ['volume', 'zero'], ['floor', '-1'], ['lift', 'maybe'], ['parking', 'street'], ['timing', 'today'], ['value', 'sometimes']]) {
  assert.throws(() => computeBrief({ ...base, [key]: badValue }), /Choix invalide/);
}
assert.throws(() => computeBrief({ ...base, constraints: ['unknown'] }), /Choix invalide/);
assert.throws(() => computeBrief(null), /invalides/);

console.log('debarras-brief: 17 checks passed');
