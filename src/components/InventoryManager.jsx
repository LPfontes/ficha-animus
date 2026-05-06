import React, { useState } from 'react';
import { Package, Plus, Trash2, AlertCircle, Info, X, ChevronDown } from 'lucide-react';
import dados from '../dados.json';

export default function InventoryManager() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('iluminacao_e_viagem');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
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
      const slots = itemData.slots !== undefined ? itemData.slots : 1;
      const currentUsed = inventoryItems.reduce((acc, item) => acc + (item.slots !== undefined ? item.slots : 1), 0);
      
      if (currentUsed + slots > totalSlots + 5) return; // Hard limit

      setInventoryItems([...inventoryItems, { ...itemData, id: Date.now() }]);
      setSelectedItemName('');
    }
  };

  const handleRemoveItem = (id) => {
    setInventoryItems(inventoryItems.filter(i => i.id !== id));
    setActiveItem(null);
  };

  const usedSlots = inventoryItems.reduce((acc, item) => acc + (item.slots !== undefined ? item.slots : 1), 0);
  const isOverloaded = usedSlots > totalSlots;

  // Flatten items into slots
  const slotsArray = Array.from({ length: totalSlots + 4 }).map((_, i) => {
    let currentSlotIndex = 0;
    for (const item of inventoryItems) {
      const itemSlots = item.slots !== undefined ? item.slots : 1;
      if (i >= currentSlotIndex && i < currentSlotIndex + itemSlots) {
        return { ...item, isStart: i === currentSlotIndex };
      }
      currentSlotIndex += itemSlots;
    }
    return null;
  });

  return (
    <div className={`glass-panel inventory-panel ${isOpen ? 'is-open' : 'is-closed'}`}>
      <div className="panel-header clickable" onClick={() => setIsOpen(!isOpen)}>
        <div className="panel-title-group">
          <Package size={20} style={{ color: 'var(--earth)' }} />
          <h3 className="panel-title">Mochila e Equipamentos</h3>
          {!isOpen && <span className="slots-preview">({usedSlots}/{totalSlots})</span>}
        </div>
        <div className="header-actions">
          <div className={`skills-summary info-tag ${isOverloaded ? 'overloaded' : ''}`} 
               style={isOverloaded ? { color: 'var(--fire)', borderColor: 'var(--fire)', background: 'rgba(255, 77, 77, 0.1)' } : {}}>
            Slots: <strong>{usedSlots}</strong> / {totalSlots}
          </div>
          <ChevronDown size={20} className={`toggle-icon ${isOpen ? 'rotated' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="accordion-content">

      <div className="inventory-grid-container">
        <div className="inventory-grid">
          {slotsArray.map((item, i) => {
            const isExtra = i >= totalSlots;
            return (
              <div 
                key={i} 
                className={`inventory-slot ${item ? 'filled' : 'empty'} ${isExtra ? 'extra-slot' : ''} ${item?.isStart ? 'item-start' : ''}`}
                onClick={() => item && setActiveItem(item)}
              >
                {item?.isStart && (
                  <div className="slot-content">
                    <span className="slot-item-name">{item.nome}</span>
                  </div>
                )}
                {!item && i < totalSlots && <div className="slot-index">{i + 1}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="inventory-controls-premium">
        <div className="controls-row">
          <select 
            className="input-field" 
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedItemName('');
            }}
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>

          <select 
            className="input-field flex-2" 
            value={selectedItemName}
            onChange={(e) => setSelectedItemName(e.target.value)}
          >
            <option value="">Adicionar item...</option>
            {availableItems.map(item => (
               <option key={item.nome} value={item.nome}>
                 {item.nome} ({item.slots !== undefined ? item.slots : 1} slots)
               </option>
            ))}
          </select>

          <button 
            className="primary add-btn" 
            onClick={handleAddItem}
            disabled={!selectedItemName}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {activeItem && (
        <div className="modal-overlay" onClick={() => setActiveItem(null)}>
          <div className="glass-panel item-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title-group">
                <Info size={18} className="text-water" />
                <h3 className="panel-title">{activeItem.nome}</h3>
              </div>
              <button className="secondary icon-btn" onClick={() => setActiveItem(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="item-detail-content">
              <div className="item-meta-grid">
                <div className="meta-item"><strong>Categoria:</strong> {activeItem.categoria}</div>
                <div className="meta-item"><strong>Preço:</strong> {activeItem.preco}</div>
                <div className="meta-item"><strong>Peso:</strong> {activeItem.slots !== undefined ? activeItem.slots : 1} slots</div>
              </div>
              <p className="item-description">{activeItem.efeito}</p>
              
              <button 
                className="w-full remove-item-btn" 
                onClick={() => handleRemoveItem(activeItem.id)}
              >
                <Trash2 size={16} /> Remover da Mochila
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      )}
    </div>
  );
}
