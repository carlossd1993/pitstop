import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
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

  volver() {
    this.router.navigate(['/dashboard']);
  }
}

export { DetalleBiciComponent as DetalleBici };
