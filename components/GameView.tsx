import { useState, useEffect } from 'react';
import { EroImage, Vote } from '../lib/models';
import Parse from '../lib/parseClient';

interface GameViewProps {
  currentUser: Parse.User | null;
}

export default function GameView({ currentUser }: GameViewProps) {
  const [currentImage, setCurrentImage] = useState<EroImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{ yes: number; no: number } | null>(null);

  const fetchRandomImage = async () => {
    try {
      setLoading(true);
      const query = new Parse.Query(EroImage);
      
      // Exclude images the user has already voted on
      if (currentUser) {
        const votedQuery = new Parse.Query(Vote);
        votedQuery.equalTo('user', currentUser);
        const votedImages = await votedQuery.find();
        const votedImageIds = votedImages.map(vote => vote.image.id);
        
        if (votedImageIds.length > 0) {
          query.notContainedIn('objectId', votedImageIds);
        }
      }
      
      const count = await query.count();
      if (count === 0) {
        alert('全ての画像に投票済みです！');
        return;
      }
      
      const skip = Math.floor(Math.random() * count);
      query.skip(skip);
      query.limit(1);
      
      const images = await query.find();
      if (images.length > 0) {
        setCurrentImage(images[0]);
        setShowResult(false);
        setResultData(null);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      alert('画像の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (answer: boolean) => {
    if (!currentImage || !currentUser) {
      alert('ログインが必要です');
      return;
    }

    try {
      setLoading(true);
      
      // Save vote
      const vote = new Vote();
      vote.image = currentImage;
      vote.user = currentUser;
      vote.answer = answer;
      await vote.save();

      // Update image counts
      if (answer) {
        currentImage.yesCount = currentImage.yesCount + 1;
      } else {
        currentImage.noCount = currentImage.noCount + 1;
      }
      await currentImage.save();

      // Show result
      setResultData({
        yes: currentImage.yesCount,
        no: currentImage.noCount
      });
      setShowResult(true);

      // Auto-load next image after 3 seconds
      setTimeout(() => {
        fetchRandomImage();
      }, 3000);

    } catch (error) {
      console.error('Error saving vote:', error);
      alert('投票の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRandomImage();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="game-view">
        <div className="login-prompt">
          <h2>ログインが必要です</h2>
          <p>ゲームを開始するにはログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-view">
      <div className="game-container">
        <h1>エンターテインメントレーティング機構ERO</h1>
        
        {loading && (
          <div className="loading">
            <p>読み込み中...</p>
          </div>
        )}

        {currentImage && !loading && (
          <div className="image-container">
            <img 
              src={currentImage.file.url()} 
              alt="Rating Image" 
              className="game-image"
            />
            
            {!showResult ? (
              <div className="vote-buttons">
                <button 
                  className="vote-btn yes-btn" 
                  onClick={() => handleVote(true)}
                  disabled={loading}
                >
                  Yes
                </button>
                <button 
                  className="vote-btn no-btn" 
                  onClick={() => handleVote(false)}
                  disabled={loading}
                >
                  No
                </button>
              </div>
            ) : (
              <div className="result-display">
                <h3>投票結果</h3>
                {resultData && (
                  <div className="result-stats">
                    <div className="stat-item">
                      <span className="stat-label">Yes:</span>
                      <span className="stat-value">{resultData.yes}票 ({Math.round((resultData.yes / (resultData.yes + resultData.no)) * 100)}%)</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">No:</span>
                      <span className="stat-value">{resultData.no}票 ({Math.round((resultData.no / (resultData.yes + resultData.no)) * 100)}%)</span>
                    </div>
                  </div>
                )}
                <p className="next-info">3秒後に次の画像が表示されます...</p>
              </div>
            )}
          </div>
        )}

        {!currentImage && !loading && (
          <div className="no-image">
            <p>画像がありません</p>
            <button onClick={fetchRandomImage}>再読み込み</button>
          </div>
        )}
      </div>
    </div>
  );
}
