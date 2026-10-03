import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-nueva-bici',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-nueva-bici.html',
  styleUrl: './modal-nueva-bici.scss',
})
export class ModalNuevaBiciComponent {
  // Estado principal del tipo de bicicleta ('carretera' | 'montana' | 'gravel')
  tipoBicicleta = signal<'carretera' | 'montana' | 'gravel'>('carretera');

  // Subtipos condicionales
  subtipoMontana = signal<'doble' | 'rigida'>('doble');
  subtipoGravel = signal<'con_suspension' | 'sin_suspension'>('sin_suspension');

  // Estado del chip E-Bike
  esElectrica = signal<boolean>(false);

  // Lista de ejemplo para el datalist de clientes
  clientes = signal<string[]>([
    'Carlos',
    'Robe Iniesta',
    'Kutxi Romero',
    'Enric Mas',
    'Txus di Fellatio',
    'Alejandro Valverde',
    'Aragorn',
    'Gandalf'
  ]);
}

export { ModalNuevaBiciComponent as ModalNuevaBici };
