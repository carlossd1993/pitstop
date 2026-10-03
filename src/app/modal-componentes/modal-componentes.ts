import { Component } from '@angular/core';

@Component({
  selector: 'app-modal-componentes',
  standalone: true,
  templateUrl: './modal-componentes.html',
  styleUrl: './modal-componentes.scss',
})
export class ModalComponentesComponent {
  // Función para capturar los datos del modal e imprimirlos por consola
  guardar(nombreTxt: string, kmTxt: string, obsTxt: string) {
    const nuevoComponente = {
      nombre: nombreTxt.trim() || 'Componente sin nombre',
      ultimaRevisionKm: Number(kmTxt) || 0,
      observaciones: obsTxt.trim() || 'Sin observaciones registradas.'
    };

    console.log('⚙️ Componente a guardar en el JSON:', nuevoComponente);
  }
}

export { ModalComponentesComponent as ModalComponentes };
