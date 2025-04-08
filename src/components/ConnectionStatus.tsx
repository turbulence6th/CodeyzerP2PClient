import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  connectionStatus: 'connecting' | 'connected' | 'error';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionStatus }) => {
  return (
    <div className={`connection-status-card ${connectionStatus}`}>
      <div className="connection-status-body">
        <div className="d-flex align-items-center">
          <div className={`connection-icon-container ${connectionStatus} me-3`}>
            {connectionStatus === 'connected' ? (
              <i className={`bi bi-wifi connection-icon ${connectionStatus}`}></i>
            ) : connectionStatus === 'connecting' ? (
              <i className={`bi bi-arrow-repeat connection-icon ${connectionStatus} rotating`}></i>
            ) : (
              <i className={`bi bi-exclamation-triangle-fill connection-icon ${connectionStatus}`}></i>
            )}
          </div>
          <div>
            <h5 className={`connection-status-title ${connectionStatus} mb-1`}>
              {connectionStatus === 'connected' ? 'Bağlantı Aktif' : 
                connectionStatus === 'connecting' ? 'Bağlanıyor' : 'Bağlantı Hatası'}
            </h5>
            <p className="connection-status-message">
              {connectionStatus === 'connected' ? 
                'WebSocket bağlantısı kuruldu' : 
                connectionStatus === 'connecting' ?
                'WebSocket bağlantısı kuruluyor' :
                'WebSocket bağlantısı kurulamadı'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus; 