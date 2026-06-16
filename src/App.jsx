import { useGameState } from './hooks/useGameState';
import Pet from './components/Pet';
import StatsPanel from './components/StatsPanel';
import ActionButtons from './components/ActionButtons';
import './App.css';

export default function App() {
  const { state, stageName, feed, play, toggleSleep, clean, medicine, reset } = useGameState();
  const { isAlive, isDead, message, messageTimer, isSleeping } = state;

  return (
    <div className="device">
      <div className="device-top">
        <div className="device-ear ear-left" />
        <div className="device-screen-border">
          <div className="device-screen">
            {isDead ? (
              <div className="game-over">
                <div className="game-over-icon">💀</div>
                <h2>게임 오버</h2>
                <p>다마고치가 무지개 다리를 건넜어요...</p>
                <button className="restart-btn" onClick={reset}>
                  다시 시작 🥚
                </button>
              </div>
            ) : (
              <>
                <div className="screen-header">
                  <span className="title-text">다마고치</span>
                  {isSleeping && <span className="sleep-indicator">💤</span>}
                </div>

                <Pet state={state} stageName={stageName} />

                {messageTimer > 0 && message && (
                  <div className="message-bubble">
                    {message}
                  </div>
                )}

                <StatsPanel state={state} />
              </>
            )}
          </div>
        </div>
        <div className="device-ear ear-right" />
      </div>

      <div className="device-bottom">
        <div className="device-notch" />
        {!isDead && (
          <ActionButtons
            state={state}
            onFeed={feed}
            onPlay={play}
            onSleep={toggleSleep}
            onClean={clean}
            onMedicine={medicine}
          />
        )}
        <div className="device-footer">
          <button className="reset-small" onClick={reset} title="새 게임">
            🔄 새 게임
          </button>
        </div>
      </div>
    </div>
  );
}
