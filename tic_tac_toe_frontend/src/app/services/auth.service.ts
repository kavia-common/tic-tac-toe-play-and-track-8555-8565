import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../environment';
import { User } from '../models';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  authChanges = new Subject<void>();
  private _user: User | null = null;

  private storage(): any | null {
    return (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage : null;
  }

  // PUBLIC_INTERFACE
  async init(): Promise<void> {
    const token = this.getToken();
    if (!token) return;
    try {
      const u = await this.api.me().toPromise();
      this._user = u as User;
    } catch {
      this.logout();
    }
  }

  // PUBLIC_INTERFACE
  setToken(token: string) {
    const s = this.storage();
    if (s) s.setItem(environment.tokenKey, token);
    this.authChanges.next();
  }

  // PUBLIC_INTERFACE
  getToken(): string | null {
    const s = this.storage();
    return s ? s.getItem(environment.tokenKey) : null;
  }

  // PUBLIC_INTERFACE
  currentUser(): User | null {
    return this._user;
  }

  // PUBLIC_INTERFACE
  setUser(u: User | null) {
    this._user = u;
    this.authChanges.next();
  }

  // PUBLIC_INTERFACE
  logout() {
    const s = this.storage();
    if (s) s.removeItem(environment.tokenKey);
    this._user = null;
    this.authChanges.next();
    this.router.navigateByUrl('/login');
  }
}
