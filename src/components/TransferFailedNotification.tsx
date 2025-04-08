import React from 'react';
import UtilsService from '../services/UtilsService';

interface TransferFailedNotificationProps {
  filename: string;
  fileSize: number;
  ip: string;
  error?: string;
}

const TransferFailedNotification: React.FC<TransferFailedNotificationProps> = ({ filename, fileSize, ip, error }) => {
  return (
    <div style={{
      color: '#ffffff',
      fontSize: '1rem',
      padding: '10px',
      borderRadius: '4px'
    }}>
      <div style={{ 
        color: '#FF7F2A',
        fontWeight: 'bold',
        marginBottom: '4px'
      }}>
        Dosya Gönderim Hatası
      </div>
      <div style={{ 
        color: '#cccccc',
        fontSize: '0.9rem'
      }}>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Dosya:</b> {filename}</p>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Boyut:</b> {UtilsService.formatSize(fileSize)}</p>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Alıcı IP:</b> {ip}</p>
        {error && <p style={{ marginBottom: '0', color: '#dc3545' }}><b style={{ color: '#FF7F2A' }}>Hata:</b> {error}</p>}
      </div>
    </div>
  );
};

export default TransferFailedNotification; 