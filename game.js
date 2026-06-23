'use strict';

// ════════════════════════════════════════════════
//  AUDIO ENGINE
// ════════════════════════════════════════════════
let AC = null, mGain = null;

function initAC() {
  if (AC) return;
  AC = new (window.AudioContext || window.webkitAudioContext)();
  mGain = AC.createGain();
  mGain.gain.value = volMuted ? 0 : 0.62;
  mGain.connect(AC.destination);
}
function resumeAC() { if (AC && AC.state === 'suspended') AC.resume(); }

function playKick(t) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.connect(g); g.connect(mGain);
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
  g.gain.setValueAtTime(1.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
  o.start(t); o.stop(t + 0.38);
}

function playSnare(t) {
  const dur = 0.13;
  const buf = AC.createBuffer(1, Math.ceil(AC.sampleRate * dur), AC.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = AC.createBufferSource(); src.buffer = buf;
  const flt = AC.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 1900; flt.Q.value = 0.9;
  const g = AC.createGain();
  g.gain.setValueAtTime(0.75, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(flt); flt.connect(g); g.connect(mGain); src.start(t); src.stop(t + dur);
  const o2 = AC.createOscillator(), og = AC.createGain();
  o2.frequency.value = 195; og.gain.setValueAtTime(0.3, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o2.connect(og); og.connect(mGain); o2.start(t); o2.stop(t + 0.08);
}

function playHH(t, open = false) {
  const dur = open ? 0.28 : 0.042;
  const buf = AC.createBuffer(1, Math.ceil(AC.sampleRate * dur), AC.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = AC.createBufferSource(); src.buffer = buf;
  const flt = AC.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = 9500;
  const g = AC.createGain();
  g.gain.setValueAtTime(open ? 0.17 : 0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(flt); flt.connect(g); g.connect(mGain); src.start(t); src.stop(t + dur);
}

function playBass(t, freq, dur) {
  const o = AC.createOscillator(), flt = AC.createBiquadFilter(), g = AC.createGain();
  o.type = 'sawtooth'; o.frequency.value = freq;
  flt.type = 'lowpass'; flt.frequency.value = 700; flt.Q.value = 3;
  g.gain.setValueAtTime(0.65, t); g.gain.setValueAtTime(0.42, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(flt); flt.connect(g); g.connect(mGain); o.start(t); o.stop(t + dur);
}

function playLead(t, freq, dur, vol = 0.26) {
  const o = AC.createOscillator(), flt = AC.createBiquadFilter(), g = AC.createGain();
  o.type = 'sawtooth'; o.frequency.value = freq;
  flt.type = 'lowpass'; flt.frequency.value = 2800; flt.Q.value = 4;
  flt.frequency.exponentialRampToValueAtTime(400, t + dur * 0.85);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.88);
  o.connect(flt); flt.connect(g); g.connect(mGain); o.start(t); o.stop(t + dur);
}

function playPad(t, freqs, dur) {
  for (const freq of freqs) {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(mGain); o.start(t); o.stop(t + dur);
  }
}

function hitSfx(type) {
  if (!AC) return;
  const t = AC.currentTime + 0.01;
  if (type === 'perfect') { playLead(t, 1046.5, 0.06, 0.2); playLead(t + 0.04, 1318.5, 0.06, 0.16); }
  else if (type === 'good') { playLead(t, 783.99, 0.07, 0.18); }
  else {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sawtooth'; o.frequency.value = 72;
    g.gain.setValueAtTime(0.38, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g); g.connect(mGain); o.start(t); o.stop(t + 0.13);
  }
}

function countdownSfx(n) {
  if (!AC) return;
  const t = AC.currentTime + 0.01;
  if (n > 0) {
    // 3=E4, 2=G4, 1=B4  → rising tension
    const freqs = [0, 329.63, 392.00, 659.25];
    playLead(t, freqs[n], 0.22, 0.5);
  } else {
    // GO! — bright ascending chord burst
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => playLead(t + i * 0.055, f, 0.2, 0.42));
  }
}

function playJingle(type) {
  if (!AC) return;
  const t = AC.currentTime + 0.12;
  if (type === 'fc') {
    // Full combo — epic ascending run + triumphant pad
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) =>
      playLead(t + i * 0.07, f, 0.22, 0.45));
    setTimeout(() => {
      if (!AC) return;
      playPad(AC.currentTime + 0.05, [523.25, 659.25, 783.99, 1046.50], 1.4);
      playLead(AC.currentTime + 0.05, 1046.50, 0.6, 0.5);
    }, 500);
  } else if (type === 'clear') {
    // Clear — simple happy arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) =>
      playLead(t + i * 0.09, f, 0.2, 0.38));
    setTimeout(() => {
      if (!AC) return;
      playPad(AC.currentTime + 0.05, [523.25, 659.25, 783.99], 1.0);
    }, 420);
  } else {
    // Fail — descending minor
    [330, 277, 220, 165].forEach((f, i) => playBass(t + i * 0.14, f, 0.28));
  }
}

// ════════════════════════════════════════════════
//  LEVEL CONFIGS
//  noteGrid: 16-slot array per bar (16th notes), value = lane 0-3 or -1 (rest)
//  drums:    16-slot array, string flags: K=kick S=snare H=closed-HH O=open-HH
//  bassLine: [[freq, quarterBeats], ...] — repeated per bar
//  leadLine: [[freq, quarterBeats], ...] — repeated per bar (null = none)
//  pads:     [freq,...] chord sustained per bar (null = none)
// ════════════════════════════════════════════════
const N = {
  C2:65.41,D2:73.42,E2:82.41,F2:87.31,G2:98.00,A2:110.00,Bb2:116.54,B2:123.47,
  C3:130.81,D3:146.83,Eb3:155.56,E3:164.81,F3:174.61,G3:196.00,A3:220.00,Bb3:233.08,B3:246.94,
  C4:261.63,D4:293.66,Eb4:311.13,E4:329.63,F4:349.23,G4:392.00,A4:440.00,Bb4:466.16,B4:493.88,
  C5:523.25,D5:587.33,Eb5:622.25,E5:659.25,F5:698.46,G5:783.99,A5:880.00,Bb5:932.33,
  C6:1046.50,D6:1174.66,E6:1318.51,G6:1567.98,
};

const LV = [
  // ── 1 │ 60 BPM │ Quarter notes, single lane at a time ──────────────────
  { bpm:60, bars:8, title:'첫걸음',
    noteGrid:[
      [0,-1,-1,-1, 1,-1,-1,-1, 2,-1,-1,-1, 3,-1,-1,-1],
    ],
    drums:['K','','','', 'S','','','', 'K','','','', 'S','','',''],
    bassLine:[[N.C2,2],[N.G2,2]],
    leadLine:null,
    pads:[N.C3,N.Eb3,N.G3],
  },
  // ── 2 │ 70 BPM │ 8th notes appear ───────────────────────────────────────
  { bpm:70, bars:8, title:'리듬 감각',
    noteGrid:[
      [0,-1,-1,-1, 1,-1,-1,-1, 2,-1,-1,-1, 3,-1,-1,-1],
      [0,-1, 2,-1, 1,-1, 3,-1, 0,-1, 2,-1, 1,-1, 3,-1],
    ],
    drums:['K','','H','', 'S','','H','', 'K','','H','', 'S','','H',''],
    bassLine:[[N.A2,2],[N.E2,2]],
    leadLine:null,
    pads:[N.A3,N.C4,N.E4],
  },
  // ── 3 │ 80 BPM │ Mixed 8th note patterns ────────────────────────────────
  { bpm:80, bars:8, title:'오프비트',
    noteGrid:[
      [0,-1, 1,-1, 2,-1, 3,-1, 2,-1, 1,-1, 0,-1, 3,-1],
      [0,-1, 2,-1, 1,-1, 3,-1, 0,-1, 3,-1, 2,-1, 1,-1],
    ],
    drums:['KH','','H','', 'SH','','H','O', 'KH','','H','', 'SH','','H','O'],
    bassLine:[[N.G2,1],[N.D2,1],[N.Bb2,1],[N.D2,1]],
    leadLine:[[N.G4,2],[N.Bb4,2],[N.C5,2],[N.D5,2]],
    pads:[N.G3,N.Bb3,N.D4],
  },
  // ── 4 │ 90 BPM │ 16th notes begin ───────────────────────────────────────
  { bpm:90, bars:8, title:'16비트',
    noteGrid:[
      [0,-1, 1,-1, 2,-1, 3,-1, 0, 1,-1,-1, 2,-1, 3,-1],
      [0,-1, 1, 2,-1,-1, 3,-1, 0,-1, 1,-1, 2, 3,-1,-1],
    ],
    drums:['KH','','H','', 'SH','','H','H', 'K','H','H','', 'S','','H','H'],
    bassLine:[[N.D2,1],[N.A2,1],[N.Bb2,1],[N.C3,1]],
    leadLine:[[N.D5,1],[N.F5,1],[N.A5,1],[N.Bb5,1]],
    pads:[N.D3,N.F3,N.A3],
  },
  // ── 5 │ 100 BPM │ Brighter, denser ───────────────────────────────────────
  { bpm:100, bars:8, title:'메이저 스텝',
    noteGrid:[
      [0, 1,-1,-1, 2,-1, 3,-1, 0,-1, 1, 2,-1, 3,-1,-1],
      [0,-1, 1, 2, 3,-1,-1,-1, 0, 1,-1, 2,-1,-1, 3,-1],
    ],
    drums:['KH','','H','H', 'S','H','H','O', 'K','H','H','', 'S','H','H','H'],
    bassLine:[[N.F2,1],[N.C3,1],[N.Bb2,1],[N.G2,1]],
    leadLine:[[N.F5,1],[N.G5,1],[N.A5,1],[N.C6,1]],
    pads:[N.F3,N.A3,N.C4],
  },
  // ── 6 │ 110 BPM │ Complex syncopation ─────────────────────────────────────
  { bpm:110, bars:8, title:'복잡한 패턴',
    noteGrid:[
      [0, 2, 1,-1, 2,-1, 0, 3, 1,-1, 3, 2, 0, 1,-1, 3],
      [0,-1, 1, 2,-1, 3, 0,-1, 1, 3,-1, 0, 2,-1, 3, 1],
    ],
    drums:['KH','H','H','', 'S','H','H','O', 'K','H','H','H', 'S','H','O','H'],
    bassLine:[[N.E2,1],[N.B2,1],[N.G2,1],[N.A2,1]],
    leadLine:[[N.E5,1],[N.G5,1],[N.B5,1],[N.D6,1]],
    pads:[N.E3,N.G3,N.B3],
  },
  // ── 7 │ 120 BPM │ Dense note walls ────────────────────────────────────────
  { bpm:120, bars:10, title:'고밀도',
    noteGrid:[
      [0, 2, 1, 3, 2, 0, 3, 1, 0,-1, 1, 2, 3, 0,-1, 1],
      [0, 1, 2,-1, 3, 2, 1, 0,-1, 2, 0, 3, 1,-1, 2, 3],
    ],
    holds:[
      {bar:1, pos:8, lane:3, len:8},
      {bar:4, pos:9, lane:2, len:8},
      {bar:7, pos:3, lane:0, len:8},
    ],
    drums:['KH','H','H','H', 'S','H','H','O', 'KH','H','H','H', 'S','H','H','O'],
    bassLine:[[N.C2,0.5],[N.D2,0.5],[N.Eb3,0.5],[N.G2,0.5],[N.C2,0.5],[N.D2,0.5],[N.Eb3,0.5],[N.G2,0.5]],
    leadLine:[[N.C5,0.5],[N.Eb5,0.5],[N.G5,0.5],[N.Bb5,0.5],[N.C5,0.5],[N.Eb5,0.5],[N.G5,0.5],[N.Bb5,0.5]],
    pads:[N.C4,N.Eb4,N.G4,N.Bb4],
  },
  // ── 8 │ 130 BPM │ Relentless ──────────────────────────────────────────────
  { bpm:130, bars:10, title:'폭풍 속으로',
    noteGrid:[
      [0, 1, 2, 3, 0, 2, 1, 3, 2, 0, 3, 1, 0, 3, 2, 1],
      [0, 2,-1, 1, 3,-1, 0, 2, 1, 3,-1, 0, 2, 1, 3,-1],
    ],
    holds:[
      {bar:1, pos:2, lane:2, len:8},
      {bar:3, pos:5, lane:0, len:8},
      {bar:5, pos:10, lane:3, len:8},
      {bar:7, pos:15, lane:1, len:8},
      {bar:9, pos:2, lane:3, len:8},
    ],
    drums:['K','H','H','H', 'SH','H','H','H', 'K','H','H','H', 'SH','H','H','H'],
    bassLine:[[N.A2,0.5],[N.G2,0.5],[N.F2,0.5],[N.E2,0.5],[N.A2,0.5],[N.G2,0.5],[N.F2,0.5],[N.E2,0.5]],
    leadLine:[[N.A5,0.5],[N.G5,0.5],[N.F5,0.5],[N.E5,0.5],[N.A5,0.5],[N.G5,0.5],[N.F5,0.5],[N.E5,0.5]],
    pads:[N.A3,N.C4,N.E4],
  },
  // ── 9 │ 145 BPM │ Extreme ─────────────────────────────────────────────────
  { bpm:145, bars:10, title:'극한의 속도',
    noteGrid:[
      [0, 1, 2, 3, 1, 2, 3, 0, 2, 3, 0, 1, 3, 0, 1, 2],
      [0, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2, 3, 2, 1, 0, 3],
    ],
    holds:[
      {bar:0, pos:0, lane:3, len:8},
      {bar:2, pos:8, lane:1, len:8},
      {bar:5, pos:0, lane:2, len:8},
      {bar:7, pos:4, lane:0, len:8},
      {bar:9, pos:0, lane:3, len:8},
    ],
    drums:['K','H','S','H', 'K','H','S','H', 'KH','H','S','H', 'K','H','S','H'],
    bassLine:[[N.D2,0.5],[N.F2,0.5],[N.A2,0.5],[N.C3,0.5],[N.D2,0.5],[N.F2,0.5],[N.A2,0.5],[N.C3,0.5]],
    leadLine:[[N.D6,0.5],[N.C6,0.5],[N.Bb5,0.5],[N.A5,0.5],[N.D6,0.5],[N.C6,0.5],[N.Bb5,0.5],[N.A5,0.5]],
    pads:[N.D4,N.F4,N.A4,N.C5],
  },
  // ── 10 │ 160 BPM │ BOSS ─────────────────────────────────────────────────
  { bpm:160, bars:12, title:'리듬마스터 BOSS',
    noteGrid:[
      [0, 1, 2, 3, 0, 2, 1, 3, 0, 3, 2, 1, 0, 1, 2, 3],
      [0, 2, 1, 3, 2, 0, 3, 1, 0, 1, 3, 2, 1, 3, 0, 2],
      [3, 2, 1, 0, 3, 1, 2, 0, 3, 0, 1, 2, 3, 2, 0, 1],
    ],
    holds:[
      {bar:0, pos:0, lane:2, len:8},
      {bar:2, pos:0, lane:1, len:8},
      {bar:5, pos:0, lane:3, len:8},
      {bar:8, pos:0, lane:0, len:8},
      {bar:10, pos:0, lane:2, len:8},
    ],
    drums:['KH','H','SH','H', 'K','H','S','H', 'KH','H','S','H', 'K','H','SH','H'],
    bassLine:[[N.C2,0.25],[N.D2,0.25],[N.Eb3,0.25],[N.F2,0.25],[N.C2,0.25],[N.D2,0.25],[N.Eb3,0.25],[N.F2,0.25],[N.C2,0.25],[N.D2,0.25],[N.Eb3,0.25],[N.F2,0.25],[N.C2,0.25],[N.D2,0.25],[N.Eb3,0.25],[N.F2,0.25]],
    leadLine:[[N.C6,0.25],[N.D6,0.25],[N.E6,0.25],[N.G6,0.25],[N.C6,0.25],[N.D6,0.25],[N.E6,0.25],[N.G6,0.25],[N.C6,0.25],[N.D6,0.25],[N.E6,0.25],[N.G6,0.25],[N.C6,0.25],[N.D6,0.25],[N.E6,0.25],[N.G6,0.25]],
    pads:[N.C4,N.Eb4,N.G4,N.Bb4],
  },
];

// ════════════════════════════════════════════════
//  BEATMAP BUILDER  (builds note hit-times for game logic)
// ════════════════════════════════════════════════
function buildBeatmap(lvIdx) {
  const cfg = LV[lvIdx];
  const beat = 60 / cfg.bpm;
  const s16 = beat / 4;
  const notes = [];

  for (let bar = 0; bar < cfg.bars; bar++) {
    const grid = cfg.noteGrid[bar % cfg.noteGrid.length];
    for (let i = 0; i < 16; i++) {
      if (grid[i] >= 0) {
        notes.push({ time: (bar * 16 + i) * s16, lane: grid[i], hit: false, missed: false, el: null });
      }
    }
  }
  if (cfg.holds) {
    for (const h of cfg.holds) {
      const time = (h.bar * 16 + h.pos) * s16;
      notes.push({ time, lane: h.lane, hit: false, missed: false, el: null,
        type: 'hold', endTime: time + h.len * s16, holding: false, tailEl: null });
    }
  }

  notes.sort((a, b) => a.time - b.time);
  return { notes, totalTime: cfg.bars * beat * 4 };
}

// ════════════════════════════════════════════════
//  AUDIO SCHEDULER  (pre-schedules entire level music)
// ════════════════════════════════════════════════
function scheduleAudioForLevel(lvIdx, acStart) {
  const cfg = LV[lvIdx];
  const beat = 60 / cfg.bpm;
  const s16 = beat / 4;
  const barDur = beat * 4;

  for (let bar = 0; bar < cfg.bars; bar++) {
    const barT = acStart + bar * barDur;

    // ── Drums (16th-note grid) ──
    for (let i = 0; i < 16; i++) {
      const t = barT + i * s16;
      const d = cfg.drums[i] || '';
      if (d.includes('K')) playKick(t);
      if (d.includes('S')) playSnare(t);
      if (d.includes('H')) playHH(t, false);
      if (d.includes('O')) playHH(t, true);
    }

    // ── Bass line (fills the bar) ──
    if (cfg.bassLine) {
      let bT = barT, used = 0, n = 0;
      while (used < barDur - 0.0001 && n < 256) {
        const [freq, qb] = cfg.bassLine[n % cfg.bassLine.length];
        const dur = qb * beat;
        playBass(bT, freq, Math.max(dur * 0.82, 0.05));
        bT += dur; used += dur; n++;
      }
    }

    // ── Lead line (fills the bar) ──
    if (cfg.leadLine) {
      let lT = barT, used = 0, n = 0;
      // offset start index so melody progresses across bars
      const startN = (bar * Math.round(barDur / (cfg.leadLine[0][1] * beat))) % cfg.leadLine.length;
      while (used < barDur - 0.0001 && n < 256) {
        const [freq, qb] = cfg.leadLine[(startN + n) % cfg.leadLine.length];
        const dur = qb * beat;
        playLead(lT, freq, Math.max(dur * 0.75, 0.04));
        lT += dur; used += dur; n++;
      }
    }

    // ── Pad chord (once per bar) ──
    if (cfg.pads) playPad(barT, cfg.pads, barDur * 0.88);
  }
}

// ════════════════════════════════════════════════
//  GAME STATE
// ════════════════════════════════════════════════
let phase = 'title';
let curLevel = 1;
let score = 0, combo = 0, maxCombo = 0;
let perfCnt = 0, goodCnt = 0, missCnt = 0;
let hp = 100;
let feverActive = false;
let autoPlay = false;
let practiceMode = false;
let lastMultTier = 1;
let beatmap = null;
const heldLanes = [false, false, false, false];
let t0 = 0, pausedAt = 0, gameT = 0;
let raf = null;

const TRAVEL   = 1.55;
const PERF_W   = 0.075;
const GOOD_W   = 0.145;
const MISS_CUT = 0.22;
const HP_DRAIN = 5;   // HP lost per miss (dead at 0 = 20 misses)

const _saved = JSON.parse(localStorage.getItem('rmSettings') || '{}');
let speedMult = _saved.speed || 1.0;
let volMuted  = !!_saved.muted;

let progress = JSON.parse(localStorage.getItem('rmProgress') || '{}');

let achievements = new Set(JSON.parse(localStorage.getItem('rmAchievements') || '[]'));
let achQueue = [], achTimer = null;

const ACHIEVEMENTS = [
  { id:'play1',    icon:'🎵', name:'첫 시작'     },
  { id:'fever',    icon:'🔥', name:'피버!'        },
  { id:'combo100', icon:'💯', name:'100 콤보'    },
  { id:'stars3',   icon:'⭐', name:'별 세 개'    },
  { id:'srank',    icon:'🏆', name:'S 랭크'      },
  { id:'acc95',    icon:'🎯', name:'정밀한 타격'  },
  { id:'speed2x',  icon:'⚡', name:'스피드 킬러'  },
  { id:'master',   icon:'👑', name:'리듬 마스터'  },
];

// ════════════════════════════════════════════════
//  DOM
// ════════════════════════════════════════════════
const $   = id => document.getElementById(id);
const laneEls = Array.from(document.querySelectorAll('.lane'));
const gameArea = $('game-area');

function hitZoneY() { return gameArea.clientHeight - 82; }

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  if (name === 'title') initTitleCanvas();
  else stopTitleCanvas();
}

