import React, { useEffect, useState } from 'react';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileNotification from './FileNotification';
import ShareNotification from './ShareNotification';
import TransferCompleteNotification from './TransferCompleteNotification';
import TransferFailedNotification from './TransferFailedNotification';
import UtilsService from '../services/UtilsService';
import './toast.css';

// Responsive toast position için yardımcı fonksiyon
const getToastPosition = () => {
  return window.innerWidth <= 576 ? "top-center" : "bottom-right";
};

export const showFileNotification = (filename: string, fileSize: number, ip: string) => {
  toast.info(
    <FileNotification 
      filename={filename}
      fileSize={fileSize}
      ip={ip}
    />, 
    {
      position: getToastPosition(),
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    }
  );
};

export const showShareSuccessNotification = (filename: string, fileSize: number, shareHash: string) => {
  toast.success(
    <ShareNotification 
      filename={filename}
      fileSize={fileSize}
      shareHash={shareHash}
    />, 
    {
      position: getToastPosition(),
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    }
  );
};

export const showTransferCompleteNotification = (filename: string, fileSize: number, ip: string) => {
  toast.success(
    <TransferCompleteNotification 
      filename={filename}
      fileSize={fileSize}
      ip={ip}
    />, 
    {
      position: getToastPosition(),
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    }
  );
};

export const showTransferFailedNotification = (filename: string, fileSize: number, ip: string, error?: string) => {
  toast.error(
    <TransferFailedNotification 
      filename={filename}
      fileSize={fileSize}
      ip={ip}
      error={error}
    />, 
    {
      position: getToastPosition(),
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    }
  );
};

const ToastProvider: React.FC = () => {
  const [toastPosition, setToastPosition] = useState(getToastPosition());
  
  useEffect(() => {
    const handleResize = () => {
      setToastPosition(getToastPosition());
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <ToastContainer
      position={toastPosition as any}
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      className="codeyzer-toast-container"
      toastClassName="codeyzer-toast"
      style={{
        '--toastify-bg-color': 'rgba(30, 30, 30, 0.95)',
        '--toastify-color-progress-success': '#FF7F2A',
        '--toastify-color-progress-info': '#FF7F2A',
        '--toastify-color-progress-error': '#FF7F2A',
        '--toastify-color-progress-warning': '#FF7F2A',
        '--toastify-color-progress-light': '#FF7F2A',
        '--toastify-color-progress-dark': '#FF7F2A',
        '--toastify-icon-color-success': '#FF7F2A',
        '--toastify-icon-color-info': '#FF7F2A',
        '--toastify-icon-color-error': '#FF7F2A',
        '--toastify-icon-color-warning': '#FF7F2A',
        '--toastify-icon-color-light': '#FF7F2A',
        '--toastify-icon-color-dark': '#FF7F2A',
        '--toastify-text-color-light': '#ffffff',
        '--toastify-text-color-dark': '#ffffff',
        '--toastify-spinner-color': '#FF7F2A',
        '--toastify-spinner-color-empty-area': '#FF7F2A',
        '--toastify-color-progress-bgo': 'rgba(255, 127, 42, 0.2)',
        '--toastify-color-progress-success-bgo': 'rgba(255, 127, 42, 0.2)',
        '--toastify-color-progress-info-bgo': 'rgba(255, 127, 42, 0.2)',
        '--toastify-color-progress-error-bgo': 'rgba(255, 127, 42, 0.2)',
        '--toastify-color-progress-warning-bgo': 'rgba(255, 127, 42, 0.2)',
        '--toastify-color-progress-light-bgo': 'rgba(255, 127, 42, 0.2)',
        '--toastify-color-progress-dark-bgo': 'rgba(255, 127, 42, 0.2)',
      } as React.CSSProperties}
    />
  );
};

export default ToastProvider; 