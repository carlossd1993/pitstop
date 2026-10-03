import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
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

  mostrarToastGemini = signal<boolean>(false);
  promptGeminiActual = signal<string>('');

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

  generarPromptGemini(): string {
    const nombre = this.componente?.nombre || 'este componente de bicicleta';
    const km = this.componente?.ultimaRevisionKm ?? 0;
    return `Actúa como un experto mecánico de bicicletas. ¿Cada cuántos kilómetros o meses se recomienda hacer mantenimiento, revisión o sustitución de "${nombre}"? Actualmente tiene registrados ${km} km desde la última intervención. ¿Cuáles son los síntomas clave de desgaste y qué tareas de mantenimiento preventivo debo realizar?`;
  }

  // Prepara la consulta, la copia al portapapeles y activa el Toast (sin abrir la pestaña todavía)
  iniciarConsultaGemini() {
    const prompt = this.generarPromptGemini();
    this.promptGeminiActual.set(prompt);

    // Copiar la consulta técnica al portapapeles
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt).catch((err) => {
        console.warn('No se pudo copiar automáticamente:', err);
      });
    }

    // Mostrar el Toast de confirmación
    this.mostrarToastGemini.set(true);
  }

  // Se ejecuta solo cuando el usuario pulsa "Comprendido" en el Toast
  confirmarYAbrirGemini() {
    const prompt = this.promptGeminiActual();
    const url = `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`;

    // Cerrar el toast
    this.mostrarToastGemini.set(false);

    // Abrir Google Gemini en nueva pestaña
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  cerrarToastGemini() {
    this.mostrarToastGemini.set(false);
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

