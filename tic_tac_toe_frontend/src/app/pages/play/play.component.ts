import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Game, PlayerMark } from '../../models';
import { BoardComponent } from '../../shared/board/board.component';
import { CommonModule, DatePipe, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-play',
  imports: [CommonModule, FormsModule, BoardComponent, DatePipe],
  styles: [`
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    @media (min-width: 920px) {
      .layout {
        grid-template-columns: 260px 1fr 260px;
      }
    }
    .panel {
      display: grid; gap: 12px;
      align-content: start;
    }
    .status {
      text-align: center;
      padding: 8px 10px;
      border-radius: 10px;
      background: #E0F2F1;
      color: #004D40;
      font-weight: 600;
    }
    .list {
      display: grid; gap: 8px;
      max-height: 340px; overflow: auto;
    }
    .list .item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border-radius: 10px; background: #FAFAFA; border: 1px solid #ECEFF1;
    }
  `],
  template: `
    <div class="layout">
      <div class="panel">
        <div class="card">
          <h3>New Game</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
            <select [(ngModel)]="preferred" title="Preferred Side">
              <option [ngValue]="undefined">Auto (X)</option>
              <option value="X">Play as X</option>
              <option value="O">Play as O</option>
            </select>
            <button (click)="createGame()">Create</button>
          </div>
        </div>

        <div class="card">
          <h3>Join Game</h3>
          <div style="display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:8px;">
            <input placeholder="Enter Game ID" [(ngModel)]="joinId" />
            <button class="secondary" (click)="joinGame()">Join</button>
          </div>
        </div>

        <div class="card">
          <h3>Your Games</h3>
          <div class="list" style="margin-top:8px;">
            <div class="item" *ngFor="let g of myGames()">
              <div>
                <div style="font-weight:600;">{{ g.id }}</div>
                <div class="badge">{{ g.status }}</div>
              </div>
              <button class="ghost" (click)="load(g.id)">Open</button>
            </div>
            <div *ngIf="!myGames().length" class="badge">No games yet</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="card" style="display:grid;gap:12px;">
          <div class="status" *ngIf="game(); else noGame">
            <ng-container [ngSwitch]="game()?.status">
              <div *ngSwitchCase="'WAITING'">Waiting for opponent to join...</div>
              <div *ngSwitchCase="'IN_PROGRESS'">Turn: {{ game()?.nextTurn }}</div>
              <div *ngSwitchCase="'X_WON'">Result: X won</div>
              <div *ngSwitchCase="'O_WON'">Result: O won</div>
              <div *ngSwitchCase="'DRAW'">Result: Draw</div>
            </ng-container>
          </div>
          <ng-template #noGame><div class="badge">Create or join a game to start</div></ng-template>

          <app-board
            [board]="game()?.board || defaultBoard"
            [disabled]="boardDisabled()"
            (move)="place($event.row, $event.col)"
          ></app-board>

          <div *ngIf="game()" style="display:flex;gap:8px;justify-content:center;">
            <span class="badge">Game ID: {{ game()?.id }}</span>
            <span class="badge">You: {{ mySide() || 'Spectator' }}</span>
          </div>

          <div *ngIf="error()" style="color:#d32f2f;text-align:center;">{{ error() }}</div>
        </div>
      </div>

      <div class="panel">
        <div class="card">
          <h3>Move History</h3>
          <div class="list" style="margin-top:8px;">
            <div class="item" *ngFor="let m of history()">
              <div>#{{ mIndex(m) }} • {{ m.player }} → ({{ m.row }}, {{ m.col }})</div>
              <div class="badge">{{ m.at | date:'shortTime' }}</div>
            </div>
            <div *ngIf="!history().length" class="badge">No moves yet</div>
          </div>
        </div>

        <div class="card">
          <h3>Realtime</h3>
          <p class="badge">Polling every 2s. Future: WebSockets/SSE.</p>
          <button class="ghost" (click)="togglePolling()">
            {{ polling() ? 'Pause updates' : 'Resume updates' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class PlayComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  defaultBoard: Game['board'] = [['','',''],['','',''],['','','']];
  game = signal<Game | null>(null);
  history = signal<Game['moves']>([]);
  myGames = signal<Game[]>([]);
  error = signal<string | null>(null);
  preferred: PlayerMark | undefined = undefined;
  joinId = '';
  polling = signal(true);
  private timer?: any;

  mySide = computed<PlayerMark | null>(() => {
    const g = this.game();
    const me = this.auth.currentUser()?.id;
    if (!g || !me) return null;
    if (g.players.X === me) return 'X';
    if (g.players.O === me) return 'O';
    return null;
  });

  boardDisabled = computed<boolean>(() => {
    const g = this.game();
    const my = this.mySide();
    if (!g || !my) return true;
    if (g.status !== 'IN_PROGRESS') return true;
    return g.nextTurn !== my;
  });

  ngOnInit(): void {
    // Initialize auth state on page load
    this.auth.init().then(() => {
      this.refreshMyGames();
    });
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // PUBLIC_INTERFACE
  createGame() {
    this.error.set(null);
    this.api.createGame(this.preferred).subscribe({
      next: (g) => {
        this.game.set(g);
        this.loadHistory(g.id);
        this.refreshMyGames();
      },
      error: (err) => this.error.set(err?.error?.message || 'Create game failed')
    });
  }

  // PUBLIC_INTERFACE
  joinGame() {
    const id = this.joinId.trim();
    if (!id) return;
    this.error.set(null);
    this.api.joinGame(id).subscribe({
      next: (g) => {
        this.game.set(g);
        this.loadHistory(g.id);
        this.refreshMyGames();
      },
      error: (err) => this.error.set(err?.error?.message || 'Join game failed')
    });
  }

  // PUBLIC_INTERFACE
  load(id: string) {
    this.api.getGame(id).subscribe({
      next: (g) => {
        this.game.set(g);
        this.loadHistory(id);
      }
    });
  }

  private refreshMyGames() {
    this.api.myGames().subscribe({
      next: (list) => this.myGames.set(list || []),
      error: () => this.myGames.set([])
    });
  }

  // PUBLIC_INTERFACE
  place(row: number, col: number) {
    const g = this.game();
    if (!g) return;
    this.api.makeMove(g.id, row, col).subscribe({
      next: (updated) => {
        this.game.set(updated);
        this.loadHistory(updated.id);
        this.refreshMyGames();
      },
      error: (err) => this.error.set(err?.error?.message || 'Invalid move')
    });
  }

  private loadHistory(id: string) {
    this.api.getHistory(id).subscribe({
      next: (moves) => this.history.set(moves || []),
      error: () => this.history.set([])
    });
  }

  private tick() {
    if (!this.polling()) return;
    const g = this.game();
    if (!g) return;
    this.api.getState(g.id).subscribe({
      next: (state) => {
        this.game.set(state);
        this.loadHistory(state.id);
      }
    });
  }

  private startPolling() {
    this.stopPolling();
    const g = (typeof globalThis !== 'undefined' ? (globalThis as any) : null);
    const setInt = g?.setInterval?.bind(g) || (() => undefined);
    this.timer = setInt(() => this.tick(), 2000);
  }

  private stopPolling() {
    if (this.timer) {
      const g = (typeof globalThis !== 'undefined' ? (globalThis as any) : null);
      const clr = g?.clearInterval?.bind(g);
      if (clr) clr(this.timer);
      this.timer = undefined;
    }
  }

  // PUBLIC_INTERFACE
  togglePolling() {
    this.polling.set(!this.polling());
  }

  // PUBLIC_INTERFACE
  mIndex(m: Game['moves'][number]): number {
    const arr = this.history();
    return arr.indexOf(m) + 1;
  }
}
