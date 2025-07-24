import { useState, useEffect } from 'react';
import { Parse, EroImage } from '../lib/models';

interface RankingViewProps {
  user: Parse.User;
}

interface RankingImage {
  image: EroImage;
  yesCount: number;
  noCount: number;
  totalVotes: number;
  yesPercentage: number;
}

export default function RankingView({ user }: RankingViewProps) {
  const [topYesImages, setTopYesImages] = useState<RankingImage[]>([]);
  const [topNoImages, setTopNoImages] = useState<RankingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'yes' | 'no'>('yes');

  useEffect(() => {
    loadRankingData();
  }, []);

  const loadRankingData = async () => {
    try {
      setError('');
      
      // 最もYesが多い画像を取得
      const topYesQuery = new Parse.Query(EroImage);
      topYesQuery.descending('yesCount');
      topYesQuery.greaterThan('yesCount', 0); // 鑑定がある画像のみ
      topYesQuery.limit(10);
      const topYesResults = await topYesQuery.find();

      // 最もNoが多い画像を取得
      const topNoQuery = new Parse.Query(EroImage);
      topNoQuery.descending('noCount');
      topNoQuery.greaterThan('noCount', 0); // 鑑定がある画像のみ
      topNoQuery.limit(10);
      const topNoResults = await topNoQuery.find();

      // データを整形
      const formatImageData = (images: EroImage[]): RankingImage[] => {
        return images.map(img => {
          const yesCount = img.get('yesCount') || 0;
          const noCount = img.get('noCount') || 0;
          const totalVotes = yesCount + noCount;
          const yesPercentage = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;
          
          return {
            image: img,
            yesCount,
            noCount,
            totalVotes,
            yesPercentage
          };
        });
      };

      setTopYesImages(formatImageData(topYesResults));
      setTopNoImages(formatImageData(topNoResults));
    } catch (error: any) {
      console.error('Error loading ranking data:', error);
      setError('ランキングデータの読み込みに失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card fade-in">
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>ランキングを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card fade-in">
        <div className="error">{error}</div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={loadRankingData}>
            🔄 再読み込み
          </button>
        </div>
      </div>
    );
  }

  const renderRankingList = (images: RankingImage[], type: 'yes' | 'no') => {
    if (images.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>📷 まだ鑑定された画像がありません</h3>
          <p style={{ marginTop: '10px' }}>
            画像に鑑定してランキングを作りましょう！
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {images.map((item, index) => (
          <div key={item.image.id} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            padding: '20px',
            borderRadius: '15px',
            border: `3px solid ${type === 'yes' ? '#c6f6d5' : '#fed7d7'}`,
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            {/* ランキング順位 */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '20px',
              background: type === 'yes' ? 'linear-gradient(45deg, #48bb78, #38a169)' : 'linear-gradient(45deg, #f56565, #e53e3e)',
              color: 'white',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              border: '3px solid white'
            }}>
              {index + 1}
            </div>

            {/* 画像 */}
            <img 
              src={item.image.get('file')?.url()} 
              alt={`Ranking #${index + 1}`}
              style={{ 
                width: '100px', 
                height: '100px', 
                objectFit: 'cover', 
                borderRadius: '12px',
                marginRight: '20px',
                border: '2px solid #e2e8f0'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />

            {/* 統計情報 */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  color: type === 'yes' ? '#10b981' : '#ef4444',
                  marginBottom: '5px'
                }}>
                  {type === 'yes' ? 'エッチ' : 'ノーエッチ'} {type === 'yes' ? item.yesCount : item.noCount} 回
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  総鑑定数: {item.totalVotes}回
                </div>
              </div>

              {/* 鑑定バー */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
                  <span>エッチ: {item.yesCount}</span>
                  <span>ノーエッチ: {item.noCount}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  height: '20px', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  background: '#e2e8f0' 
                }}>
                  <div 
                    style={{ 
                      width: `${item.yesPercentage}%`, 
                      background: 'linear-gradient(45deg, #48bb78, #38a169)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                  <div 
                    style={{ 
                      width: `${100 - item.yesPercentage}%`, 
                      background: 'linear-gradient(45deg, #f56565, #e53e3e)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
                  エッチ率: {item.yesPercentage}%
                </div>
              </div>

              {/* アップロード情報 */}
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                アップロード: {item.image.get('uploader')?.get('username') || '不明'} | 
                {item.image.createdAt ? new Date(item.image.createdAt).toLocaleDateString('ja-JP') : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"> ランキング</h2>
          <p className="card-subtitle">上位画像のランキング</p>
        </div>

        {/* 統計サマリー */}
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#48bb78' }}>{topYesImages.length}</span>
            <span className="stat-label">エッチ画像数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#f56565' }}>{topNoImages.length}</span>
            <span className="stat-label">ノーエッチ画像数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {topYesImages.reduce((sum, img) => sum + img.totalVotes, 0) + 
               topNoImages.reduce((sum, img) => sum + img.totalVotes, 0)}
            </span>
            <span className="stat-label">総鑑定数</span>
          </div>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            className={`nav-link ${activeTab === 'yes' ? 'active' : ''}`}
            onClick={() => setActiveTab('yes')}
            style={{ 
              border: 'none', 
              borderBottom: activeTab === 'yes' ? '3px solid #48bb78' : 'none',
              color: activeTab === 'yes' ? '#48bb78' : '#4a5568'
            }}
          >
            トップエッチ画像
          </button>
          <button
            className={`nav-link ${activeTab === 'no' ? 'active' : ''}`}
            onClick={() => setActiveTab('no')}
            style={{ 
              border: 'none', 
              borderBottom: activeTab === 'no' ? '3px solid #f56565' : 'none',
              color: activeTab === 'no' ? '#f56565' : '#4a5568'
            }}
          >
            トップノーエッチ画像
          </button>
        </div>

        {/* ランキング表示 */}
        <div>
          {activeTab === 'yes' && (
            <div>
              <h3 style={{ color: '#48bb78', marginBottom: '20px', textAlign: 'center' }}>
                最もエッチの画像
              </h3>
              {renderRankingList(topYesImages, 'yes')}
            </div>
          )}

          {activeTab === 'no' && (
            <div>
              <h3 style={{ color: '#f56565', marginBottom: '20px', textAlign: 'center' }}>
                最もノーエッチの画像
              </h3>
              {renderRankingList(topNoImages, 'no')}
            </div>
          )}
        </div>

        {/* 更新ボタン */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="btn btn-secondary"
            onClick={loadRankingData}
            disabled={loading}
          >
            🔄 ランキング更新
          </button>
        </div>
      </div>
    </div>
  );
}
