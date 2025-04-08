import React from 'react';
import UtilsService from '../services/UtilsService';
import './TransferNotification.css';

interface TransferFailedNotificationProps {
  filename: string;
  fileSize: number;
  ip: string;
  error?: string;
}

const TransferFailedNotification: React.FC<TransferFailedNotificationProps> = ({ filename, fileSize, ip, error }) => {
  return (
    <div className="notification-container">
      <div className="notification-title">
        Dosya Gönderim Hatası
      </div>
      <div className="notification-content">
        <p className="notification-item"><b className="notification-label">Dosya:</b> {filename}</p>
        <p className="notification-item"><b className="notification-label">Boyut:</b> {UtilsService.formatSize(fileSize)}</p>
        <p className="notification-item"><b className="notification-label">Alıcı IP:</b> {ip}</p>
        {error && <p className="notification-error notification-item"><b className="notification-label">Hata:</b> {error}</p>}
      </div>
    </div>
  );
};

export default TransferFailedNotification; 