import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contrasenia: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Credenciales introducidas:', this.loginForm.value);
    } else {
      console.log('Formulario inválido:', this.loginForm.value);
    }
  }
}
