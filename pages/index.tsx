import { useState, useEffect } from 'react';
import { Parse } from '../lib/models';
import AuthView from '../components/AuthView';
import GameView from '../components/GameView';
import ProfileView from '../components/ProfileView';
import AdminView from '../components/AdminView';
import RankingView from '../components/RankingView';
import UploadView from '../components/UploadView';
import TermsView from '../components/TermsView';
import NavBar from '../components/NavBar';

type ViewType = 'auth' | 'game' | 'profile' | 'ranking' | 'upload' | 'admin' | 'terms';

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
        <NavBar
          currentView={currentView}
          isAdmin={isAdmin}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
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
      
      {currentView === 'terms' && (
        <TermsView />
      )}
      
      <footer style={{
        textAlign: 'center',
        padding: '20px 0',
        marginTop: 'auto',
        opacity: 0.6
      }}>
        <button 
          onClick={() => setCurrentView('terms')}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: '11px',
            cursor: 'pointer',
            textDecoration: 'none',
            padding: '0',
            margin: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          利用規約
        </button>
      </footer>
    </div>
  );
}
