import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications: any[] = [];
    private maxNotifications: number = 10;
    private notificationsSubject = new BehaviorSubject<any[]>([]);

    constructor() { }

    // Get notifications as observable
    getNotifications(): Observable<any[]> {
        return this.notificationsSubject.asObservable();
    }

    // Add a new notification
    addNotification(notification: any): void {
        this.notifications.unshift({
            action: notification.action,
            prenom: notification.prenom,
            nom: notification.nom,
            email: notification.email,
            matiere: notification.matiere,
            timestamp: new Date(notification.timestamp),
            modifiedBy: notification.modifiedBy
        });

        // Keep only last N notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.pop();
        }

        // Emit updated notifications
        this.notificationsSubject.next([...this.notifications]);
    }

    // Get current notifications (for initial load)
    getCurrentNotifications(): any[] {
        return [...this.notifications];
    }

    // Clear all notifications
    clearNotifications(): void {
        this.notifications = [];
        this.notificationsSubject.next([]);
    }
}
