import React, { useState } from 'react';
import { Zap, Target, Activity, Brain, Shield, Flame, Info, ChevronDown } from 'lucide-react';
import { ELEMENTAL_COSTS, ATTRIBUTES, ATTR_NAMES } from '../data/constants';
import dados from '../dados.json';

export default function ElementalCalculator({ element, attributes }) {
  const [currentElement, setCurrentElement] = useState(element);
  const elementData = dados.elementos.find(e => e.nome === currentElement) || dados.elementos[0];
  const [lv, setLv] = useState(1);
  const [dist, setDist] = useState('0');
  const [customAttr, setCustomAttr] = useState('auto');
  const [areaId, setAreaId] = useState('none');

  const getNativeRange = (elementName) => {
    const name = (elementName || '').toLowerCase();
    if (name.includes('trovão') || name.includes('metal')) return 6;
    if (name.includes('vento')) return 12;
    return 9; // Fogo, Água, Madeira, Terra
  };

  const nativeMeters = getNativeRange(currentElement);

  const distanceOptions = [
    { id: '0', name: 'Pessoal (Toque / 0m)', implements: 0, cost: 0, meters: 0 },
    { id: '1', name: `Curto (${nativeMeters}m)`, implements: 1, cost: 3, meters: nativeMeters },
    { id: '2', name: `Médio (${nativeMeters * 2}m)`, implements: 2, cost: 6, meters: nativeMeters * 2 },
    { id: '3', name: `Longo (${nativeMeters * 3}m) [Alcance Mágico Maximo]`, implements: 3, cost: 12, meters: nativeMeters * 3 }
  ];

  const areaOptions = [
    { id: 'none', name: 'Alvo Único / Nenhuma', implements: 0, cost: 0 },
    { id: 'pequena', name: 'Pequena (Explosão 3m, Cone 6m, Linha 6m)', implements: 1, cost: 3 },
    { id: 'media', name: 'Média (Explosão 6m, Cone 9m, Linha 12m)', implements: 2, cost: 6 },
    { id: 'grande', name: 'Grande (Explosão 9m, Cone 18m, Linha 18m)', implements: 3, cost: 9 }
  ];

  const selectedDistObj = distanceOptions.find(d => d.id === dist) || distanceOptions[0];
  const selectedAreaObj = areaOptions.find(a => a.id === areaId) || areaOptions[0];

  const customTableDano = elementData.tabela_dano?.[lv];
  const customTableCura = elementData.tabela_cura?.[lv];
  const customTable = customTableDano || customTableCura;

  const baseCost = lv * 3;
  const distCost = selectedDistObj.cost;
  const areaCost = selectedAreaObj.cost;
  const totalCost = baseCost + distCost + areaCost;
  const totalImplements = lv + selectedDistObj.implements + selectedAreaObj.implements;

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
            { label: 'Raso (2-5)', key: 'ac1', color: '#9494a3' },
            { label: 'Padrão (6-9)', key: 'ac2', color: '#4da6ff' },
            { label: 'Forte (10-12)', key: 'ac3', color: '#9d4edd' },
            { label: 'Crítico (Duplo 6)', key: 'ac4', color: '#ff4d4d' }
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
        <div className="info-tag"><Target size={12} /> <strong>Alcance Nativo:</strong> {nativeMeters}m / impl.</div>
        <div className="info-tag"><Info size={12} /> <strong>Atributo Ganho:</strong> {elementData.bonus}</div>
        <div className="info-tag"><Activity size={12} /> <strong>Ritmo:</strong> {elementData.ritmo}</div>
        <div className="info-tag" style={{ borderLeft: '2px solid var(--water)' }}><Shield size={12} className="text-water" /> <strong>Força:</strong> {elementData.forca}</div>
        <div className="info-tag" style={{ borderLeft: '2px solid var(--fire)' }}><Flame size={12} className="text-fire" /> <strong>Fraqueza:</strong> {elementData.fraqueza}</div>
      </div>

      <div className="element-effects-section">
        <div className="section-subtitle-premium-mini">
          <Activity size={14} className="text-accent" />
          <span>Efeitos de Status e Terreno</span>
        </div>
        <div className="effects-grid">
          <div className="effect-card inata">
            <div className="effect-header text-condition">Condição Inata (3+)</div>
            <div className="effect-body">{elementData.condicao_inata}</div>
          </div>
          <div className="effect-card avancada">
            <div className="effect-header text-mechanic">Condição Avançada (4 ac.)</div>
            <div className="effect-body">{elementData.condicao_avancada}</div>
          </div>
          <div className="effect-card terreno">
            <div className="effect-header text-resource">Efeito de Terreno</div>
            <div className="effect-body">{elementData.efeito_terreno}</div>
          </div>
        </div>
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
                Nível {n} ({n} impl. / {n * 3} PE)
              </button>
            ))}
          </div>
        </div>

        <div className="calc-row-group">
          <div className="calc-row">
            <label className="input-label">Extensão de Alcance</label>
            <select
              className="input-field"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            >
              {distanceOptions.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} (+{d.cost} PE)
                </option>
              ))}
            </select>
          </div>

          <div className="calc-row">
            <label className="input-label">Área de Efeito</label>
            <select
              className="input-field"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
            >
              {areaOptions.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (+{a.cost} PE)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calc-row">
          {selectedDistObj.implements === 3 && (
            <div className="over-range-alert animate-pulse" style={{ opacity: 1 }}>
              <Info size={14} />
              <span>
                Alcance Longo selecionado. O 3º implemento de distância possui uma penalidade de +3 PE (custando 6 PE isoladamente).
              </span>
            </div>
          )}
        </div>

        <div className="result-area">
          <div className="stat-label" style={{ color: 'var(--air)' }}>CUSTO DE ENERGIA (IMPLEMENTOS)</div>
          <div className="stat-value" style={{ fontSize: '2.8rem', color: 'var(--air)' }}>{totalCost} PE</div>
          <div className="hit-formula" style={{ color: 'var(--air)', background: 'rgba(77, 255, 255, 0.05)', border: '1px solid rgba(77, 255, 255, 0.1)' }}>
            {baseCost} PE ({lv} impl.) + {distCost} PE ({selectedDistObj.implements} impl.) + {areaCost} PE ({selectedAreaObj.implements} impl.)
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Total de Implementos Ativos: <strong>{totalImplements}</strong> / Eixo de Alcance: {nativeMeters}m por patamar
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
