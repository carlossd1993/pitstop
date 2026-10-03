import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Definimos la estructura de los datos que esperamos
export interface Bicicleta {
  id: string;
  clienteId: string;
  clienteNombre: string;
  marca: string;
  modelo: string;
  tipo: string;
  esElectrica: boolean;
  mtbTipo: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  bicicletas: Bicicleta[] = [];
  constructor(private router: Router) { }
  ngOnInit() {
    this.cargarBicicletas();
  }

  async cargarBicicletas() {
    try {
      // Llamada simulada a la base de datos usando el JSON local
      const respuesta = await fetch('data/bicicletas.json');
      this.bicicletas = await respuesta.json();
    } catch (error) {
      console.error('Error cargando el JSON de prueba:', error);
    }
  }

  // Función que llama el botón de la barra de navegación
  onLogout() {
    // En el futuro aquí limpiaremos el token de Firebase Auth
    this.router.navigate(['/login']);
  }
}