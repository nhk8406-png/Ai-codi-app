import './Pet.css';

const STAGE_CHARS = {
  egg:   { normal: '🥚', happy: '🥚', sad: '🥚', sick: '🥚', sleep: '🥚' },
  baby:  { normal: '🐣', happy: '🐣', sad: '😢', sick: '🤒', sleep: '😴' },
  child: { normal: '🐥', happy: '😄', sad: '😢', sick: '🤒', sleep: '😴' },
  teen:  { normal: '🐤', happy: '😆', sad: '😭', sick: '🤢', sleep: '😴' },
  adult: { normal: '🐔', happy: '😊', sad: '😿', sick: '🤢', sleep: '😴' },
  elder: { normal: '🦤', happy: '😊', sad: '😞', sick: '🤢', sleep: '😴' },
};

const STAGE_LABELS = {
  egg:   '알',
  baby:  '아기',
  child: '어린이',
  teen:  '청소년',
  adult: '어른',
  elder: '노인',
};

export default function Pet({ state, stageName }) {
  const { hunger, happiness, energy, isSick, isSleeping, isAlive, poopCount } = state;
  const chars = STAGE_CHARS[stageName] || STAGE_CHARS.egg;

  const getChar = () => {
    if (!isAlive) return '💀';
    if (isSleeping) return chars.sleep;
    if (isSick) return chars.sick;
    if (hunger < 25 || happiness < 25 || energy < 15) return chars.sad;
    if (happiness > 70) return chars.happy;
    return chars.normal;
  };

  const getAnimation = () => {
    if (!isAlive) return 'dead';
    if (isSleeping) return 'sleeping';
    if (isSick) return 'sick';
    if (hunger < 20 || energy < 15) return 'sad';
    if (happiness > 70) return 'happy';
    return 'idle';
  };

  const char = getChar();
  const anim = getAnimation();

  return (
    <div className="pet-container">
      <div className="stage-label">{STAGE_LABELS[stageName] || '알'}</div>
      <div className={`pet pet--${anim}`}>
        <span className="pet-char">{char}</span>
        {isSleeping && (
          <div className="zzz-container">
            <span className="zzz z1">z</span>
            <span className="zzz z2">z</span>
            <span className="zzz z3">Z</span>
          </div>
        )}
        {isSick && !isSleeping && (
          <div className="sick-particles">
            <span>💦</span><span>💦</span>
          </div>
        )}
      </div>
      {poopCount > 0 && (
        <div className="poop-row">
          {Array.from({ length: Math.min(poopCount, 5) }).map((_, i) => (
            <span key={i} className="poop">💩</span>
          ))}
        </div>
      )}
    </div>
  );
}
