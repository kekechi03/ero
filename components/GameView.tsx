import { useState, useEffect } from 'react';
import { Parse, EroImage, Vote } from '../lib/models';

interface GameViewProps {
  user: Parse.User;
}

interface VoteResult {
  yesCount: number;
  noCount: number;
  totalVotes: number;
  yesPercentage: number;
  userAnswer: boolean;
}

export default function GameView({ user }: GameViewProps) {
  const [currentImage, setCurrentImage] = useState<EroImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [error, setError] = useState('');
  const [totalImages, setTotalImages] = useState(0);
  const [userVoteCount, setUserVoteCount] = useState(0);

  useEffect(() => {
    loadRandomImage();
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const voteQuery = new Parse.Query(Vote);
      voteQuery.equalTo('user', user);
      const userVotes = await voteQuery.count();
      setUserVoteCount(userVotes);

      const imageQuery = new Parse.Query(EroImage);
      const totalCount = await imageQuery.count();
      setTotalImages(totalCount);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadRandomImage = async () => {
    setLoading(true);
    setVoteResult(null);
    setError('');

    try {
      // 投票済みの画像IDを取得
      const votedQuery = new Parse.Query(Vote);
      votedQuery.equalTo('user', user);
      votedQuery.select('image');
      const votes = await votedQuery.find();
      const votedImageIds = votes.map(vote => vote.get('image').id);

      // 未投票の画像を検索
      const imageQuery = new Parse.Query(EroImage);
      if (votedImageIds.length > 0) {
        imageQuery.notContainedIn('objectId', votedImageIds);
      }
      
      const images = await imageQuery.find();
      
      if (images.length === 0) {
        setError('すべての画像に投票済みです！新しい画像がアップロードされるまでお待ちください。');
        setCurrentImage(null);
        return;
      }

      // ランダムに選択
      const randomIndex = Math.floor(Math.random() * images.length);
      const selectedImage = images[randomIndex];
      
      // 画像ファイルのURLが存在するかチェック
      const imageFile = selectedImage.get('file');
      if (!imageFile || !imageFile.url()) {
        console.error('Image file or URL is missing:', selectedImage.id);
        // 別の画像を試すか、エラーを表示
        if (images.length > 1) {
          // 他の画像を試す
          const filteredImages = images.filter(img => {
            const file = img.get('file');
            return file && file.url();
          });
          if (filteredImages.length > 0) {
            const newIndex = Math.floor(Math.random() * filteredImages.length);
            setCurrentImage(filteredImages[newIndex]);
          } else {
            setError('利用可能な画像が見つかりません。管理者にお問い合わせください。');
            setCurrentImage(null);
          }
        } else {
          setError('画像ファイルが見つかりません。管理者にお問い合わせください。');
          setCurrentImage(null);
        }
        return;
      }
      
      setCurrentImage(selectedImage);
    } catch (error: any) {
      console.error('Error loading image:', error);
      setError(`画像の読み込みに失敗しました: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (answer: boolean) => {
    if (!currentImage || voting) return;

    setVoting(true);
    setError('');

    try {
      // 投票を保存
      const vote = new Vote();
      vote.set('image', currentImage);
      vote.set('user', user);
      vote.set('answer', answer);
      await vote.save();

      // 画像の投票数を更新
      if (answer) {
        currentImage.set('yesCount', (currentImage.get('yesCount') || 0) + 1);
      } else {
        currentImage.set('noCount', (currentImage.get('noCount') || 0) + 1);
      }
      await currentImage.save();

      // 結果を表示
      const yesCount = currentImage.get('yesCount') || 0;
      const noCount = currentImage.get('noCount') || 0;
      const totalVotes = yesCount + noCount;
      const yesPercentage = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;

      setVoteResult({
        yesCount,
        noCount,
        totalVotes,
        yesPercentage,
        userAnswer: answer
      });

      // ユーザー統計を更新
      setUserVoteCount(prev => prev + 1);
    } catch (error: any) {
      console.error('Error voting:', error);
      setError('投票に失敗しました');
    } finally {
      setVoting(false);
    }
  };

  const handleNextImage = () => {
    loadRandomImage();
  };

  if (loading) {
    return (
      <div className="card fade-in">
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>画像を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* 統計情報 */}
      <div className="stats">
        <div className="stat-item">
          <span className="stat-value">{userVoteCount}</span>
          <span className="stat-label">投票数</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalImages}</span>
          <span className="stat-label">総画像数</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalImages > 0 ? Math.round((userVoteCount / totalImages) * 100) : 0}%</span>
          <span className="stat-label">進捗</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎮 画像評価ゲーム</h2>
          <p className="card-subtitle">この画像はどうですか？</p>
        </div>

        {error && <div className="error">{error}</div>}

        {currentImage && (
          <>
            <div className="image-container">
              <img
                src={currentImage.get('file')?.url()}
                alt="評価対象画像"
                className="vote-image"
                onError={(e) => {
                  console.error('Image load error');
                  setError('画像の表示に失敗しました');
                }}
              />
            </div>

            {!voteResult ? (
              <div className="vote-buttons">
                <button
                  className="vote-btn vote-btn-yes"
                  onClick={() => handleVote(true)}
                  disabled={voting}
                >
                  {voting ? '投票中...' : '👍 YES'}
                </button>
                <button
                  className="vote-btn vote-btn-no"
                  onClick={() => handleVote(false)}
                  disabled={voting}
                >
                  {voting ? '投票中...' : '👎 NO'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div className="success">
                  あなたの投票: {voteResult.userAnswer ? '👍 YES' : '👎 NO'}
                </div>
                
                <div className="stats" style={{ margin: '20px 0' }}>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#48bb78' }}>{voteResult.yesCount}</span>
                    <span className="stat-label">👍 YES票</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#f56565' }}>{voteResult.noCount}</span>
                    <span className="stat-label">👎 NO票</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{voteResult.yesPercentage}%</span>
                    <span className="stat-label">YES率</span>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px', margin: '20px 0' }}>
                  <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0' }}>
                    <div 
                      style={{ 
                        width: `${voteResult.yesPercentage}%`, 
                        background: 'linear-gradient(45deg, #48bb78, #38a169)',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                    <div 
                      style={{ 
                        width: `${100 - voteResult.yesPercentage}%`, 
                        background: 'linear-gradient(45deg, #f56565, #e53e3e)',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                  <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                    総投票数: {voteResult.totalVotes}票
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleNextImage}
                  style={{ fontSize: '1.2rem', padding: '15px 40px' }}
                >
                  🔄 次の画像へ
                </button>
              </div>
            )}
          </>
        )}

        {!currentImage && !loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#667eea', marginBottom: '20px' }}>🎉 お疲れ様でした！</h3>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
              すべての画像への投票が完了しました
            </p>
            <p style={{ color: '#888' }}>
              新しい画像がアップロードされたら、また投票をお楽しみください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
