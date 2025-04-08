import React from 'react';
import UtilsService from '../services/UtilsService';
import './TransferNotification.css';

interface FileSelectionErrorNotificationProps {
  expectedFilename: string;
  expectedSize: number;
  selectedFilename: string;
  selectedSize: number;
}

const FileSelectionErrorNotification: React.FC<FileSelectionErrorNotificationProps> = ({ 
  expectedFilename, 
  expectedSize, 
  selectedFilename, 
  selectedSize
}) => {
  return (
    <div className="notification-container">
      <div className="notification-title">
        <i className="bi bi-x-circle-fill me-2 text-danger"></i>
        Dosya Eşleşmedi
      </div>
      <div className="notification-content">
        <p className="notification-item">Seçilen dosya beklenen dosya ile uyuşmuyor.</p>
        <div className="mt-2">
          <p className="notification-item">
            <span className="notification-label">Seçilen:</span> 
            {selectedFilename} 
            <span className="badge bg-secondary ms-1">{UtilsService.formatSize(selectedSize)}</span>
          </p>
          <p className="notification-item">
            <span className="notification-label">Beklenen:</span> 
            {expectedFilename} 
            <span className="badge bg-success ms-1">{UtilsService.formatSize(expectedSize)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileSelectionErrorNotification; 