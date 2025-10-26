import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { EtudiantsService } from '../../services/etudiants.service';
import { SocketService } from '../../services/socket.service';
import { UnreadMessagesService } from '../../services/unread-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  standalone: false,
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent implements OnInit, OnDestroy {
  allContacts: any[] = [];
  filteredContacts: any[] = [];
  selectedUserId: string | null = null;
  searchTerm: string = '';
  onlineUsers: Set<string> = new Set(); // Track online users
  currentUserId: string = ''; // Current logged-in user
  private socketSubscription?: Subscription;

  @Output() userSelected = new EventEmitter<any>();

  constructor(
    private userService: UserService,
    private etudiantsService: EtudiantsService,
    private socketService: SocketService,
    private unreadService: UnreadMessagesService
  ) { }

  ngOnInit(): void {
    // Get current user ID
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = String(payload.id || payload._id || payload.userId);
        console.log('Current user ID:', this.currentUserId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }

    this.loadAllContacts();
    this.listenToOnlineStatus(); // Set up listeners

    // Request fresh online users list when component loads
    this.socketService.requestOnlineUsers();
  } ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  listenToOnlineStatus(): void {
    console.log('Setting up online status listeners...');

    // Subscribe to online users from SocketService (BehaviorSubject gives current value immediately)
    this.socketService.getOnlineUsers().subscribe((users: string[]) => {
      console.log('Received online users list:', users);
      // Convert all to strings
      this.onlineUsers = new Set(users.map(id => String(id)));
      console.log('Online users set:', Array.from(this.onlineUsers));
      this.filterOnlineContacts();
    });

    // Listen for individual user online/offline events using the persistent listeners
    this.socketService.onUserOnline().subscribe((userId: string | null) => {
      if (userId) {
        console.log('User came online:', userId, typeof userId);
        this.onlineUsers.add(String(userId)); // Ensure string
        console.log('Online users now:', Array.from(this.onlineUsers));
        this.filterOnlineContacts();
      }
    });

    this.socketService.onUserOffline().subscribe((userId: string | null) => {
      if (userId) {
        console.log('User went offline:', userId);
        this.onlineUsers.delete(String(userId)); // Ensure string
        console.log('Online users now:', Array.from(this.onlineUsers));
        this.filterOnlineContacts();
      }
    });
  }

  filterOnlineContacts(): void {
    console.log('Filtering online contacts...');
    console.log('All contacts:', this.allContacts.length);
    console.log('Online users:', Array.from(this.onlineUsers));

    // Filter to show only online users (excluding current user)
    this.filteredContacts = this.allContacts.filter(contact => {
      const contactId = String(contact._id || contact.id); // Convert to string
      const isOnline = this.onlineUsers.has(contactId);
      const isSelf = contactId === this.currentUserId;
      console.log(`Contact ${contact.prenom} ${contact.nom} (${contactId}): ${isOnline ? 'ONLINE' : 'offline'}, isSelf: ${isSelf}`);
      return isOnline && !isSelf; // Exclude self
    });

    console.log('Filtered to', this.filteredContacts.length, 'online contacts');

    // Apply search filter if active
    if (this.searchTerm.trim()) {
      this.filterContacts();
    }
  }

  loadAllContacts(): void {
    console.log('Loading all contacts...');

    // Load users
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        const usersWithType = users.map((u: any) => ({ ...u, type: 'user' }));

        // Load students
        this.etudiantsService.getEtudiants(1, 1000, '').subscribe({
          next: (response) => {
            console.log('Students loaded:', response);

            // The response structure is { data: [...], total: number }
            const studentsArray = response.data || [];
            const students = studentsArray.map((s: any) => ({ ...s, type: 'etudiant' }));

            // Combine both
            this.allContacts = [...usersWithType, ...students];
            this.filterOnlineContacts(); // Filter by online status
            console.log('All contacts:', this.allContacts);
            console.log('Filtered contacts:', this.filteredContacts);
          },
          error: (error) => {
            console.error('Error loading students:', error);
            this.allContacts = usersWithType;
            this.filterOnlineContacts(); // Filter by online status
            console.log('All contacts (users only):', this.allContacts);
          }
        });
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  filterContacts(): void {
    const term = this.searchTerm.toLowerCase().trim();

    // Start with online users only (excluding self)
    let contacts = this.allContacts.filter(contact => {
      const contactId = String(contact._id || contact.id); // Convert to string
      return this.onlineUsers.has(contactId) && contactId !== this.currentUserId;
    });

    if (!term) {
      this.filteredContacts = contacts;
      return;
    }

    // Apply search filter
    this.filteredContacts = contacts.filter(contact => {
      const fullName = `${contact.prenom} ${contact.nom}`.toLowerCase();
      const email = contact.email?.toLowerCase() || '';
      return fullName.includes(term) || email.includes(term);
    });
  }

  selectUser(user: any): void {
    this.selectedUserId = String(user._id || user.id); // Convert to string
    this.userSelected.emit(user);
  }

  getUnreadCount(userId: string): number {
    return this.unreadService.getUnreadCount(String(userId));
  }
}
