import React, { useState } from 'react';
import { Zap, Target, Activity, Brain, Shield, Flame, Info, ChevronDown } from 'lucide-react';
import { ELEMENTAL_COSTS, ATTRIBUTES, ATTR_NAMES } from '../data/constants';
import dados from '../dados.json';

export default function ElementalCalculator({ element, attributes }) {
  const [currentElement, setCurrentElement] = useState(element);
  const elementData = dados.elementos.find(e => e.nome === currentElement) || dados.elementos[0];
  const [lv, setLv] = useState(1);
  const [dist, setDist] = useState('pessoal');
  const [customAttr, setCustomAttr] = useState('auto');
  const [areaId, setAreaId] = useState('none');
  const [useDoubleDistRule, setUseDoubleDistRule] = useState(true);

  const nativeMeters = parseInt(elementData.alcance_nativo) || 0;
  const selectedDistObj = ELEMENTAL_COSTS.distances.find(d => d.id === dist);
  const selectedMeters = selectedDistObj?.meters || 0;

  const isOverRange = selectedMeters > nativeMeters;


  const customTableDano = elementData.tabela_dano?.[lv];
  const customTableCura = elementData.tabela_cura?.[lv];
  const customTable = customTableDano || customTableCura;
  const baseCost = customTable ? customTable.pe : (ELEMENTAL_COSTS.levels.find(l => l.lv === lv)?.cost || 3);

  let distCost = selectedDistObj?.cost || 0;
  if (isOverRange && useDoubleDistRule) distCost *= 2;

  const areaCost = ELEMENTAL_COSTS.areaCosts.find(a => a.id === areaId)?.cost || 0;
  const totalCost = baseCost + distCost + areaCost;

  const renderGrid = (tableData, labelTitle) => {
    return (
      <div style={{ marginBottom: '2.5rem' }}>
        {labelTitle && (
          <div className="grid-section-title">
            {labelTitle === "Dano" ? <Flame size={14} className="text-fire" /> : <Shield size={14} className="text-water" />}
            {labelTitle}
          </div>
        )}
        <div className="damage-grid">
          {[
            { label: 'Acerto 1 (2-5)', key: 'ac1', color: '#9494a3' },
            { label: 'Acerto 2 (6-9)', key: 'ac2', color: '#4da6ff' },
            { label: 'Acerto 3 (10-12)', key: 'ac3', color: '#9d4edd' },
            { label: 'Acerto 4 (Duplo 6)', key: 'ac4', color: '#ff4d4d' }
          ].map(hit => {
            const bonusVal = customAttr === 'auto' ? (attributes.ANI || 0) : (attributes[customAttr] || 0);

            if (tableData) {
              const hitData = tableData[hit.key];
              const finalDamage = hitData.base + (hitData.mult * bonusVal);
              return (
                <div key={hit.label} className="hit-card" style={{ borderLeft: `4px solid ${hit.color}` }}>
                  <div className="hit-label">{hit.label}</div>
                  <div className="hit-value" style={{ color: hit.color, fontSize: '1.6rem', fontWeight: '900' }}>
                    {finalDamage}
                  </div>
                  <div className="hit-formula">
                    {hitData.base} + {hitData.mult}x{bonusVal} ({customAttr === 'auto' ? 'ANI' : customAttr})
                  </div>
                </div>
              );
            }

            return (
              <div key={hit.label} className="hit-card" style={{ borderLeft: `4px solid ${hit.color}` }}>
                <div className="hit-label">{hit.label}</div>
                <div className="hit-value" style={{ color: hit.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                  <input
                    type="number"
                    className="input-field"
                    style={{ width: '50px', textAlign: 'center', padding: '0.3rem', fontSize: '1rem' }}
                    placeholder="0"
                  />
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>+{bonusVal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel elemental-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Zap size={20} className="text-air" />
          <h3 className="panel-title">Mística Elemental</h3>
        </div>
        <select
          className="header-select"
          value={currentElement}
          onChange={(e) => setCurrentElement(e.target.value)}
          style={{ width: 'auto', minWidth: '120px' }}
        >
          {dados.elementos.map(e => (
            <option key={e.nome} value={e.nome}>{e.nome}</option>
          ))}
        </select>
      </div>

      <div className="element-info-grid">
        <div className="info-tag"><Target size={12} /> <strong>Alcance Nativo:</strong> {elementData.alcance_nativo}</div>
        <div className="info-tag"><Info size={12} /> <strong>Atributo Ganho:</strong> {elementData.bonus}</div>
        <div className="info-tag"><Activity size={12} /> <strong>Ritmo:</strong> {elementData.ritmo}</div>
        <div className="info-tag" style={{ borderLeft: '2px solid var(--water)' }}><Shield size={12} className="text-water" /> <strong>Força:</strong> {elementData.forca}</div>
        <div className="info-tag" style={{ borderLeft: '2px solid var(--fire)' }}><Flame size={12} className="text-fire" /> <strong>Fraqueza:</strong> {elementData.fraqueza}</div>
      </div>

      <div className="calc-container">
        <div className="calc-row">
          <label className="input-label">Nível da Ação Mística</label>
          <div className="button-group">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setLv(n)}
                className={lv === n ? 'flex-1' : 'secondary flex-1'}
              >
                Nível {n}
              </button>
            ))}
          </div>
        </div>

        <div className="calc-row-group">
          <div className="calc-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">Extensão de Alcance</label>
              <label className="header-checkbox">
                <input
                  type="checkbox"
                  checked={useDoubleDistRule}
                  onChange={(e) => setUseDoubleDistRule(e.target.checked)}
                />
                <span style={{ fontSize: '0.7rem' }}>Custo Dobrado</span>
              </label>
            </div>
            <select
              className="input-field"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            >
              {ELEMENTAL_COSTS.distances.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="calc-row">
            <label className="input-label">Área de Efeito (Acro) </label>
            <select
              className="input-field"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
            >
              {ELEMENTAL_COSTS.areaCosts.map(a => <option key={a.id} value={a.id}>{a.name} (+{a.cost} PE)</option>)}
            </select>
          </div>
        </div>

        <div className="calc-row">
          {isOverRange && (
            <div className={`over-range-alert ${useDoubleDistRule ? 'animate-pulse' : ''}`} style={{ opacity: useDoubleDistRule ? 1 : 0.8 }}>
              <Info size={14} />
              <span>
                Alcance selecionado ({selectedMeters}m) excede o Alcance Nativo ({elementData.alcance_nativo}).
                {useDoubleDistRule ? ' O custo de distância foi dobrado.' : ' (Regra de custo dobrado desativada)'}
              </span>
            </div>
          )}
        </div>

        <div className="result-area">
          <div className="stat-label" style={{ color: 'var(--air)' }}>CUSTO DE ENERGIA</div>
          <div className="stat-value" style={{ fontSize: '2.8rem', color: 'var(--air)' }}>{totalCost} PE</div>
          <div className="hit-formula" style={{ color: 'var(--air)', background: 'rgba(77, 255, 255, 0.05)', border: '1px solid rgba(77, 255, 255, 0.1)' }}>
            {baseCost} (Base) + {distCost} (Distância) + {areaCost} (Área)
          </div>
        </div>
      </div>

      <div className="panel-subtitle-premium">
        <div className="panel-title-group">
          <Brain size={16} />
          <span>Matriz de Potencialidade (Cálculo)</span>
        </div>
        <div className="input-group" style={{ minWidth: '220px' }}>
          <select
            className="header-select"
            value={customAttr}
            onChange={(e) => setCustomAttr(e.target.value)}
          >
            <option value="auto">Usar Anima (Padrão)</option>
            {ATTRIBUTES.map(attr => (
              <option key={attr} value={attr}>{ATTR_NAMES[attr]} ({attr})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grids-container">
        {customTable ? (
          <>
            {customTableDano && renderGrid(customTableDano, "Dano")}
            {customTableCura && renderGrid(customTableCura, "Cura")}
          </>
        ) : (
          renderGrid(null, null)
        )}
      </div>
    </div>
  );
}
