import { useState, useEffect } from 'react';
import { Parse, EroImage } from '../lib/models';

interface AdminViewProps {
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

export default function AdminView({ user }: AdminViewProps) {
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
        return {
          id: img.id,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          get: img.get.bind(img),
          totalVotes,
          yesPercentage
        };
      });

      setImages(imagesWithStats);
    } catch (e: any) {
      console.error('Error loading images:', e);
      setError('画像の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (image: ImageWithStats) => {
    if (!confirm('この画像を削除してもよろしいですか？関連する鑑定データも削除されます。')) return;
    try {
      setError('');
      const query = new Parse.Query(EroImage);
      const eroImage = await query.get(image.id);
      const voteQuery = new Parse.Query('Vote');
      voteQuery.equalTo('image', eroImage);
      const votes = await voteQuery.find();
      if (votes.length > 0) await Parse.Object.destroyAll(votes);
      await eroImage.destroy();
      setSuccess('画像を削除しました');
      loadImages();
    } catch (e: any) {
      console.error('Error deleting image:', e);
      setError('削除に失敗しました: ' + e.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"> 管理者画面</h2>
          <p className="card-subtitle">画像の管理</p>
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {images.map(image => (
              <div key={image.id} style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '15px', padding: '15px', position: 'relative' }}>
                <img
                  src={image.get('file')?.url()}
                  alt="管理画像"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }}
                />
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#48bb78', fontWeight: 'bold' }}> エッチ: {image.get('yesCount') || 0}</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}> ノーエッチ: {image.get('noCount') || 0}</span>
                  </div>
                  <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0', marginBottom: '8px' }}>
                    <div style={{ width: `${image.yesPercentage}%`, background: 'linear-gradient(45deg, #48bb78, #38a169)', transition: 'width 0.3s ease' }}></div>
                    <div style={{ width: `${100 - image.yesPercentage}%`, background: 'linear-gradient(45deg, #f56565, #e53e3e)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>総鑑定数: {image.totalVotes}回 | エッチ率: {image.yesPercentage}%</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '5px' }}>
                    アップロード: {image.get('uploader')?.get('username') || '不明'} | {image.createdAt ? new Date(image.createdAt).toLocaleDateString('ja-JP') : ''}
                  </div>
                </div>
                <button className="btn btn-danger" onClick={() => deleteImage(image)} style={{ width: '100%', fontSize: '0.9rem' }}>🗑️ 削除</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminViewProps {
  user: Parse.User;
}


