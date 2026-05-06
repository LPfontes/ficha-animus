import React, { useState, useMemo, useEffect } from 'react';
import UnifiedAbilities from './components/UnifiedAbilities';
import CombatManager from './components/CombatManager';
import ElementalCalculator from './components/ElementalCalculator';
import InventoryManager from './components/InventoryManager';
import TalentsModal from './components/TalentsModal';
import PersistenceManager from './components/PersistenceManager';
import { INITIAL_POINTS, ATTRIBUTES, INITIAL_STATS, LEVEL_CAPS } from './data/constants';
import { Shield, Heart, Zap, Star, Sparkles, Camera, ChevronUp, ChevronDown, User, Sword, Wand2, Backpack, BookOpen, StarHalf, Cloud } from 'lucide-react';
import ImageCropperModal from './components/ImageCropperModal';
import AscendancyBonusModal from './components/AscendancyBonusModal';
import ElementalBonusModal from './components/ElementalBonusModal';
import dados from './dados.json';

function App() {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [ascendancy, setAscendancy] = useState(dados.ascendencias[0].nome);
  const [element, setElement] = useState(dados.elementos[0].nome);
  const [image, setImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [ascendancyBonusAttr, setAscendancyBonusAttr] = useState(null);
  const [elementalBonusAttr, setElementalBonusAttr] = useState(null);

  const [showTalentsModal, setShowTalentsModal] = useState(false);
  const [showPersistenceModal, setShowPersistenceModal] = useState(false);

  const [attributes, setAttributes] = useState(
    ATTRIBUTES.reduce((acc, attr) => ({ ...acc, [attr]: 0 }), {})
  );

  const handleAscendancyChange = (newVal) => {
    setAscendancy(newVal);
    setAscendancyBonusAttr(null);
    setShowBonusModal(true);
  };

  const handleElementChange = (newVal) => {
    setElement(newVal);
    setElementalBonusAttr(null);
    setShowElementModal(true);
  };

  const [pointsSpentPv, setPointsSpentPv] = useState(0);
  const [pointsSpentPe, setPointsSpentPe] = useState(0);
  const [pointsSpentAp, setPointsSpentAp] = useState(0);

  const [currentPv, setCurrentPv] = useState(10);
  const [currentPe, setCurrentPe] = useState(10);
  const [currentPa, setCurrentPa] = useState(4);
  const [currentProt, setCurrentProt] = useState(0);

  const [selectedArmor, setSelectedArmor] = useState(dados.armaduras.tabela_base[0]);
  const [selectedShield, setSelectedShield] = useState(null);

  const [skills, setSkills] = useState({});
  const [selectedTalents, setSelectedTalents] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropper(true);
        e.target.value = null; // Reset to allow same file re-selection
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setImage(croppedImage);
    setShowCropper(false);
    setTempImage(null);
  };

  // Derived Stats Logic
  const levelBonus = level - 1;
  const pv = INITIAL_STATS.pv + levelBonus + pointsSpentPv;
  const pe = INITIAL_STATS.pe + levelBonus + pointsSpentPe;
  const pa = LEVEL_CAPS[level]?.pa || 4;

  const totalAttributes = useMemo(() => {
    const total = { ...attributes };
    if (ascendancyBonusAttr) {
      total[ascendancyBonusAttr] = (total[ascendancyBonusAttr] || 0) + 1;
    }
    if (elementalBonusAttr) {
      total[elementalBonusAttr] = (total[elementalBonusAttr] || 0) + 1;
    }
    return total;
  }, [attributes, ascendancyBonusAttr, elementalBonusAttr]);

  const protection = useMemo(() => {
    let total = 0;
    if (selectedArmor) {
      total += selectedArmor.protecao_base +
        (selectedArmor.multiplicador_pot * totalAttributes.POT) +
        (selectedArmor.multiplicador_hab * totalAttributes.HAB);
    }
    if (selectedShield) {
      total += selectedShield.pvs_base +
        (selectedShield.multiplicador_pot * totalAttributes.POT) +
        (selectedShield.multiplicador_hab * totalAttributes.HAB);
    }
    return total;
  }, [selectedArmor, selectedShield, totalAttributes]);

  const apTotal = 0 + levelBonus + pointsSpentAp; // AP starts at 0 + level bonus

  // Skills Math
  const skillsList = Object.values(skills);
  const totalSkillLevels = skillsList.reduce((sum, lvl) => sum + lvl, 0);
  const amadorCount = skillsList.filter(lvl => lvl >= 1).length;
  const freeSlotsUsed = Math.min(amadorCount, 4);
  const freeSlotsRemaining = 4 - freeSlotsUsed;

  const apSpentOnSkills = totalSkillLevels - freeSlotsUsed;
  const apRemaining = apTotal - apSpentOnSkills;

  const totalStatPoints = levelBonus * INITIAL_POINTS.statPointsPerLevel;
  const statPointsRemaining = totalStatPoints - (pointsSpentPv + pointsSpentPe + pointsSpentAp);

  const attributePointsAvailable = LEVEL_CAPS[level]?.attrPoints || 1;
  const attributesSpent = Object.values(attributes).reduce((a, b) => a + b, 0);
  const pointsRemaining = attributePointsAvailable - attributesSpent;

  const characterData = {
    name, level, ascendancy, element, 
    baseAttributes: attributes,
    bonusAttributes: { ascendancy: ascendancyBonusAttr, elemental: elementalBonusAttr },
    attributes: totalAttributes, 
    pv, pe, pa, protection,
    currentPv, currentPe, currentPa, currentProt,
    skills,
    selectedTalents,
    pointsSpent: { pv: pointsSpentPv, pe: pointsSpentPe, ap: pointsSpentAp },
    equipment: {
      armor: selectedArmor,
      shield: selectedShield
    },
    image
  };

  const handleResumeData = (data) => {
    if (!data) return;
    setName(data.name || '');
    setLevel(data.level || 1);
    setAscendancy(data.ascendancy || dados.ascendencias[0].nome);
    setElement(data.element || dados.elementos[0].nome);
    setAttributes(data.baseAttributes || ATTRIBUTES.reduce((acc, attr) => ({ ...acc, [attr]: 0 }), {}));
    setAscendancyBonusAttr(data.bonusAttributes?.ascendancy || null);
    setElementalBonusAttr(data.bonusAttributes?.elemental || null);
    setPointsSpentPv(data.pointsSpent?.pv || 0);
    setPointsSpentPe(data.pointsSpent?.pe || 0);
    setPointsSpentAp(data.pointsSpent?.ap || 0);
    setCurrentPv(data.currentPv || 10);
    setCurrentPe(data.currentPe || 10);
    setCurrentPa(data.currentPa || 4);
    setCurrentProt(data.currentProt || 0);
    setSkills(data.skills || {});
    setSelectedTalents(data.selectedTalents || []);
    setSelectedArmor(data.equipment?.armor || dados.armaduras.tabela_base[0]);
    setSelectedShield(data.equipment?.shield || null);
    setImage(data.image || null);
  };

  // Sync current with max on level/attr change if needed, 
  // but usually users want to track damage.
  // For simplicity in this demo, let's just provide the state.

  const [activeTab, setActiveTab] = useState('perfil');

  // Helper to find talent by ID across all categories
  const getTalentById = (id) => {
    for (const cat in dados.talentos) {
      const category = dados.talentos[cat];
      if (Array.isArray(category)) {
        const found = category.find(t => t.id === id);
        if (found) return { ...found, subcategoria: 'Ascendência' };
      } else {
        for (const subcat in category) {
          const found = category[subcat].find(t => t.id === id);
          if (found) {
            const subLabels = { iniciantes: 'Iniciante', profissionais: 'Profissional', mestre: 'Mestre' };
            return { ...found, subcategoria: subLabels[subcat] || subcat };
          }
        }
      }
    }
    return null;
  };

  // Initialize current stats with max values on mount
  useEffect(() => {
    setCurrentProt(protection);
    setCurrentPv(pv);
    setCurrentPe(pe);
  }, []); // Only on mount

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(id);
    }
  };

  return (
    <div className="app-layout">
      <nav className="side-tabs">
        <button
          className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => scrollToSection('perfil')}
          title="Perfil e Status"
        >
          <User size={20} />
          <span className="tab-label">Perfil</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'habilidades' ? 'active' : ''}`}
          onClick={() => scrollToSection('habilidades')}
          title="Atributos e Perícias"
        >
          <BookOpen size={20} />
          <span className="tab-label">Habilidades</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'combate' ? 'active' : ''}`}
          onClick={() => scrollToSection('combate')}
          title="Combate e Equipamento"
        >
          <Sword size={20} />
          <span className="tab-label">Combate</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'talentos' ? 'active' : ''}`}
          onClick={() => setShowTalentsModal(true)}
          title="Talentos"
        >
          <Sparkles size={20} />
          <span className="tab-label">Talentos</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'magia' ? 'active' : ''}`}
          onClick={() => scrollToSection('magia')}
          title="Calculadora Elemental"
        >
          <Zap size={20} />
          <span className="tab-label">Magia</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'itens' ? 'active' : ''}`}
          onClick={() => scrollToSection('itens')}
          title="Inventário"
        >
          <Backpack size={20} />
          <span className="tab-label">Itens</span>
        </button>
      </nav>

      <div id="sheet-content" className="app-container">
        <header className="app-header">
          <h1 className="app-title">ANIMUS</h1>
          <p className="app-subtitle">GERADOR DE FICHA BETA</p>
        </header>
        <div className="profile-section-wrapper">
          <div id="perfil" className="info-panel-full">
            <div className="profile-panel-container">
              <div className="glass-panel info-panel-flex">
                <div className="portrait-container">
                  <input
                    type="file"
                    id="portrait-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="portrait-input" className="portrait-upload">
                    {image ? (
                      <>
                        <img src={image} alt="Portrait" />
                        <div className="portrait-overlay">
                          <Camera size={24} />
                          <span>TROCAR FOTO</span>
                        </div>
                      </>
                    ) : (
                      <div className="portrait-placeholder">
                        <Camera size={24} />
                        <span className="portrait-text">FOTO</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="info-stats-column flex-1">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button 
                      className="primary cloud-sync-btn" 
                      onClick={() => setShowPersistenceModal(true)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      <Cloud size={16} />
                      <span>Sincronizar Nuvem</span>
                    </button>
                  </div>
                  <div className="char-info-grid">
                    <div className="input-group">
                      <label className="input-label">NOME DO PERSONAGEM</label>
                      <input
                        type="text"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Kaelen"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">NÍVEL</label>
                      <input
                        type="number"
                        className="input-field input-small"
                        min="1" max="10"
                        value={level}
                        onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">ASCENDÊNCIA</label>
                      <div className="input-with-button">
                        <select
                          className="input-field flex-1"
                          value={ascendancy}
                          onChange={(e) => handleAscendancyChange(e.target.value)}
                        >
                          {dados.ascendencias.map(a => (
                            <option key={a.id} value={a.nome}>{a.nome}</option>
                          ))}
                        </select>
                        <button
                          className="secondary icon-btn"
                          title="Alterar Bônus"
                          onClick={() => setShowBonusModal(true)}
                        >
                          <Star size={16} color={ascendancyBonusAttr ? 'var(--accent)' : 'currentColor'} />
                        </button>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">AFINIDADE ELEMENTAL</label>
                      <div className="input-with-button">
                        <select
                          className="input-field flex-1"
                          value={element}
                          onChange={(e) => handleElementChange(e.target.value)}
                        >
                          {dados.elementos.map(el => (
                            <option key={el.nome} value={el.nome}>{el.nome}</option>
                          ))}
                        </select>
                        <button
                          className="secondary icon-btn"
                          title="Alterar Bônus"
                          onClick={() => setShowElementModal(true)}
                        >
                          <Sparkles size={16} color={elementalBonusAttr ? 'var(--accent)' : 'currentColor'} />
                        </button>
                      </div>
                    </div>
                  </div>


                  <div className="stats-bar">
                    <div className="stat-points-badge">Pontos de Status: {statPointsRemaining}</div>
                    {[
                      {
                        label: 'VIDAS (PV)', cur: currentPv, setCur: setCurrentPv, max: pv, icon: <Heart size={24} />, color: 'var(--fire)',
                        spent: pointsSpentPv, setSpent: setPointsSpentPv
                      },
                      {
                        label: 'PROTEÇÃO', cur: currentProt, setCur: setCurrentProt, max: protection, icon: <Shield size={24} />, color: 'var(--water)',
                      },
                      {
                        label: 'ENERGIA (PE)', cur: currentPe, setCur: setCurrentPe, max: pe, icon: <Zap size={24} />, color: 'var(--air)',
                        spent: pointsSpentPe, setSpent: setPointsSpentPe
                      },
                      {
                        label: 'AÇÕES (PA)', cur: currentPa, setCur: setCurrentPa, max: pa, icon: <Zap size={24} />, color: 'var(--accent)'
                      }
                    ].map(stat => (
                      <div key={stat.label} className="glass-panel stat-card" style={{ borderBottom: `4px solid ${stat.color}` }}>
                        <div className="stat-header">
                          <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
                          <div className="stat-label">{stat.label}</div>
                        </div>

                        <div className="stat-value-container">
                          {stat.readOnly ? (
                            <div className="stat-input" style={{ textAlign: 'center', width: '100%' }}>{stat.max}</div>
                          ) : (
                            <>
                              <input
                                type="number"
                                className="stat-input"
                                value={stat.cur}
                                onChange={(e) => stat.setCur(parseInt(e.target.value) || 0)}
                              />
                              <span className="stat-max">/ {stat.max}</span>
                            </>
                          )}
                          {stat.setSpent ? (
                            <div className="stat-scroll-control"
                              onWheel={(e) => {
                                if (e.deltaY < 0) {
                                  if (statPointsRemaining > 0) stat.setSpent(p => p + 1);
                                } else {
                                  stat.setSpent(p => Math.max(0, p - 1));
                                }
                              }}
                              title="Scroll para ajustar ou clique nas setas"
                            >
                              <span className="bonus-tag" onClick={() => statPointsRemaining > 0 && stat.setSpent(p => p + 1)}>
                                +{stat.spent}
                              </span>
                              <div className="scroll-arrows">
                                <ChevronUp
                                  size={14}
                                  className="arrow-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (statPointsRemaining > 0) stat.setSpent(p => p + 1);
                                  }}
                                />
                                <ChevronDown
                                  size={14}
                                  className="arrow-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    stat.setSpent(p => Math.max(0, p - 1));
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="stat-scroll-control disabled">
                              <span className="bonus-tag">Nv</span>
                              <div className="scroll-arrows">
                                <ChevronUp size={12} className="arrow" />
                                <ChevronDown size={12} className="arrow" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Habilidades Inatas da Ascendência */}
                <div className="innate-abilities-section">
                  <h4 className="panel-title" style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                    Habilidades Inatas - {ascendancy}
                  </h4>
                  <div className="abilities-list">
                    {dados.ascendencias.find(a => a.nome === ascendancy)?.habilidades_inatas.map(hab => (
                      <div key={hab.nome} className="ability-row">
                        <div className="ability-header">
                          <span className="ability-name">{hab.nome}</span>
                        </div>
                        <span className="ability-desc">{hab.descricao}</span>
                        {hab.efeito_mecanico && (
                          <span className="ability-effect-tag">
                            {hab.efeito_mecanico}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Talentos Selecionados */}
                <div className="selected-talents-section">
                  <div className="panel-header" style={{ marginBottom: '0.8rem' }}>
                    <h4 className="panel-title" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>
                      Talentos Selecionados
                    </h4>
                    <button className="secondary small-btn" onClick={() => setShowTalentsModal(true)}>
                      <Sparkles size={14} /> Gerenciar
                    </button>
                  </div>
                  <div className="talents-summary-list">
                    {selectedTalents.length === 0 ? (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>Nenhum talento selecionado</span>
                    ) : (
                      selectedTalents.map(tId => {
                        const talent = getTalentById(tId);
                        if (!talent) return null;
                        return (
                          <div key={tId} className="talent-summary-tag">
                            <div className="ability-header">
                              <span className="ability-name">{talent.nome}</span>
                            </div>
                            <span className="ability-desc">{talent.efeito}</span>
                            <span className="ability-effect-tag">{talent.subcategoria}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="habilidades" className="section-container">
            <UnifiedAbilities
              attributes={totalAttributes}
              rawAttributes={attributes}
              setAttributes={setAttributes}
              level={level}
              pointsRemaining={pointsRemaining}
              bonusAttr={ascendancyBonusAttr}
              elementalBonusAttr={elementalBonusAttr}
              skills={skills}
              setSkills={setSkills}
              apRemaining={apRemaining}
              freeSlotsRemaining={freeSlotsRemaining}
              attrCap={LEVEL_CAPS[level]?.attrCap || 2}
            />
          </div>

          <div id="combate" className="section-container">
            <CombatManager
              attributes={totalAttributes}
              selectedArmor={selectedArmor}
              setSelectedArmor={setSelectedArmor}
              selectedShield={selectedShield}
              setSelectedShield={setSelectedShield}
            />
          </div>


          <div id="itens" className="section-container">
            <InventoryManager />
          </div>

          <div id="magia" className="section-container">
            <ElementalCalculator element={element} attributes={totalAttributes} />
          </div>


        </div>



        <footer className="app-footer">
          <div className="footer-line"></div>
          <div className="footer-content">
            <p>Animus RPG System &copy; 2026 - Versão Beta</p>
            <p className="signature">Produzido por <span>L. P. Fontes</span></p>
            <p className="footer-email">lp.desouzafontes@gmail.com</p>
          </div>
        </footer>
      </div>

      {showCropper && (
        <ImageCropperModal
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {showBonusModal && (
        <AscendancyBonusModal
          ascendancyName={ascendancy}
          onSelect={setAscendancyBonusAttr}
          onClose={() => setShowBonusModal(false)}
        />
      )}

      {showElementModal && (
        <ElementalBonusModal
          elementName={element}
          onSelect={setElementalBonusAttr}
          onClose={() => setShowElementModal(false)}
        />
      )}

      {showTalentsModal && (
        <TalentsModal
          level={level}
          ascendancy={ascendancy}
          selectedTalents={selectedTalents}
          setSelectedTalents={setSelectedTalents}
          onClose={() => setShowTalentsModal(false)}
        />
      )}

      {showPersistenceModal && (
        <PersistenceManager
          characterData={characterData}
          onResumeData={handleResumeData}
          onClose={() => setShowPersistenceModal(false)}
        />
      )}
    </div>
  );
}

export default App;
