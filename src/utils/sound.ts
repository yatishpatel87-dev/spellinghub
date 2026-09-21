// Audio synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Background Music State
let musicMasterGain: GainNode | null = null;
let musicSchedulerTimer: number | null = null;
let musicIsActive = false;
let currentMusicVolume = 0.35;
let musicNextNoteTime = 0;
let musicCurrentStep = 0;

const TEMPO = 114; // Beats per minute
const SECONDS_PER_BEAT = 60 / TEMPO;
const SECONDS_PER_STEP = SECONDS_PER_BEAT / 2; // Eighth note step = ~0.263s
const TOTAL_STEPS = 64; // 8 measures of 8 eighth-notes = 64 steps

// Note frequency map
const FREQS: Record<string, number> = {
  C2: 65.41,
  G2: 98.0,
  A2: 110.0,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
};

// Lighthearted, bouncy 64-step melody & chord progression
interface MusicNoteEvent {
  step: number;
  pitch: string;
  type: 'melody' | 'bass' | 'chord';
  duration?: number;
}

const MUSIC_SCORE: MusicNoteEvent[] = [
  // Measure 1 (C Major)
  { step: 0, pitch: 'C3', type: 'bass' },
  { step: 5, pitch: 'G3', type: 'bass' },
  { step: 0, pitch: 'G4', type: 'melody' },
  { step: 1, pitch: 'C5', type: 'melody' },
  { step: 2, pitch: 'E5', type: 'melody' },
  { step: 3, pitch: 'D5', type: 'melody' },
  { step: 4, pitch: 'C5', type: 'melody' },
  { step: 5, pitch: 'G4', type: 'melody' },
  { step: 6, pitch: 'A4', type: 'melody' },
  { step: 7, pitch: 'B4', type: 'melody' },
  { step: 1, pitch: 'E4', type: 'chord' },
  { step: 3, pitch: 'G4', type: 'chord' },
  { step: 5, pitch: 'E4', type: 'chord' },

  // Measure 2 (A Minor)
  { step: 8, pitch: 'A2', type: 'bass' },
  { step: 13, pitch: 'E3', type: 'bass' },
  { step: 8, pitch: 'C5', type: 'melody' },
  { step: 9, pitch: 'E5', type: 'melody' },
  { step: 10, pitch: 'A5', type: 'melody' },
  { step: 11, pitch: 'G5', type: 'melody' },
  { step: 12, pitch: 'E5', type: 'melody' },
  { step: 13, pitch: 'C5', type: 'melody' },
  { step: 14, pitch: 'D5', type: 'melody' },
  { step: 15, pitch: 'E5', type: 'melody' },
  { step: 9, pitch: 'C4', type: 'chord' },
  { step: 11, pitch: 'E4', type: 'chord' },
  { step: 13, pitch: 'C4', type: 'chord' },

  // Measure 3 (F Major)
  { step: 16, pitch: 'F3', type: 'bass' },
  { step: 21, pitch: 'C3', type: 'bass' },
  { step: 16, pitch: 'F5', type: 'melody' },
  { step: 17, pitch: 'E5', type: 'melody' },
  { step: 18, pitch: 'D5', type: 'melody' },
  { step: 19, pitch: 'C5', type: 'melody' },
  { step: 20, pitch: 'D5', type: 'melody' },
  { step: 21, pitch: 'F5', type: 'melody' },
  { step: 22, pitch: 'A5', type: 'melody' },
  { step: 23, pitch: 'G5', type: 'melody' },
  { step: 17, pitch: 'A3', type: 'chord' },
  { step: 19, pitch: 'C4', type: 'chord' },
  { step: 21, pitch: 'F4', type: 'chord' },

  // Measure 4 (G Major)
  { step: 24, pitch: 'G2', type: 'bass' },
  { step: 29, pitch: 'D3', type: 'bass' },
  { step: 24, pitch: 'F5', type: 'melody' },
  { step: 25, pitch: 'D5', type: 'melody' },
  { step: 26, pitch: 'B4', type: 'melody' },
  { step: 27, pitch: 'G4', type: 'melody' },
  { step: 28, pitch: 'A4', type: 'melody' },
  { step: 29, pitch: 'B4', type: 'melody' },
  { step: 30, pitch: 'C5', type: 'melody' },
  { step: 31, pitch: 'D5', type: 'melody' },
  { step: 25, pitch: 'B3', type: 'chord' },
  { step: 27, pitch: 'D4', type: 'chord' },
  { step: 29, pitch: 'G4', type: 'chord' },

  // Measure 5 (C Major Peak)
  { step: 32, pitch: 'C3', type: 'bass' },
  { step: 37, pitch: 'G3', type: 'bass' },
  { step: 32, pitch: 'E5', type: 'melody' },
  { step: 33, pitch: 'G5', type: 'melody' },
  { step: 34, pitch: 'C6', type: 'melody' },
  { step: 35, pitch: 'B5', type: 'melody' },
  { step: 36, pitch: 'A5', type: 'melody' },
  { step: 37, pitch: 'G5', type: 'melody' },
  { step: 38, pitch: 'E5', type: 'melody' },
  { step: 39, pitch: 'C5', type: 'melody' },
  { step: 33, pitch: 'G4', type: 'chord' },
  { step: 35, pitch: 'C5', type: 'chord' },
  { step: 37, pitch: 'E4', type: 'chord' },

  // Measure 6 (E Minor / A Minor)
  { step: 40, pitch: 'E3', type: 'bass' },
  { step: 45, pitch: 'B3', type: 'bass' },
  { step: 40, pitch: 'G5', type: 'melody' },
  { step: 41, pitch: 'B5', type: 'melody' },
  { step: 42, pitch: 'E5', type: 'melody' },
  { step: 43, pitch: 'G5', type: 'melody' },
  { step: 44, pitch: 'A5', type: 'melody' },
  { step: 45, pitch: 'E5', type: 'melody' },
  { step: 46, pitch: 'C5', type: 'melody' },
  { step: 47, pitch: 'D5', type: 'melody' },
  { step: 41, pitch: 'B3', type: 'chord' },
  { step: 43, pitch: 'E4', type: 'chord' },
  { step: 45, pitch: 'G4', type: 'chord' },

  // Measure 7 (D Minor / F)
  { step: 48, pitch: 'D3', type: 'bass' },
  { step: 53, pitch: 'A3', type: 'bass' },
  { step: 48, pitch: 'F5', type: 'melody' },
  { step: 49, pitch: 'A5', type: 'melody' },
  { step: 50, pitch: 'D5', type: 'melody' },
  { step: 51, pitch: 'F5', type: 'melody' },
  { step: 52, pitch: 'E5', type: 'melody' },
  { step: 53, pitch: 'C5', type: 'melody' },
  { step: 54, pitch: 'D5', type: 'melody' },
  { step: 55, pitch: 'E5', type: 'melody' },
  { step: 49, pitch: 'F4', type: 'chord' },
  { step: 51, pitch: 'A4', type: 'chord' },
  { step: 53, pitch: 'D4', type: 'chord' },

  // Measure 8 (G7 -> Turnaround)
  { step: 56, pitch: 'G2', type: 'bass' },
  { step: 61, pitch: 'G3', type: 'bass' },
  { step: 56, pitch: 'D5', type: 'melody' },
  { step: 57, pitch: 'F5', type: 'melody' },
  { step: 58, pitch: 'E5', type: 'melody' },
  { step: 59, pitch: 'D5', type: 'melody' },
  { step: 60, pitch: 'C5', type: 'melody' },
  { step: 61, pitch: 'B4', type: 'melody' },
  { step: 62, pitch: 'C5', type: 'melody' },
  { step: 63, pitch: 'D5', type: 'melody' },
  { step: 57, pitch: 'B3', type: 'chord' },
  { step: 59, pitch: 'D4', type: 'chord' },
  { step: 61, pitch: 'F4', type: 'chord' },
];

