import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  selectedHash: string | null;
  getDownloadUrl: (hash: string) => string;
  onClose?: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ selectedHash, getDownloadUrl, onClose = () => {} }) => {
  const [url, setUrl] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // selectedHash değiştiğinde URL ve görünürlük durumunu güncelle
  useEffect(() => {
    if (selectedHash) {
      setUrl(getDownloadUrl(selectedHash));
      setIsVisible(true);
    }
  }, [selectedHash, getDownloadUrl]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Sadece backdrop'a tıklandığında kapat (içeriğe tıklama olayını engelle)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // ESC tuşu ile kapatma
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleCopyLink = () => {
    if (url) {
      navigator.clipboard.writeText(url)
        .then(() => {
          // Başarıyla kopyalandı
          const copyButton = document.getElementById('copy-qr-link');
          if (copyButton) {
            copyButton.innerHTML = '<i class="bi bi-check-lg me-1"></i>Kopyalandı';
            setTimeout(() => {
              copyButton.innerHTML = '<i class="bi bi-clipboard me-1"></i>Linki Kopyala';
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Kopyalama hatası:', err);
        });
    }
  };

  const getQRSize = () => {
    // Ekran genişliğine göre QR kod boyutunu belirle
    if (window.innerWidth < 576) { // sm breakpoint
      return 200;
    }
    return 250;
  };

  // Görünür değilse hiçbir şey render etme
  if (!isVisible || !selectedHash) {
    return null;
  }

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1050,
        backdropFilter: 'blur(5px)',
        transition: 'all 0.3s ease'
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="qr-modal-content animate__animated animate__fadeInUp"
        style={{
          width: '90%',
          maxWidth: '500px',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #333',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qr-modal-header p-3" style={{
          background: 'linear-gradient(45deg, #1a1a1a, #222)',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ff7f2a, #ff6600)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            margin: 0
          }}>
            <i className="bi bi-qr-code me-2 text-orange"></i>
            QR Kod Paylaşımı
          </h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={handleClose}
            aria-label="Kapat"
          ></button>
        </div>
        <div className="qr-modal-body text-center py-4" style={{ background: '#1a1a1a' }}>
          <p className="text-light mb-3">Bu QR kodu okutarak dosyayı indirebilirsiniz</p>
          <div style={{ 
            background: '#ffffff', 
            display: 'inline-block', 
            padding: '15px', 
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            margin: '0 auto 20px'
          }}>
            <QRCodeSVG 
              value={url} 
              size={getQRSize()}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="input-group mb-3 mt-3 px-3">
            <input 
              type="text" 
              className="form-control bg-dark text-light border-secondary" 
              value={url} 
              readOnly
              style={{borderRadius: '6px 0 0 6px'}}
            />
            <button 
              className="btn btn-orange" 
              type="button" 
              id="copy-qr-link"
              onClick={handleCopyLink}
              style={{borderRadius: '0 6px 6px 0'}}
            >
              <i className="bi bi-clipboard me-1"></i>
              Linki Kopyala
            </button>
          </div>
        </div>
        <div className="qr-modal-footer d-flex justify-content-end p-3" style={{borderTop: '1px solid #333', background: '#1a1a1a'}}>
          <button 
            type="button" 
            className="btn btn-sm btn-secondary" 
            onClick={handleClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal; 