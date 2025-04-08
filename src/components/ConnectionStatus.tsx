import React from 'react';

interface ConnectionStatusProps {
  connectionStatus: 'connecting' | 'connected' | 'error';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionStatus }) => {
  return (
    <div className={`alert mt-3 ${
      connectionStatus === 'connected' ? 'text-success border border-success' : 
      connectionStatus === 'connecting' ? 'text-warning border border-warning' : 
      'text-danger border border-danger'
    }`} 
         style={{ 
           backgroundColor: 
             connectionStatus === 'connected' ? 'rgba(25, 135, 84, 0.15)' : 
             connectionStatus === 'connecting' ? 'rgba(255, 193, 7, 0.15)' : 
             'rgba(220, 53, 69, 0.2)', 
           borderWidth: '1px',
           borderColor: 
             connectionStatus === 'connected' ? 'rgba(25, 135, 84, 0.5)' : 
             connectionStatus === 'connecting' ? 'rgba(255, 193, 7, 0.5)' : 
             'rgba(220, 53, 69, 0.5)'
         }}
         role="alert">
      {connectionStatus === 'connected' ? (
        <>
          <i className="bi bi-wifi me-2 text-success"></i>
          <span style={{ color: 'rgb(56, 193, 114)' }}>WebSocket bağlantısı kuruldu. Dosya paylaşımı ve gerçek zamanlı izleme aktif.</span>
        </>
      ) : connectionStatus === 'connecting' ? (
        <>
          <i className="bi bi-arrow-repeat me-2 text-warning rotating"></i>
          <span style={{ color: 'rgb(255, 193, 7)' }}>WebSocket bağlantısı kuruluyor. Lütfen bekleyin...</span>
        </>
      ) : (
        <>
          <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
          <span className="text-danger">WebSocket bağlantısı kurulamadı. Dosya paylaşımı yapabilirsiniz ancak gerçek zamanlı izleme çalışmayabilir.</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus; 