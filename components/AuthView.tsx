import { useState } from 'react';
import Parse from '../lib/parseClient';

interface AuthViewProps {
  onLogin: (user: Parse.User) => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setLoading(true);
      const user = await Parse.User.logIn(username, password);
      onLogin(user);
    } catch (error: any) {
      alert('ログインに失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    try {
      setLoading(true);
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      
      await user.signUp();
      onLogin(user);
    } catch (error: any) {
      alert('サインアップに失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view">
      <div className="auth-container">
        <h1>エンターテインメントレーティング機構ERO</h1>
        
        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
          >
            ログイン
          </button>
          <button 
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
          >
            サインアップ
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit"
            disabled={loading}
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : 'サインアップ')}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-info">デモ用アカウント:</p>
          <button 
            onClick={() => {
              setUsername('demo');
              setPassword('demo123');
              setIsLogin(true);
            }}
            className="demo-btn"
          >
            デモユーザーでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