function initMusicMaster(): GainNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (!musicMasterGain) {
    musicMasterGain = ctx.createGain();
    musicMasterGain.gain.setValueAtTime(currentMusicVolume * 0.45, ctx.currentTime);
    musicMasterGain.connect(ctx.destination);
  }
  return musicMasterGain;
}

function playSynthesizedNote(
  ctx: AudioContext,
  master: GainNode,
  pitch: string,
  type: 'melody' | 'bass' | 'chord',
  time: number
) {
  const freq = FREQS[pitch];
  if (!freq) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (type === 'bass') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.3);
  } else if (type === 'chord') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.07, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.35);
  } else {
    // Melody: gentle marimba / kalimba chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Warm brief marimba envelope
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.26);
  }
}

// Scheduler loop
function scheduleNextNotes() {
  if (!musicIsActive) return;
  const ctx = getAudioContext();
  const master = initMusicMaster();
  if (!ctx || !master) return;

  const scheduleAheadTime = 0.4; // lookahead 400ms

  while (musicNextNoteTime < ctx.currentTime + scheduleAheadTime) {
    // Find all notes on this step
    const notesForStep = MUSIC_SCORE.filter((n) => n.step === musicCurrentStep);
    for (const note of notesForStep) {
      playSynthesizedNote(ctx, master, note.pitch, note.type, musicNextNoteTime);
    }

    // Advance to next step
    musicNextNoteTime += SECONDS_PER_STEP;
    musicCurrentStep = (musicCurrentStep + 1) % TOTAL_STEPS;
  }
}

