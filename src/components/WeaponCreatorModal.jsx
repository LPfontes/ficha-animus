import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Sword, Target, Zap, Info, Plus, Flame } from 'lucide-react';
import dados from '../dados.json';

const WEAPON_TEMPLATES = {
  contusa: {
    label: 'Contusa',
    icon: <Zap size={20} />,
    color: '#ffcc00',
    atributo: 'POT',
    leve: { ac1: [1, 1], ac2: [2, 2], ac3: [3, 3], ac4: [4, 4], custo: 5 },
    media: { ac1: [2, 1], ac2: [3, 2], ac3: [5, 3], ac4: [6, 5], custo: 15 }
  },
  perfurante: {
    label: 'Perfurante',
    icon: <Sword size={20} />,
    color: '#ff4d4d',
    atributo: 'POT',
    leve: { ac1: [1, 0], ac2: [2, 1], ac3: [3, 2], ac4: [5, 5], custo: 3 },
    media: { ac1: [2, 0], ac2: [3, 1], ac3: [4, 3], ac4: [7, 6], custo: 10 }
  },
  distancia: {
    label: 'Longa Distância',
    icon: <Target size={20} />,
    color: '#4da6ff',
    atributo: 'HAB',
    leve: { ac1: [1, 1], ac2: [1, 2], ac3: [2, 3], ac4: [3, 4], custo: 10, alcance: 15 },
    media: { ac1: [1, 2], ac2: [2, 3], ac3: [3, 4], ac4: [5, 5], custo: 15, alcance: 30 }
  },
  fogo: {
    label: 'Arma de Fogo',
    icon: <Flame size={20} />,
    color: '#ff8c00',
    atributo: 'HAB',
    leve: { 
      ac1: [1, 1, 2], ac2: [1, 2, 2], ac3: [2, 3, 2], ac4: [3, 4, 2], 
      custo: 200, alcance: 20,
      description: 'Pistolas. Alcance 20m. +2 dano fixo. 1 mão. Recarga: 2 PA.'
    },
    media: { 
      ac1: [1, 2, 4], ac2: [2, 3, 4], ac3: [3, 4, 4], ac4: [5, 5, 4], 
      custo: 500, alcance: 40,
      description: 'Mosquetes/carabinas. Alcance 40m. +4 dano fixo. 2 mãos. Recarga: 2 PA.'
    }
  }
};

