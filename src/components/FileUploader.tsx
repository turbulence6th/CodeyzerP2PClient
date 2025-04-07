import React, { useRef, useState, DragEvent } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isUploading }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    onFileSelect(event.target.files[0]);
  };

  const handleBrowseClick = () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.click();
    }
  };

  return (
    <div className="mb-5">
      <div
        className={`upload-area text-center p-5 ${isDragging ? 'dragging' : ''}`}
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        style={{
          border: isDragging ? '3px dashed #ff7f2a' : '3px dashed #6c757d',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? 'rgba(255, 127, 42, 0.15)' : '#1a1a1a',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: isDragging ? '0 8px 32px rgba(255, 127, 42, 0.2)' : 'none',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileUploadRef}
          className="file-upload-input"
          style={{ display: 'none' }}
        />
        
        <div className="file-upload-content">
          {isUploading ? (
            <div className="uploading-indicator">
              <div className="spinner-grow text-orange" role="status" style={{ width: '4rem', height: '4rem' }}>
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
              <p className="mt-4 text-light fs-5">Dosya Yükleniyor...</p>
              <div className="progress mt-3" style={{ height: '10px', borderRadius: '5px' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated bg-orange" role="progressbar" style={{ width: '75%' }}></div>
              </div>
            </div>
          ) : (
            <>
              <div className="upload-icon mb-4" style={{ animation: isDragging ? 'pulse 1.5s infinite' : '' }}>
                <i className="bi bi-cloud-arrow-up-fill display-3 text-orange" style={{
                  filter: 'drop-shadow(0 0 10px rgba(255, 127, 42, 0.5))',
                  transition: 'transform 0.3s ease',
                  transform: isDragging ? 'translateY(-10px)' : 'translateY(0)'
                }}></i>
              </div>
              <h3 className="mb-3 text-light fw-bold" style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(45deg, #ff7f2a, #ff6600)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                textAlign: 'center',
                margin: '0 auto'
              }}>Codeyzer P2P ile Dosya Paylaşımı</h3>
              <p className="mb-4 text-light-emphasis fs-5" style={{ maxWidth: '80%', margin: '0 auto' }}>
                Dosyanızı sürükleyip bırakın veya panele tıklayın
              </p>
              
              {isDragging && (
                <div className="mt-4" style={{ 
                  animation: 'fadeIn 0.5s forwards',
                  color: '#ff7f2a',
                  fontWeight: 'bold'
                }}>
                  <i className="bi bi-hand-index-thumb me-2"></i>
                  Dosyayı Buraya Bırakın!
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>
        {`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>
    </div>
  );
};

export default FileUploader; 