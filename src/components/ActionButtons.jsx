import './ActionButtons.css';

export default function ActionButtons({ state, onFeed, onPlay, onSleep, onClean, onMedicine }) {
  const { isSleeping, isSick, energy } = state;

  const buttons = [
    {
      id: 'meal',
      label: '밥주기',
      icon: '🍱',
      desc: '+배고픔',
      action: () => onFeed('meal'),
      disabled: isSleeping,
    },
    {
      id: 'snack',
      label: '간식',
      icon: '🍬',
      desc: '+행복',
      action: () => onFeed('snack'),
      disabled: isSleeping,
    },
    {
      id: 'play',
      label: '놀기',
      icon: '🎮',
      desc: '+행복',
      action: onPlay,
      disabled: isSleeping || energy < 20,
    },
    {
      id: 'sleep',
      label: isSleeping ? '깨우기' : '재우기',
      icon: isSleeping ? '☀️' : '🌙',
      desc: isSleeping ? '기상!' : '+에너지',
      action: onSleep,
      disabled: false,
      active: isSleeping,
    },
    {
      id: 'clean',
      label: '청소',
      icon: '🛁',
      desc: '+행복',
      action: onClean,
      disabled: isSleeping,
    },
    {
      id: 'medicine',
      label: '치료',
      icon: '💊',
      desc: '+건강',
      action: onMedicine,
      disabled: !isSick,
      highlight: isSick,
    },
  ];

  return (
    <div className="action-buttons">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          className={`action-btn ${btn.active ? 'active' : ''} ${btn.highlight ? 'highlight' : ''}`}
          onClick={btn.action}
          disabled={btn.disabled}
          title={btn.desc}
        >
          <span className="btn-icon">{btn.icon}</span>
          <span className="btn-label">{btn.label}</span>
          <span className="btn-desc">{btn.desc}</span>
        </button>
      ))}
    </div>
  );
}
