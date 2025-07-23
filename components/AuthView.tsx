import { useState } from 'react';
import { Parse } from '../lib/models';

interface AuthViewProps {
  onLogin: (user: Parse.User) => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🎮 ERO</h1>
          <h2 className="card-subtitle">エンターテインメントレーティング機構</h2>
          <p style={{ color: '#666', fontSize: '1rem', marginBottom: '20px' }}>
            2D画像評価ゲーム - Yes/Noで投票して楽しもう！
          </p>
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
        </form>

        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '15px', textAlign: 'center' }}>
          <h3 style={{ color: '#667eea', marginBottom: '15px' }}>🎯 ゲームの遊び方</h3>
          <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#555' }}>
            <p>📝 <strong>投票:</strong> ランダムに表示される画像にYes/Noで投票</p>
            <p>📊 <strong>統計:</strong> 投票後に全体の結果を確認</p>
            <p>👤 <strong>プロフィール:</strong> 自分の投票履歴と傾向を分析</p>
            <p>🏆 <strong>ランキング:</strong> 最も人気の画像をチェック</p>
          </div>
        </div>
      </div>
    </div>
  );
}
