import React, { useState, useEffect } from 'react';
import { Compass as CompassIcon, Sun, Moon, AlertCircle, Lock, RotateCcw } from 'lucide-react';

export const CompassOrientation: React.FC = () => {
  const [heading, setHeading] = useState<number>(0);
  const [targetBearing, setTargetBearing] = useState<number | null>(null);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [sensorError, setSensorError] = useState<string | null>(null);

  // Compass cardinal name
  const getCardinal = (deg: number) => {
    const cardinals = [
      { name: 'Norte (N)', range: [337.5, 360] },
      { name: 'Norte (N)', range: [0, 22.5] },
      { name: 'Nordeste (NE)', range: [22.5, 67.5] },
      { name: 'Leste (L)', range: [67.5, 112.5] },
      { name: 'Sudeste (SE)', range: [112.5, 157.5] },
      { name: 'Sul (S)', range: [157.5, 202.5] },
      { name: 'Sudoeste (SO)', range: [202.5, 247.5] },
      { name: 'Oeste (O)', range: [247.5, 292.5] },
      { name: 'Noroeste (NO)', range: [292.5, 337.5] },
    ];
    const match = cardinals.find((c) => deg >= c.range[0] && deg < c.range[1]);
    return match ? match.name : 'Norte (N)';
  };

  // Device orientation listener
  const requestSensor = async () => {
    if (typeof window === 'undefined') return;

    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          attachListener();
        } else {
          setSensorError('Permissão para sensor de orientação negada. Use o controle manual.');
        }
      } catch (e: any) {
        setSensorError('Sensor não acessível neste navegador. Use o ajuste manual.');
      }
    } else if (typeof window !== 'undefined' && 'ondeviceorientationabsolute' in (window as any)) {
      (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
      setSensorActive(true);
    } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in (window as any)) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setSensorActive(true);
    } else {
      setSensorError('Sensor de orientação não suportado no dispositivo. Use o ajuste manual.');
    }
  };

  const attachListener = () => {
    window.addEventListener('deviceorientation', handleOrientation, true);
    setSensorActive(true);
    setSensorError(null);
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    let alpha = e.alpha;
    if ((e as any).webkitCompassHeading) {
      alpha = (e as any).webkitCompassHeading;
    }
    if (alpha !== null && alpha !== undefined) {
      setHeading(Math.round(alpha));
      setSensorActive(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  // Calculate deviation from target bearing
  const getDeviation = () => {
    if (targetBearing === null) return null;
    let diff = (heading - targetBearing + 180) % 360 - 180;
    return Math.round(diff);
  };

  const deviation = getDeviation();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Orientação de Campo</span>
              <span aria-hidden="true">·</span>
              <span>Bússola Digital e Solar</span>
              <span aria-hidden="true">·</span>
              <span>Prevenção de Espiral</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-stone-100 font-display">
              Bússola e Navegação Selvagem
            </h2>
            <p className="mt-2 text-sm text-stone-300 max-w-2xl">
              Na mata fechada, todos os lados parecem idênticos. O cérebro humano sem bússola caminha invariavelmente em círculos de 1 a 2 km devido à passada assimétrica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!sensorActive && (
              <button
                onClick={requestSensor}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <CompassIcon className="w-4 h-4" />
                <span>Ativar Sensor do Celular</span>
              </button>
            )}
          </div>
        </div>

        {sensorError && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{sensorError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Compass Visual & Azimuth Lock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Compass Dial */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 select-none">
            {/* Outer Rose Dial */}
            <div
              className="absolute inset-0 rounded-full border-4 border-stone-800 bg-stone-950 flex items-center justify-center shadow-2xl transition-transform duration-200"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              {/* Dial Marks */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-full h-full flex flex-col items-center justify-between py-2 text-[10px] font-mono text-stone-500"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span className={deg === 0 ? 'text-red-500 font-bold text-xs' : deg % 90 === 0 ? 'text-stone-300 font-semibold' : ''}>
                    {deg === 0 ? 'N' : deg === 90 ? 'L' : deg === 180 ? 'S' : deg === 270 ? 'O' : `${deg}°`}
                  </span>
                  <div className="w-0.5 h-2 bg-stone-800" />
                </div>
              ))}

              {/* Target Bearing Marker if set */}
              {targetBearing !== null && (
                <div
                  className="absolute w-full h-full flex flex-col items-center justify-start pt-1"
                  style={{ transform: `rotate(${targetBearing}deg)` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                </div>
              )}
            </div>

            {/* Fixed Central Needle pointing UP */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* North Needle */}
              <div className="w-2 h-20 bg-gradient-to-t from-red-600 to-red-400 rounded-t-full shadow-md -mb-1" />
              {/* Center Pivot */}
              <div className="w-5 h-5 rounded-full bg-stone-100 border-2 border-stone-900 z-10 shadow-lg" />
              {/* South Needle */}
              <div className="w-2 h-20 bg-gradient-to-b from-stone-600 to-stone-400 rounded-b-full shadow-md -mt-1" />
            </div>

            {/* Fixed top heading indicator notch */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-400" />
          </div>

          {/* Heading Readout */}
          <div className="text-center mt-2">
            <div className="font-mono text-4xl font-extrabold text-stone-100 tabular-nums">
              {heading}°
            </div>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5">
              {getCardinal(heading)}
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {sensorActive ? 'Orientação em tempo real via sensor' : 'Ajuste manual (gire o seletor abaixo)'}
            </div>
          </div>

          {/* Manual Heading Slider */}
          <div className="w-full max-w-sm mt-5">
            <input
              type="range"
              min="0"
              max="359"
              value={heading}
              onChange={(e) => {
                setSensorActive(false);
                setHeading(parseInt(e.target.value, 10));
              }}
              className="w-full accent-emerald-500 bg-stone-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1">
              <span>0° (N)</span>
              <span>90° (L)</span>
              <span>180° (S)</span>
              <span>270° (O)</span>
              <span>359°</span>
            </div>
          </div>
        </div>

        {/* Azimuth Bearing Lock & Straight Line Rule */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-100">
                  Fixar Rumo (Azimute de Fuga)
                </h3>
                <p className="text-xs text-stone-400">Trave uma direção para não andar em círculos</p>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-stone-950/70 border border-stone-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">Rumo Alvo Travado:</span>
                <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                  {targetBearing !== null ? `${targetBearing}° (${getCardinal(targetBearing)})` : 'Nenhum'}
                </span>
              </div>

              {targetBearing !== null && deviation !== null && (
                <div className="mt-3 pt-3 border-t border-stone-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Desvio Atual:</span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        Math.abs(deviation) <= 5
                          ? 'text-emerald-400'
                          : Math.abs(deviation) <= 20
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {deviation === 0
                        ? 'No Rumo Correto'
                        : deviation > 0
                        ? `Gire ${Math.abs(deviation)}° para Esquerda`
                        : `Gire ${Math.abs(deviation)}° para Direita`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTargetBearing(heading)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Travar Rumo Atual ({heading}°)</span>
              </button>

              {targetBearing !== null && (
                <button
                  onClick={() => setTargetBearing(null)}
                  className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center justify-center transition-colors"
                  title="Remover Rumo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-semibold text-stone-200">
                A Técnica dos 3 Pontos de Alinhamento:
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Olhe na direção do azimute travado e escolha 3 árvores visíveis em linha reta: uma próxima, uma média e uma distante. Caminhe até a primeira sem olhar para os pés. Ao chegar nela, alinhe uma nova árvore no horizonte. Isso garante avanço em linha reta perfeita.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Orientation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method 1: Sombra da Vareta */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-100">
                Método da Sombra da Vareta (Dia)
              </h3>
              <p className="text-xs text-stone-400">Precisão de 95% sem bússola eletrônica</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-300">
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-amber-400 mr-1.5">Passo 1:</span>
              Finque uma vareta reta de 1 metro no chão plano e desobstruído. Coloque uma pedrinha na ponta exata da sombra projetada no chão (Ponto 1 = Oeste).
            </div>

            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-amber-400 mr-1.5">Passo 2:</span>
              Aguarde de 15 a 20 minutos. Conforme o sol se move no céu, a sombra se deslocará. Coloque outra pedra na nova ponta da sombra (Ponto 2 = Leste).
            </div>

            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-amber-400 mr-1.5">Passo 3:</span>
              Trace uma linha reta no chão unindo a Pedra 1 à Pedra 2. Essa linha é o eixo Oeste-Leste.
            </div>

            <p className="text-[11px] text-stone-400 italic">
              Posicione o pé esquerdo na Pedra 1 e o pé direito na Pedra 2: você estará olhando exatamente para o <strong>Norte</strong>.
            </p>
          </div>
        </div>

        {/* Method 2: Cruzeiro do Sul */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-100">
                Constelação do Cruzeiro do Sul (Noite)
              </h3>
              <p className="text-xs text-stone-400">Orientação estelar para o Hemisfério Sul</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-300">
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-indigo-400 mr-1.5">Passo 1:</span>
              Localize no céu as quatro estrelas que formam a cruz característica do Cruzeiro do Sul, auxiliado pelas duas estrelas apontadoras (Alfa e Beta do Centauro).
            </div>

            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-indigo-400 mr-1.5">Passo 2:</span>
              Prolongue mentalmente o braço maior da cruz (da estrela superior até a estrela do pé) por <strong>4,5 vezes</strong> o seu tamanho.
            </div>

            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="font-bold text-indigo-400 mr-1.5">Passo 3:</span>
              Desça uma linha vertical reta imaginária desse ponto até a linha do horizonte. O ponto de contato na terra é o <strong>Sul Geográfico</strong>.
            </div>

            <p className="text-[11px] text-stone-400 italic">
              De costas para o Sul, você terá o Norte à sua frente, o Leste à sua direita e o Oeste à sua esquerda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
