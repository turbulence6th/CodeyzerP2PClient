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
    // index.html'de zaten viewport meta etiketi var, o yüzden buraya eklemiyoruz
    
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

  // Kalp Atışı Mekanizması (WebSocket üzerinden)
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout | null = null;
    const heartbeatFrequency = 30000; // 30 saniyede bir
    const heartbeatDestination = "/app/p2p/shares/heartbeat"; // Sunucudaki @MessageMapping adresi

    const sendWsHeartbeat = () => {
      if (sharedFiles.length > 0) {
        const payload = { 
          shares: sharedFiles.map(f => ({ shareHash: f.hash, ownerToken: f.ownerToken })) 
        };
        webSocketService.current.publish(heartbeatDestination, payload);
      } else {
         // Paylaşım yoksa ve interval hala çalışıyorsa durdur
         if (heartbeatInterval) {
             clearInterval(heartbeatInterval);
             heartbeatInterval = null;
             console.log("Heartbeat interval stopped (no shares).");
         }
      }
    };

    if (isConnected && sharedFiles.length > 0) {
      // Bağlantı kurulduğunda ve paylaşım olduğunda hemen bir kere gönder
      sendWsHeartbeat();
      
      // Ardından periyodik olarak gönder
      // Zaten çalışan bir interval varsa temizle (önceki state değişikliğinden kalmış olabilir)
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      
      heartbeatInterval = setInterval(sendWsHeartbeat, heartbeatFrequency);
      console.log("WebSocket Heartbeat interval started.");

    } else {
      // Bağlantı yoksa veya paylaşılacak dosya kalmadıysa interval'ı temizle
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
        console.log("WebSocket Heartbeat interval stopped (disconnected or no shares).");
      }
    }

    // Component unmount edildiğinde veya bağımlılıklar değiştiğinde interval'ı temizle
    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        console.log("WebSocket Heartbeat interval cleaned up on unmount.");
      }
    };
    
  }, [isConnected, sharedFiles]); // Bağımlılıklar: Bağlantı durumu ve paylaşılan dosyaların kendisi
                                // sharedFiles bağımlılığı, her dosya eklendiğinde/çıkarıldığında
                                // interval'ın yeniden kurulmasını sağlar, bu da en güncel listeyi gönderir.

  // Dosya yükleme işlemi
  const handleFileSelect = (file: File) => {
    setIsUploading(true);
    
    apiService.current.shareFile(file.name, file.size)
      .then((data) => {
        const newItem: FileItem = {
          filename: file.name,
          size: file.size,
          hash: data.shareHash,
          ownerToken: data.ownerToken,
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

            let ownerTokenForUpload = ""; // Default boş, bulunamazsa hata olabilir
            setSharedFiles(prev => {
              const fileIndex = prev.findIndex(item => item.hash === data.shareHash);
              if (fileIndex === -1) {
                console.error("Upload için FileItem bulunamadı! Hash:", data.shareHash);
                return prev;
              }

              ownerTokenForUpload = prev[fileIndex].ownerToken; // Token'ı burada alalım

              const updatedFiles = [...prev];
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                downloads: [...updatedFiles[fileIndex].downloads, download]
              };
              
              return updatedFiles;
            });
            
            // Eğer token alınamadıysa upload başlatılamaz
            if (!ownerTokenForUpload) {
                 console.error("OwnerToken bulunamadığı için upload başlatılamıyor, hash:", data.shareHash);
                 // Kullanıcıya hata göstermek iyi olabilir
                 showTransferFailedNotification(file.name, file.size, jsonResp.ip, "İç sunucu hatası nedeniyle yükleme başlatılamadı.");
                 // İlgili indirme talebini başarısız olarak işaretleyebiliriz
                  setSharedFiles(prev => {
                    const fileIndex = prev.findIndex(item => item.hash === data.shareHash);
                    if (fileIndex === -1) return prev;
                    const downloadIndex = prev[fileIndex].downloads.findIndex(
                      d => d.ip === jsonResp.ip && d.streamHash === jsonResp.streamHash
                    );
                    if (downloadIndex === -1) return prev;
                    const updatedFiles = [...prev];
                    const updatedDownloads = [...updatedFiles[fileIndex].downloads];
                    updatedDownloads[downloadIndex] = { ...updatedDownloads[downloadIndex], status: 'failed' };
                    updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], downloads: updatedDownloads };
                    return updatedFiles;
                });
                 return; // Upload işlemine devam etme
            }

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
              ownerTokenForUpload,
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
        showTransferFailedNotification(file.name, file.size, "", "Dosya paylaşılırken bir hata oluştu.");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  // Dosya kaldırma
  const handleRemoveFile = (item: FileItem) => {
    apiService.current.unshareFile(item.hash, item.ownerToken)
      .then(() => {
        console.log('Dosya paylaşımı kaldırıldı:', item.filename);
        setSharedFiles(prev => prev.filter(f => f.hash !== item.hash));
      })
      .catch(error => {
        console.error('Dosya paylaşımını kaldırma hatası:', error);
        showTransferFailedNotification(item.filename, item.size, "", "Paylaşım kaldırılamadı.");
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
    <div className="main-container container-fluid">
      <ToastProvider />
      {/* Header */}
      <div className="mb-4 mb-md-5 text-center">
        <div className="app-header-card card p-3 shadow">
          <div className="d-flex justify-content-between align-items-center mb-0 flex-column flex-md-row">
            <div className="d-flex align-items-center flex-column flex-md-row">
              <div className="me-md-4 mb-2 mb-md-0 position-relative">
                <div className="logo-container">
                  <img src="/icon.svg" alt="Codeyzer P2P Logo" className="app-logo" />
                  <div className={`connection-indicator ${connectionStatus}`}></div>
                </div>
              </div>
              <div className="text-center text-md-start">
                <h1 className="app-title display-5 fw-bold mb-1">
                  Codeyzer P2P
                </h1>
                <p className="app-subtitle lead mb-0">
                  Hızlı ve güvenli peer-to-peer dosya paylaşım platformu
                </p>
              </div>
            </div>
            
            <div className="connection-status mt-3 mt-md-0">
              <ConnectionStatus connectionStatus={connectionStatus} />
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
        formatSize={UtilsService.formatSize}
      />

      {/* QR Kod Modalı */}
      <QRModal 
        selectedHash={selectedQrHash}
        onClose={handleQrModalClose}
      />
    </div>
  );
};

export default App;