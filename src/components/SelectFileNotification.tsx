import React from 'react';
import './TransferNotification.css';

interface SelectFileNotificationProps {
  count: number;
}

const SelectFileNotification: React.FC<SelectFileNotificationProps> = ({ count }) => {
  return (
    <div className="notification-container">
      <div className="notification-content">
        <p className="notification-item">
          <i className="bi bi-folder-plus me-2 text-warning"></i>
          <span className="text-warning fw-bold">{count}</span> dosya için{' '}
          <span className="badge bg-warning text-dark">
            <i className="bi bi-folder-plus me-1"></i>
            Tekrar Seç
          </span>
          <span className="d-block mt-1 small">Tekrar seçmezseniz dosyalar gönderilemeyecek.</span>
        </p>
      </div>
    </div>
  );
};

export default SelectFileNotification; 