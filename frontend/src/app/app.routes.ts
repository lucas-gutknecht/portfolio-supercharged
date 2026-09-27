import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Lucas Gutknecht · Data Engineer',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'this-website',
    title: 'How this site is built · Lucas Gutknecht',
    loadComponent: () => import('./pages/this-website/this-website').then((m) => m.ThisWebsite),
  },
  {
    path: 'live-api',
    title: 'Live API console · Lucas Gutknecht',
    loadComponent: () => import('./pages/api-console/api-console').then((m) => m.ApiConsole),
  },
  // Keep the old Swagger link working.
  { path: 'apidocs', redirectTo: 'live-api' },
  { path: '**', redirectTo: '' },
];
