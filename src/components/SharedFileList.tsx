import React, { useState } from 'react';
import { FileItem, Download } from '../types';
import UtilsService from '../services/UtilsService';
import ApiService from '../services/ApiService';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import './SharedFileList.css';

// Backend API URL'i
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const apiService = new ApiService(BACKEND_URL);

interface SharedFileListProps {
  files: FileItem[];
  onRemove: (item: FileItem) => void;
  onCopyLink: (hash: string) => void;
  onShowQr: (hash: string) => void;
  pendingFiles: string[];
  onSelectFile: (hash: string) => void;
  onReorder?: (newFiles: FileItem[]) => void;
}

const SharedFileList: React.FC<SharedFileListProps> = ({ 
  files, 
  onRemove, 
  onCopyLink, 
  onShowQr,
  pendingFiles,
  onSelectFile,
  onReorder
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
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    
    // Dosya sırasını yeniden düzenle
    const reorderedFiles = Array.from(files);
    const [movedItem] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, movedItem);
    
    // Sıralama değişikliğini üst bileşene bildir
    if (onReorder) {
      onReorder(reorderedFiles);
    }
  };

  return (
    <div className="mt-5">
      <div className="shared-files-title">
        <h4>Paylaşılan Dosyalar</h4>
        <span className="badge bg-orange ms-2">{files.length}</span>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="shared-files-list">
          {(provided) => (
            <div 
              className="row g-3" 
              {...provided.droppableProps} 
              ref={provided.innerRef}
            >
              {files.map((item, index) => (
                <Draggable key={item.hash} draggableId={item.hash} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      className="col-12" 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1
                      }}
                    >
                      <div className={`file-card ${snapshot.isDragging ? 'is-dragging' : ''}`}>
                        <div className="card-body p-0">
                          <div className="row g-0 align-items-center file-card-row">
                            <div 
                              className="col-auto file-icon-col ps-3 pe-1 py-3 text-center drag-handle" 
                              style={{width: '65px'}}
                              {...provided.dragHandleProps}
                            >
                              <div className="icon-container">
                                <i className={`bi ${getFileIcon(item.filename)} fs-1 file-info-icon`}></i>
                                {pendingFiles.includes(item.hash) && (
                                  <div className="pending-file-badge">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="col-md-3 col-sm-6 file-info-col ps-2 py-3">
                              <h5 className="file-name" title={item.filename}>
                                {item.filename}
                              </h5>
                              <p className="file-size">
                                <small>{UtilsService.formatSize(item.size)}</small>
                              </p>
                            </div>
                            
                            <div className="col-md py-3 file-url-col">
                              <div className="download-input-group input-group input-group-sm">
                                <input
                                  id={`link-${item.hash}`}
                                  className="form-control"
                                  value={apiService.getDownloadUrl(item.hash)}
                                  readOnly
                                  title={apiService.getDownloadUrl(item.hash)}
                                />
                                <button 
                                  className="copy-button btn btn-sm" 
                                  type="button"
                                  onClick={() => onCopyLink(item.hash)}
                                  title="Kopyala"
                                >
                                  <i className="bi bi-clipboard"></i>
                                </button>
                              </div>
                            </div>
                            
                            <div className="col-auto py-3 px-3 file-actions-col">
                              <div className="d-flex gap-2 flex-wrap justify-content-center action-buttons">
                                {pendingFiles.includes(item.hash) && (
                                  <button 
                                    className="btn btn-sm btn-warning action-btn" 
                                    onClick={() => onSelectFile(item.hash)}
                                    title="Dosyayı Tekrar Seç"
                                  >
                                    <i className="bi bi-folder-plus"></i>
                                    <span className="ms-1 d-none d-md-inline">Tekrar Seç</span>
                                  </button>
                                )}
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SharedFileList;