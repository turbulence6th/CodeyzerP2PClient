import React from 'react';

interface ConnectionStatusProps {
  connectionStatus: 'connecting' | 'connected' | 'error';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionStatus }) => {
  return (
    <div className={`card border-0 shadow-sm`} 
      style={{ 
        borderRadius: '12px',
        background: connectionStatus === 'connected' ? 
          'linear-gradient(45deg, rgba(25, 135, 84, 0.1), rgba(25, 135, 84, 0.2))' : 
          connectionStatus === 'connecting' ?
          'linear-gradient(45deg, rgba(255, 193, 7, 0.05), rgba(255, 193, 7, 0.15))' :
          'linear-gradient(45deg, rgba(220, 53, 69, 0.05), rgba(220, 53, 69, 0.15))', 
        boxShadow: connectionStatus === 'connected' ? 
          '0 4px 15px rgba(25, 135, 84, 0.15)' : 
          connectionStatus === 'connecting' ?
          '0 4px 15px rgba(255, 193, 7, 0.15)' :
          '0 4px 15px rgba(220, 53, 69, 0.15)'
      }}>
      <div className="card-body py-2 px-3">
        <div className="d-flex align-items-center">
          <div className="me-3">
            {connectionStatus === 'connected' ? (
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(25, 135, 84, 0.2)',
                  boxShadow: '0 0 15px rgba(25, 135, 84, 0.3)'
                }}>
                <i className="bi bi-wifi fs-4" style={{ color: 'rgb(25, 135, 84)' }}></i>
              </div>
            ) : connectionStatus === 'connecting' ? (
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(255, 193, 7, 0.2)',
                  boxShadow: '0 0 15px rgba(255, 193, 7, 0.3)'
                }}>
                <i className="bi bi-arrow-repeat fs-4 rotating" style={{ color: 'rgb(255, 193, 7)' }}></i>
              </div>
            ) : (
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(220, 53, 69, 0.2)',
                  boxShadow: '0 0 15px rgba(220, 53, 69, 0.3)'
                }}>
                <i className="bi bi-exclamation-triangle-fill fs-4" style={{ color: 'rgb(220, 53, 69)' }}></i>
              </div>
            )}
          </div>
          <div>
            <h5 className="mb-1" style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              color: connectionStatus === 'connected' ? 'rgb(25, 135, 84)' : 
                    connectionStatus === 'connecting' ? 'rgb(255, 193, 7)' : 'rgb(220, 53, 69)'
            }}>
              {connectionStatus === 'connected' ? 'Bağlantı Aktif' : 
                connectionStatus === 'connecting' ? 'Bağlanıyor' : 'Bağlantı Hatası'}
            </h5>
            <p className="mb-0" style={{ 
              fontSize: '0.85rem',
              color: connectionStatus === 'connected' ? 'rgba(25, 135, 84, 0.8)' : 
                    connectionStatus === 'connecting' ? 'rgba(255, 193, 7, 0.8)' : 'rgba(220, 53, 69, 0.8)'
            }}>
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