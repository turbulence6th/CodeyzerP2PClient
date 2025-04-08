import React from 'react';
import UtilsService from '../services/UtilsService';

interface FileNotificationProps {
  filename: string;
  fileSize: number;
  ip: string;
}

const FileNotification: React.FC<FileNotificationProps> = ({ filename, fileSize, ip }) => {
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
        Dosya İndirme Talebi
      </div>
      <div style={{ 
        color: '#cccccc',
        fontSize: '0.9rem'
      }}>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Dosya:</b> {filename}</p>
        <p style={{ marginBottom: '2px' }}><b style={{ color: '#FF7F2A' }}>Boyut:</b> {UtilsService.formatSize(fileSize)}</p>
        <p style={{ marginBottom: '0' }}><b style={{ color: '#FF7F2A' }}>İndiren IP:</b> {ip}</p>
      </div>
    </div>
  );
};

export default FileNotification; 