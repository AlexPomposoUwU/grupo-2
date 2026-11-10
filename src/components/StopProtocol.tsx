import React, { useState, useEffect } from 'react';
import { ShieldAlert, Wind, Sun, Clock, CheckCircle2, AlertTriangle, Play, Pause } from 'lucide-react';
import { HERO_IMAGE } from '../data/survivalData';

export const StopProtocol: React.FC = () => {
  // Breathing Pacer State (Box Breathing 4-4-4-4)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inspire' | 'segure1' | 'expire' | 'segure2'>('inspire');
  const [breathTimer, setBreathTimer] = useState(4);

  // Sun Finger Calculator State (1 to 16 fingers)
  const [fingerCount, setFingerCount] = useState<number>(4);

  useEffect(() => {
    if (!breathingActive) {
      setBreathTimer(4);
      setBreathPhase('inspire');
      return;
    }

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          setBreathPhase((currentPhase) => {
            if (currentPhase === 'inspire') return 'segure1';
            if (currentPhase === 'segure1') return 'expire';
            if (currentPhase === 'expire') return 'segure2';
            return 'inspire';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inspire':
        return { title: 'Inspire pelo Nariz', instruction: 'Encha o abdômen lentamente com ar' };
      case 'segure1':
        return { title: 'Segure os Pulmões Cheios', instruction: 'Mantenha o ar com calma' };
      case 'expire':
        return { title: 'Expire Suavemente pela Boca', instruction: 'Solte todo o ar esvaziando o peito' };
      case 'segure2':
        return { title: 'Segure os Pulmões Vazios', instruction: 'Relaxe os ombros e a mandíbula' };
    }
  };

  const calculatedMinutes = fingerCount * 15;
  const hours = Math.floor(calculatedMinutes / 60);
  const minutes = calculatedMinutes % 60;

  return (
    <div className="space-y-6">
      {/* Hero Banner with Authentic Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900">
        <div className="h-64 sm:h-72 w-full relative">
          <img
            src={HERO_IMAGE}
            alt="Floresta densa com trilha e raios solares"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/20" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span>Protocolo Prioritário</span>
              <span aria-hidden="true">·</span>
              <span>Primeiras Ações ao Notar que está Perdido</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display text-balance">
              Protocolo STOP: Como Agir na Floresta
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
              O maior perigo na mata não são os animais, mas o pânico inicial. Pessoas em pânico correm sem rumo, se desidratam e sofrem quedas graves. Pare agora e siga o método.
            </p>
          </div>
        </div>
      </div>

      {/* The 4 Letters of STOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* S */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-display font-extrabold text-xl">
                S
              </span>
              <span className="text-[11px] font-mono text-stone-500">Passo 1</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-stone-100 font-display">
              Stop (Pare)
            </h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Sente-se imediatamente em um tronco ou pedra seca. Não dê mais nenhum passo aleatório. Desacelere sua frequência cardíaca antes de tomar qualquer atitude.
            </p>
          </div>
        </div>

        {/* T */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-display font-extrabold text-xl">
                T
              </span>
              <span className="text-[11px] font-mono text-stone-500">Passo 2</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-stone-100 font-display">
              Think (Pense)
            </h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Qual foi a última referência clara? Há quanto tempo você anda? Você tem lesões? Alguém sabe onde você pretendia ir? Mantenha a cabeça fria.
            </p>
          </div>
        </div>

        {/* O */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-display font-extrabold text-xl">
                O
              </span>
              <span className="text-[11px] font-mono text-stone-500">Passo 3</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-stone-100 font-display">
              Observe (Observe)
            </h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Olhe ao redor: onde há solo seco e elevado para abrigo? Ouça ruído de água corrente. Verifique o sol e calcule quantas horas de luz restam.
            </p>
          </div>
        </div>

        {/* P */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-display font-extrabold text-xl">
                P
              </span>
              <span className="text-[11px] font-mono text-stone-500">Passo 4</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-stone-100 font-display">
              Plan (Planeje)
            </h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Decida: Ficar parado e preparar acampamento de espera (90% dos casos é o correto) ou deslocar-se apenas se houver perigo imediato iminente.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tool 1: Anti-Panic Breathing Guide & Tool 2: Sun Finger Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anti-Panic Box Breathing Pacer */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-100">
                    Controle de Pânico: Respiração Tática 4x4
                  </h3>
                  <p className="text-xs text-stone-400">Restaura a calma e reduz adrenalina em 2 minutos</p>
                </div>
              </div>
            </div>

            {/* Interactive breathing circle */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div
                className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                  !breathingActive
                    ? 'border-2 border-stone-700 bg-stone-950/40'
                    : breathPhase === 'inspire'
                    ? 'scale-110 border-4 border-teal-400 bg-teal-950/40 shadow-lg shadow-teal-900/40'
                    : breathPhase === 'expire'
                    ? 'scale-90 border-4 border-emerald-500 bg-stone-950 shadow-inner'
                    : 'scale-100 border-4 border-amber-400 bg-amber-950/20'
                }`}
              >
                <span className="font-mono text-3xl font-extrabold text-stone-100 tabular-nums">
                  {breathingActive ? breathTimer : '4s'}
                </span>
                <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider mt-1">
                  {breathingActive ? breathPhase : 'Pronto'}
                </span>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-stone-200">
                  {breathingActive ? getPhaseText().title : 'Clique em Iniciar para calibrar o ritmo'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {breathingActive ? getPhaseText().instruction : 'Técnica utilizada por equipes de operações especiais para clareza mental'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800">
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                breathingActive
                  ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
              }`}
            >
              {breathingActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar Respiração</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar Ciclo Respiratório</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sun Finger Horizon Calculator */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-100">
                  Calculadora dos Dedos até o Pôr do Sol
                </h3>
                <p className="text-xs text-stone-400">Estime a luz solar restante sem relógio</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-300 leading-relaxed">
              Estique totalmente o braço com a mão espalmada na horizontal. Conte quantos dedos cabem entre a base do sol e a linha do horizonte:
            </p>

            {/* Finger visual counter */}
            <div className="mt-4 p-4 rounded-xl bg-stone-950/70 border border-stone-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">Dedos medidos:</span>
                <span className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                  {fingerCount} {fingerCount === 1 ? 'dedo' : 'dedos'}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="16"
                value={fingerCount}
                onChange={(e) => setFingerCount(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 bg-stone-800 rounded-lg h-2 mt-3 cursor-pointer"
              />

              <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-400">Tempo estimado de luz:</span>
                <span className="font-mono text-sm font-bold text-stone-100 tabular-nums">
                  {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}min` : ''} restantes
                </span>
              </div>
            </div>

            {/* Strategic Advice based on remaining sun */}
            <div className="mt-4 p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs">
              <span className="font-bold text-stone-200">Recomendação de Campo: </span>
              {fingerCount <= 4 ? (
                <span className="text-red-400 font-semibold">
                  Alerta Crítico: Menos de 1 hora de sol! Pare de caminhar e monte a cama de isolamento do abrigo imediatamente antes do anoitecer completo.
                </span>
              ) : fingerCount <= 8 ? (
                <span className="text-amber-300">
                  Atenção: Cerca de 1 a 2 horas de luz. Colete lenha grossa para a noite e termine a armação do abrigo.
                </span>
              ) : (
                <span className="text-emerald-400">
                  Tempo Seguro: Mais de 2 horas de luz. Procure fonte de água de nascente e avalie o melhor terreno para o acampamento de sobrevivência.
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-500">
            Regra mnemônica: 1 dedo = ~15 minutos. 4 dedos (1 mão) = ~1 hora exata de deslocamento solar.
          </div>
        </div>
      </div>

      {/* The Rule of 3s in Survival */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <h3 className="text-base font-semibold text-stone-100">
          A "Regra dos 3" da Sobrevivência
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Define matematicamente onde você deve investir sua energia nos primeiros momentos:
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-stone-950/60 border border-red-500/20">
            <span className="text-2xl font-mono font-bold text-red-400">3 Minutos</span>
            <h4 className="mt-1 text-xs font-bold text-stone-200">Sem Oxigênio ou em Pânico</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              O pânico consome oxigênio e gera decisões fatais em minutos. Respire e sente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-amber-500/20">
            <span className="text-2xl font-mono font-bold text-amber-400">3 Horas</span>
            <h4 className="mt-1 text-xs font-bold text-stone-200">Sem Abrigo em Clima Severo</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              Chuva e vento baixam a temperatura do sangue levando à hipotermia letal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-sky-500/20">
            <span className="text-2xl font-mono font-bold text-sky-400">3 Dias</span>
            <h4 className="mt-1 text-xs font-bold text-stone-200">Sem Água Potável</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              O sangue engrossa, rins falham e surgem delírios. Priorize água antes de comida.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-emerald-500/20">
            <span className="text-2xl font-mono font-bold text-emerald-400">3 Semanas</span>
            <h4 className="mt-1 text-xs font-bold text-stone-200">Sem Alimento Sólido</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              O corpo consome reservas de gordura. Não arrisque ingerir plantas desconhecidas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