// ════════════════════════════════════════════════
//  TITLE CANVAS ANIMATION
// ════════════════════════════════════════════════
let titleAnim = null;
const titleNotes = [];
const MUSIC_SYMS = ['♩','♪','♫','♬'];
const MUSIC_COLS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#d400ff','#ff8c42'];

function makeTitleNote(atBottom) {
  const tc = $('title-canvas');
  const w = tc ? tc.width : window.innerWidth, h = tc ? tc.height : window.innerHeight;
  return {
    x: 8 + Math.random() * (w - 16),
    y: atBottom ? h + 16 + Math.random() * h * 0.4 : Math.random() * h,
    sym: MUSIC_SYMS[Math.floor(Math.random() * MUSIC_SYMS.length)],
    color: MUSIC_COLS[Math.floor(Math.random() * MUSIC_COLS.length)],
    size: 10 + Math.random() * 18,
    speed: 0.2 + Math.random() * 0.32,
    drift: (Math.random() - 0.5) * 0.18,
    alpha: 0.04 + Math.random() * 0.09,
  };
}

function initTitleCanvas() {
  const tc = $('title-canvas');
  if (!tc) return;
  const tCtx = tc.getContext('2d');
  tc.width  = window.innerWidth;
  tc.height = window.innerHeight;
  if (titleAnim) cancelAnimationFrame(titleAnim);
  if (titleNotes.length === 0) {
    for (let i = 0; i < 22; i++) titleNotes.push(makeTitleNote(false));
  }
  function draw() {
    const w = tc.width, h = tc.height;
    tCtx.clearRect(0, 0, w, h);
    for (let i = titleNotes.length - 1; i >= 0; i--) {
      const n = titleNotes[i];
      n.y -= n.speed; n.x += n.drift;
      tCtx.save();
      tCtx.globalAlpha = n.alpha;
      tCtx.font = `${n.size}px serif`;
      tCtx.fillStyle = n.color;
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';
      tCtx.fillText(n.sym, n.x, n.y);
      tCtx.restore();
      if (n.y < -20) { titleNotes.splice(i, 1); titleNotes.push(makeTitleNote(true)); }
    }
    titleAnim = requestAnimationFrame(draw);
  }
  draw();
}

