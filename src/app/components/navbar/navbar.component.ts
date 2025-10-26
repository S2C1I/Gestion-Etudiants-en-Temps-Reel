import { Component, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { UnreadMessagesService } from '../../services/unread-messages.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  isLoggedIn: boolean = false;
  totalUnread: number = 0;
  currentUser: any = null;
  isOnline: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService,
    private socketService: SocketService,
    private notificationService: NotificationService,
    private unreadService: UnreadMessagesService
  ) {
    // Check auth status immediately
    this.checkAuthStatus();

    effect(() => {
      this.isLoggedIn = this.userService.isloggedIn();
      // Re-check auth status when login state changes
      if (this.isLoggedIn) {
        this.checkAuthStatus();
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to unread messages count
    this.unreadService.unreadMessages$.subscribe(unreadMap => {
      this.totalUnread = this.unreadService.getTotalUnread();
      console.log('Total unread messages:', this.totalUnread);
    });

    // Subscribe to connection status (BehaviorSubject gives us current value immediately)
    this.socketService.getConnectionStatus().subscribe(connected => {
      this.isOnline = connected;
      console.log('Connection status changed:', connected);
    });

    // Listen for socket notifications and store them in the service
    this.socketService.onNotification().subscribe((notification) => {
      // Add to notification service (persists across navigation)
      this.notificationService.addNotification(notification);

      // Show toast
      this.showNotificationToast(notification);
    });

    // Listen for chat messages globally to update badge everywhere
    this.socketService.onNewMessage().subscribe((message) => {
      const currentUserId = this.getCurrentUserId();
      const senderId = String(message.sender?._id || message.sender);
      const recipientId = String(message.recipient?._id || message.recipient);

      console.log('Navbar received message - Sender:', senderId, 'Recipient:', recipientId, 'CurrentUser:', currentUserId);

      // If message is for me and NOT on chat page, increment badge
      // (If on chat page, chat-window component handles it)
      if (recipientId === currentUserId && senderId !== currentUserId) {
        if (!this.router.url.includes('/chat')) {
          console.log('User not on chat page, incrementing badge for:', senderId);
          this.unreadService.addUnreadMessage(senderId);
        }
      }
    });
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    console.log('Checking auth status, token exists:', !!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = {
          prenom: payload.prenom || 'User',
          nom: payload.nom || '',
          email: payload.email
        };
        this.isLoggedIn = true;
        console.log('User authenticated:', this.currentUser);
      } catch (error) {
        console.error('Error parsing token:', error);
        this.isLoggedIn = false;
        this.currentUser = null;
      }
    } else {
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  private getCurrentUserId(): string {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return String(payload.id || payload._id || payload.userId);
      } catch (error) {
        return '';
      }
    }
    return '';
  }

  private showNotificationToast(notification: any): void {
    const message = `${notification.prenom} ${notification.nom}`;
    const modifiedBy = notification.modifiedBy
      ? ` par ${notification.modifiedBy.prenom} ${notification.modifiedBy.nom}`
      : '';

    switch (notification.action) {
      case 'add':
        this.toastr.success(message + modifiedBy, 'Nouveau candidat');
        break;
      case 'update':
        this.toastr.info(message + modifiedBy, 'Candidat modifié');
        break;
      case 'delete':
        this.toastr.error(message + modifiedBy, 'Candidat supprimé');
        break;
    }
  }

  logout() {
    this.userService.logout();
    this.currentUser = null;
    this.isLoggedIn = false;
    this.isOnline = false;
    this.router.navigate(['/']);
  }

}
