import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/index-layout/index-layout').then((m) => m.IndexLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((m) => m.Register),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
    ],
  },
];
