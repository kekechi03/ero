import { useState, useEffect } from 'react';
import { EroImage } from '../lib/models';
import Parse from '../lib/parseClient';

interface AdminViewProps {
  currentUser: Parse.User | null;
}

export default function AdminView({ currentUser }: AdminViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<EroImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const query = new Parse.Query(EroImage);
      query.descending('createdAt');
      query.limit(20);
      const results = await query.find();
      setImages(results);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) return;

    try {
      setUploading(true);

      // Create Parse file
      const parseFile = new Parse.File(file.name, file);
      await parseFile.save();

      // Create image record
      const eroImage = new EroImage();
      eroImage.file = parseFile;
      eroImage.uploader = currentUser;
      eroImage.yesCount = 0;
      eroImage.noCount = 0;

      await eroImage.save();

      alert('アップロードが完了しました！');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh image list
      fetchImages();

    } catch (error: any) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (image: EroImage) => {
    if (!confirm('この画像を削除しますか？')) return;

    try {
      await image.destroy();
      alert('削除が完了しました');
      fetchImages();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('削除に失敗しました: ' + error.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchImages();
    }
  }, [currentUser]);

  // Check if user is admin (simple check - in production, use roles)
  const isAdmin = currentUser?.get('username') === 'admin' || currentUser?.get('isAdmin');

  if (!currentUser) {
    return <div>ログインが必要です</div>;
  }

  if (!isAdmin) {
    return <div>管理者権限が必要です</div>;
  }

  return (
    <div className="admin-view">
      <div className="admin-container">
        <h1>管理者パネル</h1>
        
        <div className="upload-section">
          <h2>画像アップロード</h2>
          <div className="upload-form">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            
            {file && (
              <div className="file-preview">
                <p>選択されたファイル: {file.name}</p>
                <p>サイズ: {Math.round(file.size / 1024)}KB</p>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="preview-image"
                />
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="upload-btn"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </div>

        <div className="images-section">
          <h2>アップロード済み画像</h2>
          
          {loading ? (
            <p>読み込み中...</p>
          ) : (
            <div className="images-grid">
              {images.map((image) => (
                <div key={image.id} className="image-card">
                  <img 
                    src={image.file.url()} 
                    alt="Uploaded" 
                    className="admin-image"
                  />
                  <div className="image-stats">
                    <p>Yes: {image.yesCount}票 ({image.yesPercentage}%)</p>
                    <p>No: {image.noCount}票</p>
                    <p>合計: {image.totalVotes}票</p>
                    <p>アップロード日: {image.createdAt?.toLocaleDateString('ja-JP')}</p>
                  </div>
                  <button
                    onClick={() => deleteImage(image)}
                    className="delete-btn"
                  >
                    削除
                  </button>
                </div>
              ))}
              
              {images.length === 0 && (
                <p>アップロード済みの画像がありません</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
