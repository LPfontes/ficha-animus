import React from 'react';
import { BookOpen, Star, Sparkles, AlertCircle } from 'lucide-react';
import dados from '../dados.json';
import { ATTR_NAMES } from '../data/constants';

export default function SkillsManager({ skills, setSkills, apRemaining, freeSlotsRemaining }) {
  
  const handleSkillChange = (skillName, delta) => {
    const currentLevel = skills[skillName] || 0;
    const newLevel = currentLevel + delta;

    if (newLevel < 0 || newLevel > 3) return;

    // Check if we can afford the increase
    if (delta > 0) {
      if (currentLevel === 0 && freeSlotsRemaining > 0) {
        // Can use a free slot
      } else if (apRemaining <= 0) {
        // No AP and no free slots
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

  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Amador';
      case 2: return 'Profissional';
      case 3: return 'Mestre';
      default: return '—';
    }
  };

  const getLevelClass = (level) => {
    switch (level) {
      case 1: return 'text-water';
      case 2: return 'text-accent';
      case 3: return 'text-fire font-bold';
      default: return 'text-muted';
    }
  };

  return (
    <div className="glass-panel skills-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <BookOpen size={20} className="text-accent" />
          <h3 className="panel-title">Perícias</h3>
        </div>
        <div className="skills-summary">
          <span className="info-tag">
            Perícias Amador: <strong className={freeSlotsRemaining > 0 ? 'text-water' : ''}>{freeSlotsRemaining}</strong>
          </span>
          <span className="info-tag">
            AP Restante: <strong className={apRemaining > 0 ? 'text-accent' : ''}>{apRemaining}</strong>
          </span>
        </div>
      </div>

      <div className="skills-grid">
        {Object.entries(dados.pericias).map(([attrKey, attrSkills]) => (
          <div key={attrKey} className="skill-category">
            <h4 className="skill-attr-title">{ATTR_NAMES[attrKey]}</h4>
            <div className="skill-list">
              {attrSkills.map(skill => {
                const level = skills[skill.nome] || 0;
                return (
                  <div key={skill.nome} className={`skill-row ${level > 0 ? 'active' : ''}`}>
                    <div className="skill-info" title={skill.descricao}>
                      <span className="skill-name">{skill.nome}</span>
                      <span className={`skill-level-text ${getLevelClass(level)}`}>
                        {getLevelName(level)}
                      </span>
                    </div>
                    <div className="skill-controls">
                      <button 
                        className="secondary icon-btn small" 
                        onClick={() => handleSkillChange(skill.nome, -1)}
                        disabled={level === 0}
                      >
                        -
                      </button>
                      <div className="skill-level-dots">
                        <div className={`dot ${level >= 1 ? 'filled' : ''}`}></div>
                        <div className={`dot ${level >= 2 ? 'filled' : ''}`}></div>
                        <div className={`dot ${level >= 3 ? 'filled' : ''}`}></div>
                      </div>
                      <button 
                        className="secondary icon-btn small" 
                        onClick={() => handleSkillChange(skill.nome, 1)}
                        disabled={level === 3 || (level === 0 ? (freeSlotsRemaining === 0 && apRemaining === 0) : apRemaining === 0)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="inventory-notes" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <AlertCircle size={14} className="text-accent" />
        <span>Nível Mestre requer o Talento "Foco em Perícia". Evoluir perícias sempre custa 1 AP.</span>
      </div>
    </div>
  );
}
