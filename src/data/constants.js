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
    { lv: 1, cost: 3, implements: 1 },
    { lv: 2, cost: 6, implements: 2 },
    { lv: 3, cost: 9, implements: 3 }
  ],
  distances: [
    { id: '0', name: 'Pessoal (Toque / 0m)', implements: 0, cost: 0 },
    { id: '1', name: 'Curto (Alcance Nativo)', implements: 1, cost: 3 },
    { id: '2', name: 'Médio (2x Alcance Nativo)', implements: 2, cost: 6 },
    { id: '3', name: 'Longo (3x Alcance Nativo)', implements: 3, cost: 12 }
  ],
  areaCosts: [
    { id: 'none', name: 'Alvo Único / Nenhum', implements: 0, cost: 0 },
    { id: 'pequena', name: 'Área Pequena', implements: 1, cost: 3 },
    { id: 'media', name: 'Área Média', implements: 2, cost: 6 },
    { id: 'grande', name: 'Área Grande', implements: 3, cost: 9 }
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
