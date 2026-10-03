import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';

export interface ComponenteInicial {
  nombre: string;
  ultimaRevisionKm: number;
  observaciones: string;
}

@Component({
  selector: 'app-modal-nueva-bici',
  standalone: true,
  templateUrl: './modal-nueva-bici.html'
})
export class ModalNuevaBiciComponent implements OnInit {
  // Inyección de Firebase Firestore
  private firestore = inject(Firestore);

  // Señales de estado para los controles del modal
  esElectrica = signal<boolean>(false);
  tipoBicicleta = signal<string>('carretera');
  subtipoMontana = signal<string>('doble');
  subtipoGravel = signal<string>('con_suspension');
  mecanicoSesion = signal<string>('');
  guardando = signal<boolean>(false);

  // Estado para los datos introducidos en cada componente por el usuario
  componentesDetalle = signal<Record<string, { modelo: string; obs: string }>>({});

  // Sugerencias de clientes para el autocompletado
  clientes = signal<string[]>(['Juan Pérez', 'María Gómez', 'Laura Torres']);

  // Lista dinámica de nombres de componentes requeridos según las opciones seleccionadas
  listaComponentesRequeridos = computed<string[]>(() => {
    const tipo = this.tipoBicicleta();
    const esDoble = this.subtipoMontana() === 'doble';
    const esElectrica = this.esElectrica();

    let nombres: string[] = [];

    if (tipo === 'montana') {
      // Base para Montaña
      nombres = [
        'Cubierta delantera',
        'Cubierta trasera',
        'Cadena',
        'Casete',
        'Plato',
        'Suspensión delantera'
      ];

      // Modificador Montaña Doble: Si es montaña y el subtipo es 'doble'
      if (esDoble) {
        nombres.push('Suspensión trasera');
      }
    } else {
      // Base común para Carretera y Gravel
      nombres = [
        'Cubierta delantera',
        'Cubierta trasera',
        'Cadena',
        'Casete',
        'Plato'
      ];
    }

    // Modificador E-Bike (se suma a lo anterior)
    if (esElectrica) {
      nombres.push('Mando', 'Motor', 'Batería');
    }

    return nombres;
  });

  ngOnInit() {
    const mec = localStorage.getItem('mecanicoNombre') || localStorage.getItem('mecanicoSesion') || 'Carlos';
    this.mecanicoSesion.set(mec);
    this.cargarClientes();
  }

