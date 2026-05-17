import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sword, Target, Zap, Info, Plus, Flame } from 'lucide-react';
import dados from '../dados.json';

const WEAPON_TEMPLATES = {
  cortante: {
    label: 'Cortante',
    icon: <Sword size={20} />,
    color: '#ee5253',
    atributo: 'POT',
    leve: { ac1: [2, 0], ac2: [3, 1], ac3: [4, 2], ac4: [5, 3], custo: 5 },
    media: { ac1: [3, 0], ac2: [4, 2], ac3: [6, 3], ac4: [8, 3], custo: 15 }
  },
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
    icon: <Sword size={20} style={{ transform: 'rotate(45deg)' }} />,
    color: '#00d2d3',
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
  const [type, setType] = useState('cortante');
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
    
    // Add principal mods separately to keep them distinct if needed
    const principalMods = [...dados.armas.caracteristicas_modulares.caracteristicas_principais];
    
    return {
      table1: principalMods,
      table2: mods
    };
  }, [type]);

  // Clean up selected mods if they are no longer available for the current type
  useEffect(() => {
    const allAvailableNames = [
      ...availableMods.table1.map(m => m.nome),
      ...availableMods.table2.map(m => m.nome)
    ];
    setSelectedMods(prev => prev.filter(modName => allAvailableNames.includes(modName)));
  }, [type, availableMods]);

  const table1Selected = useMemo(() => 
    selectedMods.find(m => availableMods.table1.some(p => p.nome === m)) || ''
  , [selectedMods, availableMods]);

  const table2SelectedCount = useMemo(() => 
    selectedMods.filter(m => availableMods.table2.some(p => p.nome === m)).length
  , [selectedMods, availableMods]);

  const allAvailableMods = useMemo(() => 
    [...availableMods.table1, ...availableMods.table2]
  , [availableMods]);

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
      const mod = allAvailableMods.find(m => m.nome === modName);
      if (!mod) return;
      if (mod.efeito && mod.efeito.includes('+1 <span class="text-mechanic">dano</span> base')) finalBase += 1;
      if (modName === 'Puxada Reforçada' || modName === 'Calibre aumentado') extraPoints += (attributes.HAB || 0);
      if (modName === 'Puxada Pesada') extraPoints += (attributes.POT || 0);
    });

    return finalBase + (finalMult * attrVal) + extraPoints + fixed;
  };

  const totalCost = useMemo(() => {
    let cost = currentLevelData.custo;
    
    selectedMods.forEach(modName => {
      const mod = allAvailableMods.find(m => m.nome === modName);
      if (mod && mod.preco) {
        const priceStr = String(mod.preco).replace(/\D/g, '');
        const price = parseInt(priceStr) || 0;
        cost += price;
      }
    });
    return cost;
  }, [currentLevelData, selectedMods, allAvailableMods]);

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
                { label: 'Raso', key: 'ac1' },
                { label: 'Padrão', key: 'ac2' },
                { label: 'Forte', key: 'ac3' },
                { label: 'Crítico', key: 'ac4' }
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

          {/* Características Escolhidas */}
          <div className="selected-mods-summary">
            <label className="input-label">CARACTERÍSTICAS SELECIONADAS</label>
            <div className="selected-mods-list">
              {selectedMods.length === 0 && <span className="empty-text">Nenhuma característica selecionada</span>}
              {selectedMods.map(modName => (
                <div key={modName} className="selected-mod-item">
                  <span>{modName}</span>
                  <button className="remove-mod-btn" onClick={() => setSelectedMods(selectedMods.filter(m => m !== modName))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Seletores de Modificadores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">PRINCIPAL (TABELA 1)</label>
              <select 
                className="input-field"
                value={table1Selected}
                onChange={(e) => {
                  const val = e.target.value;
                  const table1Names = availableMods.table1.map(m => m.nome);
                  const filtered = selectedMods.filter(m => !table1Names.includes(m));
                  if (val) {
                    setSelectedMods([...filtered, val]);
                  } else {
                    setSelectedMods(filtered);
                  }
                }}
              >
                <option value="">Nenhuma</option>
                {availableMods.table1.map(mod => (
                  <option key={mod.nome} value={mod.nome}>{mod.nome} (100 Đ)</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">COMPLEMENTARES (TABELA 2) [{table2SelectedCount}/3]</label>
              <select 
                className="input-field"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (selectedMods.includes(val)) return;
                  
                  if (table2SelectedCount >= 3) {
                    return alert("Você pode selecionar no máximo 3 características da Tabela 2!");
                  }
                  setSelectedMods([...selectedMods, val]);
                }}
              >
                <option value="" disabled>Adicionar (Máx 3)...</option>
                {/* Grouping by source for better UX */}
                <optgroup label="Características Complementares">
                  {availableMods.table2
                    .filter(m => dados.armas.caracteristicas_modulares.caracteristicas_complementares.some(c => c.nome === m.nome))
                    .map(mod => (
                      <option key={mod.nome} value={mod.nome} disabled={selectedMods.includes(mod.nome)}>
                        {mod.nome} ({mod.preco})
                      </option>
                    ))
                  }
                </optgroup>
                
                {(type === 'distancia' || type === 'fogo') && (
                  <optgroup label={type === 'distancia' ? "Propriedades Mecânicas" : "Propriedades de Fogo"}>
                    {availableMods.table2
                      .filter(m => !dados.armas.caracteristicas_modulares.caracteristicas_complementares.some(c => c.nome === m.nome))
                      .map(mod => (
                        <option key={mod.nome} value={mod.nome} disabled={selectedMods.includes(mod.nome)}>
                          {mod.nome} ({mod.preco})
                        </option>
                      ))
                    }
                  </optgroup>
                )}
              </select>
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
