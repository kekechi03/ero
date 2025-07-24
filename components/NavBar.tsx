import React from 'react';
import { Dispatch, SetStateAction } from 'react';

type ViewType = 'auth' | 'game' | 'profile' | 'ranking' | 'upload' | 'admin' | 'terms';

interface NavBarProps {
  currentView: ViewType;
  isAdmin: boolean;
  onNavigate: Dispatch<SetStateAction<ViewType>>;
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, isAdmin, onNavigate, onLogout }) => {
  return (
    <nav className="nav">
      <div className="nav-brand">ERO - エンターテインメントレーティング機構</div>
      <div className="nav-links">
        <button
          className={`nav-link ${currentView === 'game' ? 'active' : ''}`}
          onClick={() => onNavigate('game')}
        >
          🎮 ゲーム
        </button>
        <button
          className={`nav-link ${currentView === 'ranking' ? 'active' : ''}`}
          onClick={() => onNavigate('ranking')}
        >
          🏆 ランキング
        </button>
        <button
          className={`nav-link ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => onNavigate('upload')}
        >
          📤 アップロード
        </button>
        <button
          className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          👤 プロフィール
        </button>
        {isAdmin && (
          <button
            className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
          >
            🔧 管理者
          </button>
        )}
        <button className="nav-link" onClick={onLogout}>
          ログアウト
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
