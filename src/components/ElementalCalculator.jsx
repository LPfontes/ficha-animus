import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { ELEMENTAL_COSTS, ATTRIBUTES, ATTR_NAMES } from '../data/constants';
import dados from '../dados.json';

export default function ElementalCalculator({ element, attributes }) {
  const elementData = dados.elementos.find(e => e.nome === element) || dados.elementos[0];
  const [lv, setLv] = useState(1);
  const [dist, setDist] = useState('pessoal');
  const [overRange, setOverRange] = useState(false);
  const [customAttr, setCustomAttr] = useState('auto');

  const [area, setArea] = useState(0);

  const isBase = lv === 1 && dist === 'pessoal' && !overRange;

  const customTableDano = elementData.tabela_dano?.[lv];
  const customTableCura = elementData.tabela_cura?.[lv];
  const customTable = customTableDano || customTableCura;
  const baseCost = customTable ? customTable.pe : (ELEMENTAL_COSTS.levels.find(l => l.lv === lv)?.cost || 3);
  let distCost = ELEMENTAL_COSTS.distances.find(d => d.id === dist)?.cost || 0;

  if (overRange) distCost *= 2;

  const totalCost = baseCost + distCost + area;

  // Render function for a single grid to avoid repetition
  const renderGrid = (tableData, labelTitle) => {
    return (
      <div style={{ marginBottom: '2rem' }}>
        {labelTitle && <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{labelTitle}</div>}
        <div className="damage-grid">
          {[
            { label: 'Ac.1 (2-5)', key: 'ac1', color: '#9494a3' },
            { label: 'Ac.2 (6-9)', key: 'ac2', color: '#4da6ff' },
            { label: 'Ac.3 (10-12)', key: 'ac3', color: '#9d4edd' },
            { label: 'Ac.4 (Duplo 6)', key: 'ac4', color: '#ff4d4d' }
          ].map(hit => {
            const autoBonusVal = Math.max(...(elementData.bonus.split(' ou ').map(opt => attributes[opt] || 0)), 0);
            const bonusVal = customAttr === 'auto' ? autoBonusVal : (attributes[customAttr] || 0);

            if (tableData) {
              const hitData = tableData[hit.key];
              const finalDamage = hitData.base + (hitData.mult * bonusVal);
              return (
                <div key={hit.label} className="hit-card" style={{ borderLeft: `4px solid ${hit.color}` }}>
                  <div className="hit-label">{hit.label}</div>
                  <div className="hit-value" style={{ color: hit.color, fontSize: '1.5rem', fontWeight: '800' }}>
                    {finalDamage}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {hitData.base} + {hitData.mult}x {customAttr === 'auto' ? 'Atributo' : customAttr}
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
          <Zap size={20} style={{ color: 'var(--air)' }} />
          <h3 className="panel-title">Calculadora Elemental - {element}</h3>
        </div>
      </div>

      <div className="element-info-grid mb-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div className="info-tag"><strong>Alcance:</strong> {elementData.alcance_nativo}</div>
        <div className="info-tag"><strong>Bônus:</strong> {elementData.bonus.replace(/POT/g, 'Potência').replace(/HAB/g, 'Habilidade').replace(/COG/g, 'Cognição').replace(/PER/g, 'Perspicácia').replace(/PRE/g, 'Presença').replace(/ANI/g, 'Anima')}</div>
        <div className="info-tag"><strong>Ritmo:</strong> {elementData.ritmo}</div>
        <div className="info-tag" style={{ borderLeft: '3px solid var(--water)' }}><strong>Força:</strong> {elementData.forca}</div>
        <div className="info-tag" style={{ borderLeft: '3px solid var(--fire)' }}><strong>Fraqueza:</strong> {elementData.fraqueza}</div>
      </div>

      <div className="calc-container">
        <div className="calc-row">
          <label className="input-label">Nível da Ação</label>
          <div className="button-group">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setLv(n)}
                className={lv === n ? 'flex-1' : 'secondary flex-1'}
              >
                Lv {n}
              </button>
            ))}
          </div>
        </div>

        <div className="calc-row">
          <label className="input-label">Alcance da Ação</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="input-field"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            >
              {ELEMENTAL_COSTS.distances.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="calc-row">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={overRange}
                  onChange={(e) => setOverRange(e.target.checked)}
                />
                Ultrapassa Alcance Nativo ({elementData.alcance_nativo}) - Custo x2
              </label>
            </div>
          </div>
        </div>
        <div className="result-area">
          {isBase && <div className="badge">BASE</div>}
          <div className="stat-label" style={{ color: 'var(--air)', textTransform: 'uppercase' }}>Custo Total</div>
          <div className="stat-value" style={{ fontSize: '2.5rem', color: 'var(--air)' }}>{totalCost} PE</div>
        </div>
      </div>

      <div className="panel-subtitle" style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        Cálculo de Cura / Dano Elemental
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="inventory-notes" style={{ flex: 1, minWidth: '200px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {customTable ?
            "Os valores para o seu Elemento são pré-calculados automaticamente usando as regras oficiais do sistema e o atributo bônus selecionado." :
            "Insira os valores base da sua habilidade para calcular o total com o seu Bônus Elemental."
          }
        </div>

        <div className="input-group" style={{ minWidth: '180px' }}>
          <label className="input-label" style={{ fontSize: '0.7rem' }}>ATRIBUTO BÔNUS</label>
          <select
            className="input-field"
            value={customAttr}
            onChange={(e) => setCustomAttr(e.target.value)}
            style={{ padding: '0.4rem' }}
          >
            <option value="auto">Automático ({elementData.bonus})</option>
            {ATTRIBUTES.map(attr => (
              <option key={attr} value={attr}>{ATTR_NAMES[attr]} ({attr})</option>
            ))}
          </select>
        </div>
      </div>

      {customTable ? (
        <>
          {customTableDano && renderGrid(customTableDano, "Dano")}
          {customTableCura && renderGrid(customTableCura, "Cura")}
        </>
      ) : (
        renderGrid(null, null)
      )}
    </div>
  );
}
