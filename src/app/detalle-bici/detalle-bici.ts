import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { NavbarComponent } from '../navbar/navbar';
import { ComponenteBiciComponent, ComponenteBiciData } from '../componente-bici/componente-bici';
import { ModalComponentesComponent, ComponenteData } from '../modal-componentes/modal-componentes';
import { ModalRevisionComponent, RevisionData } from '../modal-revision/modal-revision';
import { LibroRevisionesComponent } from '../libro-revisiones/libro-revisiones';

@Component({
  selector: 'app-detalle-bici',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    ComponenteBiciComponent, 
    ModalComponentesComponent, 
    ModalRevisionComponent,
    LibroRevisionesComponent
  ],
  templateUrl: './detalle-bici.html',
  styleUrl: './detalle-bici.scss',
})
export class DetalleBiciComponent implements OnInit {
  // Inyecciones de dependencias
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);

  // Señales de estado del componente
  bici = signal<any>(null);
  cargando = signal<boolean>(true);
  mensajeKm = signal<string>('');

  // Señales para la confirmación de eliminación con número aleatorio
  numeroConfirmacion = signal<number>(0);
  numeroIngresado = signal<string>('');
  eliminandoBici = signal<boolean>(false);

  // Validador: comprueba que el número escrito coincida exactamente
  get puedeEliminarBici(): boolean {
    return this.numeroIngresado().trim() === this.numeroConfirmacion().toString();
  }

  ngOnInit() {
    // Capturamos el parámetro 'id' de la URL (ej: /bici/123456789)
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.cargarDetalleBici(id);
    } else {
      console.warn('No se ha proporcionado un ID en la ruta');
      this.cargando.set(false);
    }
  }

  // Consulta directa a Firestore para obtener la bicicleta por ID
  async cargarDetalleBici(id: string) {
    this.cargando.set(true);

    try {
      // 1. Referencia al documento en la colección 'bicicletas'
      const biciRef = doc(this.firestore, 'bicicletas', id);

      // 2. Obtenemos la instantánea del documento
      const docSnap = await getDoc(biciRef);

      // 3. Comprobamos si el documento existe en la base de datos
      if (docSnap.exists()) {
        this.bici.set({
          id: docSnap.id,
          ...docSnap.data()
        });
        console.log('🚲 Bicicleta cargada desde Firestore:', this.bici());
      } else {
        console.warn(`No se encontró ninguna bicicleta con el ID: ${id}`);
        this.bici.set(null);
      }
    } catch (error) {
      console.error('Error al obtener la bicicleta desde Firestore:', error);
      this.bici.set(null);
    } finally {
      this.cargando.set(false);
    }
  }

  // Permite actualizar los kilómetros totales de la bicicleta
  async actualizarKm(nuevoKm: string | number) {
    const km = Number(nuevoKm);
    if (isNaN(km) || km < 0) return;

    const biciActual = this.bici();
    if (biciActual) {
      this.bici.set({ ...biciActual, kmTotales: km });
      this.mensajeKm.set('¡Km actualizados con éxito!');
      console.log(`🛣️ Kilómetros totales actualizados para la bici #${biciActual.id}:`, km);

      // Sincronizamos en Firestore si tiene id
      if (biciActual.id) {
        try {
          const biciRef = doc(this.firestore, 'bicicletas', biciActual.id);
          await updateDoc(biciRef, { kmTotales: km });
        } catch (error) {
          console.error('Error al actualizar km en Firestore:', error);
        }
      }

      setTimeout(() => {
        this.mensajeKm.set('');
      }, 3000);
    }
  }

  // Registra una nueva revisión en el histórico y actualiza el odómetro si es mayor
  async onRevisionGuardada(rev: RevisionData) {
    const biciActual = this.bici();
    if (biciActual) {
      const revisionesActualizadas = [rev, ...(biciActual.revisiones || [])];
      const nuevosKm = rev.km > (biciActual.kmTotales || 0) ? rev.km : (biciActual.kmTotales || 0);

      this.bici.set({
        ...biciActual,
        kmTotales: nuevosKm,
        revisiones: revisionesActualizadas
      });

      this.mensajeKm.set('¡Revisión registrada con éxito en el histórico!');
      console.log(`🛠️ Nueva revisión registrada para la bici #${biciActual.id}:`, rev);

      // Sincronizamos en Firestore
      if (biciActual.id) {
        try {
          const biciRef = doc(this.firestore, 'bicicletas', biciActual.id);
          await updateDoc(biciRef, {
            kmTotales: nuevosKm,
            revisiones: revisionesActualizadas
          });
        } catch (error) {
          console.error('Error al guardar revisión en Firestore:', error);
        }
      }

      setTimeout(() => {
        this.mensajeKm.set('');
      }, 4000);
    }
  }

  // Añade un nuevo componente al array y lo guarda en Firestore
  async onComponenteGuardado(comp: ComponenteData) {
    const biciActual = this.bici();
    if (biciActual) {
      const componentesActualizados = [...(biciActual.componentes || []), comp];

      // Actualizamos la señal reactiva para que el acordeón se actualice al instante
      this.bici.set({
        ...biciActual,
        componentes: componentesActualizados
      });

      this.mensajeKm.set('¡Componente añadido con éxito!');
      console.log(`⚙️ Nuevo componente añadido a la bici #${biciActual.id}:`, comp);

      // Sincronizamos con el array de la base de datos Firestore
      if (biciActual.id) {
        try {
          const biciRef = doc(this.firestore, 'bicicletas', biciActual.id);
          await updateDoc(biciRef, {
            componentes: componentesActualizados
          });
          console.log('🔥 Componente subido a Firestore correctamente');
        } catch (error) {
          console.error('Error al guardar el componente en Firestore:', error);
        }
      }

      setTimeout(() => {
        this.mensajeKm.set('');
      }, 4000);
    }
  }

  // Actualiza los datos de un componente existente y lo sincroniza en Firestore
  async onComponenteActualizado(index: number, compActualizado: ComponenteBiciData) {
    const biciActual = this.bici();
    if (biciActual && biciActual.componentes) {
      const componentesActualizados = [...biciActual.componentes];
      componentesActualizados[index] = {
        ...componentesActualizados[index],
        ...compActualizado
      };

      // Actualizamos la señal reactiva
      this.bici.set({
        ...biciActual,
        componentes: componentesActualizados
      });

      this.mensajeKm.set(`¡Componente ${compActualizado.nombre} actualizado con éxito!`);
      console.log(`🔧 Componente #${index} actualizado en la bici #${biciActual.id}:`, compActualizado);

      // Sincronizamos con Firestore
      if (biciActual.id) {
        try {
          const biciRef = doc(this.firestore, 'bicicletas', biciActual.id);
          await updateDoc(biciRef, {
            componentes: componentesActualizados
          });
          console.log('🔥 Componente actualizado en Firestore con éxito');
        } catch (error) {
          console.error('Error al actualizar el componente en Firestore:', error);
        }
      }

      setTimeout(() => {
        this.mensajeKm.set('');
      }, 4000);
    }
  }

  // Elimina un componente del array de la bici y sincroniza la lista con Firestore
  async onComponenteEliminado(index: number) {
    const biciActual = this.bici();
    if (biciActual && biciActual.componentes) {
      const nombreEliminado = biciActual.componentes[index]?.nombre || 'Componente';
      const componentesActualizados = biciActual.componentes.filter((_: any, i: number) => i !== index);

      // Actualizamos la señal reactiva
      this.bici.set({
        ...biciActual,
        componentes: componentesActualizados
      });

      this.mensajeKm.set(`¡${nombreEliminado} ha sido eliminado con éxito!`);
      console.log(`🗑️ Componente #${index} (${nombreEliminado}) eliminado de la bici #${biciActual.id}`);

      // Sincronizamos con Firestore
      if (biciActual.id) {
        try {
          const biciRef = doc(this.firestore, 'bicicletas', biciActual.id);
          await updateDoc(biciRef, {
            componentes: componentesActualizados
          });
          console.log('🔥 Componente eliminado en Firestore con éxito');
        } catch (error) {
          console.error('Error al eliminar componente en Firestore:', error);
        }
      }

      setTimeout(() => {
        this.mensajeKm.set('');
      }, 4000);
    }
  }

  // Prepara el modal generando un nuevo número aleatorio
  abrirModalEliminarBici() {
    this.generarNumeroAleatorio();
  }

  // Genera un número aleatorio de 4 dígitos (entre 1000 y 9999)
  generarNumeroAleatorio() {
    const num = Math.floor(1000 + Math.random() * 9000);
    this.numeroConfirmacion.set(num);
    this.numeroIngresado.set('');
  }

  // Elimina la bicicleta en Firestore y redirige al dashboard
  async eliminarBici() {
    if (!this.puedeEliminarBici) return;

    const biciActual = this.bici();
    if (!biciActual || !biciActual.id) return;

    try {
      this.eliminandoBici.set(true);
      const biciRef = doc(this.firestore, 'bicicletas', biciActual.id);
      await deleteDoc(biciRef);
      console.log(`🗑️ Bicicleta #${biciActual.id} eliminada permanentemente de Firestore.`);

      // Cerrar el modal de Bootstrap
      const modalEl = document.getElementById('modalEliminarBici');
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

      // Redirigir al taller / dashboard
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al eliminar la bicicleta de Firestore:', error);
      alert('Hubo un error al eliminar la bicicleta en la base de datos.');
    } finally {
      this.eliminandoBici.set(false);
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}

export { DetalleBiciComponent as DetalleBici };
