import React, { useState } from 'react';
import { FileItem, Download } from '../types';
import './SharedFileList.css';

interface SharedFileListProps {
  files: FileItem[];
  onCopy: (hash: string) => void;
  onRemove: (item: FileItem) => void;
  onShowQr: (hash: string) => void;
  getDownloadUrl: (hash: string) => string;
  formatSize: (size: number) => string;
}

const SharedFileList: React.FC<SharedFileListProps> = ({ 
  files, 
  onCopy, 
  onRemove, 
  onShowQr, 
  getDownloadUrl, 
  formatSize 
}) => {
  const [expandedRows, setExpandedRows] = useState<{[key: string]: boolean}>({});

  if (files.length === 0) {
    return (
      <div className="empty-files-container">
        <div className="empty-files-card card">
          <div className="card-body">
            <i className="empty-files-icon bi bi-inbox"></i>
            <h3 className="empty-files-title">Henüz paylaşılan dosya bulunmuyor</h3>
            <p className="empty-files-text">
              Codeyzer P2P ile hızlı ve güvenli dosya paylaşımına başlayın
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleRow = (hash: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [hash]: !prev[hash]
    }));
  };

  const getStatusClass = (status: Download['status']) => {
    switch(status) {
      case 'success': return 'bg-success';
      case 'failed': return 'bg-danger';
      default: return 'bg-primary';
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf': return 'bi-file-pdf';
      case 'doc':
      case 'docx': return 'bi-file-word';
      case 'xls':
      case 'xlsx': return 'bi-file-excel';
      case 'ppt':
      case 'pptx': return 'bi-file-ppt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'bi-file-image';
      case 'mp3':
      case 'wav':
      case 'ogg': return 'bi-file-music';
      case 'mp4':
      case 'avi':
      case 'mov': return 'bi-file-play';
      case 'zip':
      case 'rar':
      case '7z': return 'bi-file-zip';
      default: return 'bi-file-earmark';
    }
  };

  return (
    <div className="mt-5">
      <h4 className="mb-4 d-flex align-items-center justify-content-center justify-content-md-start flex-wrap">
        <div className="file-list-title me-2">
          <i className="bi bi-share me-2 text-orange"></i>
          <span>Paylaşılan Dosyalar</span>
        </div>
        <span className="badge bg-orange rounded-pill d-flex align-items-center justify-content-center">
          {files.length}
        </span>
      </h4>
      
      <div className="row g-3">
        {files.map((item, index) => (
          <div className="col-12" key={item.hash}>
            <div className="file-card">
              <div className="card-body p-0">
                <div className="row g-0 align-items-center file-card-row">
                  <div className="col-auto file-icon-col ps-3 pe-1 py-3 text-center" style={{width: '65px'}}>
                    <div className="icon-container">
                      <i className={`bi ${getFileIcon(item.filename)} fs-1 file-info-icon`}></i>
                    </div>
                  </div>
                  
                  <div className="col-md-3 col-sm-6 file-info-col ps-2 py-3">
                    <h5 className="file-name" title={item.filename}>
                      {item.filename}
                    </h5>
                    <p className="file-size">
                      <small>{formatSize(item.size)}</small>
                    </p>
                  </div>
                  
                  <div className="col-md py-3 file-url-col">
                    <div className="download-input-group input-group input-group-sm">
                      <input
                        id={`link-${item.hash}`}
                        className="form-control"
                        value={getDownloadUrl(item.hash)}
                        readOnly
                        title={getDownloadUrl(item.hash)}
                      />
                      <button 
                        className="copy-button btn btn-sm" 
                        type="button"
                        onClick={() => onCopy(item.hash)}
                        title="Kopyala"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-auto py-3 px-3 file-actions-col">
                    <div className="d-flex gap-2 flex-wrap justify-content-center action-buttons">
                      <button 
                        className="btn btn-sm btn-outline-orange action-btn" 
                        onClick={() => onShowQr(item.hash)}
                        title="QR Kod Göster"
                      >
                        <i className="bi bi-qr-code"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger action-btn" 
                        onClick={() => onRemove(item)}
                        title="Paylaşımı Kaldır"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      <button 
                        className={`btn btn-sm btn-outline-orange file-details-toggle action-btn ${expandedRows[item.hash] ? 'active' : ''}`}
                        onClick={() => toggleRow(item.hash)}
                        title={expandedRows[item.hash] ? "Detayları Gizle" : "Detayları Göster"}
                      >
                        <i className={`bi ${expandedRows[item.hash] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedRows[item.hash] && (
                  <div className="card-footer">
                    <h6 className="downloads-title">
                      <i className="downloads-icon bi bi-download me-2"></i>
                      İndirme Detayları
                    </h6>
                    <div className="table-responsive">
                      {item.downloads.length > 0 ? (
                        <table className="table table-sm table-hover table-dark mb-0">
                          <thead>
                            <tr>
                              <th><i className="bi bi-globe2 me-2 text-orange"></i>IP</th>
                              <th><i className="bi bi-bar-chart-fill me-2 text-orange"></i>İlerleme</th>
                              <th><i className="bi bi-info-circle me-2 text-orange"></i>Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.downloads.map((download, dlIndex) => (
                              <tr key={`${download.ip}-${download.streamHash}`}>
                                <td className="ip-cell">
                                  <span className="badge bg-dark text-light border border-secondary">
                                    <i className="bi bi-pc-display d-none d-md-inline me-1"></i>
                                    <span className="ip-address">{download.ip}</span>
                                  </span>
                                </td>
                                <td className="progress-cell">
                                  <div 
                                    className="progress progress-custom" 
                                    data-progress={download.progress > 0 ? `${download.progress.toFixed(1)}%` : ''}
                                  >
                                    <div 
                                      className={`progress-bar progress-bar-custom ${getStatusClass(download.status)}`} 
                                      role="progressbar" 
                                      style={{width: `${download.progress}%`}} 
                                      aria-valuenow={download.progress} 
                                      aria-valuemin={0} 
                                      aria-valuemax={100}
                                    >
                                      {/* Yüzde değeri artık ::after pseudo-element olarak gösteriliyor */}
                                    </div>
                                  </div>
                                </td>
                                <td className="status-cell">
                                  {download.status === 'success' && 
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      <span className="d-none d-md-inline">Tamamlandı</span>
                                      <span className="d-inline d-md-none">Tamam</span>
                                    </span>}
                                  {download.status === 'failed' && 
                                    <span className="badge bg-danger">
                                      <i className="bi bi-exclamation-triangle me-1"></i>
                                      <span className="d-none d-md-inline">Başarısız</span>
                                      <span className="d-inline d-md-none">Hata</span>
                                    </span>}
                                  {download.status === 'progress' && 
                                    <span className="badge bg-primary">
                                      <i className="bi bi-arrow-repeat me-1"></i>
                                      <span className="d-none d-md-inline">Aktarılıyor</span>
                                      <span className="d-inline d-md-none">Aktif</span>
                                    </span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-downloads-message">
                          <i className="bi bi-inbox text-orange"></i>
                          <div>Henüz indirme kaydı bulunmuyor</div>
                          <small className="text-muted">Bu dosyayı henüz kimse indirmemiş</small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedFileList; 