import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PlayComponent } from './pages/play/play.component';
import { HistoryComponent } from './pages/history/history.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'play' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  { path: 'play', component: PlayComponent, title: 'Play' },
  { path: 'history', component: HistoryComponent, title: 'History' },
  { path: '**', redirectTo: 'play' }
];
