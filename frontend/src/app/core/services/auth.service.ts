import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagerUser } from '../models/ecommerce.model';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    manager: ManagerUser;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'aurelia_manager_token';
  private readonly USER_KEY = 'aurelia_manager_user';

  currentManager = signal<ManagerUser | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  constructor() {
    // If token exists, verify or keep state
    const storedToken = this.getStoredToken();
    if (storedToken) {
      this.token.set(storedToken);
      this.currentManager.set(this.getStoredUser());
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.setSession(res.data.token, res.data.manager);
          }
        }),
        catchError((err) => throwError(() => err))
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentManager.set(null);
    this.router.navigate(['/manager/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getToken(): string | null {
    return this.token() || this.getStoredToken();
  }

  private setSession(token: string, manager: ManagerUser) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(manager));
    this.token.set(token);
    this.currentManager.set(manager);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): ManagerUser | null {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
