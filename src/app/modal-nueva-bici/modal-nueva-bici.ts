import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-modal-nueva-bici',
  standalone: true,
  templateUrl: './modal-nueva-bici.html'
})
export class ModalNuevaBiciComponent {
  // Señales de estado para los botones del modal
  esElectrica = signal(false);
  tipoBicicleta = signal('carretera');
  subtipoMontana = signal('doble');
  subtipoGravel = signal('con_suspension');

  // Lista de prueba para el buscador del cliente
  clientes = signal(['Juan Pérez', 'María Gómez', 'Laura Torres']);

  // Función que recibe los textos del HTML y monta el objeto 
  //TODO CONEXIÓN CON LA BASE DE DATOS
  guardar(clienteTxt: string, marcaTxt: string, modeloTxt: string, obsTxt: string) {

    // Leemos el mecánico directamente de la sesión
    const mecanico = localStorage.getItem('mecanicoNombre') || localStorage.getItem('mecanicoSesion') || 'Desconocido';

    // Montamos el objeto final cruzando los textos con las señales de los botones
    const nuevaBici = {
      clienteNombre: clienteTxt,
      marca: marcaTxt,
      modelo: modeloTxt,
      tipo: this.tipoBicicleta(),
      esElectrica: this.esElectrica(),
      // Guardamos el subtipo de suspensión solo si corresponde a su categoría
      mtbTipo: this.tipoBicicleta() === 'montana' ? this.subtipoMontana() : undefined,
      suspension: this.tipoBicicleta() === 'gravel' ? this.subtipoGravel() : undefined,
      observaciones: obsTxt,
      mecanico: mecanico
    };

    // Imprimimos el resultado en la consola para verificar que todo se captura bien
    console.log('🚲 Datos capturados desde el modal:', nuevaBici);
  }
}