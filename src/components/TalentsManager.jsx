import React, { useState } from 'react';
import { Sparkles, AlertCircle, Check } from 'lucide-react';
import dados from '../dados.json';

export default function TalentsManager({ level, ascendancy, selectedTalents, setSelectedTalents }) {
  const maxTalents = 2 + (level - 1) * 2;
  const talentsRemaining = maxTalents - selectedTalents.length;
  
  const [activeCategory, setActiveCategory] = useState('combate');

  const categories = [
    { id: 'combate', label: 'Combate' },
    { id: 'pericia', label: 'Perícia' },
    { id: 'elemento', label: 'Elemento' },
    { id: 'ascendencia', label: 'Ascendência' }
  ];

  const toggleTalent = (talentName) => {
    if (selectedTalents.includes(talentName)) {
      setSelectedTalents(selectedTalents.filter(t => t !== talentName));
    } else {
      if (talentsRemaining > 0) {
        setSelectedTalents([...selectedTalents, talentName]);
      }
    }
  };

  const getTalentList = () => {
    if (activeCategory === 'ascendencia') {
      const ascTalents = dados.talentos.ascendencia || [];
      return ascTalents.filter(t => {
        // Safe check for raca matching, if the talent defines a race
        return !t.raca || (ascendancy && t.raca.toLowerCase() === ascendancy.toLowerCase());
      }).map(t => ({ ...t, subcategoria: 'Ascendência' }));
    }

    const categoryData = dados.talentos[activeCategory];
    if (!categoryData) return [];

    const list = [];
    if (categoryData.iniciantes) {
      list.push(...categoryData.iniciantes.map(t => ({ ...t, subcategoria: 'Iniciante' })));
    }
    if (categoryData.profissionais) {
      list.push(...categoryData.profissionais.map(t => ({ ...t, subcategoria: 'Profissional' })));
    }
    if (categoryData.mestre) {
      list.push(...categoryData.mestre.map(t => ({ ...t, subcategoria: 'Mestre' })));
    }
    return list;
  };

  const displayedTalents = getTalentList();

  return (
    <div className="glass-panel talents-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Sparkles size={20} className="text-accent" />
          <h3 className="panel-title">Talentos</h3>
        </div>
        <div className="skills-summary">
          <span className="info-tag">
            Talentos Disponíveis: <strong className={talentsRemaining > 0 ? 'text-fire' : ''}>{talentsRemaining}</strong> / {maxTalents}
          </span>
        </div>
      </div>

      <div className="talents-layout">
        <div className="talents-sidebar">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="talents-content">
          {displayedTalents.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={24} className="text-muted" />
              <p>Nenhum talento encontrado para esta categoria.</p>
            </div>
          ) : (
            <div className="talents-grid">
              {displayedTalents.map((talent) => {
                const isSelected = selectedTalents.includes(talent.nome);
                const isDisabled = !isSelected && talentsRemaining <= 0;

                return (
                  <div 
                    key={talent.nome} 
                    className={`talent-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && toggleTalent(talent.nome)}
                  >
                    <div className="talent-header">
                      <div className="talent-title-area">
                        <h4 className="talent-name">{talent.nome}</h4>
                        <span className={`talent-badge ${talent.subcategoria.toLowerCase()}`}>{talent.subcategoria}</span>
                      </div>
                      <div className={`talent-checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                    
                    <div className="talent-body">
                      {talent.requisito && (
                        <p className="talent-req"><strong>Requisito:</strong> {talent.requisito}</p>
                      )}
                      {talent.custo && (
                        <p className="talent-cost"><strong>Custo:</strong> {talent.custo}</p>
                      )}
                      <p className="talent-desc">{talent.efeito}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <div className="inventory-notes" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <AlertCircle size={14} className="text-accent" />
        <span>Personagens ganham 2 talentos no nível 1, e +2 talentos a cada nível subsequente.</span>
      </div>
    </div>
  );
}
