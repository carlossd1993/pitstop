import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ComponenteBiciData {
  nombre: string;
  ultimaRevisionKm: number;
  observaciones: string;
}

@Component({
  selector: 'app-componente-bici',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './componente-bici.html',
  styleUrl: './componente-bici.scss',
})
export class ComponenteBiciComponent {
  @Input() componente?: ComponenteBiciData;
  @Input() index: number = 0;
  @Output() componenteActualizado = new EventEmitter<ComponenteBiciData>();

  get modalId(): string {
    return `modalEditarComp_${this.index ?? 0}`;
  }

  get googleShoppingUrl(): string {
    const termino = encodeURIComponent(this.componente?.nombre || '');
    return `https://www.google.com/search?tbm=shop&q=${termino}`;
  }

  get amazonUrl(): string {
    const termino = encodeURIComponent(this.componente?.nombre || '');
    return `https://www.amazon.es/s?k=${termino}`;
  }

  guardarCambios(kmTxt: string | number, observacionesTxt: string) {
    const kmNum = Number(kmTxt);
    const datosActualizados: ComponenteBiciData = {
      nombre: this.componente?.nombre || '',
      ultimaRevisionKm: isNaN(kmNum) ? (this.componente?.ultimaRevisionKm || 0) : kmNum,
      observaciones: observacionesTxt.trim(),
    };

    console.log('🔧 Información del componente actualizada:', datosActualizados);

    // Actualizamos localmente para reflejar los cambios de inmediato
    if (this.componente) {
      this.componente.ultimaRevisionKm = datosActualizados.ultimaRevisionKm;
      this.componente.observaciones = datosActualizados.observaciones;
    }

    this.componenteActualizado.emit(datosActualizados);
  }
}

