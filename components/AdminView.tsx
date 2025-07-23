import { useState, useEffect, useRef } from 'react';
import { Parse, EroImage } from '../lib/models';

interface AdminViewProps {
  user: Parse.User;
}

interface ImageWithStats extends EroImage {
  totalVotes: number;
  yesPercentage: number;
}

export default function AdminView({ user }: AdminViewProps) {
  const [images, setImages] = useState<ImageWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像リストは「管理」タブが開かれたときのみ読み込む
  useEffect(() => {
    if (activeTab === 'manage') {
      setLoading(true);
      loadImages();
    } else {
      // アップロードタブではエラーメッセージをクリア
      setError('');
      setLoading(false);
    }
  }, [activeTab]);

  const loadImages = async () => {
    try {
      const query = new Parse.Query(EroImage);
      query.descending('createdAt');
      query.include('uploader');
      const results = await query.find();
      
      const imagesWithStats = results.map(img => {
        const yesCount = img.get('yesCount') || 0;
        const noCount = img.get('noCount') || 0;
        const totalVotes = yesCount + noCount;
        const yesPercentage = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;

        // EroImageインスタンスではなく、プレーンなオブジェクトを返す
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
    } catch (error: any) {
      console.error('Error loading images:', error);
      setError('画像の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }
    
    if (file.size > 1024 * 1024) { // 1MB制限
      setError('ファイルサイズは1MB未満である必要があります');
      return;
    }
    
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // 日本語ファイル名の問題を回避するため、ユニークなファイル名を作成
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const safeFileName = `image_${timestamp}_${randomStr}.${fileExtension}`;
      
      // Parse Fileオブジェクトを作成（安全なファイル名を使用）
      const parseFile = new Parse.File(safeFileName, file);
      await parseFile.save();

      // EroImageオブジェクトを作成
      const eroImage = new EroImage();
      eroImage.set('file', parseFile);
      eroImage.set('uploader', user);
      eroImage.set('yesCount', 0);
      eroImage.set('noCount', 0);
      eroImage.set('originalName', file.name); // 元のファイル名を保存
      
      await eroImage.save();
      
      setSuccess('画像のアップロードが完了しました！');
      loadImages(); // 画像リストを再読み込み
      
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError('アップロードに失敗しました: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const deleteImage = async (image: EroImage) => {
    if (!confirm('この画像を削除してもよろしいですか？\n関連する投票データも削除されます。')) {
      return;
    }

    try {
      setError('');
      
      // 関連する投票データも削除
      const voteQuery = new Parse.Query('Vote');
      voteQuery.equalTo('image', image);
      const votes = await voteQuery.find();
      
      if (votes.length > 0) {
        await Parse.Object.destroyAll(votes);
      }
      
      // 画像を削除
      await image.destroy();
      
      setSuccess('画像を削除しました');
      loadImages(); // 画像リストを再読み込み
    } catch (error: any) {
      console.error('Error deleting image:', error);
      setError('削除に失敗しました: ' + error.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🔧 管理者画面</h2>
          <p className="card-subtitle">画像のアップロードと管理</p>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            style={{ border: 'none', borderBottom: activeTab === 'upload' ? '3px solid #667eea' : 'none' }}
          >
            📤 アップロード
          </button>
          <button
            className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
            style={{ border: 'none', borderBottom: activeTab === 'manage' ? '3px solid #667eea' : 'none' }}
          >
            📋 画像管理
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {activeTab === 'upload' && (
          <div>
            <div
              className={`dropzone ${dragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-text">
                {uploading ? '📤 アップロード中...' : '📷 画像をドラッグ&ドロップ またはクリック'}
              </div>
              <div className="dropzone-hint">
                対応形式: JPG, PNG, GIF | 最大サイズ: 1MB
              </div>
              {uploading && (
                <div className="loading" style={{ marginTop: '20px' }}>
                  <div className="spinner"></div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
              disabled={uploading}
            />

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', marginTop: '20px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '15px' }}>📋 アップロード注意事項</h3>
              <ul style={{ color: '#666', lineHeight: '1.8' }}>
                <li>• 画像サイズは1MB未満にしてください</li>
                <li>• JPG、PNG、GIF形式に対応しています</li>
                <li>• 不適切な画像はアップロードしないでください</li>
                <li>• アップロード後の画像は投票対象となります</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p style={{ marginTop: '20px', textAlign: 'center' }}>画像を読み込み中...</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <div className="stats">
                    <div className="stat-item">
                      <span className="stat-value">{images.length}</span>
                      <span className="stat-label">総画像数</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {images.reduce((sum, img) => sum + img.totalVotes, 0)}
                      </span>
                      <span className="stat-label">総投票数</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {images.length > 0 ? Math.round(images.reduce((sum, img) => sum + img.yesPercentage, 0) / images.length) : 0}%
                      </span>
                      <span className="stat-label">平均YES率</span>
                    </div>
                  </div>
                </div>

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
                      アップロードタブから最初の画像をアップロードしてください
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
