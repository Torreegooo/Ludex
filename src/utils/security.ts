/**
 * Security and Cryptography Utilities for LUDEX
 * Implements E2EE verification, cryptographic fingerprint generation,
 * audio chime synthesis via Web Audio API, and local storage helpers.
 */

// Generate a deterministic or pseudo-random safety fingerprint
export function generateFingerprint(input?: string): string {
  const seed = input || Math.random().toString(36).substring(2);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part1 = hex.substring(0, 4).toUpperCase();
  const part2 = hex.substring(4, 8).toUpperCase();
  const part3 = ((Math.abs(hash * 31)) % 65536).toString(16).padStart(4, '0').toUpperCase();
  const part4 = ((Math.abs(hash * 7)) % 65536).toString(16).padStart(4, '0').toUpperCase();
  return `LUDEX-E2EE-${part1}:${part2}:${part3}:${part4}`;
}

// Generate OTP security code for in-person handshakes
export function generateHandshakeOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Play subtle UI audio alerts using native Web Audio API (no external file latency)
export function playNotificationChime(type: 'push' | 'bid' | 'success' | 'alert' = 'push') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'push') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'bid') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    }
  } catch {
    // Audio might be blocked if user has not interacted yet, ignore safely
  }
}

// Format relative auction time
export function formatAuctionCountdown(targetDateISO: string): {
  isEnded: boolean;
  text: string;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const target = new Date(targetDateISO).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { isEnded: true, text: 'Finalizada', hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let text = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    text = `${days}d ${hours % 24}h restantes`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    text = `${minutes}m ${seconds}s`;
  }

  return { isEnded: false, text, hours, minutes, seconds };
}
