import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiSurvivalAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá, sobrevivente. Eu sou o Especialista de Campo em Sobrevivência na Selva e Salvamento (SAR). Como posso ajudar você agora? Se estiver em perigo imediato, lembre-se do protocolo STOP: pare, sente-se, respire fundo e mantenha a calma.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [context, setContext] = useState('Perdido ou em apuros na floresta');
  const [isLoading, setIsLoading] = useState(false);

  const PRESETS = [
    'O que fazer se encontrar uma onça ou felino grande na trilha?',
    'Como testar uma fruta ou folha desconhecida sem risco de intoxicação?',
    'Como manter uma linha reta se o céu estiver 100% encoberto por nuvens?',
    'Como coletar água pura de cipó-d’água e como identificar o cipó venenoso?',
    'O que fazer se um companheiro sofrer torção de tornozelo na mata fechada?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/survival-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, context }),
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Instruções recebidas.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ Atenção: Não foi possível conectar ao serviço de inteligência no momento. Consulte as seções offline do aplicativo (Protocolo STOP, Manuais de Campo, Bússola e Sinalizador SOS), que funcionam 100% sem conexão de internet.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Dark Blue surface matching the overall dark blue background */}
      <div className="p-6 rounded-2xl bg-[#0c1630] border border-blue-900/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400">
              <span>Orientação Especializada com Inteligência Artificial</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 2.5 Flash</span>
              <span aria-hidden="true">·</span>
              <span>Treinado com Doutrina SAR</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white font-display">
              Consultor de Sobrevivência na Selva
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Tire dúvidas específicas sobre fauna, flora, técnicas bushcraft, orientação sob neblina ou procedimentos de primeiros socorros em ambiente florestal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="px-3 py-2 bg-[#070d1e] border border-blue-900/60 rounded-xl text-sky-200 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="Perdido ou em apuros na floresta">Cenário: Em Apuros / Perdido</option>
              <option value="Planejando acampamento ou expedição">Cenário: Planejamento / Trilha</option>
              <option value="Emergência médica com companheiro ferido">Cenário: Primeiros Socorros Urgentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preset Questions Bar - Light Blue tinted */}
      <div className="p-4 rounded-xl bg-sky-100/90 border border-sky-300 shadow-sm">
        <span className="text-[11px] font-mono font-semibold text-sky-900 uppercase tracking-wide block mb-2">
          Dúvidas Frequentes de Sobreviventes:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-left px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white border border-sky-300/80 text-sky-950 text-xs transition-colors hover:text-sky-700 shadow-xs cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box - Styled in LIGHT BLUE as requested ("a parte do chat azul claro") */}
      <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 shadow-xl flex flex-col h-[520px]">
        {/* Chat Status Sub-bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-200 text-xs text-sky-900">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Canal Ativo com Especialista de Campo</span>
          </div>
          <span className="text-[11px] font-mono text-sky-700">Doutrina SAR &bushcraft</span>
        </div>

        {/* Scrollable conversation history */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white border border-sky-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-sky-900 text-xs">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-white border border-sky-200 shadow-sm">
                <span>O Especialista de Campo está analisando a situação e formulando orientações seguras...</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Input Box in Light Blue Chat Panel */}
        <div className="mt-4 pt-4 border-t border-sky-200 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte ao especialista (ex: como montar armadilha sem corda, como achar água)..."
            className="flex-1 px-4 py-2.5 bg-white border border-sky-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-500 shadow-xs"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-md shadow-sky-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
