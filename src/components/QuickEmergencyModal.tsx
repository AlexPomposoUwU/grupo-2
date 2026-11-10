import React from 'react';
import { ShieldAlert, X, Volume2, Sun, PhoneCall, AlertTriangle, Compass } from 'lucide-react';

interface QuickEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSignaling: () => void;
  onGoToCompass: () => void;
}

export const QuickEmergencyModal: React.FC<QuickEmergencyModalProps> = ({
  isOpen,
  onClose,
  onGoToSignaling,
  onGoToCompass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-red-500/30 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-display">
                Protocolo de Emergência Imediato
              </h3>
              <p className="text-xs text-stone-400">Ações críticas para salvar vidas agora</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Step Card */}
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-400 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4" />
            <span>Mantenha a Calma: Não se Desloque no Escuro</span>
          </div>
          <p className="leading-relaxed">
            Se a noite estiver caindo ou você não sabe seu rumo com 100% de certeza, <strong>PARE</strong>. Em 90% das buscas, quem fica no mesmo lugar é resgatado rapidamente; quem caminha sem rumo se afasta dezenas de quilômetros das equipes de resgate.
          </p>
        </div>

        {/* Fast Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              onGoToSignaling();
            }}
            className="p-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex flex-col items-center justify-center gap-2 text-center transition-colors shadow-lg shadow-red-950/50"
          >
            <Volume2 className="w-5 h-5" />
            <span>Ativar Sinalizador e Apito SOS</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToCompass();
            }}
            className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold flex flex-col items-center justify-center gap-2 text-center transition-colors"
          >
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Abrir Bússola e Azimute</span>
          </button>
        </div>

        {/* Telecommunication Advice */}
        <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 text-xs space-y-2 text-stone-300">
          <div className="flex items-center gap-2 font-semibold text-stone-200">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Telefonia em Áreas Remotas:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-400">
            Mesmo que o seu chip indique <em>"Sem Serviço"</em>, disque <strong>193 (Bombeiros)</strong> ou <strong>112</strong>. Por regulamentação internacional, aparelhos celulares utilizam a antena de qualquer operadora que tenha o mínimo sinal no local para completar ligações de emergência.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
        >
          Fechar Painel Rápido
        </button>
      </div>
    </div>
  );
};
