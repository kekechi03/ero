import { useState, useEffect } from 'react';
import { Vote, EroImage } from '../lib/models';
import Parse from '../lib/parseClient';

interface ProfileViewProps {
  currentUser: Parse.User | null;
}

interface UserStats {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  similarUsers: number;
  totalUsers: number;
}

export default function ProfileView({ currentUser }: ProfileViewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentVotes, setRecentVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserStats = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Get user's votes
      const votesQuery = new Parse.Query(Vote);
      votesQuery.equalTo('user', currentUser);
      votesQuery.include('image');
      votesQuery.descending('createdAt');
      const userVotes = await votesQuery.find();

      // Calculate basic stats
      const totalVotes = userVotes.length;
      const yesVotes = userVotes.filter(vote => vote.answer === true).length;
      const noVotes = totalVotes - yesVotes;
      const yesPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

      // Get total users count
      const usersQuery = new Parse.Query(Parse.User);
      const totalUsers = await usersQuery.count();

      // Calculate similar users (simplified algorithm)
      // In a real app, you'd use more sophisticated similarity calculation
      let similarUsers = 0;
      
      if (totalVotes > 0) {
        const allUsersQuery = new Parse.Query(Parse.User);
        allUsersQuery.notEqualTo('objectId', currentUser.id);
        const otherUsers = await allUsersQuery.find();
        
        for (const user of otherUsers) {
          const otherVotesQuery = new Parse.Query(Vote);
          otherVotesQuery.equalTo('user', user);
          const otherVotes = await otherVotesQuery.find();
          
          if (otherVotes.length > 0) {
            const otherYesPercentage = Math.round((otherVotes.filter(vote => vote.answer === true).length / otherVotes.length) * 100);
            
            // Consider users with similar yes/no ratio as similar (within 10% difference)
            if (Math.abs(yesPercentage - otherYesPercentage) <= 10) {
              similarUsers++;
            }
          }
        }
      }

      setStats({
        totalVotes,
        yesVotes,
        noVotes,
        yesPercentage,
        similarUsers,
        totalUsers
      });

      // Set recent votes (last 10)
      setRecentVotes(userVotes.slice(0, 10));

    } catch (error) {
      console.error('Error fetching user stats:', error);
      alert('統計データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserStats();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="profile-view">
        <div className="login-prompt">
          <h2>ログインが必要です</h2>
          <p>プロフィールを表示するにはログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view">
      <div className="profile-container">
        <h1>プロフィール</h1>
        
        <div className="user-info">
          <h2>ユーザー情報</h2>
          <p><strong>ユーザー名:</strong> {currentUser.get('username')}</p>
          <p><strong>メールアドレス:</strong> {currentUser.get('email')}</p>
          <p><strong>登録日:</strong> {currentUser.createdAt?.toLocaleDateString('ja-JP')}</p>
        </div>

        {loading ? (
          <div className="loading">
            <p>データを読み込み中...</p>
          </div>
        ) : stats ? (
          <div className="stats-section">
            <h2>投票統計</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>総投票数</h3>
                <p className="stat-number">{stats.totalVotes}</p>
              </div>
              
              <div className="stat-card">
                <h3>Yes投票</h3>
                <p className="stat-number">{stats.yesVotes} ({stats.yesPercentage}%)</p>
              </div>
              
              <div className="stat-card">
                <h3>No投票</h3>
                <p className="stat-number">{stats.noVotes} ({100 - stats.yesPercentage}%)</p>
              </div>
            </div>

            <div className="similarity-section">
              <h3>傾向分析</h3>
              <div className="similarity-info">
                <p>
                  あなたと似た傾向のユーザーは <strong>{stats.similarUsers}</strong> 人です
                </p>
                <p>
                  全ユーザー {stats.totalUsers} 人中、約 <strong>{Math.round((stats.similarUsers / stats.totalUsers) * 100)}%</strong> があなたと似た投票パターンを持っています
                </p>
              </div>
              
              <div className="tendency-description">
                {stats.yesPercentage >= 70 ? (
                  <p>🌟 あなたは <strong>ポジティブ傾向</strong> です！多くの画像に好意的な評価をしています。</p>
                ) : stats.yesPercentage <= 30 ? (
                  <p>🔍 あなたは <strong>厳選傾向</strong> です！評価に厳しく、慎重に判断しています。</p>
                ) : (
                  <p>⚖️ あなたは <strong>バランス傾向</strong> です！Yes・No をバランスよく使い分けています。</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {recentVotes.length > 0 && (
          <div className="recent-votes">
            <h2>最近の投票履歴</h2>
            <div className="votes-list">
              {recentVotes.map((vote) => (
                <div key={vote.id} className="vote-item">
                  <img 
                    src={vote.image?.file?.url()} 
                    alt="Voted Image" 
                    className="vote-image"
                  />
                  <div className="vote-info">
                    <p className={`vote-answer ${vote.answer ? 'yes' : 'no'}`}>
                      {vote.answer ? 'Yes' : 'No'}
                    </p>
                    <p className="vote-date">
                      {vote.createdAt?.toLocaleDateString('ja-JP')} {vote.createdAt?.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button 
            onClick={fetchUserStats}
            className="refresh-btn"
            disabled={loading}
          >
            データを更新
          </button>
        </div>
      </div>
    </div>
  );
}
