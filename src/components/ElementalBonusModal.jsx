import React from 'react';
import dados from '../dados.json';
import { ATTR_NAMES } from '../data/constants';

export default function ElementalBonusModal({ elementName, onSelect, onClose }) {
  const element = dados.elementos.find(e => e.nome === elementName);
  
  if (!element || !element.bonus) {
    return null;
  }

  // Parse "HAB ou PRE" into ["HAB", "PRE"]
  const options = element.bonus.split(' ou ').map(s => s.trim());

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
        <h2 className="modal-title">Bônus Elemental: {elementName}</h2>
        <p className="text-muted mb-1">Escolha um atributo para receber um bônus de afinidade (+1):</p>
        
        <div className="bonus-options">
          {options.map(attr => (
            <button
              key={attr}
              className="bonus-btn"
              onClick={() => {
                onSelect(attr);
                onClose();
              }}
            >
              <span className="attr-name">{ATTR_NAMES[attr]}</span>
              <span className="attr-plus">+1</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
