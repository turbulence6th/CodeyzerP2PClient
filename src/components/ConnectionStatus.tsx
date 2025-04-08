import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'error';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <div className={`connection-status-card ${status}`}>
      <div className="connection-status-body">
        <div className="d-flex align-items-center">
          <div className={`connection-icon-container ${status} me-3`}>
            {status === 'connected' ? (
              <i className={`bi bi-wifi connection-icon ${status}`}></i>
            ) : status === 'connecting' ? (
              <i className={`bi bi-arrow-repeat connection-icon ${status} rotating`}></i>
            ) : (
              <i className={`bi bi-exclamation-triangle-fill connection-icon ${status}`}></i>
            )}
          </div>
          <div>
            <h5 className={`connection-status-title ${status} mb-1`}>
              {status === 'connected' ? 'Bağlantı Aktif' : 
                status === 'connecting' ? 'Bağlanıyor' : 'Bağlantı Hatası'}
            </h5>
            <p className="connection-status-message">
              {status === 'connected' ? 
                'WebSocket bağlantısı kuruldu' : 
                status === 'connecting' ?
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