import { ShareResponse } from '../types';

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

  async unshareFile(shareHash: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/file/unshare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareHash
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error unsharing file: ${response.statusText}`);
    }
  }

  uploadFile(file: File, shareHash: string, streamHash: string, onProgress: (progress: number) => void, onSuccess: () => void, onError: () => void): void {
    const formData = new FormData();
    formData.append('file', file);

    const request = new XMLHttpRequest();
    request.open('POST', `${this.baseUrl}/file/upload/${shareHash}/${streamHash}`);

    request.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    request.addEventListener('load', onSuccess);
    request.addEventListener('error', onError);

    request.send(formData);
  }

  getDownloadUrl(hash: string): string {
    return `${this.baseUrl}/file/download/${hash}`;
  }
}

export default ApiService; 