export type PlayerMark = 'X' | 'O';
export type Cell = '' | PlayerMark;

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Game {
  id: string;
  board: Cell[][];
  players: { X: string | null; O: string | null };
  nextTurn: PlayerMark;
  status: 'WAITING' | 'IN_PROGRESS' | 'X_WON' | 'O_WON' | 'DRAW';
  moves: Array<{ row: number; col: number; player: PlayerMark; at: string }>;
  createdAt: string;
  updatedAt: string;
}
