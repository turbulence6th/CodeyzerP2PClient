import React from 'react';
import UtilsService from '../services/UtilsService';
import './TransferNotification.css';

interface TransferCompleteNotificationProps {
  filename: string;
  fileSize: number;
  ip: string;
}

const TransferCompleteNotification: React.FC<TransferCompleteNotificationProps> = ({ filename, fileSize, ip }) => {
  return (
    <div className="notification-container">
      <div className="notification-title">
        Dosya Gönderimi Tamamlandı
      </div>
      <div className="notification-content">
        <p className="notification-item"><b className="notification-label">Dosya:</b> {filename}</p>
        <p className="notification-item"><b className="notification-label">Boyut:</b> {UtilsService.formatSize(fileSize)}</p>
        <p className="notification-item"><b className="notification-label">Alıcı IP:</b> {ip}</p>
      </div>
    </div>
  );
};

export default TransferCompleteNotification; 