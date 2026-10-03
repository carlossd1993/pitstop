import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ModalNuevaBiciComponent } from '../modal-nueva-bici/modal-nueva-bici';

// Importaciones de Firebase
import { Firestore, collection, getDocs, onSnapshot, doc, deleteDoc } from '@angular/fire/firestore';

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
  mensajeExito = signal('');

  // Estado para modal de confirmación de eliminación con número aleatorio
  biciAEliminar = signal<any>(null);
  numeroConfirmacion = signal<number>(0);
  numeroIngresado = signal<string>('');
  eliminandoBici = signal<boolean>(false);

  get puedeEliminarBici(): boolean {
    return this.numeroIngresado().trim() === this.numeroConfirmacion().toString();
  }

  // 2. Señal para almacenar el mecánico de la sesión actual
  mecanicoActual = signal('');

  // 3. Inyectamos Firestore
  private firestore = inject(Firestore);

  // 4. Señal computada con doble filtro (mecánico y búsqueda)
  bicicletasFiltradas = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const mecActual = this.mecanicoActual().toLowerCase();
    const mecSesion = (localStorage.getItem('mecanicoSesion') || '').toLowerCase();
    const mecNombre = (localStorage.getItem('mecanicoNombre') || '').toLowerCase();
    let lista = this.bicicletas();

    if (mecActual || mecSesion || mecNombre) {
      lista = lista.filter(bici => {
        const bm = bici.mecanico?.toLowerCase();
        return bm === mecActual || bm === mecSesion || bm === mecNombre;
      });
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

    // Escuchamos la colección 'bicicletas' en tiempo real
    const bicisRef = collection(this.firestore, 'bicicletas');
    onSnapshot(bicisRef, (snapshot) => {
      const arrayBicis = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.bicicletas.set(arrayBicis);
      console.log('🔥 Bicis sincronizadas en tiempo real desde Firestore:', arrayBicis);
    }, (error) => {
      console.error('Error escuchando Firestore en tiempo real:', error);
      this.cargarBicicletas();
    });
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

  // 6. Callback cuando se crea una nueva bicicleta en Firestore
  onBiciCreada(nuevaBici: any) {
    this.cargarBicicletas();
    this.mensajeExito.set(`¡Bicicleta de ${nuevaBici.clienteNombre} (${nuevaBici.marca} ${nuevaBici.modelo}) creada con éxito para ${nuevaBici.mecanico}!`);
    setTimeout(() => {
      this.mensajeExito.set('');
    }, 5000);
  }

  // 7. Abre el modal de eliminación y genera un nuevo número de verificación
  abrirModalEliminar(bici: any) {
    this.biciAEliminar.set(bici);
    this.generarNumeroAleatorio();
  }

  // Genera un número aleatorio de 4 dígitos (entre 1000 y 9999)
  generarNumeroAleatorio() {
    const num = Math.floor(1000 + Math.random() * 9000);
    this.numeroConfirmacion.set(num);
    this.numeroIngresado.set('');
  }

  // Confirma y elimina la bicicleta seleccionada de Firestore
  async confirmarEliminarBici() {
    const bici = this.biciAEliminar();
    if (!bici || !bici.id || !this.puedeEliminarBici) return;

    try {
      this.eliminandoBici.set(true);
      const biciRef = doc(this.firestore, 'bicicletas', bici.id);
      await deleteDoc(biciRef);
      console.log(`🗑️ Bicicleta #${bici.id} eliminada desde el dashboard.`);

      // Cerrar modal de Bootstrap
      const modalEl = document.getElementById('modalEliminarBiciDashboard');
      if (modalEl) {
        const bootstrap = (window as any).bootstrap;
        if (bootstrap?.Modal) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
          modalInstance?.hide();
        } else {
          const btnCerrar = modalEl.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
          btnCerrar?.click();
        }
      }

      this.mensajeExito.set(`¡Bicicleta de ${bici.clienteNombre} (${bici.marca} ${bici.modelo}) eliminada con éxito!`);
      setTimeout(() => {
        this.mensajeExito.set('');
      }, 4500);
    } catch (error) {
      console.error('Error al eliminar bicicleta de Firestore:', error);
      alert('Hubo un error al eliminar la bicicleta en la base de datos.');
    } finally {
      this.eliminandoBici.set(false);
      this.biciAEliminar.set(null);
    }
  }
}