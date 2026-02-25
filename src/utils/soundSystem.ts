// Retro Arcade Sound System using Web Audio API
// Generates all sounds programmatically - no external files needed!

export class SoundSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private sfxVolume: GainNode | null = null;
  private musicVolume: GainNode | null = null;
  private isMuted: boolean = false;
  private drillOscillator: OscillatorNode | null = null;
  private drillGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master volume control
      this.masterVolume = this.audioContext.createGain();
      this.masterVolume.gain.value = 0.5;
      this.masterVolume.connect(this.audioContext.destination);

      // SFX channel
      this.sfxVolume = this.audioContext.createGain();
      this.sfxVolume.gain.value = 0.6;
      this.sfxVolume.connect(this.masterVolume);

      // Music channel
      this.musicVolume = this.audioContext.createGain();
      this.musicVolume.gain.value = 0.3;
      this.musicVolume.connect(this.masterVolume);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  // Resume audio context (required for autoplay policy)
  public resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Toggle mute
  public toggleMute() {
    if (!this.masterVolume) return;
    this.isMuted = !this.isMuted;
    this.masterVolume.gain.value = this.isMuted ? 0 : 0.5;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // === DRILL SOUNDS ===
  public startDrill() {
    if (!this.audioContext || !this.sfxVolume || this.drillOscillator) return;
    this.resume();

    // Create continuous drilling sound
    this.drillOscillator = this.audioContext.createOscillator();
    this.drillGain = this.audioContext.createGain();
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    this.drillOscillator.type = 'sawtooth';
    this.drillOscillator.frequency.value = 80;
    
    this.drillGain.gain.value = 0;
    
    this.drillOscillator.connect(filter);
    filter.connect(this.drillGain);
    this.drillGain.connect(this.sfxVolume);
    
    this.drillOscillator.start();
    
    // Fade in
    this.drillGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.1);
    
    // Add vibrato
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 5;
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(this.drillOscillator.frequency);
    lfo.start();
  }

  public stopDrill() {
    if (!this.audioContext || !this.drillOscillator || !this.drillGain) return;
    
    // Fade out
    this.drillGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
    
    setTimeout(() => {
      if (this.drillOscillator) {
        this.drillOscillator.stop();
        this.drillOscillator.disconnect();
        this.drillOscillator = null;
      }
      if (this.drillGain) {
        this.drillGain.disconnect();
        this.drillGain = null;
      }
    }, 200);
  }

  // === BLOCK BREAK SOUND ===
  public playBlockBreak() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Noise burst for rock breaking
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 400;
    filter.Q.value = 2;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxVolume);
    
    noise.start(now);
    noise.stop(now + 0.1);
  }

  // === SPARK SOUND ===
  public playSpark() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // High pitched metallic spark
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 2000 + Math.random() * 1000;
    
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // === LAYER CHANGE SOUND ===
  public playLayerChange() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Descending tone
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 800;
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // === BUTTON CLICK ===
  public playClick() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 800;
    
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // === BUTTON HOVER ===
  public playHover() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 600;
    
    gain.gain.value = 0.05;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // === PAGE TRANSITION (Space key press) ===
  public playTransition() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Two-tone ascending sound
    [400, 600].forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.08;
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      osc.connect(gain);
      gain.connect(this.sfxVolume!);
      
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  // === SCORE COUNTING TICK ===
  public playScoreTick() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 1000 + Math.random() * 200; // Slight variation
    
    gain.gain.value = 0.06;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // === SCORE PICKUP (OIL COLLECT) ===
  public playScore() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // High pitched "Coin" sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 1200;
    osc.frequency.linearRampToValueAtTime(1800, now + 0.1); // Pitch up slightly
    
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Short decay
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // === LOADING DESCENT BGM ===
  private descentOscillator: OscillatorNode | null = null;
  private descentGain: GainNode | null = null;

  public startDescentBGM() {
    if (!this.audioContext || !this.musicVolume || this.descentOscillator) return;
    this.resume();

    // Create a continuous descending ominous drone
    this.descentOscillator = this.audioContext.createOscillator();
    this.descentGain = this.audioContext.createGain();
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;
    
    this.descentOscillator.type = 'sawtooth';
    this.descentOscillator.frequency.value = 110; // Low A
    
    this.descentGain.gain.value = 0;
    
    this.descentOscillator.connect(filter);
    filter.connect(this.descentGain);
    this.descentGain.connect(this.musicVolume);
    
    this.descentOscillator.start();
    
    // Fade in
    this.descentGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.5);
    
    // Add slow LFO for tension
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.3; // Very slow
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(this.descentOscillator.frequency);
    lfo.start();

    // Add subtle tremolo
    const tremolo = this.audioContext.createOscillator();
    const tremoloGain = this.audioContext.createGain();
    tremolo.frequency.value = 4;
    tremoloGain.gain.value = 0.02;
    tremolo.connect(tremoloGain);
    tremoloGain.connect(this.descentGain.gain);
    tremolo.start();
  }

  public stopDescentBGM() {
    if (!this.audioContext || !this.descentOscillator || !this.descentGain) return;
    
    // Fade out
    this.descentGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
    
    setTimeout(() => {
      if (this.descentOscillator) {
        this.descentOscillator.stop();
        this.descentOscillator.disconnect();
        this.descentOscillator = null;
      }
      if (this.descentGain) {
        this.descentGain.disconnect();
        this.descentGain = null;
      }
    }, 500);
  }

  // === COUNTDOWN TICK ===
  public playCountdownTick() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 1200;
    
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // === WIN SOUND ===
  public playWin() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.15;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.sfxVolume!);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // === LOSE SOUND ===
  public playLose() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Descending sad trombone
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = 400;
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
    
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc.connect(gain);
    gain.connect(this.sfxVolume);
    
    osc.start(now);
    osc.stop(now + 0.8);
  }

  // === AI FINISHED ALARM ===
  public playAlarm() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Alternating high-low alarm
    for (let i = 0; i < 3; i++) {
      [1000, 800].forEach((freq, j) => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();
        
        osc.type = 'square';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.4 + j * 0.2;
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);
        
        osc.connect(gain);
        gain.connect(this.sfxVolume!);
        
        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    }
  }

  // === DISCOVERY SOUND (Oil found!) ===
  public playDiscovery() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;

    // Ascending triumphant three-note chime
    const notes = [440, 554.37, 659.25]; // A-C#-E (A major chord arpeggio)

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = now + i * 0.12;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxVolume!);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });

    // Add a subtle sub-bass rumble for impact
    const sub = this.audioContext.createOscillator();
    const subGain = this.audioContext.createGain();
    sub.type = 'sine';
    sub.frequency.value = 60;
    subGain.gain.value = 0.1;
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    sub.connect(subGain);
    subGain.connect(this.sfxVolume);
    sub.start(now);
    sub.stop(now + 0.6);
  }

  // === FOOTSTEP SOUND ===
  public playFootstep() {
    if (!this.audioContext || !this.sfxVolume) return;
    this.resume();

    const now = this.audioContext.currentTime;

    // Short noise burst for crunchy footstep
    const bufferSize = this.audioContext.sampleRate * 0.06;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400 + Math.random() * 200;
    filter.Q.value = 1;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxVolume);

    noise.start(now);
    noise.stop(now + 0.06);
  }

  // Cleanup
  public destroy() {
    this.stopDrill();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
let soundSystemInstance: SoundSystem | null = null;

export const getSoundSystem = () => {
  if (!soundSystemInstance) {
    soundSystemInstance = new SoundSystem();
  }
  return soundSystemInstance;
};