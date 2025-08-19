import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="row">
      <div class="col">
        <div class="card" style="max-width:420px;margin:auto;">
          <h2 style="margin-bottom:12px;">Login</h2>
          <p class="badge" style="margin-bottom:16px;">Welcome back</p>
          <form (ngSubmit)="onSubmit()">
            <div style="display:grid;gap:12px;">
              <div>
                <label>Username</label>
                <input [(ngModel)]="username" name="username" required autocomplete="username" />
              </div>
              <div>
                <label>Password</label>
                <input [(ngModel)]="password" name="password" type="password" required autocomplete="current-password" />
              </div>
              <button [disabled]="loading()">{{ loading() ? 'Signing in...' : 'Login' }}</button>
              <button class="ghost" type="button" routerLink="/register">Create account</button>
              <div *ngIf="error()" style="color:#d32f2f;">{{ error() }}</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.auth.getToken()) {
        this.router.navigateByUrl('/play');
      }
    });
  }

  // PUBLIC_INTERFACE
  onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    this.api.login(this.username.trim(), this.password)
      .subscribe({
        next: (res) => {
          this.auth.setToken(res.token);
          this.auth.setUser(res.user);
          this.router.navigateByUrl('/play');
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Login failed');
          this.loading.set(false);
        }
      });
  }
}
