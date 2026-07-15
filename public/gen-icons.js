// 아이콘 생성 스크립트 (Node.js + canvas)
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT = path.join(__dirname, "icons");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function drawIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext("2d");
  const s = size;

  // Background
  const bg = ctx.createLinearGradient(0, 0, s, s);
  bg.addColorStop(0, "#0d1a28");
  bg.addColorStop(1, "#1a0a00");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, s, s, s * 0.18);
  ctx.fill();

  // Green glow circle (ChatGPT aura)
  const glow = ctx.createRadialGradient(s * 0.35, s * 0.5, 0, s * 0.35, s * 0.5, s * 0.35);
  glow.addColorStop(0, "rgba(16,163,127,0.35)");
  glow.addColorStop(1, "rgba(16,163,127,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(s * 0.35, s * 0.5, s * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Boss body (right side, angry red face)
  ctx.fillStyle = "#6677aa";
  ctx.beginPath();
  ctx.roundRect(s * 0.5, s * 0.42, s * 0.38, s * 0.3, s * 0.06);
  ctx.fill();
  // Boss head (red angry)
  ctx.fillStyle = "#e84040";
  ctx.beginPath();
  ctx.ellipse(s * 0.69, s * 0.34, s * 0.17, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a02010";
  ctx.lineWidth = s * 0.015;
  ctx.stroke();
  // Boss angry eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(s * 0.63, s * 0.32, s * 0.04, s * 0.03, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * 0.75, s * 0.32, s * 0.04, s * 0.03, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.ellipse(s * 0.63, s * 0.32, s * 0.02, s * 0.02, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * 0.75, s * 0.32, s * 0.02, s * 0.02, 0, 0, Math.PI * 2); ctx.fill();
  // Boss V-brows
  ctx.strokeStyle = "#111"; ctx.lineWidth = s * 0.018; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(s * 0.59, s * 0.26); ctx.lineTo(s * 0.65, s * 0.29); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s * 0.71, s * 0.29); ctx.lineTo(s * 0.77, s * 0.26); ctx.stroke();
  // Boss shout mouth
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.ellipse(s * 0.69, s * 0.38, s * 0.06, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();

  // ChatGPT robot (left side)
  // Robot body
  const robGrad = ctx.createLinearGradient(s * 0.05, s * 0.4, s * 0.42, s * 0.85);
  robGrad.addColorStop(0, "#1e3040");
  robGrad.addColorStop(1, "#0d1e2e");
  ctx.fillStyle = robGrad;
  ctx.beginPath();
  ctx.roundRect(s * 0.05, s * 0.48, s * 0.37, s * 0.38, s * 0.07);
  ctx.fill();
  ctx.strokeStyle = "#10a37f"; ctx.lineWidth = s * 0.02;
  ctx.stroke();
  // Robot head
  ctx.fillStyle = "#1a2a3a";
  ctx.beginPath();
  ctx.roundRect(s * 0.09, s * 0.24, s * 0.29, s * 0.26, s * 0.06);
  ctx.fill();
  ctx.strokeStyle = "#10a37f"; ctx.lineWidth = s * 0.018;
  ctx.stroke();
  // Robot antenna
  ctx.strokeStyle = "#10a37f"; ctx.lineWidth = s * 0.015;
  ctx.beginPath(); ctx.moveTo(s * 0.235, s * 0.24); ctx.lineTo(s * 0.235, s * 0.14); ctx.stroke();
  ctx.fillStyle = "#10a37f";
  ctx.beginPath(); ctx.arc(s * 0.235, s * 0.12, s * 0.025, 0, Math.PI * 2); ctx.fill();
  // Robot eyes (glowing green)
  const eyeGlow1 = ctx.createRadialGradient(s * 0.165, s * 0.35, 0, s * 0.165, s * 0.35, s * 0.05);
  eyeGlow1.addColorStop(0, "#80ffcc");
  eyeGlow1.addColorStop(1, "#10a37f");
  ctx.fillStyle = eyeGlow1;
  ctx.beginPath(); ctx.ellipse(s * 0.165, s * 0.35, s * 0.05, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  const eyeGlow2 = ctx.createRadialGradient(s * 0.305, s * 0.35, 0, s * 0.305, s * 0.35, s * 0.05);
  eyeGlow2.addColorStop(0, "#80ffcc");
  eyeGlow2.addColorStop(1, "#10a37f");
  ctx.fillStyle = eyeGlow2;
  ctx.beginPath(); ctx.ellipse(s * 0.305, s * 0.35, s * 0.05, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  // Robot mouth LED
  ctx.fillStyle = "#0a1a14";
  ctx.beginPath(); ctx.roundRect(s * 0.14, s * 0.43, s * 0.19, s * 0.04, s * 0.01); ctx.fill();
  ctx.fillStyle = "#10a37f";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(s * (0.155 + i * 0.05), s * 0.45, s * 0.012, 0, Math.PI * 2); ctx.fill();
  }
  // Robot chest screen
  ctx.fillStyle = "#0a1a14";
  ctx.beginPath(); ctx.roundRect(s * 0.1, s * 0.55, s * 0.27, s * 0.16, s * 0.04); ctx.fill();
  ctx.strokeStyle = "#10a37f"; ctx.lineWidth = s * 0.012; ctx.stroke();
  // Charge bar inside screen
  ctx.fillStyle = "#10a37f";
  ctx.beginPath(); ctx.roundRect(s * 0.115, s * 0.595, s * 0.17, s * 0.04, s * 0.01); ctx.fill();
  ctx.fillStyle = "#00ffcc";
  ctx.font = `bold ${Math.floor(s * 0.07)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("100%", s * 0.235, s * 0.65);

  // Beam from robot to boss
  ctx.save();
  ctx.globalAlpha = 0.85;
  // outer glow
  ctx.strokeStyle = "rgba(16,163,127,0.25)"; ctx.lineWidth = s * 0.06;
  ctx.beginPath(); ctx.moveTo(s * 0.42, s * 0.52); ctx.lineTo(s * 0.52, s * 0.38); ctx.stroke();
  // beam core
  ctx.strokeStyle = "#10a37f"; ctx.lineWidth = s * 0.025;
  ctx.beginPath(); ctx.moveTo(s * 0.42, s * 0.52); ctx.lineTo(s * 0.52, s * 0.38); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = s * 0.008;
  ctx.beginPath(); ctx.moveTo(s * 0.42, s * 0.52); ctx.lineTo(s * 0.52, s * 0.38); ctx.stroke();
  ctx.restore();

  // Hit sparks on boss
  const sparkCols = ["#ffcc00", "#ff7700", "#ffffff"];
  [[s*0.58, s*0.3],[s*0.72, s*0.22],[s*0.8, s*0.35]].forEach(([sx, sy], i) => {
    ctx.fillStyle = sparkCols[i % sparkCols.length];
    drawStar(ctx, sx, sy, s * 0.04, 5);
  });

  // Title text at bottom
  ctx.fillStyle = "#ffcc00";
  ctx.font = `bold ${Math.floor(s * 0.08)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("상사혼내기", s * 0.5, s * 0.94);

  return c.toBuffer("image/png");
}

function drawStar(ctx, cx, cy, r, pts) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = i * Math.PI / pts - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

for (const size of SIZES) {
  const buf = drawIcon(size);
  const fp = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(fp, buf);
  console.log(`✓ icon-${size}.png`);
}

// also make a simple screenshot placeholder
const sc = createCanvas(390, 844);
const sctx = sc.getContext("2d");
const sbg = sctx.createLinearGradient(0, 0, 390, 844);
sbg.addColorStop(0, "#0d1a28"); sbg.addColorStop(1, "#1a0a00");
sctx.fillStyle = sbg; sctx.fillRect(0, 0, 390, 844);
sctx.fillStyle = "#ffcc00";
sctx.font = "bold 36px Arial"; sctx.textAlign = "center";
sctx.fillText("직장상사 혼내기!", 195, 400);
sctx.fillStyle = "#10a37f";
sctx.font = "bold 22px Arial";
sctx.fillText("with ChatGPT", 195, 440);
fs.writeFileSync(path.join(OUT, "screenshot.png"), sc.toBuffer("image/png"));
console.log("✓ screenshot.png");
console.log("아이콘 생성 완료!");
