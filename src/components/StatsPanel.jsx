import './StatsPanel.css';

function StatBar({ label, value, color, icon }) {
  const pct = Math.max(0, Math.min(100, value));
  const level = pct > 60 ? 'high' : pct > 30 ? 'mid' : 'low';

  return (
    <div className="stat-row">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <div className="stat-track">
        <div
          className={`stat-fill stat-fill--${level}`}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="stat-value">{Math.floor(pct)}</span>
    </div>
  );
}

export default function StatsPanel({ state }) {
  const { hunger, happiness, energy, health, weight, age, isSick, poopCount } = state;

  const formatAge = (minutes) => {
    if (minutes < 1) return '방금 태어남';
    if (minutes < 60) return `${Math.floor(minutes)}분`;
    return `${Math.floor(minutes / 60)}시간 ${Math.floor(minutes % 60)}분`;
  };

  return (
    <div className="stats-panel">
      <StatBar label="배고픔" value={hunger}   color="#ff8c42" icon="🍔" />
      <StatBar label="행복도" value={happiness} color="#f7d44c" icon="😊" />
      <StatBar label="에너지" value={energy}    color="#7ecfb3" icon="⚡" />
      <StatBar label="건강도" value={health}    color="#e84393" icon="❤️" />

      <div className="stat-info-row">
        <span>⚖️ 체중: <strong>{weight}g</strong></span>
        <span>🕐 나이: <strong>{formatAge(age)}</strong></span>
        {isSick && <span className="badge sick-badge">🤒 아파요</span>}
        {poopCount > 0 && <span className="badge poop-badge">💩 ×{poopCount}</span>}
      </div>
    </div>
  );
}
