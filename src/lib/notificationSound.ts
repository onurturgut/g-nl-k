export type NotificationSoundId = 'classic-bell' | 'digital' | 'soft-chime' | 'double-bell' | 'urgent';

export const notificationSoundLibrary: Array<{
  id: NotificationSoundId;
  name: string;
  description: string;
}> = [
  { id: 'classic-bell', name: 'Klasik Zil', description: 'Net ve metalik görev zili' },
  { id: 'digital', name: 'Dijital', description: 'Kısa modern bildirim tonu' },
  { id: 'soft-chime', name: 'Sakin Çan', description: 'Daha yumuşak ve uzun çınlama' },
  { id: 'double-bell', name: 'Çift Zil', description: 'İki vuruşlu belirgin hatırlatma' },
  { id: 'urgent', name: 'Acil', description: 'Daha hızlı ve dikkat çekici ton' },
];

type BrowserWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const browserWindow = window as BrowserWindow;
  const AudioContextCtor = browserWindow.AudioContext || browserWindow.webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

function createBellStrike(ctx: AudioContext, startAt: number, baseFrequency: number, volume: number, decay = 1.1) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, startAt);
  master.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0001, startAt + decay);
  master.connect(ctx.destination);

  const partials = [
    { ratio: 1, gain: 0.72 },
    { ratio: 2.01, gain: 0.32 },
    { ratio: 2.75, gain: 0.18 },
    { ratio: 4.08, gain: 0.1 },
  ];

  partials.forEach((partial) => {
    const osc = ctx.createOscillator();
    const partialGain = ctx.createGain();
    osc.type = partial.ratio > 2 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFrequency * partial.ratio, startAt);
    osc.frequency.exponentialRampToValueAtTime(baseFrequency * partial.ratio * 0.992, startAt + decay * 0.75);
    partialGain.gain.setValueAtTime(partial.gain, startAt);
    partialGain.gain.exponentialRampToValueAtTime(0.0001, startAt + decay * 0.8);
    osc.connect(partialGain);
    partialGain.connect(master);
    osc.start(startAt);
    osc.stop(startAt + decay + 0.05);
  });
}

function createTone(ctx: AudioContext, startAt: number, frequency: number, duration: number, volume: number, type: OscillatorType) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.03);
}

export async function unlockNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  return ctx.state === 'running';
}

export async function playNotificationSound(volume = 0.45, soundId: NotificationSoundId = 'classic-bell') {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const safeVolume = Math.min(1, Math.max(0, volume));
  const now = ctx.currentTime;

  if (soundId === 'digital') {
    createTone(ctx, now, 1046, 0.12, safeVolume, 'square');
    createTone(ctx, now + 0.13, 1397, 0.16, safeVolume * 0.75, 'square');
    return true;
  }

  if (soundId === 'soft-chime') {
    createBellStrike(ctx, now, 784, safeVolume * 0.72, 1.55);
    createBellStrike(ctx, now + 0.28, 988, safeVolume * 0.42, 1.35);
    return true;
  }

  if (soundId === 'double-bell') {
    createBellStrike(ctx, now, 988, safeVolume, 1.05);
    createBellStrike(ctx, now + 0.34, 1318, safeVolume * 0.72, 1.05);
    return true;
  }

  if (soundId === 'urgent') {
    createTone(ctx, now, 880, 0.13, safeVolume, 'sawtooth');
    createTone(ctx, now + 0.16, 880, 0.13, safeVolume, 'sawtooth');
    createTone(ctx, now + 0.32, 1174, 0.2, safeVolume * 0.85, 'sawtooth');
    return true;
  }

  createBellStrike(ctx, now, 988, safeVolume, 1.15);
  createBellStrike(ctx, now + 0.34, 1318, safeVolume * 0.72, 1.15);
  return true;
}
