import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from './services/ApiService'; // ApiService yolu doğru olmalı
import UtilsService from './services/UtilsService'; // UtilsService yolu doğru olmalı
import { FileInfoDTO } from './types';
import './DownloadPage.css'; // Oluşturduğumuz CSS dosyasını import ediyoruz

// BACKEND_URL App.tsx'den alınabilir veya burada yeniden tanımlanabilir.
// Şimdilik App.tsx ile aynı mantıkla alalım:
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const apiService = new ApiService(BACKEND_URL);

interface DownloadPageParams extends Record<string, string | undefined> {
  shareHash: string;
}

const DownloadPage: React.FC = () => {
  const { shareHash } = useParams<DownloadPageParams>();
  const [fileInfo, setFileInfo] = useState<FileInfoDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareHash) {
      setLoading(true);
      setError(null);
      apiService.getFileInfo(shareHash)
        .then(data => {
          setFileInfo(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching file info:", err);
          if (err.status === 404) {
            setError("Aradığınız dosya bulunamadı veya artık paylaşıma açık değil.");
          } else {
            // err.message zaten ApiService'te oluşturduğumuz detaylı mesajı içerecektir
            setError(err.message || "Dosya bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
          }
          setLoading(false);
        });
    }
  }, [shareHash]);

  if (!shareHash) {
    return (
      <div className="container mt-5 text-center">
        <div className="custom-error-panel">Hatalı URL: Dosya hash bilgisi eksik.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
        <p>Dosya bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="custom-error-panel">{error}</div>
      </div>
    );
  }

  if (!fileInfo) {
    return (
      <div className="container mt-5 text-center">
        <div className="custom-error-panel">Dosya bulunamadı veya bu dosya artık paylaşıma açık değil.</div>
      </div>
    );
  }

  const handleDownload = () => {
    const downloadUrl = apiService.getDownloadUrl(shareHash!);
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header text-center">
              <h2>Dosya İndirme</h2>
            </div>
            <div className="card-body">
              <h5 className="card-title text-primary">{fileInfo.fileName}</h5>
              <hr />
              <p className="card-text">
                <strong>Boyut:</strong> {UtilsService.formatSize(fileInfo.fileSize)}
              </p>
              <p className="card-text">
                <strong>Tür:</strong> {fileInfo.fileType || 'Bilinmiyor'}
              </p>
              <div className="d-grid gap-2 mt-4">
                <button className="btn btn-success btn-lg" onClick={handleDownload}>
                  <i className="bi bi-download me-2"></i>İndir
                </button>
              </div>
            </div>
            <div className="card-footer text-muted text-center">
              İndirme işlemi doğrudan başlayacaktır.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage; 