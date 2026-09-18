/**
 * Lo-Fi Ambient Sound & Bell Synthesizer (Screaming Feature: Soundscapes)
 * Built using the Web Audio API for 100% royalty-free, offline, reliable procedural audio.
 * Features instant-pause cancellation for all oscillators and harmonic chords.
 */

import { LoFiTrackId } from './types';

interface AudioCleanupNode {
  stop: () => void;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private activeNodes: AudioCleanupNode[] = [];
  private currentTrack: LoFiTrackId = 'cafe';
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private isMuted: boolean = false;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Dedicated ambient sub-bus node
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const effectiveVol = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const effectiveVol = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.05);
    }
  }

  public playTrack(track: LoFiTrackId) {
    this.stopAmbient();
    this.currentTrack = track;
    this.isPlaying = true;

    const ctx = this.initContext();
    if (!ctx || !this.ambientGain) return;

    // Restore ambient gain immediately to 0.8
    const now = ctx.currentTime;
    try {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0.8, now);
    } catch {}

    switch (track) {
      case 'cafe':
        this.createCafeAmbience(ctx);
        break;
      case 'rain':
        this.createRainAmbience(ctx);
        break;
      case 'vinyl':
        this.createVinylAmbience(ctx);
        break;
      case 'chords':
        this.createLoFiChords(ctx);
        break;
      case 'ambience':
        this.createWarmAmbience(ctx);
        break;
    }
  }

  /**
   * Instantly stops all ambient sounds, zero delay.
   * Cancels scheduled envelopes, halts all chord and noise oscillators, and clears timeouts.
   */
  public stopAmbient() {
    this.isPlaying = false;

    // Instantly mute the ambient gain bus to prevent any residual audio tail
    if (this.ctx && this.ambientGain) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.cancelScheduledValues(now);
        // Fast 5ms micro-ramp to 0 prevents audible speaker pop while cutting sound instantly
        this.ambientGain.gain.linearRampToValueAtTime(0, now + 0.005);
      } catch {
        try {
          this.ambientGain.gain.value = 0;
        } catch {}
      }
    }

    // Call stop and disconnect on all actively registered nodes
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch {
        // Safe catch if node was already stopped
      }
    });
    this.activeNodes = [];
  }

  public togglePlay(track?: LoFiTrackId): boolean {
    if (this.isPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.playTrack(track || this.currentTrack);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Sweet, comfortable bell chime for interval finish.
   * Features a gentle dual-bell resonance (E5 -> B5) with warm harmonic overtones,
   * a soft felt attack, and a lingering cozy acoustic decay.
   */
  public playCompletionChime(): void {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Cozy lowpass filter to remove any harsh digital brightness
    const bellFilter = ctx.createBiquadFilter();
    bellFilter.type = 'lowpass';
    bellFilter.frequency.setValueAtTime(2200, now);
    bellFilter.Q.setValueAtTime(0.6, now);
    bellFilter.connect(this.masterGain);

    // Two harmonious, uplifting notes: E5 (659.25Hz) blooming into B5 (987.77Hz)
    const notes = [
      { freq: 659.25, time: now, duration: 3.2, baseVol: 0.28 },
      { freq: 987.77, time: now + 0.22, duration: 3.5, baseVol: 0.24 },
    ];

    notes.forEach(({ freq, time: strikeTime, duration, baseVol }) => {
      // 1. Warm fundamental body
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, strikeTime);

      gain1.gain.setValueAtTime(0.0001, strikeTime);
      gain1.gain.linearRampToValueAtTime(baseVol, strikeTime + 0.025); // Soft, comfortable 25ms bloom (no harsh click)
      gain1.gain.exponentialRampToValueAtTime(0.0001, strikeTime + duration);

      osc1.connect(gain1);
      gain1.connect(bellFilter);
      osc1.start(strikeTime);
      osc1.stop(strikeTime + duration + 0.05);

      // 2. Sweet octave overtone (pure, crystal clarity)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, strikeTime);

      gain2.gain.setValueAtTime(0.0001, strikeTime);
      gain2.gain.linearRampToValueAtTime(baseVol * 0.28, strikeTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, strikeTime + duration * 0.7);

      osc2.connect(gain2);
      gain2.connect(bellFilter);
      osc2.start(strikeTime);
      osc2.stop(strikeTime + duration * 0.7 + 0.05);

      // 3. Cozy lower resonance (gives the bell warm acoustic depth)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 0.5, strikeTime);

      gain3.gain.setValueAtTime(0.0001, strikeTime);
      gain3.gain.linearRampToValueAtTime(baseVol * 0.35, strikeTime + 0.035);
      gain3.gain.exponentialRampToValueAtTime(0.0001, strikeTime + duration * 0.85);

      osc3.connect(gain3);
      gain3.connect(bellFilter);
      osc3.start(strikeTime);
      osc3.stop(strikeTime + duration * 0.85 + 0.05);

      // 4. Subtle fifth sparkle (airy chime presence)
      const osc4 = ctx.createOscillator();
      const gain4 = ctx.createGain();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(freq * 3, strikeTime);

      gain4.gain.setValueAtTime(0.0001, strikeTime);
      gain4.gain.linearRampToValueAtTime(baseVol * 0.08, strikeTime + 0.015);
      gain4.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 1.2);

      osc4.connect(gain4);
      gain4.connect(bellFilter);
      osc4.start(strikeTime);
      osc4.stop(strikeTime + 1.25);
    });
  }

  /**
   * Tactile analog mechanical button click for timer triggers
   */
  public playTactileClick() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /* -------------------------------------------------------------
     Procedural Ambient Sound Generators
     ------------------------------------------------------------- */

  private createCafeAmbience(ctx: AudioContext) {
    if (!this.ambientGain) return;

    // 1. Warm Pillowy Room Bed (Deep stereo brown noise filtered gently at 260Hz)
    const bufferSize = 3 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);
    let lastL = 0.0;
    let lastR = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      lastL = (lastL + 0.02 * whiteL) / 1.02;
      lastR = (lastR + 0.02 * whiteR) / 1.02;
      left[i] = lastL * 2.2;
      right[i] = lastR * 2.2;
    }

    const roomSource = ctx.createBufferSource();
    roomSource.buffer = noiseBuffer;
    roomSource.loop = true;

    // Dual cascade lowpass filters create a velvety, non-fatiguing acoustic room envelope
    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(260, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(320, ctx.currentTime);

    const roomGain = ctx.createGain();
    roomGain.gain.setValueAtTime(0.28, ctx.currentTime);

    roomSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(roomGain);
    roomGain.connect(this.ambientGain);
    roomSource.start();

    // 2. Distant Indistinct Murmur (Slow, warm acoustic resonances at 300Hz & 520Hz)
    const murmurSource = ctx.createBufferSource();
    murmurSource.buffer = noiseBuffer;
    murmurSource.loop = true;

    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'bandpass';
    formantFilter.frequency.setValueAtTime(360, ctx.currentTime);
    formantFilter.Q.setValueAtTime(2.0, ctx.currentTime);

    const murmurGain = ctx.createGain();
    murmurGain.gain.setValueAtTime(0.08, ctx.currentTime);

    // Ultra-slow LFO to make the distant murmur breathe naturally
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-second gentle wave
    lfoGain.gain.setValueAtTime(60, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(formantFilter.frequency);
    lfo.start();

    murmurSource.connect(formantFilter);
    formantFilter.connect(murmurGain);
    murmurGain.connect(this.ambientGain);
    murmurSource.start();

    // 3. Gentle Periodic Coffee Bar Steam & Soft Ceramic Placement
    let isRunning = true;
    let eventTimeout: ReturnType<typeof setTimeout> | null = null;
    let activeNodesList: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];

    const scheduleCozyEvent = () => {
      if (!isRunning || !this.ambientGain || !this.ctx) return;
      // Trigger subtle cafe sound every 8 to 16 seconds
      const delay = Math.random() * 8000 + 8000;
      eventTimeout = setTimeout(() => {
        if (!isRunning || !this.ambientGain || !this.ctx) return;
        const now = this.ctx.currentTime;
        const isSteam = Math.random() > 0.45;

        if (isSteam) {
          // Soft espresso steam wisp (warm, gentle whisper, never harsh)
          const steamSrc = this.ctx.createBufferSource();
          steamSrc.buffer = noiseBuffer;
          const steamFilter = this.ctx.createBiquadFilter();
          steamFilter.type = 'lowpass';
          steamFilter.frequency.setValueAtTime(580, now);

          const steamGain = this.ctx.createGain();
          steamGain.gain.setValueAtTime(0.0001, now);
          steamGain.gain.linearRampToValueAtTime(0.05, now + 1.2);
          steamGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

          steamSrc.connect(steamFilter);
          steamFilter.connect(steamGain);
          steamGain.connect(this.ambientGain);
          steamSrc.start(now);
          steamSrc.stop(now + 3.3);
          activeNodesList.push(steamSrc);
        } else {
          // Soft wooden/ceramic mug set-down (gentle 420Hz wood tap, replaces harsh 3kHz clink)
          const tapOsc = this.ctx.createOscillator();
          const tapGain = this.ctx.createGain();
          const tapFilter = this.ctx.createBiquadFilter();

          tapOsc.type = 'sine';
          tapOsc.frequency.setValueAtTime(420, now);
          tapOsc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

          tapFilter.type = 'lowpass';
          tapFilter.frequency.setValueAtTime(650, now);

          tapGain.gain.setValueAtTime(0.0001, now);
          tapGain.gain.linearRampToValueAtTime(0.025, now + 0.015);
          tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

          tapOsc.connect(tapFilter);
          tapFilter.connect(tapGain);
          tapGain.connect(this.ambientGain);
          tapOsc.start(now);
          tapOsc.stop(now + 0.2);
          activeNodesList.push(tapOsc);
        }

        scheduleCozyEvent();
      }, delay);
    };

    scheduleCozyEvent();

    this.activeNodes.push({
      stop: () => {
        isRunning = false;
        if (eventTimeout) clearTimeout(eventTimeout);
        try {
          lfo.stop();
          lfo.disconnect();
          roomSource.stop();
          roomSource.disconnect();
          murmurSource.stop();
          murmurSource.disconnect();
          roomGain.disconnect();
          murmurGain.disconnect();
          activeNodesList.forEach(node => {
            try {
              if ('stop' in node && typeof (node as AudioBufferSourceNode).stop === 'function') {
                (node as AudioBufferSourceNode).stop();
              }
              node.disconnect();
            } catch {}
          });
          activeNodesList = [];
        } catch {}
      },
    });
  }

  private createRainAmbience(ctx: AudioContext) {
    if (!this.ambientGain) return;

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    let b0L = 0, b1L = 0, b2L = 0;
    let b0R = 0, b1R = 0, b2R = 0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      left[i] = (b0L + b1L + b2L) * 0.12;

      const whiteR = Math.random() * 2 - 1;
      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      right[i] = (b0R + b1R + b2R) * 0.12;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.45, ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.ambientGain);
    rainSource.start();

    this.activeNodes.push({
      stop: () => {
        try {
          rainSource.stop();
          rainSource.disconnect();
          rainGain.disconnect();
        } catch {}
      },
    });
  }

  private createVinylAmbience(ctx: AudioContext) {
    if (!this.ambientGain) return;

    // 1. Warm turntable motor hum
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(58, ctx.currentTime);
    humGain.gain.setValueAtTime(0.04, ctx.currentTime);
    humOsc.connect(humGain);
    humGain.connect(this.ambientGain);
    humOsc.start();

    // 2. Vinyl hiss
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03;
    }
    const hissSource = ctx.createBufferSource();
    hissSource.buffer = noiseBuffer;
    hissSource.loop = true;

    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.setValueAtTime(3200, ctx.currentTime);
    hissFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.12, ctx.currentTime);

    hissSource.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(this.ambientGain);
    hissSource.start();

    // 3. Crackle pops
    let isRunning = true;
    let popTimeout: ReturnType<typeof setTimeout> | null = null;
    let activePopOsc: OscillatorNode | null = null;

    const schedulePops = () => {
      if (!isRunning || !this.ambientGain || !this.ctx) return;
      const delay = Math.random() * 800 + 200;
      popTimeout = setTimeout(() => {
        if (!isRunning || !this.ambientGain || !this.ctx) return;
        const now = this.ctx.currentTime;
        const pop = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        pop.type = 'square';
        pop.frequency.setValueAtTime(Math.random() * 1500 + 500, now);
        pGain.gain.setValueAtTime(Math.random() * 0.05 + 0.01, now);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        pop.connect(pGain);
        pGain.connect(this.ambientGain);
        pop.start(now);
        pop.stop(now + 0.02);
        activePopOsc = pop;
        schedulePops();
      }, delay);
    };

    schedulePops();

    this.activeNodes.push({
      stop: () => {
        isRunning = false;
        if (popTimeout) clearTimeout(popTimeout);
        try {
          if (activePopOsc) {
            activePopOsc.stop();
            activePopOsc.disconnect();
          }
          humOsc.stop();
          humOsc.disconnect();
          hissSource.stop();
          hissSource.disconnect();
        } catch {}
      },
    });
  }

  /**
   * Lo-Fi Chords: Lush electric piano chord progression.
   * Tracks and immediately terminates all oscillators upon pause.
   */
  private createLoFiChords(ctx: AudioContext) {
    if (!this.ambientGain) return;

    // Ebmaj9 -> Cm9 -> Fm9 -> Bb13
    const progressions = [
      [155.56, 196.00, 233.08, 293.66], // Ebmaj9
      [130.81, 155.56, 196.00, 261.63], // Cm9
      [174.61, 207.65, 261.63, 311.13], // Fm9
      [116.54, 174.61, 220.00, 261.63], // Bb13
    ];

    let chordIdx = 0;
    let isChording = true;
    let chordTimeout: ReturnType<typeof setTimeout> | null = null;
    let activeChordOscs: { osc: OscillatorNode; gain: GainNode }[] = [];

    const stopActiveChordOscs = () => {
      activeChordOscs.forEach(({ osc, gain }) => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch {}
      });
      activeChordOscs = [];
    };

    const playNextChord = () => {
      if (!isChording || !this.ambientGain || !this.ctx) return;

      // Stop previous chord oscillators cleanly
      stopActiveChordOscs();

      const notes = progressions[chordIdx % progressions.length];
      chordIdx++;
      const now = this.ctx.currentTime;
      const chordDuration = 7.0;

      notes.forEach(freq => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.8);
        gain.gain.linearRampToValueAtTime(0.001, now + chordDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(now);
        osc.stop(now + chordDuration + 0.1);

        activeChordOscs.push({ osc, gain });
      });

      chordTimeout = setTimeout(playNextChord, (chordDuration - 1.2) * 1000);
    };

    playNextChord();

    // Register immediate cleanup hook
    this.activeNodes.push({
      stop: () => {
        isChording = false;
        if (chordTimeout) {
          clearTimeout(chordTimeout);
          chordTimeout = null;
        }
        stopActiveChordOscs();
      },
    });
  }

  private createWarmAmbience(ctx: AudioContext) {
    if (!this.ambientGain) return;

    // Deep warm 432Hz harmonic drone
    const fundamental = 108; // 432 / 4 = A2
    const freqs = [fundamental, fundamental * 1.5, fundamental * 2, fundamental * 2.5];
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      gain.gain.setValueAtTime(0.07 / (idx + 1), ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain!);

      osc.start();
      oscs.push(osc);
      gains.push(gain);
    });

    this.activeNodes.push({
      stop: () => {
        oscs.forEach((o, i) => {
          try {
            o.stop();
            o.disconnect();
            gains[i]?.disconnect();
          } catch {}
        });
      },
    });
  }
}

// Export singleton instance for the app
export const soundEngine = new SoundEngine();
