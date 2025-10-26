import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { UnreadMessagesService } from '../../services/unread-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  standalone: false,
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedUser: any = null;
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  messages: any[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  private messageSubscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private unreadService: UnreadMessagesService
  ) { }

  ngOnInit(): void {
    // Get current user ID from localStorage (you can adjust based on your auth setup)
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT to get user ID (simple version, you might have a better way)
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = String(payload.id || payload._id || payload.userId);
    }

    // Listen for real-time messages
    this.messageSubscription = this.socketService.onNewMessage().subscribe((message) => {
      console.log('New message received via socket:', message);

      // Check if message involves current conversation
      const senderId = String(message.sender?._id || message.sender);
      const recipientId = String(message.recipient?._id || message.recipient);
      const selectedUserId = String(this.selectedUser?._id || this.selectedUser?.id);

      console.log('Sender:', senderId, 'Recipient:', recipientId, 'Selected:', selectedUserId, 'Current:', this.currentUserId);

      // If message is for current user
      if (recipientId === this.currentUserId && senderId !== this.currentUserId) {
        // If viewing this conversation, add to messages and clear unread
        if (this.selectedUser && senderId === selectedUserId) {
          console.log('Adding message to active conversation');
          this.messages.push(message);
          this.scrollToBottom();
          this.unreadService.clearUnread(senderId);
        } else {
          // Message for me but different/no conversation open - increment unread badge
          console.log('Incrementing unread badge for:', senderId);
          this.unreadService.addUnreadMessage(senderId);
        }
      }
      // If message is from current user to selected user, add to conversation
      else if (this.selectedUser && senderId === this.currentUserId && recipientId === selectedUserId) {
        console.log('Adding my sent message to conversation');
        this.messages.push(message);
        this.scrollToBottom();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Load messages when user changes
    console.log('ngOnChanges triggered:', changes);
    if (changes['selectedUser'] && this.selectedUser) {
      console.log('Loading messages for user:', this.selectedUser);
      this.loadMessages();

      // Clear unread for this user when opening conversation
      const userId = String(this.selectedUser._id || this.selectedUser.id);
      this.unreadService.clearUnread(userId);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    if (!this.selectedUser) return;

    this.chatService.getMessages(this.selectedUser._id).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messages = []; // Show empty if error (no backend yet)
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUser) return;

    const messageContent = this.newMessage;
    this.newMessage = ''; // Clear immediately

    this.chatService.sendMessage(this.selectedUser._id, messageContent).subscribe({
      next: (message) => {
        // Don't add here - let the socket listener handle it
        // The backend should emit the message via socket
        console.log('Message sent successfully, waiting for socket event');
      },
      error: (error) => {
        console.error('Error sending message:', error);
        // Restore message on error
        this.newMessage = messageContent;
      }
    });
  }

  isSentByMe(message: any): boolean {
    return message.sender === this.currentUserId || message.sender?._id === this.currentUserId;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
