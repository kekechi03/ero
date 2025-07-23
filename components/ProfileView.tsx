import { useState, useEffect } from 'react';
import { Parse, EroImage, Vote } from '../lib/models';

interface ProfileViewProps {
  user: Parse.User;
}

interface UserStats {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  topYesImages: Array<{ image: EroImage; votes: number }>;
  topNoImages: Array<{ image: EroImage; votes: number }>;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'ranking'>('stats');

  useEffect(() => {
    loadUserStats();
    loadRankingData();
  }, []);

  const loadUserStats = async () => {
    try {
      // ユーザーの投票履歴を取得
      const voteQuery = new Parse.Query(Vote);
      voteQuery.equalTo('user', user);
      voteQuery.include('image');
      const votes = await voteQuery.find();

      const totalVotes = votes.length;
      const yesVotes = votes.filter(vote => vote.get('answer') === true).length;
      const noVotes = totalVotes - yesVotes;
      const yesPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

      setUserStats({
        totalVotes,
        yesVotes,
        noVotes,
        yesPercentage,
        topYesImages: [],
        topNoImages: []
      });
    } catch (error: any) {
      console.error('Error loading user stats:', error);
      setError('統計データの読み込みに失敗しました');
    }
  };

  const loadRankingData = async () => {
    try {
      // 最もYesが多い画像を取得
      const topYesQuery = new Parse.Query(EroImage);
      topYesQuery.descending('yesCount');
      topYesQuery.limit(5);
      const topYesImages = await topYesQuery.find();

      // 最もNoが多い画像を取得
      const topNoQuery = new Parse.Query(EroImage);
      topNoQuery.descending('noCount');
      topNoQuery.limit(5);
      const topNoImages = await topNoQuery.find();

      setUserStats(prev => prev ? {
        ...prev,
        topYesImages: topYesImages.map(img => ({
          image: img,
          votes: img.get('yesCount') || 0
        })),
        topNoImages: topNoImages.map(img => ({
          image: img,
          votes: img.get('noCount') || 0
        }))
      } : null);
    } catch (error: any) {
      console.error('Error loading ranking data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card fade-in">
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>統計データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card fade-in">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👤 プロフィール</h2>
          <p className="card-subtitle">@{user.get('username')} の投票傾向分析</p>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
            style={{ border: 'none', borderBottom: activeTab === 'stats' ? '3px solid #667eea' : 'none' }}
          >
            📊 個人統計
          </button>
          <button
            className={`nav-link ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
            style={{ border: 'none', borderBottom: activeTab === 'ranking' ? '3px solid #667eea' : 'none' }}
          >
            🏆 ランキング
          </button>
        </div>

        {activeTab === 'stats' && userStats && (
          <div>
            {/* 個人統計 */}
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{userStats.totalVotes}</span>
                <span className="stat-label">総投票数</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#48bb78' }}>{userStats.yesVotes}</span>
                <span className="stat-label">👍 YES投票</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#f56565' }}>{userStats.noVotes}</span>
                <span className="stat-label">👎 NO投票</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.yesPercentage}%</span>
                <span className="stat-label">YES率</span>
              </div>
            </div>

            {/* 投票傾向分析 */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', margin: '20px 0' }}>
              <h3 style={{ color: '#667eea', marginBottom: '15px', textAlign: 'center' }}>📈 投票傾向分析</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#48bb78', fontWeight: 'bold' }}>👍 YES</span>
                  <span style={{ color: '#f56565', fontWeight: 'bold' }}>👎 NO</span>
                </div>
                <div style={{ display: 'flex', height: '30px', borderRadius: '15px', overflow: 'hidden', background: '#e2e8f0' }}>
                  <div 
                    style={{ 
                      width: `${userStats.yesPercentage}%`, 
                      background: 'linear-gradient(45deg, #48bb78, #38a169)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                  <div 
                    style={{ 
                      width: `${100 - userStats.yesPercentage}%`, 
                      background: 'linear-gradient(45deg, #f56565, #e53e3e)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '10px' }}>
                  {userStats.yesPercentage > 70 ? '🌟 ポジティブタイプ！多くの画像を好んでいます' :
                   userStats.yesPercentage > 50 ? '⚖️ バランスタイプ！適度に選別しています' :
                   userStats.yesPercentage > 30 ? '🔍 選別タイプ！慎重に選んでいます' :
                   '🎯 厳選タイプ！とても厳しい目で選んでいます'}
                </p>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                  あなたの投票傾向を他のユーザーと比較してみましょう
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && userStats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* TOP YES画像 */}
              <div>
                <h3 style={{ color: '#48bb78', marginBottom: '20px', textAlign: 'center' }}>
                  🏆 最も人気の画像 (YES票数)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {userStats.topYesImages.map((item, index) => (
                    <div key={item.image.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'white', 
                      padding: '15px', 
                      borderRadius: '10px',
                      border: '2px solid #c6f6d5'
                    }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#48bb78',
                        marginRight: '15px',
                        minWidth: '30px'
                      }}>
                        #{index + 1}
                      </div>
                      <img 
                        src={item.image.get('file')?.url()} 
                        alt={`Top YES #${index + 1}`}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          marginRight: '15px'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#48bb78' }}>
                          👍 {item.votes} 票
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          YES率: {item.image.get('yesPercentage') || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP NO画像 */}
              <div>
                <h3 style={{ color: '#f56565', marginBottom: '20px', textAlign: 'center' }}>
                  💔 最も不人気の画像 (NO票数)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {userStats.topNoImages.map((item, index) => (
                    <div key={item.image.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'white', 
                      padding: '15px', 
                      borderRadius: '10px',
                      border: '2px solid #fed7d7'
                    }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#f56565',
                        marginRight: '15px',
                        minWidth: '30px'
                      }}>
                        #{index + 1}
                      </div>
                      <img 
                        src={item.image.get('file')?.url()} 
                        alt={`Top NO #${index + 1}`}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          marginRight: '15px'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#f56565' }}>
                          👎 {item.votes} 票
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          YES率: {item.image.get('yesPercentage') || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
