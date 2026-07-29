import React, { useState } from 'react';
import { Upload, ImageIcon, X, Plus } from 'lucide-react';

interface Props {
  onImagesSelected: (files: File[], previewUrls: string[]) => void;
  loading: boolean;
}

export const UploadStep: React.FC<Props> = ({ onImagesSelected, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const newUrls: string[] = [];

    Array.from(incomingFiles).forEach(file => {
      if (file.type.startsWith('image/') && selectedFiles.length + validFiles.length < 4) {
        validFiles.push(file);
        newUrls.push(URL.createObjectURL(file));
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles].slice(0, 4);
      const updatedUrls = [...previewUrls, ...newUrls].slice(0, 4);
      setSelectedFiles(updatedFiles);
      setPreviewUrls(updatedUrls);
    }
  };

  const handleRemove = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
  };

  const handleContinue = () => {
    if (selectedFiles.length > 0) {
      onImagesSelected(selectedFiles, previewUrls);
    }
  };

  return (
    <div className="major-card" style={{ textAlign: 'center' }}>
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
        Upload Room Photos (Up to 4 Angles)
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 28px', fontSize: '15px', lineHeight: 1.6 }}>
        Upload up to 4 photos showing different angles of your room and existing furniture (e.g. desk, mirror, walls, window).
      </p>

      {/* Selected Photos Thumbnails Grid */}
      {selectedFiles.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', maxWidth: '640px', margin: '0 auto 28px' }}>
          {previewUrls.map((url, idx) => (
            <div key={idx} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '140px', border: '1px solid var(--bg-card-border)', background: '#10121a' }}>
              <img src={url} alt={`Angle ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                Angle {idx + 1}
              </span>
              <button 
                onClick={() => handleRemove(idx)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(230,0,35,0.85)', color: '#fff', border: 'none', borderRadius: '9999px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {selectedFiles.length < 4 && (
            <label 
              htmlFor="room-photo-add-more" 
              style={{ borderRadius: '14px', border: '2px dashed var(--bg-card-border)', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <Plus size={24} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Add Angle</span>
            </label>
          )}
        </div>
      )}

      {/* Drag & Drop Dropzone */}
      <div 
        style={{
          border: dragActive ? '2px dashed var(--sg-primary)' : '1px solid var(--bg-card-border)',
          borderRadius: '16px',
          padding: '30px',
          background: 'rgba(255,255,255,0.02)',
          marginBottom: '28px'
        }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
      >
        <input 
          type="file" 
          id="room-photo-input" 
          accept="image/*" 
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={loading || selectedFiles.length >= 4}
        />
        <input 
          type="file" 
          id="room-photo-add-more" 
          accept="image/*" 
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={loading || selectedFiles.length >= 4}
        />

        <label 
          htmlFor="room-photo-input" 
          className="pill-button" 
          style={{ pointerEvents: (loading || selectedFiles.length >= 4) ? 'none' : 'auto' }}
        >
          <ImageIcon size={18} />
          {selectedFiles.length === 0 ? 'Select up to 4 Photos' : `Add More Photos (${selectedFiles.length}/4)`}
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <button 
          onClick={handleContinue}
          className="pill-button"
          style={{ padding: '14px 40px', fontSize: '16px' }}
          disabled={loading}
        >
          {loading ? 'Analyzing 4 Angles with Gemini Vision...' : `Analyze ${selectedFiles.length} Room Angle${selectedFiles.length > 1 ? 's' : ''} →`}
        </button>
      )}

      <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
        Supports up to 4 JPEG, PNG, WEBP images (10MB max each)
      </p>
    </div>
  );
};
