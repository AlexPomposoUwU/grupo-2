import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sun, AlertTriangle, Play, Square, Eye, Zap } from 'lucide-react';

const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/',
};

export const SosSignaling: React.FC = () => {
  // Flash / Screen Strobe States
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [strobeMode, setStrobeMode] = useState<'sos' | 'fast' | 'torch'>('sos');
  const [isFlashWhite, setIsFlashWhite] = useState(false);

  // Audio Whistle States
  const [isWhistleLooping, setIsWhistleLooping] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const whistleTimeoutRef = useRef<number | null>(null);

  // Morse Code Messenger
  const [morseText, setMorseText] = useState('SOS');
  const [isTransmittingMorse, setIsTransmittingMorse] = useState(false);
  const [currentMorseChar, setCurrentMorseChar] = useState<string>('');

  // Audio initialization
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (durationMs: number, freq = 3000): Promise<void> => {
    return new Promise((resolve) => {
      try {
        initAudio();
        if (!audioCtxRef.current) return resolve();
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Anti-click attack and decay
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000) - 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);

        setTimeout(resolve, durationMs);
      } catch (err) {
        console.warn('Audio play tone error', err);
        resolve();
      }
    });
  };

  // Continuous manual whistle
  const startManualWhistle = () => {
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(3000, ctx.currentTime);
      gain.gain.setValueAtTime(0.8, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.warn('Whistle manual error', e);
    }
  };

  const stopManualWhistle = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    } catch (e) {
      // Ignored
    }
  };

  // Automated 3-blast distress whistle loop
  useEffect(() => {
    let active = isWhistleLooping;
    const runWhistleLoop = async () => {
      while (active) {
        // 3 blasts of 1 second with 1s gap
        for (let i = 0; i < 3 && active; i++) {
          await playTone(1000, 3000);
          if (!active) break;
          await new Promise((r) => setTimeout(r, 1000));
        }
        // 3 seconds pause between 3-blast groups
        if (!active) break;
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    if (isWhistleLooping) {
      runWhistleLoop();
    }

    return () => {
      active = false;
      if (whistleTimeoutRef.current) clearTimeout(whistleTimeoutRef.current);
    };
  }, [isWhistleLooping]);

  // Screen Flasher / Strobe effect
  useEffect(() => {
    if (!isStrobeActive) {
      setIsFlashWhite(false);
      return;
    }

    let intervalId: any;
    if (strobeMode === 'torch') {
      setIsFlashWhite(true);
      return;
    }

    if (strobeMode === 'fast') {
      intervalId = setInterval(() => {
        setIsFlashWhite((prev) => !prev);
      }, 120);
    } else if (strobeMode === 'sos') {
      // Standard SOS: 3 dots (150ms), 3 dashes (450ms), 3 dots (150ms)
      const pattern = [
        150, 150, 150, 150, 150, 450, // S
        450, 150, 450, 150, 450, 450, // O
        150, 150, 150, 150, 150, 1200, // S + pause
      ];
      let stepIndex = 0;

      const tick = () => {
        const isWhite = stepIndex % 2 === 0;
        setIsFlashWhite(isWhite);
        const duration = pattern[stepIndex];
        stepIndex = (stepIndex + 1) % pattern.length;
        intervalId = setTimeout(tick, duration);
      };

      tick();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        clearTimeout(intervalId);
      }
      setIsFlashWhite(false);
    };
  }, [isStrobeActive, strobeMode]);

  // Convert text to morse representation
  const textToMorse = (text: string) => {
    return text
      .toUpperCase()
      .split('')
      .map((char) => MORSE_MAP[char] || '?')
      .join(' ');
  };

  // Transmit Morse Sequence
  const transmitMorse = async () => {
    if (isTransmittingMorse) return;
    setIsTransmittingMorse(true);
    initAudio();

    const morse = textToMorse(morseText);
    const DOT_MS = 150;
    const DASH_MS = 450;
    const SYMBOL_GAP = 120;
    const LETTER_GAP = 350;

    for (let i = 0; i < morse.length; i++) {
      const sym = morse[i];
      setCurrentMorseChar(sym);

      if (sym === '.') {
        setIsFlashWhite(true);
        await playTone(DOT_MS, 2600);
        setIsFlashWhite(false);
        await new Promise((r) => setTimeout(r, SYMBOL_GAP));
      } else if (sym === '-') {
        setIsFlashWhite(true);
        await playTone(DASH_MS, 2600);
        setIsFlashWhite(false);
        await new Promise((r) => setTimeout(r, SYMBOL_GAP));
      } else if (sym === ' ') {
        await new Promise((r) => setTimeout(r, LETTER_GAP));
      } else if (sym === '/') {
        await new Promise((r) => setTimeout(r, LETTER_GAP * 2));
      }
    }

    setCurrentMorseChar('');
    setIsFlashWhite(false);
    setIsTransmittingMorse(false);
  };

  return (
    <div className="space-y-6">
      {/* Fullscreen Overlay when Strobe is running */}
      {isStrobeActive && (
        <div
          onClick={() => setIsStrobeActive(false)}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 cursor-pointer select-none transition-colors duration-75 ${
            isFlashWhite ? 'bg-white text-stone-900' : 'bg-black text-white'
          }`}
        >
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 backdrop-blur rounded-full text-xs font-mono font-bold tracking-wider uppercase">
              {strobeMode === 'sos' ? 'Sinalizador SOS Ativo (... --- ...)' : strobeMode === 'fast' ? 'Estroboscópio Alta Frequência' : 'Modo Lanterna Máxima'}
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight font-display">
              {strobeMode === 'sos' ? 'S . O . S' : 'VISIBILIDADE MÁXIMA'}
            </p>
            <p className="mt-2 text-sm opacity-80">
              Aponte a tela para cima ou em direção a helicópteros e equipes de busca
            </p>
          </div>

          <div className="text-center pb-8">
            <button
              onClick={() => setIsStrobeActive(false)}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-sm shadow-xl hover:bg-red-700 active:scale-95 transition-transform"
            >
              Toque na tela para Interromper
            </button>
          </div>
        </div>
      )}

      {/* Hero Box for Signaling */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Busca e Salvamento</span>
              <span aria-hidden="true">·</span>
              <span>Sinais Internacionais</span>
              <span aria-hidden="true">·</span>
              <span>Alcance Óptico e Acústico</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-stone-100 font-display">
              Sinalizador SOS e Apito de Resgate
            </h2>
            <p className="mt-2 text-sm text-stone-300 max-w-2xl">
              Equipes de resgate procuram padrões artificiais de repetição em 3: três apitos, três sinais de luz ou três colunas de fumaça. Use os controles abaixo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStrobeMode('sos');
                setIsStrobeActive(true);
              }}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-red-950/40 active:scale-95 transition-transform"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Disparar SOS de Tela</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Apito de Frequência 3000Hz (Resgate Acústico) */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-100">
                    Apito Sonoro de Alta Penetração (3.000 Hz)
                  </h3>
                  <p className="text-xs text-stone-400">Frequência calibrada para cortar o ruído da mata e vento</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-300 space-y-1">
                  <p className="font-semibold text-stone-200">
                    Padrão Internacional de Busca e Salvamento:
                  </p>
                  <p>
                    3 apitos curtos e potentes seguidos de 3 segundos de silêncio para escutar a resposta dos socorristas. Repita a cada 2 minutos.
                  </p>
                </div>
              </div>
            </div>

            {/* Loop status */}
            <div className="mt-4 flex items-center justify-between text-xs text-stone-400 px-1">
              <span>Status do Transmissor Sonoro:</span>
              <span className={`font-semibold ${isWhistleLooping ? 'text-red-400 animate-pulse' : 'text-stone-500'}`}>
                {isWhistleLooping ? 'Transmitindo Padrão 3x3 SOS...' : 'Inativo'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-800/80 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsWhistleLooping(!isWhistleLooping)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isWhistleLooping
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                {isWhistleLooping ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>Parar Ciclo Automático</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-stone-200" />
                    <span>Ciclo Automático 3x3</span>
                  </>
                )}
              </button>

              <button
                onMouseDown={startManualWhistle}
                onMouseUp={stopManualWhistle}
                onTouchStart={startManualWhistle}
                onTouchEnd={stopManualWhistle}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 select-none shadow-md transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Segure p/ Apitar</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-stone-500">
              Dica: Ajuste o volume do aparelho para o máximo antes de emitir o sinal sonoro.
            </p>
          </div>
        </div>

        {/* Panel 2: Lanterna e Estroboscópio Óptico */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-100">
                  Sinalizador Visual de Tela
                </h3>
                <p className="text-xs text-stone-400">Sinalização de alta potência para busca noturna</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-300">
              Em noites escuras de mata fechada, uma tela de celular no brilho máximo pode ser vista por helicópteros a mais de 3 km de distância. Escolha o modo:
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setStrobeMode('sos');
                  setIsStrobeActive(true);
                }}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/50 text-left transition-colors"
              >
                <span className="block text-xs font-bold text-amber-400">SOS Morse</span>
                <span className="block text-[11px] text-stone-400 mt-1">... --- ...</span>
              </button>

              <button
                onClick={() => {
                  setStrobeMode('fast');
                  setIsStrobeActive(true);
                }}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/50 text-left transition-colors"
              >
                <span className="block text-xs font-bold text-amber-400">Estrobo Rápido</span>
                <span className="block text-[11px] text-stone-400 mt-1">Flashes 8Hz</span>
              </button>

              <button
                onClick={() => {
                  setStrobeMode('torch');
                  setIsStrobeActive(true);
                }}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/50 text-left transition-colors"
              >
                <span className="block text-xs font-bold text-amber-400">Lanterna Branca</span>
                <span className="block text-[11px] text-stone-400 mt-1">Luz contínua</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-800/80">
            <button
              onClick={() => {
                setStrobeMode('sos');
                setIsStrobeActive(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Abrir Sinalizador Visual em Tela Cheia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Morse Transmitter Section */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-stone-100">
              Transmissor de Código Morse de Campo
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Converte texto em impulsos sonoros e pulsos luminosos sincronizados
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {['SOS', 'SOCORRO', 'FERIDO', 'AGUA', 'AQUI'].map((preset) => (
              <button
                key={preset}
                onClick={() => setMorseText(preset)}
                className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${
                  morseText === preset
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <input
              type="text"
              value={morseText}
              onChange={(e) => setMorseText(e.target.value.toUpperCase())}
              placeholder="Digite a palavra para transmitir em Morse..."
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
              maxLength={20}
            />
          </div>

          <div>
            <button
              onClick={transmitMorse}
              disabled={isTransmittingMorse || !morseText.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {isTransmittingMorse ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Transmitindo...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Transmitir em Luz e Som</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Morse visual string */}
        <div className="mt-4 p-4 rounded-xl bg-stone-950/80 border border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>Sequência Morse:</span>
            <span className="font-mono text-stone-300">{morseText}</span>
          </div>
          <div className="font-mono text-lg text-amber-400 tracking-widest break-all">
            {textToMorse(morseText) || '... --- ...'}
          </div>
          {currentMorseChar && (
            <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span>Símbolo atual emitido:</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 rounded text-sm font-bold">
                {currentMorseChar}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ground-to-Air Emergency Signals Table */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <h3 className="text-base font-semibold text-stone-100">
          Sinais Solo-Ar para Aeronaves de Resgate
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Faça estes símbolos em clareiras usando troncos, pedras contrastantes ou roupas de cor viva (com no mínimo 3 metros de tamanho para visibilidade do alto).
        </p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center">
            <span className="text-3xl font-mono font-bold text-amber-400">V</span>
            <h4 className="mt-2 text-xs font-semibold text-stone-200">Preciso de Ajuda</h4>
            <p className="text-[11px] text-stone-400 mt-0.5">Require Assistance</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center">
            <span className="text-3xl font-mono font-bold text-red-400">X</span>
            <h4 className="mt-2 text-xs font-semibold text-stone-200">Socorro Médico Urgente</h4>
            <p className="text-[11px] text-stone-400 mt-0.5">Require Medical Aid</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center">
            <span className="text-3xl font-mono font-bold text-emerald-400">N</span>
            <h4 className="mt-2 text-xs font-semibold text-stone-200">Não / Negativo</h4>
            <p className="text-[11px] text-stone-400 mt-0.5">No / Negative</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center">
            <span className="text-3xl font-mono font-bold text-sky-400">Y</span>
            <h4 className="mt-2 text-xs font-semibold text-stone-200">Sim / Afirmativo</h4>
            <p className="text-[11px] text-stone-400 mt-0.5">Yes / Affirmative</p>
          </div>
        </div>
      </div>
    </div>
  );
};
