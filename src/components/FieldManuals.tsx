import React, { useState } from 'react';
import { MANUAL_SECTIONS } from '../data/survivalData';
import { Droplets, Tent, Flame, Apple, ShieldAlert, Check, X, AlertTriangle, Lightbulb, Search } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Droplets: <Droplets className="w-5 h-5 text-sky-400" />,
  Tent: <Tent className="w-5 h-5 text-amber-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
  Apple: <Apple className="w-5 h-5 text-emerald-400" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-red-400" />,
};

export const FieldManuals: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('agua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentSection = MANUAL_SECTIONS.find((s) => s.id === selectedSectionId) || MANUAL_SECTIONS[0];

  const filteredSections = MANUAL_SECTIONS.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.subtitle.toLowerCase().includes(term) ||
      s.steps.some((st) => st.title.toLowerCase().includes(term) || st.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Manuais Técnicos</span>
              <span aria-hidden="true">·</span>
              <span>Procedimentos Ilustrados de Sobrevivência</span>
              <span aria-hidden="true">·</span>
              <span>Instruções Passo a Passo</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-stone-100 font-display">
              Manuais Práticos de Campo
            </h2>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar em todos os manuais..."
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section Tabs (Segmented Control) */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-stone-800">
          {filteredSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                selectedSectionId === sec.id
                  ? 'bg-stone-800 text-stone-100 border border-stone-700 shadow-sm'
                  : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              {ICONS[sec.iconName]}
              <span>{sec.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Content Display */}
      <div className="space-y-6">
        {/* Section Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900">
          {currentSection.heroImage && (
            <div className="h-48 sm:h-56 w-full relative">
              <img
                src={currentSection.heroImage}
                alt={currentSection.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <span>Guia Oficial de Sobrevivência</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentSection.title}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
                  {currentSection.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
                  {currentSection.subtitle}
                </p>
              </div>
            </div>
          )}

          {/* Golden Rule Highlight */}
          <div className="p-4 bg-amber-500/10 border-t border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Regra de Ouro deste Módulo:
              </span>
              <p className="text-xs text-amber-200/90 mt-0.5 font-medium">
                {currentSection.keyRule}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Practical Instructions */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider font-mono">
            Procedimentos Detalhados de Ação
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSection.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between"
              >
                <div>
                  <h5 className="text-sm font-bold text-stone-100 font-display">
                    {step.title}
                  </h5>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-2">
                  {step.tip && (
                    <div className="flex items-start gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{step.tip}</span>
                    </div>
                  )}

                  {step.warning && (
                    <div className="flex items-start gap-2 text-[11px] text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{step.warning}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Do's and Don'ts Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do List */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                Condutas Corretas (O que FAZER)
              </h4>
            </div>

            <ul className="space-y-3">
              {currentSection.doList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don't List */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wide">
                Erros Fatais (O que NUNCA fazer)
              </h4>
            </div>

            <ul className="space-y-3">
              {currentSection.dontList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
