import React, { useRef, useState, DragEvent } from 'react';
import './FileUploader.css';

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
        className={`file-upload-container ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileUploadRef}
          className="file-upload-input"
        />
        
        <div className="file-upload-content">
          {isUploading ? (
            <div className="uploading-indicator">
              <div className="spinner-grow text-orange" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
              <p className="mt-4 text-light fs-5">Dosya Yükleniyor...</p>
              <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated bg-orange" role="progressbar" style={{ width: '75%' }}></div>
              </div>
            </div>
          ) : (
            <>
              <div className={`upload-icon mb-4 ${isDragging ? 'pulse' : ''}`}>
                <i className="bi bi-cloud-arrow-up-fill display-3 text-orange"></i>
              </div>
              <h3 className="file-upload-title mb-3">Codeyzer P2P ile Dosya Paylaşımı</h3>
              <p className="file-upload-description mb-4">
                Dosyanızı sürükleyip bırakın veya panele tıklayın
              </p>
              
              {isDragging && (
                <div className="drop-here-indicator">
                  <i className="bi bi-hand-index-thumb me-2"></i>
                  Dosyayı Buraya Bırakın!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader; 