  // Carga clientes existentes desde Firestore para autocompletado
  private async cargarClientes() {
    try {
      const bicisRef = collection(this.firestore, 'bicicletas');
      const snapshot = await getDocs(bicisRef);
      const nombresSet = new Set<string>(['Juan Pérez', 'María Gómez', 'Laura Torres']);
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data['clienteNombre']) {
          nombresSet.add(data['clienteNombre']);
        }
      });
      this.clientes.set(Array.from(nombresSet));
    } catch (error) {
      console.warn('No se pudieron precargar clientes:', error);
    }
  }

  // Obtiene el modelo ingresado para un componente
  obtenerModeloComponente(nombreComp: string): string {
    return this.componentesDetalle()[nombreComp]?.modelo || '';
  }

  // Obtiene las observaciones ingresadas para un componente
  obtenerObsComponente(nombreComp: string): string {
    return this.componentesDetalle()[nombreComp]?.obs || '';
  }

  // Actualiza el modelo de un componente individual
  actualizarModeloComponente(nombreComp: string, modelo: string) {
    const actual = { ...this.componentesDetalle() };
    const prevObs = actual[nombreComp]?.obs || '';
    actual[nombreComp] = { modelo, obs: prevObs };
    this.componentesDetalle.set(actual);
  }

  // Actualiza las observaciones de un componente individual
  actualizarObsComponente(nombreComp: string, obs: string) {
    const actual = { ...this.componentesDetalle() };
    const prevModelo = actual[nombreComp]?.modelo || '';
    actual[nombreComp] = { modelo: prevModelo, obs };
    this.componentesDetalle.set(actual);
  }

  /**
   * Generación de componentes:
   * Si el usuario escribió datos específicos, los incluye;
   * si los dejó en blanco, se crean automáticamente con el nombre estándar y 0 km.
   */
  private generarComponentes(): ComponenteInicial[] {
    const nombresRequeridos = this.listaComponentesRequeridos();
    const detalles = this.componentesDetalle();

    return nombresRequeridos.map(nombreBase => {
      const detalle = detalles[nombreBase];
      const modelo = detalle?.modelo?.trim() || '';
      const obs = detalle?.obs?.trim() || '';

      let nombreFinal = nombreBase;
      if (modelo) {
        if (modelo.toLowerCase().includes(nombreBase.toLowerCase())) {
          nombreFinal = modelo;
        } else {
          nombreFinal = `${nombreBase} ${modelo}`;
        }
      }

      return {
        nombre: nombreFinal,
        ultimaRevisionKm: 0,
        observaciones: obs
      };
    });
  }

  /**
   * Guardado directo en Firebase y cierre del modal si tiene éxito
   */
  async guardar(
    clienteTxt: string,
    marcaTxt: string,
    modeloTxt: string,
    kmTxt: string | number,
    mecanicoOrObs?: string,
    obsTxt?: string
  ) {
    let mecanico = this.mecanicoSesion() || localStorage.getItem('mecanicoNombre') || localStorage.getItem('mecanicoSesion') || 'Carlos';
    let observaciones = '';

    if (obsTxt !== undefined) {
      mecanico = mecanicoOrObs?.trim() || mecanico;
      observaciones = obsTxt.trim();
    } else {
      observaciones = mecanicoOrObs?.trim() || '';
    }

    const kmNum = Number(kmTxt) || 0;
    const tipo = this.tipoBicicleta();
    const componentes = this.generarComponentes();

    const nuevaBici: any = {
      clienteNombre: clienteTxt.trim() || 'Cliente sin nombre',
      marca: marcaTxt.trim() || 'Marca no especificada',
      modelo: modeloTxt.trim() || 'Modelo no especificado',
      tipo: tipo,
      esElectrica: this.esElectrica(),
      kmTotales: kmNum >= 0 ? kmNum : 0,
      observaciones: observaciones,
      mecanico: mecanico,
      revisiones: [],
      componentes: componentes
    };

    if (tipo === 'montana') {
      nuevaBici.mtbTipo = this.subtipoMontana();
    } else if (tipo === 'gravel') {
      nuevaBici.suspension = this.subtipoGravel();
    }

    try {
      this.guardando.set(true);
      const bicisRef = collection(this.firestore, 'bicicletas');
      const docRef = await addDoc(bicisRef, nuevaBici);
      console.log('🚲 Nueva bicicleta creada en Firestore con éxito. ID:', docRef.id, nuevaBici);

      // Si tiene éxito, cerramos el modal y reiniciamos el formulario
      this.cerrarModal();
      this.resetearFormulario();
    } catch (error) {
      console.error('Error al guardar la nueva bicicleta en Firestore:', error);
      alert('Hubo un error al guardar la bicicleta en la base de datos.');
    } finally {
      this.guardando.set(false);
    }
  }

  // Cierra programáticamente el modal de Bootstrap
  private cerrarModal() {
    const modalEl = document.getElementById('modalNuevaBici');
    if (modalEl) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap?.Modal) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance?.hide();
      } else {
        const btnCerrar = modalEl.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
        btnCerrar?.click();
      }
    }
  }

  // Reinicia los campos del formulario tras un guardado exitoso
  private resetearFormulario() {
    this.esElectrica.set(false);
    this.tipoBicicleta.set('carretera');
    this.subtipoMontana.set('doble');
    this.subtipoGravel.set('con_suspension');
    this.componentesDetalle.set({});

    const modalEl = document.getElementById('modalNuevaBici');
    if (modalEl) {
      modalEl.querySelectorAll('input[type="text"], textarea').forEach((el: any) => el.value = '');
      const kmInput = modalEl.querySelector('#kmInput') as HTMLInputElement;
      if (kmInput) kmInput.value = '0';
      const mecInput = modalEl.querySelector('#mecanicoInput') as HTMLInputElement;
      if (mecInput) mecInput.value = this.mecanicoSesion();
    }
  }
}

export { ModalNuevaBiciComponent as ModalNuevaBici };