import { Component, Output, EventEmitter } from '@angular/core';

export interface ComponenteData {
  nombre: string;
  ultimaRevisionKm: number;
  duracionKm?: number;
  observaciones: string;
}

@Component({
  selector: 'app-modal-componentes',
  standalone: true,
  templateUrl: './modal-componentes.html',
  styleUrl: './modal-componentes.scss',
})
export class ModalComponentesComponent {
  @Output() componenteGuardado = new EventEmitter<ComponenteData>();

  // Función para capturar los datos del modal y emitirlos
  guardar(nombreTxt: string, kmTxt: string, duracionTxt: string, obsTxt: string) {
    const durNum = Number(duracionTxt);
    const nuevoComponente: ComponenteData = {
      nombre: nombreTxt.trim() || 'Componente sin nombre',
      ultimaRevisionKm: Number(kmTxt) || 0,
      duracionKm: !isNaN(durNum) && durNum > 0 ? durNum : undefined,
      observaciones: obsTxt.trim() || 'Sin observaciones registradas.'
    };

    console.log('⚙️ Componente a guardar con duración:', nuevoComponente);
    this.componenteGuardado.emit(nuevoComponente);
  }
}

export { ModalComponentesComponent as ModalComponentes };
