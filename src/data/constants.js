export const ATTRIBUTES = ['POT', 'HAB', 'COG', 'PER', 'PRE', 'ANI'];

export const ATTR_NAMES = {
  POT: 'Potência',
  HAB: 'Habilidade',
  COG: 'Cognição',
  PER: 'Perspicácia',
  PRE: 'Presença',
  ANI: 'Anima'
};

export const LEVEL_CAPS = {
  1: { pa: 4, attrCap: 2, attrPoints: 1 },
  2: { pa: 4, attrCap: 2, attrPoints: 1 },
  3: { pa: 4, attrCap: 2, attrPoints: 2 },
  4: { pa: 5, attrCap: 2, attrPoints: 2 },
  5: { pa: 5, attrCap: 3, attrPoints: 3 },
  6: { pa: 5, attrCap: 3, attrPoints: 3 },
  7: { pa: 5, attrCap: 3, attrPoints: 4 },
  8: { pa: 6, attrCap: 3, attrPoints: 4 },
  9: { pa: 6, attrCap: 3, attrPoints: 5 },
  10: { pa: 6, attrCap: 3, attrPoints: 5 },
};

export const WEAPON_TYPES = [
  {
    id: 'cortante-media',
    name: 'Cortante Média',
    formulas: {
      ac1: (pot) => 3,
      ac2: (pot) => 4 + 2 * pot,
      ac3: (pot) => 6 + 3 * pot,
      ac4: (pot) => 8 + 3 * pot
    }
  }
];

export const ELEMENTAL_COSTS = {
  levels: [
    { lv: 1, cost: 3, req: null },
    { lv: 2, cost: 6, req: null },
    { lv: 3, cost: 9, req: 'Potência Elemental' }
  ],
  distances: [
    { id: 'pessoal', name: 'Pessoal (Toque / 0m)', cost: 0 },
    { id: 'curto', name: 'Curto (9m)', cost: 3 },
    { id: 'medio', name: 'Médio (18m)', cost: 6 },
    { id: 'longo', name: 'Longo (36m)', cost: 10 }
  ]
};

export const INITIAL_STATS = {
  pv: 10,
  pe: 10
};

export const INITIAL_POINTS = {
  free: 1, // This is now level-based
  ascendancy: 1,
  element: 1,
  statPointsPerLevel: 3
};
