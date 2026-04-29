// Tiny WebAudio synth — no asset files needed. Triggers tactile pings + cash rustle.
//
// Browser policy: AudioContext can only run after a user gesture. Until the
// first click/tap/keystroke we keep `ctx` null so the browser doesn't log
// "AudioContext was not allowed to start" on every ping attempt.
let ctx = null;
let unlocked = false;

const ensure = () => {
  if (!unlocked) return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

export function unlockAudio() {
  unlocked = true;
  ensure();
}

export function ping(freq = 880) {
  const ac = ensure();
  if (!ac) return;
  try {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, ac.currentTime + 0.18);
    g.gain.setValueAtTime(0.18, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.2);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.22);
  } catch {}
}

export function cashRustle() {
  const ac = ensure();
  if (!ac) return;
  try {
    const buf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      d[i] = (Math.random() * 2 - 1) * (1 - t) * 0.4;
    }
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;
    src.buffer = buf;
    src.connect(filter).connect(ac.destination);
    src.start();
  } catch {}
}

// Two-tone phone notification — played the moment COD lands on the screen.
export function phonePing() {
  const ac = ensure();
  if (!ac) return;
  try {
    const make = (freq, when, dur = 0.16) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, ac.currentTime + when);
      g.gain.setValueAtTime(0.0001, ac.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + dur);
      o.connect(g).connect(ac.destination);
      o.start(ac.currentTime + when);
      o.stop(ac.currentTime + when + dur + 0.02);
    };
    make(1320, 0);      // ding
    make(1760, 0.12);   // dong
  } catch {}
}
