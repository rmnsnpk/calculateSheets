import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: ()=>{
      return import('./pages/calculate-manually-page/calculate-manually-page.component').then(c=>c.CalculateManuallyPageComponent)}
  },
  {
    path: 'import',
    loadComponent: ()=>{
      return import('./pages/import-page/import-page.component').then(c=>c.ImportPageComponent)}
  }

];
