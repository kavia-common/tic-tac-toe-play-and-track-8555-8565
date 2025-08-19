import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private auth = inject(AuthService);
  title = 'tic_tac_toe_frontend';

  // PUBLIC_INTERFACE
  username = signal<string | null>(null);

  constructor() {
    this.refreshUser();
    this.auth.authChanges.subscribe(() => this.refreshUser());
  }

  // PUBLIC_INTERFACE
  isAuthed(): boolean {
    return !!this.auth.getToken();
  }

  // PUBLIC_INTERFACE
  logout(): void {
    this.auth.logout();
  }

  private refreshUser() {
    const u = this.auth.currentUser();
    this.username.set(u?.username ?? null);
  }
}
