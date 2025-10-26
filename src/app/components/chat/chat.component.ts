import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  selectedUser: any = null;

  onUserSelected(user: any): void {
    console.log('User selected in chat component:', user);
    this.selectedUser = user;
    console.log('selectedUser updated:', this.selectedUser);
  }
}
