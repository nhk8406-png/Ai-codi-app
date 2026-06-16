import { useState, useEffect } from 'react';
import './InstallBanner.css';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) {
      setShow(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  if (installed || !show) return null;

  return (
    <div className="install-banner">
      <span className="install-icon">📱</span>
      {isIOS ? (
        <span className="install-text">
          홈 화면에 추가: <strong>공유 → 홈 화면에 추가</strong>
        </span>
      ) : (
        <span className="install-text">앱으로 설치하기</span>
      )}
      {!isIOS && (
        <button className="install-btn" onClick={install}>설치</button>
      )}
      <button className="install-close" onClick={() => setShow(false)}>✕</button>
    </div>
  );
}
