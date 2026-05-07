import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, AlertCircle, Check, X, Zap, Clock } from 'lucide-react';
import dados from '../dados.json';

export default function TalentsModal({ level, ascendancy, element, attributes, skills, selectedTalents, setSelectedTalents, onClose }) {
  const maxTalents = 2 + (level - 1) * 2;
  const talentsRemaining = maxTalents - selectedTalents.length;

  const [activeCategory, setActiveCategory] = useState('combate');
  const [activeSubcategory, setActiveSubcategory] = useState('available');

  // Map of skill IDs to names for lookup
  const skillNamesById = useMemo(() => {
    const map = {};
    Object.values(dados.pericias).flat().forEach(p => {
      map[p.id] = p.nome;
    });
    return map;
  }, []);

  const allSkillNames = useMemo(() => {
    return Object.values(dados.pericias).flat().map(p => p.nome).sort();
  }, []);

  const attrSiglas = { 1: 'POT', 2: 'HAB', 3: 'COG', 4: 'PER', 5: 'PRE', 6: 'ANI' };

  // Helper to check requirements using structured fields
  const checkRequirements = (talent) => {
    // 1. Level check based on tier
    if (talent.subcategoria === 'Profissional' && level < 3) return false;
    if (talent.subcategoria === 'Mestre' && level < 7) return false;

    const lowerReq = talent.requisito?.toLowerCase() || '';
    if (!lowerReq || lowerReq === '—') return true;

    // 2. Level match from text (fallback for specific level requirements)
    const levelMatch = lowerReq.match(/nível\s*(\d+)/);
    if (levelMatch && level < parseInt(levelMatch[1])) return false;

    // 3. Talent Prerequisites
    if (talent.requisitos_talentos_ids?.length > 0) {
      if (!talent.requisitos_talentos_ids.every(id => selectedTalents.some(t => t.id === id))) {
        return false;
      }
    }

    // 4. Attribute Requirements
    if (talent.requisitos_atributos?.length > 0) {
      const passesAttr = talent.requisitos_atributos.every(req => {
        const sigla = attrSiglas[req.id];
        return (attributes[sigla] || 0) >= req.valor;
      });
      if (!passesAttr) return false;
    }

    // 5. Skill Requirements (Handling "OU" logic based on requirement text)
    if (talent.requisitos_pericias?.length > 0) {
      const isOrLogic = lowerReq.includes(' ou ');
      const checkSkill = (req) => {
        const skillName = skillNamesById[req.id];
        return (skills[skillName] || 0) >= req.rank;
      };

      if (isOrLogic) {
        if (!talent.requisitos_pericias.some(checkSkill)) return false;
      } else {
        if (!talent.requisitos_pericias.every(checkSkill)) return false;
      }
    }

    // 6. Ascendancy requirement (String check as fallback)
    const races = dados.ascendencias.map(a => a.nome.toLowerCase());
    for (const race of races) {
      if (lowerReq.includes(race) && ascendancy.toLowerCase() !== race) return false;
    }

    // 7. Element requirement
    if (activeCategory === 'elemento' || lowerReq.includes('elemento')) {
      const elements = dados.elementos.map(e => e.nome.toLowerCase());
      for (const el of elements) {
        if (lowerReq.includes(el) && element.toLowerCase() !== el) return false;
      }
    }

    return true;
  };


  useEffect(() => {
    setActiveSubcategory('available');
  }, [activeCategory]);

  const categories = [
    { id: 'combate', label: 'Combate' },
    { id: 'pericia', label: 'Perícia' },
    { id: 'elemento', label: 'Elemento' },
    { id: 'ascendencia', label: 'Ascendência' }
  ];

  const toggleTalent = (talentId) => {
    const existing = selectedTalents.find(t => t.id === talentId);
    if (existing) {
      setSelectedTalents(selectedTalents.filter(t => t.id !== talentId));
    } else {
      if (talentsRemaining > 0) {
        setSelectedTalents([...selectedTalents, { id: talentId, metadata: {} }]);
      }
    }
  };

  const updateTalentMetadata = (talentId, metadata) => {
    setSelectedTalents(selectedTalents.map(t => 
      t.id === talentId ? { ...t, metadata } : t
    ));
  };

  const getTalentList = () => {
    let list = [];
    if (activeCategory === 'ascendencia') {
      const ascTalents = dados.talentos.ascendencia || [];
      list = ascTalents.filter(t => {
        return !t.raca || (ascendancy && t.raca.toLowerCase() === ascendancy.toLowerCase());
      }).map(t => ({ ...t, subcategoria: 'Ascendência' }));
    } else {
      const categoryData = dados.talentos[activeCategory];
      if (!categoryData) return [];

      if (activeSubcategory === 'all' || activeSubcategory === 'iniciantes' || activeSubcategory === 'available') {
        if (categoryData.iniciantes) {
          list.push(...categoryData.iniciantes.map(t => ({ ...t, subcategoria: 'Iniciante' })));
        }
      }
      if (activeSubcategory === 'all' || activeSubcategory === 'profissionais' || activeSubcategory === 'available') {
        if (categoryData.profissionais) {
          list.push(...categoryData.profissionais.map(t => ({ ...t, subcategoria: 'Profissional' })));
        }
      }
      if (activeSubcategory === 'all' || activeSubcategory === 'mestre' || activeSubcategory === 'available') {
        if (categoryData.mestre) {
          list.push(...categoryData.mestre.map(t => ({ ...t, subcategoria: 'Mestre' })));
        }
      }
    }

    // Apply subcategory filters (except 'all' and 'available' which are handled above)
    if (activeSubcategory !== 'all' && activeSubcategory !== 'available') {
      // already filtered in push logic
    }

    // Filter available
    if (activeSubcategory === 'available') {
      list = list.filter(t => checkRequirements(t));
    } else if (activeSubcategory !== 'all') {
      // already filtered in push
      list = list.filter(t => t.subcategoria.toLowerCase().startsWith(activeSubcategory.substring(0, 3)));
    }

    return list;
  };

  const displayedTalents = getTalentList();

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '1200px', width: '100vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
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
            <div className="talents-content-header">
              <div className="sub-filters-bar">
                <button
                  className={`sub-filter-btn ${activeSubcategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveSubcategory('all')}
                >
                  Todos
                </button>
                <button
                  className={`sub-filter-btn ${activeSubcategory === 'available' ? 'active' : ''}`}
                  onClick={() => setActiveSubcategory('available')}
                  style={{ color: 'var(--fire)', fontWeight: 'bold' }}
                >
                  Disponíveis
                </button>
                {activeCategory !== 'ascendencia' && (
                  <>
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
                  </>
                )}
              </div>
              <div className="info-tag" style={{ fontSize: '0.7rem' }}>
                {displayedTalents.length} talentos encontrados
              </div>
            </div>
            {displayedTalents.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={24} className="text-muted" />
                <p>Nenhum talento encontrado.</p>
              </div>
            ) : (
              <div className="talents-grid">
                {displayedTalents.map((talent) => {
                  const isSelected = selectedTalents.some(t => t.id === talent.id);
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
                          {talent.requisito && (
                            <p className="talent-req">Requisito: {talent.requisito}</p>
                          )}
                        </div>

                        <div className={`talent-checkbox ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <Check size={14} />}
                        </div>
                      </div>

                      {isSelected && talent.id === 95 && (
                        <div className="talent-metadata-config glass-panel" onClick={(e) => e.stopPropagation()}>
                          <label className="input-label">Vincular a Perícia:</label>
                          <select 
                            className="input-field small-select"
                            value={selectedTalents.find(t => t.id === 95)?.metadata?.skill || ''}
                            onChange={(e) => updateTalentMetadata(95, { skill: e.target.value })}
                          >
                            <option value="">Selecione...</option>
                            {allSkillNames.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="talent-body">
                        {(talent.custo || talent.gatilho) && (
                          <div className="talent-meta-info">
                            {talent.custo && (
                              <p className="talent-cost">
                                <Zap size={12} className="text-mechanic" />
                                <strong>Custo:</strong> <span dangerouslySetInnerHTML={{ __html: talent.custo }} />
                              </p>
                            )}
                            {talent.gatilho && (
                              <p className="talent-trigger">
                                <Clock size={12} className="text-accent" />
                                <strong>Gatilho:</strong> <span dangerouslySetInnerHTML={{ __html: talent.gatilho }} />
                              </p>
                            )}
                          </div>
                        )}

                        <p className="talent-desc" dangerouslySetInnerHTML={{ __html: talent.efeito }} />

                        {talent.opcoes && talent.opcoes.length > 0 && (
                          <div className="talent-options">
                            {talent.opcoes.map((opt, i) => (
                              <div key={i} className="talent-option-item">
                                <span className="option-name" dangerouslySetInnerHTML={{ __html: opt.nome }} />: &nbsp;
                                <span className="option-effect" dangerouslySetInnerHTML={{ __html: opt.efeito }} />
                                {opt.custo && (
                                  <span className="option-cost" dangerouslySetInnerHTML={{ __html: ` — ${opt.custo}` }} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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
