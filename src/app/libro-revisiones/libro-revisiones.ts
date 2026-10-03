import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-libro-revisiones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './libro-revisiones.html',
  styleUrl: './libro-revisiones.scss',
})
export class LibroRevisionesComponent {
  @Input() bici: any | null = null;

  fechaActual: Date = new Date();

  imprimir() {
    window.print();
  }
}

export { LibroRevisionesComponent as LibroRevisiones };
