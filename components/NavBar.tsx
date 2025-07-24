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
      <div className="nav-links">
        <button
          className={`nav-link ${currentView === 'game' ? 'active' : ''}`}
          onClick={() => onNavigate('game')}
          style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
           評価
        </button>
        <button
          className={`nav-link ${currentView === 'ranking' ? 'active' : ''}`}
          onClick={() => onNavigate('ranking')}
          style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
           ランキング
        </button>
        <button
          className={`nav-link ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => onNavigate('upload')}
          style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
           アップロード
        </button>
        <button
          className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
          style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
           プロフィール
        </button>
        {isAdmin && (
          <button
            className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
            style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
          >
             管理者
          </button>
        )}
        <button 
          className="nav-link" 
          onClick={onLogout}
          style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
          ログアウト
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
