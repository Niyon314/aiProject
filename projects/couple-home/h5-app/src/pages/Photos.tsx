import React, { useState, useEffect, useRef } from 'react';
import '../styles/Photos.css';

interface Photo {
  id: number;
  userId: string;
  filename: string;
  origName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  thumbPath: string;
  filePath: string;
  desc: string;
  tags: string;
  createdAt: string;
}

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

  // 加载照片列表
  const loadPhotos = async () => {
    try {
      const res = await fetch(`${API_BASE}/photos?limit=50`);
      const data = await res.json();
      setPhotos(data.data || []);
    } catch (err) {
      console.error('加载照片失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // 处理文件上传
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('只支持 JPG/PNG/WEBP 格式');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('desc', desc);
    formData.append('tags', tags);

    try {
      const res = await fetch(`${API_BASE}/photos/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.duplicate ? '文件已存在' : '上传成功！');
        setDesc('');
        setTags('');
        loadPhotos();
      } else {
        alert(`上传失败：${data.error}`);
      }
    } catch (err) {
      console.error('上传失败:', err);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除照片
  const handleDelete = async (id: number, e: React.stopPropagation) => {
    e.stopPropagation();
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      const res = await fetch(`${API_BASE}/photos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadPhotos();
      } else {
        alert('删除失败');
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="photos-page">
      <div className="photos-header">
        <h1>📸 照片墙</h1>
        <p>记录我们的美好时光</p>
      </div>

      {/* 上传区域 */}
      <div className="upload-section">
        <div className="upload-form">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="upload-btn">
            {uploading ? '⏳ 上传中...' : '➕ 上传照片'}
          </label>
          <input
            type="text"
            placeholder="添加描述（可选）"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="upload-input"
          />
          <input
            type="text"
            placeholder="标签（用逗号分隔，可选）"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="upload-input"
          />
        </div>
      </div>

      {/* 照片网格 */}
      <div className="photo-grid">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : photos.length === 0 ? (
          <div className="empty">
            <p>📭 还没有照片，上传第一张吧！</p>
          </div>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="photo-card"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={`${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}${photo.thumbPath.replace(/\\/g, '/')}`}
                alt={photo.origName}
                loading="lazy"
              />
              {photo.desc && <div className="photo-desc">{photo.desc}</div>}
              <button
                className="delete-btn"
                onClick={(e) => handleDelete(photo.id, e as any)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* 灯箱预览 */}
      {selectedPhoto && (
        <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}${selectedPhoto.filePath.replace(/\\/g, '/')}`}
              alt={selectedPhoto.origName}
            />
            {selectedPhoto.desc && (
              <div className="lightbox-desc">{selectedPhoto.desc}</div>
            )}
            <div className="lightbox-meta">
              <span>{selectedPhoto.origName}</span>
              <span>{formatSize(selectedPhoto.size)}</span>
              <span>{new Date(selectedPhoto.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <button className="close-btn" onClick={() => setSelectedPhoto(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
