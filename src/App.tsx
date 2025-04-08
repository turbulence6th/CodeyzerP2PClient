import React, { useState, useEffect, useRef } from 'react';
import { FileItem, DownloadResponse } from './types';
import { toast } from 'react-toastify';

// Redux
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { 
  setSharedFiles, 
  addSharedFile, 
  removeSharedFile, 
  updateDownloadProgress,
  updateDownloadStatus,
  addDownload,
  setPendingFiles,
  removePendingFile,
  reorderFiles,
  setSocketConnected
} from './redux/filesSlice';
import { loadFilesFromStorage } from './redux/localStorageMiddleware';

// Components
import FileUploader from './components/FileUploader';
import SharedFileList from './components/SharedFileList';
import QRModal from './components/QRModal';
import ConnectionStatus from './components/ConnectionStatus';
import ToastProvider, { 
  showFileNotification, 
  showShareSuccessNotification, 
  showTransferCompleteNotification, 
  showTransferFailedNotification,
  showFileSelectionErrorNotification,
  showSelectFileNotification
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

// Toast pozisyonu için yardımcı fonksiyon
const getToastPosition = () => {
  return window.innerWidth <= 576 ? "top-center" : "bottom-right";
};

const App: React.FC = () => {
  // Redux state ve dispatch
  const dispatch = useAppDispatch();
  const sharedFiles = useAppSelector(state => state.files.sharedFiles);
  const pendingFiles = useAppSelector(state => state.files.pendingFiles);
  const socketConnected = useAppSelector(state => state.files.socketConnected);

  // Local state
  const [selectedQrHash, setSelectedQrHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  // Services
  const webSocketService = useRef<WebSocketService>(new WebSocketService(WEBSOCKET_URL));
  const apiService = useRef<ApiService>(new ApiService(BACKEND_URL));
  
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
        dispatch(setSocketConnected(false));
        return;
      }
      
      setConnectionStatus('connecting');
      
      webSocketService.current.connect(
        (frame) => {
          console.log('WebSocket bağlantısı başarılı');
          dispatch(setSocketConnected(true));
          setIsConnected(true);
          setConnectionStatus('connected');
          retryCount = 0; // Başarılı bağlantıda sayacı sıfırla
        },
        (error) => {
          console.error('WebSocket bağlantı hatası:', error);
          dispatch(setSocketConnected(false));
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
        dispatch(setSocketConnected(false));
        setIsConnected(false);
        setConnectionStatus('error');
      });
    };
  }, [dispatch]);

  // Kaydedilmiş dosya bilgilerini yükle
  useEffect(() => {
    const savedData = loadFilesFromStorage();
    if (savedData.sharedFiles.length > 0) {
      console.log('Kaydedilmiş dosya bilgileri bulundu:', savedData.sharedFiles);
      
      // Dosyaları "dosya seçilmesi gerekiyor" durumunda ekle
      const newPendingFiles: string[] = [];
      const newSharedFiles: FileItem[] = [];
      
      savedData.sharedFiles.forEach((fileInfo: Omit<FileItem, 'blob'>) => {
        // Paylaşılan dosyalar listesine ekle ama blob olmadan
        newSharedFiles.push({
          ...fileInfo,
          blob: null as any // Geçici olarak null, "Dosya Seç" butonu ile güncellenecek
        });
        
        // Seçilmesi gereken dosyalar listesine ekle
        newPendingFiles.push(fileInfo.hash);
      });
      
      dispatch(setSharedFiles(newSharedFiles));
      dispatch(setPendingFiles(newPendingFiles));
      
      // Sayfa yenilendikten sonra bilgilendirme mesajı göster
      setTimeout(() => {
        showSelectFileNotification(newPendingFiles.length);
      }, 1000); // 1 saniye sonra göster
    }
  }, [dispatch]);

  // Dosya seçme işlemi - "Tekrar Seç" butonu için
  const handleFileSelectForHash = (hash: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        
        // Dosya bilgilerini bul
        const fileIndex = sharedFiles.findIndex(item => item.hash === hash);
        if (fileIndex === -1) return;
        
        // Doğru dosya seçildi mi kontrol et (isim ve boyut kontrolü)
        if (file.name === sharedFiles[fileIndex].filename && file.size === sharedFiles[fileIndex].size) {
          // Dosya blob'unu güncelle
          const updatedFiles = [...sharedFiles];
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            blob: file
          };
          dispatch(setSharedFiles(updatedFiles));
          
          // Bekleyen dosyalar listesinden kaldır
          dispatch(removePendingFile(hash));
          
          // WebSocket aboneliğini kur
          if (socketConnected) {
            webSocketService.current.subscribe('/topic/' + hash, (message) => {
              const jsonResp: DownloadResponse = JSON.parse(message.body);
              handleWebSocketMessage(jsonResp, file, hash);
            });
          }
        } else {
          // Uyumsuz dosya seçildi, hata bildir
          showFileSelectionErrorNotification(
            sharedFiles[fileIndex].filename,
            sharedFiles[fileIndex].size,
            file.name,
            file.size
          );
        }
      }
    };
    
    fileInput.click();
  };
  
  // WebSocket mesajlarını işle
  const handleWebSocketMessage = (jsonResp: DownloadResponse, file: File, hash: string) => {
    // Bildirim göster
    const fileItem = sharedFiles.find(item => item.hash === hash);
    if (!fileItem) return;
    
    showFileNotification(fileItem.filename, fileItem.size, jsonResp.ip);
    
    // Aynı IP ve streamHash kombinasyonu için mevcut indirme var mı kontrol et
    const existingDownloadIndex = sharedFiles.findIndex(item => 
      item.hash === hash && 
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
      streamHash: jsonResp.streamHash
    };

    dispatch(addDownload({
      hash,
      download
    }));

    const handleProgress = (progress: number) => {
      dispatch(updateDownloadProgress({
        hash,
        ip: jsonResp.ip,
        streamHash: jsonResp.streamHash,
        progress
      }));
    };

    const handleSuccess = () => {
      dispatch(updateDownloadStatus({
        hash,
        ip: jsonResp.ip,
        streamHash: jsonResp.streamHash,
        status: 'success'
      }));
      
      // Dosya bilgilerini bul
      const fileIndex = sharedFiles.findIndex(item => item.hash === hash);
      if (fileIndex !== -1) {
        // Başarılı transfer bildirimi
        showTransferCompleteNotification(
          sharedFiles[fileIndex].filename, 
          sharedFiles[fileIndex].size, 
          jsonResp.ip
        );
      }
    };

    const handleError = () => {
      dispatch(updateDownloadStatus({
        hash,
        ip: jsonResp.ip,
        streamHash: jsonResp.streamHash,
        status: 'failed'
      }));
      
      // Dosya bilgilerini bul
      const fileIndex = sharedFiles.findIndex(item => item.hash === hash);
      if (fileIndex !== -1) {
        // Başarısız transfer bildirimi
        showTransferFailedNotification(
          sharedFiles[fileIndex].filename, 
          sharedFiles[fileIndex].size, 
          jsonResp.ip, 
          "Yükleme sırasında hata oluştu"
        );
      }
    };

    // Dosya yükleme işlemini başlat
    apiService.current.uploadFile(
      file,
      hash,
      jsonResp.streamHash,
      handleProgress,
      handleSuccess,
      handleError
    );
  };

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
        
        dispatch(addSharedFile(newItem));
        
        // Başarılı dosya paylaşımı bildirimi
        showShareSuccessNotification(file.name, file.size, data.shareHash);

        if (socketConnected) {
          webSocketService.current.subscribe('/topic/' + data.shareHash, (message) => {
            const jsonResp: DownloadResponse = JSON.parse(message.body);
            handleWebSocketMessage(jsonResp, file, data.shareHash);
          });
        }
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  // Dosya kaldırma işlemi
  const handleRemoveFile = (item: FileItem) => {
    apiService.current.unshareFile(item.hash)
      .then(() => {
        dispatch(removeSharedFile(item.hash));
        
        // Bekleyen dosyalar listesinden kaldır
        if (pendingFiles.includes(item.hash)) {
          dispatch(removePendingFile(item.hash));
        }
      })
      .catch(error => {
        console.error('Dosya kaldırılırken hata oluştu:', error);
      });
  };

  // Dosya bağlantısını kopyalama
  const handleCopyLink = (hash: string) => {
    navigator.clipboard.writeText(apiService.current.getDownloadUrl(hash));
  };

  // QR kodu görüntüleme
  const handleShowQr = (hash: string) => {
    setSelectedQrHash(hash);
  };

  // QR modal kapatma
  const handleQrModalClose = () => {
    setSelectedQrHash(null);
  };

  // Dosya sırasını güncelleme işlemi
  const handleReorderFiles = (reorderedFiles: FileItem[]) => {
    dispatch(reorderFiles(reorderedFiles));
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
              <ConnectionStatus status={connectionStatus} />
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
        onRemove={handleRemoveFile} 
        onCopyLink={handleCopyLink} 
        onShowQr={handleShowQr} 
        pendingFiles={pendingFiles}
        onSelectFile={handleFileSelectForHash}
        onReorder={handleReorderFiles}
      />
      
      {/* QR Kod Modalı */}
      {selectedQrHash && (
        <QRModal 
          hash={selectedQrHash} 
          onClose={handleQrModalClose} 
          url={apiService.current.getDownloadUrl(selectedQrHash)}
        />
      )}
    </div>
  );
};

export default App;