import React from 'react';
import UtilsService from '../services/UtilsService';

interface ShareNotificationProps {
  filename: string;
  fileSize: number;
  shareHash: string;
}

const ShareNotification: React.FC<ShareNotificationProps> = ({ filename, fileSize, shareHash }) => {
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
        Dosya Paylaşıldı
      </div>
      <div style={{ 
        color: '#cccccc',
        fontSize: '0.9rem'
      }}>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Dosya:</b> {filename}</p>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Boyut:</b> {UtilsService.formatSize(fileSize)}</p>
        <p style={{ marginBottom: '0' }}><b style={{ color: '#FF7F2A' }}>Hash:</b> {shareHash.substring(0, 8)}</p>
      </div>
    </div>
  );
};

export default ShareNotification; 