import { useState, useRef, DragEvent } from 'react';
import { Parse, EroImage } from '../lib/models';

interface UploadViewProps {
  user: Parse.User;
}

export default function UploadView({ user }: UploadViewProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return setError('画像ファイルを選択してください');
    if (file.size > 1024 * 1024) return setError('1MB以内の画像のみ対応');
    upload(file);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const ts = Date.now();
      const rnd = Math.random().toString(36).slice(-6);
      const ext = file.name.split('.').pop() || 'jpg';
      const name = `img_${ts}_${rnd}.${ext}`;
      const pfile = new Parse.File(name, file);
      await pfile.save();

      const img = new EroImage();
      img.set('file', pfile);
      img.set('uploader', user);
      img.set('yesCount', 0);
      img.set('noCount', 0);
      await img.save();

      setSuccess('アップロード完了');
      fileInputRef.current!.value = '';
    } catch (e: any) {
      console.error(e);
      setError('アップロード失敗: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files);
  };
  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e: DragEvent) => { e.preventDefault(); setDragOver(false); };

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h2> 画像アップロード</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div
          className={`dropzone${dragOver ? ' drag-over' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: 40,
            border: '2px dashed #ccc',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          {uploading ? 'アップロード中…' : 'クリック or ドラッグ&ドロップで画像を選択'}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files)}
          disabled={uploading}
        />

        <p style={{ color: '#666', marginTop: 8 }}>
          対応形式: JPG / PNG / GIF ｜ 最大1MB
        </p>
      </div>
    </div>
  );
}
