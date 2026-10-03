import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html'
})
export class NavbarComponent implements OnInit {
  // 1. Declaramos la señal a nivel de clase para que el HTML pueda leerla
  nombreMecanico = signal(''); 

  constructor(private router: Router) { }
  
  ngOnInit() {
    const mecanico = localStorage.getItem('mecanicoSesion');
    // 2. Si hay un mecánico guardado, actualizamos la señal
    if (mecanico) {
      this.nombreMecanico.set(mecanico);
    }
  }

  onLogout() {
    // Limpiamos la sesión antes de salir para que no se quede colgada
    localStorage.removeItem('mecanicoSesion');
    this.router.navigate(['/login']);
  }
}