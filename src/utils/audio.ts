/**
 * Procedural Bionetic Ambient Synthesizer
 * Synthesizes organic forest sounds (subterranean earth hums, leaf breathing LFOs) using the Web Audio API.
 */
export class BioneticSynth {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;

  constructor() {}

  start() {
    try {
      // Initialize AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Main Gain Node for output level controlling
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      
      // Smooth fade-in to prevent clicks
      this.gainNode.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2);

      // Lowpass filter to give a deep subterranean resonance
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
      this.filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // Low frequency fundamental oscillator (Sine)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = "sine";
      this.osc1.frequency.setValueAtTime(65.4, this.ctx.currentTime); // C2 fundamental frequency

      // Organic harmonic wave (Triangle) - creates a lovely warm wooden timber
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = "triangle";
      this.osc2.frequency.setValueAtTime(78.4, this.ctx.currentTime); // Eb2 minor third blending

      // Ultra slow LFO representing the breathing rhythm of plants/leaves
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 1 breathing cycle every ~12 seconds

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(45, this.ctx.currentTime); // Modulates filter by 45Hz

      // Connections
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);

      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      // Boot oscillators
      this.osc1.start(0);
      this.osc2.start(0);
      this.lfo.start(0);
    } catch (err) {
      console.warn("Failed to initialize bionetic synthesizer or Web Audio blocked:", err);
    }
  }

  /**
   * Dynamically modulate sound qualities based on tree statistics (photosynthesis percentage)
   */
  modulate(photosynthesisPercent: number) {
    if (!this.ctx || !this.filter || !this.osc1 || !this.osc2) return;

    // Map photosynthesis (0-100) to frequency levels
    // Brighter, slightly higher pitched singing sound for active photosynthesis
    const baseFreq = 65.4 + (photosynthesisPercent - 80) * 0.12; // C2 pitch shift
    const harmonicFreq = baseFreq * 1.25; // Warm major-third correlation
    const filterCutoff = 110 + (photosynthesisPercent / 100) * 90; // Let higher wind timber filter through

    const now = this.ctx.currentTime;
    this.osc1.frequency.exponentialRampToValueAtTime(baseFreq, now + 1.2);
    this.osc2.frequency.exponentialRampToValueAtTime(harmonicFreq, now + 1.2);
    this.filter.frequency.exponentialRampToValueAtTime(filterCutoff, now + 1.2);
  }

  stop() {
    try {
      if (this.gainNode && this.ctx) {
        const now = this.ctx.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        
        // Soft smooth fade-out
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        const osc1Ref = this.osc1;
        const osc2Ref = this.osc2;
        const lfoRef = this.lfo;
        const ctxRef = this.ctx;

        setTimeout(() => {
          try {
            osc1Ref?.stop();
            osc2Ref?.stop();
            lfoRef?.stop();
            ctxRef?.close();
          } catch (e) {
            // Ignore if already closed
          }
        }, 1600);

        this.ctx = null;
        this.osc1 = null;
        this.osc2 = null;
        this.lfo = null;
        this.gainNode = null;
        this.filter = null;
      }
    } catch (err) {
      console.error("Error gracefully closing bionetic synthesizer:", err);
    }
  }
}
