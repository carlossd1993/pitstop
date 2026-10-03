import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ModalNuevaBiciComponent } from '../modal-nueva-bici/modal-nueva-bici';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ModalNuevaBiciComponent, RouterLink],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  // 1. Señales de datos y estado
  bicicletas = signal<any[]>([]);
  terminoBusqueda = signal('');

  // NUEVO: Señal para almacenar el mecánico de la sesión actual
  mecanicoActual = signal('');

  // 2. Señal computada con doble filtro (mecánico y búsqueda)
  bicicletasFiltradas = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    // Pasamos a minúsculas el nombre de la sesión
    const mecanico = this.mecanicoActual().toLowerCase(); 
    let lista = this.bicicletas();

    // FILTRO 1: Comparamos forzando ambos lados a minúsculas
    if (mecanico) {
      lista = lista.filter(bici => bici.mecanico?.toLowerCase() === mecanico);
    }

    // FILTRO 2: Aplicar la búsqueda por texto si el usuario ha escrito algo
    if (!termino) return lista;

    return lista.filter(bici =>
      bici.clienteNombre?.toLowerCase().includes(termino) ||
      bici.marca?.toLowerCase().includes(termino) ||
      bici.modelo?.toLowerCase().includes(termino)
    );
  });

  constructor(private location: Location) { }

  ngOnInit() {
    // NUEVO: Recuperar el nombre del mecánico de la sesión local
    const mecanicoGuardado = localStorage.getItem('mecanicoSesion');
    if (mecanicoGuardado) {
      this.mecanicoActual.set(mecanicoGuardado);
    }

    this.cargarBicicletas();
  }

  async cargarBicicletas() {
    try {
      const url = this.location.prepareExternalUrl('/data/bicicletas.json');
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      const arrayBicis = Array.isArray(datos) ? datos : datos.bicicletas || [];
      this.bicicletas.set(arrayBicis);

    } catch (error) {
      console.error('Error cargando el JSON:', error);
    }
  }

  // 4. Función para actualizar la señal del buscador en tiempo real
  alEscribir(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}