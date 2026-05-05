import React, { useState } from 'react';
import { Package, Plus, Trash2, AlertCircle } from 'lucide-react';
import dados from '../dados.json';

export default function InventoryManager() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('iluminacao_e_viagem');
  const [selectedItemName, setSelectedItemName] = useState('');
  
  const totalSlots = 20;

  const categories = [
    { id: 'iluminacao_e_viagem', label: 'Viagem e Iluminação' },
    { id: 'cura_e_utilitarios', label: 'Cura e Utilidades' },
    { id: 'tatico_e_combate', label: 'Tático e Combate' },
    { id: 'especiais_e_exploracao', label: 'Exploração' }
  ];

  const availableItems = dados.itens_secundarios[selectedCategory] || [];

  const handleAddItem = () => {
    if (!selectedItemName) return;
    const itemData = availableItems.find(i => i.nome === selectedItemName);
    if (itemData) {
      setInventoryItems([...inventoryItems, { ...itemData, id: Date.now() }]);
      setSelectedItemName('');
    }
  };

  const handleRemoveItem = (id) => {
    setInventoryItems(inventoryItems.filter(i => i.id !== id));
  };

  const usedSlots = inventoryItems.reduce((acc, item) => acc + (item.slots !== undefined ? item.slots : 1), 0);
  const isOverloaded = usedSlots > totalSlots;

  return (
    <div className="glass-panel inventory-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Package size={20} style={{ color: 'var(--earth)' }} />
          <h3 className="panel-title">Mochila e Equipamentos</h3>
        </div>
        <div className={`skills-summary info-tag ${isOverloaded ? 'overloaded' : ''}`} style={isOverloaded ? { color: 'var(--fire)', borderColor: 'var(--fire)' } : {}}>
          Slots: <strong>{usedSlots}</strong> / {totalSlots}
        </div>
      </div>

      <div className="inventory-grid" style={{ marginBottom: '1.5rem' }}>
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div key={i} className={`inventory-slot ${i < usedSlots ? 'slot-filled' : 'slot-empty'}`} />
        ))}
        {isOverloaded && (
          <div className="inventory-slot slot-filled" style={{ background: 'var(--fire)', borderColor: 'var(--fire)' }} title="Sobrecarga!" />
        )}
      </div>

      <div className="inventory-controls" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select 
          className="input-field" 
          style={{ flex: 1, minWidth: '150px' }}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedItemName('');
          }}
        >
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select 
          className="input-field" 
          style={{ flex: 2, minWidth: '200px' }}
          value={selectedItemName}
          onChange={(e) => setSelectedItemName(e.target.value)}
        >
          <option value="">Selecione um item...</option>
          {availableItems.map(item => (
             <option key={item.nome} value={item.nome}>
               {item.nome} ({item.slots !== undefined ? item.slots : 1} slots) - {item.preco}
             </option>
          ))}
        </select>

        <button 
          className="primary icon-btn" 
          onClick={handleAddItem}
          disabled={!selectedItemName}
          title="Adicionar à Mochila"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="inventory-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {inventoryItems.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={24} className="text-muted" />
            <p>Mochila vazia. Adicione itens essenciais de sobrevivência.</p>
          </div>
        ) : (
          inventoryItems.map((item, index) => (
            <div key={item.id} className="inventory-item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text)' }}>{item.nome}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--earth)', background: 'rgba(77, 255, 136, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.categoria}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.slots !== undefined ? item.slots : 1} slots</span>
                </div>
                {item.efeito && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.efeito}</span>}
              </div>
              <button 
                className="secondary icon-btn small" 
                onClick={() => handleRemoveItem(item.id)}
                title="Remover"
                style={{ color: 'var(--fire)', borderColor: 'rgba(255, 77, 77, 0.3)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="inventory-notes" style={{ marginTop: '1.5rem' }}>
        • Armas e Armaduras empunhadas: 0 slots<br/>
        • O excesso de peso causa condição de Exaustão.
      </div>
    </div>
  );
}
