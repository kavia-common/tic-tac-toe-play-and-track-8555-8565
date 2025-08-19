import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cell, PlayerMark } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-board',
  imports: [CommonModule],
  styles: [`
    .board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      width: 100%;
      max-width: 360px;
      margin: auto;
      aspect-ratio: 1 / 1;
    }
    .cell {
      display: grid;
      place-items: center;
      background: #FAFAFA;
      border-radius: 12px;
      box-shadow: var(--shadow);
      font-size: clamp(36px, 12vw, 64px);
      font-weight: 800;
      color: var(--color-primary);
      user-select: none;
      transition: transform .05s ease, background .2s ease;
      cursor: pointer;
    }
    .cell:hover { background: #F1F8E9; }
    .cell.disabled { cursor: not-allowed; opacity: .6; }
  `],
  template: `
    <div class="board">
      <div *ngFor="let r of [0,1,2]; let ri = index">
        <div *ngFor="let c of [0,1,2]; let ci = index"
             class="cell"
             [class.disabled]="disabled || !!board?.[ri]?.[ci]"
             (click)="onClick(ri, ci)">{{ board?.[ri]?.[ci] || '' }}</div>
      </div>
    </div>
  `
})
export class BoardComponent {
  @Input() board: Cell[][] = [['','',''],['','',''],['','','']];
  @Input() disabled = false;
  @Output() move = new EventEmitter<{row: number; col: number;}>();

  // PUBLIC_INTERFACE
  onClick(row: number, col: number) {
    if (this.disabled) return;
    if (this.board?.[row]?.[col]) return;
    this.move.emit({ row, col });
  }
}
