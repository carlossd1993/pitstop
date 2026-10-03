import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ModalNuevaBiciComponent } from '../modal-nueva-bici/modal-nueva-bici';

// Importaciones de Firebase
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

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

  // 2. Señal para almacenar el mecánico de la sesión actual
  mecanicoActual = signal('');

  // 3. Inyectamos Firestore
  private firestore = inject(Firestore);

  // 4. Señal computada con doble filtro (mecánico y búsqueda)
  bicicletasFiltradas = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const mecanico = this.mecanicoActual().toLowerCase();
    let lista = this.bicicletas();

    if (mecanico) {
      lista = lista.filter(bici => bici.mecanico?.toLowerCase() === mecanico);
    }

    if (!termino) return lista;

    return lista.filter(bici =>
      bici.clienteNombre?.toLowerCase().includes(termino) ||
      bici.marca?.toLowerCase().includes(termino) ||
      bici.modelo?.toLowerCase().includes(termino)
    );
  });

  constructor() { }

  ngOnInit() {
    // Recuperamos el nombre con tu doble validación
    const mecanicoGuardado = localStorage.getItem('mecanicoNombre') || localStorage.getItem('mecanicoSesion');
    if (mecanicoGuardado) {
      this.mecanicoActual.set(mecanicoGuardado);
    }

    this.cargarBicicletas();
  }

  async cargarBicicletas() {
    try {
      // 1. Apuntamos a la colección 'bicicletas' en Firestore
      const bicisRef = collection(this.firestore, 'bicicletas');
      
      // 2. Traemos todos los documentos
      const snapshot = await getDocs(bicisRef);
      
      // 3. Los mapeamos incluyendo el ID real generado por Firebase
      const arrayBicis = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 4. Actualizamos la señal
      this.bicicletas.set(arrayBicis);
      console.log('🔥 Bicis de Firestore:', this.bicicletas());

    } catch (error) {
      console.error('Error cargando los datos de Firebase:', error);
    }
  }

  // 5. Función para actualizar la señal del buscador en tiempo real
  alEscribir(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}