export function startBackgroundMusic(volume = 0.35) {
  if (musicIsActive) {
    setMusicVolume(volume);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const master = initMusicMaster();
  if (!master) return;

  currentMusicVolume = volume;
  master.gain.setValueAtTime(volume * 0.45, ctx.currentTime);

  musicIsActive = true;
  musicCurrentStep = 0;
  musicNextNoteTime = ctx.currentTime + 0.05;

  if (musicSchedulerTimer) window.clearInterval(musicSchedulerTimer);
  musicSchedulerTimer = window.setInterval(scheduleNextNotes, 100);
}

export function stopBackgroundMusic() {
  musicIsActive = false;
  if (musicSchedulerTimer) {
    window.clearInterval(musicSchedulerTimer);
    musicSchedulerTimer = null;
  }

  if (musicMasterGain && audioCtx) {
    try {
      musicMasterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.1);
    } catch {
      // Ignored
    }
  }
}

export function setMusicVolume(volume: number) {
  currentMusicVolume = Math.max(0, Math.min(1, volume));
  if (musicMasterGain && audioCtx) {
    try {
      musicMasterGain.gain.setTargetAtTime(
        currentMusicVolume * 0.45,
        audioCtx.currentTime,
        0.05
      );
    } catch {
      // Ignored
    }
  }
}

export function setMusicEnabled(enabled: boolean, volume = 0.35) {
  if (enabled) {
    startBackgroundMusic(volume);
  } else {
    stopBackgroundMusic();
  }
}

export function isMusicPlaying(): boolean {
  return musicIsActive;
}

export function playTileTap(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Ignore audio failures
  }
}

export function playTileReturn(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio failures
  }
}

export function playSuccessChime(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const startTime = ctx.currentTime + index * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  } catch {
    // Ignore audio failures
  }
}

export function playWrongBuzz(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Ignore audio failures
  }
}

export function playTimerTick(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // Ignore audio failures
  }
}

export function playVictoryFanfare(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const melody = [
      { freq: 523.25, duration: 0.12, delay: 0 },
      { freq: 659.25, duration: 0.12, delay: 0.12 },
      { freq: 783.99, duration: 0.12, delay: 0.24 },
      { freq: 1046.5, duration: 0.4, delay: 0.36 },
      { freq: 880.0, duration: 0.15, delay: 0.65 },
      { freq: 1046.5, duration: 0.6, delay: 0.8 },
    ];

    melody.forEach((note) => {
      const startTime = ctx.currentTime + note.delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
  } catch {
    // Ignore audio failures
  }
}

// Speak the English word out loud using browser speech synthesis
export function speakWord(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis error handled silently
  }
}

// Generate a burst of white noise for realistic firecracker pops & crackles
function createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Play a single firecracker pop / bang
export function playFirecrackerPop(enabled = true, isHeavy = false) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = isHeavy ? 0.25 : 0.12;

    // 1. Noise crack
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, duration);

    const filter = ctx.createBiquadFilter();
    filter.type = isHeavy ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 1200 : 2200, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isHeavy ? 0.4 : 0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);

    // 2. Low boom thump for heavy crackers
    if (isHeavy) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // Ignore audio failures
  }
}

// Play a string of rapid firecracker crackles (Diwali / celebration lad)
export function playFirecrackerString(enabled = true) {
  if (!enabled) return;
  const pops = 6 + Math.floor(Math.random() * 6);
  for (let i = 0; i < pops; i++) {
    const delay = i * (45 + Math.random() * 50);
    setTimeout(() => {
      playFirecrackerPop(enabled, i === pops - 1);
    }, delay);
  }
}

// Automatic 10-second firecracker audio show
export function startFirecrackerShowAudio(durationMs = 10000, enabled = true): () => void {
  if (!enabled) return () => {};

  let isRunning = true;
  const startTime = Date.now();

  const scheduleNext = () => {
    if (!isRunning) return;
    const elapsed = Date.now() - startTime;
    if (elapsed >= durationMs) return;

    // Trigger crackle string or big pop
    if (Math.random() > 0.45) {
      playFirecrackerString(enabled);
    } else {
      playFirecrackerPop(enabled, Math.random() > 0.35);
    }

    // Schedule next cracker burst within 350ms - 850ms
    const nextInterval = 320 + Math.random() * 550;
    setTimeout(scheduleNext, nextInterval);
  };

  scheduleNext();

  return () => {
    isRunning = false;
  };
}
