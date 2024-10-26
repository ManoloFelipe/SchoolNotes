import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./main/main.page').then((m) => m.MainPage),
  },
  {
    path: 'notes/:folderId',
    loadComponent: () => import('./notes/notes.page').then((m) => m.NotesPage),
  },
  {
    path: '**',
    loadComponent: () => import('./main/main.page').then((m) => m.MainPage),
  }
];
