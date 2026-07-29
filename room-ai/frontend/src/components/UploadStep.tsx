import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
  onImageSelected: (file: File, previewUrl: string) => void;
  loading: boolean;
}

export const UploadStep: React.FC<Props> = ({ onImageSelected, loading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  return (
    <div 
      className="major-card" 
      style={{ 
        textAlign: 'center', 
        border: dragActive ? '2px dashed var(--sg-primary)' : '1px solid var(--bg-card-border)',
        cursor: 'pointer'
      }}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      }}
    >
      <div style={{ 
        width: '72px', 
        height: '72px', 
        borderRadius: '9999px', 
        background: 'rgba(230,0,35,0.12)', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '20px' 
      }}>
        <Upload size={32} color="var(--sg-primary)" />
      </div>

      <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '12px' }}>
        Upload Your Room Photo
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 28px', fontSize: '15px', lineHeight: 1.6 }}>
        Upload a clear photo showing your current room layout and existing items (e.g. desk, mirror, walls, window).
      </p>

      <input 
        type="file" 
        id="room-photo-input" 
        accept="image/*" 
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={loading}
      />

      <label 
        htmlFor="room-photo-input" 
        className="pill-button" 
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        <ImageIcon size={18} />
        {loading ? 'Analyzing Room with Gemini Vision...' : 'Select Photo from Device'}
      </label>

      <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
        Supports JPEG, PNG, WEBP up to 10MB
      </p>
    </div>
  );
};
