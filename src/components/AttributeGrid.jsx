import React from 'react';
import { ATTRIBUTES, LEVEL_CAPS, ATTR_NAMES } from '../data/constants';
import { Plus, Minus, Star, Sparkles } from 'lucide-react';

export default function AttributeGrid({ attributes, rawAttributes, setAttributes, level, pointsRemaining, bonusAttr, elementalBonusAttr }) {
  const cap = LEVEL_CAPS[level]?.attrCap || 2;

  const updateAttr = (attr, delta) => {
    const currentRaw = rawAttributes[attr];
    const bonus = (attr === bonusAttr ? 1 : 0) + (attr === elementalBonusAttr ? 1 : 0);
    const newValRaw = currentRaw + delta;
    const newValTotal = newValRaw + bonus;

    if (newValRaw < 0) return;
    if (newValTotal > cap && delta > 0) return; // Cap applies to total value
    if (delta > 0 && pointsRemaining <= 0) return;

    setAttributes({
      ...rawAttributes,
      [attr]: newValRaw
    });
  };

  return (
    <div className="glass-panel attr-panel">
      <div className="panel-header">
        <h3 className="panel-title">Atributos</h3>
        <div className="destaque">
          Pontos: <span className="text-accent font-bold">{pointsRemaining}</span>
        </div>
      </div>

      <div className="attr-categories-container">
        {[
          { title: 'FÍSICOS', attrs: ['POT', 'HAB'] },
          { title: 'MENTAIS', attrs: ['COG', 'PER'] },
          { title: 'PESSOAIS', attrs: ['PRE', 'ANI'] }
        ].map(group => (
          <div key={group.title} className="attr-group">
            <h4 className="attr-group-title">{group.title}</h4>
            <div className="attr-list">
              {group.attrs.map(attr => {
                const hasAscendancyBonus = attr === bonusAttr;
                const hasElementalBonus = attr === elementalBonusAttr;
                const isCapped = attributes[attr] >= cap;
                
                return (
                  <div key={attr} className={`attr-row ${(hasAscendancyBonus || hasElementalBonus) ? 'has-bonus' : ''} ${isCapped ? 'at-cap' : ''}`}>
                    <div className="attr-name">
                      {ATTR_NAMES[attr]}
                      <div className="bonus-icons">
                        {hasAscendancyBonus && <Star size={10} className="bonus-star" />}
                        {hasElementalBonus && <Sparkles size={10} className="bonus-sparkle" />}
                      </div>
                    </div>
                    <div className="attr-controls">
                      <button
                        onClick={() => updateAttr(attr, -1)}
                        className="secondary icon-btn"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="attr-value-group">
                        <span className="attr-value">
                          +{attributes[attr]}
                        </span>
                      </div>
                      <button
                        onClick={() => updateAttr(attr, 1)}
                        className="secondary icon-btn"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="inventory-notes" style={{ textAlign: 'center', marginTop: '1rem' }}>
        Limite para Nível {level}: +{cap}
      </div>
    </div>
  );
}
