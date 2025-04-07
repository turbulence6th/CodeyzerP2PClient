import React, { useState } from 'react';
import { FileItem, Download } from '../types';

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
      <div className="mt-5 text-center">
        <div className="card shadow-sm p-5 border-0 bg-dark">
          <div className="card-body">
            <i className="bi bi-inbox fs-1 text-orange mb-4" style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 127, 42, 0.5))',
            }}></i>
            <h3 className="mb-3" style={{
              fontWeight: '600',
              background: 'linear-gradient(45deg, #ff7f2a, #ff6600)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>Henüz paylaşılan dosya bulunmuyor</h3>
            <p className="text-light fs-5" style={{ maxWidth: '80%', margin: '0 auto' }}>
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
      <h4 className="mb-4 d-flex align-items-center">
        <span style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #ff7f2a, #ff6600)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <i className="bi bi-share me-2 text-orange"></i>
          Paylaşılan Dosyalar
        </span>
        <span className="badge bg-orange rounded-pill ms-2 d-flex align-items-center justify-content-center" 
          style={{ 
            minWidth: '30px',
            height: '30px',
            fontSize: '0.9rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(45deg, #ff7f2a, #ff6600)'
          }}>
          {files.length}
        </span>
      </h4>
      
      <div className="row g-3">
        {files.map((item, index) => (
          <div className="col-12" key={item.hash}>
            <div className="card shadow-sm border-0 mb-2 overflow-hidden" style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="card-body p-0">
                <div className="row g-0 align-items-center">
                  <div className="col-auto ps-3 pe-1 py-3 text-center" style={{width: '65px'}}>
                    <i className={`bi ${getFileIcon(item.filename)} fs-1 text-orange`}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(255, 127, 42, 0.4))',
                        transition: 'transform 0.2s ease',
                      }}></i>
                  </div>
                  
                  <div className="col-md-3 col-sm-4 ps-2 py-3">
                    <h5 className="mb-1 text-truncate text-light fw-bold" title={item.filename}
                      style={{
                        fontSize: '1.1rem'
                      }}>
                      {item.filename}
                    </h5>
                    <p className="text-light-emphasis mb-0">
                      <small>{formatSize(item.size)}</small>
                    </p>
                  </div>
                  
                  <div className="col py-3">
                    <div className="input-group input-group-sm" style={{
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <input
                        id={`link-${item.hash}`}
                        className="form-control border-end-0 bg-dark text-light"
                        value={getDownloadUrl(item.hash)}
                        readOnly
                        style={{
                          borderRadius: '6px 0 0 6px',
                          borderColor: '#333'
                        }}
                      />
                      <button 
                        className="btn btn-sm btn-outline-orange border-start-0" 
                        type="button"
                        onClick={() => onCopy(item.hash)}
                        title="Kopyala"
                        style={{ 
                          color: '#ffffff',
                          borderRadius: '0 6px 6px 0',
                          borderColor: '#333',
                          padding: '0.35rem 0.65rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-auto py-3 px-3">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-orange" 
                        onClick={() => onShowQr(item.hash)}
                        title="QR Kod Göster"
                        style={{ 
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          transition: 'all 0.2s ease',
                          borderColor: '#ff7f2a'
                        }}
                      >
                        <i className="bi bi-qr-code"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => onRemove(item)}
                        title="Paylaşımı Kaldır"
                        style={{ 
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      <button 
                        className={`btn btn-sm btn-outline-orange ${expandedRows[item.hash] ? 'active' : ''}`}
                        onClick={() => toggleRow(item.hash)}
                        title={expandedRows[item.hash] ? "Detayları Gizle" : "Detayları Göster"}
                        style={{ 
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          transition: 'all 0.2s ease',
                          borderColor: '#ff7f2a',
                          background: expandedRows[item.hash] ? 'rgba(255, 127, 42, 0.2)' : 'transparent'
                        }}
                      >
                        <i className={`bi ${expandedRows[item.hash] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedRows[item.hash] && item.downloads.length > 0 && (
                  <div className="card-footer py-3 px-3 border-top bg-dark" style={{
                    transition: 'all 0.3s ease',
                    borderTopColor: '#333',
                    background: '#141414'
                  }}>
                    <h6 className="mb-3 d-flex align-items-center" style={{
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #ff7f2a, #ff6600)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      <i className="bi bi-download me-2 text-orange" style={{
                        filter: 'drop-shadow(0 0 5px rgba(255, 127, 42, 0.5))'
                      }}></i>
                      İndirme Detayları
                    </h6>
                    <div className="table-responsive" style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }}>
                      <table className="table table-sm table-hover table-dark mb-0" style={{
                        marginBottom: '0',
                        background: '#111',
                        borderCollapse: 'collapse'
                      }}>
                        <thead className="text-light" style={{
                          borderBottom: '2px solid #333'
                        }}>
                          <tr>
                            <th style={{padding: '12px 16px'}}><i className="bi bi-globe2 me-2 text-orange"></i>IP Adresi</th>
                            <th style={{width: '50%', padding: '12px 16px'}}><i className="bi bi-bar-chart-fill me-2 text-orange"></i>İlerleme</th>
                            <th style={{padding: '12px 16px'}}><i className="bi bi-info-circle me-2 text-orange"></i>Durum</th>
                          </tr>
                        </thead>
                        <tbody className="text-light">
                          {item.downloads.map((download: Download, dIndex: number) => (
                            <tr key={`${download.ip}-${dIndex}`} style={{
                              borderTop: '1px solid #222'
                            }}>
                              <td style={{padding: '12px 16px'}}>
                                <span className="badge bg-dark text-light border" style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  borderColor: '#333',
                                  fontSize: '0.85rem'
                                }}>
                                  <i className="bi bi-pc-display me-1"></i>
                                  {download.ip}
                                </span>
                              </td>
                              <td style={{padding: '12px 16px'}}>
                                <div className="progress" style={{
                                  height: '25px',
                                  borderRadius: '6px',
                                  backgroundColor: '#222',
                                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                                }}>
                                  <div
                                    className={`progress-bar ${getStatusClass(download.status)}`}
                                    role="progressbar"
                                    style={{
                                      width: `${download.progress}%`,
                                      borderRadius: '6px',
                                      transition: 'width 0.3s ease-in-out',
                                      background: download.status === 'success' ? 'linear-gradient(45deg, #28a745, #20c997)' :
                                                 download.status === 'failed' ? 'linear-gradient(45deg, #dc3545, #c9302c)' :
                                                 'linear-gradient(45deg, #007bff, #17a2b8)'
                                    }}
                                    aria-valuenow={download.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  >
                                    {download.progress.toFixed(0)}%
                                  </div>
                                </div>
                              </td>
                              <td style={{padding: '12px 16px'}}>
                                {download.status === 'success' && (
                                  <span className="badge" style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Tamamlandı
                                  </span>
                                )}
                                {download.status === 'failed' && (
                                  <span className="badge" style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    background: 'linear-gradient(45deg, #dc3545, #c9302c)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}>
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Başarısız
                                  </span>
                                )}
                                {download.status === 'progress' && (
                                  <span className="badge" style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    background: 'linear-gradient(45deg, #007bff, #17a2b8)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}>
                                    <i className="bi bi-arrow-repeat me-1"></i>
                                    Devam Ediyor
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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