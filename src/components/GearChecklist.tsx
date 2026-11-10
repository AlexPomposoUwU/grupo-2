import React, { useState, useEffect } from 'react';
import { GEAR_CHECKLIST } from '../data/survivalData';
import { CheckSquare, Plus, Trash2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { SurvivalItem } from '../types/survival';

export const GearChecklist: React.FC = () => {
  const [items, setItems] = useState<SurvivalItem[]>(() => {
    try {
      const saved = localStorage.getItem('selvaviva_gear_items');
      return saved ? JSON.parse(saved) : GEAR_CHECKLIST;
    } catch {
      return GEAR_CHECKLIST;
    }
  });

  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('selvaviva_checked_gear');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [newItemName, setNewItemName] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('selvaviva_gear_items', JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('selvaviva_checked_gear', JSON.stringify(checkedIds));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: SurvivalItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: 'essenciais',
      importance: 'alto',
      tip: 'Item personalizado adicionado pelo sobrevivente.',
    };

    setItems((prev) => [newItem, ...prev]);
    setCheckedIds((prev) => [newItem.id, ...prev]);
    setNewItemName('');
  };

  const handleReset = () => {
    setItems(GEAR_CHECKLIST);
    setCheckedIds([]);
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'todos') return true;
    return item.category === activeCategory;
  });

  const readinessPercent = items.length > 0 ? Math.round((checkedIds.length / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Inventário de Campo</span>
              <span aria-hidden="true">·</span>
              <span>Os 10 Essenciais da Sobrevivência</span>
              <span aria-hidden="true">·</span>
              <span>Salvo Automaticamente Offline</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-stone-100 font-display">
              Checklist da Mochila de Sobrevivência
            </h2>
            <p className="mt-2 text-sm text-stone-300 max-w-2xl">
              Marque os itens que você possui com você agora no acampamento ou trilha para avaliar seu índice de prontidão para emergências.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Lista Padrão</span>
            </button>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="mt-6 pt-6 border-t border-stone-800">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>Índice de Prontidão da Mochila:</span>
            <span className="font-mono font-bold text-stone-100 tabular-nums">
              {checkedIds.length} de {items.length} itens ({readinessPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                readinessPercent >= 80
                  ? 'bg-emerald-500'
                  : readinessPercent >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Add Item Form */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Segmented Controls */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'todos', label: 'Todos os Itens' },
              { id: 'essenciais', label: 'Essenciais' },
              { id: 'agua', label: 'Água' },
              { id: 'abrigo', label: 'Abrigo' },
              { id: 'fogo', label: 'Fogo' },
              { id: 'sinalizacao', label: 'Sinalização' },
              { id: 'saude', label: 'Saúde' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-stone-800 text-stone-100 border border-stone-700'
                    : 'bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Add custom item */}
          <form onSubmit={handleAddItem} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Adicionar item customizado..."
              className="px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </form>
        </div>

        {/* List of items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {filteredItems.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-stone-950/80 border-emerald-500/40 text-stone-200'
                    : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-stone-700 bg-stone-900'
                  }`}
                >
                  {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        isChecked ? 'line-through text-stone-400' : 'text-stone-100'
                      }`}
                    >
                      {item.name}
                    </p>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        item.importance === 'critico'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">{item.tip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
