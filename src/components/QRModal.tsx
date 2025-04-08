import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRModal.css';

interface QRModalProps {
  hash: string | null;
  url: string;
  onClose?: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ hash, url, onClose = () => {} }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // hash değiştiğinde görünürlük durumunu güncelle
  useEffect(() => {
    if (hash) {
      setIsVisible(true);
    }
  }, [hash]);

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
  if (!isVisible || !hash) {
    return null;
  }

  return (
    <div 
      className="qr-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="qr-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qr-modal-header">
          <h5 className="qr-modal-title">
            <i className="bi bi-qr-code me-2"></i>
            QR Kod Paylaşımı
          </h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={handleClose}
            aria-label="Kapat"
          ></button>
        </div>
        <div className="qr-modal-body">
          <p className="text-light mb-3">Bu QR kodu okutarak dosyayı indirebilirsiniz</p>
          <div className="qr-code-container">
            <QRCodeSVG 
              value={url} 
              size={getQRSize()}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="input-group qr-input-group">
            <input 
              type="text" 
              className="form-control qr-input" 
              value={url} 
              readOnly
            />
            <button 
              className="btn btn-orange" 
              type="button" 
              id="copy-qr-link"
              onClick={handleCopyLink}
            >
              <i className="bi bi-clipboard me-1"></i>
              Linki Kopyala
            </button>
          </div>
        </div>
        <div className="qr-modal-footer">
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