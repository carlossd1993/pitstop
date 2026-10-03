import { Component, OnInit, NgZone, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
// Inicializamos la señal con un array vacío
bicicletas = signal<any[]>([]);  constructor(private router: Router, private zone: NgZone) { }
  ngOnInit() {
    this.cargarBicicletas();
  }

  async cargarBicicletas() {
  try {
    const respuesta = await fetch('data/bicicletas.json');
    const datos = await respuesta.json();

    // Extraemos el array (por si tu JSON empieza por { "bicicletas": [...] })
    const arrayBicis = Array.isArray(datos) ? datos : datos.bicicletas || [];

    // .set() dispara la orden directa e irrevocable de actualizar el HTML
    this.bicicletas.set(arrayBicis); 

    console.log('Comprobación de datos:', this.bicicletas());
  } catch (error) {
    console.error('Error del fetch:', error);
  }
}

  // Función que llama el botón de la barra de navegación
  onLogout() {
    // En el futuro aquí limpiaremos el token de Firebase Auth
    this.router.navigate(['/login']);
  }
}