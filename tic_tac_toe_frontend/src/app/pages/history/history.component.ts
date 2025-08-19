import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Game } from '../../models';
import { BoardComponent } from '../../shared/board/board.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-history',
  imports: [CommonModule, BoardComponent, DatePipe],
  template: `
    <div class="row">
      <div class="col">
        <div class="card">
          <h3>Your Games</h3>
          <div style="display:grid;gap:8px;margin-top:8px;">
            <div class="item" *ngFor="let g of games()" style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:600;">{{ g.id }}</div>
                <div class="badge">{{ g.status }}</div>
              </div>
              <button class="ghost" (click)="select(g)">View</button>
            </div>
            <div *ngIf="!games().length" class="badge">No games yet</div>
          </div>
        </div>
      </div>
      <div class="col" *ngIf="selected()">
        <div class="card" style="display:grid;gap:12px;">
          <h3>Game {{ selected()?.id }}</h3>
          <app-board [board]="selected()?.board || defaultBoard" [disabled]="true"></app-board>
          <div>
            <div class="badge">Status: {{ selected()?.status }}</div>
          </div>
          <div>
            <h4>Moves</h4>
            <div style="display:grid;gap:8px;margin-top:8px;">
              <div class="item" *ngFor="let m of selected()?.moves; let i = index">
                <div>#{{ i + 1 }} • {{ m.player }} → ({{ m.row }}, {{ m.col }})</div>
                <div class="badge">{{ m.at | date:'short' }}</div>
              </div>
              <div *ngIf="!selected()?.moves?.length" class="badge">No moves</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);

  games = signal<Game[]>([]);
  selected = signal<Game | null>(null);
  defaultBoard: Game['board'] = [['','',''],['','',''],['','','']];

  ngOnInit(): void {
    this.api.myGames().subscribe({
      next: (list) => this.games.set(list || [])
    });
  }

  // PUBLIC_INTERFACE
  select(g: Game) {
    this.api.getGame(g.id).subscribe({
      next: (full) => this.selected.set(full)
    });
  }
}
