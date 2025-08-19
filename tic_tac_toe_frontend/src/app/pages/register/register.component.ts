import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="row">
      <div class="col">
        <div class="card" style="max-width:420px;margin:auto;">
          <h2 style="margin-bottom:12px;">Create account</h2>
          <p class="badge" style="margin-bottom:16px;">Play and track matches</p>
          <form (ngSubmit)="onSubmit()">
            <div style="display:grid;gap:12px;">
              <div>
                <label>Username</label>
                <input [(ngModel)]="username" name="username" required autocomplete="username" />
              </div>
              <div>
                <label>Password</label>
                <input [(ngModel)]="password" type="password" name="password" required autocomplete="new-password" />
              </div>
              <button [disabled]="loading()">{{ loading() ? 'Creating...' : 'Register' }}</button>
              <button type="button" class="ghost" routerLink="/login">Back to login</button>
              <div *ngIf="error()" style="color:#d32f2f;">{{ error() }}</div>
              <div *ngIf="success()" style="color:#2e7d32;">Registered! You can now login.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // PUBLIC_INTERFACE
  onSubmit() {
    this.error.set(null);
    this.success.set(false);
    this.loading.set(true);
    this.api.register(this.username.trim(), this.password)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          const g = (typeof globalThis !== 'undefined' ? (globalThis as any) : null);
          const sTO = g?.setTimeout?.bind(g);
          if (sTO) sTO(() => this.router.navigateByUrl('/login'), 800);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Register failed');
          this.loading.set(false);
        }
      });
  }
}