function stopTitleCanvas() {
  if (titleAnim) { cancelAnimationFrame(titleAnim); titleAnim = null; }
  titleNotes.length = 0;
  const tc = $('title-canvas');
  if (tc) tc.getContext('2d').clearRect(0, 0, tc.width, tc.height);
}

// ════════════════════════════════════════════════
//  BACKGROUND CANVAS
// ════════════════════════════════════════════════
let bgCanvas, bgCtx;
// Level accent colors for background pulse
const LV_COLORS = [
  [77,150,255], [77,207,255], [107,203,119], [155,255,107], [255,217,61],
  [255,179,71], [255,140,66], [255,107,107], [255,61,154], [212,0,255],
];

function initBgCanvas() {
  bgCanvas = $('bg-canvas');
  bgCtx = bgCanvas.getContext('2d');
  sizeBgCanvas();
  window.addEventListener('resize', sizeBgCanvas);
}

function sizeBgCanvas() {
  if (!bgCanvas) return;
  bgCanvas.width  = bgCanvas.clientWidth  || window.innerWidth;
  bgCanvas.height = bgCanvas.clientHeight || window.innerHeight;
}

// rings[] tracks active beat rings: { r, maxR, alpha }
let rings = [];
let lastBeatIdx = -1;

function triggerBeatRing(isKick) {
  const w = bgCanvas.width, h = bgCanvas.height;
  rings.push({ x: w / 2, y: h * 0.82, r: 10, maxR: Math.max(w, h) * 0.7, alpha: isKick ? 0.45 : 0.25, kick: isKick });
  if (rings.length > 8) rings.shift();
}

