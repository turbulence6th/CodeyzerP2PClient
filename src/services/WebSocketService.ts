import SockJS from 'sockjs-client';
import Stomp, { Client } from 'stompjs';
import { Frame } from '../types';

export type ConnectCallback = (frame: Frame | string | undefined) => void;
export type ErrorCallback = (error: Frame | string | undefined) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private sockJsUrl: string;

  constructor(sockJsUrl: string) {
    this.sockJsUrl = sockJsUrl;
  }

  connect(onConnect: ConnectCallback, onError: ErrorCallback): Client | null {
    try {
      const socket = new SockJS(this.sockJsUrl);
      this.client = Stomp.over(socket);
      
      // Debug logları devre dışı bırak
      this.client.debug = () => {};
      
      this.client.connect({}, 
        (frame) => {
          this.isConnected = true;
          onConnect(frame);
        },
        (error) => {
          this.isConnected = false;
          onError(error);
        }
      );
      
      return this.client;
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }

  disconnect(callback?: () => void): void {
    if (this.client && this.isConnected) {
      try {
        this.client.disconnect(() => {
          this.isConnected = false;
          if (callback) callback();
        });
      } catch (e) {
        if (callback) callback();
      }
    } else if (callback) {
      callback();
    }
  }

  subscribe(destination: string, callback: (message: any) => void, headers?: any): { id: string; unsubscribe: () => void } | null {
    if (!this.client || !this.isConnected) {
      return null;
    }
    
    return this.client.subscribe(destination, callback, headers);
  }

  /**
   * Belirtilen hedefe bir mesaj gönderir.
   * @param destination Hedef adres (örn: /app/p2p/...) 
   * @param body Gönderilecek mesaj gövdesi (JSON.stringify ile string'e çevrilecek)
   * @param headers İsteğe bağlı STOMP başlıkları
   */
  publish(destination: string, body: any, headers?: any): void {
    if (this.client && this.isConnected) {
      try {
        this.client.send(destination, headers || {}, JSON.stringify(body));
      } catch (error) {
        console.error(`Failed to send message to ${destination}:`, error);
      }
    } else {
      console.warn('Cannot send message, WebSocket is not connected.');
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  getClient(): Client | null {
    return this.client;
  }
}

export default WebSocketService; 