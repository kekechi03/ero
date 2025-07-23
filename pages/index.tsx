import { useState, useEffect } from 'react';
import { Parse } from '../lib/models';
import AuthView from '../components/AuthView';
import GameView from '../components/GameView';
import ProfileView from '../components/ProfileView';
import AdminView from '../components/AdminView';
import RankingView from '../components/RankingView';
import UploadView from '../components/UploadView';

type ViewType = 'auth' | 'game' | 'profile' | 'ranking' | 'upload' | 'admin';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('auth');
  const [currentUser, setCurrentUser] = useState<Parse.User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = Parse.User.current();
      if (user) {
        setCurrentUser(user);
        // 管理者チェック
        const isAdminUser = user.get('isAdmin') === true || user.get('username') === 'admin';
        setIsAdmin(isAdminUser);
        setCurrentView('game');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: Parse.User) => {
    setCurrentUser(user);
    const isAdminUser = user.get('isAdmin') === true || user.get('username') === 'admin';
    setIsAdmin(isAdminUser);
    setCurrentView('game');
  };

  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      setCurrentUser(null);
      setIsAdmin(false);
      setCurrentView('auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {currentUser && (
        <nav className="nav">
          <div className="nav-brand">ERO - エンターテインメントレーティング機構</div>
          <div className="nav-links">
            <button
              className={`nav-link ${currentView === 'game' ? 'active' : ''}`}
              onClick={() => setCurrentView('game')}
            >
              🎮 ゲーム
            </button>
            <button
              className={`nav-link ${currentView === 'ranking' ? 'active' : ''}`}
              onClick={() => setCurrentView('ranking')}
            >
              🏆 ランキング
            </button>
            <button
              className={`nav-link ${currentView === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentView('upload')}
            >
              📤 アップロード
            </button>
            <button
              className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentView('profile')}
            >
              👤 プロフィール
            </button>
            {isAdmin && (
              <button
                className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                🔧 管理者
              </button>
            )}
            <button className="nav-link" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </nav>
      )}

      {currentView === 'auth' && (
        <AuthView onLogin={handleLogin} />
      )}
      
      {currentView === 'game' && currentUser && (
        <GameView user={currentUser} />
      )}
      
      {currentView === 'ranking' && currentUser && (
        <RankingView user={currentUser} />
      )}
      
      {currentView === 'upload' && currentUser && (
        <UploadView user={currentUser} />
      )}
      
      {currentView === 'profile' && currentUser && (
        <ProfileView user={currentUser} />
      )}
      
      {currentView === 'admin' && currentUser && isAdmin && (
        <AdminView user={currentUser} />
      )}
    </div>
  );
}