export default function WeaponCreatorModal({ isOpen, onClose, onAddWeapon, attributes }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('contusa');
  const [category, setCategory] = useState('leve');
  const [selectedMods, setSelectedMods] = useState([]);

  const currentTemplate = WEAPON_TEMPLATES[type];
  const currentLevelData = currentTemplate[category];

  const availableMods = useMemo(() => {
    let mods = [...dados.armas.caracteristicas_modulares.caracteristicas_complementares];
    
    if (type === 'distancia') {
      mods = [...mods, ...dados.armas.caracteristicas_modulares.armas_mecanicas];
    }
    if (type === 'fogo') {
      mods = [...mods, ...dados.armas.caracteristicas_modulares.armas_de_fogo];
    }
    
    return [...mods, ...dados.armas.caracteristicas_modulares.caracteristicas_principais];
  }, [type]);

  const calculateDmg = (base, mult, fixed = 0) => {
    let attrType = currentTemplate.atributo;
    let finalBase = base;
    let finalMult = mult;
    let extraPoints = 0;

    selectedMods.forEach(modName => {
      if (modName === 'Equilibrada') {
        attrType = 'HAB';
        finalMult += 1;
        extraPoints += (attributes.HAB || 0);
      }
      if (modName === 'Reforçada') finalMult += 1;
      if (modName === 'Estratégica') extraPoints += (attributes.PER || 0);
      if (modName === 'Peculiar') extraPoints += (attributes.COG || 0);
    });

    const attrVal = attributes[attrType] || 0;

    selectedMods.forEach(modName => {
      const mod = availableMods.find(m => m.nome === modName);
      if (!mod) return;
      if (mod.efeito.includes('+1 <span class="text-mechanic">dano</span> base')) finalBase += 1;
      if (modName === 'Puxada Reforçada' || modName === 'Calibre aumentado') extraPoints += (attributes.HAB || 0);
      if (modName === 'Puxada Pesada') extraPoints += (attributes.POT || 0);
    });

    return finalBase + (finalMult * attrVal) + extraPoints + fixed;
  };

  const totalCost = useMemo(() => {
    let cost = currentLevelData.custo;
    selectedMods.forEach(modName => {
      const mod = availableMods.find(m => m.nome === modName);
      if (mod && mod.preco) {
        const price = parseInt(mod.preco.replace(/\D/g, '')) || 0;
        cost += price;
      }
    });
    return cost;
  }, [currentLevelData, selectedMods, availableMods]);

  const handleAdd = () => {
    if (!name) return alert('Dê um nome à sua arma!');

    const formula = (base, mult, fixed = 0) => {
      let f = `${base} + ${mult}x${currentTemplate.atributo}`;
      if (fixed > 0) f += ` + ${fixed}`;
      return f;
    };

    const newWeapon = {
      id: `custom-${Date.now()}`,
      data: {
        nome: name,
        tipo: currentTemplate.label,
        categoria: category === 'leve' ? 'Leve' : 'Média',
        dano: {
          ac1: formula(currentLevelData.ac1[0], currentLevelData.ac1[1], currentLevelData.ac1[2] || 0),
          ac2: formula(currentLevelData.ac2[0], currentLevelData.ac2[1], currentLevelData.ac2[2] || 0),
          ac3: formula(currentLevelData.ac3[0], currentLevelData.ac3[1], currentLevelData.ac3[2] || 0),
          ac4: formula(currentLevelData.ac4[0], currentLevelData.ac4[1], currentLevelData.ac4[2] || 0)
        },
        caracteristicas: selectedMods,
        custo: `${totalCost} Đ`,
        alcance: currentLevelData.alcance ? `${currentLevelData.alcance}m` : 'Curto',
        isCustom: true
      },
      isBalanced: false,
      customFeatures: []
    };

    onAddWeapon(newWeapon);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sword className="text-accent" />
            <h2 className="modal-title">Forjar Arma Personalizada</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Nome */}
          <div className="input-group">
            <label className="input-label">NOME DA ARMA</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Quebra-Crânios, Agulha de Prata..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Tipo e Categoria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">TIPO DE BASE</label>
              <div className="type-selector">
                {Object.entries(WEAPON_TEMPLATES).map(([key, t]) => (
                  <button 
                    key={key}
                    className={`type-btn ${type === key ? 'active' : ''}`}
                    onClick={() => setType(key)}
                    style={{ borderColor: type === key ? t.color : 'transparent' }}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">CATEGORIA</label>
              <div className="category-toggle">
                <button 
                  className={`toggle-btn ${category === 'leve' ? 'active' : ''}`}
                  onClick={() => setCategory('leve')}
                >
                  Leve
                </button>
                <button 
                  className={`toggle-btn ${category === 'media' ? 'active' : ''}`}
                  onClick={() => setCategory('media')}
                >
                  Média
                </button>
              </div>
            </div>
          </div>

          {/* Descrição do Modelo */}
          {currentLevelData.description && (
            <div className="info-box glass-panel" style={{ padding: '0.8rem', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Info size={18} className="text-accent" />
              <span style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.4' }}>{currentLevelData.description}</span>
            </div>
          )}

          {/* Preview de Dano */}
          <div className="damage-preview-panel">
            <label className="input-label">PREVIEW DE DANO ({currentTemplate.atributo} {attributes[currentTemplate.atributo]})</label>
            <div className="preview-grid">
              {[
                { label: 'Ac.1', key: 'ac1' },
                { label: 'Ac.2', key: 'ac2' },
                { label: 'Ac.3', key: 'ac3' },
                { label: 'CRÍT.', key: 'ac4' }
              ].map(hit => (
                <div key={hit.key} className="preview-hit-card">
                  <span className="hit-name">{hit.label}</span>
                  <span className="hit-val">
                    {calculateDmg(currentLevelData[hit.key][0], currentLevelData[hit.key][1], currentLevelData[hit.key][2] || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modificadores (Mods) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">CARACTERÍSTICA PRINCIPAL (TABELA 1 - MÁX 1)</label>
              <div className="mods-container">
                {dados.armas.caracteristicas_modulares.caracteristicas_principais.map(mod => {
                  const isSelected = selectedMods.includes(mod.nome);
                  return (
                    <div 
                      key={mod.nome} 
                      className={`mod-tag ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMods(selectedMods.filter(m => m !== mod.nome));
                        } else {
                          const table1Names = dados.armas.caracteristicas_modulares.caracteristicas_principais.map(m => m.nome);
                          const filtered = selectedMods.filter(m => !table1Names.includes(m));
                          setSelectedMods([...filtered, mod.nome]);
                        }
                      }}
                      title={mod.efeito.replace(/<[^>]*>/g, '')}
                    >
                      {mod.nome} (100 Đ)
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">CARACTERÍSTICAS MODULARES & COMPLEMENTARES (TABELA 2 - MÁX 3)</label>
              <div className="mods-container">
                {availableMods.filter(m => !dados.armas.caracteristicas_modulares.caracteristicas_principais.some(p => p.nome === m.nome)).map(mod => {
                  const isSelected = selectedMods.includes(mod.nome);
                  const table1Names = dados.armas.caracteristicas_modulares.caracteristicas_principais.map(m => m.nome);
                  const table2Selected = selectedMods.filter(m => !table1Names.includes(m));

                  return (
                    <div 
                      key={mod.nome} 
                      className={`mod-tag ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMods(selectedMods.filter(m => m !== mod.nome));
                        } else {
                          if (table2Selected.length >= 3) {
                            return alert("Você pode selecionar no máximo 3 características da Tabela 2!");
                          }
                          setSelectedMods([...selectedMods, mod.nome]);
                        }
                      }}
                      title={mod.efeito.replace(/<[^>]*>/g, '')}
                    >
                      {mod.nome} ({mod.preco})
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="total-cost">
              Custo Total: <span className="text-accent">{totalCost} Đ</span>
            </div>
            <button className="primary-btn" onClick={handleAdd}>
              <Plus size={18} /> Forjar Arma
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
