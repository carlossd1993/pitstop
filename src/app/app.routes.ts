import { Routes } from '@angular/router';
import { Login } from './login/login'; // Asegúrate de que la ruta coincida con tu estructura

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' // Redirige la raíz de la web directamente al login
  },
  { 
    path: '**', 
    redirectTo: '/login' // Cualquier ruta mal escrita enviará al usuario al login
  }
];