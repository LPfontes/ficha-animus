import React from 'react';
import dados from '../dados.json';
import { ATTR_NAMES } from '../data/constants';

export default function AscendancyBonusModal({ ascendancyName, onSelect, onClose }) {
  const ascendancy = dados.ascendencias.find(a => a.nome === ascendancyName);
  
  if (!ascendancy || !ascendancy.bonus_atributo_opcoes) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
        <h2 className="modal-title">Bônus de Ascendência: {ascendancyName}</h2>
        <p className="text-muted mb-1">Escolha um atributo para receber um bônus permanente de +1:</p>
        
        <div className="bonus-options">
          {ascendancy.bonus_atributo_opcoes.map(attr => (
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
