import React from 'react';
import { Compass, ShieldAlert, Radio, BookOpen, BrainCircuit, CheckSquare, Sparkles } from 'lucide-react';
import { TabType } from '../types/survival';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickSos: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenQuickSos }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-900/40 bg-[#070d1e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActiveTab('emergency')}
          className="text-left flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 transition-colors">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display">
              Selva<span className="text-emerald-400">Viva</span>
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-blue-900/50 text-white border border-blue-700/50'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Protocolo STOP</span>
          </button>

          <button
            onClick={() => setActiveTab('compass')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compass'
                ? 'bg-blue-900/50 text-white border border-blue-700/50'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bússola & Sol</span>
          </button>

          <button
            onClick={() => setActiveTab('signaling')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'signaling'
                ? 'bg-blue-900/50 text-white border border-blue-700/50'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Sinalizador SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('manuals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manuals'
                ? 'bg-blue-900/50 text-white border border-blue-700/50'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Manuais de Campo</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-blue-900/50 text-white border border-blue-700/50'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulador</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-blue-900/50 text-white border border-blue-700/50'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Mochila</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Especialista IA</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuickSos}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>SOS Rápido</span>
          </button>
        </div>
      </div>
    </header>
  );
};
