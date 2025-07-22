import { useState, useEffect } from 'react';
import Parse from '../lib/parseClient';
import AuthView from '../components/AuthView';
import GameView from '../components/GameView';
import ProfileView from '../components/ProfileView';
import AdminView from '../components/AdminView';

type View = 'game' | 'profile' | 'admin';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<Parse.User | null>(null);
  const [currentView, setCurrentView] = useState<View>('game');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkCurrentUser = async () => {
      try {
        const user = Parse.User.current();
        if (user) {
          // Validate session
          await user.fetch();
          setCurrentUser(user);
        }
      } catch (error) {
        // Session is invalid, logout
        await Parse.User.logOut();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  const handleLogin = (user: Parse.User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      setCurrentUser(null);
      setCurrentView('game');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  const isAdmin = currentUser?.get('username') === 'admin' || currentUser?.get('isAdmin');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>ERO Game</h1>
        </div>
        
        <div className="nav-menu">
          <button 
            className={currentView === 'game' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('game')}
          >
            ゲーム
          </button>
          
          <button 
            className={currentView === 'profile' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('profile')}
          >
            プロフィール
          </button>
          
          {isAdmin && (
            <button 
              className={currentView === 'admin' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('admin')}
            >
              管理者
            </button>
          )}
        </div>

        <div className="nav-user">
          <span className="username">{currentUser.get('username')}</span>
          <button onClick={handleLogout} className="logout-btn">
            ログアウト
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'game' && <GameView currentUser={currentUser} />}
        {currentView === 'profile' && <ProfileView currentUser={currentUser} />}
        {currentView === 'admin' && <AdminView currentUser={currentUser} />}
      </main>
    </div>
  );
}
