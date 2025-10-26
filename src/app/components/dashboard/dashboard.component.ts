import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/user.service';
import { EtudiantsService } from '../../services/etudiants.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  totalEtudiants: number = 0;
  totalUsers: number = 0;
  notifications: any[] = [];
  private notificationSubscription?: Subscription;

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private etudiantsService: EtudiantsService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.getTotalEtudiants();
    this.getTotalUsers();

    // Load existing notifications from service
    this.notifications = this.notificationService.getCurrentNotifications();

    // Subscribe to notification updates
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });

    // Still listen for etudiant updates to refresh totals
    this.socketService.onEtudiantUpdate().subscribe((data) => {
      console.log('Received etudiant update via WebSocket:', data);
      this.getTotalEtudiants();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  getTotalEtudiants() {
    this.etudiantsService.getTotalEtudiants().subscribe((res: any) => {
      this.totalEtudiants = res.total;
    });
  }

  getTotalUsers() {
    this.userService.getAllUsers().subscribe((res: any) => {
      this.totalUsers = res.length;
    });
  }

}
