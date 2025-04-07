import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className={`alert mt-3 ${isConnected ? 'text-success border border-success' : 'text-danger border border-danger'}`} 
         style={{ 
           backgroundColor: isConnected ? 'rgba(25, 135, 84, 0.15)' : 'rgba(220, 53, 69, 0.2)', 
           borderWidth: '1px',
           borderColor: isConnected ? 'rgba(25, 135, 84, 0.5)' : 'rgba(220, 53, 69, 0.5)'
         }}
         role="alert">
      {isConnected ? (
        <>
          <i className="bi bi-wifi me-2 text-success"></i>
          <span style={{ color: 'rgb(56, 193, 114)' }}>WebSocket bağlantısı kuruldu. Dosya paylaşımı ve gerçek zamanlı izleme aktif.</span>
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