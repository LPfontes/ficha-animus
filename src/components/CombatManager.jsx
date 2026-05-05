import React, { useState } from 'react';
import { Swords } from 'lucide-react';
import dados from '../dados.json';

export default function CombatManager({ attributes, selectedArmor, setSelectedArmor, selectedShield, setSelectedShield }) {
  const allWeapons = [
    ...dados.armas.corpo_a_corpo.map(w => ({ ...w, id: w.nome })),
    ...dados.armas.longa_distancia.map(w => ({ ...w, id: w.nome }))
  ];

  const allArmors = dados.armaduras.tabela_base;
  const allShields = [
    { categoria: 'Nenhum', pvs_base: 0, multiplicador_pot: 0, multiplicador_hab: 0 },
    ...dados.escudos.tabela_base
  ];

  const availableFeatures = [
    "Reforçada", "Estratégica", "Peculiar", "Duas Mãos", 
    "Alcance", "Ocultável", "Arremesso", "Híbrida", "Defensiva", 
    "Aparar", "Sequente", "Serrilhada", "Alcance Ampliado", 
    "Flexível", "Atordoante", "Dupla", "Leve", "Arremessável", 
    "Penetrante", "Encurvada", "Fio Afiado"
  ];

  const [selectedWeapon, setSelectedWeapon] = useState(allWeapons[0]);
  const [isBalanced, setIsBalanced] = useState(false);
  const [customFeatures, setCustomFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [showAddFeature, setShowAddFeature] = useState(false);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setCustomFeatures([...customFeatures, newFeature.trim()]);
      setNewFeature('');
      setShowAddFeature(false);
    }
  };

  const removeFeature = (feat) => {
    setCustomFeatures(customFeatures.filter(f => f !== feat));
  };

  const parseDamage = (formula) => {
    if (!formula) return 0;
    let pot = attributes.POT;
    let hab = attributes.HAB;
    let per = attributes.PER;
    let cog = attributes.COG;
    
    // Combine native weapon features and custom features
    const allFeatures = [
      ...(selectedWeapon.caracteristicas || []),
      ...customFeatures,
      isBalanced ? 'equilibrada' : ''
    ].map(f => f.toLowerCase().trim());

    // Evaluate Equilibrada: Swaps POT for HAB
    const hasEquilibrada = allFeatures.includes('equilibrada');
    if (hasEquilibrada) {
      pot = hab; // Replace POT modifier with HAB
    }
    
    const hasReforcada = allFeatures.includes('reforçada') || allFeatures.includes('reforcada');
    const hasEstrategica = allFeatures.includes('estratégica') || allFeatures.includes('estrategica');
    const hasPeculiar = allFeatures.includes('peculiar');
    const hasDuasMaos = allFeatures.includes('duas mãos') || allFeatures.includes('duas maos');
    
    // Base extra components
    let extraPoints = 0;
    
    if (hasEquilibrada) {
      extraPoints += hab; // +1xHAB multiplier
    }
    if (hasReforcada) {
      extraPoints += pot; // +1xPOT multiplier (uses 'pot' which was swapped to hab if Equilibrada is active)
    }
    if (hasEstrategica) {
      extraPoints += per; // +1xPER multiplier
    }
    if (hasPeculiar) {
      extraPoints += cog; // +1xCOG multiplier
    }
    if (hasDuasMaos) {
      extraPoints += 3; // +3 dano fixo
    }

    let expr = formula.replace(/POT/g, pot)
      .replace(/HAB/g, hab)
      .replace(/x/g, '*');

    try {
      const base = Function(`'use strict'; return (${expr})`)();
      return base + extraPoints;
    } catch (e) {
      console.error("Error parsing formula:", formula, e);
      return 0;
    }
  };

  const calculateProtItem = (item) => {
    if (!item) return 0;
    const base = item.protecao_base || item.pvs_base || 0;
    return base + (item.multiplicador_pot * attributes.POT) + (item.multiplicador_hab * attributes.HAB);
  };

  return (
    <div className="glass-panel combat-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Swords size={20} className="text-accent" />
          <h3 className="panel-title">Combate</h3>
        </div>
      </div>

      <div className="combat-selection-grid">
        <div className="input-group">
          <label className="input-label">ARMA ATIVA</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="input-field flex-1"
              value={selectedWeapon.id}
              onChange={(e) => setSelectedWeapon(allWeapons.find(w => w.id === e.target.value))}
            >
              {allWeapons.map(w => <option key={w.id} value={w.id}>{w.nome} ({w.tipo})</option>)}
            </select>
            <label className="input-label checkbox-label">
              <input
                type="checkbox"
                checked={isBalanced}
                onChange={(e) => setIsBalanced(e.target.checked)}
              />
              Equilibrada
            </label>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">ARMADURA</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="input-field flex-1"
              value={selectedArmor?.categoria}
              onChange={(e) => setSelectedArmor(allArmors.find(a => a.categoria === e.target.value))}
            >
              {allArmors.map(a => <option key={a.categoria} value={a.categoria}>{a.categoria}</option>)}
            </select>
            <div className="item-prot-badge">+{calculateProtItem(selectedArmor)}</div>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">ESCUDO</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="input-field flex-1"
              value={selectedShield?.categoria || 'Nenhum'}
              onChange={(e) => {
                const found = allShields.find(s => s.categoria === e.target.value);
                setSelectedShield(found.categoria === 'Nenhum' ? null : found);
              }}
            >
              {allShields.map(s => <option key={s.categoria} value={s.categoria}>{s.categoria}</option>)}
            </select>
            <div className="item-prot-badge">+{calculateProtItem(selectedShield)}</div>
          </div>
        </div>
      </div>

      <div className="damage-grid">
        {[
          { label: 'Ac.1 (2-5)', key: 'ac1', color: '#9494a3' },
          { label: 'Ac.2 (6-9)', key: 'ac2', color: '#4da6ff' },
          { label: 'Ac.3 (10-12)', key: 'ac3', color: '#9d4edd' },
          { label: 'Ac.4 (Duplo 6)', key: 'ac4', color: '#ff4d4d' }
        ].map(hit => (
          <div key={hit.label} className="hit-card" style={{ borderLeft: `4px solid ${hit.color}` }}>
            <div className="hit-label">{hit.label}</div>
            <div className="hit-value" style={{ color: hit.color }}>
              {parseDamage(selectedWeapon.dano[hit.key])}
            </div>
          </div>
        ))}
      </div>

      <div className="weapon-features">
        <span className="features-label">Características:</span>
        <div className="features-list">
          {selectedWeapon.caracteristicas?.map(feat => (
            <span key={feat} className="feature-tag" title={dados.caracteristicas_armas?.[feat] || feat}>{feat}</span>
          ))}
          {customFeatures.map(feat => (
            <span key={feat} className="feature-tag custom" onClick={() => removeFeature(feat)} title={dados.caracteristicas_armas?.[feat] ? `${dados.caracteristicas_armas[feat]} (Clique para remover)` : "Clique para remover"}>
              {feat} <span className="remove-x">×</span>
            </span>
          ))}

          {showAddFeature ? (
            <div className="add-feature-container">
              <select
                className="add-feature-select"
                onChange={(e) => {
                  if (e.target.value) {
                    setCustomFeatures([...customFeatures, e.target.value]);
                    setShowAddFeature(false);
                  }
                }}
                onBlur={() => setShowAddFeature(false)}
                autoFocus
              >
                <option value="">Selecione...</option>
                {availableFeatures.map(feat => (
                  <option key={feat} value={feat} disabled={customFeatures.includes(feat)}>
                    {feat}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button className="add-feature-btn" onClick={() => setShowAddFeature(true)} title="Adicionar Característica">+</button>
          )}
        </div>
      </div>

      <div className="inventory-notes" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span>Proteção Total: {calculateProtItem(selectedArmor) + calculateProtItem(selectedShield)}</span>
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          * Dica: Adicione características como "Reforçada", "Duas Mãos" ou "Estratégica" para calcular o dano automaticamente.
        </span>
      </div>
    </div>
  );
}
