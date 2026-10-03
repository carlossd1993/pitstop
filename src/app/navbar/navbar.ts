import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  constructor(private router: Router) { }

  onLogout() {
    // Lógica de Firebase y redirección
    this.router.navigate(['/login']);
  }
}