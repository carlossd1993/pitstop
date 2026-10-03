import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Importamos las herramientas de Firestore
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMensaje: string = '';

  // Inyectamos las dependencias necesarias
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private firestore = inject(Firestore);

  constructor() {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.errorMensaje = 'Por favor, rellena todos los campos.';
      return;
    }

    const { usuario, contrasenia } = this.loginForm.value;
    
    // Apuntamos a la colección 'mecanico' de tu base de datos
    const mecanicoRef = collection(this.firestore, 'mecanico');
    
    // Filtramos buscando exactamente el usuario introducido
    const q = query(mecanicoRef, where('usuario', '==', usuario));

    try {
      // Ejecutamos la consulta a Firestore
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        this.errorMensaje = 'Usuario no encontrado.';
        return;
      }

      // Si existe, comprobamos la contraseña del primer resultado
      const docData = querySnapshot.docs[0].data();
      
      if (docData['contrasenia'] === contrasenia) {
        console.log('Login correcto. ¡Bienvenido!');
        this.errorMensaje = '';
        localStorage.setItem('mecanicoSesion', usuario);
        localStorage.setItem('mecanicoNombre', docData['nombre'] || usuario);
        localStorage.setItem('mecanicoDocId', querySnapshot.docs[0].id);
        
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMensaje = 'Contraseña incorrecta.';
      }
    } catch (error) {
      console.error("Error al conectar con Firestore:", error);
      this.errorMensaje = 'Error de conexión con la base de datos.';
    }
  }
}