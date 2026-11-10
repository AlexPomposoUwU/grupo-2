import React, { useState } from 'react';
import { SCENARIO_QUESTIONS } from '../data/survivalData';
import { BrainCircuit, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';

export const SurvivalSimulator: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const question = SCENARIO_QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const option = question.options[idx];
    if (option.isCorrect) {
      setScore((prev) => prev + option.points);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < SCENARIO_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Treinamento de Tomada de Decisão</span>
              <span aria-hidden="true">·</span>
              <span>Cenários de Risco Real</span>
              <span aria-hidden="true">·</span>
              <span>Avaliação de Sobrevivência</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-stone-100 font-display">
              Simulador de Decisão na Floresta
            </h2>
            <p className="mt-2 text-sm text-stone-300 max-w-2xl">
              Em situações reais de sobrevivência, erros por precipitação ou falta de informação custam vidas. Teste suas escolhas sob pressão controlada.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-emerald-400">
              Pontuação: <span className="font-bold tabular-nums">{score}</span> / 100
            </div>
          </div>
        </div>
      </div>

      {!completed ? (
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>Cenário {currentIdx + 1} de {SCENARIO_QUESTIONS.length}</span>
            <span className="font-mono tabular-nums">{Math.round(((currentIdx + 1) / SCENARIO_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / SCENARIO_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wide">
              {question.context}
            </span>
            <h3 className="mt-2 text-lg sm:text-xl font-bold text-stone-100 font-display">
              {question.situation}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              let btnStyle = 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-200';

              if (hasAnswered) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200';
                } else if (isChosen) {
                  btnStyle = 'bg-red-950/30 border-red-500/60 text-red-200';
                } else {
                  btnStyle = 'opacity-40 border-stone-800 bg-stone-950/40 text-stone-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-stone-800 shrink-0 flex items-center justify-center font-mono text-xs font-bold text-stone-300 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <p>{opt.text}</p>
                    {hasAnswered && (isChosen || opt.isCorrect) && (
                      <div className="mt-2.5 pt-2 border-t border-stone-700/50 text-xs">
                        <span className="font-semibold block mb-0.5">
                          {opt.isCorrect ? 'Decisão Correta:' : 'Risco Fatal:'}
                        </span>
                        <p className={opt.isCorrect ? 'text-emerald-300' : 'text-red-300'}>
                          {opt.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  {hasAnswered && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {hasAnswered && isChosen && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {hasAnswered && (
            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <span>{currentIdx + 1 === SCENARIO_QUESTIONS.length ? 'Ver Resultado Final' : 'Próximo Cenário'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completed Screen */
        <div className="p-8 rounded-2xl bg-stone-900 border border-stone-800 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs text-stone-400 uppercase tracking-widest font-mono">
              Resultado do Treinamento
            </span>
            <h3 className="text-3xl font-bold text-stone-100 font-display mt-1">
              {score >= 90
                ? 'Mestre dos Bosques (Sobrevivente de Elite)'
                : score >= 70
                ? 'Explorador Prudente'
                : score >= 50
                ? 'Aprendiz da Floresta'
                : 'Alerta Vermelho - Alto Risco'}
            </h3>
            <div className="mt-3 font-mono text-4xl font-extrabold text-emerald-400 tabular-nums">
              {score} <span className="text-xl text-stone-500">/ 100 pts</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {score >= 90
              ? 'Você tomou as decisões mais seguras de sobrevivência: priorizou controle de pânico, abrigo oportuno, purificação estrita de água e calma frente a animais e sinalização aérea.'
              : score >= 70
              ? 'Boa capacidade de julgamento. Lembre-se sempre de que mitos populares (como torniquetes para cobras ou beber água sem ferver) podem ser fatais.'
              : 'Você cometeu erros que comprometeriam sua sobrevivência. Revise os Manuais de Campo antes de qualquer incursão em florestas remotas.'}
          </p>

          <div className="pt-4 border-t border-stone-800 flex justify-center">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refazer o Simulador</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
