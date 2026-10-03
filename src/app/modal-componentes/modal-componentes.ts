import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface ComponenteData {
  nombre: string;
  ultimaRevisionKm: number;
  duracionKm?: number;
  observaciones: string;
}

@Component({
  selector: 'app-modal-componentes',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './modal-componentes.html',
  styleUrl: './modal-componentes.scss',
})
export class ModalComponentesComponent {
  @Input() kmActualesBici: number = 0;
  @Output() componenteGuardado = new EventEmitter<ComponenteData>();

  // Función para capturar los datos del modal y emitirlos
  guardar(nombreTxt: string, kmTxt: string, duracionTxt: string, obsTxt: string) {
    const kmNum = Number(kmTxt);
    const durNum = Number(duracionTxt);

    const nuevoComponente: ComponenteData = {
      nombre: nombreTxt.trim() || 'Componente sin nombre',
      // Por defecto la última revisión son los km actuales de la bici
      ultimaRevisionKm: !isNaN(kmNum) && kmNum >= 0 ? kmNum : (this.kmActualesBici || 0),
      // Por defecto la duración en km se establece en 300 km
      duracionKm: !isNaN(durNum) && durNum > 0 ? durNum : 300,
      observaciones: obsTxt.trim() || 'Sin observaciones registradas.'
    };

    console.log('⚙️ Componente a guardar con duración:', nuevoComponente);
    this.componenteGuardado.emit(nuevoComponente);
  }
}

export { ModalComponentesComponent as ModalComponentes };
