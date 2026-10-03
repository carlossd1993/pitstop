import { Component, signal, inject, Output, EventEmitter } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-modal-nueva-bici',
  standalone: true,
  templateUrl: './modal-nueva-bici.html'
})
export class ModalNuevaBiciComponent {
  private firestore = inject(Firestore);

  @Output() biciCreada = new EventEmitter<any>();

  // Señales de estado para los botones del modal
  esElectrica = signal(false);
  tipoBicicleta = signal('carretera');
  subtipoMontana = signal('doble');
  subtipoGravel = signal('con_suspension');

  // Lista de prueba para el buscador del cliente
  clientes = signal(['Juan Pérez', 'María Gómez', 'Laura Torres']);

  // Función que recibe los textos del HTML y crea la bicicleta en Firestore
  async guardar(clienteTxt: string, marcaTxt: string, modeloTxt: string, kmTxt: string, obsTxt: string) {
    // Leemos el mecánico directamente de la sesión
    const mecanico = localStorage.getItem('mecanicoNombre') || localStorage.getItem('mecanicoSesion') || 'Desconocido';
    const kmNum = Number(kmTxt) || 0;
    const tipo = this.tipoBicicleta();

    // Montamos el objeto limpio para Firestore (evitando valores undefined)
    const nuevaBici: any = {
      clienteNombre: clienteTxt.trim() || 'Cliente sin nombre',
      marca: marcaTxt.trim() || 'Marca no especificada',
      modelo: modeloTxt.trim() || 'Modelo no especificado',
      tipo: tipo,
      esElectrica: this.esElectrica(),
      kmTotales: kmNum >= 0 ? kmNum : 0,
      observaciones: obsTxt.trim(),
      mecanico: mecanico,
      revisiones: [],
      componentes: []
    };

    // Guardamos el subtipo solo según la categoría elegida
    if (tipo === 'montana') {
      nuevaBici.mtbTipo = this.subtipoMontana();
    } else if (tipo === 'gravel') {
      nuevaBici.suspension = this.subtipoGravel();
    }

    try {
      const bicisRef = collection(this.firestore, 'bicicletas');
      const docRef = await addDoc(bicisRef, nuevaBici);
      console.log('🚲 Nueva bicicleta creada en Firestore con ID:', docRef.id);

      // Emitimos el evento para que componentes padres como Dashboard se refresquen al instante
      this.biciCreada.emit({ id: docRef.id, ...nuevaBici });

      // Reiniciamos las opciones del formulario
      this.esElectrica.set(false);
      this.tipoBicicleta.set('carretera');
      this.subtipoMontana.set('doble');
      this.subtipoGravel.set('con_suspension');
    } catch (error) {
      console.error('Error al guardar la nueva bicicleta en Firestore:', error);
    }
  }
}

export { ModalNuevaBiciComponent as ModalNuevaBici };