import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private onlineUsers$ = new BehaviorSubject<string[]>([]);
  private newMessage$ = new BehaviorSubject<any>(null);
  private notification$ = new BehaviorSubject<any>(null);
  private userOnline$ = new BehaviorSubject<string | null>(null);
  private userOffline$ = new BehaviorSubject<string | null>(null);
  private etudiantUpdate$ = new BehaviorSubject<any>(null);
  private etudiantAdded$ = new BehaviorSubject<any>(null);
  private etudiantUpdated$ = new BehaviorSubject<any>(null);
  private etudiantDeleted$ = new BehaviorSubject<any>(null);

  constructor() {
    this.socket = io(environment.socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Emit user online status when connected
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connectionStatus$.next(true);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id || payload._id || payload.userId;
          if (userId) {
            console.log('Emitting userOnline for:', userId);
            this.socket.emit('userOnline', userId);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionStatus$.next(false);
    });

    this.socket.on('reconnect', () => {
      console.log('Socket reconnected');
      this.connectionStatus$.next(true);
    });

    // Set up persistent listeners that broadcast to BehaviorSubjects
    this.socket.on('onlineUsers', (users: string[]) => {
      console.log('SocketService received onlineUsers:', users);
      this.onlineUsers$.next(users);
    });

    this.socket.on('userOnline', (userId: string) => {
      console.log('SocketService received userOnline:', userId);
      this.userOnline$.next(userId);
    });

    this.socket.on('userOffline', (userId: string) => {
      console.log('SocketService received userOffline:', userId);
      this.userOffline$.next(userId);
    });

    this.socket.on('newMessage', (message: any) => {
      console.log('SocketService received newMessage:', message);
      this.newMessage$.next(message);
    });

    this.socket.on('notification', (notification: any) => {
      console.log('SocketService received notification:', notification);
      this.notification$.next(notification);
    });

    // Etudiant-related events
    this.socket.on('etudiantUpdate', (data: any) => {
      console.log('SocketService received etudiantUpdate:', data);
      this.etudiantUpdate$.next(data);
    });

    this.socket.on('etudiantAdded', (data: any) => {
      console.log('SocketService received etudiantAdded:', data);
      this.etudiantAdded$.next(data);
    });

    this.socket.on('etudiantUpdated', (data: any) => {
      console.log('SocketService received etudiantUpdated:', data);
      this.etudiantUpdated$.next(data);
    });

    this.socket.on('etudiantDeleted', (data: any) => {
      console.log('SocketService received etudiantDeleted:', data);
      this.etudiantDeleted$.next(data);
    });
  }

  // Add this method to listen for notifications
  onNotification(): Observable<any> {
    return this.notification$.asObservable();
  }

  // Chat socket listeners
  onNewMessage(): Observable<any> {
    return this.newMessage$.asObservable();
  }

  // Listen for user online events
  onUserOnline(): Observable<string | null> {
    return this.userOnline$.asObservable();
  }

  // Listen for user offline events
  onUserOffline(): Observable<string | null> {
    return this.userOffline$.asObservable();
  }

  // Etudiant event listeners
  onEtudiantUpdate(): Observable<any> {
    return this.etudiantUpdate$.asObservable();
  }

  onEtudiantAdded(): Observable<any> {
    return this.etudiantAdded$.asObservable();
  }

  onEtudiantUpdated(): Observable<any> {
    return this.etudiantUpdated$.asObservable();
  }

  onEtudiantDeleted(): Observable<any> {
    return this.etudiantDeleted$.asObservable();
  }

  // Emit typing indicator
  emitTyping(recipientId: string): void {
    this.socket.emit('typing', { recipientId });
  }

  // Generic method to emit any socket event
  emit(eventName: string, data?: any): void {
    this.socket.emit(eventName, data);
  }

  // Check if socket is connected
  isConnected(): Promise<boolean> {
    return Promise.resolve(this.socket.connected);
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket.id;
  }

  // Get connection status as Observable (uses BehaviorSubject so late subscribers get current value)
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  // Get online users as Observable (uses BehaviorSubject so late subscribers get current value)
  getOnlineUsers(): Observable<string[]> {
    return this.onlineUsers$.asObservable();
  }

  // Request fresh online users list from server
  requestOnlineUsers(): void {
    console.log('Requesting online users from server...');
    this.socket.emit('getOnlineUsers', {});
  }
}
