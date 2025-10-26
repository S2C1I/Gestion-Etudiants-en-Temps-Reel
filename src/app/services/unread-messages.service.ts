import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UnreadMessagesService {
    // Map of userId -> unread count
    private unreadMap = new Map<string, number>();
    private unreadSubject = new BehaviorSubject<Map<string, number>>(new Map());

    unreadMessages$ = this.unreadSubject.asObservable();

    constructor() { }

    addUnreadMessage(userId: string): void {
        const current = this.unreadMap.get(userId) || 0;
        this.unreadMap.set(userId, current + 1);
        this.unreadSubject.next(new Map(this.unreadMap));
    }

    clearUnread(userId: string): void {
        this.unreadMap.delete(userId);
        this.unreadSubject.next(new Map(this.unreadMap));
    }

    getUnreadCount(userId: string): number {
        return this.unreadMap.get(userId) || 0;
    }

    getTotalUnread(): number {
        let total = 0;
        this.unreadMap.forEach(count => total += count);
        return total;
    }
}
