import { ShareResponse, FileInfoDTO } from '../types';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async shareFile(fileName: string, fileSize: number): Promise<ShareResponse> {
    const response = await fetch(`${this.baseUrl}/file/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: fileName,
        size: fileSize
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error sharing file: ${response.statusText}`);
    }
    
    return response.json();
  }

  async unshareFile(shareHash: string, ownerToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/file/unshare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareHash,
        ownerToken
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Sunucudan hata detayı okunamadı.');
      console.error(`Error unsharing file ${shareHash}: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Error unsharing file: ${response.statusText}`);
    }
  }

  uploadFile(
    file: File, 
    shareHash: string, 
    streamHash: string, 
    ownerToken: string,
    onProgress: (progress: number) => void, 
    onSuccess: () => void, 
    onError: () => void
  ): void {
    const formData = new FormData();
    formData.append('file', file);

    const request = new XMLHttpRequest();
    request.open('POST', `${this.baseUrl}/file/upload/${shareHash}/${streamHash}`);

    request.setRequestHeader('X-Owner-Token', ownerToken);

    request.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) {
            onSuccess();
        } else {
            console.error(`Upload failed for ${shareHash}/${streamHash}: ${request.status} ${request.statusText}`, request.responseText);
            onError();
        }
    });
    request.addEventListener('error', (e) => {
        console.error(`Upload network error for ${shareHash}/${streamHash}:`, e);
        onError();
    });

    request.send(formData);
  }

  getDownloadUrl(hash: string): string {
    return `${this.baseUrl}/file/download/${hash}`;
  }

  async getFileInfo(hash: string): Promise<FileInfoDTO> {
    const response = await fetch(`${this.baseUrl}/file/info/${hash}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error fetching file info:', response.status, errorData);
      const customError: any = new Error(`Sunucudan dosya bilgileri alınırken hata oluştu: ${response.statusText}. Detay: ${errorData}`);
      customError.status = response.status;
      throw customError;
    }
    
    return response.json();
  }
}

export default ApiService; 