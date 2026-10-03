import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ComponenteBiciData {
  nombre: string;
  ultimaRevisionKm: number;
  duracionKm?: number;
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
  @Input() kmActualesBici: number = 0;
  @Output() componenteActualizado = new EventEmitter<ComponenteBiciData>();
  @Output() componenteEliminado = new EventEmitter<number>();

  mostrarToastGemini = signal<boolean>(false);
  promptGeminiActual = signal<string>('');

  // Texto que el usuario escribe para confirmar la eliminación
  textoConfirmarEliminar = signal<string>('');

  get modalId(): string {
    return `modalEditarComp_${this.index ?? 0}`;
  }

  get modalEliminarId(): string {
    return `modalEliminarComp_${this.index ?? 0}`;
  }

  // Comprueba si el texto introducido coincide exactamente con 'eliminar componente'
  get puedeEliminar(): boolean {
    return this.textoConfirmarEliminar().trim().toLowerCase() === 'eliminar componente';
  }

  // Kilómetros recorridos por la bici desde la última revisión de este componente
  get kmDesdeUltimaRevision(): number {
    const kmActuales = this.kmActualesBici || 0;
    const ultimaRev = this.componente?.ultimaRevisionKm || 0;
    return Math.max(0, kmActuales - ultimaRev);
  }

  // Comprueba si se ha superado la duración establecida (señal de alarma)
  get estaEnAlarma(): boolean {
    const duracion = this.componente?.duracionKm;
    if (!duracion || duracion <= 0) return false;
    return this.kmDesdeUltimaRevision >= duracion;
  }

  // Kilómetros que superan la duración recomendada
  get kmExceso(): number {
    const duracion = this.componente?.duracionKm || 0;
    if (!this.estaEnAlarma) return 0;
    return this.kmDesdeUltimaRevision - duracion;
  }

  // Porcentaje de uso consumido de la vida útil / revisión
  get porcentajeUso(): number {
    const duracion = this.componente?.duracionKm;
    if (!duracion || duracion <= 0) return 0;
    return Math.min(100, Math.round((this.kmDesdeUltimaRevision / duracion) * 100));
  }

  get googleShoppingUrl(): string {
    const termino = encodeURIComponent(this.componente?.nombre || '');
    return `https://www.google.com/search?tbm=shop&q=${termino}`;
  }

  get amazonUrl(): string {
    const termino = encodeURIComponent(this.componente?.nombre || '');
    return `https://www.amazon.es/s?k=${termino}`;
  }

  generarPromptGemini(): string {
    const nombre = this.componente?.nombre || 'este componente de bicicleta';
    const km = this.componente?.ultimaRevisionKm ?? 0;
    return `Actúa como un experto mecánico de bicicletas. ¿Cada cuántos kilómetros o meses se recomienda hacer mantenimiento, revisión o sustitución de "${nombre}"? Actualmente tiene registrados ${km} km desde la última intervención. ¿Cuáles son los síntomas clave de desgaste y qué tareas de mantenimiento preventivo debo realizar?`;
  }

  iniciarConsultaGemini() {
    const prompt = this.generarPromptGemini();
    this.promptGeminiActual.set(prompt);

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt).catch((err) => {
        console.warn('No se pudo copiar automáticamente:', err);
      });
    }

    this.mostrarToastGemini.set(true);
  }

  confirmarYAbrirGemini() {
    const prompt = this.promptGeminiActual();
    const url = `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`;

    this.mostrarToastGemini.set(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  cerrarToastGemini() {
    this.mostrarToastGemini.set(false);
  }

  abrirModalEliminar() {
    this.textoConfirmarEliminar.set('');
  }

  confirmarEliminar() {
    if (this.puedeEliminar) {
      this.textoConfirmarEliminar.set('');
      this.componenteEliminado.emit(this.index);
    }
  }

  guardarCambios(kmTxt: string | number, duracionTxt: string | number, observacionesTxt: string) {
    const kmNum = Number(kmTxt);
    const durNum = Number(duracionTxt);
    const datosActualizados: ComponenteBiciData = {
      nombre: this.componente?.nombre || '',
      ultimaRevisionKm: !isNaN(kmNum) && kmNum >= 0 ? kmNum : (this.componente?.ultimaRevisionKm || 0),
      duracionKm: !isNaN(durNum) && durNum > 0 ? durNum : (this.componente?.duracionKm || 300),
      observaciones: observacionesTxt.trim(),
    };

    console.log('🔧 Información del componente actualizada:', datosActualizados);

    // Actualizamos localmente para reflejar los cambios de inmediato
    if (this.componente) {
      this.componente.ultimaRevisionKm = datosActualizados.ultimaRevisionKm;
      this.componente.duracionKm = datosActualizados.duracionKm;
      this.componente.observaciones = datosActualizados.observaciones;
    }

    this.componenteActualizado.emit(datosActualizados);
  }
}
