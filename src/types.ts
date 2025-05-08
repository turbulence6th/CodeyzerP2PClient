export interface FileItem {
  filename: string;
  size: number;
  hash: string;
  ownerToken: string;
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
  ownerToken: string;
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

// Sunucudan gelen dosya bilgilerini tutacak DTO
export interface FileInfoDTO {
  fileName: string;
  fileSize: number; // Sunucuda Long, burada number olabilir
  fileType: string;
} 