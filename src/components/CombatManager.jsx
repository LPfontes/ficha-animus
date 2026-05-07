import React, { useState } from 'react';
import { Swords, Plus, Trash2, Shield as ShieldIcon, Info } from 'lucide-react';
import dados from '../dados.json';
import WeaponCreatorModal from './WeaponCreatorModal';

export default function CombatManager({ attributes, selectedArmor, setSelectedArmor, selectedShield, setSelectedShield }) {
  const allWeapons = [
    ...dados.armas.corpo_a_corpo.map(w => ({ ...w, id: w.nome })),
    ...dados.armas.longa_distancia.map(w => ({ ...w, id: w.nome }))
  ];

  const allArmors = dados.armaduras.tabela_base;
  const allShields = dados.escudos.tabela_base;

  const availableFeatures = [
    "Reforçada", "Estratégica", "Peculiar", "Duas Mãos",
    "Alcance", "Ocultável", "Arremesso", "Híbrida", "Defensiva",
    "Aparar", "Sequente", "Serrilhada", "Alcance Ampliado",
    "Flexível", "Atordoante", "Dupla", "Leve", "Arremessável",
    "Penetrante", "Encurvada", "Fio Afiado"
  ];

  const [weapons, setWeapons] = useState([
    { id: 'w1', data: allWeapons[0], isBalanced: false, customFeatures: [] }
  ]);
  const [activeWeaponId, setActiveWeaponId] = useState('w1');
  const [armorFeatures, setArmorFeatures] = useState([]);
  const [shieldFeatures, setShieldFeatures] = useState([]);
  const [showCreator, setShowCreator] = useState(false);

  const activeWeapon = weapons.find(w => w.id === activeWeaponId) || weapons[0];

  const addWeapon = () => {
    const newId = `w${Date.now()}`;
    setWeapons([...weapons, { id: newId, data: allWeapons[0], isBalanced: false, customFeatures: [] }]);
    setActiveWeaponId(newId);
  };

  const removeWeapon = (id) => {
    if (weapons.length > 1) {
      const newWeapons = weapons.filter(w => w.id !== id);
      setWeapons(newWeapons);
      if (activeWeaponId === id) {
        setActiveWeaponId(newWeapons[0].id);
      }
    } else {
      // Se for a última arma, reseta o slot para o padrão
      const defaultId = `w${Date.now()}`;
      setWeapons([{ id: defaultId, data: allWeapons[0], isBalanced: false, customFeatures: [] }]);
      setActiveWeaponId(defaultId);
    }
  };

  const updateActiveWeapon = (field, value) => {
    setWeapons(weapons.map(w => w.id === activeWeaponId ? { ...w, [field]: value } : w));
  };

  const parseDamage = (weapon, formula) => {
    if (!formula) return 0;
    let pot = attributes.POT;
    let hab = attributes.HAB;
    let per = attributes.PER;
    let cog = attributes.COG;

    const allFeatures = [
      ...(weapon.data.caracteristicas || []),
      ...weapon.customFeatures,
      weapon.isBalanced ? 'equilibrada' : ''
    ].map(f => f.toLowerCase().trim());

    if (allFeatures.includes('equilibrada')) {
      pot = hab;
    }

    const hasReforcada = allFeatures.includes('reforçada') || allFeatures.includes('reforcada');
    const hasEstrategica = allFeatures.includes('estratégica') || allFeatures.includes('estrategica');
    const hasPeculiar = allFeatures.includes('peculiar');
    const hasDuasMaos = allFeatures.includes('duas mãos') || allFeatures.includes('duas maos');

    let extraPoints = 0;
    if (allFeatures.includes('equilibrada')) extraPoints += hab;
    if (hasReforcada) extraPoints += pot;
    if (hasEstrategica) extraPoints += per;
    if (hasPeculiar) extraPoints += cog;
    if (hasDuasMaos) extraPoints += 3;

    let expr = formula.replace(/POT/g, pot).replace(/HAB/g, hab).replace(/x/g, '*');

    try {
      const baseValue = Function(`'use strict'; return (${expr})`)();
      let finalDamage = baseValue + extraPoints;

      // Handle Modular Characteristics from Weapon Creator
      allFeatures.forEach(feat => {
        // Composta: +1 dano base em todos os níveis
        if (feat === 'composta') finalDamage += 1;
        
        // Puxada Reforçada / Calibre Aumentado: +1 no multiplicador de HAB
        // Note: The formula already has HAB, so we just add HAB again
        if (feat === 'puxada reforçada' || feat === 'puxada reforcada' || feat === 'calibre aumentado') {
          finalDamage += attributes.HAB;
        }

        // Puxada Pesada: +1xPOT extra
        if (feat === 'puxada pesada') {
          finalDamage += attributes.POT;
        }
      });

      return finalDamage;
    } catch (e) {
      return 0;
    }
  };

  const calculateProtItem = (item, type = 'armor') => {
    if (!item) return 0;
    let base = item.protecao_base || item.pvs_base || 0;
    let multPot = item.multiplicador_pot || 0;
    let multHab = item.multiplicador_hab || 0;

    const features = type === 'armor' ? armorFeatures : shieldFeatures;

    features.forEach(feat => {
      if (feat === 'Fortificada' || feat === 'Reforçado') base += 3;
      if (feat === 'Reforçada') multPot += 1;
      if (feat === 'Ágil') multHab += 1;
    });

    return base + (multPot * attributes.POT) + (multHab * attributes.HAB);
  };

  const getProtFormula = (item, type = 'armor') => {
    if (!item) return "";
    let base = item.protecao_base || item.pvs_base || 0;
    let multPot = item.multiplicador_pot || 0;
    let multHab = item.multiplicador_hab || 0;

    const features = type === 'armor' ? armorFeatures : shieldFeatures;
    let mods = [];

    features.forEach(feat => {
      if (feat === 'Fortificada' || feat === 'Reforçado') mods.push("+3 (Mod)");
      if (feat === 'Reforçada') mods.push(`+1x${attributes.POT} (POT Mod)`);
      if (feat === 'Ágil') mods.push(`+1x${attributes.HAB} (HAB Mod)`);
    });

    return `${base} + ${multPot}x${attributes.POT} (POT) + ${multHab}x${attributes.HAB} (HAB)${mods.length > 0 ? ' ' + mods.join(' ') : ''}`;
  };

  return (
    <div className="glass-panel combat-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Swords size={20} className="text-accent" />
          <h3 className="panel-title">Foco de Combate</h3>
        </div>
        <div className="header-actions">
          <select
            className="header-select"
            value={activeWeaponId}
            onChange={(e) => setActiveWeaponId(e.target.value)}
          >
            {weapons.map((w, idx) => (
              <option key={w.id} value={w.id}>
                Slot {idx + 1}: {w.data.nome}
              </option>
            ))}
          </select>
          <button className="icon-btn" onClick={addWeapon} title="Adicionar Slot de Arma">
            <Plus size={16} />
          </button>
          <button className="icon-btn danger" onClick={() => removeWeapon(activeWeaponId)} title="Remover Arma Atual">
            <Trash2 size={16} />
          </button>
          <button className="secondary small-btn" onClick={() => setShowCreator(true)} style={{ marginLeft: '0.5rem' }}>
            Forjar Arma
          </button>
        </div>
      </div>

      <WeaponCreatorModal 
        isOpen={showCreator} 
        onClose={() => setShowCreator(false)} 
        onAddWeapon={(newW) => setWeapons([...weapons, newW])}
        attributes={attributes}
      />

      <div className="combat-selection-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="input-group">
          <label className="input-label">ARMADURA</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="input-field flex-1"
                value={selectedArmor?.categoria}
                onChange={(e) => {
                  setSelectedArmor(allArmors.find(a => a.categoria === e.target.value));
                  setArmorFeatures([]);
                }}
              >
                {allArmors.map(a => <option key={a.categoria} value={a.categoria}>{a.categoria}</option>)}
              </select>
              <div className="item-prot-badge">+{calculateProtItem(selectedArmor, 'armor')}</div>
            </div>
            {selectedArmor && selectedArmor.categoria !== 'Sem Armadura' && (
              <div className="armor-details-mini">
                <div className="hit-formula" style={{ fontSize: '0.75rem' }}>
                  {getProtFormula(selectedArmor, 'armor')}
                </div>
                <div className="penalty-tag">
                  <Info size={10} /> <strong>Penalidade:</strong> {selectedArmor.penalidade}
                </div>
                <div className="equipment-features">
                  {armorFeatures.map((feat, i) => (
                    <span key={i} className="feature-tag-mini custom"
                      onClick={() => setArmorFeatures(armorFeatures.filter((_, idx) => idx !== i))}
                      title={dados.armaduras.caracteristicas_modulares.find(f => f.nome === feat)?.efeito}>
                      {feat} ×
                    </span>
                  ))}
                  <select
                    className="add-feature-inline"
                    onChange={(e) => {
                      if (e.target.value) {
                        setArmorFeatures([...armorFeatures, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Mod</option>
                    {dados.armaduras.caracteristicas_modulares.map(f => (
                      <option key={f.nome} value={f.nome}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">ESCUDO</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="input-field flex-1"
                value={selectedShield?.categoria || 'Nenhum'}
                onChange={(e) => {
                  const found = allShields.find(s => s.categoria === e.target.value);
                  setSelectedShield(found.categoria === 'Nenhum' ? null : found);
                  setShieldFeatures([]);
                }}
              >
                {allShields.map(s => <option key={s.categoria} value={s.categoria}>{s.categoria}</option>)}
              </select>
              <div className="item-prot-badge">+{calculateProtItem(selectedShield, 'shield')}</div>
            </div>
            {selectedShield && selectedShield.categoria !== 'Nenhum' && (
              <div className="armor-details-mini">
                <div className="hit-formula" style={{ fontSize: '0.75rem' }}>
                  {getProtFormula(selectedShield, 'shield')}
                </div>
                <div className="penalty-tag">
                  <Info size={10} /> <strong>Restrição:</strong> {selectedShield.restricao}
                </div>
                <div className="equipment-features">
                  {shieldFeatures.map((feat, i) => (
                    <span key={i} className="feature-tag-mini custom"
                      onClick={() => setShieldFeatures(shieldFeatures.filter((_, idx) => idx !== i))}
                      title={dados.escudos.caracteristicas_modulares.find(f => f.nome === feat)?.efeito}>
                      {feat} ×
                    </span>
                  ))}
                  <select
                    className="add-feature-inline"
                    onChange={(e) => {
                      if (e.target.value) {
                        setShieldFeatures([...shieldFeatures, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Mod</option>
                    {dados.escudos.caracteristicas_modulares.map(f => (
                      <option key={f.nome} value={f.nome}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="focused-weapon-view">
        <div className="weapon-card-premium active" key={activeWeapon.id}>
          <div className="weapon-card-header">
            <select
              className="header-select-large"
              value={activeWeapon.data.nome}
              onChange={(e) => updateActiveWeapon('data', allWeapons.find(aw => aw.nome === e.target.value))}
            >
              {allWeapons.map(aw => <option key={aw.nome} value={aw.nome}>{aw.nome}</option>)}
            </select>
            <div className="weapon-actions">
              <label className="header-checkbox">
                <input
                  type="checkbox"
                  checked={activeWeapon.isBalanced}
                  onChange={(e) => updateActiveWeapon('isBalanced', e.target.checked)}
                />
                <span>Equilibrada</span>
              </label>
              {weapons.length > 1 && (
                <button className="icon-btn danger" onClick={() => removeWeapon(activeWeapon.id)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="damage-grid">
            {[
              { label: 'Acerto 1 (2-5)', key: 'ac1', color: '#9494a3' },
              { label: 'Acerto 2 (6-9)', key: 'ac2', color: '#4da6ff' },
              { label: 'Acerto 3 (10-12)', key: 'ac3', color: '#9d4edd' },
              { label: 'Acerto 4 (Duplo 6)', key: 'ac4', color: '#ff4d4d' }
            ].map(hit => (
              <div key={hit.label} className="hit-card" style={{ borderLeft: `4px solid ${hit.color}` }}>
                <div className="hit-label">{hit.label}</div>
                <div className="hit-value" style={{ color: hit.color, fontSize: '1.8rem' }}>
                  {parseDamage(activeWeapon, activeWeapon.data.dano[hit.key])}
                </div>
                <div className="hit-formula">
                  {(() => {
                    const formula = activeWeapon.data.dano[hit.key];
                    if (!formula) return "";
                    const allFeatures = [
                      ...(activeWeapon.data.caracteristicas || []),
                      ...activeWeapon.customFeatures,
                      activeWeapon.isBalanced ? 'equilibrada' : ''
                    ].map(f => f.toLowerCase().trim());

                    let displayFormula = formula;
                    if (activeWeapon.isBalanced) {
                      displayFormula = displayFormula.replace(/POT/g, `${attributes.HAB} (HAB)`);
                    } else {
                      displayFormula = displayFormula.replace(/POT/g, `${attributes.POT} (POT)`);
                    }
                    displayFormula = displayFormula.replace(/HAB/g, `${attributes.HAB} (HAB)`);

                    let mods = [];
                    if (allFeatures.includes('reforçada') || allFeatures.includes('reforcada')) {
                      const val = activeWeapon.isBalanced ? attributes.HAB : attributes.POT;
                      const label = activeWeapon.isBalanced ? 'HAB' : 'POT';
                      mods.push(`+1x${val} (${label})`);
                    }
                    if (allFeatures.includes('estratégica') || allFeatures.includes('estrategica')) {
                      mods.push(`+1x${attributes.PER} (PER)`);
                    }
                    if (allFeatures.includes('peculiar')) {
                      mods.push(`+1x${attributes.COG} (COG)`);
                    }
                    if (allFeatures.includes('duas mãos') || allFeatures.includes('duas maos')) {
                      mods.push("+3");
                    }
                    if (activeWeapon.isBalanced) {
                      mods.push(`+1x${attributes.HAB} (HAB)`);
                    }

                    return `${displayFormula}${mods.length > 0 ? ' ' + mods.join(' ') : ''}`;
                  })()}
                </div>
              </div>
            ))}
          </div>

          <div className="weapon-features-mini" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', marginTop: '1rem' }}>
            <div className="features-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Características & Modificadores</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[...(activeWeapon.data.caracteristicas || []), ...activeWeapon.customFeatures].map(feat => (
                <span key={feat} className={`feature-tag-mini ${activeWeapon.customFeatures.includes(feat) ? 'custom' : ''}`}
                  title={dados.caracteristicas_armas?.[feat] || feat}
                  onClick={() => {
                    if (activeWeapon.customFeatures.includes(feat)) {
                      updateActiveWeapon('customFeatures', activeWeapon.customFeatures.filter(f => f !== feat));
                    }
                  }}>
                  {feat} {activeWeapon.customFeatures.includes(feat) && '×'}
                </span>
              ))}
              <select
                className="add-feature-inline"
                onChange={(e) => {
                  if (e.target.value) {
                    updateActiveWeapon('customFeatures', [...activeWeapon.customFeatures, e.target.value]);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">+ Adicionar Modificador</option>
                {availableFeatures.map(f => (
                  <option key={f} value={f} disabled={[...(activeWeapon.data.caracteristicas || []), ...activeWeapon.customFeatures].includes(f)}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-notes" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
          <ShieldIcon size={16} />
          <span style={{ fontWeight: 800 }}>Proteção Total: {calculateProtItem(selectedArmor, 'armor') + calculateProtItem(selectedShield, 'shield')}</span>
        </div>
      </div>
    </div>
  );
}