function drawBackground(beatPhase) {
  if (!bgCtx) return;
  const ctx = bgCtx;
  const w = bgCanvas.width, h = bgCanvas.height;
  const [r, g, b] = LV_COLORS[curLevel - 1];

  ctx.clearRect(0, 0, w, h);

  // Subtle grid dots
  const gridStep = 40;
  ctx.fillStyle = `rgba(${r},${g},${b},0.04)`;
  for (let x = gridStep / 2; x < w; x += gridStep) {
    for (let y = gridStep / 2; y < h; y += gridStep) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Center beat pulse (radiates from hit zone)
  const pulse = Math.max(0, 1 - beatPhase * 2.5);
  if (pulse > 0) {
    const grad = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 1.2);
    grad.addColorStop(0, `rgba(${r},${g},${b},${pulse * 0.18})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Expanding rings
  rings = rings.filter(ring => ring.r < ring.maxR);
  for (const ring of rings) {
    const progress = ring.r / ring.maxR;
    const a = ring.alpha * (1 - progress);
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
    ctx.lineWidth = ring.kick ? 2.5 : 1.5;
    ctx.stroke();
    ring.r += ring.kick ? 12 : 8;
  }
}

// ════════════════════════════════════════════════
//  TITLE
// ════════════════════════════════════════════════
const COLORS = ['#4d96ff','#4dcfff','#6bcb77','#9bff6b','#ffd93d',
                '#ffb347','#ff8c42','#ff6b6b','#ff3d9a','#d400ff'];
const DIFF   = ['입문','쉬움','쉬움+','보통','보통+','어려움','어려움+','고급','고급+','BOSS'];

function fmtScore(n) {
  if (n >= 100000) return Math.floor(n / 1000) + 'k';
  if (n >= 10000)  return (n / 1000).toFixed(1) + 'k';
  return n ? n.toLocaleString() : '';
}

function getMultiplier(c) {
  if (c >= 50) return { mult: 8, label: '×8', color: '#ff6b6b' };
  if (c >= 25) return { mult: 4, label: '×4', color: '#d400ff' };
  if (c >= 10) return { mult: 2, label: '×2', color: '#4d96ff' };
  return { mult: 1, label: '×1', color: 'rgba(255,255,255,.28)' };
}

function countNotes(lvIdx) {
  const cfg = LV[lvIdx];
  let total = 0;
  for (let bar = 0; bar < cfg.bars; bar++) {
    const grid = cfg.noteGrid[bar % cfg.noteGrid.length];
    total += grid.filter(v => v >= 0).length;
  }
  return total;
}

function buildTitle() {
  const grid = $('level-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'lbtn';
    const unlocked = i === 1 || progress[i - 1]?.cleared;
    const p = progress[i] || {};
    const stars = p.stars || 0;
    const best  = fmtScore(p.best || 0);
    btn.style.setProperty('--c', unlocked ? COLORS[i - 1] : '#333');
    btn.setAttribute('data-diff', DIFF[i - 1]);
    if (unlocked) {
      btn.innerHTML =
        `<span style="font-size:1.05rem;font-weight:900">${i}</span>` +
        `<span class="lv-stars" style="color:${COLORS[i-1]}">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>` +
        `<span class="lv-diff" style="color:${COLORS[i-1]}">${DIFF[i-1]}</span>` +
        `<span class="lv-count">${countNotes(i-1)}N</span>` +
        (best ? `<span class="lv-best">${best}</span>` : '');
      btn.addEventListener('click', () => startGame(i));
    } else {
      btn.classList.add('locked');
      btn.removeAttribute('data-diff');
      btn.innerHTML = `<span style="font-size:1.1rem">🔒</span>`;
    }
    grid.appendChild(btn);
  }
  buildAchievementBadges();
  updateTitleStats();
}

function updateTitleStats() {
  const el = $('title-stats');
  if (!el) return;
  const s = JSON.parse(localStorage.getItem('rmStats') || '{}');
  if (!s.totalPlays) { el.style.display = 'none'; return; }
  const totalNotes = (s.totalPerfect || 0) + (s.totalGood || 0) + (s.totalMiss || 0);
  el.style.display = 'block';
  el.textContent = `플레이 ${s.totalPlays}회 · 최고 콤보 ${s.bestCombo || 0} · 노트 ${totalNotes.toLocaleString()}개`;
}

// ════════════════════════════════════════════════
//  GAME START
// ════════════════════════════════════════════════
function startGame(level) {
  initAC(); resumeAC();
  unlockAchievement('play1');
  initBgCanvas();
  curLevel = level;
  score = combo = maxCombo = perfCnt = goodCnt = missCnt = 0;
  hp = 100;
  clearFever();
  beatmap = buildBeatmap(level - 1);
  phase = 'countdown';
  rings = [];
  lastBeatIdx = -1;

  $('lv-disp').textContent    = `LEVEL ${level}`;
  $('bpm-disp').textContent   = `${LV[level-1].bpm} BPM`;
  $('score-disp').textContent = '0';
  $('combo-disp').textContent = '';
  $('acc-disp').textContent   = '100%';
  $('progress-bar').style.width = '0%';
  $('pause-btn').textContent  = '일시정지';
  $('pause-overlay').classList.remove('active');
  $('fc-banner').style.display = 'none';
  $('milestone').style.display = 'none';
  $('beat-flash').className   = '';
  const hpBar = $('hp-bar');
  if (hpBar) { hpBar.style.width = '100%'; hpBar.classList.remove('danger'); }
  const lrEl = $('live-rank');
  if (lrEl) { lrEl.textContent = 'S'; lrEl.style.color = '#ffd93d'; }
  heldLanes.fill(false);
  lastMultTier = 1;
  const mEl = $('mult-disp');
  if (mEl) { mEl.textContent = '×1'; mEl.style.color = 'rgba(255,255,255,.28)'; mEl.classList.remove('tier-up'); }
  const pb = $('practice-badge');
  if (pb) pb.classList.toggle('show', practiceMode);

  gameArea.querySelectorAll('.note,.judg,.pt').forEach(e => e.remove());
  showScreen('game');
  if (level === 10) showBossIntro(() => countdown(3, launchGame));
  else countdown(3, launchGame);
}

function launchGame() {
  phase = 'playing';
  t0 = performance.now();
  const acStart = AC.currentTime + 0.06;
  scheduleAudioForLevel(curLevel - 1, acStart);
  raf = requestAnimationFrame(gameLoop);
}

function showBossIntro(cb) {
  const el = document.createElement('div');
  el.id = 'boss-intro';
  el.innerHTML =
    '<div class="bi-spark">⚡</div>' +
    '<div class="bi-label">BOSS STAGE</div>' +
    '<div class="bi-name">리듬마스터 BOSS</div>' +
    '<div class="bi-bpm">160 BPM</div>';
  $('screen-game').appendChild(el);
  if (AC) {
    const t = AC.currentTime + 0.06;
    playBass(t, N.C2, 0.5); playBass(t + 0.14, N.G2, 0.42); playBass(t + 0.26, N.C3, 0.36);
    playLead(t + 0.4, N.C5, 0.42, 0.38); playLead(t + 0.6, N.G5, 0.52, 0.44);
    playPad(t + 0.2, [N.C4, N.Eb4, N.G4, N.Bb4], 1.2);
  }
  setTimeout(() => {
    el.classList.add('bi-out');
    el.addEventListener('animationend', () => { el.remove(); cb(); }, { once: true });
  }, 1750);
}

function countdown(n, cb) {
  const el = $('countdown');
  el.style.display = 'block';
  el.textContent = n > 0 ? String(n) : 'GO!';
  el.style.animation = 'none'; void el.offsetWidth;
  el.style.animation = 'countPop .75s ease-out forwards';
  countdownSfx(n);
  setTimeout(() => { n > 0 ? countdown(n - 1, cb) : (el.style.display = 'none', cb()); }, n > 0 ? 780 : 560);
}

function togglePause() {
  if (phase === 'playing') {
    phase = 'paused'; pausedAt = performance.now();
    if (raf) cancelAnimationFrame(raf);
    if (AC && AC.state === 'running') AC.suspend();
    $('po-lv').textContent = `LEVEL ${curLevel} — ${LV[curLevel-1].title}`;
    $('pause-overlay').classList.add('active');
  } else if (phase === 'paused') {
    phase = 'playing'; t0 += performance.now() - pausedAt;
    $('pause-overlay').classList.remove('active');
    if (AC && AC.state === 'suspended') AC.resume();
    raf = requestAnimationFrame(gameLoop);
  }
}

window.pauseRetry = function() {
  $('pause-overlay').classList.remove('active');
  startGame(curLevel);
};
window.pauseQuit = function() {
  $('pause-overlay').classList.remove('active');
  window.goTitle();
};

// ════════════════════════════════════════════════
//  GAME LOOP
// ════════════════════════════════════════════════
function gameLoop(ts) {
  if (phase !== 'playing') return;
  gameT = (ts - t0) / 1000;
  const hz = hitZoneY();
  const cfg = LV[curLevel - 1];
  const beatDur = 60 / cfg.bpm;

  // ── Beat tracking (for visualizer) ──
  const beatIdx = Math.floor(gameT / beatDur);
  const beatPhase = (gameT % beatDur) / beatDur;

  if (beatIdx !== lastBeatIdx && gameT > 0) {
    lastBeatIdx = beatIdx;
    const drumSlot = (beatIdx * 4) % 16;
    const d = cfg.drums[drumSlot] || '';
    triggerBeatRing(d.includes('K'));
    // Screen edge flash
    const flash = $('beat-flash');
    flash.className = d.includes('K') ? 'kick' : d.includes('S') ? 'snare' : '';
    setTimeout(() => { if (flash) flash.className = ''; }, 80);
    // Hit zone pulse on every beat
    document.querySelectorAll('.hit-zone').forEach(hz => {
      hz.classList.remove('beat-pulse');
      void hz.offsetWidth;
      hz.classList.add('beat-pulse');
      setTimeout(() => hz.classList.remove('beat-pulse'), 200);
    });
  }

  // ── Draw background ──
  drawBackground(beatPhase);

  // ── Update notes ──
  const travelTime = TRAVEL / speedMult;
  const tailClr = ['rgba(255,107,107,.7)','rgba(255,217,61,.7)','rgba(107,203,119,.7)','rgba(77,150,255,.7)'];
  for (const note of beatmap.notes) {
    if (note.hit || note.missed) {
      if (note.el)   { note.el.remove();   note.el   = null; }
      if (note.tailEl) { note.tailEl.remove(); note.tailEl = null; }
      continue;
    }
    const until = note.time - gameT;

    if (!note.el && until <= travelTime) {
      note.el = document.createElement('div');
      note.el.className = `note note-${note.lane}`;
      if (note.type === 'hold') {
        note.el.classList.add('hold');
        note.tailEl = document.createElement('div');
        note.tailEl.className = 'hold-tail';
        note.tailEl.style.background = tailClr[note.lane];
        note.el.appendChild(note.tailEl);
      }
      laneEls[note.lane].appendChild(note.el);
    }

    if (note.el) {
      const prog = 1 - until / travelTime;
      note.el.style.top = (prog * hz - 23) + 'px';
      if (until > 0 && until < 0.55 && !note.holding) {
        const g = 1 - until / 0.55;
        note.el.style.filter = `brightness(${(1 + g * 1.15).toFixed(2)})`;
      } else if (!note.holding && note.el.style.filter) {
        note.el.style.filter = '';
      }
      if (note.type === 'hold' && note.tailEl) {
        const tailH = Math.max(4, Math.round((note.endTime - note.time) / travelTime * hz));
        note.tailEl.style.height = tailH + 'px';
        if (note.holding) {
          const hp2 = Math.min((gameT - note.time) / (note.endTime - note.time), 1);
          note.tailEl.style.opacity = (0.7 - hp2 * 0.55).toFixed(2);
        }
      }
    }

    // Hold completion
    if (note.type === 'hold' && note.holding && gameT >= note.endTime) {
      note.hit = true; note.holding = false;
      heldLanes[note.lane] = false;
      const { mult } = getMultiplier(combo);
      score += Math.round(100 * mult);
      showJudg('HOLD!', 'perfect', note.lane);
      spawnParticles(note.lane);
      updateHUD(); updateLiveRank();
    } else if (note.type === 'hold' && !note.holding && until < -MISS_CUT) {
      note.missed = true;
      if (note.el)   { note.el.remove();   note.el   = null; }
      if (note.tailEl) { note.tailEl.remove(); note.tailEl = null; }
      registerMiss(note.lane);
    } else if (!note.type && until < -MISS_CUT) {
      note.missed = true;
      if (note.el) { note.el.remove(); note.el = null; }
      registerMiss(note.lane);
    }
  }

  $('progress-bar').style.width = Math.min(gameT / beatmap.totalTime * 100, 100) + '%';

  // Auto-play: hit every note at its exact time
  if (autoPlay) {
    for (const note of beatmap.notes) {
      if (note.hit || note.missed) continue;
      const nt = note.time - gameT;
      if (note.type === 'hold') {
        if (!note.holding && nt < 0.03 && nt > -0.03) onLaneHit(note.lane);
        // hold notes auto-complete via game loop (no release needed in auto-play)
      } else if (nt < 0.03 && nt > -0.03) {
        onLaneHit(note.lane);
      }
    }
  }

  if (beatmap.notes.every(n => n.hit || n.missed) || gameT > beatmap.totalTime + 1.8) {
    endGame(); return;
  }
  raf = requestAnimationFrame(gameLoop);
}

// ════════════════════════════════════════════════
//  INPUT
// ════════════════════════════════════════════════
function onLaneHit(lane) {
  if (phase !== 'playing') return;
  initAC(); resumeAC();

  laneEls[lane].classList.add('lit');
  setTimeout(() => laneEls[lane].classList.remove('lit'), 110);

  let best = null, bestDiff = Infinity;
  for (const note of beatmap.notes) {
    if (note.lane !== lane || note.hit || note.missed) continue;
    const diff = Math.abs(note.time - gameT);
    if (diff < bestDiff && diff < GOOD_W) { bestDiff = diff; best = note; }
  }
  if (!best) return;

  const isHold = best.type === 'hold';
  if (isHold) {
    best.holding = true;
    heldLanes[best.lane] = best;
    if (best.el) best.el.classList.add('holding');
  } else {
    best.hit = true;
    if (best.el) { best.el.remove(); best.el = null; }
  }

  combo++;
  if (combo > maxCombo) maxCombo = combo;
  const { mult } = getMultiplier(combo);

  const timing = best.time - gameT; // positive = early, negative = late

  if (bestDiff <= PERF_W) {
    perfCnt++;
    const pts = Math.round(100 * mult);
    score += pts;
    showJudg(isHold ? 'HOLD▼' : 'PERFECT!', 'perfect', lane);
    showScorePopup(pts, 'perfect', lane);
    hitSfx('perfect');
    addTimingTick(timing, 'perfect');
  } else {
    goodCnt++;
    const pts = Math.round(50 * mult);
    score += pts;
    showJudg(isHold ? 'HOLD▼' : 'GOOD', 'good', lane, timing);
    showScorePopup(pts, 'good', lane);
    hitSfx('good');
    addTimingTick(timing, 'good');
  }

  spawnParticles(lane);
  updateHUD();
  updateLiveRank();
}

function registerMiss(lane) {
  missCnt++; combo = 0;
  if (!practiceMode) hp = Math.max(0, hp - HP_DRAIN);
  showJudg('MISS', 'miss', lane);
  hitSfx('miss');
  updateHUD();
  updateHpBar();
  updateLiveRank();
  // Screen shake
  const sg = $('screen-game');
  sg.classList.remove('shake');
  void sg.offsetWidth;
  sg.classList.add('shake');
  // HP = 0 → early fail with game over overlay (skipped in practice mode)
  if (!practiceMode && hp <= 0) {
    phase = 'gameover';
    showGameOver();
    setTimeout(() => endGame(), 950);
  }
}

function onLaneRelease(lane) {
  if (phase !== 'playing') return;
  heldLanes[lane] = false;
  for (const note of beatmap.notes) {
    if (note.type === 'hold' && note.holding && note.lane === lane) {
      note.holding = false;
      if (note.el) note.el.classList.remove('holding');
      // Mark as hit so the miss check won't fire; hold bonus not earned
      note.hit = true;
    }
  }
}

// ════════════════════════════════════════════════
//  HP & LIVE RANK
// ════════════════════════════════════════════════
function updateHpBar() {
  const bar = $('hp-bar');
  if (!bar) return;
  bar.style.width = Math.max(hp, 0) + '%';
  bar.classList.toggle('danger', hp <= 30);
}

function liveGrade() {
  const tot = perfCnt + goodCnt + missCnt;
  if (!tot) return { g: 'S', c: '#ffd93d' };
  const acc = (perfCnt + goodCnt * 0.5) / tot * 100;
  if (missCnt === 0 && acc >= 99) return { g: 'S', c: '#ffd93d' };
  if (acc >= 90)  return { g: 'A', c: '#6bcb77' };
  if (acc >= 75)  return { g: 'B', c: '#4d96ff' };
  if (acc >= 60)  return { g: 'C', c: '#ffb347' };
  return           { g: 'D', c: '#ff6b6b' };
}

function updateLiveRank() {
  const { g, c } = liveGrade();
  const el = $('live-rank');
  if (el) { el.textContent = g; el.style.color = c; }
}

// ════════════════════════════════════════════════
//  VISUAL FEEDBACK
// ════════════════════════════════════════════════
function showJudg(text, type, lane, timing = null) {
  const el = document.createElement('div');
  el.className = `judg judg-${type}`;
  el.textContent = text;
  if (timing !== null && type === 'good') {
    const hint = document.createElement('span');
    hint.className = 'judg-timing';
    hint.textContent = timing > 0 ? '▶ EARLY' : 'LATE ◀';
    el.appendChild(hint);
  }
  el.style.bottom = '92px';
  laneEls[lane].appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function showScorePopup(pts, type, lane) {
  const el = document.createElement('div');
  el.className = `sc-pop sc-${type}`;
  el.textContent = '+' + pts;
  el.style.bottom = '88px';
  laneEls[lane].appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function spawnParticles(lane) {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff'];
  const col = colors[lane];
  const hz = hitZoneY();
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'pt';
    const tx = (Math.random() - 0.5) * 90;
    const ty = -(20 + Math.random() * 65);
    const d  = 0.28 + Math.random() * 0.32;
    p.style.cssText =
      `background:${col};left:${10 + Math.random() * 80}%;top:${hz - 3}px;` +
      `--x:${tx}px;--y:${ty}px;--d:${d}s`;
    laneEls[lane].appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

const MILESTONES = [10, 25, 50, 100, 150, 200, 300, 500];
const MILESTONE_LABELS = {
  10:'10콤보!', 25:'25콤보!', 50:'50콤보!!', 100:'100콤보!!!',
  150:'150콤보!!!', 200:'200콤보!!!!', 300:'300콤보!!!!!', 500:'MAX콤보!!!!!'
};

function updateHUD() {
  $('score-disp').textContent = score.toLocaleString();
  const c = $('combo-disp');
  if (combo >= 2) {
    c.textContent = combo + 'x';
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  } else { c.textContent = ''; }
  const tot = perfCnt + goodCnt + missCnt;
  const acc = tot ? Math.round((perfCnt + goodCnt * 0.5) / tot * 100) : 100;
  $('acc-disp').textContent = acc + '%';

  // Full combo banner (no misses so far)
  if (missCnt === 0 && combo >= 5) {
    $('fc-banner').style.display = 'block';
  } else if (missCnt > 0) {
    $('fc-banner').style.display = 'none';
  }

  // Fever mode threshold
  if (combo >= 50) triggerFever();
  else if (feverActive) clearFever();
  if (combo === 100) unlockAchievement('combo100');

  // Multiplier tier display
  const mInfo = getMultiplier(combo);
  const mEl = $('mult-disp');
  if (mEl) {
    mEl.textContent = mInfo.label;
    mEl.style.color = mInfo.color;
    if (mInfo.mult !== lastMultTier) {
      lastMultTier = mInfo.mult;
      mEl.classList.remove('tier-up');
      void mEl.offsetWidth;
      mEl.classList.add('tier-up');
    }
  }

  // Milestone popup
  if (MILESTONES.includes(combo)) {
    const el = $('milestone');
    const [r, g, b] = LV_COLORS[curLevel - 1];
    el.textContent = MILESTONE_LABELS[combo];
    el.style.color = `rgb(${r},${g},${b})`;
    el.style.textShadow = `0 0 30px rgba(${r},${g},${b},.9)`;
    el.style.display = 'block';
    el.style.animation = 'none'; void el.offsetWidth;
    el.style.animation = 'milestoneAnim .9s ease-out forwards';
    el.addEventListener('animationend', () => { el.style.display = 'none'; }, { once: true });
  }
}

// ════════════════════════════════════════════════
//  END GAME / RESULT
// ════════════════════════════════════════════════
function endGame() {
  phase = 'result';
  if (raf) cancelAnimationFrame(raf);

  const tot = perfCnt + goodCnt + missCnt;
  const acc = tot ? Math.round((perfCnt + goodCnt * 0.5) / tot * 100) : 100;

  let grade, gColor;
  if (missCnt === 0 && acc >= 99) { grade = 'S'; gColor = '#ffd93d'; }
  else if (acc >= 90)              { grade = 'A'; gColor = '#6bcb77'; }
  else if (acc >= 75)              { grade = 'B'; gColor = '#4d96ff'; }
  else if (acc >= 60)              { grade = 'C'; gColor = '#ffb347'; }
  else                             { grade = 'D'; gColor = '#ff6b6b'; }

  const stars   = (missCnt === 0 && acc >= 95) ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0;
  const cleared = acc >= 60;

  let prev = {};
  if (!autoPlay && !practiceMode) {
    prev = progress[curLevel] || {};
    progress[curLevel] = { cleared, stars: Math.max(prev.stars || 0, stars), best: Math.max(prev.best || 0, score) };
    localStorage.setItem('rmProgress', JSON.stringify(progress));
    const gStats = JSON.parse(localStorage.getItem('rmStats') || '{}');
    gStats.totalPlays   = (gStats.totalPlays   || 0) + 1;
    gStats.totalPerfect = (gStats.totalPerfect || 0) + perfCnt;
    gStats.totalGood    = (gStats.totalGood    || 0) + goodCnt;
    gStats.totalMiss    = (gStats.totalMiss    || 0) + missCnt;
    gStats.bestCombo    = Math.max(gStats.bestCombo || 0, maxCombo);
    localStorage.setItem('rmStats', JSON.stringify(gStats));
  }

  clearFever();
  if (cleared && !autoPlay && !practiceMode) {
    if (stars >= 3)          unlockAchievement('stars3');
    if (grade === 'S')       unlockAchievement('srank');
    if (acc >= 95)           unlockAchievement('acc95');
    if (speedMult >= 2)      unlockAchievement('speed2x');
    if (curLevel === 10)     unlockAchievement('master');
  }

  // Demo mode: play jingle and return to title (no result screen)
  if (autoPlay) {
    autoPlay = false;
    const isDemoFC = missCnt === 0;
    playJingle(isDemoFC ? 'fc' : cleared ? 'clear' : 'fail');
    if (isDemoFC || stars >= 3) setTimeout(spawnConfetti, 650);
    setTimeout(() => window.goTitle(), 2400);
    return;
  }

  const isFC = missCnt === 0;
  const isNewRecord = !practiceMode && cleared && score > 0 && score > (prev.best || 0);

  // Static text (shown immediately)
  const practiceTag = practiceMode ? ' (연습)' : '';
  $('res-title').textContent  = (isFC ? 'FULL COMBO!' : (cleared ? 'CLEAR!' : 'FAILED')) + practiceTag;
  $('res-title').style.color  = isFC ? '#ffd93d' : (cleared ? '#6bcb77' : '#ff6b6b');
  $('res-lv').textContent     = `LEVEL ${curLevel} — ${LV[curLevel-1].title}`;
  $('s-perf').textContent     = perfCnt;
  $('s-good').textContent     = goodCnt;
  $('s-miss').textContent     = missCnt;
  $('s-combo').textContent    = maxCombo;
  $('s-acc').textContent      = acc + '%';
  $('s-rank').textContent     = grade;
  $('s-rank').style.color     = gColor;

  const nb = $('next-btn');
  if (cleared && curLevel < 10) { nb.style.display = ''; nb.textContent = `레벨 ${curLevel + 1} →`; }
  else { nb.style.display = 'none'; }

  // Prep animated elements before screen switch
  $('res-score').textContent = '0';
  $('res-stars').innerHTML   = '';
  const nrEl = $('new-record');
  if (nrEl) { nrEl.textContent = ''; nrEl.classList.remove('show'); }
  const gradeEl = $('res-grade');
  gradeEl.textContent = grade;
  gradeEl.style.color = gColor;
  gradeEl.classList.remove('animate');

  playJingle(isFC ? 'fc' : cleared ? 'clear' : 'fail');
  showScreen('result');

  // ── Grade zoom-in ──
  void gradeEl.offsetWidth;
  gradeEl.classList.add('animate');

  // ── Stars reveal one by one ──
  const starFreqs = [523.25, 783.99, 1046.50];
  for (let i = 1; i <= 3; i++) {
    const s = document.createElement('span');
    s.className = 'res-star ' + (i <= stars ? 'earned' : 'empty');
    s.textContent = i <= stars ? '★' : '☆';
    s.style.color = i <= stars ? '#ffd93d' : '';
    if (i > stars) s.style.opacity = '0.22';
    $('res-stars').appendChild(s);
    if (i <= stars) {
      setTimeout(() => {
        s.classList.add('pop');
        if (AC) playLead(AC.currentTime + 0.01, starFreqs[i - 1], 0.13, 0.28);
      }, 280 + i * 210);
    }
  }

  // ── Score count-up ──
  const finalScore = score;
  const countDur = Math.min(1400, 500 + finalScore / 400);
  let countStart = null;
  function animScore(ts) {
    if (countStart === null) countStart = ts + 520;
    if (ts < countStart) { requestAnimationFrame(animScore); return; }
    const t = Math.min((ts - countStart) / countDur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    $('res-score').textContent = Math.round(finalScore * ease).toLocaleString();
    if (t < 1) requestAnimationFrame(animScore);
  }
  requestAnimationFrame(animScore);

  // ── NEW RECORD badge ──
  if (nrEl && isNewRecord) {
    nrEl.textContent = '★ NEW RECORD ★';
    setTimeout(() => nrEl.classList.add('show'), 950);
  }

  // ── Level unlock notification ──
  const unBan = $('unlock-banner');
  if (unBan) {
    unBan.textContent = '';
    unBan.classList.remove('show');
    if (!practiceMode && !prev.cleared && cleared && curLevel < 10) {
      unBan.textContent = `🔓 LEVEL ${curLevel + 1} UNLOCKED!`;
      unBan.style.color = COLORS[curLevel];
      setTimeout(() => { void unBan.offsetWidth; unBan.classList.add('show'); }, 900);
    }
  }

  // ── Confetti (FC or 3-star) ──
  if (isFC || stars >= 3) setTimeout(spawnConfetti, 650);
}

// ════════════════════════════════════════════════
//  ACHIEVEMENTS
// ════════════════════════════════════════════════
function unlockAchievement(id) {
  if (achievements.has(id)) return;
  achievements.add(id);
  localStorage.setItem('rmAchievements', JSON.stringify([...achievements]));
  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (def) { achQueue.push(def); scheduleAch(); }
}

function scheduleAch() {
  if (achTimer || achQueue.length === 0) return;
  const def = achQueue.shift();
  showAchPopup(def);
  achTimer = setTimeout(() => { achTimer = null; scheduleAch(); }, 2900);
}

function showAchPopup(def) {
  const el = document.createElement('div');
  el.className = 'ach-popup';
  el.innerHTML =
    `<span style="font-size:1.8rem;flex-shrink:0">${def.icon}</span>` +
    `<div><div class="ach-name">${def.name}</div><div class="ach-tag">업적 달성!</div></div>`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2500);
}

function buildAchievementBadges() {
  const row = $('ach-row');
  if (!row) return;
  const earned = ACHIEVEMENTS.filter(a => achievements.has(a.id));
  if (earned.length === 0) { row.style.display = 'none'; return; }
  row.style.display = 'flex';
  row.innerHTML = earned.map(a =>
    `<span class="ach-badge" title="${a.name}">${a.icon}</span>`
  ).join('');
}

// ════════════════════════════════════════════════
//  TIMING BAR
// ════════════════════════════════════════════════
function addTimingTick(timing, type) {
  const bar = $('timing-bar');
  if (!bar) return;
  // timing > 0 = early (left), < 0 = late (right)
  const pos = 50 - (timing / GOOD_W) * 50;
  const tick = document.createElement('div');
  const cls = type === 'perfect' ? 'tp' : timing > 0 ? 'te' : 'tl';
  tick.className = `t-tick ${cls}`;
  tick.style.left = Math.max(1, Math.min(99, pos)) + '%';
  bar.appendChild(tick);
  tick.addEventListener('animationend', () => tick.remove());
}

// ════════════════════════════════════════════════
//  FEVER MODE
// ════════════════════════════════════════════════
function triggerFever() {
  const fb = $('fever-border');
  if (!fb || feverActive) return;
  feverActive = true;
  fb.classList.add('active');
  unlockAchievement('fever');
  const fp = document.createElement('div');
  fp.className = 'fever-popup';
  fp.textContent = '🔥 FEVER!';
  $('screen-game').appendChild(fp);
  fp.addEventListener('animationend', () => fp.remove());
  if (AC) {
    const t = AC.currentTime + 0.02;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) =>
      playLead(t + i * 0.055, f, 0.15, 0.4));
  }
}

function clearFever() {
  feverActive = false;
  const fb = $('fever-border');
  if (fb) fb.classList.remove('active');
}

function spawnConfetti() {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#d400ff','#ff8c42','#4dcfff','#fff'];
  for (let i = 0; i < 48; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-p';
      const isCircle = Math.random() > 0.45;
      const spin = (Math.random() > 0.5 ? '' : '-') + (360 + Math.floor(Math.random() * 360)) + 'deg';
      el.style.cssText = [
        `left:${Math.random() * 100}vw`,
        `width:${5 + Math.random() * 7}px`,
        `height:${5 + Math.random() * 7}px`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `border-radius:${isCircle ? '50%' : '3px'}`,
        `--dur:${1.1 + Math.random() * 1.2}s`,
        `--del:${Math.random() * 0.35}s`,
        `--dx:${(Math.random() - 0.5) * 150}px`,
        `--rot:${spin}`,
      ].join(';');
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 20);
  }
}

// ════════════════════════════════════════════════
//  GAME OVER OVERLAY
// ════════════════════════════════════════════════
function showGameOver() {
  if (raf) cancelAnimationFrame(raf);
  const ov = $('game-over-overlay');
  if (!ov) return;
  ov.classList.remove('active');
  void ov.offsetWidth;
  ov.classList.add('active');
  setTimeout(() => ov.classList.remove('active'), 940);
}

// ════════════════════════════════════════════════
//  SETTINGS: SPEED & VOLUME
// ════════════════════════════════════════════════
window.setSpeed = function(v) {
  speedMult = v;
  localStorage.setItem('rmSettings', JSON.stringify({ speed: speedMult, muted: volMuted }));
  document.querySelectorAll('.spd-btn').forEach(b => {
    b.classList.toggle('spd-active', parseFloat(b.dataset.v) === v);
  });
};

window.toggleVol = function() {
  initAC();
  volMuted = !volMuted;
  if (mGain) mGain.gain.value = volMuted ? 0 : 0.62;
  localStorage.setItem('rmSettings', JSON.stringify({ speed: speedMult, muted: volMuted }));
  const btn = $('vol-btn');
  if (btn) { btn.textContent = volMuted ? '🔇' : '🔊'; btn.classList.toggle('muted', volMuted); }
};

// ════════════════════════════════════════════════
//  GLOBAL BUTTONS
// ════════════════════════════════════════════════
window.goTitle = function () {
  if (raf) cancelAnimationFrame(raf);
  gameArea.querySelectorAll('.note,.judg,.pt').forEach(e => e.remove());
  phase = 'title'; buildTitle(); showScreen('title');
};

window.startDemo = function() {
  autoPlay = true;
  startGame(1);
};

window.togglePractice = function() {
  practiceMode = !practiceMode;
  const btn = $('practice-btn');
  if (btn) btn.classList.toggle('active', practiceMode);
};
window.retry  = function () { startGame(curLevel); };
window.goNext = function () { if (curLevel < 10) startGame(curLevel + 1); };

// ════════════════════════════════════════════════
//  EVENT LISTENERS
// ════════════════════════════════════════════════
laneEls.forEach((lane, i) => {
  lane.addEventListener('pointerdown',  e => { e.preventDefault(); onLaneHit(i); });
  lane.addEventListener('pointerup',    e => { e.preventDefault(); onLaneRelease(i); });
  lane.addEventListener('pointerleave', e => { onLaneRelease(i); });
});

const KEY_MAP = { KeyD:0, KeyF:1, KeyJ:2, KeyK:3, ArrowLeft:0, ArrowDown:1, ArrowUp:2, ArrowRight:3 };
document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const lane = KEY_MAP[e.code];
  if (lane !== undefined) { onLaneHit(lane); laneEls[lane].classList.add('lit'); }
  if ((e.code === 'Escape' || e.code === 'Space') && (phase === 'playing' || phase === 'paused')) {
    e.preventDefault(); togglePause();
  }
});
document.addEventListener('keyup', e => {
  const lane = KEY_MAP[e.code];
  if (lane !== undefined) { laneEls[lane].classList.remove('lit'); onLaneRelease(lane); }
});

$('pause-btn').addEventListener('click', togglePause);

// ════════════════════════════════════════════════
//  TITLE BEAT BARS (animated equalizer)
// ════════════════════════════════════════════════
function buildBeatBars() {
  const container = $('beat-bars');
  if (!container) return;
  container.innerHTML = '';
  const barColors = ['#ff6b6b','#ff8c42','#ffd93d','#6bcb77','#4d96ff',
                     '#6bcb77','#ffd93d','#ff8c42','#ff6b6b','#ff3d9a','#d400ff','#4d96ff'];
  barColors.forEach((col, i) => {
    const b = document.createElement('div');
    b.className = 'beat-bar';
    b.style.background = col;
    b.style.setProperty('--s', (0.4 + Math.random() * 0.6).toFixed(2) + 's');
    b.style.animationDelay = (i * 0.07).toFixed(2) + 's';
    container.appendChild(b);
  });
}

// ════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════
buildBeatBars();
buildTitle();
showScreen('title');
initTitleCanvas();

// Apply persisted settings to title UI
document.querySelectorAll('.spd-btn').forEach(b => {
  b.classList.toggle('spd-active', parseFloat(b.dataset.v) === speedMult);
});
const _vb = $('vol-btn');
if (_vb) { _vb.textContent = volMuted ? '🔇' : '🔊'; _vb.classList.toggle('muted', volMuted); }
