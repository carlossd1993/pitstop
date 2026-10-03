import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ComponenteBiciComponent } from '../componente-bici/componente-bici';
import { ModalComponentesComponent } from '../modal-componentes/modal-componentes';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  bici = signal<any | null>(null);
  cargando = signal<boolean>(true);
  mensajeKm = signal<string>('');

  ngOnInit() {
    this.cargarDetalle();
  }

  async cargarDetalle() {
    const idParam = this.route.snapshot.paramMap.get('id');

    try {
      const url = this.location.prepareExternalUrl('/data/bicicletas.json');
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      const arrayBicis: any[] = Array.isArray(datos) ? datos : datos.bicicletas || [];

      const encontrada = arrayBicis.find(
        (b) => b.id?.toString() === idParam
      );
      this.bici.set(encontrada || null);
    } catch (error) {
      console.error('Error al cargar detalle de bicicleta:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Permite actualizar los kilómetros totales de la bicicleta
  actualizarKm(nuevoKm: string | number) {
    const km = Number(nuevoKm);
    if (isNaN(km) || km < 0) return;

    const biciActual = this.bici();
    if (biciActual) {
      this.bici.set({ ...biciActual, kmTotales: km });
      this.mensajeKm.set('¡Km actualizados con éxito!');
      console.log(`🛣️ Kilómetros totales actualizados para la bici #${biciActual.id}:`, km);

      setTimeout(() => {
        this.mensajeKm.set('');
      }, 3000);
    }
  }

  // Registra una nueva revisión en el histórico y actualiza el odómetro si es mayor
  onRevisionGuardada(rev: RevisionData) {
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
