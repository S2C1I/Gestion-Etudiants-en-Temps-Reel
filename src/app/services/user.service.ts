import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  // add this inside the class (and add `import { signal } from '@angular/core';` at the top)
  isloggedIn = signal<boolean>(false);

  constructor(private http: HttpClient) {
    // Check if user is already logged in on service initialization
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token is valid (basic check)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
          this.isloggedIn.set(true);
          console.log('User already logged in from localStorage');
        } else {
          // Token expired
          localStorage.removeItem('token');
          console.log('Token expired, removing');
        }
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem('token');
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isloggedIn.set(true);
          console.log(this.isloggedIn);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isloggedIn.set(false);
  }

  getAllUsers() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }



}




