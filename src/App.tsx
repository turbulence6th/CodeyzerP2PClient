import React, { useState, useEffect, useRef } from 'react';
import { FileItem, DownloadResponse } from './types';

// Components
import FileUploader from './components/FileUploader';
import SharedFileList from './components/SharedFileList';
import QRModal from './components/QRModal';
import ConnectionStatus from './components/ConnectionStatus';
import ToastProvider, { 
  showFileNotification, 
  showShareSuccessNotification, 
  showTransferCompleteNotification, 
  showTransferFailedNotification 
} from './components/ToastProvider';

// Services
import WebSocketService from './services/WebSocketService';
import ApiService from './services/ApiService';
import UtilsService from './services/UtilsService';

// Config
import './App.css';

// Backend API ve WebSocket URL'leri
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || `${BACKEND_URL}/gs-guide-websocket`;

// Bootstrap'i global olarak tanımlayacağız (window.bootstrap'e erişim için)
declare global {
  interface Window {
    bootstrap: any;
  }
}

const App: React.FC = () => {
  // State
  const [sharedFiles, setSharedFiles] = useState<FileItem[]>([]);
  const [selectedQrHash, setSelectedQrHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  // Services
  const webSocketService = useRef<WebSocketService>(new WebSocketService(WEBSOCKET_URL));
  const apiService = useRef<ApiService>(new ApiService(BACKEND_URL));
  
  // Connection state
  const socketConnected = useRef<boolean>(false);

  // WebSocket bağlantısını kur
  useEffect(() => {
    const maxRetries = 3;
    let retryCount = 0;
    
    const reconnect = () => {
      if (retryCount >= maxRetries) {
        console.error('WebSocket bağlantısı kurulamadı, maksimum yeniden deneme sayısına ulaşıldı.');
        setIsConnected(false);
        setConnectionStatus('error');
        socketConnected.current = false;
        return;
      }
      
      setConnectionStatus('connecting');
      
      webSocketService.current.connect(
        (frame) => {
          console.log('WebSocket bağlantısı başarılı');
          socketConnected.current = true;
          setIsConnected(true);
          setConnectionStatus('connected');
          retryCount = 0; // Başarılı bağlantıda sayacı sıfırla
        },
        (error) => {
          console.error('WebSocket bağlantı hatası:', error);
          socketConnected.current = false;
          setIsConnected(false);
          setConnectionStatus('connecting'); // Yeniden bağlanmaya çalışırken "connecting" olarak güncelle
          retryCount++;
          // 2 saniye sonra yeniden bağlanmayı dene
          setTimeout(reconnect, 2000);
        }
      );
    };
    
    // Hemen bağlanmayı dene
    reconnect();
    
    return () => {
      webSocketService.current.disconnect(() => {
        console.log('WebSocket bağlantısı kapatıldı');
        socketConnected.current = false;
        setIsConnected(false);
        setConnectionStatus('error');
      });
    };
  }, []);

  // Dosya yükleme işlemi
  const handleFileSelect = (file: File) => {
    setIsUploading(true);
    
    apiService.current.shareFile(file.name, file.size)
      .then((data) => {
        const newItem: FileItem = {
          filename: file.name,
          size: file.size,
          hash: data.shareHash,
          blob: file,
          downloads: []
        };
        
        setSharedFiles(prev => [...prev, newItem]);
        
        // Başarılı dosya paylaşımı bildirimi
        showShareSuccessNotification(file.name, file.size, data.shareHash);

        if (socketConnected.current) {
          const subscription = webSocketService.current.subscribe('/topic/' + data.shareHash, (message) => {
            const jsonResp: DownloadResponse = JSON.parse(message.body);
            
            // Bildirim göster
            showFileNotification(file.name, file.size, jsonResp.ip);
            
            // Aynı IP ve streamHash kombinasyonu için mevcut indirme var mı kontrol et
            const existingDownloadIndex = sharedFiles.findIndex(item => 
              item.hash === data.shareHash && 
              item.downloads.some(d => d.ip === jsonResp.ip && d.streamHash === jsonResp.streamHash)
            );
            
            // Eğer aynı indirme zaten varsa ve durumu devam ediyorsa, yeni indirme ekleme
            if (existingDownloadIndex !== -1) {
              console.log('Bu dosya için aktif indirme zaten var:', jsonResp.ip, jsonResp.streamHash);
              return;
            }
            
            const download = {
              ip: jsonResp.ip,
              progress: 0,
              status: 'progress' as const,
              streamHash: jsonResp.streamHash // Benzersiz stream hash'i saklayalım
            };

            setSharedFiles(prev => {
              const fileIndex = prev.findIndex(item => item.hash === data.shareHash);
              if (fileIndex === -1) return prev;

              const updatedFiles = [...prev];
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                downloads: [...updatedFiles[fileIndex].downloads, download]
              };
              
              return updatedFiles;
            });

            const handleProgress = (progress: number) => {
              setSharedFiles(prev => {
                const fileIndex = prev.findIndex(item => item.hash === data.shareHash);
                if (fileIndex === -1) return prev;

                const downloadIndex = prev[fileIndex].downloads.findIndex(
                  d => d.ip === jsonResp.ip && d.streamHash === jsonResp.streamHash
                );
                if (downloadIndex === -1) return prev;

                const updatedFiles = [...prev];
                const updatedDownloads = [...updatedFiles[fileIndex].downloads];
                updatedDownloads[downloadIndex] = {
                  ...updatedDownloads[downloadIndex],
                  progress
                };

                updatedFiles[fileIndex] = {
                  ...updatedFiles[fileIndex],
                  downloads: updatedDownloads
                };
                
                return updatedFiles;
              });
            };

            const handleSuccess = () => {
              setSharedFiles(prev => {
                const fileIndex = prev.findIndex(item => item.hash === data.shareHash);
                if (fileIndex === -1) return prev;

                const downloadIndex = prev[fileIndex].downloads.findIndex(
                  d => d.ip === jsonResp.ip && d.streamHash === jsonResp.streamHash
                );
                if (downloadIndex === -1) return prev;

                const updatedFiles = [...prev];
                const updatedDownloads = [...updatedFiles[fileIndex].downloads];
                updatedDownloads[downloadIndex] = {
                  ...updatedDownloads[downloadIndex],
                  status: 'success'
                };

                updatedFiles[fileIndex] = {
                  ...updatedFiles[fileIndex],
                  downloads: updatedDownloads
                };
                
                // Dosya gönderimi tamamlandı bildirimi göster
                showTransferCompleteNotification(file.name, file.size, jsonResp.ip);
                
                return updatedFiles;
              });
            };

            const handleError = () => {
              setSharedFiles(prev => {
                const fileIndex = prev.findIndex(item => item.hash === data.shareHash);
                if (fileIndex === -1) return prev;

                const downloadIndex = prev[fileIndex].downloads.findIndex(
                  d => d.ip === jsonResp.ip && d.streamHash === jsonResp.streamHash
                );
                if (downloadIndex === -1) return prev;

                const updatedFiles = [...prev];
                const updatedDownloads = [...updatedFiles[fileIndex].downloads];
                updatedDownloads[downloadIndex] = {
                  ...updatedDownloads[downloadIndex],
                  status: 'failed'
                };

                updatedFiles[fileIndex] = {
                  ...updatedFiles[fileIndex],
                  downloads: updatedDownloads
                };
                
                // Dosya gönderim hatası bildirimi göster
                showTransferFailedNotification(file.name, file.size, jsonResp.ip, "Gönderim sırasında bir hata oluştu");
                
                return updatedFiles;
              });
            };

            apiService.current.uploadFile(
              file, 
              jsonResp.shareHash, 
              jsonResp.streamHash, 
              handleProgress, 
              handleSuccess, 
              handleError
            );
          }, {
            id: data.shareHash
          });

          // Subscription null değilse ekle
          if (!subscription) {
            console.error('WebSocket subscription başarısız');
          }
        } else {
          console.error('WebSocket bağlantısı kurulamadığı için dosya izlenemiyor');
        }
        setIsUploading(false);
      })
      .catch(error => {
        console.error('Dosya paylaşım hatası:', error);
        setIsUploading(false);
      });
  };

  // Dosya kaldırma
  const handleRemoveFile = (item: FileItem) => {
    apiService.current.unshareFile(item.hash)
      .then(() => {
        setSharedFiles(prev => prev.filter(x => x.hash !== item.hash));
        if (socketConnected.current) {
          webSocketService.current.getClient()?.unsubscribe(item.hash);
        }
      })
      .catch(error => {
        console.error('Dosya kaldırma hatası:', error);
      });
  };

  // Link kopyalama
  const handleCopyLink = (hash: string) => {
    UtilsService.copyInputValue(`link-${hash}`);
  };

  // QR kod gösterme
  const handleShowQr = (hash: string) => {
    setSelectedQrHash(hash);
  };

  // QR modal kapatıldığında hash'i sıfırla
  const handleQrModalClose = () => {
    setSelectedQrHash(null);
  };

  return (
    <div className="container-fluid" style={{ padding: '30px 50px' }}>
      <ToastProvider />
      {/* Header */}
      <div className="mb-5 text-center">
        <div className="card p-3 shadow" style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(40, 40, 40, 0.9))',
          borderRadius: '16px',
          border: '1px solid rgba(255, 127, 42, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-0">
            <div className="d-flex align-items-center">
              <div className="me-4 position-relative">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                  width: '75px',
                  height: '75px',
                  background: 'linear-gradient(135deg, #2c2c2c, #1e1e1e)',
                  boxShadow: '0 8px 20px rgba(255, 127, 42, 0.2)',
                  border: '2px solid rgba(255, 127, 42, 0.5)',
                  transition: 'all 0.3s ease'
                }}>
                  <img src="/icon.svg" alt="Codeyzer P2P Logo" className="app-logo" style={{ 
                    height: '45px',
                    filter: 'drop-shadow(0 2px 5px rgba(255, 127, 42, 0.5))'
                  }} />
                </div>
                <div className="position-absolute" style={{
                  width: '16px',
                  height: '16px',
                  background: connectionStatus === 'connected' ? '#198754' : connectionStatus === 'connecting' ? '#ffc107' : '#dc3545',
                  border: '2px solid #1e1e1e',
                  borderRadius: '50%',
                  bottom: '3px',
                  right: '3px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
                }}></div>
              </div>
              <div className="text-start">
                <h1 className="display-5 fw-bold mb-1" style={{
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 0 5px rgba(255, 127, 42, 0.8)'
                }}>
                  Codeyzer P2P
                </h1>
                <p className="lead mb-0" style={{
                  color: '#cccccc',
                  fontSize: '1.1rem'
                }}>Hızlı ve güvenli peer-to-peer dosya paylaşım platformu</p>
              </div>
            </div>
            
            <div className="connection-status">
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
            </div>
          </div>
        </div>
      </div>

      {/* Dosya Yükleme Bileşeni */}
      <FileUploader 
        onFileSelect={handleFileSelect} 
        isUploading={isUploading} 
      />

      {/* Paylaşılan Dosyalar Listesi */}
      <SharedFileList 
        files={sharedFiles}
        onCopy={handleCopyLink}
        onRemove={handleRemoveFile}
        onShowQr={handleShowQr}
        getDownloadUrl={apiService.current.getDownloadUrl.bind(apiService.current)}
        formatSize={UtilsService.formatSize}
      />

      {/* QR Kod Modalı */}
      <QRModal 
        selectedHash={selectedQrHash}
        getDownloadUrl={apiService.current.getDownloadUrl.bind(apiService.current)}
        onClose={handleQrModalClose}
      />
    </div>
  );
};

export default App;