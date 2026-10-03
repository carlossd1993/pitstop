import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  private firestore = inject(Firestore);

  // Señales de información del usuario
  nombreMecanico = signal(''); 
  usuarioMecanico = signal('');

  // Señales para el modal de cambio de contraseña
  contraseniaVieja = signal('');
  nuevaContrasenia = signal('');
  repetirNuevaContrasenia = signal('');

  // Visibilidad de contraseñas (mostrar/ocultar)
  mostrarPassVieja = signal(false);
  mostrarPassNueva = signal(false);
  mostrarPassRepetir = signal(false);

  // Estados de carga y mensajes del modal
  cargandoCambio = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');
  
  async ngOnInit() {
    const nombre = localStorage.getItem('mecanicoNombre');
    const usuario = localStorage.getItem('mecanicoSesion');

    if (usuario) {
      this.usuarioMecanico.set(usuario);
    }

    if (nombre) {
      this.nombreMecanico.set(nombre);
    } else if (usuario) {
      this.nombreMecanico.set(usuario);
      // Si no estaba en localStorage, consultamos Firestore para recuperar el nombre
      try {
        const mecanicoRef = collection(this.firestore, 'mecanico');
        const q = query(mecanicoRef, where('usuario', '==', usuario));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const nombreBd = docData['nombre'];
          if (nombreBd) {
            this.nombreMecanico.set(nombreBd);
            localStorage.setItem('mecanicoNombre', nombreBd);
          }
          localStorage.setItem('mecanicoDocId', querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error('Error al recuperar nombre del mecánico desde Firestore:', error);
      }
    }
  }

  abrirModalPassword() {
    this.limpiarFormularioPassword();
  }

  limpiarFormularioPassword() {
    this.contraseniaVieja.set('');
    this.nuevaContrasenia.set('');
    this.repetirNuevaContrasenia.set('');
    this.mostrarPassVieja.set(false);
    this.mostrarPassNueva.set(false);
    this.mostrarPassRepetir.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.cargandoCambio.set(false);
  }

  async cambiarContrasenia() {
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const vieja = this.contraseniaVieja().trim();
    const nueva = this.nuevaContrasenia().trim();
    const repetir = this.repetirNuevaContrasenia().trim();

    if (!vieja || !nueva || !repetir) {
      this.mensajeError.set('Por favor, completa todos los campos.');
      return;
    }

    if (nueva !== repetir) {
      this.mensajeError.set('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (nueva.length < 4) {
      this.mensajeError.set('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (vieja === nueva) {
      this.mensajeError.set('La nueva contraseña no puede ser idéntica a la anterior.');
      return;
    }

    const usuario = localStorage.getItem('mecanicoSesion') || this.usuarioMecanico();
    if (!usuario) {
      this.mensajeError.set('No se encontró una sesión activa.');
      return;
    }

    this.cargandoCambio.set(true);

    try {
      const mecanicoRef = collection(this.firestore, 'mecanico');
      const q = query(mecanicoRef, where('usuario', '==', usuario));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        this.mensajeError.set('No se encontró el usuario en la base de datos.');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();

      // Verificamos que la contraseña antigua coincida con la de la BD
      if (data['contrasenia'] !== vieja) {
        this.mensajeError.set('La contraseña actual es incorrecta.');
        return;
      }

      // Actualizamos la contraseña en Firestore
      const docRef = doc(this.firestore, 'mecanico', userDoc.id);
      await updateDoc(docRef, { contrasenia: nueva });

      this.mensajeExito.set('¡Contraseña actualizada con éxito!');
      // Limpiamos los campos
      this.contraseniaVieja.set('');
      this.nuevaContrasenia.set('');
      this.repetirNuevaContrasenia.set('');
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      this.mensajeError.set('Error de conexión con la base de datos al guardar.');
    } finally {
      this.cargandoCambio.set(false);
    }
  }

  onLogout() {
    localStorage.removeItem('mecanicoSesion');
    localStorage.removeItem('mecanicoNombre');
    localStorage.removeItem('mecanicoDocId');
    this.router.navigate(['/login']);
  }
}

export { NavbarComponent as Navbar };