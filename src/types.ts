export interface FileItem {
  filename: string;
  size: number;
  hash: string;
  blob: File;
  downloads: Download[];
}

export interface Download {
  ip: string;
  progress: number;
  status: 'progress' | 'success' | 'failed';
  streamHash?: string;
}

export interface ShareResponse {
  shareHash: string;
}

export interface DownloadResponse {
  ip: string;
  shareHash: string;
  streamHash: string;
}

// WebSocket tipi için uyumluluk düzeltmesi
export interface Frame {
  command: string;
  headers: any;
  body: string;
  [key: string]: any;
} 