import { Component, Input } from '@angular/core';
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
}
