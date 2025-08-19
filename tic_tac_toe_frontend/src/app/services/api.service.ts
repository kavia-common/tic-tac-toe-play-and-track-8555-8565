import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environment';
import { Game, AuthResponse } from '../models';
import { Observable } from 'rxjs';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  private authHeaders(): HttpHeaders {
    const storage = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage : null;
    const token = storage ? storage.getItem(environment.tokenKey) : null;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Auth
  // PUBLIC_INTERFACE
  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, { username, password }, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { username, password }, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  me(): Observable<any> {
    return this.http.get(`${this.base}/auth/me`, { headers: this.authHeaders() });
  }

  // Games
  // PUBLIC_INTERFACE
  createGame(as?: 'X' | 'O'): Observable<Game> {
    return this.http.post<Game>(`${this.base}/games`, as ? { as } : {}, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  joinGame(gameId: string): Observable<Game> {
    return this.http.post<Game>(`${this.base}/games/join`, { gameId }, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  myGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.base}/games/mine`, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  getGame(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.base}/games/${id}`, { headers: this.authHeaders() });
  }

  // Moves
  // PUBLIC_INTERFACE
  makeMove(gameId: string, row: number, col: number): Observable<Game> {
    return this.http.post<Game>(`${this.base}/moves`, { gameId, row, col }, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  getState(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.base}/moves/${id}`, { headers: this.authHeaders() });
  }

  // PUBLIC_INTERFACE
  getHistory(id: string): Observable<Game['moves']> {
    return this.http.get<Game['moves']>(`${this.base}/history/${id}`, { headers: this.authHeaders() });
  }
}
