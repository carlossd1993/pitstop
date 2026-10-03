import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';
import { ModalNuevaBiciComponent } from '../modal-nueva-bici/modal-nueva-bici';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ModalNuevaBiciComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  // 1. Señal con la lista original de bicicletas
  bicicletas = signal<any[]>([]);

  // 2. Señal que guarda lo que el usuario teclea en el buscador
  terminoBusqueda = signal('');

  // 3. Señal computada que filtra la lista automáticamente
  bicicletasFiltradas = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const lista = this.bicicletas();

    if (!termino) return lista;

    return lista.filter(bici =>
      bici.clienteNombre?.toLowerCase().includes(termino) ||
      bici.marca?.toLowerCase().includes(termino) ||
      bici.modelo?.toLowerCase().includes(termino)
    );
  });

  constructor(private location: Location) { }

  ngOnInit() {
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