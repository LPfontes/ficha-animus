import React from 'react';
import { Minus, Plus, Star, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { ATTR_NAMES } from '../data/constants';
import dados from '../dados.json';

export default function UnifiedAbilities({ 
  attributes, 
  rawAttributes, 
  setAttributes, 
  level, 
  pointsRemaining, 
  bonusAttr, 
  elementalBonusAttr,
  skills,
  setSkills,
  apRemaining,
  freeSlotsRemaining,
  attrCap
}) {

  const updateAttr = (attr, delta) => {
    const currentRaw = rawAttributes[attr];
    const bonus = (attr === bonusAttr ? 1 : 0) + (attr === elementalBonusAttr ? 1 : 0);
    const newValRaw = currentRaw + delta;
    const newValTotal = newValRaw + bonus;

    if (newValRaw < 0) return;
    if (newValTotal > attrCap && delta > 0) return;
    if (delta > 0 && pointsRemaining <= 0) return;

    setAttributes({
      ...rawAttributes,
      [attr]: newValRaw
    });
  };

  const handleSkillChange = (skillName, delta) => {
    const currentLevel = skills[skillName] || 0;
    const newLevel = currentLevel + delta;

    if (newLevel < 0 || newLevel > 3) return;

    if (delta > 0) {
      if (currentLevel === 0 && freeSlotsRemaining > 0) {
        // Free slot used
      } else if (apRemaining <= 0) {
        return;
      }
    }

    const newSkills = { ...skills };
    if (newLevel === 0) {
      delete newSkills[skillName];
    } else {
      newSkills[skillName] = newLevel;
    }
    setSkills(newSkills);
  };

  const categories = [
    { title: 'FÍSICOS', attrs: ['POT', 'HAB'] },
    { title: 'MENTAIS', attrs: ['COG', 'PER'] },
    { title: 'PESSOAIS', attrs: ['PRE', 'ANI'] }
  ];

  return (
    <div className="unified-abilities-container">
      <div className="unified-header glass-panel">
        <div className="panel-title-group">
          <BookOpen size={24} className="text-accent" />
          <h2 className="section-title">Atributos & Perícias</h2>
        </div>
        <div className="summary-badges">
          <div className="badge points">Pontos de Atributo: <span>{pointsRemaining}</span></div>
          <div className="badge ap">AP Disponível: <span>{apRemaining}</span></div>
          <div className="badge free">Vagas Livres: <span>{freeSlotsRemaining}</span></div>
        </div>
      </div>

      <div className="abilities-columns">
        {categories.map(cat => (
          <div key={cat.title} className="ability-column">
            <h3 className="column-title">{cat.title}</h3>
            {cat.attrs.map(attrKey => {
              const attrSkills = dados.pericias[attrKey] || [];
              const hasBonus = attrKey === bonusAttr || attrKey === elementalBonusAttr;
              const val = attributes[attrKey];
              
              return (
                <div key={attrKey} className="attr-skill-box glass-panel">
                  <div className={`attr-header-row ${hasBonus ? 'has-bonus' : ''}`}>
                    <div className="attr-info">
                      <span className="attr-label">{ATTR_NAMES[attrKey]}</span>
                      <div className="attr-dots">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`attr-dot ${val >= i ? 'filled' : ''}`} />
                        ))}
                        <span className="attr-number">+{val}</span>
                      </div>
                    </div>
                    <div className="attr-actions">
                      <button className="mini-btn" onClick={() => updateAttr(attrKey, -1)}><Minus size={12}/></button>
                      <button className="mini-btn" onClick={() => updateAttr(attrKey, 1)}><Plus size={12}/></button>
                    </div>
                  </div>

                  <div className="skill-rows-list">
                    {attrSkills.map(skill => {
                      const sLevel = skills[skill.nome] || 0;
                      return (
                        <div key={skill.nome} className={`skill-unified-row ${sLevel > 0 ? 'active' : ''}`}>
                          <span className="skill-unified-name" title={skill.descricao}>{skill.nome}</span>
                          <div className="skill-unified-controls">
                            <div className="skill-boxes">
                              {[1, 2, 3].map(i => (
                                <div 
                                  key={i} 
                                  className={`skill-box ${sLevel >= i ? 'filled' : ''}`}
                                  onClick={() => handleSkillChange(skill.nome, i > sLevel ? 1 : -1)}
                                />
                              ))}
                              <span className="skill-number">{sLevel > 0 ? `+${sLevel}` : '—'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="unified-footer glass-panel">
        <AlertCircle size={16} />
        <span>Limite de Atributo: +{attrCap} | Nível Mestre de perícia exige Talento específico.</span>
      </div>
    </div>
  );
}
