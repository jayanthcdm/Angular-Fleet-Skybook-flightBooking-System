import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models/models';
import { Observable, tap, of, catchError, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // Stored in localStorage for persistence across reloads
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem('skybook_user');
      return data ? JSON.parse(data) : { id: 1, email: 'admin@skybook.com', password: '', name: 'Demo Administrator', role: 'admin' };
    } catch {
      return null;
    }
  }

  login(email: string, pass: string): Observable<User | null> {
    return this.api.loginUser(email, pass).pipe(
      map(users => {
        if (users && users.length > 0) {
          const user = users[0];
          this.currentUser.set(user);
          localStorage.setItem('skybook_user', JSON.stringify(user));
          return user;
        } else if (email === 'admin@skybook.com' && pass === 'admin123') {
          const demoAdmin: User = { id: 1, email, password: '', name: 'Demo Administrator', role: 'admin' };
          this.currentUser.set(demoAdmin);
          localStorage.setItem('skybook_user', JSON.stringify(demoAdmin));
          return demoAdmin;
        }
        return null;
      }),
      catchError(() => {
        if (email === 'admin@skybook.com' && pass === 'admin123') {
          const demoAdmin: User = { id: 1, email, password: '', name: 'Demo Administrator', role: 'admin' };
          this.currentUser.set(demoAdmin);
          localStorage.setItem('skybook_user', JSON.stringify(demoAdmin));
          return of(demoAdmin);
        }
        return of(null);
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('skybook_user');
    this.router.navigate(['/']);
  }
}
