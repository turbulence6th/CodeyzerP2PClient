import React from 'react';
import UtilsService from '../services/UtilsService';
import './TransferNotification.css';

interface ShareNotificationProps {
  filename: string;
  fileSize: number;
  shareHash: string;
}

const ShareNotification: React.FC<ShareNotificationProps> = ({ filename, fileSize, shareHash }) => {
  return (
    <div className="notification-container">
      <div className="notification-title">
        Dosya Başarıyla Paylaşıldı
      </div>
      <div className="notification-content">
        <p className="notification-item"><b className="notification-label">Dosya:</b> {filename}</p>
        <p className="notification-item"><b className="notification-label">Boyut:</b> {UtilsService.formatSize(fileSize)}</p>
        <p className="notification-item"><b className="notification-label">Hash:</b> {shareHash.substring(0, 8)}</p>
      </div>
    </div>
  );
};

export default ShareNotification; 