import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Check, X } from 'lucide-react';
import dados from '../dados.json';

export default function TalentsModal({ level, ascendancy, selectedTalents, setSelectedTalents, onClose }) {
  const maxTalents = 2 + (level - 1) * 2;
  const talentsRemaining = maxTalents - selectedTalents.length;
  
  const [activeCategory, setActiveCategory] = useState('combate');
  const [activeSubcategory, setActiveSubcategory] = useState('all');

  useEffect(() => {
    setActiveSubcategory('all');
  }, [activeCategory]);

  const categories = [
    { id: 'combate', label: 'Combate' },
    { id: 'pericia', label: 'Perícia' },
    { id: 'elemento', label: 'Elemento' },
    { id: 'ascendencia', label: 'Ascendência' }
  ];

  const toggleTalent = (talentId) => {
    if (selectedTalents.includes(talentId)) {
      setSelectedTalents(selectedTalents.filter(id => id !== talentId));
    } else {
      if (talentsRemaining > 0) {
        setSelectedTalents([...selectedTalents, talentId]);
      }
    }
  };

  const getTalentList = () => {
    if (activeCategory === 'ascendencia') {
      const ascTalents = dados.talentos.ascendencia || [];
      return ascTalents.filter(t => {
        return !t.raca || (ascendancy && t.raca.toLowerCase() === ascendancy.toLowerCase());
      }).map(t => ({ ...t, subcategoria: 'Ascendência' }));
    }

    const categoryData = dados.talentos[activeCategory];
    if (!categoryData) return [];

    const list = [];
    if (activeSubcategory === 'all' || activeSubcategory === 'iniciantes') {
      if (categoryData.iniciantes) {
        list.push(...categoryData.iniciantes.map(t => ({ ...t, subcategoria: 'Iniciante' })));
      }
    }
    if (activeSubcategory === 'all' || activeSubcategory === 'profissionais') {
      if (categoryData.profissionais) {
        list.push(...categoryData.profissionais.map(t => ({ ...t, subcategoria: 'Profissional' })));
      }
    }
    if (activeSubcategory === 'all' || activeSubcategory === 'mestre') {
      if (categoryData.mestre) {
        list.push(...categoryData.mestre.map(t => ({ ...t, subcategoria: 'Mestre' })));
      }
    }
    return list;
  };

  const displayedTalents = getTalentList();

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '1000px', width: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <Sparkles size={20} className="text-accent" />
            <h3 className="panel-title">Gerenciador de Talentos</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="skills-summary">
              <span className="info-tag">
                Disponíveis: <strong className={talentsRemaining > 0 ? 'text-fire' : ''}>{talentsRemaining}</strong> / {maxTalents}
              </span>
            </div>
            <button onClick={onClose} className="secondary icon-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="talents-layout" style={{ flex: 1, overflow: 'hidden' }}>
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
            
            <div className="inventory-notes" style={{ marginTop: 'auto', fontSize: '0.7rem' }}>
              <AlertCircle size={12} className="text-accent" />
              <span>2 iniciais + 2 por nível.</span>
            </div>
          </div>

          <div className="talents-content" style={{ overflowY: 'auto' }}>
            {activeCategory !== 'ascendencia' && (
              <div className="talents-content-header">
                <div className="sub-filters-bar">
                  <button 
                    className={`sub-filter-btn ${activeSubcategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveSubcategory('all')}
                  >
                    Todos
                  </button>
                  <button 
                    className={`sub-filter-btn ${activeSubcategory === 'iniciantes' ? 'active' : ''}`}
                    onClick={() => setActiveSubcategory('iniciantes')}
                  >
                    Iniciantes
                  </button>
                  <button 
                    className={`sub-filter-btn ${activeSubcategory === 'profissionais' ? 'active' : ''}`}
                    onClick={() => setActiveSubcategory('profissionais')}
                  >
                    Profissionais
                  </button>
                  <button 
                    className={`sub-filter-btn ${activeSubcategory === 'mestre' ? 'active' : ''}`}
                    onClick={() => setActiveSubcategory('mestre')}
                  >
                    Mestre
                  </button>
                </div>
                <div className="info-tag" style={{ fontSize: '0.7rem' }}>
                  {displayedTalents.length} talentos encontrados
                </div>
              </div>
            )}
            {displayedTalents.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={24} className="text-muted" />
                <p>Nenhum talento encontrado.</p>
              </div>
            ) : (
              <div className="talents-grid">
                {displayedTalents.map((talent) => {
                  const isSelected = selectedTalents.includes(talent.id);
                  const isDisabled = !isSelected && talentsRemaining <= 0;

                  return (
                    <div 
                      key={talent.id} 
                      className={`talent-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && toggleTalent(talent.id)}
                    >
                      <div className="talent-header">
                        <div className="talent-title-area">
                          <h4 className="talent-name">{talent.nome}</h4>
                          <span className={`talent-badge ${talent.subcategoria.toLowerCase().replace('ê', 'e')}`}>{talent.subcategoria}</span>
                        </div>
                        <div className={`talent-checkbox ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <Check size={14} />}
                        </div>
                      </div>
                      
                      <div className="talent-body">
                        {talent.requisito && (
                          <p className="talent-req"><strong>Requisito:</strong> {talent.requisito}</p>
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
        
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
           <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
