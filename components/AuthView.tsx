import React, { useState, useEffect } from 'react';
import Parse from '../lib/parseClient';
import SiteDescription from './SiteDescription';

interface AuthViewProps {
  onLogin: (user: Parse.User) => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowDescription(false);
    }
    setIsReady(true);
  }, []);

  const handleCloseDescription = () => {
    setShowDescription(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = await Parse.User.logIn('demo', 'demo123');
      onLogin(user);
    } catch (error: any) {
      console.error('Demo login error:', error);
      setError(error.message || 'デモログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let user: Parse.User;
      
      if (isLogin) {
        // ログイン
        user = await Parse.User.logIn(username, password);
      } else {
        // サインアップ
        const newUser = new Parse.User();
        newUser.set('username', username);
        newUser.set('password', password);
        user = await newUser.signUp();
      }

      onLogin(user);
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {showDescription && isReady && (
        <SiteDescription onClose={handleCloseDescription} />
      )}
      
      <div className="fade-in" style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">ERO</h1>
            <h2 className="card-subtitle">エンターテインメントレーティング機構</h2>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ユーザー名</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザー名を入力"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">パスワード</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                disabled={loading}
              />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px', display: 'inline-block' }}></div>
                    処理中...
                  </>
                ) : (
                  isLogin ? 'ログイン' : 'サインアップ'
                )}
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                disabled={loading}
              >
                {isLogin ? 'アカウントを作成' : 'ログインに戻る'}
              </button>
            </div>

            <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                style={{
                  background: 'transparent',
                  color: '#8d6e63',
                  border: 'none',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  opacity: 0.6,
                  transition: 'opacity 0.2s ease',
                  fontFamily: 'Georgia, serif',
                  textDecoration: 'underline'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                }}
              >
                デモログイン
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
