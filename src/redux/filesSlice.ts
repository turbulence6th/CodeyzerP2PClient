import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileItem, Download } from '../types';

interface FilesState {
  sharedFiles: FileItem[];
  pendingFiles: string[];
  socketConnected: boolean;
}

const initialState: FilesState = {
  sharedFiles: [],
  pendingFiles: [],
  socketConnected: false
};

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setSharedFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.sharedFiles = action.payload;
    },
    addSharedFile: (state, action: PayloadAction<FileItem>) => {
      state.sharedFiles.push(action.payload);
    },
    removeSharedFile: (state, action: PayloadAction<string>) => {
      state.sharedFiles = state.sharedFiles.filter(file => file.hash !== action.payload);
    },
    updateFileDownloads: (state, action: PayloadAction<{hash: string, downloads: Download[]}>) => {
      const fileIndex = state.sharedFiles.findIndex(file => file.hash === action.payload.hash);
      if (fileIndex !== -1) {
        state.sharedFiles[fileIndex].downloads = action.payload.downloads;
      }
    },
    updateDownloadProgress: (state, action: PayloadAction<{
      hash: string,
      ip: string,
      streamHash: string,
      progress: number
    }>) => {
      const { hash, ip, streamHash, progress } = action.payload;
      const fileIndex = state.sharedFiles.findIndex(file => file.hash === hash);
      
      if (fileIndex !== -1) {
        const downloadIndex = state.sharedFiles[fileIndex].downloads.findIndex(
          d => d.ip === ip && d.streamHash === streamHash
        );
        
        if (downloadIndex !== -1) {
          state.sharedFiles[fileIndex].downloads[downloadIndex].progress = progress;
        }
      }
    },
    updateDownloadStatus: (state, action: PayloadAction<{
      hash: string,
      ip: string,
      streamHash: string,
      status: 'progress' | 'success' | 'failed'
    }>) => {
      const { hash, ip, streamHash, status } = action.payload;
      const fileIndex = state.sharedFiles.findIndex(file => file.hash === hash);
      
      if (fileIndex !== -1) {
        const downloadIndex = state.sharedFiles[fileIndex].downloads.findIndex(
          d => d.ip === ip && d.streamHash === streamHash
        );
        
        if (downloadIndex !== -1) {
          state.sharedFiles[fileIndex].downloads[downloadIndex].status = status;
        }
      }
    },
    addDownload: (state, action: PayloadAction<{
      hash: string,
      download: Download
    }>) => {
      const fileIndex = state.sharedFiles.findIndex(file => file.hash === action.payload.hash);
      if (fileIndex !== -1) {
        state.sharedFiles[fileIndex].downloads.push(action.payload.download);
      }
    },
    setPendingFiles: (state, action: PayloadAction<string[]>) => {
      state.pendingFiles = action.payload;
    },
    addPendingFile: (state, action: PayloadAction<string>) => {
      state.pendingFiles.push(action.payload);
    },
    removePendingFile: (state, action: PayloadAction<string>) => {
      state.pendingFiles = state.pendingFiles.filter(hash => hash !== action.payload);
    },
    reorderFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.sharedFiles = action.payload;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    }
  }
});

export const {
  setSharedFiles,
  addSharedFile,
  removeSharedFile,
  updateFileDownloads,
  updateDownloadProgress,
  updateDownloadStatus,
  addDownload,
  setPendingFiles,
  addPendingFile,
  removePendingFile,
  reorderFiles,
  setSocketConnected
} = filesSlice.actions;

export default filesSlice.reducer; 