'use strict';

const CATALOG = Object.freeze({
  spaces: [
    { id: 'flat', label: 'Appartement', note: 'Studio à grand logement' },
    { id: 'house', label: 'Maison', note: 'Avec annexes si besoin' },
    { id: 'storage', label: 'Cave / garage', note: 'Accès souvent spécifique' },
    { id: 'business', label: 'Bureau / local', note: 'Projet professionnel' }
  ],
  volumes: [
    { id: '1-3', label: '1–3 m³', note: 'Quelques objets' },
    { id: '4-8', label: '4–8 m³', note: 'Une petite pièce' },
    { id: '9-15', label: '9–15 m³', note: 'Plusieurs pièces' },
    { id: '16-30', label: '16–30 m³', note: 'Logement chargé' },
    { id: '30+', label: '30 m³ et +', note: 'Grand volume' }
  ],
  floors: { ground: 'Rez-de-chaussée', '1': '1er étage', '2': '2e étage', '3': '3e étage', '4plus': '4e étage ou plus' },
  lifts: { yes: 'Ascenseur disponible', no: 'Sans ascenseur', unknown: 'Ascenseur à vérifier' },
  parking: { near: 'Stationnement à moins de 10 m', medium: 'Stationnement à 10–30 m', far: 'Stationnement à plus de 30 m', unknown: 'Stationnement à vérifier' },
  constraints: { heavy: 'Objet très lourd', narrow: 'Passage étroit', waste: 'Gravats ou déchets spéciaux' },
  timing: { flexible: 'Délai flexible', week: 'Intervention souhaitée sous 7 jours', urgent: 'Intervention souhaitée sous 48 heures', date: 'Date précise à convenir' },
  value: { yes: 'Objets potentiellement valorisables', no: 'Pas d’objet valorisable identifié', unknown: 'Valeur des objets à vérifier' }
});

function choice(list, id, field) {
  const found = list.find(item => item.id === id);
  if (!found) throw new Error(`Choix invalide pour ${field}.`);
  return found;
}

function enumValue(map, id, field) {
  if (!Object.prototype.hasOwnProperty.call(map, id)) throw new Error(`Choix invalide pour ${field}.`);
  return map[id];
}

function computeBrief(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Données de brief invalides.');
  const space = choice(CATALOG.spaces, input.space, 'le type de lieu');
  const volume = choice(CATALOG.volumes, input.volume, 'le volume');
  const floor = enumValue(CATALOG.floors, input.floor, "l'étage");
  const lift = enumValue(CATALOG.lifts, input.lift, "l'ascenseur");
  const parking = enumValue(CATALOG.parking, input.parking, 'le stationnement');
  const timing = enumValue(CATALOG.timing, input.timing, 'le délai');
  const value = enumValue(CATALOG.value, input.value, 'la valorisation');
  if (!Array.isArray(input.constraints)) throw new Error('Contraintes invalides.');
  const uniqueConstraints = [...new Set(input.constraints)];
  const constraints = uniqueConstraints.map(id => enumValue(CATALOG.constraints, id, 'les contraintes'));
  return Object.freeze({
    space: space.label,
    volume: volume.label,
    access: `${floor} · ${lift.toLowerCase()}`,
    parking,
    constraints: constraints.length ? constraints.join(', ') : 'Aucune contrainte signalée',
    timing,
    value,
    readiness: 6
  });
}

function formatBrief(brief, company = '') {
  const recipient = company ? ` pour ${company}` : '';
  return [
    `DEMANDE DE DEVIS DÉBARRAS${recipient}`,
    '',
    `Lieu : ${brief.space}`,
    `Volume estimé : ${brief.volume}`,
    `Accès : ${brief.access}`,
    `Stationnement : ${brief.parking}`,
    `Contraintes : ${brief.constraints}`,
    `Délai : ${brief.timing}`,
    `Valorisation : ${brief.value}`,
    '',
    'Je peux envoyer des photos et préciser l’adresse pour confirmer le devis.',
    'Ce brief ne constitue ni une réservation ni un prix définitif.'
  ].join('\n');
}

if (typeof module !== 'undefined' && module.exports) module.exports = { CATALOG, computeBrief, formatBrief };

if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const rawCompany = (params.get('entreprise') || '').replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (rawCompany) {
    $('company-name').textContent = rawCompany;
    $('prepared').hidden = false;
    document.title = `${rawCompany} — Concept de brief débarras`;
  }

  const state = { space: 'flat', volume: '4-8', floor: 'ground', lift: 'yes', parking: 'near', constraints: [], timing: 'flexible', value: 'unknown' };

  function renderButtons(targetId, list, key) {
    const target = $(targetId);
    target.replaceChildren();
    for (const item of list) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.dataset.value = item.id;
      button.setAttribute('aria-pressed', String(state[key] === item.id));
      const label = document.createElement('strong');
      const note = document.createElement('small');
      label.textContent = item.label;
      note.textContent = item.note;
      button.append(label, note);
      button.addEventListener('click', () => { state[key] = item.id; render(); });
      target.append(button);
    }
  }

  function collectControls() {
    state.floor = $('floor').value;
    state.lift = document.querySelector('input[name="lift"]:checked').value;
    state.parking = $('parking').value;
    state.constraints = [...document.querySelectorAll('input[name="constraints"]:checked')].map(input => input.value);
    state.timing = $('timing').value;
    state.value = document.querySelector('input[name="value"]:checked').value;
  }

  function render() {
    renderButtons('space-options', CATALOG.spaces, 'space');
    renderButtons('volume-options', CATALOG.volumes, 'volume');
    collectControls();
    const brief = computeBrief(state);
    const rows = [
      ['Lieu', brief.space],
      ['Volume', brief.volume],
      ['Accès', brief.access],
      ['Stationnement', brief.parking],
      ['Contraintes', brief.constraints],
      ['Délai', brief.timing]
    ];
    $('facts').replaceChildren(...rows.map(([term, description]) => {
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      wrapper.className = 'fact';
      dt.textContent = term;
      dd.textContent = description;
      wrapper.append(dt, dd);
      return wrapper;
    }));
    $('readiness').textContent = String(brief.readiness);
    $('meter').style.width = `${Math.round((brief.readiness / 6) * 100)}%`;
    $('brief-text').textContent = formatBrief(brief, rawCompany);
    $('copy-status').textContent = '';
  }

  $('planner').addEventListener('change', render);
  $('copy').addEventListener('click', async () => {
    const text = $('brief-text').textContent;
    try {
      await navigator.clipboard.writeText(text);
      $('copy-status').textContent = 'Brief copié. Rien n’a été envoyé.';
    } catch {
      document.querySelector('details').open = true;
      $('copy-status').textContent = 'Copiez le texte affiché ci-dessous.';
    }
  });
  render();
}
