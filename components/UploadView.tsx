import { useState, useEffect, useRef } from 'react';
import { Parse, EroImage } from '../lib/models';

interface UploadViewProps {
  user: Parse.User;
}

interface ImageWithStats {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  get: (key: string) => any;
  totalVotes: number;
  yesPercentage: number;
}

export default function UploadView({ user }: UploadViewProps) {


  const [images, setImages] = useState<ImageWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const query = new Parse.Query(EroImage);
      query.descending('createdAt');
      query.include('uploader');
      const results = await query.find();
      
      const imagesWithStats = results.map((img: EroImage) => {
        const yesCount = img.get('yesCount') || 0;
        const noCount = img.get('noCount') || 0;
        const totalVotes = yesCount + noCount;
        const yesPercentage = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;

        // 画像情報を plain object として返す（getter-only プロパティへの代入回避）
        return {
          id: img.id,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          get: img.get.bind(img),
          // 必要なら他のメソッドもバインド
          totalVotes,
          yesPercentage
        };
      });
      
      setImages(imagesWithStats);
    } catch (error: any) {
      console.error('Error loading images:', error);
      setError('画像の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (image: ImageWithStats) => {
    if (!confirm('この画像を削除してもよろしいですか？\n関連する投票データも削除されます。')) {
      return;
    }

    try {
      setError('');
      // IDから本物のEroImageインスタンスを取得
      const query = new Parse.Query(EroImage);
      const eroImage = await query.get(image.id);
      
      // 関連する投票データも削除
      const voteQuery = new Parse.Query('Vote');
      voteQuery.equalTo('image', eroImage);
      const votes = await voteQuery.find();
      
      if (votes.length > 0) {
        await Parse.Object.destroyAll(votes);
      }
      
      // 画像を削除
      await eroImage.destroy();
      
      setSuccess('画像を削除しました');
      loadImages(); // 画像リストを再読み込み
    } catch (error: any) {
      console.error('Error deleting image:', error);
      setError('削除に失敗しました: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>管理画面</h2>
      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px' }}>
        {/* 画像一覧と削除ボタンのみ表示 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {images.map((image) => (
            <div key={image.id} style={{
              background: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '15px',
              padding: '15px',
              position: 'relative'
            }}>
              <img
                src={image.get('file')?.url()}
                alt="管理画像"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  marginBottom: '15px'
                }}
              />
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#48bb78', fontWeight: 'bold' }}>
                    👍 {image.get('yesCount') || 0}
                  </span>
                  <span style={{ color: '#f56565', fontWeight: 'bold' }}>
                    👎 {image.get('noCount') || 0}
                  </span>
                </div>
                
                <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0', marginBottom: '8px' }}>
                  <div 
                    style={{ 
                      width: `${image.yesPercentage}%`, 
                      background: 'linear-gradient(45deg, #48bb78, #38a169)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                  <div 
                    style={{ 
                      width: `${100 - image.yesPercentage}%`, 
                      background: 'linear-gradient(45deg, #f56565, #e53e3e)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                  総投票数: {image.totalVotes}票 | YES率: {image.yesPercentage}%
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '5px' }}>
                  アップロード: {image.get('uploader')?.get('username') || '不明'} | 
                  {image.createdAt ? new Date(image.createdAt).toLocaleDateString('ja-JP') : ''}
                </div>
              </div>
              
              <button
                className="btn btn-danger"
                onClick={() => deleteImage(image)}
                style={{ width: '100%', fontSize: '0.9rem' }}
              >
                🗑️ 削除
              </button>
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>📷 画像がまだありません</h3>
            <p style={{ marginTop: '10px' }}>
              画像がありません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
